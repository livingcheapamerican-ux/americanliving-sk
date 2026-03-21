import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Inteligentný A0 indikátor pre Prosto House konfigurátor.
 * Zobrazuje stav A0 certifikátu a návrhy chýbajúcich komponentov.
 */
export default function A0StatusBar({ isA0Compliant, insulationIdx, heatPump, recuperation, projectant, typStavby, t }) {
  if (typStavby !== 'rodinny_dom') return null;

  const missing = [];
  if (insulationIdx < 2) missing.push({ label: 'Izolácia Prémium 250 mm', hint: 'sekcia Exteriér' });
  if (!heatPump) missing.push({ label: 'Tepelné čerpadlo', hint: 'sekcia Technológie' });
  if (!recuperation) missing.push({ label: 'Rekuperácia', hint: 'sekcia Technológie' });
  if (!projectant) missing.push({ label: 'Projektant A0', hint: 'sekcia Služby' });

  if (isA0Compliant) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-green-800 text-sm">Konfigurácia spĺňa A0 certifikát</div>
          <div className="text-xs text-green-700 mt-0.5">Dom je vhodný na trvalé bývanie a spĺňa energetické požiadavky triedy A0.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-amber-800 text-sm">Pre A0 certifikát chýba:</div>
          <div className="mt-2 space-y-1.5">
            {missing.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-800 font-medium">{item.label}</span>
                <span className="text-xs text-amber-500">→ {item.hint}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}