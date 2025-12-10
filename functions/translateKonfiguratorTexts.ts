import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vyrobca } = await req.json();
    
    if (!vyrobca) {
      return Response.json({ error: 'Vyrobca required' }, { status: 400 });
    }

    // Načítať všetky KonfiguratorText pre daného výrobcu
    const texts = await base44.asServiceRole.entities.KonfiguratorText.filter({ vyrobca });

    if (texts.length === 0) {
      return Response.json({ error: 'No texts found for this manufacturer' }, { status: 404 });
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

    const results = {
      total: texts.length,
      translated: 0,
      failed: 0,
      errors: []
    };

    for (const text of texts) {
      try {
        const translations = {};

        // Pre každý jazyk urobiť preklad
        for (const lang of languages) {
          try {
            // Pripravíme texty na preklad
            const fields = {
              nazov: text.nazov || '',
              podnadpis: text.podnadpis || '',
              dlhy_popis: text.dlhy_popis || '',
              poznamky: text.poznamky || '',
              tooltip: text.tooltip || ''
            };

            const translationPrompt = `You are a professional translator for house configurator texts. Translate the following configurator item from Slovak to ${lang.name}.
Keep the technical terminology accurate. Maintain the tone and style.
Do not translate brand names like "Ticab house", "Prosto House", "JAK Modules", "Domki z Gór".
Do not translate measurement units (mm, m², €, etc.).

Item name: ${fields.nazov}
Subtitle: ${fields.podnadpis}
Description: ${fields.dlhy_popis}
Notes: ${fields.poznamky}
Tooltip: ${fields.tooltip}

Return your translation in this exact JSON format:
{
  "nazov": "translated name",
  "podnadpis": "translated subtitle",
  "dlhy_popis": "translated description",
  "poznamky": "translated notes",
  "tooltip": "translated tooltip"
}`;

            const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: translationPrompt,
              response_json_schema: {
                type: "object",
                properties: {
                  nazov: { type: "string" },
                  podnadpis: { type: "string" },
                  dlhy_popis: { type: "string" },
                  poznamky: { type: "string" },
                  tooltip: { type: "string" }
                }
              }
            });

            translations[`nazov_${lang.code}`] = response.nazov || fields.nazov;
            translations[`podnadpis_${lang.code}`] = response.podnadpis || fields.podnadpis;
            translations[`dlhy_popis_${lang.code}`] = response.dlhy_popis || fields.dlhy_popis;
            translations[`poznamky_${lang.code}`] = response.poznamky || fields.poznamky;
            translations[`tooltip_${lang.code}`] = response.tooltip || fields.tooltip;

          } catch (error) {
            console.error(`Error translating text ${text.id} to ${lang.name}:`, error);
            // V prípade chyby nastavíme pôvodný text
            translations[`nazov_${lang.code}`] = text.nazov;
            translations[`podnadpis_${lang.code}`] = text.podnadpis || '';
            translations[`dlhy_popis_${lang.code}`] = text.dlhy_popis || '';
            translations[`poznamky_${lang.code}`] = text.poznamky || '';
            translations[`tooltip_${lang.code}`] = text.tooltip || '';
          }
        }

        // Aktualizovať KonfiguratorText s prekladmi
        translations.prelozene = true;
        await base44.asServiceRole.entities.KonfiguratorText.update(text.id, translations);
        
        results.translated++;

      } catch (error) {
        console.error(`Failed to translate text ${text.id}:`, error);
        results.failed++;
        results.errors.push({
          textId: text.id,
          itemName: text.nazov,
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Translation completed',
      results 
    });

  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});