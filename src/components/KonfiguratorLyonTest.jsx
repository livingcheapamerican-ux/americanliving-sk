import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Dlaždica s výberom
const Tile = ({ selected, onClick, title, subtitle, price, isPriced, isIncluded, isA0Required }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 rounded-lg cursor-pointer transition-all border-2 ${
        selected 
          ? "bg-blue-100 border-blue-500 shadow-xl ring-2 ring-blue-300" 
          : isIncluded
            ? "bg-green-50 border-green-300 hover:border-green-400 hover:shadow-md"
            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      {isIncluded && (
        <Badge className="absolute top-1 left-1 bg-green-600 text-[8px] px-1.5">
          ✓ V CENE
        </Badge>
      )}
      
      {isA0Required && (
        <Badge className="absolute top-1 left-1 bg-gradient-to-r from-green-500 to-emerald-600 text-[8px] px-1.5 z-10">
          <Sparkles className="w-2 h-2 mr-0.5" />A0
        </Badge>
      )}
      
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 right-2 z-20 pointer-events-none"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <span className="font-semibold text-gray-800 text-sm leading-tight block">{title}</span>
        {subtitle && <span className="text-xs text-gray-500 mt-1 leading-tight block">{subtitle}</span>}
        <span className={`${isPriced ? "font-bold text-green-600" : "text-gray-400 font-medium"} text-xs mt-1 block`}>
          {price}
        </span>
      </div>
    </motion.div>
  );
};

