import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Image as ImageIcon, Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminGeneratorObrazkov() {
  const [selectedDom, setSelectedDom] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['domy-admin'],
    queryFn: () => base44.entities.Dom.list('nazov')
  });

  const updateDomMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Dom.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domy-admin'] });
      alert('✓ Obrázok bol úspešne nastavený ako hlavný obrázok domu!');
    },
  });

  const generateImage = async () => {
    if (!prompt) {
      setError("Zadajte prosím popis obrázka");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional architectural visualization of a ${prompt}. Modern, clean, photorealistic style with natural lighting, beautiful landscaping, and clear blue sky. High quality 4K rendering.`
      });
      
      setGeneratedImage(result.url);
    } catch (err) {
      setError(err.message || "Chyba pri generovaní obrázka");
    } finally {
      setIsGenerating(false);
    }
  };

  const setAsMainImage = () => {
    if (!selectedDom || !generatedImage) return;
    
    updateDomMutation.mutate({
      id: selectedDom.id,
      data: { hlavny_obrazok: generatedImage }
    });
  };

  const addToGallery = () => {
    if (!selectedDom || !generatedImage) return;
    
    const currentGallery = selectedDom.galeria || [];
    updateDomMutation.mutate({
      id: selectedDom.id,
      data: { galeria: [...currentGallery, generatedImage] }
    });
  };

  const generateAutoPrompt = (dom) => {
    if (!dom) return "";
    
    const typ = dom.typ_domu === 'modularny' ? 'modular family house' : 'mobile tiny house';
    const plocha = dom.zastavana_plocha ? `${dom.zastavana_plocha}m²` : '';
    const izby = dom.pocet_izieb ? `with ${dom.pocet_izieb} rooms` : '';
    
    return `${typ} ${plocha} ${izby}, ${dom.vyrobca} style, modern Scandinavian design, wooden facade`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">
              AI Generátor obrázkov domov
            </h1>
          </div>
          <p className="text-xl text-blue-100">
            Vytvorte profesionálne vizualizácie modulárnych domov pomocou AI
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ľavý panel - nastavenia */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Nastavenia generovania</h2>
              
              <div className="space-y-6">
                {/* Výber domu */}
                <div>
                  <Label>Vyberte dom</Label>
                  <Select 
                    value={selectedDom?.id || ""} 
                    onValueChange={(id) => {
                      const dom = domy.find(d => d.id === id);
                      setSelectedDom(dom);
                      setPrompt(generateAutoPrompt(dom));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Vyberte model domu..." />
                    </SelectTrigger>
                    <SelectContent>
                      {domy.map((dom) => (
                        <SelectItem key={dom.id} value={dom.id}>
                          {dom.nazov} - {dom.vyrobca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDom && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Aktuálny hlavný obrázok:</strong>
                    </p>
                    <img 
                      src={selectedDom.hlavny_obrazok} 
                      alt={selectedDom.nazov}
                      className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                  </div>
                )}

                {/* Popis pre AI */}
                <div>
                  <Label htmlFor="prompt">Popis obrázka pre AI</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Napríklad: modern wooden house with large windows, surrounded by nature, sunny day..."
                    rows={6}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Buďte konkrétni - uveďte štýl, farby, prostredie, denné svetlo, atď.
                  </p>
                </div>

                {/* Tlačidlo generovania */}
                <Button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                      Generuje sa... (5-10 sekúnd)
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 w-5 h-5" />
                      Vygenerovať obrázok
                    </>
                  )}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Pravý panel - náhľad */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Náhľad a akcie</h2>

              {!generatedImage && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
                  <ImageIcon className="w-20 h-20 text-gray-300 mb-4" />
                  <p className="text-gray-500">Zatiaľ žiadny vygenerovaný obrázok</p>
                  <p className="text-sm text-gray-400 mt-2">Vyberte dom a vygenerujte vizualizáciu</p>
                </div>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
                  <RefreshCw className="w-20 h-20 text-purple-600 mb-4 animate-spin" />
                  <p className="text-gray-700 font-semibold">Generuje sa obrázok...</p>
                  <p className="text-sm text-gray-500 mt-2">Trvá to približne 5-10 sekúnd</p>
                </div>
              )}

              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative group">
                    <img
                      src={generatedImage}
                      alt="Vygenerovaný obrázok"
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Vygenerované AI
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={setAsMainImage}
                      disabled={!selectedDom || updateDomMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ImageIcon className="mr-2 w-4 h-4" />
                      Nastaviť ako hlavný
                    </Button>
                    <Button
                      onClick={addToGallery}
                      disabled={!selectedDom || updateDomMutation.isPending}
                      variant="outline"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Pridať do galérie
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">URL obrázka:</p>
                    <code className="text-xs bg-white p-2 rounded block break-all border">
                      {generatedImage}
                    </code>
                  </div>

                  <Button
                    onClick={() => {
                      setGeneratedImage(null);
                      setError(null);
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    Vygenerovať nový obrázok
                  </Button>
                </motion.div>
              )}
            </Card>
          </div>

          {/* Nápoveda */}
          <Card className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="font-bold text-primary mb-4">💡 Tipy pre lepšie výsledky</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Používajte konkrétne opisy: "modern wooden house" namiesto len "house"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Uveďte architektúrny štýl: Scandinavian, minimalist, contemporary, traditional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Popíšte prostredie: surrounded by forest, on a hill, near lake, in suburban area</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Určite svetlo: sunny day, golden hour, blue sky, natural lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Materiály: wooden facade, composite panels, metal roof, large windows</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}