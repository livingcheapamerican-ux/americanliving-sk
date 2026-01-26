import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Monitor,
  Settings,
  RefreshCw,
  Facebook,
  Instagram,
  Search,
  Target,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  BarChart3,
  Zap,
  Globe,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  PieChart,
  Brain
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import MarketingNotificationCenter from "../components/MarketingNotificationCenter";
import CompetitorAnalysisSection from "../components/CompetitorAnalysisSection";
import ScalingRecommendations from "../components/ScalingRecommendations";
import KPIDashboard from "../components/KPIDashboard";

export default function AIMarketingInsights() {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterHouse, setFilterHouse] = useState("all");
  const [sortBy, setSortBy] = useState("sessions_desc");
  const [chartDrillDown, setChartDrillDown] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: allInsights = [], isLoading, refetch } = useQuery({
    queryKey: ['marketing-insights'],
    queryFn: async () => {
      const data = await base44.entities.MarketingInsight.list('-posledna_aktualizacia');
      console.log('✅ Načítané insights:', data.length, data);
      return data;
    },
    enabled: isAdmin
  });

  // Filtrované a zoradené insights
  const insights = (() => {
    const filtered = allInsights.filter(insight => {
      // Dátumový filter
      if (dateFrom && new Date(insight.datum_generovania) < new Date(dateFrom)) return false;
      if (dateTo && new Date(insight.datum_generovania) > new Date(dateTo + 'T23:59:59')) return false;
      
      // Filter zariadenia
      if (filterDevice !== "all") {
        const devicePercent = insight.zariadenia_a_platforma?.[filterDevice] || 0;
        if (devicePercent < 30) return false; // Len domy kde je zariadenie dominantné
      }
      
      // Filter krajiny
      if (filterCountry !== "all") {
        const hasCountry = insight.geograficke_cielenie?.top_krajiny?.some(
          k => k.krajina === filterCountry
        );
        if (!hasCountry) return false;
      }
      
      // Filter konkrétneho domu
      if (filterHouse !== "all" && insight.dom_id !== filterHouse) return false;
      
      return true;
    });

    // Zoradiť podľa vybraného kritéria
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "sessions_desc":
          return (b.pocet_analyzovanych_sessions || 0) - (a.pocet_analyzovanych_sessions || 0);
        case "sessions_asc":
          return (a.pocet_analyzovanych_sessions || 0) - (b.pocet_analyzovanych_sessions || 0);
        case "conversion_desc":
          return (b.celkovy_zajem?.miera_konverzie || 0) - (a.celkovy_zajem?.miera_konverzie || 0);
        case "conversion_asc":
          return (a.celkovy_zajem?.miera_konverzie || 0) - (b.celkovy_zajem?.miera_konverzie || 0);
        case "confidence_desc":
          return (b.confidence_score || 0) - (a.confidence_score || 0);
        case "confidence_asc":
          return (a.confidence_score || 0) - (b.confidence_score || 0);
        case "views_desc":
          return (b.celkovy_zajem?.pocet_zobrazeni || 0) - (a.celkovy_zajem?.pocet_zobrazeni || 0);
        case "views_asc":
          return (a.celkovy_zajem?.pocet_zobrazeni || 0) - (b.celkovy_zajem?.pocet_zobrazeni || 0);
        default:
          return 0;
      }
    });

    return sorted;
  })();

  // Unikátne krajiny a domy pre filtre
  const countries = (() => {
    const set = new Set();
    allInsights.forEach(i => {
      i.geograficke_cielenie?.top_krajiny?.forEach(k => set.add(k.krajina));
    });
    return Array.from(set).sort();
  })();

  const houses = allInsights.map(i => ({ id: i.dom_id, nazov: i.dom_nazov }));

  const generateInsightsMutation = useMutation({
    mutationFn: () => {
      toast.info('🚀 Spúšťam AI analýzu... Toto môže trvať 30-60 sekúnd.');
      return base44.functions.invoke('generateMarketingInsights');
    },
    onSuccess: async (response) => {
      const data = response?.data || {};
      console.log('✅ Funkcia dokončená:', data);
      
      // Počkať 2 sekundy a manuálne načítať dáta
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetch();
      
      toast.success(`✅ Úspešne vygenerovaných ${data.insights_count || 0} poznatkov z ${data.analyzed_houses || 0} domov!`);
    },
    onError: (error) => {
      console.error('Chyba pri generovaní:', error);
      toast.error('❌ Chyba: ' + (error.response?.data?.error || error.message || 'Neznáma chyba'));
    }
  });

  // Agregované dáta pre grafy
  const aggregatedData = (() => {
    if (!insights.length) return null;

    const countries = {};
    const cities = {};
    const manufacturers = {};
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const priceRanges = { do_50k: 0, '50k_100k': 0, '100k_150k': 0, nad_150k: 0 };
    const conversionRates = [];
    const roiData = { facebook: [], google: [] };
    const trafficSources = {};

    insights.forEach(insight => {
      // Krajiny
      insight.geograficke_cielenie?.top_krajiny?.forEach(k => {
        countries[k.krajina] = (countries[k.krajina] || 0) + k.pocet_navstev;
      });

      // Mestá
      insight.geograficke_cielenie?.top_mesta?.forEach(m => {
        cities[m.mesto] = (cities[m.mesto] || 0) + m.pocet_navstev;
      });

      // Výrobcovia
      manufacturers[insight.vyrobca] = (manufacturers[insight.vyrobca] || 0) + 1;

      // Zariadenia
      if (insight.zariadenia_a_platforma) {
        devices.desktop += insight.zariadenia_a_platforma.desktop || 0;
        devices.mobile += insight.zariadenia_a_platforma.mobile || 0;
        devices.tablet += insight.zariadenia_a_platforma.tablet || 0;
      }

      // Cenové rozloženie
      if (insight.konfigurator_preferencie?.cenove_rozlozenie) {
        const cr = insight.konfigurator_preferencie.cenove_rozlozenie;
        priceRanges.do_50k += cr.do_50k || 0;
        priceRanges['50k_100k'] += cr['50k_100k'] || 0;
        priceRanges['100k_150k'] += cr['100k_150k'] || 0;
        priceRanges.nad_150k += cr.nad_150k || 0;
      }

      // Konverzné miery
      if (insight.celkovy_zajem?.miera_konverzie) {
        conversionRates.push({
          dom: insight.dom_nazov,
          vyrobca: insight.vyrobca,
          konverzia: insight.celkovy_zajem.miera_konverzie,
          zobrazenia: insight.celkovy_zajem.pocet_zobrazeni,
          konfiguracie: insight.celkovy_zajem.pocet_konfiguracii
        });
      }

      // ROI dáta
      if (insight.roi_predikcia?.facebook_instagram_roi) {
        roiData.facebook.push({
          dom: insight.dom_nazov,
          roi: insight.roi_predikcia.facebook_instagram_roi.roi_percento || 0,
          konverzie: insight.roi_predikcia.facebook_instagram_roi.predpokladane_konverzie || 0
        });
      }
      if (insight.roi_predikcia?.google_ads_roi) {
        roiData.google.push({
          dom: insight.dom_nazov,
          roi: insight.roi_predikcia.google_ads_roi.roi_percento || 0,
          konverzie: insight.roi_predikcia.google_ads_roi.predpokladane_konverzie || 0
        });
      }

      // Traffic sources (platformy)
      insight.zariadenia_a_platforma?.odporucane_platformy?.forEach(platform => {
        trafficSources[platform] = (trafficSources[platform] || 0) + 1;
      });
    });

    return {
      countries: Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
      cities: Object.entries(cities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
      manufacturers: Object.entries(manufacturers)
        .map(([name, value]) => ({ name, value })),
      devices: [
        { name: 'Desktop', value: Math.round(devices.desktop / insights.length) },
        { name: 'Mobile', value: Math.round(devices.mobile / insights.length) },
        { name: 'Tablet', value: Math.round(devices.tablet / insights.length) }
      ],
      priceRanges: [
        { name: 'Do 50k €', value: priceRanges.do_50k },
        { name: '50-100k €', value: priceRanges['50k_100k'] },
        { name: '100-150k €', value: priceRanges['100k_150k'] },
        { name: 'Nad 150k €', value: priceRanges.nad_150k }
      ],
      conversionRates: conversionRates.sort((a, b) => b.konverzia - a.konverzia).slice(0, 10),
      roiComparison: roiData,
      trafficSources: Object.entries(trafficSources)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    };
  })();

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-center">
            Nemáte oprávnenie na prístup k tejto stránke.
          </p>
        </Card>
      </div>
    );
  }

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Export do CSV
  const exportToCSV = () => {
    const headers = ['Dom', 'Výrobca', 'Zobrazenia', 'Konfigurácie', 'Konverzia %', 'Priemerný čas', 'Top krajina', 'Confidence'];
    const rows = insights.map(i => [
      i.dom_nazov,
      i.vyrobca,
      i.celkovy_zajem?.pocet_zobrazeni || 0,
      i.celkovy_zajem?.pocet_konfiguracii || 0,
      i.celkovy_zajem?.miera_konverzie || 0,
      i.celkovy_zajem?.priemerny_cas_na_stranke || 0,
      i.geograficke_cielenie?.top_krajiny?.[0]?.krajina || 'N/A',
      i.confidence_score
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-insights-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV export úspešný!');
  };

  // Export do PDF pomocou jsPDF
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('AI Marketing Insights Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Insights: ${insights.length}`, 20, 35);
    
    let y = 45;
    insights.forEach((insight, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${idx + 1}. ${insight.dom_nazov}`, 20, y);
      doc.setFontSize(9);
      y += 6;
      doc.text(`Výrobca: ${insight.vyrobca} | Confidence: ${insight.confidence_score}%`, 25, y);
      y += 5;
      doc.text(`Zobrazenia: ${insight.celkovy_zajem?.pocet_zobrazeni || 0} | Konfigurácie: ${insight.celkovy_zajem?.pocet_konfiguracii || 0}`, 25, y);
      y += 5;
      doc.text(`Konverzia: ${insight.celkovy_zajem?.miera_konverzie || 0}% | Priemerný čas: ${insight.celkovy_zajem?.priemerny_cas_na_stranke || 0}s`, 25, y);
      y += 8;
    });
    
    doc.save(`marketing-insights-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF export úspešný!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Marketing Insights
                </h1>
                <p className="text-gray-600">
                  Automatická analýza a presné odporúčania pre reklamné kampane
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <MarketingNotificationCenter />
              <Button
                onClick={async () => {
                  toast.info('🔍 Kontrolujem dáta...');
                  try {
                    // Načítať verejné domy
                    const domy = await base44.entities.Dom.filter({ verejny: true });

                    // Načítať sessions
                    const sessions = await base44.entities.UserSession.list('-created_date', 100);
                    const nonAdminSessions = sessions.filter(s => 
                      s.user_email !== 'living.cheap.american@gmail.com'
                    );

                    // Načítať insights
                    const insights = await base44.entities.MarketingInsight.list();

                    console.log('📊 KONTROLA DÁTA:', {
                      verejne_domy: domy.length,
                      sample_domy: domy.slice(0, 3).map(d => d.nazov),
                      total_sessions: sessions.length,
                      non_admin_sessions: nonAdminSessions.length,
                      existing_insights: insights.length
                    });

                    toast.success(`📊 Verejných domov: ${domy.length}, Non-admin sessions: ${nonAdminSessions.length}, Insights: ${insights.length}`);
                  } catch (error) {
                    console.error('DEBUG chyba:', error);
                    toast.error('❌ Chyba: ' + error.message);
                  }
                }}
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                🔍 Kontrola dát
              </Button>
              <Button
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                {generateInsightsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generujem...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generovať nové poznatky
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filtre */}
          <Card className="mb-6 p-4 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Pokročilé filtre</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportToCSV}>
                  📊 Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportToPDF}>
                  📄 Export PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Dátum od</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Dátum do</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm"
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
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Krajina</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Všetky</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Dom</label>
                <select
                  value={filterHouse}
                  onChange={(e) => setFilterHouse(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Všetky domy</option>
                  {houses.map(h => (
                    <option key={h.id} value={h.id}>{h.nazov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Zoradiť podľa</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="sessions_desc">📊 Sessions ↓</option>
                  <option value="sessions_asc">📊 Sessions ↑</option>
                  <option value="conversion_desc">🎯 Konverzia ↓</option>
                  <option value="conversion_asc">🎯 Konverzia ↑</option>
                  <option value="confidence_desc">✅ Dôveryhodnosť ↓</option>
                  <option value="confidence_asc">✅ Dôveryhodnosť ↑</option>
                  <option value="views_desc">👁️ Zobrazenia ↓</option>
                  <option value="views_asc">👁️ Zobrazenia ↑</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setFilterDevice("all");
                  setFilterCountry("all");
                  setFilterHouse("all");
                  setSortBy("sessions_desc");
                }}
              >
                Vyčistiť filtre
              </Button>
              <Badge className="bg-purple-100 text-purple-800">
                {insights.length} z {allInsights.length} insights
              </Badge>
              <Badge variant="outline" className="text-xs">
                Zoradené: {
                  sortBy === "sessions_desc" ? "Sessions ↓" :
                  sortBy === "sessions_asc" ? "Sessions ↑" :
                  sortBy === "conversion_desc" ? "Konverzia ↓" :
                  sortBy === "conversion_asc" ? "Konverzia ↑" :
                  sortBy === "confidence_desc" ? "Dôveryhodnosť ↓" :
                  sortBy === "confidence_asc" ? "Dôveryhodnosť ↑" :
                  sortBy === "views_desc" ? "Zobrazenia ↓" : "Zobrazenia ↑"
                }
              </Badge>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Celkom poznatkov</p>
                    <p className="text-2xl font-bold">{insights.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vysoká dôveryhodnosť</p>
                    <p className="text-2xl font-bold">
                      {insights.filter(i => i.confidence_score >= 80).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Analyzovaných sessions</p>
                    <p className="text-2xl font-bold">
                      {insights.reduce((sum, i) => sum + (i.pocet_analyzovanych_sessions || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priem. konverzia</p>
                    <p className="text-2xl font-bold">
                      {insights.length > 0
                        ? Math.round(
                            insights.reduce((sum, i) => 
                              sum + (i.celkovy_zajem?.miera_konverzie || 0), 0
                            ) / insights.length
                          )
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pokročilé vizualizácie a grafy */}
        {!isLoading && insights.length > 0 && aggregatedData && (
          <div className="mb-8 space-y-6">
            {/* Konverzné miery - Interaktívny graf */}
            <Card className="bg-white/80 backdrop-blur shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    📊 Konverzné miery podľa domov (kliknutím zobrazíte detail)
                  </CardTitle>
                  {chartDrillDown && (
                    <Button size="sm" variant="outline" onClick={() => setChartDrillDown(null)}>
                      ← Späť na prehľad
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={aggregatedData.conversionRates}
                    onClick={(data) => {
                      if (data?.activePayload?.[0]?.payload) {
                        setChartDrillDown(data.activePayload[0].payload);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dom" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'Konverzia %', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-bold">{data.dom}</p>
                              <p className="text-sm text-gray-600">Výrobca: {data.vyrobca}</p>
                              <p className="text-sm">Konverzia: <span className="font-bold text-purple-600">{data.konverzia}%</span></p>
                              <p className="text-sm">Zobrazenia: {data.zobrazenia}</p>
                              <p className="text-sm">Konfigurácie: {data.konfiguracie}</p>
                              <p className="text-xs text-blue-600 mt-1">👆 Kliknite pre detail</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="konverzia" fill="#8b5cf6" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Drill-down detail */}
                {chartDrillDown && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <h4 className="font-bold text-lg mb-3">{chartDrillDown.dom}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Konverzná miera</p>
                        <p className="text-2xl font-bold text-purple-600">{chartDrillDown.konverzia}%</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Zobrazenia</p>
                        <p className="text-2xl font-bold text-blue-600">{chartDrillDown.zobrazenia}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Konfigurácie</p>
                        <p className="text-2xl font-bold text-green-600">{chartDrillDown.konfiguracie}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ROI Porovnanie - Interaktívny graf */}
            <Card className="bg-white/80 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  💹 Porovnanie ROI: Facebook vs Google Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Facebook ROI */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook / Instagram ROI
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aggregatedData.roiComparison.facebook.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dom" angle={-45} textAnchor="end" height={100} />
                        <YAxis label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-2 border rounded shadow-lg">
                                  <p className="font-bold text-sm">{data.dom}</p>
                                  <p className="text-xs">ROI: <span className="font-bold text-blue-600">{data.roi}%</span></p>
                                  <p className="text-xs">Konverzie: {data.konverzie}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="roi" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Google Ads ROI */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-green-600" />
                      Google Ads ROI
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aggregatedData.roiComparison.google.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dom" angle={-45} textAnchor="end" height={100} />
                        <YAxis label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-2 border rounded shadow-lg">
                                  <p className="font-bold text-sm">{data.dom}</p>
                                  <p className="text-xs">ROI: <span className="font-bold text-green-600">{data.roi}%</span></p>
                                  <p className="text-xs">Konverzie: {data.konverzie}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="roi" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources - Interaktívny */}
            <Card className="bg-white/80 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  🌐 Odporúčané Traffic Sources (kliknutím filtrujete)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={aggregatedData.trafficSources}
                    onClick={(data) => {
                      if (data?.activePayload?.[0]?.payload) {
                        const platform = data.activePayload[0].payload.name;
                        toast.info(`Filtrované domy ktoré odporúčajú platformu: ${platform}`);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#06b6d4" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    Geografické rozloženie
                  </CardTitle>
                  {selectedManufacturer && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedManufacturer(null)}
                    >
                      Zobraziť všetkých výrobcov
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Top krajiny */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Top 10 krajín
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={aggregatedData.countries}
                        onClick={(data) => {
                          if (data?.activePayload?.[0]?.payload) {
                            const country = data.activePayload[0].payload.name;
                            setFilterCountry(country);
                            toast.info(`Filtrované pre krajinu: ${country}`);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8b5cf6" cursor="pointer" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top mestá */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Top 10 miest
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aggregatedData.cities}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#ec4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Výrobcovia - klikací */}
              <Card className="bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Rozloženie výrobcov
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={aggregatedData.manufacturers}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(data) => {
                          setSelectedManufacturer(data.name);
                          toast.info(`Filtrované pre výrobcu: ${data.name}`);
                        }}
                        cursor="pointer"
                      >
                        {aggregatedData.manufacturers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  {selectedManufacturer && (
                    <div className="mt-3 p-2 bg-purple-50 rounded text-sm text-center">
                      Filtrované: <span className="font-bold">{selectedManufacturer}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Zariadenia - klikací */}
              <Card className="bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    Rozloženie zariadení
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={aggregatedData.devices}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(data) => {
                          const deviceMap = { 'Desktop': 'desktop', 'Mobile': 'mobile', 'Tablet': 'tablet' };
                          setFilterDevice(deviceMap[data.name]);
                          toast.info(`Filtrované pre zariadenie: ${data.name}`);
                        }}
                        cursor="pointer"
                      >
                        {aggregatedData.devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cenové rozloženie */}
              <Card className="bg-white/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Cenové preferencie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={aggregatedData.priceRanges}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {aggregatedData.priceRanges.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Insights List */}
        {isLoading ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Načítavam marketingové poznatky...</p>
          </Card>
        ) : insights.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Žiadne poznatky zatiaľ</h3>
            <p className="text-gray-600 mb-4">
              Kliknite na tlačidlo "Generovať nové poznatky" pre vytvorenie AI analýzy
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {insights.map((insight, insightIndex) => (
              <Card key={`insight-${insight.id || insightIndex}`} className="overflow-hidden bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all">
                {/* Header */}
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{insight.dom_nazov}</CardTitle>
                        <Badge className={getConfidenceColor(insight.confidence_score)}>
                          Dôveryhodnosť: {insight.confidence_score}%
                        </Badge>
                        <Badge variant="outline">{insight.vyrobca}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span>{insight.celkovy_zajem?.pocet_zobrazeni || 0} zobrazení</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>{insight.celkovy_zajem?.pocet_konfiguracii || 0} konfigurácií</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span>{insight.celkovy_zajem?.miera_konverzie || 0}% konverzia</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-500" />
                          <span>{insight.pocet_analyzovanych_sessions} sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs defaultValue="kpi" className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                      <TabsTrigger value="kpi">📊 KPI</TabsTrigger>
                      <TabsTrigger value="sumar">📋 Súhrn</TabsTrigger>
                      <TabsTrigger value="geo">🌍 Geografia</TabsTrigger>
                      <TabsTrigger value="konfig">⚙️ Konfigurátor</TabsTrigger>
                      <TabsTrigger value="kampane">🎯 Kampane</TabsTrigger>
                      <TabsTrigger value="konkurencia">🏆 Konkurencia</TabsTrigger>
                      <TabsTrigger value="navod">📖 AI Návod</TabsTrigger>
                    </TabsList>

                    {/* KPI Predikcie */}
                    <TabsContent value="kpi" className="space-y-4">
                      <KPIDashboard kpiPredikcie={insight.kpi_predikcie} domNazov={insight.dom_nazov} />
                    </TabsContent>

                    {/* Súhrn */}
                    <TabsContent value="sumar" className="space-y-4">
                      {/* Cookie Analytics */}
                      {insight.cookie_analytics && (
                        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              🍪 Cookie Analytics & Používateľské Preferencie
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Vracajúci sa používatelia</p>
                                <p className="text-2xl font-bold text-cyan-700">
                                  {insight.cookie_analytics.vracajuci_sa_pouzivatelia}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Dokončené konfigurácie</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {insight.cookie_analytics.dokoncene_konfiguracie}
                                </p>
                              </div>
                            </div>

                            {insight.cookie_analytics.top_preferovani_vyrobcovia?.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">Top preferovaní výrobcovia:</p>
                                <div className="flex flex-wrap gap-2">
                                  {insight.cookie_analytics.top_preferovani_vyrobcovia.map((vyrobca, idx) => (
                                    <Badge key={idx} className="bg-cyan-100 text-cyan-800">
                                      {vyrobca}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {insight.cookie_analytics.suvisiace_prezerane_domy?.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2">Súvisiace prezerané domy:</p>
                                <div className="flex flex-wrap gap-2">
                                  {insight.cookie_analytics.suvisiace_prezerane_domy.map((dom, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {dom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-semibold mb-2">Cenové preferencie používateľov:</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white p-2 rounded text-xs">
                                  Do 50k: <span className="font-bold">{insight.cookie_analytics.cenove_preferencie?.do_50k || 0}</span>
                                </div>
                                <div className="bg-white p-2 rounded text-xs">
                                  50-100k: <span className="font-bold">{insight.cookie_analytics.cenove_preferencie?.['50k_100k'] || 0}</span>
                                </div>
                                <div className="bg-white p-2 rounded text-xs">
                                  100-150k: <span className="font-bold">{insight.cookie_analytics.cenove_preferencie?.['100k_150k'] || 0}</span>
                                </div>
                                <div className="bg-white p-2 rounded text-xs">
                                  Nad 150k: <span className="font-bold">{insight.cookie_analytics.cenove_preferencie?.nad_150k || 0}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            AI Súhrn odporúčaní
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {insight.sumar_odporucani || 'Generujem...'}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Zariadenia */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            Zariadenia a platformy
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <Monitor className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                              <p className="text-2xl font-bold">{insight.zariadenia_a_platforma?.desktop || 0}%</p>
                              <p className="text-xs text-gray-600">Desktop</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <Smartphone className="w-6 h-6 mx-auto mb-2 text-green-600" />
                              <p className="text-2xl font-bold">{insight.zariadenia_a_platforma?.mobile || 0}%</p>
                              <p className="text-xs text-gray-600">Mobile</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <Smartphone className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                              <p className="text-2xl font-bold">{insight.zariadenia_a_platforma?.tablet || 0}%</p>
                              <p className="text-xs text-gray-600">Tablet</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">Odporúčané platformy:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.zariadenia_a_platforma?.odporucane_platformy?.map((platform, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-800">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Geografia */}
                    <TabsContent value="geo" className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Krajiny */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Top krajiny
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {insight.geograficke_cielenie?.top_krajiny?.map((krajina, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm">{krajina.krajina}</span>
                                <Badge variant="outline">{krajina.percento}%</Badge>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Regióny */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Top regióny
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {insight.geograficke_cielenie?.top_regiony?.map((region, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm">{region.region}</span>
                                <Badge variant="outline">{region.percento}%</Badge>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Mestá */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Top mestá
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {insight.geograficke_cielenie?.top_mesta?.map((mesto, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm">{mesto.mesto}</span>
                                <Badge variant="outline">{mesto.percento}%</Badge>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Kľúčové slová */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">🔑 Kľúčové slová pre cielenie</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {insight.klucove_slova?.map((slovo, idx) => (
                              <Badge key={idx} className="bg-purple-100 text-purple-800">
                                {slovo}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Konkurencia */}
                    <TabsContent value="konkurencia" className="space-y-4">
                      <CompetitorAnalysisSection konkurencnaAnalyza={insight.konkurencna_analyza} />
                    </TabsContent>

                    {/* Konfigurátor */}
                    <TabsContent value="konfig" className="space-y-4">
                      {/* Fasády */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">🏠 Populárne fasády</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {insight.konfigurator_preferencie?.popularne_fasady?.map((fasada, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm">{fasada.typ}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{fasada.pocet}x</span>
                                <Badge variant="outline">{fasada.percento}%</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Interiéry */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">🎨 Populárne interiéry</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {insight.konfigurator_preferencie?.popularne_interiery?.map((interier, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm">{interier.typ}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{interier.pocet}x</span>
                                <Badge variant="outline">{interier.percento}%</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Doplnky */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">⚡ Populárne doplnky</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {insight.konfigurator_preferencie?.popularne_doplnky?.map((doplnok, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm">{doplnok.nazov}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{doplnok.pocet}x</span>
                                <Badge variant="outline">{doplnok.percento}%</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Cenové rozloženie */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Cenové rozloženie
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Do 50 000 €</span>
                              <Badge>{insight.konfigurator_preferencie?.cenove_rozlozenie?.do_50k || 0}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">50 000 - 100 000 €</span>
                              <Badge>{insight.konfigurator_preferencie?.cenove_rozlozenie?.["50k_100k"] || 0}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">100 000 - 150 000 €</span>
                              <Badge>{insight.konfigurator_preferencie?.cenove_rozlozenie?.["100k_150k"] || 0}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Nad 150 000 €</span>
                              <Badge>{insight.konfigurator_preferencie?.cenove_rozlozenie?.nad_150k || 0}</Badge>
                            </div>
                            <div className="pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Priemerná cena:</span>
                                <Badge className="bg-green-100 text-green-800">
                                  {(insight.konfigurator_preferencie?.priemerna_koncova_cena || 0).toLocaleString('sk-SK')} €
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Kampane */}
                    <TabsContent value="kampane" className="space-y-4">
                      {/* Kreatívne varianty pre typy cieľovej skupiny */}
                        {insight.behavioralna_segmentacia?.ai_predikcia_konverzie?.kreativne_varianty_pre_typy?.length > 0 && (
                          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-pink-600" />
                                🎨 Kreatívne varianty pre Facebook/Instagram podľa typu cieľovej skupiny
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {insight.behavioralna_segmentacia.ai_predikcia_konverzie.kreativne_varianty_pre_typy.map((skupina, idx) => (
                                <div key={`skupina-${insight.id}-${idx}`} className="bg-white p-4 rounded-lg border-2 border-pink-300">
                                  <h4 className="font-bold text-lg mb-3 text-pink-900">
                                    👥 {skupina.typ_skupiny}
                                  </h4>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    {skupina.varianty?.map((varianta, vIdx) => (
                                      <Card key={`varianta-${insight.id}-${idx}-${vIdx}`} className="bg-gradient-to-br from-white to-pink-50">
                                      <CardContent className="p-3">
                                        <Badge className="mb-2 bg-pink-600 text-white">
                                          Varianta {vIdx + 1}
                                        </Badge>
                                        <p className="font-semibold text-sm mb-2">{varianta.nazov}</p>

                                        <div className="space-y-2 text-xs">
                                          <div className="bg-blue-50 p-2 rounded">
                                            <p className="font-semibold text-blue-800 mb-1">🖼️ Obrázok:</p>
                                            <p className="text-gray-700">{varianta.obrazok_popis}</p>
                                          </div>

                                          {varianta.video_koncept && (
                                            <div className="bg-purple-50 p-2 rounded">
                                              <p className="font-semibold text-purple-800 mb-1">🎥 Video:</p>
                                              <p className="text-gray-700">{varianta.video_koncept}</p>
                                            </div>
                                          )}

                                          <div className="bg-green-50 p-2 rounded">
                                            <p className="font-semibold text-green-800 mb-1">📝 Nadpis:</p>
                                            <p className="text-gray-700 font-bold">{varianta.nadpis}</p>
                                          </div>

                                          <div className="bg-yellow-50 p-2 rounded">
                                            <p className="font-semibold text-yellow-800 mb-1">✍️ Text:</p>
                                            <p className="text-gray-700">{varianta.text}</p>
                                          </div>

                                          <div className="bg-orange-50 p-2 rounded">
                                            <p className="font-semibold text-orange-800 mb-1">🔘 CTA:</p>
                                            <p className="text-gray-700 font-bold">{varianta.cta}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Predikcia Konverzie */}
                      {insight.behavioralna_segmentacia?.ai_predikcia_konverzie && (
                        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-indigo-600" />
                              🧠 AI Predikcia Konverzie Používateľov
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-indigo-300">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-lg">Najpravdepodobnejší konvertujúci typ:</h4>
                                <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">
                                  {insight.behavioralna_segmentacia.ai_predikcia_konverzie.najpravdepodobnejsi_typ}
                                </Badge>
                              </div>
                              <div className="bg-indigo-50 p-3 rounded-lg mb-3">
                                <p className="text-sm font-semibold mb-1">Pravdepodobnosť konverzie:</p>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                                    <div 
                                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all"
                                      style={{ width: `${insight.behavioralna_segmentacia.ai_predikcia_konverzie.pravdepodobnost_konverzie}%` }}
                                    />
                                  </div>
                                  <span className="text-xl font-bold text-indigo-700">
                                    {insight.behavioralna_segmentacia.ai_predikcia_konverzie.pravdepodobnost_konverzie}%
                                  </span>
                                </div>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                <p className="text-sm font-semibold mb-1">💡 Dôvod:</p>
                                <p className="text-sm text-gray-700">{insight.behavioralna_segmentacia.ai_predikcia_konverzie.dovod}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm font-semibold mb-1">🎯 Odporúčania pre cielenie:</p>
                                <p className="text-sm text-gray-700">{insight.behavioralna_segmentacia.ai_predikcia_konverzie.odporucania_pre_typ}</p>
                              </div>
                            </div>

                            {/* Detailná analýza všetkých typov */}
                            {insight.behavioralna_segmentacia.ai_predikcia_konverzie.detailna_analyza_typov?.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3">📊 Detailná analýza všetkých typov:</h4>
                                <div className="space-y-2">
                                  {insight.behavioralna_segmentacia.ai_predikcia_konverzie.detailna_analyza_typov.map((typ, idx) => (
                                    <Card key={idx} className="bg-white">
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-bold text-sm">{typ.typ}</h5>
                                          <Badge className="bg-purple-100 text-purple-800">
                                            {typ.konverzna_pravdepodobnost}% konverzia
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">
                                          <span className="font-semibold">Charakteristiky:</span> {typ.charakteristiky}
                                        </p>
                                        <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded">
                                          <span className="font-semibold">Ako cieliť:</span> {typ.ako_cielit}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Optimálne Rozdelenie Budgetu */}
                      {insight.roi_predikcia?.optimalne_rozdelenie_budgetu && (
                        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                              💰 AI Optimalizácia Budgetu
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-emerald-300">
                              <h4 className="font-bold mb-3">Odporúčané rozdelenie pre maximálne ROI:</h4>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <Facebook className="w-5 h-5 text-blue-600" />
                                    <Instagram className="w-5 h-5 text-pink-600" />
                                  </div>
                                  <p className="text-3xl font-bold text-blue-700">
                                    {insight.roi_predikcia.optimalne_rozdelenie_budgetu.facebook_percent}%
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">Facebook / Instagram</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <Search className="w-5 h-5 text-green-600" />
                                  </div>
                                  <p className="text-3xl font-bold text-green-700">
                                    {insight.roi_predikcia.optimalne_rozdelenie_budgetu.google_ads_percent}%
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">Google Ads</p>
                                </div>
                              </div>

                              <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                <p className="text-sm font-semibold mb-1">📝 Zdôvodnenie:</p>
                                <p className="text-sm text-gray-700">
                                  {insight.roi_predikcia.optimalne_rozdelenie_budgetu.zdovodnenie}
                                </p>
                              </div>

                              {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia && (
                                <div className="bg-emerald-50 p-4 rounded-lg">
                                  <p className="font-semibold text-sm mb-3">💡 Príklad s konkrétnymi číslami:</p>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-white p-2 rounded">
                                      <p className="text-xs text-gray-500">Celkový mesačný budget</p>
                                      <p className="font-bold text-lg">
                                        {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.celkovy_budget_mesacne?.toLocaleString()} €
                                      </p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                      <p className="text-xs text-gray-500">Očakávané ROI</p>
                                      <p className="font-bold text-lg text-green-600">
                                        {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.celkove_ocakavane_roi}%
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded">
                                      <p className="text-xs text-gray-500">Facebook budget</p>
                                      <p className="font-bold">
                                        {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.facebook_eur?.toLocaleString()} €
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        → {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.ocakavane_konverzie_facebook} konverzií
                                      </p>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                      <p className="text-xs text-gray-500">Google Ads budget</p>
                                      <p className="font-bold">
                                        {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.google_ads_eur?.toLocaleString()} €
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        → {insight.roi_predikcia.optimalne_rozdelenie_budgetu.priklad_rozdelenia.ocakavane_konverzie_google} konverzií
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {/* Retargeting Stratégie */}
                      {insight.odporucania_kampane?.retargeting_strategie && (
                        <Card className="border-2 border-purple-200 bg-purple-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-purple-600" />
                              🍪 Cookie-Based Retargeting Stratégie
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold mb-1">📍 Facebook Pixel:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.retargeting_strategie.facebook_pixel}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1">🔍 Google Remarketing:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.retargeting_strategie.google_remarketing}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1">👥 Lookalike Audiences:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.retargeting_strategie.lookalike_audiences}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1">🎯 Custom Audiences:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.retargeting_strategie.custom_audiences}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1">📧 Email Retargeting:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.retargeting_strategie.email_retargeting}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Facebook/Instagram */}
                      <Card className="border-2 border-blue-200 bg-blue-50/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <Facebook className="w-5 h-5 text-blue-600" />
                              <Instagram className="w-5 h-5 text-pink-600" />
                            </div>
                            Facebook & Instagram
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold mb-1">🎯 Cieľová skupina:</p>
                            <p className="text-sm text-gray-700">
                              {insight.odporucania_kampane?.facebook_instagram?.cielova_skupina || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">💡 Záujmy:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.odporucania_kampane?.facebook_instagram?.zaujmy?.map((zaujem, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-800">{zaujem}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">📍 Umiestnenia:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.odporucania_kampane?.facebook_instagram?.umiestnenia?.map((umiestnenie, idx) => (
                                <Badge key={idx} variant="outline">{umiestnenie}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">🎨 Formát reklamy:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.odporucania_kampane?.facebook_instagram?.format_reklamy?.map((format, idx) => (
                                <Badge key={idx} className="bg-purple-100 text-purple-800">{format}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm font-semibold mb-1">💰 Odporúčaný budget:</p>
                            <p className="text-sm text-gray-700">
                              {insight.odporucania_kampane?.facebook_instagram?.budget_odporucanie || 'N/A'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Google Ads - Špecifické A/B testy pre texty */}
                      {insight.ab_testing_strategie?.google_ads_texty_testy?.length > 0 && (
                        <Card className="border-2 border-teal-200 bg-teal-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Search className="w-5 h-5 text-teal-600" />
                              🔤 Google Ads - A/B Testy Textov Reklám
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {insight.ab_testing_strategie.google_ads_texty_testy.map((test, idx) => (
                              <Card key={`google-ads-text-${insight.id}-${idx}`} className="bg-white border-2 border-teal-200">
                                <CardContent className="p-4">
                                  <p className="font-bold text-base mb-2">{test.nazov}</p>

                                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-yellow-800 mb-1">🔬 Hypotéza:</p>
                                    <p className="text-sm text-gray-700">{test.hypoteza}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-300">
                                      <p className="font-semibold text-xs mb-2 text-blue-800">Varianta A:</p>
                                      <p className="text-sm font-bold mb-1">{test.varianta_a_nadpis}</p>
                                      <p className="text-xs text-gray-600">{test.varianta_a_popis}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-300">
                                      <p className="font-semibold text-xs mb-2 text-green-800">Varianta B:</p>
                                      <p className="text-sm font-bold mb-1">{test.varianta_b_nadpis}</p>
                                      <p className="text-xs text-gray-600">{test.varianta_b_popis}</p>
                                    </div>
                                  </div>

                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-800 mb-1">✅ Očakávaný výsledok:</p>
                                    <p className="text-sm text-gray-700">{test.ocakavany_vysledok}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Google Ads - Špecifické A/B testy pre kreatívy */}
                      {insight.ab_testing_strategie?.google_ads_kreativy_testy?.length > 0 && (
                        <Card className="border-2 border-emerald-200 bg-emerald-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Search className="w-5 h-5 text-emerald-600" />
                              🎨 Google Ads - A/B Testy Kreatívov
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {insight.ab_testing_strategie.google_ads_kreativy_testy.map((test, idx) => (
                              <Card key={`google-ads-kreativ-${insight.id}-${idx}`} className="bg-white border-2 border-emerald-200">
                                <CardContent className="p-4">
                                  <p className="font-bold text-base mb-2">{test.nazov}</p>

                                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-yellow-800 mb-1">🔬 Hypotéza:</p>
                                    <p className="text-sm text-gray-700">{test.hypoteza}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-300">
                                      <p className="font-semibold text-xs mb-2 text-blue-800">Kreatív A:</p>
                                      <p className="text-sm text-gray-700">{test.varianta_a_popis}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-300">
                                      <p className="font-semibold text-xs mb-2 text-green-800">Kreatív B:</p>
                                      <p className="text-sm text-gray-700">{test.varianta_b_popis}</p>
                                    </div>
                                  </div>

                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-green-800 mb-1">✅ Očakávaný výsledok:</p>
                                    <p className="text-sm text-gray-700">{test.ocakavany_vysledok}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Scaling Odporúčania */}
                      {insight.roi_predikcia?.scaling_odporucania && (
                        <ScalingRecommendations scalingOdporucania={insight.roi_predikcia.scaling_odporucania} />
                      )}

                      {/* Google Ads - Pôvodné kampane */}
                      <Card className="border-2 border-green-200 bg-green-50/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-green-600" />
                            Google Ads
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold mb-1">📊 Typ kampane:</p>
                            <Badge className="bg-green-100 text-green-800">
                              {insight.odporucania_kampane?.google_ads?.typ_kampane || 'N/A'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">🔑 Kľúčové slová:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.odporucania_kampane?.google_ads?.klucove_slova?.map((slovo, idx) => (
                                <Badge key={idx} className="bg-green-100 text-green-800">{slovo}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-2">🌍 Geografické cielenie:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.odporucania_kampane?.google_ads?.geograficke_cielenie?.map((geo, idx) => (
                                <Badge key={idx} variant="outline">{geo}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm font-semibold mb-1">💰 Odporúčaný budget:</p>
                            <p className="text-sm text-gray-700">
                              {insight.odporucania_kampane?.google_ads?.budget_odporucanie || 'N/A'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* TikTok */}
                      {insight.odporucania_kampane?.tiktok && (
                        <Card className="border-2 border-purple-200 bg-purple-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-purple-600" />
                              TikTok
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-sm font-semibold mb-1">Vhodnosť:</p>
                              <Badge className={
                                insight.odporucania_kampane.tiktok.vhodnost?.toLowerCase().includes('vhodný')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }>
                                {insight.odporucania_kampane.tiktok.vhodnost}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1">Dôvod:</p>
                              <p className="text-sm text-gray-700">
                                {insight.odporucania_kampane.tiktok.dovod}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* AI Návod */}
                    <TabsContent value="navod" className="space-y-4">
                      {/* A/B Testing Stratégie s hypotézami */}
                      {insight.ab_testing_strategie && (
                        <Card className="border-2 border-purple-200 bg-purple-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-purple-600" />
                              🧪 A/B Testovacie Stratégie s Hypotézami
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Facebook testy */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Facebook / Instagram testy
                              </h4>
                              <div className="space-y-3">
                                {insight.ab_testing_strategie.facebook_testy?.map((test, idx) => (
                                  <Card key={`fb-test-${insight.id}-${idx}`} className="bg-white border-2 border-blue-200">
                                    <CardContent className="p-4">
                                      <p className="font-bold text-base mb-2">{test.nazov}</p>

                                      {test.hypoteza && (
                                        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                          <p className="text-xs font-semibold text-yellow-800 mb-1">🔬 Hypotéza:</p>
                                          <p className="text-sm text-gray-700">{test.hypoteza}</p>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                          <p className="font-semibold text-xs mb-1">Varianta A (Kontrolná):</p>
                                          <p className="text-sm">{test.varianta_a}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded border border-green-200">
                                          <p className="font-semibold text-xs mb-1">Varianta B (Testovaná):</p>
                                          <p className="text-sm">{test.varianta_b}</p>
                                        </div>
                                      </div>

                                      {test.ocakavany_vysledok && (
                                        <div className="bg-green-50 p-3 rounded-lg mb-2">
                                          <p className="text-xs font-semibold text-green-800 mb-1">✅ Očakávaný výsledok:</p>
                                          <p className="text-sm text-gray-700">{test.ocakavany_vysledok}</p>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600">Budget: <span className="font-bold">{test.odporucany_budget}</span></p>
                                        <div className="flex flex-wrap gap-1">
                                          {test.meratelne_metriky?.map((metrika, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              📊 {metrika}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            {/* Google Ads testy */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-green-600" />
                                Google Ads testy
                              </h4>
                              <div className="space-y-3">
                                {insight.ab_testing_strategie.google_ads_testy?.map((test, idx) => (
                                  <Card key={`ga-test-${insight.id}-${idx}`} className="bg-white border-2 border-green-200">
                                    <CardContent className="p-4">
                                      <p className="font-bold text-base mb-2">{test.nazov}</p>

                                      {test.hypoteza && (
                                        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                                          <p className="text-xs font-semibold text-yellow-800 mb-1">🔬 Hypotéza:</p>
                                          <p className="text-sm text-gray-700">{test.hypoteza}</p>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                          <p className="font-semibold text-xs mb-1">Varianta A (Kontrolná):</p>
                                          <p className="text-sm">{test.varianta_a}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded border border-green-200">
                                          <p className="font-semibold text-xs mb-1">Varianta B (Testovaná):</p>
                                          <p className="text-sm">{test.varianta_b}</p>
                                        </div>
                                      </div>

                                      {test.ocakavany_vysledok && (
                                        <div className="bg-green-50 p-3 rounded-lg mb-2">
                                          <p className="text-xs font-semibold text-green-800 mb-1">✅ Očakávaný výsledok:</p>
                                          <p className="text-sm text-gray-700">{test.ocakavany_vysledok}</p>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600">Budget: <span className="font-bold">{test.odporucany_budget}</span></p>
                                        <div className="flex flex-wrap gap-1">
                                          {test.meratelne_metriky?.map((metrika, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              📊 {metrika}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* ROI Predikcia */}
                      {insight.roi_predikcia && (
                        <Card className="border-2 border-green-200 bg-green-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              ROI Predikcia
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Facebook/Instagram ROI */}
                            {insight.roi_predikcia.facebook_instagram_roi && (
                              <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Facebook className="w-4 h-4 text-blue-600" />
                                  Facebook / Instagram
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-600">Odhadovaný dosah</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.facebook_instagram_roi.odhadovany_dosah?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">Očakávaný CTR</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.facebook_instagram_roi.ocakavany_ctr}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">Konverzie</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.facebook_instagram_roi.predpokladane_konverzie}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">ROI</p>
                                    <p className="text-lg font-bold text-green-600">
                                      {insight.roi_predikcia.facebook_instagram_roi.roi_percento}%
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                  Break-even: {insight.roi_predikcia.facebook_instagram_roi.break_even_cas}
                                </p>
                              </div>
                            )}

                            {/* Google Ads ROI */}
                            {insight.roi_predikcia.google_ads_roi && (
                              <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Search className="w-4 h-4 text-green-600" />
                                  Google Ads
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-600">Odhadovaný dosah</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.google_ads_roi.odhadovany_dosah?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">Očakávaný CTR</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.google_ads_roi.ocakavany_ctr}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">Konverzie</p>
                                    <p className="text-lg font-bold">
                                      {insight.roi_predikcia.google_ads_roi.predpokladane_konverzie}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">ROI</p>
                                    <p className="text-lg font-bold text-green-600">
                                      {insight.roi_predikcia.google_ads_roi.roi_percento}%
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                  Break-even: {insight.roi_predikcia.google_ads_roi.break_even_cas}
                                </p>
                              </div>
                            )}

                            {insight.roi_predikcia.celkova_roi_prognoza && (
                              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg">
                                <p className="text-sm font-semibold mb-1">Celková prognóza:</p>
                                <p className="text-sm text-gray-700">{insight.roi_predikcia.celkova_roi_prognoza}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Kreatívne odporúčania */}
                      {insight.kreativne_odporucania && (
                        <Card className="border-2 border-pink-200 bg-pink-50/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-pink-600" />
                              Kreatívne Odporúčania
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Reklamné obrázky */}
                            {insight.kreativne_odporucania.reklamne_obrazky?.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">🖼️ Reklamné obrázky</h4>
                                <div className="space-y-2">
                                  {insight.kreativne_odporucania.reklamne_obrazky.map((obrazok, idx) => (
                                    <div key={`obrazok-${insight.id}-${idx}`} className="bg-white p-3 rounded-lg">
                                      <p className="font-semibold text-xs text-purple-600 mb-1">{obrazok.typ}</p>
                                      <p className="text-sm">{obrazok.popis}</p>
                                      <p className="text-xs text-gray-600 mt-1">💡 {obrazok.odporucany_obsah}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reklamné texty */}
                            {insight.kreativne_odporucania.reklamne_texty?.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">✍️ Reklamné texty</h4>
                                <div className="space-y-2">
                                  {insight.kreativne_odporucania.reklamne_texty.map((text, idx) => (
                                    <div key={`text-${insight.id}-${idx}`} className="bg-white p-3 rounded-lg">
                                      <Badge className="mb-2 text-xs">{text.platform}</Badge>
                                      <p className="font-bold text-sm mb-1">{text.nadpis}</p>
                                      <p className="text-sm text-gray-700 mb-2">{text.text}</p>
                                      <Button size="sm" className="text-xs h-7">
                                        {text.cta}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Video koncepty */}
                            {insight.kreativne_odporucania.video_koncepty?.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">🎥 Video koncepty</h4>
                                <div className="space-y-2">
                                  {insight.kreativne_odporucania.video_koncepty.map((koncept, idx) => (
                                    <div key={`video-${insight.id}-${idx}`} className="bg-white p-3 rounded-lg text-sm">
                                      {koncept}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Najúspešnejšie prvky */}
                            {insight.kreativne_odporucania.najuspesnejsie_prvky?.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">⭐ Najúspešnejšie prvky</h4>
                                <div className="flex flex-wrap gap-2">
                                  {insight.kreativne_odporucania.najuspesnejsie_prvky.map((prvok, idx) => (
                                    <Badge key={`prvok-${insight.id}-${idx}`} className="bg-yellow-100 text-yellow-800">
                                      {prvok}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Návod */}
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Detailný AI návod pre marketéra
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {insight.ai_generovany_text || 'Generujem detailný návod...'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}