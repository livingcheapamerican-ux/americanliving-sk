import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API key is set
    const apiKey = Deno.env.get("Gemini_PAID_pro");
    if (!apiKey) {
      return Response.json({ 
        error: '⚠️ Pre Kreatívne Štúdio vložte prosím API kľúč v nastaveniach.',
        needs_api_key: true
      }, { status: 400 });
    }

    const { raw_idea } = await req.json();

    if (!raw_idea) {
      return Response.json({ error: 'Chýba raw_idea parameter' }, { status: 400 });
    }

    // Získaj know-how pravidlá
    const brainRules = await base44.asServiceRole.entities.MarketingBrain.filter({ active: true });
    const knowHow = brainRules
      .sort((a, b) => b.urgency_level - a.urgency_level)
      .slice(0, 8)
      .map(r => `[${r.category}] ${r.content_text}`)
      .join('\n');

    // Získaj úspešné konkurenčné príspevky
    const competitors = await base44.asServiceRole.entities.CompetitorWatch.list('-engagement_score', 5);
    const competitorTactics = competitors
      .map(c => `${c.competitor_name}: ${c.why_it_worked} (Trigger: ${c.psychological_trigger || 'N/A'})`)
      .join('\n');

    // Získaj Google Drive assets link
    const assets = await base44.asServiceRole.entities.MarketingAssets.filter({ active: true, asset_type: 'google_drive_link' });
    const driveLink = assets[0]?.link || 'Zatiaľ nenastavený';

    const prompt = `Si kreatívny riaditeľ a scenárista pre American Living (modulárne domy).

📝 SUROVÝ NÁPAD OD MARKETÉRA:
"${raw_idea}"

💡 NAŠE KNOW-HOW (MUSÍŠ dodržať):
${knowHow}

👀 ČO FUNGUJE KONKURENCII:
${competitorTactics}

📂 NAŠE VIZUÁLY (Google Drive):
${driveLink}

---

TVOJA ÚLOHA: Pretvor tento surový nápad na HOTOVÝ PRODUKČNÝ PROJEKT.

Vytvor JSON objekt s týmito poľami:

{
  "improved_concept": "...(3-4 vety: Prečo tento nápad bude fungovať? Aký psychologický princíp používa?)...",
  
  "detailed_scenario": "...(Presný scenár, záber po zábere. Čo hovoriť, čo ukázať. Min 200 slov.)...",
  
  "production_guide": {
    "lighting": "...(Aké svetlo použiť - denné/umelé/soft)...",
    "music_style": "...(Aká hudba - energická/pokojná/inšpirujúca)...",
    "camera_instructions": "...(Closeup/wide shot/tracking shot...)...",
    "duration": "...(Odporúčaná dĺžka videa - 15s/30s/60s)...",
    "key_message": "...(Hlavný odkaz, ktorý musí divák pochopiť)..."
  },
  
  "visual_assets_reminder": "🎨 Použite vizuály z: ${driveLink}",
  
  "compliance_check": "...(Či tento projekt dodržiava naše know-how pravidlá? Áno/Nie a prečo)...",
  
  "reasoning": "...(🧠 Vysvetlenie: Prečo som zvolil tento prístup? Ako som analyzoval problém krok za krokom?)...",
  
  "estimated_impact": {
    "predicted_reach": "...(Low/Medium/High)...",
    "target_audience": "...(Kto je cieľová skupina)...",
    "psychological_triggers": ["...", "..."],
    "aida_stage": "Attention/Interest/Desire/Action"
  }
}

POŽIADAVKY:
- Scenár musí byť VEĽMI detailný a konkrétny
- Nezabudni na call-to-action
- Odkaž sa na naše know-how pravidlá
- PRIDAJ na koniec sekciu: "🧠 PREČO SOM SA TAKTO ROZHODOL?" (vysvetlenie reasoning)
- Slovenčina`;

    let response;

    // Použij Gemini 1.5 Pro pre maximálne reasoning
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 3072,
            }
          })
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        // Parse JSON z odpovede
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        response = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } else {
        const errorData = await geminiResponse.text();
        throw new Error(`Gemini API Error: ${errorData}`);
      response_json_schema: {
        type: "object",
        properties: {
          improved_concept: { type: "string" },
          detailed_scenario: { type: "string" },
          production_guide: {
            type: "object",
            properties: {
              lighting: { type: "string" },
              music_style: { type: "string" },
              camera_instructions: { type: "string" },
              duration: { type: "string" },
              key_message: { type: "string" }
            }
          },
          visual_assets_reminder: { type: "string" },
          compliance_check: { type: "string" },
          estimated_impact: {
            type: "object",
            properties: {
              predicted_reach: { type: "string" },
              target_audience: { type: "string" },
              psychological_triggers: {
                type: "array",
                items: { type: "string" }
              },
              aida_stage: { type: "string" }
            }
          }
        }
      }
    });
    } else {
      response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            improved_concept: { type: "string" },
            detailed_scenario: { type: "string" },
            production_guide: {
              type: "object",
              properties: {
                lighting: { type: "string" },
                music_style: { type: "string" },
                camera_instructions: { type: "string" },
                duration: { type: "string" },
                key_message: { type: "string" }
              }
            },
            visual_assets_reminder: { type: "string" },
            compliance_check: { type: "string" },
            estimated_impact: {
              type: "object",
              properties: {
                predicted_reach: { type: "string" },
                target_audience: { type: "string" },
                psychological_triggers: {
                  type: "array",
                  items: { type: "string" }
                },
                aida_stage: { type: "string" }
              }
            },
            reasoning: { type: "string" }
          }
        }
      });
    }

    return Response.json({
      success: true,
      project: response,
      drive_link: driveLink,
      model_used: 'gemini-1.5-pro-002',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kreatívne Štúdio Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});