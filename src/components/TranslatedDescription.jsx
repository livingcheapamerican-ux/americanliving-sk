import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "./LanguageContext";
import { Loader2 } from "lucide-react";

export default function TranslatedDescription({ text, className = "" }) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const [cache, setCache] = useState({});

  useEffect(() => {
    // Ak je jazyk slovenčina, zobraz originál
    if (language === 'sk' || !text) {
      setTranslatedText(text);
      return;
    }

    // Skontroluj cache
    const cacheKey = `${language}-${text.substring(0, 50)}`;
    if (cache[cacheKey]) {
      setTranslatedText(cache[cacheKey]);
      return;
    }

    // Prekladaj pomocou AI
    const translateText = async () => {
      setIsTranslating(true);
      try {
        const languageNames = {
          en: 'English',
          hu: 'Hungarian',
          pl: 'Polish',
          uk: 'Ukrainian'
        };
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate the following Slovak text to ${languageNames[language]}. Keep all technical terms, measurements, and brand names unchanged. Return only the translated text without any explanation or additional text.

Text to translate:
${text}`,
          response_json_schema: {
            type: "object",
            properties: {
              translation: { type: "string" }
            },
            required: ["translation"]
          }
        });

        const translated = result.translation || text;
        setTranslatedText(translated);
        setCache(prev => ({ ...prev, [cacheKey]: translated }));
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, language]);

  if (isTranslating) {
    return (
      <div className={`${className} flex items-center gap-2 text-gray-500`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Translating...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {translatedText}
    </div>
  );
}