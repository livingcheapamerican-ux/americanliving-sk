import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";

export default function TestAnalyzaKonfiguratora() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [implementing, setImplementing] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setImageUrls([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert('Chyba pri nahrávaní súborov');
    }
    setUploadingFiles(false);
  };

  const handleAnalyze = async () => {
    if (imageUrls.length === 0) {
      alert('Najprv nahrajte obrázky');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzujStaryKonfigurator', {
        imageUrls
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleStop = () => {
    setLoading(false);
    setResult({ message: 'Analýza zastavená používateľom' });
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleImplement = async () => {
    if (selectedItems.length === 0) {
      alert('Vyberte položky na implementáciu');
      return;
    }

    setImplementing(true);
    try {
      const itemsToImplement = result.items.filter((_, index) => selectedItems.includes(index));
      
      // Tu môžeš pridať backend funkciu na implementáciu
      console.log('Implementujem tieto položky:', itemsToImplement);
      
      alert(`Úspešne označených ${selectedItems.length} položiek na implementáciu do Prosto House konfigurátorov`);
    } catch (error) {
      console.error(error);
      alert('Chyba pri implementácii');
    }
    setImplementing(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Analýza starého konfiguratora</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nahrať obrázky konfiguratora</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFiles || loading}
              className="mb-2"
            />
            {uploadingFiles && <p className="text-sm text-gray-500">Nahrávam súbory...</p>}
          </div>

          {imageUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Nahrané obrázky ({imageUrls.length}):</p>
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Obrázok ${index + 1}`} className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={loading || imageUrls.length === 0}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Upload className="w-4 h-4 mr-2" />
              Analyzovať obrázky
            </Button>

            {loading && (
              <Button onClick={handleStop} variant="destructive">
                <X className="w-4 h-4 mr-2" />
                Zastaviť analýzu
              </Button>
            )}
          </div>

          {result && result.items && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Výsledky analýzy ({result.items.length} položiek)</h2>
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedItems.length} vybraných</Badge>
                  <Button 
                    onClick={handleImplement} 
                    disabled={selectedItems.length === 0 || implementing}
                    size="sm"
                  >
                    {implementing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Implementovať vybrané
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {result.items.map((item, index) => (
                  <Card key={index} className={`p-4 ${selectedItems.includes(index) ? 'border-green-500 border-2 bg-green-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(index)}
                        onCheckedChange={() => toggleItemSelection(index)}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        {item.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                        )}
                        {item.long_description && (
                          <p className="text-sm mb-2">{item.long_description}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">{item.notes}</p>
                        )}
                        {item.category && (
                          <Badge className="mt-2">{item.category}</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {result && result.error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              Chyba: {result.error}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}