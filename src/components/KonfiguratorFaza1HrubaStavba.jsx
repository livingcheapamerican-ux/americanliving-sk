import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Check, Wrench, ThermometerSun, Landmark, Package, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      const viewportWidth = window.innerWidth;
      const tooltipHeight = 80; // approximate
      
      // Position tooltip closer to center of screen
      let top, left;
      
      // Vertical: prefer center, but stay near tile
      const centerY = viewportHeight / 2;
      if (rect.bottom < centerY) {
        top = rect.bottom + 10;
      } else {
        top = Math.max(rect.top - tooltipHeight - 10, 60);
      }
      
      // Horizontal: center of viewport
      left = viewportWidth / 2;
      
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

export default function KonfiguratorFaza1HrubaStavba({ 
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  triggerAnimation
}) {
  // Sekcia Header komponenta s animáciou
  const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative flex items-center gap-2 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r ${color} overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>
      
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Odporúčací text pre A0 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">
            Pokiaľ si chcete poskladať rodinný dom s energetickým certifikátom A0 a možnosťou nahlásenia trvalého pobytu, je nutné vybrať všetky zelené položky s označením A0
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-amber-200/50 hover:ring-2 hover:ring-amber-300/70 transition-all duration-300">
        <SectionHeader 
          icon={Package} 
          title="Hrubá stavba" 
          subtitle="Konštrukcia domu a základy"
          color="from-amber-600 to-orange-600"
          step="1"
        />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-amber-50/50 to-white">
          {/* Upozornenie na montáž */}
          <p className="text-[10px] sm:text-xs text-red-600 mb-3 text-center">* Pri montáži sa dodatočne účtuje ubytovanie montážnej brigády (3–4 osoby)</p>
          
          {/* Dlaždice - Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Montáž - skupina */}
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:gap-3 p-3 border-3 border-dashed border-amber-400 rounded-xl bg-amber-50/30 shadow-sm">
              <p className="col-span-2 text-[10px] sm:text-xs font-bold text-amber-700 -mb-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Montáž (vyberte jednu)
              </p>
              <Tile
                selected={montazHolodomu === "nie"}
                onClick={() => setMontazHolodomu("nie")}
                icon={Wrench}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Bez montáže"
                subtitle="Iba sada"
                price="+ 0 €"
                isPriced={false}
                tooltip="Dodanie stavebnej sady bez montážnych prác. Montáž si zabezpečíte svojpomocne."
              />

              <Tile
                selected={montazHolodomu === "ano"}
                onClick={(e) => { if (montazHolodomu !== "ano") triggerAnimation?.("montaz", e.currentTarget); setMontazHolodomu("ano"); }}
                icon={Wrench}
                iconColor="text-amber-400"
                iconSelectedColor="text-amber-600"
                title="S montážou"
                subtitle="Hrubá stavba"
                price="+ 17 970 €"
                isPriced={true}
                tooltip="Kompletná montáž hrubej stavby vrátane konštrukcie, strechy a okien. Ubytovanie brigády sa účtuje zvlášť."
              />
            </div>

            {/* Izolácia - skupina */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-3 p-3 border-3 border-dashed border-cyan-400 rounded-xl bg-cyan-50/30 shadow-sm">
              <p className="col-span-3 text-[10px] sm:text-xs font-bold text-cyan-700 -mb-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                Izolácia (vyberte jednu)
              </p>
              <Tile
                selected={izolaciaNavysenie === "standard"}
                onClick={() => setIzolaciaNavysenie("standard")}
                icon={ThermometerSun}
                iconColor="text-gray-400"
                iconSelectedColor="text-amber-600"
                title="Izolácia štd."
                subtitle="150/200mm"
                price="+ 0 €"
                isPriced={false}
                tooltip="Štandardná izolácia stien 150mm a strechy 200mm. Vhodné pre rekreačné stavby."
              />

              <Tile
                selected={izolaciaNavysenie === "zvysena"}
                onClick={(e) => { if (izolaciaNavysenie !== "zvysena") triggerAnimation?.("izolacia", e.currentTarget); setIzolaciaNavysenie("zvysena"); }}
                icon={ThermometerSun}
                iconColor="text-orange-400"
                iconSelectedColor="text-amber-600"
                title="Izolácia +"
                subtitle="200/250mm"
                price="+ 5 799 €"
                isPriced={true}
                tooltip="Zvýšená izolácia stien 200mm a strechy 250mm. Lepšia tepelná ochrana pre celoročné využitie."
              />

              <Tile
                selected={izolaciaNavysenie === "premium"}
                onClick={(e) => { if (izolaciaNavysenie !== "premium") triggerAnimation?.("izolacia", e.currentTarget); setIzolaciaNavysenie("premium"); }}
                icon={ThermometerSun}
                iconColor="text-green-500"
                iconSelectedColor="text-green-600"
                title="Premium"
                subtitle="250/300mm"
                price="+ 11 600 €"
                isPriced={true}
                isA0={true}
                selectedBg="bg-green-100"
                selectedBorder="border-green-500"
                selectedRing="ring-green-300"
                tooltip="Premium izolácia pre energetický certifikát A0. Steny 250mm, strecha 300mm. Potrebné pre status rodinného domu."
              />
            </div>

            {/* Základy - skupina */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 border-3 border-dashed border-orange-400 rounded-xl bg-orange-50/30 shadow-sm">
              <p className="col-span-2 sm:col-span-4 text-[10px] sm:text-xs font-bold text-orange-700 -mb-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Základy (vyberte jednu)
              </p>
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
                tooltip="Základy si zabezpečíte svojpomocne alebo cez vlastného dodávateľa."
              />

              <Tile
                selected={zaklady === "skrutky"}
                onClick={(e) => { if (zaklady !== "skrutky") triggerAnimation?.("skrutky", e.currentTarget); setZaklady("skrutky"); }}
                icon={Landmark}
                iconColor="text-amber-400"
                iconSelectedColor="text-amber-600"
                title="Skrutky"
                subtitle="Zemné pätky"
                price="+ 8 140 €"
                isPriced={true}
                tooltip="Zemné skrutky alebo betónové pätky. Rýchla a ekonomická voľba pre rovný terén."
              />

              <Tile
                selected={zaklady === "doska"}
                onClick={(e) => { if (zaklady !== "doska") triggerAnimation?.("beton", e.currentTarget); setZaklady("doska"); }}
                icon={Landmark}
                iconColor="text-orange-400"
                iconSelectedColor="text-amber-600"
                title="Doska"
                subtitle="Základová"
                price="+ 17 946 €"
                isPriced={true}
                tooltip="Železobetónová základová doska. Stabilné riešenie vhodné pre väčšinu typov terénu."
              />

              <Tile
                selected={zaklady === "pasove"}
                onClick={(e) => { if (zaklady !== "pasove") triggerAnimation?.("beton", e.currentTarget); setZaklady("pasove"); }}
                icon={Landmark}
                iconColor="text-orange-500"
                iconSelectedColor="text-amber-600"
                title="Pásové"
                subtitle="Základy"
                price="+ 21 079 €"
                isPriced={true}
                tooltip="Klasické pásové základy. Najrobustnejšie riešenie pre náročnejšie podmienky."
              />
            </div>

          </div>
        </div>
      </Card>
    </motion.div>
  );
}