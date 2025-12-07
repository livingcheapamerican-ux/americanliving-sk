import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyzuj tieto obrázky starého cenového konfiguratora a extrahuj VŠETKY sprievodné texty, popisky a informácie ku každej položke. 

Potrebujem presný text, ktorý je zobrazený pri každej položke:
- Názov položky (hlavný nadpis)
- Podnadpis/krátky popis
- Dlhší popisný text (ak existuje pod obrázkom alebo vedľa)
- Akékoľvek poznámky, upozornenia alebo ďalšie informácie

IGNORUJ všetky ceny - zaujímajú ma len textové informácie a popisky.

Výstup musí byť v slovenčine a mal by obsahovať všetky položky, ktoré vidíš na obrázkoch.`,
      file_urls: [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/06497701e_Snimkaobrazovky2025-12-07o20259.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/b2e644bbd_Snimkaobrazovky2025-12-07o20251.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/cda9f7d89_Snimkaobrazovky2025-12-07o20239.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/a825b4597_Snimkaobrazovky2025-12-07o20227.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/a45bb5a89_Snimkaobrazovky2025-12-07o20215.png"
      ],
      response_json_schema: {
        type: "object",
        properties: {
          polozky: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nazov: { type: "string", description: "Hlavný názov položky" },
                podnadpis: { type: "string", description: "Krátky podnadpis alebo popis" },
                dlhy_popis: { type: "string", description: "Dlhší popisný text pod obrázkom" },
                poznamky: { type: "string", description: "Poznámky, upozornenia, hvezdičkové texty" },
                kategoria: { type: "string", description: "Kategória (napr. okná, izolácia, základy...)" }
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