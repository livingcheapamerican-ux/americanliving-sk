import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeftRight, Lightbulb, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AIComparisonTool({ dokumenty }) {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  const analyzovaneDokumenty = dokumenty.filter(d => d.vizualna_analyza);

  const handleCompare = async () => {
    if (selectedDocs.length !== 2) return;

    setComparing(true);

    try {
      const [dok1, dok2] = selectedDocs;
      
      const comparisonPrompt = `Porovnaj tieto dve fasády modulárnych domov a identifikuj kľúčové rozdiely a podobnosti:

DOKUMENT 1 - ${dok1.nazov}:
${JSON.stringify(dok1.vizualna_analyza, null, 2)}

DOKUMENT 2 - ${dok2.nazov}:
${JSON.stringify(dok2.vizualna_analyza, null, 2)}

Vráť JSON s:
- podobnosti: pole textov s podobnými prvkami
- rozdiely: pole objektov {aspekt: string, dokument1: string, dokument2: string}
- odporucania: pole textov s odporúčaniami pre zjednotenie štýlu
`;

      const comparison = await base44.integrations.Core.InvokeLLM({
        prompt: comparisonPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            podobnosti: { type: "array", items: { type: "string" } },
            rozdiely: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  aspekt: { type: "string" },
                  dokument1: { type: "string" },
                  dokument2: { type: "string" }
                }
              }
            },
            odporucania: { type: "array", items: { type: "string" } }
          }
        }
      });

      setComparisonResult(comparison);

    } catch (error) {
      alert(`Chyba: ${error.message}`);
    } finally {
      setComparing(false);
    }
  };

  const handleGetSuggestions = async (dok) => {
    setComparing(true);

    try {
      const suggestionPrompt = `Na základe tejto vizuálnej analýzy fasády modulárneho domu:

${JSON.stringify(dok.vizualna_analyza, null, 2)}

Vráť JSON s odporúčaniami na optimalizáciu fasády:
- optimalne_upravy: pole textov s konkrétnymi návrhmi povrchových úprav
- alternativne_materialy: pole textov s alternatívnymi materiálmi, ktoré by mohli byť vhodnejšie
- energeticka_efektivnost: text s návrhmi na zlepšenie energetickej efektívnosti
- esteticke_zlepsenia: pole textov s estetickými návrhmi
- udrzba: text s odporúčaniami pre údržbu daného typu fasády
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: suggestionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            optimalne_upravy: { type: "array", items: { type: "string" } },
            alternativne_materialy: { type: "array", items: { type: "string" } },
            energeticka_efektivnost: { type: "string" },
            esteticke_zlepsenia: { type: "array", items: { type: "string" } },
            udrzba: { type: "string" }
          }
        }
      });

      setSuggestions({ dokument: dok, navrhy: result });

    } catch (error) {
      alert(`Chyba: ${error.message}`);
    } finally {
      setComparing(false);
    }
  };

  const addToComparison = (dok) => {
    if (selectedDocs.length < 2 && !selectedDocs.find(d => d.id === dok.id)) {
      setSelectedDocs([...selectedDocs, dok]);
    }
  };

  const removeFromComparison = (dokId) => {
    setSelectedDocs(selectedDocs.filter(d => d.id !== dokId));
  };

  return (
    <div className="space-y-6">
      {/* Výber dokumentov */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">AI Porovnanie a odporúčania</h3>
            <p className="text-sm text-gray-600">
              Porovnajte 2 dokumenty alebo získajte AI návrhy optimálnych úprav
            </p>
          </div>
          {selectedDocs.length < 2 && (
            <Button onClick={() => setShowSelector(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Vybrať dokument
            </Button>
          )}
        </div>

        {selectedDocs.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDocs.map((dok, idx) => (
                <Card key={dok.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge variant="outline" className="mb-2">Dokument {idx + 1}</Badge>
                      <p className="font-semibold text-sm">{dok.nazov}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromComparison(dok.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <img 
                    src={dok.subor_url} 
                    alt={dok.nazov}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <Button
                    onClick={() => handleGetSuggestions(dok)}
                    disabled={comparing}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    AI Odporúčania
                  </Button>
                </Card>
              ))}
            </div>

            {selectedDocs.length === 2 && (
              <Button
                onClick={handleCompare}
                disabled={comparing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {comparing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Porovnávam...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Porovnať fasády
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Výsledok porovnania */}
      {comparisonResult && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">📊 Výsledky porovnania</h3>
          
          <div className="space-y-4">
            {/* Podobnosti */}
            <div>
              <h4 className="font-semibold text-sm mb-2 text-green-700">✅ Podobnosti:</h4>
              <ul className="space-y-1">
                {comparisonResult.podobnosti?.map((p, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rozdiely */}
            <div>
              <h4 className="font-semibold text-sm mb-2 text-orange-700">⚠️ Rozdiely:</h4>
              <div className="space-y-2">
                {comparisonResult.rozdiely?.map((r, i) => (
                  <div key={i} className="bg-orange-50 p-3 rounded-lg text-sm">
                    <p className="font-semibold mb-1">{r.aspekt}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Dok. 1:</span> {r.dokument1}
                      </div>
                      <div>
                        <span className="font-medium">Dok. 2:</span> {r.dokument2}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Odporúčania */}
            <div>
              <h4 className="font-semibold text-sm mb-2 text-blue-700">💡 Odporúčania:</h4>
              <ul className="space-y-1">
                {comparisonResult.odporucania?.map((o, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* AI návrhy optimálnych úprav */}
      {suggestions && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="text-lg font-bold mb-4">🎯 AI Návrhy optimalizácie pre: {suggestions.dokument.nazov}</h3>
          
          <div className="space-y-4">
            {/* Optimálne úpravy */}
            {suggestions.navrhy.optimalne_upravy?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Optimálne povrchové úpravy:</h4>
                <ul className="space-y-1">
                  {suggestions.navrhy.optimalne_upravy.map((u, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternatívne materiály */}
            {suggestions.navrhy.alternativne_materialy?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Alternatívne materiály:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.navrhy.alternativne_materialy.map((m, i) => (
                    <Badge key={i} variant="secondary">{m}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Energetická efektívnosť */}
            {suggestions.navrhy.energeticka_efektivnost && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">⚡ Energetická efektívnosť:</h4>
                <p className="text-sm">{suggestions.navrhy.energeticka_efektivnost}</p>
              </div>
            )}

            {/* Estetické zlepšenia */}
            {suggestions.navrhy.esteticke_zlepsenia?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">🎨 Estetické zlepšenia:</h4>
                <ul className="space-y-1">
                  {suggestions.navrhy.esteticke_zlepsenia.map((z, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span>→</span>
                      {z}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Údržba */}
            {suggestions.navrhy.udrzba && (
              <div className="bg-amber-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">🔧 Odporúčania pre údržbu:</h4>
                <p className="text-sm">{suggestions.navrhy.udrzba}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Selector Dialog */}
      <Dialog open={showSelector} onOpenChange={setShowSelector}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vyberte dokument</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4">
            {analyzovaneDokumenty.slice(0, 30).map((dok) => (
              <Card 
                key={dok.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  addToComparison(dok);
                  if (selectedDocs.length >= 1) {
                    setShowSelector(false);
                  }
                }}
              >
                <img 
                  src={dok.subor_url} 
                  alt={dok.nazov}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs font-semibold truncate">{dok.nazov}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {dok.vizualna_analyza?.typ_obsahu || 'N/A'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}