import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Mini cenový sumár zobrazený na konci každej otvorenej sekcie akordeónu.
 * Zobrazuje len položky relevantné pre danú sekciu + celkovú cenu sekcie.
 */
export default function SectionPriceSummary({ items, onNextSection, nextLabel }) {
  const sectionTotal = items.reduce((s, i) => s + (i.price || 0), 0);
  const hasItems = items.some(i => i.price > 0);

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Výber tejto sekcie</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-gray-600 truncate mr-2">{item.label}</span>
            <span className={`font-bold whitespace-nowrap flex-shrink-0 ${item.price > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {item.price > 0 ? `+${item.price.toLocaleString()} €` : '✓ V cene'}
            </span>
          </div>
        ))}
      </div>
      {hasItems && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">Táto sekcia:</span>
          <span className="text-sm font-black text-red-600">+{sectionTotal.toLocaleString()} €</span>
        </div>
      )}
      {onNextSection && (
        <button
          onClick={onNextSection}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          {nextLabel || 'Pokračovať'} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}