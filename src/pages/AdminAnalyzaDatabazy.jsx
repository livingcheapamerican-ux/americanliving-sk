import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Home, Image, FileText, Filter, Building2, BarChart3, PieChart, FolderTree } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [filterVyrobca, setFilterVyrobca] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterTyp, setFilterTyp] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
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

  // Štatistiky materiálov
  const materialStats = useMemo(() => {
    const stats = {};
    dokumenty.forEach(dok => {
      if (dok.vizualna_analyza?.fasada_materialy) {
        dok.vizualna_analyza.fasada_materialy.forEach(material => {
          stats[material] = (stats[material] || 0) + 1;
        });
      }
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dokumenty]);

  // Štatistiky farieb
  const colorStats = useMemo(() => {
    const stats = {};
    dokumenty.forEach(dok => {
      if (dok.vizualna_analyza?.fasada_farby) {
        dok.vizualna_analyza.fasada_farby.forEach(farba => {
          stats[farba] = (stats[farba] || 0) + 1;
        });
      }
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dokumenty]);

  // Štatistiky typov obsahu
  const typObsahuStats = useMemo(() => {
    const stats = { exterier: 0, interier: 0, podorys: 0, kombinacia: 0, neanalyzovane: 0 };
    dokumenty.forEach(dok => {
      const typ = dok.vizualna_analyza?.typ_obsahu;
      if (typ) {
        stats[typ] = (stats[typ] || 0) + 1;
      } else {
        stats.neanalyzovane += 1;
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [dokumenty]);

  // Materiály podľa výrobcov
  const materialyPodlaVyrobcov = useMemo(() => {
    const stats = {};
    dokumenty.forEach(dok => {
      const vyrobca = dok.vyrobca || 'Neznámy';
      if (!stats[vyrobca]) stats[vyrobca] = {};
      
      if (dok.vizualna_analyza?.fasada_materialy) {
        dok.vizualna_analyza.fasada_materialy.forEach(material => {
          stats[vyrobca][material] = (stats[vyrobca][material] || 0) + 1;
        });
      }
    });

    // Transformuj na formát pre graf
    const result = [];
    const allMaterials = new Set();
    Object.values(stats).forEach(vyrobcaStats => {
      Object.keys(vyrobcaStats).forEach(mat => allMaterials.add(mat));
    });

    Object.entries(stats).forEach(([vyrobca, materials]) => {
      const entry = { vyrobca };
      Array.from(allMaterials).forEach(mat => {
        entry[mat] = materials[mat] || 0;
      });
      result.push(entry);
    });

    return { data: result, materials: Array.from(allMaterials) };
  }, [dokumenty]);

  // Stromová štruktúra priečinkov
  const folderStructure = useMemo(() => {
    const structure = {};
    dokumenty.forEach(dok => {
      const vyrobca = dok.vyrobca || 'Bez výrobcu';
      const model = dok.model_domu || 'Bez modelu';
      const podpriecinok = dok.podpriecinok || 'Hlavný priečinok';
      
      if (!structure[vyrobca]) structure[vyrobca] = {};
      if (!structure[vyrobca][model]) structure[vyrobca][model] = {};
      if (!structure[vyrobca][model][podpriecinok]) structure[vyrobca][model][podpriecinok] = [];
      
      structure[vyrobca][model][podpriecinok].push(dok);
    });
    return structure;
  }, [dokumenty]);

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

  const uniqueVyrobcovia = [...new Set(dokumenty.map(d => d.vyrobca).filter(Boolean))];
  const uniqueModels = [...new Set(dokumenty.map(d => d.model_domu).filter(Boolean))];

  if (!user || !user.super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p>Prístup len pre super administrátorov</p>
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
            📊 Super Admin Dashboard
          </h1>
          <p className="text-gray-600">Kompletný prehľad databázy s AI analýzou a vizualizáciami</p>
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
                  Analyzujem...
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="materialy" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Materiály
            </TabsTrigger>
            <TabsTrigger value="struktura" className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              Štruktúra priečinkov
            </TabsTrigger>
            <TabsTrigger value="galeria" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Galéria
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Typy obsahu */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Rozloženie typov obsahu</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={typObsahuStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typObsahuStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </Card>

              {/* Top materiály */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Top 10 materiálov fasád</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Farby */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Najčastejšie farby</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={colorStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Materiály podľa výrobcov */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Materiály podľa výrobcov</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialyPodlaVyrobcov.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vyrobca" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {materialyPodlaVyrobcov.materials.slice(0, 5).map((material, index) => (
                      <Bar key={material} dataKey={material} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Materiály Tab */}
          <TabsContent value="materialy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Všetky materiály fasád</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {materialStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{stat.name}</span>
                      <Badge variant="outline">{stat.value} použití</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Všetky farby</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {colorStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{stat.name}</span>
                      <Badge variant="outline">{stat.value} použití</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Štruktúra priečinkov Tab */}
          <TabsContent value="struktura" className="space-y-4">
            {Object.entries(folderStructure).map(([vyrobca, modely]) => (
              <Card key={vyrobca} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">{vyrobca}</h3>
                  <Badge variant="outline">
                    {Object.values(modely).reduce((sum, model) => 
                      sum + Object.values(model).reduce((s, docs) => s + docs.length, 0), 0
                    )} súborov
                  </Badge>
                </div>
                
                <div className="ml-8 space-y-3">
                  {Object.entries(modely).map(([model, podpriecinky]) => (
                    <div key={model} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">{model}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Object.values(podpriecinky).reduce((s, docs) => s + docs.length, 0)} súborov
                        </Badge>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        {Object.entries(podpriecinky).map(([podpriecinok, docs]) => (
                          <div key={podpriecinok} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{podpriecinok}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{docs.length}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Galéria Tab */}
          <TabsContent value="galeria">
            <Card className="p-4 mb-6">
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

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dokumenty
                .filter(dok => {
                  const vyrobcaMatch = filterVyrobca === "all" || dok.vyrobca === filterVyrobca;
                  const modelMatch = filterModel === "all" || dok.model_domu === filterModel;
                  const typMatch = filterTyp === "all" || 
                    (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
                    (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
                    (filterTyp === "podorys" && dok.vizualna_analyza?.podorys_info?.je_podorys);
                  return vyrobcaMatch && modelMatch && typMatch;
                })
                .map(dok => (
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
                          <p className="text-xs text-gray-300">{dok.vyrobca}</p>
                          <p className="text-xs text-gray-300">{dok.model_domu}</p>
                          {dok.vizualna_analyza && (
                            <>
                              <Badge className="mt-1 text-xs bg-blue-500">
                                {dok.vizualna_analyza.typ_obsahu}
                              </Badge>
                              {dok.vizualna_analyza.fasada_materialy?.length > 0 && (
                                <div className="mt-2">
                                  <p className="font-semibold">Materiály:</p>
                                  {dok.vizualna_analyza.fasada_materialy.slice(0, 2).map((mat, i) => (
                                    <p key={i} className="text-xs">• {mat}</p>
                                  ))}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}