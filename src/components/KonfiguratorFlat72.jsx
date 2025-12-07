import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, Wrench, ThermometerSun, Landmark, Package, Sparkles, 
  Maximize, Zap, Droplets, Wind, FileText, Home, Hammer, DoorOpen,
  Layers, PaintBucket, Sun, Snowflake, Truck, FileCheck, Plus, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import KonfiguratorContactModal from "./KonfiguratorContactModal";

// Ceny pre Flat 72 - extrahované z obrázkov
const FLAT72_CENY = {
  montaz: 17925,
  vstupne_dvere: {
    kovove_zamkami: 720,
    plastove_kovove: 460
  },
  elektroinstalacia: 3900,
  voda_sanita: {
    rozvody: 1150,
    sprchovy_kut: 1169,
    bojler: 246
  },
  pripojenie_siete: 1501,
  zaklady: {
    piloty: 4428,
    pasove: 11184,
    doska: 11849
  },
  tepelne_cerpadlo: 3321,
  inziniering: 2592,
  rekuperacia: 1600,
  izolacia: {
    standard: 0,
    mm200: 2950,
    mm250: 5900,
    mm300: 11063
  },
  projekt_a0: 3500,
  interier_finis: {
    drevo: 8200,
    sadrokarton: 8815
  },
  vonkajsia_fasada: {
    drevo_plech: 499,
    suchna_fasada: 8090
  },
  povrch_okien: 1950,
  pergola: 972,
  vnutorne_podlahy: 1680,
  podlahove_vykurovanie: 3960,
  interierove_dvere: 180,
  stresne_okno: 760,
  bocne_okno_fixne: 450,
  bocne_okno_vyklopne_90: 540,
  bocne_okno_vyklopne_55: 225,
  tonovane_skla: 680,
  doprava: 0,
  revizna: 500
};

// Dlaždica komponenta
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-amber-100", selectedBorder = "border-amber-500", selectedRing = "ring-amber-300" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
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
            : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
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
          {tooltip}
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
};

