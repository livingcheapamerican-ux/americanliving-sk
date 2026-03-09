import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function LokaciaDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: lokacia, isLoading } = useQuery({
    queryKey: ['lokacia', slug],
    queryFn: async () => {
      const results = await base44.entities.LokaciaSEO.filter({ slug });
      return results[0] || null;
    },
    enabled: !!slug
  });

  const { data: domy } = useQuery({
    queryKey: ['domy-v-lokalite', lokacia?.nazov_mesta],
    queryFn: async () => {
      if (!lokacia?.nazov_mesta) return [];
      // Fetch houses - v reálnom scenári by si to filtroval podľa lokality
      const allHouses = await base44.entities.Dom.list();
      return allHouses.filter(dom => dom.verejny !== false);
    },
    enabled: !!lokacia?.nazov_mesta
  });

  useEffect(() => {
    if (lokacia) {
      document.title = lokacia.meta_title || `${lokacia.nazov_mesta} | American Living`;
      
      const setMetaTag = (selector, attribute, attributeValue, content) => {
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, attributeValue);
          document.head.appendChild(tag);
        }
        tag.content = content;
      };

      setMetaTag('meta[name="description"]', 'name', 'description', lokacia.meta_description || '');
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', lokacia.meta_title || lokacia.nazov_mesta);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', lokacia.meta_description || '');
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
    }

    return () => {
      const metaTags = document.querySelectorAll('meta[property="og:title"], meta[property="og:description"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [lokacia]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!lokacia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Lokalita nenájdená</h2>
          <p className="text-gray-500 mb-6">Skúste sa vrátiť na domovskú stránku</p>
          <Link to={createPageUrl("Domov")}>
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť na domov
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{lokacia.meta_title}</title>
        <meta name="description" content={lokacia.meta_description} />
        <meta property="og:title" content={lokacia.meta_title} />
        <meta property="og:description" content={lokacia.meta_description} />
      </Helmet>

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Link to={createPageUrl("Domov")}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Späť
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Modulárne a montované domy {lokacia.nazov_mesta}
            </h1>
          </div>

          {/* AI Generated Content */}
          <Card className="p-6 md:p-8 mb-12 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="prose prose-lg max-w-none">
              {lokacia.unikany_text_o_lokalite ? (
                <div className="text-gray-700 leading-relaxed space-y-4 whitespace-pre-wrap">
                  {lokacia.unikany_text_o_lokalite}
                </div>
              ) : (
                <p className="text-gray-600 italic">Obsah sa generuje...</p>
              )}
            </div>
          </Card>

          {/* Houses Section */}
          {domy && domy.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="w-8 h-8 text-primary" />
                Dostupné modely pre {lokacia.nazov_mesta}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domy.map((dom) => (
                  <motion.div
                    key={dom.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="w-full h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={dom.hlavny_obrazok}
                          alt={dom.nazov}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{dom.nazov}</h3>
                        <p className="text-sm text-gray-600 mb-1">{dom.vyrobca}</p>
                        <div className="flex gap-2 mb-4 flex-wrap text-xs">
                          {dom.zastavana_plocha && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                              {dom.zastavana_plocha}m²
                            </span>
                          )}
                          {dom.pocet_izieb && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                              {dom.pocet_izieb} izby
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-primary mb-4">
                          od {dom.zakladna_cena?.toLocaleString('sk-SK')} €
                        </p>
                        <Link
                          to={`${createPageUrl("DetailDomu")}?id=${dom.id}`}
                          className="mt-auto"
                        >
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            Zobraziť detaily
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}