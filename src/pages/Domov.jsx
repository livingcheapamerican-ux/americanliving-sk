import React, { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp, Settings, LogIn, Gift, Star, Users,
  MessageCircle, Send
} from "lucide-react";
import { motion } from "framer-motion";
import HeroSettingsManager from "../components/admin/HeroSettingsManager";
import { useLanguage } from "../components/LanguageContext";
import ServiceDetailModal from "../components/ServiceDetailModal";

// Dotacia verify banner translations
const dotaciaVerifyT = {
  sk: { line1: "OVERENIE nároku na", line2: "DOTÁCIU" },
  en: { line1: "CHECK YOUR ELIGIBILITY FOR A", line2: "GRANT" },
  de: { line1: "ANSPRUCH PRÜFEN AUF", line2: "FÖRDERUNG" },
  fr: { line1: "VÉRIFIER L'ÉLIGIBILITÉ À LA", line2: "SUBVENTION" },
  hu: { line1: "JOGOSULTSÁG ELLENŐRZÉSE A", line2: "DOTÁCIÓRA" },
  pl: { line1: "SPRAWDŹ UPRAWNIENIA DO", line2: "DOTACJI" },
  uk: { line1: "ПЕРЕВІРТЕ ПРАВО НА", line2: "ДОТАЦІЮ" },
  sr: { line1: "ПРОВЕРИТЕ ПРАВО НА", line2: "ДОТАЦИЈУ" },
  hr: { line1: "PROVJERITE PRAVO NA", line2: "DOTACIJU" },
  el: { line1: "ΕΛΕΓΞΤΕ ΤΟ ΔΙΚΑΙΩΜΑ ΣΑΣ ΓΙΑ", line2: "ΕΠΙΔΟΤΗΣΗ" },
};

