import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompt = `Si marketingový výskumník pre slovenský trh s modulárnymi a montovanými domami.

ÚLOHA: Vypíš ZOZNAM 10-15 slovenských firiem (konkurentov), ktoré predávajú modulárne domy, montované domy alebo drevené stavby.

Pre každú firmu uveď:
{
  "competitor_name": "...(oficiálny názov firmy)...",
  "why_competitor": "...(Prečo sú naša konkurencia? Čo robia podobne?)...",
  "estimated_market_share": "Small/Medium/Large",
  "known_strengths": "...(Aké sú ich silné stránky?)...",
  "suggested_platforms": ["Facebook", "Instagram", "TikTok"]
}

Vráť JSON array.

POZNÁMKA: Hľadaj slovenské firmy ako Drevodom, Bau holding, Modulardoc, EcoWood, a podobné. Ak poznáš konkrétne názvy, použi ich. Ak nie, vygeneruj typické názvy slovenských firiem v tomto odvetví.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                competitor_name: { type: "string" },
                why_competitor: { type: "string" },
                estimated_market_share: { type: "string" },
                known_strengths: { type: "string" },
                suggested_platforms: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    // Ulož do CompetitorWatch s flagom "suggested"
    const createdCompetitors = [];
    for (const comp of response.competitors) {
      const record = await base44.asServiceRole.entities.CompetitorWatch.create({
        competitor_name: comp.competitor_name,
        post_content: `[Navrhnuté na sledovanie] ${comp.why_competitor}`,
        why_it_worked: comp.known_strengths,
        engagement_score: 0,
        platform: comp.suggested_platforms[0] || 'Facebook',
        psychological_trigger: 'Auto-discovered competitor'
      });
      createdCompetitors.push(record);
    }

    return Response.json({
      success: true,
      competitors_found: response.competitors.length,
      competitors: response.competitors,
      created_records: createdCompetitors.length,
      message: `✅ Nájdených ${response.competitors.length} konkurentov, ${createdCompetitors.length} pridaných do databázy`
    });

  } catch (error) {
    console.error('Find Slovak Competitors Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});