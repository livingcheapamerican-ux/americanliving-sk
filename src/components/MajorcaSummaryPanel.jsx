import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import { useLanguage } from "./LanguageContext";

export default function MajorcaSummaryPanel({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu, podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, onSubmit, dom
}) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const isA0Configuration = () => {
    return (
      izolaciaStien === "250mm" &&
      izolaciaPodlahy === "200mm" &&
      izolaciaStropu === "200mm" &&
      tepelneCerpadlo === "ano" &&
      rekuperacia === "ano" &&
      elektro === "ge" &&
      bleskozvod &&
      prepat &&
      inziniering &&
      projektACertifikacia
    );
  };

  const isA0 = isA0Configuration();
  const actualStatus = ucel === "rodinny" && isA0 ? (t('familyHouseA0') || "Rodinný dom A0") : (t('recreationalBuilding') || "Rekreačná stavba");

  const DEFAULT_CENY = {
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
    dvere_kovove: 278,
    obklad_smrek_bez_uzlov: 0,
    obklad_sadrokarton_tapeta: 5200,
    obklad_osb_panel: 3500,
    dvere_posuvne: 427,
    elektro_cz: 460,
    elektro_ge: 1199,
    bleskozvod: 856,
    prepat: 311,
    pripravaNaSolarnePanely: 985,
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

  const CENY = {
    ...DEFAULT_CENY,
    ...(dom?.konfigurator_ceny || {})
  };

  const getFormatCena = (priceKey) => {
    const cena = CENY[priceKey];
    if (!cena || cena === 0) return "";
    return ` (+${cena.toLocaleString('sk-SK', { maximumFractionDigits: 0 })} €)`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6" />
            {t('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">{dom?.nazov || 'Ticabhouse'}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto custom-scrollbar">
        {/* Účel */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-400 mb-1">{t('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
          <p className="text-base font-bold text-white mb-1">{actualStatus}</p>
          {ucel === "rodinny" && !isA0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200">{t('missingA0Items')}</p>
            </div>
          )}
           {/* Zvolené parametre */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 space-y-3">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-700/50 pb-1.5 mb-1">
            {t('selectedParameters') || 'ZVOLENÉ PARAMETRE'}
          </div>

          {/* Izolácia stien */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('wallInsulation') || 'Izolácia stien'}</span>
            <span className="font-semibold text-white">
              {izolaciaStien === "150mm" ? `150 mm (${t('summaryBase') || 'Základ'})` : `${izolaciaStien}${getFormatCena('izolacia_stien_' + izolaciaStien)}`}
            </span>
          </div>

          {/* Izolácia podlahy */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('floorInsulation') || 'Izolácia podlahy'}</span>
            <span className="font-semibold text-white">
              {izolaciaPodlahy === "150mm" ? `150 mm (${t('summaryBase') || 'Základ'})` : `${izolaciaPodlahy}${getFormatCena('izolacia_podlahy_' + izolaciaPodlahy)}`}
            </span>
          </div>

          {/* Izolácia stropu */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('ceilingInsulation') || 'Izolácia stropu'}</span>
            <span className="font-semibold text-white">
              {izolaciaStropu === "150mm" ? `150 mm (${t('summaryBase') || 'Základ'})` : `${izolaciaStropu}${getFormatCena('izolacia_stropu_' + izolaciaStropu)}`}
            </span>
          </div>

          {/* Fasáda */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('facadeSection') || 'Fasáda'}</span>
            <span className="font-semibold text-white">
              {fasada === "drevo_smrek" ? `${t('summarySpruce') || 'Severský smrek'} (${t('summaryBase') || 'Základ'})` :
               fasada === "omietka" ? `${t('summaryPlaster') || 'Šúchaná omietka'}${getFormatCena('fasada_omietka')}` : 
               fasada === "smrekovec" ? `${t('summaryLarch') || 'Sibírsky smrekovec'}${getFormatCena('fasada_smrekovec')}` :
               fasada === "falcovane" ? `${t('summaryFoldedPanels') || 'Falcovaný plech'}${getFormatCena('fasada_falcovane')}` :
               `${t('summaryThermowood') || 'Thermowood'}${getFormatCena('fasada_thermowood')}`}
            </span>
          </div>

          {/* Strešná krytina */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('roofSection') || 'Strešná krytina'}</span>
            <span className="font-semibold text-white">
              {strecha === "korugovan_plech" ? `${t('summaryCorrugatedSheet') || 'Korugovaný plech'} (${t('summaryBase') || 'Základ'})` : `${t('summaryFoldedPanels') || 'Falcovaný plech'}${getFormatCena('strecha_falcovane')}`}
            </span>
          </div>

          {/* Farba okien */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('windows') || 'Farba okien'}</span>
            <span className="font-semibold text-white">
              {okna === "biele" ? `${t('summaryWhite') || 'Biele'} (${t('summaryBase') || 'Základ'})` : 
               okna === "antracit" ? `${t('summaryAntracit') || 'Antracit'} (${t('summaryBase') || 'Základ'})` : 
               `${t('summaryBrown') || 'Hnedé'} (${t('summaryBase') || 'Základ'})`}
            </span>
          </div>

          {/* Vchodové dvere */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('vchodoveDvere') || 'Vchodové dvere'}</span>
            <span className="font-semibold text-white">
              {vchodoveDvere === "plastove" ? `${t('summaryPlasticMetal') || 'Plastovo-kovové'} (${t('summaryBase') || 'Základ'})` : `${t('summaryMetal') || 'Kovové'}${getFormatCena('dvere_kovove')}`}
            </span>
          </div>

          {/* Obklad stien */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('wallCladding') || 'Obklad stien'}</span>
            <span className="font-semibold text-white">
              {obkladStien === "smrek_8cm" ? `${t('summarySpruce8cm') || 'Smrek 8cm'} (${t('summaryBase') || 'Základ'})` :
               obkladStien === "smrek_bez_uzlov" ? `${t('summarySpruceNoKnots') || 'Smrek bez uzlov'} (${t('summaryBase') || 'Základ'})` :
               obkladStien === "sadrokarton_tapeta" ? `${t('summaryPlasterboardWallpaper') || 'Sadrokartón/Tapeta'}${getFormatCena('obklad_sadrokarton_tapeta')}` : 
               `${t('summaryOsbPanel') || 'OSB panel'}${getFormatCena('obklad_osb_panel')}`}
            </span>
          </div>

          {/* Podlaha */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('floorType') || 'Podlaha'}</span>
            <span className="font-semibold text-white">
              {t('summaryLaminate') || 'Laminát'} ({t('summaryBase') || 'Základ'})
            </span>
          </div>

          {/* Interiérové dvere */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('interiorDoorsType') || 'Interiérové dvere'}</span>
            <span className="font-semibold text-white">
              {interieroveDvere === "kridlove" ? `${t('summaryHinged') || 'Krídlové'} (${t('summaryBase') || 'Základ'})` : `${t('summarySliding') || 'Posuvné'}${getFormatCena('dvere_posuvne')}`}
            </span>
          </div>

          {/* Elektroinštalácia */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('electricalSection') || 'Elektroinštalácia'}</span>
            <span className="font-semibold text-white">
              {elektro === "eu" ? `${t('euStandard') || 'EU štandard'} (${t('summaryBase') || 'Základ'})` :
               elektro === "cz" ? `${t('czSkStandard') || 'CZ/SK štandard'}${getFormatCena('elektro_cz')}` : 
               `${t('geStandard') || 'Nemecký štandard (A0)'}${getFormatCena('elektro_ge')}`}
            </span>
          </div>

          {/* Sprchový kút */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('showerCabin') || 'Sprchový kút'}</span>
            <span className="font-semibold text-white">
              {sprchovyKut === "standard" ? `${t('summaryStandard') || 'Štandard'} (${t('summaryBase') || 'Základ'})` : `Radaway${getFormatCena('sprchovyKut')}`}
            </span>
          </div>

          {/* Kúpeľňová batéria */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('faucet') || 'Kúpeľňová batéria'}</span>
            <span className="font-semibold text-white">
              {bateria === "standard" ? `${t('summaryStandard') || 'Štandard'} (${t('summaryBase') || 'Základ'})` : `Grohe${getFormatCena('bateria')}`}
            </span>
          </div>

          {/* Strop v kúpeľni */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('bathroomCeiling') || 'Strop v kúpeľni'}</span>
            <span className="font-semibold text-white">
              {stropKupelna === "drevo" ? `${t('summaryWoodCladding') || 'Drevený obklad'} (${t('summaryBase') || 'Základ'})` : `${t('summaryPlasterboard') || 'Sadrokartón'} (${t('summaryBase') || 'Základ'})`}
            </span>
          </div>

          {/* Základy */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('foundationsSection') || 'Základy'}</span>
            <span className="font-semibold text-white">
              {zaklady === "bez" ? `${t('summaryNoFoundations') || 'Bez základov'} (${t('summaryBase') || 'Základ'})` :
               zaklady === "vruty" ? `${t('summaryGroundScrews') || 'Zemné skrutky'}${getFormatCena('zaklady_vruty')}` : 
               zaklady === "patky" ? `${t('summaryConcreteFootings') || 'Betónové pätky'}${getFormatCena('zaklady_patky')}` : 
               `${t('summaryStripFoundations') || 'Pásové základy'}${getFormatCena('zaklady_pasove')}`}
            </span>
          </div>
        </div>

        {/* Doplnková výbava */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 space-y-3">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-700/50 pb-1.5 mb-1">
            {t('additionalEquipment') || 'DOPLNKOVÁ VÝBAVA'}
          </div>

          {/* Tepelné čerpadlo */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('heatPump') || 'Tepelné čerpadlo'}</span>
            <span className="font-semibold text-white">
              {tepelneCerpadlo === "ano" ? `${t('summaryYesLower') || 'áno'}${getFormatCena('tepelne_cerpadlo')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Príprava na rekuperáciu */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('recuperationPrep') || 'Príprava na rekuperáciu'}</span>
            <span className="font-semibold text-white">
              {pripravaNaRekuperaciu ? `${t('summaryYesLower') || 'áno'}${getFormatCena('pripravaNaRekuperaciu')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Rekuperácia */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('recuperation') || 'Rekuperácia'}</span>
            <span className="font-semibold text-white">
              {rekuperacia === "ano" ? `${t('summaryYesLower') || 'áno'}${getFormatCena('rekuperacia')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Podlahové kúrenie */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('floorHeating') || 'Podlahové kúrenie'}</span>
            <span className="font-semibold text-white">
              {podlahovoKurenie ? `${t('summaryYesLower') || 'áno'}${getFormatCena('podlahove_kurenie')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Klimatizácia */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('airConditioningPrep') || 'Príprava na klimatizaciju'}</span>
            <span className="font-semibold text-white">
              {klimatizacia ? `${t('summaryYesLower') || 'áno'}${getFormatCena('klimatizacia')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Príprava na krb */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('fireplacePrep') || 'Príprava na krb'}</span>
            <span className="font-semibold text-white">
              {pripravaNaKrb ? `${t('summaryYesLower') || 'áno'}${getFormatCena('pripravaKrb')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Ochrana (Kachle) */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('stoveProtection') || 'Ochrana (Kachle)'}</span>
            <span className="font-semibold text-white">
              {ochranaKachle ? `${t('summaryYesLower') || 'áno'}${getFormatCena('ochranaKachle')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Odkvapy */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('gutters') || 'Odkvapy'}</span>
            <span className="font-semibold text-white">
              {odkvapy === "ano" ? `${t('summaryYesLower') || 'áno'}${getFormatCena('odkvapy')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Bleskozvod */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('lightningRod') || 'Bleskozvod'}</span>
            <span className="font-semibold text-white">
              {bleskozvod ? `${t('summaryYesLower') || 'áno'}${getFormatCena('bleskozvod')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Prepäťová ochrana */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('surgeProtection') || 'Prepäťová ochrana'}</span>
            <span className="font-semibold text-white">
              {prepat ? `${t('summaryYesLower') || 'áno'}${getFormatCena('prepat')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Príprava na solárne panely */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('solarPanelsPrep') || 'Príprava na solárne panely'}</span>
            <span className="font-semibold text-white">
              {pripravaNaSolarnePanely ? `${t('summaryYesLower') || 'áno'}${getFormatCena('pripravaNaSolarnePanely')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Vaňa */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('bathtub') || 'Vaňa'}</span>
            <span className="font-semibold text-white">
              {vana ? `${t('summaryYesLower') || 'áno'}${getFormatCena('vana')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Skrinka s umývadlom */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('cabinet') || 'Skrinka s umývadlom'}</span>
            <span className="font-semibold text-white">
              {skrinka ? `${t('summaryYesLower') || 'áno'}${getFormatCena('skrinka')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Inžiniering */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('engineering') || 'Inžiniering'}</span>
            <span className="font-semibold text-white">
              {inziniering ? `${t('summaryYesLower') || 'áno'}${getFormatCena('inziniering')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Projekt a certifikácia */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('projectCertification') || 'Projekt a certifikácia'}</span>
            <span className="font-semibold text-white">
              {projektACertifikacia ? `${t('summaryYesLower') || 'áno'}${getFormatCena('projektACertifikacia')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Revízia */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('revisionDocs') || 'Revízia'}</span>
            <span className="font-semibold text-white">
              {revizia ? `${t('summaryYesLower') || 'áno'}${getFormatCena('revizia')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Montáž */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('assembly') || 'Montáž domu'}</span>
            <span className="font-semibold text-white">
              {montaz ? `${t('summaryYesLower') || 'áno'}${getFormatCena('montaz')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>

          {/* Doprava */}
          <div className="flex justify-between text-sm text-slate-300">
            <span>{t('transport') || 'Doprava'}</span>
            <span className="font-semibold text-white">
              {doprava ? `${t('summaryYesLower') || 'áno'}${getFormatCena('doprava')}` : (t('summaryNoLower') || "nie")}
            </span>
          </div>
        </div>
      </div>

      {/* Total Price */}
      <div className="border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-sm text-blue-100 mb-1">{t('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
        <p className="text-3xl font-black text-white">{formatPrice(totalPrice)}</p>
        <div className="mt-3 space-y-2">
          <Button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('interested') || 'Ukáž môj dom'}
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="outline"
            className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            {t('sendInquiry') || 'Odoslať dopyt'}
          </Button>
        </div>
      </div>

      {/* Modal */}
      <LyonFinalSummaryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        dom={dom}
        ucel={ucel}
        izolaciaStien={izolaciaStien}
        izolaciaPodlahy={izolaciaPodlahy}
        izolaciaStropu={izolaciaStropu}
        tepelneCerpadlo={tepelneCerpadlo}
        rekuperacia={rekuperacia}
        pripravaNaRekuperaciu={pripravaNaRekuperaciu}
        podlahovoKurenie={podlahovoKurenie}
        pripravaNaKrb={pripravaNaKrb}
        ochranaKachle={ochranaKachle}
        klimatizacia={klimatizacia}
        fasada={fasada}
        strecha={strecha}
        odkvapy={odkvapy}
        okna={okna}
        sieteProtiHmyzu={undefined}
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
      />
    </Card>
  );
}