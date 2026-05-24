import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPrice from "./FloatingPrice";
import { 
  Home, Check, Send, X, Thermometer, Zap, Layout, Hammer, 
  CheckCircle, Eye, EyeOff, Lock, ChevronDown, ChevronUp, 
  Paintbrush, DoorOpen, Wrench, Layers, Droplet, Flame, CheckSquare, Sparkles
} from "lucide-react";

// ── Glassmorphism Komponenty ──────────────────────────────────────────────
const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon }) => {
  const { t } = useLanguage();
  const isStandard = price === 0;
  return (
  <button 
    onClick={onClick} 
    className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all duration-500 w-full text-left active:scale-[0.98] gap-2 overflow-hidden group backdrop-blur-md ${
      selected 
        ? 'border-[#C5A880] bg-[#C5A880]/5 dark:bg-[#C5A880]/10 shadow-[0_0_25px_rgba(197,168,128,0.15)] scale-[1.02]' 
        : isStandard 
          ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10' 
          : isA0 
            ? 'border-blue-500/20 dark:border-blue-500/40 bg-blue-500/5 hover:border-blue-400 hover:bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
            : 'border-slate-200/80 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/[0.04]'
    }`}
  >
    {selected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C5A880] to-amber-500 opacity-80" />}
    {isA0 && !selected && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-60 animate-pulse" />}
    
    {/* Horná časť: Ikona, Názov a Checkbox */}
    <div className="flex items-start justify-between gap-4 w-full relative z-10">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            selected 
              ? 'bg-gradient-to-br from-[#C5A880] to-[#bfa177] text-white shadow-xl shadow-[#C5A880]/30 rotate-3' 
              : isA0 
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 shadow-lg shadow-blue-500/10' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-110'
          }`}>
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 ${selected || isA0 ? 'scale-110' : 'scale-100'}`} />
          </div>
        )}
        <div className="flex-1 mt-1">
          <div className="flex flex-col mb-1.5">
            {isA0 && (
              <span className="mb-2 inline-flex items-center self-start bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ★ {t('a0Required') || 'Povinné pre rodinný dom A0'}
              </span>
            )}
            <span className={`font-black text-base sm:text-lg transition-colors duration-300 ${
              selected 
                ? 'text-[#C5A880] dark:text-[#C5A880]' 
                : isA0 
                  ? 'text-blue-900 dark:text-blue-100' 
                  : 'text-slate-800 dark:text-slate-200'
            }`}>{label}</span>
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>}
        </div>
      </div>
      
      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 mt-1 ${
        selected 
          ? 'border-[#C5A880] bg-[#C5A880] scale-110 shadow-lg shadow-[#C5A880]/40' 
          : isA0 
            ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </div>
    
    {/* Spodná časť: Cena */}
    <div className={`w-full flex justify-end relative z-10 pt-2 mt-2 border-t ${
      isA0 && !selected ? 'border-blue-500/20' : 'border-slate-200 dark:border-white/5'
    }`}>
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-md" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-500">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
        </div>
      ) : (
        <div className="text-right flex flex-col items-end justify-center">
          <span className={`block font-black transition-colors duration-300 ${
            selected 
              ? 'text-base text-[#C5A880] dark:text-[#C5A880]' 
              : isStandard 
                ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                : isA0 
                  ? 'text-base text-blue-600 dark:text-blue-300' 
                  : 'text-base text-slate-650 dark:text-slate-400'
          }`}>
            {isStandard ? `✓ ${t('includedInPriceShort') || 'V základnej cene'}` : `+${price.toLocaleString()} €`}
          </span>
        </div>
      )}
    </div>
  </button>
  );
};

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t: propT, icon: Icon }) => {
  const { t: contextT } = useLanguage();
  const t = propT || contextT;
  return (
  <button 
    onClick={!disabled && !locked ? onChange : undefined} 
    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 w-full active:scale-[0.98] group overflow-hidden relative gap-4 ${
      locked 
        ? 'border-blue-500/20 bg-blue-500/5 cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.05)] backdrop-blur-md' 
        : checked 
          ? 'border-[#C5A880] bg-[#C5A880]/5 dark:bg-gradient-to-r dark:from-[#C5A880]/10 dark:to-transparent shadow-[0_0_20px_rgba(197,168,128,0.12)] scale-[1.01] backdrop-blur-md' 
          : disabled 
            ? 'border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'border-slate-200/80 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/[0.04] backdrop-blur-sm'
    }`}
  >
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A880]" />}
    {locked && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-60 animate-pulse" />}
    
    <div className="flex items-start sm:items-center gap-4 w-full relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
        locked 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10' 
          : checked 
            ? 'bg-gradient-to-br from-[#C5A880] to-[#bfa177] text-white shadow-lg shadow-[#C5A880]/20' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300'
      }`}>
        {Icon ? <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${checked || locked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />)}
      </div>
      <div className="text-left flex-1 pr-4">
        <div className="flex flex-col mb-1.5">
          {locked && (
            <span className="mb-2 inline-flex items-center self-start bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ★ {t('a0Required') || 'Povinné pre rodinný dom A0'}
            </span>
          )}
          <span className={`font-bold text-base sm:text-lg block transition-colors duration-300 ${
            locked 
              ? 'text-blue-900 dark:text-blue-100' 
              : checked 
                ? 'text-[#C5A880] dark:text-[#C5A880]' 
                : 'text-slate-800 dark:text-slate-200'
          }`}>{label}</span>
        </div>
        {description && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>}
      </div>
      
      {/* Checkbox na mobile zobrazený hore vedľa nadpisu, na desktope skrytý */}
      <div className={`sm:hidden w-6 h-6 mt-1 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
          : checked 
            ? 'border-[#C5A880] bg-[#C5A880] scale-110' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
    
    {/* Cena presunutá na samostatný riadok na mobile, na desktope vpravo */}
    <div className={`flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t ${
      locked ? 'border-blue-500/20' : 'border-slate-200 dark:border-white/5'
    } sm:border-0 relative z-10 gap-4`}>
      <div className="flex-shrink-0 text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <div className="text-right flex flex-col items-end justify-center">
            <span className={`block font-black transition-colors duration-300 ${
              locked 
                ? 'text-base text-blue-600 dark:text-blue-300' 
                : price === 0 
                  ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                  : 'text-base text-slate-650 dark:text-slate-400'
            }`}>
              {price === 0 ? `✓ ${t('includedInPriceShort') || 'V základnej cene'}` : `+${price.toLocaleString()} €`}
            </span>
          </div>
        )}
      </div>
      
      {/* Checkbox na desktope zobrazený vpravo od ceny */}
      <div className={`hidden sm:flex w-6 h-6 rounded border-2 items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
          : checked 
            ? 'border-[#C5A880] bg-[#C5A880] scale-110' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  </button>
  );
};

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-sm transition-all duration-500 hover:border-slate-350 dark:hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A880]" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
          value > 0 ? 'bg-slate-800 dark:bg-white/10 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300'
        }`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${
          value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
        }`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))} 
        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-300 active:scale-90 transition-all border border-slate-200 dark:border-white/10 backdrop-blur-sm"
      >
        −
      </button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${
        value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
      }`}>{value}</span>
      <button 
        onClick={() => onChange(value + 1)} 
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9E2A2B] to-[#802021] text-white hover:opacity-90 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(158,42,43,0.3)]"
      >
        +
      </button>
    </div>
  </div>
);

