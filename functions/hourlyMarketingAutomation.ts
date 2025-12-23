import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AUTONOMOUS MARKETING AUTOMATION
 * Automaticky sa spúšťa každú hodinu (cez Deno Cron alebo externý scheduler)
 * 
 * Vykonáva:
 * 1. Analýzu nových dát
 * 2. Generovanie odporúčaní
 * 3. Kontrolu kampaní
 * 4. Updatovanie insights
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role - beží automaticky bez user autentifikácie
    const user = await base44.auth.me().catch(() => null);
    
    console.log(`🤖 Hourly Marketing Automation triggered at ${new Date().toISOString()}`);

    // 1. Zber všetkých dát
    const [sessions, insights, history, campaigns, dopyty, brainRules] = await Promise.all([
      base44.asServiceRole.entities.UserSession.list('-created_date', 200),
      base44.asServiceRole.entities.MarketingInsight.list('-created_date', 5),
      base44.asServiceRole.entities.MarketingHistory.list('-created_date', 50),
      base44.asServiceRole.entities.CampaignPerformance.list('-created_date', 10),
      base44.asServiceRole.entities.Dopyt.list('-created_date', 20),
      base44.asServiceRole.entities.MarketingBrain.filter({ active: true })
    ]);

    // 2. Analýza - detekcia anomálií a trendov
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentSessions = sessions.filter(s => 
      new Date(s.created_date).getTime() > oneHourAgo
    );

    const recentConversions = recentSessions.filter(s => 
      s.conversions?.length > 0
    ).length;

    const recentBounces = recentSessions.filter(s => 
      s.session_tags?.includes('odrazeny')
    ).length;

    const bounceRate = recentSessions.length > 0 
      ? (recentBounces / recentSessions.length * 100).toFixed(1) 
      : 0;

    // 3. AI Analýza (volanie cez API)
    const API_KEY = Deno.env.get("Gemini_PAID_pro");
    if (!API_KEY) {
      console.warn('⚠️ Gemini API key not set, skipping AI analysis');
      return Response.json({ 
        success: false, 
        error: 'API key missing' 
      });
    }

    const analysisPrompt = `Si AI Marketingový Riaditeľ pre American Living.

📊 DÁTA ZA POSLEDNÚ HODINU:
- Návštevníkov: ${recentSessions.length}
- Konverzie: ${recentConversions}
- Bounce rate: ${bounceRate}%
- Nové dopyty: ${dopyty.filter(d => new Date(d.created_date).getTime() > oneHourAgo).length}

📈 TRENDY (posledných 50 akcií):
${history.slice(0, 10).map(h => `- ${h.action_type}: ${h.title}`).join('\n')}

🧠 MARKETING KNOW-HOW:
${brainRules.slice(0, 5).map(r => `- [${r.category}] ${r.content_text}`).join('\n')}

ÚLOHA: Urob krátku analýzu (max 200 slov) a navrhni 1-2 akcie na túto hodinu.

FORMÁT (JSON):
{
  "situation": "Stručný popis situácie...",
  "recommendations": [
    {
      "title": "Názov akcie",
      "priority": "high|medium|low",
      "action": "Čo urobiť"
    }
  ],
  "alerts": ["Upozornenie ak niečo nie je v poriadku"]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const aiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`Gemini API error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    let analysis;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { situation: aiText };
    } catch (e) {
      analysis = { situation: aiText };
    }

    // 4. Uloženie záznamu
    await base44.asServiceRole.entities.MarketingHistory.create({
      action_type: 'daily_briefing',
      title: `Hodinová automatická analýza`,
      description: analysis.situation || 'Automatická kontrola systému',
      data: {
        analysis,
        metrics: {
          sessions: recentSessions.length,
          conversions: recentConversions,
          bounceRate
        },
        timestamp: new Date().toISOString()
      },
      status: 'completed'
    });

    // 5. Ak sú kritické upozornenia, vytvor notifikáciu
    if (analysis.alerts?.length > 0) {
      for (const alert of analysis.alerts) {
        await base44.asServiceRole.entities.MarketingNotification.create({
          typ: 'vysoka_kvalita',
          title: 'Automatické upozornenie',
          message: alert,
          severity: 'warning',
          read: false
        });
      }
    }

    console.log('✅ Hourly automation completed successfully');

    return Response.json({
      success: true,
      analysis,
      metrics: {
        sessions: recentSessions.length,
        conversions: recentConversions,
        bounceRate
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Hourly automation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});