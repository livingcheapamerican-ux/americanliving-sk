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

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Backdrop for settings */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 pointer-events-auto"
            onClick={() => setShowSettings(false)}
          />
        )}

        {/* Settings Panel */}
        <AnimatePresence>
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

        {/* Main Banner */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-auto"
        >
          <Card className="max-w-6xl mx-auto bg-white shadow-2xl border-2 border-gray-200">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-orange-600" />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Používame cookies
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Táto webová stránka používa cookies na zlepšenie vášho zážitku z prehliadania, analýzu návštevnosti a prispôsobenie obsahu. Kliknutím na "Prijať všetky" súhlasíte s používaním všetkých cookies.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link
                      to={createPageUrl("ZasadyPouzivaniaCookies")}
                      className="text-primary hover:underline"
                    >
                      Zásady používania cookies
                    </Link>
                    <span className="text-gray-400">•</span>
                    <Link
                      to={createPageUrl("ZasadyOchranyOsobnychUdajov")}
                      className="text-primary hover:underline"
                    >
                      Ochrana osobných údajov
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Nastavenia
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Odmietnuť
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    Prijať všetky
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}