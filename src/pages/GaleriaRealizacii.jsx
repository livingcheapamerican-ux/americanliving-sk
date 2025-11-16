
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Home, Filter, X, MapPin, Ruler, Euro, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GaleriaRealizacii() {
  const [selectedDom, setSelectedDom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    vyrobca: "all",
    searchQuery: "",
    cenaMin: 0,
    cenaMax: 200000,
    plochaMin: 0,
    plochaMax: 300,
    energeticka: "all"
  });

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-galeria'],
    queryFn: () => base44.entities.Dom.list()
  });

  const vyrobcovia = ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"];

  const filteredDomy = useMemo(() => {
    return domy.filter(dom => {
      const matchesVyrobca = filters.vyrobca === "all" || dom.vyrobca === filters.vyrobca;
      const matchesSearch = !filters.searchQuery || 
        dom.nazov?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        dom.popis?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesCena = dom.zakladna_cena >= filters.cenaMin && dom.zakladna_cena <= filters.cenaMax;
      const matchesPlocha = dom.zastavana_plocha >= filters.plochaMin && dom.zastavana_plocha <= filters.plochaMax;
      const matchesEnergia = filters.energeticka === "all" || 
        (filters.energeticka === "eco" && dom.energeticky_certifikat);

      return matchesVyrobca && matchesSearch && matchesCena && matchesPlocha && matchesEnergia;
    });
  }, [domy, filters]);

  const handleOpenDetail = (dom) => {
    setSelectedDom(dom);
    setCurrentImageIndex(0);
  };

  const handleCloseDetail = () => {
    setSelectedDom(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!selectedDom) return;
    const images = [selectedDom.hlavny_obrazok, ...(selectedDom.galeria || [])];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedDom) return;
    const images = [selectedDom.hlavny_obrazok, ...(selectedDom.galeria || [])];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
              Galéria realizácií
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Prezrite si naše zrealizované projekty modulárnych domov
          </p>
        </motion.div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-80 flex-shrink-0"
              >
                <Card className="p-6 sticky top-24 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Filtre</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="mb-2 block">Hľadať</Label>
                    <Input
                      placeholder="Názov modelu..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Výrobca</Label>
                    <Select value={filters.vyrobca} onValueChange={(val) => setFilters({ ...filters, vyrobca: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Všetci výrobcovia</SelectItem>
                        {vyrobcovia.map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      Cena: {formatPrice(filters.cenaMin)} - {formatPrice(filters.cenaMax)}
                    </Label>
                    <Slider
                      min={0}
                      max={200000}
                      step={5000}
                      value={[filters.cenaMin, filters.cenaMax]}
                      onValueChange={([min, max]) => setFilters({ ...filters, cenaMin: min, cenaMax: max })}
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Plocha: {filters.plochaMin} - {filters.plochaMax} m²
                    </Label>
                    <Slider
                      min={0}
                      max={300}
                      step={10}
                      value={[filters.plochaMin, filters.plochaMax]}
                      onValueChange={([min, max]) => setFilters({ ...filters, plochaMin: min, plochaMax: max })}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Energetická trieda
                    </Label>
                    <Select value={filters.energeticka} onValueChange={(val) => setFilters({ ...filters, energeticka: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Všetky</SelectItem>
                        <SelectItem value="eco">Len ekologické (A0/A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setFilters({
                      vyrobca: "all",
                      searchQuery: "",
                      cenaMin: 0,
                      cenaMax: 200000,
                      plochaMin: 0,
                      plochaMax: 300,
                      energeticka: "all"
                    })}
                  >
                    Resetovať filtre
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Houses Grid */}
          <div className="flex-1">
            {!showFilters && (
              <Button
                onClick={() => setShowFilters(true)}
                className="mb-4 lg:hidden bg-primary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Zobraziť filtre
              </Button>
            )}

            <div className="mb-4 text-gray-600">
              Nájdených: <span className="font-semibold text-primary">{filteredDomy.length}</span> domov
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Načítavam galériu...</p>
              </div>
            ) : filteredDomy.length === 0 ? (
              <Card className="p-12 text-center">
                <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenašli sa žiadne domy</h3>
                <p className="text-gray-500">Skúste zmeniť filtre</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDomy.map((dom, index) => (
                  <motion.div
                    key={dom.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      onClick={() => handleOpenDetail(dom)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dom.energeticky_certifikat && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                            <Zap className="w-3 h-3" />
                            ECO A0
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{dom.nazov}</h3>
                        <p className="text-sm text-gray-600 mb-1">{dom.vyrobca}</p>
                        {dom.popis && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{dom.popis}</p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Ruler className="w-4 h-4 text-primary" />
                            <span>{dom.zastavana_plocha} m²</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Euro className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{formatPrice(dom.zakladna_cena)}</span>
                          </div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-red-700">
                          Zobraziť detail
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDom} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedDom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-3">
                  <Home className="w-6 h-6" />
                  {selectedDom.nazov}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Image Gallery */}
                <div className="relative">
                  <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={[selectedDom.hlavny_obrazok, ...(selectedDom.galeria || [])][currentImageIndex]}
                      alt={selectedDom.nazov}
                      className="w-full h-full object-cover"
                    />
                    {([selectedDom.hlavny_obrazok, ...(selectedDom.galeria || [])].length > 1) && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {[selectedDom.hlavny_obrazok, ...(selectedDom.galeria || [])].map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedDom.nazov} ${idx + 1}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-20 w-20 object-cover rounded-lg cursor-pointer transition-all ${
                          currentImageIndex === idx ? 'ring-4 ring-primary' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
                    <h4 className="font-semibold text-gray-800 mb-3">Základné informácie</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Výrobca:</span>
                        <span className="font-semibold">{selectedDom.vyrobca}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Typ:</span>
                        <span className="font-semibold">{selectedDom.typ_domu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Počet izieb:</span>
                        <span className="font-semibold">{selectedDom.pocet_izieb || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Celý rok:</span>
                        <span className="font-semibold">{selectedDom.celorocny ? 'Áno' : 'Nie'}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
                    <h4 className="font-semibold text-gray-800 mb-3">Rozmery a plocha</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zastavaná plocha:</span>
                        <span className="font-semibold">{selectedDom.zastavana_plocha} m²</span>
                      </div>
                      {selectedDom.uzitkova_plocha && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Úžitková plocha:</span>
                          <span className="font-semibold">{selectedDom.uzitkova_plocha} m²</span>
                        </div>
                      )}
                      {selectedDom.rozmery && (
                        <>
                          {selectedDom.rozmery.sirka && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Šírka:</span>
                              <span className="font-semibold">{selectedDom.rozmery.sirka} m</span>
                            </div>
                          )}
                          {selectedDom.rozmery.dlzka && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dĺžka:</span>
                              <span className="font-semibold">{selectedDom.rozmery.dlzka} m</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Floor Plans */}
                {selectedDom.podorysy && selectedDom.podorysy.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Pôdorysy</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedDom.podorysy.map((podorys, idx) => (
                        <img
                          key={idx}
                          src={podorys}
                          alt={`Pôdorys ${idx + 1}`}
                          className="w-full rounded-lg border"
                        />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Description */}
                {selectedDom.popis && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Popis</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedDom.popis}</p>
                  </Card>
                )}

                {/* Price and CTA */}
                <Card className="p-6 bg-gradient-to-r from-gray-900 via-primary to-gray-900 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/90 drop-shadow">Základná cena s DPH</p>
                      <p className="text-3xl font-bold drop-shadow-lg">{formatPrice(selectedDom.zakladna_cena)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="lg" asChild className="shadow-lg">
                        <a href={`tel:+421905138124`}>
                          Zavolať
                        </a>
                      </Button>
                      <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg">
                        Konfigurovať
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
