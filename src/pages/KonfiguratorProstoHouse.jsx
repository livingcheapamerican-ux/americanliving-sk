import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Home, Settings, Send, CheckCircle, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import KonfiguratorProstoHouseFaza1 from "@/components/KonfiguratorProstoHouseFaza1";

export default function KonfiguratorProstoHouse() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');

  const [konfig, setKonfig] = useState({
    montaz: false,
    vstupne_dvere: "standardne",
    zaklady: "bez",
    fasada: "standard",
    okna: "standard",
    izolacie: false,
    elektroinst: false,
    vodoinst: false,
    kanalizacia: false,
    vytranie: false,
    podkrovie: false,
    zateplenie_extra: false,
    tepelne_cerpadlo: false,
    fotovoltaika: false,
    projektova_dok: false,
    energeticky_cert: false
  });

  const [showFormular, setShowFormular] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [formData, setFormData] = useState({
    meno: "",
    email: "",
    telefon: "",
    poznamka: ""
  });

  const queryClient = useQueryClient();

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-konfigurator-prosto', domId],
    queryFn: async () => {
      if (!domId) return null;
      const domy = await base44.entities.Dom.filter({ id: domId });
      return domy[0] || null;
    },
    enabled: !!domId,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always'
  });

  const createDopytMutation = useMutation({
    mutationFn: (data) => base44.entities.Dopyt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dopyty'] });
      alert("✓ Ďakujeme! Váš dopyt bol úspešne odoslaný. Čoskoro vás budeme kontaktovať s cenovou ponukou.");
      window.location.href = createPageUrl("Katalog");
    },
  });

  // Načítať cenník z databázy (fallback na defaults ak neexistuje)
  const customCeny = dom?.konfigurator_custom_ceny_prosto_house || {};

  const DEFAULT_CENNIK = {
    montaz_48: 4614,
    montaz_72: 7524,
    montaz_103: 12073,
    montaz_108: 9664,
    montaz_142: 12091,
    izolacie: 3200,
    elektroinst: 2400,
    vodoinst: 1800,
    kanalizacia: 1600,
    vytranie: 2800,
    podkrovie: 4500,
    zateplenie_extra: 3600,
    tepelne_cerpadlo: 8500,
    fotovoltaika: 12000,
    projektova_dok: 2107,
    energeticky_cert: 3500
  };

  const getPrice = (key) => {
    // Skúsime rôzne varianty kľúčov v customCeny
    const variants = [key, key.replace(/_/g, '')];
    
    for (const variant of variants) {
      if (customCeny && customCeny[variant] !== undefined && customCeny[variant] > 0) {
        return customCeny[variant];
      }
    }
    
    return DEFAULT_CENNIK[key] ?? 0;
  };

  const getMontazPrice = () => {
    if (!dom?.zastavana_plocha) return 0;
    const plocha = dom.zastavana_plocha;
    
    // Skúsime najprv priamy kľúč "montaz" v customCeny
    if (customCeny && customCeny.montaz !== undefined && customCeny.montaz > 0) {
      return customCeny.montaz;
    }
    
    // Potom podľa plochy
    if (plocha <= 48) return getPrice('montaz_48');
    if (plocha <= 72) return getPrice('montaz_72');
    if (plocha <= 103) return getPrice('montaz_103');
    if (plocha <= 108) return getPrice('montaz_108');
    return getPrice('montaz_142');
  };

  const getPriceNested = (category, subkey) => {
    const fullKey = `${category}_${subkey}`;
    
    // Priority 1: flat key format
    if (customCeny && customCeny[fullKey] !== undefined && customCeny[fullKey] > 0) {
      return customCeny[fullKey];
    }
    
    // Priority 2: nested object
    if (customCeny && customCeny[category] && typeof customCeny[category] === 'object') {
      if (customCeny[category][subkey] !== undefined && customCeny[category][subkey] > 0) {
        return customCeny[category][subkey];
      }
    }
    
    // Priority 3: defaults (hardcoded because these aren't in DEFAULT_CENNIK)
    const DEFAULTS = {
      vstupne_dviere_kovove: 480,
      vstupne_dviere_plastkovo_kovove: 440,
      zaklady_skrutky: 3521,
      zaklady_pasove: 9093,
      zaklady_doska: 9633,
      fasada_smrekovec: 960,
      fasada_termicky_upravene_drevo: 1440,
      fasada_kompozit: 2400,
      okna_hlinikove: 1200
    };
    
    return DEFAULTS[fullKey] ?? 0;
  };

  const cennik = React.useMemo(() => ({
    izolacie: getPrice('izolacie'),
    elektroinst: getPrice('elektroinst'),
    vodoinst: getPrice('vodoinst'),
    kanalizacia: getPrice('kanalizacia'),
    vytranie: getPrice('vytranie'),
    podkrovie: getPrice('podkrovie'),
    zateplenie_extra: getPrice('zateplenie_extra'),
    tepelne_cerpadlo: getPrice('tepelne_cerpadlo'),
    fotovoltaika: getPrice('fotovoltaika'),
    projektova_dok: getPrice('projektova_dok'),
    energeticky_cert: getPrice('energeticky_cert')
  }), [customCeny]);

  // Cenník pre Fázu 1 - rovnaká logika ako pre ostatné fázy
  const cennikFaza1 = React.useMemo(() => ({
    montaz: getMontazPrice(),
    vstupne_dviere_kovove: getPriceNested('vstupne_dviere', 'kovove'),
    vstupne_dviere_plastkovo_kovove: getPriceNested('vstupne_dviere', 'plastkovo_kovove'),
    zaklady_skrutky: getPriceNested('zaklady', 'skrutky'),
    zaklady_pasove: getPriceNested('zaklady', 'pasove'),
    zaklady_doska: getPriceNested('zaklady', 'doska'),
    fasada_smrekovec: getPriceNested('fasada', 'smrekovec'),
    fasada_termicky_upravene_drevo: getPriceNested('fasada', 'termicky_upravene_drevo'),
    fasada_kompozit: getPriceNested('fasada', 'kompozit'),
    okna_hlinikove: getPriceNested('okna', 'hlinikove')
  }), [customCeny, dom?.zastavana_plocha]);

  const vypocitatCenu = () => {
    if (!dom) return { bezDPH: 0, sDPH: 0 };
    
    let celkovaCena = dom.zakladna_cena || 0; // dom.zakladna_cena je uz s DPH
    const plocha = dom.zastavana_plocha || 72;
    
    // Montáž - podľa plochy (ceny su bez DPH, pripocitame s DPH)
    if (konfig.montaz) {
      const montazPrice = getMontazPrice();
      celkovaCena += montazPrice * 1.23;
    }

    // Vstupné dvere (ceny su bez DPH, pripocitame s DPH)
    const dverePrice = getPriceNested('vstupne_dviere', konfig.vstupne_dvere);
    celkovaCena += dverePrice * 1.23;

    // Základy (ceny su bez DPH, pripocitame s DPH)
    const zakladyPrice = getPriceNested('zaklady', konfig.zaklady);
    celkovaCena += zakladyPrice * 1.23;

    // Fasáda (ceny su bez DPH, pripocitame s DPH)
    const fasadaPrice = getPriceNested('fasada', konfig.fasada);
    celkovaCena += fasadaPrice * 1.23;

    // Okná (ceny su bez DPH, pripocitame s DPH)
    const oknaPrice = getPriceNested('okna', konfig.okna);
    celkovaCena += oknaPrice * 1.23;

    // Ostatné položky (cennik hodnoty su bez DPH, pripocitame s DPH)
    if (konfig.izolacie) celkovaCena += cennik.izolacie * 1.23;
    if (konfig.elektroinst) celkovaCena += cennik.elektroinst * 1.23;
    if (konfig.vodoinst) celkovaCena += cennik.vodoinst * 1.23;
    if (konfig.kanalizacia) celkovaCena += cennik.kanalizacia * 1.23;
    if (konfig.vytranie) celkovaCena += cennik.vytranie * 1.23;
    if (konfig.podkrovie) celkovaCena += cennik.podkrovie * 1.23;
    if (konfig.zateplenie_extra) celkovaCena += cennik.zateplenie_extra * 1.23;
    if (konfig.tepelne_cerpadlo) celkovaCena += cennik.tepelne_cerpadlo * 1.23;
    if (konfig.fotovoltaika) celkovaCena += cennik.fotovoltaika * 1.23;
    if (konfig.projektova_dok) celkovaCena += cennik.projektova_dok; // Now already with DPH
    if (konfig.energeticky_cert) celkovaCena += cennik.energeticky_cert; // Now already with DPH

    const sDPH = celkovaCena;
    const bezDPH = celkovaCena / 1.23;

    return { bezDPH, sDPH };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ceny = vypocitatCenu();
    const konfigText = Object.entries(konfig)
      .filter(([key, value]) => value && value !== "standardne" && value !== "standard" && value !== "bez")
      .map(([key, value]) => `${key}: ${value === true ? 'Áno' : value}`)
      .join('\n');

    createDopytMutation.mutate({
      ...formData,
      typ_dopytu: "konfigurator",
      dom_id: domId,
      konfiguracny_kod: `
DOM: ${dom?.nazov || 'N/A'} (Prosto House)
Základná cena: ${dom?.zakladna_cena?.toLocaleString('sk-SK')} € s DPH

KONFIGURÁCIA:
${konfigText}

CELKOVÁ CENA:
Bez DPH: ${ceny.bezDPH.toFixed(2)} €
S DPH: ${ceny.sDPH.toFixed(2)} €
      `.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam konfigurátor...</p>
        </div>
      </div>
    );
  }

  if (!dom || dom.vyrobca !== "Prosto House") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Neplatný dom</h2>
          <p className="text-gray-500 mb-6">Tento konfigurátor je dostupný len pre domy značky Prosto House.</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const ceny = vypocitatCenu();

  const renderProstoGroupedSummary = () => {
    const categories = [
      {
        title: `${t('phase')} 1: ${t('phase1')}`,
        items: [
          {
            label: t('phAssembly') || "Cena montáže holodomu",
            value: konfig.montaz ? (t('summaryYes') || "Áno") : (t('summaryNo') || "Nie"),
            price: konfig.montaz ? cennikFaza1.montaz * 1.23 : 0,
            isStandard: false,
            hideIfStandard: true,
            active: konfig.montaz
          },
          {
            label: t('entranceDoor') || "Vchodové dvere",
            value: konfig.vstupne_dvere === "standardne" ? (t('standardDoor') || "Štandardné dvere") :
                   konfig.vstupne_dvere === "kovove" ? (t('metalDoor') || "Kovové dvere") : (t('plasticMetalDoor') || "Plastovo-kovové"),
            price: getPriceNested('vstupne_dviere', konfig.vstupne_dvere) * 1.23,
            isStandard: konfig.vstupne_dvere === "standardne"
          },
          {
            label: t('foundations') || "Základy",
            value: konfig.zaklady === "bez" ? (t('summaryNoFoundations') || "Bez základov") :
                   konfig.zaklady === "skrutky" ? (t('summaryGroundScrews') || "Zemné skrutky") :
                   konfig.zaklady === "pasove" ? (t('summaryStripFoundations') || "Pásové základy") : (t('summaryConcreteSlab') || "Základová doska"),
            price: getPriceNested('zaklady', konfig.zaklady) * 1.23,
            isStandard: konfig.zaklady === "bez"
          },
          {
            label: t('facadeLabel') || "Vonkajšia fasáda",
            value: konfig.fasada === "standard" ? (t('facadeStandardDesc') || "Kombinácia antracitového plechu a dreva") :
                   konfig.fasada === "smrekovec" ? (t('facadeWoodDesc') || "Severský smrekovec") :
                   konfig.fasada === "termicky_upravene_drevo" ? (t('summaryThermowood') || "Thermowood") : (t('phKompozitnePanely') || "Kompozitné panely"),
            price: getPriceNested('fasada', konfig.fasada) * 1.23,
            isStandard: konfig.fasada === "standard"
          },
          {
            label: t('windowsLabel') || "Okná",
            value: konfig.okna === "standard" ? (t('standardWindows') || "Plastové, 3-sklo") : (t('phHlinikoveOkna') || "Hliníkové okná"),
            price: getPriceNested('okna', konfig.okna) * 1.23,
            isStandard: konfig.okna === "standard"
          }
        ]
      },
      {
        title: `${t('phase')} 2: ${t('phase2')}`,
        items: [
          { label: t('phExtraInsulation') || "Dodatočná izolácia", value: t('summaryYes') || "Áno", price: cennik.izolacie * 1.23, isStandard: false, active: konfig.izolacie, hideIfStandard: true },
          { label: t('electricalInstallationLabel') || "Elektroinštalácia", value: t('summaryYes') || "Áno", price: cennik.elektroinst * 1.23, isStandard: false, active: konfig.elektroinst, hideIfStandard: true },
          { label: t('phWaterDrainage') || "Vodoinštalácia", value: t('summaryYes') || "Áno", price: cennik.vodoinst * 1.23, isStandard: false, active: konfig.vodoinst, hideIfStandard: true },
          { label: t('sewage') || "Kanalizácia", value: t('summaryYes') || "Áno", price: cennik.kanalizacia * 1.23, isStandard: false, active: konfig.kanalizacia, hideIfStandard: true },
          { label: t('summaryRecuperation') || "Rekuperácia (vetranie)", value: t('summaryYes') || "Áno", price: cennik.vytranie * 1.23, isStandard: false, active: konfig.vytranie, hideIfStandard: true },
          { label: t('phLoftUpgrade') || "Úprava podkrovia", value: t('summaryYes') || "Áno", price: cennik.podkrovie * 1.23, isStandard: false, active: konfig.podkrovie, hideIfStandard: true },
          { label: t('phExtraZateplenie') || "Extra zateplenie", value: t('summaryYes') || "Áno", price: cennik.zateplenie_extra * 1.23, isStandard: false, active: konfig.zateplenie_extra, hideIfStandard: true }
        ]
      },
      {
        title: `${t('phase')} 3: ${t('phase3')}`,
        items: [
          { label: t('summaryHeatPump') || "Tepelné čerpadlo", value: t('summaryYes') || "Áno", price: cennik.tepelne_cerpadlo * 1.23, isStandard: false, active: konfig.tepelne_cerpadlo, hideIfStandard: true },
          { label: t('phPhotovoltaic') || "Fotovoltaický systém", value: t('summaryYes') || "Áno", price: cennik.fotovoltaika * 1.23, isStandard: false, active: konfig.fotovoltaika, hideIfStandard: true },
          { label: t('summaryProjectCert') || "Projektová dokumentácia", value: t('summaryYes') || "Áno", price: cennik.projektova_dok, isStandard: false, active: konfig.projektova_dok, hideIfStandard: true },
          { label: t('energyCertificateA0') || "Energetická certifikácia A0", value: t('summaryYes') || "Áno", price: cennik.energeticky_cert, isStandard: false, active: konfig.energeticky_cert, hideIfStandard: true }
        ]
      }
    ];

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {categories.map((category, idx) => {
          const visibleItems = category.items.filter(item => {
            if (item.condition === false) return false;
            if (item.hideIfStandard) {
              return item.active;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">
                {category.title}
              </div>
              <div className="space-y-2">
                {visibleItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-baseline gap-4 text-xs">
                    <span className="text-slate-505 dark:text-slate-400 font-medium">{item.label}</span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                      {item.price > 0 && (
                        <span className="text-[10px] text-green-600 font-black">
                          (+{item.price.toLocaleString('sk-SK')} €)
                        </span>
                      )}
                      {item.isStandard && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                          {t('summaryInPrice') || "V cene"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť na detail domu
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Konfigurátor Prosto House
              </h1>
            </div>
            {dom && (
              <div className="bg-white rounded-lg p-5 shadow-lg">
                <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide font-semibold">Konfigurujete model:</p>
                <h2 className="text-2xl font-bold text-gray-900">{dom.nazov}</h2>
                <p className="text-gray-700 mt-2 font-medium text-lg">
                  Základná cena: <span className="text-primary font-bold">{dom.zakladna_cena?.toLocaleString('sk-SK')}€ s DPH</span> ({dom.zastavana_plocha}m²)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {!showFormular ? (
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 md:p-12 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-primary mb-3">Základná konfigurácia zahŕňa:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Nosná prefabrikovaná konštrukcia (steny, strecha, podlaha)</li>
                  <li>• Základná tepelná izolácia (150mm steny/strecha, 200mm podlaha)</li>
                  <li>• Strešná krytina (falcovaný plech) a vonkajší plášť (plechová fasáda)</li>
                  <li>• Okná (plastové, 3-sklo) a vchodové dvere (plastové) podľa projektu</li>
                  <li>• Kompletná revízna dokumentácia</li>
                </ul>
              </div>

              {/* Phase 1 */}
              <KonfiguratorProstoHouseFaza1 
                konfig={konfig}
                setKonfig={setKonfig}
                dom={dom}
                cennikFaza1={cennikFaza1}
              />

              {/* Phase 2 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">{t('phase')} 2: {t('phase2')}</h2>
                <div className="space-y-4">
                  {[
                    {key: 'izolacie', label: t('phExtraInsulation') || 'Dodatočná izolácia', cena: cennik.izolacie},
                    {key: 'elektroinst', label: t('electricalInstallationLabel') || 'Elektroinštalácia', cena: cennik.elektroinst},
                    {key: 'vodoinst', label: t('phWaterDrainage') || 'Vodoinštalácia', cena: cennik.vodoinst},
                    {key: 'kanalizacia', label: t('sewage') || 'Kanalizácia', cena: cennik.kanalizacia},
                    {key: 'vytranie', label: t('summaryRecuperation') || 'Rekuperácia (vetranie)', cena: cennik.vytranie},
                    {key: 'podkrovie', label: t('phLoftUpgrade') || 'Úprava podkrovia', cena: cennik.podkrovie},
                    {key: 'zateplenie_extra', label: t('phExtraZateplenie') || 'Extra zateplenie', cena: cennik.zateplenie_extra}
                  ].map(item => (
                    <div key={item.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={konfig[item.key]}
                            onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                          />
                          <Label className="text-base cursor-pointer">{item.label}</Label>
                        </div>
                        <span className="text-green-600 font-extrabold text-lg">+{(item.cena * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 3 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-6">{t('phase')} 3: {t('phase3')}</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                  <h3 className="font-bold text-green-700 mb-2">Pre energetický certifikát A0 potrebujete:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Tepelné čerpadlo alebo fotovoltaiku</li>
                    <li>• Projektovú dokumentáciu</li>
                    <li>• Energetickú certifikáciu</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  {[
                    {key: 'tepelne_cerpadlo', label: t('summaryHeatPump') || 'Tepelné čerpadlo', cena: cennik.tepelne_cerpadlo, a0: true},
                    {key: 'fotovoltaika', label: t('phPhotovoltaic') || 'Fotovoltaický systém', cena: cennik.fotovoltaika, a0: true},
                    {key: 'projektova_dok', label: t('summaryProjectCert') || 'Projektová dokumentácia', cena: cennik.projektova_dok, a0: true, isDPHIncluded: true},
                    {key: 'energeticky_cert', label: t('energyCertificateA0') || 'Energetická certifikácia A0', cena: cennik.energeticky_cert, a0: true, isDPHIncluded: true}
                  ].map(item => (
                    <div key={item.key} className={`border rounded-lg p-4 ${item.a0 ? 'bg-green-50 border-green-300' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={konfig[item.key]}
                            onCheckedChange={(checked) => setKonfig({...konfig, [item.key]: checked})}
                          />
                          <Label className="text-base cursor-pointer font-semibold">{item.label}</Label>
                        </div>
                        <span className="text-green-600 font-extrabold text-lg">
                          +{ (item.isDPHIncluded ? item.cena : item.cena * 1.23).toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} € s DPH
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cenový súhrn */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-primary mb-6">
                <h3 className="text-xl font-bold text-primary mb-4">Cenový súhrn</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Celková cena bez DPH:</span>
                    <span className="font-extrabold text-green-600 text-lg">{ceny.bezDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                  </div>
                  <div className="flex justify-between text-2xl pt-2 border-t">
                    <span className="text-primary font-bold">Celková cena s DPH:</span>
                    <span className="font-extrabold text-green-600 text-2xl">{ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Finálna cena bude upresnená po obhliadke pozemku</p>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg py-6 shadow-lg"
                onClick={() => setShowFormular(true)}
              >
                <Send className="mr-2 w-5 h-5" />
                Ukáž môj dom a pošli mi cenovú ponuku
              </Button>
            </Card>
          </div>
        ) : (
          /* Formulár */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Konfigurácia dokončená!
                </h2>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Orientačná celková cena s DPH:</p>
                  <p className="text-3xl font-extrabold text-green-600">
                    {ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Bez DPH: {ceny.bezDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €)
                  </p>
                </div>
                <p className="text-gray-600">
                  Vyplňte kontaktné údaje a my vám pripravíme presnú cenovú ponuku
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="meno">Meno a priezvisko *</Label>
                  <Input
                    id="meno"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder="Ján Novák"
                    className="mt-2"
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
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="telefon">Telefón *</Label>
                  <Input
                    id="telefon"
                    required
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="+421 900 123 456"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="poznamka">Poznámka (voliteľné)</Label>
                  <Textarea
                    id="poznamka"
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder="Doplňujúce informácie alebo otázky..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFormular(false)}
                    className="flex-1"
                  >
                    Späť na konfiguráciu
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-secondary hover:bg-secondary/90"
                    disabled={createDopytMutation.isPending}
                  >
                    {createDopytMutation.isPending ? "Odosiela sa..." : (
                      <>
                        Poslať cenovú ponuku
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Mobilný Bottom Sheet pre Zhrnutie */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSummaryOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="md:hidden fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 rounded-t-3xl shadow-2xl z-50 flex flex-col pointer-events-auto"
            >
              {/* Handle bar */}
              <div className="w-full flex justify-center py-3 flex-shrink-0 cursor-pointer" onClick={() => setIsMobileSummaryOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-6 pb-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('configurationSummary')}</h3>
                <button onClick={() => setIsMobileSummaryOpen(false)} className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/5 text-sm">
                  <span>Základná cena:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dom?.zakladna_cena?.toLocaleString('sk-SK')} €</span>
                </div>
                {renderProstoGroupedSummary()}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 flex flex-col gap-4 flex-shrink-0 pb-8">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Celková cena s DPH:</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2})} €</span>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileSummaryOpen(false);
                    setShowFormular(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-2xl py-4 shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {t('interestedInOffer') || "Mám záujem o ponuku"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating price bar */}
      {!showFormular && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-40 py-3">
          <div className="container mx-auto px-4">
            {/* Mobile design */}
            <div className="flex md:hidden justify-between items-center w-full">
              <div className="flex flex-col text-left cursor-pointer select-none" onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('configurationSummary')}</span>
                  <motion.div animate={{ rotate: isMobileSummaryOpen ? 180 : 0 }}>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </motion.div>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2})} €
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold px-3 rounded-xl h-10 text-xs shadow-sm hover:bg-slate-100"
                >
                  {t('summary')}
                </Button>
                <Button 
                  onClick={() => setShowFormular(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-4 rounded-xl shadow-lg shadow-primary/20 h-10 text-xs border-0"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {t('interested') || "Mám záujem"}
                </Button>
              </div>
            </div>

            {/* Desktop design */}
            <div className="hidden md:flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Celková cena s DPH:</p>
                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{ceny.sDPH.toLocaleString('sk-SK', {minimumFractionDigits: 2})} €</p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg"
                onClick={() => setShowFormular(true)}
              >
                <Send className="mr-2 w-4 h-4" />
                Ukáž môj dom a pošli mi cenovú ponuku
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}