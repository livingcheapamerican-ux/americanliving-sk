import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Send, Eye, AlertCircle } from "lucide-react";
import LyonFinalSummaryModal from "./LyonFinalSummaryModal";
import { useLanguage } from "./LanguageContext";
import { base44 } from "@/api/base44Client";
import FloatingPrice from "./FloatingPrice";

export default function LyonSummaryPanelStandalone({ 
  predajNehnutelnosti, hladamPozemok, financneSluzby,
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

  // DÔLEŽITÉ: Používame totalPrice priamo z propu, nerobíme vlastný výpočet!
  const displayPrice = totalPrice || dom?.zakladna_cena || 0;

  // Kontrola či je konfigurácia A0
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

  const getFormatCena = (priceKey) => {
    const cena = CENY[priceKey];
    if (!cena || cena === 0) return "";
    return ` (+${cena.toLocaleString('sk-SK', { maximumFractionDigits: 0 })} €)`;
  };

  return (
    <Card className="bg-card text-foreground shadow-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-border">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Home className="w-6 h-6" />
            {t('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-sm text-blue-100 mt-1">{dom?.nazov || 'Ticabhouse'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto custom-scrollbar">
        {/* Účel + status */}
        <div className="bg-muted rounded-lg p-3 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">{t('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
          <p className="text-base font-bold text-foreground mb-1">{actualStatus}</p>
          {ucel === "rodinny" && !isA0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {t('missingA0Items') || 'Chýbajú povinné A0 položky. Aktuálne je to rekreačná stavba.'}
              </p>
            </div>
          )}
        </div>

        {/* Zvolené parametre */}
        <div className="bg-muted rounded-lg p-3 border border-border space-y-3">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-border/10 pb-1.5 mb-1">
            {t('selectedParameters') || 'ZVOLENÉ PARAMETRE'}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('wallInsulation') || 'Izolácia stien'}</span>
            <span className="font-semibold text-foreground">
              {izolaciaStien === "150mm" ? `150 mm (${t('baseConfig') || 'Základ'})` : `${izolaciaStien}${getFormatCena('izolacia_stien_' + izolaciaStien)}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('floorInsulation') || 'Izolácia podlahy'}</span>
            <span className="font-semibold text-foreground">
              {izolaciaPodlahy === "150mm" ? `150 mm (${t('baseConfig') || 'Základ'})` : `${izolaciaPodlahy}${getFormatCena('izolacia_podlahy_' + izolaciaPodlahy)}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('ceilingInsulation') || 'Izolácia stropu'}</span>
            <span className="font-semibold text-foreground">
              {izolaciaStropu === "150mm" ? `150 mm (${t('baseConfig') || 'Základ'})` : `${izolaciaStropu}${getFormatCena('izolacia_stropu_' + izolaciaStropu)}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('facadeSection') || 'Fasáda'}</span>
            <span className="font-semibold text-foreground">
              {fasada === "drevo_smrek" ? `Severský smrek (${t('baseConfig') || 'Základ'})` :
               fasada === "omietka" ? `Omietka${getFormatCena('fasada_omietka')}` : 
               fasada === "smrekovec" ? `Červený smrekovec${getFormatCena('fasada_smrekovec')}` :
               fasada === "falcovane" ? `Falcovaný plech${getFormatCena('fasada_falcovane')}` :
               `Thermowood${getFormatCena('fasada_thermowood')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('roofSection') || 'Strešná krytina'}</span>
            <span className="font-semibold text-foreground">
              {strecha === "korugovan_plech" ? `Korugovaný plech (${t('baseConfig') || 'Základ'})` : `Falcovaný plech${getFormatCena('strecha_falcovane')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('windows') || 'Farba okien'}</span>
            <span className="font-semibold text-foreground">
              {okna === "biele" ? `Biele (${t('baseConfig') || 'Základ'})` : 
               okna === "antracit" ? `Antracit (${t('baseConfig') || 'Základ'})` : 
               `Hnedé (${t('baseConfig') || 'Základ'})`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('vchodoveDvere') || 'Vchodové dvere'}</span>
            <span className="font-semibold text-foreground">
              {vchodoveDvere === "plastove" ? `Plastovo-kovové (${t('baseConfig') || 'Základ'})` : `Kovové${getFormatCena('dvere_kovove')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('wallCladding') || 'Obklad stien'}</span>
            <span className="font-semibold text-foreground">
              {obkladStien === "smrek_8cm" ? `Smrek 8cm (${t('baseConfig') || 'Základ'})` :
               obkladStien === "smrek_bez_uzlov" ? `Smrek bez uzlov (${t('baseConfig') || 'Základ'})` :
               obkladStien === "sadrokarton_tapeta" ? `Sadrokartón/Tapeta${getFormatCena('obklad_sadrokarton_tapeta')}` : 
               `OSB panel${getFormatCena('obklad_osb_panel')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('floorType') || 'Podlaha'}</span>
            <span className="font-semibold text-foreground">
              Laminát ({t('baseConfig') || 'Základ'})
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('interiorDoorsType') || 'Interiérové dvere'}</span>
            <span className="font-semibold text-foreground">
              {interieroveDvere === "kridlove" ? `Krídlové (${t('baseConfig') || 'Základ'})` : `Posuvné${getFormatCena('dvere_posuvne')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('electricalSection') || 'Elektroinštalácia'}</span>
            <span className="font-semibold text-foreground">
              {elektro === "eu" ? `EU štandard (${t('baseConfig') || 'Základ'})` :
               elektro === "cz" ? `CZ/SK štandard${getFormatCena('elektro_cz')}` : 
               `Nemecký štandard (A0)${getFormatCena('elektro_ge')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('showerCabin') || 'Sprchový kút'}</span>
            <span className="font-semibold text-foreground">
              {sprchovyKut === "standard" ? `Štandard (${t('baseConfig') || 'Základ'})` : `Radaway${getFormatCena('sprchovyKut')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('faucet') || 'Kúpeľňová batéria'}</span>
            <span className="font-semibold text-foreground">
              {bateria === "standard" ? `Štandard (${t('baseConfig') || 'Základ'})` : `Grohe${getFormatCena('bateria')}`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('bathroomCeiling') || 'Strop v kúpeľni'}</span>
            <span className="font-semibold text-foreground">
              {stropKupelna === "drevo" ? `Drevený obklad (${t('baseConfig') || 'Základ'})` : `Sadrokartón (${t('baseConfig') || 'Základ'})`}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('foundationsSection') || 'Základy'}</span>
            <span className="font-semibold text-foreground">
              {zaklady === "bez" ? `Bez základov (${t('baseConfig') || 'Základ'})` :
               zaklady === "vruty" ? `Zemné skrutky${getFormatCena('zaklady_vruty')}` : 
               zaklady === "patky" ? `Betónové pätky${getFormatCena('zaklady_patky')}` : 
               `Pásové základy${getFormatCena('zaklady_pasove')}`}
            </span>
          </div>
        </div>

        {/* Doplnková výbava */}
        <div className="bg-muted rounded-lg p-3 border border-border space-y-3">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-border/10 pb-1.5 mb-1">
            {t('additionalEquipment') || 'DOPLNKOVÁ VÝBAVA'}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('heatPump') || 'Tepelné čerpadlo'}</span>
            <span className="font-semibold text-foreground">
              {tepelneCerpadlo === "ano" ? `áno${getFormatCena('tepelne_cerpadlo')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('recuperationPrep') || 'Príprava na rekuperáciu'}</span>
            <span className="font-semibold text-foreground">
              {pripravaNaRekuperaciu ? `áno${getFormatCena('pripravaNaRekuperaciu')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('recuperation') || 'Rekuperácia'}</span>
            <span className="font-semibold text-foreground">
              {rekuperacia === "ano" ? `áno${getFormatCena('rekuperacia')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('floorHeating') || 'Podlahové kúrenie'}</span>
            <span className="font-semibold text-foreground">
              {podlahovoKurenie ? `áno${getFormatCena('podlahove_kurenie')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('airConditioningPrep') || 'Príprava na klimatizáciu'}</span>
            <span className="font-semibold text-foreground">
              {klimatizacia ? `áno${getFormatCena('klimatizacia')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('fireplacePrep') || 'Príprava na krb'}</span>
            <span className="font-semibold text-foreground">
              {pripravaNaKrb ? `áno${getFormatCena('pripravaKrb')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('stoveProtection') || 'Ochrana (Kachle)'}</span>
            <span className="font-semibold text-foreground">
              {ochranaKachle ? `áno${getFormatCena('ochranaKachle')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('gutters') || 'Odkvapy'}</span>
            <span className="font-semibold text-foreground">
              {odkvapy === "ano" ? `áno${getFormatCena('odkvapy')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('lightningRod') || 'Bleskozvod'}</span>
            <span className="font-semibold text-foreground">
              {bleskozvod ? `áno${getFormatCena('bleskozvod')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('surgeProtection') || 'Prepäťová ochrana'}</span>
            <span className="font-semibold text-foreground">
              {prepat ? `áno${getFormatCena('prepat')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('solarPanelsPrep') || 'Príprava na solárne panely'}</span>
            <span className="font-semibold text-foreground">
              {pripravaNaSolarnePanely ? `áno${getFormatCena('pripravaNaSolarnePanely')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('bathtub') || 'Vaňa'}</span>
            <span className="font-semibold text-foreground">
              {vana ? `áno${getFormatCena('vana')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('cabinet') || 'Skrinka s umývadlom'}</span>
            <span className="font-semibold text-foreground">
              {skrinka ? `áno${getFormatCena('skrinka')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('engineering') || 'Inžiniering'}</span>
            <span className="font-semibold text-foreground">
              {inziniering ? `áno${getFormatCena('inziniering')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('projectCertification') || 'Projekt a certifikácia'}</span>
            <span className="font-semibold text-foreground">
              {projektACertifikacia ? `áno${getFormatCena('projektACertifikacia')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('revisionDocs') || 'Revízia'}</span>
            <span className="font-semibold text-foreground">
              {revizia ? `áno${getFormatCena('revizia')}` : "nie"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('assembly') || 'Montáž domu'}</span>
            <span className="font-semibold text-foreground">
              {montaz ? `áno${getFormatCena('montaz')}` : "nie"}
            </span>
          </div>

          {dom?.doprava_viditelna !== false && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('transport') || 'Doprava'}</span>
              <span className="font-semibold text-foreground">
                {doprava ? `áno${getFormatCena('doprava')}` : "nie"}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('sellPreviousProperty') || 'Predaj predošlej nehnuteľnosti'}</span>
            <span className="font-semibold text-foreground">
              {predajNehnutelnosti ? "áno" : "nie"}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('wantLandForHouse') || 'Chcem pozemok pod svoj dom'}</span>
            <span className="font-semibold text-foreground">
              {hladamPozemok ? "áno" : "nie"}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('financialServicesLoans') || 'Finančné služby'}</span>
            <span className="font-semibold text-foreground">
              {financneSluzby ? "áno" : "nie"}
            </span>
          </div>
        </div>
      </div>

      {/* Total Price */}
      <div className="border-t border-border bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-sm text-blue-100 mb-1">{t('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
        <p className="text-3xl font-black text-white">{formatPrice(displayPrice)}</p>
        <div className="mt-3">
          <Button 
            onClick={() => setShowModal(true)} 
            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg py-6 text-sm"
          >
            <Send className="w-5 h-5 mr-2" />
            {t('sendQuoteAndShowHouse') || 'Pošli mi cenovú ponuku a ukáž môj dom'}
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
        vchodoveDvere={vchodoveDvere}
        obkladStien={obkladStien}
        interieroveDvere={interieroveDvere}
        elektro={elektro}
        bleskozvod={bleskozvod}
        prepat={prepat}
        pripravaNaSolarnePanely={pripravaNaSolarnePanely}
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
        predajNehnutelnosti={predajNehnutelnosti}
        chcemPozemok={hladamPozemok}
        financneSluzby={financneSluzby}
        totalPrice={displayPrice}
      />
    </Card>
  );
}