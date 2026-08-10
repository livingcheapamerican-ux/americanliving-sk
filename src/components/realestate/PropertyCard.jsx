import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Maximize, Bed, Home, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYP_LABELS = {
  modularny: "Modulárny dom",
  mobilny: "Mobilný dom",
  montovany: "Montovaný dom",
};

export default function PropertyCard({ dom, aiReason, onInterest }) {
  const detailUrl = dom.slug ? `/detail-domu?slug=${dom.slug}` : `/detail-domu?id=${dom.id}`;

  return (
    <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all group flex flex-col justify-between shadow-lg">
      <div>
        <Link to={detailUrl} className="block relative h-48 overflow-hidden">
          <img
            src={dom.hlavny_obrazok}
            alt={dom.nazov}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
          {dom.popularny && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-slate-950/80 text-amber-300 border border-amber-500/30 text-[10px] backdrop-blur-md">
                🔥 Populárny model
              </Badge>
            </div>
          )}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-emerald-500/90 text-slate-950 font-black text-xs">
              od {Math.round(dom.zakladna_cena).toLocaleString("sk-SK")} €
            </Badge>
          </div>
        </Link>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">
              {TYP_LABELS[dom.typ_domu] || "Rodinný dom"} • {dom.vyrobca}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
              <Zap className="w-3 h-3" /> A0
            </span>
          </div>
          <Link to={detailUrl}>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 hover:text-amber-300 transition-colors">
              {dom.nazov}
            </h3>
          </Link>

          {aiReason && (
            <p className="text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-1.5 leading-snug">
              ✨ {aiReason}
            </p>
          )}

          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-xl text-[10px] font-mono text-slate-300 border border-slate-800 text-center">
            <div><Maximize className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{dom.zastavana_plocha} m²</div>
            <div><Bed className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{dom.pocet_izieb || "–"} izby</div>
            <div><Home className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{dom.uzitkova_plocha ? `${dom.uzitkova_plocha} m² úž.` : "–"}</div>
          </div>

          {dom.popis && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{dom.popis}</p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <Button
          onClick={() => onInterest(dom)}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 py-2.5"
        >
          Mám záujem / Obhliadka <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <Link to={detailUrl} className="block">
          <Button variant="outline" className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs rounded-xl py-2">
            Detail domu &amp; konfigurátor
          </Button>
        </Link>
      </div>
    </div>
  );
}