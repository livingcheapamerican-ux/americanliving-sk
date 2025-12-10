import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EditableTile from "./EditableTile";

export default function KonfiguratorMajorca({ 
  dom, isAdmin,
  ucel, setUcel, izolaciaStien, setIzolaciaStien, izolaciaPodlahy, setIzolaciaPodlahy,
  izolaciaStropu, setIzolaciaStropu, tepelneCerpadlo, setTepelneCerpadlo, rekuperacia, setRekuperacia,
  pripravaNaRekuperaciu, setPripravaNaRekuperaciu, podlahovoKurenie, setPodlahovoKurenie, 
  pripravaNaKrb, setPripravaNaKrb, ochranaKachle, setOchranaKachle, klimatizacia, setKlimatizacia,
  fasada, setFasada, strecha, setStrecha, odkvapy, setOdkvapy, okna, setOkna, sieteProtiHmyzu, setSieteProtiHmyzu,
  vchodoveDvere, setVchodoveDvere, obkladStien, setObkladStien, podlaha, setPodlaha,
  interieroveDvere, setInterieroveDvere, elektro, setElektro, bleskozvod, setBleskozvod,
  prepat, setPrepat, sprchovyKut, setSprchovyKut, vana, setVana, bateria, setBateria,
  skrinka, setSkrinka, stropKupelna, setStropKupelna, inziniering, setInziniering,
  projektACertifikacia, setProjektACertifikacia, revizia, setRevizia, zaklady, setZaklady,
  montaz, setMontaz, doprava, setDoprava
}) {
  const { language, t } = useLanguage();

  const { data: konfigTexts = [] } = useQuery({
    queryKey: ['konfig-texts-ticab'],
    queryFn: () => base44.entities.KonfiguratorText.filter({ vyrobca: 'Ticab house' }),
    initialData: []
  });

  const getTranslatedText = (polozkaId, field) => {
    const text = konfigTexts.find(t => t.polozka_id === polozkaId);
    if (!text) return '';
    if (language === 'sk') return text[field] || '';
    const translatedField = text[`${field}_${language}`];
    return translatedField || text[field] || '';
  };

  const CENY = dom?.konfigurator_ceny || {
    izolacia_stien_200mm: 1695,
    izolacia_stien_250mm: 1599,
    izolacia_podlahy_200mm: 256,
    izolacia_stropu_200mm: 204,
    tepelne_cerpadlo: 2889,
    pripravaNaRekuperaciu: 256,
    rekuperacia: 1155,
    podlahove_kurenie: 1850,
    klimatizacia: 710,
    pripravaKrb: 579,
    ochranaKachle: 1280,
    fasada_omietka: 1734,
    fasada_smrekovec: 2850,
    fasada_falcovane: 4200,
    fasada_thermowood: 5398,
    strecha_falcovane: 2150,
    odkvapy: 950,
    sieteProtiHmyzu: 384,
    dvere_kovove: 278,
    obklad_smrek_bez_uzlov: 0,
    obklad_sadrokarton_tapeta: 5200,
    obklad_osb_panel: 3500,
    dvere_posuvne: 427,
    elektro_cz: 460,
    elektro_ge: 1199,
    bleskozvod: 856,
    prepat: 311,
    sprchovyKut: 646,
    vana: 501,
    bateria: 139,
    skrinka: 434,
    strop_kupelna_sadrokarton: 0,
    inziniering: 2774,
    projektACertifikacia: 3745,
    revizia: 1605,
    zaklady_vruty: 5419,
    zaklady_patky: 4091,
    zaklady_pasove: 5187,
    montaz: 4572,
    doprava: 5883
  };

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '0 €';
    return num > 0 ? `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 0 })} €` : '0 €';
  };

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
  React.useEffect(() => { if (setPripravaNaRekuperaciu) setPripravaNaRekuperaciu(pripravaNaRekuperaciu); }, [pripravaNaRekuperaciu]);
  React.useEffect(() => { if (setKlimatizacia) setKlimatizacia(klimatizacia); }, [klimatizacia]);
  React.useEffect(() => { if (setSieteProtiHmyzu) setSieteProtiHmyzu(sieteProtiHmyzu); }, [sieteProtiHmyzu]);
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

  return (
    <div className="w-full">
      {/* Účel stavby */}
      <Card className="p-3 sm:p-4 mb-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          {getTranslatedText('sekcia_ucel', 'nazov') || t('purposeOfBuilding') || 'Účel stavby'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUcel("chata");
              setIzolaciaStien("150mm");
              setIzolaciaPodlahy("150mm");
              setIzolaciaStropu("150mm");
              setTepelneCerpadlo("nie");
              setRekuperacia("nie");
              setInziniering(false);
              setProjektACertifikacia(false);
            }}
            className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
              ucel === "chata" ? "bg-green-100 border-green-500 shadow-md" : "bg-white border-gray-300 hover:border-green-400"
            }`}
          >
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
              {getTranslatedText('ucel_rekreacna', 'nazov') || t('recreationalBuilding')}
            </h4>
            <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">
              {getTranslatedText('ucel_rekreacna', 'podnadpis') || t('economicChoice')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUcel("rodinny");
              setIzolaciaStien("250mm");
              setIzolaciaPodlahy("200mm");
              setIzolaciaStropu("200mm");
              setTepelneCerpadlo("ano");
              setPripravaNaRekuperaciu(true);
              setRekuperacia("ano");
              setInziniering(true);
              setProjektACertifikacia(true);
              setBleskozvod(true);
              setPrepat(true);
              setElektro("ge");
              setKlimatizacia(true);
            }}
            className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
              ucel === "rodinny" ? "bg-green-100 border-green-500 shadow-md" : "bg-white border-gray-300 hover:border-green-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm sm:text-base font-bold text-gray-900">
                {getTranslatedText('ucel_rodinny', 'nazov') || t('familyHouseA0')}
              </h4>
              <Badge className="bg-green-600 text-white text-[8px] sm:text-[9px]">⚡</Badge>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Hlavný konfigurátor */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        {/* IZOLÁCIA */}
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md">
          <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-1">1</span>
            🏠 {t('insulationSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('wallInsulation')}</p>
              <div className="grid grid-cols-3 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} 
                  title="150mm" subtitle={t('recreational')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} 
                  title="200mm" price={formatPrice(CENY.izolacia_stien_200mm)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="izolacia_stien_200mm" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} 
                  title="250mm" subtitle="Premium A0" price={formatPrice(CENY.izolacia_stien_250mm)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="izolacia_stien_250mm" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('floorInsulation')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} 
                  title="150mm" price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} 
                  title="200mm" subtitle="A0" price={formatPrice(CENY.izolacia_podlahy_200mm)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="izolacia_podlahy_200mm" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('ceilingInsulation')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} 
                  title="150mm" price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} 
                  title="200mm" subtitle="A0" price={formatPrice(CENY.izolacia_stropu_200mm)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="izolacia_stropu_200mm" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>

        {/* VYKUROVANIE */}
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 shadow-md">
          <h3 className="text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-sm mr-1">2</span>
            🔥 {t('heatingSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('heating')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} 
                  title={t('heatingPreparation')} subtitle={t('convectors')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} 
                  title={t('heatPump')} subtitle={t('a0Required')} price={formatPrice(CENY.tepelne_cerpadlo)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="tepelne_cerpadlo" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('ventilation')}</p>
              <div className="grid grid-cols-3 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={rekuperacia === "nie" && !pripravaNaRekuperaciu} onClick={() => {setRekuperacia("nie"); setPripravaNaRekuperaciu(false);}} 
                  title={t('withoutRecuperation')} price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={pripravaNaRekuperaciu} onClick={() => {setPripravaNaRekuperaciu(true); setRekuperacia("nie");}} 
                  title={getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu'} price={formatPrice(CENY.pripravaNaRekuperaciu)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="pripravaNaRekuperaciu" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={rekuperacia === "ano"} onClick={() => {setRekuperacia("ano"); setPripravaNaRekuperaciu(false);}} 
                  title={t('recuperation')} subtitle={t('a0Required')} price={formatPrice(CENY.rekuperacia)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="rekuperacia" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('heatingExtras')}</p>
              <div className="space-y-1.5">
                <EditableTile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} 
                  title={t('floorHeating')} price={formatPrice(CENY.podlahove_kurenie)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="podlahove_kurenie" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} 
                  title={t('fireplacePrep')} price={formatPrice(CENY.pripravaKrb)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="pripravaKrb" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} 
                  title={t('stoveProtection')} price={formatPrice(CENY.ochranaKachle)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="ochranaKachle" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={klimatizacia} onClick={() => setKlimatizacia(!klimatizacia)} 
                  title={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} price={formatPrice(CENY.klimatizacia)} isPriced={CENY.klimatizacia > 0} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="klimatizacia" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* FASÁDA + STRECHA */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-md">
          <h3 className="text-base font-bold text-purple-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm mr-1">3</span>
            🎨 {t('facadeSection')}
          </h3>
          <div className="grid grid-cols-2 gap-1.5 border border-purple-300 rounded-md p-1.5 bg-white/50">
            <EditableTile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} 
              title={t('spruceWood')} subtitle={t('darkLight')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
            <EditableTile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} 
              title={t('scratchedPlaster')} subtitle="Baumit" price={formatPrice(CENY.fasada_omietka)} isPriced={true} t={t} isAdmin={isAdmin}
              priceKey="fasada_omietka" onPriceChange={(key, val) => CENY[key] = val} />
            <EditableTile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} 
              title={t('larch')} price={formatPrice(CENY.fasada_smrekovec)} isPriced={true} t={t} isAdmin={isAdmin}
              priceKey="fasada_smrekovec" onPriceChange={(key, val) => CENY[key] = val} />
            <EditableTile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} 
              title={t('foldedPanels')} price={formatPrice(CENY.fasada_falcovane)} isPriced={true} t={t} isAdmin={isAdmin}
              priceKey="fasada_falcovane" onPriceChange={(key, val) => CENY[key] = val} />
            <EditableTile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} 
              title="Thermowood" price={formatPrice(CENY.fasada_thermowood)} isPriced={true} t={t} isAdmin={isAdmin}
              priceKey="fasada_thermowood" onPriceChange={(key, val) => CENY[key] = val} />
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 shadow-md">
          <h3 className="text-base font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm mr-1">4</span>
            🏠 {t('roofSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('roofCoveringType')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} 
                  title={t('corrugatedMetal')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} 
                  title={t('foldedPanels')} price={formatPrice(CENY.strecha_falcovane)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="strecha_falcovane" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('gutters')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} 
                  title={t('withoutGutters')} price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} 
                  title={t('gutters')} subtitle={t('roofColor')} price={formatPrice(CENY.odkvapy)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="odkvapy" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* OKNÁ A DVERE */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card className="p-3 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-300 shadow-md">
          <h3 className="text-base font-bold text-cyan-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-600 text-white text-sm mr-1">5</span>
            🚪 {t('windowsDoorsSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('windowColor')}</p>
              <div className="grid grid-cols-3 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={okna === "biele"} onClick={() => setOkna("biele")} 
                  title={t('white')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={okna === "antracit"} onClick={() => setOkna("antracit")} 
                  title={t('anthracite')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={okna === "hnede"} onClick={() => setOkna("hnede")} 
                  title={t('brown')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('entryDoors')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} 
                  title={t('metalPlasticDoors')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} 
                  title={t('metalDoors')} price={formatPrice(CENY.dvere_kovove)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="dvere_kovove" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('windowExtras') || 'Doplnky k oknám:'}</p>
              <div className="border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={sieteProtiHmyzu} onClick={() => setSieteProtiHmyzu(!sieteProtiHmyzu)} 
                  title={t('insectScreens') || 'Siete proti hmyzu'} price={formatPrice(CENY.sieteProtiHmyzu)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="sieteProtiHmyzu" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>

        {/* INTERIÉR */}
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md">
          <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-sm mr-1">6</span>
            🛋️ {t('interiorSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('wallCladding')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} 
                  title={t('spruceWall8cm')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} 
                  title={t('spruceWallNoKnots')} price={formatPrice(CENY.obklad_smrek_bez_uzlov)} isPriced={false} t={t} isAdmin={isAdmin}
                  priceKey="obklad_smrek_bez_uzlov" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} 
                  title={t('drywallWallpaperPaint')} price={formatPrice(CENY.obklad_sadrokarton_tapeta)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="obklad_sadrokarton_tapeta" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} 
                  title={t('osbLaminatePanel')} price={formatPrice(CENY.obklad_osb_panel)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="obklad_osb_panel" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('floorType')}</p>
              <div className="border border-amber-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} 
                  title={t('laminate')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('interiorDoorsType')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} 
                  title={t('hingedDoors')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} 
                  title={t('slidingDoors')} price={formatPrice(CENY.dvere_posuvne)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="dvere_posuvne" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ELEKTRO + KÚPEĽŇA */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md">
          <h3 className="text-base font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-600 text-white text-sm mr-1">7</span>
            ⚡ {t('electricalSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('installationType')}</p>
              <div className="grid grid-cols-3 gap-1.5 border border-yellow-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={elektro === "eu"} onClick={() => setElektro("eu")} 
                  title={t('euStandard')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={elektro === "cz"} onClick={() => setElektro("cz")} 
                  title={t('czSkStandard')} subtitle={t('socketsExtraFuses')} price={formatPrice(CENY.elektro_cz)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="elektro_cz" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={elektro === "ge"} onClick={() => setElektro("ge")} 
                  title={t('geStandard')} price={formatPrice(CENY.elektro_ge)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="elektro_ge" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">{t('heatingExtras')}</p>
              <div className="space-y-2">
                <EditableTile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} 
                  title={t('lightningRod')} price={formatPrice(CENY.bleskozvod)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="bleskozvod" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={prepat} onClick={() => setPrepat(!prepat)} 
                  title={t('surgeProtection')} price={formatPrice(CENY.prepat)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
                  priceKey="prepat" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-md">
          <h3 className="text-base font-bold text-teal-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-sm mr-1">8</span>
            🚿 {t('bathroomSection')}
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('showerCabin')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} 
                  title={t('shower')} subtitle="WC Geberit" price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} 
                  title={t('showerRadawayTile')} price={formatPrice(CENY.sprchovyKut)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="sprchovyKut" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('faucet')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={bateria === "standard"} onClick={() => setBateria("standard")} 
                  title={t('faucetStandard')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} 
                  title="Grohe" price={formatPrice(CENY.bateria)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="bateria" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('bathroomCeiling')}</p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <EditableTile selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} 
                  title={t('ceilingWoodPattern')} price="0 €" isPriced={false} isIncluded={true} t={t} isAdmin={isAdmin} />
                <EditableTile selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} 
                  title={t('drywallWallpaperPaint')} price={formatPrice(CENY.strop_kupelna_sadrokarton)} isPriced={false} t={t} isAdmin={isAdmin}
                  priceKey="strop_kupelna_sadrokarton" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('bathExtras')}</p>
              <div className="space-y-1.5">
                <EditableTile selected={vana} onClick={() => setVana(!vana)} 
                  title={t('bathtub')} price={formatPrice(CENY.vana)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="vana" onPriceChange={(key, val) => CENY[key] = val} />
                <EditableTile selected={skrinka} onClick={() => setSkrinka(!skrinka)} 
                  title={t('cabinet')} price={formatPrice(CENY.skrinka)} isPriced={true} t={t} isAdmin={isAdmin}
                  priceKey="skrinka" onPriceChange={(key, val) => CENY[key] = val} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ZÁKLADY + SLUŽBY */}
      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card className="p-3 bg-gradient-to-br from-stone-50 to-gray-50 border-2 border-stone-300 shadow-md">
          <h3 className="text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-600 text-white text-sm mr-1">9</span>
            🏗️ {t('foundationsSection')}
          </h3>
          <div>
            <p className="text-[11px] font-semibold text-gray-700 mb-1">{t('foundationType')}</p>
            <div className="grid grid-cols-2 gap-1.5 border border-stone-300 rounded-md p-1.5 bg-white/50">
              <EditableTile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} 
                title={t('noFoundations')} price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} isAdmin={isAdmin} />
              <EditableTile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} 
                title={t('groundScrews')} price={formatPrice(CENY.zaklady_vruty)} isPriced={true} t={t} isAdmin={isAdmin}
                priceKey="zaklady_vruty" onPriceChange={(key, val) => CENY[key] = val} />
              <EditableTile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} 
                title={t('concretePads')} price={formatPrice(CENY.zaklady_patky)} isPriced={true} t={t} isAdmin={isAdmin}
                priceKey="zaklady_patky" onPriceChange={(key, val) => CENY[key] = val} />
              <EditableTile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} 
                title={t('stripFoundations')} price={formatPrice(CENY.zaklady_pasove)} isPriced={true} t={t} isAdmin={isAdmin}
                priceKey="zaklady_pasove" onPriceChange={(key, val) => CENY[key] = val} />
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-md">
          <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm mr-1">10</span>
            📋 {t('servicesSection')}
          </h3>
          <div className="space-y-1.5">
            <EditableTile selected={inziniering} onClick={() => setInziniering(!inziniering)} 
              title={t('engineering')} subtitle={t('permit')} price={formatPrice(CENY.inziniering)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
              priceKey="inziniering" onPriceChange={(key, val) => CENY[key] = val} />
            <EditableTile selected={projektACertifikacia} onClick={() => setProjektACertifikacia(!projektACertifikacia)} 
              title={t('projectCertShort')} subtitle="A0" price={formatPrice(CENY.projektACertifikacia)} isPriced={true} isA0={true} t={t} isAdmin={isAdmin}
              priceKey="projektACertifikacia" onPriceChange={(key, val) => CENY[key] = val} />
            <EditableTile selected={revizia} onClick={() => setRevizia(!revizia)} 
              title={t('revisionDocsShort')} price={formatPrice(CENY.revizia)} isPriced={true} t={t} isAdmin={isAdmin}
              priceKey="revizia" onPriceChange={(key, val) => CENY[key] = val} />
          </div>
        </Card>
      </div>

      {/* REALIZÁCIA */}
      <Card className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 shadow-md mb-3">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-white text-sm mr-1">11</span>
          🚚 {t('realizationSection')}
        </h3>
        <div className="space-y-1.5">
          <EditableTile selected={montaz} onClick={() => setMontaz(!montaz)} 
            title={t('houseAssembly')} price={formatPrice(CENY.montaz)} isPriced={true} t={t} isAdmin={isAdmin}
            priceKey="montaz" onPriceChange={(key, val) => CENY[key] = val} />
          <EditableTile selected={doprava} onClick={() => setDoprava(!doprava)} 
            title={t('transportTile')} subtitle={t('allModulesTransport')} price={formatPrice(CENY.doprava)} isPriced={true} t={t} isAdmin={isAdmin}
            priceKey="doprava" onPriceChange={(key, val) => CENY[key] = val} />
        </div>
      </Card>
    </div>
  );
}