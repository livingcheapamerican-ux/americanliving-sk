import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function AutoPrekladTicabhouse() {
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { data: domy = [] } = useQuery({
    queryKey: ['ticab-domy'],
    queryFn: () => base44.entities.Dom.filter({ vyrobca: 'Ticab house' })
  });

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const translateText = async (text, targetLang, langName) => {
    const prompt = `Translate this Slovak house specification/description to ${langName}. Preserve exact formatting, symbols (✔, ✅, ❌), bullet points, line breaks, and all numerical values. Keep technical terms accurate.

Slovak text:
${text}

Return ONLY the translated text, no explanations.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    return response.trim();
  };

  const processTranslations = async () => {
    setProcessing(true);
    addLog('Začínam preklad Ticabhouse domov...', 'info');

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'German' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'pl', name: 'Polish' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'fr', name: 'French' },
      { code: 'sr', name: 'Serbian' },
      { code: 'hr', name: 'Croatian' },
      { code: 'el', name: 'Greek' }
    ];

    for (const dom of domy) {
      if (dom.nazov === 'Lyon' || dom.nazov === 'Happy Wife' || dom.nazov.includes('Lyon') || dom.nazov.includes('Happy Wife')) {
        addLog(`⏭️ Preskakujem ${dom.nazov}`, 'skip');
        continue;
      }

      addLog(`📝 Spracovávam ${dom.nazov}...`, 'processing');

      try {
        const updateData = {};

        // Preklad popisu
        if (dom.popis) {
          for (const lang of languages) {
            const field = `popis_${lang.code}`;
            if (!dom[field] || dom[field].trim() === '') {
              addLog(`  🔄 Prekladám popis do ${lang.name}...`, 'translate');
              updateData[field] = await translateText(dom.popis, lang.code, lang.name);
              await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
            }
          }
        }

        // Preklad špecifikácie
        if (dom.specifikacia) {
          for (const lang of languages) {
            const field = `specifikacia_${lang.code}`;
            if (!dom[field] || dom[field].trim() === '') {
              addLog(`  🔄 Prekladám špecifikáciu do ${lang.name}...`, 'translate');
              updateData[field] = await translateText(dom.specifikacia, lang.code, lang.name);
              await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
            }
          }
        }

        if (Object.keys(updateData).length > 0) {
          await base44.entities.Dom.update(dom.id, updateData);
          addLog(`✅ ${dom.nazov} - preložených ${Object.keys(updateData).length} textov`, 'success');
        } else {
          addLog(`✓ ${dom.nazov} - všetky preklady už existujú`, 'skip');
        }

      } catch (error) {
        addLog(`❌ ${dom.nazov} - chyba: ${error.message}`, 'error');
      }
    }

    addLog('🎉 Preklad dokončený!', 'success');
    setProcessing(false);
    setCompleted(true);
  };

  useEffect(() => {
    if (domy.length > 0 && !processing && !completed) {
      processTranslations();
    }
  }, [domy]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'translate': return <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />;
      case 'skip': return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Automatický preklad Ticabhouse
            </h1>
            {processing && (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            )}
            {completed && (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 mb-2 text-gray-100">
                <span className="text-gray-500 text-xs">{log.time}</span>
                {getLogIcon(log.type)}
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'translate' ? 'text-purple-400' :
                  log.type === 'skip' ? 'text-gray-400' :
                  'text-gray-100'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>

          {completed && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✅ Preklad dokončený! Teraz môžeš skontrolovať preklady na stránke katalogu a detailov domov.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}