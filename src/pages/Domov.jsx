import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import HeroSettingsManager from "../components/admin/HeroSettingsManager";
import { useLanguage } from "../components/LanguageContext";

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
    <div className="min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16">
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

      {/* Admin Login Box */}
      {!user && (
        <div className="fixed bottom-6 left-6 z-50">
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
                <Key className="w-4 h-4 mr-2" />
                Prihlásiť sa
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[55vh] sm:h-[75vh] min-h-[320px] sm:min-h-[450px] overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700">
        
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ 
              zIndex: index === currentSlide ? 1 : 0,
              opacity: index === currentSlide ? 1 : 0 
            }}
          >
            <img src={img} alt={`Modulárny dom ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            {/* Logo v hero sekcii */}
            <div className="mb-6 sm:mb-10">
              <img 
                src={LOGO_URL} 
                alt="American Living" 
                className="h-40 sm:h-64 md:h-80 lg:h-96 w-auto drop-shadow-2xl rounded-full"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 leading-tight drop-shadow-lg">
              {t('affordableFamilyHouse')}
            </h1>
            <p className="text-sm sm:text-xl mb-2 sm:mb-4 font-bold text-yellow-300 drop-shadow-lg">
              {t('directFromManufacturer')}
            </p>
            <p className="text-xs sm:text-base md:text-lg mb-3 sm:mb-6 text-gray-100 leading-relaxed drop-shadow-md">
              {t('everythingYouNeed')}
            </p>
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3">
              <Link to={createPageUrl("Katalog")}>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-xs sm:text-base px-3 sm:px-6 py-1.5 sm:py-3 w-full sm:w-auto shadow-xl">
                  {t('showOffer')}
                  <ArrowRight className="ml-1.5 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-xs sm:text-base px-3 sm:px-6 py-1.5 sm:py-3 w-full sm:w-auto shadow-xl">
                  {t('consultation')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Fixácia úrokov - Nová sekcia */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8">
          <Card className="bg-gradient-to-br from-red-600 via-orange-600 to-red-700 border-4 border-orange-400 p-6 sm:p-10 shadow-2xl hover:shadow-orange-500/40 transition-shadow">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                  <Euro className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </motion.div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  {t('mortgageFixationTitle')}
                </h2>
                <p className="text-base sm:text-xl text-white/95 leading-relaxed font-medium drop-shadow-md">
                  {t('mortgageFixationDesc')}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link to={createPageUrl("Kontakt")}>
                    <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-100 font-bold px-8 py-6 text-lg shadow-xl w-full sm:w-auto">
                      {t('contactUs')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="tel:+421905138124">
                    <Button size="lg" variant="outline" className="bg-transparent border-3 border-white text-white hover:bg-white hover:text-red-700 font-bold px-8 py-6 text-lg shadow-xl w-full sm:w-auto">
                      <Phone className="mr-2 w-5 h-5" />
                      +421 905 138 124
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto mb-4 sm:mb-10">
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
                  <div className="p-1.5 sm:p-3 bg-gradient-to-b from-white to-gray-50">
                    <h3 className="text-[10px] sm:text-sm font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-2">
                      {sluzba.nazov}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium hidden sm:block">{sluzba.popis}</p>
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-10">
            {vyhody.map((vyhoda, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-2 sm:p-5 text-center h-full hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-500/30 group hover:-translate-y-1">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-7 h-7 sm:w-12 sm:h-12 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-1.5 sm:mb-3 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/50"
                  >
                    <vyhoda.icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <h3 className="text-[10px] sm:text-sm font-bold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-primary transition-colors">{vyhoda.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed hidden sm:block">{vyhoda.description}</p>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-10">
                {domy.map((dom, index) => (
                  <motion.div 
                    key={dom.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 bg-white border-2 border-transparent hover:border-blue-500/30 hover:-translate-y-1">
                      <div className="relative h-24 sm:h-36 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dom.celorocny && (
                          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-accent text-white px-1.5 py-0.5 sm:px-2 rounded-full text-[8px] sm:text-xs font-semibold shadow-lg">
                            ✔ CELOROČNÝ
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 sm:p-4">
                        <div className="text-[8px] sm:text-xs text-gray-600 mb-0.5 font-semibold">{dom.vyrobca}</div>
                        <h3 className="text-xs sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-200">
                          <div>
                            <p className="text-[8px] sm:text-xs text-gray-600 font-semibold">Od</p>
                            <p className="text-xs sm:text-xl font-bold text-primary">
                              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </Card>
                    </Link>
                    </motion.div>
                    ))}
                    </div>

            <div className="text-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 sm:px-8 text-xs sm:text-base shadow-xl">
                  {t('showFullCatalog')}
                  <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
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
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="sm" className="bg-white text-primary hover:bg-gray-100 font-semibold px-3 sm:px-6 w-full sm:w-auto shadow-xl text-xs sm:text-base">
                  {t('showOffer')}
                  <ArrowRight className="ml-1.5 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="sm" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-3 sm:px-6 w-full sm:w-auto shadow-xl text-xs sm:text-base">
                  {t('contact')}
                  <Phone className="ml-1.5 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}