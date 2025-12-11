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
import { Save, Eye, Loader2, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminWatermark() {
  const queryClient = useQueryClient();
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [testMode, setTestMode] = useState(true);

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

  const handleBatchApply = async () => {
    setBatchLoading(true);
    setBatchResults(null);

    try {
      const response = await base44.functions.invoke('aplikujWatermarkNaVsetkyFotky', {
        testMode
      });

      console.log('Response:', response);
      console.log('Response data:', response.data);

      setBatchResults(response.data);
    } catch (error) {
      console.error('Error:', error);
      setBatchResults({
        success: false,
        error: error.message,
        log: [`❌ Chyba: ${error.message}`]
      });
    } finally {
      setBatchLoading(false);
    }
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
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Ukladám...' : 'Uložiť'}
                </Button>
                <Button
                  onClick={() => setShowBatchPanel(!showBatchPanel)}
                  variant="outline"
                  className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Aplikovať natrvalo
                </Button>
              </div>
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

        {/* Batch aplikácia watermarku */}
        {showBatchPanel && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Aplikovať watermark natrvalo na fotky</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Watermark sa aplikuje priamo do fotiek, nie cez overlay
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowBatchPanel(false)}>
                Zavrieť
              </Button>
            </div>

            <Alert className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold mb-1">
                      {testMode ? '🧪 Test režim aktívny' : '⚠️ LIVE režim - fotky budú natrvalo zmenené!'}
                    </p>
                    <p className="text-sm">
                      {testMode 
                        ? 'Proces sa vykoná na sucho bez uloženia zmien.'
                        : 'Pôvodné fotky budú nahradené novými s watermarkom. Stránka bude rýchlejšia.'}
                    </p>
                  </div>
                  <Button
                    variant={testMode ? "default" : "destructive"}
                    onClick={() => setTestMode(!testMode)}
                  >
                    {testMode ? 'Prepnúť na LIVE' : 'Prepnúť na TEST'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleBatchApply}
                disabled={batchLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {batchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Spracovávam...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {testMode ? 'Spustiť TEST' : 'Spustiť LIVE aplikáciu'}
                  </>
                )}
              </Button>
            </div>

            {/* Výsledky */}
            {batchResults && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Výsledky</h3>
                
                {batchResults.results && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{batchResults.results.processed}</p>
                      <p className="text-sm text-gray-600">Spracovaných</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{batchResults.results.migrated}</p>
                      <p className="text-sm text-gray-600">Watermarkov</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{batchResults.results.errors}</p>
                      <p className="text-sm text-gray-600">Chýb</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-600">{batchResults.results.skipped}</p>
                      <p className="text-sm text-gray-600">Preskočených</p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                  {batchResults.log?.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}