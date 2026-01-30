import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    if (entity_name === 'Dom') {
      const hasEmptyFAQ = !data.faq_schema_data || !data.faq_schema_data.faqs || data.faq_schema_data.faqs.length === 0;
      const textChanged = type === 'create' || 
        (old_data && (old_data.popis !== data.popis || old_data.nazov !== data.nazov));
      
      shouldGenerate = hasEmptyFAQ || textChanged;
      if (shouldGenerate) {
        contentForAnalysis = `${data.nazov}. ${(data.popis || '').substring(0, 800)}`;
      }
    } 
    else if (entity_name === 'BlogPost') {
      const hasEmptyFAQ = !data.faq_schema_data || !data.faq_schema_data.faqs || data.faq_schema_data.faqs.length === 0;
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

    // Vygeneruj AI zhrnutie a FAQ
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Vytvor: a) 1-vetné zhrnutie max 300 znakov. b) 3-5 relevantných FAQ otázok a odpovedí v JSON formáte s polom 'faqs'. Otázky musia byť prirodzené a často kladené v tejto oblasti. Text: ${contentForAnalysis}`,
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

    // Načítaj aktuálny záznam
    const currentRecord = await base44.asServiceRole.entities[entity_name].get(entity_id);
    
    // Ulož do entity - ZACHOVAJ všetky existujúce polia
    const updateData = {
      ...currentRecord, // Zachovaj všetky existujúce polia
      ai_summary: (response.ai_summary || '').substring(0, 300),
      faq_schema_data: response.faq_schema_data || { faqs: [] }
    };

    // Pridaj geo_context_keywords
    if (entity_name === 'Dom') {
      updateData.geo_context_keywords = data.typ_domu + ', ' + (data.kategoria || 'dom');
    } else if (entity_name === 'BlogPost') {
      updateData.geo_context_keywords = (data.tagy || []).join(', ') || data.kategoria;
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