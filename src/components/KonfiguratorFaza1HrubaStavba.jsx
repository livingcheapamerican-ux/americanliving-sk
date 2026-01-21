import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Check, Wrench, ThermometerSun, Landmark, Package, Sparkles, Maximize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";

// Dlaždica s tooltip a veľkou fajkou
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-amber-100", selectedBorder = "border-amber-500", selectedRing = "ring-amber-300" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tileRef = useRef(null);

  const updateTooltipPosition = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 256; // w-64 = 16rem = 256px
      const tooltipHeight = 80; // approximate
      
      // Horizontal: center over the tile, but keep within viewport
      const tileCenter = rect.left + rect.width / 2;
      const left = Math.min(Math.max(tileCenter, tooltipWidth / 2 + 10), window.innerWidth - tooltipWidth / 2 - 10);
      
      // Vertical: below tile if space available, otherwise above
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
            : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
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

export default function KonfiguratorFaza1HrubaStavba({ 
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  predlzenie, setPredlzenie,
  dom,
  cennik
  }) {
  
  const phaseRef = React.useRef(null);
  const { t } = useLanguage();

  // Scroll to phase on mount (mobile only)
  React.useEffect(() => {
    if (phaseRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        phaseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  // Cenník je už CENY objekt z rodiča (KonfiguratorProstoHouse) s finálnymi cenami
  // Vrátime priamo cenu alebo 0 ako fallback

  // Informácia či model podporuje ultra izoláciu (Fjord nemá ultra)
  const hasUltraInsulation = dom?.nazov !== "Fjord";
  const hasPredlzenie = setPredlzenie && (dom?.nazov === "Prosto House" || dom?.nazov === "A-Frame" || dom?.nazov === "Barn 48" || dom?.nazov === "Barn Double");
  
  // Sekcia Header komponenta bez animácií
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

  return (
    <motion.div
      ref={phaseRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Odporúčací text pre A0 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">
            {t('a0Recommendation')}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-amber-200/50 hover:ring-2 hover:ring-amber-300/70 transition-all duration-300">
        <SectionHeader 
          icon={Package} 
          title={t('phase1')} 
          subtitle={t('phase1Subtitle')}
          color="from-amber-600 to-orange-600"
          step="1"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-amber-50/50 to-white">
          {/* Upozornenie na montáž */}
          <p className="text-[10px] sm:text-xs text-red-600 mb-3 text-center">{t('assemblyNote')}</p>
          
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Montáž - skupina */}
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-4 border-[5px] border-amber-600 rounded-2xl bg-amber-100/70 shadow-xl">
              <p className="col-span-2 text-[10px] sm:text-xs font-bold text-amber-700 -mb-1 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">1</span>
                {t('assembly')} ({t('selectOne')})
              </p>
              <Tile
                selected={montazHolodomu === "nie"}
                onClick={() => setMontazHolodomu("nie")}
                icon={Wrench}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title={t('assemblyNo')}
                subtitle={t('onlyKit')}
                price="0 €"
                isPriced={false}
                tooltip={t('assemblyNote')}
              />

              <Tile
                selected={montazHolodomu === "ano"}
                onClick={() => setMontazHolodomu("ano")}
                icon={Wrench}
                iconColor="text-amber-400"
                iconSelectedColor="text-amber-600"
                title={t('assemblyYes')}
                subtitle={t('phase1')}
                price={`+ ${(cennik?.montaz?.ano || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('assemblyNote')}
              />
            </div>

            {/* Predĺženie domu - len pre modely ktoré to podporujú */}
            {hasPredlzenie && (
              <div className="col-span-2 sm:col-span-3 lg:col-span-4 p-4 border-[5px] border-indigo-600 rounded-2xl bg-indigo-100/70 shadow-xl">
                <p className="text-xs font-bold text-indigo-700 mb-3 flex items-center gap-1">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-extrabold">+</span>
                  Predĺženie dĺžky domu (v násobkoch 1,2m)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { value: 0, label: "Bez predĺženia", price: "0 €", basePrice: 0 },
                    { value: 1.2, label: "+1,2 m", price: `+ ${(cennik?.predlzenie?.[1.2] || 0).toLocaleString('sk-SK')} €`, basePrice: cennik?.predlzenie?.[1.2] || 0 },
                    { value: 2.4, label: "+2,4 m", price: `+ ${(cennik?.predlzenie?.[2.4] || 0).toLocaleString('sk-SK')} €`, basePrice: cennik?.predlzenie?.[2.4] || 0 },
                    { value: 3.6, label: "+3,6 m", price: `+ ${(cennik?.predlzenie?.[3.6] || 0).toLocaleString('sk-SK')} €`, basePrice: cennik?.predlzenie?.[3.6] || 0 },
                    { value: 4.8, label: "+4,8 m", price: `+ ${(cennik?.predlzenie?.[4.8] || 0).toLocaleString('sk-SK')} €`, basePrice: cennik?.predlzenie?.[4.8] || 0 }
                  ].map((opt) => (
                    <motion.div
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPredlzenie(opt.value)}
                      className={`p-3 rounded-lg cursor-pointer text-center transition-all ${
                        predlzenie === opt.value 
                          ? "bg-indigo-200 border-2 border-indigo-600 shadow-lg" 
                          : "bg-white border-2 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <Maximize className={`w-5 h-5 mx-auto mb-1 ${predlzenie === opt.value ? "text-indigo-600" : "text-gray-400"}`} />
                      <span className="font-medium text-gray-800 text-xs block">{opt.label}</span>
                      <span className={`text-xs ${opt.basePrice === 0 ? "text-gray-400" : "text-green-600 font-bold"}`}>
                        {opt.price}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Izolácia - skupina */}
            <div className={`col-span-2 sm:col-span-3 lg:col-span-2 grid ${hasUltraInsulation ? 'grid-cols-4' : 'grid-cols-3'} gap-2 sm:gap-3 p-4 border-[5px] border-cyan-600 rounded-2xl bg-cyan-100/70 shadow-xl`}>
              <p className={`${hasUltraInsulation ? 'col-span-4' : 'col-span-3'} text-[10px] sm:text-xs font-bold text-cyan-700 -mb-1 flex items-center gap-1`}>
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">2</span>
                {t('insulation')} ({t('selectOne')})
              </p>
              <Tile
                selected={izolaciaNavysenie === "standard"}
                onClick={() => setIzolaciaNavysenie("standard")}
                icon={ThermometerSun}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title={t('insulationStandard')}
                subtitle="150/200mm"
                price="0 €"
                isPriced={false}
                tooltip={t('insulationStandardDesc')}
              />

              <Tile
                selected={izolaciaNavysenie === "zvysena"}
                onClick={() => setIzolaciaNavysenie("zvysena")}
                icon={ThermometerSun}
                iconColor="text-orange-400"
                iconSelectedColor="text-amber-600"
                title={t('insulationEnhanced')}
                subtitle={t('insulationEnhancedDesc')}
                price={`+ ${(cennik?.izolacia?.zvysena || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('insulationEnhancedDesc')}
              />

              <Tile
                selected={izolaciaNavysenie === "premium"}
                onClick={() => setIzolaciaNavysenie("premium")}
                icon={ThermometerSun}
                iconColor="text-green-500"
                iconSelectedColor="text-green-600"
                title={t('insulationPremium')}
                subtitle={t('insulationPremiumDesc')}
                price={`+ ${(cennik?.izolacia?.premium || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                isA0={true}
                selectedBg="bg-green-100"
                selectedBorder="border-green-500"
                selectedRing="ring-green-300"
                tooltip={t('insulationPremiumDesc')}
              />

              {hasUltraInsulation && (
                <Tile
                  selected={izolaciaNavysenie === "ultra"}
                  onClick={() => setIzolaciaNavysenie("ultra")}
                  icon={ThermometerSun}
                  iconColor="text-green-600"
                  iconSelectedColor="text-green-700"
                  title="300mm"
                  subtitle="Ultra izolácia"
                  price={`+ ${(cennik?.izolacia?.ultra || 0).toLocaleString('sk-SK')} €`}
                  isPriced={true}
                  isA0={true}
                  selectedBg="bg-green-100"
                  selectedBorder="border-green-500"
                  selectedRing="ring-green-300"
                  tooltip="Maximálna izolácia 300mm pre extra energetickú efektívnosť"
                />
              )}
            </div>

            {/* Základy - skupina */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 border-[5px] border-orange-600 rounded-2xl bg-orange-100/70 shadow-xl">
              <p className="col-span-2 sm:col-span-4 text-[10px] sm:text-xs font-bold text-orange-700 -mb-1 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">3</span>
                {t('foundations')} ({t('selectOne')})
              </p>
              <Tile
                selected={zaklady === "bez"}
                onClick={() => setZaklady("bez")}
                icon={Landmark}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title={t('foundationsNone')}
                subtitle={t('own')}
                price="0 €"
                isPriced={false}
                tooltip={t('foundationsNone')}
              />

              <Tile
                selected={zaklady === "skrutky"}
                onClick={() => setZaklady("skrutky")}
                icon={Landmark}
                iconColor="text-amber-400"
                iconSelectedColor="text-amber-600"
                title="Pilóty/Pätky"
                subtitle={t('groundFootings')}
                price={`+ ${(cennik?.zaklady?.skrutky || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('foundationsScrews')}
              />

              <Tile
                selected={zaklady === "doska"}
                onClick={() => setZaklady("doska")}
                icon={Landmark}
                iconColor="text-orange-400"
                iconSelectedColor="text-amber-600"
                title={t('foundationsSlab')}
                subtitle={t('foundationSlab')}
                price={`+ ${(cennik?.zaklady?.doska || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('foundationsSlab')}
              />

              <Tile
                selected={zaklady === "pasove"}
                onClick={() => setZaklady("pasove")}
                icon={Landmark}
                iconColor="text-orange-500"
                iconSelectedColor="text-amber-600"
                title={t('foundationsStrip')}
                subtitle={t('stripFound')}
                price={`+ ${(cennik?.zaklady?.pasove || 0).toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('foundationsStrip')}
              />
            </div>

          </div>
        </div>
      </Card>
    </motion.div>
  );
}