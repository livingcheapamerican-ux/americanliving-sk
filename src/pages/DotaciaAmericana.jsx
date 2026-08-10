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
import DotaciaBackgroundVideo from "../components/dotacia/DotaciaBackgroundVideo";


const dotaciaLocalT = {
  sk: {
    selectBestLoan: "{dt.selectBestLoan}",
    successSent: "{dt.successSent}",
    successEmailConfirm: "{dt.successEmailConfirm}",
    selectedHouse: "{dt.selectedHouse}",
    dotaciaLabel: "{dt.dotaciaLabel}",
    ourContacts: "{dt.ourContacts}",
    cash: "{dt.cash}",
    loanSelf: "{dt.loanSelf}",
    photoManagerAmbassador: "🏡 {dt.photoManagerAmbassador}",
    photoManagerPartner: "📈 {dt.photoManagerPartner}",
    uploading: "{dt.uploading}",
    uploadPhotos: "{dt.uploadPhotos}"
  },
  en: {
    selectBestLoan: "3. Choose the best loan for me",
    successSent: "Application successfully sent!",
    successEmailConfirm: "We have sent a confirmation to your email. We will contact you in the coming days.",
    selectedHouse: "Your selected house",
    dotaciaLabel: "Grant:",
    ourContacts: "Our contacts",
    cash: "Cash",
    loanSelf: "Mortgage - self-arranged",
    photoManagerAmbassador: "🏡 Manage Photos - Ambassador Program",
    photoManagerPartner: "📈 Manage Photos - Partner Program",
    uploading: "Uploading...",
    uploadPhotos: "Upload new photos"
  }
};

