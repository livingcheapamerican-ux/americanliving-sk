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

      // Handle pages_visited merging on backend
      const newPageEntry = data._new_page_entry;
      delete data._new_page_entry;

      if (newPageEntry) {
        const existingPages = session.pages_visited || [];
        const lastPage = existingPages[existingPages.length - 1];
        if (lastPage && lastPage.page_url === newPageEntry.page_url) {
          lastPage.time_spent_seconds = newPageEntry.time_spent_seconds;
          lastPage.scroll_depth_percentage = newPageEntry.scroll_depth_percentage;
          lastPage.page_name_sk = newPageEntry.page_name_sk;
          data.pages_visited = existingPages;
        } else {
          data.pages_visited = [...existingPages, newPageEntry];
        }

        // Update engagement score using actual pages count
        const pagesCount = data.pages_visited.length;
        const duration = data.duration_seconds || 0;
        const maxScroll = data.scroll_depth?.max_percentage || 0;
        const clicks = (data.clicks || []).length;
        data.engagement_score = Math.min(100, Math.round((duration / 60) * 10 + clicks * 2 + pagesCount * 5 + maxScroll / 2));
      }

      await base44.asServiceRole.entities.UserSession.update(session.id, data);
      return Response.json({ success: true, session_start_time: session.start_time, pages_visited: data.pages_visited });

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