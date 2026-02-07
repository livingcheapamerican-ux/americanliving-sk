import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Načítaj všetky UserEvent za posledných 30 dní
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allEvents = await base44.asServiceRole.entities.UserEvent.list('-created_date', 10000);
    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= thirtyDaysAgo);

    console.log(`📊 Načítaných ${recentEvents.length} udalostí za posledných 30 dní`);

    // 1. Analýza bounce rate podľa stránok
    const pageViews = recentEvents.filter(e => e.event_type === 'page_view');
    const pageStats = {};

    pageViews.forEach(view => {
      const url = view.page_url;
      if (!pageStats[url]) {
        pageStats[url] = {
          url,
          totalViews: 0,
          bounces: 0,
          sessions: new Set(),
          avgTimeOnPage: []
        };
      }
      pageStats[url].totalViews++;
      pageStats[url].sessions.add(view.session_id);
    });

    // Vypočítaj bounces - session, ktoré mali len 1 page view
    const sessionPageCounts = {};
    pageViews.forEach(view => {
      if (!sessionPageCounts[view.session_id]) {
        sessionPageCounts[view.session_id] = [];
      }
      sessionPageCounts[view.session_id].push(view.page_url);
    });

    Object.entries(sessionPageCounts).forEach(([sessionId, pages]) => {
      if (pages.length === 1) {
        const url = pages[0];
        if (pageStats[url]) {
          pageStats[url].bounces++;
        }
      }
    });

    // 2. Analýza conversion funnel
    const funnelSteps = [
      { name: 'Homepage', url: '/', nextStep: 'Katalog' },
      { name: 'Katalog', url: '/katalog', nextStep: 'Detail domu' },
      { name: 'Detail domu', url: '/detail-domu', nextStep: 'Konfigurátor' },
      { name: 'Konfigurátor', url: '/konfigurator', nextStep: 'Kontakt' },
      { name: 'Kontakt', url: '/kontakt', nextStep: 'Odoslanie formulára' }
    ];

    const funnelData = funnelSteps.map(step => {
      const stepViews = pageViews.filter(v => v.page_url.includes(step.url));
      const uniqueSessions = new Set(stepViews.map(v => v.session_id));
      return {
        step: step.name,
        visitors: uniqueSessions.size,
        dropoffRate: 0
      };
    });

    // Vypočítaj dropoff rate
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i].visitors;
      const next = funnelData[i + 1].visitors;
      if (current > 0) {
        funnelData[i].dropoffRate = ((current - next) / current * 100).toFixed(1);
      }
    }

    // 3. Najčastejšie posledné stránky pred odchodom
    const lastPagesBySession = {};
    pageViews.forEach(view => {
      if (!lastPagesBySession[view.session_id] || 
          new Date(view.created_date) > new Date(lastPagesBySession[view.session_id].created_date)) {
        lastPagesBySession[view.session_id] = view;
      }
    });

    const exitPages = {};
    Object.values(lastPagesBySession).forEach(lastPage => {
      const url = lastPage.page_url;
      exitPages[url] = (exitPages[url] || 0) + 1;
    });

    const topExitPages = Object.entries(exitPages)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Analýza interakcií (button clicks)
    const buttonClicks = recentEvents.filter(e => e.event_type === 'button_click');
    const clickStats = {};
    
    buttonClicks.forEach(click => {
      const key = `${click.page_url} - ${click.event_data?.button_text || 'Unknown'}`;
      clickStats[key] = (clickStats[key] || 0) + 1;
    });

    const topClicks = Object.entries(clickStats)
      .map(([key, count]) => ({ button: key, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // 5. Stránky s najvyšším bounce rate
    const pagesWithBounceRate = Object.values(pageStats)
      .filter(p => p.totalViews >= 5) // Len stránky s aspoň 5 zobrazeniami
      .map(p => ({
        url: p.url,
        views: p.totalViews,
        bounces: p.bounces,
        bounceRate: ((p.bounces / p.totalViews) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.bounceRate) - parseFloat(a.bounceRate))
      .slice(0, 10);

    // 6. Analýza zariadení
    const deviceStats = {};
    recentEvents.forEach(e => {
      const device = e.device_type || 'unknown';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });

    // 7. UTM source analýza - odkiaľ prichádzajú používatelia, ktorí odchádzajú
    const utmAnalysis = {};
    Object.values(lastPagesBySession).forEach(lastPage => {
      const source = lastPage.utm_source || 'direct';
      if (!utmAnalysis[source]) {
        utmAnalysis[source] = { exits: 0, totalSessions: 0 };
      }
      utmAnalysis[source].exits++;
    });

    // Celkový počet sessions z každého zdroja
    const allSessions = new Set();
    pageViews.forEach(view => {
      const source = view.utm_source || 'direct';
      const key = `${view.session_id}_${source}`;
      if (!allSessions.has(key)) {
        allSessions.add(key);
        if (!utmAnalysis[source]) {
          utmAnalysis[source] = { exits: 0, totalSessions: 0 };
        }
        utmAnalysis[source].totalSessions++;
      }
    });

    const utmExitRates = Object.entries(utmAnalysis)
      .map(([source, data]) => ({
        source,
        exitRate: data.totalSessions > 0 ? ((data.exits / data.totalSessions) * 100).toFixed(1) : 0,
        totalSessions: data.totalSessions,
        exits: data.exits
      }))
      .sort((a, b) => parseFloat(b.exitRate) - parseFloat(a.exitRate));

    return Response.json({
      success: true,
      period: '30 dní',
      totalEvents: recentEvents.length,
      totalSessions: Object.keys(sessionPageCounts).length,
      analysis: {
        funnelData,
        topExitPages,
        pagesWithBounceRate,
        topClicks,
        deviceStats,
        utmExitRates
      },
      recommendations: generateRecommendations(funnelData, pagesWithBounceRate, topExitPages)
    });

  } catch (error) {
    console.error('Error analyzing dropoff:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function generateRecommendations(funnel, bouncePages, exitPages) {
  const recommendations = [];

  // Najdi najväčší dropoff v funnel
  const maxDropoff = funnel.reduce((max, step) => 
    parseFloat(step.dropoffRate) > parseFloat(max.dropoffRate) ? step : max
  , funnel[0]);

  if (parseFloat(maxDropoff.dropoffRate) > 50) {
    recommendations.push({
      severity: 'high',
      area: maxDropoff.step,
      issue: `Veľký dropoff (${maxDropoff.dropoffRate}%) na kroku "${maxDropoff.step}"`,
      suggestion: `Analyzujte, prečo používatelia odchádzajú z tejto stránky. Možno je formulár príliš zložitý, chýbajú informácie alebo stránka sa načítava pomaly.`
    });
  }

  // Stránky s vysokým bounce rate
  const highBouncePage = bouncePages[0];
  if (highBouncePage && parseFloat(highBouncePage.bounceRate) > 70) {
    recommendations.push({
      severity: 'high',
      area: highBouncePage.url,
      issue: `Vysoký bounce rate (${highBouncePage.bounceRate}%) na stránke ${highBouncePage.url}`,
      suggestion: `Zlepšite call-to-action, pridajte jasné navigačné prvky, alebo skontrolujte, či obsah zodpovedá očakávaniam návštevníkov.`
    });
  }

  // Najčastejšia exit page
  const topExit = exitPages[0];
  if (topExit) {
    recommendations.push({
      severity: 'medium',
      area: topExit.url,
      issue: `Najviac návštevníkov (${topExit.count}) odchádza zo stránky ${topExit.url}`,
      suggestion: `Pridajte na túto stránku jasné CTA tlačidlá alebo navigáciu na ďalšie relevantné sekcie.`
    });
  }

  return recommendations;
}