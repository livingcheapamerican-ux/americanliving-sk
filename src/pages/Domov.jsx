import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, ArrowRight, CheckCircle, Clock, Shield, Zap, 
  FileText, Building2, Key, Phone, Mail 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: popularneDomy = [] } = useQuery({
    queryKey: ['popularne-domy'],
    queryFn: async () => {
      const domy = await base44.entities.Dom.filter({ popularny: true });
      return domy.slice(0, 6);
    },
  });

  const heroImages = [
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/b12b0e8b3_1.png",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/b12b0e8b3_2.png",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/b12b0e8b3_3.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const vyhody = [
    {
      icon: Clock,
      nadpis: "Rýchla výstavba",
      popis: "Váš vysnívaný dom môže stáť už za 4-6 mesiacov. Modulárna konštrukcia šetrí čas bez kompromisov v kvalite."
    },
    {
      icon: Shield,
      nadpis: "5-ročná záruka",
      popis: "Garantujeme kvalitu každého domu. Na všetky naše projekty poskytujeme komplexnú 5-ročnú záruku."
    },
    {
      icon: Zap,
      nadpis: "Energetická trieda A0",
      popis: "Naše domy dosahujú najvyššiu energetickú triedu A0, čo znamená minimálne náklady na vykurovanie."
    },
    {
      icon: CheckCircle,
      nadpis: "Pripravené na kolaudáciu",
      popis: "Všetky naše domy spĺňajú legislatívne požiadavky SR a sú pripravené na kolaudáciu ako rodinný dom."
    }
  ];

  const komplexneSluzby = [
    { icon: Home, nazov: "Predaj nehnuteľnosti", popis: "Pomôžeme vám predať vašu súčasnú nehnuteľnosť" },
    { icon: Building2, nazov: "Výber pozemku", popis: "Nájdeme ideálny pozemok pre váš nový dom" },
    { icon: FileText, nazov: "Vybavenie hypotéky", popis: "Finančné poradenstvo a hypotekárne služby" },
    { icon: CheckCircle, nazov: "Projektová dokumentácia", popis: "Kompletná príprava projektu" },
    { icon: Shield, nazov: "Stavebné povolenie", popis: "Vybavíme všetky povolenia za vás" },
    { icon: Building2, nazov: "Výstavba domu", popis: "Realizácia od základov po kľúč" },
    { icon: Zap, nazov: "Inžinierske siete", popis: "Napojenie na vodu, elektrinu, plyn" },
    { icon: Key, nazov: "Kolaudácia", popis: "Odovzdanie domu s kolaudačným rozhodnutím" }
  ];

  const proces = [
    { cislo: "01", nazov: "Konzultácia", popis: "Stretnutie a zistenie vašich požiadaviek" },
    { cislo: "02", nazov: "Výber domu", popis: "Spoločný výber modelu a konfigurácie" },
    { cislo: "03", nazov: "Vybavenie formalít", popis: "Povolenia, financovanie, dokumentácia" },
    { cislo: "04", nazov: "Výstavba", popis: "Profesionálna realizácia za 4-6 mesiacov" },
    { cislo: "05", nazov: "Odovzdanie kľúčov", popis: "Kolaudácia a nasťahovanie" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>
        ))}

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Váš vysnívaný dom <br />za <span className="text-yellow-400">4-6 mesiacov</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Distribútor a realizátor modulárnych domov. Vyrobených viac ako 700 domov od roku 2008.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg px-8 py-6">
                  Zobraziť katalóg domov
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6">
                  Kontaktovať nás
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { hodnota: "700+", popis: "Vyrobených domov" },
              { hodnota: "4-6", popis: "Mesiacov výstavba" },
              { hodnota: "4", popis: "Overení výrobcovia" },
              { hodnota: "A0", popis: "Energetická trieda" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.hodnota}</p>
                <p className="text-gray-700 font-medium">{stat.popis}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Populárne domy */}
      {popularneDomy.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Najpopulárnejšie modely
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Presvedčte sa o kvalite našich najobľúbenejších domov
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularneDomy.map((dom, index) => (
                <motion.div
                  key={dom.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dom.popularny && (
                          <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                            ⭐ Populárny
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-gray-600 mb-2">{dom.vyrobca}</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                          <span>{dom.zastavana_plocha} m²</span>
                          {dom.pocet_izieb && <span>{dom.pocet_izieb} izby</span>}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Cena od</p>
                            <p className="text-xl font-bold text-primary">
                              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Zobraziť všetky domy
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Výhody */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Prečo si vybrať nás?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Transparentnosť, kvalita a profesionalita na prvom mieste
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vyhody.map((vyhoda, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition-shadow bg-white">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <vyhoda.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{vyhoda.nadpis}</h3>
                  <p className="text-gray-700 leading-relaxed">{vyhoda.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Komplexné služby */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Komplexné služby na kľúč
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Od predaja nehnuteľnosti cez výber pozemku až po kolaudáciu. Postaráme sa o všetko.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {komplexneSluzby.map((sluzba, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <sluzba.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{sluzba.nazov}</h3>
                  <p className="text-sm text-gray-700">{sluzba.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proces */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ako to funguje?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Jednoduchý 5-krokový proces od konzultácie po kľúče
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {proces.map((krok, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                    {krok.cislo}
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{krok.nazov}</h3>
                  <p className="text-gray-700 text-lg">{krok.popis}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Začnite s nami ešte dnes
            </h2>
            <p className="text-xl mb-8 text-white">
              Kontaktujte nás a my vám pripravíme nezáväznú cenovú ponuku presne podľa vašich predstáv
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+421905138124">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-6">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6">
                  <Mail className="mr-2 w-5 h-5" />
                  Napíšte nám
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}