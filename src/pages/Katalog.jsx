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
import { ArrowRight, Filter, Home, CheckCircle, Search, ArrowUpDown, Plus, Square, LayoutGrid, Trash2, Eye, EyeOff, Grid3x3, Zap } from "lucide-react";
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
      vyrobca: params.get("vyrobca") || "vsetci",
      typ: params.get("typ") || "vsetky",
      plocha_min: parseInt(params.get("plocha_min")) || 18,
      plocha_max: parseInt(params.get("plocha_max")) || 200,
      hladanie: params.get("hladanie") || "",
      cena_min: parseInt(params.get("cena_min")) || 15000,
      cena_max: parseInt(params.get("cena_max")) || 200000,
      izby_min: parseInt(params.get("izby_min")) || 1,
      izby_max: parseInt(params.get("izby_max")) || 8,
      zoradenie: params.get("zoradenie") || "poradie"
    };
  };

  const initialFilters = getInitialFilters();

  const [kategoriaFilter, setKategoriaFilter] = useState(initialFilters.kategoria);
  const [vyrobcaFilter, setVyrobcaFilter] = useState(initialFilters.vyrobca);
  const [typFilter, setTypFilter] = useState(initialFilters.typ);
  const [plocharozsah, setPlocharozsah] = useState([initialFilters.plocha_min, initialFilters.plocha_max]);
  const [hladanie, setHladanie] = useState(initialFilters.hladanie);
  const [cenoveRozpatie, setCenoveRozpatie] = useState([initialFilters.cena_min, initialFilters.cena_max]);
  const [pocetIziebRozpatie, setPocetIziebRozpatie] = useState([initialFilters.izby_min, initialFilters.izby_max]);
  const [zoradenie, setZoradenie] = useState(initialFilters.zoradenie);
  const [vybraneNaSrovnanie, setVybraneNaSrovnanie] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
    if (vyrobcaFilter !== "vsetci") params.set("vyrobca", vyrobcaFilter);
    if (typFilter !== "vsetky") params.set("typ", typFilter);
    if (plocharozsah[0] !== 18) params.set("plocha_min", plocharozsah[0].toString());
    if (plocharozsah[1] !== 200) params.set("plocha_max", plocharozsah[1].toString());
    if (hladanie) params.set("hladanie", hladanie);
    if (cenoveRozpatie[0] !== 15000) params.set("cena_min", cenoveRozpatie[0].toString());
    if (cenoveRozpatie[1] !== 200000) params.set("cena_max", cenoveRozpatie[1].toString());
    if (pocetIziebRozpatie[0] !== 1) params.set("izby_min", pocetIziebRozpatie[0].toString());
    if (pocetIziebRozpatie[1] !== 8) params.set("izby_max", pocetIziebRozpatie[1].toString());
    if (zoradenie !== "poradie") params.set("zoradenie", zoradenie);

    const newSearch = params.toString();
    const currentSearch = location.search.substring(1);
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
    }
  }, [isInitialized, kategoriaFilter, vyrobcaFilter, typFilter, plocharozsah, hladanie, cenoveRozpatie, pocetIziebRozpatie, zoradenie]);

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
    const vyrobcaMatch = vyrobcaFilter === "vsetci" || dom.vyrobca === vyrobcaFilter;
    const typMatch = typFilter === "vsetky" || dom.typ_domu === typFilter;
    const plochaMatch = dom.zastavana_plocha >= plocharozsah[0] && dom.zastavana_plocha <= plocharozsah[1];
    const hladanieMatch = hladanie === "" || dom.nazov.toLowerCase().includes(hladanie.toLowerCase());
    const cenaMatch = dom.zakladna_cena >= cenoveRozpatie[0] && dom.zakladna_cena <= cenoveRozpatie[1];
    const izbyMatch = !dom.pocet_izieb || (dom.pocet_izieb >= pocetIziebRozpatie[0] && dom.pocet_izieb <= pocetIziebRozpatie[1]);
    return verejnyMatch && kategoriaMatch && vyrobcaMatch && typMatch && plochaMatch && hladanieMatch && cenaMatch && izbyMatch;
  });

  // Zoradenie
  const zoradeneDomy = [...filtrovane].sort((a, b) => {
    if (zoradenie === "cena_vzostupne") return a.zakladna_cena - b.zakladna_cena;
    if (zoradenie === "cena_zostupne") return b.zakladna_cena - a.zakladna_cena;
    if (zoradenie === "plocha_vzostupne") return a.zastavana_plocha - b.zastavana_plocha;
    if (zoradenie === "plocha_zostupne") return b.zastavana_plocha - a.zastavana_plocha;
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
      <section className="bg-red-900 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl">

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Katalóg domov
            </h1>
            <p className="text-xl text-white font-medium">
              Vyberte si zo širokej ponuky modulárnych a mobilných domov od overených výrobcov.
              Každý dom je pripravený na kolaudáciu.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-8">
          <TabsList className={`grid w-full max-w-xl mx-auto h-12 ${canManage ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="vsetky" className="text-base">Všetky ({verejneDomy.length})</TabsTrigger>
            <TabsTrigger value="rodinne_domy" className="text-base">Rodinné domy ({rodinneDomy.length})</TabsTrigger>
            <TabsTrigger value="mobilne_domy" className="text-base">Mobilné domy ({mobilneDomy.length})</TabsTrigger>
            {canManage && (
              <TabsTrigger value="skryte" className="text-base">Skryté domy ({skryteDomy.length})</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0">

            <Card className="p-6 sticky top-24 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-primary">Filtre</h2>
              </div>

              <div className="space-y-6">
                {/* Vyhľadávanie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hľadať podľa názvu
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Napr. Lyon, London..."
                      value={hladanie}
                      onChange={(e) => setHladanie(e.target.value)}
                      className="pl-10" />

                  </div>
                </div>

                {/* Zoradenie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ArrowUpDown className="w-4 h-4 inline mr-1" />
                    Zoradiť podľa
                  </label>
                  <Select value={zoradenie} onValueChange={setZoradenie}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poradie">Predvolené</SelectItem>
                      <SelectItem value="cena_vzostupne">Cena: Najlacnejšie</SelectItem>
                      <SelectItem value="cena_zostupne">Cena: Najdrahšie</SelectItem>
                      <SelectItem value="plocha_vzostupne">Plocha: Najmenšie</SelectItem>
                      <SelectItem value="plocha_zostupne">Plocha: Najväčšie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Výrobca */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Výrobca
                  </label>
                  <Select value={vyrobcaFilter} onValueChange={setVyrobcaFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vsetci">Všetci výrobcovia</SelectItem>
                      {vyrobcovia.map((v) =>
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Typ domu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Typ domu
                  </label>
                  <Select value={typFilter} onValueChange={setTypFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vsetky">Všetky typy</SelectItem>
                      <SelectItem value="modularny">Rodinný dom</SelectItem>
                      <SelectItem value="mobilny">Mobilný dom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cenové rozpätie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cena: {cenoveRozpatie[0].toLocaleString('sk-SK')} - {cenoveRozpatie[1].toLocaleString('sk-SK')} €
                  </label>
                  <Slider
                    min={15000}
                    max={200000}
                    step={5000}
                    value={cenoveRozpatie}
                    onValueChange={setCenoveRozpatie}
                    className="mt-4" />

                </div>

                {/* Počet izieb */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Počet izieb: {pocetIziebRozpatie[0]} - {pocetIziebRozpatie[1]}
                  </label>
                  <Slider
                    min={1}
                    max={8}
                    step={1}
                    value={pocetIziebRozpatie}
                    onValueChange={setPocetIziebRozpatie}
                    className="mt-4" />

                </div>

                {/* Zastavaná plocha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zastavaná plocha: {plocharozsah[0]} - {plocharozsah[1]} m²
                  </label>
                  <Slider
                    min={18}
                    max={200}
                    step={5}
                    value={plocharozsah}
                    onValueChange={setPlocharozsah}
                    className="mt-4" />

                </div>

                {/* Reset */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setKategoriaFilter("vsetky");
                    setVyrobcaFilter("vsetci");
                    setTypFilter("vsetky");
                    setPlocharozsah([18, 200]);
                    setHladanie("");
                    setCenoveRozpatie([15000, 200000]);
                    setPocetIziebRozpatie([1, 8]);
                    setZoradenie("poradie");
                  }}>

                  Resetovať filtre
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Zobrazuje sa <span className="font-bold text-primary">{zoradeneDomy.length}</span> z {verejneDomy.length} domov
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow">
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
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) =>
              <Card key={i} className="h-96 animate-pulse bg-gray-200" />
              )}
              </div> :
            zoradeneDomy.length > 0 ?
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

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
                                src={dom.hlavny_obrazok}
                                alt={dom.nazov}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/58590b86b_image.png" alt="Montovaný dom" className="w-5 h-5 flex-shrink-0 object-contain" />
                              ) : (
                                <LayoutGrid className="w-4 h-4 flex-shrink-0 text-amber-500" />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Typ domu</span>
                                <span className="font-semibold text-primary text-xs">{dom.typ_domu === 'modularny' ? 'Modulárny dom' : dom.typ_domu === 'montovany' ? 'Montovaný dom' : 'Mobilný dom'}</span>
                              </div>
                            </div>
                            {dom.pocet_izieb && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Grid3x3 className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs text-gray-500">Počet izieb</span>
                                  <span className="font-semibold text-primary text-xs">{dom.pocet_izieb}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="w-4 h-3 border-2 border-primary rounded-sm flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-gray-500">Zastavaná plocha</span>
                                <span className="font-semibold text-primary text-xs">{dom.zastavana_plocha} m²</span>
                              </div>
                            </div>
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
                  setVyrobcaFilter("vsetci");
                  setTypFilter("vsetky");
                  setPlocharozsah([18, 200]);
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