import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPrice from "./FloatingPrice";
import { 
  Home, Check, Send, X, Thermometer, Zap, Layout, Hammer, 
  CheckCircle, Eye, EyeOff, Lock, ChevronDown, ChevronUp, 
  Paintbrush, DoorOpen, Wrench, Layers, Droplet, Flame, CheckSquare, Sparkles,
  ChevronLeft, ChevronRight, Wind
} from "lucide-react";

// ── Glassmorphism Tabuľkový Riadkový Selektor (ConfiguratorRow) ──────────────────────────────────────────────
const ConfiguratorRow = ({ 
  label, 
  description, 
  options, 
  selectedValue, 
  onChange, 
  isAdmin, 
  onPriceChange, 
  onShowGallery, 
  icon: Icon 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 gap-6 backdrop-blur-md">
      
      {/* ĽAVÁ STRANA: Nadpis, Popis a ukážka */}
      <div className="flex items-start gap-4 flex-1 min-w-0 xl:min-w-[280px]">
        {Icon && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg mb-1 leading-snug">
            {label}
          </h4>
          {description && (
            <p className="text-slate-550 dark:text-slate-405 text-xs sm:text-sm leading-relaxed max-w-xl">
              {description}
            </p>
          )}
          {onShowGallery && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowGallery();
              }}
              className="mt-2 text-[11px] sm:text-xs font-bold text-[#C5A880] hover:text-[#bfa177] flex items-center gap-1.5 bg-[#C5A880]/10 hover:bg-[#C5A880]/15 px-2.5 py-1.5 rounded-lg border border-[#C5A880]/20 transition-all w-fit"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pozrieť ukážku</span>
            </button>
          )}
        </div>
      </div>

      {/* PRAVÁ STRANA: Horizontálny prepínač (Segmented pill selector) */}
      <div className="flex-shrink-0 w-full xl:w-auto">
        <div className="flex flex-col sm:flex-row gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 w-full sm:w-fit overflow-x-auto sm:overflow-visible no-scrollbar">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            const isStandard = opt.price === 0;
            
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`relative flex flex-col sm:flex-row items-center justify-center px-4 py-3 sm:py-2.5 rounded-xl text-center text-xs font-bold transition-all duration-300 whitespace-nowrap gap-1.5 sm:gap-2 flex-1 sm:flex-initial cursor-pointer border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-[#C5A880] dark:text-[#C5A880] border-slate-200 dark:border-slate-700 shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                {/* A0 badge in option */}
                {opt.isA0 && (
                  <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isSelected 
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 animate-pulse' 
                      : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                  }`}>
                    ★ A0
                  </span>
                )}
                
                <span className="text-xs tracking-wide">{opt.label}</span>
                
                {/* Admin Mode Price Edit */}
                {isAdmin && onPriceChange && opt.priceKey ? (
                  <div 
                    className="flex items-center gap-0.5 bg-slate-950/80 border border-red-500/30 rounded px-1 py-0.5 font-mono text-[10px]"
                    onClick={e => e.stopPropagation()}
                  >
                    <span>€</span>
                    <input 
                      type="number" 
                      value={opt.price} 
                      onChange={e => onPriceChange(opt.priceKey, Number(e.target.value))} 
                      className="w-12 text-[10px] font-bold text-red-400 bg-transparent outline-none text-center" 
                    />
                  </div>
                ) : (
                  <span className={`text-[10px] font-black tracking-wider ${
                    isSelected 
                      ? 'text-[#C5A880]' 
                      : isStandard 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isStandard ? (t('includedInPriceShort') || 'V cene') : `+${opt.price.toLocaleString()} €`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Kompatibilný starý OptionCard (pre špeciálne prípady, ak ostali v staršom kóde)
const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon }) => {
  const { t } = useLanguage();
  const isStandard = price === 0;
  return (
  <button 
    onClick={onClick} 
    className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all duration-500 w-full text-left active:scale-[0.98] gap-2 overflow-hidden group backdrop-blur-md ${
      selected 
        ? 'border-[#C5A880] bg-[#C5A880]/5 dark:bg-[#C5A880]/10 shadow-[0_0_25px_rgba(197,168,128,0.15)] scale-[1.02]' 
        : isStandard 
          ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10' 
          : isA0 
            ? 'border-blue-500/20 dark:border-blue-500/40 bg-blue-500/5 hover:border-blue-400 hover:bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
            : 'border-slate-200/80 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/[0.04]'
    }`}
  >
    {selected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C5A880] to-amber-500 opacity-80" />}
    {isA0 && !selected && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-60 animate-pulse" />}
    
    <div className="flex items-start justify-between gap-4 w-full relative z-10">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            selected 
              ? 'bg-gradient-to-br from-[#C5A880] to-[#bfa177] text-white shadow-xl shadow-[#C5A880]/30 rotate-3' 
              : isA0 
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 shadow-lg shadow-blue-500/10' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-110'
          }`}>
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 ${selected || isA0 ? 'scale-110' : 'scale-100'}`} />
          </div>
        )}
        <div className="flex-1 mt-1">
          <div className="flex flex-col mb-1.5">
            {isA0 && (
              <span className="mb-2 inline-flex items-center self-start bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ★ {t('a0Required') || 'Povinné pre rodinný dom A0'}
              </span>
            )}
            <span className={`font-black text-base sm:text-lg transition-colors duration-300 ${
              selected 
                ? 'text-[#C5A880] dark:text-[#C5A880]' 
                : isA0 
                  ? 'text-blue-900 dark:text-blue-100' 
                  : 'text-slate-800 dark:text-slate-200'
            }`}>{label}</span>
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>}
        </div>
      </div>
      
      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 mt-1 ${
        selected 
          ? 'border-[#C5A880] bg-[#C5A880] scale-110 shadow-lg shadow-[#C5A880]/40' 
          : isA0 
            ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </div>
    
    <div className={`w-full flex justify-end relative z-10 pt-2 mt-2 border-t ${
      isA0 && !selected ? 'border-blue-500/20' : 'border-slate-200 dark:border-white/5'
    }`}>
      {isAdmin && onPriceChange ? (
        <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-md" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-500">€</span>
          <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
        </div>
      ) : (
        <div className="text-right flex flex-col items-end justify-center">
          <span className={`block font-black transition-colors duration-300 ${
            selected 
              ? 'text-base text-[#C5A880] dark:text-[#C5A880]' 
              : isStandard 
                ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                : isA0 
                  ? 'text-base text-blue-600 dark:text-blue-300' 
                  : 'text-base text-slate-650 dark:text-slate-400'
          }`}>
            {isStandard ? `✓ ${t('includedInPriceShort') || 'V základnej cene'}` : `+${price.toLocaleString()} €`}
          </span>
        </div>
      )}
    </div>
  </button>
  );
};

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t: propT, icon: Icon }) => {
  const { t: contextT } = useLanguage();
  const t = propT || contextT;
  return (
  <button 
    onClick={!disabled && !locked ? onChange : undefined} 
    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 w-full active:scale-[0.98] group overflow-hidden relative gap-4 ${
      locked 
        ? 'border-blue-500/20 bg-blue-500/5 cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.05)] backdrop-blur-md' 
        : checked 
          ? 'border-[#C5A880] bg-[#C5A880]/5 dark:bg-gradient-to-r dark:from-[#C5A880]/10 dark:to-transparent shadow-[0_0_20px_rgba(197,168,128,0.12)] scale-[1.01] backdrop-blur-md' 
          : disabled 
            ? 'border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'border-slate-200/80 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-white/[0.04] backdrop-blur-sm'
    }`}
  >
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A880]" />}
    {locked && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-60 animate-pulse" />}
    
    <div className="flex items-start sm:items-center gap-4 w-full relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
        locked 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10' 
          : checked 
            ? 'bg-gradient-to-br from-[#C5A880] to-[#bfa177] text-white shadow-lg shadow-[#C5A880]/20' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300'
      }`}>
        {Icon ? <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${checked || locked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />)}
      </div>
      <div className="text-left flex-1 pr-4">
        <div className="flex flex-col mb-1.5">
          {locked && (
            <span className="mb-2 inline-flex items-center self-start bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ★ {t('a0Required') || 'Povinné pre rodinný dom A0'}
            </span>
          )}
          <span className={`font-bold text-base sm:text-lg block transition-colors duration-300 ${
            locked 
              ? 'text-blue-900 dark:text-blue-100' 
              : checked 
                ? 'text-[#C5A880] dark:text-[#C5A880]' 
                : 'text-slate-800 dark:text-slate-200'
          }`}>{label}</span>
        </div>
        {description && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>}
      </div>
      
      {/* Checkbox na mobile zobrazený hore vedľa nadpisu, na desktope skrytý */}
      <div className={`sm:hidden w-6 h-6 mt-1 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
          : checked 
            ? 'border-[#C5A880] bg-[#C5A880] scale-110' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
    
    {/* Cena presunutá na samostatný riadok na mobile, na desktope vpravo */}
    <div className={`flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t ${
      locked ? 'border-blue-500/20' : 'border-slate-200 dark:border-white/5'
    } sm:border-0 relative z-10 gap-4`}>
      <div className="flex-shrink-0 text-right">
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-500/30 rounded px-2 py-1 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <div className="text-right flex flex-col items-end justify-center">
            <span className={`block font-black transition-colors duration-300 ${
              locked 
                ? 'text-base text-blue-600 dark:text-blue-300' 
                : price === 0 
                  ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                  : 'text-base text-slate-650 dark:text-slate-400'
            }`}>
              {price === 0 ? `✓ ${t('includedInPriceShort') || 'V základnej cene'}` : `+${price.toLocaleString()} €`}
            </span>
          </div>
        )}
      </div>
      
      {/* Checkbox na desktope zobrazený vpravo od ceny */}
      <div className={`hidden sm:flex w-6 h-6 rounded border-2 items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-blue-400/50 bg-blue-50 dark:bg-blue-900/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
          : checked 
            ? 'border-[#C5A880] bg-[#C5A880] scale-110' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  </button>
  );
};

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-sm transition-all duration-500 hover:border-slate-350 dark:hover:border-white/20 group relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A880]" />}
    <div className="flex items-center gap-4 relative z-10">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
          value > 0 ? 'bg-slate-800 dark:bg-white/10 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300'
        }`}>
          <Icon className={`w-6 h-6 transition-transform duration-500 ${value > 0 ? 'scale-110' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-bold text-lg transition-colors duration-300 ${
          value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
        }`}>{label}</div>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-sm font-bold text-red-400 bg-slate-950 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{price} € / ks</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))} 
        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-300 active:scale-90 transition-all border border-slate-200 dark:border-white/10 backdrop-blur-sm"
      >
        −
      </button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${
        value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
      }`}>{value}</span>
      <button 
        onClick={() => onChange(value + 1)} 
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9E2A2B] to-[#802021] text-white hover:opacity-90 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(158,42,43,0.3)]"
      >
        +
      </button>
    </div>
  </div>
);

