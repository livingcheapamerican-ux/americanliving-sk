import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  FolderOpen, 
  Loader2,
  X,
  Save,
  Home,
  Layers,
  Grid3x3,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GALERIA_TYPY = [
  { value: "exterier_murovka", label: "Exteriér - Murovka (biela omietka)", icon: "🏡" },
  { value: "exterier_drevo_plech", label: "Exteriér - Drevo/Plech", icon: "🏠" },
  { value: "interier_sadrokarton", label: "Interiér - Sadrokartón", icon: "🏢" },
  { value: "interier_drevo", label: "Interiér - Drevený obklad", icon: "🪵" },
];

export default function DomGalerieManager({ dom, onUpdate }) {
  const [galerie, setGalerie] = useState(dom.galerie || []);
  const [podorys2D, setPodorys2D] = useState(dom.podorys_2d || "");
  const [podorys3D, setPodorys3D] = useState(dom.podorys_3d || "");
  const [zakladnaKonfiguracia, setZakladnaKonfiguracia] = useState(dom.zakladna_konfiguracia_obrazok || "");
  const [hlavnyObrazok, setHlavnyObrazok] = useState(dom.hlavny_obrazok || "");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("galerie");
  
  const isTicabhouse = dom.vyrobca === "Ticab house";
  const isProstoHouse = dom.vyrobca === "Prosto House";
  const showZakladnaKonfiguracia = isTicabhouse || isProstoHouse;

  const queryClient = useQueryClient();

  const updateDomMutation = useMutation({
    mutationFn: (data) => base44.entities.Dom.update(dom.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dom-detail'] });
      toast.success("Zmeny boli uložené");
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      toast.error(`Chyba pri ukladaní: ${error.message}`);
    }
  });

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = {
      galerie: galerie,
    };
    // Only include fields if they have valid URLs, otherwise don't update them
    if (podorys2D) dataToSave.podorys_2d = podorys2D;
    if (podorys3D) dataToSave.podorys_3d = podorys3D;
    if (zakladnaKonfiguracia) dataToSave.zakladna_konfiguracia_obrazok = zakladnaKonfiguracia;
    if (hlavnyObrazok) dataToSave.hlavny_obrazok = hlavnyObrazok;
    
    await updateDomMutation.mutateAsync(dataToSave);
    setSaving(false);
  };

  const handleUploadToLibrary = async (files) => {
    setUploading(true);
    const newPhotos = [];

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        newPhotos.push({
          url: response.file_url,
          name: file.name
        });
      } catch (error) {
        toast.error(`Chyba pri nahrávaní ${file.name}`);
      }
    }

    if (newPhotos.length > 0) {
      setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
      toast.success(`Nahratých ${newPhotos.length} fotiek do knižnice`);
    }
    setUploading(false);
  };

  const setAsHlavnyObrazok = (url) => {
    setHlavnyObrazok(url);
    toast.success("Titulná fotka nastavená");
  };

  const addGaleria = () => {
    setGalerie([...galerie, {
      nazov: "Nová galéria",
      typ: "exterier_murovka",
      fotky: []
    }]);
  };

  const removeGaleria = (index) => {
    if (window.confirm("Naozaj chcete vymazať túto galériu?")) {
      setGalerie(galerie.filter((_, i) => i !== index));
    }
  };

  const updateGaleria = (index, field, value) => {
    const updated = [...galerie];
    updated[index] = { ...updated[index], [field]: value };
    setGalerie(updated);
  };

  const handleUploadPhotos = async (index, files) => {
    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(response.file_url);
      } catch (error) {
        toast.error(`Chyba pri nahrávaní ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      const updated = [...galerie];
      updated[index].fotky = [...(updated[index].fotky || []), ...uploadedUrls];
      setGalerie(updated);
      toast.success(`Nahratých ${uploadedUrls.length} fotiek`);
    }
    setUploading(false);
  };

  const removePhotoFromGaleria = (galeriaIndex, photoIndex) => {
    const updated = [...galerie];
    updated[galeriaIndex].fotky = updated[galeriaIndex].fotky.filter((_, i) => i !== photoIndex);
    setGalerie(updated);
  };

  const handleUploadPodorys = async (type, file) => {
    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      if (type === "2d") {
        setPodorys2D(response.file_url);
      } else {
        setPodorys3D(response.file_url);
      }
      toast.success(`${type.toUpperCase()} pôdorys nahratý`);
    } catch (error) {
      toast.error(`Chyba pri nahrávaní: ${error.message}`);
    }
    setUploading(false);
  };

  const getTypLabel = (typ) => {
    return GALERIA_TYPY.find(t => t.value === typ)?.label || typ;
  };

  const getTypIcon = (typ) => {
    return GALERIA_TYPY.find(t => t.value === typ)?.icon || "📁";
  };

  return (
    <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Správa galérií</h2>
            <p className="text-sm text-gray-500">Pridajte galérie s rôznymi typmi fotiek</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Uložiť zmeny
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full mb-6 ${isTicabhouse ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="titulna" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Titulná fotka
          </TabsTrigger>
          <TabsTrigger value="galerie" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Galérie ({galerie.length})
          </TabsTrigger>
          <TabsTrigger value="podorysy" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Pôdorysy
          </TabsTrigger>
          {isTicabhouse && (
            <TabsTrigger value="zakladna" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Zákl. konfigurácia
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="titulna" className="space-y-4">
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Titulná fotka v katalógu</h3>
                <p className="text-xs text-gray-500">Táto fotka sa zobrazuje v zozname domov</p>
              </div>
            </div>
            
            {/* Aktuálna titulná fotka */}
            {hlavnyObrazok ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Aktuálna titulná fotka:</p>
                <div className="relative w-full max-w-md">
                  <img src={hlavnyObrazok} alt="Titulná fotka" className="w-full h-48 object-cover rounded-lg border-2 border-green-500" />
                  <Badge className="absolute top-2 left-2 bg-green-600">Aktívna</Badge>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">Žiadna titulná fotka nie je nastavená</p>
              </div>
            )}

            {/* Upload do knižnice */}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Nahrať fotky do knižnice:</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUploadToLibrary(Array.from(e.target.files))}
                className="hidden"
                id="library-upload"
                disabled={uploading}
              />
              <label htmlFor="library-upload">
                <Button type="button" variant="outline" asChild disabled={uploading} className="cursor-pointer">
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nahrať fotky
                  </span>
                </Button>
              </label>
            </div>

            {/* Knižnica fotiek */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Knižnica fotiek ({uploadedPhotos.length}):</p>
                <p className="text-xs text-gray-500 mb-3">Kliknite na fotku pre nastavenie ako titulnú</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {uploadedPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        hlavnyObrazok === photo.url ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => setAsHlavnyObrazok(photo.url)}
                    >
                      <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover" />
                      {hlavnyObrazok === photo.url && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existujúce fotky z galérie */}
            {dom.galeria && dom.galeria.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Fotky z galérie ({dom.galeria.length}):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {dom.galeria.map((foto, index) => (
                    <div 
                      key={index} 
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        hlavnyObrazok === foto ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => setAsHlavnyObrazok(foto)}
                    >
                      <img src={foto} alt={`Galéria ${index + 1}`} className="w-full h-24 object-cover" />
                      {hlavnyObrazok === foto && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="galerie" className="space-y-4">
          {/* Pridať novú galériu */}
          <Button onClick={addGaleria} variant="outline" className="w-full border-dashed border-2">
            <Plus className="w-4 h-4 mr-2" />
            Pridať novú galériu
          </Button>

          {/* Zoznam galérií */}
          {galerie.map((galeria, index) => (
            <Card key={index} className="p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Názov galérie</Label>
                    <Input
                      value={galeria.nazov}
                      onChange={(e) => updateGaleria(index, "nazov", e.target.value)}
                      placeholder="Názov galérie"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Typ galérie</Label>
                    <Select
                      value={galeria.typ}
                      onValueChange={(value) => updateGaleria(index, "typ", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GALERIA_TYPY.map((typ) => (
                          <SelectItem key={typ.value} value={typ.value}>
                            {typ.icon} {typ.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGaleria(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Info o type */}
              <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">{getTypIcon(galeria.typ)}</span> {getTypLabel(galeria.typ)}
                </p>
              </div>

              {/* Upload fotiek */}
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleUploadPhotos(index, Array.from(e.target.files))}
                  className="hidden"
                  id={`galeria-upload-${index}`}
                  disabled={uploading}
                />
                <label htmlFor={`galeria-upload-${index}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={uploading}
                    className="cursor-pointer"
                  >
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Nahrať fotky
                    </span>
                  </Button>
                </label>
                <span className="ml-2 text-xs text-gray-500">
                  {galeria.fotky?.length || 0} fotiek
                </span>
              </div>

              {/* Náhľady fotiek */}
              {galeria.fotky && galeria.fotky.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {galeria.fotky.map((foto, fotoIndex) => (
                    <div key={fotoIndex} className="relative group aspect-square">
                      <img
                        src={foto}
                        alt={`Foto ${fotoIndex + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhotoFromGaleria(index, fotoIndex)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(!galeria.fotky || galeria.fotky.length === 0) && (
                <div className="text-center py-6 text-gray-400 border-2 border-dashed rounded-lg">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Zatiaľ žiadne fotky</p>
                </div>
              )}
            </Card>
          ))}

          {galerie.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FolderOpen className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Žiadne galérie</p>
              <p className="text-sm">Kliknite na "Pridať novú galériu" pre začatie</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="podorysy" className="space-y-6">
          {/* 2D Pôdorys */}
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">2D Pôdorys</h3>
                <p className="text-xs text-gray-500">Plochý technický výkres pôdorysu</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleUploadPodorys("2d", e.target.files[0])}
                className="hidden"
                id="podorys-2d-upload"
                disabled={uploading}
              />
              <label htmlFor="podorys-2d-upload">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nahrať
                  </span>
                </Button>
              </label>
            </div>
            {podorys2D ? (
              <div className="relative">
                <img src={podorys2D} alt="2D Pôdorys" className="w-full h-auto rounded-lg border" />
                <button
                  onClick={() => setPodorys2D("")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                <Grid3x3 className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">2D pôdorys nie je nahratý</p>
              </div>
            )}
          </Card>

          {/* 3D Pôdorys */}
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">3D Pôdorys</h3>
                <p className="text-xs text-gray-500">3D vizualizácia alebo axonometrický pohľad</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleUploadPodorys("3d", e.target.files[0])}
                className="hidden"
                id="podorys-3d-upload"
                disabled={uploading}
              />
              <label htmlFor="podorys-3d-upload">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Nahrať
                  </span>
                </Button>
              </label>
            </div>
            {podorys3D ? (
              <div className="relative">
                <img src={podorys3D} alt="3D Pôdorys" className="w-full h-auto rounded-lg border" />
                <button
                  onClick={() => setPodorys3D("")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                <Home className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">3D pôdorys nie je nahratý</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Základná konfigurácia - len pre Ticab house */}
        {isTicabhouse && (
          <TabsContent value="zakladna" className="space-y-4">
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Ako vyzerá dom v základnej konfigurácii</h3>
                  <p className="text-xs text-gray-500">Fotka zobrazujúca dom v štandardnej výbave bez príplatkov</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setUploading(true);
                      base44.integrations.Core.UploadFile({ file: e.target.files[0] })
                        .then(response => {
                          setZakladnaKonfiguracia(response.file_url);
                          toast.success("Fotka základnej konfigurácie nahratá");
                        })
                        .catch(error => toast.error(`Chyba: ${error.message}`))
                        .finally(() => setUploading(false));
                    }
                  }}
                  className="hidden"
                  id="zakladna-upload"
                  disabled={uploading}
                />
                <label htmlFor="zakladna-upload">
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Nahrať
                    </span>
                  </Button>
                </label>
              </div>
              
              {zakladnaKonfiguracia ? (
                <div className="relative">
                  <img src={zakladnaKonfiguracia} alt="Základná konfigurácia" className="w-full h-auto rounded-lg border" />
                  <button
                    onClick={() => setZakladnaKonfiguracia("")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Badge className="absolute bottom-2 left-2 bg-blue-600">Základná konfigurácia</Badge>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
                  <Home className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">Fotka základnej konfigurácie nie je nahratá</p>
                  <p className="text-xs mt-1">Nahrajte fotku domu v štandardnej výbave</p>
                </div>
              )}

              {/* Možnosť vybrať z knižnice */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Alebo vyberte z knižnice:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedPhotos.map((photo, index) => (
                      <div 
                        key={index} 
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          zakladnaKonfiguracia === photo.url ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400'
                        }`}
                        onClick={() => {
                          setZakladnaKonfiguracia(photo.url);
                          toast.success("Fotka základnej konfigurácie nastavená");
                        }}
                      >
                        <img src={photo.url} alt={photo.name} className="w-full h-16 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
}