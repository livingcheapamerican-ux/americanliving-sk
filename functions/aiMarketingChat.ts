import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI Marketingový Riaditeľ - FINÁLNA VERZIA (Bypass)
 * Tento kód sa pripája priamo na Google Gemini 1.5 Flash a obchádza chyby Base44.
 */
Deno.serve(async (req) => {
  try {
    // ==========================================
    // 🔑 MIESTO PRE TVOJ KĽÚČ (Uprav len tento riadok!)
    // Vlož sem kľúč medzi úvodzovky.
    const MOJ_API_KLUC = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I"; 
    // ==========================================

    // Inicializácia Base44
    const base44 = createClientFromRequest(req);
    
    // Načítanie dát z požiadavky
    let body;
    try {
        body = await req.json();
    } catch (e) {
        body = {};
    }
    const { user_message, chat_history } = body;

    // 1. Zber dát (Zjednodušený pre rýchlosť a stabilitu)
    // Sťahujeme základné informácie o domoch a inšpiráciu
    const [domy, insights] = await Promise.all([
      base44.asServiceRole.entities.Dom.list().catch(() => []),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 5).catch(() => [])
    ]);

    // 2. Príprava kontextu pre AI
    const systemPrompt = `
    Si 'AI Marketingový Riaditeľ' pre firmu s montovanými domami.
    Tvojou úlohou je radiť s marketingom, tvoriť kampane a analyzovať dáta.
    
    AKTUÁLNE DÁTA FIRMY:
    - Počet domov v ponuke: ${domy.length} (napr. ${domy.slice(0,3).map(d => d.nazov).join(', ')})
    - Posledné marketingové insighty: ${insights.map(i => i.summary).join('; ')}
    
    Pravidlá pre teba:
    1. Odpovedaj stručne, jasne a profesionálne v slovenčine.
    2. Používaj Markdown formátovanie (tučné písmo, odrážky).
    3. Ak navrhuješ kampaň, buď konkrétny (cieľovka, texty, rozpočet).
    
    Otázka od užívateľa: "${user_message || 'Ahoj, čo pre mňa môžeš urobiť?'}"
    `;

    // 3. PRIAME SPOJENIE S GOOGLE (Obchádzame Base44 chyby)
    // Používame model Gemini 1.5 Flash - je rýchly a stabilný
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MOJ_API_KLUC}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
        }
      })
    });

    // 4. Kontrola chýb
    if (!googleResponse.ok) {
        const errText = await googleResponse.text();
        throw new Error(`Google API Chyba (${googleResponse.status}): ${errText}`);
    }

    // 5. Spracovanie odpovede
    const googleData = await googleResponse.json();
    let aiText = "Ospravedlňujem sa, nemám odpoveď.";
    
    if (googleData.candidates && googleData.candidates[0].content) {
        aiText = googleData.candidates[0].content.parts[0].text;
    }

    // 6. Odoslanie výsledku späť do chatu
    // Vraciame formát, ktorý Base44 chat očakáva
    return Response.json({
        response: aiText,
        // Tieto polia sú voliteľné, ale pomáhajú frontend zobraziť dáta
        thinking_process: "Analyzoval som dáta o domoch a trhu...",
        suggestions: [] 
    });

  } catch (error) {
    console.error("CHYBA:", error);
    // V prípade chyby vrátime chybovú hlášku do chatu, aby aplikácia nespadla
    return Response.json({
        response: `⚠️ **Technická chyba spojenia:**\n${error.message}\n\nSkontroluj prosím, či si správne vložil API kľúč do kódu.`,
        success: false
    });
  }
});