export default function KonfiguratorLyonTest() {
  // State pre všetky možnosti
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("");
  const [zaklady, setZaklady] = useState("");
  const [izolaciaNaVysenie, setIzolaciaNaVysenie] = useState("");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);

  // Základná cena
  const BASE_PRICE = 73431;

  // Cenník
  const CENY = {
    fasada: {
      "Šúchaná omietka Baumit + 100mm izolácia": 1817,
      "Drevo smrek - tmavý náter": 0,
      "Drevo smrek - svetlý náter": 0,
      "Thermowood 12cm": 7675,
      "Spájané falcované panely": 5694,
      "Smrekovec": 3850
    },
    zaklady: {
      "Bez základov": 0,
      "Pásové betónové": 13592,
      "Vruty": 5160
    },
    izolacia: {
      "Žiadna": 0,
      "Izolácia navýšenie 50mm steny": 1694,
      "Izolácia navýšenie 100mm steny": 3377,
      "Izolácia navýšenie 150mm steny": 5071,
      "Izolácia navýšenie 200mm steny": 6765
    },
    tepelneCerpadlo: 4033,
    rekuperacia: 3630
  };

  // Kalkulácia celkovej ceny
  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    
    if (vonkajsiaFasada) total += CENY.fasada[vonkajsiaFasada] || 0;
    if (zaklady) total += CENY.zaklady[zaklady] || 0;
    if (izolaciaNaVysenie) total += CENY.izolacia[izolaciaNaVysenie] || 0;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    
    return total;
  }, [vonkajsiaFasada, zaklady, izolaciaNaVysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Konfigurátor - Lyon 88m²</h2>
        <p className="text-gray-600 mb-2">Základná cena: <span className="font-bold text-primary">{formatPrice(BASE_PRICE)}</span></p>
      </Card>

      <div className="space-y-6">
        {/* Položky zahrnuté v cene */}
        <Card className="p-6 bg-green-50 border-2 border-green-300">
          <h3 className="text-xl font-bold text-green-900 mb-4">✓ Zahrnuté v základnej cene</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile
              selected={true}
              onClick={() => {}}
              title="Drevo smrek - tmavý"
              subtitle="V cene"
              price="0 €"
              isPriced={false}
              isIncluded={true}
            />
            <Tile
              selected={true}
              onClick={() => {}}
              title="Drevo smrek - svetlý"
              subtitle="V cene"
              price="0 €"
              isPriced={false}
              isIncluded={true}
            />
          </div>
        </Card>

        {/* Vonkajšia fasáda */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vonkajšia fasáda *</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile
              selected={vonkajsiaFasada === "Drevo smrek - tmavý náter"}
              onClick={() => setVonkajsiaFasada("Drevo smrek - tmavý náter")}
              title="Drevo smrek - tmavý"
              subtitle="Štandard"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={vonkajsiaFasada === "Drevo smrek - svetlý náter"}
              onClick={() => setVonkajsiaFasada("Drevo smrek - svetlý náter")}
              title="Drevo smrek - svetlý"
              subtitle="Štandard"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={vonkajsiaFasada === "Šúchaná omietka Baumit + 100mm izolácia"}
              onClick={() => setVonkajsiaFasada("Šúchaná omietka Baumit + 100mm izolácia")}
              title="Šúchaná omietka"
              subtitle="Baumit + 100mm izolácia"
              price="+ 1 817 €"
              isPriced={true}
            />
            <Tile
              selected={vonkajsiaFasada === "Thermowood 12cm"}
              onClick={() => setVonkajsiaFasada("Thermowood 12cm")}
              title="Thermowood"
              subtitle="12cm"
              price="+ 7 675 €"
              isPriced={true}
            />
            <Tile
              selected={vonkajsiaFasada === "Spájané falcované panely"}
              onClick={() => setVonkajsiaFasada("Spájané falcované panely")}
              title="Falcované panely"
              subtitle="Spájané"
              price="+ 5 694 €"
              isPriced={true}
            />
            <Tile
              selected={vonkajsiaFasada === "Smrekovec"}
              onClick={() => setVonkajsiaFasada("Smrekovec")}
              title="Smrekovec"
              subtitle="Premium"
              price="+ 3 850 €"
              isPriced={true}
            />
          </div>
        </Card>

        {/* Základy */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Základy *</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile
              selected={zaklady === "Bez základov"}
              onClick={() => setZaklady("Bez základov")}
              title="Bez základov"
              subtitle="Nie sú potrebné"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={zaklady === "Pásové betónové"}
              onClick={() => setZaklady("Pásové betónové")}
              title="Pásové betónové"
              subtitle="Odporúčané"
              price="+ 13 592 €"
              isPriced={true}
              isA0Required={true}
            />
            <Tile
              selected={zaklady === "Vruty"}
              onClick={() => setZaklady("Vruty")}
              title="Vruty"
              subtitle="Alternatíva"
              price="+ 5 160 €"
              isPriced={true}
            />
          </div>
        </Card>

        {/* Izolácia navýšenie */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Izolácia navýšenie</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile
              selected={izolaciaNaVysenie === "Žiadna"}
              onClick={() => setIzolaciaNaVysenie("Žiadna")}
              title="Žiadna"
              subtitle="Štandardná"
              price="+ 0 €"
              isPriced={false}
            />
            <Tile
              selected={izolaciaNaVysenie === "Izolácia navýšenie 50mm steny"}
              onClick={() => setIzolaciaNaVysenie("Izolácia navýšenie 50mm steny")}
              title="50mm steny"
              subtitle="Navýšenie"
              price="+ 1 694 €"
              isPriced={true}
            />
            <Tile
              selected={izolaciaNaVysenie === "Izolácia navýšenie 100mm steny"}
              onClick={() => setIzolaciaNaVysenie("Izolácia navýšenie 100mm steny")}
              title="100mm steny"
              subtitle="Navýšenie"
              price="+ 3 377 €"
              isPriced={true}
            />
            <Tile
              selected={izolaciaNaVysenie === "Izolácia navýšenie 150mm steny"}
              onClick={() => setIzolaciaNaVysenie("Izolácia navýšenie 150mm steny")}
              title="150mm steny"
              subtitle="Navýšenie"
              price="+ 5 071 €"
              isPriced={true}
            />
            <Tile
              selected={izolaciaNaVysenie === "Izolácia navýšenie 200mm steny"}
              onClick={() => setIzolaciaNaVysenie("Izolácia navýšenie 200mm steny")}
              title="200mm steny"
              subtitle="Premium A0"
              price="+ 6 765 €"
              isPriced={true}
              isA0Required={true}
            />
          </div>
        </Card>

        {/* Tepelné čerpadlo a Rekuperácia - Pre A0 */}
        <Card className="p-6 bg-green-50 border-2 border-green-400">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">Pre energetický certifikát A0</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Tile
              selected={tepelneCerpadlo}
              onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)}
              title="Tepelné čerpadlo"
              subtitle="Povinné pre A0"
              price="+ 4 033 €"
              isPriced={true}
              isA0Required={true}
            />
            <Tile
              selected={rekuperacia}
              onClick={() => setRekuperacia(!rekuperacia)}
              title="Rekuperácia"
              subtitle="Povinné pre A0"
              price="+ 3 630 €"
              isPriced={true}
              isA0Required={true}
            />
          </div>
        </Card>

        {/* Celková cena */}
        <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Celková cena s DPH</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              Mám záujem
            </Button>
          </div>
        </Card>

        {/* Info boxy */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Rodinný dom A0 - Odporúčané
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Celoročné bývanie</li>
              <li>✓ Energetický certifikát A0</li>
              <li>✓ Premium izolácia 250/300mm</li>
              <li>✓ Tepelné čerpadlo + Rekuperácia</li>
              <li>✓ Možnosť trvalého pobytu</li>
              <li>✓ Spĺňa všetky normy pre rodinný dom</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-300">
            <h4 className="font-bold text-blue-900 mb-2">Rekreačná stavba - Ekonomická voľba</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Chata, záhradný domček</li>
              <li>✓ Celoročná izolácia 150/200mm</li>
              <li>✓ Bez energetického certifikátu</li>
              <li>✓ Nižšia cena</li>
              <li>✓ Spĺňa parametre rekreačnej stavby</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}