import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "./LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Home, Send, CheckCircle, Lock, Eye, EyeOff,
  CheckSquare, Check, X, Thermometer, Zap, Layout, Hammer, 
  Paintbrush, DoorOpen, Wrench, Layers, Droplet, Flame
} from "lucide-react";
import { motion } from "framer-motion";

// ── Glassmorphism Komponenty ──────────────────────────────────────────────
const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon }) => (
  <button onClick={onClick} className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all duration-500 w-full text-left active:scale-[0.98] gap-4 overflow-hidden group ${selected ? 'border-red-500 bg-gradient-to-br from-red-500/10 to-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] scale-[1.02] backdrop-blur-md' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] backdrop-blur-sm'}`}>
    {selected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-80" />}
    <div className="flex items-start gap-4 w-full relative z-10">
      {Icon && (
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${selected ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/30 rotate-3' : 'bg-white/5 text-slate-400 group-hover:text-slate-300 group-hover:scale-110'}`}>
          <Icon className={`w-7 h-7 transition-transform duration-500 ${selected ? 'scale-110' : 'scale-100'}`} />
        </div>
      )}
      
      <div className="flex-1 min-w-0 mt-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`font-black text-lg transition-colors duration-300 ${selected ? 'text-white' : 'text-slate-200'}`}>{label}</span>
          {isA0 && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">A0 Certifikácia</span>}
        </div>
        {description && <p className="text-sm text-slate-400 leading-relaxed">{description}</p>}
      </div>
      
      <div className="flex flex-col items-end flex-shrink-0">
        <div className={`w-7 h-7 mb-3 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selected ? 'border-red-500 bg-red-500 scale-110 shadow-lg shadow-red-500/40' : 'border-slate-700 bg-slate-950/50'}`}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
        
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 mt-1 backdrop-blur-md" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-base font-black whitespace-nowrap transition-colors duration-300 ${selected ? 'text-red-400' : 'text-slate-500'}`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t, icon: Icon }) => (
  <button onClick={!disabled && !locked ? onChange : undefined} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 w-full active:scale-[0.98] group overflow-hidden relative ${locked ? 'border-emerald-500/30 bg-emerald-500/5 cursor-not-allowed' : checked ? 'border-red-500 bg-gradient-to-r from-red-500/10 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)] scale-[1.01] backdrop-blur-md' : disabled ? 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] backdrop-blur-sm'}`}>
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${locked ? 'bg-emerald-500/20 text-emerald-400' : checked ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
        {Icon ? <Icon className={`w-6 h-6 transition-transform duration-500 ${checked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />)}
      </div>
      <div className="text-left">
        <span className={`font-bold text-lg block transition-colors duration-300 ${checked || locked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        {locked && <span className="text-[11px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> {t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
    </div>
    <div className="flex items-center gap-4 ml-3 flex-shrink-0 relative z-10">
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500 scale-110' : 'bg-slate-950/50 border-slate-700'}`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-shrink-0 min-w-[70px] text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-base font-black whitespace-nowrap transition-colors duration-300 ${locked ? 'text-emerald-400' : 'text-slate-400'}`}>
            {price === 0 ? '0 €' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${value > 0 ? 'bg-slate-800 text-white' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-300'}`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-red-400 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10 backdrop-blur-sm">−</button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-500'}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">+</button>
    </div>
  </div>
);

const SectionLabel = ({ label, color = 'gray' }) => {
  const colorMap = {
    'gray': 'text-slate-400',
    'orange': 'text-orange-400',
    'teal': 'text-teal-400',
    'amber': 'text-amber-400',
    'blue': 'text-blue-400',
    'purple': 'text-purple-400',
    'red': 'text-red-400',
    'emerald': 'text-emerald-400',
    'green': 'text-green-400'
  };
  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};
const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t, icon: Icon }) => (
  <button onClick={!disabled && !locked ? onChange : undefined} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 w-full active:scale-[0.98] group overflow-hidden relative ${locked ? 'border-emerald-500/30 bg-emerald-500/5 cursor-not-allowed' : checked ? 'border-red-500 bg-gradient-to-r from-red-500/10 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)] scale-[1.01] backdrop-blur-md' : disabled ? 'border-white/5 bg-slate-900/50 opacity-60 cursor-not-allowed' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] backdrop-blur-sm'}`}>
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${locked ? 'bg-emerald-500/20 text-emerald-400' : checked ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
        {Icon ? <Icon className={`w-6 h-6 transition-transform duration-500 ${checked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />)}
      </div>
      <div className="text-left">
        <span className={`font-bold text-lg block transition-colors duration-300 ${checked || locked ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        {description && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>}
        {locked && <span className="text-[11px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> {t ? t('requiredForA0') : 'Vyžadované pre A0'}</span>}
      </div>
    </div>
    <div className="flex items-center gap-4 ml-3 flex-shrink-0 relative z-10">
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${locked ? 'bg-emerald-500 border-emerald-500' : checked ? 'bg-red-500 border-red-500 scale-110' : 'bg-slate-950/50 border-slate-700'}`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-shrink-0 min-w-[70px] text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-base font-black whitespace-nowrap transition-colors duration-300 ${locked ? 'text-emerald-400' : 'text-slate-400'}`}>
            {price === 0 ? '0 €' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${value > 0 ? 'bg-slate-800 text-white' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-300'}`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-red-400 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10 backdrop-blur-sm">−</button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-500'}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">+</button>
    </div>
  </div>
);

  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};
const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${value > 0 ? 'bg-slate-800 text-white' : 'bg-white/5 text-slate-400 group-hover:scale-110 transition-transform duration-300'}`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-300'}`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-red-400 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-slate-300 active:scale-90 transition-all border border-white/10 backdrop-blur-sm">−</button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${value > 0 ? 'text-white' : 'text-slate-500'}`}>{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">+</button>
    </div>
  </div>
);

  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};
  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};
const BigSectionHeader = ({ title, description, icon: Icon, stepIdx, totalSteps }) => (
  <div className="mb-8 border-b border-white/10 pb-6">
    <div className="lg:hidden text-red-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-red-500"></span>
      Krok {stepIdx + 1} z {totalSteps}
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">{title}</h2>
        {description && <p className="text-slate-400 text-sm lg:text-base leading-relaxed">{description}</p>}
      </div>
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t('inquiryForm')}</h2>
        <p className="text-slate-400 mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('nameSurname')}</label><input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('email')}</label><input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('phone')}</label><input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('city')}</label><input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" /></div>
          <div><label className="block text-sm font-semibold text-slate-300 mb-2">{t('note')}</label><textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 bg-slate-950 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"></textarea></div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            {isSubmitting ? <span>{t('sending')}</span> : <><span>{t('sendQuote')}</span><Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export function LyonSummaryPanel({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, formatPrice, onSubmit, t
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Home className="w-5 h-5" />
            {t?.('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-xs text-blue-100 mt-1">Lyon 50m²</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
        {/* Účel */}
        {ucel && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
            <p className="text-sm font-bold text-white">
              {ucel === "chata" ? (t?.('recreationalBuilding') || "Rekreačná stavba") : (t?.('familyHouseA0') || "Rodinný dom A0")}
            </p>
          </div>
        )}

        {/* Izolácia */}
        {(izolaciaStien !== "150mm" || izolaciaPodlahy !== "150mm" || izolaciaStropu !== "150mm") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('insulation') || 'IZOLÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {izolaciaStien !== "150mm" && <p className="text-slate-300">• {t?.('walls') || 'Steny'} {izolaciaStien}</p>}
              {izolaciaPodlahy !== "150mm" && <p className="text-slate-300">• {t?.('floors') || 'Podlaha'} {izolaciaPodlahy}</p>}
              {izolaciaStropu !== "150mm" && <p className="text-slate-300">• {t?.('roof') || 'Strop'} {izolaciaStropu}</p>}
            </div>
          </div>
        )}

        {/* Vykurovanie */}
        {(tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('heating') || 'VYKUROVANIE'}</p>
            <div className="space-y-1 text-xs">
              {tepelneCerpadlo === "ano" && <p className="text-slate-300">• {t?.('heatPump') || 'Tepelné čerpadlo'}</p>}
              {rekuperacia === "ano" && <p className="text-slate-300">• {t?.('recuperation') || 'Rekuperácia'}</p>}
              {podlahovoKurenie && <p className="text-slate-300">• {t?.('floorHeating') || 'Podlahové kúrenie'}</p>}
              {pripravaNaKrb && <p className="text-slate-300">• Príprava na krb</p>}
              {ochranaKachle && <p className="text-slate-300">• Ochrana na kachle</p>}
            </div>
          </div>
        )}

        {/* Fasáda */}
        {fasada !== "drevo_smrek" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('facadeSection') || 'FASÁDA'}</p>
            <p className="text-sm text-slate-300">
              {fasada === "omietka" ? "Šúchaná omietka" : 
               fasada === "smrekovec" ? "Smrekovec" :
               fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
            </p>
          </div>
        )}

        {/* Strecha */}
        {(strecha !== "korugovan_plech" || odkvapy === "ano") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('roofSection') || 'STRECHA'}</p>
            <div className="space-y-1 text-xs">
              {strecha !== "korugovan_plech" && <p className="text-slate-300">• Falcované panely</p>}
              {odkvapy === "ano" && <p className="text-slate-300">• Odkvapy</p>}
            </div>
          </div>
        )}

        {/* Okná a dvere */}
        {(okna !== "biele" || vchodoveDvere !== "plastove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('windowsDoorsSection') || 'OKNÁ A DVERE'}</p>
            <div className="space-y-1 text-xs">
              {okna !== "biele" && <p className="text-slate-300">• Okná {okna === "antracit" ? "antracit" : "hnedé"}</p>}
              {vchodoveDvere !== "plastove" && <p className="text-slate-300">• Kovové dvere</p>}
            </div>
          </div>
        )}

        {/* Interiér */}
        {(obkladStien !== "smrek_8cm" || interieroveDvere !== "kridlove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('interiorSection') || 'INTERIÉR'}</p>
            <div className="space-y-1 text-xs">
              {obkladStien !== "smrek_8cm" && (
                <p className="text-slate-300">
                  • {obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov" :
                     obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"}
                </p>
              )}
              {interieroveDvere !== "kridlove" && <p className="text-slate-300">• Posuvné dvere</p>}
            </div>
          </div>
        )}

        {/* Elektro */}
        {(elektro !== "eu" || bleskozvod || prepat) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('electricalSection') || 'ELEKTROINŠTALÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {elektro === "cz" && <p className="text-slate-300">• CZ/SK štandard</p>}
              {elektro === "ge" && <p className="text-slate-300 flex items-center gap-1">• GE štandard <span className="text-green-400">⚡A0</span></p>}
              {bleskozvod && <p className="text-slate-300 flex items-center gap-1">• Bleskozvod <span className="text-green-400">⚡A0</span></p>}
              {prepat && <p className="text-slate-300 flex items-center gap-1">• Prepäťová ochrana <span className="text-green-400">⚡A0</span></p>}
            </div>
          </div>
        )}

        {/* Kúpeľňa */}
        {(sprchovyKut !== "standard" || bateria !== "standard" || vana || skrinka || stropKupelna !== "drevo") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('bathroomSection') || 'KÚPEĽŇA'}</p>
            <div className="space-y-1 text-xs">
              {sprchovyKut !== "standard" && <p className="text-slate-300">• Sprcha Radaway</p>}
              {bateria !== "standard" && <p className="text-slate-300">• Batéria Grohe</p>}
              {stropKupelna !== "drevo" && <p className="text-slate-300">• Sadrokartónový strop</p>}
              {vana && <p className="text-slate-300">• Vaňa</p>}
              {skrinka && <p className="text-slate-300">• Skrinka</p>}
            </div>
          </div>
        )}

        {/* Základy */}
        {zaklady !== "bez" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('foundationsSection') || 'ZÁKLADY'}</p>
            <p className="text-sm text-slate-300">
              {zaklady === "vruty" ? "Zemné vruty" :
               zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}
            </p>
          </div>
        )}

        {/* Služby */}
        {(inziniering || projektACertifikacia || revizia) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('servicesSection') || 'SLUŽBY'}</p>
            <div className="space-y-1 text-xs">
              {inziniering && <p className="text-slate-300 flex items-center gap-1">• Inžiniering <span className="text-green-400">⚡A0</span></p>}
              {projektACertifikacia && <p className="text-slate-300 flex items-center gap-1">• Projekt + Certifikácia <span className="text-green-400">⚡A0</span></p>}
              {revizia && <p className="text-slate-300">• Revízna dokumentácia</p>}
            </div>
          </div>
        )}

        {/* Realizácia */}
        {(montaz || doprava) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('realizationSection') || 'REALIZÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {montaz && <p className="text-slate-300">• {t?.('assembly') || 'Montáž domu'}</p>}
              {doprava && <p className="text-slate-300">• {t?.('transport') || 'Doprava modulov'}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Total Price */}
      <div className="border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-xs text-blue-100 mb-1">{t?.('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
        <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
        <div className="mt-3">
          <Button onClick={onSubmit} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg">
            <Send className="w-4 h-4 mr-2" />
            {t?.('sendInquiry') || 'Odoslať dopyt'}
          </Button>
        </div>
      </div>
    </Card>
  );
}


export default function KonfiguratorLyon(props = {}) {
  const BASE_PRICE = 73431;
  const { language, t } = useLanguage();
  const onSubmit = props.onSubmit || (() => {});
  
  // Načítať texty konfiguratora
  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  // Pomocná funkcia na získanie preloženého textu
  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return '';
    
    if (language === 'sk') return text[field] || '';
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || '';
  };
  
  // State
  const [ucel, setUcel] = useState(props.ucel || "chata");
  const [kolaudacia, setKolaudacia] = useState("bez_a0");
  const [izolaciaStien, setIzolaciaStien] = useState(props.izolaciaStien || "150mm");
  const [izolaciaPodlahy, setIzolaciaPodlahy] = useState(props.izolaciaPodlahy || "150mm");
  const [izolaciaStropu, setIzolaciaStropu] = useState(props.izolaciaStropu || "150mm");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(props.tepelneCerpadlo || "nie");
  const [rekuperacia, setRekuperacia] = useState(props.rekuperacia || "nie");
  const [pripravaNaRekuperaciu, setPripravaNaRekuperaciu] = useState(props.pripravaNaRekuperaciu || false);
  const [podlahovoKurenie, setPodlahovoKurenie] = useState(props.podlahovoKurenie || false);
  const [klimatizacia, setKlimatizacia] = useState(props.klimatizacia || false);
  const [pripravaNaKrb, setPripravaNaKrb] = useState(props.pripravaNaKrb || false);
  const [ochranaKachle, setOchranaKachle] = useState(props.ochranaKachle || false);
  const [pripravaNaSolarnePanely, setPripravaNaSolarnePanely] = useState(props.pripravaNaSolarnePanely || false);
  const [fasada, setFasada] = useState(props.fasada || "drevo_smrek");
  const [strecha, setStrecha] = useState(props.strecha || "korugovan_plech");
  const [odkvapy, setOdkvapy] = useState(props.odkvapy || "nie");
  const [okna, setOkna] = useState(props.okna || "biele");
  const [vchodoveDvere, setVchodoveDvere] = useState(props.vchodoveDvere || "plastove");
  const [obkladStien, setObkladStien] = useState(props.obkladStien || "smrek_8cm");
  const [podlaha, setPodlaha] = useState(props.podlaha || "laminat");
  const [interieroveDvere, setInterieroveDvere] = useState(props.interieroveDvere || "kridlove");
  const [elektro, setElektro] = useState(props.elektro || "eu");
  const [bleskozvod, setBleskozvod] = useState(props.bleskozvod || false);
  const [prepat, setPrepat] = useState(props.prepat || false);
  const [sprchovyKut, setSprchovyKut] = useState(props.sprchovyKut || "standard");
  const [vana, setVana] = useState(props.vana || false);
  const [bateria, setBateria] = useState(props.bateria || "standard");
  const [skrinka, setSkrinka] = useState(props.skrinka || false);
  const [stropKupelna, setStropKupelna] = useState(props.stropKupelna || "drevo");
  const [inziniering, setInziniering] = useState(props.inziniering || false);
  const [projektACertifikacia, setProjektACertifikacia] = useState(props.projektACertifikacia || false);
  const [revizia, setRevizia] = useState(props.revizia !== undefined ? props.revizia : true);
  const [zaklady, setZaklady] = useState(props.zaklady || "bez");
  const [montaz, setMontaz] = useState(props.montaz || false);
  const [doprava, setDoprava] = useState(props.doprava || false);
  
  // Dodatočné služby
  const [predajNehnutelnosti, setPredajNehnutelnosti] = useState(props.predajNehnutelnosti || false);
  const [chcemPozemok, setChcemPozemok] = useState(props.chcemPozemok || false);
  const [financneSluzby, setFinancneSluzby] = useState(props.financneSluzby || false);

  // Synchronizovať state s props ak sa props zmenia
  React.useEffect(() => {
    if (props.setUcel) props.setUcel(ucel);
  }, [ucel]);
  React.useEffect(() => {
    if (props.setIzolaciaStien) props.setIzolaciaStien(izolaciaStien);
  }, [izolaciaStien]);
  React.useEffect(() => {
    if (props.setIzolaciaPodlahy) props.setIzolaciaPodlahy(izolaciaPodlahy);
  }, [izolaciaPodlahy]);
  React.useEffect(() => {
    if (props.setIzolaciaStropu) props.setIzolaciaStropu(izolaciaStropu);
  }, [izolaciaStropu]);
  React.useEffect(() => {
    if (props.setTepelneCerpadlo) props.setTepelneCerpadlo(tepelneCerpadlo);
  }, [tepelneCerpadlo]);
  React.useEffect(() => {
    if (props.setRekuperacia) props.setRekuperacia(rekuperacia);
  }, [rekuperacia]);
  React.useEffect(() => {
    if (props.setPripravaNaRekuperaciu) props.setPripravaNaRekuperaciu(pripravaNaRekuperaciu);
  }, [pripravaNaRekuperaciu]);
  React.useEffect(() => {
    if (props.setPodlahovoKurenie) props.setPodlahovoKurenie(podlahovoKurenie);
  }, [podlahovoKurenie]);
  React.useEffect(() => {
    if (props.setKlimatizacia) props.setKlimatizacia(klimatizacia);
  }, [klimatizacia]);
  React.useEffect(() => {
    if (props.setPripravaNaKrb) props.setPripravaNaKrb(pripravaNaKrb);
  }, [pripravaNaKrb]);
  React.useEffect(() => {
    if (props.setPripravaNaSolarnePanely) props.setPripravaNaSolarnePanely(pripravaNaSolarnePanely);
  }, [pripravaNaSolarnePanely]);
  React.useEffect(() => {
    if (props.setOchranaKachle) props.setOchranaKachle(ochranaKachle);
  }, [ochranaKachle]);
  React.useEffect(() => {
    if (props.setFasada) props.setFasada(fasada);
  }, [fasada]);
  React.useEffect(() => {
    if (props.setStrecha) props.setStrecha(strecha);
  }, [strecha]);
  React.useEffect(() => {
    if (props.setOdkvapy) props.setOdkvapy(odkvapy);
  }, [odkvapy]);
  React.useEffect(() => {
    if (props.setOkna) props.setOkna(okna);
  }, [okna]);
  React.useEffect(() => {
    if (props.setVchodoveDvere) props.setVchodoveDvere(vchodoveDvere);
  }, [vchodoveDvere]);
  React.useEffect(() => {
    if (props.setObkladStien) props.setObkladStien(obkladStien);
  }, [obkladStien]);
  React.useEffect(() => {
    if (props.setPodlaha) props.setPodlaha(podlaha);
  }, [podlaha]);
  React.useEffect(() => {
    if (props.setInterieroveDvere) props.setInterieroveDvere(interieroveDvere);
  }, [interieroveDvere]);
  React.useEffect(() => {
    if (props.setElektro) props.setElektro(elektro);
  }, [elektro]);
  React.useEffect(() => {
    if (props.setBleskozvod) props.setBleskozvod(bleskozvod);
  }, [bleskozvod]);
  React.useEffect(() => {
    if (props.setPrepat) props.setPrepat(prepat);
  }, [prepat]);
  React.useEffect(() => {
    if (props.setSprchovyKut) props.setSprchovyKut(sprchovyKut);
  }, [sprchovyKut]);
  React.useEffect(() => {
    if (props.setVana) props.setVana(vana);
  }, [vana]);
  React.useEffect(() => {
    if (props.setBateria) props.setBateria(bateria);
  }, [bateria]);
  React.useEffect(() => {
    if (props.setSkrinka) props.setSkrinka(skrinka);
  }, [skrinka]);
  React.useEffect(() => {
    if (props.setStropKupelna) props.setStropKupelna(stropKupelna);
  }, [stropKupelna]);
  React.useEffect(() => {
    if (props.setInziniering) props.setInziniering(inziniering);
  }, [inziniering]);
  React.useEffect(() => {
    if (props.setProjektACertifikacia) props.setProjektACertifikacia(projektACertifikacia);
  }, [projektACertifikacia]);
  React.useEffect(() => {
    if (props.setRevizia) props.setRevizia(revizia);
  }, [revizia]);
  React.useEffect(() => {
    if (props.setZaklady) props.setZaklady(zaklady);
  }, [zaklady]);
  React.useEffect(() => {
    if (props.setMontaz) props.setMontaz(montaz);
  }, [montaz]);
  React.useEffect(() => {
    if (props.setDoprava) props.setDoprava(doprava);
  }, [doprava]);
  React.useEffect(() => {
    if (props.setPredajNehnutelnosti) props.setPredajNehnutelnosti(predajNehnutelnosti);
  }, [predajNehnutelnosti]);
  React.useEffect(() => {
    if (props.setChcemPozemok) props.setChcemPozemok(chcemPozemok);
  }, [chcemPozemok]);
  React.useEffect(() => {
    if (props.setFinancneSluzby) props.setFinancneSluzby(financneSluzby);
  }, [financneSluzby]);

  const CENY = props.CENY || {
    izolacia_stien_200mm: 1799.16,
    izolacia_stien_250mm: 1558.17,
    izolacia_podlahy_200mm: 334.08,
    izolacia_stropu_200mm: 271.44,
    tepelne_cerpadlo: 2889.27,
    pripravaNaRekuperaciu: 512,
    rekuperacia: 1155.36,
    podlahove_kurenie: 2253.30,
    klimatizacia: 902,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada_omietka: 1580.79,
    fasada_smrekovec: 3349.50,
    fasada_falcovane: 4953.78,
    fasada_thermowood: 6677.25,
    strecha_falcovane: 3227.70,
    odkvapy: 1502.49,
    dvere_kovove: 278.40,
    obklad_smrek_bez_uzlov: 0,
    obklad_sadrokarton_tapeta: 7855,
    obklad_osb_panel: 5279,
    dvere_posuvne: 427.17,
    elektro_cz: 460.23,
    elektro_ge: 1583.40,
    bleskozvod: 856.08,
    prepat: 311.46,
    pripravaNaSolarnePanely: 1305,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    strop_kupelna_sadrokarton: 0,
    inziniering: 2773.56,
    projektACertifikacia: 3745.35,
    revizia: 1605.15,
    zaklady_vruty: 4494.42,
    zaklady_patky: 2568.24,
    zaklady_pasove: 11825.04,
    montaz: 4805.88,
    doprava: 8927.94
  };

  const formatTilePrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num) || num === 0) return '0 €';
    return `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
  };

  const totalPrice = useMemo(() => {
    if (props.totalPrice !== undefined) return props.totalPrice;
    let total = BASE_PRICE;
    if (izolaciaStien === "200mm") total += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") total += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") total += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") total += CENY.izolacia_stropu_200mm || 0;
    if (tepelneCerpadlo === "ano") total += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) total += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") total += CENY.rekuperacia || 0;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie || 0;
    if (klimatizacia) total += CENY.klimatizacia || 0;
    if (pripravaNaKrb) total += CENY.pripravaKrb || 0;
    if (ochranaKachle) total += CENY.ochranaKachle || 0;
    if (fasada === "omietka") total += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") total += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") total += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") total += CENY.fasada_thermowood || 0;
    if (strecha === "falcovane") total += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") total += CENY.odkvapy || 0;
    if (vchodoveDvere === "kovove") total += CENY.dvere_kovove || 0;
    if (obkladStien === "smrek_bez_uzlov") total += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") total += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") total += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne || 0;
    if (elektro === "cz") total += CENY.elektro_cz || 0;
    if (elektro === "ge") total += CENY.elektro_ge || 0;
    if (bleskozvod) total += CENY.bleskozvod || 0;
    if (prepat) total += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) total += CENY.pripravaNaSolarnePanely || 0;
    if (sprchovyKut === "radaway") total += CENY.sprchovyKut || 0;
    if (vana) total += CENY.vana || 0;
    if (bateria === "grohe") total += CENY.bateria || 0;
    if (skrinka) total += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") total += CENY.strop_kupelna_sadrokarton || 0;
    if (inziniering) total += CENY.inziniering || 0;
    if (projektACertifikacia) total += CENY.projektACertifikacia || 0;
    if (revizia) total += CENY.revizia || 0;
    if (zaklady === "vruty") total += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") total += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") total += CENY.zaklady_pasove || 0;
    if (montaz) total += CENY.montaz || 0;
    if (doprava) total += CENY.doprava || 0;
    return total;
  }, [props.totalPrice, CENY, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
      skrinka, stropKupelna, inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava]);

  const formatPrice = props.formatPrice || ((price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €");


  // ── ScrollSpy Logika ──
  const [activeSection, setActiveSection] = useState(0);
  
  const sections = [
    { id: 0, title: getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby', icon: Home },
    { id: 1, title: getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia', icon: Thermometer },
    { id: 2, title: getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie', icon: Flame },
    { id: 3, title: getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda', icon: Paintbrush },
    { id: 4, title: getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha', icon: Home },
    { id: 5, title: getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere', icon: DoorOpen },
    { id: 6, title: getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér', icon: Layout },
    { id: 7, title: getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektro', icon: Zap },
    { id: 8, title: getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa', icon: Droplet },
    { id: 9, title: getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy', icon: Wrench },
    { id: 10, title: getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering', icon: Layers },
    { id: 11, title: getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia', icon: Hammer },
    { id: 12, title: getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Služby k nákupu', icon: Sparkles },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.id.split('-')[1]);
            setActiveSection(index);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach((_, index) => {
      const element = document.getElementById(`section-${index}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(index);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full relative mt-8 font-sans">
      
      {/* ĽAVÉ MENU - Scroll Spy */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar rounded-3xl bg-slate-950 border border-white/10 p-4 shadow-2xl z-40">
        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">{t('yourConfig') || 'Konfigurácia'}</div>
        <nav className="flex flex-col gap-1 relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-800 -z-10" />
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSection(idx)}
              className={`flex items-center gap-3 w-full text-left p-2.5 rounded-xl transition-all duration-300 group ${
                activeSection === idx ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                activeSection === idx 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110' 
                  : activeSection > idx
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-900 border border-white/5 text-slate-600'
              }`}>
                {activeSection > idx ? <Check className="w-4 h-4" /> : <section.icon className="w-4 h-4" />}
              </div>
              <span className={`text-sm font-bold transition-colors duration-300 ${
                activeSection === idx ? 'text-white' : activeSection > idx ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {section.title}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* HLAVNÝ OBSAH */}
      <div className="flex-1 min-w-0 w-full space-y-12 pb-32">
        
        {/* 0. Účel stavby */}
        <section id="section-0" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby'} icon={Home} stepIdx={0} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard 
              label={getTranslatedText('ucel_rekreacna', 'nazov') || t('recreationalBuilding')}
              description={getTranslatedText('ucel_rekreacna', 'podnadpis') || t('economicChoice')}
              selected={ucel === "chata"}
              onClick={() => {
                setUcel("chata");
                setKolaudacia("bez_a0");
                setIzolaciaStien("150mm"); setIzolaciaPodlahy("150mm"); setIzolaciaStropu("150mm");
                setTepelneCerpadlo("nie"); setRekuperacia("nie"); setPripravaNaRekuperaciu(false);
                setPodlahovoKurenie(false); setPripravaNaKrb(false); setOchranaKachle(false); setKlimatizacia(false);
                setFasada("drevo_smrek"); setStrecha("korugovan_plech"); setOdkvapy("nie");
                setOkna("biele"); setVchodoveDvere("plastove"); setObkladStien("smrek_8cm");
                setPodlaha("laminat"); setInterieroveDvere("kridlove"); setElektro("eu");
                setBleskozvod(false); setPrepat(false); setPripravaNaSolarnePanely(false);
                setSprchovyKut("standard"); setVana(false); setBateria("standard");
                setSkrinka(false); setStropKupelna("drevo"); setInziniering(false);
                setProjektACertifikacia(false); setRevizia(false); setZaklady("bez");
                setMontaz(false); setDoprava(false);
              }}
              price={0}
              icon={Home}
            />
            <OptionCard 
              label={getTranslatedText('ucel_rodinny', 'nazov') || t('familyHouseA0')}
              description={getTranslatedText('ucel_rodinny', 'dlhy_popis') || t('familyHouseA0Desc')}
              selected={ucel === "rodinny"}
              isA0={true}
              onClick={() => {
                setUcel("rodinny"); setKolaudacia("s_a0");
                setIzolaciaStien("250mm"); setIzolaciaPodlahy("200mm"); setIzolaciaStropu("200mm");
                setTepelneCerpadlo("ano"); setPripravaNaRekuperaciu(true); setRekuperacia("ano");
                setInziniering(true); setProjektACertifikacia(true); setRevizia(true);
                setBleskozvod(true); setPrepat(true); setElektro("ge"); setKlimatizacia(true);
              }}
              price={0}
              icon={Zap}
            />
          </div>
        </section>

        {/* 1. Izolácia */}
        <section id="section-1" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia'} icon={Thermometer} stepIdx={1} totalSteps={13} />
          
          <SectionLabel label={getTranslatedText('izolacia_stien', 'nazov') || t('wallInsulation') || 'Izolácia stien'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('izolacia_stien_150', 'nazov') || t('walls150mm') || 'Steny 150mm'} description={getTranslatedText('izolacia_stien_150', 'podnadpis')} selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} price={0} />
            <OptionCard label={getTranslatedText('izolacia_stien_200', 'nazov') || t('walls200mm') || 'Steny 200mm'} description={getTranslatedText('izolacia_stien_200', 'podnadpis')} selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} price={CENY.izolacia_stien_200mm} />
            <OptionCard label={getTranslatedText('izolacia_stien_250', 'nazov') || t('walls250mm') || 'Steny 250mm'} description={getTranslatedText('izolacia_stien_250', 'podnadpis')} selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} price={CENY.izolacia_stien_250mm} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('izolacia_podlahy_150', 'nazov') || t('floor150mm') || 'Podlaha 150mm'} selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} price={0} />
            <OptionCard label={getTranslatedText('izolacia_podlahy_200', 'nazov') || t('floor200mm') || 'Podlaha 200mm'} selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} price={CENY.izolacia_podlahy_200mm} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu'} color="red" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('izolacia_stropu_150', 'nazov') || t('ceiling150mm') || 'Strop 150mm'} selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} price={0} />
            <OptionCard label={getTranslatedText('izolacia_stropu_200', 'nazov') || t('ceiling200mm') || 'Strop 200mm'} selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} price={CENY.izolacia_stropu_200mm} isA0={true} />
          </div>
        </section>

        {/* 2. Vykurovanie */}
        <section id="section-2" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie'} icon={Flame} stepIdx={2} totalSteps={13} />
          
          <SectionLabel label={getTranslatedText('tepelne_cerpadlo', 'nazov') || t('heating') || 'Tepelné čerpadlo'} color="orange" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('tepelne_cerpadlo_nie', 'nazov') || t('heatingPreparation')} selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} price={0} />
            <OptionCard label={getTranslatedText('tepelne_cerpadlo_ano', 'nazov') || t('heatPump')} selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} price={CENY.tepelne_cerpadlo} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('rekuperacia', 'nazov') || t('ventilation') || 'Rekuperácia'} color="orange" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('rekuperacia_nie', 'nazov') || t('withoutRecuperation')} selected={rekuperacia === "nie" && !pripravaNaRekuperaciu} onClick={() => {setRekuperacia("nie"); setPripravaNaRekuperaciu(false);}} price={0} />
            <OptionCard label={getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu'} selected={pripravaNaRekuperaciu} onClick={() => {setPripravaNaRekuperaciu(true); setRekuperacia("nie");}} price={CENY.pripravaNaRekuperaciu} isA0={true} />
            <OptionCard label={getTranslatedText('rekuperacia_ano', 'nazov') || t('recuperation')} selected={rekuperacia === "ano"} onClick={() => {setRekuperacia("ano"); setPripravaNaRekuperaciu(false);}} price={CENY.rekuperacia} isA0={true} />
          </div>

          <SectionLabel label={getTranslatedText('vykurovanie_doplnky', 'nazov') || t('heatingExtras') || 'Doplnky'} color="orange" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('podlahove_kurenie', 'nazov') || t('floorHeating')} checked={podlahovoKurenie} onChange={() => setPodlahovoKurenie(!podlahovoKurenie)} price={CENY.podlahove_kurenie} />
            <AddonRow label={getTranslatedText('pripravaKrb', 'nazov') || t('fireplacePrep')} checked={pripravaNaKrb} onChange={() => setPripravaNaKrb(!pripravaNaKrb)} price={CENY.pripravaKrb} />
            <AddonRow label={getTranslatedText('ochranaKachle', 'nazov') || t('stoveProtection')} checked={ochranaKachle} onChange={() => setOchranaKachle(!ochranaKachle)} price={CENY.ochranaKachle} />
            <AddonRow label={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} checked={klimatizacia} onChange={() => setKlimatizacia(!klimatizacia)} price={CENY.klimatizacia} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 3. Fasáda */}
        <section id="section-3" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda'} icon={Paintbrush} stepIdx={3} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('fasada_drevo_smrek', 'nazov') || t('spruceWood')} selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} price={0} />
            <OptionCard label={getTranslatedText('fasada_omietka', 'nazov') || t('scratchedPlaster')} selected={fasada === "omietka"} onClick={() => setFasada("omietka")} price={CENY.fasada_omietka} />
            <OptionCard label={getTranslatedText('fasada_smrekovec', 'nazov') || t('larch')} selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} price={CENY.fasada_smrekovec} />
            <OptionCard label={getTranslatedText('fasada_falcovane', 'nazov') || t('foldedPanels')} selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} price={CENY.fasada_falcovane} />
            <OptionCard label={getTranslatedText('fasada_thermowood', 'nazov') || 'Thermowood'} selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} price={CENY.fasada_thermowood} />
          </div>
        </section>

        {/* 4. Strecha */}
        <section id="section-4" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha'} icon={Home} stepIdx={4} totalSteps={13} />
          <SectionLabel label={getTranslatedText('stresna_krytina', 'nazov') || t('roofCoveringType') || 'Strešná krytina'} color="purple" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('strecha_korugovan', 'nazov') || t('corrugatedMetal')} selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} price={0} />
            <OptionCard label={getTranslatedText('strecha_falcovane', 'nazov') || t('foldedPanels')} selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} price={CENY.strecha_falcovane} />
          </div>
          <SectionLabel label={getTranslatedText('odkvapy', 'nazov') || t('gutters') || 'Odkvapy'} color="purple" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('odkvapy_nie', 'nazov') || t('withoutGutters')} selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} price={0} />
            <OptionCard label={getTranslatedText('odkvapy_ano', 'nazov') || t('gutters')} selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} price={CENY.odkvapy} />
          </div>
        </section>

        {/* 5. Okná a dvere */}
        <section id="section-5" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere'} icon={DoorOpen} stepIdx={5} totalSteps={13} />
          <SectionLabel label={getTranslatedText('okna_farba', 'nazov') || t('windowColor') || 'Farba okien 3-sklo'} color="blue" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <OptionCard label={getTranslatedText('okna_biele', 'nazov') || t('white')} selected={okna === "biele"} onClick={() => setOkna("biele")} price={0} />
            <OptionCard label={getTranslatedText('okna_antracit', 'nazov') || t('anthracite')} selected={okna === "antracit"} onClick={() => setOkna("antracit")} price={0} />
            <OptionCard label={getTranslatedText('okna_hnede', 'nazov') || t('brown')} selected={okna === "hnede"} onClick={() => setOkna("hnede")} price={0} />
          </div>
          <SectionLabel label={getTranslatedText('vchodove_dvere', 'nazov') || t('entryDoors') || 'Vchodové dvere'} color="blue" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('dvere_plastove', 'nazov') || t('metalPlasticDoors')} selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} price={0} />
            <OptionCard label={getTranslatedText('dvere_kovove', 'nazov') || t('metalDoors')} selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} price={CENY.dvere_kovove} />
          </div>
        </section>

        {/* 6. Interiér */}
        <section id="section-6" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér'} icon={Layout} stepIdx={6} totalSteps={13} />
          <SectionLabel label={getTranslatedText('obklad_stien', 'nazov') || t('wallCladding') || 'Obklad stien'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('obklad_smrek_8cm', 'nazov') || t('spruceWall8cm')} selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} price={0} />
            <OptionCard label={getTranslatedText('obklad_smrek_bez_uzlov', 'nazov') || t('spruceWallNoKnots')} selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} price={CENY.obklad_smrek_bez_uzlov} />
            <OptionCard label={getTranslatedText('obklad_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} price={CENY.obklad_sadrokarton_tapeta} />
            <OptionCard label={getTranslatedText('obklad_osb', 'nazov') || t('osbLaminatePanel')} selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} price={CENY.obklad_osb_panel} />
          </div>
          <SectionLabel label={getTranslatedText('podlaha', 'nazov') || t('floorType') || 'Podlaha'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('podlaha_laminat', 'nazov') || t('laminate')} selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} price={0} />
          </div>
          <SectionLabel label={getTranslatedText('interierove_dvere', 'nazov') || t('interiorDoorsType') || 'Interiérové dvere'} color="amber" />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('dvere_kridlove', 'nazov') || t('hingedDoors')} selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} price={0} />
            <OptionCard label={getTranslatedText('dvere_posuvne', 'nazov') || t('slidingDoors')} selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} price={CENY.dvere_posuvne} />
          </div>
        </section>

        {/* 7. Elektro */}
        <section id="section-7" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektroinštalácia'} icon={Zap} stepIdx={7} totalSteps={13} />
          <SectionLabel label={getTranslatedText('elektro_typ', 'nazov') || t('installationType') || 'Typ inštalácie'} color="yellow" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <OptionCard label={getTranslatedText('elektro_eu', 'nazov') || t('euStandard')} selected={elektro === "eu"} onClick={() => setElektro("eu")} price={0} />
            <OptionCard label={getTranslatedText('elektro_cz', 'nazov') || t('czSkStandard')} selected={elektro === "cz"} onClick={() => setElektro("cz")} price={CENY.elektro_cz} />
            <OptionCard label={getTranslatedText('elektro_ge', 'nazov') || t('geStandard')} selected={elektro === "ge"} onClick={() => setElektro("ge")} price={CENY.elektro_ge} isA0={true} />
          </div>
          <SectionLabel label="Doplnky" color="yellow" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('bleskozvod', 'nazov') || t('lightningRod')} checked={bleskozvod} onChange={() => setBleskozvod(!bleskozvod)} price={CENY.bleskozvod} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('prepat', 'nazov') || t('surgeProtection')} checked={prepat} onChange={() => setPrepat(!prepat)} price={CENY.prepat} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('pripravaNaSolarnePanely', 'nazov') || 'Príprava na solárne panely'} checked={pripravaNaSolarnePanely} onChange={() => setPripravaNaSolarnePanely(!pripravaNaSolarnePanely)} price={CENY.pripravaNaSolarnePanely} />
          </div>
        </section>

        {/* 8. Kúpeľňa */}
        <section id="section-8" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa'} icon={Droplet} stepIdx={8} totalSteps={13} />
          <SectionLabel label={getTranslatedText('sprchovyKut', 'nazov') || t('showerCabin') || 'Sprchový kút'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('sprcha_standard', 'nazov') || t('shower')} selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} price={0} />
            <OptionCard label={getTranslatedText('sprcha_radaway', 'nazov') || t('showerRadawayTile')} selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} price={CENY.sprchovyKut} />
          </div>
          <SectionLabel label={getTranslatedText('bateria', 'nazov') || t('faucet') || 'Batéria'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('bateria_standard', 'nazov') || t('faucetStandard')} selected={bateria === "standard"} onClick={() => setBateria("standard")} price={0} />
            <OptionCard label={getTranslatedText('bateria_grohe', 'nazov') || 'Grohe'} selected={bateria === "grohe"} onClick={() => setBateria("grohe")} price={CENY.bateria} />
          </div>
          <SectionLabel label={getTranslatedText('strop_kupelna', 'nazov') || t('bathroomCeiling') || 'Strop'} color="teal" />
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <OptionCard label={getTranslatedText('strop_drevo', 'nazov') || t('ceilingWoodPattern')} selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} price={0} />
            <OptionCard label={getTranslatedText('strop_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} price={CENY.strop_kupelna_sadrokarton} />
          </div>
          <SectionLabel label="Doplnky" color="teal" />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('vana', 'nazov') || t('bathtub')} checked={vana} onChange={() => setVana(!vana)} price={CENY.vana} />
            <AddonRow label={getTranslatedText('skrinka', 'nazov') || t('cabinet')} checked={skrinka} onChange={() => setSkrinka(!skrinka)} price={CENY.skrinka} />
          </div>
        </section>

        {/* 9. Základy */}
        <section id="section-9" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy'} icon={Wrench} stepIdx={9} totalSteps={13} />
          <div className="grid sm:grid-cols-2 gap-4">
            <OptionCard label={getTranslatedText('zaklady_bez', 'nazov') || t('noFoundations')} selected={zaklady === "bez"} onClick={() => setZaklady("bez")} price={0} />
            <OptionCard label={getTranslatedText('zaklady_vruty', 'nazov') || t('groundScrews')} selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} price={CENY.zaklady_vruty} />
            <OptionCard label={getTranslatedText('zaklady_patky', 'nazov') || t('concretePads')} selected={zaklady === "patky"} onClick={() => setZaklady("patky")} price={CENY.zaklady_patky} />
            <OptionCard label={getTranslatedText('zaklady_pasove', 'nazov') || t('stripFoundations')} selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} price={CENY.zaklady_pasove} />
          </div>
        </section>

        {/* 10. Inžiniering */}
        <section id="section-10" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering a dokumentácia'} icon={Layers} stepIdx={10} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('inziniering', 'nazov') || t('engineering')} checked={inziniering} onChange={() => setInziniering(!inziniering)} price={CENY.inziniering} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} checked={projektACertifikacia} onChange={() => setProjektACertifikacia(!projektACertifikacia)} price={CENY.projektACertifikacia} locked={ucel === "rodinny"} t={t} />
            <AddonRow label={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} checked={revizia} onChange={() => setRevizia(!revizia)} price={CENY.revizia} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 11. Realizácia */}
        <section id="section-11" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia'} icon={Hammer} stepIdx={11} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('montaz', 'nazov') || t('houseAssembly')} checked={montaz} onChange={() => setMontaz(!montaz)} price={CENY.montaz} />
            <AddonRow label={getTranslatedText('doprava', 'nazov') || t('transportTile')} checked={doprava} onChange={() => setDoprava(!doprava)} price={CENY.doprava} />
          </div>
        </section>

        {/* 12. Služby k nákupu */}
        <section id="section-12" className="scroll-mt-32">
          <BigSectionHeader title={getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Dodatočné služby'} description={getTranslatedText('sekcia_sluzby', 'podnadpis') || 'Vyberte si doplnkové služby (voliteľné):'} icon={Sparkles} stepIdx={12} totalSteps={13} />
          <div className="space-y-4">
            <AddonRow label={getTranslatedText('sluzba_predaj', 'nazov') || 'Predaj predošlej nehnuteľnosti'} description={getTranslatedText('sluzba_predaj', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší odborníci v realitách.'} checked={predajNehnutelnosti} onChange={() => setPredajNehnutelnosti(!predajNehnutelnosti)} price={0} />
            <AddonRow label={getTranslatedText('sluzba_pozemok', 'nazov') || 'Chcem pozemok pod svoj dom'} description={getTranslatedText('sluzba_pozemok', 'dlhy_popis') || 'Pomôžeme Vám nájsť ideálny pozemok.'} checked={chcemPozemok} onChange={() => setChcemPozemok(!chcemPozemok)} price={0} />
            <AddonRow label={getTranslatedText('sluzba_finance', 'nazov') || 'Finančné služby - úvery/poistky'} description={getTranslatedText('sluzba_finance', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší finančníci.'} checked={financneSluzby} onChange={() => setFinancneSluzby(!financneSluzby)} price={0} />
          </div>
        </section>

      </div>
      
    </div>
  );
}
