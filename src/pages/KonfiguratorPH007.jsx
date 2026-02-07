import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Eye,
  Lock,
  DoorOpen,
  Edit2
} from 'lucide-react';

const HOUSE_PH007 = {
  "id": "a-frame",
  "name": "A-Frame 48 (PH-007)",
  "basePrice": 22700,
  "options": {
    "mounting": [
      {
        "label": "Bez montáže",
        "price": 0,
        "description": "Svojpomocne"
      },
      {
        "label": "S montážou",
        "price": 5675,
        "description": "Profesionálna montáž"
      }
    ],
    "extension": [
      {
        "label": "Bez predĺženia",
        "price": 0
      },
      {
        "label": "+1,2 m",
        "price": 3550
      },
      {
        "label": "+2,4 m",
        "price": 7100
      },
      {
        "label": "+3,6 m",
        "price": 10650
      },
      {
        "label": "+4,8 m",
        "price": 14200
      }
    ],
    "insulation": [
      {
        "label": "Celoročná 150 mm",
        "price": 0,
        "description": "Štandard"
      },
      {
        "label": "Zvýšená 200 mm",
        "price": 1600,
        "description": "Zvýšený štandard"
      },
      {
        "label": "Prémium 250 mm",
        "price": 3200,
        "description": "Pre A0 certifikát"
      },
      {
        "label": "Extra 300 mm",
        "price": 6000,
        "description": "Extra úspora"
      }
    ],
    "foundation": [
      {
        "label": "Bez základov",
        "price": 0,
        "description": "Vlastná realizácia"
      },
      {
        "label": "Pilóty/Pätky",
        "price": 2100,
        "description": "Zemné skrutky"
      },
      {
        "label": "Základová doska",
        "price": 7000,
        "description": "Betón"
      },
      {
        "label": "Pásové základy",
        "price": 6000,
        "description": "Betónové pásy"
      }
    ],
    "interior": [
      {
        "label": "Bez interiéru",
        "price": 0,
        "description": "Holostavba"
      },
      {
        "label": "Drevo",
        "price": 4400,
        "description": "Smrekový obklad"
      },
      {
        "label": "Sadrokartón",
        "price": 5015,
        "description": "Hladké steny"
      }
    ],
    "doors": [
      {
        "label": "Štandard",
        "price": 0,
        "description": "Základné"
      },
      {
        "label": "Kovové s 2 zámkami",
        "price": 720,
        "description": "Bezpečnostné"
      },
      {
        "label": "Plastovo-kovové",
        "price": 660,
        "description": "Odolné"
      }
    ],
    "facade": [
      {
        "label": "Štandardná",
        "price": 0,
        "description": "Drevený obklad"
      },
      {
        "label": "Šúchaná fasáda",
        "price": 2414,
        "description": "Biela omietka"
      }
    ]
  },
  "addons": {
    "electricity": 2300,
    "water": 980,
    "sanita": 1169,
    "boiler": 246,
    "heatPump": 1100,
    "recuperation": 2214,
    "windowLamination": 850,
    "windowTint": 420,
    "roofWindow": 760,
    "fixWindow": 500,
    "tiltWindowBig": 540,
    "tiltWindowSmall": 225,
    "interiorDoor": 250,
    "laminateFloors": 980,
    "floorHeating": 2819,
    "networks": 1500,
    "engineering": 2590,
    "projectant": 3500,
    "revision": 500,
    "transport": 0
  }
};

const TypeSelector = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <button
        onClick={() => onSelect('rekreacna')}
        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 h-32 md:h-40 active:scale-95 ${
          selected === 'rekreacna'
            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600 ring-offset-2'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <Home className="w-8 h-8 md:w-10 md:h-10" />
        <span className="text-lg md:text-xl font-bold">Rekreačná stavba</span>
      </button>

      <button
        onClick={() => onSelect('rodinny_dom')}
        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 h-32 md:h-40 active:scale-95 ${
          selected === 'rodinny_dom'
            ? 'border-green-600 bg-green-50 text-green-900 ring-2 ring-green-600 ring-offset-2'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-2">
          <Home className="w-8 h-8 md:w-10 md:h-10" />
          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">A0</span>
        </div>
        <span className="text-lg md:text-xl font-bold">Rodinný dom A0</span>
      </button>
    </div>
  );
};

