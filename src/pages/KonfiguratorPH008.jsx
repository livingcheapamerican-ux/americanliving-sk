import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  Check, 
  Info, 
  Send, 
  X, 
  Thermometer, 
  Zap, 
  Layout, 
  Hammer,
  CheckCircle,
  FileText,
  Key,
  Eye,
  Lock,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { prostoHouseTranslations } from '../components/translations/ProstoHouseTranslations';
import ProstoHousePriceSaver from '../components/ProstoHousePriceSaver';

const HOUSE_PH008 = {
  "id": "barn",
  "name": "Barn 48 (PH-008)",
  "basePrice": 20900,
  "options": {
    "mounting": [
      { "label": "Bez montáže", "price": 0, "description": "Svojpomocne" },
      { "label": "S montážou", "price": 4875, "description": "Profesionálna montáž" }
    ],
    "extension": [
      { "label": "Bez predĺženia", "price": 0 },
      { "label": "+1,2 m", "price": 3300 },
      { "label": "+2,4 m", "price": 6606 },
      { "label": "+3,6 m", "price": 9900 },
      { "label": "+4,8 m", "price": 15880 }
    ],
    "insulation": [
      { "label": "Celoročná 150 mm", "price": 0, "description": "Štandard" },
      { "label": "Zvýšená 200 mm", "price": 1400, "description": "Zvýšený štandard" },
      { "label": "Prémium 250 mm", "price": 2800, "description": "Pre A0 certifikát" },
      { "label": "Extra 300 mm", "price": 5250, "description": "Extra úspora" }
    ],
    "foundation": [
      { "label": "Bez základov", "price": 0, "description": "Vlastná realizácia" },
      { "label": "Pilóty/Pätky", "price": 3077, "description": "Zemné skrutky" },
      { "label": "Základová doska", "price": 6595, "description": "Betón" },
      { "label": "Pásové základy", "price": 6782, "description": "Betónové pásy" }
    ],
    "interior": [
      { "label": "Bez interiéru", "price": 0, "description": "Holostavba" },
      { "label": "Drevo", "price": 4100, "description": "Smrekový obklad" },
      { "label": "Sadrokartón", "price": 4715, "description": "Hladké steny" }
    ],
    "doors": [
      { "label": "Štandard", "price": 0, "description": "Základné" },
      { "label": "Kovové s 2 zámkami", "price": 720, "description": "Bezpečnostné" },
      { "label": "Plastovo-kovové", "price": 660, "description": "Odolné" }
    ],
    "facade": [
      { "label": "Štandardná", "price": 0, "description": "Drevený obklad" },
      { "label": "Šúchaná fasáda", "price": 4321, "description": "Biela omietka" }
    ]
  },
  "addons": {
    "electricity": 2300,
    "water": 980,
    "sanita": 1169,
    "boiler": 246,
    "heatPump": 1100,
    "recuperation": 2214,
    "windowLamination": 790,
    "windowTint": 375,
    "roofWindow": 760,
    "fixWindow": 500,
    "tiltWindowBig": 540,
    "tiltWindowSmall": 225,
    "interiorDoor": 250,
    "laminateFloors": 850,
    "floorHeating": 2819,
    "networks": 1500,
    "engineering": 2590,
    "projectant": 3500,
    "revision": 500,
    "transport": 0
  }
};

// ── Mini komponenty ──────────────────────────────────────────────────────────

