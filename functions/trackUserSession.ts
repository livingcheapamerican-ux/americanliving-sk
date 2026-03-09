import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, session_id, data } = body;

    if (action === 'create') {
      console.log('[trackUserSession] Creating session:', session_id);
      const session = await base44.entities.UserSession.create(data);
      console.log('[trackUserSession] Session created:', session.id);
      return Response.json({ 
        success: true, 
        data: {
          id: session.id,
          session_id: session.session_id,
          session_start_time: session.start_time,
          ...session
        }
      });
    }

    if (action === 'update') {
      console.log('[trackUserSession] Updating session:', session_id);
      const existing = await base44.entities.UserSession.filter({ session_id });
      if (existing.length === 0) {
        console.warn('[trackUserSession] Session not found:', session_id);
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      const updated = await base44.entities.UserSession.update(existing[0].id, data);
      console.log('[trackUserSession] Session updated');
      return Response.json({ 
        success: true, 
        data: {
          id: updated.id,
          session_id: updated.session_id,
          session_start_time: updated.start_time,
          ...updated
        }
      });
    }

    if (action === 'update_location') {
      console.log('[trackUserSession] Updating location for session:', session_id);
      const existing = await base44.entities.UserSession.filter({ session_id });
      if (existing.length === 0) {
        console.warn('[trackUserSession] Session not found for location update:', session_id);
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      const updated = await base44.entities.UserSession.update(existing[0].id, { location_info: data });
      console.log('[trackUserSession] Location updated');
      return Response.json({ 
        success: true, 
        data: {
          id: updated.id,
          session_id: updated.session_id,
          session_start_time: updated.start_time,
          ...updated
        }
      });
    }

    if (action === 'get') {
      console.log('[trackUserSession] Getting session:', session_id);
      const sessions = await base44.entities.UserSession.filter({ session_id });
      const session = sessions[0] || null;
      if (session) {
        console.log('[trackUserSession] Session found');
        return Response.json({ 
          success: true, 
          data: {
            id: session.id,
            session_id: session.session_id,
            session_start_time: session.start_time,
            ...session
          }
        });
      }
      console.warn('[trackUserSession] Session not found:', session_id);
      return Response.json({ success: true, data: null });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('trackUserSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});