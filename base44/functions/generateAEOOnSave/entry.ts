import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Payload z entity automation
    const { event, data, old_data } = await req.json();
    
    if (!event || !data) {
      return Response.json({ error: 'Missing event or data' }, { status: 400 });
    }

    const { entity_name, entity_id, type } = event;
    
    // Zisti, či treba generovať (ak je empty alebo sa zmenil text)
    let shouldGenerate = false;
    let contentForAnalysis = '';

    // Globálna ochrana pred slučkou pre update eventy
    if (type === 'update' && old_data && data) {
      const aeoMetaFields = ['ai_summary', 'faq_schema_data', 'geo_context_keywords', 'meta_title', 'meta_description', 'product_schema_json', 'images_seo_map', 'aeo_update_pending'];
      const contentKeys = Object.keys(data).filter(k => !aeoMetaFields.includes(k));
      const hasRealChange = contentKeys.some(k => JSON.stringify(old_data[k]) !== JSON.stringify(data[k]));
      if (!hasRealChange) {
        console.log(`⏭️ generateAEOOnSave: skipping ${data.nazov || entity_id} - only meta/SEO fields changed (loop protection)`);
        return Response.json({ success: true, generated: false, reason: 'only_meta_changed_loop_protection' });
      }
    }

    if (entity_name === 'Dom') {
      // faq_schema_data je multi-language: { sk: { faqs: [...] }, en: {...} }
      const hasEmptyFAQ = !data.faq_schema_data?.sk?.faqs || data.faq_schema_data.sk.faqs.length === 0;
      const hasEmptySummary = !data.ai_summary || data.ai_summary.trim().length === 0;
      const textChanged = type === 'create' || 
        (old_data && (old_data.popis !== data.popis || old_data.nazov !== data.nazov));
      
      // Ak už máme summary aj FAQ a text sa nezmenil, preskočíme - šetríme kredity
      shouldGenerate = (hasEmptyFAQ || hasEmptySummary) || textChanged;
      if (shouldGenerate) {
        contentForAnalysis = `${data.nazov}. ${(data.popis || '').substring(0, 800)}`;
      }
    } 
    else if (entity_name === 'BlogPost') {
      // BlogPost faq_schema_data je tiež multi-language
      const hasEmptyFAQ = !data.faq_schema_data?.sk?.faqs || data.faq_schema_data.sk.faqs.length === 0;
      const textChanged = type === 'create' || 
        (old_data && (old_data.perex !== data.perex || old_data.obsah !== data.obsah || old_data.nazov !== data.nazov));
      
      shouldGenerate = hasEmptyFAQ || textChanged;
      if (shouldGenerate) {
        contentForAnalysis = `${data.nazov}. ${(data.perex || '').substring(0, 500)}. ${(data.obsah || '').substring(0, 300)}`;
      }
    }

    if (!shouldGenerate || !contentForAnalysis.trim()) {
      return Response.json({ success: true, generated: false, reason: 'No changes detected or empty content' });
    }

    console.log(`[${entity_name}] Generating AEO for ID: ${entity_id}`);

    // Loguj pred AI volaním
    const logPromise = base44.functions.invoke('logIntegrationCall', {
      function_name: 'generateAEOOnSave',
      integration_type: 'InvokeLLM',
      entity_name,
      entity_id,
      trigger: 'automation_entity',
      estimated_credits: 3
    }).catch(err => console.error('Log error:', err));

    // Vygeneruj AI zhrnutie a FAQ (optimalizované pre Google AEO/featured snippets)
    const entityType = entity_name === 'Dom' ? 'montovanom dome' : 'článku';
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Si expert na SEO a AEO (Answer Engine Optimization) pre slovenský trh s nehnuteľnosťami.
Na základe nasledujúceho textu o ${entityType} vytvor:
a) ai_summary: 1–2 vety, max 280 znakov. Musí obsahovať kľúčové fakty (cena, plocha, výrobca). Začni faktom, nie menom firmy.
b) faq_schema_data.faqs: presne 5 otázok a odpovedí. Požiadavky:
   - Otázky začínajú slovami: Aká, Koľko, Ako, Kde, Čo, Prečo, Je možné
   - Odpovede sú min. 2 vety, konkrétne, s číslami kde sa dá
   - Pokrývajú: cenu, plochu/dispozíciu, výrobcu/distribútora, čas výstavby, energetiku
   - Prirodzene znejú ako reálne otázky od zákazníka

Text: ${contentForAnalysis}`,
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

    // Ulož do entity - faq_schema_data musí byť multi-language formát { sk: { faqs: [...] } }
    const faqData = response.faq_schema_data?.faqs
      ? { sk: { faqs: response.faq_schema_data.faqs } }
      : (response.faq_schema_data || { sk: { faqs: [] } });

    const updateData = {
      ai_summary: (response.ai_summary || '').substring(0, 300),
      faq_schema_data: faqData
    };

    // Pridaj geo_context_keywords (bohatší kontext pre GEO)
    if (entity_name === 'Dom') {
      const typMap = { modularny: 'modulárny dom', montovany: 'montovaný dom', mobilny: 'mobilný dom' };
      const typText = typMap[data.typ_domu] || 'dom';
      const keywordParts = [
        typText,
        data.vyrobca || '',
        data.zastavana_plocha ? `${data.zastavana_plocha}m²` : '',
        data.energeticky_certifikat ? 'energetická trieda A0' : '',
        data.celorocny ? 'celoročné bývanie' : '',
        'American Living Slovensko',
        'dom na kľúč'
      ].filter(Boolean);
      updateData.geo_context_keywords = keywordParts.join(', ');
    } else if (entity_name === 'BlogPost') {
      const tagStr = (data.tagy || []).join(', ');
      updateData.geo_context_keywords = [tagStr, data.kategoria, 'American Living blog', 'montované domy Slovensko'].filter(Boolean).join(', ');
    }

    await base44.asServiceRole.entities[entity_name].update(entity_id, updateData);

    console.log(`[${entity_name}] AEO generated successfully for ID: ${entity_id}`);

    return Response.json({
      success: true,
      generated: true,
      entity_name,
      entity_id,
      summary_length: response.ai_summary?.length || 0,
      faq_count: response.faq_schema_data?.faqs?.length || 0
    });

  } catch (error) {
    console.error('AEO generation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});