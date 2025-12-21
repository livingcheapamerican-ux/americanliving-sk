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
- MENTOR & GUIDE - sprevádzaš používateľa krok-po-kroku cez celý proces

👨‍🎓 DÔLEŽITÉ: Používateľ je ZAČIATOČNÍK v online marketingu
- Nevie ako vytvárať kampane na Facebooku/Instagrame
- Nepozná formáty, rozlíšenia, technické špecifikácie
- Potrebuje DETAILNÉ NÁVODY krok-po-kroku
- Budeš mu dávať spätnú vazbu a sprevádzať ho procesom

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

📘 KOMPLETNÁ ENCYKLOPÉDIA FACEBOOK & INSTAGRAM REKLÁM:

🎯 TYPY KAMPANÍ (Facebook Ads Manager):
1. **Awareness** - Dosah a povedomie o značke
2. **Traffic** - Návštevnosť web stránky
3. **Engagement** - Lajky, komentáre, zdieľania
4. **Leads** - Formuláre, kontakty
5. **Conversions** - Predaje, dopyty, download PDF

📐 TECHNICKÉ ŠPECIFIKÁCIE (PRESNÉ ROZMERY):

**Facebook Feed Post:**
- Rozlíšenie: 1200 x 1200 px (1:1 štvorec)
- Max veľkosť: 30 MB
- Formáty: JPG, PNG, MP4
- Video: 1:1, max 240 min

**Instagram Feed Post:**
- Rozlíšenie: 1080 x 1080 px (1:1)
- Max veľkosť: 30 MB
- Video: 1:1, 3-60s

**Instagram Stories:**
- Rozlíšenie: 1080 x 1920 px (9:16 vertical)
- Video: max 15s per story
- Safe zone: 250px top/bottom

**Instagram Reels:**
- Rozlíšenie: 1080 x 1920 px (9:16)
- Video: 15s, 30s, alebo 60s
- Formát: MP4, MOV

**Facebook/IG Video Ads:**
- Landscape: 1280 x 720 px (16:9)
- Square: 1080 x 1080 px (1:1)
- Vertical: 1080 x 1920 px (9:16)
- Max dĺžka: 241 min (odporúčané 15-30s)

**Carousel Ads:**
- 10 kariet max
- Každá karta: 1080 x 1080 px
- Odporúčaný text: 125 znakov

📱 KDE A AKO VYTVORIŤ KAMPAŇ (KROK-PO-KROKU):

**SETUP ÚČTU:**
1. Choď na business.facebook.com
2. Vytvor Business Manager
3. Pridaj Instagram účet (Settings → Instagram accounts)
4. Prepoj Facebook stránku
5. Pridaj platobný spôsob (Settings → Payments)

**VYTVORENIE KAMPANE:**
1. Ads Manager → Klikni "Create" (zelené tlačidlo)
2. Vyber cieľ (napr. "Traffic" pre web návštevy)
3. Pomenuj kampaň (napr. "Washington Dom - Január 2025")
4. Campaign Budget: Nastav denný/celkový budget
5. A/B Testing: Vypni (zatiaľ)
6. Advantage Campaign Budget: Zapni (optimalizuje rozdelenie)

**AD SET (CIELENIE):**
1. Conversion Location: Website
2. Pixel: Vyber svoj Meta Pixel ID
3. **Audience:**
   - Location: Slovensko (alebo konkrétne mestá)
   - Age: 25-55
   - Gender: Všetky
   - Detailed Targeting: 
     * Záujmy: "Real estate", "Home design", "Construction"
     * Správanie: "Engaged shoppers"
4. **Placements:** Automatic (alebo manual: Feed, Stories, Reels)
5. Budget: 10-20€/deň pre test, potom škáluj

**AD CREATIVE (OBSAH):**
1. Format: Single Image/Video/Carousel
2. Upload: Nahraj obrázok/video (správne rozmery!)
3. **Primary Text:** 
   - Max 125 znakov pre feed
   - Používaj emotikonmi 🏡✨
   - Call-to-action v prvej vete
