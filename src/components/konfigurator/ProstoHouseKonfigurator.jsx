import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Check, Info, Send, X, Thermometer, Zap, Layout, Hammer,
  CheckCircle, FileText, Eye, Lock, ChevronDown, ChevronUp, MessageCircle, ChevronLeft, ChevronRight,
  Paintbrush, DoorOpen, Wrench, Layers, Maximize, Settings, Droplet, Sun, Wind, Flame, SunDim, CheckSquare
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { prostoHouseTranslations } from '../translations/ProstoHouseTranslations';
import ProstoHousePriceSaver from '../ProstoHousePriceSaver';
import ProstoHouseSummary from './ProstoHouseSummary';
import SaveQuoteButton from '../SaveQuoteButton';
import A0StatusHint from './A0StatusHint';
import KonfiguratorGaleria from './KonfiguratorGaleria';

// ── Mini komponenty s Ikonami a Animáciami ─────────────────────────────────────

const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon }) => (
  <button onClick={onClick} className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 w-full text-left active:scale-[0.98] gap-3 ${selected ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)] scale-[1.02]' : 'border-white/10 bg-slate-900 hover:border-white/20 hover:bg-slate-800'}`}>
    <div className="flex items-start gap-4 w-full">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${selected ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 rotate-3' : 'bg-slate-800 text-slate-400'}`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${selected ? 'scale-110' : 'scale-100'}`} />
        </div>
      )}
      
      <div className="flex-1 min-w-0 mt-0.5">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`font-bold text-base transition-colors duration-300 ${selected ? 'text-red-400' : 'text-slate-200'}`}>{label}</span>
          {isA0 && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">A0 Certifikácia</span>}
        </div>
        {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
      </div>
      
      <div className="flex flex-col items-end flex-shrink-0">
        <div className={`w-6 h-6 mb-2 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selected ? 'border-red-500 bg-red-500 scale-110' : 'border-slate-700 bg-slate-950'}`}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
        
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950 border border-red-500/30 rounded px-2 py-1 mt-1" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-base font-bold whitespace-nowrap transition-colors duration-300 ${selected ? 'text-red-400' : 'text-slate-500'}`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t, icon: Icon }) => (
  <button onClick={!disabled && !locked ? onChange : undefined} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 w-full active:scale-[0.98] ${locked ? 'border-emerald-500/30 bg-emerald-500/10 cursor-not-allowed' : checked ? 'border-red-500 bg-red-500/10 shadow-sm scale-[1.01]' : disabled ? 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed' : 'border-white/10 bg-slate-900 hover:border-white/20 hover:bg-slate-800'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${locked ? 'bg-emerald-500/20 text-emerald-400' : checked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-400'}`}>
        {Icon ? <Icon className={`w-5 h-5 transition-transform duration-300 ${checked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />)}
      </div>
      <div className="text-left">
        <span className={`font-bold text-base block transition-colors duration-300 ${checked || locked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        {locked && <span className="text-xs uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> {t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
    </div>
    <div className="flex items-center gap-4 ml-3 flex-shrink-0">
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500 scale-110' : 'bg-slate-950 border-slate-700'}`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-shrink-0 min-w-[70px] text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950 border border-red-500/30 rounded px-2 py-1" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-base font-bold whitespace-nowrap transition-colors duration-300 ${locked ? 'text-emerald-400' : 'text-slate-400'}`}>
            {price === 0 ? '0 €' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-white/10 bg-slate-900 transition-all duration-300 hover:border-white/20">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-800 text-slate-400 transition-colors duration-300 ${value > 0 ? 'text-white bg-slate-700' : ''}`}>
          <Icon className={`w-5 h-5 transition-transform duration-300 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-base transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-300'}`}>{label}</div>
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
    <div className="flex items-center gap-4">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10">−</button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-500'}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">+</button>
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
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-8 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {label}
    </div>
  );
};

const BigSectionHeader = ({ title, description, icon: Icon }) => (
  <div className="mb-8 border-b border-white/10 pb-6 mt-16 first:mt-0">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 flex-shrink-0 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <Icon className="w-6 h-6 text-red-500" />
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
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

// ── Hlavný Komponent (Continuous Scroll) ────────────────────────────────────────────────

export default function ProstoHouseKonfigurator({ house, houseCode, dom: domProp }) {
  const { language } = useLanguage();
  const t = (key) => prostoHouseTranslations[language]?.[key] || prostoHouseTranslations['sk']?.[key] || key;

  const urlParams = new URLSearchParams(window.location.search);
  const domIdFromUrl = urlParams.get('id');

  const { data: domFromDb } = useQuery({
    queryKey: [`dom-${houseCode}`, domIdFromUrl],
    queryFn: async () => {
      if (!domIdFromUrl) return null;
      const domy = await base44.entities.Dom.filter({ id: domIdFromUrl });
      return domy[0] || null;
    },
    enabled: !!domIdFromUrl && !domProp, staleTime: 0, cacheTime: 0, refetchOnMount: 'always'
  });

  const effectiveDom = domProp || domFromDb;
  const effectiveDomId = domProp?.id || domFromDb?.id || domIdFromUrl;

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me().catch(() => null) });
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const hasExtension = house.options.extension && house.options.extension.length > 0;

  // Stavy konfigurátora
  const [customPrices, setCustomPrices] = useState({});
  const [typStavby, setTypStavby] = useState('rekreacna');

  const [mountingIdx, setMountingIdx] = useState(0);
  const [extensionIdx, setExtensionIdx] = useState(0);
  const [insulationIdx, setInsulationIdx] = useState(0);
  const [foundationIdx, setFoundationIdx] = useState(0);
  const [interiorIdx, setInteriorIdx] = useState(0);
  const [doorsIdx, setDoorsIdx] = useState(0);
  const [facadeIdx, setFacadeIdx] = useState(0);

  const [electricity, setElectricity] = useState(false);
  const [water, setWater] = useState(false);
  const [sanita, setSanita] = useState(false);
  const [boiler, setBoiler] = useState(false);
  const [heatPump, setHeatPump] = useState(false);
  const [recuperation, setRecuperation] = useState(false);
  const [windowLamination, setWindowLamination] = useState(false);
  const [windowTint, setWindowTint] = useState(false);
  const [roofWindows, setRoofWindows] = useState(0);
  const [fixWindows, setFixWindows] = useState(0);
  const [tiltWindowsBig, setTiltWindowsBig] = useState(0);
  const [tiltWindowsSmall, setTiltWindowsSmall] = useState(0);
  const [interiorDoorsCount, setInteriorDoorsCount] = useState(0);
  const [laminateFloors, setLaminateFloors] = useState(false);
  const [floorHeating, setFloorHeating] = useState(false);
  const [networks, setNetworks] = useState(false);
  const [engineering, setEngineering] = useState(false);
  const [projectant, setProjectant] = useState(false);
  const [revision, setRevision] = useState(true);
  const [realEstate, setRealEstate] = useState(false);
  const [landSearch, setLandSearch] = useState(false);
  const [financing, setFinancing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (domFromDb?.konfigurator_custom_ceny_prosto_house?.[houseCode]) {
      setCustomPrices(domFromDb.konfigurator_custom_ceny_prosto_house[houseCode]);
    }
  }, [domFromDb]);

  useEffect(() => {
    if (typStavby === 'rodinny_dom') {
      setInsulationIdx(2); setHeatPump(true); setRecuperation(true); setProjectant(true);
    } else {
      setInsulationIdx(0); setHeatPump(false); setRecuperation(false); setProjectant(false);
    }
  }, [typStavby]);

  const getPrice = (category, indexOrKey, defaultPrice) => {
    const key = `${category}-${indexOrKey}`;
    return customPrices[key] !== undefined ? customPrices[key] : defaultPrice;
  };

  const updatePrice = (category, indexOrKey, newPrice) => {
    const key = `${category}-${indexOrKey}`;
    setCustomPrices(prev => ({ ...prev, [key]: newPrice }));
  };

  const isA0Compliant = useMemo(() => {
    return house.options.insulation[insulationIdx]?.label.includes('250 mm') && heatPump && recuperation && projectant;
  }, [insulationIdx, heatPump, recuperation, projectant]);

  const totalPrice = useMemo(() => {
    let total = house.basePrice;
    total += getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx]?.price || 0);
    if (hasExtension) total += getPrice('extension', extensionIdx, house.options.extension[extensionIdx]?.price || 0);
    total += getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx]?.price || 0);
    total += getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx]?.price || 0);
    total += getPrice('interior', interiorIdx, house.options.interior[interiorIdx]?.price || 0);
    total += getPrice('doors', doorsIdx, house.options.doors[doorsIdx]?.price || 0);
    total += getPrice('facade', facadeIdx, house.options.facade[facadeIdx]?.price || 0);
    if (electricity) total += getPrice('addon', 'electricity', house.addons.electricity);
    if (water) total += getPrice('addon', 'water', house.addons.water);
    if (sanita) total += getPrice('addon', 'sanita', house.addons.sanita);
    if (boiler) total += getPrice('addon', 'boiler', house.addons.boiler);
    if (heatPump) total += getPrice('addon', 'heatPump', house.addons.heatPump);
    if (recuperation) total += getPrice('addon', 'recuperation', house.addons.recuperation);
    if (windowLamination) total += getPrice('addon', 'windowLamination', house.addons.windowLamination);
    if (windowTint) total += getPrice('addon', 'windowTint', house.addons.windowTint);
    total += roofWindows * getPrice('addon', 'roofWindow', house.addons.roofWindow);
    total += fixWindows * getPrice('addon', 'fixWindow', house.addons.fixWindow);
    total += tiltWindowsBig * getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig);
    total += tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall);
    total += interiorDoorsCount * getPrice('addon', 'interiorDoor', house.addons.interiorDoor);
    if (laminateFloors) total += getPrice('addon', 'laminateFloors', house.addons.laminateFloors);
    if (floorHeating) total += getPrice('addon', 'floorHeating', house.addons.floorHeating);
    if (networks) total += getPrice('addon', 'networks', house.addons.networks);
    if (engineering) total += getPrice('addon', 'engineering', house.addons.engineering);
    if (projectant) total += getPrice('addon', 'projectant', house.addons.projectant);
    if (revision) total += getPrice('addon', 'revision', house.addons.revision);
    return total;
  }, [mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
      electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
      roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount, laminateFloors,
      floorHeating, networks, engineering, projectant, revision, customPrices]);

  const buildSelectedItems = () => {
    const items = [];
    items.push({ name: house.name, price: house.basePrice, selected: true, section: "base" });
    if (mountingIdx > 0) items.push({ name: `Montáž: ${house.options.mounting[mountingIdx].label}`, price: getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx].price), selected: true, section: "hruba" });
    if (hasExtension && extensionIdx > 0) items.push({ name: `Predĺženie: ${house.options.extension[extensionIdx].label}`, price: getPrice('extension', extensionIdx, house.options.extension[extensionIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Izolácia: ${house.options.insulation[insulationIdx].label}`, price: getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx].price), selected: true, section: "hruba" });
    if (foundationIdx > 0) items.push({ name: `Základy: ${house.options.foundation[foundationIdx].label}`, price: getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Vstupné dvere: ${house.options.doors[doorsIdx].label}`, price: getPrice('doors', doorsIdx, house.options.doors[doorsIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Fasáda: ${house.options.facade[facadeIdx].label}`, price: getPrice('facade', facadeIdx, house.options.facade[facadeIdx].price), selected: true, section: "hruba" });
    if (interiorIdx > 0) items.push({ name: `Interiér: ${house.options.interior[interiorIdx].label}`, price: getPrice('interior', interiorIdx, house.options.interior[interiorIdx].price), selected: true, section: "holodom" });
    if (electricity) items.push({ name: "Elektroinštalácia", price: getPrice('addon', 'electricity', house.addons.electricity), selected: true, section: "holodom" });
    if (water) items.push({ name: "Voda a kanalizácia", price: getPrice('addon', 'water', house.addons.water), selected: true, section: "holodom" });
    if (sanita) items.push({ name: "Sanita", price: getPrice('addon', 'sanita', house.addons.sanita), selected: true, section: "holodom" });
    if (boiler) items.push({ name: "Bojler", price: getPrice('addon', 'boiler', house.addons.boiler), selected: true, section: "holodom" });
    if (heatPump) items.push({ name: "Tepelné čerpadlo", price: getPrice('addon', 'heatPump', house.addons.heatPump), selected: true, section: "kluc" });
    if (recuperation) items.push({ name: "Rekuperácia", price: getPrice('addon', 'recuperation', house.addons.recuperation), selected: true, section: "kluc" });
    if (laminateFloors) items.push({ name: "Laminátové podlahy", price: getPrice('addon', 'laminateFloors', house.addons.laminateFloors), selected: true, section: "kluc" });
    if (floorHeating) items.push({ name: "Podlahové kúrenie", price: getPrice('addon', 'floorHeating', house.addons.floorHeating), selected: true, section: "kluc" });
    if (windowLamination) items.push({ name: "Laminácia okien", price: getPrice('addon', 'windowLamination', house.addons.windowLamination), selected: true, section: "holodom" });
    if (windowTint) items.push({ name: "Tónované sklá", price: getPrice('addon', 'windowTint', house.addons.windowTint), selected: true, section: "holodom" });
    if (interiorDoorsCount > 0) items.push({ name: `Interiérové dvere (${interiorDoorsCount} ks)`, price: interiorDoorsCount * getPrice('addon', 'interiorDoor', house.addons.interiorDoor), selected: true, section: "holodom" });
    if (roofWindows > 0) items.push({ name: `Strešné okná (${roofWindows} ks)`, price: roofWindows * getPrice('addon', 'roofWindow', house.addons.roofWindow), selected: true, section: "hruba" });
    if (fixWindows > 0) items.push({ name: `Fixné okná (${fixWindows} ks)`, price: fixWindows * getPrice('addon', 'fixWindow', house.addons.fixWindow), selected: true, section: "hruba" });
    if (tiltWindowsBig > 0) items.push({ name: `Výklopné okná veľké (${tiltWindowsBig} ks)`, price: tiltWindowsBig * getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig), selected: true, section: "hruba" });
    if (tiltWindowsSmall > 0) items.push({ name: `Výklopné okná malé (${tiltWindowsSmall} ks)`, price: tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall), selected: true, section: "hruba" });
    if (networks) items.push({ name: "Prípojky sietí", price: getPrice('addon', 'networks', house.addons.networks), selected: true, section: "docs" });
    if (engineering) items.push({ name: "Inžiniering", price: getPrice('addon', 'engineering', house.addons.engineering), selected: true, section: "docs" });
    if (projectant) items.push({ name: "Projektant", price: getPrice('addon', 'projectant', house.addons.projectant), selected: true, section: "docs" });
    if (revision) items.push({ name: "Revízie", price: getPrice('addon', 'revision', house.addons.revision), selected: true, section: "docs" });
    return items;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target;
      const response = await base44.functions.invoke('odosliCenovuPonukuProstoHouse', {
        dom_id: effectiveDomId,
        klient_meno: form.name.value, klient_email: form.email.value,
        klient_telefon: form.phone.value, klient_adresa: form.city.value, klient_poznamka: form.note.value,
        selectedItems: buildSelectedItems(), totalPrice, language,
        montazHolodomu: mountingIdx > 0,
        izolaciaNavysenie: house.options.insulation[insulationIdx].label.includes('250') ? 'premium' : 'standard',
        zaklady: house.options.foundation[foundationIdx].label,
        vstupneDvere: house.options.doors[doorsIdx].label,
        elektroinstalacia: electricity, vodaKanalizacia: water, sanitaKomplet: sanita, bojler: boiler,
        tepelneCerpadlo: heatPump, rekuperacia: recuperation, pripojkaSiete: networks,
        stresneOkno: roofWindows, bocneOknoFixne: fixWindows, bocneOknoVyklopne90: tiltWindowsBig, bocneOknoVyklopne55: tiltWindowsSmall,
        povrchokaOkien: windowLamination, tonovaneSkla: windowTint,
        vonkajsiaFasada: facadeIdx === 1 ? 'suchana' : 'standard',
        interierFinis: house.options.interior[interiorIdx].label,
        vnutornePodlahy: laminateFloors, podlahovVykurovanie: floorHeating,
        interieroveDvere: interiorDoorsCount, inziniering: engineering, projektA0: projectant, revizna: revision, doprava: 0,
        predlzenie: hasExtension && extensionIdx > 0 ? house.options.extension[extensionIdx].label : 0,
        predajNehnutelnosti: realEstate, hladaniePozemku: landSearch, financneSluzby: financing
      });
      if (response?.data?.success) { alert('✓ Cenová ponuka bola úspešne odoslaná na váš email!'); setModalOpen(false); }
      else { alert('Chyba: ' + (response?.data?.error || 'Neznáma chyba')); }
    } catch (error) { alert('Chyba pri odosielaní: ' + error.message); }
    finally { setIsSubmitting(false); }
  };

  const konfigData = {
    mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
    electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
    roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount,
    laminateFloors, floorHeating, networks, engineering, projectant, revision, typStavby, language
  };

  const phCode = houseCode.replace('ph0', 'PH-0').replace('ph', 'PH-');

  return (
    <div className="bg-slate-950 min-h-screen pb-32 lg:pb-16 font-['Outfit']">
      
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
          
          {/* ĽAVÝ STĹPEC: Plynulý formulár konfigurátora */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Mobilná hlavička domu */}
            <div className="lg:hidden mb-8">
              <h1 className="text-3xl font-black text-white">{house.name}</h1>
              {isA0Compliant && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest mt-2 inline-block font-bold">A0 Certifikát</span>}
            </div>

            {/* SEKCIA 1: Účel stavby */}
            <div className="mb-12">
              <BigSectionHeader title="Základné rozhodnutie" description="Na aký účel plánujete dom využívať? Toto rozhodnutie nám pomôže automaticky predvybrať technológie potrebné pre stavebné povolenie." icon={Home} />
              
              <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => setTypStavby('rekreacna')} className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 active:scale-95 ${typStavby === 'rekreacna' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border-white/10 bg-slate-900 hover:border-white/20 hover:bg-slate-800'}`}>
                  <div className={`p-4 rounded-2xl transition-all duration-500 ${typStavby === 'rekreacna' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 rotate-3' : 'bg-slate-800 text-slate-400'}`}>
                    <Sun className={`w-10 h-10 transition-transform ${typStavby === 'rekreacna' ? 'scale-110' : ''}`} />
                  </div>
                  <div className="text-center">
                    <span className={`block text-lg font-black mb-1 transition-colors ${typStavby === 'rekreacna' ? 'text-blue-400' : 'text-slate-300'}`}>{t('recreationalBuilding')}</span>
                    <span className="text-sm text-slate-500">Chata, víkendový dom. Nevyžaduje energetický certifikát A0.</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${typStavby === 'rekreacna' ? 'border-blue-500 bg-blue-500 scale-110' : 'border-slate-700 bg-slate-950'}`}>
                    {typStavby === 'rekreacna' && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>
                <button onClick={() => setTypStavby('rodinny_dom')} className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 active:scale-95 ${typStavby === 'rodinny_dom' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02]' : 'border-white/10 bg-slate-900 hover:border-white/20 hover:bg-slate-800'}`}>
                  <div className={`p-4 rounded-2xl relative transition-all duration-500 ${typStavby === 'rodinny_dom' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 -rotate-3' : 'bg-slate-800 text-slate-400'}`}>
                    <Home className={`w-10 h-10 transition-transform ${typStavby === 'rodinny_dom' ? 'scale-110' : ''}`} />
                    <span className="absolute -top-3 -right-3 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-full font-black border-2 border-slate-900 animate-pulse">A0</span>
                  </div>
                  <div className="text-center">
                    <span className={`block text-lg font-black mb-1 transition-colors ${typStavby === 'rodinny_dom' ? 'text-emerald-400' : 'text-slate-300'}`}>{t('familyHouseA0')}</span>
                    <span className="text-sm text-slate-500">Trvalé bývanie. Splnený zákonný štandard (zateplenie, čerpadlo, rekuperácia).</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${typStavby === 'rodinny_dom' ? 'border-emerald-500 bg-emerald-500 scale-110' : 'border-slate-700 bg-slate-950'}`}>
                    {typStavby === 'rodinny_dom' && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>
              </div>
              <div className="mt-6">
                <A0StatusHint isA0Compliant={isA0Compliant} insulationIdx={insulationIdx} heatPump={heatPump} recuperation={recuperation} projectant={projectant} onGoToSection={() => {}} t={t} />
              </div>
            </div>

            {/* SEKCIA 2: Konštrukcia a Základy */}
            <div className="mb-12">
              <BigSectionHeader title="Hrubá stavba a Konštrukcia" description="Vyberte si spôsob dodania a typ založenia stavby." icon={Hammer} />
              <div className="space-y-6">
                {hasExtension && (
                  <div>
                    <SectionLabel label={t('houseExtension')} color="teal" />
                    <div className="grid grid-cols-2 gap-3">
                      {house.options.extension.map((opt, i) => {
                        const labels = { 0: t('noExtension'), 1: '+1,2 m', 2: '+2,4 m', 3: '+3,6 m', 4: '+4,8 m' };
                        return <OptionCard key={i} icon={Maximize} label={labels[i] || opt.label} price={getPrice('extension', i, opt.price)} selected={extensionIdx === i} onClick={() => setExtensionIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('extension', i, p)} />;
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <SectionLabel label={t('foundations')} color="amber" />
                  <div className="space-y-3">
                    {house.options.foundation.map((opt, i) => {
                      const labels = { 0: t('noFoundations'), 1: t('pilotsFootings'), 2: t('foundationSlab'), 3: t('stripFoundations') };
                      const descs = { 0: t('noFoundationsDesc'), 1: t('pilotsFootingsDesc'), 2: t('foundationSlabDesc'), 3: t('stripFoundationsDesc') };
                      return <OptionCard key={i} icon={Layers} label={labels[i]} price={getPrice('foundation', i, opt.price)} description={descs[i]} selected={foundationIdx === i} onClick={() => setFoundationIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('foundation', i, p)} />;
                    })}
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('shellAssembly')} color="orange" />
                  <div className="space-y-3">
                    {house.options.mounting.map((opt, i) => (
                      <OptionCard key={i} icon={Wrench} label={i === 0 ? t('noAssemblySelf') : t('withAssembly')} price={getPrice('mounting', i, opt.price)} description={i === 0 ? t('selfAssemblyDesc') : t('proAssemblyDesc')} selected={mountingIdx === i} onClick={() => setMountingIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('mounting', i, p)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 3: Okná a Dvere */}
            <div className="mb-12">
              <BigSectionHeader title="Okná a Vstupné dvere" description="Prispôsobte si presklenie a bezpečnosť vášho nového domu." icon={DoorOpen} />
              <div className="space-y-6">
                <div>
                  <SectionLabel label={t('entryDoors')} color="red" />
                  <div className="space-y-3">
                    {house.options.doors.map((opt, i) => {
                      const labels = { 0: t('doorsStandard'), 1: t('doorsMetal2Locks'), 2: t('doorsPlasticMetal') };
                      const descs = { 0: t('doorsStandardDesc'), 1: t('doorsMetal2LocksDesc'), 2: t('doorsPlasticMetalDesc') };
                      return <OptionCard key={i} icon={DoorOpen} label={labels[i]} price={getPrice('doors', i, opt.price)} description={descs[i]} selected={doorsIdx === i} onClick={() => setDoorsIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('doors', i, p)} />;
                    })}
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('additionalWindows')} color="blue" />
                  <div className="space-y-3">
                    {[
                      { l: t('roofWindow'), p: getPrice('addon', 'roofWindow', house.addons.roofWindow), v: roofWindows, s: setRoofWindows, k: 'roofWindow', i: Sun },
                      { l: t('fixedWindow'), p: getPrice('addon', 'fixWindow', house.addons.fixWindow), v: fixWindows, s: setFixWindows, k: 'fixWindow', i: Layout },
                      { l: t('tiltWindowBig'), p: getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig), v: tiltWindowsBig, s: setTiltWindowsBig, k: 'tiltWindowBig', i: Layout },
                      { l: t('tiltWindowSmall'), p: getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall), v: tiltWindowsSmall, s: setTiltWindowsSmall, k: 'tiltWindowSmall', i: Layout }
                    ].map((item, idx) => (
                      <CounterRow key={idx} icon={item.i} label={item.l} price={item.p} value={item.v} onChange={item.s} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', item.k, p)} />
                    ))}
                  </div>
                </div>
                <div>
                  <SectionLabel label="Úprava okien" color="purple" />
                  <div className="space-y-3">
                    <AddonRow icon={Paintbrush} label={t('windowLamination')} price={getPrice('addon', 'windowLamination', house.addons.windowLamination)} checked={windowLamination} onChange={() => setWindowLamination(!windowLamination)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowLamination', p)} t={t} />
                    <AddonRow icon={SunDim} label={t('tintedGlass')} price={getPrice('addon', 'windowTint', house.addons.windowTint)} checked={windowTint} onChange={() => setWindowTint(!windowTint)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowTint', p)} t={t} />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 4: Zateplenie a Fasáda */}
            <div className="mb-12">
              <BigSectionHeader title="Zateplenie a Fasáda" description="Izolácia je kľúčová. Pre trvalé bývanie (A0) odporúčame hrubšie zateplenie." icon={Thermometer} />
              <div className="space-y-6">
                <div>
                  <SectionLabel label={t('insulationType')} color="blue" />
                  <div className="space-y-3">
                    {house.options.insulation.map((opt, i) => {
                      const labels = { 0: t('yearRound150mm'), 1: t('enhanced200mm'), 2: t('premium250mm'), 3: t('extra300mm') };
                      const descs = { 0: t('yearRound150mmDesc'), 1: t('enhanced200mmDesc'), 2: t('premium250mmDesc'), 3: t('extra300mmDesc') };
                      return <OptionCard key={i} icon={Thermometer} label={labels[i] || opt.label} price={getPrice('insulation', i, opt.price)} description={descs[i] || opt.description} selected={insulationIdx === i} onClick={() => setInsulationIdx(i)} isA0={opt.label.includes('250 mm')} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('insulation', i, p)} />;
                    })}
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('facade')} color="purple" />
                  <div className="space-y-3">
                    {house.options.facade.map((opt, i) => (
                      <OptionCard key={i} icon={Paintbrush} label={i === 0 ? t('facadeStandard') : t('facadeStucco')} price={getPrice('facade', i, opt.price)} description={i === 0 ? t('facadeStandardDesc') : t('facadeStuccoDesc')} selected={facadeIdx === i} onClick={() => setFacadeIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('facade', i, p)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 5: Interiér a Siete */}
            <div className="mb-12">
              <BigSectionHeader title="Interiér a Siete" description="Vyberte si stupeň dokončenia interiéru a rozvody technológií." icon={Layout} />
              <div className="space-y-6">
                <div>
                  <SectionLabel label={t('interiorFinish')} color="emerald" />
                  <div className="space-y-3">
                    {house.options.interior.map((opt, i) => {
                      const labels = { 0: t('noInterior'), 1: t('interiorWood'), 2: t('interiorDrywall') };
                      const descs = { 0: t('noInteriorDesc'), 1: t('interiorWoodDesc'), 2: t('interiorDrywallDesc') };
                      return <OptionCard key={i} icon={Layout} label={labels[i]} price={getPrice('interior', i, opt.price)} description={descs[i]} selected={interiorIdx === i} onClick={() => setInteriorIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('interior', i, p)} />;
                    })}
                  </div>
                </div>
                <div>
                  <SectionLabel label="Podlahy a Interiérové Dvere" color="amber" />
                  <div className="space-y-3">
                    <CounterRow icon={DoorOpen} label={t('interiorDoorsCount')} price={getPrice('addon', 'interiorDoor', house.addons.interiorDoor)} value={interiorDoorsCount} onChange={setInteriorDoorsCount} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'interiorDoor', p)} />
                    <AddonRow icon={Layers} label={t('laminateFloors')} price={getPrice('addon', 'laminateFloors', house.addons.laminateFloors)} checked={laminateFloors} onChange={() => setLaminateFloors(!laminateFloors)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'laminateFloors', p)} t={t} />
                    <AddonRow icon={Flame} label={t('floorHeating')} price={getPrice('addon', 'floorHeating', house.addons.floorHeating)} checked={floorHeating} onChange={() => setFloorHeating(!floorHeating)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'floorHeating', p)} t={t} />
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('pipes')} color="gray" />
                  <div className="space-y-3">
                    <AddonRow icon={Zap} label={t('electricalWiring')} price={getPrice('addon', 'electricity', house.addons.electricity)} checked={electricity} onChange={() => setElectricity(!electricity)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'electricity', p)} t={t} />
                    <AddonRow icon={Droplet} label={t('waterDrainage')} price={getPrice('addon', 'water', house.addons.water)} checked={water} onChange={() => setWater(!water)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'water', p)} t={t} />
                    <AddonRow icon={Droplet} label={t('sanitary')} price={getPrice('addon', 'sanita', house.addons.sanita)} checked={sanita} onChange={() => setSanita(!sanita)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'sanita', p)} t={t} />
                    <AddonRow icon={Flame} label={t('boiler')} price={getPrice('addon', 'boiler', house.addons.boiler)} checked={boiler} onChange={() => setBoiler(!boiler)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'boiler', p)} t={t} />
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('a0Standard')} color="green" />
                  <div className="space-y-3">
                    <AddonRow icon={Sun} label={t('heatPump')} price={getPrice('addon', 'heatPump', house.addons.heatPump)} checked={heatPump} onChange={() => setHeatPump(!heatPump)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'heatPump', p)} t={t} />
                    <AddonRow icon={Wind} label={t('recuperation')} price={getPrice('addon', 'recuperation', house.addons.recuperation)} checked={recuperation} onChange={() => setRecuperation(!recuperation)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'recuperation', p)} t={t} />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 6: Služby a Dokumentácia */}
            <div className="mb-12">
              <BigSectionHeader title="Súhrn a Služby" description="Vyberte doplnkové služby pre bezstarostnú realizáciu." icon={CheckCircle} />
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl">
                <SectionLabel label={t('documentation')} color="gray" />
                <div className="space-y-3 mb-8">
                  <AddonRow icon={FileText} label={t('projectant')} price={getPrice('addon', 'projectant', house.addons.projectant)} checked={projectant} onChange={() => setProjectant(!projectant)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'projectant', p)} t={t} />
                  <AddonRow icon={Settings} label={t('engineering')} description={t('engineeringDesc')} price={getPrice('addon', 'engineering', house.addons.engineering)} checked={engineering} onChange={() => setEngineering(!engineering)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'engineering', p)} t={t} />
                  <AddonRow icon={CheckCircle} label={t('revisions')} price={getPrice('addon', 'revision', house.addons.revision)} checked={revision} onChange={() => {}} disabled={true} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'revision', p)} t={t} />
                  <AddonRow icon={Zap} label={t('networkConnections')} price={getPrice('addon', 'networks', house.addons.networks)} checked={networks} onChange={() => setNetworks(!networks)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'networks', p)} t={t} />
                </div>

                <SectionLabel label={t('freeServices')} color="gray" />
                <div className="space-y-3">
                  <AddonRow icon={Home} label={t('realEstate')} price={0} checked={realEstate} onChange={() => setRealEstate(!realEstate)} t={t} />
                  <AddonRow icon={Sun} label={t('landSearch')} price={0} checked={landSearch} onChange={() => setLandSearch(!landSearch)} t={t} />
                  <AddonRow icon={FileText} label={t('financing')} price={0} checked={financing} onChange={() => setFinancing(!financing)} t={t} />
                </div>
              </div>
            </div>

            {/* Galéria na záver */}
            {effectiveDom && (
              <div className="mb-12">
                <BigSectionHeader title="Fotogaléria a Pôdorysy" description="Prezrite si vizualizácie k vašej vybranej konfigurácii." icon={Eye} />
                <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl">
                  <KonfiguratorGaleria dom={effectiveDom} facadeIdx={facadeIdx} interiorIdx={interiorIdx} />
                </div>
              </div>
            )}

          </div>

          {/* PRAVÝ STĹPEC: Sticky Sumár pre Desktop */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white leading-tight break-words">{house.name}</h2>
              {isA0Compliant && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest mt-2 inline-block font-bold">A0 Certifikát</span>}
            </div>

            {/* Sumárna tabuľka so Scrollbarom */}
            <div className="bg-slate-900 border border-white/10 p-5 rounded-3xl shadow-2xl mb-5 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
              <ProstoHouseSummary
                house={house} t={t} isA0Compliant={isA0Compliant} totalPrice={totalPrice} onSendQuote={() => setModalOpen(true)}
                mountingIdx={mountingIdx} extensionIdx={extensionIdx} insulationIdx={insulationIdx} foundationIdx={foundationIdx}
                interiorIdx={interiorIdx} doorsIdx={doorsIdx} facadeIdx={facadeIdx}
                electricity={electricity} water={water} sanita={sanita} boiler={boiler}
                heatPump={heatPump} recuperation={recuperation} windowLamination={windowLamination} windowTint={windowTint}
                roofWindows={roofWindows} fixWindows={fixWindows} tiltWindowsBig={tiltWindowsBig} tiltWindowsSmall={tiltWindowsSmall}
                interiorDoorsCount={interiorDoorsCount} laminateFloors={laminateFloors} floorHeating={floorHeating}
                networks={networks} engineering={engineering} projectant={projectant} revision={revision}
                getPrice={getPrice}
                hideSendButton={true}
              />
            </div>

            {/* Akčné tlačidlá v pravom stĺpci */}
            <div className="space-y-3">
              <button 
                onClick={() => setModalOpen(true)} 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 transition-all text-lg"
              >
                <span>{t('sendQuote')}</span>
                <Send className="w-5 h-5" />
              </button>
              <SaveQuoteButton domNazov={house.name} domKod={phCode} domId={effectiveDomId} celkovaCena={totalPrice} konfiguratorData={konfigData} />
            </div>
          </div>

        </div>
      </div>

      {/* MOBILNÝ STICKY FOOTER (Zobrazený len na malých obrazovkách) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-40 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 text-left">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{t('totalWithVAT')}</div>
            <div className="text-2xl font-black text-white">{totalPrice.toLocaleString()} €</div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="hidden sm:block">
              <SaveQuoteButton domNazov={house.name} domKod={phCode} domId={effectiveDomId} celkovaCena={totalPrice} konfiguratorData={konfigData} />
            </div>
            <button 
              onClick={() => setModalOpen(true)} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
            >
              <span className="hidden sm:inline">{t('sendQuote')}</span>
              <Send className="w-5 h-5 sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} t={t} />
      <ProstoHousePriceSaver isAdmin={isAdmin} customPrices={customPrices} domId={effectiveDomId} houseCode={houseCode} />
    </div>
  );
}