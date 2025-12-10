import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Eye, User, Tag, Sparkles, Edit2, Check, X, Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function BlogPreviewModal({ post, isOpen, onClose, onImageRegenerate }) {
  const [editingImage, setEditingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!post) return null;

  const handleRegenerateWithPrompt = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Zadajte text pre úpravu obrázka');
      return;
    }

    setRegenerating(true);
    try {
      const customPrompt = `${post.nazov}. ${post.perex}. Požiadavka na úpravu: ${imagePrompt}`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt: customPrompt });
      await base44.entities.BlogPost.update(post.id, { titulny_obrazok: url });
      toast.success('Obrázok úspešne upravený!');
      setEditingImage(false);
      setImagePrompt("");
      if (onImageRegenerate) {
        onImageRegenerate(post.id);
      }
    } catch (error) {
      toast.error('Chyba pri úprave: ' + error.message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(post.titulny_obrazok);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${post.slug || 'blog-image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Obrázok stiahnutý');
    } catch (error) {
      toast.error('Chyba pri sťahovaní');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.BlogPost.update(post.id, { titulny_obrazok: file_url });
      toast.success('Obrázok nahraný a uložený!');
      if (onImageRegenerate) {
        onImageRegenerate(post.id);
      }
    } catch (error) {
      toast.error('Chyba pri nahrávaní: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const kategorieLabels = {
    novinky: "Novinky",
    tipy: "Tipy a rady",
    realizacie: "Realizácie",
    technologie: "Technológie"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Náhľad článku</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          {/* Header */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              <Badge className="bg-primary text-white">
                {kategorieLabels[post.kategoria]}
              </Badge>
              {(() => {
                const content = (post.nazov + ' ' + (post.tagy?.join(' ') || '')).toLowerCase();
                if (content.includes('ticabhouse') || content.includes('ticab')) {
                  return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Ticabhouse</Badge>;
                } else if (content.includes('prostohouse') || content.includes('prosto')) {
                  return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">ProstoHouse</Badge>;
                } else {
                  return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">American Living</Badge>;
                }
              })()}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {post.nazov}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {post.perex}
            </p>
            
            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.autor || 'American Living'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.datum_publikacie 
                  ? format(new Date(post.datum_publikacie), 'd. MMMM yyyy', { locale: sk })
                  : format(new Date(), 'd. MMMM yyyy', { locale: sk })
                }
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {post.pocet_zobrazeni || 0} zobrazení
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg relative group">
            <img
              src={post.titulny_obrazok}
              alt={post.nazov}
              className="w-full h-auto object-cover"
            />
            {!editingImage && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleDownloadImage}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Stiahnuť
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => document.getElementById('upload-image-input').click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Nahrať nový
                </Button>
                <input
                  id="upload-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setEditingImage(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Upraviť AI obrázok
                </Button>
              </div>
            )}
          </div>

          {/* Image Edit Panel */}
          {editingImage && (
            <Card className="p-4 mb-6 border-purple-300 bg-purple-50">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Upravte text alebo opravte chyby na obrázku
                  </label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Napr.: Oprav gramatickú chybu v texte, zmeň 'modularne' na 'modulárne', odstráň text z obrázka, pridaj text..."
                    rows={3}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-600">
                    AI vygeneruje nový obrázok s požadovanými úpravami textu
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegenerateWithPrompt}
                    disabled={regenerating || !imagePrompt.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {regenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generujem...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Vygenerovať upravený obrázok
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingImage(false);
                      setImagePrompt("");
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Zrušiť
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Content */}
          <Card className="p-6 mb-6">
            <ReactMarkdown
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-strong:text-gray-900"
            >
              {post.obsah}
            </ReactMarkdown>
          </Card>

          {/* Tags */}
          {post.tagy && post.tagy.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Tagy:</span>
                {post.tagy.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}