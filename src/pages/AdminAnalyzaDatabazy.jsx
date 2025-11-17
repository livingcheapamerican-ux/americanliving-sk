import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Image, FileText, StopCircle, FolderSync } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentTableWithBulkActions from "../components/admin/DocumentTableWithBulkActions";
import DetailedAnalysisResults from "../components/admin/DetailedAnalysisResults";
import ImageComparisonView from "../components/admin/ImageComparisonView";
import AdvancedFilters from "../components/admin/AdvancedFilters";
import AnalysisStatistics from "../components/admin/AnalysisStatistics";
import AIComparisonTool from "../components/admin/AIComparisonTool";
import ReorganizationLogPanel from "../components/admin/ReorganizationLogPanel";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [filteredDokumenty, setFilteredDokumenty] = useState([]);
  const [results, setResults] = useState(null);
  const [autoStarted, setAutoStarted] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading, refetch } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" }),
    refetchInterval: analyzing ? 3000 : 10000,
    staleTime: 0
  });

  useEffect(() => {
    setFilteredDokumenty(dokumenty);
  }, [dokumenty]);

  const analyzaMutation = useMutation({
    mutationFn: (action) => base44.functions.invoke('backgroundAnalyzaVsetko', { action }),
    onSuccess: (response) => {
      if (response.data.success) {
        setResults(response.data);
        setAnalyzing(false);
        queryClient.invalidateQueries({ queryKey: ['dokumenty-all'] });
      }
    },
    onError: () => {
      setAnalyzing(false);
    }
  });

  // Automatické spustenie analýzy pri načítaní stránky
  useEffect(() => {
    if (!isLoading && dokumenty.length > 0 && !autoStarted && !analyzing) {
      const neanalyzovane = dokumenty.filter(d => !d.podrobna_analyza_datum);
      
      if (neanalyzovane.length > 0) {
        console.log(`🚀 Automaticky spúšťam analýzu ${neanalyzovane.length} fotiek`);
        setAnalyzing(true);
        setAutoStarted(true);
        analyzaMutation.mutate('start');
      }
    }
  }, [dokumenty, isLoading, autoStarted, analyzing]);

  const handleStopAnalyza = () => {
    if (confirm('Zastaviť analýzu?')) {
      analyzaMutation.mutate('stop');
      setAnalyzing(false);
    }
  };

  const analyzovaneCount = dokumenty.filter(d => d.ai_generovany_popis).length;
  const podrobneAnalyzovaneCount = dokumenty.filter(d => d.podrobna_analyza_datum).length;
  const neanalyzovaneCount = dokumenty.filter(d => !d.podrobna_analyza_datum).length;
  const reorganizovaneCount = dokumenty.filter(d => d.reorganizovany).length;

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
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-2 font-bold">Prístup len pre administrátorov</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Automatická analýza databázy
          </h1>
          <p className="text-gray-600">Systém automaticky analyzuje všetky fotky na pozadí</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkom</p>
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
                <p className="text-2xl font-bold text-green-900">{analyzovaneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dokončené</p>
                <p className="text-2xl font-bold text-purple-900">{podrobneAnalyzovaneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Zostáva</p>
                <p className="text-2xl font-bold text-orange-900">{neanalyzovaneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                <FolderSync className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reorganizované</p>
                <p className="text-2xl font-bold text-cyan-900">{reorganizovaneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Percento</p>
                <p className="text-2xl font-bold text-amber-900">
                  {dokumenty.length > 0 ? Math.round((podrobneAnalyzovaneCount / dokumenty.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <AdvancedFilters dokumenty={dokumenty} onFilterChange={setFilteredDokumenty} />
        </div>

        {/* Status Panel */}
        {analyzing && (
          <Card className="p-6 mb-8 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <div>
                  <h2 className="text-xl font-bold text-blue-900">🤖 Analýza prebieha automaticky</h2>
                  <p className="text-sm text-gray-600">Zostáva: {neanalyzovaneCount} fotiek</p>
                  <p className="text-xs text-gray-500 mt-1">Dáta sa aktualizujú každé 3 sekundy</p>
                </div>
              </div>
              <Button
                onClick={handleStopAnalyza}
                variant="destructive"
                size="lg"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Zastaviť
              </Button>
            </div>
          </Card>
        )}

        {/* Reorganization Log Panel */}
        {!analyzing && podrobneAnalyzovaneCount > 0 && (
          <div className="mb-8">
            <ReorganizationLogPanel />
          </div>
        )}

        <Tabs defaultValue="statistics" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="statistics">Štatistiky</TabsTrigger>
            <TabsTrigger value="ai-tools">AI nástroje</TabsTrigger>
            <TabsTrigger value="results">Výsledky</TabsTrigger>
            <TabsTrigger value="bulk">Hromadné akcie</TabsTrigger>
            <TabsTrigger value="comparison">Porovnanie</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <AnalysisStatistics dokumenty={filteredDokumenty} />
          </TabsContent>

          <TabsContent value="ai-tools">
            <AIComparisonTool dokumenty={dokumenty} />
          </TabsContent>

          <TabsContent value="results">
            <DetailedAnalysisResults results={results} dokumenty={filteredDokumenty} />
          </TabsContent>

          <TabsContent value="bulk">
            <DocumentTableWithBulkActions dokumenty={filteredDokumenty} onRefresh={refetch} />
          </TabsContent>

          <TabsContent value="comparison">
            <ImageComparisonView dokumenty={dokumenty} />
          </TabsContent>
        </Tabs>

        {results && !analyzing && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">✅ Analýza dokončená</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Celkom</p>
                <p className="text-3xl font-bold text-blue-600">{results.total}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Úspešné</p>
                <p className="text-3xl font-bold text-green-600">{results.processed}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Preskočené</p>
                <p className="text-3xl font-bold text-yellow-600">{results.skipped || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Chyby</p>
                <p className="text-3xl font-bold text-red-600">{results.failed || 0}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}