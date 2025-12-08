import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format = 'json', dateFrom, dateTo } = await req.json();

    // Get all SEO analytics data
    const analytics = await base44.asServiceRole.entities.SEOAnalytika.list('-pocet_navstev', 100);
    const keywords = await base44.asServiceRole.entities.SEOKeyword.list('-search_volume', 50);

    // Calculate overall statistics
    const totalVisits = analytics.reduce((sum, a) => sum + (a.pocet_navstev || 0), 0);
    const avgSEOScore = analytics.reduce((sum, a) => sum + (a.seo_score || 0), 0) / analytics.length;
    const avgBounceRate = analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length;
    const avgTimeOnPage = analytics.reduce((sum, a) => sum + (a.avg_time_on_page || 0), 0) / analytics.length;

    // Top performing pages
    const topPages = analytics
      .sort((a, b) => (b.pocet_navstev || 0) - (a.pocet_navstev || 0))
      .slice(0, 10)
      .map(page => ({
        url: page.url,
        title: page.page_title,
        visits: page.pocet_navstev,
        seo_score: page.seo_score,
        bounce_rate: page.bounce_rate
      }));

    // Pages needing improvement
    const needsImprovement = analytics
      .filter(a => a.seo_score < 70)
      .sort((a, b) => a.seo_score - b.seo_score)
      .slice(0, 10)
      .map(page => ({
        url: page.url,
        title: page.page_title,
        seo_score: page.seo_score,
        issues: page.issues || []
      }));

    // Top keywords
    const topKeywords = keywords
      .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
      .slice(0, 20)
      .map(kw => ({
        keyword: kw.keyword,
        search_volume: kw.search_volume,
        position: kw.current_position,
        competition: kw.competition
      }));

    // All issues across site
    const allIssues = {};
    analytics.forEach(page => {
      (page.issues || []).forEach(issue => {
        const key = issue.message;
        allIssues[key] = (allIssues[key] || 0) + 1;
      });
    });

    const commonIssues = Object.entries(allIssues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    const report = {
      generated_at: new Date().toISOString(),
      period: { from: dateFrom, to: dateTo },
      summary: {
        total_pages: analytics.length,
        total_visits: totalVisits,
        avg_seo_score: Math.round(avgSEOScore * 10) / 10,
        avg_bounce_rate: Math.round(avgBounceRate * 10) / 10,
        avg_time_on_page: Math.round(avgTimeOnPage),
        total_keywords: keywords.length
      },
      top_performing_pages: topPages,
      pages_needing_improvement: needsImprovement,
      top_keywords: topKeywords,
      common_issues: commonIssues,
      recommendations: [
        {
          priority: 'high',
          title: 'Optimalizujte stránky s nízkym SEO skóre',
          description: `${needsImprovement.length} stránok má SEO skóre nižšie ako 70`
        },
        {
          priority: 'medium',
          title: 'Zlepšite bounce rate',
          description: `Priemerná miera odrazu je ${Math.round(avgBounceRate)}%, cieľ je pod 50%`
        },
        {
          priority: 'medium',
          title: 'Rozšírte obsah o cieľové kľúčové slová',
          description: `Zamerajte sa na top ${topKeywords.length} kľúčových slov s vysokým objemom vyhľadávania`
        }
      ]
    };

    if (format === 'html') {
      // Generate HTML report
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SEO Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            h1 { color: #1a1a1a; }
            h2 { color: #333; margin-top: 30px; }
            .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-value { font-size: 32px; font-weight: bold; color: #2563eb; }
            .metric-label { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #2563eb; color: white; }
            .score-good { color: #16a34a; font-weight: bold; }
            .score-medium { color: #eab308; font-weight: bold; }
            .score-poor { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>SEO Report</h1>
          <p>Vygenerované: ${new Date().toLocaleString('sk-SK')}</p>
          
          <div class="summary">
            <h2>Celkové štatistiky</h2>
            <div class="metric">
              <div class="metric-value">${report.summary.total_pages}</div>
              <div class="metric-label">Stránok</div>
            </div>
            <div class="metric">
              <div class="metric-value">${report.summary.total_visits.toLocaleString()}</div>
              <div class="metric-label">Návštev</div>
            </div>
            <div class="metric">
              <div class="metric-value">${report.summary.avg_seo_score}</div>
              <div class="metric-label">Priem. SEO skóre</div>
            </div>
            <div class="metric">
              <div class="metric-value">${report.summary.avg_bounce_rate}%</div>
              <div class="metric-label">Priem. bounce rate</div>
            </div>
          </div>

          <h2>Top stránky</h2>
          <table>
            <tr><th>Stránka</th><th>Návštevy</th><th>SEO skóre</th><th>Bounce rate</th></tr>
            ${topPages.map(page => `
              <tr>
                <td>${page.title}</td>
                <td>${page.visits}</td>
                <td class="${page.seo_score >= 80 ? 'score-good' : page.seo_score >= 60 ? 'score-medium' : 'score-poor'}">${page.seo_score}</td>
                <td>${Math.round(page.bounce_rate)}%</td>
              </tr>
            `).join('')}
          </table>

          <h2>Stránky vyžadujúce pozornosť</h2>
          <table>
            <tr><th>Stránka</th><th>SEO skóre</th><th>Problémy</th></tr>
            ${needsImprovement.map(page => `
              <tr>
                <td>${page.title}</td>
                <td class="score-poor">${page.seo_score}</td>
                <td>${page.issues.length}</td>
              </tr>
            `).join('')}
          </table>

          <h2>Top kľúčové slová</h2>
          <table>
            <tr><th>Kľúčové slovo</th><th>Objem vyhľadávania</th><th>Pozícia</th><th>Konkurencia</th></tr>
            ${topKeywords.slice(0, 10).map(kw => `
              <tr>
                <td>${kw.keyword}</td>
                <td>${kw.search_volume?.toLocaleString() || 'N/A'}</td>
                <td>${kw.position || 'N/A'}</td>
                <td>${kw.competition || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="seo-report-${new Date().toISOString().split('T')[0]}.html"`
        }
      });
    }

    return Response.json({
      success: true,
      report
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});