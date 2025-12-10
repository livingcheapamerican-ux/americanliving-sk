import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Jazyky do ktorých prekladáme
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'pl', name: 'Polish' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'de', name: 'German' },
      { code: 'fr', name: 'French' },
      { code: 'sr', name: 'Serbian' },
      { code: 'hr', name: 'Croatian' },
      { code: 'el', name: 'Greek' }
    ];

    // Načítať všetky blog posty
    const allPosts = await base44.asServiceRole.entities.BlogPost.list();
    
    const results = {
      total: allPosts.length,
      translated: 0,
      failed: 0,
      errors: []
    };

    for (const post of allPosts) {
      try {
        const translations = {};

        // Pre každý jazyk urobiť preklad
        for (const lang of languages) {
          try {
            const translationPrompt = `You are a professional translator. Translate the following blog post content from Slovak to ${lang.name}.
Keep markdown formatting intact. Maintain the tone and style of the original text.
Do not translate brand names like "American Living", "TicabHouse", "ProstoHouse", "JAK Modules", "Domki z Gór".

Title: ${post.nazov}
Perex: ${post.perex}
Content: ${post.obsah}

Return your translation in this exact JSON format:
{
  "title": "translated title",
  "perex": "translated perex",
  "content": "translated content"
}`;

            const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: translationPrompt,
              response_json_schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  perex: { type: "string" },
                  content: { type: "string" }
                }
              }
            });

            translations[`nazov_${lang.code}`] = response.title;
            translations[`perex_${lang.code}`] = response.perex;
            translations[`obsah_${lang.code}`] = response.content;

          } catch (error) {
            console.error(`Error translating post ${post.id} to ${lang.name}:`, error);
            // V prípade chyby nastavíme pôvodný text
            translations[`nazov_${lang.code}`] = post.nazov;
            translations[`perex_${lang.code}`] = post.perex;
            translations[`obsah_${lang.code}`] = post.obsah;
          }
        }

        // Aktualizovať blog post s prekladmi
        translations.prelozene = true;
        await base44.asServiceRole.entities.BlogPost.update(post.id, translations);
        
        results.translated++;

      } catch (error) {
        console.error(`Failed to translate post ${post.id}:`, error);
        results.failed++;
        results.errors.push({
          postId: post.id,
          postName: post.nazov,
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Bulk translation completed',
      results
    });

  } catch (error) {
    console.error('Bulk translation error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});