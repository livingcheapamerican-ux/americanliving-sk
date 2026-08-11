import React, { useState, useEffect } from "react";
import { Building2, TreePine, Grid3x3, Home } from "lucide-react";
import ImageWithWatermark from "../ImageWithWatermark";

/**
 * Prepínateľná galéria v karte domu: murovka / drevodizajn / 3D pôdorys.
 * Zobrazí len tie varianty, ktoré dom naozaj má.
 */
export default function DomCardGallery({ dom, dizajnFilter, priority }) {
  const varianty = [
    { key: "murovka", url: dom.hlavny_obrazok, icon: Building2, label: "Murovka" },
    { key: "drevo", url: dom.zakladna_konfiguracia_obrazok, icon: TreePine, label: "Drevodizajn" },
    { key: "podorys3d", url: dom.podorys_3d, icon: Grid3x3, label: "3D pôdorys" }
  ].filter(v => v.url);

  const fallback = varianty[0]?.key;
  const [aktivny, setAktivny] = useState(
    varianty.some(v => v.key === dizajnFilter) ? dizajnFilter : fallback
  );

  useEffect(() => {
    if (varianty.some(v => v.key === dizajnFilter)) setAktivny(dizajnFilter);
  }, [dizajnFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const aktualny = varianty.find(v => v.key === aktivny) || varianty[0];

  if (!aktualny) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Home className="w-10 h-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <ImageWithWatermark
        src={aktualny.url}
        alt={`${dom.nazov} – ${aktualny.label}`}
        className={`w-full h-full ${aktivny === "podorys3d" ? "object-contain bg-white" : "object-cover"} group-hover:scale-105 transition-transform duration-700 ease-out`}
        useCatalogSetting={true}
        priority={priority}
        loading="eager"
        optimizeWidth={400}
        width={400}
        height={300}
      />

      {varianty.length > 1 && (
        <div className="absolute bottom-1.5 left-1.5 flex gap-1 z-10">
          {varianty.map(v => {
            const Icon = v.icon;
            const isActive = v.key === aktivny;
            return (
              <button
                key={v.key}
                type="button"
                title={v.label}
                aria-label={v.label}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAktivny(v.key); }}
                className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-md border transition-all ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 border-white/60 dark:border-white/15 hover:bg-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}