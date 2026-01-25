/**
 * ⚠️⚠️⚠️ KRITICKÉ UPOZORNENIE - BARN 48 KONFIGURÁTOR ⚠️⚠️⚠️
 * 
 * ═══════════════════════════════════════════════════════════════
 * TENTO SÚBOR JE VÝHRADNE PRE MODEL "BARN 48m²" - NEMEŇTE HO!
 * ═══════════════════════════════════════════════════════════════
 * 
 * ⛔ ABSOLÚTNE ZAKÁZANÉ OPERÁCIE:
 * ────────────────────────────────────────────────────────────────
 * ❌ NEODSTRAŇUJTE prop `customPrices` z KonfiguratorFaza1HrubaStavba
 * ❌ NEPREPISUJTE funkciu getPrice() a objekt CENY
 * ❌ NEPREPISUJTE mapovanie v initialSelections a onSelectionChange
 * ❌ NEMEŇTE logiku phase1CustomPrices useMemo
 * ❌ NEODSTRAŇUJTE mapovanie izolacia_extra → ultra a vice versa
 * ❌ NEMEŇTE hardcodovanú cenu 5250 pre ultra/extra izoláciu v CENY.izolacia.ultra
 * ❌ NEMEŇTE hardcodovanú cenu 5250 v phase1CustomPrices pre izolacia_extra a izolacia_ultra
 * 
 * ✅ POVINNÉ PROPS pre KonfiguratorFaza1HrubaStavba:
 * ────────────────────────────────────────────────────────────────
 * ✓ dom={dom}
 * ✓ isAdmin={isAdmin}
 * ✓ onPriceUpdate={handlePriceChange}
 * ✓ showTooltips={true}
 * ✓ customPrices={phase1CustomPrices}  ← KRITICKÉ!
 * ✓ hideExtraInsulation={false}
 * ✓ initialSelections={{...}}  ← musí mapovať ultra → extra a standard → standardna
 * ✓ onSelectionChange={(selections) => {...}}  ← musí mapovať extra → ultra a standardna → standard
 * 
 * 📋 MAPOVANIE CIEN (NEMEŇTE!):
 * ────────────────────────────────────────────────────────────────
 * - montaz: montaz_ano / montaz_nie
 * - izolacia: izolacia_standardna / izolacia_zvysena / izolacia_premium / izolacia_extra
 * - zaklady: zaklady_bez / zaklady_skrutky / zaklady_doska / zaklady_pasove
 * 
 * 🔄 MAPOVANIE HODNÔT (NEMEŇTE!):
 * ────────────────────────────────────────────────────────────────
 * Parent state (ultra) ↔ Fáza 1 komponent (extra)
 * Parent state (standard) ↔ Fáza 1 komponent (standardna)
 * Parent state (standardna) ↔ Fáza 1 komponent (standardna)
 * 
 * 💰 HARDCODOVANÉ CENY (NEMEŇTE!):
 * ────────────────────────────────────────────────────────────────
 * - CENY.izolacia.ultra = 5250 (FIX, nie getPrice!)
 * - phase1CustomPrices.izolacia_extra = 5250
 * - phase1CustomPrices.izolacia_ultra = 5250
 * 
 * 🏗️ AK POTREBUJETE UPRAVIŤ INÝ MODEL:
 * ────────────────────────────────────────────────────────────────
 * ➡️ VYTVORTE NOVÝ SÚBOR (napr. KonfiguratorMyModel.jsx)
 * ➡️ NEKOPÍRUJTE tento súbor ako základ - použite KonfiguratorFlatSmall.jsx
 * ➡️ NIKDY NEMEŇTE TENTO SÚBOR PRE INÉ MODELY!
 * 
 * ═══════════════════════════════════════════════════════════════
 * Posledná úprava: 2026-01-25 - Opravené NaN a ceny pre ultra/extra
 * ═══════════════════════════════════════════════════════════════
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

export default function KonfiguratorBarn48({
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
  const BASE_PRICE = dom?.zakladna_cena || 0;

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

  // DEFAULT CENY
  const DEFAULT_CENY = {
    montaz: { nie: 0, ano: 4875 },
    predlzenie: { 0: 0, 1.2: 3300, 2.4: 6600, 3.6: 9900, 4.8: 13200 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 1400, premium: 2800, ultra: 5250 },
    elektroinstalacia: 2300,
    vodaKanalizacia: 1000,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 1000,
    rekuperacia: 2214,
    zaklady: { bez: 0, skrutky: 3077, doska: 6595, pasove: 6782 },
    pripojkaSiete: 1500,
    inziniering: 2590,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 4100, sadrokarton: 4715 },
    vonkajsiaFasada: { standard: 0, suchana: 4311 },
    povrchokaOkien: 750,
    vnutornePodlahy: 840,
    podlahovVykurovanie: 2819,
    interieroveDvere: 250,
    tonovaneSkla: 340,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 500,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
  };

  // Načítať custom ceny z databázy
  const customCeny = dom?.konfigurator_custom_ceny_prosto_house || {};
  
  const getPrice = (key) => {
    if (customCeny[key] !== undefined && customCeny[key] !== null) {
      return customCeny[key];
    }
    return DEFAULT_CENY[key];
  };

  // CENY - s možnosťou override z databázy
  const CENY = {
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
      ultra: 5250
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
  };

  // Custom prices pre Fázu 1 komponent
  const phase1CustomPrices = useMemo(() => ({
    montaz_ano: CENY.montaz.ano,
    montaz_nie: 0,
    izolacia_standardna: 0,
    izolacia_standard: 0,
    izolacia_zvysena: CENY.izolacia.zvysena,
    izolacia_premium: CENY.izolacia.premium,
    izolacia_ultra: 5250,
    izolacia_extra: 5250,
    zaklady_bez: 0,
    zaklady_skrutky: CENY.zaklady.skrutky,
    zaklady_doska: CENY.zaklady.doska,
    zaklady_pasove: CENY.zaklady.pasove
  }), [CENY]);

  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;

    total += CENY.montaz[montazHolodomu] || 0;
    total += CENY.predlzenie[predlzenie] || 0;
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
  }, [montazHolodomu, predlzenie, vstupneDvere, izolaciaNavysenie, elektroinstalacia,
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, interierFinis,
      vonkajsiaFasada, povrchokaOkien, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, tonovaneSkla, doprava, revizna,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE]);

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
    const izolaciaPrice = izolaciaNavysenie === "ultra" ? 5250 : izolaciaNavysenie === "premium" ? 2800 : izolaciaNavysenie === "zvysena" ? 1400 : 0;
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
      interieroveDvere, inziniering, projektA0, revizna, doprava, t, BASE_PRICE]);

  const [panelWidth, setPanelWidth] = useState(null);
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

  const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
    <div className={`relative flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r ${color}`}>
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
          <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 bg-white/90 rounded-full text-gray-800 text-[9px] sm:text-xs font-bold uppercase tracking-wider">
            {t('phase')} {step}
          </span>
        </div>
        <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate drop-shadow-lg">{title}</h3>
        {subtitle && <p className="text-white text-[10px] sm:text-xs mt-0.5 truncate drop-shadow-md">{subtitle}</p>}
      </div>
    </div>
  );

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
                <p className="text-green-900 text-xs font-bold uppercase tracking-wider mb-0.5">{t('yourConfiguration')}</p>
                <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'Barn 48'}</h3>
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
                color="from-amber-600 to-orange-600"
                step="1"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-amber-50/50 to-white">
                <KonfiguratorFaza1HrubaStavba
                  dom={dom}
                  isAdmin={isAdmin}
                  onPriceUpdate={handlePriceChange}
                  showTooltips={true}
                  customPrices={phase1CustomPrices}
                  hideExtraInsulation={false}
                  initialSelections={{
                    montaz: montazHolodomu === 'ano' ? 'montaz_ano' : 'montaz_nie',
                    izolacia: izolaciaNavysenie === 'ultra' ? 'izolacia_extra' : izolaciaNavysenie === 'standard' ? 'izolacia_standardna' : `izolacia_${izolaciaNavysenie}`,
                    zaklady: zaklady === 'bez' ? 'zaklady_bez' : `zaklady_${zaklady}`
                  }}
                  onSelectionChange={(selections) => {
                    if (selections.montaz) setMontazHolodomu(selections.montaz === 'montaz_ano' ? 'ano' : 'nie');
                    if (selections.izolacia) {
                      let izolaciaValue = selections.izolacia.replace('izolacia_', '');
                      if (izolaciaValue === 'extra') izolaciaValue = 'ultra';
                      if (izolaciaValue === 'standardna') izolaciaValue = 'standard';
                      setIzolaciaNavysenie(izolaciaValue);
                    }
                    if (selections.zaklady) {
                      let zakladyValue = selections.zaklady.replace('zaklady_', '');
                      if (zakladyValue === 'vruty') zakladyValue = 'skrutky';
                      setZaklady(zakladyValue);
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
                color="from-blue-600 to-indigo-600"
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
                    <EditableTile selected={interierFinis === "drevo"} onClick={() => setInterierFinis("drevo")} title={t('interiorWood')} subtitle={t('woodCladding')} price={`+ ${CENY.interierFinis.drevo.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="interierFinis_drevo" onPriceChange={handlePriceChange} />
                    <EditableTile selected={interierFinis === "sadrokarton"} onClick={() => setInterierFinis("sadrokarton")} title={t('interiorDrywall')} subtitle={t('plaster')} price={`+ ${CENY.interierFinis.sadrokarton.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="interierFinis_sadrokarton" onPriceChange={handlePriceChange} />
                  </div>

                  <div className="col-span-2 sm:col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-yellow-500 rounded-xl bg-yellow-100/70 shadow-xl">
                    <p className="col-span-2 text-[9px] sm:text-[10px] font-bold text-yellow-800 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">2</span>
                      {t('electrical')} & {t('water')}
                    </p>
                    <EditableTile selected={elektroinstalacia} onClick={() => setElektroinstalacia(!elektroinstalacia)} title={t('electrical')} subtitle={t('wiring')} price={`+ ${CENY.elektroinstalacia.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="elektroinstalacia" onPriceChange={handlePriceChange} />
                    <EditableTile selected={vodaKanalizacia} onClick={() => setVodaKanalizacia(!vodaKanalizacia)} title={t('water')} subtitle={t('wiring')} price={`+ ${CENY.vodaKanalizacia.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="vodaKanalizacia" onPriceChange={handlePriceChange} />
                    <EditableTile selected={sanitaKomplet} onClick={() => setSanitaKomplet(!sanitaKomplet)} title={t('sanitary')} subtitle={t('complete')} price={`+ ${CENY.sanitaKomplet.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="sanitaKomplet" onPriceChange={handlePriceChange} />
                    <EditableTile selected={bojler} onClick={() => setBojler(!bojler)} title={t('boiler')} subtitle={t('boilerElectric')} price={`+ ${CENY.bojler.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="bojler" onPriceChange={handlePriceChange} />
                  </div>

                  <div className="col-span-2 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-green-600 rounded-xl bg-green-100/70 shadow-xl">
                    <p className="col-span-2 text-[10px] sm:text-xs font-bold text-green-800 -mb-1 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">3</span>
                      {t('heatPump')} & {t('recuperation')} (A0)
                    </p>
                    <EditableTile selected={tepelneCerpadlo} onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)} title={t('heatPump')} subtitle="1× vonk. / 2× vn." price={`+ ${CENY.tepelneCerpadlo.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="tepelneCerpadlo" onPriceChange={handlePriceChange} />
                    <EditableTile selected={rekuperacia} onClick={() => setRekuperacia(!rekuperacia)} title={t('recuperation')} subtitle="2 ks" price={`+ ${CENY.rekuperacia.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="rekuperacia" onPriceChange={handlePriceChange} />
                  </div>

                  <EditableTile selected={pripojkaSiete} onClick={() => setPripojkaSiete(!pripojkaSiete)} title={t('gridConnection')} subtitle={t('connection')} price={`+ ${CENY.pripojkaSiete.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="pripojkaSiete" onPriceChange={handlePriceChange} />
                  <EditableTile selected={povrchokaOkien} onClick={() => setPovrchokaOkien(!povrchokaOkien)} title={t('lamination')} subtitle={t('laminationAnthracite')} price={`+ ${CENY.povrchokaOkien.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="povrchokaOkien" onPriceChange={handlePriceChange} />
                  <EditableTile selected={tonovaneSkla} onClick={() => setTonovaneSkla(!tonovaneSkla)} title={t('tintedGlass')} subtitle={t('solarGlass')} price={`+ ${CENY.tonovaneSkla.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="tonovaneSkla" onPriceChange={handlePriceChange} />

                </div>

                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    {t('entryDoor')}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: "ziadne", label: t('doorStandard'), price: "0 €" },
                      { value: "kovove", label: "Kovové s 2 zámkami", price: `+ ${CENY.dvere.kovove.toLocaleString('sk-SK')} €` },
                      { value: "plastove", label: "Plastovo-kovové", price: `+ ${CENY.dvere.plastove.toLocaleString('sk-SK')} €` }
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
                          >-</button>
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
                color="from-emerald-600 to-teal-600"
                step="3"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-emerald-50/50 to-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

                  <div className="col-span-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-emerald-600 rounded-xl bg-emerald-100/70 shadow-xl">
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 mb-2 flex items-center gap-1">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">1</span>
                      {t('facade')} - Štandardná
                    </p>
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border-2 border-emerald-500">
                      <Paintbrush className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">Drevo / Falcovaný plech</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Súčasť základnej ceny</p>
                      </div>
                    </div>
                  </div>

                  <EditableTile selected={vnutornePodlahy} onClick={() => setVnutornePodlahy(!vnutornePodlahy)} title={t('floors')} subtitle={t('floorsLaminate')} price={`+ ${CENY.vnutornePodlahy.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="vnutornePodlahy" onPriceChange={handlePriceChange} />
                  <EditableTile selected={podlahovVykurovanie} onClick={() => setPodlahovVykurovanie(!podlahovVykurovanie)} title={t('floorHeating')} subtitle={t('wifiThermostat')} price={`+ ${CENY.podlahovVykurovanie.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="podlahovVykurovanie" onPriceChange={handlePriceChange} />

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
                      >-</button>
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
                color="from-purple-600 to-violet-600"
                step="4"
              />
              <div className="p-3 sm:p-6 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

                  <EditableTile selected={inziniering} onClick={() => setInziniering(!inziniering)} title={t('engineering')} subtitle={t('buildingPermit')} price={`+ ${CENY.inziniering.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="inziniering" onPriceChange={handlePriceChange} />
                  <EditableTile selected={projektA0} onClick={() => setProjektA0(!projektA0)} title={t('projectA0')} subtitle={t('certification')} price={`+ ${CENY.projektA0.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} t={t} isAdmin={isAdmin} priceKey="projektA0" onPriceChange={handlePriceChange} />
                  <EditableTile selected={revizna} onClick={() => setRevizna(!revizna)} title={t('revision')} subtitle={t('documentation')} price={`+ ${CENY.revizna.toLocaleString('sk-SK')} €`} isPriced={true} t={t} isAdmin={isAdmin} priceKey="revizna" onPriceChange={handlePriceChange} />
                  <EditableTile selected={doprava} onClick={() => setDoprava(!doprava)} title={t('transport')} subtitle="Zadarmo" price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={false} />

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
                      <h3 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{dom?.nazov || 'Barn 48'}</h3>
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