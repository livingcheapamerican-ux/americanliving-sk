import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { prostoHouseTranslations } from '../translations/ProstoHouseTranslations';

const HOUSE_PH008 = {
  name: "Barn 48 (PH-008)",
  basePrice: 20900,
  options: {
    mounting: [
      { label: "Bez montáže", price: 0 },
      { label: "S montážou", price: 4875 }
    ],
    extension: [
      { label: "Bez predĺženia", price: 0 },
      { label: "+1,2 m", price: 3300 },
      { label: "+2,4 m", price: 6606 },
      { label: "+3,6 m", price: 9900 },
      { label: "+4,8 m", price: 15880 }
    ],
    insulation: [
      { label: "Celoročná 150 mm", price: 0 },
      { label: "Zvýšená 200 mm", price: 1400 },
      { label: "Prémium 250 mm", price: 2800 },
      { label: "Extra 300 mm", price: 5250 }
    ],
    foundation: [
      { label: "Bez základov", price: 0 },
      { label: "Pilóty/Pätky", price: 3077 },
      { label: "Základová doska", price: 6595 },
      { label: "Pásové základy", price: 6782 }
    ],
    interior: [
      { label: "Bez interiéru", price: 0 },
      { label: "Drevo", price: 4100 },
      { label: "Sadrokartón", price: 4715 }
    ],
    doors: [
      { label: "Štandard", price: 0 },
      { label: "Kovové s 2 zámkami", price: 720 },
      { label: "Plastovo-kovové", price: 660 }
    ],
    facade: [
      { label: "Štandardná", price: 0 },
      { label: "Šúchaná fasáda", price: 4321 }
    ]
  },
  addons: {
    electricity: 2300,
    water: 980,
    sanita: 1169,
    boiler: 246,
    heatPump: 1100,
    recuperation: 2214,
    windowLamination: 790,
    windowTint: 375,
    roofWindow: 760,
    fixWindow: 500,
    tiltWindowBig: 540,
    tiltWindowSmall: 225,
    interiorDoor: 250,
    laminateFloors: 850,
    floorHeating: 2819,
    networks: 1500,
    engineering: 2590,
    projectant: 3500,
    revision: 500
  }
};

