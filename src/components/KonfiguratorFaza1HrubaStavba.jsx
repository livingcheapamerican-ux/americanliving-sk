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
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-amber-50/50 to-white">

          {/* Montáž hrubej stavby */}
          <motion.div 
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.005 }}
          >
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <motion.div
                animate={{ rotate: montazHolodomu === "ano" ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </motion.div>
              Montáž hrubej stavby
            </Label>
            <p className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">Montážne práce (dodatočne sa účtuje ubytovanie montážnej brigády 3–4 osoby)</p>
            <RadioGroup value={montazHolodomu} onValueChange={setMontazHolodomu} className="space-y-2 sm:space-y-3">
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${montazHolodomu === "nie" ? "border-amber-400 bg-amber-50/70 shadow-sm" : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="nie" id="montaz-nie" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Nie (Iba dodanie sady)</span>
                </div>
                <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (montazHolodomu !== "ano") triggerAnimation?.("montaz", e.currentTarget); }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${montazHolodomu === "ano" ? "border-amber-400 bg-amber-50/70 shadow-sm" : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="ano" id="montaz-ano" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Áno (Montáž hrubej stavby)</span>
                </div>
                <AnimatePresence>
                  {montazHolodomu === "ano" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mr-1 sm:mr-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 17 970 €</span>
              </motion.label>
            </RadioGroup>
          </motion.div>

          {/* Hrúbka izolácie */}
          <motion.div 
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.005 }}
          >
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 block flex items-center gap-2">
              <motion.div animate={{ scale: izolaciaNavysenie === "premium" ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                <ThermometerSun className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              </motion.div>
              Hrúbka izolácie
            </Label>
            <RadioGroup value={izolaciaNavysenie} onValueChange={setIzolaciaNavysenie} className="space-y-2 sm:space-y-3">
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${izolaciaNavysenie === "standard" ? "border-amber-400 bg-amber-50/70 shadow-sm" : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="standard" id="izolacia-standard" />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Štandard</span>
                    <p className="text-[10px] sm:text-sm text-gray-500">Steny 150mm, Strecha 200mm</p>
                    <p className="text-[10px] sm:text-xs text-amber-600 hidden sm:block">Celoročná izolácia pre účely rekreačnej stavby</p>
                  </div>
                </div>
                <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (izolaciaNavysenie !== "zvysena") triggerAnimation?.("izolacia", e.currentTarget); }}
                className={`flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${izolaciaNavysenie === "zvysena" ? "border-amber-400 bg-amber-50/70 shadow-sm" : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="zvysena" id="izolacia-zvysena" />
                  <div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-base">Zvýšená</span>
                    <p className="text-[10px] sm:text-sm text-gray-500">Steny 200mm, Strecha 250mm</p>
                    <p className="text-[10px] sm:text-xs text-amber-600 hidden sm:block">Celoročná izolácia pre účely rekreačnej stavby</p>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 5 799 €</span>
              </motion.label>
              <motion.label 
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { if (izolaciaNavysenie !== "premium") triggerAnimation?.("izolacia", e.currentTarget); }}
                className={`relative flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all overflow-hidden ${izolaciaNavysenie === "premium" ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200" : "border-green-400 bg-green-50/50 hover:bg-green-100"}`}
              >
                {izolaciaNavysenie === "premium" && (
                  <motion.div 
                    className="absolute top-0 right-0"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                  >
                    <div className="bg-green-500 text-white text-[8px] sm:text-[10px] font-bold px-6 sm:px-8 py-0.5 transform rotate-45 translate-x-4 sm:translate-x-6 -translate-y-1">
                      ✓
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="premium" id="izolacia-premium" />
                  <div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-xs sm:text-base">Premium / A0</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-[8px] sm:text-xs animate-pulse">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        A0
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-sm text-gray-500">Steny 250mm, Strecha 300mm</p>
                    <p className="text-[10px] sm:text-xs text-green-700 font-medium hidden sm:block">Potrebná položka pre status rodinného domu</p>
                  </div>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 11 600 €</span>
              </motion.label>
            </RadioGroup>
          </motion.div>

          {/* Typ základov */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 shadow-sm">
            <Label className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 block flex items-center gap-2">
              <Landmark className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
              Typ základov
            </Label>

            <RadioGroup value={zaklady} onValueChange={setZaklady} className="space-y-2 sm:space-y-3">
              <label className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all">
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="bez" id="zaklady-bez" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Bez základov</span>
                </div>
                <span className="text-gray-400 font-medium text-xs sm:text-base">+ 0 €</span>
              </label>
              <label 
                onClick={(e) => { if (zaklady !== "skrutky") triggerAnimation?.("skrutky", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="skrutky" id="zaklady-skrutky" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Zemné skrutky / Pätky</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 8 140 €</span>
              </label>
              <label 
                onClick={(e) => { if (zaklady !== "doska") triggerAnimation?.("beton", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="doska" id="zaklady-doska" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Základová doska</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 17 946 €</span>
              </label>
              <label 
                onClick={(e) => { if (zaklady !== "pasove") triggerAnimation?.("beton", e.currentTarget); }}
                className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem value="pasove" id="zaklady-pasove" />
                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Pásové základy</span>
                </div>
                <span className="font-bold text-green-600 text-xs sm:text-base">+ 21 079 €</span>
              </label>
            </RadioGroup>
          </div>

        </div>
      </Card>
    </motion.div>
  );
}