export default function KonfiguratorFlat72({ 
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
  const { t } = useLanguage();
  const [showContactModal, setShowContactModal] = useState(false);

  // Výpočet celkovej ceny
  const calculateTotal = () => {
    let total = dom.zakladna_cena || 0;

    // Montáž
    if (montazHolodomu === "ano") total += FLAT72_CENY.montaz;

    // Vstupné dvere
    if (vstupneDvere === "kovove_zamkami") total += FLAT72_CENY.vstupne_dvere.kovove_zamkami;
    if (vstupneDvere === "plastove_kovove") total += FLAT72_CENY.vstupne_dvere.plastove_kovove;

    // Elektroinstalacia
    if (elektroinstalacia) total += FLAT72_CENY.elektroinstalacia;

    // Voda a kanalizácia
    if (vodaKanalizacia) total += FLAT72_CENY.voda_sanita.rozvody;
    if (sanitaKomplet) total += FLAT72_CENY.voda_sanita.sprchovy_kut;
    if (bojler) total += FLAT72_CENY.voda_sanita.bojler;

    // Pripojenie na siete
    if (pripojkaSiete) total += FLAT72_CENY.pripojenie_siete;

    // Základy
    if (zaklady === "skrutky") total += FLAT72_CENY.zaklady.piloty;
    if (zaklady === "pasove") total += FLAT72_CENY.zaklady.pasove;
    if (zaklady === "doska") total += FLAT72_CENY.zaklady.doska;

    // Tepelné čerpadlo
    if (tepelneCerpadlo) total += FLAT72_CENY.tepelne_cerpadlo;

    // Inžiniering
    if (inziniering) total += FLAT72_CENY.inziniering;

    // Rekuperácia
    if (rekuperacia) total += FLAT72_CENY.rekuperacia;

    // Izolácia
    if (izolaciaNavysenie === "zvysena") total += FLAT72_CENY.izolacia.mm200;
    if (izolaciaNavysenie === "premium") total += FLAT72_CENY.izolacia.mm250;
    if (izolaciaNavysenie === "ultra") total += FLAT72_CENY.izolacia.mm300;

    // Projekt A0
    if (projektA0) total += FLAT72_CENY.projekt_a0;

    // Interiér finiš
    if (interierFinis === "drevo") total += FLAT72_CENY.interier_finis.drevo;
    if (interierFinis === "sadrokarton") total += FLAT72_CENY.interier_finis.sadrokarton;

    // Vonkajšia fasáda
    if (vonkajsiaFasada === "drevo_plech") total += FLAT72_CENY.vonkajsia_fasada.drevo_plech;
    if (vonkajsiaFasada === "suchna_fasada") total += FLAT72_CENY.vonkajsia_fasada.suchna_fasada;

    // Povrch okien
    if (povrchokaOkien) total += FLAT72_CENY.povrch_okien;

    // Pergola
    if (pergola) total += FLAT72_CENY.pergola;

    // Vnútorné podlahy
    if (vnutornePodlahy) total += FLAT72_CENY.vnutorne_podlahy;

    // Podlahové vykurovanie
    if (podlahovVykurovanie) total += FLAT72_CENY.podlahove_vykurovanie;

    // Interiérové dvere
    total += interieroveDvere * FLAT72_CENY.interierove_dvere;

    // Strešné okná
    total += stresneOkno * FLAT72_CENY.stresne_okno;

    // Bočné okná
    total += bocneOknoFixne * FLAT72_CENY.bocne_okno_fixne;
    total += bocneOknoVyklopne90 * FLAT72_CENY.bocne_okno_vyklopne_90;
    total += bocneOknoVyklopne55 * FLAT72_CENY.bocne_okno_vyklopne_55;

    // Tónované sklá
    if (tonovaneSkla) total += FLAT72_CENY.tonovane_skla;

    // Doprava
    if (doprava) total += FLAT72_CENY.doprava;

    // Revízna
    if (revizna) total += FLAT72_CENY.revizna;

    return total;
  };

  const celkovaCena = calculateTotal();

  // Zoznam vybraných položiek
  const getSelectedItems = () => {
    const items = [];
    
    if (montazHolodomu === "ano") items.push({ nazov: "Montáž holodomu", cena: FLAT72_CENY.montaz });
    if (vstupneDvere === "kovove_zamkami") items.push({ nazov: "Vstupné dvere kovové s 2 zámkami", cena: FLAT72_CENY.vstupne_dvere.kovove_zamkami });
    if (vstupneDvere === "plastove_kovove") items.push({ nazov: "Plastovo-kovové dvere", cena: FLAT72_CENY.vstupne_dvere.plastove_kovove });
    if (elektroinstalacia) items.push({ nazov: "Základná elektrická inštalácia", cena: FLAT72_CENY.elektroinstalacia });
    if (vodaKanalizacia) items.push({ nazov: "Rozvody vody a kanalizácie", cena: FLAT72_CENY.voda_sanita.rozvody });
    if (sanitaKomplet) items.push({ nazov: "Sprchový kút, umývadlo, WC misa", cena: FLAT72_CENY.voda_sanita.sprchovy_kut });
    if (bojler) items.push({ nazov: "Elektrický bojler", cena: FLAT72_CENY.voda_sanita.bojler });
    if (pripojkaSiete) items.push({ nazov: "Pripojenie na inžinierske siete", cena: FLAT72_CENY.pripojenie_siete });
    if (zaklady === "skrutky") items.push({ nazov: "Základy - Pilóty slabo pätky", cena: FLAT72_CENY.zaklady.piloty });
    if (zaklady === "pasove") items.push({ nazov: "Pásové základy", cena: FLAT72_CENY.zaklady.pasove });
    if (zaklady === "doska") items.push({ nazov: "Základová doska", cena: FLAT72_CENY.zaklady.doska });
    if (tepelneCerpadlo) items.push({ nazov: "Tepelné čerpadlo (klimatizácia)", cena: FLAT72_CENY.tepelne_cerpadlo });
    if (inziniering) items.push({ nazov: "Inžiniering stavebného povolenia", cena: FLAT72_CENY.inziniering });
    if (rekuperacia) items.push({ nazov: "Rekuperácia 3ks", cena: FLAT72_CENY.rekuperacia });
    if (izolaciaNavysenie === "zvysena") items.push({ nazov: "Dodatočná izolácia 200mm", cena: FLAT72_CENY.izolacia.mm200 });
    if (izolaciaNavysenie === "premium") items.push({ nazov: "Dodatočná izolácia 250mm", cena: FLAT72_CENY.izolacia.mm250 });
    if (izolaciaNavysenie === "ultra") items.push({ nazov: "Dodatočná izolácia 300mm", cena: FLAT72_CENY.izolacia.mm300 });
    if (projektA0) items.push({ nazov: "Projektant, Energetická certifikácia", cena: FLAT72_CENY.projekt_a0 });
    if (interierFinis === "drevo") items.push({ nazov: "Interiér finiš - Obloženie drevom", cena: FLAT72_CENY.interier_finis.drevo });
    if (interierFinis === "sadrokarton") items.push({ nazov: "Interiér finiš - Sadrokartón", cena: FLAT72_CENY.interier_finis.sadrokarton });
    if (vonkajsiaFasada === "drevo_plech") items.push({ nazov: "Vonkajšia fasáda - Drevo/Falcovaný plech", cena: FLAT72_CENY.vonkajsia_fasada.drevo_plech });
    if (vonkajsiaFasada === "suchna_fasada") items.push({ nazov: "Suchná fasáda", cena: FLAT72_CENY.vonkajsia_fasada.suchna_fasada });
    if (povrchokaOkien) items.push({ nazov: "Povrch okien Antracit", cena: FLAT72_CENY.povrch_okien });
    if (pergola) items.push({ nazov: "Dekoratívna pergola na konektory", cena: FLAT72_CENY.pergola });
    if (vnutornePodlahy) items.push({ nazov: "Vnútorné podlahy - laminát", cena: FLAT72_CENY.vnutorne_podlahy });
    if (podlahovVykurovanie) items.push({ nazov: "Elektrické podlahové vykurovanie + WiFi", cena: FLAT72_CENY.podlahove_vykurovanie });
    if (interieroveDvere > 0) items.push({ nazov: `Interiérové dvere (${interieroveDvere}ks)`, cena: interieroveDvere * FLAT72_CENY.interierove_dvere });
    if (stresneOkno > 0) items.push({ nazov: `Strešné okno (${stresneOkno}ks)`, cena: stresneOkno * FLAT72_CENY.stresne_okno });
    if (bocneOknoFixne > 0) items.push({ nazov: `Bočné okno fixné 90x205cm (${bocneOknoFixne}ks)`, cena: bocneOknoFixne * FLAT72_CENY.bocne_okno_fixne });
    if (bocneOknoVyklopne90 > 0) items.push({ nazov: `Bočné okno vyklopno-sklopné 90x205cm (${bocneOknoVyklopne90}ks)`, cena: bocneOknoVyklopne90 * FLAT72_CENY.bocne_okno_vyklopne_90 });
    if (bocneOknoVyklopne55 > 0) items.push({ nazov: `Bočné okno vyklopno-sklopné 55x90cm (${bocneOknoVyklopne55}ks)`, cena: bocneOknoVyklopne55 * FLAT72_CENY.bocne_okno_vyklopne_55 });
    if (tonovaneSkla) items.push({ nazov: "Tónované sklá (Solar)", cena: FLAT72_CENY.tonovane_skla });
    if (doprava) items.push({ nazov: "Doprava", cena: FLAT72_CENY.doprava });
    if (revizna) items.push({ nazov: "Kompletná revízna dokumentácia", cena: FLAT72_CENY.revizna });

    return items;
  };

  if (showOnlySummary) {
    const selectedItems = getSelectedItems();

    return (
      <Card className="bg-white shadow-2xl sticky top-20">
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-2">💰 Vaša konfigurácia</h3>
          <p className="text-sm opacity-90">Flat 72 - Cenový súhrn</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Základná cena */}
          <div className="flex justify-between items-center pb-3 border-b-2">
            <span className="font-semibold">Základná cena</span>
            <span className="font-bold text-lg text-primary">
              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
            </span>
          </div>

          {/* Vybrané položky */}
          {selectedItems.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700 flex-1">{item.nazov}</span>
                  <span className="font-semibold text-green-600 ml-2">
                    +{item.cena.toLocaleString('sk-SK')} €
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Celková cena */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Celková cena</span>
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                {celkovaCena.toLocaleString('sk-SK')} €
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">s DPH</p>
          </div>

          {/* CTA */}
          <Button 
            onClick={() => setShowContactModal(true)}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-6"
          >
            Mám záujem o túto konfiguráciu
          </Button>
        </div>

        {showContactModal && (
          <KonfiguratorContactModal
            dom={dom}
            selectedItems={selectedItems}
            celkovaCena={celkovaCena}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </Card>
    );
  }

  // Wizard view - zobrazenie všetkých fáz
  return (
    <div className="space-y-6">
      {/* Montáž a vstupné dvere */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Montáž a vstup
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Montáž */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Montáž holodomu</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={montazHolodomu === "nie"}
                onClick={() => setMontazHolodomu("nie")}
                icon={Wrench}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Bez montáže"
                subtitle="Samostatná montáž"
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={montazHolodomu === "ano"}
                onClick={() => setMontazHolodomu("ano")}
                icon={Wrench}
                iconColor="text-amber-500"
                iconSelectedColor="text-amber-600"
                title="S montážou"
                subtitle="Kompletná montáž"
                price={`+ ${FLAT72_CENY.montaz.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Vstupné dvere */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Vstupné dvere</p>
            <div className="grid grid-cols-3 gap-2">
              <Tile
                selected={vstupneDvere === "ziadne"}
                onClick={() => setVstupneDvere("ziadne")}
                icon={DoorOpen}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Žiadne"
                subtitle="Bez dverí"
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={vstupneDvere === "kovove_zamkami"}
                onClick={() => setVstupneDvere("kovove_zamkami")}
                icon={DoorOpen}
                iconColor="text-orange-500"
                iconSelectedColor="text-amber-600"
                title="Kovové s 2 zámkami"
                subtitle="720€"
                price={`+ ${FLAT72_CENY.vstupne_dvere.kovove_zamkami.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
              <Tile
                selected={vstupneDvere === "plastove_kovove"}
                onClick={() => setVstupneDvere("plastove_kovove")}
                icon={DoorOpen}
                iconColor="text-blue-500"
                iconSelectedColor="text-amber-600"
                title="Plastovo-kovové"
                subtitle="460€"
                price={`+ ${FLAT72_CENY.vstupne_dvere.plastove_kovove.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Inštalácie */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Inštalácie
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Elektroinstalacia */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Základná elektrická inštalácia</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!elektroinstalacia}
                onClick={() => setElektroinstalacia(false)}
                icon={Zap}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={elektroinstalacia}
                onClick={() => setElektroinstalacia(true)}
                icon={Zap}
                iconColor="text-yellow-500"
                iconSelectedColor="text-yellow-600"
                title="Áno"
                subtitle="3 900€"
                price={`+ ${FLAT72_CENY.elektroinstalacia.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Voda a kanalizácia */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Voda a kanalizácia</p>
            <div className="grid grid-cols-2 gap-2">
              <div onClick={() => setVodaKanalizacia(!vodaKanalizacia)} className="cursor-pointer">
                <Tile
                  selected={vodaKanalizacia}
                  onClick={() => {}}
                  icon={Droplets}
                  iconColor="text-blue-400"
                  iconSelectedColor="text-blue-600"
                  title="Rozvody"
                  subtitle="1 150€"
                  price={`+ ${FLAT72_CENY.voda_sanita.rozvody.toLocaleString('sk-SK')} €`}
                  isPriced={true}
                />
              </div>
              <div onClick={() => setSanitaKomplet(!sanitaKomplet)} className="cursor-pointer">
                <Tile
                  selected={sanitaKomplet}
                  onClick={() => {}}
                  icon={Droplets}
                  iconColor="text-blue-500"
                  iconSelectedColor="text-blue-600"
                  title="Sprchový kút"
                  subtitle="WC + umývadlo"
                  price={`+ ${FLAT72_CENY.voda_sanita.sprchovy_kut.toLocaleString('sk-SK')} €`}
                  isPriced={true}
                />
              </div>
              <div onClick={() => setBojler(!bojler)} className="cursor-pointer">
                <Tile
                  selected={bojler}
                  onClick={() => {}}
                  icon={Droplets}
                  iconColor="text-red-400"
                  iconSelectedColor="text-red-600"
                  title="Elektrický bojler"
                  subtitle="246€"
                  price={`+ ${FLAT72_CENY.voda_sanita.bojler.toLocaleString('sk-SK')} €`}
                  isPriced={true}
                />
              </div>
            </div>
          </div>

          {/* Pripojenie na siete */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Pripojenie na inžinierske siete (do 10m)</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!pripojkaSiete}
                onClick={() => setPripojkaSiete(false)}
                icon={Zap}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={pripojkaSiete}
                onClick={() => setPripojkaSiete(true)}
                icon={Zap}
                iconColor="text-orange-500"
                iconSelectedColor="text-orange-600"
                title="Áno"
                subtitle="1 501€"
                price={`+ ${FLAT72_CENY.pripojenie_siete.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Základy */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Základy
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tile
              selected={zaklady === "bez"}
              onClick={() => setZaklady("bez")}
              icon={Landmark}
              iconColor="text-gray-400"
              iconSelectedColor="text-amber-600"
              title="Bez základov"
              subtitle="Vlastné"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={zaklady === "skrutky"}
              onClick={() => setZaklady("skrutky")}
              icon={Landmark}
              iconColor="text-amber-500"
              iconSelectedColor="text-amber-600"
              title="Pilóty/Pätky"
              subtitle="4 428€"
              price={`+ ${FLAT72_CENY.zaklady.piloty.toLocaleString('sk-SK')} €`}
              isPriced={true}
            />
            <Tile
              selected={zaklady === "pasove"}
              onClick={() => setZaklady("pasove")}
              icon={Landmark}
              iconColor="text-orange-500"
              iconSelectedColor="text-amber-600"
              title="Pásové"
              subtitle="11 184€"
              price={`+ ${FLAT72_CENY.zaklady.pasove.toLocaleString('sk-SK')} €`}
              isPriced={true}
            />
            <Tile
              selected={zaklady === "doska"}
              onClick={() => setZaklady("doska")}
              icon={Landmark}
              iconColor="text-red-500"
              iconSelectedColor="text-red-600"
              title="Doska"
              subtitle="11 849€"
              price={`+ ${FLAT72_CENY.zaklady.doska.toLocaleString('sk-SK')} €`}
              isPriced={true}
            />
          </div>
        </div>
      </Card>

      {/* Vykurovanie a vetranie */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Wind className="w-5 h-5" />
            Vykurovanie a vetranie
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Tepelné čerpadlo */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Tepelné čerpadlo (klimatizácia) 1x vonkajšia / 3x vnútorná jednotka</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!tepelneCerpadlo}
                onClick={() => setTepelneCerpadlo(false)}
                icon={Wind}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={tepelneCerpadlo}
                onClick={() => setTepelneCerpadlo(true)}
                icon={Wind}
                iconColor="text-green-500"
                iconSelectedColor="text-green-600"
                title="Áno"
                subtitle="3 321€"
                price={`+ ${FLAT72_CENY.tepelne_cerpadlo.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Rekuperácia */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Rekuperácia 3ks</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!rekuperacia}
                onClick={() => setRekuperacia(false)}
                icon={Wind}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={rekuperacia}
                onClick={() => setRekuperacia(true)}
                icon={Wind}
                iconColor="text-cyan-500"
                iconSelectedColor="text-cyan-600"
                title="Áno"
                subtitle="1 600€"
                price={`+ ${FLAT72_CENY.rekuperacia.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Izolácia */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <ThermometerSun className="w-5 h-5" />
            Dodatočná izolácia Strecha/Steny
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tile
              selected={izolaciaNavysenie === "standard"}
              onClick={() => setIzolaciaNavysenie("standard")}
              icon={ThermometerSun}
              iconColor="text-gray-400"
              iconSelectedColor="text-amber-600"
              title="Štandardná"
              subtitle="150mm steny, 200mm podlaha"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={izolaciaNavysenie === "zvysena"}
              onClick={() => setIzolaciaNavysenie("zvysena")}
              icon={ThermometerSun}
              iconColor="text-orange-400"
              iconSelectedColor="text-amber-600"
              title="200mm"
              subtitle="2 950€"
              price={`+ ${FLAT72_CENY.izolacia.mm200.toLocaleString('sk-SK')} €`}
              isPriced={true}
            />
            <Tile
              selected={izolaciaNavysenie === "premium"}
              onClick={() => setIzolaciaNavysenie("premium")}
              icon={ThermometerSun}
              iconColor="text-green-500"
              iconSelectedColor="text-green-600"
              title="250mm"
              subtitle="5 900€"
              price={`+ ${FLAT72_CENY.izolacia.mm250.toLocaleString('sk-SK')} €`}
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
            />
            <Tile
              selected={izolaciaNavysenie === "ultra"}
              onClick={() => setIzolaciaNavysenie("ultra")}
              icon={ThermometerSun}
              iconColor="text-green-600"
              iconSelectedColor="text-green-700"
              title="300mm"
              subtitle="11 063€"
              price={`+ ${FLAT72_CENY.izolacia.mm300.toLocaleString('sk-SK')} €`}
              isPriced={true}
              isA0={true}
              selectedBg="bg-green-100"
              selectedBorder="border-green-500"
              selectedRing="ring-green-300"
            />
          </div>
        </div>
      </Card>

      {/* Dokumentácia a inžiniering */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dokumentácia a povolenia
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Inžiniering */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Inžiniering stavebného povolenia</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!inziniering}
                onClick={() => setInziniering(false)}
                icon={FileText}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={inziniering}
                onClick={() => setInziniering(true)}
                icon={FileText}
                iconColor="text-purple-500"
                iconSelectedColor="text-purple-600"
                title="Áno"
                subtitle="2 592€"
                price={`+ ${FLAT72_CENY.inziniering.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Projektant A0 */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Projektant, Energetická certifikácia</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!projektA0}
                onClick={() => setProjektA0(false)}
                icon={FileCheck}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={projektA0}
                onClick={() => setProjektA0(true)}
                icon={FileCheck}
                iconColor="text-green-500"
                iconSelectedColor="text-green-600"
                title="Áno"
                subtitle="3 500€"
                price={`+ ${FLAT72_CENY.projekt_a0.toLocaleString('sk-SK')} €`}
                isPriced={true}
                isA0={true}
                selectedBg="bg-green-100"
                selectedBorder="border-green-500"
                selectedRing="ring-green-300"
              />
            </div>
          </div>

          {/* Revízna dokumentácia */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Kompletná revízna dokumentácia k stavbe</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!revizna}
                onClick={() => setRevizna(false)}
                icon={FileCheck}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={revizna}
                onClick={() => setRevizna(true)}
                icon={FileCheck}
                iconColor="text-blue-500"
                iconSelectedColor="text-blue-600"
                title="Áno"
                subtitle="500€"
                price={`+ ${FLAT72_CENY.revizna.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Interiér a fasáda */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Home className="w-5 h-5" />
            Vnútorný a vonkajší finiš
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Interiér finiš */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Interiér finiš - úpravy stien, montáž priečky</p>
            <div className="grid grid-cols-3 gap-2">
              <Tile
                selected={interierFinis === "ziadne"}
                onClick={() => setInterierFinis("ziadne")}
                icon={Layers}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Žiadne"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={interierFinis === "drevo"}
                onClick={() => setInterierFinis("drevo")}
                icon={Layers}
                iconColor="text-amber-600"
                iconSelectedColor="text-amber-700"
                title="Obloženie drevom"
                subtitle="8 200€"
                price={`+ ${FLAT72_CENY.interier_finis.drevo.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
              <Tile
                selected={interierFinis === "sadrokarton"}
                onClick={() => setInterierFinis("sadrokarton")}
                icon={Layers}
                iconColor="text-gray-500"
                iconSelectedColor="text-gray-600"
                title="Sadrokartón"
                subtitle="8 815€"
                price={`+ ${FLAT72_CENY.interier_finis.sadrokarton.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Vonkajšia fasáda */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Vonkajšia fasáda</p>
            <div className="grid grid-cols-3 gap-2">
              <Tile
                selected={vonkajsiaFasada === ""}
                onClick={() => setVonkajsiaFasada("")}
                icon={PaintBucket}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Žiadna"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={vonkajsiaFasada === "drevo_plech"}
                onClick={() => setVonkajsiaFasada("drevo_plech")}
                icon={PaintBucket}
                iconColor="text-amber-600"
                iconSelectedColor="text-amber-700"
                title="Drevo/Plech"
                subtitle="499€"
                price={`+ ${FLAT72_CENY.vonkajsia_fasada.drevo_plech.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
              <Tile
                selected={vonkajsiaFasada === "suchna_fasada"}
                onClick={() => setVonkajsiaFasada("suchna_fasada")}
                icon={PaintBucket}
                iconColor="text-gray-600"
                iconSelectedColor="text-gray-700"
                title="Suchná fasáda"
                subtitle="8 090€"
                price={`+ ${FLAT72_CENY.vonkajsia_fasada.suchna_fasada.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Vnútorné podlahy */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Vnútorné podlahy - laminát</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!vnutornePodlahy}
                onClick={() => setVnutornePodlahy(false)}
                icon={Layers}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={vnutornePodlahy}
                onClick={() => setVnutornePodlahy(true)}
                icon={Layers}
                iconColor="text-amber-500"
                iconSelectedColor="text-amber-600"
                title="Áno"
                subtitle="1 680€"
                price={`+ ${FLAT72_CENY.vnutorne_podlahy.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Podlahové vykurovanie */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Elektrické podlahové vykurovanie + WiFi termostat</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!podlahovVykurovanie}
                onClick={() => setPodlahovVykurovanie(false)}
                icon={Zap}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={podlahovVykurovanie}
                onClick={() => setPodlahovVykurovanie(true)}
                icon={Zap}
                iconColor="text-red-500"
                iconSelectedColor="text-red-600"
                title="Áno"
                subtitle="3 960€"
                price={`+ ${FLAT72_CENY.podlahove_vykurovanie.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Okná a dvere */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Maximize className="w-5 h-5" />
            Okná a dvere
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Povrch okien antracit */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Povrch okien Antracit</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!povrchokaOkien}
                onClick={() => setPovrchokaOkien(false)}
                icon={Maximize}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={povrchokaOkien}
                onClick={() => setPovrchokaOkien(true)}
                icon={Maximize}
                iconColor="text-gray-700"
                iconSelectedColor="text-gray-800"
                title="Áno"
                subtitle="1 950€"
                price={`+ ${FLAT72_CENY.povrch_okien.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Tónované sklá */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Tónované sklá (Solar)</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!tonovaneSkla}
                onClick={() => setTonovaneSkla(false)}
                icon={Sun}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={tonovaneSkla}
                onClick={() => setTonovaneSkla(true)}
                icon={Sun}
                iconColor="text-orange-500"
                iconSelectedColor="text-orange-600"
                title="Áno"
                subtitle="680€"
                price={`+ ${FLAT72_CENY.tonovane_skla.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Počítadlá okien a dverí */}
          <div className="grid grid-cols-2 gap-3">
            {/* Strešné okno */}
            <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50/50">
              <p className="text-xs font-bold text-gray-700 mb-2">Strešné okno</p>
              <p className="text-xs text-gray-600 mb-2">760€ / kus</p>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setStresneOkno(Math.max(0, stresneOkno - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-primary w-8 text-center">{stresneOkno}</span>
                <Button 
                  size="sm"
                  onClick={() => setStresneOkno(stresneOkno + 1)}
                  className="h-8 w-8 p-0 bg-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Interiérové dvere */}
            <div className="border-2 border-amber-200 rounded-lg p-3 bg-amber-50/50">
              <p className="text-xs font-bold text-gray-700 mb-2">Interiérové dvere</p>
              <p className="text-xs text-gray-600 mb-2">180€ / kus</p>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setInterieroveDvere(Math.max(0, interieroveDvere - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-primary w-8 text-center">{interieroveDvere}</span>
                <Button 
                  size="sm"
                  onClick={() => setInterieroveDvere(interieroveDvere + 1)}
                  className="h-8 w-8 p-0 bg-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bočné okno fixné */}
            <div className="border-2 border-cyan-200 rounded-lg p-3 bg-cyan-50/50">
              <p className="text-xs font-bold text-gray-700 mb-2">Bočné okno (Fixné) 90x205cm</p>
              <p className="text-xs text-gray-600 mb-2">450€ / kus</p>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setBocneOknoFixne(Math.max(0, bocneOknoFixne - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-primary w-8 text-center">{bocneOknoFixne}</span>
                <Button 
                  size="sm"
                  onClick={() => setBocneOknoFixne(bocneOknoFixne + 1)}
                  className="h-8 w-8 p-0 bg-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bočné okno vyklopno-sklopné 90 */}
            <div className="border-2 border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
              <p className="text-xs font-bold text-gray-700 mb-2">Bočné okno (Vyklopno-sklopné) 90x205cm</p>
              <p className="text-xs text-gray-600 mb-2">540€ / kus</p>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setBocneOknoVyklopne90(Math.max(0, bocneOknoVyklopne90 - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-primary w-8 text-center">{bocneOknoVyklopne90}</span>
                <Button 
                  size="sm"
                  onClick={() => setBocneOknoVyklopne90(bocneOknoVyklopne90 + 1)}
                  className="h-8 w-8 p-0 bg-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bočné okno vyklopno-sklopné 55 */}
            <div className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50/50 col-span-2">
              <p className="text-xs font-bold text-gray-700 mb-2">Bočné okno (Vyklopno-sklopné) 55x90cm</p>
              <p className="text-xs text-gray-600 mb-2">225€ / kus</p>
              <div className="flex items-center justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setBocneOknoVyklopne55(Math.max(0, bocneOknoVyklopne55 - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-primary w-8 text-center">{bocneOknoVyklopne55}</span>
                <Button 
                  size="sm"
                  onClick={() => setBocneOknoVyklopne55(bocneOknoVyklopne55 + 1)}
                  className="h-8 w-8 p-0 bg-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Externé doplnky */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Doplnky
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Pergola */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Dekoratívna pergola na konektory</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!pergola}
                onClick={() => setPergola(false)}
                icon={Home}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={pergola}
                onClick={() => setPergola(true)}
                icon={Home}
                iconColor="text-teal-500"
                iconSelectedColor="text-teal-600"
                title="Áno"
                subtitle="972€"
                price={`+ ${FLAT72_CENY.pergola.toLocaleString('sk-SK')} €`}
                isPriced={true}
              />
            </div>
          </div>

          {/* Doprava */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Doprava</p>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={!doprava}
                onClick={() => setDoprava(false)}
                icon={Truck}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Nie"
                subtitle=""
                price="+ 0 €"
                isPriced={false}
              />
              <Tile
                selected={doprava}
                onClick={() => setDoprava(true)}
                icon={Truck}
                iconColor="text-blue-500"
                iconSelectedColor="text-blue-600"
                title="Áno"
                subtitle="Zadarmo"
                price="+ 0 €"
                isPriced={false}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Cenový súhrn */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-xl">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Cenový súhrn</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Základná cena</span>
              <span className="font-bold text-primary">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</span>
            </div>
            
            {getSelectedItems().map((item, idx) => (
              <div key={idx} className="flex justify-between py-1 text-sm">
                <span className="text-gray-700">{item.nazov}</span>
                <span className="font-semibold text-green-600">+{item.cena.toLocaleString('sk-SK')} €</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-green-400">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Celková cena</span>
              <span className="text-3xl font-bold text-primary">{celkovaCena.toLocaleString('sk-SK')} €</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">s DPH</p>
          </div>

          <Button 
            onClick={() => setShowContactModal(true)}
            className="w-full mt-4 bg-secondary hover:bg-secondary/90 py-6 text-lg font-semibold"
          >
            Mám záujem o túto konfiguráciu
          </Button>
        </div>
      </Card>

      {showContactModal && (
        <KonfiguratorContactModal
          dom={dom}
          selectedItems={getSelectedItems()}
          celkovaCena={celkovaCena}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}