import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Euro, Home, Phone, ArrowRight, Gift, TrendingUp, Users, Play, Zap, Shield, Calendar, DollarSign, Star, Map, X, FileText } from "lucide-react";
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
  const [rodinaIndex, setRodinaIndex] = useState(0);
  const [investorIndex, setInvestorIndex] = useState(0);

  // Fetch houses for product section
  const { data: houses } = useQuery({
    queryKey: ['dotacia-houses'],
    queryFn: async () => {
      const allHouses = await base44.entities.Dom.list();
      return allHouses.filter(h => h.vyrobca === 'Prosto House' || h.nazov.includes('Teacup'));
    }
  });

  // Fetch hero settings
  const { data: heroSettings } = useQuery({
    queryKey: ['dotacia-hero-settings'],
    queryFn: async () => {
      const settings = await base44.entities.DotaciaHeroSettings.filter({ klic: 'hero_settings' });
      return settings[0] || null;
    }
  });

  // Slideshow for Rodina
  useEffect(() => {
    if (!heroSettings?.rodina_fotky?.length) return;
    const interval = setInterval(() => {
      setRodinaIndex((prev) => (prev + 1) % heroSettings.rodina_fotky.length);
    }, heroSettings.rodina_interval || 5000);
    return () => clearInterval(interval);
  }, [heroSettings?.rodina_fotky, heroSettings?.rodina_interval]);

  // Slideshow for Investor
  useEffect(() => {
    if (!heroSettings?.investor_fotky?.length) return;
    const interval = setInterval(() => {
      setInvestorIndex((prev) => (prev + 1) % heroSettings.investor_fotky.length);
    }, heroSettings.investor_interval || 5000);
    return () => clearInterval(interval);
  }, [heroSettings?.investor_fotky, heroSettings?.investor_interval]);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --primary: #1E3A8A;
          --secondary: #1E40AF;
          --accent: #D4AF37;
          --dark-brown: #3E2723;
          --success: #059669;
        }

        .bg-primary { background-color: var(--primary); }
        .text-primary { color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary { color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .text-accent { color: var(--accent); }
        .hover\\:bg-secondary:hover { background-color: var(--secondary); }
        .border-primary { border-color: var(--primary); }
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        .border-success { border-color: var(--success); }
        .text-success { color: var(--success); }
        .bg-success { background-color: var(--success); }
      `}</style>

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
        >
          {/* Image Background with Slideshow */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-300/10 to-transparent z-10 pointer-events-none"></div>
          {heroSettings?.rodina_fotky?.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={rodinaIndex}
                src={heroSettings.rodina_fotky[rodinaIndex]}
                alt="Rodina & Istota"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
            </video>
          )}
          
          {/* Content Overlay */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-black/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-white/30"
            >
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight">
                PROGRAM AMBASSADOR
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-white/95 mb-2 sm:mb-3 drop-shadow-lg font-sans font-medium">
                Dotačný grant na rodinné bývanie + Prevádzkový príspevok na energie
              </p>
              <p className="text-xs sm:text-sm md:text-base text-white/85 mb-4 sm:mb-6 drop-shadow-lg font-sans max-w-md mx-auto">
                Fond American Living alokoval prostriedky na podporu 15 rodín. Získajte príspevok na výstavbu a mesačnú rentu za reprezentáciu.
              </p>
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 font-sans font-bold px-4 sm:px-8 py-3 sm:py-6 text-xs sm:text-base rounded-lg shadow-2xl"
                onClick={(e) => { e.stopPropagation(); setModalType('rodina'); }}
              >
                Overiť nárok na dotáciu
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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
        >
          {/* Image Background with Slideshow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-transparent z-10 pointer-events-none"></div>
          {heroSettings?.investor_fotky?.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={investorIndex}
                src={heroSettings.investor_fotky[investorIndex]}
                alt="Investícia & Výnos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
            </video>
          )}

          {/* Content Overlay */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-yellow-400/50"
            >
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight">
                PROGRAM PARTNER
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-white/95 mb-2 sm:mb-3 drop-shadow-lg font-sans font-medium">
                Investičný stimul pre podnikateľov + Garancia obsadenosti
              </p>
              <p className="text-xs sm:text-sm md:text-base text-white/85 mb-4 sm:mb-6 drop-shadow-lg font-sans max-w-md mx-auto">
                Otvárame dotačnú schému pre výstavbu testovacích centier. My zainvestujeme do vašej nehnuteľnosti, vy inkasujete zisk.
              </p>
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-sans font-bold px-4 sm:px-8 py-3 sm:py-6 text-xs sm:text-base rounded-lg shadow-2xl"
                onClick={(e) => { e.stopPropagation(); setModalType('investor'); }}
              >
                Žiadosť o investičný stimul
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-3xl font-serif font-bold text-primary">
                  {modalType === 'rodina' ? '🏡 Program Ambassador - Žiadosť o dotáciu' : '📈 Program Partner - Žiadosť o investičný stimul'}
                </DialogTitle>
              </DialogHeader>

              {/* Video Section */}
              <div className="mb-6">
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg overflow-hidden border-2 border-accent/30">
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
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-primary rounded">
                  <p className="text-xs sm:text-sm font-sans font-semibold text-primary">
                    {modalType === 'rodina' 
                      ? '✅ SCHVÁLENÉ BENEFITY: Dotácia 5% z ceny + Prevádzkový príspevok 150€ za každú schválenú návštevu'
                      : '✅ SCHVÁLENÉ BENEFITY: Investičný stimul 5% + Zaradenie do oficiálnej mapy Testovacích centier'
                    }
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Meno
                  </label>
                  <Input
                    type="text"
                    placeholder="Ján Novák"
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-sm sm:text-lg p-3 sm:p-4"
                  />
                </div>

                {modalType === 'rodina' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Lokalita pozemku
                    </label>
                    <Input
                      type="text"
                      placeholder="Bratislava - Rača"
                      value={formData.lokalita}
                      onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                      className="text-sm sm:text-lg p-3 sm:p-4"
                    />
                  </div>
                )}

                {modalType === 'investor' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Rozpočet
                    </label>
                    <Input
                      type="text"
                      placeholder="50 000 - 100 000 €"
                      value={formData.rozpocet}
                      onChange={(e) => setFormData({ ...formData, rozpocet: e.target.value })}
                      className="text-sm sm:text-lg p-3 sm:p-4"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="jan.novak@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-sm sm:text-lg p-3 sm:p-4"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Telefón
                  </label>
                  <Input
                    type="tel"
                    placeholder="+421 XXX XXX XXX"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-sm sm:text-lg p-3 sm:p-4"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-sans font-bold py-4 sm:py-6 text-base sm:text-lg bg-primary hover:bg-secondary text-white"
                >
                  {isSubmitting ? "Spracovávam žiadosť..." : "Odoslať žiadosť o pridelenie dotácie"}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* PRODUKTOVÁ SEKCIA */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Aktuálna dotačná ponuka
            </h2>
            <p className="text-base sm:text-xl text-gray-700 font-sans">
              Všetky modely sú oprávnené pre Program Ambassador aj Partner
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses?.slice(0, 6).map((dom) => {
              const cennikova = dom.zakladna_cena;
              const dotacia = Math.round(cennikova * 0.05);
              const doplatok = cennikova - dotacia;

              return (
                <motion.div
                  key={dom.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all border-2 border-blue-200">
                    <img 
                      src={dom.hlavny_obrazok} 
                      alt={dom.nazov}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-blue-50">
                      <h3 className="text-base sm:text-xl font-serif font-bold text-gray-900 mb-4">{dom.nazov} - Edícia 2026</h3>

                      <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-4 font-sans">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b">
                          <span className="text-xs sm:text-sm text-gray-500">Cenníková hodnota:</span>
                          <span className="text-sm sm:text-base text-gray-400 line-through">{cennikova?.toLocaleString()} €</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 pb-2 border-b">
                          <span className="text-xs sm:text-sm font-bold text-success">SCHVÁLENÁ DOTÁCIA:</span>
                          <span className="text-base sm:text-xl font-bold text-success">- {dotacia?.toLocaleString()} €</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base font-bold text-primary">DOPLATOK KLIENTA:</span>
                          <span className="text-xl sm:text-3xl font-black text-primary">{doplatok?.toLocaleString()} €</span>
                        </div>
                      </div>

                      <div className="bg-green-50 border-l-4 border-success p-3 mb-4 rounded">
                        <p className="text-xs font-sans font-semibold text-success">
                          + BONUS: Nárok na ročný prevádzkový grant (energie) až do výšky 400 €
                        </p>
                      </div>

                      <Link to={createPageUrl(`DetailDomu?id=${dom.id}`)}>
                        <Button className="w-full bg-primary hover:bg-secondary text-white font-sans font-semibold" size="lg">
                          Detail dotačnej ponuky
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEKCIA: PROCES ČERPANIA DOTÁCIE */}
      <section id="proces-section" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
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
                <span className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-sans font-bold uppercase tracking-wide">
                  Oficiálny proces
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
                PROCES ČERPANIA DOTÁCIE
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 bg-white border-2 border-primary/30 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  KROK 1
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  Schválenie žiadosti
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Náš interný výbor posúdi vašu lokalitu. Ak spĺňa kritériá programu Ambassador alebo Partner, alokujeme pre vás zdroje.
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-primary/30 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  KROK 2
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  Podpis dotačného dekrétu
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Pri podpise zmluvy vám okamžite odpočítame schválenú výšku dotácie z ceny nehnuteľnosti (Zníženie istiny).
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-primary/30 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-success/20 rounded-lg flex items-center justify-center mb-6">
                  <Euro className="w-8 h-8 text-success" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  KROK 3
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  Výplata prevádzkového grantu
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  Po odovzdaní domu vám začneme vyplácať "Ambassador Fee" – finančnú odmenu za každú zrealizovanú referenčnú návštevu, ktorá pokryje vaše náklady na energie.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCIA: CTA - ŽIADOSŤ O DOTÁCIU */}
      <section id="cta-section" className="py-20 bg-gradient-to-br from-primary via-secondary to-primary text-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-block mb-6 px-6 py-3 bg-black/60 backdrop-blur-md border-2 border-accent rounded-lg shadow-2xl">
                <p className="text-lg sm:text-2xl font-serif font-bold text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
                  ⚠️ Stav fondu: <span className="text-accent" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>OTVORENÝ</span> do vyčerpania kapacity
                </p>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-2xl">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-white" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.9)' }}>
                  Pridelenie dotácie prebieha na základe poradia žiadostí
                </h2>
                <p className="text-base sm:text-xl font-sans text-white max-w-2xl mx-auto" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
                  Pre tento kvartál sme uvoľnili prostriedky len pre 15 stavieb. Po naplnení kvóty bude dotačná výzva uzavretá.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-6">
                  Rýchla žiadosť o pridelenie dotácie
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Celé meno"
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Input
                    type="tel"
                    placeholder="Telefón"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Input
                    type="text"
                    placeholder="Lokalita (voliteľné)"
                    value={formData.lokalita}
                    onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                    className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-secondary text-white font-sans font-bold py-6 text-lg shadow-lg"
                  >
                    {isSubmitting ? "Spracovávam..." : "Odoslať žiadosť o pridelenie dotácie"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
                <p className="text-xs text-gray-600 mt-4 font-sans">
                  Vaša žiadosť bude spracovaná do 24 hodín. Dostanete personalizované video s potvrdením alokácie prostriedkov.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PÄTIČKA */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif font-bold mb-2">
            American Living Foundation
          </p>
          <p className="text-gray-400 text-sm mb-6 font-sans">
            Súkromný dotačný fond na podporu bývania a podnikania
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-500 text-xs max-w-3xl mx-auto font-sans leading-relaxed">
              ⚖️ <strong>Právne upozornenie:</strong> Dotácia je poskytovaná spoločnosťou American Living ako súkromný marketingový príspevok a investičný stimul. 
              Nejde o štátnu pomoc ani verejný grant. Podmienky platné k dátumu podpisu dotačného dekrétu (kúpnej zmluvy). 
              Dotačná schéma môže byť kedykoľvek upravená alebo ukončená bez predchádzajúceho upozornenia pri vyčerpaní alokovaných prostriedkov.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}