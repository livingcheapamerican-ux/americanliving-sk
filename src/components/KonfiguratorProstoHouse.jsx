import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles, CheckCircle, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

import KonfiguratorContactModal from "./KonfiguratorContactModal";
import { useLanguage } from "./LanguageContext";

import EditableTile from "./EditableTile";
import FloatingPrice from "./FloatingPrice";

// Konštantné mapovanie farieb pre sekcie - predchádza blikaniu
const SECTION_COLORS = {
  "2": "from-blue-600 to-indigo-600",
  "3": "from-emerald-600 to-teal-600",
  "4": "from-purple-600 to-violet-600"
};

export default function KonfiguratorProstoHouse({ 
  dom,
  onReset,
  onConfigChange,
  dynamicTexts = null,
  predajNehnutelnosti, setPredajNehnutelnosti,
  hladaniePozemku, setHladaniePozemku,
  financneSluzby, setFinancneSluzby,
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
  showOnlyPhase = null,
  typStavby = ""
}) {
  const BASE_PRICE = dom?.zakladna_cena || 0;

  const { t, language } = useLanguage();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  console.log('=== USER QUERY STATE ===');
  console.log('user:', user);
  console.log('userLoading:', userLoading);
  console.log('userError:', userError);
  console.log('user?.role:', user?.role);
  console.log('user?.super_admin:', user?.super_admin);
  console.log('isAdmin:', isAdmin);

  // Načítanie dynamických textov pre tooltips
  const { data: konfiguratorTexts } = useQuery({
    queryKey: ['konfigurator-texts-prosto'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Prosto House' }),
    initialData: []
  });

  const getTooltip = (polozkaId, defaultText) => {
    if (!konfiguratorTexts || konfiguratorTexts.length === 0) return defaultText;
    const text = konfiguratorTexts.find(t => t.polozka_id === polozkaId);
    return text?.tooltip || defaultText;
  };

  // Ultra izolácia - mapovanie cien podľa domu
  const ultraIzolaciaMapping = {
    "Flat Double": 21750,
    "Flat House 1,5": 16500,
    "Nord": 12000,
    "Barn Double": 10125,
    "Flat": 11063,
    "A-Frame": 6000,
    "Barn": 5250,
    "Flat Small": 5250
  };
  
  const hasUltraInsulation = ultraIzolaciaMapping[dom?.nazov] !== undefined;
  const ultraDefaultPrice = ultraIzolaciaMapping[dom?.nazov] || 10125;

  // Cenník - Prosto House (DEFAULT hodnoty)
  const DEFAULT_CENY = {
    montaz: { nie: 0, ano: 9225 },
    predlzenie: { 0: 0, 1.2: 6600, 2.4: 13200, 3.6: 19800, 4.8: 26400 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 2700, premium: 5400, ultra: ultraDefaultPrice },
    elektroinstalacia: 3900,
    vodaKanalizacia: 1150,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 1600,
    rekuperacia: 3321,
    zaklady: { bez: 0, skrutky: 4751, doska: 9633, pasove: 11823 },
    pripojkaSiete: 1501,
    inziniering: 2592,
    projektA0: 3500,
    interierFinis: { ziadne: 0, drevo: 8200, sadrokarton: 9430 },
    vonkajsiaFasada: { standard: 0, suchana: 6371 },
    povrchokaOkien: 1450,
    vnutornePodlahy: 1750,
    podlahovVykurovanie: 3960,
    interieroveDvere: 250,
    tonovaneSkla: 700,
    doprava: 0,
    revizna: 1000,
    stresneOkno: 760,
    bocneOknoFixne: 500,
    bocneOknoVyklopne90: 540,
    bocneOknoVyklopne55: 225
  };

  // Načítať custom ceny z databázy pre tento konkrétny dom
  const customCeny = dom?.konfigurator_custom_ceny_prosto_house || {};

  // Funkcia na získanie ceny - podporuje aj vnorené objekty z databázy
  const getPrice = (category, key = null) => {
    console.log(`[getPrice] START - category: ${category}, key: ${key}`);
    console.log(`[getPrice] DEFAULT_CENY:`, DEFAULT_CENY);
    console.log(`[getPrice] DEFAULT_CENY[${category}]:`, DEFAULT_CENY[category]);
    
    // Špeciálne mapovanie pre ultra izoláciu (v DB je izolacia_extra)
    if (category === 'izolacia' && key === 'ultra') {
      const ultraValue = customCeny.izolacia_extra;
      if (ultraValue !== undefined && ultraValue !== null && ultraValue !== 0) {
        console.log(`[getPrice] Using ultra (extra) custom value: ${ultraValue}`);
        return ultraValue;
      }
      return DEFAULT_CENY.izolacia.ultra;
    }
    
    // Jednoduchá hodnota (napr. elektroinstalacia)
    if (key === null) {
      const customValue = customCeny[category];
      console.log(`[getPrice] Simple value - customValue:`, customValue);
      
      // Ak existuje custom hodnota A NIE JE 0, použijeme ju
      // Explicitné nuly ignorujeme a použijeme defaultnú hodnotu
      if (customValue !== undefined && customValue !== null && customValue !== 0) {
        console.log(`[getPrice] Using custom value: ${customValue}`);
        return customValue;
      }
      
      const defaultValue = DEFAULT_CENY[category] ?? 0;
      console.log(`[getPrice] Using default value: ${defaultValue}`);
      return defaultValue;
    }
    
    // Vnorený objekt (napr. montaz.ano, predlzenie.1.2)
    const customCategory = customCeny[category];
    console.log(`[getPrice] Nested - customCategory:`, customCategory);
    console.log(`[getPrice] DEFAULT_CENY[${category}][${key}]:`, DEFAULT_CENY[category]?.[key]);
    
    if (customCategory && typeof customCategory === 'object') {
      const customValue = customCategory[key];
      console.log(`[getPrice] Nested value - customValue:`, customValue);
      
      // Ak existuje konkrétna hodnota A NIE JE 0, použijeme ju
      // Explicitné nuly ignorujeme a použijeme defaultnú hodnotu
      if (customValue !== undefined && customValue !== null && customValue !== 0) {
        console.log(`[getPrice] Using nested custom value: ${customValue}`);
        return customValue;
      }
    }
    
    const defaultValue = DEFAULT_CENY[category]?.[key] ?? 0;
    console.log(`[getPrice] FINAL - Using nested default value: ${defaultValue}`);
    return defaultValue;
  };

  console.log('=== DIAGNOSTIKA CENNÍKA ===');
  console.log('customCeny:', customCeny);
  console.log('getPrice("montaz", "ano"):', getPrice('montaz', 'ano'));
  console.log('getPrice("izolacia", "zvysena"):', getPrice('izolacia', 'zvysena'));
  console.log('getPrice("zaklady", "skrutky"):', getPrice('zaklady', 'skrutky'));

  // Cenník - s možnosťou override z databázy
  const CENY = {
    montaz: { nie: 0, ano: getPrice('montaz', 'ano') },
    predlzenie: { 
      0: 0, 
      1.2: getPrice('predlzenie', 1.2), 
      2.4: getPrice('predlzenie', 2.4), 
      3.6: getPrice('predlzenie', 3.6), 
      4.8: getPrice('predlzenie', 4.8) 
    },
    dvere: { 
      ziadne: 0, 
      kovove: getPrice('dvere', 'kovove'), 
      plastove: getPrice('dvere', 'plastove') 
    },
    izolacia: { 
      standard: 0, 
      zvysena: getPrice('izolacia', 'zvysena'), 
      premium: getPrice('izolacia', 'premium'), 
      ultra: getPrice('izolacia', 'ultra') 
    },
    elektroinstalacia: getPrice('elektroinstalacia'),
    vodaKanalizacia: getPrice('vodaKanalizacia'),
    sanitaKomplet: getPrice('sanitaKomplet'),
    bojler: getPrice('bojler'),
    tepelneCerpadlo: getPrice('tepelneCerpadlo'),
    rekuperacia: getPrice('rekuperacia'),
    zaklady: { 
      bez: 0, 
      skrutky: getPrice('zaklady', 'skrutky'), 
      doska: getPrice('zaklady', 'doska'), 
      pasove: getPrice('zaklady', 'pasove') 
    },
    pripojkaSiete: getPrice('pripojkaSiete'),
    inziniering: getPrice('inziniering'),
    projektA0: getPrice('projektA0'),
    interierFinis: { 
      ziadne: 0, 
      drevo: getPrice('interierFinis', 'drevo'), 
      sadrokarton: getPrice('interierFinis', 'sadrokarton') 
    },
    vonkajsiaFasada: { 
      standard: 0, 
      suchana: getPrice('vonkajsiaFasada', 'suchana') 
    },
    povrchokaOkien: getPrice('povrchokaOkien'),
    vnutornePodlahy: getPrice('vnutornePodlahy'),
    podlahovVykurovanie: getPrice('podlahovVykurovanie'),
    interieroveDvere: getPrice('interieroveDvere'),
    tonovaneSkla: getPrice('tonovaneSkla'),
    doprava: getPrice('doprava'),
    revizna: getPrice('revizna'),
    stresneOkno: getPrice('stresneOkno'),
    bocneOknoFixne: getPrice('bocneOknoFixne'),
    bocneOknoVyklopne90: getPrice('bocneOknoVyklopne90'),
    bocneOknoVyklopne55: getPrice('bocneOknoVyklopne55')
  };

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
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55, BASE_PRICE]);

  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium" && izolaciaNavysenie !== "ultra") chybajuce.push(t("a0RecInsulation"));
    if (!tepelneCerpadlo) chybajuce.push(t("a0RecHeatPump"));
    if (!rekuperacia) chybajuce.push(t("a0RecRecuperation"));
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia, t]);

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
      items.push({ name: `${t('extension')} +${predlzenie}m`, price: CENY.predlzenie[predlzenie] || 0, section: "hruba", selected: true });
    }
    
    const izolaciaLabel = izolaciaNavysenie === "ultra" ? t('insulationUltra') : izolaciaNavysenie === "premium" ? t('insulationPremium') : izolaciaNavysenie === "zvysena" ? t('insulationEnhanced') : t('insulationStd');
    const izolaciaPrice = izolaciaNavysenie === "ultra" ? CENY.izolacia.ultra : izolaciaNavysenie === "premium" ? CENY.izolacia.premium : izolaciaNavysenie === "zvysena" ? CENY.izolacia.zvysena : 0;
    items.push({ name: izolaciaLabel, price: izolaciaPrice, section: "hruba", selected: izolaciaNavysenie !== "standard" });
    
    const zakladyLabel = zaklady === "pasove" ? t('foundationsStrip') : zaklady === "doska" ? t('foundationsSlab') : zaklady === "skrutky" ? t('foundationsScrews') : t('foundationsLabel');
    const zakladyPrice = zaklady === "pasove" ? CENY.zaklady.pasove : zaklady === "doska" ? CENY.zaklady.doska : zaklady === "skrutky" ? CENY.zaklady.skrutky : 0;
    items.push({ name: zakladyLabel, price: zakladyPrice, section: "hruba", selected: zaklady !== "bez" });
    
    const interierLabel = interierFinis === "drevo" ? t('interiorWood') : interierFinis === "sadrokarton" ? t('interiorDrywall') : t('interiorNone');
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
    items.push({ name: dvereLabel, price: dverePrice, section: "holodom", selected: true });
    
    if (stresneOkno > 0) items.push({ name: `${t('roofWindow')} (${stresneOkno}×)`, price: stresneOkno * CENY.stresneOkno, section: "holodom", selected: true });
    if (bocneOknoFixne > 0) items.push({ name: `${t('fixedWindow')} (${bocneOknoFixne}×)`, price: bocneOknoFixne * CENY.bocneOknoFixne, section: "holodom", selected: true });
    if (bocneOknoVyklopne90 > 0) items.push({ name: `${t('tiltWindow')} 90×205 (${bocneOknoVyklopne90}×)`, price: bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90, section: "holodom", selected: true });
    if (bocneOknoVyklopne55 > 0) items.push({ name: `${t('tiltWindow')} 55×90 (${bocneOknoVyklopne55}×)`, price: bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55, section: "holodom", selected: true });
    items.push({ name: t('lamination') + " - " + t('laminationAnthracite'), price: povrchokaOkien ? CENY.povrchokaOkien : 0, section: "holodom", selected: povrchokaOkien });
    items.push({ name: t('tintedGlass') + " (Solar)", price: tonovaneSkla ? CENY.tonovaneSkla : 0, section: "holodom", selected: tonovaneSkla });
    
    const fasadaLabel = vonkajsiaFasada === "suchana" ? t('facadeStucco') : vonkajsiaFasada === "standard" ? t('facadeWoodMetal') : t('facade');
    const fasadaPrice = vonkajsiaFasada === "suchana" ? CENY.vonkajsiaFasada.suchana : 0;
    items.push({ name: fasadaLabel, price: fasadaPrice, section: "kluc", selected: !!vonkajsiaFasada });

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
      interieroveDvere, inziniering, projektA0, revizna, doprava, language, BASE_PRICE, t]);

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
      setPredlzenie?.(0);
    }
  };

  const SectionHeader = ({ icon: Icon, title, subtitle, step }) => {
    const colorClass = SECTION_COLORS[step] || "from-blue-600 to-indigo-600";
    
    return (
      <div className={`relative flex items-center gap-1 sm:gap-3 p-1.5 sm:p-3 bg-gradient-to-r ${colorClass}`}>
        <div className="relative flex items-center justify-center w-6 h-6 sm:w-10 sm:h-10 bg-white/90 rounded-md sm:rounded-xl shadow-lg flex-shrink-0">
          <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-gray-800" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
            <span className="inline-flex items-center justify-center px-1 sm:px-2 py-0.5 bg-white/90 rounded-full text-gray-800 text-[8px] sm:text-xs font-bold uppercase tracking-wider">
              {t('phase')} {step}
            </span>
          </div>
          <h3 className="text-xs sm:text-lg font-bold text-white tracking-tight truncate drop-shadow-lg">{title}</h3>
          {subtitle && <p className="text-white text-[9px] sm:text-xs mt-0.5 truncate drop-shadow-md">{subtitle}</p>}
        </div>
      </div>
    );
  };

  if (showOnlySummary) {
    return (
      <div>
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 ring-2 ring-green-500/30">
          <div className="p-3 border-b-2 border-slate-300 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-900 text-xs font-bold uppercase tracking-wider mb-0.5">{t('yourConfiguration')}</p>
                <h3 className="text-base font-black text-gray-900">{dom?.nazov || 'Prosto House'}</h3>
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
            inziniering={inziniering}
            revizna={revizna}
            doprava={doprava}
            predajNehnutelnosti={predajNehnutelnosti}
            hladaniePozemku={hladaniePozemku}
            financneSluzby={financneSluzby}
          />

          <div className="px-2 py-1 max-h-[65vh] overflow-y-auto">
            {selectedItems.map((item, index) => {
              const isBase = item.section === "base";
              const prevItem = selectedItems[index - 1];
              const showServicesDivider = item.section === "services" && (!prevItem || prevItem.section === "base");
              const showHrubaDivider = item.section === "hruba" && (!['hruba', 'services', 'base'].includes(prevItem?.section));
              const showHolodomDivider = item.section === "holodom" && (!['holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));
              const showKlucDivider = item.section === "kluc" && (!['kluc', 'holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));
              const showDocsDivider = item.section === "docs" && (!['docs', 'kluc', 'holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));

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

  const showHruba = !showOnlyPhase || showOnlyPhase === "hruba";
  const showHolodom = !showOnlyPhase || showOnlyPhase === "holodom";
  const showKluc = !showOnlyPhase || showOnlyPhase === "kluc";
  const showDocs = !showOnlyPhase || showOnlyPhase === "docs";
  const showFinale = !showOnlyPhase || showOnlyPhase === "finale";

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
        inziniering, projektA0, revizna, doprava, predlzenie,
        predajNehnutelnosti, hladaniePozemku, financneSluzby,
        language: language
      });
      return response;
    } catch (error) {
      console.error('Error in handleSendQuoteFromFloating:', error);
      throw error;
    }
  };

  return (
    <div className="mt-4 sm:mt-8 relative overflow-x-hidden">
      <FloatingPrice 
        price={totalPrice} 
        isVisible={true} 
        onSendQuote={handleSendQuoteFromFloating}
        dom={dom}
        vyrobca="Prosto House"
        buttonText={t('showHouseAndSendQuote')}
      />

      <div className="w-full max-w-full overflow-hidden">
        <div className="space-y-3 sm:space-y-6">

          {showHruba && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border-2 border-amber-300 shadow-lg">
                <SectionHeader 
                  icon={Package} 
                  title={t('phase1')} 
                  subtitle={t('phase1Subtitle')}
                  step="1"
                />
                <div className="p-1.5 sm:p-6 bg-gradient-to-b from-amber-50/50 to-white">
                  <p className="text-[10px] sm:text-xs text-red-600 mb-3 text-center">* {t('assemblyNote')}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">

                    {/* Montáž - skupina */}
                    <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-amber-600 rounded-lg sm:rounded-xl bg-amber-100/70 shadow-xl">
                      <p className="col-span-2 text-[8px] sm:text-[10px] font-bold text-amber-700 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">1</span>
                        {t('assembly')} ({t('selectOne')})
                      </p>

                      <EditableTile
                        selected={montazHolodomu === "nie"}
                        onClick={() => setMontazHolodomu("nie")}
                        title={t('assemblyNo')}
                        subtitle={t('onlyKit')}
                        price="0 €"
                        isPriced={false}
                        isIncluded={true}
                        t={t}
                        isAdmin={isAdmin}
                      />

                      <EditableTile
                        selected={montazHolodomu === "ano"}
                        onClick={() => setMontazHolodomu("ano")}
                        title={t('assemblyYes')}
                        subtitle={t('phase1')}
                        price={`+ ${CENY.montaz.ano.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="montaz_ano"
                        onPriceChange={handlePriceChange}
                      />
                    </div>

                    {/* Predĺženie */}
                    {predlzenie !== undefined && (
                      <div className="col-span-1 sm:col-span-3 lg:col-span-4 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-indigo-600 rounded-lg sm:rounded-xl bg-indigo-100/70 shadow-xl">
                        <p className="text-[8px] sm:text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1">
                          <span className="w-3.5 h-3.5 sm:w-6 sm:h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-xs font-extrabold">+</span>
                          Predĺženie dĺžky domu (v násobkoch 1,2m)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-2">
                          {[
                            { value: 0, label: "Bez predĺženia", price: 0 },
                            { value: 1.2, label: "+1,2 m", price: CENY.predlzenie[1.2] },
                            { value: 2.4, label: "+2,4 m", price: CENY.predlzenie[2.4] },
                            { value: 3.6, label: "+3,6 m", price: CENY.predlzenie[3.6] },
                            { value: 4.8, label: "+4,8 m", price: CENY.predlzenie[4.8] }
                          ].map((opt) => (
                            <motion.div
                              key={opt.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPredlzenie(opt.value)}
                              className={`p-1.5 sm:p-3 rounded-md sm:rounded-lg cursor-pointer text-center transition-all ${
                                predlzenie === opt.value 
                                  ? "bg-indigo-200 border-2 border-indigo-600 shadow-lg" 
                                  : "bg-white border-2 border-gray-200 hover:border-indigo-300"
                              }`}
                            >
                              <Maximize className={`w-3 h-3 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 ${predlzenie === opt.value ? "text-indigo-600" : "text-gray-400"}`} />
                              <span className="font-medium text-gray-800 text-[9px] sm:text-xs block">{opt.label}</span>
                              <span className={`text-[8px] sm:text-xs ${opt.price === 0 ? "text-gray-400" : "text-green-600 font-bold"}`}>
                                {opt.price > 0 ? `+ ${opt.price.toLocaleString('sk-SK')} €` : '0 €'}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Izolácia - skupina */}
                    <div className="col-span-1 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-cyan-600 rounded-lg sm:rounded-xl bg-cyan-100/70 shadow-xl">
                      <p className="col-span-2 sm:col-span-4 text-[8px] sm:text-[10px] font-bold text-cyan-700 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">2</span>
                        {t('insulation')} ({t('selectOne')})
                      </p>

                      <EditableTile
                        selected={izolaciaNavysenie === "standard"}
                        onClick={() => setIzolaciaNavysenie("standard")}
                        title={t('insulationStandard')}
                        subtitle="150/200mm"
                        price="0 €"
                        isPriced={false}
                        isIncluded={true}
                        t={t}
                        isAdmin={false}
                      />

                      <EditableTile
                        selected={izolaciaNavysenie === "zvysena"}
                        onClick={() => setIzolaciaNavysenie("zvysena")}
                        title={t('insulationEnhanced')}
                        subtitle={t('insulationEnhancedDesc')}
                        price={`+ ${CENY.izolacia.zvysena.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="izolacia_zvysena"
                        onPriceChange={handlePriceChange}
                      />

                      <EditableTile
                        selected={izolaciaNavysenie === "premium"}
                        onClick={() => setIzolaciaNavysenie("premium")}
                        title={t('insulationPremium')}
                        subtitle={t('insulationPremiumDesc')}
                        price={`+ ${CENY.izolacia.premium.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        isA0={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="izolacia_premium"
                        onPriceChange={handlePriceChange}
                      />

                      <EditableTile
                        selected={izolaciaNavysenie === "ultra"}
                        onClick={() => setIzolaciaNavysenie("ultra")}
                        title="Ultra 300mm"
                        subtitle={t('insulationUltraDesc')}
                        price={`+ ${CENY.izolacia.ultra.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        isA0={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="izolacia_extra"
                        onPriceChange={handlePriceChange}
                      />
                    </div>

                    {/* Základy - skupina */}
                    <div className="col-span-1 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-orange-600 rounded-lg sm:rounded-xl bg-orange-100/70 shadow-xl">
                      <p className="col-span-2 sm:col-span-4 text-[8px] sm:text-[10px] font-bold text-orange-700 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">3</span>
                        {t('foundations')} ({t('selectOne')})
                      </p>

                      <EditableTile
                        selected={zaklady === "bez"}
                        onClick={() => setZaklady("bez")}
                        title={t('foundationsNone')}
                        subtitle={t('own')}
                        price="0 €"
                        isPriced={false}
                        isIncluded={true}
                        t={t}
                        isAdmin={false}
                      />

                      <EditableTile
                        selected={zaklady === "skrutky"}
                        onClick={() => setZaklady("skrutky")}
                        title="Pilóty/Pätky"
                        subtitle={t('groundFootings')}
                        price={`+ ${CENY.zaklady.skrutky.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="zaklady_skrutky"
                        onPriceChange={handlePriceChange}
                      />

                      <EditableTile
                        selected={zaklady === "doska"}
                        onClick={() => setZaklady("doska")}
                        title={t('foundationsSlab')}
                        subtitle={t('foundationSlab')}
                        price={`+ ${CENY.zaklady.doska.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="zaklady_doska"
                        onPriceChange={handlePriceChange}
                      />

                      <EditableTile
                        selected={zaklady === "pasove"}
                        onClick={() => setZaklady("pasove")}
                        title={t('foundationsStrip')}
                        subtitle={t('stripFound')}
                        price={`+ ${CENY.zaklady.pasove.toLocaleString('sk-SK')} €`}
                        isPriced={true}
                        t={t}
                        isAdmin={isAdmin}
                        priceKey="zaklady_pasove"
                        onPriceChange={handlePriceChange}
                      />
                    </div>

                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {showHolodom && <motion.div
            ref={(el) => {
              if (el && window.innerWidth < 768) {
                setTimeout(() => {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
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
              <div className="p-1.5 sm:p-6 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">

                  <div className="col-span-1 sm:col-span-3 grid grid-cols-3 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-blue-600 rounded-lg sm:rounded-xl bg-blue-100/70 shadow-xl">
                    <p className="col-span-3 text-[8px] sm:text-[10px] font-bold text-blue-700 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                      <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">1</span>
                      {t('interiorFinish')} ({t('selectOne')})
                    </p>
                    <EditableTile
                      selected={interierFinis === "ziadne"}
                      onClick={() => setInterierFinis("ziadne")}
                      title={t('interiorNone')}
                      subtitle={t('shellConstruction')}
                      price="0 €"
                      isPriced={false}
                      isIncluded={true}
                      t={t}
                      isAdmin={false}
                    />

                    <EditableTile
                      selected={interierFinis === "drevo"}
                      onClick={() => setInterierFinis("drevo")}
                      title={t('interiorWood')}
                      subtitle={t('woodCladding')}
                      price={`+ ${CENY.interierFinis.drevo.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="interierFinis_drevo"
                      onPriceChange={handlePriceChange}
                    />

                    <EditableTile
                      selected={interierFinis === "sadrokarton"}
                      onClick={() => setInterierFinis("sadrokarton")}
                      title={t('interiorDrywall')}
                      subtitle={t('plaster')}
                      price={`+ ${CENY.interierFinis.sadrokarton.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="interierFinis_sadrokarton"
                      onPriceChange={handlePriceChange}
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-yellow-500 rounded-lg sm:rounded-xl bg-yellow-100/70 shadow-xl">
                    <p className="col-span-2 text-[8px] sm:text-[10px] font-bold text-yellow-800 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                      <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">2</span>
                      {t('electrical')} & {t('water')}
                    </p>
                    <EditableTile
                      selected={elektroinstalacia}
                      onClick={() => setElektroinstalacia(!elektroinstalacia)}
                      title={t('electrical')}
                      subtitle={t('wiring')}
                      price={`+ ${CENY.elektroinstalacia.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="elektroinstalacia"
                      onPriceChange={handlePriceChange}
                    />

                    <EditableTile
                      selected={vodaKanalizacia}
                      onClick={() => setVodaKanalizacia(!vodaKanalizacia)}
                      title={t('water')}
                      subtitle={t('wiring')}
                      price={`+ ${CENY.vodaKanalizacia.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="vodaKanalizacia"
                      onPriceChange={handlePriceChange}
                    />

                    <EditableTile
                      selected={sanitaKomplet}
                      onClick={() => setSanitaKomplet(!sanitaKomplet)}
                      title={t('sanitary')}
                      subtitle={t('complete')}
                      price={`+ ${CENY.sanitaKomplet.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="sanitaKomplet"
                      onPriceChange={handlePriceChange}
                    />

                    <EditableTile
                      selected={bojler}
                      onClick={() => setBojler(!bojler)}
                      title={t('boiler')}
                      subtitle={t('boilerElectric')}
                      price={`+ ${CENY.bojler.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="bojler"
                      onPriceChange={handlePriceChange}
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] border-green-600 rounded-lg sm:rounded-xl bg-green-100/70 shadow-xl">
                    <p className="col-span-2 text-[8px] sm:text-xs font-bold text-green-800 -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1">
                      <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold">3</span>
                      {t('heatPump')} & {t('recuperation')} (A0)
                    </p>
                    <EditableTile
                      selected={tepelneCerpadlo}
                      onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)}
                      title={t('heatPump')}
                      subtitle={t('units5')}
                      price={`+ ${CENY.tepelneCerpadlo.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      isA0={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="tepelneCerpadlo"
                      onPriceChange={handlePriceChange}
                    />

                    <EditableTile
                      selected={rekuperacia}
                      onClick={() => setRekuperacia(!rekuperacia)}
                      title={t('recuperation')}
                      subtitle="3 ks"
                      price={`+ ${CENY.rekuperacia.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      isA0={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="rekuperacia"
                      onPriceChange={handlePriceChange}
                    />
                  </div>

                  <EditableTile
                    selected={pripojkaSiete}
                    onClick={() => setPripojkaSiete(!pripojkaSiete)}
                    title={t('gridConnection')}
                    subtitle={t('connection')}
                    price={`+ ${CENY.pripojkaSiete.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="pripojkaSiete"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={povrchokaOkien}
                    onClick={() => setPovrchokaOkien(!povrchokaOkien)}
                    title={t('lamination')}
                    subtitle={t('laminationAnthracite')}
                    price={`+ ${CENY.povrchokaOkien.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="povrchokaOkien"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={tonovaneSkla}
                    onClick={() => setTonovaneSkla(!tonovaneSkla)}
                    title={t('tintedGlass')}
                    subtitle={t('solarGlass')}
                    price={`+ ${CENY.tonovaneSkla.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="tonovaneSkla"
                    onPriceChange={handlePriceChange}
                  />

                </div>

                <div className="mt-2 sm:mt-3 p-1.5 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-[8px] sm:text-xs font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-1">
                    <DoorOpen className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-600" />
                    {t('entryDoor')}
                  </p>
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
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
                        className={`p-1.5 sm:p-3 rounded-md sm:rounded-lg cursor-pointer text-center transition-all ${
                          vstupneDvere === opt.value 
                            ? "bg-blue-100 border-2 border-blue-500" 
                            : "bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <span className="font-medium text-gray-800 text-[9px] sm:text-sm block">{opt.label}</span>
                        <span className={`text-[8px] sm:text-xs ${opt.value === "ziadne" ? "text-gray-400" : "text-green-600 font-bold"}`}>{opt.price}</span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-[8px] sm:text-xs font-bold text-gray-700 mt-2 sm:mt-3 mb-1.5 sm:mb-2 flex items-center gap-1">
                    <Square className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-blue-600" />
                    {t('additionalWindows')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
                    {[
                      { state: stresneOkno, setter: setStresneOkno, label: t('roofWindow'), price: `${CENY.stresneOkno.toLocaleString('sk-SK')} €` },
                      { state: bocneOknoFixne, setter: setBocneOknoFixne, label: `${t('fixedWindow')} 90×205`, price: `${CENY.bocneOknoFixne.toLocaleString('sk-SK')} €` },
                      { state: bocneOknoVyklopne90, setter: setBocneOknoVyklopne90, label: `${t('tiltWindow')} 90×205`, price: `${CENY.bocneOknoVyklopne90.toLocaleString('sk-SK')} €` },
                      { state: bocneOknoVyklopne55, setter: setBocneOknoVyklopne55, label: `${t('tiltWindow')} 55×90`, price: `${CENY.bocneOknoVyklopne55.toLocaleString('sk-SK')} €` }
                    ].map((opt, idx) => (
                      <div key={idx} className={`p-1.5 sm:p-3 rounded-md sm:rounded-lg border-2 transition-all ${opt.state > 0 ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-200"}`}>
                        <span className="font-medium text-gray-800 text-[8px] sm:text-xs block mb-0.5 sm:mb-1 leading-tight">{opt.label}</span>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                          <button 
                            onClick={() => opt.setter(Math.max(0, opt.state - 1))}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs sm:text-sm"
                          >−</button>
                          <span className="w-4 sm:w-6 text-center font-bold text-xs sm:text-sm">{opt.state}</span>
                          <button 
                            onClick={() => opt.setter(opt.state + 1)}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm"
                          >+</button>
                        </div>
                        <span className="text-green-600 font-bold text-[8px] sm:text-[10px] block mt-0.5 sm:mt-1 text-center">
                          × {opt.label === t('roofWindow') 
                            ? CENY.stresneOkno.toLocaleString('sk-SK') + ' €'
                            : opt.label === `${t('fixedWindow')} 90×205`
                            ? CENY.bocneOknoFixne.toLocaleString('sk-SK') + ' €'
                            : opt.label === `${t('tiltWindow')} 90×205`
                            ? CENY.bocneOknoVyklopne90.toLocaleString('sk-SK') + ' €'
                            : CENY.bocneOknoVyklopne55.toLocaleString('sk-SK') + ' €'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          </motion.div>}

          {showKluc && <motion.div
            ref={(el) => {
              if (el && window.innerWidth < 768) {
                setTimeout(() => {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
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
              <div className="p-1.5 sm:p-6 bg-gradient-to-b from-emerald-50/50 to-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">

                  <div className={`col-span-1 sm:col-span-2 grid grid-cols-2 gap-1 sm:gap-2 p-1.5 sm:p-3 border-[2px] sm:border-[4px] rounded-lg sm:rounded-xl shadow-xl ${!vonkajsiaFasada ? 'border-red-600 bg-red-100/70 animate-pulse' : 'border-emerald-600 bg-emerald-100/70'}`}>
                    <p className={`col-span-2 text-[8px] sm:text-[10px] font-bold -mb-0.5 sm:-mb-1 flex items-center gap-0.5 sm:gap-1 ${!vonkajsiaFasada ? 'text-red-600' : 'text-emerald-700'}`}>
                      <span className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold text-white ${!vonkajsiaFasada ? 'bg-red-600' : 'bg-emerald-600'}`}>1</span>
                      {t('facade')} ({t('selectOne')}) {!vonkajsiaFasada && <span className="text-red-500 ml-1">*{t('required')}</span>}
                    </p>
                    <EditableTile
                      selected={vonkajsiaFasada === "standard"}
                      onClick={() => setVonkajsiaFasada("standard")}
                      title={t('facadeWoodMetal')}
                      subtitle="Drevo / Plech"
                      price="0 €"
                      isPriced={false}
                      isIncluded={true}
                      t={t}
                      isAdmin={false}
                    />

                    <EditableTile
                      selected={vonkajsiaFasada === "suchana"}
                      onClick={() => setVonkajsiaFasada("suchana")}
                      title={t('facadeStucco')}
                      subtitle={t('whitePlaster')}
                      price={`+ ${CENY.vonkajsiaFasada.suchana.toLocaleString('sk-SK')} €`}
                      isPriced={true}
                      t={t}
                      isAdmin={isAdmin}
                      priceKey="vonkajsiaFasada_suchana"
                      onPriceChange={handlePriceChange}
                    />
                  </div>

                  <EditableTile
                    selected={vnutornePodlahy}
                    onClick={() => setVnutornePodlahy(!vnutornePodlahy)}
                    title={t('floors')}
                    subtitle={t('floorsLaminate')}
                    price={`+ ${CENY.vnutornePodlahy.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="vnutornePodlahy"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={podlahovVykurovanie}
                    onClick={() => setPodlahovVykurovanie(!podlahovVykurovanie)}
                    title={t('floorHeating')}
                    subtitle={t('wifiThermostat')}
                    price={`+ ${CENY.podlahovVykurovanie.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="podlahovVykurovanie"
                    onPriceChange={handlePriceChange}
                  />

                </div>

                <div className="mt-2 sm:mt-3 p-1.5 sm:p-3 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DoorOpen className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-gray-800 text-[8px] sm:text-xs">{t('interiorDoors')}</span>
                        <span className="text-green-600 font-bold text-[8px] sm:text-[10px] ml-1">× {CENY.interieroveDvere.toLocaleString('sk-SK')} €</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setInterieroveDvere(Math.max(0, interieroveDvere - 1))}
                        className="w-5 h-5 sm:w-7 sm:h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs sm:text-sm"
                      >−</button>
                      <span className="w-4 sm:w-6 text-center font-bold text-xs sm:text-sm">{interieroveDvere}</span>
                      <button 
                        onClick={() => setInterieroveDvere(interieroveDvere + 1)}
                        className="w-5 h-5 sm:w-7 sm:h-7 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm"
                      >+</button>
                    </div>
                  </div>
                </div>

              </div>
            </Card>
          </motion.div>}

          {showDocs && <motion.div
            ref={(el) => {
              if (el && window.innerWidth < 768) {
                setTimeout(() => {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
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
              <div className="p-1.5 sm:p-6 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
                  
                  <EditableTile
                    selected={inziniering}
                    onClick={() => setInziniering(!inziniering)}
                    title={t('engineering')}
                    subtitle={t('buildingPermit')}
                    price={`+ ${CENY.inziniering.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="inziniering"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={projektA0}
                    onClick={() => setProjektA0(!projektA0)}
                    title={t('projectA0')}
                    subtitle={t('certification')}
                    price={`+ ${CENY.projektA0.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    isA0={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="projektA0"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={revizna}
                    onClick={() => setRevizna(!revizna)}
                    title={t('revision')}
                    subtitle={t('documentation')}
                    price={`+ ${CENY.revizna.toLocaleString('sk-SK')} €`}
                    isPriced={true}
                    t={t}
                    isAdmin={isAdmin}
                    priceKey="revizna"
                    onPriceChange={handlePriceChange}
                  />

                  <EditableTile
                    selected={doprava}
                    onClick={() => setDoprava(!doprava)}
                    title={t('transport')}
                    subtitle={t('transportFull')}
                    price="0 €"
                    isPriced={false}
                    isIncluded={true}
                    t={t}
                    isAdmin={false}
                  />

                </div>

                {a0Odporucania && (
                  <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-amber-50 border-2 border-amber-300 rounded-lg sm:rounded-xl">
                    <div className="flex items-start gap-1.5 sm:gap-3">
                      <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-800 mb-1 text-[9px] sm:text-sm">{t('a0Recommendations')}</p>
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
                  <div className="mt-2 sm:mt-4 p-2 sm:p-4 bg-green-50 border-2 border-green-300 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
                      <p className="font-bold text-green-800 text-[9px] sm:text-sm">{t('configMeetsA0')}</p>
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

                <div className="relative p-3 sm:p-8 md:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-8">
                    <div className="flex-1">
                      <p className="text-green-400 text-[9px] sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">{t('yourConfiguration')}</p>
                      <h3 className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">{dom?.nazov || 'Prosto House'}</h3>
                      <p className="text-slate-400 text-[10px] sm:text-base mb-3 sm:mb-4">{t('completeCalculation')}</p>
                      {projektA0 && !a0Odporucania && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] sm:text-sm py-0.5 sm:py-1.5 px-1.5 sm:px-4 shadow-lg shadow-green-500/30">✓ {t('meetsA0')}</Badge>
                      )}
                    
                      <div className="mt-3 sm:mt-6 bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-slate-700/50 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                        <p className="text-slate-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">{t('selectedItems')}</p>
                        <div className="space-y-1">
                          {selectedItems.map((item, index) => {
                            const isBase = item.section === "base";
                            const prevItem = selectedItems[index - 1];
                            const showServicesDivider = item.section === "services" && (!prevItem || prevItem.section === "base");
                            const showHrubaDivider = item.section === "hruba" && (!['hruba', 'services', 'base'].includes(prevItem?.section));
                            const showHolodomDivider = item.section === "holodom" && (!['holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));
                            const showKlucDivider = item.section === "kluc" && (!['kluc', 'holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));
                            const showDocsDivider = item.section === "docs" && (!['docs', 'kluc', 'holodom', 'hruba', 'services', 'base'].includes(prevItem?.section));
                            
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
                    <div className="text-right p-2 sm:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-2xl border border-green-500/20 lg:min-w-[280px]">
                      <p className="text-slate-400 mb-1 sm:mb-2 text-[9px] sm:text-sm">{t('totalWithVAT')}</p>
                      <p className="text-2xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-10 pt-3 sm:pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => setShowContactModal(true)}
                      className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-lg px-4 sm:px-12 py-3 sm:py-7 w-full sm:w-auto shadow-2xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40"
                    >
                      <Send className="mr-1.5 sm:mr-3 w-3.5 h-3.5 sm:w-6 sm:h-6" />
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
                    inziniering={inziniering}
                    revizna={revizna}
                    doprava={doprava}
                    predajNehnutelnosti={predajNehnutelnosti}
                    hladaniePozemku={hladaniePozemku}
                    financneSluzby={financneSluzby}
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
        inziniering={inziniering}
        revizna={revizna}
        doprava={doprava}
        predajNehnutelnosti={predajNehnutelnosti}
        hladaniePozemku={hladaniePozemku}
        financneSluzby={financneSluzby}
      />
    </div>
  );
}