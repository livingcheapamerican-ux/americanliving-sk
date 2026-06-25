import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, MessageCircle, ChevronRight } from "lucide-react";
import { optimizeImageUrl } from "../ImageWithWatermark";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/376b4bd9f_okruhlelogo.png";

export default function MobileHeroSection({
  t,
  selectedFacadeImage,
  currentHouseData,
  getManufacturerBadge,
  switcherHouses,
  selectedHouseId,
  setSelectedHouseId,
  setSelectedFacade,
  selectedFacade,
  hasMultipleFacades,
  facadeOptions,
}) {
  return (
    <section className="block lg:hidden relative bg-concrete-split dark:bg-[#050508] transition-colors duration-300 py-12 px-4 border-b border-slate-200 dark:border-white/5">
      {/* Blueprint architectural grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-10 opacity-30" />

      <div className="relative z-20 max-w-2xl mx-auto flex flex-col gap-10">

        {/* Welcome Card */}
        <div className="flex flex-col text-left">
          {/* Logo & Small Badge */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={LOGO_URL}
              alt="American Living"
              className="h-12 w-auto drop-shadow-lg rounded-full"
              width={48}
              height={48}
              loading="eager"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5A880]/10 dark:bg-white/5 border border-[#C5A880]/30 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
              <span>{t('heroBadgeText')}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
            {t('heroTitleFirst')}{" "}
            <span className="bg-gradient-to-r from-[#C5A880] via-[#E2C799] to-[#C5A880] bg-clip-text text-transparent block">
              {t('heroTitleSecond')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base text-slate-655 dark:text-slate-300 mb-6 leading-relaxed font-light">
            {t('heroDescription')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-6">
            <Link to={createPageUrl("Katalog")} className="w-full">
              <Button size="lg" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-base py-5 shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 transition-all rounded-xl flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                <span>{t('viewCatalogButton')}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
              className="w-full bg-white/70 dark:bg-white/5 hover:bg-[#C5A880]/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/15 font-bold text-sm py-5 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('consultationWithKexo')}</span>
            </Button>
          </div>
        </div>

        {/* Lookbook / Interactive Section */}
        <div className="bg-white/95 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-xl">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-slate-255 dark:border-white/5 bg-slate-955">
            <img
              src={selectedFacadeImage}
              alt={currentHouseData.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-955/80 to-transparent" />

            <div className="absolute top-3 right-3 z-20">
              {getManufacturerBadge(currentHouseData.manufacturer)}
            </div>

            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-955/90 backdrop-blur-md border border-slate-200 dark:border-white/15 rounded-xl px-2.5 py-1 z-20">
              <p className="text-[8px] text-slate-505 font-semibold uppercase tracking-wider">
                {currentHouseData.manufacturer?.toLowerCase().includes("ticab") ? t('factoryProduction') : t('turnkeyDelivery')}
              </p>
              <p className="text-[10px] font-black text-slate-800 dark:text-white">
                {currentHouseData.manufacturer?.toLowerCase().includes("ticab") ? t('sixWeeks') : t('upToTwelveWeeks')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white leading-tight">{currentHouseData.name}</h3>
                <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>{currentHouseData.rooms} {t('roomsLabel')}</span>
                  <span>•</span>
                  <span>{currentHouseData.area} m²</span>
                  <span>•</span>
                  <span><strong className="text-[#C5A880]">{t('from')} {currentHouseData.price.toLocaleString()} €</strong></span>
                </div>
              </div>
            </div>

            {/* Selector buttons for houses */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
              {switcherHouses.map((house) => (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => {
                    setSelectedHouseId(house.id);
                    setSelectedFacade("anthracite");
                  }}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    selectedHouseId === house.id
                      ? 'border-[#C5A880] bg-[#C5A880]/10 text-[#C5A880]'
                      : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 text-slate-655 dark:text-slate-300'
                  }`}
                >
                  {house.name}
                </button>
              ))}
            </div>

            {hasMultipleFacades && (
              <div className="flex flex-col gap-2 mt-2">
                {facadeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedFacade(opt.id)}
                    className={`p-2 rounded-xl border text-left transition-all duration-300 flex items-center gap-2.5 ${
                      selectedFacade === opt.id
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880]'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                      <img src={optimizeImageUrl(opt.img, 100)} alt={opt.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] leading-tight font-black truncate">{opt.name}</p>
                      <p className="text-[8px] leading-tight text-slate-400 mt-0.5 truncate">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barn Double 72 Mobile Card */}
        <div className="bg-slate-900/30 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A880] bg-[#C5A880]/15 border border-[#C5A880]/30 px-2 py-0.5 rounded-full">Prosto House</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Trieda A0</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Barn Double 72</h3>

          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/5 bg-slate-950">
            <img
              src="https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/eccd583aa_barn-double-prosto-house-3.jpg"
              alt="Barn Double 72"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-slate-655 dark:text-slate-400 font-light mb-4">Dvojposchodový rodinný dom v tvare severskej stodoly s čistými líniami a garantovanou životnosťou cez 80 rokov.</p>

          <div className="grid grid-cols-3 gap-2 mb-4 border-t border-b border-slate-200 dark:border-white/5 py-3 text-center">
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Úžitková plocha</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">72 m²</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Počet izieb</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">3 izby</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Dodanie</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">12 týždňov</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 font-bold uppercase">{t('priceFrom')}</p>
              <p className="text-[10px] font-bold text-slate-450 line-through">36 900 € bez DPH</p>
              <p className="text-base font-black text-slate-900 dark:text-white">45 387 € <span className="text-[10px] font-normal text-slate-500">s DPH (23%)</span></p>
            </div>
            <Link to={`${createPageUrl("DetailDomu")}?id=6916ec94c11aacdd15248f2c`}>
              <Button className="bg-[#C5A880] hover:bg-[#b0926a] text-slate-950 font-black rounded-xl px-4 py-2 text-xs flex items-center gap-1">
                <span>{t('configure')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* London 144 Mobile Card */}
        <div className="bg-slate-900/30 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A880] bg-[#C5A880]/15 border border-[#C5A880]/30 px-2 py-0.5 rounded-full">Ticab House</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Trieda A0</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">London 144</h3>

          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/5 bg-slate-950">
            <img
              src="https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg"
              alt="London 144"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-slate-655 dark:text-slate-400 font-light mb-4">Veľkolepá rodinná vila s lepeným drevom GL24, vyrábaná s milimetrovou CNC presnosťou.</p>

          <div className="grid grid-cols-3 gap-2 mb-4 border-t border-b border-slate-200 dark:border-white/5 py-3 text-center">
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Úžitková plocha</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">144 m²</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Počet izieb</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">5 izieb</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 uppercase font-black">Dodanie</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">6 týždňov</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] text-slate-400 dark:text-slate-505 font-bold uppercase">{t('priceFrom')}</p>
              <p className="text-[9px] font-bold text-emerald-400">s dotáciou -5%</p>
              <p className="text-[10px] font-bold text-slate-450 line-through">120 000 € bez DPH</p>
              <p className="text-base font-black text-slate-900 dark:text-white">140 220 € <span className="text-[10px] font-normal text-slate-500">s DPH (23%)</span></p>
            </div>
            <Link to={`${createPageUrl("DetailDomu")}?id=6916ec94c11aacdd15248f07`}>
              <Button className="bg-[#C5A880] hover:bg-[#b0926a] text-slate-950 font-black rounded-xl px-4 py-2 text-xs flex items-center gap-1">
                <span>{t('configure')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}