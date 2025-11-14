import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: () => base44.entities.Dom.filter({ popularny: true }, 'poradie', 6),
  });

  const heroImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
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
      icon: Euro,
      title: "Cena priamo od výrobcu",
      description: "Bez navýšenia! Cenovo dostupný rodinný dom za najlepšie ceny."
    },
    {
      icon: Clock,
      title: "Rýchla výstavba",
      description: "Váš dom môže byť hotový za pár mesiacov. Modulárna konštrukcia šetrí čas."
    },
    {
      icon: Zap,
      title: "Nízkoenergetický A0",
      description: "Možnosť energetického certifikátu A0. Nízke náklady na vykurovanie."
    },
    {
      icon: Shield,
      title: "S kolaudáciou",
      description: "Všetko od projektu po kolaudáciu. Žiadne starosti s úradmi."
    }
  ];

  const sluzby = [
    { 
      icon: Building2, 
      nazov: "Predaj vašej nehnuteľnosti",
      popis: "Realitná kancelária",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=80"
    },
    { 
      icon: Home, 
      nazov: "Výber a nákup pozemku",
      popis: "Nájdeme ideálny pozemok",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80"
    },
    { 
      icon: TrendingUp, 
      nazov: "Vybavenie hypotéky",
      popis: "Finančné služby",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80"
    },
    { 
      icon: FileText, 
      nazov: "Projektová dokumentácia",
      popis: "Kompletný projekt",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80"
    },
    { 
      icon: Shield, 
      nazov: "Stavebné povolenie",
      popis: "Vybavíme za vás",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80"
    },
    { 
      icon: Hammer, 
      nazov: "Výstavba domu",
      popis: "Stavebná firma",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&q=80"
    },
    { 
      icon: Zap, 
      nazov: "Napojenie na inžinierske siete",
      popis: "Kompletné pripojenie",
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80"
    },
    { 
      icon: Key, 
      nazov: "Kolaudácia",
      popis: "Od A po Z",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80"
    }
  ];

  const proces = [
    { 
      cislo: "01", 
      nazov: "Predaj nehnuteľnosti", 
      popis: "Pomôžeme predať vašu súčasnú nehnuteľnosť",
      icon: Building2
    },
    { 
      cislo: "02", 
      nazov: "Výber pozemku", 
      popis: "Nájdeme vám vhodný pozemok z našej ponuky",
      icon: Home
    },
    { 
      cislo: "03", 
      nazov: "Financovanie", 
      popis: "Vyberieme najvhodnejší hypotekárny úver",
      icon: Euro
    },
    { 
      cislo: "04", 
      nazov: "Projektová dokumentácia", 
      popis: "Pripravíme kompletnú projektovú dokumentáciu",
      icon: FileText
    },
    { 
      cislo: "05", 
      nazov: "Stavebné povolenie", 
      popis: "Zabezpečíme stavebné povolenie a úradné potvrdenia",
      icon: Shield
    },
    { 
      cislo: "06", 
      nazov: "Výstavba domu", 
      popis: "Postavíme váš modulárny dom",
      icon: Hammer
    },
    { 
      cislo: "07", 
      nazov: "Napojenie na siete", 
      popis: "Napojíme ho na všetky inžinierske siete",
      icon: Zap
    },
    { 
      cislo: "08", 
      nazov: "Kolaudácia", 
      popis: "Zabezpečíme kolaudáciu a odovzdáme kľúče",
      icon: Key
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {heroImages.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{ zIndex: index === currentSlide ? 1 : 0 }}
          >
            <img src={img} alt={`Modulárny dom ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </motion.div>
        ))}

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Cenovo dostupný rodinný dom
            </h1>
            <p className="text-2xl mb-4 font-semibold text-yellow-400">
              Za cenu priamo od výrobcu! Bez navýšenia!
            </p>
            <p className="text-xl mb-8 text-gray-200">
              Moderný nízkoenergetický dom bez vysokých mesačných splátok. 
              Vyrobených viac ako 700 domov od roku 2008.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg px-8 py-6 w-full sm:w-auto shadow-xl">
                  Zobraziť ponuku
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6 w-full sm:w-auto shadow-xl">
                  Nezáväzná konzultácia
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

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

      {/* Komplexné služby - S OBRÁZKAMI */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Všetko na jednom mieste
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Nie sme len stavebná firma. Poskytujeme <strong className="text-yellow-400">komplexné služby</strong> - 
              od realitnej kancelárie cez finančné poradenstvo až po stavebnú realizáciu.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg font-semibold">
              <div className="flex items-center gap-2 bg-primary px-5 py-2 rounded-full text-white shadow-lg">
                <Building className="w-5 h-5" />
                <span>Stavebná firma</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary px-5 py-2 rounded-full text-white shadow-lg">
                <Building2 className="w-5 h-5" />
                <span>Realitná kancelária</span>
              </div>
              <div className="flex items-center gap-2 bg-accent px-5 py-2 rounded-full text-white shadow-lg">
                <Landmark className="w-5 h-5" />
                <span>Finančné služby</span>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {sluzby.map((sluzba, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden h-full hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer bg-white">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={sluzba.image} 
                      alt={sluzba.nazov}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-lg">
                        <sluzba.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {sluzba.nazov}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">{sluzba.popis}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xl text-gray-300 mb-6">
              <strong className="text-white">Nemusíte vybavovať nič sami.</strong> Postaráme sa o celý proces od A po Z.
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 shadow-xl">
                Začať projekt
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Prečo si vybrať American Living?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              American Living je značka kvality a naše domy sú len od overených dodávateľov
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {vyhody.map((vyhoda, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center h-full hover:shadow-xl transition-all hover:-translate-y-2 bg-white border-2 border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <vyhoda.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{vyhoda.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{vyhoda.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Varovanie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 p-8 shadow-lg">
              <div className="flex gap-4">
                <Shield className="w-12 h-12 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Pozor na zavádzajúce reklamy!
                  </h3>
                  <p className="text-gray-800 mb-3 leading-relaxed font-medium">
                    Zabudnite na zavádzajúce reklamy, ktoré sľubujú domy za nereálne ceny. 
                    U nás máte vždy jasne stanovenú konečnú cenu – <strong className="text-gray-900">žiadne skryté poplatky ani prekvapenia</strong>.
                  </p>
                  <p className="text-gray-800 mb-3 leading-relaxed font-medium">
                    V mnohých prípadoch sú modulárne domy v inzerátoch za nízke ceny použiteľné len ako záhradné chaty, 
                    ktoré nepotrebujú kolaudáciu, stavebné povolenie ani energetický certifikát A0.
                  </p>
                  <p className="text-gray-900 font-bold text-lg">
                    ✓ Naše domy spĺňajú všetky potrebné normy a sú pripravené na kolaudáciu ako plnohodnotné rodinné domy.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Naša ponuka */}
      {domy.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Naša ponuka
              </h2>
              <p className="text-xl text-gray-700">
                Drevodom, ktorý nemusí vyzerať ako drevodom
              </p>
            </motion.div>

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
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 bg-white border-2 border-gray-200">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dom.celorocny && (
                          <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            ✔ CELOROČNÝ
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-gray-600 mb-2 font-semibold">{dom.vyrobca}</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-secondary transition-colors">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Od</p>
                            <p className="text-2xl font-bold text-primary">
                              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 shadow-xl">
                  Zobraziť celý katalóg
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Proces realizácie */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Proces realizácie
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Komplexné služby od A po Z - postaráme sa o všetko
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proces.map((krok, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition-all hover:-translate-y-1 bg-white border-2 border-gray-100">
                  <div className="text-5xl font-bold text-blue-100 mb-4">{krok.cislo}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                    <krok.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{krok.nazov}</h3>
                  <p className="text-sm text-gray-700">{krok.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Moderný nízkoenergetický dom bez vysokých mesačných splátok
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Kontaktujte nás ešte dnes a dohodnite si nezáväznú konzultáciu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+421905138124">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 w-full sm:w-auto shadow-xl">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white font-semibold px-8 w-full sm:w-auto shadow-xl">
                  Kontaktový formulár
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}