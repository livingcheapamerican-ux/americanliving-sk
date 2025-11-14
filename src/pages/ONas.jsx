import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Users, Award, TrendingUp, CheckCircle, Phone, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ONas() {
  const hodnoty = [
    {
      icon: Shield,
      nadpis: "Transparentnosť",
      popis: "Bez skrytých poplatkov. Žiadne zavádzajúce reklamy. Presné ceny dopredu."
    },
    {
      icon: Award,
      nadpis: "Kvalita",
      popis: "Pracujeme len s overenými výrobcami. Všetky domy spĺňajú legislatívne požiadavky SR."
    },
    {
      icon: Users,
      nadpis: "Profesionalita",
      popis: "Skúsený tím s dlhoročnými skúsenosťami. Komplexná starostlivosť od A po Z."
    },
    {
      icon: TrendingUp,
      nadpis: "Inovácia",
      popis: "Moderné technológie, energetická efektívnosť a udržateľné riešenia."
    }
  ];

  const stats = [
    { cislo: "700+", popis: "Vyrobených domov" },
    { cislo: "2008", popis: "Rok založenia" },
    { cislo: "4", popis: "Overení výrobcovia" },
    { cislo: "100%", popis: "Spokojných klientov" }
  ];

  const vyrobcovia = [
    {
      nazov: "JAK Modules",
      popis: "Špecialisti na modulárne domy s moderným dizajnom a vysokou energetickou účinnosťou.",
      specialita: "Modulárne rodinné domy"
    },
    {
      nazov: "Ticab House",
      popis: "Priekopníci v oblasti mobilných a modulárnych domov s dlhoročnou tradíciou.",
      specialita: "Mobilné a modulárne domy"
    },
    {
      nazov: "Prosto House",
      popis: "Poľský výrobca známy svojou flexibilitou a rýchlou realizáciou projektov.",
      specialita: "Konfigurovateľné modulárne domy"
    },
    {
      nazov: "Domki z Gór",
      popis: "Tradičné horské domy s modernou technológiou a ekologickým prístupom.",
      specialita: "Drevené modulárne domy"
    }
  ];

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
              O nás
            </h1>
            <p className="text-xl md:text-2xl text-white leading-relaxed">
              Sme distribútor a realizátor modulárnych domov s viac ako 15-ročnou 
              históriou. Od roku 2008 sme pomohli stovkám rodín nájsť ich vysnívaný domov.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Naša misia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Naša misia
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Našou misiou je sprístupniť kvalitné bývanie každému. Veríme, že každý si 
                zaslúži svoj vlastný dom bez zbytočných komplikácií, prieťahov a nejasných cien. 
                Preto ponúkame <span className="font-bold text-primary">transparentné služby</span>, 
                <span className="font-bold text-primary"> overených výrobcov</span> a 
                <span className="font-bold text-primary"> komplexnú starostlivosť</span> od začiatku až po kľúče.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-blue-50 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparentnosť</h3>
                <p className="text-gray-700 leading-relaxed">
                  Žiadne skryté poplatky. Žiadne zavádzajúce reklamy. Všetky ceny sú jasné dopredu. 
                  Presne viete, čo dostanete a za koľko.
                </p>
              </Card>
              <Card className="p-6 bg-green-50 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Komplexnosť</h3>
                <p className="text-gray-700 leading-relaxed">
                  Od predaja nehnuteľnosti cez výber pozemku, financovanie, projektovú dokumentáciu 
                  až po kolaudáciu. Všetko na jednom mieste.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Štatistiky */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-bold text-primary mb-2">{stat.cislo}</p>
                <p className="text-gray-700 font-semibold">{stat.popis}</p>
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Naše hodnoty
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Princípy, ktorými sa riadime pri každom projekte
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hodnoty.map((hodnota, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition-shadow bg-white">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <hodnota.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{hodnota.nadpis}</h3>
                  <p className="text-gray-700 leading-relaxed">{hodnota.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Výrobcovia */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Naši partneri
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Spolupracujeme len s overenými výrobcami s dlhoročnou tradíciou
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {vyrobcovia.map((vyrobca, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow h-full bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{vyrobca.nazov}</h3>
                      <p className="text-sm text-primary font-semibold">{vyrobca.specialita}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{vyrobca.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prečo si vybrať nás */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Prečo si vybrať práve nás?
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                "Komplexné služby od predaja nehnuteľnosti až po kolaudáciu",
                "Viac ako 700 vyrobených domov od roku 2008",
                "Transparentné ceny bez skrytých poplatkov",
                "Overení výrobcovia s medzinárodnými certifikátmi",
                "Energetická trieda A0 - minimálne náklady na vykurovanie",
                "5-ročná záruka na všetky domy",
                "Rýchla výstavba za 4-6 mesiacov",
                "Profesionálny tím s dlhoročnými skúsenosťami"
              ].map((bod, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg"
                >
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-gray-800">{bod}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pripravení začať s nami?
            </h2>
            <p className="text-xl mb-8 text-white">
              Kontaktujte nás a spoločne nájdeme riešenie presne pre vás
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-6">
                  Kontaktovať nás
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}