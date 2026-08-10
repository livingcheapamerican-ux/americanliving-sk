import React from "react";
import { Check, Star } from "lucide-react";
import { fmt, monthlyPayment } from "./lyonBaliky";

export default function LyonBalikCard({ title, subtitle, price, delta, badge, highlight, bullets, ctaLabel, onSelect }) {
  return (
    <div className={`flex flex-col rounded-3xl border-2 p-6 md:p-7 backdrop-blur-md transition-all ${
      highlight
        ? 'border-[#C5A880] bg-[#C5A880]/[0.07] shadow-[0_0_30px_rgba(197,168,128,0.18)]'
        : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02]'
    }`}>
      {badge && (
        <span className="self-start mb-3 inline-flex items-center gap-1.5 bg-[#9E2A2B] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Star className="w-3 h-3" /> {badge}
        </span>
      )}
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{subtitle}</p>

      <div className="mt-5 pt-5 border-t border-slate-200 dark:border-white/10">
        <div className="text-3xl font-black text-slate-900 dark:text-white">{fmt(price)}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          s DPH · orientačne od <span className="font-bold text-slate-700 dark:text-slate-200">{monthlyPayment(price).toLocaleString('sk-SK')} €/mes.</span>
        </div>
        {delta > 0 && (
          <div className="mt-2 inline-block text-xs font-bold text-[#9E2A2B] dark:text-[#C5A880] bg-[#C5A880]/10 border border-[#C5A880]/30 px-2.5 py-1 rounded-lg">
            + {fmt(delta)} k základnej cene
          </div>
        )}
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`mt-6 w-full rounded-2xl py-4 font-bold transition-all active:scale-[0.98] ${
          highlight
            ? 'bg-gradient-to-r from-[#9E2A2B] to-[#802021] text-white shadow-[0_4px_20px_rgba(158,42,43,0.3)]'
            : 'bg-slate-900 dark:bg-white/10 text-white hover:opacity-90'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}