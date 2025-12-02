import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Upload, 
  Trash2, 
  Loader2, 
  Save, 
  Image as ImageIcon,
  GripVertical,
  Plus,
  Clock,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
];

export default function HeroSettingsManager({ settings, onUpdate }) {
  const [images, setImages] = useState(settings?.hero_images?.length > 0 ? settings.hero_images : DEFAULT_IMAGES);
  const [interval, setInterval] = useState(settings?.hero_interval || 5000);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (settings?.hero_images?.length > 0) {
      setImages(settings.hero_images);
    }
    if (settings?.hero_interval) {
      setInterval(settings.hero_interval);
    }
  }, [settings]);

  // Preview carousel
  useEffect(() => {
    if (images.length > 1) {
      const timer = window.setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % images.length);
      }, interval);
      return () => window.clearInterval(timer);
    }
  }, [images.length, interval]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings?.id) {
        await base44.entities.SiteSettings.update(settings.id, {
          hero_images: images,
          hero_interval: interval
        });
      } else {
        await base44.entities.SiteSettings.create({
          klic: "hero_settings",
          hero_images: images,
          hero_interval: interval
        });
      }
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success("Nastavenia uložené");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(`Chyba: ${error.message}`);
    }
    setSaving(false);
  };

  const handleUpload = async (files) => {
    setUploading(true);
    const newUrls = [];

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        newUrls.push(response.file_url);
      } catch (error) {
        toast.error(`Chyba pri nahrávaní ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      setImages([...images, ...newUrls]);
      toast.success(`Nahratých ${newUrls.length} obrázkov`);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    if (images.length <= 1) {
      toast.error("Musí zostať aspoň 1 obrázok");
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setImages(items);
  };

  const addImageByUrl = (url) => {
    if (url && url.startsWith('http')) {
      setImages([...images, url]);
      toast.success("Obrázok pridaný");
    }
  };

  return (
    <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hero carousel nastavenia</h2>
            <p className="text-sm text-gray-500">Fotky na úvodnej stránke</p>
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

      {/* Náhľad */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Náhľad (aktuálna rýchlosť: {interval / 1000}s)</Label>
        <div className="relative h-48 rounded-xl overflow-hidden bg-gray-900">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === previewIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </div>
          ))}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === previewIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rýchlosť prepínania */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Rýchlosť prepínania
          </Label>
          <Badge className="bg-purple-100 text-purple-700">{interval / 1000} sekúnd</Badge>
        </div>
        <Slider
          min={2000}
          max={15000}
          step={500}
          value={[interval]}
          onValueChange={([value]) => setInterval(value)}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>2s (rýchle)</span>
          <span>15s (pomalé)</span>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Pridať obrázky</Label>
        <div className="flex gap-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(Array.from(e.target.files))}
            className="hidden"
            id="hero-upload"
            disabled={uploading}
          />
          <label htmlFor="hero-upload" className="flex-1">
            <Button type="button" variant="outline" asChild disabled={uploading} className="w-full cursor-pointer">
              <span>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Nahrať obrázky
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Zoznam obrázkov s drag & drop */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium text-gray-700">
            Obrázky v carousel ({images.length})
          </Label>
          <p className="text-xs text-gray-500">Ťahajte pre zmenu poradia</p>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="hero-images">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {images.map((img, index) => (
                  <Draggable key={img + index} draggableId={img + index} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          snapshot.isDragging 
                            ? 'border-purple-500 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium text-gray-700">Slide {index + 1}</p>
                          <p className="text-xs text-gray-500 truncate">{img}</p>
                        </div>
                        {index === previewIndex && (
                          <Badge className="bg-green-100 text-green-700 flex-shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktívny
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {images.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">Žiadne obrázky</p>
          </div>
        )}
      </div>
    </Card>
  );
}