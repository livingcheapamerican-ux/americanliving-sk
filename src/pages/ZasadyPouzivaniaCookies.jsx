import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Cookie, Info } from "lucide-react";

export default function ZasadyPouzivaniaCookies() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-orange-900 to-orange-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <Cookie className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Zásady používania cookies
              </h1>
            </div>
            <p className="text-xl text-white/90">
              Ako používame súbory cookies na našej webovej stránke
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 shadow-lg">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-primary mb-4">Čo jsou cookies?</h2>
            <p className="text-gray-700">
              Cookies sú malé textové súbory, ktoré sa ukladajú do vášho zariadenia (počítač, tablet, smartphone) pri návšteve webových stránok. Umožňujú webovej stránke zapamätať si vaše akcie a preferencie (ako napríklad prihlasovacie údaje, jazyk, veľkosť písma a iné nastavenia zobrazenia) po určitú dobu, takže ich nemusíte znovu zadávať pri každej návšteve stránky alebo pri prechádzaní z jednej stránky na druhú.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Ako používame cookies?</h2>
            <p className="text-gray-700 mb-4">
              Naša webová stránka používa cookies na:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Zabezpečenie základnej funkcionality webovej stránky</li>
              <li>Zapamätanie si vašich preferencií (jazyk, súhlas s cookies)</li>
              <li>Analýzu návštevnosti a správania používateľov na stránke</li>
              <li>Zlepšenie užívateľskej skúsenosti</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Typy cookies, ktoré používame</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Nevyhnutné cookies</h3>
            <p className="text-gray-700">
              Tieto cookies sú nevyhnutné pre správne fungovanie webovej stránky. Bez týchto cookies by stránka nefungovala správne. Zahŕňajú napríklad cookies pre správu súhlasu s cookies.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Preferenčné cookies</h3>
            <p className="text-gray-700">
              Tieto cookies umožňujú webovej stránke zapamätať si informácie, ktoré menia vzhľad alebo správanie stránky, ako je váš preferovaný jazyk alebo región, v ktorom sa nachádzate.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Analytické cookies</h3>
            <p className="text-gray-700">
              Tieto cookies nám pomáhajú pochopiť, ako návštevníci interagujú s webovou stránkou zbieraním a hlásením informácií anonymne. Pomáhajú nám zlepšovať fungovanie stránky.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Marketingové cookies</h3>
            <p className="text-gray-700">
              Tieto cookies sa používajú na sledovanie návštevníkov naprieč webovými stránkami. Zámerom je zobrazovať reklamy, ktoré sú relevantné a zaujímavé pre jednotlivého používateľa.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Správa cookies</h2>
            <p className="text-gray-700 mb-3">
              Máte právo rozhodnúť sa, či akceptujete alebo odmietate cookies. Svoje preferencie môžete nastaviť pomocou nástroja na správu súhlasu s cookies, ktorý sa zobrazí pri prvej návšteve našej stránky.
            </p>
            <p className="text-gray-700 mb-3">
              Môžete tiež nastaviť alebo zmeniť nastavenie prehliadača, aby akceptoval alebo odmietol cookies. Ak sa rozhodnete odmietnuť cookies, môžete stále používať našu webovú stránku, hoci váš prístup k niektorým funkciám a oblastiam môže byť obmedzený.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Ako odstrániť cookies</h2>
            <p className="text-gray-700">
              Väčšina webových prehliadačov vám umožňuje odstrániť cookies cez nastavenia. Tu sú odkazy na návody pre najpopulárnejšie prehliadače:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3 ml-4">
              <li><strong>Google Chrome:</strong> Nastavenia → Súkromie a zabezpečenie → Vymazať údaje prehliadania</li>
              <li><strong>Mozilla Firefox:</strong> Možnosti → Súkromie a zabezpečenie → Cookies a údaje stránok</li>
              <li><strong>Safari:</strong> Predvoľby → Súkromie → Spravovať údaje webových stránok</li>
              <li><strong>Microsoft Edge:</strong> Nastavenia → Súkromie, vyhľadávanie a služby → Vymazať údaje prehliadania</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Zmeny v zásadách cookies</h2>
            <p className="text-gray-700">
              Môžeme príležitostne aktualizovať tieto zásady používania cookies, aby odrážali zmeny v technológiách alebo právnych požiadavkách. Odporúčame vám pravidelne kontrolovať túto stránku, aby ste boli informovaní o tom, ako používame cookies.
            </p>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Potrebujete viac informácií?</h3>
                  <p className="text-blue-800">
                    Ak máte akékoľvek otázky týkajúce sa našich zásad používania cookies, neváhajte nás kontaktovať na <a href="mailto:info@americanliving.sk" className="underline font-medium">info@americanliving.sk</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}