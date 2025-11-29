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
import { X, Save, Tag, Image as ImageIcon, Home, Loader2 } from "lucide-react";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (photo) {
      setFormData({
        nazov: photo.nazov || photo.originalName || photo.name || '',
        popis: photo.popis || '',
        typ_fotky: photo.typ_fotky || 'galeria',
        kategoria: photo.kategoria || 'exterier',
        tagy: photo.tagy || [],
        dom_id: photo.dom_id || '',
        poradie: photo.poradie || 0
      });
    }
  }, [photo]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            Upraviť metadáta fotky
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}