import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditableTile from "./EditableTile";
import { LyonSummaryPanel } from "./KonfiguratorLyon";
import { toast } from "sonner";

export default function KonfiguratorTicabhouse({ dom, isAdmin }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

  // Načítať texty konfiguratora
  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  // Pomocná funkcia na získanie preloženého textu
  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return '';
    
    if (language === 'sk') return text[field] || '';
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || '';
  };

  // Načítať ceny z entity Dom alebo použiť default ceny Lyon
  const DEFAULT_CENY = {
    izolacia_stien_200mm: 1799.16,
    izolacia_stien_250mm: 1558.17,
    izolacia_podlahy_200mm: 334.08,
    izolacia_stropu_200mm: 271.44,
    tepelne_cerpadlo: 2889.27,
    rekuperacia: 1155.36,
    podlahove_kurenie: 2253.30,
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

  const CENY = dom?.konfigurator_ceny || DEFAULT_CENY;

  // State pre konfiguráciu
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
  const [obkladStien, setObkladStien] = useState("smrek_8cm");
  const [podlaha, setPodlaha] = useState("laminat");
  const [interieroveDvere, setInterieroveDvere] = useState("kridlove");
  const [elektro, setElektro] = useState("eu");
  const [bleskozvod, setBleskozvod] = useState(false);
  const [prepat, setPrepat] = useState(false);
  const [sprchovyKut, setSprchovyKut] = useState("standard");
  const [vana, setVana] = useState(false);
  const [bateria, setBateria] = useState("standard");
  const [skrinka, setSkrinka] = useState(false);
  const [stropKupelna, setStropKupelna] = useState("drevo");
  const [inziniering, setInziniering] = useState(false);
  const [projektACertifikacia, setProjektACertifikacia] = useState(false);
  const [revizia, setRevizia] = useState(true);
  const [zaklady, setZaklady] = useState("bez");
  const [montaz, setMontaz] = useState(false);
  const [doprava, setDoprava] = useState(false);

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
    if (izolaciaStien === "200mm") price += CENY.izolacia_stien_200mm;
    if (izolaciaStien === "250mm") price += CENY.izolacia_stien_250mm;
    if (izolaciaPodlahy === "200mm") price += CENY.izolacia_podlahy_200mm;
    if (izolaciaStropu === "200mm") price += CENY.izolacia_stropu_200mm;

    // Vykurovanie
    if (tepelneCerpadlo === "ano") price += CENY.tepelne_cerpadlo;
    if (rekuperacia === "ano") price += CENY.rekuperacia;
    if (podlahovoKurenie) price += CENY.podlahove_kurenie;
    if (pripravaNaKrb) price += CENY.pripravaKrb;
    if (ochranaKachle) price += CENY.ochranaKachle;

    // Fasáda
    if (fasada === "omietka") price += CENY.fasada_omietka;
    if (fasada === "smrekovec") price += CENY.fasada_smrekovec;
    if (fasada === "falcovane") price += CENY.fasada_falcovane;
    if (fasada === "thermowood") price += CENY.fasada_thermowood;

    // Strecha
    if (strecha === "falcovane") price += CENY.strecha_falcovane;
    if (odkvapy === "ano") price += CENY.odkvapy;

    // Dvere
    if (vchodoveDvere === "kovove") price += CENY.dvere_kovove;

    // Interiér
    if (obkladStien === "smrek_bez_uzlov") price += CENY.obklad_smrek_bez_uzlov;
    if (obkladStien === "sadrokarton_tapeta") price += CENY.obklad_sadrokarton_tapeta;
    if (obkladStien === "osb_panel") price += CENY.obklad_osb_panel;
    if (interieroveDvere === "posuvne") price += CENY.dvere_posuvne;

    // Elektro
    if (elektro === "cz") price += CENY.elektro_cz;
    if (elektro === "ge") price += CENY.elektro_ge;
    if (bleskozvod) price += CENY.bleskozvod;
    if (prepat) price += CENY.prepat;

    // Kúpeľňa
    if (sprchovyKut === "radaway") price += CENY.sprchovyKut;
    if (vana) price += CENY.vana;
    if (bateria === "grohe") price += CENY.bateria;
    if (skrinka) price += CENY.skrinka;
    if (stropKupelna === "sadrokarton") price += CENY.strop_kupelna_sadrokarton;

    // Služby
    if (inziniering) price += CENY.inziniering;
    if (projektACertifikacia) price += CENY.projektACertifikacia;
    if (revizia) price += CENY.revizia;

    // Základy
    if (zaklady === "vruty") price += CENY.zaklady_vruty;
    if (zaklady === "patky") price += CENY.zaklady_patky;
    if (zaklady === "pasove") price += CENY.zaklady_pasove;

    // Realizácia
    if (montaz) price += CENY.montaz;
    if (doprava) price += CENY.doprava;

    return price;
  }, [
    dom?.zakladna_cena, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
    tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
    fasada, strecha, odkvapy, vchodoveDvere, obkladStien, interieroveDvere,
    elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
    inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava, CENY
  ]);

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '0 €';
    return num > 0 ? `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 2 })} €` : '0 €';
  };

  const handleSubmit = () => {
    console.log('Submit konfigurácie');
  };

  return (
    <div className="grid xl:grid-cols-[1fr,400px] gap-4">
      {/* Konfigurátor */}
      <div className="w-full">
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
                setInziniering(false);
                setProjektACertifikacia(false);
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
                setRekuperacia("ano");
                setInziniering(true);
                setProjektACertifikacia(true);
                setBleskozvod(true);
                setPrepat(true);
                setElektro("ge");
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
        <div className="grid lg:grid-cols-2 gap-3 mb-3">
          {/* IZOLÁCIA */}
          <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md">
            <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-1">1</span>
              🏠 {getTranslatedText('sekcia_izolacia', 'nazov') || t('insulationSection') || 'Izolácia'}
            </h3>
            <div className="space-y-2">
              {/* Steny */}
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_stien', 'nazov') || t('wallInsulation') || 'Izolácia stien:'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
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
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
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
                <p className="text-[11px] font-semibold text-gray-700 mb-1">
                  {getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu:'}
                </p>
                <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
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
                <div className="grid grid-cols-2 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                  <EditableTile selected={rekuperacia === "nie"} onClick={() => setRekuperacia("nie")} 
                    title={getTranslatedText('rekuperacia_nie', 'nazov') || t('withoutRecuperation')} 
                    subtitle={getTranslatedText('rekuperacia_nie', 'podnadpis') || ''} 
                    price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                  <EditableTile selected={rekuperacia === "ano"} onClick={() => setRekuperacia("ano")} 
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
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pokračovanie sekcií */}
        <div className="grid lg:grid-cols-2 gap-3 mb-3">
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

          {/* STRECHA a ostatné sekcie budú doplnené neskôr */}
        </div>
      </div>

      {/* Sidebar - Summary Panel */}
      <div className="hidden xl:block sticky top-24 h-fit">
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
          formatPrice={(p) => p.toLocaleString('sk-SK', { minimumFractionDigits: 2 }) + ' €'}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>
    </div>
  );
}