import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, Maximize2, Zap, CheckCircle, Phone, Mail, Settings, AlertCircle, Boxes, Grid2x2, Layers, Edit, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Hammer, Caravan, Package, Droplets, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import PriceCalculator from "../components/PriceCalculator";
import PriceCalculatorTicabhouse from "../components/PriceCalculatorTicabhouse";
import FloatingPrice from "../components/FloatingPrice";
import DomGalerieManager from "../components/admin/DomGalerieManager";
import KonfiguratorFlat15 from "../components/KonfiguratorFlat15";
import KonfiguratorFlatDouble from "../components/KonfiguratorFlatDouble";
import KonfiguratorFlat72 from "../components/KonfiguratorFlat72";
import KonfiguratorFaza1HrubaStavba from "../components/KonfiguratorFaza1HrubaStavba";
import KonfiguratorWizard from "../components/KonfiguratorWizard";
import KonfiguratorFjord from "../components/KonfiguratorFjord";
import KonfiguratorNord from "../components/KonfiguratorNord";
import KonfiguratorProstoHouse from "../components/KonfiguratorProstoHouse";
import { useLanguage } from "../components/LanguageContext";
import TranslatedDescription from "../components/TranslatedDescription";


export default function DetailDomu() {
  const { t } = useLanguage();
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
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Zdieľaný stav pre Fázu 1 - Hrubá stavba
  const [montazHolodomu, setMontazHolodomu] = useState("nie");
  const [izolaciaNavysenie, setIzolaciaNavysenie] = useState("standard");
  const [zaklady, setZaklady] = useState("bez");
  const [predlzenie, setPredlzenie] = useState(0);
  
  // Zdieľaný stav pre Fázu 2 - Holodom
  const [vstupneDvere, setVstupneDvere] = useState("ziadne");
  const [elektroinstalacia, setElektroinstalacia] = useState(false);
  const [vodaKanalizacia, setVodaKanalizacia] = useState(false);
  const [sanitaKomplet, setSanitaKomplet] = useState(false);
  const [bojler, setBojler] = useState(false);
  const [tepelneCerpadlo, setTepelneCerpadlo] = useState(false);
  const [rekuperacia, setRekuperacia] = useState(false);
  const [pripojkaSiete, setPripojkaSiete] = useState(false);
  const [stresneOkno, setStresneOkno] = useState(0);
  const [bocneOknoFixne, setBocneOknoFixne] = useState(0);
  const [bocneOknoVyklopne90, setBocneOknoVyklopne90] = useState(0);
  const [bocneOknoVyklopne55, setBocneOknoVyklopne55] = useState(0);
  const [povrchokaOkien, setPovrchokaOkien] = useState(false);
  const [tonovaneSkla, setTonovaneSkla] = useState(false);
  
  // Zdieľaný stav pre Fázu 3 - Dom na kľúč
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("");
  const [interierFinis, setInterierFinis] = useState("ziadne");
  const [vnutornePodlahy, setVnutornePodlahy] = useState(false);
  const [podlahovVykurovanie, setPodlahovVykurovanie] = useState(false);
  const [interieroveDvere, setInterieroveDvere] = useState(0);
  const [pergola, setPergola] = useState(false);
  
  // Zdieľaný stav pre Fázu 4 - Dokumentácia
  const [inziniering, setInziniering] = useState(false);
  const [projektA0, setProjektA0] = useState(false);
  const [revizna, setRevizna] = useState(true);
  const [doprava, setDoprava] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [wizardKey, setWizardKey] = useState(0);

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
      const houseType = dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile');
      const metaTitle = dom.meta_title || `${dom.nazov} - ${dom.vyrobca} | ${dom.zastavana_plocha}m²${dom.pocet_izieb ? ` | ${dom.pocet_izieb} ${t('roomsLabel')}` : ''} | American Living`;
      const metaDescription = dom.meta_description || `${dom.nazov} od ${dom.vyrobca} - ${houseType} s plochou ${dom.zastavana_plocha}m²${dom.uzitkova_plocha ? `, úžitková ${dom.uzitkova_plocha}m²` : ''}. ${t('priceFromLabel')} ${dom.zakladna_cena?.toLocaleString('sk-SK')}€ ${t('withVAT')}.${dom.energeticky_certifikat ? ` ${t('energyClass')} A0.` : ''}${dom.celorocny ? ` ${t('yearRound')}.` : ''}`;
      const currentUrl = window.location.href;
      const canonicalUrl = `${window.location.origin}${window.location.pathname}${dom.slug ? `?slug=${dom.slug}` : `?id=${dom.id}`}`;
      
      document.title = metaTitle;
      
      // Helper function to set meta tag
      const setMetaTag = (selector, attribute, attributeValue, content) => {
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, attributeValue);
          document.head.appendChild(tag);
        }
        tag.content = content;
      };

      // Canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonicalUrl;

      // Basic meta tags
      setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
      setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow');
      
      // Open Graph tags
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', metaTitle);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', dom.hlavny_obrazok);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
      setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'American Living');
      
      // Twitter Card tags
      setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', metaTitle);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', dom.hlavny_obrazok);
      setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);

      // Schema.org structured data
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": dom.nazov,
        "description": metaDescription,
        "image": [dom.hlavny_obrazok, ...(dom.galeria || [])].filter(Boolean),
        "brand": {
          "@type": "Brand",
          "name": dom.vyrobca
        },
        "manufacturer": {
          "@type": "Organization",
          "name": dom.vyrobca
        },
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "EUR",
          "price": dom.zakladna_cena,
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "American Living"
          }
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Zastavaná plocha",
            "value": `${dom.zastavana_plocha} m²`
          },
          dom.uzitkova_plocha && {
            "@type": "PropertyValue",
            "name": "Úžitková plocha",
            "value": `${dom.uzitkova_plocha} m²`
          },
          dom.pocet_izieb && {
            "@type": "PropertyValue",
            "name": "Počet izieb",
            "value": dom.pocet_izieb
          },
          {
            "@type": "PropertyValue",
            "name": "Typ domu",
            "value": houseType
          },
          dom.energeticky_certifikat && {
            "@type": "PropertyValue",
            "name": "Energetická trieda",
            "value": "A0"
          },
          dom.celorocny && {
            "@type": "PropertyValue",
            "name": "Celoročný",
            "value": "Áno"
          }
        ].filter(Boolean)
      };

      let schemaScript = document.querySelector('script[type="application/ld+json"]');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaData);

      // Set initial calculatedPrice to base price
      setCalculatedPrice(dom.zakladna_cena || 0);
    }

    // Cleanup function
    return () => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.remove();
      const schemaScript = document.querySelector('script[type="application/ld+json"]');
      if (schemaScript) schemaScript.remove();
    };
  }, [dom, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!dom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('noHousesFound')}</h2>
          <p className="text-gray-500 mb-6">{t('tryChangingFilters')}</p>
          <Link to={createPageUrl("Katalog")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              {t('backToCatalog')}
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
  const getGaleriaLabel = (typ) => {
    const labels = {
      "exterier_drevo_plech": `🏠 ${t('exteriorWoodMetal')}`,
      "exterier_murovka": `🏡 ${t('exteriorBrick')}`,
      "interier_drevo": `🪵 ${t('interiorWoodGallery')}`,
      "interier_sadrokarton": `🏢 ${t('interiorDrywallGallery')}`
    };
    return labels[typ] || typ;
  };

  const openLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const getTouchDistance = (touches) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e) => {
    if (e.touches && e.touches.length === 2) {
      // Pinch zoom start
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
      setSwipeStart(null);
      return;
    }
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
    } else if (e.touches && lightboxImages.length > 1) {
      // Start swipe for navigation
      setSwipeStart({ x: clientX, y: clientY });
      setSwipeOffset(0);
    }
  };

  const handleMouseMove = (e) => {
    if (e.touches && e.touches.length === 2) {
      // Pinch zoom move
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      if (lastTouchDistance && newDistance) {
        const scale = newDistance / lastTouchDistance;
        setZoomLevel(prev => {
          const newZoom = Math.min(Math.max(prev * scale, 1), 4);
          if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
          return newZoom;
        });
        setLastTouchDistance(newDistance);
      }
      return;
    }
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setPanPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      });
    } else if (swipeStart && zoomLevel === 1 && e.touches) {
      // Swipe navigation
      const deltaX = clientX - swipeStart.x;
      setSwipeOffset(deltaX);
    }
  };

  const handleMouseUp = (e) => {
    // Handle swipe end for navigation
    if (swipeStart && zoomLevel === 1 && lightboxImages.length > 1) {
      const threshold = 80;
      if (swipeOffset < -threshold) {
        nextImage();
      } else if (swipeOffset > threshold) {
        prevImage();
      }
    }
    
    setIsDragging(false);
    setLastTouchDistance(null);
    setSwipeStart(null);
    setSwipeOffset(0);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleKonfiguratorReset = () => {
    setMontazHolodomu("nie");
    setVstupneDvere("ziadne");
    setIzolaciaNavysenie("standard");
    setElektroinstalacia(false);
    setVodaKanalizacia(false);
    setSanitaKomplet(false);
    setBojler(false);
    setTepelneCerpadlo(false);
    setRekuperacia(false);
    setZaklady("bez");
    setPripojkaSiete(false);
    setInziniering(false);
    setProjektA0(false);
    setInterierFinis("ziadne");
    setVonkajsiaFasada("");
    setPovrchokaOkien(false);
    setVnutornePodlahy(false);
    setPodlahovVykurovanie(false);
    setPergola(false);
    setInterieroveDvere(0);
    setTonovaneSkla(false);
    setDoprava(false);
    setRevizna(true);
    setStresneOkno(0);
    setBocneOknoFixne(0);
    setBocneOknoVyklopne90(0);
    setBocneOknoVyklopne55(0);
    setPredlzenie(0);
    setWizardKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Link to={returnUrl}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs sm:text-sm h-7 sm:h-9">
              <ArrowLeft className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('backToCatalog')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                variant={showAdminPanel ? "default" : "outline"}
                size="sm"
                className={`h-7 sm:h-9 text-xs ${showAdminPanel ? "bg-blue-600 hover:bg-blue-700" : ""}`}
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{showAdminPanel ? t('close') : t('galleries')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {canManage && showAdminPanel && (
        <div className="container mx-auto px-4 py-6">
          <DomGalerieManager dom={dom} onUpdate={() => {}} />
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
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
                  className="w-full h-full object-contain bg-gray-100"
                />
              <div className="absolute top-4 left-4 space-y-2">
                {dom.celorocny && (
                  <Badge className="bg-accent text-white px-4 py-2">✔ {t('yearRound')}</Badge>
                )}
                {dom.energeticky_certifikat && (
                  <Badge className="bg-green-600 text-white px-4 py-2">✔ {t('certificateA0')}</Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  {t('clickToShow')} {t('galleries')}
                </span>
              </div>
            </div>

            {/* Miniatúry */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
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
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">{t('floorPlans')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {dom.podorys_2d && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">{t('twoD')} {t('floorPlan')}</p>
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
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">{t('threeD')} {t('floorPlan')}</p>
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
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('galleries')}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {dom.galerie.filter(g => g.fotky && g.fotky.length > 0).map((galeria, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-2 sm:p-3 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => openLightbox(galeria.fotky, 0)}
                    >
                      {/* Header s typom */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">
                            {getGaleriaLabel(galeria.typ)}
                          </span>
                          <Badge className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs px-1.5 py-0.5">
                            {galeria.fotky.length} {t('photos')}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-400 group-hover:text-primary transition-colors">
                          {t('clickToShow')} →
                        </p>
                      </div>
                      
                      {/* Náhľady fotiek */}
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        {galeria.fotky.slice(0, 6).map((foto, fotoIndex) => (
                          <div 
                            key={fotoIndex} 
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 relative"
                          >
                            <img
                              src={foto}
                              alt={`Náhľad ${fotoIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay pre posledný ak je viac */}
                            {fotoIndex === 5 && galeria.fotky.length > 6 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
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

            {/* Wizard pre Flat 1,5 - ľavá strana */}
            {isProstoHouse && (dom.nazov?.includes("Flat 1,5") || dom.nazov?.includes("Flat House 1,5")) && (
              <KonfiguratorWizard
                key={wizardKey}
                dom={dom}
                useFlat15Prices={true}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Konfigurátor - Wizard krok po kroku pre Flat Double (ale nie Flat 1,5) */}
            {isProstoHouse && dom.nazov?.includes("Flat Double") && !dom.nazov?.includes("1,5") && !dom.nazov?.includes("1.5") && (
              <KonfiguratorWizard 
                key={wizardKey}
                dom={dom}
                useFlatDoublePrices={true}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Konfigurátor pre Fjord - Wizard výber typu */}
            {isProstoHouse && dom.nazov?.includes("Fjord") && (
              <KonfiguratorWizard 
                key={wizardKey}
                dom={dom}
                useFjordPrices={true}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Konfigurátor pre Flat 72 */}
            {isProstoHouse && dom.nazov?.includes("Flat 72") && (
              <KonfiguratorFlat72
                dom={dom}
                onReset={handleKonfiguratorReset}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Konfigurátor pre ostatné Prosto House domy (nie Nord, nie Fjord, nie Flat 1,5, nie Flat Double, nie Flat 72) */}
            {isProstoHouse && !dom.nazov?.includes("Nord") && !dom.nazov?.includes("Fjord") && !dom.nazov?.includes("Flat 1,5") && !dom.nazov?.includes("Flat House 1,5") && !dom.nazov?.includes("Flat Double") && !dom.nazov?.includes("Flat 72") && (
              <KonfiguratorWizard
                key={wizardKey}
                dom={dom}
                useProstoHousePrices={true}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                predlzenie={predlzenie}
                setPredlzenie={setPredlzenie}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Konfigurátor pre Nord - vlastné ceny */}
            {isProstoHouse && dom.nazov?.includes("Nord") && (
              <KonfiguratorWizard
                key={wizardKey}
                dom={dom}
                useNordPrices={true}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
              />
            )}

            {/* Pôdorysy */}

            {/* Pôdorysy */}
            {dom.podorysy && dom.podorysy.length > 0 && (
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">
                  {dom.podorysy.length > 1 ? 'Pôdorysy' : 'Pôdorys'}
                </h3>
                <div className="space-y-2 sm:space-y-3">
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
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">{t('videoPresentation')}</h3>
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

            {/* Rozmery - presunute z pravej strany */}
            {dom.rozmery && (
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">{t('outerDimensions')}</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('width')}</p>
                    <p className="text-base sm:text-lg font-bold text-primary">{dom.rozmery.sirka} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('length')}</p>
                    <p className="text-base sm:text-lg font-bold text-primary">{dom.rozmery.dlzka} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('height')}</p>
                    <p className="text-base sm:text-lg font-bold text-primary">{dom.rozmery.vyska} m</p>
                  </div>
                </div>
                {dom.vyska_stropu && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center">
                    {t('ceilingHeight')}: <span className="font-semibold">{dom.vyska_stropu}</span>
                  </p>
                )}
              </Card>
            )}

            {/* Popis - presunute z pravej strany */}
            {dom.popis && (
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-red-600 mb-2 sm:mb-3">{t('descriptionTitle')}</h3>
                <TranslatedDescription 
                  text={dom.popis}
                  textEn={dom.popis_en}
                  textHu={dom.popis_hu}
                  textPl={dom.popis_pl}
                  textUk={dom.popis_uk}
                  textDe={dom.popis_de}
                  textFr={dom.popis_fr}
                  textSr={dom.popis_sr}
                  textHr={dom.popis_hr}
                  textEl={dom.popis_el}
                  className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                />
                {isProstoHouse && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <strong>{t('lifespan')}:</strong> {t('lifespanDesc')}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Obrázok základnej konfigurácie - pre Ticabhouse - presunute z pravej strany */}
            {isTicabhouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">📸 {t('basicConfiguration')}</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={`${dom.nazov} - základná konfigurácia`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-xs sm:text-sm text-blue-800 mt-2 text-center font-medium">
                  {t('basicConfigDesc')}
                </p>
              </Card>
            )}

            {/* Štandardná výbava pre Ticabhouse - presunute z pravej strany */}
            {isTicabhouse && (
              <div className="space-y-3 sm:space-y-4">
                <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                  <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">✔ {t('standardEquipment')}</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">{t('constructionAndInsulation')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-0.5 ml-2 text-xs sm:text-sm">
                      <li>{t('frameFromDryTimber')}</li>
                      <li>{t('wallInsulation8535')}</li>
                      <li>{t('floorRoofInsulation200')}</li>
                      <li>{t('euCertifiedTransport')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('windowsAndDoors')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('doubleGlazedPvcWindows')}</li>
                      <li>{t('pvcEntryDoors')}</li>
                      <li>{t('mdfInteriorDoors')}</li>
                      <li>{t('frenchBalconyWindows')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('exterior')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('facadeOptionsDetail')}</li>
                      <li>{t('roofCoveringDetail')}</li>
                      <li>{t('roofBoardingOsb')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('interior')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('wallCladdingOptions')}</li>
                      <li>{t('floorsCommercialLaminate')}</li>
                      <li>{t('paintedGypsum')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('bathroomByModel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('paintedCeilingBath')}</li>
                      <li>{t('wallTiles')}</li>
                      <li>{t('washbasinSelected')}</li>
                      <li>{t('geberitWc')}</li>
                      <li>{t('groheShower')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('kitchenByModel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('customKitchenIncluded')}</li>
                      <li>{t('kitchenBacksplash')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('techInstallations')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('electricalWiringLed')}</li>
                      <li>{t('boiler80lSelected')}</li>
                      <li>{t('acOutletWall')}</li>
                      <li>{t('underfloorHeatingSelected')}</li>
                      <li>{t('waterKitchenWasher')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{t('terraceByModel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('builtInTerraceSelected')}</li>
                      <li>{t('optionalTerracesAll')}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-300">
                  <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('importantBasePriceExcludes')}
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs sm:text-sm ml-2">
                    <li><strong>{t('deliveryTransport')}</strong> - {t('orderInConfigurator')}</li>
                    <li><strong>{t('foundationsNote')}</strong> - {t('singleModuleNoFoundations')}</li>
                    <li><strong>{t('externalConnections')}</strong> {t('waterElectricSewage')}</li>
                    <li><strong>{t('craneTruck')}</strong> - {t('requiredForPlacement')}</li>
                  </ul>
                  <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>{t('modularAdvantage')}</strong> {t('modularAdvantageDesc')}
                    </p>
                  </div>
                </div>
                </Card>
              </div>
            )}

            {/* Štandardná výbava pre JAK Modules - presunute z pravej strany */}
            {isJAKModules && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">✔ {t('mainFeatures')}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('gl24Strength')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('perfectInsulation')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('ecoMaterials')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('fastRealization')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('completeDocumentation')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('modernArchitecture')}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Špecifikácia - presunute z pravej strany */}
            {dom.specifikacia && (
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">{t('specification')}</h3>
                <TranslatedDescription 
                  text={dom.specifikacia}
                  textEn={dom.specifikacia_en}
                  textHu={dom.specifikacia_hu}
                  textPl={dom.specifikacia_pl}
                  textUk={dom.specifikacia_uk}
                  textDe={dom.specifikacia_de}
                  textFr={dom.specifikacia_fr}
                  textSr={dom.specifikacia_sr}
                  textHr={dom.specifikacia_hr}
                  textEl={dom.specifikacia_el}
                  className="text-gray-700 text-sm leading-relaxed whitespace-pre-line"
                />
              </Card>
            )}

            {/* Čo obsahuje cena pre JAK Modules - presunute z pravej strany */}
            {isJAKModules && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">💰 {t('whatIncludesPrice')}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">✔ {t('constructionLabel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-0.5 ml-2 text-xs sm:text-sm">
                      <li>{t('certifiedPineGl24')}</li>
                      <li>{t('steelProfiles')}</li>
                      <li>{t('insulationCapacity')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('insulationLabel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('purFoam12cm')}</li>
                      <li>{t('mineralWoolHighest')}</li>
                      <li>{t('ecoMaterialsSteico')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('heatingAc')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('rotensoAc')}</li>
                      <li>{t('heatingTo25')}</li>
                      <li>{t('infraredHeaters')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('windowsDoorsLabel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('pvc6Chamber')}</li>
                      <li>{t('modernAnthracite')}</li>
                      <li>{t('excellentThermal')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('equipmentLabel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('completeBathroom')}</li>
                      <li>{t('customKitchenLine')}</li>
                      <li>{t('vinylPanelsKronostep')}</li>
                      <li>{t('complexElectrical')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('facadeRoof')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('anthraciteWhiteSheet')}</li>
                      <li>{t('facadeTypeChoice')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">✔ {t('otherLabel')}</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                      <li>{t('completeDocLabel')}</li>
                      <li>{t('fastAssembly2days')}</li>
                      <li>{t('production60days')}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}




                          </motion.div>

          {/* Pravý stĺpec - Informácie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 lg:self-start"
          >
            {/* Hlavička */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs">
                  {dom.vyrobca}
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                  {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
                {dom.nazov}
              </h1>
              <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-500">{isTicabhouse ? t('basicConfigPrice') : t('priceFromLabel')}</span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                  {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-xs sm:text-sm text-gray-500">{t('withVAT')}</span>
              </div>
              {isProstoHouse ? (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-amber-900 font-semibold mb-1">
                        {t('basePriceNote')}
                      </p>
                      <p className="text-xs sm:text-sm text-amber-800">
                        {t('basePriceNoteDesc')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-amber-300">
                    <p className="text-xs sm:text-sm font-bold text-amber-900 mb-2">{t('assemblyKitTitle')}</p>
                    <ul className="space-y-1 text-xs sm:text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitWoodenFrame')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitExteriorFacade')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitWindows')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitDoors')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitHydroFoil')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitInsulation')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitVaporBarrier')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{t('assemblyKitRoughFloor')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-amber-300 space-y-1.5">
                    <p className="text-xs sm:text-sm text-red-700 font-medium">
                      {t('assemblyKitStairsNotIncluded')}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-800">
                      {t('assemblyKitPaintClient')}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-800">
                      {t('assemblyKitPaintingNotIncluded')}
                    </p>
                  </div>
                </div>
              ) : (isTicabhouse) ? (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs sm:text-sm text-blue-800 mb-1">
                    <strong>{t('modularConstruction')}</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700">
                    {t('basePriceIncludesRecreational')}
                  </p>
                </div>
              ) : isJAKModules ? (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-xs sm:text-sm text-green-800">
                    <strong>{t('gl24ModularHouse')}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 mt-2">- {t('priceFromLabel')}</p>
              )}
            </div>

            {/* Parametre */}
            <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">{t('basicParameters')}</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">{t('manufacturer')}</p>
                    <p className="text-sm sm:text-base font-bold text-primary">{dom.vyrobca}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {dom.typ_domu === 'montovany' ? (
                                              <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                            ) : dom.typ_domu === 'mobilny' ? (
                                              <Caravan className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                                            ) : (
                                              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                                            )}
                    <div>
                      <p className="text-xs text-gray-500">{t('houseType')}</p>
                      <p className="text-sm sm:text-base font-bold text-primary">
                        {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                      </p>
                    </div>
                  </div>
                {dom.pocet_izieb && (
                  <div className="flex items-center gap-2">
                    <Grid2x2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">{t('rooms')}</p>
                      <p className="text-sm sm:text-base font-bold text-primary">{dom.pocet_izieb}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-3 sm:w-6 sm:h-4 border-2 border-primary rounded-sm" />
                    <div>
                      <p className="text-xs text-gray-500">{t('builtArea')}</p>
                    <p className="text-sm sm:text-base font-bold text-primary">{dom.zastavana_plocha} m²</p>
                  </div>
                </div>
                {dom.uzitkova_plocha && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    <div>
                      <p className="text-xs text-gray-500">{t('usableArea')}</p>
                      <p className="text-sm sm:text-base font-bold text-primary">{dom.uzitkova_plocha} m²</p>
                    </div>
                  </div>
                )}
                {dom.energeticky_certifikat && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">{t('energyClass')}</p>
                      <p className="text-sm sm:text-base font-bold text-primary">A0</p>
                      {isTicabhouse && (
                        <p className="text-xs text-gray-500 mt-1">{t('a0CertificateOption')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Obrázok základnej konfigurácie - pre Prosto House - hneď pod parametre */}
            {isProstoHouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">📸 {t('basicConfiguration')}</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={`${dom.nazov} - ${t('basicConfiguration')}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-blue-800 mt-3 text-center font-medium">
                  {t('basicConfigDesc')}
                </p>
              </Card>
            )}

            {/* Možnosti využitia - pre Prosto House */}
            {isProstoHouse && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">✔ {t('usageOptions')}</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('familyHouseOption')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('a0CertificateOption')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('recreationalOption')}</span>
                  </li>
                </ul>
              </Card>
            )}

            {/* Informačné panely - pre všetky Prosto House domy - PRESUNUTÉ NA PRAVÚ STRANU */}
            {isProstoHouse && (
              <div className="grid grid-cols-2 gap-2">
                {/* Komplet pre montáž */}
                <Card className="overflow-hidden border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center gap-1.5 p-2 text-xs sm:text-sm font-semibold text-amber-900 border-b border-amber-200">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('assemblyKit')}
                  </div>
                  <div className="px-2 pb-2 text-xs text-amber-800 space-y-0.5 pt-1.5">
                    <p>• {t('panelAssemblyWoodConstruction')}</p>
                    <p>• {t('panelAssemblyExteriorWalls')}</p>
                    <p>• {t('panelAssemblyRoof')}</p>
                    <p>• {t('panelAssemblyWindowsDouble')}</p>
                    <p>• {t('panelAssemblyDoorsDouble')}</p>
                    <p>• {t('panelAssemblyMembrane')}</p>
                    <p>• {t('panelAssemblyInsulation')}</p>
                    <p>• {t('panelAssemblyVaporBarrier')}</p>
                    <p>• {t('panelAssemblyFloor')}</p>
                    <p className="text-red-600 font-medium mt-1">{t('panelAssemblyPainting')}</p>
                  </div>
                </Card>

                {/* Elektroinštalácia */}
                <Card className="overflow-hidden border border-yellow-200 bg-yellow-50/50">
                  <div className="flex items-center gap-1.5 p-2 text-xs sm:text-sm font-semibold text-yellow-900 border-b border-yellow-200">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('electricalInstallation')}
                  </div>
                  <div className="px-2 pb-2 text-xs text-yellow-800 space-y-0.5 pt-1.5">
                    <p>• {t('panelElectricalCables')}</p>
                    <p>• {t('panelElectricalPanel')}</p>
                    <p>• {t('panelElectricalConduit')}</p>
                    <p>• {t('panelElectricalBoxes')}</p>
                    <p className="text-red-600 font-medium mt-1">{t('panelElectricalNotIncluded')}</p>
                  </div>
                </Card>

                {/* Voda a kanalizácia */}
                <Card className="overflow-hidden border border-blue-200 bg-blue-50/50">
                  <div className="flex items-center gap-1.5 p-2 text-xs sm:text-sm font-semibold text-blue-900 border-b border-blue-200">
                    <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('waterAndSewage')}
                  </div>
                  <div className="px-2 pb-2 text-xs text-blue-800 space-y-0.5 pt-1.5">
                    <p>• {t('panelWaterPipes')}</p>
                    <p>• {t('panelWaterValves')}</p>
                    <p>• {t('panelWaterSewagePipes')}</p>
                    <p>• {t('panelWaterPressureTest')}</p>
                    <p className="text-red-600 font-medium mt-1">{t('panelWaterProtocols')}</p>
                  </div>
                </Card>

                {/* Základy */}
                <Card className="overflow-hidden border border-orange-200 bg-orange-50/50">
                  <div className="flex items-center gap-1.5 p-2 text-xs sm:text-sm font-semibold text-orange-900 border-b border-orange-200">
                    <Landmark className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('foundationsPanel')}
                  </div>
                  <div className="px-2 pb-2 text-xs text-orange-800 space-y-0.5 pt-1.5">
                    <p>• {t('panelFoundationScrews')}</p>
                    <p>• {t('panelFoundationMinPrice')}</p>
                    <p>• {t('panelFoundationFinalPrice')}</p>
                    <p className="text-red-600 font-medium mt-1">{t('panelFoundationPrepWork')}</p>
                  </div>
                </Card>

                {/* Interiér */}
                <Card id="interier-finis-panel" className="overflow-hidden border border-emerald-200 bg-emerald-50/50 col-span-2">
                  <div className="flex items-center gap-1.5 p-2 text-xs sm:text-sm font-semibold text-emerald-900 border-b border-emerald-200">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('interiorFinishPanel')}
                  </div>
                  <div className="px-2 pb-2 text-xs text-emerald-800 space-y-0.5 pt-1.5">
                    <p>• {t('panelInteriorPartitions')}</p>
                    <p className="text-red-600 font-medium">{t('panelInteriorPainting')}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Floating panel s cenami pre Flat 1,5 - pravá strana */}
            {isProstoHouse && (dom.nazov?.includes("Flat 1,5") || dom.nazov?.includes("Flat House 1,5")) && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorFlat15
                  dom={dom}
                montazHolodomu={montazHolodomu}
                setMontazHolodomu={setMontazHolodomu}
                izolaciaNavysenie={izolaciaNavysenie}
                setIzolaciaNavysenie={setIzolaciaNavysenie}
                zaklady={zaklady}
                setZaklady={setZaklady}
                vstupneDvere={vstupneDvere}
                setVstupneDvere={setVstupneDvere}
                elektroinstalacia={elektroinstalacia}
                setElektroinstalacia={setElektroinstalacia}
                vodaKanalizacia={vodaKanalizacia}
                setVodaKanalizacia={setVodaKanalizacia}
                sanitaKomplet={sanitaKomplet}
                setSanitaKomplet={setSanitaKomplet}
                bojler={bojler}
                setBojler={setBojler}
                tepelneCerpadlo={tepelneCerpadlo}
                setTepelneCerpadlo={setTepelneCerpadlo}
                rekuperacia={rekuperacia}
                setRekuperacia={setRekuperacia}
                pripojkaSiete={pripojkaSiete}
                setPripojkaSiete={setPripojkaSiete}
                stresneOkno={stresneOkno}
                setStresneOkno={setStresneOkno}
                bocneOknoFixne={bocneOknoFixne}
                setBocneOknoFixne={setBocneOknoFixne}
                bocneOknoVyklopne90={bocneOknoVyklopne90}
                setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                bocneOknoVyklopne55={bocneOknoVyklopne55}
                setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                povrchokaOkien={povrchokaOkien}
                setPovrchokaOkien={setPovrchokaOkien}
                tonovaneSkla={tonovaneSkla}
                setTonovaneSkla={setTonovaneSkla}
                vonkajsiaFasada={vonkajsiaFasada}
                setVonkajsiaFasada={setVonkajsiaFasada}
                interierFinis={interierFinis}
                setInterierFinis={setInterierFinis}
                vnutornePodlahy={vnutornePodlahy}
                setVnutornePodlahy={setVnutornePodlahy}
                podlahovVykurovanie={podlahovVykurovanie}
                setPodlahovVykurovanie={setPodlahovVykurovanie}
                interieroveDvere={interieroveDvere}
                setInterieroveDvere={setInterieroveDvere}
                pergola={pergola}
                setPergola={setPergola}
                inziniering={inziniering}
                setInziniering={setInziniering}
                projektA0={projektA0}
                setProjektA0={setProjektA0}
                revizna={revizna}
                setRevizna={setRevizna}
                doprava={doprava}
                setDoprava={setDoprava}
                showOnlySummary={true}
                />
                </div>
                )}

            {/* Floating panel pre Nord */}
            {isProstoHouse && dom.nazov?.includes("Nord") && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorNord
                  dom={dom}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                />
              </div>
            )}

            {/* Floating panel pre Fjord */}
            {isProstoHouse && dom.nazov?.includes("Fjord") && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorFjord
                  dom={dom}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                />
              </div>
            )}

            {/* Floating panel pre Flat Double */}
            {isProstoHouse && dom.nazov?.includes("Flat Double") && !dom.nazov?.includes("1,5") && !dom.nazov?.includes("1.5") && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorFlatDouble 
                  dom={dom}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                />
              </div>
            )}

            {/* Floating panel pre Flat 72 */}
            {isProstoHouse && dom.nazov?.includes("Flat 72") && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorFlat72
                  dom={dom}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                />
              </div>
            )}

            {/* Floating panel pre ostatné Prosto House domy (nie Nord, nie Fjord, nie Flat 1,5, nie Flat Double, nie Flat 72) */}
            {isProstoHouse && !dom.nazov?.includes("Nord") && !dom.nazov?.includes("Fjord") && !dom.nazov?.includes("Flat 1,5") && !dom.nazov?.includes("Flat House 1,5") && !dom.nazov?.includes("Flat Double") && !dom.nazov?.includes("Flat 72") && (
              <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                <KonfiguratorProstoHouse 
                  dom={dom}
                  montazHolodomu={montazHolodomu}
                  setMontazHolodomu={setMontazHolodomu}
                  izolaciaNavysenie={izolaciaNavysenie}
                  setIzolaciaNavysenie={setIzolaciaNavysenie}
                  zaklady={zaklady}
                  setZaklady={setZaklady}
                  predlzenie={predlzenie}
                  setPredlzenie={setPredlzenie}
                  vstupneDvere={vstupneDvere}
                  setVstupneDvere={setVstupneDvere}
                  elektroinstalacia={elektroinstalacia}
                  setElektroinstalacia={setElektroinstalacia}
                  vodaKanalizacia={vodaKanalizacia}
                  setVodaKanalizacia={setVodaKanalizacia}
                  sanitaKomplet={sanitaKomplet}
                  setSanitaKomplet={setSanitaKomplet}
                  bojler={bojler}
                  setBojler={setBojler}
                  tepelneCerpadlo={tepelneCerpadlo}
                  setTepelneCerpadlo={setTepelneCerpadlo}
                  rekuperacia={rekuperacia}
                  setRekuperacia={setRekuperacia}
                  pripojkaSiete={pripojkaSiete}
                  setPripojkaSiete={setPripojkaSiete}
                  stresneOkno={stresneOkno}
                  setStresneOkno={setStresneOkno}
                  bocneOknoFixne={bocneOknoFixne}
                  setBocneOknoFixne={setBocneOknoFixne}
                  bocneOknoVyklopne90={bocneOknoVyklopne90}
                  setBocneOknoVyklopne90={setBocneOknoVyklopne90}
                  bocneOknoVyklopne55={bocneOknoVyklopne55}
                  setBocneOknoVyklopne55={setBocneOknoVyklopne55}
                  povrchokaOkien={povrchokaOkien}
                  setPovrchokaOkien={setPovrchokaOkien}
                  tonovaneSkla={tonovaneSkla}
                  setTonovaneSkla={setTonovaneSkla}
                  vonkajsiaFasada={vonkajsiaFasada}
                  setVonkajsiaFasada={setVonkajsiaFasada}
                  interierFinis={interierFinis}
                  setInterierFinis={setInterierFinis}
                  vnutornePodlahy={vnutornePodlahy}
                  setVnutornePodlahy={setVnutornePodlahy}
                  podlahovVykurovanie={podlahovVykurovanie}
                  setPodlahovVykurovanie={setPodlahovVykurovanie}
                  interieroveDvere={interieroveDvere}
                  setInterieroveDvere={setInterieroveDvere}
                  pergola={pergola}
                  setPergola={setPergola}
                  inziniering={inziniering}
                  setInziniering={setInziniering}
                  projektA0={projektA0}
                  setProjektA0={setProjektA0}
                  revizna={revizna}
                  setRevizna={setRevizna}
                  doprava={doprava}
                  setDoprava={setDoprava}
                  showOnlySummary={true}
                />
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2 sm:space-y-3">

              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold text-sm sm:text-base py-4 sm:py-5">
                  <Mail className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {t('contactUsButton')}
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base py-4 sm:py-5">
                  <Phone className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
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

          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 rounded-full px-4 py-2">
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoomLevel <= 1}
              className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed p-1"
              title="Oddialiť"
            >
              <ZoomOut className="w-6 h-6" />
            </button>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoomLevel >= 4}
              className="text-white hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed p-1"
              title="Priblížiť"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
            {zoomLevel > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                className="text-white hover:text-gray-300 p-1 ml-2"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>

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
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none relative"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {zoomLevel === 1 && lightboxImages.length > 1 ? (
              <div 
                className="flex items-center h-full absolute left-0"
                style={{
                  transform: `translateX(calc(-${lightboxIndex * 100}vw + ${swipeOffset}px))`,
                  transition: swipeStart ? 'none' : 'transform 0.3s ease-out',
                  width: `${lightboxImages.length * 100}vw`,
                }}
              >
                {lightboxImages.map((img, idx) => (
                  <div key={idx} className="w-screen h-full flex items-center justify-center flex-shrink-0">
                    <img
                      src={img}
                      alt={`Fotka ${idx + 1}`}
                      className="select-none max-w-[90vw] max-h-[80vh] object-contain"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!swipeStart && Math.abs(swipeOffset) < 10) handleZoomIn();
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Fotka ${lightboxIndex + 1}`}
                className={`select-none ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
                style={{
                  maxWidth: zoomLevel === 1 ? '90vw' : 'none',
                  maxHeight: zoomLevel === 1 ? '80vh' : 'none',
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoomLevel === 1) handleZoomIn();
                }}
              />
            )}
          </div>

          {/* Counter and zoom hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
            <div>{lightboxIndex + 1} / {lightboxImages.length}</div>
            {zoomLevel === 1 && <div className="text-xs text-gray-400 mt-1">Kliknite alebo použite koliesko myši pre zoom</div>}
            {zoomLevel > 1 && <div className="text-xs text-gray-400 mt-1">Ťahajte pre posun obrázka</div>}
          </div>

          {/* Thumbnails */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
              {lightboxImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
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