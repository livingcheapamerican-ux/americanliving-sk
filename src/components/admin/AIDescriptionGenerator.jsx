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
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [includeConfig, setIncludeConfig] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyFeatures, setKeyFeatures] = useState([]);

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
        language: selectedLanguage,
        template: selectedTemplate
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

  const handleSave = async () => {
    try {
      const field = selectedLanguage === 'sk' ? 'popis' : `popis_${selectedLanguage}`;
      await base44.entities.Dom.update(dom.id, {
        [field]: generatedDescription
      });
      toast.success('Popis uložený');
      if (onDescriptionGenerated) {
        onDescriptionGenerated(generatedDescription, selectedLanguage);
      }
    } catch (error) {
      toast.error('Chyba pri ukladaní: ' + error.message);
    }
  };

  const handleGenerateSummary = async () => {
    if (!generatedDescription) {
      toast.error('Najprv vygeneruj popis');
      return;
    }
    
    setGeneratingSummary(true);
    try {
      const response = await base44.functions.invoke('generateHouseSummary', {
        description: generatedDescription,
        type: 'summary',
        language: selectedLanguage
      });
      setSummary(response.data.result);
      toast.success('Súhrn vygenerovaný');
    } catch (error) {
      toast.error('Chyba pri generovaní súhrnu: ' + error.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateBullets = async () => {
    if (!generatedDescription) {
      toast.error('Najprv vygeneruj popis');
      return;
    }
    
    setGeneratingSummary(true);
    try {
      const response = await base44.functions.invoke('generateHouseSummary', {
        description: generatedDescription,
        type: 'bullets',
        language: selectedLanguage
      });
      setKeyFeatures(response.data.result);
      toast.success('Kľúčové vlastnosti vygenerované');
    } catch (error) {
      toast.error('Chyba pri generovaní: ' + error.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const currentDescription = selectedLanguage === 'sk' ? dom.popis : dom[`popis_${selectedLanguage}`];

  const templates = [
    { value: 'standard', label: 'Štandardný', desc: 'Vyvážený profesionálny popis', icon: '📝' },
    { value: 'technical', label: 'Technický', desc: 'Detailné špecifikácie a parametre', icon: '🔧' },
    { value: 'marketing', label: 'Marketingový', desc: 'Emotívny a presvedčivý', icon: '✨' },
    { value: 'social', label: 'Pre sociálne siete', desc: 'Krátky a pútavý (150 slov)', icon: '📱' }
  ];

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
        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Šablóna popisu
            </label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map(tmpl => (
                  <SelectItem key={tmpl.value} value={tmpl.value}>
                    {tmpl.icon} {tmpl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            {templates.find(t => t.value === selectedTemplate)?.desc}
          </p>
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
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Vygenerovaný popis - Upraviť pred uložením
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Kopírovať
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSave}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Uložiť
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                className="min-h-[200px] bg-white"
                placeholder="Upravte vygenerovaný text pred uložením..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {generatedDescription.split(' ').length} slov
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="flex-1"
              >
                {generatingSummary ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '📋'}
                Vygenerovať súhrn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateBullets}
                disabled={generatingSummary}
                className="flex-1"
              >
                {generatingSummary ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '🎯'}
                Kľúčové vlastnosti
              </Button>
            </div>

            {summary && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 mb-2">Krátky súhrn (100 slov)</p>
                <p className="text-sm text-gray-700">{summary}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(summary)}
                  className="mt-2"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Kopírovať súhrn
                </Button>
              </div>
            )}

            {keyFeatures.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-2">Kľúčové vlastnosti</p>
                <ul className="space-y-1">
                  {keyFeatures.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(keyFeatures.join('\n'))}
                  className="mt-2"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Kopírovať body
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}