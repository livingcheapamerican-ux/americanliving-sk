import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import { useLanguage } from "./LanguageContext";

export default function MajorcaSummaryPanel({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
  fasada, strecha, odkvapy, okna, sieteProtiHmyzu, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, onSubmit, dom
}) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const isA0Configuration = () => {
    return (
      izolaciaStien === "250mm" &&
      izolaciaPodlahy === "200mm" &&
      izolaciaStropu === "200mm" &&
      tepelneCerpadlo === "ano" &&
      rekuperacia === "ano" &&
      elektro === "ge" &&
      bleskozvod &&
      prepat &&
      inziniering &&
      projektACertifikacia
    );
  };

  const isA0 = isA0Configuration();
  const actualStatus = ucel === "rodinny" && isA0 ? (t('familyHouseA0') || "Rodinný dom A0") : (t('recreationalBuilding') || "Rekreačná stavba");

  const getCenaPolozky = (priceKey) => {
    const ceny = dom?.konfigurator_ceny || {};
    const cena = ceny[priceKey];
    if (!cena || cena === 0) return null;
    return cena.toLocaleString('sk-SK', { minimumFractionDigits: 0 }) + ' €';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6" />
            {t('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">{dom?.nazov || 'Ticabhouse'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Účel */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-1">{t('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
          <p className="text-base font-bold text-white mb-2">{actualStatus}</p>
          {ucel === "rodinny" && !isA0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">{t('missingA0Items')}</p>
            </div>
          )}
        </div>

        {/* Izolácia */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('insulation')}</p>
          <div className="space-y-1.5 text-sm">
            <p className={izolaciaStien === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('walls')} 150mm {izolaciaStien === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaStien === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('walls')} 200mm {izolaciaStien === "200mm" && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_200mm') || '+ 1 695 €'}</span>
            </div>
            <div className={izolaciaStien === "250mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('walls')} 250mm {izolaciaStien === "250mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_250mm') || '+ 1 599 €'}</span>
            </div>
            <p className={izolaciaPodlahy === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('floors')} 150mm {izolaciaPodlahy === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaPodlahy === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('floors')} 200mm {izolaciaPodlahy === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_podlahy_200mm') || '+ 256 €'}</span>
            </div>
            <p className={izolaciaStropu === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('roof')} 150mm {izolaciaStropu === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaStropu === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('roof')} 200mm {izolaciaStropu === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stropu_200mm') || '+ 204 €'}</span>
            </div>
          </div>
        </div>

        {/* Vykurovanie */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('heating')}</p>
          <div className="space-y-1.5 text-sm">
            <div className={tepelneCerpadlo === "ano" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('heatPump')} {tepelneCerpadlo === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('tepelne_cerpadlo') || '+ 2 889 €'}</span>
            </div>
            {tepelneCerpadlo === "nie" && (
              <p className="text-slate-300">• ✓ {t('heatingPreparation')} ({t('baseConfig')})</p>
            )}
            <div className={pripravaNaRekuperaciu ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('recuperationPrep') || 'Príprava na rekuperáciu'} {pripravaNaRekuperaciu && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('pripravaNaRekuperaciu') || '+ 256 €'}</span>
            </div>
            <div className={rekuperacia === "ano" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('recuperation')} {rekuperacia === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('rekuperacia') || '+ 1 155 €'}</span>
            </div>
            <div className={podlahovoKurenie ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('floorHeating')} {podlahovoKurenie && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('podlahove_kurenie') || '+ 2 253 €'}</span>
            </div>
            <div className={pripravaNaKrb ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('fireplacePrep')} {pripravaNaKrb && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('pripravaKrb') || '+ 579 €'}</span>
            </div>
            <div className={ochranaKachle ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('stoveProtection')} {ochranaKachle && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('ochranaKachle') || '+ 1 280 €'}</span>
            </div>
            <div className={klimatizacia ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('airConditioningPrep') || 'Príprava na klimatizáciu'} {klimatizacia && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('klimatizacia') || '0 €'}</span>
            </div>
          </div>
        </div>