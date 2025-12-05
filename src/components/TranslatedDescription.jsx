import React from "react";
import { useLanguage } from "./LanguageContext";

export default function TranslatedDescription({ 
  text, 
  textEn, 
  textHu, 
  textPl, 
  textUk, 
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