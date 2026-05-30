import React from 'react';
import { Send, Hammer, Layout, FileText, Info } from 'lucide-react';

/**
 * Spoločný súhrnný panel pre všetky Prosto House konfiguráty.
 * Zobrazuje detailný rozpis ceny na desktope a v mobile slide-up paneli.
 */
export default function ProstoHouseSummary({
  house,
  t,
  isA0Compliant,
  totalPrice,
  onSendQuote,
  // selekcie
  mountingIdx,
  extensionIdx,
  insulationIdx,
  foundationIdx,
  interiorIdx,
  doorsIdx,
  facadeIdx,
  // addony
  electricity,
  water,
  sanita,
  boiler,
  heatPump,
  recuperation,
  windowLamination,
  windowTint,
  roofWindows,
  fixWindows,
  tiltWindowsBig,
  tiltWindowsSmall,
  interiorDoorsCount,
  laminateFloors,
  floorHeating,
  networks,
  engineering,
  projectant,
  revision,
  // ceny helper
  getPrice,
  hideSendButton = false,
}) {
  const hasExtension = house.options.extension && house.options.extension.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-5 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{t('configurationSummary')}</div>
          <div className="text-4xl font-black">{totalPrice.toLocaleString()} €</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('totalWithVAT')}</div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isA0Compliant ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'}`}>
          {isA0Compliant ? t('meetsA0Cert') : t('recreationalUse')}
        </div>
      </div>

      {/* Položky */}
      <div className="p-5 space-y-1 text-sm border-b border-slate-200 dark:border-white/10">
        {/* Základná cena */}
        <div className="flex justify-between py-2 border-b border-slate-200 dark:border-white/10 mb-3">
          <span className="text-slate-750 dark:text-slate-300 font-semibold">{house.name}</span>
          <span className="font-bold text-slate-900 dark:text-white">{house.basePrice.toLocaleString()} €</span>
        </div>

        {/* Hrubá stavba */}
        <SummaryRow 
          label={t('assemblyItem')} 
          price={getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx].price)} 
          info={house.options.mounting[mountingIdx].label} 
          alwaysShow 
        />
        {hasExtension && extensionIdx > 0 && (
          <SummaryRow label={t('extensionItem')} price={getPrice('extension', extensionIdx, house.options.extension[extensionIdx].price)} info={house.options.extension[extensionIdx].label} />
        )}
        <SummaryRow
          label={t('insulationItem')}
          price={getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx].price)}
          info={house.options.insulation[insulationIdx].label}
          alwaysShow
        />
        <SummaryRow 
          label={t('foundationsItem')} 
          price={getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx].price)} 
          info={house.options.foundation[foundationIdx].label} 
          alwaysShow 
        />
        <SummaryRow label={t('facadeItem')} price={getPrice('facade', facadeIdx, house.options.facade[facadeIdx].price)} info={house.options.facade[facadeIdx].label} alwaysShow />
        <SummaryRow label={t('doorsItem')} price={getPrice('doors', doorsIdx, house.options.doors[doorsIdx].price)} info={house.options.doors[doorsIdx].label} alwaysShow />

        {/* Interiér */}
        {interiorIdx > 0 && (
          <SummaryRow label={t('interiorFinishItem')} price={getPrice('interior', interiorIdx, house.options.interior[interiorIdx].price)} info={house.options.interior[interiorIdx].label} />
        )}
        {interiorDoorsCount > 0 && (
          <SummaryRow label={`${t('interiorDoorsItem')} (${interiorDoorsCount} ks)`} price={interiorDoorsCount * getPrice('addon', 'interiorDoor', house.addons.interiorDoor)} />
        )}
        {windowLamination && <SummaryRow label={t('windowLaminationItem')} price={getPrice('addon', 'windowLamination', house.addons.windowLamination)} />}
        {windowTint && <SummaryRow label={t('tintedGlassItem')} price={getPrice('addon', 'windowTint', house.addons.windowTint)} />}
        {laminateFloors && <SummaryRow label={t('laminateFloorsItem')} price={getPrice('addon', 'laminateFloors', house.addons.laminateFloors)} />}
        {floorHeating && <SummaryRow label={t('floorHeatingItem')} price={getPrice('addon', 'floorHeating', house.addons.floorHeating)} />}

        {/* Okná */}
        {(roofWindows > 0 || fixWindows > 0 || tiltWindowsBig > 0 || tiltWindowsSmall > 0) && (
          <SummaryRow
            label={t('additionalWindowsLabel')}
            price={
              roofWindows * getPrice('addon', 'roofWindow', house.addons.roofWindow) +
              fixWindows * getPrice('addon', 'fixWindow', house.addons.fixWindow) +
              tiltWindowsBig * getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig) +
              tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall)
            }
            info={`${roofWindows + fixWindows + tiltWindowsBig + tiltWindowsSmall} ks`}
          />
        )}

        {/* Technológie */}
        {electricity && <SummaryRow label={t('electricalInstallation')} price={getPrice('addon', 'electricity', house.addons.electricity)} />}
        {water && <SummaryRow label={t('waterAndDrainage')} price={getPrice('addon', 'water', house.addons.water)} />}
        {sanita && <SummaryRow label={t('sanitaryComplete')} price={getPrice('addon', 'sanita', house.addons.sanita)} />}
        {boiler && <SummaryRow label={t('boilerItem')} price={getPrice('addon', 'boiler', house.addons.boiler)} />}
        {heatPump && <SummaryRow label={t('heatPumpItem')} price={getPrice('addon', 'heatPump', house.addons.heatPump)} />}
        {recuperation && <SummaryRow label={t('recuperationItem')} price={getPrice('addon', 'recuperation', house.addons.recuperation)} />}

        {/* Služby */}
        {networks && <SummaryRow label={t('networkConnectionsItem')} price={getPrice('addon', 'networks', house.addons.networks)} />}
        {projectant && <SummaryRow label={t('projectantItem')} price={getPrice('addon', 'projectant', house.addons.projectant)} />}
        {engineering && <SummaryRow label={t('engineeringItem')} price={getPrice('addon', 'engineering', house.addons.engineering)} />}
        {revision && <SummaryRow label={t('revisionsItem')} price={getPrice('addon', 'revision', house.addons.revision)} />}
        <SummaryRow label={t('transportItem')} price={0} alwaysShow />
      </div>

      {/* Celková cena + tlačidlo */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <span className="font-bold text-slate-800 dark:text-white text-base">{t('totalWithVAT')}</span>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString()} €</span>
        </div>
        {!hideSendButton && (
          <button
            onClick={onSendQuote}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-md active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            {t('sendQuote')}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, price, info, alwaysShow = false }) {
  if (!alwaysShow && (price === undefined || price === null)) return null;
  return (
    <div className="flex justify-between items-center py-1.5">
      <div className="flex-1 min-w-0">
        <span className="text-slate-700 dark:text-slate-300 leading-tight">{label}</span>
        {info && <span className="text-slate-450 dark:text-slate-500 text-xs ml-1">({info})</span>}
      </div>
      <span className={`font-semibold whitespace-nowrap ml-3 ${price > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-450 dark:text-slate-500'}`}>
        {price > 0 ? `+${price.toLocaleString()} €` : '✓'}
      </span>
    </div>
  );
}