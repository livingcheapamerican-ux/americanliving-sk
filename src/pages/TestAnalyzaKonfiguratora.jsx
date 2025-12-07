import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";

export default function TestAnalyzaKonfiguratora() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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

          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-[600px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </Card>
    </div>
  );
}