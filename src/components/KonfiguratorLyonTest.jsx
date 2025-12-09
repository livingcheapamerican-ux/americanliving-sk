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
  const [stresnaKrytina, setStresnaKrytina] = useState("");
  const [pergola, setPergola] = useState("");
  const [terasa, setTerasa] = useState("");
  const [povrchoveUpravy, setPovrchoveUpravy] = useState("");
  const [podlahy, setPodlahy] = useState("");
  const [dvere, setDvere] = useState("");
  const [vnutornaVymalba, setVnutornaVymalba] = useState(false);
  const [dlazba, setDlazba] = useState(false);
  const [kuchynskaLinka, setKuchynskaLinka] = useState(false);
  const [skrinky, setSkrinky] = useState(false);
  const [klimatizacia, setKlimatizacia] = useState("");
  const [rozvodyKureniaVody, setRozvodyKureniaVody] = useState(false);
  const [podlahovoKurenie, setPodlahovoKurenie] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitarnaKeramika, setSanitarnaKeramika] = useState(false);
  const [sprchovyKut, setSprchovyKut] = useState(false);

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
    pergola: {
      "Bez pergoly": 0,
      "Pergola 2,5 x 7,68m": 3488,
      "Pergola 2,5 x 9,88m": 4488,
      "Pergola 2,5 x 12,08m": 5488
    },
    terasa: {
      "Bez terasy": 0,
      "Terasa 2,5 x 7,68m": 1936,
      "Terasa 2,5 x 9,88m": 2486,
      "Terasa 2,5 x 12,08m": 2937
    },
    povrchoveUpravy: {
      "Bez úprav": 0,
      "Biele steny + PVC podlahy": 5467,
      "Biele steny + Designové podlahy": 6919,
      "Farbené steny + PVC podlahy": 6825,
      "Farbené steny + Designové podlahy": 8277
    },
    podlahy: {
      "Osb doska": 0,
      "Aquastel doska": 1000
    },
    dvere: {
      "Bez dverí": 0,
      "Vchodové dvere antracit": 363,
      "Vchodové dvere zlatý dub": 363
    },
    vnutornaVymalba: 1100,
    dlazba: 680,
    kuchynskaLinka: 2200,
    skrinky: 1650,
    klimatizacia: {
      "Bez klimatizácie": 0,
      "AC 3,5kW Midea": 700,
      "AC 5,2kW Midea": 900,
      "AC 6,6kW Midea": 1200
    },
    rozvodyKureniaVody: 725,
    podlahovoKurenie: 2662,
    bojler: 484,
    vodaKanalizacia: 846,
    sanitarnaKeramika: 726,
    sprchovyKut: 484
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
    if (pergola) total += CENY.pergola[pergola] || 0;
    if (terasa) total += CENY.terasa[terasa] || 0;
    if (povrchoveUpravy) total += CENY.povrchoveUpravy[povrchoveUpravy] || 0;
    if (podlahy) total += CENY.podlahy[podlahy] || 0;
    if (dvere) total += CENY.dvere[dvere] || 0;
    if (vnutornaVymalba) total += CENY.vnutornaVymalba;
    if (dlazba) total += CENY.dlazba;
    if (kuchynskaLinka) total += CENY.kuchynskaLinka;
    if (skrinky) total += CENY.skrinky;
    if (klimatizacia) total += CENY.klimatizacia[klimatizacia] || 0;
    if (rozvodyKureniaVody) total += CENY.rozvodyKureniaVody;
    if (podlahovoKurenie) total += CENY.podlahovoKurenie;
    if (bojler) total += CENY.bojler;
    if (vodaKanalizacia) total += CENY.vodaKanalizacia;
    if (sanitarnaKeramika) total += CENY.sanitarnaKeramika;
    if (sprchovyKut) total += CENY.sprchovyKut;
    
    return total;
  }, [vonkajsiaFasada, zaklady, izolaciaNaVysenie, tepelneCerpadlo, rekuperacia, stresnaKrytina, 
      pergola, terasa, povrchoveUpravy, podlahy, dvere, vnutornaVymalba, dlazba, kuchynskaLinka, 
      skrinky, klimatizacia, rozvodyKureniaVody, podlahovoKurenie, bojler, vodaKanalizacia, 
      sanitarnaKeramika, sprchovyKut]);

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

        {/* Stresná krytina */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Stresná krytina *</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={stresnaKrytina === "Pozinkovaný plech sivý"} onClick={() => setStresnaKrytina("Pozinkovaný plech sivý")} title="Pozinkovaný plech sivý" subtitle="Štandard" price="+ 0 €" isPriced={false} />
            <Tile selected={stresnaKrytina === "Pozinkovaný plech hnedý"} onClick={() => setStresnaKrytina("Pozinkovaný plech hnedý")} title="Pozinkovaný plech hnedý" subtitle="Štandard" price="+ 0 €" isPriced={false} />
            <Tile selected={stresnaKrytina === "Pozinkovaný plech antracit"} onClick={() => setStresnaKrytina("Pozinkovaný plech antracit")} title="Pozinkovaný plech antracit" subtitle="" price="+ 400 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech cihlový"} onClick={() => setStresnaKrytina("Škridplech cihlový")} title="Škridplech cihlový" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech hnedý"} onClick={() => setStresnaKrytina("Škridplech hnedý")} title="Škridplech hnedý" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech antracit"} onClick={() => setStresnaKrytina("Škridplech antracit")} title="Škridplech antracit" subtitle="" price="+ 1 452 €" isPriced={true} />
            <Tile selected={stresnaKrytina === "Škridplech sivý"} onClick={() => setStresnaKrytina("Škridplech sivý")} title="Škridplech sivý" subtitle="" price="+ 1 452 €" isPriced={true} />
          </div>
        </Card>

        {/* Pergola */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pergola</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={pergola === "Bez pergoly"} onClick={() => setPergola("Bez pergoly")} title="Bez pergoly" subtitle="" price="+ 0 €" isPriced={false} />
            <Tile selected={pergola === "Pergola 2,5 x 7,68m"} onClick={() => setPergola("Pergola 2,5 x 7,68m")} title="Pergola 2,5 x 7,68m" subtitle="" price="+ 3 488 €" isPriced={true} />
            <Tile selected={pergola === "Pergola 2,5 x 9,88m"} onClick={() => setPergola("Pergola 2,5 x 9,88m")} title="Pergola 2,5 x 9,88m" subtitle="" price="+ 4 488 €" isPriced={true} />
            <Tile selected={pergola === "Pergola 2,5 x 12,08m"} onClick={() => setPergola("Pergola 2,5 x 12,08m")} title="Pergola 2,5 x 12,08m" subtitle="" price="+ 5 488 €" isPriced={true} />
          </div>
        </Card>

        {/* Terasa */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Terasa</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={terasa === "Bez terasy"} onClick={() => setTerasa("Bez terasy")} title="Bez terasy" subtitle="" price="+ 0 €" isPriced={false} />
            <Tile selected={terasa === "Terasa 2,5 x 7,68m"} onClick={() => setTerasa("Terasa 2,5 x 7,68m")} title="Terasa 2,5 x 7,68m" subtitle="" price="+ 1 936 €" isPriced={true} />
            <Tile selected={terasa === "Terasa 2,5 x 9,88m"} onClick={() => setTerasa("Terasa 2,5 x 9,88m")} title="Terasa 2,5 x 9,88m" subtitle="" price="+ 2 486 €" isPriced={true} />
            <Tile selected={terasa === "Terasa 2,5 x 12,08m"} onClick={() => setTerasa("Terasa 2,5 x 12,08m")} title="Terasa 2,5 x 12,08m" subtitle="" price="+ 2 937 €" isPriced={true} />
          </div>
        </Card>

        {/* Povrchové úpravy */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Povrchové úpravy steny a podlahy</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={povrchoveUpravy === "Bez úprav"} onClick={() => setPovrchoveUpravy("Bez úprav")} title="Bez úprav" subtitle="" price="+ 0 €" isPriced={false} />
            <Tile selected={povrchoveUpravy === "Biele steny + PVC podlahy"} onClick={() => setPovrchoveUpravy("Biele steny + PVC podlahy")} title="Biele steny + PVC" subtitle="" price="+ 5 467 €" isPriced={true} />
            <Tile selected={povrchoveUpravy === "Biele steny + Designové podlahy"} onClick={() => setPovrchoveUpravy("Biele steny + Designové podlahy")} title="Biele steny + Design" subtitle="" price="+ 6 919 €" isPriced={true} />
            <Tile selected={povrchoveUpravy === "Farbené steny + PVC podlahy"} onClick={() => setPovrchoveUpravy("Farbené steny + PVC podlahy")} title="Farbené steny + PVC" subtitle="" price="+ 6 825 €" isPriced={true} />
            <Tile selected={povrchoveUpravy === "Farbené steny + Designové podlahy"} onClick={() => setPovrchoveUpravy("Farbené steny + Designové podlahy")} title="Farbené steny + Design" subtitle="" price="+ 8 277 €" isPriced={true} />
          </div>
        </Card>

        {/* Podlahy */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Podlahy</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={podlahy === "Osb doska"} onClick={() => setPodlahy("Osb doska")} title="Osb doska" subtitle="Štandard" price="+ 0 €" isPriced={false} />
            <Tile selected={podlahy === "Aquastel doska"} onClick={() => setPodlahy("Aquastel doska")} title="Aquastel doska" subtitle="" price="+ 1 000 €" isPriced={true} />
          </div>
        </Card>

        {/* Dvere */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vchodové dvere</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={dvere === "Bez dverí"} onClick={() => setDvere("Bez dverí")} title="Bez dverí" subtitle="" price="+ 0 €" isPriced={false} />
            <Tile selected={dvere === "Vchodové dvere antracit"} onClick={() => setDvere("Vchodové dvere antracit")} title="Dvere antracit" subtitle="" price="+ 363 €" isPriced={true} />
            <Tile selected={dvere === "Vchodové dvere zlatý dub"} onClick={() => setDvere("Vchodové dvere zlatý dub")} title="Dvere zlatý dub" subtitle="" price="+ 363 €" isPriced={true} />
          </div>
        </Card>

        {/* Ostatné položky - checkboxy */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ostatné úpravy</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={vnutornaVymalba} onClick={() => setVnutornaVymalba(!vnutornaVymalba)} title="Vnútorná vymaľba" subtitle="" price="+ 1 100 €" isPriced={true} />
            <Tile selected={dlazba} onClick={() => setDlazba(!dlazba)} title="Dlažba v kúpeľni" subtitle="" price="+ 680 €" isPriced={true} />
            <Tile selected={kuchynskaLinka} onClick={() => setKuchynskaLinka(!kuchynskaLinka)} title="Kuchynská linka" subtitle="" price="+ 2 200 €" isPriced={true} />
            <Tile selected={skrinky} onClick={() => setSkrinky(!skrinky)} title="Skrinky do kúpeľne" subtitle="" price="+ 1 650 €" isPriced={true} />
          </div>
        </Card>

        {/* Klimatizácia */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Klimatizácia</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={klimatizacia === "Bez klimatizácie"} onClick={() => setKlimatizacia("Bez klimatizácie")} title="Bez klimatizácie" subtitle="" price="+ 0 €" isPriced={false} />
            <Tile selected={klimatizacia === "AC 3,5kW Midea"} onClick={() => setKlimatizacia("AC 3,5kW Midea")} title="AC 3,5kW Midea" subtitle="" price="+ 700 €" isPriced={true} />
            <Tile selected={klimatizacia === "AC 5,2kW Midea"} onClick={() => setKlimatizacia("AC 5,2kW Midea")} title="AC 5,2kW Midea" subtitle="" price="+ 900 €" isPriced={true} />
            <Tile selected={klimatizacia === "AC 6,6kW Midea"} onClick={() => setKlimatizacia("AC 6,6kW Midea")} title="AC 6,6kW Midea" subtitle="" price="+ 1 200 €" isPriced={true} />
          </div>
        </Card>

        {/* Kúrenie a voda */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Kúrenie a voda</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={rozvodyKureniaVody} onClick={() => setRozvodyKureniaVody(!rozvodyKureniaVody)} title="Rozvody kúrenia a vody" subtitle="" price="+ 725 €" isPriced={true} />
            <Tile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} title="Podlahové kúrenie" subtitle="" price="+ 2 662 €" isPriced={true} />
            <Tile selected={bojler} onClick={() => setBojler(!bojler)} title="Bojler" subtitle="" price="+ 484 €" isPriced={true} />
            <Tile selected={vodaKanalizacia} onClick={() => setVodaKanalizacia(!vodaKanalizacia)} title="Voda a kanalizácia" subtitle="" price="+ 846 €" isPriced={true} />
          </div>
        </Card>

        {/* Sanita */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sanitárne vybavenie</h3>
          <div className="grid grid-cols-2 gap-3">
            <Tile selected={sanitarnaKeramika} onClick={() => setSanitarnaKeramika(!sanitarnaKeramika)} title="Sanitárna keramika" subtitle="" price="+ 726 €" isPriced={true} />
            <Tile selected={sprchovyKut} onClick={() => setSprchovyKut(!sprchovyKut)} title="Sprchový kút" subtitle="" price="+ 484 €" isPriced={true} />
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