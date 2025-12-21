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

    // ZMENA: Používame "gemini-1.5-flash" - toto je aktuálny kráľ stability
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MOJ_API_KLUC}`;

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
        return Response.json({ response: `❌ CHYBA GOOGLE (Skús iný model): ${errText}` });
    }

    const googleData = await googleResponse.json();
    const aiText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "Žiadna odpoveď.";

    return Response.json({
        response: aiText,
        thinking_process: "Bežím na Gemini 1.5 Flash ⚡",
        suggestions: [] 
    });

  } catch (error) {
    return Response.json({ response: `⚠️ KRITICKÁ CHYBA: ${error.message}` });
  }
});