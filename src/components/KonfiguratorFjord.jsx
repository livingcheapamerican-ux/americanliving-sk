/**
 * ⚠️ KRITICKÉ UPOZORNENIE - FJORD KONFIGURÁTOR ⚠️
 * 
 * Tento súbor je ŠPECIFICKY NASTAVENÝ pre model "Fjord".
 * 
 * DÔLEŽITÉ:
 * - Ceny sú načítané z entity Dom (konfigurator_custom_ceny_prosto_house)
 * - Komponent KonfiguratorFaza1HrubaStavba MUSÍ dostať prop `customPrices`
 * - Mapovanie cien: montaz → montaz_ano, izolacia → izolacia_*, zaklady → zaklady_*
 * - Props pre Fázu 1: isAdmin, onPriceUpdate, showTooltips, customPrices, initialSelections, onSelectionChange
 * 
 * NEODSTRAŇUJTE prop `customPrices` z KonfiguratorFaza1HrubaStavba!
 * NEPREPISUJTE logiku CENY objektu a phase1CustomPrices!
 * NEPREPISUJTE mapovanie v initialSelections a onSelectionChange!
 * 
 * Ak potrebujete upraviť iné modely domov, vytvorte nový súbor - NIE TENTO SÚBOR!
 */

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
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle, Building2, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

import KonfiguratorContactModal from "./KonfiguratorContactModal";
import { useLanguage } from "./LanguageContext";
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";

import FloatingPrice from "./FloatingPrice";
import { base44 } from "@/api/base44Client";

import { useQuery } from "@tanstack/react-query";

