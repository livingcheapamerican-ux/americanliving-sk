import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Euro, Home, Phone, ArrowRight, Gift, TrendingUp, Users, Play, Zap, Shield, Calendar, DollarSign, Star, Map } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DotaciaAmericana() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    ucel: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Dopyt.create({
        meno: formData.meno,
        email: formData.email,
        telefon: formData.telefon,
        typ_dopytu: "vseobecny",
        poznamka: `Dotácia Americana - Účel: ${formData.ucel}`
      });
      toast.success("Vaša žiadosť bola odoslaná! Čoskoro vás kontaktujeme s video odpoveďou.");
      setFormData({ meno: "", email: "", telefon: "", ucel: "" });
    } catch (error) {
      toast.error("Nepodarilo sa odoslať žiadosť. Skúste to znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Split Screen Hero Section */}
      <section className="min-h-screen relative overflow-hidden">
        {/* Split Screen Container */}
        <div className="grid md:grid-cols-2 min-h-screen">
          {/* ĽAVÁ STRANA - Pre Rodiny (Modrá) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 sm:p-12 flex flex-col justify-center items-center text-white overflow-hidden group cursor-pointer"
            onClick={() => scrollToSection('ambassador-section')}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10 text-center max-w-lg transform group-hover:scale-105 transition-transform duration-300">
              <Home className="w-20 h-20 mx-auto mb-6" />
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                CHCEM BÝVAŤ<br />A PLATIŤ MENEJ
              </h2>
              <p className="text-xl sm:text-2xl mb-8 text-blue-100">
                Získajte dotáciu na dom a my vám budeme platiť energie.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-2xl"
                onClick={(e) => { e.stopPropagation(); scrollToSection('ambassador-section'); }}
              >
                Mám záujem o bývanie
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* PRAVÁ STRANA - Pre Investorov (Zlatá/Čierna) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 sm:p-12 flex flex-col justify-center items-center text-white overflow-hidden group cursor-pointer"
            onClick={() => scrollToSection('partner-section')}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ29sZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="relative z-10 text-center max-w-lg transform group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                CHCEM INVESTOVAŤ<br />A ZARÁBAŤ
              </h2>
              <p className="text-xl sm:text-2xl mb-8 text-gray-300">
                Kúpte dom s dotáciou. My vám ho naplníme hosťami.
              </p>
              <Button 
                size="lg" 
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-10 py-6 text-lg shadow-2xl"
                onClick={(e) => { e.stopPropagation(); scrollToSection('partner-section'); }}
              >
                Mám záujem o investíciu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Centrálny Video Player (Overlay) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md"
          >
            <p className="text-center text-sm font-semibold text-gray-600 mb-4">
              👋 Sprievodca dotáciou: Vyberte si svoju cestu
            </p>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <Play className="w-20 h-20 text-white opacity-80 hover:opacity-100 cursor-pointer transition-opacity" />
              <p className="absolute text-white text-xs mt-32">HeyGen Interactive Avatar</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEKCIA A: PROGRAM "AMBASSADOR" (Pre Rodiny) */}
      <section id="ambassador-section" className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block mb-4">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                  Program Ambassador
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Váš dom si na energie zarobí sám
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 bg-white border-2 border-blue-300 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📉 Investičná zľava 5%
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Získate zľavu 5% z cenníkovej ceny vášho nového domu.
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-blue-300 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ⚡ Energy Cashback
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Platíme vám za každú referenčnú návštevu vo vašom dome.
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-blue-300 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🛡️ 100% Súkromie
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Adresa je tajná, návštevy schvaľujete len vy.
                </p>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Príklady domov pre program Ambassador - Prosto House (Rodinné modely)</p>
              <p className="text-gray-400 text-xs italic">Ceny na vyžiadanie</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCIA B: PROGRAM "PARTNER" (Pre Investorov) */}
      <section id="partner-section" className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block mb-4">
                <span className="bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                  Program Partner
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                Nekupujte nehnuteľnosť. Kúpte si fungujúci biznis.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 bg-gray-800 border-2 border-yellow-400 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  📉 Veľkoobchodná dotácia
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Špeciálna zľava na nákup stavby pre investičné účely.
                </p>
              </Card>

              <Card className="p-8 bg-gray-800 border-2 border-yellow-400 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Map className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  🚀 Marketing ZDARMA
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Vaša stavba bude na našej mape 'Testovacích centier'.
                </p>
              </Card>

              <Card className="p-8 bg-gray-800 border-2 border-yellow-400 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  📅 Plný kalendár
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Posielame vám klientov, ktorí chcú dom skúsiť pred kúpou.
                </p>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">Príklady domov pre program Partner - Teacup House (Airbnb modely)</p>
              <p className="text-gray-500 text-xs italic">Ceny na vyžiadanie</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTELIGENTNÝ FORMULÁR */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-block mb-4">
                <Star className="w-16 h-16 text-yellow-400 mx-auto" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Overenie nároku na dotáciu
              </h2>
              <p className="text-xl text-gray-600">
                Vyplňte údaje a náš AI Avatar vám pošle osobnú video-kalkuláciu.
              </p>
            </motion.div>

            <Card className="p-8 sm:p-12 bg-white shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vaše meno (Pre oslovenie vo videu)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ján Novák"
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-lg p-6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="jan.novak@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-lg p-6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefón
                  </label>
                  <Input
                    type="tel"
                    placeholder="+421 XXX XXX XXX"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-lg p-6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Účel využitia ⭐
                  </label>
                  <select
                    value={formData.ucel}
                    onChange={(e) => setFormData({ ...formData, ucel: e.target.value })}
                    required
                    className="w-full text-lg p-6 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Vyberte --</option>
                    <option value="byvanie">🏡 Bývanie (Program Ambassador)</option>
                    <option value="investicia">📈 Investícia (Program Partner)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-xl"
                >
                  {isSubmitting ? "Odosielam..." : "Získať video odpoveď"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Pätička */}
      <footer className="py-12 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <p className="text-lg font-semibold mb-2">
            American Living - Partner pre váš domov aj biznis
          </p>
          <p className="text-gray-400 text-sm">
            Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}