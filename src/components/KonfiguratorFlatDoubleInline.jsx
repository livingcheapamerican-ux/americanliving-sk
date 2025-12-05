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
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useFlyingAnimation, FlyingAnimationContainer } from "./FlyingAnimation";
import KonfiguratorContactModal from "./KonfiguratorContactModal";

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
      
      {/* Veľká zelená fajka cez celú dlaždicu */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-green-500/90 flex items-center justify-center shadow-lg">
              <Check className="w-6 h-6 sm:w-14 sm:h-14 text-white stroke-[3]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Icon className={`w-5 h-5 sm:w-10 sm:h-10 mb-1 sm:mb-2 ${selected ? iconSelectedColor : iconColor} ${selected ? "opacity-30" : ""}`} />
      <span className={`font-semibold text-gray-800 text-[10px] sm:text-sm leading-tight ${selected ? "opacity-30" : ""}`}>{title}</span>
      <span className={`text-[8px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-tight ${selected ? "opacity-30" : ""}`}>{subtitle}</span>
      <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-[9px] sm:text-xs mt-1 sm:mt-2 ${selected ? "opacity-30" : ""}`}>{price}</span>

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

export default function KonfiguratorFlatDoubleInline({ 
  dom,
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
  showOnlySummary = false
}) {
  // Základná cena
  const BASE_PRICE = 59900;

  // Flying animation hook
  const { animations, triggerAnimation } = useFlyingAnimation();

  // Cenník
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
    interieroveDvere: 250,
    tonovaneSkla: 1300,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 501,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
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
    
    total += CENY.interierFinis[interierFinis];
    total += CENY.vonkajsiaFasada[vonkajsiaFasada];
    if (povrchokaOkien) total += CENY.povrchokaOkien;
    if (vnutornePodlahy) total += CENY.vnutornePodlahy;
    if (podlahovVykurovanie) total += CENY.podlahovVykurovanie;
    if (pergola) total += CENY.pergola;
    total += interieroveDvere * CENY.interieroveDvere;
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
    items.push({ name: "Základná cena sady (svojpomocná montáž)", price: BASE_PRICE, section: "base", selected: true });
    
    // Hrubá stavba
    items.push({ name: "Montáž hrubej stavby", price: montazHolodomu === "ano" ? CENY.montaz.ano : 0, section: "hruba", selected: montazHolodomu === "ano" });
    
    const izolaciaLabel = izolaciaNavysenie === "premium" ? "Premium izolácia A0 (250/300mm)" : izolaciaNavysenie === "zvysena" ? "Zvýšená izolácia (200/250mm)" : "Izolácia (štandard)";
    const izolaciaPrice = izolaciaNavysenie === "premium" ? CENY.izolacia.premium : izolaciaNavysenie === "zvysena" ? CENY.izolacia.zvysena : 0;
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standard" });
    
    const zakladyLabel = zaklady === "pasove" ? "Pásové základy" : zaklady === "doska" ? "Základová doska" : zaklady === "skrutky" ? "Zemné skrutky / Pätky" : "Základy";
    const zakladyPrice = zaklady === "pasove" ? CENY.zaklady.pasove : zaklady === "doska" ? CENY.zaklady.doska : zaklady === "skrutky" ? CENY.zaklady.skrutky : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
    // Holodom
    const interierLabel = interierFinis === "drevo" ? "Interiér - obloženie drevom" : interierFinis === "sadrokarton" ? "Interiér - sádrokartón" : "Interiér finiš";
    const interierPrice = interierFinis === "drevo" ? CENY.interierFinis.drevo : interierFinis === "sadrokarton" ? CENY.interierFinis.sadrokarton : 0;
    items.push({ name: interierLabel, price: interierPrice, section: "holodom", selected: interierFinis !== "ziadne" });

    items.push({ name: "Elektrická inštalácia", price: elektroinstalacia ? CENY.elektroinstalacia : 0, section: "holodom", selected: elektroinstalacia });
    items.push({ name: "Rozvody vody a kanalizácie", price: vodaKanalizacia ? CENY.vodaKanalizacia : 0, section: "holodom", selected: vodaKanalizacia });
    items.push({ name: "Sanita komplet", price: sanitaKomplet ? CENY.sanitaKomplet : 0, section: "holodom", selected: sanitaKomplet });
    items.push({ name: "Elektrický bojler", price: bojler ? CENY.bojler : 0, section: "holodom", selected: bojler });
    items.push({ name: "Tepelné čerpadlo / Klimatizácia", price: tepelneCerpadlo ? CENY.tepelneCerpadlo : 0, section: "holodom", selected: tepelneCerpadlo });
    items.push({ name: "Rekuperácia", price: rekuperacia ? CENY.rekuperacia : 0, section: "holodom", selected: rekuperacia });
    items.push({ name: "Pripojenie na siete", price: pripojkaSiete ? CENY.pripojkaSiete : 0, section: "holodom", selected: pripojkaSiete });
    
    const dvereLabel = vstupneDvere === "kovove" ? "Kovové vstupné dvere" : vstupneDvere === "plastove" ? "Plastovo-kovové dvere" : "Vstupné dvere (štandard)";
    const dverePrice = vstupneDvere === "kovove" ? CENY.dvere.kovove : vstupneDvere === "plastove" ? CENY.dvere.plastove : 0;
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: vstupneDvere !== "ziadne" });
    
    items.push({ name: `Strešné okno (${stresneOkno}×)`, price: stresneOkno * CENY.stresneOkno, section: "holodom", selected: stresneOkno > 0 });
    items.push({ name: `Bočné okno fixné (${bocneOknoFixne}×)`, price: bocneOknoFixne * CENY.bocneOknoFixne, section: "holodom", selected: bocneOknoFixne > 0 });
    items.push({ name: `Bočné okno 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90, section: "holodom", selected: bocneOknoVyklopne90 > 0 });
    items.push({ name: `Bočné okno 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55, section: "holodom", selected: bocneOknoVyklopne55 > 0 });
    items.push({ name: "Laminácia okien - antracit", price: povrchokaOkien ? CENY.povrchokaOkien : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: "Tónované sklá (Solar)", price: tonovaneSkla ? CENY.tonovaneSkla : 0, section: "holodom", selected: tonovaneSkla });
    
    // Dom na kľúč
    const fasadaLabel = vonkajsiaFasada === "suchana" ? "Škúchaná fasáda" : "Vonkajšia fasáda (štandard)";
    const fasadaPrice = vonkajsiaFasada === "suchana" ? CENY.vonkajsiaFasada.suchana : 0;
    items.push({ name: fasadaLabel, price: fasadaPrice, section: "kluc", selected: vonkajsiaFasada !== "standard" });

    items.push({ name: "Vnútorné podlahy - laminát", price: vnutornePodlahy ? CENY.vnutornePodlahy : 0, section: "kluc", selected: vnutornePodlahy });
    items.push({ name: "Elektrické podlahové vykurovanie s WiFi termostatom", price: podlahovVykurovanie ? CENY.podlahovVykurovanie : 0, section: "kluc", selected: podlahovVykurovanie });
    items.push({ name: `Interiérové dvere (${interieroveDvere}×)`, price: interieroveDvere * CENY.interieroveDvere, section: "kluc", selected: interieroveDvere > 0 });
    items.push({ name: "Dekoratívna pergola", price: pergola ? CENY.pergola : 0, section: "kluc", selected: pergola });
    
    // Dokumentácia
    items.push({ name: "Inžiniering stavebného povolenia", price: inziniering ? CENY.inziniering : 0, section: "docs", selected: inziniering });
    items.push({ name: "Projektant a certifikácia A0", price: projektA0 ? CENY.projektA0 : 0, section: "docs", selected: projektA0 });
    items.push({ name: "Revízna dokumentácia", price: revizna ? CENY.revizna : 0, section: "docs", selected: revizna });
    items.push({ name: "Doprava", price: doprava ? CENY.doprava : 0, section: "docs", selected: doprava });
    
    return items;
  }, [montazHolodomu, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, pripojkaSiete, vstupneDvere,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, povrchokaOkien,
      tonovaneSkla, vonkajsiaFasada, interierFinis, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, pergola, inziniering, projektA0, revizna, doprava]);

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
    setVonkajsiaFasada("standard");
    setPovrchokaOkien(false);
    setVnutornePodlahy(false);
    setPodlahovVykurovanie(false);
    setPergola(false);
    setInterieroveDvere(0);
    setTonovaneSkla(false);
    setDoprava(false);
    setRevizna(true); // Ponechať zapnutú aj po resete
    setStresneOkno(0);
    setBocneOknoFixne(0);
    setBocneOknoVyklopne90(0);
    setBocneOknoVyklopne55(0);
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
            Fáza {step}
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
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ring-2 ring-green-500/30">
            <div className="p-3 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Vaša konfigurácia</p>
                  <h3 className="text-base font-bold text-white">Flat Double 142m²</h3>
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
            <div className="px-2 py-1.5">
              {selectedItems.map((item, index) => {
                const isBase = item.section === "base";
                const prevItem = selectedItems[index - 1];
                const showHrubaDivider = item.section === "hruba" && (!prevItem || prevItem.section === "base");
                const showHolodomDivider = item.section === "holodom" && prevItem?.section === "hruba";
                const showKlucDivider = item.section === "kluc" && prevItem?.section === "holodom";
                const showDocsDivider = item.section === "docs" && prevItem?.section === "kluc";

                return (
                  <React.Fragment key={index}>
                    {showHrubaDivider && (
                      <div className="py-1">
                        <div className="border-t border-amber-500/50"></div>
                        <div className="flex items-center gap-1.5 px-1 pt-1">
                          <Package className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Hrubá stavba</span>
                        </div>
                      </div>
                    )}
                    {showHolodomDivider && (
                      <div className="py-1">
                        <div className="border-t border-blue-500/50"></div>
                        <div className="flex items-center gap-1.5 px-1 pt-1">
                          <Hammer className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Holodom</span>
                        </div>
                      </div>
                    )}
                    {showKlucDivider && (
                      <div className="py-1">
                        <div className="border-t border-emerald-500/50"></div>
                        <div className="flex items-center gap-1.5 px-1 pt-1">
                          <Key className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Dom na kľúč</span>
                        </div>
                      </div>
                    )}
                    {showDocsDivider && (
                      <div className="py-1">
                        <div className="border-t border-purple-500/50"></div>
                        <div className="flex items-center gap-1.5 px-1 pt-1">
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Dokumentácia</span>
                        </div>
                      </div>
                    )}
                    <div className={`flex justify-between items-center py-1 px-1.5 rounded text-xs ${isBase ? 'bg-blue-500/20 border border-blue-500/30 my-0.5' : item.selected ? 'hover:bg-slate-700/50' : 'opacity-40'}`}>
                      <span className={`${isBase ? 'text-blue-300 font-bold text-sm' : item.selected ? 'text-slate-300 font-medium' : 'text-slate-500 line-through'} flex-1 pr-2 truncate`}>{item.name}</span>
                      <span className={`${isBase ? 'text-blue-300 text-sm' : item.selected ? 'text-green-400' : 'text-slate-500'} font-bold whitespace-nowrap`}>
                        {item.selected ? formatPrice(item.price) : '—'}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Celková cena */}
            <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-t border-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Celkom s DPH</span>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
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
                    Mám záujem
                  </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleReset}
                  className="w-full border-slate-600 text-slate-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all text-xs h-7"
                >
                  <RotateCcw className="mr-1.5 w-3 h-3" />
                  Resetovať
                </Button>
              </div>
            </div>
          </Card>
          </div>
          );
          }

  return (
    <div className="mt-8 relative">
      {/* Flying animations container */}
      <FlyingAnimationContainer animations={animations} />

      <div>
      <div className="space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 2: HOLODOM (Montáž, Inštalácie, Okná/Dvere)
          ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-blue-200/50 hover:ring-2 hover:ring-blue-300/70 transition-all duration-300">
        <SectionHeader 
          icon={Hammer} 
          title="Holodom" 
          subtitle="Montáž konštrukcie a technické inštalácie"
          color="from-blue-600 to-indigo-600"
          step="2"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-blue-50/50 to-white">
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Interiér finiš - skupina */}
            <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-2 sm:gap-3 p-2 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50/50">
              <p className="col-span-3 text-[10px] sm:text-xs font-semibold text-gray-600 -mb-1">Interiér finiš (vyberte jednu)</p>
              <Tile
                selected={interierFinis === "ziadne"}
                onClick={() => setInterierFinis("ziadne")}
                icon={Home}
                iconColor="text-gray-400"
                iconSelectedColor="text-blue-600"
                title="Bez interiéru"
                subtitle="Hrubá stavba"
                price="+ 0 €"
                isPriced={false}
                tooltip="Interiér zostane v stave hrubej stavby bez obkladov a omietok."
              />

              <Tile
                selected={interierFinis === "drevo"}
                onClick={(e) => { if (interierFinis !== "drevo") triggerAnimation("drevo", e.currentTarget); setInterierFinis("drevo"); }}
                icon={Home}
                iconColor="text-amber-600"
                iconSelectedColor="text-blue-600"
                title="Drevo"
                subtitle="Obloženie"
                price="+ 16 400 €"
                isPriced={true}
                tooltip="Drevené obloženie stien a stropov. Prírodný vzhľad a tepelná pohoda."
              />

              <Tile
                selected={interierFinis === "sadrokarton"}
                onClick={(e) => { if (interierFinis !== "sadrokarton") triggerAnimation("sadrokarton", e.currentTarget); setInterierFinis("sadrokarton"); }}
                icon={Home}
                iconColor="text-gray-500"
                iconSelectedColor="text-blue-600"
                title="Sadrokartón"
                subtitle="Omietka"
                price="+ 19 475 €"
                isPriced={true}
                tooltip="Sadrokartónové steny s hladkou omietkou. Klasický vzhľad interiéru."
              />
            </div>

            <Tile
              selected={elektroinstalacia}
              onClick={(e) => { if (!elektroinstalacia) triggerAnimation("elektro", e.currentTarget); setElektroinstalacia(!elektroinstalacia); }}
              icon={Zap}
              iconColor="text-yellow-400"
              iconSelectedColor="text-yellow-600"
              title="Elektro"
              subtitle="Rozvody"
              price="+ 7 400 €"
              isPriced={true}
              selectedBg="bg-yellow-100"
              selectedBorder="border-yellow-500"
              selectedRing="ring-yellow-300"
              hoverBorder="hover:border-yellow-300"
              tooltip="Elektrické rozvody, rozvádzač, zásuvky a príprava pre osvetlenie."
            />

            <Tile
              selected={vodaKanalizacia}
              onClick={(e) => { if (!vodaKanalizacia) triggerAnimation("voda", e.currentTarget); setVodaKanalizacia(!vodaKanalizacia); }}
              icon={Droplets}
              iconColor="text-blue-400"
              iconSelectedColor="text-blue-600"
              title="Voda"
              subtitle="Rozvody"
              price="+ 2 380 €"
              isPriced={true}
              tooltip="Rozvody studenej a teplej vody, kanalizačné potrubia."
            />

            <Tile
              selected={sanitaKomplet}
              onClick={(e) => { if (!sanitaKomplet) triggerAnimation("sanita", e.currentTarget); setSanitaKomplet(!sanitaKomplet); }}
              icon={ShowerHead}
              iconColor="text-blue-400"
              iconSelectedColor="text-blue-600"
              title="Sanita"
              subtitle="Komplet"
              price="+ 1 169 €"
              isPriced={true}
              tooltip="Kompletná sanita: sprchový kút, umývadlo a WC."
            />

            <Tile
              selected={bojler}
              onClick={(e) => { if (!bojler) triggerAnimation("bojler", e.currentTarget); setBojler(!bojler); }}
              icon={Flame}
              iconColor="text-orange-400"
              iconSelectedColor="text-orange-600"
              title="Bojler"
              subtitle="Elektrický"
              price="+ 246 €"
              isPriced={true}
              selectedBg="bg-orange-100"
              selectedBorder="border-orange-500"
              selectedRing="ring-orange-300"
              hoverBorder="hover:border-orange-300"
              tooltip="Elektrický bojler na ohrev pitnej vody."
            />

            <Tile
              selected={tepelneCerpadlo}
              onClick={(e) => { if (!tepelneCerpadlo) triggerAnimation("klimatizacia", e.currentTarget); setTepelneCerpadlo(!tepelneCerpadlo); }}
              icon={ThermometerSun}
              iconColor="text-red-500"
              iconSelectedColor="text-green-600"
              title="Tep. čerpadlo"
              subtitle="5 jednotiek"
              price="+ 5 535 €"
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
              tooltip="Tepelné čerpadlo vzduch-vzduch: 1× vonkajšia + 5× vnútorná jednotka. Potrebné pre A0."
            />

            <Tile
              selected={rekuperacia}
              onClick={(e) => { if (!rekuperacia) triggerAnimation("rekuperacia", e.currentTarget); setRekuperacia(!rekuperacia); }}
              icon={Wind}
              iconColor="text-cyan-500"
              iconSelectedColor="text-green-600"
              title="Rekuperácia"
              subtitle="5 jednotiek"
              price="+ 2 700 €"
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
              tooltip="5 kusov lokálnych rekuperačných jednotiek pre riadené vetranie. Potrebné pre A0."
            />

            <Tile
              selected={pripojkaSiete}
              onClick={(e) => { if (!pripojkaSiete) triggerAnimation("siete", e.currentTarget); setPripojkaSiete(!pripojkaSiete); }}
              icon={Cable}
              iconColor="text-gray-400"
              iconSelectedColor="text-gray-700"
              title="Siete"
              subtitle="Pripojenie"
              price="+ 1 501 €"
              isPriced={true}
              selectedBg="bg-gray-200"
              selectedBorder="border-gray-500"
              selectedRing="ring-gray-300"
              hoverBorder="hover:border-gray-400"
              tooltip="Pripojenie na inžinierske siete: elektrika, voda, kanalizácia."
            />

            <Tile
              selected={povrchokaOkien}
              onClick={(e) => { if (!povrchokaOkien) triggerAnimation("oknoAntracit", e.currentTarget); setPovrchokaOkien(!povrchokaOkien); }}
              icon={Square}
              iconColor="text-slate-400"
              iconSelectedColor="text-slate-700"
              title="Laminácia"
              subtitle="Antracit"
              price="+ 3 100 €"
              isPriced={true}
              selectedBg="bg-slate-200"
              selectedBorder="border-slate-600"
              selectedRing="ring-slate-300"
              hoverBorder="hover:border-slate-400"
              tooltip="Antracitová laminácia všetkých okien a dverí pre moderný vzhľad."
            />

            <Tile
              selected={tonovaneSkla}
              onClick={(e) => { if (!tonovaneSkla) triggerAnimation("oknoTonovane", e.currentTarget); setTonovaneSkla(!tonovaneSkla); }}
              icon={Sun}
              iconColor="text-amber-400"
              iconSelectedColor="text-amber-600"
              title="Tónované"
              subtitle="Solar sklá"
              price="+ 1 300 €"
              isPriced={true}
              selectedBg="bg-amber-100"
              selectedBorder="border-amber-500"
              selectedRing="ring-amber-300"
              hoverBorder="hover:border-amber-300"
              tooltip="Tónované sklá s ochranou proti slnku. Znižujú prehrievanie interiéru."
            />

          </div>

          {/* Sekcia s počtami - Dvere a Okná */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-xs sm:text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" />
              Vstupné dvere
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "ziadne", label: "Štandard", price: "0 €" },
                { value: "kovove", label: "Kovové", price: "+ 720 €" },
                { value: "plastove", label: "Plastové", price: "+ 660 €" }
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
              Doplnkové okná
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { state: stresneOkno, setter: setStresneOkno, label: "Strešné", price: "760 €" },
                { state: bocneOknoFixne, setter: setBocneOknoFixne, label: "Fixné 90×205", price: "501 €" },
                { state: bocneOknoVyklopne90, setter: setBocneOknoVyklopne90, label: "Výkl. 90×205", price: "540 €" },
                { state: bocneOknoVyklopne55, setter: setBocneOknoVyklopne55, label: "Výkl. 55×90", price: "225 €" }
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
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 3: DOM NA KĽÚČ (Interiér, Podlahy, Fasáda, Dokončenie)
          ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-emerald-200/50 hover:ring-2 hover:ring-emerald-300/70 transition-all duration-300">
        <SectionHeader 
          icon={Key} 
          title="Dom na kľúč" 
          subtitle="Interiérové úpravy a dokončovacie práce"
          color="from-emerald-600 to-teal-600"
          step="3"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-emerald-50/50 to-white">
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Fasáda - skupina */}
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-2 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50/50">
              <p className="col-span-2 text-[10px] sm:text-xs font-semibold text-gray-600 -mb-1">Fasáda (vyberte jednu)</p>
              <Tile
                selected={vonkajsiaFasada === "standard"}
                onClick={() => setVonkajsiaFasada("standard")}
                icon={Paintbrush}
                iconColor="text-gray-400"
                iconSelectedColor="text-emerald-600"
                title="Fasáda štd."
                subtitle="Drevo/Plech"
                price="+ 0 €"
                isPriced={false}
                selectedBg="bg-emerald-100"
                selectedBorder="border-emerald-500"
                selectedRing="ring-emerald-300"
                hoverBorder="hover:border-emerald-300"
                tooltip="Štandardná fasáda z dreva alebo falcovaného plechu podľa modelu."
              />

              <Tile
                selected={vonkajsiaFasada === "suchana"}
                onClick={(e) => { if (vonkajsiaFasada !== "suchana") triggerAnimation("fasadaSuchana", e.currentTarget); setVonkajsiaFasada("suchana"); }}
                icon={Paintbrush}
                iconColor="text-orange-400"
                iconSelectedColor="text-emerald-600"
                title="Škúchaná"
                subtitle="Biela omietka"
                price="+ 12 841 €"
                isPriced={true}
                selectedBg="bg-emerald-100"
                selectedBorder="border-emerald-500"
                selectedRing="ring-emerald-300"
                hoverBorder="hover:border-emerald-300"
                tooltip="Škúchaná omietková fasáda v bielej farbe pre tradičný vzhľad rodinného domu."
              />
            </div>

            <Tile
              selected={vnutornePodlahy}
              onClick={(e) => { if (!vnutornePodlahy) triggerAnimation("podlaha", e.currentTarget); setVnutornePodlahy(!vnutornePodlahy); }}
              icon={Square}
              iconColor="text-amber-500"
              iconSelectedColor="text-emerald-600"
              title="Podlahy"
              subtitle="Laminát"
              price="+ 3 351 €"
              isPriced={true}
              selectedBg="bg-emerald-100"
              selectedBorder="border-emerald-500"
              selectedRing="ring-emerald-300"
              hoverBorder="hover:border-emerald-300"
              tooltip="Laminátové podlahy vo všetkých obytných miestnostiach."
            />

            <Tile
              selected={podlahovVykurovanie}
              onClick={(e) => { if (!podlahovVykurovanie) triggerAnimation("podlahovVykurovanie", e.currentTarget); setPodlahovVykurovanie(!podlahovVykurovanie); }}
              icon={Flame}
              iconColor="text-orange-400"
              iconSelectedColor="text-orange-600"
              title="Podl. kúrenie"
              subtitle="WiFi termostat"
              price="+ 5 525 €"
              isPriced={true}
              selectedBg="bg-orange-100"
              selectedBorder="border-orange-500"
              selectedRing="ring-orange-300"
              hoverBorder="hover:border-orange-300"
              tooltip="Elektrické podlahové vykurovanie s WiFi termostatom v každej izbe (8-9 ks). Zahŕňa fóliu, izoláciu a inštaláciu."
            />

            <Tile
              selected={pergola}
              onClick={(e) => { if (!pergola) triggerAnimation("pergola", e.currentTarget); setPergola(!pergola); }}
              icon={Maximize}
              iconColor="text-teal-400"
              iconSelectedColor="text-emerald-600"
              title="Pergola"
              subtitle="Dekoratívna"
              price="+ 1 845 €"
              isPriced={true}
              selectedBg="bg-emerald-100"
              selectedBorder="border-emerald-500"
              selectedRing="ring-emerald-300"
              hoverBorder="hover:border-emerald-300"
              tooltip="Dekoratívna drevená pergola pri vstupe alebo terase."
            />

          </div>

          {/* Interiérové dvere - počet */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                <div>
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm">Interiérové dvere</span>
                  <span className="text-green-600 font-bold text-xs ml-2">× 250 €</span>
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
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
          FÁZA 4: DOKUMENTÁCIA A DOPRAVA
          ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        >
        <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-purple-200/50 hover:ring-2 hover:ring-purple-300/70 transition-all duration-300">
        <SectionHeader 
          icon={FileText} 
          title="Dokumentácia a služby" 
          subtitle="Projektová dokumentácia, povolenia a doprava"
          color="from-purple-600 to-violet-600"
          step="4"
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
              title="Inžiniering"
              subtitle="Stav. povolenie"
              price="+ 2 592 €"
              isPriced={true}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip="Vybavenie stavebného povolenia vrátane všetkých potrebných dokumentov."
            />

            <Tile
              selected={projektA0}
              onClick={(e) => { if (!projektA0) triggerAnimation("projektant", e.currentTarget); setProjektA0(!projektA0); }}
              icon={FileCheck}
              iconColor="text-green-500"
              iconSelectedColor="text-green-600"
              title="Projektant"
              subtitle="+ Certifikácia"
              price="+ 3 500 €"
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
              tooltip="Projektová dokumentácia a certifikácia pre energetickú triedu A0."
            />

            <Tile
              selected={revizna}
              onClick={() => setRevizna(!revizna)}
              icon={FileText}
              iconColor="text-gray-400"
              iconSelectedColor="text-purple-600"
              title="Revízie"
              subtitle="Dokumentácia"
              price="+ 1 000 €"
              isPriced={true}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip="Revízne správy elektroinštalácie, plynu a ďalších systémov."
            />

            <Tile
              selected={doprava}
              onClick={(e) => { if (!doprava) triggerAnimation("doprava", e.currentTarget); setDoprava(!doprava); }}
              icon={Truck}
              iconColor="text-purple-400"
              iconSelectedColor="text-purple-600"
              title="Doprava"
              subtitle="Transport"
              price="+ 0 €"
              isPriced={false}
              selectedBg="bg-purple-100"
              selectedBorder="border-purple-500"
              selectedRing="ring-purple-300"
              hoverBorder="hover:border-purple-300"
              tooltip="Transport stavebného materiálu na miesto stavby."
            />

          </div>

          {/* A0 Upozornenie */}
          {a0Odporucania && (
            <div className="mt-4 p-3 sm:p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-1 text-xs sm:text-sm">Pre A0 odporúčame:</p>
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
                <p className="font-bold text-green-800 text-xs sm:text-sm">Konfigurácia spĺňa A0!</p>
              </div>
            </div>
          )}

        </div>
        </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════
          FINÁLNY CENOVÝ SÚHRN
          ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        >
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ring-2 ring-green-500/30">
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
                <p className="text-green-400 text-[10px] sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">Vaša konfigurácia</p>
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Flat Double 142m²</h3>
                <p className="text-slate-400 text-xs sm:text-base mb-4">Kompletná cenová kalkulácia</p>
                {projektA0 && !a0Odporucania && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-sm py-1 sm:py-1.5 px-2 sm:px-4 shadow-lg shadow-green-500/30">✓ Spĺňa A0</Badge>
                )}
                
                {/* Zoznam vybraných položiek */}
                <div className="mt-4 sm:mt-6 bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50 max-h-[300px] overflow-y-auto">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Vybrané položky</p>
                  <div className="space-y-1">
                    {selectedItems.map((item, index) => {
                      const isBase = item.section === "base";
                      const prevItem = selectedItems[index - 1];
                      const showHrubaDivider = item.section === "hruba" && (!prevItem || prevItem.section === "base");
                      const showHolodomDivider = item.section === "holodom" && prevItem?.section === "hruba";
                      const showKlucDivider = item.section === "kluc" && prevItem?.section === "holodom";
                      const showDocsDivider = item.section === "docs" && prevItem?.section === "kluc";
                      
                      return (
                        <React.Fragment key={index}>
                          {showHrubaDivider && dosiahnuteUrovne.hrubaStavba && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">Hrubá stavba</span>
                              </div>
                            </div>
                          )}
                          {showHolodomDivider && dosiahnuteUrovne.holodom && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Hammer className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">Holodom</span>
                              </div>
                            </div>
                          )}
                          {showKlucDivider && dosiahnuteUrovne.domNaKluc && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <Key className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">Dom na kľúč</span>
                              </div>
                            </div>
                          )}
                          {showDocsDivider && (
                            <div className="py-1.5">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-wider">Dokumentácia</span>
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
                <p className="text-slate-400 mb-1 sm:mb-2 text-[10px] sm:text-sm">Celková cena s DPH</p>
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
                Mám záujem o túto konfiguráciu
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
      </motion.div>
      </div>
      </div>
    </div>
  );
}