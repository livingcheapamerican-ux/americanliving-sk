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
  const [verziaDomu, setVerziaDomu] = useState("");
  const [kolaudacia, setKolaudacia] = useState("");
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("");
  const [zaklady, setZaklady] = useState("");
  const [izolaciaNaVysenie, setIzolaciaNaVysenie] = useState("");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  const [stresnaKrytina, setStresnaKrytina] = useState("");
  const [podlahy, setPodlahy] = useState("");
  const [dvere, setDvere] = useState("");

  // Základná cena
  const BASE_PRICE = 73431;

  // Cenník podľa webu
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
      "50mm steny": 1694,
      "100mm steny": 3377,
      "150mm steny": 5071,
      "200mm steny": 6765
    },
    tepelneCerpadlo: 4033,
    rekuperacia: 3630,
    stresnaKrytina: {
      "Pozinkovaný plech sivý": 0,
      "Pozinkovaný plech hnedý": 0,
      "Pozinkovaný plech antracit": 400,
      "Škridplech cihlový": 1452,
      "Škridplech hnedý": 1452,
      "Škridplech antracit": 1452,
      "Škridplech sivý": 1452
    },
    podlahy: {
      "Osb doska": 0,
      "Aquastel doska": 1000
    },
    dvere: {
      "Bez dverí": 0,
      "Antracit": 363,
      "Zlatý dub": 363
    }
  };

  // Kalkulácia celkovej ceny
  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    
    if (vonkajsiaFasada) total += CENY.fasada[vonkajsiaFasada] || 0;
    if (zaklady) total += CENY.zaklady[zaklady] || 0;
    if (izolaciaNaVysenie) total += CENY.izolacia[izolaciaNaVysenie] || 0;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    if (stresnaKrytina) total += CENY.stresnaKrytina[stresnaKrytina] || 0;
    if (podlahy) total += CENY.podlahy[podlahy] || 0;
    if (dvere) total += CENY.dvere[dvere] || 0;
    
    return total;
  }, [vonkajsiaFasada, zaklady, izolaciaNaVysenie, tepelneCerpadlo, rekuperacia, stresnaKrytina, podlahy, dvere]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

  return (
    <div className="max-w-6xl mx-auto p-3">
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-bold text-primary mb-2">Lyon 88m²</h2>
        <p className="text-sm text-gray-600">Základná cena: <span className="font-bold text-primary">{formatPrice(BASE_PRICE)}</span></p>
      </Card>

      <div className="space-y-4">
        {/* Verzia domu */}
        <Card className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Vyberte verziu domu *</h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile
              selected={verziaDomu === "rodinny"}
              onClick={() => setVerziaDomu("rodinny")}
              title="Rodinný dom"
              subtitle="S kolaudáciou"
              price=""
              isPriced={false}
            />
            <Tile
              selected={verziaDomu === "chata"}
              onClick={() => setVerziaDomu("chata")}
              title="Chata/záhradný domček"
              subtitle="Holý dom"
              price=""
              isPriced={false}
            />
          </div>
        </Card>

        {/* Kolaudácia - zobrazí sa len ak je vybraná verzia */}
        {verziaDomu === "rodinny" && (
          <Card className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Kolaudácia domu *</h3>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={kolaudacia === "s_a0"}
                onClick={() => setKolaudacia("s_a0")}
                title="S kolaudáciou A0"
                subtitle=""
                price=""
                isPriced={false}
                isA0Required={true}
              />
              <Tile
                selected={kolaudacia === "bez_a0"}
                onClick={() => setKolaudacia("bez_a0")}
                title="Bez kolaudácie A0"
                subtitle=""
                price=""
                isPriced={false}
              />
            </div>
          </Card>
        )}

        {verziaDomu === "chata" && (
          <Card className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Kolaudácia chaty *</h3>
            <div className="grid grid-cols-2 gap-2">
              <Tile
                selected={kolaudacia === "s_kolaudaciou"}
                onClick={() => setKolaudacia("s_kolaudaciou")}
                title="S kolaudáciou"
                subtitle=""
                price=""
                isPriced={false}
              />
              <Tile
                selected={kolaudacia === "bez_kolaudacie"}
                onClick={() => setKolaudacia("bez_kolaudacie")}
                title="Bez kolaudácie"
                subtitle=""
                price=""
                isPriced={false}
              />
            </div>
          </Card>
        )}

        {/* Vonkajšia fasáda */}
        <Card className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Vonkajšia fasáda *</h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={vonkajsiaFasada === "Drevo smrek - tmavý"} onClick={() => setVonkajsiaFasada("Drevo smrek - tmavý")} title="Drevo smrek - tmavý" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <Tile selected={vonkajsiaFasada === "Drevo smrek - svetlý"} onClick={() => setVonkajsiaFasada("Drevo smrek - svetlý")} title="Drevo smrek - svetlý" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <Tile selected={vonkajsiaFasada === "Šúchaná omietka"} onClick={() => setVonkajsiaFasada("Šúchaná omietka")} title="Šúchaná omietka" subtitle="Baumit + 100mm" price="+ 1 817 €" isPriced={true} />
            <Tile selected={vonkajsiaFasada === "Thermowood"} onClick={() => setVonkajsiaFasada("Thermowood")} title="Thermowood 12cm" subtitle="" price="+ 7 675 €" isPriced={true} />
            <Tile selected={vonkajsiaFasada === "Falcované panely"} onClick={() => setVonkajsiaFasada("Falcované panely")} title="Falcované panely" subtitle="" price="+ 5 694 €" isPriced={true} />
            <Tile selected={vonkajsiaFasada === "Smrekovec"} onClick={() => setVonkajsiaFasada("Smrekovec")} title="Smrekovec" subtitle="" price="+ 3 850 €" isPriced={true} />
          </div>
        </Card>

        {/* Potrebné položky ku kolaudácii - zobrazí sa len ak je S kolaudáciou A0 */}
        {kolaudacia === "s_a0" && (
          <Card className="p-4 bg-green-50 border-2 border-green-400">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-bold text-green-900">Potrebné položky ku kolaudácii A0</h3>
            </div>
            
            {/* Základy - povinné pre A0 */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Základy * (povinné)</p>
              <div className="grid grid-cols-2 gap-2">
                <Tile selected={zaklady === "Pásové betónové"} onClick={() => setZaklady("Pásové betónové")} title="Pásové betónové" subtitle="Povinné pre A0" price="+ 13 592 €" isPriced={true} isA0Required={true} />
              </div>
            </div>

            {/* Izolácia - povinné pre A0 */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Izolácia navýšenie * (min. 150mm pre A0)</p>
              <div className="grid grid-cols-2 gap-2">
                <Tile selected={izolaciaNaVysenie === "150mm steny"} onClick={() => setIzolaciaNaVysenie("150mm steny")} title="150mm steny" subtitle="" price="+ 5 071 €" isPriced={true} isA0Required={true} />
                <Tile selected={izolaciaNaVysenie === "200mm steny"} onClick={() => setIzolaciaNaVysenie("200mm steny")} title="200mm steny" subtitle="Premium" price="+ 6 765 €" isPriced={true} isA0Required={true} />
              </div>
            </div>

            {/* Tepelné čerpadlo a Rekuperácia */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Kúrenie a vetranie (povinné pre A0)</p>
              <div className="grid grid-cols-2 gap-2">
                <Tile selected={tepelneCerpadlo} onClick={() => setTepelneCerpadlo(!tepelneCerpadlo)} title="Tepelné čerpadlo" subtitle="Povinné" price="+ 4 033 €" isPriced={true} isA0Required={true} />
                <Tile selected={rekuperacia} onClick={() => setRekuperacia(!rekuperacia)} title="Rekuperácia" subtitle="Povinné" price="+ 3 630 €" isPriced={true} isA0Required={true} />
              </div>
            </div>
          </Card>
        )}

        {/* Základy - pre ostatné verzie */}
        {kolaudacia !== "s_a0" && (
          <Card className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Základy *</h3>
            <div className="grid grid-cols-2 gap-2">
              <Tile selected={zaklady === "Bez základov"} onClick={() => setZaklady("Bez základov")} title="Bez základov" subtitle="" price="0 €" isPriced={false} />
              <Tile selected={zaklady === "Pásové betónové"} onClick={() => setZaklady("Pásové betónové")} title="Pásové betónové" subtitle="" price="+ 13 592 €" isPriced={true} />
              <Tile selected={zaklady === "Vruty"} onClick={() => setZaklady("Vruty")} title="Vruty" subtitle="" price="+ 5 160 €" isPriced={true} />
            </div>
          </Card>
        )}

        {/* Izolácia navýšenie - pre ostatné verzie */}
        {kolaudacia !== "s_a0" && (
          <Card className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Izolácia navýšenie</h3>
            <div className="grid grid-cols-2 gap-2">
              <Tile selected={izolaciaNaVysenie === "Žiadna"} onClick={() => setIzolaciaNaVysenie("Žiadna")} title="Žiadna" subtitle="Štandard 150/200mm" price="0 €" isPriced={false} />
              <Tile selected={izolaciaNaVysenie === "50mm steny"} onClick={() => setIzolaciaNaVysenie("50mm steny")} title="50mm steny" subtitle="" price="+ 1 694 €" isPriced={true} />
              <Tile selected={izolaciaNaVysenie === "100mm steny"} onClick={() => setIzolaciaNaVysenie("100mm steny")} title="100mm steny" subtitle="" price="+ 3 377 €" isPriced={true} />
              <Tile selected={izolaciaNaVysenie === "150mm steny"} onClick={() => setIzolaciaNaVysenie("150mm steny")} title="150mm steny" subtitle="" price="+ 5 071 €" isPriced={true} />
              <Tile selected={izolaciaNaVysenie === "200mm steny"} onClick={() => setIzolaciaNaVysenie("200mm steny")} title="200mm steny" subtitle="" price="+ 6 765 €" isPriced={true} />
            </div>
          </Card>
        )}

        {/* Stresná krytina */}
        <Card className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Stresná krytina *</h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={stresnaKrytina === "Plech sivý"} onClick={() => setStresnaKrytina("Plech sivý")} title="Plech sivý" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <Tile selected={stresnaKrytina === "Plech hnedý"} onClick={() => setStresnaKrytina("Plech hnedý")} title="Plech hnedý" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <Tile selected={stresnaKrytina === "Plech antracit"} onClick={() => setStresnaKrytina("Plech antracit")} title="Plech antracit" subtitle="" price="+ 400 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech cihlový"} onClick={() => setStresnaKrytina("Škridplech cihlový")} title="Škridplech cihlový" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech hnedý"} onClick={() => setStresnaKrytina("Škridplech hnedý")} title="Škridplech hnedý" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech antracit"} onClick={() => setStresnaKrytina("Škridplech antracit")} title="Škridplech antracit" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech sivý"} onClick={() => setStresnaKrytina("Škridplech sivý")} title="Škridplech sivý" subtitle="" price="+ 1 452 €" isPriced={true} />
          </div>
        </Card>

        {/* Podlahy */}
        <Card className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Podlahy</h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={podlahy === "Osb doska"} onClick={() => setPodlahy("Osb doska")} title="Osb doska" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <Tile selected={podlahy === "Aquastel doska"} onClick={() => setPodlahy("Aquastel doska")} title="Aquastel doska" subtitle="" price="+ 1 000 €" isPriced={true} />
          </div>
        </Card>

        {/* Dvere */}
        <Card className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Vchodové dvere</h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={dvere === "Bez dverí"} onClick={() => setDvere("Bez dverí")} title="Bez dverí" subtitle="" price="0 €" isPriced={false} />
            <Tile selected={dvere === "Antracit"} onClick={() => setDvere("Antracit")} title="Antracit" subtitle="" price="+ 363 €" isPriced={true} />
            <Tile selected={dvere === "Zlatý dub"} onClick={() => setDvere("Zlatý dub")} title="Zlatý dub" subtitle="" price="+ 363 €" isPriced={true} />
          </div>
        </Card>

        {/* Celková cena */}
        <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs mb-1">Celková cena s DPH</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              Mám záujem
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}