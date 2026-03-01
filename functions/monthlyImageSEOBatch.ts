import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📸 Starting Monthly Image SEO Batch Process...');

    // Process Domy - only those without images_seo_map
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domyNeedingSEO = allDomy.filter(dom => 
      !dom.images_seo_map || Object.keys(dom.images_seo_map).length === 0
    ).slice(0, 10); // Max 10 per run

    // Process Referencie - only those without images_seo_map
    const allReferencie = await base44.asServiceRole.entities.Referencia.list();
    const referencieNeedingSEO = allReferencie.filter(ref =>
      !ref.images_seo_map || Object.keys(ref.images_seo_map).length === 0
    ).slice(0, 5); // Max 5 per run

    console.log(`Found ${domyNeedingSEO.length} Domy and ${referencieNeedingSEO.length} Referencie needing image SEO`);

    let processed = 0;
    let failed = 0;

    // Process Domy
    for (const dom of domyNeedingSEO) {
      try {
        const response = await base44.asServiceRole.functions.invoke('optimizeImageSEO', {
          event: { type: 'update', entity_name: 'Dom', entity_id: dom.id },
          data: dom
        });
        if (response.data.success) {
          processed++;
          console.log(`✓ Image SEO done for Dom: ${dom.nazov}`);
        } else {
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        failed++;
        console.error(`✗ Error for Dom ${dom.nazov}:`, error.message);
      }
    }

    // Process Referencie
    for (const ref of referencieNeedingSEO) {
      try {
        const response = await base44.asServiceRole.functions.invoke('optimizeImageSEO', {
          event: { type: 'update', entity_name: 'Referencia', entity_id: ref.id },
          data: ref
        });
        if (response.data.success) {
          processed++;
          console.log(`✓ Image SEO done for Referencia: ${ref.meno_klienta}`);
        } else {
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        failed++;
        console.error(`✗ Error for Referencia ${ref.meno_klienta}:`, error.message);
      }
    }

    console.log(`📸 Monthly Image SEO Batch complete: ${processed} processed, ${failed} failed`);

    return Response.json({ success: true, processed, failed });

  } catch (error) {
    console.error('Monthly Image SEO Batch Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});