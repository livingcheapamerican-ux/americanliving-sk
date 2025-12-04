import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Filter, Home, CheckCircle, Search, ArrowUpDown, Plus, Square, LayoutGrid, Trash2, Eye, EyeOff, Grid3x3, Zap, Hammer, Caravan, Building2, TreePine } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Katalog() {
  const location = useLocation();
  const navigate = useNavigate();

  
  // Funkcia na parsovanie URL parametrov
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      kategoria: params.get("kategoria") || "vsetky",
      vyrobca: params.get("vyrobca") || "",
      typ: params.get("typ") || "",
      plocha_min: parseInt(params.get("plocha_min")) || 0,
      plocha_max: parseInt(params.get("plocha_max")) || 200,
      uzitkova_min: parseInt(params.get("uzitkova_min")) || 0,
      uzitkova_max: parseInt(params.get("uzitkova_max")) || 200,
      hladanie: params.get("hladanie") || "",
      cena_min: parseInt(params.get("cena_min")) || 0,
      cena_max: parseInt(params.get("cena_max")) || 200000,
      izby: params.get("izby") || "",
      zoradenie: params.get("zoradenie") || "poradie"
    };
  };

  const initialFilters = getInitialFilters();

  const [kategoriaFilter, setKategoriaFilter] = useState(initialFilters.kategoria);
  const [vyrobcaFilter, setVyrobcaFilter] = useState(initialFilters.vyrobca ? initialFilters.vyrobca.split(',') : []);
  const [typFilter, setTypFilter] = useState(initialFilters.typ ? initialFilters.typ.split(',') : []);
  const [plocharozsah, setPlocharozsah] = useState([initialFilters.plocha_min, initialFilters.plocha_max || 200]);
  const [uzitkovaRozsah, setUzitkovaRozsah] = useState([initialFilters.uzitkova_min, initialFilters.uzitkova_max]);
  const [hladanie, setHladanie] = useState(initialFilters.hladanie);
  const [cenoveRozpatie, setCenoveRozpatie] = useState([initialFilters.cena_min, initialFilters.cena_max || 200000]);
  const [pocetIziebFilter, setPocetIziebFilter] = useState(initialFilters.izby ? initialFilters.izby.split(',').map(Number) : []);
  const [zoradenie, setZoradenie] = useState(initialFilters.zoradenie);
  const [vybraneNaSrovnanie, setVybraneNaSrovnanie] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dizajnFilter, setDizajnFilter] = useState("murovka"); // "murovka" alebo "drevo"

  const queryClient = useQueryClient();

  // Označiť ako inicializované po prvom renderovaní
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Synchronizovať filtre s URL - len po inicializácii
  useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams();
    if (kategoriaFilter !== "vsetky") params.set("kategoria", kategoriaFilter);
    if (vyrobcaFilter.length > 0) params.set("vyrobca", vyrobcaFilter.join(','));
    if (typFilter.length > 0) params.set("typ", typFilter.join(','));
    if (plocharozsah[0] !== 0) params.set("plocha_min", plocharozsah[0].toString());
    if (plocharozsah[1] !== 200) params.set("plocha_max", plocharozsah[1].toString());
    if (uzitkovaRozsah[0] !== 0) params.set("uzitkova_min", uzitkovaRozsah[0].toString());
    if (uzitkovaRozsah[1] !== 200) params.set("uzitkova_max", uzitkovaRozsah[1].toString());
    if (hladanie) params.set("hladanie", hladanie);
    if (cenoveRozpatie[0] !== 0) params.set("cena_min", cenoveRozpatie[0].toString());
    if (cenoveRozpatie[1] !== 200000) params.set("cena_max", cenoveRozpatie[1].toString());
    if (pocetIziebFilter.length > 0) params.set("izby", pocetIziebFilter.join(','));
    if (zoradenie !== "poradie") params.set("zoradenie", zoradenie);

    const newSearch = params.toString();
    const currentSearch = location.search.substring(1);
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
    }
  }, [isInitialized, kategoriaFilter, vyrobcaFilter, typFilter, plocharozsah, uzitkovaRozsah, hladanie, cenoveRozpatie, pocetIziebFilter, zoradenie]);

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-katalog'],
    queryFn: () => base44.entities.Dom.list('poradie')
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const deleteDomMutation = useMutation({
    mutationFn: (domId) => base44.entities.Dom.delete(domId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domy-katalog'] });
    },
  });

  const toggleVerejnyMutation = useMutation({
    mutationFn: ({ domId, verejny }) => base44.entities.Dom.update(domId, { verejny }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domy-katalog'] });
      toast.success(variables.verejny ? 'Dom je teraz verejný' : 'Dom je teraz skrytý');
    },
  });

  const handleDeleteDom = (dom, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Naozaj chcete vymazať dom "${dom.nazov}"?`)) {
      deleteDomMutation.mutate(dom.id);
    }
  };

  const handleToggleVerejny = (dom, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleVerejnyMutation.mutate({ domId: dom.id, verejny: !dom.verejny });
  };

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.super_admin === true;
  const canManage = isAdmin || isSuperAdmin;

  const filtrovane = domy.filter((dom) => {
    // Tab "skryte" zobrazuje len skryté domy, ostatné taby len verejné
    if (kategoriaFilter === "skryte") {
      return dom.verejny === false;
    }
    // Pre ostatné taby zobrazovať len verejné domy
    const verejnyMatch = dom.verejny !== false;
    const kategoriaMatch = kategoriaFilter === "vsetky" || dom.kategoria === kategoriaFilter;
    const vyrobcaMatch = vyrobcaFilter.length === 0 || vyrobcaFilter.includes(dom.vyrobca);
    const typMatch = typFilter.length === 0 || typFilter.includes(dom.typ_domu);
    const plochaMatch = dom.zastavana_plocha >= plocharozsah[0] && dom.zastavana_plocha <= plocharozsah[1];
    const uzitkovaMatch = !dom.uzitkova_plocha || (dom.uzitkova_plocha >= uzitkovaRozsah[0] && dom.uzitkova_plocha <= uzitkovaRozsah[1]);
    const hladanieMatch = hladanie === "" || dom.nazov.toLowerCase().includes(hladanie.toLowerCase());
    const cenaMatch = dom.zakladna_cena >= cenoveRozpatie[0] && dom.zakladna_cena <= cenoveRozpatie[1];
    const izbyMatch = pocetIziebFilter.length === 0 || (dom.pocet_izieb && pocetIziebFilter.includes(dom.pocet_izieb));
    return verejnyMatch && kategoriaMatch && vyrobcaMatch && typMatch && plochaMatch && uzitkovaMatch && hladanieMatch && cenaMatch && izbyMatch;
  });

  // Zoradenie
  const zoradeneDomy = [...filtrovane].sort((a, b) => {
    if (zoradenie === "cena_vzostupne") return a.zakladna_cena - b.zakladna_cena;
    if (zoradenie === "cena_zostupne") return b.zakladna_cena - a.zakladna_cena;
    if (zoradenie === "plocha_vzostupne") return a.zastavana_plocha - b.zastavana_plocha;
    if (zoradenie === "plocha_zostupne") return b.zastavana_plocha - a.zastavana_plocha;
    if (zoradenie === "uzitkova_vzostupne") return (a.uzitkova_plocha || 0) - (b.uzitkova_plocha || 0);
    if (zoradenie === "uzitkova_zostupne") return (b.uzitkova_plocha || 0) - (a.uzitkova_plocha || 0);

    if (zoradenie === "nazov_az") return a.nazov.localeCompare(b.nazov, 'sk');
    if (zoradenie === "nazov_za") return b.nazov.localeCompare(a.nazov, 'sk');
    return (a.poradie || 0) - (b.poradie || 0);
  });

  const vyrobcovia = ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  // Pre počty v taboch použiť len verejné domy
  const verejneDomy = domy.filter((d) => d.verejny !== false);
  const skryteDomy = domy.filter((d) => d.verejny === false);
  const rodinneDomy = verejneDomy.filter((d) => d.kategoria === "rodinne_domy");
  const mobilneDomy = verejneDomy.filter((d) => d.kategoria === "mobilne_domy");

  const toggleSrovnanie = (dom) => {
    if (vybraneNaSrovnanie.find((d) => d.id === dom.id)) {
      setVybraneNaSrovnanie(vybraneNaSrovnanie.filter((d) => d.id !== dom.id));
    } else if (vybraneNaSrovnanie.length < 3) {
      setVybraneNaSrovnanie([...vybraneNaSrovnanie, dom]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-900 py-6 sm:py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl">

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-white">
              Katalóg domov
            </h1>
            <p className="text-sm sm:text-lg text-white font-medium">
              Modulárne a mobilné domy od overených výrobcov.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-4 sm:mb-6">
          <TabsList className={`grid w-full max-w-xl mx-auto h-8 sm:h-10 ${canManage ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="vsetky" className="text-xs sm:text-sm">Všetky ({verejneDomy.length})</TabsTrigger>
            <TabsTrigger value="rodinne_domy" className="text-xs sm:text-sm">Rodinné ({rodinneDomy.length})</TabsTrigger>
            <TabsTrigger value="mobilne_domy" className="text-xs sm:text-sm">Mobilné ({mobilneDomy.length})</TabsTrigger>
            {canManage && (
              <TabsTrigger value="skryte" className="text-xs sm:text-sm">Skryté ({skryteDomy.length})</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 flex-shrink-0">

            <Card className="p-3 sm:p-4 sticky top-16 shadow-lg">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Filter className="w-4 h-4 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-primary">Filtre</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Vyhľadávanie */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hľadať
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      placeholder="Názov..."
                      value={hladanie}
                      onChange={(e) => setHladanie(e.target.value)}
                      className="pl-7 h-8 text-sm" />

                  </div>
                </div>

                {/* Zoradenie */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <ArrowUpDown className="w-3 h-3 inline mr-1" />
                    Zoradiť
                  </label>
                  <Select value={zoradenie} onValueChange={setZoradenie}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poradie">Predvolené</SelectItem>
                      <SelectItem value="cena_vzostupne">Cena: Najlacnejšie</SelectItem>
                      <SelectItem value="cena_zostupne">Cena: Najdrahšie</SelectItem>
                      <SelectItem value="plocha_vzostupne">Zastavaná plocha: Najmenšie</SelectItem>
                      <SelectItem value="plocha_zostupne">Zastavaná plocha: Najväčšie</SelectItem>
                      <SelectItem value="uzitkova_vzostupne">Úžitková plocha: Najmenšie</SelectItem>
                      <SelectItem value="uzitkova_zostupne">Úžitková plocha: Najväčšie</SelectItem>
                      <SelectItem value="nazov_az">Názov: A-Z</SelectItem>
                      <SelectItem value="nazov_za">Názov: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Výrobca */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Výrobca</label>
                  <div className="space-y-1">
                    {vyrobcovia.map((v) => (
                      <div key={v} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`vyrobca-${v}`}
                          checked={vyrobcaFilter.includes(v)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVyrobcaFilter([...vyrobcaFilter, v]);
                            } else {
                              setVyrobcaFilter(vyrobcaFilter.filter((x) => x !== v));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`vyrobca-${v}`} className="text-xs cursor-pointer">{v}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typ domu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Typ</label>
                  <div className="space-y-1">
                    {[
                      { value: "modularny", label: "Modulárny" },
                      { value: "montovany", label: "Montovaný" },
                      { value: "mobilny", label: "Mobilný" }
                    ].map((typ) => (
                      <div key={typ.value} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`typ-${typ.value}`}
                          checked={typFilter.includes(typ.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTypFilter([...typFilter, typ.value]);
                            } else {
                              setTypFilter(typFilter.filter((x) => x !== typ.value));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`typ-${typ.value}`} className="text-xs cursor-pointer">{typ.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cenové rozpätie */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cena: {cenoveRozpatie[0].toLocaleString('sk-SK')} - {cenoveRozpatie[1].toLocaleString('sk-SK')} €
                  </label>
                  <Slider
                    min={0}
                    max={Math.max(...domy.map(d => d.zakladna_cena || 0), 200000)}
                    step={5000}
                    value={cenoveRozpatie}
                    onValueChange={setCenoveRozpatie}
                    className="mt-2" />
                </div>

                {/* Počet izieb */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Izby</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(domy.filter(d => d.pocet_izieb).map(d => d.pocet_izieb))].sort((a, b) => a - b).map((izby) => (
                      <div key={izby} className="flex items-center gap-0.5">
                        <Checkbox
                          id={`izby-${izby}`}
                          checked={pocetIziebFilter.includes(izby)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPocetIziebFilter([...pocetIziebFilter, izby]);
                            } else {
                              setPocetIziebFilter(pocetIziebFilter.filter((x) => x !== izby));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`izby-${izby}`} className="text-xs cursor-pointer">{izby}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zastavaná plocha */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Zast. plocha: {plocharozsah[0]}-{plocharozsah[1]} m²
                  </label>
                  <Slider
                    min={0}
                    max={Math.max(...domy.map(d => d.zastavana_plocha || 0), 200)}
                    step={5}
                    value={plocharozsah}
                    onValueChange={setPlocharozsah}
                    className="mt-2" />
                </div>

                {/* Úžitková plocha */}
                <div className="hidden sm:block">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Úžitk. plocha: {uzitkovaRozsah[0]}-{uzitkovaRozsah[1]} m²
                  </label>
                  <Slider
                    min={0}
                    max={Math.max(...domy.map(d => d.uzitkova_plocha || 0), 200)}
                    step={5}
                    value={uzitkovaRozsah}
                    onValueChange={setUzitkovaRozsah}
                    className="mt-2" />
                </div>

                {/* Reset */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => {
                    setKategoriaFilter("vsetky");
                    setVyrobcaFilter([]);
                    setTypFilter([]);
                    setPlocharozsah([0, Math.max(...domy.map(d => d.zastavana_plocha || 0), 200)]);
                    setUzitkovaRozsah([0, Math.max(...domy.map(d => d.uzitkova_plocha || 0), 200)]);
                    setHladanie("");
                    setCenoveRozpatie([0, Math.max(...domy.map(d => d.zakladna_cena || 0), 200000)]);
                    setPocetIziebFilter([]);
                    setZoradenie("poradie");
                  }}>
                  Reset
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-primary">{zoradeneDomy.length}</span> z {verejneDomy.length} domov
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow">
            {/* Dizajn filter */}
            <Card className="p-2 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base font-semibold text-gray-800">
                  <span>🏠 Zobraziť domy v dizajne:</span>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant={dizajnFilter === "murovka" ? "default" : "outline"}
                    onClick={() => setDizajnFilter("murovka")}
                    className={`px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base font-semibold ${dizajnFilter === "murovka" ? "bg-orange-600 hover:bg-orange-700" : "border-2"}`}
                  >
                    <Building2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Murovka
                  </Button>
                  <Button
                    variant={dizajnFilter === "drevo" ? "default" : "outline"}
                    onClick={() => setDizajnFilter("drevo")}
                    className={`px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base font-semibold ${dizajnFilter === "drevo" ? "bg-amber-600 hover:bg-amber-700" : "border-2"}`}
                  >
                    <TreePine className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Drevený motív
                  </Button>
                </div>
              </div>
            </Card>

            {/* Srovnání panel */}
            {vybraneNaSrovnanie.length > 0 &&
            <Card className="p-4 mb-6 bg-blue-50 border-2 border-primary">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">
                      Vybrané na porovnanie: {vybraneNaSrovnanie.length}/3
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {vybraneNaSrovnanie.length >= 2 &&
                  <Link to={`${createPageUrl("SrovnaniDomu")}?ids=${vybraneNaSrovnanie.map((d) => d.id).join(',')}`}>
                        <Button className="bg-secondary hover:bg-secondary/90">
                          Porovnať domy
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                  }
                    <Button variant="outline" onClick={() => setVybraneNaSrovnanie([])}>
                      Zrušiť výber
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {vybraneNaSrovnanie.map((dom) =>
                <div key={dom.id} className="bg-white px-3 py-1 rounded-full text-sm border border-primary flex items-center gap-2">
                      {dom.nazov}
                      <button onClick={() => toggleSrovnanie(dom)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                )}
                </div>
              </Card>
            }

            {isLoading ?
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6">
                {[...Array(6)].map((_, i) =>
              <Card key={i} className="h-48 sm:h-96 animate-pulse bg-gray-200" />
              )}
              </div> :
            zoradeneDomy.length > 0 ?
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6">

                {zoradeneDomy.map((dom, index) => {
                const jeVybrany = vybraneNaSrovnanie.find((d) => d.id === dom.id);
                return (
                  <motion.div
                    key={dom.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}>

                      <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white ${jeVybrany ? 'ring-2 ring-primary' : ''} ${dom.verejny === false ? 'opacity-60' : ''}`}>
                        <div className="relative h-56 overflow-hidden">
                          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`}>
                            {dom.hlavny_obrazok ? (
                              <img
                                src={dizajnFilter === "drevo" && dom.zakladna_konfiguracia_obrazok ? dom.zakladna_konfiguracia_obrazok : dom.hlavny_obrazok}
                                alt={dom.nazov}
                                className="w-full h-full object-contain bg-gray-100 group-hover:scale-105 transition-all duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Home className="w-16 h-16 text-gray-400" />
                              </div>
                            )}

                          </Link>
                          <div className="absolute top-4 left-4 space-y-2">
                            {dom.celorocny &&
                          <div className="bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✔ CELOROČNÝ
                              </div>
                          }
                            {dom.energeticky_certifikat &&
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✔ CERTIFIKÁT A0
                              </div>
                          }
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                            onClick={() => toggleSrovnanie(dom)}
                            disabled={!jeVybrany && vybraneNaSrovnanie.length >= 3}
                            className={`p-2 rounded-full transition-all ${
                            jeVybrany ?
                            'bg-primary text-white' :
                            'bg-white/90 text-primary hover:bg-primary hover:text-white'} ${
                            !jeVybrany && vybraneNaSrovnanie.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>

                              <Plus className={`w-5 h-5 transition-transform ${jeVybrany ? 'rotate-45' : ''}`} />
                            </button>
                            {canManage && (
                              <button
                                onClick={(e) => handleToggleVerejny(dom, e)}
                                disabled={toggleVerejnyMutation.isPending}
                                title={dom.verejny !== false ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                                className={`p-2 rounded-full transition-all disabled:opacity-50 ${
                                  dom.verejny !== false 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}>
                                {dom.verejny !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                              </button>
                            )}
                            {canManage && (
                              <button
                                onClick={(e) => handleDeleteDom(dom, e)}
                                disabled={deleteDomMutation.isPending}
                                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`}>
                            <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                              {dom.nazov}
                            </h3>
                          </Link>

                          {/* Základné parametre */}
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Home className="w-4 h-4 flex-shrink-0 text-primary" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Výrobca</span>
                                <span className="font-semibold text-primary text-xs">{dom.vyrobca}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              {dom.typ_domu === 'montovany' ? (
                                                                    <Hammer className="w-4 h-4 flex-shrink-0 text-orange-600" />
                                                                  ) : dom.typ_domu === 'mobilny' ? (
                                                                    <Caravan className="w-4 h-4 flex-shrink-0 text-teal-600" />
                                                                  ) : (
                                                                    <LayoutGrid className="w-4 h-4 flex-shrink-0 text-amber-500" />
                                                                  )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Typ domu</span>
                                <span className="font-semibold text-primary text-xs">{dom.typ_domu === 'modularny' ? 'Modulárny dom' : dom.typ_domu === 'montovany' ? 'Montovaný dom' : 'Mobilný dom'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="w-4 h-3 border-2 border-primary rounded-sm flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Zastavaná plocha</span>
                                <span className="font-semibold text-primary text-xs">{dom.zastavana_plocha} m²</span>
                              </div>
                            </div>
                            {dom.uzitkova_plocha && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Square className="w-4 h-4 flex-shrink-0 text-purple-500" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-gray-500">Úžitková plocha</span>
                                  <span className="font-semibold text-primary text-xs">{dom.uzitkova_plocha} m²</span>
                                </div>
                              </div>
                            )}
                            {dom.pocet_izieb && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Grid3x3 className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-gray-500">Počet izieb</span>
                                  <span className="font-semibold text-primary text-xs">{dom.pocet_izieb}</span>
                                </div>
                              </div>
                            )}
                            {dom.energeticky_certifikat && (
                              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                <Zap className="w-4 h-4 flex-shrink-0 text-green-600" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-gray-500">Energetická trieda</span>
                                  <span className="font-semibold text-green-600 text-xs">A0 <span className="text-gray-400 font-normal">príplatková možnosť</span></span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{dom.vyrobca === "Ticab house" ? "Cena základnej konfigurácie" : "Cena od"}</p>
                              <p className="text-xl font-bold text-primary">
                                {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                              </p>
                            </div>
                            <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`}>
                              <Button size="sm" className="bg-primary hover:bg-primary/90 group-hover:bg-secondary">
                                Detail
                                <ArrowRight className="ml-1 w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>);

              })}
              </motion.div> :

            <Card className="p-12 text-center">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Nenašli sa žiadne domy
                </h3>
                <p className="text-gray-500 mb-6">
                  Skúste zmeniť filtre alebo ich resetovať
                </p>
                <Button
                onClick={() => {
                  setKategoriaFilter("vsetky");
                  setVyrobcaFilter([]);
                  setTypFilter([]);
                  setPlocharozsah([18, 200]);
                  setUzitkovaRozsah([0, 200]);
                  setHladanie("");
                  setCenoveRozpatie([15000, 200000]);
                  setPocetIziebRozpatie([1, 8]);
                  setZoradenie("poradie");
                }}>

                  Resetovať filtre
                </Button>
              </Card>
            }
          </div>
        </div>
      </div>
    </div>);

}