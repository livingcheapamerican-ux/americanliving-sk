import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Save, Eye } from "lucide-react";
import { toast } from "sonner";


export default function AdminWatermark() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings-watermark'],
    queryFn: async () => {
      const all = await base44.entities.SiteSettings.list();
      return all.find(s => s.klic === 'watermark_settings') || null;
    }
  });

  const [enabled, setEnabled] = useState(false);
  const [enabledCatalog, setEnabledCatalog] = useState(false);
  const [text, setText] = useState("American Living");
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(0.3);
  const [size, setSize] = useState("medium");

  React.useEffect(() => {
    if (settings) {
      setEnabled(settings.watermark_enabled || false);
      setEnabledCatalog(settings.watermark_enabled_catalog || false);
      setText(settings.watermark_text || "American Living");
      setPosition(settings.watermark_position || "bottom-right");
      setOpacity(settings.watermark_opacity || 0.3);
      setSize(settings.watermark_size || "medium");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return base44.entities.SiteSettings.update(settings.id, data);
      } else {
        return base44.entities.SiteSettings.create({
          klic: 'watermark_settings',
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings-watermark'] });
      toast.success('Nastavenia watermarku uložené');
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      watermark_enabled: enabled,
      watermark_enabled_catalog: enabledCatalog,
      watermark_text: text,
      watermark_position: position,
      watermark_opacity: opacity,
      watermark_size: size
    });
  };



  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  const sizeClasses = {
    "small": "text-sm",
    "medium": "text-base",
    "large": "text-xl",
    "xlarge": "text-2xl",
    "xxlarge": "text-4xl"
  };

  if (isLoading) return <div className="p-8">Načítavam...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nastavenie Watermarku</h1>
          <p className="text-gray-600 mt-2">Nastavte watermark pre fotky domov v katalógu</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Nastavenia */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Nastavenia</h2>
            
            <div className="space-y-6">
              {/* Zapnuté/Vypnuté - Galéria */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="enabled" className="text-base font-semibold">Galéria domov</Label>
                  <p className="text-sm text-gray-500">Watermark v galérii detailu domu</p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {/* Zapnuté/Vypnuté - Katalóg */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <Label htmlFor="enabledCatalog" className="text-base font-semibold">Katalóg domov</Label>
                  <p className="text-sm text-gray-500">Watermark v katalógu domov (úvodné fotky)</p>
                </div>
                <Switch
                  id="enabledCatalog"
                  checked={enabledCatalog}
                  onCheckedChange={setEnabledCatalog}
                />
              </div>

              {/* Text */}
              <div>
                <Label htmlFor="text">Text watermarku</Label>
                <Input
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="American Living"
                  className="mt-2"
                />
              </div>

              {/* Pozícia */}
              <div>
                <Label htmlFor="position">Pozícia</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Vľavo hore</SelectItem>
                    <SelectItem value="top-right">Vpravo hore</SelectItem>
                    <SelectItem value="bottom-left">Vľavo dole</SelectItem>
                    <SelectItem value="bottom-right">Vpravo dole</SelectItem>
                    <SelectItem value="center">V strede</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Veľkosť */}
              <div>
                <Label htmlFor="size">Veľkosť</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Malý</SelectItem>
                    <SelectItem value="medium">Stredný</SelectItem>
                    <SelectItem value="large">Veľký</SelectItem>
                    <SelectItem value="xlarge">Extra veľký</SelectItem>
                    <SelectItem value="xxlarge">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priehľadnosť */}
              <div>
                <Label htmlFor="opacity">Priehľadnosť: {Math.round(opacity * 100)}%</Label>
                <Slider
                  id="opacity"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[opacity]}
                  onValueChange={([val]) => setOpacity(val)}
                  className="mt-4"
                />
              </div>

              {/* Uložiť */}
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Ukladám...' : 'Uložiť'}
              </Button>
            </div>
          </Card>

          {/* Náhľad */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Náhľad
            </h2>
            
            <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img
                src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
                alt="Náhľad"
                className="w-full h-full object-cover"
              />
              {enabled && (
                <div 
                  className={`absolute ${positionClasses[position]} ${sizeClasses[size]} font-bold text-white pointer-events-none select-none`}
                  style={{ 
                    opacity: opacity,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {text}
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Tip:</strong> Watermark sa aplikuje na:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Galéria domov:</strong> Všetky fotky v detaile domu (hlavná fotka, miniatúry, galérie, lightbox)</li>
                <li>• <strong>Katalóg domov:</strong> Úvodné fotky domov v zozname (len ak zapnuté)</li>
              </ul>
            </div>
          </Card>
        </div>


      </div>
    </div>
  );
}