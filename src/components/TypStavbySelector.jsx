import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, CheckCircle, TreePine, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";

export default function TypStavbySelector({ typStavby, setTypStavby, onContinue }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="w-10 h-10" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Poskladajte si cenovú ponuku na váš dom
            </h2>
            <div className="flex items-center justify-center gap-2 text-purple-100">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">bez skrytých poplatkov</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Aký typ stavby plánujete?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vyberte si, či chcete rekreačnú stavbu (chata, záhradný domček) alebo rodinný dom s energetickým certifikátom A0 a možnosťou trvalého pobytu.
          </p>
        </motion.div>

        {/* Karty */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rekreačná stavba */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => {
              setTypStavby("rekreacna");
              setTimeout(() => onContinue?.(), 500);
            }}
            className="cursor-pointer"
          >
            <Card className={`p-6 h-full transition-all border-2 ${
              typStavby === "rekreacna" 
                ? "border-amber-500 bg-amber-50 shadow-xl ring-2 ring-amber-300" 
                : "border-gray-200 hover:border-amber-300 hover:shadow-lg"
            }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">
                    Rekreačná stavba
                  </h4>
                  <Badge className="bg-amber-500 text-white text-xs">
                    Ekonomická voľba
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Chata, záhradný domček</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Celoročná izolácia 150/200mm</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Bez energetického certifikátu</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Nižšia cena</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-amber-200">
                <p className="text-xs text-gray-500 italic">
                  Spĺňa parametre rekreačnej stavby
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Rodinný dom A0 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => {
              setTypStavby("rodinny_a0");
              setTimeout(() => onContinue?.(), 500);
            }}
            className="cursor-pointer"
          >
            <Card className={`p-6 h-full transition-all border-2 ${
              typStavby === "rodinny_a0" 
                ? "border-green-500 bg-green-50 shadow-xl ring-2 ring-green-300" 
                : "border-gray-200 hover:border-green-300 hover:shadow-lg"
            }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">
                    Rodinný dom A0
                  </h4>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs">
                    ⚡ Odporúčané
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Celoročné bývanie</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Energetický certifikát A0</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Premium izolácia 250/300mm</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tepelné čerpadlo + Rekuperácia</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Možnosť trvalého pobytu</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-green-200">
                <p className="text-xs text-gray-500 italic">
                  Spĺňa všetky normy pre rodinný dom
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Continue button */}
        {typStavby && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Pokračovať
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}