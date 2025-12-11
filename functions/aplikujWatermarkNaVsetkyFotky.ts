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

    // Jednoduchšie sekvenčné spracovanie - najprv to musí fungovať
    for (const dom of domy) {
      try {
        log.push(`\n📦 Spracovávam dom: ${dom.nazov} (ID: ${dom.id})`);
        processed++;

        const updates = {};

        // Aplikovať watermark na hlavný obrázok
        if (dom.hlavny_obrazok && !dom.hlavny_obrazok.includes('watermarked_')) {
          try {
            log.push(`  🖼️ hlavny_obrazok: aplikujem watermark...`);
            const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
              imageUrl: dom.hlavny_obrazok,
              watermarkText: watermark_text,
              position: watermark_position,
              opacity: watermark_opacity,
              size: watermark_size
            });

            if (response?.data?.success && response.data.newImageUrl) {
              updates.hlavny_obrazok = response.data.newImageUrl;
              migrated++;
              log.push(`  ✅ hlavny_obrazok: úspešne aplikovaný watermark`);
            } else {
              errors++;
              log.push(`  ❌ hlavny_obrazok: chyba - ${response?.data?.error || 'unknown'}`);
            }
          } catch (err) {
            errors++;
            log.push(`  ❌ hlavny_obrazok: chyba - ${err.message}`);
          }
        } else if (dom.hlavny_obrazok) {
          skipped++;
          log.push(`  ⏭️ hlavny_obrazok: už má watermark`);
        }

        // Aplikovať watermark na základnú konfiguráciu
        if (dom.zakladna_konfiguracia_obrazok && !dom.zakladna_konfiguracia_obrazok.includes('watermarked_')) {
          try {
            log.push(`  🖼️ zakladna_konfiguracia_obrazok: aplikujem watermark...`);
            const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
              imageUrl: dom.zakladna_konfiguracia_obrazok,
              watermarkText: watermark_text,
              position: watermark_position,
              opacity: watermark_opacity,
              size: watermark_size
            });

            if (response?.data?.success && response.data.newImageUrl) {
              updates.zakladna_konfiguracia_obrazok = response.data.newImageUrl;
              migrated++;
              log.push(`  ✅ zakladna_konfiguracia_obrazok: úspešne aplikovaný watermark`);
            } else {
              errors++;
              log.push(`  ❌ zakladna_konfiguracia_obrazok: chyba - ${response?.data?.error || 'unknown'}`);
            }
          } catch (err) {
            errors++;
            log.push(`  ❌ zakladna_konfiguracia_obrazok: chyba - ${err.message}`);
          }
        } else if (dom.zakladna_konfiguracia_obrazok) {
          skipped++;
          log.push(`  ⏭️ zakladna_konfiguracia_obrazok: už má watermark`);
        }

        // Aplikovať watermark na galériu
        if (dom.galeria && Array.isArray(dom.galeria) && dom.galeria.length > 0) {
          const newGaleria = [];
          for (let i = 0; i < dom.galeria.length; i++) {
            const imageUrl = dom.galeria[i];
            if (imageUrl && !imageUrl.includes('watermarked_')) {
              try {
                log.push(`  🖼️ galeria[${i}]: aplikujem watermark...`);
                const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
                  imageUrl,
                  watermarkText: watermark_text,
                  position: watermark_position,
                  opacity: watermark_opacity,
                  size: watermark_size
                });

                if (response?.data?.success && response.data.newImageUrl) {
                  newGaleria.push(response.data.newImageUrl);
                  migrated++;
                  log.push(`  ✅ galeria[${i}]: úspešne aplikovaný watermark`);
                } else {
                  newGaleria.push(imageUrl);
                  errors++;
                  log.push(`  ❌ galeria[${i}]: chyba - ${response?.data?.error || 'unknown'}`);
                }
              } catch (err) {
                newGaleria.push(imageUrl);
                errors++;
                log.push(`  ❌ galeria[${i}]: chyba - ${err.message}`);
              }
            } else {
              newGaleria.push(imageUrl);
              if (imageUrl) {
                skipped++;
                log.push(`  ⏭️ galeria[${i}]: už má watermark`);
              }
            }
          }
          if (newGaleria.length > 0) {
            updates.galeria = newGaleria;
          }
        }

        // Aplikovať watermark na pomenované galérie
        if (dom.galerie && Array.isArray(dom.galerie) && dom.galerie.length > 0) {
          const newGalerie = [];
          for (const galeria of dom.galerie) {
            const newGaleria = { ...galeria };
            if (galeria.fotky && Array.isArray(galeria.fotky) && galeria.fotky.length > 0) {
              const newFotky = [];
              for (let i = 0; i < galeria.fotky.length; i++) {
                const imageUrl = galeria.fotky[i];
                if (imageUrl && !imageUrl.includes('watermarked_')) {
                  try {
                    log.push(`  🖼️ galerie[${galeria.nazov}][${i}]: aplikujem watermark...`);
                    const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
                      imageUrl,
                      watermarkText: watermark_text,
                      position: watermark_position,
                      opacity: watermark_opacity,
                      size: watermark_size
                    });

                    if (response?.data?.success && response.data.newImageUrl) {
                      newFotky.push(response.data.newImageUrl);
                      migrated++;
                      log.push(`  ✅ galerie[${galeria.nazov}][${i}]: úspešne aplikovaný watermark`);
                    } else {
                      newFotky.push(imageUrl);
                      errors++;
                      log.push(`  ❌ galerie[${galeria.nazov}][${i}]: chyba - ${response?.data?.error || 'unknown'}`);
                    }
                  } catch (err) {
                    newFotky.push(imageUrl);
                    errors++;
                    log.push(`  ❌ galerie[${galeria.nazov}][${i}]: chyba - ${err.message}`);
                  }
                } else {
                  newFotky.push(imageUrl);
                  if (imageUrl) {
                    skipped++;
                    log.push(`  ⏭️ galerie[${galeria.nazov}][${i}]: už má watermark`);
                  }
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
            try {
              await base44.asServiceRole.entities.Dom.update(dom.id, updates);
              log.push(`  💾 Uložené ${Object.keys(updates).length} aktualizácií`);
            } catch (err) {
              errors++;
              log.push(`  ❌ Chyba pri ukladaní: ${err.message}`);
            }
          } else {
            log.push(`  🧪 TEST MODE: Našiel som ${Object.keys(updates).length} aktualizácií (neukladám)`);
          }
        } else {
          log.push(`  ℹ️ Žiadne zmeny pre tento dom`);
        }
      } catch (err) {
        errors++;
        log.push(`  ❌ Kritická chyba pre dom ${dom.nazov}: ${err.message}`);
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