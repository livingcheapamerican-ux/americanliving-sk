import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TARGET_LANGUAGES = ['sk', 'en', 'hu', 'pl', 'uk', 'de', 'fr', 'sr', 'hr', 'el'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { domId } = await req.json();

    if (!domId) {
      return Response.json({ error: 'domId is required' }, { status: 400 });
    }

    const report = {
      domProcessed: 0,
      blogProcessed: 0,
      languagesGenerated: [],
      errors: []
    };

    // Načítaj Dom záznam
    console.log(`Loading Dom record: ${domId}`);
    const domRecords = await base44.asServiceRole.entities.Dom.filter({ id: domId });
    const dom = domRecords[0];

    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    const contentForAnalysis = `${dom.nazov}. ${(dom.popis || '').substring(0, 800)}`;
    
    if (!contentForAnalysis.trim()) {
      return Response.json({ error: 'No content to analyze' }, { status: 400 });
    }

    // Generuj Slovak FAQ ako základ
    console.log('Generating Slovak FAQ...');
    const slovakResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Vytvor: a) 1-vetné zhrnutie max 300 znakov. b) 3 FAQ otázky a odpovede pre tento dom. Všetko v slovenčine. Text: ${contentForAnalysis}`,
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

    const faqMultiLang = {
      sk: slovakResponse.faq_schema_data || { faqs: [] }
    };

    // Preložiť FAQ do všetkých jazykov
    for (const langCode of TARGET_LANGUAGES) {
      if (langCode === 'sk') continue; // Slovak už máme

      try {
        console.log(`Translating FAQ to ${langCode}...`);
        
        const langNames = {
          en: 'angličtine',
          hu: 'maďarčine',
          pl: 'poľštine',
          uk: 'ukrajinčine',
          de: 'nemčine',
          fr: 'francúzštine',
          sr: 'srbčine',
          hr: 'chorvátčine',
          el: 'gréčtine'
        };

        const translatedFaq = await base44.integrations.Core.InvokeLLM({
          prompt: `Prelož tento FAQ do ${langNames[langCode]}. Otázky a odpovede musia byť kultúrne relevantné. FAQ v slovenčine: ${JSON.stringify(slovakResponse.faq_schema_data)}`,
          response_json_schema: {
            type: 'object',
            properties: {
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

        faqMultiLang[langCode] = translatedFaq.faq_schema_data || { faqs: [] };
        report.languagesGenerated.push(langCode);
      } catch (error) {
        report.errors.push(`FAQ translation ${langCode}: ${error.message}`);
      }
    }

    // Ulož multi-language FAQ
    await base44.asServiceRole.entities.Dom.update(dom.id, {
      ai_summary: (slovakResponse.ai_summary || '').substring(0, 300),
      faq_schema_data: faqMultiLang,
      geo_context_keywords: dom.typ_domu + ', ' + (dom.kategoria || 'dom')
    });

    report.domProcessed = 1;

    return Response.json({
      success: true,
      report: {
        ...report,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});