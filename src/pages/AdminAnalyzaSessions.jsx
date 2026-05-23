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

  // Zoskupiť sessions podľa návštevníka (email ak prihlásený, inak IP)
  const groupedVisitors = (() => {
    const groups = {};
    
    filteredSessions.forEach(session => {
      const visitorKey = session.user_email || session.location_info?.ip || session.session_id;
      
      if (!groups[visitorKey]) {
        groups[visitorKey] = {
          visitorKey,
          displayName: session.user_name || session.user_email || `IP: ${session.location_info?.ip || 'Unknown'}`,
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
      
      group.isReturning = group.totalSessions > 1;
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
    activeSessions: filteredSessions.filter(s => s.is_active).length,
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics & Sessions</h1>
            <p className="text-gray-600">Komplexná analytika ako Google Analytics</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Automatická aktualizácia každých 5 minút
            </div>
          </div>
          <div className="flex gap-2">
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
              className="bg-purple-50 border-purple-300 text-purple-900 font-bold hover:bg-purple-100 hover:text-purple-950 shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              🔄 Načítať staré dáta
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
              className="bg-green-50 border-green-300 text-green-900 font-bold hover:bg-green-100 hover:text-green-950 shadow-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              📍 GPS lokácie
            </Button>
            <Button
              onClick={() => refetchSessions()}
              variant="outline"
              className="bg-cyan-50 border-cyan-300 text-cyan-900 font-bold hover:bg-cyan-100 hover:text-cyan-950 shadow-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              🔄 Obnoviť
            </Button>
            <Button
              onClick={() => setShowMapModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
            >
              <Globe className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="text-xs opacity-80">Online teraz</div>
                <div className="text-xl font-black">{onlineVisitors.count}</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="mb-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unikátni</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Priem. čas</p>
                <p className="text-xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Kliknutia</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Aktívne</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Angažov.</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgEngagement}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Konverzie</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vracajúci</p>
                <p className="text-2xl font-bold text-gray-900">{stats.returningVisitors}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtre a vyhľadávanie</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Email / Meno</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hľadať..."
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Dátum od</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Dátum do</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Zariadenie</label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-slate-900 border-white/10 text-white"
              >
                <option value="all">Všetky</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobil</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Tag</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-slate-900 border-white/10 text-white"
              >
                <option value="all">Všetky</option>
                <option value="odrazeny">Odrazený</option>
                <option value="zaujaty">Zaujatý</option>
                <option value="velmi_zaujaty">Veľmi zaujatý</option>
                <option value="vracajuci_sa">🔄 Vracajúci sa</option>
                <option value="konvertoval">Konvertoval</option>
                <option value="pouzivatel_konfiguratora">Konfigurátor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
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
            >
              Vyčistiť filtre
            </Button>
            <Button
              variant={hideAdminSessions ? "default" : "outline"}
              size="sm"
              onClick={() => setHideAdminSessions(!hideAdminSessions)}
              className={hideAdminSessions ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {hideAdminSessions ? "🔒 Admin skrytý" : "👁️ Zobraziť admin"}
            </Button>
            <Button
              variant={groupByVisitor ? "default" : "outline"}
              size="sm"
              onClick={() => setGroupByVisitor(!groupByVisitor)}
              className={groupByVisitor ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {groupByVisitor ? "👥 Skupinové" : "📋 Všetky sessions"}
            </Button>
            <Badge className="bg-blue-100 text-blue-800">
              {filteredSessions.length} sessions
            </Badge>
            {hideAdminSessions && (
              <Badge className="bg-purple-100 text-purple-800">
                Admin IP a email vylúčené
              </Badge>
            )}
          </div>
        </Card>

        {/* Sessions List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítavam sessions...</p>
            </Card>
          ) : groupByVisitor ? (
            groupedVisitors.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Žiadni návštevníci nenájdení</p>
              </Card>
            ) : (
              groupedVisitors.map((visitor) => (
              <Card key={visitor.visitorKey} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Visitor Header - agregované údaje */}
                <div 
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                  onClick={() => setExpandedVisitor(expandedVisitor === visitor.visitorKey ? null : visitor.visitorKey)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{visitor.displayName}</h3>
                        {visitor.isReturning && (
                          <Badge className="bg-teal-600 text-white text-xs">🔄 Vracajúci sa ({visitor.totalSessions}×)</Badge>
                        )}
                        {visitor.sessions.some(s => s.is_active) && (
                          <Badge className="bg-green-600 text-white text-xs animate-pulse">🟢 Online teraz</Badge>
                        )}
                        {visitor.conversions > 0 && (
                          <Badge className="bg-yellow-600 text-white text-xs">⭐ {visitor.conversions} konverzie</Badge>
                        )}
                        {visitor.avgEngagement > 70 && (
                          <Badge className="bg-purple-600 text-white text-xs">🔥 {visitor.avgEngagement}</Badge>
                        )}
                      </div>
                      
                      {visitor.email && <p className="text-sm text-slate-700 font-medium mb-2">{visitor.email}</p>}
                      {visitor.ip && !visitor.email && (
                        <p className="text-sm text-slate-700 font-medium mb-2 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-600" />
                          IP: {visitor.ip}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-slate-800 font-medium">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {visitor.totalSessions} návštev
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(visitor.totalDuration)} celkom
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {visitor.totalPages} strán
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {visitor.totalClicks} kliknutí
                        </div>
                        {visitor.commonDevice && (
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(visitor.commonDevice)}
                            {visitor.commonDevice}
                          </div>
                        )}
                        {visitor.commonLocation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {visitor.commonLocation}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {safeFormat(visitor.lastVisit, 'dd.MM.yyyy HH:mm', { locale: sk })}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      {expandedVisitor === visitor.visitorKey ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded - All Sessions for this Visitor */}
                {expandedVisitor === visitor.visitorKey && (
                  <div className="p-4 border-t bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        História návštev ({visitor.totalSessions})
                      </h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {safeFormat(visitor.firstVisit, 'dd.MM.yyyy', { locale: sk })} - {safeFormat(visitor.lastVisit, 'dd.MM.yyyy', { locale: sk })}
                      </Badge>
                    </div>

                    {/* Individual Sessions */}
                    <div className="space-y-3">
                      {visitor.sessions.map((session, sessionIdx) => (
                        <Card key={session.id} className="bg-white border-l-4 border-blue-400">
                          {/* Individual Session Header */}
                          <div 
                            className="p-3 cursor-pointer hover:bg-gray-50 transition-all"
                            onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                                    Návšteva #{sessionIdx + 1}
                                  </Badge>
                                  {session.is_active && (
                                    <Badge className="bg-green-600 text-white text-xs animate-pulse">🟢 Aktívna</Badge>
                                  )}
                                  {session.engagement_score > 70 && (
                                    <Badge className="bg-purple-600 text-white text-xs">🔥 {session.engagement_score}</Badge>
                                  )}
                                  {session.session_tags?.map(tag => {
                                    const tagLabels = {
                                      'bounced': 'Odrazený',
                                      'odrazeny': 'Odrazený',
                                      'engaged': 'Zaujatý',
                                      'zaujaty': 'Zaujatý',
                                      'highly_engaged': 'Veľmi zaujatý',
                                      'velmi_zaujaty': 'Veľmi zaujatý',
                                      'explorer': 'Prieskumník',
                                      'prieskumnik': 'Prieskumník',
                                      'converted': 'Konvertoval',
                                      'konvertoval': 'Konvertoval',
                                      'configurator_user': 'Používateľ konfiguratora',
                                      'pouzivatel_konfiguratora': 'Používateľ konfiguratora',
                                      'vracajuci_sa': '🔄 Vracajúci sa'
                                    };
                                    return (
                                      <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                                        {tagLabels[tag] || tag}
                                      </Badge>
                                    );
                                  })}
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-800 font-semibold">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-600" />
                                    {safeFormat(session.start_time, 'dd.MM.yyyy HH:mm', { locale: sk })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-slate-600" />
                                    {formatDuration(session.duration_seconds)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-slate-600" />
                                    {session.pages_visited?.length || 0} strán
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MousePointer className="w-3 h-3 text-slate-600" />
                                    {session.clicks?.length || 0} kliknutí
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getDeviceIcon(session.device_info?.device_type)}
                                    {session.device_info?.device_type || 'unknown'}
                                  </div>
                                  {session.errors_encountered?.length > 0 && (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <AlertTriangle className="w-3 h-3" />
                                      {session.errors_encountered.length} chýb
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Button variant="ghost" size="sm">
                                {expandedSession === session.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Session Details */}
                          {expandedSession === session.id && (
                            <div className="p-4 border-t space-y-4 bg-gray-100 text-gray-900">
                    {/* Device & Tech Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Zariadenie & Technické info
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Zariadenie</p>
                          <div className="flex items-center gap-2 text-slate-900">
                            {getDeviceIcon(session.device_info?.device_type)}
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.device_type || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Prehliadač</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.browser} {session.device_info?.browser_version}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Operačný systém</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.os} {session.device_info?.os_version}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Rozlíšenie</p>
                          <p className="text-sm font-bold text-slate-950">
                            {session.device_info?.screen_width}x{session.device_info?.screen_height}
                          </p>
                          <p className="text-xs text-slate-600 font-semibold">
                            Viewport: {session.device_info?.viewport_width}x{session.device_info?.viewport_height}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Časové pásmo</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.timezone || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Jazyk prehliadača</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.language || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Touch</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.is_touch ? '✅ Áno' : '❌ Nie'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Online status</p>
                          <p className="text-sm font-bold text-slate-950">{session.device_info?.online ? '🟢 Online' : '🔴 Offline'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {session.location_info && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-900" />
                          Geografická lokácia (z IP adresy)
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-800">
                          <div>
                            <span className="text-slate-600 font-medium">IP:</span> <span className="font-semibold text-slate-900">{session.location_info.ip}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 font-medium">Krajina:</span> <span className="font-semibold text-slate-900">{session.location_info.country} ({session.location_info.country_code})</span>
                          </div>
                          <div>
                            <span className="text-slate-600 font-medium">Región:</span> <span className="font-semibold text-slate-900">{session.location_info.region}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 font-medium">Mesto:</span> <span className="font-semibold text-slate-900">{session.location_info.city}</span>
                          </div>
                          {session.location_info.latitude && (
                            <div className="col-span-2">
                              <span className="text-slate-600 font-medium">Súradnice:</span> <span className="font-semibold text-slate-900">{session.location_info.latitude.toFixed(4)}, {session.location_info.longitude.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* UTM & Referrer */}
                    <div className="grid lg:grid-cols-2 gap-4">
                      {session.referrer && session.referrer !== 'direct' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-slate-800">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-900" />
                            Referrer (odkiaľ prišiel)
                          </h4>
                          <p className="text-xs text-blue-900 font-medium break-all mb-1">{session.referrer}</p>
                          <p className="text-xs text-blue-700">Doména: <span className="font-bold text-blue-900">{session.referrer_domain}</span></p>
                        </div>
                      )}
                      
                      {session.utm_params && Object.values(session.utm_params).some(v => v) && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-slate-800">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-900" />
                            UTM Kampaň
                          </h4>
                          <div className="space-y-1 text-xs">
                            {session.utm_params.utm_source && (
                              <div><span className="text-purple-700 font-medium">Source:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_source}</span></div>
                            )}
                            {session.utm_params.utm_medium && (
                              <div><span className="text-purple-700 font-medium">Medium:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_medium}</span></div>
                            )}
                            {session.utm_params.utm_campaign && (
                              <div><span className="text-purple-700 font-medium">Campaign:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_campaign}</span></div>
                            )}
                            {session.utm_params.utm_term && (
                              <div><span className="text-purple-700 font-medium">Term:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_term}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Path */}
                    {session.pages_visited && session.pages_visited.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-gray-900" />
                          Navigačná cesta ({session.pages_visited.length} strán)
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {session.pages_visited.map((page, idx) => (
                            <div key={idx} className="bg-white border-l-4 border-blue-500 p-3 rounded shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">#{idx + 1}</Badge>
                                    <p className="text-sm font-semibold text-gray-900">{page.page_name_sk || page.page_title || page.page_url}</p>
                                  </div>
                                  <p className="text-xs text-slate-600 mb-2 font-medium">{page.page_url}</p>
                                  <div className="flex items-center gap-4 text-xs text-slate-800 font-medium">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-600" />
                                      {formatDuration(page.time_spent_seconds)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Layers className="w-3 h-3 text-slate-600" />
                                      Scroll: {page.scroll_depth_percentage || 0}%
                                    </div>
                                    {page.exit_type && (
                                      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-slate-700 border-slate-300 bg-slate-50">
                                        {page.exit_type === 'bounce' && '⚡ Bounce'}
                                        {page.exit_type === 'shallow' && '📄 Shallow'}
                                        {page.exit_type === 'deep_scroll' && '📜 Deep'}
                                        {page.exit_type === 'navigation' && '➡️ Nav'}
                                        {page.exit_type === 'exit' && '🚪 Exit'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right text-xs text-slate-500 font-medium">
                                  {safeFormat(page.timestamp, 'HH:mm:ss')}
                                  </div>
                                  </div>
                                  </div>
                                  ))}
                                  </div>
                                  </div>
                                  )}

                                  {/* Clicks Timeline */}
                                  {session.clicks && session.clicks.length > 0 && (
                                  <div>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <MousePointer className="w-4 h-4 text-gray-900" />
                                  Kliknutia ({session.clicks.length})
                                  </h4>
                                  <div className="space-y-1 max-h-64 overflow-y-auto bg-white p-3 rounded-lg border">
                                  {session.clicks.map((click, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs hover:bg-gray-50 p-2 rounded">
                                  <div className="flex items-center gap-2 flex-1">
                                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-slate-850 border-slate-300 bg-slate-50">{click.element}</div>
                                  <span className="text-slate-900 font-bold truncate max-w-md">{click.text}</span>
                                  {click.page_name_sk && (
                                  <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-green-100 text-green-900 text-xs font-semibold">📍 {click.page_name_sk}</div>
                                  )}
                                  {click.element_id && (
                                  <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-semibold">#{click.element_id}</div>
                                  )}
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-700 font-semibold">
                                  <span>poz: {click.x_position}, {click.y_position}</span>
                                  <span>{safeFormat(click.timestamp, 'HH:mm:ss')}</span>
                                  </div>
                                  </div>
                                  ))}
                                  </div>
                                  </div>
                                  )}

                    {/* Scroll Behavior */}
                    <div className="grid lg:grid-cols-2 gap-4">
                      {session.scroll_depth?.max_percentage !== undefined && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-slate-800">
                          <h4 className="font-semibold text-green-900 mb-3">📜 Scroll správanie</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-700 font-medium">Max. hĺbka</span>
                                <span className="text-sm font-bold text-green-900">{session.scroll_depth.max_percentage}%</span>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-green-600 h-3 rounded-full transition-all"
                                  style={{ width: `${session.scroll_depth.max_percentage}%` }}
                                />
                              </div>
                            </div>
                            {session.scroll_events && session.scroll_events.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-slate-700 font-medium mb-1">Míľniky:</p>
                                <div className="flex gap-1 flex-wrap">
                                  {session.scroll_events.map((evt, i) => (
                                    <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                                      {evt.percentage}%
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mouse Activity */}
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-slate-800">
                        <h4 className="font-semibold text-orange-900 mb-3">🖱️ Aktivita myši</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-700 font-medium">Celkom pohybov:</span>
                            <span className="font-bold text-slate-900">{session.mouse_movements || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700 font-medium">Heatmap bodov:</span>
                            <span className="font-bold text-slate-900">{session.mouse_heatmap_data?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configurator Interactions */}
                    {session.configurator_interactions && session.configurator_interactions.length > 0 && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 text-slate-800">
                        <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-900" />
                          Konfigurátor ({session.configurator_interactions.length} akcií)
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {session.configurator_interactions.map((interaction, idx) => (
                            <div key={idx} className="bg-white p-2 rounded text-xs flex items-center justify-between border border-indigo-100">
                              <div className="text-slate-900">
                                <span className="font-bold text-slate-950">{interaction.dom_nazov}</span>
                                <span className="text-slate-500 mx-2">→</span>
                                <span className="text-indigo-900 font-semibold">{interaction.action}</span>
                                {interaction.option_selected && (
                                  <span className="text-slate-700 font-medium"> ({interaction.option_selected})</span>
                                )}
                              </div>
                              {interaction.price_at_time && (
                                <div className="inline-flex items-center rounded px-2 py-0.5 bg-green-100 text-green-950 text-xs font-bold">
                                  {interaction.price_at_time.toLocaleString('sk-SK')} €
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOM Interactions */}
                    {session.dom_interactions && session.dom_interactions.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-slate-800">
                        <h4 className="font-semibold text-blue-900 mb-3">🏠 Prezerané domy</h4>
                        <div className="space-y-2">
                          {session.dom_interactions.map((interaction, idx) => (
                            <div key={idx} className="bg-white p-2 rounded text-xs flex items-center justify-between border border-blue-100">
                              <div className="text-slate-900">
                                <span className="font-bold text-slate-950">{interaction.dom_nazov}</span>
                                <div className="ml-2 inline-flex items-center rounded px-2 py-0.5 bg-blue-100 text-blue-950 font-bold">{interaction.action}</div>
                              </div>
                              {interaction.duration_seconds > 0 && (
                                <span className="text-slate-700 font-semibold">{formatDuration(interaction.duration_seconds)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form Interactions */}
                    {session.form_interactions && session.form_interactions.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-slate-800">
                        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-yellow-900" />
                          Formuláre ({session.form_interactions.length} interakcií)
                        </h4>
                        <div className="space-y-2">
                          {session.form_interactions.map((form, idx) => (
                            <div key={idx} className="bg-white p-2 rounded text-xs border border-yellow-100">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-950">{form.form_id}</span>
                                  <div className={`inline-flex items-center rounded px-2 py-0.5 font-bold ${form.completed ? "bg-green-100 text-green-950" : "bg-slate-100 text-slate-900"}`}>
                                    {form.action}
                                  </div>
                                </div>
                                <span className="text-slate-600 font-medium">{safeFormat(form.timestamp, 'HH:mm:ss')}</span>
                              </div>
                              {form.fields_touched && form.fields_touched.length > 0 && (
                                <p className="text-slate-700 font-medium mt-1">Polia: {form.fields_touched.join(', ')}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Language Changes */}
                    {session.language_changes && session.language_changes.length > 0 && (
                      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 text-slate-800">
                        <h4 className="font-semibold text-teal-900 mb-2">🌍 Zmeny jazyka</h4>
                        <div className="space-y-1">
                          {session.language_changes.map((change, idx) => (
                            <div key={idx} className="text-xs flex items-center gap-2">
                              <div className="inline-flex items-center rounded px-2 py-0.5 bg-teal-100 text-teal-950 font-bold">{change.from}</div>
                              <span className="text-slate-600 font-bold">→</span>
                              <div className="inline-flex items-center rounded px-2 py-0.5 bg-teal-100 text-teal-950 font-bold">{change.to}</div>
                              <span className="text-slate-600 font-medium">{safeFormat(change.timestamp, 'HH:mm:ss')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {session.errors_encountered && session.errors_encountered.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-slate-800">
                        <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-900" />
                          JavaScript Chyby ({session.errors_encountered.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {session.errors_encountered.map((error, idx) => (
                            <div key={idx} className="bg-white p-2 rounded text-xs border border-red-100">
                              <p className="font-bold text-red-950 mb-1">{error.error_message}</p>
                              <p className="text-slate-700 font-semibold">{error.page_url}</p>
                              {error.error_stack && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-red-750 font-bold">Stack trace</summary>
                                  <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded mt-1 overflow-auto">
                                    {error.error_stack}
                                  </pre>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                              {/* Raw Session Data */}
                              <details className="bg-gray-900 p-4 rounded-lg">
                                <summary className="cursor-pointer text-sm font-semibold text-green-400 mb-2">
                                  🔍 Kompletné Session Data (JSON)
                                </summary>
                                <pre className="text-xs overflow-auto max-h-96 text-green-400">
                                  {JSON.stringify(session, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
            )
          ) : (
            filteredSessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Žiadne sessions nenájdené</p>
              </Card>
            ) : (
              filteredSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{session.user_name || session.user_email || 'Anonymous'}</h3>
                          {session.is_active && (
                            <Badge className="bg-green-600 text-white text-xs animate-pulse">🟢 Online teraz</Badge>
                          )}
                          {session.engagement_score > 70 && (
                            <Badge className="bg-purple-600 text-white text-xs">🔥 {session.engagement_score}</Badge>
                          )}
                          {session.session_tags?.map(tag => {
                            const tagLabels = {
                              'bounced': 'Odrazený',
                              'odrazeny': 'Odrazený',
                              'engaged': 'Zaujatý',
                              'zaujaty': 'Zaujatý',
                              'highly_engaged': 'Veľmi zaujatý',
                              'velmi_zaujaty': 'Veľmi zaujatý',
                              'explorer': 'Prieskumník',
                              'prieskumnik': 'Prieskumník',
                              'converted': 'Konvertoval',
                              'konvertoval': 'Konvertoval',
                              'configurator_user': 'Používateľ konfiguratora',
                              'pouzivatel_konfiguratora': 'Používateľ konfiguratora',
                              'vracajuci_sa': '🔄 Vracajúci sa'
                            };
                            return (
                              <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                                {tagLabels[tag] || tag}
                              </Badge>
                            );
                          })}
                        </div>
                        
                        {session.user_email && <p className="text-sm text-slate-800 font-semibold mb-2">{session.user_email}</p>}
                        {session.location_info?.ip && (
                          <p className="text-sm text-slate-800 font-semibold mb-2 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-600" />
                            IP: {session.location_info.ip}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-slate-800 font-bold">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {safeFormat(session.start_time, 'dd.MM.yyyy HH:mm', { locale: sk })}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-slate-600" />
                            {formatDuration(session.duration_seconds)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-600" />
                            {session.pages_visited?.length || 0} strán
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="w-3 h-3 text-slate-600" />
                            {session.clicks?.length || 0} kliknutí
                          </div>
                          {session.device_info?.device_type && (
                            <div className="flex items-center gap-1">
                              {getDeviceIcon(session.device_info.device_type)}
                              {session.device_info.device_type}
                            </div>
                          )}
                          {session.location_info?.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location_info.city}, {session.location_info.country_code}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        {expandedSession === session.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedSession === session.id && (
                    <div className="p-4 border-t space-y-4 bg-gray-100 text-gray-900">
                      {/* Device & Tech Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Zariadenie & Technické info
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Zariadenie</p>
                            <div className="flex items-center gap-2 text-slate-900">
                              {getDeviceIcon(session.device_info?.device_type)}
                              <p className="text-sm font-bold text-slate-950">{session.device_info?.device_type || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Prehliadač</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.browser} {session.device_info?.browser_version}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Operačný systém</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.os} {session.device_info?.os_version}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Rozlíšenie</p>
                            <p className="text-sm font-bold text-slate-950">
                              {session.device_info?.screen_width}x{session.device_info?.screen_height}
                            </p>
                            <p className="text-xs text-slate-600 font-semibold">
                              Viewport: {session.device_info?.viewport_width}x{session.device_info?.viewport_height}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Časové pásmo</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.timezone || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Jazyk prehliadača</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.language || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Touch</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.is_touch ? '✅ Áno' : '❌ Nie'}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Online status</p>
                            <p className="text-sm font-bold text-slate-950">{session.device_info?.online ? '🟢 Online' : '🔴 Offline'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {session.location_info && (
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-900" />
                            Geografická lokácia (z IP adresy)
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-800">
                            <div>
                              <span className="text-slate-600 font-medium">IP:</span> <span className="font-semibold text-slate-900">{session.location_info.ip}</span>
                            </div>
                            <div>
                              <span className="text-slate-600 font-medium">Krajina:</span> <span className="font-semibold text-slate-900">{session.location_info.country} ({session.location_info.country_code})</span>
                            </div>
                            <div>
                              <span className="text-slate-600 font-medium">Región:</span> <span className="font-semibold text-slate-900">{session.location_info.region}</span>
                            </div>
                            <div>
                              <span className="text-slate-600 font-medium">Mesto:</span> <span className="font-semibold text-slate-900">{session.location_info.city}</span>
                            </div>
                            {session.location_info.latitude && (
                              <div className="col-span-2">
                                <span className="text-slate-600 font-medium">Súradnice:</span> <span className="font-semibold text-slate-900">{session.location_info.latitude.toFixed(4)}, {session.location_info.longitude.toFixed(4)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* UTM & Referrer */}
                      <div className="grid lg:grid-cols-2 gap-4">
                        {session.referrer && session.referrer !== 'direct' && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-slate-800">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Navigation className="w-4 h-4 text-blue-900" />
                              Referrer (odkiaľ prišiel)
                            </h4>
                            <p className="text-xs text-blue-900 font-medium break-all mb-1">{session.referrer}</p>
                            <p className="text-xs text-blue-700">Doména: <span className="font-bold text-blue-900">{session.referrer_domain}</span></p>
                          </div>
                        )}
                        
                        {session.utm_params && Object.values(session.utm_params).some(v => v) && (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-slate-800">
                            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-purple-900" />
                              UTM Kampaň
                            </h4>
                            <div className="space-y-1 text-xs">
                              {session.utm_params.utm_source && (
                                <div><span className="text-purple-700 font-medium">Source:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_source}</span></div>
                              )}
                              {session.utm_params.utm_medium && (
                                <div><span className="text-purple-700 font-medium">Medium:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_medium}</span></div>
                              )}
                              {session.utm_params.utm_campaign && (
                                <div><span className="text-purple-700 font-medium">Campaign:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_campaign}</span></div>
                              )}
                              {session.utm_params.utm_term && (
                                <div><span className="text-purple-700 font-medium">Term:</span> <span className="font-bold text-purple-900">{session.utm_params.utm_term}</span></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation Path */}
                      {session.pages_visited && session.pages_visited.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-gray-900" />
                            Navigačná cesta ({session.pages_visited.length} strán)
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {session.pages_visited.map((page, idx) => (
                              <div key={idx} className="bg-white border-l-4 border-blue-500 p-3 rounded shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">#{idx + 1}</Badge>
                                      <p className="text-sm font-semibold text-gray-900">{page.page_name_sk || page.page_title || page.page_url}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-2 font-medium">{page.page_url}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-800 font-medium">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-600" />
                                        {formatDuration(page.time_spent_seconds)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-slate-600" />
                                        Scroll: {page.scroll_depth_percentage || 0}%
                                      </div>
                                      {page.exit_type && (
                                        <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-slate-700 border-slate-300 bg-slate-50">
                                          {page.exit_type === 'bounce' && '⚡ Bounce'}
                                          {page.exit_type === 'shallow' && '📄 Shallow'}
                                          {page.exit_type === 'deep_scroll' && '📜 Deep'}
                                          {page.exit_type === 'navigation' && '➡️ Nav'}
                                          {page.exit_type === 'exit' && '🚪 Exit'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-slate-500 font-medium">
                                    {safeFormat(page.timestamp, 'HH:mm:ss')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clicks Timeline */}
                      {session.clicks && session.clicks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MousePointer className="w-4 h-4 text-gray-900" />
                            Kliknutia ({session.clicks.length})
                          </h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto bg-white p-3 rounded-lg border">
                            {session.clicks.map((click, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs hover:bg-gray-50 p-2 rounded">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-slate-855 border-slate-300 bg-slate-50">{click.element}</div>
                                  <span className="text-slate-900 font-bold truncate max-w-md">{click.text}</span>
                                  {click.page_name_sk && (
                                    <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-green-100 text-green-900 text-xs font-semibold">📍 {click.page_name_sk}</div>
                                  )}
                                  {click.element_id && (
                                    <div className="inline-flex items-center rounded-md px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-semibold">#{click.element_id}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-slate-700 font-semibold">
                                  <span>poz: {click.x_position}, {click.y_position}</span>
                                  <span>{safeFormat(click.timestamp, 'HH:mm:ss')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scroll Behavior */}
                      <div className="grid lg:grid-cols-2 gap-4">
                        {session.scroll_depth?.max_percentage !== undefined && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-slate-800">
                            <h4 className="font-semibold text-green-900 mb-3">📜 Scroll správanie</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-700 font-medium">Max. hĺbka</span>
                                  <span className="text-sm font-bold text-green-900">{session.scroll_depth.max_percentage}%</span>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-green-600 h-3 rounded-full transition-all"
                                    style={{ width: `${session.scroll_depth.max_percentage}%` }}
                                  />
                                </div>
                              </div>
                              {session.scroll_events && session.scroll_events.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-slate-700 font-medium mb-1">Míľniky:</p>
                                  <div className="flex gap-1 flex-wrap">
                                    {session.scroll_events.map((evt, i) => (
                                      <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                                        {evt.percentage}%
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mouse Activity */}
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-slate-800">
                          <h4 className="font-semibold text-orange-900 mb-3">🖱️ Aktivita myši</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-700 font-medium">Celkom pohybov:</span>
                              <span className="font-bold text-slate-900">{session.mouse_movements || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-700 font-medium">Heatmap bodov:</span>
                              <span className="font-bold text-slate-900">{session.mouse_heatmap_data?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configurator Interactions */}
                      {session.configurator_interactions && session.configurator_interactions.length > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 text-slate-800">
                          <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-900" />
                            Konfigurátor ({session.configurator_interactions.length} akcií)
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {session.configurator_interactions.map((interaction, idx) => (
                              <div key={idx} className="bg-white p-2 rounded text-xs flex items-center justify-between border border-indigo-100">
                                <div className="text-slate-900">
                                  <span className="font-bold text-slate-950">{interaction.dom_nazov}</span>
                                  <span className="text-slate-500 mx-2">→</span>
                                  <span className="text-indigo-900 font-semibold">{interaction.action}</span>
                                  {interaction.option_selected && (
                                    <span className="text-slate-700 font-medium"> ({interaction.option_selected})</span>
                                  )}
                                </div>
                                {interaction.price_at_time && (
                                  <div className="inline-flex items-center rounded px-2 py-0.5 bg-green-100 text-green-950 text-xs font-bold">
                                    {interaction.price_at_time.toLocaleString('sk-SK')} €
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DOM Interactions */}
                      {session.dom_interactions && session.dom_interactions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-slate-800">
                          <h4 className="font-semibold text-blue-900 mb-3">🏠 Prezerané domy</h4>
                          <div className="space-y-2">
                            {session.dom_interactions.map((interaction, idx) => (
                              <div key={idx} className="bg-white p-2 rounded text-xs flex items-center justify-between border border-blue-100">
                                <div className="text-slate-900">
                                  <span className="font-bold text-slate-950">{interaction.dom_nazov}</span>
                                  <div className="ml-2 inline-flex items-center rounded px-2 py-0.5 bg-blue-100 text-blue-950 font-bold">{interaction.action}</div>
                                </div>
                                {interaction.duration_seconds > 0 && (
                                  <span className="text-slate-700 font-semibold">{formatDuration(interaction.duration_seconds)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Form Interactions */}
                      {session.form_interactions && session.form_interactions.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-slate-800">
                          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-900" />
                            Formuláre ({session.form_interactions.length} interakcií)
                          </h4>
                          <div className="space-y-2">
                            {session.form_interactions.map((form, idx) => (
                              <div key={idx} className="bg-white p-2 rounded text-xs border border-yellow-100">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-950">{form.form_id}</span>
                                    <div className={`inline-flex items-center rounded px-2 py-0.5 font-bold ${form.completed ? "bg-green-100 text-green-950" : "bg-slate-100 text-slate-900"}`}>
                                      {form.action}
                                    </div>
                                  </div>
                                  <span className="text-slate-600 font-medium">{safeFormat(form.timestamp, 'HH:mm:ss')}</span>
                                </div>
                                {form.fields_touched && form.fields_touched.length > 0 && (
                                  <p className="text-slate-700 font-medium mt-1">Polia: {form.fields_touched.join(', ')}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Language Changes */}
                      {session.language_changes && session.language_changes.length > 0 && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 text-slate-800">
                          <h4 className="font-semibold text-teal-900 mb-2">🌍 Zmeny jazyka</h4>
                          <div className="space-y-1">
                            {session.language_changes.map((change, idx) => (
                              <div key={idx} className="text-xs flex items-center gap-2">
                                <div className="inline-flex items-center rounded px-2 py-0.5 bg-teal-100 text-teal-950 font-bold">{change.from}</div>
                                <span className="text-slate-600 font-bold">→</span>
                                <div className="inline-flex items-center rounded px-2 py-0.5 bg-teal-100 text-teal-950 font-bold">{change.to}</div>
                                <span className="text-slate-600 font-medium">{safeFormat(change.timestamp, 'HH:mm:ss')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Errors */}
                      {session.errors_encountered && session.errors_encountered.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-slate-800">
                          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-900" />
                            JavaScript Chyby ({session.errors_encountered.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {session.errors_encountered.map((error, idx) => (
                              <div key={idx} className="bg-white p-2 rounded text-xs border border-red-100">
                                <p className="font-bold text-red-950 mb-1">{error.error_message}</p>
                                <p className="text-slate-700 font-semibold">{error.page_url}</p>
                                {error.error_stack && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-red-750 font-bold">Stack trace</summary>
                                    <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded mt-1 overflow-auto">
                                      {error.error_stack}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Session Data */}
                      <details className="bg-gray-900 p-4 rounded-lg">
                        <summary className="cursor-pointer text-sm font-semibold text-green-400 mb-2">
                          🔍 Kompletné Session Data (JSON)
                        </summary>
                        <pre className="text-xs overflow-auto max-h-96 text-green-400">
                          {JSON.stringify(session, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </Card>
              ))
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
      </div>
    </div>
  );
}