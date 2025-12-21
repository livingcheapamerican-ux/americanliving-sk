import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Zbiera a agreguje všetky GTM dáta pre AI Marketingový Riaditeľ
 * Poskytuje komplexný pohľad na user behavior, preferencie a trendy
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all relevant data
    const [sessions, domy, dopyty, blogs] = await Promise.all([
      base44.asServiceRole.entities.UserSession.list('-created_date', 1000),
      base44.asServiceRole.entities.Dom.list(),
      base44.asServiceRole.entities.Dopyt.list('-created_date', 500),
      base44.asServiceRole.entities.BlogPost.filter({ published: true })
    ]);

    // Analyze top houses
    const domVisits = {};
    sessions.forEach(s => {
      s.dom_interactions?.forEach(interaction => {
        const domId = interaction.dom_id;
        domVisits[domId] = (domVisits[domId] || 0) + 1;
      });
    });

    const topDomy = Object.entries(domVisits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => {
        const dom = domy.find(d => d.id === id);
        return dom ? {
          id: dom.id,
          nazov: dom.nazov,
          vyrobca: dom.vyrobca,
          zakladna_cena: dom.zakladna_cena,
          views: count,
          conversions: dopyty.filter(d => d.dom_id === id).length
        } : null;
      })
      .filter(Boolean);

    // Conversion rate
    const totalSessions = sessions.length;
    const conversions = dopyty.length;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions * 100).toFixed(2) : 0;

    // Average session duration
    const avgSessionDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / totalSessions;

    // Popular filters (from sessions with filter interactions)
    const filterUsage = {};
    sessions.forEach(s => {
      s.pages_visited?.forEach(page => {
        if (page.page_url?.includes('katalog')) {
          // Extract filters from URL
          const url = new URL(page.page_url, 'https://dummy.com');
          const filters = ['kategoria', 'vyrobca', 'typ', 'plocha', 'cena'];
          filters.forEach(f => {
            const val = url.searchParams.get(f);
            if (val && val !== 'all') {
              filterUsage[f] = filterUsage[f] || {};
              filterUsage[f][val] = (filterUsage[f][val] || 0) + 1;
            }
          });
        }
      });
    });

    // Hot price range (most common configurator final prices)
    const configuratorPrices = [];
    sessions.forEach(s => {
      s.configurator_interactions?.forEach(interaction => {
        if (interaction.price_at_time) {
          configuratorPrices.push(interaction.price_at_time);
        }
      });
    });

    const priceRanges = {
      '0-50k': configuratorPrices.filter(p => p < 50000).length,
      '50k-100k': configuratorPrices.filter(p => p >= 50000 && p < 100000).length,
      '100k-150k': configuratorPrices.filter(p => p >= 100000 && p < 150000).length,
      '150k+': configuratorPrices.filter(p => p >= 150000).length
    };

    const hotPriceRange = Object.entries(priceRanges)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '50k-100k';

    // Behavioral segmentation
    const behavioralProfiles = {
      explorers: sessions.filter(s => s.pages_visited?.length > 5 && !s.conversions?.length).length,
      deciders: sessions.filter(s => s.configurator_interactions?.length > 0).length,
      converters: sessions.filter(s => s.conversions?.length > 0).length
    };

    // Device breakdown
    const deviceBreakdown = {
      desktop: sessions.filter(s => s.device_info?.device_type === 'desktop').length,
      mobile: sessions.filter(s => s.device_info?.is_mobile).length,
      tablet: sessions.filter(s => s.device_info?.device_type === 'tablet').length
    };

    // Geographic distribution
    const geoDistribution = {};
    sessions.forEach(s => {
      const country = s.location_info?.country;
      if (country) {
        geoDistribution[country] = (geoDistribution[country] || 0) + 1;
      }
    });

    // Blog engagement
    const blogStats = blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      views: blog.views || 0,
      kategoria: blog.kategoria
    })).sort((a, b) => b.views - a.views).slice(0, 5);

    // Comprehensive AI snapshot
    const aiSnapshot = {
      timestamp: new Date().toISOString(),
      sessions_count: totalSessions,
      top_domy: topDomy,
      conversion_rate: parseFloat(conversionRate),
      avg_session_duration: Math.round(avgSessionDuration),
      popular_filters: filterUsage,
      hot_price_range: hotPriceRange,
      price_range_distribution: priceRanges,
      behavioral_profiles: behavioralProfiles,
      device_breakdown: deviceBreakdown,
      geographic_distribution: geoDistribution,
      top_blogs: blogStats,
      marketing_insights: {
        bounce_rate: (sessions.filter(s => s.session_tags?.includes('bounced')).length / totalSessions * 100).toFixed(2),
        avg_pages_per_session: (sessions.reduce((acc, s) => acc + (s.pages_visited?.length || 0), 0) / totalSessions).toFixed(2),
        mobile_percentage: ((deviceBreakdown.mobile / totalSessions) * 100).toFixed(2),
        returning_visitors: sessions.filter(s => s.is_returning).length
      }
    };

    return Response.json({
      success: true,
      snapshot: aiSnapshot,
      raw_counts: {
        total_sessions: totalSessions,
        total_domy: domy.length,
        total_dopyty: dopyty.length,
        total_blogs: blogs.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});