const ConfiguratorTile = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, category = 'default' }) => {
  const categoryColors = {
    'mounting': { border: 'border-orange-400', bg: 'from-orange-50 to-orange-100/50', accent: 'orange', selectedBg: 'from-orange-100 to-orange-150' },
    'extension': { border: 'border-teal-400', bg: 'from-teal-50 to-teal-100/50', accent: 'teal', selectedBg: 'from-teal-100 to-teal-150' },
    'insulation': { border: 'border-blue-400', bg: 'from-blue-50 to-blue-100/50', accent: 'blue', selectedBg: 'from-blue-100 to-blue-150' },
    'foundation': { border: 'border-amber-400', bg: 'from-amber-50 to-amber-100/50', accent: 'amber', selectedBg: 'from-amber-100 to-amber-150' },
    'interior': { border: 'border-emerald-400', bg: 'from-emerald-50 to-emerald-100/50', accent: 'emerald', selectedBg: 'from-emerald-100 to-emerald-150' },
    'doors': { border: 'border-red-400', bg: 'from-red-50 to-red-100/50', accent: 'red', selectedBg: 'from-red-100 to-red-150' },
    'facade': { border: 'border-purple-400', bg: 'from-purple-50 to-purple-100/50', accent: 'purple', selectedBg: 'from-purple-100 to-purple-150' },
    'default': { border: 'border-indigo-400', bg: 'from-indigo-50 to-indigo-100/50', accent: 'indigo', selectedBg: 'from-indigo-100 to-indigo-150' }
  };

  const colors = categoryColors[category] || categoryColors['default'];

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300 w-full text-left active:scale-[0.98] hover:shadow-md ${
        selected
          ? `border-${colors.accent}-600 bg-gradient-to-br ${colors.selectedBg} shadow-lg ring-2 ring-${colors.accent}-400 ring-offset-1`
          : `${colors.border} bg-gradient-to-br ${colors.bg} hover:border-${colors.accent}-300 hover:shadow-md`
      }`}
    >
      <div className="flex justify-between w-full items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap pr-4">
            <span className={`font-bold text-base md:text-lg ${selected ? 'text-indigo-900' : 'text-gray-900'}`}>{label}</span>
            {isA0 && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">A0</span>}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'border-indigo-600 bg-indigo-600 scale-110' : 'border-gray-300'}`}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      {description && <p className="text-sm text-gray-500 mb-3 font-medium leading-tight">{description}</p>}
      
      <div className="flex items-center gap-2">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded px-1 py-0.5 z-10" onClick={(e) => e.stopPropagation()}>
             <span className="text-xs text-gray-400">€</span>
             <input 
               type="number" 
               value={price} 
               onChange={(e) => onPriceChange(Number(e.target.value))}
               className="w-20 text-sm font-bold text-indigo-700 outline-none"
             />
          </div>
        ) : (
          <span className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-gray-400'}`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </button>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border-2 border-indigo-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-400/50">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
          <div className="h-0.5 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-1"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const AddonCheckbox = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description }) => (
  <button
    onClick={!disabled && !locked ? onChange : undefined}
    className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all w-full active:scale-[0.98] ${
      locked 
        ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-90'
        : checked
          ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600'
          : disabled 
            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
            : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        locked 
          ? 'bg-green-600 border-green-600'
          : checked 
            ? 'bg-indigo-600 border-indigo-600' 
            : 'bg-white border-gray-300'
      }`}>
        {locked ? <Lock className="w-3 h-3 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="text-left">
        <span className={`font-semibold text-base md:text-lg block ${checked || locked ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
        {description && <p className="text-xs text-gray-500 mt-1 font-medium max-w-sm leading-tight text-left">{description}</p>}
        {locked && <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Vyžadované pre A0</span>}
      </div>
    </div>
    
    <div className="flex items-center gap-2">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded px-1 py-0.5 z-10" onClick={(e) => e.stopPropagation()}>
             <span className="text-xs text-gray-400">€</span>
             <input 
               type="number" 
               value={price} 
               onChange={(e) => onPriceChange(Number(e.target.value))}
               className="w-20 text-sm font-bold text-indigo-700 outline-none"
             />
          </div>
        ) : (
          <span className={`text-sm font-bold ${locked ? 'text-green-700' : 'text-gray-500'}`}>{price === 0 ? '0 €' : `+${price.toLocaleString()} €`}</span>
        )}
    </div>
  </button>
);