const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col p-3 rounded-xl border-2 transition-all w-full text-left active:scale-[0.98] gap-2 ${
      selected
        ? 'border-red-500 bg-red-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${selected ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${selected ? 'text-red-900' : 'text-gray-800'}`}>{label}</span>
          {isA0 && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">A0</span>}
        </div>
        {description && <p className="text-xs text-gray-500 mt-0.5 leading-tight">{description}</p>}
      </div>
      <div className="flex-shrink-0">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-white border border-red-200 rounded px-1 py-0.5" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-600 outline-none" />
          </div>
        ) : (
          <span className={`text-sm font-bold whitespace-nowrap ${selected ? 'text-red-600' : 'text-gray-400'}`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t }) => (
  <button
    onClick={!disabled && !locked ? onChange : undefined}
    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all w-full active:scale-[0.98] ${
      locked ? 'border-green-200 bg-green-50 cursor-not-allowed'
      : checked ? 'border-red-500 bg-red-50 shadow-sm'
      : disabled ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
      : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${locked ? 'bg-green-500 border-green-500' : checked ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
        {locked ? <Lock className="w-3 h-3 text-white" /> : checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="text-left">
        <span className={`font-semibold text-sm block ${checked || locked ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5 leading-tight">{description}</p>}
        {locked && <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">{t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
    </div>
    <div className="ml-3 flex-shrink-0">
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 bg-white border border-red-200 rounded px-1 py-0.5" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-gray-400">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-600 outline-none" />
        </div>
      ) : (
        <span className={`text-sm font-bold whitespace-nowrap ${locked ? 'text-green-700' : 'text-gray-500'}`}>
          {price === 0 ? '0 €' : `+${price.toLocaleString()} €`}
        </span>
      )}
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white">
    <div>
      <div className="font-semibold text-sm text-gray-800">{label}</div>
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-400">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-xs font-bold text-red-600 outline-none border border-red-200 rounded px-1" />
        </div>
      ) : (
        <div className="text-xs text-red-600 font-bold mt-0.5">{price} € / ks</div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 active:scale-90 transition-all border border-gray-300">−</button>
      <span className="w-6 text-center font-bold text-base text-gray-900">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-9 h-9 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center font-bold active:scale-90 transition-all">+</button>
    </div>
  </div>
);

const AccordionSection = ({ id, title, icon: Icon, openId, setOpenId, children, badge }) => {
  const isOpen = openId === id;
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${isOpen ? 'border-red-200 shadow-md' : 'border-gray-200'}`}>
      <button
        onClick={() => setOpenId(isOpen ? null : id)}
        className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors ${isOpen ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className={`font-bold text-base ${isOpen ? 'text-red-900' : 'text-gray-800'}`}>{title}</span>
            {badge && <div className="text-xs text-gray-500 mt-0.5">{badge}</div>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="p-4 md:p-5 border-t border-red-100 bg-white space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

const SectionLabel = ({ label, color = 'gray' }) => (
  <div className={`text-xs font-bold uppercase tracking-wide text-${color}-600 mb-2 mt-4 first:mt-0`}>{label}</div>
);

const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('inquiryForm')}</h2>
        <p className="text-gray-500 mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('nameSurname')}</label>
            <input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
            <input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone')}</label>
            <input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('city')}</label>
            <input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('note')}</label>
            <textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-lg"
          >
            {isSubmitting ? <span>{t('sending')}</span> : <><span>{t('sendQuote')}</span><Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Hlavný komponent ─────────────────────────────────────────────────────────

export default function KonfiguratorPH008() {
  const { language } = useLanguage();
  const t = (key) => prostoHouseTranslations[language]?.[key] || prostoHouseTranslations['sk']?.[key] || key;

  const urlParams = new URLSearchParams(window.location.search);
  const domIdFromUrl = urlParams.get('id');

  const { data: domFromDb } = useQuery({
    queryKey: ['dom-ph008', domIdFromUrl],
    queryFn: async () => {
      if (!domIdFromUrl) return null;
      const domy = await base44.entities.Dom.filter({ id: domIdFromUrl });
      return domy[0] || null;
    },
    enabled: !!domIdFromUrl,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always'
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin';

  const [customPrices, setCustomPrices] = useState({});
  const [typStavby, setTypStavby] = useState('rekreacna');
  const [openSection, setOpenSection] = useState('structure');

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

  useEffect(() => {
    if (domFromDb?.konfigurator_custom_ceny_prosto_house?.['ph008']) {
      setCustomPrices(domFromDb.konfigurator_custom_ceny_prosto_house['ph008']);
    }
  }, [domFromDb]);

  useEffect(() => {
    if (typStavby === 'rodinny_dom') {
      setInsulationIdx(2);
      setHeatPump(true);
      setRecuperation(true);
      setProjectant(true);
    } else {
      setInsulationIdx(0);
      setHeatPump(false);
      setRecuperation(false);
      setProjectant(false);
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
    const currentInsulation = HOUSE_PH008.options.insulation[insulationIdx];
    return currentInsulation.label.includes('250 mm') && heatPump && recuperation && projectant;
  }, [insulationIdx, heatPump, recuperation, projectant]);

  const totalPrice = useMemo(() => {
    let total = HOUSE_PH008.basePrice;
    total += getPrice('mounting', mountingIdx, HOUSE_PH008.options.mounting[mountingIdx].price);
    total += getPrice('extension', extensionIdx, HOUSE_PH008.options.extension[extensionIdx].price);
    total += getPrice('insulation', insulationIdx, HOUSE_PH008.options.insulation[insulationIdx].price);
    total += getPrice('foundation', foundationIdx, HOUSE_PH008.options.foundation[foundationIdx].price);
    total += getPrice('interior', interiorIdx, HOUSE_PH008.options.interior[interiorIdx].price);
    total += getPrice('doors', doorsIdx, HOUSE_PH008.options.doors[doorsIdx].price);
    total += getPrice('facade', facadeIdx, HOUSE_PH008.options.facade[facadeIdx].price);
    if (electricity) total += getPrice('addon', 'electricity', HOUSE_PH008.addons.electricity);
    if (water) total += getPrice('addon', 'water', HOUSE_PH008.addons.water);
    if (sanita) total += getPrice('addon', 'sanita', HOUSE_PH008.addons.sanita);
    if (boiler) total += getPrice('addon', 'boiler', HOUSE_PH008.addons.boiler);
    if (heatPump) total += getPrice('addon', 'heatPump', HOUSE_PH008.addons.heatPump);
    if (recuperation) total += getPrice('addon', 'recuperation', HOUSE_PH008.addons.recuperation);
    if (windowLamination) total += getPrice('addon', 'windowLamination', HOUSE_PH008.addons.windowLamination);
    if (windowTint) total += getPrice('addon', 'windowTint', HOUSE_PH008.addons.windowTint);
    total += roofWindows * getPrice('addon', 'roofWindow', HOUSE_PH008.addons.roofWindow);
    total += fixWindows * getPrice('addon', 'fixWindow', HOUSE_PH008.addons.fixWindow);
    total += tiltWindowsBig * getPrice('addon', 'tiltWindowBig', HOUSE_PH008.addons.tiltWindowBig);
    total += tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', HOUSE_PH008.addons.tiltWindowSmall);
    total += interiorDoorsCount * getPrice('addon', 'interiorDoor', HOUSE_PH008.addons.interiorDoor);
    if (laminateFloors) total += getPrice('addon', 'laminateFloors', HOUSE_PH008.addons.laminateFloors);
    if (floorHeating) total += getPrice('addon', 'floorHeating', HOUSE_PH008.addons.floorHeating);
    if (networks) total += getPrice('addon', 'networks', HOUSE_PH008.addons.networks);
    if (engineering) total += getPrice('addon', 'engineering', HOUSE_PH008.addons.engineering);
    if (projectant) total += getPrice('addon', 'projectant', HOUSE_PH008.addons.projectant);
    if (revision) total += getPrice('addon', 'revision', HOUSE_PH008.addons.revision);
    return total;
  }, [
    mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
    electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
    roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount, laminateFloors, floorHeating,
    networks, engineering, projectant, revision, customPrices
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target;
      const klientData = { meno: form.name.value, email: form.email.value, telefon: form.phone.value, obec: form.city.value, poznamka: form.note.value };
      const selectedItems = [];
      selectedItems.push({ name: HOUSE_PH008.name, price: HOUSE_PH008.basePrice, selected: true, section: "base" });
      if (mountingIdx > 0) selectedItems.push({ name: `Montáž: ${HOUSE_PH008.options.mounting[mountingIdx].label}`, price: getPrice('mounting', mountingIdx, HOUSE_PH008.options.mounting[mountingIdx].price), selected: true, section: "hruba" });
      if (extensionIdx > 0) selectedItems.push({ name: `Predĺženie: ${HOUSE_PH008.options.extension[extensionIdx].label}`, price: getPrice('extension', extensionIdx, HOUSE_PH008.options.extension[extensionIdx].price), selected: true, section: "hruba" });
      selectedItems.push({ name: `Izolácia: ${HOUSE_PH008.options.insulation[insulationIdx].label}`, price: getPrice('insulation', insulationIdx, HOUSE_PH008.options.insulation[insulationIdx].price), selected: true, section: "hruba" });
      if (foundationIdx > 0) selectedItems.push({ name: `Základy: ${HOUSE_PH008.options.foundation[foundationIdx].label}`, price: getPrice('foundation', foundationIdx, HOUSE_PH008.options.foundation[foundationIdx].price), selected: true, section: "hruba" });
      selectedItems.push({ name: `Vstupné dvere: ${HOUSE_PH008.options.doors[doorsIdx].label}`, price: getPrice('doors', doorsIdx, HOUSE_PH008.options.doors[doorsIdx].price), selected: true, section: "hruba" });
      selectedItems.push({ name: `Fasáda: ${HOUSE_PH008.options.facade[facadeIdx].label}`, price: getPrice('facade', facadeIdx, HOUSE_PH008.options.facade[facadeIdx].price), selected: true, section: "hruba" });
      if (interiorIdx > 0) selectedItems.push({ name: `Interiér: ${HOUSE_PH008.options.interior[interiorIdx].label}`, price: getPrice('interior', interiorIdx, HOUSE_PH008.options.interior[interiorIdx].price), selected: true, section: "holodom" });
      if (electricity) selectedItems.push({ name: "Elektroinštalácia", price: getPrice('addon', 'electricity', HOUSE_PH008.addons.electricity), selected: true, section: "holodom" });
      if (water) selectedItems.push({ name: "Voda a kanalizácia", price: getPrice('addon', 'water', HOUSE_PH008.addons.water), selected: true, section: "holodom" });
      if (sanita) selectedItems.push({ name: "Sanita", price: getPrice('addon', 'sanita', HOUSE_PH008.addons.sanita), selected: true, section: "holodom" });
      if (boiler) selectedItems.push({ name: "Bojler", price: getPrice('addon', 'boiler', HOUSE_PH008.addons.boiler), selected: true, section: "holodom" });
      if (heatPump) selectedItems.push({ name: "Tepelné čerpadlo", price: getPrice('addon', 'heatPump', HOUSE_PH008.addons.heatPump), selected: true, section: "kluc" });
      if (recuperation) selectedItems.push({ name: "Rekuperácia", price: getPrice('addon', 'recuperation', HOUSE_PH008.addons.recuperation), selected: true, section: "kluc" });
      if (laminateFloors) selectedItems.push({ name: "Laminátové podlahy", price: getPrice('addon', 'laminateFloors', HOUSE_PH008.addons.laminateFloors), selected: true, section: "kluc" });
      if (floorHeating) selectedItems.push({ name: "Podlahové kúrenie", price: getPrice('addon', 'floorHeating', HOUSE_PH008.addons.floorHeating), selected: true, section: "kluc" });
      if (windowLamination) selectedItems.push({ name: "Laminácia okien", price: getPrice('addon', 'windowLamination', HOUSE_PH008.addons.windowLamination), selected: true, section: "holodom" });
      if (windowTint) selectedItems.push({ name: "Tónované sklá", price: getPrice('addon', 'windowTint', HOUSE_PH008.addons.windowTint), selected: true, section: "holodom" });
      if (interiorDoorsCount > 0) selectedItems.push({ name: `Interiérové dvere (${interiorDoorsCount} ks)`, price: interiorDoorsCount * getPrice('addon', 'interiorDoor', HOUSE_PH008.addons.interiorDoor), selected: true, section: "holodom" });
      if (roofWindows > 0) selectedItems.push({ name: `Strešné okná (${roofWindows} ks)`, price: roofWindows * getPrice('addon', 'roofWindow', HOUSE_PH008.addons.roofWindow), selected: true, section: "hruba" });
      if (fixWindows > 0) selectedItems.push({ name: `Fixné okná (${fixWindows} ks)`, price: fixWindows * getPrice('addon', 'fixWindow', HOUSE_PH008.addons.fixWindow), selected: true, section: "hruba" });
      if (tiltWindowsBig > 0) selectedItems.push({ name: `Výklopné okná veľké (${tiltWindowsBig} ks)`, price: tiltWindowsBig * getPrice('addon', 'tiltWindowBig', HOUSE_PH008.addons.tiltWindowBig), selected: true, section: "hruba" });
      if (tiltWindowsSmall > 0) selectedItems.push({ name: `Výklopné okná malé (${tiltWindowsSmall} ks)`, price: tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', HOUSE_PH008.addons.tiltWindowSmall), selected: true, section: "hruba" });
      if (networks) selectedItems.push({ name: "Prípojky sietí", price: getPrice('addon', 'networks', HOUSE_PH008.addons.networks), selected: true, section: "docs" });
      if (engineering) selectedItems.push({ name: "Inžiniering", price: getPrice('addon', 'engineering', HOUSE_PH008.addons.engineering), selected: true, section: "docs" });
      if (projectant) selectedItems.push({ name: "Projektant", price: getPrice('addon', 'projectant', HOUSE_PH008.addons.projectant), selected: true, section: "docs" });
      if (revision) selectedItems.push({ name: "Revízie", price: getPrice('addon', 'revision', HOUSE_PH008.addons.revision), selected: true, section: "docs" });

      const response = await base44.functions.invoke('odosliCenovuPonukuProstoHouse', {
        dom_id: domFromDb?.id || domIdFromUrl,
        klient_meno: klientData.meno, klient_email: klientData.email, klient_telefon: klientData.telefon,
        klient_adresa: klientData.obec, klient_poznamka: klientData.poznamka,
        selectedItems, totalPrice, language,
        montazHolodomu: mountingIdx > 0,
        izolaciaNavysenie: HOUSE_PH008.options.insulation[insulationIdx].label.includes('250') ? 'premium' : 'standard',
        zaklady: HOUSE_PH008.options.foundation[foundationIdx].label,
        vstupneDvere: HOUSE_PH008.options.doors[doorsIdx].label,
        elektroinstalacia: electricity, vodaKanalizacia: water, sanitaKomplet: sanita, bojler: boiler,
        tepelneCerpadlo: heatPump, rekuperacia: recuperation, pripojkaSiete: networks,
        stresneOkno: roofWindows, bocneOknoFixne: fixWindows, bocneOknoVyklopne90: tiltWindowsBig, bocneOknoVyklopne55: tiltWindowsSmall,
        povrchokaOkien: windowLamination, tonovaneSkla: windowTint,
        vonkajsiaFasada: facadeIdx === 1 ? 'suchana' : 'standard',
        interierFinis: HOUSE_PH008.options.interior[interiorIdx].label,
        vnutornePodlahy: laminateFloors, podlahovVykurovanie: floorHeating,
        interieroveDvere: interiorDoorsCount, inziniering: engineering, projektA0: projectant,
        revizna: revision, doprava: 0,
        predlzenie: extensionIdx > 0 ? HOUSE_PH008.options.extension[extensionIdx].label : 0,
        predajNehnutelnosti: realEstate, hladaniePozemku: landSearch, financneSluzby: financing
      });

      if (response?.data?.success) {
        alert('✓ Cenová ponuka bola úspešne odoslaná na váš email!');
        setModalOpen(false);
      } else {
        alert('Chyba: ' + (response?.data?.error || 'Neznáma chyba'));
      }
    } catch (error) {
      console.error('Chyba pri odosielaní:', error);
      alert('Chyba pri odosielaní: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 md:pb-8">
      <style>{`
        @media (max-width: 768px) {
          [data-chatbot-button], 
          .chatbot-trigger,
          button[aria-label*="chat"],
          button[aria-label*="Chat"] {
            bottom: 90px !important;
          }
        }
      `}</style>

      {/* ── Hlavička ── */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">{HOUSE_PH008.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Konfigurátor</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isA0Compliant ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {isA0Compliant ? <CheckCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            {isA0Compliant ? t('meetsA0Cert') : t('recreationalUse')}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">

        {/* ── Typ stavby ── */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">{t('selectProjectType')}</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTypStavby('rekreacna')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${typStavby === 'rekreacna' ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
            >
              <Home className="w-6 h-6" />
              <span className="text-sm font-bold text-center leading-tight">{t('recreationalBuilding')}</span>
            </button>
            <button
              onClick={() => setTypStavby('rodinny_dom')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${typStavby === 'rodinny_dom' ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-1">
                <Home className="w-6 h-6" />
                <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">A0</span>
              </div>
              <span className="text-sm font-bold text-center leading-tight">{t('familyHouseA0')}</span>
            </button>
          </div>
          {isA0Compliant && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2 text-xs text-green-700 font-medium">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {t('meetsA0CertDesc')}
            </div>
          )}
        </div>

        {/* ── Hrubá stavba ── */}
        <AccordionSection id="structure" title={t('roughConstruction')} icon={Hammer} openId={openSection} setOpenId={setOpenSection}
          badge={`${HOUSE_PH008.options.mounting[mountingIdx].label} · ${HOUSE_PH008.options.foundation[foundationIdx].label} · ${HOUSE_PH008.options.extension[extensionIdx].label}`}>
          
          <SectionLabel label={t('shellAssembly')} color="orange" />
          {HOUSE_PH008.options.mounting.map((opt, i) => {
            const labels = { 0: t('noAssemblySelf'), 1: t('withAssembly') };
            const descs = { 0: t('selfAssemblyDesc'), 1: t('proAssemblyDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('mounting', i, opt.price)} description={descs[i] || opt.description} selected={mountingIdx === i} onClick={() => setMountingIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('mounting', i, p)} />;
          })}

          <SectionLabel label={t('houseExtension')} color="teal" />
          <div className="grid grid-cols-2 gap-2">
            {HOUSE_PH008.options.extension.map((opt, i) => {
              const labels = { 0: t('noExtension'), 1: '+1,2 m', 2: '+2,4 m', 3: '+3,6 m', 4: '+4,8 m' };
              return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('extension', i, opt.price)} selected={extensionIdx === i} onClick={() => setExtensionIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('extension', i, p)} />;
            })}
          </div>

          <SectionLabel label={t('foundations')} color="amber" />
          {HOUSE_PH008.options.foundation.map((opt, i) => {
            const labels = { 0: t('noFoundations'), 1: t('pilotsFootings'), 2: t('foundationSlab'), 3: t('stripFoundations') };
            const descs = { 0: t('noFoundationsDesc'), 1: t('pilotsFootingsDesc'), 2: t('foundationSlabDesc'), 3: t('stripFoundationsDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('foundation', i, opt.price)} description={descs[i] || opt.description} selected={foundationIdx === i} onClick={() => setFoundationIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('foundation', i, p)} />;
          })}
        </AccordionSection>

        {/* ── Exteriér ── */}
        <AccordionSection id="exterior" title={t('stepExterior')} icon={Thermometer} openId={openSection} setOpenId={setOpenSection}
          badge={`${HOUSE_PH008.options.insulation[insulationIdx].label} · ${HOUSE_PH008.options.facade[facadeIdx].label} · ${HOUSE_PH008.options.doors[doorsIdx].label}`}>

          <SectionLabel label={t('insulationType')} color="blue" />
          {HOUSE_PH008.options.insulation.map((opt, i) => {
            const labels = { 0: t('yearRound150mm'), 1: t('enhanced200mm'), 2: t('premium250mm'), 3: t('extra300mm') };
            const descs = { 0: t('yearRound150mmDesc'), 1: t('enhanced200mmDesc'), 2: t('premium250mmDesc'), 3: t('extra300mmDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('insulation', i, opt.price)} description={descs[i] || opt.description} selected={insulationIdx === i} onClick={() => setInsulationIdx(i)} isA0={opt.label.includes('250 mm')} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('insulation', i, p)} />;
          })}

          <SectionLabel label={t('facade')} color="purple" />
          {HOUSE_PH008.options.facade.map((opt, i) => {
            const labels = { 0: t('facadeStandard'), 1: t('facadeStucco') };
            const descs = { 0: t('facadeStandardDesc'), 1: t('facadeStuccoDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('facade', i, opt.price)} description={descs[i] || opt.description} selected={facadeIdx === i} onClick={() => setFacadeIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('facade', i, p)} />;
          })}

          <SectionLabel label={t('entryDoors')} color="red" />
          {HOUSE_PH008.options.doors.map((opt, i) => {
            const labels = { 0: t('doorsStandard'), 1: t('doorsMetal2Locks'), 2: t('doorsPlasticMetal') };
            const descs = { 0: t('doorsStandardDesc'), 1: t('doorsMetal2LocksDesc'), 2: t('doorsPlasticMetalDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('doors', i, opt.price)} description={descs[i] || opt.description} selected={doorsIdx === i} onClick={() => setDoorsIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('doors', i, p)} />;
          })}

          <SectionLabel label={t('additionalWindows')} color="gray" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: t('roofWindow'), p: getPrice('addon', 'roofWindow', HOUSE_PH008.addons.roofWindow), v: roofWindows, s: setRoofWindows, k: 'roofWindow' },
              { l: t('fixedWindow'), p: getPrice('addon', 'fixWindow', HOUSE_PH008.addons.fixWindow), v: fixWindows, s: setFixWindows, k: 'fixWindow' },
              { l: t('tiltWindowBig'), p: getPrice('addon', 'tiltWindowBig', HOUSE_PH008.addons.tiltWindowBig), v: tiltWindowsBig, s: setTiltWindowsBig, k: 'tiltWindowBig' },
              { l: t('tiltWindowSmall'), p: getPrice('addon', 'tiltWindowSmall', HOUSE_PH008.addons.tiltWindowSmall), v: tiltWindowsSmall, s: setTiltWindowsSmall, k: 'tiltWindowSmall' }
            ].map((item, idx) => (
              <CounterRow key={idx} label={item.l} price={item.p} value={item.v} onChange={item.s} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', item.k, p)} />
            ))}
          </div>
        </AccordionSection>

        {/* ── Interiér ── */}
        <AccordionSection id="interior" title={t('interior')} icon={Layout} openId={openSection} setOpenId={setOpenSection}
          badge={HOUSE_PH008.options.interior[interiorIdx].label}>

          <SectionLabel label={t('interiorFinish')} color="emerald" />
          {HOUSE_PH008.options.interior.map((opt, i) => {
            const labels = { 0: t('noInterior'), 1: t('interiorWood'), 2: t('interiorDrywall') };
            const descs = { 0: t('noInteriorDesc'), 1: t('interiorWoodDesc'), 2: t('interiorDrywallDesc') };
            return <OptionCard key={i} label={labels[i] || opt.label} price={getPrice('interior', i, opt.price)} description={descs[i] || opt.description} selected={interiorIdx === i} onClick={() => setInteriorIdx(i)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('interior', i, p)} />;
          })}

          <SectionLabel label={t('interiorDoorsCount')} color="gray" />
          <CounterRow label={t('interiorDoorsCount')} price={getPrice('addon', 'interiorDoor', HOUSE_PH008.addons.interiorDoor)} value={interiorDoorsCount} onChange={setInteriorDoorsCount} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'interiorDoor', p)} />

          <SectionLabel label="Doplnky interiéru" color="gray" />
          <AddonRow label={t('windowLamination')} price={getPrice('addon', 'windowLamination', HOUSE_PH008.addons.windowLamination)} checked={windowLamination} onChange={() => setWindowLamination(!windowLamination)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowLamination', p)} t={t} />
          <AddonRow label={t('tintedGlass')} price={getPrice('addon', 'windowTint', HOUSE_PH008.addons.windowTint)} checked={windowTint} onChange={() => setWindowTint(!windowTint)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowTint', p)} t={t} />
          <AddonRow label={t('laminateFloors')} price={getPrice('addon', 'laminateFloors', HOUSE_PH008.addons.laminateFloors)} checked={laminateFloors} onChange={() => setLaminateFloors(!laminateFloors)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'laminateFloors', p)} t={t} />
          <AddonRow label={t('floorHeating')} price={getPrice('addon', 'floorHeating', HOUSE_PH008.addons.floorHeating)} checked={floorHeating} onChange={() => setFloorHeating(!floorHeating)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'floorHeating', p)} t={t} />
        </AccordionSection>

        {/* ── Technológie ── */}
        <AccordionSection id="tech" title={t('technologies')} icon={Zap} openId={openSection} setOpenId={setOpenSection}>
          <SectionLabel label="Rozvody" color="gray" />
          <AddonRow label={t('electricalWiring')} price={getPrice('addon', 'electricity', HOUSE_PH008.addons.electricity)} checked={electricity} onChange={() => setElectricity(!electricity)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'electricity', p)} t={t} />
          <AddonRow label={t('waterDrainage')} price={getPrice('addon', 'water', HOUSE_PH008.addons.water)} checked={water} onChange={() => setWater(!water)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'water', p)} t={t} />
          <AddonRow label={t('sanitary')} price={getPrice('addon', 'sanita', HOUSE_PH008.addons.sanita)} checked={sanita} onChange={() => setSanita(!sanita)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'sanita', p)} t={t} />
          <AddonRow label={t('boiler')} price={getPrice('addon', 'boiler', HOUSE_PH008.addons.boiler)} checked={boiler} onChange={() => setBoiler(!boiler)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'boiler', p)} t={t} />
          
          <SectionLabel label={t('a0Standard')} color="green" />
          <AddonRow label={t('heatPump')} price={getPrice('addon', 'heatPump', HOUSE_PH008.addons.heatPump)} checked={heatPump} onChange={() => setHeatPump(!heatPump)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'heatPump', p)} t={t} />
          <AddonRow label={t('recuperation')} price={getPrice('addon', 'recuperation', HOUSE_PH008.addons.recuperation)} checked={recuperation} onChange={() => setRecuperation(!recuperation)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'recuperation', p)} t={t} />
        </AccordionSection>

        {/* ── Služby ── */}
        <AccordionSection id="services" title={t('services')} icon={FileText} openId={openSection} setOpenId={setOpenSection}>
          <SectionLabel label="Dokumentácia a inžiniering" color="gray" />
          <AddonRow label={t('projectant')} price={getPrice('addon', 'projectant', HOUSE_PH008.addons.projectant)} checked={projectant} onChange={() => setProjectant(!projectant)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'projectant', p)} t={t} />
          <AddonRow label={t('engineering')} description={t('engineeringDesc')} price={getPrice('addon', 'engineering', HOUSE_PH008.addons.engineering)} checked={engineering} onChange={() => setEngineering(!engineering)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'engineering', p)} t={t} />
          <AddonRow label={t('revisions')} price={getPrice('addon', 'revision', HOUSE_PH008.addons.revision)} checked={revision} onChange={() => {}} disabled={true} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'revision', p)} t={t} />
          <AddonRow label={t('networkConnections')} price={getPrice('addon', 'networks', HOUSE_PH008.addons.networks)} checked={networks} onChange={() => setNetworks(!networks)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'networks', p)} t={t} />

          <SectionLabel label={t('freeServices')} color="gray" />
          <AddonRow label={t('realEstate')} price={0} checked={realEstate} onChange={() => setRealEstate(!realEstate)} t={t} />
          <AddonRow label={t('landSearch')} price={0} checked={landSearch} onChange={() => setLandSearch(!landSearch)} t={t} />
          <AddonRow label={t('financing')} price={0} checked={financing} onChange={() => setFinancing(!financing)} t={t} />
        </AccordionSection>

        {/* ── Súhrn ceny (desktop) ── */}
        <div className="hidden md:block bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('totalWithVAT')}</div>
              <div className="text-4xl font-black">{totalPrice.toLocaleString()} €</div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isA0Compliant ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
              {isA0Compliant ? t('meetsA0Cert') : t('recreationalUse')}
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-md active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              {t('sendQuote')}
            </button>
          </div>
        </div>

      </div>

      {/* ── Fixný mobilný panel ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-50 md:hidden shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.12)]">
        <div className="px-4 py-2 flex items-center gap-3">
          <button onClick={() => setMobileSummaryOpen(true)} className="flex-1 text-left">
            <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              {t('totalWithVAT')} <Eye className="w-3 h-3 text-gray-400" />
            </div>
            <div className="text-2xl font-black text-gray-900 leading-tight">{totalPrice.toLocaleString()} €</div>
            <div className={`text-[11px] font-bold mt-0.5 ${isA0Compliant ? 'text-green-600' : 'text-blue-600'}`}>
              {isA0Compliant ? `✓ ${t('meetsA0Cert')}` : t('recreationalUse')}
            </div>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm">{t('sendQuote')}</span>
          </button>
        </div>
      </div>

      {/* ── Mobilný súhrn (slide up) ── */}
      {mobileSummaryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end md:hidden animate-in fade-in duration-200" onClick={() => setMobileSummaryOpen(false)}>
          <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto w-full p-5 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>
            <h3 className="text-lg font-bold mb-4">{t('configurationSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-600">{HOUSE_PH008.name}</span><span className="font-bold">{HOUSE_PH008.basePrice.toLocaleString()} €</span></div>
              {mountingIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('assemblyItem')}</span><span className="font-semibold text-red-600">+{getPrice('mounting', mountingIdx, HOUSE_PH008.options.mounting[mountingIdx].price).toLocaleString()} €</span></div>}
              {extensionIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('extensionItem')}</span><span className="font-semibold text-red-600">+{getPrice('extension', extensionIdx, HOUSE_PH008.options.extension[extensionIdx].price).toLocaleString()} €</span></div>}
              <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('insulationItem')}</span><span className="font-semibold">{getPrice('insulation', insulationIdx, HOUSE_PH008.options.insulation[insulationIdx].price) > 0 ? `+${getPrice('insulation', insulationIdx, HOUSE_PH008.options.insulation[insulationIdx].price).toLocaleString()} €` : '✓'}</span></div>
              {foundationIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('foundationsItem')}</span><span className="font-semibold text-red-600">+{getPrice('foundation', foundationIdx, HOUSE_PH008.options.foundation[foundationIdx].price).toLocaleString()} €</span></div>}
              {facadeIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('facadeItem')}</span><span className="font-semibold text-red-600">+{getPrice('facade', facadeIdx, HOUSE_PH008.options.facade[facadeIdx].price).toLocaleString()} €</span></div>}
              {doorsIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('doorsItem')}</span><span className="font-semibold text-red-600">+{getPrice('doors', doorsIdx, HOUSE_PH008.options.doors[doorsIdx].price).toLocaleString()} €</span></div>}
              {interiorIdx > 0 && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('interiorFinishItem')}</span><span className="font-semibold text-red-600">+{getPrice('interior', interiorIdx, HOUSE_PH008.options.interior[interiorIdx].price).toLocaleString()} €</span></div>}
              {electricity && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('electricalInstallation')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'electricity', HOUSE_PH008.addons.electricity).toLocaleString()} €</span></div>}
              {water && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('waterAndDrainage')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'water', HOUSE_PH008.addons.water).toLocaleString()} €</span></div>}
              {sanita && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('sanitaryComplete')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'sanita', HOUSE_PH008.addons.sanita).toLocaleString()} €</span></div>}
              {boiler && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('boilerItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'boiler', HOUSE_PH008.addons.boiler).toLocaleString()} €</span></div>}
              {heatPump && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('heatPumpItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'heatPump', HOUSE_PH008.addons.heatPump).toLocaleString()} €</span></div>}
              {recuperation && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('recuperationItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'recuperation', HOUSE_PH008.addons.recuperation).toLocaleString()} €</span></div>}
              {laminateFloors && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('laminateFloorsItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'laminateFloors', HOUSE_PH008.addons.laminateFloors).toLocaleString()} €</span></div>}
              {floorHeating && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('floorHeatingItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'floorHeating', HOUSE_PH008.addons.floorHeating).toLocaleString()} €</span></div>}
              {engineering && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('engineeringItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'engineering', HOUSE_PH008.addons.engineering).toLocaleString()} €</span></div>}
              {projectant && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('projectantItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'projectant', HOUSE_PH008.addons.projectant).toLocaleString()} €</span></div>}
              {revision && <div className="flex justify-between py-1.5"><span className="text-gray-600">{t('revisionsItem')}</span><span className="font-semibold text-red-600">+{getPrice('addon', 'revision', HOUSE_PH008.addons.revision).toLocaleString()} €</span></div>}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">{t('totalWithVAT')}</span>
              <span className="text-2xl font-black text-gray-900">{totalPrice.toLocaleString()} €</span>
            </div>
            <button onClick={() => { setMobileSummaryOpen(false); setModalOpen(true); }} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-base active:scale-[0.98]">
              <Send className="w-5 h-5" /> {t('sendQuote')}
            </button>
            <div className="h-24"></div>
          </div>
        </div>
      )}

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} t={t} />
      <ProstoHousePriceSaver isAdmin={isAdmin} customPrices={customPrices} domId={domIdFromUrl} houseCode="ph008" />
    </div>
  );
}