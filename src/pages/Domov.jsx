import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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
import ServiceDetailModal from "../components/ServiceDetailModal";

// Optimized hero images: WebP format, capped at 1200px wide, q=75
const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&auto=format,compress&w=1200&q=75",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=webp&auto=format,compress&w=1200&q=75",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?fm=webp&auto=format,compress&w=1200&q=75"
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/376b4bd9f_okruhlelogo.png";

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
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
  
  const heroInterval = heroSettings?.hero_interval || 5000;

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
      nazovKey: 'sellYourProperty',
      nazov: t('sellYourProperty'),
      popis: t('realEstateAgency'),
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80",
      headline: "Kapitál pre váš nový domov získame rýchlo a bezpečne.",
      body: "Aby ste mohli stavať nové, často musíte najprv dobre predať to staré. Postaráme sa o kompletný realitný servis vašej súčasnej nehnuteľnosti. Nastavíme trhovú cenu tak, aby sa predala v ideálnom čase nadväzujúcom na vašu novú výstavbu. Zabezpečíme home staging, profesionálne fotenie, právny servis a prevod peňazí, ktoré plynulo použijeme na financovanie vášho nového projektu.",
      detailImages: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80"
      ]
    },
    { 
      icon: Home, 
      nazovKey: 'selectAndBuyLand',
      nazov: t('selectAndBuyLand'),
      popis: t('findIdealLand'),
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80",
      headline: "Nie každá lúka je vhodný stavebný pozemok.",
      body: "Nájdeme pre vás pozemok, ktorý nie je len \"pekný\", ale aj \"staviteľný\". Ešte pred kúpou preveríme územný plán, dostupnosť inžinierskych sietí, geologické podložie a orientáciu na svetové strany. Upozorníme vás na skryté vady a právne ťarchy. Vyberáme len také miesta, kde bude výstavba technicky a finančne efektívna.",
      detailImages: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
      ]
    },
    { 
      icon: TrendingUp, 
      nazovKey: 'mortgageArrangement',
      nazov: t('mortgageArrangement'),
      popis: t('financialServices'),
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
      headline: "Financovanie výstavby domu nie je bežná hypotéka.",
      body: "Stavba domu vyžaduje špecifické čerpanie úveru v tranžiach. Naši finanční špecialisti nastavia hypotéku presne na mieru harmonogramu výstavby American Living. Komunikujeme priamo s bankou a znalcami, takže vy nemusíte nosiť faktúry a stresovať sa s uvoľňovaním prostriedkov. Garancia najlepších podmienok na trhu je samozrejmosťou.",
      detailImages: [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
      ]
    },
    { 
      icon: FileText, 
      nazovKey: 'projectDocumentation',
      nazov: t('projectDocumentation'),
      popis: t('completeProject'),
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
      headline: "Dom, ktorý má hlavu a pätu ešte pred prvým výkopom.",
      body: "Či už chcete upraviť jeden z našich katalógových projektov alebo túžite po unikátnom dizajne na mieru, naši architekti sú vám k dispozícii. Pripravíme kompletnú projektovú dokumentáciu pre stavebné povolenie aj realizáciu. Myslíme na detaily, presvetlenie izieb aj energetickú úspornosť, aby sa vám v dome žilo pohodlne a náklady boli nízke.",
      detailImages: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80"
      ]
    },
    { 
      icon: Shield, 
      nazovKey: 'buildingPermitService',
      nazov: t('buildingPermitService'),
      popis: t('weArrangeForYou'),
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80",
      headline: "Byrokraciu nechajte na nás.",
      body: "Získanie stavebného povolenia je pre bežného človeka nočnou morou – pre nás je to rutina. Zastúpime vás v celom inžinierskom procese. Obiehame úrady, vybavujeme vyjadrenia dotknutých orgánov, správcov sietí a obce. Vy len počkáte na právoplatné rozhodnutie, s ktorým môžeme začať stavať.",
      detailImages: [
        "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"
      ]
    },
    { 
      icon: Hammer, 
      nazovKey: 'houseConstruction',
      nazov: t('houseConstruction'),
      popis: t('constructionCompany'),
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&q=80",
      headline: "Kvalitná realizácia bez skrytých poplatkov.",
      body: "Realizujeme hrubé stavby, holodomy aj domy na kľúč. Pracujeme s overenými materiálmi a vlastným tímom odborníkov. Garantujeme dodržanie dohodnutého rozpočtu a termínov. Počas výstavby máte k dispozícii stavebný dozor a pravidelné reporty, takže presne vidíte, ako váš nový domov rastie pred očami.",
      detailImages: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
      ]
    },
    { 
      icon: Zap, 
      nazovKey: 'utilityConnection',
      nazov: t('utilityConnection'),
      popis: t('completeConnection'),
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80",
      headline: "Aby všetko fungovalo po otočení kohútikom.",
      body: "Dom bez sietí je len hrubá stavba. Zabezpečíme kompletnú realizáciu prípojok vody, elektriny, plynu a kanalizácie. Riešime výkopy, pokládku, revízne správy aj finálne osadenie meračov. Koordinujeme všetko tak, aby bol dom pripravený na plnohodnotné užívanie.",
      detailImages: [
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=80",
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80"
      ]
    },
    { 
      icon: Key, 
      nazovKey: 'finalApproval',
      nazov: t('finalApproval'),
      popis: t('fromAToZ'),
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80",
      headline: "Posledná pečiatka a odovzdanie kľúčov.",
      body: "Cieľová rovinka. Pripravíme všetky revízie, certifikáty, geometrické plány a dokumenty potrebné ku kolaudačnému konaniu. Zastúpime vás pri miestnom šetrení stavebného úradu. Vám odovzdáme už skolaudovaný dom so súpisným číslom, pripravený na nasťahovanie a prepis energií.",
      detailImages: [
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
      ]
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

  // Preload the first hero image (LCP element)
  const lcpImage = heroImages[0];
  const lcpImageOptimized = lcpImage.includes("unsplash.com")
    ? lcpImage
    : lcpImage;

  return (
    <div className="min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16 xl:-mt-20 overflow-x-hidden">
      <Helmet>
        <link
          rel="preload"
          as="image"
          href={lcpImageOptimized}
          fetchpriority="high"
          type="image/webp"
        />
      </Helmet>
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
      <section className="relative h-[60vh] sm:h-[80vh] min-h-[380px] sm:min-h-[600px] overflow-hidden bg-white pt-8 sm:pt-0">
        
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ 
              zIndex: index === currentSlide ? 1 : 0,
              opacity: index === currentSlide ? 1 : 0 
            }}
          >
            {/* LCP: first hero is eager + high priority; rest are lazy */}
            <img
              src={img}
              alt={`Modulárny dom - American Living ${index + 1}`}
              className="w-full h-full object-cover"
              width={1200}
              height={675}
              loading={index === 0 ? "eager" : "lazy"}
              fetchpriority={index === 0 ? "high" : undefined}
              decoding={index === 0 ? "sync" : "async"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          </div>
        ))}

        <div className="relative z-10 container mx-auto px-4 h-full flex items-end sm:items-center pb-12 sm:pb-0">
          <div className="w-full max-w-3xl text-white">
            {/* Logo v hero sekcii */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-3 sm:mb-8"
            >
              <img 
                  src={LOGO_URL} 
                  alt="American Living" 
                  className="h-10 sm:h-20 md:h-28 w-auto drop-shadow-2xl rounded-full"
                  width={112}
                  height={112}
                  loading="eager"
                  fetchpriority="high"
                />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 sm:mb-4 leading-tight text-white" 
              style={{ textShadow: '4px 4px 20px rgba(0,0,0,0.9)' }}
            >
              {t('heroHeadline')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-xl md:text-2xl mb-1.5 sm:mb-4 font-semibold text-white" 
              style={{ textShadow: '3px 3px 15px rgba(0,0,0,0.9)' }}
            >
              {t('heroSubheadline')}
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hidden sm:block text-sm sm:text-lg md:text-xl mb-4 sm:mb-6 text-gray-100 leading-relaxed max-w-2xl" 
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,1)' }}
            >
              {t('everythingYouNeed')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Link to={createPageUrl("Katalog")} className="w-full sm:w-auto">
                  <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-red-600 via-primary to-red-600 hover:from-red-700 hover:via-secondary hover:to-red-700 text-white font-black text-lg sm:text-2xl px-6 sm:px-14 py-5 sm:py-9 shadow-[0_0_30px_rgba(239,68,68,0.6)] border-2 sm:border-4 border-white animate-pulse transition-all group">
                    <Home className="mr-2 w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
                    {t('houseCatalogButton')}
                    <ArrowRight className="ml-2 w-5 h-5 sm:w-7 sm:h-7 group-hover:translate-x-2 transition-transform" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-yellow-400 text-red-900 text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full rotate-12 shadow-lg border-2 border-white"
                    >
                      {t('seeHousesNow')}
                    </motion.div>
                  </Button>
                </Link>
                <Link to={createPageUrl("Kontakt")} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/15 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-primary font-bold text-base sm:text-lg px-5 sm:px-8 py-4 sm:py-6 shadow-2xl transition-all">
                    <Phone className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    {t('consultation')}
                  </Button>
                </Link>
              </div>
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

      {/* Trusted Partners Section - Overení partneri */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-12"
            style={{ color: '#333333' }}
          >
            {t('trustedPartnersTitle')}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {/* Prosto House */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-8 shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="mb-3 sm:mb-6">
                <div className="aspect-[16/9] overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=webp&auto=format,compress&w=600&q=75" 
                    alt="Prosto House - Modern wood house technology"
                    className="w-full h-full object-cover"
                    width={600}
                    height={338}
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: '#333333' }}>
                {t('prostoTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-lg">
                {t('prostoBody')}
              </p>
            </motion.div>

            {/* TicabHouse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-8 shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="mb-3 sm:mb-6">
                <div className="aspect-[16/9] overflow-hidden rounded-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?fm=webp&auto=format,compress&w=600&q=75" 
                    alt="TicabHouse - Precision modular construction"
                    className="w-full h-full object-cover"
                    width={600}
                    height={338}
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: '#333333' }}>
                {t('ticabTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-lg">
                {t('ticabBody')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DOTÁCIA AMERICANA - High-Contrast RED */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block w-full sm:w-auto"
          >
            <Link to={createPageUrl("DotaciaAmericana")} className="block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  style={{ backgroundColor: '#FF0000' }}
                  className="hover:opacity-90 text-white font-black w-full sm:w-auto text-xl sm:text-3xl md:text-5xl px-6 sm:px-20 py-6 sm:py-12 shadow-2xl border-4 border-white relative overflow-hidden group transition-all"
                >
                  <div className="flex flex-col items-center relative z-10">
                    <span className="text-white drop-shadow-lg text-base sm:text-3xl md:text-4xl">OVERENIE nároku na</span>
                    <span className="text-white text-xl sm:text-4xl md:text-5xl drop-shadow-lg mt-1">DOTÁCIU</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1 sm:-right-3 sm:-top-3 bg-yellow-400 text-gray-900 text-[10px] sm:text-sm font-black px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full rotate-12 shadow-lg border-2 border-white"
                  >
                    ✨ {t('newBadge')}!
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <div className="mt-6 sm:mt-8 max-w-5xl mx-auto space-y-4 sm:space-y-5 px-0 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Pre rodiny */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-emerald-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-emerald-700">{t('forFamilies')}</h3>
                </div>
                <ul className="space-y-2 text-sm sm:text-base text-gray-800 relative z-10">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-700">{t('grantAtSigning')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-700">{t('energyFullyRefunded')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{t('supportAfterHandover')}</span>
                  </li>
                </ul>
              </motion.div>

              {/* Pre investorov */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border-2 border-yellow-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-yellow-700">{t('forInvestors')}</h3>
                </div>
                <ul className="space-y-2 text-sm sm:text-base text-gray-800 relative z-10">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-yellow-700">{t('grantAtSigning')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-yellow-700">{t('marketingFree')}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{t('passiveIncomeFromAirbnb')}</span>
                  </li>
                </ul>
              </motion.div>
            </div>
              
            <p className="text-xs sm:text-sm text-center text-gray-800 font-medium bg-white/70 backdrop-blur-sm rounded-lg p-2 sm:p-3">
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
      <section className="py-6 sm:py-16 bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-2 sm:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-red-600 via-orange-600 to-red-700 border-[3px] sm:border-[6px] border-orange-400 p-4 sm:p-12 shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:shadow-[0_25px_70px_rgba(249,115,22,0.5)] transition-all">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 sm:w-36 sm:h-36 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border-[3px] sm:border-[6px] border-white/50 shadow-2xl">
                    <Euro className="w-10 h-10 sm:w-20 sm:h-20 text-white drop-shadow-lg" />
                  </div>
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl sm:text-5xl font-black text-white mb-3 sm:mb-5 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    {t('mortgageFixationTitle')}
                  </h2>
                  <p className="text-sm sm:text-2xl text-white/98 leading-relaxed font-semibold drop-shadow-md mb-4 sm:mb-8">
                    {t('mortgageFixationDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-start">
                    <Link to={createPageUrl("Kontakt")}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="bg-white text-red-700 hover:bg-yellow-100 font-black px-6 py-4 sm:px-10 sm:py-7 text-sm sm:text-xl shadow-2xl w-full sm:w-auto">
                          {t('contactUs')}
                          <ArrowRight className="ml-1 w-4 h-4 sm:ml-2 sm:w-6 sm:h-6" />
                        </Button>
                      </motion.div>
                    </Link>
                    <a href="tel:+421905138124">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 sm:border-[4px] border-white text-white hover:bg-white hover:text-red-700 font-black px-6 py-4 sm:px-10 sm:py-7 text-sm sm:text-xl shadow-2xl w-full sm:w-auto">
                          <Phone className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6" />
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
      <section className="py-6 sm:py-16 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              <h2 className="text-lg sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-4" style={{ color: '#333333' }}>
                {t('allInOnePlace')}
              </h2>
            <p className="text-xs sm:text-base text-gray-600 max-w-3xl mx-auto mb-3">
              {t('comprehensiveServicesDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-semibold">
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-gray-700 border border-gray-200">
                <Building className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{t('constructionCompany')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-gray-700 border border-gray-200">
                <Building2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{t('realEstateAgency')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-gray-700 border border-gray-200">
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
                onClick={() => {
                  setSelectedService(sluzba);
                  setServiceModalOpen(true);
                }}
              >
                <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white shadow-md hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={sluzba.image.includes("unsplash.com") ? sluzba.image.replace(/\?.*$/, "") + "?fm=webp&auto=format,compress&w=400&q=75" : sluzba.image}
                      alt={sluzba.nazov}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={400}
                      height={225}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-blue-900/80" />
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                      <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-50 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <sluzba.icon className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
                      </div>
                    </div>
                    {/* Click indicator */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-primary">Klikni pre viac →</span>
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
            <p className="text-sm sm:text-xl text-gray-600 mb-4 sm:mb-6">
              <strong style={{ color: '#333333' }}>{t('youDontHaveToArrange')}</strong> {t('weHandleEverything')}
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="sm" className="bg-gray-900 hover:bg-black text-white font-semibold px-4 sm:px-8 text-xs sm:text-base shadow-lg">
                {t('startProject')}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
                </Link>
                </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-6 sm:py-16 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              <h2 className="text-lg sm:text-3xl md:text-5xl font-bold mb-1.5 sm:mb-3" style={{ color: '#333333' }}>
                {t('whyAmericanLiving')}
              </h2>
            <p className="text-xs sm:text-base text-gray-600 max-w-3xl mx-auto">
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
                <Card className="p-6 text-center h-full hover:shadow-xl transition-all duration-300 bg-white shadow-md group">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <vyhoda.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#333333' }}>{vyhoda.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{vyhoda.description}</p>
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
            <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 border-2 border-yellow-400 p-4 sm:p-8 shadow-2xl hover:shadow-yellow-400/30 transition-shadow">
              <div className="flex gap-2 sm:gap-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="text-base sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                    {t('misleadingAdsWarning')}
                  </h3>
                  <p className="text-xs sm:text-base text-gray-800 mb-2 sm:mb-3 leading-relaxed font-medium">
                    {t('misleadingAdsDesc1')}
                  </p>
                  <p className="text-xs sm:text-base text-gray-800 mb-2 sm:mb-3 leading-relaxed font-medium">
                    {t('misleadingAdsDesc2')}
                  </p>
                  <p className="text-sm sm:text-lg text-gray-900 font-bold">
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
        <section className="py-6 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 sm:mb-10"
            >
                <h2 className="text-lg sm:text-3xl md:text-5xl font-bold mb-1.5" style={{ color: '#333333' }}>
                  {t('ourOffer')}
                </h2>
              <p className="text-xs sm:text-base text-gray-600">
                {t('woodHouseNotLookWood')}
              </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-12">
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
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white shadow-md h-full">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok?.includes("unsplash.com") ? dom.hlavny_obrazok.replace(/([&?])w=\d+/, "$1w=300").replace("q=80", "q=75") + (dom.hlavny_obrazok.includes("?") ? "&fm=webp" : "?fm=webp") : dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          width={300}
                          height={169}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {dom.celorocny && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-accent text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[7px] sm:text-xs font-bold shadow-lg"
                          >
                            ✔ CELOROČNÝ
                          </motion.div>
                        )}
                      </div>
                      <div className="p-2 sm:p-4">
                        <div className="text-[8px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 font-semibold uppercase tracking-wider truncate">{dom.vyrobca}</div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-200">
                          <div className="flex-1 min-w-0">
                            {dom.vyrobca === "Ticab house" ? (
                              <div>
                                <div className="flex items-baseline gap-0.5 flex-wrap">
                                  <p className="text-[9px] sm:text-xs font-black text-red-500 line-through leading-none">
                                    {dom.zakladna_cena?.toLocaleString('sk-SK')}€
                                  </p>
                                  <p className="text-xs sm:text-sm font-black text-green-600 leading-none">
                                    {Math.round(dom.zakladna_cena * 0.95)?.toLocaleString('sk-SK')}€
                                  </p>
                                </div>
                                <p className="text-[7px] sm:text-[9px] text-green-700 font-semibold leading-tight mt-0.5">
                                  💰 s dotáciou
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs sm:text-base font-black text-primary leading-tight">
                                {dom.zakladna_cena?.toLocaleString('sk-SK')}€
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary group-hover:text-secondary transition-colors flex-shrink-0 ml-1" />
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
                  <Button size="lg" className="relative bg-gray-900 hover:bg-black text-white font-black text-sm sm:text-xl px-6 sm:px-16 py-4 sm:py-8 shadow-lg group">
                    <Home className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                    {t('showAllHouses')}
                    <ArrowRight className="ml-1 w-4 h-4 sm:ml-2 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Proces realizácie */}
      <section className="py-3 sm:py-10 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-2xl font-bold text-gray-900">{t('implementationProcess')}</h2>
            </div>

            <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-1 sm:gap-2">
            {proces.map((krok, index) => (
              <div key={index} className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 sm:px-3 sm:py-1.5">
                <span className="text-[7px] sm:text-xs font-bold text-primary/50">{krok.cislo}</span>
                <krok.icon className="w-2 h-2 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[7px] sm:text-xs font-medium text-gray-800">{krok.nazov}</span>
              </div>
                  ))}
                  </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <ServiceDetailModal 
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        service={selectedService}
      />

      {/* CTA Section */}
      <section className="py-6 sm:py-16 bg-gray-900">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-lg sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white">
              {t('readyForOwnHouse')}
            </h2>
            <p className="text-xs sm:text-base mb-3 sm:mb-6 text-gray-300">
              {t('contactUsAndFind')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to={createPageUrl("Katalog")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-black text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 shadow-lg">
                    <Home className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6" />
                    {t('houseCatalogButton')}
                    <ArrowRight className="ml-1 w-4 h-4 sm:ml-2 sm:w-6 sm:h-6" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl("Kontakt")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7">
                    <Phone className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6" />
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