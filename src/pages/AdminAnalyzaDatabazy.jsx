import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Home, Image, FileText, Filter, Building2, PieChart, BarChart3, FolderTree, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, remaining: 0 });
  const [results, setResults] = useState(null);
  const [filterVyrobca, setFilterVyrobca] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [filterTyp, setFilterTyp] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoHealActive, setAutoHealActive] = useState(false);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(Date.now());
  const [stuckCount, setStuckCount] = useState(0);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading, refetch } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" })
  });

  // AutoHeal monitor - sleduje zaseknutie
  useEffect(() => {
    if (!analyzing) return;

    const checkInterval = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastProgressUpdate;

      // Ak je viac ako 10 sekúnd bez zmeny, aktivuj autoheal
      if (timeSinceLastUpdate > 10000) {
        console.log('⚠️ AUTOHEAL: Detegované zaseknutie!');
        setStuckCount(prev => prev + 1);
        setAutoHealActive(true);
        
        // Refresh dát
        await refetch();
        setLastProgressUpdate(now);
        
        // Pokračuj v analýze
        setTimeout(() => {
          setAutoHealActive(false);
        }, 2000);
      }
    }, 5000); // Kontroluj každých 5 sekúnd

    return () => clearInterval(checkInterval);
  }, [analyzing, lastProgressUpdate, refetch]);

  const handleAnalyzaVsetkych = async () => {
    const neanalyzovane = dokumenty.filter(d => !d.podrobna_analyza_datum);
    
    if (neanalyzovane.length === 0) {
      alert('Všetky fotky sú už analyzované!');
      return;
    }

    if (!confirm(`Spustiť podrobnú analýzu ${neanalyzovane.length} neanalyzovaných fotiek?`)) {
      return;
    }

    try {
      setAnalyzing(true);
      setProgress({ current: 0, total: neanalyzovane.length, remaining: neanalyzovane.length });
      setLastProgressUpdate(Date.now());
      setStuckCount(0);

      let totalProcessed = 0;
      let remaining = neanalyzovane.length;
      let maxIterations = 1000; // Bezpečnostný limit
      let iteration = 0;

      while (remaining > 0 && iteration < maxIterations) {
        iteration++;
        console.log(`🔄 Batch ${iteration}: ${remaining} zostáva`);
        
        try {
          const response = await base44.functions.invoke('analyzujVsetkyDokumentyPodrobne', {});
          
          console.log('📊 Batch response:', response.data);
          
          if (!response.data.success) {
            throw new Error(response.data.error || 'Analysis failed');
          }

          const prevProcessed = totalProcessed;
          totalProcessed += response.data.processed;
          remaining = response.data.remaining || 0;

          // Ak sa nič nespracovalo, break
          if (response.data.processed === 0 && remaining > 0) {
            console.warn('⚠️ Žiadny progress, ukončujem');
            break;
          }

          setProgress({
            current: totalProcessed,
            total: neanalyzovane.length,
            remaining: remaining
          });
          setLastProgressUpdate(Date.now());

          // Refresh data každých 5 spracovaných
          if (totalProcessed % 5 === 0) {
            await refetch();
          }

          if (remaining === 0) break;

          // Pauza medzi batch-ami
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (batchError) {
          console.error('❌ Batch error:', batchError);
          // Pokračuj aj po chybe
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Finálny refresh
      await refetch();

      setResults({
        success: true,
        total: neanalyzovane.length,
        processed: totalProcessed,
        iterations: iteration,
        stuckCount: stuckCount
      });

      alert(`✅ Analýza dokončená!\n\nSpracovaných: ${totalProcessed} z ${neanalyzovane.length}\nIterácií: ${iteration}\nAutoHeal spustený: ${stuckCount}x`);

    } catch (error) {
      console.error('❌ Analysis error:', error);
      alert('❌ Chyba pri analýze:\n' + (error.response?.data?.error || error.message));
    } finally {
      setAnalyzing(false);
      setAutoHealActive(false);
    }
  };

  // Štatistiky
  const stats = useMemo(() => {
    const analyzovane = dokumenty.filter(d => d.vizualna_analyza);
    
    const materialy = {};
    analyzovane.forEach(dok => {
      dok.vizualna_analyza?.fasada_materialy?.forEach(mat => {
        const materialName = typeof mat === 'string' ? mat : mat.material;
        if (materialName) {
          materialy[materialName] = (materialy[materialName] || 0) + 1;
        }
      });
    });

    const farby = {};
    analyzovane.forEach(dok => {
      dok.vizualna_analyza?.fasada_materialy?.forEach(mat => {
        if (mat?.farba) {
          farby[mat.farba] = (farby[mat.farba] || 0) + 1;
        }
      });
    });

    const typyObsahu = {
      exterier: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'exterier').length,
      interier: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'interier').length,
      podorys: analyzovane.filter(d => d.vizualna_analyza?.podorys_info?.je_podorys).length,
      kombinacia: analyzovane.filter(d => d.vizualna_analyza?.typ_obsahu === 'kombinacia').length
    };

    return { materialy, farby, typyObsahu };
  }, [dokumenty]);

  const analyzovaneCount = dokumenty.filter(d => d.vizualna_analyza).length;
  const podrobneAnalyzovaneCount = dokumenty.filter(d => d.podrobna_analyza_datum).length;
  const neanalyzovaneCount = dokumenty.filter(d => !d.podrobna_analyza_datum).length;

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
          <p className="text-xs text-gray-500">Role: {user?.role || 'none'}, Super Admin: {user?.super_admin ? 'áno' : 'nie'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Analýza celej databázy
          </h1>
          <p className="text-gray-600">Vizuálny prehľad všetkých dokumentov s AutoHeal technológiou</p>
          {autoHealActive && (
            <div className="mt-2 flex items-center gap-2 text-amber-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold">AutoHeal aktívny - oprava zaseknutia...</span>
            </div>
          )}
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
                <p className="text-sm text-gray-600">Percento</p>
                <p className="text-2xl font-bold text-amber-900">
                  {dokumenty.length > 0 ? Math.round((podrobneAnalyzovaneCount / dokumenty.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="p-6 mb-8 border-2 border-primary/20">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Podrobná AI analýza s AutoHeal</h2>
              <p className="text-sm text-gray-600 mb-2">
                Automaticky deteguje zaseknutie (10s timeout) a obnoví proces • Batch processing po 5 fotiek
              </p>
              {neanalyzovaneCount > 0 && (
                <p className="text-sm font-semibold text-orange-600">
                  ⚠️ Zostáva {neanalyzovaneCount} neanalyzovaných fotiek
                </p>
              )}
              {stuckCount > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  🔧 AutoHeal spustený: {stuckCount}x
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                {analyzing && (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-48 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-medium">{progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%</span>
                    </div>
                    <p className="text-xs">✅ Spracovaných: {progress.current} / {progress.total}</p>
                    <p className="text-xs text-orange-600">⏳ Zostáva: {progress.remaining}</p>
                    {autoHealActive && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        AutoHeal aktívny
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAnalyzaVsetkych}
                disabled={analyzing || neanalyzovaneCount === 0}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzujem... {progress.current}/{progress.total}
                  </>
                ) : neanalyzovaneCount === 0 ? (
                  '✓ Všetko analyzované'
                ) : (
                  `Spustiť analýzu (${neanalyzovaneCount} fotiek)`
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Výsledky analýzy */}
        {results && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">📊 Výsledky poslednej analýzy</h3>
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
                <p className="text-sm text-gray-600">Iterácií</p>
                <p className="text-3xl font-bold text-purple-600">{results.iterations}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">AutoHeal</p>
                <p className="text-3xl font-bold text-amber-600">{results.stuckCount}x</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}