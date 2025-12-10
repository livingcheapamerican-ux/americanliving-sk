import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Eye, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function BlogDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', postId],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({ id: postId });
      return posts[0] || null;
    },
    enabled: !!postId
  });

  const updateViewsMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.update(id, {
      pocet_zobrazeni: (post?.pocet_zobrazeni || 0) + 1
    })
  });

  useEffect(() => {
    if (post?.id) {
      updateViewsMutation.mutate(post.id);
    }
  }, [post?.id]);

  useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.nazov} | American Living Blog`;
      
      const setMetaTag = (selector, attribute, attributeValue, content) => {
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, attributeValue);
          document.head.appendChild(tag);
        }
        tag.content = content;
      };

      const metaDescription = post.meta_description || post.perex;
      setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', post.nazov);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', post.titulny_obrazok);
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Článok nenájdený</h2>
          <Link to={createPageUrl("Blog")}>
            <Button className="bg-primary">Späť na blog</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const kategorieLabels = {
    novinky: "Novinky",
    tipy: "Tipy a rady",
    realizacie: "Realizácie",
    technologie: "Technológie"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť na blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.nazov}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {post.perex}
            </p>
            
            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.autor}
              </div>
              {post.datum_publikacie && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.datum_publikacie), 'd. MMMM yyyy', { locale: sk })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {post.pocet_zobrazeni || 0} zobrazení
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={post.titulny_obrazok}
              alt={post.nazov}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Content */}
          <Card className="p-8 mb-8">
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
      </div>
    </div>
  );
}