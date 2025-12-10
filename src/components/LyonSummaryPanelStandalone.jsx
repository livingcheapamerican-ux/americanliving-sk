import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import { useLanguage } from "./LanguageContext";

export default function LyonSummaryPanelStandalone({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, onSubmit, dom
}) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Kontrola či je konfigurácia A0
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

  // Pomocná funkcia na zobrazenie ceny
  const getCenaPolozky = (priceKey) => {
    const ceny = dom?.konfigurator_ceny || {};
    const cena = ceny[priceKey];
    if (!cena || cena === 0) return null;
    return cena.toLocaleString('sk-SK', { minimumFractionDigits: 2 }) + ' €';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6" />
            {t('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">{dom?.nazov || 'Ticabhouse'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Účel + status */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-1">{t('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
          <p className="text-base font-bold text-white mb-2">{actualStatus}</p>
          {ucel === "rodinny" && !isA0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                {t('missingA0Items') || 'Chýbajú povinné A0 položky. Aktuálne je to rekreačná stavba.'}
              </p>
            </div>
          )}
        </div>

        {/* Izolácia - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('insulation') || 'IZOLÁCIA'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={izolaciaStien === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('walls')} 150mm {izolaciaStien === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaStien === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('walls')} 200mm {izolaciaStien === "200mm" && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_200mm') || '+ 1 799 €'}</span>
            </div>
            <div className={izolaciaStien === "250mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('walls')} 250mm {izolaciaStien === "250mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_250mm') || '+ 1 558 €'}</span>
            </div>
            <p className={izolaciaPodlahy === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('floors')} 150mm {izolaciaPodlahy === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaPodlahy === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('floors')} 200mm {izolaciaPodlahy === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_podlahy_200mm') || '+ 334 €'}</span>
            </div>
            <p className={izolaciaStropu === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('roof')} 150mm {izolaciaStropu === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <div className={izolaciaStropu === "200mm" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('roof')} 200mm {izolaciaStropu === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stropu_200mm') || '+ 271 €'}</span>
            </div>
          </div>
        </div>

        {/* Vykurovanie - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('heating') || 'VYKUROVANIE'}</p>
          <div className="space-y-1.5 text-sm">
            <div className={tepelneCerpadlo === "ano" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('heatPump')} {tepelneCerpadlo === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('tepelne_cerpadlo') || '+ 2 889 €'}</span>
            </div>
            {tepelneCerpadlo === "nie" && (
              <p className="text-slate-300">
                • ✓ {t('heatingPreparation')} ({t('baseConfig')})
              </p>
            )}
            <div className={pripravaNaRekuperaciu ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• Príprava na rekuperáciu {pripravaNaRekuperaciu && "✓"}</span>
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
              <span className="text-slate-300 flex items-center gap-1">• Príprava na klimatizáciu {klimatizacia && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('klimatizacia') || '0 €'}</span>
            </div>
          </div>
        </div>

        {/* Fasáda - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-1">{t('facadeSection') || 'FASÁDA'}</p>
          <div className="flex items-center justify-between">
            <p className="text-base text-slate-300">
              {fasada === "drevo_smrek" ? `✓ ${t('spruceWood')} (${t('baseConfig')})` :
               fasada === "omietka" ? `✓ ${t('scratchedPlaster')}` : 
               fasada === "smrekovec" ? `✓ ${t('larch')}` :
               fasada === "falcovane" ? `✓ ${t('foldedPanels')}` : "✓ Thermowood"}
            </p>
            {fasada !== "drevo_smrek" && (
              <span className="text-green-400 text-xs">
                {fasada === "omietka" && (getCenaPolozky('fasada_omietka') || '+ 1 581 €')}
                {fasada === "smrekovec" && (getCenaPolozky('fasada_smrekovec') || '+ 3 350 €')}
                {fasada === "falcovane" && (getCenaPolozky('fasada_falcovane') || '+ 4 954 €')}
                {fasada === "thermowood" && (getCenaPolozky('fasada_thermowood') || '+ 6 677 €')}
              </span>
            )}
          </div>
        </div>

        {/* Strecha - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('roofSection') || 'STRECHA'}</p>
          <div className="space-y-1.5 text-base">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • {strecha === "korugovan_plech" ? `✓ ${t('corrugatedMetal')} (${t('baseConfig')})` : `✓ ${t('foldedPanels')}`}
              </p>
              {strecha === "falcovane" && <span className="text-green-400 text-xs">{getCenaPolozky('strecha_falcovane') || '+ 3 228 €'}</span>}
            </div>
            <div className={odkvapy === "ano" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('gutters')} {odkvapy === "ano" && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('odkvapy') || '+ 1 502 €'}</span>
            </div>
            </div>
            </div>

            {/* Okná a dvere - vždy ukáž */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-base font-semibold text-slate-400 mb-2">{t('windowsDoorsSection') || 'OKNÁ A DVERE'}</p>
            <div className="space-y-1.5 text-base">
            <p className="text-slate-300">
              • ✓ {t('windows')} {okna === "biele" ? `${t('white')} (${t('baseConfig')})` : okna === "antracit" ? t('anthracite') : t('brown')}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {vchodoveDvere === "plastove" ? `${t('metalPlasticDoors')} (${t('baseConfig')})` : t('metalDoors')}
              </p>
              {vchodoveDvere === "kovove" && <span className="text-green-400 text-xs">{getCenaPolozky('dvere_kovove') || '+ 278 €'}</span>}
            </div>
            </div>
            </div>

        {/* Interiér - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('interiorSection') || 'INTERIÉR'}</p>
          <div className="space-y-1.5 text-base">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {obkladStien === "smrek_8cm" ? `${t('spruceWall8cm')} (${t('baseConfig')})` :
                     obkladStien === "smrek_bez_uzlov" ? t('spruceWallNoKnots') :
                     obkladStien === "sadrokarton_tapeta" ? t('drywallWallpaper') : t('osbPanel')}
              </p>
              {obkladStien !== "smrek_8cm" && (
                <span className="text-green-400 text-xs">
                  {obkladStien === "sadrokarton_tapeta" && (getCenaPolozky('obklad_sadrokarton_tapeta') || '+ 7 855 €')}
                  {obkladStien === "osb_panel" && (getCenaPolozky('obklad_osb_panel') || '+ 5 279 €')}
                  {obkladStien === "smrek_bez_uzlov" && '0 €'}
                </span>
              )}
            </div>
            <p className="text-slate-300">
              • ✓ {t('floors')}: {t('laminate')} ({t('baseConfig')})
            </p>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {interieroveDvere === "kridlove" ? `${t('hingedDoors')} (${t('baseConfig')})` : t('slidingDoors')}
              </p>
              {interieroveDvere === "posuvne" && <span className="text-green-400 text-xs">{getCenaPolozky('dvere_posuvne') || '+ 427 €'}</span>}
            </div>
          </div>
        </div>

        {/* Elektro - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('electricalSection') || 'ELEKTROINŠTALÁCIA'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={elektro === "eu" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('euStandard')} {elektro === "eu" && "✓"}
            </p>
            <div className={elektro === "cz" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('czSkStandard')} {elektro === "cz" && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('elektro_cz') || '+ 460 €'}</span>
            </div>
            <div className={elektro === "ge" ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('geStandard')} {elektro === "ge" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('elektro_ge') || '+ 1 583 €'}</span>
            </div>
            <div className={bleskozvod ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('lightningRod')} {bleskozvod && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('bleskozvod') || '+ 856 €'}</span>
            </div>
            <div className={prepat ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('surgeProtection')} {prepat && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('prepat') || '+ 311 €'}</span>
            </div>
            <div className={pripravaNaSolarnePanely ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• Príprava na solárne panely {pripravaNaSolarnePanely && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('pripravaNaSolarnePanely') || '+ 1 305 €'}</span>
            </div>
            </div>
            </div>

        {/* Kúpeľňa - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('bathroomSection') || 'KÚPEĽŇA'}</p>
          <div className="space-y-1.5 text-base">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {sprchovyKut === "standard" ? `${t('showerWC')} (${t('baseConfig')})` : t('showerRadaway')}
              </p>
              {sprchovyKut === "radaway" && <span className="text-green-400 text-xs">{getCenaPolozky('sprchovyKut') || '+ 646 €'}</span>}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {bateria === "standard" ? `${t('faucetStandard')} (${t('baseConfig')})` : t('faucetGrohe')}
              </p>
              {bateria === "grohe" && <span className="text-green-400 text-xs">{getCenaPolozky('bateria') || '+ 139 €'}</span>}
            </div>
            <p className="text-slate-300">
              • ✓ {stropKupelna === "drevo" ? `${t('ceilingWoodPattern')} (${t('baseConfig')})` : t('drywallCeiling')}
            </p>
            <div className={vana ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('bathtub')} {vana && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('vana') || '+ 501 €'}</span>
            </div>
            <div className={skrinka ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('cabinet')} {skrinka && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('skrinka') || '+ 434 €'}</span>
            </div>
          </div>
        </div>

        {/* Základy - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-1">{t('foundationsSection') || 'ZÁKLADY'}</p>
          <div className="flex items-center justify-between">
            <p className="text-base text-slate-300">
              {zaklady === "bez" ? `${t('noFoundations')} (${t('customerProvides')})` :
               zaklady === "vruty" ? `✓ ${t('groundScrews')}` :
               zaklady === "patky" ? `✓ ${t('concretePads')}` : `✓ ${t('stripFoundations')}`}
            </p>
            {zaklady !== "bez" && (
              <span className="text-green-400 text-xs">
                {zaklady === "vruty" && (getCenaPolozky('zaklady_vruty') || '+ 4 494 €')}
                {zaklady === "patky" && (getCenaPolozky('zaklady_patky') || '+ 2 568 €')}
                {zaklady === "pasove" && (getCenaPolozky('zaklady_pasove') || '+ 11 825 €')}
              </span>
            )}
          </div>
        </div>

        {/* Služby - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('servicesSection') || 'SLUŽBY'}</p>
          <div className="space-y-1.5 text-sm">
            <div className={inziniering ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('engineering')} {inziniering && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('inziniering') || '+ 2 774 €'}</span>
            </div>
            <div className={projektACertifikacia ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300 flex items-center gap-1">• {t('projectCertification')} {projektACertifikacia && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              <span className="text-green-400 text-xs">{getCenaPolozky('projektACertifikacia') || '+ 3 745 €'}</span>
            </div>
            <div className={revizia ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('revisionDocs')} {revizia && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('revizia') || '+ 1 605 €'}</span>
            </div>
          </div>
        </div>

        {/* Realizácia - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('realizationSection') || 'REALIZÁCIA'}</p>
          <div className="space-y-1.5 text-base">
            <div className={montaz ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('assembly')} {montaz && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('montaz') || '+ 4 806 €'}</span>
            </div>
            <div className={doprava ? "flex items-center justify-between" : "flex items-center justify-between line-through opacity-50"}>
              <span className="text-slate-300">• {t('transport')} {doprava && "✓"}</span>
              <span className="text-green-400 text-xs">{getCenaPolozky('doprava') || '+ 8 928 €'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Price */}
      <div className="border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-sm text-blue-100 mb-1">{t('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
        <p className="text-3xl font-black text-white">{formatPrice(totalPrice)}</p>
        <div className="mt-3 space-y-2">
          <Button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('interested') || 'Ukáž môj dom'}
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="outline"
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            {t('sendInquiry') || 'Odoslať dopyt'}
          </Button>
        </div>
      </div>

      {/* Modal */}
      <LyonFinalSummaryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        dom={dom}
        ucel={ucel}
        izolaciaStien={izolaciaStien}
        izolaciaPodlahy={izolaciaPodlahy}
        izolaciaStropu={izolaciaStropu}
        tepelneCerpadlo={tepelneCerpadlo}
        rekuperacia={rekuperacia}
        pripravaNaRekuperaciu={pripravaNaRekuperaciu}
        podlahovoKurenie={podlahovoKurenie}
        pripravaNaKrb={pripravaNaKrb}
        ochranaKachle={ochranaKachle}
        klimatizacia={klimatizacia}
        fasada={fasada}
        strecha={strecha}
        odkvapy={odkvapy}
        okna={okna}
        vchodoveDvere={vchodoveDvere}
        obkladStien={obkladStien}
        interieroveDvere={interieroveDvere}
        elektro={elektro}
        bleskozvod={bleskozvod}
        prepat={prepat}
        pripravaNaSolarnePanely={pripravaNaSolarnePanely}
        sprchovyKut={sprchovyKut}
        vana={vana}
        bateria={bateria}
        skrinka={skrinka}
        stropKupelna={stropKupelna}
        inziniering={inziniering}
        projektACertifikacia={projektACertifikacia}
        revizia={revizia}
        zaklady={zaklady}
        montaz={montaz}
        doprava={doprava}
        totalPrice={totalPrice}
      />
    </Card>
  );
}