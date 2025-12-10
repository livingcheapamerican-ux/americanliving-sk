import React from "react";
import KonfiguratorLyon, { LyonSummaryPanel } from "./KonfiguratorLyon";
import { useLanguage } from "./LanguageContext";

export default function LyonKonfiguratorWrapper(props) {
  const BASE_PRICE = 73431;
  const { t } = useLanguage();
  
  const ucel = props.ucel || "chata";
  const setUcel = props.setUcel || (() => {});
  const izolaciaStien = props.izolaciaStien || "150mm";
  const setIzolaciaStien = props.setIzolaciaStien || (() => {});
  const izolaciaPodlahy = props.izolaciaPodlahy || "150mm";
  const setIzolaciaPodlahy = props.setIzolaciaPodlahy || (() => {});
  const izolaciaStropu = props.izolaciaStropu || "150mm";
  const setIzolaciaStropu = props.setIzolaciaStropu || (() => {});
  const tepelneCerpadlo = props.tepelneCerpadlo || "nie";
  const setTepelneCerpadlo = props.setTepelneCerpadlo || (() => {});
  const rekuperacia = props.rekuperacia || "nie";
  const setRekuperacia = props.setRekuperacia || (() => {});
  const pripravaNaRekuperaciu = props.pripravaNaRekuperaciu || false;
  const setPripravaNaRekuperaciu = props.setPripravaNaRekuperaciu || (() => {});
  const podlahovoKurenie = props.podlahovoKurenie || false;
  const setPodlahovoKurenie = props.setPodlahovoKurenie || (() => {});
  const pripravaNaKrb = props.pripravaNaKrb || false;
  const setPripravaNaKrb = props.setPripravaNaKrb || (() => {});
  const ochranaKachle = props.ochranaKachle || false;
  const setOchranaKachle = props.setOchranaKachle || (() => {});
  const klimatizacia = props.klimatizacia || false;
  const setKlimatizacia = props.setKlimatizacia || (() => {});
  const fasada = props.fasada || "drevo_smrek";
  const setFasada = props.setFasada || (() => {});
  const strecha = props.strecha || "korugovan_plech";
  const setStrecha = props.setStrecha || (() => {});
  const odkvapy = props.odkvapy || "nie";
  const setOdkvapy = props.setOdkvapy || (() => {});
  const okna = props.okna || "biele";
  const setOkna = props.setOkna || (() => {});
  const vchodoveDvere = props.vchodoveDvere || "plastove";
  const setVchodoveDvere = props.setVchodoveDvere || (() => {});
  const obkladStien = props.obkladStien || "smrek_8cm";
  const setObkladStien = props.setObkladStien || (() => {});
  const podlaha = props.podlaha || "laminat";
  const setPodlaha = props.setPodlaha || (() => {});
  const interieroveDvere = props.interieroveDvere || "kridlove";
  const setInterieroveDvere = props.setInterieroveDvere || (() => {});
  const elektro = props.elektro || "eu";
  const setElektro = props.setElektro || (() => {});
  const bleskozvod = props.bleskozvod || false;
  const setBleskozvod = props.setBleskozvod || (() => {});
  const prepat = props.prepat || false;
  const setPrepat = props.setPrepat || (() => {});
  const pripravaNaSolarnePanely = props.pripravaNaSolarnePanely || false;
  const setPripravaNaSolarnePanely = props.setPripravaNaSolarnePanely || (() => {});
  const sprchovyKut = props.sprchovyKut || "standard";
  const setSprchovyKut = props.setSprchovyKut || (() => {});
  const vana = props.vana || false;
  const setVana = props.setVana || (() => {});
  const bateria = props.bateria || "standard";
  const setBateria = props.setBateria || (() => {});
  const skrinka = props.skrinka || false;
  const setSkrinka = props.setSkrinka || (() => {});
  const stropKupelna = props.stropKupelna || "drevo";
  const setStropKupelna = props.setStropKupelna || (() => {});
  const inziniering = props.inziniering || false;
  const setInziniering = props.setInziniering || (() => {});
  const projektACertifikacia = props.projektACertifikacia || false;
  const setProjektACertifikacia = props.setProjektACertifikacia || (() => {});
  const revizia = props.revizia !== undefined ? props.revizia : true;
  const setRevizia = props.setRevizia || (() => {});
  const zaklady = props.zaklady || "bez";
  const setZaklady = props.setZaklady || (() => {});
  const montaz = props.montaz || false;
  const setMontaz = props.setMontaz || (() => {});
  const doprava = props.doprava || false;
  const setDoprava = props.setDoprava || (() => {});

  const CENY = {
    izolacia_stien: { "200mm": 1799.16, "250mm": 1558.17 },
    izolacia_podlahy: { "200mm": 334.08 },
    izolacia_stropu: { "200mm": 271.44 },
    tepelne_cerpadlo: { ano: 2889.27 },
    pripravaNaRekuperaciu: 512,
    rekuperacia: { ano: 1155.36 },
    podlahove_kurenie: 2253.30,
    klimatizacia: 902,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada: { omietka: 1580.79, smrekovec: 3349.50, falcovane: 4953.78, thermowood: 6677.25 },
    strecha: { falcovane: 3227.70 },
    odkvapy: 1502.49,
    sieteProtiHmyzu: 640,
    dvere: { kovove: 278.40 },
    obklad: { smrek_bez_uzlov: 0, sadrokarton_tapeta: 7855, osb_panel: 5279 },
    dvere_posuvne: 427.17,
    elektro: { cz: 460.23, ge: 1583.40 },
    bleskozvod: 856.08,
    prepat: 311.46,
    pripravaNaSolarnePanely: 1305,
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
    if (pripravaNaRekuperaciu) total += CENY.pripravaNaRekuperaciu;
    if (rekuperacia === "ano") total += CENY.rekuperacia.ano;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie;
    if (klimatizacia) total += CENY.klimatizacia;
    if (pripravaNaKrb) total += CENY.pripravaKrb;
    if (ochranaKachle) total += CENY.ochranaKachle;
    total += CENY.fasada[fasada] || 0;
    total += CENY.strecha[strecha] || 0;
    if (odkvapy === "ano") total += CENY.odkvapy;
    if (sieteProtiHmyzu) total += CENY.sieteProtiHmyzu;
    total += CENY.dvere[vchodoveDvere] || 0;
    total += CENY.obklad[obkladStien] || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne;
    total += CENY.elektro[elektro] || 0;
    if (bleskozvod) total += CENY.bleskozvod;
    if (prepat) total += CENY.prepat;
    if (pripravaNaSolarnePanely) total += CENY.pripravaNaSolarnePanely;
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
  }, [izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
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
    pripravaNaRekuperaciu, setPripravaNaRekuperaciu,
    podlahovoKurenie, setPodlahovoKurenie,
    pripravaNaKrb, setPripravaNaKrb,
    ochranaKachle, setOchranaKachle,
    klimatizacia, setKlimatizacia,
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
    pripravaNaSolarnePanely, setPripravaNaSolarnePanely,
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

  return <KonfiguratorLyon {...allProps} />;
}