import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj iba aktívne sessions (is_active = true)
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      is_active: true
    });

    // Vráť počet a detaily
    return Response.json({
      count: sessions.length,
      sessions: sessions.map(s => ({
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