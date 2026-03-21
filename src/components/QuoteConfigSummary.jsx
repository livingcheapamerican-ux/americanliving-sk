import React from 'react';
import { prostoHouseTranslations } from './translations/ProstoHouseTranslations';

/**
 * Zobrazuje súhrnnú tabuľku konfigurácie z uloženej ponuky —
 * rovnaká štruktúra ako odoslaná cenová ponuka, bez obrázkov.
 */
export default function QuoteConfigSummary({ quote }) {
  const data = quote.konfigurator_data || {};
  const lang = data.language || 'sk';
  const t = (key) => prostoHouseTranslations[lang]?.[key] ?? prostoHouseTranslations['sk']?.[key] ?? key;

  const selectedItems = data.selectedItems;

  // Ak máme selectedItems (štruktúrovaný rozpis), zobrazíme tabuľku
  if (selectedItems && selectedItems.length > 0) {
    const formatPrice = (price) => {
      if (!price) return '—';
      return price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };

    const isA0 = data.projektA0 && data.izolaciaNavysenie === 'premium' && data.tepelneCerpadlo && data.rekuperacia;

    return (
      <div className="space-y-4">
        {/* Typ stavby badge */}
        <div className={`rounded-xl p-4 border-2 ${isA0 ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
          <div className={`text-lg font-bold ${isA0 ? 'text-green-800' : 'text-amber-800'}`}>
            {isA0 ? `🏡 ${t('familyHouseA0')}` : `🏕️ ${t('recreationalBuilding')}`}
          </div>
          {isA0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {[t('meetsAllA0Norms')].map(l => (
                <span key={l} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          )}
        </div>

        {/* Cenový rozpis */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="text-left px-4 py-3 font-semibold">{t('configurationSummary')}</th>
                <th className="text-right px-4 py-3 font-semibold">{t('totalWithVAT')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, idx) => {
                const isSectionHeader =
                  item.section === 'header' ||
                  ['HRUBÁ STAVBA', 'HOLODOM', 'DOM NA KĽÚČ', 'DOKUMENTÁCIA',
                   t('shellConstruction')?.toUpperCase(), t('shellHouse')?.toUpperCase(),
                   t('turnkeyHouse')?.toUpperCase(), t('documentation')?.toUpperCase()
                  ].includes(item.name?.toUpperCase());

                if (isSectionHeader) {
                  return (
                    <tr key={idx} className="bg-blue-600 text-white">
                      <td colSpan={2} className="px-4 py-2 font-bold text-xs uppercase tracking-wide">
                        {item.name}
                      </td>
                    </tr>
                  );
                }

                const isBase = item.section === 'base';

                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isBase ? 'bg-blue-50' : ''}`}
                  >
                    <td className={`px-4 py-2.5 ${isBase ? 'font-bold text-blue-800' : item.selected ? 'font-medium text-green-700' : 'text-gray-400 line-through'}`}>
                      {item.name}
                    </td>
                    <td className={`px-4 py-2.5 text-right ${isBase ? 'font-bold text-blue-800' : item.selected ? 'font-semibold text-green-700' : 'text-gray-400'}`}>
                      {item.selected || isBase ? formatPrice(item.price) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Celková cena */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-5 text-center">
          <div className="text-sm opacity-90 uppercase tracking-wide">{t('totalWithVAT')}</div>
          <div className="text-4xl font-black mt-1">{quote.celkova_cena?.toLocaleString()} €</div>
        </div>
      </div>
    );
  }

  // Fallback: generický key-value rozpis ak nemáme selectedItems
  const entries = Object.entries(data).filter(([key, val]) =>
    typeof val !== 'object' && val !== null && val !== undefined && val !== '' && key !== 'language'
  );

  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="text-left px-4 py-3 font-semibold">{t('configurationSummary')}</th>
            <th className="text-right px-4 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val], idx) => (
            <tr key={key} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-4 py-2.5 text-gray-500">{key}</td>
              <td className="px-4 py-2.5 text-right font-medium text-gray-900">{String(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-b-xl p-4 text-center">
        <div className="text-xs opacity-90 uppercase tracking-wide">{t('totalWithVAT')}</div>
        <div className="text-3xl font-black mt-0.5">{quote.celkova_cena?.toLocaleString()} €</div>
      </div>
    </div>
  );
}