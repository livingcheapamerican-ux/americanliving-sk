import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

// Exportovaný Summary Panel pre použitie v LyonKonfiguratorWrapper
export function LyonSummaryPanel({ 
  ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu, 
  tepelneCerpadlo, rekuperacia, podlahovoKurenie, pripravaNaKrb, ochranaKachle,
  fasada, strecha, odkvapy, okna, vchodoveDvere, obkladStien, interieroveDvere,
  elektro, bleskozvod, prepat, sprchovyKut, vana, bateria, skrinka, stropKupelna,
  inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava,
  totalPrice, formatPrice, onSubmit, t
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Home className="w-5 h-5" />
            {t?.('yourConfig') || 'Vaša konfigurácia'}
          </h3>
          <p className="text-xs text-blue-100 mt-1">Lyon 50m²</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-200px)]">
        {/* Účel */}
        {ucel && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('purposeOfBuilding') || 'ÚČEL STAVBY'}</p>
            <p className="text-sm font-bold text-white">
              {ucel === "chata" ? (t?.('recreationalBuilding') || "Rekreačná stavba") : (t?.('familyHouseA0') || "Rodinný dom A0")}
            </p>
          </div>
        )}

        {/* Izolácia */}
        {(izolaciaStien !== "150mm" || izolaciaPodlahy !== "150mm" || izolaciaStropu !== "150mm") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('insulation') || 'IZOLÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {izolaciaStien !== "150mm" && <p className="text-slate-300">• {t?.('walls') || 'Steny'} {izolaciaStien}</p>}
              {izolaciaPodlahy !== "150mm" && <p className="text-slate-300">• {t?.('floors') || 'Podlaha'} {izolaciaPodlahy}</p>}
              {izolaciaStropu !== "150mm" && <p className="text-slate-300">• {t?.('roof') || 'Strop'} {izolaciaStropu}</p>}
            </div>
          </div>
        )}

        {/* Vykurovanie */}
        {(tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('heating') || 'VYKUROVANIE'}</p>
            <div className="space-y-1 text-xs">
              {tepelneCerpadlo === "ano" && <p className="text-slate-300">• {t?.('heatPump') || 'Tepelné čerpadlo'}</p>}
              {rekuperacia === "ano" && <p className="text-slate-300">• {t?.('recuperation') || 'Rekuperácia'}</p>}
              {podlahovoKurenie && <p className="text-slate-300">• {t?.('floorHeating') || 'Podlahové kúrenie'}</p>}
              {pripravaNaKrb && <p className="text-slate-300">• Príprava na krb</p>}
              {ochranaKachle && <p className="text-slate-300">• Ochrana na kachle</p>}
            </div>
          </div>
        )}

        {/* Fasáda */}
        {fasada !== "drevo_smrek" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('facadeSection') || 'FASÁDA'}</p>
            <p className="text-sm text-slate-300">
              {fasada === "omietka" ? "Šúchaná omietka" : 
               fasada === "smrekovec" ? "Smrekovec" :
               fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
            </p>
          </div>
        )}

        {/* Strecha */}
        {(strecha !== "korugovan_plech" || odkvapy === "ano") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('roofSection') || 'STRECHA'}</p>
            <div className="space-y-1 text-xs">
              {strecha !== "korugovan_plech" && <p className="text-slate-300">• Falcované panely</p>}
              {odkvapy === "ano" && <p className="text-slate-300">• Odkvapy</p>}
            </div>
          </div>
        )}

        {/* Okná a dvere */}
        {(okna !== "biele" || vchodoveDvere !== "plastove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('windowsDoorsSection') || 'OKNÁ A DVERE'}</p>
            <div className="space-y-1 text-xs">
              {okna !== "biele" && <p className="text-slate-300">• Okná {okna === "antracit" ? "antracit" : "hnedé"}</p>}
              {vchodoveDvere !== "plastove" && <p className="text-slate-300">• Kovové dvere</p>}
            </div>
          </div>
        )}

        {/* Interiér */}
        {(obkladStien !== "smrek_8cm" || interieroveDvere !== "kridlove") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('interiorSection') || 'INTERIÉR'}</p>
            <div className="space-y-1 text-xs">
              {obkladStien !== "smrek_8cm" && (
                <p className="text-slate-300">
                  • {obkladStien === "smrek_bez_uzlov" ? "Smrek bez uzlov" :
                     obkladStien === "sadrokarton_tapeta" ? "Sadrokarton + tapeta" : "OSB panel"}
                </p>
              )}
              {interieroveDvere !== "kridlove" && <p className="text-slate-300">• Posuvné dvere</p>}
            </div>
          </div>
        )}

        {/* Elektro */}
        {(elektro !== "eu" || bleskozvod || prepat) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('electricalSection') || 'ELEKTROINŠTALÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {elektro === "cz" && <p className="text-slate-300">• CZ/SK štandard</p>}
              {elektro === "ge" && <p className="text-slate-300 flex items-center gap-1">• GE štandard <span className="text-green-400">⚡A0</span></p>}
              {bleskozvod && <p className="text-slate-300 flex items-center gap-1">• Bleskozvod <span className="text-green-400">⚡A0</span></p>}
              {prepat && <p className="text-slate-300 flex items-center gap-1">• Prepäťová ochrana <span className="text-green-400">⚡A0</span></p>}
            </div>
          </div>
        )}

        {/* Kúpeľňa */}
        {(sprchovyKut !== "standard" || bateria !== "standard" || vana || skrinka || stropKupelna !== "drevo") && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('bathroomSection') || 'KÚPEĽŇA'}</p>
            <div className="space-y-1 text-xs">
              {sprchovyKut !== "standard" && <p className="text-slate-300">• Sprcha Radaway</p>}
              {bateria !== "standard" && <p className="text-slate-300">• Batéria Grohe</p>}
              {stropKupelna !== "drevo" && <p className="text-slate-300">• Sadrokartónový strop</p>}
              {vana && <p className="text-slate-300">• Vaňa</p>}
              {skrinka && <p className="text-slate-300">• Skrinka</p>}
            </div>
          </div>
        )}

        {/* Základy */}
        {zaklady !== "bez" && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-1">{t?.('foundationsSection') || 'ZÁKLADY'}</p>
            <p className="text-sm text-slate-300">
              {zaklady === "vruty" ? "Zemné vruty" :
               zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}
            </p>
          </div>
        )}

        {/* Služby */}
        {(inziniering || projektACertifikacia || revizia) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('servicesSection') || 'SLUŽBY'}</p>
            <div className="space-y-1 text-xs">
              {inziniering && <p className="text-slate-300 flex items-center gap-1">• Inžiniering <span className="text-green-400">⚡A0</span></p>}
              {projektACertifikacia && <p className="text-slate-300 flex items-center gap-1">• Projekt + Certifikácia <span className="text-green-400">⚡A0</span></p>}
              {revizia && <p className="text-slate-300">• Revízna dokumentácia</p>}
            </div>
          </div>
        )}

        {/* Realizácia */}
        {(montaz || doprava) && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">{t?.('realizationSection') || 'REALIZÁCIA'}</p>
            <div className="space-y-1 text-xs">
              {montaz && <p className="text-slate-300">• {t?.('assembly') || 'Montáž domu'}</p>}
              {doprava && <p className="text-slate-300">• {t?.('transport') || 'Doprava modulov'}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Total Price */}
      <div className="border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <p className="text-xs text-blue-100 mb-1">{t?.('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
        <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
        <div className="mt-3">
          <Button onClick={onSubmit} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg">
            <Send className="w-4 h-4 mr-2" />
            {t?.('sendInquiry') || 'Odoslať dopyt'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

const Tile = ({ selected, onClick, title, subtitle, price, isPriced, isA0, isIncluded, hideIncludedMessage, t }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative p-2 rounded-md cursor-pointer transition-all border ${
        selected 
          ? isA0 
            ? "bg-green-100 border-green-500 shadow-md" 
            : "bg-blue-100 border-blue-500 shadow-md"
          : isA0
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : isIncluded
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] px-1 py-0 z-10">
          ⚡A0
        </Badge>
      )}
      
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <span className="font-semibold text-gray-800 text-base block leading-tight">{title}</span>
        {subtitle && <span className="text-xs text-gray-500 block mt-0.5">{subtitle}</span>}
        {price === "0 €" && !hideIncludedMessage ? (
          <span className="text-[11px] text-gray-500 block mt-1 italic leading-tight">
            {t?.('itemIncludedInBase') || 'Táto položka je súčasťou základnej konfigurácie domu'}
          </span>
        ) : (
          <span className={`text-[13px] font-bold block mt-1 ${isPriced ? "text-green-600" : "text-gray-400"}`}>
            {price}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default function KonfiguratorLyon(props = {}) {
  const BASE_PRICE = 73431;
  const { language, t } = useLanguage();
  
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
  
  // State
  const [ucel, setUcel] = useState(props.ucel || "chata");
  const [kolaudacia, setKolaudacia] = useState("bez_a0");
  const [izolaciaStien, setIzolaciaStien] = useState(props.izolaciaStien || "150mm");
  const [izolaciaPodlahy, setIzolaciaPodlahy] = useState(props.izolaciaPodlahy || "150mm");
  const [izolaciaStropu, setIzolaciaStropu] = useState(props.izolaciaStropu || "150mm");
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(props.tepelneCerpadlo || "nie");
  const [rekuperacia, setRekuperacia] = useState(props.rekuperacia || "nie");
  const [pripravaNaRekuperaciu, setPripravaNaRekuperaciu] = useState(props.pripravaNaRekuperaciu || false);
  const [podlahovoKurenie, setPodlahovoKurenie] = useState(props.podlahovoKurenie || false);
  const [klimatizacia, setKlimatizacia] = useState(props.klimatizacia || false);
  const [pripravaNaKrb, setPripravaNaKrb] = useState(props.pripravaNaKrb || false);
  const [ochranaKachle, setOchranaKachle] = useState(props.ochranaKachle || false);
  const [pripravaNaSolarnePanely, setPripravaNaSolarnePanely] = useState(props.pripravaNaSolarnePanely || false);
  const [fasada, setFasada] = useState(props.fasada || "drevo_smrek");
  const [strecha, setStrecha] = useState(props.strecha || "korugovan_plech");
  const [odkvapy, setOdkvapy] = useState(props.odkvapy || "nie");
  const [okna, setOkna] = useState(props.okna || "biele");
  const [vchodoveDvere, setVchodoveDvere] = useState(props.vchodoveDvere || "plastove");
  const [obkladStien, setObkladStien] = useState(props.obkladStien || "smrek_8cm");
  const [podlaha, setPodlaha] = useState(props.podlaha || "laminat");
  const [interieroveDvere, setInterieroveDvere] = useState(props.interieroveDvere || "kridlove");
  const [elektro, setElektro] = useState(props.elektro || "eu");
  const [bleskozvod, setBleskozvod] = useState(props.bleskozvod || false);
  const [prepat, setPrepat] = useState(props.prepat || false);
  const [sprchovyKut, setSprchovyKut] = useState(props.sprchovyKut || "standard");
  const [vana, setVana] = useState(props.vana || false);
  const [bateria, setBateria] = useState(props.bateria || "standard");
  const [skrinka, setSkrinka] = useState(props.skrinka || false);
  const [stropKupelna, setStropKupelna] = useState(props.stropKupelna || "drevo");
  const [inziniering, setInziniering] = useState(props.inziniering || false);
  const [projektACertifikacia, setProjektACertifikacia] = useState(props.projektACertifikacia || false);
  const [revizia, setRevizia] = useState(props.revizia !== undefined ? props.revizia : true);
  const [zaklady, setZaklady] = useState(props.zaklady || "bez");
  const [montaz, setMontaz] = useState(props.montaz || false);
  const [doprava, setDoprava] = useState(props.doprava || false);

  // Synchronizovať state s props ak sa props zmenia
  React.useEffect(() => {
    if (props.setUcel) props.setUcel(ucel);
  }, [ucel]);
  React.useEffect(() => {
    if (props.setIzolaciaStien) props.setIzolaciaStien(izolaciaStien);
  }, [izolaciaStien]);
  React.useEffect(() => {
    if (props.setIzolaciaPodlahy) props.setIzolaciaPodlahy(izolaciaPodlahy);
  }, [izolaciaPodlahy]);
  React.useEffect(() => {
    if (props.setIzolaciaStropu) props.setIzolaciaStropu(izolaciaStropu);
  }, [izolaciaStropu]);
  React.useEffect(() => {
    if (props.setTepelneCerpadlo) props.setTepelneCerpadlo(tepelneCerpadlo);
  }, [tepelneCerpadlo]);
  React.useEffect(() => {
    if (props.setRekuperacia) props.setRekuperacia(rekuperacia);
  }, [rekuperacia]);
  React.useEffect(() => {
    if (props.setPripravaNaRekuperaciu) props.setPripravaNaRekuperaciu(pripravaNaRekuperaciu);
  }, [pripravaNaRekuperaciu]);
  React.useEffect(() => {
    if (props.setPodlahovoKurenie) props.setPodlahovoKurenie(podlahovoKurenie);
  }, [podlahovoKurenie]);
  React.useEffect(() => {
    if (props.setKlimatizacia) props.setKlimatizacia(klimatizacia);
  }, [klimatizacia]);
  React.useEffect(() => {
    if (props.setPripravaNaKrb) props.setPripravaNaKrb(pripravaNaKrb);
  }, [pripravaNaKrb]);
  React.useEffect(() => {
    if (props.setPripravaNaSolarnePanely) props.setPripravaNaSolarnePanely(pripravaNaSolarnePanely);
  }, [pripravaNaSolarnePanely]);
  React.useEffect(() => {
    if (props.setOchranaKachle) props.setOchranaKachle(ochranaKachle);
  }, [ochranaKachle]);
  React.useEffect(() => {
    if (props.setFasada) props.setFasada(fasada);
  }, [fasada]);
  React.useEffect(() => {
    if (props.setStrecha) props.setStrecha(strecha);
  }, [strecha]);
  React.useEffect(() => {
    if (props.setOdkvapy) props.setOdkvapy(odkvapy);
  }, [odkvapy]);
  React.useEffect(() => {
    if (props.setOkna) props.setOkna(okna);
  }, [okna]);
  React.useEffect(() => {
    if (props.setVchodoveDvere) props.setVchodoveDvere(vchodoveDvere);
  }, [vchodoveDvere]);
  React.useEffect(() => {
    if (props.setObkladStien) props.setObkladStien(obkladStien);
  }, [obkladStien]);
  React.useEffect(() => {
    if (props.setPodlaha) props.setPodlaha(podlaha);
  }, [podlaha]);
  React.useEffect(() => {
    if (props.setInterieroveDvere) props.setInterieroveDvere(interieroveDvere);
  }, [interieroveDvere]);
  React.useEffect(() => {
    if (props.setElektro) props.setElektro(elektro);
  }, [elektro]);
  React.useEffect(() => {
    if (props.setBleskozvod) props.setBleskozvod(bleskozvod);
  }, [bleskozvod]);
  React.useEffect(() => {
    if (props.setPrepat) props.setPrepat(prepat);
  }, [prepat]);
  React.useEffect(() => {
    if (props.setSprchovyKut) props.setSprchovyKut(sprchovyKut);
  }, [sprchovyKut]);
  React.useEffect(() => {
    if (props.setVana) props.setVana(vana);
  }, [vana]);
  React.useEffect(() => {
    if (props.setBateria) props.setBateria(bateria);
  }, [bateria]);
  React.useEffect(() => {
    if (props.setSkrinka) props.setSkrinka(skrinka);
  }, [skrinka]);
  React.useEffect(() => {
    if (props.setStropKupelna) props.setStropKupelna(stropKupelna);
  }, [stropKupelna]);
  React.useEffect(() => {
    if (props.setInziniering) props.setInziniering(inziniering);
  }, [inziniering]);
  React.useEffect(() => {
    if (props.setProjektACertifikacia) props.setProjektACertifikacia(projektACertifikacia);
  }, [projektACertifikacia]);
  React.useEffect(() => {
    if (props.setRevizia) props.setRevizia(revizia);
  }, [revizia]);
  React.useEffect(() => {
    if (props.setZaklady) props.setZaklady(zaklady);
  }, [zaklady]);
  React.useEffect(() => {
    if (props.setMontaz) props.setMontaz(montaz);
  }, [montaz]);
  React.useEffect(() => {
    if (props.setDoprava) props.setDoprava(doprava);
  }, [doprava]);

  const CENY = props.CENY || {
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

  const formatTilePrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num) || num === 0) return '0 €';
    return `+ ${num.toLocaleString('sk-SK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
  };

  const totalPrice = useMemo(() => {
    if (props.totalPrice !== undefined) return props.totalPrice;
    let total = BASE_PRICE;
    if (izolaciaStien === "200mm") total += CENY.izolacia_stien_200mm || 0;
    if (izolaciaStien === "250mm") total += CENY.izolacia_stien_250mm || 0;
    if (izolaciaPodlahy === "200mm") total += CENY.izolacia_podlahy_200mm || 0;
    if (izolaciaStropu === "200mm") total += CENY.izolacia_stropu_200mm || 0;
    if (tepelneCerpadlo === "ano") total += CENY.tepelne_cerpadlo || 0;
    if (pripravaNaRekuperaciu) total += CENY.pripravaNaRekuperaciu || 0;
    if (rekuperacia === "ano") total += CENY.rekuperacia || 0;
    if (podlahovoKurenie) total += CENY.podlahove_kurenie || 0;
    if (klimatizacia) total += CENY.klimatizacia || 0;
    if (pripravaNaKrb) total += CENY.pripravaKrb || 0;
    if (ochranaKachle) total += CENY.ochranaKachle || 0;
    if (fasada === "omietka") total += CENY.fasada_omietka || 0;
    if (fasada === "smrekovec") total += CENY.fasada_smrekovec || 0;
    if (fasada === "falcovane") total += CENY.fasada_falcovane || 0;
    if (fasada === "thermowood") total += CENY.fasada_thermowood || 0;
    if (strecha === "falcovane") total += CENY.strecha_falcovane || 0;
    if (odkvapy === "ano") total += CENY.odkvapy || 0;
    if (vchodoveDvere === "kovove") total += CENY.dvere_kovove || 0;
    if (obkladStien === "smrek_bez_uzlov") total += CENY.obklad_smrek_bez_uzlov || 0;
    if (obkladStien === "sadrokarton_tapeta") total += CENY.obklad_sadrokarton_tapeta || 0;
    if (obkladStien === "osb_panel") total += CENY.obklad_osb_panel || 0;
    if (interieroveDvere === "posuvne") total += CENY.dvere_posuvne || 0;
    if (elektro === "cz") total += CENY.elektro_cz || 0;
    if (elektro === "ge") total += CENY.elektro_ge || 0;
    if (bleskozvod) total += CENY.bleskozvod || 0;
    if (prepat) total += CENY.prepat || 0;
    if (pripravaNaSolarnePanely) total += CENY.pripravaNaSolarnePanely || 0;
    if (sprchovyKut === "radaway") total += CENY.sprchovyKut || 0;
    if (vana) total += CENY.vana || 0;
    if (bateria === "grohe") total += CENY.bateria || 0;
    if (skrinka) total += CENY.skrinka || 0;
    if (stropKupelna === "sadrokarton") total += CENY.strop_kupelna_sadrokarton || 0;
    if (inziniering) total += CENY.inziniering || 0;
    if (projektACertifikacia) total += CENY.projektACertifikacia || 0;
    if (revizia) total += CENY.revizia || 0;
    if (zaklady === "vruty") total += CENY.zaklady_vruty || 0;
    if (zaklady === "patky") total += CENY.zaklady_patky || 0;
    if (zaklady === "pasove") total += CENY.zaklady_pasove || 0;
    if (montaz) total += CENY.montaz || 0;
    if (doprava) total += CENY.doprava || 0;
    return total;
  }, [props.totalPrice, CENY, izolaciaStien, izolaciaPodlahy, izolaciaStropu, tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
      podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia, fasada, strecha, odkvapy, vchodoveDvere,
      obkladStien, interieroveDvere, elektro, bleskozvod, prepat, pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
      skrinka, stropKupelna, inziniering, projektACertifikacia, revizia, zaklady, montaz, doprava]);

  const formatPrice = props.formatPrice || ((price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €");

  return (
    <div className="w-full">
      {/* Účel stavby - kompaktnejší */}
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
              setPripravaNaRekuperaciu(true);
              setRekuperacia("ano");
              setInziniering(true);
              setProjektACertifikacia(true);
              setBleskozvod(true);
              setPrepat(true);
              setElektro("ge");
              setKlimatizacia(true);
              // Zobrazíme upozornenie o A0 požiadavkách
              const alertMsg = getTranslatedText('ucel_rodinny_alert', 'dlhy_popis') || 
                "✅ Automaticky boli vybrané povinné A0 položky bez ktorých sa dom nedá skolaudovať ako rodinný dom:\n\n• Izolácia 250/200/200mm\n• Tepelné čerpadlo\n• Rekuperácia\n• GE elektroinštalácia\n• Bleskozvod\n• Prepäťová ochrana\n• Inžiniering\n• Projekt + Certifikácia A0";
              setTimeout(() => {
                alert(alertMsg);
              }, 100);
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

      {/* Kolaudácia */}
      {ucel === "rodinny" && (
        <Card className="p-2 mb-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300">
          <h3 className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-green-600" />
            {t('approval') || 'Kolaudácia'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
          <Tile selected={kolaudacia === "bez_a0"} onClick={() => {
            setKolaudacia("bez_a0");
            setInziniering(false);
            setProjektACertifikacia(false);
          }} title={t('withoutA0Approval') || "Bez kolaudácie A0"} subtitle={t('withoutAdmin') || "Bez admin."} price="0 €" isPriced={false} t={t} />
          <Tile selected={kolaudacia === "s_a0"} onClick={() => {
            setKolaudacia("s_a0");
            setInziniering(true);
            setProjektACertifikacia(true);
            setBleskozvod(true);
            setPrepat(true);
            setElektro("ge");
          }} title={t('withA0Approval')} subtitle={t('adminProcess')} price="0 €" isPriced={false} isA0={true} t={t} />
          </div>
        </Card>
      )}



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
                <Tile selected={izolaciaStien === "150mm"} onClick={() => setIzolaciaStien("150mm")} 
                  title={getTranslatedText('izolacia_stien_150', 'nazov') || t('walls150mm') || 'Steny 150mm'} 
                  subtitle={getTranslatedText('izolacia_stien_150', 'podnadpis') || t('recreational') || 'Rekreačné'} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={izolaciaStien === "200mm"} onClick={() => setIzolaciaStien("200mm")} 
                  title={getTranslatedText('izolacia_stien_200', 'nazov') || t('walls200mm') || 'Steny 200mm'} 
                  subtitle={getTranslatedText('izolacia_stien_200', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.izolacia_stien_200mm)} isPriced={true} t={t} />
                <Tile selected={izolaciaStien === "250mm"} onClick={() => setIzolaciaStien("250mm")} 
                  title={getTranslatedText('izolacia_stien_250', 'nazov') || t('walls250mm') || 'Steny 250mm'} 
                  subtitle={getTranslatedText('izolacia_stien_250', 'podnadpis') || t('premiumA0') || 'Premium A0'} 
                  price={formatTilePrice(CENY.izolacia_stien_250mm)} isPriced={true} isA0={true} t={t} />
              </div>
            </div>

            {/* Podlaha */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('izolacia_podlahy', 'nazov') || t('floorInsulation') || 'Izolácia podlahy:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={izolaciaPodlahy === "150mm"} onClick={() => setIzolaciaPodlahy("150mm")} 
                  title={getTranslatedText('izolacia_podlahy_150', 'nazov') || t('floor150mm') || 'Podlaha 150mm'} 
                  subtitle={getTranslatedText('izolacia_podlahy_150', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={izolaciaPodlahy === "200mm"} onClick={() => setIzolaciaPodlahy("200mm")} 
                  title={getTranslatedText('izolacia_podlahy_200', 'nazov') || t('floor200mm') || 'Podlaha 200mm'} 
                  subtitle={getTranslatedText('izolacia_podlahy_200', 'podnadpis') || t('a0') || 'A0'} 
                  price={formatTilePrice(CENY.izolacia_podlahy_200mm)} isPriced={true} isA0={true} t={t} />
              </div>
            </div>

            {/* Strop */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('izolacia_stropu', 'nazov') || t('ceilingInsulation') || 'Izolácia stropu:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-blue-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={izolaciaStropu === "150mm"} onClick={() => setIzolaciaStropu("150mm")} 
                  title={getTranslatedText('izolacia_stropu_150', 'nazov') || t('ceiling150mm') || 'Strop 150mm'} 
                  subtitle={getTranslatedText('izolacia_stropu_150', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={izolaciaStropu === "200mm"} onClick={() => setIzolaciaStropu("200mm")} 
                  title={getTranslatedText('izolacia_stropu_200', 'nazov') || t('ceiling200mm') || 'Strop 200mm'} 
                  subtitle={getTranslatedText('izolacia_stropu_200', 'podnadpis') || t('a0') || 'A0'} 
                  price={formatTilePrice(CENY.izolacia_stropu_200mm)} isPriced={true} isA0={true} t={t} />
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
                <Tile selected={tepelneCerpadlo === "nie"} onClick={() => setTepelneCerpadlo("nie")} 
                  title={getTranslatedText('tepelne_cerpadlo_nie', 'nazov') || t('heatingPreparation')} 
                  subtitle={getTranslatedText('tepelne_cerpadlo_nie', 'podnadpis') || t('convectors')} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={tepelneCerpadlo === "ano"} onClick={() => setTepelneCerpadlo("ano")} 
                  title={getTranslatedText('tepelne_cerpadlo_ano', 'nazov') || t('heatPump')} 
                  subtitle={getTranslatedText('tepelne_cerpadlo_ano', 'podnadpis') || t('a0Required')} 
                  price={formatTilePrice(CENY.tepelne_cerpadlo)} isPriced={true} isA0={true} t={t} />
              </div>
            </div>

            {/* Rekuperácia */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('rekuperacia', 'nazov') || t('ventilation') || 'Vetranie:'}
              </p>
              <div className="grid grid-cols-3 gap-1.5 border border-orange-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={rekuperacia === "nie" && !pripravaNaRekuperaciu} onClick={() => {setRekuperacia("nie"); setPripravaNaRekuperaciu(false);}} 
                  title={getTranslatedText('rekuperacia_nie', 'nazov') || t('withoutRecuperation')} 
                  subtitle={getTranslatedText('rekuperacia_nie', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} />
                <Tile selected={pripravaNaRekuperaciu} onClick={() => {setPripravaNaRekuperaciu(true); setRekuperacia("nie");}} 
                  title={getTranslatedText('pripravaNaRekuperaciu', 'nazov') || 'Príprava na rekuperáciu'} 
                  subtitle={getTranslatedText('pripravaNaRekuperaciu', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.pripravaNaRekuperaciu)} isPriced={true} isA0={true} t={t} />
                <Tile selected={rekuperacia === "ano"} onClick={() => {setRekuperacia("ano"); setPripravaNaRekuperaciu(false);}} 
                  title={getTranslatedText('rekuperacia_ano', 'nazov') || t('recuperation')} 
                  subtitle={getTranslatedText('rekuperacia_ano', 'podnadpis') || t('a0Required')} 
                  price={formatTilePrice(CENY.rekuperacia)} isPriced={true} isA0={true} t={t} />
              </div>
            </div>

            {/* Doplnky - checkbox */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('vykurovanie_doplnky', 'nazov') || t('heatingExtras') || 'Doplnky:'}
              </p>
              <div className="space-y-1.5">
                <Tile selected={podlahovoKurenie} onClick={() => setPodlahovoKurenie(!podlahovoKurenie)} 
                  title={getTranslatedText('podlahove_kurenie', 'nazov') || t('floorHeating')} 
                  subtitle={getTranslatedText('podlahove_kurenie', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.podlahove_kurenie)} isPriced={true} t={t} />
                <Tile selected={pripravaNaKrb} onClick={() => setPripravaNaKrb(!pripravaNaKrb)} 
                  title={getTranslatedText('pripravaKrb', 'nazov') || t('fireplacePrep')} 
                  subtitle={getTranslatedText('pripravaKrb', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.pripravaKrb)} isPriced={true} t={t} />
                <Tile selected={ochranaKachle} onClick={() => setOchranaKachle(!ochranaKachle)} 
                  title={getTranslatedText('ochranaKachle', 'nazov') || t('stoveProtection')} 
                  subtitle={getTranslatedText('ochranaKachle', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.ochranaKachle)} isPriced={true} t={t} />
                <Tile selected={klimatizacia} onClick={() => setKlimatizacia(!klimatizacia)} 
                  title={getTranslatedText('klimatizacia', 'nazov') || 'Príprava na klimatizáciu'} 
                  subtitle={getTranslatedText('klimatizacia', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.klimatizacia)} isPriced={CENY.klimatizacia > 0} isA0={true} t={t} />
              </div>
            </div>
          </div>
        </Card>

        </div>

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
              <Tile selected={fasada === "drevo_smrek"} onClick={() => setFasada("drevo_smrek")} 
                title={getTranslatedText('fasada_drevo_smrek', 'nazov') || t('spruceWood')} 
                subtitle={getTranslatedText('fasada_drevo_smrek', 'podnadpis') || t('darkLight')} 
                price="0 €" isPriced={false} isIncluded={true} t={t} />
              <Tile selected={fasada === "omietka"} onClick={() => setFasada("omietka")} 
                title={getTranslatedText('fasada_omietka', 'nazov') || t('scratchedPlaster')} 
                subtitle={getTranslatedText('fasada_omietka', 'podnadpis') || 'Baumit'} 
                price={formatTilePrice(CENY.fasada_omietka)} isPriced={true} t={t} />
              <Tile selected={fasada === "smrekovec"} onClick={() => setFasada("smrekovec")} 
                title={getTranslatedText('fasada_smrekovec', 'nazov') || t('larch')} 
                subtitle={getTranslatedText('fasada_smrekovec', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.fasada_smrekovec)} isPriced={true} t={t} />
              <Tile selected={fasada === "falcovane"} onClick={() => setFasada("falcovane")} 
                title={getTranslatedText('fasada_falcovane', 'nazov') || t('foldedPanels')} 
                subtitle={getTranslatedText('fasada_falcovane', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.fasada_falcovane)} isPriced={true} t={t} />
              <Tile selected={fasada === "thermowood"} onClick={() => setFasada("thermowood")} 
                title={getTranslatedText('fasada_thermowood', 'nazov') || 'Thermowood'} 
                subtitle={getTranslatedText('fasada_thermowood', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.fasada_thermowood)} isPriced={true} t={t} />
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
                <Tile selected={strecha === "korugovan_plech"} onClick={() => setStrecha("korugovan_plech")} 
                  title={getTranslatedText('strecha_korugovan', 'nazov') || t('corrugatedMetal')} 
                  subtitle={getTranslatedText('strecha_korugovan', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={strecha === "falcovane"} onClick={() => setStrecha("falcovane")} 
                  title={getTranslatedText('strecha_falcovane', 'nazov') || t('foldedPanels')} 
                  subtitle={getTranslatedText('strecha_falcovane', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.strecha_falcovane)} isPriced={true} t={t} />
              </div>
            </div>

            {/* Odkvapy */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('odkvapy', 'nazov') || t('gutters') || 'Odkvapy:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-indigo-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={odkvapy === "nie"} onClick={() => setOdkvapy("nie")} 
                  title={getTranslatedText('odkvapy_nie', 'nazov') || t('withoutGutters')} 
                  subtitle={getTranslatedText('odkvapy_nie', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} />
                <Tile selected={odkvapy === "ano"} onClick={() => setOdkvapy("ano")} 
                  title={getTranslatedText('odkvapy_ano', 'nazov') || t('gutters')} 
                  subtitle={getTranslatedText('odkvapy_ano', 'podnadpis') || t('roofColor')} 
                  price={formatTilePrice(CENY.odkvapy)} isPriced={true} t={t} />
              </div>
            </div>
          </div>
        </Card>

        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-3">
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
                <Tile selected={okna === "biele"} onClick={() => setOkna("biele")} 
                  title={getTranslatedText('okna_biele', 'nazov') || t('white')} 
                  subtitle={getTranslatedText('okna_biele', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={okna === "antracit"} onClick={() => setOkna("antracit")} 
                  title={getTranslatedText('okna_antracit', 'nazov') || t('anthracite')} 
                  subtitle={getTranslatedText('okna_antracit', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={okna === "hnede"} onClick={() => setOkna("hnede")} 
                  title={getTranslatedText('okna_hnede', 'nazov') || t('brown')} 
                  subtitle={getTranslatedText('okna_hnede', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
              </div>
            </div>

            {/* Vchodové dvere */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('vchodove_dvere', 'nazov') || t('entryDoors') || 'Vchodové dvere:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-cyan-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={vchodoveDvere === "plastove"} onClick={() => setVchodoveDvere("plastove")} 
                  title={getTranslatedText('dvere_plastove', 'nazov') || t('metalPlasticDoors')} 
                  subtitle={getTranslatedText('dvere_plastove', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={vchodoveDvere === "kovove"} onClick={() => setVchodoveDvere("kovove")} 
                  title={getTranslatedText('dvere_kovove', 'nazov') || t('metalDoors')} 
                  subtitle={getTranslatedText('dvere_kovove', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.dvere_kovove)} isPriced={true} t={t} />
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
                <Tile selected={obkladStien === "smrek_8cm"} onClick={() => setObkladStien("smrek_8cm")} 
                  title={getTranslatedText('obklad_smrek_8cm', 'nazov') || t('spruceWall8cm')} 
                  subtitle={getTranslatedText('obklad_smrek_8cm', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={obkladStien === "smrek_bez_uzlov"} onClick={() => setObkladStien("smrek_bez_uzlov")} 
                  title={getTranslatedText('obklad_smrek_bez_uzlov', 'nazov') || t('spruceWallNoKnots')} 
                  subtitle={getTranslatedText('obklad_smrek_bez_uzlov', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} t={t} />
                <Tile selected={obkladStien === "sadrokarton_tapeta"} onClick={() => setObkladStien("sadrokarton_tapeta")} 
                  title={getTranslatedText('obklad_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} 
                  subtitle={getTranslatedText('obklad_sadrokarton', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.obklad_sadrokarton_tapeta)} isPriced={true} t={t} />
                <Tile selected={obkladStien === "osb_panel"} onClick={() => setObkladStien("osb_panel")} 
                  title={getTranslatedText('obklad_osb', 'nazov') || t('osbLaminatePanel')} 
                  subtitle={getTranslatedText('obklad_osb', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.obklad_osb_panel)} isPriced={true} t={t} />
              </div>
            </div>

            {/* Podlaha - len jedna možnosť */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('podlaha', 'nazov') || t('floorType') || 'Podlaha:'}
              </p>
              <div className="border border-amber-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={podlaha === "laminat"} onClick={() => setPodlaha("laminat")} 
                  title={getTranslatedText('podlaha_laminat', 'nazov') || t('laminate')} 
                  subtitle={getTranslatedText('podlaha_laminat', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
              </div>
            </div>

            {/* Interiérové dvere */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('interierove_dvere', 'nazov') || t('interiorDoorsType') || 'Interiérové dvere:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-amber-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={interieroveDvere === "kridlove"} onClick={() => setInterieroveDvere("kridlove")} 
                  title={getTranslatedText('dvere_kridlove', 'nazov') || t('hingedDoors')} 
                  subtitle={getTranslatedText('dvere_kridlove', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={interieroveDvere === "posuvne"} onClick={() => setInterieroveDvere("posuvne")} 
                  title={getTranslatedText('dvere_posuvne', 'nazov') || t('slidingDoors')} 
                  subtitle={getTranslatedText('dvere_posuvne', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.dvere_posuvne)} isPriced={true} t={t} />
              </div>
            </div>
          </div>
        </Card>

        </div>

        <div className="grid lg:grid-cols-2 gap-3 mb-3">
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
                <Tile selected={elektro === "eu"} onClick={() => setElektro("eu")} 
                  title={getTranslatedText('elektro_eu', 'nazov') || t('euStandard')} 
                  subtitle={getTranslatedText('elektro_eu', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={elektro === "cz"} onClick={() => setElektro("cz")} 
                  title={getTranslatedText('elektro_cz', 'nazov') || t('czSkStandard')} 
                  subtitle={getTranslatedText('elektro_cz', 'podnadpis') || t('socketsExtraFuses')} 
                  price={formatTilePrice(CENY.elektro_cz)} isPriced={true} t={t} />
                <Tile selected={elektro === "ge"} onClick={() => setElektro("ge")} 
                  title={getTranslatedText('elektro_ge', 'nazov') || t('geStandard')} 
                  subtitle={getTranslatedText('elektro_ge', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.elektro_ge)} isPriced={true} isA0={true} t={t} />
              </div>
            </div>

            {/* Doplnky */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                {getTranslatedText('elektro_doplnky', 'nazov') || (t('heatingExtras') + ' (' + t('selectMultiple') + ')') || 'Doplnky (môžeš vybrať viac):'}
              </p>
              <div className="space-y-2">
                <Tile selected={bleskozvod} onClick={() => setBleskozvod(!bleskozvod)} 
                  title={getTranslatedText('bleskozvod', 'nazov') || t('lightningRod')} 
                  subtitle={getTranslatedText('bleskozvod', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.bleskozvod)} isPriced={true} isA0={true} t={t} />
                <Tile selected={prepat} onClick={() => setPrepat(!prepat)} 
                  title={getTranslatedText('prepat', 'nazov') || t('surgeProtection')} 
                  subtitle={getTranslatedText('prepat', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.prepat)} isPriced={true} isA0={true} t={t} />
                <Tile selected={pripravaNaSolarnePanely} onClick={() => setPripravaNaSolarnePanely(!pripravaNaSolarnePanely)} 
                  title={getTranslatedText('pripravaNaSolarnePanely', 'nazov') || 'Príprava na solárne panely'} 
                  subtitle={getTranslatedText('pripravaNaSolarnePanely', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.pripravaNaSolarnePanely)} isPriced={true} t={t} />
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
                <Tile selected={sprchovyKut === "standard"} onClick={() => setSprchovyKut("standard")} 
                  title={getTranslatedText('sprcha_standard', 'nazov') || t('shower')} 
                  subtitle={getTranslatedText('sprcha_standard', 'podnadpis') || 'WC Geberit'} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={sprchovyKut === "radaway"} onClick={() => setSprchovyKut("radaway")} 
                  title={getTranslatedText('sprcha_radaway', 'nazov') || t('showerRadawayTile')} 
                  subtitle={getTranslatedText('sprcha_radaway', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.sprchovyKut)} isPriced={true} t={t} />
              </div>
            </div>

            {/* Batéria */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('bateria', 'nazov') || t('faucet') || 'Batéria:'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={bateria === "standard"} onClick={() => setBateria("standard")} 
                  title={getTranslatedText('bateria_standard', 'nazov') || t('faucetStandard')} 
                  subtitle={getTranslatedText('bateria_standard', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={bateria === "grohe"} onClick={() => setBateria("grohe")} 
                  title={getTranslatedText('bateria_grohe', 'nazov') || 'Grohe'} 
                  subtitle={getTranslatedText('bateria_grohe', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.bateria)} isPriced={true} t={t} />
              </div>
            </div>

            {/* Strop kúpeľňa */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('strop_kupelna', 'nazov') || t('bathroomCeiling') || 'Strop (kúpeľňa):'}
              </p>
              <div className="grid grid-cols-2 gap-1.5 border border-teal-300 rounded-md p-1.5 bg-white/50">
                <Tile selected={stropKupelna === "drevo"} onClick={() => setStropKupelna("drevo")} 
                  title={getTranslatedText('strop_drevo', 'nazov') || t('ceilingWoodPattern')} 
                  subtitle={getTranslatedText('strop_drevo', 'podnadpis') || ''} 
                  price="0 €" isPriced={false} isIncluded={true} t={t} />
                <Tile selected={stropKupelna === "sadrokarton"} onClick={() => setStropKupelna("sadrokarton")} 
                  title={getTranslatedText('strop_sadrokarton', 'nazov') || t('drywallWallpaperPaint')} 
                  subtitle={getTranslatedText('strop_sadrokarton', 'podnadpis') || ''} 
                  price="+ 0 €" isPriced={false} t={t} />
              </div>
            </div>

            {/* Doplnky */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-1">
                {getTranslatedText('kupelna_doplnky', 'nazov') || t('bathExtras') || 'Doplnky:'}
              </p>
              <div className="space-y-1.5">
                <Tile selected={vana} onClick={() => setVana(!vana)} 
                  title={getTranslatedText('vana', 'nazov') || t('bathtub')} 
                  subtitle={getTranslatedText('vana', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.vana)} isPriced={true} t={t} />
                <Tile selected={skrinka} onClick={() => setSkrinka(!skrinka)} 
                  title={getTranslatedText('skrinka', 'nazov') || t('cabinet')} 
                  subtitle={getTranslatedText('skrinka', 'podnadpis') || ''} 
                  price={formatTilePrice(CENY.skrinka)} isPriced={true} t={t} />
              </div>
            </div>
            </div>
            </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-3 mb-3">
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
              <Tile selected={zaklady === "bez"} onClick={() => setZaklady("bez")} 
                title={getTranslatedText('zaklady_bez', 'nazov') || t('noFoundations')} 
                subtitle={getTranslatedText('zaklady_bez', 'podnadpis') || ''} 
                price="0 €" isPriced={false} isIncluded={true} hideIncludedMessage={true} t={t} />
              <Tile selected={zaklady === "vruty"} onClick={() => setZaklady("vruty")} 
                title={getTranslatedText('zaklady_vruty', 'nazov') || t('groundScrews')} 
                subtitle={getTranslatedText('zaklady_vruty', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.zaklady_vruty)} isPriced={true} t={t} />
              <Tile selected={zaklady === "patky"} onClick={() => setZaklady("patky")} 
                title={getTranslatedText('zaklady_patky', 'nazov') || t('concretePads')} 
                subtitle={getTranslatedText('zaklady_patky', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.zaklady_patky)} isPriced={true} t={t} />
              <Tile selected={zaklady === "pasove"} onClick={() => setZaklady("pasove")} 
                title={getTranslatedText('zaklady_pasove', 'nazov') || t('stripFoundations')} 
                subtitle={getTranslatedText('zaklady_pasove', 'podnadpis') || ''} 
                price={formatTilePrice(CENY.zaklady_pasove)} isPriced={true} t={t} />
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
                  <Tile selected={inziniering} onClick={() => setInziniering(!inziniering)} 
                    title={getTranslatedText('inziniering', 'nazov') || t('engineering')} 
                    subtitle={getTranslatedText('inziniering', 'podnadpis') || t('permit')} 
                    price={formatTilePrice(CENY.inziniering)} isPriced={true} isA0={true} t={t} />
                  <Tile selected={projektACertifikacia} onClick={() => setProjektACertifikacia(!projektACertifikacia)} 
                    title={getTranslatedText('projekt_certifikacia', 'nazov') || t('projectCertShort')} 
                    subtitle={getTranslatedText('projekt_certifikacia', 'podnadpis') || 'A0'} 
                    price={formatTilePrice(CENY.projektACertifikacia)} isPriced={true} isA0={true} t={t} />
                  <Tile selected={revizia} onClick={() => setRevizia(!revizia)} 
                    title={getTranslatedText('revizia', 'nazov') || t('revisionDocsShort')} 
                    subtitle={getTranslatedText('revizia', 'podnadpis') || ''} 
                    price={formatTilePrice(CENY.revizia)} isPriced={true} t={t} />
                  </div>
        </Card>

        {/* REALIZÁCIA */}
        <Card className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 shadow-md">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-white text-sm mr-1">11</span>
            🚚 {getTranslatedText('sekcia_realizacia', 'nazov') || t('realizationSection') || 'Realizácia'}
          </h3>
          <div className="space-y-1.5">
            <Tile selected={montaz} onClick={() => setMontaz(!montaz)} 
              title={getTranslatedText('montaz', 'nazov') || t('houseAssembly')} 
              subtitle={getTranslatedText('montaz', 'podnadpis') || ''} 
              price={formatTilePrice(CENY.montaz)} isPriced={true} t={t} />
            <Tile selected={doprava} onClick={() => setDoprava(!doprava)} 
              title={getTranslatedText('doprava', 'nazov') || t('transportTile')} 
              subtitle={getTranslatedText('doprava', 'podnadpis') || t('allModulesTransport')} 
              price={formatTilePrice(CENY.doprava)} isPriced={true} t={t} />
          </div>
        </Card>
      </div>

      {/* Sticky Footer - modernejší (len pre mobil) */}
      <div className="xl:hidden sticky bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3 shadow-2xl z-50 mt-4 rounded-t-2xl border-t-4 border-white/20">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-white/70 mb-0.5">{t('totalPriceWithVAT') || 'Celková cena s DPH'}</p>
            <p className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">
              {formatPrice(totalPrice)}
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