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
      a0: d.energeticky_certifikat,
      konfigurator_ceny: d.konfigurator_ceny || null,
      konfigurator_custom_ceny_prosto_house: d.konfigurator_custom_ceny_prosto_house || null,
      prosto_house_kod: d.prosto_house_kod || null
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
🔥 Celoročný: ${foundHouse.celorocny ? 'ÁNO - má A0 certifikát' : 'NIE - rekreačná stavba'}
🌡️ Energetický certifikát: ${foundHouse.energeticky_certifikat ? 'ÁNO (A0)' : 'NIE'}

📝 Popis: ${foundHouse.popis?.substring(0, 500) || 'N/A'}
⚙️ Špecifikácia: ${foundHouse.specifikacia?.substring(0, 500) || 'N/A'}

- konfigurator_ceny (Ticab): ${JSON.stringify(foundHouse.konfigurator_ceny || {}, null, 2)}
- konfigurator_custom_ceny_prosto_house (Prosto): ${JSON.stringify(foundHouse.konfigurator_custom_ceny_prosto_house || {}, null, 2)}
`;
    }

    // Systémový prompt pre AI asistenta
    const systemPrompt = `Si AI KONZULTANT pre American Living - distribútor modulárnych a montovaných domov.

🎯 TVOJA ÚLOHA:
Pomáhať zákazníkom nájsť ideálny dom, vysvetliť konfigurátor, kalkulovať hypotéku, poradiť s pozemkom, materiálmi a legislatívou.
Komunikuj slušne, priateľsky, moderne a odborne. Klientom VŽDY vykaj.
Odpovede píš prehľadne, používaj odrážky a tučné písmo. Buď proaktívny a VŽDY informuj klienta, že odpovedáme okamžite a sme tu pre neho online 24/7.

📖 OFICIÁLNE FIREMNÉ KNOW-HOW & ŠTANDARDY:

1. MODULÁRNE DOMY TICABHOUSE:
   - Spoločnosť Ticabhouse je popredným výrobcom prefabrikovaných drevených modulárnych domov od roku 2008.
   - Výroba domu prebieha v uzavretej hale bez ohľadu na počasie za približne 6-8 týždňov.
   - Domy sú dodávané po celej EÚ v úplne dokončenom stave. Po doručení na pozemok žeriav vyloží dom za 1 deň.
   - Konštrukcia: Rámová drevená konštrukcia (timber frame) preverená v náročných škandinávskych a kanadských podmienkach. Používa sa suché kalibrované drevo ošetrené bio-roztokom proti škodcom a hnilobe. Všetky použité drevené materiály spĺňajú ekologickú triedu E1.
   - Izolácia: Výhradne čadičová/minerálna bazaltová vlna (basalt rock wool). Štandardná hrúbka izolácie je 150 mm v stenách, strop a podlaha majú 150-200 mm skompresovanú izoláciu. Pre splnenie A0 energetickej triedy je izolácia stien a stropov zosilnená na 250 mm. Obsahuje difúzne a parotesné fólie pre reguláciu vlhkosti.
   - Okná: Dvojkomorové kovoplastové okná (trojsklo), laminované s vysokými tepelnoizolačnými vlastnosťami.
   - Vonkajšie úpravy: Termodrevo (thermo-wood), škandinávsky smrek natretý Tikkurila farbami, alebo vinylové panely, prípadne kombinácia dreva a kompozitných panelov.
   - Vnútorné úpravy: Sadrokartón s tapetou/maľovkou alebo obklad z prírodného dreva (smrek/borovica). Podlahy z vysokokvalitného laminátu v izbách, dlažba v kúpeľni.
   - Pripojenie na sieť: Predpripravené rozvody vody (PE 25mm), elektroinštalácia (ističe, ochrana, vlastná skriňa pre každý modul), kanalizácia (100mm vyústenie).
   - Kúrenie: Podlahové vykurovanie (elektrické fólie pod laminátom / káble v kúpeľni), prípadne konvektory alebo klimatizácia.
   - Základy: Pilótové (zemné skrutky/betónové pätky) alebo klasické pásové základy. Výrobca dodáva odporúčaný plán základov.
   - Výhody: Domy sú plne mobilné (relocateable), dajú sa presunúť na iný pozemok kedykoľvek v budúcnosti. Ceny sú priamo od výrobcu bez navýšenia.

