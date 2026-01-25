import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, ChevronLeft, Check, Home, Zap, TreePine, Building2,
  Package, Hammer, Key, FileText, AlertTriangle, CheckCircle, Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import KonfiguratorFlat15 from "../components/KonfiguratorFlat15";
import KonfiguratorFlatDouble from "../components/KonfiguratorFlatDouble";
import KonfiguratorFlat72 from "../components/KonfiguratorFlat72";
import KonfiguratorFjord from "../components/KonfiguratorFjord";
import KonfiguratorNord from "../components/KonfiguratorNord";
import KonfiguratorProstoHouse from "../components/KonfiguratorProstoHouse";
import KonfiguratorAFrame from "../components/KonfiguratorAFrame";
import KonfiguratorBarn48 from "../components/KonfiguratorBarn48";
import KonfiguratorBarnDouble from "../components/KonfiguratorBarnDouble";
import KonfiguratorFlatSmall from "../components/KonfiguratorFlatSmall";
import { useLanguage } from "./LanguageContext";
import TypStavbySelector from "./TypStavbySelector";

// Indikátor krokov
const StepIndicator = ({ currentStep, totalSteps, steps, typStavby }) => {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="relative mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center text-center flex-1 ${
                index === 0 ? '' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                isCompleted 
                  ? "bg-green-500 text-white" 
                  : isActive 
                    ? typStavby === "rodinny_dom" ? "bg-green-600 text-white ring-4 ring-green-200" : "bg-amber-500 text-white ring-4 ring-amber-200"
                    : "bg-gray-200 text-gray-500"
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                isActive ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hlavný komponent
export default function KonfiguratorWizard({
        dom,
        useFjordPrices = false,
        useNordPrices = false,
        useFlat15Prices = false,
        useFlatDoublePrices = false,
        useFlat72Prices = false,
        useProstoHousePrices = false,
        useAFramePrices = false,
        useBarn48Prices = false,
        useBarnDoublePrices = false,
        useFlatSmallPrices = false,
  predajNehnutelnosti, setPredajNehnutelnosti,
  hladaniePozemku, setHladaniePozemku,
  financneSluzby, setFinancneSluzby,
  typStavby, setTypStavby,
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
  predlzenie, setPredlzenie,
  vstupneDvere, setVstupneDvere,
  elektroinstalacia, setElektroinstalacia,
  vodaKanalizacia, setVodaKanalizacia,
  sanitaKomplet, setSanitaKomplet,
  bojler, setBojler,
  tepelneCerpadlo, setTepelneCerpadlo,
  rekuperacia, setRekuperacia,
  pripojkaSiete, setPripojkaSiete,
  stresneOkno, setStresneOkno,
  bocneOknoFixne, setBocneOknoFixne,
  bocneOknoVyklopne90, setBocneOknoVyklopne90,
  bocneOknoVyklopne55, setBocneOknoVyklopne55,
  povrchokaOkien, setPovrchokaOkien,
  tonovaneSkla, setTonovaneSkla,
  vonkajsiaFasada, setVonkajsiaFasada,
  interierFinis, setInterierFinis,
  vnutornePodlahy, setVnutornePodlahy,
  podlahovVykurovanie, setPodlahovVykurovanie,
  interieroveDvere, setInterieroveDvere,
  pergola, setPergola,
  inziniering, setInziniering,
  projektA0, setProjektA0,
  revizna, setRevizna,
  doprava, setDoprava
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t, language } = useLanguage();

  // Pri mount nastaviť na krok 0 (zobrazenie všetkého)
  React.useEffect(() => {
    setCurrentStep(0);
  }, []);

  // Keď sa zmení typ stavby, nastaviť predvolené hodnoty
  const handleTypStavbyChange = (typ) => {
    if (setTypStavby) setTypStavby(typ);
    
    if (typ === "rodinny_dom") {
      // Nastaviť iba A0 požiadavky - izoláciu nechať na používateľa
      if (setTepelneCerpadlo) setTepelneCerpadlo(true);
      if (setRekuperacia) setRekuperacia(true);
      if (setProjektA0) setProjektA0(true);
    } else if (typ === "rekreacna") {
      if (setTepelneCerpadlo) setTepelneCerpadlo(false);
      if (setRekuperacia) setRekuperacia(false);
      if (setProjektA0) setProjektA0(false);
    }
  };

  const steps = [
    { label: t('selectBuildingType'), icon: Home },
    { label: t('phase1'), icon: Package },
    { label: t('phase2'), icon: Hammer },
    { label: t('phase3'), icon: Key },
    { label: t('documentation'), icon: FileText },
    { label: t('finale'), icon: CheckCircle },
  ];

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!typStavby;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return useAFramePrices ? true : !!vonkajsiaFasada;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, typStavby, vonkajsiaFasada, useAFramePrices]);

  const missingA0Items = useMemo(() => {
    if (typStavby !== "rodinny_dom") return [];
    const missing = [];
    if (izolaciaNavysenie !== "premium") missing.push("Premium izolácia");
    if (!tepelneCerpadlo) missing.push("Tepelné čerpadlo");
    if (!rekuperacia) missing.push("Rekuperácia");
    if (!projektA0) missing.push("Projektant a certifikácia A0");
    return missing;
  }, [typStavby, izolaciaNavysenie, tepelneCerpadlo, rekuperacia, projektA0]);

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid) {
      setCurrentStep(currentStep + 1);
      // Scroll na začiatok konfigurátorov na mobile
      setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll na začiatok konfigurátorov na mobile
      setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleFullReset = () => {
    setCurrentStep(0);
    if (setTypStavby) setTypStavby("");
    if (setPredajNehnutelnosti) setPredajNehnutelnosti(false);
    if (setHladaniePozemku) setHladaniePozemku(false);
    if (setFinancneSluzby) setFinancneSluzby(false);
    setMontazHolodomu?.("nie");
    if (setVstupneDvere) setVstupneDvere("ziadne");
    setIzolaciaNavysenie?.("standard");
    if (setElektroinstalacia) setElektroinstalacia(false);
    if (setVodaKanalizacia) setVodaKanalizacia(false);
    if (setSanitaKomplet) setSanitaKomplet(false);
    if (setBojler) setBojler(false);
    if (setTepelneCerpadlo) setTepelneCerpadlo(false);
    if (setRekuperacia) setRekuperacia(false);
    setZaklady?.("bez");
    if (setPripojkaSiete) setPripojkaSiete(false);
    if (setInziniering) setInziniering(false);
    if (setProjektA0) setProjektA0(false);
    if (setInterierFinis) setInterierFinis("ziadne");
    if (setVonkajsiaFasada) setVonkajsiaFasada("standard");
    if (setPovrchokaOkien) setPovrchokaOkien(false);
    if (setVnutornePodlahy) setVnutornePodlahy(false);
    if (setPodlahovVykurovanie) setPodlahovVykurovanie(false);
    if (setPergola) setPergola(false);
    if (setInterieroveDvere) setInterieroveDvere(0);
    if (setTonovaneSkla) setTonovaneSkla(false);
    if (setDoprava) setDoprava(false);
    if (setRevizna) setRevizna(true);
    if (setStresneOkno) setStresneOkno(0);
    if (setBocneOknoFixne) setBocneOknoFixne(0);
    if (setBocneOknoVyklopne90) setBocneOknoVyklopne90(0);
    if (setBocneOknoVyklopne55) setBocneOknoVyklopne55(0);
    setPredlzenie?.(0);
  };

  // Helper na výber správneho konfigurátora
  const getKonfigurator = (phase) => {
    const commonProps = {
      dom,
      onReset: handleFullReset,
      predajNehnutelnosti, setPredajNehnutelnosti,
      hladaniePozemku, setHladaniePozemku,
      financneSluzby, setFinancneSluzby,
      typStavby, setTypStavby,
      montazHolodomu, setMontazHolodomu,
      izolaciaNavysenie, setIzolaciaNavysenie,
      zaklady, setZaklady,
      predlzenie, setPredlzenie,
      vstupneDvere, setVstupneDvere,
      elektroinstalacia, setElektroinstalacia,
      vodaKanalizacia, setVodaKanalizacia,
      sanitaKomplet, setSanitaKomplet,
      bojler, setBojler,
      tepelneCerpadlo, setTepelneCerpadlo,
      rekuperacia, setRekuperacia,
      pripojkaSiete, setPripojkaSiete,
      stresneOkno, setStresneOkno,
      bocneOknoFixne, setBocneOknoFixne,
      bocneOknoVyklopne90, setBocneOknoVyklopne90,
      bocneOknoVyklopne55, setBocneOknoVyklopne55,
      povrchokaOkien, setPovrchokaOkien,
      tonovaneSkla, setTonovaneSkla,
      vonkajsiaFasada, setVonkajsiaFasada,
      interierFinis, setInterierFinis,
      vnutornePodlahy, setVnutornePodlahy,
      podlahovVykurovanie, setPodlahovVykurovanie,
      interieroveDvere, setInterieroveDvere,
      pergola, setPergola,
      inziniering, setInziniering,
      projektA0, setProjektA0,
      revizna, setRevizna,
      doprava, setDoprava,
      showOnlySummary: false,
      showOnlyPhase: phase
    };

    if (useFlatSmallPrices) {
      return <KonfiguratorFlatSmall {...commonProps} />;
    } else if (useAFramePrices) {
      return <KonfiguratorAFrame {...commonProps} />;
    } else if (useBarnDoublePrices) {
      return <KonfiguratorBarnDouble {...commonProps} />;
    } else if (useBarn48Prices) {
      return <KonfiguratorBarn48 {...commonProps} />;
    } else if (useFlat15Prices) {
      return <KonfiguratorFlat15 {...commonProps} />;
    } else if (useFlatDoublePrices) {
      return <KonfiguratorFlatDouble {...commonProps} />;
    } else if (useFlat72Prices) {
      return <KonfiguratorFlat72 {...commonProps} />;
    } else if (useNordPrices) {
      return <KonfiguratorNord {...commonProps} />;
    } else if (useFjordPrices) {
      return <KonfiguratorFjord {...commonProps} />;
    } else {
      return <KonfiguratorProstoHouse {...commonProps} />;
    }
  };

  const renderCurrentStep = () => {
    // Vždy zobrazíme všetko - aj výber typu stavby aj všetky fázy naraz
    return (
      <div className="space-y-4">
        {/* Typ stavby - vždy zobrazený */}
        <TypStavbySelector
          key={language}
          typStavby={typStavby} 
          setTypStavby={handleTypStavbyChange}
          predajNehnutelnosti={predajNehnutelnosti}
          setPredajNehnutelnosti={setPredajNehnutelnosti}
          hladaniePozemku={hladaniePozemku}
          setHladaniePozemku={setHladaniePozemku}
          financneSluzby={financneSluzby}
          setFinancneSluzby={setFinancneSluzby}
          onContinue={null}
        />
        
        {/* Info badge ak je vybraný typ stavby */}
        {typStavby && (
          <Card className={`p-4 ${typStavby === "rodinny_dom" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-3">
              <Info className={`w-5 h-5 ${typStavby === "rodinny_dom" ? "text-green-600" : "text-amber-600"}`} />
              <p className={`text-sm font-medium ${typStavby === "rodinny_dom" ? "text-green-800" : "text-amber-800"}`}>
                {typStavby === "rodinny_dom" 
                  ? t('a0Recommendation')
                  : t('meetsRecreationalParams')
                }
              </p>
            </div>
          </Card>
        )}
        
        {/* Všetky fázy pod sebou - vždy zobrazené */}
        <div className="space-y-6">
          {getKonfigurator("hruba")}
          {getKonfigurator("holodom")}
          {getKonfigurator("kluc")}
          {getKonfigurator("docs")}
          {getKonfigurator("finale")}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {currentStep > 0 && (
        <div className={`p-3 rounded-xl flex items-center justify-between ${
          typStavby === "rodinny_dom" 
            ? "bg-gradient-to-r from-green-500 to-emerald-600" 
            : "bg-gradient-to-r from-amber-500 to-orange-500"
        }`}>
          <div className="flex items-center gap-3">
            {typStavby === "rodinny_dom" ? (
              <Building2 className="w-6 h-6 text-white" />
            ) : (
              <TreePine className="w-6 h-6 text-white" />
            )}
            <div>
              <p className="text-white font-bold">
                {typStavby === "rodinny_dom" ? t('familyHouseA0') : t('recreationalBuilding')}
              </p>
              <p className="text-white/80 text-xs">
                {dom?.nazov || 'Flat Double 142m²'}
              </p>
            </div>
          </div>
          {typStavby === "rodinny_dom" && missingA0Items.length === 0 && (
            <Badge className="bg-white text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('meetsA0Short')}
            </Badge>
          )}
          {typStavby === "rodinny_dom" && missingA0Items.length > 0 && (
            <Badge className="bg-red-500 text-white">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {t('missing')} {missingA0Items.length} {t('items')}
            </Badge>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}