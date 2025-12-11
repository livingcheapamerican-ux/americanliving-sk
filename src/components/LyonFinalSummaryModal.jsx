import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Home, CheckCircle, Send, FileDown, Mail, Sparkles, AlertCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LyonFinalSummaryModal({ 
  isOpen, 
  onClose, 
  dom,
  ucel, 
  izolaciaStien, 
  izolaciaPodlahy, 
  izolaciaStropu, 
  tepelneCerpadlo, 
  rekuperacia, 
  pripravaNaRekuperaciu,
  podlahovoKurenie, 
  pripravaNaKrb, 
  ochranaKachle,
  klimatizacia,
  fasada, 
  strecha, 
  odkvapy, 
  okna, 
  vchodoveDvere, 
  obkladStien, 
  interieroveDvere,
  elektro, 
  bleskozvod, 
  prepat, 
  pripravaNaSolarnePanely,
  sprchovyKut, 
  vana, 
  bateria, 
  skrinka, 
  stropKupelna,
  inziniering, 
  projektACertifikacia, 
  revizia, 
  zaklady, 
  montaz, 
  doprava,
  predajNehnutelnosti,
  chcemPozemok,
  financneSluzby,
  totalPrice
}) {
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    obec: "",
    poznamka: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: nastaveniaCenovejPonuky = [] } = useQuery({
    queryKey: ['nastavenia-cenovej-ponuky'],
    queryFn: () => base44.entities.NastavenieCenovejPonuky.list()
  });

  const aktivneNastavenie = nastaveniaCenovejPonuky.find(n => n.aktivne) || nastaveniaCenovejPonuky[0];

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Cenník
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

  // Určiť ktorý obrázok zobraziť
  const getDisplayImage = () => {
    // Ak je vybraná šuchaná omietka, zobraz hlavný obrázok
    if (fasada === "omietka") {
      return dom?.hlavny_obrazok;
    }
    // Ak je vybraná iná fasáda alebo default drevo smrek, zobraz základnú konfiguráciu
    return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
  };

  // Získať galérie na základe mapovaných pravidiel
  const getMatchedGalleries = () => {
    if (!dom?.galerie) {
      console.log('❌ Dom nemá galérie');
      return [];
    }
    
    console.log('🏠 Dom galérie:', dom.galerie);
    console.log('🎨 Fasada:', fasada);
    console.log('🪵 Obklad stien:', obkladStien);
    
    const matchedGalleries = [];
    
    // Ak nie je nastavenie, použij default logiku
    if (!aktivneNastavenie?.mapovanie_fotiek_ticabhouse || aktivneNastavenie.mapovanie_fotiek_ticabhouse.length === 0) {
      console.log('📋 Používam default pravidlá');
      
      // VŽDY zobraz exteriér
      if (fasada === "omietka") {
        // Ak je šúchaná omietka, zobraz murovka galériu
        const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
        console.log('🧱 Hľadám murovka galériu:', murovkaGaleria);
        if (murovkaGaleria?.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: "Exteriér - Murovka",
            fotky: murovkaGaleria.fotky
          });
        }
      } else {
        // Pre VŠETKY ostatné fasády (drevo_smrek, smrekovec, falcované, thermowood) - vždy drevo/plech galériu
        const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
        console.log('🪵 Hľadám drevo/plech galériu pre fasádu:', fasada, drevoGaleria);
        if (drevoGaleria?.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: "Exteriér - Drevo/Plech",
            fotky: drevoGaleria.fotky
          });
        }
      }
      
      // Default pravidlá pre interiér
      if (obkladStien === "sadrokarton_tapeta") {
        const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
        if (sadroGaleria?.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: "Interiér - Sadrokartón",
            fotky: sadroGaleria.fotky
          });
        }
      } else if (obkladStien === "smrek_8cm" || obkladStien === "smrek_bez_uzlov") {
        const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
        if (drevoGaleria?.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: "Interiér - Drevo",
            fotky: drevoGaleria.fotky
          });
        }
      }
      
      return matchedGalleries;
    }
    
    // Použij nastavené mapovanie
    aktivneNastavenie.mapovanie_fotiek_ticabhouse.forEach(mapping => {
      const isActive = mapping.dlazdice_ids?.some(dlazdicaId => {
        if (dlazdicaId === "fasada_omietka" && fasada === "omietka") return true;
        if (dlazdicaId === "fasada_smrekovec" && fasada === "smrekovec") return true;
        if (dlazdicaId === "fasada_falcovane" && fasada === "falcovane") return true;
        if (dlazdicaId === "fasada_thermowood" && fasada === "thermowood") return true;
        if (dlazdicaId === "obklad_sadrokarton_tapeta" && obkladStien === "sadrokarton_tapeta") return true;
        if (dlazdicaId === "obklad_smrek_bez_uzlov" && (obkladStien === "smrek_bez_uzlov" || obkladStien === "smrek_8cm")) return true;
        return false;
      });
      
      if (isActive) {
        const galeria = dom.galerie?.find(g => g.typ === mapping.galeria_typ);
        if (galeria && galeria.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: mapping.galeria_nazov || galeria.nazov,
            fotky: galeria.fotky
          });
        }
      }
    });
    
    // FALLBACK: Ak nebola pridaná žiadna exteriérová galéria, pridaj default podľa fasády
    const maExterierovaGaleria = matchedGalleries.some(g => g.nazov.includes("Exteriér"));
    if (!maExterierovaGaleria) {
      if (fasada === "omietka") {
        const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
        if (murovkaGaleria?.fotky?.length > 0) {
          matchedGalleries.unshift({
            nazov: "Exteriér - Murovka",
            fotky: murovkaGaleria.fotky
          });
        }
      } else {
        // Pre všetky ostatné fasády vrátane drevo_smrek
        const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
        console.log('🪵 Fallback - pridávam drevo/plech galériu pre fasádu:', fasada, drevoGaleria);
        if (drevoGaleria?.fotky?.length > 0) {
          matchedGalleries.unshift({
            nazov: "Exteriér - Drevo/Plech",
            fotky: drevoGaleria.fotky
          });
        }
      }
    }
    
    console.log('✅ Matched galleries:', matchedGalleries);
    return matchedGalleries;
  };

  const matchedGalleries = getMatchedGalleries();
  console.log('📸 Final matched galleries:', matchedGalleries);

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

  // Vytvorenie súhrnu konfigurácie
  const buildConfigSummary = () => {
    const lines = [];
    lines.push(`Účel: ${actualStatus}`);
    lines.push(`\nIZOLÁCIA:`);
    lines.push(`- Steny: ${izolaciaStien}`);
    lines.push(`- Podlaha: ${izolaciaPodlahy}`);
    lines.push(`- Strop: ${izolaciaStropu}`);
    
    if (tepelneCerpadlo === "ano" || rekuperacia === "ano" || podlahovoKurenie || pripravaNaKrb || ochranaKachle) {
      lines.push(`\nVYKUROVANIE:`);
      if (tepelneCerpadlo === "ano") lines.push(`- Tepelné čerpadlo`);
      if (rekuperacia === "ano") lines.push(`- Rekuperácia`);
      if (podlahovoKurenie) lines.push(`- Podlahové kúrenie`);
      if (pripravaNaKrb) lines.push(`- Príprava na krb`);
      if (ochranaKachle) lines.push(`- Ochrana na kachle`);
    }
    
    lines.push(`\nFASÁDA: ${fasada === "drevo_smrek" ? "Drevo smrek" : fasada === "omietka" ? "Šúchaná omietka" : fasada === "smrekovec" ? "Smrekovec" : fasada === "falcovane" ? "Falcované panely" : "Thermowood"}`);
    lines.push(`STRECHA: ${strecha === "korugovan_plech" ? "Korugovaný plech" : "Falcované panely"}`);
    if (odkvapy === "ano") lines.push(`- Odkvapy`);
    
    lines.push(`\nELEKTRO: ${elektro === "eu" ? "EU štandard" : elektro === "cz" ? "CZ/SK štandard" : "GE štandard (A0)"}`);
    if (bleskozvod) lines.push(`- Bleskozvod`);
    if (prepat) lines.push(`- Prepäťová ochrana`);
    
    if (inziniering || projektACertifikacia || revizia) {
      lines.push(`\nSLUŽBY:`);
      if (inziniering) lines.push(`- Inžiniering`);
      if (projektACertifikacia) lines.push(`- Projekt + Certifikácia A0`);
      if (revizia) lines.push(`- Revízna dokumentácia`);
    }
    
    if (zaklady !== "bez") {
      lines.push(`\nZÁKLADY: ${zaklady === "vruty" ? "Zemné vruty" : zaklady === "patky" ? "Betónové pätky" : "Pásové betónové"}`);
    }
    
    if (montaz || doprava) {
      lines.push(`\nREALIZÁCIA:`);
      if (montaz) lines.push(`- Montáž domu`);
      if (doprava) lines.push(`- Doprava modulov`);
    }
    
    lines.push(`\n\nCELKOVÁ CENA: ${formatPrice(totalPrice)}`);
    return lines.join('\n');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const novyDopyt = await base44.entities.Dopyt.create({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: dom?.id,
      konfiguracny_kod: `Lyon 50m² - ${actualStatus} - ${formatPrice(totalPrice)}`,
      poznamka: `Lokalita: ${formData.obec}\n\n${formData.poznamka}\n\n--- KONFIGURÁCIA ---\n${buildConfigSummary()}`
    });

    // Spusti notifikácie
    await base44.functions.invoke('notifikujNovyDopyt', { 
      dopyt: {
        id: novyDopyt.id,
        klient_meno: formData.meno,
        klient_email: formData.email,
        klient_telefon: formData.telefon,
        klient_adresa: formData.obec,
        dom_id: dom?.id,
        dom_nazov: dom?.nazov,
        poznamka: formData.poznamka
      }
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
      onClose();
    }, 3000);
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const response = await base44.functions.invoke('generujCenovuPonukuLyon', {
        dom,
        konfiguraciaData: {
          ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
          tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
          podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
          fasada, strecha, odkvapy, okna, vchodoveDvere,
          obkladStien, interieroveDvere, elektro, bleskozvod, prepat,
          pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
          skrinka, stropKupelna, inziniering, projektACertifikacia,
          revizia, zaklady, montaz, doprava,
          predajNehnutelnosti, chcemPozemok, financneSluzby,
          totalPrice
        },
        klientData: formData
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const domSlug = (dom?.nazov || 'dom').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.download = `cenova-ponuka-${domSlug}-${formData.meno || 'klient'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('PDF stiahnuté');
    } catch (error) {
      toast.error('Chyba pri generovaní PDF');
      console.error(error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleEmailPDF = async () => {
    if (!formData.email) {
      toast.error('Vyplňte email');
      return;
    }
    setGeneratingPDF(true);
    try {
      await base44.functions.invoke('odosliCenovuPonukuLyonEmail', {
        dom,
        konfiguraciaData: {
          ucel, izolaciaStien, izolaciaPodlahy, izolaciaStropu,
          tepelneCerpadlo, rekuperacia, pripravaNaRekuperaciu,
          podlahovoKurenie, pripravaNaKrb, ochranaKachle, klimatizacia,
          fasada, strecha, odkvapy, okna, vchodoveDvere,
          obkladStien, interieroveDvere, elektro, bleskozvod, prepat,
          pripravaNaSolarnePanely, sprchovyKut, vana, bateria,
          skrinka, stropKupelna, inziniering, projektACertifikacia,
          revizia, zaklady, montaz, doprava,
          predajNehnutelnosti, chcemPozemok, financneSluzby,
          totalPrice
        },
        klientData: formData
      });
      
      toast.success('Cenová ponuka bola odoslaná emailom');
    } catch (error) {
      toast.error('Chyba pri odosielaní emailu');
      console.error(error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {!submitted ? (
              <div className="flex flex-col lg:flex-row">
                {/* Ľavá strana - Obrázok a súhrn */}
                <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{t('yourConfig') || 'Vaša konfigurácia'}</h2>
                    <button
                      onClick={onClose}
                      className="lg:hidden w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Obrázok domu */}
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-white">
                    <img 
                      src={getDisplayImage()} 
                      alt={dom?.nazov || 'Lyon 50m²'} 
                      className="w-full h-48 object-contain"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${fasada === "omietka" ? "bg-orange-500" : "bg-amber-600"} text-white text-xs`}>
                        {fasada === "omietka" ? "Šúchaná fasáda" : 
                         fasada === "drevo_smrek" ? "Drevený obklad" :
                         fasada === "smrekovec" ? "Smrekovec" :
                         fasada === "falcovane" ? "Falcované panely" : "Thermowood"}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{dom?.nazov || 'Lyon 50m²'}</h3>

                  {/* Upozornenie pre neúplnú A0 */}
                  {ucel === "rodinny" && !isA0 && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-bold text-sm mb-1">{t('incompleteA0Config') || 'Neúplná A0 konfigurácia'}</p>
                          <p className="text-yellow-300/80 text-xs">
                           {t('incompleteA0Msg') || 'Aktuálne je to rekreačná stavba. Pre rodinný dom doplňte všetky A0 položky.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Súhrn konfigurácie */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 max-h-[280px] overflow-y-auto text-sm space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-300">{t('purposeOfBuilding') || 'Účel stavby'}</span>
                      <span className="text-green-400 font-semibold">{actualStatus}</span>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('insulation') || 'IZOLÁCIA'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>{t('walls')} {izolaciaStien}</span>
                          <span className="text-green-400 font-semibold">
                            {izolaciaStien === "150mm" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.izolacia_stien[izolaciaStien])}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('floors')} {izolaciaPodlahy}</span>
                          <span className="text-green-400 font-semibold">
                            {izolaciaPodlahy === "150mm" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.izolacia_podlahy[izolaciaPodlahy])}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('roof')} {izolaciaStropu}</span>
                          <span className="text-green-400 font-semibold">
                            {izolaciaStropu === "150mm" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.izolacia_stropu[izolaciaStropu])}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('heating') || 'VYKUROVANIE'}</p>
                      <div className="space-y-1 text-xs">
                        {tepelneCerpadlo === "ano" ? (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('heatPump')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.tepelne_cerpadlo.ano)}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('heatingPreparation')}</span>
                            <span className="text-green-400 font-semibold">{t('includedInPriceShort')}</span>
                          </div>
                        )}
                        {rekuperacia === "ano" && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('recuperation')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.rekuperacia.ano)}</span>
                          </div>
                        )}
                        {podlahovoKurenie && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('floorHeating')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.podlahove_kurenie)}</span>
                          </div>
                        )}
                        {pripravaNaKrb && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('fireplacePrep')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.pripravaKrb)}</span>
                          </div>
                        )}
                        {ochranaKachle && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('stoveProtection')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.ochranaKachle)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('facadeSection') || 'FASÁDA'}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">
                          • {fasada === "drevo_smrek" ? (t('spruceWood') || "Drevo smrek") : 
                             fasada === "omietka" ? (t('scratchedPlaster') || "Šúchaná omietka") : 
                             fasada === "smrekovec" ? (t('larch') || "Smrekovec") :
                             fasada === "falcovane" ? (t('foldedPanels') || "Falcované panely") : "Thermowood"}
                        </span>
                        <span className="text-green-400 font-semibold">
                          {fasada === "drevo_smrek" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.fasada[fasada])}`}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('roofSection') || 'STRECHA'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {strecha === "korugovan_plech" ? (t('corrugatedMetal') || "Korugovaný plech") : (t('foldedPanels') || "Falcované panely")}</span>
                          <span className="text-green-400 font-semibold">
                            {strecha === "korugovan_plech" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.strecha.falcovane)}`}
                          </span>
                        </div>
                        {odkvapy === "ano" && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('gutters') || 'Odkvapy'}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.odkvapy)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('windowsDoorsSection') || 'OKNÁ A DVERE'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {t('windows')} {okna === "biele" ? t('white') : okna === "antracit" ? t('anthracite') : t('brown')}</span>
                          <span className="text-green-400 font-semibold">{t('includedInPriceShort')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {vchodoveDvere === "plastove" ? t('metalPlasticDoors') : t('metalDoors')}</span>
                          <span className="text-green-400 font-semibold">
                            {vchodoveDvere === "plastove" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.dvere.kovove)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('interiorSection') || 'INTERIÉR'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-300">
                            • {obkladStien === "smrek_8cm" ? t('spruceWall8cm') :
                               obkladStien === "smrek_bez_uzlov" ? t('spruceWallNoKnots') :
                               obkladStien === "sadrokarton_tapeta" ? t('drywallWallpaper') : t('osbPanel')}
                          </span>
                          <span className="text-green-400 font-semibold">
                            {obkladStien === "smrek_8cm" || obkladStien === "smrek_bez_uzlov" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.obklad[obkladStien])}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {t('laminate')}</span>
                          <span className="text-green-400 font-semibold">{t('includedInPriceShort')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {interieroveDvere === "kridlove" ? t('hingedDoors') : t('slidingDoors')}</span>
                          <span className="text-green-400 font-semibold">
                            {interieroveDvere === "kridlove" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.dvere_posuvne)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('electricalSection') || 'ELEKTROINŠTALÁCIA'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {elektro === "eu" ? t('euStandard') : elektro === "cz" ? t('czSkStandard') : t('geStandard')}</span>
                          <span className="text-green-400 font-semibold">
                            {elektro === "eu" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.elektro[elektro])}`}
                          </span>
                        </div>
                        {bleskozvod && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('lightningRod')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.bleskozvod)}</span>
                          </div>
                        )}
                        {prepat && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('surgeProtection')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.prepat)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-slate-400 text-xs mb-1">{t('bathroomSection') || 'KÚPEĽŇA'}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {sprchovyKut === "standard" ? t('showerWC') : t('showerRadaway')}</span>
                          <span className="text-green-400 font-semibold">
                            {sprchovyKut === "standard" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.sprchovyKut)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {bateria === "standard" ? t('faucetStandard') : t('faucetGrohe')}</span>
                          <span className="text-green-400 font-semibold">
                            {bateria === "standard" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.bateria)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">• {stropKupelna === "drevo" ? t('ceilingWoodPattern') : t('drywallCeiling')}</span>
                          <span className="text-green-400 font-semibold">
                            {stropKupelna === "drevo" ? (t('includedInPriceShort') || "v cene") : `+ ${formatPrice(CENY.strop_kupelna.sadrokarton)}`}
                          </span>
                        </div>
                        {vana && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('bathtub')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.vana)}</span>
                          </div>
                        )}
                        {skrinka && (
                          <div className="flex justify-between">
                            <span className="text-slate-300">• {t('cabinet')}</span>
                            <span className="text-green-400 font-semibold">+ {formatPrice(CENY.skrinka)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {zaklady !== "bez" && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">{t('foundationsSection') || 'ZÁKLADY'}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">
                            • {zaklady === "vruty" ? t('groundScrews') :
                               zaklady === "patky" ? t('concretePads') : t('stripFoundations')}
                          </span>
                          <span className="text-green-400 font-semibold">+ {formatPrice(CENY.zaklady[zaklady])}</span>
                        </div>
                      </div>
                    )}

                    {(inziniering || projektACertifikacia || revizia) && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">{t('servicesSection') || 'SLUŽBY'}</p>
                        <div className="space-y-1 text-xs">
                          {inziniering && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">• {t('engineering')}</span>
                              <span className="text-green-400 font-semibold">+ {formatPrice(CENY.inziniering)}</span>
                            </div>
                          )}
                          {projektACertifikacia && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">• {t('projectCertification')} A0</span>
                              <span className="text-green-400 font-semibold">+ {formatPrice(CENY.projektACertifikacia)}</span>
                            </div>
                          )}
                          {revizia && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">• {t('revisionDocs')}</span>
                              <span className="text-green-400 font-semibold">+ {formatPrice(CENY.revizia)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(montaz || doprava) && (
                      <div className="border-t border-slate-700 pt-2">
                        <p className="text-slate-400 text-xs mb-1">{t('realizationSection') || 'REALIZÁCIA'}</p>
                        <div className="space-y-1 text-xs">
                          {montaz && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">• {t('assembly')}</span>
                              <span className="text-green-400 font-semibold">+ {formatPrice(CENY.montaz)}</span>
                            </div>
                          )}
                          {doprava && (
                            <div className="flex justify-between">
                              <span className="text-slate-300">• {t('transport')}</span>
                              <span className="text-green-400 font-semibold">+ {formatPrice(CENY.doprava)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status A0 */}
                  <div className={`mt-3 p-3 rounded-xl border ${isA0 ? 'bg-green-500/20 border-green-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                    {isA0 ? (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-bold text-sm">✓ {t('meetsA0Requirements') || 'Spĺňa podmienky A0'}</p>
                          <p className="text-green-300/80 text-xs">{t('familyHouseWithCert') || 'Rodinný dom s energetickým certifikátom'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-blue-400 font-bold text-sm">{t('recreationalBuilding')}</p>
                          <p className="text-blue-300/80 text-xs">{t('cottageGardenHouse') || 'Chata / záhradný domček'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Celková cena */}
                  <div className="mt-3 p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{t('totalPriceWithVAT') || 'Celkom s DPH'}</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="hidden lg:block mt-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 mx-auto"
                  >
                    <X className="w-5 h-5 mx-auto" />
                  </button>
                </div>

                {/* Pravá strana - Formulár */}
                <div className="lg:w-1/2 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {t('contactInfo') || 'Kontaktné údaje'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {t('fillFormForOffer') || 'Vyplňte formulár a my vás budeme kontaktovať s podrobnou ponukou.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="meno">{t('nameAndSurname') || 'Meno a priezvisko'} *</Label>
                      <Input
                        id="meno"
                        required
                        value={formData.meno}
                        onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                        placeholder="Ján Novák"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan.novak@email.sk"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefon">{t('phone') || 'Telefón'} *</Label>
                      <Input
                        id="telefon"
                        required
                        value={formData.telefon}
                        onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                        placeholder="+421 900 123 456"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obec">{t('townCity') || 'Obec / Mesto'} ({t('whereHouse') || 'kde bude dom stáť'}) *</Label>
                      <Input
                        id="obec"
                        required
                        value={formData.obec}
                        onChange={(e) => setFormData({ ...formData, obec: e.target.value })}
                        placeholder="napr. Bratislava, Košice..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="poznamka">{t('note') || 'Poznámka'} ({t('optional') || 'voliteľné'})</Label>
                      <Textarea
                        id="poznamka"
                        value={formData.poznamka}
                        onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                        placeholder="Máte otázky alebo špeciálne požiadavky?"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {isAdmin && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                          className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                          <Eye className="mr-2 w-4 h-4" />
                          {t('previewQuote') || 'Náhľad ponuky'}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleEmailPDF}
                          disabled={generatingPDF || !formData.email}
                          className="border-2 border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <Mail className="mr-2 w-4 h-4" />
                          {generatingPDF ? 'Odosiela sa...' : (t('sendEmail') || 'Odoslať email')}
                        </Button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"

                    >
                      {(
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          {t('sendInquiry') || 'Odoslať dopyt'}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t('thankYouForInterest') || 'Ďakujeme za váš záujem!'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('configSentSuccess') || 'Vaša konfigurácia bola úspešne odoslaná. Ozveme sa vám čo najskôr, zvyčajne do 24 hodín.'}
                </p>
              </motion.div>
            )}


          </motion.div>

          {/* Náhľad cenovej ponuky - Modal */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Náhľad cenovej ponuky - {dom?.nazov || 'Lyon 50m²'} (Číslo: CP-{new Date().getFullYear()}-XXXX)</DialogTitle>
              </DialogHeader>
              
              <div className="bg-white p-8 border rounded-lg">
                {/* Header ponuky */}
                <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-red-600">
                  <div>
                    <h1 className="text-3xl font-bold text-red-600 mb-2">CENOVÁ PONUKA</h1>
                    <p className="text-gray-600">Dátum: {new Date().toLocaleDateString('sk-SK')}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-gray-900">American Living</p>
                    <p className="text-gray-600">+421 905 138 124</p>
                    <p className="text-gray-600">info@americanliving.sk</p>
                    <p className="text-gray-600">www.americanliving.sk</p>
                  </div>
                </div>

                {/* Obrázok domu s číslom ponuky */}
                <div className="mb-6 relative">
                  <img 
                    src={getDisplayImage()} 
                    alt={dom?.nazov || 'Dom'} 
                    className="w-full h-64 object-contain rounded-lg border"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 px-4 py-2 rounded-lg shadow-lg border-2 border-red-600">
                    <p className="text-sm font-bold text-red-600">Číslo ponuky:</p>
                    <p className="text-lg font-black text-gray-900">CP-{new Date().getFullYear()}-XXXX</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white text-3xl font-bold bg-black/20 px-6 py-3 rounded">
                      American Living
                    </div>
                  </div>
                </div>

                {/* Info o dome */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Vybraný model:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-gray-900 text-xl mb-3">{dom?.nazov || 'Lyon 50m²'}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Výrobca:</span>
                        <p className="font-semibold text-gray-900">{dom?.vyrobca || 'Ticab house'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Typ domu:</span>
                        <p className="font-semibold text-gray-900">{dom?.typ_domu || 'Modulárny dom'}</p>
                      </div>
                      {dom?.pocet_modulov && (
                        <div>
                          <span className="text-gray-500">Moduly:</span>
                          <p className="font-semibold text-gray-900">{dom.pocet_modulov}</p>
                        </div>
                      )}
                      {dom?.pocet_izieb && (
                        <div>
                          <span className="text-gray-500">Počet izieb:</span>
                          <p className="font-semibold text-gray-900">max. {dom.pocet_izieb}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Zastavaná plocha:</span>
                        <p className="font-semibold text-gray-900">{dom?.zastavana_plocha || 50} m²</p>
                      </div>
                      {dom?.uzitkova_plocha && (
                        <div>
                          <span className="text-gray-500">Úžitková plocha:</span>
                          <p className="font-semibold text-gray-900">{dom.uzitkova_plocha} m²</p>
                        </div>
                      )}
                      {dom?.terasa_plocha && (
                        <div>
                          <span className="text-gray-500">Terasa:</span>
                          <p className="font-semibold text-gray-900">{dom.terasa_plocha} m²</p>
                        </div>
                      )}
                      {dom?.energeticky_certifikat && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Energetický certifikát A0:</span>
                          <p className="font-semibold text-green-600">✓ Možný</p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`inline-block px-3 py-1 rounded-full mt-3 ${isA0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      <p className="text-sm font-bold">Typ stavby: {actualStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Pôdorysy - vždy zobraz */}
                {(dom?.podorys_2d || dom?.podorys_3d) && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-red-600">Pôdorysy:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {dom?.podorys_2d && (
                        <div className="border rounded-lg overflow-hidden">
                          <img src={dom.podorys_2d} alt="2D pôdorys" className="w-full h-48 object-contain bg-gray-50" />
                          <p className="text-xs text-center py-2 bg-gray-100 font-semibold">2D pôdorys</p>
                        </div>
                      )}
                      {dom?.podorys_3d && (
                        <div className="border rounded-lg overflow-hidden">
                          <img src={dom.podorys_3d} alt="3D pôdorys" className="w-full h-48 object-contain bg-gray-50" />
                          <p className="text-xs text-center py-2 bg-gray-100 font-semibold">3D pôdorys</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Galérie podľa mapovaných pravidiel - s watermarkom */}
                {matchedGalleries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-red-600">Fotogaléria:</h3>
                    <div className="space-y-4">
                      {matchedGalleries.map((galeria, gIdx) => (
                        <div key={gIdx}>
                          <p className="text-sm font-semibold text-gray-700 mb-2">{galeria.nazov}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {galeria.fotky.slice(0, 6).map((img, idx) => (
                              <div key={idx} className="border rounded overflow-hidden relative bg-gray-50">
                                <img src={img} alt={`${galeria.nazov} ${idx + 1}`} className="w-full h-48 object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="text-white text-lg font-bold bg-black/20 px-4 py-2 rounded">
                                    American Living
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {galeria.fotky.length > 6 && (
                            <p className="text-xs text-gray-500 mt-1">+ ďalších {galeria.fotky.length - 6} fotiek</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Klient info */}
                {formData.meno && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-red-600">Pre klienta:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700"><strong>Meno:</strong> {formData.meno}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {formData.email}</p>
                      <p className="text-gray-700"><strong>Telefón:</strong> {formData.telefon}</p>
                      {formData.obec && <p className="text-gray-700"><strong>Obec:</strong> {formData.obec}</p>}
                    </div>
                  </div>
                )}

                {/* Konfigurácia - PRESNÁ KÓPIA SIDEBARU */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Cenový rozpis:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {/* SEKCIA 0: ÚČEL STAVBY */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm">ÚČEL STAVBY</div>
                      <div className={`flex justify-between text-sm py-1 ${ucel !== "chata" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Rekreačná stavba</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${ucel !== "rodinny" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Rodinný dom A0</span>
                        <span>v cene</span>
                      </div>

                      {/* SEKCIA 1: IZOLÁCIA */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">1. IZOLÁCIA</div>
                      <div className="flex justify-between text-sm py-1 font-semibold border-b pb-1">
                        <span>Základná cena domu</span>
                        <span>{formatPrice(dom?.zakladna_cena || 0)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaStien !== "150mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia stien 150mm</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaStien !== "200mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia stien 200mm</span>
                        <span>+ {formatPrice(1799.16)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaStien !== "250mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia stien 250mm</span>
                        <span>+ {formatPrice(1558.17)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaPodlahy !== "150mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia podlahy 150mm</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaPodlahy !== "200mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia podlahy 200mm</span>
                        <span>+ {formatPrice(334.08)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaStropu !== "150mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia stropu 150mm</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${izolaciaStropu !== "200mm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Izolácia stropu 200mm</span>
                        <span>+ {formatPrice(271.44)}</span>
                      </div>

                      {/* SEKCIA 2: VYKUROVANIE */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">2. VYKUROVANIE</div>
                      <div className={`flex justify-between text-sm py-1 ${tepelneCerpadlo !== "nie" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Príprava na vykurovanie</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${tepelneCerpadlo !== "ano" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Tepelné čerpadlo</span>
                        <span>+ {formatPrice(CENY.tepelne_cerpadlo.ano)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${rekuperacia === "ano" || pripravaNaRekuperaciu ? "text-gray-400 line-through" : ""}`}>
                        <span>• Bez rekuperácie</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!pripravaNaRekuperaciu ? "text-gray-400 line-through" : ""}`}>
                        <span>• Príprava na rekuperáciu</span>
                        <span>+ {formatPrice(512)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${rekuperacia !== "ano" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Rekuperácia</span>
                        <span>+ {formatPrice(CENY.rekuperacia.ano)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!podlahovoKurenie ? "text-gray-400 line-through" : ""}`}>
                        <span>• Podlahové kúrenie</span>
                        <span>+ {formatPrice(CENY.podlahove_kurenie)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!pripravaNaKrb ? "text-gray-400 line-through" : ""}`}>
                        <span>• Príprava na krb</span>
                        <span>+ {formatPrice(CENY.pripravaKrb)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!ochranaKachle ? "text-gray-400 line-through" : ""}`}>
                        <span>• Ochrana kachle</span>
                        <span>+ {formatPrice(CENY.ochranaKachle)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!klimatizacia ? "text-gray-400 line-through" : ""}`}>
                        <span>• Príprava na klimatizáciu</span>
                        <span>+ {formatPrice(902)}</span>
                      </div>

                      {/* SEKCIA 3: FASÁDA */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">3. FASÁDA</div>
                      <div className={`flex justify-between text-sm py-1 ${fasada !== "drevo_smrek" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Fasáda - drevo smrek</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${fasada !== "omietka" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Fasáda - šúchaná omietka</span>
                        <span>+ {formatPrice(CENY.fasada.omietka)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${fasada !== "smrekovec" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Fasáda - smrekovec</span>
                        <span>+ {formatPrice(CENY.fasada.smrekovec)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${fasada !== "falcovane" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Fasáda - falcované panely</span>
                        <span>+ {formatPrice(CENY.fasada.falcovane)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${fasada !== "thermowood" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Fasáda - thermowood</span>
                        <span>+ {formatPrice(CENY.fasada.thermowood)}</span>
                      </div>

                      {/* SEKCIA 4: STRECHA */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">4. STRECHA</div>
                      <div className={`flex justify-between text-sm py-1 ${strecha !== "korugovan_plech" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Strecha - korugovaný plech</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${strecha !== "falcovane" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Strecha - falcované panely</span>
                        <span>+ {formatPrice(CENY.strecha.falcovane)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${odkvapy !== "nie" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Bez odkvapov</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${odkvapy !== "ano" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Odkvapy</span>
                        <span>+ {formatPrice(CENY.odkvapy)}</span>
                      </div>

                      {/* SEKCIA 5: OKNÁ A DVERE */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">5. OKNÁ A DVERE</div>
                      <div className={`flex justify-between text-sm py-1 ${okna !== "biele" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Okná - biele 3-sklo</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${okna !== "antracit" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Okná - antracit 3-sklo</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${okna !== "hnede" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Okná - hnedé 3-sklo</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${vchodoveDvere !== "plastove" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Vchodové dvere - plast/kov</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${vchodoveDvere !== "kovove" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Vchodové dvere - kovové</span>
                        <span>+ {formatPrice(CENY.dvere.kovove)}</span>
                      </div>

                      {/* SEKCIA 6: INTERIÉR */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">6. INTERIÉR</div>
                      <div className={`flex justify-between text-sm py-1 ${obkladStien !== "smrek_8cm" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Obklad - smrek 8cm</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${obkladStien !== "smrek_bez_uzlov" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Obklad - smrek bez uzlov</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${obkladStien !== "sadrokarton_tapeta" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Obklad - sadrokartón + tapeta</span>
                        <span>+ {formatPrice(CENY.obklad.sadrokarton_tapeta)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${obkladStien !== "osb_panel" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Obklad - OSB panel</span>
                        <span>+ {formatPrice(CENY.obklad.osb_panel)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <span>• Podlaha - laminát</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${interieroveDvere !== "kridlove" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Interiérové dvere - krídlové</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${interieroveDvere !== "posuvne" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Interiérové dvere - posuvné</span>
                        <span>+ {formatPrice(CENY.dvere_posuvne)}</span>
                      </div>

                      {/* SEKCIA 7: ELEKTRO */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">7. ELEKTROINŠTALÁCIA</div>
                      <div className={`flex justify-between text-sm py-1 ${elektro !== "eu" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Elektro - EU štandard</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${elektro !== "cz" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Elektro - CZ/SK štandard</span>
                        <span>+ {formatPrice(CENY.elektro.cz)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${elektro !== "ge" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Elektro - GE štandard (A0)</span>
                        <span>+ {formatPrice(CENY.elektro.ge)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!bleskozvod ? "text-gray-400 line-through" : ""}`}>
                        <span>• Bleskozvod</span>
                        <span>+ {formatPrice(CENY.bleskozvod)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!prepat ? "text-gray-400 line-through" : ""}`}>
                        <span>• Prepäťová ochrana</span>
                        <span>+ {formatPrice(CENY.prepat)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!pripravaNaSolarnePanely ? "text-gray-400 line-through" : ""}`}>
                        <span>• Príprava na solárne panely</span>
                        <span>+ {formatPrice(1305)}</span>
                      </div>

                      {/* SEKCIA 8: KÚPEĽŇA */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">8. KÚPEĽŇA</div>
                      <div className={`flex justify-between text-sm py-1 ${sprchovyKut !== "standard" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Sprcha + WC Geberit</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${sprchovyKut !== "radaway" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Sprchový kút Radaway</span>
                        <span>+ {formatPrice(CENY.sprchovyKut)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${bateria !== "standard" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Batéria - štandard</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${bateria !== "grohe" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Batéria - Grohe</span>
                        <span>+ {formatPrice(CENY.bateria)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${stropKupelna !== "drevo" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Strop kúpeľňa - drevo</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${stropKupelna !== "sadrokarton" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Strop kúpeľňa - sadrokartón</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!vana ? "text-gray-400 line-through" : ""}`}>
                        <span>• Vaňa</span>
                        <span>+ {formatPrice(CENY.vana)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!skrinka ? "text-gray-400 line-through" : ""}`}>
                        <span>• Skrinka</span>
                        <span>+ {formatPrice(CENY.skrinka)}</span>
                      </div>

                      {/* SEKCIA 9: ZÁKLADY */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">9. ZÁKLADY</div>
                      <div className={`flex justify-between text-sm py-1 ${zaklady !== "bez" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Bez základov</span>
                        <span>v cene</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${zaklady !== "vruty" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Základy - zemné vruty</span>
                        <span>+ {formatPrice(CENY.zaklady.vruty)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${zaklady !== "patky" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Základy - betónové pätky</span>
                        <span>+ {formatPrice(CENY.zaklady.patky)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${zaklady !== "pasove" ? "text-gray-400 line-through" : ""}`}>
                        <span>• Základy - pásové betónové</span>
                        <span>+ {formatPrice(CENY.zaklady.pasove)}</span>
                      </div>

                      {/* SEKCIA 10: INŽINIERING */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">10. INŽINIERING A DOKUMENTÁCIA (A0)</div>
                      <div className={`flex justify-between text-sm py-1 ${!inziniering ? "text-gray-400 line-through" : ""}`}>
                        <span>• Inžiniering</span>
                        <span>+ {formatPrice(CENY.inziniering)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!projektACertifikacia ? "text-gray-400 line-through" : ""}`}>
                        <span>• Projekt + Certifikácia A0</span>
                        <span>+ {formatPrice(CENY.projektACertifikacia)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!revizia ? "text-gray-400 line-through" : ""}`}>
                        <span>• Revízna dokumentácia</span>
                        <span>+ {formatPrice(CENY.revizia)}</span>
                      </div>

                      {/* SEKCIA 11: REALIZÁCIA */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">11. REALIZÁCIA</div>
                      <div className={`flex justify-between text-sm py-1 ${!montaz ? "text-gray-400 line-through" : ""}`}>
                        <span>• Montáž domu</span>
                        <span>+ {formatPrice(CENY.montaz)}</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!doprava ? "text-gray-400 line-through" : ""}`}>
                        <span>• Doprava modulov</span>
                        <span>+ {formatPrice(CENY.doprava)}</span>
                      </div>

                      {/* SEKCIA 12: DODATOČNÉ SLUŽBY - vždy zobrazené */}
                      <div className="bg-gray-200 px-3 py-1.5 rounded font-bold text-red-600 text-sm mt-2">DODATOČNÉ SLUŽBY</div>
                      <div className={`flex justify-between text-sm py-1 ${!predajNehnutelnosti ? "text-gray-400 line-through" : "font-semibold text-gray-900 bg-green-50"}`}>
                        <span>• Predaj predošlej nehnuteľnosti {predajNehnutelnosti && <span className="text-green-600 ml-1">✓</span>}</span>
                        <span>na vyžiadanie</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!chcemPozemok ? "text-gray-400 line-through" : "font-semibold text-gray-900 bg-green-50"}`}>
                        <span>• Chcem pozemok pod svoj dom {chcemPozemok && <span className="text-green-600 ml-1">✓</span>}</span>
                        <span>na vyžiadanie</span>
                      </div>
                      <div className={`flex justify-between text-sm py-1 ${!financneSluzby ? "text-gray-400 line-through" : "font-semibold text-gray-900 bg-green-50"}`}>
                        <span>• Finančné služby - úvery/pôžičky {financneSluzby && <span className="text-green-600 ml-1">✓</span>}</span>
                        <span>na vyžiadanie</span>
                      </div>
                      </div>
                      </div>

                      {/* DODATOČNÉ SLUŽBY - EXPANDED INFO CARD */}
                      {(predajNehnutelnosti || chcemPozemok || financneSluzby) && (
                        <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mt-4">
                          <div className="space-y-2">
                            {/* SEKCIA HEADER */}
                            <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Vybrané dodatočné služby:
                            </h4>

                        {predajNehnutelnosti && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">Predaj predošlej nehnuteľnosti</p>
                              <p className="text-xs text-gray-600">Budú sa Vám venovať naší najlepší odborníci v realitách.</p>
                            </div>
                          </div>
                        )}

                        {chcemPozemok && (
                          <div className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">Chcem pozemok pod svoj dom</p>
                              <p className="text-xs text-gray-600">Pomôžeme Vám nájsť ideálny pozemok.</p>
                            </div>
                          </div>
                        )}

                        {financneSluzby && (
                          <div className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">Finančné služby - úvery/pôžičky</p>
                              <p className="text-xs text-gray-600">Budú sa Vám venovať naší najlepší finančníci.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                      )}
                      </div>

                {/* Celková cena */}
                <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-800">CELKOVÁ CENA s DPH</span>
                    <span className="text-3xl font-bold text-red-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Päticka */}
                <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
                  <p>Pre viac informácií nás neváhajte kontaktovať na +421 905 138 124 alebo info@americanliving.sk</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </motion.div>
      )}
    </AnimatePresence>
  );
}