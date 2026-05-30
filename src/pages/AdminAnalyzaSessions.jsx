import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  Clock, 
  MousePointer, 
  Eye, 
  TrendingUp,
  Filter,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Globe,
  Zap,
  AlertTriangle,
  FileText,
  Layers,
  Navigation,
  BarChart3,
  Home,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import OnlineVisitorsMap from "../components/analytics/OnlineVisitorsMap";

// Helper na presné určenie online stavu (aktivita v posledných 5 minútach)
const isSessionOnline = (session) => {
  if (!session || session.is_active === false) return false;
  const activityTime = session.last_activity || session.start_time;
  if (!activityTime) return false;
  const diffMs = Date.now() - new Date(activityTime).getTime();
  return diffMs < 5 * 60 * 1000;
};

// Pomocná funkcia na vykreslenie Web Vital skóre
const renderWebVital = (name, value, unit, thresholds) => {
  if (value === undefined || value === null || value === 0) {
    return (
      <div className="bg-white p-2.5 rounded-lg border border-slate-205 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{name}</p>
        <p className="text-sm font-extrabold text-slate-400">—</p>
      </div>
    );
  }
  
  let color = "text-green-650 bg-green-50 border-green-200";
  let status = "Výborné";
  if (value > thresholds.poor) {
    color = "text-red-600 bg-red-50 border-red-200";
    status = "Zlé";
  } else if (value > thresholds.warning) {
    color = "text-yellow-600 bg-yellow-50 border-yellow-200";
    status = "Na zlepšenie";
  }
  
  const displayVal = name === 'CLS' 
    ? value.toFixed(3) 
    : (unit === 's' ? (value / 1000).toFixed(2) + 's' : value + unit);

  return (
    <div className={`p-2.5 rounded-lg border text-center transition-all ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-90">{name}</p>
      <p className="text-lg font-black">{displayVal}</p>
      <p className="text-[9px] font-extrabold opacity-80">{status}</p>
    </div>
  );
};

function ClickMapModal({ session, onClose }) {
  const [clickMapPage, setClickMapPage] = useState(session.clicks?.[0]?.page_url || "");
  const [hoveredClick, setHoveredClick] = useState(null);

  const pagesWithClicks = [...new Set((session.clicks || []).map(c => c.page_url))];
  const filteredClicks = (session.clicks || []).filter(c => c.page_url === clickMapPage);

  // Zoskupenie klikov, ktoré sú blízko seba, aby sme na nejakom mieste ukázali intenzitu (ako mini heatmap)
  const getClickIntensity = (click, allClicks) => {
    return allClicks.filter(c => 
      Math.abs(c.x_percent - click.x_percent) < 3 && 
      Math.abs(c.y_percent - click.y_percent) < 3
    ).length;
  };

  // Pre vizualizáciu wireframu určíme sekcie podľa page_url
  const renderWireframeSections = () => {
    const isConfigurator = clickMapPage.toLowerCase().includes("konfigurator");
    const isCatalog = clickMapPage.toLowerCase().includes("katalog");

    if (isConfigurator) {
      return (
        <div className="w-full min-h-[600px] flex flex-col gap-4 p-4 text-white">
          <div className="border border-white/10 rounded-lg p-3 bg-slate-900/50 flex items-center justify-between">
            <div className="font-bold text-sm">🏠 Konfigurátor domu</div>
            <div className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">Cena: 61,700 €</div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border border-white/10 rounded-lg bg-slate-900/40 p-4 flex flex-col items-center justify-center min-h-[300px] relative">
              <div className="text-slate-500 text-[10px] absolute top-2 left-2 font-bold">3D VIZUALIZÁCIA</div>
              <div className="w-48 h-32 border-2 border-dashed border-white/20 rounded flex items-center justify-center text-slate-500 font-bold text-xs">
                [ VIZUALIZÁCIA DOMU ]
              </div>
              <div className="mt-4 flex gap-2">
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 font-bold">Pohľad z boku</div>
                <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 font-bold">Pôdorys</div>
              </div>
            </div>
            <div className="border border-white/10 rounded-lg bg-slate-900/50 p-4 flex flex-col gap-3">
              <div className="text-slate-400 text-[10px] font-bold border-b border-white/10 pb-1">VOLITEĽNÉ POLOŽKY</div>
              <div className="space-y-2">
                <div className="p-2 bg-white/5 rounded border border-white/10 text-[11px] font-semibold text-slate-300">1. Konštrukcia domu (Zvolená)</div>
                <div className="p-2 bg-white/5 rounded border border-white/10 text-[11px] font-semibold text-slate-300">2. Hrubka stien (250 mm)</div>
                <div className="p-2 bg-white/5 rounded border border-white/10 text-[11px] font-semibold text-slate-300">3. Izolácia (Minerálna vata)</div>
                <div className="p-2 bg-white/5 rounded border border-white/10 text-[11px] font-semibold text-slate-300">4. Príplatková strecha</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isCatalog) {
      return (
        <div className="w-full min-h-[600px] flex flex-col gap-4 p-4 text-white">
          <div className="border border-white/10 rounded-lg p-3 bg-slate-900/50 flex items-center justify-between">
            <div className="font-bold text-sm flex items-center gap-2">🗂️ Katalóg Domov</div>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold">Všetky</div>
              <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-slate-400">Rodinné</div>
              <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-slate-400">Mobilné</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-white/10 rounded-lg bg-slate-900/40 p-3 flex flex-col gap-2">
                <div className="h-28 bg-slate-950/60 rounded border border-white/5 flex items-center justify-center text-[9px] text-slate-600 font-bold">[ MODEL DOMU ]</div>
                <div className="font-bold text-xs">American House Model {i}</div>
                <div className="text-[10px] text-slate-400">Plocha: {35 * i} m²</div>
                <div className="mt-2 flex justify-between items-center text-[10px]">
                  <span className="font-bold text-green-400">od {(29000 * i).toLocaleString('sk-SK')} €</span>
                  <span className="text-blue-400 font-semibold underline">Detail</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default Homepage
    return (
      <div className="w-full min-h-[700px] flex flex-col gap-6 p-4 text-white">
        <div className="border border-white/10 rounded-lg p-3 bg-slate-900/60 flex items-center justify-between">
          <div className="font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AMERICAN LIVING</div>
          <div className="flex gap-3 text-[10px] text-slate-400 font-bold">
            <span>Katalóg</span>
            <span>Konfigurátor</span>
            <span>Kontakt</span>
          </div>
        </div>
        
        <div className="border border-white/10 rounded-lg bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center min-h-[250px] relative">
          <h2 className="text-sm font-black mb-2">Moderné bývanie za polovicu bežnej ceny</h2>
          <p className="text-[10px] text-slate-400 max-w-sm mb-4">Nízkoenergetické modulárne a montované domy priamo na kľúč s dovozom po celom Slovensku.</p>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-blue-600 rounded text-[9px] font-bold shadow-lg shadow-blue-500/20">Spustiť Konfigurátor</div>
            <div className="px-3 py-1.5 bg-white/10 border border-white/10 rounded text-[9px] font-bold">Katalóg Domov</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-white/10 rounded-lg bg-slate-900/50 p-3 text-center">
              <div className="font-bold text-[10px] mb-1">
                {i === 1 ? "🏠 Rodinné Domy" : i === 2 ? "📦 Modulárne Domy" : "🚚 Mobilné Domy"}
              </div>
              <div className="text-[9px] text-slate-500 font-medium">Pozrieť ponuku</div>
            </div>
          ))}
        </div>

        <div className="border border-white/10 rounded-lg bg-slate-900/30 p-4 flex justify-between items-center text-xs">
          <div>
            <h3 className="font-bold text-[11px]">Výhodná hypotéka na dosah</h3>
            <p className="text-[9px] text-slate-500">Splátková kalkulačka Americana.</p>
          </div>
          <div className="px-3 py-1.5 bg-green-600 rounded text-[9px] font-bold">Hypo kalkulačka</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] bg-slate-900 text-slate-100 border-white/10 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div>
            <h3 className="text-md font-bold flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-indigo-400" />
              Click Map Overlay (Simulácia kliknutí)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              Session ID: {session.session_id ? session.session_id.substring(0, 8) : (session.id ? String(session.id).substring(0, 8) : 'N/A')} | Visitor ID: {session.visitor_id ? session.visitor_id.substring(0, 8) : 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 border-b border-white/10 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold">Zobraziť kliky na stránke:</span>
            {pagesWithClicks.length === 0 ? (
              <span className="text-[11px] text-slate-500 font-medium">Žiadne kliknutia</span>
            ) : (
              <select
                value={clickMapPage}
                onChange={(e) => setClickMapPage(e.target.value)}
                className="px-2.5 py-1 border border-white/10 rounded text-[11px] bg-slate-950 text-white font-bold"
              >
                {pagesWithClicks.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-4 text-[11px] font-bold text-slate-400">
            <div>Kliknutí tu: <span className="text-indigo-400 font-black">{filteredClicks.length}</span></div>
            <div>Kliknutí celkovo: <span className="text-indigo-400 font-black">{session.clicks?.length || 0}</span></div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-80 border-r border-white/10 bg-slate-950 overflow-y-auto p-4 space-y-3">
            <h4 className="font-bold text-[10px] text-slate-400 tracking-wider uppercase border-b border-white/10 pb-1.5">Kliknutia v poradí</h4>
            <div className="space-y-2">
              {filteredClicks.map((click, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded border text-[11px] cursor-pointer transition-all ${
                    hoveredClick === click 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow shadow-indigo-500/20' 
                      : 'border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-white/10'
                  }`}
                  onMouseEnter={() => setHoveredClick(click)}
                  onMouseLeave={() => setHoveredClick(null)}
                >
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-indigo-400">Klip #{idx + 1}</span>
                    <span className="text-slate-500">{format(new Date(click.timestamp), 'HH:mm:ss')}</span>
                  </div>
                  <div className="font-semibold text-slate-200 capitalize mb-0.5">Element: <span className="text-white font-bold">&lt;{click.element}&gt;</span></div>
                  {click.text && <div className="text-slate-400 italic break-all mb-0.5 font-mono text-[9px]">Text: "{click.text}"</div>}
                  {click.element_id && <div className="text-slate-500 font-mono text-[9px]">ID: #{click.element_id}</div>}
                  <div className="text-[9px] text-indigo-300 font-bold mt-1">Súradnice: {click.x_percent}%, {click.y_percent}%</div>
                </div>
              ))}
              {filteredClicks.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-8 font-bold">Žiadne kliknutia</p>
              )}
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex items-start justify-center relative">
            <div className="w-full max-w-4xl border border-white/10 rounded-xl overflow-hidden bg-slate-900 shadow-2xl relative">
              <div className="bg-slate-950 px-4 py-2 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 max-w-md bg-slate-900 border border-white/10 rounded px-3 py-1 text-[11px] text-slate-450 font-mono select-all text-center">
                  https://american-living.sk{clickMapPage}
                </div>
                <div className="w-12" />
              </div>

              <div className="relative w-full bg-slate-950 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
                {renderWireframeSections()}

                {filteredClicks.map((click, idx) => {
                  const x = click.x_percent !== undefined ? click.x_percent : 50;
                  const y = click.y_percent !== undefined ? click.y_percent : 50;
                  const intensity = getClickIntensity(click, filteredClicks);
                  const isHovered = hoveredClick === click;
                  
                  let colorClass = "bg-orange-500 shadow-orange-500/50";
                  if (intensity > 5) colorClass = "bg-red-600 shadow-red-600/50 animate-pulse";
                  else if (intensity > 2) colorClass = "bg-red-500 shadow-red-500/50";
                  else if (intensity === 1) colorClass = "bg-yellow-500 shadow-yellow-500/50";

                  if (isHovered) {
                    colorClass = "bg-indigo-400 ring-4 ring-indigo-500/50 z-20 scale-150 shadow-indigo-500/60";
                  }

                  return (
                    <div 
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-10"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onMouseEnter={() => setHoveredClick(click)}
                      onMouseLeave={() => setHoveredClick(null)}
                    >
                      <span className={`absolute inline-flex h-8 w-8 -left-3 -top-3 rounded-full opacity-35 bg-inherit animate-ping ${isHovered ? 'block' : 'hidden group-hover:block'}`} />
                      
                      <div className={`w-3 h-3 rounded-full border border-white/30 shadow-md ${colorClass}`}>
                        <div className="hidden group-hover:block absolute bg-slate-950 border border-white/20 rounded px-2 py-1 text-[9px] text-white font-bold w-44 shadow-xl -translate-y-full left-1/2 -translate-x-1/2 mb-2 z-30">
                          <p className="text-indigo-455 font-extrabold">&lt;{click.element.toUpperCase()}&gt; (Klik #{idx + 1})</p>
                          {click.text && <p className="text-slate-200 mt-0.5 truncate italic">"{click.text}"</p>}
                          {click.element_id && <p className="text-slate-400 font-mono text-[8px] mt-0.5">#{click.element_id}</p>}
                          <p className="text-slate-500 font-semibold text-[8px] mt-1">{format(new Date(click.timestamp), 'dd.MM HH:mm:ss')}</p>
                          {intensity > 1 && <p className="text-red-400 text-[8px] font-black mt-0.5">Intenzita: {intensity}x</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AdminAnalyzaSessions() {
  const [filterEmail, setFilterEmail] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedVisitor, setExpandedVisitor] = useState(null);
  const [sortBy, setSortBy] = useState("created_date");
  const [showMapModal, setShowMapModal] = useState(false);
  const [hideAdminSessions, setHideAdminSessions] = useState(true);
  const [groupByVisitor, setGroupByVisitor] = useState(false);

  // States pre click map vizualizátor
  const [clickMapSession, setClickMapSession] = useState(null);
  const [clickMapPage, setClickMapPage] = useState("");

  // Admin IP adresy na vylúčenie
  const ADMIN_IPS = [
    '109.230.104.122', // Admin IP
    '2a02:c847:166:a899:f148:3f22:4df1:169', // Admin IPv6
  ];
  const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Spustiť čistenie neaktívnych relácií na pozadí pre optimalizáciu DB na mount
  useEffect(() => {
    if (!isAdmin) return;
    base44.functions.invoke('cleanupInactiveSessions')
      .then(res => console.log('🧹 DB Cleanup completed on mount:', res.data))
      .catch(err => console.error('🧹 DB Cleanup error on mount:', err));
  }, [isAdmin]);

  // Načítať počiatočné dáta
  useEffect(() => {
    if (!isAdmin) return;

    const fetchInitialSessions = async () => {
      try {
        const data = await base44.entities.UserSession.list('-created_date', 1000);
        setSessions(data);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading sessions:', error);
        setIsLoading(false);
      }
    };

    fetchInitialSessions();
  }, [isAdmin]);

  // Real-time subscription na UserSession
  useEffect(() => {
    if (!isAdmin) return;

    console.log('🔴 Subscribing to UserSession real-time updates...');

    const unsubscribe = base44.entities.UserSession.subscribe((event) => {
      console.log('🔔 UserSession event:', event.type, event.id);

      setSessions(prevSessions => {
        if (event.type === 'create') {
          console.log('✅ New session created:', event.data.session_id);
          return [event.data, ...prevSessions];
        } else if (event.type === 'update') {
          console.log('📝 Session updated:', event.data.session_id);
          return prevSessions.map(s => s.id === event.id ? event.data : s);
        } else if (event.type === 'delete') {
          console.log('🗑️ Session deleted:', event.id);
          return prevSessions.filter(s => s.id !== event.id);
        }
        return prevSessions;
      });
    });

    return () => {
      console.log('🔴 Unsubscribing from UserSession...');
      unsubscribe();
    };
  }, [isAdmin]);

  const refetchSessions = async () => {
    const data = await base44.entities.UserSession.list('-created_date', 1000);
    setSessions(data);
  };

  // Real-time online visitors
  const { data: onlineVisitors } = useQuery({
    queryKey: ['online-visitors-realtime'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getRealTimeVisitors');
      return response.data || { count: 0, sessions: [] };
    },
    initialData: { count: 0, sessions: [] },
    enabled: isAdmin,
    refetchInterval: 300000, // Update každých 5 minút (optimalizácia kreditov)
    staleTime: 240000
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['houses'],
    queryFn: () => base44.entities.Dom.list(),
    initialData: [],
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000 // Domy sa menia zriedka - cache 5 minút
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  const filteredSessions = sessions.filter(session => {
    // Filter admin sessions a IP
    if (hideAdminSessions) {
      if (ADMIN_EMAILS.includes(session.user_email)) return false;
      if (session.location_info?.ip && ADMIN_IPS.includes(session.location_info.ip)) return false;
      // Filter sessions z app.base44.com (admin rozhranie)
      if (session.referrer && session.referrer.includes('app.base44.com')) return false;
      if (session.referrer_domain && session.referrer_domain.includes('app.base44.com')) return false;
    }

    if (filterEmail && !session.user_email?.toLowerCase().includes(filterEmail.toLowerCase())) return false;
    if (filterDateFrom && new Date(session.start_time) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(session.start_time) > new Date(filterDateTo + 'T23:59:59')) return false;
    if (filterDevice !== "all" && session.device_info?.device_type !== filterDevice) return false;
    if (filterTag !== "all" && !session.session_tags?.includes(filterTag)) return false;
    return true;
  });

  // Zoskupiť sessions podľa návštevníka (podľa trvalého visitor_id, inak podľa emailu/IP)
  const groupedVisitors = (() => {
    const groups = {};
    
    filteredSessions.forEach(session => {
      // Primary: visitor_id z cookies/localStorage
      // Secondary: user_email
      // Tertiary: location_info.ip
      // Quaternary: fallback to session_id
      const visitorKey = session.visitor_id || session.user_email || session.location_info?.ip || session.session_id || session.id;
      
      if (!groups[visitorKey]) {
        let displayName = session.user_name || session.user_email;
        if (!displayName) {
          if (session.location_info?.ip) {
            displayName = `IP: ${session.location_info.ip}`;
          } else if (session.visitor_id) {
            displayName = `Návštevník (ID: ${String(session.visitor_id).substring(0, 8)})`;
          } else {
            displayName = `Anonym (ID: ${session.session_id ? String(session.session_id).substring(0, 8) : (session.id ? String(session.id).substring(0, 8) : 'N/A')})`;
          }
        }

        groups[visitorKey] = {
          visitorKey,
          displayName,
          email: session.user_email,
          ip: session.location_info?.ip,
          sessions: [],
          totalSessions: 0,
          totalDuration: 0,
          totalClicks: 0,
          totalPages: 0,
          conversions: 0,
          isReturning: false,
          firstVisit: session.start_time,
          lastVisit: session.start_time,
          commonDevice: session.device_info?.device_type,
          commonLocation: session.location_info?.city ? `${session.location_info.city}, ${session.location_info.country_code}` : null,
          avgEngagement: 0
        };
      }
      
      const group = groups[visitorKey];
      group.sessions.push(session);
      group.totalSessions++;
      group.totalDuration += session.duration_seconds || 0;
      group.totalClicks += session.clicks?.length || 0;
      group.totalPages += session.pages_visited?.length || 0;
      group.conversions += session.conversions?.length || 0;
      
      if (new Date(session.start_time) < new Date(group.firstVisit)) {
        group.firstVisit = session.start_time;
      }
      if (new Date(session.start_time) > new Date(group.lastVisit)) {
        group.lastVisit = session.start_time;
      }
      
      group.isReturning = group.totalSessions > 1 || session.session_number > 1;
    });
    
    // Vypočítať priemerný engagement
    Object.values(groups).forEach(group => {
      group.avgEngagement = Math.round(
        group.sessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / group.sessions.length
      );
    });
    
    return Object.values(groups).sort((a, b) => 
      new Date(b.lastVisit) - new Date(a.lastVisit)
    );
  })();

  const stats = {
    totalSessions: filteredSessions.length,
    avgDuration: Math.round(filteredSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / filteredSessions.length) || 0,
    totalClicks: filteredSessions.reduce((acc, s) => acc + (s.clicks?.length || 0), 0),
    uniqueUsers: groupedVisitors.length,
    activeSessions: filteredSessions.filter(s => isSessionOnline(s)).length,
    avgEngagement: Math.round(filteredSessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / filteredSessions.length) || 0,
    conversions: filteredSessions.filter(s => s.conversions?.length > 0).length,
    returningVisitors: groupedVisitors.filter(v => v.isReturning).length
  };

  const getDeviceIcon = (deviceType) => {
    switch(deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const safeFormat = (value, fmt, options = {}) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return format(d, fmt, options);
  };

  const getTagColor = (tag) => {
    const colors = {
      'bounced': 'bg-red-100 text-red-800',
      'odrazeny': 'bg-red-100 text-red-800',
      'engaged': 'bg-blue-100 text-blue-800',
      'zaujaty': 'bg-blue-100 text-blue-800',
      'highly_engaged': 'bg-purple-100 text-purple-800',
      'velmi_zaujaty': 'bg-purple-100 text-purple-800',
      'explorer': 'bg-green-100 text-green-800',
      'prieskumnik': 'bg-green-100 text-green-800',
      'converted': 'bg-yellow-100 text-yellow-800',
      'konvertoval': 'bg-yellow-100 text-yellow-800',
      'configurator_user': 'bg-indigo-100 text-indigo-800',
      'pouzivatel_konfiguratora': 'bg-indigo-100 text-indigo-800',
      'vracajuci_sa': 'bg-teal-100 text-teal-800'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const renderSessionDetailTabs = (session) => {
    const activeTab = getSessionActiveTab(session.id);
    const tabs = [
      { id: 'overview', label: 'Prehľad & Tech', icon: Monitor },
      { id: 'path', label: 'Cesta', icon: Navigation, count: session.pages_visited?.length || 0 },
      { id: 'engagement', label: 'Záujem', icon: Clock },
      { id: 'clicks', label: 'Kliknutia', icon: MousePointer, count: session.clicks?.length || 0 },
      { id: 'configurator', label: 'Akcie & Formuláre', icon: Layers },
      { id: 'diagnostics', label: 'Diagnostika', icon: AlertTriangle, count: session.errors_encountered?.length || 0, badgeColor: 'bg-red-100 text-red-800' }
    ];

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[450px]">
        {/* Tab Navigation Sidebar */}
        <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto whitespace-nowrap md:whitespace-normal shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSessionActiveTab(session.id, tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all text-left w-full ${
                  isActive 
                    ? 'bg-indigo-650 text-white shadow-sm' 
                    : 'text-slate-650 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-black ${
                    isActive ? 'bg-indigo-850 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 p-4 overflow-y-auto bg-white min-h-0 text-slate-800">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Tech Specs */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Zariadenie & Technické informácie</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Typ zariadenia</p>
                    <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                      {getDeviceIcon(session.device_info?.device_type)}
                      <span className="capitalize">{session.device_info?.device_type || 'Neznáme'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Prehliadač</p>
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {session.device_info?.browser || 'Neznámy'} {session.device_info?.browser_version || ''}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Operačný systém</p>
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {session.device_info?.os || 'Neznámy'} {session.device_info?.os_version || ''}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Obrazovka & Viewport</p>
                    <p className="text-xs font-extrabold text-slate-900">
                      {session.device_info?.screen_width && session.device_info?.screen_height 
                        ? `${session.device_info.screen_width}x${session.device_info.screen_height}` 
                        : 'N/A'}
                    </p>
                    {session.device_info?.viewport_width && (
                      <p className="text-[9px] text-slate-500 font-semibold">
                        Viewport: {session.device_info.viewport_width}x{session.device_info.viewport_height}
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Časové pásmo</p>
                    <p className="text-xs font-extrabold text-slate-900">{session.device_info?.timezone || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Jazyk</p>
                    <p className="text-xs font-extrabold text-slate-900">{session.device_info?.language || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Dotykový displej</p>
                    <p className="text-xs font-extrabold text-slate-900">{session.device_info?.is_touch ? '✅ Áno' : '❌ Nie'}</p>
                  </div>
                </div>
              </div>

              {/* Web Vitals */}
              {session.performance_metrics && session.performance_metrics.recorded && (
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Web Vitals (Rýchlosť načítania)</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderWebVital("TTFB", session.performance_metrics.ttfb, "ms", { warning: 800, poor: 1800 })}
                    {renderWebVital("LCP", session.performance_metrics.lcp, "s", { warning: 2500, poor: 4000 })}
                    {renderWebVital("FID", session.performance_metrics.fid, "ms", { warning: 100, poor: 300 })}
                    {renderWebVital("CLS", session.performance_metrics.cls, "", { warning: 0.1, poor: 0.25 })}
                  </div>
                </div>
              )}

              {/* Geographical Location */}
              {session.location_info && (
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Lokácia a sieť</h5>
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <p className="text-[10px] text-emerald-800 font-bold">IP Adresa</p>
                      <p className="font-extrabold text-slate-900">{session.location_info.ip || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-800 font-bold">Krajina</p>
                      <p className="font-extrabold text-slate-900">{session.location_info.country || '—'} (${session.location_info.country_code || '—'})
</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-800 font-bold">Mesto & Región</p>
                      <p className="font-extrabold text-slate-900">{session.location_info.city || '—'}, {session.location_info.region || '—'}</p>
                    </div>
                    {session.location_info.latitude && (
                      <div>
                        <p className="text-[10px] text-emerald-800 font-bold">GPS Súradnice</p>
                        <p className="font-extrabold text-slate-900">
                          {session.location_info.latitude.toFixed(4)}, {session.location_info.longitude.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UTM and Campaign Source */}
              {(session.referrer || (session.utm_params && Object.values(session.utm_params).some(v => v))) && (
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Akvizícia & Kampaň</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {session.referrer && session.referrer !== 'direct' && (
                      <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg">
                        <p className="text-[10px] text-blue-800 font-bold mb-0.5">Odkazujúca stránka (Referrer)</p>
                        <p className="font-bold text-slate-900 break-all">{session.referrer}</p>
                        {session.referrer_domain && (
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Doména: {session.referrer_domain}</p>
                        )}
                      </div>
                    )}
                    {session.utm_params && Object.values(session.utm_params).some(v => v) && (
                      <div className="bg-purple-50/50 border border-purple-100 p-2.5 rounded-lg space-y-1">
                        <p className="text-[10px] text-purple-800 font-bold mb-1">UTM Parametre</p>
                        {session.utm_params.utm_source && (
                          <p className="text-[11px] font-semibold"><span className="text-slate-500">Zdroj:</span> <span className="font-bold text-purple-955">{session.utm_params.utm_source}</span></p>
                        )}
                        {session.utm_params.utm_medium && (
                          <p className="text-[11px] font-semibold"><span className="text-slate-500">Médium:</span> <span className="font-bold text-purple-955">{session.utm_params.utm_medium}</span></p>
                        )}
                        {session.utm_params.utm_campaign && (
                          <p className="text-[11px] font-semibold"><span className="text-slate-500">Kampaň:</span> <span className="font-bold text-purple-955">{session.utm_params.utm_campaign}</span></p>
                        )}
                        {session.utm_params.utm_term && (
                          <p className="text-[11px] font-semibold"><span className="text-slate-500">Výraz:</span> <span className="font-bold text-purple-955">{session.utm_params.utm_term}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'path' && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Chronologická cesta návštevníka</h5>
              {(!session.pages_visited || session.pages_visited.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-8">Žiadne záznamy o navštívených stránkach.</p>
              ) : (
                <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-3 max-h-[350px] overflow-y-auto">
                  {session.pages_visited.map((page, idx) => (
                    <div key={idx} className="relative bg-slate-55 p-2.5 rounded-lg border border-slate-150">
                      <div className="absolute -left-[25px] top-3.5 w-2 h-2 rounded-full bg-indigo-500 border border-white" />
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">Krok {idx + 1}</span>
                            <span className="text-xs font-extrabold text-slate-900">{page.page_name_sk || page.page_title || page.page_url}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono select-all truncate max-w-xl">{page.page_url}</p>
                          <div className="flex gap-3 text-[10px] text-slate-655 font-bold mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(page.time_spent_seconds)}</span>
                            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />Hĺbka scrollu: {page.scroll_depth_percentage || 0}%</span>
                            {page.exit_type && (
                              <span className="bg-slate-250 text-slate-750 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">
                                {page.exit_type === 'bounce' ? '⚡ Odchod ihneď' : page.exit_type === 'exit' ? '🚪 Ukončenie' : page.exit_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-black">{safeFormat(page.timestamp, 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Angažovanosť a čítanie sekcií</h5>
              {(!session.section_engagement || Object.keys(session.section_engagement).length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-8">Neboli zaznamenané konkrétne čítania sekcií.</p>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {Object.entries(session.section_engagement)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sectionId, seconds]) => {
                      const totalSec = Object.values(session.section_engagement).reduce((acc, s) => acc + s, 0);
                      const percent = totalSec > 0 ? Math.round((seconds / totalSec) * 100) : 0;
                      return (
                        <div key={sectionId} className="bg-slate-55 p-2.5 rounded-lg border border-slate-150">
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span className="text-slate-800 capitalize font-extrabold">{sectionId.replace(/[-_]/g, ' ')}</span>
                            <span className="text-slate-900 font-black">{formatDuration(seconds)} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'clicks' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">História kliknutí na stránke</h5>
                {session.clicks && session.clicks.length > 0 && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setClickMapSession(session);
                      setClickMapPage(session.clicks[0]?.page_url || "");
                    }}
                    className="bg-indigo-655 hover:bg-indigo-700 text-white font-bold text-xs px-2.5 py-1 h-7 shadow"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    Vizualizovať Click Mapu
                  </Button>
                )}
              </div>

              {(!session.clicks || session.clicks.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-8">Neboli zaznamenané žiadne kliknutia.</p>
              ) : (
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {session.clicks.map((click, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 p-2 bg-slate-50 border border-slate-150 rounded-lg text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 font-extrabold rounded text-[10px]">&lt;{click.element}&gt;</span>
                          {click.text && <span className="font-extrabold text-slate-900 truncate italic">"${click.text}"</span>}
                        </div>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-bold flex-wrap">
                          <span>Pozícia: {click.x_percent !== undefined ? `${click.x_percent}%, ${click.y_percent}%` : `${click.x_position}px, ${click.y_position}px`}</span>
                          <span>Stránka: {click.page_name_sk || click.page_url}</span>
                          {click.element_id && <span className="text-indigo-650 font-extrabold">ID: #${click.element_id}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-450 font-extrabold shrink-0">{safeFormat(click.timestamp, 'HH:mm:ss')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'configurator' && (
            <div className="space-y-4">
              {/* Configurator */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Interakcie s konfigurátorom</h5>
                {(!session.configurator_interactions || session.configurator_interactions.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed">Žiadne interakcie v konfigurátore.</p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {session.configurator_interactions.map((interaction, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-xs flex justify-between items-center gap-4">
                        <div>
                          <span className="font-extrabold text-slate-900">{interaction.dom_nazov || 'Konfigurátor'}</span>
                          <span className="text-slate-400 mx-1.5 font-bold">→</span>
                          <span className="text-indigo-755 font-black">{interaction.action}</span>
                          {interaction.option_selected && (
                            <span className="text-slate-600 font-extrabold ml-1 bg-white border px-1.5 py-0.2 rounded text-[10px]">
                              {interaction.option_selected}
                            </span>
                          )}
                        </div>
                        {interaction.price_at_time && (
                          <span className="bg-green-100 text-green-900 px-2 py-0.5 rounded font-black text-xs shrink-0 border border-green-200">
                            {interaction.price_at_time.toLocaleString('sk-SK')} €
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Viewed Houses */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">🏠 Prezerané domy v detaile</h5>
                {(!session.dom_interactions || session.dom_interactions.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed">Žiadne interakcie s katalógom domov.</p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {session.dom_interactions.map((interaction, idx) => (
                      <div key={idx} className="bg-slate-55 p-2 rounded border border-slate-150 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-900">{interaction.dom_nazov}</span>
                          <span className="ml-2 inline-flex items-center rounded bg-indigo-50 border border-indigo-100 text-indigo-850 px-1.5 py-0.2 text-[10px] font-black">{interaction.action}</span>
                        </div>
                        {interaction.duration_seconds > 0 && (
                          <span className="text-[10px] text-slate-500 font-extrabold">{formatDuration(interaction.duration_seconds)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Odoslané a vyplnené formuláre</h5>
                {(!session.form_interactions || session.form_interactions.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-55 rounded-lg border border-dashed">Žiadne vyplnené formuláre.</p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {session.form_interactions.map((form, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-xs">
                        <div className="flex justify-between items-center mb-1 flex-wrap">
                          <span className="font-extrabold text-slate-900">{form.form_id}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                            form.completed || form.action === 'submit' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {form.action}
                          </span>
                        </div>
                        {form.fields_touched && form.fields_touched.length > 0 && (
                          <p className="text-slate-605 font-semibold text-[10px] mt-1 bg-white p-1 rounded border border-slate-100">
                            Polia: {form.fields_touched.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              {/* JS Errors */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">JavaScript Chyby & Výnimky</h5>
                {(!session.errors_encountered || session.errors_encountered.length === 0) ? (
                  <p className="text-xs text-emerald-805 italic text-center py-4 bg-emerald-50/30 rounded-lg border border-emerald-100">
                    V relácii neboli zistené žiadne chyby na strane klienta.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {session.errors_encountered.map((error, idx) => (
                      <div key={idx} className="bg-red-50 p-2.5 rounded-lg border border-red-150 text-xs">
                        <p className="font-extrabold text-red-955 mb-1 leading-snug">{error.error_message}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{error.page_url}</p>
                        {error.error_stack && (
                          <details className="mt-1.5">
                            <summary className="cursor-pointer text-[10px] text-red-800 font-bold hover:underline">Zobraziť Stack Trace</summary>
                            <pre className="text-[10px] bg-slate-955 text-green-400 p-2 rounded mt-1 overflow-auto max-h-40 font-mono">
                              {error.error_stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Language switches */}
              {session.language_changes && session.language_changes.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">🌍 Zmeny jazyka</h5>
                  <div className="flex flex-wrap gap-2">
                    {session.language_changes.map((change, idx) => (
                      <div key={idx} className="bg-slate-55 border px-2 py-1 rounded text-xs flex items-center gap-1.5">
                        <span className="font-black text-slate-900 uppercase">{change.from}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-black text-slate-905 uppercase">{change.to}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({safeFormat(change.timestamp, 'HH:mm:ss')})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Kompletné surové dáta relácie</h5>
                <details className="bg-slate-955 p-3 rounded-xl border border-slate-800">
                  <summary className="cursor-pointer text-xs font-bold text-green-400 hover:text-green-300">
                    🔍 Zobraziť JSON formát ({Math.round(JSON.stringify(session).length / 1024)} KB)
                  </summary>
                  <pre className="text-[10px] overflow-auto max-h-60 mt-2 text-green-400 font-mono leading-normal select-all">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg"><Activity className="w-5 h-5" /></span>
              Analytics & Sessions Recorder
            </h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">Komplexná behaviorálna a výkonnostná analytika návštevnosti</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-450 font-black uppercase">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              Live stream aktívny • Auto-aktualizácia každých 5 minút
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setShowSystemTools(!showSystemTools)}
              variant="outline"
              className={`font-bold h-11 border-slate-250 transition-all ${
                showSystemTools 
                  ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-950' 
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-4 h-4 mr-2 ${showSystemTools ? 'animate-spin' : ''}`} />
              Systémové nástroje
            </Button>
            
            <Button
              onClick={() => refetchSessions()}
              variant="outline"
              className="bg-white border-slate-250 text-slate-700 font-bold hover:bg-slate-50 h-11"
            >
              <Activity className="w-4 h-4 mr-2" />
              Obnoviť
            </Button>

            <Button
              onClick={() => setShowMapModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white font-bold h-11 shadow-md px-4"
            >
              <Globe className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="text-[9px] opacity-80 uppercase font-black leading-none">Online teraz</div>
                <div className="text-lg font-black leading-none mt-0.5">{onlineVisitors.count}</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Database tools sliding drawer */}
        {showSystemTools && (
          <Card className="p-4 mb-6 bg-slate-900 border-white/10 text-white animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <Settings className="w-4 h-4 text-indigo-400" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Pokročilé systémové nástroje</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 font-semibold">Tieto operácie vykonávajú hromadnú úpravu historických relácií v databáze a môžu chvíľu trvať.</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  if (!confirm('Načítať späť interakcie domov zo starých sessions?')) return;
                  try {
                    const response = await base44.functions.invoke('backfillDomInteractions');
                    if (response.data?.success) {
                      alert(`✅ ${response.data.message}`);
                      refetchSessions();
                    }
                  } catch (error) {
                    alert(`❌ Chyba: ${error.message}`);
                  }
                }}
                variant="outline"
                className="bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/60 font-bold hover:text-white text-xs py-1.5 h-8 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Hromadný Backfill Prezerania Domov
              </Button>

              <Button
                onClick={async () => {
                  if (!confirm('Doplniť GPS lokácie pre staré sessions? (môže trvať niekoľko minút)')) return;
                  try {
                    const response = await base44.functions.invoke('enrichLocationData');
                    if (response.data?.success) {
                      alert(`✅ ${response.data.message}`);
                      refetchSessions();
                    }
                  } catch (error) {
                    alert(`❌ Chyba: ${error.message}`);
                  }
                }}
                variant="outline"
                className="bg-emerald-950/40 border-emerald-500/30 text-emerald-250 hover:bg-emerald-900/60 font-bold hover:text-white text-xs py-1.5 h-8 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Doplniť GPS z IP Adries
              </Button>
            </div>
          </Card>
        )}

        {/* KPI Dashboard stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5 mb-6">
          {[
            { label: 'Relácie celkovo', value: stats.totalSessions, icon: Activity, bg: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600' },
            { label: 'Unikátni ľudia', value: stats.uniqueUsers, icon: Users, bg: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-600' },
            { label: 'Priemerný čas', value: formatDuration(stats.avgDuration), icon: Clock, bg: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600' },
            { label: 'Kliknutia na webe', value: stats.totalClicks, icon: MousePointer, bg: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600' },
            { label: 'Aktívne relácie', value: stats.activeSessions, icon: TrendingUp, bg: 'from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600' },
            { label: 'Priem. záujem', value: `${stats.avgEngagement} / 100`, icon: Zap, bg: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/20 text-cyan-600' },
            { label: 'Odoslané konverzie', value: stats.conversions, icon: FileText, bg: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-yellow-600' },
            { label: 'Vracajúci sa', value: stats.returningVisitors, icon: Users, bg: 'from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-650' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className={`p-3 bg-gradient-to-br ${item.bg} border shadow-sm flex flex-col justify-between`}>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{item.label}</span>
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-none">{item.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Filters Card */}
        <Card className="p-4 mb-6 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="font-extrabold text-sm text-slate-800">Filtrovanie a vyhľadávanie relácií</h3>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterEmail("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setFilterDevice("all");
                  setFilterTag("all");
                }}
                className="font-bold text-slate-655 hover:bg-slate-100 h-8"
              >
                Vyčistiť filtre
              </Button>
              
              <Button
                variant={hideAdminSessions ? "default" : "outline"}
                size="sm"
                onClick={() => setHideAdminSessions(!hideAdminSessions)}
                className={`font-bold h-8 transition-colors ${
                  hideAdminSessions 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm' 
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                {hideAdminSessions ? "🔒 Admin skrytý" : "👁️ Zobraziť admin"}
              </Button>

              <Button
                variant={groupByVisitor ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupByVisitor(!groupByVisitor)}
                className={`font-bold h-8 transition-colors ${
                  groupByVisitor 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' 
                    : 'text-slate-655 hover:bg-slate-100'
                }`}
              >
                {groupByVisitor ? "👥 Zoskupené podľa návštevníkov" : "📋 Zoznam všetkých relácií"}
              </Button>

              <Badge className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold px-2.5 py-1">
                Nájdené: {groupByVisitor ? groupedVisitors.length : filteredSessions.length} relácií
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1 block">Meno / Email návštevníka</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                <Input
                  placeholder="Hľadať podľa emailu..."
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="pl-8.5 h-9 text-xs font-medium border-slate-200 rounded-lg focus-visible:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1 block">Dátum od</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-9 text-xs font-medium border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1 block">Dátum do</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-9 text-xs font-medium border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1 block">Typ zariadenia</label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full h-9 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Všetky typy</option>
                <option value="desktop">💻 Desktop</option>
                <option value="mobile">📱 Mobil</option>
                <option value="tablet">📟 Tablet</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1 block">Kategória (Tag)</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full h-9 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Všetky tagy</option>
                <option value="odrazeny">⚡ Odrazený (Bounced)</option>
                <option value="zaujaty">📈 Zaujatý (Engaged)</option>
                <option value="velmi_zaujaty">🔥 Veľmi zaujatý</option>
                <option value="vracajuci_sa">🔄 Vracajúci sa</option>
                <option value="konvertoval">⭐ Konvertoval</option>
                <option value="pouzivatel_konfiguratora">🏠 Konfigurátor</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sessions Layout block */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <Card className="p-12 text-center bg-white border-slate-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650 mx-auto mb-4"></div>
              <p className="text-slate-500 text-sm font-semibold">Načítavam relácie...</p>
            </Card>
          ) : groupByVisitor ? (
            groupedVisitors.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200">
                <Users className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-pulse" />
                <p className="text-slate-500 text-sm font-semibold">Žiadni návštevníci nevyhovujú filtrom.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column - List of Visitors */}
                <div className="lg:col-span-4 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Zoznam návštevníkov (${groupedVisitors.length})</span>
                  </div>
                  {groupedVisitors.map((visitor) => {
                    const isSelected = expandedVisitor === visitor.visitorKey;
                    const isOnlineNow = visitor.sessions.some(s => isSessionOnline(s));
                    return (
                      <div
                        key={visitor.visitorKey}
                        onClick={() => setExpandedVisitor(visitor.visitorKey)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-indigo-650 border-indigo-650 text-white shadow-md' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className={`font-black text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {visitor.displayName}
                          </h4>
                          {isOnlineNow && (
                            <span className="flex h-2.5 w-2.5 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                          )}
                        </div>
                        
                        {visitor.email && (
                          <p className={`text-[11px] truncate mb-2 font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-650'}`}>
                            {visitor.email}
                          </p>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-extrabold mt-1">
                          <div className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{visitor.totalSessions} relácií</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDuration(visitor.totalDuration)}</span>
                          </div>
                        </div>

                        <div className={`flex items-center justify-between text-[10px] font-bold mt-2 pt-2 border-t border-dashed ${
                          isSelected ? 'border-indigo-500/50 text-indigo-150' : 'border-slate-200 text-slate-450'
                        }`}>
                          <span className="truncate">{visitor.commonLocation || 'Slovensko'}</span>
                          <span>{safeFormat(visitor.lastVisit, 'dd.MM HH:mm', { locale: sk })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column - Visitor Detail Pane */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[500px]">
                  {expandedVisitor ? (() => {
                    const visitor = groupedVisitors.find(v => v.visitorKey === expandedVisitor);
                    if (!visitor) return <div className="text-center py-20 text-slate-400 font-semibold">Návštevník sa nenašiel</div>;
                    
                    return (
                      <div className="space-y-6">
                        {/* Header info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <h2 className="text-lg font-black text-slate-900">{visitor.displayName}</h2>
                              {visitor.isReturning && (
                                <Badge className="bg-teal-650 text-white text-[9px] font-black">VRACAUJÚCI SA (${visitor.totalSessions}x)</Badge>
                              )}
                              {visitor.sessions.some(s => isSessionOnline(s)) && (
                                <Badge className="bg-green-600 text-white text-[9px] font-black animate-pulse">🟢 ONLINE TERAZ</Badge>
                              )}
                              {visitor.conversions > 0 && (
                                <Badge className="bg-yellow-600 text-white text-[9px] font-black">⭐ ${visitor.conversions} KONVERZIÍ</Badge>
                              )}
                            </div>
                            {visitor.email && <p className="text-xs font-bold text-indigo-650">{visitor.email}</p>}
                            {visitor.ip && <p className="text-[10px] text-slate-450 font-mono">IP: {visitor.ip}</p>}
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[10px] font-extrabold text-slate-600 space-y-1">
                            <div>Prvá návšteva: <span className="text-slate-900">{safeFormat(visitor.firstVisit, 'dd.MM.yyyy HH:mm', { locale: sk })}</span></div>
                            <div>Posledná aktivita: <span className="text-slate-900">{safeFormat(visitor.lastVisit, 'dd.MM.yyyy HH:mm', { locale: sk })}</span></div>
                          </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Celkový čas na webe</p>
                            <p className="text-sm font-black text-slate-900">{formatDuration(visitor.totalDuration)}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Počet relácií</p>
                            <p className="text-sm font-black text-slate-900">{visitor.totalSessions}x</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Priemerný záujem</p>
                            <p className="text-sm font-black text-slate-900">{visitor.avgEngagement} / 100</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Zariadenie / Lokácia</p>
                            <p className="text-xs font-black text-slate-900 truncate">
                              {visitor.commonLocation || 'Slovensko'}
                            </p>
                            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-0.5 capitalize mt-0.5">
                              {getDeviceIcon(visitor.commonDevice)}
                              {visitor.commonDevice || 'desktop'}
                            </p>
                          </div>
                        </div>

                        {/* Session Timeline */}
                        <div>
                          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-wider mb-3">História a záznam relácií (${visitor.sessions.length})</h4>
                          <div className="space-y-3">
                            {visitor.sessions.map((session, sessionIdx) => {
                              const isSessionExpanded = expandedSession === session.id;
                              return (
                                <div key={session.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                  {/* Session Bar */}
                                  <div 
                                    onClick={() => setExpandedSession(isSessionExpanded ? null : session.id)}
                                    className={`p-3 cursor-pointer flex justify-between items-center transition-all ${
                                      isSessionExpanded ? 'bg-slate-55 border-b border-slate-200' : 'hover:bg-slate-50/50'
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 font-black rounded text-[9px]">Relácia #${visitor.sessions.length - sessionIdx}</span>
                                        {isSessionOnline(session) && (
                                          <span className="px-1.5 py-0.2 bg-green-600 text-white font-black rounded text-[9px] animate-pulse">AKTÍVNA</span>
                                        )}
                                        {session.engagement_score > 70 && (
                                          <span className="px-1.5 py-0.2 bg-purple-600 text-white font-black rounded text-[9px]">🔥 ${session.engagement_score}</span>
                                        )}
                                        {session.session_tags?.map(tag => (
                                          <Badge key={tag} className={`text-[9px] font-bold ${getTagColor(tag)}`}>
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                      
                                      <div className="flex items-center gap-4 text-[10px] text-slate-655 font-bold flex-wrap">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{safeFormat(session.start_time, 'dd.MM.yyyy HH:mm', { locale: sk })}</span>
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-slate-400" />{formatDuration(session.duration_seconds)}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" />{session.pages_visited?.length || 0} strán</span>
                                        <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5 text-slate-400" />{session.clicks?.length || 0} klikov</span>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="p-1 h-auto">
                                      {isSessionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                  </div>

                                  {/* Session Tabs Inside Accordion */}
                                  {isSessionExpanded && (
                                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                                      {renderSessionDetailTabs(session)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400">
                      <Users className="w-12 h-12 text-slate-200 mb-3" />
                      <h3 className="text-sm font-black text-slate-700">Profil návštevníka</h3>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">Vyberte návštevníka v ľavom paneli na zobrazenie jeho kompletného profilu, relácií, akcií v konfigurátore a cesty na stránke.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* GroupByVisitor = false (Simple grid list of all sessions) */
            filteredSessions.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200">
                <Activity className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-pulse" />
                <p className="text-slate-500 text-sm font-semibold">Žiadne relácie nevyhovujú filtrom.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const isSessionExpanded = expandedSession === session.id;
                  return (
                    <div key={session.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      {/* Header row */}
                      <div 
                        onClick={() => setExpandedSession(isSessionExpanded ? null : session.id)}
                        className={`p-4 cursor-pointer flex justify-between items-start gap-4 transition-all ${
                          isSessionExpanded ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-extrabold text-slate-900 text-sm">{session.user_name || session.user_email || 'Anonymný návštevník'}</h3>
                            {isSessionOnline(session) && (
                              <Badge className="bg-green-600 text-white text-[9px] font-black animate-pulse">🟢 ONLINE TERAZ</Badge>
                            )}
                            {session.engagement_score > 70 && (
                              <Badge className="bg-purple-600 text-white text-[9px] font-black">🔥 {session.engagement_score} ZÁUJEM</Badge>
                            )}
                            {session.session_tags?.map(tag => (
                              <Badge key={tag} className={`text-[9px] font-bold ${getTagColor(tag)}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {session.user_email && <p className="text-xs font-bold text-indigo-650 mb-1">{session.user_email}</p>}
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 text-[10px] text-slate-655 font-bold mt-2">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{safeFormat(session.start_time, 'dd.MM.yyyy HH:mm', { locale: sk })}</span>
                            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-slate-400" />{formatDuration(session.duration_seconds)}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" />{session.pages_visited?.length || 0} strán</span>
                            <span className="flex items-center gap-1"><MousePointer className="w-3.5 h-3.5 text-slate-400" />{session.clicks?.length || 0} klikov</span>
                            <span className="flex items-center gap-1 capitalize">
                              {getDeviceIcon(session.device_info?.device_type)}
                              {session.device_info?.device_type || 'desktop'}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          {isSessionExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      </div>

                      {/* Session Detail Tabs */}
                      {isSessionExpanded && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200">
                          {renderSessionDetailTabs(session)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Online Visitors Map Modal */}
      {showMapModal && (
        <OnlineVisitorsMap
          sessions={sessions}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* Click Map Overlay Modal */}
      {clickMapSession && (
        <ClickMapModal
          session={clickMapSession}
          onClose={() => {
            setClickMapSession(null);
            setClickMapPage("");
          }}
        />
      )}
    </div>
  );
}