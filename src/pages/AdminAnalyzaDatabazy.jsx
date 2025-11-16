import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Image, FileText, RefreshCw, Pause, Play, SkipForward, FolderSync, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentTableWithBulkActions from "../components/admin/DocumentTableWithBulkActions";
import DetailedAnalysisResults from "../components/admin/DetailedAnalysisResults";
import ImageComparisonView from "../components/admin/ImageComparisonView";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [reorganizing, setReorganizing] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0, skipped: 0 });
  const [currentDoc, setCurrentDoc] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [autoReorganize, setAutoReorganize] = useState(true);
  const [batchSize] = useState(10); // Väčší batch
  const [parallelLimit] = useState(3); // 3 súčasne
  
  const pausedRef = useRef(false);
  const stopRef = useRef(false);

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading, refetch } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" }),
    refetchInterval: 15000
  });

  const reorganizeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('reorganizujDokumenty'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty-all'] });
    }
  });

  const autoAnalyzeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('autoAnalyzujNoveDokumenty'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumenty-all'] });
    }
  });

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleAutoAnalyza = async () => {
    setAutoAnalyzing(true);
    addLog('🤖 Spúšťam automatickú analýzu nových dokumentov...', 'info');

    try {
      const response = await autoAnalyzeMutation.mutateAsync();
      
      if (response.data.success) {
        addLog(`✅ ${response.data.message}`, 'success');
        if (response.data.processed > 0) {
          addLog(`📊 Úspešných: ${response.data.processed}, Chýb: ${response.data.failed}`, 'info');
        }
      } else {
        addLog(`❌ Automatická analýza zlyhala: ${response.data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Chyba automatickej analýzy: ${error.message}`, 'error');
    } finally {
      setAutoAnalyzing(false);
    }
  };

  const analyzujJedenDokument = async (dok) => {
    try {
      setCurrentDoc(dok.nazov);

      if (!dok.subor_url || !dok.subor_url.startsWith('http')) {
        throw new Error('Neplatná URL obrázka');
      }

      const popis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyzuj tento obrázok modulárneho domu a vytvor krátky ale informatívny popis:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}

Vytvor 2-3 vetový popis zahŕňajúci typ obsahu, materiály, farby a hlavné charakteristiky.`,
        file_urls: [dok.subor_url]
      });

      const strukturovaneData = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyzuj tento obrázok modulárneho domu a extrahuj štruktúrované informácie s MAXIMÁLNYM DETAILOM o fasáde:

Vráť JSON s týmito poľami (všetky hodnoty sú nepovinné, ak niečo nevidíš, vynechaj to):

ZÁKLADNÉ INFORMÁCIE:
- typ_obsahu: jeden z "exterier", "interier", "podorys", "detail"
- specificka_kategoria: text, napr. "celkový pohľad", "detail fasády", "rohový pohľad"

FASÁDA - MATERIÁLY (buď čo najkonkrétnejší):
- fasada_materialy: pole textov, napr. ["smrekové drevo", "oceľový plech", "silikátová omietka", "cédrové dosky"]
- fasada_typy_drevin: pole textov s konkrétnymi druhmi dreva, napr. ["smrek", "céder", "modrin", "borovica"]
- fasada_povrchove_upravy: pole textov, napr. ["morené tmavé", "lakované matné", "impregnované", "neošetrené prírodné", "kefované"]
- fasada_prvky: pole textov špecifických prvkov, napr. ["vertikálne lamely", "horizontálne obklady", "drevené lišty", "kamenný obklad sokel", "kovové rohy"]
- fasada_farby: pole textov, napr. ["tmavohnedá", "biela", "sivá", "prírodná", "antracitová"]

OKNÁ A DVERE:
- okna_typ: text, napr. "plastové", "drevené", "hliníkové", "drevo-hliníkové"
- okna_farba: text
- dvere_typ: text
- dvere_farba: text

STRECHA:
- strecha_typ: text, napr. "plechová falcovaná", "škridlová", "plochá", "sedlová"
- strecha_farba: text
- strecha_material: text, napr. "titánzinkový plech", "oceľová škridla", "betónová škridla"

STAV A KVALITA:
- stav_fasady: jeden z "výborný", "dobrý", "potrebuje údržbu"
- spravny_vyrobca: text (potvrď alebo oprav)
- spravny_model: text (potvrď alebo oprav)

POZNÁMKA: Pri fasáde sa sústreď na KONKRÉTNE detaily - aký je presný typ dreva, aká je úprava povrchu, aké sú špecifické prvky.`,
        file_urls: [dok.subor_url],
        response_json_schema: {
          type: "object",
          properties: {
            typ_obsahu: { type: "string" },
            specificka_kategoria: { type: "string" },
            fasada_materialy: { type: "array", items: { type: "string" } },
            fasada_typy_drevin: { type: "array", items: { type: "string" } },
            fasada_povrchove_upravy: { type: "array", items: { type: "string" } },
            fasada_prvky: { type: "array", items: { type: "string" } },
            fasada_farby: { type: "array", items: { type: "string" } },
            okna_typ: { type: "string" },
            okna_farba: { type: "string" },
            dvere_typ: { type: "string" },
            dvere_farba: { type: "string" },
            strecha_typ: { type: "string" },
            strecha_farba: { type: "string" },
            strecha_material: { type: "string" },
            stav_fasady: { type: "string" },
            spravny_vyrobca: { type: "string" },
            spravny_model: { type: "string" }
          }
        }
      });

      await base44.entities.Dokument.update(dok.id, {
        ai_generovany_popis: popis,
        vizualna_analyza: strukturovaneData,
        analyzovaný: true,
        podrobna_analyza_datum: new Date().toISOString()
      });

      addLog(`✅ ${dok.nazov} (${strukturovaneData.typ_obsahu || 'N/A'})`, 'success');
      return { success: true, dok, analyza: strukturovaneData, popis };

    } catch (error) {
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('unsupported image') || errorMsg.includes('ImageURL')) {
        await base44.entities.Dokument.update(dok.id, {
          podrobna_analyza_datum: new Date().toISOString(),
          ai_generovany_popis: 'Problémový obrázok - nepodporovaný formát'
        });
        
        return { success: false, skipped: true, dok, error: errorMsg };
      }
      
      try {
        await base44.entities.Dokument.update(dok.id, {
          podrobna_analyza_datum: new Date().toISOString(),
          ai_generovany_popis: `Chyba analýzy: ${errorMsg}`
        });
      } catch {}
      
      return { success: false, skipped: false, dok, error: errorMsg };
    }
  };

  const handleReorganizacia = async () => {
    if (!confirm('Reorganizovať všetky analyzované súbory do priečinkov podľa AI analýzy?')) {
      return;
    }

    setReorganizing(true);
    addLog('🔄 Spúšťam reorganizáciu...', 'info');

    try {
      const response = await reorganizeMutation.mutateAsync();
      
      if (response.data.success) {
        addLog(`✅ Reorganizácia dokončená! Presunutých: ${response.data.presunute}, Nezmenených: ${response.data.nezmenene}, Chýb: ${response.data.chyby}`, 'success');
        setResults({
          ...results,
          reorganizacia: response.data
        });
      } else {
        addLog(`❌ Reorganizácia zlyhala: ${response.data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Chyba reorganizácie: ${error.message}`, 'error');
    } finally {
      setReorganizing(false);
    }
  };

  const handleAnalyzaVsetkych = async () => {
    const neanalyzovane = dokumenty.filter(d => !d.podrobna_analyza_datum);
    
    if (neanalyzovane.length === 0) {
      alert('Všetky fotky sú už analyzované!');
      return;
    }

    if (!confirm(`Spustiť analýzu ${neanalyzovane.length} fotiek?\n\nRýchla analýza: ${parallelLimit} súčasne v dávkach po ${batchSize}.`)) {
      return;
    }

    setAnalyzing(true);
    pausedRef.current = false;
    stopRef.current = false;
    setLogs([]);
    setProgress({ current: 0, total: neanalyzovane.length, failed: 0, skipped: 0 });
    
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < neanalyzovane.length; i += batchSize) {
      if (stopRef.current) {
        addLog('⏹️ Analýza zastavená', 'info');
        break;
      }

      while (pausedRef.current && !stopRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (stopRef.current) break;

      const batch = neanalyzovane.slice(i, i + batchSize);
      addLog(`📦 Dávka ${Math.floor(i/batchSize) + 1}/${Math.ceil(neanalyzovane.length/batchSize)} (${batch.length} súborov)`, 'info');

      // Spracuj v paralelných podskupinách
      for (let j = 0; j < batch.length; j += parallelLimit) {
        if (stopRef.current) break;
        
        const parallelBatch = batch.slice(j, j + parallelLimit);
        
        const results = await Promise.all(
          parallelBatch.map(dok => analyzujJedenDokument(dok))
        );

        for (const result of results) {
          if (result.success) {
            processed++;
          } else if (result.skipped) {
            skipped++;
          } else {
            failed++;
          }
        }

        setProgress({
          current: processed,
          total: neanalyzovane.length,
          failed: failed,
          skipped: skipped
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await refetch();
      addLog(`✅ Celkovo: ${processed} úspešných, ${skipped} preskočených, ${failed} chýb`, 'success');
    }

    setResults({
      total: neanalyzovane.length,
      processed: processed,
      failed: failed,
      skipped: skipped
    });

    setAnalyzing(false);
    setCurrentDoc(null);
    addLog(`🎉 Dokončené! Úspešných: ${processed}, Preskočených: ${skipped}, Chýb: ${failed}`, 'success');

    if (autoReorganize && processed > 0) {
      addLog('🔄 Automatická reorganizácia...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await handleReorganizacia();
    }
  };

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
  };

  const handleStop = () => {
    stopRef.current = true;
    pausedRef.current = false;
    setAnalyzing(false);
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
            🎯 Analýza celej databázy
          </h1>
          <p className="text-gray-600">Rýchly paralelný režim - {parallelLimit} súčasne, dávky po {batchSize}</p>
        </div>

        {/* Stats Cards */}
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

        {/* Speed info */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900 mb-1">⚡ Rýchly režim</p>
              <p className="text-purple-700">
                Paralelné spracovanie {parallelLimit} obrázkov súčasne v dávkach po {batchSize}. 
                Až ~{parallelLimit * 3}x rýchlejšie než sekvenčná analýza.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-600" />
                🤖 Automatická analýza nových dokumentov
              </h2>
              <p className="text-sm text-gray-600">
                Analyzuje a reorganizuje nové nahrané súbory (max 10 naraz)
              </p>
            </div>
            <Button
              onClick={handleAutoAnalyza}
              disabled={autoAnalyzing || neanalyzovaneCount === 0}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {autoAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzujem...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Automatická analýza
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-8 border-2 border-primary/20">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Rozšírená AI analýza fasád</h2>
              <p className="text-sm text-gray-600 mb-2">
                Extrahuje detailné informácie: typy drevín, povrchové úpravy, fasádne prvky, materiály, farby
              </p>
              {neanalyzovaneCount > 0 && (
                <p className="text-sm font-semibold text-orange-600">
                  ⚠️ Zostáva {neanalyzovaneCount} neanalyzovaných fotiek
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <Checkbox 
                id="auto-reorganize" 
                checked={autoReorganize}
                onCheckedChange={setAutoReorganize}
              />
              <label htmlFor="auto-reorganize" className="text-sm font-medium cursor-pointer">
                Automaticky reorganizovať súbory po analýze
              </label>
            </div>
            
            {analyzing && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-grow">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress.total > 0 ? ((progress.current + progress.skipped) / progress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-lg min-w-[60px]">
                    {progress.total > 0 ? Math.round(((progress.current + progress.skipped) / progress.total) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">✅ Úspešných: {progress.current} / {progress.total}</p>
                    {progress.skipped > 0 && (
                      <p className="text-yellow-600">⏭️ Preskočených: {progress.skipped}</p>
                    )}
                    {progress.failed > 0 && (
                      <p className="text-red-600">❌ Chýb: {progress.failed}</p>
                    )}
                    {currentDoc && (
                      <p className="text-blue-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {currentDoc}
                      </p>
                    )}
                    {pausedRef.current && (
                      <p className="text-amber-600 font-semibold">⏸️ POZASTAVENÉ</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handlePause} variant="outline" size="sm">
                      {pausedRef.current ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Pokračovať
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pozastaviť
                        </>
                      )}
                    </Button>
                    <Button onClick={handleStop} variant="destructive" size="sm">
                      Zastaviť
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {!analyzing && (
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleReorganizacia}
                  disabled={reorganizing || podrobneAnalyzovaneCount === 0}
                  size="lg"
                  variant="outline"
                  className="border-cyan-500 text-cyan-700 hover:bg-cyan-50"
                >
                  {reorganizing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Reorganizujem...
                    </>
                  ) : (
                    <>
                      <FolderSync className="w-5 h-5 mr-2" />
                      Reorganizovať
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleAnalyzaVsetkych}
                  disabled={neanalyzovaneCount === 0}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  {neanalyzovaneCount === 0 ? (
                    '✓ Všetko analyzované'
                  ) : (
                    `⚡ Rýchla analýza (${neanalyzovaneCount})`
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Tabs defaultValue="logs" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs">Log</TabsTrigger>
            <TabsTrigger value="results">Výsledky</TabsTrigger>
            <TabsTrigger value="bulk">Hromadné akcie</TabsTrigger>
            <TabsTrigger value="comparison">Porovnanie</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            {logs.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">📋 Log analýzy</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
                  {logs.slice(-50).reverse().map((log, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${
                        log.type === 'error' ? 'text-red-600' : 
                        log.type === 'success' ? 'text-green-600' : 
                        log.type === 'warning' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}
                    >
                      <span className="text-gray-400">{log.time}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            <DetailedAnalysisResults results={results} dokumenty={dokumenty} />
          </TabsContent>

          <TabsContent value="bulk">
            <DocumentTableWithBulkActions dokumenty={dokumenty} onRefresh={refetch} />
          </TabsContent>

          <TabsContent value="comparison">
            <ImageComparisonView dokumenty={dokumenty} />
          </TabsContent>
        </Tabs>

        {results && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">📊 Súhrn</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Analýza:</p>
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
                    <p className="text-3xl font-bold text-yellow-600">{results.skipped}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Chyby</p>
                    <p className="text-3xl font-bold text-red-600">{results.failed}</p>
                  </div>
                </div>
              </div>

              {results.reorganizacia && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Reorganizácia:</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Celkom</p>
                      <p className="text-3xl font-bold text-blue-600">{results.reorganizacia.total}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Presunuté</p>
                      <p className="text-3xl font-bold text-cyan-600">{results.reorganizacia.presunute}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Nezmenené</p>
                      <p className="text-3xl font-bold text-gray-600">{results.reorganizacia.nezmenene}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Chyby</p>
                      <p className="text-3xl font-bold text-red-600">{results.reorganizacia.chyby}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}