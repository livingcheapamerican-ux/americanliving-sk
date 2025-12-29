import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky sessions
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 5000);
    
    // Načítaj všetky domy
    const domy = await base44.asServiceRole.entities.Dom.list();
    const domyMap = {};
    domy.forEach(dom => {
      domyMap[dom.id] = dom;
    });

    let updatedCount = 0;
    let processedCount = 0;

    // Spracuj každú session
    for (const session of sessions) {
      processedCount++;
      
      if (!session.pages_visited || session.pages_visited.length === 0) {
        continue;
      }

      const domInteractions = session.dom_interactions || [];
      let needsUpdate = false;

      // Prejdi všetky navštívené stránky
      session.pages_visited.forEach(page => {
        if (page.page_url?.includes('DetailDomu')) {
          // Parsuj dom_id z URL
          const urlParams = new URLSearchParams(page.page_url.split('?')[1] || '');
          const domId = urlParams.get('id');
          
          if (domId && domyMap[domId]) {
            const dom = domyMap[domId];
            
            // Skontroluj, či už existuje táto interakcia
            const existingInteraction = domInteractions.find(
              i => i.dom_id === domId && i.action === 'view'
            );
            
            if (!existingInteraction) {
              // Pridaj novú interakciu
              domInteractions.push({
                dom_id: domId,
                dom_nazov: dom.nazov,
                action: 'view',
                category: dom.kategoria,
                timestamp: page.timestamp || session.start_time,
                duration_seconds: page.time_spent_seconds || 0
              });
              needsUpdate = true;
            }
          }
        }
        
        // Detekuj konfigurátor interakcie z URL
        if (page.page_url?.includes('Konfigurator') || page.page_url?.includes('konfigurator')) {
          const urlParams = new URLSearchParams(page.page_url.split('?')[1] || '');
          const domId = urlParams.get('id');
          
          if (domId && domyMap[domId]) {
            const dom = domyMap[domId];
            
            const existingConfigInteraction = domInteractions.find(
              i => i.dom_id === domId && i.action === 'configurator_open'
            );
            
            if (!existingConfigInteraction) {
              domInteractions.push({
                dom_id: domId,
                dom_nazov: dom.nazov,
                action: 'configurator_open',
                category: dom.kategoria,
                timestamp: page.timestamp || session.start_time,
                duration_seconds: page.time_spent_seconds || 0
              });
              needsUpdate = true;
            }
          }
        }
      });

      // Aktualizuj session ak boli pridané nové interakcie
      if (needsUpdate) {
        await base44.asServiceRole.entities.UserSession.update(session.id, {
          dom_interactions: domInteractions
        });
        updatedCount++;
      }
    }

    return Response.json({
      success: true,
      message: `Spracovaných ${processedCount} sessions, aktualizovaných ${updatedCount} sessions.`,
      processedCount,
      updatedCount
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});