import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BATCH_SIZE = 2; // Menšie dávky

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('🌍 GLOBÁLNA AKTUALIZÁCIA: Všetky domy pre 10 jazykov');

    // Načítaj všetky domy
    const allDoms = await base44.asServiceRole.entities.Dom.filter({}, '', 500);
    const domsToProcess = Array.isArray(allDoms) ? allDoms : [];
    console.log(`📋 Spravovávam ${domsToProcess.length} domov...`);

    const report = {
      total_houses: domsToProcess.length,
      processed: 0,
      failed: 0,
      errors: [],
      processed_houses: []
    };

    // Postupne spracuj všetky domy v malých dávkach
    for (let i = 0; i < domsToProcess.length; i += BATCH_SIZE) {
      const batch = domsToProcess.slice(i, i + BATCH_SIZE);
      
      for (const dom of batch) {
        const domId = dom.id || dom.data?.id;
        const domName = dom.data?.nazov || dom.nazov || 'Unknown';

        try {
          console.log(`\n🏠 [${report.processed + report.failed + 1}/${domsToProcess.length}] ${domName}...`);

          // Spusti obi e funkcie postupne
          const aeoRes = await base44.functions.invoke('generateAEODataset', { domId });
          const imgRes = await base44.functions.invoke('batchOptimizeImagesSmall', { domId });

          if (aeoRes?.data?.success && imgRes?.data?.success) {
            report.processed++;
            report.processed_houses.push(domName);
            console.log(`   ✅ OK - Všetkých 10 jazykov aktivovaných`);
          } else {
            throw new Error('Function failed');
          }
        } catch (error) {
          report.failed++;
          report.errors.push({
            dom: domName,
            error: error.message
          });
          console.log(`   ❌ FAILED - ${error.message}`);
        }
      }

      // Čakaj medzi dávkami (aby sme nepreťažili server)
      if (i + BATCH_SIZE < domsToProcess.length) {
        console.log(`\n⏳ Pauza pred ďalšou dávkou...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`\n\n✅ KOMPLETNÉ!`);
    console.log(`📊 Spracované: ${report.processed}/${report.total_houses}`);
    console.log(`❌ Chyby: ${report.failed}`);

    return Response.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});