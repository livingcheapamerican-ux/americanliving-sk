import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";

export default function LyonSummaryPanelStandalone({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, onSubmit, dom
}) {
  const [showModal, setShowModal] = useState(false);
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
  const actualStatus = ucel === "rodinny" && isA0 ? "Rodinný dom A0" : "Rekreačná stavba";

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Home className="w-5 h-5" />
            Vaša konfigurácia
          </h3>
          <p className="text-xs text-blue-100 mt-1">Lyon 50m²</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
        {/* Účel + status */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-400 mb-1">ÚČEL STAVBY</p>
          <p className="text-sm font-bold text-white mb-2">{actualStatus}</p>
          {ucel === "rodinny" && !isA0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200">
                Chýbajú povinné A0 položky. Aktuálne je to rekreačná stavba.
              </p>
            </div>
          )}
        </div>

        {/* Izolácia - vždy ukáž všetky možnosti */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-400 mb-2">IZOLÁCIA</p>
          <div className="space-y-1 text-xs">
            <p className={izolaciaStien === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Steny 150mm {izolaciaStien === "150mm" && "✓"}
            </p>
            <p className={izolaciaStien === "200mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Steny 200mm {izolaciaStien === "200mm" && "✓"}
            </p>
            <p className={izolaciaStien === "250mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Steny 250mm {izolaciaStien === "250mm" && "✓"}
            </p>
            <p className={izolaciaPodlahy === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Podlaha 150mm {izolaciaPodlahy === "150mm" && "✓"}
            </p>
            <p className={izolaciaPodlahy === "200mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Podlaha 200mm {izolaciaPodlahy === "200mm" && "✓"}
            </p>
            <p className={izolaciaStropu === "150mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Strop 150mm {izolaciaStropu === "150mm" && "✓"}
            </p>
            <p className={izolaciaStropu === "200mm" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Strop 200mm {izolaciaStropu === "200mm" && "✓"}
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
          <p className="text-xs font-semibold text-slate-400 mb-2">VYKUROVANIE</p>
          <div className="space-y-1 text-xs">
            <p className={tepelneCerpadlo === "ano" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Tepelné čerpadlo {tepelneCerpadlo === "ano" && "✓"}
            </p>
            <p className={rekuperacia === "ano" ? "text-slate-300" : "text-slate-300 line-through opacity-50"}>
              • Rekuperácia {rekuperacia === "ano" && "✓"}
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

        {/* Fasáda */}
        {fasada !== "drevo_smrek" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">FASÁDA</p>
            <p className="text-sm text-slate-300">
              {fasada === "omietka" ? "Šúchaná omietka" : 
               fasada === "smrekovec" ? "Smrekovec" :
               fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
            </p>
          </div>
        )}

        {/* Strecha */}
        {(strecha !== "korugovan_plech" || odkvapy === "ano") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">STRECHA</p>
            <div className="space-y-1 text-xs">
              {strecha !== "korugovan_plech" && <p className="text-slate-300">• Falcované panely</p>}
              {odkvapy === "ano" && <p className="text-slate-300">• Odkvapy</p>}
            </div>
          </div>
        )}

        {/* Okná a dvere */}
        {(okna !== "biele" || vchodoveDvere !== "plastove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">OKNÁ A DVERE</p>
            <div className="space-y-1 text-xs">
              {okna !== "biele" && <p className="text-slate-300">• Okná {okna === "antracit" ? "antracit" : "hnedé"}</p>}
              {vchodoveDvere !== "plastove" && <p className="text-slate-300">• Kovové dvere</p>}
            </div>
          </div>
        )}

        {/* Interiér */}
        {(obkladStien !== "smrek_8cm" || interieroveDvere !== "kridlove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">INTERIÉR</p>
            <div className="space-y-1 text-xs">
              {obkladStien !== "smrek_8cm" && (
                <p className="text-slate-300">
                  • {obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov" :
                     obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"}
                </p>
              )}
              {interieroveDvere !== "kridlove" && <p className="text-slate-300">• Posuvné dvere</p>}
            </div>
          </div>
        )}

        {/* Elektro */}
        {(elektro !== "eu" || bleskozvod || prepat) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">ELEKTROINŠTALÁCIA</p>
            <div className="space-y-1 text-xs">
              {elektro === "cz" && <p className="text-slate-300">• CZ/SK štandard</p>}
              {elektro === "ge" && <p className="text-slate-300 flex items-center gap-1">• GE štandard <span className="text-green-400">⚡A0</span></p>}
              {bleskozvod && <p className="text-slate-300 flex items-center gap-1">• Bleskozvod <span className="text-green-400">⚡A0</span></p>}
              {prepat && <p className="text-slate-300 flex items-center gap-1">• Prepäťová ochrana <span className="text-green-400">⚡A0</span></p>}
            </div>
          </div>
        )}

        {/* Kúpeľňa */}
        {(sprchovyKut !== "standard" || bateria !== "standard" || vana || skrinka || stropKupelna !== "drevo") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">KÚPEĽŇA</p>
            <div className="space-y-1 text-xs">
              {sprchovyKut !== "standard" && <p className="text-slate-300">• Sprcha Radaway</p>}
              {bateria !== "standard" && <p className="text-slate-300">• Batéria Grohe</p>}
              {stropKupelna !== "drevo" && <p className="text-slate-300">• Sadrokartónový strop</p>}
              {vana && <p className="text-slate-300">• Vaňa</p>}
              {skrinka && <p className="text-slate-300">• Skrinka</p>}
            </div>
          </div>
        )}

        {/* Základy */}
        {zaklady !== "bez" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">ZÁKLADY</p>
            <p className="text-sm text-slate-300">
              {zaklady === "vruty" ? "Zemné vruty" :
               zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}
            </p>
          </div>
        )}

        {/* Služby */}
        {(inziniering || projektACertifikacia || revizia) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">SLUŽBY</p>
            <div className="space-y-1 text-xs">
              {inziniering && <p className="text-slate-300 flex items-center gap-1">• Inžiniering <span className="text-green-400">⚡A0</span></p>}
              {projektACertifikacia && <p className="text-slate-300 flex items-center gap-1">• Projekt + Certifikácia <span className="text-green-400">⚡A0</span></p>}
              {revizia && <p className="text-slate-300">• Revízna dokumentácia</p>}
            </div>
          </div>
        )}

        {/* Realizácia */}
        {(montaz || doprava) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">REALIZÁCIA</p>
            <div className="space-y-1 text-xs">
              {montaz && <p className="text-slate-300">• Montáž domu</p>}
              {doprava && <p className="text-slate-300">• Doprava modulov</p>}
            </div>
          </div>
        )}
      </div>

      {/* Total Price */}
      <div className="border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-xs text-blue-100 mb-1">Celková cena s DPH</p>
        <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
        <div className="mt-3 space-y-2">
          <Button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ukáž môj dom
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="outline"
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            Odoslať dopyt
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