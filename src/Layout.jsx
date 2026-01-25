import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Grid3x3, Phone, Info, Menu, X, Mail, Settings, FileText, Image, Brain, Upload, ChevronDown, Sparkles, Languages, FileText as BlogIcon, Activity, Zap, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AVAILABLE_LANGUAGES } from "./components/LanguageContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import Chatbot from "./components/Chatbot";
import AIAsistent from "./components/AIAsistent";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import UserTracking from "./components/UserTracking";
import SessionRecorder from "./components/SessionRecorder";
import PassiveIncomeButton from "./components/PassiveIncomeButton";




function LayoutContent({ children }) {
  let location;
  try {
    location = useLocation();
  } catch (e) {
    // Fallback if useLocation fails
    location = { pathname: window.location.pathname };
  }
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  // Server-Side Facebook Tracking
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await base44.functions.invoke('trackFacebookPageView', {
          user_agent: navigator.userAgent,
          event_source_url: window.location.href
        });
      } catch (error) {
        // Silently fail - tracking should not disrupt user experience
      }
    };
    
    trackPageView();
  }, [location.pathname]);

        // GTM "Trojan Horse" Injection
        useEffect(() => {
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KNG5JWXS');
        }, []);

  // Globálna ochrana proti sťahovaniu obsahu
  useEffect(() => {
    const preventDownload = (e) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const preventDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const preventSelectStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Zakázať context menu
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Zakázať drag & drop obrázkov
    document.addEventListener('dragstart', preventDragStart);
    
    // Zakázať označovanie obrázkov
    document.addEventListener('selectstart', preventSelectStart);

    // Zakázať F12, Ctrl+Shift+I, Ctrl+U
    const preventDevTools = (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', preventDevTools);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDragStart);
      document.removeEventListener('selectstart', preventSelectStart);
      document.removeEventListener('keydown', preventDevTools);
    };
  }, []);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: t('home'), path: createPageUrl("Domov"), icon: Home },
    ...(isAdmin ? [{ name: '💰 ' + t('adminPriceList'), path: createPageUrl("AdminCennik"), icon: Grid3x3 }] : []),
    { name: t('catalog'), path: createPageUrl("Katalog"), icon: Grid3x3 },
    { name: t('aiRecommendations'), path: createPageUrl("OdporucanieDomov"), icon: Sparkles },
    { name: t('about'), path: createPageUrl("ONas"), icon: Info },
    { name: t('blog'), path: createPageUrl("Blog"), icon: BlogIcon },
    { name: t('contact'), path: createPageUrl("Kontakt"), icon: Phone },
  ];

  const adminNavItems = isAdmin ? [
    { name: '📊 ' + t('adminMarketing'), path: createPageUrl("Marketing"), icon: Activity }
  ] : [];
  const isSuperAdmin = user?.super_admin === true;

  // Fetch Meta Pixel config
  const { data: pixelConfig } = useQuery({
    queryKey: ['meta-pixel-config'],
    queryFn: async () => {
      const configs = await base44.entities.AppConfiguration.filter({ config_key: 'meta_pixel' });
      return configs[0] || null;
    }
  });

  const { data: lokacii } = useQuery({
    queryKey: ['lokacii-seo'],
    queryFn: () => base44.entities.LokaciaSEO.list()
  });

  const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png";
  const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #EF4444;
          --secondary: #dc2626;
          --accent: #B8860B;
          --dark-brown: #3E2723;
        }

        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary { color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .text-accent { color: var(--accent); }
        .hover\\:bg-secondary:hover { background-color: var(--secondary); }
        .border-primary { border-color: var(--primary); }

        @keyframes blinking-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .nav-blink {
          animation: blinking-pulse 1.2s ease-in-out infinite;
        }

        html { scroll-behavior: smooth; }

        /* Ochrana proti sťahovaniu obsahu */
        img {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          pointer-events: auto;
        }

        * {
          -webkit-touch-callout: none;
        }
      `}</style>

      {/* Toast Container */}
      <Toaster position="top-right" richColors closeButton />

      {/* Header */}
      <header 
      className={`fixed left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md py-0`}
      >
        <div className="container mx-auto px-1 sm:px-4 py-0.5 sm:py-0.5">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Mobile - Language Dropdown */}
            <div className="sm:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-white hover:bg-primary/90 transition-all">
                    <span className="text-lg">{AVAILABLE_LANGUAGES.find(l => l.code === language)?.flag}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1">
                  <div className="grid gap-1">
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all text-left ${
                          language === lang.code
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
              <Link to={createPageUrl("Domov")} className="group">
                <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-5 sm:h-8 md:h-10 lg:h-12 xl:h-16 w-auto transition-transform group-hover:scale-105"
                />
              </Link>

              <div className="hidden md:flex flex-col items-center gap-0">
                <span className="text-[7px] lg:text-[9px] text-gray-600 font-medium whitespace-nowrap">Powered by</span>
                <a 
                  href="https://konfiga.eu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src={KONFIGA_LOGO_URL} 
                    alt="Konfiga.eu - AI CRM" 
                    className="h-5 sm:h-6 md:h-7 lg:h-9 xl:h-11 w-auto"
                  />
                </a>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {[...navItems, ...adminNavItems].map((item) => {
                const tourId = item.path === createPageUrl("Katalog") ? "nav-katalog"
                  : item.path === createPageUrl("OdporucanieDomov") ? "nav-ai"
                  : item.path === createPageUrl("ONas") ? "nav-onas"
                  : item.path === createPageUrl("Kontakt") ? "nav-kontakt"
                  : null;

                const isCatalog = item.path === createPageUrl("Katalog");

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={tourId}
                    className={`px-2 xl:px-3 py-1 xl:py-1.5 rounded-md text-xs lg:text-sm xl:text-base font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isCatalog ? 'nav-blink' : ''}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              </nav>

            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {/* Desktop - Language Flags */}
              <div className="hidden lg:flex items-center gap-1 flex-nowrap mr-2">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md text-xl transition-all ${
                      language === lang.code
                        ? 'bg-primary ring-2 ring-primary shadow-md scale-110'
                        : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    }`}
                    title={lang.name}
                  >
                    <span>{lang.flag}</span>
                  </button>
                ))}
              </div>
            </div>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {isAdmin && (
              <>
                <Link to={createPageUrl("AdminUserManagement")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminUserManagement')}>
                    <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPixelSettings")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminMetaPixel')}>
                    <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminAnalyzaSessions")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminAnalyticsSessions')}>
                    <Activity className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminSEOAnalyzer")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminSEOAnalyzer')}>
                    <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AIMarketingInsights")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminAIMarketing')}>
                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("SocialMediaDashboard")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminSocialMedia')}>
                    <Activity className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Link to={createPageUrl("AdminAnalyzaDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminAIAnalysis')}>
                    <Brain className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminSpravaDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminHouseManagement')}>
                    <Image className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminUploadFotiekDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminPhotoUpload')}>
                    <Upload className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminTranslationsHouses')}>
                    <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminGenerujObrazkyBlogov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminBlogImageGen')}>
                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyBlogov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminBlogTranslations')}>
                    <Languages className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyKonfiguratora")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminConfiguratorTranslations')}>
                    <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminWatermark")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminWatermark')}>
                    <Image className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminMigraciaFotiek")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminPhotoMigration')}>
                    <Upload className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("TestAnalyzaKonfiguratora")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminConfiguratorAnalysis')}>
                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("RegenerujPrekladyDeFrSrHrEl")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminRegenerateTranslations')}>
                    <Languages className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminTestGemini")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminTestGemini')}>
                    <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                </>
                )}
            {isAdmin && (
              <>
                <Link to={createPageUrl("AdminDokumenty")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminDocuments')}>
                    <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminGoogleDrive")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title={t('adminGoogleDrive')}>
                    <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
              </>
            )}
            <a href="tel:+421905138124" className="text-primary font-semibold text-xs lg:text-sm xl:text-base whitespace-nowrap">
              +421 905 138 124
            </a>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-xs lg:text-sm h-7 lg:h-8 px-3 lg:px-4 whitespace-nowrap">
                {t('contact')}
              </Button>
            </Link>
            {isSuperAdmin && (
              <Link to={createPageUrl("Domov")}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs lg:text-sm h-7 lg:h-8 px-3 lg:px-4 whitespace-nowrap">
                  <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </Button>
              </Link>
            )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-4 hover:bg-gray-100 rounded-lg min-w-[56px] min-h-[56px] flex items-center justify-center active:bg-gray-200"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 text-primary" />
              ) : (
                <Menu className="w-7 h-7 text-primary" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4 space-y-2">
              <div className="md:hidden flex items-center justify-center gap-2 py-3 border-b">
                <span className="text-xs text-gray-600 font-medium">Powered by</span>
                <a 
                  href="https://konfiga.eu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <img 
                    src={KONFIGA_LOGO_URL} 
                    alt="Konfiga.eu" 
                    className="h-12 w-auto"
                  />
                </a>
              </div>

              {[...navItems, ...adminNavItems].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              {isSuperAdmin && (
                <>
                  <Link
                    to={createPageUrl("AdminAnalyzaDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Brain className="w-5 h-5" />
                    {t('adminAIAnalysis')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminSpravaDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Image className="w-5 h-5" />
                    {t('adminHouseManagement')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminUploadFotiekDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Image className="w-5 h-5" />
                    {t('adminPhotoUpload')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    {t('adminTranslationsHouses')}
                  </Link>
                  <Link
                    to={createPageUrl("TestAnalyzaKonfiguratora")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('adminConfiguratorAnalysis')}
                  </Link>
                  <Link
                    to={createPageUrl("RegenerujPrekladyDeFrSrHrEl")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Languages className="w-5 h-5" />
                    {t('adminRegenerateTranslations')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminGenerujObrazkyBlogov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('adminBlogImageGen')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyBlogov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Languages className="w-5 h-5" />
                    {t('adminBlogTranslations')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyKonfiguratora")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    {t('adminConfiguratorTranslations')}
                  </Link>
                  <Link
                    to={createPageUrl("AdminMigraciaFotiek")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    {t('adminPhotoMigration')}
                  </Link>
                  </>
                  )}
                  {isAdmin && (
                  <>
                    <Link
                      to={createPageUrl("AdminUserManagement")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Users className="w-5 h-5" />
                      {t('adminUserManagement')}
                    </Link>
                    <Link
                      to={createPageUrl("AdminPixelSettings")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      {t('adminMetaPixel')}
                    </Link>
                    <Link
                      to={createPageUrl("AdminAnalyzaSessions")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Activity className="w-5 h-5" />
                      {t('adminAnalyticsSessions')}
                    </Link>
                    <Link
                      to={createPageUrl("AdminSEOAnalyzer")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Zap className="w-5 h-5" />
                      {t('adminSEOAnalyzer')}
                    </Link>
                    <Link
                      to={createPageUrl("AIMarketingInsights")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      {t('adminAIMarketing')}
                    </Link>
                    <Link
                      to={createPageUrl("SocialMediaDashboard")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Activity className="w-5 h-5" />
                      {t('adminSocialMedia')}
                    </Link>
                    <Link
                      to={createPageUrl("AdminDokumenty")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <FileText className="w-5 h-5" />
                      {t('adminDocuments')}
                    </Link>
                  <Link
                    to={createPageUrl("AdminGoogleDrive")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    {t('adminGoogleDrive')}
                  </Link>
                  </>
                  )}
              <div className="pt-4 space-y-2">
                <div className="flex justify-center py-2">
                  <LanguageSelector />
                </div>
                <a
                  href="tel:+421905138124"
                  className="flex items-center justify-center gap-2 text-primary font-semibold py-3"
                >
                  <Phone className="w-5 h-5" />
                  +421 905 138 124
                </a>
                <Link to={createPageUrl("Kontakt")} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold">
                    {t('contactUs')}
                  </Button>
                </Link>
              </div>
              </nav>
              )}
        </div>
      </header>

      <main className="lg:bg-gray-100 relative" style={{ paddingTop: '2.5rem' }}>
        <div className="lg:max-w-[1200px] xl:max-w-[1400px] lg:mx-auto bg-white lg:shadow-xl min-h-screen relative z-20">
          {children}
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-24 w-auto"
                />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {t('distributorAndBuilderFooter')}
              </p>
              <p className="text-gray-300 text-sm">
                {t('officialDistributor')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('navigation')}</h4>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-gray-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={createPageUrl("FAQ")} className="text-gray-300 hover:text-white transition-colors">
                    {t('faq')}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('contact')}</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+421905138124" className="hover:text-white">+421 905 138 124</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@americanliving.sk" className="hover:text-white">info@americanliving.sk</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Kde staviame</h4>
              <ul className="space-y-1.5 text-sm">
                {lokacii && lokacii.length > 0 ? (
                  lokacii.map((lokacia) => (
                    <li key={lokacia.id}>
                      <a 
                        href={`/lokalita/${lokacia.slug}`}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {lokacia.nazov_mesta}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-xs">Načítavam lokality...</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">{t('poweredByAI')}</h4>
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4 rounded-xl border border-cyan-500/20">
                <a href="https://konfiga.eu" target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src={KONFIGA_LOGO_URL} 
                    alt="Konfiga.eu - AI CRM" 
                    className="h-20 w-auto mx-auto mb-2"
                  />
                  <p className="text-xs text-center text-cyan-300">
                    {t('aiFeaturesOnSite')}
                  </p>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} American Living. {t('allRightsReserved')}.</p>
            <p className="mt-2">{t('builtHouses')}</p>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
      <SessionRecorder />

      <div className="hidden md:block">
        <Chatbot />
      </div>
      </div>
      );
      }

      export default function Layout({ children }) {
      return (
      <HelmetProvider>
      <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
      </LanguageProvider>
      </HelmetProvider>
      );
      }