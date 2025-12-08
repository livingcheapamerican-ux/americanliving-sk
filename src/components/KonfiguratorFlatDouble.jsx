import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Send, AlertTriangle, Check, Calculator, RotateCcw,
  Wrench, Plug, Droplets, ThermometerSun, Wind, Landmark, FileText,
  Zap, ShowerHead, Flame, Cable, Paintbrush, Home, Truck, Sun, DoorOpen,
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle, TreePine, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useFlyingAnimation, FlyingAnimationContainer } from "./FlyingAnimation";
import KonfiguratorContactModal from "./KonfiguratorContactModal";
import { useLanguage } from "./LanguageContext";
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";
import KonfiguratorFaza0Sluzby from "./KonfiguratorFaza0Sluzby";

// Dlaždica s tooltip a veľkou fajkou
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-blue-100", selectedBorder = "border-blue-500", selectedRing = "ring-blue-300", hoverBorder = "hover:border-blue-300" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tileRef = useRef(null);

  const updateTooltipPosition = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipHeight = 80; // approximate
      
      // Position tooltip closer to center of screen
      let top, left;
      
      // Vertical: prefer center, but stay near tile
      const centerY = viewportHeight / 2;
      if (rect.bottom < centerY) {
        top = rect.bottom + 10;
      } else {
        top = Math.max(rect.top - tooltipHeight - 10, 60);
      }
      
      // Horizontal: center of viewport
      left = viewportWidth / 2;
      
      setTooltipPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      updateTooltipPosition();
      setShowTooltip(true);
      // Auto-hide after 3 seconds on mobile
      setTimeout(() => setShowTooltip(false), 3000);
    }, 2000);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  // Update position on scroll
  React.useEffect(() => {
    if (showTooltip) {
      const handleScroll = () => updateTooltipPosition();
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [showTooltip]);

  return (
    <motion.div
      ref={tileRef}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-2 sm:p-4 rounded-lg sm:rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
        selected 
          ? `${selectedBg} border-2 ${selectedBorder} shadow-xl ring-2 ${selectedRing}` 
          : isA0 
            ? "bg-green-50 border-2 border-green-300 hover:border-green-400 hover:shadow-md"
            : `bg-white border-2 border-gray-200 ${hoverBorder} hover:shadow-md`
      }`}
    >
      {isA0 && (
        <Badge className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-gradient-to-r from-green-500 to-emerald-600 text-[6px] sm:text-[8px] px-1 sm:px-1.5 z-10">
          <Sparkles className="w-1.5 h-1.5 sm:w-2 sm:h-2 mr-0.5" />A0
        </Badge>
      )}
      
      {/* Malá fajka v rohu */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 pointer-events-none"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Icon className={`w-5 h-5 sm:w-10 sm:h-10 mb-1 sm:mb-2 ${selected ? iconSelectedColor : iconColor}`} />
      <span className={`font-semibold text-gray-800 text-[10px] sm:text-sm leading-tight`}>{title}</span>
      <span className={`text-[8px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-tight`}>{subtitle}</span>
      <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-[9px] sm:text-xs mt-1 sm:mt-2`}>{price}</span>

      {/* Tooltip - rendered via portal */}
      {showTooltip && tooltip && ReactDOM.createPortal(
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="fixed z-[9999] max-w-[85vw] w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: Math.min(Math.max(tooltipPosition.left, 135), window.innerWidth - 135),
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
          {tooltip}
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
};

export default function KonfiguratorFlatDouble({ 
  dom,
  onReset,
  predajNehnutelnosti, setPredajNehnutelnosti,
  hladaniePozemku, setHladaniePozemku,
  financneSluzby, setFinancneSluzby,
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  vstupneDvere, setVstupneDvere,
  elektroinstalacia, setElektroinstalacia,
  vodaKanalizacia, setVodaKanalizacia,
  sanitaKomplet, setSanitaKomplet,
  bojler, setBojler,
  tepelneCerpadlo, setTepelneCerpadlo,
  rekuperacia, setRekuperacia,
  pripojkaSiete, setPripojkaSiete,
  stresneOkno, setStresneOkno,
  bocneOknoFixne, setBocneOknoFixne,
  bocneOknoVyklopne90, setBocneOknoVyklopne90,
  bocneOknoVyklopne55, setBocneOknoVyklopne55,
  povrchokaOkien, setPovrchokaOkien,
  tonovaneSkla, setTonovaneSkla,
  vonkajsiaFasada, setVonkajsiaFasada,
  interierFinis, setInterierFinis,
  vnutornePodlahy, setVnutornePodlahy,
  podlahovVykurovanie, setPodlahovVykurovanie,
  interieroveDvere, setInterieroveDvere,
  pergola, setPergola,
  inziniering, setInziniering,
  projektA0, setProjektA0,
  revizna, setRevizna,
  doprava, setDoprava,
  showOnlySummary = false,
  showOnlyPhase = null,
  typStavby = ""
}) {
  // Základná cena - dynamická z objektu domu
  const BASE_PRICE = dom?.zakladna_cena || 59900;

  // Flying animation hook
  const { animations, triggerAnimation } = useFlyingAnimation();
  const { t } = useLanguage();

  // FLAT DOUBLE CENNÍK - FIXNÉ CENY (142m²)
  const CENY = {
    montaz: { nie: 0, ano: 17970 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 5799, premium: 11600 },
    elektroinstalacia: 7400,
    vodaKanalizacia: 2380,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 5535,
    rekuperacia: 2700,
    zaklady: { bez: 0, skrutky: 8140, doska: 17946, pasove: 21079 },
    pripojkaSiete: 1501,
    inziniering: 2592,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 16400, sadrokarton: 19475 },
    vonkajsiaFasada: { standard: 0, suchana: 12841 },
    povrchokaOkien: 3100,
    vnutornePodlahy: 3351,
    podlahovVykurovanie: 5525,
    pergola: 1845,
    interieroveDvere: 180,
    tonovaneSkla: 1300,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 501,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 325
  };

  // Výpočet celkovej ceny
  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;

    total += CENY.montaz[montazHolodomu];
    total += CENY.dvere[vstupneDvere];
    total += CENY.izolacia[izolaciaNavysenie];
    
    if (elektroinstalacia) total += CENY.elektroinstalacia;
    if (vodaKanalizacia) total += CENY.vodaKanalizacia;
    if (sanitaKomplet) total += CENY.sanitaKomplet;
    if (bojler) total += CENY.bojler;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    
    total += CENY.zaklady[zaklady];
    if (pripojkaSiete) total += CENY.pripojkaSiete;
    
    if (inziniering) total += CENY.inziniering;
    if (projektA0) total += CENY.projektA0;
    
    total += CENY.interierFinis[interierFinis] || 0;
    total += CENY.vonkajsiaFasada[vonkajsiaFasada] || 0;
    if (povrchokaOkien) total += CENY.povrchokaOkien;
    if (vnutornePodlahy) total += CENY.vnutornePodlahy;
    if (podlahovVykurovanie) total += CENY.podlahovVykurovanie;
    total += interieroveDvere * CENY.interieroveDvere;
    if (pergola) total += CENY.pergola;
    if (tonovaneSkla) total += CENY.tonovaneSkla;
    if (doprava) total += CENY.doprava;
    if (revizna) total += CENY.revizna;
    
    total += stresneOkno * CENY.stresneOkno;
    total += bocneOknoFixne * CENY.bocneOknoFixne;
    total += bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90;
    total += bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55;
    
    return total;
  }, [montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, interierFinis,
      vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, podlahovVykurovanie,
      pergola, interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55]);

  // Kontrola A0 odporúčaní
  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium") chybajuce.push("Premium izolácia (250mm steny, 300mm strecha)");
    if (!tepelneCerpadlo) chybajuce.push("Tepelné čerpadlo / Klimatizácia");
    if (!rekuperacia) chybajuce.push("Rekuperácia");
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

  // Detekcia dosiahnutých úrovní
  const dosiahnuteUrovne = useMemo(() => {
    const hrubaStavba = montazHolodomu === "ano" || izolaciaNavysenie !== "standard" || zaklady !== "bez";
    const holodom = hrubaStavba && (elektroinstalacia || vodaKanalizacia || tepelneCerpadlo || rekuperacia);
    const domNaKluc = holodom && (interierFinis !== "ziadne" || vnutornePodlahy || vonkajsiaFasada === "suchana");
    
    return { hrubaStavba, holodom, domNaKluc };
  }, [montazHolodomu, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      tepelneCerpadlo, rekuperacia, interierFinis, vnutornePodlahy, vonkajsiaFasada]);

  // Generovanie súhrnu všetkých položiek (vybrané aj nevybrané)
  const selectedItems = useMemo(() => {
    const items = [];
    
    // Základná cena
    items.push({ name: t('basePriceKit'), price: BASE_PRICE, section: "base", selected: true });
    
    if (predajNehnutelnosti) items.push({ name: t('sellPreviousProperty'), price: 0, section: "services", selected: true });
    if (hladaniePozemku) items.push({ name: t('wantLandForHouse'), price: 0, section: "services", selected: true });
    if (financneSluzby) items.push({ name: t('financialServicesLoans'), price: 0, section: "services", selected: true });
    
    // Hrubá stavba
    items.push({ name: t('shellAssembly'), price: montazHolodomu === "ano" ? CENY.montaz.ano : 0, section: "hruba", selected: montazHolodomu === "ano" });
    
    const izolaciaLabel = izolaciaNavysenie === "premium" ? t('insulationPremium') + " (250/300mm)" : izolaciaNavysenie === "zvysena" ? t('insulationEnhanced') + " (200/250mm)" : t('insulationStd');
    const izolaciaPrice = izolaciaNavysenie === "premium" ? CENY.izolacia.premium : izolaciaNavysenie === "zvysena" ? CENY.izolacia.zvysena : 0;
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standard" });
    
    const zakladyLabel = zaklady === "pasove" ? t('foundationsStrip') : zaklady === "doska" ? t('foundationsSlab') : zaklady === "skrutky" ? t('foundationsScrews') : t('foundationsLabel');
    const zakladyPrice = zaklady === "pasove" ? CENY.zaklady.pasove : zaklady === "doska" ? CENY.zaklady.doska : zaklady === "skrutky" ? CENY.zaklady.skrutky : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
    // Holodom
    const interierLabel = interierFinis === "drevo" ? t('interiorWood') : interierFinis === "sadrokarton" ? t('interiorDrywall') : t('interiorFinish');
    const interierPrice = interierFinis === "drevo" ? CENY.interierFinis.drevo : interierFinis === "sadrokarton" ? CENY.interierFinis.sadrokarton : 0;
    items.push({ name: interierLabel, price: interierPrice, section: "holodom", selected: interierFinis !== "ziadne" });

    items.push({ name: t('electricalFull'), price: elektroinstalacia ? CENY.elektroinstalacia : 0, section: "holodom", selected: elektroinstalacia });
    items.push({ name: t('waterFull'), price: vodaKanalizacia ? CENY.vodaKanalizacia : 0, section: "holodom", selected: vodaKanalizacia });
    items.push({ name: t('sanitaryFull'), price: sanitaKomplet ? CENY.sanitaKomplet : 0, section: "holodom", selected: sanitaKomplet });
    items.push({ name: t('boiler'), price: bojler ? CENY.bojler : 0, section: "holodom", selected: bojler });
    items.push({ name: t('heatPumpFull'), price: tepelneCerpadlo ? CENY.tepelneCerpadlo : 0, section: "holodom", selected: tepelneCerpadlo });
    items.push({ name: t('recuperation'), price: rekuperacia ? CENY.rekuperacia : 0, section: "holodom", selected: rekuperacia });
    items.push({ name: t('gridConnectionFull'), price: pripojkaSiete ? CENY.pripojkaSiete : 0, section: "holodom", selected: pripojkaSiete });
    
    const dvereLabel = vstupneDvere === "kovove" ? t('doorMetal') : vstupneDvere === "plastove" ? t('doorPlastic') : t('doorStandard');
    const dverePrice = vstupneDvere === "kovove" ? CENY.dvere.kovove : vstupneDvere === "plastove" ? CENY.dvere.plastove : 0;
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: vstupneDvere !== "ziadne" });
    
    if (stresneOkno > 0) items.push({ name: `${t('roofWindow')} (${stresneOkno}×)`, price: stresneOkno * CENY.stresneOkno, section: "holodom", selected: true });
    if (bocneOknoFixne > 0) items.push({ name: `${t('fixedWindow')} (${bocneOknoFixne}×)`, price: bocneOknoFixne * CENY.bocneOknoFixne, section: "holodom", selected: true });
    if (bocneOknoVyklopne90 > 0) items.push({ name: `${t('tiltWindow')} 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90, section: "holodom", selected: true });
    if (bocneOknoVyklopne55 > 0) items.push({ name: `${t('tiltWindow')} 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55, section: "holodom", selected: true });
    items.push({ name: t('lamination') + " - " + t('laminationAnthracite'), price: povrchokaOkien ? CENY.povrchokaOkien : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: t('tintedGlass') + " (Solar)", price: tonovaneSkla ? CENY.tonovaneSkla : 0, section: "holodom", selected: tonovaneSkla });
    
    // Dom na kľúč
    const fasadaLabel = vonkajsiaFasada === "suchana" ? t('facadeStucco') : vonkajsiaFasada === "standard" ? t('facadeWoodMetal') : t('facade');
    const fasadaPrice = vonkajsiaFasada === "suchana" ? CENY.vonkajsiaFasada.suchana : 0;
    items.push({ name: fasadaLabel, price: fasadaPrice, section: "kluc", selected: !!vonkajsiaFasada });

    items.push({ name: t('floors') + " - " + t('floorsLaminate'), price: vnutornePodlahy ? CENY.vnutornePodlahy : 0, section: "kluc", selected: vnutornePodlahy });
    items.push({ name: t('floorHeatingFull'), price: podlahovVykurovanie ? CENY.podlahovVykurovanie : 0, section: "kluc", selected: podlahovVykurovanie });
    items.push({ name: `${t('interiorDoors')} (${interieroveDvere}×)`, price: interieroveDvere * CENY.interieroveDvere, section: "kluc", selected: interieroveDvere > 0 });
    if (pergola) items.push({ name: t('pergola'), price: CENY.pergola, section: "kluc", selected: true });
    
    // Dokumentácia
    items.push({ name: t('engineeringFull'), price: inziniering ? CENY.inziniering : 0, section: "docs", selected: inziniering });
    items.push({ name: t('projectA0Full'), price: projektA0 ? CENY.projektA0 : 0, section: "docs", selected: projektA0 });
    items.push({ name: t('revisionFull'), price: revizna ? CENY.revizna : 0, section: "docs", selected: revizna });
    items.push({ name: t('transport'), price: doprava ? CENY.doprava : 0, section: "docs", selected: doprava });
    
    return items;
  }, [predajNehnutelnosti, hladaniePozemku, financneSluzby,
      montazHolodomu, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, pripojkaSiete, vstupneDvere,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, povrchokaOkien,
      tonovaneSkla, vonkajsiaFasada, interierFinis, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, inziniering, projektA0, revizna, doprava, t]);

  // Fixed panel reference
  const dragRef = useRef(null);
  const interierFinisRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Get width of Interiér finiš panel
  useEffect(() => {
    const updateWidth = () => {
      const interierPanel = document.getElementById('interier-finis-panel');
      if (interierPanel) {
        setPanelWidth(interierPanel.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setPredajNehnutelnosti?.(false);
      setHladaniePozemku?.(false);
      setFinancneSluzby?.(false);
      setMontazHolodomu?.("nie");
      setVstupneDvere("ziadne");
      setIzolaciaNavysenie?.("standard");
      setElektroinstalacia(false);
      setVodaKanalizacia(false);
      setSanitaKomplet(false);
      setBojler(false);
      setTepelneCerpadlo(false);
      setRekuperacia(false);
      setZaklady?.("bez");
      setPripojkaSiete(false);
      setInziniering(false);
      setProjektA0(false);
      setInterierFinis("ziadne");
      setVonkajsiaFasada("");
      setPovrchokaOkien(false);
      setVnutornePodlahy(false);
      setPodlahovVykurovanie(false);
      setInterieroveDvere(0);
      setTonovaneSkla(false);
      setDoprava(false);
      setRevizna(true);
      setStresneOkno(0);
      setBocneOknoFixne(0);
      setBocneOknoVyklopne90(0);
      setBocneOknoVyklopne55(0);
    }
  };

  // Sekcia Header komponenta s animáciou
  const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative flex items-center gap-2 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r ${color} overflow-hidden`}
    >
      {/* Dekoratívny vzor */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>
      
      {/* Animovaný kruh */}
      <motion.div 
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-white/25 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20"
      >
        <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      </motion.div>
      <div className="relative flex-1">
        <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center px-2 sm:px-3 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider"
          >
            {t('phase')} {step}
          </motion.span>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  // Animovaný checkbox wrapper
  const AnimatedOption = ({ children, isSelected, color = "blue" }) => (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      animate={{ 
        backgroundColor: isSelected ? `rgba(var(--${color}-rgb), 0.05)` : "transparent",
        borderColor: isSelected ? `rgba(var(--${color}-rgb), 0.5)` : "rgba(229, 231, 235, 1)"
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );

  // Handler pre animácie
  const handleSelectionWithAnimation = (type, value, setter, element) => {
    setter(value);
    if (element) {
      triggerAnimation(type, element.currentTarget || element);
    }
  };

  // Ak zobrazujeme iba sumár (pre ľavý stĺpec)
    if (showOnlySummary) {
                return (
                  <div>
                    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 ring-2 ring-green-500/30">
            <div className="p-3 border-b-2 border-slate-300 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-900 text-xs font-bold uppercase tracking-wider mb-0.5">{t('yourConfiguration')}</p>
                  <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'Flat Double 142m²'}</h3>
                </div>
              </div>
            </div>

          {/* Contact Modal for summary view */}
          <KonfiguratorContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            dom={dom}
            totalPrice={totalPrice}
            selectedItems={selectedItems}
            vonkajsiaFasada={vonkajsiaFasada}
            izolaciaNavysenie={izolaciaNavysenie}
            tepelneCerpadlo={tepelneCerpadlo}
            rekuperacia={rekuperacia}
            projektA0={projektA0}
          />

            {/* Súhrn položiek - všetky položky */}
            <div className="px-2 py-1 max-h-[65vh] overflow-y-auto">
              {selectedItems.map((item, index) => {
                const isBase = item.section === "base";
                const prevItem = selectedItems[index - 1];
                const showServicesDivider = item.section === "services" && (!prevItem || prevItem.section === "base");
                const showHrubaDivider = item.section === "hruba" && (prevItem?.section !== "hruba" && prevItem?.section !== "services");
                const showHolodomDivider = item.section === "holodom" && prevItem?.section === "hruba";
                const showKlucDivider = item.section === "kluc" && prevItem?.section === "holodom";
                const showDocsDivider = item.section === "docs" && prevItem?.section === "kluc";

                return (
                  <React.Fragment key={index}>
                    {showServicesDivider && (
                      <div className="py-0.5">
                        <div className="border-t border-cyan-400"></div>
                        <div className="flex items-center gap-1 px-1">
                          <Building2 className="w-3 h-3 text-cyan-800" />
                          <span className="text-xs font-bold text-cyan-950 uppercase">{t('additionalServices')}</span>
                        </div>
                      </div>
                    )}
                    {showHrubaDivider && (
                      <div className="py-0.5">
                                <div className="border-t border-amber-400"></div>
                                <div className="flex items-center gap-1 px-1">
                                  <Package className="w-3 h-3 text-amber-800" />
                                  <span className="text-xs font-bold text-amber-950 uppercase">{t('roughConstruction')}</span>
                                </div>
                              </div>
                    )}
                    {showHolodomDivider && (
                      <div className="py-0.5">
                                <div className="border-t border-blue-400"></div>
                                <div className="flex items-center gap-1 px-1">
                                  <Hammer className="w-3 h-3 text-blue-800" />
                                  <span className="text-xs font-bold text-blue-950 uppercase">{t('holodomLabel')}</span>
                                </div>
                              </div>
                    )}
                    {showKlucDivider && (
                      <div className="py-0.5">
                                <div className="border-t border-emerald-400"></div>
                                <div className="flex items-center gap-1 px-1">
                                  <Key className="w-3 h-3 text-emerald-800" />
                                  <span className="text-xs font-bold text-emerald-950 uppercase">{t('turnkeyLabel')}</span>
                                </div>
                              </div>
                    )}
                    {showDocsDivider && (
                      <div className="py-0.5">
                                <div className="border-t border-purple-400"></div>
                                <div className="flex items-center gap-1 px-1">
                                  <FileText className="w-3 h-3 text-purple-800" />
                                  <span className="text-xs font-bold text-purple-950 uppercase">{t('documentationLabel')}</span>
                                </div>
                              </div>
                    )}
                    <div className={`flex justify-between items-center py-1 px-2 rounded ${isBase ? 'bg-blue-200 my-0.5' : item.selected ? 'bg-slate-50 hover:bg-slate-100' : ''}`}>
                    <span className={`${isBase ? 'text-blue-950 font-extrabold text-base' : item.selected ? 'text-gray-800 font-bold text-sm' : 'text-red-600 line-through text-sm'} flex-1 pr-1 truncate`}>{item.name}</span>
                    <span className={`${isBase ? 'text-blue-950 text-base' : item.selected ? 'text-green-700 text-sm' : 'text-red-600 text-sm'} font-extrabold whitespace-nowrap`}>
                      {item.selected ? formatPrice(item.price) : '—'}
                    </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Celková cena */}
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 border-t-2 border-green-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 text-sm font-bold">{t('totalWithVATLabel')}</span>
                <span className="text-2xl font-black text-green-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="space-y-1.5">
                  <Button 
                    size="sm" 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg text-xs h-8"
                  >
                    <Send className="mr-1.5 w-3.5 h-3.5" />
                    {t('interested')}
                  </Button>
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-xs h-8"
                  >
                  <RotateCcw className="mr-1.5 w-3.5 h-3.5" />
                  {t('reset')}
                </Button>
              </div>
            </div>
          </Card>
          </div>
          );
          }

  // Určenie, ktoré sekcie zobraziť
  const showHruba = !showOnlyPhase || showOnlyPhase === "hruba";
  const showHolodom = !showOnlyPhase || showOnlyPhase === "holodom";
  const showKluc = !showOnlyPhase || showOnlyPhase === "kluc";
  const showDocs = !showOnlyPhase || showOnlyPhase === "docs";

  return (
    <div className="mt-8 relative">
      {/* Flying animations container */}
      <FlyingAnimationContainer animations={animations} />

      <div>
      <div className="space-y-6">

        <KonfiguratorFaza0Sluzby
          predajNehnutelnosti={predajNehnutelnosti}
          setPredajNehnutelnosti={setPredajNehnutelnosti}
          hladaniePozemku={hladaniePozemku}
          setHladaniePozemku={setHladaniePozemku}
          financneSluzby={financneSluzby}
          setFinancneSluzby={setFinancneSluzby}
        />

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 1: HRUBÁ STAVBA
          ═══════════════════════════════════════════════════════════════════════ */}
        {showHruba && (
          <KonfiguratorFaza1HrubaStavba 
            montazHolodomu={montazHolodomu}
            setMontazHolodomu={setMontazHolodomu}
            izolaciaNavysenie={izolaciaNavysenie}
            setIzolaciaNavysenie={setIzolaciaNavysenie}
            zaklady={zaklady}
            setZaklady={setZaklady}
            triggerAnimation={triggerAnimation}
            useFlat15Prices={false}
            useFlatDoublePrices={true}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 2: HOLODOM (Montáž, Inštalácie, Okná/Dvere)
          ═══════════════════════════════════════════════════════════════════════ */}
        {showHolodom && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Card className="overflow-hidden border-2 border-blue-300 shadow-lg">
        <SectionHeader 
          icon={Hammer} 
          title={t('phase2')} 
          subtitle={t('phase2Subtitle')}
          color="from-blue-600 to-indigo-600"
          step="3"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-blue-50/50 to-white">
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Interiér finiš - skupina */}
            <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-2 sm:gap-3 p-4 border-[5px] border-blue-600 rounded-2xl bg-blue-100/70 shadow-xl">
              <p className="col-span-3 text-[10px] sm:text-xs font-bold text-blue-700 -mb-1 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">1</span>
                {t('interiorFinish')} ({t('selectOne')})
              </p>
              <Tile
                selected={interierFinis === "ziadne"}
                onClick={() => setInterierFinis("ziadne")}
                icon={Home}
                iconColor="text-gray-400"
                iconSelectedColor="text-blue-600"
                title={t('interiorNone')}
                subtitle={t('shellConstruction')}
                price="+ 0 €"
                isPriced={false}
                tooltip={t('interiorNone')}
              />

              <Tile
                selected={interierFinis === "drevo"}
                onClick={(e) => { if (interierFinis !== "drevo") triggerAnimation("drevo", e.currentTarget); setInterierFinis("drevo"); }}
                icon={Home}
                iconColor="text-amber-600"
                iconSelectedColor="text-blue-600"
                title={t('interiorWood')}
                subtitle={t('woodCladding')}
                price={`+ ${CENY.interierFinis.drevo.toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('interiorWood')}
              />

              <Tile
                selected={interierFinis === "sadrokarton"}
                onClick={(e) => { if (interierFinis !== "sadrokarton") triggerAnimation("sadrokarton", e.currentTarget); setInterierFinis("sadrokarton"); }}
                icon={Home}
                iconColor="text-gray-500"
                iconSelectedColor="text-blue-600"
                title={t('interiorDrywall')}
                subtitle={t('plaster')}
                price={`+ ${CENY.interierFinis.sadrokarton.toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('interiorDrywall')}
              />
            </div>

            {/* Inštalácie - skupina */}
            <div className="col-span-2 sm:col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-4 border-[5px] border-yellow-500 rounded-2xl bg-yellow-100/70 shadow-xl">
              <p className="col-span-2 text-[10px] sm:text-xs font-bold text-yellow-800 -mb-1 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">2</span>
                {t('electrical')} & {t('water')}
              </p>
              <Tile
                selected={elektroinstalacia}
                onClick={(e) => { if (!elektroinstalacia) triggerAnimation("elektro", e.currentTarget); setElektroinstalacia(!elektroinstalacia); }}
                icon={Zap}
                iconColor="text-yellow-500"
                iconSelectedColor="text-yellow-600"
                title={t('electrical')}
                subtitle={t('wiring')}
                price={`+ ${CENY.elektroinstalacia.toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-yellow-100"
                selectedBorder="border-yellow-500"
                selectedRing="ring-yellow-300"
                hoverBorder="hover:border-yellow-300"
                tooltip={t('electricalFull')}
              />

              <Tile
                selected={vodaKanalizacia}
                onClick={(e) => { if (!vodaKanalizacia) triggerAnimation("voda", e.currentTarget); setVodaKanalizacia(!vodaKanalizacia); }}
                icon={Droplets}
                iconColor="text-blue-400"
                iconSelectedColor="text-blue-600"
                title={t('water')}
                subtitle={t('wiring')}
                price={`+ ${CENY.vodaKanalizacia.toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('waterFull')}
              />

              <Tile
              selected={sanitaKomplet}
              onClick={(e) => { if (!sanitaKomplet) triggerAnimation("sanita", e.currentTarget); setSanitaKomplet(!sanitaKomplet); }}
              icon={ShowerHead}
              iconColor="text-blue-400"
              iconSelectedColor="text-blue-600"
              title={t('sanitary')}
              subtitle={t('complete')}
              price={`+ ${CENY.sanitaKomplet.toLocaleString('sk-SK')} €`}
              isPriced={true}
              tooltip={t('sanitaryFull')}
              />

              <Tile
                selected={bojler}
                onClick={(e) => { if (!bojler) triggerAnimation("bojler", e.currentTarget); setBojler(!bojler); }}
                icon={Flame}
                iconColor="text-orange-400"
                iconSelectedColor="text-orange-600"
                title={t('boiler')}
                subtitle={t('boilerElectric')}
                price={`+ ${CENY.bojler.toLocaleString('sk-SK')} €`}
                isPriced={true}
                  selectedBg="bg-orange-100"
                  selectedBorder="border-orange-500"
                  selectedRing="ring-orange-300"
                  hoverBorder="hover:border-orange-300"
                  tooltip={t('boiler')}
                />
              </div>

              {/* Klimatizácia a vetranie - A0 skupina */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-4 border-[5px] border-green-600 rounded-2xl bg-green-100/70 shadow-xl">
                <p className="col-span-2 text-xs font-bold text-green-800 -mb-1 flex items-center gap-1">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">3</span>
                  {t('heatPump')} & {t('recuperation')} (A0)
                </p>
                <Tile
                  selected={tepelneCerpadlo}
                  onClick={(e) => { if (!tepelneCerpadlo) triggerAnimation("klimatizacia", e.currentTarget); setTepelneCerpadlo(!tepelneCerpadlo); }}
                  icon={ThermometerSun}
                  iconColor="text-red-500"
                  iconSelectedColor="text-green-600"
                  title={t('heatPump')}
                  subtitle={t('units5')}
                  price={`+ ${CENY.tepelneCerpadlo.toLocaleString('sk-SK')} €`}
                  isPriced={true}
                  isA0={true}
                  selectedBg="bg-green-100"
                  selectedBorder="border-green-500"
                  selectedRing="ring-green-300"
                  tooltip={t('heatPumpFull')}
                />

                <Tile
                  selected={rekuperacia}
                  onClick={(e) => { if (!rekuperacia) triggerAnimation("rekuperacia", e.currentTarget); setRekuperacia(!rekuperacia); }}
                  icon={Wind}
                  iconColor="text-cyan-500"
                  iconSelectedColor="text-green-600"
                  title={t('recuperation')}
                  subtitle={t('units5')}
                  price={`+ ${CENY.rekuperacia.toLocaleString('sk-SK')} €`}
                  isPriced={true}
                  isA0={true}
                  selectedBg="bg-green-100"
                  selectedBorder="border-green-500"
                  selectedRing="ring-green-300"
                  tooltip={t('recuperation')}
                />
              </div>

              <Tile
                selected={pripojkaSiete}
                onClick={(e) => { if (!pripojkaSiete) triggerAnimation("siete", e.currentTarget); setPripojkaSiete(!pripojkaSiete); }}
                icon={Cable}
                iconColor="text-gray-400"
                iconSelectedColor="text-gray-700"
                title={t('gridConnection')}
                subtitle={t('connection')}
                price={`+ ${CENY.pripojkaSiete.toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-gray-200"
                selectedBorder="border-gray-500"
                selectedRing="ring-gray-300"
                hoverBorder="hover:border-gray-400"
                tooltip={t('gridConnectionFull')}
              />

              <Tile
                selected={povrchokaOkien}
                onClick={(e) => { if (!povrchokaOkien) triggerAnimation("oknoAntracit", e.currentTarget); setPovrchokaOkien(!povrchokaOkien); }}
                icon={Square}
                iconColor="text-slate-400"
                iconSelectedColor="text-slate-700"
                title={t('lamination')}
                subtitle={t('laminationAnthracite')}
                price={`+ ${CENY.povrchokaOkien.toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-slate-200"
                selectedBorder="border-slate-600"
                selectedRing="ring-slate-300"
                hoverBorder="hover:border-slate-400"
                tooltip={t('lamination')}
              />

              <Tile
                selected={tonovaneSkla}
                onClick={(e) => { if (!tonovaneSkla) triggerAnimation("oknoTonovane", e.currentTarget); setTonovaneSkla(!tonovaneSkla); }}
                icon={Sun}
                iconColor="text-amber-400"
                iconSelectedColor="text-amber-600"
                title={t('tintedGlass')}
                subtitle={t('solarGlass')}
                price={`+ ${CENY.tonovaneSkla.toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-amber-100"
                selectedBorder="border-amber-500"
                selectedRing="ring-amber-300"
                hoverBorder="hover:border-amber-300"
                tooltip={t('tintedGlass')}
              />

          </div>

          {/* Sekcia s počtami - Dvere a Okná */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-xs sm:text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" />
              {t('entryDoor')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "ziadne", label: t('doorStandard'), price: "0 €" },
                { value: "kovove", label: t('doorMetal'), price: `+ ${CENY.dvere.kovove.toLocaleString('sk-SK')} €` },
                { value: "plastove", label: t('doorPlastic'), price: `+ ${CENY.dvere.plastove.toLocaleString('sk-SK')} €` }
              ].map((opt) => (
                <motion.div
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVstupneDvere(opt.value)}
                  className={`p-2 sm:p-3 rounded-lg cursor-pointer text-center transition-all ${
                    vstupneDvere === opt.value 
                      ? "bg-blue-100 border-2 border-blue-500" 
                      : "bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <span className="font-medium text-gray-800 text-xs sm:text-sm block">{opt.label}</span>
                  <span className={`text-[10px] sm:text-xs ${opt.value === "ziadne" ? "text-gray-400" : "text-green-600 font-bold"}`}>{opt.price}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-xs sm:text-sm font-bold text-gray-700 mt-4 mb-3 flex items-center gap-2">
                <Square className="w-4 h-4 text-blue-600" />
                {t('additionalWindows')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { state: stresneOkno, setter: setStresneOkno, label: t('roofWindow'), price: `${CENY.stresneOkno.toLocaleString('sk-SK')} €` },
                  { state: bocneOknoFixne, setter: setBocneOknoFixne, label: `${t('fixedWindow')} 90×205`, price: `${CENY.bocneOknoFixne.toLocaleString('sk-SK')} €` },
                  { state: bocneOknoVyklopne90, setter: setBocneOknoVyklopne90, label: `${t('tiltWindow')} 90×205`, price: `${CENY.bocneOknoVyklopne90.toLocaleString('sk-SK')} €` },
                  { state: bocneOknoVyklopne55, setter: setBocneOknoVyklopne55, label: `${t('tiltWindow')} 55×90`, price: `${CENY.bocneOknoVyklopne55.toLocaleString('sk-SK')} €` }
                ].map((opt, idx) => (
                <div key={idx} className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${opt.state > 0 ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-200"}`}>
                  <span className="font-medium text-gray-800 text-[10px] sm:text-xs block mb-1">{opt.label}</span>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => opt.setter(Math.max(0, opt.state - 1))}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm"
                    >−</button>
                    <span className="w-6 text-center font-bold text-sm">{opt.state}</span>
                    <button 
                      onClick={() => opt.setter(opt.state + 1)}
                      className="w-6 h-6 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm"
                    >+</button>
                  </div>
                  <span className="text-green-600 font-bold text-[10px] block mt-1 text-center">× {opt.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        </Card>
        </motion.div>}

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 3: DOM NA KĽÚČ (Interiér, Podlahy, Fasáda, Dokončenie)
          ═══════════════════════════════════════════════════════════════════════ */}
        {showKluc && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Card className="overflow-hidden border-2 border-emerald-300 shadow-lg">
        <SectionHeader 
          icon={Key} 
          title={t('phase3')} 
          subtitle={t('phase3Subtitle')}
          color="from-emerald-600 to-teal-600"
          step="4"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-emerald-50/50 to-white">
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Fasáda - skupina */}
            <div className={`col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-4 border-[5px] rounded-2xl shadow-xl ${!vonkajsiaFasada ? 'border-red-600 bg-red-100/70 animate-pulse' : 'border-emerald-600 bg-emerald-100/70'}`}>
              <p className={`col-span-2 text-[10px] sm:text-xs font-bold -mb-1 flex items-center gap-1 ${!vonkajsiaFasada ? 'text-red-600' : 'text-emerald-700'}`}>
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold text-white ${!vonkajsiaFasada ? 'bg-red-600' : 'bg-emerald-600'}`}>1</span>
                {t('facade')} ({t('selectOne')}) {!vonkajsiaFasada && <span className="text-red-500 ml-1">*{t('required')}</span>}
              </p>
              <Tile
                selected={vonkajsiaFasada === "standard"}
                onClick={() => setVonkajsiaFasada("standard")}
                icon={Paintbrush}
                iconColor="text-amber-500"
                iconSelectedColor="text-emerald-600"
                title={t('facadeWoodMetal')}
                subtitle={t('facadeStandard')}
                price="+ 0 €"
                isPriced={false}
                selectedBg="bg-emerald-100"
                selectedBorder="border-emerald-500"
                selectedRing="ring-emerald-300"
                hoverBorder="hover:border-emerald-300"
                tooltip={t('facadeWoodMetal')}
              />

              <Tile
                selected={vonkajsiaFasada === "suchana"}
                onClick={(e) => { if (vonkajsiaFasada !== "suchana") triggerAnimation("fasadaSuchana", e.currentTarget); setVonkajsiaFasada("suchana"); }}
                icon={Paintbrush}
                iconColor="text-orange-400"
                iconSelectedColor="text-emerald-600"
                title={t('facadeStucco')}
                subtitle={t('whitePlaster')}
                price={`+ ${CENY.vonkajsiaFasada.suchana.toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-emerald-100"
                selectedBorder="border-emerald-500"
                selectedRing="ring-emerald-300"
                hoverBorder="hover:border-emerald-300"
                tooltip={t('facadeStucco')}
              />
            </div>

            <Tile
              selected={vnutornePodlahy}
              onClick={(e) => { if (!vnutornePodlahy) triggerAnimation("podlaha", e.currentTarget); setVnutornePodlahy(!vnutornePodlahy); }}
              icon={Square}
              iconColor="text-amber-500"
              iconSelectedColor="text-emerald-600"
              title={t('floors')}
              subtitle={t('floorsLaminate')}
              price={`+ ${CENY.vnutornePodlahy.toLocaleString('sk-SK')} €`}
              isPriced={true}
              selectedBg="bg-emerald-100"
              selectedBorder="border-emerald-500"
              selectedRing="ring-emerald-300"
              hoverBorder="hover:border-emerald-300"
              tooltip={t('floors')}
              />

            <Tile
              selected={podlahovVykurovanie}
              onClick={(e) => { if (!podlahovVykurovanie) triggerAnimation("podlahovVykurovanie", e.currentTarget); setPodlahovVykurovanie(!podlahovVykurovanie); }}
              icon={Flame}
              iconColor="text-orange-400"
              iconSelectedColor="text-orange-600"
              title={t('floorHeating')}
              subtitle={t('wifiThermostat')}
              price={`+ ${CENY.podlahovVykurovanie.toLocaleString('sk-SK')} €`}
              isPriced={true}
              selectedBg="bg-orange-100"
              selectedBorder="border-orange-500"
              selectedRing="ring-orange-300"
              hoverBorder="hover:border-orange-300"
              tooltip={t('floorHeatingFull')}
            />

            <Tile
              selected={pergola}
              onClick={(e) => { if (!pergola) triggerAnimation("pergola", e.currentTarget); setPergola(!pergola); }}
              icon={TreePine}
              iconColor="text-green-500"
              iconSelectedColor="text-emerald-600"
              title={t('pergola')}
              subtitle={t('terrace')}
              price={`+ ${CENY.pergola.toLocaleString('sk-SK')} €`}
              isPriced={true}
              selectedBg="bg-emerald-100"
              selectedBorder="border-emerald-500"
              selectedRing="ring-emerald-300"
              hoverBorder="hover:border-emerald-300"
              tooltip={t('pergola')}
            />

              </div>

          {/* Interiérové dvere - počet */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                <div>
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm">{t('interiorDoors')}</span>
                  <span className="text-green-600 font-bold text-xs ml-2">× {CENY.interieroveDvere.toLocaleString('sk-SK')} €</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setInterieroveDvere(Math.max(0, interieroveDvere - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg"
                >−</button>
                <span className="w-8 text-center font-bold text-lg">{interieroveDvere}</span>
                <button 
                  onClick={() => setInterieroveDvere(interieroveDvere + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg"
                >+</button>
              </div>
            </div>
          </div>

        </div>
        </Card>
        </motion.div>}

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 4: DOKUMENTÁCIA A DOPRAVA
          ═══════════════════════════════════════════════════════════════════════ */}
        {showDocs && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        >
        <Card className="overflow-hidden border-2 border-purple-300 shadow-lg">
        <SectionHeader 
          icon={FileText} 
          title={t('phase4')} 
          subtitle={t('phase4Subtitle')}
          color="from-purple-600 to-violet-600"
          step="5"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-purple-50/50 to-white">
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            
            <Tile
              selected={inziniering}
              onClick={(e) => { if (!inziniering) triggerAnimation("inziniering", e.currentTarget); setInziniering(!inziniering); }}
              icon={FileText}
              iconColor="text-purple-400"
              iconSelectedColor="text-purple-600"
              title={t('engineering')}
              subtitle={t('buildingPermit')}
              price={`+ ${CENY.inziniering.toLocaleString('sk-SK')} €`}
              isPriced={true}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip={t('engineeringFull')}
            />

            <Tile
              selected={projektA0}
              onClick={(e) => { if (!projektA0) triggerAnimation("projektant", e.currentTarget); setProjektA0(!projektA0); }}
              icon={FileCheck}
              iconColor="text-green-500"
              iconSelectedColor="text-green-600"
              title={t('projectA0')}
              subtitle={t('certification')}
              price={`+ ${CENY.projektA0.toLocaleString('sk-SK')} €`}
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
              tooltip={t('projectA0Full')}
            />

            <Tile
              selected={revizna}
              onClick={() => setRevizna(!revizna)}
              icon={FileText}
              iconColor="text-gray-400"
              iconSelectedColor="text-purple-600"
              title={t('revision')}
              subtitle={t('documentation')}
              price={`+ ${CENY.revizna.toLocaleString('sk-SK')} €`}
              isPriced={true}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip={t('revisionFull')}
            />

            <Tile
              selected={doprava}
              onClick={(e) => { if (!doprava) triggerAnimation("doprava", e.currentTarget); setDoprava(!doprava); }}
              icon={Truck}
              iconColor="text-purple-400"
              iconSelectedColor="text-purple-600"
              title={t('transport')}
              subtitle={t('transportFull')}
              price="+ 0 €"
              isPriced={false}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip={t('transport')}
            />

          </div>

          {/* A0 Upozornenie */}
          {a0Odporucania && (
            <div className="mt-4 p-3 sm:p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-1 text-xs sm:text-sm">{t('a0Recommendations')}</p>
                  <ul className="space-y-0.5">
                    {a0Odporucania.map((item, index) => (
                      <li key={index} className="text-amber-700 flex items-center gap-1 text-[10px] sm:text-xs">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* A0 Splnené */}
          {projektA0 && !a0Odporucania && (
            <div className="mt-4 p-3 sm:p-4 bg-green-50 border-2 border-green-300 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <p className="font-bold text-green-800 text-xs sm:text-sm">{t('configMeetsA0')}</p>
              </div>
            </div>
          )}

        </div>
        </Card>
        </motion.div>}

        {/* ═══════════════════════════════════════════════════════════════════════
          FINÁLNY CENOVÝ SÚHRN
          ═══════════════════════════════════════════════════════════════════════ */}
        {!showOnlyPhase && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                  <div className="relative">
                    {/* Dekoratívny gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-4 sm:p-8 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-8">
                <div className="flex-1">
                  <p className="text-green-400 text-[10px] sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">{t('yourConfiguration')}</p>
                  <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{dom?.nazov || 'Flat Double 142m²'}</h3>
                  <p className="text-slate-400 text-xs sm:text-base mb-4">{t('completeCalculation')}</p>
                  {projektA0 && !a0Odporucania && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-sm py-1 sm:py-1.5 px-2 sm:px-4 shadow-lg shadow-green-500/30">✓ {t('meetsA0')}</Badge>
                  )}
                
                {/* Zoznam vybraných položiek */}
                <div className="mt-4 sm:mt-6 bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50 max-h-[300px] overflow-y-auto">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{t('selectedItems')}</p>
                  <div className="space-y-1">
                    {selectedItems.map((item, index) => {
                      const isBase = item.section === "base";
                      const prevItem = selectedItems[index - 1];
                      const showServicesDivider = item.section === "services" && (!prevItem || prevItem.section === "base");
                      const showHrubaDivider = item.section === "hruba" && (prevItem?.section !== "hruba" && prevItem?.section !== "services");
                      const showHolodomDivider = item.section === "holodom" && prevItem?.section === "hruba";
                      const showKlucDivider = item.section === "kluc" && prevItem?.section === "holodom";
                      const showDocsDivider = item.section === "docs" && prevItem?.section === "kluc";
                      
                      return (
                        <React.Fragment key={index}>
                          {showServicesDivider && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3 text-cyan-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider">{t('additionalServices')}</span>
                              </div>
                            </div>
                          )}
                          {showHrubaDivider && dosiahnuteUrovne.hrubaStavba && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">{t('roughConstruction')}</span>
                              </div>
                            </div>
                          )}
                          {showHolodomDivider && dosiahnuteUrovne.holodom && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Hammer className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">{t('holodomLabel')}</span>
                              </div>
                            </div>
                          )}
                          {showKlucDivider && dosiahnuteUrovne.domNaKluc && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Key className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">{t('turnkeyLabel')}</span>
                              </div>
                            </div>
                          )}
                          {showDocsDivider && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-wider">{t('documentationLabel')}</span>
                              </div>
                            </div>
                          )}
                          <div className={`flex justify-between items-center py-1 px-2 rounded text-[11px] sm:text-sm ${isBase ? 'bg-blue-500/20 border border-blue-500/30' : item.selected ? 'hover:bg-slate-700/30' : 'opacity-50'}`}>
                            <span className={`${isBase ? 'text-blue-300 font-semibold' : item.selected ? 'text-slate-300' : 'text-slate-500 line-through'} flex-1 pr-2`}>{item.name}</span>
                            <span className={`${isBase ? 'text-blue-300' : item.selected ? 'text-green-400' : 'text-slate-500'} font-semibold whitespace-nowrap`}>
                              {item.selected ? formatPrice(item.price) : 'NIE'}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right p-3 sm:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl sm:rounded-2xl border border-green-500/20 lg:min-w-[280px]">
                <p className="text-slate-400 mb-1 sm:mb-2 text-[10px] sm:text-sm">{t('totalWithVAT')}</p>
                <p className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-10 pt-4 sm:pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowContactModal(true)}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 w-full sm:w-auto shadow-2xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40"
              >
                <Send className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" />
                {t('interestedInConfig')}
              </Button>
            </div>

            {/* Contact Modal */}
            <KonfiguratorContactModal
              isOpen={showContactModal}
              onClose={() => setShowContactModal(false)}
              dom={dom}
              totalPrice={totalPrice}
              selectedItems={selectedItems}
              vonkajsiaFasada={vonkajsiaFasada}
              izolaciaNavysenie={izolaciaNavysenie}
              tepelneCerpadlo={tepelneCerpadlo}
              rekuperacia={rekuperacia}
              projektA0={projektA0}
            />
          </div>
        </div>
        </Card>
        </motion.div>}
        </div>
        </div>
        </div>
        );
        }