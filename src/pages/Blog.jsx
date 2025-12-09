import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Eye, Search, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategoria, setSelectedKategoria] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ publikovany: true }, '-datum_publikacie'),
    initialData: []
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin';

  const kategorieLabels = {
    novinky: "Novinky",
    tipy: "Tipy a rady",
    realizacie: "Realizácie",
    technologie: "Technológie"
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.nazov.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.perex.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategoria = selectedKategoria === "all" || post.kategoria === selectedKategoria;
    return matchesSearch && matchesKategoria;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam články...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Novinky, tipy a užitočné informácie o modulárnych domoch
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Hľadať články..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedKategoria === "all" ? "default" : "outline"}
              onClick={() => setSelectedKategoria("all")}
              className={selectedKategoria === "all" ? "bg-primary" : ""}
            >
              Všetky
            </Button>
            {Object.entries(kategorieLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedKategoria === key ? "default" : "outline"}
                onClick={() => setSelectedKategoria(key)}
                className={selectedKategoria === key ? "bg-primary" : ""}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <div className="mb-6">
            <Link to={createPageUrl("AdminBlog")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Správa blogu
              </Button>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">Zatiaľ žiadne články.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl("BlogDetail") + `?id=${post.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all h-full cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.titulny_obrazok}
                        alt={post.nazov}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-white">
                          {kategorieLabels[post.kategoria]}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {post.nazov}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.perex}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.datum_publikacie && format(new Date(post.datum_publikacie), 'd. M. yyyy', { locale: sk })}
                          </div>
                          {post.pocet_zobrazeni > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {post.pocet_zobrazeni}
                            </div>
                          )}
                        </div>
                      </div>
                      {post.tagy && post.tagy.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {post.tagy.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}