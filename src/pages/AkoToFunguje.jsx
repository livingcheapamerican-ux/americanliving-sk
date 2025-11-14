
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, FileText, Hammer, Key, Phone, 
  Zap, ThermometerSun, Shield, Clock, CheckCircle, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

export default function AkoToFunguje() {
  const proces = [
    {
      cislo: "01",
      nazov: "Prvá konzultácia",
      popis: "Stretnutie, kde spoločne prediskutujeme vaše predstavy, požiadavky a rozpočet. Poradíme vám s výberom modelu a vysvetlíme celý proces.",
      icon: MessageCircle,
      details: [
        "Konzultácia je úplne nezáväzná a bezplatná",
        "Môžeme sa stretnúť osobne, online alebo telefonicky",
        "Pomôžeme vám vybrať ideálny model z katalógu"
      ]
    },
    {
      cislo: "02",
      nazov: "Návrh a vizualizácie",
      popis: "Na základe vašich požiadaviek vytvoríme detailný návrh vrátane pôdorysov, 3D vizualizácií a technickej dokumentácie.",
      icon: FileText,
      details: [
        "Profesionálne 3D vizualizácie exteriéru a interiéru",
        "Detailné pôdorysy všetkých podlaží",
        "Prispôsobíme návrh podľa vašich pripomienok"
      ]
    },
    {
      cislo: "03",
      nazov: "Stavebné povolenia",
      popis: "Zabezpečíme všetky potrebné stavebné povolenia a dokumentáciu. O administratívu sa postaráme my, vy sa môžete tešiť na nový domov.",
      icon: Shield,
      details: [
        "Vybavíme všetky potrebné povolenia",
        "Komunikácia s úradmi na našej strane",
        "Pravidelné informovanie o priebehu"
      ]
    },
    {
      cislo: "04",
      nazov: "Výstavba",
      popis: "Realizácia výstavby podľa dohodnutého harmonogramu. Pravidelne vás informujeme o postupe prác a kedykoľvek môžete stavbu navštíviť.",
      icon: Hammer,
      details: [
        "Výstavba trvá typicky 4-6 mesiacov",
        "Týždenné reporty s fotkami z výstavby",
        "Osobný stavebný manažér pre vás"
      ]
    },
    {
      cislo: "05",
      nazov: "Odovzdanie na kľúč",
      popis: "Po dokončení výstavby prebehne záverečná prehliadka a odovzdanie domu. Poskytujeme aj pozáručný servis a poradenstvo.",
      icon: Key,
      details: [
        "Kompletná záverečná kontrola kvality",
        "Odovzdanie všetkej dokumentácie",
        "5-ročná záruka a pozáručný servis"
      ]
    }
  ];

  const technologia = [
    {
      icon: Zap,
      nazov: "Energetická efektivita",
      popis: "Naše domy dosahujú energetickú triedu A. Použitím kvalitnej izolácie a moderných technológií výrazne znížite náklady na vykurovanie a chladenie.",
      features: ["Tepelné čerpadlo", "Rekuperácia", "Fotovoltika (možnosť)"]
    },
    {
      icon: ThermometerSun,
      nazov: "Drevostavba",
      popis: "Moderná dreevostavba kombinu je rýchlosť výstavby s výbornou tepelnou izoláciou. Drevo je prírodný, obnoviteľný a ekologický materiál.",
      features: ["Drevený skelet", "Viacvrstvová konštrukcia", "Priedušná konštrukcia"]
    },
    {
      icon: Clock,
      nazov: "Rýchla výstavba",
      popis: "Vďaka prefabrikácii a moderným technológiám dokážeme váš dom postaviť za 4-6 mesiacov od začiatku výstavby na pozemku.",
      features: ["Predvýroba v hale", "Montáž na pozemku", "Menšia závislosť na počasí"]
    }
  ];

  const faq = [
    {
      otazka: "Aká je cena domu na kľúč?",
      odpoved: "Cena závisí od veľkosti domu, štandardu vybavenia a konkrétnych požiadaviek. Orientačne sa ceny pohybujú od 1500-2500 €/m². Presný rozpočet vám pripravíme po konzultácii."
    },
    {
      otazka: "Ako dlho trvá výstavba?",
      odpoved: "Samotná výstavba domu na pozemku trvá 4-6 mesiacov. Celkový čas od podpisu zmluvy po odovzdanie závisí aj od vybavenia stavebného povolenia (cca 2-4 mesiace)."
    },
    {
      otazka: "Môžem si dom prispôsobiť?",
      odpoved: "Áno, každý náš model môžete prispôsobiť podľa svojich predstáv. Môžete meniť dispozíciu, veľkosť miestností, materiály, farby a mnoho ďalšieho."
    },
    {
      otazka: "Aká je životnosť drevostavby?",
      odpoved: "Pri správnej údržbe má drevostavba životnosť viac ako 100 rokov. Moderné technológie a materiály zabezpečujú dlhovekosť porovnateľnú s murovanými domami."
    },
    {
      otazka: "Poskytujete financovanie?",
      odpoved: "Spolupracujeme s viacerými bankami a môžeme vám pomôcť s vybavením hypotéky. Pripravíme všetku potrebnú dokumentáciu pre banku."
    },
    {
      otazka: "Čo všetko zahŕňa cena na kľúč?",
      odpoved: "Cena na kľúč zahŕňa projekt, stavebné povolenie, výstavbu domu, technológie (kúrenie, voda, elektrina), vnútorné omietky a kompletné podlahy. Nezahŕňa pozemok a prípojky inžinierskych sietí."
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
            <p className="text-xl text-white">
              Transparentný proces od prvého stretnutia až po odovzdanie kľúčov. 
              Sme s vami na každom kroku.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proces */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Proces v 5 krokoch
              </h2>
              <p className="text-xl text-gray-700">
                Od sna po realitu - jasný a prehľadný proces
              </p>
            </motion.div>

            <div className="space-y-8">
              {proces.map((krok, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-8 md:w-48 flex-shrink-0 flex items-center justify-center">
                        <div className="text-center">
                          <krok.icon className="w-12 h-12 mx-auto mb-3" />
                          <p className="text-5xl font-bold text-white/60">{krok.cislo}</p>
                        </div>
                      </div>
                      <div className="p-8 flex-grow bg-white">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{krok.nazov}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{krok.popis}</p>
                        <ul className="space-y-2">
                          {krok.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
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
        </div>
      </section>

      {/* Technológia */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Technológia a kvalita
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Používame najmodernejšie technológie a kvalitné materiály pre váš komfort a úspory
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {technologia.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow bg-white">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <tech.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tech.nazov}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{tech.popis}</p>
                  <ul className="space-y-2">
                    {tech.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-xl text-gray-700">
              Odpovede na najčastejšie otázky našich klientov
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                    <span className="text-secondary flex-shrink-0">Q:</span>
                    {item.otazka}
                  </h3>
                  <p className="text-gray-700 leading-relaxed pl-8">
                    {item.odpoved}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Phone className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              Máte ďalšie otázky?
            </h2>
            <p className="text-xl mb-8 text-white">
              Radi vám poradíme a zodpovieme všetky vaše otázky. Kontaktujte nás ešte dnes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold px-8 w-full sm:w-auto">
                  Kontaktovať nás
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-navy font-semibold px-8 w-full sm:w-auto">
                  Prezrieť katalóg
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
