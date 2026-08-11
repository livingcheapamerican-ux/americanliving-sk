import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Filter, Home, CheckCircle, Search, ArrowUpDown, Plus, Square, LayoutGrid, Trash2, Eye, EyeOff, Grid3x3, Zap, Hammer, Caravan, Building2, TreePine, Fence, Boxes, Euro, Phone, Package } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Gift } from "lucide-react";
import ImageWithWatermark from "../components/ImageWithWatermark";
import ProstoHouseMarketing from "../components/ProstoHouseMarketing";
import DomCard from "../components/katalog/DomCard";
import DomCardSkeleton from "../components/katalog/DomCardSkeleton";
import FilterSection from "../components/katalog/FilterSection";
import ActiveFilterChips from "../components/katalog/ActiveFilterChips";
import CompareBar from "../components/katalog/CompareBar";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

// CatalogPhotoBackground renders a premium, high-resolution nature landscape photo
// with an infinite, slow Ken Burns zoom/pan animation, overlayed with soft gradient masks.
function CatalogPhotoBackground() {
  const isDark = document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const lightImage = "https://media.base44.com/images/public/6916d89a485af231beb54c71/fd519fceb_generated_image.png";
  const darkImage = "https://media.base44.com/images/public/6916d89a485af231beb54c71/7e733f1dc_generated_image.png";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#FAF8F5] dark:bg-[#050508] z-0 pointer-events-none select-none">
      <img
        src={dark ? darkImage : lightImage}
        alt="Moderná ulica s domami z nášho katalógu"
        decoding="async"
        fetchpriority="low"
        className="w-full h-full object-cover"
        style={{ filter: dark ? 'brightness(0.4) contrast(1.05)' : 'brightness(1) contrast(1.02)' }}
      />
      <div className="absolute inset-0 bg-[#FAF8F5]/60 dark:bg-[#050508]/70" />
    </div>
  );
}

