import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Euro, Home, Phone, ArrowRight, Gift, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function DotaciaAmericana() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                  <Gift className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                DOTÁCIA AMERICANA
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-lg mb-8">
                Špeciálny program dotácií pre rodinné domy aj Airbnb apartmány
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Kontakt")}>
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-2xl w-full sm:w-auto">
                    Chcem vedieť viac
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:+421905138124">
                  <Button size="lg" variant="outline" className="bg-transparent border-3 border-white text-white hover:bg-white hover:text-blue-700 font-bold px-10 py-6 text-lg shadow-2xl w-full sm:w-auto">
                    <Phone className="mr-2 w-5 h-5" />
                    +421 905 138 124
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hlavné výhody */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              Čo získate?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Euro className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Finančná podpora
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Pomôžeme vám získať finančnú podporu na ekologické a energeticky efektívne riešenia pre váš rodinný dom.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Home className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Airbnb apartmány
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Dotácia platí aj pre Airbnb apartmány. Investujte do nehnuteľnosti, ktorá vám prinesie pravidelný príjem.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full bg-gradient-to-br from-green-50 to-white border-2 border-green-200 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Reklama ZDARMA
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Dostanete bezplatnú reklamu, aby sme vám apartmán naplnili hosťami. Maximalizujte svoje príjmy z prenájmu!
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ako to funguje */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              Ako to funguje?
            </h2>
            <div className="space-y-6">
              {[
                {
                  number: "1",
                  title: "Kontaktujte nás",
                  description: "Zavolajte alebo napíšte. Poradíme vám s výberom vhodného riešenia pre váš projekt."
                },
                {
                  number: "2",
                  title: "Zhodnotíme váš projekt",
                  description: "Naši experti posúdia, či váš rodinný dom alebo Airbnb apartmán spĺňa podmienky na získanie dotácie."
                },
                {
                  number: "3",
                  title: "Podáme žiadosť",
                  description: "Vybavíme za vás všetky potrebné dokumenty a podáme žiadosť o dotáciu."
                },
                {
                  number: "4",
                  title: "Bonusová reklama",
                  description: "Pre Airbnb apartmány dostanete bezplatnú reklamu, ktorá vám zabezpečí hostí a maximalizuje príjmy."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 bg-white hover:shadow-lg transition-all">
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl font-bold">{step.number}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pre koho je dotácia vhodná */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              Pre koho je program vhodný?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Rodinné domy</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Dotácia na ekologické stavby</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Energeticky efektívne riešenia</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Obnoviteľné zdroje energie</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Modernizácia existujúcich domov</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Airbnb apartmány</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Dotácia na energeticky efektívne apartmány</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Bezplatná marketingová podpora</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Zabezpečíme vám hostí</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>Maximalizujte návratnosť investície</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA sekcia */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Získajte dotáciu pre váš projekt
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Využite možnosť finančnej podpory a bezplatnej reklamy. Naši odborníci vám pomôžu so všetkým.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-2xl w-full sm:w-auto">
                  Nezáväzná konzultácia
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="bg-transparent border-3 border-white text-white hover:bg-white hover:text-blue-700 font-bold px-10 py-6 text-lg shadow-2xl w-full sm:w-auto">
                  <Phone className="mr-2 w-5 h-5" />
                  Zavolať teraz
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}