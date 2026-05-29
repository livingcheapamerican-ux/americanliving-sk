import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Check, Info, Send, X, Thermometer, Zap, Layout, Hammer,
  CheckCircle, FileText, Eye, Lock, ChevronDown, ChevronUp, MessageCircle, ChevronLeft, ChevronRight,
  Paintbrush, DoorOpen, Wrench, Layers, Maximize, Settings, Droplet, Sun, Wind, Flame, SunDim, CheckSquare
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { prostoHouseTranslations } from '../translations/ProstoHouseTranslations';
import ProstoHousePriceSaver from '../ProstoHousePriceSaver';
import ProstoHouseSummary from './ProstoHouseSummary';
import SaveQuoteButton from '../SaveQuoteButton';
import A0StatusHint from './A0StatusHint';
import KonfiguratorGaleria from './KonfiguratorGaleria';

// ── Glassmorphism Komponenty s Ikonami a Animáciami ─────────────────────────────────────

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
  return (
    <div className="flex flex-col p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-355 dark:hover:border-white/10 transition-all duration-300 gap-4 backdrop-blur-md w-full">
      
      {/* HORNÁ STRANA: Nadpis, Popis a ukážka */}
      <div className="flex items-start gap-4 w-full min-w-0">
        {Icon && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
              {label}
            </h4>
          </div>
          {description && (
            <p className="text-slate-550 dark:text-slate-405 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {onShowGallery && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowGallery();
              }}
              className="mt-2 text-[11px] sm:text-xs font-bold text-red-500 hover:text-white flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-all w-fit cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pozrieť ukážku</span>
            </button>
          )}
        </div>
      </div>

      {/* DOLNÁ STRANA: Horizontálny prepínač (Segmented pill selector) - na celú šírku */}
      <div className="w-full mt-2">
        <div className="flex flex-col sm:flex-row gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 w-full overflow-x-auto sm:overflow-visible no-scrollbar">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            const isStandard = opt.price === 0;
            
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`relative flex flex-col sm:flex-row items-center justify-center px-4 py-3 sm:py-2.5 rounded-xl text-center text-xs font-bold transition-all duration-300 whitespace-nowrap gap-1.5 sm:gap-2 flex-1 cursor-pointer border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-red-650 dark:text-red-405 border-slate-200 dark:border-slate-700 shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 border-transparent hover:bg-white/30 dark:hover:bg-white/5'
                }`}
              >
                {/* A0 badge in option */}
                {opt.isA0 && (
                  <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isSelected 
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                  }`}>
                    ★ A0
                  </span>
                )}
                
                <span className="text-xs tracking-wide">{opt.label}</span>
                
                {/* Admin Mode Price Edit */}
                {isAdmin && onPriceChange && opt.priceKey !== undefined ? (
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
                      ? 'text-red-650 dark:text-red-405' 
                      : isStandard 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isStandard ? 'V cene' : `+${opt.price.toLocaleString()} €`}
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

const OptionCard = ({ label, price, description, selected, onClick, isA0, isAdmin, onPriceChange, icon: Icon, onShowGallery }) => {
  const isStandard = price === 0;
  return (
  <div 
    onClick={onClick} 
    className={`relative flex flex-col p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 w-full text-left active:scale-[0.98] gap-3 sm:gap-4 overflow-hidden group cursor-pointer backdrop-blur-md ${
      selected 
        ? 'border-red-500 bg-red-500/10 dark:bg-gradient-to-br dark:from-red-500/10 dark:to-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] scale-[1.02]' 
        : isStandard 
          ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/55 hover:bg-emerald-500/10' 
          : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
    }`}
  >
    {selected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-80" />}
    <div className="flex items-start gap-3 sm:gap-4 w-full relative z-10">
      {Icon && (
        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-305 ${
          selected 
            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl shadow-red-500/30 rotate-3' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-110'
        }`}>
          <Icon className={`w-5 h-5 sm:w-7 sm:h-7 transition-transform duration-300 ${selected ? 'scale-110' : 'scale-100'}`} />
        </div>
      )}
      
      <div className="flex-1 min-w-0 mt-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`font-black text-base sm:text-lg transition-colors duration-300 ${selected ? 'text-red-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>{label}</span>
          {isA0 && <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">A0 Certifikácia</span>}
        </div>
        {description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{description}</p>}
        {onShowGallery && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowGallery();
            }}
            className="mt-1 sm:mt-2 text-[11px] sm:text-xs font-bold text-[#C5A880] hover:text-white flex items-center gap-1 bg-[#C5A880]/10 hover:bg-[#C5A880]/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#C5A880]/20 transition-all w-fit"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A880]" />
            <span>Pozrieť ukážku</span>
          </button>
        )}
      </div>
      
      <div className="flex flex-col items-end flex-shrink-0">
        <div className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          selected 
            ? 'border-red-500 bg-red-500 scale-110 shadow-lg shadow-red-500/40' 
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/50'
        }`}>
          {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
        </div>
        
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-red-550/30 rounded px-2 py-1 mt-1 backdrop-blur-md" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-20 text-sm font-bold text-red-400 bg-transparent outline-none" />
          </div>
        ) : (
          <span className={`text-sm sm:text-base font-black whitespace-nowrap transition-colors duration-300 ${
            selected 
              ? 'text-red-600 dark:text-red-400' 
              : isStandard 
                ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-500'
          }`}>
            {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
          </span>
        )}
      </div>
    </div>
  </div>
  );
};

const AddonRow = ({ label, price, checked, onChange, disabled = false, locked = false, isAdmin, onPriceChange, description, t, icon: Icon }) => (
  <button 
    type="button"
    onClick={!disabled && !locked ? onChange : undefined} 
    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl border transition-all duration-300 w-full active:scale-[0.98] group overflow-hidden relative gap-4 ${
      locked 
        ? 'border-emerald-500/20 bg-emerald-500/5 cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-md' 
        : checked 
          ? 'border-red-500 bg-red-500/5 dark:bg-gradient-to-r dark:from-red-500/10 dark:to-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)] scale-[1.01] backdrop-blur-md' 
          : disabled 
            ? 'border-slate-205 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.04] backdrop-blur-sm'
    }`}
  >
    {checked && !locked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    
    <div className="flex items-start sm:items-center gap-4 w-full relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
        locked 
          ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10' 
          : checked 
            ? 'bg-gradient-to-br from-red-500 to-red-650 text-white shadow-lg shadow-red-500/20' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:scale-110'
      }`}>
        {Icon ? <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${checked || locked ? 'scale-110' : 'scale-100'}`} /> : (locked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />)}
      </div>
      
      <div className="text-left flex-1 pr-4">
        <div className="flex flex-col mb-1.5">
          {locked && (
            <span className="mb-2 inline-flex items-center self-start bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-805 dark:text-emerald-305 border border-emerald-500/20 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ★ {t ? t('requiredForA0') : 'Vyžadované pre A0'}
            </span>
          )}
          <span className={`font-bold text-base sm:text-lg block transition-colors duration-300 ${
            locked 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : checked 
                ? 'text-red-755 dark:text-white' 
                : 'text-slate-800 dark:text-slate-205'
          }`}>{label}</span>
        </div>
        {description && <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-405 leading-relaxed">{description}</p>}
      </div>
      
      {/* Checkbox na mobile zobrazený hore vedľa nadpisu, na desktope skrytý */}
      <div className={`sm:hidden w-6 h-6 mt-1 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-emerald-400/50 bg-emerald-50 dark:bg-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
          : checked 
            ? 'border-red-500 bg-red-500 scale-110' 
            : 'border-slate-355 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
    
    {/* Cena presunutá na samostatný riadok na mobile, na desktope vpravo */}
    <div className={`flex items-center justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t ${
      locked ? 'border-emerald-500/20' : 'border-slate-200 dark:border-white/5'
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
                ? 'text-base text-emerald-600 dark:text-emerald-305' 
                : price === 0 
                  ? 'text-sm text-emerald-600 dark:text-emerald-400' 
                  : 'text-base text-slate-650 dark:text-slate-405'
            }`}>
              {price === 0 ? 'V cene' : `+${price.toLocaleString()} €`}
            </span>
          </div>
        )}
      </div>
      
      {/* Checkbox na desktope zobrazený vpravo od ceny */}
      <div className={`hidden sm:flex w-6 h-6 rounded border-2 items-center justify-center transition-all duration-300 flex-shrink-0 ${
        locked 
          ? 'border-emerald-400/50 bg-emerald-50 dark:bg-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
          : checked 
            ? 'border-red-500 bg-red-500 scale-110' 
            : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950/50'
      }`}>
        {locked ? <Lock className="w-4 h-4 text-white" /> : checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  </button>
);

const CounterRow = ({ label, price, value, onChange, isAdmin, onPriceChange, icon: Icon }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl border border-slate-205/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:border-slate-350 dark:hover:border-white/10 transition-all duration-300 gap-4 backdrop-blur-md w-full relative overflow-hidden">
    {value > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
    
    <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1 min-w-0">
      {Icon && (
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          value > 0 ? 'bg-slate-800 dark:bg-white/10 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-550 dark:text-slate-400'
        }`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h4 className={`font-bold text-base sm:text-lg transition-colors duration-300 ${
          value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
        }`}>{label}</h4>
        {isAdmin && onPriceChange ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-slate-500">€</span>
            <input type="number" value={price} onChange={e => onPriceChange(Number(e.target.value))} className="w-16 text-xs sm:text-sm font-bold text-red-400 bg-slate-955 outline-none border border-red-500/30 rounded px-1 py-0.5" />
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-red-655 dark:text-red-400 font-bold mt-1">{price.toLocaleString()} € / ks</div>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-end">
      <button 
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))} 
        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-slate-300 active:scale-90 transition-all border border-slate-200 dark:border-white/10 backdrop-blur-sm"
      >
        -
      </button>
      <span className={`w-8 text-center font-black text-xl transition-colors duration-300 ${
        value > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
      }`}>{value}</span>
      <button 
        type="button"
        onClick={() => onChange(value + 1)} 
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:opacity-90 flex items-center justify-center font-bold active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
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
    'red': 'text-red-700 dark:text-red-400',
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
    <div className="lg:hidden text-red-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-red-500"></span>
      Krok {stepIdx + 1} z {totalSteps}
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{title}</h2>
        {description && <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base leading-relaxed">{description}</p>}
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

// ── Hlavný Komponent (ScrollSpy Dashboard) ────────────────────────────────────────────────

export default function ProstoHouseKonfigurator({ house, houseCode, dom: domProp }) {
  const { language, t: globalT } = useLanguage();
  const t = (key) => prostoHouseTranslations[language]?.[key] || prostoHouseTranslations['sk']?.[key] || globalT(key) || key;

  const urlParams = new URLSearchParams(window.location.search);
  const domIdFromUrl = urlParams.get('id');

  const { data: domFromDb } = useQuery({
    queryKey: [`dom-${houseCode}`, domIdFromUrl],
    queryFn: async () => {
      if (!domIdFromUrl) return null;
      const domy = await base44.entities.Dom.filter({ id: domIdFromUrl });
      return domy[0] || null;
    },
    enabled: !!domIdFromUrl && !domProp, staleTime: 0, cacheTime: 0, refetchOnMount: 'always'
  });

  const effectiveDom = domProp || domFromDb;
  const effectiveDomId = domProp?.id || domFromDb?.id || domIdFromUrl;

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me().catch(() => null) });
  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const hasExtension = house.options.extension && house.options.extension.length > 0;

  // Stavy konfigurátora
  const [customPrices, setCustomPrices] = useState({});
  const [typStavby, setTypStavby] = useState('rekreacna');

  const [mountingIdx, setMountingIdx] = useState(0);
  const [extensionIdx, setExtensionIdx] = useState(0);
  const [insulationIdx, setInsulationIdx] = useState(0);
  const [foundationIdx, setFoundationIdx] = useState(0);
  const [interiorIdx, setInteriorIdx] = useState(0);
  const [doorsIdx, setDoorsIdx] = useState(0);
  const [facadeIdx, setFacadeIdx] = useState(0);

  const [electricity, setElectricity] = useState(false);
  const [water, setWater] = useState(false);
  const [sanita, setSanita] = useState(false);
  const [boiler, setBoiler] = useState(false);
  const [heatPump, setHeatPump] = useState(false);
  const [recuperation, setRecuperation] = useState(false);
  const [windowLamination, setWindowLamination] = useState(false);
  const [windowTint, setWindowTint] = useState(false);
  const [roofWindows, setRoofWindows] = useState(0);
  const [fixWindows, setFixWindows] = useState(0);
  const [tiltWindowsBig, setTiltWindowsBig] = useState(0);
  const [tiltWindowsSmall, setTiltWindowsSmall] = useState(0);
  const [interiorDoorsCount, setInteriorDoorsCount] = useState(0);
  const [laminateFloors, setLaminateFloors] = useState(false);
  const [floorHeating, setFloorHeating] = useState(false);
  const [networks, setNetworks] = useState(false);
  const [engineering, setEngineering] = useState(false);
  const [projectant, setProjectant] = useState(false);
  const [revision, setRevision] = useState(true);
  const [realEstate, setRealEstate] = useState(false);
  const [landSearch, setLandSearch] = useState(false);
  const [financing, setFinancing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null);

  const handleShowOptionGallery = (type) => {
    if (!effectiveDom?.galerie?.length) {
      alert("Galéria nie je pre tento dom k dispozícii.");
      return;
    }
    const matchingGallery = effectiveDom.galerie.find(g => g.typ === type);
    if (matchingGallery?.fotky?.length) {
      setActiveLightbox({ images: matchingGallery.fotky, index: 0 });
    } else {
      const allPhotos = effectiveDom.galerie.flatMap(g => g.fotky || []);
      if (allPhotos.length) {
        setActiveLightbox({ images: allPhotos, index: 0 });
      } else {
        alert("Tento typ úpravy nemá priradené samostatné fotografie.");
      }
    }
  };

  const handleConsultWithKexo = () => {
    const selectedItemsList = buildSelectedItems();
    const itemsDescription = selectedItemsList
      .filter(item => item.section !== 'base')
      .map(item => `- ${item.name} (${item.price === 0 ? 'V cene' : `+${item.price.toLocaleString()} €`})`)
      .join('\n');
      
    const message = `Ahoj Kexo, chcem skonzultovať moju konfiguráciu domu **${house.name}** (${phCode}).
    
Základná cena: **${house.basePrice.toLocaleString()} €**
Celková cena s DPH: **${totalPrice.toLocaleString()} €**

Vybrané položky:
${itemsDescription || '- Len základná výbava'}

Môžeš mi k tejto konfigurácii niečo odporučiť, vysvetliť zateplenie pre A0 alebo pomôcť s financovaním?`;

    const event = new CustomEvent('openChatbotWithContext', { detail: { message } });
    window.dispatchEvent(event);
  };

  // ScrollSpy stav
  const [activeSection, setActiveSection] = useState(0);

  const sectionsConfig = [
    { id: 'section-0', title: 'Účel stavby', icon: Home },
    { id: 'section-1', title: 'Konštrukcia', icon: Hammer },
    { id: 'section-2', title: 'Okná a dvere', icon: DoorOpen },
    { id: 'section-3', title: 'Zateplenie', icon: Thermometer },
    { id: 'section-4', title: 'Interiér', icon: Layout },
    { id: 'section-5', title: 'Súhrn a služby', icon: CheckCircle }
  ];

  useEffect(() => {
    const handleScroll = () => {
      let currentIdx = 0;
      sectionsConfig.forEach((section, idx) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Offset 300px to trigger when it's reaching the top third of the screen
          if (rect.top <= 300) {
            currentIdx = idx;
          }
        }
      });
      setActiveSection(currentIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120; // Offset for sticky headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (domFromDb?.konfigurator_custom_ceny_prosto_house?.[houseCode]) {
      setCustomPrices(domFromDb.konfigurator_custom_ceny_prosto_house[houseCode]);
    }
  }, [domFromDb]);

  useEffect(() => {
    if (typStavby === 'rodinny_dom') {
      setInsulationIdx(2); setHeatPump(true); setRecuperation(true); setProjectant(true);
    } else {
      setInsulationIdx(0); setHeatPump(false); setRecuperation(false); setProjectant(false);
    }
  }, [typStavby]);

  const getPrice = (category, indexOrKey, defaultPrice) => {
    const key = `${category}-${indexOrKey}`;
    return customPrices[key] !== undefined ? customPrices[key] : defaultPrice;
  };

  const updatePrice = (category, indexOrKey, newPrice) => {
    const key = `${category}-${indexOrKey}`;
    setCustomPrices(prev => ({ ...prev, [key]: newPrice }));
  };

  const isA0Compliant = useMemo(() => {
    return house.options.insulation[insulationIdx]?.label.includes('250 mm') && heatPump && recuperation && projectant;
  }, [insulationIdx, heatPump, recuperation, projectant]);

  const totalPrice = useMemo(() => {
    let total = house.basePrice;
    total += getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx]?.price || 0);
    if (hasExtension) total += getPrice('extension', extensionIdx, house.options.extension[extensionIdx]?.price || 0);
    total += getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx]?.price || 0);
    total += getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx]?.price || 0);
    total += getPrice('interior', interiorIdx, house.options.interior[interiorIdx]?.price || 0);
    total += getPrice('doors', doorsIdx, house.options.doors[doorsIdx]?.price || 0);
    total += getPrice('facade', facadeIdx, house.options.facade[facadeIdx]?.price || 0);
    if (electricity) total += getPrice('addon', 'electricity', house.addons.electricity);
    if (water) total += getPrice('addon', 'water', house.addons.water);
    if (sanita) total += getPrice('addon', 'sanita', house.addons.sanita);
    if (boiler) total += getPrice('addon', 'boiler', house.addons.boiler);
    if (heatPump) total += getPrice('addon', 'heatPump', house.addons.heatPump);
    if (recuperation) total += getPrice('addon', 'recuperation', house.addons.recuperation);
    if (windowLamination) total += getPrice('addon', 'windowLamination', house.addons.windowLamination);
    if (windowTint) total += getPrice('addon', 'windowTint', house.addons.windowTint);
    total += roofWindows * getPrice('addon', 'roofWindow', house.addons.roofWindow);
    total += fixWindows * getPrice('addon', 'fixWindow', house.addons.fixWindow);
    total += tiltWindowsBig * getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig);
    total += tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall);
    total += interiorDoorsCount * getPrice('addon', 'interiorDoor', house.addons.interiorDoor);
    if (laminateFloors) total += getPrice('addon', 'laminateFloors', house.addons.laminateFloors);
    if (floorHeating) total += getPrice('addon', 'floorHeating', house.addons.floorHeating);
    if (networks) total += getPrice('addon', 'networks', house.addons.networks);
    if (engineering) total += getPrice('addon', 'engineering', house.addons.engineering);
    if (projectant) total += getPrice('addon', 'projectant', house.addons.projectant);
    if (revision) total += getPrice('addon', 'revision', house.addons.revision);
    return total;
  }, [mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
      electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
      roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount, laminateFloors,
      floorHeating, networks, engineering, projectant, revision, customPrices]);

  const buildSelectedItems = () => {
    const items = [];
    items.push({ name: house.name, price: house.basePrice, selected: true, section: "base" });
    if (mountingIdx > 0) items.push({ name: `Montáž: ${house.options.mounting[mountingIdx].label}`, price: getPrice('mounting', mountingIdx, house.options.mounting[mountingIdx].price), selected: true, section: "hruba" });
    if (hasExtension && extensionIdx > 0) items.push({ name: `Predĺženie: ${house.options.extension[extensionIdx].label}`, price: getPrice('extension', extensionIdx, house.options.extension[extensionIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Izolácia: ${house.options.insulation[insulationIdx].label}`, price: getPrice('insulation', insulationIdx, house.options.insulation[insulationIdx].price), selected: true, section: "hruba" });
    if (foundationIdx > 0) items.push({ name: `Základy: ${house.options.foundation[foundationIdx].label}`, price: getPrice('foundation', foundationIdx, house.options.foundation[foundationIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Vstupné dvere: ${house.options.doors[doorsIdx].label}`, price: getPrice('doors', doorsIdx, house.options.doors[doorsIdx].price), selected: true, section: "hruba" });
    items.push({ name: `Fasáda: ${house.options.facade[facadeIdx].label}`, price: getPrice('facade', facadeIdx, house.options.facade[facadeIdx].price), selected: true, section: "hruba" });
    if (interiorIdx > 0) items.push({ name: `Interiér: ${house.options.interior[interiorIdx].label}`, price: getPrice('interior', interiorIdx, house.options.interior[interiorIdx].price), selected: true, section: "holodom" });
    if (electricity) items.push({ name: "Elektroinštalácia", price: getPrice('addon', 'electricity', house.addons.electricity), selected: true, section: "holodom" });
    if (water) items.push({ name: "Voda a kanalizácia", price: getPrice('addon', 'water', house.addons.water), selected: true, section: "holodom" });
    if (sanita) items.push({ name: "Sanita", price: getPrice('addon', 'sanita', house.addons.sanita), selected: true, section: "holodom" });
    if (boiler) items.push({ name: "Bojler", price: getPrice('addon', 'boiler', house.addons.boiler), selected: true, section: "holodom" });
    if (heatPump) items.push({ name: "Tepelné čerpadlo", price: getPrice('addon', 'heatPump', house.addons.heatPump), selected: true, section: "kluc" });
    if (recuperation) items.push({ name: "Rekuperácia", price: getPrice('addon', 'recuperation', house.addons.recuperation), selected: true, section: "kluc" });
    if (laminateFloors) items.push({ name: "Laminátové podlahy", price: getPrice('addon', 'laminateFloors', house.addons.laminateFloors), selected: true, section: "kluc" });
    if (floorHeating) items.push({ name: "Podlahové kúrenie", price: getPrice('addon', 'floorHeating', house.addons.floorHeating), selected: true, section: "kluc" });
    if (windowLamination) items.push({ name: "Laminácia okien", price: getPrice('addon', 'windowLamination', house.addons.windowLamination), selected: true, section: "holodom" });
    if (windowTint) items.push({ name: "Tónované sklá", price: getPrice('addon', 'windowTint', house.addons.windowTint), selected: true, section: "holodom" });
    if (interiorDoorsCount > 0) items.push({ name: `Interiérové dvere (${interiorDoorsCount} ks)`, price: interiorDoorsCount * getPrice('addon', 'interiorDoor', house.addons.interiorDoor), selected: true, section: "holodom" });
    if (roofWindows > 0) items.push({ name: `Strešné okná (${roofWindows} ks)`, price: roofWindows * getPrice('addon', 'roofWindow', house.addons.roofWindow), selected: true, section: "hruba" });
    if (fixWindows > 0) items.push({ name: `Fixné okná (${fixWindows} ks)`, price: fixWindows * getPrice('addon', 'fixWindow', house.addons.fixWindow), selected: true, section: "hruba" });
    if (tiltWindowsBig > 0) items.push({ name: `Výklopné okná veľké (${tiltWindowsBig} ks)`, price: tiltWindowsBig * getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig), selected: true, section: "hruba" });
    if (tiltWindowsSmall > 0) items.push({ name: `Výklopné okná malé (${tiltWindowsSmall} ks)`, price: tiltWindowsSmall * getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall), selected: true, section: "hruba" });
    if (networks) items.push({ name: "Prípojky sietí", price: getPrice('addon', 'networks', house.addons.networks), selected: true, section: "docs" });
    if (engineering) items.push({ name: "Inžiniering", price: getPrice('addon', 'engineering', house.addons.engineering), selected: true, section: "docs" });
    if (projectant) items.push({ name: "Projektant", price: getPrice('addon', 'projectant', house.addons.projectant), selected: true, section: "docs" });
    if (revision) items.push({ name: "Revízie", price: getPrice('addon', 'revision', house.addons.revision), selected: true, section: "docs" });
    return items;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.target;
      const response = await base44.functions.invoke('odosliCenovuPonukuProstoHouse', {
        dom_id: effectiveDomId,
        klient_meno: form.name.value, klient_email: form.email.value,
        klient_telefon: form.phone.value, klient_adresa: form.city.value, klient_poznamka: form.note.value,
        selectedItems: buildSelectedItems(), totalPrice, language,
        montazHolodomu: mountingIdx > 0,
        izolaciaNavysenie: house.options.insulation[insulationIdx].label.includes('250') ? 'premium' : 'standard',
        zaklady: house.options.foundation[foundationIdx].label,
        vstupneDvere: house.options.doors[doorsIdx].label,
        elektroinstalacia: electricity, vodaKanalizacia: water, sanitaKomplet: sanita, bojler: boiler,
        tepelneCerpadlo: heatPump, rekuperacia: recuperation, pripojkaSiete: networks,
        stresneOkno: roofWindows, bocneOknoFixne: fixWindows, bocneOknoVyklopne90: tiltWindowsBig, bocneOknoVyklopne55: tiltWindowsSmall,
        povrchokaOkien: windowLamination, tonovaneSkla: windowTint,
        vonkajsiaFasada: facadeIdx === 1 ? 'suchana' : 'standard',
        interierFinis: house.options.interior[interiorIdx].label,
        vnutornePodlahy: laminateFloors, podlahovVykurovanie: floorHeating,
        interieroveDvere: interiorDoorsCount, inziniering: engineering, projektA0: projectant, revizna: revision, doprava: 0,
        predlzenie: hasExtension && extensionIdx > 0 ? house.options.extension[extensionIdx].label : 0,
        predajNehnutelnosti: realEstate, hladaniePozemku: landSearch, financneSluzby: financing
      });
      if (response?.data?.success) { alert('✓ Cenová ponuka bola úspešne odoslaná na váš email!'); setModalOpen(false); }
      else { alert('Chyba: ' + (response?.data?.error || 'Neznáma chyba')); }
    } catch (error) { alert('Chyba pri odosielaní: ' + error.message); }
    finally { setIsSubmitting(false); }
  };

  const konfigData = {
    mountingIdx, extensionIdx, insulationIdx, foundationIdx, interiorIdx, doorsIdx, facadeIdx,
    electricity, water, sanita, boiler, heatPump, recuperation, windowLamination, windowTint,
    roofWindows, fixWindows, tiltWindowsBig, tiltWindowsSmall, interiorDoorsCount,
    laminateFloors, floorHeating, networks, engineering, projectant, revision, typStavby, language
  };

  const phCode = houseCode.replace('ph0', 'PH-0').replace('ph', 'PH-');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen pb-40 lg:pb-32 font-['Outfit'] relative transition-colors duration-300 w-full max-w-full overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/5 dark:bg-red-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="w-full px-2 sm:px-4 py-8 lg:py-12 max-w-7xl mx-auto relative z-10">
        
        {/* Hlavička domu */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{house.name}</h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs px-3 py-1.5 rounded-full uppercase tracking-widest font-bold backdrop-blur-md">
              {phCode}
            </span>
            {isA0Compliant && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                A0 Certifikát
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start relative">
          
          {/* ĽAVÝ STĹPEC: Sticky Progress Menu (Len pre Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28">
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-sm dark:shadow-none">
              <h3 className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Postup konfigurácie
              </h3>
              
              <div className="space-y-3 relative">
                {/* Connecting line */}
                <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-slate-200 dark:bg-white/5" />
                
                {sectionsConfig.map((step, idx) => {
                  const isActive = activeSection === idx;
                  const isPassed = activeSection > idx;
                  return (
                    <button 
                      key={step.id}
                      onClick={() => scrollToSection(step.id)} 
                      className={`relative w-full text-left flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group z-10 ${isActive ? 'bg-gradient-to-r from-red-500/10 to-transparent shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-md ${
                        isActive 
                          ? 'bg-red-500 text-white scale-110 shadow-red-500/40' 
                          : isPassed 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                            : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5'
                      }`}>
                        {isPassed && !isActive ? <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <step.icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className={`font-black tracking-tight transition-colors ${
                          isActive 
                            ? 'text-slate-900 dark:text-white text-lg' 
                            : isPassed 
                              ? 'text-slate-700 dark:text-slate-300 text-base' 
                              : 'text-slate-400 dark:text-slate-550 text-base'
                        }`}>
                          {step.title}
                        </div>
                        <div className={`text-xs uppercase tracking-widest font-bold mt-0.5 transition-colors ${
                          isActive 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-slate-400 dark:text-slate-600'
                        }`}>
                          Krok {idx + 1}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Price Mini Summary in Sidebar */}
            <div className="mt-6 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-xl">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">{t('totalWithVAT')}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">{totalPrice.toLocaleString()} €</div>
              <button 
                onClick={() => setModalOpen(true)} 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition-all text-lg"
              >
                <span>{t('sendQuote')}</span>
                <Send className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleConsultWithKexo} 
                className="w-full mt-3 bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880] font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-base shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Konzultovať s Kexom</span>
              </button>
            </div>
          </div>

          {/* PRAVÝ STĹPEC: Plynulý formulár konfigurátora */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SEKCIA 1: Účel stavby */}
            <div id="section-0" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionBasicDecision')} description={t('sectionBasicDecisionDesc')} icon={Home} stepIdx={0} totalSteps={6} />
              
              <ConfiguratorRow
                label={t('sectionBasicDecision') || 'Účel stavby'}
                description={t('sectionBasicDecisionDesc') || 'Zvoľte, či plánujete stavbu využívať ako rodinný dom na trvalé bývanie (vyžaduje normu A0) alebo ako rekreačnú chatu.'}
                selectedValue={typStavby}
                onChange={setTypStavby}
                options={[
                  { value: 'rekreacna', label: t('recreationalBuilding'), price: 0 },
                  { value: 'rodinny_dom', label: t('familyHouseA0'), price: 0, isA0: true }
                ]}
                icon={Home}
              />
              <div className="mt-6">
                <A0StatusHint isA0Compliant={isA0Compliant} insulationIdx={insulationIdx} heatPump={heatPump} recuperation={recuperation} projectant={projectant} onGoToSection={() => {}} t={t} />
              </div>
            </div>

            {/* SEKCIA 2: Konštrukcia a Základy */}
            <div id="section-1" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionStructure')} description={t('sectionStructureDesc')} icon={Hammer} stepIdx={1} totalSteps={6} />
              <div className="space-y-6">
                {hasExtension && (
                  <ConfiguratorRow
                    label={t('houseExtension') || 'Predĺženie domu'}
                    description={t('houseExtensionDesc') || 'Možnosť predĺženia modulu pre získanie väčšieho obytného priestoru.'}
                    selectedValue={extensionIdx}
                    onChange={setExtensionIdx}
                    isAdmin={isAdmin}
                    onPriceChange={(key, val) => updatePrice('extension', key, val)}
                    options={house.options.extension.map((opt, i) => {
                      const labels = { 0: t('noExtension'), 1: '+1,2 m', 2: '+2,4 m', 3: '+3,6 m', 4: '+4,8 m' };
                      return {
                        value: i,
                        label: labels[i] || opt.label,
                        price: getPrice('extension', i, opt.price),
                        priceKey: i
                      };
                    })}
                    icon={Maximize}
                  />
                )}

                <ConfiguratorRow
                  label={t('foundations') || 'Zakladanie stavby'}
                  description={t('foundationsDesc') || 'Spôsob osadenia modulu na pozemok. V prípade klasických základov sa prispôsobíme typu terénu.'}
                  selectedValue={foundationIdx}
                  onChange={setFoundationIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('foundation', key, val)}
                  options={house.options.foundation.map((opt, i) => {
                    const labels = { 0: t('noFoundations'), 1: t('pilotsFootings'), 2: t('foundationSlab'), 3: t('stripFoundations') };
                    return {
                      value: i,
                      label: labels[i] || opt.label,
                      price: getPrice('foundation', i, opt.price),
                      priceKey: i
                    };
                  })}
                  icon={Layers}
                />

                <ConfiguratorRow
                  label={t('shellAssembly') || 'Montáž domu'}
                  description={t('shellAssemblyDesc') || 'Zvoľte, či si montáž zabezpečíte svojpomocne alebo profesionálne od nás.'}
                  selectedValue={mountingIdx}
                  onChange={setMountingIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('mounting', key, val)}
                  options={house.options.mounting.map((opt, i) => ({
                    value: i,
                    label: i === 0 ? t('noAssemblySelf') : t('withAssembly'),
                    price: getPrice('mounting', i, opt.price),
                    priceKey: i
                  }))}
                  icon={Wrench}
                />
              </div>
            </div>

            {/* SEKCIA 3: Okná a Dvere */}
            <div id="section-2" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionWindowsDoors')} description={t('sectionWindowsDoorsDesc')} icon={DoorOpen} stepIdx={2} totalSteps={6} />
              <div className="space-y-6">
                <ConfiguratorRow
                  label={t('entryDoors') || 'Vchodové dvere'}
                  description={t('entryDoorsDesc') || 'Zvoľte typ vchodových dverí s izolačnými vlastnosťami.'}
                  selectedValue={doorsIdx}
                  onChange={setDoorsIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('doors', key, val)}
                  options={house.options.doors.map((opt, i) => {
                    const labels = { 0: t('doorsStandard'), 1: t('doorsMetal2Locks'), 2: t('doorsPlasticMetal') };
                    return {
                      value: i,
                      label: labels[i] || opt.label,
                      price: getPrice('doors', i, opt.price),
                      priceKey: i
                    };
                  })}
                  icon={DoorOpen}
                />

                <div>
                  <SectionLabel label={t('additionalWindows')} color="blue" />
                  <div className="space-y-3">
                    {[
                      { l: t('roofWindow'), p: getPrice('addon', 'roofWindow', house.addons.roofWindow), v: roofWindows, s: setRoofWindows, k: 'roofWindow', i: Sun },
                      { l: t('fixedWindow'), p: getPrice('addon', 'fixWindow', house.addons.fixWindow), v: fixWindows, s: setFixWindows, k: 'fixWindow', i: Layout },
                      { l: t('tiltWindowBig'), p: getPrice('addon', 'tiltWindowBig', house.addons.tiltWindowBig), v: tiltWindowsBig, s: setTiltWindowsBig, k: 'tiltWindowBig', i: Layout },
                      { l: t('tiltWindowSmall'), p: getPrice('addon', 'tiltWindowSmall', house.addons.tiltWindowSmall), v: tiltWindowsSmall, s: setTiltWindowsSmall, k: 'tiltWindowSmall', i: Layout }
                    ].map((item, idx) => (
                      <CounterRow key={idx} icon={item.i} label={item.l} price={item.p} value={item.v} onChange={item.s} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', item.k, p)} />
                    ))}
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('windowModification') || "Úprava okien"} color="purple" />
                  <div className="space-y-3">
                    <AddonRow icon={Paintbrush} label={t('windowLamination')} price={getPrice('addon', 'windowLamination', house.addons.windowLamination)} checked={windowLamination} onChange={() => setWindowLamination(!windowLamination)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowLamination', p)} t={t} />
                    <AddonRow icon={SunDim} label={t('tintedGlass')} price={getPrice('addon', 'windowTint', house.addons.windowTint)} checked={windowTint} onChange={() => setWindowTint(!windowTint)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'windowTint', p)} t={t} />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 4: Zateplenie a Fasáda */}
            <div id="section-3" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionInsulationFacade')} description={t('sectionInsulationFacadeDesc')} icon={Thermometer} stepIdx={3} totalSteps={6} />
              <div className="space-y-6">
                <ConfiguratorRow
                  label={t('insulationType') || 'Hrúbka zateplenia'}
                  description={t('insulationTypeDesc') || 'Hrúbka minerálnej izolácie v obvodových stenách domu pre energetický certifikát.'}
                  selectedValue={insulationIdx}
                  onChange={setInsulationIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('insulation', key, val)}
                  options={house.options.insulation.map((opt, i) => {
                    const labels = { 0: t('yearRound150mm'), 1: t('enhanced200mm'), 2: t('premium250mm'), 3: t('extra300mm') };
                    return {
                      value: i,
                      label: labels[i] || opt.label,
                      price: getPrice('insulation', i, opt.price),
                      priceKey: i,
                      isA0: opt.label.includes('250 mm')
                    };
                  })}
                  icon={Thermometer}
                />

                <ConfiguratorRow
                  label={t('facade') || 'Vonkajšia fasáda'}
                  description={t('facadeDesc') || 'Vyberte si štýl vonkajšieho obkladu a fasády.'}
                  selectedValue={facadeIdx}
                  onChange={setFacadeIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('facade', key, val)}
                  onShowGallery={() => handleShowOptionGallery(facadeIdx === 0 ? 'exterier_drevo_plech' : 'exterier_murovka')}
                  options={house.options.facade.map((opt, i) => ({
                    value: i,
                    label: i === 0 ? t('facadeStandard') : t('facadeStucco'),
                    price: getPrice('facade', i, opt.price),
                    priceKey: i
                  }))}
                  icon={Paintbrush}
                />
              </div>
            </div>

            {/* SEKCIA 5: Interiér a Siete */}
            <div id="section-4" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionInteriorNets')} description={t('sectionInteriorNetsDesc')} icon={Layout} stepIdx={4} totalSteps={6} />
              <div className="space-y-6">
                <ConfiguratorRow
                  label={t('interiorFinish') || 'Vnútorná úprava'}
                  description={t('interiorFinishDesc') || 'Zvoľte finálny vzhľad stien v interiéri Vášho domu.'}
                  selectedValue={interiorIdx}
                  onChange={setInteriorIdx}
                  isAdmin={isAdmin}
                  onPriceChange={(key, val) => updatePrice('interior', key, val)}
                  onShowGallery={interiorIdx > 0 ? () => handleShowOptionGallery(interiorIdx === 1 ? 'interier_drevo' : 'interier_sadrokarton') : undefined}
                  options={house.options.interior.map((opt, i) => {
                    const labels = { 0: t('noInterior'), 1: t('interiorWood'), 2: t('interiorDrywall') };
                    return {
                      value: i,
                      label: labels[i] || opt.label,
                      price: getPrice('interior', i, opt.price),
                      priceKey: i
                    };
                  })}
                  icon={Layout}
                />

                <div>
                  <SectionLabel label={t('floorsAndDoors') || "Podlahy a Interiérové Dvere"} color="amber" />
                  <div className="space-y-3">
                    <CounterRow icon={DoorOpen} label={t('interiorDoorsCount')} price={getPrice('addon', 'interiorDoor', house.addons.interiorDoor)} value={interiorDoorsCount} onChange={setInteriorDoorsCount} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'interiorDoor', p)} />
                    <AddonRow icon={Layers} label={t('laminateFloors')} price={getPrice('addon', 'laminateFloors', house.addons.laminateFloors)} checked={laminateFloors} onChange={() => setLaminateFloors(!laminateFloors)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'laminateFloors', p)} t={t} />
                    <AddonRow icon={Flame} label={t('floorHeating')} price={getPrice('addon', 'floorHeating', house.addons.floorHeating)} checked={floorHeating} onChange={() => setFloorHeating(!floorHeating)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'floorHeating', p)} t={t} />
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('pipes')} color="gray" />
                  <div className="space-y-3">
                    <AddonRow icon={Zap} label={t('electricalWiring')} price={getPrice('addon', 'electricity', house.addons.electricity)} checked={electricity} onChange={() => setElectricity(!electricity)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'electricity', p)} t={t} />
                    <AddonRow icon={Droplet} label={t('waterDrainage')} price={getPrice('addon', 'water', house.addons.water)} checked={water} onChange={() => setWater(!water)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'water', p)} t={t} />
                    <AddonRow icon={Droplet} label={t('sanitary')} price={getPrice('addon', 'sanita', house.addons.sanita)} checked={sanita} onChange={() => setSanita(!sanita)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'sanita', p)} t={t} />
                    <AddonRow icon={Flame} label={t('boiler')} price={getPrice('addon', 'boiler', house.addons.boiler)} checked={boiler} onChange={() => setBoiler(!boiler)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'boiler', p)} t={t} />
                  </div>
                </div>
                <div>
                  <SectionLabel label={t('a0Standard')} color="green" />
                  <div className="space-y-3">
                    <AddonRow icon={Sun} label={t('heatPump')} price={getPrice('addon', 'heatPump', house.addons.heatPump)} checked={heatPump} onChange={() => setHeatPump(!heatPump)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'heatPump', p)} t={t} />
                    <AddonRow icon={Wind} label={t('recuperation')} price={getPrice('addon', 'recuperation', house.addons.recuperation)} checked={recuperation} onChange={() => setRecuperation(!recuperation)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'recuperation', p)} t={t} />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCIA 6: Služby a Dokumentácia */}
            <div id="section-5" className="scroll-mt-28">
              <BigSectionHeader title={t('sectionSummaryServices')} description={t('sectionSummaryServicesDesc')} icon={CheckCircle} stepIdx={5} totalSteps={6} />
              
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 lg:p-8 rounded-3xl backdrop-blur-md mb-12 shadow-sm dark:shadow-none">
                <SectionLabel label={t('documentation')} color="gray" />
                <div className="space-y-3 mb-10">
                  <AddonRow icon={FileText} label={t('projectant')} price={getPrice('addon', 'projectant', house.addons.projectant)} checked={projectant} onChange={() => setProjectant(!projectant)} locked={typStavby === 'rodinny_dom'} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'projectant', p)} t={t} />
                  <AddonRow icon={Settings} label={t('engineering')} description={t('engineeringDesc')} price={getPrice('addon', 'engineering', house.addons.engineering)} checked={engineering} onChange={() => setEngineering(!engineering)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'engineering', p)} t={t} />
                  <AddonRow icon={CheckCircle} label={t('revisions')} price={getPrice('addon', 'revision', house.addons.revision)} checked={revision} onChange={() => {}} disabled={true} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'revision', p)} t={t} />
                  <AddonRow icon={Zap} label={t('networkConnections')} price={getPrice('addon', 'networks', house.addons.networks)} checked={networks} onChange={() => setNetworks(!networks)} isAdmin={isAdmin} onPriceChange={(p) => updatePrice('addon', 'networks', p)} t={t} />
                </div>

                <SectionLabel label={t('freeServices')} color="gray" />
                <div className="space-y-3 mb-10">
                  <AddonRow icon={Home} label={t('realEstate')} price={0} checked={realEstate} onChange={() => setRealEstate(!realEstate)} t={t} />
                  <AddonRow icon={Sun} label={t('landSearch')} price={0} checked={landSearch} onChange={() => setLandSearch(!landSearch)} t={t} />
                  <AddonRow icon={FileText} label={t('financing')} price={0} checked={financing} onChange={() => setFinancing(!financing)} t={t} />
                </div>
                
                <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">{t('finalConfigurationSummary') || t('configurationSummary')}</h3>
                  <ProstoHouseSummary
                    house={house} t={t} isA0Compliant={isA0Compliant} totalPrice={totalPrice} onSendQuote={() => setModalOpen(true)}
                    mountingIdx={mountingIdx} extensionIdx={extensionIdx} insulationIdx={insulationIdx} foundationIdx={foundationIdx}
                    interiorIdx={interiorIdx} doorsIdx={doorsIdx} facadeIdx={facadeIdx}
                    electricity={electricity} water={water} sanita={sanita} boiler={boiler}
                    heatPump={heatPump} recuperation={recuperation} windowLamination={windowLamination} windowTint={windowTint}
                    roofWindows={roofWindows} fixWindows={fixWindows} tiltWindowsBig={tiltWindowsBig} tiltWindowsSmall={tiltWindowsSmall}
                    interiorDoorsCount={interiorDoorsCount} laminateFloors={laminateFloors} floorHeating={floorHeating}
                    networks={networks} engineering={engineering} projectant={projectant} revision={revision}
                    getPrice={getPrice}
                    hideSendButton={true}
                  />
                  <div className="mt-8">
                    <button 
                      onClick={() => setModalOpen(true)} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-95 transition-all text-xl"
                    >
                      <span>{t('sendQuote')} na sumu {totalPrice.toLocaleString()} €</span>
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Galéria na záver */}
              {effectiveDom && (
                <div className="mb-12">
                  <BigSectionHeader title={t('sectionGalleryPlans')} description={t('sectionGalleryPlansDesc')} icon={Eye} />
                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-sm dark:shadow-none">
                    <KonfiguratorGaleria dom={effectiveDom} facadeIdx={facadeIdx} interiorIdx={interiorIdx} />
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* MOBILNÝ STICKY FOOTER (Zobrazený len na malých obrazovkách, na Desktope je skrytý kvôli sidebaru) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 text-left">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{t('totalWithVAT')}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalPrice.toLocaleString()} €</div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button 
              onClick={handleConsultWithKexo} 
              className="bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880] font-bold p-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all"
              title="Konzultovať s Kexom"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setModalOpen(true)} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
            >
              <span className="hidden sm:inline">{t('sendQuote')}</span>
              <Send className="w-5 h-5 sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Option Lookbook Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightbox(null)}
        >
          <button onClick={() => setActiveLightbox(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1000] active:scale-90">
            <X className="w-6 h-6" />
          </button>
          {activeLightbox.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })); }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1000] active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })); }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1000] active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={activeLightbox.images[activeLightbox.index]}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
          {activeLightbox.images.length > 1 && (
            <div className="absolute bottom-4 text-white/60 text-sm">
              {activeLightbox.index + 1} / {activeLightbox.images.length}
            </div>
          )}
        </div>
      )}

      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} t={t} />
      <ProstoHousePriceSaver isAdmin={isAdmin} customPrices={customPrices} domId={effectiveDomId} houseCode={houseCode} />
    </div>
  );
}