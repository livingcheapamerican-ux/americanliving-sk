import React, { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp, Settings, LogIn, Gift, Star, Users,
  MessageCircle, Send, Sparkles, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSettingsManager from "../components/admin/HeroSettingsManager";
import { useLanguage } from "../components/LanguageContext";
import ServiceDetailModal from "../components/ServiceDetailModal";
import { optimizeImageUrl } from "../components/ImageWithWatermark";
import Chapter from "../components/home/Chapter";
import ChapterHeading from "../components/home/ChapterHeading";
import ShowroomChapter from "../components/home/ShowroomChapter";
import HomeBackgroundVideo from "../components/home/HomeBackgroundVideo";

const sliderT = {
  sk: { viz: "Vizualizácia", real: "Realizácia" },
  en: { viz: "Visualization", real: "Realization" },
  de: { viz: "Visualisierung", real: "Realität" },
  fr: { viz: "Visualisation", real: "Réalisation" },
  hu: { viz: "Vizualizáció", real: "Valóság" },
  pl: { viz: "Wizualizacja", real: "Realizacja" },
  uk: { viz: "Візуалізація", real: "Реальність" },
  sr: { viz: "Визуелизација", real: "Реализација" },
  hr: { viz: "Vizualizacija", real: "Realizacija" },
  el: { viz: "Τρισδιάστατο", real: "Πραγματικότητα" }
};

const getManufacturerBadge = (manufacturer) => {
  const name = manufacturer || "";
  const isTicab = name.toLowerCase().includes("ticab");
  if (isTicab) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A880]/15 dark:bg-[#C5A880]/10 border border-[#C5A880]/30 text-[10px] font-black uppercase tracking-wider text-[#C5A880] dark:text-[#E2C799] shadow-sm backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse"></span>
        Ticab House
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/70 dark:bg-slate-900/80 border border-slate-700 text-[10px] font-black uppercase tracking-wider text-[#6B7A72] dark:text-[#6B7A72] shadow-sm backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Prosto House
      </span>
    );
  }
};

