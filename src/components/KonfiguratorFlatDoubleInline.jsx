import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, AlertTriangle, CheckCircle, Calculator, RotateCcw, Eye
} from "lucide-react";

export default function KonfiguratorFlatDoubleInline({ dom }) {
  const BASE_PRICE = 59900;

  // State pre všetky voľby - rozšírené podľa screenshotov
  const [montazHolodomu, setMontazHolodomu] = useState("nie");
  const [cenaHolodomu, setCenaHolodomu] = useState("so_strechou");
  const [vstupneDvere, setVstupneDvere] = useState("ziadne");
  const [izolaciaNavysenie, setIzolaciaNavysenie] = useState("standard");
  
  const [elektroinstalacia, setElektroinstalacia] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitaKomplet, setSanitaKomplet] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  
  const [zaklady, setZaklady] = useState("bez");
  const [pripojkaSiete, setPripojkaSiete] = useState(false);
  
  const [inziniering, setInziniering] = useState(false);
  const [projektA0, setProjektA0] = useState(false);

  // Nové položky zo screenshotov
  const [dodatkovaIzolacia, setDodatkovaIzolacia] = useState("bez");
  const [interierHviezd, setInterierHviezd] = useState("bez");
  const [vonkajsiaKrytina, setVonkajsiaKrytina] = useState("bez");
  const [porchStilAntracit, setPorchStilAntracit] = useState(false);
  const [doplnokVybavenie, setDoplnokVybavenie] = useState(false);
  const [interiorPodlahy, setInteriorPodlahy] = useState("bez");
  const [elektrickePodlaha, setElektrickePodlaha] = useState(false);
  const [predlzenieDomy, setPredlzenieDomy] = useState("bez");
  const [dekorativnaPergola, setDekorativnaPergola] = useState(false);
  const [interierovoOkno, setInterierovoOkno] = useState(false);
  const [rohoveOkno, setRohoveOkno] = useState("bez");
  const [bocneOknoFixed, setBocneOknoFixed] = useState("bez");
  const [bocneOknoPripojenie, setBocneOknoPripojenie] = useState("bez");
  const [francuzskeAkroSokol, setFrancuzskeAkroSokol] = useState(false);
  const [doprava, setDoprava] = useState(false);
  const [dokumentaciaStavba, setDokumentaciaStavba] = useState(false);

  // Cenník
  const CENY = {
    montaz: { nie: 0, ano: 17970 },
    cenaHolodomu: { so_strechou: 0, bez_strechy: -3000 },
    dvere: { ziadne: 0, kovove: 720, plastove: 660 },
    izolacia: { standard: 0, zvysena: 5799, premium: 11600 },
    elektroinstalacia: 7400,
    vodaKanalizacia: 2380,
    sanitaKomplet: 1169,
    bojler: 246,
    tepelneCerpadlo: 5535,
    rekuperacia: 2700,
    zaklady: { bez: 0, skrutky: 8140, doska: 17946, pasove: 21079 },
    pripojkaSiete: 1501,
    inziniering: 2592,
    projektA0: 3500,
    // Nové položky
    dodatkovaIzolacia: { bez: 0, strecha_steny: 2800, strop_podlaha: 3200 },
    interierHviezd: { bez: 0, drevo_obklad: 4500, sadrokarton: 3800 },
    vonkajsiaKrytina: { bez: 0, drevo_plech: 0, falcovany_plech: 1200 },
    porchStilAntracit: 1800,
    doplnokVybavenie: 850,
    interiorPodlahy: { bez: 0, laminat: 2400, vinyl: 3200 },
    elektrickePodlaha: 3800,
    predlzenieDomy: { bez: 0, l2m: 11999, l4m: 19800, l6m: 28500, l8m: 35800 },
    dekorativnaPergola: 4500,
    interierovoOkno: 3900,
    rohoveOkno: { bez: 0, fixed3: 5800 },
    bocneOknoFixed: { bez: 0, v60x180: 890, v90x180: 1150 },
    bocneOknoPripojenie: { bez: 0, s60x60w: 650, s90x90w: 890, s120x60w: 1100 },
    francuzskeAkroSokol: 4900,
    doprava: 1690,
    dokumentaciaStavba: 4500
  };

  // Výpočet celkovej ceny
  const totalPrice = useMemo(() => {
    let total = BASE_PRICE;
    
    total += CENY.montaz[montazHolodomu];
    total += CENY.cenaHolodomu[cenaHolodomu];
    total += CENY.dvere[vstupneDvere];
    total += CENY.izolacia[izolaciaNavysenie];
    
    if (elektroinstalacia) total += CENY.elektroinstalacia;
    if (vodaKanalizacia) total += CENY.vodaKanalizacia;
    if (sanitaKomplet) total += CENY.sanitaKomplet;
    if (bojler) total += CENY.bojler;
    if (tepelneCerpadlo) total += CENY.tepelneCerpadlo;
    if (rekuperacia) total += CENY.rekuperacia;
    
    total += CENY.zaklady[zaklady];
    if (pripojkaSiete) total += CENY.pripojkaSiete;
    
    if (inziniering) total += CENY.inziniering;
    if (projektA0) total += CENY.projektA0;

    // Nové položky
    total += CENY.dodatkovaIzolacia[dodatkovaIzolacia];
    total += CENY.interierHviezd[interierHviezd];
    total += CENY.vonkajsiaKrytina[vonkajsiaKrytina];
    if (porchStilAntracit) total += CENY.porchStilAntracit;
    if (doplnokVybavenie) total += CENY.doplnokVybavenie;
    total += CENY.interiorPodlahy[interiorPodlahy];
    if (elektrickePodlaha) total += CENY.elektrickePodlaha;
    total += CENY.predlzenieDomy[predlzenieDomy];
    if (dekorativnaPergola) total += CENY.dekorativnaPergola;
    if (interierovoOkno) total += CENY.interierovoOkno;
    total += CENY.rohoveOkno[rohoveOkno];
    total += CENY.bocneOknoFixed[bocneOknoFixed];
    total += CENY.bocneOknoPripojenie[bocneOknoPripojenie];
    if (francuzskeAkroSokol) total += CENY.francuzskeAkroSokol;
    if (doprava) total += CENY.doprava;
    if (dokumentaciaStavba) total += CENY.dokumentaciaStavba;
    
    return total;
  }, [montazHolodomu, cenaHolodomu, vstupneDvere, izolaciaNavysenie, elektroinstalacia, 
      vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo, rekuperacia,
      zaklady, pripojkaSiete, inziniering, projektA0, dodatkovaIzolacia, interierHviezd,
      vonkajsiaKrytina, porchStilAntracit, doplnokVybavenie, interiorPodlahy, elektrickePodlaha,
      predlzenieDomy, dekorativnaPergola, interierovoOkno, rohoveOkno, bocneOknoFixed,
      bocneOknoPripojenie, francuzskeAkroSokol, doprava, dokumentaciaStavba]);

  const pricatkyCena = totalPrice - BASE_PRICE;

  // Kontrola A0 odporúčaní
  const a0Odporucania = useMemo(() => {
    if (!projektA0) return null;
    
    const chybajuce = [];
    if (izolaciaNavysenie !== "premium") chybajuce.push("Premium izolácia (250mm steny, 300mm strecha)");
    if (!tepelneCerpadlo) chybajuce.push("Tepelné čerpadlo / Klimatizácia");
    if (!rekuperacia) chybajuce.push("Rekuperácia");
    
    return chybajuce.length > 0 ? chybajuce : null;
  }, [projektA0, izolaciaNavysenie, tepelneCerpadlo, rekuperacia]);

  const formatPrice = (price) => price.toLocaleString('sk-SK') + " €";

  // Komponenta pre výber s obrázkami
  const ImageOption = ({ selected, onClick, label, price, image, disabled }) => (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`cursor-pointer border-2 rounded-lg p-2 transition-all ${
        selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-xs text-center p-1">Nie</span>
        )}
      </div>
      <p className="text-xs font-medium text-center truncate">{label}</p>
      <p className={`text-xs text-center ${price > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
        {price > 0 ? `+ ${formatPrice(price)}` : price < 0 ? `${formatPrice(price)}` : 'Zahrnuté'}
      </p>
    </div>
  );

  return (
    <Card className="p-6 mt-6 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-primary">Konfigurátor ceny</h2>
      </div>

      <div className="space-y-8">
        {/* Montáž holodomu */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Montáž sady domu</h3>
          <p className="text-xs text-gray-500 mb-3">- objednajte sadu Dvou&play s drevenej súčasti<br/>- dverá, topenie<br/>- základná izolácia<br/>- tepelná izolácia (180 mm - steny), 200 mm - podlaha a strecha)</p>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={montazHolodomu === "nie"}
              onClick={() => setMontazHolodomu("nie")}
              label="Nie"
              price={0}
            />
            <ImageOption
              selected={montazHolodomu === "ano"}
              onClick={() => setMontazHolodomu("ano")}
              label="Áno"
              price={17970}
            />
          </div>
        </div>

        {/* Cena montáže holodomu */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Cena montáže holodomu (cena za stále strany XD = závislosti od lokality)</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={cenaHolodomu === "so_strechou"}
              onClick={() => setCenaHolodomu("so_strechou")}
              label="Áno 17 970€"
              price={0}
            />
            <ImageOption
              selected={cenaHolodomu === "bez_strechy"}
              onClick={() => setCenaHolodomu("bez_strechy")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Vstupné dvere */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Vstupné dvere</h3>
          <div className="grid grid-cols-3 gap-3">
            <ImageOption
              selected={vstupneDvere === "ziadne"}
              onClick={() => setVstupneDvere("ziadne")}
              label="Štandard"
              price={0}
            />
            <ImageOption
              selected={vstupneDvere === "kovove"}
              onClick={() => setVstupneDvere("kovove")}
              label="Kovové 2 zámky"
              price={720}
            />
            <ImageOption
              selected={vstupneDvere === "plastove"}
              onClick={() => setVstupneDvere("plastove")}
              label="Plastovo-kovové"
              price={660}
            />
          </div>
        </div>

        {/* Základná elektrická inštalácia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Základná elektrická inštalácia (auto-upevní projekt)</h3>
          <p className="text-xs text-gray-500 mb-3">Elektroinštalácia: rám na ističov, rozvádzka, zďaleka, lete, dle schématu ohledně zvýšení, zásuvkomat, zásuvka/komat a elektrický spot/smer...</p>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={elektroinstalacia}
              onClick={() => setElektroinstalacia(true)}
              label="Áno 7400€"
              price={7400}
            />
            <ImageOption
              selected={!elektroinstalacia}
              onClick={() => setElektroinstalacia(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Rozvody vody a kanalizácie */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Rozvody vody a sanita zahnutie</h3>
          <div className="grid grid-cols-4 gap-3">
            <ImageOption
              selected={vodaKanalizacia && !sanitaKomplet && !bojler}
              onClick={() => { setVodaKanalizacia(true); setSanitaKomplet(false); setBojler(false); }}
              label="Rozvody vody s odpadnou na pripojenia na kanaliz..."
              price={2380}
            />
            <ImageOption
              selected={vodaKanalizacia && sanitaKomplet && !bojler}
              onClick={() => { setVodaKanalizacia(true); setSanitaKomplet(true); setBojler(false); }}
              label="Sanitárne vybavenie, WC spádov + 2 ..."
              price={2380 + 1169}
            />
            <ImageOption
              selected={vodaKanalizacia && sanitaKomplet && bojler}
              onClick={() => { setVodaKanalizacia(true); setSanitaKomplet(true); setBojler(true); }}
              label="Elektrický boiler"
              price={2380 + 1169 + 246}
            />
            <ImageOption
              selected={!vodaKanalizacia && !sanitaKomplet && !bojler}
              onClick={() => { setVodaKanalizacia(false); setSanitaKomplet(false); setBojler(false); }}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Prípojka na siete */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Prípojku na inžinierske siete (do10m)</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={pripojkaSiete}
              onClick={() => setPripojkaSiete(true)}
              label="Áno 1501€"
              price={1501}
            />
            <ImageOption
              selected={!pripojkaSiete}
              onClick={() => setPripojkaSiete(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Základy */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Základy: Cena základov je orientačná, ale to presnejšie ceny základov na tento typ domu. (potrebné uloženie a vyrovnanie)</h3>
          <div className="grid grid-cols-4 gap-3">
            <ImageOption
              selected={zaklady === "skrutky"}
              onClick={() => setZaklady("skrutky")}
              label="Pätky alebo pásiky"
              price={8140}
            />
            <ImageOption
              selected={zaklady === "doska"}
              onClick={() => setZaklady("doska")}
              label="Základová doska"
              price={17946}
            />
            <ImageOption
              selected={zaklady === "pasove"}
              onClick={() => setZaklady("pasove")}
              label="Pásové základy"
              price={21079}
            />
            <ImageOption
              selected={zaklady === "bez"}
              onClick={() => setZaklady("bez")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Tepelné čerpadlo */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-red-600">Konfigurátor polož, ktoré vyplyňajú štadničiek míľke dvestina</h3>
          <p className="text-xs text-gray-500 mb-3">Prístály s konečným výtlakom a vyzdvihte sa vložkou dvahodinku kvality, Vysvetli s vytiahnuť pláštňne na priadáme na kotadamu = energetická certifikácie do 1 drzačke všeobecnú podmistrom u uložište MAT ;-)</p>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={tepelneCerpadlo}
              onClick={() => setTepelneCerpadlo(true)}
              label="Áno 5535€"
              price={5535}
            />
            <ImageOption
              selected={!tepelneCerpadlo}
              onClick={() => setTepelneCerpadlo(false)}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Tepeln a jednotiek</p>
        </div>

        {/* Inžiniering stavebného povolenia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Inžiniering stavebného povolenia</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={inziniering}
              onClick={() => setInziniering(true)}
              label="Áno 2592€"
              price={2592}
            />
            <ImageOption
              selected={!inziniering}
              onClick={() => setInziniering(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Rekuperácia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Rekuperácia 5ks</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={rekuperacia}
              onClick={() => setRekuperacia(true)}
              label="Áno 2700€"
              price={2700}
            />
            <ImageOption
              selected={!rekuperacia}
              onClick={() => setRekuperacia(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Dodatková izolácia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Dodatková izolácia Strecha/Steny</h3>
          <div className="grid grid-cols-4 gap-3">
            <ImageOption
              selected={dodatkovaIzolacia === "strecha_steny"}
              onClick={() => setDodatkovaIzolacia("strecha_steny")}
              label="Dodatková izolac +50mm Strecha, Steny podlaha 100mm..."
              price={2800}
            />
            <ImageOption
              selected={dodatkovaIzolacia === "strop_podlaha"}
              onClick={() => setDodatkovaIzolacia("strop_podlaha")}
              label="podlahovaá izolać 20mm"
              price={3200}
            />
            <ImageOption
              selected={izolaciaNavysenie === "premium"}
              onClick={() => setIzolaciaNavysenie("premium")}
              label="Premium / A0 celková"
              price={11600}
            />
            <ImageOption
              selected={dodatkovaIzolacia === "bez" && izolaciaNavysenie !== "premium"}
              onClick={() => { setDodatkovaIzolacia("bez"); setIzolaciaNavysenie("standard"); }}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Projektant, Energetická certifikácia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Projektant, Energetická certifikácia</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={projektA0}
              onClick={() => setProjektA0(true)}
              label="Áno 3500€"
              price={3500}
            />
            <ImageOption
              selected={!projektA0}
              onClick={() => setProjektA0(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* A0 Upozornenie */}
        {projektA0 && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>✅ Gratulujem k získaniu certifikátu A0 ✅</strong>
            </p>
          </div>
        )}

        {a0Odporucania && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 mb-2">
                  Pre splnenie normy A0 odporúčame doplniť:
                </p>
                <ul className="space-y-1">
                  {a0Odporucania.map((item, index) => (
                    <li key={index} className="text-sm text-amber-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Interiér hviezd */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-red-600">Možnosti a vonkajší dizajn</h3>
        </div>

        {/* Interiér First */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Interiér First - správne okno, montáž prídechu</h3>
          <div className="grid grid-cols-3 gap-3">
            <ImageOption
              selected={interierHviezd === "drevo_obklad"}
              onClick={() => setInterierHviezd("drevo_obklad")}
              label="Drevobýv obklad interiér s hnezdost..."
              price={4500}
            />
            <ImageOption
              selected={interierHviezd === "sadrokarton"}
              onClick={() => setInterierHviezd("sadrokarton")}
              label="*Finálna: hviezd panel"
              price={3800}
            />
            <ImageOption
              selected={interierHviezd === "bez"}
              onClick={() => setInterierHviezd("bez")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Vonkajšia krytina */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Vonkajšia krytina Drevo / Falcovaný plech antracit - podla modelu domu - bez príplatku</h3>
          <div className="grid grid-cols-3 gap-3">
            <ImageOption
              selected={vonkajsiaKrytina === "drevo_plech"}
              onClick={() => setVonkajsiaKrytina("drevo_plech")}
              label="Drevo / Prílesné kryt. antracit pléch krať. príplatku"
              price={0}
            />
            <ImageOption
              selected={vonkajsiaKrytina === "falcovany_plech"}
              onClick={() => setVonkajsiaKrytina("falcovany_plech")}
              label="Falcovaný pléch v Rodbondené..."
              price={1200}
            />
            <ImageOption
              selected={vonkajsiaKrytina === "bez"}
              onClick={() => setVonkajsiaKrytina("bez")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Porch štíl Antracit */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Porch okna Antracit</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={porchStilAntracit}
              onClick={() => setPorchStilAntracit(true)}
              label="Áno +1 800€"
              price={1800}
            />
            <ImageOption
              selected={!porchStilAntracit}
              onClick={() => setPorchStilAntracit(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Doplnok výbavennie */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-red-600">Doplnok výbavennie</h3>
        </div>

        {/* Interiór podlahy */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Interiér podlahy - Sanitár (voda za VAT podla výberu, obrázkov)</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={interiorPodlahy === "laminat"}
              onClick={() => setInteriorPodlahy("laminat")}
              label="Áno 2 400€"
              price={2400}
            />
            <ImageOption
              selected={interiorPodlahy === "bez"}
              onClick={() => setInteriorPodlahy("bez")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Elektrické podlahové vykurovanie */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Elektrické podlahové vykurovanie s WIFI termostatom</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={elektrickePodlaha}
              onClick={() => setElektrickePodlaha(true)}
              label="Áno"
              price={3800}
            />
            <ImageOption
              selected={!elektrickePodlaha}
              onClick={() => setElektrickePodlaha(false)}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*CE jednotiek za zriče šíri 20 Fm lesy rkotky kého vývoz za kvietku. Nepotrželek bely na + Chin. 0000_LAWE 13, penelhootem štaty vodra, pree sekvencera: Nefer, HOP, ISO-WL Hovmblerg, kvalitatívno vadita, Wezotmburg, Fany + Bogotón</p>
        </div>

        {/* Predĺženie domu */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Predĺžene dĺžky domu, v násobkoch 1,1m</h3>
          <p className="text-xs text-gray-500 mb-3">*Rozloženie stien</p>
          <div className="grid grid-cols-5 gap-3">
            <ImageOption
              selected={predlzenieDomy === "l2m"}
              onClick={() => setPredlzenieDomy("l2m")}
              label="1,2 m (+1 m²)"
              price={11999}
            />
            <ImageOption
              selected={predlzenieDomy === "l4m"}
              onClick={() => setPredlzenieDomy("l4m")}
              label="2,4 m (+2 x m²)"
              price={19800}
            />
            <ImageOption
              selected={predlzenieDomy === "l6m"}
              onClick={() => setPredlzenieDomy("l6m")}
              label="3.6M m (+3 x m²)"
              price={28500}
            />
            <ImageOption
              selected={predlzenieDomy === "l8m"}
              onClick={() => setPredlzenieDomy("l8m")}
              label="4,8 m (+3 x m²)"
              price={35800}
            />
            <ImageOption
              selected={predlzenieDomy === "bez"}
              onClick={() => setPredlzenieDomy("bez")}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Dekoratívna pergola */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Dekoratívna pergola na Konsólou</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={dekorativnaPergola}
              onClick={() => setDekorativnaPergola(true)}
              label="Áno +4 500€"
              price={4500}
            />
            <ImageOption
              selected={!dekorativnaPergola}
              onClick={() => setDekorativnaPergola(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>

        {/* Interiérovo okno */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Interiérovo okno, okná as 3 kos sol</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={interierovoOkno}
              onClick={() => setInterierovoOkno(true)}
              label="Áno 3 900€"
              price={3900}
            />
            <ImageOption
              selected={!interierovoOkno}
              onClick={() => setInterierovoOkno(false)}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Interiérove okno</p>
        </div>

        {/* Rohové okno */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Rohové okno</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={rohoveOkno === "fixed3"}
              onClick={() => setRohoveOkno("fixed3")}
              label="Áno 5 800€"
              price={5800}
            />
            <ImageOption
              selected={rohoveOkno === "bez"}
              onClick={() => setRohoveOkno("bez")}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Rohové okno</p>
        </div>

        {/* Bočné okno Fixed 3 90x180cm */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Bočné okno Fixed 3 90x180cm</h3>
          <div className="grid grid-cols-3 gap-3">
            <ImageOption
              selected={bocneOknoFixed === "v60x180"}
              onClick={() => setBocneOknoFixed("v60x180")}
              label="60x180cm"
              price={890}
            />
            <ImageOption
              selected={bocneOknoFixed === "v90x180"}
              onClick={() => setBocneOknoFixed("v90x180")}
              label="90x180cm"
              price={1150}
            />
            <ImageOption
              selected={bocneOknoFixed === "bez"}
              onClick={() => setBocneOknoFixed("bez")}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Rozložené stenu</p>
        </div>

        {/* Bočné okno (Pripojeno-okrapné) */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Bočné okno (Pripojeno-okrapné)</h3>
          <div className="grid grid-cols-4 gap-3">
            <ImageOption
              selected={bocneOknoPripojenie === "s60x60w"}
              onClick={() => setBocneOknoPripojenie("s60x60w")}
              label="60x60flop"
              price={650}
            />
            <ImageOption
              selected={bocneOknoPripojenie === "s90x90w"}
              onClick={() => setBocneOknoPripojenie("s90x90w")}
              label="90*90w"
              price={890}
            />
            <ImageOption
              selected={bocneOknoPripojenie === "s120x60w"}
              onClick={() => setBocneOknoPripojenie("s120x60w")}
              label="120*60w"
              price={1100}
            />
            <ImageOption
              selected={bocneOknoPripojenie === "bez"}
              onClick={() => setBocneOknoPripojenie("bez")}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Rozložené stenu</p>
        </div>

        {/* Francúzske akro Sokol */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Francúzske okno Sokol</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={francuzskeAkroSokol}
              onClick={() => setFrancuzskeAkroSokol(true)}
              label="Áno +4 900€"
              price={4900}
            />
            <ImageOption
              selected={!francuzskeAkroSokol}
              onClick={() => setFrancuzskeAkroSokol(false)}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">*Rozložené okná</p>
        </div>

        {/* Doprava */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Doprava</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={doprava}
              onClick={() => setDoprava(true)}
              label="Áno 1690€"
              price={1690}
            />
            <ImageOption
              selected={!doprava}
              onClick={() => setDoprava(false)}
              label="Nie"
              price={0}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">DOPRAVA ŽERIAVY</p>
        </div>

        {/* Kompletná realizná dokumentácia */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Kompletná realizná dokumentácia k stavbe ´</h3>
          <div className="grid grid-cols-2 gap-3">
            <ImageOption
              selected={dokumentaciaStavba}
              onClick={() => setDokumentaciaStavba(true)}
              label="Áno 4 500€"
              price={4500}
            />
            <ImageOption
              selected={!dokumentaciaStavba}
              onClick={() => setDokumentaciaStavba(false)}
              label="Nie"
              price={0}
            />
          </div>
        </div>
      </div>

      {/* Cenový súhrn */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Základná cena produktu</span>
            <span className="font-semibold">{formatPrice(BASE_PRICE)} <span className="text-xs text-gray-400">s DPH</span></span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Príplatky spolu</span>
            <span className="font-semibold text-red-600">+ {formatPrice(pricatkyCena)} <span className="text-xs text-gray-400">s DPH</span></span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-bold text-gray-800">Spolu</span>
            <span className="text-2xl font-bold text-red-600">{formatPrice(totalPrice)} <span className="text-xs text-gray-400">s DPH</span></span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="text-red-600 font-semibold mb-4">Zavolajte nám alebo</p>
        <p className="text-gray-800 mb-4">Zavolajte nám alebo <span className="font-bold">pošlite správu</span> a náš tím vám rád pomôže.</p>
        <Link to={`${createPageUrl("Kontakt")}?dom=Flat%20Double%20142m²&cena=${totalPrice}`}>
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8">
            <Send className="mr-2 w-5 h-5" />
            ODOSLAŤ
          </Button>
        </Link>
      </div>
    </Card>
  );
}