import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer,
  Wrench,
  Box,
  Building,
  Home,
  X,
  Info
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { base44 } from "@/api/base44Client";
import EditableTile from "./EditableTile";

// Tile komponenta - stále ju ponechávame pre možné použitie inde
const Tile = ({ selected, onClick, icon: Icon, iconColor, iconSelectedColor, title, subtitle, price, isPriced, isA0, tooltip, selectedBg = "bg-blue-100", selectedBorder = "border-blue-500", selectedRing = "ring-blue-300", hoverBorder = "hover:border-blue-300" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
        selected 
          ? `${selectedBg} border-2 ${selectedBorder} shadow-xl ring-2 ${selectedRing}` 
          : isA0 
            ? "bg-green-50 border-2 border-green-300 hover:border-green-400 hover:shadow-md"
            : `bg-white border-2 border-gray-200 ${hoverBorder} hover:shadow-md`
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <X className="w-4 h-4 text-white stroke-[3]" />
          </div>
        </div>
      )}

      <Icon className={`w-10 h-10 mb-2 ${selected ? iconSelectedColor : iconColor}`} />
      <span className={`font-semibold text-gray-800 text-sm leading-tight`}>{title}</span>
      <span className={`text-xs text-gray-500 mt-1 leading-tight`}>{subtitle}</span>
      <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-xs mt-2`}>{price}</span>

      {showTooltip && tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
          {tooltip}
        </div>
      )}
    </motion.div>
  );
};

export default function KonfiguratorFaza1HrubaStavba({
  dom,
  montaz,
  setMontaz,
  pristavba,
  setPristavba,
  izolaciaTloustka,
  setIzolaciaTloustka,
  zakladyTyp,
  setZakladyTyp,
  onConfigChange,
  isAdmin = false,
  handlePriceChange = null
}) {
  const { t } = useLanguage();

  const getPrice = (key) => {
    if (!dom?.konfigurator_custom_ceny_prosto_house) return 0;
    const customPrice = dom.konfigurator_custom_ceny_prosto_house[key];
    if (customPrice !== undefined && customPrice !== null) return customPrice;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
          <div className="flex items-center gap-3">
            <Hammer className="w-8 h-8 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">{t('phase1')}</h3>
              <p className="text-white/90 text-sm">{t('phase1Subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Montáž */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              {t('assembly')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile
                selected={montaz === "sam"}
                onClick={() => setMontaz("sam")}
                icon={Wrench}
                iconColor="text-gray-400"
                iconSelectedColor="text-orange-600"
                title={t('assemblySelf')}
                subtitle={t('assemblyYourself')}
                price="0 €"
                isPriced={false}
                tooltip={t('assemblySelfFull')}
              />

              <Tile
                selected={montaz === "dodavatel"}
                onClick={() => setMontaz("dodavatel")}
                icon={Wrench}
                iconColor="text-blue-500"
                iconSelectedColor="text-blue-700"
                title={t('assemblySupplier')}
                subtitle={t('assemblyIncluded')}
                price={`+ ${getPrice('montaz_dodavatel').toLocaleString('sk-SK')} €`}
                isPriced={true}
                tooltip={t('assemblySupplierFull')}
              />
            </div>
          </div>

          {/* Prístavba */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              {t('extension')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile
                selected={pristavba === "bez"}
                onClick={() => setPristavba("bez")}
                icon={Box}
                iconColor="text-gray-400"
                iconSelectedColor="text-gray-700"
                title={t('extensionNone')}
                subtitle={t('standardSize')}
                price="0 €"
                isPriced={false}
                selectedBg="bg-gray-100"
                selectedBorder="border-gray-500"
                selectedRing="ring-gray-300"
                hoverBorder="hover:border-gray-300"
                tooltip={t('extensionNone')}
              />

              <Tile
                selected={pristavba === "s_pristavbou"}
                onClick={() => setPristavba("s_pristavbou")}
                icon={Building}
                iconColor="text-indigo-500"
                iconSelectedColor="text-indigo-700"
                title={t('extensionWith')}
                subtitle={t('extensionAdditional')}
                price={`+ ${getPrice('pristavba').toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-indigo-100"
                selectedBorder="border-indigo-500"
                selectedRing="ring-indigo-300"
                hoverBorder="hover:border-indigo-300"
                tooltip={t('extensionWithFull')}
              />
            </div>
          </div>

          {/* Izolácia */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Home className="w-5 h-5 text-green-500" />
              {t('insulation')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile
                selected={izolaciaTloustka === "15cm"}
                onClick={() => setIzolaciaTloustka("15cm")}
                icon={Home}
                iconColor="text-green-400"
                iconSelectedColor="text-green-700"
                title={t('insulation15cm')}
                subtitle={t('standard')}
                price="0 €"
                isPriced={false}
                selectedBg="bg-green-100"
                selectedBorder="border-green-500"
                selectedRing="ring-green-300"
                hoverBorder="hover:border-green-300"
                tooltip={t('insulation15cmFull')}
              />

              <Tile
                selected={izolaciaTloustka === "20cm"}
                onClick={() => setIzolaciaTloustka("20cm")}
                icon={Home}
                iconColor="text-emerald-500"
                iconSelectedColor="text-emerald-700"
                title={t('insulation20cm')}
                subtitle={t('betterInsulation')}
                price={`+ ${getPrice('izolacia_20cm').toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-emerald-100"
                selectedBorder="border-emerald-500"
                selectedRing="ring-emerald-300"
                hoverBorder="hover:border-emerald-300"
                tooltip={t('insulation20cmFull')}
              />

              <Tile
                selected={izolaciaTloustka === "25cm"}
                onClick={() => setIzolaciaTloustka("25cm")}
                icon={Home}
                iconColor="text-teal-500"
                iconSelectedColor="text-teal-700"
                title={t('insulation25cm')}
                subtitle={t('bestInsulation')}
                price={`+ ${getPrice('izolacia_25cm').toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-teal-100"
                selectedBorder="border-teal-500"
                selectedRing="ring-teal-300"
                hoverBorder="hover:border-teal-300"
                tooltip={t('insulation25cmFull')}
              />
            </div>
          </div>

          {/* Základy */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-500" />
              {t('foundations')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Tile
                selected={zakladyTyp === "standard"}
                onClick={() => setZakladyTyp("standard")}
                icon={Box}
                iconColor="text-slate-400"
                iconSelectedColor="text-slate-700"
                title={t('foundationStandard')}
                subtitle={t('includedInPrice')}
                price="0 €"
                isPriced={false}
                selectedBg="bg-slate-100"
                selectedBorder="border-slate-500"
                selectedRing="ring-slate-300"
                hoverBorder="hover:border-slate-300"
                tooltip={t('foundationStandardFull')}
              />

              <Tile
                selected={zakladyTyp === "frostfree"}
                onClick={() => setZakladyTyp("frostfree")}
                icon={Home}
                iconColor="text-cyan-500"
                iconSelectedColor="text-cyan-700"
                title={t('foundationFrostFree')}
                subtitle={t('betterSolution')}
                price={`+ ${getPrice('zaklady_frostfree').toLocaleString('sk-SK')} €`}
                isPriced={true}
                selectedBg="bg-cyan-100"
                selectedBorder="border-cyan-500"
                selectedRing="ring-cyan-300"
                hoverBorder="hover:border-cyan-300"
                tooltip={t('foundationFrostFreeFull')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}