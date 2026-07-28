import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Grid3x3, Phone, Info, Menu, X, Mail, Settings, FileText, Image, Brain, Upload, ChevronDown, Sparkles, Languages, FileText as BlogIcon, Activity, Zap, Users, Gift, MapPinned, MessageCircle, Sun, Moon, Calendar, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AVAILABLE_LANGUAGES } from "./components/LanguageContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Toaster } from "sonner";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Chatbot from "./components/Chatbot";
import AIAsistent from "./components/AIAsistent";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import UserTracking from "./components/UserTracking";
import SessionRecorder from "./components/SessionRecorder";




function LayoutContent({ children }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  
  // Theme state: default is 'light' (approved by user), persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch (e) {
      console.warn("localStorage is not available:", e);
      return "light";
    }
  });

  // Apply theme class to document element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Noindex meta tag for admin/internal pages and configuration variants
  const noindexPaths = ['/AIMarketingInsights', '/AdminCennik', '/AutoSEOTrigger', '/AdminAnalyzaSessions', '/Admin', '/Test', '/Auto', '/Regeneruj', '/MojeKonto', '/MojaPonuka', '/AdminMojeKonto'];
  
  // Base canonical URL calculation (no-www, lowercase path)
  const cleanPath = location.pathname.toLowerCase().replace(/\/+$/, '');
  const searchParams = new URLSearchParams(location.search);
  let defaultCanonical = `https://americanliving.sk${cleanPath || '/'}`;

  const isStaging = typeof window !== 'undefined' &&
    window.location.hostname !== 'americanliving.sk' &&
    window.location.hostname !== 'www.americanliving.sk';

  // Client-side variant parameter detection for noindex, follow injection
  const variantKeys = ['color', 'option', 'facade', 'strecha', 'okna', 'material', 'vybava', 'typ'];
  const hasVariantParams = variantKeys.some(key => searchParams.has(key));
  const isConfiguratorOrCatalog = cleanPath.includes('konfigurator') || cleanPath.includes('katalog') || cleanPath.includes('detail-domu');

  const shouldNoindex = isStaging || noindexPaths.some(path => location.pathname.toLowerCase().startsWith(path.toLowerCase()));
  const shouldNoindexFollow = isConfiguratorOrCatalog && hasVariantParams;

  // Keep allowed query parameters for specific routes
  if (cleanPath === '/detail-domu' || cleanPath.includes('detaildomu')) {
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    if (slug) {
      defaultCanonical += `?slug=${slug.toLowerCase()}`;
    } else if (id) {
      defaultCanonical += `?id=${id}`;
    }
  } else if (cleanPath === '/blog-detail' || cleanPath.includes('blogdetail')) {
    const id = searchParams.get('id');
    if (id) {
      defaultCanonical += `?id=${id}`;
    }
  }



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
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const navItems = [
    { name: t('home'), path: createPageUrl("Domov"), icon: Home },
    { name: t('dotacia'), path: createPageUrl("DotaciaAmericana"), icon: Gift },
    { name: t('showroom'), path: createPageUrl("Showroom"), icon: Calendar },
    ...(isAdmin ? [{ name: '💰 ' + t('adminPriceList'), path: createPageUrl("AdminCennik"), icon: Grid3x3 }] : []),
    ...(isAdmin ? [{ name: '🗺️ ' + t('grantCampaign'), path: createPageUrl("GrantovaKampan"), icon: MapPinned }] : []),
    { name: t('catalog'), path: createPageUrl("Katalog"), icon: Grid3x3 },
    { name: t('downloadCatalog'), path: createPageUrl("StiahniteSiNasKatalog"), icon: Download },
    { name: t('aiRecommendations'), path: createPageUrl("OdporucanieDomov"), icon: Sparkles },
    { name: '✨ Realitný Portál AI', path: createPageUrl("RealEstatePortal"), icon: Sparkles },
    { name: t('about'), path: createPageUrl("ONas"), icon: Info },
    { name: t('blog'), path: createPageUrl("Blog"), icon: BlogIcon },
    { name: t('contact'), path: createPageUrl("Kontakt"), icon: Phone },
    // Moje Konto – zatiaľ len pre adminov
    ...(isAdmin || user?.super_admin ? [{ name: '👤 ' + t('myAccount'), path: '/MojeKonto', icon: Users, isMyAccount: true }] : []),
  ];

  const adminNavItems = isAdmin ? [
    { name: '📊 ' + t('adminMarketing'), path: createPageUrl("Marketing"), icon: Activity },
    { name: '💳 ' + t('credits'), path: createPageUrl("AdminIntegrationLogs"), icon: Activity, blink: true }
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
    <div className="min-h-screen bg-background text-foreground font-['Outfit'] transition-colors duration-300">
      <Helmet>
        {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
        {shouldNoindexFollow && !shouldNoindex && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={defaultCanonical} />
      </Helmet>
      <style>{`
        :root {
          --primary: #9E2A2B;
          --secondary: #802021;
          --accent: #C5A880;
          --dark-brown: #0D0D11;
          --bg-main: #08080A;
          --text-main: #f1f5f9;
        }

        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary { color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .text-accent { color: var(--accent); }
        .hover\\:bg-secondary:hover { background-color: var(--secondary); }
        .border-primary { border-color: var(--primary); }

        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        .nav-shimmer {
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
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

      {/* Header - Floating Pill Design */}
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'top-4' : 'top-0 sm:top-6'} px-2 sm:px-6`}
      >
        <div className={`mx-auto max-w-7xl transition-all duration-500 ${(scrolled && !mobileMenuOpen) ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-white/10 rounded-full py-2 px-4' : (mobileMenuOpen ? 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-2xl mt-2' : 'bg-transparent py-4 px-4')}`}>
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Mobile - placeholder for layout balance */}
            <div className="sm:hidden w-8" />

            <div className="flex-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
              <Link to={createPageUrl("Domov")} className="group">
                <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-5 sm:h-8 md:h-10 lg:h-12 xl:h-16 w-auto transition-transform group-hover:scale-105"
                />
              </Link>

              <div className="hidden md:flex flex-col items-center gap-0">
                <span className="text-[7px] lg:text-[9px] text-slate-400 font-medium whitespace-nowrap">Powered by</span>
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
            
            {/* Navigácia ako Glassmorphism Pill */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {[...navItems, ...adminNavItems].map((item) => {
                const tourId = item.path === createPageUrl("Katalog") ? "nav-katalog"
                  : item.path === createPageUrl("OdporucanieDomov") ? "nav-ai"
                  : item.path === createPageUrl("ONas") ? "nav-onas"
                  : item.path === createPageUrl("Kontakt") ? "nav-kontakt"
                  : null;

                const isCatalog = item.path === createPageUrl("Katalog");
                const isDotacia = item.path === createPageUrl("DotaciaAmericana");
                const isKredity = item.blink === true;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-tour={tourId}
                    className={`rounded-full font-bold transition-all px-4 py-2 text-sm ${
                      isActive(item.path)
                        ? 'bg-red-600/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : isDotacia 
                          ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        : isKredity
                          ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                          : 'text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {isDotacia ? (
                      <>
                        <span className="font-black">{t('dotacia')}</span>
                        <span className="text-[10px] xl:text-xs font-black text-yellow-300 drop-shadow-lg">AMERICANA</span>
                      </>
                    ) : (
                      item.name
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {/* Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                type="button"
                className="flex items-center justify-center p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-[#C5A880]/15 hover:text-[#C5A880] dark:hover:text-[#C5A880] transition-all duration-300 h-9 w-9 mr-1"
                title={theme === "light" ? "Prepnúť na tmavý režim" : "Prepnúť na svetlý režim"}
              >
                {theme === "light" ? (
                  <Moon className="w-4.5 h-4.5" />
                ) : (
                  <Sun className="w-4.5 h-4.5" />
                )}
              </button>

              {/* Desktop - Language Dropdown */}
              <div className="hidden lg:block mr-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm">
                      <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      <span className="text-sm font-medium text-slate-200">
                        {AVAILABLE_LANGUAGES.find(l => l.code === language)?.flag}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid gap-1">
                      {AVAILABLE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left ${
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
            </div>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {isAdmin && (
              <>
                <Link to={createPageUrl("AdminUserManagement")}>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8" title={t('adminUserManagement')}>
                    <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminCreditMonitor")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Credit Monitor">
                    <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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
                <Link to={createPageUrl("AdminDotaciaHero")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Dotácia Hero">
                    <Gift className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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

            <div className="lg:hidden flex items-center gap-1">
              {/* Mobile Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                type="button"
                className="p-3 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                title={theme === "light" ? "Tmavý režim" : "Svetlý režim"}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* Mobile - Language Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 transition-all min-w-[44px] min-h-[44px] justify-center">
                    <span className="text-lg">{AVAILABLE_LANGUAGES.find(l => l.code === language)?.flag}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
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
              {/* Mobile AI Chatbot Button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                className="p-3 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center active:bg-gray-200 relative"
                aria-label="AI Chatbot"
              >
                <MessageCircle className="w-6 h-6 text-red-600" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full text-[7px] font-bold text-white flex items-center justify-center">AI</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-4 hover:bg-gray-100 rounded-lg min-w-[56px] min-h-[56px] flex items-center justify-center active:bg-gray-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7 text-primary" />
                ) : (
                  <Menu className="w-7 h-7 text-primary" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="lg:hidden mt-3 border-t border-slate-200 dark:border-white/10 pt-3 overflow-y-auto max-h-[80vh]">

              {/* Hlavná navigácia */}
              <div className="space-y-1 pb-3">
                {[...navItems, ...adminNavItems].map((item) => {
                  const isDotacia = item.path === createPageUrl("DotaciaAmericana");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all text-base min-h-[64px] ${
                        isActive(item.path)
                          ? 'bg-red-600/15 text-red-500 border border-red-500/30'
                          : isDotacia
                            ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                            : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 dark:active:bg-white/15'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive(item.path) ? 'bg-red-500/20 text-red-500' :
                        isDotacia ? 'bg-white/20 text-white' :
                        'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {isDotacia ? (
                        <div className="flex flex-col leading-tight">
                          <span className="font-black text-base">{t('dotacia')}</span>
                          <span className="text-xs font-black text-yellow-300 drop-shadow-lg">AMERICANA</span>
                        </div>
                      ) : (
                        <span className="text-base font-semibold">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Admin sekcia */}
              {(isSuperAdmin || isAdmin) && (
                <div className="border-t border-slate-200 dark:border-white/10 pt-3 pb-3">
                  <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Admin</p>
                  <div className="space-y-1">
                    {isSuperAdmin && <>
                      <Link to={createPageUrl("AdminAnalyzaDomov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4" /></div>
                        {t('adminAIAnalysis')}
                      </Link>
                      <Link to={createPageUrl("AdminSpravaDomov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Image className="w-4 h-4" /></div>
                        {t('adminHouseManagement')}
                      </Link>
                      <Link to={createPageUrl("AdminUploadFotiekDomov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Upload className="w-4 h-4" /></div>
                        {t('adminPhotoUpload')}
                      </Link>
                      <Link to={createPageUrl("AdminPrekladyDomov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4" /></div>
                        {t('adminTranslationsHouses')}
                      </Link>
                      <Link to={createPageUrl("AdminGenerujObrazkyBlogov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
                        {t('adminBlogImageGen')}
                      </Link>
                      <Link to={createPageUrl("AdminPrekladyBlogov")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Languages className="w-4 h-4" /></div>
                        {t('adminBlogTranslations')}
                      </Link>
                      <Link to={createPageUrl("AdminPrekladyKonfiguratora")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Settings className="w-4 h-4" /></div>
                        {t('adminConfiguratorTranslations')}
                      </Link>
                      <Link to={createPageUrl("AdminMigraciaFotiek")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Upload className="w-4 h-4" /></div>
                        {t('adminPhotoMigration')}
                      </Link>
                      <Link to={createPageUrl("RegenerujPrekladyDeFrSrHrEl")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Languages className="w-4 h-4" /></div>
                        {t('adminRegenerateTranslations')}
                      </Link>
                      <Link to={createPageUrl("TestAnalyzaKonfiguratora")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
                        {t('adminConfiguratorAnalysis')}
                      </Link>
                    </>}
                    {isAdmin && <>
                      <Link to={createPageUrl("AdminUserManagement")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4" /></div>
                        {t('adminUserManagement')}
                      </Link>
                      <Link to={createPageUrl("AdminPixelSettings")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Settings className="w-4 h-4" /></div>
                        {t('adminMetaPixel')}
                      </Link>
                      <Link to={createPageUrl("AdminAnalyzaSessions")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Activity className="w-4 h-4" /></div>
                        {t('adminAnalyticsSessions')}
                      </Link>
                      <Link to={createPageUrl("AdminSEOAnalyzer")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4" /></div>
                        {t('adminSEOAnalyzer')}
                      </Link>
                      <Link to={createPageUrl("AIMarketingInsights")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
                        {t('adminAIMarketing')}
                      </Link>
                      <Link to={createPageUrl("SocialMediaDashboard")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Activity className="w-4 h-4" /></div>
                        {t('adminSocialMedia')}
                      </Link>
                      <Link to={createPageUrl("AdminDokumenty")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4" /></div>
                        {t('adminDocuments')}
                      </Link>
                      <Link to={createPageUrl("AdminGoogleDrive")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all min-h-[56px]">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Settings className="w-4 h-4" /></div>
                        {t('adminGoogleDrive')}
                      </Link>
                    </>}
                  </div>
                </div>
              )}

              {/* Kontaktná sekcia na spodku */}
              <div className="border-t border-slate-200 dark:border-white/10 pt-4 pb-2 space-y-3 mt-1">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+421905138124"
                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold py-3.5 rounded-2xl min-h-[56px] active:bg-slate-200"
                  >
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-bold">Zavolať</span>
                  </a>
                  <Link to={createPageUrl("Kontakt")} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl min-h-[56px] active:opacity-90"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">{t('contactUs')}</span>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-3 py-2">
                  <img src={LOGO_URL} alt="American Living" className="h-10 w-auto opacity-60" />
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="lg:bg-background relative transition-colors duration-300" style={{ paddingTop: '2.5rem' }}>
        <div className="lg:max-w-[1200px] xl:max-w-[1400px] lg:mx-auto bg-background min-h-screen relative z-20 transition-colors duration-300">
          {children}
        </div>
      </main>

      <footer className="bg-[#0D0D11] border-t border-[#C5A880]/10 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="p-2 inline-block mb-4 bg-slate-900/40 rounded-lg border border-[#C5A880]/20">
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
                <li>
                  <a href="https://americanliving.sk/zasadyochranyosobnychudajov" className="text-gray-300 hover:text-white transition-colors">
                    Ochrana osobných údajov (GDPR)
                  </a>
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

      <Chatbot />
      </div>
      );
      }

      export default function Layout({ children }) {
      return (
        <HelmetProvider>
        <LanguageProvider>
        <Helmet>
          <meta name="google-site-verification" content="p_fzn0ka1UdLRjOaJT0uTEVpjZiW6b2RU9NYMM8RYno" />
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://americanliving.sk/#organization",
                "name": "American Living",
                "url": "https://americanliving.sk",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png",
                  "width": 400,
                  "height": 100
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+421-905-138-124",
                  "contactType": "sales",
                  "availableLanguage": ["Slovak", "English", "Hungarian", "Polish"]
                },
                "email": "info@americanliving.sk",
                "telephone": "+421905138124",
                "sameAs": []
              },
              {
                "@type": "WebSite",
                "@id": "https://americanliving.sk/#website",
                "url": "https://americanliving.sk",
                "name": "American Living – modulárne a montované domy",
                "publisher": { "@id": "https://americanliving.sk/#organization" },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://americanliving.sk/katalog?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          })}</script>
        </Helmet>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
        <LayoutContent>{children}</LayoutContent>
        </LanguageProvider>
        </HelmetProvider>
        );
        }