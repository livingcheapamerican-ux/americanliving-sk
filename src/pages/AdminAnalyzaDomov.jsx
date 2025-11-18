import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, Pause, RotateCcw, Loader2, CheckCircle, XCircle, 
  AlertCircle, Home, Eye, Brain, Filter, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ANALYSIS_STATE_KEY = 'house_analysis_state_v2';
const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

export default function AdminAnalyzaDomov() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [docsToAnalyze, setDocsToAnalyze] = useState([]);
  const [analyzedDocs, setAnalyzedDocs] = useState([]);
  const [failedDocs, setFailedDocs] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);
  
  // Filtre
  const [selectedVyrobca, setSelectedVyrobca] = useState('all');
  const [selectedModel, setSelectedModel] = useState('');
  const [onlyUnanalyzed, setOnlyUnanalyzed] = useState(true);

  const workerRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allPhotos = [] } = useQuery({
    queryKey: ['all-photos'],
    queryFn: () => base44.entities.Dokument.filter({ typ: 'fotky' }, '-created_date', 1000)
  });

  // Načítaj uložený stav pri načítaní stránky
  useEffect(() => {
    const savedState = localStorage.getItem(ANALYSIS_STATE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.timestamp && Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          if (state.docsToAnalyze?.length > 0) {
            setDocsToAnalyze(state.docsToAnalyze);
            setCurrentIndex(state.currentIndex || 0);
            setTotalDocs(state.totalDocs || 0);
            setAnalyzedDocs(state.analyzedDocs || []);
            setFailedDocs(state.failedDocs || []);
            
            toast.info('Obnovený nedokončený proces analýzy');
          }
        } else {
          localStorage.removeItem(ANALYSIS_STATE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(ANALYSIS_STATE_KEY);
      }
    }
  }, []);

  // Ulož stav pri každej zmene
  useEffect(() => {
    if (docsToAnalyze.length > 0) {
      const state = {
        docsToAnalyze,
        currentIndex,
        totalDocs,
        analyzedDocs,
        failedDocs,
        timestamp: Date.now()
      };
      localStorage.setItem(ANALYSIS_STATE_KEY, JSON.stringify(state));
    }
  }, [docsToAnalyze, currentIndex, totalDocs, analyzedDocs, failedDocs]);

  const handleStartAnalysis = async () => {
    try {
      // Priprav filtre
      const filters = {
        vyrobca: selectedVyrobca,
        model_domu: selectedModel || undefined,
        only_unanalyzed: onlyUnanalyzed
      };

      const response = await base44.functions.invoke('analyzujDomyBatch', {
        action: 'start',
        filters
      });

      if (response.data.total === 0) {
        toast.error('Žiadne fotky na analýzu podľa zadaných filtrov');
        return;
      }

      setDocsToAnalyze(response.data.documents);
      setTotalDocs(response.data.total);
      setCurrentIndex(0);
      setAnalyzedDocs([]);
      setFailedDocs([]);
      setIsAnalyzing(true);
      setIsPaused(false);
      
      toast.success(`Nájdených ${response.data.total} fotiek na analýzu`);
      
    } catch (error) {
      toast.error('Chyba pri príprave analýzy: ' + error.message);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    if (workerRef.current) {
      workerRef.current.paused = true;
    }
    toast.info('Analýza pozastavená');
  };

  const handleResume = () => {
    setIsPaused(false);
    if (workerRef.current) {
      workerRef.current.paused = false;
    }
    toast.success('Analýza pokračuje');
  };

  const handleReset = () => {
    if (isAnalyzing && !confirm('Naozaj chcete zrušiť prebiehajúcu analýzu?')) {
      return;
    }
    
    setIsAnalyzing(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setTotalDocs(0);
    setDocsToAnalyze([]);
    setAnalyzedDocs([]);
    setFailedDocs([]);
    setCurrentDoc(null);
    
    if (workerRef.current) {
      workerRef.current.cancel = true;
    }
    
    localStorage.removeItem(ANALYSIS_STATE_KEY);
    toast.success('Analýza resetovaná');
  };

  // Automatický analyzer worker
  useEffect(() => {
    if (!isAnalyzing || isPaused || currentIndex >= docsToAnalyze.length) {
      if (currentIndex >= docsToAnalyze.length && docsToAnalyze.length > 0 && isAnalyzing) {
        setIsAnalyzing(false);
        toast.success(`Analýza dokončená! Úspešných: ${analyzedDocs.length}, Chybných: ${failedDocs.length}`);
        localStorage.removeItem(ANALYSIS_STATE_KEY);
      }
      return;
    }

    workerRef.current = { cancel: false, paused: false };

    const analyzeNext = async () => {
      if (workerRef.current?.cancel || workerRef.current?.paused) return;

      const doc = docsToAnalyze[currentIndex];
      setCurrentDoc(doc);

      try {
        await base44.functions.invoke('analyzujDokument', {
          document_id: doc.id
        });

        setAnalyzedDocs(prev => [...prev, { ...doc, status: 'success' }]);
        queryClient.invalidateQueries({ queryKey: ['all-photos'] });
        
      } catch (error) {
        console.error('Analysis error:', error);
        setFailedDocs(prev => [...prev, { 
          ...doc, 
          status: 'failed', 
          error: error.message 
        }]);
      }

      // Delay 2 sekundy medzi analýzami
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Posun na ďalší
      setCurrentIndex(prev => prev + 1);
    };

    analyzeNext();

  }, [isAnalyzing, isPaused, currentIndex, docsToAnalyze]);

  const uniqueModels = [...new Set(
    allPhotos
      .filter(p => !selectedVyrobca || selectedVyrobca === 'all' || p.vyrobca === selectedVyrobca)
      .map(p => p.model_domu)
      .filter(Boolean)
  )].sort();

  const progress = totalDocs > 0 ? Math.round((currentIndex / totalDocs) * 100) : 0;

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Prístup zamietnutý</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Analýza domov
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Automatická vizuálna analýza fotiek s pokračovaním po prerušení
                </p>
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-3">
                <img src={KONFIGA_LOGO_URL} alt="Konfiga.eu" className="h-10 w-auto" />
                <div className="text-sm">
                  <p className="font-semibold text-purple-900 mb-1">
                    🧠 AI analýza s automatickým pokračovaním
                  </p>
                  <p className="text-purple-800">
                    Systém analyzuje fotky, automaticky ukladá progress a pokračuje po obnovení stránky
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtre */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-lg">Filtre</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Výrobca</Label>
                <Select value={selectedVyrobca} onValueChange={setSelectedVyrobca} disabled={isAnalyzing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetci výrobcovia</SelectItem>
                    <SelectItem value="JAK Modules">JAK Modules</SelectItem>
                    <SelectItem value="Ticab house">Ticab house</SelectItem>
                    <SelectItem value="Prosto House">Prosto House</SelectItem>
                    <SelectItem value="Domki z Gór">Domki z Gór</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Model domu</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isAnalyzing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Všetky modely" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Všetky modely</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={onlyUnanalyzed}
                  onCheckedChange={setOnlyUnanalyzed}
                  disabled={isAnalyzing}
                />
                <Label className="font-medium cursor-pointer">
                  Len neanalyzované
                </Label>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Spustiť analýzu
                </Button>
              </div>
            </div>
          </Card>

          {/* Progress Panel */}
          {isAnalyzing && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 mb-6 border-2 border-purple-500 bg-gradient-to-br from-white to-purple-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analýza prebieha
                    </h3>
                    <div className="flex gap-2">
                      {!isPaused ? (
                        <Button onClick={handlePause} variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pozastaviť
                        </Button>
                      ) : (
                        <Button onClick={handleResume} className="bg-green-600 hover:bg-green-700" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Pokračovať
                        </Button>
                      )}
                      <Button onClick={handleReset} variant="destructive" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  {isPaused && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <p className="text-sm text-amber-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <strong>Pozastavené</strong> - kliknite "Pokračovať" pre obnovenie
                      </p>
                    </div>
                  )}

                  {/* Aktuálny dokument */}
                  {currentDoc && (
                    <div className="mb-6 p-4 bg-purple-100 rounded-xl border border-purple-300">
                      <p className="text-sm text-purple-900 mb-2 font-semibold">
                        ⚡ Aktuálne analyzujem:
                      </p>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <Home className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-bold text-gray-900">{currentDoc.nazov}</p>
                          <p className="text-xs text-gray-600">{currentIndex + 1} / {totalDocs}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="bg-white/70 rounded-xl p-4 border border-purple-300 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-purple-900">📊 Celkový progress</p>
                      <span className="text-2xl font-bold text-purple-700">{progress}%</span>
                    </div>
                    <div className="relative w-full bg-purple-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 h-6 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500 animate-pulse"
                        style={{ width: `${progress}%` }}
                      >
                        {progress > 15 && `${progress}%`}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-purple-700 mt-2 font-medium">
                      <span>✅ {analyzedDocs.length} úspešných</span>
                      <span>📍 {currentIndex} / {totalDocs}</span>
                      <span>❌ {failedDocs.length} chybných</span>
                    </div>
                  </div>

                  {/* Real-time výsledky */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Úspešné */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Úspešné ({analyzedDocs.length})
                      </h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {analyzedDocs.slice().reverse().map((doc, i) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-3 rounded-lg border border-green-200 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700 truncate flex-1">{doc.nazov}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingResult(doc)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Chybné */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Chybné ({failedDocs.length})
                      </h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {failedDocs.slice().reverse().map((doc, i) => (
                          <motion.div
                            key={doc.id + i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-3 rounded-lg border border-red-200"
                          >
                            <p className="text-sm text-gray-700 font-medium truncate">{doc.nazov}</p>
                            <p className="text-xs text-red-600 mt-1">⚠️ {doc.error}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Výsledky */}
          {!isAnalyzing && analyzedDocs.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📊 Prehľad analyzovaných fotiek
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-3xl font-bold text-green-900">{analyzedDocs.length}</p>
                  <p className="text-sm text-green-700">Úspešne analyzovaných</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <p className="text-3xl font-bold text-red-900">{failedDocs.length}</p>
                  <p className="text-sm text-red-700">Chybných analýz</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-3xl font-bold text-purple-900">{totalDocs}</p>
                  <p className="text-sm text-purple-700">Celkovo spracovaných</p>
                </div>
              </div>

              <div className="grid gap-3">
                {analyzedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.nazov}</p>
                        <p className="text-xs text-gray-600">Úspešne analyzované</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingResult(doc)}
                      className="hover:bg-purple-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* View Result Modal */}
          <AnimatePresence>
            {viewingResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setViewingResult(null)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-purple-900">
                      📊 Výsledky analýzy
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setViewingResult(null)}>
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-6">
                    <p className="font-semibold text-purple-900">{viewingResult.nazov}</p>
                    <p className="text-sm text-purple-700 mt-1">ID: {viewingResult.id}</p>
                  </div>

                  <div className="text-center text-gray-500 py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Detailné výsledky analýzy sa načítajú z databázy...</p>
                    <Button
                      onClick={async () => {
                        const docs = await base44.entities.Dokument.filter({ id: viewingResult.id });
                        if (docs[0]) {
                          // Presmeruj na AdminDokumenty s viewing modal
                          window.location.href = `/preview/AdminDokumenty?view=${docs[0].id}`;
                        }
                      }}
                      className="mt-4 bg-purple-600"
                    >
                      Zobraziť v Správe dokumentov
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}