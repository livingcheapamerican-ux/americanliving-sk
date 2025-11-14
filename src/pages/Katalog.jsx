
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Filter, Home, Maximize2, CheckCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Katalog() {
  const [kategoriaFilter, setKategoriaFilter] = useState("vsetky");
  const [vyrobcaFilter, setVyrobcaFilter] = useState("vsetci");
  const [typFilter, setTypFilter] = useState("vsetky");
  const [plocharozsah, setPlocharozsah] = useState([18, 200]);
  const [hladanie, setHladanie] = useState("");

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-katalog'],
    queryFn: () => base44.entities.Dom.list('poradie'),
  });

  const filtrovane = domy.filter((dom) => {
    const kategoriaMatch = kategoriaFilter === "vsetky" || dom.kategoria === kategoriaFilter;
    const vyrobcaMatch = vyrobcaFilter === "vsetci" || dom.vyrobca === vyrobcaFilter;
    const typMatch = typFilter === "vsetky" || dom.typ_domu === typFilter;
    const plochaMatch = dom.zastavana_plocha >= plocharozsah[0] && dom.zastavana_plocha <= plocharozsah[1];
    const hladanieMatch = hladanie === "" || dom.nazov.toLowerCase().includes(hladanie.toLowerCase());
    return kategoriaMatch && vyrobcaMatch && typMatch && plochaMatch && hladanieMatch;
  });

  const vyrobcovia = ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  // Počítaj z nefiltrovných domov
  const rodinneDomy = domy.filter(d => d.kategoria === "rodinne_domy");
  const mobilneDomy = domy.filter(d => d.kategoria === "mobilne_domy");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Katalóg domov
            </h1>
            <p className="text-xl text-blue-100">
              Vyberte si zo širokej ponuky modulárnych a mobilných domov od overených výrobcov. 
              Každý dom je pripravený na kolaudáciu.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
            <TabsTrigger value="vsetky" className="text-base">Všetky ({domy.length})</TabsTrigger>
            <TabsTrigger value="rodinne_domy" className="text-base">Rodinné domy ({rodinneDomy.length})</TabsTrigger>
            <TabsTrigger value="mobilne_domy" className="text-base">Mobilné domy ({mobilneDomy.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
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
                      className="pl-10"
                    />
                  </div>
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
                      {vyrobcovia.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
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
                    className="mt-4"
                  />
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
                  }}
                >
                  Resetovať filtre
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Zobrazuje sa <span className="font-bold text-primary">{filtrovane.length}</span> z {domy.length} domov
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow">
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : filtrovane.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filtrovane.map((dom, index) => (
                  <motion.div
                    key={dom.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={dom.hlavny_obrazok}
                            alt={dom.nazov}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 space-y-2">
                            {dom.celorocny && (
                              <div className="bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✔ CELOROČNÝ
                              </div>
                            )}
                            {dom.energeticky_certifikat && (
                              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✔ CERTIFIKÁT A0
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <div className="text-sm text-gray-500 mb-2">{dom.vyrobca}</div>
                          <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                            {dom.nazov}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            {dom.pocet_izieb && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Home className="w-4 h-4" />
                                <span><span className="font-semibold text-primary">{dom.pocet_izieb}</span> izieb</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Maximize2 className="w-4 h-4" />
                              <span><span className="font-semibold text-primary">{dom.zastavana_plocha}</span> m²</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cena od</p>
                              <p className="text-xl font-bold text-primary">
                                {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                              </p>
                            </div>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 group-hover:bg-secondary">
                              Detail
                              <ArrowRight className="ml-1 w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
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
                  }}
                >
                  Resetovať filtre
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
