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
import { Upload, Save, Eye, Plus, Trash2, Palette, FileText, Image, Settings, Grid3x3, ArrowRight } from "lucide-react";

export default function AdminGeneratorCenovychPonuk() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("zakladne");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedSablona, setSelectedSablona] = useState(null);
  const [expandedSekcie, setExpandedSekcie] = useState({});
  
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
      nazov: "Interiér",
      dlazdice: [
        { id: "podlahy_drevo", nazov: "Drevené podlahy" },
        { id: "podlahy_laminat", nazov: "Laminát" },
        { id: "obklady_kupelna", nazov: "Obklady kúpeľňa" },
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

  const createNovaSablona = () => {
    const novaSablona = {
      nazov: "Nová šablóna",
      vyrobca_filter: "",
      aktivne: false,
      ...formData
    };
    saveMutation.mutate(novaSablona);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generátor cenových ponúk</h1>
            <p className="text-gray-600">Nastavte dizajn, obsah a mapovanie fotiek pre cenové ponuky</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={createNovaSablona} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nová šablóna
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary">
              <Save className="w-4 h-4 mr-2" />
              Uložiť nastavenie
            </Button>
          </div>
        </div>

        {/* Prehľad šablón */}
        {nastavenia.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Prednastavené šablóny</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {nastavenia.map((sablona) => (
                <div
                  key={sablona.id}
                  onClick={() => setSelectedSablona(sablona.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSablona === sablona.id 
                      ? 'border-primary ring-2 ring-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{sablona.nazov}</h3>
                    {sablona.aktivne && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Aktívne
                      </span>
                    )}
                  </div>
                  {sablona.vyrobca_filter && (
                    <p className="text-sm text-gray-600 mb-2">
                      Pre: <span className="font-semibold">{sablona.vyrobca_filter}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: sablona.farba_hlavna }}
                    />
                    <span>{sablona.sablona_dizajnu}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="zakladne">
              <Settings className="w-4 h-4 mr-2" />
              Základné
            </TabsTrigger>
            <TabsTrigger value="dizajn">
              <Palette className="w-4 h-4 mr-2" />
              Dizajn
            </TabsTrigger>
            <TabsTrigger value="texty">
              <FileText className="w-4 h-4 mr-2" />
              Texty
            </TabsTrigger>
            <TabsTrigger value="fotky-ticab">
              <Image className="w-4 h-4 mr-2" />
              Fotky Ticabhouse
            </TabsTrigger>
            <TabsTrigger value="fotky-prosto">
              <Image className="w-4 h-4 mr-2" />
              Fotky Prosto
            </TabsTrigger>
          </TabsList>

          {/* ZÁKLADNÉ NASTAVENIA */}
          <TabsContent value="zakladne">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Základné informácie</h2>
              
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
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Dizajn cenovej ponuky</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Šablóna dizajnu</Label>
                  <Select value={formData.sablona_dizajnu} onValueChange={(val) => setFormData({...formData, sablona_dizajnu: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Moderný dizajn</SelectItem>
                      <SelectItem value="classic">Klasický dizajn</SelectItem>
                      <SelectItem value="minimal">Minimalistický dizajn</SelectItem>
                      <SelectItem value="premium">Premium dizajn</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">Vyberte vizuálny štýl cenovej ponuky</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Hlavná farba</Label>
                    <div className="flex gap-2">
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
                    <Label>Sekundárna farba</Label>
                    <div className="flex gap-2">
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

                {/* Náhľad farieb */}
                <div className="border rounded-lg p-4">
                  <Label className="mb-2 block">Náhľad farieb</Label>
                  <div className="flex gap-4">
                    <div 
                      className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.farba_hlavna }}
                    >
                      Hlavná
                    </div>
                    <div 
                      className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.farba_sekundarna }}
                    >
                      Sekundárna
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TEXTY */}
          <TabsContent value="texty">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Texty v cenovej ponuke</h2>
              
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
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Mapovanie fotiek pre Ticabhouse</h2>
                <p className="text-sm text-gray-600">
                  Rozkliknite sekcie a priraďte fotky ku konkrétnym dlaždiciam konfiguratora. 
                  Pravidlá platia pre všetky domy výrobcu Ticabhouse.
                </p>
              </div>

              <div className="space-y-2">
                {ticabhouseSekcie.map((sekcia) => {
                  const sekciaMapovania = formData.mapovanie_fotiek_ticabhouse.filter(
                    m => m.sekcia_id === sekcia.id
                  );
                  
                  return (
                    <div key={sekcia.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleSekcia(sekcia.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`transform transition-transform ${expandedSekcie[sekcia.id] ? 'rotate-90' : ''}`}>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-gray-900">{sekcia.nazov}</h3>
                          <span className="text-sm text-gray-500">
                            ({sekcia.dlazdice.length} dlaždíc)
                          </span>
                        </div>
                        {sekciaMapovania.length > 0 && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {sekciaMapovania.length} mapovaných
                          </span>
                        )}
                      </button>

                      {expandedSekcie[sekcia.id] && (
                        <div className="border-t p-4 bg-gray-50 space-y-3">
                          {sekcia.dlazdice.map((dlazdica) => {
                            const existujuceMapovanie = formData.mapovanie_fotiek_ticabhouse.find(
                              m => m.dlazdica_id === dlazdica.id
                            );
                            const mapovaIndex = formData.mapovanie_fotiek_ticabhouse.findIndex(
                              m => m.dlazdica_id === dlazdica.id
                            );

                            return (
                              <div key={dlazdica.id} className="bg-white border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{dlazdica.nazov}</h4>
                                    <p className="text-xs text-gray-500">ID: {dlazdica.id}</p>
                                  </div>
                                  {existujuceMapovanie ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMapovanieFotky("ticabhouse", mapovaIndex)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addMapovanieFotky("ticabhouse", sekcia.id, dlazdica.id, dlazdica.nazov)}
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Pridať fotky
                                    </Button>
                                  )}
                                </div>

                                {existujuceMapovanie && (
                                  <div className="space-y-3 pt-3 border-t">
                                    <div>
                                      <Label className="text-xs">Typ fotky</Label>
                                      <Select
                                        value={existujuceMapovanie.typ_fotky}
                                        onValueChange={(val) => updateMapovanieFotky("ticabhouse", mapovaIndex, 'typ_fotky', val)}
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="titulna">Titulná fotka</SelectItem>
                                          <SelectItem value="zakladna_konfiguracia">Základná konfigurácia</SelectItem>
                                          <SelectItem value="interier_drevo">Interiér drevo</SelectItem>
                                          <SelectItem value="interier_sadrokarton">Interiér sadrokartón</SelectItem>
                                          <SelectItem value="galeria_exterier">Galéria exteriér</SelectItem>
                                          <SelectItem value="galeria_interier">Galéria interiér</SelectItem>
                                          <SelectItem value="podorysy">Pôdorysy</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Popis (voliteľný)</Label>
                                      <Input
                                        value={existujuceMapovanie.popis || ''}
                                        onChange={(e) => updateMapovanieFotky("ticabhouse", mapovaIndex, 'popis', e.target.value)}
                                        placeholder="Napr: Zobrazí interiér s týmto obkladom"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* FOTKY PROSTO HOUSE */}
          <TabsContent value="fotky-prosto">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Mapovanie fotiek pre Prosto House</h2>
                <p className="text-sm text-gray-600">
                  Rozkliknite sekcie a priraďte fotky ku konkrétnym dlaždiciam konfiguratora. 
                  Pravidlá platia pre všetky domy výrobcu Prosto House.
                </p>
              </div>

              <div className="space-y-2">
                {prostohouseSekcie.map((sekcia) => {
                  const sekciaMapovania = formData.mapovanie_fotiek_prosto.filter(
                    m => m.sekcia_id === sekcia.id
                  );
                  
                  return (
                    <div key={sekcia.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleSekcia(sekcia.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`transform transition-transform ${expandedSekcie[sekcia.id] ? 'rotate-90' : ''}`}>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-gray-900">{sekcia.nazov}</h3>
                          <span className="text-sm text-gray-500">
                            ({sekcia.dlazdice.length} dlaždíc)
                          </span>
                        </div>
                        {sekciaMapovania.length > 0 && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {sekciaMapovania.length} mapovaných
                          </span>
                        )}
                      </button>

                      {expandedSekcie[sekcia.id] && (
                        <div className="border-t p-4 bg-gray-50 space-y-3">
                          {sekcia.dlazdice.map((dlazdica) => {
                            const existujuceMapovanie = formData.mapovanie_fotiek_prosto.find(
                              m => m.dlazdica_id === dlazdica.id
                            );
                            const mapovaIndex = formData.mapovanie_fotiek_prosto.findIndex(
                              m => m.dlazdica_id === dlazdica.id
                            );

                            return (
                              <div key={dlazdica.id} className="bg-white border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{dlazdica.nazov}</h4>
                                    <p className="text-xs text-gray-500">ID: {dlazdica.id}</p>
                                  </div>
                                  {existujuceMapovanie ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMapovanieFotky("prosto", mapovaIndex)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addMapovanieFotky("prosto", sekcia.id, dlazdica.id, dlazdica.nazov)}
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Pridať fotky
                                    </Button>
                                  )}
                                </div>

                                {existujuceMapovanie && (
                                  <div className="space-y-3 pt-3 border-t">
                                    <div>
                                      <Label className="text-xs">Typ fotky</Label>
                                      <Select
                                        value={existujuceMapovanie.typ_fotky}
                                        onValueChange={(val) => updateMapovanieFotky("prosto", mapovaIndex, 'typ_fotky', val)}
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="titulna">Titulná fotka</SelectItem>
                                          <SelectItem value="zakladna_konfiguracia">Základná konfigurácia</SelectItem>
                                          <SelectItem value="interier_drevo">Interiér drevo</SelectItem>
                                          <SelectItem value="interier_sadrokarton">Interiér sadrokartón</SelectItem>
                                          <SelectItem value="galeria_exterier">Galéria exteriér</SelectItem>
                                          <SelectItem value="galeria_interier">Galéria interiér</SelectItem>
                                          <SelectItem value="podorysy">Pôdorysy</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Popis (voliteľný)</Label>
                                      <Input
                                        value={existujuceMapovanie.popis || ''}
                                        onChange={(e) => updateMapovanieFotky("prosto", mapovaIndex, 'popis', e.target.value)}
                                        placeholder="Napr: Zobrazí dom s touto fasádou"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}