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

    const { user_message, chat_history, action, suggestion, message_id, monthly_budget } = await req.json();

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

    // Check available functions and connectors
    const availableFunctions = [
      'deepThinkStrategist', 'kreativneStudio', 'analyzujKomentare', 
      'findSlovakCompetitors', 'dailyMarketingRoutine', 'generateMarketingInsights',
      'aiCAPIOptimizer', 'sendCAPIEvent', 'getGTMDataForAI',
      'analyzujDokument', 'porovnajDokumenty', 'googleDrive',
      'uploadPDFToGoogleDrive', 'generateBlogImage', 'generateBlogSEO'
    ];

    const connectedServices = {
      google_drive: true, // Already authorized
      facebook_capi: !!Deno.env.get("FB_ACCESS_TOKEN"),
      gemini_api: !!Deno.env.get("Gemini_PAID_pro"),
      resend_email: !!Deno.env.get("RESEND_API_KEY")
    };

    console.log('📊 Začínam zbierať dáta z databázy...');
    
    let sessions, domy, dopyty, insights, brainRules, competitors, postQueue, campaigns, gtmData, documents, fotky, driveAssets, blogs, capiLogs;
    
    try {
      [sessions, domy, dopyty, insights, brainRules, competitors, postQueue, campaigns, gtmData, documents, fotky, driveAssets, blogs, capiLogs] = await Promise.all([
      base44.asServiceRole.entities.UserSession.list('-created_date', 500),
      base44.asServiceRole.entities.Dom.list(),
      base44.asServiceRole.entities.Dopyt.list('-created_date', 200),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 20),
      base44.asServiceRole.entities.MarketingBrain.list('-urgency_level', 50),
      base44.asServiceRole.entities.CompetitorWatch.list('-engagement_score', 20),
      base44.asServiceRole.entities.SocialPostQueue.filter({ status: 'Queued' }),
      base44.asServiceRole.entities.CampaignPerformance.list('-created_date', 10),
      base44.asServiceRole.functions.invoke('getGTMDataForAI').then(r => r.data.snapshot).catch(() => null),
      base44.asServiceRole.entities.Dokument.list('-created_date', 100),
      base44.asServiceRole.entities.Fotka.list('-created_date', 200),
      base44.asServiceRole.entities.MarketingAssets.filter({ active: true }),
      base44.asServiceRole.entities.BlogPost.filter({ published: true }).catch(() => []),
      base44.asServiceRole.entities.CAPILog.list('-created_date', 50).catch(() => [])
    ]);
    
    console.log('✅ Dáta získané úspešne');
    } catch (dataError) {
      console.error('❌ Chyba pri zbere dát:', dataError);
      throw new Error(`Chyba pri zbere dát: ${dataError.message}`);
    }

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

    // Documents & Assets summary
    const documentsCount = {
      total: documents.length,
      by_type: documents.reduce((acc, d) => {
        acc[d.typ] = (acc[d.typ] || 0) + 1;
        return acc;
      }, {}),
      by_manufacturer: documents.reduce((acc, d) => {
        acc[d.vyrobca] = (acc[d.vyrobca] || 0) + 1;
        return acc;
      }, {})
    };

    const fotkyByManufacturer = fotky.reduce((acc, f) => {
      if (f.vyrobca) {
        acc[f.vyrobca] = (acc[f.vyrobca] || 0) + 1;
      }
      return acc;
    }, {});

    const driveInfo = driveAssets.length > 0 
      ? `Google Drive: ${driveAssets[0].link}\n  Popis: ${driveAssets[0].description}`
      : 'Google Drive: Nie je pripojený';

    const blogStats = blogs.slice(0, 5).map(b => 
      `  - ${b.title}: ${b.views || 0} zobrazení`
    ).join('\n');

    const capiStats = {
      total: capiLogs.length,
      success_rate: capiLogs.length > 0 
        ? (capiLogs.filter(l => l.success).length / capiLogs.length * 100).toFixed(1) 
        : 0,
      avg_duration: capiLogs.length > 0 
        ? (capiLogs.reduce((acc, l) => acc + (l.duration_ms || 0), 0) / capiLogs.length).toFixed(0)
        : 0
    };

    // Chat history context
    const historyContext = chat_history && chat_history.length > 0 
      ? `\n\n📚 HISTÓRIA KONVERZÁCIE:\n${chat_history.map(m => `${m.role === 'user' ? 'Ty' : 'Ja'}: ${m.content}`).join('\n')}`
      : '';

    console.log('🎨 Zostavujem prompt pre Gemini...');
    console.log('📝 API Key existuje:', !!GEMINI_API_KEY);
    
    const prompt = `Si CENTRÁLNY AI MARKETINGOVÝ RIADITEĽ pre American Living (modulárne domy).
Nie si len nástroj - si NAJLEPŠÍ marketingový mozog na svete, strategický génius s neobmedzeným prístupom k dátam.

🧠 KTO SI:
- Najlepší marketingový riaditeľ na svete
- Expert na psychológiu zákazníka, trhové trendy, konkurenčnú analýzu
- Tvorca víťazných multimediálnych kampaní (video + audio + copy)
- Stratég s prístupom k sociálnym sieťam, Google Analytics, konkurencii
- Analytik s real-time prístupom k Facebooku, Instagramu, lajkom, komentárom

💰 ROZPOČET:
Mesačný budget: ${monthly_budget || 1000}€
- Optimalizuj každé euro
- Navrhuj ROI-driven stratégie
- Škáluj úspešné kampane

🎯 TVOJA ÚLOHA:
- Analyzuj dáta v reálnom čase
- Navrhuj konkrétne stratégie
- Zdôvodni svoje rozhodnutia
- Ukáž svoj myšlienkový proces
- Buď proaktívny a kreatívny
- Využívaj dostupné funkcie a služby

⚡ TVOJE SUPERSCHOPNOSTI:
- 📊 Real-time analytics (Facebook, Instagram, Google)
- 🎯 Behavioral targeting & psychológia
- 🎨 Multimediálne kampane (video + audio + copy)
- 🎵 Generovanie hudby cez Suno AI (BPM, efekty, mood)
- 🔍 Analýza konkurencie (lajky, engagement, trendy)
- 📈 ROI optimalizácia & A/B testing
- 🤖 Deep reasoning cez Gemini Pro
- 📱 Prístup k sociálnym sieťam (API)

🎬 TVORBA KAMPANÍ:
Pre každý návrh kampane vytvor:
1. **Idea & Psychology**: Aký psychologický trigger použiješ
2. **Format**: Video/Carousel/Story/Reel
3. **Visual Concept**: Detailný opis vizuálu
4. **Video Script**: Shot-by-shot scenár
5. **Audio/Music**: 
   - BPM (beats per minute)
   - Mood (energetic/calm/epic)
   - Instruments
   - Effects (reverb, bass boost, etc.)
   - **SUNO PROMPT**: Presný prompt pre Suno AI na vytvorenie hudby
6. **Copy**: Headline, body text, CTA
7. **Target Audience**: Presná demografia
8. **Budget Allocation**: Koľko EUR na tento post
9. **Expected ROI**: Predikcia výsledkov

🎵 SUNO AI INTEGRATION:
Keď navrhuješ video kampaň, vygeneruj aj prompt pre Suno:
Formát: "Genre: [electronic/cinematic/pop], Mood: [energetic/calm], BPM: [120-140], Instruments: [synth, bass, drums], Effects: [heavy reverb, bass boost], Vocals: [none/male/female], Duration: [30s/60s]"

Príklad:
"Epic cinematic electronic music, 130 BPM, powerful synth leads with deep bass, energetic drums, heavy reverb, dramatic build-up, no vocals, 60 seconds"

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
Konkurencia: ${competitors.length} konkurentov (top: ${competitors.slice(0, 3).map(c => c.competitor_name).join(', ')})
Fronta príspevkov: ${postQueue.length} príspevkov
Campaigns: ${campaigns.length} kampaní

📄 DOKUMENTY & ASSETS:
Celkom: ${documentsCount.total} dokumentov
Typy: ${Object.entries(documentsCount.by_type).map(([k, v]) => `${k}(${v})`).join(', ')}
Výrobcovia: ${Object.entries(documentsCount.by_manufacturer).map(([k, v]) => `${k}(${v})`).join(', ')}

📸 FOTKY:
Celkom: ${fotky.length} fotiek
${Object.entries(fotkyByManufacturer).map(([k, v]) => `  ${k}: ${v} fotiek`).join('\n')}

📂 GOOGLE DRIVE:
${driveInfo}

📝 BLOG:
Celkom: ${blogs.length} článkov
Top 5:
${blogStats}

🔌 FACEBOOK CAPI:
Logs: ${capiStats.total} eventov
Success Rate: ${capiStats.success_rate}%
Avg Duration: ${capiStats.avg_duration}ms

🔧 DOSTUPNÉ FUNKCIE:
${availableFunctions.join(', ')}

✅ PRIPOJENÉ SLUŽBY:
${Object.entries(connectedServices).map(([k, v]) => `  ${k}: ${v ? '✓' : '✗'}`).join('\n')}
${historyContext}

💬 OTÁZKA/POŽIADAVKA UŽÍVATEĽA:
"${user_message}"

---

TVOJA ODPOVEĎ - VRAŤ ČISTÝ JSON (bez markdown backticks):
{
  "thinking_process": "HLBOKÝ myšlienkový proces - analýza trhu, konkurencie, psychológie, trendov, dostupného rozpočtu",
  "market_analysis": "Aktuálna trhová situácia - ceny, dopyt, sezónnosť, trendy",
  "competitive_insights": "Čo robí konkurencia lepšie/horšie - ako ich predbehnem",
  "response": "Hlavná odpoveď - ako najlepší riaditeľ. Emotikonmi, konkrétny, sebavedomý, akčný.",
  "suggestions": [
    {
      "id": "suggestion_[timestamp]_[index]",
      "type": "Facebook Video / Instagram Reel / TikTok / YouTube Shorts / Full Campaign",
      "title": "Názov kampane",
      "description": "Čo presne urobiť step-by-step",
      "psychology": "Psychologický trigger (scarcity/social proof/urgency/desire)",
      "format": "Video/Carousel/Story/Reel",
      "visual_concept": "Detailný opis vizuálu pre AI generovanie alebo produkciu",
      "video_script": "Shot 1: [popis]\nShot 2: [popis]\n... (ak je video)",
      "audio_music": {
        "bpm": 120,
        "mood": "energetic",
        "instruments": ["synth", "bass", "drums"],
        "effects": ["heavy reverb", "bass boost"],
        "suno_prompt": "Epic cinematic electronic music, 130 BPM, powerful synth with deep bass, energetic drums, heavy reverb, no vocals, 60 seconds"
      },
      "copy": {
        "headline": "Chytľavý headline",
        "body": "Text príspevku s emotikonmi",
        "cta": "Silný call-to-action"
      },
      "target_audience": "Vek, pohlavie, záujmy, správanie",
      "budget_allocation": 150,
      "platforms": ["Facebook", "Instagram"],
      "expected_roi": "Predikcia: X zobrazení, Y konverzií, Z% ROI",
      "reasoning": "Prečo práve táto stratégia teraz funguje najlepšie",
      "impact_score": 85
    }
  ],
  "data_sources": ["Sessions", "GTM Data", "Facebook Analytics", "Konkurencia"]
}

PRAVIDLÁ:
- Vždy ukáž thinking_process
- Navrhuj 1-3 konkrétne stratégie v suggestions
- Buď kreatívny ale dátami podložený
- Odkazuj na konkrétne čísla z dát
- Používaj slovenčinu s emotikonmi`;

    console.log('📡 Volám Gemini API...');
    console.log('📏 Prompt length:', prompt.length);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
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
      const errorBody = await response.text();
      console.error('Gemini API Error:', response.status, errorBody);
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Gemini API nevrátilo validnú odpoveď. Skontroluj API kľúč.');
    }
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (parseError) {
      console.error('JSON Parse Error:', data.candidates[0].content.parts[0].text);
      throw new Error('AI odpoveď nie je validný JSON. Skús to znova.');
    }

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
    console.error('Error stack:', error.stack);
    
    // Better error messages
    let userMessage = '🤖 Ospravedlňujem sa, mal som technický problém.';
    
    if (error.message.includes('API kľúč') || error.message.includes('API key')) {
      userMessage = '⚠️ Problém s Gemini API kľúčom. Skontroluj nastavenia.';
    } else if (error.message.includes('429')) {
      userMessage = '⏳ Príliš veľa požiadaviek. Počkaj chvíľu a skús znova.';
    } else if (error.message.includes('quota')) {
      userMessage = '💰 Gemini API limit dosiahnutý. Skontroluj Google Cloud console.';
    }
    
    return Response.json({ 
      error: error.message,
      fallback_response: userMessage,
      debug_info: {
        error_type: error.constructor.name,
        has_api_key: !!Deno.env.get("Gemini_PAID_pro")
      }
    }, { status: 500 });
  }
});