export default function Katalog() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  
  // Funkcia na parsovanie URL parametrov
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      kategoria: params.get("kategoria") || "vsetky",
      vyrobca: params.get("vyrobca") || "",
      typ: params.get("typ") || "",
      plocha_min: parseInt(params.get("plocha_min")) || 0,
      plocha_max: parseInt(params.get("plocha_max")) || 500,
      uzitkova_min: parseInt(params.get("uzitkova_min")) || 0,
      uzitkova_max: parseInt(params.get("uzitkova_max")) || 500,
      hladanie: params.get("hladanie") || "",
      cena_min: parseInt(params.get("cena_min")) || 0,
      cena_max: parseInt(params.get("cena_max")) || 500000,
      izby: params.get("izby") || "",
      zoradenie: params.get("zoradenie") || "plocha_zostupne"
    };
  };

  const initialFilters = getInitialFilters();

  const [kategoriaFilter, setKategoriaFilter] = useState(initialFilters.kategoria);
  const [vyrobcaFilter, setVyrobcaFilter] = useState(initialFilters.vyrobca ? initialFilters.vyrobca.split(',') : []);
  const [typFilter, setTypFilter] = useState(initialFilters.typ ? initialFilters.typ.split(',') : []);
  const [plocharozsah, setPlocharozsah] = useState([0, initialFilters.plocha_max || 200]);
  const [uzitkovaRozsah, setUzitkovaRozsah] = useState([0, initialFilters.uzitkova_max || 200]);
  const [hladanie, setHladanie] = useState(initialFilters.hladanie);
  const [hladanieInput, setHladanieInput] = useState(initialFilters.hladanie);

  // Debounced search
  const debouncedSetHladanie = useMemo(
    () => debounce((value) => setHladanie(value), 500),
    []
  );

  useEffect(() => {
    debouncedSetHladanie(hladanieInput);
    return () => debouncedSetHladanie.cancel();
  }, [hladanieInput, debouncedSetHladanie]);
  const [cenoveRozpatie, setCenoveRozpatie] = useState([0, initialFilters.cena_max || 300000]);
  const [pocetIziebFilter, setPocetIziebFilter] = useState(initialFilters.izby ? initialFilters.izby.split(',').map(Number) : []);
  const [zoradenie, setZoradenie] = useState(initialFilters.zoradenie);
  const [vybraneNaSrovnanie, setVybraneNaSrovnanie] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dizajnFilter, setDizajnFilter] = useState("murovka"); // "murovka", "drevo", alebo "podorys3d"
  const [pocetModulovFilter, setPocetModulovFilter] = useState([]);
  const [moduloveDomyFilter, setModuloveDomyFilter] = useState('all'); // 'all', '1modul', 'viacmodulov'
  const [portraitImages, setPortraitImages] = useState({});
  const [energyCert, setEnergyCert] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;
  const isSuperAdmin = user?.super_admin === true;
  const canManage = isAdmin || isSuperAdmin;

  // Označiť ako inicializované po prvom renderovaní
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Synchronizovať filtre s URL - len po inicializácii
  useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams();
    if (kategoriaFilter !== "vsetky") params.set("kategoria", kategoriaFilter);
    if (vyrobcaFilter.length > 0) params.set("vyrobca", vyrobcaFilter.join(','));
    if (typFilter.length > 0) params.set("typ", typFilter.join(','));
    if (plocharozsah[0] !== 0) params.set("plocha_min", plocharozsah[0].toString());
    if (plocharozsah[1] !== 200) params.set("plocha_max", plocharozsah[1].toString());
    if (uzitkovaRozsah[0] !== 0) params.set("uzitkova_min", uzitkovaRozsah[0].toString());
    if (uzitkovaRozsah[1] !== 200) params.set("uzitkova_max", uzitkovaRozsah[1].toString());
    if (hladanie) params.set("hladanie", hladanie);
    if (cenoveRozpatie[0] !== 0) params.set("cena_min", cenoveRozpatie[0].toString());
    if (cenoveRozpatie[1] !== 200000) params.set("cena_max", cenoveRozpatie[1].toString());
    if (pocetIziebFilter.length > 0) params.set("izby", pocetIziebFilter.join(','));
    if (zoradenie !== "plocha_zostupne") params.set("zoradenie", zoradenie);

    const newSearch = params.toString();
    const currentSearch = location.search.substring(1);
    
    // KRITICKÉ: Len ak sa URL skutočne zmenil, updatni ho
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
    }
  }, [isInitialized, kategoriaFilter, vyrobcaFilter, typFilter, plocharozsah, uzitkovaRozsah, hladanie, cenoveRozpatie, pocetIziebFilter, zoradenie, location.pathname, location.search, navigate]);

  const { data: allDomy = [], isLoading, error } = useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const result = await base44.entities.Dom.list('poradie', 200);
      console.log('✅ Načítané domy:', result?.length);
      return result || [];
    },
    staleTime: 300000,
    gcTime: 600000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const deleteDomMutation = useMutation({
    mutationFn: (domId) => base44.entities.Dom.delete(domId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] });
    },
  });

  const toggleVerejnyMutation = useMutation({
    mutationFn: ({ domId, verejny }) => base44.entities.Dom.update(domId, { verejny }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['houses'] });
      toast.success(variables.verejny ? 'Dom je teraz verejný' : 'Dom je teraz skrytý');
    },
  });

  const handleDeleteDom = useCallback((dom, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Naozaj chcete vymazať dom "${dom.nazov}"?`)) {
      deleteDomMutation.mutate(dom.id);
    }
  }, [deleteDomMutation]);

  const handleToggleVerejny = useCallback((dom, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleVerejnyMutation.mutate({ domId: dom.id, verejny: !dom.verejny });
  }, [toggleVerejnyMutation]);

  const resetFilters = useCallback(() => {
    setKategoriaFilter("vsetky");
    setVyrobcaFilter([]);
    setTypFilter([]);
    setPlocharozsah([0, 500]);
    setUzitkovaRozsah([0, 500]);
    setHladanie("");
    setHladanieInput("");
    setCenoveRozpatie([0, 300000]);
    setPocetIziebFilter([]);
    setPocetModulovFilter([]);
    setModuloveDomyFilter('all');
    setZoradenie("poradie");
    setEnergyCert('all');
  }, []);

  const toggleSrovnanie = useCallback((dom) => {
    if (vybraneNaSrovnanie.find((d) => d.id === dom.id)) {
      setVybraneNaSrovnanie(vybraneNaSrovnanie.filter((d) => d.id !== dom.id));
    } else if (vybraneNaSrovnanie.length < 3) {
      setVybraneNaSrovnanie([...vybraneNaSrovnanie, dom]);
    }
  }, [vybraneNaSrovnanie]);

  const domy = Array.isArray(allDomy) ? allDomy : [];
  const verejneDomy = domy.filter((d) => d.verejny !== false);
  const skryteDomy = domy.filter((d) => d.verejny === false);
  const rodinneDomy = verejneDomy.filter((d) => d.kategoria === "rodinne_domy");
  const mobilneDomy = verejneDomy.filter((d) => d.kategoria === "mobilne_domy");

  let filtrovane = [];
  
  if (kategoriaFilter === "skryte") {
    // Tab "skryte" zobrazuje len skryté domy (iba pre adminov)
    filtrovane = canManage ? skryteDomy : [];
  } else {
    // V ostatných taboch zobrazuj LEN verejné domy (pre všetkých)
    filtrovane = verejneDomy.filter((dom) => {
      const kategoriaMatch = kategoriaFilter === "vsetky" || dom.kategoria === kategoriaFilter;
      const vyrobcaMatch = vyrobcaFilter.length === 0 || vyrobcaFilter.includes(dom.vyrobca);
      const typMatch = typFilter.length === 0 || typFilter.includes(dom.typ_domu);
      const plochaMatch = dom.zastavana_plocha >= plocharozsah[0] && dom.zastavana_plocha <= plocharozsah[1];
      const uzitkovaMatch = !dom.uzitkova_plocha || (dom.uzitkova_plocha >= uzitkovaRozsah[0] && dom.uzitkova_plocha <= uzitkovaRozsah[1]);
      const hladanieMatch = hladanie === "" || dom.nazov.toLowerCase().includes(hladanie.toLowerCase());
      const cenaMatch = dom.zakladna_cena >= cenoveRozpatie[0] && dom.zakladna_cena <= cenoveRozpatie[1];
      const izbyMatch = pocetIziebFilter.length === 0 || (dom.pocet_izieb && pocetIziebFilter.includes(dom.pocet_izieb));
      const modulyMatch = pocetModulovFilter.length === 0 || (dom.pocet_modulov && pocetModulovFilter.includes(dom.pocet_modulov));
      const moduloveDomyMatch = moduloveDomyFilter === 'all' || 
        (moduloveDomyFilter === '1modul' && dom.vyrobca === "Ticab house" && dom.pocet_modulov === 1) ||
        (moduloveDomyFilter === 'viacmodulov' && dom.vyrobca === "Ticab house" && dom.pocet_modulov > 1);
      const energyMatch = energyCert === 'all' || 
        (energyCert === 'a0' && dom.energeticky_certifikat) ||
        (energyCert === 'no' && !dom.energeticky_certifikat);
      
      return kategoriaMatch && vyrobcaMatch && typMatch && plochaMatch && uzitkovaMatch && hladanieMatch && cenaMatch && izbyMatch && modulyMatch && moduloveDomyMatch && energyMatch;
    });
  }

  // Zoradenie
  const zoradeneDomy = [...filtrovane].sort((a, b) => {
    if (zoradenie === "cena_vzostupne") return a.zakladna_cena - b.zakladna_cena;
    if (zoradenie === "cena_zostupne") return b.zakladna_cena - a.zakladna_cena;
    if (zoradenie === "plocha_vzostupne") return a.zastavana_plocha - b.zastavana_plocha;
    if (zoradenie === "plocha_zostupne") return b.zastavana_plocha - a.zastavana_plocha;
    if (zoradenie === "uzitkova_vzostupne") return (a.uzitkova_plocha || 0) - (b.uzitkova_plocha || 0);
    if (zoradenie === "uzitkova_zostupne") return (b.uzitkova_plocha || 0) - (a.uzitkova_plocha || 0);
    if (zoradenie === "nazov_az") return a.nazov.localeCompare(b.nazov, 'sk');
    if (zoradenie === "nazov_za") return b.nazov.localeCompare(a.nazov, 'sk');
    return (a.poradie || 0) - (b.poradie || 0);
  });

  const vyrobcovia = ["Ticab house", "Prosto House"];

  // Aktívne filtre ako odstrániteľné štítky
  const typLabels = { modularny: t('modularType'), montovany: t('prefabType'), mobilny: t('mobileType') };
  const activeChips = [
    ...(hladanie ? [{ key: 'hladanie', label: `"${hladanie}"`, onRemove: () => { setHladanie(""); setHladanieInput(""); } }] : []),
    ...vyrobcaFilter.map((v) => ({ key: `v-${v}`, label: v, onRemove: () => setVyrobcaFilter(vyrobcaFilter.filter((x) => x !== v)) })),
    ...typFilter.map((tp) => ({ key: `t-${tp}`, label: typLabels[tp] || tp, onRemove: () => setTypFilter(typFilter.filter((x) => x !== tp)) })),
    ...pocetIziebFilter.map((iz) => ({ key: `i-${iz}`, label: `${iz} ${t('roomsFilter')}`, onRemove: () => setPocetIziebFilter(pocetIziebFilter.filter((x) => x !== iz)) })),
    ...(cenoveRozpatie[1] !== 300000 ? [{ key: 'cena', label: `≤ ${cenoveRozpatie[1].toLocaleString('sk-SK')} €`, onRemove: () => setCenoveRozpatie([0, 300000]) }] : []),
    ...(plocharozsah[1] !== 500 ? [{ key: 'plocha', label: `≤ ${plocharozsah[1]} m²`, onRemove: () => setPlocharozsah([0, 500]) }] : []),
    ...(moduloveDomyFilter !== 'all' ? [{ key: 'moduly', label: moduloveDomyFilter === '1modul' ? t('oneModularHouses') : t('multiModularHouses'), onRemove: () => setModuloveDomyFilter('all') }] : []),
    ...(energyCert !== 'all' ? [{ key: 'energy', label: energyCert === 'a0' ? t('energyClassA0') : t('energyClassNone'), onRemove: () => setEnergyCert('all') }] : []),
  ];

  // Generovanie dynamických meta tagov
  const generateMetaTags = () => {
    let title = "Katalóg modulárnych a montovaných domov | American Living";
    let description = "Komplexný katalóg modulárnych, montovaných a mobilných domov. Ticab house, Prosto House, Domki z Gór. Celoročné riešenia s energetickým certifikátom A0.";

    if (kategoriaFilter === "rodinne_domy") {
      title = "Rodinné modulárne domy | Katalóg | American Living";
      description = "Široký výber rodinných modulárnych a montovaných domov. Energeticky úsporné riešenia s certifikátom A0. Kontaktujte nás pre viac informácií.";
    } else if (kategoriaFilter === "mobilne_domy") {
      title = "Mobilné domy a tiny house | Katalóg | American Living";
      description = "Mobilné domy a tiny house riešenia. Kompaktné a cenovo dostupné bývanie. Prehliadnite si našu ponuku mobilných domov.";
    }

    if (vyrobcaFilter.length === 1) {
      const vyrobca = vyrobcaFilter[0];
      title = `${vyrobca} - Modulárne domy | American Living`;
      description = `Oficiálny distribútor ${vyrobca}. Kvalitné modulárne domy s možnosťou konfigurácie. Kontaktujte nás pre cenovú ponuku.`;
    }

    if (typFilter.length === 1) {
      const typMap = {
        modularny: { title: "Modulárne domy", desc: "Modulárne domy s možnosťou flexibilnej konfigurácie" },
        montovany: { title: "Montované domy", desc: "Rýchla montáž a energetická účinnosť montovaných domov" },
        mobilny: { title: "Mobilné domy", desc: "Kompaktné mobilné domy ideálne ako víkendové chalupy" }
      };
      const typ = typMap[typFilter[0]];
      if (typ) {
        title = `${typ.title} | Katalóg | American Living`;
        description = `${typ.desc}. Prehliadnite si našu ponuku a získajte cenovú ponuku.`;
      }
    }

    if (hladanie) {
      title = `Výsledky vyhľadávania: ${hladanie} | American Living`;
      description = `Výsledky vyhľadávania pre "${hladanie}" v katalógu modulárnych a montovaných domov. ${zoradeneDomy.length} domov.`;
    }

    return { title, description };
  };

  const { title: metaTitle, description: metaDescription } = generateMetaTags();

  // Generovanie Schema.org štruktúrovaných dát
  const generateSchemaOrg = () => {
    const items = zoradeneDomy.slice(0, 20).map((dom, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": dom.nazov,
      "image": dom.hlavny_obrazok || "",
      "description": dom.popis || `${dom.nazov} - ${dom.vyrobca}. Zastavaná plocha: ${dom.zastavana_plocha} m²`,
      "brand": {
        "@type": "Brand",
        "name": dom.vyrobca
      },
      "offers": {
        "@type": "Offer",
        "price": dom.zakladna_cena,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Zastavaná plocha",
          "value": `${dom.zastavana_plocha} m²`
        },
        dom.uzitkova_plocha ? {
          "@type": "PropertyValue",
          "name": "Úžitková plocha",
          "value": `${dom.uzitkova_plocha} m²`
        } : null,
        dom.pocet_izieb ? {
          "@type": "PropertyValue",
          "name": "Počet izieb",
          "value": dom.pocet_izieb
        } : null,
        {
          "@type": "PropertyValue",
          "name": "Typ domu",
          "value": dom.typ_domu
        }
      ].filter(Boolean)
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": items,
      "numberOfItems": zoradeneDomy.length
    };
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-x-hidden max-w-full font-['Outfit'] relative">
      <CatalogPhotoBackground />
      <div className="fixed-bg-content relative z-10">
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <link rel="canonical" href={`https://americanliving.sk/katalog`} />
          <script type="application/ld+json">
            {JSON.stringify(generateSchemaOrg())}
          </script>
        </Helmet>
        {/* Header */}
        <div className="bg-muted/40 dark:bg-slate-900/40 border-b border-border/60 pt-28 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 lg:gap-8 lg:flex-row lg:items-center">
              {/* Ľavá časť - Hlavný nadpis a popis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-foreground">
                  {t('houseCatalog')}
                </h1>
                <div className="mt-2">
                  <p className="inline-block text-slate-800 dark:text-slate-200 text-sm sm:text-lg font-normal leading-relaxed bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-white/10 px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-300">
                    {t('modularAndMobileHouses')}
                  </p>
                </div>
              </motion.div>

              {/* Pravá časť - Fixácia úrokov banner */}
              <Card className="w-full lg:w-[650px] lg:flex-shrink-0 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 border-2 border-yellow-400 p-3 sm:p-5 shadow-2xl">
                <div className="flex gap-3 items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0"
                  >
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                      <Euro className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-lg font-black text-white mb-1.5 leading-tight">
                      {t('mortgageFixationTitle')}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/95 leading-snug mb-2.5">
                      {t('mortgageFixationDesc')}
                    </p>
                    <div className="flex gap-2">
                      <Link to={createPageUrl("Kontakt")}>
                        <Button size="sm" className="bg-white text-red-700 hover:bg-yellow-100 font-bold text-xs px-3 py-1.5 h-auto">
                          {t('contactUs')}
                        </Button>
                      </Link>
                      <a href="tel:+421905138124">
                        <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 hover:text-white font-bold text-xs px-3 py-1.5 h-auto transition-all shadow-lg">
                          <Phone className="mr-1 w-3 h-3" />
                          {t('callLabel')}
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12 max-w-full overflow-hidden">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-4 sm:mb-6">
          <TabsList className={`grid w-full max-w-xl mx-auto h-10 sm:h-12 bg-card border border-border rounded-full p-1 shadow-xl ${canManage ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="vsetky" className="catalog-tab text-xs sm:text-sm rounded-full transition-all duration-300">{t('all')} ({verejneDomy.length})</TabsTrigger>
            <TabsTrigger value="rodinne_domy" className="catalog-tab text-xs sm:text-sm rounded-full transition-all duration-300">{t('familyHouses')} ({rodinneDomy.length})</TabsTrigger>
            <TabsTrigger value="mobilne_domy" className="catalog-tab text-xs sm:text-sm rounded-full transition-all duration-300">{t('mobileHouses')} ({mobilneDomy.length})</TabsTrigger>
            {canManage && (
              <TabsTrigger value="skryte" className="catalog-tab text-xs sm:text-sm rounded-full transition-all duration-300">{t('hidden')} ({skryteDomy.length})</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 w-full max-w-full overflow-hidden">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 flex-shrink-0 relative w-full">
            {/* Mobilné tlačidlo na otvorenie filtrov */}
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden w-full justify-between h-11 mb-2 bg-card font-bold"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                {t('filters')}{activeChips.length > 0 ? ` (${activeChips.length})` : ''}
              </span>
              {mobileFiltersOpen ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <Card className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block p-3 sm:p-5 lg:sticky lg:top-24 shadow-xl bg-card border-border max-w-full overflow-hidden relative z-10`}>
              <div className="hidden lg:flex items-center gap-2 mb-3 sm:mb-4">
                <Filter className="w-4 h-4 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">{t('filters')}</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Vyhľadávanie */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <Search className="w-3 h-3 text-muted-foreground" />
                    {t('search')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      placeholder={t('namePlaceholder')}
                      value={hladanieInput}
                      onChange={(e) => setHladanieInput(e.target.value)}
                      className="pl-7 h-9 text-sm bg-background border-border text-foreground" />

                  </div>
                </div>

                {/* Výrobca */}
                <FilterSection title={t('manufacturer')} icon={Home} iconClass="text-red-500" badge={vyrobcaFilter.length}>
                  <div className="grid grid-cols-1 gap-1.5">
                    {vyrobcovia.map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          if (vyrobcaFilter.includes(v)) {
                            setVyrobcaFilter(vyrobcaFilter.filter((x) => x !== v));
                          } else {
                            setVyrobcaFilter([...vyrobcaFilter, v]);
                          }
                        }}
                        className={`p-2 rounded-lg border transition-all text-left ${
                          vyrobcaFilter.includes(v)
                            ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold'
                            : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home className={`w-3.5 h-3.5 ${vyrobcaFilter.includes(v) ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                          <span className="text-xs">{v}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Typ domu */}
                <FilterSection title={t('type')} icon={LayoutGrid} iconClass="text-amber-500" badge={typFilter.length}>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { value: "modularny", label: t('modularType'), icon: LayoutGrid, color: "amber" },
                      { value: "montovany", label: t('prefabType'), icon: Hammer, color: "orange" },
                      { value: "mobilny", label: t('mobileType'), icon: Caravan, color: "teal" }
                    ].map((typ) => {
                      const Icon = typ.icon;
                      const isSelected = typFilter.includes(typ.value);
                      return (
                        <button
                          key={typ.value}
                          onClick={() => {
                            if (isSelected) {
                              setTypFilter(typFilter.filter((x) => x !== typ.value));
                            } else {
                              setTypFilter([...typFilter, typ.value]);
                            }
                          }}
                          className={`p-2 rounded-lg border transition-all text-left ${
                            isSelected
                              ? `bg-${typ.color}-500/20 border-${typ.color}-500 text-${typ.color}-500 dark:text-${typ.color}-400 font-bold`
                              : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? `text-${typ.color}-600 dark:text-${typ.color}-400` : 'text-muted-foreground'}`} />
                            <span className="text-xs">{typ.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* Cenové rozpätie */}
                <div className="bg-background border border-emerald-500/30 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Euro className="w-3 h-3 text-emerald-500" />
                    {t('priceRange')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-muted-foreground mb-1 block">{t('maximum')}: {cenoveRozpatie[1].toLocaleString('sk-SK')} €</label>
                    <Input
                      type="number"
                      min={0}
                      max={300000}
                      step={5000}
                      value={cenoveRozpatie[1]}
                      onChange={(e) => setCenoveRozpatie([0, Number(e.target.value)])}
                      className="h-7 text-xs bg-background border-border text-foreground"
                    />
                    </div>
                    <Slider
                    min={0}
                    max={300000}
                    step={5000}
                    value={[cenoveRozpatie[1]]}
                    onValueChange={([val]) => setCenoveRozpatie([0, val])}
                    className="mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/80 mt-1">
                    <span>0 €</span>
                    <span>300 000 €</span>
                    </div>
                </div>

                {/* Počet izieb */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Grid3x3 className="w-3 h-3 text-blue-500" />
                    {t('roomsFilter')}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Array.isArray(domy) && [...new Set(domy.filter(d => d.pocet_izieb).map(d => d.pocet_izieb))].sort((a, b) => a - b).map((izby) => {
                      const isSelected = pocetIziebFilter.includes(izby);
                      return (
                        <button
                          key={izby}
                          onClick={() => {
                            if (isSelected) {
                              setPocetIziebFilter(pocetIziebFilter.filter((x) => x !== izby));
                            } else {
                              setPocetIziebFilter([...pocetIziebFilter, izby]);
                            }
                          }}
                          className={`p-2 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                              : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <Grid3x3 className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-bold">{izby}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modulové domy - Ticabhouse filter */}
                <div className="bg-background border border-primary/30 dark:border-red-500/30 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Boxes className="w-3 h-3 text-red-500" />
                    {t('modularHomesFilter')}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { value: 'all', label: t('all'), icon: Boxes },
                      { value: '1modul', label: t('oneModularHouses'), icon: Home },
                      { value: 'viacmodulov', label: t('multiModularHouses'), icon: Building2 }
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = moduloveDomyFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setModuloveDomyFilter(opt.value)}
                          className={`p-2 rounded-lg border transition-all text-left ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold'
                              : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                            <span className="text-xs">{opt.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Počet modulov - zobrazí sa len pre modulárne domy */}
                {typFilter.includes("modularny") && !vyrobcaFilter.includes("Ticab house") && (
                  <div className="bg-background border border-primary/30 dark:border-red-500/30 rounded-lg p-3">
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-red-500" />
                      {t('numberOfModules')}
                    </label>
                    <p className="text-[10px] text-muted-foreground mb-2">{t('modulesSelectionDesc')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Array.isArray(domy) && [...new Set(domy.filter(d => d.pocet_modulov && d.vyrobca === "Ticab house").map(d => d.pocet_modulov))].sort((a, b) => a - b).map((moduly) => {
                        const isSelected = pocetModulovFilter.includes(moduly);
                        return (
                          <button
                            key={moduly}
                            onClick={() => {
                              if (isSelected) {
                                setPocetModulovFilter(pocetModulovFilter.filter((x) => x !== moduly));
                              } else {
                                setPocetModulovFilter([...pocetModulovFilter, moduly]);
                              }
                            }}
                            className={`p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary text-primary dark:bg-red-500/20 dark:border-red-500 dark:text-red-400 font-bold'
                                : 'bg-background border-border text-muted-foreground hover:border-border-hover hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <Boxes className={`w-3.5 h-3.5 ${isSelected ? 'text-primary dark:text-red-400' : 'text-muted-foreground'}`} />
                              <span className="text-xs font-bold">{moduly}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Zastavaná plocha */}
                <div className="bg-blue-500/10 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <Square className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    {t('builtAreaFilter')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-muted-foreground mb-1 block">{t('maximum')}: {plocharozsah[1]} m²</label>
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      step={5}
                      value={plocharozsah[1]}
                      onChange={(e) => setPlocharozsah([0, Number(e.target.value)])}
                      className="h-7 text-xs bg-background border-border text-foreground"
                      />
                  </div>
                  <Slider
                    min={0}
                    max={500}
                    step={5}
                    value={[plocharozsah[1]]}
                    onValueChange={([val]) => setPlocharozsah([0, val])}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0 m²</span>
                    <span>500 m²</span>
                  </div>
                  </div>

                  {/* Úžitková plocha */}
                  <div className="hidden sm:block bg-purple-500/10 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <Square className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    {t('usableAreaFilter')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-muted-foreground mb-1 block">{t('maximum')}: {uzitkovaRozsah[1]} m²</label>
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      step={5}
                      value={uzitkovaRozsah[1]}
                      onChange={(e) => setUzitkovaRozsah([0, Number(e.target.value)])}
                      className="h-7 text-xs bg-background border-border text-foreground"
                      />
                  </div>
                  <Slider
                    min={0}
                    max={500}
                    step={5}
                    value={[uzitkovaRozsah[1]]}
                    onValueChange={([val]) => setUzitkovaRozsah([0, val])}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0 m²</span>
                    <span>500 m²</span>
                  </div>
                  </div>

                {/* Pokročilé filtre */}
                {showAdvancedFilters && (
                  <div className="pt-3 border-t space-y-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-600 dark:text-emerald-400" />
                        {t('energyClassFilter')}
                      </label>
                      <Select value={energyCert} onValueChange={setEnergyCert}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('all')}</SelectItem>
                          <SelectItem value="a0">{t('energyClassA0')}</SelectItem>
                          <SelectItem value="no">{t('energyClassNone')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Toggle pre pokročilé */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? `− ${t('lessFilters')}` : `+ ${t('advancedFilters')}`}
                </Button>

                {/* Reset */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => {
                    setKategoriaFilter("vsetky");
                    setVyrobcaFilter([]);
                    setTypFilter([]);
                    setPlocharozsah([0, 500]);
                    setUzitkovaRozsah([0, 500]);
                    setHladanie("");
                    setHladanieInput("");
                    setCenoveRozpatie([0, 300000]);
                    setPocetIziebFilter([]);
                    setPocetModulovFilter([]);
                    setModuloveDomyFilter('all');
                    setZoradenie("poradie");
                    setEnergyCert('all');
                  }}>
                  {t('reset')}
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-primary">{zoradeneDomy.length}</span> {t('outOf')} {verejneDomy.length} {t('houses')}
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow w-full max-w-full overflow-hidden">
            {/* Lišta nad výsledkami: počet, dizajn fotiek, zoradenie */}
            <Card className="mb-4 p-2 sm:p-3 bg-card border-border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="text-xs sm:text-sm font-bold text-foreground shrink-0">
                  <span className="text-primary">{zoradeneDomy.length}</span> {t('houses')}
                </p>

                <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-0.5 flex-1 sm:flex-none">
                  {[
                    { value: "murovka", label: t('brickDesign'), icon: Building2 },
                    { value: "drevo", label: t('woodDesign'), icon: TreePine },
                    { value: "podorys3d", label: t('threeDFloorPlan'), icon: Grid3x3 }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isActive = dizajnFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDizajnFilter(opt.value)}
                        title={opt.label}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                          isActive ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="sm:ml-auto sm:w-56">
                  <Select value={zoradenie} onValueChange={setZoradenie}>
                    <SelectTrigger className="h-8 text-xs">
                      <ArrowUpDown className="w-3 h-3 mr-1.5 shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poradie">{t('default')}</SelectItem>
                      <SelectItem value="cena_vzostupne">{t('priceCheapest')}</SelectItem>
                      <SelectItem value="cena_zostupne">{t('priceExpensive')}</SelectItem>
                      <SelectItem value="plocha_vzostupne">{t('areaSmallest')}</SelectItem>
                      <SelectItem value="plocha_zostupne">{t('areaLargest')}</SelectItem>
                      <SelectItem value="uzitkova_vzostupne">{t('usableAreaSmallest')}</SelectItem>
                      <SelectItem value="uzitkova_zostupne">{t('usableAreaLargest')}</SelectItem>
                      <SelectItem value="nazov_az">{t('nameAZ')}</SelectItem>
                      <SelectItem value="nazov_za">{t('nameZA')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
 
            {/* Srovnání panel */}
            {/* Srovnání panel */}
            {vybraneNaSrovnanie.length > 0 &&
            <Card className="p-4 mb-6 bg-card border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-emerald-400">
                      {t('selectedForComparison')}: {vybraneNaSrovnanie.length}/3
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {vybraneNaSrovnanie.length >= 2 &&
                      <Link to={`${createPageUrl("SrovnaniDomu")}?ids=${vybraneNaSrovnanie.map((d) => d.id).join(',')}`}>
                        <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                          {t('compareHouses')}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    }
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setVybraneNaSrovnanie([])}>
                      {t('cancelSelection')}
                    </Button>
                  </div>
                </div>
              </Card>
            }
 
            {error ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-bold text-red-700 mb-2">Chyba pri načítaní</h3>
                <p className="text-muted-foreground mb-6">{error.message}</p>
                <Button onClick={() => window.location.reload()}>Obnoviť stránku</Button>
              </Card>
            ) : isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4">
                {[...Array(6)].map((_, i) =>
              <Card key={i} className="h-48 sm:h-96 bg-muted animate-pulse" />
              )}
              </div>
            ) : zoradeneDomy.length > 0 ? (
              <>
                {vyrobcaFilter.length === 1 && vyrobcaFilter[0] === "Prosto House" && (
                  <div className="mb-8">
                    <ProstoHouseMarketing />
                  </div>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 w-full max-w-full">
                  {zoradeneDomy.map((dom, index) => {
                    const jeVybrany = vybraneNaSrovnanie.find((d) => d.id === dom.id);
                    return (
                      <DomCard
                        key={dom.id}
                        dom={dom}
                        index={index}
                        dizajnFilter={dizajnFilter}
                        portraitImages={portraitImages}
                        setPortraitImages={setPortraitImages}
                        jeVybrany={jeVybrany}
                        toggleSrovnanie={toggleSrovnanie}
                        vybraneNaSrovnanie={vybraneNaSrovnanie}
                        canManage={canManage}
                        handleToggleVerejny={handleToggleVerejny}
                        toggleVerejnyMutation={toggleVerejnyMutation}
                        handleDeleteDom={handleDeleteDom}
                        deleteDomMutation={deleteDomMutation}
                        location={location}
                        t={t}
                      />
                    );
                  })}
                </div>
              </>
            ) : (

            <Card className="p-12 text-center">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {t('noHousesFound')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('tryChangingFilters')}
                </p>
                <Button
                onClick={() => {
                  setKategoriaFilter("vsetky");
                  setVyrobcaFilter([]);
                  setTypFilter([]);
                  setPlocharozsah([0, 500]);
                  setUzitkovaRozsah([0, 500]);
                  setHladanie("");
                  setHladanieInput("");
                  setCenoveRozpatie([0, 500000]);
                  setPocetIziebFilter([]);
                  setPocetModulovFilter([]);
                  setModuloveDomyFilter('all');
                  setZoradenie("poradie");
                }}>

                  {t('resetFilters')}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>);

}