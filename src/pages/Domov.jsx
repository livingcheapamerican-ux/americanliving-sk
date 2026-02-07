import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp, Settings, LogIn, Gift
} from "lucide-react";
import { motion } from "framer-motion";
import HeroSettingsManager from "../components/admin/HeroSettingsManager";
import { useLanguage } from "../components/LanguageContext";
import FloatingHouses from "../components/FloatingHouses";

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/376b4bd9f_okruhlelogo.png";

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useLanguage();
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: async () => {
      const all = await base44.entities.Dom.filter({ popularny: true }, 'poradie', 20);
      return all.filter(dom => dom.verejny !== false).slice(0, 6);
    },
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: heroSettings } = useQuery({
    queryKey: ['site-settings', 'hero'],
    queryFn: async () => {
      try {
        const settings = await base44.entities.SiteSettings.filter({ klic: 'hero_settings' });
        return settings[0] || null;
      } catch (error) {
        console.error('Error loading hero settings:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 300000,
  });


  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const heroImages = heroSettings?.hero_images?.length > 0 
    ? heroSettings.hero_images 
    : DEFAULT_HERO_IMAGES;
  
  const heroInterval = heroSettings?.hero_interval || 1500;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, heroInterval);
    return () => clearInterval(interval);
  }, [heroImages.length, heroInterval]);

  const vyhody = [
    {
      icon: Euro,
      title: t('priceDirectFromManufacturer'),
      description: t('priceDirectDesc')
    },
    {
      icon: Clock,
      title: t('fastConstruction'),
      description: t('fastConstructionDesc')
    },
    {
      icon: Zap,
      title: t('lowEnergy'),
      description: t('lowEnergyDesc')
    },
    {
      icon: Shield,
      title: t('withApproval'),
      description: t('withApprovalDesc')
    }
  ];

  const sluzby = [
    { 
      icon: Building2, 
      nazov: t('sellYourProperty'),
      popis: t('realEstateAgency'),
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80"
    },
    { 
      icon: Home, 
      nazov: t('selectAndBuyLand'),
      popis: t('findIdealLand'),
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80"
    },
    { 
      icon: TrendingUp, 
      nazov: t('mortgageArrangement'),
      popis: t('financialServices'),
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80"
    },
    { 
      icon: FileText, 
      nazov: t('projectDocumentation'),
      popis: t('completeProject'),
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80"
    },
    { 
      icon: Shield, 
      nazov: t('buildingPermitService'),
      popis: t('weArrangeForYou'),
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80"
    },
    { 
      icon: Hammer, 
      nazov: t('houseConstruction'),
      popis: t('constructionCompany'),
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&q=80"
    },
    { 
      icon: Zap, 
      nazov: t('utilityConnection'),
      popis: t('completeConnection'),
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80"
    },
    { 
      icon: Key, 
      nazov: t('finalApproval'),
      popis: t('fromAToZ'),
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80"
    }
  ];

  const proces = [
    { 
      cislo: "01", 
      nazov: t('sellYourProperty'), 
      popis: t('helpSellProperty'),
      icon: Building2
    },
    { 
      cislo: "02", 
      nazov: t('selectAndBuyLand'), 
      popis: t('findSuitableLand'),
      icon: Home
    },
    { 
      cislo: "03", 
      nazov: t('financing'), 
      popis: t('selectBestMortgage'),
      icon: Euro
    },
    { 
      cislo: "04", 
      nazov: t('projectDocumentation'), 
      popis: t('prepareCompleteDoc'),
      icon: FileText
    },
    { 
      cislo: "05", 
      nazov: t('buildingPermitService'), 
      popis: t('ensureBuildingPermit'),
      icon: Shield
    },
    { 
      cislo: "06", 
      nazov: t('houseConstruction'), 
      popis: t('buildYourModularHouse'),
      icon: Hammer
    },
    { 
      cislo: "07", 
      nazov: t('utilityConnection'), 
      popis: t('connectToUtilities'),
      icon: Zap
    },
    { 
      cislo: "08", 
      nazov: t('finalApproval'), 
      popis: t('ensureApprovalKeys'),
      icon: Key
    }
  ];

  return (
    <div className="min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16 xl:-mt-20">
      <FloatingHouses side="left" />
      <FloatingHouses side="right" />
      {/* Admin Login Box - zobrazí sa len pre neprihlásených */}
      {!user && (
        <div className="hidden md:block fixed bottom-6 left-6 z-50">
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-none shadow-2xl w-64">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-white" />
                <h4 className="font-bold text-white">Admin prístup</h4>
              </div>
              <p className="text-xs text-white/90 mb-3">
                Prihláste sa pre prístup k admin nástrojom
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full bg-white text-indigo-700 hover:bg-gray-100 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Prihlásiť sa
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Settings Panel */}
      {isAdmin && showSettings && (
        <div className="container mx-auto px-4 py-8">
          <HeroSettingsManager 
            settings={heroSettings} 
            onUpdate={() => setShowSettings(false)} 
          />
        </div>
      )}

      {/* Admin toggle button - FIXED POSITION */}
      {isAdmin && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="fixed top-24 right-4 z-[100] bg-purple-600 hover:bg-purple-700 p-4 rounded-xl shadow-2xl transition-all border-4 border-white"
          title="Nastavenia hero sekcie"
        >
          <Settings className="w-8 h-8 text-white" />
        </button>
      )}



      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[80vh] min-h-[400px] sm:min-h-[600px] overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700 pt-12 sm:pt-0">
        
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ 
              zIndex: index === currentSlide ? 1 : 0,
              opacity: index === currentSlide ? 1 : 0 
            }}
          >
            <img src={img} alt={`Modulárny dom ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
          </div>
        ))}

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl text-white">
            {/* Logo v hero sekcii - zmenšené a elegantnejšie */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 sm:mb-12"
            >
              <img 
                src={LOGO_URL} 
                alt="American Living" 
                className="h-16 sm:h-24 md:h-32 w-auto drop-shadow-2xl rounded-full"
              />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight" 
              style={{ textShadow: '4px 4px 12px rgba(0,0,0,1), 0 0 30px rgba(255,255,255,0.2)' }}
            >
              {t('affordableFamilyHouse')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-2xl mb-3 sm:mb-5 font-bold text-yellow-300" 
              style={{ textShadow: '3px 3px 10px rgba(0,0,0,1), 0 0 20px rgba(255,215,0,0.5)' }}
            >
              {t('directFromManufacturer')}
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-100 leading-relaxed max-w-2xl" 
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,1)' }}
            >
              {t('everythingYouNeed')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to={createPageUrl("Katalog")} className="w-full sm:w-auto">
                  <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-red-600 via-primary to-red-600 hover:from-red-700 hover:via-secondary hover:to-red-700 text-white font-black text-xl sm:text-2xl px-10 sm:px-16 py-7 sm:py-9 shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-white animate-pulse transition-all group">
                    <Home className="mr-3 w-7 h-7 group-hover:rotate-12 transition-transform" />
                    KATALÓG DOMOV
                    <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-3 -right-3 bg-yellow-400 text-red-900 text-xs font-black px-3 py-1 rounded-full rotate-12 shadow-lg border-2 border-white"
                    >
                      POZRI DOMY!
                    </motion.div>
                  </Button>
                </Link>
                <Link to={createPageUrl("Kontakt")} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/15 backdrop-blur-md border-3 border-white text-white hover:bg-white hover:text-primary hover:scale-105 font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-2xl transition-all">
                    <Phone className="mr-2" />
                    {t('consultation')}
                  </Button>
                </Link>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center"
              >
                <p className="text-white text-sm sm:text-lg font-bold bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full inline-block shadow-xl border-2 border-white/30">
                  👆 Klikni sem pre zobrazenie všetkých modulárnych domov
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {heroImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-10' : 'bg-white/50 w-3 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* DOTÁCIA AMERICANA - Luxusná zlatá tehla */}
      <section className="py-8 sm:py-12 relative overflow-hidden">
        {/* Luxusné zlaté pozadie s diamantovým vzorom */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A236] via-[#FFD700] to-[#D4AF37]"></div>
        
        {/* Diamantový vzor */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px)`
        }}></div>
        
        {/* Animovaný lesklý zlatý efekt */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* Žiariace body */}
        <div className="absolute top-10 left-20 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-40 w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 40px rgba(212, 175, 55, 0.6)",
                "0 0 80px rgba(255, 215, 0, 0.8)",
                "0 0 40px rgba(212, 175, 55, 0.6)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <Link to={createPageUrl("DotaciaAmericana")}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-br from-white via-yellow-50 to-white hover:from-yellow-100 hover:via-white hover:to-yellow-100 text-[#8B6914] font-black text-xl sm:text-3xl md:text-5xl px-10 sm:px-20 py-8 sm:py-12 shadow-[0_10px_40px_rgba(212,175,55,0.6),0_0_60px_rgba(255,215,0,0.3)] border-[6px] border-[#D4AF37] relative overflow-hidden group transition-all"
                >
                  {/* Žiariaci efekt na pozadí */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="hidden md:flex flex-col items-center relative z-10"
                  >
                    <span className="text-[#8B6914] drop-shadow-[0_3px_12px_rgba(212,175,55,1)]">DOTÁCIA</span>
                    <span className="text-red-600 text-3xl sm:text-5xl drop-shadow-[0_3px_12px_rgba(212,175,55,1)] mt-1">AMERICANA</span>
                  </motion.div>
                  <div className="md:hidden flex flex-col items-center relative z-10">
                    <span className="text-[#8B6914] drop-shadow-[0_3px_12px_rgba(212,175,55,1)]">DOTÁCIA</span>
                    <span className="text-red-600 text-2xl drop-shadow-[0_3px_12px_rgba(212,175,55,1)] mt-0.5">AMERICANA</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [12, 15, 12] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-2 -top-2 md:-right-3 md:-top-3 bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white text-xs md:text-sm font-black px-3 py-1 md:px-4 md:py-1.5 rounded-full rotate-12 shadow-[0_4px_15px_rgba(220,38,38,0.6)] border-2 border-white"
                  >
                    ✨ NOVÉ!
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <div className="mt-8 max-w-5xl mx-auto space-y-5 px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pre rodiny */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border-[3px] border-emerald-400 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Home className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-emerald-700 tracking-tight">Pre rodiny</h3>
              </div>
              <ul className="space-y-3 text-base text-gray-800 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-emerald-700">Dotácia</strong> pri podpise</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-emerald-700">Energie v plnej výške</strong> preplatené</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Podpora aj po odovzdaní</span>
                </li>
              </ul>
            </motion.div>

            {/* Pre investorov */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)" }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border-[3px] border-yellow-400 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <TrendingUp className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-yellow-700 tracking-tight">Pre investorov</h3>
              </div>
              <ul className="space-y-3 text-base text-gray-800 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-yellow-700">Dotácia</strong> pri podpise</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-yellow-700">Marketing ZDARMA</strong> (správa hostí)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Pasívny príjem z Airbnb</span>
                </li>
              </ul>
            </motion.div>
          </div>
            
            <p className="text-xs sm:text-sm text-center text-gray-800 font-medium bg-white/70 backdrop-blur-sm rounded-lg p-3">
              💡 <strong>{t('grantAmountVaries')}</strong>
            </p>
          </div>
        </div>
      </section>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Fixácia úrokov - Nová sekcia */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-red-600 via-orange-600 to-red-700 border-[6px] border-orange-400 p-8 sm:p-12 shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:shadow-[0_25px_70px_rgba(249,115,22,0.5)] transition-all">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border-[6px] border-white/50 shadow-2xl">
                    <Euro className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg" />
                  </div>
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    {t('mortgageFixationTitle')}
                  </h2>
                  <p className="text-lg sm:text-2xl text-white/98 leading-relaxed font-semibold drop-shadow-md mb-8">
                    {t('mortgageFixationDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link to={createPageUrl("Kontakt")}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-100 font-black px-10 py-7 text-xl shadow-2xl w-full sm:w-auto">
                          {t('contactUs')}
                          <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                      </motion.div>
                    </Link>
                    <a href="tel:+421905138124">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-[4px] border-white text-white hover:bg-white hover:text-red-700 font-black px-10 py-7 text-xl shadow-2xl w-full sm:w-auto">
                          <Phone className="mr-2 w-6 h-6" />
                          +421 905 138 124
                        </Button>
                      </motion.div>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>



      {/* Komplexné služby - S OBRÁZKAMI */}
      <section className="py-6 sm:py-16 bg-gradient-to-br from-red-950 via-red-900 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              <h2 className="text-lg sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                {t('allInOnePlace')}
              </h2>
            <p className="text-xs sm:text-base text-gray-300 max-w-3xl mx-auto mb-3">
              {t('comprehensiveServicesDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-semibold">
              <div className="flex items-center gap-1 bg-primary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white shadow-lg">
                <Building className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{t('constructionCompany')}</span>
              </div>
              <div className="flex items-center gap-1 bg-secondary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white shadow-lg">
                <Building2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{t('realEstateAgency')}</span>
              </div>
              <div className="flex items-center gap-1 bg-accent px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-white shadow-lg">
                <Landmark className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{t('financialServices')}</span>
              </div>
            </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4 max-w-6xl mx-auto mb-4 sm:mb-10">
            {sluzby.map((sluzba, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden h-full hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer bg-white border-2 border-transparent hover:border-blue-500/30 hover:-translate-y-1">
                  <div className="relative h-20 sm:h-36 overflow-hidden">
                    <img 
                      src={sluzba.image} 
                      alt={sluzba.nazov}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-blue-900/80" />
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                      <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-50 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <sluzba.icon className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-b from-white to-gray-50">
                    <h3 className="text-sm sm:text-sm font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {sluzba.nazov}
                    </h3>
                    <p className="text-xs sm:text-xs text-gray-600 font-medium">{sluzba.popis}</p>
                  </div>
                  </Card>
                  </motion.div>
                  ))}
                  </div>

                  <div className="text-center">
            <p className="text-sm sm:text-xl text-gray-200 mb-4 sm:mb-6">
              <strong className="text-white">{t('youDontHaveToArrange')}</strong> {t('weHandleEverything')}
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-4 sm:px-8 text-xs sm:text-base shadow-xl">
                {t('startProject')}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
                </Link>
                </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-6 sm:py-16 bg-gradient-to-br from-red-100 via-red-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex justify-center mb-6 sm:mb-10"
              >
                <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-24 sm:h-64 md:h-80 w-auto rounded-full shadow-2xl"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </motion.div>
              <h2 className="text-lg sm:text-3xl md:text-5xl font-bold text-gray-900 mb-1.5 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
                {t('whyAmericanLiving')}
              </h2>
            <p className="text-xs sm:text-base text-gray-700 max-w-3xl mx-auto">
              {t('qualityBrand')}
            </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 mb-8 sm:mb-12">
            {vyhody.map((vyhoda, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="p-6 text-center h-full hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-500/40 group relative overflow-hidden">
                  {/* Žiariace pozadie pri hoveri */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/50 relative z-10"
                  >
                    <vyhoda.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors relative z-10">{vyhoda.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed relative z-10">{vyhoda.description}</p>
                  </Card>
                  </motion.div>
                  ))}
                   </div>

                  {/* Varovanie */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto"
                  >
            <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 border-2 border-yellow-400 p-8 shadow-2xl hover:shadow-yellow-400/30 transition-shadow">
              <div className="flex gap-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="w-12 h-12 text-yellow-600 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('misleadingAdsWarning')}
                  </h3>
                  <p className="text-gray-800 mb-3 leading-relaxed font-medium">
                    {t('misleadingAdsDesc1')}
                  </p>
                  <p className="text-gray-800 mb-3 leading-relaxed font-medium">
                    {t('misleadingAdsDesc2')}
                  </p>
                  <p className="text-gray-900 font-bold text-lg">
                    ✓ {t('ourHousesMeetStandards')}
                  </p>
                </div>
                </div>
                </Card>
                </motion.div>
        </div>
      </section>

      {/* Naša ponuka */}
      {domy.length > 0 && (
        <section className="py-6 sm:py-16 bg-gradient-to-br from-red-100 via-red-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"></div>
          <div className="container mx-auto px-2 sm:px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 sm:mb-10"
            >
                {/* Logo */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="flex justify-center mb-4 sm:mb-8"
                >
                  <img 
                    src={LOGO_URL} 
                    alt="American Living" 
                    className="h-20 sm:h-48 md:h-64 w-auto rounded-full shadow-2xl"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </motion.div>
                <h2 className="text-lg sm:text-3xl md:text-5xl font-bold text-gray-900 mb-1.5 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
                  {t('ourOffer')}
                </h2>
              <p className="text-xs sm:text-base text-gray-700">
                {t('woodHouseNotLookWood')}
              </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {domy.map((dom, index) => (
                  <motion.div 
                    key={dom.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-500/40 h-full">
                      <div className="relative h-32 sm:h-44 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {dom.celorocny && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-lg text-[9px] sm:text-xs font-bold shadow-lg"
                          >
                            ✔ CELOROČNÝ
                          </motion.div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">{dom.vyrobca}</div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mb-0.5">Od</p>
                            <p className="text-base sm:text-lg font-black text-primary">
                              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-secondary transition-colors" />
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                    </Link>
                    </motion.div>
                    ))}
                    </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link to={createPageUrl("Katalog")}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="relative bg-gradient-to-r from-primary via-red-600 to-primary hover:from-secondary hover:via-red-700 hover:to-secondary text-white font-black text-lg sm:text-xl px-10 sm:px-16 py-6 sm:py-8 shadow-2xl border-4 border-white group">
                    <Home className="mr-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                    ZOBRAZIŤ VŠETKY DOMY
                    <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full rotate-12 shadow-lg"
                    >
                      KATALÓG
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Proces realizácie */}
      <section className="py-4 sm:py-10 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-base sm:text-2xl font-bold text-gray-900">{t('implementationProcess')}</h2>
            </div>

            <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-1 sm:gap-2">
            {proces.map((krok, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 sm:px-3 sm:py-1.5">
                <span className="text-[8px] sm:text-xs font-bold text-primary/50">{krok.cislo}</span>
                <krok.icon className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[8px] sm:text-xs font-medium text-gray-800">{krok.nazov}</span>
              </div>
                  ))}
                  </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 sm:py-16 bg-gradient-to-br from-red-950 via-red-900 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8 sm:mb-10">
              <img 
                src={LOGO_URL} 
                alt="American Living" 
                className="h-24 sm:h-56 md:h-72 w-auto rounded-full bg-white p-4 shadow-2xl"
              />
            </div>
            <h2 className="text-lg sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {t('readyForOwnHouse')}
            </h2>
            <p className="text-xs sm:text-base mb-3 sm:mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t('contactUsAndFind')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to={createPageUrl("Katalog")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-white via-yellow-50 to-white hover:from-yellow-100 hover:via-white hover:to-yellow-100 text-primary hover:text-secondary font-black text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7 shadow-2xl border-4 border-white/50 group">
                    <Home className="mr-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                    KATALÓG DOMOV
                    <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl("Kontakt")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-3 border-white text-white hover:bg-white hover:text-primary font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7 shadow-2xl">
                    <Phone className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                    {t('contact')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}