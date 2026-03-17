import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calculator, CheckCircle, ChevronDown, ChevronUp,
  ArrowRight, Phone, Zap, Thermometer, Wind, Droplets,
  Layers, Wrench, Truck, FileText, Search
} from "lucide-react";

// ── Doplnky pre Ticab house (čítame priamo z konfigurator_ceny) ──────────────
const TICAB_EXTRAS = [
  { id: "izolacia_stien_200mm",     label: "Izolácia stien 200 mm",          group: "Izolácia",    icon: Layers },
  { id: "izolacia_stien_250mm",     label: "Izolácia stien 250 mm",          group: "Izolácia",    icon: Layers },
  { id: "tepelne_cerpadlo",         label: "Tepelné čerpadlo",                group: "Kúrenie",     icon: Thermometer },
  { id: "rekuperacia",              label: "Rekuperácia (jednotka)",          group: "Kúrenie",     icon: Wind },
  { id: "pripravaNaRekuperaciu",    label: "Príprava na rekuperáciu",         group: "Kúrenie",     icon: Wind },
  { id: "podlahove_kurenie",        label: "Podlahové kúrenie",               group: "Kúrenie",     icon: Thermometer },
  { id: "klimatizacia",             label: "Klimatizácia (príprava)",         group: "Kúrenie",     icon: Wind },
  { id: "odkvapy",                  label: "Odkvapy",                         group: "Exteriér",    icon: Droplets },
  { id: "fasada_omietka",           label: "Fasáda – biela omietka",          group: "Exteriér",    icon: Home },
  { id: "montaz",                   label: "Montáž domu",                     group: "Služby",      icon: Wrench },
  { id: "zaklady_pasove",           label: "Základy – pásové",                group: "Služby",      icon: Layers },
  { id: "zaklady_skrutkovice",      label: "Základy – skrutkové piliere",     group: "Služby",      icon: Layers },
  { id: "doprava",                  label: "Doprava na Slovensko",            group: "Služby",      icon: Truck },
  { id: "inziniering",              label: "Inžiniering (stavebné povolenie)",group: "Dokumentácia",icon: FileText },
  { id: "projekt_a0",               label: "Projekt + energetický certifikát A0", group: "Dokumentácia", icon: FileText },
];

// ── Fixné doplnky pre ostatných výrobcov (orientačné ceny) ──────────────────
const GENERIC_EXTRAS = [
  { id: "podlahove_kurenie",   label: "Podlahové kúrenie",             group: "Kúrenie",      icon: Thermometer, price: 3500 },
  { id: "rekuperacia",         label: "Rekuperácia",                   group: "Kúrenie",      icon: Wind,        price: 2800 },
  { id: "tepelne_cerpadlo",    label: "Tepelné čerpadlo",              group: "Kúrenie",      icon: Thermometer, price: 4200 },
  { id: "klimatizacia",        label: "Klimatizácia",                  group: "Kúrenie",      icon: Wind,        price: 1800 },
  { id: "zaklady_pasove",      label: "Základy – pásové betónové",     group: "Stavba",       icon: Layers,      price: 5000 },
  { id: "montaz",              label: "Montáž / výstavba na kľúč",    group: "Stavba",       icon: Wrench,      price: 8000 },
  { id: "doprava",             label: "Doprava",                       group: "Stavba",       icon: Truck,       price: 1200 },
  { id: "inziniering",         label: "Inžiniering + stavebné povolenie", group: "Dokumentácia", icon: FileText, price: 2500 },
  { id: "projekt",             label: "Projekt + certifikát",          group: "Dokumentácia", icon: FileText,    price: 1900 },
];

const GROUPS = ["Izolácia", "Kúrenie", "Exteriér", "Stavba", "Služby", "Dokumentácia"];

const formatPrice = (p) =>
  p?.toLocaleString("sk-SK", { maximumFractionDigits: 0 }) + " €";

