import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Grid3x3, Phone, Info, Menu, X, Mail, Settings, FileText, Image, Brain, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Toaster } from "sonner";
import Chatbot from "./components/Chatbot";
import AIAsistent from "./components/AIAsistent";
import ChristmasEffects from "./components/ChristmasEffects";
import { Snowflake as SnowflakeIcon } from "lucide-react";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";

// Wrapper pre vianočné efekty s lokálnym uložením
function ChristmasEffectsWrapper() {
  const [enabled, setEnabled] = React.useState(() => {
    const saved = localStorage.getItem('christmas_effects_enabled');
    return saved === null ? true : saved === 'true';
  });

  const toggleEffects = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('christmas_effects_enabled', String(newValue));
  };

  return (
    <>
      <ChristmasEffects enabled={enabled} />
      {/* Tlačidlo pre všetkých návštevníkov */}
      <button
        onClick={toggleEffects}
        className={`fixed top-48 left-4 z-40 p-3 rounded-full shadow-lg transition-all ${
          enabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
        }`}
        title={enabled ? 'Vypnúť vianočné efekty' : 'Zapnúť vianočné efekty'}
      >
        <SnowflakeIcon 
          className="w-7 h-7 text-white animate-spin" 
          style={{ animationDuration: '4s' }} 
        />
      </button>
    </>
  );
}

function LayoutContent({ children }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

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
    { name: t('gallery'), path: createPageUrl("GaleriaRealizacii"), icon: Home },
    { name: t('configurator'), path: createPageUrl("InteraktivnyKonfigurator"), icon: Settings },
    { name: t('about'), path: createPageUrl("ONas"), icon: Info },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg py-0.5' : 'bg-white/95 backdrop-blur-md py-0.5 sm:py-1'
        }`}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center justify-start lg:justify-start gap-2 sm:gap-3">
              <Link to={createPageUrl("Domov")} className="group">
                <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 w-auto transition-transform group-hover:scale-105"
                />
              </Link>

              <div className="hidden md:flex flex-col items-center gap-0">
                <span className="text-[8px] lg:text-[10px] text-gray-600 font-medium whitespace-nowrap">Powered by</span>
                <a 
                  href="https://konfiga.eu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src={KONFIGA_LOGO_URL} 
                    alt="Konfiga.eu - AI CRM" 
                    className="h-6 sm:h-8 md:h-9 lg:h-12 xl:h-14 w-auto"
                  />
                </a>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 xl:px-4 py-1.5 xl:py-2 rounded-md text-sm lg:text-base xl:text-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {isSuperAdmin && (
                <>
                  <Link to={createPageUrl("AdminAnalyzaDomov")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="AI Analýza domov">
                      <Brain className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AdminSpravaDomov")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="Správa domov">
                      <Image className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AdminUploadFotiekDomov")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="Upload fotiek domov">
                      <Upload className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AdminPrekladyDomov")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="Preklady domov">
                      <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                  </>
                  )}
              {isAdmin && (
                <>
                  <Link to={createPageUrl("AdminDokumenty")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="Správa dokumentov">
                      <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AdminGoogleDrive")}>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8 lg:h-10 lg:w-10" title="Správa Google Drive">
                      <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Link>
                </>
              )}
              <LanguageSelector variant="ghost" />
              <a href="tel:+421905138124" className="text-primary font-semibold text-sm lg:text-base xl:text-lg">
                +421 905 138 124
              </a>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-sm lg:text-base h-8 lg:h-10 px-4 lg:px-6">
                  {t('contact')}
                </Button>
              </Link>
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

      <main className="pt-10 sm:pt-12 md:pt-14 lg:pt-16">
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
                Distribútor a realizátor stavby modulárnych domov. 
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

      <ChristmasEffectsWrapper />
              {/* <Chatbot /> */}
              {/* <AIAsistent /> */}
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