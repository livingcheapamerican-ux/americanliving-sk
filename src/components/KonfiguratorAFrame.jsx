/**
 * ⚠️ KRITICKÉ UPOZORNENIE - A-FRAME KONFIGURÁTOR ⚠️
 * 
 * Tento súbor je ŠPECIFICKY NASTAVENÝ pre model "A-Frame".
 * 
 * DÔLEŽITÉ:
 * - Ceny sú načítané z entity Dom (konfigurator_custom_ceny_prosto_house)
 * - Komponent KonfiguratorFaza1HrubaStavba MUSÍ dostať prop `customPrices`
 * - Mapovanie cien: montaz → montaz_ano, izolacia → izolacia_*, zaklady → zaklady_*
 * - Props pre Fázu 1: isAdmin, onPriceUpdate, showTooltips, customPrices, initialSelections, onSelectionChange
 * 
 * NEODSTRAŇUJTE prop `customPrices` z KonfiguratorFaza1HrubaStavba!
 * NEPREPISUJTE logiku getPrice() a CENY objektu!
 * NEPREPISUJTE mapovanie v initialSelections a onSelectionChange!
 * 
 * Ak potrebujete upraviť iné modely domov, vytvorte nový súbor - NIE TENTO SÚBOR!
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, AlertTriangle, Check, RotateCcw,
  Wrench, Plug, Droplets, ThermometerSun, Wind, Landmark, FileText,
  Zap, ShowerHead, Flame, Cable, Paintbrush, Home, Truck, Sun, DoorOpen,
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import KonfiguratorContactModal from "./KonfiguratorContactModal";
import { useLanguage } from "./LanguageContext";
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";

import FloatingPrice from "./FloatingPrice";
import { base44 } from "@/api/base44Client";
import EditableTile from "./EditableTile";
import { useQuery } from "@tanstack/react-query";

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

export default function KonfiguratorAFrame({ 
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
  predlzenie, setPredlzenie,
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
  const BASE_PRICE = 22700;

  const { t, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  // Funkcia na uloženie zmenenej ceny do databázy
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

  // DEFAULT CENY pre A-Frame - fallback ak nie sú v databáze
  const DEFAULT_CENY = {
    montaz: { nie: 0, ano: 5675 },
    predlzenie: { 0: 0, 1.2: 3550, 2.4: 7100, 3.6: 10650, 4.8: 14200 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, standardna: 0, zvysena: 1600, premium: 3200, ultra: 6000 },
    elektroinstalacia: 2300,
    vodaKanalizacia: 980,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 1100,
    rekuperacia: 2214,
    zaklady: { bez: 0, skrutky: 2100, doska: 7000, pasove: 6000 },
    pripojkaSiete: 1500,
    inziniering: 2590,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 4400, sadrokarton: 5015 },
    vonkajsiaFasada: { standard: 0, suchana: 2414 },
    povrchokaOkien: 850,
    vnutornePodlahy: 980,
    podlahovVykurovanie: 2819,
    interieroveDvere: 250,
    tonovaneSkla: 420,
    doprava: 0,
    revizna: 500,
    stresneOkno: 760,
    bocneOknoFixne: 500,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
  };

  // Načítať custom ceny z databázy (ak existujú pre A-Frame)
  const customCeny = dom?.konfigurator_custom_ceny_prosto_house || {};
  
  const getPrice = React.useCallback((key) => {
    if (customCeny[key] !== undefined && customCeny[key] !== null) {
      return customCeny[key];
    }
    return DEFAULT_CENY[key];
  }, [customCeny]);

  // CENY - dynamicky načítané z databázy s fallback na defaults
  const CENY = useMemo(() => ({
    montaz: { nie: 0, ano: getPrice('montaz_ano') ?? DEFAULT_CENY.montaz.ano },
    predlzenie: { 
      0: 0, 
      1.2: getPrice('predlzenie_1_2') ?? DEFAULT_CENY.predlzenie[1.2],
      2.4: getPrice('predlzenie_2_4') ?? DEFAULT_CENY.predlzenie[2.4],
      3.6: getPrice('predlzenie_3_6') ?? DEFAULT_CENY.predlzenie[3.6],
      4.8: getPrice('predlzenie_4_8') ?? DEFAULT_CENY.predlzenie[4.8]
    },
    dvere: { 
      ziadne: 0, 
      kovove: getPrice('dvere_kovove') ?? DEFAULT_CENY.dvere.kovove, 
      plastove: getPrice('dvere_plastove') ?? DEFAULT_CENY.dvere.plastove 
    },
    izolacia: { 
      standard: 0,
      standardna: 0,
      zvysena: getPrice('izolacia_zvysena') ?? DEFAULT_CENY.izolacia.zvysena, 
      premium: getPrice('izolacia_premium') ?? DEFAULT_CENY.izolacia.premium, 
      ultra: getPrice('izolacia_extra') ?? DEFAULT_CENY.izolacia.ultra 
    },
    elektroinstalacia: getPrice('elektroinstalacia') ?? DEFAULT_CENY.elektroinstalacia,
    vodaKanalizacia: getPrice('vodaKanalizacia') ?? DEFAULT_CENY.vodaKanalizacia,
    sanitaKomplet: getPrice('sanitaKomplet') ?? DEFAULT_CENY.sanitaKomplet,
    bojler: getPrice('bojler') ?? DEFAULT_CENY.bojler,
    tepelneCerpadlo: getPrice('tepelneCerpadlo') ?? DEFAULT_CENY.tepelneCerpadlo,
    rekuperacia: getPrice('rekuperacia') ?? DEFAULT_CENY.rekuperacia,
    zaklady: { 
      bez: 0, 
      skrutky: getPrice('zaklady_vruty') ?? DEFAULT_CENY.zaklady.skrutky, 
      doska: getPrice('zaklady_doska') ?? DEFAULT_CENY.zaklady.doska, 
      pasove: getPrice('zaklady_pasove') ?? DEFAULT_CENY.zaklady.pasove 
    },
    pripojkaSiete: getPrice('pripojkaSiete') ?? DEFAULT_CENY.pripojkaSiete,
    inziniering: getPrice('inziniering') ?? DEFAULT_CENY.inziniering,
    projektA0: getPrice('projektA0') ?? DEFAULT_CENY.projektA0,
    interierFinis: { 
      ziadne: 0, 
      drevo: getPrice('interierFinis_drevo') ?? DEFAULT_CENY.interierFinis.drevo, 
      sadrokarton: getPrice('interierFinis_sadrokarton') ?? DEFAULT_CENY.interierFinis.sadrokarton 
    },
    vonkajsiaFasada: { 
      standard: 0, 
      suchana: getPrice('vonkajsiaFasada_suchana') ?? DEFAULT_CENY.vonkajsiaFasada.suchana 
    },
    povrchokaOkien: getPrice('povrchokaOkien') ?? DEFAULT_CENY.povrchokaOkien,
    vnutornePodlahy: getPrice('vnutornePodlahy') ?? DEFAULT_CENY.vnutornePodlahy,
    podlahovVykurovanie: getPrice('podlahovVykurovanie') ?? DEFAULT_CENY.podlahovVykurovanie,
    interieroveDvere: getPrice('interieroveDvere') ?? DEFAULT_CENY.interieroveDvere,
    tonovaneSkla: getPrice('tonovaneSkla') ?? DEFAULT_CENY.tonovaneSkla,
    doprava: getPrice('doprava') ?? DEFAULT_CENY.doprava,
    revizna: getPrice('revizna') ?? DEFAULT_CENY.revizna,
    stresneOkno: getPrice('stresneOkno') ?? DEFAULT_CENY.stresneOkno,
    bocneOknoFixne: getPrice('bocneOknoFixne') ?? DEFAULT_CENY.bocneOknoFixne,
    bocneOknoVyklopne90: getPrice('bocneOknoVyklopne90') ?? DEFAULT_CENY.bocneOknoVyklopne90,
    bocneOknoVyklopne55: getPrice('bocneOknoVyklopne55') ?? DEFAULT_CENY.bocneOknoVyklopne55
  }), [getPrice]);

  const phase1InitialSelections = useMemo(() => ({
    montaz: montazHolodomu === 'ano' ? 'montaz_ano' : 'montaz_nie',
    izolacia: izolaciaNavysenie === 'ultra' ? 'izolacia_extra' : izolaciaNavysenie === 'standard' ? 'izolacia_standardna' : `izolacia_${izolaciaNavysenie}`,
    zaklady: zaklady === 'bez' ? 'zaklady_bez' : zaklady === 'vruty' ? 'zaklady_skrutky' : `zaklady_${zaklady}`
  }), [montazHolodomu, izolaciaNavysenie, zaklady]);

  const phase1CustomPrices = useMemo(() => ({
    montaz_ano: CENY.montaz.ano,
    montaz_nie: 0,
    izolacia_standardna: 0,
    izolacia_standard: 0,
    izolacia_zvysena: CENY.izolacia.zvysena,
    izolacia_premium: CENY.izolacia.premium,
    izolacia_extra: CENY.izolacia.ultra,
    izolacia_ultra: CENY.izolacia.ultra,
    zaklady_bez: 0,
    zaklady_skrutky: CENY.zaklady.skrutky,
    zaklady_doska: CENY.zaklady.doska,
    zaklady_pasove: CENY.zaklady.pasove
  }), [CENY]);

  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;

    total += CENY.montaz[montazHolodomu];
    total += CENY.predlzenie[predlzenie] || 0;
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
    if (tonovaneSkla) total += CENY.tonovaneSkla;
    if (doprava) total += CENY.doprava;
    if (revizna) total += CENY.revizna;
    
    total += stresneOkno * CENY.stresneOkno;
    total += bocneOknoFixne * CENY.bocneOknoFixne;
    total += bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90;
    total += bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55;
    
    return total;
  }, [montazHolodomu, predlzenie, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, interierFinis,
      vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE, CENY]);

  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium" && izolaciaNavysenie !== "ultra") chybajuce.push("Premium alebo Ultra izolácia (250mm alebo 300mm)");
    if (!tepelneCerpadlo) chybajuce.push("Tepelné čerpadlo / Klimatizácia");
    if (!rekuperacia) chybajuce.push("Rekuperácia");
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

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
    
    if (predlzenie > 0) {
      items.push({ name: `Predĺženie domu +${predlzenie}m`, price: CENY.predlzenie[predlzenie] || 0, section: "hruba", selected: true });
    }
    
    const izolaciaLabel = izolaciaNavysenie === "ultra" ? "Ultra 300mm" : izolaciaNavysenie === "premium" ? "250/300mm" : izolaciaNavysenie === "zvysena" ? "200/250mm" : "150/200mm";
    const izolaciaPrice = CENY.izolacia[izolaciaNavysenie] || 0;
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standard" });
    
    const zakladyLabel = zaklady === "pasove" ? t('foundationsStrip') : zaklady === "doska" ? t('foundationsSlab') : zaklady === "skrutky" ? "Pilóty/Pätky" : t('foundationsLabel');
    const zakladyPrice = zaklady === "pasove" ? CENY.zaklady.pasove : zaklady === "doska" ? CENY.zaklady.doska : zaklady === "skrutky" ? CENY.zaklady.skrutky : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
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
    
    const dvereLabel = vstupneDvere === "kovove" ? "Kovové dvere s 2 zámkami" : vstupneDvere === "plastove" ? "Plastovo-kovové dvere" : t('doorStandard');
    const dverePrice = vstupneDvere === "kovove" ? CENY.dvere.kovove : vstupneDvere === "plastove" ? CENY.dvere.plastove : 0;
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: vstupneDvere !== "ziadne" });
    
    if (stresneOkno > 0) items.push({ name: `${t('roofWindow')} (${stresneOkno}×)`, price: stresneOkno * CENY.stresneOkno, section: "holodom", selected: true });
    if (bocneOknoFixne > 0) items.push({ name: `${t('fixedWindow')} 90×205 (${bocneOknoFixne}×)`, price: bocneOknoFixne * CENY.bocneOknoFixne, section: "holodom", selected: true });
    if (bocneOknoVyklopne90 > 0) items.push({ name: `${t('tiltWindow')} 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90, section: "holodom", selected: true });
    if (bocneOknoVyklopne55 > 0) items.push({ name: `${t('tiltWindow')} 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55, section: "holodom", selected: true });
    items.push({ name: t('lamination') + " - " + t('laminationAnthracite'), price: povrchokaOkien ? CENY.povrchokaOkien : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: t('tintedGlass') + " (Solar)", price: tonovaneSkla ? CENY.tonovaneSkla : 0, section: "holodom", selected: tonovaneSkla });
    
    items.push({ name: "Fasáda - Drevo/Plech", price: 0, section: "kluc", selected: true });

    items.push({ name: t('floors') + " - " + t('floorsLaminate'), price: vnutornePodlahy ? CENY.vnutornePodlahy : 0, section: "kluc", selected: vnutornePodlahy });
    items.push({ name: t('floorHeatingFull'), price: podlahovVykurovanie ? CENY.podlahovVykurovanie : 0, section: "kluc", selected: podlahovVykurovanie });
    items.push({ name: `${t('interiorDoors')} (${interieroveDvere}×)`, price: interieroveDvere * CENY.interieroveDvere, section: "kluc", selected: interieroveDvere > 0 });
    
    items.push({ name: t('engineeringFull'), price: inziniering ? CENY.inziniering : 0, section: "docs", selected: inziniering });
    items.push({ name: t('projectA0Full'), price: projektA0 ? CENY.projektA0 : 0, section: "docs", selected: projektA0 });
    items.push({ name: t('revisionFull'), price: revizna ? CENY.revizna : 0, section: "docs", selected: revizna });
    items.push({ name: t('transport'), price: doprava ? CENY.doprava : 0, section: "docs", selected: doprava });
    
    return items;
  }, [predajNehnutelnosti, hladaniePozemku, financneSluzby,
      montazHolodomu, predlzenie, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, pripojkaSiete, vstupneDvere,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, povrchokaOkien,
      tonovaneSkla, vonkajsiaFasada, interierFinis, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, inziniering, projektA0, revizna, doprava, t, BASE_PRICE, CENY]);

  const [panelWidth, setPanelWidth] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Ref na uloženie poslednej odoslanej konfigurácie - predchádza infinite loop
  const lastConfigRef = useRef(null);

  // Poslať konfiguráciu do rodičovského komponentu - KRITICKÉ pre hypotekárnu kalkulačku
  useEffect(() => {
    const newConfig = {
      celkovaCena: totalPrice,
      izolaciaNavysenie,
      tepelneCerpadlo,
      rekuperacia,
      projektA0,
      montazHolodomu,
      zaklady
    };

    // Porovnať s predchádzajúcou konfiguráciou - volať len ak sa zmenila
    const newConfigString = JSON.stringify(newConfig);
    if (newConfigString !== lastConfigRef.current) {
      if (onConfigChange) {
        onConfigChange(newConfig);
      }
      lastConfigRef.current = newConfigString;
    }
  }, [totalPrice, izolaciaNavysenie, tepelneCerpadlo, rekuperacia, projektA0, montazHolodomu, zaklady]);

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
      if (setTypStavby) setTypStavby("");
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
      setPredlzenie?.(0);
    }
  };



  const handleSendQuoteFromFloating = async (contactData) => {
    try {
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
        pergola, inziniering, projektA0, revizna, doprava, predlzenie,
        predajNehnutelnosti, hladaniePozemku, financneSluzby,
        language: language
      });
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
                <p className="text-green-900 text-xs font-bold uppercase tracking-wider mb-0.5">VAŠA KONFIGURÁCIA</p>
                <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'A-Frame'}</h3>
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
              <span className="text-gray-900 text-sm font-bold">Celkom s DPH</span>
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
                Ukáž môj dom
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleReset}
                className="w-full border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-xs h-8"
              >
                <RotateCcw className="mr-1.5 w-3.5 h-3.5" />
                Resetovať
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // A-Frame: Všetky sekcie sú skryté - konfigurátor nie je dostupný
  const showHruba = false;
  const showHolodom = false;
  const showKluc = false;
  const showDocs = false;
  const showFinale = false;

  return (
    <div className="mt-8 relative">
      <Card className="p-6 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
        <p className="text-amber-900 font-semibold mb-2">⚠️ Konfigurátor A-Frame</p>
        <p className="text-amber-800 text-sm">Konfigurátor pre A-Frame není aktuálne dostupný. Kontaktujte nás prosím pre detailné informácie.</p>
      </Card>

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
          predlzenie={predlzenie}
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