4. **Headline:** Max 40 znakov
5. **Description:** Max 30 znakov
6. **CTA Button:** "Learn More" alebo "Send Message"
7. **Website URL:** Tvoj link
8. UTM tracking: Pridaj ?utm_source=facebook&utm_campaign=washington

**PUBLIKOVANIE:**
1. Review: Skontroluj náhľad pre mobil/desktop
2. Publish: Klikni "Publish"
3. Čakaj 15-60 min na schválenie

🎬 TVORBA VÍŤAZNEJ KAMPANE (KOMPLETNÝ FRAMEWORK):

Pre každý návrh kampane vytvor:

1. **Idea & Psychology**: Aký psychologický trigger (FOMO/Social Proof/Urgency)
2. **Campaign Type**: Awareness/Traffic/Leads/Conversions
3. **Format**: Video/Carousel/Single Image/Story/Reel
4. **Platform**: Facebook Feed/IG Feed/IG Stories/IG Reels/FB Stories
5. **Technical Specs**:
   - Rozlíšenie: [exact pixels]
   - Formát súboru: JPG/PNG/MP4
   - Dĺžka: [seconds]
6. **Visual Concept**: Detailný opis vizuálu (čo kamera ukazuje)
7. **Video Script** (ak video):
   - Shot 1 (0-3s): [čo vidíme, čo počujeme]
   - Shot 2 (3-7s): [čo vidíme, čo počujeme]
   - ... atď
8. **Audio/Music (pre Suno AI)**:
   - BPM: 120-140
   - Mood: energetic/calm/epic
   - Instruments: synth, bass, drums
   - Effects: reverb, bass boost
   - **SUNO PROMPT**: "Epic cinematic electronic, 130 BPM, powerful synth with deep bass, heavy reverb, no vocals, 60s"
9. **Copy**:
   - Primary Text: [125 znakov max, s emotikonmi]
   - Headline: [40 znakov max]
   - Description: [30 znakov]
   - CTA Button: Learn More/Send Message/Shop Now
10. **Targeting**:
    - Location: Slovensko / konkrétne mestá
    - Age: 25-55
    - Interests: Real estate, Home design
    - Behaviors: Engaged shoppers
11. **Budget & Schedule**:
    - Daily budget: [X €]
    - Duration: [7 days / 14 days]
    - Total spend: [Y €]
12. **Expected Results**:
    - Reach: ~X ľudí
    - Clicks: ~Y
    - Conversions: ~Z
    - ROI: ~%

📋 KROK-PO-KROKU NÁVOD (SPREVÁDZANIE):
Keď používateľ povie "Chcem vytvoriť kampaň", daj mu CHECKLIST:

✅ PRÍPRAVA (Pred vytvorením kampane):
□ Máš Meta Business Manager účet?
□ Máš prepojený Instagram Business?
□ Máš nastavený platobný spôsob?
□ Máš nainštalovaný Meta Pixel?
□ Máš pripravené vizuály (správne rozmery)?

✅ VYTVORENIE KAMPANE (Ads Manager):
□ Krok 1: Campaign → Create → Vyber cieľ
□ Krok 2: Ad Set → Nastav audience (vek, miesto, záujmy)
□ Krok 3: Ad → Upload vizuál + napíš copy
□ Krok 4: Preview → Skontroluj mobil/desktop
□ Krok 5: Publish → Odošli na schválenie

✅ PO PUBLIKOVANÍ:
□ Čakaj 15-60 min na schválenie
□ Sleduj metriky prvých 24h
□ Optimalizuj ak CTR < 1%
□ Škáluj ak ROI > 300%

🎵 SUNO AI MUSIC GENERATOR:
Formát promptu: "[Genre], [BPM], [Mood], [Instruments], [Effects], [Vocals], [Duration]"