function ImageComparisonSlider({ beforeImage, afterImage, language }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const trans = sliderT[language] || sliderT.sk;

  useEffect(() => {
    const handleMoveEvent = (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      handleMoveEvent(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        handleMoveEvent(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 cursor-ew-resize shadow-lg"
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onTouchStart={() => setIsDragging(true)}
    >
      <img 
        src={optimizeImageUrl(beforeImage, 800)} 
        alt="Visualization" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-full border border-white/10 z-10 pointer-events-none uppercase tracking-wider">
        {trans.viz}
      </div>

      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={optimizeImageUrl(afterImage, 800)} 
          alt="Realization" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>
      <div className="absolute top-4 right-4 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-full border border-white/10 z-10 pointer-events-none uppercase tracking-wider">
        {trans.real}
      </div>

      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/[0.04] backdrop-blur-md border border-[#C5A880] text-slate-800 dark:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}


// Dotacia verify banner translations
const dotaciaVerifyT = {
  sk: { line1: "OVERENIE nároku na", line2: "SÚKROMNÝ GRANT" },
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
  sk: { clients: "spokojných rodín", reviews: "overených recenzií", years: "rokov skúseností", quote1: "Dom sme dostali do 3 mesiacov. Všetko vybavili za nás – hypotéka, pozemok aj kolaudácia.", name1: "Mária K., Trnava", quote2: "Konečne firma, ktorá drží slovo. Cena ostala rovnaká od začiatku do konca.", name2: "Peter S., Žilina" },
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
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/49133a5d4_Barnhills.jpeg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/24cecde9d_BarnZilina.jpeg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/ee82ce3f5_Barnmurovkazilina.jpeg"
];

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/376b4bd9f_okruhlelogo.png";


const localShowcaseT = {
  sk: {
    galleryTitle: "{gt.galleryTitle}",
    galleryDesc: "{gt.galleryDesc}",
    exterier: "{gt.exterier}",
    interier: "{gt.interier}",
    noCapitalTitle: "{gt.noCapitalTitle}",
    noCapitalDesc: "{gt.noCapitalDesc}",
    askKexoFinancing: "{gt.askKexoFinancing}",
    trustGrantTitle: "{gt.trustGrantTitle}",
    trustGrantDesc: "{gt.trustGrantDesc}",
    trustGrantLink: "{gt.trustGrantLink}",
    trustFinanceTitle: "{gt.trustFinanceTitle}",
    trustFinanceDesc: "{gt.trustFinanceDesc}",
    trustFinanceButton: "{gt.trustFinanceButton}",
    trustBuildTitle: "{gt.trustBuildTitle}",
    trustBuildDesc: "{gt.trustBuildDesc}",
    trustBuildLink: "{gt.trustBuildLink}",
    socialRealEst: "{gt.socialRealEst}",
    socialRealEstDesc: "Aby ste mohli stavať nové, často musíte najprv dobre predať to staré. Postaráme sa o kompletný realitný servis vašej súčasnej nehnuteľnosti.",
    socialLand: "{gt.socialLand}",
    socialLandDesc: "Nájdeme pre vás pozemok, ktorý nie je len \"staviteľný\" na papieri, ale je optimálny pre vybranú technológiu domu.",
    socialFinance: "{gt.socialFinance}",
    socialFinanceDesc: "Stavba domu vyžaduje špecifické čerpanie úveru v tranžiach. Naši finanční špecialisti nastavia hypotéku presne na mieru harmonogramu.",
    socialArch: "{gt.socialArch}",
    socialArchDesc: "Či už chcete upraviť jeden z našich katalógových projektov alebo túžite po unikátnom dizajne na mieru, naši architekti sú vám k dispozícii.",
    socialPermits: "{gt.socialPermits}",
    socialPermitsDesc: "Získanie stavebného povolenia je pre bežného človeka nočnou morou – pre nás je to rutina. Zastúpime vás v celom inžinierskom procese.",
    socialBuild: "{gt.socialBuild}",
    socialBuildDesc: "Realizujeme hrubé stavby, holodomy aj domy na kľúč. Pracujeme s overenými materiálmi a vlastným tímom odborníkov.",
    socialUtilities: "{gt.socialUtilities}",
    socialUtilitiesDesc: "Dom bez sietí je len hrubá stavba. Zabezpečíme kompletnú realizáciu prípojok vody, elektriny, plynu a kanalizácie.",
    socialApproval: "{gt.socialApproval}",
    socialApprovalDesc: "Cieľová rovinka. Pripravíme všetky revízie, certifikáty, geometrické plány a dokumenty potrebné ku kolaudačnému konaniu.",
    verifikaciaText: "{gt.verifikaciaText}"
  },
  en: {
    galleryTitle: "Gallery of our most lucrative houses",
    galleryDesc: "View real photos and details of the exterior and interior of our premium prefabricated and modular homes.",
    exterier: "Exterior of houses",
    interier: "Interior and layout",
    noCapitalTitle: "Do you want to build a new house and have no capital?",
    noCapitalDesc: "No problem! We have a financing model for those with no savings. We will help you secure financing from A to Z.",
    askKexoFinancing: "Ask Kexo about financing",
    trustGrantTitle: "Súkromná Dotácia AMERICANA",
    trustGrantDesc: "Poskytujeme unikátnu dotáciu a finančný príspevok na energetickú certifikáciu a prevádzku domu až do 15 000 €.",
    trustGrantLink: "Zistiť nárok na dotáciu",
    trustFinanceTitle: "100% Construction Financing",
    trustFinanceDesc: "No cash? At American Living we finance construction without initial savings. We arrange everything for you including mortgage.",
    trustFinanceButton: "Ask about financing",
    trustBuildTitle: "Fast Handover of Construction",
    trustBuildDesc: "We guarantee factory handover in just 6 weeks for modular homes and within 12 weeks turnkey for prefab homes.",
    trustBuildLink: "How it works",
    socialRealEst: "Capital for your new home secured quickly and safely.",
    socialRealEstDesc: "To build new, you often need to sell the old first. We provide full real estate service for your current property.",
    socialLand: "Not every meadow is a suitable building plot.",
    socialLandDesc: "We will find you a plot that is optimal for the chosen house technology, checking utilities, access, and zoning.",
    socialFinance: "Financing house construction is not a standard mortgage.",
    socialFinanceDesc: "Construction requires drawdowns in stages. Our specialists will tailor a mortgage to the project timeline.",
    socialArch: "A house with logic before the first shovel hits.",
    socialArchDesc: "Whether you want to adapt a catalog model or design a unique custom home, our architects are here for you.",
    socialPermits: "Leave the bureaucracy to us.",
    socialPermitsDesc: "Getting a permit is a nightmare - for us it's routine. We represent you in all engineering processes.",
    socialBuild: "Quality construction without hidden costs.",
    socialBuildDesc: "We build structures to turnkey standard using certified materials and our own team of experts.",
    socialUtilities: "So that everything works at the turn of a tap.",
    socialUtilitiesDesc: "A house without utilities is just shell. We provide full connections for water, electricity, gas, and sewer.",
    socialApproval: "Last stamp and handover of keys.",
    socialApprovalDesc: "Final stretch. We prepare all tests, certificates, maps, and documents needed for final occupancy approval.",
    verifikaciaText: "Visualization / Realization"
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
};

const headlineContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const headlineWord = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14
    }
  }
};

export default function Domov() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const { t, language } = useLanguage();
  const sp = socialProofT[language] || socialProofT.sk;
  const gt = localShowcaseT[language] || localShowcaseT.sk;
  const dv = dotaciaVerifyT[language] || dotaciaVerifyT.sk;

  // Selected house details state and dynamic lookups
  const [selectedHouseId, setSelectedHouseId] = useState("barn72");
  
  // Facade lookbook options
  const [selectedFacade, setSelectedFacade] = useState("anthracite");

  // Načítaj verejné domy pre FloatingHouses — zdieľaný query s FloatingHouses komponentom
  const { data: verejneDomy = [] } = useQuery({
    queryKey: ['domy-floating-public'],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }, 'poradie', 100),
    staleTime: 300000,
  });

  const facadeImages = useMemo(() => {
    const base = {
      barn72: {
        anthracite: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/5ddf7431e_BarnDoubledrevouvodnafotka.jpg",
        wood: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/eccd583aa_barn-double-prosto-house-3.jpg",
        stucco: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/2b401b76a_BarnDouble72exteriermurovkauvodnyobrazok.jpg"
      },
      london: {
        anthracite: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/952c7dee5_Londonexterierdrevoplech1.jpg",
        wood: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25cd528c6_Londonexterierdrevoplech2.jpg",
        stucco: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg"
      },
      barn48: {
        anthracite: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/49133a5d4_Barnhills.jpeg",
        wood: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/24cecde9d_BarnZilina.jpeg",
        stucco: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/ee82ce3f5_Barnmurovkazilina.jpeg"
      }
    };

    if (verejneDomy.length > 0 && !base[selectedHouseId]) {
      const activeDbHouse = verejneDomy.find(d => d.id === selectedHouseId || d.slug === selectedHouseId);
      if (activeDbHouse) {
        const stuccoImg = activeDbHouse.galerie?.find(g => g.typ === "exterier_murovka")?.fotky?.[0] || activeDbHouse.hlavny_obrazok;
        const woodImg = activeDbHouse.galerie?.find(g => g.typ === "exterier_drevo_plech")?.fotky?.[0] || activeDbHouse.hlavny_obrazok;
        const anthraciteImg = activeDbHouse.galerie?.find(g => g.typ === "exterier_drevo_plech")?.fotky?.[1] || activeDbHouse.hlavny_obrazok;

        base[selectedHouseId] = {
          anthracite: anthraciteImg,
          wood: woodImg,
          stucco: stuccoImg
        };
      }
    }

    return base;
  }, [selectedHouseId, verejneDomy]);

  const facadeOptions = useMemo(() => {
    const images = facadeImages[selectedHouseId] || facadeImages.barn72;
    return [
      { id: "anthracite", name: t('facadeFalcplech') || "Falcovaný plech", desc: t('facadeFalcplechDesc') || "Moderný antracit", img: images.anthracite },
      { id: "wood", name: t('facadeWood') || "Drevený obklad", desc: t('facadeWoodDesc') || "Severský smrek", img: images.wood },
      { id: "stucco", name: t('facadeStuccoLabel') || "Šúchaná omietka", desc: t('facadeStuccoDesc') || "Svetlý exteriér", img: images.stucco }
    ];
  }, [selectedHouseId, facadeImages, t]);

  const selectedFacadeImage = useMemo(() => {
    return facadeOptions.find(o => o.id === selectedFacade)?.img || facadeOptions[0].img;
  }, [selectedFacade, facadeOptions]);

  const hasMultipleFacades = useMemo(() => {
    return new Set(facadeOptions.map(o => o.img)).size > 1;
  }, [facadeOptions]);

  const switcherHouses = useMemo(() => {
    const default3 = [
      { id: "barn72", name: "Barn Double 72", desc: t('barnDoubleDesc') || "Dvojposchodový Barn", img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/5ddf7431e_BarnDoubledrevouvodnafotka.jpg" },
      { id: "london", name: "LONDON 144", desc: t('londonDesc') || "Veľkolepá rodinná vila", img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg" },
      { id: "barn48", name: "Barn 48", desc: t('barn48Desc') || "Škandinávska chatka", img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/cbd41c122_Barnbazen.jpeg" }
    ];

    const others = verejneDomy.filter(d => {
      const isDefault = d.prosto_house_kod === "PH-005" || 
                        d.nazov?.includes("LONDON") || 
                        d.prosto_house_kod === "PH-008" ||
                        d.id === "6916ec94c11aacdd15248f2c" ||
                        d.id === "6916ec94c11aacdd15248f07" ||
                        d.id === "6916ec94c11aacdd15248f31";
      return !isDefault;
    }).map(d => {
      let desc = d.vyrobca;
      if (d.uzitkova_plocha) desc += ` • ${d.uzitkova_plocha} m²`;
      return {
        id: d.id,
        name: d.nazov?.split(",")[0]?.split("(")[0]?.trim() || d.nazov,
        desc: desc,
        img: d.hlavny_obrazok
      };
    });

    return [...default3, ...others];
  }, [verejneDomy, t]);
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: async () => {
      const all = await base44.entities.Dom.filter({ verejny: true }, 'poradie', 100);
      
      const prosto = [];
      const ticab = [];
      
      all.forEach(d => {
        const m = (d.vyrobca || "").toLowerCase();
        if (m.includes("ticab")) {
          ticab.push(d);
        } else {
          prosto.push(d);
        }
      });
      
      const sortByPopularAndPrice = (list) => {
        return [...list].sort((a, b) => {
          if (a.popularny && !b.popularny) return -1;
          if (!a.popularny && b.popularny) return 1;
          return (b.zakladna_cena || 0) - (a.zakladna_cena || 0);
        });
      };
      
      const sortedProsto = sortByPopularAndPrice(prosto);
      const sortedTicab = sortByPopularAndPrice(ticab);
      
      const result = [];
      const targetSizePerGroup = 3;
      
      for (let i = 0; i < targetSizePerGroup; i++) {
        if (i < sortedTicab.length) result.push(sortedTicab[i]);
        if (i < sortedProsto.length) result.push(sortedProsto[i]);
      }
      
      // Pad to 6 total if one of the manufacturers has fewer than 3 public houses
      if (result.length < 6) {
        let remainingTicabIndex = targetSizePerGroup;
        let remainingProstoIndex = targetSizePerGroup;
        while (result.length < 6 && (remainingTicabIndex < sortedTicab.length || remainingProstoIndex < sortedProsto.length)) {
          if (remainingTicabIndex < sortedTicab.length) {
            result.push(sortedTicab[remainingTicabIndex++]);
          }
          if (result.length < 6 && remainingProstoIndex < sortedProsto.length) {
            result.push(sortedProsto[remainingProstoIndex++]);
          }
        }
      }
      
      return result;
    },
  });

  const currentHouseData = useMemo(() => {
    const dbHouse = verejneDomy.find(d => {
      if (selectedHouseId === "barn72") return d.id === "6916ec94c11aacdd15248f2c" || d.prosto_house_kod === "PH-005";
      if (selectedHouseId === "london") return d.id === "6916ec94c11aacdd15248f07" || d.nazov?.includes("LONDON");
      if (selectedHouseId === "barn48") return d.id === "6916ec94c11aacdd15248f31" || d.prosto_house_kod === "PH-008";
      return d.id === selectedHouseId || d.slug === selectedHouseId;
    });

    if (dbHouse) {
      return {
        id: dbHouse.id,
        name: dbHouse.nazov,
        area: dbHouse.zastavana_plocha || dbHouse.uzitkova_plocha || (selectedHouseId === "london" ? 144 : selectedHouseId === "barn72" ? 72 : 48),
        rooms: dbHouse.pocet_izieb || (selectedHouseId === "london" ? 5 : selectedHouseId === "barn72" ? 3 : 2),
        manufacturer: dbHouse.vyrobca || (selectedHouseId === "london" ? "Ticab house" : "Prosto House"),
        price: dbHouse.zakladna_cena || (selectedHouseId === "london" ? 120000 : selectedHouseId === "barn72" ? 36900 : 20900)
      };
    }

    const fallbacks = {
      barn72: {
        id: "6916ec94c11aacdd15248f2c",
        name: "Barn Double 72",
        area: 72,
        rooms: 3,
        manufacturer: "Prosto House",
        price: 36900
      },
      london: {
        id: "6916ec94c11aacdd15248f07",
        name: "LONDON 144",
        area: 144,
        rooms: 5,
        manufacturer: "Ticab house",
        price: 120000
      },
      barn48: {
        id: "6916ec94c11aacdd15248f31",
        name: "Barn 48",
        area: 48,
        rooms: 2,
        manufacturer: "Prosto House",
        price: 20900
      }
    };

    return fallbacks[selectedHouseId] || fallbacks.barn72;
  }, [selectedHouseId, verejneDomy]);

  // Premium showcase gallery states
  const [activeShowcaseHouseId, setActiveShowcaseHouseId] = useState("6916ec94c11aacdd15248f07");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState("exterier");
  const [lightboxImage, setLightboxImage] = useState(null);

  const premiumHouses = useMemo(() => {
    const ids = ["6916ec94c11aacdd15248f07", "6916ec94c11aacdd15248f18", "6916ec94c11aacdd15248f0b"];
    return verejneDomy.filter(d => ids.includes(d.id));
  }, [verejneDomy]);

  const showcaseImages = useMemo(() => {
    const house = premiumHouses.find(h => h.id === activeShowcaseHouseId);
    
    if (house && house.galerie) {
      let galleriesToInclude = [];
      if (activeShowcaseTab === "exterier") {
        galleriesToInclude = house.galerie.filter(g => g.typ === "exterier_murovka" || g.typ === "exterier_drevo_plech");
      } else {
        galleriesToInclude = house.galerie.filter(g => g.typ === "interier_sadrokarton" || g.typ === "interier_drevo");
      }
      
      const photos = [];
      galleriesToInclude.forEach(g => {
        if (g.fotky) {
          g.fotky.forEach(f => {
            if (!photos.includes(f)) photos.push(f);
          });
        }
      });
      if (photos.length > 0) return photos.slice(0, 8);
    }
    
    // Static fallbacks if DB is not loaded or has no images
    const staticGalleries = {
      "6916ec94c11aacdd15248f07": { // London 144
        exterier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/9e0922961_Londonexteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/952c7dee5_Londonexterierdrevoplech1.jpg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25cd528c6_Londonexterierdrevoplech2.jpg"
        ],
        interier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/43646a954_Londoninteriersadrokarton1.jpg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/e4cf2673e_Londoninterierdrevo1.jpg"
        ]
      },
      "6916ec94c11aacdd15248f18": { // Flat Double 142
        exterier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/335e826f0_FlatdoubleExteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/e21659a4d_FlatdoubleExteriermurovka4.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/6b3ff5efc_FlatdoubleExteriermurovka5.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/de8e12c89_FlatdoubleExteriermurovka6.jpeg"
        ],
        interier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/7eaca1fe0_Gemini_Generated_Image_2i1lyq2i1lyq2i1l.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/543aa55d3_Gemini_Generated_Image_5iqao65iqao65iqa.jpeg"
        ]
      },
      "6916ec94c11aacdd15248f0b": { // Alessandria 130
        exterier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/8ed846999_Alessandriaexteriermurovka9.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/2caab1c05_Alessandriaexteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/3e683ab92_Alessandriaexterierdrevoplech1.jpeg"
        ],
        interier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/318d4f916_Alessandriainteriersadrokarton1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/82db687c1_Alessandriainterierdrevo1.JPG"
        ]
      }
    };
    
    const fallback = staticGalleries[activeShowcaseHouseId] || staticGalleries["6916ec94c11aacdd15248f07"];
    return activeShowcaseTab === "exterier" ? fallback.exterier : fallback.interier;
  }, [activeShowcaseHouseId, activeShowcaseTab, premiumHouses]);

  const activeShowcaseHouseManufacturer = useMemo(() => {
    const dbHouse = verejneDomy.find(d => d.id === activeShowcaseHouseId);
    if (dbHouse?.vyrobca) return dbHouse.vyrobca;
    if (activeShowcaseHouseId === "6916ec94c11aacdd15248f07") return "Ticab house";
    return "Prosto House";
  }, [activeShowcaseHouseId, verejneDomy]);

  const visualizationImg = "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg";
  const realizationImg = "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/9e0922961_Londonexteriermurovka1.jpeg";

  const displayImages = useMemo(() => {
    if (activeShowcaseHouseId === "6916ec94c11aacdd15248f07" && activeShowcaseTab === "exterier") {
      return showcaseImages.filter(img => img !== visualizationImg && img !== realizationImg);
    }
    return showcaseImages;
  }, [showcaseImages, activeShowcaseHouseId, activeShowcaseTab]);

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
      body: "{gt.socialRealEstDesc}",
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
      body: "{gt.socialFinanceDesc}",
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
      body: "{gt.socialPermitsDesc}",
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
      body: "{gt.socialBuildDesc}",
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
      body: "{gt.socialUtilitiesDesc}",
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
      body: "{gt.socialApprovalDesc}",
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
    <div className="warm min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16 xl:-mt-20 overflow-x-hidden lg:overflow-x-visible relative text-[#2C3A33]">
      {/* 1. VRSTVA (SPODNÁ) - fixné video na celej stránke */}
      <HomeBackgroundVideo />
      {/* 2. VRSTVA (HORNÁ) - obsah stránky, ktorý sa roluje nad videom */}
      <div className="fixed-bg-content relative z-10">
        <Helmet>
        <link rel="canonical" href="https://americanliving.sk" />
        <title>American Living – Modulárne a montované domy na kľúč | Slovensko</title>
        <meta name="description" content="Exkluzívny distribútor modulárnych a montovaných domov na Slovensku. Ticab house, Prosto House. Energetická trieda A0, montáž 60 dní, ceny od 19 500 €." />
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
          "@id": "https://americanliving.sk/#webpage",
          "url": "https://americanliving.sk",
          "name": "American Living – modulárne, montované a mobilné domy na Slovensku",
          "description": "Predaj a výstavba modulárnych, montovaných a mobilných domov. Prosto House, Ticab house, JAK Modules. Ceny od výrobcu, A0 energetická trieda, celoročné bývanie.",
          "isPartOf": { "@id": "https://americanliving.sk/#website" },
          "about": { "@id": "https://americanliving.sk/#organization" },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Domov", "item": "https://americanliving.sk" }]
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
                <h4 className="font-bold text-white">{t('adminAccess')}</h4>
              </div>
              <p className="text-xs text-white/90 mb-3">
                {t('adminLoginPrompt')}
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full bg-white text-indigo-700 hover:bg-gray-100 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('adminLogin')}
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



      {/* Hero Section - Warm architectural with interior video background */}
      <section className="hero-section relative pt-36 sm:pt-44 lg:pt-56 pb-12 sm:pb-16 overflow-hidden">
        {/* Scrim pre čitateľnosť nad fixným videom */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(15,12,9,0.30) 0%, rgba(15,12,9,0.18) 45%, rgba(15,12,9,0.42) 100%)' }} />
        <div className="container mx-auto px-4 relative z-10">

          {/* Centered intro */}
          <div className="max-w-4xl mx-auto text-center p-6 sm:p-8 rounded-3xl backdrop-blur-sm bg-black/25 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={LOGO_URL}
                alt="American Living"
                className="h-10 w-auto rounded-full"
                width={40}
                height={40}
                loading="eager"
              />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E0D8CA] bg-white text-xs font-semibold text-[#2C3A33] shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#9E2A2B]"></span>
                <span>{t('heroBadgeText')}</span>
              </motion.div>
            </div>

            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="visible"
              className="font-['Fraunces'] text-4xl sm:text-6xl lg:text-7xl font-semibold text-[#F7F2E9] mb-5 leading-[1.05] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            >
              {(t('heroTitleFirst')?.split(" ") || []).map((word, idx) => (
                <motion.span key={`first-${idx}`} variants={headlineWord} className="inline-block mr-2.5">
                  {word}
                </motion.span>
              ))}
              {" "}
              <span className="text-[#E2C799]">
                {(t('heroTitleSecond')?.split(" ") || []).map((word, idx) => (
                  <motion.span key={`second-${idx}`} variants={headlineWord} className="inline-block mr-2.5">
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-sm sm:text-lg text-[#F0EAE0]/90 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
            >
              {t('heroDescription')}
            </motion.p>
          </div>

          {/* Photo + floating configurator card */}
          <div className="relative mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end max-w-6xl mx-auto">
            <div className="lg:col-span-7">
              <div className="aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden border border-[#E0D8CA] shadow-[0_22px_50px_rgba(44,58,51,0.12)] bg-white">
                <AnimatePresence>
                  <motion.img
                    key={`${selectedHouseId}-${selectedFacade}`}
                    src={selectedFacadeImage}
                    alt={currentHouseData.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="bg-white border border-[#E0D8CA] rounded-3xl p-5 sm:p-6 shadow-[0_18px_40px_rgba(44,58,51,0.10)]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A2B] font-bold mb-3">{t('clickToSeeMostLucrativeModels')}</p>
                <div className="flex overflow-x-auto gap-2 pb-1 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {switcherHouses.map((house) => (
                    <button
                      key={house.id}
                      type="button"
                      onClick={() => {
                        setSelectedHouseId(house.id);
                        setSelectedFacade("anthracite");
                      }}
                      className={`snap-start flex-shrink-0 px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
                        selectedHouseId === house.id
                          ? 'border-[#2C3A33] bg-[#2C3A33] text-white'
                          : 'border-[#E0D8CA] text-[#2C3A33] hover:border-[#C5A880] bg-white'
                      }`}
                    >
                      {house.name}
                    </button>
                  ))}
                </div>

                {hasMultipleFacades && (
                  <div className="mt-4">
                    <p className="text-[11px] text-[#8B948E] font-semibold mb-2">{t('facade') || 'Fasáda'}</p>
                    <div className="flex flex-wrap gap-2">
                      {facadeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedFacade(opt.id)}
                          className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                            selectedFacade === opt.id
                              ? 'border-[#C5A880] bg-[#C5A880]/25 text-[#2C3A33]'
                              : 'border-[#E0D8CA] text-[#2C3A33] hover:border-[#C5A880] bg-white'
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-[#E8E1D5]">
                  <p className="text-[10px] uppercase tracking-widest text-[#8B948E] mb-1">{t('from')}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-['Sora'] text-2xl sm:text-3xl font-bold text-[#2C3A33] leading-none">{currentHouseData.price.toLocaleString('sk-SK')} €</p>
                    {getManufacturerBadge(currentHouseData.manufacturer)}
                  </div>
                  <p className="text-xs text-[#6B7A72] mt-2">
                    {currentHouseData.name} • {currentHouseData.rooms} {t('roomsLabel')} • {currentHouseData.area} m²
                  </p>
                  <p className="text-xs text-[#6B7A72]">
                    {currentHouseData.manufacturer?.toLowerCase().includes("ticab") ? `${t('factoryProduction')}: ${t('sixWeeks')}` : `${t('turnkeyDelivery')}: ${t('upToTwelveWeeks')}`}
                  </p>
                  <Link to={`${createPageUrl("DetailDomu")}?id=${currentHouseData.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#9E2A2B] hover:text-[#802021] mt-2 transition-colors">
                    <span>{t('configure')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
                  <Link to={createPageUrl("Katalog")} className="flex-1">
                    <Button size="lg" className="w-full bg-[#9E2A2B] hover:bg-[#802021] text-white font-bold text-xs px-4 py-5 rounded-xl flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>{t('viewCatalogButton')}</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Showroom")} className="flex-1">
                    <Button size="lg" className="w-full bg-white hover:bg-[#F5F1E9] text-[#2C3A33] border border-[#E0D8CA] font-bold text-xs px-4 py-5 rounded-xl flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-[#9E2A2B]" />
                      <span>{t('showroom')}</span>
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                    className="flex-1 bg-white hover:bg-[#F5F1E9] text-[#2C3A33] border border-[#E0D8CA] font-bold text-xs px-4 py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#9E2A2B]" />
                    <span>{t('consultationWithKexo')}</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust Grid: Tri hlavné záruky a predajné argumenty */}
      <section className="py-14 sm:py-20 relative bg-[#F7F4EE] border-t border-[#E0D8CA]">
        <div className="container mx-auto px-4 space-y-14 sm:space-y-20">

          {/* Sekcia 2: Súkromná Dotácia AMERICANA */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-[#C5A880]/30 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-xs font-black uppercase tracking-wider text-[#E2C799] mb-3">
                    <Gift className="w-4 h-4 text-[#E2C799]" />
                    <span>Súkromná Dotácia AMERICANA</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Získajte dotáciu až do <span className="text-[#E2C799]">15 000 €</span> na váš nový dom
                  </h2>
                </div>
                <Link to={createPageUrl("DotaciaAmericana")} className="shrink-0">
                  <Button className="rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-6 py-3 text-sm sm:text-base shadow-lg hover:shadow-red-600/40 transition-all flex items-center gap-2">
                    <span>Zistiť nárok na dotáciu</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
                {t('trustGrantDesc') || "Poskytujeme unikátnu súkromnú dotáciu a finančný príspevok na energetickú certifikáciu A0, prípravu inžinierskych sietí a prevádzku domu. Bez zbytočnej štátnej byrokracie a s priamym odpočtom z ponuky."}
              </p>

              {/* 3 Prehľadné Výhodové Karty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-[#C5A880]/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#E2C799] font-black text-lg mb-3">
                    ⚡
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Príspevok na certifikát A0</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Finančná podpora na kompletný energetický certifikát v najvyššej triede A0 pre nulové účty.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-[#C5A880]/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#E2C799] font-black text-lg mb-3">
                    🏗️
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Príspevok na prípojky a základ</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Odľahčenie počiatočných nákladov pri realizácii inžinierskych sietí a terénnych úprav.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-[#C5A880]/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#E2C799] font-black text-lg mb-3">
                    📋
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Priamy odpočet z rozpočtu</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Žiadne čakacie lehoty úradov. Dotácia sa započítava priamo do vašej výslednej cenovej ponuky.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sekcia 3: 100% Financovanie stavby */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-black uppercase tracking-wider text-emerald-300 mb-3">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>100% FINANCOVANIE STAVBY</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Postavte svoj dom <span className="text-emerald-400">bez vlastných úspor</span>
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openChatbotWithContext', {
                        detail: { message: "Chcem zistiť viac o modeli 100% financovania bez našetrených úspor." }
                      }));
                    }}
                    className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 text-sm sm:text-base shadow-lg hover:shadow-emerald-600/40 transition-all flex items-center gap-2"
                  >
                    <span>Konzultácia k financovaniu</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <Link to={createPageUrl("Kalkulacka")}>
                    <Button variant="outline" className="rounded-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold px-5 py-3 text-sm">
                      Kalkulačka splátok
                    </Button>
                  </Link>
                </div>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
                {t('trustFinanceDesc') || "Nemáte počiatočnú hotovosť? V American Living financujeme výstavbu aj bez úspor. Náš špecialista pre vás zmluvne vybaví hypotéku na kľúč vo všetkých významných bankách."}
              </p>

              {/* 3 Prehľadné Výhodové Karty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-lg mb-3">
                    🪙
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">0 € Počiatočná hotovosť</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Nemusíte čakať roky na našetrenie vlastných úspor. Profinancujeme celú stavbu od základu.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-lg mb-3">
                    📑
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Hypotéka na kľúč</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Náš hypotekárny špecialista porovná banky a vybaví pre vás najnižšiu úrokovú sadzbu.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-lg mb-3">
                    🔒
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Pevná garancia ceny</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Zmluvne zakotvená konečná rozpočtová suma bez akýchkoľvek skrytých poplatkov a zdražení.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sekcia 4: Rýchle odovzdanie domu do 3 mesiacov */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden text-white mt-12">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-black uppercase tracking-wider text-amber-300 mb-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>GARANCIA RYCHLEJ VÝSTAVBY</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Bývajte vo vlastnom domu <span className="text-amber-400">do 3 mesiacov</span>
                  </h2>
                </div>
                <Link to={createPageUrl("AkoToFunguje")} className="shrink-0">
                  <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold px-6 py-3 text-sm sm:text-base shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2">
                    <span>Ako to funguje krok za krokom</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
                Žiadne stavenisko natiahnuté na roky ani nekonečné meškanie. Vďaka precíznej továrenskej výrobe v suchom prostredí dodávame a montujeme modulárne rodinné domy do 90 dní od zmluvy.
              </p>

              {/* 3-Kroková Časová Os (Timeline Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-amber-500/50 transition-colors relative">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">01. TÝŽDEŇ 1 - 8</div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg mb-3">
                    🏭
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Továrenská výroba</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Výroba modulov a stien v hale s milimetrovou presnosťou a certifikáciou A0 bez vplyvu počasia.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-amber-500/50 transition-colors relative">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">02. TÝŽDEŇ 9 - 10</div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg mb-3">
                    🚛
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Transport & Inžinierske siete</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Príprava pozemku, osadenie zemných vrutov / platne a dovoz modulov priamo na váš pozemok.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-amber-500/50 transition-colors relative">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">03. TÝŽDEŇ 11 - 12</div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg mb-3">
                    🔑
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Montáž & Odovzdanie kľúčov</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Montáž hotová do 48 hodín. Dokončenie interiéru a odovzdanie kľúčov k nasťahovaniu do 3 mesiacov.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* AI Consultation Section - Kexo */}
      <section className="py-12 sm:py-16 bg-[#F7F4EE] relative overflow-hidden border-t border-[#E0D8CA]">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#C5A880]/10 dark:bg-[#9E2A2B]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-[#0D0D11]/90 dark:to-[#16161D]/80 backdrop-blur-xl border border-[#C5A880]/30 dark:border-[#C5A880]/20 rounded-3xl p-6 sm:p-12 shadow-[0_15px_40px_rgba(197,168,128,0.06)] dark:shadow-[0_0_50px_rgba(197,168,128,0.08)] flex flex-col lg:flex-row items-center gap-8 sm:gap-12 transition-colors duration-300">
              
                <div className="flex-1 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/15 dark:bg-[#9E2A2B]/10 border border-[#C5A880]/30 dark:border-[#9E2A2B]/35 text-slate-800 dark:text-[#C5A880] text-xs sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{t('kexoAiAssistantBadge')}</span>
                  </div>
                 <h2 className="text-2xl sm:text-4xl font-bold text-[#2C3A33] mb-4 sm:mb-6 leading-tight tracking-tight">
                   <span className="text-[#9E2A2B]">
                     {t('consultWithKexoTitle')}
                   </span>
                   {" "}{t('consultWithKexoSub')}
                 </h2>
                 <p className="text-sm sm:text-base text-[#6B7A72] leading-relaxed font-light mb-6 sm:mb-8">
                   {t('kexoDescription')}
                 </p>
                 <div className="flex flex-wrap gap-4">
                   <button 
                     onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                     className="bg-gradient-to-r from-[#9E2A2B] to-[#b13536] hover:from-[#b13536] hover:to-[#9E2A2B] text-white font-bold px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(158,42,43,0.35)] hover:shadow-[0_0_30px_rgba(158,42,43,0.5)] border border-[#C5A880]/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group"
                   >
                     <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                     <span>{t('startChatWithKexo')}</span>
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </div>

               {/* Right column: Interactive mock chat panel */}
               <div className="w-full lg:w-96 shrink-0">
                 <div className="bg-white/95 dark:bg-[#08080A]/90 border border-slate-200 dark:border-[#C5A880]/15 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-305">
                   {/* Top Chat Header */}
                   <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#C5A880]/10 pb-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#16161D] border border-slate-200 dark:border-[#C5A880]/30 flex items-center justify-center">
                       <Sparkles className="w-4.5 h-4.5 text-[#C5A880]" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Kexo</p>
                       <p className="text-[10px] text-green-500 dark:text-green-400 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                         {t('activeNow')}
                       </p>
                     </div>
                   </div>

                   {/* Chat Message Stream (Mock) */}
                   <div className="space-y-4 mb-4 min-h-[140px] flex flex-col justify-end">
                     <div className="flex items-start gap-2.5">
                       <div className="bg-slate-100 dark:bg-[#16161D]/80 border border-slate-200 dark:border-[#C5A880]/10 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-[#6B7A72] max-w-[90%]">
                         {t('kexoIntroMessage')}
                       </div>
                     </div>
                   </div>

                   {/* Input Box (Mock) */}
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder={t('askMeAnything')}
                       className="flex-1 bg-slate-50 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                       readOnly
                       onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                     />
                     <button 
                       onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                       className="bg-[#C5A880] text-slate-950 p-3 rounded-xl hover:bg-[#C5A880]/90 transition-colors"
                     >
                       <Send className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>

            </div>
          </div>
        </div>
      </section>

      {/* Kapitola 05: Showroom */}
      <ShowroomChapter />

      {/* Populárne domy Carousel */}
      {domy && domy.length > 0 && (
        <section className="py-12 sm:py-20 bg-[#EFE9DF] relative border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
          <div className="container mx-auto px-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E2A2B] font-bold mb-2">Modely</p>
                <h2 className="font-['Sora'] text-2xl sm:text-4xl font-bold text-[#2C3A33] mb-2">{t('popularHouses')}</h2>
                <p className="text-[#6B7A72]">{t('popularHousesDesc')}</p>
              </div>
              <Link to={createPageUrl("Katalog")} className="hidden sm:flex items-center gap-2 text-primary hover:text-red-655 dark:hover:text-red-400 font-semibold transition-colors">
                {t('showAllHouses')} <ArrowRight className="w-5 h-5" />
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
                    <Card className="bg-white border-[#E0D8CA] overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-md dark:shadow-xl hover:shadow-[#C5A880]/15 dark:hover:shadow-red-950/20">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={optimizeImageUrl(dom.hlavny_obrazok || dom.obrazky?.[0], 600)} 
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
                              <span className="text-xs font-semibold bg-slate-955/60 backdrop-blur-md text-slate-200 px-2 py-1 rounded-md border border-white/10">
                                {dom.zastavana_plocha} m²
                              </span>
                            )}
                            {dom.pocet_izieb && (
                              <span className="text-xs font-semibold bg-slate-955/60 backdrop-blur-md text-slate-200 px-2 py-1 rounded-md border border-white/10">
                                {dom.pocet_izieb} {t('roomsLabel') || 'izby'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xs text-slate-500 dark:text-[#6B7A72] transition-colors duration-300">{t('priceFrom')}</div>
                          <div className="text-xl font-black text-[#2C3A33] transition-colors duration-300">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</div>
                        </div>
                        <Button variant="outline" className="w-full border-white/10 hover:bg-slate-50 dark:hover:bg-white hover:text-slate-900 dark:hover:text-slate-950 bg-white/70 dark:bg-transparent text-slate-800 dark:text-white transition-all">
                          {t('houseDetail')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="container mx-auto px-4 mt-4 sm:hidden">
            <Link to={createPageUrl("Katalog")} className="flex items-center justify-center gap-2 text-primary hover:text-red-655 font-semibold transition-colors w-full bg-white dark:bg-slate-900/50 py-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
              {t('showAllHouses')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Premium Showcase Gallery Section */}
      <section className="py-16 sm:py-24 bg-white relative border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ChapterHeading kicker="Galéria" title={t('gallerySectionTitle')} subtitle={t('galleryDesc')} />

          {/* House Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { id: "6916ec94c11aacdd15248f07", name: "LONDON 144", desc: t('tabLondonDesc') || "Prémiová rodinná vila", price: `${t('from')} 168 510 €` },
              { id: "6916ec94c11aacdd15248f18", name: "FLAT DOUBLE 142", desc: t('tabFlatDoubleDesc') || "Dizajnový modulárny dom", price: `${t('from')} 61 700 €` },
              { id: "6916ec94c11aacdd15248f0b", name: "ALESSANDRIA 130", desc: t('tabAlessandriaDesc') || "Minimalistický plochostrechý dom", price: `${t('from')} 110 454 €` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveShowcaseHouseId(tab.id)}
                className={`px-6 py-4 rounded-2xl border text-left transition-all ${
                  activeShowcaseHouseId === tab.id
                    ? 'bg-slate-105 dark:bg-slate-900 border-[#C5A880] text-slate-950 dark:text-white shadow-md shadow-[#C5A880]/10 ring-1 ring-[#C5A880]'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-white/5 text-slate-500 dark:text-[#6B7A72] hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">{tab.desc}</p>
                <h4 className="text-lg font-black mt-1">{tab.name}</h4>
                <p className="text-xs text-[#C5A880] font-semibold mt-0.5">{tab.price}</p>
              </button>
            ))}
          </div>

          {/* Tab Selector: Exterior vs Interior */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 flex gap-1 transition-colors duration-300">
              <button
                type="button"
                onClick={() => setActiveShowcaseTab("exterier")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeShowcaseTab === "exterier"
                    ? 'bg-[#C5A880] text-slate-950 shadow-md'
                    : 'text-[#6B7A72] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('exterier')}
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcaseTab("interier")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeShowcaseTab === "interier"
                    ? 'bg-[#C5A880] text-slate-950 shadow-md'
                    : 'text-[#6B7A72] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('interier')}
              </button>
            </div>
          </div>

          {/* Gallery Image Grid */}
          {showcaseImages.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {/* Special Before/After interactive slider for London 144 (exterior only) */}
              {activeShowcaseHouseId === "6916ec94c11aacdd15248f07" && activeShowcaseTab === "exterier" && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="aspect-[4/3] sm:aspect-auto sm:col-span-2 sm:row-span-2 rounded-2xl overflow-hidden relative shadow-lg"
                >
                  <ImageComparisonSlider 
                    beforeImage={visualizationImg} 
                    afterImage={realizationImg} 
                    language={language}
                  />
                  <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    {getManufacturerBadge("Ticab house")}
                  </div>
                </motion.div>
              )}

              {displayImages.map((img, index) => (
                <motion.div
                  key={img}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setLightboxImage(img)}
                  className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 cursor-pointer group shadow-md dark:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    {getManufacturerBadge(activeShowcaseHouseManufacturer)}
                  </div>
                  <img
                    src={optimizeImageUrl(img, 600)}
                    alt={t('photoDetail')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-100 dark:bg-slate-900/20 rounded-2xl border border-slate-200 dark:border-white/5 transition-colors duration-300">
              {t('loadingPhotos')}
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-[999] bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 text-white hover:text-[#6B7A72] bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/15 transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={optimizeImageUrl(lightboxImage, 1200)}
              alt={t('photoDetail')}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/15 cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </section>

      {/* Trusted Partners Section - Overení partneri */}
      <section className="py-12 sm:py-24 bg-[#EFE9DF] relative overflow-hidden border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
            <ChapterHeading kicker="Partneri" title={t('trustedPartnersTitle')} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {/* Prosto House */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white border border-[#E0D8CA] rounded-3xl p-6 sm:p-10 shadow-md dark:shadow-2xl hover:shadow-[#C5A880]/10 dark:hover:bg-slate-800/50 transition-all duration-300"
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
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-5 text-[#2C3A33] transition-colors duration-300">
                {t('prostoTitle')}
              </h3>
              <p className="text-[#6B7A72] leading-relaxed text-sm sm:text-lg font-light transition-colors duration-300">
                {t('prostoBody')}
              </p>
            </motion.div>

            {/* TicabHouse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white border border-[#E0D8CA] rounded-3xl p-6 sm:p-10 shadow-md dark:shadow-2xl hover:shadow-[#C5A880]/10 dark:hover:bg-slate-800/50 transition-all duration-300"
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
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-5 text-[#2C3A33] transition-colors duration-300">
                {t('ticabTitle')}
              </h3>
              <p className="text-[#6B7A72] leading-relaxed text-sm sm:text-lg font-light transition-colors duration-300">
                {t('ticabBody')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SÚKROMNÝ GRANT AMERICANA - Premium Redesign */}
      <section className="py-16 sm:py-28 bg-[#EFE9DF] relative overflow-hidden border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#C5A880]/10 dark:bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A880]/5 dark:bg-red-900/10 rounded-full blur-[150px] pointer-events-none"></div>

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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5A880]/15 dark:bg-red-500/10 border border-[#C5A880]/30 dark:border-red-500/20 text-slate-800 dark:text-red-400 text-sm font-bold mb-6">
                  <Gift className="w-4 h-4" /> VIP Benefit Program
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2C3A33] mb-6 leading-tight transition-colors duration-300">
                  {t('moreThanJustAHouse')}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600">
                    {t('financialInjection')}
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-[#6B7A72] font-normal mb-8 leading-relaxed max-w-xl bg-white border border-[#E0D8CA] px-6 py-4 sm:py-5 rounded-2xl shadow-md backdrop-blur-md transition-colors duration-300">
                  {t('grantDescriptionPart1')} <strong className="text-slate-955 dark:text-white font-bold">{t('grantDescriptionPart2')}</strong>{t('grantDescriptionPart3')}
                </p>
                
                <Link to={createPageUrl("DotaciaAmericana")} className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold px-8 py-7 text-lg shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] border border-red-400/50 transition-all group rounded-2xl">
                    <span className="flex items-center justify-center gap-3">
                      {t('verifyGrantEligibility')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                
                <div className="mt-8">
                  <div className="inline-flex items-center gap-3 text-xs sm:text-sm bg-white border border-[#E0D8CA] px-4 py-2.5 rounded-xl shadow-sm text-slate-700 dark:text-[#6B7A72] backdrop-blur-md transition-colors duration-300">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A880]" />
                    <span>{t('guaranteedFinancing')}</span>
                  </div>
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
                  className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-md dark:shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/50">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2C3A33] mb-4 transition-colors duration-300">{t('forFamilies')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('grantAtSigning')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('energyFullyRefunded')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('supportAfterHandover')}</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Karta Pre Investorov */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-md dark:shadow-2xl relative overflow-hidden lg:mt-12 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-900/50">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2C3A33] mb-4 transition-colors duration-300">{t('forInvestors')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('grantAtSigning')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('marketingFree')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-[#6B7A72] text-sm leading-relaxed transition-colors duration-300">{t('passiveIncomeFromAirbnb')}</span>
                    </li>
                  </ul>
                </motion.div>

              </div>
              <div className="mt-6 text-center lg:text-right">
                <p className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-605 dark:text-slate-500 italic transition-colors duration-300">
                  💡 {t('grantAmountVaries')}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      <style>{`
        .warm h2, .warm h3 {
          font-family: 'Sora', system-ui, sans-serif;
        }
        body {
          overflow-x: clip;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* 100% Financovanie Bez Úspor Banner */}
      <section className="py-12 sm:py-20 bg-[#F7F4EE] relative overflow-hidden border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#C5A880]/10 dark:bg-red-950/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[#E0D8CA] rounded-3xl p-8 sm:p-12 shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-300">
              <div className="absolute top-0 left-0 w-3 h-full bg-[#C5A880]"></div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-4xl font-black text-[#2C3A33] mb-4 leading-tight transition-colors duration-300">
                  Chcete si postaviť nový dom a nemáte na to kapitál?
                </h2>
                <p className="text-[#6B7A72] text-sm sm:text-lg font-light leading-relaxed max-w-2xl transition-colors duration-300">
                  Žiadny problém! Máme model financovania pre tých, ktorí nemajú našetrené. Pomôžeme vám vyriešiť financovanie celej výstavby od A po Z.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => {
                    const event = new CustomEvent('openChatbotWithContext', {
                      detail: { message: "Mám záujem o model financovania bez našetreného kapitálu. Ako to funguje?" }
                    });
                    window.dispatchEvent(event);
                  }}
                  size="lg"
                  className="bg-[#C5A880] hover:bg-[#b0926a] text-slate-950 hover:text-slate-900 font-black px-8 py-6 rounded-2xl shadow-md dark:shadow-xl flex items-center gap-2 active:scale-95 transition-all text-base border border-[#C5A880]/40"
                >
                  <MessageCircle className="w-5 h-5 text-slate-950" />
                  <span>Opýtať sa Kexa na financovanie</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fixácia úrokov - Nová sekcia */}
      <section className="py-12 sm:py-20 bg-[#EFE9DF] border-t border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/10 dark:from-orange-600/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-2 sm:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white dark:bg-gradient-to-br dark:from-red-600 dark:via-orange-600 dark:to-red-700 border-[3px] sm:border-[6px] border-[#C5A880] dark:border-orange-400 p-6 sm:p-12 shadow-lg dark:shadow-[0_20px_60px_rgba(249,115,22,0.4)] hover:shadow-[#C5A880]/20 dark:hover:shadow-[0_25px_70px_rgba(249,115,22,0.5)] transition-all rounded-3xl">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 sm:w-36 sm:h-36 bg-[#9E2A2B]/10 dark:bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border-[3px] sm:border-[6px] border-[#9E2A2B] dark:border-white/50 shadow-md dark:shadow-2xl">
                    <Euro className="w-10 h-10 sm:w-20 sm:h-20 text-[#9E2A2B] dark:text-white drop-shadow-md" />
                  </div>
                </motion.div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl sm:text-5xl font-black text-[#2C3A33] mb-3 sm:mb-5 leading-tight transition-colors duration-300">
                    {t('mortgageFixationTitle')}
                  </h2>
                  <p className="text-sm sm:text-2xl text-slate-700 dark:text-white/98 leading-relaxed font-semibold mb-4 sm:mb-8 transition-colors duration-300">
                    {t('mortgageFixationDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-start">
                    <Link to={createPageUrl("Kontakt")}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="bg-[#9E2A2B] text-white hover:bg-[#802021] dark:bg-white dark:text-red-700 dark:hover:bg-yellow-100 font-black px-6 py-4 sm:px-10 sm:py-7 text-sm sm:text-xl shadow-md dark:shadow-2xl w-full sm:w-auto border border-[#9E2A2B]/40 dark:border-none transition-all">
                          {t('contactUs')}
                          <ArrowRight className="ml-1 w-4 h-4 sm:ml-2 sm:w-6 sm:h-6" />
                        </Button>
                      </motion.div>
                    </Link>
                    <a href="tel:+421905138124">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="bg-white text-slate-800 border-2 border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:backdrop-blur-sm dark:border-2 dark:sm:border-[4px] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-red-700 font-black px-6 py-4 sm:px-10 sm:py-7 text-sm sm:text-xl shadow-md dark:shadow-2xl w-full sm:w-auto transition-all">
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
      <section className="py-12 sm:py-24 bg-[#F7F4EE] border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
            <ChapterHeading kicker="Služby" title={t('allInOnePlace')} subtitle={t('comprehensiveServicesDesc')} />
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-semibold">
              <div className="flex items-center gap-1 bg-white dark:bg-white/5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-slate-700 dark:text-[#6B7A72] border border-white/10 shadow-sm transition-colors duration-300">
                <Building className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary" />
                <span>{t('constructionCompany')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-white/5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-slate-700 dark:text-[#6B7A72] border border-white/10 shadow-sm transition-colors duration-300">
                <Building2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary" />
                <span>{t('realEstateAgency')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-white/5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-slate-700 dark:text-[#6B7A72] border border-white/10 shadow-sm transition-colors duration-300">
                <Landmark className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-primary" />
                <span>{t('financialServices')}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-4 sm:mb-10"
          >
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
                  variants={staggerItem}
                  onClick={() => {
                    setSelectedService(sluzba);
                    setServiceModalOpen(true);
                  }}
                  className={`h-full ${getBentoClasses(index)}`}
                >
                  <Card className="group overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-[#C5A880]/15 dark:hover:shadow-red-950/20 transition-all duration-300 cursor-pointer bg-white border-[#E0D8CA] shadow-md hover:-translate-y-2">
                    <div className="relative flex-1 min-h-[200px] overflow-hidden">
                      <img 
                        src={optimizeImageUrl(sluzba.image, 800)}
                        alt={sluzba.nazov}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-colors duration-500" />
                      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/95 dark:bg-slate-950/95 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                          <sluzba.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-md">{sluzba.nazov}</h3>
                        <p className="text-slate-200 text-sm sm:text-base font-light line-clamp-2">{sluzba.popis}</p>
                      </div>
                      {/* Click indicator */}
                      <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-white/15 rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <span className="text-xs font-bold text-primary">{t('clickForMore')} →</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="text-center">
            <p className="text-sm sm:text-xl text-slate-650 dark:text-[#6B7A72] mb-4 sm:mb-6 transition-colors duration-300">
              <strong className="text-[#2C3A33] font-bold">{t('youDontHaveToArrange')}</strong> {t('weHandleEverything')}
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold px-6 sm:px-10 py-6 text-sm sm:text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all rounded-2xl border border-red-500/30">
                {t('startProject')}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-12 sm:py-24 bg-[#EFE9DF] border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-2 sm:px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-10"
          >
            <ChapterHeading kicker="Prečo my" title={t('whyAmericanLiving')} subtitle={t('qualityBrand')} />
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
                <Card className="p-8 text-center h-full hover:shadow-2xl hover:border-[#C5A880]/30 transition-all duration-300 bg-white border-[#E0D8CA] shadow-md dark:shadow-xl group">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-[#EFE9DF] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm dark:shadow-lg transition-colors duration-300"
                  >
                    <vyhoda.icon className="w-8 h-8 text-[#C5A880] dark:text-[#E2C799]" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-3 text-[#2C3A33] transition-colors duration-300">{vyhoda.title}</h3>
                  <p className="text-sm text-[#6B7A72] leading-relaxed font-light transition-colors duration-300">{vyhoda.description}</p>
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
            <Card className="bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-50/90 dark:from-amber-950/15 dark:via-orange-950/10 dark:to-amber-950/15 border-2 border-amber-400 dark:border-amber-500/30 p-4 sm:p-8 shadow-xl dark:shadow-[0_15px_40px_rgba(245,158,11,0.05)] transition-all duration-300">
              <div className="flex gap-2 sm:gap-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-amber-100 mb-2 sm:mb-4 transition-colors duration-300">
                    {t('misleadingAdsWarning')}
                  </h3>
                  <p className="text-xs sm:text-base text-slate-800 dark:text-[#6B7A72] mb-2 sm:mb-3 leading-relaxed font-medium transition-colors duration-300">
                    {t('misleadingAdsDesc1')}
                  </p>
                  <p className="text-xs sm:text-base text-slate-800 dark:text-[#6B7A72] mb-2 sm:mb-3 leading-relaxed font-medium transition-colors duration-300">
                    {t('misleadingAdsDesc2')}
                  </p>
                  <p className="text-sm sm:text-lg text-[#2C3A33] font-bold transition-colors duration-300">
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
        <section className="py-12 sm:py-24 bg-[#F7F4EE] border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
          <div className="container mx-auto px-2 sm:px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 sm:mb-10"
            >
              <ChapterHeading kicker="Naša ponuka" title={t('ourOffer')} subtitle={t('woodHouseNotLookWood')} />
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
                    <Card className="group overflow-hidden hover:shadow-2xl hover:border-[#C5A880]/30 hover:-translate-y-2 transition-all duration-300 bg-white border-[#E0D8CA] shadow-md dark:shadow-xl h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={optimizeImageUrl(dom.hlavny_obrazok, 300)}
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
                      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="mb-2">
                            {getManufacturerBadge(dom.vyrobca)}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#2C3A33] mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {dom.nazov}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-100 dark:border-white/5">
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
                                <p className="text-[7px] sm:text-[9px] text-green-700 dark:text-green-400 font-semibold leading-tight mt-0.5">
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
                  <Button size="lg" className="relative bg-white/[0.04] backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-850 text-[#2C3A33] font-black text-sm sm:text-xl px-6 sm:px-16 py-4 sm:py-8 shadow-md dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10 transition-all duration-300 group rounded-2xl">
                    <Home className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform text-[#C5A880]" />
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
      <section className="py-6 sm:py-16 bg-[#EFE9DF] border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-sm sm:text-2xl font-bold text-[#2C3A33] transition-colors duration-300">{t('implementationProcess')}</h2>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-7xl mx-auto flex flex-wrap justify-center gap-1 sm:gap-2"
          >
            {proces.map((krok, index) => (
              <motion.div 
                key={index} 
                variants={staggerItem}
                className="flex items-center gap-0.5 sm:gap-1 bg-white border border-[#E0D8CA] rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 shadow-sm transition-colors duration-300"
              >
                <span className="text-[7px] sm:text-xs font-bold text-primary dark:text-[#C5A880]">{krok.cislo}</span>
                <krok.icon className="w-2.5 h-2.5 sm:w-4.5 sm:h-4.5 text-primary dark:text-[#C5A880]" />
                <span className="text-[7px] sm:text-xs font-medium text-slate-700 dark:text-slate-350">{krok.nazov}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <ServiceDetailModal 
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        service={selectedService}
      />

      {/* CTA Section */}
      <section className="py-12 sm:py-24 bg-background dark:bg-slate-950 border-t border-white/10 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#C5A880]/10 dark:bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C5A880]/5 dark:bg-[#C5A880]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-lg sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-[#2C3A33] transition-colors duration-300">
              {t('readyForOwnHouse')}
            </h2>
            <div className="mt-2 mb-6 sm:mb-10">
              <p className="inline-block text-sm sm:text-lg text-[#6B7A72] bg-white border border-[#E0D8CA] px-6 py-3.5 rounded-2xl shadow-sm backdrop-blur-md transition-colors duration-300">
                {t('contactUsAndFind')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to={createPageUrl("Katalog")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-850 hover:from-red-500 hover:to-red-750 text-white font-black text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 shadow-lg hover:shadow-red-600/30 transition-all rounded-2xl flex items-center justify-center gap-2">
                    <Home className="mr-1 w-4 h-4 sm:mr-2 sm:w-6 sm:h-6 text-[#E2C799]" />
                    {t('houseCatalogButton')}
                    <ArrowRight className="ml-1 w-4 h-4 sm:ml-2 sm:w-6 sm:h-6" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl("Kontakt")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/70 dark:bg-white/5 hover:bg-[#C5A880]/10 dark:hover:bg-[#C5A880]/15 hover:border-[#C5A880]/50 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 shadow-sm transition-all duration-300 rounded-2xl flex items-center justify-center gap-2">
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
    </div>
  );
}