import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { imageUrls } = await req.json();

    if (!imageUrls || imageUrls.length === 0) {
      return Response.json({ error: 'Neboli poskytnuté žiadne obrázky' }, { status: 400 });
    }

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyzuj tieto obrázky starého cenového konfiguratora PROSTO HOUSE a extrahuj VŠETKY sprievodné texty, popisky a informácie ku každej položke. 

Potrebujem presný text, ktorý je zobrazený pri každej položke:
- Názov položky (hlavný nadpis) - napr. "Montáž holodomu", "Tepelné čerpadlo", "Izolácia"
- Podnadpis/krátky popis - napr. "150/200mm", "5 jednotiek", "hrubá stavba"
- Dlhší popisný text (ak existuje pod obrázkom alebo vedľa) - vysvetlenie čo zahŕňa
- Akékoľvek poznámky, upozornenia alebo ďalšie informácie - hvezdičkové texty, dôležité info

IGNORUJ všetky ceny - zaujímajú ma len textové informácie, popisky a vysvetlenia.

Výstup musí byť v slovenčine a mal by obsahovať všetky položky, ktoré vidíš na obrázkoch.
Extrahuj aj tie najmenšie detaily a poznámky pod čiarou.`,
      file_urls: imageUrls,
      response_json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Hlavný názov položky" },
                subtitle: { type: "string", description: "Krátky podnadpis alebo popis" },
                long_description: { type: "string", description: "Dlhší popisný text čo zahŕňa" },
                notes: { type: "string", description: "Poznámky, upozornenia, hvezdičkové texty" },
                category: { type: "string", description: "Kategória (napr. Hrubá stavba, Holodom, Okná, Inštalácie)" }
              }
            }
          }
        }
      }
    });

    return Response.json(llmResponse);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});