import React from "react";
import { Check } from "lucide-react";

export default function CompareSelect({ selected, disabled, onToggle, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled && !selected}
        className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border backdrop-blur-md transition-all ${
          selected
            ? "bg-amber-500 text-slate-950 border-amber-400"
            : disabled
              ? "bg-slate-900/80 text-slate-600 border-slate-700 cursor-not-allowed"
              : "bg-slate-900/80 text-slate-200 border-slate-600 hover:border-amber-400 hover:text-amber-300"
        }`}
        title={disabled && !selected ? "Naraz môžete porovnať maximálne 4 ponuky" : "Pridať do porovnania"}
      >
        {selected ? <><Check className="w-3 h-3" /> V porovnaní</> : "Porovnať"}
      </button>
      <div className={selected ? "ring-2 ring-amber-400/60 rounded-2xl" : ""}>{children}</div>
    </div>
  );
}