const SectionLabel = ({ label, color = 'gray' }) => {
  const colorMap = {
    'gray': 'text-slate-600 dark:text-slate-400',
    'orange': 'text-orange-700 dark:text-orange-400',
    'teal': 'text-teal-700 dark:text-teal-400',
    'amber': 'text-amber-700 dark:text-amber-400',
    'blue': 'text-blue-700 dark:text-blue-400',
    'purple': 'text-purple-700 dark:text-purple-400',
    'red': 'text-[#9E2A2B] dark:text-[#C5A880]',
    'emerald': 'text-emerald-700 dark:text-emerald-400',
    'green': 'text-green-700 dark:text-green-400',
    'yellow': 'text-yellow-750 dark:text-yellow-400'
  };
  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-600 dark:text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};

const BigSectionHeader = ({ title, description, icon: Icon, stepIdx, totalSteps }) => (
  <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
    <div className="lg:hidden text-[#9E2A2B] dark:text-[#C5A880] font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-current"></span>
      Krok {stepIdx + 1} z {totalSteps}
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(197,168,128,0.15)]">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-[#9E2A2B] dark:text-[#C5A880]" />
      </div>
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{title}</h2>
        {description && <p className="text-slate-600 dark:text-slate-350 text-sm lg:text-base leading-relaxed">{description}</p>}
      </div>
    </div>
  </div>
);
const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 text-foreground">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t('inquiryForm')}</h2>
        <p className="text-muted-foreground mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('nameSurname')}</label><input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('email')}</label><input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('phone')}</label><input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('city')}</label><input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('note')}</label><textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground"></textarea></div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            {isSubmitting ? <span>{t('sending')}</span> : <><span>{t('sendQuote')}</span><Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default function KonfiguratorTicabhouse({ dom, isAdmin, onConfigChange, predajNehnutelnosti, setPredajNehnutelnosti, hladamPozemok, setHladamPozemok, financneSluzby, setFinancneSluzby, ucel, setUcel, izolaciaStien, setIzolaciaStien, izolaciaPodlahy, setIzolaciaPodlahy, izolaciaStropu, setIzolaciaStropu, tepelneCerpadlo, setTepelneCerpadlo, rekuperacia, setRekuperacia, pripravaNaRekuperaciu, setPripravaNaRekuperaciu, podlahovoKurenie, setPodlahovoKurenie, pripravaNaKrb, setPripravaNaKrb, ochranaKachle, setOchranaKachle, klimatizacia, setKlimatizacia, fasada, setFasada, strecha, setStrecha, odkvapy, setOdkvapy, okna, setOkna, vchodoveDvere, setVchodoveDvere, obkladStien, setObkladStien, podlaha, setPodlaha, interieroveDvere, setInterieroveDvere, elektro, setElektro, bleskozvod, setBleskozvod, prepat, setPrepat, pripravaNaSolarnePanely, setPripravaNaSolarnePanely, sprchovyKut, setSprchovyKut, vana, setVana, bateria, setBateria, skrinka, setSkrinka, stropKupelna, setStropKupelna, inziniering, setInziniering, projektACertifikacia, setProjektACertifikacia, revizia, setRevizia, zaklady, setZaklady, montaz, setMontaz, doprava, setDoprava }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  // Lokálny state pre okamžitú vizuálnu spätnú väzbu
  const [localDopravaViditelna, setLocalDopravaViditelna] = React.useState(dom?.doprava_viditelna !== false);

  // Synchronizovať lokálny state s DOM objektom
  React.useEffect(() => {
    setLocalDopravaViditelna(dom?.doprava_viditelna !== false);
  }, [dom?.doprava_viditelna]);

  const dopravaViditelna = localDopravaViditelna;

  // Mutácia pre zmenu viditeľnosti dopravy
  const toggleDopravaVisibilityMutation = useMutation({
    mutationFn: (visible) => base44.entities.Dom.update(dom.id, { doprava_viditelna: visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom', dom.id] });
      toast.success(!dopravaViditelna ? 'Doprava skrytá pre verejnosť' : 'Doprava zobrazená pre verejnosť');
    }
  });

  const handleToggleDopravaVisibility = () => {
    const newValue = !dopravaViditelna;
    setLocalDopravaViditelna(newValue);
    toggleDopravaVisibilityMutation.mutate(newValue);
  };

  // Načítať texty konfiguratora
  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  // Pomocná funkcia na získanie preloženého textu
  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return null;
    
    if (language === 'sk') return text[field] || null;
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || null;
  };

  // Načítať ceny z entity Dom alebo použiť default ceny Lyon
  const DEFAULT_CENY = {
    izolacia_stien_200mm: 1799.16,
    izolacia_stien_250mm: 1558.17,
    izolacia_podlahy_200mm: 334.08,
    izolacia_stropu_200mm: 271.44,
    tepelne_cerpadlo: 2889.27,
    pripravaNaRekuperaciu: 512,
    rekuperacia: 1155.36,
    podlahove_kurenie: 2253.30,
    klimatizacia: 902,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada_omietka: 1580.79,
    fasada_smrekovec: 3349.50,
    fasada_falcovane: 4953.78,
    fasada_thermowood: 6677.25,
    strecha_falcovane: 3227.70,
    odkvapy: 1502.49,
    dvere_kovove: 278.40,
    obklad_smrek_bez_uzlov: 0,
    obklad_sadrokarton_tapeta: 7855,
    obklad_osb_panel: 5279,
    dvere_posuvne: 427.17,
    elektro_cz: 460.23,
    elektro_ge: 1583.40,
    bleskozvod: 856.08,
    prepat: 311.46,
    pripravaNaSolarnePanely: 1305,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    strop_kupelna_sadrokarton: 0,
    inziniering: 2773.56,
    projektACertifikacia: 3745.35,
    revizia: 1605.15,
    zaklady_vruty: 4494.42,
    zaklady_patky: 2568.24,
    zaklady_pasove: 11825.04,
    montaz: 4805.88,
    doprava: 8927.94
  };

  const CENY = {
    ...DEFAULT_CENY,
    ...(dom?.konfigurator_ceny || {})
  };
  const [kolaudacia, setKolaudacia] = useState("bez_a0");

  // Mutácia pre aktualizáciu cien
  const updatePricesMutation = useMutation({
    mutationFn: ({ domId, newPrices }) => 
      base44.entities.Dom.update(domId, { konfigurator_ceny: newPrices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom-detail'] });
      toast.success('Cena aktualizovaná - obnovujem stránku...');
      setTimeout(() => window.location.reload(), 500);
    }
  });

  const handlePriceChange = (priceKey, newPrice) => {
    if (!dom?.id) return;
    const updatedPrices = { ...CENY, [priceKey]: newPrice };
    updatePricesMutation.mutate({ domId: dom.id, newPrices: updatedPrices });
  };

  // Výpočet celkovej ceny
  const totalPrice = React.useMemo(() => {
    let price = dom?.zakladna_cena || 0;

    // Izolácia
    if (izolaciaStien === "200mm") price += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") price += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") price += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") price += CENY.izolacia_stropu_200mm || 0;

    // Vykurovanie
    if (tepelneCerpadlo === "ano") price += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) price += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") price += CENY.rekuperacia || 0;
    if (podlahovoKurenie) price += CENY.podlahove_kurenie || 0;
    if (klimatizacia) price += CENY.klimatizacia || 0;
    if (pripravaNaKrb) price += CENY.pripravaKrb || 0;
    if (ochranaKachle) price += CENY.ochranaKachle || 0;

    // Fasáda
    if (fasada === "omietka") price += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") price += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") price += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") price += CENY.fasada_thermowood || 0;

    // Strecha
    if (strecha === "falcovane") price += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") price += CENY.odkvapy || 0;

    // Dvere
    if (vchodoveDvere === "kovove") price += CENY.dvere_kovove || 0;

    // Interiér
    if (obkladStien === "smrek_bez_uzlov") price += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") price += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") price += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") price += CENY.dvere_posuvne || 0;

    // Elektro
    if (elektro === "cz") price += CENY.elektro_cz || 0;
    if (elektro === "ge") price += CENY.elektro_ge || 0;
    if (bleskozvod) price += CENY.bleskozvod || 0;
    if (prepat) price += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) price += CENY.pripravaNaSolarnePanely || 0;

    // Kúpeľňa
    if (sprchovyKut === "radaway") price += CENY.sprchovyKut || 0;
    if (vana) price += CENY.vana || 0;
    if (bateria === "grohe") price += CENY.bateria || 0;
    if (skrinka) price += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") price += CENY.strop_kupelna_sadrokarton || 0;

    // Služby
    if (inziniering) price += CENY.inziniering || 0;
    if (projektACertifikacia) price += CENY.projektACertifikacia || 0;
    if (revizia) price += CENY.revizia || 0;

    // Základy
    if (zaklady === "vruty") price += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") price += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") price += CENY.zaklady_pasove || 0;

    // Realizácia
    if (montaz) price += CENY.montaz || 0;
    if (doprava && dopravaViditelna) price += CENY.doprava || 0;

    return price;
  }, [
    dom?.zakladna_cena, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
    tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
    fasada, strecha, odkvapy, vchodoveDvere, obkladStien, interieroveDvere,
    elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
    inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava, CENY, dopravaViditelna
  ]);

  // Poslať konfiguráciu do rodičovského komponentu (pre hypotéku)
  React.useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        celkovaCena: totalPrice,
        izolaciaStien,
        izolaciaPodlahy,
        izolaciaStropu,
        tepelneCerpadlo,
        rekuperacia,
        projektACertifikacia,
        zaklady
      });
    }
  }, [totalPrice, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, projektACertifikacia, zaklady, onConfigChange]);

  // Synchronizácia s props
  React.useEffect(() => { if (setUcel) setUcel(ucel); }, [ucel]);
  React.useEffect(() => { if (setIzolaciaStien) setIzolaciaStien(izolaciaStien); }, [izolaciaStien]);
  React.useEffect(() => { if (setIzolaciaPodlahy) setIzolaciaPodlahy(izolaciaPodlahy); }, [izolaciaPodlahy]);
  React.useEffect(() => { if (setIzolaciaStropu) setIzolaciaStropu(izolaciaStropu); }, [izolaciaStropu]);
  React.useEffect(() => { if (setTepelneCerpadlo) setTepelneCerpadlo(tepelneCerpadlo); }, [tepelneCerpadlo]);
  React.useEffect(() => { if (setRekuperacia) setRekuperacia(rekuperacia); }, [rekuperacia]);
  React.useEffect(() => { if (setPodlahovoKurenie) setPodlahovoKurenie(podlahovoKurenie); }, [podlahovoKurenie]);
  React.useEffect(() => { if (setPripravaNaKrb) setPripravaNaKrb(pripravaNaKrb); }, [pripravaNaKrb]);
  React.useEffect(() => { if (setOchranaKachle) setOchranaKachle(ochranaKachle); }, [ochranaKachle]);
  React.useEffect(() => { if (setFasada) setFasada(fasada); }, [fasada]);
  React.useEffect(() => { if (setStrecha) setStrecha(strecha); }, [strecha]);
  React.useEffect(() => { if (setOdkvapy) setOdkvapy(odkvapy); }, [odkvapy]);
  React.useEffect(() => { if (setOkna) setOkna(okna); }, [okna]);
  React.useEffect(() => { if (setVchodoveDvere) setVchodoveDvere(vchodoveDvere); }, [vchodoveDvere]);
  React.useEffect(() => { if (setObkladStien) setObkladStien(obkladStien); }, [obkladStien]);
  React.useEffect(() => { if (setPodlaha) setPodlaha(podlaha); }, [podlaha]);
  React.useEffect(() => { if (setInterieroveDvere) setInterieroveDvere(interieroveDvere); }, [interieroveDvere]);
  React.useEffect(() => { if (setElektro) setElektro(elektro); }, [elektro]);
  React.useEffect(() => { if (setBleskozvod) setBleskozvod(bleskozvod); }, [bleskozvod]);
  React.useEffect(() => { if (setPrepat) setPrepat(prepat); }, [prepat]);
  React.useEffect(() => { if (setPripravaNaSolarnePanely) setPripravaNaSolarnePanely(pripravaNaSolarnePanely); }, [pripravaNaSolarnePanely]);
  React.useEffect(() => { if (setPripravaNaRekuperaciu) setPripravaNaRekuperaciu(pripravaNaRekuperaciu); }, [pripravaNaRekuperaciu]);
  React.useEffect(() => { if (setKlimatizacia) setKlimatizacia(klimatizacia); }, [klimatizacia]);
  React.useEffect(() => { if (setSprchovyKut) setSprchovyKut(sprchovyKut); }, [sprchovyKut]);
  React.useEffect(() => { if (setVana) setVana(vana); }, [vana]);
  React.useEffect(() => { if (setBateria) setBateria(bateria); }, [bateria]);
  React.useEffect(() => { if (setSkrinka) setSkrinka(skrinka); }, [skrinka]);
  React.useEffect(() => { if (setStropKupelna) setStropKupelna(stropKupelna); }, [stropKupelna]);
  React.useEffect(() => { if (setInziniering) setInziniering(inziniering); }, [inziniering]);
  React.useEffect(() => { if (setProjektACertifikacia) setProjektACertifikacia(projektACertifikacia); }, [projektACertifikacia]);
  React.useEffect(() => { if (setRevizia) setRevizia(revizia); }, [revizia]);
  React.useEffect(() => { if (setZaklady) setZaklady(zaklady); }, [zaklady]);
  React.useEffect(() => { if (setMontaz) setMontaz(montaz); }, [montaz]);
  React.useEffect(() => { if (setDoprava) setDoprava(doprava); }, [doprava]);

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '0 €';
    return num > 0 ? `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €` : '0 €';
  };

  const handleSubmit = () => {
    console.log('Submit konfigurácie');
  };

  const handleSendQuoteFromFloating = async (contactData) => {
    try {
      const response = await base44.functions.invoke('odosliCenovuPonukuLyonEmail', {
        dom,
        klientData: contactData,
        language,
        konfiguraciaData: {
          ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo,
          rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb,
          ochranaKachle, klimatizacia, fasada, strecha, odkvapy, okna, vchodoveDvere,
          obkladStien, podlaha, interieroveDvere, elektro, bleskozvod, prepat,
          pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
          inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
          predajNehnutelnosti, hladamPozemok, financneSluzby,
          totalPrice
        }
      });
      return response;
    } catch (error) {
      console.error('Error in handleSendQuoteFromFloating:', error);
      throw error;
    }
  };


  // ── ScrollSpy Logika ──
  const [activeSection, setActiveSection] = useState(0);
  
  const sections = [
    { id: 0, title: getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby', icon: Home },
    { id: 1, title: getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia', icon: Thermometer },
    { id: 2, title: getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie', icon: Flame },
    { id: 3, title: getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda', icon: Paintbrush },
    { id: 4, title: getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha', icon: Home },
    { id: 5, title: getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere', icon: DoorOpen },
    { id: 6, title: getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér', icon: Layout },
    { id: 7, title: getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektro', icon: Zap },
    { id: 8, title: getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa', icon: Droplet },
    { id: 9, title: getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy', icon: Wrench },
    { id: 10, title: getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering', icon: Layers },
    { id: 11, title: getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia', icon: Hammer },
    { id: 12, title: getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Služby k nákupu', icon: Sparkles },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.id.split('-')[1]);
            setActiveSection(index);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach((_, index) => {
      const element = document.getElementById(`section-${index}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(index);
    }
  };

  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const renderGroupedSummary = () => {
    const categories = [
      {
        title: "1. Konštrukcia & Izolácia",
        items: [
          { label: "Účel stavby", value: ucel === "chata" ? "Rekreačná chata" : "Rodinný dom (A0)", isStandard: false },
          { 
            label: "Izolácia stien", 
            value: izolaciaStien === "150mm" ? "150 mm" : `${izolaciaStien}`, 
            price: izolaciaStien === "150mm" ? 0 : (CENY[`izolacia_stien_${izolaciaStien}`] || 0),
            isStandard: izolaciaStien === "150mm"
          },
          { 
            label: "Izolácia podlahy", 
            value: izolaciaPodlahy === "150mm" ? "150 mm" : `${izolaciaPodlahy}`, 
            price: izolaciaPodlahy === "150mm" ? 0 : (CENY[`izolacia_podlahy_${izolaciaPodlahy}`] || 0),
            isStandard: izolaciaPodlahy === "150mm"
          },
          { 
            label: "Izolácia stropu", 
            value: izolaciaStropu === "150mm" ? "150 mm" : `${izolaciaStropu}`, 
            price: izolaciaStropu === "150mm" ? 0 : (CENY[`izolacia_stropu_${izolaciaStropu}`] || 0),
            isStandard: izolaciaStropu === "150mm"
          },
          { 
            label: "Základy", 
            value: zaklady === "bez" ? "Bez základov" :
                   zaklady === "vruty" ? "Zemné skrutky" :
                   zaklady === "patky" ? "Betónové pätky" : "Pásové základy", 
            price: zaklady === "bez" ? 0 : (CENY[`zaklady_${zaklady}`] || 0),
            isStandard: zaklady === "bez"
          },
        ]
      },
      {
        title: "2. Exteriér & Fasáda",
        items: [
          { 
            label: "Fasáda", 
            value: fasada === "drevo_smrek" ? "Severský smrek" : 
                   fasada === "omietka" ? "Šúchaná omietka" :
                   fasada === "smrekovec" ? "Sibírsky smrekovec" :
                   fasada === "falcovane" ? "Falcovaný plech" : "Thermowood", 
            price: fasada === "drevo_smrek" ? 0 : (CENY[`fasada_${fasada}`] || 0),
            isStandard: fasada === "drevo_smrek"
          },
          { 
            label: "Strešná krytina", 
            value: strecha === "korugovan_plech" ? "Korugovaný plech" : "Falcovaný plech", 
            price: strecha === "korugovan_plech" ? 0 : (CENY.strecha_falcovane || 0),
            isStandard: strecha === "korugovan_plech"
          },
          { 
            label: "Odkvapy", 
            value: odkvapy === "ano" ? "Áno" : "Nie", 
            price: odkvapy === "ano" ? (CENY.odkvapy || 0) : 0,
            isStandard: odkvapy !== "ano",
            hideIfStandard: true,
            active: odkvapy === "ano"
          },
          { 
            label: "Farba okien", 
            value: okna === "biele" ? "Biele" : okna === "antracit" ? "Antracit" : "Hnedé", 
            price: 0,
            isStandard: true
          },
          { 
            label: "Vchodové dvere", 
            value: vchodoveDvere === "plastove" ? "Plastovo-kovové" : "Kovové", 
            price: vchodoveDvere === "plastove" ? 0 : (CENY.dvere_kovove || 0),
            isStandard: vchodoveDvere === "plastove"
          },
        ]
      },
      {
        title: "3. Interiér & Kúpeľňa",
        items: [
          { 
            label: "Obklad stien", 
            value: obkladStien === "smrek_8cm" ? "Smrek 8cm" :
                   obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov" :
                   obkladStien === "sadrokarton_tapeta" ? "Sadrokartón/Tapeta" : "OSB panel", 
            price: obkladStien === "smrek_8cm" ? 0 : (CENY[`obklad_${obkladStien}`] || 0),
            isStandard: obkladStien === "smrek_8cm"
          },
          { 
            label: "Podlaha", 
            value: "Laminát", 
            price: 0,
            isStandard: true
          },
          { 
            label: "Interiérové dvere", 
            value: interieroveDvere === "kridlove" ? "Krídlové" : "Posuvné", 
            price: interieroveDvere === "kridlove" ? 0 : (CENY.dvere_posuvne || 0),
            isStandard: interieroveDvere === "kridlove"
          },
          { 
            label: "Sprchový kút", 
            value: sprchovyKut === "standard" ? "Štandard" : "Radaway", 
            price: sprchovyKut === "standard" ? 0 : (CENY.sprchovyKut || 0),
            isStandard: sprchovyKut === "standard"
          },
          { 
            label: "Kúpeľňová batéria", 
            value: bateria === "standard" ? "Štandard" : "Grohe", 
            price: bateria === "standard" ? 0 : (CENY.bateria || 0),
            isStandard: bateria === "standard"
          },
          { 
            label: "Strop v kúpeľni", 
            value: stropKupelna === "drevo" ? "Drevený obklad" : "Sadrokartón", 
            price: 0,
            isStandard: true
          },
          { 
            label: "Vaňa", 
            value: "Áno", 
            price: CENY.vana || 0, 
            isStandard: false, 
            hideIfStandard: true,
            active: vana
          },
          { 
            label: "Skrinka s umývadlom", 
            value: "Áno", 
            price: CENY.skrinka || 0, 
            isStandard: false, 
            hideIfStandard: true,
            active: skrinka
          },
        ]
      },
      {
        title: "4. Technológie & Služby",
        items: [
          { label: "Tepelné čerpadlo", value: "Áno", price: CENY.tepelne_cerpadlo || 0, isStandard: false, active: tepelneCerpadlo === "ano", hideIfStandard: true },
          { label: "Príprava na rekuperáciu", value: "Áno", price: CENY.pripravaNaRekuperaciu || 0, isStandard: false, active: pripravaNaRekuperaciu, hideIfStandard: true },
          { label: "Rekuperácia", value: "Áno", price: CENY.rekuperacia || 0, isStandard: false, active: rekuperacia === "ano", hideIfStandard: true },
          { label: "Podlahové kúrenie", value: "Áno", price: CENY.podlahove_kurenie || 0, isStandard: false, active: podlahovoKurenie, hideIfStandard: true },
          { label: "Klimatizácia", value: "Áno", price: CENY.klimatizacia || 0, isStandard: false, active: klimatizacia, hideIfStandard: true },
          { label: "Príprava na krb", value: "Áno", price: CENY.pripravaKrb || 0, isStandard: false, active: pripravaNaKrb, hideIfStandard: true },
          { label: "Ochrana (Kachle)", value: "Áno", price: CENY.ochranaKachle || 0, isStandard: false, active: ochranaKachle, hideIfStandard: true },
          { label: "Bleskozvod", value: "Áno", price: CENY.bleskozvod || 0, isStandard: false, active: bleskozvod, hideIfStandard: true },
          { label: "Prepäťová ochrana", value: "Áno", price: CENY.prepat || 0, isStandard: false, active: prepat, hideIfStandard: true },
          { label: "Príprava na solárne panely", value: "Áno", price: CENY.pripravaNaSolarnePanely || 0, isStandard: false, active: pripravaNaSolarnePanely, hideIfStandard: true },
          { label: "Inžiniering", value: "Áno", price: CENY.inziniering || 0, isStandard: false, active: inziniering, hideIfStandard: true },
          { label: "Projekt a certifikácia", value: "Áno", price: CENY.projektACertifikacia || 0, isStandard: false, active: projektACertifikacia, hideIfStandard: true },
          { label: "Revízia", value: "Áno", price: CENY.revizia || 0, isStandard: false, active: revizia, hideIfStandard: true },
          { label: "Montáž domu", value: "Áno", price: CENY.montaz || 0, isStandard: false, active: montaz, hideIfStandard: true },
          { label: "Doprava", value: "Áno", price: CENY.doprava || 0, isStandard: false, active: doprava && dopravaViditelna, hideIfStandard: true, condition: dopravaViditelna },
          { label: "Predaj nehnuteľnosti", value: "Áno", price: 0, isStandard: true, active: predajNehnutelnosti, hideIfStandard: true },
          { label: "Chcem pozemok", value: "Áno", price: 0, isStandard: true, active: hladamPozemok, hideIfStandard: true },
          { label: "Finančné služby", value: "Áno", price: 0, isStandard: true, active: financneSluzby, hideIfStandard: true },
        ]
      }
    ];

    return (
      <div className="space-y-4">
        {categories.map((category, idx) => {
          const visibleItems = category.items.filter(item => {
            if (item.condition === false) return false;
            if (item.hideIfStandard) {
              return item.active;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider mb-1">
                {category.title}
              </div>
              <div className="space-y-2">
                {visibleItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-baseline gap-4 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                      {item.price > 0 && (
                        <span className="text-[10px] text-[#C5A880] font-black">
                          (+{item.price.toLocaleString('sk-SK')} €)
                        </span>
                      )}
                      {item.isStandard && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                          V cene
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full relative mt-8 font-sans">
      {/* Vysvetlenie Štandardu */}
      <div className="w-full bg-emerald-50/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-sm">
        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-full text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Prémiový drevodom v základnej cene</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Domy Ticab House sú štandardne dodávané ako prémiové drevodomy s kvalitným dreveným obkladom fasády aj interiéru. Tento luxusný drevený štandard je už zahrnutý v základnej cene. Priplácate si výlučne iba za zmeny štandardu (napr. ak chcete vymeniť drevo za sadrokartón).
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full relative">
        {/* ĽAVÝ STĹPEC - Možnosti (cca 65%) */}
        <div className="flex-1 min-w-0 w-full lg:w-[65%] space-y-12 pb-32">
        
        {/* 0. Účel stavby */}
        <section id="section-0" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby'} icon={Home} stepIdx={0} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard 
              label={getTranslatedText('ucel_rekreacna', 'nazov') || t('recreationalBuilding')}
              description={getTranslatedText('ucel_rekreacna', 'podnadpis') || t('economicChoice')}
              selected={ucel === "chata"}
              onClick={() => {
                setUcel("chata");
                setKolaudacia("bez_a0");
                setIzolaciaStien("150mm"); setIzolaciaPodlahy("150mm"); setIzolaciaStropu("150mm");
                setTepelneCerpadlo("nie"); setRekuperacia("nie"); setPripravaNaRekuperaciu(false);
                setPodlahovoKurenie(false); setPripravaNaKrb(false); setOchranaKachle(false); setKlimatizacia(false);
                setFasada("drevo_smrek"); setStrecha("korugovan_plech"); setOdkvapy("nie");
                setOkna("biele"); setVchodoveDvere("plastove"); setObkladStien("smrek_8cm");
                setPodlaha("laminat"); setInterieroveDvere("kridlove"); setElektro("eu");
                setBleskozvod(false); setPrepat(false); setPripravaNaSolarnePanely(false);
                setSprchovyKut("standard"); setVana(false); setBateria("standard");
                setSkrinka(false); setStropKupelna("drevo"); setInziniering(false);
                setProjektACertifikacia(false); setRevizia(false); setZaklady("bez");
                setMontaz(false); setDoprava(false);
              }}
              price={0}
              icon={Home}
            />
            <OptionCard 
              label={getTranslatedText('ucel_rodinny', 'nazov') || t('familyHouseA0')}
              description={getTranslatedText('ucel_rodinny', 'dlhy_popis') || t('familyHouseA0Desc')}
              selected={ucel === "rodinny"}
              isA0={true}
              onClick={() => {
                setUcel("rodinny"); setKolaudacia("s_a0");
                setIzolaciaStien("250mm"); setIzolaciaPodlahy("200mm"); setIzolaciaStropu("200mm");
                setTepelneCerpadlo("ano"); setPripravaNaRekuperaciu(true); setRekuperacia("ano");
                setInziniering(true); setProjektACertifikacia(true); setRevizia(true);
                setBleskozvod(true); setPrepat(true); setElektro("ge"); setKlimatizacia(true);
              }}
              price={0}
              icon={Zap}
            />
          </div>
        </section>

        {/* 1. Izolácia */}
        <section id="section-1" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia'} icon={Thermometer} stepIdx={1} totalSteps={13} />
          
          <SectionLabel label={getTranslatedText('izolacia_stien', 'nazov') || t('wallInsulation') || 'Izolácia stien'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('izolacia_stien_150', 'nazov') || t('walls150mm') || 'Steny 150mm'} description={getTranslatedText('izolacia_stien_150', 'podnadpis')} selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} price={0} isAdmin={isAdmin} />
            <OptionCard label={getTranslatedText('izolacia_stien_200', 'nazov') || t('walls200mm') || 'Steny 200mm'} description={getTranslatedText('izolacia_stien_200', 'podnadpis')} selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} price={CENY.izolacia_stien_200mm} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('izolacia_stien_200mm', p)} />
            <OptionCard label={getTranslatedText('izolacia_stien_250', 'nazov') || t('walls250mm') || 'Steny 250mm'} description={getTranslatedText('izolacia_stien_250', 'podnadpis')} selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} price={CENY.izolacia_stien_250mm} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('izolacia_stien_250mm', p)} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('izolacia_podlahy_150', 'nazov') || t('floor150mm') || 'Podlaha 150mm'} selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} price={0} isAdmin={isAdmin} />
            <OptionCard label={getTranslatedText('izolacia_podlahy_200', 'nazov') || t('floor200mm') || 'Podlaha 200mm'} selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} price={CENY.izolacia_podlahy_200mm} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('izolacia_podlahy_200mm', p)} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('izolacia_stropu_150', 'nazov') || t('ceiling150mm') || 'Strop 150mm'} selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} price={0} isAdmin={isAdmin} />
            <OptionCard label={getTranslatedText('izolacia_stropu_200', 'nazov') || t('ceiling200mm') || 'Strop 200mm'} selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} price={CENY.izolacia_stropu_200mm} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('izolacia_stropu_200mm', p)} isA0={true} />
          </div>
        </section>

        {/* 2. Vykurovanie */}
        <section id="section-2" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie'} icon={Flame} stepIdx={2} totalSteps={13} />
          
          <SectionLabel label={getTranslatedText('tepelne_cerpadlo', 'nazov') || t('heating') || 'Tepelné čerpadlo'} color="orange" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('tepelne_cerpadlo_nie', 'nazov') || t('heatingPreparation')} selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} price={0} isAdmin={isAdmin} />
            <OptionCard label={getTranslatedText('tepelne_cerpadlo_ano', 'nazov') || t('heatPump')} selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} price={CENY.tepelne_cerpadlo} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('tepelne_cerpadlo', p)} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('rekuperacia', 'nazov') || t('ventilation') || 'Rekuperácia'} color="orange" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('rekuperacia_nie', 'nazov') || t('withoutRecuperation')} selected={rekuperacia === "nie" && !pripravaNaRekuperaciu} onClick={() => {setRekuperacia("nie"); setPripravaNaRekuperaciu(false);}} price={0} isAdmin={isAdmin} />
            <OptionCard label={getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu'} selected={pripravaNaRekuperaciu} onClick={() => {setPripravaNaRekuperaciu(true); setRekuperacia("nie");}} price={CENY.pripravaNaRekuperaciu} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('pripravaNaRekuperaciu', p)} isA0={true} />
            <OptionCard label={getTranslatedText('rekuperacia_ano', 'nazov') || t('recuperation')} selected={rekuperacia === "ano"} onClick={() => {setRekuperacia("ano"); setPripravaNaRekuperaciu(false);}} price={CENY.rekuperacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('rekuperacia', p)} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('vykurovanie_doplnky', 'nazov') || t('heatingExtras') || 'Doplnky'} color="orange" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('podlahove_kurenie', 'nazov') || t('floorHeating')} checked={podlahovoKurenie} onChange={() => setPodlahovoKurenie(!podlahovoKurenie)} price={CENY.podlahove_kurenie} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('podlahove_kurenie', p)} />
            <AddonRow label={getTranslatedText('pripravaKrb', 'nazov') || t('fireplacePrep')} checked={pripravaNaKrb} onChange={() => setPripravaNaKrb(!pripravaNaKrb)} price={CENY.pripravaKrb} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('pripravaKrb', p)} />
            <AddonRow label={getTranslatedText('ochranaKachle', 'nazov') || t('stoveProtection')} checked={ochranaKachle} onChange={() => setOchranaKachle(!ochranaKachle)} price={CENY.ochranaKachle} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('ochranaKachle', p)} />
            <AddonRow label={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} checked={klimatizacia} onChange={() => setKlimatizacia(!klimatizacia)} price={CENY.klimatizacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('klimatizacia', p)} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 3. Fasáda */}
        <section id="section-3" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda'} icon={Paintbrush} stepIdx={3} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('fasada_drevo_smrek', 'nazov') || t('spruceWood')} selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} price={0} />
            <OptionCard label={getTranslatedText('fasada_omietka', 'nazov') || t('scratchedPlaster')} selected={fasada === "omietka"} onClick={() => setFasada("omietka")} price={CENY.fasada_omietka} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('fasada_omietka', p)} />
            <OptionCard label={getTranslatedText('fasada_smrekovec', 'nazov') || t('larch')} selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} price={CENY.fasada_smrekovec} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('fasada_smrekovec', p)} />
            <OptionCard label={getTranslatedText('fasada_falcovane', 'nazov') || t('foldedPanels')} selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} price={CENY.fasada_falcovane} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('fasada_falcovane', p)} />
            <OptionCard label={getTranslatedText('fasada_thermowood', 'nazov') || 'Thermowood'} selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} price={CENY.fasada_thermowood} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('fasada_thermowood', p)} />
          </div>
        </section>

        {/* 4. Strecha */}
        <section id="section-4" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha'} icon={Home} stepIdx={4} totalSteps={13} />
          <SectionLabel label={getTranslatedText('stresna_krytina', 'nazov') || t('roofCoveringType') || 'Strešná krytina'} color="purple" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('strecha_korugovan', 'nazov') || t('corrugatedMetal')} selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} price={0} />
            <OptionCard label={getTranslatedText('strecha_falcovane', 'nazov') || t('foldedPanels')} selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} price={CENY.strecha_falcovane} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('strecha_falcovane', p)} />
          </div>
          <SectionLabel label={getTranslatedText('odkvapy', 'nazov') || t('gutters') || 'Odkvapy'} color="purple" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('odkvapy_nie', 'nazov') || t('withoutGutters')} selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} price={0} />
            <OptionCard label={getTranslatedText('odkvapy_ano', 'nazov') || t('gutters')} selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} price={CENY.odkvapy} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('odkvapy', p)} />
          </div>
        </section>

        {/* 5. Okná a dvere */}
        <section id="section-5" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere'} icon={DoorOpen} stepIdx={5} totalSteps={13} />
          <SectionLabel label={getTranslatedText('okna_farba', 'nazov') || t('windowColor') || 'Farba okien 3-sklo'} color="blue" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <OptionCard label={getTranslatedText('okna_biele', 'nazov') || t('white')} selected={okna === "biele"} onClick={() => setOkna("biele")} price={0} />
            <OptionCard label={getTranslatedText('okna_antracit', 'nazov') || t('anthracite')} selected={okna === "antracit"} onClick={() => setOkna("antracit")} price={0} />
            <OptionCard label={getTranslatedText('okna_hnede', 'nazov') || t('brown')} selected={okna === "hnede"} onClick={() => setOkna("hnede")} price={0} />
          </div>
          <SectionLabel label={getTranslatedText('vchodove_dvere', 'nazov') || t('entryDoors') || 'Vchodové dvere'} color="blue" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('dvere_plastove', 'nazov') || t('metalPlasticDoors')} selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} price={0} />
            <OptionCard label={getTranslatedText('dvere_kovove', 'nazov') || t('metalDoors')} selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} price={CENY.dvere_kovove} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('dvere_kovove', p)} />
          </div>
        </section>

        {/* 6. Interiér */}
        <section id="section-6" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér'} icon={Layout} stepIdx={6} totalSteps={13} />
          <SectionLabel label={getTranslatedText('obklad_stien', 'nazov') || t('wallCladding') || 'Obklad stien'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('obklad_smrek_8cm', 'nazov') || t('spruceWall8cm')} selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} price={0} />
            <OptionCard label={getTranslatedText('obklad_smrek_bez_uzlov', 'nazov') || t('spruceWallNoKnots')} selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} price={CENY.obklad_smrek_bez_uzlov} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('obklad_smrek_bez_uzlov', p)} />
            <OptionCard label={getTranslatedText('obklad_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} price={CENY.obklad_sadrokarton_tapeta} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('obklad_sadrokarton_tapeta', p)} />
            <OptionCard label={getTranslatedText('obklad_osb', 'nazov') || t('osbLaminatePanel')} selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} price={CENY.obklad_osb_panel} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('obklad_osb_panel', p)} />
          </div>
          <SectionLabel label={getTranslatedText('podlaha', 'nazov') || t('floorType') || 'Podlaha'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('podlaha_laminat', 'nazov') || t('laminate')} selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} price={0} />
          </div>
          <SectionLabel label={getTranslatedText('interierove_dvere', 'nazov') || t('interiorDoorsType') || 'Interiérové dvere'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('dvere_kridlove', 'nazov') || t('hingedDoors')} selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} price={0} />
            <OptionCard label={getTranslatedText('dvere_posuvne', 'nazov') || t('slidingDoors')} selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} price={CENY.dvere_posuvne} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('dvere_posuvne', p)} />
          </div>
        </section>

        {/* 7. Elektro */}
        <section id="section-7" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektroinštalácia'} icon={Zap} stepIdx={7} totalSteps={13} />
          <SectionLabel label={getTranslatedText('elektro_typ', 'nazov') || t('installationType') || 'Typ inštalácie'} color="yellow" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <OptionCard label={getTranslatedText('elektro_eu', 'nazov') || t('euStandard')} selected={elektro === "eu"} onClick={() => setElektro("eu")} price={0} />
            <OptionCard label={getTranslatedText('elektro_cz', 'nazov') || t('czSkStandard')} selected={elektro === "cz"} onClick={() => setElektro("cz")} price={CENY.elektro_cz} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('elektro_cz', p)} />
            <OptionCard label={getTranslatedText('elektro_ge', 'nazov') || t('geStandard')} selected={elektro === "ge"} onClick={() => setElektro("ge")} price={CENY.elektro_ge} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('elektro_ge', p)} isA0={true} />
          </div>
          <SectionLabel label="Doplnky" color="yellow" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('bleskozvod', 'nazov') || t('lightningRod')} checked={bleskozvod} onChange={() => setBleskozvod(!bleskozvod)} price={CENY.bleskozvod} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('bleskozvod', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('prepat', 'nazov') || t('surgeProtection')} checked={prepat} onChange={() => setPrepat(!prepat)} price={CENY.prepat} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('prepat', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('pripravaNaSolarnePanely', 'nazov') || 'Príprava na solárne panely'} checked={pripravaNaSolarnePanely} onChange={() => setPripravaNaSolarnePanely(!pripravaNaSolarnePanely)} price={CENY.pripravaNaSolarnePanely} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('pripravaNaSolarnePanely', p)} />
          </div>
        </section>

        {/* 8. Kúpeľňa */}
        <section id="section-8" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa'} icon={Droplet} stepIdx={8} totalSteps={13} />
          <SectionLabel label={getTranslatedText('sprchovyKut', 'nazov') || t('showerCabin') || 'Sprchový kút'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('sprcha_standard', 'nazov') || t('shower')} selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} price={0} />
            <OptionCard label={getTranslatedText('sprcha_radaway', 'nazov') || t('showerRadawayTile')} selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} price={CENY.sprchovyKut} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('sprchovyKut', p)} />
          </div>
          <SectionLabel label={getTranslatedText('bateria', 'nazov') || t('faucet') || 'Batéria'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('bateria_standard', 'nazov') || t('faucetStandard')} selected={bateria === "standard"} onClick={() => setBateria("standard")} price={0} />
            <OptionCard label={getTranslatedText('bateria_grohe', 'nazov') || 'Grohe'} selected={bateria === "grohe"} onClick={() => setBateria("grohe")} price={CENY.bateria} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('bateria', p)} />
          </div>
          <SectionLabel label={getTranslatedText('strop_kupelna', 'nazov') || t('bathroomCeiling') || 'Strop'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('strop_drevo', 'nazov') || t('ceilingWoodPattern')} selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} price={0} />
            <OptionCard label={getTranslatedText('strop_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} price={CENY.strop_kupelna_sadrokarton} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('strop_kupelna_sadrokarton', p)} />
          </div>
          <SectionLabel label="Doplnky" color="teal" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('vana', 'nazov') || t('bathtub')} checked={vana} onChange={() => setVana(!vana)} price={CENY.vana} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('vana', p)} />
            <AddonRow label={getTranslatedText('skrinka', 'nazov') || t('cabinet')} checked={skrinka} onChange={() => setSkrinka(!skrinka)} price={CENY.skrinka} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('skrinka', p)} />
          </div>
        </section>

        {/* 9. Základy */}
        <section id="section-9" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy'} icon={Wrench} stepIdx={9} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('zaklady_bez', 'nazov') || t('noFoundations')} selected={zaklady === "bez"} onClick={() => setZaklady("bez")} price={0} />
            <OptionCard label={getTranslatedText('zaklady_vruty', 'nazov') || t('groundScrews')} selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} price={CENY.zaklady_vruty} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_vruty', p)} />
            <OptionCard label={getTranslatedText('zaklady_patky', 'nazov') || t('concretePads')} selected={zaklady === "patky"} onClick={() => setZaklady("patky")} price={CENY.zaklady_patky} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_patky', p)} />
            <OptionCard label={getTranslatedText('zaklady_pasove', 'nazov') || t('stripFoundations')} selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} price={CENY.zaklady_pasove} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_pasove', p)} />
          </div>
        </section>

        {/* 10. Inžiniering */}
        <section id="section-10" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering a dokumentácia'} icon={Layers} stepIdx={10} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('inziniering', 'nazov') || t('engineering')} checked={inziniering} onChange={() => setInziniering(!inziniering)} price={CENY.inziniering} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('inziniering', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} checked={projektACertifikacia} onChange={() => setProjektACertifikacia(!projektACertifikacia)} price={CENY.projektACertifikacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('projektACertifikacia', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} checked={revizia} onChange={() => setRevizia(!revizia)} price={CENY.revizia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('revizia', p)} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 11. Realizácia */}
        <section id="section-11" className="scroll-mt-32 border-b-2 border-slate-200 dark:border-white/10 pb-12">
          <BigSectionHeader title={getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia'} icon={Hammer} stepIdx={11} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('montaz', 'nazov') || t('houseAssembly')} checked={montaz} onChange={() => setMontaz(!montaz)} price={CENY.montaz} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('montaz', p)} />
            
            {(dopravaViditelna || isAdmin) && (
              <div className="relative">
                <AddonRow 
                  label={getTranslatedText('doprava', 'nazov') || t('transportTile')} 
                  checked={doprava && dopravaViditelna} 
                  onChange={() => dopravaViditelna && setDoprava(!doprava)} 
                  price={CENY.doprava} 
                  isAdmin={isAdmin} 
                  onPriceChange={p => handlePriceChange('doprava', p)} 
                  disabled={!dopravaViditelna && isAdmin}
                />
                {!dopravaViditelna && isAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 rounded-lg backdrop-blur-[1px]">
                    <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                      <EyeOff className="w-3 h-3" />
                      Skryté pre verejnosť
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDopravaVisibility();
                    }}
                    disabled={toggleDopravaVisibilityMutation.isPending}
                    className={`absolute -top-3 -right-3 z-10 p-2 rounded-full shadow-lg transition-all ${
                      dopravaViditelna 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title={dopravaViditelna ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                  >
                    {dopravaViditelna ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 12. Služby k nákupu */}
        <section id="section-12" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Dodatočné služby'} description={getTranslatedText('sekcia_sluzby', 'podnadpis') || 'Vyberte si doplnkové služby (voliteľné):'} icon={Sparkles} stepIdx={12} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('sluzba_predaj', 'nazov') || 'Predaj predošlej nehnuteľnosti'} description={getTranslatedText('sluzba_predaj', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší odborníci v realitách.'} checked={predajNehnutelnosti} onChange={() => setPredajNehnutelnosti(!predajNehnutelnosti)} price={0} />
            <AddonRow label={getTranslatedText('sluzba_pozemok', 'nazov') || 'Chcem pozemok pod svoj dom'} description={getTranslatedText('sluzba_pozemok', 'dlhy_popis') || 'Pomôžeme Vám nájsť ideálny pozemok.'} checked={hladamPozemok} onChange={() => setHladamPozemok(!hladamPozemok)} price={0} />
            <AddonRow label={getTranslatedText('sluzba_finance', 'nazov') || 'Finančné služby - úvery/poistky'} description={getTranslatedText('sluzba_finance', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší finančníci.'} checked={financneSluzby} onChange={() => setFinancneSluzby(!financneSluzby)} price={0} />
          </div>
        </section>

      </div>
        
        {/* PRAVÝ STĹPEC - Sticky Účtenka */}
        <aside className="hidden lg:block w-[35%] flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar z-40">
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-4">Zhrnutie konfigurácie</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/5 text-sm">
                <span>Základná cena domu</span>
                <span className="font-bold text-slate-900 dark:text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
              </div>
              
              {renderGroupedSummary()}
            </div>

            <div className="mt-auto border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Celková cena s DPH</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString('sk-SK')} €</span>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} 
                className="w-full bg-gradient-to-r from-[#9E2A2B] to-[#802021] hover:from-[#802021] hover:to-[#611617] text-white font-bold rounded-xl py-3.5 shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Poslať ponuku
              </button>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Mobilný Bottom Sheet pre Zhrnutie */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSummaryOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 rounded-t-3xl shadow-2xl z-50 flex flex-col pointer-events-auto"
            >
              {/* Handle bar */}
              <div className="w-full flex justify-center py-3 flex-shrink-0 cursor-pointer" onClick={() => setIsMobileSummaryOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-6 pb-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Zhrnutie konfigurácie</h3>
                <button onClick={() => setIsMobileSummaryOpen(false)} className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body (Grouped Summary) */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/5 text-sm">
                  <span>Základná cena domu</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
                </div>
                {renderGroupedSummary()}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 flex flex-col gap-4 flex-shrink-0 pb-8">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Celková cena s DPH</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString('sk-SK')} €</span>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileSummaryOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-contact-modal'));
                    }, 300);
                  }}
                  className="w-full bg-gradient-to-r from-[#9E2A2B] to-[#802021] text-white font-bold rounded-2xl py-4 shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Mám záujem o ponuku
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plávajúca cena (Iba pre mobilné zariadenia) */}
      <FloatingPrice 
        price={totalPrice} 
        isVisible={true} 
        onSendQuote={handleSendQuoteFromFloating}
        dom={dom}
        vyrobca="Ticab house"
        mobileOnly={true}
        onToggleSummary={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
        isSummaryOpen={isMobileSummaryOpen}
      />
    </div>
  );
}
