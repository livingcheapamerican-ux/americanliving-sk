import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Eye, Clock, Search, AlertTriangle, 
  CheckCircle, Download, RefreshCw, BarChart3, Target, Users, MousePointerClick,
  ExternalLink, Megaphone, Activity, PieChart, Calendar, Mail, Phone
} from "lucide-react";
import { motion } from "framer-motion";

export default function SEODashboard() {
  const [selectedPage, setSelectedPage] = useState(null);
  const [dateRange, setDateRange] = useState(7); // last 7 days
  const queryClient = useQueryClient();

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['seo-analytics'],
    queryFn: () => base44.entities.SEOAnalytika.list('-pocet_navstev', 100),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['user-events', dateRange],
    queryFn: async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      const allEvents = await base44.entities.UserEvent.list('-created_date', 10000);
      return allEvents.filter(e => new Date(e.created_date) >= cutoffDate);
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-total_visits', 50),
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ['seo-keywords'],
    queryFn: () => base44.entities.SEOKeyword.list('-search_volume', 50),
  });

  // Calculate user behavior statistics
  const behaviorStats = useMemo(() => {
    const pageViews = events.filter(e => e.event_type === 'page_view');
    const buttonClicks = events.filter(e => e.event_type === 'button_click');
    const downloads = events.filter(e => e.event_type === 'download');
    const formSubmits = events.filter(e => e.event_type === 'form_submit');
    const emailClicks = events.filter(e => e.event_type === 'email_click');
    const phoneClicks = events.filter(e => e.event_type === 'phone_click');

    // Referral sources
    const referrers = {};
    events.forEach(e => {
      if (e.referrer && !e.referrer.includes('americanliving')) {
        const domain = new URL(e.referrer).hostname;
        referrers[domain] = (referrers[domain] || 0) + 1;
      }
    });

    // UTM sources
    const utmSources = {};
    events.forEach(e => {
      if (e.utm_source) {
        const key = `${e.utm_source}${e.utm_medium ? ` / ${e.utm_medium}` : ''}`;
        utmSources[key] = (utmSources[key] || 0) + 1;
      }
    });

    // Device types
    const devices = {};
    events.forEach(e => {
      devices[e.device_type || 'unknown'] = (devices[e.device_type || 'unknown'] || 0) + 1;
    });

    // Top actions
    const actions = {};
    buttonClicks.forEach(e => {
      const text = e.event_data?.button_text || 'Unknown';
      actions[text] = (actions[text] || 0) + 1;
    });

    return {
      totalPageViews: pageViews.length,
      uniqueSessions: new Set(events.map(e => e.session_id)).size,
      totalClicks: buttonClicks.length,
      totalDownloads: downloads.length,
      conversions: formSubmits.length + emailClicks.length + phoneClicks.length,
      conversionRate: pageViews.length > 0 ? ((formSubmits.length + emailClicks.length + phoneClicks.length) / pageViews.length * 100).toFixed(2) : 0,
      referrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 10),
      utmSources: Object.entries(utmSources).sort((a, b) => b[1] - a[1]).slice(0, 10),
      devices: Object.entries(devices).sort((a, b) => b[1] - a[1]),
      topActions: Object.entries(actions).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
  }, [events]);

  // SEO Statistics
  const totalVisits = analytics.reduce((sum, a) => sum + (a.pocet_navstev || 0), 0);
  const avgSEOScore = analytics.length > 0 
    ? Math.round(analytics.reduce((sum, a) => sum + (a.seo_score || 0), 0) / analytics.length)
    : 0;
  const avgBounceRate = analytics.length > 0
    ? Math.round(analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length)
    : 0;
  const totalIssues = analytics.reduce((sum, a) => sum + (a.issues?.length || 0), 0);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">SEO & Analytics Dashboard</h1>
          <p className="text-gray-600">Komplexná analýza SEO a správania návštevníkov</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[7, 14, 30, 90].map(days => (
            <Button
              key={days}
              onClick={() => setDateRange(days)}
              variant={dateRange === days ? "default" : "outline"}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {days} dní
            </Button>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Prehľad</TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs sm:text-sm">Správanie</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs sm:text-sm">Kampane</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{behaviorStats.totalPageViews.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Zobrazenia stránok</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{behaviorStats.uniqueSessions.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Unikátne relácie</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointerClick className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{behaviorStats.totalClicks.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Kliknutia</div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">{behaviorStats.conversionRate}%</Badge>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{behaviorStats.conversions}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Konverzie</div>
                </Card>
              </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Device Distribution */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Rozdelenie podľa zariadení
                </h3>
                <div className="space-y-3">
                  {behaviorStats.devices.map(([device, count]) => {
                    const percentage = ((count / events.length) * 100).toFixed(1);
                    return (
                      <div key={device}>
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="capitalize">{device}</span>
                          <span className="font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Top Actions */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5" />
                  Najčastejšie akcie
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {behaviorStats.topActions.map(([action, count], index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-xs sm:text-sm font-medium truncate flex-1">{action}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Referral Sources */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Top zdroje návštevnosti
                </h3>
                {behaviorStats.referrers.length > 0 ? (
                  <div className="space-y-3">
                    {behaviorStats.referrers.map(([source, count], index) => {
                      const percentage = ((count / events.length) * 100).toFixed(1);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span className="font-medium truncate flex-1">{source}</span>
                            <span className="font-semibold ml-2">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Zatiaľ žiadne externe zdroje návštevnosti</p>
                )}
              </Card>

              {/* UTM Campaigns */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  UTM Kampane
                </h3>
                {behaviorStats.utmSources.length > 0 ? (
                  <div className="space-y-3">
                    {behaviorStats.utmSources.map(([source, count], index) => {
                      const percentage = ((count / events.length) * 100).toFixed(1);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span className="font-medium truncate flex-1">{source}</span>
                            <span className="font-semibold ml-2">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Zatiaľ žiadne UTM kampane</p>
                )}
              </Card>

              {/* Conversion Funnel */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Konverzný lievik
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Návštevníci</span>
                      <span className="font-bold">{behaviorStats.uniqueSessions}</span>
                    </div>
                    <div className="h-12 bg-blue-600 rounded flex items-center justify-center text-white font-semibold">
                      100%
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kliknutia</span>
                      <span className="font-bold">{behaviorStats.totalClicks}</span>
                    </div>
                    <div 
                      className="h-10 bg-purple-600 rounded flex items-center justify-center text-white font-semibold"
                      style={{ width: `${(behaviorStats.totalClicks / Math.max(behaviorStats.uniqueSessions, 1)) * 100}%` }}
                    >
                      {((behaviorStats.totalClicks / Math.max(behaviorStats.uniqueSessions, 1)) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Konverzie</span>
                      <span className="font-bold">{behaviorStats.conversions}</span>
                    </div>
                    <div 
                      className="h-8 bg-green-600 rounded flex items-center justify-center text-white font-semibold text-sm"
                      style={{ width: `${behaviorStats.conversionRate}%` }}
                    >
                      {behaviorStats.conversionRate}%
                    </div>
                  </div>
                </div>
              </Card>

              {/* User Actions Timeline */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  Typy akcií
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Zobrazenia stránok
                    </span>
                    <Badge className="bg-blue-600 text-white">{behaviorStats.totalPageViews}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4" />
                      Kliknutia na tlačidlá
                    </span>
                    <Badge className="bg-purple-600 text-white">{behaviorStats.totalClicks}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Stiahnutia
                    </span>
                    <Badge className="bg-orange-600 text-white">{behaviorStats.totalDownloads}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Konverzie
                    </span>
                    <Badge className="bg-green-600 text-white">{behaviorStats.conversions}</Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Events */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4">Posledné udalosti</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.slice(0, 50).map((event, index) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                        {event.device_type && (
                          <Badge variant="secondary" className="text-xs">{event.device_type}</Badge>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-medium truncate">{event.page_title || event.page_url}</div>
                      {event.event_data?.button_text && (
                        <div className="text-xs text-gray-500">→ {event.event_data.button_text}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 ml-2">
                      {new Date(event.created_date).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Referrers */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  Externé zdroje návštevnosti
                </h3>
                {behaviorStats.referrers.length > 0 ? (
                  <div className="space-y-3">
                    {behaviorStats.referrers.map(([source, count], index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{source}</div>
                            <div className="text-xs text-gray-500">{count} návštev</div>
                          </div>
                          <Badge className="bg-blue-600 text-white ml-2">
                            {((count / events.length) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Zatiaľ žiadne externe zdroje</p>
                  </div>
                )}
              </Card>

              {/* Top User Actions */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5" />
                  Najčastejšie akcie používateľov
                </h3>
                <div className="space-y-2">
                  {behaviorStats.topActions.map(([action, count], index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-all"
                    >
                      <span className="text-xs sm:text-sm font-medium flex-1 truncate">{action}</span>
                      <Badge variant="secondary">{count}x</Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Conversion Events */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Konverzné udalosti (posledných 50)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events
                  .filter(e => ['form_submit', 'email_click', 'phone_click'].includes(e.event_type))
                  .slice(0, 50)
                  .map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {event.event_type === 'email_click' ? (
                            <Mail className="w-4 h-4 text-green-600" />
                          ) : event.event_type === 'phone_click' ? (
                            <Phone className="w-4 h-4 text-green-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          <Badge className="bg-green-600 text-white text-xs">
                            {event.event_type}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_date).toLocaleString('sk-SK')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{event.page_title}</div>
                      {event.utm_campaign && (
                        <div className="text-xs text-purple-600 mt-1">
                          Kampaň: {event.utm_campaign}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* UTM Campaigns Performance */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Výkon UTM kampaní
                </h3>
                {behaviorStats.utmSources.length > 0 ? (
                  <div className="space-y-4">
                    {behaviorStats.utmSources.map(([source, visits], index) => {
                      const conversions = events.filter(e => 
                        ['form_submit', 'email_click', 'phone_click'].includes(e.event_type) &&
                        e.utm_source && `${e.utm_source}${e.utm_medium ? ` / ${e.utm_medium}` : ''}` === source
                      ).length;
                      const conversionRate = visits > 0 ? ((conversions / visits) * 100).toFixed(1) : 0;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-sm sm:text-base">{source}</div>
                              <div className="text-xs text-gray-500">Kampaň</div>
                            </div>
                            <Badge className="bg-purple-600 text-white">{conversionRate}% konverzia</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-white rounded">
                              <div className="text-lg font-bold text-purple-600">{visits}</div>
                              <div className="text-xs text-gray-500">Návštevy</div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <div className="text-lg font-bold text-orange-600">{Math.round(visits * 0.7)}</div>
                              <div className="text-xs text-gray-500">Kliknutia</div>
                            </div>
                            <div className="p-2 bg-white rounded">
                              <div className="text-lg font-bold text-green-600">{conversions}</div>
                              <div className="text-xs text-gray-500">Konverzie</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Zatiaľ žiadne UTM kampane</p>
                    <p className="text-xs text-gray-400 mt-2">Použite UTM parametre v URL pre sledovanie kampaní</p>
                  </div>
                )}
              </Card>

              {/* Campaign Manager */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4">Spravované kampane</h3>
                {campaigns.length > 0 ? (
                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{campaign.campaign_name}</div>
                            <div className="text-xs text-gray-500">
                              {campaign.utm_source} / {campaign.utm_medium}
                            </div>
                          </div>
                          <Badge variant={campaign.active ? "default" : "secondary"}>
                            {campaign.active ? "Aktívna" : "Neaktívna"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Návštevy:</span>
                            <span className="font-bold ml-1">{campaign.total_visits}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Konverzie:</span>
                            <span className="font-bold ml-1">{campaign.conversions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">Zatiaľ žiadne kampane</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            {/* SEO Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalVisits.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-600">Celkové návštevy</div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  <Badge className={getScoreColor(avgSEOScore)}>{avgSEOScore}</Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{avgSEOScore}%</div>
                <div className="text-xs sm:text-sm text-gray-600">Priemerné SEO skóre</div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{avgBounceRate}%</div>
                <div className="text-xs sm:text-sm text-gray-600">Bounce Rate</div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  <Badge variant="destructive">{totalIssues}</Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalIssues}</div>
                <div className="text-xs sm:text-sm text-gray-600">SEO problémy</div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pages Analysis */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analýza stránok
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {analytics.map((page, index) => (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPage(page)}
                      className="p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{page.page_title}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{page.url}</div>
                        </div>
                        <Badge className={getScoreColor(page.seo_score)}>
                          {page.seo_score || 0}
                        </Badge>
                      </div>
                      <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          {page.pocet_navstev || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {Math.round(page.avg_time_on_page || 0)}s
                        </span>
                        {page.issues?.length > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                            {page.issues.length}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Keywords */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Kľúčové slová
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {keywords.map((keyword, index) => (
                    <motion.div
                      key={keyword.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 sm:p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{keyword.keyword}</div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            Objem: {keyword.search_volume?.toLocaleString() || 'N/A'} / mesiac
                          </div>
                        </div>
                        <Badge variant={
                          keyword.competition === 'low' ? 'default' :
                          keyword.competition === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {keyword.competition || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        {keyword.current_position && (
                          <span>Pozícia: #{keyword.current_position}</span>
                        )}
                        {keyword.ctr && (
                          <span>CTR: {keyword.ctr}%</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Page Details Modal */}
        {selectedPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedPage.page_title}</h2>
                    <p className="text-sm sm:text-base text-gray-600">{selectedPage.url}</p>
                  </div>
                  <Button onClick={() => setSelectedPage(null)} variant="outline" size="sm">
                    Zavrieť
                  </Button>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{selectedPage.pocet_navstev || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Návštevy</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{selectedPage.seo_score || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">SEO Skóre</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{Math.round(selectedPage.bounce_rate || 0)}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>

                {selectedPage.issues && selectedPage.issues.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3">SEO Problémy a odporúčania</h3>
                    <div className="space-y-3">
                      {selectedPage.issues.map((issue, index) => (
                        <div 
                          key={index}
                          className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                            issue.type === 'error' ? 'bg-red-50 border-red-500' :
                            issue.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {issue.type === 'error' ? (
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            ) : issue.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-semibold text-sm sm:text-base">{issue.message}</div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">{issue.recommendation}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPage.klucove_slova && selectedPage.klucove_slova.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-bold mb-3">Kľúčové slová na stránke</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPage.klucove_slova.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}