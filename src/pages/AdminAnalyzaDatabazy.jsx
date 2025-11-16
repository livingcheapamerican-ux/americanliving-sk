import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Home, Image, FileText, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [filterModel, setFilterModel] = useState("all");
  const [filterTyp, setFilterTyp] = useState("all");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading } = useQuery({
    queryKey: ['dokumenty-jak'],
    queryFn: () => base44.entities.Dokument.filter({ vyrobca: "JAK Modules", typ: "fotky" })
  });

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-jak'],
    queryFn: () => base44.entities.Dom.filter({ vyrobca: "JAK Modules" })
  });

  const handleAnalyzaVsetkych = async () => {
    setAnalyzing(true);
    setProgress({ current: 0, total: dokumenty.length });

    try {
      const response = await base44.functions.invoke('analyzujVsetkyDokumentyPodrobne', {});
      setResults(response.data);
      queryClient.invalidateQueries({ queryKey: ['dokumenty-jak'] });
    } catch (error) {
      alert('Chyba: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Zoskupenie dokumentov podľa modelu
  const dokumentyPodlaModelu = dokumenty.reduce((acc, dok) => {
    const model = dok.model_domu || 'Bez modelu';
    if (!acc[model]) acc[model] = [];
    acc[model].push(dok);
    return acc;
  }, {});

  // Filtrovanie
  const filteredDokumenty = dokumenty.filter(dok => {
    const modelMatch = filterModel === "all" || dok.model_domu === filterModel;
    const typMatch = filterTyp === "all" || 
      (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
      (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
      (filterTyp === "podorys" && dok.vizualna_analyza?.typ_obsahu === "podorys");
    return modelMatch && typMatch;
  });

  const uniqueModels = [...new Set(dokumenty.map(d => d.model_domu).filter(Boolean))];

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
            Analýza databázy JAK Modules
          </h1>
          <p className="text-gray-600">Podrobný prehľad všetkých dokumentov, fotiek a pôdorysov</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Podrobná AI analýza všetkých fotiek</h2>
              <p className="text-sm text-gray-600">
                Spustí detailnú analýzu každej fotky - materiály, farby, typ obsahu, priraďovanie k domom
              </p>
            </div>
            <Button
              onClick={handleAnalyzaVsetkych}
              disabled={analyzing}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzujem... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  Spustiť podrobnú analýzu ({dokumenty.length} fotiek)
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
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

        {/* Documents by Model */}
        <div className="space-y-6">
          {Object.entries(dokumentyPodlaModelu).map(([model, docs]) => {
            if (filterModel !== "all" && filterModel !== model) return null;
            
            const filteredDocs = docs.filter(dok => {
              const typMatch = filterTyp === "all" || 
                (filterTyp === "exterier" && dok.vizualna_analyza?.typ_obsahu === "exterier") ||
                (filterTyp === "interier" && dok.vizualna_analyza?.typ_obsahu === "interier") ||
                (filterTyp === "podorys" && dok.vizualna_analyza?.typ_obsahu === "podorys");
              return typMatch;
            });

            if (filteredDocs.length === 0) return null;

            return (
              <motion.div
                key={model}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">{model}</h2>
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
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all p-2 text-white text-xs flex flex-col justify-between">
                            <div>
                              <p className="font-semibold truncate">{dok.nazov}</p>
                              {dok.vizualna_analyza && (
                                <>
                                  <Badge className="mt-1 text-xs">
                                    {dok.vizualna_analyza.typ_obsahu}
                                  </Badge>
                                  {dok.vizualna_analyza.fasada_materialy?.length > 0 && (
                                    <p className="mt-1">
                                      {dok.vizualna_analyza.fasada_materialy.slice(0, 2).join(', ')}
                                    </p>
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
              </motion.div>
            );
          })}
        </div>

        {/* Results */}
        {results && (
          <Card className="p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">Výsledky analýzy</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.results?.map((result, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">{result.nazov}</span>
                  {result.povodny_model !== result.novy_model && (
                    <Badge variant="outline" className="ml-auto">
                      {result.povodny_model} → {result.novy_model}
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