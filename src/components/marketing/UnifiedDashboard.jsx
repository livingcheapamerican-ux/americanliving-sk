import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { Activity, TrendingUp, DollarSign, Target, Facebook, Instagram, Search, Eye } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function UnifiedDashboard() {
  const [timeRange, setTimeRange] = useState(30); // days

  const { data: socialMetrics = [] } = useQuery({
    queryKey: ['social-metrics-unified'],
    queryFn: () => base44.entities.SocialMediaMetrics.list('-last_updated', 100)
  });

  const { data: googleAdsMetrics = [] } = useQuery({
    queryKey: ['google-ads-unified'],
    queryFn: () => base44.entities.GoogleAdsMetrics.list('-last_synced', 100)
  });

  const { data: marketingHistory = [] } = useQuery({
    queryKey: ['history-unified'],
    queryFn: () => base44.entities.MarketingHistory.list('-created_date', 100)
  });

  // Kombinované metriky
  const allCampaigns = [
    ...socialMetrics.map(m => ({ ...m, source: m.platform })),
    ...googleAdsMetrics.map(m => ({ ...m, source: 'Google Ads' }))
  ];

  const totalStats = {
    campaigns: allCampaigns.length,
    totalCost: allCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0),
    totalConversions: allCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
    totalClicks: allCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0),
    avgCPA: 0
  };
  totalStats.avgCPA = totalStats.totalConversions > 0 
    ? (totalStats.totalCost / totalStats.totalConversions).toFixed(2) 
    : 0;

  // Platform distribution
  const platformData = [
    { name: 'Facebook', value: socialMetrics.filter(m => m.platform === 'Facebook').length, color: '#1877F2' },
    { name: 'Instagram', value: socialMetrics.filter(m => m.platform === 'Instagram').length, color: '#E4405F' },
    { name: 'Google Ads', value: googleAdsMetrics.length, color: '#4285F4' },
    { name: 'TikTok', value: socialMetrics.filter(m => m.platform === 'TikTok').length, color: '#000000' }
  ].filter(p => p.value > 0);

  // Performance trend (last 14 days)
  const trendData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayCampaigns = allCampaigns.filter(c => {
      const campaignDate = new Date(c.last_updated || c.last_synced || c.created_date);
      return campaignDate >= dayStart && campaignDate <= dayEnd;
    });

    trendData.push({
      date: format(date, 'dd.MM'),
      conversions: dayCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
      cost: dayCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0),
      clicks: dayCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
    });
  }

  // Top performing campaigns
  const topCampaigns = allCampaigns
    .filter(c => c.conversions > 0)
    .sort((a, b) => {
      const aCPA = a.cost / a.conversions;
      const bCPA = b.cost / b.conversions;
      return aCPA - bCPA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white">Total</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Aktívne kampane</p>
            <p className="text-4xl font-bold text-gray-900">{totalStats.campaigns}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600 text-white">Conv.</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Celkové konverzie</p>
            <p className="text-4xl font-bold text-gray-900">{totalStats.totalConversions}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-600 text-white">Cost</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Celkové náklady</p>
            <p className="text-4xl font-bold text-gray-900">€{totalStats.totalCost.toFixed(0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-600 text-white">CPA</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Priemerné CPA</p>
            <p className="text-4xl font-bold text-gray-900">€{totalStats.avgCPA}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📈 Výkonnostný trend (14 dní)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" name="Konverzie" />
                <Area type="monotone" dataKey="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" name="Náklady (€)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📱 Rozdelenie kampaní</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            🏆 Top 5 kampaní (najlepšie CPA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Zatiaľ žiadne kampane s konverziami</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCampaigns.map((campaign, idx) => {
                const cpa = (campaign.cost / campaign.conversions).toFixed(2);
                return (
                  <div key={idx} className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white font-bold">#{idx + 1}</Badge>
                        <h5 className="font-bold text-sm">{campaign.campaign_name}</h5>
                      </div>
                      <Badge variant="outline">{campaign.source}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-gray-600">CPA</p>
                        <p className="font-bold text-green-700">€{cpa}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-gray-600">Conv.</p>
                        <p className="font-bold">{campaign.conversions}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <p className="text-gray-600">Clicks</p>
                        <p className="font-bold">{campaign.clicks}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <p className="text-gray-600">Cost</p>
                        <p className="font-bold">€{campaign.cost?.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}