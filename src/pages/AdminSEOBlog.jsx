import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSEOBlog() {
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-blog-posts-seo'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
    initialData: []
  });

  const generateSEOMutation = useMutation({
    mutationFn: async (postId) => {
      const response = await base44.functions.invoke('generateBlogSEO', { postId });
      return response.data;
    },
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts-seo'] });
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      toast.success('SEO metadata vygenerované');
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
    generateSEOMutation.mutate(postId);
  };

  const handleGenerateAll = async () => {
    const postsWithoutSEO = posts.filter(post => !post.meta_title || !post.meta_description);
    
    if (postsWithoutSEO.length === 0) {
      toast.info('Všetky články majú SEO metadata');
      return;
    }

    toast.info(`Generujem SEO pre ${postsWithoutSEO.length} článkov...`);

    for (const post of postsWithoutSEO) {
      setProcessingIds(prev => new Set(prev).add(post.id));
      try {
        await generateSEOMutation.mutateAsync(post.id);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between requests
      } catch (error) {
        console.error('Error generating SEO for post:', post.id, error);
      }
    }

    toast.success('Dokončené!');
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

  const postsWithoutSEO = posts.filter(post => !post.meta_title || !post.meta_description);
  const postsWithSEO = posts.filter(post => post.meta_title && post.meta_description);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SEO Metadata pre Blog
          </h1>
          <p className="text-gray-600">
            Automaticky generuj SEO metadata pre blogové články pomocou AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkom článkov</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">So SEO</p>
                <p className="text-2xl font-bold text-gray-900">{postsWithSEO.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bez SEO</p>
                <p className="text-2xl font-bold text-gray-900">{postsWithoutSEO.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {postsWithoutSEO.length > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vygenerovať SEO pre všetky články
                </h3>
                <p className="text-sm text-gray-600">
                  {postsWithoutSEO.length} článkov nemá SEO metadata
                </p>
              </div>
              <Button
                onClick={handleGenerateAll}
                disabled={generateSEOMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generovať všetky
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {posts.map((post) => {
            const hasSEO = post.meta_title && post.meta_description;
            const isProcessing = processingIds.has(post.id);

            return (
              <Card key={post.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{post.nazov}</h3>
                      {hasSEO ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          SEO OK
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Bez SEO
                        </Badge>
                      )}
                    </div>

                    {hasSEO ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Meta Title:</span>
                          <p className="text-gray-600">{post.meta_title}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Meta Description:</span>
                          <p className="text-gray-600">{post.meta_description}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Tento článok nemá SEO metadata. Klikni na tlačidlo pre automatické vygenerovanie.
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleGenerate(post.id)}
                    disabled={isProcessing}
                    size="sm"
                    className={hasSEO ? "bg-gray-600 hover:bg-gray-700" : "bg-primary hover:bg-primary/90"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generujem...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {hasSEO ? 'Regenerovať' : 'Generovať SEO'}
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