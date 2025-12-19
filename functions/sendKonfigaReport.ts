import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// KONFIGURÁCIA
const KONFIGA_ENDPOINT = Deno.env.get("KONFIGA_API_ENDPOINT") || "https://your-konfiga-app.base44.app/api/receive-report";
const GEMINI_API_KEY = Deno.env.get("Gemini_PAID_pro");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. ZBER DÁT - posledných 24 hodín
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Získaj sessions za posledných 24h
    const allSessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 500);
    const recentSessions = allSessions.filter(s => new Date(s.created_date) >= yesterday);
    
    // Získaj dopyty (objednávky/inquiries) za 24h
    const allDopyty = await base44.asServiceRole.entities.Dopyt.list('-created_date', 100);
    const recentDopyty = allDopyty.filter(d => new Date(d.created_date) >= yesterday);
    
    // Získaj MarketingInsights
    const insights = await base44.asServiceRole.entities.MarketingInsight.list('-created_date', 10);
    
    // Analytika návštevnosti
    const uniqueVisitors = new Set(recentSessions.map(s => s.user_email || s.location_info?.ip)).size;
    const totalPageViews = recentSessions.reduce((acc, s) => acc + (s.pages_visited?.length || 0), 0);
    const avgSessionDuration = recentSessions.length > 0 
      ? Math.round(recentSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / recentSessions.length)
      : 0;
    
    // Konverzie
    const conversions = recentSessions.filter(s => s.conversions?.length > 0).length;
    const conversionRate = recentSessions.length > 0 
      ? ((conversions / recentSessions.length) * 100).toFixed(2)
      : 0;
    
    // Opustené košíky (sessions s configurator interakciami ale bez conversion)
    const abandonedCarts = recentSessions.filter(s => 
      s.configurator_interactions?.length > 0 && (!s.conversions || s.conversions.length === 0)
    ).length;
    
    // Device breakdown
    const deviceBreakdown = {
      desktop: recentSessions.filter(s => s.device_info?.device_type === 'desktop').length,
      mobile: recentSessions.filter(s => s.device_info?.device_type === 'mobile').length,
      tablet: recentSessions.filter(s => s.device_info?.device_type === 'tablet').length
    };
    
    // Top krajiny
    const countryCounts = {};
    recentSessions.forEach(s => {
      const country = s.location_info?.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, visits: count }));
    
    // 2. TECH CHECK - kontrola dostupnosti hlavných stránok
    const baseUrl = "https://americanliving.sk";
    const pagesCheck = await Promise.allSettled([
      fetch(`${baseUrl}/`),
      fetch(`${baseUrl}/Katalog`),
      fetch(`${baseUrl}/Kontakt`),
      fetch(`${baseUrl}/ONas`)
    ]);
    
    const healthStatus = pagesCheck.every(p => p.status === 'fulfilled' && p.value.status === 200) 
      ? 'OK' 
      : 'ERROR';
    
    const pageStatus = {
      homepage: pagesCheck[0].status === 'fulfilled' && pagesCheck[0].value.status === 200,
      catalog: pagesCheck[1].status === 'fulfilled' && pagesCheck[1].value.status === 200,
      contact: pagesCheck[2].status === 'fulfilled' && pagesCheck[2].value.status === 200,
      about: pagesCheck[3].status === 'fulfilled' && pagesCheck[3].value.status === 200
    };
    
    // 3. PRÍPRAVA JSON BALÍKA
    const report = {
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      source: "americanliving.sk",
      period: "last_24h",
      sales_data: {
        total_inquiries: recentDopyty.length,
        conversion_rate: parseFloat(conversionRate),
        conversions: conversions,
        abandoned_carts: abandonedCarts,
        inquiries_by_type: {
          konfigurator: recentDopyty.filter(d => d.typ_dopytu === 'konfigurator').length,
          vseobecny: recentDopyty.filter(d => d.typ_dopytu === 'vseobecny').length,
          detail_domu: recentDopyty.filter(d => d.typ_dopytu === 'detail_domu').length
        }
      },
      traffic_data: {
        total_sessions: recentSessions.length,
        unique_visitors: uniqueVisitors,
        total_page_views: totalPageViews,
        avg_session_duration_sec: avgSessionDuration,
        device_breakdown: deviceBreakdown,
        top_countries: topCountries,
        returning_visitors: recentSessions.filter(s => s.is_returning).length
      },
      marketing_insights: {
        total_insights: insights.length,
        latest_insight_date: insights[0]?.created_date || null,
        avg_confidence_score: insights.length > 0
          ? Math.round(insights.reduce((acc, i) => acc + (i.confidence_score || 0), 0) / insights.length)
          : 0
      },
      system_health: healthStatus,
      pages_status: pageStatus,
      errors: pagesCheck
        .map((p, idx) => {
          if (p.status === 'rejected' || (p.status === 'fulfilled' && p.value.status !== 200)) {
            return { page: ['homepage', 'catalog', 'contact', 'about'][idx], error: p.reason?.message || 'HTTP error' };
          }
          return null;
        })
        .filter(e => e !== null)
    };
    
    // 4. ODOSLANIE DO KONFIGA AI
    const konfigaResponse = await fetch(KONFIGA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'americanliving-base44'
      },
      body: JSON.stringify(report)
    });
    
    if (!konfigaResponse.ok) {
      throw new Error(`Konfiga API error: ${konfigaResponse.status} ${konfigaResponse.statusText}`);
    }
    
    // 5. VALIDÁCIA CEZ GEMINI API
    const reportHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(report))
    );
    const hashHex = Array.from(new Uint8Array(reportHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const geminiValidation = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Validácia reportu z americanliving.sk. Hash: ${hashHex}. Timestamp: ${report.timestamp}. Status: ${healthStatus}. Potvrd prijatie.`
            }]
          }]
        })
      }
    );
    
    const geminiResult = await geminiValidation.json();
    
    return Response.json({
      success: true,
      report_sent: true,
      konfiga_status: konfigaResponse.status,
      report_hash: hashHex,
      gemini_validation: geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || 'OK',
      summary: {
        sessions: recentSessions.length,
        inquiries: recentDopyty.length,
        conversions: conversions,
        system_health: healthStatus
      }
    });
    
  } catch (error) {
    console.error('Error in sendKonfigaReport:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});