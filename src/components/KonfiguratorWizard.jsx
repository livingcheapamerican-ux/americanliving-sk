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
import KonfiguratorFaza1HrubaStavba from "./KonfiguratorFaza1HrubaStavba";
import KonfiguratorFlatDoubleInline from "./KonfiguratorFlatDoubleInline";

// Krok 0: Výber typu stavby
const StepTypStavby = ({ typStavby, setTypStavby, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Aký typ stavby plánujete?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Vyberte si, či chcete rekreačnú stavbu (chata, záhradný domček) alebo rodinný dom s energetickým certifikátom A0 a možnosťou trvalého pobytu.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Rekreačná stavba */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTypStavby("rekreacna")}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all border-3 ${
            typStavby === "rekreacna"
              ? "bg-amber-50 border-amber-500 shadow-xl ring-4 ring-amber-200"
              : "bg-white border-gray-200 hover:border-amber-300 hover:shadow-lg"
          }`}
        >
          {typStavby === "rekreacna" && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <TreePine className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Rekreačná stavba</h3>
              <p className="text-amber-600 font-semibold">Ekonomická voľba</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              Chata, záhradný domček
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              Celoročná izolácia 150/200mm
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              Bez energetického certifikátu
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500" />
              Nižšia cena
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs text-gray-500">
              Spĺňa parametre rekreačnej stavby
            </p>
          </div>
        </motion.div>

        {/* Rodinný dom A0 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTypStavby("rodinny_dom")}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all border-3 ${
            typStavby === "rodinny_dom"
              ? "bg-green-50 border-green-500 shadow-xl ring-4 ring-green-200"
              : "bg-white border-gray-200 hover:border-green-300 hover:shadow-lg"
          }`}
        >
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600">
            <Sparkles className="w-3 h-3 mr-1" />
            Odporúčané
          </Badge>
          {typStavby === "rodinny_dom" && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-4 mt-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Rodinný dom A0</h3>
              <p className="text-green-600 font-semibold">Celoročné bývanie</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Energetický certifikát A0
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Premium izolácia 250/300mm
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Tepelné čerpadlo + Rekuperácia
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Možnosť trvalého pobytu
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-xs text-gray-500">
              Spĺňa všetky normy pre rodinný dom
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
          Pokračovať
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
  // Všetky props pre konfigurátor
  montazHolodomu, setMontazHolodomu,
  izolaciaNavysenie, setIzolaciaNavysenie,
  zaklady, setZaklady,
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

  // Keď sa zmení typ stavby, nastaviť predvolené hodnoty
  const handleTypStavbyChange = (typ) => {
    setTypStavby(typ);
    
    if (typ === "rodinny_dom") {
      // Pre rodinný dom A0 - nastaviť povinné položky
      setIzolaciaNavysenie("premium");
      setTepelneCerpadlo(true);
      setRekuperacia(true);
      setProjektA0(true);
    } else {
      // Pre rekreačnú stavbu - štandardné hodnoty
      setIzolaciaNavysenie("standard");
      setTepelneCerpadlo(false);
      setRekuperacia(false);
      setProjektA0(false);
    }
  };

  const steps = [
    { label: "Typ stavby", icon: Home },
    { label: "Hrubá stavba", icon: Package },
    { label: "Holodom", icon: Hammer },
    { label: "Na kľúč", icon: Key },
    { label: "Dokumenty", icon: FileText },
  ];

  // Validácia krokov
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!typStavby;
      case 1:
        // Hrubá stavba - vždy platné
        return true;
      case 2:
        // Holodom - interiér finiš musí byť vybraný
        return interierFinis !== "ziadne";
      case 3:
        // Dom na kľúč - fasáda musí byť vybraná
        return !!vonkajsiaFasada;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, typStavby, interierFinis, vonkajsiaFasada]);

  // Chýbajúce položky pre A0
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

  // Renderovanie aktuálneho kroku
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
            {/* Info box pre typ stavby */}
            <Card className={`p-4 ${typStavby === "rodinny_dom" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-3">
                <Info className={`w-5 h-5 ${typStavby === "rodinny_dom" ? "text-green-600" : "text-amber-600"}`} />
                <p className={`text-sm font-medium ${typStavby === "rodinny_dom" ? "text-green-800" : "text-amber-800"}`}>
                  {typStavby === "rodinny_dom" 
                    ? "Pre rodinný dom A0 je automaticky vybraná premium izolácia. Môžete ju zmeniť, ale neodporúčame to."
                    : "Pre rekreačnú stavbu je nastavená štandardná izolácia. Môžete si vybrať vyššiu úroveň."
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
            />
          </div>
        );
      case 2:
        return (
          <KonfiguratorFlatDoubleInline
            dom={dom}
            montazHolodomu={montazHolodomu}
            setMontazHolodomu={setMontazHolodomu}
            izolaciaNavysenie={izolaciaNavysenie}
            setIzolaciaNavysenie={setIzolaciaNavysenie}
            zaklady={zaklady}
            setZaklady={setZaklady}
            vstupneDvere={vstupneDvere}
            setVstupneDvere={setVstupneDvere}
            elektroinstalacia={elektroinstalacia}
            setElektroinstalacia={setElektroinstalacia}
            vodaKanalizacia={vodaKanalizacia}
            setVodaKanalizacia={setVodaKanalizacia}
            sanitaKomplet={sanitaKomplet}
            setSanitaKomplet={setSanitaKomplet}
            bojler={bojler}
            setBojler={setBojler}
            tepelneCerpadlo={tepelneCerpadlo}
            setTepelneCerpadlo={setTepelneCerpadlo}
            rekuperacia={rekuperacia}
            setRekuperacia={setRekuperacia}
            pripojkaSiete={pripojkaSiete}
            setPripojkaSiete={setPripojkaSiete}
            stresneOkno={stresneOkno}
            setStresneOkno={setStresneOkno}
            bocneOknoFixne={bocneOknoFixne}
            setBocneOknoFixne={setBocneOknoFixne}
            bocneOknoVyklopne90={bocneOknoVyklopne90}
            setBocneOknoVyklopne90={setBocneOknoVyklopne90}
            bocneOknoVyklopne55={bocneOknoVyklopne55}
            setBocneOknoVyklopne55={setBocneOknoVyklopne55}
            povrchokaOkien={povrchokaOkien}
            setPovrchokaOkien={setPovrchokaOkien}
            tonovaneSkla={tonovaneSkla}
            setTonovaneSkla={setTonovaneSkla}
            vonkajsiaFasada={vonkajsiaFasada}
            setVonkajsiaFasada={setVonkajsiaFasada}
            interierFinis={interierFinis}
            setInterierFinis={setInterierFinis}
            vnutornePodlahy={vnutornePodlahy}
            setVnutornePodlahy={setVnutornePodlahy}
            podlahovVykurovanie={podlahovVykurovanie}
            setPodlahovVykurovanie={setPodlahovVykurovanie}
            interieroveDvere={interieroveDvere}
            setInterieroveDvere={setInterieroveDvere}
            pergola={pergola}
            setPergola={setPergola}
            inziniering={inziniering}
            setInziniering={setInziniering}
            projektA0={projektA0}
            setProjektA0={setProjektA0}
            revizna={revizna}
            setRevizna={setRevizna}
            doprava={doprava}
            setDoprava={setDoprava}
            showOnlySummary={false}
            showOnlyPhase="holodom"
            typStavby={typStavby}
          />
        );
      case 3:
        return (
          <KonfiguratorFlatDoubleInline
            dom={dom}
            montazHolodomu={montazHolodomu}
            setMontazHolodomu={setMontazHolodomu}
            izolaciaNavysenie={izolaciaNavysenie}
            setIzolaciaNavysenie={setIzolaciaNavysenie}
            zaklady={zaklady}
            setZaklady={setZaklady}
            vstupneDvere={vstupneDvere}
            setVstupneDvere={setVstupneDvere}
            elektroinstalacia={elektroinstalacia}
            setElektroinstalacia={setElektroinstalacia}
            vodaKanalizacia={vodaKanalizacia}
            setVodaKanalizacia={setVodaKanalizacia}
            sanitaKomplet={sanitaKomplet}
            setSanitaKomplet={setSanitaKomplet}
            bojler={bojler}
            setBojler={setBojler}
            tepelneCerpadlo={tepelneCerpadlo}
            setTepelneCerpadlo={setTepelneCerpadlo}
            rekuperacia={rekuperacia}
            setRekuperacia={setRekuperacia}
            pripojkaSiete={pripojkaSiete}
            setPripojkaSiete={setPripojkaSiete}
            stresneOkno={stresneOkno}
            setStresneOkno={setStresneOkno}
            bocneOknoFixne={bocneOknoFixne}
            setBocneOknoFixne={setBocneOknoFixne}
            bocneOknoVyklopne90={bocneOknoVyklopne90}
            setBocneOknoVyklopne90={setBocneOknoVyklopne90}
            bocneOknoVyklopne55={bocneOknoVyklopne55}
            setBocneOknoVyklopne55={setBocneOknoVyklopne55}
            povrchokaOkien={povrchokaOkien}
            setPovrchokaOkien={setPovrchokaOkien}
            tonovaneSkla={tonovaneSkla}
            setTonovaneSkla={setTonovaneSkla}
            vonkajsiaFasada={vonkajsiaFasada}
            setVonkajsiaFasada={setVonkajsiaFasada}
            interierFinis={interierFinis}
            setInterierFinis={setInterierFinis}
            vnutornePodlahy={vnutornePodlahy}
            setVnutornePodlahy={setVnutornePodlahy}
            podlahovVykurovanie={podlahovVykurovanie}
            setPodlahovVykurovanie={setPodlahovVykurovanie}
            interieroveDvere={interieroveDvere}
            setInterieroveDvere={setInterieroveDvere}
            pergola={pergola}
            setPergola={setPergola}
            inziniering={inziniering}
            setInziniering={setInziniering}
            projektA0={projektA0}
            setProjektA0={setProjektA0}
            revizna={revizna}
            setRevizna={setRevizna}
            doprava={doprava}
            setDoprava={setDoprava}
            showOnlySummary={false}
            showOnlyPhase="kluc"
            typStavby={typStavby}
          />
        );
      case 4:
        return (
          <KonfiguratorFlatDoubleInline
            dom={dom}
            montazHolodomu={montazHolodomu}
            setMontazHolodomu={setMontazHolodomu}
            izolaciaNavysenie={izolaciaNavysenie}
            setIzolaciaNavysenie={setIzolaciaNavysenie}
            zaklady={zaklady}
            setZaklady={setZaklady}
            vstupneDvere={vstupneDvere}
            setVstupneDvere={setVstupneDvere}
            elektroinstalacia={elektroinstalacia}
            setElektroinstalacia={setElektroinstalacia}
            vodaKanalizacia={vodaKanalizacia}
            setVodaKanalizacia={setVodaKanalizacia}
            sanitaKomplet={sanitaKomplet}
            setSanitaKomplet={setSanitaKomplet}
            bojler={bojler}
            setBojler={setBojler}
            tepelneCerpadlo={tepelneCerpadlo}
            setTepelneCerpadlo={setTepelneCerpadlo}
            rekuperacia={rekuperacia}
            setRekuperacia={setRekuperacia}
            pripojkaSiete={pripojkaSiete}
            setPripojkaSiete={setPripojkaSiete}
            stresneOkno={stresneOkno}
            setStresneOkno={setStresneOkno}
            bocneOknoFixne={bocneOknoFixne}
            setBocneOknoFixne={setBocneOknoFixne}
            bocneOknoVyklopne90={bocneOknoVyklopne90}
            setBocneOknoVyklopne90={setBocneOknoVyklopne90}
            bocneOknoVyklopne55={bocneOknoVyklopne55}
            setBocneOknoVyklopne55={setBocneOknoVyklopne55}
            povrchokaOkien={povrchokaOkien}
            setPovrchokaOkien={setPovrchokaOkien}
            tonovaneSkla={tonovaneSkla}
            setTonovaneSkla={setTonovaneSkla}
            vonkajsiaFasada={vonkajsiaFasada}
            setVonkajsiaFasada={setVonkajsiaFasada}
            interierFinis={interierFinis}
            setInterierFinis={setInterierFinis}
            vnutornePodlahy={vnutornePodlahy}
            setVnutornePodlahy={setVnutornePodlahy}
            podlahovVykurovanie={podlahovVykurovanie}
            setPodlahovVykurovanie={setPodlahovVykurovanie}
            interieroveDvere={interieroveDvere}
            setInterieroveDvere={setInterieroveDvere}
            pergola={pergola}
            setPergola={setPergola}
            inziniering={inziniering}
            setInziniering={setInziniering}
            projektA0={projektA0}
            setProjektA0={setProjektA0}
            revizna={revizna}
            setRevizna={setRevizna}
            doprava={doprava}
            setDoprava={setDoprava}
            showOnlySummary={false}
            showOnlyPhase="docs"
            typStavby={typStavby}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header s informáciou o type stavby */}
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
                {typStavby === "rodinny_dom" ? "Rodinný dom A0" : "Rekreačná stavba"}
              </p>
              <p className="text-white/80 text-xs">
                Flat Double 142m²
              </p>
            </div>
          </div>
          {typStavby === "rodinny_dom" && missingA0Items.length === 0 && (
            <Badge className="bg-white text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Spĺňa A0
            </Badge>
          )}
          {typStavby === "rodinny_dom" && missingA0Items.length > 0 && (
            <Badge className="bg-red-500 text-white">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Chýba {missingA0Items.length} položiek
            </Badge>
          )}
        </div>
      )}

      {/* Step indicator */}
      {currentStep > 0 && (
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps}
          typStavby={typStavby}
        />
      )}

      {/* Obsah kroku */}
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

      {/* Navigačné tlačidlá */}
      {currentStep > 0 && (
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6"
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Späť
          </Button>

          {/* Validačná správa */}
          {!isStepValid && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {currentStep === 2 && "Vyberte interiér finiš"}
              {currentStep === 3 && "Vyberte typ fasády"}
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
              Ďalší krok
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <div className="text-green-600 font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Konfigurácia dokončená
            </div>
          )}
        </div>
      )}
    </div>
  );
}