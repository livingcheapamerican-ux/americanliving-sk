import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Users, Clock, MousePointer, Filter, Search, MapPin, Globe,
  Zap, FileText, TrendingUp, Settings, RefreshCw
} from "lucide-react";
import { sk } from "date-fns/locale";
import OnlineVisitorsMap from "../components/analytics/OnlineVisitorsMap";
import LiveVisitorsPanel from "../components/analytics/LiveVisitorsPanel";
import AudienceInsights from "../components/analytics/AudienceInsights";
import ClickMapModal from "../components/analytics/ClickMapModal";
import SessionRow from "../components/analytics/SessionRow";
import { isSessionOnline, formatDuration, safeFormat, getDeviceIcon } from "../components/analytics/sessionUtils";

const ADMIN_IPS = ['109.230.104.122', '2a02:c847:166:a899:f148:3f22:4df1:169'];
const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];

export default function AdminAnalyzaSessions() {
  const [filterEmail, setFilterEmail] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedVisitor, setExpandedVisitor] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [hideAdminSessions, setHideAdminSessions] = useState(true);
  const [groupByVisitor, setGroupByVisitor] = useState(false);
  const [clickMapSession, setClickMapSession] = useState(null);
  const [showSystemTools, setShowSystemTools] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  useEffect(() => {
    if (!isAdmin) return;
    base44.functions.invoke('cleanupInactiveSessions').catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    base44.entities.UserSession.list('-created_date', 1000)
      .then(data => { setSessions(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = base44.entities.UserSession.subscribe((event) => {
      setSessions(prev => {
        if (event.type === 'create') return [event.data, ...prev];
        if (event.type === 'update') return prev.map(s => (s.id === event.id ? event.data : s));
        if (event.type === 'delete') return prev.filter(s => s.id !== event.id);
        return prev;
      });
    });
    return unsubscribe;
  }, [isAdmin]);

  const refetchSessions = async () => {
    const data = await base44.entities.UserSession.list('-created_date', 1000);
    setSessions(data);
  };

  const { data: onlineVisitors, isFetching: liveFetching } = useQuery({
    queryKey: ['online-visitors-realtime'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getRealTimeVisitors');
      return response.data || { count: 0, sessions: [] };
    },
    initialData: { count: 0, sessions: [] },
    enabled: isAdmin,
    refetchInterval: 20000,
    staleTime: 10000
  });

  const filteredSessions = useMemo(() => sessions.filter(session => {
    if (hideAdminSessions) {
      if (ADMIN_EMAILS.includes(session.user_email)) return false;
      if (session.location_info?.ip && ADMIN_IPS.includes(session.location_info.ip)) return false;
      if (session.referrer?.includes('app.base44.com')) return false;
      if (session.referrer_domain?.includes('app.base44.com')) return false;
    }
    if (filterEmail && !session.user_email?.toLowerCase().includes(filterEmail.toLowerCase())) return false;
    if (filterDateFrom && new Date(session.start_time) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(session.start_time) > new Date(`${filterDateTo}T23:59:59`)) return false;
    if (filterDevice !== "all" && session.device_info?.device_type !== filterDevice) return false;
    if (filterTag !== "all" && !session.session_tags?.includes(filterTag)) return false;
    return true;
  }), [sessions, hideAdminSessions, filterEmail, filterDateFrom, filterDateTo, filterDevice, filterTag]);

  const groupedVisitors = useMemo(() => {
    const groups = {};
    filteredSessions.forEach(session => {
      const key = session.visitor_id || session.user_email || session.location_info?.ip || session.session_id || session.id;
      if (!groups[key]) {
        const displayName = session.user_name || session.user_email
          || (session.location_info?.city ? `${session.location_info.city} · ${session.location_info.ip || ''}` : null)
          || `Návštevník ${String(session.visitor_id || session.session_id || session.id).substring(0, 8)}`;
        groups[key] = {
          visitorKey: key,
          displayName,
          email: session.user_email,
          ip: session.location_info?.ip,
          sessions: [],
          totalSessions: 0,
          totalDuration: 0,
          conversions: 0,
          isReturning: false,
          firstVisit: session.start_time,
          lastVisit: session.start_time,
          commonDevice: session.device_info?.device_type,
          commonLocation: session.location_info?.city ? `${session.location_info.city}, ${session.location_info.country_code}` : null,
          avgEngagement: 0
        };
      }
      const g = groups[key];
      g.sessions.push(session);
      g.totalSessions++;
      g.totalDuration += session.duration_seconds || 0;
      g.conversions += session.conversions?.length || 0;
      if (new Date(session.start_time) < new Date(g.firstVisit)) g.firstVisit = session.start_time;
      if (new Date(session.start_time) > new Date(g.lastVisit)) g.lastVisit = session.start_time;
      g.isReturning = g.totalSessions > 1 || session.session_number > 1;
    });
    Object.values(groups).forEach(g => {
      g.avgEngagement = Math.round(g.sessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / g.sessions.length) || 0;
    });
    return Object.values(groups).sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
  }, [filteredSessions]);

  const stats = useMemo(() => ({
    totalSessions: filteredSessions.length,
    uniqueUsers: groupedVisitors.length,
    avgDuration: Math.round(filteredSessions.reduce((a, s) => a + (s.duration_seconds || 0), 0) / filteredSessions.length) || 0,
    totalClicks: filteredSessions.reduce((a, s) => a + (s.clicks?.length || 0), 0),
    activeSessions: filteredSessions.filter(isSessionOnline).length,
    avgEngagement: Math.round(filteredSessions.reduce((a, s) => a + (s.engagement_score || 0), 0) / filteredSessions.length) || 0,
    conversions: filteredSessions.filter(s => s.conversions?.length > 0).length,
    returningVisitors: groupedVisitors.filter(v => v.isReturning).length
  }), [filteredSessions, groupedVisitors]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8"><p className="text-slate-600">Nemáte oprávnenie na prístup k tejto stránke.</p></Card>
      </div>
    );
  }

  const kpis = [
    { label: 'Relácie', value: stats.totalSessions, icon: Activity, tone: 'text-blue-600' },
    { label: 'Unikátni ľudia', value: stats.uniqueUsers, icon: Users, tone: 'text-emerald-600' },
    { label: 'Priemerný čas', value: formatDuration(stats.avgDuration), icon: Clock, tone: 'text-purple-600' },
    { label: 'Kliknutia', value: stats.totalClicks, icon: MousePointer, tone: 'text-amber-600' },
    { label: 'Aktívne teraz', value: stats.activeSessions, icon: TrendingUp, tone: 'text-rose-600' },
    { label: 'Priem. záujem', value: `${stats.avgEngagement}/100`, icon: Zap, tone: 'text-cyan-600' },
    { label: 'Konverzie', value: stats.conversions, icon: FileText, tone: 'text-yellow-600' },
    { label: 'Vracajúci sa', value: stats.returningVisitors, icon: Users, tone: 'text-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg"><Activity className="w-5 h-5" /></span>
              Analytics &amp; Session Recorder
            </h1>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live dáta sa obnovujú každých 20 sekúnd
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setShowSystemTools(!showSystemTools)}
              variant="outline"
              className={`font-bold h-10 ${showSystemTools ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 hover:text-white' : 'bg-white'}`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Nástroje
            </Button>
            <Button onClick={refetchSessions} variant="outline" className="bg-white font-bold h-10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Obnoviť
            </Button>
            <Button onClick={() => setShowMapModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4">
              <Globe className="w-4 h-4 mr-2" />
              Online teraz: {onlineVisitors.count}
            </Button>
          </div>
        </div>

        {showSystemTools && (
          <Card className="p-4 bg-slate-900 border-slate-800 text-white">
            <h3 className="font-extrabold text-xs uppercase tracking-wider mb-2">Systémové nástroje</h3>
            <p className="text-[11px] text-slate-400 mb-3 font-semibold">Hromadné operácie nad historickými reláciami môžu trvať niekoľko minút.</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  if (!confirm('Načítať späť interakcie domov zo starých relácií?')) return;
                  const res = await base44.functions.invoke('backfillDomInteractions');
                  alert(res.data?.message || 'Hotovo');
                  refetchSessions();
                }}
                variant="outline"
                className="bg-transparent border-purple-500/40 text-purple-200 hover:bg-purple-900/60 hover:text-white font-bold text-xs h-9"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Backfill prezerania domov
              </Button>
              <Button
                onClick={async () => {
                  if (!confirm('Doplniť GPS lokácie pre staré relácie?')) return;
                  const res = await base44.functions.invoke('enrichLocationData');
                  alert(res.data?.message || 'Hotovo');
                  refetchSessions();
                }}
                variant="outline"
                className="bg-transparent border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 hover:text-white font-bold text-xs h-9"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Doplniť GPS z IP adries
              </Button>
            </div>
          </Card>
        )}

        <LiveVisitorsPanel live={onlineVisitors} isFetching={liveFetching} onOpenMap={() => setShowMapModal(true)} />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {kpis.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-3 bg-white border-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{item.label}</span>
                  <Icon className={`w-4 h-4 shrink-0 ${item.tone}`} />
                </div>
                <p className="text-lg font-black text-slate-900 leading-none">{item.value}</p>
              </Card>
            );
          })}
        </div>

        <AudienceInsights sessions={filteredSessions} />

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="font-extrabold text-sm text-slate-800">Filtrovanie relácií</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline" size="sm"
                onClick={() => { setFilterEmail(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterDevice("all"); setFilterTag("all"); }}
                className="font-bold h-8"
              >
                Vyčistiť
              </Button>
              <Button
                size="sm"
                variant={hideAdminSessions ? "default" : "outline"}
                onClick={() => setHideAdminSessions(!hideAdminSessions)}
                className={`font-bold h-8 ${hideAdminSessions ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
              >
                {hideAdminSessions ? "Admin skrytý" : "Admin viditeľný"}
              </Button>
              <Button
                size="sm"
                variant={groupByVisitor ? "default" : "outline"}
                onClick={() => setGroupByVisitor(!groupByVisitor)}
                className={`font-bold h-8 ${groupByVisitor ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                {groupByVisitor ? "Podľa návštevníkov" : "Zoznam relácií"}
              </Button>
              <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-extrabold px-2.5 py-1">
                {groupByVisitor ? `${groupedVisitors.length} návštevníkov` : `${filteredSessions.length} relácií`}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email návštevníka</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Hľadať podľa emailu…"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="pl-9 h-9 text-xs font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Dátum od</label>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 text-xs font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Dátum do</label>
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 text-xs font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Zariadenie</label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Všetky</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobil</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kategória</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Všetky tagy</option>
                <option value="odrazeny">Odrazený</option>
                <option value="zaujaty">Zaujatý</option>
                <option value="velmi_zaujaty">Veľmi zaujatý</option>
                <option value="vracajuci_sa">Vracajúci sa</option>
                <option value="konvertoval">Konvertoval</option>
                <option value="stiahol_katalog">Stiahol katalóg</option>
                <option value="pouzivatel_konfiguratora">Konfigurátor</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="min-h-[400px]">
          {isLoading ? (
            <Card className="p-12 text-center bg-white border-slate-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-semibold">Načítavam relácie…</p>
            </Card>
          ) : groupByVisitor ? (
            groupedVisitors.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">Žiadni návštevníci nevyhovujú filtrom.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-2.5 lg:max-h-[75vh] overflow-y-auto pr-1">
                  {groupedVisitors.map((visitor) => {
                    const isSelected = expandedVisitor === visitor.visitorKey;
                    const isOnlineNow = visitor.sessions.some(isSessionOnline);
                    return (
                      <button
                        type="button"
                        key={visitor.visitorKey}
                        onClick={() => setExpandedVisitor(visitor.visitorKey)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-black text-xs truncate">{visitor.displayName}</h4>
                          {isOnlineNow && <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 animate-pulse" />}
                        </div>
                        <div className={`flex items-center justify-between text-[10px] font-extrabold ${isSelected ? 'text-indigo-100' : 'text-slate-600'}`}>
                          <span>{visitor.totalSessions} relácií</span>
                          <span>{formatDuration(visitor.totalDuration)}</span>
                        </div>
                        <div className={`flex items-center justify-between text-[10px] font-bold mt-2 pt-2 border-t border-dashed ${
                          isSelected ? 'border-white/30 text-indigo-100' : 'border-slate-200 text-slate-400'
                        }`}>
                          <span className="truncate">{visitor.commonLocation || 'Neznáma lokalita'}</span>
                          <span>{safeFormat(visitor.lastVisit, 'dd.MM. HH:mm', { locale: sk })}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
                  {(() => {
                    const visitor = groupedVisitors.find(v => v.visitorKey === expandedVisitor);
                    if (!visitor) {
                      return (
                        <div className="flex flex-col items-center justify-center text-center py-20">
                          <Users className="w-12 h-12 text-slate-200 mb-3" />
                          <h3 className="text-sm font-black text-slate-700">Profil návštevníka</h3>
                          <p className="text-xs text-slate-500 max-w-xs mt-1">Vyberte návštevníka vľavo a zobrazí sa jeho kompletný profil aj história relácií.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <h2 className="text-lg font-black text-slate-900 truncate">{visitor.displayName}</h2>
                              {visitor.isReturning && (
                                <Badge className="bg-teal-600 hover:bg-teal-600 text-white text-[9px] font-black">VRACAJÚCI SA ({visitor.totalSessions}×)</Badge>
                              )}
                              {visitor.sessions.some(isSessionOnline) && (
                                <Badge className="bg-green-600 hover:bg-green-600 text-white text-[9px] font-black">ONLINE</Badge>
                              )}
                              {visitor.conversions > 0 && (
                                <Badge className="bg-yellow-600 hover:bg-yellow-600 text-white text-[9px] font-black">{visitor.conversions} KONVERZIÍ</Badge>
                              )}
                            </div>
                            {visitor.email && <p className="text-xs font-bold text-indigo-600">{visitor.email}</p>}
                            {visitor.ip && <p className="text-[10px] text-slate-400 font-mono">IP: {visitor.ip}</p>}
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] font-extrabold text-slate-600 space-y-1">
                            <div>Prvá návšteva: <span className="text-slate-900">{safeFormat(visitor.firstVisit, 'dd.MM.yyyy HH:mm', { locale: sk })}</span></div>
                            <div>Posledná aktivita: <span className="text-slate-900">{safeFormat(visitor.lastVisit, 'dd.MM.yyyy HH:mm', { locale: sk })}</span></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Celkový čas</p>
                            <p className="text-sm font-black">{formatDuration(visitor.totalDuration)}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Počet relácií</p>
                            <p className="text-sm font-black">{visitor.totalSessions}×</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Priemerný záujem</p>
                            <p className="text-sm font-black">{visitor.avgEngagement}/100</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Zariadenie</p>
                            <p className="text-xs font-black flex items-center gap-1 capitalize">
                              {getDeviceIcon(visitor.commonDevice)}
                              {visitor.commonDevice || 'desktop'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {visitor.sessions.map((session, idx) => (
                            <SessionRow
                              key={session.id}
                              session={session}
                              title={`Relácia #${visitor.sessions.length - idx}`}
                              expanded={expandedSession === session.id}
                              onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                              onOpenClickMap={setClickMapSession}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )
          ) : filteredSessions.length === 0 ? (
            <Card className="p-12 text-center bg-white border-slate-200">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">Žiadne relácie nevyhovujú filtrom.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  expanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  onOpenClickMap={setClickMapSession}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showMapModal && <OnlineVisitorsMap sessions={sessions} onClose={() => setShowMapModal(false)} />}
      {clickMapSession && <ClickMapModal session={clickMapSession} onClose={() => setClickMapSession(null)} />}
    </div>
  );
}