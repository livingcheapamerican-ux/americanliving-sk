import React from "react";
import { Filter, Home, Search, LayoutGrid, Hammer, Caravan, Building2, TreePine, Boxes, Euro, Square, Zap, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSection from "./FilterSection";

export default function CatalogFilterPanel({
  t,
  hladanieInput,
  setHladanieInput,
  vyrobcovia = ["Ticab house", "Prosto House"],
  vyrobcaFilter = [],
  setVyrobcaFilter,
  typFilter = [],
  setTypFilter,
  cenoveRozpatie = [0, 300000],
  setCenoveRozpatie,
  pocetIziebFilter = [],
  setPocetIziebFilter,
  moduloveDomyFilter = 'all',
  setModuloveDomyFilter,
  pocetModulovFilter = [],
  setPocetModulovFilter,
  domy = [],
  plocharozsah = [0, 500],
  setPlocharozsah,
  uzitkovaRozsah = [0, 500],
  setUzitkovaRozsah,
  showAdvancedFilters = false,
  setShowAdvancedFilters,
  energyCert = 'all',
  setEnergyCert,
  resetFilters,
  totalCount = 0,
  publicCount = 0,
  isMobile = false,
  onCloseMobile
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header na desktope */}
      {!isMobile && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">{t('filters')}</h2>
        </div>
      )}

      {/* Vyhľadávanie */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
          <Search className="w-3 h-3 text-muted-foreground" />
          {t('search')}
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={t('namePlaceholder')}
            value={hladanieInput}
            onChange={(e) => setHladanieInput(e.target.value)}
            className="pl-8 h-9 text-sm bg-background border-border text-foreground rounded-xl"
          />
        </div>
      </div>

      {/* Výrobca */}
      <FilterSection title={t('manufacturer')} icon={Home} iconClass="text-red-500" badge={vyrobcaFilter.length}>
        <div className="grid grid-cols-1 gap-1.5">
          {vyrobcovia.map((v) => {
            const isSelected = vyrobcaFilter.includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setVyrobcaFilter(vyrobcaFilter.filter((x) => x !== v));
                  } else {
                    setVyrobcaFilter([...vyrobcaFilter, v]);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className={`w-3.5 h-3.5 ${isSelected ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs">{v}</span>
                </div>
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Typ domu */}
      <FilterSection title={t('type')} icon={LayoutGrid} iconClass="text-amber-500" badge={typFilter.length}>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { value: "modularny", label: t('modularType'), icon: LayoutGrid, color: "amber" },
            { value: "montovany", label: t('prefabType'), icon: Hammer, color: "orange" },
            { value: "mobilny", label: t('mobileType'), icon: Caravan, color: "teal" }
          ].map((typ) => {
            const Icon = typ.icon;
            const isSelected = typFilter.includes(typ.value);
            return (
              <button
                key={typ.value}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setTypFilter(typFilter.filter((x) => x !== typ.value));
                  } else {
                    setTypFilter([...typFilter, typ.value]);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs">{typ.label}</span>
                </div>
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Cenové rozpätie */}
      <div className="bg-background/80 border border-emerald-500/30 rounded-xl p-3 shadow-sm">
        <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Euro className="w-3.5 h-3.5 text-emerald-500" />
            {t('priceRange')}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            do {cenoveRozpatie[1].toLocaleString('sk-SK')} €
          </span>
        </label>
        <Slider
          min={0}
          max={300000}
          step={5000}
          value={[cenoveRozpatie[1]]}
          onValueChange={([val]) => setCenoveRozpatie([0, val])}
          className="my-3"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0 €</span>
          <span>150 000 €</span>
          <span>300 000 €</span>
        </div>
      </div>

      {/* Počet izieb */}
      <div className="bg-background/80 border border-blue-500/30 rounded-xl p-3 shadow-sm">
        <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
          <Home className="w-3.5 h-3.5 text-blue-500" />
          {t('numberOfRooms')}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((pocet) => {
            const isSelected = pocetIziebFilter.includes(pocet);
            return (
              <button
                key={pocet}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setPocetIziebFilter(pocetIziebFilter.filter((x) => x !== pocet));
                  } else {
                    setPocetIziebFilter([...pocetIziebFilter, pocet]);
                  }
                }}
                className={`py-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white font-black border-blue-600 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs font-bold'
                }`}
              >
                {pocet === 4 ? '4+' : pocet}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modulové domy - Ticabhouse filter */}
      <div className="bg-background/80 border border-primary/30 dark:border-red-500/30 rounded-xl p-3 shadow-sm">
        <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
          <Boxes className="w-3.5 h-3.5 text-red-500" />
          {t('modularHomesFilter')}
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { value: 'all', label: t('all'), icon: Boxes },
            { value: '1modul', label: t('oneModularHouses'), icon: Home },
            { value: 'viacmodulov', label: t('multiModularHouses'), icon: Building2 }
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = moduloveDomyFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setModuloveDomyFilter(opt.value)}
                className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs">{opt.label}</span>
                </div>
                {isSelected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zastavaná plocha */}
      <div className="bg-background/80 border border-border rounded-xl p-3 shadow-sm">
        <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {t('builtAreaFilter')}
          </span>
          <span className="text-xs font-bold text-foreground">
            do {plocharozsah[1]} m²
          </span>
        </label>
        <Slider
          min={0}
          max={500}
          step={5}
          value={[plocharozsah[1]]}
          onValueChange={([val]) => setPlocharozsah([0, val])}
          className="my-3"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0 m²</span>
          <span>250 m²</span>
          <span>500 m²</span>
        </div>
      </div>

      {/* Pokročilé filtre */}
      {showAdvancedFilters && (
        <div className="space-y-3 pt-2 border-t border-border">
          {/* Úžitková plocha */}
          <div className="bg-background/80 border border-purple-500/30 rounded-xl p-3 shadow-sm">
            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                {t('usableAreaFilter')}
              </span>
              <span className="text-xs font-bold text-foreground">
                do {uzitkovaRozsah[1]} m²
              </span>
            </label>
            <Slider
              min={0}
              max={500}
              step={5}
              value={[uzitkovaRozsah[1]]}
              onValueChange={([val]) => setUzitkovaRozsah([0, val])}
              className="my-3"
            />
          </div>

          {/* Energetický certifikát */}
          <div className="bg-background/80 border border-green-500/30 rounded-xl p-3 shadow-sm">
            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-green-500" />
              {t('energyCertificate')}
            </label>
            <Select value={energyCert} onValueChange={setEnergyCert}>
              <SelectTrigger className="h-9 text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="a0">{t('energyClassA0')}</SelectItem>
                <SelectItem value="no">{t('energyClassNone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tlačidlo na rozbalenie pokročilých */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs h-8 font-bold text-muted-foreground hover:text-foreground"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        {showAdvancedFilters ? `− ${t('lessFilters')}` : `+ ${t('advancedFilters')}`}
      </Button>

      {/* Resetovať všetky filtre */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs h-9 font-bold rounded-xl border-dashed"
        onClick={resetFilters}
      >
        {t('reset')}
      </Button>

      {/* Štatistika výsledkov */}
      {!isMobile && (
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-black text-primary">{totalCount}</span> {t('outOf')} {publicCount} {t('houses')}
          </p>
        </div>
      )}

      {/* Ak je na mobile, veľké tlačidlo na zatvorenie / aplikovanie */}
      {isMobile && (
        <div className="sticky bottom-0 pt-3 pb-1 bg-gradient-to-t from-card via-card to-transparent">
          <Button
            onClick={onCloseMobile}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <span>Zobraziť {totalCount} {t('houses')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
