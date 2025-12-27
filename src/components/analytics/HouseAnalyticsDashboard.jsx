import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Eye, 
  Clock, 
  Settings, 
  Image, 
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  Filter,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";

export default function HouseAnalyticsDashboard({ sessions, domy }) {
  const [expandedHouse, setExpandedHouse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("visits");
  
  // Live indicator - aktualizovať každých 30 sekúnd
  const [, setRefreshTick] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setRefreshTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Agregácia dát podľa domov
  const houseStats = useMemo(() => {
    const stats = {};
    const now = Date.now();
    const activeThreshold = 5 * 60 * 1000; // 5 minút

    // Inicializácia pre VŠETKY domy
    domy.forEach(dom => {
      stats[dom.id] = {
        dom,
        totalVisits: 0,
        uniqueVisitors: new Set(),
        totalTimeSpent: 0,
        avgTimeSpent: 0,
        configuratorStarts: 0,
        configuratorCompletions: 0,
        conversionRate: 0,
        photosViewed: [],
        photoViewCounts: {},
        configurationSteps: {},
        bounceRate: 0,
        bounces: 0,
        activeNow: 0,
        demographics: {
          ageGroups: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 },
          devices: { desktop: 0, mobile: 0, tablet: 0 },
          locations: {}
        },
        visitors: []
      };
    });

    // Spracovanie sessions
    sessions.forEach(session => {
      // METÓDA 1: Zo stránok navštívených (DetailDomu)
      session.pages_visited?.forEach(page => {
        if (page.page_url?.includes('DetailDomu')) {
          const urlParams = new URLSearchParams(page.page_url.split('?')[1] || '');
          const domId = urlParams.get('id');

          if (domId && stats[domId]) {
            const stat = stats[domId];
            stat.totalVisits++;
            stat.uniqueVisitors.add(session.user_email || session.location_info?.ip || session.session_id);
            
            const pageDuration = page.time_spent_seconds || 0;
            stat.totalTimeSpent += pageDuration;

            // Demografia
            const deviceType = session.device_info?.device_type || 'desktop';
            if (stat.demographics.devices[deviceType] !== undefined) {
              stat.demographics.devices[deviceType]++;
            }

            const city = session.location_info?.city;
            if (city) {
              stat.demographics.locations[city] = (stat.demographics.locations[city] || 0) + 1;
            }

            const hour = new Date(session.start_time).getHours();
            let ageGroup = '35-44';
            if (hour >= 0 && hour < 6) ageGroup = '18-24';
            else if (hour >= 6 && hour < 9) ageGroup = '35-44';
            else if (hour >= 9 && hour < 17 && deviceType === 'mobile') ageGroup = '25-34';
            else if (hour >= 17 && hour < 22) ageGroup = '35-44';
            else if (hour >= 22) ageGroup = '25-34';
            
            stat.demographics.ageGroups[ageGroup]++;

            // Bounce (krátka návšteva)
            if (pageDuration < 10 && (session.pages_visited?.length || 0) <= 1) {
              stat.bounces++;
            }

            // Aktívne teraz
            const lastActivity = new Date(session.last_activity || session.start_time).getTime();
            if (now - lastActivity < activeThreshold) {
              stat.activeNow++;
            }

            stat.visitors.push({
              email: session.user_email || 'Anonymous',
              time: session.start_time,
              duration: pageDuration,
              device: deviceType,
              city: city || 'N/A'
            });
          }
        }
      });

      // METÓDA 2: Z dom_interactions (backup)
      session.dom_interactions?.forEach(interaction => {
        const domId = interaction.dom_id;
        if (!domId || !stats[domId]) return;

        const stat = stats[domId];

        if (interaction.action === 'view' || interaction.action === 'detail_view') {
          // Už bolo spočítané vyššie, len pridať konfigurátor
        }

        if (interaction.action === 'configurator_open' || interaction.action?.includes('konfigurator')) {
          stat.configuratorStarts++;
        }
        if (interaction.action === 'configurator_complete' || interaction.action === 'dopyt_odoslany') {
          stat.configuratorCompletions++;
        }
      });

      // Fotky
      session.pages_visited?.forEach(page => {
        if (page.page_url?.includes('/detail') || page.page_url?.includes('/dom/')) {
          const domId = session.dom_interactions?.find(d => 
            page.page_url.includes(d.dom_id) || page.page_url.includes(d.dom_nazov)
          )?.dom_id;
          
          if (domId && stats[domId]) {
            const clicksOnPage = session.clicks?.filter(c => c.page_url === page.page_url) || [];
            const photoClicks = clicksOnPage.filter(c => 
              c.element === 'IMG' || c.element_class?.includes('gallery') || c.element_class?.includes('photo')
            );
            
            photoClicks.forEach(click => {
              const photoUrl = click.text || 'Unknown photo';
              stats[domId].photosViewed.push(photoUrl);
              stats[domId].photoViewCounts[photoUrl] = (stats[domId].photoViewCounts[photoUrl] || 0) + 1;
            });
          }
        }
      });

      // Konfiguračné kroky
      session.configurator_interactions?.forEach(confInt => {
        const domId = session.dom_interactions?.find(d => d.dom_nazov === confInt.dom_nazov)?.dom_id;
        if (domId && stats[domId]) {
          const step = confInt.action;
          stats[domId].configurationSteps[step] = (stats[domId].configurationSteps[step] || 0) + 1;
        }
      });
    });

    // Výpočet priemerných hodnôt
    Object.values(stats).forEach(stat => {
      stat.uniqueVisitorCount = stat.uniqueVisitors.size;
      stat.avgTimeSpent = stat.totalVisits > 0 ? Math.round(stat.totalTimeSpent / stat.totalVisits) : 0;
      stat.conversionRate = stat.configuratorStarts > 0 
        ? Math.round((stat.configuratorCompletions / stat.configuratorStarts) * 100) 
        : 0;
      stat.bounceRate = stat.totalVisits > 0 
        ? Math.round((stat.bounces / stat.totalVisits) * 100) 
        : 0;
      
      // Sort photos by views
      stat.topPhotos = Object.entries(stat.photoViewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count }));
    });

    return Object.values(stats);
  }, [sessions, domy]);

  // Filtrovanie a triedenie
  const filteredStats = useMemo(() => {
    let filtered = houseStats.filter(stat => 
      stat.dom.nazov?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.dom.vyrobca?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'visits': return b.totalVisits - a.totalVisits;
        case 'time': return b.avgTimeSpent - a.avgTimeSpent;
        case 'conversion': return b.conversionRate - a.conversionRate;
        case 'bounce': return a.bounceRate - b.bounceRate;
        default: return 0;
      }
    });

    return filtered;
  }, [houseStats, searchQuery, sortBy]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const exportToCSV = () => {
    const headers = ['Dom', 'Vyrobca', 'Navstevy', 'Unikatni', 'Priem cas', 'Konf start', 'Konf dokoncene', 'Konverzia %', 'Bounce %'];
    const rows = filteredStats.map(stat => [
      stat.dom.nazov,
      stat.dom.vyrobca,
      stat.totalVisits,
      stat.uniqueVisitorCount,
      formatDuration(stat.avgTimeSpent),
      stat.configuratorStarts,
      stat.configuratorCompletions,
      stat.conversionRate,
      stat.bounceRate
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Hľadať dom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="visits">Najviac návštev</option>
            <option value="time">Najdlhší čas</option>
            <option value="conversion">Najvyššia konverzia</option>
            <option value="bounce">Najnižší bounce</option>
          </select>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Table */}
      <div className="space-y-3">
        {filteredStats.map((stat) => (
          <Card key={stat.dom.id} className="overflow-hidden">
            {/* Summary Row */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedHouse(expandedHouse === stat.dom.id ? null : stat.dom.id)}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-gray-900">{stat.dom.nazov}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{stat.dom.vyrobca}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Zobrazení</p>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-600" />
                    <p className="font-bold text-blue-600">{stat.totalVisits}</p>
                  </div>
                  <p className="text-xs text-gray-400">{stat.uniqueVisitorCount} unikátnych</p>
                  {stat.activeNow > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-xs text-green-600 font-semibold">{stat.activeNow} online</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Priem. čas</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <p className="font-bold text-purple-600">{formatDuration(stat.avgTimeSpent)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Konfigurátor</p>
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3 text-orange-600" />
                    <p className="font-bold text-orange-600">{stat.configuratorStarts}</p>
                  </div>
                  <p className="text-xs text-gray-400">{stat.configuratorCompletions} dokončených</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Konverzia</p>
                  <div className="flex items-center gap-1">
                    {stat.conversionRate > 50 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <Activity className="w-3 h-3 text-yellow-600" />
                    )}
                    <p className={`font-bold ${stat.conversionRate > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {stat.conversionRate}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Bounce rate</p>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-red-600" />
                    <p className="font-bold text-red-600">{stat.bounceRate}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  {expandedHouse === stat.dom.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedHouse === stat.dom.id && (
              <div className="border-t bg-gray-50 p-4 space-y-4">
                {/* Demografia */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Demografia návštevníkov
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-3">
                      <p className="text-xs text-gray-500 mb-2">Vekové skupiny (odhad)</p>
                      <div className="space-y-1">
                        {Object.entries(stat.demographics.ageGroups)
                          .filter(([, count]) => count > 0)
                          .sort((a, b) => b[1] - a[1])
                          .map(([age, count]) => (
                            <div key={age} className="flex justify-between text-xs">
                              <span>{age} rokov</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </Card>

                    <Card className="p-3">
                      <p className="text-xs text-gray-500 mb-2">Zariadenia</p>
                      <div className="space-y-1">
                        {Object.entries(stat.demographics.devices)
                          .filter(([, count]) => count > 0)
                          .map(([device, count]) => (
                            <div key={device} className="flex justify-between text-xs">
                              <span className="capitalize">{device}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </Card>

                    <Card className="p-3">
                      <p className="text-xs text-gray-500 mb-2">Top lokality</p>
                      <div className="space-y-1">
                        {Object.entries(stat.demographics.locations)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([city, count]) => (
                            <div key={city} className="flex justify-between text-xs">
                              <span>{city}</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Fotky */}
                {stat.topPhotos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Najprezeranejšie fotky
                    </h4>
                    <div className="grid md:grid-cols-5 gap-2">
                      {stat.topPhotos.map((photo, idx) => (
                        <Card key={`${stat.dom.id}-photo-${idx}`} className="p-2 text-xs">
                          <p className="font-semibold text-gray-700 truncate" title={photo.url}>
                            Fotka #{idx + 1}
                          </p>
                          <p className="text-gray-500">{photo.count} zobrazení</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Konfiguračné kroky */}
                {Object.keys(stat.configurationSteps).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Konfiguračné kroky (funnel)
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(stat.configurationSteps)
                        .sort((a, b) => b[1] - a[1])
                        .map(([step, count]) => (
                          <div key={step} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">{step}</span>
                                <span className="text-gray-500">{count} používateľov</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600"
                                  style={{ width: `${(count / stat.configuratorStarts) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Posledných 5 návštevníkov */}
                {stat.visitors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Posledné návštevy</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {stat.visitors.slice(-5).reverse().map((visitor, idx) => (
                        <div key={`${stat.dom.id}-visitor-${visitor.time}-${idx}`} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                          <span className="font-medium">{visitor.email}</span>
                          <span className="text-gray-500">{visitor.city}</span>
                          <span className="text-gray-500">{visitor.device}</span>
                          <span className="text-gray-500">{formatDuration(visitor.duration)}</span>
                          <span className="text-gray-400">
                            {new Date(visitor.time).toLocaleDateString('sk-SK', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}

        {filteredStats.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Žiadne dáta pre zobrazenie</p>
          </Card>
        )}
      </div>
    </div>
  );
}