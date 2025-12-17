import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Send, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditableTile from "./EditableTile";
import { toast } from "sonner";

export default function KonfiguratorTicabhouse({ dom, isAdmin, onConfigChange, predajNehnutelnosti, setPredajNehnutelnosti, hladamPozemok, setHladamPozemok, financneSluzby, setFinancneSluzby, ucel, setUcel, izolaciaStien, setIzolaciaStien, izolaciaPodlahy, setIzolaciaPodlahy, izolaciaStropu, setIzolaciaStropu, tepelneCerpadlo, setTepelneCerpadlo, rekuperacia, setRekuperacia, pripravaNaRekuperaciu, setPripravaNaRekuperaciu, podlahovoKurenie, setPodlahovoKurenie, pripravaNaKrb, setPripravaNaKrb, ochranaKachle, setOchranaKachle, klimatizacia, setKlimatizacia, fasada, setFasada, strecha, setStrecha, odkvapy, setOdkvapy, okna, setOkna, vchodoveDvere, setVchodoveDvere, obkladStien, setObkladStien, podlaha, setPodlaha, interieroveDvere, setInterieroveDvere, elektro, setElektro, bleskozvod, setBleskozvod, prepat, setPrepat, pripravaNaSolarnePanely, setPripravaNaSolarnePanely, sprchovyKut, setSprchovyKut, vana, setVana, bateria, setBateria, skrinka, setSkrinka, stropKupelna, setStropKupelna, inziniering, setInziniering, projektACertifikacia, setProjektACertifikacia, revizia, setRevizia, zaklady, setZaklady, montaz, setMontaz, doprava, setDoprava }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  // Lokálny state pre okamžitú vizuálnu spätnú väzbu
  const [localDopravaViditelna, setLocalDopravaViditelna] = React.useState(dom?.doprava_viditelna !== false);

  // Synchronizovať lokálny state s DOM objektom
  React.useEffect(() => {
    setLocalDopravaViditelna(dom?.doprava_viditelna !== false);
  }, [dom?.doprava_viditelna]);

  const dopravaViditelna = localDopravaViditelna;

  // Mutácia pre zmenu viditeľnosti dopravy
  const toggleDopravaVisibilityMutation = useMutation({
    mutationFn: (visible) => base44.entities.Dom.update(dom.id, { doprava_viditelna: visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom', dom.id] });
      toast.success(!dopravaViditelna ? 'Doprava skrytá pre verejnosť' : 'Doprava zobrazená pre verejnosť');
    }
  });

  const handleToggleDopravaVisibility = () => {
    const newValue = !dopravaViditelna;
    setLocalDopravaViditelna(newValue);
    toggleDopravaVisibilityMutation.mutate(newValue);
  };

  // Načítať texty konfiguratora
  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  // Pomocná funkcia na získanie preloženého textu
  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return null;
    
    if (language === 'sk') return text[field] || null;
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || null;
  };

  // Načítať ceny z entity Dom alebo použiť default ceny Lyon
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
    ...(dom?.konfigurator_ceny || {})
  };
  const [kolaudacia, setKolaudacia] = useState("bez_a0");

  // Mutácia pre aktualizáciu cien
  const updatePricesMutation = useMutation({
    mutationFn: ({ domId, newPrices }) => 
      base44.entities.Dom.update(domId, { konfigurator_ceny: newPrices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom', dom.id] });
      toast.success('Cena aktualizovaná');
    }
  });

  const handlePriceChange = (priceKey, newPrice) => {
    if (!dom?.id) return;
    const updatedPrices = { ...CENY, [priceKey]: newPrice };
    updatePricesMutation.mutate({ domId: dom.id, newPrices: updatedPrices });
  };

  // Výpočet celkovej ceny
  const totalPrice = React.useMemo(() => {
    let price = dom?.zakladna_cena || 0;

    // Izolácia
    if (izolaciaStien === "200mm") price += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") price += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") price += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") price += CENY.izolacia_stropu_200mm || 0;

    // Vykurovanie
    if (tepelneCerpadlo === "ano") price += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) price += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") price += CENY.rekuperacia || 0;
    if (podlahovoKurenie) price += CENY.podlahove_kurenie || 0;
    if (klimatizacia) price += CENY.klimatizacia || 0;
    if (pripravaNaKrb) price += CENY.pripravaKrb || 0;
    if (ochranaKachle) price += CENY.ochranaKachle || 0;

    // Fasáda
    if (fasada === "omietka") price += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") price += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") price += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") price += CENY.fasada_thermowood || 0;

    // Strecha
    if (strecha === "falcovane") price += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") price += CENY.odkvapy || 0;

    // Dvere
    if (vchodoveDvere === "kovove") price += CENY.dvere_kovove || 0;

    // Interiér
    if (obkladStien === "smrek_bez_uzlov") price += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") price += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") price += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") price += CENY.dvere_posuvne || 0;

    // Elektro
    if (elektro === "cz") price += CENY.elektro_cz || 0;
    if (elektro === "ge") price += CENY.elektro_ge || 0;
    if (bleskozvod) price += CENY.bleskozvod || 0;
    if (prepat) price += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) price += CENY.pripravaNaSolarnePanely || 0;

    // Kúpeľňa
    if (sprchovyKut === "radaway") price += CENY.sprchovyKut || 0;
    if (vana) price += CENY.vana || 0;
    if (bateria === "grohe") price += CENY.bateria || 0;
    if (skrinka) price += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") price += CENY.strop_kupelna_sadrokarton || 0;

    // Služby
    if (inziniering) price += CENY.inziniering || 0;
    if (projektACertifikacia) price += CENY.projektACertifikacia || 0;
    if (revizia) price += CENY.revizia || 0;

    // Základy
    if (zaklady === "vruty") price += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") price += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") price += CENY.zaklady_pasove || 0;

    // Realizácia
    if (montaz) price += CENY.montaz || 0;
    if (doprava && dopravaViditelna) price += CENY.doprava || 0;

    return price;
  }, [
    dom?.zakladna_cena, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
    tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
    fasada, strecha, odkvapy, vchodoveDvere, obkladStien, interieroveDvere,
    elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
    inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava, CENY, dopravaViditelna
  ]);

  // Poslať konfiguráciu do rodičovského komponentu (pre hypotéku)
  React.useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
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
  }, [totalPrice, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, projektACertifikacia, zaklady, onConfigChange]);

  // Synchronizácia s props
  React.useEffect(() => { if (setUcel) setUcel(ucel); }, [ucel]);
  React.useEffect(() => { if (setIzolaciaStien) setIzolaciaStien(izolaciaStien); }, [izolaciaStien]);
  React.useEffect(() => { if (setIzolaciaPodlahy) setIzolaciaPodlahy(izolaciaPodlahy); }, [izolaciaPodlahy]);
  React.useEffect(() => { if (setIzolaciaStropu) setIzolaciaStropu(izolaciaStropu); }, [izolaciaStropu]);
  React.useEffect(() => { if (setTepelneCerpadlo) setTepelneCerpadlo(tepelneCerpadlo); }, [tepelneCerpadlo]);
  React.useEffect(() => { if (setRekuperacia) setRekuperacia(rekuperacia); }, [rekuperacia]);
  React.useEffect(() => { if (setPodlahovoKurenie) setPodlahovoKurenie(podlahovoKurenie); }, [podlahovoKurenie]);
  React.useEffect(() => { if (setPripravaNaKrb) setPripravaNaKrb(pripravaNaKrb); }, [pripravaNaKrb]);
  React.useEffect(() => { if (setOchranaKachle) setOchranaKachle(ochranaKachle); }, [ochranaKachle]);
  React.useEffect(() => { if (setFasada) setFasada(fasada); }, [fasada]);
  React.useEffect(() => { if (setStrecha) setStrecha(strecha); }, [strecha]);
  React.useEffect(() => { if (setOdkvapy) setOdkvapy(odkvapy); }, [odkvapy]);
  React.useEffect(() => { if (setOkna) setOkna(okna); }, [okna]);
  React.useEffect(() => { if (setVchodoveDvere) setVchodoveDvere(vchodoveDvere); }, [vchodoveDvere]);
  React.useEffect(() => { if (setObkladStien) setObkladStien(obkladStien); }, [obkladStien]);
  React.useEffect(() => { if (setPodlaha) setPodlaha(podlaha); }, [podlaha]);
  React.useEffect(() => { if (setInterieroveDvere) setInterieroveDvere(interieroveDvere); }, [interieroveDvere]);
  React.useEffect(() => { if (setElektro) setElektro(elektro); }, [elektro]);
  React.useEffect(() => { if (setBleskozvod) setBleskozvod(bleskozvod); }, [bleskozvod]);
  React.useEffect(() => { if (setPrepat) setPrepat(prepat); }, [prepat]);
  React.useEffect(() => { if (setPripravaNaSolarnePanely) setPripravaNaSolarnePanely(pripravaNaSolarnePanely); }, [pripravaNaSolarnePanely]);
  React.useEffect(() => { if (setPripravaNaRekuperaciu) setPripravaNaRekuperaciu(pripravaNaRekuperaciu); }, [pripravaNaRekuperaciu]);
  React.useEffect(() => { if (setKlimatizacia) setKlimatizacia(klimatizacia); }, [klimatizacia]);
  React.useEffect(() => { if (setSprchovyKut) setSprchovyKut(sprchovyKut); }, [sprchovyKut]);
  React.useEffect(() => { if (setVana) setVana(vana); }, [vana]);
  React.useEffect(() => { if (setBateria) setBateria(bateria); }, [bateria]);
  React.useEffect(() => { if (setSkrinka) setSkrinka(skrinka); }, [skrinka]);
  React.useEffect(() => { if (setStropKupelna) setStropKupelna(stropKupelna); }, [stropKupelna]);
  React.useEffect(() => { if (setInziniering) setInziniering(inziniering); }, [inziniering]);
  React.useEffect(() => { if (setProjektACertifikacia) setProjektACertifikacia(projektACertifikacia); }, [projektACertifikacia]);
  React.useEffect(() => { if (setRevizia) setRevizia(revizia); }, [revizia]);
  React.useEffect(() => { if (setZaklady) setZaklady(zaklady); }, [zaklady]);
  React.useEffect(() => { if (setMontaz) setMontaz(montaz); }, [montaz]);
  React.useEffect(() => { if (setDoprava) setDoprava(doprava); }, [doprava]);

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '0 €';
    return num > 0 ? `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €` : '0 €';
  };

  const handleSubmit = () => {
    console.log('Submit konfigurácie');
  };

  return (
    <div className="w-full">
        {/* Dodatočné služby - KROK 0 */}
        <Card className="p-3 sm:p-4 mb-3 bg-gradient-to-br from-cyan-50 via-white to-teal-50 border-2 border-cyan-300 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-600 text-white text-sm mr-1">0</span>
            📋 {getTranslatedText('sekcia_sluzby', 'nazov') || t('additionalServices') || 'Dodatočné služby'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            {getTranslatedText('sekcia_sluzby', 'podnadpis') || 'Vyberte si doplnkové služby (voliteľné):'}
          </p>
          <div className="space-y-2">
            {/* Predaj nehnuteľnosti */}
            <div
              onClick={() => setPredajNehnutelnosti(!predajNehnutelnosti)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                predajNehnutelnosti 
                  ? 'bg-blue-100 border-blue-500 shadow-md' 
                  : 'bg-white border-blue-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  predajNehnutelnosti ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {predajNehnutelnosti && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {getTranslatedText('sluzba_predaj', 'nazov') || 'Predaj predošlej nehnuteľnosti'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {getTranslatedText('sluzba_predaj', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší odborníci v realitách.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hľadám pozemok */}
            <div
              onClick={() => setHladamPozemok(!hladamPozemok)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                hladamPozemok 
                  ? 'bg-green-100 border-green-500 shadow-md' 
                  : 'bg-white border-green-200 hover:border-green-400'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  hladamPozemok ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {hladamPozemok && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {getTranslatedText('sluzba_pozemok', 'nazov') || 'Chcem pozemok pod svoj dom'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {getTranslatedText('sluzba_pozemok', 'dlhy_popis') || 'Pomôžeme Vám nájsť ideálny pozemok.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Finančné služby */}
            <div
              onClick={() => setFinancneSluzby(!financneSluzby)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                financneSluzby 
                  ? 'bg-orange-100 border-orange-500 shadow-md' 
                  : 'bg-white border-orange-200 hover:border-orange-400'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  financneSluzby ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                }`}>
                  {financneSluzby && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {getTranslatedText('sluzba_finance', 'nazov') || 'Finančné služby - úvery/poistky'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {getTranslatedText('sluzba_finance', 'dlhy_popis') || 'Budú sa Vám venovať naši najlepší finančníci, ktorí Vám pomôžu nie len s financovaním vášho bývania, ale pomocnú ruku vám podajú aj v ťažkých chvíľach s financiami.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Účel stavby */}
        <Card className="p-3 sm:p-4 mb-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            {getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rekreačná stavba */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setUcel("chata");
                setKolaudacia("bez_a0");
                setIzolaciaStien("150mm");
                setIzolaciaPodlahy("150mm");
                setIzolaciaStropu("150mm");
                setTepelneCerpadlo("nie");
                setRekuperacia("nie");
                setPripravaNaRekuperaciu(false);
                setPodlahovoKurenie(false);
                setPripravaNaKrb(false);
                setOchranaKachle(false);
                setKlimatizacia(false);
                setFasada("drevo_smrek");
                setStrecha("korugovan_plech");
                setOdkvapy("nie");
                setOkna("biele");
                setVchodoveDvere("plastove");
                setObkladStien("smrek_8cm");
                setPodlaha("laminat");
                setInterieroveDvere("kridlove");
                setElektro("eu");
                setBleskozvod(false);
                setPrepat(false);
                setPripravaNaSolarnePanely(false);
                setSprchovyKut("standard");
                setVana(false);
                setBateria("standard");
                setSkrinka(false);
                setStropKupelna("drevo");
                setInziniering(false);
                setProjektACertifikacia(false);
                setRevizia(false);
                setZaklady("bez");
                setMontaz(false);
                setDoprava(false);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                ucel === "chata" 
                  ? "bg-green-100 border-green-500 shadow-md" 
                  : "bg-white border-gray-300 hover:border-green-400"
              }`}
            >
              <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                {getTranslatedText('ucel_rekreacna', 'nazov') || t('recreationalBuilding')}
              </h4>
              <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">
                {getTranslatedText('ucel_rekreacna', 'podnadpis') || t('economicChoice')}
              </p>
              <ul className="space-y-0.5 text-[11px] sm:text-xs text-gray-600">
                {(getTranslatedText('ucel_rekreacna', 'dlhy_popis') || t('recreationalBuildingDesc'))
                  .split('\n')
                  .map((line, i) => <li key={i}>• {line}</li>)}
              </ul>
            </motion.div>

            {/* Rodinný dom A0 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setUcel("rodinny");
                setKolaudacia("s_a0");
                setIzolaciaStien("250mm");
                setIzolaciaPodlahy("200mm");
                setIzolaciaStropu("200mm");
                setTepelneCerpadlo("ano");
                setPripravaNaRekuperaciu(true);
                setRekuperacia("ano");
                setInziniering(true);
                setProjektACertifikacia(true);
                setRevizia(true);
                setBleskozvod(true);
                setPrepat(true);
                setElektro("ge");
                setKlimatizacia(true);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                ucel === "rodinny" 
                  ? "bg-green-100 border-green-500 shadow-md" 
                  : "bg-white border-gray-300 hover:border-green-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm sm:text-base font-bold text-gray-900">
                  {getTranslatedText('ucel_rodinny', 'nazov') || t('familyHouseA0')}
                </h4>
                <Badge className="bg-green-600 text-white text-[8px] sm:text-[9px]">⚡</Badge>
              </div>
              <ul className="space-y-0.5 text-[11px] sm:text-xs text-gray-600">
                {(getTranslatedText('ucel_rodinny', 'dlhy_popis') || t('familyHouseA0Desc'))
                  .split('\n')
                  .map((line, i) => <li key={i}>• {line}</li>)}
              </ul>
            </motion.div>
          </div>
        </Card>

        {/* Hlavný konfigurátor - Grid layout */}
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* IZOLÁCIA */}
          <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md">
            <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-xs sm:text-sm mr-1">1</span>
              🏠 {getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia'}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {/* Steny */}
              <div>
                <p className="text-xs sm:text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_stien', 'nazov') || t('wallInsulation') || 'Izolácia stien:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 border border-blue-300 rounded-md p-1.5 sm:p-2 bg-white/50">
                  <EditableTile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} 
                    title={getTranslatedText('izolacia_stien_150', 'nazov') || t('walls150mm') || 'Steny 150mm'} 
                    subtitle={getTranslatedText('izolacia_stien_150', 'podnadpis') || t('recreational') || 'Rekreačné'} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} 
                    title={getTranslatedText('izolacia_stien_200', 'nazov') || t('walls200mm') || 'Steny 200mm'} 
                    subtitle={getTranslatedText('izolacia_stien_200', 'podnadpis') || ''} 
                    price={formatPrice(CENY.izolacia_stien_200mm)} isPriced={true} t={t} 
                    priceKey="izolacia_stien_200mm" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} 
                    title={getTranslatedText('izolacia_stien_250', 'nazov') || t('walls250mm') || 'Steny 250mm'} 
                    subtitle={getTranslatedText('izolacia_stien_250', 'podnadpis') || t('premiumA0') || 'Premium A0'} 
                    price={formatPrice(CENY.izolacia_stien_250mm)} isPriced={true} isA0={true} t={t} 
                    priceKey="izolacia_stien_250mm" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Podlaha */}
              <div>
                <p className="text-xs sm:text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 border border-blue-300 rounded-md p-1.5 sm:p-2 bg-white/50">
                  <EditableTile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} 
                    title={getTranslatedText('izolacia_podlahy_150', 'nazov') || t('floor150mm') || 'Podlaha 150mm'} 
                    subtitle={getTranslatedText('izolacia_podlahy_150', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} 
                    title={getTranslatedText('izolacia_podlahy_200', 'nazov') || t('floor200mm') || 'Podlaha 200mm'} 
                    subtitle={getTranslatedText('izolacia_podlahy_200', 'podnadpis') || t('a0') || 'A0'} 
                    price={formatPrice(CENY.izolacia_podlahy_200mm)} isPriced={true} isA0={true} t={t} 
                    priceKey="izolacia_podlahy_200mm" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Strop */}
              <div>
                <p className="text-xs sm:text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 border border-blue-300 rounded-md p-1.5 sm:p-2 bg-white/50">
                  <EditableTile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} 
                    title={getTranslatedText('izolacia_stropu_150', 'nazov') || t('ceiling150mm') || 'Strop 150mm'} 
                    subtitle={getTranslatedText('izolacia_stropu_150', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} 
                    title={getTranslatedText('izolacia_stropu_200', 'nazov') || t('ceiling200mm') || 'Strop 200mm'} 
                    subtitle={getTranslatedText('izolacia_stropu_200', 'podnadpis') || t('a0') || 'A0'} 
                    price={formatPrice(CENY.izolacia_stropu_200mm)} isPriced={true} isA0={true} t={t} 
                    priceKey="izolacia_stropu_200mm" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>

          {/* VYKUROVANIE */}
          <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 shadow-md">
            <h3 className="text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-sm mr-1">2</span>
              🔥 {getTranslatedText('sekcia_vykurovanie', 'nazov') || t('heatingSection') || 'Vykurovanie'}
            </h3>
            <div className="space-y-2">
              {/* Tepelné čerpadlo */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('tepelne_cerpadlo', 'nazov') || t('heating') || 'Vykurovanie:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} 
                    title={getTranslatedText('tepelne_cerpadlo_nie', 'nazov') || t('heatingPreparation')} 
                    subtitle={getTranslatedText('tepelne_cerpadlo_nie', 'podnadpis') || t('convectors')} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} 
                    title={getTranslatedText('tepelne_cerpadlo_ano', 'nazov') || t('heatPump')} 
                    subtitle={getTranslatedText('tepelne_cerpadlo_ano', 'podnadpis') || t('a0Required')} 
                    price={formatPrice(CENY.tepelne_cerpadlo)} isPriced={true} isA0={true} t={t} 
                    priceKey="tepelne_cerpadlo" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Rekuperácia */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('rekuperacia', 'nazov') || t('ventilation') || 'Vetranie:'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={rekuperacia === "nie" && !pripravaNaRekuperaciu} onClick={() => {setRekuperacia("nie"); setPripravaNaRekuperaciu(false);}} 
                    title={getTranslatedText('rekuperacia_nie', 'nazov') || t('withoutRecuperation')} 
                    subtitle={getTranslatedText('rekuperacia_nie', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={pripravaNaRekuperaciu} onClick={() => {setPripravaNaRekuperaciu(true); setRekuperacia("nie");}} 
                    title={getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu'} 
                    subtitle={getTranslatedText('pripravaNaRekuperaciu', 'podnadpis') || ''} 
                    price={formatPrice(CENY.pripravaNaRekuperaciu)} isPriced={true} isA0={true} t={t} 
                    priceKey="pripravaNaRekuperaciu" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={rekuperacia === "ano"} onClick={() => {setRekuperacia("ano"); setPripravaNaRekuperaciu(false);}} 
                    title={getTranslatedText('rekuperacia_ano', 'nazov') || t('recuperation')} 
                    subtitle={getTranslatedText('rekuperacia_ano', 'podnadpis') || t('a0Required')} 
                    price={formatPrice(CENY.rekuperacia)} isPriced={true} isA0={true} t={t} 
                    priceKey="rekuperacia" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Doplnky */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('vykurovanie_doplnky', 'nazov') || t('heatingExtras') || 'Doplnky:'}
                </p>
                <div className="space-y-1.5">
                  <EditableTile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} 
                    title={getTranslatedText('podlahove_kurenie', 'nazov') || t('floorHeating')} 
                    subtitle={getTranslatedText('podlahove_kurenie', 'podnadpis') || ''} 
                    price={formatPrice(CENY.podlahove_kurenie)} isPriced={true} t={t} 
                    priceKey="podlahove_kurenie" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} 
                    title={getTranslatedText('pripravaKrb', 'nazov') || t('fireplacePrep')} 
                    subtitle={getTranslatedText('pripravaKrb', 'podnadpis') || ''} 
                    price={formatPrice(CENY.pripravaKrb)} isPriced={true} t={t} 
                    priceKey="pripravaKrb" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} 
                    title={getTranslatedText('ochranaKachle', 'nazov') || t('stoveProtection')} 
                    subtitle={getTranslatedText('ochranaKachle', 'podnadpis') || ''} 
                    price={formatPrice(CENY.ochranaKachle)} isPriced={true} t={t} 
                    priceKey="ochranaKachle" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={klimatizacia} onClick={() => setKlimatizacia(!klimatizacia)} 
                    title={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} 
                    subtitle={getTranslatedText('klimatizacia', 'podnadpis') || ''} 
                    price={formatPrice(CENY.klimatizacia)} isPriced={CENY.klimatizacia > 0} isA0={true} t={t} 
                    priceKey="klimatizacia" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  </div>
                  </div>
            </div>
          </Card>
        </div>

        {/* Pokračovanie sekcií */}
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* FASÁDA */}
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-md">
            <h3 className="text-base font-bold text-purple-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm mr-1">3</span>
              🎨 {getTranslatedText('sekcia_fasada', 'nazov') || t('facadeSection') || 'Fasáda'}
            </h3>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('fasada_typ', 'nazov') || t('facadeType') || 'Typ fasády:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-purple-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} 
                  title={getTranslatedText('fasada_drevo_smrek', 'nazov') || t('spruceWood')} 
                  subtitle={getTranslatedText('fasada_drevo_smrek', 'podnadpis') || t('darkLight')} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} 
                  title={getTranslatedText('fasada_omietka', 'nazov') || t('scratchedPlaster')} 
                  subtitle={getTranslatedText('fasada_omietka', 'podnadpis') || 'Baumit'} 
                  price={formatPrice(CENY.fasada_omietka)} isPriced={true} t={t} 
                  priceKey="fasada_omietka" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                <EditableTile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} 
                  title={getTranslatedText('fasada_smrekovec', 'nazov') || t('larch')} 
                  subtitle={getTranslatedText('fasada_smrekovec', 'podnadpis') || ''} 
                  price={formatPrice(CENY.fasada_smrekovec)} isPriced={true} t={t} 
                  priceKey="fasada_smrekovec" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                <EditableTile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} 
                  title={getTranslatedText('fasada_falcovane', 'nazov') || t('foldedPanels')} 
                  subtitle={getTranslatedText('fasada_falcovane', 'podnadpis') || ''} 
                  price={formatPrice(CENY.fasada_falcovane)} isPriced={true} t={t} 
                  priceKey="fasada_falcovane" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                <EditableTile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} 
                  title={getTranslatedText('fasada_thermowood', 'nazov') || 'Thermowood'} 
                  subtitle={getTranslatedText('fasada_thermowood', 'podnadpis') || ''} 
                  price={formatPrice(CENY.fasada_thermowood)} isPriced={true} t={t} 
                  priceKey="fasada_thermowood" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
              </div>
            </div>
          </Card>

          {/* STRECHA */}
          <Card className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 shadow-md">
            <h3 className="text-base font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm mr-1">4</span>
              🏠 {getTranslatedText('sekcia_strecha', 'nazov') || t('roofSection') || 'Strecha'}
            </h3>
            <div className="space-y-2">
              {/* Krytina */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('stresna_krytina', 'nazov') || t('roofCoveringType') || 'Strešná krytina:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} 
                    title={getTranslatedText('strecha_korugovan', 'nazov') || t('corrugatedMetal')} 
                    subtitle={getTranslatedText('strecha_korugovan', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} 
                    title={getTranslatedText('strecha_falcovane', 'nazov') || t('foldedPanels')} 
                    subtitle={getTranslatedText('strecha_falcovane', 'podnadpis') || ''} 
                    price={formatPrice(CENY.strecha_falcovane)} isPriced={true} t={t} 
                    priceKey="strecha_falcovane" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Odkvapy */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('odkvapy', 'nazov') || t('gutters') || 'Odkvapy:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} 
                    title={getTranslatedText('odkvapy_nie', 'nazov') || t('withoutGutters')} 
                    subtitle={getTranslatedText('odkvapy_nie', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} 
                    title={getTranslatedText('odkvapy_ano', 'nazov') || t('gutters')} 
                    subtitle={getTranslatedText('odkvapy_ano', 'podnadpis') || t('roofColor')} 
                    price={formatPrice(CENY.odkvapy)} isPriced={true} t={t} 
                    priceKey="odkvapy" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* OKNÁ A DVERE */}
          <Card className="p-3 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-300 shadow-md">
            <h3 className="text-base font-bold text-cyan-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-600 text-white text-sm mr-1">5</span>
              🚪 {getTranslatedText('sekcia_okna_dvere', 'nazov') || t('windowsDoorsSection') || 'Okná a dvere'}
            </h3>
            <div className="space-y-2">
              {/* Okná */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('okna_farba', 'nazov') || t('windowColor') || 'Farba okien 3-sklo:'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={okna === "biele"} onClick={() => setOkna("biele")} 
                    title={getTranslatedText('okna_biele', 'nazov') || t('white')} 
                    subtitle={getTranslatedText('okna_biele', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={okna === "antracit"} onClick={() => setOkna("antracit")} 
                    title={getTranslatedText('okna_antracit', 'nazov') || t('anthracite')} 
                    subtitle={getTranslatedText('okna_antracit', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={okna === "hnede"} onClick={() => setOkna("hnede")} 
                    title={getTranslatedText('okna_hnede', 'nazov') || t('brown')} 
                    subtitle={getTranslatedText('okna_hnede', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Vchodové dvere */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('vchodove_dvere', 'nazov') || t('entryDoors') || 'Vchodové dvere:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} 
                    title={getTranslatedText('dvere_plastove', 'nazov') || t('metalPlasticDoors')} 
                    subtitle={getTranslatedText('dvere_plastove', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} 
                    title={getTranslatedText('dvere_kovove', 'nazov') || t('metalDoors')} 
                    subtitle={getTranslatedText('dvere_kovove', 'podnadpis') || ''} 
                    price={formatPrice(CENY.dvere_kovove)} isPriced={true} t={t} 
                    priceKey="dvere_kovove" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>

          {/* INTERIÉR */}
          <Card className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md">
            <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-sm mr-1">6</span>
              🛋️ {getTranslatedText('sekcia_interier', 'nazov') || t('interiorSection') || 'Interiér'}
            </h3>
            <div className="space-y-2">
              {/* Obklad stien */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('obklad_stien', 'nazov') || t('wallCladding') || 'Obklad stien:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} 
                    title={getTranslatedText('obklad_smrek_8cm', 'nazov') || t('spruceWall8cm')} 
                    subtitle={getTranslatedText('obklad_smrek_8cm', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} 
                    title={getTranslatedText('obklad_smrek_bez_uzlov', 'nazov') || t('spruceWallNoKnots')} 
                    subtitle={getTranslatedText('obklad_smrek_bez_uzlov', 'podnadpis') || ''} 
                    price={formatPrice(CENY.obklad_smrek_bez_uzlov)} isPriced={false} t={t} 
                    priceKey="obklad_smrek_bez_uzlov" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} 
                    title={getTranslatedText('obklad_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} 
                    subtitle={getTranslatedText('obklad_sadrokarton', 'podnadpis') || ''} 
                    price={formatPrice(CENY.obklad_sadrokarton_tapeta)} isPriced={true} t={t} 
                    priceKey="obklad_sadrokarton_tapeta" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} 
                    title={getTranslatedText('obklad_osb', 'nazov') || t('osbLaminatePanel')} 
                    subtitle={getTranslatedText('obklad_osb', 'podnadpis') || ''} 
                    price={formatPrice(CENY.obklad_osb_panel)} isPriced={true} t={t} 
                    priceKey="obklad_osb_panel" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Podlaha */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('podlaha', 'nazov') || t('floorType') || 'Podlaha:'}
                </p>
                <div className="border border-amber-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} 
                    title={getTranslatedText('podlaha_laminat', 'nazov') || t('laminate')} 
                    subtitle={getTranslatedText('podlaha_laminat', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Interiérové dvere */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('interierove_dvere', 'nazov') || t('interiorDoorsType') || 'Interiérové dvere:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} 
                    title={getTranslatedText('dvere_kridlove', 'nazov') || t('hingedDoors')} 
                    subtitle={getTranslatedText('dvere_kridlove', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} 
                    title={getTranslatedText('dvere_posuvne', 'nazov') || t('slidingDoors')} 
                    subtitle={getTranslatedText('dvere_posuvne', 'podnadpis') || ''} 
                    price={formatPrice(CENY.dvere_posuvne)} isPriced={true} t={t} 
                    priceKey="dvere_posuvne" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* ELEKTRO */}
          <Card className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md">
            <h3 className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-600 text-white text-sm mr-1">7</span>
              ⚡ {getTranslatedText('sekcia_elektro', 'nazov') || t('electricalSection') || 'Elektroinštalácia'}
            </h3>
            <div className="space-y-2">
              {/* Štandard */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('elektro_typ', 'nazov') || t('installationType') || 'Typ inštalácie:'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 border border-yellow-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={elektro === "eu"} onClick={() => setElektro("eu")} 
                    title={getTranslatedText('elektro_eu', 'nazov') || t('euStandard')} 
                    subtitle={getTranslatedText('elektro_eu', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={elektro === "cz"} onClick={() => setElektro("cz")} 
                    title={getTranslatedText('elektro_cz', 'nazov') || t('czSkStandard')} 
                    subtitle={getTranslatedText('elektro_cz', 'podnadpis') || t('socketsExtraFuses')} 
                    price={formatPrice(CENY.elektro_cz)} isPriced={true} t={t} 
                    priceKey="elektro_cz" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={elektro === "ge"} onClick={() => setElektro("ge")} 
                    title={getTranslatedText('elektro_ge', 'nazov') || t('geStandard')} 
                    subtitle={getTranslatedText('elektro_ge', 'podnadpis') || ''} 
                    price={formatPrice(CENY.elektro_ge)} isPriced={true} isA0={true} t={t} 
                    priceKey="elektro_ge" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Doplnky */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  {getTranslatedText('elektro_doplnky', 'nazov') || (t('heatingExtras') + ' (' + t('selectMultiple') + ')') || 'Doplnky (môžeš vybrať viac):'}
                </p>
                <div className="space-y-2">
                  <EditableTile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} 
                    title={getTranslatedText('bleskozvod', 'nazov') || t('lightningRod')} 
                    subtitle={getTranslatedText('bleskozvod', 'podnadpis') || ''} 
                    price={formatPrice(CENY.bleskozvod)} isPriced={true} isA0={true} t={t} 
                    priceKey="bleskozvod" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={prepat} onClick={() => setPrepat(!prepat)} 
                    title={getTranslatedText('prepat', 'nazov') || t('surgeProtection')} 
                    subtitle={getTranslatedText('prepat', 'podnadpis') || ''} 
                    price={formatPrice(CENY.prepat)} isPriced={true} isA0={true} t={t} 
                    priceKey="prepat" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={pripravaNaSolarnePanely} onClick={() => setPripravaNaSolarnePanely(!pripravaNaSolarnePanely)} 
                    title={getTranslatedText('pripravaNaSolarnePanely', 'nazov') || 'Príprava na solárne panely'} 
                    subtitle={getTranslatedText('pripravaNaSolarnePanely', 'podnadpis') || ''} 
                    price={formatPrice(CENY.pripravaNaSolarnePanely)} isPriced={true} t={t} 
                    priceKey="pripravaNaSolarnePanely" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>

          {/* KÚPEĽŇA */}
          <Card className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-md">
            <h3 className="text-base font-bold text-teal-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-sm mr-1">8</span>
              🚿 {getTranslatedText('sekcia_kupelna', 'nazov') || t('bathroomSection') || 'Kúpeľňa'}
            </h3>
            <div className="space-y-2">
              {/* Sprcha */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('sprchovyKut', 'nazov') || t('showerCabin') || 'Sprchový kút:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} 
                    title={getTranslatedText('sprcha_standard', 'nazov') || t('shower')} 
                    subtitle={getTranslatedText('sprcha_standard', 'podnadpis') || 'WC Geberit'} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} 
                    title={getTranslatedText('sprcha_radaway', 'nazov') || t('showerRadawayTile')} 
                    subtitle={getTranslatedText('sprcha_radaway', 'podnadpis') || ''} 
                    price={formatPrice(CENY.sprchovyKut)} isPriced={true} t={t} 
                    priceKey="sprchovyKut" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Batéria */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('bateria', 'nazov') || t('faucet') || 'Batéria:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={bateria === "standard"} onClick={() => setBateria("standard")} 
                    title={getTranslatedText('bateria_standard', 'nazov') || t('faucetStandard')} 
                    subtitle={getTranslatedText('bateria_standard', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} 
                    title={getTranslatedText('bateria_grohe', 'nazov') || 'Grohe'} 
                    subtitle={getTranslatedText('bateria_grohe', 'podnadpis') || ''} 
                    price={formatPrice(CENY.bateria)} isPriced={true} t={t} 
                    priceKey="bateria" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Strop kúpeľňa */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('strop_kupelna', 'nazov') || t('bathroomCeiling') || 'Strop (kúpeľňa):'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} 
                    title={getTranslatedText('strop_drevo', 'nazov') || t('ceilingWoodPattern')} 
                    subtitle={getTranslatedText('strop_drevo', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} 
                    title={getTranslatedText('strop_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} 
                    subtitle={getTranslatedText('strop_sadrokarton', 'podnadpis') || ''} 
                    price={formatPrice(CENY.strop_kupelna_sadrokarton)} isPriced={false} t={t} 
                    priceKey="strop_kupelna_sadrokarton" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>

              {/* Doplnky */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('kupelna_doplnky', 'nazov') || t('bathExtras') || 'Doplnky:'}
                </p>
                <div className="space-y-1.5">
                  <EditableTile selected={vana} onClick={() => setVana(!vana)} 
                    title={getTranslatedText('vana', 'nazov') || t('bathtub')} 
                    subtitle={getTranslatedText('vana', 'podnadpis') || ''} 
                    price={formatPrice(CENY.vana)} isPriced={true} t={t} 
                    priceKey="vana" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                  <EditableTile selected={skrinka} onClick={() => setSkrinka(!skrinka)} 
                    title={getTranslatedText('skrinka', 'nazov') || t('cabinet')} 
                    subtitle={getTranslatedText('skrinka', 'podnadpis') || ''} 
                    price={formatPrice(CENY.skrinka)} isPriced={true} t={t} 
                    priceKey="skrinka" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* ZÁKLADY */}
          <Card className="p-3 bg-gradient-to-br from-stone-50 to-gray-50 border-2 border-stone-300 shadow-md">
            <h3 className="text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-600 text-white text-sm mr-1">9</span>
              🏗️ {getTranslatedText('sekcia_zaklady', 'nazov') || t('foundationsSection') || 'Základy'}
            </h3>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('zaklady_typ', 'nazov') || t('foundationType') || 'Typ základov:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-stone-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} 
                  title={getTranslatedText('zaklady_bez', 'nazov') || t('noFoundations')} 
                  subtitle={getTranslatedText('zaklady_bez', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} 
                  title={getTranslatedText('zaklady_vruty', 'nazov') || t('groundScrews')} 
                  subtitle={getTranslatedText('zaklady_vruty', 'podnadpis') || ''} 
                  price={formatPrice(CENY.zaklady_vruty)} isPriced={true} t={t} 
                  priceKey="zaklady_vruty" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                <EditableTile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} 
                  title={getTranslatedText('zaklady_patky', 'nazov') || t('concretePads')} 
                  subtitle={getTranslatedText('zaklady_patky', 'podnadpis') || ''} 
                  price={formatPrice(CENY.zaklady_patky)} isPriced={true} t={t} 
                  priceKey="zaklady_patky" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
                <EditableTile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} 
                  title={getTranslatedText('zaklady_pasove', 'nazov') || t('stripFoundations')} 
                  subtitle={getTranslatedText('zaklady_pasove', 'podnadpis') || ''} 
                  price={formatPrice(CENY.zaklady_pasove)} isPriced={true} t={t} 
                  priceKey="zaklady_pasove" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
              </div>
            </div>
          </Card>

          {/* SLUŽBY */}
          <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-md">
            <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm mr-1">10</span>
              <Sparkles className="w-4 h-4 text-green-600" />
              {getTranslatedText('sekcia_inziniering', 'nazov') || t('engineeringDocsSection') || 'Inžiniering a dokumentácia (A0)'}
            </h3>
            <div className="space-y-1.5">
              <EditableTile selected={inziniering} onClick={() => setInziniering(!inziniering)} 
                title={getTranslatedText('inziniering', 'nazov') || t('engineering')} 
                subtitle={getTranslatedText('inziniering', 'podnadpis') || t('permit')} 
                price={formatPrice(CENY.inziniering)} isPriced={true} isA0={true} t={t} 
                priceKey="inziniering" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
              <EditableTile selected={projektACertifikacia} onClick={() => setProjektACertifikacia(!projektACertifikacia)} 
                title={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} 
                subtitle={getTranslatedText('projekt_certifikacia', 'podnadpis') || 'A0'} 
                price={formatPrice(CENY.projektACertifikacia)} isPriced={true} isA0={true} t={t} 
                priceKey="projektACertifikacia" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
              <EditableTile selected={revizia} onClick={() => setRevizia(!revizia)} 
                title={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} 
                subtitle={getTranslatedText('revizia', 'podnadpis') || ''} 
                price={formatPrice(CENY.revizia)} isPriced={true} t={t} 
                priceKey="revizia" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* REALIZÁCIA */}
          <Card className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 shadow-md">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-white text-sm mr-1">11</span>
              🚚 {getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia'}
            </h3>
            <div className="space-y-1.5">
              <EditableTile selected={montaz} onClick={() => setMontaz(!montaz)} 
                title={getTranslatedText('montaz', 'nazov') || t('houseAssembly')} 
                subtitle={getTranslatedText('montaz', 'podnadpis') || ''} 
                price={formatPrice(CENY.montaz)} isPriced={true} t={t} 
                priceKey="montaz" onPriceChange={handlePriceChange} isAdmin={isAdmin} />
              {(dopravaViditelna || isAdmin) && (
                <div className="relative">
                  <EditableTile 
                    selected={doprava && dopravaViditelna} 
                    onClick={() => dopravaViditelna && setDoprava(!doprava)} 
                    title={getTranslatedText('doprava', 'nazov') || t('transportTile')} 
                    subtitle={getTranslatedText('doprava', 'podnadpis') || t('allModulesTransport')} 
                    price={formatPrice(CENY.doprava)} 
                    isPriced={true} 
                    t={t} 
                    priceKey="doprava" 
                    onPriceChange={handlePriceChange} 
                    isAdmin={isAdmin}
                    className={!dopravaViditelna && isAdmin ? 'opacity-50 pointer-events-none' : ''} />
                  {!dopravaViditelna && isAdmin && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 rounded-lg backdrop-blur-[1px]">
                      <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <EyeOff className="w-3 h-3" />
                        Skryté pre verejnosť
                      </div>
                    </div>
                  )}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDopravaVisibility();
                      }}
                      disabled={toggleDopravaVisibilityMutation.isPending}
                      className={`absolute -top-2 -right-2 z-10 p-1.5 rounded-full shadow-lg transition-all ${
                        dopravaViditelna 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                      title={dopravaViditelna ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                    >
                      {dopravaViditelna ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sticky Footer - len pre mobil */}
        <div className="xl:hidden sticky bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3 shadow-2xl z-50 mt-4 rounded-t-2xl border-t-4 border-white/20">
          <div className="flex justify-between items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-white/70 mb-0.5">{t('priceWillBeCalculated') || 'Cena bude vypočítaná'}</p>
              <p className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">
                {t('configurator') || 'Konfigurátor'}
              </p>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-xl text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-6 rounded-xl">
              <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t('interested') || 'Mám záujem'}
            </Button>
          </div>
        </div>
      </div>
  );
}