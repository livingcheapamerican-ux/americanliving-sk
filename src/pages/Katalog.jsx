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

// Memoizovaný komponent pre kartičku domu
const DomCard = memo(({ dom, index, dizajnFilter, portraitImages, setPortraitImages, jeVybrany, toggleSrovnanie, vybraneNaSrovnanie, canManage, handleToggleVerejny, toggleVerejnyMutation, handleDeleteDom, deleteDomMutation, location, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Card className={`group overflow-hidden hover:shadow-[0_0_30px_rgba(158,42,43,0.1)] dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:border-primary/30 dark:hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2 bg-card border-border flex flex-col h-full ${jeVybrany ? 'ring-2 ring-primary' : ''} ${dom.verejny === false ? 'opacity-60' : ''}`}>
        <div className="relative overflow-hidden aspect-[16/9]">
          <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}&return=${encodeURIComponent(location.pathname + location.search)}`}>
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
                className={`w-full h-full ${dizajnFilter === "podorys3d" ? "object-contain bg-white" : "object-cover"} group-hover:scale-110 transition-transform duration-700 ease-out`}
                useCatalogSetting={true}
                priority={index < 4}
                loading={index < 4 ? "eager" : "lazy"}
                optimizeWidth={400}
                width={400}
                height={225}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground group-hover:scale-110 transition-transform duration-500" />
              </div>
            )}
          </Link>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
            {canManage && (
              <button
                onClick={(e) => handleDeleteDom(dom, e)}
                disabled={deleteDomMutation.isPending}
                className="p-1.5 sm:p-2 rounded-full bg-red-600/90 backdrop-blur-sm text-white hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </button>
            )}
            {canManage && (
              <button
                onClick={(e) => handleToggleVerejny(dom, e)}
                disabled={toggleVerejnyMutation.isPending}
                title={dom.verejny !== false ? 'Skryť pre verejnosť' : 'Zobraziť pre verejnosť'}
                className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all disabled:opacity-50 shadow-lg ${
                  dom.verejny !== false 
                    ? 'bg-green-600/90 text-white hover:bg-green-700' 
                    : 'bg-muted-foreground/90 text-white hover:bg-muted-foreground'
                }`}
              >
                {dom.verejny !== false ? <Eye className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <EyeOff className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
              </button>
            )}
            <button
              onClick={() => toggleSrovnanie(dom)}
              disabled={!jeVybrany && vybraneNaSrovnanie.length >= 3}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-110 active:scale-95 ${
                jeVybrany
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(158,42,43,0.5)]'
                  : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 hover:bg-primary dark:hover:bg-red-500 hover:text-white'} ${
                !jeVybrany && vybraneNaSrovnanie.length >= 3 ? 'opacity-50 cursor-not-allowed hover:bg-white/90 dark:hover:bg-slate-900/90 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-100' : ''}`}
            >
              <Plus className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform duration-300 ${jeVybrany ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-2 sm:p-4 flex-1 flex flex-col">
        <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}&return=${encodeURIComponent(location.pathname + location.search)}`}>
          <h3 className="text-xs sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
            {dom.nazov}
          </h3>
          {dom.vyrobca === "Prosto House" && dom.prosto_house_kod && (
            <div className="flex items-center gap-1 mb-1">
              <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
              <span className="text-[8px] sm:text-[10px] font-bold text-red-500">{dom.prosto_house_kod}</span>
            </div>
          )}
        </Link>
          
          {/* Kľúčové benefity pod názvom */}
          <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-1 sm:mb-1.5 mt-1">
            {dom.celorocny && (
              <div className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold shadow-sm flex items-center gap-1 transition-all duration-300 group-hover:border-amber-400/50">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {t('yearRound')}
              </div>
            )}
            {dom.energeticky_certifikat && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold shadow-sm flex items-center gap-1 transition-all duration-300 group-hover:border-emerald-400/50">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:text-yellow-300 transition-colors" />
                A0
              </div>
            )}
          </div>

          {/* Základné parametre - dlazdice so zoom ikonami */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3 mt-2">
            <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-muted-foreground group-hover:text-primary group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-300" />
              <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">{t('manufacturer')}</div>
              <div className="font-bold text-foreground text-[9px] sm:text-[11px] leading-tight">{dom.vyrobca}</div>
            </div>
            
            <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
              {dom.typ_domu === 'montovany' ? (
                <Hammer className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-orange-500 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              ) : dom.typ_domu === 'mobilny' ? (
                <Caravan className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-teal-500 group-hover:scale-125 group-hover:-translate-x-1 transition-all duration-300" />
              ) : (
                <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-amber-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
              )}
              <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">{t('houseType')}</div>
              <div className="font-bold text-foreground text-[9px] sm:text-[11px] leading-tight">{dom.typ_domu === 'modularny' ? t('modularType') : dom.typ_domu === 'montovany' ? t('prefabType') : t('mobileType')}</div>
            </div>
            
            <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary rounded-sm mx-auto mb-1 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">{t('builtArea')}</div>
              <div className="font-bold text-foreground text-[9px] sm:text-[11px]">{dom.zastavana_plocha} m²</div>
            </div>
            
            {dom.uzitkova_plocha && (
              <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
                <Square className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-purple-400 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">{t('usableArea')}</div>
                <div className="font-bold text-foreground text-[9px] sm:text-[11px]">{dom.uzitkova_plocha} m²</div>
              </div>
            )}
            
            {dom.pocet_izieb && (
              <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
                <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-blue-400 group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-300" />
                <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">{t('rooms')}</div>
                <div className="font-bold text-foreground text-[9px] sm:text-[11px]">{dom.pocet_izieb}</div>
              </div>
            )}
            
            {dom.pocet_modulov && (
              <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
                <Boxes className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-red-500 group-hover:scale-125 transition-all duration-300" />
                <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">Moduly</div>
                <div className="font-bold text-foreground text-[9px] sm:text-[11px]">{dom.pocet_modulov}</div>
              </div>
            )}
            
            {dom.terasa_plocha && (
              dom.vyrobca !== "Ticab house" || 
              (dom.popis && (dom.popis.includes("vstavaná") || dom.popis.includes("zabudovaná") || dom.popis.includes("Vstavaná") || dom.popis.includes("Zabudovaná"))) ||
              (dom.specifikacia && !dom.specifikacia.includes("Terasa: ❌"))
            ) && (
              <div className="bg-background rounded border border-border/60 p-1 sm:p-1.5 text-center transition-colors group-hover:border-border">
                <Fence className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-teal-400 group-hover:scale-125 transition-all duration-300" />
                <div className="text-[8px] sm:text-[10px] text-muted-foreground/80 leading-tight mb-0.5">Terasa</div>
                <div className="font-bold text-foreground text-[9px] sm:text-[11px]">{dom.terasa_plocha} m²</div>
              </div>
            )}
          </div>

          <div className="pt-2 sm:pt-3 border-t border-border mt-auto">
            {/* Cena - zvýraznená */}
            <div className="bg-background rounded border border-border/80 p-2 sm:p-3 mb-2 sm:mb-3">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground font-semibold mb-1">
                {dom.vyrobca === "Ticab house" ? t('basicConfigPrice') : dom.vyrobca === "Prosto House" ? "Základná cena" : t('priceFromLabel')}
              </p>
              {dom.vyrobca === "Ticab house" ? (
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-red-500/70 line-through">
                      {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                    </p>
                    <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-all drop-shadow-sm">
                      {Math.round(dom.zakladna_cena * 0.95)?.toLocaleString('sk-SK')} €
                    </p>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    💰 S dotáciou AMERICANA
                  </p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground/75 mt-1">vrátane DPH</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-all drop-shadow-sm">
                    {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                  </p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground/75 mt-1">vrátane DPH</p>
                </div>
              )}
            </div>
            {/* Akčné tlačidlá */}
            <div className="space-y-1 sm:space-y-1.5">
              {dom.vyrobca === "Ticab house" && (
                <div className="mb-2">
                  <Link to={createPageUrl(`DotaciaAmericana?dom=${dom.id}`)}>
                    <Button 
                      size="sm" 
                      className="relative overflow-hidden w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 h-7 sm:h-8 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all border border-emerald-500/50 group/btn"
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <Gift className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 drop-shadow-md" />
                      <span className="relative z-10 drop-shadow-md tracking-wider">{t('dotacia')}</span>
                    </Button>
                  </Link>
                  <p className="text-[8px] sm:text-[10px] text-center font-bold text-emerald-600 dark:text-emerald-400 mt-1 leading-tight px-1">
                    Požiadajte o dotáciu na energie zdarma
                  </p>
                </div>
              )}
              <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}&return=${encodeURIComponent(location.pathname + location.search)}`}>
                <Button size="sm" className="w-full bg-slate-100 dark:bg-white/10 hover:bg-primary dark:hover:bg-red-600 text-foreground dark:text-white border border-slate-200 dark:border-white/20 hover:border-primary dark:hover:border-red-500 text-[10px] sm:text-xs px-2 h-8 font-bold shadow-sm transition-all duration-300">
                  {t('detail')}
                  <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
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
  const [moduloveDomyFilter, setModuloveDomyFilter] = useState('all'); // 'all', '1modul', 'viacmodulov'
  const [portraitImages, setPortraitImages] = useState({});
  const [energyCert, setEnergyCert] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden max-w-full font-['Outfit']">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <link rel="canonical" href={`https://www.americanliving.sk/Katalog`} />
        <script type="application/ld+json">
          {JSON.stringify(generateSchemaOrg())}
        </script>
      </Helmet>
      {/* Header */}
      <section className="bg-slate-900/5 dark:bg-slate-900/40 border-b border-border/60 py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start lg:items-center">
            {/* Ľavá časť - Hlavný nadpis a popis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-foreground">
                {t('houseCatalog')}
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground font-light">
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
      </section>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12 max-w-full overflow-hidden">
        {/* Tabs pre kategórie */}
        <Tabs value={kategoriaFilter} onValueChange={setKategoriaFilter} className="mb-4 sm:mb-6">
          <TabsList className={`grid w-full max-w-xl mx-auto h-10 sm:h-12 bg-card/50 backdrop-blur-xl border border-border rounded-full p-1 shadow-xl ${canManage ? 'grid-cols-4' : 'grid-cols-3'}`}>
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
            <div className="absolute inset-0 bg-primary/5 dark:bg-red-600/10 blur-[50px] pointer-events-none rounded-full" />
            <Card className="p-3 sm:p-5 lg:sticky lg:top-24 shadow-xl bg-card/85 backdrop-blur-2xl border-border max-w-full overflow-hidden relative z-10">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
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

                {/* Zoradenie */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
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
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Home className="w-3 h-3 text-red-500" />
                    {t('manufacturer')}
                  </label>
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
                </div>

                {/* Typ domu */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <LayoutGrid className="w-3 h-3 text-amber-500" />
                    {t('type')}
                  </label>
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
                </div>

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
            {/* Dizajn filter - Mobilne responzívny */}
            <div className="relative mb-4 sm:mb-6">
              {/* Animovaný gradient pozadie */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl opacity-90 blur-sm animate-pulse"></div>
              
              <Card className="relative p-3 sm:p-6 bg-gradient-to-br from-orange-50/20 via-background to-red-50/20 dark:from-orange-950/20 dark:via-slate-900/40 dark:to-red-950/20 border-2 sm:border-4 border-orange-400 dark:border-orange-500/50 shadow-2xl">
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
                      <p className="text-[10px] sm:text-base font-bold text-foreground flex flex-wrap items-center justify-center sm:justify-start gap-1">
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px] sm:text-xs animate-pulse">{t('newBadge')}</span>
                        <span className="whitespace-nowrap">{t('showInDesign')}</span>
                      </p>
                      <p className="text-[8px] sm:text-sm text-muted-foreground font-medium hidden sm:block">{t('viewHousesInDifferentColors')}</p>
                    </div>
                  </div>
                  
                  {/* Tlačidlá - optimalizované pre malé mobily */}
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 w-full">
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "murovka" ? "default" : "ghost"}
                        onClick={() => setDizajnFilter("murovka")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "murovka" 
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0" 
                            : "border-2 border-orange-500 bg-card hover:bg-orange-500/10 text-foreground"
                        }`}
                      >
                        <Building2 className="w-3 h-3 sm:w-6 sm:h-6 mr-1" />
                        <span className="truncate">{t('brickDesign')}</span>
                      </Button>
                    </motion.div>
 
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "drevo" ? "default" : "ghost"}
                        onClick={() => setDizajnFilter("drevo")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "drevo" 
                            ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white border-0" 
                            : "border-2 border-amber-500 bg-card hover:bg-amber-500/10 text-foreground"
                        }`}
                      >
                        <TreePine className="w-3 h-3 sm:w-6 sm:h-6 mr-1" />
                        <span className="truncate">{t('woodDesign')}</span>
                      </Button>
                    </motion.div>
 
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant={dizajnFilter === "podorys3d" ? "default" : "ghost"}
                        onClick={() => setDizajnFilter("podorys3d")}
                        className={`w-full px-2 py-2 sm:px-8 sm:py-4 text-[10px] sm:text-lg font-bold shadow-lg transition-all ${
                          dizajnFilter === "podorys3d" 
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0" 
                            : "border-2 border-purple-500 bg-card hover:bg-purple-500/10 text-foreground"
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 w-full max-w-full"
                >
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
                </motion.div>
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
    </div>);

}