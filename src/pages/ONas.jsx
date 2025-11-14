import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Target, Award, Users, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ONas() {
  const { data: referencie = [] } = useQuery({
    queryKey: ['referencie-onas'],
    queryFn: () => base44.entities.Referencia.filter({ zobrazovat: true }, '-created_date', 6),
  });

  const hodnoty = [
    {
      icon: Heart,
      nazov: "Spokojnosť klientov",
      popis: "Vaša spokojnosť je naša priorita. Počúvame vaše potreby a snažíme sa ich naplniť nad očakávania."
    },
    {
      icon: Award,
      nazov: "Kvalita a precíznosť",
      popis: "Používame len overené materiály a technológie. Každý detail má svoj význam."
    },
    {
      icon: Target,
      nazov: "Transparentnosť",
      popis: "Otvorená komunikácia, jasné ceny a pravideln é informovanie o postupe prác."
    },
    {
      icon: Users,
      nazov: "Odborný tím",
      popis: "Tím skúsených profesionálov s vášňou pre kvalitné bývanie a moderný dizajn."
    }
  ];

  const statistiky = [
    { cislo: "150+", popis: "Realizovaných domov", icon: "🏠" },
    { cislo: "98%", popis: "Spokojných klientov", icon: "⭐" },
    { cislo: "12+", popis: "Rokov skúseností", icon: "📅" },
    { cislo: "4-6", popis: "Mesiacov výstavba", icon: "⚡" }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-navy to-navy/90 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              O nás
            </h1>
            <p className="text-xl text-gray-200">
              Sme tím nadšencov, ktorí vám pomáhajú splniť sen o vlastnom dome. 
              Spájame americký štýl s modernou technológiou a slovenskou precíznosťou.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Náš príbeh */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-navy mb-6">
                Náš príbeh
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none"
            >
              <p className="text-gray-700 leading-relaxed mb-6">
                American Living vzniklo z vášne pre kvalitné bývanie a americkú architektúru. 
                Zakladatelia spoločnosti strávili niekoľko rokov v USA, kde sa zamilovali do priestranných 
                domov s otvorenou dispozíciou a charakteristickým dizajnom.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Po návrate na Slovensko videli príležitosť priniesť tento štýl bývania aj sem, 
                ale s dôrazom na energetickú efektivitu a moderné technológie. Kombinujeme to najlepšie 
                z amerického a európskeho prístupu k výstavbe.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Dnes sme hrdí na to, že môžeme pomáhať slovenským rodinám splniť si sen o vlastnom 
                priestrannom a modernom dome. Každý projekt berieme osobne a snažíme sa, aby bol výsledok 
                presne taký, aký si klient predstavoval.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Štatistiky */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {statistiky.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-navy mb-2">{stat.cislo}</div>
                  <p className="text-gray-600 font-medium">{stat.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Naše hodnoty */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-navy mb-4">
              Naše hodnoty
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tieto princípy nás vedú v každom projekte
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {hodnoty.map((hodnota, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <hodnota.icon className="w-8 h-8 text-navy" />
                  </div>
                  <h3 className="text-lg font-bold text-navy mb-3">{hodnota.nazov}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{hodnota.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referencie / Galéria realizácií */}
      {referencie.length > 0 && (
        <section className="py-20 bg-[#F9FAFB]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-navy mb-4">
                Realizácie a referencie
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Naši spokojní klienti sú naša najlepšia vizitka
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {referencie.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                    {ref.obrazky && ref.obrazky.length > 0 && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={ref.obrazky[0]}
                          alt={`Realizácia ${ref.meno_klienta}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < ref.hodnotenie ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-4 flex-grow leading-relaxed">
                        "{ref.text_referencie}"
                      </p>
                      <div className="border-t pt-4">
                        <p className="font-bold text-navy">{ref.meno_klienta}</p>
                        {ref.lokacia && (
                          <p className="text-sm text-gray-500">{ref.lokacia}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-navy to-navy/90 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              Staňte sa súčasťou našej rodiny spokojných klientov
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Tešíme sa, že vám pomôžeme splniť váš sen o novom dome
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold px-8 w-full sm:w-auto">
                  Prezrieť katalóg
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-navy font-semibold px-8 w-full sm:w-auto">
                  Kontaktovať nás
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}