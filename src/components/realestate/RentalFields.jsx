import React from "react";
import { KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const MIN_DOBY = [
  ["bez_obmedzenia", "Bez obmedzenia"],
  ["3_mesiace", "Minimálne 3 mesiace"],
  ["6_mesiacov", "Minimálne 6 mesiacov"],
  ["1_rok", "Minimálne 1 rok"],
  ["2_roky", "Minimálne 2 roky"],
];

const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-sky-400 focus:outline-none";
const selectCls = "bg-slate-950 border-slate-800 text-slate-200 text-xs rounded-xl h-10 w-full";

export default function RentalFields({ form, onChange }) {
  const set = (key) => (val) => onChange({ ...form, [key]: val?.target ? val.target.value : val });

  return (
    <div className="bg-slate-950 border border-sky-500/25 rounded-2xl p-4 space-y-3">
      <p className="text-sky-300 font-bold flex items-center gap-1.5 text-xs">
        <KeyRound className="w-3.5 h-3.5" /> Podmienky prenájmu
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-slate-400 block mb-1">Depozit / kaucia (€)</label>
          <input type="number" min="0" placeholder="napr. 1200" value={form.depozit} onChange={set("depozit")} className={inputCls} />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Minimálna doba prenájmu</label>
          <Select value={form.min_doba_najmu} onValueChange={set("min_doba_najmu")}>
            <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {MIN_DOBY.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Voľné od</label>
          <input type="date" value={form.volne_od} onChange={set("volne_od")} className={inputCls} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={form.energie_v_cene}
          onChange={(e) => onChange({ ...form, energie_v_cene: e.target.checked })}
          className="w-4 h-4 rounded accent-sky-500"
        />
        Energie a poplatky sú zahrnuté v cene nájmu
      </label>

      <div>
        <label className="text-slate-400 block mb-1">Ďalšie podmienky (voliteľné)</label>
        <textarea
          rows={2}
          placeholder="napr. bez domácich zvierat, nefajčiari, max. 3 osoby, nájom platený k 1. dňu mesiaca..."
          value={form.podmienky_prenajmu}
          onChange={set("podmienky_prenajmu")}
          className={inputCls}
        />
      </div>
    </div>
  );
}