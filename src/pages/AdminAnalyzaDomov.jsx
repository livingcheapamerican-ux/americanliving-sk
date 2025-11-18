import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Brain, CheckCircle, XCircle, Play, Square, RefreshCw, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAnalyzaDomov() {
  const [filters, setFilters] = useState({ vyrobca: 'Ticab house', model_domu: 'all' });
  const [batchState, setBatchState] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const logEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [] } = useQuery({
    queryKey: ['dokumenty-preview', filters],
    queryFn: async () => {
      const query = { typ: 'fotky', analyzovaný: false };
      if (filters.vyrobca !== 'all') query.vyrobca = filters.vyrobca;
      if (filters.model_domu !== 'all') query.model_domu = filters.model_domu;
      return base44.entities.Dokument.filter(query);
    }
  });

  const vyrobcovia = ["Ticab house", "JAK Modules", "Prosto House", "Domki z Gór"];
  const modely = dokumenty
    .map(d => d.model_domu)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

  // Polling stavu analýzy
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await base44.functions.invoke('analyzujDomyBatch', { action: 'status' });
        setBatchState(response.data.state);
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    if (batchState?.status === 'running') {
      const interval = setInterval(checkStatus, 2000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [batchState?.status]);

  // Auto-scroll logu
  useEffect(() => {
    if (batchState?.status === 'running') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [batchState?.successful?.length, batchState?.failed?.length]);

  // Iniciálna kontrola stavu
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const response = await base44.functions.invoke('analyzujDomyBatch', { action: 'status' });
        setBatchState(response.data.state);
      } catch (error) {
        console.error('Failed to load state:', error);
      }
    };
    loadInitialState();
  }, []);

  const handleStartAnalysis = async () => {
    if (dokumenty.length === 0) {
      alert('Nie sú žiadne neanalyzované fotky pre vybraného výrobcu. Zmeňte filter alebo všetky fotky sú už analyzované.');
      return;
    }
    
    try {
      console.log('Starting analysis with filters:', filters);
      const response = await base44.functions.invoke('analyzujDomyBatch', {
        action: 'start',
        filters
      });
      
      console.log('Analysis response:', response);
      
      if (response.data.success) {
        setBatchState({ status: 'running', total: response.data.total, current: 0, successful: [], failed: [] });
      } else {
        alert('Nepodarilo sa spustiť analýzu: ' + (response.data.message || 'Neznáma chyba'));
      }
    } catch (error) {
      console.error('Analysis start error:', error);
      alert('Chyba pri spustení: ' + error.message);
    }
  };

  const handleStopAnalysis = async () => {
    try {
      await base44.functions.invoke('analyzujDomyBatch', { action: 'stop' });
      setBatchState(prev => ({ ...prev, status: 'stopped' }));
    } catch (error) {
      alert('Chyba pri zastavení: ' + error.message);
    }
  };

  const handleResetState = async () => {
    try {
      await base44.functions.invoke('analyzujDomyBatch', { action: 'reset' });
      setBatchState(null);
    } catch (error) {
      alert('Chyba pri resete: ' + error.message);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prístup zamietnutý</h2>
          <p className="text-gray-600">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  const progress = batchState?.total > 0 ? (batchState.current / batchState.total) * 100 : 0;
  const isRunning = batchState?.status === 'running';
  const isCompleted = batchState?.status === 'completed';
  const isStopped = batchState?.status === 'stopped';

  // Kombinovaný log - successful aj failed
  const allLogs = [
    ...(batchState?.successful || []).map(s => ({ ...s, type: 'success' })),
    ...(batchState?.failed || []).map(f => ({ ...f, type: 'error' }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Analýza domov
                </h1>
                <p className="text-sm text-gray-600 mt-1">Server-side batch analýza - beží v pozadí</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6 border-0 shadow-lg bg-white/80 backdrop-blur">
            <h3 className="font-semibold text-lg mb-4">Filtre</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Výrobca</label>
                <Select value={filters.vyrobca} onValueChange={(v) => setFilters({...filters, vyrobca: v})} disabled={isRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetci výrobcovia</SelectItem>
                    {vyrobcovia.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model domu</label>
                <Select value={filters.model_domu} onValueChange={(v) => setFilters({...filters, model_domu: v})} disabled={isRunning}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky modely</SelectItem>
                    {modely.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={handleStartAnalysis} 
                disabled={isRunning || dokumenty.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Spustiť analýzu ({dokumenty.length})
              </Button>
              {isRunning && (
                <Button onClick={handleStopAnalysis} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Zastaviť
                </Button>
              )}
              {(isCompleted || isStopped) && (
                <Button onClick={handleResetState} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </Card>

          {/* Progress */}
          {batchState && (
            <Card className="p-6 mb-6 border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Progress</h3>
                <Badge className={
                  isRunning ? "bg-blue-500" :
                  isCompleted ? "bg-green-500" :
                  isStopped ? "bg-orange-500" : "bg-gray-500"
                }>
                  {isRunning && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {isRunning ? 'Beží' : isCompleted ? 'Dokončené' : isStopped ? 'Zastavené' : 'Neznámy'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Celkový progress</span>
                    <span className="text-sm font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{batchState.current || 0} / {batchState.total || 0}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Úspešné</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{batchState.successful?.length || 0}</p>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-900">Chybné</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{batchState.failed?.length || 0}</p>
                  </Card>
                </div>

                {batchState.started_at && (
                  <div className="text-xs text-gray-600">
                    Spustené: {new Date(batchState.started_at).toLocaleString('sk-SK')}
                    {batchState.completed_at && ` | Dokončené: ${new Date(batchState.completed_at).toLocaleString('sk-SK')}`}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Live Log */}
          {batchState && allLogs.length > 0 && (
            <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Live Log</h3>
                {isRunning && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </div>

              <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm">
                <div className="space-y-2">
                  {allLogs.map((log, index) => (
                    <motion.div
                      key={log.id + index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                        log.type === 'success' 
                          ? 'bg-green-900/30 border-green-500' 
                          : 'bg-red-900/40 border-red-500'
                      }`}
                    >
                      {log.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-grow min-w-0">
                        <p className={`font-medium break-all ${log.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                          {log.name}
                        </p>
                        {log.error && (
                          <div className="mt-2 bg-red-950/50 border border-red-700/50 rounded px-2 py-1.5">
                            <p className="text-red-300 text-xs font-mono leading-relaxed">
                              ⚠️ {log.error}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs flex-shrink-0 font-semibold">
                        #{index + 1}
                      </span>
                    </motion.div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </Card>
          )}

          {/* Info */}
          {!batchState && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Server-side analýza</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Analýza beží na serveri v pozadí</li>
                    <li>✅ Môžete zatvoriť stránku, vypnúť PC - analýza pokračuje</li>
                    <li>✅ Pri návrate stav automaticky obnoví</li>
                    <li>✅ Tlačidlo "Zastaviť" ukončí proces kedykoľvek</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}