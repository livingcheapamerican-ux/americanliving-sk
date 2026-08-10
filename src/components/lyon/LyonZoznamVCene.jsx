import React, { useState } from "react";
import { Check, ChevronDown, Info } from "lucide-react";
import { fmt } from "./lyonBaliky";

export default function LyonZoznamVCene({ title, note, items, defaultOpen = false, showPrices = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
          {title} <span className="text-slate-400 font-medium">({items.length})</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {note && (
            <p className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{note}</span>
            </p>
          )}
          <ul className="space-y-2.5">
            {items.map((item, i) => {
              const label = typeof item === 'string' ? item : item.label;
              const why = typeof item === 'string' ? null : item.why;
              const price = typeof item === 'string' ? null : item.price;
              return (
                <li key={i} className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex items-start gap-2 min-w-0">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{label}</span>
                      {why && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{why}</p>}
                    </div>
                  </div>
                  {showPrices ? (
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">+ {fmt(price)}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">
                      v cene
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}