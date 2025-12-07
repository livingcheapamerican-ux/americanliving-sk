import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, CheckCircle, ImageIcon } from "lucide-react";

export default function TestAnalyzaKonfiguratora() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [implementing, setImplementing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setUploadProgress(0);
    try {
      const uploadedUrls = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      setImageUrls([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert('Chyba pri nahrávaní súborov');
    }
    setUploadingFiles(false);
    setUploadProgress(0);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
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
      
      const response = await base44.functions.invoke('implementujKonfiguratorTexty', {
        items: itemsToImplement,
        vyrobca: 'Prosto House'
      });
      
      if (response.data.success) {
        alert(`Úspešne implementovaných ${response.data.count} textov do Prosto House konfigurátorov`);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error(error);
      alert('Chyba pri implementácii: ' + error.message);
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
            
            {/* Drag & Drop zona */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              } ${uploadingFiles || loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Kliknite alebo pretiahnite obrázky sem
              </p>
              <p className="text-xs text-gray-500">
                Podporované formáty: PNG, JPG, JPEG
              </p>
            </div>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              disabled={uploadingFiles || loading}
              className="hidden"
            />
            
            {uploadingFiles && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Nahrávam súbory...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {imageUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Nahrané obrázky ({imageUrls.length}):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Obrázok ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary transition-all" 
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
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