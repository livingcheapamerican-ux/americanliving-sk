import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];
const ADMIN_IPS = [
  '109.230.104.122', // Admin IP
  '2a02:c847:166:a899:f148:3f22:4df1:169', // Admin IPv6
];

function isAdminSession(data: any): boolean {
  if (!data) return false;
  if (data.user_email && ADMIN_EMAILS.includes(data.user_email)) return true;
  if (data.location_info?.ip && ADMIN_IPS.includes(data.location_info.ip)) return true;
  if (data.device_info?.ip && ADMIN_IPS.includes(data.device_info.ip)) return true;
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, session_id, data } = body;

    if (action === 'diagnostics') {
      console.log('[trackUserSession] Running diagnostics...');
      // Get last 10 sessions sorted by created_date
      const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 10);
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const diagnostics = {
        total_sessions_checked: sessions.length,
        latest_session_created_at: sessions[0]?.created_date || null,
        latest_session_start_time: sessions[0]?.start_time || null,
        minutes_since_last_session: sessions[0]?.created_date 
          ? Math.round((now.getTime() - new Date(sessions[0].created_date).getTime()) / 60000) 
          : null,
        sessions_last_2h: sessions.filter(s => new Date(s.created_date) > twoHoursAgo).length,
        sessions_last_24h: sessions.filter(s => new Date(s.created_date) > oneDayAgo).length,
        sessions_last_48h: sessions.filter(s => new Date(s.created_date) > twoDaysAgo).length,
        recent_sessions: sessions.slice(0, 5).map(s => ({
          session_id: s.session_id,
          created_date: s.created_date,
          start_time: s.start_time,
          user_email: s.user_email,
          is_active: s.is_active,
          duration_seconds: s.duration_seconds,
          pages_count: (s.pages_visited || []).length
        })),
        sdk_version: '0.8.21',
        server_time: now.toISOString()
      };
      console.log('[trackUserSession] Diagnostics:', JSON.stringify(diagnostics));
      return Response.json({ success: true, diagnostics });
    }

    if (action === 'create') {
      if (isAdminSession(data)) {
        console.log('[trackUserSession] Admin session creation bypassed:', session_id);
        return Response.json({ 
          success: true, 
          message: 'Admin session skipped to save credits',
          data: {
            session_id,
            session_start_time: new Date().toISOString()
          }
        });
      }

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

    if (action === 'heartbeat') {
      const existing = await base44.entities.UserSession.filter({ session_id });
      if (existing.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      if (isAdminSession(existing[0])) {
        return Response.json({ success: true, message: 'Admin session skipped' });
      }
      await base44.entities.UserSession.update(existing[0].id, {
        last_activity: new Date().toISOString(),
        is_active: true,
        current_page: data?.current_page,
        duration_seconds: data?.duration_seconds,
        active_duration_seconds: data?.active_duration_seconds
      });
      return Response.json({ success: true });
    }

    if (action === 'update') {
      console.log('[trackUserSession] Updating session:', session_id);
      const existing = await base44.entities.UserSession.filter({ session_id });
      
      if (existing.length > 0 && (isAdminSession(data) || isAdminSession(existing[0]))) {
        console.log('[trackUserSession] Admin session update bypassed:', session_id);
        return Response.json({ 
          success: true, 
          message: 'Admin session skipped to save credits'
        });
      }

      if (existing.length === 0) {
        console.warn('[trackUserSession] Session not found:', session_id);
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Handle _new_page_entry - append to pages_visited array
      const updateData = { ...data };

      // Sanitize clicks - element_class must always be a string (SVG elements can send objects)
      if (updateData.clicks && Array.isArray(updateData.clicks)) {
        updateData.clicks = updateData.clicks.map(click => ({
          ...click,
          element_class: typeof click.element_class === 'string' ? click.element_class : (click.element_class?.baseVal || ''),
          element: typeof click.element === 'string' ? click.element : String(click.element || ''),
          element_id: typeof click.element_id === 'string' ? click.element_id : String(click.element_id || '')
        }));
      }

      if (updateData._new_page_entry) {
        const newPageEntry = updateData._new_page_entry;
        delete updateData._new_page_entry;
        const existingPages = existing[0].pages_visited || [];
        const isDuplicate = existingPages.some(p => 
          p.page_url === newPageEntry.page_url && p.timestamp === newPageEntry.timestamp
        );
        if (!isDuplicate) {
          updateData.pages_visited = [...existingPages, newPageEntry];
          console.log('[trackUserSession] Appending page entry:', newPageEntry.page_url, 'total pages:', updateData.pages_visited.length);
        } else {
          console.log('[trackUserSession] Duplicate page entry, skipping');
        }
      }

      const updated = await base44.entities.UserSession.update(existing[0].id, updateData);
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
      
      if (existing.length > 0 && (isAdminSession(data) || isAdminSession(existing[0]))) {
        console.log('[trackUserSession] Admin session location update bypassed:', session_id);
        return Response.json({ 
          success: true, 
          message: 'Admin session skipped to save credits'
        });
      }

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