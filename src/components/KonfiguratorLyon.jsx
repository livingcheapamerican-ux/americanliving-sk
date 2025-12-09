import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Zap, Send } from "lucide-react";
import { motion } from "framer-motion";

const Tile = ({ selected, onClick, title, subtitle, price, isPriced, isA0, isIncluded }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative p-2 rounded-md cursor-pointer transition-all border ${
        selected 
          ? isA0 
            ? "bg-green-100 border-green-500 shadow-md" 
            : "bg-blue-100 border-blue-500 shadow-md"
          : isA0
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : isIncluded
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] px-1 py-0 z-10">
          ⚡A0
        </Badge>
      )}
      
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <span className="font-semibold text-gray-800 text-xs block leading-tight">{title}</span>
        {subtitle && <span className="text-[9px] text-gray-500 block mt-0.5">{subtitle}</span>}
        <span className={`text-[10px] font-bold block mt-1 ${isPriced ? "text-green-600" : "text-gray-400"}`}>
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Účel stavby */}
      <Card className="p-2 mb-2">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
          <Home className="w-4 h-4 text-blue-600" />
          Účel stavby
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Tile selected={ucel === "chata"} onClick={() => setUcel("chata")} title="Chata / Záhradný domček" subtitle="Rekreačná stavba" price="0 €" isPriced={false} isIncluded={true} />
          <Tile selected={ucel === "rodinny"} onClick={() => setUcel("rodinny")} title="Rodinný dom" subtitle="Trvalé bývanie" price="0 €" isPriced={false} />
        </div>
      </Card>

      {/* Kolaudácia */}
      {ucel === "rodinny" && (
        <Card className="p-2 mb-2 bg-green-50 border border-green-300">
          <h3 className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-green-600" />
            Kolaudácia
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Tile selected={kolaudacia === "bez_a0"} onClick={() => setKolaudacia("bez_a0")} title="Bez kolaudácie A0" subtitle="Bez admin." price="0 €" isPriced={false} />
            <Tile selected={kolaudacia === "s_a0"} onClick={() => setKolaudacia("s_a0")} title="S kolaudáciou A0" subtitle="Projekt + Certif." price="+ 3 745,35 €" isPriced={true} isA0={true} />
          </div>
        </Card>
      )}

      {/* Hlavný konfigurátor - oddelený červenou čiarou */}
      <div className="relative">
        {/* Červená deliaca čiara */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500 z-10 transform -translate-x-1/2"></div>
        
        <div className="grid grid-cols-2 gap-2">

        {/* ĽAVÝ STĹPEC - V CENE (0 €) */}
        <div className="space-y-2">
          <div className="bg-green-100 border border-green-400 rounded-md p-2">
            <h4 className="text-xs font-bold text-green-800 mb-1 text-center">✅ V CENE ZAHRNUTÉ</h4>
          </div>

          {/* Izolácia štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Izolácia štandard:</p>
            <Tile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} title="Steny 150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <div className="mt-1">
              <Tile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} title="Podlaha 150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
            <div className="mt-1">
              <Tile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} title="Strop 150mm" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
          </Card>

          {/* Vykurovanie štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Vykurovanie:</p>
            <Tile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} title="Príprava na kúrenie" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <div className="mt-1">
              <Tile selected={rekuperacia === "nie"} onClick={() => setRekuperacia("nie")} title="Bez rekuperácie" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
          </Card>

          {/* Fasáda štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Fasáda:</p>
            <Tile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} title="Drevo smrek" subtitle="Tmavý/Svetlý" price="0 €" isPriced={false} isIncluded={true} />
          </Card>

          {/* Strecha štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Strecha:</p>
            <Tile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} title="Korugovaný plech" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            <div className="mt-1">
              <Tile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} title="Bez odkvapov" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
          </Card>

          {/* Okná a dvere štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Okná (3-sklo):</p>
            <div className="grid grid-cols-3 gap-1">
              <Tile selected={okna === "biele"} onClick={() => setOkna("biele")} title="Biele" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
              <Tile selected={okna === "antracit"} onClick={() => setOkna("antracit")} title="Antracit" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
              <Tile selected={okna === "hnede"} onClick={() => setOkna("hnede")} title="Hnedé" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
            <p className="text-[10px] font-bold text-gray-700 mb-1 mt-2">Vchodové dvere:</p>
            <Tile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} title="Kovovo-plastové" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          </Card>

          {/* Interiér štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Interiér:</p>
            <Tile selected={obkladStien === "smrek"} onClick={() => setObkladStien("smrek")} title="Smrek 8/12cm" subtitle="Prírodný" price="0 €" isPriced={false} isIncluded={true} />
            <div className="mt-1">
              <Tile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} title="Laminát" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
            <div className="mt-1">
              <Tile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} title="Krídlové dvere" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
          </Card>

          {/* Elektro štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Elektroinštalácia:</p>
            <Tile selected={elektro === "eu"} onClick={() => setElektro("eu")} title="EU štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          </Card>

          {/* Kúpeľňa štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Kúpeľňa:</p>
            <Tile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} title="Sprcha štandard" subtitle="WC Geberit" price="0 €" isPriced={false} isIncluded={true} />
            <div className="mt-1">
              <Tile selected={bateria === "standard"} onClick={() => setBateria("standard")} title="Batéria štandard" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
            </div>
          </Card>

          {/* Základy štandard */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Základy:</p>
            <Tile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} title="Bez základov" subtitle="" price="0 €" isPriced={false} isIncluded={true} />
          </Card>
        </div>

        {/* PRAVÝ STĹPEC - PRÍPLATKY */}
        <div className="space-y-2">
          <div className="bg-red-100 border border-red-400 rounded-md p-2">
            <h4 className="text-xs font-bold text-red-800 mb-1 text-center">💰 ZA PRÍPLATOK</h4>
          </div>

          {/* Izolácia upgrade */}
          <Card className="p-2 bg-green-50">
            <p className="text-[10px] font-bold text-green-800 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />Izolácia Premium (A0):
            </p>
            <Tile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} title="Steny 200mm" subtitle="" price="+ 1 799 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} title="Steny 250mm" subtitle="Premium" price="+ 1 558 €" isPriced={true} isA0={true} />
            </div>
            <div className="mt-1">
              <Tile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} title="Podlaha 200mm" subtitle="" price="+ 334 €" isPriced={true} isA0={true} />
            </div>
            <div className="mt-1">
              <Tile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} title="Strop 200mm" subtitle="" price="+ 271 €" isPriced={true} isA0={true} />
            </div>
          </Card>

          {/* Vykurovanie upgrade */}
          <Card className="p-2 bg-green-50">
            <p className="text-[10px] font-bold text-green-800 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />Vykurovanie (A0):
            </p>
            <Tile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} title="Tepelné čerpadlo" subtitle="Vzduch/vzduch" price="+ 2 889 €" isPriced={true} isA0={true} />
            <div className="mt-1">
              <Tile selected={rekuperacia === "ano"} onClick={() => setRekuperacia("ano")} title="Rekuperácia" subtitle="Spät. zisk." price="+ 1 155 €" isPriced={true} isA0={true} />
            </div>
            <div className="mt-1">
              <Tile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} title="Podlah. kúrenie" subtitle="" price="+ 2 253 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} title="Príprava krb" subtitle="" price="+ 579 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} title="Ochrana kachle" subtitle="" price="+ 1 280 €" isPriced={true} />
            </div>
          </Card>



          {/* Fasáda upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Fasáda upgrade:</p>
            <Tile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} title="Šúchaná omietka" subtitle="Baumit +100mm" price="+ 1 581 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} title="Smrekovec" subtitle="" price="+ 3 350 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} title="Falcované panely" subtitle="" price="+ 4 954 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} title="Thermowood" subtitle="" price="+ 6 677 €" isPriced={true} />
            </div>
          </Card>

          {/* Strecha upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Strecha upgrade:</p>
            <Tile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} title="Falcované panely" subtitle="" price="+ 3 228 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} title="Odkvapy" subtitle="Vo farbe strechy" price="+ 1 502 €" isPriced={true} />
            </div>
          </Card>

          {/* Dvere upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Vchodové dvere:</p>
            <Tile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} title="Kovové dvere" subtitle="" price="+ 278 €" isPriced={true} />
          </Card>

          {/* Interiér upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Obklad stien:</p>
            <Tile selected={obkladStien === "biely"} onClick={() => setObkladStien("biely")} title="Biely náter" subtitle="" price="+ 1 525 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={obkladStien === "osb"} onClick={() => setObkladStien("osb")} title="OSB + Laminát" subtitle="" price="+ 4 593 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={obkladStien === "sadrokarton"} onClick={() => setObkladStien("sadrokarton")} title="Sadrokartón" subtitle="Tapeta" price="+ 6 834 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} title="Posuvné dvere" subtitle="" price="+ 427 €" isPriced={true} />
            </div>
          </Card>

          {/* Elektro upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Elektro upgrade:</p>
            <Tile selected={elektro === "cz"} onClick={() => setElektro("cz")} title="CZ/SK štandard" subtitle="" price="+ 460 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={elektro === "ge"} onClick={() => setElektro("ge")} title="GE štandard" subtitle="" price="+ 1 583 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} title="Bleskozvod" subtitle="" price="+ 856 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={prepat} onClick={() => setPrepat(!prepat)} title="Prepäť. ochrana" subtitle="" price="+ 311 €" isPriced={true} />
            </div>
          </Card>

          {/* Kúpeľňa upgrade */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Kúpeľňa upgrade:</p>
            <Tile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} title="Sprcha Radaway" subtitle="" price="+ 646 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={vana} onClick={() => setVana(!vana)} title="Vaňa" subtitle="" price="+ 501 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} title="Grohe batéria" subtitle="" price="+ 139 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={skrinka} onClick={() => setSkrinka(!skrinka)} title="Skrinka" subtitle="S umývadlom" price="+ 434 €" isPriced={true} />
            </div>
          </Card>

          {/* Služby a Zakladanie */}
          <Card className="p-2 bg-green-50">
            <p className="text-[10px] font-bold text-green-800 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />Inžiniering (A0):
            </p>
            <Tile selected={inziniering} onClick={() => setInziniering(!inziniering)} title="Inžiniering" subtitle="Stav. povolenie" price="+ 2 774 €" isPriced={true} isA0={true} />
            <div className="mt-1">
              <Tile selected={revizia} onClick={() => setRevizia(!revizia)} title="Revízna dok." subtitle="" price="+ 1 605 €" isPriced={true} />
            </div>
          </Card>

          {/* Základy */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Základy:</p>
            <Tile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} title="Zemné vruty" subtitle="" price="+ 4 494 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} title="Betónové pätky" subtitle="" price="+ 2 568 €" isPriced={true} />
            </div>
            <div className="mt-1">
              <Tile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} title="Pásové betónové" subtitle="" price="+ 11 825 €" isPriced={true} />
            </div>
          </Card>

          {/* Realizácia */}
          <Card className="p-2">
            <p className="text-[10px] font-bold text-gray-700 mb-1">Realizácia:</p>
            <Tile selected={montaz} onClick={() => setMontaz(!montaz)} title="Montáž domu" subtitle="" price="+ 4 806 €" isPriced={true} />
            <div className="mt-1">
              <Tile selected={doprava} onClick={() => setDoprava(!doprava)} title="Doprava" subtitle="" price="+ 8 928 €" isPriced={true} />
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Footer - kompaktný */}
      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-2 shadow-2xl z-50 mt-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1">
            <p className="text-[9px] text-slate-400">Základ: {formatPrice(BASE_PRICE)} | Doplnky: {formatPrice(totalPrice - BASE_PRICE)}</p>
            <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-xl text-xs h-8 px-3">
            <Send className="w-3 h-3 mr-1" />
            Mám záujem
          </Button>
        </div>
      </div>
    </div>
  );
}