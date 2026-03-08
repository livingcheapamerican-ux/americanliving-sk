import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🌙 Starting Nightly AEO Batch Process...');

    // Find pending Dom records - LIMIT TO 5 PER RUN to prevent timeout
    const allPending = await base44.asServiceRole.entities.Dom.filter({ 
      aeo_update_pending: true 
    });
    const pendingDomy = allPending.slice(0, 5);

    console.log(`Found ${allPending.length} houses pending AEO update, processing ${pendingDomy.length} this run`);

    let processed = 0;
    let failed = 0;

    for (const dom of pendingDomy) {
      try {
        console.log(`Processing Dom: ${dom.nazov} (${dom.id})`);

        // Call the generateAEOOnSave function with the dom data
        const response = await base44.asServiceRole.functions.invoke('generateAEOOnSave', {
          event: {
            type: 'update',
            entity_name: 'Dom',
            entity_id: dom.id
          },
          data: dom,
          old_data: null
        });

        if (response.data.success) {
          // Clear the pending flag
          await base44.asServiceRole.entities.Dom.update(dom.id, {
            aeo_update_pending: false
          });
          processed++;
          console.log(`✓ Successfully processed ${dom.nazov}`);
        } else {
          failed++;
          console.error(`✗ Failed to process ${dom.nazov}:`, response.data.error);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        failed++;
        console.error(`✗ Error processing ${dom.nazov}:`, error.message);
      }
    }

    // Loguj batch
    if (processed > 0) {
      await base44.functions.invoke('logIntegrationCall', {
        function_name: 'nightlyAEOBatchProcess',
        integration_type: 'InvokeLLM',
        trigger: 'automation_scheduled',
        status: processed > 0 ? 'success' : 'failed',
        estimated_credits: processed * 3,
        details: `Processed ${processed} Dom records, ${failed} failed`
      }).catch(err => console.error('Log error:', err));
    }

    console.log(`🌙 Batch complete: ${processed} processed, ${failed} failed`);

    return Response.json({
      success: true,
      total: pendingDomy.length,
      processed,
      failed
    });

  } catch (error) {
    console.error('Nightly AEO Batch Process Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});