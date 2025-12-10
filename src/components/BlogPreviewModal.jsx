import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function BlogPreviewModal({ post, isOpen, onClose }) {
  if (!post) return null;

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
            <Badge className="bg-primary text-white mb-3">
              {kategorieLabels[post.kategoria]}
            </Badge>
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
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <img
              src={post.titulny_obrazok}
              alt={post.nazov}
              className="w-full h-auto object-cover"
            />
          </div>

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