function SummaryRow({ label, price, included, t }) {
  if (price === 0 && !included) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-bold whitespace-nowrap ${included ? 'text-gray-400' : 'text-gray-900'}`}>
        {included ? `✓ ${t('includedInPrice')}` : `+${price.toLocaleString()} €`}
      </span>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-3 pb-1 first:pt-0">{label}</div>
  );
}

/**
 * Zobrazí súhrnnú cenovú tabuľku uloženej konfigurácie PH-008 v jazyku v akom bola vytvorená.
 * Props:
 *   konfiguratorData - objekt uložený pri SaveQuoteButton
 *   celkovaCena      - číslo
 *   language         - kód jazyka (sk, en, de, ...)
 */
export default function PH008QuoteSummary({ konfiguratorData, celkovaCena, language = 'sk' }) {
  if (!konfiguratorData) return null;

  const t = (key) =>
    prostoHouseTranslations[language]?.[key] ||
    prostoHouseTranslations['sk']?.[key] ||
    key;

  const {
    mountingIdx = 0,
    extensionIdx = 0,
    insulationIdx = 0,
    foundationIdx = 0,
    interiorIdx = 0,
    doorsIdx = 0,
    facadeIdx = 0,
    electricity, water, sanita, boiler,
    heatPump, recuperation,
    windowLamination, windowTint,
    roofWindows = 0, fixWindows = 0,
    tiltWindowsBig = 0, tiltWindowsSmall = 0,
    interiorDoorsCount = 0,
    laminateFloors, floorHeating,
    networks, engineering, projectant, revision,
    typStavby
  } = konfiguratorData;

  const isA0 = insulationIdx >= 2 && heatPump && recuperation && projectant;

  // helper
  const opt = (category, idx) => HOUSE_PH008.options[category][idx] || HOUSE_PH008.options[category][0];
  const addon = (key) => HOUSE_PH008.addons[key] || 0;

  const sections = [
    {
      title: t('roughConstruction'),
      rows: [
        { label: HOUSE_PH008.name, price: HOUSE_PH008.basePrice, included: false, always: true },
        { label: `${t('assemblyItem') || 'Montáž'}: ${opt('mounting', mountingIdx).label}`, price: opt('mounting', mountingIdx).price, included: mountingIdx === 0, always: true },
        ...(extensionIdx > 0 ? [{ label: `${t('extensionItem')}: ${opt('extension', extensionIdx).label}`, price: opt('extension', extensionIdx).price }] : []),
        { label: `${t('insulationItem') || 'Izolácia'}: ${opt('insulation', insulationIdx).label}`, price: opt('insulation', insulationIdx).price, included: insulationIdx === 0, always: true },
        ...(foundationIdx > 0 ? [{ label: `${t('foundationsItem') || 'Základy'}: ${opt('foundation', foundationIdx).label}`, price: opt('foundation', foundationIdx).price }] : []),
        { label: `${t('doorsItem') || 'Vstupné dvere'}: ${opt('doors', doorsIdx).label}`, price: opt('doors', doorsIdx).price, included: doorsIdx === 0, always: true },
        { label: `${t('facadeItem') || 'Fasáda'}: ${opt('facade', facadeIdx).label}`, price: opt('facade', facadeIdx).price, included: facadeIdx === 0, always: true },
        ...(roofWindows > 0 ? [{ label: `${t('roofWindow') || 'Strešné okná'} (${roofWindows} ks)`, price: roofWindows * addon('roofWindow') }] : []),
        ...(fixWindows > 0 ? [{ label: `${t('fixedWindow') || 'Fixné okná'} (${fixWindows} ks)`, price: fixWindows * addon('fixWindow') }] : []),
        ...(tiltWindowsBig > 0 ? [{ label: `${t('tiltWindowBig') || 'Výklopné okná veľké'} (${tiltWindowsBig} ks)`, price: tiltWindowsBig * addon('tiltWindowBig') }] : []),
        ...(tiltWindowsSmall > 0 ? [{ label: `${t('tiltWindowSmall') || 'Výklopné okná malé'} (${tiltWindowsSmall} ks)`, price: tiltWindowsSmall * addon('tiltWindowSmall') }] : []),
      ]
    },
    {
      title: t('interior') || 'Interiér',
      rows: [
        ...(interiorIdx > 0 ? [{ label: `${t('interiorFinishItem') || 'Interiér'}: ${opt('interior', interiorIdx).label}`, price: opt('interior', interiorIdx).price }] : []),
        ...(interiorDoorsCount > 0 ? [{ label: `${t('interiorDoorsCount') || 'Interiérové dvere'} (${interiorDoorsCount} ks)`, price: interiorDoorsCount * addon('interiorDoor') }] : []),
        ...(windowLamination ? [{ label: t('windowLaminationItem') || 'Laminácia okien', price: addon('windowLamination') }] : []),
        ...(windowTint ? [{ label: t('tintedGlassItem') || 'Tónované sklá', price: addon('windowTint') }] : []),
        ...(laminateFloors ? [{ label: t('laminateFloorsItem') || 'Laminátové podlahy', price: addon('laminateFloors') }] : []),
        ...(floorHeating ? [{ label: t('floorHeatingItem') || 'Podlahové kúrenie', price: addon('floorHeating') }] : []),
      ]
    },
    {
      title: t('technologies') || 'Technológie',
      rows: [
        ...(electricity ? [{ label: t('electricalInstallation') || 'Elektroinštalácia', price: addon('electricity') }] : []),
        ...(water ? [{ label: t('waterAndDrainage') || 'Voda a kanalizácia', price: addon('water') }] : []),
        ...(sanita ? [{ label: t('sanitaryComplete') || 'Sanita', price: addon('sanita') }] : []),
        ...(boiler ? [{ label: t('boilerItem') || 'Bojler', price: addon('boiler') }] : []),
        ...(heatPump ? [{ label: t('heatPumpItem') || 'Tepelné čerpadlo', price: addon('heatPump') }] : []),
        ...(recuperation ? [{ label: t('recuperationItem') || 'Rekuperácia', price: addon('recuperation') }] : []),
      ]
    },
    {
      title: t('services') || 'Služby a dokumentácia',
      rows: [
        ...(projectant ? [{ label: t('projectantItem') || 'Projektant', price: addon('projectant') }] : []),
        ...(engineering ? [{ label: t('engineeringItem') || 'Inžiniering', price: addon('engineering') }] : []),
        ...(revision ? [{ label: t('revisionsItem') || 'Revízie', price: addon('revision') }] : []),
        ...(networks ? [{ label: t('networkConnectionsItem') || 'Prípojky sietí', price: addon('networks') }] : []),
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">{HOUSE_PH008.name}</div>
            <div className="text-gray-400 text-xs mt-0.5">{typStavby === 'rodinny_dom' ? (t('familyHouseA0') || 'Rodinný dom A0') : (t('recreationalBuilding') || 'Rekreačná stavba')}</div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isA0 ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
            {isA0 ? <CheckCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            {isA0 ? (t('meetsA0Cert') || 'Spĺňa A0') : (t('recreationalUse') || 'Rekreačná')}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-6 py-4">
        {sections.map((section, si) => {
          const visibleRows = section.rows.filter(r => r.always || r.price > 0);
          if (visibleRows.length === 0 && !section.rows.some(r => r.always)) return null;
          return (
            <div key={si}>
              <SectionHeader label={section.title} />
              {section.rows.map((row, ri) => {
                if (!row.always && !row.price) return null;
                return (
                  <SummaryRow
                    key={ri}
                    label={row.label}
                    price={row.price || 0}
                    included={row.included || row.price === 0}
                    t={t}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Total */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
          <span className="font-bold text-gray-900 text-base">{t('totalWithVAT') || 'Celková cena s DPH'}</span>
          <span className="text-3xl font-black text-gray-900">{celkovaCena?.toLocaleString()} €</span>
        </div>
      </div>
    </div>
  );
}