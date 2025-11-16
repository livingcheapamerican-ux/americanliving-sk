import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Image, FileText, RefreshCw } from "lucide-react";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [autoHealCount, setAutoHealCount] = useState(0);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading, refetch } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" }),
    refetchInterval: analyzing ? 10000 : false
  });

  // AutoHeal sledovanie
  useEffect(() => {
    if (!analyzing || currentBatch.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdate > 10000) {
        console.log('⚠️ AUTOHEAL: Zaseknutie!');
        setAutoHealCount(prev => prev + 1);
        setLastUpdate(now);
        refetch();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [analyzing, lastUpdate, currentBatch, refetch]);

  const handleAnalyze = async () => {
    const neanalyzovane = dokumenty.filter(d => !d.data?.podrobna_analyza_datum);
    
    if (neanalyzovane.length === 0) {
      alert('✅ Všetky fotky sú už analyzované!');
      return;
    }

    if (!confirm(`Spustiť analýzu ${neanalyzovane.length} fotiek?\n\nPrebehne paralelne po 3 fotky.`)) {
      return;
    }

    setAnalyzing(true);
    setProgress({ current: 0, total: neanalyzovane.length });
    setAutoHealCount(0);
    setLastUpdate(Date.now());

    let processed = 0;
    const BATCH_SIZE = 3;
    const successResults = [];
    const errorResults = [];

    try {
      for (let i = 0; i < neanalyzovane.length; i += BATCH_SIZE) {
        const batch = neanalyzovane.slice(i, i + BATCH_SIZE);
        setCurrentBatch(batch);
        
        console.log(`📦 Batch ${Math.floor(i/BATCH_SIZE) + 1}: Spracovávam ${batch.length} fotiek`);

        const promises = batch.map(async (dok) => {
          try {
            const response = await base44.functions.invoke('analyzujJedenDokument', {
              dokumentId: dok.id
            });

            if (response.data.success) {
              successResults.push(response.data.dokument);
              return { success: true, id: dok.id };
            } else {
              throw new Error(response.data.error || 'Unknown error');
            }
          } catch (error) {
            console.error(`❌ Chyba pri ${dok.data?.nazov}:`, error);
            errorResults.push({ id: dok.id, nazov: dok.data?.nazov, error: error.message });
            return { success: false, id: dok.id, error: error.message };
          }
        });

        const batchResults = await Promise.all(promises);
        const batchSuccess = batchResults.filter(r => r.success).length;
        
        processed += batchSuccess;
        setProgress({ current: processed, total: neanalyzovane.length });
        setLastUpdate(Date.now());

        console.log(`✅ Batch hotový: ${batchSuccess}/${batch.length} úspešných`);

        // Refresh každých 10 spracovaných
        if (processed % 10 === 0) {
          await refetch();
        }

        // Pauza medzi batch-ami
        if (i + BATCH_SIZE < neanalyzovane.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      await refetch();

      setResults({
        total: neanalyzovane.length,
        processed: processed,
        success: successResults.length,
        errors: errorResults.length,
        autoHealCount
      });

      alert(`✅ Analýza dokončená!\n\n` +
            `Spracovaných: ${processed}/${neanalyzovane.length}\n` +
            `Úspešných: ${successResults.length}\n` +
            `Chýb: ${errorResults.length}\n` +
            `AutoHeal: ${autoHealCount}x`);

    } catch (error) {
      console.error('❌ Kritická chyba:', error);
      alert('❌ Kritická chyba:\n' + error.message);
    } finally {
      setAnalyzing(false);
      setCurrentBatch([]);
    }
  };

  const analyzovaneCount = dokumenty.filter(d => d.data?.vizualna_analyza).length;
  const podrobneCount = dokumenty.filter(d => d.data?.podrobna_analyza_datum).length;
  const neanalyzovaneCount = dokumenty.filter(d => !d.data?.podrobna_analyza_datum).length;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.super_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold">Prístup len pre administrátorov</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Analýza databázy
          </h1>
          <p className="text-gray-600">Paralelné spracovanie s AutoHeal detekciou zaseknutia</p>
        </div>

        {/* Stats */}
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
                <p className="text-sm text-gray-600">Základná analýza</p>
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
                <p className="text-sm text-gray-600">Podrobná analýza</p>
                <p className="text-2xl font-bold text-purple-900">{podrobneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Neanalyzované</p>
                <p className="text-2xl font-bold text-orange-900">{neanalyzovaneCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progres</p>
                <p className="text-2xl font-bold text-amber-900">
                  {dokumenty.length > 0 ? Math.round((podrobneCount / dokumenty.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6 mb-8 border-2 border-primary/20">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Paralelná AI analýza</h2>
              <p className="text-sm text-gray-600 mb-2">
                Spracováva 3 fotky súčasne • AutoHeal 10s timeout • Automatický refresh
              </p>
              {neanalyzovaneCount > 0 && (
                <p className="text-sm font-semibold text-orange-600">
                  ⚠️ Zostáva {neanalyzovaneCount} fotiek
                </p>
              )}
              {autoHealCount > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  🔧 AutoHeal: {autoHealCount}x
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                {analyzing && (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-64 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                    </div>
                    <p className="text-xs">✅ {progress.current} / {progress.total}</p>
                    <p className="text-xs text-orange-600">⏳ Zostáva: {progress.total - progress.current}</p>
                    {currentBatch.length > 0 && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Spracováva batch {currentBatch.length} fotiek
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || neanalyzovaneCount === 0}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {progress.current}/{progress.total}
                  </>
                ) : neanalyzovaneCount === 0 ? (
                  '✓ Hotovo'
                ) : (
                  `Spustiť (${neanalyzovaneCount})`
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">📊 Výsledky</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Celkom</p>
                <p className="text-3xl font-bold text-blue-600">{results.total}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Spracované</p>
                <p className="text-3xl font-bold text-purple-600">{results.processed}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Úspešné</p>
                <p className="text-3xl font-bold text-green-600">{results.success}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Chyby</p>
                <p className="text-3xl font-bold text-red-600">{results.errors}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">AutoHeal</p>
                <p className="text-3xl font-bold text-amber-600">{results.autoHealCount}x</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}