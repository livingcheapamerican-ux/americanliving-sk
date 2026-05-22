import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Povolíme aj neprihláseným používateľom
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Používateľ nie je prihlásený - pokračujeme aj tak
    }

    const { message, context, history } = await req.json();

    // Načítaj všetky databázové entity pre knowledge base
    const [domy, blogy, konfigTexty, dokumenty, insights, sessions, dopyty, brainRules] = await Promise.all([
      base44.asServiceRole.entities.Dom.list().catch(() => []),
      base44.asServiceRole.entities.BlogPost.list().catch(() => []),
      base44.asServiceRole.entities.KonfiguratorText.list().catch(() => []),
      base44.asServiceRole.entities.Dokument.filter({ pre_chatbota: true }).catch(() => []),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 5).catch(() => []),
      base44.asServiceRole.entities.UserSession.list('-created_date', 30).catch(() => []),
      base44.asServiceRole.entities.Dopyt.list('-created_date', 20).catch(() => []),
      base44.asServiceRole.entities.MarketingBrain.filter({ active: true }).catch(() => [])
    ]);

    // Priprav kompaktné znalosti o domoch (len verejné)
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

    // Analýza záujmu klientov
    const topHouses = {};
    sessions.forEach(s => {
      s.dom_interactions?.forEach(i => {
        topHouses[i.dom_nazov] = (topHouses[i.dom_nazov] || 0) + 1;
      });
    });
    const topDomyNazvy = Object.entries(topHouses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nazov, count]) => `${nazov} (${count} záujemcov)`);

    const castoKladeneOtazky = dopyty.slice(0, 10)
      .map(d => d.poznamka || 'Otázka o dome')
      .join('\n');

    // FUZZY SEARCH - Nájdi dom v správe používateľa
    const findSimilarHouse = (query) => {
      const normalizeText = (text) => text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "");
      
      const normalizedQuery = normalizeText(query);
      
      // Hľadaj presný match
      let bestMatch = domy.find(d => 
        normalizeText(d.nazov).includes(normalizedQuery) ||
        normalizedQuery.includes(normalizeText(d.nazov))
      );
      
      // Ak nenašiel, skús similarity score
      if (!bestMatch) {
        const similarities = domy.map(d => {
          const houseNameNorm = normalizeText(d.nazov);
          const words = normalizedQuery.split(/\s+/);
          const matchedWords = words.filter(w => houseNameNorm.includes(w) || w.includes(houseNameNorm));
          return {
            dom: d,
            score: matchedWords.length / words.length
          };
        });
        
        const best = similarities.sort((a, b) => b.score - a.score)[0];
        if (best && best.score > 0.3) {
          bestMatch = best.dom;
        }
      }
      
      return bestMatch;
    };

    const foundHouse = findSimilarHouse(message);
    let houseContext = "";
    if (foundHouse) {
      houseContext = `
🎯🎯🎯 AUTOMATICKY DETEKOVANÝ DOM V OTÁZKE POUŽÍVATEĽA 🎯🎯🎯

POUŽÍVATEĽ SA PÝTA NA DOM: "${foundHouse.nazov}"

✅✅✅ TENTO DOM EXISTUJE V NAŠEJ PONUKE! ✅✅✅

🏠 KOMPLETNÉ INFORMÁCIE O DOME "${foundHouse.nazov}":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Názov: ${foundHouse.nazov}
🏭 Výrobca: ${foundHouse.vyrobca}
🏗️ Typ: ${foundHouse.typ_domu}
📂 Kategória: ${foundHouse.kategoria}
💰 Základná cena: ${foundHouse.zakladna_cena}€
📐 Zastavana plocha: ${foundHouse.zastavana_plocha}m²
📏 Úžitková plocha: ${foundHouse.uzitkova_plocha}m²
🛏️ Počet izieb: ${foundHouse.pocet_izieb || 'N/A'}
📦 Počet modulov: ${foundHouse.pocet_modulov || 'N/A'}
⭐ Populárny: ${foundHouse.popularny ? 'ÁNO' : 'NIE'}
🔥 Celoro čný: ${foundHouse.celorocny ? 'ÁNO - má A0 certifikát' : 'NIE - rekreačná stavba'}
🌡️ Energetický certifikát: ${foundHouse.energeticky_certifikat ? 'ÁNO (A0)' : 'NIE'}

📝 Popis: ${foundHouse.popis?.substring(0, 500) || 'N/A'}
⚙️ Špecifikácia: ${foundHouse.specifikacia?.substring(0, 500) || 'N/A'}

🔗 Priamy link: https://americanliving.sk/dom/${foundHouse.slug}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;
    }

    // Systémový prompt pre AI asistenta
    const systemPrompt = `Si AI KONZULTANT pre American Living - distribútor modulárnych a montovaných domov.

🎯 TVOJA ÚLOHA:
Pomáhať zákazníkom nájsť ideálny dom, vysvetliť konfigurátor, kalkulovať hypotéku, poradiť s pozemkom, materiálmi a legislatívou.
Komunikuj slušne, priateľsky, moderne a odborne. Klientom VŽDY vykaj.
Odpovede píš prehľadne, používaj odrážky a tučné písmo. Buď proaktívny a VŽDY informuj klienta, že odpovedáme okamžite a sme tu pre neho online 24/7.

📚 DATABÁZA DOMOV (${domyKnowledge.length} modelov):
${JSON.stringify(domyKnowledge, null, 2)}

🏆 TOP 5 NAJSLEDOVANEJŠÍCH DOMOV:
${topDomyNazvy.join('\n')}

❓ ČASTO KLADENÉ OTÁZKY KLIENTOV:
${castoKladeneOtazky}

📖 BLOGY A ČLÁNKY:
${JSON.stringify(blogyKnowledge.slice(0, 10), null, 2)}

🛠️ KONFIGURÁTOR TEXTY:
${JSON.stringify(konfigKnowledge.slice(0, 30), null, 2)}

📄 KĽÚČOVÉ DOKUMENTY:
${JSON.stringify(dokumentyKnowledge, null, 2)}

🧠 MARKETING KNOW-HOW:
${brainRules.map(r => `[${r.category}] ${r.content_text}`).join('\n').substring(0, 1000)}

📊 REAL-TIME DÁTA:
- Celkovo záujemcov: ${sessions.length}
- Dopytov za posledných 7 dní: ${dopyty.length}
- Marketing insights: ${insights.length} analýz

${houseContext}

⚠️ MATERIÁLY A TECHNOLÓGIE DOMOV:
- TICAB HOUSE: Nosná konštrukcia z certifikovaných sušených KVH hranolov. Výborná izolácia z minerálnej vlny, trojsklo, fasáda a interiér zo smrekového obkladu. Dodáva sa ako kompletne hotový modul s rozvodmi a hotovými stenami.
- PROSTO HOUSE: Využíva moderný systém SIP panelov (Structural Insulated Panels) alebo masívnych CLT panelov (Cross Laminated Timber). Ponúka mimoriadnu tepelnú izoláciu bez tepelných mostov, vysokú pevnosť, požiarnu odolnosť a veľmi rýchlu výstavbu (steny sú prefabrikované).
- A0 ENERGETICKÝ ŠTANDARD: Pre celoročné rodinné domy je potrebná inštalácia tepelného čerpadla, riadeného vetrania s rekuperáciou a zosilnenej tepelnej izolácie.

🛠️ AKO POSKLADAŤ DOM NA KĽÚČ V KONFIGURÁTORE (NÁVOD KROK ZA KROKOM):
Vysvetli klientovi, že dom na kľúč si navolí nasledovne:
1. Výber modelu: Zvoliť si veľkosť a typ domu (napr. Washington, Madison, Ticab, Prosto). Prosto House začína ako hrubá stavba (shell), Ticab House obsahuje aj vnútorné obklady.
2. Voľba zateplenia / A0 štandardu: Zvoliť rodinný dom A0 pre celoročné bývanie (tepelné čerpadlo, rekuperácia, A0 zosilnené steny).
3. Určenie základov: Zvoliť spodnú stavbu (zemné vruty alebo betónovú základovú dosku/pásy).
4. Doprava a montáž: Navoliť montáž.
5. Inžiniering: Pridať stavebné povolenia a projekty.

⚠️ KRITICKÉ PRAVIDLÁ PRE CELE CENY NA KĽÚČ:
VŽDY, keď klient chcie cenu domu na kľúč, sčítaj nasledovné položky a vypočítaj finálnu sumu:

1. TICAB HOUSE (Cena na kľúč):
   - Základná cena domu (podľa modelu v DB)
   - Spodná stavba (Betónové pásy): +11 825 € (prípadne lacnejšie zemné vruty)
   - A0 energetický upgrade (Tepelné čerpadlo + rekuperácia + hrubšia izolácia): +18 000 € (ak chce celoročné bývanie/rodinný dom)
   - Stavebné projekty & Legislatíva (Inžiniering): +6 000 €
   - Montáž: 0 € (je v cene)
   - Doprava: Naceňuje sa individuálne podľa vzdialenosti (Kexo by mal požiadať o PSČ/obec a ponúknuť overenie u živého predajcu).

2. PROSTO HOUSE (Cena na kľúč):
   - Základná cena domu (podľa modelu v DB - u Prosto je to len konštrukcia/hrubá stavba!)
   - Montáž na pozemku: +13 000 €
   - Spodná stavba (Betónová základová doska/pásy): +8 000 €
   - Inžinierske siete a prípojky: +10 000 €
   - Dokončenie interiéru (na kľúč - podlahy, sanita, dvere): +12 000 € až 20 000 € (podľa veľkosti modelu)
   - Stavebné projekty & Legislatíva (Inžiniering): +5 000 €
   - Doprava: 0 € (ZADARMO po celom Slovensku)

3. HYPOTÉKA:
   ❌ Rekreačná stavba / Mobilný dom bez pevného spojenia so zemou a A0 = BEZ HYPOTÉKY
   ✅ Rodinný dom A0 (skolaudovaný s súpisným číslom) = HYPOTÉKA JE MOŽNÁ (Kexo prepočíta splátku, odporučí hypotekárny kalkulátor).

4. POUŽÍVAJ LEN SKUTOČNÉ NÁZVY Z DB:
   📋 KOMPLETNÝ ZOZNAM VŠETKÝCH ${domyKnowledge.length} DOSTUPNÝCH DOMOV:
   ${domyKnowledge.map(d => `• ${d.nazov} (${d.vyrobca}, ${d.cena}€, ${d.plocha}m²)`).join('\n   ')}
   
   ⚠️ ABSOLÚTNE KRITICKÉ PRAVIDLÁ:
     "action": "fill_form",
     "form_data": {
       "meno": "...",
       "email": "...",
       "telefon": "...",
       "poznamka": "..."
     }
   }

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

    // Volaj Gemini 2.0 Flash (rovnaký model ako Marketing Director)
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

    const startTime = Date.now();
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );
    const apiCallDuration = Date.now() - startTime;

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

    // Vypočítať náklady
    const estimatedTokens = Math.ceil(fullPrompt.length / 4);
    const costPer1MTokens = 0.00025;
    const estimatedCost = (estimatedTokens / 1000000) * costPer1MTokens;

    return Response.json({
      response: llmResponse.response || "Prepáč, nerozumiem. Skús sa opýtať inak.",
      suggestion: llmResponse.suggestion || null,
      action: llmResponse.action || "explain",
      model_used: 'gemini-2.0-flash',
      api_call_duration_ms: apiCallDuration,
      estimated_cost_eur: estimatedCost.toFixed(6)
    });

  } catch (error) {
    console.error('AI Asistent Error:', error);
    return Response.json({ 
      response: "Prepáč, momentálne nemôžem odpovedať. Skús to prosím neskôr.",
      error: error.message 
    }, { status: 500 });
  }
});