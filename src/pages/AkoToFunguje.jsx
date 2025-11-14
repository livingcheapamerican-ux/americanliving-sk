import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Clock, Zap, Building2, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function AkoToFunguje() {
  const proces = [
    {
      cislo: "01",
      nazov: "Bezplatná konzultácia",
      popis: "Stretnutie v kancelárii alebo online, kde zistíme vaše potreby a požiadavky.",
      detaily: [
        "Určenie rozpočtu a požiadaviek",
        "Výber vhodného modelu domu",
        "Riešenie financovania",
        "Výber alebo nákup pozemku"
      ]
    },
    {
      cislo: "02",
      nazov: "Projektová príprava",
      popis: "Vybavíme všetky potrebné dokumenty a povolenia za vás.",
      detaily: [
        "Projektová dokumentácia",
        "Stavebné povolenie",
        "Geometrický plán",
        "Inžinierske siete"
      ]
    },
    {
      cislo: "03",
      nazov: "Výroba domu",
      popis: "Dom sa vyrába v kontrolovaných podmienkach výrobnej haly.",
      detaily: [
        "Výroba trvá 4-8 týždňov",
        "Kontrola kvality v každej fáze",
        "Nezávislosť na počasí",
        "Presnosť prefabrikácie"
      ]
    },
    {
      cislo: "04",
      nazov: "Montáž na pozemku",
      popis: "Rýchla a efektívna montáž priamo na vašom pozemku.",
      detaily: [
        "Montáž 2-5 dní",
        "Minimálny dopad na okolie",
        "Profesionálny montážny tím",
        "Napojenie na siete"
      ]
    },
    {
      cislo: "05",
      nazov: "Odovzdanie kľúčov",
      popis: "Po kolaudácii odovzdávame váš nový dom pripravený na bývanie.",
      detaily: [
        "Kolaudačné konanie",
        "Záverečná kontrola kvality",
        "Školenie k obsluhe technológií",
        "5-ročná záruka"
      ]
    }
  ];

  const technologie = [
    {
      icon: Zap,
      nazov: "Energetická efektívnosť",
      popis: "Domy dosahujú energetickú triedu A0, čo znamená minimálne náklady na vykurovanie a chladenie."
    },
    {
      icon: Building2,
      nazov: "Moderná drevostavba",
      popis: "Ekologická a udržateľná konštrukcia s výbornou tepelnou izoláciou a dlhou životnosťou."
    },
    {
      icon: Clock,
      nazov: "Rýchla realizácia",
      popis: "Celý proces od objednávky po kolaudáciu trvá 6-10 mesiacov. Samotná montáž len 2-5 dní."
    }
  ];

  const faq = [
    {
      otazka: "Koľko stojí modulárny dom?",
      odpoved: "Ceny sa pohybujú od 15 000 € do 150 000 € s DPH v závislosti od veľkosti a výbavy. Orientačne 1500-2500 €/m² na kľúč."
    },
    {
      otazka: "Ako dlho trvá výstavba?",
      odpoved: "Celý proces vrátane vybavenia povolení trvá 6-10 mesiacov. Samotná výroba 4-8 týždňov a montáž na pozemku 2-5 dní."
    },
    {
      otazka: "Môžem si dom prispôsobiť?",
      odpoved: "Áno! Ponúkame rôzne konfigurácie, materiály fasád, vybavenie a technológie podľa vašich potrieb a rozpočtu."
    },
    {
      otazka: "Pomôžete s financovaním?",
      odpoved: "Áno, spolupracujeme s finančnými poradcami, ktorí vám pomôžu vybaviť hypotéku alebo úver za výhodných podmienok."
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
              Ako to funguje?
            </h1>
            <p className="text-xl md:text-2xl text-white leading-relaxed">
              Jednoduchý a transparentný proces od prvej konzultácie 
              až po odovzdanie kľúčov. Postaráme sa o všetko.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proces výstavby */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Proces realizácie
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              5 jednoduchých krokov k vášmu vysnívanému domu
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8">
            {proces.map((krok, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow bg-white">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-8 md:w-32 flex items-center justify-center">
                      <span className="text-5xl font-bold">{krok.cislo}</span>
                    </div>
                    <div className="flex-grow p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{krok.nazov}</h3>
                      <p className="text-gray-700 mb-4 text-lg">{krok.popis}</p>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {krok.detaily.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technológie */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Moderné technológie
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Využívame najnovšie technológie pre maximálny komfort a úspory
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {technologie.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow text-center bg-white">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <tech.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tech.nazov}</h3>
                  <p className="text-gray-700 leading-relaxed">{tech.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Odpovede na najčastejšie otázky o modulárnych domoch
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.otazka}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.odpoved}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-6">Máte ďalšie otázky?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Kontaktujte nás
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
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
              Začnite s nami ešte dnes
            </h2>
            <p className="text-xl mb-8 text-white">
              Kontaktujte nás a spoločne nájdeme ideálne riešenie pre vás
            </p>
            <Link to={createPageUrl("Katalog")}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-6">
                Zobraziť katalóg domov
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}