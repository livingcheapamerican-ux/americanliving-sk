import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Send, AlertTriangle, CheckCircle, Calculator, RotateCcw,
  Wrench, Plug, Droplets, ThermometerSun, Wind, Landmark, FileText,
  Zap, ShowerHead, Flame, Cable, Paintbrush, Home, Truck, Sun, DoorOpen,
  Maximize, Square, FileCheck, Package, Hammer, Key, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useFlyingAnimation, FlyingAnimationContainer } from "./FlyingAnimation";

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
    
    const interierLabel = interierFinis === "drevo" ? "Interiér - obloženie drevom" : interierFinis === "sadrokarton" ? "Interiér - sádrokartón" : "Interiér finiš";
    const interierPrice = interierFinis === "drevo" ? CENY.interierFinis.drevo : interierFinis === "sadrokarton" ? CENY.interierFinis.sadrokarton : 0;
    items.push({ name: interierLabel, price: interierPrice, section: "kluc", selected: interierFinis !== "ziadne" });
    
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
      <div className="mt-4 sticky top-20 z-40">
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ring-2 ring-green-500/30">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Vaša konfigurácia</p>
                <h3 className="text-lg font-bold text-white">Flat Double 142m²</h3>
              </div>
            </div>
          </div>

          {/* Súhrn položiek */}
          <div className="px-3 py-2">
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
                    <div className="py-2">
                      <div className="border-t-2 border-amber-500/50"></div>
                      <div className="flex items-center gap-2 px-2 pt-2">
                        <Package className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Hrubá stavba</span>
                      </div>
                    </div>
                  )}
                  {showHolodomDivider && (
                    <div className="py-2">
                      <div className="border-t-2 border-blue-500/50"></div>
                      <div className="flex items-center gap-2 px-2 pt-2">
                        <Hammer className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Holodom</span>
                      </div>
                    </div>
                  )}
                  {showKlucDivider && (
                    <div className="py-2">
                      <div className="border-t-2 border-emerald-500/50"></div>
                      <div className="flex items-center gap-2 px-2 pt-2">
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dom na kľúč</span>
                      </div>
                    </div>
                  )}
                  {showDocsDivider && (
                    <div className="py-2">
                      <div className="border-t-2 border-purple-500/50"></div>
                      <div className="flex items-center gap-2 px-2 pt-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Dokumentácia</span>
                      </div>
                    </div>
                  )}
                  <div className={`flex justify-between items-center py-1.5 px-2 rounded text-sm ${isBase ? 'bg-blue-500/20 border border-blue-500/30 my-1' : item.selected ? 'hover:bg-slate-700/50' : 'opacity-50'}`}>
                    <span className={`${isBase ? 'text-blue-300 font-bold text-base' : item.selected ? 'text-slate-300 font-medium' : 'text-slate-500 line-through'} flex-1 pr-3`}>{item.name}</span>
                    <span className={`${isBase ? 'text-blue-300 text-base' : item.selected ? 'text-green-400' : 'text-slate-500'} font-bold whitespace-nowrap`}>
                      {item.selected ? formatPrice(item.price) : 'NIE'}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Celková cena */}
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-t border-green-500/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Celkom s DPH</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <div className="space-y-2">
              <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
                <Button size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg">
                  <Send className="mr-2 w-4 h-4" />
                  Mám záujem
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleReset}
                className="w-full border-slate-600 text-slate-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all"
              >
                <RotateCcw className="mr-2 w-3 h-3" />
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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-blue-50/50 to-white">

          {/* Interiér finiš - presunuté na prvé miesto */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <Home className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              Interiér finiš
            </Label>

            <RadioGroup value={interierFinis} onValueChange={setInterierFinis} className="space-y-2 sm:space-y-3">
              <label className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="ziadne" id="interier-ziadne-holodom" />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Nie</span>
                    <p className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">Hrubá stavba</p>
                  </div>
                </div>
                <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
              </label>
              <label 
                onClick={(e) => { if (interierFinis !== "drevo") triggerAnimation("drevo", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="drevo" id="interier-drevo-holodom" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Obloženie drevom</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 16 400 €</span>
              </label>
              <label 
                onClick={(e) => { if (interierFinis !== "sadrokarton") triggerAnimation("sadrokarton", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="sadrokarton" id="interier-sadrokarton-holodom" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Sádrokartón</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 19 475 €</span>
              </label>
            </RadioGroup>
          </div>

          {/* Elektroinštalácia */}
          <motion.div 
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.005 }}
          >
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <motion.div animate={{ scale: elektroinstalacia ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                <Zap className={`w-8 h-8 sm:w-10 sm:h-10 ${elektroinstalacia ? "text-yellow-500" : "text-yellow-400"}`} />
              </motion.div>
              Elektroinštalácia
            </Label>

            <motion.label 
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (!elektroinstalacia) triggerAnimation("elektro", e.currentTarget); }}
              className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${elektroinstalacia ? "border-blue-400 bg-blue-50/70 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"}`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Checkbox 
                  id="elektro" 
                  checked={elektroinstalacia} 
                  onCheckedChange={setElektroinstalacia}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div>
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Elektrická inštalácia</span>
                  <p className="text-[10px] sm:text-sm text-gray-500">Rozvody, rozvádzač, zásuvky</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <AnimatePresence>
                  {elektroinstalacia && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 7 400 €</span>
              </div>
            </motion.label>
            </motion.div>

          {/* Voda a kanalizácia */}
          <motion.div 
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.005 }}
          >
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <motion.div animate={{ y: vodaKanalizacia ? [0, -3, 0] : 0 }} transition={{ duration: 0.3, repeat: vodaKanalizacia ? 2 : 0 }}>
                <Droplets className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </motion.div>
              Voda a kanalizácia
            </Label>

            <div className="space-y-2 sm:space-y-3">
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (!vodaKanalizacia) triggerAnimation("voda", e.currentTarget); }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${vodaKanalizacia ? "border-blue-400 bg-blue-50/70 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="voda" 
                    checked={vodaKanalizacia} 
                    onCheckedChange={setVodaKanalizacia}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Rozvody vody a kanalizácie</span>
                    <p className="text-[10px] sm:text-sm text-gray-500">Príprava pre sanitárne zariadenia</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AnimatePresence>
                    {vodaKanalizacia && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 2 380 €</span>
                </div>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (!sanitaKomplet) triggerAnimation("sanita", e.currentTarget); }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${sanitaKomplet ? "border-blue-400 bg-blue-50/70 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="sanita" 
                    checked={sanitaKomplet} 
                    onCheckedChange={setSanitaKomplet}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Sanita komplet</span>
                    <p className="text-[10px] sm:text-sm text-gray-500">Sprchový kút, umývadlo, WC</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AnimatePresence>
                    {sanitaKomplet && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 1 169 €</span>
                </div>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (!bojler) triggerAnimation("bojler", e.currentTarget); }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${bojler ? "border-blue-400 bg-blue-50/70 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="bojler" 
                    checked={bojler} 
                    onCheckedChange={setBojler}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Elektrický bojler</span>
                    <p className="text-[10px] sm:text-sm text-gray-500">Ohrev pitnej vody</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AnimatePresence>
                    {bojler && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 246 €</span>
                </div>
              </motion.label>
            </div>
            </motion.div>

          {/* Vykurovanie a vetranie */}
          <motion.div 
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.005 }}
          >
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <motion.div animate={{ scale: (tepelneCerpadlo || rekuperacia) ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                <ThermometerSun className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </motion.div>
              Vykurovanie a vetranie
            </Label>
            <div className="space-y-2 sm:space-y-3">
              <motion.label 
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (!tepelneCerpadlo) triggerAnimation("klimatizacia", e.currentTarget); }}
                className={`relative flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all overflow-hidden ${tepelneCerpadlo ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' : projektA0 && !tepelneCerpadlo ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="cerpadlo" 
                    checked={tepelneCerpadlo} 
                    onCheckedChange={setTepelneCerpadlo}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-xs sm:text-base">Tepelné čerpadlo</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-[8px] sm:text-xs">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        A0
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-sm text-gray-500">1x vonk. + 5x vnút. jednotka</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AnimatePresence>
                    {tepelneCerpadlo && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 5 535 €</span>
                </div>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (!rekuperacia) triggerAnimation("rekuperacia", e.currentTarget); }}
                className={`relative flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all overflow-hidden ${rekuperacia ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' : projektA0 && !rekuperacia ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="rekuperacia" 
                    checked={rekuperacia} 
                    onCheckedChange={setRekuperacia}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-xs sm:text-base">Rekuperácia</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-[8px] sm:text-xs">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        A0
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-sm text-gray-500">5ks lokálnych jednotiek</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <AnimatePresence>
                    {rekuperacia && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 2 700 €</span>
                </div>
              </motion.label>
            </div>
          </motion.div>

          {/* Pripojenie na siete */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <Cable className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
              Pripojenie na siete
            </Label>
            <label 
              onClick={(e) => { if (!pripojkaSiete) triggerAnimation("siete", e.currentTarget); }}
              className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Checkbox 
                  id="pripojky" 
                  checked={pripojkaSiete} 
                  onCheckedChange={setPripojkaSiete}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div>
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Pripojenie na siete</span>
                  <p className="text-[10px] sm:text-sm text-gray-500">Elektrika, voda, kanalizácia</p>
                </div>
              </div>
              <span className="font-bold text-green-600 text-xs sm:text-base">+ 1 501 €</span>
            </label>
          </div>

          {/* Úpravy okien a dverí */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <Square className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              Okná a vstupné dvere
            </Label>
            
            {/* Vstupné dvere */}
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">Vstupné dvere</p>
              <RadioGroup value={vstupneDvere} onValueChange={setVstupneDvere} className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RadioGroupItem value="ziadne" id="dvere-ziadne" />
                    <span className="text-gray-800 text-xs sm:text-base">Štandard v sade</span>
                  </div>
                  <span className="text-gray-400 text-xs sm:text-base">+ 0 €</span>
                </label>
                <label 
                  onClick={(e) => { if (vstupneDvere !== "kovove") triggerAnimation("dvereKovove", e.currentTarget); }}
                  className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RadioGroupItem value="kovove" id="dvere-kovove" />
                    <span className="text-gray-800 text-xs sm:text-base">Kovové dvere</span>
                  </div>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 720 €</span>
                </label>
                <label 
                  onClick={(e) => { if (vstupneDvere !== "plastove") triggerAnimation("dverePlastove", e.currentTarget); }}
                  className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RadioGroupItem value="plastove" id="dvere-plastove" />
                    <span className="text-gray-800 text-xs sm:text-base">Plastovo-kovové</span>
                  </div>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 660 €</span>
                </label>
              </RadioGroup>
            </div>

            {/* Rozšírenia okien */}
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Doplnkové okná</p>
              <div className="grid gap-2 sm:gap-3">
                <div 
                  className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${stresneOkno > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={(e) => { 
                    if (stresneOkno === 0) {
                      triggerAnimation("okno", e.currentTarget);
                      setStresneOkno(1);
                    } else {
                      setStresneOkno(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={stresneOkno > 0} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Strešné okno</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={stresneOkno} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { 
                        const newVal = parseInt(e.target.value) || 0;
                        if (newVal > stresneOkno) triggerAnimation("okno", e.target);
                        setStresneOkno(newVal);
                      }}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 760 €</span>
                  </div>
                </div>
                <div 
                  className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoFixne > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={(e) => { 
                    if (bocneOknoFixne === 0) {
                      triggerAnimation("okno", e.currentTarget);
                      setBocneOknoFixne(1);
                    } else {
                      setBocneOknoFixne(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoFixne > 0} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné fixné 90×205</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoFixne} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) || 0;
                        if (newVal > bocneOknoFixne) triggerAnimation("okno", e.target);
                        setBocneOknoFixne(newVal);
                      }}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 501 €</span>
                  </div>
                </div>
                <div 
                  className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoVyklopne90 > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={(e) => { 
                    if (bocneOknoVyklopne90 === 0) {
                      triggerAnimation("okno", e.currentTarget);
                      setBocneOknoVyklopne90(1);
                    } else {
                      setBocneOknoVyklopne90(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoVyklopne90 > 0} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné výkl. 90×205</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne90} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) || 0;
                        if (newVal > bocneOknoVyklopne90) triggerAnimation("okno", e.target);
                        setBocneOknoVyklopne90(newVal);
                      }}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 540 €</span>
                  </div>
                </div>
                <div 
                  className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoVyklopne55 > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={(e) => { 
                    if (bocneOknoVyklopne55 === 0) {
                      triggerAnimation("okno", e.currentTarget);
                      setBocneOknoVyklopne55(1);
                    } else {
                      setBocneOknoVyklopne55(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoVyklopne55 > 0} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné výkl. 55×90</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne55} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) || 0;
                        if (newVal > bocneOknoVyklopne55) triggerAnimation("okno", e.target);
                        setBocneOknoVyklopne55(newVal);
                      }}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 225 €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Laminácia a tónované sklá */}
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Úpravy okien</p>
              <label 
                onClick={(e) => { if (!povrchokaOkien) triggerAnimation("oknoAntracit", e.currentTarget); }}
                className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="povrch-okien" 
                    checked={povrchokaOkien} 
                    onCheckedChange={setPovrchokaOkien}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div>
                    <span className="text-gray-800 text-xs sm:text-base">Laminácia - antracit</span>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 3 100 €</span>
              </label>
              <label 
                onClick={(e) => { if (!tonovaneSkla) triggerAnimation("oknoTonovane", e.currentTarget); }}
                className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="tonovane-skla" 
                    checked={tonovaneSkla} 
                    onCheckedChange={setTonovaneSkla}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-gray-800 text-xs sm:text-base">Tónované sklá (Solar)</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 1 300 €</span>
              </label>
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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-emerald-50/50 to-white">

          {/* Vonkajšia fasáda */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <Paintbrush className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              Vonkajšia fasáda
            </Label>
            <p className="text-[10px] sm:text-sm text-gray-500 mb-3 sm:mb-4 hidden sm:block">Drevo / Falcovaný plech anthracit - podľa modelu domu - bez príplatku</p>
            <RadioGroup value={vonkajsiaFasada} onValueChange={setVonkajsiaFasada} className="space-y-2 sm:space-y-3">
              <label 
                onClick={(e) => { if (vonkajsiaFasada !== "standard") triggerAnimation("fasadaStandard", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="standard" id="fasada-standard" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Štandard (Drevo/Plech)</span>
                </div>
                <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
              </label>
              <label 
                onClick={(e) => { if (vonkajsiaFasada !== "suchana") triggerAnimation("fasadaSuchana", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="suchana" id="fasada-suchana" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Škúchaná fasáda</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 12 841 €</span>
              </label>
            </RadioGroup>
          </div>



          {/* Podlahy a vykurovanie */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <Square className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              Podlahy a vykurovanie
            </Label>
            <div className="space-y-2 sm:space-y-4">
              <div 
                onClick={(e) => { if (!vnutornePodlahy) triggerAnimation("podlaha", e.currentTarget); }}
                className="border-2 border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
              >
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox 
                      id="vnutorne-podlahy" 
                      checked={vnutornePodlahy} 
                      onCheckedChange={setVnutornePodlahy}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-base">Vnútorné podlahy - laminát</span>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">+ 3 351 €</span>
                </label>
              </div>

              <div 
                onClick={(e) => { if (!podlahovVykurovanie) triggerAnimation("podlahovVykurovanie", e.currentTarget); }}
                className="border-2 border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
              >
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox 
                      id="podlahove-vykurovanie" 
                      checked={podlahovVykurovanie} 
                      onCheckedChange={setPodlahovVykurovanie}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-base flex items-center gap-1 sm:gap-2">
                        <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        Elektrické podlahové vykurovanie s WiFi termostatom
                      </span>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Wi-Fi termostat do každej izby (8-9 ks)</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">Cena zahŕňa prácu na komplet: Vykurovacia fólia 1m a 0,5m, Vodič, LDPE 0.2 parozábranná fólia, izolácia pod vykurovacou fóliou XPS 500-700, Konektory, Uzemňovacia sieťka, Termostaty, Práca + Doprava</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">+ 5 525 €</span>
                </label>
              </div>
            </div>
          </div>

          {/* Interiérové dvere */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <DoorOpen className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              Interiérové dvere
            </Label>
            <div 
              className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl"
              onClick={(e) => { if (interieroveDvere === 0) triggerAnimation("interieroveDvere", e.currentTarget); }}
            >
              <div>
                <span className="font-semibold text-gray-800 text-xs sm:text-base">Interiérové dvere</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Input 
                  type="number" 
                  min="0" 
                  value={interieroveDvere} 
                  onChange={(e) => {
                    const newVal = parseInt(e.target.value) || 0;
                    if (newVal > interieroveDvere) triggerAnimation("interieroveDvere", e.target);
                    setInterieroveDvere(newVal);
                  }}
                  className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                />
                <span className="font-bold text-green-600 text-xs sm:text-base">× 250 €</span>
              </div>
            </div>
          </div>

          {/* Doplnky */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <Maximize className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              Doplnky exteriéru
            </Label>
            <label 
              onClick={(e) => { if (!pergola) triggerAnimation("pergola", e.currentTarget); }}
              className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Checkbox 
                  id="pergola" 
                  checked={pergola} 
                  onCheckedChange={setPergola}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="font-semibold text-gray-800 text-xs sm:text-base">Dekoratívna pergola</span>
              </div>
              <span className="font-bold text-green-600 text-xs sm:text-base">+ 1 845 €</span>
            </label>
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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-purple-50/50 to-white">

          {/* Dokumentácia */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              Projektová dokumentácia
            </Label>
            <div className="space-y-2 sm:space-y-3">
              <label 
                onClick={(e) => { if (!inziniering) triggerAnimation("inziniering", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="inziniering" 
                    checked={inziniering} 
                    onCheckedChange={setInziniering}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Inžiniering stav. povolenia</span>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 2 592 €</span>
              </label>
              <label 
                onClick={(e) => { if (!projektA0) triggerAnimation("projektant", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-green-400 rounded-lg sm:rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="projekt" 
                    checked={projektA0} 
                    onCheckedChange={setProjektA0}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-xs sm:text-base">Projektant + certifikácia</span>
                      <Badge className="bg-green-600 text-[8px] sm:text-xs">A0</Badge>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 3 500 €</span>
              </label>
              <label className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Checkbox 
                    id="revizna" 
                    checked={revizna} 
                    onCheckedChange={setRevizna}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Revízna dokumentácia</span>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 1 000 €</span>
              </label>
            </div>
          </div>

          {/* A0 Upozornenie */}
          {a0Odporucania && (
            <div className="p-3 sm:p-5 bg-amber-50 border-2 border-amber-300 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-1 sm:mb-2 text-xs sm:text-base">
                    Pre A0 odporúčame:
                  </p>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {a0Odporucania.map((item, index) => (
                      <li key={index} className="text-amber-700 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
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
            <div className="p-3 sm:p-5 bg-green-50 border-2 border-green-300 rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                <p className="font-bold text-green-800 text-xs sm:text-base">
                  Konfigurácia spĺňa A0!
                </p>
              </div>
            </div>
          )}

          {/* Doprava */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              Doprava
            </Label>
            <label 
              onClick={(e) => { if (!doprava) triggerAnimation("doprava", e.currentTarget); }}
              className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Checkbox 
                  id="doprava" 
                  checked={doprava} 
                  onCheckedChange={setDoprava}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="font-semibold text-gray-800 text-xs sm:text-base">Doprava</span>
              </div>
              <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
            </label>
          </div>

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
              <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
                <Button size="lg" className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-lg px-6 sm:px-12 py-4 sm:py-7 w-full sm:w-auto shadow-2xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40">
                  <Send className="mr-2 sm:mr-3 w-4 h-4 sm:w-6 sm:h-6" />
                  Mám záujem
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </Card>
      </motion.div>
      </div>
      </div>
    </div>
  );
}