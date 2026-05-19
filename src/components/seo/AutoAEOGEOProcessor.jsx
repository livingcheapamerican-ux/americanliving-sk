import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, Play, Pause, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function AutoAEOGEOProcessor() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ total: 0, processed: 0, pending: 0 });
  const [currentHouse, setCurrentHouse] = useState(null);
  const [logs, setLogs] = useState([]);
  const runningRef = useRef(isRunning);

  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const processNextHouse = async () => {
    if (!runningRef.current) return;

    try {
      // 1. Získať zoznam domov a nájsť jeden nespracovaný
      const domy = await base44.entities.Dom.list();
      const pendingDomy = domy.filter(d => !d.aeo_geo_data);
      
      setStats({
        total: domy.length,
        processed: domy.length - pendingDomy.length,
        pending: pendingDomy.length
      });

      const nextDom = pendingDomy[0];

      if (!nextDom) {
        addLog('✅ Všetky domy sú spracované.');
        setIsRunning(false);
        return;
      }

      setCurrentHouse(nextDom.nazov);
      addLog(`🔄 Analyzujem: ${nextDom.nazov}...`);

      const prompt = `Si špičkový AI SEO, AEO a GEO špecialista.
Analyzuj nasledujúci dom a poskytni odporúčania pre optimalizáciu pre AI vyhľadávače (ChatGPT, Perplexity, Google AI Overviews).

NÁZOV DOMU: ${nextDom.nazov}
CENA: ${nextDom.zakladna_cena} EUR
PLOCHA: ${nextDom.zastavana_plocha} m2
POPIS: ${nextDom.popis || 'Modulárny dom vysokej kvality'}

Tvojou úlohou je vrátiť JSON s presne touto štruktúrou:
{
  "information_gain_score": 85,
  "llm_tldr": "Tento dom ponúka... (max 3 vety)",
  "geo_recommendations": ["odporúčanie 1", "odporúčanie 2"],
  "faq_schema": { 
    "@context": "https://schema.org", 
    "@type": "FAQPage", 
    "mainEntity": [...] 
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            information_gain_score: { type: "number" },
            llm_tldr: { type: "string" },
            geo_recommendations: { type: "array", items: { type: "string" } },
            faq_schema: { type: "object" }
          },
          required: ["information_gain_score", "llm_tldr", "geo_recommendations", "faq_schema"]
        }
      });

      // Uložiť výsledok do databázy - this creates the lock so it won't loop!
      await base44.entities.Dom.update(nextDom.id, {
        aeo_geo_data: response
      });

      addLog(`✅ ${nextDom.nazov} úspešne uložený do DB.`);
      
      // Update stats immediately for visual feedback
      setStats(prev => ({
        ...prev,
        processed: prev.processed + 1,
        pending: prev.pending - 1
      }));
      
      // Delay predtým, než začne ďalší, aby sa predišlo rate-limitingu
      setTimeout(() => {
        if (runningRef.current) processNextHouse();
      }, 4000);

    } catch (error) {
      addLog(`❌ Chyba pri spracovaní: ${error.message}`);
      // Don't stop entirely on one error, wait longer and retry or stop based on user preference
      // Here we pause it to be safe
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      processNextHouse();
    }
  }, [isRunning]);

  // Initial check and AUTO START
  useEffect(() => {
    let mounted = true;
    base44.entities.Dom.list().then(domy => {
      if (!mounted) return;
      const pendingCount = domy.filter(d => !d.aeo_geo_data).length;
      setStats({
        total: domy.length,
        processed: domy.length - pendingCount,
        pending: pendingCount
      });

      // AUTO START ak sú čakajúce domy, ako si želal používateľ (nechce klikať manuálne)
      if (pendingCount > 0) {
        addLog('🚀 Našli sa nespracované domy, o 3 sekundy začínam automatickú analýzu...');
        setTimeout(() => {
          if (mounted && !runningRef.current) {
            setIsRunning(true);
          }
        }, 3000);
      } else {
        addLog('✅ Všetky domy už majú AI optimalizáciu.');
      }
    });

    return () => { mounted = false; };
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Automatický AEO & GEO Audítor
        </h3>
        <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-500 animate-pulse" : ""}>
          {isRunning ? "Spracovávam na pozadí..." : "Zastavené"}
        </Badge>
      </div>

      <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">Celkovo domov</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Už spracované</p>
            <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Čaká na analýzu</p>
            <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsRunning(!isRunning)}
          className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}
          size="lg"
        >
          {isRunning ? (
            <><Pause className="w-4 h-4 mr-2" /> Zastaviť automatizáciu</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Spustiť automatickú analýzu</>
          )}
        </Button>
      </div>

      {currentHouse && isRunning && (
        <div className="flex items-center gap-3 text-sm text-indigo-800 bg-indigo-50 p-3 rounded mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Práve generujem AI dáta pre: <strong>{currentHouse}</strong></span>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Logy procesora:</h4>
        <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-y-auto h-40 text-xs font-mono space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="opacity-90">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex gap-2 items-start">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Tento procesor automaticky pošle každý chýbajúci dom cez <code>InvokeLLM</code>. 
          Vďaka ukladaniu priamo do databázy (<code>aeo_geo_data</code>) dom zanalyzuje <strong>iba raz</strong>. 
          Pokiaľ je táto stránka otvorená, postupne spracuje všetky tvoje domy.
        </p>
      </div>
    </Card>
  );
}
