import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const report = {
      domProcessed: 0,
      domFailed: 0,
      blogProcessed: 0,
      blogFailed: 0,
      errors: []
    };

    // Načítaj Dom záznamy (max 10)
    console.log('Loading Dom records...');
    const domRecords = await base44.asServiceRole.entities.Dom.list('', 10);
    const domsToProcess = domRecords.filter(d => !d.ai_summary);
    console.log(`Found ${domsToProcess.length} Dom records to process`);

    // Spracuj Dom záznamy
    for (const dom of domsToProcess) {
      try {
        const contentForAnalysis = `${dom.nazov}. ${(dom.popis || '').substring(0, 800)}`;
        
        if (!contentForAnalysis.trim()) continue;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Vytvor: a) 1-vetné zhrnutie max 300 znakov. b) 3 FAQ (JSON s polom faqs). Text: ${contentForAnalysis}`,
          response_json_schema: {
            type: 'object',
            properties: {
              ai_summary: { type: 'string' },
              faq_schema_data: {
                type: 'object',
                properties: {
                  faqs: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        });

        await base44.asServiceRole.entities.Dom.update(dom.id, {
          ai_summary: (response.ai_summary || '').substring(0, 300),
          faq_schema_data: response.faq_schema_data || { faqs: [] },
          geo_context_keywords: dom.typ_domu + ', ' + (dom.kategoria || 'dom')
        });

        report.domProcessed++;
      } catch (error) {
        report.domFailed++;
        report.errors.push(`Dom ${dom.nazov}: ${error.message}`);
      }
    }

    // Načítaj BlogPost záznamy (max 5)
    console.log('Loading BlogPost records...');
    const blogRecords = await base44.asServiceRole.entities.BlogPost.list('', 5);
    const blogsToProcess = blogRecords.filter(b => !b.ai_summary);
    console.log(`Found ${blogsToProcess.length} BlogPost records to process`);

    for (const blog of blogsToProcess) {
      try {
        const contentForAnalysis = `${blog.nazov}. ${(blog.perex || '').substring(0, 500)}`;
        
        if (!contentForAnalysis.trim()) continue;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Vytvor: a) 1-vetné zhrnutie max 300 znakov. b) 3 FAQ (JSON s polom faqs). Text: ${contentForAnalysis}`,
          response_json_schema: {
            type: 'object',
            properties: {
              ai_summary: { type: 'string' },
              faq_schema_data: {
                type: 'object',
                properties: {
                  faqs: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        });

        await base44.asServiceRole.entities.BlogPost.update(blog.id, {
          ai_summary: (response.ai_summary || '').substring(0, 300),
          faq_schema_data: response.faq_schema_data || { faqs: [] },
          geo_context_keywords: (blog.tagy || []).join(', ') || blog.kategoria
        });

        report.blogProcessed++;
      } catch (error) {
        report.blogFailed++;
        report.errors.push(`BlogPost ${blog.nazov}: ${error.message}`);
      }
    }

    const totalProcessed = report.domProcessed + report.blogProcessed;

    return Response.json({
      success: true,
      report: {
        ...report,
        totalProcessed,
        totalFailed: report.domFailed + report.blogFailed,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});