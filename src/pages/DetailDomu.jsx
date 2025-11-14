import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Home, Maximize2, Bed, Zap, Clock, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function DetailDomu() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPodorys, setShowPodorys] = useState(false);

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-detail', domId],
    queryFn: async () => {
      if (!domId) return null;
      const domy = await base44.entities.Dom.filter({ id: domId });
      return domy[0] || null;
    },
    enabled: !!domId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam detail domu...</p>
        </div>
      </div>
    );
  }

  if (!dom) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Dom sa nenašiel</h2>
          <p className="text-gray-500 mb-6">Požadovaný dom neexistuje alebo bol odstránený.</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-navy hover:bg-navy/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const allImages = dom.galeria && dom.galeria.length > 0 
    ? [dom.hlavny_obrazok, ...dom.galeria]
    : [dom.hlavny_obrazok];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to={createPageUrl("Katalog")}>
            <Button variant="ghost" className="text-navy hover:text-navy/80">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ľavý stĺpec - Galéria */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Hlavný obrázok */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
              <img
                src={allImages[selectedImage]}
                alt={`${dom.nazov} - obrázok ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              {dom.popularny && (
                <Badge className="absolute top-4 right-4 bg-red text-white px-4 py-2 text-sm">
                  Populárny model
                </Badge>
              )}
            </div>

            {/* Miniatúry */}
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-navy shadow-lg scale-105'
                      : 'border-gray-200 hover:border-navy/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatúra ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Pôdorys */}
            {dom.podorys_url && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-navy mb-4">Pôdorys</h3>
                <button
                  onClick={() => setShowPodorys(true)}
                  className="relative w-full aspect-[4/3] rounded-lg overflow-hidden group"
                >
                  <img
                    src={dom.podorys_url}
                    alt="Pôdorys"
                    className="w-full h-full object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg">
                      <p className="text-sm font-semibold text-navy">Kliknite pre zväčšenie</p>
                    </div>
                  </div>
                </button>
              </Card>
            )}
          </motion.div>

          {/* Pravý stĺpec - Informácie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Hlavička */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-navy/10 text-navy border border-navy/20 px-3 py-1">
                  {dom.typ === 'bungalov' ? 'Bungalov' : 'Poschodový dom'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
                {dom.nazov}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">Cena od</span>
                <span className="text-4xl font-bold text-navy">
                  {dom.cena_od?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-sm text-gray-500">s DPH</span>
              </div>
            </div>

            {/* Parametre */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy mb-4">Základné parametre</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-8 h-8 text-navy" />
                  <div>
                    <p className="text-sm text-gray-500">Počet izieb</p>
                    <p className="text-xl font-bold text-navy">{dom.pocet_izieb}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Maximize2 className="w-8 h-8 text-navy" />
                  <div>
                    <p className="text-sm text-gray-500">Úžitková plocha</p>
                    <p className="text-xl font-bold text-navy">{dom.uzitkova_plocha} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Energetická trieda</p>
                    <p className="text-xl font-bold text-navy">A</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-navy" />
                  <div>
                    <p className="text-sm text-gray-500">Výstavba</p>
                    <p className="text-xl font-bold text-navy">4-6 mes.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Popis */}
            {dom.popis && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-navy mb-4">Popis domu</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {dom.popis}
                </p>
              </Card>
            )}

            {/* Výhody */}
            {dom.vyhody && dom.vyhody.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-navy mb-4">Výhody tohto modelu</h3>
                <ul className="space-y-3">
                  {dom.vyhody.map((vyhoda, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{vyhoda}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 sticky top-24">
              <Link to={createPageUrl("Konfigurator")}>
                <Button size="lg" className="w-full bg-red hover:bg-red/90 text-white font-semibold text-lg py-6">
                  Prispôsobiť tento dom v konfigurátore
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="w-full border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold text-lg py-6">
                  Popýtať si viac informácií
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pôdorys Dialog */}
      <Dialog open={showPodorys} onOpenChange={setShowPodorys}>
        <DialogContent className="max-w-6xl">
          <button
            onClick={() => setShowPodorys(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={dom.podorys_url}
            alt="Pôdorys"
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}