import React, { useState } from 'react';
import House3DViewer from './House3DViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Rotate3d, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Home,
  Clock,
  Euro
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function Barn48InteractiveSection({ dom, className = '' }) {
  const [activeConfig, setActiveConfig] = useState({
    facade: 'standard',
    extension: 0,
    interior: 'wood',
    totalLength: 7.8,
    estimatedArea: 35
  });

  // Základná cena pre Barn 48
  const basePrice = 21600;
  
  // Výpočet doplatku za predĺženie o +1.3 m
  const extensionPrices = {
    0: 0,
    1.3: 3300,
    2.6: 6606,
    3.9: 9900
  };

  // Výpočet doplatku za omietku
  const facadePrices = {
    standard: 0,
    wood: 0,
    stucco: 4321
  };

  const currentPrice = basePrice + (extensionPrices[activeConfig.extension] || 0) + (facadePrices[activeConfig.facade] || 0);

  return (
    <div className={`w-full my-4 sm:my-8 space-y-4 sm:space-y-6 ${className}`}>
      
      {/* Hlavička sekcie */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5">
              3D SHOWROOM
            </Badge>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              360° Prehliadka & Konfigurátor
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Barn House 48 (PH-008) v 3D
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl hidden sm:block">
            Vyskúšajte si v reálnom čase otáčanie, zmenu materiálu fasády, predĺženie modulov a nahliadnite do interiéru cez 3D odklopenie strechy.
          </p>
        </div>

        {/* Live Cenovka v hlavičke */}
        <div className="relative z-10 flex items-center sm:flex-col sm:items-end justify-between sm:justify-center bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-300 font-bold">Cena modelu:</span>
          <div className="text-xl sm:text-3xl font-black text-white flex items-center gap-1">
            <span>{currentPrice.toLocaleString('sk-SK')} €</span>
            <span className="text-[10px] sm:text-xs font-normal text-slate-300">s DPH</span>
          </div>
        </div>
      </div>

      {/* Samotný 3D Prehliadač */}
      <House3DViewer
        modelUrl={dom?.model_3d_url || null}
        initialFacade={activeConfig.facade}
        initialExtension={activeConfig.extension}
        initialInterior={activeConfig.interior}
        height="680px"
        onConfigChange={(newCfg) => setActiveConfig(newCfg)}
      />

      {/* Rýchle výhody a preklik do konfigurátora */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
            <Rotate3d className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">360° Pohľad</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plná rotácia a detailný zoom</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">3 Typy Fasády</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Antracit, Smrek a Murovka</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900 dark:text-white">Energetická trieda A0</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pripravené na celoročné bývanie</p>
          </div>
        </div>
      </div>

    </div>
  );
}
