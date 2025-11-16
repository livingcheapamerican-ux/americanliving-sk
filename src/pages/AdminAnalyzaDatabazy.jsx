import React, { useState, useMemo, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Image, FileText, RefreshCw, Pause, Play } from "lucide-react";

export default function AdminAnalyzaDatabazy() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });
  const [currentDoc, setCurrentDoc] = useState(null);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  
  const pausedRef = useRef(false);
  const stopRef = useRef(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: dokumenty = [], isLoading, refetch } = useQuery({
    queryKey: ['dokumenty-all'],
    queryFn: () => base44.entities.Dokument.filter({ typ: "fotky" })
  });

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const analyzujJedenDokument = async (dok) => {
    try {
      setCurrentDoc(dok.nazov);
      addLog(`Analyzujem: ${dok.nazov}`, 'info');

      const analyza = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyzuj tento obrázok modulárneho domu:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}

Poskytni:
1. TYP: exteriér/interiér/pôdorys/kombinacia
2. MATERIÁLY FASÁDY: všetky viditeľné (drevo, plech, omietka, sklo...)
3. OKNÁ: typ, farba rámu
4. DVERE: typ, farba
5. STRECHA: typ krytiny, farba
6. STAV FASÁDY: výborný/dobrý/potrebuje údržbu
7. ŠPECIFICKÁ KATEGÓRIA: detail fasády/celkový pohľad/interiér detaily/pôdorys...
8. SPRÁVNY VÝROBCA: potvrď alebo oprav výrobcu
9. SPRÁVNY MODEL: potvrď alebo oprav model domu
10. ODPORÚČANÝ PRIEČINOK: kam má byť fotka presunutá`,
        file_urls: [dok.subor_url],
        response_json_schema: {
          type: "object",
          properties: {
            typ_obsahu: {
              type: "string",
              enum: ["exterier", "interier", "podorys", "kombinacia"]
            },
            specificka_kategoria: { type: "string" },
            fasada_materialy: {
              type: "array",
              items: { 
                type: "object",
                properties: {
                  material: { type: "string" },
                  farba: { type: "string" }
                }
              }
            },
            okna: {
              type: "object",
              properties: {
                typ: { type: "string" },
                farba_ramu: { type: "string" }
              }
            },
            dvere: {
              type: "object",
              properties: {
                typ: { type: "string" },
                farba: { type: "string" }
              }
            },
            stresna_krytina: {
              type: "object",
              properties: {
                typ: { type: "string" },
                farba: { type: "string" }
              }
            },
            stav_fasady: {
              type: "string",
              enum: ["výborný", "dobrý", "potrebuje údržbu"]
            },
            spravny_vyrobca: { type: "string" },
            spravny_model_domu: { type: "string" },
            odporucany_priecinok: { type: "string" }
          },
          required: ["typ_obsahu", "spravny_model_domu"]
        }
      });

      // Aktualizuj dokument
      await base44.entities.Dokument.update(dok.id, {
        vizualna_analyza: analyza,
        analyzovaný: true,
        podrobna_analyza_datum: new Date().toISOString()
      });

      addLog(`✅ Hotovo: ${dok.nazov}`, 'success');
      return { success: true, dok, analyza };

    } catch (error) {
      addLog(`❌ Chyba: ${dok.nazov} - ${error.message}`, 'error');
      return { success: false, dok, error: error.message };
    }
  };

  const handleAnalyzaVsetkych = async () => {
    const neanalyzovane = dokumenty.filter(d => !d.podrobna_analyza_datum);
    
    if (neanalyzovane.length === 0) {
      alert('Všetky fotky sú už analyzované!');
      return;
    }

    if (!confirm(`Spustiť analýzu ${neanalyzovane.length} fotiek?\n\nAnalýza prebieha jeden obrázok po druhom.\nMôžete pozastaviť kedykoľvek.`)) {
      return;
    }

    setAnalyzing(true);
    pausedRef.current = false;
    stopRef.current = false;
    setLogs([]);
    setProgress({ current: 0, total: neanalyzovane.length, failed: 0 });
    
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < neanalyzovane.length; i++) {
      // Kontrola zastavenia
      if (stopRef.current) {
        addLog('⏹️ Analýza zastavená používateľom', 'info');
        break;
      }

      // Kontrola pauzy
      while (pausedRef.current && !stopRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (stopRef.current) break;

      const dok = neanalyzovane[i];
      const result = await analyzujJedenDokument(dok);

      if (result.success) {
        processed++;
      } else {
        failed++;
      }

      setProgress({
        current: processed,
        total: neanalyzovane.length,
        failed: failed
      });

      // Refresh každých 10 dokumentov
      if (processed % 10 === 0) {
        await refetch();
      }

      // Krátka pauza medzi dokumentmi
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Finálny refresh
    await refetch();

    setResults({
      total: neanalyzovane.length,
      processed: processed,
      failed: failed
    });

    setAnalyzing(false);
    setCurrentDoc(null);
    addLog(`🎉 Analýza dokončená! Úspešných: ${processed}, Chýb: ${failed}`, 'success');
  };

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
  };

  const handleStop = () => {
    stopRef.current = true;
    pausedRef.current = false;
    setAnalyzing(false);
  };

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
          <p className="text-gray-600">Postupná analýza všetkých dokumentov (jeden po druhom)</p>
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
              <h2 className="text-xl font-bold mb-2">🚀 Postupná AI analýza</h2>
              <p className="text-sm text-gray-600 mb-2">
                Analýza prebieha postupne (1 fotka po druhej) • Môžete pozastaviť a pokračovať kedykoľvek
              </p>
              {neanalyzovaneCount > 0 && (
                <p className="text-sm font-semibold text-orange-600">
                  ⚠️ Zostáva {neanalyzovaneCount} neanalyzovaných fotiek
                </p>
              )}
            </div>
            
            {analyzing && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-grow">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-lg min-w-[60px]">
                    {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">✅ Spracovaných: {progress.current} / {progress.total}</p>
                    {progress.failed > 0 && (
                      <p className="text-red-600">❌ Chýb: {progress.failed}</p>
                    )}
                    {currentDoc && (
                      <p className="text-blue-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Práve: {currentDoc}
                      </p>
                    )}
                    {pausedRef.current && (
                      <p className="text-amber-600 font-semibold">⏸️ POZASTAVENÉ</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      size="sm"
                    >
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
                    <Button
                      onClick={handleStop}
                      variant="destructive"
                      size="sm"
                    >
                      Zastaviť
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {!analyzing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleAnalyzaVsetkych}
                  disabled={neanalyzovaneCount === 0}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  {neanalyzovaneCount === 0 ? (
                    '✓ Všetko analyzované'
                  ) : (
                    `Spustiť analýzu (${neanalyzovaneCount} fotiek)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Logs */}
        {logs.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">📋 Log analýzy</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.slice(-50).reverse().map((log, i) => (
                <div
                  key={i}
                  className={`text-sm flex gap-2 ${
                    log.type === 'error' ? 'text-red-600' : 
                    log.type === 'success' ? 'text-green-600' : 
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

        {/* Výsledky analýzy */}
        {results && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-xl font-bold mb-4">📊 Výsledky analýzy</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Celkom</p>
                <p className="text-3xl font-bold text-blue-600">{results.total}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Úspešné</p>
                <p className="text-3xl font-bold text-green-600">{results.processed}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Chyby</p>
                <p className="text-3xl font-bold text-red-600">{results.failed}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}