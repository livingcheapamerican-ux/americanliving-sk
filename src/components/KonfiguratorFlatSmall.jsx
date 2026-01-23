import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, AlertTriangle, Check, RotateCcw,
  Wrench, Plug, Droplets, ThermometerSun, Wind, Landmark, FileText,
  Zap, ShowerHead, Flame, Cable, Paintbrush, Home, Truck, Sun, DoorOpen,
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle, TreePine, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import KonfiguratorContactModal from "./KonfiguratorContactModal";
import { useLanguage } from "./LanguageContext";
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";

import FloatingPrice from "./FloatingPrice";
import { base44 } from "@/api/base44Client";
import EditableTile from "./EditableTile";
import { useQuery } from "@tanstack/react-query";

// Konštantné mapovanie farieb pre sekcie - predchádza blikaniu
const SECTION_COLORS = {
  "2": "from-blue-600 to-indigo-600",
  "3": "from-emerald-600 to-teal-600",
  "4": "from-purple-600 to-violet-600"
};

// Dlaždica s tooltip a malou fajkou v rohu
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-blue-100", selectedBorder = "border-blue-500", selectedRing = "ring-blue-300", hoverBorder = "hover:border-blue-300" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tileRef = useRef(null);

  const updateTooltipPosition = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 256;
      const tooltipHeight = 80;
      
      const tileCenter = rect.left + rect.width / 2;
      const left = Math.min(Math.max(tileCenter, tooltipWidth / 2 + 10), window.innerWidth - tooltipWidth / 2 - 10);
      
      let top;
      if (rect.bottom + tooltipHeight + 20 < viewportHeight) {
        top = rect.bottom + 10;
      } else {
        top = Math.max(rect.top - tooltipHeight - 10, 10);
      }
      
      setTooltipPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      updateTooltipPosition();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }, 2000);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

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

      {showTooltip && tooltip && ReactDOM.createPortal(
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="fixed z-[9999] max-w-[85vw] w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
          style={{
            top: tooltipPosition.top + 'px',
            left: tooltipPosition.left + 'px',
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip}
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
};

export default function KonfiguratorFlatSmall({ 
  dom,
  onReset,
  onConfigChange,
  predajNehnutelnosti, setPredajNehnutelnosti,
  hladaniePozemku, setHladaniePozemku,
  financneSluzby, setFinancneSluzby,
  typStavby = "",
  setTypStavby,
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
  showOnlyPhase = null
}) {
  const BASE_PRICE = dom?.zakladna_cena || 19500;
  const { t, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const handlePriceChange = async (priceKey, newPrice) => {
    try {
      const response = await base44.functions.invoke('updateProstoHousePrice', {
        dom_id: dom.id,
        price_key: priceKey,
        new_price: newPrice
      });
      
      if (response?.data?.success) {
        alert('Cena aktualizovaná - obnovujem stránku...');
        setTimeout(() => window.location.reload(), 300);
      } else {
        throw new Error(response?.data?.error || 'Neznáma chyba');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Chyba pri ukladaní ceny: ' + error.message);
    }
  };

  // DEFAULT ceny (Flat Small - z databázy)
  const DEFAULT_CENY = {
    montaz: { nie: 0, ano: 4875 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 1400, premium: 2800, ultra: 5250 },
    elektroinstalacia: 2300,
    vodaKanalizacia: 980,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 600,
    rekuperacia: 1105,
    zaklady: { bez: 0, skrutky: 2808, doska: 6000, pasove: 5000 },
    pripojkaSiete: 1501,
    inziniering: 2590,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 3800, sadrokarton: 4414 },
    vonkajsiaFasada: { standard: 0, suchana: 4742 },
    povrchokaOkien: 750,
    vnutornePodlahy: 840,
    podlahovVykurovanie: 2819,
    interieroveDvere: 250,
    tonovaneSkla: 340,
    doprava: 0,
    revizna: 500,
    stresneOkno: 760,
    bocneOknoFixne: 500,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
  };

  const customCeny = dom?.konfigurator_custom_ceny_prosto_house || {};
  const getPrice = (key) => {
    if (customCeny[key] !== undefined && customCeny[key] !== null) {
      return customCeny[key];
    }
    return DEFAULT_CENY[key];
  };

  const CENY = {
    montaz: { nie: 0, ano: getPrice('montaz') ?? DEFAULT_CENY.montaz.ano },
    dvere: { 
      ziadne: 0, 
      kovove: getPrice('dvere_kovove') ?? DEFAULT_CENY.dvere.kovove, 
      plastove: getPrice('dvere_plastove') ?? DEFAULT_CENY.dvere.plastove 
    },
    izolacia: { 
      standard: 0, 
      zvysena: getPrice('izolacia_zvysena') ?? DEFAULT_CENY.izolacia.zvysena, 
      premium: getPrice('izolacia_premium') ?? DEFAULT_CENY.izolacia.premium,
      ultra: getPrice('izolacia_extra') ?? DEFAULT_CENY.izolacia.ultra 
    },
    elektroinstalacia: getPrice('elektroinstalacia') ?? DEFAULT_CENY.elektroinstalacia,
    vodaKanalizacia: getPrice('voda') ?? DEFAULT_CENY.vodaKanalizacia,
    sanitaKomplet: getPrice('sanita') ?? DEFAULT_CENY.sanitaKomplet,
    bojler: getPrice('bojler') ?? DEFAULT_CENY.bojler,
    tepelneCerpadlo: getPrice('tepelne_cerpadlo') ?? DEFAULT_CENY.tepelneCerpadlo,
    rekuperacia: getPrice('rekuperacia') ?? DEFAULT_CENY.rekuperacia,
    zaklady: { 
      bez: 0, 
      skrutky: getPrice('zaklady_vruty') ?? DEFAULT_CENY.zaklady.skrutky, 
      doska: getPrice('zaklady_doska') ?? DEFAULT_CENY.zaklady.doska, 
      pasove: getPrice('zaklady_pasove') ?? DEFAULT_CENY.zaklady.pasove 
    },
    pripojkaSiete: getPrice('siete') ?? DEFAULT_CENY.pripojkaSiete,
    inziniering: getPrice('inziniering') ?? DEFAULT_CENY.inziniering,
    projektA0: getPrice('projektACertifikacia') ?? DEFAULT_CENY.projektA0,
    interierFinis: { 
      ziadne: 0, 
      drevo: getPrice('interier_drevo') ?? DEFAULT_CENY.interierFinis.drevo, 
      sadrokarton: getPrice('interier_sadrokarton') ?? DEFAULT_CENY.interierFinis.sadrokarton 
    },
    vonkajsiaFasada: { 
      standard: 0, 
      suchana: getPrice('fasada_omietka') ?? DEFAULT_CENY.vonkajsiaFasada.suchana 
    },
    povrchokaOkien: getPrice('laminacia_okien') ?? DEFAULT_CENY.povrchokaOkien,
    vnutornePodlahy: getPrice('podlahy_laminat') ?? DEFAULT_CENY.vnutornePodlahy,
    podlahovVykurovanie: getPrice('podlahove_kurenie') ?? DEFAULT_CENY.podlahovVykurovanie,
    interieroveDvere: DEFAULT_CENY.interieroveDvere,
    tonovaneSkla: getPrice('tonovanie_skla') ?? DEFAULT_CENY.tonovaneSkla,
    doprava: getPrice('doprava') ?? DEFAULT_CENY.doprava,
    revizna: getPrice('revizia') ?? DEFAULT_CENY.revizna,
    stresneOkno: getPrice('stresne_okno') ?? DEFAULT_CENY.stresneOkno,
    bocneOknoFixne: getPrice('okno_fix_90_205') ?? DEFAULT_CENY.bocneOknoFixne,
    bocneOknoVyklopne90: getPrice('okno_vyklopne_90_205') ?? DEFAULT_CENY.bocneOknoVyklopne90,
    bocneOknoVyklopne55: getPrice('okno_vyklopne_55_90') ?? DEFAULT_CENY.bocneOknoVyklopne55
  };

  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;

    total += CENY.montaz[montazHolodomu] || 0;
    total += CENY.dvere[vstupneDvere] || 0;
    total += CENY.izolacia[izolaciaNavysenie] || 0;
    
    if (elektroinstalacia) total += CENY.elektroinstalacia;
    if (vodaKanalizacia) total += CENY.vodaKanalizacia;
    if (sanitaKomplet) total += CENY.sanitaKomplet;
    if (bojler) total += CENY.bojler;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    
    total += CENY.zaklady[zaklady] || 0;
    if (pripojkaSiete) total += CENY.pripojkaSiete;
    
    if (inziniering) total += CENY.inziniering;
    if (projektA0) total += CENY.projektA0;
    
    total += CENY.interierFinis[interierFinis] || 0;
    total += CENY.vonkajsiaFasada[vonkajsiaFasada] || 0;
    if (povrchokaOkien) total += CENY.povrchokaOkien;
    if (vnutornePodlahy) total += CENY.vnutornePodlahy;
    if (podlahovVykurovanie) total += CENY.podlahovVykurovanie;
    total += interieroveDvere * CENY.interieroveDvere;
    if (tonovaneSkla) total += CENY.tonovaneSkla;
    if (doprava) total += CENY.doprava;
    if (revizna) total += CENY.revizna;
    
    total += stresneOkno * CENY.stresneOkno;
    total += bocneOknoFixne * CENY.bocneOknoFixne;
    total += bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90;
    total += bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55;
    
    return total;
  }, [montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, zaklady, pripojkaSiete, 
      inziniering, projektA0, interierFinis, vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, 
      podlahovVykurovanie, interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE]);

  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium" && izolaciaNavysenie !== "ultra") chybajuce.push("Premium alebo Ultra izolácia (250mm alebo 300mm)");
    if (!tepelneCerpadlo) chybajuce.push("Tepelné čerpadlo / Klimatizácia");
    if (!rekuperacia) chybajuce.push("Rekuperácia");
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('sk-SK') + " €";
  };

  const dosiahnuteUrovne = useMemo(() => {
    const hrubaStavba = montazHolodomu === "ano" || izolaciaNavysenie !== "standard" || zaklady !== "bez";
    const holodom = hrubaStavba && (elektroinstalacia || vodaKanalizacia || tepelneCerpadlo || rekuperacia);
    const domNaKluc = holodom && (interierFinis !== "ziadne" || vnutornePodlahy || vonkajsiaFasada === "suchana");
    
    return { hrubaStavba, holodom, domNaKluc };
  }, [montazHolodomu, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      tepelneCerpadlo, rekuperacia, interierFinis, vnutornePodlahy, vonkajsiaFasada]);

  const selectedItems = useMemo(() => {
    const items = [];
    
    items.push({ name: t('basePriceKit'), price: BASE_PRICE, section: "base", selected: true });
    
    if (predajNehnutelnosti) items.push({ name: t('sellPreviousProperty'), price: 0, section: "services", selected: true });
    if (hladaniePozemku) items.push({ name: t('wantLandForHouse'), price: 0, section: "services", selected: true });
    if (financneSluzby) items.push({ name: t('financialServicesLoans'), price: 0, section: "services", selected: true });
    
    items.push({ name: t('shellAssembly'), price: montazHolodomu === "ano" ? CENY.montaz.ano : 0, section: "hruba", selected: montazHolodomu === "ano" });
    
    const izolaciaLabel = izolaciaNavysenie === "ultra" ? "Ultra 300mm" : izolaciaNavysenie === "premium" ? "250/300mm" : izolaciaNavysenie === "zvysena" ? "200/250mm" : "150/200mm";
    const izolaciaPrice = izolaciaNavysenie === "ultra" ? 5250 : izolaciaNavysenie === "premium" ? 2800 : izolaciaNavysenie === "zvysena" ? 1400 : 0;
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standard" });
    
    const zakladyLabel = zaklady === "pasove" ? t('foundationsStrip') : zaklady === "doska" ? t('foundationsSlab') : zaklady === "skrutky" ? "Pilóty/Pätky" : t('foundationsLabel');
    const zakladyPrice = zaklady === "pasove" ? CENY.zaklady.pasove : zaklady === "doska" ? CENY.zaklady.doska : zaklady === "skrutky" ? CENY.zaklady.skrutky : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
    const interierLabel = interierFinis === "drevo" ? "Obklad drevom" : interierFinis === "sadrokarton" ? "Sadrokartón" : t('interiorFinish');
    const interierPrice = interierFinis === "drevo" ? CENY.interierFinis.drevo : interierFinis === "sadrokarton" ? CENY.interierFinis.sadrokarton : 0;
    items.push({ name: interierLabel, price: interierPrice, section: "holodom", selected: interierFinis !== "ziadne" });

    items.push({ name: t('electricalFull'), price: elektroinstalacia ? CENY.elektroinstalacia : 0, section: "holodom", selected: elektroinstalacia });
    items.push({ name: "Voda a kanalizácia", price: vodaKanalizacia ? CENY.vodaKanalizacia : 0, section: "holodom", selected: vodaKanalizacia });
    items.push({ name: "Sanita komplet", price: sanitaKomplet ? CENY.sanitaKomplet : 0, section: "holodom", selected: sanitaKomplet });
    items.push({ name: t('boiler'), price: bojler ? CENY.bojler : 0, section: "holodom", selected: bojler });
    items.push({ name: "Tepelné čerpadlo / Klimatizácia", price: tepelneCerpadlo ? CENY.tepelneCerpadlo : 0, section: "holodom", selected: tepelneCerpadlo });
    items.push({ name: t('recuperation'), price: rekuperacia ? CENY.rekuperacia : 0, section: "holodom", selected: rekuperacia });
    items.push({ name: "Pripojenie na inžinierske siete", price: pripojkaSiete ? CENY.pripojkaSiete : 0, section: "holodom", selected: pripojkaSiete });
    
    const dvereLabel = vstupneDvere === "kovove" ? "Kovové dvere s 2 zámkami" : vstupneDvere === "plastove" ? "Plastovo-kovové dvere" : t('doorStandard');
    const dverePrice = vstupneDvere === "kovove" ? CENY.dvere.kovove : vstupneDvere === "plastove" ? CENY.dvere.plastove : 0;
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: vstupneDvere !== "ziadne" });
    
    if (stresneOkno > 0) items.push({ name: `${t('roofWindow')} (${stresneOkno}×)`, price: stresneOkno * CENY.stresneOkno, section: "holodom", selected: true });
    if (bocneOknoFixne > 0) items.push({ name: `Fixné okno 90×205 (${bocneOknoFixne}×)`, price: bocneOknoFixne * CENY.bocneOknoFixne, section: "holodom", selected: true });
    if (bocneOknoVyklopne90 > 0) items.push({ name: `Vyklopné okno 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90, section: "holodom", selected: true });
    if (bocneOknoVyklopne55 > 0) items.push({ name: `Vyklopné okno 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55, section: "holodom", selected: true });
    items.push({ name: "Povrchová úprava okien - Antracit", price: povrchokaOkien ? CENY.povrchokaOkien : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: t('tintedGlass') + " (Solar)", price: tonovaneSkla ? CENY.tonovaneSkla : 0, section: "holodom", selected: tonovaneSkla });
    
    const fasadaLabel = vonkajsiaFasada === "suchana" ? "Šúchaná fasáda - individuálne" : "Drevo / Falcovaný plech";
    const fasadaPrice = vonkajsiaFasada === "suchana" ? CENY.vonkajsiaFasada.suchana : 0;
    items.push({ name: fasadaLabel, price: fasadaPrice, section: "kluc", selected: true });

    items.push({ name: "Vnútorné podlahy - laminát", price: vnutornePodlahy ? CENY.vnutornePodlahy : 0, section: "kluc", selected: vnutornePodlahy });
    items.push({ name: "Elektrické podlahové vykurovanie s WIFI", price: podlahovVykurovanie ? CENY.podlahovVykurovanie : 0, section: "kluc", selected: podlahovVykurovanie });
    items.push({ name: `${t('interiorDoors')} (${interieroveDvere}×)`, price: interieroveDvere * CENY.interieroveDvere, section: "kluc", selected: interieroveDvere > 0 });
    
    items.push({ name: "Inžiniering stavebného povolenia", price: inziniering ? CENY.inziniering : 0, section: "docs", selected: inziniering });
    items.push({ name: "Projektant, Energetická certifikácia", price: projektA0 ? CENY.projektA0 : 0, section: "docs", selected: projektA0 });
    items.push({ name: "Kompletná revízna dokumentácia", price: revizna ? CENY.revizna : 0, section: "docs", selected: revizna });
    items.push({ name: t('transport'), price: doprava ? CENY.doprava : 0, section: "docs", selected: doprava });
    
    return items;
  }, [predajNehnutelnosti, hladaniePozemku, financneSluzby,
      montazHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, zaklady, pripojkaSiete, 
      inziniering, projektA0, interierFinis, vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, 
      podlahovVykurovanie, interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE, CENY, t]);

  const [showContactModal, setShowContactModal] = useState(false);

  // Poslať konfiguráciu do rodičovského komponentu
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        celkovaCena: totalPrice,
        izolaciaNavysenie,
        tepelneCerpadlo,
        rekuperacia,
        projektA0,
        montazHolodomu,
        zaklady
      });
    }
  }, [totalPrice, izolaciaNavysenie, tepelneCerpadlo, rekuperacia, projektA0, montazHolodomu, zaklady, onConfigChange]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      if (setTypStavby) setTypStavby("");
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
      setVonkajsiaFasada("standard");
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

  const SectionHeader = ({ icon: Icon, title, subtitle, step }) => {
    const colorClass = SECTION_COLORS[step] || "from-blue-600 to-indigo-600";
    
    return (
      <div 
        className={`relative flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r ${colorClass} overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/25 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-white/20">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="relative flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
            <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              {t('phase')} {step}
            </span>
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">{subtitle}</p>}
          </div>
          </div>
          );
  };

  const handleSendQuoteFromFloating = async (contactData) => {
    try {
      console.log('=== DEBUG FLAT SMALL SEND QUOTE ===');
      console.log('contactData:', contactData);
      console.log('dom:', dom);
      console.log('selectedItems:', selectedItems);
      console.log('totalPrice:', totalPrice);
      console.log('montazHolodomu:', montazHolodomu);
      console.log('izolaciaNavysenie:', izolaciaNavysenie);
      console.log('zaklady:', zaklady);
      
      const response = await base44.functions.invoke('odosliCenovuPonukuProstoHouse', {
        dom_id: dom?.id,
        klient_meno: contactData.meno,
        klient_email: contactData.email,
        klient_telefon: contactData.telefon,
        klient_adresa: contactData.obec,
        klient_poznamka: contactData.poznamka || '',
        selectedItems: selectedItems,
        totalPrice: totalPrice,
        montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
        elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo,
        rekuperacia, pripojkaSiete, stresneOkno, bocneOknoFixne, bocneOknoVyklopne90,
        bocneOknoVyklopne55, povrchokaOkien, tonovaneSkla, vonkajsiaFasada,
        interierFinis, vnutornePodlahy, podlahovVykurovanie, interieroveDvere,
        pergola, inziniering, projektA0, revizna, doprava, predlzenie: 0,
        predajNehnutelnosti, hladaniePozemku, financneSluzby,
        language: language
      });
      
      console.log('Response z backend funkcie:', response);
      return response;
    } catch (error) {
      console.error('Error in handleSendQuoteFromFloating:', error);
      throw error;
    }
  };

  if (showOnlySummary) {
    return (
      <div>
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 ring-2 ring-green-500/30">
          <div className="p-3 border-b-2 border-slate-300 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-900 text-xs font-bold uppercase tracking-wider mb-0.5">{t('yourConfiguration')}</p>
                <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'Flat Small 41m²'}</h3>
              </div>
            </div>
          </div>

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
                Pošli cenovú ponuku
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

  const showHruba = !showOnlyPhase || showOnlyPhase === "hruba";
  const showHolodom = !showOnlyPhase || showOnlyPhase === "holodom";
  const showKluc = !showOnlyPhase || showOnlyPhase === "kluc";
  const showDocs = !showOnlyPhase || showOnlyPhase === "docs";
  const showFinale = !showOnlyPhase || showOnlyPhase === "finale";

  return (
    <div className="mt-8 relative">
      <FloatingPrice 
        price={totalPrice} 
        isVisible={true} 
        onSendQuote={handleSendQuoteFromFloating}
        dom={dom}
        vyrobca="Prosto House"
        buttonText="Pošli cenovú ponuku"
      />

      <div>
        <div className="space-y-6">

          {showHruba && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border-2 border-amber-300 shadow-lg">
                <SectionHeader 
                  icon={Package} 
                  title={t('phase1')} 
                  subtitle={t('phase1Subtitle')}
                  step="1"
                />
                <div className="p-3 sm:p-6 bg-gradient-to-b from-amber-50/50 to-white">
                  <KonfiguratorFaza1HrubaStavba
                    dom={dom}
                    isAdmin={isAdmin}
                    onPriceUpdate={handlePriceChange}
                    showTooltips={true}
                    initialSelections={{
                      montaz: montazHolodomu === 'ano' ? 'montaz_ano' : montazHolodomu === 'nie' ? 'montaz_nie' : null,
                      izolacia: izolaciaNavysenie === 'standard' ? 'izolacia_standardna' : izolaciaNavysenie === 'zvysena' ? 'izolacia_zvysena' : izolaciaNavysenie === 'premium' ? 'izolacia_premium' : izolaciaNavysenie === 'ultra' ? 'izolacia_extra' : null,
                      zaklady: zaklady === 'bez' ? 'zaklady_bez' : zaklady === 'skrutky' ? 'zaklady_vruty' : zaklady === 'doska' ? 'zaklady_doska' : zaklady === 'pasove' ? 'zaklady_pasove' : null
                    }}
                    onSelectionChange={(selections) => {
                      if (selections.montaz) setMontazHolodomu(selections.montaz === 'montaz_ano' ? 'ano' : 'nie');
                      if (selections.izolacia) {
                        const izolaciaValue = selections.izolacia.replace('izolacia_', '');
                        // Map 'extra' to 'ultra' for consistency
                        setIzolaciaNavysenie(izolaciaValue === 'extra' ? 'ultra' : izolaciaValue === 'standardna' ? 'standard' : izolaciaValue);
                      }
                      if (selections.zaklady) {
                        const zakladyValue = selections.zaklady.replace('zaklady_', '');
                        // Map 'vruty' to 'skrutky' for consistency
                        setZaklady(zakladyValue === 'vruty' ? 'skrutky' : zakladyValue === 'bez' ? 'bez' : zakladyValue);
                      }
                    }}
                  />
                </div>
              </Card>
            </motion.div>
          )}

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
                step="2"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

                  <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-blue-600 rounded-xl bg-blue-100/70 shadow-xl">
                    <p className="col-span-3 text-[9px] sm:text-[10px] font-bold text-blue-700 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">1</span>
                      {t('interiorFinish')} ({t('selectOne')})
                    </p>
                    <EditableTile selected={interierFinis === "ziadne"} onClick={() => setInterierFinis("ziadne")} title={t('interiorNone')} subtitle={t('shellConstruction')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={false} />
                    <EditableTile selected={interierFinis === "drevo"} onClick={() => setInterierFinis("drevo")} title={t('interiorWood')} subtitle={t('woodCladding')} price={`+ ${CENY.interierFinis.drevo.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="interier_drevo" onPriceChange={handlePriceChange} />
                    <EditableTile selected={interierFinis === "sadrokarton"} onClick={() => setInterierFinis("sadrokarton")} title={t('interiorDrywall')} subtitle={t('plaster')} price={`+ ${CENY.interierFinis.sadrokarton.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="interier_sadrokarton" onPriceChange={handlePriceChange} />
                  </div>

                  <div className="col-span-2 sm:col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-yellow-500 rounded-xl bg-yellow-100/70 shadow-xl">
                    <p className="col-span-2 text-[9px] sm:text-[10px] font-bold text-yellow-800 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">2</span>
                      {t('electrical')} & {t('water')}
                    </p>
                    <EditableTile selected={elektroinstalacia} onClick={() => setElektroinstalacia(!elektroinstalacia)} title={t('electrical')} subtitle={t('wiring')} price={`+ ${CENY.elektroinstalacia.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="elektroinstalacia" onPriceChange={handlePriceChange} />
                    <EditableTile selected={vodaKanalizacia} onClick={() => setVodaKanalizacia(!vodaKanalizacia)} title={t('water')} subtitle={t('wiring')} price={`+ ${CENY.vodaKanalizacia.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="voda" onPriceChange={handlePriceChange} />
                    <EditableTile selected={sanitaKomplet} onClick={() => setSanitaKomplet(!sanitaKomplet)} title={t('sanitary')} subtitle={t('complete')} price={`+ ${CENY.sanitaKomplet.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="sanita" onPriceChange={handlePriceChange} />
                    <EditableTile selected={bojler} onClick={() => setBojler(!bojler)} title={t('boiler')} subtitle={t('boilerElectric')} price={`+ ${CENY.bojler.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="bojler" onPriceChange={handlePriceChange} />
                  </div>

                  <div className="col-span-2 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-green-600 rounded-xl bg-green-100/70 shadow-xl">
                    <p className="col-span-2 text-[10px] sm:text-xs font-bold text-green-800 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">3</span>
                      {t('heatPump')} & {t('recuperation')} (A0)
                    </p>
                    <EditableTile selected={tepelneCerpadlo} onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)} title={t('heatPump')} subtitle="1× vonk. / 2× vn." price={`+ ${CENY.tepelneCerpadlo.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="tepelne_cerpadlo" onPriceChange={handlePriceChange} />
                    <EditableTile selected={rekuperacia} onClick={() => setRekuperacia(!rekuperacia)} title={t('recuperation')} subtitle="2 ks" price={`+ ${CENY.rekuperacia.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="rekuperacia" onPriceChange={handlePriceChange} />
                  </div>

                  <EditableTile selected={pripojkaSiete} onClick={() => setPripojkaSiete(!pripojkaSiete)} title={t('gridConnection')} subtitle={t('connection')} price={`+ ${CENY.pripojkaSiete.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="siete" onPriceChange={handlePriceChange} />
                  <EditableTile selected={povrchokaOkien} onClick={() => setPovrchokaOkien(!povrchokaOkien)} title={t('lamination')} subtitle={t('laminationAnthracite')} price={`+ ${CENY.povrchokaOkien.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="laminacia_okien" onPriceChange={handlePriceChange} />
                  <EditableTile selected={tonovaneSkla} onClick={() => setTonovaneSkla(!tonovaneSkla)} title={t('tintedGlass')} subtitle={t('solarGlass')} price={`+ ${CENY.tonovaneSkla.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="tonovanie_skla" onPriceChange={handlePriceChange} />

                </div>

                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    {t('entryDoor')}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
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

                  <p className="text-[10px] sm:text-xs font-bold text-gray-700 mt-3 mb-2 flex items-center gap-1.5">
                    <Square className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    {t('additionalWindows')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                step="3"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-emerald-50/50 to-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

                  <div className="col-span-2 sm:col-span-3 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-emerald-600 rounded-xl bg-emerald-100/70 shadow-xl">
                    <p className="col-span-2 text-[9px] sm:text-[10px] font-bold text-emerald-700 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">1</span>
                      {t('facade')} ({t('selectOne')})
                    </p>
                    <EditableTile selected={vonkajsiaFasada === "standard"} onClick={() => setVonkajsiaFasada("standard")} title={t('facadeWoodMetal')} subtitle={t('includedInBasePrice')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={false} />
                    <EditableTile selected={vonkajsiaFasada === "suchana"} onClick={() => setVonkajsiaFasada("suchana")} title={t('facadeStucco')} subtitle={t('whitePlaster')} price={`+ ${CENY.vonkajsiaFasada.suchana.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="fasada_omietka" onPriceChange={handlePriceChange} />
                  </div>

                  <EditableTile selected={vnutornePodlahy} onClick={() => setVnutornePodlahy(!vnutornePodlahy)} title={t('floors')} subtitle={t('floorsLaminate')} price={`+ ${CENY.vnutornePodlahy.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="podlahy_laminat" onPriceChange={handlePriceChange} />
                  <EditableTile selected={podlahovVykurovanie} onClick={() => setPodlahovVykurovanie(!podlahovVykurovanie)} title={t('floorHeating')} subtitle={t('wifiThermostat')} price={`+ ${CENY.podlahovVykurovanie.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="podlahove_kurenie" onPriceChange={handlePriceChange} />

                </div>

                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-gray-800 text-[10px] sm:text-xs">{t('interiorDoors')}</span>
                        <span className="text-green-600 font-bold text-[10px] ml-1.5">× {CENY.interieroveDvere.toLocaleString('sk-SK')} €</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setInterieroveDvere(Math.max(0, interieroveDvere - 1))}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm"
                      >−</button>
                      <span className="w-6 text-center font-bold text-sm">{interieroveDvere}</span>
                      <button 
                        onClick={() => setInterieroveDvere(interieroveDvere + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm"
                      >+</button>
                    </div>
                  </div>
                </div>

              </div>
            </Card>
          </motion.div>}

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
                step="4"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  
                  <EditableTile selected={inziniering} onClick={() => setInziniering(!inziniering)} title={t('engineering')} subtitle={t('buildingPermit')} price={`+ ${CENY.inziniering.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="inziniering" onPriceChange={handlePriceChange} />
                  <EditableTile selected={projektA0} onClick={() => setProjektA0(!projektA0)} title={t('projectA0')} subtitle={t('certification')} price={`+ ${CENY.projektA0.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="projektACertifikacia" onPriceChange={handlePriceChange} />
                  <EditableTile selected={revizna} onClick={() => setRevizna(!revizna)} title={t('revision')} subtitle={t('documentation')} price={`+ ${CENY.revizna.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="revizia" onPriceChange={handlePriceChange} />
                  <EditableTile selected={doprava} onClick={() => setDoprava(!doprava)} title={t('transport')} subtitle={t('free')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={false} />

                </div>

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

          {!showOnlyPhase && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500"></div>
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-10 right-10 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative p-4 sm:p-8 md:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-8">
                    <div className="flex-1">
                      <p className="text-green-400 text-[10px] sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">{t('yourConfiguration')}</p>
                      <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{dom?.nazov || 'Flat Small 41m²'}</h3>
                      <p className="text-slate-400 text-xs sm:text-base mb-4">{t('completeCalculation')}</p>
                      {projektA0 && !a0Odporucania && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-sm py-1 sm:py-1.5 px-2 sm:px-4 shadow-lg shadow-green-500/30">✓ {t('meetsA0')}</Badge>
                      )}
                    
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

          {showFinale && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500">
              <div className="p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('readyToStart')}</h3>
                <p className="text-white/90 mb-6 text-sm sm:text-base">{t('finalPhaseDesc')}</p>
                <Button 
                  size="lg" 
                  onClick={() => setShowContactModal(true)}
                  className="bg-white text-green-600 hover:bg-gray-100 font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7 shadow-2xl transition-all hover:scale-105"
                >
                  <Send className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
                  {t('showHouseAndSendQuote')}
                </Button>
              </div>
            </Card>
          </motion.div>}
        </div>
      </div>

      {!showOnlySummary && (
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
          montazHolodomu={montazHolodomu}
          zaklady={zaklady}
          predlzenie={0}
          vstupneDvere={vstupneDvere}
          elektroinstalacia={elektroinstalacia}
          vodaKanalizacia={vodaKanalizacia}
          sanitaKomplet={sanitaKomplet}
          bojler={bojler}
          pripojkaSiete={pripojkaSiete}
          stresneOkno={stresneOkno}
          bocneOknoFixne={bocneOknoFixne}
          bocneOknoVyklopne90={bocneOknoVyklopne90}
          bocneOknoVyklopne55={bocneOknoVyklopne55}
          povrchokaOkien={povrchokaOkien}
          tonovaneSkla={tonovaneSkla}
          interierFinis={interierFinis}
          vnutornePodlahy={vnutornePodlahy}
          podlahovVykurovanie={podlahovVykurovanie}
          interieroveDvere={interieroveDvere}
          pergola={pergola}
          inziniering={inziniering}
          revizna={revizna}
          doprava={doprava}
          predajNehnutelnosti={predajNehnutelnosti}
          hladaniePozemku={hladaniePozemku}
          financneSluzby={financneSluzby}
        />
      )}
    </div>
  );
}