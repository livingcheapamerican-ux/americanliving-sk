import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Maximize2, Euro, Zap, Building2, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SrovnaniDomu() {
  const urlParams = new URLSearchParams(window.location.search);
  const ids = urlParams.get('ids')?.split(',') || [];

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-srovnanie', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const result = await base44.entities.Dom.list();
      return result.filter(dom => ids.includes(dom.id));
    },
    enabled: ids.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam domy na porovnanie...</p>
        </div>
      </div>
    );
  }

  if (domy.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <Link to={createPageUrl("Katalog")}>
            <Button variant="ghost" className="text-primary hover:text-primary/80 mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
          <Card className="p-12 text-center max-w-md mx-auto">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Nedostatočný výber</h2>
            <p className="text-gray-500 mb-6">Pre porovnanie vyberte aspoň 2 domy v katalógu.</p>
            <Link to={createPageUrl("Katalog")}>
              <Button className="bg-primary hover:bg-primary/90">
                Prejsť do katalógu
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const parametre = [
    { 
      nazov: "Základná cena",
      icon: Euro,
      getValue: (dom) => `${dom.zakladna_cena?.toLocaleString('sk-SK')} €`,
      compare: (a, b) => a.zakladna_cena - b.zakladna_cena
    },
    { 
      nazov: "Zastavaná plocha",
      icon: Maximize2,
      getValue: (dom) => `${dom.zastavana_plocha} m²`,
      compare: (a, b) => b.zastavana_plocha - a.zastavana_plocha
    },
    { 
      nazov: "Úžitková plocha",
      icon: Maximize2,
      getValue: (dom) => dom.uzitkova_plocha ? `${dom.uzitkova_plocha} m²` : 'Neuvedené',
      compare: (a, b) => (b.uzitkova_plocha || 0) - (a.uzitkova_plocha || 0)
    },
    { 
      nazov: "Počet izieb",
      icon: Home,
      getValue: (dom) => dom.pocet_izieb ? `${dom.pocet_izieb}` : 'Neuvedené',
      compare: (a, b) => (b.pocet_izieb || 0) - (a.pocet_izieb || 0)
    },
    { 
      nazov: "Výrobca",
      icon: Building2,
      getValue: (dom) => dom.vyrobca
    },
    { 
      nazov: "Typ domu",
      icon: Building2,
      getValue: (dom) => dom.typ_domu === 'modularny' ? 'Rodinný dom' : 'Mobilný dom'
    },
    { 
      nazov: "Celoročný",
      icon: CheckCircle,
      getValue: (dom) => dom.celorocny ? '✓ Áno' : '✗ Nie'
    },
    { 
      nazov: "Energetický certifikát",
      icon: Zap,
      getValue: (dom) => dom.energeticky_certifikat ? '✓ A0' : '✗ Nie'
    },
    { 
      nazov: "Výška stropu",
      icon: Maximize2,
      getValue: (dom) => dom.vyska_stropu || 'Neuvedené'
    }
  ];

  const getBestValue = (param, domy) => {
    if (!param.compare) return null;
    const sorted = [...domy].sort(param.compare);
    return sorted[0]?.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to={createPageUrl("Katalog")}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Porovnanie domov
            </h1>
            <p className="text-xl text-blue-100">
              Porovnajte {domy.length} vybraté domy podľa kľúčových parametrov
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Desktop view - table */}
        <div className="hidden lg:block">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50">
              <div className="p-6 border-r border-gray-200">
                <h3 className="font-bold text-gray-700">Parameter</h3>
              </div>
              {domy.map((dom) => (
                <div key={dom.id} className="p-6 border-r border-gray-200 last:border-r-0">
                  <div className="relative">
                    <img
                      src={dom.hlavny_obrazok}
                      alt={dom.nazov}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-primary text-lg mb-2">{dom.nazov}</h3>
                    <p className="text-sm text-gray-600 mb-3">{dom.vyrobca}</p>
                    <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        Zobraziť detail
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-200">
              {parametre.map((param, idx) => {
                const bestId = getBestValue(param, domy);
                return (
                  <div key={idx} className="grid grid-cols-4 hover:bg-gray-50 transition-colors">
                    <div className="p-4 border-r border-gray-200 flex items-center gap-2">
                      <param.icon className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">{param.nazov}</span>
                    </div>
                    {domy.map((dom) => {
                      const isBest = bestId === dom.id;
                      return (
                        <div 
                          key={dom.id} 
                          className={`p-4 border-r border-gray-200 last:border-r-0 ${isBest ? 'bg-green-50' : ''}`}
                        >
                          <span className={`${isBest ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                            {param.getValue(dom)}
                          </span>
                          {isBest && <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Mobile view - cards */}
        <div className="lg:hidden space-y-6">
          {domy.map((dom, domIdx) => (
            <motion.div
              key={dom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domIdx * 0.1 }}
            >
              <Card className="overflow-hidden">
                <img
                  src={dom.hlavny_obrazok}
                  alt={dom.nazov}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">{dom.nazov}</h3>
                  <p className="text-gray-600 mb-4">{dom.vyrobca}</p>

                  <div className="space-y-3 mb-4">
                    {parametre.map((param, idx) => {
                      const bestId = getBestValue(param, domy);
                      const isBest = bestId === dom.id;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${isBest ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <param.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{param.nazov}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isBest ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                              {param.getValue(dom)}
                            </span>
                            {isBest && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Zobraziť detail domu
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-white">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Našli ste svoj vysnívaný dom?
            </h3>
            <p className="text-gray-700 mb-6">
              Kontaktujte nás a my vám pomôžeme s výberom a realizáciou.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
                  Kontaktovať nás
                </Button>
              </Link>
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Späť do katalógu
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}