import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, Maximize2, Zap, CheckCircle, Phone, Mail, Settings, AlertCircle, Boxes, Grid2x2, Layers, Edit, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import PriceCalculator from "../components/PriceCalculator";
import PriceCalculatorTicabhouse from "../components/PriceCalculatorTicabhouse";
import FloatingPrice from "../components/FloatingPrice";
import DomGalerieManager from "../components/admin/DomGalerieManager";

export default function DetailDomu() {
  const urlParams = new URLSearchParams(window.location.search);
  const domId = urlParams.get('id');
  const domSlug = urlParams.get('slug');
  const returnUrl = urlParams.get('return') || createPageUrl("Katalog");
  const [selectedImage, setSelectedImage] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeGaleriaTab, setActiveGaleriaTab] = useState("hlavna");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.super_admin === true;
  const canManage = isAdmin || isSuperAdmin;

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
  const isTicabhouse = dom.vyrobca === "Ticab house";
  const isJAKModules = dom.vyrobca === "JAK Modules";

  // Typy galérií pre zobrazenie
  const GALERIA_TYPY_LABELS = {
    "exterier_drevo_plech": "🏠 Exteriér - Drevo/Plech",
    "exterier_murovka": "🏡 Exteriér - Murovka",
    "interier_drevo": "🪵 Interiér - Drevo",
    "interier_sadrokarton": "🏢 Interiér - Sadrokartón"
  };

  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={returnUrl}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť do katalógu
            </Button>
          </Link>
          {canManage && (
            <Button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              variant={showAdminPanel ? "default" : "outline"}
              className={showAdminPanel ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Edit className="w-4 h-4 mr-2" />
              {showAdminPanel ? "Zavrieť správu" : "Správa galérií"}
            </Button>
          )}
        </div>
      </div>

      {/* Admin Panel */}
      {canManage && showAdminPanel && (
        <div className="container mx-auto px-4 py-6">
          <DomGalerieManager dom={dom} onUpdate={() => {}} />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ľavý stĺpec - Galéria */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Hlavný obrázok */}
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 cursor-pointer"
              onClick={() => openLightbox(allImages, selectedImage)}
            >
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
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  Zobraziť galériu
                </span>
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

            {/* 2D a 3D Pôdorysy - hneď pod titulnou fotkou */}
            {(dom.podorys_2d || dom.podorys_3d) && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Pôdorysy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dom.podorys_2d && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">2D Pôdorys</p>
                      <div 
                        className="rounded-lg overflow-hidden bg-gray-50 border cursor-pointer"
                        onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), 0)}
                      >
                        <img
                          src={dom.podorys_2d}
                          alt="2D Pôdorys"
                          className="w-full h-auto object-contain hover:opacity-90"
                        />
                      </div>
                    </div>
                  )}
                  {dom.podorys_3d && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">3D Pôdorys</p>
                      <div 
                        className="rounded-lg overflow-hidden bg-gray-50 border cursor-pointer"
                        onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), dom.podorys_2d ? 1 : 0)}
                      >
                        <img
                          src={dom.podorys_3d}
                          alt="3D Pôdorys"
                          className="w-full h-auto object-contain hover:opacity-90"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Pomenované galérie - zobrazovať len ak majú aspoň jednu galériu s fotkami */}
            {dom.galerie && dom.galerie.length > 0 && dom.galerie.some(g => g.fotky && g.fotky.length > 0) && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Galérie
                </h3>
                <div className="space-y-4">
                  {dom.galerie.filter(g => g.fotky && g.fotky.length > 0).map((galeria, index) => (
                    <div 
                      key={index}
                      className="border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => openLightbox(galeria.fotky, 0)}
                    >
                      {/* Header s typom */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-800">
                            {GALERIA_TYPY_LABELS[galeria.typ] || galeria.typ}
                          </span>
                          <Badge className="bg-gray-100 text-gray-600 text-xs">
                            {galeria.fotky.length} fotiek
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                          Kliknite pre zobrazenie →
                        </p>
                      </div>
                      
                      {/* Náhľady fotiek */}
                      <div className="flex gap-2 flex-wrap">
                        {galeria.fotky.slice(0, 6).map((foto, fotoIndex) => (
                          <div 
                            key={fotoIndex} 
                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative"
                          >
                            <img
                              src={foto}
                              alt={`Náhľad ${fotoIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay pre posledný ak je viac */}
                            {fotoIndex === 5 && galeria.fotky.length > 6 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  +{galeria.fotky.length - 6}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
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
                <span className="text-sm text-gray-500">{isTicabhouse ? "Cena základnej konfigurácie" : "Cena od"}</span>
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
              ) : (isTicabhouse) ? (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Modulárna konštrukcia domu – flexibilné riešenie pre vaše bývanie.</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Základná cena zahŕňa kompletnú štandardnú výbavu pre <strong>rekreačnú stavbu</strong>. 
                    Možnosť upgradu na <strong>Rodinný dom s certifikátom A0</strong> v konfigurátore.
                  </p>
                </div>
              ) : isJAKModules ? (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Modulárny dom z drewna klejonego GL24</strong> – spojenie elegancie, pohodlia a inovácií.
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
                <div className="flex items-center gap-3">
                  <Home className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Výrobca</p>
                    <p className="text-xl font-bold text-primary">{dom.vyrobca}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Boxes className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-sm text-gray-500">Typ domu</p>
                    <p className="text-xl font-bold text-primary">
                      {dom.typ_domu === 'modularny' ? 'Modulárny dom' : 'Mobilný dom'}
                    </p>
                  </div>
                </div>
                {dom.pocet_izieb && (
                  <div className="flex items-center gap-3">
                    <Grid2x2 className="w-6 h-6 text-primary" />
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
                      {isTicabhouse && (
                        <p className="text-xs text-gray-500 mt-1">príplatková možnosť</p>
                      )}
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

            {/* Obrázok základnej konfigurácie - pre Ticabhouse */}
            {isTicabhouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-lg font-bold text-primary mb-4">📸 Základná konfigurácia</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={`${dom.nazov} - základná konfigurácia`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-blue-800 mt-3 text-center font-medium">
                  Takto vyzerá dom v základnej konfigurácii
                </p>
              </Card>
            )}

            {/* Štandardná výbava pre Ticabhouse */}
            {isTicabhouse && (
              <div className="space-y-6">
                {/* Štandardná výbava */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                  <h3 className="text-lg font-bold text-primary mb-4">✔ Štandardná výbava (zahrnutá v cene)</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Konštrukcia a izolácia:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Rám zo suchého reziva ošetreného bio-roztokom</li>
                      <li>Izolácia stien 85mm-350mm (bazaltová vlna) podľa typu stavby (rodinný dom en. tr. A0 / rekreačná stavba)</li>
                      <li>Izolácia podlahy a stropu 200mm stlačených na 150mm</li>
                      <li>Konštrukcia certifikovaná na prepravu po celej EÚ</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Okná a dvere:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Dvojkomorové kovoplastové okná, energeticky úsporné</li>
                      <li>Kovoplastové vchodové dvere</li>
                      <li>Interiérové dvere MDF</li>
                      <li>Francúzske balkónové okná (pri vybraných modeloch)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Exteriér:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Fasáda: Škandinávskeho smrekovca / Thermowood / Vinylové panely / Kompozitné panely</li>
                      <li>Strešná krytina: Kovová škridla / Falcované panely / Vlnitý plech</li>
                      <li>Sviečtená debnenie strechy z OSB dosiek hrúbky 15 mm</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Interiér:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Obloženie stien: Prírodné drevo / Laminátové panely / Sadrokartón s tapetami</li>
                      <li>Podlahy: Polo-komerčný laminát</li>
                      <li>Malované stropy zo sadrokartónu</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Kúpeľňa (podľa modelu):</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Malovaný sadrokartónový strop</li>
                      <li>Obklady na stenách</li>
                      <li>Umývadlo (vybrané modely)</li>
                      <li>Geberit WC</li>
                      <li>Grohe sprcha</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Kuchyňa (podľa modelu):</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Kuchynský nábytok zahrnutý v cene (vybrané modely)</li>
                      <li>Obklad za kuchynskou linkou (vybrané modely)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Technológie a inštalácie:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Elektrické rozvody, LED osvetlenie</li>
                      <li>Bojler 80l (vybrané modely)</li>
                      <li>Zásuvka a výstuženie v stene pre montáž klimatizácie</li>
                      <li>Podlahové kúrenie (vybrané modely - v obytných priestoroch a kúpeľni)</li>
                      <li>Vodoinštalácia, prípojky pre kuchyňu a práčku</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Terasa (podľa modelu):</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Zabudovaná terasa (vybrané modely)</li>
                      <li>Príplatkové terasy k dispozícii pre všetky modely</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-green-300">
                  <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    DÔLEŽITÉ - Cena základného modelu bez nastavenia v konfigurátore nezahŕňa:
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm ml-2">
                    <li><strong>Dodanie a transport</strong> - možnosť objednať v konfigurátore</li>
                    <li><strong>Základy</strong> - jednomodulové domy nevyžadujú "tehlové" základy</li>
                    <li><strong>Vonkajšie komunikácie</strong> (prípojky vody, elektriky, kanalizácie)</li>
                    <li><strong>Autožeriav pre výkladku</strong> - potrebný na umiestnenie domu na pozemok</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Výhoda modulárnej konštrukcie:</strong> Dom prichádza plne dokončený na nákladnom aute. 
                      Pomocou žeriavu sa vyloží, namontuje na základy, pripojí na siete a môžete sa nasťahovať! 
                      Ideálne pre rodiny aj seniorov hľadajúcich dom mimo mesta.
                    </p>
                  </div>
                </div>
                </Card>
              </div>
            )}

            {/* Štandardná výbava pre JAK Modules */}
            {isJAKModules && (
              <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                <h3 className="text-lg font-bold text-primary mb-4">✔ Hlavné vlastnosti</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Konštrukcia z lepeného dreva GL24h – niezrównaná wytrzymałość a stabilita</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Doskonalá izolačná schopnosť U ≤ 0,16 W/(m²·K)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Ekologické materiály - steny z platní Fermacell®, izolácia Steico®</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Rychlý čas realizácie - produkcia 60 dní, montáž 2 dni</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Kompletná dokumentácia na ohlásenie v cene</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Moderná a funkčná architektúra odolná voči extrémnym podmienkam</span>
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

            {/* Možnosti využitia pre ostatných výrobcov */}
            {!isJAKModules && (
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
            )}

            {/* Čo obsahuje cena pre JAK Modules */}
            {isJAKModules && (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-lg font-bold text-primary mb-4">💰 Čo obsahuje cena?</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Konštrukcia:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Certifikované borovicové lepené drevo GL24h</li>
                      <li>Oceľové profily 100x60x5mm a 60x40x4mm</li>
                      <li>Izolačná schopnosť U ≤ 0,16 W/(m²·K)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Izolácia:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>PUR pena 12 cm (Uw=0,15W/m²K)</li>
                      <li>Minerálna vlna najvyššej kvality</li>
                      <li>Ekologické materiály Steico®</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Vykurovanie a klimatizácia:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Klimatizácia ROTENSO s tepelným čerpadlom</li>
                      <li>Funkcia ohrevu do -25°C</li>
                      <li>Infračervené ohrievače</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Okná a dvere:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>PVC okná s 6-komorovou konštrukciou</li>
                      <li>Moderné dvere v antracitovej farbe</li>
                      <li>Vynikajúca tepelná izolácia</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Vybavenie:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Kompletná kúpeľňa s kvalitným vybavením</li>
                      <li>Kuchynská linka na mieru</li>
                      <li>Vinylové panely Kronostep SPC</li>
                      <li>Komplexná elektrická inštalácia (3-fázová)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Fasáda a strecha:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Antracitový alebo biely plech na drážku</li>
                      <li>Možnosť výberu typu fasády</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ Ďalšie:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>Kompletná dokumentácia na ohlásenie</li>
                      <li>Rýchla montáž (2 dni)</li>
                      <li>Produkcia 60 dní</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 sticky top-24">
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

      {/* Floating Price Display - len ak nie je JAK Modules */}
      {!isJAKModules && <FloatingPrice price={calculatedPrice} isVisible={showCalculator} />}

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          {lightboxImages.length > 1 && (
            <>
              <button 
                className="absolute left-4 text-white hover:text-gray-300 z-10 p-2"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button 
                className="absolute right-4 text-white hover:text-gray-300 z-10 p-2"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxIndex]}
              alt={`Fotka ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>

          {/* Thumbnails */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
              {lightboxImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}