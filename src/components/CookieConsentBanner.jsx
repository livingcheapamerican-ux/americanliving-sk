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

        {/* Main Banner - Large Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
        >
          <div className="w-full max-w-4xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* MOBILE LAYOUT */}
            <div className="md:hidden p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Cookie className="w-10 h-10 text-blue-800" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">
                  🍪 Používame cookies
                </h2>
                <p className="text-base text-blue-100 leading-relaxed mb-4">
                  Táto webová stránka používa cookies na zlepšenie vášho zážitku, analýzu návštevnosti a personalizáciu obsahu. Súhlasom s cookies nám pomáhate poskytovať lepšie služby prispôsobené vašim potrebám.
                </p>
                <p className="text-sm text-blue-200">
                  Viac informácií nájdete v našich{" "}
                  <Link to={createPageUrl("ZasadyPouzivaniaCookies")} className="underline font-semibold">
                    Zásadách cookies
                  </Link>
                  {" "}a{" "}
                  <Link to={createPageUrl("ZasadyOchranyOsobnychUdajov")} className="underline font-semibold">
                    Ochrane osobných údajov
                  </Link>.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAcceptAll}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 shadow-xl"
                >
                  ✓ Prijať všetky cookies
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    Odmietnuť
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    Nastavenia
                  </Button>
                </div>
              </div>
            </div>

            {/* DESKTOP LAYOUT */}
            <div className="hidden md:block p-12">
              <div className="flex gap-8 items-start mb-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Cookie className="w-16 h-16 text-blue-800" />
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-4xl font-black text-white mb-4">
                    🍪 Používame cookies pre najlepší zážitok
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed mb-6">
                    Táto webová stránka používa cookies na zlepšenie vášho zážitku pri prehliadaní, analýzu návštevnosti a personalizáciu obsahu. 
                    Súhlasom s používaním cookies nám pomáhate poskytovať lepšie služby prispôsobené vašim potrebám a záujmom.
                  </p>
                  <p className="text-base text-blue-200 mb-4">
                    Cookies nám umožňujú zapamätať si vaše preferencie, sledovať výkonnosť našej stránky a zobrazovať relevantný obsah. 
                    Vaše súkromie je pre nás dôležité - všetky údaje spracovávame v súlade s GDPR.
                  </p>
                  <div className="flex flex-wrap gap-4 text-base">
                    <Link
                      to={createPageUrl("ZasadyPouzivaniaCookies")}
                      className="text-blue-200 hover:text-white underline font-semibold"
                    >
                      📄 Zásady používania cookies
                    </Link>
                    <span className="text-blue-400">•</span>
                    <Link
                      to={createPageUrl("ZasadyOchranyOsobnychUdajov")}
                      className="text-blue-200 hover:text-white underline font-semibold"
                    >
                      🔒 Ochrana osobných údajov (GDPR)
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAcceptAll}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl py-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  ✓ Prijať všetky cookies
                </Button>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8"
                  >
                    Odmietnuť všetky
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8"
                  >
                    ⚙️ Nastavenia
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}