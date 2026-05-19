import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import FloatingPrice from "./FloatingPrice";
import { 
  Home, Check, Send, X, Thermometer, Zap, Layout, Hammer, 
  CheckCircle, Eye, EyeOff, Lock, ChevronDown, ChevronUp, 
  Paintbrush, DoorOpen, Wrench, Layers, Droplet, Flame, CheckSquare, Sparkles
} from "lucide-react";

// ── Glassmorphism Komponenty ──────────────────────────────────────────────
const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon }) => {
  const isStandard = price === 0;
  return (
  <button onClick={onClick} className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all duration-500 w-full text-left active:scale-[0.98] gap-2 overflow-hidden group ${selected ? 'border-red-500 bg-gradient-to-br from-red-500/10 to-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] scale-[1.02] backdrop-blur-md' : isStandard ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 backdrop-blur-sm' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] backdrop-blur-sm'}`}>
    {selected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-80" />}
    
    {/* Horná časť: Ikona, Názov a Checkbox */}
    <div className="flex items-start justify-between gap-4 w-full relative z-10">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${selected ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/30 rotate-3' : 'bg-white/5 text-slate-400 group-hover:text-slate-300 group-hover:scale-110'}`}>
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 ${selected ? 'scale-110' : 'scale-100'}`} />
          </div>
        )}
        <div className="flex-1 mt-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`font-black text-base sm:text-lg transition-colors duration-300 ${selected ? 'text-white' : 'text-slate-200'}`}>{label}</span>
            {isA0 && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">A0 Certifikácia</span>}
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>}
        </div>
      </div>
      
      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 mt-1 ${selected ? 'border-red-500 bg-red-500 scale-110 shadow-lg shadow-red-500/40' : 'border-slate-700 bg-slate-950/50'}`}>
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </div>
    
    {/* Spodná časť: Cena */}
    <div className="w-full flex justify-end relative z-10 pt-2 mt-2 border-t border-white/5">
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-md" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-500">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
        </div>
      ) : (
        <div className="text-right flex flex-col items-end justify-center">
          <span className={`block font-black transition-colors duration-300 ${selected ? 'text-base text-red-400' : isStandard ? 'text-sm text-emerald-400' : 'text-base text-slate-500'}`}>
            {isStandard ? 'Základný štandard' : `+${price.toLocaleString()} €`}
          </span>
          {isStandard && (
            <span className={`block text-[10px] uppercase font-bold tracking-wider mt-0.5 ${selected ? 'text-red-400/80' : 'text-emerald-500/80'}`}>
              (Bez príplatku)
            </span>
          )}
        </div>
      )}
    </div>
  </button>
  );
};

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t, icon: Icon }) => (
  <button onClick={!disabled && !locked ? onChange : undefined} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 w-full active:scale-[0.98] group overflow-hidden relative gap-4 ${locked ? 'border-emerald-500/30 bg-emerald-500/5 cursor-not-allowed' : checked ? 'border-red-500 bg-gradient-to-r from-red-500/10 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)] scale-[1.01] backdrop-blur-md' : disabled ? 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] backdrop-blur-sm'}`}>
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    
    <div className="flex items-start sm:items-center gap-4 w-full relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${locked ? 'bg-emerald-500/20 text-emerald-400' : checked ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
        {Icon ? <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${checked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />)}
      </div>
      <div className="text-left flex-1 pr-4">
        <span className={`font-bold text-base sm:text-lg block transition-colors duration-300 ${checked || locked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        {description && <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        {locked && <span className="text-[10px] sm:text-[11px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> {t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
      
      {/* Checkbox na mobile zobrazený hore vedľa nadpisu, na desktope skrytý */}
      <div className={`sm:hidden w-6 h-6 mt-1 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500 scale-110' : 'bg-slate-950/50 border-slate-700'}`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
    
    {/* Cena presunutá na samostatný riadok na mobile, na desktope vpravo */}
    <div className="flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0 relative z-10 gap-4">
      <div className="flex-shrink-0 text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <div className="text-right flex flex-col items-end justify-center">
            <span className={`block font-black transition-colors duration-300 ${locked ? 'text-sm text-emerald-400' : price === 0 ? 'text-sm text-emerald-400' : 'text-base text-slate-400'}`}>
              {price === 0 ? 'Základný štandard' : `+${price.toLocaleString()} €`}
            </span>
            {price === 0 && (
              <span className={`block text-[10px] uppercase font-bold tracking-wider mt-0.5 ${locked ? 'text-emerald-500/80' : 'text-emerald-500/80'}`}>
                (Bez príplatku)
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Checkbox na desktope zobrazený vpravo od ceny */}
      <div className={`hidden sm:flex w-6 h-6 rounded border-2 items-center justify-center transition-all duration-300 flex-shrink-0 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500 scale-110' : 'bg-slate-950/50 border-slate-700'}`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${value > 0 ? 'bg-slate-800 text-white' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-300'}`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-red-400 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10 backdrop-blur-sm">−</button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-500'}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">+</button>
    </div>
  </div>
);

const SectionLabel = ({ label, color = 'gray' }) => {
  const colorMap = {
    'gray': 'text-slate-400',
    'orange': 'text-orange-400',
    'teal': 'text-teal-400',
    'amber': 'text-amber-400',
    'blue': 'text-blue-400',
    'purple': 'text-purple-400',
    'red': 'text-red-400',
    'emerald': 'text-emerald-400',
    'green': 'text-green-400'
  };
  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};

const BigSectionHeader = ({ title, description, icon: Icon, stepIdx, totalSteps }) => (
  <div className="mb-8 border-b border-white/10 pb-6">
    <div className="lg:hidden text-red-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-red-500"></span>
      Krok {stepIdx + 1} z {totalSteps}
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">{title}</h2>
        {description && <p className="text-slate-400 text-sm lg:text-base leading-relaxed">{description}</p>}
      </div>
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t('inquiryForm')}</h2>
        <p className="text-slate-400 mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('nameSurname')}</label><input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('email')}</label><input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('phone')}</label><input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('city')}</label><input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('note')}</label><textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"></textarea></div>
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

  return (
    <div className="flex flex-col w-full relative mt-8 font-sans">
      {/* Vysvetlenie Štandardu */}
      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-lg">
        <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Prémiový drevodom v základnej cene</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Domy Ticab House sú štandardne dodávané ako prémiové drevodomy s kvalitným dreveným obkladom fasády aj interiéru. Tento luxusný drevený štandard je už zahrnutý v základnej cene. Priplácate si výlučne iba za zmeny štandardu (napr. ak chcete vymeniť drevo za sadrokartón).
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full relative">
        {/* ĽAVÝ STĹPEC - Možnosti (cca 65%) */}
        <div className="flex-1 min-w-0 w-full lg:w-[65%] space-y-12 pb-32">
        
        {/* 0. Účel stavby */}
        <section id="section-0" className="scroll-mt-32">
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
        <section id="section-1" className="scroll-mt-32">
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
        <section id="section-2" className="scroll-mt-32">
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
        <section id="section-3" className="scroll-mt-32">
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
        <section id="section-4" className="scroll-mt-32">
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
        <section id="section-5" className="scroll-mt-32">
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
        <section id="section-6" className="scroll-mt-32">
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
        <section id="section-7" className="scroll-mt-32">
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
        <section id="section-8" className="scroll-mt-32">
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
        <section id="section-9" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy'} icon={Wrench} stepIdx={9} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('zaklady_bez', 'nazov') || t('noFoundations')} selected={zaklady === "bez"} onClick={() => setZaklady("bez")} price={0} />
            <OptionCard label={getTranslatedText('zaklady_vruty', 'nazov') || t('groundScrews')} selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} price={CENY.zaklady_vruty} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_vruty', p)} />
            <OptionCard label={getTranslatedText('zaklady_patky', 'nazov') || t('concretePads')} selected={zaklady === "patky"} onClick={() => setZaklady("patky")} price={CENY.zaklady_patky} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_patky', p)} />
            <OptionCard label={getTranslatedText('zaklady_pasove', 'nazov') || t('stripFoundations')} selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} price={CENY.zaklady_pasove} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('zaklady_pasove', p)} />
          </div>
        </section>

        {/* 10. Inžiniering */}
        <section id="section-10" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering a dokumentácia'} icon={Layers} stepIdx={10} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('inziniering', 'nazov') || t('engineering')} checked={inziniering} onChange={() => setInziniering(!inziniering)} price={CENY.inziniering} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('inziniering', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} checked={projektACertifikacia} onChange={() => setProjektACertifikacia(!projektACertifikacia)} price={CENY.projektACertifikacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('projektACertifikacia', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} checked={revizia} onChange={() => setRevizia(!revizia)} price={CENY.revizia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('revizia', p)} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 11. Realizácia */}
        <section id="section-11" className="scroll-mt-32">
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
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
            <h3 className="text-lg font-black text-white mb-4 border-b border-white/10 pb-4">Zhrnutie konfigurácie</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Základná cena domu</span>
                <span className="font-bold text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
              </div>
              
              {totalPrice > (dom?.zakladna_cena || 0) && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 mt-4">Príplatková výbava:</div>
                  {izolaciaStien !== "150mm" && CENY[`izolacia_stien_${izolaciaStien}`] > 0 && (
                    <div className="flex justify-between text-slate-400"><span>Izolácia stien {izolaciaStien}</span><span>+{CENY[`izolacia_stien_${izolaciaStien}`]} €</span></div>
                  )}
                  {izolaciaPodlahy !== "150mm" && CENY[`izolacia_podlahy_${izolaciaPodlahy}`] > 0 && (
                    <div className="flex justify-between text-slate-400"><span>Izolácia podlahy {izolaciaPodlahy}</span><span>+{CENY[`izolacia_podlahy_${izolaciaPodlahy}`]} €</span></div>
                  )}
                  {izolaciaStropu !== "150mm" && CENY[`izolacia_stropu_${izolaciaStropu}`] > 0 && (
                    <div className="flex justify-between text-slate-400"><span>Izolácia stropu {izolaciaStropu}</span><span>+{CENY[`izolacia_stropu_${izolaciaStropu}`]} €</span></div>
                  )}
                  {tepelneCerpadlo === "ano" && <div className="flex justify-between text-slate-400"><span>Tepelné čerpadlo</span><span>+{CENY.tepelne_cerpadlo} €</span></div>}
                  {pripravaNaRekuperaciu && <div className="flex justify-between text-slate-400"><span>Príprava na rekuperáciu</span><span>+{CENY.pripravaNaRekuperaciu} €</span></div>}
                  {rekuperacia === "ano" && <div className="flex justify-between text-slate-400"><span>Rekuperácia</span><span>+{CENY.rekuperacia} €</span></div>}
                  {podlahovoKurenie && <div className="flex justify-between text-slate-400"><span>Podlahové kúrenie</span><span>+{CENY.podlahove_kurenie} €</span></div>}
                  {klimatizacia && <div className="flex justify-between text-slate-400"><span>Klimatizácia</span><span>+{CENY.klimatizacia} €</span></div>}
                  {pripravaNaKrb && <div className="flex justify-between text-slate-400"><span>Príprava na krb</span><span>+{CENY.pripravaKrb} €</span></div>}
                  {ochranaKachle && <div className="flex justify-between text-slate-400"><span>Ochrana (Kachle)</span><span>+{CENY.ochranaKachle} €</span></div>}
                  {fasada !== "drevo_smrek" && <div className="flex justify-between text-slate-400"><span>Fasáda: {fasada}</span><span>+{CENY[`fasada_${fasada}`]} €</span></div>}
                  {strecha !== "korugovan_plech" && <div className="flex justify-between text-slate-400"><span>Strecha: falcovaný profil</span><span>+{CENY.strecha_falcovane} €</span></div>}
                  {odkvapy === "ano" && <div className="flex justify-between text-slate-400"><span>Odkvapy</span><span>+{CENY.odkvapy} €</span></div>}
                  {vchodoveDvere === "kovove" && <div className="flex justify-between text-slate-400"><span>Vchodové dvere: kovové</span><span>+{CENY.dvere_kovove} €</span></div>}
                  {obkladStien !== "smrek_8cm" && <div className="flex justify-between text-slate-400"><span>Obklad stien: {obkladStien}</span><span>+{CENY[`obklad_stien_${obkladStien}`] || CENY[`obklad_${obkladStien}`]} €</span></div>}
                  {interieroveDvere === "posuvne" && <div className="flex justify-between text-slate-400"><span>Interiérové dvere posuvné</span><span>+{CENY.dvere_posuvne} €</span></div>}
                  {elektro !== "eu" && <div className="flex justify-between text-slate-400"><span>Elektroinštalácia: {elektro}</span><span>+{CENY[`elektro_${elektro}`]} €</span></div>}
                  {bleskozvod && <div className="flex justify-between text-slate-400"><span>Bleskozvod</span><span>+{CENY.bleskozvod} €</span></div>}
                  {prepat && <div className="flex justify-between text-slate-400"><span>Prepäťová ochrana</span><span>+{CENY.prepat} €</span></div>}
                  {pripravaNaSolarnePanely && <div className="flex justify-between text-slate-400"><span>Príprava na solárne panely</span><span>+{CENY.pripravaNaSolarnePanely} €</span></div>}
                  {sprchovyKut === "radaway" && <div className="flex justify-between text-slate-400"><span>Sprchový kút Radaway</span><span>+{CENY.sprchovyKut} €</span></div>}
                  {vana && <div className="flex justify-between text-slate-400"><span>Vaňa</span><span>+{CENY.vana} €</span></div>}
                  {bateria === "grohe" && <div className="flex justify-between text-slate-400"><span>Batérie Grohe</span><span>+{CENY.bateria} €</span></div>}
                  {skrinka && <div className="flex justify-between text-slate-400"><span>Skrinka s umývadlom</span><span>+{CENY.skrinka} €</span></div>}
                  {inziniering && <div className="flex justify-between text-slate-400"><span>Inžiniering</span><span>+{CENY.inziniering} €</span></div>}
                  {projektACertifikacia && <div className="flex justify-between text-slate-400"><span>Projekt a certifikácia</span><span>+{CENY.projektACertifikacia} €</span></div>}
                  {revizia && <div className="flex justify-between text-slate-400"><span>Revízia</span><span>+{CENY.revizia} €</span></div>}
                  {zaklady !== "bez" && <div className="flex justify-between text-slate-400"><span>Základy: {zaklady}</span><span>+{CENY[`zaklady_${zaklady}`]} €</span></div>}
                  {montaz && <div className="flex justify-between text-slate-400"><span>Montáž domu</span><span>+{CENY.montaz} €</span></div>}
                  {doprava && dopravaViditelna && <div className="flex justify-between text-slate-400"><span>Doprava</span><span>+{CENY.doprava} €</span></div>}
                </div>
              )}
            </div>

            <div className="mt-auto border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">Celková cena</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">{totalPrice.toLocaleString('sk-SK')} €</span>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl py-3 shadow-lg transition-all"
              >
                <Send className="inline-block w-4 h-4 mr-2" />
                Poslať ponuku
              </button>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Plávajúca cena (Iba pre mobilné zariadenia) */}
      <FloatingPrice 
        price={totalPrice} 
        isVisible={true} 
        onSendQuote={handleSendQuoteFromFloating}
        dom={dom}
        vyrobca="Ticab house"
        mobileOnly={true}
      />
    </div>
  );
}