2. MONTOVANÉ DOMY PROSTOHOUSE:
   - Výrobca moderných energeticky úsporných montovaných rámových domov s fínskou stavebnou technológiou.
   - ⚠️ Upozornenie: Nepoužívajú sa ŽIADNE SIP panely ani CLT panely! Ide výhradne o stĺpikovú drevenú rámovú konštrukciu (timber-frame system) zo sušeného a kalibrovaného ihličnatého dreva (najčastejšie borovicové dosky 145x45 mm) ošetreného retardérmi horenia a antiseptikami.
   - Izolácia: Výhradne čadičová (bazaltová) vlna do hrúbky 150 mm v obvodových stenách a streche (200 mm v podlahe). Možnosť navýšenia na 250 mm (Premium) alebo až 300 mm (Ultra) pre špičkovú energetickú úsporu a protipožiarnu odolnosť.
   - Konštrukčné prvky: OSB dosky (12 mm steny, 22 mm podlaha), difúzne membrány (napr. Strotex 1300), parozábrany (Strotex AL90). Ochranná sieťka proti hlodavcom v podlahe.
   - Vonkajšie úpravy: Drevený obklad (imitácia hranolu, sibírsky smrekovec) alebo moderná falcovaná plechová fasáda, prípadne omietnutá šúchaná omietka (render facade) pre vzhľad murovaného domu.
   - Vnútorné úpravy: Dosky Fermacell alebo sadrokartón, prípadne drevený obklad.
   - Okná a dvere: PVC 5-komorové profily s 3-sklom a ochrannou vrstvou (Solar coating) pre optimalizáciu tepelných ziskov.
   - Stavebnica: Základná cena Prosto House modelov zahŕňa sadu domu (kit) pre svojpomocnú montáž na pozemku. V konfigurátore si klient vyberá príplatok za montáž (zmontovanie hrubej stavby trvá cca 1-2 týždne bez žeriavu), základy, dokončenie interiéru, siete a technológie.
   - Doprava: Doprava po celom Slovensku je úplne ZADARMO!

3. KOMPLEXNÉ SLUŽBY AMERICAN LIVING s.r.o. ("VŠETKO POD JEDNOU STRECHOU"):
   American Living s.r.o. poskytuje klientom 8 kľúčových komplexných služieb na kľúč:
   1. Predáme Vašu Predošlú Nehnuteľnosť.
   2. Nájdeme Vám Pozemok z Našej Ponuky.
   3. Vyberieme pre Vás Najvhodnejší Hypotekárny Úver.
   4. Pripravíme Vám Projektovú Dokumentáciu.
   5. Zabezpečíme pre Vás Stavebné Povolenie.
   6. Postaráme sa o Všetky Úradné Potvrdenia (úplný inžiniering).
   7. Postavíme Vám Dom (rýchla a kvalitná realizácia).
   8. Napojíme ho na Inžinierske Siete a Zabezpečíme Kolaudáciu.

4. LEGISLATÍVA A ENERGETICKÁ TRIEDA A0:
   - Všetky domy dodávané cez American Living s.r.o. sú plne skolaudovateľné ako rodinné domy s energetickým certifikátom A0 a je možné ich umiestniť v klasickej obytnej štvrti na stavebné povolenie.
   - Štandard A0: Pre celoročné bývanie/kolaudáciu je nutná izolácia stien a stropu min. 250 mm (strecha/šikminy až 300 mm), inštalácia tepelného čerpadla, riadeného vetrania s rekuperáciou a príprava projektu. Pre Ticab navyše: elektroinštalácia GE, bleskozvod a prepäťová ochrana.

