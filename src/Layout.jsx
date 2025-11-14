import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Grid3x3, Settings, Phone, Info, HelpCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Domov", path: createPageUrl("Domov"), icon: Home },
    { name: "Katalóg", path: createPageUrl("Katalog"), icon: Grid3x3 },
    { name: "Konfigurátor", path: createPageUrl("Konfigurator"), icon: Settings },
    { name: "Ako to funguje", path: createPageUrl("AkoToFunguje"), icon: HelpCircle },
    { name: "O nás", path: createPageUrl("ONas"), icon: Info },
    { name: "Kontakt", path: createPageUrl("Kontakt"), icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <style>{`
        :root {
          --navy: #003366;
          --red: #B22222;
          --warm-white: #FAFAF9;
          --light-gray: #F3F4F6;
        }
        
        .bg-navy { background-color: var(--navy); }
        .text-navy { color: var(--navy); }
        .bg-red { background-color: var(--red); }
        .text-red { color: var(--red); }
        .hover\\:bg-red:hover { background-color: var(--red); }
        .border-navy { border-color: var(--navy); }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        
        /* Wood texture overlay for subtle warmth */
        .wood-accent::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
      `}</style>

      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Domov")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-navy rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-105">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy">American Living</h1>
                <p className="text-xs text-gray-600">Váš americký sen o bývaní</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-3">
              <a href="tel:+421123456789" className="text-navy font-semibold">
                +421 123 456 789
              </a>
              <Link to={createPageUrl("Kontakt")}>
                <Button className="bg-red hover:bg-red/90 text-white font-semibold px-6">
                  Kontaktujte nás
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-navy" />
              ) : (
                <Menu className="w-6 h-6 text-navy" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <a
                  href="tel:+421123456789"
                  className="flex items-center justify-center gap-2 text-navy font-semibold py-3"
                >
                  <Phone className="w-5 h-5" />
                  +421 123 456 789
                </a>
                <Link to={createPageUrl("Kontakt")} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-red hover:bg-red/90 text-white font-semibold">
                    Kontaktujte nás
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">American Living SK</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Špecialisti na moderné nízkoenergetické domy v americkom štýle. 
                Váš sen o priestrannom a komfortnom bývaní.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigácia</h4>
              <ul className="space-y-2 text-sm">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-gray-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Adresa: [Vaša adresa]</li>
                <li>Tel: +421 123 456 789</li>
                <li>Email: info@americanliving.sk</li>
                <li>IČO: [IČO]</li>
                <li>DIČ: [DIČ]</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sledujte nás</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  FB
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  IG
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} American Living SK. Všetky práva vyhradené.</p>
          </div>
        </div>
      </footer>

      {/* Cookie Notice (GDPR) */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white shadow-2xl rounded-lg p-4 z-50 border-l-4 border-red hidden" id="cookie-notice">
        <p className="text-sm text-gray-700 mb-3">
          Používame cookies pre zlepšenie vášho zážitku. Používaním stránky súhlasíte s našimi podmienkami.
        </p>
        <button 
          onClick={() => document.getElementById('cookie-notice').style.display = 'none'}
          className="w-full bg-navy text-white py-2 rounded-lg hover:bg-navy/90 transition-colors text-sm font-semibold"
        >
          Rozumiem
        </button>
      </div>
    </div>
  );
}