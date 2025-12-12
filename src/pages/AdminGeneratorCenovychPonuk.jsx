import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Eye, Plus, Trash2, Palette, FileText, Image, Settings, Grid3x3, ArrowRight, CheckCircle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminGeneratorCenovychPonuk() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("zakladne");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedSablona, setSelectedSablona] = useState(null);
  const [expandedSekcie, setExpandedSekcie] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: nastavenia = [] } = useQuery({
    queryKey: ['nastavenia-cenovej-ponuky'],
    queryFn: () => base44.entities.NastavenieCenovejPonuky.list()
  });

  const aktivneNastavenie = selectedSablona 
    ? nastavenia.find(n => n.id === selectedSablona) 
    : nastavenia.find(n => n.aktivne) || nastavenia[0];

  // Update formData when aktivneNastavenie changes
  React.useEffect(() => {
    if (aktivneNastavenie) {
      setFormData({
        nazov: aktivneNastavenie.nazov || "Predvolené nastavenie",
        logo_url: aktivneNastavenie.logo_url || "",
        nazov_spolocnosti: aktivneNastavenie.nazov_spolocnosti || "American Living",
        adresa: aktivneNastavenie.adresa || "",
        telefon: aktivneNastavenie.telefon || "+421 905 138 124",
        email: aktivneNastavenie.email || "info@americanliving.sk",
        web: aktivneNastavenie.web || "www.americanliving.sk",
        ico: aktivneNastavenie.ico || "",
        dic: aktivneNastavenie.dic || "",
        ic_dph: aktivneNastavenie.ic_dph || "",
        sablona_dizajnu: aktivneNastavenie.sablona_dizajnu || "modern_red",
        farba_hlavna: aktivneNastavenie.farba_hlavna || "#EF4444",
        farba_sekundarna: aktivneNastavenie.farba_sekundarna || "#dc2626",
        uvodni_text: aktivneNastavenie.uvodni_text || "",
        zavery_text: aktivneNastavenie.zavery_text || "",
        dalsie_texty: aktivneNastavenie.dalsie_texty || [],
        mapovanie_fotiek_ticabhouse: aktivneNastavenie.mapovanie_fotiek_ticabhouse || [],
        mapovanie_fotiek_prosto: aktivneNastavenie.mapovanie_fotiek_prosto || [],
        zobrazovat_preciarknute: aktivneNastavenie.zobrazovat_preciarknute !== false,
        zobrazovat_doplnkove_sluzby: aktivneNastavenie.zobrazovat_doplnkove_sluzby !== false,
        automaticke_pravidla: aktivneNastavenie.automaticke_pravidla || {
          pouzit_zakladnu_konfiguraciu_ak_nie_je_omietka: true,
          vzdy_pridat_podorysy: true
        },
        aktivne: aktivneNastavenie.aktivne || false
      });
    }
  }, [aktivneNastavenie]);

  const [formData, setFormData] = useState({
    nazov: aktivneNastavenie?.nazov || "Predvolené nastavenie",
    logo_url: aktivneNastavenie?.logo_url || "",
    nazov_spolocnosti: aktivneNastavenie?.nazov_spolocnosti || "American Living",
    adresa: aktivneNastavenie?.adresa || "",
    telefon: aktivneNastavenie?.telefon || "+421 905 138 124",
    email: aktivneNastavenie?.email || "info@americanliving.sk",
    web: aktivneNastavenie?.web || "www.americanliving.sk",
    ico: aktivneNastavenie?.ico || "",
    dic: aktivneNastavenie?.dic || "",
    ic_dph: aktivneNastavenie?.ic_dph || "",
    sablona_dizajnu: aktivneNastavenie?.sablona_dizajnu || "modern",
    farba_hlavna: aktivneNastavenie?.farba_hlavna || "#EF4444",
    farba_sekundarna: aktivneNastavenie?.farba_sekundarna || "#dc2626",
    uvodni_text: aktivneNastavenie?.uvodni_text || "",
    zavery_text: aktivneNastavenie?.zavery_text || "",
    dalsie_texty: aktivneNastavenie?.dalsie_texty || [],
    mapovanie_fotiek_ticabhouse: aktivneNastavenie?.mapovanie_fotiek_ticabhouse || [],
    mapovanie_fotiek_prosto: aktivneNastavenie?.mapovanie_fotiek_prosto || [],
    zobrazovat_preciarknute: aktivneNastavenie?.zobrazovat_preciarknute !== false,
    zobrazovat_doplnkove_sluzby: aktivneNastavenie?.zobrazovat_doplnkove_sluzby !== false,
    automaticke_pravidla: aktivneNastavenie?.automaticke_pravidla || {
      pouzit_zakladnu_konfiguraciu_ak_nie_je_omietka: true,
      vzdy_pridat_podorysy: true
    },
    aktivne: true
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (aktivneNastavenie?.id) {
        return base44.entities.NastavenieCenovejPonuky.update(aktivneNastavenie.id, data);
      } else {
        return base44.entities.NastavenieCenovejPonuky.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nastavenia-cenovej-ponuky'] });
      toast.success('Nastavenie uložené');
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success('Logo nahrané');
    } catch (error) {
      toast.error('Chyba pri nahrávaní loga');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addDalsiText = () => {
    setFormData({
      ...formData,
      dalsie_texty: [...formData.dalsie_texty, { pozicia: "pred_ceny", text: "" }]
    });
  };

  const removeDalsiText = (index) => {
    const updated = [...formData.dalsie_texty];
    updated.splice(index, 1);
    setFormData({ ...formData, dalsie_texty: updated });
  };

  const updateDalsiText = (index, field, value) => {
    const updated = [...formData.dalsie_texty];
    updated[index][field] = value;
    setFormData({ ...formData, dalsie_texty: updated });
  };

  // Definície sekcií a dlaždíc konfigurátorov
  const ticabhouseSekcie = [
    {
      id: "izolacia",
      nazov: "Izolácia",
      dlazdice: [
        { id: "izolacia_stien_200mm", nazov: "Izolácia stien 200mm" },
        { id: "izolacia_stien_250mm", nazov: "Izolácia stien 250mm" },
        { id: "izolacia_podlahy_200mm", nazov: "Izolácia podlahy 200mm" },
        { id: "izolacia_stropu_200mm", nazov: "Izolácia stropu 200mm" },
      ]
    },
    {
      id: "vykurovanie",
      nazov: "Vykurovanie a klimatizácia",
      dlazdice: [
        { id: "tepelne_cerpadlo", nazov: "Tepelné čerpadlo" },
        { id: "podlahove_kurenie", nazov: "Podlahové kúrenie" },
        { id: "klimatizacia", nazov: "Klimatizácia" },
        { id: "pripravaKrb", nazov: "Príprava na krb" },
        { id: "ochranaKachle", nazov: "Ochrana kachle" },
      ]
    },
    {
      id: "ventilacia",
      nazov: "Ventilácia",
      dlazdice: [
        { id: "pripravaNaRekuperaciu", nazov: "Príprava na rekuperáciu" },
        { id: "rekuperacia", nazov: "Rekuperácia" },
      ]
    },
    {
      id: "fasada",
      nazov: "Fasáda",
      dlazdice: [
        { id: "fasada_omietka", nazov: "Omietka" },
        { id: "fasada_smrekovec", nazov: "Smrekovec" },
        { id: "fasada_falcovane", nazov: "Falcované dosky" },
        { id: "fasada_thermowood", nazov: "Thermowood" },
      ]
    },
    {
      id: "strecha",
      nazov: "Strecha",
      dlazdice: [
        { id: "strecha_falcovane", nazov: "Falcovaný plech" },
        { id: "odkvapy", nazov: "Odkvapový systém" },
      ]
    },
    {
      id: "dvere_okna",
      nazov: "Dvere a okná",
      dlazdice: [
        { id: "dvere_kovove", nazov: "Kovové dvere" },
        { id: "dvere_posuvne", nazov: "Posuvné dvere" },
      ]
    },
    {
      id: "interier",
      nazov: "Interiér",
      dlazdice: [
        { id: "obklad_smrek_bez_uzlov", nazov: "Smrek bez úzlov" },
        { id: "obklad_sadrokarton_tapeta", nazov: "Sadrokartón + tapeta" },
        { id: "obklad_osb_panel", nazov: "OSB panel" },
      ]
    },
    {
      id: "elektro",
      nazov: "Elektroinštalácia",
      dlazdice: [
        { id: "elektro_cz", nazov: "Elektroinštalácia CZ" },
        { id: "elektro_ge", nazov: "Elektroinštalácia GE" },
        { id: "bleskozvod", nazov: "Bleskozvod" },
        { id: "prepat", nazov: "Prepäťová ochrana" },
        { id: "pripravaNaSolarnePanely", nazov: "Príprava na solárne panely" },
      ]
    },
    {
      id: "kupelna",
      nazov: "Kúpeľňa",
      dlazdice: [
        { id: "sprchovyKut", nazov: "Sprchový kút" },
        { id: "vana", nazov: "Vaňa" },
        { id: "bateria", nazov: "Batéria" },
        { id: "skrinka", nazov: "Skrinka" },
        { id: "strop_kupelna_sadrokarton", nazov: "Strop sadrokartón" },
      ]
    },
    {
      id: "zaklady_montaz",
      nazov: "Základy a montáž",
      dlazdice: [
        { id: "zaklady_vruty", nazov: "Základy vruty" },
        { id: "zaklady_patky", nazov: "Základy pätky" },
        { id: "zaklady_pasove", nazov: "Základy pásové" },
        { id: "montaz", nazov: "Montáž" },
        { id: "doprava", nazov: "Doprava" },
      ]
    },
    {
      id: "sluzby",
      nazov: "Doplnkové služby",
      dlazdice: [
        { id: "inziniering", nazov: "Inžiniering" },
        { id: "projektACertifikacia", nazov: "Projekt a certifikácia" },
        { id: "revizia", nazov: "Revízia" },
      ]
    }
  ];

  const prostohouseSekcie = [
    {
      id: "fasada",
      nazov: "Fasáda",
      dlazdice: [
        { id: "fasada_drevo", nazov: "Drevená fasáda" },
        { id: "fasada_omietka", nazov: "Omietka" },
        { id: "fasada_kombinovana", nazov: "Kombinovaná" },
      ]
    },
    {
      id: "strecha",
      nazov: "Strecha",
      dlazdice: [
        { id: "strecha_skridla", nazov: "Škridla" },
        { id: "strecha_plech", nazov: "Plech" },
      ]
    },
    {
      id: "okna_dvere",
      nazov: "Okná a dvere",
      dlazdice: [
        { id: "okna_plastove", nazov: "Plastové okná" },
        { id: "okna_drevene", nazov: "Drevené okná" },
        { id: "dvere_vstupne", nazov: "Vstupné dvere" },
      ]
    },
    {
      id: "vykurovanie",
      nazov: "Vykurovanie",
      dlazdice: [
        { id: "tepelne_cerpadlo", nazov: "Tepelné čerpadlo" },
        { id: "krb", nazov: "Krb" },
        { id: "elektricke", nazov: "Elektrické vykurovanie" },
      ]
    },
    {
      id: "interier",
      nazov: "Interiér finiš",
      dlazdice: [
        { id: "ziadne", nazov: "Bez interiéru (Hrubá stavba)" },
        { id: "drevo", nazov: "Drevo (Obloženie)" },
        { id: "sadrokarton", nazov: "Sadrokartón (Omietka)" },
      ]
    },
    {
      id: "kupelna",
      nazov: "Kúpeľňa",
      dlazdice: [
        { id: "sprcha", nazov: "Sprcha" },
        { id: "vana", nazov: "Vaňa" },
        { id: "zachod", nazov: "Záchod" },
        { id: "umyvadlo", nazov: "Umývadlo" },
      ]
    }
  ];

  const toggleSekcia = (sekciaId) => {
    setExpandedSekcie({
      ...expandedSekcie,
      [sekciaId]: !expandedSekcie[sekciaId]
    });
  };

  const addMapovanieFotky = (vyrobca, sekciaId, dlazdicaId, nazovDlazdice) => {
    const field = vyrobca === "ticabhouse" ? "mapovanie_fotiek_ticabhouse" : "mapovanie_fotiek_prosto";
    setFormData({
      ...formData,
      [field]: [...formData[field], { 
        sekcia_id: sekciaId,
        dlazdica_id: dlazdicaId, 
        nazov_dlazdice: nazovDlazdice, 
        typ_fotky: "titulna", 
        popis: "" 
      }]
    });
  };

  const removeMapovanieFotky = (vyrobca, index) => {
    const field = vyrobca === "ticabhouse" ? "mapovanie_fotiek_ticabhouse" : "mapovanie_fotiek_prosto";
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  const updateMapovanieFotky = (vyrobca, index, field, value) => {
    const fieldName = vyrobca === "ticabhouse" ? "mapovanie_fotiek_ticabhouse" : "mapovanie_fotiek_prosto";
    const updated = [...formData[fieldName]];
    updated[index][field] = value;
    setFormData({ ...formData, [fieldName]: updated });
  };

  const createNovaSablona = async () => {
    try {
      const novaSablona = {
        nazov: "Nová šablóna",
        logo_url: "",
        nazov_spolocnosti: "American Living",
        telefon: "+421 905 138 124",
        email: "info@americanliving.sk",
        web: "www.americanliving.sk",
        sablona_dizajnu: "modern_red",
        farba_hlavna: "#EF4444",
        farba_sekundarna: "#dc2626",
        aktivne: false,
        zobrazovat_preciarknute: true,
        zobrazovat_doplnkove_sluzby: true,
        mapovanie_fotiek_ticabhouse: [],
        mapovanie_fotiek_prosto: [],
        automaticke_pravidla: {
          pouzit_zakladnu_konfiguraciu_ak_nie_je_omietka: true,
          vzdy_pridat_podorysy: true
        }
      };
      
      const result = await base44.entities.NastavenieCenovejPonuky.create(novaSablona);
      queryClient.invalidateQueries({ queryKey: ['nastavenia-cenovej-ponuky'] });
      setSelectedSablona(result.id);
      toast.success('Nová šablóna vytvorená');
    } catch (error) {
      toast.error('Chyba pri vytváraní šablóny: ' + error.message);
    }
  };



  const isSuperAdmin = user?.super_admin === true;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prístup zamietnutý</h2>
          <p className="text-gray-600">Túto stránku môžu vidieť len super administrátori.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header s gradient pozadím */}
        <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold">Generátor cenových ponúk</h1>
              </div>
              <p className="text-white/90 ml-15">Nastavte dizajn, obsah a mapovanie fotiek pre cenové ponuky</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={createNovaSablona} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Nová šablóna
              </Button>
              <Button 
                onClick={() => {
                  console.log('Otváram preview, showPreview:', showPreview);
                  setShowPreview(true);
                  console.log('Po nastavení showPreview na true');
                }} 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Eye className="w-4 h-4 mr-2" />
                Náhľad ponuky
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending} 
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Ukladám...' : 'Uložiť nastavenie'}
              </Button>
            </div>
          </div>
          
          {/* Progress indicator */}
          {aktivneNastavenie && (
            <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Upravujete: <span className="font-semibold text-white">{aktivneNastavenie.nazov}</span>
            </div>
          )}
        </div>

        {/* Prehľad šablón */}
        {nastavenia.length > 0 && (
          <Card className="p-8 mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary" />
                  Prednastavené šablóny
                </h2>
                <p className="text-sm text-gray-600 mt-1">Vyberte šablónu pre úpravu alebo vytvorte novú</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {nastavenia.length} {nastavenia.length === 1 ? 'šablóna' : nastavenia.length < 5 ? 'šablóny' : 'šablón'}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nastavenia.map((sablona) => (
                <div
                  key={sablona.id}
                  onClick={() => {
                    setSelectedSablona(sablona.id);
                    setActiveTab("zakladne");
                  }}
                  className={`group relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-xl ${
                    selectedSablona === sablona.id 
                      ? 'border-primary ring-4 ring-primary/20 bg-primary/5 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-primary/50 bg-white'
                  }`}
                >
                  {/* Color preview bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
                    style={{ background: `linear-gradient(90deg, ${sablona.farba_hlavna} 0%, ${sablona.farba_sekundarna} 100%)` }}
                  />
                  
                  <div className="flex items-start justify-between mb-3 mt-2">
                    <h3 className="font-bold text-gray-900 text-lg">{sablona.nazov}</h3>
                    <div className="flex flex-col gap-2">
                      {sablona.aktivne && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Aktívne
                        </span>
                      )}
                      {selectedSablona === sablona.id && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          ✏️ Upravuje sa
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {sablona.vyrobca_filter && (
                    <div className="mb-3 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg inline-block">
                      <p className="text-xs text-purple-700 font-medium">
                        🏠 Pre: {sablona.vyrobca_filter}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                        style={{ backgroundColor: sablona.farba_hlavna }}
                        title="Hlavná farba"
                      />
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                        style={{ backgroundColor: sablona.farba_sekundarna }}
                        title="Sekundárna farba"
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{sablona.sablona_dizajnu}</span>
                  </div>
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                    selectedSablona === sablona.id ? 'hidden' : ''
                  }`}></div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-white shadow-lg border-0 p-2 rounded-xl">
            <TabsTrigger 
              value="zakladne"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Základné</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dizajn"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Palette className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dizajn</span>
              <span className="sm:hidden">🎨</span>
            </TabsTrigger>
            <TabsTrigger 
              value="texty"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Texty</span>
              <span className="sm:hidden">📝</span>
            </TabsTrigger>
            <TabsTrigger 
              value="fotky-ticab"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Image className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Fotky Ticabhouse</span>
              <span className="lg:hidden">Ticab</span>
            </TabsTrigger>
            <TabsTrigger 
              value="fotky-prosto"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Image className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Fotky Prosto</span>
              <span className="lg:hidden">Prosto</span>
            </TabsTrigger>
          </TabsList>

          {/* ZÁKLADNÉ NASTAVENIA */}
          <TabsContent value="zakladne">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Základné informácie</h2>
                  <p className="text-sm text-gray-600">Kontaktné údaje a nastavenia spoločnosti</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>Logo spoločnosti</Label>
                  {formData.logo_url && (
                    <div className="mt-2 mb-4">
                      <img src={formData.logo_url} alt="Logo" className="h-20 object-contain" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="flex-1"
                    />
                    {uploadingLogo && <span className="text-sm text-gray-500">Nahrávam...</span>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Názov nastavenia</Label>
                    <Input
                      value={formData.nazov}
                      onChange={(e) => setFormData({...formData, nazov: e.target.value})}
                      placeholder="Predvolené nastavenie"
                    />
                  </div>

                  <div>
                    <Label>Názov spoločnosti</Label>
                    <Input
                      value={formData.nazov_spolocnosti}
                      onChange={(e) => setFormData({...formData, nazov_spolocnosti: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Adresa</Label>
                    <Input
                      value={formData.adresa}
                      onChange={(e) => setFormData({...formData, adresa: e.target.value})}
                      placeholder="Ulica, Mesto, PSČ"
                    />
                  </div>

                  <div>
                    <Label>Telefón</Label>
                    <Input
                      value={formData.telefon}
                      onChange={(e) => setFormData({...formData, telefon: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Web</Label>
                    <Input
                      value={formData.web}
                      onChange={(e) => setFormData({...formData, web: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>IČO</Label>
                    <Input
                      value={formData.ico}
                      onChange={(e) => setFormData({...formData, ico: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>DIČ</Label>
                    <Input
                      value={formData.dic}
                      onChange={(e) => setFormData({...formData, dic: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>IČ DPH</Label>
                    <Input
                      value={formData.ic_dph}
                      onChange={(e) => setFormData({...formData, ic_dph: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.zobrazovat_preciarknute}
                      onCheckedChange={(checked) => setFormData({...formData, zobrazovat_preciarknute: checked})}
                    />
                    <Label>Zobraziť prečiarknuté položky</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.zobrazovat_doplnkove_sluzby}
                      onCheckedChange={(checked) => setFormData({...formData, zobrazovat_doplnkove_sluzby: checked})}
                    />
                    <Label>Zobraziť doplnkové služby</Label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* DIZAJN */}
          <TabsContent value="dizajn">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Vyberte dizajn cenovej ponuky</h2>
                  <p className="text-sm text-gray-600">12 moderných dizajnových šablón</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Galéria šablón */}
                <div>
                  <Label className="mb-4 block">Šablóny dizajnu</Label>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        id: "modern_red", 
                        nazov: "Modern Red", 
                        popis: "Moderný červený dizajn", 
                        hlavna: "#EF4444", 
                        sekundarna: "#dc2626",
                        preview: "linear-gradient(135deg, #EF4444 0%, #dc2626 100%)"
                      },
                      { 
                        id: "elegant_blue", 
                        nazov: "Elegant Blue", 
                        popis: "Elegantný modrý dizajn", 
                        hlavna: "#3B82F6", 
                        sekundarna: "#2563EB",
                        preview: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                      },
                      { 
                        id: "premium_gold", 
                        nazov: "Premium Gold", 
                        popis: "Luxusný zlatý dizajn", 
                        hlavna: "#F59E0B", 
                        sekundarna: "#D97706",
                        preview: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                      },
                      { 
                        id: "forest_green", 
                        nazov: "Forest Green", 
                        popis: "Prírodný zelený dizajn", 
                        hlavna: "#10B981", 
                        sekundarna: "#059669",
                        preview: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                      },
                      { 
                        id: "royal_purple", 
                        nazov: "Royal Purple", 
                        popis: "Kráľovský fialový dizajn", 
                        hlavna: "#8B5CF6", 
                        sekundarna: "#7C3AED",
                        preview: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                      },
                      { 
                        id: "ocean_teal", 
                        nazov: "Ocean Teal", 
                        popis: "Oceánsky tyrkysový dizajn", 
                        hlavna: "#14B8A6", 
                        sekundarna: "#0D9488",
                        preview: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)"
                      },
                      { 
                        id: "sunset_orange", 
                        nazov: "Sunset Orange", 
                        popis: "Západný oranžový dizajn", 
                        hlavna: "#F97316", 
                        sekundarna: "#EA580C",
                        preview: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
                      },
                      { 
                        id: "midnight_dark", 
                        nazov: "Midnight Dark", 
                        popis: "Tmavý polnočný dizajn", 
                        hlavna: "#1F2937", 
                        sekundarna: "#111827",
                        preview: "linear-gradient(135deg, #1F2937 0%, #111827 100%)"
                      },
                      { 
                        id: "cherry_blossom", 
                        nazov: "Cherry Blossom", 
                        popis: "Ružový sakurový dizajn", 
                        hlavna: "#EC4899", 
                        sekundarna: "#DB2777",
                        preview: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)"
                      },
                      { 
                        id: "slate_professional", 
                        nazov: "Slate Professional", 
                        popis: "Profesionálny šedý dizajn", 
                        hlavna: "#64748B", 
                        sekundarna: "#475569",
                        preview: "linear-gradient(135deg, #64748B 0%, #475569 100%)"
                      },
                      { 
                        id: "emerald_fresh", 
                        nazov: "Emerald Fresh", 
                        popis: "Čerstvý smaragdový dizajn", 
                        hlavna: "#34D399", 
                        sekundarna: "#10B981",
                        preview: "linear-gradient(135deg, #34D399 0%, #10B981 100%)"
                      },
                      { 
                        id: "indigo_corporate", 
                        nazov: "Indigo Corporate", 
                        popis: "Korporátny indigový dizajn", 
                        hlavna: "#6366F1", 
                        sekundarna: "#4F46E5",
                        preview: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                      },
                    ].map((sablona) => (
                      <div
                        key={sablona.id}
                        onClick={() => setFormData({
                          ...formData, 
                          sablona_dizajnu: sablona.id,
                          farba_hlavna: sablona.hlavna,
                          farba_sekundarna: sablona.sekundarna
                        })}
                        className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all ${
                          formData.sablona_dizajnu === sablona.id
                            ? 'border-primary ring-4 ring-primary/30 shadow-xl'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-lg'
                        }`}
                      >
                        {/* Preview */}
                        <div 
                          className="h-32 relative"
                          style={{ background: sablona.preview }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                              <div className="text-xs font-bold text-gray-900">CENOVÁ PONUKA</div>
                              <div className="text-[10px] text-gray-600 mt-1">American Living</div>
                            </div>
                          </div>
                          {formData.sablona_dizajnu === sablona.id && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                              <Eye className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="p-3 bg-white">
                          <h4 className="font-bold text-sm text-gray-900">{sablona.nazov}</h4>
                          <p className="text-xs text-gray-500 mt-1">{sablona.popis}</p>
                          <div className="flex gap-2 mt-2">
                            <div 
                              className="w-6 h-6 rounded border shadow-sm"
                              style={{ backgroundColor: sablona.hlavna }}
                              title="Hlavná farba"
                            />
                            <div 
                              className="w-6 h-6 rounded border shadow-sm"
                              style={{ backgroundColor: sablona.sekundarna }}
                              title="Sekundárna farba"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vlastné farby */}
                <div className="border-t pt-6">
                  <Label className="mb-4 block">Prispôsobenie farieb</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Hlavná farba</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={formData.farba_hlavna}
                          onChange={(e) => setFormData({...formData, farba_hlavna: e.target.value})}
                          className="w-20"
                        />
                        <Input
                          value={formData.farba_hlavna}
                          onChange={(e) => setFormData({...formData, farba_hlavna: e.target.value})}
                          placeholder="#EF4444"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Sekundárna farba</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={formData.farba_sekundarna}
                          onChange={(e) => setFormData({...formData, farba_sekundarna: e.target.value})}
                          className="w-20"
                        />
                        <Input
                          value={formData.farba_sekundarna}
                          onChange={(e) => setFormData({...formData, farba_sekundarna: e.target.value})}
                          placeholder="#dc2626"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="mt-4 border rounded-lg p-6" style={{ 
                    background: `linear-gradient(135deg, ${formData.farba_hlavna} 0%, ${formData.farba_sekundarna} 100%)` 
                  }}>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl max-w-md mx-auto">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">CENOVÁ PONUKA</h3>
                        <p className="text-sm text-gray-600">American Living s.r.o.</p>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500">Náhľad vybraného dizajnu</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TEXTY */}
          <TabsContent value="texty">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Texty v cenovej ponuke</h2>
                  <p className="text-sm text-gray-600">Úvodný, záverečný a ďalšie texty</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label>Úvodný text</Label>
                  <Textarea
                    value={formData.uvodni_text}
                    onChange={(e) => setFormData({...formData, uvodni_text: e.target.value})}
                    placeholder="Ďakujeme za Váš záujem o naše modulárne domy..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Záverečný text</Label>
                  <Textarea
                    value={formData.zavery_text}
                    onChange={(e) => setFormData({...formData, zavery_text: e.target.value})}
                    placeholder="Ponuka je platná 30 dní..."
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Ďalšie texty na konkrétnych pozíciách</Label>
                    <Button onClick={addDalsiText} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Pridať text
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.dalsie_texty.map((text, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex gap-4 mb-3">
                          <Select 
                            value={text.pozicia} 
                            onValueChange={(val) => updateDalsiText(index, 'pozicia', val)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pred_ceny">Pred cenami</SelectItem>
                              <SelectItem value="po_cenach">Po cenách</SelectItem>
                              <SelectItem value="pred_fotky">Pred fotkami</SelectItem>
                              <SelectItem value="po_fotkach">Po fotkách</SelectItem>
                              <SelectItem value="paticka">Päticka</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeDalsiText(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <Textarea
                          value={text.text}
                          onChange={(e) => updateDalsiText(index, 'text', e.target.value)}
                          placeholder="Text na zvolenej pozícii..."
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* FOTKY TICABHOUSE */}
          <TabsContent value="fotky-ticab">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Image className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mapovanie fotiek pre Ticabhouse</h2>
                    <p className="text-sm text-gray-600">Nastavte galérie podľa vybraných dlaždíc</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Nastavte, ktoré galérie sa majú zobraziť v cenovej ponuke na základe vybraných dlaždíc v konfigurátore.
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-1">Automatické pravidlá pre Ticabhouse</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• 2D a 3D pôdorysy sa automaticky pridajú do každej ponuky</li>
                          <li>• Pre každú galériu vyberte dlaždice, ktoré ju aktivujú</li>
                          <li>• Galérie: Exteriér drevo/plech, Exteriér murovka, Interiér drevo, Interiér sadrokartón</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Settings className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-900 mb-2">Univerzálne pravidlá (pre všetkých výrobcov)</h5>
                        <div className="space-y-2">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <Switch
                              checked={formData.automaticke_pravidla?.pouzit_zakladnu_konfiguraciu_ak_nie_je_omietka !== false}
                              onCheckedChange={(checked) => setFormData({
                                ...formData, 
                                automaticke_pravidla: {
                                  ...formData.automaticke_pravidla,
                                  pouzit_zakladnu_konfiguraciu_ak_nie_je_omietka: checked
                                }
                              })}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-green-800">
                              Ak sa nevyberie šúchaná fasáda (biela omietka), použiť fotku domu v základnej konfigurácii ako úvodnú fotku
                            </span>
                          </label>
                          
                          <label className="flex items-start gap-2 cursor-pointer">
                            <Switch
                              checked={formData.automaticke_pravidla?.vzdy_pridat_podorysy !== false}
                              onCheckedChange={(checked) => setFormData({
                                ...formData, 
                                automaticke_pravidla: {
                                  ...formData.automaticke_pravidla,
                                  vzdy_pridat_podorysy: checked
                                }
                              })}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-green-800">
                              2D a 3D pôdorysy sa vždy automaticky pridajú do každej ponuky
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Mapovanie galérií */}
                {[
                  { id: 'exterier_drevo_plech', nazov: 'Exteriér - Drevo/Plech', popis: 'Fasáda s dreveným alebo plechovým obkladom', icon: '🏠', color: 'blue' },
                  { id: 'exterier_murovka', nazov: 'Exteriér - Murovka', popis: 'Fasáda s omietkou/murovkou', icon: '🧱', color: 'orange' },
                  { id: 'interier_drevo', nazov: 'Interiér - Drevo', popis: 'Vnútorný obklad z dreva', icon: '🪵', color: 'amber' },
                  { id: 'interier_sadrokarton', nazov: 'Interiér - Sadrokartón', popis: 'Vnútorný obklad so sadrokartónom', icon: '🏡', color: 'green' },
                ].map((galeria) => {
                  const existujuce = formData.mapovanie_fotiek_ticabhouse?.find(
                    m => m.galeria_typ === galeria.id
                  );
                  const pocetVybranych = existujuce?.dlazdice_ids?.length || 0;

                  const colorClasses = {
                    blue: 'border-blue-300 bg-blue-50/50',
                    orange: 'border-orange-300 bg-orange-50/50',
                    amber: 'border-amber-300 bg-amber-50/50',
                    green: 'border-green-300 bg-green-50/50'
                  };

                  return (
                    <Card key={galeria.id} className={`p-5 border-2 ${colorClasses[galeria.color]} hover:shadow-lg transition-all`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow-md">
                            {galeria.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{galeria.nazov}</h4>
                            <p className="text-xs text-gray-600">{galeria.popis}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {pocetVybranych > 0 ? (
                            <Badge className="bg-green-600 text-white">
                              ✓ {pocetVybranych} {pocetVybranych === 1 ? 'dlaždica' : 'dlaždice'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Nie je mapovaná
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                            <Grid3x3 className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            Vyberte dlaždice, ktoré aktivujú túto galériu:
                          </p>
                        </div>

                        <div className="space-y-3">
                          {ticabhouseSekcie.filter(s => {
                            // Pre exteriér galérie zobrazovať fasádu a strechu
                            if (galeria.id.startsWith('exterier')) {
                              return s.id === 'fasada' || s.id === 'strecha' || s.id === 'dvere_okna';
                            }
                            // Pre interiér galérie zobrazovať interiér a kúpeľňu
                            if (galeria.id.startsWith('interier')) {
                              return s.id === 'interier' || s.id === 'kupelna';
                            }
                            return false;
                          }).map((sekcia) => (
                            <div key={sekcia.id} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">{sekcia.nazov.charAt(0)}</span>
                                </div>
                                <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">{sekcia.nazov}</div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {sekcia.dlazdice.map((dlazdica) => {
                                  const jeVybrane = existujuce?.dlazdice_ids?.includes(dlazdica.id);
                                  
                                  return (
                                    <label 
                                      key={dlazdica.id}
                                      className={`group relative flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                        jeVybrane 
                                          ? 'bg-primary border-primary shadow-md scale-[1.02]' 
                                          : 'bg-white border-gray-300 hover:border-primary/50 hover:shadow-sm'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={jeVybrane}
                                        onChange={(e) => {
                                          const aktualneMapovanie = formData.mapovanie_fotiek_ticabhouse || [];
                                          let galeriaMapping = aktualneMapovanie.find(m => m.galeria_typ === galeria.id);
                                          
                                          if (!galeriaMapping) {
                                            galeriaMapping = {
                                              galeria_typ: galeria.id,
                                              galeria_nazov: galeria.nazov,
                                              dlazdice_ids: []
                                            };
                                          }

                                          if (e.target.checked) {
                                            galeriaMapping.dlazdice_ids = [...(galeriaMapping.dlazdice_ids || []), dlazdica.id];
                                          } else {
                                            galeriaMapping.dlazdice_ids = (galeriaMapping.dlazdice_ids || []).filter(id => id !== dlazdica.id);
                                          }

                                          const noveMapovanie = aktualneMapovanie.filter(m => m.galeria_typ !== galeria.id);
                                          if (galeriaMapping.dlazdice_ids.length > 0) {
                                            noveMapovanie.push(galeriaMapping);
                                          }

                                          setFormData({...formData, mapovanie_fotiek_ticabhouse: noveMapovanie});
                                        }}
                                        className="w-4 h-4 rounded border-gray-400 accent-primary"
                                      />
                                      <span className={`text-xs font-medium ${jeVybrane ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                        {dlazdica.nazov.replace('Izolácia ', '').replace('Fasáda ', '').replace('Obklad ', '')}
                                      </span>
                                      {jeVybrane && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                          <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {pocetVybranych > 0 && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-xs text-green-800 font-medium">
                                Galéria sa zobrazí, ak klient vyberie {pocetVybranych === 1 ? 'túto dlaždicu' : 'jednu z týchto dlaždíc'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* FOTKY PROSTO HOUSE */}
          <TabsContent value="fotky-prosto">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Image className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mapovanie fotiek pre Prosto House</h2>
                    <p className="text-sm text-gray-600">Nastavte fotky podľa vybraných dlaždíc</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Rozkliknite sekcie a priraďte fotky ku konkrétnym dlaždiciam konfiguratora. 
                  Pravidlá platia pre všetky domy výrobcu Prosto House.
                </p>
              </div>

              {/* Prehľad všetkých dlaždíc */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Grid3x3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Všetky dlaždice konfiguratora</h3>
                </div>
                <p className="text-sm text-blue-800 mb-4">
                  Vyberte dlaždice z konfiguratora a priraďte im fotky/galérie, ktoré sa majú zobraziť v cenovej ponuke.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {ticabhouseSekcie.flatMap(s => s.dlazdice).map(d => {
                    const jeMappovana = formData.mapovanie_fotiek_prosto?.some(m => m.dlazdica_id === d.id);
                    return (
                      <div key={d.id} className={`px-2 py-1.5 rounded-md text-xs font-medium border ${
                        jeMappovana 
                          ? 'bg-green-100 border-green-400 text-green-800' 
                          : 'bg-white border-gray-300 text-gray-600'
                      }`}>
                        {jeMappovana && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {d.nazov}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {prostohouseSekcie.map((sekcia) => {
                  const sekciaMapovania = formData.mapovanie_fotiek_prosto.filter(
                    m => m.sekcia_id === sekcia.id
                  );
                  
                  const sectionColors = {
                    fasada: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-300', text: 'text-purple-900' },
                    strecha: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-900' },
                    okna_dvere: { bg: 'from-cyan-50 to-teal-50', border: 'border-cyan-300', text: 'text-cyan-900' },
                    vykurovanie: { bg: 'from-orange-50 to-red-50', border: 'border-orange-300', text: 'text-orange-900' },
                    interier: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-300', text: 'text-amber-900' },
                    kupelna: { bg: 'from-teal-50 to-emerald-50', border: 'border-teal-300', text: 'text-teal-900' }
                  };

                  const colors = sectionColors[sekcia.id] || { bg: 'from-gray-50 to-white', border: 'border-gray-300', text: 'text-gray-900' };
                  
                  return (
                    <Card key={sekcia.id} className={`border-2 ${colors.border} bg-gradient-to-r ${colors.bg} overflow-hidden`}>
                      <button
                        onClick={() => toggleSekcia(sekcia.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md transform transition-transform ${expandedSekcie[sekcia.id] ? 'rotate-90' : ''}`}>
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className={`font-bold text-lg ${colors.text}`}>{sekcia.nazov}</h3>
                            <p className="text-xs text-gray-600">{sekcia.dlazdice.length} dlaždíc celkom</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sekciaMapovania.length > 0 ? (
                            <Badge className="bg-green-600 text-white px-3 py-1">
                              ✓ {sekciaMapovania.length} mapovaných
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 px-3 py-1">
                              Žiadne mapovanie
                            </Badge>
                          )}
                        </div>
                      </button>

                      {expandedSekcie[sekcia.id] && (
                        <div className="border-t bg-white/60 backdrop-blur-sm p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {sekcia.dlazdice.map((dlazdica) => {
                              const existujuceMapovanie = formData.mapovanie_fotiek_prosto.find(
                                m => m.dlazdica_id === dlazdica.id
                              );
                              const mapovaIndex = formData.mapovanie_fotiek_prosto.findIndex(
                                m => m.dlazdica_id === dlazdica.id
                              );

                              return (
                                <div key={dlazdica.id} className={`relative border-2 rounded-xl p-4 transition-all ${
                                  existujuceMapovanie 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg' 
                                    : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
                                }`}>
                                  {existujuceMapovanie && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                  )}

                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className={`font-bold text-base mb-1 ${existujuceMapovanie ? 'text-green-900' : 'text-gray-900'}`}>
                                        {dlazdica.nazov}
                                      </h4>
                                      <p className="text-xs text-gray-500">ID: {dlazdica.id}</p>
                                    </div>
                                    {existujuceMapovanie ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMapovanieFotky("prosto", mapovaIndex)}
                                        className="hover:bg-red-100"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => addMapovanieFotky("prosto", sekcia.id, dlazdica.id, dlazdica.nazov)}
                                        className="bg-primary hover:bg-primary/90"
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Pridať
                                      </Button>
                                    )}
                                  </div>

                                  {existujuceMapovanie && (
                                    <div className="space-y-3 pt-3 border-t border-green-200">
                                      <div>
                                        <Label className="text-xs font-semibold text-green-900 mb-1 block">Typ fotky / Galéria</Label>
                                        <Select
                                          value={existujuceMapovanie.typ_fotky}
                                          onValueChange={(val) => updateMapovanieFotky("prosto", mapovaIndex, 'typ_fotky', val)}
                                        >
                                          <SelectTrigger className="h-9 text-sm bg-white border-green-300">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="titulna">📸 Titulná fotka</SelectItem>
                                            <SelectItem value="zakladna_konfiguracia">🏠 Základná konfigurácia</SelectItem>
                                            <SelectItem value="exterier_drevo_plech">🏠 Galéria: Exteriér drevo/plech</SelectItem>
                                            <SelectItem value="exterier_murovka">🧱 Galéria: Exteriér murovka</SelectItem>
                                            <SelectItem value="interier_drevo">🪵 Galéria: Interiér drevo</SelectItem>
                                            <SelectItem value="interier_sadrokarton">🏡 Galéria: Interiér sadrokartón</SelectItem>
                                            <SelectItem value="podorysy">📐 Pôdorysy</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-xs font-semibold text-green-900 mb-1 block">Popis</Label>
                                        <Input
                                          value={existujuceMapovanie.popis || ''}
                                          onChange={(e) => updateMapovanieFotky("prosto", mapovaIndex, 'popis', e.target.value)}
                                          placeholder="Napr: Zobrazí dom s touto fasádou"
                                          className="h-9 text-sm bg-white border-green-300"
                                        />
                                      </div>
                                      <div className="p-2 bg-green-100 rounded-md">
                                        <p className="text-xs text-green-800 flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          V ponuke: {existujuceMapovanie.typ_fotky.replace('_', ' ')}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Modal - Náhľad emailu */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Náhľad emailu cenovej ponuky
              </DialogTitle>
            </DialogHeader>
          
            {/* Email preview header */}
            <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Email pre klienta</p>
                  <p className="text-xs text-white/80">Predmet: Cenová ponuka CP-2025-001 - WASHINGTON - American Living</p>
                </div>
              </div>
            </div>

            {/* Iframe s HTML emailom */}
            <div className="border-4 border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xl">
              <iframe 
                srcDoc={`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 700px; margin: 20px auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { 
      background: linear-gradient(135deg, ${formData.farba_hlavna || '#EF4444'} 0%, ${formData.farba_sekundarna || '#dc2626'} 100%); 
      padding: 30px; 
      text-align: center; 
      color: white; 
    }
    .logo { max-width: 200px; margin-bottom: 15px; background: white; padding: 10px; border-radius: 8px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { 
      font-size: 18px; 
      font-weight: bold; 
      color: ${formData.farba_hlavna || '#EF4444'}; 
      margin-bottom: 15px; 
      border-bottom: 2px solid ${formData.farba_hlavna || '#EF4444'}; 
      padding-bottom: 8px; 
    }
    .client-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .house-info { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .house-img { max-width: 250px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    th { 
      background: ${formData.farba_sekundarna || '#dc2626'}; 
      font-weight: bold; 
      color: white; 
    }
    .price { color: #059669; font-weight: bold; }
    .strikethrough { text-decoration: line-through; color: #9ca3af; background: #fef2f2; }
    .total { 
      background: linear-gradient(135deg, ${formData.farba_hlavna || '#EF4444'} 0%, ${formData.farba_sekundarna || '#dc2626'} 100%); 
      color: white;
      font-size: 18px; 
      font-weight: bold; 
    }
    .footer { background: #1f2937; color: white; padding: 25px; text-align: center; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
    .gallery img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; }
    .services-box { 
      background: #ecfdf5; 
      border: 2px solid #10b981; 
      border-radius: 8px; 
      padding: 15px; 
      margin: 15px 0; 
    }
    .badge { 
      display: inline-block; 
      background: #10b981; 
      color: white; 
      padding: 6px 12px; 
      border-radius: 20px; 
      font-size: 12px; 
      font-weight: bold; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${formData.logo_url ? `<img src="${formData.logo_url}" alt="Logo" class="logo">` : '<h1 style="margin: 0;">American Living</h1>'}
      <h1 style="margin: 10px 0; font-size: 28px;">CENOVÁ PONUKA</h1>
      <p style="margin: 5px 0; opacity: 0.95;">Číslo ponuky: CP-2025-001</p>
      <p style="margin: 5px 0; opacity: 0.9; font-size: 14px;">Dátum: ${new Date().toLocaleDateString('sk-SK')}</p>
    </div>

    <div class="content">
      ${formData.uvodni_text ? `
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
        <p style="margin: 0; color: #0c4a6e; line-height: 1.6;">${formData.uvodni_text}</p>
      </div>
      ` : ''}

      <div class="client-info">
        <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Informácie o klientovi</h3>
        <p style="margin: 5px 0;"><strong>Meno:</strong> Ján Novák</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> jan.novak@email.com</p>
        <p style="margin: 5px 0;"><strong>Telefón:</strong> +421 900 123 456</p>
        <p style="margin: 5px 0;"><strong>Lokalita:</strong> Bratislava</p>
      </div>

      <div class="section">
        <div class="section-title">Vybraný model domu</div>
        <div class="house-info">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80" alt="Dom" class="house-img">
          <div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 22px;">WASHINGTON</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Výrobca:</strong> Ticab house</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Typ:</strong> Modulárny dom</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Zastavana plocha:</strong> 72 m²</p>
            <span class="badge">✓ Celoročný dom</span>
          </div>
        </div>
      </div>

      <div class="services-box">
        <h3 style="margin-top: 0; color: #065f46; font-size: 16px;">📋 Dodatočné služby</h3>
        <p style="margin: 8px 0; color: #047857;">✓ Predaj predošlej nehnuteľnosti</p>
        <p style="margin: 8px 0; color: #047857;">✓ Chcem pozemok pod svoj dom</p>
        <p style="margin: 8px 0; color: #047857;">✓ Finančné služby - úvery/poistky</p>
      </div>

      <div class="section">
        <div class="section-title">Cenová kalkulácia</div>
        <table>
          <thead>
            <tr>
              <th>Položka</th>
              <th style="text-align: right;">Cena s DPH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Základná cena domu</td>
              <td class="price" style="text-align: right;">72 078,00 €</td>
            </tr>
            <tr>
              <td>Montáž holodomu</td>
              <td class="price" style="text-align: right;">9 225,00 €</td>
            </tr>
            <tr>
              <td>Izolácia 250mm (Premium)</td>
              <td class="price" style="text-align: right;">5 400,00 €</td>
            </tr>
            <tr>
              <td>Tepelné čerpadlo (5 ks)</td>
              <td class="price" style="text-align: right;">3 321,00 €</td>
            </tr>
            <tr>
              <td>Rekuperácia (3 ks)</td>
              <td class="price" style="text-align: right;">1 600,00 €</td>
            </tr>
            <tr>
              <td>Fasáda - šúchaná omietka</td>
              <td class="price" style="text-align: right;">6 371,00 €</td>
            </tr>
            <tr>
              <td>Interiér - sadrokartón</td>
              <td class="price" style="text-align: right;">9 430,00 €</td>
            </tr>
            <tr>
              <td>Základy - pásové betónové</td>
              <td class="price" style="text-align: right;">11 823,00 €</td>
            </tr>
            <tr>
              <td>Inžiniering</td>
              <td class="price" style="text-align: right;">2 592,00 €</td>
            </tr>
            <tr>
              <td>Projekt A0 + certifikácia</td>
              <td class="price" style="text-align: right;">3 500,00 €</td>
            </tr>
            ${formData.zobrazovat_preciarknute ? `
            <tr class="strikethrough">
              <td>Podlahové kúrenie</td>
              <td style="text-align: right;">0,00 €</td>
            </tr>
            <tr class="strikethrough">
              <td>Elektroinštalácia komplet</td>
              <td style="text-align: right;">0,00 €</td>
            </tr>
            ` : ''}
            <tr class="total">
              <td style="padding: 16px 12px;"><strong>CELKOVÁ CENA s DPH</strong></td>
              <td style="text-align: right; padding: 16px 12px;"><strong>125 340,00 €</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Fotogaléria</div>
        <div class="gallery">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" alt="Exterier 1">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" alt="Exterier 2">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80" alt="Exterier 3">
          <img src="https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&q=80" alt="Interier 1">
          <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&q=80" alt="Interier 2">
          <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80" alt="Podorys">
        </div>
      </div>

      ${formData.zavery_text ? `
      <div style="background: ${formData.farba_hlavna || '#EF4444'}10; padding: 15px; border-radius: 8px; border-left: 4px solid ${formData.farba_hlavna || '#EF4444'}; margin: 20px 0;">
        <p style="margin: 0; color: #374151; line-height: 1.6;">${formData.zavery_text}</p>
      </div>
      ` : ''}

      <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Dôležité:</strong> Táto ponuka je orientačná a finálna cena bude upresnená po obhliadke pozemku a konzultácii.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${formData.nazov_spolocnosti || 'American Living'}</p>
      <p style="margin: 8px 0;">📞 Telefón: <a href="tel:${formData.telefon}">${formData.telefon}</a></p>
      <p style="margin: 8px 0;">✉️ Email: <a href="mailto:${formData.email}">${formData.email}</a></p>
      <p style="margin: 8px 0;">🌐 Web: <a href="https://${formData.web}">${formData.web}</a></p>
      ${(formData.ico || formData.dic || formData.ic_dph) ? `
      <p style="margin: 15px 0 5px 0; font-size: 12px; color: #9ca3af;">
        ${formData.ico ? `IČO: ${formData.ico}` : ''} 
        ${formData.dic ? ` | DIČ: ${formData.dic}` : ''} 
        ${formData.ic_dph ? ` | IČ DPH: ${formData.ic_dph}` : ''}
      </p>
      ` : ''}
      <p style="margin: 20px 0 5px 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} American Living. Všetky práva vyhradené.</p>
    </div>
  </div>
</body>
</html>
                `}
                className="w-full"
                style={{ height: '600px', border: 'none' }}
                title="Email Preview"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}