5. FINANCOVANIE (HYPOTÉKA):
   - Chaty bez pevného základu a A0 štandardu sa nedajú financovať hypotékou.
   - Rodinné domy skolaudované na pevných základoch a v triede A0 sú plne prefinancovateľné. Ponúknite hypotekárne poradenstvo.

⚠️ DYNAMICKÝ VÝPOČET CIEN A PRÍPLATKOV Z DATABÁZY (NIKDY NEHALUCINUJ CENY!):
Pre výpočet cien a príplatkov pracuj VÝHRADNE s reálnymi dátami z polí "konfigurator_ceny" (pre Ticab) a "konfigurator_custom_ceny_prosto_house" (pre Prosto) poskytnutými v kontexte pre daný dom.

1. PRE MODELY TICAB HOUSE:
   - Základná cena: dom.zakladna_cena (alebo pole "cena").
   - Príplatky (konfigurator_ceny):
     - Montáž: 'montaz'
     - Doprava: 'doprava' (naceňuje sa individuálne, ale uveď orientačnú sumu z DB)
     - Základy: 'zaklady_pasove', 'zaklady_vruty' alebo 'zaklady_patky'
     - A0 izolácia: 'izolacia_stien_250mm' + 'izolacia_podlahy_200mm' + 'izolacia_stropu_200mm'
     - A0 technológie: 'tepelne_cerpadlo', 'rekuperacia', 'podlahove_kurenie'
     - Iné A0: 'elektro_ge', 'bleskozvod', 'prepat', 'projektACertifikacia', 'revizia', 'inziniering'
     - Úpravy: 'obklad_sadrokarton_tapeta', 'fasada_thermowood', atď.

2. PRE MODELY PROSTO HOUSE:
   - Základná cena: dom.zakladna_cena (stavebnica pre svojpomocnú montáž).
   - Vyhľadaj kód domu (napr. 'PH-007' -> kód je 'ph007') a vytiahni príplatky z poľa "konfigurator_custom_ceny_prosto_house[phCode]":
     Ak kľúč existuje v pod-objekte 'ph00X', má absolútnu prednosť! Inak použi rovnomenný kľúč z hlavnej (root) úrovne "konfigurator_custom_ceny_prosto_house".
     Príplatkové kľúče:
     - Montáž: 'mounting-1' (pod-objekt) alebo 'montaz_ano' / 'montaz' (root)
     - Základy: 'foundation-1' (skrutky/pilóty) / 'foundation-2' (doska) / 'foundation-3' (pásové)
     - A0 izolácia: 'insulation-2' (250mm / Premium) / 'insulation-3' (300mm / Ultra)
     - A0 technológie: 'addon-heatPump' (TČ) / 'addon-recuperation' (rekuperácia) / 'addon-floorHeating' (podlahové kúrenie)
     - Interiér: 'interior-1' (drevo) / 'interior-2' (sadrokartón/Fermacell) / 'addon-laminateFloors' (podlahy) / 'addon-interiorDoor' (dvere)
     - Siete a inštalácie: 'addon-electricity', 'addon-water', 'addon-sanita', 'addon-boiler'
     - Inžiniering/Projekt: 'addon-networks', 'addon-engineering', 'addon-projectant', 'addon-revision'
     - Doprava: u Prosto House je doprava po celom Slovensku ZADARMO!

📋 KOMPLETNÝ ZOZNAM VŠETKÝCH \${domyKnowledge.length} DOSTUPNÝCH DOMOV:
\${domyKnowledge.map(d => \`• \${d.nazov} (\${d.vyrobca}, \${d.cena}€, \${d.plocha}m²)\`).join('\\n')}

\${houseContext}

KONTEXT: \${context}

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