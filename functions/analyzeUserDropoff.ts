import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Načítaj všetky UserEvent a UserSession
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [allEvents, allSessions] = await Promise.all([
      base44.asServiceRole.entities.UserEvent.list('-created_date', 10000),
      base44.asServiceRole.entities.UserSession.list('-created_date', 1000)
    ]);

    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= thirtyDaysAgo);
    const recentSessions = allSessions.filter(s => new Date(s.created_date) >= thirtyDaysAgo);

    console.log(`📊 Načítaných ${recentEvents.length} udalostí a ${recentSessions.length} sessions za posledných 30 dní`);

    // Analýza UserSession - Detailnejšia analýza správania
    const sessionAnalysis = {
      totalSessions: recentSessions.length,
      avgDuration: 0,
      avgPagesVisited: 0,
      avgScrollDepth: 0,
      avgEngagementScore: 0,
      mobileSessions: 0,
      desktopSessions: 0,
      authenticatedSessions: 0,
      bouncedSessions: 0,
      exitPages: {},
      landingPages: {},
      avgClicksPerSession: 0
    };

    let totalDuration = 0;
    let totalPages = 0;
    let totalScrollDepth = 0;
    let totalEngagement = 0;
    let totalClicks = 0;

    recentSessions.forEach(session => {
      // Duration
      if (session.duration_seconds) {
        totalDuration += session.duration_seconds;
      }

      // Pages visited
      const pagesCount = session.pages_visited?.length || 0;
      totalPages += pagesCount;

      // Bounce - len 1 stránka
      if (pagesCount === 1) {
        sessionAnalysis.bouncedSessions++;
      }

      // Scroll depth
      const scrollDepth = session.scroll_depth?.max_percentage || 0;
      totalScrollDepth += scrollDepth;

      // Engagement score
      const engagement = session.engagement_score || 0;
      totalEngagement += engagement;

      // Device
      if (session.device_info?.is_mobile) {
        sessionAnalysis.mobileSessions++;
      } else {
        sessionAnalysis.desktopSessions++;
      }

      // Authenticated
      if (session.is_authenticated) {
        sessionAnalysis.authenticatedSessions++;
      }

      // Exit page - posledná navštívená stránka
      if (session.pages_visited && session.pages_visited.length > 0) {
        const lastPage = session.pages_visited[session.pages_visited.length - 1];
        const exitUrl = cleanUrl(lastPage.page_url);
        sessionAnalysis.exitPages[exitUrl] = (sessionAnalysis.exitPages[exitUrl] || 0) + 1;

        // Landing page - prvá stránka
        const firstPage = session.pages_visited[0];
        const landingUrl = cleanUrl(firstPage.page_url);
        sessionAnalysis.landingPages[landingUrl] = (sessionAnalysis.landingPages[landingUrl] || 0) + 1;
      }

      // Clicks
      totalClicks += session.clicks?.length || 0;
    });

    // Vypočítaj priemery
    if (recentSessions.length > 0) {
      sessionAnalysis.avgDuration = (totalDuration / recentSessions.length).toFixed(1);
      sessionAnalysis.avgPagesVisited = (totalPages / recentSessions.length).toFixed(1);
      sessionAnalysis.avgScrollDepth = (totalScrollDepth / recentSessions.length).toFixed(1);
      sessionAnalysis.avgEngagementScore = (totalEngagement / recentSessions.length).toFixed(1);
      sessionAnalysis.avgClicksPerSession = (totalClicks / recentSessions.length).toFixed(1);
    }

    // Top exit pages zo sessions
    const topSessionExitPages = Object.entries(sessionAnalysis.exitPages)
      .map(([url, count]) => ({
        url,
        count,
        percentage: ((count / recentSessions.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top landing pages
    const topLandingPages = Object.entries(sessionAnalysis.landingPages)
      .map(([url, count]) => ({
        url,
        count,
        bounceRate: 0 // vypočítame nižšie
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Vypočítaj bounce rate pre landing pages
    topLandingPages.forEach(landing => {
      const sessionsStartingHere = recentSessions.filter(s => 
        s.pages_visited && s.pages_visited.length > 0 && 
        cleanUrl(s.pages_visited[0].page_url) === landing.url
      );
      const bouncedHere = sessionsStartingHere.filter(s => s.pages_visited.length === 1).length;
      landing.bounceRate = sessionsStartingHere.length > 0 
        ? ((bouncedHere / sessionsStartingHere.length) * 100).toFixed(1)
        : 0;
    });

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
      totalSessions: recentSessions.length,
      sessionAnalysis,
      analysis: {
        funnelData,
        topExitPages,
        topSessionExitPages,
        topLandingPages,
        pagesWithBounceRate,
        topClicks,
        deviceStats,
        utmExitRates
      },
      recommendations: generateRecommendations(funnelData, pagesWithBounceRate, topSessionExitPages, sessionAnalysis)
    });

  } catch (error) {
    console.error('Error analyzing dropoff:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function cleanUrl(url) {
  if (!url) return '/';
  // Odstráň query parametre okrem dôležitých
  const urlObj = new URL(url, 'https://example.com');
  const pathname = urlObj.pathname;
  
  // Normalizuj pathname
  if (pathname === '/' || pathname === '/domov') return '/domov';
  if (pathname.includes('/katalog')) return '/katalog';
  if (pathname.includes('/detail-domu') || pathname.includes('/detaildomu')) return '/detail-domu';
  if (pathname.includes('/konfigurator')) return '/konfigurator';
  if (pathname.includes('/kontakt')) return '/kontakt';
  if (pathname.includes('/dotacia')) return '/dotacia-americana';
  if (pathname.includes('/blog')) return '/blog';
  if (pathname.includes('/o-nas') || pathname.includes('/onas')) return '/o-nas';
  
  return pathname;
}

function generateRecommendations(funnel, bouncePages, exitPages, sessionAnalysis) {
  const recommendations = [];

  // 1. Najväčší dropoff v funnel
  const maxDropoff = funnel.reduce((max, step) => 
    parseFloat(step.dropoffRate) > parseFloat(max.dropoffRate) ? step : max
  , funnel[0]);

  if (parseFloat(maxDropoff.dropoffRate) > 50) {
    recommendations.push({
      severity: 'critical',
      area: maxDropoff.step,
      issue: `🚨 Kritický dropoff ${maxDropoff.dropoffRate}% na "${maxDropoff.step}"`,
      suggestion: `Toto je najväčší problém! Zákazníci masívne odchádzajú z tejto stránky. Odporúčania:\n• Skontrolujte načítavanie stránky (rýchlosť)\n• Pridajte jasné CTA tlačidlá\n• Zjednodušte formulár ak je tam\n• Pridajte dôveryhodné prvky (recenzie, certifikáty)`
    });
  }

  // 2. Bounce rate
  if (sessionAnalysis.bouncedSessions > 0) {
    const bounceRate = ((sessionAnalysis.bouncedSessions / sessionAnalysis.totalSessions) * 100).toFixed(1);
    if (parseFloat(bounceRate) > 60) {
      recommendations.push({
        severity: 'high',
        area: 'Celkový bounce rate',
        issue: `${bounceRate}% návštevníkov opúšťa stránku ihneď po príchode`,
        suggestion: `• Zlepšite prvý dojem (hero sekcia)\n• Pridajte jasné value proposition\n• Skontrolujte mobilnú responzívnosť\n• Optimalizujte rýchlosť načítania`
      });
    }
  }

  // 3. Nízka scroll depth
  if (parseFloat(sessionAnalysis.avgScrollDepth) < 30) {
    recommendations.push({
      severity: 'high',
      area: 'Scroll depth',
      issue: `Priemerne ${sessionAnalysis.avgScrollDepth}% - návštevníci takmer neskrolujú`,
      suggestion: `• Obsah nad fold musí byť atraktívnejší\n• Pridajte vizuálne vodítka na scroll (šípky)\n• Zlepšite hero sekciu\n• Dôležitý obsah presuňte vyššie`
    });
  }

  // 4. Málo kliknutí
  if (parseFloat(sessionAnalysis.avgClicksPerSession) < 2) {
    recommendations.push({
      severity: 'medium',
      area: 'Interakcia',
      issue: `Len ${sessionAnalysis.avgClicksPerSession} kliknutí/session - nízka angažovanosť`,
      suggestion: `• Pridajte viac interaktívnych prvkov\n• CTA tlačidlá musia byť viditeľnejšie\n• Pridajte hover efekty\n• Zvýraznite dôležité akcie`
    });
  }

  // 5. Stránky s vysokým bounce rate
  const highBouncePage = bouncePages[0];
  if (highBouncePage && parseFloat(highBouncePage.bounceRate) > 70) {
    recommendations.push({
      severity: 'high',
      area: highBouncePage.url,
      issue: `Vysoký bounce rate ${highBouncePage.bounceRate}%`,
      suggestion: `Táto stránka potrebuje urgentné zlepšenie:\n• Pridajte jasné CTA\n• Zlepšite obsah\n• Skontrolujte mobilnú verziu\n• Pridajte odkazy na relevantné sekcie`
    });
  }

  // 6. Top exit page
  const topExit = exitPages[0];
  if (topExit && topExit.count > sessionAnalysis.totalSessions * 0.2) {
    recommendations.push({
      severity: 'medium',
      area: topExit.url,
      issue: `${topExit.percentage}% návštevníkov odchádza z ${topExit.url}`,
      suggestion: `• Pridajte "Ďalšie kroky" sekciu\n• Ponúknite súvisiaci obsah\n• Pridajte kontaktný formulár\n• Zlepšite navigáciu`
    });
  }

  // 7. Mobilní vs Desktop
  const mobileRate = (sessionAnalysis.mobileSessions / sessionAnalysis.totalSessions * 100).toFixed(1);
  if (parseFloat(mobileRate) > 70) {
    recommendations.push({
      severity: 'info',
      area: 'Mobile traffic',
      issue: `${mobileRate}% návštevníkov je z mobilu`,
      suggestion: `• Prioritizujte mobilnú optimalizáciu\n• Väčšie tlačidlá\n• Jednoduchšia navigácia\n• Rýchlejšie načítavanie obrázkov`
    });
  }

  return recommendations;
}