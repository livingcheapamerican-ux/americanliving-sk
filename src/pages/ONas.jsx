
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Target, Award, Users, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ONas() {
  const hodnoty = [
    {
      icon: Award,
      nazov: "Kvalita a overení výrobcovia",
      popis: "Spolupracujeme len s overenými výrobcami modulárnych domov"
    },
    {
      icon: Shield,
      nazov: "Transparentnosť",
      popis: "Jasné ceny bez skrytých poplatkov. Žiadne prekvapenia."
    },
    {
      icon: Target,
      nazov: "Komplexné služby",
      popis: "Od výberu pozemku až po kolaudáciu. Postaráme sa o všetko."
    },
    {
      icon: Heart,
      nazov: "Spokojnosť klientov",
      popis: "Vaša spokojnosť je našou prioritou. Viac ako 700 realizovaných domov."
    }
  ];

  const statistiky = [
    { cislo: "700+", popis: "Realizovaných domov", icon: "🏠" },
    { cislo: "2008", popis: "Rok založenia", icon: "📅" },
    { cislo: "4", popis: "Overení výrobcovia", icon: "🏭" },
    { cislo: "100%", popis: "S kolaudáciou", icon: "✅" }
  ];

  const vyrobcovia = [
    {
      nazov: "JAK Modules",
      popis: "Špecialista na modulárne domy s možnosťou rýchlej výstavby"
    },
    {
      nazov: "Ticab House",
      popis: "Výrobca kvalitných modulárnych domov s moderným dizajnom"
    },
    {
      nazov: "Prosto House",
      popis: "Jednoduché a funkčné riešenia pre moderné bývanie"
    },
    {
      nazov: "Domki z Gór",
      popis: "Poľský výrobca drevodomov s tradíciou kvality"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-primary to-blue-700 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              O nás
            </h1>
            <p className="text-xl text-white mb-6 font-semibold">
              Distribútor a realizátor stavby modulárnych domov
            </p>
            <p className="text-lg text-gray-100">
              Vyrobených viac ako 700 domov od roku 2008. Sme tu pre vás s poctivým prístupom, 
              kde sa môžete spoľahnúť na transparentnosť a korektnosť.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Štatistiky */}
      <section className="py-16 bg-white">
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
                <Card className="p-8 text-center hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-5xl mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-primary mb-2">{stat.cislo}</div>
                  <p className="text-gray-600 font-medium">{stat.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              Prečo si vybrať American Living?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              American Living je značka kvality a naše domy sú len od overených dodávateľov, ktorí majú svoju históriu a rokmi overené skúsenosti
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-8 mb-16">
            {/* Poctivosť */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  Zabudnite na zavádzajúce reklamy
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Zabudnite na zavádzajúce reklamy, ktoré sľubujú domy za nereálne ceny. 
                  U nás máte vždy <strong>jasne stanovenú konečnú cenu – žiadne skryté poplatky ani prekvapenia</strong>. 
                  Sme tu pre vás s poctivým prístupom, kde sa môžete spoľahnúť na transparentnosť a korektnosť.
                </p>
              </Card>
            </motion.div>

            {/* Zodpovednosť */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Zodpovednosť za stavbu modulárneho domu
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Mnohé spoločnosti predávajú modulárne domy bez upozornenia na legislatívne povinnosti, 
                  čo môže viesť k problémom pri bývaní, pri kolaudácii a pripojení na inžinierske siete.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Často sa stane, že pri najlacnejšej verzii domu zistíte až neskôr, že vám chýbajú dôležité komponenty, 
                  ktoré sú potrebné pre získanie stavebného povolenia a energetického certifikátu A0.
                </p>
                <p className="text-gray-900 font-semibold">
                  ⚠️ Ak nebudete mať modulárny dom správne skolaudovaný, môže byť považovaný za čiernu stavbu!
                </p>
              </Card>
            </motion.div>

            {/* Naše riešenie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <h3 className="text-2xl font-bold text-green-900 mb-6">
                  ✓ Naše domy spĺňajú všetky potrebné normy
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Pripravené na kolaudáciu ako plnohodnotné rodinné domy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Všetky potrebné stavebné povolenia a dokumentácia</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Možnosť energetického certifikátu A0</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Pripojenie na všetky inžinierske siete</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* Naše hodnoty */}
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
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <hodnota.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3">{hodnota.nazov}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{hodnota.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Naši výrobcovia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              Naši výrobcovia
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oficiálny distribútor overených výrobcov modulárnych domov
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {vyrobcovia.map((vyrobca, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-primary mb-2">{vyrobca.nazov}</h3>
                  <p className="text-gray-600">{vyrobca.popis}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              Pripravení na vlastný dom?
            </h2>
            <p className="text-xl mb-8 text-white">
              Kontaktujte nás a spoločne nájdeme ideálne riešenie pre vás
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 w-full sm:w-auto">
                  Zobraziť ponuku
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 w-full sm:w-auto">
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
