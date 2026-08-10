import React from "react";
import { Square, Grid3x3, Boxes, Fence, LayoutGrid, Hammer, Caravan, Home } from "lucide-react";

/**
 * Kompaktný riadok parametrov domu – všetky údaje, minimum miesta.
 * Každý údaj = ikona + hodnota, celý popis je v tooltipe (title).
 */
export default function DomSpecs({ dom, t }) {
  const typIcon = dom.typ_domu === "montovany" ? Hammer : dom.typ_domu === "mobilny" ? Caravan : LayoutGrid;
  const typLabel = dom.typ_domu === "modularny" ? t('modularType') : dom.typ_domu === "montovany" ? t('prefabType') : t('mobileType');

  const maTerasu = dom.terasa_plocha && (
    dom.vyrobca !== "Ticab house" ||
    (dom.popis && /vstavaná|zabudovaná|Vstavaná|Zabudovaná/.test(dom.popis)) ||
    (dom.specifikacia && !dom.specifikacia.includes("Terasa: ❌"))
  );

  const polozky = [
    { icon: Home, value: dom.vyrobca, label: t('manufacturer'), color: "text-slate-500" },
    { icon: typIcon, value: typLabel, label: t('houseType'), color: "text-amber-500" },
    { icon: Square, value: `${dom.zastavana_plocha} m²`, label: t('builtArea'), color: "text-primary" },
    dom.uzitkova_plocha && { icon: Square, value: `${dom.uzitkova_plocha} m²`, label: t('usableArea'), color: "text-purple-500" },
    dom.pocet_izieb && { icon: Grid3x3, value: `${dom.pocet_izieb}`, label: t('rooms'), color: "text-blue-500" },
    dom.pocet_modulov && { icon: Boxes, value: `${dom.pocet_modulov}`, label: "Moduly", color: "text-red-500" },
    maTerasu && { icon: Fence, value: `${dom.terasa_plocha} m²`, label: "Terasa", color: "text-teal-500" }
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-1">
      {polozky.map((p, i) => {
        const Icon = p.icon;
        return (
          <span
            key={i}
            title={`${p.label}: ${p.value}`}
            className="inline-flex items-center gap-1 bg-muted/60 border border-border/50 rounded px-1.5 py-0.5 text-[9px] sm:text-[11px] font-semibold text-foreground leading-none"
          >
            <Icon className={`w-3 h-3 shrink-0 ${p.color}`} />
            <span className="whitespace-nowrap">{p.value}</span>
          </span>
        );
      })}
    </div>
  );
}