// Social proof translations
const socialProofT = {
  sk: { clients: "spokojných rodín", reviews: "overených recenzií", years: "rokov skúseností", quote1: "Dom sme dostali za 4 mesiace. Všetko vybavili za nás – hypotéka, pozemok aj kolaudácia.", name1: "Mária K., Trnava", quote2: "Konečne firma, ktorá drží slovo. Cena ostala rovnaká od začiatku do konca.", name2: "Peter S., Žilina" },
  en: { clients: "happy families", reviews: "verified reviews", years: "years of experience", quote1: "We received our house in 4 months. They handled everything – mortgage, land and final approval.", name1: "Maria K., Trnava", quote2: "Finally a company that keeps its word. The price stayed the same from start to finish.", name2: "Peter S., Zilina" },
  de: { clients: "zufriedene Familien", reviews: "verifizierte Bewertungen", years: "Jahre Erfahrung", quote1: "Wir erhielten unser Haus in 4 Monaten. Sie erledigten alles – Hypothek, Grundstück und Abnahme.", name1: "Maria K., Trnava", quote2: "Endlich eine Firma, die ihr Wort hält. Der Preis blieb von Anfang bis Ende gleich.", name2: "Peter S., Zilina" },
  fr: { clients: "familles satisfaites", reviews: "avis vérifiés", years: "ans d'expérience", quote1: "Nous avons reçu notre maison en 4 mois. Ils ont tout géré – hypothèque, terrain et réception.", name1: "Maria K., Trnava", quote2: "Enfin une entreprise qui tient sa parole. Le prix est resté le même du début à la fin.", name2: "Peter S., Zilina" },
  hu: { clients: "elégedett család", reviews: "ellenőrzött vélemény", years: "év tapasztalat", quote1: "4 hónap alatt megkaptuk a házunkat. Mindent elintéztek – jelzálog, telek és engedélyezés.", name1: "Mária K., Nagyszombat", quote2: "Végre egy cég, amely betartja a szavát. Az ár az elejétől a végéig ugyanannyi maradt.", name2: "Péter S., Zsolna" },
  pl: { clients: "zadowolonych rodzin", reviews: "zweryfikowanych opinii", years: "lat doświadczenia", quote1: "Dom otrzymaliśmy w 4 miesiące. Wszystko załatwili za nas – hipoteka, działka i odbiór.", name1: "Maria K., Trnawa", quote2: "Nareszcie firma, która dotrzymuje słowa. Cena pozostała taka sama od początku do końca.", name2: "Piotr S., Żylina" },
  uk: { clients: "задоволених сімей", reviews: "перевірених відгуків", years: "років досвіду", quote1: "Будинок отримали за 4 місяці. Все вирішили за нас – іпотека, ділянка та введення в експлуатацію.", name1: "Марія К., Трнава", quote2: "Нарешті компанія, що тримає слово. Ціна залишилася незмінною від початку до кінця.", name2: "Петро С., Жиліна" },
  sr: { clients: "задовољних породица", reviews: "верификованих рецензија", years: "година искуства", quote1: "Кућу смо добили за 4 месеца. Све су средили уместо нас – хипотека, парцела и колаудација.", name1: "Марија К., Трнава", quote2: "Коначно фирма која одржава реч. Цена је остала иста од почетка до краја.", name2: "Петар С., Жилина" },
  hr: { clients: "zadovoljnih obitelji", reviews: "verificiranih recenzija", years: "godina iskustva", quote1: "Kuću smo dobili za 4 mjeseca. Sve su sredili umjesto nas – hipoteka, parcela i kolaudacija.", name1: "Marija K., Trnava", quote2: "Konačno tvrtka koja drži riječ. Cijena je ostala ista od početka do kraja.", name2: "Petar S., Žilina" },
  el: { clients: "ικανοποιημένες οικογένειες", reviews: "επαληθευμένες κριτικές", years: "χρόνια εμπειρίας", quote1: "Πήραμε το σπίτι μας σε 4 μήνες. Τα διαχειρίστηκαν όλα – υποθήκη, οικόπεδο και παραλαβή.", name1: "Μαρία Κ., Τρνάβα", quote2: "Επιτέλους εταιρεία που κρατά το λόγο της. Η τιμή παρέμεινε ίδια από την αρχή έως το τέλος.", name2: "Πέτρος Σ., Ζίλινα" },
};

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
  const { t, language } = useLanguage();
  const sp = socialProofT[language] || socialProofT.sk;
  const dv = dotaciaVerifyT[language] || dotaciaVerifyT.sk;
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: async () => {
      const all = await base44.entities.Dom.filter({ popularny: true }, 'poradie', 20);
      return all.filter(dom => dom.verejny !== false).slice(0, 6);
    },
  });

  // Načítaj verejné domy pre FloatingHouses — zdieľaný query s FloatingHouses komponentom
  const { data: verejneDomy = [] } = useQuery({
    queryKey: ['domy-floating-public'],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }),
    staleTime: 300000,
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

  const heroImages = useMemo(() => 
    heroSettings?.hero_images?.length > 0 
      ? heroSettings.hero_images 
      : DEFAULT_HERO_IMAGES,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [heroSettings?.hero_images?.join(',')]
  );
  
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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.americanliving.sk/#webpage",
          "url": "https://www.americanliving.sk",
          "name": "American Living – modulárne, montované a mobilné domy na Slovensku",
          "description": "Predaj a výstavba modulárnych, montovaných a mobilných domov. Prosto House, Ticab house, JAK Modules. Ceny od výrobcu, A0 energetická trieda, celoročné bývanie.",
          "isPartOf": { "@id": "https://www.americanliving.sk/#website" },
          "about": { "@id": "https://www.americanliving.sk/#organization" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Domov", "item": "https://www.americanliving.sk" }]
          }
        })}</script>
      </Helmet>

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
      <section className="relative h-[80vh] sm:h-[100vh] min-h-[500px] sm:min-h-[700px] overflow-hidden bg-slate-950 pt-8 sm:pt-0">
        
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
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
              className="hidden sm:block text-sm sm:text-lg md:text-xl mb-4 sm:mb-8 text-slate-300 leading-relaxed max-w-2xl font-light" 
              style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
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
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                  className="w-full sm:w-auto bg-white/15 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold text-base sm:text-lg px-5 sm:px-8 py-4 sm:py-6 shadow-2xl transition-all"
                >
                  <MessageCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {t('consultation')}
                </Button>
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

      {/* AI Consultation Section - Kexo */}
      <section className="py-12 sm:py-16 bg-[#08080A] relative overflow-hidden border-b border-[#C5A880]/15">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#9E2A2B]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#0D0D11]/90 to-[#16161D]/80 backdrop-blur-xl border border-[#C5A880]/20 rounded-3xl p-6 sm:p-12 shadow-[0_0_50px_rgba(197,168,128,0.08)] flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
              
              {/* Left Side: Copy & Features */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/35 text-[#C5A880] text-xs sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Kexo – AI konzultant online
                </div>
                
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
                  Poraďte sa o svojom dome.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] via-white to-[#C5A880]">
                    Odpovedáme okamžite!
                  </span>
                </h2>
                
                <p className="text-sm sm:text-lg text-slate-300 font-light mb-6 sm:mb-8 leading-relaxed max-w-xl">
                  Náš AI expert <strong className="text-[#C5A880] font-semibold">Kexo</strong> má prístup ku kompletným cenníkom, technickým špecifikáciám a parametrom všetkých domov. Pomôže vám s kalkuláciou ceny na kľúč, výberom technológií aj konfiguráciou.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 text-left">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">Cena na kľúč</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400">Kompletné sčítanie základov, montáže a inžinieringu.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">Moderné technológie</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400">Všetko o KVH konštrukcii a bazaltovej izolácii.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">Návod pre konfigurátor</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400">Pomoc so zostavením rodinného domu A0 krok za krokom.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">Hypotéka a financovanie</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400">Rýchle zistenie možností financovania a splátok.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                    size="lg" 
                    className="bg-gradient-to-r from-[#9E2A2B] to-[#b13536] hover:from-[#b13536] hover:to-[#9E2A2B] text-white font-bold px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(158,42,43,0.35)] hover:shadow-[0_0_30px_rgba(158,42,43,0.5)] border border-[#C5A880]/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Spustiť konzultáciu s Kexom
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right Side: Chat Mockup Interface */}
              <div className="w-full lg:w-96 flex-shrink-0">
                <div className="bg-[#08080A]/90 border border-[#C5A880]/15 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-[#C5A880]/10 pb-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#16161D] border border-[#C5A880]/30 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-200">Kexo</h3>
                      <p className="text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Odpovedá okamžite
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-[#16161D]/80 border border-[#C5A880]/10 rounded-2xl px-3 py-2 text-xs text-slate-300 max-w-[90%]">
                        👋 Dobrý deň! Som váš AI poradca. Hľadáte celoročný dom, alebo rekreačnú chatku?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#9E2A2B] rounded-2xl px-3 py-2 text-xs text-slate-100 max-w-[90%]">
                        Hľadám celoročný dom na kľúč s A0 certifikátom. Čo všetko to obsahuje?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[#16161D]/80 border border-[#C5A880]/10 rounded-2xl px-3 py-2 text-xs text-[#F5E6D3] max-w-[90%] font-medium">
                        Kexo: S radosťou vám to prepočítam! Zvolený dom v A0 konfigurácii na kľúč bude obsahovať zosilnenú izoláciu stien a stropu (250mm), vykurovanie s tepelným čerpadlom, riadené vetranie s rekuperáciou a vyhotovenie základov. Presnú cenu sčítam priamo z aktuálnych cenníkov pre daný model.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#C5A880]/10 flex gap-2">
                    <div className="flex-1 bg-[#16161D] border border-[#C5A880]/15 rounded-xl px-3 py-1.5 text-xs text-slate-500 flex items-center">
                      Spýtať sa na cenu na kľúč...
                    </div>
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                      className="bg-[#9E2A2B] hover:bg-[#802021] text-white p-2 rounded-xl"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Populárne domy Carousel */}
      {domy && domy.length > 0 && (
        <section className="py-12 sm:py-20 bg-slate-950 relative border-b border-white/5">
          <div className="container mx-auto px-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{t('popularHouses') || 'Populárne domy'}</h2>
                <p className="text-slate-400">{t('popularHousesDesc') || 'Pozrite si najžiadanejšie modely z nášho katalógu'}</p>
              </div>
              <Link to={createPageUrl("Katalog")} className="hidden sm:flex items-center gap-2 text-primary hover:text-red-400 font-semibold transition-colors">
                {t('showAllHouses') || 'Zobraziť všetky domy'} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="w-full overflow-hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 px-4 sm:px-12 xl:px-24 gap-4 sm:gap-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {domy.map((dom, index) => (
                <motion.div 
                  key={dom.id} 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[400px] lg:w-[450px]"
                >
                  <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                    <Card className="bg-slate-900/80 backdrop-blur-sm border-white/10 overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-red-900/20">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={dom.hlavny_obrazok || dom.obrazky?.[0]} 
                          alt={dom.nazov} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        
                        {dom.popularny && (
                          <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-500/50 flex items-center gap-1">
                            <Star className="w-3 h-3" /> Bestseller
                          </div>
                        )}
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-md">{dom.nazov}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {dom.zastavana_plocha && (
                              <span className="text-xs font-semibold bg-slate-800/80 backdrop-blur-md text-slate-200 px-2 py-1 rounded-md border border-white/10">
                                {dom.zastavana_plocha} m²
                              </span>
                            )}
                            {dom.pocet_izieb && (
                              <span className="text-xs font-semibold bg-slate-800/80 backdrop-blur-md text-slate-200 px-2 py-1 rounded-md border border-white/10">
                                {dom.pocet_izieb} {t('rooms') || 'izby'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xs text-slate-400">{t('priceFrom') || 'Cena od'}</div>
                          <div className="text-xl font-black text-white">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</div>
                        </div>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white hover:text-slate-900 bg-transparent text-white transition-all group-hover:border-white">
                          {t('houseDetail') || 'Detail domu'} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="container mx-auto px-4 mt-4 sm:hidden">
            <Link to={createPageUrl("Katalog")} className="flex items-center justify-center gap-2 text-primary hover:text-red-400 font-semibold transition-colors w-full bg-slate-900/50 py-3 rounded-xl border border-white/5">
              {t('showAllHouses') || 'Zobraziť všetky domy'} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Trusted Partners Section - Overení partneri */}
      <section className="py-12 sm:py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-16 text-white"
            >
            {t('trustedPartnersTitle')}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {/* Prosto House */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl hover:bg-slate-800/50 transition-all"
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
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-5 text-white">
                {t('prostoTitle')}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-lg font-light">
                {t('prostoBody')}
              </p>
            </motion.div>

            {/* TicabHouse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl hover:bg-slate-800/50 transition-all"
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
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-5 text-white">
                {t('ticabTitle')}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-lg font-light">
                {t('ticabBody')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DOTÁCIA AMERICANA - Premium Redesign */}
      <section className="py-16 sm:py-28 bg-slate-950 relative overflow-hidden border-t border-white/5">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Ľavá strana: Copywriting */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-6">
                  <Gift className="w-4 h-4" /> VIP Benefit Program
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                  Viac než len dom.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                    Finančná injekcia pre váš nový začiatok.
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-400 font-light mb-8 leading-relaxed max-w-xl">
                  Vieme, že stavba domu je životné rozhodnutie a obrovská finančná záťaž. Preto sme vytvorili exkluzívny program <strong className="text-slate-200">Dotácia Americana</strong>, ktorý vám po podpise zmluvy pomôže pokryť náklady na energie alebo uľahčí vašu investíciu.
                </p>
                
                <Link to={createPageUrl("DotaciaAmericana")} className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold px-8 py-7 text-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] border border-red-400/50 transition-all group rounded-2xl">
                    <span className="flex items-center justify-center gap-3">
                      Overiť nárok na dotáciu
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                
                <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span>Garantované financovanie pre našich klientov.</span>
                </div>
              </motion.div>
            </div>

            {/* Pravá strana: Glassmorphism Karty */}
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
                
                {/* Karta Pre Rodiny */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-slate-800/60 transition-all shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/50">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('forFamilies')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('grantAtSigning')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('energyFullyRefunded')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('supportAfterHandover')}</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Karta Pre Investorov */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-slate-800/60 transition-all shadow-2xl relative overflow-hidden lg:mt-12 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-900/50">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('forInvestors')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('grantAtSigning')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('marketingFree')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{t('passiveIncomeFromAirbnb')}</span>
                    </li>
                  </ul>
                </motion.div>

              </div>
              <div className="mt-6 text-center lg:text-right">
                <p className="inline-block px-4 py-2 bg-slate-900/80 rounded-lg border border-white/5 text-xs text-slate-500 italic">
                  💡 {t('grantAmountVaries')}
                </p>
              </div>
            </div>
            
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
      <section className="py-12 sm:py-24 bg-slate-950 relative border-t border-white/10">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
                {t('allInOnePlace')}
              </h2>
            <p className="text-sm sm:text-lg text-slate-400 max-w-3xl mx-auto mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-4 sm:mb-10">
            {sluzby.map((sluzba, index) => {
              const getBentoClasses = (idx) => {
                if (idx === 0) return "md:col-span-2";
                if (idx === 3) return "md:col-span-2";
                if (idx === 4) return "md:col-span-2";
                if (idx === 7) return "md:col-span-2";
                return "md:col-span-1";
              };
              
              return (
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
                className={`h-full ${getBentoClasses(index)}`}
              >
                <Card className="group overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300 cursor-pointer bg-slate-900 border-white/10 shadow-lg hover:-translate-y-2">
                  <div className="relative flex-1 min-h-[200px] overflow-hidden">
                    <img 
                      src={sluzba.image.includes("unsplash.com") ? sluzba.image.replace(/\?.*$/, "") + "?fm=webp&auto=format,compress&w=800&q=75" : sluzba.image}
                      alt={sluzba.nazov}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent group-hover:from-blue-900/80 transition-colors duration-500" />
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-white to-slate-100 rounded-xl flex items-center justify-center shadow-2xl mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                        <sluzba.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-md">{sluzba.nazov}</h3>
                      <p className="text-slate-300 text-sm sm:text-base font-light line-clamp-2">{sluzba.popis}</p>
                    </div>
                    {/* Click indicator */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-primary">Klikni pre viac →</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )})}
            </div>

                  <div className="text-center">
            <p className="text-sm sm:text-xl text-slate-400 mb-4 sm:mb-6">
              <strong className="text-white">{t('youDontHaveToArrange')}</strong> {t('weHandleEverything')}
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="lg" className="bg-primary hover:bg-red-700 text-white font-bold px-6 sm:px-10 py-6 text-sm sm:text-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all">
                {t('startProject')}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </Button>
                </Link>
                </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-12 sm:py-24 bg-slate-900 border-t border-white/10">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6 text-white">
                {t('whyAmericanLiving')}
              </h2>
            <p className="text-sm sm:text-lg text-slate-400 max-w-3xl mx-auto font-light">
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
                <Card className="p-8 text-center h-full hover:shadow-2xl transition-all duration-300 bg-slate-950 border-white/5 shadow-lg group">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <vyhoda.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-3 text-white">{vyhoda.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{vyhoda.description}</p>
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
        <section className="py-12 sm:py-24 bg-slate-950 border-t border-white/10">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 sm:mb-10"
            >
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-6 text-white">
                  {t('ourOffer')}
                </h2>
              <p className="text-sm sm:text-lg text-slate-400 font-light">
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
                      <Card className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-slate-900 border-white/10 shadow-lg h-full">
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
                      <div className="p-3 sm:p-5">
                        <div className="text-[10px] sm:text-xs text-slate-500 mb-1 sm:mb-2 font-bold uppercase tracking-widest truncate">{dom.vyrobca}</div>
                        <h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3 group-hover:text-red-500 transition-colors line-clamp-2 leading-tight">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-white/10">
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
                  <Button size="lg" className="relative bg-white hover:bg-slate-200 text-slate-900 font-black text-sm sm:text-xl px-6 sm:px-16 py-4 sm:py-8 shadow-[0_0_30px_rgba(255,255,255,0.15)] group">
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
      <section className="py-6 sm:py-16 bg-slate-900 border-t border-white/10">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-sm sm:text-2xl font-bold text-white">{t('implementationProcess')}</h2>
            </div>

            <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-1 sm:gap-2">
            {proces.map((krok, index) => (
              <div key={index} className="flex items-center gap-0.5 sm:gap-1 bg-slate-950 border border-white/10 rounded-full px-2 py-1 sm:px-4 sm:py-2">
                <span className="text-[7px] sm:text-xs font-bold text-red-500/80">{krok.cislo}</span>
                <krok.icon className="w-2 h-2 sm:w-4 sm:h-4 text-red-500" />
                <span className="text-[7px] sm:text-xs font-medium text-slate-300">{krok.nazov}</span>
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
      <section className="py-12 sm:py-24 bg-slate-950 border-t border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-lg sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white">
              {t('readyForOwnHouse')}
            </h2>
            <p className="text-sm sm:text-lg mb-6 sm:mb-10 text-slate-400 font-light">
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
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/15 hover:text-white font-bold text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 shadow-lg transition-all duration-300">
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