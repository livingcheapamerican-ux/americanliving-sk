import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Euro, Home, Phone, ArrowRight, Gift, TrendingUp, Users, Play, Zap, Shield, Calendar, DollarSign, Star, Map, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function DotaciaAmericana() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    lokalita: "",
    rozpocet: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'rodina' or 'investor'
  const pianoRef = useRef(null);
  const houseRef = useRef(null);

  // Fetch houses for product section
  const { data: houses } = useQuery({
    queryKey: ['dotacia-houses'],
    queryFn: async () => {
      const allHouses = await base44.entities.Dom.list();
      return allHouses.filter(h => h.vyrobca === 'Prosto House' || h.nazov.includes('Teacup'));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ucel = modalType === 'rodina' ? 'Bývanie (Program Ambassador)' : 'Investícia (Program Partner)';
      await base44.entities.Dopyt.create({
        meno: formData.meno,
        email: formData.email,
        telefon: formData.telefon,
        typ_dopytu: "vseobecny",
        poznamka: `Dotácia Americana - Účel: ${ucel}${formData.lokalita ? `, Lokalita: ${formData.lokalita}` : ''}${formData.rozpocet ? `, Rozpočet: ${formData.rozpocet}` : ''}`
      });
      toast.success("Vaša žiadosť bola odoslaná! Do 24 hodín dostanete personalizovanú video odpoveď.");
      setFormData({ meno: "", email: "", telefon: "", lokalita: "", rozpocet: "" });
      setModalType(null);
    } catch (error) {
      toast.error("Nepodarilo sa odoslať žiadosť. Skúste to znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const playSound = (type) => {
    if (type === 'piano' && pianoRef.current) {
      pianoRef.current.play();
    } else if (type === 'house' && houseRef.current) {
      houseRef.current.play();
    }
  };

  const stopSound = (type) => {
    if (type === 'piano' && pianoRef.current) {
      pianoRef.current.pause();
      pianoRef.current.currentTime = 0;
    } else if (type === 'house' && houseRef.current) {
      houseRef.current.pause();
      houseRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Audio Elements */}
      <audio ref={pianoRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      <audio ref={houseRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" />

      {/* HERO SECTION - Split Screen */}
      <section className="h-screen relative overflow-hidden flex flex-col md:flex-row">
        {/* ĽAVÁ STRANA - VICTORIA (Rodina) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group cursor-pointer"
          onClick={() => setModalType('rodina')}
          onMouseEnter={() => playSound('piano')}
          onMouseLeave={() => stopSound('piano')}
        >
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-300/10 to-transparent z-10 pointer-events-none"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
          </video>
          
          {/* Content Overlay */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                RODINA & ISTOTA
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                Dotácia na bývanie + Príspevok na energie
              </p>
              <Button
                size="lg"
                className="bg-white/95 hover:bg-white text-gray-900 font-bold px-8 py-6 text-lg rounded-full shadow-2xl backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setModalType('rodina'); }}
              >
                Chcem domov (Program Ambassador)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* PRAVÁ STRANA - ALEXANDER (Investor) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group cursor-pointer"
          onClick={() => setModalType('investor')}
          onMouseEnter={() => playSound('house')}
          onMouseLeave={() => stopSound('house')}
        >
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-transparent z-10 pointer-events-none"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
          </video>

          {/* Content Overlay */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                INVESTÍCIA & VÝNOS
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                Partnerská dotácia + Garantovaný marketing
              </p>
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-6 text-lg rounded-full shadow-2xl"
                onClick={(e) => { e.stopPropagation(); setModalType('investor'); }}
              >
                Chcem zarábať (Program Partner)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black">
                  {modalType === 'rodina' ? '🏡 Program Ambassador' : '📈 Program Partner'}
                </DialogTitle>
              </DialogHeader>

              {/* Video Section */}
              <div className="mb-6">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video autoPlay controls className="w-full h-full">
                    <source 
                      src={modalType === 'rodina' 
                        ? "https://player.vimeo.com/external/371433846.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164"
                        : "https://player.vimeo.com/external/434045526.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164"
                      } 
                      type="video/mp4" 
                    />
                  </video>
                </div>
                <p className="mt-4 text-center text-lg font-semibold text-gray-700">
                  {modalType === 'rodina' 
                    ? '✅ Garancia: Zľava 5% + Odmena 150€ za každú tichú obhliadku.'
                    : '✅ Garancia: Zľava 5% + Zaradenie do mapy Testovacích centier.'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meno
                  </label>
                  <Input
                    type="text"
                    placeholder="Ján Novák"
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-lg p-4"
                  />
                </div>

                {modalType === 'rodina' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lokalita pozemku
                    </label>
                    <Input
                      type="text"
                      placeholder="Bratislava - Rača"
                      value={formData.lokalita}
                      onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                      className="text-lg p-4"
                    />
                  </div>
                )}

                {modalType === 'investor' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rozpočet
                    </label>
                    <Input
                      type="text"
                      placeholder="50 000 - 100 000 €"
                      value={formData.rozpocet}
                      onChange={(e) => setFormData({ ...formData, rozpocet: e.target.value })}
                      className="text-lg p-4"
                    />
                  </div>
                )}

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
                    className="text-lg p-4"
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
                    className="text-lg p-4"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-6 text-lg ${
                    modalType === 'rodina'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black'
                  }`}
                >
                  {isSubmitting ? "Odosielam..." : "Odoslať žiadosť"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* PRODUKTOVÁ SEKCIA */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Dostupné Modely
            </h2>
            <p className="text-xl text-gray-600">
              Všetky domy sú vhodné pre Program Ambassador aj Partner
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses?.slice(0, 6).map((dom) => (
              <motion.div
                key={dom.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all">
                  <img 
                    src={dom.hlavny_obrazok} 
                    alt={dom.nazov}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{dom.nazov}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-gray-400 line-through text-lg">
                        {dom.zakladna_cena?.toLocaleString()} €
                      </span>
                      <span className="text-3xl font-black text-green-600">
                        {Math.round(dom.zakladna_cena * 0.95).toLocaleString()} €
                      </span>
                    </div>
                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      ✅ Vhodné pre obidva programy
                    </div>
                    <Link to={createPageUrl(`DetailDomu?id=${dom.id}`)}>
                      <Button className="w-full" variant="outline">
                        Zobraziť detail
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
          </div>
        </div>
      </section>

      {/* PÄTIČKA */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">
            American Living - Partner pre váš domov aj biznis
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Powered by AI
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-500 text-xs max-w-3xl mx-auto">
              ⚖️ <strong>Legal Disclaimer:</strong> Dotácia je poskytovaná spoločnosťou American Living ako súkromný marketingový príspevok. 
              Nejde o štátnu pomoc. Podmienky platné k dátumu podpisu kúpnej zmluvy. Marketingová akcia môže byť kedykoľvek ukončená bez predchádzajúceho upozornenia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}