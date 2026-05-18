import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Facebook, 
  Instagram, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Heart,
  MessageSquare,
  Share2,
  DollarSign,
  Target,
  Activity,
  Plus,
  RefreshCw,
  BarChart3,
  Users,
  Zap,
  Filter
} from "lucide-react";
import CampaignReportExport from "../components/marketing/CampaignReportExport";
import GoogleAdsComparison from "../components/marketing/GoogleAdsComparison";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

function CampaignMetricCard({ metric }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card 
      className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
        metric.status === 'active' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h5 className="font-bold text-sm mb-1">{metric.campaign_name}</h5>
            <div className="flex gap-2">
              <Badge className={
                metric.platform === 'Facebook' ? 'bg-blue-600' :
                metric.platform === 'Instagram' ? 'bg-pink-600' : 'bg-gray-600'
              }>
                {metric.platform}
              </Badge>
              <Badge variant="outline" className={
                metric.status === 'active' ? 'border-green-500 text-green-700' :
                metric.status === 'paused' ? 'border-yellow-500 text-yellow-700' :
                'border-gray-500 text-gray-700'
              }>
                {metric.status === 'active' ? '🟢 Aktívna' :
                 metric.status === 'paused' ? '⏸️ Pozastavená' : '✓ Dokončená'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Cost</p>
            <p className="text-xl font-bold text-orange-600">€{metric.cost}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-2 rounded text-center">
            <p className="text-gray-600">Dosah</p>
            <p className="font-bold">{metric.reach?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <p className="text-gray-600">CTR</p>
            <p className="font-bold text-purple-600">{metric.ctr || 0}%</p>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <p className="text-gray-600">Conv.</p>
            <p className="font-bold text-green-600">{metric.conversions || 0}</p>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <p className="text-gray-600">CPA</p>
            <p className="font-bold text-orange-600">€{metric.cpa || 0}</p>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-gray-600 mb-1">Zobrazenia</p>
                <p className="font-bold">{metric.impressions?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="text-gray-600 mb-1">CPC</p>
                <p className="font-bold">€{metric.cpc || 0}</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-gray-600 mb-1">CPM</p>
                <p className="font-bold">€{metric.cpm || 0}</p>
              </div>
            </div>

            {(metric.likes || metric.comments || metric.shares) && (
              <div className="bg-pink-50 p-3 rounded border border-pink-200">
                <p className="text-xs font-semibold text-pink-900 mb-2">💗 Engagement</p>
                <div className="flex gap-4 text-xs">
                  {metric.likes > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-600" />
                      <span>{metric.likes}</span>
                    </div>
                  )}
                  {metric.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span>{metric.comments}</span>
                    </div>
                  )}
                  {metric.shares > 0 && (
                    <div className="flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-green-600" />
                      <span>{metric.shares}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {metric.performance_notes && (
              <div className="bg-gray-100 p-3 rounded text-xs">
                <p className="font-semibold mb-1">📝 Poznámky:</p>
                <p className="text-gray-700">{metric.performance_notes}</p>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Posledná aktualizácia: {metric.last_updated ? format(new Date(metric.last_updated), 'dd.MM.yyyy HH:mm', { locale: sk }) : 'N/A'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SocialMediaDashboard() {
  const [newMetric, setNewMetric] = useState({
    platform: "Facebook",
    campaign_name: "",
    reach: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cost: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['social-media-metrics'],
    queryFn: () => base44.entities.SocialMediaMetrics.list('-last_updated', 100),
    enabled: isAdmin
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaign-history-social'],
    queryFn: () => base44.entities.MarketingHistory.filter({ status: 'completed' }),
    enabled: isAdmin
  });

  const createMetric = useMutation({
    mutationFn: (data) => base44.entities.SocialMediaMetrics.create({
      ...data,
      ctr: data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : 0,
      conversion_rate: data.clicks > 0 ? ((data.conversions / data.clicks) * 100).toFixed(2) : 0,
      cpc: data.clicks > 0 ? (data.cost / data.clicks).toFixed(2) : 0,
      cpm: data.impressions > 0 ? ((data.cost / data.impressions) * 1000).toFixed(2) : 0,
      cpa: data.conversions > 0 ? (data.cost / data.conversions).toFixed(2) : 0,
      last_updated: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['social-media-metrics']);
      setShowAddDialog(false);
      setNewMetric({
        platform: "Facebook",
        campaign_name: "",
        reach: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      });
      toast.success('Metriky pridané!');
    }
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  // Agregované štatistiky
  const fbMetrics = metrics.filter(m => m.platform === 'Facebook');
  const igMetrics = metrics.filter(m => m.platform === 'Instagram');
  
  const totalStats = {
    reach: metrics.reduce((sum, m) => sum + (m.reach || 0), 0),
    impressions: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    clicks: metrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
    conversions: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
    cost: metrics.reduce((sum, m) => sum + (m.cost || 0), 0),
    avgCTR: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + (parseFloat(m.ctr) || 0), 0) / metrics.length).toFixed(2) : 0,
    avgConversionRate: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + (parseFloat(m.conversion_rate) || 0), 0) / metrics.length).toFixed(2) : 0
  };

  const activeCampaigns = metrics.filter(m => m.status === 'active');

  // Apply filters
  const filteredMetrics = metrics.filter(m => {
    const platformMatch = filterPlatform === "all" || m.platform === filterPlatform;
    const statusMatch = filterStatus === "all" || m.status === filterStatus;
    
    let dateMatch = true;
    if (filterDateFrom && m.last_updated) {
      dateMatch = dateMatch && new Date(m.last_updated) >= new Date(filterDateFrom);
    }
    if (filterDateTo && m.last_updated) {
      dateMatch = dateMatch && new Date(m.last_updated) <= new Date(filterDateTo);
    }
    
    return platformMatch && statusMatch && dateMatch;
  });

  // Filtered stats
  const filteredStats = {
    reach: filteredMetrics.reduce((sum, m) => sum + (m.reach || 0), 0),
    impressions: filteredMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    clicks: filteredMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
    conversions: filteredMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
    cost: filteredMetrics.reduce((sum, m) => sum + (m.cost || 0), 0),
    avgCTR: filteredMetrics.length > 0 ? (filteredMetrics.reduce((sum, m) => sum + (parseFloat(m.ctr) || 0), 0) / filteredMetrics.length).toFixed(2) : 0,
    avgCPA: filteredMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0) > 0 
      ? (filteredMetrics.reduce((sum, m) => sum + (m.cost || 0), 0) / filteredMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0)).toFixed(2) 
      : 0
  };

  // Chart data - posledných 14 kampaní
  const performanceData = metrics.slice(0, 14).reverse().map(m => ({
    name: m.campaign_name.substring(0, 15) + '...',
    reach: m.reach,
    clicks: m.clicks,
    conversions: m.conversions,
    cost: m.cost
  }));

  // Platform split
  const platformData = [
    { name: 'Facebook', value: fbMetrics.length, color: '#1877F2' },
    { name: 'Instagram', value: igMetrics.length, color: '#E4405F' },
    { name: 'TikTok', value: metrics.filter(m => m.platform === 'TikTok').length, color: '#000000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-blue-600" />
              📊 Social Media Performance
            </h1>
            <p className="text-gray-600">Sledovanie výkonu kampaní na sociálnych sieťach</p>
            
            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div>
                <Label className="text-xs">Platforma</Label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-3 py-1.5 border rounded-md text-sm"
                >
                  <option value="all">Všetky</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border rounded-md text-sm"
                >
                  <option value="all">Všetky</option>
                  <option value="active">Aktívne</option>
                  <option value="paused">Pozastavené</option>
                  <option value="completed">Dokončené</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Od dátumu</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Do dátumu</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-end">
                <CampaignReportExport 
                  campaigns={filteredMetrics} 
                  filters={{ platform: filterPlatform, status: filterStatus, dateFrom: filterDateFrom, dateTo: filterDateTo }}
                />
              </div>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Pridať metriky
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>📊 Pridať metriky kampane</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platforma</Label>
                    <select
                      value={newMetric.platform}
                      onChange={(e) => setNewMetric({...newMetric, platform: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="LinkedIn">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <Label>Názov kampane</Label>
                    <Input
                      value={newMetric.campaign_name}
                      onChange={(e) => setNewMetric({...newMetric, campaign_name: e.target.value})}
                      placeholder="Napr. Lead Gen - Washington"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Dosah (Reach)</Label>
                    <Input
                      type="number"
                      value={newMetric.reach}
                      onChange={(e) => setNewMetric({...newMetric, reach: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Zobrazenia</Label>
                    <Input
                      type="number"
                      value={newMetric.impressions}
                      onChange={(e) => setNewMetric({...newMetric, impressions: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Kliknutia</Label>
                    <Input
                      type="number"
                      value={newMetric.clicks}
                      onChange={(e) => setNewMetric({...newMetric, clicks: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Konverzie</Label>
                    <Input
                      type="number"
                      value={newMetric.conversions}
                      onChange={(e) => setNewMetric({...newMetric, conversions: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Náklady (EUR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newMetric.cost}
                      onChange={(e) => setNewMetric({...newMetric, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => createMetric.mutate(newMetric)}
                  disabled={!newMetric.campaign_name}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Pridať metriky
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtered Stats Banner */}
        {(filterPlatform !== "all" || filterStatus !== "all" || filterDateFrom || filterDateTo) && (
          <Card className="mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-400">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-indigo-900">📊 Filtrované štatistiky</h3>
                <Badge className="bg-indigo-600 text-white">{filteredMetrics.length} kampaní</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-indigo-200">
                  <p className="text-gray-600 text-xs mb-1">Celkový budget</p>
                  <p className="text-2xl font-bold text-orange-600">€{filteredStats.cost.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-200">
                  <p className="text-gray-600 text-xs mb-1">Konverzie</p>
                  <p className="text-2xl font-bold text-green-600">{filteredStats.conversions}</p>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-200">
                  <p className="text-gray-600 text-xs mb-1">Priem. CPA</p>
                  <p className="text-2xl font-bold text-purple-600">€{filteredStats.avgCPA}</p>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-200">
                  <p className="text-gray-600 text-xs mb-1">Priem. CTR</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredStats.avgCTR}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Total</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Celkový dosah</p>
              <p className="text-3xl font-bold text-gray-900">{totalStats.reach.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointer className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600 text-white">CTR</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Kliknutia</p>
              <p className="text-3xl font-bold text-gray-900">{totalStats.clicks.toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-1">{totalStats.avgCTR}% avg CTR</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">Conv.</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Konverzie</p>
              <p className="text-3xl font-bold text-gray-900">{totalStats.conversions}</p>
              <p className="text-xs text-green-600 mt-1">{totalStats.avgConversionRate}% rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-white">ROI</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Celkové náklady</p>
              <p className="text-3xl font-bold text-gray-900">€{totalStats.cost.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-600 animate-pulse" />
              🔥 Aktívne kampane ({activeCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Žiadne aktívne kampane</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-white border-2 border-yellow-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-bold text-sm">{campaign.campaign_name}</h5>
                          <Badge className={
                            campaign.platform === 'Facebook' ? 'bg-blue-600' :
                            campaign.platform === 'Instagram' ? 'bg-pink-600' : 'bg-gray-600'
                          }>
                            {campaign.platform}
                          </Badge>
                        </div>
                        <Badge className="bg-green-600 text-white animate-pulse">LIVE</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-gray-600">Dosah</p>
                          <p className="font-bold text-lg">{campaign.reach?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-gray-600">CTR</p>
                          <p className="font-bold text-lg">{campaign.ctr || 0}%</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-gray-600">Konverzie</p>
                          <p className="font-bold text-lg">{campaign.conversions || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <p className="text-gray-600">CPA</p>
                          <p className="font-bold text-lg">€{campaign.cpa || 0}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500">
                        <span>Aktualizované: {campaign.last_updated ? format(new Date(campaign.last_updated), 'dd.MM HH:mm', { locale: sk }) : 'N/A'}</span>
                        <span className="font-semibold text-orange-600">€{campaign.cost || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Ads Comparison */}
        <GoogleAdsComparison />

        {/* Performance Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Campaign Performance Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                📈 Výkon kampaní (posledných 14)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8b5cf6" name="Kliknutia" />
                  <Bar dataKey="conversions" fill="#10b981" name="Konverzie" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                📱 Rozdelenie kampaní podľa platforiem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* All Campaigns Table */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              <Activity className="w-4 h-4 mr-2" />
              Všetky ({metrics.length})
            </TabsTrigger>
            <TabsTrigger value="facebook">
              <Facebook className="w-4 h-4 mr-2" />
              Facebook ({fbMetrics.length})
            </TabsTrigger>
            <TabsTrigger value="instagram">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram ({igMetrics.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Všetky kampane</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {filteredMetrics.map((metric) => (
                    <CampaignMetricCard key={metric.id} metric={metric} />
                  ))}
                </div>
                {filteredMetrics.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Žiadne kampane nezodpovedajú filtrom</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  Facebook kampane
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {fbMetrics.map((metric) => (
                    <CampaignMetricCard key={metric.id} metric={metric} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instagram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  Instagram kampane
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {igMetrics.map((metric) => (
                    <CampaignMetricCard key={metric.id} metric={metric} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}