import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, session_id, data } = body;

    if (action === 'create') {
      const session = await base44.entities.UserSession.create(data);
      return Response.json({ success: true, data: session });
    }

    if (action === 'update') {
      const existing = await base44.entities.UserSession.filter({ session_id });
      if (existing.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      const updated = await base44.entities.UserSession.update(existing[0].id, data);
      return Response.json({ success: true, data: updated });
    }

    if (action === 'update_location') {
      const existing = await base44.entities.UserSession.filter({ session_id });
      if (existing.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      const updated = await base44.entities.UserSession.update(existing[0].id, { location_info: data });
      return Response.json({ success: true, data: updated });
    }

    if (action === 'get') {
      const session = await base44.entities.UserSession.filter({ session_id });
      return Response.json({ success: true, data: session[0] || null });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('trackUserSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});