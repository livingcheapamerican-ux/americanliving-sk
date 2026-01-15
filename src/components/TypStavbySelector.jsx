import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, CheckCircle, TreePine, Sparkles, Building2, MapPin, TrendingUp, Square, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";

export default function TypStavbySelector({ 
  typStavby, setTypStavby, onContinue,
  predajNehnutelnosti, setPredajNehnutelnosti,
  hladaniePozemku, setHladaniePozemku,
  financneSluzby, setFinancneSluzby
}) {
  const { t, language } = useLanguage();

  return (
    <div key={language} className="min-h-[70vh] flex items-center justify-center px-2 sm:px-4 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="w-10 h-10" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {t('createYourPriceOffer')}
            </h2>
            <div className="flex items-center justify-center gap-2 text-purple-100">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('noHiddenFees')}</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {t('buildingTypeQuestion')}
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            {t('buildingTypeDesc')}
          </p>
          
          {/* Výrazný CTA indikátor */}
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 max-w-lg mx-auto shadow-lg"
            animate={{ 
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 10px 25px rgba(59, 130, 246, 0.3)",
                "0 15px 35px rgba(139, 92, 246, 0.4)",
                "0 10px 25px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👇
              </motion.div>
              <p className="text-sm sm:text-base font-bold">
                {t('buildingTypeQuestion')}
              </p>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >
                👇
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Karty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          {/* Rekreačná stavba */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => setTypStavby("rekreacna")}
            className="cursor-pointer w-full relative"
          >
            {/* Animovaný border efekt */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(251, 191, 36, 0)",
                  "0 0 0 8px rgba(251, 191, 36, 0.1)",
                  "0 0 0 0 rgba(251, 191, 36, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <Card className={`p-3 sm:p-6 h-full transition-all border-2 w-full relative ${
              typStavby === "rekreacna" 
                ? "border-amber-500 bg-amber-50 shadow-xl ring-2 ring-amber-300" 
                : "border-gray-200 hover:border-amber-300 hover:shadow-lg"
            }`}>
              {/* "Kliknite tu" badge */}
              {!typStavby && (
                <motion.div
                  className="absolute -top-3 -right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {t('clickHere')} 👆
                </motion.div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">
                    {t('recreationalBuilding')}
                  </h4>
                  <Badge className="bg-amber-500 text-white text-xs">
                    {t('economicChoice')}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{t('cottage')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{t('yearRoundInsulation')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{t('noEnergyCertificate')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{t('lowerPrice')}</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-amber-200">
                <p className="text-xs text-gray-500 italic">
                  {t('meetsRecreationalParams')}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Rodinný dom A0 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => setTypStavby("rodinny_dom")}
            className="cursor-pointer w-full relative"
          >
            {/* Animovaný border efekt */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0)",
                  "0 0 0 8px rgba(34, 197, 94, 0.1)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            
            <Card className={`p-3 sm:p-6 h-full transition-all border-2 w-full relative ${
              typStavby === "rodinny_dom" 
                ? "border-green-500 bg-green-50 shadow-xl ring-2 ring-green-300" 
                : "border-gray-200 hover:border-green-300 hover:shadow-lg"
            }`}>
              {/* "Kliknite tu" badge */}
              {!typStavby && (
                <motion.div
                  className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [5, -5, 5]
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                >
                  {t('clickHere')} 👆
                </motion.div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">
                    {t('familyHouseA0')}
                  </h4>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                    ⚡ {t('recommended')}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('yearRoundLiving')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('energyCertificateA0')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('premiumInsulation250300')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('heatPumpRecuperation')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('permanentResidencePossibility')}</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-green-200">
                <p className="text-xs text-gray-500 italic">
                  {t('meetsAllStandardsFamilyHouse')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Doplnkové služby */}
        {typStavby && (
          <motion.div
            key={`services-${language}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6 border-2 border-cyan-300 shadow-lg bg-gradient-to-b from-cyan-50/50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-cyan-600" />
                <h4 className="text-lg font-bold text-gray-800">{t('additionalServices')}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">{t('selectAdditionalServices')}</p>
              
              <div key={`services-cards-${language}`} className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPredajNehnutelnosti?.(!predajNehnutelnosti)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    predajNehnutelnosti 
                      ? 'bg-blue-100 border-blue-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {predajNehnutelnosti ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{t('sellPreviousProperty')}</p>
                      <p className="text-xs text-gray-600 mt-1">{t('sellPreviousPropertyDesc')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setHladaniePozemku?.(!hladaniePozemku)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    hladaniePozemku 
                      ? 'bg-green-100 border-green-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {hladaniePozemku ? (
                      <CheckSquare className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{t('wantLandForHouse')}</p>
                      <p className="text-xs text-gray-600 mt-1">{t('wantLandForHouseDesc')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setFinancneSluzby?.(!financneSluzby)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    financneSluzby 
                      ? 'bg-amber-100 border-amber-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {financneSluzby ? (
                      <CheckSquare className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{t('financialServicesLoans')}</p>
                      <p className="text-xs text-gray-600 mt-1">{t('financialServicesLoansDesc')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>

            <div className="text-center mt-6">
              <button
                onClick={onContinue}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {t('continue')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}