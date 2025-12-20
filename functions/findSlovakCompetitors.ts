import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompt = `Si marketingový výskumník pre slovenský trh s modulárnymi a montovanými domami.

🧠 CHAIN OF THOUGHT REASONING:
1. Analyzuj slovenský trh modulárnych a montovaných domov
2. Identifikuj TOP hráčov na základe online prítomnosti
3. Vyhodnoť ich Digital Power (web traffic, social media aktivita, brand strength)
4. ZORAĎ ich podľa celkovej online sily (#1 = najsilnejší)
5. Pre každého urč kľúčovú silnú stránku

ÚLOHA: Vytvor ZORADENÝ REBRÍČEK 15 najsilnejších konkurentov na slovenskom trhu.

Pre každú firmu vráť:
{
  "rank": ...(1-15, kde 1 = najsilnejší hráč na trhu)...,
  "competitor_name": "...(oficiálny názov firmy)...",
  "digital_power_score": ...(0-100, kombinácia web traffic + social media + brand)...,
  "strongest_channel": "...(Výborný Facebook marketing / Silné SEO na Google / Aktívny Instagram / Kvalitný web)...",
  "why_strong": "...(Čo ich robí silnými? Prečo súTop hráč?)...",
  "estimated_market_position": "Leader/Strong Player/Growing Player",
  "suggested_platforms": ["Facebook", "Instagram", "TikTok"]
}

POŽIADAVKY:
- Hľadaj reálne slovenské firmy: Drevodom, Bau holding, Stavebniny DEK (domy), EcoWood, Modulardoc, atď.
- Ak poznáš konkrétne firmy a ich online silu, použi reálne dáta
- Ak nie, odhadni na základe typu biznisu a trhu
- MUSÍ byť zoradené od #1 (najsilnejší) po #15

Vráť JSON s "competitors" array ZORADENÝ podľa rank.`;

  const apiKey = Deno.env.get("Gemini_PAID_pro");
  let response;

  if (apiKey) {
    // Použij Gemini 1.5 Pro pre lepšiu analýzu trhu
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (geminiResponse.ok) {
      const data = await geminiResponse.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"competitors": []}';
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      response = jsonMatch ? JSON.parse(jsonMatch[0]) : { competitors: [] };
    } else {
      // Fallback
      response = await base44.integrations.Core.InvokeLLM({
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
                  rank: { type: "number" },
                  competitor_name: { type: "string" },
                  digital_power_score: { type: "number" },
                  strongest_channel: { type: "string" },
                  why_strong: { type: "string" },
                  estimated_market_position: { type: "string" },
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
    }
  } else {
    // Fallback ak nie je API kľúč

    response = await base44.integrations.Core.InvokeLLM({
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
                rank: { type: "number" },
                competitor_name: { type: "string" },
                digital_power_score: { type: "number" },
                strongest_channel: { type: "string" },
                why_strong: { type: "string" },
                estimated_market_position: { type: "string" },
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
    }

    // Zoraď podľa rank (safety check)
    const sortedCompetitors = (response.competitors || []).sort((a, b) => a.rank - b.rank);

    // Ulož do CompetitorWatch
    const createdCompetitors = [];
    for (const comp of sortedCompetitors) {
    const record = await base44.asServiceRole.entities.CompetitorWatch.create({
      competitor_name: `#${comp.rank} ${comp.competitor_name}`,
      post_content: `[Slovak Market Leaderboard] ${comp.why_strong}`,
      why_it_worked: comp.strongest_channel,
      engagement_score: comp.digital_power_score || 0,
      platform: comp.suggested_platforms?.[0] || 'Facebook',
      psychological_trigger: comp.estimated_market_position || 'Market Player',
      post_link: '' // Prázdne pole pre manuálne doplnenie
    });
    createdCompetitors.push(record);
    }

    return Response.json({
      success: true,
      competitors_found: sortedCompetitors.length,
      leaderboard: sortedCompetitors,
      created_records: createdCompetitors.length,
      model_used: apiKey ? 'gemini-1.5-pro' : 'fallback',
      message: `✅ Slovak Market Leaderboard: Nájdených ${sortedCompetitors.length} konkurentov (zoradené podľa Digital Power), ${createdCompetitors.length} pridaných do databázy`
    });

  } catch (error) {
    console.error('Find Slovak Competitors Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});