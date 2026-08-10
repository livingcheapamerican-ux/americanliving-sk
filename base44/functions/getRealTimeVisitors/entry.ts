import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];
const ADMIN_IPS = [
  '109.230.104.122',
  '2a02:c847:166:a899:f148:3f22:4df1:169',
];

const isAdminSession = (s: any) => {
  if (!s) return false;
  if (s.user_email && ADMIN_EMAILS.includes(s.user_email)) return true;
  if (s.location_info?.ip && ADMIN_IPS.includes(s.location_info.ip)) return true;
  if (s.referrer_domain && String(s.referrer_domain).includes('app.base44.com')) return true;
  return false;
};

const lastActivityMs = (s: any) => {
  const t = s.last_activity || s.end_time || s.start_time || s.created_date;
  const d = t ? new Date(t).getTime() : 0;
  return isNaN(d) ? 0 : d;
};

const bump = (map: Record<string, number>, key: string) => {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Načítame posledné relácie (dostatočné okno pre "dnes" aj live)
    let recent = await base44.asServiceRole.entities.UserSession.list('-created_date', 500);
    if (!Array.isArray(recent)) recent = [];

    const sessions = recent.filter(s => !isAdminSession(s));

    const withinWindow = (s: any, minutes: number) =>
      now - lastActivityMs(s) <= minutes * 60 * 1000;

    // ONLINE = aktivita za posledné 2 minúty (heartbeat beží každých 30s)
    const online = sessions.filter(s => s.is_active !== false && withinWindow(s, 2));
    const active5 = sessions.filter(s => withinWindow(s, 5));
    const active15 = sessions.filter(s => withinWindow(s, 15));
    const active30 = sessions.filter(s => withinWindow(s, 30));

    const visitorKey = (s: any) => {
      if (s.visitor_id) return `v:${s.visitor_id}`;
      if (s.user_email && s.user_email !== 'anonymous') return `e:${s.user_email}`;
      if (s.location_info?.ip) return `i:${s.location_info.ip}|${s.device_info?.user_agent || ''}`;
      return `s:${s.session_id}`;
    };
    const uniq = (list: any[]) => new Set(list.map(visitorKey)).size;

    // Live rozpady
    const byPage: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    online.forEach(s => {
      bump(byPage, s.current_page || s.pages_visited?.[s.pages_visited.length - 1]?.page_url || '/');
      bump(byCountry, s.location_info?.country || 'Neznáme');
      bump(byDevice, s.device_info?.device_type || 'desktop');
      const src = s.utm_params?.utm_source || s.referrer_domain || 'direct';
      bump(bySource, src);
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => new Date(s.start_time || s.created_date).getTime() >= todayStart.getTime());
    const last24h = sessions.filter(s => now - new Date(s.start_time || s.created_date).getTime() <= DAY);

    const liveList = online
      .sort((a, b) => lastActivityMs(b) - lastActivityMs(a))
      .map(s => {
        const secondsSinceActivity = Math.round((now - lastActivityMs(s)) / 1000);
        return {
          id: s.id,
          session_id: s.session_id,
          visitor_id: s.visitor_id || null,
          session_number: s.session_number || 1,
          is_returning: !!s.is_returning || (s.session_number || 1) > 1,
          user_email: s.user_email && s.user_email !== 'anonymous' ? s.user_email : null,
          user_name: s.user_name && s.user_name !== 'Anonymous' ? s.user_name : null,
          is_authenticated: !!s.is_authenticated,
          start_time: s.start_time,
          last_activity: s.last_activity || s.start_time,
          seconds_since_activity: secondsSinceActivity,
          duration_seconds: s.duration_seconds || 0,
          active_duration_seconds: s.active_duration_seconds || 0,
          engagement_score: s.engagement_score || 0,
          current_page: s.current_page || null,
          pages_count: (s.pages_visited || []).length,
          clicks_count: (s.clicks || []).length,
          rage_clicks: (s.rage_clicks || []).length,
          dead_clicks: (s.dead_clicks || []).length,
          errors: (s.errors_encountered || []).length,
          max_scroll: s.scroll_depth?.max_percentage || 0,
          language: s.language || null,
          session_tags: s.session_tags || [],
          location_info: s.location_info || null,
          device_info: s.device_info || null,
          referrer_domain: s.referrer_domain || 'direct',
          utm_params: s.utm_params || null,
          last_house: (s.dom_interactions || []).slice(-1)[0]?.dom_nazov || null,
          configurator_steps: (s.configurator_interactions || []).length,
          forms_started: (s.form_interactions || []).length,
          converted: (s.form_interactions || []).some((f: any) => f.completed) || (s.conversions || []).length > 0,
          is_idle: secondsSinceActivity > 60
        };
      });

    return Response.json({
      server_time: new Date().toISOString(),
      count: online.length,
      unique_online: uniq(online),
      active_5m: active5.length,
      active_15m: active15.length,
      active_30m: active30.length,
      today_sessions: todaySessions.length,
      today_unique_visitors: uniq(todaySessions),
      sessions_24h: last24h.length,
      unique_visitors_24h: uniq(last24h),
      returning_online: online.filter(s => s.is_returning || (s.session_number || 1) > 1).length,
      authenticated_online: online.filter(s => s.is_authenticated).length,
      converting_online: liveList.filter(s => s.converted).length,
      breakdown: {
        pages: byPage,
        countries: byCountry,
        devices: byDevice,
        sources: bySource
      },
      sessions: liveList
    });
  } catch (error) {
    console.error('getRealTimeVisitors error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});