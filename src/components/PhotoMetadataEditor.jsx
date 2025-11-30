import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Save, Tag, Image as ImageIcon, Home, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

const TYP_FOTKY_OPTIONS = [
  { value: 'hlavny_obrazok', label: 'Hlavný obrázok', color: 'bg-amber-500' },
  { value: 'zakladna_konfiguracia', label: 'Základná konfigurácia', color: 'bg-blue-500' },
  { value: 'galeria', label: 'Galéria', color: 'bg-gray-500' },
  { value: 'stare_fotky', label: 'Staré fotky', color: 'bg-orange-500' },
  { value: 'nove_fotky', label: 'Nové fotky', color: 'bg-green-500' },
  { value: 'podorys', label: 'Pôdorys', color: 'bg-purple-500' },
];

const KATEGORIA_OPTIONS = [
  { value: 'exterier', label: 'Exteriér' },
  { value: 'interier', label: 'Interiér' },
  { value: 'podorys', label: 'Pôdorys' },
  { value: 'detail', label: 'Detail' },
  { value: 'okolie', label: 'Okolie' },
  { value: 'ine', label: 'Iné' },
];

export default function PhotoMetadataEditor({ 
  photo, 
  isOpen, 
  onClose, 
  domy = [],
  onSave 
}) {
  const [formData, setFormData] = useState({
    nazov: '',
    popis: '',
    typ_fotky: 'galeria',
    kategoria: 'exterier',
    tagy: [],
    dom_id: '',
    poradie: 0
  });
  const [newTag, setNewTag] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (photo && isOpen) {
      setFormData({
        nazov: photo.nazov || photo.originalName || photo.name || '',
        popis: photo.popis || '',
        typ_fotky: photo.typ_fotky || 'galeria',
        kategoria: photo.kategoria || 'exterier',
        tagy: photo.tagy || [],
        dom_id: photo.dom_id || '',
        poradie: photo.poradie || 0
      });
      setAiSuggestions(null);
    }
  }, [photo, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const selectedDom = domy.find(d => d.id === data.dom_id);
      const photoData = {
        ...data,
        url: photo.url || photo.file_url,
        dom_nazov: selectedDom?.nazov || '',
        vyrobca: selectedDom?.vyrobca || '',
        povodny_nazov: photo.originalName || photo.name || '',
        cesta_priecinka: photo.path || '',
        zdroj: photo.zdroj || (photo.path ? 'google_drive' : 'upload')
      };

      if (photo.id) {
        return base44.entities.Fotka.update(photo.id, photoData);
      } else {
        return base44.entities.Fotka.create(photoData);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['fotky'] });
      toast.success('Fotka uložená');
      if (onSave) onSave(result);
      onClose();
    },
    onError: (error) => {
      toast.error(`Chyba: ${error.message}`);
    }
  });

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tagy.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tagy: [...prev.tagy, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tagy: prev.tagy.filter(tag => tag !== tagToRemove)
    }));
  };

  const analyzeWithAI = async () => {
    const photoUrl = photo.url || photo.file_url;
    if (!photoUrl) {
      toast.error('Chýba URL fotky');
      return;
    }

    setAnalyzing(true);
    setAiSuggestions(null);

    try {
      const domyInfo = domy.map(d => `${d.nazov} (${d.vyrobca})`).join(', ');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyzuj túto fotku modulárneho/mobilného domu a navrhni metadáta.

Dostupné domy v systéme: ${domyInfo}

Na základe vizuálneho obsahu fotky urči:
1. Kategória obsahu (exterier, interier, podorys, detail, okolie, ine)
2. Typ fotky (hlavny_obrazok - reprezentatívna foto celého domu zvonka, galeria - bežná foto, podorys - technický výkres, stare_fotky, nove_fotky)
3. 3-6 relevantných tagov/kľúčových slov v slovenčine (napr. fasáda, drevo, terasa, kuchyňa, spálňa, moderný dizajn)
4. Krátky popis fotky (1-2 vety)
5. Ak rozpoznáš konkrétny model domu zo zoznamu, navrhni jeho názov

Odpovedz v slovenčine.`,
        file_urls: [photoUrl],
        response_json_schema: {
          type: "object",
          properties: {
            kategoria: { 
              type: "string", 
              enum: ["exterier", "interier", "podorys", "detail", "okolie", "ine"]
            },
            typ_fotky: { 
              type: "string", 
              enum: ["hlavny_obrazok", "galeria", "podorys", "stare_fotky", "nove_fotky"]
            },
            tagy: { 
              type: "array", 
              items: { type: "string" }
            },
            popis: { type: "string" },
            navrhnuty_dom: { type: "string" },
            dovera_priradenia: { 
              type: "string",
              enum: ["vysoka", "stredna", "nizka", "nerozpoznane"]
            }
          },
          required: ["kategoria", "typ_fotky", "tagy", "popis"]
        }
      });

      setAiSuggestions(result);
      toast.success('AI analýza dokončená');
    } catch (error) {
      toast.error(`Chyba AI analýzy: ${error.message}`);
    }
    
    setAnalyzing(false);
  };

  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;

    const updates = {
      kategoria: aiSuggestions.kategoria,
      typ_fotky: aiSuggestions.typ_fotky,
      popis: aiSuggestions.popis || formData.popis,
      tagy: [...new Set([...formData.tagy, ...(aiSuggestions.tagy || [])])]
    };

    // Ak AI navrhlo dom s vysokou alebo strednou dôverou
    if (aiSuggestions.navrhnuty_dom && ['vysoka', 'stredna'].includes(aiSuggestions.dovera_priradenia)) {
      const matchedDom = domy.find(d => 
        d.nazov.toLowerCase().includes(aiSuggestions.navrhnuty_dom.toLowerCase()) ||
        aiSuggestions.navrhnuty_dom.toLowerCase().includes(d.nazov.toLowerCase())
      );
      if (matchedDom) {
        updates.dom_id = matchedDom.id;
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
    toast.success('AI návrhy aplikované');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen && !!photo} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            Upraviť metadáta fotky
          </DialogTitle>
        </DialogHeader>

        {photo && <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Analysis Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={analyzeWithAI}
              disabled={analyzing}
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzujem...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" />AI Analýza fotky</>
              )}
            </Button>
            {aiSuggestions && (
              <Button
                type="button"
                onClick={applyAiSuggestions}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Použiť návrhy
              </Button>
            )}
          </div>

          {/* AI Suggestions Panel */}
          {aiSuggestions && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-1 text-purple-700 font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                AI návrhy
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Kategória:</span> {KATEGORIA_OPTIONS.find(k => k.value === aiSuggestions.kategoria)?.label}</div>
                <div><span className="text-gray-500">Typ:</span> {TYP_FOTKY_OPTIONS.find(t => t.value === aiSuggestions.typ_fotky)?.label}</div>
              </div>
              {aiSuggestions.popis && (
                <p className="text-xs text-gray-600 mt-1">{aiSuggestions.popis}</p>
              )}
              {aiSuggestions.tagy?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {aiSuggestions.tagy.map((tag, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              {aiSuggestions.navrhnuty_dom && (
                <div className="mt-2 text-xs">
                  <span className="text-gray-500">Možný dom:</span> {aiSuggestions.navrhnuty_dom}
                  <Badge className="ml-1 text-xs" variant="outline">
                    {aiSuggestions.dovera_priradenia}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="flex gap-4">
            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={photo.url || photo.file_url} 
                alt={formData.nazov}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow space-y-3">
              <div>
                <Label htmlFor="nazov">Názov *</Label>
                <Input
                  id="nazov"
                  value={formData.nazov}
                  onChange={(e) => setFormData(prev => ({ ...prev, nazov: e.target.value }))}
                  placeholder="Názov fotky"
                  required
                />
              </div>
              <div>
                <Label htmlFor="popis">Popis</Label>
                <Textarea
                  id="popis"
                  value={formData.popis}
                  onChange={(e) => setFormData(prev => ({ ...prev, popis: e.target.value }))}
                  placeholder="Popis fotky..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Typ fotky</Label>
              <Select 
                value={formData.typ_fotky} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, typ_fotky: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYP_FOTKY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategória</Label>
              <Select 
                value={formData.kategoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, kategoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORIA_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assign to Dom */}
          <div>
            <Label className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Priradiť k domu
            </Label>
            <Select 
              value={formData.dom_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, dom_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte dom..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Bez priradenia</SelectItem>
                {domy.map(dom => (
                  <SelectItem key={dom.id} value={dom.id}>
                    {dom.nazov} ({dom.vyrobca})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Tagy / Kľúčové slová
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Pridať tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Pridať
              </Button>
            </div>
            {formData.tagy.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tagy.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Order */}
          <div>
            <Label htmlFor="poradie">Poradie v galérii</Label>
            <Input
              id="poradie"
              type="number"
              value={formData.poradie}
              onChange={(e) => setFormData(prev => ({ ...prev, poradie: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          {/* Source info */}
          {(photo.path || photo.povodny_nazov) && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              {photo.path && <p>Cesta: {photo.path}</p>}
              {photo.povodny_nazov && <p>Pôvodný názov: {photo.povodny_nazov}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Zrušiť
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ukladám...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Uložiť</>
              )}
            </Button>
          </div>
        </form>}
      </DialogContent>
    </Dialog>
  );
}