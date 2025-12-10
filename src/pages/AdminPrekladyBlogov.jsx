import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Languages, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminPrekladyBlogov() {
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date'),
    initialData: []
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-red-600">Prístup zamietnutý. Iba administrátori.</p>
        </Card>
      </div>
    );
  }

  const translatedCount = posts.filter(p => p.prelozene).length;
  const untranslatedCount = posts.filter(p => !p.prelozene).length;

  const handleBulkTranslate = async () => {
    setTranslating(true);
    setProgress({ current: 0, total: untranslatedCount });

    try {
      const response = await base44.functions.invoke('bulkTranslateBlogPosts');
      
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      toast.success(`Preklad dokončený: ${response.data.results.translated} blogov preložených`);
      setProgress(null);
    } catch (error) {
      toast.error('Chyba pri hromadnom preklade: ' + error.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateSingle = async (postId) => {
    try {
      await base44.functions.invoke('translateBlogPost', { postId });
      queryClient.invalidateQueries({ queryKey: ['all-blog-posts'] });
      toast.success('Blog preložený');
    } catch (error) {
      toast.error('Chyba pri preklade: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Preklady blogových článkov</h1>
          <p className="text-gray-600">Automatický preklad všetkých blogov do 10 jazykov pomocou AI</p>
        </div>

        {/* Štatistiky */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkový počet blogov</p>
                <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preložené</p>
                <p className="text-3xl font-bold text-green-600">{translatedCount}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nepreložené</p>
                <p className="text-3xl font-bold text-orange-600">{untranslatedCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Bulk preklad */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Hromadný preklad všetkých blogov</h2>
              <p className="text-gray-600 mb-4">
                Automaticky preloží všetky blogy do 10 jazykov: angličtina, maďarčina, poľština, ukrajinčina, 
                nemčina, francúzština, srbčina, chorvátčina, gréčtina
              </p>
              
              {progress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Prekladám blogy...</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <Progress value={(progress.current / progress.total) * 100} />
                </div>
              )}

              <Button
                onClick={handleBulkTranslate}
                disabled={translating || untranslatedCount === 0}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {translating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Prekladám...
                  </>
                ) : (
                  <>
                    <Languages className="w-5 h-5 mr-2" />
                    Preložiť všetky blogy ({untranslatedCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Zoznam blogov */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Zoznam blogových článkov</h2>
          
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{post.nazov}</h3>
                    {post.prelozene ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Preložené
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Nepreložené
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.perex}</p>
                  
                  {/* Zobraz dostupné jazyky */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Badge variant="outline" className="bg-blue-50">SK</Badge>
                    {post.nazov_en && <Badge variant="outline" className="bg-green-50">EN</Badge>}
                    {post.nazov_hu && <Badge variant="outline" className="bg-green-50">HU</Badge>}
                    {post.nazov_pl && <Badge variant="outline" className="bg-green-50">PL</Badge>}
                    {post.nazov_uk && <Badge variant="outline" className="bg-green-50">UK</Badge>}
                    {post.nazov_de && <Badge variant="outline" className="bg-green-50">DE</Badge>}
                    {post.nazov_fr && <Badge variant="outline" className="bg-green-50">FR</Badge>}
                    {post.nazov_sr && <Badge variant="outline" className="bg-green-50">SR</Badge>}
                    {post.nazov_hr && <Badge variant="outline" className="bg-green-50">HR</Badge>}
                    {post.nazov_el && <Badge variant="outline" className="bg-green-50">EL</Badge>}
                  </div>
                </div>
                
                {!post.prelozene && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-purple-600 hover:bg-purple-50"
                    onClick={() => handleTranslateSingle(post.id)}
                  >
                    <Languages className="w-4 h-4 mr-2" />
                    Preložiť
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {posts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Zatiaľ žiadne blogové články.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}