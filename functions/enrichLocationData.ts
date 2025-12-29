import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky sessions bez location_info
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 5000);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const session of sessions) {
      // Skip ak už má location_info
      if (session.location_info?.latitude) {
        skippedCount++;
        continue;
      }

      // Skip ak nemá IP adresu
      if (!session.device_info?.ip && !session.location_info?.ip) {
        skippedCount++;
        continue;
      }

      const ip = session.device_info?.ip || session.location_info?.ip;

      try {
        // Získaj location z IP adresy
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        
        if (!response.ok) {
          errorCount++;
          // Rate limit - čakaj 1 sekundu
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const data = await response.json();

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

        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Error for IP ${ip}:`, error);
        errorCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return Response.json({
      success: true,
      message: `Spracovaných ${sessions.length} sessions: ${updatedCount} aktualizovaných, ${skippedCount} preskočených, ${errorCount} chýb.`,
      updatedCount,
      skippedCount,
      errorCount
    });

  } catch (error) {
    console.error('Enrich location error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});