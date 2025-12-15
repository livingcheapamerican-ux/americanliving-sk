import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testMode = true } = await req.json();

    // Načítať nastavenia watermarku
    const settings = await base44.asServiceRole.entities.SiteSettings.list();
    const watermarkSettings = settings.find(s => s.klic === 'watermark_settings');

    if (!watermarkSettings) {
      return Response.json({ error: 'Watermark settings not found' }, { status: 404 });
    }

    const { watermark_text, watermark_position, watermark_opacity, watermark_size } = watermarkSettings;

    // Načítať domy
    const allDomy = await base44.asServiceRole.entities.Dom.list('poradie', 200);
    // Filtrovať len Ticab house a Prosto House
    const filteredDomy = allDomy.filter(d => d.vyrobca === 'Ticab house' || d.vyrobca === 'Prosto House');
    const domy = testMode ? filteredDomy.slice(0, 6) : filteredDomy;

    const log = [];
    let processed = 0;
    let migrated = 0;
    let errors = 0;
    let skipped = 0;

    log.push(`🚀 Začínam batch aplikáciu watermarku na fotky domov...`);
    log.push(`📊 Celkom domov: ${allDomy.length}, po filtrovaní (Ticab house + Prosto House): ${domy.length}`);
    log.push(`⚙️ Režim: ${testMode ? 'TEST (bez uloženia)' : 'LIVE (uloží zmeny)'}`);
    log.push('');

    // Použijeme existujúcu funkčnú funkciu aplikujWatermarkNaFotku
    async function applyWatermark(imageUrl, context = '') {
      try {
        const result = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
          imageUrl,
          watermarkText: watermark_text,
          position: watermark_position,
          opacity: watermark_opacity,
          size: watermark_size
        });

        if (result.data?.success) {
          return { success: true, newImageUrl: result.data.newImageUrl, originalUrl: imageUrl };
        } else {
          return { 
            success: false, 
            url: imageUrl, 
            context, 
            phase: 'watermark', 
            error: result.data?.error || 'Unknown error' 
          };
        }
      } catch (error) {
        return { 
          success: false, 
          url: imageUrl, 
          context, 
          phase: 'function_call', 
          error: `${error.name}: ${error.message}` 
        };
      }
    }

    // Spracovať domy
    for (const dom of domy) {
      try {
        log.push(`\n📦 Spracovávam dom: ${dom.nazov} (ID: ${dom.id})`);
        processed++;

        const updates = {};

        // Hlavný obrázok
        if (dom.hlavny_obrazok && typeof dom.hlavny_obrazok === 'string' && dom.hlavny_obrazok.trim() && !dom.hlavny_obrazok.includes('watermarked_')) {
          const result = await applyWatermark(dom.hlavny_obrazok, `Dom: ${dom.nazov} | Hlavný obrázok`);
          if (result.success) {
            updates.hlavny_obrazok = result.newImageUrl;
            migrated++;
            log.push(`  ✅ hlavny_obrazok: úspešne`);
          } else {
            errors++;
            log.push(`  ⏭️ hlavny_obrazok: skip (${result.error?.substring(0, 50)})`);
          }
        } else if (dom.hlavny_obrazok?.includes('watermarked_')) {
          skipped++;
          log.push(`  ⏭️ hlavny_obrazok: už má watermark`);
        }

        // Základná konfigurácia
        if (dom.zakladna_konfiguracia_obrazok && typeof dom.zakladna_konfiguracia_obrazok === 'string' && dom.zakladna_konfiguracia_obrazok.trim() && !dom.zakladna_konfiguracia_obrazok.includes('watermarked_')) {
          const result = await applyWatermark(dom.zakladna_konfiguracia_obrazok, `Dom: ${dom.nazov} | Základná konfigurácia`);
          if (result.success) {
            updates.zakladna_konfiguracia_obrazok = result.newImageUrl;
            migrated++;
            log.push(`  ✅ zakladna_konfiguracia_obrazok: úspešne`);
          } else {
            errors++;
            log.push(`  ⏭️ zakladna_konfiguracia_obrazok: skip`);
          }
        } else if (dom.zakladna_konfiguracia_obrazok?.includes('watermarked_')) {
          skipped++;
          log.push(`  ⏭️ zakladna_konfiguracia_obrazok: už má watermark`);
        }

        // Galéria
        if (dom.galeria && Array.isArray(dom.galeria) && dom.galeria.length > 0) {
          const newGaleria = [];
          for (let i = 0; i < dom.galeria.length; i++) {
            const imageUrl = dom.galeria[i];
            if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() && !imageUrl.includes('watermarked_')) {
              const result = await applyWatermark(imageUrl, `Dom: ${dom.nazov} | Galéria[${i}]`);
              if (result.success) {
                newGaleria.push(result.newImageUrl);
                migrated++;
                log.push(`  ✅ galeria[${i}]: úspešne`);
              } else {
                newGaleria.push(imageUrl);
                errors++;
              }
            } else {
              newGaleria.push(imageUrl);
              if (imageUrl) skipped++;
            }
          }
          if (newGaleria.length > 0) {
            updates.galeria = newGaleria;
          }
        }

        // Pomenované galérie
        if (dom.galerie && Array.isArray(dom.galerie) && dom.galerie.length > 0) {
          const newGalerie = [];
          for (const galeria of dom.galerie) {
            const newGaleria = { ...galeria };
            if (galeria.fotky && Array.isArray(galeria.fotky) && galeria.fotky.length > 0) {
              const newFotky = [];
              for (let i = 0; i < galeria.fotky.length; i++) {
                const imageUrl = galeria.fotky[i];
                if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() && !imageUrl.includes('watermarked_')) {
                  const result = await applyWatermark(imageUrl, `Dom: ${dom.nazov} | ${galeria.nazov}[${i}]`);
                  if (result.success) {
                    newFotky.push(result.newImageUrl);
                    migrated++;
                    log.push(`  ✅ galerie[${galeria.nazov}][${i}]: úspešne`);
                  } else {
                    newFotky.push(imageUrl);
                    errors++;
                  }
                } else {
                  newFotky.push(imageUrl);
                  if (imageUrl) skipped++;
                }
              }
              newGaleria.fotky = newFotky;
            }
            newGalerie.push(newGaleria);
          }
          if (newGalerie.length > 0) {
            updates.galerie = newGalerie;
          }
        }

        // Uložiť zmeny
        if (Object.keys(updates).length > 0) {
          if (!testMode) {
            await base44.asServiceRole.entities.Dom.update(dom.id, updates);
            log.push(`  💾 Uložené ${Object.keys(updates).length} aktualizácií`);
          } else {
            log.push(`  🧪 TEST MODE: ${Object.keys(updates).length} aktualizácií (neukladám)`);
          }
        } else {
          log.push(`  ℹ️ Žiadne zmeny`);
        }
      } catch (err) {
        errors++;
        log.push(`  ❌ Chyba: ${err.message}`);
      }
    }

    log.push('\n' + '='.repeat(50));
    log.push(`✅ HOTOVO`);
    log.push(`📊 Spracovaných: ${processed}`);
    log.push(`🖼️ Watermarky: ${migrated}`);
    log.push(`⏭️ Preskočené: ${skipped}`);
    log.push(`❌ Chyby: ${errors}`);

    return Response.json({
      success: true,
      testMode,
      results: { processed, migrated, skipped, errors },
      log
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});