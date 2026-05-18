import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Check, Info, Send, X, Thermometer, Zap, Layout, Hammer,
  CheckCircle, FileText, Eye, Lock, ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { prostoHouseTranslations } from '../translations/ProstoHouseTranslations';
import ProstoHousePriceSaver from '../ProstoHousePriceSaver';
import ProstoHouseSummary from './ProstoHouseSummary';
import SaveQuoteButton from '../SaveQuoteButton';
import A0StatusHint from './A0StatusHint';
import KonfiguratorGaleria from './KonfiguratorGaleria';

// ── Mini komponenty ────────────────────────────────────────────────────────────

const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange }) => (
  <button onClick={onClick} className={`relative flex flex-col p-3 rounded-xl border transition-all w-full text-left active:scale-[0.98] gap-2 ${selected ? 'border-red-500 bg-red-500/10 shadow-sm' : 'border-white/10 bg-slate-900 hover:border-white/20 hover:shadow-sm'}`}>
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${selected ? 'border-red-500 bg-red-500' : 'border-slate-700'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${selected ? 'text-red-400' : 'text-slate-200'}`}>{label}</span>
          {isA0 && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">A0</span>}
        </div>
        {description && <p className="text-xs text-slate-400 mt-0.5 leading-tight">{description}</p>}
      </div>
      <div className="flex-shrink-0">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950 border border-red-500/30 rounded px-1 py-0.5" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-sm font-bold whitespace-nowrap ${selected ? 'text-red-400' : 'text-slate-500'}`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t }) => (
  <button onClick={!disabled && !locked ? onChange : undefined} className={`flex items-center justify-between p-4 rounded-xl border transition-all w-full active:scale-[0.98] ${locked ? 'border-emerald-500/30 bg-emerald-500/10 cursor-not-allowed' : checked ? 'border-red-500 bg-red-500/10 shadow-sm' : disabled ? 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed' : 'border-white/10 bg-slate-900 hover:border-white/20'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500' : 'bg-slate-950 border-slate-700'}`}>
        {locked ? <Lock className="w-3 h-3 text-white" /> : checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="text-left">
        <span className={`font-semibold text-sm block ${checked || locked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        {description && <p className="text-xs text-slate-400 mt-0.5 leading-tight">{description}</p>}
        {locked && <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">{t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
    </div>
    <div className="ml-3 flex-shrink-0">
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 bg-slate-950 border border-red-500/30 rounded px-1 py-0.5" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-500">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-transparent outline-none" />
        </div>
      ) : (
        <span className={`text-sm font-bold whitespace-nowrap ${locked ? 'text-emerald-400' : 'text-slate-400'}`}>
          {price === 0 ? '0 €' : `+${price.toLocaleString()} €`}
        </span>
      )}
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900">
    <div>
      <div className="font-semibold text-sm text-slate-200">{label}</div>
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-slate-500">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-xs font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1" />
        </div>
      ) : (
        <div className="text-xs text-red-400 font-bold mt-0.5">{price} € / ks</div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10">−</button>
      <span className="w-6 text-center font-bold text-base text-white">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-9 h-9 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center font-bold active:scale-90 transition-all">+</button>
    </div>
  </div>
);

const AccordionSection = ({ id, title, icon: Icon, openId, setOpenId, children, badge, isDone }) => {
  const isOpen = openId === id;
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${isOpen ? 'border-red-500/50 shadow-md shadow-red-500/10' : isDone ? 'border-emerald-500/30' : 'border-white/10'}`}>
      <button onClick={() => setOpenId(isOpen ? null : id)} className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors ${isOpen ? 'bg-red-500/10' : isDone ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : 'bg-slate-900 hover:bg-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-red-600 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {isDone && !isOpen ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </div>
          <div>
            <span className={`font-bold text-base ${isOpen ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-slate-200'}`}>{title}</span>
            {badge && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px] md:max-w-xs">{badge}</div>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" /> : <ChevronDown className={`w-5 h-5 flex-shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`} />}
      </button>
      {isOpen && <div className="p-4 md:p-5 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm space-y-3">{children}</div>}
    </div>
  );
};

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
    <div className={`text-xs font-bold uppercase tracking-wide ${colorMap[color] || 'text-slate-400'} mb-2 mt-4 first:mt-0`}>{label}</div>
  );
};

