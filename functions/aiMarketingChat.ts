import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI Marketingový Partner - Interaktívny chat s prístupom k všetkým dátam
 * Automaticky zbiera dáta, analyzuje trendy a navrhuje stratégie
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_message, chat_history, action, suggestion, message_id } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("Gemini_PAID_pro");
    
    if (!GEMINI_API_KEY) {
      return Response.json({ 
        needs_api_key: true,
        error: 'Gemini API kľúč nie je nastavený' 
      }, { status: 400 });
    }

    // Handle suggestion approval
    if (action === 'approve_suggestion') {
      // Log approval and potentially trigger automated implementation
      await base44.asServiceRole.entities.MarketingBrain.create({
        category: 'AI_Approved_Strategy',
        content_text: `[${new Date().toISOString()}] Schválené: ${suggestion.title} - ${suggestion.description}`,
        urgency_level: suggestion.impact_score ? Math.round(suggestion.impact_score / 10) : 5,
        active: true
      });

      return Response.json({ 
        success: true,
        message: 'Stratégia schválená a zapísaná do know-how' 
      });
    }

    // AUTOMATIC DATA COLLECTION - AI má prístup ku všetkému
    console.log('🤖 AI Marketér zbiera dáta...');

    const [sessions, domy, dopyty, insights, brainRules, competitors, postQueue, campaigns, gtmData] = await Promise.all([
      base44.asServiceRole.entities.UserSession.list('-created_date', 500),
      base44.asServiceRole.entities.Dom.list(),
      base44.asServiceRole.entities.Dopyt.list('-created_date', 200),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 20),
      base44.asServiceRole.entities.MarketingBrain.list('-urgency_level', 50),
      base44.asServiceRole.entities.CompetitorWatch.list('-engagement_score', 20),
      base44.asServiceRole.entities.SocialPostQueue.filter({ status: 'Queued' }),
      base44.asServiceRole.entities.CampaignPerformance.list('-created_date', 10),
      base44.asServiceRole.functions.invoke('getGTMDataForAI').then(r => r.data.snapshot).catch(() => null)
    ]);

    // Calculate key metrics
    const totalSessions = sessions.length;
    const conversions = dopyty.length;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions * 100).toFixed(2) : 0;

    // Top houses
    const domVisits = {};
    sessions.forEach(s => {
      s.dom_interactions?.forEach(interaction => {
        domVisits[interaction.dom_id] = (domVisits[interaction.dom_id] || 0) + 1;
      });
    });
    const topDomy = Object.entries(domVisits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const dom = domy.find(d => d.id === id);
        return dom ? { nazov: dom.nazov, views: count, cena: dom.zakladna_cena } : null;
      })
      .filter(Boolean);

    // Recent insights summary
    const recentInsightsText = insights.slice(0, 3).map(i => 
      `- ${i.dom_nazov}: ${i.celkovy_zajem?.pocet_zobrazeni || 0} zobrazení, ${i.celkovy_zajem?.miera_konverzie?.toFixed(2) || 0}% konverzia`
    ).join('\n');

    // Chat history context
    const historyContext = chat_history && chat_history.length > 0 
      ? `\n\n📚 HISTÓRIA KONVERZÁCIE:\n${chat_history.map(m => `${m.role === 'user' ? 'Ty' : 'Ja'}: ${m.content}`).join('\n')}`
      : '';

    const prompt = `Si senior AI marketingový partner pre American Living (modulárne domy). 
Nie si len nástroj - si živý kolega s ktorým sa dá komunikovať, diskutovať a plánovať stratégiu.

🎯 TVOJA ÚLOHA:
- Analyzuj dáta v reálnom čase
- Navrhuj konkrétne stratégie
- Zdôvodni svoje rozhodnutia
- Ukáž svoj myšlienkový proces
- Buď proaktívny a kreatívny

📊 AKTUÁLNE DÁTA (REAL-TIME):
Sessions: ${totalSessions}
Konverzie: ${conversions} (${conversionRate}%)
Top 5 domov: 
${topDomy.map(d => `  - ${d.nazov}: ${d.views} zobrazení, ${d.cena}€`).join('\n')}

GTM Data: ${gtmData ? `
  - Hot price range: ${gtmData.hot_price_range}
  - Mobile: ${gtmData.marketing_insights.mobile_percentage}%
  - Bounce: ${gtmData.marketing_insights.bounce_rate}%
  - Explorers: ${gtmData.behavioral_profiles.explorers}
  - Deciders: ${gtmData.behavioral_profiles.deciders}
` : 'Nedostupné'}

Recent Marketing Insights:
${recentInsightsText}

Know-How Rules: ${brainRules.length} pravidiel
Konkurencia: ${competitors.length} konkurentov
Fronta príspevkov: ${postQueue.length} príspevkov
Campaigns: ${campaigns.length} kampaní
${historyContext}

💬 OTÁZKA/POŽIADAVKA UŽÍVATEĽA:
"${user_message}"

---

TVOJA ODPOVEĎ (JSON):
{
  "thinking_process": "Tu ukáž svoj myšlienkový proces - ako analyzuješ dáta, čo si všimneš, aké vzory vidíš",
  "response": "Hlavná odpoveď - priateľsky, ale profesionálne. Používaj emotikonmi. Buď konkrétny a akčný.",
  "suggestions": [
    {
      "id": "unique_id",
      "type": "Facebook Post / Google Ads / Email Campaign / Blog / Strategy",
      "title": "Krátky názov návrhu",
      "description": "Detailný popis čo urobiť",
      "reasoning": "Prečo je toto dobrý nápad na základe dát",
      "impact_score": 0-100
    }
  ],
  "data_sources": ["Sessions", "GTM Data", "Insights", ...]
}

PRAVIDLÁ:
- Vždy ukáž thinking_process
- Navrhuj 1-3 konkrétne stratégie v suggestions
- Buď kreatívny ale dátami podložený
- Odkazuj na konkrétne čísla z dát
- Používaj slovenčinu s emotikonmi`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);

    // Generate unique IDs for suggestions if not present
    if (aiResponse.suggestions) {
      aiResponse.suggestions = aiResponse.suggestions.map((s, idx) => ({
        ...s,
        id: s.id || `suggestion_${Date.now()}_${idx}`
      }));
    }

    return Response.json({
      success: true,
      response: aiResponse.response,
      thinking_process: aiResponse.thinking_process,
      suggestions: aiResponse.suggestions || [],
      data_sources: aiResponse.data_sources || []
    });

  } catch (error) {
    console.error('AI Marketing Chat error:', error);
    return Response.json({ 
      error: error.message,
      fallback_response: '🤖 Ospravedlňujem sa, mal som technický problém. Skús to prosím znova.'
    }, { status: 500 });
  }
});