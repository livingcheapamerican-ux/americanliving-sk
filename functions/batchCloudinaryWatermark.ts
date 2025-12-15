import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testMode = true } = await req.json();

    // Get settings
    const settings = await base44.asServiceRole.entities.SiteSettings.list();
    const watermarkSettings = settings.find(s => s.klic === 'watermark_settings');
    
    if (!watermarkSettings) {
      return Response.json({ error: 'Settings not found' }, { status: 404 });
    }

    const { watermark_text, watermark_position, watermark_opacity, watermark_size } = watermarkSettings;

    // Get only PUBLIC houses (verejny === true or undefined)
    const allDomy = await base44.asServiceRole.entities.Dom.list('poradie', 200);
    const filteredDomy = allDomy.filter(d => 
      (d.vyrobca === 'Ticab house' || d.vyrobca === 'Prosto House') && 
      (d.verejny === true || d.verejny === undefined)
    );
    const domy = testMode ? filteredDomy.slice(0, 3) : filteredDomy;

    const log = [];
    let processed = 0;
    let migrated = 0;
    let errors = 0;
    let skipped = 0;

    log.push(`🚀 Canvas watermark batch (PUBLIC houses only)`);
    log.push(`📊 Houses: ${domy.length}`);
    log.push(`⚙️ Mode: ${testMode ? 'TEST (no save)' : 'LIVE (saves to DB)'}`);
    log.push('');

    // Apply watermark inline (copied from aplikujWatermarkNaFotku)
    async function applyWatermark(imageUrl, context = '') {
      try {
        if (!imageUrl || imageUrl.includes('watermarked_')) {
          return { success: false, url: imageUrl, skipped: true };
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return { success: false, url: imageUrl, error: `HTTP ${imageResponse.status}` };
        }

        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();

        if (imageBuffer.byteLength === 0) {
          return { success: false, url: imageUrl, error: 'Empty image' };
        }

        const imageBitmap = await createImageBitmap(new Blob([imageBuffer]));
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);

        const fontSize = {
          'small': imageBitmap.height * 0.03,
          'medium': imageBitmap.height * 0.05,
          'large': imageBitmap.height * 0.07,
          'xlarge': imageBitmap.height * 0.09,
          'xxlarge': imageBitmap.height * 0.12
        }[watermark_size || 'medium'];

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${watermark_opacity || 0.3})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${(watermark_opacity || 0.3) * 0.5})`;
        ctx.lineWidth = 2;

        const textMetrics = ctx.measureText(watermark_text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        const padding = imageBitmap.width * 0.02;

        let x, y;
        switch (watermark_position || 'bottom-right') {
          case 'top-left':
            x = padding; y = padding + textHeight; break;
          case 'top-right':
            x = imageBitmap.width - textWidth - padding; y = padding + textHeight; break;
          case 'bottom-left':
            x = padding; y = imageBitmap.height - padding; break;
          case 'bottom-right':
            x = imageBitmap.width - textWidth - padding; y = imageBitmap.height - padding; break;
          case 'center':
            x = (imageBitmap.width - textWidth) / 2; y = (imageBitmap.height + textHeight) / 2; break;
          default:
            x = imageBitmap.width - textWidth - padding; y = imageBitmap.height - padding;
        }

        ctx.strokeText(watermark_text, x, y);
        ctx.fillText(watermark_text, x, y);

        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
        const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        return { success: true, newImageUrl: uploadResult.file_url, originalUrl: imageUrl };
      } catch (error) {
        return { success: false, url: imageUrl, error: error.message };
      }
    }

    for (const dom of domy) {
      log.push(`\n📦 ${dom.nazov} (ID: ${dom.id})`);
      processed++;
      const updates = {};

      // 1. Main image
      if (dom.hlavny_obrazok) {
        const result = await applyWatermark(dom.hlavny_obrazok, `${dom.nazov} | hlavny_obrazok`);
        if (result.success) {
          updates.hlavny_obrazok = result.newImageUrl;
          migrated++;
          log.push(`  ✅ hlavny_obrazok`);
        } else if (result.skipped) {
          skipped++;
          log.push(`  ⏭️ hlavny_obrazok: already watermarked`);
        } else {
          errors++;
          log.push(`  ❌ hlavny_obrazok: ${result.error?.substring(0, 50)}`);
        }
      }

      // 2. Base configuration image
      if (dom.zakladna_konfiguracia_obrazok) {
        const result = await applyWatermark(dom.zakladna_konfiguracia_obrazok, `${dom.nazov} | zakladna_konfiguracia`);
        if (result.success) {
          updates.zakladna_konfiguracia_obrazok = result.newImageUrl;
          migrated++;
          log.push(`  ✅ zakladna_konfiguracia_obrazok`);
        } else if (result.skipped) {
          skipped++;
        } else {
          errors++;
          log.push(`  ❌ zakladna_konfiguracia_obrazok: skip`);
        }
      }

      // 3. Gallery
      if (dom.galeria && Array.isArray(dom.galeria) && dom.galeria.length > 0) {
        const newGaleria = [];
        const limit = testMode ? Math.min(2, dom.galeria.length) : dom.galeria.length;
        for (let i = 0; i < limit; i++) {
          const result = await applyWatermark(dom.galeria[i], `${dom.nazov} | galeria[${i}]`);
          if (result.success) {
            newGaleria.push(result.newImageUrl);
            migrated++;
            log.push(`  ✅ galeria[${i}]`);
          } else {
            newGaleria.push(dom.galeria[i]);
            if (!result.skipped) errors++;
            else skipped++;
          }
        }
        if (newGaleria.length > 0) {
          updates.galeria = newGaleria;
        }
      }

      // 4. Named galleries
      if (dom.galerie && Array.isArray(dom.galerie) && dom.galerie.length > 0) {
        const newGalerie = [];
        for (const galeria of dom.galerie) {
          const newGaleria = { ...galeria };
          if (galeria.fotky && Array.isArray(galeria.fotky) && galeria.fotky.length > 0) {
            const newFotky = [];
            const limit = testMode ? Math.min(2, galeria.fotky.length) : galeria.fotky.length;
            for (let i = 0; i < limit; i++) {
              const result = await applyWatermark(galeria.fotky[i], `${dom.nazov} | ${galeria.nazov}[${i}]`);
              if (result.success) {
                newFotky.push(result.newImageUrl);
                migrated++;
                log.push(`  ✅ galerie[${galeria.nazov}][${i}]`);
              } else {
                newFotky.push(galeria.fotky[i]);
                if (!result.skipped) errors++;
                else skipped++;
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

      // Save updates
      if (Object.keys(updates).length > 0) {
        if (!testMode) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updates);
          log.push(`  💾 Saved ${Object.keys(updates).length} fields`);
        } else {
          log.push(`  🧪 TEST: ${Object.keys(updates).length} fields (not saved)`);
        }
      } else {
        log.push(`  ℹ️ No changes`);
      }
    }

    log.push('\n' + '='.repeat(50));
    log.push(`✅ DONE`);
    log.push(`📊 Processed: ${processed}`);
    log.push(`🖼️ Migrated: ${migrated}`);
    log.push(`⏭️ Skipped: ${skipped}`);
    log.push(`❌ Errors: ${errors}`);

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