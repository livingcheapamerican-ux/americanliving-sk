import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('🧠 Starting visitor segmentation analysis...');
    
    // Fetch all sessions (last 30 days)
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 2000);
    const domy = await base44.asServiceRole.entities.Dom.list();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(s => new Date(s.created_date) >= thirtyDaysAgo);
    
    console.log(`📊 Analyzing ${recentSessions.length} sessions...`);
    
    // Segmentácia návštevníkov
    const segments = {
      VAZNY_ZAJEM: { name: 'Zákazníci s vážnym záujmom', visitors: [], criteria: [] },
      INVESTORI: { name: 'Potenciálni investori', visitors: [], criteria: [] },
      NIZKE_NAKLADY: { name: 'Rodiny hľadajúce nízke náklady', visitors: [], criteria: [] },
      LUXURY_SEEKERS: { name: 'Zákazníci hľadajúci prémiové domy', visitors: [], criteria: [] },
      TIRE_KICKERS: { name: 'Zvedavci (nízky záujem)', visitors: [], criteria: [] },
      RETURNING_VISITORS: { name: 'Vracajúci sa návštevníci', visitors: [], criteria: [] }
    };
    
    // Group sessions by visitor
    const visitorSessions = {};
    recentSessions.forEach(s => {
      const visitorId = s.user_email || s.location_info?.ip || s.session_id;
      if (!visitorSessions[visitorId]) {
        visitorSessions[visitorId] = [];
      }
      visitorSessions[visitorId].push(s);
    });
    
    // Analyze each visitor
    for (const [visitorId, visitorSessionsList] of Object.entries(visitorSessions)) {
      const totalSessions = visitorSessionsList.length;
      const totalDuration = visitorSessionsList.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
      const avgDuration = totalDuration / totalSessions;
      const totalPages = visitorSessionsList.reduce((acc, s) => acc + (s.pages_visited?.length || 0), 0);
      const configuratorInteractions = visitorSessionsList.reduce((acc, s) => acc + (s.configurator_interactions?.length || 0), 0);
      const conversions = visitorSessionsList.reduce((acc, s) => acc + (s.conversions?.length || 0), 0);
      
      // Analyzovať navštívené domy a ich ceny
      const viewedHouses = new Set();
      const viewedPrices = [];
      visitorSessionsList.forEach(s => {
        s.pages_visited?.forEach(p => {
          if (p.page_url?.includes('DetailDomu')) {
            const urlParams = new URLSearchParams(p.page_url.split('?')[1] || '');
            const domId = urlParams.get('id');
            if (domId) {
              viewedHouses.add(domId);
              const dom = domy.find(d => d.id === domId);
              if (dom?.zakladna_cena) {
                viewedPrices.push(dom.zakladna_cena);
              }
            }
          }
        });
      });
      
      const avgPrice = viewedPrices.length > 0 
        ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length 
        : 0;
      
      const visitor = {
        id: visitorId,
        email: visitorSessionsList[0].user_email,
        totalSessions,
        avgDuration,
        totalPages,
        configuratorInteractions,
        conversions,
        viewedHousesCount: viewedHouses.size,
        avgPrice,
        lastVisit: visitorSessionsList[0].start_time,
        sessions: visitorSessionsList
      };
      
      // SEGMENTÁCIA
      
      // 1. Zákazníci s vážnym záujmom
      if (avgDuration > 120 && configuratorInteractions > 2 && viewedHouses.size >= 2) {
        segments.VAZNY_ZAJEM.visitors.push(visitor);
      }
      
      // 2. Potenciálni investori
      if (viewedHouses.size >= 5 && avgDuration > 180 && totalSessions >= 2) {
        segments.INVESTORI.visitors.push(visitor);
      }
      
      // 3. Rodiny hľadajúce nízke náklady
      if (avgPrice > 0 && avgPrice < 60000 && configuratorInteractions > 0) {
        segments.NIZKE_NAKLADY.visitors.push(visitor);
      }
      
      // 4. Luxury seekers
      if (avgPrice > 100000 && avgDuration > 150) {
        segments.LUXURY_SEEKERS.visitors.push(visitor);
      }
      
      // 5. Tire kickers
      if (avgDuration < 30 && totalPages < 3 && configuratorInteractions === 0) {
        segments.TIRE_KICKERS.visitors.push(visitor);
      }
      
      // 6. Vracajúci sa návštevníci
      if (totalSessions >= 3) {
        segments.RETURNING_VISITORS.visitors.push(visitor);
      }
    }
    
    // Calculate segment insights
    const segmentInsights = [];
    
    for (const [key, segment] of Object.entries(segments)) {
      if (segment.visitors.length === 0) continue;
      
      const avgConversion = segment.visitors.reduce((acc, v) => acc + v.conversions, 0) / segment.visitors.length;
      const avgViewedHouses = segment.visitors.reduce((acc, v) => acc + v.viewedHousesCount, 0) / segment.visitors.length;
      const avgPrice = segment.visitors.reduce((acc, v) => acc + v.avgPrice, 0) / segment.visitors.length;
      
      // AI-based recommendations
      let recommendations = [];
      let targetingStrategy = '';
      
      if (key === 'VAZNY_ZAJEM') {
        recommendations = [
          'Poslať follow-up email s cenovou ponukou',
          'Retargetingová kampaň s špecifickými domami ktoré si prezerali',
          'Osobný telefonát od predajcu'
        ];
        targetingStrategy = 'Facebook/Instagram Retargeting s konkrétnymi modelmi + Video testimonialy';
      } else if (key === 'INVESTORI') {
        recommendations = [
          'Kampaň zdôrazňujúca ROI a nízke prevádzkové náklady',
          'Pozvať na stretnutie s finančným poradcom',
          'Ukázať case study s ROI analýzou'
        ];
        targetingStrategy = 'LinkedIn kampaň + Google Ads s kľúčovými slovami "investícia", "výnosný dom"';
      } else if (key === 'NIZKE_NAKLADY') {
        recommendations = [
          'Zdôrazniť štartovací dom a nízke energie',
          'Kampaň "Prvé bývanie" s hypotékovým kalkulátorom',
          'Video tour lacnejších modelov'
        ];
        targetingStrategy = 'Facebook/Instagram, vek 25-35, záujem "nové bývanie", "hypotéka"';
      } else if (key === 'LUXURY_SEEKERS') {
        recommendations = [
          'Prémiová brožúra s exkluzívnymi fotkami',
          'Pozvánka na súkromnú prehliadku reálneho domu',
          'Zdôrazniť customizáciu a high-end riešenia'
        ];
        targetingStrategy = 'Google Ads, príjmové cielenie TOP 10%, Instagram Stories s prémiovou estetikou';
      } else if (key === 'TIRE_KICKERS') {
        recommendations = [
          'Ignorovať alebo veľmi nízky budget',
          'Zamerať sa na vzdelávacie contentu a brand awareness'
        ];
        targetingStrategy = 'Žiadna priama kampaň. Použiť len organické posty a SEO.';
      } else if (key === 'RETURNING_VISITORS') {
        recommendations = [
          'Poslať špeciálnu ponuku "Pre vracajúcich sa"',
          'Email s novinkami a akciami',
          'Retargeting s urgency messagingom'
        ];
        targetingStrategy = 'Email marketing + Facebook Custom Audiences (návštevníci webu 30 dní)';
      }
      
      segmentInsights.push({
        segment_key: key,
        segment_name: segment.name,
        visitor_count: segment.visitors.length,
        avg_conversion_rate: (avgConversion * 100).toFixed(2),
        avg_houses_viewed: avgViewedHouses.toFixed(1),
        avg_price_interest: avgPrice.toFixed(0),
        recommendations,
        targeting_strategy: targetingStrategy,
        priority: segment.visitors.length > 10 ? 'high' : segment.visitors.length > 5 ? 'medium' : 'low'
      });
    }
    
    // Save insights
    await base44.asServiceRole.entities.MarketingInsight.create({
      insight_type: 'visitor_segmentation',
      title: 'Automatická segmentácia návštevníkov',
      description: `Identifikovaných ${segmentInsights.length} segmentov z ${recentSessions.length} sessions`,
      data: {
        segments: segmentInsights,
        total_sessions_analyzed: recentSessions.length,
        analysis_date: new Date().toISOString()
      },
      confidence_score: 85,
      action_required: true
    });
    
    console.log('✅ Segmentation complete:', segmentInsights);
    
    return Response.json({
      success: true,
      segments: segmentInsights,
      total_visitors: Object.keys(visitorSessions).length,
      message: `Analyzovaných ${recentSessions.length} sessions, identifikovaných ${segmentInsights.length} segmentov`
    });
    
  } catch (error) {
    console.error('❌ Segmentation error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});