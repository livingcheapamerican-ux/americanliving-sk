import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cookie, X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COOKIE_CONSENT_KEY = "cookie_consent";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const saveConsent = (consentData) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...consentData,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence mode="wait">
      {showBanner && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Backdrop for settings */}
          <AnimatePresence mode="wait">
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 pointer-events-auto"
                onClick={() => setShowSettings(false)}
              />
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence mode="wait">
            {showSettings && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute right-0 top-0 bottom-0 w-full md:w-[500px] pointer-events-auto"
              >
                <Card className="h-full overflow-y-auto bg-white shadow-2xl rounded-none md:rounded-l-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Cookie className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-gray-900">Nastavenia cookies</h2>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Môžete si upraviť svoje preferencie týkajúce sa používania cookies na našej stránke. Viac informácií nájdete v našich{" "}
                    <Link to={createPageUrl("ZasadyPouzivaniaCookies")} className="text-primary hover:underline">
                      Zásadách používania cookies
                    </Link>.
                  </p>

                  <div className="space-y-6">
                    {/* Necessary Cookies */}
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Nevyhnutné cookies</h3>
                        <Switch checked={true} disabled />
                      </div>
                      <p className="text-sm text-gray-600">
                        Tieto cookies sú nevyhnutné pre správne fungovanie webovej stránky a nemožno ich vypnúť.
                      </p>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Analytické cookies</h3>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={() => togglePreference('analytics')}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Pomáhajú nám pochopiť, ako návštevníci interagujú s webovou stránkou zbieraním anonymných informácií.
                      </p>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Marketingové cookies</h3>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={() => togglePreference('marketing')}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Používajú sa na zobrazovanie relevantných reklám na základe vašich záujmov.
                      </p>
                    </div>

                    {/* Preference Cookies */}
                    <div className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Preferenčné cookies</h3>
                        <Switch
                          checked={preferences.preferences}
                          onCheckedChange={() => togglePreference('preferences')}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Umožňujú webovej stránke zapamätať si vaše preferencie ako jazyk alebo región.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <Button
                      onClick={handleSavePreferences}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Uložiť nastavenia
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      variant="outline"
                      className="w-full"
                    >
                      Prijať všetky
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Banner - Oversized & Eye-catching */}
        {!showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 pointer-events-auto pb-safe"
          >
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-2xl">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 md:py-12">
              <div className="flex flex-col md:flex-row gap-3 md:gap-8 items-stretch md:items-center">
                {/* Main accept button - FIRST on mobile and desktop */}
                <div className="order-1 w-full md:w-auto md:min-w-[280px]">
                  <Button
                    onClick={handleAcceptAll}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base md:text-lg py-4 md:py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    ✓ Prijať všetky cookies
                  </Button>
                </div>

                {/* Cookie icon - hidden on mobile, shown on desktop */}
                <div className="flex-shrink-0 hidden md:block order-2">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Cookie className="w-10 h-10 md:w-12 md:h-12 text-blue-800" />
                  </div>
                </div>

                {/* Text content - SECOND on mobile, middle on desktop */}
                <div className="flex-grow text-center md:text-left order-2 md:order-3">
                  <h3 className="text-base md:text-3xl font-bold text-white mb-1 md:mb-3">
                    🍪 Používame cookies pre najlepší zážitok
                  </h3>
                  <p className="text-xs md:text-lg text-blue-100 mb-2 md:mb-4 leading-relaxed">
                    Pomôžte nám zlepšovať naše služby a získajte personalizovaný obsah.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs md:text-sm justify-center md:justify-start">
                    <Link
                      to={createPageUrl("ZasadyPouzivaniaCookies")}
                      className="text-blue-200 hover:text-white underline"
                    >
                      Zásady cookies
                    </Link>
                    <span className="text-blue-400">•</span>
                    <Link
                      to={createPageUrl("ZasadyOchranyOsobnychUdajov")}
                      className="text-blue-200 hover:text-white underline"
                    >
                      GDPR
                    </Link>
                  </div>
                </div>

                {/* Secondary options - THIRD on mobile, last on desktop */}
                <div className="flex gap-3 justify-center text-xs md:text-sm order-3 md:order-4 md:min-w-[200px]">
                  <button
                    onClick={handleRejectAll}
                    className="text-blue-300 hover:text-white underline py-2 px-3"
                  >
                    Odmietnuť
                  </button>
                  <span className="text-blue-400">|</span>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-blue-300 hover:text-white underline py-2 px-3"
                  >
                    Nastavenia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}