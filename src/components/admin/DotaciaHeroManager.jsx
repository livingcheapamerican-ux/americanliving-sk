import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Save, Plus } from "lucide-react";
import { toast } from "sonner";

export default function DotaciaHeroManager() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({ rodina: false, investor: false });

  const { data: settings } = useQuery({
    queryKey: ['dotacia-hero-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.DotaciaHeroSettings.filter({ klic: 'hero_settings' });
      if (allSettings.length === 0) {
        const newSettings = await base44.entities.DotaciaHeroSettings.create({
          klic: 'hero_settings',
          rodina_fotky: [],
          rodina_interval: 5000,
          investor_fotky: [],
          investor_interval: 5000
        });
        return newSettings;
      }
      return allSettings[0];
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DotaciaHeroSettings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dotacia-hero-settings']);
      toast.success("Nastavenia uložené");
    }
  });

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading({ ...uploading, [type]: true });
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      const currentPhotos = type === 'rodina' ? settings.rodina_fotky : settings.investor_fotky;
      const newPhotos = [...(currentPhotos || []), ...uploadedUrls];

      await updateMutation.mutateAsync(
        type === 'rodina' 
          ? { rodina_fotky: newPhotos }
          : { investor_fotky: newPhotos }
      );
      toast.success(`${uploadedUrls.length} fotiek nahraných`);
    } catch (error) {
      toast.error("Chyba pri nahrávaní fotiek");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleDeletePhoto = async (type, index) => {
    const currentPhotos = type === 'rodina' ? settings.rodina_fotky : settings.investor_fotky;
    const newPhotos = currentPhotos.filter((_, i) => i !== index);

    await updateMutation.mutateAsync(
      type === 'rodina' 
        ? { rodina_fotky: newPhotos }
        : { investor_fotky: newPhotos }
    );
  };

  const handleIntervalChange = (type, value) => {
    const interval = parseInt(value) || 5000;
    updateMutation.mutate(
      type === 'rodina'
        ? { rodina_interval: interval }
        : { investor_interval: interval }
    );
  };

  if (!settings) return <div>Načítavam...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <span>🏡</span> Ľavá strana - Rodina & Istota
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Interval slideshow (ms)
            </label>
            <Input
              type="number"
              value={settings.rodina_interval}
              onChange={(e) => handleIntervalChange('rodina', e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Aktuálne: {(settings.rodina_interval / 1000).toFixed(1)} sekúnd
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Fotky ({settings.rodina_fotky?.length || 0})
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'rodina')}
              className="hidden"
              id="upload-rodina"
            />
            <label htmlFor="upload-rodina">
              <Button
                type="button"
                variant="outline"
                disabled={uploading.rodina}
                onClick={() => document.getElementById('upload-rodina').click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading.rodina ? "Nahrávam..." : "Nahrať fotky"}
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.rodina_fotky?.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Rodina ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeletePhoto('rodina', index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
          <CardTitle className="flex items-center gap-2">
            <span>📈</span> Pravá strana - Investícia & Výnos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Interval slideshow (ms)
            </label>
            <Input
              type="number"
              value={settings.investor_interval}
              onChange={(e) => handleIntervalChange('investor', e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Aktuálne: {(settings.investor_interval / 1000).toFixed(1)} sekúnd
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Fotky ({settings.investor_fotky?.length || 0})
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'investor')}
              className="hidden"
              id="upload-investor"
            />
            <label htmlFor="upload-investor">
              <Button
                type="button"
                variant="outline"
                disabled={uploading.investor}
                onClick={() => document.getElementById('upload-investor').click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading.investor ? "Nahrávam..." : "Nahrať fotky"}
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.investor_fotky?.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Investor ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeletePhoto('investor', index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}