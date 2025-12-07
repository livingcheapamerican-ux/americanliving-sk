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
import KonfiguratorFaza1HrubaStavba from "../components/KonfiguratorFaza1HrubaStavba.jsx";
import KonfiguratorFlat15 from "../components/KonfiguratorFlat15";
import KonfiguratorFlatDouble from "../components/KonfiguratorFlatDouble";
import KonfiguratorFjord from "../components/KonfiguratorFjord";
import KonfiguratorNord from "../components/KonfiguratorNord";
import KonfiguratorProstoHouse from "../components/KonfiguratorProstoHouse";
import { useLanguage } from "./LanguageContext";

// Krok 0: Výber typu stavby
const StepTypStavby = ({ typStavby, setTypStavby, onNext }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Animovaný banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl"
      >
        {/* Animované pozadie */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-3xl"
          />
        </div>
        
        {/* Obsah */}
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl"
            >
              🏠
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl"
            >
              ✨
            </motion.span>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl sm:text-2xl font-bold text-white mb-2"
          >
            {t('createYourPriceOffer')}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-white/90 text-sm sm:text-base font-medium flex items-center justify-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              ✓
            </motion.span>
            {t('noHiddenFees')}
          </motion.p>
        </div>
      </motion.div>

      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {t('buildingTypeQuestion')}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('buildingTypeDesc')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Rekreačná stavba */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTypStavby("rekreacna")}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
            typStavby === "rekreacna"
              ? "bg-amber-50 border-4 border-amber-500 shadow-xl"
              : "bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <TreePine className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('recreationalBuilding')}</h3>
              <p className="text-amber-600 font-semibold">{t('economicChoice')}</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              {t('cottage')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              {t('yearRoundInsulation')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              {t('noEnergyCertificate')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              {t('lowerPrice')}
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs text-gray-500">
              {t('meetsRecreationalParams')}
            </p>
          </div>
        </motion.div>

        {/* Rodinný dom A0 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTypStavby("rodinny_dom")}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
            typStavby === "rodinny_dom"
              ? "bg-green-50 border-4 border-green-500 shadow-xl"
              : "bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-lg"
          }`}
        >
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('recommended')}
          </Badge>
          <div className="flex items-center gap-4 mb-4 mt-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('familyHouseA0')}</h3>
              <p className="text-green-600 font-semibold">{t('yearRoundLiving')}</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {t('energyCertificateA0')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {t('premiumInsulation250300')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {t('heatPumpRecuperation')}
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {t('permanentResidencePossibility')}
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-xs text-gray-500">
              {t('meetsAllStandardsFamilyHouse')}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!typStavby}
          className={`px-8 py-6 text-lg font-semibold ${
            typStavby 
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
              : "bg-gray-300"
          }`}
        >
          {t('continue')}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

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
  const [typStavby, setTypStavby] = useState("");
  const { t } = useLanguage();

  // Vždy začať od kroku 0 pri mount
  React.useEffect(() => {
    setCurrentStep(0);
    setTypStavby("");
  }, []);

  // Keď sa zmení typ stavby, nastaviť predvolené hodnoty
  const handleTypStavbyChange = (typ) => {
    setTypStavby(typ);
    
    if (typ === "rodinny_dom") {
      setIzolaciaNavysenie("premium");
      setTepelneCerpadlo(true);
      setRekuperacia(true);
      setProjektA0(true);
    } else {
      setIzolaciaNavysenie("standard");
      setTepelneCerpadlo(false);
      setRekuperacia(false);
      setProjektA0(false);
    }
  };

  const steps = [
    { label: t('selectBuildingType'), icon: Home },
    { label: t('phase1'), icon: Package },
    { label: t('phase2'), icon: Hammer },
    { label: t('phase3'), icon: Key },
    { label: t('documentation'), icon: FileText },
  ];

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!typStavby;
      case 1:
        return true;
      case 2:
        return interierFinis !== "ziadne";
      case 3:
        return !!vonkajsiaFasada;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, typStavby, interierFinis, vonkajsiaFasada]);

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
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFullReset = () => {
    setCurrentStep(0);
    setTypStavby("");
    setMontazHolodomu?.("nie");
    setVstupneDvere("ziadne");
    setIzolaciaNavysenie?.("standard");
    setElektroinstalacia(false);
    setVodaKanalizacia(false);
    setSanitaKomplet(false);
    setBojler(false);
    setTepelneCerpadlo(false);
    setRekuperacia(false);
    setZaklady?.("bez");
    setPripojkaSiete(false);
    setInziniering(false);
    setProjektA0(false);
    setInterierFinis("ziadne");
    setVonkajsiaFasada("");
    setPovrchokaOkien(false);
    setVnutornePodlahy(false);
    setPodlahovVykurovanie(false);
    setPergola(false);
    setInterieroveDvere(0);
    setTonovaneSkla(false);
    setDoprava(false);
    setRevizna(true);
    setStresneOkno(0);
    setBocneOknoFixne(0);
    setBocneOknoVyklopne90(0);
    setBocneOknoVyklopne55(0);
    setPredlzenie?.(0);
  };

  // Helper na výber správneho konfigurátora
  const getKonfigurator = (phase) => {
    const commonProps = {
      dom,
      onReset: handleFullReset,
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

    if (useFlat15Prices) {
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
    switch (currentStep) {
      case 0:
        return (
          <StepTypStavby 
            typStavby={typStavby} 
            setTypStavby={handleTypStavbyChange}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <div className="space-y-4">
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
            
            <KonfiguratorFaza1HrubaStavba
              montazHolodomu={montazHolodomu}
              setMontazHolodomu={setMontazHolodomu}
              izolaciaNavysenie={izolaciaNavysenie}
              setIzolaciaNavysenie={setIzolaciaNavysenie}
              zaklady={zaklady}
              setZaklady={setZaklady}
              predlzenie={predlzenie}
              setPredlzenie={setPredlzenie}
              useNordPrices={useNordPrices}
              useFlat15Prices={useFlat15Prices}
              useFlatDoublePrices={useFlatDoublePrices}
              useFlat72Prices={useFlat72Prices}
              useProstoHousePrices={useProstoHousePrices}
              useFjordPrices={useFjordPrices}
            />
          </div>
        );
      case 2:
        return getKonfigurator("holodom");
      case 3:
        return getKonfigurator("kluc");
      case 4:
        return getKonfigurator("docs");
      default:
        return null;
    }
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

      {currentStep > 0 && (
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps}
          typStavby={typStavby}
        />
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

      {currentStep > 0 && (
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6"
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            {t('back')}
          </Button>

          {!isStepValid && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {currentStep === 2 && t('interiorFinish')}
              {currentStep === 3 && t('facadeRequired')}
            </div>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid}
              className={`px-6 ${
                isStepValid
                  ? typStavby === "rodinny_dom"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-amber-600 hover:bg-amber-700"
                  : "bg-gray-300"
              }`}
            >
              {t('nextStep')}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <div className="text-green-600 font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('configurationComplete')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}