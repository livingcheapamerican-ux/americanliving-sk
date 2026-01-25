import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const report = {
      dom_processed: 0,
      dom_failed: 0,
      referencia_processed: 0,
      referencia_failed: 0,
      fotka_processed: 0,
      fotka_failed: 0,
      total_images_optimized: 0,
      errors: []
    };

    // Spracuj posledných 5 Dom (menšia dávka)
    console.log('Processing last 5 Dom records...');
    const domRecords = await base44.asServiceRole.entities.Dom.list('-updated_date', 5);
    let lastDomImages = {};
    
    for (const dom of domRecords) {
      try {
        const imageUrls = [];
        if (dom.hlavny_obrazok) imageUrls.push(dom.hlavny_obrazok);
        if (dom.zakladna_konfiguracia_obrazok) imageUrls.push(dom.zakladna_konfiguracia_obrazok);
        if (dom.podorys_2d) imageUrls.push(dom.podorys_2d);
        if (dom.podorys_3d) imageUrls.push(dom.podorys_3d);
        if (Array.isArray(dom.galeria)) imageUrls.push(...dom.galeria.filter(u => u));

        // VYNÚTENÝ ZÁPIS: Inicializuj ako prázdny objekt ak je null
        const seoMap = dom.images_seo_map || {};
        let updated = false;

        for (const imageUrl of imageUrls) {
          if (!imageUrl || !imageUrl.trim()) continue;

          try {
            console.log(`Analyzing Dom image: ${imageUrl}`);

            const aiResponse = await base44.integrations.Core.InvokeLLM({
              prompt: `Stručne popíš tento obrázok pre SEO atribút alt. Použi slovenčinu a relevantné kľúčové slová ako: montovaný dom, drevostavba, modulárny dom, ${dom.typ_domu}, interiér, exteriér, terasa, balkón. Maximálne 1 veta, 80-120 znakov.`,
              file_urls: [imageUrl],
              response_json_schema: {
                type: 'object',
                properties: {
                  alt_text: { type: 'string' }
                }
              }
            });

            const altText = (aiResponse.alt_text || '').substring(0, 160);
            seoMap[imageUrl] = altText;
            updated = true;
            
            report.total_images_optimized++;
            console.log(`✅ Dom image optimized: ${altText}`);

          } catch (imgError) {
            console.error(`Image error for ${imageUrl}:`, imgError.message);
            report.errors.push(`Dom ${dom.nazov} image: ${imgError.message}`);
          }
        }

        // VYNÚTENÝ ZÁPIS: Ulož VŽDY, aj ak je mapa prázdna
        await base44.asServiceRole.entities.Dom.update(dom.id, {
          images_seo_map: seoMap
        });
        
        // Ulož posledný dom pre výpis logu
        lastDomImages = { dom_id: dom.id, dom_name: dom.nazov, images_seo_map: seoMap };

        report.dom_processed++;
        console.log(`✅ Dom updated: ${dom.nazov} with ${Object.keys(seoMap).length} images`);
      } catch (error) {
        report.dom_failed++;
        console.error(`Dom error: ${error.message}`);
        report.errors.push(`Dom ${dom.nazov}: ${error.message}`);
      }
    }

    // Spracuj posledných 20 Referencia
    console.log('Processing last 20 Referencia records...');
    const referenciaRecords = await base44.asServiceRole.entities.Referencia.list('-updated_date', 20);
    
    for (const ref of referenciaRecords) {
      try {
        const imageUrls = Array.isArray(ref.obrazky) ? ref.obrazky.filter(u => u) : [];
        const seoMap = ref.images_seo_map || {};
        let updated = false;

        for (const imageUrl of imageUrls) {
          if (!imageUrl.trim()) continue;

          try {
            console.log(`Analyzing Referencia image: ${imageUrl}`);

            const aiResponse = await base44.integrations.Core.InvokeLLM({
              prompt: `Stručne popíš tento obrázok domu pre SEO atribút alt. Použi slovenčinu a relevantné kľúčové slová ako: montovaný dom, realizácia, stavba, ${ref.lokacia}, interiér, exteriér. Maximálne 1 veta, 80-120 znakov.`,
              file_urls: [imageUrl],
              response_json_schema: {
                type: 'object',
                properties: {
                  alt_text: { type: 'string' }
                }
              }
            });

            const altText = (aiResponse.alt_text || '').substring(0, 160);
            seoMap[imageUrl] = altText;
            updated = true;

            report.total_images_optimized++;
            console.log(`✅ Referencia image optimized: ${altText}`);

          } catch (imgError) {
            report.errors.push(`Referencia ${ref.meno_klienta} image: ${imgError.message}`);
          }
        }

        // Ulož updatovanú SEO mapu do databázy
        if (updated) {
          await base44.asServiceRole.entities.Referencia.update(ref.id, {
            images_seo_map: seoMap
          });
        }

        report.referencia_processed++;
      } catch (error) {
        report.referencia_failed++;
        report.errors.push(`Referencia ${ref.meno_klienta}: ${error.message}`);
      }
    }

    // Spracuj posledných 20 Fotka
    console.log('Processing last 20 Fotka records...');
    const fotkaRecords = await base44.asServiceRole.entities.Fotka.list('-updated_date', 20);
    
    for (const fotka of fotkaRecords) {
      try {
        if (!fotka.url.trim()) continue;

        console.log(`Analyzing Fotka: ${fotka.url}`);

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Stručne popíš tento obrázok domu pre SEO atribút alt. Použi slovenčinu a relevantné kľúčové slová. Maximálne 1 veta, 80-120 znakov.`,
          file_urls: [fotka.url],
          response_json_schema: {
            type: 'object',
            properties: {
              alt_text: { type: 'string' }
            }
          }
        });

        const altText = (aiResponse.alt_text || '').substring(0, 160);
        
        // Ulož alt text ako popis
        await base44.asServiceRole.entities.Fotka.update(fotka.id, {
          popis: altText
        });

        report.total_images_optimized++;
        report.fotka_processed++;
        console.log(`✅ Fotka optimized: ${altText}`);

      } catch (error) {
        report.fotka_failed++;
        report.errors.push(`Fotka ${fotka.nazov}: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      report: {
        ...report,
        timestamp: new Date().toISOString(),
        total_records_processed: report.dom_processed + report.referencia_processed + report.fotka_processed
      },
      lastDomProcessed: lastDomImages
    });

  } catch (error) {
    console.error('Batch image optimization error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});