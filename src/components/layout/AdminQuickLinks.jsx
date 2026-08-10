import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Image, Brain, Upload, Sparkles, Languages, Activity, Zap, Users, Gift } from "lucide-react";

const ADMIN_LINKS = [
  { page: "AdminCennik", label: "Cenník Admin", icon: FileText },
  { page: "MojeKonto", label: "Moje Konto", icon: Users },
  { page: "Marketing", label: "Marketing", icon: Activity },
  { page: "AdminIntegrationLogs", label: "Kredity", icon: Zap },
  { page: "AdminUserManagement", label: "Používatelia", icon: Users },
  { page: "AdminCreditMonitor", label: "Credit Monitor", icon: Zap },
  { page: "AdminPixelSettings", label: "Meta Pixel", icon: Settings },
  { page: "AdminAnalyzaSessions", label: "Analýza relácií", icon: Activity },
  { page: "AdminSEOAnalyzer", label: "SEO Analyzer", icon: Zap },
  { page: "AIMarketingInsights", label: "AI Marketing", icon: Sparkles },
  { page: "SocialMediaDashboard", label: "Social Media", icon: Activity },
  { page: "AdminDokumenty", label: "Dokumenty", icon: FileText },
  { page: "AdminGoogleDrive", label: "Google Drive", icon: Settings },
];

const SUPER_ADMIN_LINKS = [
  { page: "AdminAnalyzaDomov", label: "AI analýza domov", icon: Brain },
  { page: "AdminSpravaDomov", label: "Správa domov", icon: Image },
  { page: "AdminUploadFotiekDomov", label: "Upload fotiek", icon: Upload },
  { page: "AdminPrekladyDomov", label: "Preklady domov", icon: FileText },
  { page: "AdminGenerujObrazkyBlogov", label: "Obrázky blogov", icon: Sparkles },
  { page: "AdminPrekladyBlogov", label: "Preklady blogov", icon: Languages },
  { page: "AdminPrekladyKonfiguratora", label: "Preklady konfigurátora", icon: Settings },
  { page: "AdminWatermark", label: "Watermark", icon: Image },
  { page: "AdminMigraciaFotiek", label: "Migrácia fotiek", icon: Upload },
  { page: "TestAnalyzaKonfiguratora", label: "Analýza konfigurátora", icon: Sparkles },
  { page: "RegenerujPrekladyDeFrSrHrEl", label: "Regenerácia prekladov", icon: Languages },
  { page: "AdminTestGemini", label: "Test Gemini", icon: Zap },
  { page: "AdminDotaciaHero", label: "Dotácia Hero", icon: Gift },
];

export default function AdminQuickLinks({ isAdmin, isSuperAdmin }) {
  if (!isAdmin && !isSuperAdmin) return null;

  const links = [
    ...(isAdmin ? ADMIN_LINKS : []),
    ...(isSuperAdmin ? SUPER_ADMIN_LINKS : []),
  ];

  return (
    <div className="hidden xl:block shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary hover:bg-slate-100 dark:hover:bg-white/10" title="Admin nástroje">
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2 max-h-[70vh] overflow-y-auto">
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Admin</p>
          <div className="grid gap-0.5">
            {links.map(({ page, label, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}