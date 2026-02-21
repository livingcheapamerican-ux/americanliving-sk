import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Euro, Home, Phone, ArrowRight, Gift, TrendingUp, Users, Play, Zap, Shield, Calendar, DollarSign, Star, Map, X, FileText, Edit, Upload, Trash2, ChevronUp, ChevronDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DotaciaAmericana() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    lokalita: "",
    rozpocet: "",
    dom_id: "",
    forma_financovania: "",
    typ_grantu: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'rodina' or 'investor'
  const pianoRef = useRef(null);
  const houseRef = useRef(null);
  const [rodinaIndex, setRodinaIndex] = useState(0);
  const [investorIndex, setInvestorIndex] = useState(0);
  const [showPhotoManager, setShowPhotoManager] = useState(null); // 'rodina' or 'investor'
  const [uploading, setUploading] = useState(false);

  // Fetch houses for product section - only visible TicabHouse houses with photos
  const { data: houses } = useQuery({
    queryKey: ['dotacia-ticabhouse-houses'],
    queryFn: async () => {
      const allHouses = await base44.entities.Dom.filter({ vyrobca: 'Ticab house' });
      return allHouses.filter(h => {
        const isVisible = h.verejny !== false;
        const hasMainImage = h.hlavny_obrazok && h.hlavny_obrazok.length > 0;
        return isVisible && hasMainImage;
      });
    },
    staleTime: 0 // Force fresh data
  });

  // Read URL parameters and prefill house if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domId = urlParams.get('dom');
    if (domId && houses) {
      setFormData(prev => ({ ...prev, dom_id: domId }));
    }
  }, [houses]);

  // Fetch hero settings
  const { data: heroSettings } = useQuery({
    queryKey: ['dotacia-hero-settings'],
    queryFn: async () => {
      const settings = await base44.entities.DotaciaHeroSettings.filter({ klic: 'hero_settings' });
      if (settings.length === 0) {
        const newSettings = await base44.entities.DotaciaHeroSettings.create({
          klic: 'hero_settings',
          rodina_fotky: [],
          rodina_interval: 5000,
          investor_fotky: [],
          investor_interval: 5000
        });
        return newSettings;
      }
      return settings[0];
    }
  });

  const queryClient = useQueryClient();

  // Slideshow for Rodina - faster on mobile
  useEffect(() => {
    if (!heroSettings?.rodina_fotky?.length) return;
    const isMobile = window.innerWidth < 768;
    const interval = setInterval(() => {
      setRodinaIndex((prev) => (prev + 1) % heroSettings.rodina_fotky.length);
    }, isMobile ? 3000 : (heroSettings.rodina_interval || 5000));
    return () => clearInterval(interval);
  }, [heroSettings?.rodina_fotky, heroSettings?.rodina_interval]);

  // Slideshow for Investor - faster on mobile
  useEffect(() => {
    if (!heroSettings?.investor_fotky?.length) return;
    const isMobile = window.innerWidth < 768;
    const interval = setInterval(() => {
      setInvestorIndex((prev) => (prev + 1) % heroSettings.investor_fotky.length);
    }, isMobile ? 3000 : (heroSettings.investor_interval || 5000));
    return () => clearInterval(interval);
  }, [heroSettings?.investor_fotky, heroSettings?.investor_interval]);

  // Preload next images for smooth transitions
  useEffect(() => {
    if (!heroSettings?.rodina_fotky?.length) return;
    const nextIndex = (rodinaIndex + 1) % heroSettings.rodina_fotky.length;
    const img = new Image();
    img.src = heroSettings.rodina_fotky[nextIndex] + '?w=800&q=70';
  }, [rodinaIndex, heroSettings?.rodina_fotky]);

  useEffect(() => {
    if (!heroSettings?.investor_fotky?.length) return;
    const nextIndex = (investorIndex + 1) % heroSettings.investor_fotky.length;
    const img = new Image();
    img.src = heroSettings.investor_fotky[nextIndex] + '?w=800&q=70';
  }, [investorIndex, heroSettings?.investor_fotky]);

  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const ucel = modalType === 'rodina' ? 'Bývanie (Program Ambassador)' : 'Investícia (Program Partner)';
        const selectedHouse = houses?.find(h => h.id === formData.dom_id);
        const houseName = selectedHouse?.nazov || '';
        const dotacia = selectedHouse ? Math.round(selectedHouse.zakladna_cena * 0.05) : 0;

        await base44.entities.Dopyt.create({
          meno: formData.meno,
          email: formData.email,
          telefon: formData.telefon,
          typ_dopytu: "vseobecny",
          dom_id: formData.dom_id || null,
          forma_financovania: formData.forma_financovania,
          typ_grantu: formData.typ_grantu,
          poznamka: `Dotácia Americana - Účel: ${ucel}${houseName ? `, Dom: ${houseName} (Dotácia: ${dotacia.toLocaleString()} €)` : ''}${formData.lokalita ? `, Lokalita: ${formData.lokalita}` : ''}${formData.rozpocet ? `, Rozpočet: ${formData.rozpocet}` : ''}${formData.forma_financovania ? `, Financovanie: ${formData.forma_financovania}` : ''}${formData.typ_grantu ? `, Typ grantu: ${formData.typ_grantu}` : ''}`
        });

        // Send email to client with house photos and contact info
        await base44.functions.invoke('sendDotaciaEmails', {
          klientEmail: formData.email,
          klientMeno: formData.meno,
          domId: formData.dom_id,
          typGrantu: formData.typ_grantu,
          domNazov: houseName,
          dotacia: dotacia,
          lokalita: formData.lokalita,
          rozpocet: formData.rozpocet,
          formaFinancovania: formData.forma_financovania
        });
      
      // Konfety animácia na potvrdenie
      if (typeof window !== 'undefined' && window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Set success data for display
      setSuccessData({
        house: selectedHouse,
        dotacia: dotacia
      });
      
      toast.success("✅ Blahoželáme! Zaradili ste sa medzi kandidátov na poskytnutie súkromného grantu od spoločnosti American Living.");
      setFormData({ meno: "", email: "", telefon: "", lokalita: "", rozpocet: "", dom_id: "", forma_financovania: "", typ_grantu: "" });
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

  const handlePhotoUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      const currentPhotos = type === 'rodina' ? heroSettings.rodina_fotky : heroSettings.investor_fotky;
      const newPhotos = [...(currentPhotos || []), ...uploadedUrls];

      await base44.entities.DotaciaHeroSettings.update(heroSettings.id, 
        type === 'rodina' 
          ? { rodina_fotky: newPhotos }
          : { investor_fotky: newPhotos }
      );
      
      queryClient.invalidateQueries(['dotacia-hero-settings']);
      toast.success(`${uploadedUrls.length} fotiek nahraných`);
    } catch (error) {
      toast.error("Chyba pri nahrávaní fotiek");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (type, index) => {
    const currentPhotos = type === 'rodina' ? heroSettings.rodina_fotky : heroSettings.investor_fotky;
    const newPhotos = currentPhotos.filter((_, i) => i !== index);

    await base44.entities.DotaciaHeroSettings.update(heroSettings.id,
      type === 'rodina' 
        ? { rodina_fotky: newPhotos }
        : { investor_fotky: newPhotos }
    );
    
    queryClient.invalidateQueries(['dotacia-hero-settings']);
    toast.success("Fotka vymazaná");
  };

  const handleMovePhoto = async (type, index, direction) => {
    const currentPhotos = type === 'rodina' ? heroSettings.rodina_fotky : heroSettings.investor_fotky;
    const newPhotos = [...currentPhotos];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newPhotos.length) return;

    [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];

    await base44.entities.DotaciaHeroSettings.update(heroSettings.id,
      type === 'rodina' 
        ? { rodina_fotky: newPhotos }
        : { investor_fotky: newPhotos }
    );
    
    queryClient.invalidateQueries(['dotacia-hero-settings']);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Dotácia Americana – Súkromný grant 5% na modulárny dom | American Living</title>
        <meta name="description" content="Program AMBASSADOR a PARTNER – získajte súkromný grant až 5% z ceny domu od American Living. Dotované bývanie pre rodiny a investorov. Overte si nárok ešte dnes." />
        <meta name="keywords" content="dotácia na dom, grant na bývanie, modulárny dom dotácia, American Living grant, dotácia Americana, dotované bývanie Slovensko" />
        <meta property="og:title" content="Dotácia Americana – Súkromný grant 5% na modulárny dom" />
        <meta property="og:description" content="Program AMBASSADOR a PARTNER – získajte súkromný grant až 5% z ceny domu od American Living. Overte si nárok ešte dnes." />
        <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png" />
        <meta property="og:url" content="https://americanliving.sk/dotacia-americana" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="sk_SK" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dotácia Americana – Súkromný grant 5% na modulárny dom" />
        <meta name="twitter:description" content="Program AMBASSADOR a PARTNER – získajte súkromný grant až 5% z ceny domu od American Living." />
        <meta name="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png" />
        <link rel="canonical" href="https://americanliving.sk/dotacia-americana" />
      </Helmet>
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --primary: #34D399;
          --secondary: #10B981;
          --accent: #FBBF24;
          --dark-brown: #3E2723;
          --success: #059669;
          --warm-orange: #FB923C;
          --soft-yellow: #FDE047;
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

        @media (max-width: 640px) {
          [data-radix-dialog-content] {
            width: 92vw !important;
            max-width: 380px !important;
          }
        }
      `}</style>

      {/* Audio Elements */}
      <audio ref={pianoRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      <audio ref={houseRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" />

      {/* HERO SECTION - Mobile: Slideshow, Desktop: Split Screen */}
      <section className="min-h-screen md:h-screen relative overflow-hidden">
        {/* MOBILE VERZIA - Slideshow */}
        <div className="md:hidden">
          {/* Slideshow pozadia */}
          <div className="relative h-[50vh] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-hero-${rodinaIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                {heroSettings?.rodina_fotky?.length > 0 ? (
                  <img
                    src={heroSettings.rodina_fotky[rodinaIndex] + '?w=800&q=70'}
                    alt="Moderný modulárny dom American Living - Program Ambassador dotované bývanie pre rodiny"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ff514cd811de?w=800&q=70"
                    alt="Moderný modulárny dom s dotáciou American Living"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
            
            {/* Edit Button */}
            <button
              onClick={() => setShowPhotoManager('rodina')}
              className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <Edit className="w-5 h-5 text-emerald-600" />
            </button>

            {/* Titulok na mobile */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
              <h1 className="text-3xl font-serif font-black text-white mb-3 drop-shadow-2xl leading-tight">
                Dotácia AMERICANA
              </h1>
              <p className="text-base text-white/95 mb-4 drop-shadow-xl font-sans">
                {t('dotaciaGrantNote')}
              </p>
            </div>
          </div>

          {/* Karty na mobile */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50 py-8 px-4 space-y-6">
            {/* Ambassador Card */}
            <Card className="p-6 bg-white border-2 border-emerald-500 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-black text-emerald-700">
                    Program AMBASSADOR
                  </h2>
                  <p className="text-xs text-emerald-600 font-bold">
                    {t('dotaciaHeroLeftSubtitle')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {t('dotaciaHeroLeftDesc')}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-emerald-800">{t('dotaciaGrant')}</p>
                </div>
                <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-emerald-800">{t('dotaciaBonusEnergy')}</p>
                </div>
              </div>
              <Button
                onClick={() => setModalType('rodina')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold"
              >
                Overiť nárok
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>

            {/* Investor Card */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-500 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-black text-yellow-800">
                    Program PARTNER
                  </h2>
                  <p className="text-xs text-yellow-700 font-bold">
                    {t('dotaciaHeroRightSubtitle')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                {t('dotaciaHeroRightDesc')}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 bg-white/80 p-2 rounded">
                  <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-yellow-800">{t('dotaciaGrant')}</p>
                </div>
                <div className="flex items-start gap-2 bg-white/80 p-2 rounded">
                  <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-yellow-800">{t('dotaciaInvestorBonusMarketing')}</p>
                </div>
              </div>
              <Button
                onClick={() => setModalType('investor')}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                Žiadosť o investičný stimul
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>

        {/* DESKTOP VERZIA - Split Screen */}
        <div className="hidden md:flex md:flex-row h-screen">
          {/* ĽAVÁ STRANA - VICTORIA (Rodina) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-1/2 h-full overflow-hidden group cursor-pointer"
            onClick={() => setModalType('rodina')}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-10 pointer-events-none"></div>
            {heroSettings?.rodina_fotky?.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={`rodina-${rodinaIndex}`}
                  src={heroSettings.rodina_fotky[rodinaIndex] + '?w=1200&q=75'}
                  alt="Šťastná rodina pred moderným domom American Living - Program Ambassador dotované bývanie"
                  loading="eager"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover brightness-90"
                />
              </AnimatePresence>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1560518883-ff514cd811de?w=1200&q=75"
                alt="Šťastná rodina pred moderným modulárnym domom American Living s dotáciou"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover brightness-90"
              />
            )}
            
            <button
              onClick={(e) => { e.stopPropagation(); setShowPhotoManager('rodina'); }}
              className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <Edit className="w-5 h-5 text-emerald-600" />
            </button>

            <div className="relative z-20 flex flex-col items-start justify-start h-full p-8 pt-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border-2 border-emerald-500 shadow-xl w-full max-w-md"
              >
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                  {t('dotaciaHeroLeft')}
                </h2>
                <p className="text-base text-emerald-700 mb-2 font-sans font-bold">
                  {t('dotaciaHeroLeftSubtitle')}
                </p>
                <p className="text-sm text-gray-700 mb-4 font-sans leading-relaxed">
                  {t('dotaciaHeroLeftDesc')}
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-sans font-bold px-6 py-3 text-base rounded-lg shadow-xl w-full"
                  onClick={(e) => { e.stopPropagation(); setModalType('rodina'); }}
                >
                  {t('dotaciaHeroLeftButton')}
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
            className="relative w-1/2 h-full overflow-hidden group cursor-pointer"
            onClick={() => setModalType('investor')}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-10 pointer-events-none"></div>
            {heroSettings?.investor_fotky?.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={`investor-${investorIndex}`}
                  src={heroSettings.investor_fotky[investorIndex] + '?w=1200&q=75'}
                  alt="Investícia & Výnos"
                  loading="eager"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover brightness-90"
                />
              </AnimatePresence>
            ) : (
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover brightness-90"
              >
                <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=236a2c3d3f29c7e1c1b1c3b3b3b3b3b3&profile_id=164" type="video/mp4" />
              </video>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setShowPhotoManager('investor'); }}
              className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <Edit className="w-5 h-5 text-yellow-600" />
            </button>

            <div className="relative z-20 flex flex-col items-end justify-start h-full p-8 pt-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-black/80 backdrop-blur-sm p-6 rounded-xl border-2 border-yellow-400/50 w-full max-w-md"
              >
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-2 drop-shadow-xl leading-tight">
                  {t('dotaciaHeroRight')}
                </h2>
                <p className="text-base text-white/95 mb-2 drop-shadow-lg font-sans font-medium">
                  {t('dotaciaHeroRightSubtitle')}
                </p>
                <p className="text-sm text-white/85 mb-4 drop-shadow-lg font-sans leading-relaxed">
                  {t('dotaciaHeroRightDesc')}
                </p>
                <Button
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-sans font-bold px-6 py-3 text-base rounded-lg shadow-xl w-full"
                  onClick={(e) => { e.stopPropagation(); setModalType('investor'); }}
                >
                  {t('dotaciaHeroRightButton')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PHOTO MANAGER MODAL */}
      <AnimatePresence>
        {showPhotoManager && heroSettings && (
          <Dialog open={!!showPhotoManager} onOpenChange={() => setShowPhotoManager(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif font-bold text-primary">
                  {showPhotoManager === 'rodina' ? '🏡 Správa fotiek - Program Ambassador' : '📈 Správa fotiek - Program Partner'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, showPhotoManager)}
                    className="hidden"
                    id={`upload-${showPhotoManager}`}
                  />
                  <label htmlFor={`upload-${showPhotoManager}`}>
                    <Button
                      type="button"
                      disabled={uploading}
                      className="w-full"
                      onClick={() => document.getElementById(`upload-${showPhotoManager}`).click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Nahrávam..." : "Nahrať nové fotky"}
                    </Button>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(showPhotoManager === 'rodina' ? heroSettings.rodina_fotky : heroSettings.investor_fotky)?.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute top-2 left-2 z-10 bg-white/90 rounded px-2 py-1 text-xs font-bold">
                        #{index + 1}
                      </div>
                      <img
                        src={url}
                        alt={`Fotka ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMovePhoto(showPhotoManager, index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMovePhoto(showPhotoManager, index, 'down')}
                          disabled={index === (showPhotoManager === 'rodina' ? heroSettings.rodina_fotky : heroSettings.investor_fotky).length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeletePhoto(showPhotoManager, index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {successData && (
          <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif font-bold text-primary">
                  ✅ Žiadosť úspešne odoslaná!
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <Alert className="bg-emerald-50 border-emerald-500">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <AlertDescription className="text-emerald-800 font-semibold">
                    Potvrdenie sme Vám zaslali na email. Budeme Vás kontaktovať v najbližších dňoch.
                  </AlertDescription>
                </Alert>

                {successData.house && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Váš vybraný dom</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <img 
                        src={successData.house.hlavny_obrazok} 
                        alt={successData.house.nazov}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {successData.house.zakladna_konfiguracia_obrazok && (
                        <img 
                          src={successData.house.zakladna_konfiguracia_obrazok} 
                          alt="Základná konfigurácia"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border-2 border-emerald-300">
                      <p className="text-lg font-bold text-gray-900 mb-2">{successData.house.nazov}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dotácia:</span>
                        <span className="text-2xl font-bold text-emerald-600">{successData.dotacia?.toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Naše kontakty</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-600" />
                      <a href="tel:+421905138124" className="text-emerald-600 font-semibold hover:underline">
                        +421 905 138 124
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <a href="mailto:info@americanliving.sk" className="text-emerald-600 font-semibold hover:underline">
                        info@americanliving.sk
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-emerald-600" />
                      <a href="https://americanliving.sk" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">
                        www.americanliving.sk
                      </a>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSuccessData(null)}
                  className="w-full bg-primary hover:bg-secondary text-white"
                  size="lg"
                >
                  Zavrieť
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
            <DialogContent
              className="max-h-[90vh] overflow-y-auto p-3 sm:p-5 rounded-xl"
              style={{ width: '92vw', maxWidth: '380px', margin: 'auto' }}
            >
              <DialogHeader className="pb-1">
                <DialogTitle className="text-sm sm:text-lg font-serif font-bold text-primary leading-tight pr-6">
                  {modalType === 'rodina' ? '🏡 ' + t('dotaciaModalTitleRodina') : '📈 ' + t('dotaciaModalTitleInvestor')}
                </DialogTitle>
              </DialogHeader>

              {/* Benefits strip */}
              <div className="mb-2 p-2 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                <p className="text-xs font-semibold text-emerald-700">
                  {modalType === 'rodina' 
                    ? '✅ ' + t('dotaciaModalBenefitsRodina')
                    : '✅ ' + t('dotaciaModalBenefitsInvestor')
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dotaciaFormName')}</label>
                  <Input
                    type="text"
                    placeholder={t('dotaciaFormNamePlaceholder')}
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-sm h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('dotaciaFormTypeGrant')} <span className="text-red-600">*</span>
                  </label>
                  <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                    <SelectTrigger className="text-xs sm:text-sm h-10">
                      <SelectValue placeholder={t('dotaciaFormTypeGrantPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Program AMBASSADOR - Dotované bývanie pre rodiny">
                        {t('dotaciaFormTypeGrantOption1')}
                      </SelectItem>
                      <SelectItem value="Program INVESTOR & PARTNER pre pasívny príjem">
                        {t('dotaciaFormTypeGrantOption2')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dotaciaFormHouse')}</label>
                  <Select value={formData.dom_id} onValueChange={(value) => setFormData({ ...formData, dom_id: value })}>
                    <SelectTrigger className="text-xs sm:text-sm h-10">
                      <SelectValue placeholder={t('dotaciaFormHousePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {houses?.map((dom) => {
                        const dotacia = Math.round(dom.zakladna_cena * 0.05);
                        return (
                          <SelectItem key={dom.id} value={dom.id}>
                            {dom.nazov} – {dotacia.toLocaleString()} €
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('dotaciaFormFinancing')} <span className="text-red-600">*</span>
                  </label>
                  <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                    <SelectTrigger className="text-xs sm:text-sm h-10">
                      <SelectValue placeholder={t('dotaciaFormFinancingPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hotovosť">{t('dotaciaFormFinancingOption1')}</SelectItem>
                      <SelectItem value="Úver - vybavujem si sám">{t('dotaciaFormFinancingOption2')}</SelectItem>
                      <SelectItem value="Úver vybavte mi">3. Vyberte mi najlepší úver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {modalType === 'rodina' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('dotaciaFormLocation')} <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder={t('dotaciaFormLocationPlaceholder')}
                      value={formData.lokalita}
                      onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                      required
                      className="text-sm h-10"
                    />
                  </div>
                )}

                {modalType === 'investor' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dotaciaFormBudget')}</label>
                    <Input
                      type="text"
                      placeholder={t('dotaciaFormBudgetPlaceholder')}
                      value={formData.rozpocet}
                      onChange={(e) => setFormData({ ...formData, rozpocet: e.target.value })}
                      className="text-sm h-10"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="jan.novak@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-sm h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('phone')}</label>
                  <Input
                    type="tel"
                    placeholder="+421 XXX XXX XXX"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-sm h-10"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-bold py-3 text-sm sm:text-base bg-primary hover:bg-secondary text-white"
                >
                  {isSubmitting ? t('dotaciaFormSubmitting') : t('dotaciaFormSubmit')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* SEKCIA: CTA - ŽIADOSŤ O DOTÁCIU */}
      <section id="cta-section" className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-primary via-secondary to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-black/60 backdrop-blur-md border-2 border-accent rounded-lg shadow-2xl">
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-serif font-bold text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
                  ⚠️ {t('dotaciaFundStatus')} <span className="text-accent" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>{t('dotaciaFundStatusValue')}</span> {t('dotaciaFundStatusNote')}
                </p>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-2xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-4 sm:mb-6 text-white" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.9)' }}>
                  {t('dotaciaProcessTitle')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {/* Pre rodiny */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-xl border-2 border-emerald-400">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-emerald-700">{t('dotaciaHeroLeftSubtitle')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaGrant')}</strong> {t('dotaciaGrantNote')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaBonusEnergy')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{t('dotaciaBonusRef')}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pre investorov */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-xl border-2 border-yellow-400">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-yellow-700">{t('dotaciaHeroRightSubtitle')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaGrant')}</strong> {t('dotaciaGrantNote')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaInvestorBonusMarketing')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span>{t('dotaciaInvestorBonusIncome')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl">
                <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-primary mb-4 sm:mb-6">
                  {t('dotaciaFormSubmit')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <Input
                    type="text"
                    placeholder={t('dotaciaFormNamePlaceholder')}
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 min-h-[48px]"
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
                    placeholder={t('phone')}
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('dotaciaFormTypeGrant')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 h-auto">
                        <SelectValue placeholder={t('dotaciaFormTypeGrantPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Program AMBASSADOR - Dotované bývanie pre rodiny">
                          {t('dotaciaFormTypeGrantOption1')}
                        </SelectItem>
                        <SelectItem value="Program INVESTOR & PARTNER pre pasívny príjem">
                          {t('dotaciaFormTypeGrantOption2')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={formData.dom_id} onValueChange={(value) => setFormData({ ...formData, dom_id: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 h-auto">
                        <SelectValue placeholder={t('dotaciaFormHousePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {houses?.map((dom) => {
                          const dotacia = Math.round(dom.zakladna_cena * 0.05);
                          return (
                            <SelectItem key={dom.id} value={dom.id}>
                              {dom.nazov} - {dom.zastavana_plocha} m² - {dotacia.toLocaleString()} €
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('dotaciaFormFinancing')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 h-auto">
                        <SelectValue placeholder={t('dotaciaFormFinancingPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hotovosť">{t('dotaciaFormFinancingOption1')}</SelectItem>
                        <SelectItem value="Úver - vybavujem si sám">{t('dotaciaFormFinancingOption2')}</SelectItem>
                        <SelectItem value="Úver vybavte mi">3. Vyberte mi najlepší úver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder={t('dotaciaFormLocationPlaceholder')}
                      value={formData.lokalita}
                      onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                      required
                      className="text-base p-4 font-sans bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    />
                    <p className="text-xs text-red-600 mt-1 font-sans font-semibold">
                      {t('dotaciaFormLocationRequired')}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-secondary text-white font-sans font-bold py-6 text-lg shadow-lg"
                  >
                    {isSubmitting ? t('dotaciaFormSubmitting') : t('dotaciaFormSubmit')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
                <p className="text-xs text-gray-600 mt-4 font-sans">
                  {t('dotaciaFormNote')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEKCIA: PROCES ČERPANIA DOTÁCIE */}
      <section id="proces-section" className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
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
                  {t('dotaciaProcessOfficial')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
                {t('dotaciaProcessTitle')}
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
              <Card className="p-8 bg-white border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep1')}
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  {t('dotaciaProcessStep1Title')}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  {t('dotaciaProcessStep1Desc')}
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep2')}
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  {t('dotaciaProcessStep2Title')}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  {t('dotaciaProcessStep2Desc')}
                </p>
              </Card>

              <Card className="p-8 bg-white border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep3')}
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                  {t('dotaciaProcessStep3Title')}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-success">
                    <p className="text-sm font-bold text-success mb-2">🏡 {t('dotaciaProcessBenefitRodinaTitle')}</p>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans mb-3">
                      {t('dotaciaProcessBenefitRodinaDesc')}
                    </p>
                    <div className="bg-white/80 p-3 rounded border border-success/30">
                      <p className="text-xs font-bold text-success mb-1">✨ {t('dotaciaBonusNote')}</p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {t('dotaciaBonusRealHelp')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
                    <p className="text-sm font-bold text-yellow-700 mb-2">📈 {t('dotaciaProcessBenefitInvestorTitle')}</p>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans">
                      {t('dotaciaProcessBenefitInvestorDesc')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* GRAFICKÉ ZNÁZORNENIE DOTÁCIE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
                {t('dotaciaVisualizationTitle')}
              </h2>
              <p className="text-base sm:text-xl text-gray-700 font-sans">
                {t('dotaciaVisualizationSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* PROGRAM AMBASSADOR */}
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300">
                <div className="text-center mb-6">
                  <div className="inline-block bg-success text-white px-4 py-2 rounded-lg text-sm font-bold mb-2">
                    {t('dotaciaVisualizationAmbassador')}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">{t('dotaciaVisualizationAmbassadorSubtitle')}</h3>
                </div>

                {/* Vizualizácia */}
                <div className="space-y-4">
                  {/* Cenníková hodnota */}
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-gray-800">100%</p>
                    </div>
                  </div>

                  {/* Dotácia */}
                  <div className="bg-success/10 p-4 rounded-lg border-2 border-success">
                    <p className="text-sm text-success font-bold mb-2">✅ {t('dotaciaGrant')}</p>
                    <div className="h-12 bg-success rounded flex items-center justify-center">
                      <p className="text-sm font-bold text-white text-center px-2">{t('dotaciaGrantNote')}</p>
                    </div>
                    <p className="text-xs text-success font-semibold mt-2 text-center">{t('dotaciaGrantAmount')}</p>
                  </div>

                  {/* Váš doplatok */}
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                    <p className="text-sm text-primary font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-primary rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>

                  {/* Bonusy */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-2 border-yellow-400">
                    <p className="text-sm text-yellow-800 font-bold mb-3">🎁 {t('dotaciaBonusTitle')}</p>
                    <ul className="space-y-2 text-xs text-yellow-900 mb-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                        <span>{t('dotaciaBonusEnergy')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                        <span>{t('dotaciaBonusGrant')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                        <span>{t('dotaciaBonusRef')}</span>
                      </li>
                    </ul>
                    <div className="bg-white/80 p-3 rounded border border-success/30">
                      <p className="text-xs font-bold text-success mb-1">✨ {t('dotaciaBonusNote')}</p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {t('dotaciaBonusRealHelp')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* PROGRAM INVESTOR & PARTNER */}
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400">
                <div className="text-center mb-6">
                  <div className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold mb-2">
                    {t('dotaciaVisualizationInvestor')}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">{t('dotaciaVisualizationInvestorSubtitle')}</h3>
                </div>

                {/* Vizualizácia */}
                <div className="space-y-4">
                  {/* Cenníková hodnota */}
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-gray-800">100%</p>
                    </div>
                  </div>

                  {/* Dotácia */}
                  <div className="bg-yellow-600/10 p-4 rounded-lg border-2 border-yellow-600">
                    <p className="text-sm text-yellow-800 font-bold mb-2">✅ {t('dotaciaGrant')}</p>
                    <div className="h-12 bg-yellow-600 rounded flex items-center justify-center">
                      <p className="text-sm font-bold text-white text-center px-2">{t('dotaciaGrantNote')}</p>
                    </div>
                    <p className="text-xs text-yellow-800 font-semibold mt-2 text-center">{t('dotaciaGrantAmount')}</p>
                  </div>

                  {/* Váš doplatok */}
                  <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-400">
                    <p className="text-sm text-orange-800 font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-orange-500 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>

                  {/* Bonusy */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-400">
                    <p className="text-sm text-green-800 font-bold mb-3">🎁 {t('dotaciaInvestorBonusTitle')}</p>
                    <ul className="space-y-2 text-xs text-green-900">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{t('dotaciaInvestorBonusMarketing')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{t('dotaciaInvestorBonusMap')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{t('dotaciaInvestorBonusIncome')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUKTOVÁ SEKCIA */}
      <section className="py-10 sm:py-16 md:py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              {t('dotaciaProductsTitle')}
            </h2>
            <p className="text-base sm:text-xl text-gray-700 font-sans">
              {t('dotaciaProductsSubtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {houses
              ?.sort((a, b) => (b.zakladna_cena || 0) - (a.zakladna_cena || 0))
              ?.map((dom) => {
                  const cennikova = dom.zakladna_cena;
                  const dotacia = cennikova ? Math.round(cennikova * 0.05) : 0;

                  return (
                    <motion.div
                      key={dom.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Card className="overflow-hidden hover:shadow-2xl transition-all border-2 border-emerald-200">
                        <div className="grid grid-cols-2 gap-2">
                          <img 
                            src={dom.hlavny_obrazok} 
                            alt={dom.nazov}
                            className="w-full h-64 object-cover"
                          />
                          {dom.zakladna_konfiguracia_obrazok && (
                            <img 
                              src={dom.zakladna_konfiguracia_obrazok} 
                              alt={`${dom.nazov} - Základná konfigurácia`}
                              className="w-full h-64 object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-emerald-50">
                          <h3 className="text-base sm:text-xl font-serif font-bold text-gray-900 mb-4">{dom.nazov} - {t('dotaciaEdition2026')}</h3>

                          <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 mb-4 font-sans">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                              <span className="text-xs sm:text-sm text-gray-500">{t('dotaciaCatalogPrice')}:</span>
                              <span className="text-sm sm:text-base font-bold text-gray-900">{cennikova?.toLocaleString()} €</span>
                            </div>
                            <div className="mb-3 pb-3 border-b">
                              <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase">
                                {t('dotaciaGrant')}
                              </p>
                              <p className="text-xs text-gray-600 mb-2">{t('dotaciaGrantAmount')}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-gray-600">{t('dotaciaGrantForModel')}</span>
                                <span className="text-lg sm:text-2xl font-bold text-success">{dotacia?.toLocaleString()} €</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-primary">{t('dotaciaYourPayment')}:</span>
                              <span className="text-base sm:text-xl font-bold text-primary">{(cennikova - dotacia)?.toLocaleString()} €</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 p-4 mb-4 rounded-lg">
                            <p className="text-xs sm:text-sm font-sans font-bold text-gray-800 mb-3">
                              {t('dotaciaSelectProgram')}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-success text-lg">🏡</span>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-success">{t('dotaciaAmbassador')}</p>
                                  <p className="text-xs text-gray-700">{t('dotaciaGrant')} {dotacia?.toLocaleString()} € + {t('dotaciaBonusEnergy')}</p>
                                  <p className="text-xs text-success font-semibold mt-1">✨ {t('dotaciaBonusNote')}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-yellow-600 text-lg">📈</span>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-yellow-700">{t('dotaciaInvestor')}</p>
                                  <p className="text-xs text-gray-700">{t('dotaciaGrant')} {dotacia?.toLocaleString()} € + {t('dotaciaInvestorBonusMarketing')}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Link to={createPageUrl(`DetailDomu?id=${dom.id}`)}>
                            <Button className="w-full bg-primary hover:bg-secondary text-white font-sans font-semibold" size="lg">
                              {t('dotaciaViewDetail')}
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

      {/* PÄTIČKA */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif font-bold mb-2">
            {t('dotaciaFooterTitle')}
          </p>
          <p className="text-gray-400 text-sm mb-6 font-sans">
            {t('dotaciaFooterSubtitle')}
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-500 text-xs max-w-3xl mx-auto font-sans leading-relaxed">
              ⚖️ {t('dotaciaLegalNotice')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}