import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!event || !data) {
      return Response.json({ error: 'Missing event or data' }, { status: 400 });
    }

    const { entity_id } = event;
    const { nazov_mesta } = data;

    if (!nazov_mesta || !entity_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Generating SEO content for: ${nazov_mesta}`);

    // Generate unique AI content
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Napíš pútavý, 2-odsekový text o výhodách stavby montovaného domu v lokalite ${nazov_mesta}. Spomeň špecifiká regiónu (napr. počasie, terén, dostupnosť, blízkosť miest). Text musí byť unikátny pre SEO. Kľúčové slovo: ${nazov_mesta}. Formát: 2 odseky oddelené \\n\\n.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          meta_title: { type: 'string' },
          meta_description: { type: 'string' }
        }
      }
    });

    const unikanyText = aiResponse.text || '';
    const metaTitle = aiResponse.meta_title || `Montované domy ${nazov_mesta} | Rýchla výstavba - American Living`;
    const metaDescription = aiResponse.meta_description || `Objavte výhody stavby montovaného domu v ${nazov_mesta}. Rýchla výstavba, kvalita a dostupnosť. American Living - oficiálny distribútor.`;

    // Update entity with generated content
    const updatedLokaciaSEO = await base44.asServiceRole.entities.LokaciaSEO.update(entity_id, {
      meta_title: metaTitle,
      meta_description: metaDescription,
      unikany_text_o_lokalite: unikanyText
    });

    console.log(`✅ SEO content generated for: ${nazov_mesta}`);

    return Response.json({
      success: true,
      entity_id,
      nazov_mesta,
      meta_title: metaTitle,
      text_preview: unikanyText.substring(0, 100) + '...'
    });

  } catch (error) {
    console.error('SEO generation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});