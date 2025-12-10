import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import { useLanguage } from "./LanguageContext";

export default function LyonSummaryPanelStandalone({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
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
    return `+ ${cena.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €`;
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
            <p className={izolaciaStien === "200mm" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('walls')} 200mm {izolaciaStien === "200mm" && "✓"}</span>
              {getCenaPolozky('izolacia_stien_200mm') && <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_200mm')}</span>}
            </p>
            <p className={izolaciaStien === "250mm" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('walls')} 250mm {izolaciaStien === "250mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {getCenaPolozky('izolacia_stien_250mm') && <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stien_250mm')}</span>}
            </p>
            <p className={izolaciaPodlahy === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('floors')} 150mm {izolaciaPodlahy === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <p className={izolaciaPodlahy === "200mm" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('floors')} 200mm {izolaciaPodlahy === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {getCenaPolozky('izolacia_podlahy_200mm') && <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_podlahy_200mm')}</span>}
            </p>
            <p className={izolaciaStropu === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • {t('roof')} 150mm {izolaciaStropu === "150mm" && `✓ (${t('baseConfig')})`}
            </p>
            <p className={izolaciaStropu === "200mm" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('roof')} 200mm {izolaciaStropu === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {getCenaPolozky('izolacia_stropu_200mm') && <span className="text-green-400 text-xs">{getCenaPolozky('izolacia_stropu_200mm')}</span>}
            </p>
          </div>
        </div>

        {/* Vykurovanie - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('heating') || 'VYKUROVANIE'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={tepelneCerpadlo === "ano" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('heatPump')} {tepelneCerpadlo === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {getCenaPolozky('tepelne_cerpadlo') && <span className="text-green-400 text-xs">{getCenaPolozky('tepelne_cerpadlo')}</span>}
            </p>
            {tepelneCerpadlo === "nie" && (
              <p className="text-slate-300">
                • ✓ {t('heatingPreparation')} ({t('baseConfig')})
              </p>
            )}
            <p className={rekuperacia === "ano" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('recuperation')} {rekuperacia === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {getCenaPolozky('rekuperacia') && <span className="text-green-400 text-xs">{getCenaPolozky('rekuperacia')}</span>}
            </p>
            <p className={podlahovoKurenie ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('floorHeating')} {podlahovoKurenie && "✓"}</span>
              {podlahovoKurenie && getCenaPolozky('podlahove_kurenie') && <span className="text-green-400 text-xs">{getCenaPolozky('podlahove_kurenie')}</span>}
            </p>
            <p className={pripravaNaKrb ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('fireplacePrep')} {pripravaNaKrb && "✓"}</span>
              {pripravaNaKrb && getCenaPolozky('pripravaKrb') && <span className="text-green-400 text-xs">{getCenaPolozky('pripravaKrb')}</span>}
            </p>
            <p className={ochranaKachle ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('stoveProtection')} {ochranaKachle && "✓"}</span>
              {ochranaKachle && getCenaPolozky('ochranaKachle') && <span className="text-green-400 text-xs">{getCenaPolozky('ochranaKachle')}</span>}
            </p>
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
            {fasada === "omietka" && getCenaPolozky('fasada_omietka') && <span className="text-green-400 text-xs">{getCenaPolozky('fasada_omietka')}</span>}
            {fasada === "smrekovec" && getCenaPolozky('fasada_smrekovec') && <span className="text-green-400 text-xs">{getCenaPolozky('fasada_smrekovec')}</span>}
            {fasada === "falcovane" && getCenaPolozky('fasada_falcovane') && <span className="text-green-400 text-xs">{getCenaPolozky('fasada_falcovane')}</span>}
            {fasada === "thermowood" && getCenaPolozky('fasada_thermowood') && <span className="text-green-400 text-xs">{getCenaPolozky('fasada_thermowood')}</span>}
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
              {strecha === "falcovane" && getCenaPolozky('strecha_falcovane') && <span className="text-green-400 text-xs">{getCenaPolozky('strecha_falcovane')}</span>}
            </div>
            <p className={odkvapy === "ano" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('gutters')} {odkvapy === "ano" && "✓"}</span>
              {odkvapy === "ano" && getCenaPolozky('odkvapy') && <span className="text-green-400 text-xs">{getCenaPolozky('odkvapy')}</span>}
            </p>
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
              {vchodoveDvere === "kovove" && getCenaPolozky('dvere_kovove') && <span className="text-green-400 text-xs">{getCenaPolozky('dvere_kovove')}</span>}
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
              {obkladStien === "sadrokarton_tapeta" && getCenaPolozky('obklad_sadrokarton_tapeta') && <span className="text-green-400 text-xs">{getCenaPolozky('obklad_sadrokarton_tapeta')}</span>}
              {obkladStien === "osb_panel" && getCenaPolozky('obklad_osb_panel') && <span className="text-green-400 text-xs">{getCenaPolozky('obklad_osb_panel')}</span>}
            </div>
            <p className="text-slate-300">
              • ✓ {t('floors')}: {t('laminate')} ({t('baseConfig')})
            </p>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {interieroveDvere === "kridlove" ? `${t('hingedDoors')} (${t('baseConfig')})` : t('slidingDoors')}
              </p>
              {interieroveDvere === "posuvne" && getCenaPolozky('dvere_posuvne') && <span className="text-green-400 text-xs">{getCenaPolozky('dvere_posuvne')}</span>}
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
            <p className={elektro === "cz" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('czSkStandard')} {elektro === "cz" && "✓"}</span>
              {elektro === "cz" && getCenaPolozky('elektro_cz') && <span className="text-green-400 text-xs">{getCenaPolozky('elektro_cz')}</span>}
            </p>
            <p className={elektro === "ge" ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('geStandard')} {elektro === "ge" && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {elektro === "ge" && getCenaPolozky('elektro_ge') && <span className="text-green-400 text-xs">{getCenaPolozky('elektro_ge')}</span>}
            </p>
            <p className={bleskozvod ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('lightningRod')} {bleskozvod && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {bleskozvod && getCenaPolozky('bleskozvod') && <span className="text-green-400 text-xs">{getCenaPolozky('bleskozvod')}</span>}
            </p>
            <p className={prepat ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('surgeProtection')} {prepat && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {prepat && getCenaPolozky('prepat') && <span className="text-green-400 text-xs">{getCenaPolozky('prepat')}</span>}
            </p>
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
              {sprchovyKut === "radaway" && getCenaPolozky('sprchovyKut') && <span className="text-green-400 text-xs">{getCenaPolozky('sprchovyKut')}</span>}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-300">
                • ✓ {bateria === "standard" ? `${t('faucetStandard')} (${t('baseConfig')})` : t('faucetGrohe')}
              </p>
              {bateria === "grohe" && getCenaPolozky('bateria') && <span className="text-green-400 text-xs">{getCenaPolozky('bateria')}</span>}
            </div>
            <p className="text-slate-300">
              • ✓ {stropKupelna === "drevo" ? `${t('ceilingWoodPattern')} (${t('baseConfig')})` : t('drywallCeiling')}
            </p>
            <p className={vana ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('bathtub')} {vana && "✓"}</span>
              {vana && getCenaPolozky('vana') && <span className="text-green-400 text-xs">{getCenaPolozky('vana')}</span>}
            </p>
            <p className={skrinka ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('cabinet')} {skrinka && "✓"}</span>
              {skrinka && getCenaPolozky('skrinka') && <span className="text-green-400 text-xs">{getCenaPolozky('skrinka')}</span>}
            </p>
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
            {zaklady === "vruty" && getCenaPolozky('zaklady_vruty') && <span className="text-green-400 text-xs">{getCenaPolozky('zaklady_vruty')}</span>}
            {zaklady === "patky" && getCenaPolozky('zaklady_patky') && <span className="text-green-400 text-xs">{getCenaPolozky('zaklady_patky')}</span>}
            {zaklady === "pasove" && getCenaPolozky('zaklady_pasove') && <span className="text-green-400 text-xs">{getCenaPolozky('zaklady_pasove')}</span>}
          </div>
        </div>

        {/* Služby - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('servicesSection') || 'SLUŽBY'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={inziniering ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('engineering')} {inziniering && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {inziniering && getCenaPolozky('inziniering') && <span className="text-green-400 text-xs">{getCenaPolozky('inziniering')}</span>}
            </p>
            <p className={projektACertifikacia ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span className="flex items-center gap-1">• {t('projectCertification')} {projektACertifikacia && "✓"} <span className="text-green-400 text-xs">⚡A0</span></span>
              {projektACertifikacia && getCenaPolozky('projektACertifikacia') && <span className="text-green-400 text-xs">{getCenaPolozky('projektACertifikacia')}</span>}
            </p>
            <p className={revizia ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('revisionDocs')} {revizia && "✓"}</span>
              {revizia && getCenaPolozky('revizia') && <span className="text-green-400 text-xs">{getCenaPolozky('revizia')}</span>}
            </p>
          </div>
        </div>

        {/* Realizácia - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('realizationSection') || 'REALIZÁCIA'}</p>
          <div className="space-y-1.5 text-base">
            <p className={montaz ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('assembly')} {montaz && "✓"}</span>
              {montaz && getCenaPolozky('montaz') && <span className="text-green-400 text-xs">{getCenaPolozky('montaz')}</span>}
            </p>
            <p className={doprava ? "text-slate-300 flex items-center justify-between" : "text-slate-300 line-through opacity-50 flex items-center justify-between"}>
              <span>• {t('transport')} {doprava && "✓"}</span>
              {doprava && getCenaPolozky('doprava') && <span className="text-green-400 text-xs">{getCenaPolozky('doprava')}</span>}
            </p>
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
        podlahovoKurenie={podlahovoKurenie}
        pripravaNaKrb={pripravaNaKrb}
        ochranaKachle={ochranaKachle}
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