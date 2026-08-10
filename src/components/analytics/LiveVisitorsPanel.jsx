import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Globe, Clock, MousePointer, Flame, AlertTriangle, Star } from "lucide-react";

const deviceIcon = (t) =>
  t === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : t === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />;

const fmt = (s) => {
  if (!s) return '0s';
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

function TopList({ title, data, emptyText }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      {entries.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">{emptyText}</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span className="truncate mr-2">{k}</span>
                <span className="text-slate-900 font-black shrink-0">{v}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-0.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.round((v / total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LiveVisitorsPanel({ live, isFetching, onOpenMap }) {
  const data = live || {};
  const list = data.sessions || [];

  const kpis = [
    { label: 'Online teraz', value: data.count || 0, hint: 'aktivita < 2 min', accent: 'text-green-600' },
    { label: 'Unikátnych online', value: data.unique_online || 0, hint: 'reálni ľudia', accent: 'text-emerald-600' },
    { label: 'Aktívni 5 min', value: data.active_5m || 0, hint: 'posledných 5 min', accent: 'text-blue-600' },
    { label: 'Aktívni 30 min', value: data.active_30m || 0, hint: 'posledných 30 min', accent: 'text-indigo-600' },
    { label: 'Dnes návštev', value: data.today_sessions || 0, hint: `${data.today_unique_visitors || 0} unikátnych`, accent: 'text-purple-600' },
    { label: 'Za 24 hodín', value: data.sessions_24h || 0, hint: `${data.unique_visitors_24h || 0} unikátnych`, accent: 'text-cyan-600' },
    { label: 'Vracajúci sa online', value: data.returning_online || 0, hint: 'opakovaná návšteva', accent: 'text-teal-600' },
    { label: 'Prihlásení online', value: data.authenticated_online || 0, hint: 'known users', accent: 'text-amber-600' }
  ];

  return (
    <Card className="p-4 mb-6 bg-white border-slate-200 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <h3 className="font-extrabold text-sm text-slate-800">Live návštevníci – kto je práve online</h3>
          {isFetching && <span className="text-[10px] font-bold text-indigo-500">aktualizujem…</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">
            Dáta k {data.server_time ? new Date(data.server_time).toLocaleTimeString('sk-SK') : '—'} • obnova každých 20 s
          </span>
          {onOpenMap && (
            <button onClick={onOpenMap} className="text-[11px] font-black text-indigo-600 hover:underline flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Mapa
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">{k.label}</p>
            <p className={`text-xl font-black leading-tight ${k.accent}`}>{k.value}</p>
            <p className="text-[9px] font-bold text-slate-400 truncate">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        <TopList title="Práve prezerané stránky" data={data.breakdown?.pages} emptyText="Nikto nie je online" />
        <TopList title="Krajiny online" data={data.breakdown?.countries} emptyText="Žiadne dáta" />
        <TopList title="Zariadenia online" data={data.breakdown?.devices} emptyText="Žiadne dáta" />
        <TopList title="Zdroje návštev online" data={data.breakdown?.sources} emptyText="Žiadne dáta" />
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Zoznam ľudí online ({list.length})</span>
          <span className="text-[10px] font-bold text-slate-400">zoradené podľa poslednej aktivity</span>
        </div>
        {list.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">Momentálne nie je nikto online.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {list.map((s) => (
              <div key={s.id} className="px-3 py-2.5 hover:bg-slate-50/60">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.is_idle ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`} />
                    <span className="font-black text-xs text-slate-900 truncate">
                      {s.user_name || s.user_email || `Anonym #${String(s.visitor_id || s.session_id).slice(-6)}`}
                    </span>
                    {s.is_returning && <Badge className="bg-teal-100 text-teal-800 text-[9px] font-black">vracajúci sa ({s.session_number}.)</Badge>}
                    {s.converted && <Badge className="bg-yellow-100 text-yellow-800 text-[9px] font-black"><Star className="w-3 h-3 mr-0.5" />konverzia</Badge>}
                    {s.rage_clicks > 0 && <Badge className="bg-red-100 text-red-800 text-[9px] font-black"><Flame className="w-3 h-3 mr-0.5" />{s.rage_clicks} rage</Badge>}
                    {s.errors > 0 && <Badge className="bg-orange-100 text-orange-800 text-[9px] font-black"><AlertTriangle className="w-3 h-3 mr-0.5" />{s.errors} chýb</Badge>}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 shrink-0">
                    {s.is_idle ? `nečinný ${fmt(s.seconds_since_activity)}` : 'aktívny teraz'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[10px] font-bold text-slate-600">
                  <span className="flex items-center gap-1 text-indigo-700 truncate max-w-[280px]">
                    📍 {s.current_page || '—'}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{fmt(s.duration_seconds)} (aktívne {fmt(s.active_duration_seconds)})</span>
                  <span className="flex items-center gap-1"><MousePointer className="w-3 h-3 text-slate-400" />{s.clicks_count} klikov • {s.pages_count} strán</span>
                  <span className="flex items-center gap-1 capitalize">{deviceIcon(s.device_info?.device_type)}{s.device_info?.device_type || 'desktop'} • {s.device_info?.browser || '—'}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-500" />{s.location_info?.city || 'Neznáme'}, {s.location_info?.country || '—'}</span>
                  <span>Zdroj: {s.utm_params?.utm_source || s.referrer_domain || 'direct'}</span>
                  <span>Scroll: {s.max_scroll || 0}%</span>
                  <span>Záujem: {s.engagement_score}/100</span>
                  {s.last_house && <span className="text-purple-700">🏠 {s.last_house}</span>}
                  {s.configurator_steps > 0 && <span className="text-purple-700">Konfigurátor: {s.configurator_steps} krokov</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}