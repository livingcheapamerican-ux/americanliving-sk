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
import { Upload, Save, Eye, Plus, Trash2, Palette, FileText, Image, Settings, Grid3x3 } from "lucide-react";

export default function AdminGeneratorCenovychPonuk() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("zakladne");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: nastavenia = [] } = useQuery({
    queryKey: ['nastavenia-cenovej-ponuky'],
    queryFn: () => base44.entities.NastavenieCenovejPonuky.list()
  });

  const aktivneNastavenie = nastavenia.find(n => n.aktivne) || nastavenia[0];

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

  // Definície dlaždíc konfigurátorov
  const ticabhouseDlazdice = [
    { id: "izolacia_stien", nazov: "Izolácia stien", kategoria: "Izolácia" },
    { id: "izolacia_podlahy", nazov: "Izolácia podlahy", kategoria: "Izolácia" },
    { id: "izolacia_stropu", nazov: "Izolácia stropu", kategoria: "Izolácia" },
    { id: "tepelne_cerpadlo", nazov: "Tepelné čerpadlo", kategoria: "Vykurovanie" },
    { id: "rekuperacia", nazov: "Rekuperácia", kategoria: "Ventilácia" },
    { id: "fasada", nazov: "Fasáda", kategoria: "Fasáda" },
    { id: "obklad_interier", nazov: "Obklad interiéru", kategoria: "Interiér" },
    { id: "dvere", nazov: "Dvere", kategoria: "Výbava" },
    { id: "kupelna", nazov: "Kúpeľňa", kategoria: "Výbava" },
  ];

  const prostohouseDlazdice = [
    { id: "fasada", nazov: "Fasáda", kategoria: "Fasáda" },
    { id: "strecha", nazov: "Strecha", kategoria: "Strecha" },
    { id: "okna", nazov: "Okná", kategoria: "Výbava" },
    { id: "vykurovanie", nazov: "Vykurovanie", kategoria: "Vykurovanie" },
    { id: "kupelna", nazov: "Kúpeľňa", kategoria: "Výbava" },
  ];

  const addMapovanieFotky = (vyrobca) => {
    const field = vyrobca === "ticabhouse" ? "mapovanie_fotiek_ticabhouse" : "mapovanie_fotiek_prosto";
    setFormData({
      ...formData,
      [field]: [...formData[field], { dlazdica_id: "", nazov_dlazdice: "", typ_fotky: "titulna", popis: "" }]
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
    
    // Auto-fill nazov_dlazdice
    if (field === "dlazdica_id") {
      const dlazdice = vyrobca === "ticabhouse" ? ticabhouseDlazdice : prostohouseDlazdice;
      const dlazdica = dlazdice.find(d => d.id === value);
      if (dlazdica) {
        updated[index].nazov_dlazdice = dlazdica.nazov;
      }
    }
    
    setFormData({ ...formData, [fieldName]: updated });
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
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary">
            <Save className="w-4 h-4 mr-2" />
            Uložiť nastavenie
          </Button>
        </div>

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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Mapovanie fotiek pre Ticabhouse</h2>
                  <p className="text-sm text-gray-600">Definujte ktoré fotky sa zobrazia pri výbere konkrétnych dlaždíc konfiguratora</p>
                </div>
                <Button onClick={() => addMapovanieFotky("ticabhouse")} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Pridať mapovanie
                </Button>
              </div>

              <div className="space-y-4">
                {formData.mapovanie_fotiek_ticabhouse.map((mapovanie, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Label>Dlazdica konfiguratora</Label>
                        <Select 
                          value={mapovanie.dlazdica_id}
                          onValueChange={(val) => updateMapovanieFotky("ticabhouse", index, 'dlazdica_id', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte dlazdicu" />
                          </SelectTrigger>
                          <SelectContent>
                            {ticabhouseDlazdice.map(dlazdica => (
                              <SelectItem key={dlazdica.id} value={dlazdica.id}>
                                {dlazdica.nazov} ({dlazdica.kategoria})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label>Typ fotky</Label>
                        <Select 
                          value={mapovanie.typ_fotky}
                          onValueChange={(val) => updateMapovanieFotky("ticabhouse", index, 'typ_fotky', val)}
                        >
                          <SelectTrigger>
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

                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMapovanieFotky("ticabhouse", index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>

                    <div>
                      <Label>Popis (voliteľný)</Label>
                      <Input
                        value={mapovanie.popis}
                        onChange={(e) => updateMapovanieFotky("ticabhouse", index, 'popis', e.target.value)}
                        placeholder="Napr: Zobrazí fotky s dreveným obkladom interiéru"
                      />
                    </div>
                  </div>
                ))}

                {formData.mapovanie_fotiek_ticabhouse.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Grid3x3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Zatiaľ žiadne mapovanie fotiek</p>
                    <p className="text-sm">Pridajte mapovanie na automatické zobrazenie fotiek</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* FOTKY PROSTO HOUSE */}
          <TabsContent value="fotky-prosto">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Mapovanie fotiek pre Prosto House</h2>
                  <p className="text-sm text-gray-600">Definujte ktoré fotky sa zobrazia pri výbere konkrétnych dlaždíc konfiguratora</p>
                </div>
                <Button onClick={() => addMapovanieFotky("prosto")} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Pridať mapovanie
                </Button>
              </div>

              <div className="space-y-4">
                {formData.mapovanie_fotiek_prosto.map((mapovanie, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Label>Dlazdica konfiguratora</Label>
                        <Select 
                          value={mapovanie.dlazdica_id}
                          onValueChange={(val) => updateMapovanieFotky("prosto", index, 'dlazdica_id', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte dlazdicu" />
                          </SelectTrigger>
                          <SelectContent>
                            {prostohouseDlazdice.map(dlazdica => (
                              <SelectItem key={dlazdica.id} value={dlazdica.id}>
                                {dlazdica.nazov} ({dlazdica.kategoria})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label>Typ fotky</Label>
                        <Select 
                          value={mapovanie.typ_fotky}
                          onValueChange={(val) => updateMapovanieFotky("prosto", index, 'typ_fotky', val)}
                        >
                          <SelectTrigger>
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

                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMapovanieFotky("prosto", index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>

                    <div>
                      <Label>Popis (voliteľný)</Label>
                      <Input
                        value={mapovanie.popis}
                        onChange={(e) => updateMapovanieFotky("prosto", index, 'popis', e.target.value)}
                        placeholder="Napr: Zobrazí fotky s vybratou fasádou"
                      />
                    </div>
                  </div>
                ))}

                {formData.mapovanie_fotiek_prosto.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Grid3x3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Zatiaľ žiadne mapovanie fotiek</p>
                    <p className="text-sm">Pridajte mapovanie na automatické zobrazenie fotiek</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}