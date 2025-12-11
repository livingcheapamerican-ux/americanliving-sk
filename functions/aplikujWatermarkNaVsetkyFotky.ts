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

    // Načítať všetky domy
    const domy = await base44.asServiceRole.entities.Dom.list();

    const log = [];
    let processed = 0;
    let migrated = 0;
    let errors = 0;
    let skipped = 0;

    log.push(`🚀 Začínam batch aplikáciu watermarku na fotky domov...`);
    log.push(`📊 Našiel som ${domy.length} domov`);
    log.push(`⚙️ Režim: ${testMode ? 'TEST (bez uloženia)' : 'LIVE (uloží zmeny)'}`);
    log.push('');

    for (const dom of domy) {
      log.push(`\n📦 Spracovávam dom: ${dom.nazov} (ID: ${dom.id})`);
      processed++;

      const updates = {};
      let domMigrated = false;

      // Pomocná funkcia na aplikovanie watermarku
      const applyWatermark = async (imageUrl, fieldName) => {
        if (!imageUrl) return null;
        
        // Skip ak už je watermarkovaný (obsahuje "watermarked_" v URL)
        if (imageUrl.includes('watermarked_')) {
          log.push(`  ⏭️ ${fieldName}: už má watermark, preskakujem`);
          skipped++;
          return imageUrl;
        }

        try {
          log.push(`  🖼️ ${fieldName}: aplikujem watermark...`);
          
          const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
            imageUrl,
            watermarkText: watermark_text,
            position: watermark_position,
            opacity: watermark_opacity,
            size: watermark_size
          });

          if (response.data?.success) {
            migrated++;
            domMigrated = true;
            log.push(`  ✅ ${fieldName}: úspešne aplikovaný watermark`);
            return response.data.newImageUrl;
          } else {
            errors++;
            log.push(`  ❌ ${fieldName}: chyba - ${response.data?.error || 'unknown'}`);
            return imageUrl;
          }
        } catch (err) {
          errors++;
          log.push(`  ❌ ${fieldName}: chyba - ${err.message}`);
          return imageUrl;
        }
      };

      // Aplikovať watermark na hlavný obrázok
      if (dom.hlavny_obrazok) {
        const newUrl = await applyWatermark(dom.hlavny_obrazok, 'hlavny_obrazok');
        if (newUrl !== dom.hlavny_obrazok) {
          updates.hlavny_obrazok = newUrl;
        }
      }

      // Aplikovať watermark na základnú konfiguráciu
      if (dom.zakladna_konfiguracia_obrazok) {
        const newUrl = await applyWatermark(dom.zakladna_konfiguracia_obrazok, 'zakladna_konfiguracia_obrazok');
        if (newUrl !== dom.zakladna_konfiguracia_obrazok) {
          updates.zakladna_konfiguracia_obrazok = newUrl;
        }
      }

      // Aplikovať watermark na galériu
      if (dom.galeria && dom.galeria.length > 0) {
        const newGaleria = [];
        for (let i = 0; i < dom.galeria.length; i++) {
          const imageUrl = dom.galeria[i];
          const newUrl = await applyWatermark(imageUrl, `galeria[${i}]`);
          newGaleria.push(newUrl);
        }
        if (JSON.stringify(newGaleria) !== JSON.stringify(dom.galeria)) {
          updates.galeria = newGaleria;
        }
      }

      // Aplikovať watermark na pomenované galérie
      if (dom.galerie && dom.galerie.length > 0) {
        const newGalerie = [];
        for (const galeria of dom.galerie) {
          if (galeria.fotky && galeria.fotky.length > 0) {
            const newFotky = [];
            for (let i = 0; i < galeria.fotky.length; i++) {
              const imageUrl = galeria.fotky[i];
              const newUrl = await applyWatermark(imageUrl, `galerie[${galeria.nazov}][${i}]`);
              newFotky.push(newUrl);
            }
            newGalerie.push({ ...galeria, fotky: newFotky });
          } else {
            newGalerie.push(galeria);
          }
        }
        if (JSON.stringify(newGalerie) !== JSON.stringify(dom.galerie)) {
          updates.galerie = newGalerie;
        }
      }

      // Uložiť zmeny
      if (Object.keys(updates).length > 0) {
        if (!testMode) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updates);
          log.push(`  💾 Uložené ${Object.keys(updates).length} aktualizácií`);
        } else {
          log.push(`  🧪 TEST MODE: Našiel som ${Object.keys(updates).length} aktualizácií (neukladám)`);
        }
      } else {
        log.push(`  ℹ️ Žiadne zmeny pre tento dom`);
      }
    }

    log.push('\n' + '='.repeat(50));
    log.push(`✅ HOTOVO`);
    log.push(`📊 Spracovaných domov: ${processed}`);
    log.push(`🖼️ Aplikovaných watermarkov: ${migrated}`);
    log.push(`⏭️ Preskočených: ${skipped}`);
    log.push(`❌ Chýb: ${errors}`);

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