import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BATCH_SIZE = 3; // Paralelne spracovať 3 domy naraz

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('🌍 Starting Global Europeanization of All Houses...');

    // Načítaj všetky domy
    const allDoms = await base44.asServiceRole.entities.Dom.filter({}, '', 500);
    const domsToProcess = Array.isArray(allDoms) ? allDoms : [];
    console.log(`📋 Found ${domsToProcess.length} houses to process`);

    const report = {
      total_houses: domsToProcess.length,
      processed: 0,
      failed: 0,
      errors: [],
      batches_completed: 0,
      timestamp: new Date().toISOString(),
      processed_houses: []
    };

    // Spracovávaj v dávkach
    for (let i = 0; i < domsToProcess.length; i += BATCH_SIZE) {
      const batch = domsToProcess.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Batch ${report.batches_completed + 1}: Processing ${batch.length} houses...`);

      // Spusti obidve funkcie paralelne pre všetky domy v dávke
      const batchPromises = batch.map(async (dom) => {
        const domName = (dom.data?.nazov || dom.nazov || 'Unknown');
        const domId = dom.id || dom.data?.id;
        
        try {
          console.log(`  🏠 Processing: ${domName}`);

          // Paralelne: FAQ + Images SEO
          const [aeoResult, imagesResult] = await Promise.all([
            base44.functions.invoke('generateAEODataset', { domId }),
            base44.functions.invoke('batchOptimizeImagesSmall', { domId })
          ]);

          if (aeoResult?.data?.success && imagesResult?.data?.success) {
            report.processed++;
            report.processed_houses.push({
              dom_id: domId,
              dom_name: domName,
              languages_generated: aeoResult.data.report.languagesGenerated.length,
              images_optimized: imagesResult.data.report.total_images_optimized,
              status: 'success'
            });
            console.log(`    ✅ ${domName}: AEO + ${imagesResult.data.report.total_images_optimized} images optimized`);
          } else {
            throw new Error('Function returned false success');
          }
        } catch (error) {
          report.failed++;
          report.errors.push({
            dom_name: domName,
            error: error.message
          });
          console.error(`    ❌ ${domName}: ${error.message}`);
        }
      });

      // Čakaj na všetky funkcie v dávke
      await Promise.all(batchPromises);
      report.batches_completed++;

      console.log(`✅ Batch ${report.batches_completed} completed. Progress: ${report.processed}/${domsToProcess.length}`);
    }

    console.log(`\n🎉 GLOBALIZATION COMPLETE!`);
    console.log(`✅ Processed: ${report.processed}/${report.total_houses}`);
    console.log(`❌ Failed: ${report.failed}`);

    return Response.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Global europeanization error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});