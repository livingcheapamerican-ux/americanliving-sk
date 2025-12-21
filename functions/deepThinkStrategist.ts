import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API key is set
    const apiKey = Deno.env.get("Gemini_PAID_pro");
    if (!apiKey) {
      return Response.json({ 
        error: '⚠️ Pre DeepThink analýzu vložte prosím API kľúč v nastaveniach.',
        needs_api_key: true
      }, { status: 400 });
    }

    // 1. Získaj posledných 50 dopytov
    const dopyty = await base44.asServiceRole.entities.Dopyt.list('-created_date', 50);
    const dopytTexty = dopyty.map(d => ({
      text: d.poznamka || d.typ_dopytu,
      email: d.email,
      telefon: d.telefon
    }));

    // 2. Získaj sessions pre analýzu záujmov
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 200);
    
    // Analýza domov - ktoré modely sú trendy
    const domInterests = {};
    sessions.forEach(s => {
      s.dom_interactions?.forEach(interaction => {
        const domId = interaction.dom_id;
        const domNazov = interaction.dom_nazov;
        if (!domInterests[domId]) {
          domInterests[domId] = { nazov: domNazov, count: 0 };
        }
        domInterests[domId].count++;
      });
    });

    const topDomy = Object.entries(domInterests)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => `${data.nazov} (${data.count} zobrazení)`);

    // 3. Získaj náhodné 3 pravidlá z MarketingBrain
    const allBrainRules = await base44.asServiceRole.entities.MarketingBrain.filter({ active: true });
    const randomRules = allBrainRules
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(r => `[${r.category}] ${r.content_text}`);

    // 4. Získaj posledné záznamy konkurencie
    const competitors = await base44.asServiceRole.entities.CompetitorWatch.list('-created_date', 5);
    const competitorInsights = competitors.map(c => 
      `${c.competitor_name}: "${c.post_content.substring(0, 100)}..." → ${c.why_it_worked} (Trigger: ${c.psychological_trigger})`
    );

    // 5. Vypočítaj engagement metriky
    const totalSessions = sessions.length;
    const conversions = sessions.filter(s => s.conversions?.length > 0).length;
    const conversionRate = totalSessions > 0 ? ((conversions / totalSessions) * 100).toFixed(2) : 0;
    const avgEngagement = sessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / totalSessions;
    const bouncedSessions = sessions.filter(s => s.session_tags?.includes('bounced') || s.session_tags?.includes('odrazeny'));
    const bounceRate = totalSessions > 0 ? ((bouncedSessions.length / totalSessions) * 100).toFixed(1) : 0;

    // 6. Analýza obáv a túžob z dopytov
    const dopytAnalysisPrompt = `Analyzuj tieto správy od klientov a vypi 3 najčastejšie obavy alebo túžby:

${dopytTexty.slice(0, 20).map((d, i) => `${i + 1}. ${d.text}`).join('\n')}

Odpoveď vo formáte:
1. [Obava/Túžba]
2. [Obava/Túžba]
3. [Obava/Túžba]`;

    const dopytAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: dopytAnalysisPrompt
    });

    // 7. Hlavná strategická analýza (s Chain of Thought)
    const strategicPrompt = `Si senior marketingový stratég pre firmu American Living, ktorá predáva modulárne domy.

🧠 CHAIN OF THOUGHT REASONING:
Predtým, než navrhneš riešenie, krok za krokom analyzuj problém:
1. Zváž psychológiu slovenského zákazníka (obavy, túžby)
2. Uvažuj o sezónnosti a aktuálnom období
3. Simuluj v hlave 3 rôzne marketingové scenáre
4. Vyber ten najlepší na základe dát z MarketingKnowHow
5. Vysvetli PREČO si sa takto rozhodol

📊 AKTUÁLNE DÁTA:
- Celkový počet sessions: ${totalSessions}
- Konverzný pomer: ${conversionRate}%
- Priemerné zapojenie: ${avgEngagement.toFixed(1)}
- Bounce rate: ${bounceRate}%
- Počet dopytov: ${dopyty.length}

🏆 TOP 5 NAJSLEDOVANEJŠÍCH DOMOV:
${topDomy.join('\n')}

💡 NAŠE KNOW-HOW (Pravidlá, ktoré MUSÍŠ dodržiavať):
${randomRules.join('\n')}

👀 ČO FUNGUJE KONKURENCII:
${competitorInsights.join('\n')}

😰 OBAVY/TÚŽBY KLIENTOV:
${dopytAnalysis}

---

TVOJA ÚLOHA: Vytvor "DENNÝ STRATEGICKÝ BRÍFING" (max 400 slov), ktorý obsahuje:

1. 🎯 SITUAČNÁ ANALÝZA (2-3 vety)
   - Čo vidíš v dátach? Kde strácame ľudí?

2. 💎 HLAVNÉ ODPORÚČANIE (konkrétne!)
   - Ktorý model domu propagovať DNES a PREČO
   - Aký typ obsahu vytvoriť (video/foto/text)
   - Na akej platforme (Facebook/Instagram/TikTok)

3. 🧠 PSYCHOLOGICKÁ STRATÉGIA
   - Aký princíp použiť (AIDA, Social Proof, Scarcity...)
   - Ako osloviť obavy klientov

4. 📝 KONKRÉTNY NÁVRH TEXTU
   - Napíš 1 ukážkový príspevok (max 150 znakov) s emotikonmi

5. 💰 ROZPOČET
   - Ak máme 500€ mesačne, koľko dnes minúť a kam

DÔLEŽITÉ:
- Buď priamy, akčný, bez zbytočných slov
- Používaj emotikonmi
- Odkazuj sa na naše know-how pravidlá
- Na konci pridaj sekciu: "🧠 PREČO SOM SA TAKTO ROZHODOL?" (vysvetlenie reasoning procesu)
- Slovenčina`;

    let strategicBriefing;

    // Použij Gemini 1.5 Flash pre stabilné reasoning
    const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: strategicPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        strategicBriefing = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Chyba pri generovaní';
      } else {
        const errorData = await geminiResponse.text();
        throw new Error(`Gemini API Error: ${errorData}`);
      }

    return Response.json({
      success: true,
      briefing: strategicBriefing,
      client_concerns: dopytAnalysis,
      model_used: 'gemini-1.5-flash',
      deep_reasoning: true,
      metrics: {
        totalSessions,
        conversionRate,
        bounceRate,
        avgEngagement: avgEngagement.toFixed(1),
        topHouses: topDomy
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deep Think Strategist Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});