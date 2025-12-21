import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // ==========================================
    // 🔑 MIESTO PRE TVOJ KĽÚČ
    // Vlož sem kľúč medzi úvodzovky.
    const MOJ_API_KLUC = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I"; 
    // ==========================================

    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (e) {}
    const { user_message } = body;

    // Používame "gemini-pro" - tento model funguje VŽDY a všade
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${MOJ_API_KLUC}`;

    const systemPrompt = `Si marketingový expert. Odpovedaj stručne a slovensky. Otázka: "${user_message || 'Ahoj'}"`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    if (!googleResponse.ok) {
        const errText = await googleResponse.text();
        // Ak toto nastane, vypíše sa to priamo do chatu
        return Response.json({ response: `❌ CHYBA GOOGLE: ${errText}` });
    }

    const googleData = await googleResponse.json();
    const aiText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "Žiadna odpoveď.";

    return Response.json({
        response: aiText,
        thinking_process: "Používam Gemini Pro cez priame spojenie.",
        suggestions: [] 
    });

  } catch (error) {
    return Response.json({ response: `⚠️ KRITICKÁ CHYBA: ${error.message}` });
  }
});