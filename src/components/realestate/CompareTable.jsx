import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fmt = (n) => (n || n === 0 ? Math.round(n).toLocaleString("sk-SK") : "–");

const MIN_DOBA_LABEL = {
  bez_obmedzenia: "Bez obmedzenia",
  "3_mesiace": "min. 3 mesiace",
  "6_mesiacov": "min. 6 mesiacov",
  "1_rok": "min. 1 rok",
  "2_roky": "min. 2 roky",
};

// Zjednotí dom aj inzerát do rovnakej štruktúry pre porovnanie
const normalize = (item) => {
  if (item.__kind === "dom") {
    return {
      id: item.id,
      nazov: item.nazov,
      typ: "Nový dom American Living",
      foto: item.hlavny_obrazok,
      cena: item.zakladna_cena,
      cenaLabel: "Cena od",
      lokalita: item.vyrobca,
      lokalitaLabel: "Výrobca",
      plocha: item.uzitkova_plocha || item.zastavana_plocha,
      izby: item.pocet_izieb,
      extra: [
        ["Zastavaná plocha", item.zastavana_plocha ? `${item.zastavana_plocha} m²` : "–"],
        ["Typ stavby", item.typ_domu === "modularny" ? "Modulárny" : item.typ_domu === "mobilny" ? "Mobilný" : "Montovaný"],
        ["Celoročné bývanie", item.celorocny ? "Áno" : "Nie"],
      ],
    };
  }
  const jePrenajom = item.typ_ponuky === "prenajom";
  return {
    id: item.id,
    nazov: item.nazov,
    typ: jePrenajom ? "Prenájom" : "Predaj",
    foto: item.fotky?.[0],
    cena: item.cena,
    cenaLabel: jePrenajom ? "Nájom / mesiac" : "Cena",
    lokalita: item.mesto,
    lokalitaLabel: "Lokalita",
    plocha: item.plocha,
    izby: item.pocet_izieb,
    extra: jePrenajom
      ? [
          ["Depozit", item.depozit ? `${fmt(item.depozit)} €` : "–"],
          ["Energie v cene", item.energie_v_cene ? "Áno" : "Nie"],
          ["Doba prenájmu", MIN_DOBA_LABEL[item.min_doba_najmu] || "–"],
        ]
      : [
          ["Inzerent", item.zdroj === "agent" ? "Agent" : "Majiteľ"],
          ["Cena za m²", item.plocha ? `${fmt(item.cena / item.plocha)} €` : "–"],
          ["Voľné od", item.volne_od ? new Date(item.volne_od).toLocaleDateString("sk-SK") : "–"],
        ],
  };
};

export default function CompareTable({ items, onRemove, onClose }) {
  const rows = items.map(normalize);
  const ceny = rows.map(r => r.cena).filter(Boolean);
  const najnizsiaCena = ceny.length > 1 ? Math.min(...ceny) : null;
  const plochy = rows.map(r => r.plocha).filter(Boolean);
  const najvacsiaPlocha = plochy.length > 1 ? Math.max(...plochy) : null;

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto mt-20 md:mt-24 bg-slate-900 border border-amber-500/30 rounded-3xl p-4 md:p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 z-10" aria-label="Zavrieť porovnanie">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-10">
          <h2 className="text-lg font-black text-white">Porovnanie ({rows.length})</h2>
          <p className="text-xs text-slate-400">Najnižšia cena a najväčšia plocha sú vyznačené zelenou.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="text-left text-slate-500 font-mono font-normal p-2 w-32 align-bottom">Parameter</th>
                {rows.map((r) => (
                  <th key={r.id} className="p-2 align-bottom min-w-[150px]">
                    <div className="space-y-2 text-left">
                      <div className="h-24 rounded-xl overflow-hidden bg-slate-950 relative">
                        {r.foto ? (
                          <img src={r.foto} alt={r.nazov} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-slate-700">🏠</div>
                        )}
                        <button
                          onClick={() => onRemove(r.id)}
                          className="absolute top-1 right-1 bg-slate-950/80 rounded-full p-1 text-slate-300 hover:text-white"
                          aria-label={`Odstrániť ${r.nazov} z porovnania`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <Badge className="bg-slate-800 text-slate-300 text-[9px] font-normal">{r.typ}</Badge>
                      <p className="text-white font-bold leading-snug line-clamp-2">{r.nazov}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-t border-slate-800">
                <td className="p-2 text-slate-500">Cena</td>
                {rows.map((r) => (
                  <td key={r.id} className={`p-2 font-bold ${r.cena === najnizsiaCena ? "text-emerald-400" : "text-white"}`}>
                    {fmt(r.cena)} €
                    <span className="block text-[10px] text-slate-500 font-normal">{r.cenaLabel}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-800">
                <td className="p-2 text-slate-500">Plocha</td>
                {rows.map((r) => (
                  <td key={r.id} className={`p-2 ${r.plocha === najvacsiaPlocha ? "text-emerald-400 font-bold" : "text-slate-200"}`}>
                    {r.plocha ? `${r.plocha} m²` : "–"}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-800">
                <td className="p-2 text-slate-500">Počet izieb</td>
                {rows.map((r) => <td key={r.id} className="p-2 text-slate-200">{r.izby || "–"}</td>)}
              </tr>
              <tr className="border-t border-slate-800">
                <td className="p-2 text-slate-500">Lokalita</td>
                {rows.map((r) => (
                  <td key={r.id} className="p-2 text-slate-200">
                    {r.lokalita || "–"}
                    <span className="block text-[10px] text-slate-500">{r.lokalitaLabel}</span>
                  </td>
                ))}
              </tr>
              {[0, 1, 2].map((i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="p-2 text-slate-500">{rows[0]?.extra[i]?.[0] || ""}</td>
                  {rows.map((r) => (
                    <td key={r.id} className="p-2 text-slate-200">
                      {r.extra[i] ? (
                        <>
                          {r.extra[i][1]}
                          <span className="block text-[10px] text-slate-500">{r.extra[i][0]}</span>
                        </>
                      ) : "–"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}