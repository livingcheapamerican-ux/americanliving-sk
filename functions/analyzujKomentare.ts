import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { comments_text, campaign_name } = await req.json();

    if (!comments_text) {
      return Response.json({ error: 'Chýba comments_text parameter' }, { status: 400 });
    }

    // Analyzuj komentáre s chain of thought
    const analysisPrompt = `Analyzuj tieto komentáre z Facebook/Instagram kampane pre American Living (modulárne domy).

🧠 CHAIN OF THOUGHT:
1. Prečítaj všetky komentáre
2. Identifikuj emócie a sentiment
3. Zoskup podobné obavy/chvály
4. Vygeneruj konkrétne poznatky
5. Navrhni zmeny pre know-how

KOMENTÁRE:
${comments_text}

---

ÚLOHA: Extrahuj z komentárov:

1. SENTIMENT (Pozitívny/Negatívny/Neutrálny)
2. TOP 3 POZITÍVNE REAKCIE (Čo sa ľuďom páčilo?)
3. TOP 3 NEGATÍVNE REAKCIE / OBAVY (Čo im vadilo?)
4. NAUČENÉ POZNATKY (Čo by sme mali ZMENIŤ v budúcich kampaniach?)

Vráť JSON:
{
  "sentiment": "Pozitívny/Negatívny/Neutrálny",
  "positive_feedback": ["...", "...", "..."],
  "negative_feedback": ["...", "...", "..."],
  "learned_insights": ["...", "...", "..."],
  "summary": "...(Krátky súhrn 2-3 vety)..."
}`;

    const apiKey = Deno.env.get("Gemini_PAID_pro");
    let analysis;

    if (apiKey) {
      // Použij Gemini 1.5 Pro
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: analysisPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } else {
        analysis = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string" },
          positive_feedback: {
            type: "array",
            items: { type: "string" }
          },
          negative_feedback: {
            type: "array",
            items: { type: "string" }
          },
          learned_insights: {
            type: "array",
            items: { type: "string" }
          },
          summary: { type: "string" }
        }
      }
    });
      }
    } else {
      analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            positive_feedback: {
              type: "array",
              items: { type: "string" }
            },
            negative_feedback: {
              type: "array",
              items: { type: "string" }
            },
            learned_insights: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });
    }

    // Ulož campaign performance
    const campaignRecord = await base44.asServiceRole.entities.CampaignPerformance.create({
      campaign_name: campaign_name || 'Nemenovaná kampaň',
      comments_dump: comments_text,
      sentiment_summary: analysis.summary,
      positive_feedback: analysis.positive_feedback,
      negative_feedback: analysis.negative_feedback,
      learned_insights: analysis.learned_insights,
      platform: 'Facebook'
    });

    // Vytvor nové know-how pravidlá z naučených poznatkov
    const newRulesPrompt = `Na základe týchto naučených poznatkov z kampane:

${analysis.learned_insights.join('\n')}

Vytvor 1-2 NOVÉ PRAVIDLÁ pre MarketingBrain, ktoré zlepšia budúce kampane.

Formát JSON:
{
  "rules": [
    {
      "category": "Psychológia/Predaj/Lead_Generation/Social_Proof/Scarcity",
      "content_text": "...(Konkrétne pravidlo, čo robiť alebo čomu sa vyhnúť)...",
      "urgency_level": ...(1-10)
    }
  ]
}`;

    const newRules = await base44.integrations.Core.InvokeLLM({
      prompt: newRulesPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                content_text: { type: "string" },
                urgency_level: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Ulož nové pravidlá do MarketingBrain
    for (const rule of newRules.rules) {
      await base44.asServiceRole.entities.MarketingBrain.create({
        ...rule,
        active: true,
        tone_guideline: 'Automaticky vygenerované z feedback kampane'
      });
    }

    return Response.json({
      success: true,
      analysis: analysis,
      new_rules_created: newRules.rules.length,
      new_rules: newRules.rules,
      campaign_id: campaignRecord.id,
      message: `✅ Analýza dokončená. Vytvorené ${newRules.rules.length} nové pravidlá pre MarketingBrain.`
    });

  } catch (error) {
    console.error('Analyzuj Komentáre Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});