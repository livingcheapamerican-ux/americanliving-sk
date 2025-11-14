import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock, Home, Settings, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: () => base44.entities.Dom.filter({ popularny: true }, '-poradie'),
  });

  const { data: referencie = [] } = useQuery({
    queryKey: ['referencie-home'],
    queryFn: () => base44.entities.Referencia.filter({ zobrazovat: true }, '-created_date', 3),
  });

  const heroImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
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
      title: "Rýchla výstavba",
      description: "Váš nový dom môže byť hotový za 4-6 mesiacov od začiatku výstavby.",
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: "Energetická efektivita",
      description: "Nízke náklady na vykurovanie a chlladenie. Trieda energetickej účinnosti A.",
      color: "bg-green-500"
    },
    {
      icon: Home,
      title: "Americký dizajn",
      description: "Priestranné interiéry, otvorené dispozície a charakteristický exteriér.",
      color: "bg-purple-500"
    },
    {
      icon: Settings,
      title: "Individuálny prístup",
      description: "Prispôsobíme každý dom presne podľa vašich predstáv a potrieb.",
      color: "bg-orange-500"
    }
  ];

  const proces = [
    { krok: "01", nazov: "Konzultácia", popis: "Spoločne prediskutujeme vaše predstavy a požiadavky" },
    { krok: "02", nazov: "Návrh", popis: "Vytvoríme návrh vrátane vizualizácií a pôdorysov" },
    { krok: "03", nazov: "Povolenia", popis: "Zabezpečíme všetky potrebné stavebné povolenia" },
    { krok: "04", nazov: "Výstavba", popis: "Realizácia výstavby s pravidelnými reportmi" },
    { krok: "05", nazov: "Odovzdanie", popis: "Odovzdanie domu na kľúč a následný servis" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Background Images */}
        {heroImages.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{ zIndex: index === currentSlide ? 1 : 0 }}
          >
            <img
              src={img}
              alt={`American Living Dom ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </motion.div>
        ))}

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Váš americký sen o bývaní
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Priestranne, kvalitne a nízkoenergeticky. Moderné domy v americkom štýle pre vaše pohodlie.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold text-lg px-8 py-6 w-full sm:w-auto">
                  Prezrieť katalóg domov
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Konfigurator")}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-navy font-semibold text-lg px-8 py-6 w-full sm:w-auto">
                  Konfigurovať vlastný dom
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 wood-accent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Prečo American Living?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Prinášame vám spojenie amerického štýlu, moderných technológií a slovenskej precíznosti
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vyhody.map((vyhoda, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 hover:-translate-y-2">
                  <div className={`w-16 h-16 ${vyhoda.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <vyhoda.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{vyhoda.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{vyhoda.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vybrané Modely */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Naše najpopulárnejšie modely
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Každý dom môžete prispôsobiť podľa vašich potrieb v našom konfigurátore
            </p>
          </motion.div>

          {domy.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {domy.map((dom, index) => (
                <motion.div
                  key={dom.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-red text-white px-4 py-2 rounded-full font-semibold text-sm">
                          Populárny
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-navy mb-3 group-hover:text-red transition-colors">
                          {dom.nazov}
                        </h3>
                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{dom.pocet_izieb}</span> izieb
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{dom.uzitkova_plocha}</span> m²
                          </span>
                          <span className="capitalize">{dom.typ}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-500">Cena od</p>
                            <p className="text-2xl font-bold text-navy">
                              {dom.cena_od?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <Button className="bg-navy hover:bg-navy/90">
                            Detail
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">Čoskoro pridáme naše najpopulárnejšie modely.</p>
            </div>
          )}

          <div className="text-center">
            <Link to={createPageUrl("Katalog")}>
              <Button size="lg" className="bg-navy hover:bg-navy/90 text-white font-semibold px-8">
                Zobraziť celý katalóg
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Náš Proces */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Ako to funguje?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Od prvého stretnutia až po odovzdanie kľúčov - transparentný proces v 5 krokoch
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {proces.map((krok, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative mb-12 last:mb-0"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-navy to-navy/80 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {krok.krok}
                  </div>
                  <div className="flex-grow bg-white p-6 rounded-xl shadow-lg border-l-4 border-red">
                    <h3 className="text-2xl font-bold text-navy mb-2">{krok.nazov}</h3>
                    <p className="text-gray-600">{krok.popis}</p>
                  </div>
                </div>
                {index < proces.length - 1 && (
                  <div className="ml-10 w-0.5 h-12 bg-gradient-to-b from-navy/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl("AkoToFunguje")}>
              <Button size="lg" variant="outline" className="border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold px-8">
                Zistiť viac o procese
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Referencie */}
      {referencie.length > 0 && (
        <section className="py-20 bg-[#F9FAFB]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
                Čo hovoria naši klienti
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Spokojnosť našich klientov je našou prioritou
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {referencie.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < ref.hodnotenie ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{ref.text_referencie}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-bold text-navy">{ref.meno_klienta}</p>
                    {ref.lokacia && (
                      <p className="text-sm text-gray-500">{ref.lokacia}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy via-navy to-navy/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 wood-accent opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Začnime spoločne budovať váš sen
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Kontaktujte nás ešte dnes a dohodnite si nezáväznú konzultáciu. 
              Radi vám poradíme a pripravíme ponuku na mieru.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold text-lg px-8 py-6 w-full sm:w-auto">
                  Kontaktovať nás
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Konfigurator")}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-navy font-semibold text-lg px-8 py-6 w-full sm:w-auto">
                  Vyskúšať konfigurátor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}