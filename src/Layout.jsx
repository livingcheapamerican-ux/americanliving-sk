import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Grid3x3, Phone, Info, Menu, X, Mail, Settings, FileText, Image, Brain, Upload, ChevronDown, Sparkles, Languages, FileText as BlogIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AVAILABLE_LANGUAGES } from "./components/LanguageContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Toaster } from "sonner";
import Chatbot from "./components/Chatbot";
import AIAsistent from "./components/AIAsistent";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import UserTracking from "./components/UserTracking";

function LayoutContent({ children }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

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

  const navItems = [
    { name: t('home'), path: createPageUrl("Domov"), icon: Home },
    { name: t('catalog'), path: createPageUrl("Katalog"), icon: Grid3x3 },
    { name: "AI Odporúčania", path: createPageUrl("OdporucanieDomov"), icon: Sparkles },
    { name: t('about'), path: createPageUrl("ONas"), icon: Info },
    { name: "Blog", path: createPageUrl("Blog"), icon: FileText },
    { name: t('contact'), path: createPageUrl("Kontakt"), icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.super_admin === true;

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
        
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Toast Container */}
      <Toaster position="top-right" richColors closeButton />

      {/* Header */}
      <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md py-0`}
      >
        <div className="container mx-auto px-2 sm:px-4 py-1">
          <div className="flex items-center justify-between gap-2">
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
                  className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-16 w-auto transition-transform group-hover:scale-105"
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
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 xl:px-3 py-1 xl:py-1.5 rounded-md text-xs lg:text-sm xl:text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
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
            {isSuperAdmin && (
              <>
                <Link to={createPageUrl("AdminAnalyzaDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="AI Analýza domov">
                    <Brain className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminSpravaDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Správa domov">
                    <Image className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminUploadFotiekDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Upload fotiek domov">
                    <Upload className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyDomov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Preklady domov">
                    <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminGenerujObrazkyBlogov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="AI Generovanie obrázkov pre blog">
                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyBlogov")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Preklady blogov">
                    <Languages className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminPrekladyKonfiguratora")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Preklady konfiguratora">
                    <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminWatermark")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Watermark">
                    <Image className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminMigraciaFotiek")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Migrácia fotiek">
                    <Upload className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("TestAnalyzaKonfiguratora")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Test Analýza Konfiguratora">
                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("RegenerujPrekladyDeFrSrHrEl")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Regeneruj preklady DE/FR/SR/HR/EL">
                    <Languages className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                </>
                )}
            {isAdmin && (
              <>
                <Link to={createPageUrl("AdminDokumenty")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Správa dokumentov">
                    <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminGoogleDrive")}>
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-7 w-7 lg:h-8 lg:w-8" title="Správa Google Drive">
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
              className="lg:hidden p-3 -mr-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
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
              
              {navItems.map((item) => (
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
                    AI Analýza domov
                  </Link>
                  <Link
                    to={createPageUrl("AdminSpravaDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Image className="w-5 h-5" />
                    Správa domov
                  </Link>
                  <Link
                    to={createPageUrl("AdminUploadFotiekDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Image className="w-5 h-5" />
                    Upload fotiek domov
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyDomov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Preklady domov
                  </Link>
                  <Link
                    to={createPageUrl("TestAnalyzaKonfiguratora")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Test Analýza Konfiguratora
                  </Link>
                  <Link
                    to={createPageUrl("RegenerujPrekladyDeFrSrHrEl")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Languages className="w-5 h-5" />
                    Regeneruj preklady DE/FR/SR/HR/EL
                  </Link>
                  <Link
                    to={createPageUrl("AdminGenerujObrazkyBlogov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Generovanie obrázkov blogu
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyBlogov")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Languages className="w-5 h-5" />
                    Preklady blogov
                  </Link>
                  <Link
                    to={createPageUrl("AdminPrekladyKonfiguratora")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Preklady konfiguratora
                  </Link>
                  <Link
                    to={createPageUrl("AdminMigraciaFotiek")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    Migrácia fotiek
                  </Link>
                  </>
                  )}
              {isAdmin && (
                <>
                  <Link
                    to={createPageUrl("AdminDokumenty")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Správa dokumentov
                  </Link>
                  <Link
                    to={createPageUrl("AdminGoogleDrive")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Správa Google Drive
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

      <main className="pt-12 sm:pt-14 md:pt-16 lg:pt-20">
      {children}
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
                Distribútor a realizátor stavby modulárnych a montovaných domov. 
                Vyrobených viac ako 700 domov od roku 2008.
              </p>
              <p className="text-gray-300 text-sm">
                Oficiálny distribútor TicabHouse, JAK modules, Prosto House a Domki z Gór
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
              <h4 className="font-semibold mb-4 text-white">{t('poweredByAI')}</h4>
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4 rounded-xl border border-cyan-500/20">
                <a href="https://konfiga.eu" target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src={KONFIGA_LOGO_URL} 
                    alt="Konfiga.eu - AI CRM" 
                    className="h-20 w-auto mx-auto mb-2"
                  />
                  <p className="text-xs text-center text-cyan-300">
                    AI funkcie na tejto stránke
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
      <UserTracking />
      <Chatbot />
      </div>
      );
      }

      export default function Layout({ children }) {
      return (
      <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
      </LanguageProvider>
      );
      }