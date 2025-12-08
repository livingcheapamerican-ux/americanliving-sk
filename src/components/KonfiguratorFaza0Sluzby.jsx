import React from "react";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";

const ServiceTile = ({ selected, onClick, icon: Icon, title, description, selectedColor = "blue" }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl cursor-pointer transition-all flex flex-col ${
        selected 
          ? `bg-${selectedColor}-100 border-2 border-${selectedColor}-500 shadow-xl ring-2 ring-${selectedColor}-300` 
          : `bg-white border-2 border-gray-200 hover:border-${selectedColor}-300 hover:shadow-md`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
          selected ? `bg-${selectedColor}-500` : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${selected ? 'text-white' : `text-${selectedColor}-600`}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm sm:text-base mb-1 ${selected ? `text-${selectedColor}-900` : 'text-gray-800'}`}>
            {title}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-${selectedColor}-500 flex items-center justify-center`}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function KonfiguratorFaza0Sluzby({
  predajNehnutelnosti,
  setPredajNehnutelnosti,
  hladaniePozemku,
  setHladaniePozemku,
  financneSluzby,
  setFinancneSluzby
}) {
  const { t } = useLanguage();

  const SectionHeader = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex items-center gap-2 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden"
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
        <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      </motion.div>
      <div className="relative flex-1">
        <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center px-2 sm:px-3 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            >
            FÁZA 0
            </motion.span>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">{t('additionalServices')}</h3>
        <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1">{t('additionalServicesSubtitle')}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-2 border-cyan-300 shadow-lg">
        <SectionHeader />
        <div className="p-3 sm:p-6 bg-gradient-to-b from-cyan-50/50 to-white">
          <div className="space-y-3 sm:space-y-4">
            
            <ServiceTile
              selected={predajNehnutelnosti}
              onClick={() => setPredajNehnutelnosti(!predajNehnutelnosti)}
              icon={Building2}
              title={t('sellPreviousProperty')}
              description={t('sellPreviousPropertyDesc')}
              selectedColor="blue"
            />

            <ServiceTile
              selected={hladaniePozemku}
              onClick={() => setHladaniePozemku(!hladaniePozemku)}
              icon={MapPin}
              title={t('wantLandForHouse')}
              description={t('wantLandForHouseDesc')}
              selectedColor="green"
            />

            <ServiceTile
              selected={financneSluzby}
              onClick={() => setFinancneSluzby(!financneSluzby)}
              icon={TrendingUp}
              title={t('financialServicesLoans')}
              description={t('financialServicesLoansDesc')}
              selectedColor="amber"
            />

          </div>
        </div>
      </Card>
    </motion.div>
  );
}