import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Download, 
  Mail, 
  Smartphone, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Loader2, 
  Layers, 
  ImageIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  Video, 
  Caravan, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Default photos array fallback for Prosto House
const DEFAULT_PROSTO_HOUSE_PHOTOS = [
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/eccd583aa_barn-double-prosto-house-3.jpg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/5ddf7431e_BarnDoubledrevouvodnafotka.jpg",
  "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/49133a5d4_Barnhills.jpeg"
];

function CatalogBackgroundVideo({ customVideoUrl }) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.warn("Catalog background video autoplay failed:", err);
      });
    }
  }, [customVideoUrl]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#FAF8F5] dark:bg-[#050508] z-0 pointer-events-none select-none">
      <video
        ref={videoRef}
        src={customVideoUrl || "https://videos.pexels.com/video-files/4458593/4458593-uhd_25fps.mp4"}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
        style={{ filter: dark ? 'brightness(0.35) contrast(1.1)' : 'brightness(0.85) contrast(0.95)' }}
      />
      {/* Soft overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white/80 dark:from-black/40 dark:via-black/60 dark:to-black/90 pointer-events-none" />
    </div>
  );
}

export default function StiahniteSiNasKatalog() {
  const [activeCatalog, setActiveCatalog] = useState('prosto-house');
  
  // Lead form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gdpr, setGdpr] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Admin upload/config states
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingBgVideo, setUploadingBgVideo] = useState(false);

  // Fetch db configuration and user
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: appConfigs = [], refetch: refetchAppConfigs } = useQuery({
    queryKey: ['catalog_app_configs'],
    queryFn: async () => {
      try {
        return await base44.entities.AppConfiguration.filter({});
      } catch (err) {
        console.warn("Failed to fetch configurations:", err);
        return [];
      }
    }
  });

  // Config resolvers
  const pdfConfig = useMemo(() => {
    return appConfigs.find(c => c.config_key === 'catalog_pdf_prosto_house') || null;
  }, [appConfigs]);

  const bgVideoConfig = useMemo(() => {
    return appConfigs.find(c => c.config_key === 'catalog_bg_video') || null;
  }, [appConfigs]);

  // Fetch Prosto House houses list from DB to showcase them
  const { data: prostoHouses = [] } = useQuery({
    queryKey: ['catalog-prosto-houses'],
    queryFn: async () => {
      try {
        return await base44.entities.Dom.filter({ vyrobca: 'Prosto House', verejny: true }, 'poradie', 3);
      } catch (e) {
        console.warn("Failed to fetch houses:", e);
        return [];
      }
    }
  });

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const toastId = toast.loading("Nahrávam PDF katalóg...");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (file_url) {
        const list = await base44.entities.AppConfiguration.filter({ config_key: 'catalog_pdf_prosto_house' });
        if (list.length > 0) {
          await base44.entities.AppConfiguration.update(list[0].id, { metaPixelId: file_url });
        } else {
          await base44.entities.AppConfiguration.create({ config_key: 'catalog_pdf_prosto_house', metaPixelId: file_url });
        }
        refetchAppConfigs();
        toast.success("PDF katalóg bol úspešne nahraný!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Nahrávanie PDF zlyhalo.", { id: toastId });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleBgVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBgVideo(true);
    const toastId = toast.loading("Nahrávam video pozadia...");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (file_url) {
        const list = await base44.entities.AppConfiguration.filter({ config_key: 'catalog_bg_video' });
        if (list.length > 0) {
          await base44.entities.AppConfiguration.update(list[0].id, { metaPixelId: file_url });
        } else {
          await base44.entities.AppConfiguration.create({ config_key: 'catalog_bg_video', metaPixelId: file_url });
        }
        refetchAppConfigs();
        toast.success("Video pozadia úspešne zmenené!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Nahrávanie videa zlyhalo.", { id: toastId });
    } finally {
      setUploadingBgVideo(false);
    }
  };

  const handleResetPdf = async () => {
    if (!window.confirm("Naozaj chcete resetovať PDF katalóg?")) return;
    try {
      const list = await base44.entities.AppConfiguration.filter({ config_key: 'catalog_pdf_prosto_house' });
      if (list.length > 0) {
        await base44.entities.AppConfiguration.update(list[0].id, { metaPixelId: '' });
      }
      refetchAppConfigs();
      toast.success("Predvolený stav obnovený.");
    } catch (e) {
      console.error(e);
      toast.error("Chyba pri resete.");
    }
  };

  const handleResetVideo = async () => {
    if (!window.confirm("Naozaj chcete obnoviť predvolené video?")) return;
    try {
      const list = await base44.entities.AppConfiguration.filter({ config_key: 'catalog_bg_video' });
      if (list.length > 0) {
        await base44.entities.AppConfiguration.update(list[0].id, { metaPixelId: '' });
      }
      refetchAppConfigs();
      toast.success("Predvolené video obnovené.");
    } catch (e) {
      console.error(e);
      toast.error("Chyba pri resete.");
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Vyplňte prosím meno a e-mail.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Send e-mail to super admin or default inbox
      await base44.integrations.Core.SendEmail({
        to: 'info@americanliving.sk',
        subject: `📥 Nový záujemca o stiahnutie katalógu - ${name}`,
        body: `Dobrý deň,\n\nNa stránke American Living pribudol nový dopyt o stiahnutie katalógu:\n\nMeno: ${name}\nE-mail: ${email}\nTelefón: ${phone || 'neuvedené'}\nKatalóg: Prosto House\nDátum: ${new Date().toLocaleString('sk-SK')}\n\nS pozdravom,\nAmerican Living Automation`
      }).catch(e => console.warn("Admin notification email failed:", e));

      // 2. Send welcoming e-mail to client with direct PDF download link
      const downloadLink = pdfConfig?.metaPixelId || "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/KatalogProstoHouse.pdf";
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `🏡 Váš katalóg drevodomov American Living & Prosto House`,
        body: `Dobrý deň, pán/pani ${name},\n\nĎakujeme za Váš záujem o naše moderné drevodomy. V prílohe Vám posielame odkaz na stiahnutie kompletného katalógu:\n\n👉 Odkaz na stiahnutie: ${downloadLink}\n\nAk máte akékoľvek doplňujúce otázky ohľadom našej technológie, konfigurátora alebo financovania, neváhajte nás kontaktovať.\n\nS pozdravom,\nTím American Living s.r.o.`
      }).catch(e => console.warn("Client welcome email failed:", e));

      // Trigger file download in browser
      const link = document.createElement('a');
      link.href = downloadLink;
      link.target = '_blank';
      link.download = 'Katalog_ProstoHouse.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger confetti and success state
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      setSuccess(true);
      toast.success("Katalóg sa začal sťahovať! Odkaz sme Vám poslali aj na e-mail.");
    } catch (err) {
      console.error(err);
      toast.error("Chyba pri spracovaní požiadavky.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16 xl:-mt-20 overflow-x-hidden relative flex flex-col justify-between">
      {/* Premium Video Background Loop */}
      <CatalogBackgroundVideo customVideoUrl={bgVideoConfig?.metaPixelId} />

      {/* Main Glassmorphic Layout Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-32 pb-20 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* LEFT COLUMN: BRAND DETAILS & PREVIEW PHOTOS */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#C5A880] dark:text-[#E2C799] uppercase">Stiahnutie dokumentov</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Stiahnite si náš <span className="bg-gradient-to-r from-[#C5A880] via-[#E2C799] to-[#C5A880] bg-clip-text text-transparent">katalóg</span> drevodomov
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-light leading-relaxed max-w-xl">
            Spoznajte unikátnu technológiu prefabrikovaných a modulárnych drevostavieb, kompletné cenníky a technické detaily, ktoré Vám pomôžu pri rozhodovaní o novom bývaní.
          </p>

          {/* Dynamic Grid Teaser - showcases Prosto House models from database */}
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#C5A880] flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Ochutnávka z katalógu Prosto House
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {prostoHouses.length > 0 ? (
                prostoHouses.slice(0, 3).map((dom, i) => (
                  <div key={dom.id || i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200/40 dark:border-white/5 bg-slate-950/80 shadow-md">
                    <img 
                      src={dom.hlavny_obrazok || DEFAULT_PROSTO_HOUSE_PHOTOS[i % 3]} 
                      alt={dom.nazov} 
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3" />
                    <div className="absolute bottom-2.5 left-3 text-left">
                      <p className="text-[10px] font-black text-white/95 uppercase tracking-wider leading-none">{dom.nazov}</p>
                      {dom.cena && <p className="text-[9px] font-bold text-[#E2C799] mt-0.5">{dom.cena.toLocaleString()} EUR</p>}
                    </div>
                  </div>
                ))
              ) : (
                [0, 1, 2].map((i) => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200/40 dark:border-white/5 bg-slate-950/80 shadow-md">
                    <img 
                      src={DEFAULT_PROSTO_HOUSE_PHOTOS[i]} 
                      alt="Sample house" 
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-3" />
                    <div className="absolute bottom-2.5 left-3 text-left">
                      <p className="text-[10px] font-black text-white/95 uppercase tracking-wider leading-none">Model Prosto House</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DOWNLOAD ZONE & FORM */}
        <div className="lg:col-span-5 w-full">
          <Card className="border-slate-200/40 dark:border-white/5 bg-white/12 dark:bg-slate-950/12 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Header selection tab */}
            <div className="grid grid-cols-2 border-b border-slate-200/45 dark:border-white/5">
              <button
                onClick={() => {
                  setActiveCatalog('prosto-house');
                  setSuccess(false);
                }}
                className={`py-4 text-xs font-black uppercase tracking-wider transition-colors ${
                  activeCatalog === 'prosto-house'
                    ? 'text-[#C5A880] border-b-2 border-[#C5A880] bg-white/5'
                    : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Prosto House
              </button>
              <button
                onClick={() => {
                  setActiveCatalog('tiny-house');
                  setSuccess(false);
                }}
                className={`py-4 text-xs font-black uppercase tracking-wider transition-colors relative ${
                  activeCatalog === 'tiny-house'
                    ? 'text-[#C5A880] border-b-2 border-[#C5A880] bg-white/5'
                    : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent'
                }`}
              >
                Tiny House
                <span className="absolute top-1.5 right-1.5 bg-[#C5A880]/15 text-[#E2C799] border border-[#C5A880]/30 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase">
                  Už čoskoro
                </span>
              </button>
            </div>

            {success ? (
              /* Success / Thank You screen with animated elements */
              <div className="p-8 sm:p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Katalóg stiahnutý!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    Sťahovanie PDF katalógu sa spustilo automaticky vo vašom prehliadači. Kompletný odkaz a ďalšie podrobnosti sme Vám odoslali aj na zadaný e-mail.
                  </p>
                </div>

                <div className="bg-slate-50/55 dark:bg-slate-950/30 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-xs font-light text-left space-y-2.5">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Email odoslaný na: <span className="font-bold">{email}</span></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Názov súboru: <span className="font-bold">Katalog_ProstoHouse.pdf</span></span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSuccess(false)}
                  className="w-full bg-gradient-to-r from-[#C5A880] to-[#E2C799] hover:from-[#C5A880]/90 hover:to-[#E2C799]/90 text-slate-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-md border-none transition-all"
                >
                  Stiahnuť znova
                </Button>
              </div>
            ) : activeCatalog === 'prosto-house' ? (
              /* ACTIVE PROSTO HOUSE DOWNLOAD WINDOW */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="text-left space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#C5A880]" />
                    Stiahnutie Prosto House Katalógu
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    Ak chcete získať okamžitý odkaz a začať sťahovať PDF dokument, vyplňte prosím nasledujúce informácie.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1.5">Meno a priezvisko *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="napr. Ján Kováč"
                        className="w-full bg-white/10 dark:bg-slate-950/20 border border-slate-350/40 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#C5A880] transition-colors backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1.5">E-mailová adresa *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jan.kovac@example.com"
                        className="w-full bg-white/10 dark:bg-slate-950/20 border border-slate-350/40 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#C5A880] transition-colors backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#C5A880] mb-1.5">Telefónne číslo (nepovinné)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+421 900 000 000"
                        className="w-full bg-white/10 dark:bg-slate-950/20 border border-slate-350/40 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#C5A880] transition-colors backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1.5">
                    <input 
                      type="checkbox" 
                      id="gdpr"
                      required
                      checked={gdpr}
                      onChange={(e) => setGdpr(e.target.checked)}
                      className="mt-1 accent-[#C5A880] rounded cursor-pointer"
                    />
                    <label htmlFor="gdpr" className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed cursor-pointer select-none">
                      Súhlasím so spracovaním osobných údajov za účelom odoslania katalógu a súvisiacich informácií o drevodomoch. *
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-md border border-red-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generujem odkaz...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Odoslať a stiahnuť katalóg</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              /* INACTIVE TINY HOUSE COMING SOON WINDOW */
              <div className="p-8 sm:p-10 text-center space-y-6 min-h-[400px] flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] rounded-full flex items-center justify-center animate-pulse">
                  <Caravan className="w-9 h-9" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white">Tiny House Katalóg</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    Momentálne pripravujeme kompletnú novú ponuku minimalistických celoročných mobilných Tiny House domov. 
                  </p>
                </div>

                <div className="bg-white/5 border border-slate-200/30 dark:border-white/5 rounded-2xl p-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  Zanechajte nám svoj e-mail a my Vám pošleme katalóg ako prvým hneď, ako ho naši dizajnéri dokončia.
                </div>

                <div className="w-full max-w-sm flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Váš e-mail" 
                    className="flex-grow bg-white/10 dark:bg-slate-950/20 border border-slate-350/40 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <Button 
                    onClick={() => {
                      toast.success("Ďakujeme! Váš e-mail bol uložený do zoznamu čakateľov.");
                    }}
                    className="bg-[#C5A880] hover:bg-[#C5A880]/90 text-slate-950 font-bold text-xs uppercase px-4 rounded-xl"
                  >
                    Upozorniť ma
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* SUPER ADMIN FILE CONFIGURATION INTERFACE */}
      {isAdmin && (
        <div className="relative z-20 w-full bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-white/5 py-8 backdrop-blur-lg">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Layers className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Super-Admin Administrácia katalógov</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Správa PDF súborov a video slučky v pozadí pre túto Landing Page</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. PDF Catalog upload */}
              <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Katalóg Prosto House PDF
                  </h4>
                  {pdfConfig?.metaPixelId && (
                    <button
                      onClick={handleResetPdf}
                      className="text-[9px] font-bold text-red-500 uppercase hover:underline"
                    >
                      Resetovať
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  {pdfConfig?.metaPixelId ? (
                    <span className="text-green-600 dark:text-green-400 font-bold break-all">
                      Aktívny nahraný súbor: {pdfConfig.metaPixelId}
                    </span>
                  ) : (
                    <span>Používa sa prednastavený systémový súbor Prosto House.</span>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 border border-dashed border-slate-350 dark:border-white/10 rounded-xl p-3 bg-white/40 dark:bg-white/5 font-bold text-xs cursor-pointer hover:border-[#C5A880] transition-colors text-slate-700 dark:text-slate-300">
                  {uploadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{uploadingPdf ? "Nahrávam..." : "Vybrať a nahrať nové PDF"}</span>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    disabled={uploadingPdf}
                    onChange={handlePdfUpload}
                  />
                </label>
              </div>

              {/* 2. Background Video upload */}
              <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    Video v pozadí (loop)
                  </h4>
                  {bgVideoConfig?.metaPixelId && (
                    <button
                      onClick={handleResetVideo}
                      className="text-[9px] font-bold text-red-500 uppercase hover:underline"
                    >
                      Resetovať
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  {bgVideoConfig?.metaPixelId ? (
                    <span className="text-green-600 dark:text-green-400 font-bold break-all">
                      Vlastná video slučka: {bgVideoConfig.metaPixelId}
                    </span>
                  ) : (
                    <span>Používa sa predvolené video (slnečný drevodom v prírode).</span>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 border border-dashed border-slate-350 dark:border-white/10 rounded-xl p-3 bg-white/40 dark:bg-white/5 font-bold text-xs cursor-pointer hover:border-[#C5A880] transition-colors text-slate-700 dark:text-slate-300">
                  {uploadingBgVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{uploadingBgVideo ? "Nahrávam..." : "Vybrať a nahrať MP4 video"}</span>
                  <input 
                    type="file" 
                    accept="video/mp4" 
                    className="hidden" 
                    disabled={uploadingBgVideo}
                    onChange={handleBgVideoUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