// ── Ticab cena doplnku z konfigurator_ceny ──────────────────────────────────
function getTicabPrice(dom, extraId) {
  const ceny = dom?.konfigurator_ceny || {};
  const map = {
    izolacia_stien_200mm:   ceny.izolacia_stien_200mm,
    izolacia_stien_250mm:   ceny.izolacia_stien_250mm,
    tepelne_cerpadlo:       ceny.tepelne_cerpadlo,
    rekuperacia:            ceny.rekuperacia,
    pripravaNaRekuperaciu:  ceny.pripravaNaRekuperaciu,
    podlahove_kurenie:      ceny.podlahove_kurenie || ceny.podlahoveKurenie,
    klimatizacia:           ceny.klimatizacia,
    odkvapy:                ceny.odkvapy,
    fasada_omietka:         ceny.fasada_omietka || ceny.fasada_murovana,
    montaz:                 ceny.montaz,
    zaklady_pasove:         ceny.zaklady_pasove || ceny.zaklady,
    zaklady_skrutkovice:    ceny.zaklady_skrutkovice,
    doprava:                ceny.doprava,
    inziniering:            ceny.inziniering,
    projekt_a0:             ceny.projekt_a0 || ceny.projektACertifikacia,
  };
  return map[extraId] ?? null;
}

