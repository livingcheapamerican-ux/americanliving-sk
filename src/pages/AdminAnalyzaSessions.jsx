import React, { useState } from "react";
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
  Download,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

export default function AdminAnalyzaSessions() {
  const [filterEmail, setFilterEmail] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [expandedSession, setExpandedSession] = useState(null);
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => base44.entities.UserSession.list('-created_date', 500),
    initialData: [],
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filterEmail && !session.user_email?.toLowerCase().includes(filterEmail.toLowerCase())) return false;
    if (filterDateFrom && new Date(session.start_time) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(session.start_time) > new Date(filterDateTo + 'T23:59:59')) return false;
    if (filterDevice !== "all" && session.device_info?.device_type !== filterDevice) return false;
    return true;
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === "duration_seconds") {
      aVal = a.duration_seconds || 0;
      bVal = b.duration_seconds || 0;
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Stats
  const stats = {
    totalSessions: filteredSessions.length,
    avgDuration: Math.round(filteredSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / filteredSessions.length),
    totalClicks: filteredSessions.reduce((acc, s) => acc + (s.clicks?.length || 0), 0),
    uniqueUsers: new Set(filteredSessions.map(s => s.user_email)).size,
    activeSessions: filteredSessions.filter(s => s.is_active).length
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
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analýza Sessions</h1>
          <p className="text-gray-600">Podrobný prehľad všetkých používateľských relácií</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Celkom sessions</p>
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
                <p className="text-xs text-gray-500">Unikátni užívatelia</p>
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
                <p className="text-xs text-gray-500">Priem. trvanie</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Celkom kliknutí</p>
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
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtre</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Email používateľa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hľadať email..."
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
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Všetky</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobil</option>
                <option value="tablet">Tablet</option>
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
              }}
            >
              Vyčistiť filtre
            </Button>
          </div>
        </Card>

        {/* Sessions List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítavam sessions...</p>
            </Card>
          ) : sortedSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Žiadne sessions nenájdené</p>
            </Card>
          ) : (
            sortedSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                {/* Session Header */}
                <div 
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{session.user_name || 'Anonymous'}</h3>
                        {session.is_active && (
                          <Badge className="bg-green-600 text-white text-xs">Aktívna</Badge>
                        )}
                        {session.is_authenticated && (
                          <Badge className="bg-blue-600 text-white text-xs">Prihlásený</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{session.user_email}</p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.start_time), 'dd.MM.yyyy HH:mm', { locale: sk })}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {formatDuration(session.duration_seconds)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {session.pages_visited?.length || 0} strán
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          {session.clicks?.length || 0} kliknutí
                        </div>
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(session.device_info?.device_type)}
                          {session.device_info?.device_type || 'unknown'}
                        </div>
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

                {/* Expanded Details */}
                {expandedSession === session.id && (
                  <div className="p-4 border-t space-y-4">
                    {/* Device Info */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Zariadenie</p>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_info?.device_type)}
                          <p className="text-sm font-semibold">{session.device_info?.device_type || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Prehliadač</p>
                        <p className="text-sm font-semibold">{session.device_info?.browser || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">OS</p>
                        <p className="text-sm font-semibold">{session.device_info?.os || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Rozlíšenie</p>
                        <p className="text-sm font-semibold">
                          {session.device_info?.screen_width}x{session.device_info?.screen_height}
                        </p>
                      </div>
                    </div>

                    {/* UTM Params */}
                    {session.utm_params && Object.values(session.utm_params).some(v => v) && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-purple-900 mb-2">📈 UTM Parametre</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {session.utm_params.utm_source && (
                            <div><span className="text-gray-600">Source:</span> <span className="font-semibold">{session.utm_params.utm_source}</span></div>
                          )}
                          {session.utm_params.utm_medium && (
                            <div><span className="text-gray-600">Medium:</span> <span className="font-semibold">{session.utm_params.utm_medium}</span></div>
                          )}
                          {session.utm_params.utm_campaign && (
                            <div><span className="text-gray-600">Campaign:</span> <span className="font-semibold">{session.utm_params.utm_campaign}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Referrer */}
                    {session.referrer && session.referrer !== 'direct' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">🔗 Referrer</p>
                        <p className="text-xs text-blue-800 break-all">{session.referrer}</p>
                      </div>
                    )}

                    {/* Pages Visited */}
                    {session.pages_visited && session.pages_visited.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Navštívené stránky ({session.pages_visited.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {session.pages_visited.map((page, idx) => (
                            <div key={idx} className="bg-gray-50 p-2 rounded flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{page.page_title || page.page_url}</p>
                                <p className="text-xs text-gray-500">{page.page_url}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">
                                  {page.time_spent_seconds ? formatDuration(page.time_spent_seconds) : '-'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {format(new Date(page.timestamp), 'HH:mm:ss')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clicks */}
                    {session.clicks && session.clicks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MousePointer className="w-4 h-4" />
                          Kliknutia ({session.clicks.length})
                        </h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {session.clicks.slice(-20).map((click, idx) => (
                            <div key={idx} className="bg-gray-50 p-2 rounded flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{click.element}</Badge>
                                <span className="text-gray-700">{click.text?.substring(0, 40)}</span>
                              </div>
                              <span className="text-gray-400">{format(new Date(click.timestamp), 'HH:mm:ss')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scroll Depth */}
                    {session.scroll_depth?.max_percentage && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-1">📜 Maximálna hĺbka scrollu</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-600 h-3 rounded-full transition-all"
                              style={{ width: `${session.scroll_depth.max_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-green-900">{session.scroll_depth.max_percentage}%</span>
                        </div>
                      </div>
                    )}

                    {/* DOM Interactions */}
                    {session.dom_interactions && session.dom_interactions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">🏠 Interakcie s domami</h4>
                        <div className="space-y-1">
                          {session.dom_interactions.map((interaction, idx) => (
                            <div key={idx} className="bg-blue-50 p-2 rounded text-xs">
                              <span className="font-semibold">{interaction.action}</span>: {interaction.dom_nazov}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw Data */}
                    <details className="bg-gray-100 p-3 rounded-lg">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                        🔍 Raw Session Data
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-64 bg-gray-900 text-green-400 p-3 rounded">
                        {JSON.stringify(session, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}