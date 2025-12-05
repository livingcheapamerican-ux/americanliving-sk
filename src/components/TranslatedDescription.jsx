import React from "react";
import { useLanguage } from "./LanguageContext";

export default function TranslatedDescription({ 
  text, 
  textEn, 
  textHu, 
  textPl, 
  textUk,
  textDe,
  textFr,
  textSr,
  textHr,
  textEl,
  className = "" 
}) {
  const { language } = useLanguage();

  const getTranslation = () => {
    switch (language) {
      case 'sk':
        return text;
      case 'en':
        return textEn || text;
      case 'hu':
        return textHu || text;
      case 'pl':
        return textPl || text;
      case 'uk':
        return textUk || text;
      case 'de':
        return textDe || text;
      case 'fr':
        return textFr || text;
      case 'sr':
        return textSr || text;
      case 'hr':
        return textHr || text;
      case 'el':
        return textEl || text;
      default:
        return text;
    }
  };

  return (
    <div className={className}>
      {getTranslation()}
    </div>
  );
}