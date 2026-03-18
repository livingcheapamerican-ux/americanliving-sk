import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * UNIFIED AI SERVICE - Centrálny mozog pre všetky AI operácie
 * Model: gemini-2.0-flash-exp (overený 26.01.2026)
 * API Key: Gemini_PAID_pro
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const API_KEY = Deno.env.get("Gemini_PAID_pro");
    if (!API_KEY) {
      return Response.json({ 
        error: 'API kľúč nie je nastavený',
        needs_setup: true 
      }, { status: 400 });
    }

    const body = await req.json();
    const { action, data } = body;

    // === METÓDA 1: ANALÝZA UX SESSIONS ===
    if (action === 'analyzeSessionUX') {
      const { sessionData } = data;

      const prompt = `Analyzuj UX session používateľa a identifikuj problémy.

SESSION DÁTA:
- Session ID: ${sessionData.session_id}
- Trvanie: ${sessionData.duration_seconds}s
- Počet kliknutí: ${sessionData.clicks_count || 0}
- Rage clicks: ${sessionData.rage_clicks?.length || 0}
- Konzolové chyby: ${sessionData.console_errors?.length || 0}
- Frustration score: ${sessionData.frustration_score || 0}/100
- Navštívené stránky: ${sessionData.pages_visited?.length || 0}
- Konverzie: ${sessionData.conversions?.length || 0}

RAGE CLICKS:
${sessionData.rage_clicks?.slice(0, 5).map(rc => 
  `- Klikol ${rc.click_count}× na: ${rc.element_selector} (${rc.element_text})`
).join('\n') || 'Žiadne'}

CONSOLE ERRORS:
${sessionData.console_errors?.slice(0, 3).map(err => 
  `- [${err.level}] ${err.message}`
).join('\n') || 'Žiadne'}

ÚLOHA: Urči sentiment a problém. Vráť JSON:
{
  "sentiment": "frustrovaný|zaujatý|neutrálny",
  "problem_summary": "Krátky text (max 100 znakov) - čo je problém",
  "recommendation": "Čo opraviť (max 150 znakov)"
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const analysis = JSON.parse(aiText);

      return Response.json({ 
        success: true, 
        analysis,
        model_used: 'gemini-2.0-flash-exp'
      });
    }

    // === METÓDA 2: GENEROVANIE MARKETINGOVEJ STRATÉGIE ===
    if (action === 'generateMarketingStrategy') {
      const { aggregatedStats } = data;

      const prompt = `Si AI Marketing Stratég pre American Living (modulárne domy).

AGREGOVANÉ ŠTATISTIKY:
- Celkové sessions: ${aggregatedStats.total_sessions || 0}
- Frustrácia (rage clicks): ${aggregatedStats.total_rage_clicks || 0}
- Console errors: ${aggregatedStats.total_errors || 0}
- Konverzie: ${aggregatedStats.total_conversions || 0}
- Konverzný pomer: ${aggregatedStats.conversion_rate || 0}%
- Najpopulárnejší dom: ${aggregatedStats.top_house || 'N/A'}
- Problematické stránky: ${aggregatedStats.problematic_pages?.join(', ') || 'Žiadne'}

TOP CHYBY:
${aggregatedStats.top_errors?.slice(0, 5).map((e, i) => 
  `${i + 1}. ${e.message} (${e.count}×)`
).join('\n') || 'Žiadne'}

ÚLOHA: Vytvor 3 KONKRÉTNE marketingové kroky na základe týchto dát.

Vráť JSON:
{
  "overall_insight": "1-2 vety o celkovej situácii",
  "actions": [
    {
      "title": "Názov kroku",
      "description": "Čo urobiť (max 200 znakov)",
      "priority": "high|medium|low",
      "expected_impact": "Aký dopad očakávame"
    }
  ]
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const strategy = JSON.parse(aiText);

      return Response.json({ 
        success: true, 
        strategy,
        model_used: 'gemini-2.0-flash-exp'
      });
    }

    return Response.json({ error: 'Neznáma akcia' }, { status: 400 });

  } catch (error) {
    console.error('AIService Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});