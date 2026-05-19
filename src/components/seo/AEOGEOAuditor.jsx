import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Key, Copy, AlertTriangle, Lightbulb, Code, FileJson, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Simple hash function for caching
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export default function AEOGEOAuditor({ initialTitle = "", initialContent = "" }) {
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Load API key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('direct_gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('direct_gemini_api_key', apiKey);
    setShowSettings(false);
    toast.success('API kľúč bol lokálne uložený.');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopírované do schránky');
  };

  const analyzeContent = async () => {
    if (!apiKey) {
      toast.error('Na spustenie analýzy je potrebný Gemini API kľúč.');
      setShowSettings(true);
      return;
    }
    if (!title || !content) {
      toast.error('Názov a obsah sú povinné pre analýzu.');
      return;
    }

    // Check cache
    const contentHash = simpleHash(title + content);
    const cachedResult = sessionStorage.getItem(`aeo_geo_cache_${contentHash}`);
    if (cachedResult) {
      setResults(JSON.parse(cachedResult));
      toast.success('Výsledky načítané z cache (žiadne kredity neboli spotrebované).');
      return;
    }

    setLoading(true);

    try {
      const prompt = `Si špičkový AI SEO, AEO a GEO špecialista.
Analyzuj nasledujúci obsah a poskytni odporúčania pre optimalizáciu pre AI vyhľadávače (ChatGPT, Perplexity, Google AI Overviews).

NÁZOV STRÁNKY: ${title}
OBSAH:
${content}

Tvojou úlohou je vrátiť JSON s presne touto štruktúrou (žiadny markdown blok, len čistý JSON):
{
  "information_gain_score": <číslo od 0 do 100, ako veľmi je obsah unikátny a obsahuje fakty/štatistiky namiesto vaty>,
  "llm_tldr": "<hutné zhrnutie (max 3 vety), ktoré je optimalizované pre to, aby si ho AI modely uložili do pamäte. Musí obsahovať najdôležitejšie fakty a čísla z textu>",
  "geo_recommendations": [
    "<konkrétne odporúčanie 1 pre zlepšenie Generative Engine Optimization (napr. chýba štatistika, pridaj citáciu experta)>",
    "<odporúčanie 2>"
  ],
  "faq_schema": "<Vygeneruj validný JSON-LD kód pre FAQ (najčastejšie otázky) na základe obsahu, pripravený na skopírovanie do <script type='application/ld+json'>>"
}`;

      // Direct-to-Provider Call (Bypassing Platform Wrappers for zero margin)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Chyba API');
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      const parsedResults = JSON.parse(resultText);
      
      // Save to cache to prevent loop/credit drain
      sessionStorage.setItem(`aeo_geo_cache_${contentHash}`, JSON.stringify(parsedResults));
      
      setResults(parsedResults);
      toast.success('AEO/GEO Analýza bola úspešne vygenerovaná!');
      
    } catch (error) {
      console.error(error);
      toast.error('Chyba pri generovaní: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Settings Panel */}
      {showSettings && (
        <Card className="p-4 border-orange-200 bg-orange-50 mb-6">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-orange-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-orange-900 mb-1">Direct-to-Provider Konfigurácia</h4>
              <p className="text-sm text-orange-800 mb-3">
                Pre splnenie pravidla o efektivite nákladov a zabráneniu plytvania integračnými kreditmi Base44, tento modul komunikuje priamo s Gemini API. 
                Vložte svoj bezplatný kľúč z Google AI Studio. Kľúč sa ukladá len lokálne vo vašom prehliadači.
              </p>
              <div className="flex gap-2">
                <Input 
                  type="password"
                  placeholder="AIzaSy..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white"
                />
                <Button onClick={saveApiKey} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Uložiť kľúč
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Input Form */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AEO & GEO Analýza (Direct Mode)
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} title="Nastavenia API">
            <Key className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Názov obsahu</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Napr. Výhody modulárnych domov"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Hlavný text na analýzu</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Skopíruj text článku alebo popisu domu..."
              rows={8}
            />
          </div>
          <Button 
            onClick={analyzeContent}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Spracovávam (bez spotreby platformových kreditov)...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Vykonaj AEO/GEO Analýzu
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Information Gain Score */}
            <Card className="p-5 border-l-4 border-l-blue-500">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Information Gain (Unikátnosť)
              </h4>
              <div className="flex items-end gap-3 mt-4">
                <span className={`text-4xl font-black ${
                  results.information_gain_score > 80 ? 'text-green-600' :
                  results.information_gain_score > 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {results.information_gain_score}
                </span>
                <span className="text-gray-500 mb-1">/ 100</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Hodnotí, koľko unikátnych faktov, čísel a dát text obsahuje v porovnaní so všeobecnou "vatou". AI vyhľadávače citujú texty s vysokým skóre.
              </p>
            </Card>

            {/* LLM TL;DR */}
            <Card className="p-5 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-500" />
                  LLM TL;DR Zhrnutie
                </h4>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.llm_tldr)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm bg-purple-50 p-3 rounded text-purple-900 border border-purple-100 font-medium leading-relaxed">
                {results.llm_tldr}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tento text by mal byť umiestnený hneď na začiatku článku (ako "Zhrnutie pre rýchle čítanie"). Pomáha to AI modelom okamžite extrahovať podstatu.
              </p>
            </Card>
          </div>

          {/* GEO Odporúčania */}
          <Card className="p-5 border-l-4 border-l-orange-500">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              GEO Odporúčania (Generative Engine Optimization)
            </h4>
            <ul className="space-y-3">
              {results.geo_recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                  <Badge className="bg-orange-200 text-orange-800 mt-0.5">#{idx + 1}</Badge>
                  <span className="text-sm text-gray-800">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* FAQ Schema */}
          <Card className="p-5 border-l-4 border-l-green-500">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-green-500" />
                JSON-LD FAQ Schema
              </h4>
              <Button onClick={() => copyToClipboard(results.faq_schema)} className="bg-green-600 hover:bg-green-700 text-white">
                <Copy className="w-4 h-4 mr-2" />
                Kopírovať JSON-LD kód
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vložte tento vygenerovaný kód do <code>&lt;head&gt;</code> vašej stránky (alebo cez SEO plugin) pre zobrazenie v AI odpovediach a Google Snippets.
            </p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
              {results.faq_schema}
            </pre>
          </Card>
          
        </div>
      )}
    </div>
  );
}
