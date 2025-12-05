import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Languages, Play, CheckCircle, AlertCircle, Loader2, Home } from "lucide-react";
import { toast } from "sonner";

export default function AdminPrekladyDomov() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDom, setCurrentDom] = useState("");
  const [logs, setLogs] = useState([]);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-preklady'],
    queryFn: () => base44.entities.Dom.list()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin;

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const translateText = async (text, targetLang) => {
    if (!text) return null;
    
    const languageNames = {
      en: 'English',
      hu: 'Hungarian', 
      pl: 'Polish',
      uk: 'Ukrainian'
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following Slovak text to ${languageNames[targetLang]}. Keep all technical terms, measurements, brand names, and formatting unchanged. Return only the translated text.

Text:
${text}`,
      response_json_schema: {
        type: "object",
        properties: {
          translation: { type: "string" }
        },
        required: ["translation"]
      }
    });

    return result.translation;
  };

  const translateAllDomy = async () => {
    setIsTranslating(true);
    setProgress(0);
    setLogs([]);
    
    const languages = ['en', 'hu', 'pl', 'uk'];
    const domyToTranslate = domy.filter(dom => dom.popis && !dom.popis_en);
    
    addLog(`Začínam preklad ${domyToTranslate.length} domov...`, "info");

    for (let i = 0; i < domyToTranslate.length; i++) {
      const dom = domyToTranslate[i];
      setCurrentDom(dom.nazov);
      setProgress(Math.round((i / domyToTranslate.length) * 100));
      
      addLog(`Prekladám: ${dom.nazov}`, "info");

      try {
        const updates = {};

        // Preklad popisu
        if (dom.popis) {
          for (const lang of languages) {
            const fieldName = `popis_${lang}`;
            if (!dom[fieldName]) {
              const translation = await translateText(dom.popis, lang);
              if (translation) {
                updates[fieldName] = translation;
                addLog(`  ✓ Popis preložený do ${lang.toUpperCase()}`, "success");
              }
            }
          }
        }

        // Preklad špecifikácie
        if (dom.specifikacia) {
          for (const lang of languages) {
            const fieldName = `specifikacia_${lang}`;
            if (!dom[fieldName]) {
              const translation = await translateText(dom.specifikacia, lang);
              if (translation) {
                updates[fieldName] = translation;
                addLog(`  ✓ Špecifikácia preložená do ${lang.toUpperCase()}`, "success");
              }
            }
          }
        }

        // Uloženie prekladov
        if (Object.keys(updates).length > 0) {
          await base44.entities.Dom.update(dom.id, updates);
          addLog(`✓ ${dom.nazov} - uložené ${Object.keys(updates).length} prekladov`, "success");
        } else {
          addLog(`⏭ ${dom.nazov} - už má všetky preklady`, "info");
        }

      } catch (error) {
        addLog(`✗ Chyba pri ${dom.nazov}: ${error.message}`, "error");
      }
    }

    setProgress(100);
    setCurrentDom("");
    setIsTranslating(false);
    addLog("Preklad dokončený!", "success");
    toast.success("Všetky preklady boli uložené do databázy");
    queryClient.invalidateQueries({ queryKey: ['domy-preklady'] });
  };

  const getTranslationStatus = (dom) => {
    const fields = ['popis_en', 'popis_hu', 'popis_pl', 'popis_uk'];
    const filled = fields.filter(f => dom[f]).length;
    return { filled, total: fields.length };
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Prístup zamietnutý</h2>
          <p className="text-gray-500">Táto stránka je dostupná len pre administrátorov.</p>
        </Card>
      </div>
    );
  }

  const domyWithoutTranslations = domy.filter(dom => dom.popis && !dom.popis_en);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <Languages className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preklady popisov domov</h1>
            <p className="text-gray-500">Automatický preklad pomocou AI do všetkých jazykov</p>
          </div>
        </div>

        {/* Štatistiky */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{domy.length}</p>
            <p className="text-sm text-gray-500">Celkom domov</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{domyWithoutTranslations.length}</p>
            <p className="text-sm text-gray-500">Bez prekladov</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{domy.length - domyWithoutTranslations.length}</p>
            <p className="text-sm text-gray-500">Preložených</p>
          </Card>
        </div>

        {/* Akcia */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Spustiť preklad</h3>
              <p className="text-sm text-gray-500">
                Preloží popisy a špecifikácie do EN, HU, PL, UK
              </p>
            </div>
            <Button 
              onClick={translateAllDomy}
              disabled={isTranslating || domyWithoutTranslations.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Prekladám...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Spustiť preklad ({domyWithoutTranslations.length})
                </>
              )}
            </Button>
          </div>

          {isTranslating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Prekladám: {currentDom}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </Card>

        {/* Logy */}
        {logs.length > 0 && (
          <Card className="p-4 mb-6">
            <h4 className="font-semibold mb-3">Priebeh</h4>
            <div className="max-h-64 overflow-y-auto space-y-1 text-sm font-mono bg-gray-900 text-gray-100 p-3 rounded-lg">
              {logs.map((log, i) => (
                <div key={i} className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-green-400' : ''}
                  ${log.type === 'info' ? 'text-gray-300' : ''}
                `}>
                  <span className="text-gray-500">[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Zoznam domov */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Stav prekladov</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {domy.map(dom => {
                const status = getTranslationStatus(dom);
                const isComplete = status.filled === status.total;
                
                return (
                  <div 
                    key={dom.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                      <div>
                        <p className="font-medium">{dom.nazov}</p>
                        <p className="text-xs text-gray-500">{dom.vyrobca}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Kompletné
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700">
                          {status.filled}/{status.total} jazykov
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}