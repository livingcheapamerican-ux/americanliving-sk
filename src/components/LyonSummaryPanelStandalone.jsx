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

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6" />
            {t('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">Lyon 50m²</p>
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
                Chýbajú povinné A0 položky. Aktuálne je to rekreačná stavba.
              </p>
            </div>
          )}
        </div>

        {/* Izolácia - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('insulation') || 'IZOLÁCIA'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={izolaciaStien === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Steny 150mm {izolaciaStien === "150mm" && "✓ (základné)"}
            </p>
            <p className={izolaciaStien === "200mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Steny 200mm {izolaciaStien === "200mm" && "✓"}
            </p>
            <p className={izolaciaStien === "250mm" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Steny 250mm {izolaciaStien === "250mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={izolaciaPodlahy === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Podlaha 150mm {izolaciaPodlahy === "150mm" && "✓ (základné)"}
            </p>
            <p className={izolaciaPodlahy === "200mm" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Podlaha 200mm {izolaciaPodlahy === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={izolaciaStropu === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Strop 150mm {izolaciaStropu === "150mm" && "✓ (základné)"}
            </p>
            <p className={izolaciaStropu === "200mm" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Strop 200mm {izolaciaStropu === "200mm" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
          </div>
        </div>

        {/* Izolácia */}
        {(izolaciaStien !== "150mm" || izolaciaPodlahy !== "150mm" || izolaciaStropu !== "150mm") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">IZOLÁCIA</p>
            <div className="space-y-1 text-xs">
              {izolaciaStien !== "150mm" && <p className="text-slate-300">• Steny {izolaciaStien}</p>}
              {izolaciaPodlahy !== "150mm" && <p className="text-slate-300">• Podlaha {izolaciaPodlahy}</p>}
              {izolaciaStropu !== "150mm" && <p className="text-slate-300">• Strop {izolaciaStropu}</p>}
            </div>
          </div>
        )}

        {/* Vykurovanie - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('heating') || 'VYKUROVANIE'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={tepelneCerpadlo === "ano" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Tepelné čerpadlo {tepelneCerpadlo === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            {tepelneCerpadlo === "nie" && (
              <p className="text-slate-300">
                • ✓ Príprava pre konvektory (základné)
              </p>
            )}
            <p className={rekuperacia === "ano" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Rekuperácia {rekuperacia === "ano" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={podlahovoKurenie ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Podlahové kúrenie {podlahovoKurenie && "✓"}
            </p>
            <p className={pripravaNaKrb ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Príprava na krb {pripravaNaKrb && "✓"}
            </p>
            <p className={ochranaKachle ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Ochrana na kachle {ochranaKachle && "✓"}
            </p>
          </div>
        </div>

        {/* Fasáda - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-1">{t('facadeSection') || 'FASÁDA'}</p>
          <p className="text-base text-slate-300">
            {fasada === "drevo_smrek" ? "✓ Drevo smrek (základné)" :
             fasada === "omietka" ? "✓ Šúchaná omietka" : 
             fasada === "smrekovec" ? "✓ Smrekovec" :
             fasada === "falcovane" ? "✓ Falcované panely" : "✓ Thermowood"}
          </p>
        </div>

        {/* Strecha - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('roofSection') || 'STRECHA'}</p>
          <div className="space-y-1.5 text-base">
            <p className="text-slate-300">
              • {strecha === "korugovan_plech" ? "✓ Korugovaný plech (základné)" : "✓ Falcované panely"}
            </p>
            <p className={odkvapy === "ano" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Odkvapy {odkvapy === "ano" && "✓"}
            </p>
          </div>
        </div>

        {/* Okná a dvere - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('windowsDoorsSection') || 'OKNÁ A DVERE'}</p>
          <div className="space-y-1.5 text-base">
            <p className="text-slate-300">
              • ✓ Okná {okna === "biele" ? "biele (základné)" : okna === "antracit" ? "antracit" : "hnedé"}
            </p>
            <p className="text-slate-300">
              • ✓ {vchodoveDvere === "plastove" ? "Kovovo-plastové dvere (základné)" : "Kovové dvere"}
            </p>
          </div>
        </div>

        {/* Interiér - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('interiorSection') || 'INTERIÉR'}</p>
          <div className="space-y-1.5 text-base">
            <p className="text-slate-300">
              • ✓ {obkladStien === "smrek_8cm" ? "Smrek 8cm (základné)" :
                   obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov 12cm" :
                   obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"}
            </p>
            <p className="text-slate-300">
              • ✓ Podlaha: Laminát (základné)
            </p>
            <p className="text-slate-300">
              • ✓ {interieroveDvere === "kridlove" ? "Krídlové dvere (základné)" : "Posuvné dvere"}
            </p>
          </div>
        </div>

        {/* Elektro - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('electricalSection') || 'ELEKTROINŠTALÁCIA'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={elektro === "eu" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • EU štandard {elektro === "eu" && "✓"}
            </p>
            <p className={elektro === "cz" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • CZ/SK štandard {elektro === "cz" && "✓"}
            </p>
            <p className={elektro === "ge" ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • GE štandard {elektro === "ge" && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={bleskozvod ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Bleskozvod {bleskozvod && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={prepat ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Prepäťová ochrana {prepat && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
          </div>
        </div>

        {/* Kúpeľňa - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('bathroomSection') || 'KÚPEĽŇA'}</p>
          <div className="space-y-1.5 text-base">
            <p className="text-slate-300">
              • ✓ {sprchovyKut === "standard" ? "Sprcha + WC Geberit (základné)" : "Sprcha Radaway"}
            </p>
            <p className="text-slate-300">
              • ✓ {bateria === "standard" ? "Batéria štandard (základné)" : "Batéria Grohe"}
            </p>
            <p className="text-slate-300">
              • ✓ {stropKupelna === "drevo" ? "Strop - vzor dreva biely (základné)" : "Sadrokartónový strop"}
            </p>
            <p className={vana ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Vaňa {vana && "✓"}
            </p>
            <p className={skrinka ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Skrinka {skrinka && "✓"}
            </p>
          </div>
        </div>

        {/* Základy - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-1">{t('foundationsSection') || 'ZÁKLADY'}</p>
          <p className="text-base text-slate-300">
            {zaklady === "bez" ? "Bez základov (zákazník zabezpečí)" :
             zaklady === "vruty" ? "✓ Zemné vruty" :
             zaklady === "patky" ? "✓ Betónové pätky" : "✓ Pásové betónové"}
          </p>
        </div>

        {/* Služby - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-400 mb-2">{t('servicesSection') || 'SLUŽBY'}</p>
          <div className="space-y-1.5 text-sm">
            <p className={inziniering ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Inžiniering {inziniering && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={projektACertifikacia ? "text-slate-300 flex items-center gap-1" : "text-slate-300 line-through opacity-50 flex items-center gap-1"}>
              • Projekt + Certifikácia {projektACertifikacia && "✓"} <span className="text-green-400 text-xs">⚡A0</span>
            </p>
            <p className={revizia ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Revízna dokumentácia {revizia && "✓"}
            </p>
          </div>
        </div>

        {/* Realizácia - vždy ukáž */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-base font-semibold text-slate-400 mb-2">{t('realizationSection') || 'REALIZÁCIA'}</p>
          <div className="space-y-1.5 text-base">
            <p className={montaz ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Montáž domu {montaz && "✓"}
            </p>
            <p className={doprava ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Doprava modulov {doprava && "✓"}
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