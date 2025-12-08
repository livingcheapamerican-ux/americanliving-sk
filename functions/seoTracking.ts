import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, referrer, timeOnPage, action } = await req.json();

    // Aktualizovať alebo vytvoriť SEO analytiku pre túto URL
    const existing = await base44.asServiceRole.entities.SEOAnalytika.filter({ url });
    
    if (existing.length > 0) {
      const record = existing[0];
      
      // Update statistics
      const updates = {
        pocet_navstev: (record.pocet_navstev || 0) + 1,
        last_analyzed: new Date().toISOString()
      };

      // Update average time on page
      if (timeOnPage) {
        const currentAvg = record.avg_time_on_page || 0;
        const totalVisits = record.pocet_navstev || 0;
        updates.avg_time_on_page = ((currentAvg * totalVisits) + timeOnPage) / (totalVisits + 1);
      }

      // Calculate bounce rate (simplified)
      if (action === 'bounce') {
        const currentRate = record.bounce_rate || 0;
        const totalVisits = record.pocet_navstev || 0;
        updates.bounce_rate = ((currentRate * totalVisits) + 100) / (totalVisits + 1);
      } else if (action === 'engaged') {
        const currentRate = record.bounce_rate || 0;
        const totalVisits = record.pocet_navstev || 0;
        updates.bounce_rate = (currentRate * totalVisits) / (totalVisits + 1);
      }

      await base44.asServiceRole.entities.SEOAnalytika.update(record.id, updates);
      
      return Response.json({ 
        success: true, 
        message: 'Tracking updated',
        data: updates
      });
    } else {
      // Create new record
      const newRecord = await base44.asServiceRole.entities.SEOAnalytika.create({
        url,
        page_title: 'Unknown',
        pocet_navstev: 1,
        unique_visitors: 1,
        avg_time_on_page: timeOnPage || 0,
        bounce_rate: action === 'bounce' ? 100 : 0,
        last_analyzed: new Date().toISOString()
      });

      return Response.json({ 
        success: true, 
        message: 'Tracking created',
        data: newRecord
      });
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});