import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Wrench, ThermometerSun, Landmark, Package, Sparkles, Maximize, Pencil, Save, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";

// --- NOVÝ TILE KOMPONENT S ADMIN LOGIKOU ---
const Tile = ({ 
  selected, 
  onClick, 
  icon: Icon, 
  iconColor, 
  iconSelectedColor, 
  title, 
  subtitle, 
  price, // Zobrazená cena (string alebo číslo)
  priceValue, // Surová hodnota ceny pre editáciu (číslo)
  priceKey, // Kľúč v DB (napr. 'montaz.ano')
  updatePrice, // Funkcia na update ceny
  isAdmin, // Boolean - či som admin
  isPriced, 
  isA0, 
  tooltip, 
  selectedBg = "bg-amber-100", 
  selectedBorder = "border-amber-500", 
  selectedRing = "ring-amber-300" 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Stav editácie
  const [editValue, setEditValue] = useState(priceValue || 0); // Dočasná hodnota
  const tileRef = useRef(null);

  // Tooltip logika (zachovaná pôvodná)
  const [hoverTimer, setHoverTimer] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const updateTooltipPosition = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      const left = Math.min(Math.max(rect.left + rect.width / 2, 138), window.innerWidth - 138);
      let top = rect.bottom + 10;
      if (top + 80 > window.innerHeight) top = rect.top - 90;
      setTooltipPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      updateTooltipPosition();
      setShowTooltip(true);
    }, 1500); // Mierně dlhší delay aby to neblikalo
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  // --- ADMIN HANDLERS ---
  const startEditing = (e) => {
    e.stopPropagation(); // Aby sme nevybrali dlaždicu pri kliku na ceruzku
    setEditValue(priceValue || 0);
    setIsEditing(true);
  };

  const savePrice = (e) => {
    e.stopPropagation();
    if (updatePrice && priceKey) {
      updatePrice(priceKey, Number(editValue));
    }
    setIsEditing(false);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={tileRef}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={!isEditing ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // ZMENA CSS: h-full zabezpečí rovnakú výšku, flex-col a justify-between roztiahne obsah
      className={`relative p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center justify-between h-full min-h-[180px] group ${
        selected 
          ? `${selectedBg} border-2 ${selectedBorder} shadow-xl ring-2 ${selectedRing}` 
          : isA0 
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 hover:border-green-500"
            : "bg-white border-2 border-gray-200 hover:border-amber-400"
      }`}
    >
      
      {/* Admin Edit Button */}
      {isAdmin && isPriced && !isEditing && (
        <div 
          onClick={startEditing}
          className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full z-50 transition-colors cursor-pointer border border-gray-300"
        >
          <Pencil className="w-3 h-3 text-gray-600" />
        </div>
      )}

      {/* A0 Badge */}
      {isA0 && (
        <Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 z-10 font-bold">
          A0
        </Badge>
      )}
      
      {/* Selected Check Animation - Posunuté do pozadia (z-index) aby neprekrývalo text */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Container - z-30 aby bol nad animáciou */}
      <div className="relative z-30 flex flex-col items-center gap-2 w-full mt-4">
        <Icon className={`w-8 h-8 ${selected ? iconSelectedColor : iconColor}`} />
        
        {/* ZMENA: Odstránený truncate, pridaný whitespace-normal */}
        <span className="font-bold text-gray-800 text-sm leading-tight whitespace-normal break-words w-full">
          {title}
        </span>
        <span className="text-xs text-gray-500 leading-tight whitespace-normal break-words w-full px-1">
          {subtitle}
        </span>
      </div>

      {/* Price Section */}
      <div className="relative z-30 mt-3 min-h-[24px] w-full flex justify-center items-center">
        {isEditing ? (
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-blue-400 shadow-lg absolute bottom-0 w-[90%] left-[5%]">
            <input 
              type="number" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full text-xs p-1 border-none focus:ring-0 text-center font-bold"
              autoFocus
            />
            <Save onClick={savePrice} className="w-4 h-4 text-green-600 cursor-pointer hover:scale-110" />
            <X onClick={cancelEdit} className="w-4 h-4 text-red-600 cursor-pointer hover:scale-110" />
          </div>
        ) : (
          <span className={`${isPriced ? "font-bold text-green-700" : "text-gray-400 font-medium"} text-sm bg-white/50 px-2 py-0.5 rounded-full`}>
            {price}
          </span>
        )}
      </div>

      {/* Tooltip Portal */}
      {showTooltip && tooltip && ReactDOM.createPortal(
        <div 
          className="fixed z-[9999] w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left, transform: 'translateX(-50%)' }}
        >
          {tooltip}
        </div>,
        document.body
      )}
    </motion.div>
  );
};

