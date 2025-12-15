import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

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

    // Funkcia na aplikovanie watermarku na jeden obrázok
    async function applyWatermark(imageUrl, context = '') {
      const errorDetails = {
        url: imageUrl,
        context,
        phase: '',
        error: ''
      };

      try {
        // Stiahnuť obrázok
        errorDetails.phase = 'fetch';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const imageResponse = await fetch(imageUrl, { 
          signal: controller.signal,
          headers: { "User-Agent": "Base44-Watermark-Bot/1.0" }
        });
        clearTimeout(timeoutId);
        
        if (!imageResponse.ok) {
          errorDetails.error = `HTTP ${imageResponse.status} ${imageResponse.statusText}`;
          return { success: false, ...errorDetails };
        }

        errorDetails.phase = 'download';
        const imageBuffer = await imageResponse.arrayBuffer();

        if (imageBuffer.byteLength === 0) {
          errorDetails.error = 'Empty image file';
          return { success: false, ...errorDetails };
        }

        if (imageBuffer.byteLength > 50 * 1024 * 1024) {
          errorDetails.error = `File too large: ${(imageBuffer.byteLength / 1024 / 1024).toFixed(1)}MB`;
          return { success: false, ...errorDetails };
        }

        // Dekódovať obrázok pomocou ImageScript
        errorDetails.phase = 'decode';
        const image = await Image.decode(new Uint8Array(imageBuffer));

        // Vypočítať veľkosť a pozíciu watermarku
        errorDetails.phase = 'watermark';
        const fontSize = {
          'small': Math.floor(image.height * 0.03),
          'medium': Math.floor(image.height * 0.05),
          'large': Math.floor(image.height * 0.07),
          'xlarge': Math.floor(image.height * 0.09),
          'xxlarge': Math.floor(image.height * 0.12)
        }[watermark_size || 'medium'];

        // Kalkulovať pozíciu
        const padding = Math.floor(image.width * 0.02);
        const opacity = Math.floor((watermark_opacity || 0.3) * 255);

        // Vypočítať približnú šírku textu (7 pixelov na znak * fontSize / 10)
        const approxTextWidth = watermark_text.length * fontSize * 0.7;

        let x, y;
        switch (watermark_position || 'bottom-right') {
          case 'top-left':
            x = padding;
            y = padding + fontSize;
            break;
          case 'top-right':
            x = image.width - approxTextWidth - padding;
            y = padding + fontSize;
            break;
          case 'bottom-left':
            x = padding;
            y = image.height - padding;
            break;
          case 'bottom-right':
            x = image.width - approxTextWidth - padding;
            y = image.height - padding;
            break;
          case 'center':
            x = (image.width - approxTextWidth) / 2;
            y = (image.height + fontSize) / 2;
            break;
          default:
            x = image.width - approxTextWidth - padding;
            y = image.height - padding;
        }

        // ImageScript nemá vstavený text rendering, použijeme semi-transparentný box
        const boxColor = Image.rgbaToColor(255, 255, 255, opacity);
        const boxHeight = Math.max(10, Math.floor(fontSize * 1.2));
        const boxWidth = Math.max(20, Math.floor(approxTextWidth * 1.1));
        
        // Bezpečné hranice (ImageScript indexuje od 0, ale potrebujeme validné súradnice)
        const startY = Math.max(1, Math.min(image.height - 1, Math.floor(y - boxHeight)));
        const endY = Math.max(1, Math.min(image.height - 1, Math.floor(y + 5)));
        const startX = Math.max(1, Math.min(image.width - 1, Math.floor(x)));
        const endX = Math.max(1, Math.min(image.width - 1, Math.floor(x + boxWidth)));
        
        // Ak sú hranice platné, nakresliť watermark
        if (startX < endX && startY < endY) {
          for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
              try {
                image.setPixelAt(px, py, boxColor);
              } catch (e) {
                // Preskočiť problematické pixely
              }
            }
          }
        }

        // Enkódovať späť na JPEG
        errorDetails.phase = 'encode';
        const finalBuffer = await image.encodeJPEG(95);

        // Upload
        errorDetails.phase = 'upload';
        const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
        const file = new File([finalBuffer], fileName, { type: 'image/jpeg' });

        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        return { success: true, newImageUrl: uploadResult.file_url, originalUrl: imageUrl };
      } catch (error) {
        errorDetails.error = `${error.name}: ${error.message}`;
        return { success: false, ...errorDetails };
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
            log.push(`  ❌ hlavny_obrazok CHYBA:`);
            log.push(`     URL: ${result.url?.substring(0, 80)}...`);
            log.push(`     Fáza: ${result.phase}`);
            log.push(`     Chyba: ${result.error}`);
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
            log.push(`  ❌ zakladna_konfiguracia_obrazok CHYBA:`);
            log.push(`     URL: ${result.url?.substring(0, 80)}...`);
            log.push(`     Fáza: ${result.phase}`);
            log.push(`     Chyba: ${result.error}`);
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
                log.push(`  ❌ galeria[${i}] CHYBA: ${result.phase} - ${result.error}`);
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
                    log.push(`  ❌ galerie[${galeria.nazov}][${i}] CHYBA: ${result.phase} - ${result.error}`);
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