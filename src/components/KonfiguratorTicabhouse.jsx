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

        {/* Zvyšok konfigurátora - ideme skopírovať štruktúru z Lyon ale s EditableTile */}
        {/* Tu pokračuje zvyšok konfigurátora... */}
        <p className="text-center text-gray-500 text-sm my-8">
          Konfigurátor pre {dom?.nazov} - Základná cena: {dom?.zakladna_cena?.toLocaleString('sk-SK')} €
        </p>
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