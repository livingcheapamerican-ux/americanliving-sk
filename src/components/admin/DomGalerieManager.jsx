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
  Grid3x3
} from "lucide-react";
import { toast } from "sonner";

const GALERIA_TYPY = [
  { value: "exterier_drevo_plech", label: "Exteriér - Drevený/Plechový dizajn", icon: "🏠" },
  { value: "exterier_murovka", label: "Exteriér - Murovka (biela omietka)", icon: "🏡" },
  { value: "interier_drevo", label: "Interiér - Drevený obklad", icon: "🪵" },
  { value: "interier_sadrokarton", label: "Interiér - Sadrokartón", icon: "🏢" },
];

export default function DomGalerieManager({ dom, onUpdate }) {
  const [galerie, setGalerie] = useState(dom.galerie || []);
  const [podorys2D, setPodorys2D] = useState(dom.podorys_2d || "");
  const [podorys3D, setPodorys3D] = useState(dom.podorys_3d || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("galerie");

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
    await updateDomMutation.mutateAsync({
      galerie: galerie,
      podorys_2d: podorys2D || null,
      podorys_3d: podorys3D || null
    });
    setSaving(false);
  };

  const addGaleria = () => {
    setGalerie([...galerie, {
      nazov: "Nová galéria",
      typ: "exterier_drevo_plech",
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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="galerie" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Galérie ({galerie.length})
          </TabsTrigger>
          <TabsTrigger value="podorysy" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Pôdorysy
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </Card>
  );
}