export default function DotaciaAmericana() {
  const { t, language } = useLanguage();
  const dt = dotaciaLocalT[language] || dotaciaLocalT.sk;

  const energodotaciaTranslations = {
    sk: { title: "ENERGODOTÁCIA pre existujúcich majiteľov", ambassador: "Kúpili ste Ticabhouse dom priamo od výrobcu alebo iného predajcu? Aj vy máte šancu získať Energodotáciu! Stačí sa s nami skontaktovať.", investor: "Vlastníte Ticabhouse dom kúpený kdekoľvek? Zaraďte ho do programu INVESTOR & PARTNER a získajte Energodotáciu!" },
    en: { title: "ENERGY GRANT for existing owners", ambassador: "Did you buy a Ticabhouse home directly from the manufacturer or another dealer? You too have a chance to get the Energy Grant! Just contact us.", investor: "Do you own a Ticabhouse home bought anywhere? Add it to the INVESTOR & PARTNER program and get the Energy Grant!" },
    de: { title: "ENERGIEFÖRDERUNG für bestehende Eigentümer", ambassador: "Haben Sie ein Ticabhouse-Haus direkt vom Hersteller oder einem anderen Händler gekauft? Auch Sie haben eine Chance, die Energieförderung zu erhalten! Kontaktieren Sie uns einfach.", investor: "Besitzen Sie ein irgendwo gekauftes Ticabhouse-Haus? Nehmen Sie es in das INVESTOR & PARTNER-Programm auf und erhalten Sie die Energieförderung!" },
    fr: { title: "SUBVENTION ÉNERGÉTIQUE pour les propriétaires existants", ambassador: "Avez-vous acheté une maison Ticabhouse directement chez le fabricant ou un autre revendeur? Vous avez aussi la chance d'obtenir la Subvention Énergétique! Contactez-nous simplement.", investor: "Possédez-vous une maison Ticabhouse achetée n'importe où? Inscrivez-la dans le programme INVESTOR & PARTNER et obtenez la Subvention Énergétique!" },
    hu: { title: "ENERGIATÁMOGATÁS meglévő tulajdonosoknak", ambassador: "Ticabhouse otthont vásárolt közvetlenül a gyártótól vagy más viszonteladótól? Önnek is lehetősége van Energiatámogatást kapni! Csak lépjen kapcsolatba velünk.", investor: "Bárhol vásárolt Ticabhouse otthona van? Adja hozzá az INVESTOR & PARTNER programhoz és kapja meg az Energiatámogatást!" },
    pl: { title: "DOTACJA ENERGETYCZNA dla istniejących właścicieli", ambassador: "Kupiłeś dom Ticabhouse bezpośrednio od producenta lub innego sprzedawcy? Ty też masz szansę na Dotację Energetyczną! Skontaktuj się z nami.", investor: "Masz dom Ticabhouse kupiony gdziekolwiek? Dołącz go do programu INVESTOR & PARTNER i uzyskaj Dotację Energetyczną!" },
    uk: { title: "ЕНЕРГЕТИЧНА ДОТАЦІЯ для існуючих власників", ambassador: "Придбали будинок Ticabhouse безпосередньо у виробника або іншого продавця? Ви також маєте шанс отримати Енергетичну дотацію! Просто зв'яжіться з нами.", investor: "Маєте будинок Ticabhouse, куплений будь-де? Додайте його до програми INVESTOR & PARTNER та отримайте Енергетичну дотацію!" },
    sr: { title: "ЕНЕРГЕТСКА ДОТАЦИЈА за постојеће власнике", ambassador: "Купили сте Ticabhouse дом директно од произвођача или другог продавца? И ви имате шансу да добијете Енергетску дотацију! Само нас контактирајте.", investor: "Поседујете Ticabhouse дом купљен где год? Укључите га у програм INVESTOR & PARTNER и добијте Енергетску дотацију!" },
    hr: { title: "ENERGETSKA DOTACIJA za postojeće vlasnike", ambassador: "Kupili ste Ticabhouse dom izravno od proizvođača ili drugog prodavača? I vi imate šansu dobiti Energetsku dotaciju! Samo nas kontaktirajte.", investor: "Posjedujete Ticabhouse dom kupljen bilo gdje? Dodajte ga u program INVESTOR & PARTNER i dobijte Energetsku dotaciju!" },
    el: { title: "ΕΝΕΡΓΕΙΑΚΗ ΕΠΙΔΟΤΗΣΗ για υπάρχοντες ιδιοκτήτες", ambassador: "Αγοράσατε σπίτι Ticabhouse απευθείας από τον κατασκευαστή ή άλλο πωλητή; Κι εσείς έχετε την ευκαιρία να λάβετε την Ενεργειακή Επιδότηση! Απλώς επικοινωνήστε μαζί μας.", investor: "Έχετε σπίτι Ticabhouse αγορασμένο οπουδήποτε; Προσθέστε το στο πρόγραμμα INVESTOR & PARTNER και λάβετε την Ενεργειακή Επιδότηση!" },
  };
  const energoT = energodotaciaTranslations[language] || energodotaciaTranslations.sk;
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

  // Interval slideshow disabled to ensure 100% butter smooth performance

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
    <div className="min-h-screen relative text-white">
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

        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        .border-success { border-color: #059669; }
        .text-success { color: #10B981; }
        .bg-success { background-color: #059669; }

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

      {/* Full-width Fixed Video Background – striedanie 6 videí (rodiny + investori) */}
      <DotaciaBackgroundVideo />

      {/* HERO SECTION - Súkromná Dotácia AMERICANA */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden text-white z-10 min-h-screen">
        {/* Top Header Banner */}
        <div className="container mx-auto px-4 mb-10 text-center max-w-4xl relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-xs sm:text-sm font-black uppercase tracking-wider text-[#E2C799] mb-4 shadow-lg backdrop-blur-md">
            <Gift className="w-4 h-4 text-[#E2C799]" />
            <span>SÚKROMNÁ DOTÁCIA AMERICANA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            Získajte finančnú dotáciu až do <span className="text-[#E2C799]">15 000 €</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Priamy finančný príspevok na energetickú certifikáciu A0, terénne prípravy a prevádzku vášho rodinného alebo investičného domu. Bez zdĺhavej štátnej byrokracie.
          </p>
        </div>

        {/* 2 Program Cards (AMBASSADOR & PARTNER) */}
        <div className="container mx-auto px-4 max-w-6xl relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* AMBASSADOR CARD (Rodina) */}
            <Card className="p-6 sm:p-8 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 text-white rounded-3xl shadow-2xl flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
              <div>
                {/* Animated Photo Container */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-emerald-500/30">
                  <motion.img
                    src={heroSettings?.rodina_fotky?.[0] || "https://images.unsplash.com/photo-1560518883-ff514cd811de?w=1000&q=80"}
                    alt="Rodinný modulárny dom American Living"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-emerald-500/25 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Program AMBASSADOR • Pre Rodiny</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-extrabold text-white">Program AMBASSADOR</h2>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Až 15 000 €
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-400 font-bold mb-3">
                  {t('dotaciaHeroLeftSubtitle') || "Dotácia na rodinné bývanie pre mladé rodiny aj seniorov"}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {t('dotaciaHeroLeftDesc') || "Získajte nenávratný finančný príspevok na certifikáciu energetickej triedy A0, fotovoltiku a terénne prípravy rodinného domu."}
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-2.5 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-emerald-200">Príspevok na energetický štandard A0</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-emerald-200">Priamy odpočet z ceny bez byrokracie</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setModalType('rodina')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Požiadať o rodinnú dotáciu</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>

            {/* PARTNER CARD (Investor) */}
            <Card className="p-6 sm:p-8 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 text-white rounded-3xl shadow-2xl flex flex-col justify-between hover:border-amber-500/60 transition-all group">
              <div>
                {/* Animated Photo Container */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-amber-500/30">
                  <motion.img
                    src={heroSettings?.investor_fotky?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80"}
                    alt="Investičný modulárny dom American Living"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-amber-500/25 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Program PARTNER • Pre Investorov</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-extrabold text-white">Program PARTNER</h2>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Investičný stimul
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-400 font-bold mb-3">
                  {t('dotaciaHeroRightSubtitle') || "Dotovaný rozvoj investičných nehnuteľností a prenájmu"}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {t('dotaciaHeroRightDesc') || "Investujte do modulárneho domu na prenájom. Získajte garanciu výnosu a priamy príspevok na vybavenie nehnuteľnosti."}
                </p>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-2.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-200">Garancia výnosu z krátkodobého prenájmu</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-200">Kompletná spravovateľská podpora American Living</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setModalType('investor')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold py-3 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Žiadosť o investičný stimul</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>

          </div>
        </div>
      </section>

      {/* 4 KROKY - Ako funguje Dotácia AMERICANA */}
      <section className="py-16 text-white relative z-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 drop-shadow-lg">
              Ako funguje uplatnenie Dotácie AMERICANA?
            </h2>
            <p className="text-sm sm:text-base text-slate-200 drop-shadow-md">
              Jednoduchý 4-krokový proces bez zbytočného papierovania a čakacích lehôt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative shadow-xl">
              <span className="text-4xl font-black text-[#C5A880] mb-3 block">01</span>
              <h3 className="text-lg font-bold mb-2 text-white">Výber domu</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vyberte si ľubovoľný montovaný alebo modulárny dom z nášho katalógu.
              </p>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative shadow-xl">
              <span className="text-4xl font-black text-[#C5A880] mb-3 block">02</span>
              <h3 className="text-lg font-bold mb-2 text-white">Overenie nároku</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vyplňte krátky online formulár – nárok vyhodnotíme do 24 hodín.
              </p>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative shadow-xl">
              <span className="text-4xl font-black text-[#C5A880] mb-3 block">03</span>
              <h3 className="text-lg font-bold mb-2 text-white">Odpočet z ceny</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suma dotácie (až 15 000 €) sa započíta priamo do vašej zmluvy a rozpočtu.
              </p>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative shadow-xl">
              <span className="text-4xl font-black text-[#C5A880] mb-3 block">04</span>
              <h3 className="text-lg font-bold mb-2 text-white">Rýchle nasťahovanie</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stavbu vám odovzdáme v rozmedzí od 6 do 12 týždňov na kľúč.
              </p>
            </div>
          </div>
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
                      <div className="absolute top-2 left-2 z-10 bg-slate-900/90 rounded px-2 py-1 text-xs font-bold">
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
                <Alert className="bg-emerald-500/10 border-emerald-500">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <AlertDescription className="text-emerald-400 font-semibold">
                    Potvrdenie sme Vám zaslali na email. Budeme Vás kontaktovať v najbližších dňoch.
                  </AlertDescription>
                </Alert>

                {successData.house && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Váš vybraný dom</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <img 
                        src={successData.house.hlavny_obrazok} 
                        alt={`${successData.house.nazov} - vybraný dom s dotáciou American Living`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {successData.house.zakladna_konfiguracia_obrazok && (
                        <img 
                          src={successData.house.zakladna_konfiguracia_obrazok} 
                          alt={`${successData.house.nazov} - základná konfigurácia`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border-2 border-emerald-300">
                      <p className="text-lg font-bold text-emerald-900 mb-2">{successData.house.nazov}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-emerald-700">Dotácia:</span>
                        <span className="text-2xl font-bold text-emerald-600">{successData.dotacia?.toLocaleString()} €</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-foreground mb-4">📞 Naše kontakty</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-500" />
                      <a href="tel:+421905138124" className="text-emerald-500 font-semibold hover:underline">
                        +421 905 138 124
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <a href="mailto:info@americanliving.sk" className="text-emerald-500 font-semibold hover:underline">
                        info@americanliving.sk
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-emerald-500" />
                      <a href="https://americanliving.sk" target="_blank" rel="noopener noreferrer" className="text-emerald-500 font-semibold hover:underline">
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl w-full max-w-lg sm:max-w-xl md:max-w-2xl shadow-2xl z-[100]"
            >
              <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <DialogTitle className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight pr-6">
                  {modalType === 'rodina' ? '🏡 Žiadosť o Dotáciu AMERICANA - Pre rodiny' : '📈 Žiadosť o Dotáciu AMERICANA - Pre investorov'}
                </DialogTitle>
              </DialogHeader>

              {/* Benefits strip */}
              <div className="my-4 p-3.5 bg-emerald-500/15 border-l-4 border-emerald-500 rounded-xl">
                <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {modalType === 'rodina' 
                    ? '✅ Priamy odpočet dotácie z ceny domu bez zbytočnej štátnej byrokracie.'
                    : '✅ Investičná podpora pre pasívny príjem a správa nehnuteľnosti.'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">{t('dotaciaFormName')}</label>
                  <Input
                    type="text"
                    placeholder={t('dotaciaFormNamePlaceholder')}
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium rounded-xl px-4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    Typ Dotácie AMERICANA <span className="text-red-600">*</span>
                  </label>
                  <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                    <SelectTrigger className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl px-4">
                      <SelectValue placeholder={t('dotaciaFormTypeGrantPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectItem value="Program AMBASSADOR - Dotované bývanie pre rodiny">
                        Program AMBASSADOR - Dotované bývanie pre rodiny
                      </SelectItem>
                      <SelectItem value="Program INVESTOR & PARTNER pre pasívny príjem">
                        Program PARTNER - Investičný stimul pre pasívny príjem
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">{t('dotaciaFormHouse')}</label>
                  <Select value={formData.dom_id} onValueChange={(value) => setFormData({ ...formData, dom_id: value })}>
                    <SelectTrigger className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl px-4">
                      <SelectValue placeholder={t('dotaciaFormHousePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      {houses?.map((dom) => {
                        const dotacia = Math.round(dom.zakladna_cena * 0.05);
                        return (
                          <SelectItem key={dom.id} value={dom.id}>
                            {dom.nazov} – Dotácia {dotacia.toLocaleString()} €
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                    {t('dotaciaFormFinancing')} <span className="text-red-600">*</span>
                  </label>
                  <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                    <SelectTrigger className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl px-4">
                      <SelectValue placeholder={t('dotaciaFormFinancingPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectItem value="Hotovosť">Vlastná hotovosť</SelectItem>
                      <SelectItem value="Úver - vybavujem si sám">Hypotéka / Úver (vlastné vybavenie)</SelectItem>
                      <SelectItem value="Úver vybavte mi">Hypotéka na kľúč (vybavte za mňa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {modalType === 'rodina' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
                      Lokalita pozemku / stavby <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Napr. Trnava, Žilina, Nitra..."
                      value={formData.lokalita}
                      onChange={(e) => setFormData({ ...formData, lokalita: e.target.value })}
                      required
                      className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium rounded-xl px-4"
                    />
                  </div>
                )}

                {modalType === 'investor' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">Plánovaný rozpočet (€)</label>
                    <Input
                      type="text"
                      placeholder="Napr. 80 000 €"
                      value={formData.rozpocet}
                      onChange={(e) => setFormData({ ...formData, rozpocet: e.target.value })}
                      className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium rounded-xl px-4"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">Váš E-mail <span className="text-red-600">*</span></label>
                  <Input
                    type="email"
                    placeholder="jan.novak@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium rounded-xl px-4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">Telefónne číslo <span className="text-red-600">*</span></label>
                  <Input
                    type="tel"
                    placeholder="+421 9XX XXX XXX"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-sm h-11 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium rounded-xl px-4"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-bold py-3.5 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Odosielam žiadosť..." : "Odoslať žiadosť o Dotáciu AMERICANA"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* SEKCIA: CTA - ŽIADOSŤ O DOTÁCIU */}
      <section id="cta-section" className="py-10 sm:py-16 md:py-20 text-white relative z-20">
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
              <div className="bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-2xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-4 sm:mb-6 text-white" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.9)' }}>
                  {t('dotaciaProcessTitle')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {/* Pre rodiny */}
                  <div className="bg-slate-900/85 rounded-xl p-5 shadow-xl border border-emerald-500/25">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-emerald-400">{t('dotaciaHeroLeftSubtitle')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaGrant')}</strong> {t('dotaciaGrantNote')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaBonusEnergy')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{t('dotaciaBonusRef')}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Pre investorov */}
                  <div className="bg-slate-900/85 rounded-xl p-5 shadow-xl border border-amber-500/25">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-yellow-400">{t('dotaciaHeroRightSubtitle')}</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaGrant')}</strong> {t('dotaciaGrantNote')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span><strong>{t('dotaciaInvestorBonusMarketing')}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{t('dotaciaInvestorBonusIncome')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl border border-white/10 shadow-2xl">
                <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#E2C799] mb-4 sm:mb-6">
                  {t('dotaciaFormSubmit')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <Input
                    type="text"
                    placeholder={t('dotaciaFormNamePlaceholder')}
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 min-h-[48px]"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 min-h-[48px]"
                  />
                  <Input
                    type="tel"
                    placeholder={t('phone')}
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 min-h-[48px]"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t('dotaciaFormTypeGrant')} <span className="text-red-400">*</span>
                    </label>
                    <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white h-auto min-h-[48px]">
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
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white h-auto min-h-[48px]">
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
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t('dotaciaFormFinancing')} <span className="text-red-400">*</span>
                    </label>
                    <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white h-auto min-h-[48px]">
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
                      className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 min-h-[48px]"
                    />
                    <p className="text-xs text-red-400 mt-1 font-sans font-semibold">
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
                <p className="text-xs text-slate-400 mt-4 font-sans">
                  {t('dotaciaFormNote')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEKCIA: PROCES ČERPANIA DOTÁCIE */}
      <section id="proces-section" className="py-10 sm:py-16 md:py-20 relative z-20">
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
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg mb-6">
                {t('dotaciaProcessTitle')}
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
              <Card className="p-8 bg-slate-900/85 backdrop-blur-md border border-emerald-500/25 hover:shadow-2xl transition-all text-white">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep1')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  {t('dotaciaProcessStep1Title')}
                </h3>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {t('dotaciaProcessStep1Desc')}
                </p>
              </Card>

              <Card className="p-8 bg-slate-900/85 backdrop-blur-md border border-emerald-500/25 hover:shadow-2xl transition-all text-white">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep2')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  {t('dotaciaProcessStep2Title')}
                </h3>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {t('dotaciaProcessStep2Desc')}
                </p>
              </Card>

              <Card className="p-8 bg-slate-900/85 backdrop-blur-md border border-emerald-500/25 hover:shadow-2xl transition-all text-white">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep3')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  {t('dotaciaProcessStep3Title')}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 rounded-lg border-l-4 border-success">
                    <p className="text-sm font-bold text-success mb-2">🏡 {t('dotaciaProcessBenefitRodinaTitle')}</p>
                    <p className="text-slate-300 text-sm leading-relaxed font-sans mb-3">
                      {t('dotaciaProcessBenefitRodinaDesc')}
                    </p>
                    <div className="bg-slate-800/70 p-3 rounded border border-emerald-500/30">
                      <p className="text-xs font-bold text-success mb-1">✨ {t('dotaciaBonusNote')}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {t('dotaciaBonusRealHelp')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-450 mb-2">📈 {t('dotaciaProcessBenefitInvestorTitle')}</p>
                    <p className="text-slate-300 text-sm leading-relaxed font-sans">
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
      <section className="py-20 relative z-20">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg mb-4">
                {t('dotaciaVisualizationTitle')}
              </h2>
              <p className="text-base sm:text-xl text-slate-200 drop-shadow-md font-sans">
                {t('dotaciaVisualizationSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* PROGRAM AMBASSADOR */}
              <Card className="p-6 bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] text-white">
                <div className="text-center mb-6">
                  <div className="inline-block bg-success text-white px-4 py-2 rounded-lg text-sm font-bold mb-2">
                    {t('dotaciaVisualizationAmbassador')}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">{t('dotaciaVisualizationAmbassadorSubtitle')}</h3>
                </div>

                {/* Vizualizácia */}
                <div className="space-y-4">
                  {/* Cenníková hodnota */}
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-slate-300 mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-slate-700 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-slate-200">100%</p>
                    </div>
                  </div>

                  {/* Dotácia */}
                  <div className="bg-emerald-500/20 p-4 rounded-lg border border-emerald-500/50">
                    <p className="text-sm text-success font-bold mb-2">✅ {t('dotaciaGrant')}</p>
                    <div className="h-12 bg-success rounded flex items-center justify-center">
                      <p className="text-sm font-bold text-white text-center px-2">{t('dotaciaGrantNote')}</p>
                    </div>
                    <p className="text-xs text-success font-semibold mt-2 text-center">{t('dotaciaGrantAmount')}</p>
                  </div>

                  {/* Váš doplatok */}
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-[#E2C799] font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-primary rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>

                  {/* Bonusy */}
                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                    <p className="text-sm text-yellow-500 font-bold mb-3">🎁 {t('dotaciaBonusTitle')}</p>
                    <ul className="space-y-2 text-xs text-yellow-600 dark:text-yellow-400 mb-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                        <span>{t('dotaciaBonusEnergy')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                        <span>{t('dotaciaBonusGrant')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                        <span>{t('dotaciaBonusRef')}</span>
                      </li>
                    </ul>
                    <div className="bg-slate-800/70 p-3 rounded border border-emerald-500/30">
                      <p className="text-xs font-bold text-success mb-1">✨ {t('dotaciaBonusNote')}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {t('dotaciaBonusRealHelp')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* PROGRAM INVESTOR & PARTNER */}
              <Card className="p-6 bg-slate-900/85 backdrop-blur-md border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] text-white">
                <div className="text-center mb-6">
                  <div className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold mb-2">
                    {t('dotaciaVisualizationInvestor')}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">{t('dotaciaVisualizationInvestorSubtitle')}</h3>
                </div>

                {/* Vizualizácia */}
                <div className="space-y-4">
                  {/* Cenníková hodnota */}
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-slate-300 mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-slate-700 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-slate-200">100%</p>
                    </div>
                  </div>

                  {/* Dotácia */}
                  <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/50">
                    <p className="text-sm text-yellow-400 font-bold mb-2">✅ {t('dotaciaGrant')}</p>
                    <div className="h-12 bg-yellow-600 rounded flex items-center justify-center">
                      <p className="text-sm font-bold text-white text-center px-2">{t('dotaciaGrantNote')}</p>
                    </div>
                    <p className="text-xs text-yellow-400 font-semibold mt-2 text-center">{t('dotaciaGrantAmount')}</p>
                  </div>

                  {/* Váš doplatok */}
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-orange-400 font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-orange-500 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>

                  {/* Bonusy */}
                  <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/30">
                    <p className="text-sm text-emerald-400 font-bold mb-3">🎁 {t('dotaciaInvestorBonusTitle')}</p>
                    <ul className="space-y-2 text-xs text-emerald-400">
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
      <section className="py-10 sm:py-16 md:py-20 bg-background border-t border-border relative z-20 text-foreground">
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
            <p className="text-base sm:text-xl text-muted-foreground font-sans">
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
                      <Card className="overflow-hidden hover:shadow-2xl transition-all border border-border bg-card">
                        <div className="grid grid-cols-2 gap-2">
                          <img 
                            src={dom.hlavny_obrazok} 
                            alt={`${dom.nazov} - modulárny dom s dotáciou American Living`}
                            className="w-full h-64 object-cover"
                          />
                          {dom.zakladna_konfiguracia_obrazok && (
                            <img 
                              src={dom.zakladna_konfiguracia_obrazok} 
                              alt={`${dom.nazov} - základná konfigurácia interiéru`}
                              className="w-full h-64 object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4 sm:p-6 bg-card">
                          <h3 className="text-base sm:text-xl font-serif font-bold text-white mb-4">{dom.nazov} - {t('dotaciaEdition2026')}</h3>

                          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4 font-sans">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                              <span className="text-xs sm:text-sm text-muted-foreground">{t('dotaciaCatalogPrice')}:</span>
                              <span className="text-sm sm:text-base font-bold text-foreground">{cennikova?.toLocaleString()} €</span>
                            </div>
                            <div className="mb-3 pb-3 border-b">
                              <p className="text-xs sm:text-sm font-bold text-foreground mb-2 uppercase">
                                {t('dotaciaGrant')}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">{t('dotaciaGrantAmount')}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-muted-foreground">{t('dotaciaGrantForModel')}</span>
                                <span className="text-lg sm:text-2xl font-bold text-success">{dotacia?.toLocaleString()} €</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-primary">{t('dotaciaYourPayment')}:</span>
                              <span className="text-base sm:text-xl font-bold text-primary">{(cennikova - dotacia)?.toLocaleString()} €</span>
                            </div>
                          </div>

                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 mb-4 rounded-lg">
                            <p className="text-xs sm:text-sm font-sans font-bold text-foreground/80 mb-3">
                              {t('dotaciaSelectProgram')}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-success text-lg">🏡</span>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-success">{t('dotaciaAmbassador')}</p>
                                  <p className="text-xs text-muted-foreground">{t('dotaciaGrant')} {dotacia?.toLocaleString()} € + {t('dotaciaBonusEnergy')}</p>
                                  <p className="text-xs text-success font-semibold mt-1">✨ {t('dotaciaBonusNote')}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-yellow-500 text-lg">📈</span>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-yellow-400">{t('dotaciaInvestor')}</p>
                                  <p className="text-xs text-muted-foreground">{t('dotaciaGrant')} {dotacia?.toLocaleString()} € + {t('dotaciaInvestorBonusMarketing')}</p>
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
      <footer className="py-12 bg-card text-foreground border-t border-border relative z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif font-bold mb-2">
            {t('dotaciaFooterTitle')}
          </p>
          <p className="text-muted-foreground text-sm mb-6 font-sans">
            {t('dotaciaFooterSubtitle')}
          </p>
          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground text-xs max-w-3xl mx-auto font-sans leading-relaxed">
              ⚖️ {t('dotaciaLegalNotice')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}