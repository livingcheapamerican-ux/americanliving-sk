import React from "react";
import { MapPin, Maximize, Bed, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KATEGORIA_LABELS = {
  byt: "Byt",
  rodinny_dom: "Rodinný dom",
  pozemok: "Pozemok",
  chata: "Chata / rekreácia",
  komercny: "Komerčný priestor",
  iny: "Iná nehnuteľnosť",
};

export default function ListingCard({ listing, aiReason, onInterest }) {
  const jePrenajom = listing.typ_ponuky === "prenajom";

  return (
    <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden hover:border-purple-500/40 transition-all group flex flex-col justify-between shadow-lg">
      <div>
        <div className="relative h-48 overflow-hidden bg-slate-950">
          {listing.fotky?.[0] ? (
            <img
              src={listing.fotky[0]}
              alt={listing.nazov}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 text-4xl">🏠</div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={`text-[10px] font-black backdrop-blur-md ${jePrenajom ? "bg-sky-500/90 text-slate-950" : "bg-purple-500/90 text-white"}`}>
              {jePrenajom ? "PRENÁJOM" : "PREDAJ"}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-emerald-500/90 text-slate-950 font-black text-xs">
              {Math.round(listing.cena).toLocaleString("sk-SK")} €{jePrenajom ? " / mes." : ""}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">
              {KATEGORIA_LABELS[listing.kategoria] || "Nehnuteľnosť"}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <User className="w-3 h-3" /> {listing.zdroj === "agent" ? "Agent" : "Majiteľ"}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{listing.nazov}</h3>

          {aiReason && (
            <p className="text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-1.5 leading-snug">
              ✨ {aiReason}
            </p>
          )}

          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-xl text-[10px] font-mono text-slate-300 border border-slate-800 text-center">
            <div><MapPin className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{listing.mesto}</div>
            <div><Maximize className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{listing.plocha ? `${listing.plocha} m²` : "–"}</div>
            <div><Bed className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{listing.pocet_izieb ? `${listing.pocet_izieb} izby` : "–"}</div>
          </div>

          {listing.popis && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{listing.popis}</p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button
          onClick={() => onInterest(listing)}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 py-2.5"
        >
          Mám záujem <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}