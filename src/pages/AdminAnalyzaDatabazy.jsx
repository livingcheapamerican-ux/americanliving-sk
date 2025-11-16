import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Home, Image, FileText, Filter, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [filterVyrobca, setFilterVyrobca] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterTyp, setFilterTyp] = useState("all");

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

  // Zoskupenie dokumentov podľa výrobcu a modelu
  const dokumentyPodlaVyrobcu = dokumenty.reduce((acc, dok) => {
    const vyrobca = dok.vyrobca || 'Bez výrobcu';
    if (!acc[vyrobca]) acc[vyrobca] = {};
    
    const model = dok.model_domu || 'Bez modelu';
    if (!acc[vyrobca][model]) acc[vyrobca][model] = [];
    acc[vyrobca][model].push(dok);
    return acc;
  }, {});

  const uniqueVyrobcovia = [...new Set(dokumenty.map(d => d.vyrobca).filter(Boolean))];
  const uniqueModels = [...new Set(dokumenty.map(d => d.model_domu).filter(Boolean))];

  // Filtrovanie
  const filteredDokumenty = dokumenty.filter(dok => {
    const vyrobcaMatch = filterVyrobca === "all" || dok.vyrobca === filterVyrobca;
    const modelMatch = filterModel === "all" || dok.model_domu === filterModel;
    const typMatch = filterTyp === "all" || 
      (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
      (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
      (filterTyp === "podorys" && dok.vizualna_analyza?.typ_obsahu === "podorys");
    return vyrobcaMatch && modelMatch && typMatch;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p>Prístup len pre administrátorov</p>
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
            Analýza celej databázy
          </h1>
          <p className="text-gray-600">Podrobný prehľad všetkých dokumentov, fotiek a pôdorysov pre všetkých výrobcov</p>
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

        {/* Filters */}
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
                                
                                {/* Overlay s info */}
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

        {/* Results */}
        {results && (
          <Card className="p-6 mt-8">
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
        )}
      </div>
    </div>
  );
}