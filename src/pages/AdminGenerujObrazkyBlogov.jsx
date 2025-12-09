import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminGenerujObrazkyBlogov() {
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-blog-posts-images'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
    initialData: []
  });

  const generateImageMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await base44.functions.invoke('generateBlogImage', { postId });
      return response.data;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts-images'] });
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      toast.success(`Obrázok vygenerovaný pre: ${data.blog_title}`);
    },
    onError: (error, postId) => {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      toast.error('Chyba pri generovaní: ' + error.message);
    }
  });

  const handleGenerate = (postId) => {
    setProcessingIds(prev => new Set(prev).add(postId));
    generateImageMutation.mutate(postId);
  };

  const handleGenerateAll = async () => {
    if (posts.length === 0) {
      toast.info('Žiadne články na spracovanie');
      return;
    }

    toast.info(`Generujem AI obrázky pre ${posts.length} článkov...`);

    for (const post of posts) {
      setProcessingIds(prev => new Set(prev).add(post.id));
      try {
        await generateImageMutation.mutateAsync(post.id);
        // Delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('Error generating image for post:', post.id, error);
      }
    }

    toast.success('Všetky obrázky boli vygenerované!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Načítavam články...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Generovanie obrázkov pre Blog
          </h1>
          <p className="text-gray-600">
            Automaticky generuj tematické obrázky pre blogové články pomocou AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkom článkov</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktívne generovanie</p>
                <p className="text-2xl font-bold text-gray-900">{processingIds.size}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dokončené</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.length - processingIds.size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Vygenerovať AI obrázky pre všetky články
              </h3>
              <p className="text-sm text-gray-600">
                Každý článok dostane unikátny tematický obrázok vytvorený AI
              </p>
            </div>
            <Button
              onClick={handleGenerateAll}
              disabled={generateImageMutation.isPending || processingIds.size > 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generovať všetky
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => {
            const isProcessing = processingIds.has(post.id);

            return (
              <Card key={post.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {post.titulny_obrazok ? (
                      <img
                        src={post.titulny_obrazok}
                        alt={post.nazov}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{post.nazov}</h3>
                      {post.publikovany ? (
                        <Badge className="bg-green-100 text-green-800">Publikovaný</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Koncept</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.perex}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleGenerate(post.id)}
                    disabled={isProcessing}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generujem...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generovať AI obrázok
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}