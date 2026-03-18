import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Spracuj maximálne 50 sessions naraz (kvôli rate limit)
    const BATCH_SIZE = 50;
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 1000);
    
    // Filter - len sessions bez GPS
    const sessionsToProcess = sessions
      .filter(s => !s.location_info?.latitude)
      .filter(s => s.device_info?.ip || s.location_info?.ip)
      .slice(0, BATCH_SIZE);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let rateLimitHit = false;

    for (const session of sessionsToProcess) {
      const ip = session.device_info?.ip || session.location_info?.ip;

      try {
        // Získaj location z IP adresy s rate limit protection
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s medzi každým requestom
        
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        
        if (response.status === 429) {
          // Rate limit exceeded - stop processing
          rateLimitHit = true;
          break;
        }
        
        if (!response.ok) {
          errorCount++;
          continue;
        }

        const data = await response.json();

        if (data.error) {
          errorCount++;
          continue;
        }

        if (data.latitude && data.longitude) {
          await base44.asServiceRole.entities.UserSession.update(session.id, {
            location_info: {
              ip: data.ip,
              country: data.country_name,
              country_code: data.country_code,
              region: data.region,
              city: data.city,
              timezone: data.timezone,
              latitude: data.latitude,
              longitude: data.longitude
            }
          });
          updatedCount++;
        } else {
          errorCount++;
        }

      } catch (error) {
        console.error(`Error for IP ${ip}:`, error);
        errorCount++;
      }
    }

    const remainingCount = sessions.filter(s => !s.location_info?.latitude).length - sessionsToProcess.length;

    return Response.json({
      success: true,
      message: rateLimitHit 
        ? `⚠️ Rate limit - spracovaných ${updatedCount} sessions. Počkajte 5 minút a spustite znova.`
        : `✅ ${updatedCount} aktualizovaných, ${errorCount} chýb. ${remainingCount > 0 ? `Zostáva ${remainingCount} - spustite znova.` : 'Hotovo!'}`,
      updatedCount,
      errorCount,
      rateLimitHit,
      remainingCount
    });

  } catch (error) {
    console.error('Enrich location error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});