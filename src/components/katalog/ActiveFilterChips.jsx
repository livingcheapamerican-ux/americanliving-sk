import React from "react";
import { X } from "lucide-react";

export default function ActiveFilterChips({ chips, onClearAll, t }) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] sm:text-xs font-bold hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
      >
        {t('reset')}
      </button>
    </div>
  );
}