import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle, Home, Zap, Clock, Shield, Euro,
  FileText, Hammer, Key, Phone, Building2, ChevronRight, Building, Landmark, TrendingUp, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import HeroSettingsManager from "../components/admin/HeroSettingsManager";

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
];

export default function Domov() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-popularne'],
    queryFn: async () => {
      const all = await base44.entities.Dom.filter({ popularny: true }, 'poradie', 20);
      return all.filter(dom => dom.verejny !== false).slice(0, 6);
    },
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: heroSettings } = useQuery({
    queryKey: ['site-settings', 'hero'],
    queryFn: async () => {
      const settings = await base44.entities.SiteSettings.filter({ klic: 'hero_settings' });
      return settings[0] || null;
    },
  });


  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const heroImages = heroSettings?.hero_images?.length > 0 
    ? heroSettings.hero_images 
    : DEFAULT_HERO_IMAGES;
  
  const heroInterval = heroSettings?.hero_interval || 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, heroInterval);
    return () => clearInterval(interval);
  }, [heroImages.length, heroInterval]);

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
    <div className="min-h-screen -mt-10 sm:-mt-12 md:-mt-14 lg:-mt-16">
      {/* Admin Settings Panel */}
      {isAdmin && showSettings && (
        <div className="container mx-auto px-4 py-8">
          <HeroSettingsManager 
            settings={heroSettings} 
            onUpdate={() => setShowSettings(false)} 
          />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[450px] overflow-hidden">
        {/* Admin toggle button */}
        {isAdmin && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all"
            title="Nastavenia hero sekcie"
          >
            <Settings className={`w-5 h-5 ${showSettings ? 'text-purple-600' : 'text-gray-600'}`} />
          </button>
        )}
        
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ 
              zIndex: index === currentSlide ? 1 : 0,
              opacity: index === currentSlide ? 1 : 0 
            }}
          >
            <img src={img} alt={`Modulárny dom ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight drop-shadow-lg">
              Cenovo dostupný rodinný dom
            </h1>
            <p className="text-lg sm:text-xl mb-3 sm:mb-4 font-bold text-yellow-300 drop-shadow-lg">
              Za cenu priamo od výrobcu! Bez navýšenia!
            </p>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-100 leading-relaxed drop-shadow-md">
              Všetko, čo potrebujete, máte presne tu! Naši kolegovia sa postarajú o kompletné vybavenie.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link to={createPageUrl("Katalog")}>
                <Button size="default" className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-2 sm:py-3 w-full sm:w-auto shadow-xl">
                  Zobraziť ponuku
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="default" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-sm sm:text-base px-5 sm:px-6 py-2 sm:py-3 w-full sm:w-auto shadow-xl">
                  Konzultácia
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
      <section className="py-10 sm:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
                Všetko na jednom mieste
              </h2>
            <p className="text-sm sm:text-base text-gray-200 max-w-3xl mx-auto mb-4">
              Poskytujeme <strong className="text-yellow-300">komplexné služby</strong> - 
              od realitnej kancelárie cez finančné poradenstvo až po stavebnú realizáciu.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full text-white shadow-lg">
                <Building className="w-3.5 h-3.5" />
                <span>Stavebná firma</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-white shadow-lg">
                <Building2 className="w-3.5 h-3.5" />
                <span>Realitná kancelária</span>
              </div>
              <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-full text-white shadow-lg">
                <Landmark className="w-3.5 h-3.5" />
                <span>Finančné služby</span>
              </div>
            </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto mb-6 sm:mb-10">
            {sluzby.map((sluzba, index) => (
              <div key={index}>
                <Card className="group overflow-hidden h-full hover:shadow-2xl transition-shadow cursor-pointer bg-white">
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    <img 
                      src={sluzba.image} 
                      alt={sluzba.nazov}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <sluzba.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-2">
                      {sluzba.nazov}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium hidden sm:block">{sluzba.popis}</p>
                  </div>
                  </Card>
                  </div>
                  ))}
                  </div>

                  <div className="text-center">
            <p className="text-xl text-gray-200 mb-6">
              <strong className="text-white">Vy nemusíte vybavovať nič.</strong> Postaráme sa o celý proces od A po Z.
            </p>
            <Link to={createPageUrl("Kontakt")}>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 shadow-xl">
                Začať projekt
                <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                </Link>
                </div>
        </div>
      </section>

      {/* Prečo American Living */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Prečo American Living?
              </h2>
            <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto">
              Značka kvality od overených dodávateľov s rokmi skúseností
            </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
            {vyhody.map((vyhoda, index) => (
              <div key={index}>
                <Card className="p-3 sm:p-5 text-center h-full hover:shadow-xl transition-shadow bg-white border border-gray-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                    <vyhoda.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">{vyhoda.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed hidden sm:block">{vyhoda.description}</p>
                  </Card>
                  </div>
                  ))}
                  </div>

                  {/* Varovanie */}
                  <div className="max-w-5xl mx-auto">
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
                </div>
        </div>
      </section>

      {/* Naša ponuka */}
      {domy.length > 0 && (
        <section className="py-10 sm:py-16 bg-gradient-to-br from-gray-100 to-gray-50">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Naša ponuka
                </h2>
              <p className="text-sm sm:text-base text-gray-700">
                Drevodom, ktorý nemusí vyzerať ako drevodom
              </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-10">
                {domy.map((dom, index) => (
                  <div key={dom.id}>
                    <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}>
                      <Card className="group overflow-hidden hover:shadow-2xl transition-shadow bg-white border border-gray-200">
                      <div className="relative h-32 sm:h-48 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {dom.celorocny && (
                          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
                            ✔ CELOROČNÝ
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-4">
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-0.5 font-semibold">{dom.vyrobca}</div>
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                          {dom.nazov}
                        </h3>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div>
                            <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">Od</p>
                            <p className="text-sm sm:text-xl font-bold text-primary">
                              {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                      </div>
                    </Card>
                    </Link>
                    </div>
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
      <section className="py-10 sm:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Proces realizácie
              </h2>
            <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto">
              Komplexné služby od A po Z
            </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {proces.map((krok, index) => (
              <div key={index}>
                <Card className="p-2 sm:p-4 h-full hover:shadow-xl transition-shadow bg-white border border-gray-100">
                  <div className="text-2xl sm:text-3xl font-bold text-primary/20 mb-1 sm:mb-2">{krok.cislo}</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                    <krok.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">{krok.nazov}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-700 hidden sm:block">{krok.popis}</p>
                  </Card>
                  </div>
                  ))}
                  </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Pripravení na vlastný dom?
            </h2>
            <p className="text-sm sm:text-base mb-4 sm:mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Kontaktujte nás a nájdeme riešenie pre vás
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Link to={createPageUrl("Katalog")}>
                <Button size="default" className="bg-white text-primary hover:bg-gray-100 font-semibold px-5 sm:px-6 w-full sm:w-auto shadow-xl text-sm sm:text-base">
                  Zobraziť ponuku
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl("Kontakt")}>
                <Button size="default" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-5 sm:px-6 w-full sm:w-auto shadow-xl text-sm sm:text-base">
                  Kontakt
                  <Phone className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}