import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const selectCls = "bg-slate-900 border-slate-700 text-slate-200 text-xs rounded-xl h-10 w-full";

export default function FilterBar({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const active = filters.typ !== "all" || filters.maxCena !== "all" || filters.minIzby !== "all";

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold shrink-0">
        <SlidersHorizontal className="w-4 h-4 text-amber-400" />
        Filtre:
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        <Select value={filters.typ} onValueChange={(v) => set("typ", v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Typ domu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky typy domov</SelectItem>
            <SelectItem value="modularny">Modulárne domy</SelectItem>
            <SelectItem value="mobilny">Mobilné domy</SelectItem>
            <SelectItem value="montovany">Montované domy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.maxCena} onValueChange={(v) => set("maxCena", v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Cena" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bez limitu ceny</SelectItem>
            <SelectItem value="50000">do 50 000 €</SelectItem>
            <SelectItem value="100000">do 100 000 €</SelectItem>
            <SelectItem value="150000">do 150 000 €</SelectItem>
            <SelectItem value="200000">do 200 000 €</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.minIzby} onValueChange={(v) => set("minIzby", v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Počet izieb" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ľubovoľný počet izieb</SelectItem>
            <SelectItem value="2">2+ izby</SelectItem>
            <SelectItem value="3">3+ izby</SelectItem>
            <SelectItem value="4">4+ izby</SelectItem>
            <SelectItem value="5">5+ izieb</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {active && (
        <Button
          variant="ghost"
          onClick={() => onChange({ typ: "all", maxCena: "all", minIzby: "all" })}
          className="text-slate-400 hover:text-white text-xs h-10 rounded-xl shrink-0"
        >
          <X className="w-3.5 h-3.5 mr-1" /> Zrušiť filtre
        </Button>
      )}
    </div>
  );
}