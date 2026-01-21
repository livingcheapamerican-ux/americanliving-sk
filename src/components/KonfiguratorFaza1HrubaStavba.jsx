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

// Tile komponent - odstraňujem, používame EditableTile

const SectionHeader = ({ icon: Icon, title, subtitle, color, step }) => (
  <div className={`relative flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r ${color}`}>
    <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
    </div>
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
        <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 bg-white/90 rounded-full text-gray-800 text-[9px] sm:text-xs font-bold uppercase tracking-wider">
          {step}
        </span>
      </div>
      <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate drop-shadow-lg">{title}</h3>
      {subtitle && <p className="text-white text-[10px] sm:text-xs mt-0.5 truncate drop-shadow-md">{subtitle}</p>}
    </div>
  </div>
);

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
        <SectionHeader
          icon={Hammer}
          title={t('phase1Title')}
          subtitle={t('phase1Subtitle')}
          color="from-orange-500 to-red-500"
          step={t('step') + " 1"}
        />

        <div className="p-6 space-y-6">
          {/* Montáž */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              {t('assembly')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <EditableTile
                selected={montaz === "sam"}
                onClick={() => setMontaz("sam")}
                title={t('assemblySelf')}
                subtitle={t('assemblyYourself')}
                price="0 €"
                isPriced={false}
                isIncluded={true}
                t={t}
                isAdmin={false}
              />

              <EditableTile
                selected={montaz === "dodavatel"}
                onClick={() => setMontaz("dodavatel")}
                title={t('assemblySupplier')}
                subtitle={t('assemblyIncluded')}
                price={`+ ${getPrice('montaz_dodavatel').toLocaleString('sk-SK')} €`}
                isPriced={true}
                t={t}
                isAdmin={isAdmin}
                priceKey="montaz_dodavatel"
                onPriceChange={handlePriceChange}
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
              <EditableTile
                selected={pristavba === "bez"}
                onClick={() => setPristavba("bez")}
                title={t('extensionNone')}
                subtitle={t('standardSize')}
                price="0 €"
                isPriced={false}
                isIncluded={true}
                t={t}
                isAdmin={false}
              />

              <EditableTile
                selected={pristavba === "s_pristavbou"}
                onClick={() => setPristavba("s_pristavbou")}
                title={t('extensionWith')}
                subtitle={t('extensionAdditional')}
                price={`+ ${getPrice('pristavba').toLocaleString('sk-SK')} €`}
                isPriced={true}
                t={t}
                isAdmin={isAdmin}
                priceKey="pristavba"
                onPriceChange={handlePriceChange}
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
              <EditableTile
                selected={izolaciaTloustka === "15cm"}
                onClick={() => setIzolaciaTloustka("15cm")}
                title={t('insulation15cm')}
                subtitle={t('standard')}
                price="0 €"
                isPriced={false}
                isIncluded={true}
                t={t}
                isAdmin={false}
              />

              <EditableTile
                selected={izolaciaTloustka === "20cm"}
                onClick={() => setIzolaciaTloustka("20cm")}
                title={t('insulation20cm')}
                subtitle={t('betterInsulation')}
                price={`+ ${getPrice('izolacia_20cm').toLocaleString('sk-SK')} €`}
                isPriced={true}
                t={t}
                isAdmin={isAdmin}
                priceKey="izolacia_20cm"
                onPriceChange={handlePriceChange}
              />

              <EditableTile
                selected={izolaciaTloustka === "25cm"}
                onClick={() => setIzolaciaTloustka("25cm")}
                title={t('insulation25cm')}
                subtitle={t('bestInsulation')}
                price={`+ ${getPrice('izolacia_25cm').toLocaleString('sk-SK')} €`}
                isPriced={true}
                t={t}
                isAdmin={isAdmin}
                priceKey="izolacia_25cm"
                onPriceChange={handlePriceChange}
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
              <EditableTile
                selected={zakladyTyp === "standard"}
                onClick={() => setZakladyTyp("standard")}
                title={t('foundationStandard')}
                subtitle={t('includedInPrice')}
                price="0 €"
                isPriced={false}
                isIncluded={true}
                t={t}
                isAdmin={false}
              />

              <EditableTile
                selected={zakladyTyp === "frostfree"}
                onClick={() => setZakladyTyp("frostfree")}
                title={t('foundationFrostFree')}
                subtitle={t('betterSolution')}
                price={`+ ${getPrice('zaklady_frostfree').toLocaleString('sk-SK')} €`}
                isPriced={true}
                t={t}
                isAdmin={isAdmin}
                priceKey="zaklady_frostfree"
                onPriceChange={handlePriceChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}