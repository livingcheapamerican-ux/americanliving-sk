import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

function RankList({ title, entries, suffix = "" }) {
  const total = entries.reduce((a, e) => a + e.value, 0) || 1;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      {entries.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">Žiadne dáta</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e) => (
            <div key={e.key}>
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span className="truncate mr-2">{e.key}</span>
                <span className="text-slate-900 font-black shrink-0">{e.value}{suffix}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-0.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct(e.value, total)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const top = (map, n = 6) =>
  Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, value]) => ({ key, value }));

export default function AudienceInsights({ sessions = [] }) {
  const insights = useMemo(() => {
    const pages = {}, entryPages = {}, exitPages = {}, sources = {}, countries = {}, cities = {},
      browsers = {}, os = {}, languages = {}, houses = {}, hours = Array(24).fill(0), weekdays = Array(7).fill(0);

    let bounced = 0, rage = 0, dead = 0, errors = 0, scrollSum = 0, scrollCount = 0,
      formsStarted = 0, formsCompleted = 0, configUsers = 0, catalogDownloads = 0,
      lcpSum = 0, lcpCount = 0, clsSum = 0, clsCount = 0, activeSum = 0, totalSum = 0;

    sessions.forEach((s) => {
      const visited = s.pages_visited || [];
      visited.forEach((p) => { pages[p.page_name_sk || p.page_url] = (pages[p.page_name_sk || p.page_url] || 0) + 1; });
      if (visited[0]) entryPages[visited[0].page_name_sk || visited[0].page_url] = (entryPages[visited[0].page_name_sk || visited[0].page_url] || 0) + 1;
      const last = s.exit_page || visited[visited.length - 1]?.page_url;
      if (last) exitPages[last] = (exitPages[last] || 0) + 1;

      const src = s.utm_params?.utm_source || s.referrer_domain || 'direct';
      sources[src] = (sources[src] || 0) + 1;
      if (s.location_info?.country) countries[s.location_info.country] = (countries[s.location_info.country] || 0) + 1;
      if (s.location_info?.city) cities[s.location_info.city] = (cities[s.location_info.city] || 0) + 1;
      if (s.device_info?.browser) browsers[s.device_info.browser] = (browsers[s.device_info.browser] || 0) + 1;
      if (s.device_info?.os) os[s.device_info.os] = (os[s.device_info.os] || 0) + 1;
      if (s.language) languages[s.language] = (languages[s.language] || 0) + 1;
      (s.dom_interactions || []).forEach((d) => { if (d.dom_nazov) houses[d.dom_nazov] = (houses[d.dom_nazov] || 0) + 1; });

      const start = s.start_time ? new Date(s.start_time) : null;
      if (start && !isNaN(start.getTime())) { hours[start.getHours()]++; weekdays[start.getDay()]++; }

      if ((s.duration_seconds || 0) < 10 || visited.length <= 1) bounced++;
      rage += (s.rage_clicks || []).length;
      dead += (s.dead_clicks || []).length;
      errors += (s.errors_encountered || []).length;
      if (s.scroll_depth?.max_percentage) { scrollSum += s.scroll_depth.max_percentage; scrollCount++; }
      if ((s.form_interactions || []).length) formsStarted++;
      if ((s.form_interactions || []).some((f) => f.completed)) formsCompleted++;
      if ((s.configurator_interactions || []).length) configUsers++;
      if ((s.session_tags || []).includes('stiahol_katalog')) catalogDownloads++;
      if (s.performance_metrics?.lcp) { lcpSum += s.performance_metrics.lcp; lcpCount++; }
      if (s.performance_metrics?.cls) { clsSum += s.performance_metrics.cls; clsCount++; }
      activeSum += s.active_duration_seconds || 0;
      totalSum += s.duration_seconds || 0;
    });

    const dayNames = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];

    return {
      pages: top(pages), entryPages: top(entryPages), exitPages: top(exitPages),
      sources: top(sources), countries: top(countries), cities: top(cities),
      browsers: top(browsers), os: top(os), languages: top(languages), houses: top(houses),
      hourly: hours.map((v, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, navstevy: v })),
      weekly: weekdays.map((v, i) => ({ key: dayNames[i], value: v })).sort((a, b) => b.value - a.value),
      bounceRate: pct(bounced, sessions.length),
      rage, dead, errors,
      avgScroll: scrollCount ? Math.round(scrollSum / scrollCount) : 0,
      formsStarted, formsCompleted,
      formConversion: pct(formsCompleted, formsStarted),
      configUsers, catalogDownloads,
      avgLcp: lcpCount ? Math.round(lcpSum / lcpCount) : 0,
      avgCls: clsCount ? (clsSum / clsCount).toFixed(3) : '0.000',
      attentionRate: pct(activeSum, totalSum)
    };
  }, [sessions]);

  const funnel = [
    { label: 'Návštevy', value: sessions.length },
    { label: 'Pozreli dom', value: sessions.filter(s => (s.dom_interactions || []).length > 0).length },
    { label: 'Konfigurátor', value: insights.configUsers },
    { label: 'Začali formulár', value: insights.formsStarted },
    { label: 'Odoslali formulár', value: insights.formsCompleted }
  ];
  const funnelMax = funnel[0].value || 1;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { l: 'Bounce rate', v: `${insights.bounceRate}%` },
          { l: 'Pozornosť (aktívny čas)', v: `${insights.attentionRate}%` },
          { l: 'Priem. scroll', v: `${insights.avgScroll}%` },
          { l: 'Rage kliky', v: insights.rage },
          { l: 'Mŕtve kliky', v: insights.dead },
          { l: 'JS chyby', v: insights.errors },
          { l: 'Priem. LCP', v: `${(insights.avgLcp / 1000).toFixed(2)}s` },
          { l: 'Priem. CLS', v: insights.avgCls }
        ].map((k) => (
          <Card key={k.l} className="p-3 bg-white border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">{k.l}</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{k.v}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Návštevnosť podľa hodiny dňa (kedy inzerovať)</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="navstevy" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Konverzný lievik</p>
        <div className="space-y-2">
          {funnel.map((f, i) => (
            <div key={f.label}>
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>{i + 1}. {f.label}</span>
                <span className="font-black text-slate-900">{f.value} ({pct(f.value, funnelMax)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mt-0.5">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full" style={{ width: `${pct(f.value, funnelMax)}%` }} />
              </div>
            </div>
          ))}
          <p className="text-[10px] font-bold text-slate-500 pt-1">
            Úspešnosť formulárov: {insights.formConversion}% • Stiahnutí katalógu: {insights.catalogDownloads}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <RankList title="Najnavštevovanejšie stránky" entries={insights.pages} />
        <RankList title="Vstupné stránky" entries={insights.entryPages} />
        <RankList title="Odchodové stránky" entries={insights.exitPages} />
        <RankList title="Zdroje návštev" entries={insights.sources} />
        <RankList title="Krajiny" entries={insights.countries} />
        <RankList title="Mestá" entries={insights.cities} />
        <RankList title="Najžiadanejšie domy" entries={insights.houses} />
        <RankList title="Dni v týždni" entries={insights.weekly} />
        <RankList title="Prehliadače" entries={insights.browsers} />
        <RankList title="Operačné systémy" entries={insights.os} />
        <RankList title="Jazyky" entries={insights.languages} />
      </div>
    </div>
  );
}