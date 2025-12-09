import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Send } from "lucide-react";

export default function LyonSummaryPanelStandalone({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, onSubmit
}) {
  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

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
        {/* Účel */}
        {ucel && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">ÚČEL STAVBY</p>
            <p className="text-sm font-bold text-white">
              {ucel === "chata" ? "Rekreačná stavba" : "Rodinný dom A0"}
            </p>
          </div>
        )}

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

        {/* Vykurovanie */}
        {(tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">VYKUROVANIE</p>
            <div className="space-y-1 text-xs">
              {tepelneCerpadlo === "ano" && <p className="text-slate-300">• Tepelné čerpadlo</p>}
              {rekuperacia === "ano" && <p className="text-slate-300">• Rekuperácia</p>}
              {podlahovoKurenie && <p className="text-slate-300">• Podlahové kúrenie</p>}
              {pripravaNaKrb && <p className="text-slate-300">• Príprava na krb</p>}
              {ochranaKachle && <p className="text-slate-300">• Ochrana na kachle</p>}
            </div>
          </div>
        )}

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
        <div className="mt-3">
          <Button onClick={onSubmit} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg">
            <Send className="w-4 h-4 mr-2" />
            Odoslať dopyt
          </Button>
        </div>
      </div>
    </Card>
  );
}