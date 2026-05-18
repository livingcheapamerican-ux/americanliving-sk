import React from 'react';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

/**
 * Inteligentný A0 indikátor — zobrazuje čo chýba pre A0 certifikát.
 * Keď sú všetky podmienky splnené, zobrazí pozitívny stav.
 */
export default function A0StatusHint({ isA0Compliant, insulationIdx, heatPump, recuperation, projectant, onGoToSection, t }) {
  const missing = [];

  const insulationOk = insulationIdx >= 2; // 250mm alebo viac
  if (!insulationOk) missing.push({ label: 'Izolácia min. 250 mm', section: 'exterior' });
  if (!heatPump) missing.push({ label: 'Tepelné čerpadlo', section: 'tech' });
  if (!recuperation) missing.push({ label: 'Rekuperácia', section: 'tech' });
  if (!projectant) missing.push({ label: 'Projektant', section: 'services' });

  if (isA0Compliant) {
    return (
      <div className="mt-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold">Dom spĺňa všetky požiadavky pre energetický certifikát A0</span>
        </div>
        <p className="text-[11px] text-emerald-500 mt-1 ml-6">{t ? t('meetsA0CertDesc') : 'Vhodné na kolaudáciu ako rodinný dom.'}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
      <div className="flex items-center gap-2 text-amber-400 mb-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-bold">Pre A0 certifikát ešte chýba:</span>
      </div>
      <div className="space-y-1.5 ml-6">
        {missing.map((m, i) => (
          <button
            key={i}
            onClick={() => onGoToSection && onGoToSection(m.section)}
            className="flex items-center gap-2 text-xs text-amber-500 hover:text-amber-400 group w-full text-left transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
            <span className="underline decoration-dotted group-hover:decoration-solid">{m.label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}