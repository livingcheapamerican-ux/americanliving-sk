import React from "react";
import KonfiguratorLyon, { LyonSummaryPanel } from "./KonfiguratorLyon";

export default function LyonKonfiguratorWrapper() {
  const BASE_PRICE = 73431;
  
  const [ucel, setUcel] = React.useState("chata");
  const [izolaciaStien, setIzolaciaStien] = React.useState("150mm");
  const [izolaciaPodlahy, setIzolaciaPodlahy] = React.useState("150mm");
  const [izolaciaStropu, setIzolaciaStropu] = React.useState("150mm");
  const [tepelneCerpadlo, setTepelneCerpadlo] = React.useState("nie");
  const [rekuperacia, setRekuperacia] = React.useState("nie");
  const [podlahovoKurenie, setPodlahovoKurenie] = React.useState(false);
  const [pripravaNaKrb, setPripravaNaKrb] = React.useState(false);
  const [ochranaKachle, setOchranaKachle] = React.useState(false);
  const [fasada, setFasada] = React.useState("drevo_smrek");
  const [strecha, setStrecha] = React.useState("korugovan_plech");
  const [odkvapy, setOdkvapy] = React.useState("nie");
  const [okna, setOkna] = React.useState("biele");
  const [vchodoveDvere, setVchodoveDvere] = React.useState("plastove");
  const [obkladStien, setObkladStien] = React.useState("smrek_8cm");
  const [podlaha, setPodlaha] = React.useState("laminat");
  const [interieroveDvere, setInterieroveDvere] = React.useState("kridlove");
  const [elektro, setElektro] = React.useState("eu");
  const [bleskozvod, setBleskozvod] = React.useState(false);
  const [prepat, setPrepat] = React.useState(false);
  const [sprchovyKut, setSprchovyKut] = React.useState("standard");
  const [vana, setVana] = React.useState(false);
  const [bateria, setBateria] = React.useState("standard");
  const [skrinka, setSkrinka] = React.useState(false);
  const [stropKupelna, setStropKupelna] = React.useState("drevo");
  const [inziniering, setInziniering] = React.useState(false);
  const [projektACertifikacia, setProjektACertifikacia] = React.useState(false);
  const [revizia, setRevizia] = React.useState(true);
  const [zaklady, setZaklady] = React.useState("bez");
  const [montaz, setMontaz] = React.useState(false);
  const [doprava, setDoprava] = React.useState(false);

  const CENY = {
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
    obklad: { smrek_bez_uzlov: 0, sadrokarton_tapeta: 7855, osb_panel: 5279 },
    dvere_posuvne: 427.17,
    elektro: { cz: 460.23, ge: 1583.40 },
    bleskozvod: 856.08,
    prepat: 311.46,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    strop_kupelna: { sadrokarton: 0 },
    inziniering: 2773.56,
    projektACertifikacia: 3745.35,
    revizia: 1605.15,
    zaklady: { vruty: 4494.42, patky: 2568.24, pasove: 11825.04 },
    montaz: 4805.88,
    doprava: 8927.94
  };

  const totalPrice = React.useMemo(() => {
    let total = BASE_PRICE;
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
    total += CENY.strop_kupelna[stropKupelna] || 0;
    if (inziniering) total += CENY.inziniering;
    if (projektACertifikacia) total += CENY.projektACertifikacia;
    if (revizia) total += CENY.revizia;
    total += CENY.zaklady[zaklady] || 0;
    if (montaz) total += CENY.montaz;
    if (doprava) total += CENY.doprava;
    return total;
  }, [izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, sprchovyKut, vana, bateria,
      skrinka, stropKupelna, inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava]);

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const handleSubmit = () => {
    alert("Odoslanie dopytu - funkcia bude implementovaná");
  };

  const allProps = {
    ucel, setUcel,
    izolaciaStien, setIzolaciaStien,
    izolaciaPodlahy, setIzolaciaPodlahy,
    izolaciaStropu, setIzolaciaStropu,
    tepelneCerpadlo, setTepelneCerpadlo,
    rekuperacia, setRekuperacia,
    podlahovoKurenie, setPodlahovoKurenie,
    pripravaNaKrb, setPripravaNaKrb,
    ochranaKachle, setOchranaKachle,
    fasada, setFasada,
    strecha, setStrecha,
    odkvapy, setOdkvapy,
    okna, setOkna,
    vchodoveDvere, setVchodoveDvere,
    obkladStien, setObkladStien,
    podlaha, setPodlaha,
    interieroveDvere, setInterieroveDvere,
    elektro, setElektro,
    bleskozvod, setBleskozvod,
    prepat, setPrepat,
    sprchovyKut, setSprchovyKut,
    vana, setVana,
    bateria, setBateria,
    skrinka, setSkrinka,
    stropKupelna, setStropKupelna,
    inziniering, setInziniering,
    projektACertifikacia, setProjektACertifikacia,
    revizia, setRevizia,
    zaklady, setZaklady,
    montaz, setMontaz,
    doprava, setDoprava,
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Konfigurátor na ľavej strane */}
      <div className="flex-1 min-w-0">
        <KonfiguratorLyon {...allProps} />
      </div>

      {/* Sidebar na pravej strane - zobrazí sa len na desktop */}
      <div className="hidden lg:block w-full lg:w-96 flex-shrink-0">
        <div className="sticky top-24">
          <LyonSummaryPanel
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
            formatPrice={formatPrice}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}