const SummaryGroup = ({ title, children, icon: Icon }) => (
  <div className="mb-5 last:mb-0">
    <div className="flex items-center gap-2 mb-3">
       {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
       <h4 className="text-sm font-bold text-gray-900">{title}</h4>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const SummaryItem = ({ label, price, active, info }) => {
  if (!active) return null;
  
  return (
    <div className="flex justify-between py-2.5 px-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 transition-all items-center gap-3">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-gray-900 leading-tight text-sm">{label}</span>
        {info && <span className="text-xs text-gray-500 leading-tight mt-0.5">{info}</span>}
      </div>
      <span className="font-bold text-indigo-700 whitespace-nowrap text-sm">
        {price && price > 0 ? `+${price.toLocaleString()} €` : '✓'}
      </span>
    </div>
  );
};

const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Odoslať nezáväzný dopyt</h2>
        <p className="text-gray-500 mb-8">Vyplňte údaje a pošleme vám detailnú cenovú ponuku na mieru.</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meno a priezvisko</label>
            <input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
            <input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefón</label>
            <input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Miesto výstavby</label>
            <input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Poznámka</label>
            <textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-lg shadow-indigo-200"
          >
            {isSubmitting ? (
              <span>Odosielam...</span>
            ) : (
              <>
                <span>Odoslať cenovú ponuku</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const STEPS = [
  { id: 'type', title: 'Typ projektu', icon: Home },
  { id: 'structure', title: 'Hrubá stavba', icon: Hammer },
  { id: 'exterior', title: 'Exteriér', icon: Thermometer },
  { id: 'interior', title: 'Interiér', icon: Layout },
  { id: 'tech', title: 'Technológie', icon: Zap },
  { id: 'services', title: 'Služby', icon: FileText },
];

export default function KonfiguratorPH007() {
  const [activeStep, setActiveStep] = useState(0);
  const [typStavby, setTypStavby] = useState('rekreacna');
  const [isAdmin, setIsAdmin] = useState(false);
  const [customPrices, setCustomPrices] = useState({});

  const getPrice = (category, indexOrKey, defaultPrice) => {
    const key = `${category}-${indexOrKey}`;
    return customPrices[key] !== undefined ? customPrices[key] : defaultPrice;
  };

  const updatePrice = (category, indexOrKey, newPrice) => {
    const key = `${category}-${indexOrKey}`;
    setCustomPrices(prev => ({...prev, [key]: newPrice}));
  };

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
    if (typStavby === 'rodinny_dom') {
      const premiumInsulationIndex = HOUSE_PH007.options.insulation.length > 2 ? 2 : HOUSE_PH007.options.insulation.length - 1;
      setInsulationIdx(premiumInsulationIndex);
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

  const isA0Compliant = useMemo(() => {
    const currentInsulation = HOUSE_PH007.options.insulation[insulationIdx];
    const hasA0Insulation = currentInsulation.label.includes('250 mm');
    return hasA0Insulation && heatPump && recuperation && projectant;
  }, [insulationIdx, heatPump, recuperation, projectant]);

  const totalPrice = useMemo(() => {
    let total = HOUSE_PH007.basePrice;
    
    total += getPrice('mounting', mountingIdx, HOUSE_PH007.options.mounting[mountingIdx].price);
    total += getPrice('extension', extensionIdx, HOUSE_PH007.options.extension[extensionIdx].price);
    total += getPrice('insulation', insulationIdx, HOUSE_PH007.options.insulation[insulationIdx].price);
    total += getPrice('foundation', foundationIdx, HOUSE_PH007.options.foundation[foundationIdx].price);
    total += getPrice('interior', interiorIdx, HOUSE_PH007.options.interior[interiorIdx].price);
    total += getPrice('doors', doorsIdx, HOUSE_PH007.options.doors[doorsIdx].price);
    total += getPrice('facade', facadeIdx, HOUSE_PH007.options.facade[facadeIdx].price);
    
    if (electricity) total += getPrice('addon', 'electricity', HOUSE_PH007.addons.electricity);
    if (water) total += getPrice('addon', 'water', HOUSE_PH007.addons.water);
    if (sanita) total += getPrice('addon', 'sanita', HOUSE_PH007.addons.sanita);
    if (boiler) total += getPrice('addon', 'boiler', HOUSE_PH007.addons.boiler);
    
    if (heatPump) total += getPrice('addon', 'heatPump', HOUSE_PH007.addons.heatPump);
    if (recuperation) total += getPrice('addon', 'recuperation', HOUSE_PH007.addons.recuperation);
    
    if (windowLamination) total += getPrice('addon', 'windowLamination', HOUSE_PH007.addons.windowLamination);
    if (windowTint) total += getPrice('addon', 'windowTint', HOUSE_PH007.addons.windowTint);
    
    total += roofWindows * getPrice('addon', 'roofWindow', HOUSE_PH007.addons.roofWindow);
    total += fixWindows * getPrice('addon', 'fixWindow', HOUSE_PH007.addons.fixWindow);
    total += tiltWindowsBig * getPrice('addon', 'tiltWindowBig', HOUSE_PH007.addons.tiltWindowBig);
    total += tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', HOUSE_PH007.addons.tiltWindowSmall);
    
    total += interiorDoorsCount * getPrice('addon', 'interiorDoor', HOUSE_PH007.addons.interiorDoor);

    if (laminateFloors) total += getPrice('addon', 'laminateFloors', HOUSE_PH007.addons.laminateFloors);
    if (floorHeating) total += getPrice('addon', 'floorHeating', HOUSE_PH007.addons.floorHeating);
    
    if (networks) total += getPrice('addon', 'networks', HOUSE_PH007.addons.networks);
    if (engineering) total += getPrice('addon', 'engineering', HOUSE_PH007.addons.engineering);
    if (projectant) total += getPrice('addon', 'projectant', HOUSE_PH007.addons.projectant);
    if (revision) total += getPrice('addon', 'revision', HOUSE_PH007.addons.revision);
    
    return total;
  }, [
    mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
    electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
    roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount, laminateFloors, floorHeating,
    networks, engineering, projectant, revision, customPrices
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Cenová ponuka bola úspešne odoslaná! Skontrolujte si svoj e-mail.');
      setIsSubmitting(false);
      setModalOpen(false);
    }, 1500);
  };

  const nextStep = () => {
    if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
    else setModalOpen(true);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6 text-center">Vyberte typ projektu</h2>
            <TypeSelector selected={typStavby} onSelect={setTypStavby} />
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${isA0Compliant ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${isA0Compliant ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isA0Compliant ? <CheckCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg mb-1 ${isA0Compliant ? 'text-green-800' : 'text-blue-800'}`}>
                            {isA0Compliant ? 'Rodinný dom s certifikátom A0' : 'Rekreačná stavba'}
                        </h4>
                        <p className={`text-base leading-relaxed ${isA0Compliant ? 'text-green-700' : 'text-blue-700'}`}>
                            {isA0Compliant 
                                ? 'Konfigurácia spĺňa všetky normy pre energetický certifikát A0. Vhodné na kolaudáciu ako rodinný dom.' 
                                : 'Základná konfigurácia vhodná na rekreačné účely. Pre zmenu na A0 dom zvoľte možnosť "Rodinný dom A0".'}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        );
      case 1:
        return (
          <Section title="Hrubá stavba" icon={Hammer}>
             <div className="col-span-full">
                <h4 className="font-semibold mb-3 text-sm text-orange-700 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  Montáž hrubej stavby
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {HOUSE_PH007.options.mounting.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('mounting', i, opt.price)} 
                      description={opt.description} 
                      selected={mountingIdx === i} 
                      onClick={() => setMountingIdx(i)}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('mounting', i, newPrice)}
                      category="mounting"
                      />
                      ))}
                      </div>
                      </div>
                      <div className="col-span-full mt-6">
                      <h4 className="font-semibold mb-3 text-sm text-teal-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      Predĺženie domu
                      </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HOUSE_PH007.options.extension.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('extension', i, opt.price)} 
                      description={opt.description} 
                      selected={extensionIdx === i} 
                      onClick={() => setExtensionIdx(i)}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('extension', i, newPrice)}
                      category="extension"
                      />
                      ))}
                      </div>
                      </div>
                      <div className="col-span-full mt-6">
                      <h4 className="font-semibold mb-3 text-sm text-amber-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      Základy
                      </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOUSE_PH007.options.foundation.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('foundation', i, opt.price)} 
                      description={opt.description} 
                      selected={foundationIdx === i} 
                      onClick={() => setFoundationIdx(i)}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('foundation', i, newPrice)}
                      category="foundation"
                      />
                      ))}
                      </div>
                      </div>
                      </Section>
                      );
                      case 2:
                      return (
                      <Section title="Exteriér" icon={Thermometer}>
                      <div className="col-span-full">
                      <h4 className="font-semibold mb-3 text-sm text-blue-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Typ izolácie
                      </h4>
                <div className="grid grid-cols-1 gap-3">
                  {HOUSE_PH007.options.insulation.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('insulation', i, opt.price)} 
                      description={opt.description} 
                      selected={insulationIdx === i} 
                      onClick={() => setInsulationIdx(i)} 
                      isA0={opt.label.includes('250 mm')}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('insulation', i, newPrice)}
                      category="insulation"
                      />
                      ))}
                      </div>
                      </div>
                      <div className="col-span-full mt-6">
                      <h4 className="font-semibold mb-3 text-sm text-purple-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Fasáda
                      </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOUSE_PH007.options.facade.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('facade', i, opt.price)} 
                      description={opt.description} 
                      selected={facadeIdx === i} 
                      onClick={() => setFacadeIdx(i)}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('facade', i, newPrice)}
                      category="facade"
                      />
                      ))}
                      </div>
                      </div>
                      <div className="col-span-full mt-6">
                      <h4 className="font-semibold mb-3 text-sm text-red-700 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Vstupné dvere
                      </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOUSE_PH007.options.doors.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('doors', i, opt.price)} 
                      description={opt.description} 
                      selected={doorsIdx === i} 
                      onClick={() => setDoorsIdx(i)}
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('doors', i, newPrice)}
                      category="doors"
                      />
                      ))}
                      </div>
                      </div>
                      <div className="col-span-full mt-6">
                      <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Doplnkové okná (ks)</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: 'Strešné', p: getPrice('addon', 'roofWindow', HOUSE_PH007.addons.roofWindow), v: roofWindows, s: setRoofWindows, k: 'roofWindow' },
                      { l: 'Fixné 90x205', p: getPrice('addon', 'fixWindow', HOUSE_PH007.addons.fixWindow), v: fixWindows, s: setFixWindows, k: 'fixWindow' },
                      { l: 'Výklopné 90x205', p: getPrice('addon', 'tiltWindowBig', HOUSE_PH007.addons.tiltWindowBig), v: tiltWindowsBig, s: setTiltWindowsBig, k: 'tiltWindowBig' },
                      { l: 'Výklopné 55x90', p: getPrice('addon', 'tiltWindowSmall', HOUSE_PH007.addons.tiltWindowSmall), v: tiltWindowsSmall, s: setTiltWindowsSmall, k: 'tiltWindowSmall' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-between h-full">
                        <div className="text-sm font-bold text-gray-800 mb-2 text-center">{item.l}</div>
                         {isAdmin ? (
                            <div className="flex items-center gap-1 justify-center mb-3">
                               <span className="text-xs text-indigo-600 font-bold">€</span>
                               <input 
                                 type="number" 
                                 value={item.p} 
                                 onChange={(e) => updatePrice('addon', item.k, Number(e.target.value))}
                                 className="w-16 text-sm text-center font-bold text-indigo-700 outline-none bg-white border border-indigo-200 rounded px-1"
                               />
                            </div>
                         ) : (
                           <div className="text-sm text-indigo-600 font-bold mb-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1.5 rounded-lg">{item.p} €</div>
                         )}
                         <div className="flex items-center justify-center gap-3 w-full">
                            <button onClick={() => item.s(Math.max(0, item.v - 1))} className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 flex items-center justify-center font-bold text-gray-700 active:scale-90 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-400">−</button>
                            <span className="w-6 font-bold text-lg text-gray-800">{item.v}</span>
                            <button onClick={() => item.s(item.v + 1)} className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center font-bold shadow-lg shadow-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/60 active:scale-90 transition-all duration-200">+</button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
          </Section>
        );
      case 3:
        return (
          <Section title="Interiér" icon={Layout}>
            <div className="col-span-full">
                <h4 className="font-semibold mb-3 text-sm text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  Úprava interiéru
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOUSE_PH007.options.interior.map((opt, i) => (
                    <ConfiguratorTile 
                      key={i} 
                      label={opt.label} 
                      price={getPrice('interior', i, opt.price)} 
                      description={opt.description} 
                      selected={interiorIdx === i} 
                      onClick={() => setInteriorIdx(i)} 
                      isAdmin={isAdmin}
                      onPriceChange={(newPrice) => updatePrice('interior', i, newPrice)}
                      category="interior"
                      />
                      ))}
                      </div>
                      </div>
            
            <div className="col-span-full mt-6">
                 <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Interiérové dvere</h4>
                 <div className="bg-white p-5 rounded-xl border-2 border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <DoorOpen className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="text-base font-bold text-gray-900">Počet interiérových dverí</div>
                           <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
                             Cena za kus: 
                             {isAdmin ? (
                                <input 
                                  type="number" 
                                  value={getPrice('addon', 'interiorDoor', HOUSE_PH007.addons.interiorDoor)} 
                                  onChange={(e) => updatePrice('addon', 'interiorDoor', Number(e.target.value))}
                                  className="w-20 px-1 border border-indigo-200 rounded text-indigo-600 font-bold outline-none"
                                />
                             ) : (
                                <span className="text-indigo-600 font-bold">{getPrice('addon', 'interiorDoor', HOUSE_PH007.addons.interiorDoor)} €</span>
                             )}
                           </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => setInteriorDoorsCount(Math.max(0, interiorDoorsCount - 1))} className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 flex items-center justify-center font-bold text-gray-700 active:scale-90 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-400">−</button>
                       <span className="w-12 text-center font-bold text-2xl text-gray-900">{interiorDoorsCount}</span>
                       <button onClick={() => setInteriorDoorsCount(interiorDoorsCount + 1)} className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/60 active:scale-90 transition-all duration-200">+</button>
                    </div>
                 </div>
            </div>

            <div className="col-span-full mt-6 grid grid-cols-1 gap-3">
                  <AddonCheckbox label="Laminácia farby okien" price={getPrice('addon', 'windowLamination', HOUSE_PH007.addons.windowLamination)} checked={windowLamination} onChange={() => setWindowLamination(!windowLamination)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowLamination', p)} />
                  <AddonCheckbox label="Tónované sklá" price={getPrice('addon', 'windowTint', HOUSE_PH007.addons.windowTint)} checked={windowTint} onChange={() => setWindowTint(!windowTint)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowTint', p)} />
                  <AddonCheckbox label="Podlahy laminát" price={getPrice('addon', 'laminateFloors', HOUSE_PH007.addons.laminateFloors)} checked={laminateFloors} onChange={() => setLaminateFloors(!laminateFloors)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'laminateFloors', p)} />
                  <AddonCheckbox label="Podlahové kúrenie" price={getPrice('addon', 'floorHeating', HOUSE_PH007.addons.floorHeating)} checked={floorHeating} onChange={() => setFloorHeating(!floorHeating)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'floorHeating', p)} />
            </div>
          </Section>
        );
      case 4:
        return (
          <Section title="Technológie" icon={Zap}>
             <div className="col-span-full grid grid-cols-1 gap-3">
                <AddonCheckbox label="Elektro rozvody" price={getPrice('addon', 'electricity', HOUSE_PH007.addons.electricity)} checked={electricity} onChange={() => setElectricity(!electricity)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'electricity', p)} />
                <AddonCheckbox label="Voda a odpady" price={getPrice('addon', 'water', HOUSE_PH007.addons.water)} checked={water} onChange={() => setWater(!water)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'water', p)} />
                <AddonCheckbox label="Sanita" price={getPrice('addon', 'sanita', HOUSE_PH007.addons.sanita)} checked={sanita} onChange={() => setSanita(!sanita)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'sanita', p)} />
                <AddonCheckbox label="Bojler" price={getPrice('addon', 'boiler', HOUSE_PH007.addons.boiler)} checked={boiler} onChange={() => setBoiler(!boiler)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'boiler', p)} />
              </div>
              <div className="col-span-full mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <h4 className="font-bold mb-4 text-base text-gray-800 flex items-center gap-2">
                   <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                   A0 Štandard (Automaticky zvolené)
                 </h4>
                 <div className="grid grid-cols-1 gap-3">
                    <AddonCheckbox 
                      label="Tepelné čerpadlo" 
                      price={getPrice('addon', 'heatPump', HOUSE_PH007.addons.heatPump)} 
                      checked={heatPump} 
                      onChange={() => setHeatPump(!heatPump)}
                      locked={typStavby === 'rodinny_dom'}
                      isAdmin={isAdmin} 
                      onPriceChange={(p) => updatePrice('addon', 'heatPump', p)}
                    />
                    <AddonCheckbox 
                      label="Rekuperácia" 
                      price={getPrice('addon', 'recuperation', HOUSE_PH007.addons.recuperation)} 
                      checked={recuperation} 
                      onChange={() => setRecuperation(!recuperation)}
                      locked={typStavby === 'rodinny_dom'}
                      isAdmin={isAdmin} 
                      onPriceChange={(p) => updatePrice('addon', 'recuperation', p)}
                    />
                 </div>
              </div>
          </Section>
        );
      case 5:
        return (
          <Section title="Služby" icon={FileText}>
              <div className="col-span-full grid grid-cols-1 gap-3">
                <AddonCheckbox label="Projektant" price={getPrice('addon', 'projectant', HOUSE_PH007.addons.projectant)} checked={projectant} onChange={() => setProjectant(!projectant)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'projectant', p)} />
                <AddonCheckbox 
                  label="Inžiniering" 
                  description="Vybavenie stavebného povolenia až do fázy kolaudácie. American Living dohliadne na bezproblémovú kolaudáciu domu."
                  price={getPrice('addon', 'engineering', HOUSE_PH007.addons.engineering)} 
                  checked={engineering} 
                  onChange={() => setEngineering(!engineering)} 
                  isAdmin={isAdmin} 
                  onPriceChange={(p) => updatePrice('addon', 'engineering', p)} 
                />
                <AddonCheckbox label="Revízie" price={getPrice('addon', 'revision', HOUSE_PH007.addons.revision)} checked={revision} onChange={() => {}} disabled={true} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'revision', p)} />
                <AddonCheckbox label="Prípojky sietí" price={getPrice('addon', 'networks', HOUSE_PH007.addons.networks)} checked={networks} onChange={() => setNetworks(!networks)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'networks', p)} />
              </div>
              <div className="col-span-full mt-8 border-t pt-8">
                 <h4 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wide">Bezplatné služby</h4>
                 <div className="grid grid-cols-1 gap-3">
                   <AddonCheckbox label="Predaj nehnuteľnosti" price={0} checked={realEstate} onChange={() => setRealEstate(!realEstate)} />
                   <AddonCheckbox label="Hľadanie pozemku" price={0} checked={landSearch} onChange={() => setLandSearch(!landSearch)} />
                   <AddonCheckbox label="Financovanie" price={0} checked={financing} onChange={() => setFinancing(!financing)} />
                 </div>
              </div>
          </Section>
        );
      default: return null;
    }
  };

  const SummaryContent = () => (
    <>
      <div className={`p-4 mb-5 rounded-xl border-2 ${isA0Compliant ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'}`}>
        <div className="flex items-start gap-3">
            {isA0Compliant ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" /> : <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />}
            <div>
                <h4 className={`font-bold text-base mb-1 ${isA0Compliant ? 'text-green-800' : 'text-blue-800'}`}>
                    {isA0Compliant ? 'Rodinný dom s certifikátom A0' : 'Rekreačná stavba'}
                </h4>
                <p className={`text-xs ${isA0Compliant ? 'text-green-700' : 'text-blue-700'}`}>
                    {isA0Compliant ? 'Dom spĺňa všetky A0 normy' : 'Rekreačné využitie'}
                </p>
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Základná cena</span>
          <span className="text-xl font-black text-gray-900">{HOUSE_PH007.basePrice.toLocaleString()} €</span>
        </div>
      </div>

      <SummaryGroup title="Hrubá stavba" icon={Hammer}>
        <SummaryItem label="Montáž hrubej stavby" price={getPrice('mounting', mountingIdx, HOUSE_PH007.options.mounting[mountingIdx].price)} active={mountingIdx > 0} info={mountingIdx > 0 ? HOUSE_PH007.options.mounting[mountingIdx].label : undefined} />
        <SummaryItem label="Predĺženie domu" price={getPrice('extension', extensionIdx, HOUSE_PH007.options.extension[extensionIdx].price)} active={extensionIdx > 0} info={extensionIdx > 0 ? HOUSE_PH007.options.extension[extensionIdx].label : undefined} />
        <SummaryItem label="Izolácia" price={getPrice('insulation', insulationIdx, HOUSE_PH007.options.insulation[insulationIdx].price)} active={true} info={HOUSE_PH007.options.insulation[insulationIdx].label} />
        <SummaryItem label="Základy" price={getPrice('foundation', foundationIdx, HOUSE_PH007.options.foundation[foundationIdx].price)} active={foundationIdx > 0} info={foundationIdx > 0 ? HOUSE_PH007.options.foundation[foundationIdx].label : undefined} />
        <SummaryItem label="Vstupné dvere" price={getPrice('doors', doorsIdx, HOUSE_PH007.options.doors[doorsIdx].price)} active={true} info={HOUSE_PH007.options.doors[doorsIdx].label} />
        <SummaryItem label="Fasáda" price={getPrice('facade', facadeIdx, HOUSE_PH007.options.facade[facadeIdx].price)} active={true} info={HOUSE_PH007.options.facade[facadeIdx].label} />
      </SummaryGroup>

      <SummaryGroup title="Holodom" icon={Layout}>
        <SummaryItem label="Interiér finiš" price={getPrice('interior', interiorIdx, HOUSE_PH007.options.interior[interiorIdx].price)} active={interiorIdx > 0} info={interiorIdx > 0 ? HOUSE_PH007.options.interior[interiorIdx].label : undefined} />
        <SummaryItem label={`Interiérové dvere (${interiorDoorsCount} ks)`} price={interiorDoorsCount * getPrice('addon', 'interiorDoor', HOUSE_PH007.addons.interiorDoor)} active={interiorDoorsCount > 0} />
        <SummaryItem label="Elektrická inštalácia" price={getPrice('addon', 'electricity', HOUSE_PH007.addons.electricity)} active={electricity} />
        <SummaryItem label="Rozvody vody a kanalizácie" price={getPrice('addon', 'water', HOUSE_PH007.addons.water)} active={water} />
        <SummaryItem label="Sanita komplet" price={getPrice('addon', 'sanita', HOUSE_PH007.addons.sanita)} active={sanita} />
        <SummaryItem label="Bojler" price={getPrice('addon', 'boiler', HOUSE_PH007.addons.boiler)} active={boiler} />
        <SummaryItem label="Tepelné čerpadlo" price={getPrice('addon', 'heatPump', HOUSE_PH007.addons.heatPump)} active={heatPump} />
        <SummaryItem label="Rekuperácia" price={getPrice('addon', 'recuperation', HOUSE_PH007.addons.recuperation)} active={recuperation} />
        <SummaryItem label="Prípojky sietí" price={getPrice('addon', 'networks', HOUSE_PH007.addons.networks)} active={networks} />
        <SummaryItem label="Laminácia farby okien" price={getPrice('addon', 'windowLamination', HOUSE_PH007.addons.windowLamination)} active={windowLamination} />
        <SummaryItem label="Tónované sklá" price={getPrice('addon', 'windowTint', HOUSE_PH007.addons.windowTint)} active={windowTint} />
        { (roofWindows > 0 || fixWindows > 0 || tiltWindowsBig > 0 || tiltWindowsSmall > 0) &&
            <SummaryItem 
                label="Doplnkové okná" 
                price={
                    roofWindows * getPrice('addon', 'roofWindow', HOUSE_PH007.addons.roofWindow) + 
                    fixWindows * getPrice('addon', 'fixWindow', HOUSE_PH007.addons.fixWindow) + 
                    tiltWindowsBig * getPrice('addon', 'tiltWindowBig', HOUSE_PH007.addons.tiltWindowBig) + 
                    tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', HOUSE_PH007.addons.tiltWindowSmall)
                } 
                active={true} 
                info={`${roofWindows + fixWindows + tiltWindowsBig + tiltWindowsSmall} ks`} 
            />
        }
      </SummaryGroup>

      <SummaryGroup title="Dom na kľúč" icon={Key}>
        <SummaryItem label="Podlahy - Laminát" price={getPrice('addon', 'laminateFloors', HOUSE_PH007.addons.laminateFloors)} active={laminateFloors} />
        <SummaryItem label="Elektrické podlahové vykurovanie" price={getPrice('addon', 'floorHeating', HOUSE_PH007.addons.floorHeating)} active={floorHeating} />
      </SummaryGroup>

      <SummaryGroup title="Dokumentácia" icon={FileText}>
          <SummaryItem label="Inžiniering" price={getPrice('addon', 'engineering', HOUSE_PH007.addons.engineering)} active={engineering} />
          <SummaryItem label="Projektant" price={getPrice('addon', 'projectant', HOUSE_PH007.addons.projectant)} active={projectant} />
          <SummaryItem label="Revízna dokumentácia" price={getPrice('addon', 'revision', HOUSE_PH007.addons.revision)} active={revision} />
          <SummaryItem label="Doprava" price={0} active={true} />
      </SummaryGroup>
      
      <SummaryGroup title="Bezplatné služby" icon={Info}>
          <SummaryItem label="Predaj nehnuteľnosti" price={0} active={realEstate} />
          <SummaryItem label="Hľadanie pozemku" price={0} active={landSearch} />
          <SummaryItem label="Financovanie" price={0} active={financing} />
      </SummaryGroup>
    </>
  );

  return (
    <div className="min-h-screen pb-40 md:pb-0 bg-gray-50/50">
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="w-10"></div>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 leading-none">{HOUSE_PH007.name}</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">{STEPS[activeStep].title} ({activeStep + 1}/{STEPS.length})</p>
          </div>
          
          <div className="w-24 flex justify-end items-center gap-2">
             <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                {isAdmin ? <Edit2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
             </button>
             <div className="hidden md:flex gap-1">
               {STEPS.map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full ${i === activeStep ? 'bg-indigo-600' : i < activeStep ? 'bg-indigo-200' : 'bg-gray-200'}`} />
               ))}
             </div>
          </div>
        </div>
        
        <div className="md:hidden flex items-center justify-between px-6 py-3 border-t border-gray-100 overflow-x-auto scrollbar-hide">
             {STEPS.map((step, i) => (
               <button 
                key={step.id}
                onClick={() => setActiveStep(i)}
                disabled={i > activeStep + 1}
                className="flex flex-col items-center gap-1 min-w-[3rem]"
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                   i === activeStep ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                   i < activeStep ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-gray-200 bg-white text-gray-300'
                 }`}>
                   <step.icon className="w-5 h-5" />
                 </div>
               </button>
             ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <div className="hidden md:flex items-center justify-between mb-8 px-4 overflow-x-auto pb-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 flex-1">
                  <button 
                   onClick={() => setActiveStep(i)}
                   disabled={i > activeStep + 1}
                   className={`flex flex-col items-center gap-2 group transition-all duration-300`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 shadow-md ${
                      i === activeStep 
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110 shadow-lg shadow-indigo-400/50' 
                        : i < activeStep 
                          ? 'border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600' 
                          : 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold transition-colors duration-300 ${i === activeStep ? 'text-indigo-900' : 'text-gray-500'}`}>{step.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < activeStep ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
           </div>

          <div className="bg-white md:rounded-3xl shadow-sm p-4 md:p-8 border border-gray-100 min-h-[500px]">
             {renderStepContent()}
          </div>
          
          <div className="hidden md:flex justify-between mt-8">
            <button 
              onClick={prevStep}
              disabled={activeStep === 0}
              className="px-8 py-4 rounded-2xl font-bold text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-40 disabled:hover:from-gray-100 disabled:hover:to-gray-200 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:shadow-lg active:scale-95 border border-gray-300"
            >
              <ChevronLeft className="w-5 h-5" /> Späť
            </button>
            <button 
              onClick={nextStep}
              className="px-10 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg shadow-indigo-400/50 flex items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/60 hover:scale-105 active:scale-95"
            >
              {activeStep === STEPS.length - 1 ? 'Dokončiť a odoslať' : 'Pokračovať'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white blur-2xl"></div>
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-3xl">Sumár konfigurácie</h3>
                  <p className="text-indigo-200 text-sm mt-2">{HOUSE_PH007.name}</p>
                </div>
              </div>
              
              <div className="p-6">
                <SummaryContent />
              </div>
              
              <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-t-4 border-indigo-300">
                <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl p-6 mb-5 border-2 border-indigo-300 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-5 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="text-xs text-gray-600 font-bold mb-3 uppercase tracking-widest">💰 Celková cena s DPH</div>
                    <div key={totalPrice} className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pop drop-shadow-lg">{totalPrice.toLocaleString()} €</div>
                  </div>
                </div>
                <button 
                 onClick={() => setModalOpen(true)}
                 className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-400/50 active:scale-[0.98] hover:shadow-2xl hover:shadow-indigo-500/60 flex items-center justify-center gap-2 text-lg transform hover:scale-105"
                >
                  <Send className="w-6 h-6" />
                  Odoslať cenovú ponuku
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 z-40 lg:hidden shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
         <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1" onClick={() => setMobileSummaryOpen(true)}>
               <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                 Celková cena <Eye className="w-3 h-3 text-indigo-500" />
               </div>
               <div key={totalPrice} className="text-2xl font-bold text-indigo-700 leading-none animate-pop">{totalPrice.toLocaleString()} €</div>
            </div>
            <div className="flex items-center gap-2">
               {activeStep > 0 && (
                 <button onClick={prevStep} className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-all border border-gray-200">
                   <ChevronLeft className="w-6 h-6" />
                 </button>
               )}
               <button 
                onClick={nextStep}
                className="h-12 px-6 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
               >
                 {activeStep === STEPS.length - 1 ? 'Odoslať' : 'Ďalej'}
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>

      {mobileSummaryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end lg:hidden animate-in fade-in duration-200" onClick={() => setMobileSummaryOpen(false)}>
           <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto w-full p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-bold mb-4">Detail ceny</h3>
              <SummaryContent />
              <div className="h-20"></div>
           </div>
        </div>
      )}
      
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}