const SectionLabel = ({ label, color = 'gray' }) => {
  const colorMap = {
    'gray': 'text-slate-600 dark:text-slate-400',
    'orange': 'text-orange-700 dark:text-orange-400',
    'teal': 'text-teal-700 dark:text-teal-400',
    'amber': 'text-amber-700 dark:text-amber-400',
    'blue': 'text-blue-700 dark:text-blue-400',
    'purple': 'text-purple-700 dark:text-purple-400',
    'red': 'text-[#9E2A2B] dark:text-[#C5A880]',
    'emerald': 'text-emerald-700 dark:text-emerald-400',
    'green': 'text-green-700 dark:text-green-400',
    'yellow': 'text-yellow-750 dark:text-yellow-400'
  };
  return (
    <div className={`text-sm font-black uppercase tracking-widest ${colorMap[color] || 'text-slate-600 dark:text-slate-400'} mb-4 mt-10 first:mt-0 flex items-center gap-2`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
      {label}
    </div>
  );
};

const BigSectionHeader = ({ title, description, icon: Icon, stepIdx, totalSteps }) => (
  <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
    <div className="lg:hidden text-[#9E2A2B] dark:text-[#C5A880] font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-current"></span>
      Krok {stepIdx + 1} z {totalSteps}
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(197,168,128,0.15)]">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-[#9E2A2B] dark:text-[#C5A880]" />
      </div>
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{title}</h2>
        {description && <p className="text-slate-600 dark:text-slate-350 text-sm lg:text-base leading-relaxed">{description}</p>}
      </div>
    </div>
  </div>
);
const ContactModal = ({ isOpen, onClose, onSubmit, isSubmitting, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 text-foreground">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t('inquiryForm')}</h2>
        <p className="text-muted-foreground mb-8">{t('inquiryFormDesc')}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('nameSurname')}</label><input required type="text" placeholder="Jozef Novák" name="name" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('email')}</label><input required type="email" placeholder="jozef@example.com" name="email" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('phone')}</label><input required type="tel" placeholder="+421 900 000 000" name="phone" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('city')}</label><input required type="text" placeholder="Bratislava" name="city" className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('note')}</label><textarea name="note" rows={3} placeholder="Mám záujem o..." className="w-full px-4 py-3 bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-muted-foreground"></textarea></div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            {isSubmitting ? <span>{t('sending')}</span> : <><span>{t('sendQuote')}</span><Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default function KonfiguratorTicabhouse({ dom, isAdmin, onConfigChange, predajNehnutelnosti, setPredajNehnutelnosti, hladamPozemok, setHladamPozemok, financneSluzby, setFinancneSluzby, ucel, setUcel, izolaciaStien, setIzolaciaStien, izolaciaPodlahy, setIzolaciaPodlahy, izolaciaStropu, setIzolaciaStropu, tepelneCerpadlo, setTepelneCerpadlo, rekuperacia, setRekuperacia, pripravaNaRekuperaciu, setPripravaNaRekuperaciu, podlahovoKurenie, setPodlahovoKurenie, pripravaNaKrb, setPripravaNaKrb, ochranaKachle, setOchranaKachle, klimatizacia, setKlimatizacia, fasada, setFasada, strecha, setStrecha, odkvapy, setOdkvapy, okna, setOkna, vchodoveDvere, setVchodoveDvere, obkladStien, setObkladStien, podlaha, setPodlaha, interieroveDvere, setInterieroveDvere, elektro, setElektro, bleskozvod, setBleskozvod, prepat, setPrepat, pripravaNaSolarnePanely, setPripravaNaSolarnePanely, sprchovyKut, setSprchovyKut, vana, setVana, bateria, setBateria, skrinka, setSkrinka, stropKupelna, setStropKupelna, inziniering, setInziniering, projektACertifikacia, setProjektACertifikacia, revizia, setRevizia, zaklady, setZaklady, montaz, setMontaz, doprava, setDoprava }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  // Lokálny state pre okamžitú vizuálnu spätnú väzbu
  const [localDopravaViditelna, setLocalDopravaViditelna] = React.useState(dom?.doprava_viditelna !== false);

  // Synchronizovať lokálny state s DOM objektom
  React.useEffect(() => {
    setLocalDopravaViditelna(dom?.doprava_viditelna !== false);
  }, [dom?.doprava_viditelna]);

  const dopravaViditelna = localDopravaViditelna;

  // Mutácia pre zmenu viditeľnosti dopravy
  const toggleDopravaVisibilityMutation = useMutation({
    mutationFn: (visible) => base44.entities.Dom.update(dom.id, { doprava_viditelna: visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom', dom.id] });
      toast.success(!dopravaViditelna ? 'Doprava skrytá pre verejnosť' : 'Doprava zobrazená pre verejnosť');
    }
  });

  const handleToggleDopravaVisibility = () => {
    const newValue = !dopravaViditelna;
    setLocalDopravaViditelna(newValue);
    toggleDopravaVisibilityMutation.mutate(newValue);
  };

  // Načítať texty konfiguratora
  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  // Pomocná funkcia na získanie preloženého textu
  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return null;
    
    if (language === 'sk') return text[field] || null;
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || null;
  };

  // Načítať ceny z entity Dom alebo použiť default ceny Lyon
  const DEFAULT_CENY = {
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

  const CENY = {
    ...DEFAULT_CENY,
    ...(dom?.konfigurator_ceny || {})
  };
  const [kolaudacia, setKolaudacia] = useState("bez_a0");
  const [activeLightbox, setActiveLightbox] = useState(null);

  const handleShowOptionGallery = (type) => {
    if (!dom?.galerie?.length) {
      alert("Galéria nie je pre tento dom k dispozícii.");
      return;
    }
    const matchingGallery = dom.galerie.find(g => g.typ === type);
    if (matchingGallery?.fotky?.length) {
      setActiveLightbox({ images: matchingGallery.fotky, index: 0 });
    } else {
      const allPhotos = dom.galerie.flatMap(g => g.fotky || []);
      if (allPhotos.length) {
        setActiveLightbox({ images: allPhotos, index: 0 });
      } else {
        alert("Tento typ úpravy nemá priradené samostatné fotografie.");
      }
    }
  };

  // Mutácia pre aktualizáciu cien
  const updatePricesMutation = useMutation({
    mutationFn: ({ domId, newPrices }) => 
      base44.entities.Dom.update(domId, { konfigurator_ceny: newPrices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom-detail'] });
      toast.success('Cena aktualizovaná - obnovujem stránku...');
      setTimeout(() => window.location.reload(), 500);
    }
  });

  const handlePriceChange = (priceKey, newPrice) => {
    if (!dom?.id) return;
    const updatedPrices = { ...CENY, [priceKey]: newPrice };
    updatePricesMutation.mutate({ domId: dom.id, newPrices: updatedPrices });
  };

  // Výpočet celkovej ceny
  const totalPrice = React.useMemo(() => {
    let price = dom?.zakladna_cena || 0;

    // Izolácia
    if (izolaciaStien === "200mm") price += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") price += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") price += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") price += CENY.izolacia_stropu_200mm || 0;

    // Vykurovanie
    if (tepelneCerpadlo === "ano") price += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) price += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") price += CENY.rekuperacia || 0;
    if (podlahovoKurenie) price += CENY.podlahove_kurenie || 0;
    if (klimatizacia) price += CENY.klimatizacia || 0;
    if (pripravaNaKrb) price += CENY.pripravaKrb || 0;
    if (ochranaKachle) price += CENY.ochranaKachle || 0;

    // Fasáda
    if (fasada === "omietka") price += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") price += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") price += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") price += CENY.fasada_thermowood || 0;

    // Strecha
    if (strecha === "falcovane") price += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") price += CENY.odkvapy || 0;

    // Dvere
    if (vchodoveDvere === "kovove") price += CENY.dvere_kovove || 0;

    // Interiér
    if (obkladStien === "smrek_bez_uzlov") price += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") price += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") price += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") price += CENY.dvere_posuvne || 0;

    // Elektro
    if (elektro === "cz") price += CENY.elektro_cz || 0;
    if (elektro === "ge") price += CENY.elektro_ge || 0;
    if (bleskozvod) price += CENY.bleskozvod || 0;
    if (prepat) price += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) price += CENY.pripravaNaSolarnePanely || 0;

    // Kúpeľňa
    if (sprchovyKut === "radaway") price += CENY.sprchovyKut || 0;
    if (vana) price += CENY.vana || 0;
    if (bateria === "grohe") price += CENY.bateria || 0;
    if (skrinka) price += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") price += CENY.strop_kupelna_sadrokarton || 0;

    // Služby
    if (inziniering) price += CENY.inziniering || 0;
    if (projektACertifikacia) price += CENY.projektACertifikacia || 0;
    if (revizia) price += CENY.revizia || 0;

    // Základy
    if (zaklady === "vruty") price += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") price += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") price += CENY.zaklady_pasove || 0;

    // Realizácia
    if (montaz) price += CENY.montaz || 0;
    if (doprava && dopravaViditelna) price += CENY.doprava || 0;

    return price;
  }, [
    dom?.zakladna_cena, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
    tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
    fasada, strecha, odkvapy, vchodoveDvere, obkladStien, interieroveDvere,
    elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
    inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava, CENY, dopravaViditelna
  ]);

  // Poslať konfiguráciu do rodičovského komponentu (pre hypotéku)
  React.useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        celkovaCena: totalPrice,
        izolaciaStien,
        izolaciaPodlahy,
        izolaciaStropu,
        tepelneCerpadlo,
        rekuperacia,
        projektACertifikacia,
        zaklady
      });
    }
  }, [totalPrice, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, projektACertifikacia, zaklady, onConfigChange]);

  // Synchronizácia s props
  React.useEffect(() => { if (setUcel) setUcel(ucel); }, [ucel]);
  React.useEffect(() => { if (setIzolaciaStien) setIzolaciaStien(izolaciaStien); }, [izolaciaStien]);
  React.useEffect(() => { if (setIzolaciaPodlahy) setIzolaciaPodlahy(izolaciaPodlahy); }, [izolaciaPodlahy]);
  React.useEffect(() => { if (setIzolaciaStropu) setIzolaciaStropu(izolaciaStropu); }, [izolaciaStropu]);
  React.useEffect(() => { if (setTepelneCerpadlo) setTepelneCerpadlo(tepelneCerpadlo); }, [tepelneCerpadlo]);
  React.useEffect(() => { if (setRekuperacia) setRekuperacia(rekuperacia); }, [rekuperacia]);
  React.useEffect(() => { if (setPodlahovoKurenie) setPodlahovoKurenie(podlahovoKurenie); }, [podlahovoKurenie]);
  React.useEffect(() => { if (setPripravaNaKrb) setPripravaNaKrb(pripravaNaKrb); }, [pripravaNaKrb]);
  React.useEffect(() => { if (setOchranaKachle) setOchranaKachle(ochranaKachle); }, [ochranaKachle]);
  React.useEffect(() => { if (setFasada) setFasada(fasada); }, [fasada]);
  React.useEffect(() => { if (setStrecha) setStrecha(strecha); }, [strecha]);
  React.useEffect(() => { if (setOdkvapy) setOdkvapy(odkvapy); }, [odkvapy]);
  React.useEffect(() => { if (setOkna) setOkna(okna); }, [okna]);
  React.useEffect(() => { if (setVchodoveDvere) setVchodoveDvere(vchodoveDvere); }, [vchodoveDvere]);
  React.useEffect(() => { if (setObkladStien) setObkladStien(obkladStien); }, [obkladStien]);
  React.useEffect(() => { if (setPodlaha) setPodlaha(podlaha); }, [podlaha]);
  React.useEffect(() => { if (setInterieroveDvere) setInterieroveDvere(interieroveDvere); }, [interieroveDvere]);
  React.useEffect(() => { if (setElektro) setElektro(elektro); }, [elektro]);
  React.useEffect(() => { if (setBleskozvod) setBleskozvod(bleskozvod); }, [bleskozvod]);
  React.useEffect(() => { if (setPrepat) setPrepat(prepat); }, [prepat]);
  React.useEffect(() => { if (setPripravaNaSolarnePanely) setPripravaNaSolarnePanely(pripravaNaSolarnePanely); }, [pripravaNaSolarnePanely]);
  React.useEffect(() => { if (setPripravaNaRekuperaciu) setPripravaNaRekuperaciu(pripravaNaRekuperaciu); }, [pripravaNaRekuperaciu]);
  React.useEffect(() => { if (setKlimatizacia) setKlimatizacia(klimatizacia); }, [klimatizacia]);
  React.useEffect(() => { if (setSprchovyKut) setSprchovyKut(sprchovyKut); }, [sprchovyKut]);
  React.useEffect(() => { if (setVana) setVana(vana); }, [vana]);
  React.useEffect(() => { if (setBateria) setBateria(bateria); }, [bateria]);
  React.useEffect(() => { if (setSkrinka) setSkrinka(skrinka); }, [skrinka]);
  React.useEffect(() => { if (setStropKupelna) setStropKupelna(stropKupelna); }, [stropKupelna]);
  React.useEffect(() => { if (setInziniering) setInziniering(inziniering); }, [inziniering]);
  React.useEffect(() => { if (setProjektACertifikacia) setProjektACertifikacia(projektACertifikacia); }, [projektACertifikacia]);
  React.useEffect(() => { if (setRevizia) setRevizia(revizia); }, [revizia]);
  React.useEffect(() => { if (setZaklady) setZaklady(zaklady); }, [zaklady]);
  React.useEffect(() => { if (setMontaz) setMontaz(montaz); }, [montaz]);
  React.useEffect(() => { if (setDoprava) setDoprava(doprava); }, [doprava]);

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '0 €';
    return num > 0 ? `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €` : '0 €';
  };

  const handleSubmit = () => {
    console.log('Submit konfigurácie');
  };

  const handleSendQuoteFromFloating = async (contactData) => {
    try {
      const response = await base44.functions.invoke('odosliCenovuPonukuLyonEmail', {
        dom,
        klientData: contactData,
        language,
        konfiguraciaData: {
          ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo,
          rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb,
          ochranaKachle, klimatizacia, fasada, strecha, odkvapy, okna, vchodoveDvere,
          obkladStien, podlaha, interieroveDvere, elektro, bleskozvod, prepat,
          pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
          inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
          predajNehnutelnosti, hladamPozemok, financneSluzby,
          totalPrice
        }
      });
      return response;
    } catch (error) {
      console.error('Error in handleSendQuoteFromFloating:', error);
      throw error;
    }
  };


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

  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const renderGroupedSummary = () => {
    const categories = [
      {
        title: t('summaryCategoryConstruction') || "1. Konštrukcia & Izolácia",
        items: [
          { label: t('summaryPurposeOfBuilding') || "Účel stavby", value: ucel === "chata" ? (t('summaryRecreationalCottage') || "Rekreačná chata") : (t('summaryFamilyHouse') || "Rodinný dom (A0)"), isStandard: false },
          { 
            label: t('summaryWallInsulation') || "Izolácia stien", 
            value: izolaciaStien === "150mm" ? `150 mm (${t('summaryBase') || "Základ"})` : `${izolaciaStien}`, 
            price: izolaciaStien === "150mm" ? 0 : (CENY[`izolacia_stien_${izolaciaStien}`] || 0),
            isStandard: izolaciaStien === "150mm"
          },
          { 
            label: t('summaryFloorInsulation') || "Izolácia podlahy", 
            value: izolaciaPodlahy === "150mm" ? `150 mm (${t('summaryBase') || "Základ"})` : `${izolaciaPodlahy}`, 
            price: izolaciaPodlahy === "150mm" ? 0 : (CENY[`izolacia_podlahy_${izolaciaPodlahy}`] || 0),
            isStandard: izolaciaPodlahy === "150mm"
          },
          { 
            label: t('summaryCeilingInsulation') || "Izolácia stropu", 
            value: izolaciaStropu === "150mm" ? `150 mm (${t('summaryBase') || "Základ"})` : `${izolaciaStropu}`, 
            price: izolaciaStropu === "150mm" ? 0 : (CENY[`izolacia_stropu_${izolaciaStropu}`] || 0),
            isStandard: izolaciaStropu === "150mm"
          },
          { 
            label: t('summaryFoundations') || "Základy", 
            value: zaklady === "bez" ? (t('summaryNoFoundations') || "Bez základov") :
                   zaklady === "vruty" ? (t('summaryGroundScrews') || "Zemné skrutky") :
                   zaklady === "patky" ? (t('summaryConcreteFootings') || "Betónové pätky") : (t('summaryStripFoundations') || "Pásové základy"), 
            price: zaklady === "bez" ? 0 : (CENY[`zaklady_${zaklady}`] || 0),
            isStandard: zaklady === "bez"
          },
        ]
      },
      {
        title: t('summaryCategoryExterior') || "2. Exteriér & Fasáda",
        items: [
          { 
            label: t('summaryFacade') || "Fasáda", 
            value: fasada === "drevo_smrek" ? (t('summarySpruce') || "Severský smrek") : 
                   fasada === "omietka" ? (t('summaryPlaster') || "Šúchaná omietka") :
                   fasada === "smrekovec" ? (t('summaryLarch') || "Sibírsky smrekovec") :
                   fasada === "falcovane" ? (t('summaryFoldedPanels') || "Falcovaný plech") : (t('summaryThermowood') || "Thermowood"), 
            price: fasada === "drevo_smrek" ? 0 : (CENY[`fasada_${fasada}`] || 0),
            isStandard: fasada === "drevo_smrek"
          },
          { 
            label: t('summaryRoof') || "Strešná krytina", 
            value: strecha === "korugovan_plech" ? (t('summaryCorrugatedSheet') || "Korugovaný plech") : (t('summaryFoldedPanels') || "Falcovaný plech"), 
            price: strecha === "korugovan_plech" ? 0 : (CENY.strecha_falcovane || 0),
            isStandard: strecha === "korugovan_plech"
          },
          { 
            label: t('summaryGutters') || "Odkvapy", 
            value: odkvapy === "ano" ? (t('summaryYes') || "Áno") : (t('summaryNo') || "Nie"), 
            price: odkvapy === "ano" ? (CENY.odkvapy || 0) : 0,
            isStandard: odkvapy !== "ano",
            hideIfStandard: true,
            active: odkvapy === "ano"
          },
          { 
            label: t('summaryWindowColor') || "Farba okien", 
            value: okna === "biele" ? (t('summaryWhite') || "Biele") : okna === "antracit" ? (t('summaryAntracit') || "Antracit") : (t('summaryBrown') || "Hnedé"), 
            price: 0,
            isStandard: true
          },
          { 
            label: t('summaryEntranceDoor') || "Vchodové dvere", 
            value: vchodoveDvere === "plastove" ? (t('summaryPlasticMetal') || "Plastovo-kovové") : (t('summaryMetal') || "Kovové"), 
            price: vchodoveDvere === "plastove" ? 0 : (CENY.dvere_kovove || 0),
            isStandard: vchodoveDvere === "plastove"
          },
        ]
      },
      {
        title: t('summaryCategoryInterior') || "3. Interiér & Kúpeľňa",
        items: [
          { 
            label: t('summaryWallCladding') || "Obklad stien", 
            value: obkladStien === "smrek_8cm" ? (t('summarySpruce8cm') || "Smrek 8cm") :
                   obkladStien === "smrek_bez_uzlov" ? (t('summarySpruceNoKnots') || "Smrek bez uzlov") :
                   obkladStien === "sadrokarton_tapeta" ? (t('summaryPlasterboardWallpaper') || "Sadrokartón/Tapeta") : (t('summaryOsbPanel') || "OSB panel"), 
            price: obkladStien === "smrek_8cm" ? 0 : (CENY[`obklad_${obkladStien}`] || 0),
            isStandard: obkladStien === "smrek_8cm"
          },
          { 
            label: t('summaryFloor') || "Podlaha", 
            value: t('summaryLaminate') || "Laminát", 
            price: 0,
            isStandard: true
          },
          { 
            label: t('summaryInteriorDoor') || "Interiérové dvere", 
            value: interieroveDvere === "kridlove" ? (t('summaryHinged') || "Krídlové") : (t('summarySliding') || "Posuvné"), 
            price: interieroveDvere === "kridlove" ? 0 : (CENY.dvere_posuvne || 0),
            isStandard: interieroveDvere === "kridlove"
          },
          { 
            label: t('summaryShower') || "Sprchový kút", 
            value: sprchovyKut === "standard" ? (t('summaryStandard') || "Štandard") : "Radaway", 
            price: sprchovyKut === "standard" ? 0 : (CENY.sprchovyKut || 0),
            isStandard: sprchovyKut === "standard"
          },
          { 
            label: t('summaryBathroomFaucet') || "Kúpeľňová batéria", 
            value: bateria === "standard" ? (t('summaryStandard') || "Štandard") : "Grohe", 
            price: bateria === "standard" ? 0 : (CENY.bateria || 0),
            isStandard: bateria === "standard"
          },
          { 
            label: t('summaryBathroomCeiling') || "Strop v kúpeľni", 
            value: stropKupelna === "drevo" ? (t('summaryWoodCladding') || "Drevený obklad") : (t('summaryPlasterboard') || "Sadrokartón"), 
            price: 0,
            isStandard: true
          },
          { 
            label: t('summaryBath') || "Vaňa", 
            value: t('summaryYes') || "Áno", 
            price: CENY.vana || 0, 
            isStandard: false, 
            hideIfStandard: true,
            active: vana
          },
          { 
            label: t('summaryCabinetSink') || "Skrinka s umývadlom", 
            value: t('summaryYes') || "Áno", 
            price: CENY.skrinka || 0, 
            isStandard: false, 
            hideIfStandard: true,
            active: skrinka
          },
        ]
      },
      {
        title: t('summaryCategoryTech') || "4. Technológie & Služby",
        items: [
          { label: t('summaryHeatPump') || "Tepelné čerpadlo", value: t('summaryYes') || "Áno", price: CENY.tepelne_cerpadlo || 0, isStandard: false, active: tepelneCerpadlo === "ano", hideIfStandard: true },
          { label: t('summaryRecuperationPrep') || "Príprava na rekuperáciu", value: t('summaryYes') || "Áno", price: CENY.pripravaNaRekuperaciu || 0, isStandard: false, active: pripravaNaRekuperaciu, hideIfStandard: true },
          { label: t('summaryRecuperation') || "Rekuperácia", value: t('summaryYes') || "Áno", price: CENY.rekuperacia || 0, isStandard: false, active: rekuperacia === "ano", hideIfStandard: true },
          { label: t('summaryFloorHeating') || "Podlahové kúrenie", value: t('summaryYes') || "Áno", price: CENY.podlahove_kurenie || 0, isStandard: false, active: podlahovoKurenie, hideIfStandard: true },
          { label: t('summaryAirConditioning') || "Klimatizácia", value: t('summaryYes') || "Áno", price: CENY.klimatizacia || 0, isStandard: false, active: klimatizacia, hideIfStandard: true },
          { label: t('summaryFireplacePrep') || "Príprava na krb", value: t('summaryYes') || "Áno", price: CENY.pripravaKrb || 0, isStandard: false, active: pripravaNaKrb, hideIfStandard: true },
          { label: t('summaryStoveProtection') || "Ochrana (Kachle)", value: t('summaryYes') || "Áno", price: CENY.ochranaKachle || 0, isStandard: false, active: ochranaKachle, hideIfStandard: true },
          { label: t('summaryLightningConductor') || "Bleskozvod", value: t('summaryYes') || "Áno", price: CENY.bleskozvod || 0, isStandard: false, active: bleskozvod, hideIfStandard: true },
          { label: t('summarySurgeProtection') || "Prepäťová ochrana", value: t('summaryYes') || "Áno", price: CENY.prepat || 0, isStandard: false, active: prepat, hideIfStandard: true },
          { label: t('summarySolarPrep') || "Príprava na solárne panely", value: t('summaryYes') || "Áno", price: CENY.pripravaNaSolarnePanely || 0, isStandard: false, active: pripravaNaSolarnePanely, hideIfStandard: true },
          { label: t('summaryEngineering') || "Inžiniering", value: t('summaryYes') || "Áno", price: CENY.inziniering || 0, isStandard: false, active: inziniering, hideIfStandard: true },
          { label: t('summaryProjectCert') || "Projekt a certifikácia", value: t('summaryYes') || "Áno", price: CENY.projektACertifikacia || 0, isStandard: false, active: projektACertifikacia, hideIfStandard: true },
          { label: t('summaryRevision') || "Revízia", value: t('summaryYes') || "Áno", price: CENY.revizia || 0, isStandard: false, active: revizia, hideIfStandard: true },
          { label: t('summaryAssembly') || "Montáž domu", value: t('summaryYes') || "Áno", price: CENY.montaz || 0, isStandard: false, active: montaz, hideIfStandard: true },
          { label: t('summaryTransport') || "Doprava", value: t('summaryYes') || "Áno", price: CENY.doprava || 0, isStandard: false, active: doprava && dopravaViditelna, hideIfStandard: true, condition: dopravaViditelna },
          { label: t('summaryPropertySale') || "Predaj nehnuteľnosti", value: t('summaryYes') || "Áno", price: 0, isStandard: true, active: predajNehnutelnosti, hideIfStandard: true },
          { label: t('summaryWantLand') || "Chcem pozemok", value: t('summaryYes') || "Áno", price: 0, isStandard: true, active: hladamPozemok, hideIfStandard: true },
          { label: t('summaryFinance') || "Finančné služby", value: t('summaryYes') || "Áno", price: 0, isStandard: true, active: financneSluzby, hideIfStandard: true },
        ]
      }
    ];

    return (
      <div className="space-y-4">
        {categories.map((category, idx) => {
          const visibleItems = category.items.filter(item => {
            if (item.condition === false) return false;
            if (item.hideIfStandard) {
              return item.active;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider mb-1">
                {category.title}
              </div>
              <div className="space-y-2">
                {visibleItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-baseline gap-4 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                      {item.price > 0 && (
                        <span className="text-[10px] text-[#C5A880] font-black">
                          (+{item.price.toLocaleString('sk-SK')} €)
                        </span>
                      )}
                      {item.isStandard && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                          {t('summaryInPrice') || "V cene"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full relative mt-8 font-sans">
      {/* Vysvetlenie Štandardu */}
      <div className="w-full bg-emerald-50/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-sm">
        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-full text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('ticabPremiumStandardTitle') || 'Prémiový drevodom v základnej cene'}</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t('ticabPremiumStandardDesc') || 'Domy Ticab House sú štandardne dodávané ako prémiové drevodomy s kvalitným dreveným obkladom fasády aj interiéru. Tento luxusný drevený štandard je už zahrnutý v základnej cene. Priplácate si výlučne iba za zmeny štandardu (napr. ak chcete vymeniť drevo za sadrokartón).'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full relative">
        {/* ĽAVÝ STĹPEC - Možnosti (cca 65%) */}
        <div className="flex-1 min-w-0 w-full lg:w-[65%] space-y-8 pb-32">
        
        {/* 0. Účel stavby */}
        <section id="section-0" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8">
          <BigSectionHeader title={getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby'} icon={Home} stepIdx={0} totalSteps={13} />
          
          <ConfiguratorRow
            label={t('purposeOfBuilding') || 'Účel stavby'}
            description={t('purposeOfBuildingDesc') || 'Zvoľte, či plánujete stavbu využívať ako rodinný dom na trvalé bývanie (vyžaduje normu A0) alebo ako rekreačnú chatu.'}
            selectedValue={ucel}
            onChange={(val) => {
              if (val === "chata") {
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
              } else {
                setUcel("rodinny"); setKolaudacia("s_a0");
                setIzolaciaStien("250mm"); setIzolaciaPodlahy("200mm"); setIzolaciaStropu("200mm");
                setTepelneCerpadlo("ano"); setPripravaNaRekuperaciu(true); setRekuperacia("ano");
                setInziniering(true); setProjektACertifikacia(true); setRevizia(true);
                setBleskozvod(true); setPrepat(true); setElektro("ge"); setKlimatizacia(true);
              }
            }}
            isAdmin={isAdmin}
            options={[
              { value: "chata", label: getTranslatedText('ucel_rekreacna', 'nazov') || t('recreationalBuilding') || 'Rekreačná chata', price: 0 },
              { value: "rodinny", label: getTranslatedText('ucel_rodinny', 'nazov') || t('familyHouseA0') || 'Rodinný dom (A0)', price: 0, isA0: true }
            ]}
            icon={Home}
          />
        </section>

        {/* 1. Izolácia */}
        <section id="section-1" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia'} icon={Thermometer} stepIdx={1} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('izolacia_stien', 'nazov') || t('wallInsulation') || 'Izolácia stien'}
            description={getTranslatedText('izolacia_stien_desc') || 'Hrúbka minerálnej izolácie v obvodových stenách domu.'}
            selectedValue={izolaciaStien}
            onChange={setIzolaciaStien}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "150mm", label: '150 mm', price: 0 },
              { value: "200mm", label: '200 mm', price: CENY.izolacia_stien_200mm, priceKey: 'izolacia_stien_200mm' },
              { value: "250mm", label: '250 mm', price: CENY.izolacia_stien_250mm, priceKey: 'izolacia_stien_250mm', isA0: true }
            ]}
            icon={Thermometer}
          />

          <ConfiguratorRow
            label={getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy'}
            description={getTranslatedText('izolacia_podlahy_desc') || 'Tepelná izolácia podlahy chrániaca pred chladom od základov.'}
            selectedValue={izolaciaPodlahy}
            onChange={setIzolaciaPodlahy}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "150mm", label: '150 mm', price: 0 },
              { value: "200mm", label: '200 mm', price: CENY.izolacia_podlahy_200mm, priceKey: 'izolacia_podlahy_200mm', isA0: true }
            ]}
            icon={Layers}
          />

          <ConfiguratorRow
            label={getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu'}
            description={getTranslatedText('izolacia_stropu_desc') || 'Zabraňuje úniku tepla cez strešnú konštrukciu.'}
            selectedValue={izolaciaStropu}
            onChange={setIzolaciaStropu}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "150mm", label: '150 mm', price: 0 },
              { value: "200mm", label: '200 mm', price: CENY.izolacia_stropu_200mm, priceKey: 'izolacia_stropu_200mm', isA0: true }
            ]}
            icon={Layers}
          />
        </section>

        {/* 2. Vykurovanie */}
        <section id="section-2" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie'} icon={Flame} stepIdx={2} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('tepelne_cerpadlo', 'nazov') || t('heating') || 'Tepelné čerpadlo'}
            description={getTranslatedText('tepelne_cerpadlo_desc') || 'Vysoko úsporné vykurovanie vzduch-vzduch pre nízke prevádzkové náklady.'}
            selectedValue={tepelneCerpadlo}
            onChange={setTepelneCerpadlo}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "nie", label: getTranslatedText('tepelne_cerpadlo_nie', 'nazov') || 'Príprava na kúrenie', price: 0 },
              { value: "ano", label: getTranslatedText('tepelne_cerpadlo_ano', 'nazov') || 'Tepelné čerpadlo', price: CENY.tepelne_cerpadlo, priceKey: 'tepelne_cerpadlo', isA0: true }
            ]}
            icon={Flame}
          />

          <ConfiguratorRow
            label={getTranslatedText('rekuperacia', 'nazov') || t('ventilation') || 'Rekuperácia'}
            description={getTranslatedText('rekuperacia_desc') || 'Riadené vetranie so spätným získavaním tepla pre čistý a čerstvý vzduch.'}
            selectedValue={rekuperacia === "ano" ? "ano" : pripravaNaRekuperaciu ? "priprava" : "nie"}
            onChange={(val) => {
              if (val === "nie") { setRekuperacia("nie"); setPripravaNaRekuperaciu(false); }
              else if (val === "priprava") { setRekuperacia("nie"); setPripravaNaRekuperaciu(true); }
              else { setRekuperacia("ano"); setPripravaNaRekuperaciu(false); }
            }}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "nie", label: getTranslatedText('rekuperacia_nie', 'nazov') || 'Bez rekuperácie', price: 0 },
              { value: "priprava", label: getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu', price: CENY.pripravaNaRekuperaciu, priceKey: 'pripravaNaRekuperaciu', isA0: true },
              { value: "ano", label: getTranslatedText('rekuperacia_ano', 'nazov') || 'Rekuperácia', price: CENY.rekuperacia, priceKey: 'rekuperacia', isA0: true }
            ]}
            icon={Wind || Droplet}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Doplnky a nadštandard vykurovania</h5>
            <AddonRow icon={Flame} label={getTranslatedText('podlahove_kurenie', 'nazov') || t('floorHeating')} checked={podlahovoKurenie} onChange={() => setPodlahovoKurenie(!podlahovoKurenie)} price={CENY.podlahove_kurenie} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('podlahove_kurenie', p)} />
            <AddonRow icon={Flame} label={getTranslatedText('pripravaKrb', 'nazov') || t('fireplacePrep')} checked={pripravaNaKrb} onChange={() => setPripravaNaKrb(!pripravaNaKrb)} price={CENY.pripravaKrb} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('pripravaKrb', p)} />
            <AddonRow icon={Flame} label={getTranslatedText('ochranaKachle', 'nazov') || t('stoveProtection')} checked={ochranaKachle} onChange={() => setOchranaKachle(!ochranaKachle)} price={CENY.ochranaKachle} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('ochranaKachle', p)} />
            <AddonRow icon={Wind} label={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} checked={klimatizacia} onChange={() => setKlimatizacia(!klimatizacia)} price={CENY.klimatizacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('klimatizacia', p)} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 3. Fasáda */}
        <section id="section-3" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8">
          <BigSectionHeader title={getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda'} icon={Paintbrush} stepIdx={3} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda'}
            description={getTranslatedText('fasada_desc') || 'Vyberte si exteriérový obklad a štýl fasády, ktorý definuje celkový vzhľad domu.'}
            selectedValue={fasada}
            onChange={setFasada}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            onShowGallery={() => handleShowOptionGallery(fasada === "omietka" ? 'exterier_murovka' : 'exterier_drevo_plech')}
            options={[
              { value: "drevo_smrek", label: getTranslatedText('fasada_drevo_smrek', 'nazov') || t('spruceWood') || 'Severský smrek', price: 0 },
              { value: "omietka", label: getTranslatedText('fasada_omietka', 'nazov') || t('scratchedPlaster') || 'Šúchaná omietka', price: CENY.fasada_omietka, priceKey: 'fasada_omietka' },
              { value: "smrekovec", label: getTranslatedText('fasada_smrekovec', 'nazov') || t('larch') || 'Sibírsky smrekovec', price: CENY.fasada_smrekovec, priceKey: 'fasada_smrekovec' },
              { value: "falcovane", label: getTranslatedText('fasada_falcovane', 'nazov') || t('foldedPanels') || 'Falcovaný plech', price: CENY.fasada_falcovane, priceKey: 'fasada_falcovane' },
              { value: "thermowood", label: 'Thermowood', price: CENY.fasada_thermowood, priceKey: 'fasada_thermowood' }
            ]}
            icon={Paintbrush}
          />
        </section>

        {/* 4. Strecha */}
        <section id="section-4" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha'} icon={Home} stepIdx={4} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('stresna_krytina', 'nazov') || t('roofCoveringType') || 'Strešná krytina'}
            description={getTranslatedText('strecha_desc') || 'Zvoľte materiál a farbu strešnej krytiny.'}
            selectedValue={strecha}
            onChange={setStrecha}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "korugovan_plech", label: getTranslatedText('strecha_korugovan', 'nazov') || 'Korugovaný plech', price: 0 },
              { value: "falcovane", label: getTranslatedText('strecha_falcovane', 'nazov') || 'Falcovaný plech', price: CENY.strecha_falcovane, priceKey: 'strecha_falcovane' }
            ]}
            icon={Layers}
          />

          <ConfiguratorRow
            label={getTranslatedText('odkvapy', 'nazov') || t('gutters') || 'Odkvapy'}
            description={getTranslatedText('odkvapy_desc') || 'Bezpečné odvádzanie dažďovej vody zo strechy.'}
            selectedValue={odkvapy}
            onChange={setOdkvapy}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "nie", label: getTranslatedText('odkvapy_nie', 'nazov') || 'Bez odkvapov', price: 0 },
              { value: "ano", label: getTranslatedText('odkvapy_ano', 'nazov') || 'S odkvapmi', price: CENY.odkvapy, priceKey: 'odkvapy' }
            ]}
            icon={Layers}
          />
        </section>

        {/* 5. Okná a dvere */}
        <section id="section-5" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere'} icon={DoorOpen} stepIdx={5} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('okna_farba', 'nazov') || t('windowColor') || 'Farba okien 3-sklo'}
            description={getTranslatedText('okna_farba_desc') || 'Profil okien s izolačným trojsklom v obľúbených odtieňoch.'}
            selectedValue={okna}
            onChange={setOkna}
            isAdmin={isAdmin}
            options={[
              { value: "biele", label: getTranslatedText('okna_biele', 'nazov') || 'Biele', price: 0 },
              { value: "antracit", label: getTranslatedText('okna_antracit', 'nazov') || 'Antracit', price: 0 },
              { value: "hnede", label: getTranslatedText('okna_hnede', 'nazov') || 'Hnedé', price: 0 }
            ]}
            icon={DoorOpen}
          />

          <ConfiguratorRow
            label={getTranslatedText('vchodove_dvere', 'nazov') || t('entryDoors') || 'Vchodové dvere'}
            description={getTranslatedText('vchodove_dvere_desc') || 'Bezpečné a tepelne izolované exteriérové dvere.'}
            selectedValue={vchodoveDvere}
            onChange={setVchodoveDvere}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "plastove", label: getTranslatedText('dvere_plastove', 'nazov') || 'Plastovo-kovové', price: 0 },
              { value: "kovove", label: getTranslatedText('dvere_kovove', 'nazov') || 'Kovové', price: CENY.dvere_kovove, priceKey: 'dvere_kovove' }
            ]}
            icon={DoorOpen}
          />
        </section>

        {/* 6. Interiér */}
        <section id="section-6" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér'} icon={Layout} stepIdx={6} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('obklad_stien', 'nazov') || t('wallCladding') || 'Obklad stien'}
            description={getTranslatedText('obklad_stien_desc') || 'Finálna úprava vnútorných stien a stropu v izbách.'}
            selectedValue={obkladStien}
            onChange={setObkladStien}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            onShowGallery={() => handleShowOptionGallery(obkladStien === "sadrokarton_tapeta" ? 'interier_sadrokarton' : 'interier_drevo')}
            options={[
              { value: "smrek_8cm", label: getTranslatedText('obklad_smrek_8cm', 'nazov') || 'Smrek 8cm', price: 0 },
              { value: "smrek_bez_uzlov", label: getTranslatedText('obklad_smrek_bez_uzlov', 'nazov') || 'Smrek bez uzlov', price: CENY.obklad_smrek_bez_uzlov, priceKey: 'obklad_smrek_bez_uzlov' },
              { value: "sadrokarton_tapeta", label: getTranslatedText('obklad_sadrokarton', 'nazov') || 'Sadrokartón/Tapeta', price: CENY.obklad_sadrokarton_tapeta, priceKey: 'obklad_sadrokarton_tapeta' },
              { value: "osb_panel", label: getTranslatedText('obklad_osb', 'nazov') || 'OSB panel', price: CENY.obklad_osb_panel, priceKey: 'obklad_osb_panel' }
            ]}
            icon={Layout}
          />

          <ConfiguratorRow
            label={getTranslatedText('podlaha', 'nazov') || t('floorType') || 'Podlaha'}
            description={getTranslatedText('podlaha_desc') || 'Vnútorná podlahová krytina v základnej cene.'}
            selectedValue={podlaha}
            onChange={setPodlaha}
            isAdmin={isAdmin}
            options={[
              { value: "laminat", label: getTranslatedText('podlaha_laminat', 'nazov') || 'Laminát', price: 0 }
            ]}
            icon={Layers}
          />

          <ConfiguratorRow
            label={getTranslatedText('interierove_dvere', 'nazov') || t('interiorDoorsType') || 'Interiérové dvere'}
            description={getTranslatedText('interierove_dvere_desc') || 'Vnútorné dvere oddeľujúce izby od spoločných priestorov.'}
            selectedValue={interieroveDvere}
            onChange={setInterieroveDvere}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "kridlove", label: getTranslatedText('dvere_kridlove', 'nazov') || 'Krídlové', price: 0 },
              { value: "posuvne", label: getTranslatedText('dvere_posuvne', 'nazov') || 'Posuvné v stene', price: CENY.dvere_posuvne, priceKey: 'dvere_posuvne' }
            ]}
            icon={DoorOpen}
          />
        </section>

        {/* 7. Elektro */}
        <section id="section-7" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektroinštalácia'} icon={Zap} stepIdx={7} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('elektro_typ', 'nazov') || t('installationType') || 'Typ inštalácie'}
            description={getTranslatedText('elektro_typ_desc') || 'Elektroinštalačné práce a štandard rozvodov.'}
            selectedValue={elektro}
            onChange={setElektro}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "eu", label: getTranslatedText('elektro_eu', 'nazov') || 'EU štandard', price: 0 },
              { value: "cz", label: getTranslatedText('elektro_cz', 'nazov') || 'CZ/SK štandard', price: CENY.elektro_cz, priceKey: 'elektro_cz' },
              { value: "ge", label: getTranslatedText('elektro_ge', 'nazov') || 'Nemecký GE štandard', price: CENY.elektro_ge, priceKey: 'elektro_ge', isA0: true }
            ]}
            icon={Zap}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Elektroinštalačné doplnky</h5>
            <AddonRow icon={Zap} label={getTranslatedText('bleskozvod', 'nazov') || t('lightningRod')} checked={bleskozvod} onChange={() => setBleskozvod(!bleskozvod)} price={CENY.bleskozvod} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('bleskozvod', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow icon={Zap} label={getTranslatedText('prepat', 'nazov') || t('surgeProtection')} checked={prepat} onChange={() => setPrepat(!prepat)} price={CENY.prepat} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('prepat', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow icon={Zap} label={getTranslatedText('pripravaNaSolarnePanely', 'nazov') || 'Príprava na solárne panely'} checked={pripravaNaSolarnePanely} onChange={() => setPripravaNaSolarnePanely(!pripravaNaSolarnePanely)} price={CENY.pripravaNaSolarnePanely} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('pripravaNaSolarnePanely', p)} />
          </div>
        </section>

        {/* 8. Kúpeľňa */}
        <section id="section-8" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa'} icon={Droplet} stepIdx={8} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('sprchovyKut', 'nazov') || t('showerCabin') || 'Sprchový kút'}
            description={getTranslatedText('sprchovyKut_desc') || 'Vybavenie sprchovej zóny.'}
            selectedValue={sprchovyKut}
            onChange={setSprchovyKut}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "standard", label: getTranslatedText('sprcha_standard', 'nazov') || 'Štandard', price: 0 },
              { value: "radaway", label: getTranslatedText('sprcha_radaway', 'nazov') || 'Radaway s vaničkou', price: CENY.sprchovyKut, priceKey: 'sprchovyKut' }
            ]}
            icon={Droplet}
          />

          <ConfiguratorRow
            label={getTranslatedText('bateria', 'nazov') || t('faucet') || 'Batéria'}
            description={getTranslatedText('bateria_desc') || 'Kvalitné vodovodné batérie do sprchy a umývadla.'}
            selectedValue={bateria}
            onChange={setBateria}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "standard", label: getTranslatedText('bateria_standard', 'nazov') || 'Štandardná batéria', price: 0 },
              { value: "grohe", label: 'Grohe prémiová', price: CENY.bateria, priceKey: 'bateria' }
            ]}
            icon={Droplet}
          />

          <ConfiguratorRow
            label={getTranslatedText('strop_kupelna', 'nazov') || t('bathroomCeiling') || 'Strop v kúpeľni'}
            description={getTranslatedText('strop_kupelna_desc') || 'Materiál stropu v kúpeľňovom priestore.'}
            selectedValue={stropKupelna}
            onChange={setStropKupelna}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "drevo", label: getTranslatedText('strop_drevo', 'nazov') || 'Drevený obklad', price: 0 },
              { value: "sadrokarton", label: getTranslatedText('strop_sadrokarton', 'nazov') || 'Sadrokartón', price: CENY.strop_kupelna_sadrokarton, priceKey: 'strop_kupelna_sadrokarton' }
            ]}
            icon={Layers}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Kúpeľňové doplnky</h5>
            <AddonRow icon={Droplet} label={getTranslatedText('vana', 'nazov') || t('bathtub')} checked={vana} onChange={() => setVana(!vana)} price={CENY.vana} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('vana', p)} />
            <AddonRow icon={Layout} label={getTranslatedText('skrinka', 'nazov') || t('cabinet')} checked={skrinka} onChange={() => setSkrinka(!skrinka)} price={CENY.skrinka} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('skrinka', p)} />
          </div>
        </section>

        {/* 9. Základy */}
        <section id="section-9" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8">
          <BigSectionHeader title={getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy'} icon={Wrench} stepIdx={9} totalSteps={13} />
          
          <ConfiguratorRow
            label={getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Zakladanie stavby'}
            description={getTranslatedText('zaklady_desc') || 'Spôsob osadenia modulu na pozemok. V prípade klasických základov sa prispôsobíme typu terénu.'}
            selectedValue={zaklady}
            onChange={setZaklady}
            isAdmin={isAdmin}
            onPriceChange={handlePriceChange}
            options={[
              { value: "bez", label: getTranslatedText('zaklady_bez', 'nazov') || 'Svojpomocne (Bez základov)', price: 0 },
              { value: "vruty", label: getTranslatedText('zaklady_vruty', 'nazov') || 'Zemné skrutky', price: CENY.zaklady_vruty, priceKey: 'zaklady_vruty' },
              { value: "patky", label: getTranslatedText('zaklady_patky', 'nazov') || 'Betónové pätky', price: CENY.zaklady_patky, priceKey: 'zaklady_patky' },
              { value: "pasove", label: getTranslatedText('zaklady_pasove', 'nazov') || 'Pásové základy', price: CENY.zaklady_pasove, priceKey: 'zaklady_pasove' }
            ]}
            icon={Wrench}
          />
        </section>

        {/* 10. Inžiniering */}
        <section id="section-10" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering a dokumentácia'} icon={Layers} stepIdx={10} totalSteps={13} />
          <div className="space-y-3">
            <AddonRow icon={Layers} label={getTranslatedText('inziniering', 'nazov') || t('engineering')} checked={inziniering} onChange={() => setInziniering(!inziniering)} price={CENY.inziniering} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('inziniering', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow icon={Layers} label={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} checked={projektACertifikacia} onChange={() => setProjektACertifikacia(!projektACertifikacia)} price={CENY.projektACertifikacia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('projektACertifikacia', p)} locked={ucel === "rodinny"} t={t} />
            <AddonRow icon={CheckCircle} label={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} checked={revizia} onChange={() => setRevizia(!revizia)} price={CENY.revizia} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('revizia', p)} locked={ucel === "rodinny"} t={t} />
          </div>
        </section>

        {/* 11. Realizácia */}
        <section id="section-11" className="scroll-mt-32 border-b border-slate-200 dark:border-white/10 pb-8 space-y-4">
          <BigSectionHeader title={getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia'} icon={Hammer} stepIdx={11} totalSteps={13} />
          <div className="space-y-3">
            <AddonRow icon={Hammer} label={getTranslatedText('montaz', 'nazov') || t('houseAssembly')} checked={montaz} onChange={() => setMontaz(!montaz)} price={CENY.montaz} isAdmin={isAdmin} onPriceChange={p => handlePriceChange('montaz', p)} />
            
            {(dopravaViditelna || isAdmin) && (
              <div className="relative">
                <AddonRow 
                  icon={Wrench}
                  label={getTranslatedText('doprava', 'nazov') || t('transportTile')} 
                  checked={doprava && dopravaViditelna} 
                  onChange={() => dopravaViditelna && setDoprava(!doprava)} 
                  price={CENY.doprava} 
                  isAdmin={isAdmin} 
                  onPriceChange={p => handlePriceChange('doprava', p)} 
                  disabled={!dopravaViditelna && isAdmin}
                />
                {!dopravaViditelna && isAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 rounded-lg backdrop-blur-[1px]">
                    <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                      <EyeOff className="w-3 h-3" />
                      Skryté pre verejnosť
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDopravaVisibility();
                    }}
                    disabled={toggleDopravaVisibilityMutation.isPending}
                    className={`absolute -top-3 -right-3 z-10 p-2 rounded-full shadow-lg transition-all ${
                      dopravaViditelna 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title={dopravaViditelna ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                  >
                    {dopravaViditelna ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 12. Služby k nákupu */}
        <section id="section-12" className="scroll-mt-32 pb-8 space-y-4">
          <BigSectionHeader 
            title={getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Služby k nákupu'} 
            description={getTranslatedText('sekcia_sluzby', 'podnadpis') || 'Vyberte si doplnkové služby (voliteľné):'} 
            icon={Sparkles} 
            stepIdx={12} 
            totalSteps={13} 
          />
          <div className="space-y-3">
            <AddonRow 
              icon={Home} 
              label={getTranslatedText('sluzba_predaj', 'nazov') || 'Predaj predošlej nehnuteľnosti'} 
              description={getTranslatedText('sluzba_predaj', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší odborníci v realitách.'} 
              checked={predajNehnutelnosti} 
              onChange={() => setPredajNehnutelnosti(!predajNehnutelnosti)} 
              price={0} 
            />
            <AddonRow 
              icon={Wrench} 
              label={getTranslatedText('sluzba_pozemok', 'nazov') || 'Chcem pozemok pod svoj dom'} 
              description={getTranslatedText('sluzba_pozemok', 'dlhy_popis') || 'Pomôžeme Vám nájsť ideálny pozemok.'} 
              checked={hladamPozemok} 
              onChange={() => setHladamPozemok(!hladamPozemok)} 
              price={0} 
            />
            <AddonRow 
              icon={Zap} 
              label={getTranslatedText('sluzba_finance', 'nazov') || 'Finančné služby - úvery/poistky'} 
              description={getTranslatedText('sluzba_finance', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší finančníci.'} 
              checked={financneSluzby} 
              onChange={() => setFinancneSluzby(!financneSluzby)} 
              price={0} 
            />
          </div>
        </section>

      </div>
        
        {/* PRAVÝ STĹPEC - Sticky Účtenka */}
        <aside className="hidden lg:block w-[35%] flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar z-40">
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-4">{t('configurationSummary')}</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/5 text-sm">
                <span>{t('baseHousePrice')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
              </div>
              
              {renderGroupedSummary()}
            </div>

            <div className="mt-auto border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('totalPriceVAT')}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString('sk-SK')} €</span>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} 
                className="w-full bg-gradient-to-r from-[#9E2A2B] to-[#802021] hover:from-[#802021] hover:to-[#611617] text-white font-bold rounded-xl py-3.5 shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('sendQuote')}
              </button>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Mobilný Bottom Sheet pre Zhrnutie */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSummaryOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 rounded-t-3xl shadow-2xl z-50 flex flex-col pointer-events-auto"
            >
              {/* Handle bar */}
              <div className="w-full flex justify-center py-3 flex-shrink-0 cursor-pointer" onClick={() => setIsMobileSummaryOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-6 pb-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('configurationSummary')}</h3>
                <button onClick={() => setIsMobileSummaryOpen(false)} className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body (Grouped Summary) */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/5 text-sm">
                  <span>{t('baseHousePrice')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
                </div>
                {renderGroupedSummary()}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 flex flex-col gap-4 flex-shrink-0 pb-8">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t('totalPriceVAT')}</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString('sk-SK')} €</span>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileSummaryOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-contact-modal'));
                    }, 300);
                  }}
                  className="w-full bg-gradient-to-r from-[#9E2A2B] to-[#802021] text-white font-bold rounded-2xl py-4 shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {t('interestedInOffer')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plávajúca cena (Iba pre mobilné zariadenia) */}
      <FloatingPrice 
        price={totalPrice} 
        isVisible={true} 
        onSendQuote={handleSendQuoteFromFloating}
        dom={dom}
        vyrobca="Ticab house"
        mobileOnly={true}
        onToggleSummary={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
        isSummaryOpen={isMobileSummaryOpen}
      />

      {/* Lightbox pre ukážky možností */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveLightbox(null)}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={() => setActiveLightbox(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Main Image */}
              <div className="relative w-full flex items-center justify-center">
                {activeLightbox.images.length > 1 && (
                  <button 
                    onClick={() => {
                      setActiveLightbox(prev => {
                        const newIdx = prev.index === 0 ? prev.images.length - 1 : prev.index - 1;
                        return { ...prev, index: newIdx };
                      });
                    }}
                    className="absolute left-2 md:-left-16 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <img 
                  src={activeLightbox.images[activeLightbox.index]} 
                  alt="Ukážka možnosti" 
                  className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                />

                {activeLightbox.images.length > 1 && (
                  <button 
                    onClick={() => {
                      setActiveLightbox(prev => {
                        const newIdx = prev.index === prev.images.length - 1 ? 0 : prev.index + 1;
                        return { ...prev, index: newIdx };
                      });
                    }}
                    className="absolute right-2 md:-right-16 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Counter / Caption */}
              {activeLightbox.images.length > 1 && (
                <div className="mt-4 text-white/80 text-sm font-medium">
                  {activeLightbox.index + 1} z {activeLightbox.images.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
