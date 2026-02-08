import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, Maximize2, Zap, CheckCircle, Phone, Mail, Settings, AlertCircle, Boxes, Grid2x2, Layers, Edit, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Hammer, Caravan, Package, Droplets, Landmark, Share2, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import PriceCalculator from "../components/PriceCalculator";
import ImageWithWatermark from "../components/ImageWithWatermark";
import HypotekaKalkulator from "../components/HypotekaKalkulator";
import PriceCalculatorTicabhouse from "../components/PriceCalculatorTicabhouse";
import FloatingPrice from "../components/FloatingPrice";
import DomGalerieManager from "../components/admin/DomGalerieManager";

import LyonKonfiguratorWrapper from "../components/LyonKonfiguratorWrapper";
import LyonSummaryPanelStandalone from "../components/LyonSummaryPanelStandalone";
import KonfiguratorTicabhouse from "../components/KonfiguratorTicabhouse";
import KonfiguratorPH001 from "./KonfiguratorPH001";
import KonfiguratorPH002 from "./KonfiguratorPH002";
import KonfiguratorPH003 from "./KonfiguratorPH003";
import KonfiguratorPH004 from "./KonfiguratorPH004";
import KonfiguratorPH005 from "./KonfiguratorPH005";
import KonfiguratorPH006 from "./KonfiguratorPH006";
import KonfiguratorPH007 from "./KonfiguratorPH007";
import KonfiguratorPH008 from "./KonfiguratorPH008";
import KonfiguratorPH009 from "./KonfiguratorPH009";

import { useLanguage } from "../components/LanguageContext";
import TranslatedDescription from "../components/TranslatedDescription";
import ShellInfoBox from "../components/ShellInfoBox";
import { prostoHouseTranslations } from "../components/translations/ProstoHouseTranslations";


