import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, FileSearch, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";
import BlogPreviewModal from "../components/BlogPreviewModal";

export default function AdminBlog() {
  const [editingPost, setEditingPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generatingImageForId, setGeneratingImageForId] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast.success('Článok vytvorený');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast.success('Článok aktualizovaný');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      toast.success('Článok vymazaný');
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publikovany }) => base44.entities.BlogPost.update(id, {
      publikovany,
      datum_publikacie: publikovany ? new Date().toISOString() : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      toast.success('Stav publikácie zmenený');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tagy = formData.get('tagy').split(',').map(t => t.trim()).filter(Boolean);

    const data = {
      nazov: formData.get('nazov'),
      slug: formData.get('slug'),
      perex: formData.get('perex'),
      obsah: formData.get('obsah'),
      titulny_obrazok: formData.get('titulny_obrazok'),
      autor: formData.get('autor'),
      kategoria: formData.get('kategoria'),
      tagy,
      meta_title: formData.get('meta_title'),
      meta_description: formData.get('meta_description'),
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      document.getElementById('titulny_obrazok').value = file_url;
      toast.success('Obrázok nahraný');
    } catch (error) {
      toast.error('Chyba pri nahrávaní');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateImage = async (postId) => {
    setGeneratingImageForId(postId);
    try {
      const response = await base44.functions.invoke('generateBlogImage', { postId });
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      toast.success('AI obrázok vygenerovaný');
    } catch (error) {
      toast.error('Chyba pri generovaní: ' + error.message);
    } finally {
      setGeneratingImageForId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Správa blogu</h1>
            <Link to={createPageUrl("Blog")} className="text-primary hover:underline text-sm">
              Zobraziť verejný blog
            </Link>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary" onClick={() => setEditingPost(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nový článok
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Upraviť článok' : 'Nový článok'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nazov">Názov *</Label>
                  <Input
                    id="nazov"
                    name="nazov"
                    required
                    defaultValue={editingPost?.nazov}
                    placeholder="Názov článku"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    required
                    defaultValue={editingPost?.slug}
                    placeholder="url-friendly-nazov"
                  />
                </div>

                <div>
                  <Label htmlFor="kategoria">Kategória *</Label>
                  <Select name="kategoria" defaultValue={editingPost?.kategoria || "novinky"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novinky">Novinky</SelectItem>
                      <SelectItem value="tipy">Tipy a rady</SelectItem>
                      <SelectItem value="realizacie">Realizácie</SelectItem>
                      <SelectItem value="technologie">Technológie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="perex">Perex *</Label>
                  <Textarea
                    id="perex"
                    name="perex"
                    required
                    defaultValue={editingPost?.perex}
                    placeholder="Krátky úvodný text..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="obsah">Obsah (Markdown) *</Label>
                  <Textarea
                    id="obsah"
                    name="obsah"
                    required
                    defaultValue={editingPost?.obsah}
                    placeholder="Obsah článku v markdown formáte..."
                    rows={10}
                  />
                </div>

                <div>
                  <Label htmlFor="titulny_obrazok">URL titulného obrázka *</Label>
                  <Input
                    id="titulny_obrazok"
                    name="titulny_obrazok"
                    required
                    defaultValue={editingPost?.titulny_obrazok}
                    placeholder="https://..."
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploading}
                      className="text-sm"
                    />
                    {uploading && <p className="text-sm text-gray-500 mt-1">Nahrávam...</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="autor">Autor</Label>
                  <Input
                    id="autor"
                    name="autor"
                    defaultValue={editingPost?.autor || "American Living"}
                  />
                </div>

                <div>
                  <Label htmlFor="tagy">Tagy (oddelené čiarkou)</Label>
                  <Input
                    id="tagy"
                    name="tagy"
                    defaultValue={editingPost?.tagy?.join(', ')}
                    placeholder="modulárne domy, tipy, stavba"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_title">SEO Meta titulok</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    defaultValue={editingPost?.meta_title}
                    placeholder="SEO titulok..."
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">SEO Meta popis</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    defaultValue={editingPost?.meta_description}
                    placeholder="SEO popis..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Zrušiť
                  </Button>
                  <Button type="submit" className="bg-primary">
                    {editingPost ? 'Uložiť' : 'Vytvoriť'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex gap-4">
                <img
                  src={post.titulny_obrazok}
                  alt={post.nazov}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{post.nazov}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.perex}</p>
                    </div>
                    <Badge className={post.publikovany ? "bg-green-600" : "bg-gray-400"}>
                      {post.publikovany ? "Publikovaný" : "Koncept"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.datum_publikacie 
                        ? format(new Date(post.datum_publikacie), 'd. M. yyyy', { locale: sk })
                        : format(new Date(post.created_date), 'd. M. yyyy', { locale: sk })
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {post.pocet_zobrazeni || 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setPreviewPost(post);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <FileSearch className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 hover:bg-purple-50"
                      onClick={() => handleGenerateImage(post.id)}
                      disabled={generatingImageForId === post.id}
                    >
                      {generatingImageForId === post.id ? (
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        togglePublishMutation.mutate({
                          id: post.id,
                          publikovany: !post.publikovany
                        });
                      }}
                    >
                      {post.publikovany ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPost(post);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Naozaj vymazať tento článok?')) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Preview Modal */}
        <BlogPreviewModal
          post={previewPost}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onImageRegenerate={(postId) => {
            handleGenerateImage(postId);
            setIsPreviewOpen(false);
          }}
        />
      </div>
    </div>
  );
}