import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  Home,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function AnalyticsDashboard({ sessions }) {
  const analytics = useMemo(() => {
    // Najnavštevovanejšie domy
    const domVisits = {};
    const domTimes = {};
    const domConfiguratorUse = {};
    
    sessions.forEach(session => {
      session.dom_interactions?.forEach(interaction => {
        const domId = interaction.dom_id;
        const domNazov = interaction.dom_nazov;
        
        if (!domVisits[domId]) {
          domVisits[domId] = { id: domId, nazov: domNazov, count: 0, totalTime: 0, configuratorOpens: 0 };
        }
        
        domVisits[domId].count++;
        
        if (interaction.duration_seconds) {
          domVisits[domId].totalTime += interaction.duration_seconds;
        }
        
        if (interaction.action === 'configurator_open') {
          domVisits[domId].configuratorOpens++;
        }
      });
    });

    const topDomy = Object.values(domVisits)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(d => ({
        ...d,
        avgTime: d.totalTime / d.count
      }));

    // Najčítanejšie stránky
    const pageVisits = {};
    sessions.forEach(session => {
      session.pages_visited?.forEach(page => {
        if (!pageVisits[page.page_url]) {
          pageVisits[page.page_url] = { 
            url: page.page_url, 
            title: page.page_title, 
            visits: 0, 
            totalTime: 0,
            deepScrolls: 0 
          };
        }
        pageVisits[page.page_url].visits++;
        pageVisits[page.page_url].totalTime += page.time_spent_seconds || 0;
        if (page.scroll_depth_percentage > 75) {
          pageVisits[page.page_url].deepScrolls++;
        }
      });
    });

    const topPages = Object.values(pageVisits)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
      .map(p => ({
        ...p,
        avgTime: p.totalTime / p.visits,
        engagementRate: (p.deepScrolls / p.visits) * 100
      }));

    // Blog analytics
    const blogPages = Object.values(pageVisits)
      .filter(p => p.url.includes('/blog') || p.url.includes('Blog'))
      .sort((a, b) => b.visits - a.visits)
      .map(p => ({
        ...p,
        avgTime: p.totalTime / p.visits
      }));

    // Zdroje návštevníkov
    const trafficSources = {};
    sessions.forEach(session => {
      const source = session.referrer_domain || 'direct';
      if (!trafficSources[source]) {
        trafficSources[source] = { source, count: 0, conversions: 0 };
      }
      trafficSources[source].count++;
      if (session.conversions?.length > 0) {
        trafficSources[source].conversions++;
      }
    });

    const topSources = Object.values(trafficSources)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Zariadenia
    const deviceStats = {
      desktop: sessions.filter(s => s.device_info?.device_type === 'desktop').length,
      mobile: sessions.filter(s => s.device_info?.device_type === 'mobile').length,
      tablet: sessions.filter(s => s.device_info?.device_type === 'tablet').length
    };

    // Krajiny
    const countries = {};
    sessions.forEach(session => {
      const country = session.location_info?.country || 'Neznáma';
      countries[country] = (countries[country] || 0) + 1;
    });

    const topCountries = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Konverzie
    const conversionsByType = {};
    sessions.forEach(session => {
      session.conversions?.forEach(conv => {
        const type = conv.type || 'unknown';
        conversionsByType[type] = (conversionsByType[type] || 0) + 1;
      });
    });

    // Časové rozloženie návštev (hodiny)
    const hourlyVisits = Array(24).fill(0);
    sessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      hourlyVisits[hour]++;
    });

    // Priemerný čas podľa stránok
    const avgTimeByPage = topPages.map(p => ({
      page: p.title || p.url,
      avgTime: Math.round(p.avgTime)
    }));

    // Konfigurátor interakcie
    const configuratorStats = {
      totalInteractions: 0,
      uniqueUsers: new Set(),
      avgInteractionsPerUser: 0,
      completionRate: 0
    };

    sessions.forEach(session => {
      if (session.configurator_interactions?.length > 0) {
        configuratorStats.totalInteractions += session.configurator_interactions.length;
        configuratorStats.uniqueUsers.add(session.user_email);
      }
    });

    configuratorStats.avgInteractionsPerUser = configuratorStats.uniqueUsers.size > 0
      ? configuratorStats.totalInteractions / configuratorStats.uniqueUsers.size
      : 0;

    return {
      topDomy,
      topPages,
      blogPages,
      topSources,
      deviceStats,
      topCountries,
      conversionsByType,
      hourlyVisits,
      avgTimeByPage,
      configuratorStats
    };
  }, [sessions]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Domy */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          🏆 TOP 10 Najnavštevovanejších domov
        </h3>
        <div className="space-y-3">
          {analytics.topDomy.map((dom, idx) => (
            <div key={dom.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white">{idx + 1}</Badge>
                <div>
                  <p className="font-semibold text-gray-900">{dom.nazov}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {dom.count} návštev
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ⌀ {formatDuration(dom.avgTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      {dom.configuratorOpens} konfig.
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{dom.count}</p>
                <p className="text-xs text-gray-500">zobrazení</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Stránky */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          📄 TOP 10 Najnavštevovanejších stránok
        </h3>
        <div className="space-y-3">
          {analytics.topPages.map((page, idx) => (
            <div key={page.url} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border">
              <div className="flex items-center gap-3 flex-1">
                <Badge className="bg-green-600 text-white">{idx + 1}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{page.title || page.url}</p>
                  <p className="text-xs text-gray-500 truncate">{page.url}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ⌀ {formatDuration(page.avgTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {page.engagementRate.toFixed(0)}% angažovanosť
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-green-600">{page.visits}</p>
                <p className="text-xs text-gray-500">návštev</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Blog Analytics */}
      {analytics.blogPages.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            📰 Blog Analytics
          </h3>
          <div className="space-y-2">
            {analytics.blogPages.slice(0, 5).map((blog, idx) => (
              <div key={blog.url} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{blog.title}</p>
                    <p className="text-xs text-gray-500">⌀ {formatDuration(blog.avgTime)} čítania</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-purple-600 ml-4">{blog.visits}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zdroje návštevníkov */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            🌐 Zdroje návštevníkov
          </h3>
          <div className="space-y-2">
            {analytics.topSources.map((source) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{source.source}</p>
                  <p className="text-xs text-gray-500">{source.conversions} konverzií</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">{source.count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Zariadenia */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-600" />
            📱 Rozloženie zariadení
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">💻 Desktop</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all" 
                    style={{ width: `${(analytics.deviceStats.desktop / sessions.length) * 100}%` }}
                  />
                </div>
                <Badge className="bg-teal-100 text-teal-800">{analytics.deviceStats.desktop}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">📱 Mobil</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all" 
                    style={{ width: `${(analytics.deviceStats.mobile / sessions.length) * 100}%` }}
                  />
                </div>
                <Badge className="bg-blue-100 text-blue-800">{analytics.deviceStats.mobile}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">📲 Tablet</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all" 
                    style={{ width: `${(analytics.deviceStats.tablet / sessions.length) * 100}%` }}
                  />
                </div>
                <Badge className="bg-purple-100 text-purple-800">{analytics.deviceStats.tablet}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Top krajiny */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">🌍 TOP 5 Krajín</h3>
          <div className="space-y-2">
            {analytics.topCountries.map((country, idx) => (
              <div key={country.country} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{idx + 1}</Badge>
                  <span className="text-sm font-medium">{country.country}</span>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800">{country.count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Konfigurátor Stats */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-600" />
            ⚙️ Konfigurátor Štatistiky
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Celkové interakcie:</span>
              <span className="text-xl font-bold text-yellow-600">
                {analytics.configuratorStats.totalInteractions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unikátni používatelia:</span>
              <span className="text-xl font-bold text-yellow-600">
                {analytics.configuratorStats.uniqueUsers.size}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">⌀ Interakcie na používateľa:</span>
              <span className="text-xl font-bold text-yellow-600">
                {analytics.configuratorStats.avgInteractionsPerUser.toFixed(1)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Časové rozloženie návštev */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">⏰ Rozloženie návštev počas dňa</h3>
        <div className="flex items-end gap-1 h-48">
          {analytics.hourlyVisits.map((count, hour) => {
            const maxCount = Math.max(...analytics.hourlyVisits);
            const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-semibold text-gray-700">{count}</div>
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                  style={{ height: `${heightPercent}%` }}
                  title={`${hour}:00 - ${count} návštev`}
                />
                <div className="text-xs text-gray-500">{hour}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Konverzie podľa typu */}
      {Object.keys(analytics.conversionsByType).length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <h3 className="text-lg font-bold mb-4">✅ Konverzie podľa typu</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(analytics.conversionsByType).map(([type, count]) => (
              <div key={type} className="p-4 bg-white rounded-lg border text-center">
                <p className="text-2xl font-bold text-green-600">{count}</p>
                <p className="text-xs text-gray-600 mt-1">{type}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}