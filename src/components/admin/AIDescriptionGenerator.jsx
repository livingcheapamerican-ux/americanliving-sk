import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Check, Languages, Copy } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_LANGUAGES } from "../LanguageContext";

export default function AIDescriptionGenerator({ dom, onDescriptionGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('sk');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [includeConfig, setIncludeConfig] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const config = includeConfig ? {
        montazHolodomu: 'ano',
        izolaciaNavysenie: 'premium',
        projektA0: true,
        tepelneCerpadlo: true,
        rekuperacia: true
      } : null;

      const response = await base44.functions.invoke('generateHouseDescription', {
        domId: dom.id,
        configuration: config,
        language: selectedLanguage
      });

      setGeneratedDescription(response.data.description);
      toast.success(`Popis vygenerovaný v jazyku: ${selectedLanguage.toUpperCase()}`);
      
      if (onDescriptionGenerated) {
        onDescriptionGenerated(response.data.description, selectedLanguage);
      }
    } catch (error) {
      toast.error('Chyba pri generovaní: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast.success('Popis skopírovaný');
  };

  const currentDescription = selectedLanguage === 'sk' ? dom.popis : dom[`popis_${selectedLanguage}`];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Generátor popisov</h3>
          <p className="text-sm text-gray-500">Automaticky vytvor profesionálny popis domu</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Jazyk
          </label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeConfig"
            checked={includeConfig}
            onChange={(e) => setIncludeConfig(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="includeConfig" className="text-sm text-gray-700">
            Zahrnúť A0 konfiguráciu (premium izolácia, TČ, rekuperácia)
          </label>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generujem...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Vygenerovať popis
            </>
          )}
        </Button>

        {currentDescription && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Aktuálny popis ({selectedLanguage.toUpperCase()})</p>
              <Badge variant="outline">Existujúci</Badge>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line">{currentDescription}</p>
          </div>
        )}

        {generatedDescription && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Nový vygenerovaný popis
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-1" />
                Kopírovať
              </Button>
            </div>
            <Textarea
              value={generatedDescription}
              onChange={(e) => setGeneratedDescription(e.target.value)}
              className="min-h-[200px] bg-white"
            />
          </div>
        )}
      </div>
    </Card>
  );
}