// Dlaždica s tooltip a veľkou fajkou
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-blue-100", selectedBorder = "border-blue-500", selectedRing = "ring-blue-300", hoverBorder = "hover:border-blue-300", isAdmin = false, priceKey, onPriceChange }) => {
   const [showTooltip, setShowTooltip] = useState(false);
   const [hoverTimer, setHoverTimer] = useState(null);
   const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
   const [isEditing, setIsEditing] = useState(false);
   const [editPrice, setEditPrice] = useState(price);
   const tileRef = useRef(null);

  const updateTooltipPosition = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipHeight = 80;
      
      let top, left;
      const centerY = viewportHeight / 2;
      if (rect.bottom < centerY) {
        top = rect.bottom + 10;
      } else {
        top = Math.max(rect.top - tooltipHeight - 10, 60);
      }
      
      left = viewportWidth / 2;
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

  const handleSavePrice = async () => {
    if (!onPriceChange) return;
    try {
      const newPrice = parseFloat(editPrice);
      await onPriceChange(priceKey, newPrice);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving price:', error);
    }
  };

  return (
    <motion.div
      ref={tileRef}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-1.5 sm:p-2.5 rounded-md sm:rounded-lg cursor-pointer transition-all flex flex-col items-center text-center ${
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

      <Icon className={`w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 ${selected ? iconSelectedColor : iconColor}`} />
       <span className={`font-semibold text-gray-800 text-[9px] sm:text-xs leading-tight`}>{title}</span>
       <span className={`text-[7px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight`}>{subtitle}</span>
       <div className={`flex items-center gap-1 justify-center mt-0.5 sm:mt-1`}>
         {isEditing && isPriced ? (
           <input
             type="number"
             value={editPrice}
             onChange={(e) => setEditPrice(e.target.value)}
             onBlur={handleSavePrice}
             onKeyDown={(e) => {
               if (e.key === 'Enter') handleSavePrice();
               if (e.key === 'Escape') setIsEditing(false);
             }}
             className="w-16 px-1 py-0.5 text-xs border rounded text-gray-800"
             autoFocus
             onClick={(e) => e.stopPropagation()}
           />
         ) : (
           <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-[8px] sm:text-[10px]`}>{price}</span>
         )}
         {isAdmin && isPriced && priceKey && !isEditing && (
              <button 
                className="ml-1 p-0.5 hover:bg-amber-200 rounded transition-all hover:scale-110 active:scale-95" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  const priceNum = price.replace(/[^0-9]/g, '');
                  setEditPrice(priceNum);
                }}
                title="Edituj cenu"
              >
                <Pencil className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              </button>
            )}
       </div>

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

export default function KonfiguratorFjord({ 
  dom,
  onReset,
  onConfigChange,
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
  const BASE_PRICE = dom?.zakladna_cena || 0;
  const { t, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;



  // DEFAULT CENY
  const DEFAULT_CENY = {
    montaz: { nie: 0, ano: 17700 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standardna: 0, zvysena: 5660, premium: 9106, extra: 10125, "300mm": 10125 },
    elektroinstalacia: 7800,
    vodaKanalizacia: 3650,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 3600,
    rekuperacia: 7749,
    zaklady: { bez: 0, skrutky: 7655, doska: 13000, pasove: 11500 },
    pripojkaSiete: 1500,
    inziniering: 2590,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 18000, sadrokarton: 21086 },
    vonkajsiaFasada: { standard: 0, suchana: 12211 },
    povrchokaOkien: 3400,
    vnutornePodlahy: 3415,
    podlahovVykurovanie: 6101,
    pergola: 1845,
    interieroveDvere: 250,
    tonovaneSkla: 1550,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 500,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
  };

  // Načítať custom ceny z databázy
  const [customCeny, setCustomCeny] = useState(dom?.konfigurator_custom_ceny_prosto_house || {});

  useEffect(() => {
    setCustomCeny(dom?.konfigurator_custom_ceny_prosto_house || {});
  }, [dom?.konfigurator_custom_ceny_prosto_house]);
  
  // CENY - s možnosťou override z databázy (memo-ované!)
  const CENY = useMemo(() => {
    // Helper na ziskanie ceny - pouzije custom ak je > 0, inak default
    const get = (key, defaultVal) => {
      const custom = customCeny[key];
      return (custom !== undefined && custom !== null && custom > 0) ? custom : defaultVal;
    };

    const result = {
      montaz: { nie: 0, ano: get('montaz_ano', DEFAULT_CENY.montaz.ano) },
      dvere: { 
        ziadne: 0, 
        kovove: get('dvere_kovove', DEFAULT_CENY.dvere.kovove), 
        plastove: get('dvere_plastove', DEFAULT_CENY.dvere.plastove) 
      },
      izolacia: { 
        standardna: 0, 
        zvysena: get('izolacia_zvysena', DEFAULT_CENY.izolacia.zvysena), 
        premium: get('izolacia_premium', DEFAULT_CENY.izolacia.premium),
        extra: get('izolacia_extra', DEFAULT_CENY.izolacia.extra),
        "300mm": get('izolacia_300mm', DEFAULT_CENY.izolacia["300mm"])
      },
      elektroinstalacia: get('elektroinstalacia', DEFAULT_CENY.elektroinstalacia),
      vodaKanalizacia: get('vodaKanalizacia', DEFAULT_CENY.vodaKanalizacia),
      sanitaKomplet: get('sanitaKomplet', DEFAULT_CENY.sanitaKomplet),
      bojler: get('bojler', DEFAULT_CENY.bojler),
      tepelneCerpadlo: get('tepelneCerpadlo', DEFAULT_CENY.tepelneCerpadlo),
      rekuperacia: get('rekuperacia', DEFAULT_CENY.rekuperacia),
      zaklady: { 
        bez: 0, 
        skrutky: get('zaklady_skrutky', DEFAULT_CENY.zaklady.skrutky), 
        doska: get('zaklady_doska', DEFAULT_CENY.zaklady.doska), 
        pasove: get('zaklady_pasove', DEFAULT_CENY.zaklady.pasove) 
      },
      pripojkaSiete: get('pripojkaSiete', DEFAULT_CENY.pripojkaSiete),
      inziniering: get('inziniering', DEFAULT_CENY.inziniering),
      projektA0: get('projektA0', DEFAULT_CENY.projektA0),
      interierFinis: { 
        ziadne: 0, 
        drevo: get('interierFinis_drevo', DEFAULT_CENY.interierFinis.drevo), 
        sadrokarton: get('interierFinis_sadrokarton', DEFAULT_CENY.interierFinis.sadrokarton) 
      },
      vonkajsiaFasada: { 
        standard: 0, 
        suchana: get('vonkajsiaFasada_suchana', DEFAULT_CENY.vonkajsiaFasada.suchana) 
      },
      povrchokaOkien: get('povrchokaOkien', DEFAULT_CENY.povrchokaOkien),
      vnutornePodlahy: get('vnutornePodlahy', DEFAULT_CENY.vnutornePodlahy),
      podlahovVykurovanie: get('podlahovVykurovanie', DEFAULT_CENY.podlahovVykurovanie),
      interieroveDvere: get('interieroveDvere', DEFAULT_CENY.interieroveDvere),
      tonovaneSkla: get('tonovaneSkla', DEFAULT_CENY.tonovaneSkla),
      doprava: get('doprava', DEFAULT_CENY.doprava),
      revizna: get('revizna', DEFAULT_CENY.revizna),
      stresneOkno: get('stresneOkno', DEFAULT_CENY.stresneOkno),
      bocneOknoFixne: get('bocneOknoFixne', DEFAULT_CENY.bocneOknoFixne),
      bocneOknoVyklopne90: get('bocneOknoVyklopne90', DEFAULT_CENY.bocneOknoVyklopne90),
      bocneOknoVyklopne55: get('bocneOknoVyklopne55', DEFAULT_CENY.bocneOknoVyklopne55)
      };
      return result;
      }, [customCeny, DEFAULT_CENY]);

  // Funkcia na uloženie zmenenej ceny do databázy
  const handlePriceChange = async (priceKey, newPrice) => {
    console.log('🔧 handlePriceChange called:', { priceKey, newPrice, dom_id: dom?.id });
    
    try {
      const response = await base44.functions.invoke('updateFjordPrice', {
        dom_id: dom.id,
        price_key: priceKey,
        new_price: newPrice
      });
      
      console.log('📡 Backend response:', response?.data);
      
      if (response?.data?.success) {
        console.log('✅ Cena úspešne aktualizovaná v databáze:', priceKey, newPrice);
        
        // Aktualizuj state cien - toto spustí prebudovanie CENY memoizovaného objektu
        setCustomCeny(prev => {
          const updated = {
            ...prev,
            [priceKey]: newPrice
          };
          console.log('💾 CustomCeny aktualizované:', updated);
          return updated;
        });
        
        console.log('✨ State aktualizovaný, komponent by sa mal prerendrovať');
      } else {
        throw new Error(response?.data?.error || 'Neznáma chyba');
      }
    } catch (error) {
      console.error('❌ Error updating price:', error);
      alert('Chyba pri ukladaní ceny: ' + error.message);
    }
  };

  // Výpočet celkovej ceny
  const totalPrice = useMemo(() => {
      let total = BASE_PRICE;

      total += CENY.montaz[montazHolodomu];
      total += CENY.dvere[vstupneDvere];
      // Handle izolacia - map old keys to new CENY keys
      if (izolaciaNavysenie === 'izolacia_extra') total += CENY.izolacia.extra;
      else if (izolaciaNavysenie === 'izolacia_300mm') total += CENY.izolacia["300mm"];
      else if (CENY.izolacia[izolaciaNavysenie]) total += CENY.izolacia[izolaciaNavysenie];
      else total += CENY.izolacia.standardna;
    
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
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE]);

  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium") chybajuce.push("Premium izolácia (250mm steny, 300mm strecha)");
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
    
    items.push({ name: t('shellAssembly'), price: montazHolodomu === "ano" ? CENY?.montaz?.ano || 0 : 0, section: "hruba", selected: montazHolodomu === "ano" });
    
    let izolaciaLabel = "150/200mm";
    let izolaciaPrice = 0;
    if (izolaciaNavysenie === "premium") {
      izolaciaLabel = "250/300mm";
      izolaciaPrice = CENY?.izolacia?.premium || 0;
    } else if (izolaciaNavysenie === "zvysena") {
      izolaciaLabel = "200/250mm";
      izolaciaPrice = CENY?.izolacia?.zvysena || 0;
    } else if (izolaciaNavysenie === "izolacia_extra") {
      izolaciaLabel = t('insulationExtra');
      izolaciaPrice = CENY?.izolacia?.extra || 0;
    } else if (izolaciaNavysenie === "izolacia_300mm") {
      izolaciaLabel = t('insulationExtra') + ' 300mm';
      izolaciaPrice = CENY?.izolacia?.["300mm"] || 0;
    }
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standardna" && izolaciaNavysenie !== "standard" && izolaciaNavysenie !== "izolacia_extra" && izolaciaNavysenie !== "izolacia_300mm" || izolaciaNavysenie === "izolacia_extra" || izolaciaNavysenie === "izolacia_300mm" });
    
    const zakladyLabel = zaklady === "pasove" ? t('foundationsStrip') : zaklady === "doska" ? t('foundationsSlab') : zaklady === "skrutky" ? t('foundationsScrews') : t('foundationsLabel');
    const zakladyPrice = zaklady === "pasove" ? CENY?.zaklady?.pasove || 0 : zaklady === "doska" ? CENY?.zaklady?.doska || 0 : zaklady === "skrutky" ? CENY?.zaklady?.skrutky || 0 : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
    const interierLabel = interierFinis === "drevo" ? t('interiorWood') : interierFinis === "sadrokarton" ? t('interiorDrywall') : t('interiorFinish');
    const interierPrice = interierFinis === "drevo" ? CENY?.interierFinis?.drevo || 0 : interierFinis === "sadrokarton" ? CENY?.interierFinis?.sadrokarton || 0 : 0;
    items.push({ name: interierLabel, price: interierPrice, section: "holodom", selected: interierFinis !== "ziadne" });

    items.push({ name: t('electricalFull'), price: elektroinstalacia ? CENY?.elektroinstalacia || 0 : 0, section: "holodom", selected: elektroinstalacia });
    items.push({ name: t('waterFull'), price: vodaKanalizacia ? CENY?.vodaKanalizacia || 0 : 0, section: "holodom", selected: vodaKanalizacia });
    items.push({ name: t('sanitaryFull'), price: sanitaKomplet ? CENY?.sanitaKomplet || 0 : 0, section: "holodom", selected: sanitaKomplet });
    items.push({ name: t('boiler'), price: bojler ? CENY?.bojler || 0 : 0, section: "holodom", selected: bojler });
    items.push({ name: t('heatPumpFull'), price: tepelneCerpadlo ? CENY?.tepelneCerpadlo || 0 : 0, section: "holodom", selected: tepelneCerpadlo });
    items.push({ name: t('recuperation'), price: rekuperacia ? CENY?.rekuperacia || 0 : 0, section: "holodom", selected: rekuperacia });
    items.push({ name: t('gridConnectionFull'), price: pripojkaSiete ? CENY?.pripojkaSiete || 0 : 0, section: "holodom", selected: pripojkaSiete });
    
    const dvereLabel = vstupneDvere === "kovove" ? t('doorMetal') : vstupneDvere === "plastove" ? t('doorPlastic') : t('doorStandard');
    const dverePrice = vstupneDvere === "kovove" ? CENY?.dvere?.kovove || 0 : vstupneDvere === "plastove" ? CENY?.dvere?.plastove || 0 : 0;
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: vstupneDvere !== "ziadne" });
    
    if (stresneOkno > 0) items.push({ name: `${t('roofWindow')} (${stresneOkno}×)`, price: stresneOkno * (CENY?.stresneOkno || 0), section: "holodom", selected: true });
    if (bocneOknoFixne > 0) items.push({ name: `${t('fixedWindow')} (${bocneOknoFixne}×)`, price: bocneOknoFixne * (CENY?.bocneOknoFixne || 0), section: "holodom", selected: true });
    if (bocneOknoVyklopne90 > 0) items.push({ name: `${t('tiltWindow')} 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * (CENY?.bocneOknoVyklopne90 || 0), section: "holodom", selected: true });
    if (bocneOknoVyklopne55 > 0) items.push({ name: `${t('tiltWindow')} 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * (CENY?.bocneOknoVyklopne55 || 0), section: "holodom", selected: true });
    items.push({ name: t('lamination') + " - " + t('laminationAnthracite'), price: povrchokaOkien ? CENY?.povrchokaOkien || 0 : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: t('tintedGlass') + " (Solar)", price: tonovaneSkla ? CENY?.tonovaneSkla || 0 : 0, section: "holodom", selected: tonovaneSkla });
    
    const fasadaLabel = vonkajsiaFasada === "suchana" ? t('facadeStucco') : vonkajsiaFasada === "standard" ? t('facadeWoodMetal') : t('facade');
    const fasadaPrice = vonkajsiaFasada === "suchana" ? CENY?.vonkajsiaFasada?.suchana || 0 : 0;
    items.push({ name: fasadaLabel, price: fasadaPrice, section: "kluc", selected: !!vonkajsiaFasada });

    items.push({ name: t('floors') + " - " + t('floorsLaminate'), price: vnutornePodlahy ? CENY?.vnutornePodlahy || 0 : 0, section: "kluc", selected: vnutornePodlahy });
    items.push({ name: t('floorHeatingFull'), price: podlahovVykurovanie ? CENY?.podlahovVykurovanie || 0 : 0, section: "kluc", selected: podlahovVykurovanie });
    items.push({ name: `${t('interiorDoors')} (${interieroveDvere}×)`, price: interieroveDvere * (CENY?.interieroveDvere || 0), section: "kluc", selected: interieroveDvere > 0 });
    
    items.push({ name: t('engineeringFull'), price: inziniering ? CENY?.inziniering || 0 : 0, section: "docs", selected: inziniering });
    items.push({ name: t('projectA0Full'), price: projektA0 ? CENY?.projektA0 || 0 : 0, section: "docs", selected: projektA0 });
    items.push({ name: t('revisionFull'), price: revizna ? CENY?.revizna || 0 : 0, section: "docs", selected: revizna });
    items.push({ name: t('transport'), price: doprava ? CENY?.doprava || 0 : 0, section: "docs", selected: doprava });
    
    return items;
  }, [predajNehnutelnosti, hladaniePozemku, financneSluzby,
      montazHolodomu, izolaciaNavysenie, zaklady, elektroinstalacia, vodaKanalizacia, 
      sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia, pripojkaSiete, vstupneDvere,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, povrchokaOkien,
      tonovaneSkla, vonkajsiaFasada, interierFinis, vnutornePodlahy, podlahovVykurovanie,
      interieroveDvere, inziniering, projektA0, revizna, doprava, t, BASE_PRICE, CENY]);

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
      setRevizna(true);
      setStresneOkno(0);
      setBocneOknoFixne(0);
      setBocneOknoVyklopne90(0);
      setBocneOknoVyklopne55(0);
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

  // Funkcia pre update cien z Fázy 1
  const handleUpdatePrice = async (priceKey, newValue) => {
    console.log("✏️ Admin mení cenu:", priceKey, newValue);
    
    // Transform priceKey from "montaz.ano" to "montaz_ano" for backend
    const backendKey = priceKey.replace('.', '_');
    
    try {
      const response = await base44.functions.invoke('updateFjordPrice', {
        dom_id: dom.id,
        price_key: backendKey,
        new_price: newValue
      });
      
      if (response?.data?.success) {
        console.log('✅ Cena úspešne aktualizovaná v databáze:', backendKey, newValue);
        
        // Aktualizácia stavu cenníka (Deep update)
        setCustomCeny((prev) => {
          const newState = JSON.parse(JSON.stringify(prev));
          const keys = priceKey.split('.');
          let current = newState;
          
          for (let i = 0; i < keys.length - 1; i++) {
             if (!current[keys[i]]) current[keys[i]] = {};
             current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = newValue;
          return newState;
        });
      } else {
        throw new Error(response?.data?.error || 'Neznáma chyba');
      }
    } catch (error) {
      console.error('❌ Error updating price:', error);
      alert('Chyba pri ukladaní ceny: ' + error.message);
    }
  };

  const phase1CustomPrices = useMemo(() => ({
    montaz_ano: CENY.montaz.ano,
    izolacia_standardna: 0,
    izolacia_zvysena: CENY.izolacia.zvysena,
    izolacia_premium: CENY.izolacia.premium,
    izolacia_extra: CENY.izolacia.extra,
    izolacia_300mm: CENY.izolacia["300mm"],
    zaklady_bez: 0,
    zaklady_skrutky: CENY.zaklady.skrutky,
    zaklady_doska: CENY.zaklady.doska,
    zaklady_pasove: CENY.zaklady.pasove
  }), [CENY]);

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
        pergola, inziniering, projektA0, revizna, doprava, predlzenie: 0,
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
                <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'Fjord'}</h3>
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
                    izolacia: izolaciaNavysenie === 'standard' ? 'izolacia_standardna' : `izolacia_${izolaciaNavysenie}`,
                    zaklady: zaklady === 'bez' ? 'zaklady_bez' : `zaklady_${zaklady}`
                  }}
                  onSelectionChange={(selections) => {
                    if (selections.montaz) setMontazHolodomu(selections.montaz === 'montaz_ano' ? 'ano' : 'nie');
                    if (selections.izolacia) setIzolaciaNavysenie(selections.izolacia.replace('izolacia_', ''));
                    if (selections.zaklady) setZaklady(selections.zaklady.replace('zaklady_', ''));
                  }}
                />
              </div>
            </Card>
          </motion.div>
        )}

          {showHolodom && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card className="overflow-hidden border-2 border-blue-300 shadow-lg">
                  <SectionHeader 
                    icon={Hammer} 
                    title={t('phase2')} 
                    subtitle={t('phase2Subtitle')}
                    color="from-blue-600 to-indigo-600"
                    step="2"
                  />
                  <div className="p-2 sm:p-3 bg-gradient-to-b from-blue-50/50 to-white">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">

                    <div className="col-span-2 sm:col-span-3 grid grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-blue-600 rounded-xl bg-blue-100/70 shadow-xl">
                      <p className="col-span-3 text-[9px] sm:text-[10px] font-bold text-blue-700 -mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">1</span>
                        {t('interiorFinish')} ({t('selectOne')})
                      </p>
                      <Tile selected={interierFinis === "ziadne"} onClick={() => setInterierFinis("ziadne")} icon={Home} iconColor="text-blue-600" iconSelectedColor="text-blue-800" title={t('interiorNone')} subtitle={t('shellConstruction')} price="0 €" isPriced={false} />
                      <Tile selected={interierFinis === "drevo"} onClick={() => setInterierFinis("drevo")} icon={Paintbrush} iconColor="text-blue-600" iconSelectedColor="text-blue-800" title={t('interiorWood')} subtitle={t('woodCladding')} price={`+ ${CENY.interierFinis.drevo.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="interierFinis_drevo" onPriceChange={handlePriceChange} />
                      <Tile selected={interierFinis === "sadrokarton"} onClick={() => setInterierFinis("sadrokarton")} icon={Paintbrush} iconColor="text-blue-600" iconSelectedColor="text-blue-800" title={t('interiorDrywall')} subtitle={t('plaster')} price={`+ ${CENY.interierFinis.sadrokarton.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="interierFinis_sadrokarton" onPriceChange={handlePriceChange} />
                    </div>

                    <div className="col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-yellow-500 rounded-xl bg-yellow-100/70 shadow-xl">
                      <p className="col-span-2 sm:col-span-4 text-[9px] sm:text-[10px] font-bold text-yellow-800 -mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">2</span>
                        {t('electrical')} & {t('water')}
                      </p>
                      <Tile selected={elektroinstalacia} onClick={() => setElektroinstalacia(!elektroinstalacia)} icon={Cable} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('electrical')} subtitle={t('wiring')} price={`+ ${CENY.elektroinstalacia.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="elektroinstalacia" onPriceChange={handlePriceChange} />
                      <Tile selected={vodaKanalizacia} onClick={() => setVodaKanalizacia(!vodaKanalizacia)} icon={Droplets} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('water')} subtitle="Rozvody + kanalizácia" price={`+ ${CENY.vodaKanalizacia.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="vodaKanalizacia" onPriceChange={handlePriceChange} />
                      <Tile selected={sanitaKomplet} onClick={() => setSanitaKomplet(!sanitaKomplet)} icon={ShowerHead} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('sanitaryFull')} subtitle="Komplet" price={`+ ${CENY.sanitaKomplet.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="sanitaKomplet" onPriceChange={handlePriceChange} />
                      <Tile selected={bojler} onClick={() => setBojler(!bojler)} icon={Flame} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('boiler')} subtitle="80L" price={`+ ${CENY.bojler.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="bojler" onPriceChange={handlePriceChange} />
                    </div>

                    <div className="col-span-2 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] border-green-600 rounded-xl bg-green-100/70 shadow-xl">
                      <p className="col-span-2 text-[10px] sm:text-xs font-bold text-green-800 -mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold">3</span>
                        {t('heatPump')} & {t('recuperation')} (A0)
                      </p>
                      <Tile selected={tepelneCerpadlo} onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)} icon={Wind} iconColor="text-green-600" iconSelectedColor="text-green-800" title={t('heatPump')} subtitle="1× vonk. / 4× vn." price={`+ ${CENY.tepelneCerpadlo.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} isAdmin={isAdmin} priceKey="tepelneCerpadlo" onPriceChange={handlePriceChange} />
                      <Tile selected={rekuperacia} onClick={() => setRekuperacia(!rekuperacia)} icon={Wind} iconColor="text-green-600" iconSelectedColor="text-green-800" title={t('recuperation')} subtitle="7 ks" price={`+ ${CENY.rekuperacia.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} isAdmin={isAdmin} priceKey="rekuperacia" onPriceChange={handlePriceChange} />
                    </div>

                    <Tile selected={pripojkaSiete} onClick={() => setPripojkaSiete(!pripojkaSiete)} icon={Zap} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('gridConnection')} subtitle={t('connection')} price={`+ ${CENY.pripojkaSiete.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="pripojkaSiete" onPriceChange={handlePriceChange} />
                    <Tile selected={povrchokaOkien} onClick={() => setPovrchokaOkien(!povrchokaOkien)} icon={Sun} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('lamination')} subtitle={t('laminationAnthracite')} price={`+ ${CENY.povrchokaOkien.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="povrchokaOkien" onPriceChange={handlePriceChange} />
                    <Tile selected={tonovaneSkla} onClick={() => setTonovaneSkla(!tonovaneSkla)} icon={Sun} iconColor="text-yellow-600" iconSelectedColor="text-yellow-800" title={t('tintedGlass')} subtitle={t('solarGlass')} price={`+ ${CENY.tonovaneSkla.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="tonovaneSkla" onPriceChange={handlePriceChange} />
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
                        <motion.div key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setVstupneDvere(opt.value)} className={`p-2 sm:p-3 rounded-lg cursor-pointer text-center transition-all ${vstupneDvere === opt.value ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 border-2 border-gray-200 hover:border-blue-300"}`}>
                          <span className="font-medium text-gray-800 text-xs sm:text-sm block">{opt.label}</span>
                          <span className={`${opt.value === "ziadne" ? "text-gray-400" : "text-green-600 font-bold"} text-[10px] sm:text-xs`}>{opt.price}</span>
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
                            <button onClick={() => opt.setter(Math.max(0, opt.state - 1))} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm">−</button>
                            <span className="w-6 text-center font-bold text-sm">{opt.state}</span>
                            <button onClick={() => opt.setter(opt.state + 1)} className="w-6 h-6 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm">+</button>
                          </div>
                          <span className="text-green-600 font-bold text-[10px] block mt-1 text-center">× {opt.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {showKluc && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="overflow-hidden border-2 border-emerald-300 shadow-lg">
                <SectionHeader icon={Key} title={t('phase3')} subtitle={t('phase3Subtitle')} color="from-emerald-600 to-teal-600" step="3" />
                <div className="p-2 sm:p-3 bg-gradient-to-b from-emerald-50/50 to-white">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                    <div className={`col-span-2 grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 border-[3px] sm:border-[4px] rounded-xl shadow-xl ${!vonkajsiaFasada ? 'border-red-600 bg-red-100/70 animate-pulse' : 'border-emerald-600 bg-emerald-100/70'}`}>
                      <p className={`col-span-2 text-[9px] sm:text-[10px] font-bold -mb-1 flex items-center gap-1 ${!vonkajsiaFasada ? 'text-red-600' : 'text-emerald-700'}`}>
                        <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold text-white ${!vonkajsiaFasada ? 'bg-red-600' : 'bg-emerald-600'}`}>1</span>
                        {t('facade')} ({t('selectOne')}) {!vonkajsiaFasada && <span className="text-red-500 ml-1">*{t('required')}</span>}
                      </p>
                      <Tile selected={vonkajsiaFasada === "standard"} onClick={() => setVonkajsiaFasada("standard")} icon={Building2} iconColor="text-emerald-600" iconSelectedColor="text-emerald-800" title={t('facadeWoodMetal')} subtitle={t('facadeStandard')} price="0 €" isPriced={false} />
                      <Tile selected={vonkajsiaFasada === "suchana"} onClick={() => setVonkajsiaFasada("suchana")} icon={Building2} iconColor="text-emerald-600" iconSelectedColor="text-emerald-800" title={t('facadeStucco')} subtitle={t('whitePlaster')} price={`+ ${CENY.vonkajsiaFasada.suchana.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="vonkajsiaFasada_suchana" onPriceChange={handlePriceChange} />
                    </div>

                    <Tile selected={vnutornePodlahy} onClick={() => setVnutornePodlahy(!vnutornePodlahy)} icon={Maximize} iconColor="text-emerald-600" iconSelectedColor="text-emerald-800" title={t('floors')} subtitle={t('floorsLaminate')} price={`+ ${CENY.vnutornePodlahy.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="vnutornePodlahy" onPriceChange={handlePriceChange} />
                    <Tile selected={podlahovVykurovanie} onClick={() => setPodlahovVykurovanie(!podlahovVykurovanie)} icon={Flame} iconColor="text-emerald-600" iconSelectedColor="text-emerald-800" title={t('floorHeating')} subtitle={t('wifiThermostat')} price={`+ ${CENY.podlahovVykurovanie.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="podlahovVykurovanie" onPriceChange={handlePriceChange} />
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
                        <button onClick={() => setInterieroveDvere(Math.max(0, interieroveDvere - 1))} className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm">−</button>
                        <span className="w-6 text-center font-bold text-sm">{interieroveDvere}</span>
                        <button onClick={() => setInterieroveDvere(interieroveDvere + 1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {showDocs && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="overflow-hidden border-2 border-purple-300 shadow-lg">
                <SectionHeader icon={FileText} title={t('phase4')} subtitle={t('phase4Subtitle')} color="from-purple-600 to-violet-600" step="4" />
                <div className="p-2 sm:p-3 bg-gradient-to-b from-purple-50/50 to-white">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-2xl">
                    <Tile selected={inziniering} onClick={() => setInziniering(!inziniering)} icon={FileCheck} iconColor="text-purple-600" iconSelectedColor="text-purple-800" title={t('engineering')} subtitle={t('buildingPermit')} price={`+ ${CENY.inziniering.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="inziniering" onPriceChange={handlePriceChange} />
                    <Tile selected={projektA0} onClick={() => setProjektA0(!projektA0)} icon={FileText} iconColor="text-purple-600" iconSelectedColor="text-purple-800" title={t('projectA0')} subtitle={t('certification')} price={`+ ${CENY.projektA0.toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} isAdmin={isAdmin} priceKey="projektA0" onPriceChange={handlePriceChange} />
                    <Tile selected={revizna} onClick={() => setRevizna(!revizna)} icon={FileText} iconColor="text-purple-600" iconSelectedColor="text-purple-800" title={t('revision')} subtitle={t('documentation')} price={`+ ${CENY.revizna.toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="revizna" onPriceChange={handlePriceChange} />
                    <Tile selected={doprava} onClick={() => setDoprava(!doprava)} icon={Truck} iconColor="text-purple-600" iconSelectedColor="text-purple-800" title={t('transport')} subtitle={t('transportFull')} price="0 €" isPriced={false} />
                  </div>

                  {a0Odporucania && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800 mb-1 text-[10px] sm:text-xs">{t('a0Recommendations')}</p>
                          <ul className="space-y-0.5">
                            {a0Odporucania.map((item, index) => (
                              <li key={index} className="text-amber-700 flex items-center gap-1 text-[9px] sm:text-[10px]">
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
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        <p className="font-bold text-green-800 text-[10px] sm:text-xs">{t('configMeetsA0')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {!showOnlyPhase && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500"></div>
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 right-10 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative p-3 sm:p-5 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-5">
                      <div className="flex-1">
                        <p className="text-green-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider mb-1">{t('yourConfiguration')}</p>
                        <h3 className="text-base sm:text-xl font-bold text-white mb-1">{dom?.nazov || 'Fjord'}</h3>
                        <p className="text-slate-400 text-[10px] sm:text-sm mb-3">{t('completeCalculation')}</p>
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
                      <div className="text-right p-2 sm:p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl border border-green-500/20 lg:min-w-[240px]">
                        <p className="text-slate-400 mb-1 text-[9px] sm:text-xs">{t('totalWithVAT')}</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                          {formatPrice(totalPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-slate-700/50 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <Button 
                        size="lg" 
                        onClick={() => setShowContactModal(true)}
                        className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm px-4 sm:px-8 py-3 sm:py-4 w-full sm:w-auto shadow-2xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40"
                      >
                        <Send className="mr-1.5 sm:mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {t('showHouseAndSendQuote')}
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
            </motion.div>
          )}

          {showFinale && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('readyToStart')}</h3>
                  <p className="text-white/90 mb-4 text-xs sm:text-sm">{t('finalPhaseDesc')}</p>
                  <Button 
                    size="lg" 
                    onClick={() => setShowContactModal(true)}
                    className="bg-white text-green-600 hover:bg-gray-100 font-bold text-sm sm:text-base px-6 sm:px-10 py-4 sm:py-5 shadow-2xl transition-all hover:scale-105"
                  >
                    <Send className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    {t('showHouseAndSendQuote')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {!showOnlySummary && (
        <>
          <FloatingPrice
            price={totalPrice}
            isVisible={true}
            onSendQuote={handleSendQuoteFromFloating}
            dom={dom}
            vyrobca="Prosto House"
            buttonText="Pošli cenovú ponuku"
          />
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
        </>
      )}
    </div>
  );
}