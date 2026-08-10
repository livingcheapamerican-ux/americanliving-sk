import React from "react";
import { ArrowLeft } from "lucide-react";

export default function LyonBackBar({ balikLabel, onBack }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="text-sm">
          <span className="text-muted-foreground">Vybraný balík: </span>
          <span className="font-bold text-foreground">{balikLabel}</span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zmeniť typ stavby
        </button>
      </div>
    </div>
  );
}