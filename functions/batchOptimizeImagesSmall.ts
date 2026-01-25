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
      total_images_optimized: 0,
      errors: [],
      domains_skipped: []
    };

    // Spracuj posledných 3 Dom v malej dávke
    console.log('Processing Dom records in micro-batch (limit 3)...');
    const domRecords = await base44.asServiceRole.entities.Dom.list('-updated_date', 3);
    let lastDomImages = {};
    
    for (const dom of domRecords) {
      try {
        const imageUrls = [];
        if (dom.hlavny_obrazok) imageUrls.push(dom.hlavny_obrazok);
        if (dom.zakladna_konfiguracia_obrazok) imageUrls.push(dom.zakladna_konfiguracia_obrazok);
        if (dom.podorys_2d) imageUrls.push(dom.podorys_2d);
        if (dom.podorys_3d) imageUrls.push(dom.podorys_3d);
        if (Array.isArray(dom.galeria)) imageUrls.push(...dom.galeria.filter(u => u));

        // Filtruj iba base44.app URLs
        const validUrls = imageUrls.filter(url => {
          if (!url || !url.trim()) return false;
          if (!url.includes('base44.app')) {
            report.domains_skipped.push(url.substring(0, 80));
            return false;
          }
          return true;
        });

        const seoMap = dom.images_seo_map || {};
        let updated = false;

        for (const imageUrl of validUrls) {
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

        // VYNÚTENÝ ZÁPIS: Ulož VŽDY
        await base44.asServiceRole.entities.Dom.update(dom.id, {
          images_seo_map: seoMap
        });
        
        lastDomImages = { dom_id: dom.id, dom_name: dom.nazov, images_seo_map: seoMap };

        report.dom_processed++;
        console.log(`✅ Dom updated: ${dom.nazov} with ${Object.keys(seoMap).length} images`);
      } catch (error) {
        report.dom_failed++;
        console.error(`Dom error: ${error.message}`);
        report.errors.push(`Dom ${dom.nazov}: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      report: {
        ...report,
        timestamp: new Date().toISOString(),
        total_records_processed: report.dom_processed
      },
      lastDomProcessed: lastDomImages,
      message: `Processed ${report.dom_processed} Dom records. Run this function multiple times to process remaining houses.`
    });

  } catch (error) {
    console.error('Batch image optimization error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});