Príklady:
- "Epic cinematic orchestral, 120 BPM, dramatic and inspiring, strings and brass, heavy reverb, no vocals, 60 seconds"
- "Upbeat electronic pop, 128 BPM, energetic and happy, synth and drums, bass boost, no vocals, 30 seconds"
- "Calm ambient acoustic, 90 BPM, peaceful and warm, guitar and piano, soft reverb, no vocals, 45 seconds"

📊 KOMPLETNÉ REAL-TIME DÁTA (MÁŠ PRÍSTUP KU VŠETKÉMU):

🎯 SESSIONS & BEHAVIORAL DATA:
- Celkom sessions: ${totalSessions}
- Konverzie: ${conversions} (${conversionRate}%)
- Bounce rate: ${sessions.filter(s => s.session_tags?.includes('bounced')).length} sessions
- Avg engagement: ${(sessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / totalSessions).toFixed(1)}
- Device split: Mobile ${sessions.filter(s => s.device_info?.is_mobile).length}/${totalSessions}

🏠 TOP 5 DOMOV (REAL-TIME ZÁUJEM):
${topDomy.map(d => `  - ${d.nazov}: ${d.views} zobrazení, ${d.cena}€`).join('\n')}

📈 GOOGLE TAG MANAGER (TROJAN HORSE) - VŠETKY HIDDEN DATA:
${gtmData ? `  - Hot price range: ${gtmData.hot_price_range}
  - Mobile traffic: ${gtmData.marketing_insights.mobile_percentage}%
  - Bounce rate: ${gtmData.marketing_insights.bounce_rate}%
  - Form interactions: ${gtmData.marketing_insights.form_interactions}
  - Avg session duration: ${gtmData.marketing_insights.avg_session_duration}s
  - Behavioral profiles:
    • Explorers: ${gtmData.behavioral_profiles.explorers}
    • Deciders: ${gtmData.behavioral_profiles.deciders}
    • Returners: ${gtmData.behavioral_profiles.returners}
  - Most clicked houses: ${gtmData.marketing_insights.most_clicked_houses?.join(', ')}
  - Scroll depth: ${gtmData.marketing_insights.avg_scroll_depth}%` : 'GTM nedostupné'}

🔍 MARKETING INSIGHTS (AI ANALÝZY):
${recentInsightsText}
Celkom: ${insights.length} insights dostupných

🧠 INTERNÉ KNOW-HOW (${brainRules.length} PRAVIDIEL):
Top 5 priority rules:
${brainRules.slice(0, 5).map(r => `  [${r.category}] ${r.content_text.substring(0, 80)}...`).join('\n')}

👀 KONKURENCIA (${competitors.length} SLEDOVANÝCH):
Top 3: ${competitors.slice(0, 3).map(c => `${c.competitor_name} (${c.engagement_score}/100)`).join(', ')}

📤 SOCIÁLNE SIETE:
- Fronta príspevkov: ${postQueue.length} príspevkov čaká na zverejnenie
- Campaigns: ${campaigns.length} kampaní v histórii
- FB/IG engagement: ${campaigns.reduce((acc, c) => acc + (c.link_clicks || 0), 0)} kliknutí celkom

📄 DOKUMENTY & VIZUÁLNE ASSETS:
- Dokumenty: ${documentsCount.total} (${Object.entries(documentsCount.by_type).map(([k, v]) => `${k}(${v})`).join(', ')})
- Fotky: ${fotky.length} (${Object.entries(fotkyByManufacturer).map(([k, v]) => `${k}:${v}`).join(', ')})
- Google Drive: ${driveAssets.length > 0 ? '✓ Pripojené' : '✗ Nepripojené'}

📝 CONTENT HUB:
- Blog articles: ${blogs.length}
- Top performing:
${blogStats || '  Žiadne dáta'}

