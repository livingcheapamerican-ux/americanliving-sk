import React from "react";
import { TrendingUp, Home, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fmt = (n) => Math.round(n).toLocaleString("sk-SK");

export default function OdhadResult({ odhad, plocha }) {
  const stred = (odhad.odhad_min + odhad.odhad_max) / 2;
  const zaM2 = plocha ? stred / Number(plocha) : null;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-emerald-500/15 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-2">
        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
          Orientačný odhad trhovej ceny
        </Badge>
        <p className="text-2xl md:text-3xl font-black text-white">
          {fmt(odhad.odhad_min)} – {fmt(odhad.odhad_max)} €
        </p>
        {zaM2 && (
          <p className="text-xs text-slate-400 font-mono">
            približne {fmt(zaM2)} € / m² · stredná hodnota {fmt(stred)} €
          </p>
        )}
      </div>

      {odhad.komentar && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">{odhad.komentar}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {odhad.vyvoj_trhu && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1.5">
            <p className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Vývoj ceny v lokalite
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{odhad.vyvoj_trhu}</p>
          </div>
        )}
        {odhad.faktory?.length > 0 && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-1.5">
            <p className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Čo cenu najviac ovplyvňuje
            </p>
            <ul className="text-xs text-slate-300 space-y-1">
              {odhad.faktory.map((f, i) => (
                <li key={i} className="flex gap-1.5"><span className="text-purple-400">•</span>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        Odhad je orientačný, vypočítaný AI na základe parametrov nehnuteľnosti a situácie na slovenskom trhu.
        Presnú cenu určí až obhliadka a znalecký posudok.
      </p>
    </div>
  );
}