import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Home, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LyonFinalSummaryModal({ 
  isOpen, 
  onClose, 
  dom,
  ucel, 
  izolaciaStien, 
  izolaciaPodlahy, 
  izolaciaStropu, 
  tepelneCerpadlo, 
  rekuperacia, 
  podlahovoKurenie, 
  pripravaNaKrb, 
  ochranaKachle,
  fasada, 
  strecha, 
  odkvapy, 
  okna, 
  vchodoveDvere, 
  obkladStien, 
  interieroveDvere,
  elektro, 
  bleskozvod, 
  prepat, 
  sprchovyKut, 
  vana, 
  bateria, 
  skrinka, 
  stropKupelna,
  inziniering, 
  projektACertifikacia, 
  revizia, 
  zaklady, 
  montaz, 
  doprava,
  totalPrice
}) {
  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Určiť ktorý obrázok zobraziť
  const getDisplayImage = () => {
    // Ak je vybraná šuchaná omietka, zobraz hlavný obrázok
    if (fasada === "omietka") {
      return dom?.hlavny_obrazok;
    }
    // Ak je vybraná iná fasáda alebo default drevo smrek, zobraz základnú konfiguráciu
    return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
  };

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Home className="w-8 h-8" />
                  Váš dom Lyon 50m²
                </h2>
                <p className="text-blue-100 mt-1 text-lg">
                  {actualStatus} {!isA0 && ucel === "rodinny" && "⚠️ (chýbajú A0 položky)"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Upozornenie pre neúplnú A0 konfiguráciu */}
            {ucel === "rodinny" && !isA0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 text-2xl">⚠️</div>
                  <div>
                    <h4 className="text-yellow-900 font-bold mb-1">Neúplná konfigurácia pre rodinný dom</h4>
                    <p className="text-yellow-800 text-sm">
                      Aktuálna konfigurácia nezahŕňa všetky potrebné A0 položky pre skolaudovanie ako rodinný dom. 
                      Dom bude možné použiť len ako rekreačnú stavbu. Pre získanie A0 certifikátu doplňte všetky požadované položky.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Obrázok domu */}
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={getDisplayImage()} 
                  alt="Lyon konfigurácia"
                  className="w-full h-auto object-cover"
                />
                <div className="bg-gray-100 p-3 text-center">
                  <p className="text-sm text-gray-600">
                    {fasada === "omietka" ? "Zobrazenie: Šúchaná omietka (titulná fotka)" : "Zobrazenie: Základná konfigurácia"}
                  </p>
                </div>
              </div>

              {/* Celková cena */}
              <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                <div className="text-center">
                  <p className="text-gray-600 mb-2 text-lg">Celková cena vášho domu s DPH</p>
                  <p className="text-5xl font-black text-green-600">{formatPrice(totalPrice)}</p>
                </div>
              </Card>

              {/* Zoznam vybraných položiek */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Základné info */}
                <Card className="p-4 bg-blue-50 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Účel stavby
                  </h3>
                  <p className="text-gray-800">{actualStatus}</p>
                </Card>

                {/* Izolácia */}
                <Card className="p-4 bg-blue-50 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3">Izolácia</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Steny: {izolaciaStien}</li>
                    <li>• Podlaha: {izolaciaPodlahy}</li>
                    <li>• Strop: {izolaciaStropu}</li>
                  </ul>
                </Card>

                {/* Vykurovanie */}
                {(tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) && (
                  <Card className="p-4 bg-orange-50 border border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-3">Vykurovanie</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {tepelneCerpadlo === "ano" && <li>• Tepelné čerpadlo</li>}
                      {rekuperacia === "ano" && <li>• Rekuperácia</li>}
                      {podlahovoKurenie && <li>• Podlahové kúrenie</li>}
                      {pripravaNaKrb && <li>• Príprava na krb</li>}
                      {ochranaKachle && <li>• Ochrana na kachle</li>}
                    </ul>
                  </Card>
                )}

                {/* Fasáda */}
                <Card className="p-4 bg-purple-50 border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3">Fasáda</h3>
                  <p className="text-gray-700">
                    {fasada === "drevo_smrek" ? "Drevo smrek" :
                     fasada === "omietka" ? "Šúchaná omietka" :
                     fasada === "smrekovec" ? "Smrekovec" :
                     fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
                  </p>
                </Card>

                {/* Strecha */}
                <Card className="p-4 bg-indigo-50 border border-indigo-200">
                  <h3 className="font-bold text-indigo-900 mb-3">Strecha</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {strecha === "korugovan_plech" ? "Korugovaný plech" : "Falcované panely"}</li>
                    {odkvapy === "ano" && <li>• Odkvapy</li>}
                  </ul>
                </Card>

                {/* Elektro */}
                <Card className="p-4 bg-yellow-50 border border-yellow-200">
                  <h3 className="font-bold text-yellow-900 mb-3">Elektroinštalácia</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {elektro === "eu" ? "EU štandard" : elektro === "cz" ? "CZ/SK štandard" : "GE štandard (A0)"}</li>
                    {bleskozvod && <li>• Bleskozvod</li>}
                    {prepat && <li>• Prepäťová ochrana</li>}
                  </ul>
                </Card>

                {/* Služby */}
                {(inziniering || projektACertifikacia || revizia) && (
                  <Card className="p-4 bg-green-50 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-3">Služby</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {inziniering && <li>• Inžiniering</li>}
                      {projektACertifikacia && <li>• Projekt + Certifikácia A0</li>}
                      {revizia && <li>• Revízna dokumentácia</li>}
                    </ul>
                  </Card>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 text-lg"
                  onClick={() => {
                    onClose();
                    // Tu môžete pridať logiku pre odoslanie dopytu
                  }}
                >
                  Mám záujem o tento dom
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}