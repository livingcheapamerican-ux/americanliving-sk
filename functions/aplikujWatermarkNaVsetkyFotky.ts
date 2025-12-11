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

    // Pomocná funkcia na aplikovanie watermarku
    const applyWatermark = async (imageUrl, fieldName, domId) => {
      if (!imageUrl) return { url: null, fieldName, domId, skipped: true };
      
      // Skip ak už je watermarkovaný (obsahuje "watermarked_" v URL)
      if (imageUrl.includes('watermarked_')) {
        return { url: imageUrl, fieldName, domId, skipped: true };
      }

      try {
        const response = await base44.asServiceRole.functions.invoke('aplikujWatermarkNaFotku', {
          imageUrl,
          watermarkText: watermark_text,
          position: watermark_position,
          opacity: watermark_opacity,
          size: watermark_size
        });

        const data = response?.data || response;
        
        if (data?.success && data?.newImageUrl) {
          return { url: data.newImageUrl, fieldName, domId, success: true };
        } else {
          return { url: imageUrl, fieldName, domId, error: data?.error || 'unknown error' };
        }
      } catch (err) {
        return { url: imageUrl, fieldName, domId, error: err.message };
      }
    };

    // Spracovať domy v dávkach po 3 naraz (paralelne)
    const BATCH_SIZE = 3;
    for (let i = 0; i < domy.length; i += BATCH_SIZE) {
      const batch = domy.slice(i, Math.min(i + BATCH_SIZE, domy.length));
      
      // Spracovať každú dávku paralelne
      await Promise.allSettled(batch.map(async (dom) => {
        log.push(`\n📦 Spracovávam dom: ${dom.nazov} (ID: ${dom.id})`);
        processed++;

        const updates = {};
        const promises = [];

        // Zbierať všetky obrázky na spracovanie
        if (dom.hlavny_obrazok) {
          promises.push(applyWatermark(dom.hlavny_obrazok, 'hlavny_obrazok', dom.id));
        }

        if (dom.zakladna_konfiguracia_obrazok) {
          promises.push(applyWatermark(dom.zakladna_konfiguracia_obrazok, 'zakladna_konfiguracia_obrazok', dom.id));
        }

        if (dom.galeria && dom.galeria.length > 0) {
          for (let j = 0; j < dom.galeria.length; j++) {
            promises.push(applyWatermark(dom.galeria[j], `galeria[${j}]`, dom.id));
          }
        }

        if (dom.galerie && dom.galerie.length > 0) {
          for (const galeria of dom.galerie) {
            if (galeria.fotky && galeria.fotky.length > 0) {
              for (let j = 0; j < galeria.fotky.length; j++) {
                promises.push(applyWatermark(galeria.fotky[j], `galerie[${galeria.nazov}][${j}]`, dom.id));
              }
            }
          }
        }

        // Spracovať všetky obrázky paralelne
        const results = await Promise.allSettled(promises);

        // Zostaviť updates z výsledkov
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.success) {
            const { url, fieldName } = result.value;
            
            if (fieldName === 'hlavny_obrazok') {
              updates.hlavny_obrazok = url;
            } else if (fieldName === 'zakladna_konfiguracia_obrazok') {
              updates.zakladna_konfiguracia_obrazok = url;
            } else if (fieldName.startsWith('galeria[') && !fieldName.includes('galerie[')) {
              if (!updates.galeria) updates.galeria = [...dom.galeria];
              const index = parseInt(fieldName.match(/\[(\d+)\]/)[1]);
              updates.galeria[index] = url;
            } else if (fieldName.startsWith('galerie[')) {
              if (!updates.galerie) updates.galerie = JSON.parse(JSON.stringify(dom.galerie));
              const match = fieldName.match(/galerie\[([^\]]+)\]\[(\d+)\]/);
              const galeriaName = match[1];
              const index = parseInt(match[2]);
              const galeriaIndex = updates.galerie.findIndex(g => g.nazov === galeriaName);
              if (galeriaIndex >= 0) {
                updates.galerie[galeriaIndex].fotky[index] = url;
              }
            }
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
      }));
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