const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t('inquiryForm')}</h2>
        <p className="text-slate-400 mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('nameSurname')}</label><input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('email')}</label><input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('phone')}</label><input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('city')}</label><input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('note')}</label><textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"></textarea></div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-lg">
            {isSubmitting ? <span>{t('sending')}</span> : <><span>{t('sendQuote')}</span><Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Hlavný generický komponent ────────────────────────────────────────────────

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

  // Prefer dom passed as prop (from DetailDomu), fallback to DB query
  const effectiveDom = domProp || domFromDb;
  const effectiveDomId = domProp?.id || domFromDb?.id || domIdFromUrl;

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me().catch(() => null) });
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const hasExtension = house.options.extension && house.options.extension.length > 0;

  const [customPrices, setCustomPrices] = useState({});
  const [typStavby, setTypStavby] = useState('rekreacna');
  const [openSection, setOpenSection] = useState('structure');
  const [visitedSections, setVisitedSections] = useState(new Set(['structure']));

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
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const handleSectionOpen = (id) => {
    setOpenSection(id);
    if (id) setVisitedSections(prev => new Set([...prev, id]));
  };

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
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight">{house.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-400">{t('configuratorLabel')}</span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${isA0Compliant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {isA0Compliant ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                {isA0Compliant ? t('meetsA0Cert') : t('recreationalUse')}
              </div>
            </div>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))} className="md:hidden flex-shrink-0 relative p-2 rounded-lg hover:bg-slate-800 active:bg-slate-700" aria-label="AI Chatbot">
            <MessageCircle className="w-6 h-6 text-red-500" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full text-[7px] font-bold text-white flex items-center justify-center">AI</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
        {/* Typ stavby */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{t('selectProjectType')}</div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTypStavby('rekreacna')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 active:scale-95 ${typStavby === 'rekreacna' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20 hover:bg-slate-800'}`}>
              <Home className="w-6 h-6" /><span className="text-sm font-bold text-center leading-tight">{t('recreationalBuilding')}</span>
            </button>
            <button onClick={() => setTypStavby('rodinny_dom')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 active:scale-95 ${typStavby === 'rodinny_dom' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20 hover:bg-slate-800'}`}>
              <div className="flex items-center gap-1"><Home className="w-6 h-6" /><span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">A0</span></div>
              <span className="text-sm font-bold text-center leading-tight">{t('familyHouseA0')}</span>
            </button>
          </div>
          <A0StatusHint isA0Compliant={isA0Compliant} insulationIdx={insulationIdx} heatPump={heatPump} recuperation={recuperation} projectant={projectant} onGoToSection={handleSectionOpen} t={t} />
        </div>

        {/* Hrubá stavba */}
        <AccordionSection id="structure" title={t('roughConstruction')} icon={Hammer} openId={openSection} setOpenId={handleSectionOpen}
          isDone={visitedSections.has('structure') && openSection !== 'structure'}
          badge={[house.options.mounting[mountingIdx]?.label, hasExtension ? house.options.extension[extensionIdx]?.label : null, house.options.foundation[foundationIdx]?.label].filter(Boolean).join(' · ')}>
          <SectionLabel label={t('shellAssembly')} color="orange" />
          {house.options.mounting.map((opt, i) => (
            <OptionCard key={i} label={i === 0 ? t('noAssemblySelf') : t('withAssembly')} price={getPrice('mounting', i, opt.price)} description={i === 0 ? t('selfAssemblyDesc') : t('proAssemblyDesc')} selected={mountingIdx === i} onClick={() => setMountingIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('mounting', i, p)} />
          ))}
          {hasExtension && (
            <>
              <SectionLabel label={t('houseExtension')} color="teal" />
              <div className="grid grid-cols-2 gap-2">
                {house.options.extension.map((opt, i) => {
                  const labels = { 0: t('noExtension'), 1: '+1,2 m', 2: '+2,4 m', 3: '+3,6 m', 4: '+4,8 m' };
                  return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('extension', i, opt.price)} selected={extensionIdx === i} onClick={() => setExtensionIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('extension', i, p)} />;
                })}
              </div>
            </>
          )}
          <SectionLabel label={t('foundations')} color="amber" />
          {house.options.foundation.map((opt, i) => {
            const labels = { 0: t('noFoundations'), 1: t('pilotsFootings'), 2: t('foundationSlab'), 3: t('stripFoundations') };
            const descs = { 0: t('noFoundationsDesc'), 1: t('pilotsFootingsDesc'), 2: t('foundationSlabDesc'), 3: t('stripFoundationsDesc') };
            return <OptionCard key={i} label={labels[i]} price={getPrice('foundation', i, opt.price)} description={descs[i]} selected={foundationIdx === i} onClick={() => setFoundationIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('foundation', i, p)} />;
          })}
        </AccordionSection>

        {/* Exteriér */}
        <AccordionSection id="exterior" title={t('stepExterior')} icon={Thermometer} openId={openSection} setOpenId={handleSectionOpen}
          isDone={visitedSections.has('exterior') && openSection !== 'exterior'}
          badge={`${house.options.insulation[insulationIdx]?.label} · ${house.options.facade[facadeIdx]?.label} · ${house.options.doors[doorsIdx]?.label}`}>
          <SectionLabel label={t('insulationType')} color="blue" />
          {house.options.insulation.map((opt, i) => {
            const labels = { 0: t('yearRound150mm'), 1: t('enhanced200mm'), 2: t('premium250mm'), 3: t('extra300mm') };
            const descs = { 0: t('yearRound150mmDesc'), 1: t('enhanced200mmDesc'), 2: t('premium250mmDesc'), 3: t('extra300mmDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('insulation', i, opt.price)} description={descs[i] || opt.description} selected={insulationIdx === i} onClick={() => setInsulationIdx(i)} isA0={opt.label.includes('250 mm')} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('insulation', i, p)} />;
          })}
          <SectionLabel label={t('facade')} color="purple" />
          {house.options.facade.map((opt, i) => (
            <OptionCard key={i} label={i === 0 ? t('facadeStandard') : t('facadeStucco')} price={getPrice('facade', i, opt.price)} description={i === 0 ? t('facadeStandardDesc') : t('facadeStuccoDesc')} selected={facadeIdx === i} onClick={() => setFacadeIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('facade', i, p)} />
          ))}
          <SectionLabel label={t('entryDoors')} color="red" />
          {house.options.doors.map((opt, i) => {
            const labels = { 0: t('doorsStandard'), 1: t('doorsMetal2Locks'), 2: t('doorsPlasticMetal') };
            const descs = { 0: t('doorsStandardDesc'), 1: t('doorsMetal2LocksDesc'), 2: t('doorsPlasticMetalDesc') };
            return <OptionCard key={i} label={labels[i]} price={getPrice('doors', i, opt.price)} description={descs[i]} selected={doorsIdx === i} onClick={() => setDoorsIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('doors', i, p)} />;
          })}
          <SectionLabel label={t('additionalWindows')} color="gray" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: t('roofWindow'), p: getPrice('addon', 'roofWindow', house.addons.roofWindow), v: roofWindows, s: setRoofWindows, k: 'roofWindow' },
              { l: t('fixedWindow'), p: getPrice('addon', 'fixWindow', house.addons.fixWindow), v: fixWindows, s: setFixWindows, k: 'fixWindow' },
              { l: t('tiltWindowBig'), p: getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig), v: tiltWindowsBig, s: setTiltWindowsBig, k: 'tiltWindowBig' },
              { l: t('tiltWindowSmall'), p: getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall), v: tiltWindowsSmall, s: setTiltWindowsSmall, k: 'tiltWindowSmall' }
            ].map((item, idx) => (
              <CounterRow key={idx} label={item.l} price={item.p} value={item.v} onChange={item.s} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', item.k, p)} />
            ))}
          </div>
        </AccordionSection>

        {/* Interiér */}
        <AccordionSection id="interior" title={t('interior')} icon={Layout} openId={openSection} setOpenId={handleSectionOpen}
          isDone={visitedSections.has('interior') && openSection !== 'interior'}
          badge={house.options.interior[interiorIdx]?.label}>
          <SectionLabel label={t('interiorFinish')} color="emerald" />
          {house.options.interior.map((opt, i) => {
            const labels = { 0: t('noInterior'), 1: t('interiorWood'), 2: t('interiorDrywall') };
            const descs = { 0: t('noInteriorDesc'), 1: t('interiorWoodDesc'), 2: t('interiorDrywallDesc') };
            return <OptionCard key={i} label={labels[i]} price={getPrice('interior', i, opt.price)} description={descs[i]} selected={interiorIdx === i} onClick={() => setInteriorIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('interior', i, p)} />;
          })}
          <SectionLabel label={t('interiorDoorsCount')} color="gray" />
          <CounterRow label={t('interiorDoorsCount')} price={getPrice('addon', 'interiorDoor', house.addons.interiorDoor)} value={interiorDoorsCount} onChange={setInteriorDoorsCount} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'interiorDoor', p)} />
          <SectionLabel label={t('interiorAddons')} color="gray" />
          <AddonRow label={t('windowLamination')} price={getPrice('addon', 'windowLamination', house.addons.windowLamination)} checked={windowLamination} onChange={() => setWindowLamination(!windowLamination)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowLamination', p)} t={t} />
          <AddonRow label={t('tintedGlass')} price={getPrice('addon', 'windowTint', house.addons.windowTint)} checked={windowTint} onChange={() => setWindowTint(!windowTint)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowTint', p)} t={t} />
          <AddonRow label={t('laminateFloors')} price={getPrice('addon', 'laminateFloors', house.addons.laminateFloors)} checked={laminateFloors} onChange={() => setLaminateFloors(!laminateFloors)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'laminateFloors', p)} t={t} />
          <AddonRow label={t('floorHeating')} price={getPrice('addon', 'floorHeating', house.addons.floorHeating)} checked={floorHeating} onChange={() => setFloorHeating(!floorHeating)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'floorHeating', p)} t={t} />
        </AccordionSection>

        {/* Technológie */}
        <AccordionSection id="tech" title={t('technologies')} icon={Zap} openId={openSection} setOpenId={handleSectionOpen}
          isDone={visitedSections.has('tech') && openSection !== 'tech'}>
          <SectionLabel label={t('pipes')} color="gray" />
          <AddonRow label={t('electricalWiring')} price={getPrice('addon', 'electricity', house.addons.electricity)} checked={electricity} onChange={() => setElectricity(!electricity)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'electricity', p)} t={t} />
          <AddonRow label={t('waterDrainage')} price={getPrice('addon', 'water', house.addons.water)} checked={water} onChange={() => setWater(!water)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'water', p)} t={t} />
          <AddonRow label={t('sanitary')} price={getPrice('addon', 'sanita', house.addons.sanita)} checked={sanita} onChange={() => setSanita(!sanita)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'sanita', p)} t={t} />
          <AddonRow label={t('boiler')} price={getPrice('addon', 'boiler', house.addons.boiler)} checked={boiler} onChange={() => setBoiler(!boiler)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'boiler', p)} t={t} />
          <SectionLabel label={t('a0Standard')} color="green" />
          <AddonRow label={t('heatPump')} price={getPrice('addon', 'heatPump', house.addons.heatPump)} checked={heatPump} onChange={() => setHeatPump(!heatPump)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'heatPump', p)} t={t} />
          <AddonRow label={t('recuperation')} price={getPrice('addon', 'recuperation', house.addons.recuperation)} checked={recuperation} onChange={() => setRecuperation(!recuperation)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'recuperation', p)} t={t} />
        </AccordionSection>

        {/* Služby */}
        <AccordionSection id="services" title={t('services')} icon={FileText} openId={openSection} setOpenId={handleSectionOpen}
          isDone={visitedSections.has('services') && openSection !== 'services'}>
          <SectionLabel label={t('documentation')} color="gray" />
          <AddonRow label={t('projectant')} price={getPrice('addon', 'projectant', house.addons.projectant)} checked={projectant} onChange={() => setProjectant(!projectant)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'projectant', p)} t={t} />
          <AddonRow label={t('engineering')} description={t('engineeringDesc')} price={getPrice('addon', 'engineering', house.addons.engineering)} checked={engineering} onChange={() => setEngineering(!engineering)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'engineering', p)} t={t} />
          <AddonRow label={t('revisions')} price={getPrice('addon', 'revision', house.addons.revision)} checked={revision} onChange={() => {}} disabled={true} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'revision', p)} t={t} />
          <AddonRow label={t('networkConnections')} price={getPrice('addon', 'networks', house.addons.networks)} checked={networks} onChange={() => setNetworks(!networks)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'networks', p)} t={t} />
          <SectionLabel label={t('freeServices')} color="gray" />
          <AddonRow label={t('realEstate')} price={0} checked={realEstate} onChange={() => setRealEstate(!realEstate)} t={t} />
          <AddonRow label={t('landSearch')} price={0} checked={landSearch} onChange={() => setLandSearch(!landSearch)} t={t} />
          <AddonRow label={t('financing')} price={0} checked={financing} onChange={() => setFinancing(!financing)} t={t} />
        </AccordionSection>

        {/* Galéria */}
        {effectiveDom && (
          <AccordionSection id="galeria" title={t('photoGalleryAndFloorPlans')} icon={Eye} openId={openSection} setOpenId={handleSectionOpen}
            badge={t('photoGalleryBadge')}>
            <KonfiguratorGaleria dom={effectiveDom} facadeIdx={facadeIdx} interiorIdx={interiorIdx} />
          </AccordionSection>
        )}

        {/* Súhrn ceny (desktop) */}
        <div className="hidden md:block space-y-3">
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
          />
          <SaveQuoteButton domNazov={house.name} domKod={phCode} domId={effectiveDomId} celkovaCena={totalPrice} konfiguratorData={konfigData} />
        </div>
      </div>

      {/* Fixný mobilný panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 z-50 md:hidden shadow-[0_-4px_30px_-4px_rgba(0,0,0,0.5)]">
        <div className="px-4 py-2 flex items-center gap-2">
          <button onClick={() => setMobileSummaryOpen(true)} className="flex-1 text-left">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">{t('totalWithVAT')} <Eye className="w-3 h-3 text-slate-500" /></div>
            <div className="text-2xl font-black text-white leading-tight">{totalPrice.toLocaleString()} €</div>
            <div className={`text-[11px] font-bold mt-0.5 ${isA0Compliant ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isA0Compliant ? `✓ ${t('meetsA0Cert')}` : t('recreationalUse')}
            </div>
          </button>
          <SaveQuoteButton domNazov={house.name} domKod={phCode} domId={effectiveDomId} celkovaCena={totalPrice} konfiguratorData={konfigData} />
          <button onClick={() => setModalOpen(true)} className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <Send className="w-4 h-4" /><span className="text-sm">{t('sendQuote')}</span>
          </button>
        </div>
      </div>

      {/* Mobilný súhrn */}
      {mobileSummaryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200" onClick={() => setMobileSummaryOpen(false)}>
          <div className="bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto w-full p-5 animate-in slide-in-from-bottom duration-300 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-bold mb-4 text-white">{t('configurationSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">{house.name}</span><span className="font-bold text-white">{house.basePrice.toLocaleString()} €</span></div>
              {mountingIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('assemblyItem')}</span><span className="font-semibold text-red-400">+{getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx].price).toLocaleString()} €</span></div>}
              {hasExtension && extensionIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('extensionItem')}</span><span className="font-semibold text-red-400">+{getPrice('extension', extensionIdx, house.options.extension[extensionIdx].price).toLocaleString()} €</span></div>}
              <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('insulationItem')}</span><span className="font-semibold text-white">{getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx].price) > 0 ? `+${getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx].price).toLocaleString()} €` : '✓'}</span></div>
              {foundationIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('foundationsItem')}</span><span className="font-semibold text-red-400">+{getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx].price).toLocaleString()} €</span></div>}
              {facadeIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('facadeItem')}</span><span className="font-semibold text-red-400">+{getPrice('facade', facadeIdx, house.options.facade[facadeIdx].price).toLocaleString()} €</span></div>}
              {interiorIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('interiorFinishItem')}</span><span className="font-semibold text-red-400">+{getPrice('interior', interiorIdx, house.options.interior[interiorIdx].price).toLocaleString()} €</span></div>}
              {electricity && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('electricalInstallation')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'electricity', house.addons.electricity).toLocaleString()} €</span></div>}
              {water && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('waterAndDrainage')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'water', house.addons.water).toLocaleString()} €</span></div>}
              {heatPump && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('heatPumpItem')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'heatPump', house.addons.heatPump).toLocaleString()} €</span></div>}
              {recuperation && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('recuperationItem')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'recuperation', house.addons.recuperation).toLocaleString()} €</span></div>}
              {projectant && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('projectantItem')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'projectant', house.addons.projectant).toLocaleString()} €</span></div>}
              {engineering && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('engineeringItem')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'engineering', house.addons.engineering).toLocaleString()} €</span></div>}
              {revision && <div className="flex justify-between py-1.5"><span className="text-slate-400">{t('revisionsItem')}</span><span className="font-semibold text-red-400">+{getPrice('addon', 'revision', house.addons.revision).toLocaleString()} €</span></div>}
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="font-bold text-white">{t('totalWithVAT')}</span>
              <span className="text-2xl font-black text-white">{totalPrice.toLocaleString()} €</span>
            </div>
            <button onClick={() => { setMobileSummaryOpen(false); setModalOpen(true); }} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-base active:scale-[0.98]">
              <Send className="w-5 h-5" /> {t('sendQuote')}
            </button>
            <div className="h-24"></div>
          </div>
        </div>
      )}

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} t={t} />
      <ProstoHousePriceSaver isAdmin={isAdmin} customPrices={customPrices} domId={effectiveDomId} houseCode={houseCode} />
    </div>
  );
}