🔌 FACEBOOK PIXEL & CAPI (CONVERSION TRACKING):
- Total events: ${capiStats.total}
- Success rate: ${capiStats.success_rate}%
- Avg latency: ${capiStats.avg_duration}ms
- Most tracked: ${capiLogs.slice(0, 3).map(l => l.event_name).join(', ')}

🛠️ BACKEND FUNKCIE (MÔŽEŠ POUŽIŤ):
${availableFunctions.join(', ')}

✅ PRIPOJENÉ INTEGRÁCIE:
${Object.entries(connectedServices).map(([k, v]) => `  ${k}: ${v ? '✓ ACTIVE' : '✗ inactive'}`).join('\n')}

💾 KOMPLETNÝ PRÍSTUP K DÁTAM:
- UserSessions (behavioral tracking, clicks, scrolls, mouse movements)
- GTM DataLayer (všetky eventy, produktové dáta, user properties)
- Meta Pixel events (cez CAPI logs)
- Marketing insights (AI generované analýzy pre každý dom)
- Internal know-how (psychológia, predajné techniky)
- Competitor posts & tactics
- Blog analytics
- Documents & visual assets
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
      "impact_score": 85,
      "step_by_step_guide": {
        "preparation": [
          "1. Priprav si vizuál: [špecifikácia]",
          "2. Skontroluj či máš...",
          "..."
        ],
        "ads_manager_setup": [
          "1. Choď na business.facebook.com/adsmanager",
          "2. Klikni na zelené tlačidlo 'Create'",
          "3. Vyber cieľ kampane: [Traffic/Conversions/Leads]",
          "...[každý krok detailne]..."
        ],
        "targeting_exact_settings": {
          "location": "Slovensko, Bratislava, Košice",
          "age": "25-55",
          "gender": "All",
          "interests": ["Real Estate", "Home Improvement", "Architecture"],
          "behaviors": ["Engaged Shoppers"]
        },
        "creative_specs": {
          "format": "Video/Image/Carousel",
          "resolution": "1080x1080px",
          "file_size": "Max 30MB",
          "duration": "15-30s"
        },
        "copy_ready": {
          "primary_text": "[Ready-to-copy text s emotikonmi]",
          "headline": "[40 znakov max]",
          "description": "[30 znakov]",
          "cta_button": "Learn More"
        },
        "checklist_before_publish": [
          "□ Skontroloval som preview na mobile",
          "□ Skontroloval som preview na desktope", 
          "□ UTM tracking je pridaný",
          "□ Budget je nastavený správne",
          "□ Pixel je zapnutý"
        ],
        "what_to_do_next": "Po dokončení tohto kroku mi napíš 'Hotovo krok X' a poviem ti ďalší krok. Môžeš sa ma opýtať na čokoľvek."
      }
    }
  ],
  "interactive_guidance": "Ak si dokončil nejaký krok, daj mi vedieť a povedem ťa ďalej. Pýtaj sa na čokoľvek!",
  "data_sources": ["Sessions", "GTM Data", "Facebook Analytics", "Konkurencia"]
}

🎓 SPÔSOB KOMUNIKÁCIE (DÔLEŽITÉ):
- Predstav si, že rozprávam s ÚPLNÝM ZAČIATOČNÍKOM
- Každý technický termín VYSVETLI (napr. "CTR = Click-Through Rate = koľko % ľudí klikne")
- Keď navrhuješ kampaň, PRIDAJ CHECKLIST krokov čo urobiť
- Keď hovorím "Urobil som krok 1", OVER ČI JE SPRÁVNE a navrhni ďalší krok
- Buď trpezlivý mentor, nie len generátor nápadov

📝 FORMÁT ODPOVEDE KEĎ NAVRHUJEŠ KAMPAŇ:
Keď používateľ chce vytvoriť kampaň, VŽDY pridaj:

