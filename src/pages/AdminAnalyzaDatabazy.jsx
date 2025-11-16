
import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Home, Image, FileText, Filter, Building2, PieChart, BarChart3, FolderTree } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [filterVyrobca, setFilterVyrobca] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterTyp, setFilterTyp] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const progressIntervalRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" })
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-all'],
    queryFn: () => base44.entities.Dom.list()
  });

  // Real-time progress tracking
  useEffect(() => {
    if (analyzing) {
      progressIntervalRef.current = setInterval(async () => {
        const analyzovaneDokumenty = await base44.entities.Dokument.filter({ 
          typ: "fotky",
          analyzovaný: true
        });
        setProgress(prev => ({ ...prev, current: analyzovaneDokumenty.length }));
      }, 2000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [analyzing]);

  const handleAnalyzaVsetkych = async () => {
    if (!confirm(`Chcete spustiť podrobnú AI analýzu všetkých ${dokumenty.length} fotiek? Toto môže trvať dlhšie.`)) {
      return;
    }

    setAnalyzing(true);
    setProgress({ current: 0, total: dokumenty.length });

    try {
      const response = await base44.functions.invoke('analyzujVsetkyDokumentyPodrobne', {});
      setResults(response.data);
      queryClient.invalidateQueries({ queryKey: ['dokumenty-all'] });
      alert(`Analýza dokončená! Spracovaných: ${response.data.processed} z ${response.data.total}`);
    } catch (error) {
      alert('Chyba: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Štatistiky a vizualizácie
  const stats = useMemo(() => {
    const analyzovane = dokumenty.filter(d => d.vizualna_analyza);
    
    // Materiály fasád
    const materialy = {};
    analyzovane.forEach(dok => {
      dok.vizualna_analyza?.fasada_materialy?.forEach(mat => {
        materialy[mat] = (materialy[mat] || 0) + 1;
      });
    });

    // Farby fasád
    const farby = {};
    analyzovane.forEach(dok => {
      dok.vizualna_analyza?.fasada_farby?.forEach(farba => {
        farby[farba] = (farby[farba] || 0) + 1;
      });
    });

    // Typ obsahu
    const typyObsahu = {
      exterier: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'exterier').length,
      interier: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'interier').length,
      podorys: analyzovane.filter(d => d.vizualna_analyza?.podorys_info?.je_podorys).length,
      kombinacia: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'kombinacia').length
    };

    // Materiály podľa výrobcu
    const materialyPodlaVyrobcu = {};
    analyzovane.forEach(dok => {
      const vyrobca = dok.vyrobca || 'Neznámy';
      if (!materialyPodlaVyrobcu[vyrobca]) materialyPodlaVyrobcu[vyrobca] = {};
      dok.vizualna_analyza?.fasada_materialy?.forEach(mat => {
        materialyPodlaVyrobcu[vyrobca][mat] = (materialyPodlaVyrobcu[vyrobca][mat] || 0) + 1;
      });
    });

    // Priečinková štruktúra
    const priecinky = {};
    dokumenty.forEach(dok => {
      const cesta = dok.cesta_priecinku || 'Bez priečinka';
      if (!priecinky[cesta]) {
        priecinky[cesta] = {
          celkom: 0,
          vyrobca: dok.vyrobca,
          model: dok.model_domu,
          dokumenty: []
        };
      }
      priecinky[cesta].celkom++;
      priecinky[cesta].dokumenty.push(dok);
    });

    return {
      materialy,
      farby,
      typyObsahu,
      materialyPodlaVyrobcu,
      priecinky
    };
  }, [dokumenty]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  // Data pre grafy
  const materialyData = Object.entries(stats.materialy).map(([name, value]) => ({ name, value }));
  const farbyData = Object.entries(stats.farby).map(([name, value]) => ({ name, value }));
  const typyData = Object.entries(stats.typyObsahu).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));

  // Data pre bar chart - top materiály podľa výrobcov
  const topMaterialyPodlaVyrobcu = useMemo(() => {
    const data = [];
    Object.entries(stats.materialyPodlaVyrobcu).forEach(([vyrobca, mats]) => {
      const topMats = Object.entries(mats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      topMats.forEach(([material, count]) => {
        data.push({ vyrobca, material, count });
      });
    });
    return data;
  }, [stats.materialyPodlaVyrobcu]);

  const uniqueVyrobcovia = [...new Set(dokumenty.map(d => d.vyrobca).filter(Boolean))];
  const uniqueModels = [...new Set(dokumenty.map(d => d.model_domu).filter(Boolean))];

  // Zoskupenie dokumentov podľa výrobcu a modelu
  const dokumentyPodlaVyrobcu = dokumenty.reduce((acc, dok) => {
    const vyrobca = dok.vyrobca || 'Bez výrobcu';
    if (!acc[vyrobca]) acc[vyrobca] = {};
    
    const model = dok.model_domu || 'Bez modelu';
    if (!acc[vyrobca][model]) acc[vyrobca][model] = [];
    acc[vyrobca][model].push(dok);
    return acc;
  }, {});

  const filteredDokumenty = dokumenty.filter(dok => {
    const vyrobcaMatch = filterVyrobca === "all" || dok.vyrobca === filterVyrobca;
    const modelMatch = filterModel === "all" || dok.model_domu === filterModel;
    const typMatch = filterTyp === "all" || 
      (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
      (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
      (filterTyp === "podorys" && dok.vizualna_analyza?.podorys_info?.je_podorys);
    return vyrobcaMatch && modelMatch && typMatch;
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.super_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-2">Prístup len pre administrátorov</p>
          <p className="text-xs text-gray-500">Role: {user?.role || 'none'}, Super Admin: {user?.super_admin ? 'áno' : 'nie'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Analýza celej databázy
          </h1>
          <p className="text-gray-600">Vizuálny prehľad všetkých dokumentov, materiálov a priečinkovej štruktúry</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkom fotiek</p>
                <p className="text-2xl font-bold text-blue-900">{dokumenty.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Analyzované</p>
                <p className="text-2xl font-bold text-green-900">
                  {dokumenty.filter(d => d.vizualna_analyza).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Výrobcovia</p>
                <p className="text-2xl font-bold text-orange-900">{uniqueVyrobcovia.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Modely domov</p>
                <p className="text-2xl font-bold text-purple-900">{uniqueModels.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pôdorysy</p>
                <p className="text-2xl font-bold text-amber-900">
                  {dokumenty.filter(d => d.vizualna_analyza?.podorys_info?.je_podorys).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6 mb-8 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Podrobná AI analýza CELEJ databázy</h2>
              <p className="text-sm text-gray-600">
                Analyzuje všetky fotky pre všetkých výrobcov - materiály fasád, farby, typ obsahu, priraďovanie k domom
              </p>
            </div>
            <Button
              onClick={handleAnalyzaVsetkych}
              disabled={analyzing}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzujem... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  Spustiť analýzu ({dokumenty.length} fotiek)
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="dashboard" className="text-base">
              <PieChart className="w-5 h-5 mr-2" />
              Dashboardy
            </TabsTrigger>
            <TabsTrigger value="priecinky" className="text-base">
              <FolderTree className="w-5 h-5 mr-2" />
              Priečinková štruktúra
            </TabsTrigger>
            <TabsTrigger value="prehled" className="text-base">
              <Image className="w-5 h-5 mr-2" />
              Prehľad fotiek
            </TabsTrigger>
            <TabsTrigger value="vysledky" className="text-base">
              <BarChart3 className="w-5 h-5 mr-2" />
              Výsledky analýzy
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Materiály fasád */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-primary" />
                  Materiály fasád
                </h3>
                {materialyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={materialyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} (${entry.value})`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {materialyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Žiadne analyzované dáta</p>
                )}
              </Card>

              {/* Farby fasád */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-primary" />
                  Farby fasád
                </h3>
                {farbyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={farbyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} (${entry.value})`}
                        outerRadius={100}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {farbyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Žiadne analyzované dáta</p>
                )}
              </Card>

              {/* Typy obsahu */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Rozloženie podľa typu obsahu
                </h3>
                {typyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-12">Žiadne analyzované dáta</p>
                )}
              </Card>

              {/* Top materiály */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  Top materiály
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.materialy)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([material, count]) => (
                      <div key={material} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <span className="font-medium">{material}</span>
                        <Badge variant="outline" className="text-lg px-3">{count}</Badge>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            {/* Materiály podľa výrobcov - tabuľka */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Materiály podľa výrobcov</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-3 font-bold">Výrobca</th>
                      <th className="text-left p-3 font-bold">Top materiály</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.materialyPodlaVyrobcu).map(([vyrobca, mats]) => (
                      <tr key={vyrobca} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{vyrobca}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(mats)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5)
                              .map(([mat, count]) => (
                                <Badge key={mat} variant="outline">
                                  {mat} ({count})
                                </Badge>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Priečinková štruktúra Tab */}
          <TabsContent value="priecinky" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-primary" />
                Štruktúra priečinkov
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.priecinky)
                  .sort((a, b) => b[1].celkom - a[1].celkom)
                  .map(([cesta, info]) => (
                    <Card key={cesta} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FolderTree className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-bold text-lg">{cesta}</p>
                            <div className="flex gap-2 mt-1">
                              {info.vyrobca && (
                                <Badge variant="outline" className="text-xs">
                                  {info.vyrobca}
                                </Badge>
                              )}
                              {info.model && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  {info.model}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="text-lg px-4 py-2">{info.celkom} súborov</Badge>
                      </div>
                      <div className="grid grid-cols-6 gap-2 mt-3">
                        {info.dokumenty.slice(0, 6).map(dok => (
                          <div key={dok.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                            <img src={dok.subor_url} alt={dok.nazov} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {info.celkom > 6 && (
                          <div className="aspect-square rounded-lg bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">+{info.celkom - 6}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>
          </TabsContent>

          {/* Prehľad fotiek Tab */}
          <TabsContent value="prehled" className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterVyrobca}
                  onChange={(e) => setFilterVyrobca(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">Všetci výrobcovia</option>
                  {uniqueVyrobcovia.map(vyrobca => (
                    <option key={vyrobca} value={vyrobca}>{vyrobca}</option>
                  ))}
                </select>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">Všetky modely</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select
                  value={filterTyp}
                  onChange={(e) => setFilterTyp(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">Všetky typy</option>
                  <option value="exterier">Exteriér</option>
                  <option value="interier">Interiér</option>
                  <option value="podorys">Pôdorys</option>
                </select>
              </div>
            </Card>

            {/* Documents by Manufacturer and Model */}
            <div className="space-y-8">
              {Object.entries(dokumentyPodlaVyrobcu).map(([vyrobca, modely]) => {
                if (filterVyrobca !== "all" && filterVyrobca !== vyrobca) return null;
                
                return (
                  <motion.div
                    key={vyrobca}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl font-bold">{vyrobca}</h2>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {Object.values(modely).reduce((sum, docs) => sum + docs.length, 0)} fotiek
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-6 ml-8">
                      {Object.entries(modely).map(([model, docs]) => {
                        if (filterModel !== "all" && filterModel !== model) return null;
                        
                        const filteredDocs = docs.filter(dok => {
                          const typMatch = filterTyp === "all" || 
                            (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
                            (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
                            (filterTyp === "podorys" && dok.vizualna_analyza?.podorys_info?.je_podorys);
                          return typMatch;
                        });

                        if (filteredDocs.length === 0) return null;

                        return (
                          <Card key={model} className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Home className="w-6 h-6 text-blue-600" />
                              <h3 className="text-xl font-bold">{model}</h3>
                              <Badge variant="outline">{filteredDocs.length} fotiek</Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {filteredDocs.map(dok => (
                                <div key={dok.id} className="group relative">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                                    <img
                                      src={dok.subor_url}
                                      alt={dok.nazov}
                                      className="w-full h-full object-cover"
                                    />
                                    
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all p-2 text-white text-xs flex flex-col justify-between overflow-y-auto">
                                      <div>
                                        <p className="font-semibold truncate">{dok.nazov}</p>
                                        {dok.vizualna_analyza && (
                                          <>
                                            <Badge className="mt-1 text-xs bg-blue-500">
                                              {dok.vizualna_analyza.typ_obsahu}
                                            </Badge>
                                            {dok.vizualna_analyza.fasada_materialy?.length > 0 && (
                                              <div className="mt-2">
                                                <p className="font-semibold">Materiály:</p>
                                                {dok.vizualna_analyza.fasada_materialy.slice(0, 3).map((mat, i) => (
                                                  <p key={i} className="text-xs">• {mat}</p>
                                                ))}
                                              </div>
                                            )}
                                            {dok.vizualna_analyza.fasada_farby?.length > 0 && (
                                              <div className="mt-1">
                                                <p className="font-semibold">Farby:</p>
                                                <p>{dok.vizualna_analyza.fasada_farby.slice(0, 2).join(', ')}</p>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                      
                                      {!dok.vizualna_analyza && (
                                        <Badge variant="destructive" className="text-xs">
                                          Neanalyzované
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Výsledky Tab */}
          <TabsContent value="vysledky">
            {results ? (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Výsledky analýzy</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-4 bg-green-50">
                    <p className="text-sm text-green-700">Úspešne spracované</p>
                    <p className="text-2xl font-bold text-green-900">
                      {results.results?.filter(r => r.status === 'success').length || 0}
                    </p>
                  </Card>
                  <Card className="p-4 bg-red-50">
                    <p className="text-sm text-red-700">Chyby</p>
                    <p className="text-2xl font-bold text-red-900">
                      {results.results?.filter(r => r.status === 'error').length || 0}
                    </p>
                  </Card>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.results?.map((result, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-600">{result.vyrobca}</span>
                      <span className="text-sm font-medium">{result.nazov}</span>
                      {result.povodny_model !== result.novy_model && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {result.povodny_model} → {result.novy_model}
                        </Badge>
                      )}
                      {result.status === 'success' && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {result.typ}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Zatiaľ nebola spustená žiadna analýza</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
