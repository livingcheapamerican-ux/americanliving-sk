import React from 'react';
import { useLanguage, AVAILABLE_LANGUAGES } from './LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelector({ variant = "default" }) {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === "ghost" ? "ghost" : "outline"} 
          size="sm" 
          className="gap-1.5 h-8 px-2"
        >
          <span className="text-base">{currentLang.flag}</span>
          <Globe className="w-3.5 h-3.5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {AVAILABLE_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-blue-50 text-blue-700' : ''}`}
          >
            <span className="text-base mr-2">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}