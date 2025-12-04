import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, Zap, Droplets, ThermometerSun, Cable, Square,
  Hammer, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KonfiguratorFaza2Holodom() {
  // State pre všetky voľby
  const [elektroinstalacia, setElektroinstalacia] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitaKomplet, setSanitaKomplet] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  const [pripojkaSiete, setPripojkaSiete] = useState(false);
  const [vstupneDvere, setVstupneDvere] = useState("ziadne");
  const [stresneOkno, setStresneOkno] = useState(0);
  const [bocneOknoFixne, setBocneOknoFixne] = useState(0);
  const [bocneOknoVyklopne90, setBocneOknoVyklopne90] = useState(0);
  const [bocneOknoVyklopne55, setBocneOknoVyklopne55] = useState(0);
  const [povrchokaOkien, setPovrchokaOkien] = useState(false);
  const [tonovaneSkla, setTonovaneSkla] = useState(false);

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
                className={`relative flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all overflow-hidden ${tepelneCerpadlo ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}
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
                className={`relative flex items-center justify-between p-2.5 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all overflow-hidden ${rekuperacia ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' : 'border-green-300 bg-green-50/50 hover:bg-green-100'}`}
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
            <label className="flex items-center justify-between p-2.5 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
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
                <label className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RadioGroupItem value="kovove" id="dvere-kovove" />
                    <span className="text-gray-800 text-xs sm:text-base">Kovové dvere</span>
                  </div>
                  <span className="font-bold text-green-600 text-xs sm:text-base">+ 720 €</span>
                </label>
                <label className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
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
                <div className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${stresneOkno > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={stresneOkno > 0} onCheckedChange={(c) => setStresneOkno(c ? 1 : 0)} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Strešné okno</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={stresneOkno} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setStresneOkno(parseInt(e.target.value) || 0)}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 760 €</span>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoFixne > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoFixne > 0} onCheckedChange={(c) => setBocneOknoFixne(c ? 1 : 0)} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné fixné 90×205</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoFixne} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setBocneOknoFixne(parseInt(e.target.value) || 0)}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 501 €</span>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoVyklopne90 > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoVyklopne90 > 0} onCheckedChange={(c) => setBocneOknoVyklopne90(c ? 1 : 0)} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné výkl. 90×205</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne90} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setBocneOknoVyklopne90(parseInt(e.target.value) || 0)}
                      className="w-12 sm:w-16 text-center h-7 sm:h-9 text-xs sm:text-base"
                    />
                    <span className="font-bold text-green-600 whitespace-nowrap text-xs sm:text-base">× 540 €</span>
                  </div>
                </div>
                <div className={`flex items-center justify-between p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all ${bocneOknoVyklopne55 > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox checked={bocneOknoVyklopne55 > 0} onCheckedChange={(c) => setBocneOknoVyklopne55(c ? 1 : 0)} className="data-[state=checked]:bg-blue-600" />
                    <span className="text-gray-800 text-xs sm:text-base">Bočné výkl. 55×90</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={bocneOknoVyklopne55} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setBocneOknoVyklopne55(parseInt(e.target.value) || 0)}
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
              <label className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
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
              <label className="flex items-center justify-between p-2 sm:p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
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
  );
}