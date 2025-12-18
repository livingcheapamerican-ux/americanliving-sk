import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role - automatická úloha
    const INACTIVE_THRESHOLD_MINUTES = 5; // Session je neaktívna po 5 minútach nečinnosti
    
    // Vypočítaj threshold čas
    const thresholdTime = new Date(Date.now() - INACTIVE_THRESHOLD_MINUTES * 60 * 1000);
    
    // Načítaj všetky aktívne sessions
    const activeSessions = await base44.asServiceRole.entities.UserSession.filter({
      is_active: true
    });
    
    console.log(`Našiel som ${activeSessions.length} aktívnych sessions`);
    
    // Filtruj tie, ktoré sú neaktívne (posledná aktivita > 5 minút)
    const inactiveSessions = activeSessions.filter(session => {
      const lastActivity = session.last_activity || session.updated_date || session.start_time;
      const lastActivityDate = new Date(lastActivity);
      return lastActivityDate < thresholdTime;
    });
    
    console.log(`Označujem ${inactiveSessions.length} sessions ako neaktívne`);
    
    // Aktualizuj všetky neaktívne sessions
    const updatePromises = inactiveSessions.map(session => 
      base44.asServiceRole.entities.UserSession.update(session.id, {
        is_active: false,
        end_time: session.last_activity || session.updated_date || new Date().toISOString()
      })
    );
    
    await Promise.all(updatePromises);
    
    // Spočítaj iba skutočne aktívne sessions
    const realActiveCount = activeSessions.length - inactiveSessions.length;
    
    return Response.json({
      success: true,
      total_active_before: activeSessions.length,
      marked_inactive: inactiveSessions.length,
      real_active_now: realActiveCount,
      threshold_minutes: INACTIVE_THRESHOLD_MINUTES
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});