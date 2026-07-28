import React from "react";
import { Sparkles, X, Loader2, Search } from "lucide-react";

const SUGGESTIONS = [
  "4-izbový dom do 100 000 €",
  "Mobilný dom do 50 000 €",
  "Veľký dom nad 100 m² pre rodinu",
  "Najlacnejší celoročný dom",
];

export default function AISearchBar({ query, onQueryChange, onSearch, onClear, searching, aiSummary }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl max-w-3xl mx-auto">
      <div className="flex items-center gap-3 bg-slate-950/80 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-400 transition-all">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napíšte napr.: Hľadám 4-izbový rodinný dom do 100 000 € s nízkymi nákladmi..."
          className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
        />
        {query && (
          <button onClick={onClear} className="text-slate-500 hover:text-white" aria-label="Vymazať">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onSearch}
          disabled={searching || !query.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {searching ? "AI hľadá..." : "Hľadať"}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 px-1 text-[11px] font-mono">
        <span className="text-slate-500 font-bold shrink-0">Skúste:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { onQueryChange(s); }}
            className="bg-slate-800/60 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/60 rounded-lg px-2.5 py-1 whitespace-nowrap transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {aiSummary && (
        <div className="mt-3 mx-1 text-left text-xs text-purple-200 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 leading-relaxed">
          <span className="font-bold">✨ AI asistent:</span> {aiSummary}
        </div>
      )}
    </div>
  );
}