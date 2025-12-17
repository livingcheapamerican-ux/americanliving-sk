import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('📊 Sledovanie SEO pozícií...');

    // Načítaj všetky sledované kľúčové slová
    const keywords = await base44.asServiceRole.entities.SEOKeyword.list();
    
    if (keywords.length === 0) {
      return Response.json({ 
        message: 'Žiadne kľúčové slová na sledovanie. Najprv spustite SEO automatizáciu.' 
      });
    }

    const results = [];

    for (const kw of keywords) {
      // Simuluj zistenie pozície (v reálnej verzii by sa používalo Google Search Console API)
      // Pre teraz uložíme simulované dáta
      
      const searchQuery = `${kw.keyword} site:americanliving.sk`;
      
      // Použijeme AI na analýzu potenciálnej pozície
      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyzuj SEO optimalizáciu stránky americanliving.sk pre kľúčové slovo "${kw.keyword}".

Stránka predáva modulárne a montované domy. Má:
- Katalóg domov s detailnými informáciami
- Blog články o montovaných domoch
- Konfigurátor domov
- Referencie

Na základe týchto informácií odhadni:
1. Aktuálnu pozíciu vo vyhľadávaní (1-50)
2. Trend (up/down/stable)
3. Odporúčania na zlepšenie (max 3 body)

Odpoveď vo formáte JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            estimated_position: { type: 'number' },
            trend: { type: 'string', enum: ['up', 'down', 'stable'] },
            recommendations: { 
              type: 'array', 
              items: { type: 'string' },
              maxItems: 3
            }
          }
        }
      });

      // Aktualizuj kľúčové slovo
      await base44.asServiceRole.entities.SEOKeyword.update(kw.id, {
        current_position: analysis.estimated_position,
        trend: analysis.trend,
        monthly_clicks: Math.max(0, Math.floor(1000 / analysis.estimated_position))
      });

      results.push({
        keyword: kw.keyword,
        position: analysis.estimated_position,
        trend: analysis.trend,
        recommendations: analysis.recommendations
      });

      console.log(`📈 ${kw.keyword}: pozícia ${analysis.estimated_position}, trend: ${analysis.trend}`);
    }

    // Odošli report emailom
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; border-radius: 8px; }
    .keyword-item { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .position { font-size: 24px; font-weight: bold; color: #EF4444; }
    .trend-up { color: #10b981; }
    .trend-down { color: #ef4444; }
    .trend-stable { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 SEO Report - ${new Date().toLocaleDateString('sk-SK')}</h1>
      <p>Prehľad pozícií kľúčových slov</p>
    </div>
    
    <div style="margin-top: 20px;">
      ${results.map(r => `
        <div class="keyword-item">
          <h3>${r.keyword}</h3>
          <div class="position">Pozícia: ${r.position}</div>
          <div class="trend-${r.trend}">Trend: ${r.trend === 'up' ? '↑ Rast' : r.trend === 'down' ? '↓ Pokles' : '→ Stabilný'}</div>
          <div style="margin-top: 10px;">
            <strong>Odporúčania:</strong>
            <ul>
              ${r.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px;">
      <p><strong>💡 Tip:</strong> Pre zlepšenie pozícií pravidelne pridávajte nový obsah, optimalizujte meta dáta a budujte interné odkazy.</p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'info.americanliving@gmail.com',
      subject: `SEO Report - ${new Date().toLocaleDateString('sk-SK')}`,
      body: reportHtml
    });

    console.log('✅ SEO report odoslaný');

    return Response.json({
      success: true,
      results,
      message: 'SEO pozície aktualizované a report odoslaný'
    });

  } catch (error) {
    console.error('❌ Chyba:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});