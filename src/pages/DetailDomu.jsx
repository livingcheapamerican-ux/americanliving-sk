import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import DetailDomuTicabhouseInfo from "../components/DetailDomuTicabhouseInfo";
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
import DOMPurify from 'dompurify';
import { prostoHouseTranslations } from "../components/translations/ProstoHouseTranslations";
import ProstoHouseMarketing from "../components/ProstoHouseMarketing";
import TicabhouseMarketing from "../components/TicabhouseMarketing";
import ExternalReviews from "../components/ExternalReviews";
import GaleriaLightbox from "../components/GaleriaLightbox";
import YoutubePlayer from "../components/YoutubePlayer";


export default function DetailDomu() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const domId = urlParams.get('id');
  const domSlug = urlParams.get('slug');
  const returnParam = urlParams.get('return');
  const returnUrl = (returnParam && returnParam !== 'null') ? returnParam : createPageUrl("Katalog");
  
  const handleBackToCatalog = () => {
    try {
      navigate(returnUrl);
    } catch (error) {
      window.location.href = returnUrl;
    }
  };

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

  const { data: reviews } = useQuery({
    queryKey: ['external-reviews'],
    queryFn: () => base44.entities.ExternalReview.list()
  });

  const organizationId = "https://www.americanliving.sk/#organization";

  // MUST be at top level before any conditional returns
  const faqSchemaData = React.useMemo(() => {
    if (!dom?.faq_schema_data) return null;
    const langFaq = dom.faq_schema_data[language] || dom.faq_schema_data['sk'] || dom.faq_schema_data;
    if (!langFaq?.faqs || langFaq.faqs.length === 0) return null;
    const productId = `${window.location.origin}${window.location.pathname}${dom.slug ? `?slug=${dom.slug}` : `?id=${dom.id}`}#product`;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "about": { "@id": productId },
      "mainEntity": langFaq.faqs.map(item => ({
        "@type": "Question",
        "name": item.otazka,
        "acceptedAnswer": { "@type": "Answer", "text": item.odpoved }
      }))
    };
  }, [dom, language]);

  // Build enhanced Product schema with merchant/shipping/reviews
  const productSchemaData = React.useMemo(() => {
    if (!dom) return null;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}${dom.slug ? `?slug=${dom.slug}` : `?id=${dom.id}`}`;
    const houseType = dom.typ_domu === 'modularny' ? 'Modulárny dom' : dom.typ_domu === 'montovany' ? 'Montovaný dom' : 'Mobilný dom';
    const metaDescription = dom.meta_description || `${dom.nazov} od ${dom.vyrobca} - ${houseType} s plochou ${dom.zastavana_plocha}m². Cena od ${dom.zakladna_cena?.toLocaleString('sk-SK')}€ s DPH.`;

    // Use stored product_schema_json as base, or build from scratch
    const base = dom.product_schema_json && Object.keys(dom.product_schema_json).length > 0
      ? { ...dom.product_schema_json }
      : {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          "name": dom.nazov,
          "description": metaDescription,
          "image": [dom.hlavny_obrazok, ...(dom.galeria || [])].filter(Boolean),
          "brand": { "@type": "Brand", "name": dom.vyrobca },
          "manufacturer": { "@type": "Organization", "@id": organizationId, "name": "American Living" },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "EUR",
            "price": dom.zakladna_cena,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "@id": organizationId, "name": "American Living", "url": "https://americanliving.sk" }
          }
        };

    // Always ensure context/type
    base["@context"] = "https://schema.org";
    base["@type"] = "Product";

    // Append hasMerchantReturnPolicy
    if (!base.hasMerchantReturnPolicy) {
      base.hasMerchantReturnPolicy = {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": ["SK", "CZ", "HU", "PL", "AT", "DE"],
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      };
    }

    // Append shippingDetails
    if (!base.shippingDetails) {
      base.shippingDetails = {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "EUR" },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": ["SK", "CZ", "HU", "PL", "AT", "DE"]
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 60, "maxValue": 120, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 5, "unitCode": "DAY" }
        }
      };
    }

    return base;
  }, [dom]);

  // Build aggregateRating + review JSON-LD from ExternalReviews (Ticabhouse only)
  const reviewSchemaData = React.useMemo(() => {
    if (!reviews || reviews.length === 0 || !dom) return null;
    const relevantReviews = reviews.filter(r => !r.dom_id || r.dom_id === dom.id);
    if (relevantReviews.length === 0) return null;
    const totalRating = relevantReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const avgRating = (totalRating / relevantReviews.length).toFixed(1);
    const productId = `${window.location.origin}${window.location.pathname}${dom.slug ? `?slug=${dom.slug}` : `?id=${dom.id}`}#product`;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": productId,
      "name": dom.nazov,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": relevantReviews.length,
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": relevantReviews.map(r => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.author_name || "Klient" },
        "reviewRating": { "@type": "Rating", "ratingValue": r.rating || 5, "bestRating": "5", "worstRating": "1" },
        "reviewBody": r.content_sk || r.content_en || "",
        "datePublished": r.created_date ? new Date(r.created_date).toISOString().split('T')[0] : undefined
      }))
    };
  }, [reviews, dom]);

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

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;
  const isSuperAdmin = user?.super_admin === true;
  const canManage = isAdmin || isSuperAdmin;

  const handleSendQuote = async (data) => {
    return await base44.entities.Dopyt.create({
      ...data,
      typ_dopytu: "konfigurator_floating",
      dom_id: dom.id,
      konfiguracny_kod: JSON.stringify(isTicabhouse ? ticabKonfiguracia : isProstoHouse ? prostoKonfiguracia : null)
    });
  };

  // Scroll na vrch pri načítaní stránky
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [domId, domSlug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setLightboxOpen(false); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
      else if (e.key === 'ArrowLeft') { setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
      else if (e.key === 'ArrowRight') { setLightboxIndex((prev) => (prev + 1) % lightboxImages.length); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }
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

      // Set initial calculatedPrice to base price
      setCalculatedPrice(dom.zakladna_cena || 0);
    }

    // Cleanup function
    return () => {
      try {
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink && document.head.contains(canonicalLink)) {
          canonicalLink.remove();
        }
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"][data-schema]');
        schemaScripts.forEach(script => {
          if (document.head.contains(script)) {
            script.remove();
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [dom, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!dom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet>
          <title>Dom nenájdený | American Living</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Card className="p-12 text-center max-w-md">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('noHousesFound')}</h2>
          <p className="text-gray-500 mb-6">{t('tryChangingFilters')}</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleBackToCatalog}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('backToCatalog')}
          </Button>
        </Card>
      </div>
    );
  }

  const galerieFotky = dom.galerie ? dom.galerie.flatMap(g => g.fotky || []) : [];
  const rawImages = [dom.hlavny_obrazok, ...(dom.galeria || []), ...galerieFotky].filter(Boolean);
  const allImages = [...new Set(rawImages)];

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

  const canonicalUrl = dom
    ? `${window.location.origin}${window.location.pathname}${dom.slug ? `?slug=${dom.slug}` : `?id=${dom.id}`}`
    : window.location.href;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden max-w-full font-['Outfit']">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        {productSchemaData && (
          <script type="application/ld+json">
            {JSON.stringify(productSchemaData)}
          </script>
        )}
        {faqSchemaData && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchemaData)}
          </script>
        )}
        {dom?.aeo_geo_data?.faq_schema && (
          <script type="application/ld+json">
            {JSON.stringify(dom.aeo_geo_data.faq_schema)}
          </script>
        )}
        {reviewSchemaData && (
          <script type="application/ld+json">
            {JSON.stringify(reviewSchemaData)}
          </script>
        )}
      </Helmet>
      {/* Back Button */}
      <div className="bg-card/85 backdrop-blur-md border-b border-border sticky top-[5rem] lg:top-[6rem] z-[60] shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary hover:bg-muted/50 text-xs sm:text-sm h-8 sm:h-9 font-bold relative z-50 pointer-events-auto" onClick={handleBackToCatalog}>
              <ArrowLeft className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('backToCatalog')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </Button>
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
          <h2 className="lg:hidden text-lg font-bold text-slate-900 dark:text-white mt-2">
            {dom.nazov}
          </h2>
        </div>
      </div>

      {/* Admin Panel */}
      {canManage && showAdminPanel && (
        <div className="container mx-auto px-4 py-6">
          <DomGalerieManager dom={dom} onUpdate={() => {}} />
        </div>
      )}

      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-slate-900 cursor-pointer group" onClick={() => openLightbox(allImages, selectedImage)}>
        <ImageWithWatermark
            src={allImages[selectedImage]}
            alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[allImages[selectedImage]] || dom.nazov}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
            priority={true}
          />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 container mx-auto flex flex-col justify-end h-full pointer-events-none">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl pointer-events-auto">
              <Badge className="bg-red-500 hover:bg-red-600 text-white mb-4 shadow-lg border-none px-3 py-1">{dom.vyrobca}</Badge>
              <h1 className="text-4xl sm:text-6xl font-black text-white mb-2">{dom.nazov}</h1>
              <p className="text-lg sm:text-xl text-slate-300 font-light mb-6">
                {dom.typ_domu === 'modularny' ? t('modularType') : dom.typ_domu === 'montovany' ? t('prefabType') : t('mobileType')} • {dom.zastavana_plocha} m²
              </p>
              
              <div className="flex gap-3 flex-wrap">
                {dom.celorocny && (
                  <Badge className="bg-card/80 backdrop-blur border border-border text-foreground px-4 py-2 text-sm font-bold shadow-xl">✔ {t('yearRound')}</Badge>
                )}
                {dom.energeticky_certifikat && (
                  <Badge className="bg-emerald-500/20 backdrop-blur border border-emerald-500/50 text-emerald-400 px-4 py-2 text-sm font-bold shadow-xl">⚡ {t('certificateA0')}</Badge>
                )}
              </div>
           </motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 flex items-center gap-2">
             <Maximize2 className="w-5 h-5 text-white" />
             <span className="text-white font-medium text-sm">{t('clickToShow')} {t('galleries')}</span>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
        <div className="grid lg:grid-cols-3 gap-8 w-full max-w-full">
          {/* Ľavý stĺpec - Špecifikácie */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6 w-full max-w-full overflow-hidden"
          >

            {/* Bento Grid pre Fotky */}
            {allImages.length > 1 && (
              <div className="w-full mb-8">
                <div className={`grid gap-2 sm:gap-3 w-full ${allImages.length >= 5 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 grid-rows-2 h-[400px] sm:h-[500px]' : 'grid-cols-1 sm:grid-cols-2 h-[300px] sm:h-[400px]'}`}>
                  {/* Hlavná/Prvá fotka */}
                  <div 
                    className={`relative rounded-2xl overflow-hidden cursor-pointer group ${allImages.length >= 5 ? 'sm:col-span-1 md:col-span-2 row-span-2' : ''}`}
                    onClick={() => { setSelectedImage(0); openLightbox(allImages, 0); }}
                  >
                    <ImageWithWatermark
                      src={allImages[0]}
                      alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[allImages[0]] || dom.nazov}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  
                  {/* Zvyšné fotky v Bento mriežke */}
                  {allImages.slice(1, Math.min(5, allImages.length)).map((img, index) => (
                    <div
                      key={index + 1}
                      className="hidden sm:block relative rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => { setSelectedImage(index + 1); openLightbox(allImages, index + 1); }}
                    >
                      <ImageWithWatermark
                        src={img}
                        alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[img] || `Fotografia ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                      
                      {/* Tlačidlo Zobraziť všetky pre poslednú zobrazenú fotku */}
                      {index === 3 && allImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex items-center justify-center backdrop-blur-[2px]">
                          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black font-bold">
                            <Layers className="mr-2 w-4 h-4" />
                            {t('galleries')} ({allImages.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobilné tlačidlo pre zobrazenie všetkých */}
                  <div className="sm:hidden absolute bottom-4 right-4 z-10">
                    <Button onClick={(e) => { e.stopPropagation(); openLightbox(allImages, 0); }} className="bg-white/90 text-black hover:bg-white shadow-lg backdrop-blur-md">
                      <Layers className="mr-2 w-4 h-4" />
                      1 / {allImages.length}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Editorial Popis */}
            {dom.popis && (
              <div className="prose dark:prose-invert prose-lg max-w-none mb-10 mt-6 leading-relaxed text-slate-700 dark:text-slate-300">
                <TranslatedDescription 
                  description={dom.popis} 
                  language={language}
                />
              </div>
            )}

            {/* 2D a 3D Pôdorysy - hneď pod titulnou fotkou */}
            {(dom.podorys_2d || dom.podorys_3d) && (
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
                <h3 className="text-sm sm:text-base font-bold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
                  <Grid2x2 className="w-5 h-5 text-red-500" />
                  📐 {t('floorPlans')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {dom.podorys_2d && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">{t('twoD')} {t('floorPlan')}</p>
                      <div 
                        className="rounded-lg overflow-hidden bg-muted border border-border cursor-pointer"
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
                       className="w-full mb-1 sm:mb-2 text-xs sm:text-sm font-bold border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-background animate-pulse"
                       onClick={() => openLightbox([dom.podorys_2d, dom.podorys_3d].filter(Boolean), dom.podorys_2d ? 1 : 0)}
                     >
                       <Grid2x2 className="mr-2 w-5 h-5" />
                       🎯 {t('threeDFloorPlan')}
                     </Button>
                      <div 
                        className="rounded-lg overflow-hidden bg-muted border border-border cursor-pointer"
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

            {/* Pomenované galérie ako veľké Editorial sekcie */}
            {dom.galerie && dom.galerie.length > 0 && dom.galerie.some(g => g.fotky && g.fotky.length > 0) && (
              <div className="space-y-10 sm:space-y-16 my-10 sm:my-16">
                {dom.galerie.filter(g => g.fotky && g.fotky.length > 0).map((galeria, index) => (
                  <div key={index} className="w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 border-l-4 border-red-500 pl-4 tracking-tight">
                      {getGaleriaLabel(galeria.typ)}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {galeria.fotky.slice(0, 4).map((foto, fotoIndex) => (
                        <div 
                          key={fotoIndex} 
                          className={`relative rounded-2xl overflow-hidden cursor-pointer group ${fotoIndex === 0 && galeria.fotky.length % 2 !== 0 && galeria.fotky.length !== 4 ? 'sm:col-span-2 aspect-video' : 'aspect-[4/3] sm:aspect-video'}`}
                          onClick={() => openLightbox(galeria.fotky, fotoIndex)}
                        >
                          <ImageWithWatermark
                            src={foto}
                            alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[foto] || `Náhľad ${fotoIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                          
                          {/* Overlay pre zobrazenie zvyšku fotiek */}
                          {fotoIndex === 3 && galeria.fotky.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 hover:bg-black/40 transition-colors flex items-center justify-center backdrop-blur-[2px]">
                              <span className="text-white font-bold text-lg tracking-wide">
                                +{galeria.fotky.length - 4} Fotiek
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}





















            {/* Pôdorysy */}
            {dom.podorysy && dom.podorysy.length > 0 && (
              <Card className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">
                  {dom.podorysy.length > 1 ? 'Pôdorysy' : 'Pôdorys'}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {dom.podorysy.map((podorysUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-muted">
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
            {dom.youtube_url && (() => {
              const watchMatch = dom.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube(?:-nocookie)?\.com\/embed\/)([A-Za-z0-9_-]{11})/);
              const videoId = watchMatch ? watchMatch[1] : null;
              if (!videoId) return null;
              return <YoutubePlayer videoId={videoId} title={dom.nazov} />;
            })()}

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
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">{t('outerDimensions')}</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('width')}</p>
                    <p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.sirka} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('length')}</p>
                    <p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.dlzka} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('height')}</p>
                    <p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.vyska} m</p>
                  </div>
                </div>
                {dom.vyska_stropu && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
                    {t('ceilingHeight')}: <span className="font-semibold text-foreground">{dom.vyska_stropu}</span>
                  </p>
                )}
              </Card>
            )}













            {/* Štandardná výbava pre JAK Modules - presunute z pravej strany */}
            {isJAKModules && (
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">✔ {t('mainFeatures')}</h3>
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('gl24Strength')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('perfectInsulation')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('ecoMaterials')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('fastRealization')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('completeDocumentation')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('modernArchitecture')}</span>
                  </div>
                </div>
              </Card>
            )}



            {/* Čo obsahuje cena pre JAK Modules - presunute z pravej strany */}
            {isJAKModules && (
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">💰 {t('whatIncludesPrice')}</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1 text-xs sm:text-sm">✔ {t('constructionLabel')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-2 text-xs sm:text-sm">
                      <li>{t('certifiedPineGl24')}</li>
                      <li>{t('steelProfiles')}</li>
                      <li>{t('insulationCapacity')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('insulationLabel')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>{t('purFoam12cm')}</li>
                      <li>{t('mineralWoolHighest')}</li>
                      <li>{t('ecoMaterialsSteico')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('heatingAc')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>{t('rotensoAc')}</li>
                      <li>{t('heatingTo25')}</li>
                      <li>{t('infraredHeaters')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('windowsDoorsLabel')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>{t('pvc6Chamber')}</li>
                      <li>{t('modernAnthracite')}</li>
                      <li>{t('excellentThermal')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('equipmentLabel')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>{t('completeBathroom')}</li>
                      <li>{t('customKitchenLine')}</li>
                      <li>{t('vinylPanelsKronostep')}</li>
                      <li>{t('complexElectrical')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('facadeRoof')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>{t('anthraciteWhiteSheet')}</li>
                      <li>{t('facadeTypeChoice')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">✔ {t('otherLabel')}</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
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
            className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 w-full max-w-full overflow-hidden"
          >
            {/* Hlavička */}
            <div>
              {/* Mobilná verzia - cena hore */}
              <div className="lg:hidden mb-3">
                <div className="bg-card text-foreground rounded-xl p-4 shadow-xl border border-border">
                  <p className="text-xs mb-1 text-muted-foreground">{isTicabhouse ? t('basicConfigPrice') : t('priceFromLabel')}</p>
                  {isTicabhouse ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-black text-red-650 dark:text-red-400 line-through">
                          {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                        </p>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500">
                          {Math.round(dom.zakladna_cena * 0.95)?.toLocaleString('sk-SK')} €
                        </p>
                      </div>
                      <p className="text-xs text-emerald-650 dark:text-emerald-450 font-semibold mt-1">
                        💰 s grantom AMERICANA
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t('withVAT')}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-xs">
                  {dom.vyrobca}
                </Badge>
                <Badge className="bg-muted text-muted-foreground border-border px-2 py-0.5 text-xs">
                  {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 break-words hidden lg:block">
                {dom.nazov}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 hidden lg:block">{t('ceilingHeight270A0')}</p>
              
              {/* Desktop verzia - cena */}
              <div className="hidden lg:block bg-slate-900 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-sm">
                {isTicabhouse ? (
                  <div>
                    <span className="text-base text-slate-400 font-semibold block mb-2">{t('basicConfigPrice')}</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl md:text-3xl font-black text-red-600 line-through">
                        {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                      </span>
                      <span className="text-4xl md:text-5xl font-black text-green-600">
                        {Math.round(dom.zakladna_cena * 0.95)?.toLocaleString('sk-SK')} €
                      </span>
                    </div>
                    <p className="text-sm text-green-700 font-semibold mt-2">
                      💰 s grantom AMERICANA
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base text-slate-400 font-semibold">{t('priceFromLabel')}</span>
                    <span className="text-4xl md:text-5xl font-black text-white">
                      {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                    </span>
                    <span className="text-base text-slate-400 font-semibold">{t('withVAT')}</span>
                  </div>
                )}
              </div>
              {isProstoHouse ? (
                <div className="mt-2 bg-slate-900 border border-amber-500/30 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-amber-400 font-semibold mb-1">
                        {t('basePriceNote')}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {t('basePriceNoteDesc')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-amber-500/20">
                    <p className="text-xs sm:text-sm font-bold text-amber-400 mb-2">{t('assemblyKitTitle')}</p>
                    <ul className="space-y-1 text-xs sm:text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitWoodenFrame')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitExteriorFacade')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitWindows')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitDoors')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitHydroFoil')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitInsulation')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitVaporBarrier')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{t('assemblyKitRoughFloor')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-1.5">
                    <p className="text-xs sm:text-sm text-red-500 font-medium">
                      {t('assemblyKitStairsNotIncluded')}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {t('assemblyKitPaintClient')}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {t('assemblyKitPaintingNotIncluded')}
                    </p>
                  </div>
                </div>
              ) : (isTicabhouse) ? (
                <div className="mt-2 bg-slate-900 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-lg sm:text-xl font-bold text-emerald-500 mb-2">
                    {t('turnkeyReadyHouse') || 'Za vyššie uvedenú cenu dostávate dom na kľúč, ktorý je pripravený na okamžité použitie'}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-400 mb-1">
                    <strong>{t('modularConstruction')}</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {t('basePriceIncludesRecreational')}
                  </p>
                </div>
              ) : isJAKModules ? (
                <div className="mt-2 bg-slate-900 border border-emerald-500/30 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-emerald-400">
                    <strong>{t('gl24ModularHouse')}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 mt-2">- {t('priceFromLabel')}</p>
              )}
            </div>

            {/* Parametre */}
            <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">{t('basicParameters')}</h3>
              
              {/* Identifikačné číslo pre Prosto House */}
              {isProstoHouse && dom.prosto_house_kod && (
                <div className="mb-3 p-3 bg-muted border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Identifikačné číslo</p>
                      <p className="text-lg font-black text-foreground">{dom.prosto_house_kod}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <dl className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('manufacturer')}</dt>
                    <dd className="text-sm sm:text-base font-bold text-foreground">{dom.vyrobca}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {dom.typ_domu === 'montovany' ? (
                                              <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                            ) : dom.typ_domu === 'mobilny' ? (
                                              <Caravan className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />
                                            ) : (
                                              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                                            )}
                    <div>
                      <dt className="text-xs text-muted-foreground">{t('houseType')}</dt>
                      <dd className="text-sm sm:text-base font-bold text-foreground">
                        {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                      </dd>
                    </div>
                  </div>
                {dom.pocet_modulov && (
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Moduly</dt>
                      <dd className="text-sm sm:text-base font-bold text-foreground">{dom.pocet_modulov}</dd>
                    </div>
                  </div>
                )}
                {dom.pocet_izieb && (
                  <div className="flex items-center gap-2">
                    <Grid2x2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{t('rooms')}</dt>
                      <dd className="text-sm sm:text-base font-bold text-foreground">{dom.pocet_izieb}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-3 sm:w-6 sm:h-4 border-2 border-red-500 rounded-sm" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{t('builtArea')}</dt>
                    <dd className="text-sm sm:text-base font-bold text-foreground">{dom.zastavana_plocha} m²</dd>
                  </div>
                </div>
                {dom.uzitkova_plocha && (
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{t('usableArea')}</dt>
                      <dd className="text-sm sm:text-base font-bold text-foreground">{dom.uzitkova_plocha} m²</dd>
                    </div>
                  </div>
                )}
                {dom.energeticky_certifikat && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{t('energyClass')}</dt>
                      <dd className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400">A0</dd>
                      {isTicabhouse && (
                        <p className="text-xs text-muted-foreground mt-1">{t('a0CertificateOption')}</p>
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
                      <dt className="text-xs text-muted-foreground">Terasa</dt>
                      <dd className="text-sm sm:text-base font-bold text-primary">{dom.terasa_plocha} m²</dd>
                    </div>
                  </div>
                )}
              </dl>
            </Card>

            {/* Obrázok základnej konfigurácie - pre Prosto House - hneď pod parametre */}
            {isProstoHouse && dom.zakladna_konfiguracia_obrazok && (
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">📸 {t('basicConfiguration') || 'Základná konfigurácia'}</h3>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <ImageWithWatermark 
                    src={dom.zakladna_konfiguracia_obrazok} 
                    alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.zakladna_konfiguracia_obrazok] || `${dom.nazov} - ${t('basicConfiguration')}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Shell Info Box - aktuálne ceny z konfiguratora (mounting-1 je "S montážou") */}
                {(() => {
                  const defaultPriceMap = {
                    'PH-001': { kit: 61700, assembly: 17970 },
                    'PH-002': { kit: 61000, assembly: 19500 },
                    'PH-003': { kit: 45950, assembly: 13785 },
                    'PH-004': { kit: 51000, assembly: 15650 },
                    'PH-005': { kit: 38000, assembly: 9500 },
                    'PH-006': { kit: 31700, assembly: 7925 },
                    'PH-007': { kit: 23400, assembly: 7200 },
                    'PH-008': { kit: 21600, assembly: 5400 },
                    'PH-009': { kit: 19950, assembly: 4990 }
                  };
                  
                  const phCode = dom.prosto_house_kod?.toLowerCase();
                  const customPricesFromDb = dom.konfigurator_custom_ceny_prosto_house?.[phCode];
                  const defaultPrices = defaultPriceMap[dom.prosto_house_kod];
                  
                  if (!defaultPrices) return null;
                  
                  // Základná cena sady je vždy default
                  const kitPrice = defaultPrices.kit;
                  
                  // Montáž - čítame z mounting-1 (index 1 = "S montážou")
                  let assemblyPrice = defaultPrices.assembly;
                  if (customPricesFromDb && customPricesFromDb['mounting-1'] !== undefined) {
                    assemblyPrice = customPricesFromDb['mounting-1'];
                  }
                  
                  const tProsto = (key) => prostoHouseTranslations[language]?.[key] || prostoHouseTranslations['sk']?.[key] || key;
                  return <ShellInfoBox basePriceKit={kitPrice} assemblyPrice={assemblyPrice} t={tProsto} />;
                })()}
                
                <p className="text-sm text-muted-foreground mt-3 text-center font-medium">
                  {t('basicConfigDesc') || 'Základná konfigurácia domu'}
                </p>
              </Card>
            )}

            {/* Možnosti využitia - pre Prosto House */}
            {isProstoHouse && (
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">✔ {t('usageOptions') || 'Možnosti využitia'}</h3>
                <ul className="space-y-1.5 sm:space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2 text-xs sm:text-sm">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('familyHouseOption') || 'Rodinný dom s možnosťou kolaudácie'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('a0CertificateOption') || 'Možnosť energetického certifikátu A0'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{t('recreationalOption') || 'Rekreačná budova (chata/záhradný domček)'}</span>
                  </li>
                </ul>
              </Card>
            )}

            {/* Informačné panely - Komplet pre montáž, Elektroinstalácia, Voda a kanalizácia, Základy, Interiér - pre všetky Prosto House */}
            {isProstoHouse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                {/* Komplet pre montáž */}
                <Card className="overflow-hidden border border-amber-500/30 bg-card">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-amber-500 mb-2 text-xs sm:text-sm">📦 {t('assemblyKit')}</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
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
                    <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold mt-2">{t('paintingPrice')}</p>
                  </div>
                </Card>

                {/* Elektroinstalácia */}
                <Card className="overflow-hidden border border-yellow-500/30 bg-card">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-yellow-500 mb-2 text-xs sm:text-sm">⚡ {t('electrical')}</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• {t('electricalCables')}</li>
                      <li>• {t('electricalDistributors')}</li>
                      <li>• {t('electricalConduit')}</li>
                      <li>• {t('electricalBoxes')}</li>
                    </ul>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">{t('electricalNotIncluded')}</p>
                  </div>
                </Card>

                {/* Voda a kanalizácia */}
                <Card className="overflow-hidden border border-blue-500/30 bg-card">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-blue-400 mb-2 text-xs sm:text-sm">💧 {t('waterSewage')}</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• {t('waterPipes')}</li>
                      <li>• {t('waterValves')}</li>
                      <li>• {t('sewagePipes')}</li>
                      <li>• {t('waterPressureTest')}</li>
                    </ul>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">{t('waterNotIncluded')}</p>
                  </div>
                </Card>

                {/* Základy */}
                <Card className="overflow-hidden border border-orange-500/30 bg-card">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-orange-400 mb-2 text-xs sm:text-sm">🏗️ {t('foundationsTitle')}</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• {t('foundationsTypes')}</li>
                      <li>• {t('foundationsMinPrice')}</li>
                      <li>• {t('foundationsFinalPrice')}</li>
                    </ul>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">{t('foundationsNotIncluded')}</p>
                  </div>
                </Card>

                {/* Interiér finiš */}
                <Card className="overflow-hidden border border-emerald-500/30 bg-card">
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-emerald-400 mb-2 text-xs sm:text-sm">🏠 {t('interiorFinish')}</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• {t('interiorPartitions')}</li>
                    </ul>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">{t('interiorPainting')}</p>
                  </div>
                </Card>
              </div>
            )}


            {/* Štandardná výbava pre Ticabhouse */}
            {isTicabhouse && (
              <DetailDomuTicabhouseInfo
                dom={dom}
                t={t}
                language={language}
                lyonState={{
                  lyonUcel, lyonIzolaciaStien, lyonIzolaciaPodlahy, lyonIzolaciaStropu,
                  lyonTepelneCerpadlo, lyonRekuperacia, lyonElektro, lyonBleskozvod,
                  lyonPrepat, lyonInziniering, lyonProjektACertifikacia,
                  lyonPredajNehnutelnosti, lyonHladamPozemok, lyonFinancneSluzby,
                }}
              />
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
                <Button size="lg" variant="outline" className="w-full border-2 border-red-500 text-red-550 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold text-sm sm:text-base py-4 sm:py-5 bg-card">
                  <Mail className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {t('contactUsButton')}
                </Button>
              </Link>
              <a href="tel:+421905138124">
                <Button size="lg" variant="outline" className="w-full border-2 border-border text-foreground hover:bg-muted font-semibold text-sm sm:text-base py-4 sm:py-5 bg-card">
                  <Phone className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  +421 905 138 124
                </Button>
              </a>

              {/* Social Share Buttons */}
              <Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">{t('shareHouse') || 'Zdieľať dom'}</h3>
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
                {/* Informácia o grante */}
                <Card className="bg-card border border-emerald-500/30 p-3 sm:p-4 shadow-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-tight">
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

                {/* A0 upozornenie je zobrazené v DetailDomuTicabhouseInfo */}
              </div>
            )}
          </motion.div>
        </div>

        {/* Marketingové sekcie na celú šírku */}
        <div className="w-full mt-12 max-w-7xl mx-auto">
          {isProstoHouse && (
            <ProstoHouseMarketing />
          )}

          {isTicabhouse && (
            <TicabhouseMarketing />
          )}
        </div>

        {/* External Reviews Section */}
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <ExternalReviews reviews={reviews} domId={dom.id} manufacturer={dom.vyrobca} />
        </div>
      </div>

      {/* Floating Price Display - len ak nie je JAK Modules */}
      {!isJAKModules && (
        <FloatingPrice 
          price={isTicabhouse ? (ticabKonfiguracia?.celkovaCena || dom.zakladna_cena) : (isProstoHouse ? (prostoKonfiguracia?.celkovaCena || dom.zakladna_cena) : calculatedPrice)} 
          isVisible={showCalculator || isTicabhouse || isProstoHouse} 
          onSendQuote={handleSendQuote}
          dom={dom}
        />
      )}

      {/* Lightbox */}
      <GaleriaLightbox
        lightboxOpen={lightboxOpen}
        lightboxImages={lightboxImages}
        lightboxIndex={lightboxIndex}
        setLightboxIndex={setLightboxIndex}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        panPosition={panPosition}
        setPanPosition={setPanPosition}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragStart={dragStart}
        setDragStart={setDragStart}
        lastTouchDistance={lastTouchDistance}
        setLastTouchDistance={setLastTouchDistance}
        swipeStart={swipeStart}
        setSwipeStart={setSwipeStart}
        swipeOffset={swipeOffset}
        setSwipeOffset={setSwipeOffset}
        closeLightbox={closeLightbox}
        imagesAltMap={dom?.images_seo_map}
        language={language}
      />
    </div>
  );
}