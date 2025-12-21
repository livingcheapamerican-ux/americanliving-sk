import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context, history } = await req.json();

    // Načítaj všetky databázové entity pre knowledge base
    const [domy, blogy, konfigTexty, dokumenty] = await Promise.all([
      base44.asServiceRole.entities.Dom.list(),
      base44.asServiceRole.entities.BlogPost.list(),
      base44.asServiceRole.entities.KonfiguratorText.list(),
      base44.asServiceRole.entities.Dokument.filter({ pre_chatbota: true })
    ]);

    // Priprav kompaktné znalosti o domoch
    const domyKnowledge = domy.filter(d => d.verejny !== false).map(d => ({
      nazov: d.nazov,
      vyrobca: d.vyrobca,
      typ: d.typ_domu,
      kategoria: d.kategoria,
      plocha: d.zastavana_plocha,
      uzitkova: d.uzitkova_plocha,
      izby: d.pocet_izieb,
      moduly: d.pocet_modulov,
      cena: d.zakladna_cena,
      popis: d.popis?.substring(0, 500),
      a0: d.energeticky_certifikat
    }));

    // Priprav kompaktné znalosti o blogoch
    const blogyKnowledge = blogy.filter(b => b.publikovany).map(b => ({
      nazov: b.nazov,
      perex: b.perex,
      kategoria: b.kategoria,
      tagy: b.tagy
    }));

    // Priprav kompaktné znalosti o konfigurátoroch
    const konfigKnowledge = konfigTexty.map(k => ({
      vyrobca: k.vyrobca,
      polozka: k.polozka_id,
      nazov: k.nazov,
      popis: k.dlhy_popis
    }));

    // Priprav kompaktné znalosti z dokumentov
    const dokumentyKnowledge = dokumenty.map(d => ({
      nazov: d.nazov,
      typ: d.typ,
      vyrobca: d.vyrobca,
      zhrnutie: d.zhrnutie || d.ai_generovany_popis,
      klucove_info: d.klúčové_informácie
    })).slice(0, 20);

    // Systémový prompt pre AI asistenta
    const systemPrompt = `Si AI KONZULTANT pre American Living - distribútor modulárnych a montovaných domov.

🎯 TVOJA ÚLOHA:
Pomáhať zákazníkom nájsť ideálny dom, vysvetliť konfigurátor, kalkulovať hypotéku, poradiť s pozemkom a legislatívou.

📚 DATABÁZA DOMOV (${domyKnowledge.length} modelov):
${JSON.stringify(domyKnowledge, null, 2)}

📖 BLOGY A ČLÁNKY:
${JSON.stringify(blogyKnowledge.slice(0, 10), null, 2)}

🛠️ KONFIGURÁTOR TEXTY:
${JSON.stringify(konfigKnowledge.slice(0, 30), null, 2)}

📄 KĽÚČOVÉ DOKUMENTY:
${JSON.stringify(dokumentyKnowledge, null, 2)}

⚠️ KRITICKÉ PRAVIDLÁ:

1. HYPOTÉKA:
   ❌ Rekreačná stavba = BEZ HYPOTÉKY
   ❌ Mobilný dom = BEZ HYPOTÉKY
   ✅ Rodinný dom A0 = HYPOTÉKA OK

2. VÝPOČET CENY NA KĽÚČ:
   
   TICAB HOUSE:
   • Rekreačná = zakladna_cena (INCLUDED: doprava, montáž)
   • Rodinný A0 = zakladna_cena + pásy (11 825€) + A0 upgrade (~18 000€) + legislatíva (6 000€)
   
   PROSTO HOUSE:
   • Základ = zakladna_cena (LEN KONŠTRUKCIA, A0 included)
   • Na kľúč = zakladna_cena + základy (8k€) + montáž (13k€) + prípojky (10k€) + legislatíva (5k€)

3. POUŽÍVAJ LEN SKUTOČNÉ NÁZVY Z DB:
   ❌ "Ticab Family L3" - NEEXISTUJE
   ✅ "${domyKnowledge[0]?.nazov}" - SKUTOČNÝ DOM

4. REALISTICKÉ CENY:
   • Vždy počítaj S ZÁKLADAMI
   • Vždy počítaj S A0 ak rodina
   • Vždy počítaj S LEGISLATÍVOU

5. ODPORÚČANIA:
   • Vypočítaj cenu kompletne
   • Porovnaj 2-3 vhodné modely
   • Vysvetli rozdiely
   • Upozorni na hypotéku ak potrebná

KONTEXT: ${context}

Odpovedaj v slovenčine, priateľsky, stručne, s emoji.`;

    // Priprav históriu pre LLM
    const conversationHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Volaj Gemini API (rovnaký model ako Marketing Director)
    const GEMINI_API_KEY = Deno.env.get("Gemini_PAID_pro");
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const fullPrompt = `${systemPrompt}

HISTÓRIA KONVERZÁCIE:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

NOVÁ SPRÁVA OD POUŽÍVATEĽA:
${message}

Odpovedz na používateľovu správu. Ak ide o pomoc s formulárom, navrhni konkrétne hodnoty.

VÝSTUP (JSON):
{
  "response": "tvoja odpoveď pre používateľa",
  "suggestion": "konkrétny návrh ak relevantné",
  "action": "fill_form / navigate / explain"
}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await geminiResponse.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let llmResponse;
    
    try {
      llmResponse = JSON.parse(textResponse);
    } catch {
      llmResponse = { response: textResponse };
    }

    return Response.json({
      response: llmResponse.response || "Prepáč, nerozumiem. Skús sa opýtať inak.",
      suggestion: llmResponse.suggestion || null,
      action: llmResponse.action || "explain",
      model_used: 'gemini-pro'
    });

  } catch (error) {
    console.error('AI Asistent Error:', error);
    return Response.json({ 
      response: "Prepáč, momentálne nemôžem odpovedať. Skús to prosím neskôr.",
      error: error.message 
    }, { status: 500 });
  }
});