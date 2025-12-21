import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI MARKETINGOVÝ RIADITEĽ - FINAL PRODUCTION VERSION
 * Model: gemini-2.0-flash (Generácia 2)
 */
Deno.serve(async (req) => {
  try {
    // =================================================================
    // 🔑 VÁŠ API KĽÚČ (Už vložený):
    const API_KEY = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    // =================================================================

    // 1. Inicializácia a príprava dát
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    let body = {};
    try { body = await req.json(); } catch (e) {}

    const { user_message, chat_history, monthly_budget, action } = body;

    // Handling approval action
    if (action === 'approve_suggestion') {
      const { suggestion } = body;
      await base44.asServiceRole.entities.MarketingHistory.create({
        action_type: 'campaign_approved',
        title: suggestion.title,
        description: suggestion.description,
        data: suggestion,
        budget_allocated: suggestion.budget_allocation,
        user_email: user?.email,
        status: 'completed'
      });
      return Response.json({ success: true });
    }

    // 2. Zber dát o firme (Aby AI nevarila z vody)
    // Sťahujeme zoznam domov, posledné insighty, konkurenciu a históriu
    const [domy, insights, competitors, sessions, history] = await Promise.all([
      base44.asServiceRole.entities.Dom.list().catch(() => []),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 5).catch(() => []),
      base44.asServiceRole.entities.CompetitorWatch.list('-engagement_score', 3).catch(() => []),
      base44.asServiceRole.entities.UserSession.list('-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.MarketingHistory.list('-created_date', 20).catch(() => [])
    ]);

    // 3. Vytvorenie kontextu pre AI (System Prompt)
    const dataContext = `
    📊 LIVE DÁTA FIRMY (American Living):
    - Domy v ponuke: ${domy.length > 0 ? domy.map(d => d.nazov).join(', ') : 'Zoznam sa načítava'}
    - Návštevnosť webu (vzorka): ${sessions.length} sessions
    - Posledné marketingové zistenia: ${insights.map(i => i.summary).join('; ')}
    - Hlavná konkurencia: ${competitors.map(c => c.competitor_name).join(', ')}
    - Rozpočet na tento mesiac: ${monthly_budget || 1000} EUR

    📜 HISTÓRIA MARKETINGOVÝCH AKCIÍ (Posledných ${history.length}):
    ${history.map(h => `[${h.created_date.split('T')[0]}] ${h.action_type}: ${h.title} - ${h.description}`).join('\n')}
    `;

    const systemPrompt = `
    Si 'AI Marketingový Riaditeľ' pre firmu American Living (montované domy).
    Tvojou úlohou je riadiť marketing, navrhovať kampane a analyzovať dáta.
    Používaš model Gemini 2.0, takže buď kreatívny, analytický a presný.

    DÁTA, KTORÉ MÁŠ K DISPOZÍCII:
    ${dataContext}

    HISTÓRIA CHATU:
    ${chat_history ? JSON.stringify(chat_history.slice(-3)) : 'Žiadna'}

    OTÁZKA UŽÍVATEĽA:
    "${user_message}"

    PRAVIDLÁ:
    1. Odpovedaj v štruktúrovanom JSON formáte (vid nižšie).
    2. V texte 'response' používaj Markdown (tučné písmo, odrážky, emotikony).
    3. Ak navrhuješ kampaň, buď konkrétny (presné cielenie, texty reklám).
    4. Hovoriš po slovensky, profesionálne ale dynamicky.
    5. VŽDY kontroluj históriu akcií - neopakuj to čo už bolo urobené!
    6. Pri plánovaní zohľadni predchádzajúce kampane a stratégie.

    POŽADOVANÝ VÝSTUP (JSON):
    {
      "thinking_process": "Tvoja krátka interná analýza situácie...",
      "response": "Tvoja hlavná odpoveď pre užívateľa (sem napíš text, návody, stratégie...)",
      "suggestions": [
         { "title": "Názov akcie", "description": "Krátky popis čo urobiť" }
      ]
    }
    `;

    // 4. PRIAME VOLANIE GOOGLE (Bypass cez Gemini 2.0 Flash)
    // Používame model zo zoznamu: gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json" // Vynútime JSON odpoveď
        }
      })
    });

    // 5. Kontrola chýb
    if (!googleResponse.ok) {
        const errText = await googleResponse.text();
        throw new Error(`Google API Error (${googleResponse.status}): ${errText}`);
    }

    // 6. Spracovanie a odoslanie odpovede
    const data = await googleResponse.json();
    let aiContent = { response: "Ospravedlňujem sa, nerozumel som." };

    try {
        // Gemini 2.0 vracia text, ktorý je JSON string. Musíme ho parsovať.
        const textResponse = data.candidates[0].content.parts[0].text;
        aiContent = JSON.parse(textResponse);
    } catch (e) {
        // Fallback ak AI nevráti čistý JSON
        aiContent = { 
            response: data.candidates[0].content.parts[0].text,
            thinking_process: "Raw text mode"
        };
    }

    // Pridáme info o modeli pre istotu
    return Response.json({
        ...aiContent,
        model_used: 'gemini-2.0-flash'
    });

  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    return Response.json({
        response: `⚠️ **Technický problém:**\n${error.message}\n\nSkús to prosím znova, bol to len chvíľkový výpadok spojenia.`,
        success: false
    });
  }
});