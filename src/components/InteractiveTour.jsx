import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, Home, Grid3x3, Sparkles, Info, Phone, Cookie, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "./LanguageContext";

const TOUR_COMPLETED_KEY = "tour_completed";
const COOKIE_CONSENT_KEY = "cookie_consent";

export default function InteractiveTour() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      title: "👋 Vitajte na American Living!",
      description: "Vítame vás na našej stránke! Dovoľte nám vám ukázať, ako sa tu rýchlo zorientovať.",
      icon: Home,
      highlight: null,
      position: "center"
    },
    {
      title: "🏠 Katalóg domov",
      description: "Prezrite si našu širokú ponuku modulárnych, montovaných a mobilných domov. Filtrujte podľa výrobcu, typu, rozlohy a ceny.",
      icon: Grid3x3,
      highlight: "nav-katalog",
      position: "top-right"
    },
    {
      title: "✨ AI Odporúčania",
      description: "Neviem, ktorý dom si vybrať? Náš AI asistent vám pomôže nájsť ideálny dom na základe vašich požiadaviek.",
      icon: Sparkles,
      highlight: "nav-ai",
      position: "top-right"
    },
    {
      title: "ℹ️ O nás",
      description: "Zistite viac o našej spoločnosti, našich hodnotách a viac ako 700 realizovaných projektoch od roku 2008.",
      icon: Info,
      highlight: "nav-onas",
      position: "top-right"
    },
    {
      title: "📞 Kontakt",
      description: "Potrebujete poradiť? Kontaktujte nás - pomôžeme vám s výberom domu, financovaním aj realizáciou.",
      icon: Phone,
      highlight: "nav-kontakt",
      position: "top-right"
    },
    {
      title: "🎉 Hotovo!",
      description: "Teraz ste pripravení objavovať naše domy. Môžete začať prehliadaním katalógu alebo sa dozvedieť viac o našich službách.",
      icon: Home,
      highlight: null,
      position: "center",
      showLinks: true
    }
  ];

  useEffect(() => {
    // Check if tour was already completed
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (tourCompleted) return;

    // Skip tour on mobile devices
    if (window.innerWidth < 1024) return;

    // Check if cookies were accepted
    const cookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (cookieConsent) {
      // Show tour after a short delay
      setTimeout(() => setShowTour(true), 2000);
    } else {
      // Listen for cookie consent
      const checkConsent = setInterval(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consent) {
          clearInterval(checkConsent);
          setTimeout(() => setShowTour(true), 1000);
        }
      }, 500);

      return () => clearInterval(checkConsent);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setShowTour(false);
  };

  const getHighlightPosition = () => {
    const step = steps[currentStep];
    if (!step.highlight) return null;

    const element = document.querySelector(`[data-tour="${step.highlight}"]`);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  };

  const highlightPos = getHighlightPosition();
  const step = steps[currentStep];

  if (!showTour) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Dark Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 pointer-events-auto"
          onClick={handleSkip}
        />

        {/* Spotlight on highlighted element */}
        {highlightPos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              top: highlightPos.top - 8,
              left: highlightPos.left - 8,
              width: highlightPos.width + 16,
              height: highlightPos.height + 16,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.5)",
              borderRadius: "12px",
              border: "3px solid #EF4444",
              zIndex: 101
            }}
          />
        )}

        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`absolute pointer-events-auto ${
            step.position === "center" 
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
              : highlightPos
                ? `left-1/2 -translate-x-1/2`
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }`}
          style={
            step.position === "top-right" && highlightPos
              ? { top: highlightPos.top + highlightPos.height + 20 }
              : {}
          }
        >
          <Card className="w-[90vw] max-w-lg bg-white shadow-2xl p-6 relative">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>

            {step.showLinks && (
              <div className="grid grid-cols-2 gap-3 mb-4 mt-6">
                <Link to={createPageUrl("ZasadyPouzivaniaCookies")} onClick={handleComplete}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Cookie className="w-4 h-4 mr-2" />
                    Zásady cookies
                  </Button>
                </Link>
                <Link to={createPageUrl("ZasadyOchranyOsobnychUdajov")} onClick={handleComplete}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    GDPR
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-8 bg-red-600"
                        : index < currentStep
                        ? "w-2 bg-red-400"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Späť
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  {currentStep === steps.length - 1 ? "Dokončiť" : "Ďalej"}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Preskočiť sprievodcu
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}