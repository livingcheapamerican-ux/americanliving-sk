import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Filter, Home, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Katalog() {
  const [typFilter, setTypFilter] = useState("vsetky");
  const [izbFilter, setIzbFilter] = useState("vsetky");
  const [plocharozsah, setPlocharozsah] = useState([50, 300]);

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-katalog'],
    queryFn: () => base44.entities.Dom.list('poradie'),
  });

  const filtrovane = domy.filter((dom) => {
    const typMatch = typFilter === "vsetky" || dom.typ === typFilter;
    const izbMatch = izbFilter === "vsetky" || dom.pocet_izieb === parseInt(izbFilter);
    const plochaMatch = dom.uzitkova_plocha >= plocharozsah[0] && dom.uzitkova_plocha <= plocharozsah[1];
    return typMatch && izbMatch && plochaMatch;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <section className="bg-gradient-to-r from-navy to-navy/90 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Katalóg domov
            </h1>
            <p className="text-xl text-gray-200">
              Vyberte si zo širokej ponuky moderných nízkoenergetických domov v americkom štýle. 
              Každý model možno prispôsobiť vašim potrebám.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <Card className="p-6 sticky top-24 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-navy" />
                <h2 className="text-xl font-bold text-navy">Filtre</h2>
              </div>

              <div className="space-y-6">
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
                      <SelectItem value="bungalov">Bungalov</SelectItem>
                      <SelectItem value="poschodovy">Poschodový</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Počet izieb */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Počet izieb
                  </label>
                  <Select value={izbFilter} onValueChange={setIzbFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vsetky">Všetky</SelectItem>
                      <SelectItem value="3">3 izby</SelectItem>
                      <SelectItem value="4">4 izby</SelectItem>
                      <SelectItem value="5">5 izieb</SelectItem>
                      <SelectItem value="6">6+ izieb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Úžitková plocha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Úžitková plocha: {plocharozsah[0]} - {plocharozsah[1]} m²
                  </label>
                  <Slider
                    min={50}
                    max={300}
                    step={10}
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
                    setTypFilter("vsetky");
                    setIzbFilter("vsetky");
                    setPlocharozsah([50, 300]);
                  }}
                >
                  Resetovať filtre
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Zobrazuje sa <span className="font-bold text-navy">{filtrovane.length}</span> z {domy.length} domov
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <div className="absolute top-4 left-4 bg-navy text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                            {dom.typ}
                          </div>
                          {dom.popularny && (
                            <div className="absolute top-4 right-4 bg-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Populárny
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-red transition-colors">
                            {dom.nazov}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Home className="w-4 h-4" />
                              <span><span className="font-semibold text-navy">{dom.pocet_izieb}</span> izieb</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Maximize2 className="w-4 h-4" />
                              <span><span className="font-semibold text-navy">{dom.uzitkova_plocha}</span> m²</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cena od</p>
                              <p className="text-xl font-bold text-navy">
                                {dom.cena_od?.toLocaleString('sk-SK')} €
                              </p>
                            </div>
                            <Button size="sm" className="bg-navy hover:bg-navy/90 group-hover:bg-red group-hover:border-red">
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
                    setTypFilter("vsetky");
                    setIzbFilter("vsetky");
                    setPlocharozsah([50, 300]);
                  }}
                >
                  Resetovať filtre
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Nenašli ste presne to, čo hľadáte?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Môžeme vytvoriť dom presne podľa vašich predstáv. Kontaktujte nás a spoločne navrhneme váš ideálny domov.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Kontakt")}>
              <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold px-8">
                Kontaktovať nás
              </Button>
            </Link>
            <Link to={createPageUrl("Konfigurator")}>
              <Button size="lg" variant="outline" className="border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold px-8">
                Vyskúšať konfigurátor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}