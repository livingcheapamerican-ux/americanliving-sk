import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📝 Starting Monthly Blog AEO Batch Process...');

    // Only process blog posts without ai_summary or faq_schema_data
    const allPosts = await base44.asServiceRole.entities.BlogPost.list();
    const pendingPosts = allPosts.filter(post =>
      !post.ai_summary || post.ai_summary.trim().length === 0 ||
      !post.faq_schema_data || !post.faq_schema_data.faqs || post.faq_schema_data.faqs.length === 0
    ).slice(0, 5); // Max 5 per run

    console.log(`Found ${pendingPosts.length} BlogPosts needing AEO generation`);

    let processed = 0;
    let failed = 0;

    for (const post of pendingPosts) {
      try {
        const response = await base44.asServiceRole.functions.invoke('generateAEOOnSave', {
          event: { type: 'update', entity_name: 'BlogPost', entity_id: post.id },
          data: post,
          old_data: null
        });
        if (response.data.success) {
          processed++;
          console.log(`✓ AEO done for BlogPost: ${post.nazov}`);
        } else {
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        console.error(`✗ Error for BlogPost ${post.nazov}:`, error.message);
      }
    }

    // Loguj batch
    if (processed > 0) {
      await base44.functions.invoke('logIntegrationCall', {
        function_name: 'monthlyBlogAEOBatch',
        integration_type: 'InvokeLLM',
        trigger: 'automation_scheduled',
        status: processed > 0 ? 'success' : 'failed',
        estimated_credits: processed * 3,
        details: `Processed ${processed} blog posts, ${failed} failed`
      }).catch(err => console.error('Log error:', err));
    }

    console.log(`📝 Monthly Blog AEO Batch complete: ${processed} processed, ${failed} failed`);

    return Response.json({ success: true, processed, failed });

  } catch (error) {
    console.error('Monthly Blog AEO Batch Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});