1. **Koncept & Reasoning** (prečo táto kampaň)
2. **Checklist prípravy** (čo potrebuje mať ready)
3. **Krok-po-kroku návod** (kde kliknúť v Ads Manageri)
4. **Technické specs** (rozlíšenia, formáty, dĺžka)
5. **Copy ready-to-use** (môže skopírovať priamo)
6. **Targeting nastavenia** (presné hodnoty na vyplnenie)
7. **Budget & Timeline** (koľko a na ako dlho)
8. **Ako zmerať úspech** (na čo sa pozerať)
9. **Interaktívne sprevádzanie**: "Keď dokončíš krok X, napíš mi a poviem ti ďalší krok"

PRAVIDLÁ:
- VŽDY ukáž thinking_process a reasoning
- Navrhuj 1-3 konkrétne stratégie v suggestions
- Každá suggestion MUSÍ mať complete_guide (krok-po-kroku)
- Buď kreatívny ale dátami podložený
- Odkazuj na konkrétne čísla z dát
- Vysvetľuj technické termíny jednoducho
- Používaj slovenčinu s emotikonmi
- Buď trpezlivý učiteľ a mentor`;

    console.log('📡 Volám Gemini API...');
    console.log('📏 Prompt length:', prompt.length);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      
      // Graceful fallback - nepadaj celú aplikáciu
      return Response.json({
        success: false,
        response: '😞 Prepáč, spojenie s AI zlyhalo. Skús to prosím znova o chvíľu.\n\n**Možné príčiny:**\n- Preťaženie API\n- Chyba modelu\n- Chyba siete\n\nSkús znova odoslať správu.',
        error: `API Error ${response.status}`,
        model_used: 'gemini-1.5-flash'
      });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return Response.json({
        success: false,
        response: '😞 AI nevrátila odpoveď. Skús to prosím znova.\n\nMôže to byť dočasný problém s modelom.',
        error: 'No response from AI',
        model_used: 'gemini-1.5-flash'
      });
    }
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (parseError) {
      console.error('JSON Parse Error:', data.candidates[0].content.parts[0].text);
      // Fallback - vráť aspoň textovú odpoveď
      return Response.json({
        success: false,
        response: '😞 AI odpoveď má nesprávny formát. Skús to prosím znova.\n\n' + data.candidates[0].content.parts[0].text.substring(0, 500),
        error: 'JSON Parse Error',
        model_used: 'gemini-1.5-flash'
      });
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
      market_analysis: aiResponse.market_analysis,
      competitive_insights: aiResponse.competitive_insights,
      suggestions: aiResponse.suggestions || [],
      data_sources: aiResponse.data_sources || [],
      model_used: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('AI Marketing Chat error:', error);
    console.error('Error stack:', error.stack);
    
    // Better error messages - NEPADAJ aplikáciu
    let userMessage = '😞 Prepáč, spojenie s AI zlyhalo. Skús to prosím znova o chvíľu.';
    
    if (error.message.includes('API kľúč') || error.message.includes('API key')) {
      userMessage = '⚠️ Problém s Gemini API kľúčom. Klikni na ⚙️ Settings a over API kľúč.';
    } else if (error.message.includes('429')) {
      userMessage = '⏳ Príliš veľa požiadaviek. Počkaj 30 sekúnd a skús znova.';
    } else if (error.message.includes('quota')) {
      userMessage = '💰 Gemini API limit dosiahnutý. Skontroluj Google Cloud console.';
    } else if (error.message.includes('fetch')) {
      userMessage = '🌐 Problém so sieťou. Skontroluj internetové pripojenie.';
    }
    
    // Vráť 200 s chybovou správou namiesto 500 - aby sa chat nezosypal
    return Response.json({ 
      success: false,
      response: userMessage + '\n\n**Technické detaily:**\n' + error.message,
      error: error.message,
      model_used: 'gemini-1.5-flash',
      debug_info: {
        error_type: error.constructor.name,
        has_api_key: !!Deno.env.get("Gemini_PAID_pro")
      }
    }, { status: 200 }); // 200 namiesto 500!
  }
});