import React from 'react';
import { Info } from 'lucide-react';

export default function ShellInfoBox({ basePriceKit, assemblyPrice, t }) {
  const shellPrice = basePriceKit + assemblyPrice;
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
      <div className="space-y-4">
        {/* Ceny */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">{t('basePriceKit')}:</span>
            <span className="font-bold text-lg text-gray-900">{basePriceKit.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">{t('shellAssemblyPrice')}:</span>
            <span className="font-bold text-lg text-gray-900">{assemblyPrice.toLocaleString()} €</span>
          </div>
          <div className="border-t-2 border-amber-300 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">{t('shellPrice')}:</span>
              <span className="font-black text-2xl text-amber-700">{shellPrice.toLocaleString()} €</span>
            </div>
          </div>
        </div>

        {/* Čo obsahuje */}
        <div className="pt-4 border-t border-amber-200">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            {t('shellPriceIncludes')}
          </h4>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('woodenFrame')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('exteriorFacade')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('windows')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('doors')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('hydroInsulation')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('thermalInsulation')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('vaporBarrier')}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-600 mt-1">•</span>
              <span>{t('roughFloor')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}