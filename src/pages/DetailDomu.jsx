import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Maximize2, Zap, CheckCircle, Phone, Mail, Settings, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import PriceCalculator from "../components/PriceCalculator";
import PriceCalculatorTicabhouse from "../components/PriceCalculatorTicabhouse";
import FloatingPrice from "../components/FloatingPrice";

export default function DetailDomu() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');
  const domSlug = urlParams.get('slug');
  const [selectedImage, setSelectedImage] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);

  const { data: dom, isLoading } = useQuery({
    queryKey: ['dom-detail', domId, domSlug],
    queryFn: async () => {
      if (domSlug) {
        const domy = await base44.entities.Dom.filter({ slug: domSlug });
        return domy[0] || null;
      }
      if (domId) {
        const domy = await base44.entities.Dom.filter({ id: domId });
        return domy[0] || null;
      }
      return null;
    },
    enabled: !!domId || !!domSlug,
  });

  // SEO Meta tags
  useEffect(() => {
    if (dom) {
      const metaTitle = dom.meta_title || `${dom.nazov} - ${dom.vyrobca} | ${dom.zastavana_plocha}m² | American Living`;
      const metaDescription = dom.meta_description || `${dom.nazov} od ${dom.vyrobca} - ${dom.typ_domu === 'modularny' ? 'Modulárny dom' : 'Mobilný dom'} s plochou ${dom.zastavana_plocha}m²${dom.pocet_izieb ? `, ${dom.pocet_izieb} izby` : ''}. Cena od ${dom.zakladna_cena?.toLocaleString('sk-SK')}€. Energetická trieda A0.`;
      
      document.title = metaTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = metaDescription;

      // Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = metaTitle;

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = metaDescription;

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = dom.hlavny_obrazok;

      // Set initial calculatedPrice to base price
      setCalculatedPrice(dom.zakladna_cena || 0);
    }
  }, [dom]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam detail domu...</p>
        </div>
      </div>
    );
  }

  if (!dom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Dom sa nenašiel</h2>
          <p className="text-gray-500 mb-6">Požadovaný dom neexistuje.</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const allImages = dom.galeria && dom.galeria.length > 0
    ? [dom.hlavny_obrazok, ...dom.galeria]
    : [dom.hlavny_obrazok];

  const isProstoHouse = dom.vyrobca === "Prosto House";
  const isTicabhouse = dom.vyrobca === "Ticab house" || dom.vyrobca === "JAK Modules" || dom.vyrobca === "Domki z Gór";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to={createPageUrl("Katalog")}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ľavý stĺpec - Galéria */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Hlavný obrázok */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
              <img
                src={allImages[selectedImage]}
                alt={`${dom.nazov} - obrázok ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 space-y-2">
                {dom.celorocny && (
                  <Badge className="bg-accent text-white px-4 py-2">✔ CELOROČNÝ</Badge>
                )}
                {dom.energeticky_certifikat && (
                  <Badge className="bg-green-600 text-white px-4 py-2">✔ CERTIFIKÁT A0</Badge>
                )}
              </div>
            </div>

            {/* Miniatúry */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatúra ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Pôdorysy */}
            {dom.podorysy && dom.podorysy.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">
                  {dom.podorysy.length > 1 ? 'Pôdorysy' : 'Pôdorys'}
                </h3>
                <div className="space-y-4">
                  {dom.podorysy.map((podorysUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={podorysUrl}
                        alt={`Pôdorys ${index + 1}`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* YouTube Video */}
            {dom.youtube_url && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Video prezentácia</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={dom.youtube_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </Card>
            )}

            {/* Price Calculator */}
            {isTicabhouse ? (
              <PriceCalculatorTicabhouse 
                dom={dom} 
                onPriceChange={(price) => {
                  setCalculatedPrice(price);
                  setShowCalculator(price !== (dom.zakladna_cena || 0));
                }}
              />
            ) : (
              <PriceCalculator 
                dom={dom} 
                onPriceChange={(price) => {
                  setCalculatedPrice(price);
                  setShowCalculator(price !== (dom.zakladna_cena || 0));
                }}
              />
            )}
          </motion.div>

          {/* Pravý stĺpec - Informácie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Hlavička */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary/10 text-primary border border-primary/20 px-3 py-1">
                  {dom.vyrobca}
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 px-3 py-1">
                  {dom.typ_domu === 'modularny' ? 'Modulárny dom' : 'Mobilný dom'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                {dom.nazov}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">Cena od</span>
                <span className="text-4xl font-bold text-primary">
                  {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-sm text-gray-500">s DPH</span>
              </div>
              {isProstoHouse ? (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Základná cena je za samotnú konštrukciu bez montážnych prác.</strong> Cenu montáže si môžete vypočítať v konfigurátore.
                  </p>
                </div>
              ) : isTicabhouse ? (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Modulárna konštrukcia domu – flexibilné riešenie pre vaše bývanie.</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Základná cena zahŕňa kompletnú štandardnú výbavu pre <strong>rekreačnú stavbu</strong>. 
                    Možnosť upgradu na <strong>Rodinný dom s certifikátom A0</strong> v konfigurátore.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">- cena základného modelu</p>
              )}
            </div>

            {/* Parametre */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="text-lg font-bold text-primary mb-4">Základné parametre</h3>
              <div className="grid grid-cols-2 gap-4">
                {dom.pocet_izieb && (
                  <div className="flex items-center gap-3">
                    <Home className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Počet izieb</p>
                      <p className="text-xl font-bold text-primary">{dom.pocet_izieb}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Zastavaná plocha</p>
                    <p className="text-xl font-bold text-primary">{dom.zastavana_plocha} m²</p>
                  </div>
                </div>
                {dom.uzitkova_plocha && (
                  <div className="flex items-center gap-3">
                    <Maximize2 className="w-6 h-6 text-accent" />
                    <div>
                      <p className="text-sm text-gray-500">Úžitková plocha</p>
                      <p className="text-xl font-bold text-primary">{dom.uzitkova_plocha} m²</p>
                    </div>
                  </div>
                )}
                {dom.energeticky_certifikat && (
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Energetická trieda</p>
                      <p className="text-xl font-bold text-primary">A0</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Rozmery */}
            {dom.rozmery && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Vonkajšie rozmery</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Šírka</p>
                    <p className="text-2xl font-bold text-primary">{dom.rozmery.sirka} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dĺžka</p>
                    <p className="text-2xl font-bold text-primary">{dom.rozmery.dlzka} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Výška</p>
                    <p className="text-2xl font-bold text-primary">{dom.rozmery.vyska} m</p>
                  </div>
                </div>
                {dom.vyska_stropu && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Výška stropu: <span className="font-semibold">{dom.vyska_stropu}</span>
                  </p>
                )}
              </Card>
            )}

            {/* Popis */}
            {dom.popis && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Popis modulového domu</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {dom.popis}
                </div>
              </Card>
            )}

            {/* Štandardná výbava pre Ticabhouse */}
            {isTicabhouse && (
              <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                <h3 className="text-lg font-bold text-primary mb-4">✔ Štandardná výbava (zahrnutá v cene)</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Konštrukcia a izolácia:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Rám zo suchého reziva ošetreného bio-roztokom</li>
                      <li>Izolácia stien 150mm (bazaltová vlna)</li>
                      <li>Izolácia podlahy a stropu 200mm stlačených na 150mm</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Okná a dvere:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Dvojkomorové kovoplastové okná, energeticky úsporné</li>
                      <li>Kovoplastové vchodové dvere</li>
                      <li>Interiérové dvere MDF</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Exteriér:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Fasáda z prírodného dreva alebo panelových systémov</li>
                      <li>Strešná krytina (kovová škridla / falcované panely)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Interiér:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Obloženie prírodným drevom alebo laminátovými panelmi</li>
                      <li>Polo-komerčný laminát</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Technológie:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Elektrické rozvody, LED osvetlenie</li>
                      <li>Bojler 80l</li>
                      <li>Príprava na vykurovanie (zásuvky pod oknami)</li>
                      <li>Vodoinštalácia, prípojky pre kuchyňu a práčku</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Špecifikácia */}
            {dom.specifikacia && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Špecifikácia</h3>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {dom.specifikacia}
                </div>
              </Card>
            )}

            {/* Čo obsahuje cena */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
              <h3 className="text-lg font-bold text-primary mb-4">✔ Možnosti využitia:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Rodinný dom s možnosťou kolaudácie</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Možnosť energetického certifikátu A0</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Rekreačná budova (chata/záhradný domček)</span>
                </li>
              </ul>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3 sticky top-24">
              {isProstoHouse ? (
                <Link to={`${createPageUrl("KonfiguratorProstoHouse")}?id=${dom.id}`}>
                  <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg py-6">
                    <Settings className="mr-2 w-5 h-5" />
                    Spustiť konfigurátor Prosto House
                  </Button>
                </Link>
              ) : isTicabhouse ? (
                <Link to={`${createPageUrl("KonfiguratorTicabhouse")}?id=${dom.id}`}>
                  <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg py-6">
                    <Settings className="mr-2 w-5 h-5" />
                    Spustiť konfigurátor {dom.vyrobca}
                  </Button>
                </Link>
              ) : (
                <Link to={`${createPageUrl("Konfigurator")}?id=${dom.id}`}>
                  <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg py-6">
                    <Settings className="mr-2 w-5 h-5" />
                    Spustiť konfigurátor
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold text-lg py-6">
                  <Mail className="mr-2 w-5 h-5" />
                  Kontaktovať nás
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg py-6">
                  <Phone className="mr-2 w-5 h-5" />
                  +421 905 138 124
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Price Display */}
      <FloatingPrice price={calculatedPrice} isVisible={showCalculator} />
    </div>
  );
}