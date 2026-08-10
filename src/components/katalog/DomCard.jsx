import React, { memo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, Plus, Trash2, Eye, EyeOff, Package, Gift } from "lucide-react";
import DomCardGallery from "./DomCardGallery";
import DomSpecs from "./DomSpecs";

const DomCard = memo(({
  dom, index, dizajnFilter, jeVybrany, toggleSrovnanie, vybraneNaSrovnanie,
  canManage, handleToggleVerejny, toggleVerejnyMutation, handleDeleteDom, deleteDomMutation, location, t
}) => {
  const detailUrl = `${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}&return=${encodeURIComponent(location.pathname + location.search)}`;
  const jeTicab = dom.vyrobca === "Ticab house";
  const cenaSDotaciou = jeTicab ? Math.round(dom.zakladna_cena * 0.95) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="h-full"
    >
      <Card className={`group overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300 bg-card border-border flex flex-col h-full ${jeVybrany ? 'ring-2 ring-primary' : ''} ${dom.verejny === false ? 'opacity-60' : ''}`}>
        {/* Fotka + prepínač dizajnu */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <Link to={detailUrl} className="block w-full h-full">
            <DomCardGallery dom={dom} dizajnFilter={dizajnFilter} priority={index < 4} />
          </Link>

          {/* Štítky vľavo hore */}
          <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-1 z-10 pointer-events-none max-w-[50%]">
            {dom.celorocny && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold shadow max-w-full truncate">
                <CheckCircle className="w-2.5 h-2.5" />
                {t('yearRound')}
              </span>
            )}
            {dom.energeticky_certifikat && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold shadow">
                <Zap className="w-2.5 h-2.5" />
                A0
              </span>
            )}
          </div>

          {/* Akcie vpravo hore */}
          <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
            {canManage && (
              <>
                <button
                  onClick={(e) => handleDeleteDom(dom, e)}
                  disabled={deleteDomMutation.isPending}
                  title="Vymazať dom"
                  className="w-7 h-7 rounded-md flex items-center justify-center bg-red-600/90 backdrop-blur-sm text-white hover:bg-red-700 transition-all disabled:opacity-50 shadow sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleToggleVerejny(dom, e)}
                  disabled={toggleVerejnyMutation.isPending}
                  title={dom.verejny !== false ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                  className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-sm text-white transition-all disabled:opacity-50 shadow sm:opacity-0 sm:group-hover:opacity-100 ${dom.verejny !== false ? 'bg-green-600/90 hover:bg-green-700' : 'bg-slate-500/90 hover:bg-slate-600'}`}
                >
                  {dom.verejny !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
            <button
              onClick={() => toggleSrovnanie(dom)}
              disabled={!jeVybrany && vybraneNaSrovnanie.length >= 3}
              title={jeVybrany ? t('cancelSelection') : t('compareHouses')}
              className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-sm transition-all shadow ${
                jeVybrany
                  ? 'bg-primary text-white'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 hover:bg-primary hover:text-white'
              } ${!jeVybrany && vybraneNaSrovnanie.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Plus className={`w-3.5 h-3.5 transition-transform ${jeVybrany ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Obsah */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1.5 sm:gap-2">
          <Link to={detailUrl} className="block">
            <h3 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
              {dom.nazov}
            </h3>
            {jeTicab === false && dom.prosto_house_kod && (
              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-red-500">
                <Package className="w-2.5 h-2.5" />{dom.prosto_house_kod}
              </span>
            )}
          </Link>

          <DomSpecs dom={dom} t={t} />

          {/* Cena + akcia */}
          <div className="mt-auto pt-1.5 border-t border-border">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold leading-none mb-0.5">
              {jeTicab ? t('basicConfigPrice') : dom.vyrobca === "Prosto House" ? "Základná cena" : t('priceFromLabel')}
            </p>
            {jeTicab ? (
              <div className="flex items-baseline flex-wrap gap-x-1.5">
                <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                  {cenaSDotaciou?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-[9px] sm:text-xs font-bold text-red-500/70 line-through">
                  {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                </span>
                <span className="w-full text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  💰 S dotáciou AMERICANA · vrátane DPH
                </span>
              </div>
            ) : (
              <div className="flex items-baseline flex-wrap gap-x-1.5">
                <span className="text-base sm:text-xl font-black text-red-600 dark:text-red-400 leading-tight">
                  {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-[8px] sm:text-[10px] text-muted-foreground">vrátane DPH</span>
              </div>
            )}

            <Link to={detailUrl} className="block mt-1.5">
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white text-[10px] sm:text-xs h-8 font-bold">
                {t('detail')}
                <ArrowRight className="ml-1.5 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>

            {jeTicab && (
              <Link
                to={createPageUrl(`DotaciaAmericana?dom=${dom.id}`)}
                className="mt-1 flex items-center justify-center gap-1 text-[8px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Gift className="w-3 h-3" />
                {t('dotacia')} – dotácia na energie zdarma
              </Link>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export default DomCard;