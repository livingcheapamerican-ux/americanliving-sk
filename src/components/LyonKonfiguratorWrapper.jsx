import React, { useState } from "react";
import KonfiguratorLyon, { LyonSummaryPanel } from "./KonfiguratorLyon";
import { useLanguage } from "./LanguageContext";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import FloatingPrice from "./FloatingPrice";

export default function LyonKonfiguratorWrapper(props) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const BASE_PRICE = props.dom?.zakladna_cena || 73431;
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
  
  // Dodatočné služby
  const predajNehnutelnosti = props.predajNehnutelnosti || false;
  const setPredajNehnutelnosti = props.setPredajNehnutelnosti || (() => {});
  const chcemPozemok = props.chcemPozemok || false;
  const setChcemPozemok = props.setChcemPozemok || (() => {});
  const financneSluzby = props.financneSluzby || false;
  const setFinancneSluzby = props.setFinancneSluzby || (() => {});

  const DEFAULT_CENY = {
    izolacia_stien_200mm: 1799.16,
    izolacia_stien_250mm: 1558.17,
    izolacia_podlahy_200mm: 334.08,
    izolacia_stropu_200mm: 271.44,
    tepelne_cerpadlo: 2889.27,
    pripravaNaRekuperaciu: 512,
    rekuperacia: 1155.36,
    podlahove_kurenie: 2253.30,
    klimatizacia: 902,
    pripravaKrb: 578.55,
    ochranaKachle: 1279.77,
    fasada_omietka: 1580.79,
    fasada_smrekovec: 3349.50,
    fasada_falcovane: 4953.78,
    fasada_thermowood: 6677.25,
    strecha_falcovane: 3227.70,
    odkvapy: 1502.49,
    dvere_kovove: 278.40,
    obklad_smrek_bez_uzlov: 0,
    obklad_sadrokarton_tapeta: 7855,
    obklad_osb_panel: 5279,
    dvere_posuvne: 427.17,
    elektro_cz: 460.23,
    elektro_ge: 1583.40,
    bleskozvod: 856.08,
    prepat: 311.46,
    pripravaNaSolarnePanely: 1305,
    sprchovyKut: 645.54,
    vana: 501.12,
    bateria: 139.20,
    skrinka: 434.13,
    strop_kupelna_sadrokarton: 0,
    inziniering: 2773.56,
    projektACertifikacia: 3745.35,
    revizia: 1605.15,
    zaklady_vruty: 4494.42,
    zaklady_patky: 2568.24,
    zaklady_pasove: 11825.04,
    montaz: 4805.88,
    doprava: 8927.94
  };

  const CENY = {
    ...DEFAULT_CENY,
    ...(props.dom?.konfigurator_ceny || {})
  };

  const totalPrice = React.useMemo(() => {
    if (!CENY) return BASE_PRICE;
    let total = BASE_PRICE;
    
    // Izolácia
    if (izolaciaStien === "200mm") total += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") total += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") total += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") total += CENY.izolacia_stropu_200mm || 0;
    
    // Vykurovanie
    if (tepelneCerpadlo === "ano") total += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) total += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") total += CENY.rekuperacia || 0;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie || 0;
    if (klimatizacia) total += CENY.klimatizacia || 0;
    if (pripravaNaKrb) total += CENY.pripravaKrb || 0;
    if (ochranaKachle) total += CENY.ochranaKachle || 0;
    
    // Fasáda
    if (fasada === "omietka") total += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") total += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") total += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") total += CENY.fasada_thermowood || 0;
    
    // Strecha
    if (strecha === "falcovane") total += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") total += CENY.odkvapy || 0;
    
    // Dvere
    if (vchodoveDvere === "kovove") total += CENY.dvere_kovove || 0;
    
    // Interiér
    if (obkladStien === "smrek_bez_uzlov") total += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") total += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") total += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne || 0;
    
    // Elektro
    if (elektro === "cz") total += CENY.elektro_cz || 0;
    if (elektro === "ge") total += CENY.elektro_ge || 0;
    if (bleskozvod) total += CENY.bleskozvod || 0;
    if (prepat) total += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) total += CENY.pripravaNaSolarnePanely || 0;
    
    // Kúpeľňa
    if (sprchovyKut === "radaway") total += CENY.sprchovyKut || 0;
    if (vana) total += CENY.vana || 0;
    if (bateria === "grohe") total += CENY.bateria || 0;
    if (skrinka) total += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") total += CENY.strop_kupelna_sadrokarton || 0;
    
    // Služby
    if (inziniering) total += CENY.inziniering || 0;
    if (projektACertifikacia) total += CENY.projektACertifikacia || 0;
    if (revizia) total += CENY.revizia || 0;
    
    // Základy
    if (zaklady === "vruty") total += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") total += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") total += CENY.zaklady_pasove || 0;
    
    // Realizácia
    if (montaz) total += CENY.montaz || 0;
    if (doprava) total += CENY.doprava || 0;
    
    return total;
  }, [CENY, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
      skrinka, stropKupelna, inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava]);

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const handleSubmit = () => {
    setShowSummaryModal(true);
  };

  // Poslať totalPrice späť do rodičovského komponentu
  React.useEffect(() => {
    if (props.onConfigChange) {
      props.onConfigChange({
        celkovaCena: totalPrice,
        izolaciaStien,
        izolaciaPodlahy,
        izolaciaStropu,
        tepelneCerpadlo,
        rekuperacia,
        projektACertifikacia,
        zaklady
      });
    }
  }, [totalPrice, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, projektACertifikacia, zaklady, props.onConfigChange]);

  const allProps = {
    dom: props.dom,
    CENY,
    totalPrice,
    formatPrice,
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
    predajNehnutelnosti, setPredajNehnutelnosti,
    chcemPozemok, setChcemPozemok,
    financneSluzby, setFinancneSluzby,
  };

  const handleSendQuoteFromFloating = async (contactData) => {
    try {
      const response = await base44.functions.invoke('odosliCenovuPonukuLyonEmail', {
        dom: props.dom,
        klientData: contactData,
        konfiguraciaData: {
          ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
          tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
          podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
          fasada, strecha, odkvapy, okna, vchodoveDvere,
          obkladStien, podlaha, interieroveDvere,
          elektro, bleskozvod, prepat, pripravaNaSolarnePanely,
          sprchovyKut, vana, bateria, skrinka, stropKupelna,
          inziniering, projektACertifikacia, revizia,
          zaklady, montaz, doprava,
          predajNehnutelnosti, chcemPozemok, financneSluzby,
          totalPrice
        }
      });
      return response;
    } catch (error) {
      console.error('Error in handleSendQuoteFromFloating:', error);
      throw error;
    }
  };

  return (
      <>
        <KonfiguratorLyon {...allProps} onSubmit={handleSubmit} />
        <FloatingPrice 
          price={totalPrice} 
          isVisible={true} 
          onSendQuote={handleSendQuoteFromFloating}
          dom={props.dom}
          vyrobca="Ticab house"
        />
        <LyonFinalSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          dom={props.dom}
          {...allProps}
        />
      </>
    );
}