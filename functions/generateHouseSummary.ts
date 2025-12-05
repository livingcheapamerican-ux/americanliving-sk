import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, type = 'summary', language = 'sk' } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    // Language mapping
    const langMap = {
      'sk': 'slovenčina',
      'en': 'angličtina',
      'hu': 'maďarčina',
      'pl': 'poľština',
      'uk': 'ukrajinčina',
      'de': 'nemčina',
      'fr': 'francúzština',
      'sr': 'srbčina',
      'hr': 'chorvátčina',
      'el': 'gréčtina'
    };

    const targetLanguage = langMap[language] || 'slovenčina';

    let prompt = '';
    let schema = null;

    if (type === 'summary') {
      prompt = `Na základe tohto detailného popisu domu vytvor krátky súhrn v jazyku ${targetLanguage} (max 100 slov). 
Zachyť hlavné výhody a vlastnosti. Buď stručný a presný.

Detailný popis:
${description}

Vráť iba súhrn, nič iné.`;
    } else if (type === 'bullets') {
      prompt = `Na základe tohto popisu domu vytvor 5-7 kľúčových vlastností alebo výhod vo forme bodov v jazyku ${targetLanguage}.
Každý bod musí byť stručný (max 15 slov) a výstižný.

Popis domu:
${description}`;

      schema = {
        type: "object",
        properties: {
          keyFeatures: {
            type: "array",
            items: { type: "string" },
            minItems: 5,
            maxItems: 7
          }
        },
        required: ["keyFeatures"]
      };
    }

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: schema
    });

    const result = type === 'bullets' ? response.keyFeatures : (response.output || response);

    return Response.json({ 
      success: true, 
      result: result,
      type: type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});