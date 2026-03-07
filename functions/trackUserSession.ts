import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, session_id, data } = body;

    if (action === 'create') {
      const created = await base44.asServiceRole.entities.UserSession.create(data);
      return Response.json({ success: true, id: created.id });

    } else if (action === 'update') {
      const sessions = await base44.asServiceRole.entities.UserSession.filter({ session_id });
      if (sessions.length === 0) return Response.json({ success: false, error: 'Session not found' });
      const session = sessions[0];
      await base44.asServiceRole.entities.UserSession.update(session.id, data);
      return Response.json({ success: true, session_start_time: session.start_time, pages_visited: session.pages_visited });

    } else if (action === 'get') {
      const sessions = await base44.asServiceRole.entities.UserSession.filter({ session_id });
      if (sessions.length === 0) return Response.json({ success: false, error: 'Session not found' });
      return Response.json({ success: true, session: sessions[0] });

    } else if (action === 'update_location') {
      const sessions = await base44.asServiceRole.entities.UserSession.filter({ session_id });
      if (sessions.length === 0) return Response.json({ success: false });
      await base44.asServiceRole.entities.UserSession.update(sessions[0].id, { location_info: data });
      return Response.json({ success: true });

    } else {
      return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});