import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, Wrench, ThermometerSun, Landmark, Package, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            
            {/* Montáž - Nie */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMontazHolodomu("nie")}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                montazHolodomu === "nie" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Wrench className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${montazHolodomu === "nie" ? "text-amber-600" : "text-gray-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Bez montáže</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Iba sada</span>
              <span className="text-gray-400 font-medium text-xs mt-2">+ 0 €</span>
              {montazHolodomu === "nie" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Montáž - Áno */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (montazHolodomu !== "ano") triggerAnimation?.("montaz", e.currentTarget); setMontazHolodomu("ano"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                montazHolodomu === "ano" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Wrench className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${montazHolodomu === "ano" ? "text-amber-600" : "text-amber-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">S montážou</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Hrubá stavba</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 17 970 €</span>
              {montazHolodomu === "ano" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Izolácia - Štandard */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIzolaciaNavysenie("standard")}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                izolaciaNavysenie === "standard" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <ThermometerSun className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${izolaciaNavysenie === "standard" ? "text-amber-600" : "text-gray-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Izolácia štd.</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">150/200mm</span>
              <span className="text-gray-400 font-medium text-xs mt-2">+ 0 €</span>
              {izolaciaNavysenie === "standard" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Izolácia - Zvýšená */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (izolaciaNavysenie !== "zvysena") triggerAnimation?.("izolacia", e.currentTarget); setIzolaciaNavysenie("zvysena"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                izolaciaNavysenie === "zvysena" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <ThermometerSun className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${izolaciaNavysenie === "zvysena" ? "text-amber-600" : "text-orange-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Izolácia +</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">200/250mm</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 5 799 €</span>
              {izolaciaNavysenie === "zvysena" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Izolácia - Premium A0 */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (izolaciaNavysenie !== "premium") triggerAnimation?.("izolacia", e.currentTarget); setIzolaciaNavysenie("premium"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                izolaciaNavysenie === "premium" 
                  ? "bg-green-100 border-2 border-green-500 shadow-xl ring-2 ring-green-300" 
                  : "bg-green-50 border-2 border-green-300 hover:border-green-400 hover:shadow-md"
              }`}
            >
              <Badge className="absolute top-1 left-1 bg-gradient-to-r from-green-500 to-emerald-600 text-[8px] px-1.5">
                <Sparkles className="w-2 h-2 mr-0.5" />A0
              </Badge>
              <ThermometerSun className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${izolaciaNavysenie === "premium" ? "text-green-600" : "text-green-500"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Premium</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">250/300mm</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 11 600 €</span>
              {izolaciaNavysenie === "premium" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-600" />}
            </motion.div>

            {/* Základy - Bez */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setZaklady("bez")}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                zaklady === "bez" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Landmark className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${zaklady === "bez" ? "text-amber-600" : "text-gray-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Bez základov</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Vlastné</span>
              <span className="text-gray-400 font-medium text-xs mt-2">+ 0 €</span>
              {zaklady === "bez" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Základy - Skrutky */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (zaklady !== "skrutky") triggerAnimation?.("skrutky", e.currentTarget); setZaklady("skrutky"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                zaklady === "skrutky" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Landmark className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${zaklady === "skrutky" ? "text-amber-600" : "text-amber-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Skrutky</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Zemné pätky</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 8 140 €</span>
              {zaklady === "skrutky" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Základy - Doska */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (zaklady !== "doska") triggerAnimation?.("beton", e.currentTarget); setZaklady("doska"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                zaklady === "doska" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Landmark className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${zaklady === "doska" ? "text-amber-600" : "text-orange-400"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Doska</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Základová</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 17 946 €</span>
              {zaklady === "doska" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

            {/* Základy - Pásové */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { if (zaklady !== "pasove") triggerAnimation?.("beton", e.currentTarget); setZaklady("pasove"); }}
              className={`relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                zaklady === "pasove" 
                  ? "bg-amber-100 border-2 border-amber-500 shadow-xl ring-2 ring-amber-300" 
                  : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <Landmark className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${zaklady === "pasove" ? "text-amber-600" : "text-orange-500"}`} />
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">Pásové</span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Základy</span>
              <span className="font-bold text-green-600 text-xs mt-2">+ 21 079 €</span>
              {zaklady === "pasove" && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-amber-600" />}
            </motion.div>

          </div>
        </div>
      </Card>
    </motion.div>
  );
}