// --- HLAVNÝ KOMPONENT ---
export default function KonfiguratorFaza1HrubaStavba({ 
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  predlzenie, setPredlzenie,
  dom,
  cennik,
  // Tieto props musíme prijať z parenta (KonfiguratorFjord.jsx)
  isAdmin = false, 
  updatePrice = (key, val) => console.log("Simulácia uloženia:", key, val) 
}) {
  
  const phaseRef = useRef(null);
  const { t } = useLanguage();

  const hasUltraInsulation = dom?.nazov !== "Fjord";
  const hasPredlzenie = setPredlzenie && ["Prosto House", "A-Frame", "Barn 48", "Barn Double"].includes(dom?.nazov);
  
  const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
    <div className={`relative flex items-center gap-3 p-4 bg-gradient-to-r ${color} rounded-t-xl overflow-hidden`}>
      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider border border-white/30 px-2 rounded-full">{t('phase')} {step}</span>
        </div>
        <h3 className="text-lg font-bold text-white leading-none mt-1">{title}</h3>
        {subtitle && <p className="text-white/80 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <motion.div
      ref={phaseRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* A0 Info Box */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 shadow-sm">
        <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-800 font-medium leading-snug">{t('a0Recommendation')}</p>
      </div>

      <Card className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
        <SectionHeader 
          icon={Package} 
          title={t('phase1')} 
          subtitle={t('phase1Subtitle')}
          color="from-amber-600 to-orange-600"
          step="1"
        />
        
        <div className="p-4 sm:p-6 bg-gray-50/50">
          <p className="text-xs text-red-600 mb-4 text-center bg-red-50 p-2 rounded border border-red-100">{t('assemblyNote')}</p>
          
          {/* GRID LAYOUT - Opravené medzery a zarovnanie */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. MONTÁŽ */}
            <div className="col-span-2 p-4 border-2 border-amber-200 rounded-2xl bg-amber-50/30">
               <p className="text-xs font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                {t('assembly')}
              </p>
              <div className="grid grid-cols-2 gap-3 h-full">
                <Tile 
                  selected={montazHolodomu === "nie"} 
                  onClick={() => setMontazHolodomu("nie")} 
                  icon={Wrench} 
                  iconColor="text-amber-600" 
                  iconSelectedColor="text-amber-800" 
                  title={t('assemblyNo')} 
                  subtitle={t('onlyKit')} 
                  price="0 €"
                  isAdmin={isAdmin}
                  isPriced={false}
                />
                <Tile 
                  selected={montazHolodomu === "ano"} 
                  onClick={() => setMontazHolodomu("ano")} 
                  icon={Check} 
                  iconColor="text-amber-600" 
                  iconSelectedColor="text-amber-800" 
                  title={t('assemblyYes')} 
                  subtitle={t('phase1')} 
                  price={`+ ${(cennik?.montaz?.ano || 0).toLocaleString('sk-SK')} €`}
                  priceValue={cennik?.montaz?.ano}
                  priceKey="montaz.ano"
                  updatePrice={updatePrice}
                  isAdmin={isAdmin}
                  isPriced={true}
                />
              </div>
            </div>

            {/* 2. IZOLÁCIA */}
            <div className="col-span-2 p-4 border-2 border-cyan-200 rounded-2xl bg-cyan-50/30">
               <p className="text-xs font-bold text-cyan-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                {t('insulation')}
              </p>
              <div className={`grid ${hasUltraInsulation ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 h-auto`}>
                 <Tile 
                    selected={izolaciaNavysenie === "standard"} 
                    onClick={() => setIzolaciaNavysenie("standard")} 
                    icon={ThermometerSun} 
                    iconColor="text-cyan-600" 
                    iconSelectedColor="text-cyan-800" 
                    title={t('insulationStandard')} 
                    subtitle="150/200mm" 
                    price="0 €"
                    isAdmin={isAdmin}
                    isPriced={false}
                  />
                  <Tile 
                    selected={izolaciaNavysenie === "zvysena"} 
                    onClick={() => setIzolaciaNavysenie("zvysena")} 
                    icon={ThermometerSun} 
                    iconColor="text-cyan-600" 
                    iconSelectedColor="text-cyan-800" 
                    title={t('insulationEnhanced')} 
                    subtitle={t('insulationEnhancedDesc')}
                    price={`+ ${(cennik?.izolacia?.zvysena || 0).toLocaleString('sk-SK')} €`}
                    priceValue={cennik?.izolacia?.zvysena}
                    priceKey="izolacia.zvysena"
                    updatePrice={updatePrice}
                    isAdmin={isAdmin}
                    isPriced={true}
                  />
                  <Tile 
                    selected={izolaciaNavysenie === "premium"} 
                    onClick={() => setIzolaciaNavysenie("premium")} 
                    icon={ThermometerSun} 
                    iconColor="text-cyan-600" 
                    iconSelectedColor="text-cyan-800" 
                    title={t('insulationPremium')} 
                    subtitle={t('insulationPremiumDesc')}
                    price={`+ ${(cennik?.izolacia?.premium || 0).toLocaleString('sk-SK')} €`}
                    priceValue={cennik?.izolacia?.premium}
                    priceKey="izolacia.premium"
                    updatePrice={updatePrice}
                    isAdmin={isAdmin}
                    isPriced={true}
                    isA0={true}
                  />
                  {hasUltraInsulation && (
                    <Tile 
                      selected={izolaciaNavysenie === "ultra"} 
                      onClick={() => setIzolaciaNavysenie("ultra")} 
                      icon={ThermometerSun} 
                      iconColor="text-cyan-600" 
                      iconSelectedColor="text-cyan-800" 
                      title="Ultra 300mm" 
                      subtitle="Pre pasívne domy"
                      price={`+ ${(cennik?.izolacia?.ultra || 0).toLocaleString('sk-SK')} €`}
                      priceValue={cennik?.izolacia?.ultra}
                      priceKey="izolacia.ultra"
                      updatePrice={updatePrice}
                      isAdmin={isAdmin}
                      isPriced={true}
                      isA0={true}
                    />
                  )}
              </div>
            </div>

            {/* 3. ZÁKLADY */}
            <div className="col-span-2 lg:col-span-4 p-4 border-2 border-orange-200 rounded-2xl bg-orange-50/30">
               <p className="text-xs font-bold text-orange-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                {t('foundations')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <Tile 
                    selected={zaklady === "bez"} 
                    onClick={() => setZaklady("bez")} 
                    icon={Landmark} 
                    iconColor="text-orange-600" 
                    iconSelectedColor="text-orange-800" 
                    title={t('foundationsNone')} 
                    subtitle={t('own')} 
                    price="0 €"
                    isAdmin={isAdmin}
                    isPriced={false}
                  />
                  <Tile 
                    selected={zaklady === "skrutky"} 
                    onClick={() => setZaklady("skrutky")} 
                    icon={Landmark} 
                    iconColor="text-orange-600" 
                    iconSelectedColor="text-orange-800" 
                    title="Pilóty/Pätky" 
                    subtitle={t('groundFootings')}
                    price={`+ ${(cennik?.zaklady?.skrutky || 0).toLocaleString('sk-SK')} €`}
                    priceValue={cennik?.zaklady?.skrutky}
                    priceKey="zaklady.skrutky"
                    updatePrice={updatePrice}
                    isAdmin={isAdmin}
                    isPriced={true}
                  />
                   <Tile 
                    selected={zaklady === "doska"} 
                    onClick={() => setZaklady("doska")} 
                    icon={Landmark} 
                    iconColor="text-orange-600" 
                    iconSelectedColor="text-orange-800" 
                    title={t('foundationsSlab')} 
                    subtitle={t('foundationSlab')}
                    price={`+ ${(cennik?.zaklady?.doska || 0).toLocaleString('sk-SK')} €`}
                    priceValue={cennik?.zaklady?.doska}
                    priceKey="zaklady.doska"
                    updatePrice={updatePrice}
                    isAdmin={isAdmin}
                    isPriced={true}
                  />
                  <Tile 
                    selected={zaklady === "pasove"} 
                    onClick={() => setZaklady("pasove")} 
                    icon={Landmark} 
                    iconColor="text-orange-600" 
                    iconSelectedColor="text-orange-800" 
                    title={t('foundationsStrip')} 
                    subtitle={t('stripFound')}
                    price={`+ ${(cennik?.zaklady?.pasove || 0).toLocaleString('sk-SK')} €`}
                    priceValue={cennik?.zaklady?.pasove}
                    priceKey="zaklady.pasove"
                    updatePrice={updatePrice}
                    isAdmin={isAdmin}
                    isPriced={true}
                  />
              </div>
            </div>

            {/* 4. PREDĹŽENIE (Voliteľné) */}
            {hasPredlzenie && (
               <div className="col-span-2 lg:col-span-4 p-4 border-2 border-indigo-200 rounded-2xl bg-indigo-50/30">
                 <p className="text-xs font-bold text-indigo-800 mb-3 flex items-center gap-2">
                   <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]">+</span>
                   Predĺženie domu
                 </p>
                 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { value: 0, label: "Bez predĺženia", price: 0 },
                      { value: 1.2, label: "+1,2 m", price: cennik?.predlzenie?.[1.2] },
                      { value: 2.4, label: "+2,4 m", price: cennik?.predlzenie?.[2.4] },
                      { value: 3.6, label: "+3,6 m", price: cennik?.predlzenie?.[3.6] },
                      { value: 4.8, label: "+4,8 m", price: cennik?.predlzenie?.[4.8] }
                    ].map((opt) => (
                       <Tile 
                        key={opt.value}
                        selected={predlzenie === opt.value} 
                        onClick={() => setPredlzenie(opt.value)} 
                        icon={Maximize} 
                        iconColor="text-indigo-600" 
                        iconSelectedColor="text-indigo-800" 
                        title={opt.label}
                        subtitle={opt.price ? "Extra priestor" : "Štandard"}
                        price={opt.price ? `+ ${opt.price.toLocaleString('sk-SK')} €` : '0 €'}
                        priceValue={opt.price}
                        priceKey={`predlzenie.${opt.value}`}
                        updatePrice={updatePrice}
                        isAdmin={isAdmin}
                        isPriced={opt.price > 0}
                        selectedBg="bg-indigo-100"
                        selectedBorder="border-indigo-600"
                        selectedRing="ring-indigo-300"
                      />
                    ))}
                 </div>
               </div>
            )}

          </div>
        </div>
      </Card>
    </motion.div>
  );
}