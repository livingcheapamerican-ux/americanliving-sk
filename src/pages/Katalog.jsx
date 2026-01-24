import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
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
import { ArrowRight, Filter, Home, CheckCircle, Search, ArrowUpDown, Plus, Square, LayoutGrid, Trash2, Eye, EyeOff, Grid3x3, Zap, Hammer, Caravan, Building2, TreePine, Fence, Boxes, Euro, Phone } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import ImageWithWatermark from "../components/ImageWithWatermark";

// Memoizovaný komponent pre kartičku domu
const DomCard = memo(({ dom, index, dizajnFilter, portraitImages, setPortraitImages, jeVybrany, toggleSrovnanie, vybraneNaSrovnanie, canManage, handleToggleVerejny, toggleVerejnyMutation, handleDeleteDom, deleteDomMutation, location, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 bg-white ${jeVybrany ? 'ring-2 ring-primary' : ''} ${dom.verejny === false ? 'opacity-60' : ''}`}>
        <div className={`relative overflow-hidden ${portraitImages[dom.id] ? 'h-[161px] sm:h-[414px]' : 'h-[134px] sm:h-[346px]'}`}>
          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`}>
            {dom.hlavny_obrazok ? (
              <ImageWithWatermark
                src={
                  dizajnFilter === "podorys3d" && dom.podorys_3d 
                    ? dom.podorys_3d 
                    : dizajnFilter === "drevo" && dom.zakladna_konfiguracia_obrazok 
                      ? dom.zakladna_konfiguracia_obrazok 
                      : dom.hlavny_obrazok
                }
                alt={dom.nazov}
                className="w-full h-full object-contain bg-gray-100 group-hover:scale-105 transition-all duration-500"
                useCatalogSetting={true}
                priority={index < 4}
                loading={index < 4 ? "eager" : "lazy"}
                onLoad={(e) => {
                  const img = e.target;
                  if (img.naturalHeight > img.naturalWidth) {
                    setPortraitImages(prev => ({ ...prev, [dom.id]: true }));
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </Link>
          <div className="absolute top-1 left-1 sm:top-4 sm:left-4 space-y-1 sm:space-y-2">
            {dom.celorocny && (
              <div className="bg-accent text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold">
                ✔ CELOROČNÝ
              </div>
            )}
            {dom.energeticky_certifikat && (
              <div className="bg-green-600 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold">
                ✔ CERTIFIKÁT A0
              </div>
            )}
          </div>
          <div className="absolute bottom-1 left-1 sm:hidden">
            <div className="bg-gray-900/95 text-white px-2 py-1 rounded-lg shadow-xl border border-white/20">
              <p className="text-xs font-bold">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
            </div>
          </div>
          <div className="absolute top-1 right-1 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
            <button
              onClick={() => toggleSrovnanie(dom)}
              disabled={!jeVybrany && vybraneNaSrovnanie.length >= 3}
              className={`p-1 sm:p-2 rounded-full transition-all ${
                jeVybrany ?
                'bg-primary text-white' :
                'bg-white/90 text-primary hover:bg-primary hover:text-white'} ${
                !jeVybrany && vybraneNaSrovnanie.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className={`w-3 h-3 sm:w-5 sm:h-5 transition-transform ${jeVybrany ? 'rotate-45' : ''}`} />
            </button>
            {canManage && (
              <button
                onClick={(e) => handleToggleVerejny(dom, e)}
                disabled={toggleVerejnyMutation.isPending}
                title={dom.verejny !== false ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                className={`p-1 sm:p-2 rounded-full transition-all disabled:opacity-50 ${
                  dom.verejny !== false 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {dom.verejny !== false ? <Eye className="w-3 h-3 sm:w-5 sm:h-5" /> : <EyeOff className="w-3 h-3 sm:w-5 sm:h-5" />}
              </button>
            )}
            {canManage && (
              <button
                onClick={(e) => handleDeleteDom(dom, e)}
                disabled={deleteDomMutation.isPending}
                className="p-1 sm:p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-1.5 sm:p-5">
          <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`}>
            <h3 className="text-xs sm:text-xl font-bold text-primary mb-1 sm:mb-3 group-hover:text-secondary transition-colors line-clamp-1">
              {dom.nazov}
            </h3>
          </Link>

          {/* Základné parametre */}
          <div className="grid grid-cols-2 gap-0.5 sm:gap-2 mb-1.5 sm:mb-4 text-[10px] sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
              <Home className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-primary" />
              <div className="flex flex-col min-w-0">
                <span className="hidden sm:block text-xs text-gray-500">{t('manufacturer')}</span>
                <span className="font-semibold text-primary text-[9px] sm:text-xs truncate">{dom.vyrobca}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
              {dom.typ_domu === 'montovany' ? (
                <Hammer className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-orange-600" />
              ) : dom.typ_domu === 'mobilny' ? (
                <Caravan className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-teal-600" />
              ) : (
                <LayoutGrid className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-500" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="hidden sm:block text-xs text-gray-500">{t('houseType')}</span>
                <span className="font-semibold text-primary text-[9px] sm:text-xs truncate">{dom.typ_domu === 'modularny' ? t('modularType') : dom.typ_domu === 'montovany' ? t('prefabType') : t('mobileType')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
              <div className="w-2.5 h-2 sm:w-4 sm:h-3 border sm:border-2 border-primary rounded-sm flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="hidden sm:block text-xs text-gray-500">{t('builtArea')}</span>
                <span className="font-semibold text-primary text-[9px] sm:text-xs">{dom.zastavana_plocha} m²</span>
              </div>
            </div>
            {dom.uzitkova_plocha && (
              <div className="hidden sm:flex items-center gap-2 text-gray-600">
                <Square className="w-4 h-4 flex-shrink-0 text-purple-500" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-500">{t('usableArea')}</span>
                  <span className="font-semibold text-primary text-xs">{dom.uzitkova_plocha} m²</span>
                </div>
              </div>
            )}
            {dom.pocet_izieb && (
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                <Grid3x3 className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500" />
                <div className="flex flex-col min-w-0">
                  <span className="hidden sm:block text-xs text-gray-500">{t('rooms')}</span>
                  <span className="font-semibold text-primary text-[9px] sm:text-xs">{dom.pocet_izieb} {t('roomsLabel')}</span>
                </div>
              </div>
            )}
            {dom.pocet_modulov && (
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                <Boxes className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-red-600" />
                <div className="flex flex-col min-w-0">
                  <span className="hidden sm:block text-xs text-gray-500">Moduly</span>
                  <span className="font-semibold text-primary text-[9px] sm:text-xs">{dom.pocet_modulov}</span>
                </div>
              </div>
            )}
            {dom.energeticky_certifikat && (
              <div className="hidden sm:flex items-center gap-2 text-gray-600 col-span-2">
                <Zap className="w-4 h-4 flex-shrink-0 text-green-600" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-500">{t('energyClass')}</span>
                  <span className="font-semibold text-green-600 text-xs">A0 <span className="text-gray-400 font-normal">{t('a0CertificateOption')}</span></span>
                </div>
              </div>
            )}
            {dom.terasa_plocha && (
              dom.vyrobca !== "Ticab house" || 
              (dom.popis && (dom.popis.includes("vstavaná") || dom.popis.includes("zabudovaná") || dom.popis.includes("Vstavaná") || dom.popis.includes("Zabudovaná"))) ||
              (dom.specifikacia && !dom.specifikacia.includes("Terasa: ❌"))
            ) && (
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                <Fence className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0 text-teal-500" />
                <div className="flex flex-col min-w-0">
                  <span className="hidden sm:block text-xs text-gray-500">Terasa</span>
                  <span className="font-semibold text-primary text-[9px] sm:text-xs">{dom.terasa_plocha} m²</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-1.5 sm:pt-4 border-t">
            <div className="flex-1">
              <p className="text-[9px] sm:text-xs text-gray-500 mb-1">
                {dom.vyrobca === "Ticab house" ? t('basicConfigPrice') : dom.vyrobca === "Prosto House" ? "Základná cena" : t('priceFromLabel')}
              </p>
              <p className="text-base sm:text-xl font-bold text-primary">
                {dom.zakladna_cena?.toLocaleString('sk-SK')} €
              </p>
              {dom.vyrobca === "Ticab house" && (
                <p className="text-[7px] sm:text-[9px] text-gray-400 mt-0.5 sm:mt-1 italic leading-tight">
                  {t('ticabPriceNote')}
                </p>
              )}
              {dom.vyrobca === "Prosto House" && (
                <p className="text-[7px] sm:text-[9px] text-gray-400 mt-0.5 sm:mt-1 italic leading-tight">
                  {t('basePriceNote')}
                </p>
              )}
            </div>
            <Link to={`${createPageUrl("DetailDomu")}?id=${dom.id}&return=${encodeURIComponent(location.pathname + location.search)}`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90 group-hover:bg-secondary text-[10px] sm:text-sm px-2 sm:px-3 h-6 sm:h-8">
                {t('detail')}
                <ArrowRight className="ml-0.5 sm:ml-1 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

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
  const [portraitImages, setPortraitImages] = useState({});
  const [energyCert, setEnergyCert] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin';
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

  const toggleSrovnanie = useCallback((dom) => {
    if (vybraneNaSrovnanie.find((d) => d.id === dom.id)) {
      setVybraneNaSrovnanie(vybraneNaSrovnanie.filter((d) => d.id !== dom.id));
    } else if (vybraneNaSrovnanie.length < 3) {
      setVybraneNaSrovnanie([...vybraneNaSrovnanie, dom]);
    }
  }, [vybraneNaSrovnanie]);

  const domy = Array.isArray(allDomy) ? allDomy : [];
  const verejneDomy = domy.filter((d) => d.verejny === true || d.verejny === undefined);
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
      const energyMatch = energyCert === 'all' || 
        (energyCert === 'a0' && dom.energeticky_certifikat) ||
        (energyCert === 'no' && !dom.energeticky_certifikat);
      
      return kategoriaMatch && vyrobcaMatch && typMatch && plochaMatch && uzitkovaMatch && hladanieMatch && cenaMatch && izbyMatch && modulyMatch && energyMatch;
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

  const vyrobcovia = ["Ticab house", "Prosto House", "Domki z Gór"];

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

  useEffect(() => {
    document.title = metaTitle;
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', metaTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', metaTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);

    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchemaOrg());
  }, [metaTitle, metaDescription]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 py-3 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start lg:items-center">
            {/* Ľavá časť - Hlavný nadpis a popis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-white">
                {t('houseCatalog')}
              </h1>
              <p className="text-sm sm:text-lg text-white font-medium">
                {t('modularAndMobileHouses')}
              </p>
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
                      <Button size="sm" variant="outline" className="bg-transparent border border-white text-white hover:bg-white hover:text-red-700 font-bold text-xs px-3 py-1.5 h-auto">
                        <Phone className="mr-1 w-3 h-3" />
                        Volať
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-8 max-w-full overflow-hidden">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-4 sm:mb-6">
          <TabsList className={`grid w-full max-w-xl mx-auto h-8 sm:h-10 ${canManage ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="vsetky" className="text-xs sm:text-sm">{t('all')} ({verejneDomy.length})</TabsTrigger>
            <TabsTrigger value="rodinne_domy" className="text-xs sm:text-sm">{t('familyHouses')} ({rodinneDomy.length})</TabsTrigger>
            <TabsTrigger value="mobilne_domy" className="text-xs sm:text-sm">{t('mobileHouses')} ({mobilneDomy.length})</TabsTrigger>
            {canManage && (
              <TabsTrigger value="skryte" className="text-xs sm:text-sm">{t('hidden')} ({skryteDomy.length})</TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 w-full max-w-full overflow-hidden">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 flex-shrink-0">

            <Card className="p-2 sm:p-4 sticky top-16 shadow-lg max-w-full overflow-hidden">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Filter className="w-4 h-4 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-primary">{t('filters')}</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Vyhľadávanie */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('search')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      placeholder={t('namePlaceholder')}
                      value={hladanieInput}
                      onChange={(e) => setHladanieInput(e.target.value)}
                      className="pl-7 h-8 text-sm" />

                  </div>
                </div>

                {/* Zoradenie */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <ArrowUpDown className="w-3 h-3 inline mr-1" />
                    {t('sortBy')}
                  </label>
                  <Select value={zoradenie} onValueChange={setZoradenie}>
                    <SelectTrigger className="h-8 text-sm">
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

                {/* Výrobca */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manufacturer')}</label>
                  <div className="space-y-1">
                    {vyrobcovia.map((v) => (
                      <div key={v} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`vyrobca-${v}`}
                          checked={vyrobcaFilter.includes(v)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVyrobcaFilter([...vyrobcaFilter, v]);
                            } else {
                              setVyrobcaFilter(vyrobcaFilter.filter((x) => x !== v));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`vyrobca-${v}`} className="text-xs cursor-pointer">{v}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typ domu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('type')}</label>
                  <div className="space-y-1">
                    {[
                      { value: "modularny", label: t('modularType') },
                      { value: "montovany", label: t('prefabType') },
                      { value: "mobilny", label: t('mobileType') }
                    ].map((typ) => (
                      <div key={typ.value} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`typ-${typ.value}`}
                          checked={typFilter.includes(typ.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTypFilter([...typFilter, typ.value]);
                            } else {
                              setTypFilter(typFilter.filter((x) => x !== typ.value));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`typ-${typ.value}`} className="text-xs cursor-pointer">{typ.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cenové rozpätie */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    💰 {t('priceRange')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 mb-1 block">Maximálne: {cenoveRozpatie[1].toLocaleString('sk-SK')} €</label>
                    <Input
                      type="number"
                      min={0}
                      max={300000}
                      step={5000}
                      value={cenoveRozpatie[1]}
                      onChange={(e) => setCenoveRozpatie([0, Number(e.target.value)])}
                      className="h-7 text-xs"
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
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0 €</span>
                    <span>300 000 €</span>
                    </div>
                </div>

                {/* Počet izieb */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('roomsFilter')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(domy) && [...new Set(domy.filter(d => d.pocet_izieb).map(d => d.pocet_izieb))].sort((a, b) => a - b).map((izby) => (
                      <div key={izby} className="flex items-center gap-0.5">
                        <Checkbox
                          id={`izby-${izby}`}
                          checked={pocetIziebFilter.includes(izby)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPocetIziebFilter([...pocetIziebFilter, izby]);
                            } else {
                              setPocetIziebFilter(pocetIziebFilter.filter((x) => x !== izby));
                            }
                          }}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black h-3.5 w-3.5"
                        />
                        <label htmlFor={`izby-${izby}`} className="text-xs cursor-pointer">{izby}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Počet modulov - zobrazí sa len pre modulárne domy */}
                {typFilter.includes("modularny") && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-red-600" />
                      Počet modulov
                    </label>
                    <p className="text-[10px] text-gray-600 mb-2">Tento výber upravuje počet modulov z ktorých sa má modulárny dom skladať</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(domy) && [...new Set(domy.filter(d => d.pocet_modulov && d.vyrobca === "Ticab house").map(d => d.pocet_modulov))].sort((a, b) => a - b).map((moduly) => (
                        <div key={moduly} className="flex items-center gap-0.5">
                          <Checkbox
                            id={`moduly-${moduly}`}
                            checked={pocetModulovFilter.includes(moduly)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPocetModulovFilter([...pocetModulovFilter, moduly]);
                              } else {
                                setPocetModulovFilter(pocetModulovFilter.filter((x) => x !== moduly));
                              }
                            }}
                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-3.5 w-3.5"
                          />
                          <label htmlFor={`moduly-${moduly}`} className="text-xs cursor-pointer">{moduly}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zastavaná plocha */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    📐 {t('builtAreaFilter')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 mb-1 block">Maximálne: {plocharozsah[1]} m²</label>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      step={5}
                      value={plocharozsah[1]}
                      onChange={(e) => setPlocharozsah([0, Number(e.target.value)])}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Slider
                    min={0}
                    max={200}
                    step={5}
                    value={[plocharozsah[1]]}
                    onValueChange={([val]) => setPlocharozsah([0, val])}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0 m²</span>
                    <span>200 m²</span>
                  </div>
                </div>

                {/* Úžitková plocha */}
                <div className="hidden sm:block bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    📏 {t('usableAreaFilter')}
                  </label>
                  <div className="mb-3">
                    <label className="text-[10px] text-gray-500 mb-1 block">Maximálne: {uzitkovaRozsah[1]} m²</label>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      step={5}
                      value={uzitkovaRozsah[1]}
                      onChange={(e) => setUzitkovaRozsah([0, Number(e.target.value)])}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Slider
                    min={0}
                    max={200}
                    step={5}
                    value={[uzitkovaRozsah[1]]}
                    onValueChange={([val]) => setUzitkovaRozsah([0, val])}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0 m²</span>
                    <span>200 m²</span>
                  </div>
                </div>

                {/* Pokročilé filtre */}
                {showAdvancedFilters && (
                  <div className="pt-3 border-t space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">⚡ Energetická trieda</label>
                      <Select value={energyCert} onValueChange={setEnergyCert}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Všetky</SelectItem>
                          <SelectItem value="a0">✅ A0 (celoročný)</SelectItem>
                          <SelectItem value="no">❌ Bez certifikátu</SelectItem>
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
                  {showAdvancedFilters ? '− Menej filtrov' : '+ Pokročilé filtre'}
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
                    setPlocharozsah([0, 200]);
                    setUzitkovaRozsah([0, 200]);
                    setHladanie("");
                    setHladanieInput("");
                    setCenoveRozpatie([0, 300000]);
                    setPocetIziebFilter([]);
                    setPocetModulovFilter([]);
                    setZoradenie("poradie");
                    setEnergyCert('all');
                  }}>
                  Reset
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-primary">{zoradeneDomy.length}</span> {t('outOf')} {verejneDomy.length} {t('houses')}
                </p>
              </div>
            </Card>
          </motion.aside>

          {/* Domy Grid */}
          <div className="flex-grow w-full max-w-full overflow-hidden">
            {/* Dizajn filter - Mobilne responzívny */}
            <div className="relative mb-4 sm:mb-6">
              {/* Animovaný gradient pozadie */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl opacity-90 blur-sm animate-pulse"></div>
              
              <Card className="relative p-3 sm:p-6 bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 sm:border-4 border-orange-400 shadow-2xl">
                {/* Dekoratívne prvky */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-300 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <div className="relative flex flex-col items-center gap-2 sm:gap-4">
                  {/* Text s ikonou */}
                  <div className="flex items-center gap-1.5 sm:gap-3 w-full justify-center">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex-shrink-0 w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <span className="text-base sm:text-3xl">🎨</span>
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-base font-bold text-gray-900 flex flex-wrap items-center justify-center sm:justify-start gap-1">
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs animate-pulse">{t('newBadge')}</span>
                        <span className="whitespace-nowrap">{t('showInDesign')}</span>
                      </p>
                      <p className="text-[8px] sm:text-sm text-gray-600 font-medium hidden sm:block">{t('viewHousesInDifferentColors')}</p>
                    </div>
                  </div>
                  
                  {/* Tlačidlá - optimalizované pre malé mobily */}
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 w-full">
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "murovka" ? "default" : "outline"}
                        onClick={() => setDizajnFilter("murovka")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "murovka" 
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0" 
                            : "border-2 border-orange-500 hover:bg-orange-100 text-gray-800"
                        }`}
                      >
                        <Building2 className="w-3 h-3 sm:w-6 sm:h-6 mr-1" />
                        <span className="truncate">{t('brickDesign')}</span>
                      </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "drevo" ? "default" : "outline"}
                        onClick={() => setDizajnFilter("drevo")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "drevo" 
                            ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white border-0" 
                            : "border-2 border-amber-500 hover:bg-amber-100 text-gray-800"
                        }`}
                      >
                        <TreePine className="w-3 h-3 sm:w-6 sm:h-6 mr-1" />
                        <span className="truncate">{t('woodDesign')}</span>
                      </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "podorys3d" ? "default" : "outline"}
                        onClick={() => setDizajnFilter("podorys3d")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "podorys3d" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0" 
                            : "border-2 border-purple-500 hover:bg-purple-100 text-gray-800"
                        }`}
                      >
                        <Grid3x3 className="w-3 h-3 sm:w-6 sm:h-6 mr-0.5 sm:mr-1" />
                        <span className="whitespace-nowrap">{t('threeDFloorPlan')}</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Srovnání panel */}
            {vybraneNaSrovnanie.length > 0 &&
            <Card className="p-4 mb-6 bg-blue-50 border-2 border-primary">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">
                      {t('selectedForComparison')}: {vybraneNaSrovnanie.length}/3
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {vybraneNaSrovnanie.length >= 2 &&
                  <Link to={`${createPageUrl("SrovnaniDomu")}?ids=${vybraneNaSrovnanie.map((d) => d.id).join(',')}`}>
                        <Button className="bg-secondary hover:bg-secondary/90">
                          {t('compareHouses')}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                  }
                    <Button variant="outline" onClick={() => setVybraneNaSrovnanie([])}>
                      {t('cancelSelection')}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {vybraneNaSrovnanie.map((dom) =>
                <div key={dom.id} className="bg-white px-3 py-1 rounded-full text-sm border border-primary flex items-center gap-2">
                      {dom.nazov}
                      <button onClick={() => toggleSrovnanie(dom)} className="text-red-500 hover:text-red-700">×</button>
                    </div>
                )}
                </div>
              </Card>
            }

            {error ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-bold text-red-700 mb-2">Chyba pri načítaní</h3>
                <p className="text-gray-500 mb-6">{error.message}</p>
                <Button onClick={() => window.location.reload()}>Obnoviť stránku</Button>
              </Card>
            ) : isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4">
                {[...Array(6)].map((_, i) =>
              <Card key={i} className="h-48 sm:h-96 animate-pulse bg-gray-200" />
              )}
              </div>
            ) : zoradeneDomy.length > 0 ?
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 w-full max-w-full">

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
              </motion.div> :

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
                  setZoradenie("poradie");
                }}>

                  {t('resetFilters')}
                </Button>
              </Card>
            }
          </div>
        </div>
      </div>
    </div>);

}