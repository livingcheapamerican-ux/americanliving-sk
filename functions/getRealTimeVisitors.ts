import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj iba aktívne sessions (is_active = true)
    let activeSessions = await base44.asServiceRole.entities.UserSession.filter({
      is_active: true
    });

    // Zabezpeč že activeSessions je vždy pole
    if (!Array.isArray(activeSessions)) {
      activeSessions = [];
    }

    // Filter sessions ktoré mali aktivitu za posledných 5 minút
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const reallySessions = activeSessions.filter(s => {
      const lastActivity = s.last_activity ? new Date(s.last_activity) : new Date(s.start_time);
      return lastActivity >= fiveMinutesAgo;
    });

    console.log(`📊 Active sessions: ${activeSessions.length}, Really online: ${reallySessions.length}`);

    // Vráť počet a detaily
    return Response.json({
      count: reallySessions.length,
      sessions: reallySessions.map(s => ({
        id: s.id,
        user_email: s.user_email,
        user_name: s.user_name,
        start_time: s.start_time,
        last_activity: s.last_activity,
        location_info: s.location_info,
        device_info: s.device_info,
        current_page: s.current_page
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});