import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Check, Wrench, ThermometerSun, Landmark, Package, Sparkles, Maximize, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";



// Dlaždica s tooltip a veľkou fajkou
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-amber-100", selectedBorder = "border-amber-500", selectedRing = "ring-amber-300", isAdmin = false, priceKey, onPriceChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(price);
  const tileRef = useRef(null);

  // Sleduj zmeny v price prop a resetni editing
  React.useEffect(() => {
    setEditPrice(price);
    setIsEditing(false);
  }, [price]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    const priceNum = price.replace(/[^0-9]/g, '');
    setEditPrice(priceNum);
  };

  const handleSavePrice = async (e) => {
    if (e) e.stopPropagation();
    console.log('handleSavePrice called', { priceKey, editPrice, hasOnPriceChange: !!onPriceChange });
    
    if (!onPriceChange) {
      console.error('onPriceChange je undefined!');
      return;
    }
    
    try {
      const newPrice = parseFloat(editPrice);
      console.log('Parsed price:', newPrice);
      
      if (!isNaN(newPrice)) {
        console.log('Calling onPriceChange with:', priceKey, newPrice);
        await onPriceChange(priceKey, newPrice);
        console.log('onPriceChange completed');
        
        // Exit edit mode after successful save
        setIsEditing(false);
      } else {
        console.error('Invalid price:', editPrice);
      }
    } catch (error) {
      console.error('Error saving price:', error);
      setIsEditing(false);
    }
  };

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
      whileHover={{ scale: 1.08, y: -6 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative p-3 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center min-h-[140px] sm:min-h-[160px] justify-center overflow-hidden group ${
        selected 
          ? `${selectedBg} border-2 ${selectedBorder} shadow-2xl ring-2 ${selectedRing} bg-opacity-90` 
          : isA0 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 shadow-lg hover:shadow-xl hover:border-green-500"
            : "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 shadow-md hover:shadow-xl hover:border-amber-400"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {isA0 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-[7px] sm:text-[9px] px-2 sm:px-2.5 py-0.5 z-10 shadow-lg font-bold tracking-wider">
            <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-1" />
            A0
          </Badge>
        </motion.div>
      )}
      
      {/* Animovaná zelená fajka */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <Check className="w-7 h-7 sm:w-16 sm:h-16 text-white stroke-[3]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="relative z-10 flex flex-col items-center gap-1">
        <div className={`p-1.5 sm:p-2 rounded-lg transition-all ${selected ? "bg-white/30" : "bg-white/0 group-hover:bg-white/20"}`}>
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${selected ? iconSelectedColor : iconColor} ${selected ? "opacity-30" : ""}`} />
        </div>
        <span className={`font-bold text-gray-800 text-[11px] sm:text-sm leading-snug transition-opacity ${selected ? "opacity-30" : ""}`}>{title}</span>
        <span className={`text-[8px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 leading-snug transition-opacity ${selected ? "opacity-30" : ""}`}>{subtitle}</span>
      </motion.div>
      <div className={`flex items-center gap-1 justify-center relative`}>
        {isEditing && isPriced ? (
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              onBlur={handleSavePrice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePrice();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-16 px-1.5 py-1 text-xs border-2 border-green-500 rounded bg-white text-gray-800 font-semibold"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => handleSavePrice(e)}
              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded transition-all active:scale-95"
              title="Uložiť cenu"
            >
              ✓
            </button>
          </div>
        ) : (
          <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-[9px] sm:text-xs mt-1 sm:mt-2`}>{price}</span>
        )}
        {isPriced && !isEditing && (
          <button
            onClick={handleEditClick}
            className="ml-1 p-0.5 hover:bg-amber-200 rounded transition-all hover:scale-110 active:scale-95"
            title="Edituj cenu"
          >
            <Pencil className="w-4 h-4 text-amber-600 stroke-[2.5]" />
          </button>
        )}
      </div>

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
  cennik,
  isAdmin = false,
  onPriceChange
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
              <Tile selected={montazHolodomu === "nie"} onClick={() => setMontazHolodomu("nie")} icon={Wrench} iconColor="text-amber-600" iconSelectedColor="text-amber-800" title={t('assemblyNo')} subtitle={t('onlyKit')} price="0 €" isPriced={false} isAdmin={isAdmin} />

              <Tile selected={montazHolodomu === "ano"} onClick={() => setMontazHolodomu("ano")} icon={Check} iconColor="text-amber-600" iconSelectedColor="text-amber-800" title={t('assemblyYes')} subtitle={t('phase1')} price={`+ ${(cennik?.montaz?.ano || 0).toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="montaz_ano" onPriceChange={onPriceChange} />
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
                    { value: 0, label: "Bez predĺženia", basePrice: 0 },
                    { value: 1.2, label: "+1,2 m", basePrice: cennik?.predlzenie?.[1.2] || 0 },
                    { value: 2.4, label: "+2,4 m", basePrice: cennik?.predlzenie?.[2.4] || 0 },
                    { value: 3.6, label: "+3,6 m", basePrice: cennik?.predlzenie?.[3.6] || 0 },
                    { value: 4.8, label: "+4,8 m", basePrice: cennik?.predlzenie?.[4.8] || 0 }
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
                        {opt.basePrice > 0 ? `+ ${opt.basePrice.toLocaleString('sk-SK')} €` : '0 €'}
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
              <Tile selected={izolaciaNavysenie === "standard"} onClick={() => setIzolaciaNavysenie("standard")} icon={ThermometerSun} iconColor="text-cyan-600" iconSelectedColor="text-cyan-800" title={t('insulationStandard')} subtitle="150/200mm" price="0 €" isPriced={false} isAdmin={isAdmin} />

              <Tile selected={izolaciaNavysenie === "zvysena"} onClick={() => setIzolaciaNavysenie("zvysena")} icon={ThermometerSun} iconColor="text-cyan-600" iconSelectedColor="text-cyan-800" title={t('insulationEnhanced')} subtitle={t('insulationEnhancedDesc')} price={`+ ${(cennik?.izolacia?.zvysena || 0).toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="izolacia_zvysena" onPriceChange={onPriceChange} />

              <Tile selected={izolaciaNavysenie === "premium"} onClick={() => setIzolaciaNavysenie("premium")} icon={ThermometerSun} iconColor="text-cyan-600" iconSelectedColor="text-cyan-800" title={t('insulationPremium')} subtitle={t('insulationPremiumDesc')} price={`+ ${(cennik?.izolacia?.premium || 0).toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} isAdmin={isAdmin} priceKey="izolacia_premium" onPriceChange={onPriceChange} />

              {hasUltraInsulation && (
                <Tile selected={izolaciaNavysenie === "ultra"} onClick={() => setIzolaciaNavysenie("ultra")} icon={ThermometerSun} iconColor="text-cyan-600" iconSelectedColor="text-cyan-800" title="300mm" subtitle="Ultra izolácia" price={`+ ${(cennik?.izolacia?.ultra || 0).toLocaleString('sk-SK')} €`} isPriced={true} isA0={true} isAdmin={isAdmin} priceKey="izolacia_ultra" onPriceChange={onPriceChange} />
              )}
            </div>

            {/* Základy - skupina */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 border-[5px] border-orange-600 rounded-2xl bg-orange-100/70 shadow-xl">
              <p className="col-span-2 sm:col-span-4 text-[10px] sm:text-xs font-bold text-orange-700 -mb-1 flex items-center gap-1">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-extrabold">3</span>
                {t('foundations')} ({t('selectOne')})
              </p>
              <Tile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} icon={Landmark} iconColor="text-orange-600" iconSelectedColor="text-orange-800" title={t('foundationsNone')} subtitle={t('own')} price="0 €" isPriced={false} isAdmin={isAdmin} />

              <Tile selected={zaklady === "skrutky"} onClick={() => setZaklady("skrutky")} icon={Landmark} iconColor="text-orange-600" iconSelectedColor="text-orange-800" title="Pilóty/Pätky" subtitle={t('groundFootings')} price={`+ ${(cennik?.zaklady?.skrutky || 0).toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="zaklady_skrutky" onPriceChange={onPriceChange} />

              <Tile selected={zaklady === "doska"} onClick={() => setZaklady("doska")} icon={Landmark} iconColor="text-orange-600" iconSelectedColor="text-orange-800" title={t('foundationsSlab')} subtitle={t('foundationSlab')} price={`+ ${(cennik?.zaklady?.doska || 0).toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="zaklady_doska" onPriceChange={onPriceChange} />

              <Tile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} icon={Landmark} iconColor="text-orange-600" iconSelectedColor="text-orange-800" title={t('foundationsStrip')} subtitle={t('stripFound')} price={`+ ${(cennik?.zaklady?.pasove || 0).toLocaleString('sk-SK')} €`} isPriced={true} isAdmin={isAdmin} priceKey="zaklady_pasove" onPriceChange={onPriceChange} />
            </div>

          </div>
        </div>
      </Card>
    </motion.div>
  );
}