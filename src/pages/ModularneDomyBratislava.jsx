import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, ArrowRight, Building2, Euro, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function ModularneDomyBratislava() {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = `${t('modularHomesBratislava')} - American Living`;
    const metaDescription = document.querySelector('meta[name="description"]');
    const desc = t('modularHomesBratislavaMetaDesc');
    if (metaDescription) {
      metaDescription.setAttribute('content', desc);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = desc;
      document.head.appendChild(meta);
    }
  }, [language, t]);

  const { data: domy = [] } = useQuery({
    queryKey: ['domy-bratislava'],
    queryFn: async () => {
      const all = await base44.entities.Dom.filter({ verejny: true }, 'poradie', 50);
      return all.slice(0, 9);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">{t('modularHomesBratislava')}</h1>
            </div>
            <p className="text-xl mb-6">{t('modularHomesBratislavaSubtitle')}</p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                  {t('showOffer')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-700">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Intro text */}
        <div className="max-w-4xl mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">{t('whyModularHomesBratislava')}</h2>
          <div className="prose prose-lg">
            <p className="text-gray-700 leading-relaxed mb-4">{t('bratislavaIntro1')}</p>
            <p className="text-gray-700 leading-relaxed mb-4">{t('bratislavaIntro2')}</p>
          </div>
        </div>

        {/* Výhody */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Building2 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('fastConstruction')}</h3>
            <p className="text-gray-600">{t('bratislavaFast')}</p>
          </Card>
          <Card className="p-6">
            <Euro className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('affordablePrices')}</h3>
            <p className="text-gray-600">{t('bratislavaPrice')}</p>
          </Card>
          <Card className="p-6">
            <Clock className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('quickDelivery')}</h3>
            <p className="text-gray-600">{t('bratislavaDelivery')}</p>
          </Card>
        </div>

        {/* Domy */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{t('popularModelsBratislava')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {domy.slice(0, 6).map((dom) => (
              <Link key={dom.id} to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative h-48">
                    <img src={dom.hlavny_obrazok} alt={dom.nazov} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary">{dom.nazov}</h3>
                    <p className="text-sm text-gray-600 mb-2">{dom.vyrobca}</p>
                    <p className="text-xl font-bold text-primary">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-8 bg-gradient-to-r from-red-600 to-red-700 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{t('interestedInModularHome')}</h2>
          <p className="text-xl mb-6">{t('contactUsBratislava')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+421905138124">
              <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                <Phone className="mr-2" />
                +421 905 138 124
              </Button>
            </a>
            <a href="mailto:info@americanliving.sk">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-700">
                <Mail className="mr-2" />
                info@americanliving.sk
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}