export default function DetailDomu() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const domId = urlParams.get('id');
  const domSlug = urlParams.get('slug');
  const returnUrl = urlParams.get('return') || createPageUrl("Katalog");

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
    staleTime: 300000,
  });

  // MUST be at top level before any conditional returns
  const faqSchemaData = React.useMemo(() => {
    if (!dom?.faq_schema_data) return null;
    
    // Multi-language support
    const langFaq = dom.faq_schema_data[language] || dom.faq_schema_data['sk'] || dom.faq_schema_data;
    
    if (!langFaq?.faqs || langFaq.faqs.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": langFaq.faqs.map(item => ({
        "@type": "Question",
        "name": item.otazka,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.odpoved
        }
      }))
    };
  }, [dom, language]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeGaleriaTab, setActiveGaleriaTab] = useState("hlavna");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Zdieľaný stav pre Fázu 0 - Služby
  const [predajNehnutelnosti, setPredajNehnutelnosti] = useState(false);
  const [hladaniePozemku, setHladaniePozemku] = useState(false);
  const [financneSluzby, setFinancneSluzby] = useState(false);
  
  // Pre Ticabhouse - také isté služby ale rôzne názvy premenných
  const [lyonPredajNehnutelnosti, setLyonPredajNehnutelnosti] = useState(false);
  const [lyonHladamPozemok, setLyonHladamPozemok] = useState(false);
  const [lyonFinancneSluzby, setLyonFinancneSluzby] = useState(false);
  
  // Zdieľaný stav pre Fázu 1 - Hrubá stavba
  const [typStavby, setTypStavby] = useState("");
  const [nordTypStavby, setNordTypStavby] = useState("");
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
  const [vonkajsiaFasada, setVonkajsiaFasada] = useState("standard");
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

  // State pre Ticabhouse konfigurátor - predvolene REKREAČNÁ STAVBA (chata)
  const [lyonUcel, setLyonUcel] = useState("chata");
  const [lyonIzolaciaStien, setLyonIzolaciaStien] = useState("150mm");
  const [lyonIzolaciaPodlahy, setLyonIzolaciaPodlahy] = useState("150mm");
  const [lyonIzolaciaStropu, setLyonIzolaciaStropu] = useState("150mm");
  const [lyonTepelneCerpadlo, setLyonTepelneCerpadlo] = useState("nie");
  const [lyonRekuperacia, setLyonRekuperacia] = useState("nie");
  const [lyonPripravaNaRekuperaciu, setLyonPripravaNaRekuperaciu] = useState(false);
  const [lyonPodlahovoKurenie, setLyonPodlahovoKurenie] = useState(false);
  const [lyonPripravaNaKrb, setLyonPripravaNaKrb] = useState(false);
  const [lyonOchranaKachle, setLyonOchranaKachle] = useState(false);
  const [lyonKlimatizacia, setLyonKlimatizacia] = useState(false);
  const [lyonFasada, setLyonFasada] = useState("drevo_smrek");
  const [lyonStrecha, setLyonStrecha] = useState("korugovan_plech");
  const [lyonOdkvapy, setLyonOdkvapy] = useState("nie");
  const [lyonOkna, setLyonOkna] = useState("biele");
  const [lyonVchodoveDvere, setLyonVchodoveDvere] = useState("plastove");
  const [lyonObkladStien, setLyonObkladStien] = useState("smrek_8cm");
  const [lyonPodlaha, setLyonPodlaha] = useState("laminat");
  const [lyonInterieroveDvere, setLyonInterieroveDvere] = useState("kridlove");
  const [lyonElektro, setLyonElektro] = useState("eu");
  const [lyonBleskozvod, setLyonBleskozvod] = useState(false);
  const [lyonPrepat, setLyonPrepat] = useState(false);
  const [lyonPripravaNaSolarnePanely, setLyonPripravaNaSolarnePanely] = useState(false);
  const [lyonSprchovyKut, setLyonSprchovyKut] = useState("standard");
  const [lyonVana, setLyonVana] = useState(false);
  const [lyonBateria, setLyonBateria] = useState("standard");
  const [lyonSkrinka, setLyonSkrinka] = useState(false);
  const [lyonStropKupelna, setLyonStropKupelna] = useState("drevo");
  const [lyonInziniering, setLyonInziniering] = useState(false);
  const [lyonProjektACertifikacia, setLyonProjektACertifikacia] = useState(false);
  const [lyonRevizia, setLyonRevizia] = useState(false);
  const [lyonZaklady, setLyonZaklady] = useState("bez");
  const [lyonMontaz, setLyonMontaz] = useState(false);
  const [lyonDoprava, setLyonDoprava] = useState(false);

  // State pre konfiguráciu Prosto House
  const [prostoKonfiguracia, setProstoKonfiguracia] = useState(null);

  // State pre konfiguráciu Ticabhouse
  const [ticabKonfiguracia, setTicabKonfiguracia] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.super_admin === true;
  const canManage = isAdmin || isSuperAdmin;

  // Scroll na vrch pri načítaní stránky
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [domId, domSlug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages]);

  // Track dom view
  useEffect(() => {
    if (dom && window.trackDomInteraction) {
      window.trackDomInteraction(dom.id, dom.nazov, 'view_start');
      
      return () => {
        window.trackDomInteraction(dom.id, dom.nazov, 'view_end');
      };
    }
  }, [dom]);

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

      // Schema.org structured data - Product schema
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

      let schemaScript = document.querySelector('script[type="application/ld+json"][data-schema="product"]');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.setAttribute('data-schema', 'product');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaData);

      // Cleanup old FAQ script if exists
      const oldFaqScript = document.querySelector('script[type="application/ld+json"][data-schema="faq"]');
      if (oldFaqScript) oldFaqScript.remove();

      // Set initial calculatedPrice to base price
      setCalculatedPrice(dom.zakladna_cena || 0);
    }

    // Cleanup function
    return () => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.remove();
      const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
      schemaScripts.forEach(script => {
        if (script.getAttribute('data-schema') === 'product' || script.getAttribute('data-schema') === 'faq') {
          script.remove();
        }
      });
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
        <Helmet>
          <title>Dom nenájdený | American Living</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
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

  const isProstoHouse = dom?.vyrobca === "Prosto House";
  const isTicabhouse = dom?.vyrobca === "Ticab house";
  const isJAKModules = dom?.vyrobca === "JAK Modules";

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
    setPredajNehnutelnosti(false);
    setHladaniePozemku(false);
    setFinancneSluzby(false);
    setTypStavby("");
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
    setVonkajsiaFasada("standard");
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {faqSchemaData && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(faqSchemaData)}
          </script>
        </Helmet>
      )}
      {/* Back Button */}
      <div className="bg-white border-b sticky z-[60] shadow-md" style={{ top: '2.5rem' }}>
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <Link to={returnUrl}>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs sm:text-sm h-8 sm:h-9 font-bold">
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
          {/* Názov domu - mobilné zobrazenie */}
          <h1 className="lg:hidden text-lg font-bold text-primary mt-2">
            {dom.nazov}
          </h1>
        </div>
      </div>

      {/* Admin Panel */}
      {canManage && showAdminPanel && (
        <div className="container mx-auto px-4 py-6">
          <DomGalerieManager dom={dom} onUpdate={() => {}} />
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 max-w-full overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '1.5rem' }}>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
          {/* Ľavý stĺpec - Galéria */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 w-full max-w-full overflow-hidden"
          >
            {/* Hlavný obrázok */}
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 cursor-pointer"
              onClick={() => openLightbox(allImages, selectedImage)}
            >
              <ImageWithWatermark
                  src={allImages[selectedImage]}
                  alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[allImages[selectedImage]] || `${dom.nazov} - obrázok ${selectedImage + 1}`}
                  className="w-full h-full object-contain bg-gray-100"
                  priority={true}
                />
              <div className="absolute top-4 left-4 space-y-2">
                {dom.celorocny && (
                  <Badge className="bg-accent text-white px-5 py-3 text-sm sm:text-base font-bold shadow-xl border-2 border-white animate-pulse">✔ {t('yearRound')}</Badge>
                )}
                {dom.energeticky_certifikat && (
                  <Badge className="bg-green-600 text-white px-5 py-3 text-sm sm:text-base font-bold shadow-xl border-2 border-white animate-pulse">⚡ {t('certificateA0')}</Badge>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-md sm:rounded-lg overflow-hidden border-2 transition-all w-full ${
                      selectedImage === index
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[img] || `Miniatúra ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 2D a 3D Pôdorysy - hneď pod titulnou fotkou */}
            {(dom.podorys_2d || dom.podorys_3d) && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                  <Grid2x2 className="w-5 h-5 text-primary" />
                  📐 {t('floorPlans')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {dom.podorys_2d && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">{t('twoD')} {t('floorPlan')}</p>
                      <div 
                        className="rounded-lg overflow-hidden bg-gray-50 border cursor-pointer"
                        onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), 0)}
                      >
                        <ImageWithWatermark
                          src={dom.podorys_2d}
                          alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.podorys_2d] || "2D Pôdorys domu"}
                          className="w-full h-auto object-contain hover:opacity-90"
                        />
                      </div>
                    </div>
                  )}
                  {dom.podorys_3d && (
                   <div>
                     <Button
                       variant="outline"
                       className="w-full mb-1 sm:mb-2 text-xs sm:text-sm font-bold border-2 border-primary hover:bg-primary hover:text-white bg-gradient-to-r from-primary/10 to-purple-100 animate-pulse"
                       onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), dom.podorys_2d ? 1 : 0)}
                     >
                       <Grid2x2 className="mr-2 w-5 h-5" />
                       🎯 {t('threeDFloorPlan')}
                     </Button>
                      <div 
                        className="rounded-lg overflow-hidden bg-gray-50 border cursor-pointer"
                        onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), dom.podorys_2d ? 1 : 0)}
                      >
                        <ImageWithWatermark
                          src={dom.podorys_3d}
                          alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.podorys_3d] || "3D Pôdorys domu"}
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
              <Card className="p-3 sm:p-4 w-full max-w-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                  🖼️ {t('galleries')} - {t('facadeOptions') || 'Možnosti fasád'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  💡 {t('facadeDescription') || 'Náš drevodom môže vyzerať klasicky ako drevodom, ale aj s modernou bielou omietkou (murovka). Nižšie si pozrite rôzne možnosti dizajnu fasády.'}
                </p>
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
                      <div className="flex gap-1 sm:gap-2 flex-wrap w-full overflow-x-auto">
                        {galeria.fotky.slice(0, 6).map((foto, fotoIndex) => (
                          <div 
                            key={fotoIndex} 
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 relative"
                          >
                            <img
                              src={foto}
                              alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[foto] || `Náhľad ${fotoIndex + 1}`}
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
                        alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[podorysUrl] || `Pôdorys ${index + 1}`}
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

            {/* Konfigurátor pre Prosto House PH-001 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-001" && (
              <KonfiguratorPH001 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-002 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-002" && (
              <KonfiguratorPH002 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-003 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-003" && (
              <KonfiguratorPH003 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-004 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-004" && (
              <KonfiguratorPH004 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-005 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-005" && (
              <KonfiguratorPH005 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-006 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-006" && (
              <KonfiguratorPH006 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-007 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-007" && (
              <KonfiguratorPH007 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-008 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-008" && (
              <KonfiguratorPH008 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre Prosto House PH-009 */}
            {isProstoHouse && dom.prosto_house_kod === "PH-009" && (
              <KonfiguratorPH009 dom={dom} isAdmin={isAdmin} />
            )}

            {/* Konfigurátor pre ostatné Ticabhouse domy (okrem Lyon a Tiny House) */}
            {isTicabhouse && !dom.nazov?.toLowerCase().includes("lyon") && !dom.nazov?.toLowerCase().includes("tiny house") && (
              <KonfiguratorTicabhouse 
                dom={dom} 
                isAdmin={isAdmin}
                onConfigChange={(config) => setTicabKonfiguracia(config)}
                predajNehnutelnosti={lyonPredajNehnutelnosti}
                setPredajNehnutelnosti={setLyonPredajNehnutelnosti}
                hladamPozemok={lyonHladamPozemok}
                setHladamPozemok={setLyonHladamPozemok}
                financneSluzby={lyonFinancneSluzby}
                setFinancneSluzby={setLyonFinancneSluzby}
                ucel={lyonUcel}
                setUcel={setLyonUcel}
                izolaciaStien={lyonIzolaciaStien}
                setIzolaciaStien={setLyonIzolaciaStien}
                izolaciaPodlahy={lyonIzolaciaPodlahy}
                setIzolaciaPodlahy={setLyonIzolaciaPodlahy}
                izolaciaStropu={lyonIzolaciaStropu}
                setIzolaciaStropu={setLyonIzolaciaStropu}
                tepelneCerpadlo={lyonTepelneCerpadlo}
                setTepelneCerpadlo={setLyonTepelneCerpadlo}
                rekuperacia={lyonRekuperacia}
                setRekuperacia={setLyonRekuperacia}
                pripravaNaRekuperaciu={lyonPripravaNaRekuperaciu}
                setPripravaNaRekuperaciu={setLyonPripravaNaRekuperaciu}
                podlahovoKurenie={lyonPodlahovoKurenie}
                setPodlahovoKurenie={setLyonPodlahovoKurenie}
                pripravaNaKrb={lyonPripravaNaKrb}
                setPripravaNaKrb={setLyonPripravaNaKrb}
                ochranaKachle={lyonOchranaKachle}
                setOchranaKachle={setLyonOchranaKachle}
                klimatizacia={lyonKlimatizacia}
                setKlimatizacia={setLyonKlimatizacia}
                fasada={lyonFasada}
                setFasada={setLyonFasada}
                strecha={lyonStrecha}
                setStrecha={setLyonStrecha}
                odkvapy={lyonOdkvapy}
                setOdkvapy={setLyonOdkvapy}
                okna={lyonOkna}
                setOkna={setLyonOkna}
                vchodoveDvere={lyonVchodoveDvere}
                setVchodoveDvere={setLyonVchodoveDvere}
                obkladStien={lyonObkladStien}
                setObkladStien={setLyonObkladStien}
                podlaha={lyonPodlaha}
                setPodlaha={setLyonPodlaha}
                interieroveDvere={lyonInterieroveDvere}
                setInterieroveDvere={setLyonInterieroveDvere}
                elektro={lyonElektro}
                setElektro={setLyonElektro}
                bleskozvod={lyonBleskozvod}
                setBleskozvod={setLyonBleskozvod}
                prepat={lyonPrepat}
                setPrepat={setLyonPrepat}
                pripravaNaSolarnePanely={lyonPripravaNaSolarnePanely}
                setPripravaNaSolarnePanely={setLyonPripravaNaSolarnePanely}
                sprchovyKut={lyonSprchovyKut}
                setSprchovyKut={setLyonSprchovyKut}
                vana={lyonVana}
                setVana={setLyonVana}
                bateria={lyonBateria}
                setBateria={setLyonBateria}
                skrinka={lyonSkrinka}
                setSkrinka={setLyonSkrinka}
                stropKupelna={lyonStropKupelna}
                setStropKupelna={setLyonStropKupelna}
                inziniering={lyonInziniering}
                setInziniering={setLyonInziniering}
                projektACertifikacia={lyonProjektACertifikacia}
                setProjektACertifikacia={setLyonProjektACertifikacia}
                revizia={lyonRevizia}
                setRevizia={setLyonRevizia}
                zaklady={lyonZaklady}
                setZaklady={setLyonZaklady}
                montaz={lyonMontaz}
                setMontaz={setLyonMontaz}
                doprava={lyonDoprava}
                setDoprava={setLyonDoprava}
              />
            )}

            {/* Konfigurátor pre Lyon (Ticab house) */}
            {isTicabhouse && dom.nazov?.toLowerCase().includes("lyon") && (
              <LyonKonfiguratorWrapper
                dom={dom}
                onConfigChange={(config) => setTicabKonfiguracia(config)}
                ucel={lyonUcel}
                setUcel={setLyonUcel}
                izolaciaStien={lyonIzolaciaStien}
                setIzolaciaStien={setLyonIzolaciaStien}
                izolaciaPodlahy={lyonIzolaciaPodlahy}
                setIzolaciaPodlahy={setLyonIzolaciaPodlahy}
                izolaciaStropu={lyonIzolaciaStropu}
                setIzolaciaStropu={setLyonIzolaciaStropu}
                tepelneCerpadlo={lyonTepelneCerpadlo}
                setTepelneCerpadlo={setLyonTepelneCerpadlo}
                rekuperacia={lyonRekuperacia}
                setRekuperacia={setLyonRekuperacia}
                pripravaNaRekuperaciu={lyonPripravaNaRekuperaciu}
                setPripravaNaRekuperaciu={setLyonPripravaNaRekuperaciu}
                podlahovoKurenie={lyonPodlahovoKurenie}
                setPodlahovoKurenie={setLyonPodlahovoKurenie}
                pripravaNaKrb={lyonPripravaNaKrb}
                setPripravaNaKrb={setLyonPripravaNaKrb}
                ochranaKachle={lyonOchranaKachle}
                setOchranaKachle={setLyonOchranaKachle}
                klimatizacia={lyonKlimatizacia}
                setKlimatizacia={setLyonKlimatizacia}
                fasada={lyonFasada}
                setFasada={setLyonFasada}
                strecha={lyonStrecha}
                setStrecha={setLyonStrecha}
                odkvapy={lyonOdkvapy}
                setOdkvapy={setLyonOdkvapy}
                okna={lyonOkna}
                setOkna={setLyonOkna}
                vchodoveDvere={lyonVchodoveDvere}
                setVchodoveDvere={setLyonVchodoveDvere}
                obkladStien={lyonObkladStien}
                setObkladStien={setLyonObkladStien}
                podlaha={lyonPodlaha}
                setPodlaha={setLyonPodlaha}
                interieroveDvere={lyonInterieroveDvere}
                setInterieroveDvere={setLyonInterieroveDvere}
                elektro={lyonElektro}
                setElektro={setLyonElektro}
                bleskozvod={lyonBleskozvod}
                setBleskozvod={setLyonBleskozvod}
                prepat={lyonPrepat}
                setPrepat={setLyonPrepat}
                pripravaNaSolarnePanely={lyonPripravaNaSolarnePanely}
                setPripravaNaSolarnePanely={setLyonPripravaNaSolarnePanely}
                sprchovyKut={lyonSprchovyKut}
                setSprchovyKut={setLyonSprchovyKut}
                vana={lyonVana}
                setVana={setLyonVana}
                bateria={lyonBateria}
                setBateria={setLyonBateria}
                skrinka={lyonSkrinka}
                setSkrinka={setLyonSkrinka}
                stropKupelna={lyonStropKupelna}
                setStropKupelna={setLyonStropKupelna}
                inziniering={lyonInziniering}
                setInziniering={setLyonInziniering}
                projektACertifikacia={lyonProjektACertifikacia}
                setProjektACertifikacia={setLyonProjektACertifikacia}
                revizia={lyonRevizia}
                setRevizia={setLyonRevizia}
                zaklady={lyonZaklady}
                setZaklady={setLyonZaklady}
                montaz={lyonMontaz}
                setMontaz={setLyonMontaz}
                doprava={lyonDoprava}
                setDoprava={setLyonDoprava}
                predajNehnutelnosti={lyonPredajNehnutelnosti}
                setPredajNehnutelnosti={setLyonPredajNehnutelnosti}
                chcemPozemok={lyonHladamPozemok}
                setChcemPozemok={setLyonHladamPozemok}
                financneSluzby={lyonFinancneSluzby}
                setFinancneSluzby={setLyonFinancneSluzby}
              />
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
            className="space-y-4 sm:space-y-6 lg:self-start w-full max-w-full overflow-hidden"
          >
            {/* Hlavička */}
            <div>
              {/* Mobilná verzia - cena hore */}
              <div className="lg:hidden mb-3">
                <div className="bg-gray-900 text-white rounded-xl p-3 shadow-xl border-2 border-primary">
                  <p className="text-xs mb-1 text-gray-300">{isTicabhouse ? t('basicConfigPrice') : t('priceFromLabel')}</p>
                  <p className="text-3xl font-black">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                  <p className="text-xs text-gray-300 mt-0.5">{t('withVAT')}</p>
                </div>
              </div>

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
              <p className="text-base sm:text-lg font-semibold text-primary mb-3">{t('ceilingHeight270A0')}</p>
              
              {/* Desktop verzia - cena */}
              <div className="hidden lg:flex items-baseline gap-2 flex-wrap bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl border-2 border-primary/30 shadow-lg">
                <span className="text-base text-gray-600 font-semibold">{isTicabhouse ? t('basicConfigPrice') : t('priceFromLabel')}</span>
                <span className="text-4xl md:text-5xl font-black text-primary">
                  {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                </span>
                <span className="text-base text-gray-600 font-semibold">{t('withVAT')}</span>
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
                  <p className="text-lg sm:text-xl font-bold text-green-600 mb-2">
                    Za vyššie uvedenú cenu dostávate dom na kľúč, ktorý je pripravený na okamžité použitie
                  </p>
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
              
              {/* Identifikačné číslo pre Prosto House */}
              {isProstoHouse && dom.prosto_house_kod && (
                <div className="mb-3 p-3 bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Identifikačné číslo</p>
                      <p className="text-lg font-black text-red-600">{dom.prosto_house_kod}</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                {dom.pocet_modulov && (
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500">Moduly</p>
                      <p className="text-sm sm:text-base font-bold text-primary">{dom.pocet_modulov}</p>
                    </div>
                  </div>
                )}
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
                {dom.terasa_plocha && (
                  !isTicabhouse || 
                  (dom.popis && (dom.popis.includes("vstavaná") || dom.popis.includes("zabudovaná") || dom.popis.includes("Vstavaná") || dom.popis.includes("Zabudovaná"))) ||
                  (dom.specifikacia && !dom.specifikacia.includes("Terasa: ❌"))
                ) && (
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-gray-500">Terasa</p>
                      <p className="text-sm sm:text-base font-bold text-primary">{dom.terasa_plocha} m²</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Obrázok základnej konfigurácie - pre Prosto House - hneď pod parametre */}
            {isProstoHouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">📸 {t('basicConfiguration') || 'Základná konfigurácia'}</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <ImageWithWatermark 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.zakladna_konfiguracia_obrazok] || `${dom.nazov} - ${t('basicConfiguration')}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Shell Info Box - ceny a obsah hrubej stavby */}
                {(() => {
                  // Mapovanie podľa názvu domu (keďže prosto_house_kod môže chýbať)
                  const nameToPrice = {
                    'Barn': { kit: 20900, assembly: 4875 }, // PH-001
                    'Nord': { kit: 49500, assembly: 14850 }, // PH-002
                    'Flat House 1,5': { kit: 44900, assembly: 13470 }, // PH-003
                    'Flat 72': { kit: 31700, assembly: 7925 }, // PH-004
                    'Fjord': { kit: 59000, assembly: 17700 }, // PH-005
                    'Barn Double': { kit: 36900, assembly: 9225 }, // PH-006
                    'Double Barn': { kit: 36900, assembly: 9225 }, // PH-006
                    'A-Frame': { kit: 22700, assembly: 5675 }, // PH-007
                    'Flat Double': { kit: 59900, assembly: 17970 }, // PH-008
                    'Flat Small': { kit: 19500, assembly: 4875 } // PH-009
                  };
                  
                  let prices = null;
                  
                  // Skús najprv podľa prosto_house_kod
                  if (dom.prosto_house_kod) {
                    const codeMap = {
                      'PH-001': { kit: 20900, assembly: 4875 },
                      'PH-002': { kit: 49500, assembly: 14850 },
                      'PH-003': { kit: 44900, assembly: 13470 },
                      'PH-004': { kit: 31700, assembly: 7925 },
                      'PH-005': { kit: 59000, assembly: 17700 },
                      'PH-006': { kit: 36900, assembly: 9225 },
                      'PH-007': { kit: 22700, assembly: 5675 },
                      'PH-008': { kit: 59900, assembly: 17970 },
                      'PH-009': { kit: 19500, assembly: 4875 }
                    };
                    prices = codeMap[dom.prosto_house_kod];
                  }
                  
                  // Ak nie, skús podľa názvu
                  if (!prices) {
                    for (const [name, price] of Object.entries(nameToPrice)) {
                      if (dom.nazov?.includes(name)) {
                        prices = price;
                        break;
                      }
                    }
                  }
                  
                  const tProsto = (key) => prostoHouseTranslations[language]?.[key] || prostoHouseTranslations['sk']?.[key] || key;
                  return prices ? <ShellInfoBox basePriceKit={prices.kit} assemblyPrice={prices.assembly} t={tProsto} /> : null;
                })()}
                
                <p className="text-sm text-blue-800 mt-3 text-center font-medium">
                  {t('basicConfigDesc') || 'Základná konfigurácia domu'}
                </p>
              </Card>
            )}

            {/* Možnosti využitia - pre Prosto House */}
            {isProstoHouse && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">✔ {t('usageOptions') || 'Možnosti využitia'}</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('familyHouseOption') || 'Rodinný dom s možnosťou kolaudácie'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('a0CertificateOption') || 'Možnosť energetického certifikátu A0'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('recreationalOption') || 'Rekreačná budova (chata/záhradný domček)'}</span>
                  </li>
                </ul>
              </Card>
            )}

            {/* Informačné panely - Komplet pre montáž, Elektroinstalácia, Voda a kanalizácia, Základy, Interiér - pre všetky Prosto House */}
            {isProstoHouse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                {/* Komplet pre montáž */}
                <Card className="overflow-hidden border border-amber-200 bg-amber-50/50">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-amber-900 mb-2 text-xs sm:text-sm">📦 {t('assemblyKit')}</h4>
                    <ul className="space-y-1 text-xs text-amber-800">
                      <li>• {t('assemblyWoodenFrame')}</li>
                      <li>• {t('assemblyExteriorWalls')}</li>
                      <li>• {t('assemblyRoof')}</li>
                      <li>• {t('assemblyWindows')}</li>
                      <li>• {t('assemblyDoors')}</li>
                      <li>• {t('assemblyHydroMembrane')}</li>
                      <li>• {t('assemblyInsulation')}</li>
                      <li>• {t('assemblyVaporBarrier')}</li>
                      <li>• {t('assemblyRoughFloor')}</li>
                    </ul>
                    <p className="text-xs text-amber-700 font-semibold mt-2">{t('paintingPrice')}</p>
                  </div>
                </Card>

                {/* Elektroinstalácia */}
                <Card className="overflow-hidden border border-yellow-200 bg-yellow-50/50">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-yellow-900 mb-2 text-xs sm:text-sm">⚡ {t('electrical')}</h4>
                    <ul className="space-y-1 text-xs text-yellow-800">
                      <li>• {t('electricalCables')}</li>
                      <li>• {t('electricalDistributors')}</li>
                      <li>• {t('electricalConduit')}</li>
                      <li>• {t('electricalBoxes')}</li>
                    </ul>
                    <p className="text-xs text-red-600 font-semibold mt-2">{t('electricalNotIncluded')}</p>
                  </div>
                </Card>

                {/* Voda a kanalizácia */}
                <Card className="overflow-hidden border border-blue-200 bg-blue-50/50">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-blue-900 mb-2 text-xs sm:text-sm">💧 {t('waterSewage')}</h4>
                    <ul className="space-y-1 text-xs text-blue-800">
                      <li>• {t('waterPipes')}</li>
                      <li>• {t('waterValves')}</li>
                      <li>• {t('sewagePipes')}</li>
                      <li>• {t('waterPressureTest')}</li>
                    </ul>
                    <p className="text-xs text-red-600 font-semibold mt-2">{t('waterNotIncluded')}</p>
                  </div>
                </Card>

                {/* Základy */}
                <Card className="overflow-hidden border border-orange-200 bg-orange-50/50">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-orange-900 mb-2 text-xs sm:text-sm">🏗️ {t('foundationsTitle')}</h4>
                    <ul className="space-y-1 text-xs text-orange-800">
                      <li>• {t('foundationsTypes')}</li>
                      <li>• {t('foundationsMinPrice')}</li>
                      <li>• {t('foundationsFinalPrice')}</li>
                    </ul>
                    <p className="text-xs text-red-600 font-semibold mt-2">{t('foundationsNotIncluded')}</p>
                  </div>
                </Card>

                {/* Interiér finiš */}
                <Card className="overflow-hidden border border-emerald-200 bg-emerald-50/50">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-emerald-900 mb-2 text-xs sm:text-sm">🏠 {t('interiorFinish')}</h4>
                    <ul className="space-y-1 text-xs text-emerald-800">
                      <li>• {t('interiorPartitions')}</li>
                    </ul>
                    <p className="text-xs text-red-600 font-semibold mt-2">{t('interiorPainting')}</p>
                  </div>
                </Card>
              </div>
            )}



            {/* Obrázok základnej konfigurácie - pre Ticabhouse */}
            {isTicabhouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">📸 {t('basicConfiguration')}</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <ImageWithWatermark 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.zakladna_konfiguracia_obrazok] || `${dom.nazov} - základná konfigurácia`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-xs sm:text-sm text-blue-800 mt-2 text-center font-medium">
                  {t('basicConfigDesc')}
                </p>
              </Card>
            )}

            {/* Štandardná výbava pre Ticabhouse */}
            {isTicabhouse && (
              <div className="space-y-3 sm:space-y-4">
                <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
                  <h3 className="text-sm sm:text-base font-bold text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    {t('basicHouseConfig')}
                  </h3>
                  {(dom.nazov === 'Lyon' || dom.nazov === 'Happy Wife' || dom.nazov?.includes('Lyon') || dom.nazov?.includes('Happy Wife')) && (
                    <p className="text-xs sm:text-sm text-gray-700 mb-4 leading-relaxed">
                      {t('basicConfigDescription')}
                    </p>
                  )}
                  
                  {/* Špecifický obsah pre každý dom zo specifikacia - správne unikátne pre každý dom */}
                  {dom.specifikacia && dom.nazov !== "Model HAPPY WIFE" && (
                    <div className="mb-4 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
                      />
                    </div>
                  )}
                  
                  {/* Špecifický obsah pre Happy Wife - s prekladmi */}
                  {dom.nazov === "Model HAPPY WIFE" && (
                    <div className="mb-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('heatingLabel')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('floorHeatingIncluded')}</li>
                      </ul>
                      
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('sanitaryLabel')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('bathroomIncluded')}</li>
                      </ul>
                      
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('kitchenUnit')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('kitchenIncluded')}</li>
                      </ul>
                      
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('interiorLabel')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('fullyAssembledInterior')}</li>
                        <li>{t('interiorSelectionFromSamples')}</li>
                      </ul>
                      
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('airConditioningLabel')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('acPreparationIncluded')}</li>
                      </ul>
                      
                      <p className="font-semibold text-gray-800 mb-2">✔ {t('projectCertification')}</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
                        <li>{t('projectEnergyClassification')}</li>
                      </ul>
                      
                      <p className="text-red-600 font-semibold mt-3">• {t('terrace')}: ❌ {t('additionalCost')}</p>
                    </div>
                  )}

                  {/* 2 stĺpce - V CENE a ZA PRÍPLATOK */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Ľavý stĺpec - V CENE */}
                    <div className="bg-green-100 border-2 border-green-400 rounded-lg p-3">
                      <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ✅ {t('includedInPrice') || 'Zahrnuté v cene'}
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-green-900">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('frame') || 'Rám'}:</strong> {t('driedCalibratedWood') || 'Sušené kalibrované drevo'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('insulationLabel') || 'Izolácia'}:</strong> {t('standardInsulation') || 'Štandard (150/200 mm)'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('windows') || 'Okná'}:</strong> {t('doubleGlazedLaminated') || 'Dvojkomorové, laminované'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('doors') || 'Dvere'}:</strong> {t('metalPlastic') || 'Kovoplastové'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('facadeLabel') || 'Fasáda'}:</strong> {t('scandinavianSpruce') || 'Škandinavsky smrek'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('roofLabel') || 'Strecha'}:</strong> {t('corrugatedSheet') || 'Vlnitý plech/škridplech'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('interiorLabel') || 'Interiér'}:</strong> {t('woodenCladding') || 'Drevený obklad'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('electricalInstallationLabel') || 'Elektroinštalácia'}:</strong> {t('copperWiringLED') || 'Medené rozvody, LED'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('sanitaryLabel') || 'Sanita'}:</strong> {t('showerWCBoiler') || 'Sprcha, WC, Bojler 80l'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('heatingLabel') || 'Kúrenie'}:</strong> {t('heatingPreparation') || 'Príprava na konvektory'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('airConditioningLabel') || 'Klimatizácia'}:</strong> {t('acPreparation') || 'Príprava'}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Pravý stĺpec - ZA PRÍPLATOK */}
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                      <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        ❌ {t('additionalCost') || 'Za príplatok'}
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-red-900">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('floorHeating') || 'Podlahové kúrenie'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('washbasinWithCabinet') || 'Umývadlo so skrinkou'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('kitchenUnit') || 'Kuchynská linka'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('terrace') || 'Terasa'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('transportAndAssembly') || 'Doprava a montáž'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('foundationsSection') || 'Základy'}</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('externalConnections') || 'Vonkajšie prípojky'}</strong> ({t('waterElectricitySewage') || 'voda, elektrina, kanál'})</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span><strong>{t('craneTruck') || 'Žeriav/nákladné auto'}</strong> {t('forInstallation') || 'na osadenie'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>{t('modularAdvantage')}</strong> {t('modularAdvantageDesc')}
                    </p>
                  </div>
                </Card>
              </div>
            )}













            {/* Kalkulátor hypotéky - skryté pre mobilné domy, A-Frame a Prosto House */}
            {dom.kategoria !== "mobilne_domy" && !dom.nazov?.includes("A-Frame") && !dom.nazov?.includes("A-frame") && !isProstoHouse && (
              <div className="mb-4">
                <HypotekaKalkulator 
                  cenaDoma={dom.zakladna_cena} 
                  dom={dom}
                  user={user}
                  aktualnaKonfiguracia={
                    isTicabhouse ? ticabKonfiguracia : isProstoHouse ? prostoKonfiguracia : null
                  }
                  onNastavA0Prvky={isTicabhouse ? () => {
                  setLyonIzolaciaStien("250mm");
                  setLyonIzolaciaPodlahy("200mm");
                  setLyonIzolaciaStropu("200mm");
                  setLyonTepelneCerpadlo("ano");
                  setLyonRekuperacia("ano");
                  setLyonPripravaNaSolarnePanely(true);
                  setLyonBleskozvod(true);
                  setLyonPrepat(true);
                  setLyonInziniering(true);
                  setLyonProjektACertifikacia(true);
                  setLyonZaklady("pasove");
                  setLyonUcel("rodinny");
                } : isProstoHouse ? () => {
                  setIzolaciaNavysenie("premium");
                  setTepelneCerpadlo(true);
                  setRekuperacia(true);
                  setProjektA0(true);
                  setZaklady("pasove");
                } : null}
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

              {/* Social Share Buttons */}
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800">{t('shareHouse') || 'Zdieľať dom'}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                        'facebook-share',
                        'width=600,height=400'
                      );
                    }}
                  >
                    <Button size="sm" className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs">
                      <Facebook className="mr-1 w-3 h-3" />
                      Facebook
                    </Button>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${dom.nazov} - ${dom.vyrobca} | American Living`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${dom.nazov} - ${dom.vyrobca} | American Living`)}`,
                        'twitter-share',
                        'width=600,height=400'
                      );
                    }}
                  >
                    <Button size="sm" className="w-full bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white text-xs">
                      <svg className="mr-1 w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter
                    </Button>
                  </a>
                </div>
              </Card>

            </div>

            {/* Sidebar pre všetky Ticabhouse domy - rovnaké ako Lyon (okrem Tiny House) */}
            {isTicabhouse && !dom.nazov?.toLowerCase().includes("tiny house") && (
              <div className="space-y-4">
                {/* Informácia o dotácii */}
                <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-700 font-sans leading-tight">
                        {t('dotaciaNotice')}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="lg:sticky lg:top-20 z-10 self-start" style={{ position: 'sticky', top: '80px' }}>
                  <LyonSummaryPanelStandalone
                  predajNehnutelnosti={lyonPredajNehnutelnosti}
                  hladamPozemok={lyonHladamPozemok}
                  financneSluzby={lyonFinancneSluzby}
                  ucel={lyonUcel}
                  izolaciaStien={lyonIzolaciaStien}
                  izolaciaPodlahy={lyonIzolaciaPodlahy}
                  izolaciaStropu={lyonIzolaciaStropu}
                  tepelneCerpadlo={lyonTepelneCerpadlo}
                  rekuperacia={lyonRekuperacia}
                  pripravaNaRekuperaciu={lyonPripravaNaRekuperaciu}
                  podlahovoKurenie={lyonPodlahovoKurenie}
                  pripravaNaKrb={lyonPripravaNaKrb}
                  ochranaKachle={lyonOchranaKachle}
                  klimatizacia={lyonKlimatizacia}
                  fasada={lyonFasada}
                  strecha={lyonStrecha}
                  odkvapy={lyonOdkvapy}
                  okna={lyonOkna}
                  vchodoveDvere={lyonVchodoveDvere}
                  obkladStien={lyonObkladStien}
                  interieroveDvere={lyonInterieroveDvere}
                  elektro={lyonElektro}
                  bleskozvod={lyonBleskozvod}
                  prepat={lyonPrepat}
                  pripravaNaSolarnePanely={lyonPripravaNaSolarnePanely}
                  setPripravaNaSolarnePanely={setLyonPripravaNaSolarnePanely}
                  sprchovyKut={lyonSprchovyKut}
                  vana={lyonVana}
                  bateria={lyonBateria}
                  skrinka={lyonSkrinka}
                  stropKupelna={lyonStropKupelna}
                  inziniering={lyonInziniering}
                  projektACertifikacia={lyonProjektACertifikacia}
                  revizia={lyonRevizia}
                  zaklady={lyonZaklady}
                  montaz={lyonMontaz}
                  doprava={lyonDoprava}
                  dom={dom}
                  totalPrice={ticabKonfiguracia?.celkovaCena || dom.zakladna_cena}
                  onSubmit={() => alert("Odoslanie dopytu - funkcia bude implementovaná")}
                  />

                </div>

                {/* Upozornenie pod sidebarom */}
                {(() => {
                  const isA0Complete = (
                    lyonIzolaciaStien === "250mm" &&
                    lyonIzolaciaPodlahy === "200mm" &&
                    lyonIzolaciaStropu === "200mm" &&
                    lyonTepelneCerpadlo === "ano" &&
                    lyonRekuperacia === "ano" &&
                    lyonElektro === "ge" &&
                    lyonBleskozvod &&
                    lyonPrepat &&
                    lyonInziniering &&
                    lyonProjektACertifikacia
                  );
                  
                  if (lyonUcel === "rodinny" && !isA0Complete) {
                    return (
                      <Card className="bg-yellow-50 border-2 border-yellow-400 p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-600 text-2xl">⚠️</div>
                          <div>
                            <h4 className="text-yellow-900 font-bold mb-2">{t('recreationalBuilding')}</h4>
                            <p className="text-yellow-800 text-sm mb-3">
                              {t('toApproveAsFamilyHouse') || 'Pre skolaudovanie ako rodinný dom musíte vybrať všetky povinné A0 položky označené'} <span className="text-green-600 font-bold">⚡A0</span> {t('inConfigurator') || 'v konfigurátore'}.
                            </p>
                            <div className="text-xs text-yellow-700">
                              <p className="font-semibold mb-1">{t('missingA0ItemsList') || 'Chýbajúce A0 položky'}:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {lyonIzolaciaStien !== "250mm" && <li>{t('insulation')} {t('walls')} 250mm</li>}
                                {lyonIzolaciaPodlahy !== "200mm" && <li>{t('insulation')} {t('floors')} 200mm</li>}
                                {lyonIzolaciaStropu !== "200mm" && <li>{t('insulation')} {t('roof')} 200mm</li>}
                                {lyonTepelneCerpadlo !== "ano" && <li>{t('heatPump')}</li>}
                                {lyonRekuperacia !== "ano" && <li>{t('recuperation')}</li>}
                                {lyonElektro !== "ge" && <li>GE {t('electricalInstallation')}</li>}
                                {!lyonBleskozvod && <li>{t('lightningRod')}</li>}
                                {!lyonPrepat && <li>{t('surgeProtection')}</li>}
                                {!lyonInziniering && <li>{t('engineering')}</li>}
                                {!lyonProjektACertifikacia && <li>{t('projectCertification')} A0</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  } else if (lyonUcel === "rodinny" && isA0Complete) {
                    return (
                      <Card className="bg-green-50 border-2 border-green-400 p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-green-600 text-2xl">✅</div>
                          <div>
                            <h4 className="text-green-900 font-bold mb-1">{t('familyHouseA0')}</h4>
                            <p className="text-green-800 text-sm">
                              {t('configIncludesAllA0') || 'Vaša konfigurácia zahŕňa všetky potrebné A0 položky. Dom môže byť skolaudovaný ako energeticky efektívny rodinný dom.'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  } else {
                    return (
                      <Card className="bg-blue-50 border-2 border-blue-400 p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-blue-600 text-2xl">ℹ️</div>
                          <div>
                            <h4 className="text-blue-900 font-bold mb-1">{t('recreationalBuilding')}</h4>
                            <p className="text-blue-800 text-sm">
                              {t('houseConfiguredAsRecreational') || 'Dom je nakonfigurovaný ako rekreačná stavba. Pre rodinný dom s A0 certifikátom vyberte zodpovedajúcu možnosť v konfigurátore.'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  }
                })()}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Price Display - len ak nie je JAK Modules */}
      {!isJAKModules && <FloatingPrice price={calculatedPrice} isVisible={showCalculator} />}

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button 
            className="absolute top-20 sm:top-24 right-4 text-white hover:text-gray-300 bg-red-600 hover:bg-red-700 rounded-full p-3 sm:p-4 shadow-2xl transition-all"
            style={{ zIndex: 10001 }}
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2" style={{ zIndex: 9998 }}>
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
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none relative select-none"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {zoomLevel === 1 && lightboxImages.length > 1 ? (
              <div 
                className="flex items-center justify-center h-full absolute left-0"
                style={{
                  transform: `translateX(calc(-${lightboxIndex * 100}vw + ${swipeOffset}px))`,
                  transition: swipeStart ? 'none' : 'transform 0.3s ease-out',
                  width: `${lightboxImages.length * 100}vw`,
                }}
              >
                {lightboxImages.map((img, idx) => (
                  <div key={idx} className="w-screen h-screen flex items-center justify-center flex-shrink-0 px-8">
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                      <ImageWithWatermark
                         src={img}
                         alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[img] || `Fotka ${idx + 1}`}
                         className="select-none w-auto h-auto max-w-[85vw] max-h-[85vh] object-contain"
                         onContextMenu={(e) => e.preventDefault()}
                         draggable={false}
                         priority={true}
                         onClick={(e) => {
                           e.stopPropagation();
                           if (!swipeStart && Math.abs(swipeOffset) < 10) handleZoomIn();
                         }}
                       />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-full h-full">
                <ImageWithWatermark
                  src={lightboxImages[lightboxIndex]}
                  alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[lightboxImages[lightboxIndex]] || `Fotka ${lightboxIndex + 1}`}
                  className={`select-none ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''} w-auto h-auto object-contain`}
                  priority={true}
                  style={{
                    maxWidth: zoomLevel === 1 ? '85vw' : 'none',
                    maxHeight: zoomLevel === 1 ? '85vh' : 'none',
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
              </div>
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
                  <img src={img} alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[img] || ""} className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}