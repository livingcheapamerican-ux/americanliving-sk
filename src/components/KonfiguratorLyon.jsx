import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Zap, Send } from "lucide-react";
import { motion } from "framer-motion";

const Tile = ({ selected, onClick, title, subtitle, price, isPriced, isA0, isIncluded }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-3 rounded-lg cursor-pointer transition-all border-2 ${
        selected 
          ? isA0 
            ? "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-300" 
            : "bg-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-300"
          : isA0
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : isIncluded
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 z-10">
          <Sparkles className="w-3 h-3 mr-1 inline" />A0
        </Badge>
      )}
      
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <span className="font-semibold text-gray-800 text-sm block mb-1">{title}</span>
        {subtitle && <span className="text-xs text-gray-500 block mb-2">{subtitle}</span>}
        <span className={`text-xs font-bold block ${isPriced ? "text-green-600" : "text-gray-400"}`}>
          {price}
        </span>
      </div>
    </motion.div>
  );
};

export default function KonfiguratorLyon() {
  const BASE_PRICE = 73431;
  
  // State
  const [ucel, setUcel] = useState("chata");
  const [kolaudacia, setKolaudacia] = useState("bez_a0");
  const [izolaciaStien, setIzolaciaStien] = useState("150mm");
  const [izolaciaPodlahy, setIzolaciaPodlahy] = useState("150mm");
  const [izolaciaStropu, setIzolaciaStropu] = useState("150mm");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState("nie");
  const [rekuperacia, setRekuperacia] = useState("nie");
  const [podlahovoKurenie, setPodlahovoKurenie] = useState(false);
  const [pripravaNaKrb, setPripravaNaKrb] = useState(false);
  const [ochranaKachle, setOchranaKachle] = useState(false);
  const [fasada, setFasada] = useState("drevo_smrek");
  const [strecha, setStrecha] = useState("korugovan_plech");
  const [odkvapy, setOdkvapy] = useState("nie");
  const [okna, setOkna] = useState("biele");
  const [vchodoveDvere, setVchodoveDvere] = useState("plastove");
  const [obkladStien, setObkladStien] = useState("smrek");
  const [podlaha, setPodlaha] = useState("laminat");
  const [interieroveDvere, setInterieroveDvere] = useState("kridlove");
  const [elektro, setElektro] = useState("eu");
  const [bleskozvod, setBleskozvod] = useState(false);
  const [prepat, setPrepat] = useState(false);
  const [kupelna, setKupelna] = useState("standard");
  const [sprchovyKut, setSprchovyKut] = useState("standard");
  const [vana, setVana] = useState(false);
  const [bateria, setBateria] = useState("standard");
  const [skrinka, setSkrinka] = useState(false);
  const [inziniering, setInziniering] = useState(false);
  const [revizia, setRevizia] = useState(false);
  const [zaklady, setZaklady] = useState("bez");
  const [montaz, setMontaz] = useState(false);
  const [doprava, setDoprava] = useState(false);

  const CENY = {
    kolaudacia: { s_a0: 3745.35 },
    izolacia_stien: { "200mm": 1799.16, "250mm": 1558.17 },
    izolacia_podlahy: { "200mm": 334.08 },
    izolacia_stropu: { "200mm": 271.44 },
    tepelne_cerpadlo: { ano: 2889.27 },
    rekuperacia: { ano: 1155.36 },
    podlahove_kurenie: 2253.30,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada: { omietka: 1580.79, smrekovec: 3349.50, falcovane: 4953.78, thermowood: 6677.25 },
    strecha: { falcovane: 3227.70 },
    odkvapy: 1502.49,
    dvere: { kovove: 278.40 },
    obklad: { biely: 1525.11, osb: 4592.73, sadrokarton: 6833.85 },
    dvere_posuvne: 427.17,
    elektro: { cz: 460.23, ge: 1583.40 },
    bleskozvod: 856.08,
    prepat: 311.46,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    inziniering: 2773.56,
    revizia: 1605.15,
    zaklady: { vruty: 4494.42, patky: 2568.24, pasove: 11825.04 },
    montaz: 4805.88,
    doprava: 8927.94
  };

  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    
    if (kolaudacia === "s_a0") total += CENY.kolaudacia.s_a0;
    total += CENY.izolacia_stien[izolaciaStien] || 0;
    total += CENY.izolacia_podlahy[izolaciaPodlahy] || 0;
    total += CENY.izolacia_stropu[izolaciaStropu] || 0;
    if (tepelneCerpadlo === "ano") total += CENY.tepelne_cerpadlo.ano;
    if (rekuperacia === "ano") total += CENY.rekuperacia.ano;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie;
    if (pripravaNaKrb) total += CENY.pripravaKrb;
    if (ochranaKachle) total += CENY.ochranaKachle;
    total += CENY.fasada[fasada] || 0;
    total += CENY.strecha[strecha] || 0;
    if (odkvapy === "ano") total += CENY.odkvapy;
    total += CENY.dvere[vchodoveDvere] || 0;
    total += CENY.obklad[obkladStien] || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne;
    total += CENY.elektro[elektro] || 0;
    if (bleskozvod) total += CENY.bleskozvod;
    if (prepat) total += CENY.prepat;
    if (sprchovyKut === "radaway") total += CENY.sprchovyKut;
    if (vana) total += CENY.vana;
    if (bateria === "grohe") total += CENY.bateria;
    if (skrinka) total += CENY.skrinka;
    if (inziniering) total += CENY.inziniering;
    if (revizia) total += CENY.revizia;
    total += CENY.zaklady[zaklady] || 0;
    if (montaz) total += CENY.montaz;
    if (doprava) total += CENY.doprava;
    
    return total;
  }, [kolaudacia, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, sprchovyKut, vana, bateria,
      skrinka, inziniering, revizia, zaklady, montaz, doprava]);

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  return (
    <div className="w-full">
      {/* Účel stavby */}
      <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          1. Účel stavby
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={ucel === "chata"} onClick={() => setUcel("chata")} title="Chata / Záhradný domček" subtitle="Rekreačná stavba" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={ucel === "rodinny"} onClick={() => setUcel("rodinny")} title="Rodinný dom" subtitle="Trvalé bývanie" price="0 €" isPriced={false} />
        </div>
      </Card>

      {/* Kolaudácia */}
      {ucel === "rodinny" && (
        <Card className="p-4 mb-4 bg-green-50 border-2 border-green-300">
          <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Kolaudácia rodinného domu
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={kolaudacia === "bez_a0"} onClick={() => setKolaudacia("bez_a0")} title="Bez kolaudácie A0" subtitle="Bez administratívy" price="0 €" isPriced={false} />
            <Tile selected={kolaudacia === "s_a0"} onClick={() => setKolaudacia("s_a0")} title="S kolaudáciou A0" subtitle="Projekt + Certifikácia" price="+ 3 745,35 €" isPriced={true} isA0={true} />
          </div>
        </Card>
      )}

      {/* Izolácia */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          2. Izolácia (Kľúčové pre A0)
        </h3>
        
        <p className="text-sm font-semibold mb-2">Izolácia stien:</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Tile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} title="150mm" subtitle="Rekreačné" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} title="200mm" subtitle="" price="+ 1 799,16 €" isPriced={true} />
          <Tile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} title="250mm Premium" subtitle="Max úspora" price="+ 1 558,17 €" isPriced={true} isA0={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Izolácia podlahy:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} title="150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} title="200mm" subtitle="Tepelný komfort" price="+ 334,08 €" isPriced={true} isA0={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Izolácia stropu:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} title="150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} title="200mm" subtitle="Zabraňuje úniku" price="+ 271,44 €" isPriced={true} isA0={true} />
        </div>
      </Card>

      {/* Vykurovanie */}
      <Card className="p-4 mb-4 bg-green-50">
        <h3 className="text-base font-bold text-green-900 mb-3">3. Vykurovanie a Technológie</h3>
        
        <p className="text-sm font-semibold mb-2">Tepelné čerpadlo:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} title="Nie" subtitle="Bez čerpadla" price="0 €" isPriced={false} />
          <Tile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} title="Tepelné čerpadlo" subtitle="Vzduch/vzduch" price="+ 2 889,27 €" isPriced={true} isA0={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Rekuperácia:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={rekuperacia === "nie"} onClick={() => setRekuperacia("nie")} title="Nie" subtitle="" price="0 €" isPriced={false} />
          <Tile selected={rekuperacia === "ano"} onClick={() => setRekuperacia("ano")} title="Rekuperácia + montáž" subtitle="Spätné získavanie" price="+ 1 155,36 €" isPriced={true} isA0={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Voliteľné:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} title="Podlahové kúrenie" subtitle="" price="+ 2 253,30 €" isPriced={true} />
          <Tile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} title="Príprava krb/komín" subtitle="" price="+ 578,55 €" isPriced={true} />
          <Tile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} title="Ochrana pre kachle" subtitle="" price="+ 1 279,77 €" isPriced={true} />
        </div>
      </Card>

      {/* Exteriér */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">4. Exteriér</h3>
        
        <p className="text-sm font-semibold mb-2">Fasáda:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} title="Drevo smrek" subtitle="Tmavý/Svetlý" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} title="Šúchaná omietka" subtitle="Baumit + 100mm" price="+ 1 580,79 €" isPriced={true} />
          <Tile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} title="Smrekovec" subtitle="" price="+ 3 349,50 €" isPriced={true} />
          <Tile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} title="Falcované panely" subtitle="" price="+ 4 953,78 €" isPriced={true} />
          <Tile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} title="Thermowood Borovica" subtitle="" price="+ 6 677,25 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Strecha:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} title="Korugovaný plech" subtitle="Imitácia falc" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} title="Falcované panely" subtitle="" price="+ 3 227,70 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Odkvapy:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} title="Nie" subtitle="" price="0 €" isPriced={false} />
          <Tile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} title="Áno" subtitle="Vo farbe strechy" price="+ 1 502,49 €" isPriced={true} />
        </div>
      </Card>

      {/* Okná a Dvere */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">5. Okná a Dvere</h3>
        
        <p className="text-sm font-semibold mb-2">Okná (3-sklo):</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Tile selected={okna === "biele"} onClick={() => setOkna("biele")} title="Biele" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={okna === "antracit"} onClick={() => setOkna("antracit")} title="Antracit" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={okna === "hnede"} onClick={() => setOkna("hnede")} title="Hnedé" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Vchodové dvere:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} title="Kovovo-plastové" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} title="Kovové dvere" subtitle="" price="+ 278,40 €" isPriced={true} />
        </div>
      </Card>

      {/* Interiér */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">6. Interiér</h3>
        
        <p className="text-sm font-semibold mb-2">Obklad stien:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={obkladStien === "smrek"} onClick={() => setObkladStien("smrek")} title="Smrek 8cm/12cm" subtitle="Prírodný vzhľad" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={obkladStien === "biely"} onClick={() => setObkladStien("biely")} title="Biely náter" subtitle="Bez vzoru dreva" price="+ 1 525,11 €" isPriced={true} />
          <Tile selected={obkladStien === "osb"} onClick={() => setObkladStien("osb")} title="OSB + Laminát" subtitle="" price="+ 4 592,73 €" isPriced={true} />
          <Tile selected={obkladStien === "sadrokarton"} onClick={() => setObkladStien("sadrokarton")} title="Sadrokartón" subtitle="Tapeta + maľovka" price="+ 6 833,85 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Podlaha:</p>
        <div className="grid grid-cols-1 gap-2 mb-3">
          <Tile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} title="Laminát (rôzne dekory)" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Interiérové dvere:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} title="Klasické krídlové" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} title="Posuvné dvere" subtitle="" price="+ 427,17 €" isPriced={true} />
        </div>
      </Card>

      {/* Elektroinštalácia */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">7. Elektroinštalácia</h3>
        
        <p className="text-sm font-semibold mb-2">Rozvody:</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Tile selected={elektro === "eu"} onClick={() => setElektro("eu")} title="EU štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={elektro === "cz"} onClick={() => setElektro("cz")} title="CZ/SK" subtitle="Zásuvky, istenie" price="+ 460,23 €" isPriced={true} />
          <Tile selected={elektro === "ge"} onClick={() => setElektro("ge")} title="GE štandard" subtitle="" price="+ 1 583,40 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Bezpečnosť:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} title="Bleskozvod" subtitle="" price="+ 856,08 €" isPriced={true} />
          <Tile selected={prepat} onClick={() => setPrepat(!prepat)} title="Prepäťová ochrana" subtitle="" price="+ 311,46 €" isPriced={true} />
        </div>
      </Card>

      {/* Kúpeľňa */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">8. Kúpeľňa a Sanita</h3>
        
        <p className="text-sm font-semibold mb-2">Vybavenie:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} title="Sprchový kút štandard" subtitle="WC Geberit" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} title="Sprchový kút Radaway" subtitle="" price="+ 645,54 €" isPriced={true} />
          <Tile selected={vana} onClick={() => setVana(!vana)} title="Vaňa" subtitle="" price="+ 501,12 €" isPriced={true} />
          <Tile selected={bateria === "standard"} onClick={() => setBateria("standard")} title="Batéria štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} title="Grohe batéria" subtitle="" price="+ 139,20 €" isPriced={true} />
          <Tile selected={skrinka} onClick={() => setSkrinka(!skrinka)} title="Skrinka s umývadlom" subtitle="" price="+ 434,13 €" isPriced={true} />
        </div>
      </Card>

      {/* Služby */}
      <Card className="p-4 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">9. Služby a Zakladanie</h3>
        
        <p className="text-sm font-semibold mb-2">Inžiniering:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={inziniering} onClick={() => setInziniering(!inziniering)} title="Inžiniering" subtitle="Stavebné povolenie" price="+ 2 773,56 €" isPriced={true} isA0={true} />
          <Tile selected={revizia} onClick={() => setRevizia(!revizia)} title="Revízna dok." subtitle="" price="+ 1 605,15 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Základy:</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Tile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} title="Bez základov" subtitle="" price="0 €" isPriced={false} />
          <Tile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} title="Zemné vruty" subtitle="" price="+ 4 494,42 €" isPriced={true} />
          <Tile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} title="Betónové pätky" subtitle="" price="+ 2 568,24 €" isPriced={true} />
          <Tile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} title="Pásové betónové" subtitle="" price="+ 11 825,04 €" isPriced={true} />
        </div>

        <p className="text-sm font-semibold mb-2">Realizácia:</p>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={montaz} onClick={() => setMontaz(!montaz)} title="Montáž domu" subtitle="" price="+ 4 805,88 €" isPriced={true} />
          <Tile selected={doprava} onClick={() => setDoprava(!doprava)} title="Doprava" subtitle="" price="+ 8 927,94 €" isPriced={true} />
        </div>
      </Card>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <p className="text-xs text-slate-400">Základná cena: {formatPrice(BASE_PRICE)}</p>
            <p className="text-xs text-slate-400">Doplnky: {formatPrice(totalPrice - BASE_PRICE)}</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              VÝSLEDNÁ CENA: {formatPrice(totalPrice)}
            </p>
            <p className="text-xs text-slate-400">s DPH</p>
          </div>
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-xl">
            <Send className="w-5 h-5 mr-2" />
            Odoslať konfiguráciu
          </Button>
        </div>
      </div>
    </div>
  );
}