export default function Kalkulacka() {
  const [selectedDomId, setSelectedDomId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState({});

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ["domy-kalkulacka"],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }, "poradie", 100),
    staleTime: 300000,
  });

  const filteredDomy = useMemo(() => {
    if (!searchQuery.trim()) return domy;
    const q = searchQuery.toLowerCase();
    return domy.filter(
      (d) =>
        d.nazov?.toLowerCase().includes(q) ||
        d.vyrobca?.toLowerCase().includes(q)
    );
  }, [domy, searchQuery]);

  const selectedDom = useMemo(
    () => domy.find((d) => d.id === selectedDomId) || null,
    [domy, selectedDomId]
  );

  const isTicab = selectedDom?.vyrobca === "Ticab house";

  // Zostaviť zoznam doplnkov s cenami pre vybraný dom
  const extras = useMemo(() => {
    if (!selectedDom) return [];
    if (isTicab) {
      return TICAB_EXTRAS.map((e) => ({
        ...e,
        price: getTicabPrice(selectedDom, e.id),
      })).filter((e) => e.price !== null && e.price > 0);
    }
    return GENERIC_EXTRAS;
  }, [selectedDom, isTicab]);

  const toggleExtra = (id) =>
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleGroup = (g) =>
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  // Skupiny prítomné v aktuálnych doplnkoch
  const activeGroups = useMemo(
    () => GROUPS.filter((g) => extras.some((e) => e.group === g)),
    [extras]
  );

  // Celková cena
  const totalPrice = useMemo(() => {
    if (!selectedDom) return 0;
    const base = selectedDom.zakladna_cena || 0;
    const extra = extras
      .filter((e) => selectedExtras[e.id])
      .reduce((sum, e) => sum + (e.price || 0), 0);
    return base + extra;
  }, [selectedDom, selectedExtras, extras]);

  const selectedExtrasList = extras.filter((e) => selectedExtras[e.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-800 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-black">Cenová kalkulačka</h1>
          </div>
          <p className="text-red-100 text-lg max-w-2xl">
            Vyberte model domu, pridajte doplnkovú výbavu a okamžite zistite orientačnú celkovú cenu stavby.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* KROK 1 – Výber modelu */}
        <Card className="p-5 shadow-lg">
          <h2 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
            <span className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black">1</span>
            Vyberte model domu
          </h2>
          <p className="text-gray-500 text-sm mb-4 ml-9">Kliknite na model, ktorý vás zaujíma</p>

          {/* Vyhľadávanie */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hľadať podľa názvu alebo výrobcu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredDomy.map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => {
                    setSelectedDomId(dom.id);
                    setSelectedExtras({});
                    setOpenGroups({});
                  }}
                  className={`text-left rounded-xl border-2 transition-all overflow-hidden hover:shadow-md ${
                    selectedDomId === dom.id
                      ? "border-primary shadow-lg bg-primary/5"
                      : "border-gray-200 hover:border-primary/40 bg-white"
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={dom.hlavny_obrazok}
                      alt={dom.nazov}
                      className="w-full h-full object-cover"
                    />
                    {selectedDomId === dom.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-900 leading-tight">{dom.nazov}</p>
                    <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                      <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5">{dom.vyrobca}</Badge>
                      <span className="text-primary font-bold text-sm">
                        od {formatPrice(dom.zakladna_cena)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dom.zastavana_plocha} m²
                      {dom.pocet_izieb ? ` · ${dom.pocet_izieb} izby` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* KROK 2 – Doplnky */}
        <AnimatePresence>
          {selectedDom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-5 shadow-lg">
                <h2 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black">2</span>
                  Doplnková výbava
                </h2>
                <p className="text-gray-500 text-sm mb-4 ml-9">
                  {isTicab
                    ? "Ceny sú načítané priamo z cenníka tohto modelu."
                    : "Orientačné ceny doplnkov (presné ceny po konzultácii)."}
                </p>

                {extras.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">Pre tento model nie sú dostupné doplnky v databáze.</p>
                ) : (
                  <div className="space-y-3">
                    {activeGroups.map((group) => {
                      const groupExtras = extras.filter((e) => e.group === group);
                      const isOpen = openGroups[group] !== false; // default open
                      return (
                        <div key={group} className="border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleGroup(group)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-semibold text-gray-800 text-sm">{group}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="divide-y divide-gray-100">
                              {groupExtras.map((extra) => {
                                const Icon = extra.icon;
                                const checked = !!selectedExtras[extra.id];
                                return (
                                  <label
                                    key={extra.id}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                      checked ? "bg-primary/5" : "hover:bg-gray-50"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={() => toggleExtra(extra.id)}
                                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-800 flex-1">{extra.label}</span>
                                    <span className={`text-sm font-bold flex-shrink-0 ${checked ? "text-primary" : "text-gray-600"}`}>
                                      + {formatPrice(extra.price)}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KROK 3 – Výsledok */}
        <AnimatePresence>
          {selectedDom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-5 shadow-xl border-2 border-primary/30 bg-gradient-to-br from-white to-primary/5">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black">3</span>
                  Orientačná cena
                </h2>

                {/* Zhrnutie */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Základná cena – <strong>{selectedDom.nazov}</strong>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatPrice(selectedDom.zakladna_cena)}
                    </span>
                  </div>

                  {selectedExtrasList.map((e) => (
                    <div key={e.id} className="flex justify-between items-center py-1.5">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {e.label}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        + {formatPrice(e.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Celková cena */}
                <div className="bg-primary text-white rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-200 font-medium">Celková orientačná cena</p>
                    <p className="text-3xl md:text-4xl font-black">{formatPrice(totalPrice)}</p>
                    <p className="text-xs text-red-200 mt-1">s DPH · orientačná cena</p>
                  </div>
                  <Calculator className="w-12 h-12 text-red-300 opacity-60" />
                </div>

                {!isTicab && (
                  <p className="text-xs text-gray-400 mt-3 italic">
                    * Ceny doplnkov sú orientačné. Presná cena závisí od lokality, rozsahu prác a aktuálneho cenníka. Kontaktujte nás pre nezáväznú cenovú ponuku.
                  </p>
                )}

                {/* CTA */}
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <Link to={createPageUrl("Kontakt")}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3">
                      Chcem cenovú ponuku
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="tel:+421905138124">
                    <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3">
                      <Phone className="mr-2 w-4 h-4" />
                      +421 905 138 124
                    </Button>
                  </a>
                </div>

                {/* Link na detail domu */}
                <div className="mt-3 text-center">
                  <Link
                    to={`${createPageUrl("DetailDomu")}?id=${selectedDom.id}`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Zobraziť detailný konfigurátor pre {selectedDom.nazov} →
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}