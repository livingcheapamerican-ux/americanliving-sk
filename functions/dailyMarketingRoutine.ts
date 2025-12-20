import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { startOfDay, subDays, endOfDay, format } from 'npm:date-fns';

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin check
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Check if analysis already ran today
    const existingAnalysis = await base44.asServiceRole.entities.DailyMarketingAnalysis.filter({
      analysis_date: todayStr
    });
    
    if (existingAnalysis.length > 0 && existingAnalysis[0].status === 'completed') {
      return Response.json({
        success: true,
        message: 'Analýza už dnes prebehla',
        analysis: existingAnalysis[0]
      });
    }

    // Create new analysis record
    const analysisRecord = await base44.asServiceRole.entities.DailyMarketingAnalysis.create({
      analysis_date: todayStr,
      status: 'running'
    });

    try {
      // KROK 1: DATA HARVEST (včerajšok)
      const yesterday = subDays(today, 1);
      const dayStart = startOfDay(yesterday);
      const dayEnd = endOfDay(yesterday);
      
      const allSessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 500);
      const yesterdaySessions = allSessions.filter(s => {
        const sessionDate = new Date(s.created_date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      const allDopyty = await base44.asServiceRole.entities.Dopyt.list('-created_date', 100);
      const yesterdayDopyty = allDopyty.filter(d => {
        const dopytDate = new Date(d.created_date);
        return dopytDate >= dayStart && dopytDate <= dayEnd;
      });

      console.log(`📊 Data Harvest: ${yesterdaySessions.length} sessions, ${yesterdayDopyty.length} dopytov`);

      // KROK 2: DEEP THINK ANALYSIS
      const deepThinkResponse = await base44.functions.invoke('deepThinkStrategist');
      const strategicBriefing = deepThinkResponse.data.briefing;

      console.log('🧠 Deep Think Analysis: Completed');

      // KROK 3: CONTENT PREP (Draft príspevok)
      const domy = await base44.asServiceRole.entities.Dom.list();
      const brainRules = await base44.asServiceRole.entities.MarketingBrain.filter({ active: true });
      
      // Nájdi najpopulárnejší dom z včerajška
      const domVisits = {};
      yesterdaySessions.forEach(s => {
        s.dom_interactions?.forEach(interaction => {
          const domId = interaction.dom_id;
          domVisits[domId] = (domVisits[domId] || 0) + 1;
        });
      });

      const sortedDoms = Object.entries(domVisits).sort((a, b) => b[1] - a[1]);
      const topDomId = sortedDoms[0]?.[0];
      const topDom = domy.find(d => d.id === topDomId);

      // Behaviorálny profiling
      const profiles = {
        SENIOR_DOWNSIZING: 0,
        START_MLADA_RODINA: 0,
        INVESTOR_BYROKRACIA: 0
      };

      yesterdaySessions.forEach(s => {
        const viewedExpensive = s.dom_interactions?.some(d => {
          const dom = domy.find(h => h.id === d.dom_id);
          return dom && dom.zakladna_cena > 80000;
        });
        if (viewedExpensive && (s.duration_seconds || 0) > 180) {
          profiles.SENIOR_DOWNSIZING++;
        }

        const viewedCheap = s.dom_interactions?.some(d => {
          const dom = domy.find(h => h.id === d.dom_id);
          return dom && dom.zakladna_cena < 60000;
        });
        if (viewedCheap) {
          profiles.START_MLADA_RODINA++;
        }

        const readAboutPermits = s.pages_visited?.some(p => 
          p.page_url?.includes('faq') || p.page_url?.includes('ako-to-funguje')
        );
        if (readAboutPermits) {
          profiles.INVESTOR_BYROKRACIA++;
        }
      });

      const dominantProfile = Object.entries(profiles).sort((a, b) => b[1] - a[1])[0][0];

      // Vygeneruj draft príspevok
      const knowHow = brainRules
        .sort((a, b) => b.urgency_level - a.urgency_level)
        .slice(0, 5)
        .map(r => `[${r.category}] ${r.content_text}`)
        .join('\n');

      const profileDescriptions = {
        SENIOR_DOWNSIZING: 'Dom ako bankomat - bezbariérovosť, hotovosť na účte',
        START_MLADA_RODINA: 'Štartovacie bývanie - rýchlosť, nízke energie',
        INVESTOR_BYROKRACIA: '9 bodov servisu - vybavíme za vás'
      };

      const draftPrompt = `Vytvor 1 chytľavý príspevok na dnes pre American Living.

DOM: ${topDom?.nazov || 'Modularny dom'} (${topDom?.zakladna_cena?.toLocaleString('sk-SK')}€)
PROFIL KLIENTOV: ${dominantProfile} (${profiles[dominantProfile]} včera)
STRATÉGIA: ${profileDescriptions[dominantProfile]}

KNOW-HOW:
${knowHow}

Vytvor JSON:
{
  "platform": "Facebook/Instagram",
  "post_text": "...(max 200 znakov, emotikonmi, motivačný)...",
  "psychological_trigger": "...(aký princíp používaš)...",
  "target_house": "${topDom?.nazov || 'N/A'}"
}`;

      const apiKey = Deno.env.get("Gemini_PAID_pro");
      let draftPost;

      if (apiKey) {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: draftPrompt }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
            })
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
          draftPost = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        }
      } else {
        draftPost = await base44.integrations.Core.InvokeLLM({
          prompt: draftPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              platform: { type: "string" },
              post_text: { type: "string" },
              psychological_trigger: { type: "string" },
              target_house: { type: "string" }
            }
          }
        });
      }

      console.log('📝 Content Prep: Draft príspevok vytvorený');

      // KROK 4: PONDELOK - Aktualizuj konkurenciu
      let competitorsUpdated = false;
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
      if (dayOfWeek === 1) {
        console.log('🔍 Pondelok: Aktualizujem konkurenciu...');
        await base44.functions.invoke('findSlovakCompetitors');
        competitorsUpdated = true;
      }

      // KROK 5: Ulož výsledky
      const executionTime = (Date.now() - startTime) / 1000;

      await base44.asServiceRole.entities.DailyMarketingAnalysis.update(analysisRecord.id, {
        status: 'completed',
        strategic_briefing: strategicBriefing,
        draft_post: draftPost,
        sessions_analyzed: yesterdaySessions.length,
        dopyty_analyzed: yesterdayDopyty.length,
        competitors_updated: competitorsUpdated,
        execution_time_seconds: executionTime
      });

      // KROK 6: Pošli notifikáciu
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: '☕ Tvoj ranný marketingový brífing je hotový',
          body: `Ahoj ${user.full_name},

Tvoja ranná automatická analýza je dokončená!

📊 VČERAJŠIE DÁTA:
- Sessions: ${yesterdaySessions.length}
- Dopyty: ${yesterdayDopyty.length}
- Dominantný profil: ${dominantProfile}

🧠 STRATEGICKÝ BRÍFING:
${strategicBriefing.substring(0, 500)}...

📝 DRAFT PRÍSPEVOK:
Platform: ${draftPost.platform}
Text: ${draftPost.post_text}

${competitorsUpdated ? '🔍 Konkurencia bola aktualizovaná (pondelok).\n' : ''}

🎯 Prejdi do Marketingového Dashboardu pre viac detailov.

---
Automaticky vygenerované o ${format(today, 'HH:mm')}`
        });

        await base44.asServiceRole.entities.DailyMarketingAnalysis.update(analysisRecord.id, {
          notification_sent: true
        });

        console.log('✉️ Email notifikácia odoslaná');
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      return Response.json({
        success: true,
        message: '✅ Denná marketingová rutina dokončená',
        analysis: {
          sessions_analyzed: yesterdaySessions.length,
          dopyty_analyzed: yesterdayDopyty.length,
          dominant_profile: dominantProfile,
          competitors_updated: competitorsUpdated,
          execution_time: executionTime,
          draft_post: draftPost
        }
      });

    } catch (error) {
      // Ulož chybu
      await base44.asServiceRole.entities.DailyMarketingAnalysis.update(analysisRecord.id, {
        status: 'failed',
        error_message: error.message,
        execution_time_seconds: (Date.now() - startTime) / 1000
      });

      throw error;
    }

  } catch (error) {
    console.error('Daily Marketing Routine Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});