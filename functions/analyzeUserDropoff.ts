import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // CRITICAL: Musíme byť autentifikovaní PRED použitím asServiceRole
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Ak user nie je prihlásený, vrátime unauthorized
      return Response.json({ error: 'Musíte byť prihlásený ako admin' }, { status: 401 });
    }

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin prístup potrebný' }, { status: 403 });
    }

    console.log(`✅ User authenticated: ${user.email}, role: ${user.role}`);

    // Načítaj VŠETKY UserEvent a UserSession pomocou asServiceRole
    console.log('📥 Začínam načítavať UserEvent a UserSession...');
    
    let allEvents = [];
    let allSessions = [];
    
    try {
      console.log('📥 Načítavam Events...');
      allEvents = await base44.asServiceRole.entities.UserEvent.list('-created_date', 10000);
      console.log(`✅ Events načítané: ${allEvents?.length || 0}`);
    } catch (err) {
      console.error('❌ Chyba pri načítaní Events:', err.message);
    }
    
    try {
      console.log('📥 Načítavam Sessions...');
      allSessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 10000);
      console.log(`✅ Sessions načítané: ${allSessions?.length || 0}`);
      
      if (allSessions && allSessions.length > 0) {
        console.log(`✅ PRVÁ SESSION:`, {
          id: allSessions[0].id,
          session_id: allSessions[0].session_id,
          user_email: allSessions[0].user_email,
          start_time: allSessions[0].start_time
        });
      }
    } catch (err) {
      console.error('❌ Chyba pri načítaní Sessions:', err.message, err.stack);
      allSessions = [];
    }

    console.log(`📦 Raw response - Events type: ${typeof allEvents}, Sessions type: ${typeof allSessions}`);
    console.log(`📦 Events is array: ${Array.isArray(allEvents)}, Sessions is array: ${Array.isArray(allSessions)}`);

    // Ensure arrays
    const recentEvents = Array.isArray(allEvents) ? allEvents : [];
    const recentSessions = Array.isArray(allSessions) ? allSessions : [];

    console.log(`📊 FINÁLNY POČET: ${recentEvents.length} udalostí a ${recentSessions.length} sessions`);
    
    if (recentSessions.length > 0) {
      console.log(`📋 Prvá session:`, JSON.stringify(recentSessions[0]).substring(0, 200));
    } else {
      console.log('⚠️ ŽIADNE SESSIONS - problém s načítaním alebo databáza je prázdna');
    }

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

    // 1. HLAVNÁ ANALÝZA zo UserSession (najpresnejšie dáta)
    const pageVisitStats = {};
    
    recentSessions.forEach(session => {
      if (!session.pages_visited || session.pages_visited.length === 0) return;

      session.pages_visited.forEach((page, idx) => {
        const url = cleanUrl(page.page_url);
        
        if (!pageVisitStats[url]) {
          pageVisitStats[url] = {
            url,
            totalVisits: 0,
            totalTimeSpent: 0,
            totalScrollDepth: 0,
            bounces: 0,
            exits: 0,
            entries: 0,
            sessions: []
          };
        }

        pageVisitStats[url].totalVisits++;
        pageVisitStats[url].totalTimeSpent += (page.time_spent_seconds || 0);
        pageVisitStats[url].totalScrollDepth += (page.scroll_depth_percentage || 0);
        pageVisitStats[url].sessions.push(session.session_id);

        // Entry page
        if (idx === 0) {
          pageVisitStats[url].entries++;
          if (session.pages_visited.length === 1) {
            pageVisitStats[url].bounces++;
          }
        }

        // Exit page
        if (idx === session.pages_visited.length - 1) {
          pageVisitStats[url].exits++;
        }
      });
    });

    // 2. CONVERSION FUNNEL zo sessions
    const funnelSteps = [
      { name: 'Domov (Homepage)', url: '/domov' },
      { name: 'Katalóg', url: '/katalog' },
      { name: 'Detail domu', url: '/detail-domu' },
      { name: 'Konfigurátor', url: '/konfigurator' },
      { name: 'Kontakt', url: '/kontakt' }
    ];

    const funnelData = funnelSteps.map(step => {
      const sessionsAtStep = recentSessions.filter(s => 
        s.pages_visited && s.pages_visited.some(p => cleanUrl(p.page_url) === step.url)
      );
      return {
        step: step.name,
        visitors: sessionsAtStep.length,
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

    // 3. STRÁNKY S NAJVYŠŠÍM BOUNCE RATE (zo stats)
    const pagesWithBounceRate = Object.values(pageVisitStats)
      .filter(p => p.entries >= 3) // Aspoň 3 vstupy
      .map(p => ({
        url: p.url,
        entries: p.entries,
        bounces: p.bounces,
        bounceRate: p.entries > 0 ? ((p.bounces / p.entries) * 100).toFixed(1) : 0,
        avgTimeSpent: p.totalVisits > 0 ? (p.totalTimeSpent / p.totalVisits).toFixed(1) : 0,
        avgScrollDepth: p.totalVisits > 0 ? (p.totalScrollDepth / p.totalVisits).toFixed(1) : 0
      }))
      .sort((a, b) => parseFloat(b.bounceRate) - parseFloat(a.bounceRate))
      .slice(0, 10);

    // 4. NAJČASTEJŠIE KLIKNUTIA zo sessions
    const clickStats = {};
    
    recentSessions.forEach(session => {
      if (!session.clicks) return;
      session.clicks.forEach(click => {
        const key = `${click.text || click.element}`;
        const page = cleanUrl(click.page_url);
        const fullKey = `${page} → ${key}`;
        clickStats[fullKey] = (clickStats[fullKey] || 0) + 1;
      });
    });

    const topClicks = Object.entries(clickStats)
      .map(([key, count]) => ({ button: key, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 15);

    // 6. Analýza zariadení zo sessions
    const deviceStats = {
      mobile: sessionAnalysis.mobileSessions,
      desktop: sessionAnalysis.desktopSessions
    };

    // 7. UTM source analýza zo sessions
    const utmAnalysis = {};
    recentSessions.forEach(session => {
      const source = session.utm_params?.utm_source || session.referrer_domain || 'direct';
      if (!utmAnalysis[source]) {
        utmAnalysis[source] = { 
          sessions: 0, 
          avgDuration: 0,
          avgPages: 0,
          bounces: 0,
          totalDuration: 0,
          totalPages: 0
        };
      }
      utmAnalysis[source].sessions++;
      utmAnalysis[source].totalDuration += (session.duration_seconds || 0);
      utmAnalysis[source].totalPages += (session.pages_visited?.length || 0);
      if (session.pages_visited?.length === 1) {
        utmAnalysis[source].bounces++;
      }
    });

    const utmExitRates = Object.entries(utmAnalysis)
      .map(([source, data]) => ({
        source,
        sessions: data.sessions,
        bounceRate: data.sessions > 0 ? ((data.bounces / data.sessions) * 100).toFixed(1) : 0,
        avgDuration: data.sessions > 0 ? (data.totalDuration / data.sessions).toFixed(1) : 0,
        avgPages: data.sessions > 0 ? (data.totalPages / data.sessions).toFixed(1) : 0
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    return Response.json({
      success: true,
      period: 'Všetky dáta',
      totalEvents: recentEvents.length,
      totalSessions: recentSessions.length,
      sessionAnalysis,
      analysis: {
        funnelData,
        topSessionExitPages,
        topLandingPages,
        pagesWithBounceRate,
        topClicks,
        deviceStats,
        utmExitRates
      },
      recommendations: generateRecommendations(funnelData, pagesWithBounceRate, topSessionExitPages, sessionAnalysis),
      debug: {
        sessionsCount: recentSessions.length,
        eventsCount: recentEvents.length,
        sampleSession: recentSessions[0] || null
      }
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