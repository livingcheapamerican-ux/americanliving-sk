import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Iba admin môže spustiť túto funkciu
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

    // Načítaj všetky záznamy Dom
    console.log('Loading Dom records...');
    const domRecords = await base44.asServiceRole.entities.Dom.list();
    console.log(`Found ${domRecords.length} Dom records`);

    // Spracuj Dom záznamy
    for (const dom of domRecords) {
      try {
        const contentForAnalysis = `${dom.nazov}. ${dom.popis || ''} ${dom.specifikacia || ''}`;
        
        if (!contentForAnalysis.trim()) continue;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyzuj nasledujúci text a vytvor z neho:
a) Krátke zhrnutie do 300 znakov optimalizované pre AI odpovede (bez uvodzoviek).
b) 3 najčastejšie otázky a odpovede (FAQ) vyplývajúce z textu vo formáte JSON.

Vráť JSON s dvomi poľami: "ai_summary" (string) a "faq_schema_data" (object s polom "faqs" obsahujúcim array objektov s "otazka" a "odpoved").

Vstupný text: ${contentForAnalysis.substring(0, 2000)}`,
          response_json_schema: {
            type: 'object',
            properties: {
              ai_summary: { type: 'string' },
              faq_schema_data: {
                type: 'object',
                properties: {
                  faqs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        otazka: { type: 'string' },
                        odpoved: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Aktualizuj Dom záznam
        await base44.asServiceRole.entities.Dom.update(dom.id, {
          ai_summary: response.ai_summary || '',
          faq_schema_data: response.faq_schema_data || { faqs: [] },
          geo_context_keywords: dom.typ_domu + ', ' + (dom.kategoria || 'dom')
        });

        report.domProcessed++;
      } catch (error) {
        console.error(`Error processing Dom ${dom.id}:`, error.message);
        report.domFailed++;
        report.errors.push(`Dom ${dom.nazov}: ${error.message}`);
      }
    }

    // Načítaj všetky BlogPost záznamy
    console.log('Loading BlogPost records...');
    const blogRecords = await base44.asServiceRole.entities.BlogPost.list();
    console.log(`Found ${blogRecords.length} BlogPost records`);

    // Spracuj BlogPost záznamy
    for (const blog of blogRecords) {
      try {
        const contentForAnalysis = `${blog.nazov}. ${blog.perex || ''} ${blog.obsah || ''}`;
        
        if (!contentForAnalysis.trim()) continue;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyzuj nasledujúci text a vytvor z neho:
a) Krátke zhrnutie do 300 znakov optimalizované pre AI odpovede (bez uvodzoviek).
b) 3 najčastejšie otázky a odpovede (FAQ) vyplývajúce z textu vo formáte JSON.

Vráť JSON s dvomi poľami: "ai_summary" (string) a "faq_schema_data" (object s polom "faqs" obsahujúcim array objektov s "otazka" a "odpoved").

Vstupný text: ${contentForAnalysis.substring(0, 2000)}`,
          response_json_schema: {
            type: 'object',
            properties: {
              ai_summary: { type: 'string' },
              faq_schema_data: {
                type: 'object',
                properties: {
                  faqs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        otazka: { type: 'string' },
                        odpoved: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // Aktualizuj BlogPost záznam
        await base44.asServiceRole.entities.BlogPost.update(blog.id, {
          ai_summary: response.ai_summary || '',
          faq_schema_data: response.faq_schema_data || { faqs: [] },
          geo_context_keywords: (blog.tagy || []).join(', ') || blog.kategoria
        });

        report.blogProcessed++;
      } catch (error) {
        console.error(`Error processing BlogPost ${blog.id}:`, error.message);
        report.blogFailed++;
        report.errors.push(`BlogPost ${blog.nazov}: ${error.message}`);
      }
    }

    // Vrať report
    const totalProcessed = report.domProcessed + report.blogProcessed;
    const totalFailed = report.domFailed + report.blogFailed;

    return Response.json({
      success: true,
      message: `AEO Dataset generation completed`,
      report: {
        ...report,
        totalProcessed,
        totalFailed,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Fatal error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});