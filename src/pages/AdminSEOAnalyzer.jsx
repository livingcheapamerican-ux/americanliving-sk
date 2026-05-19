import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Smartphone,
  Monitor,
  Gauge,
  Sparkles,
  Copy,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AEOGEOAuditor from "../components/seo/AEOGEOAuditor";

export default function AdminSEOAnalyzer() {
  const [url, setUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  const { data: seoData = [], isLoading: loadingSEO } = useQuery({
    queryKey: ['seo-analytika'],
    queryFn: () => base44.entities.SEOAnalytika.list('-last_analyzed', 50),
    initialData: [],
    enabled: isAdmin
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('analyzeSEO', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-analytika'] });
      toast.success('SEO analýza dokončená!');
      setUrl("");
      setPageTitle("");
      setPageContent("");
    },
    onError: (error) => {
      toast.error('Chyba pri analýze: ' + error.message);
    }
  });

  const handleAnalyze = () => {
    if (!url || !pageTitle) {
      toast.error('URL a Page Title sú povinné');
      return;
    }
    analyzeMutation.mutate({ url, pageTitle, pageContent });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopírované do schránky');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 AI SEO Analyzer</h1>
          <p className="text-gray-600">Analyzuj a optimalizuj SEO tvojich stránok pomocou AI</p>
        </div>

        <Tabs defaultValue="classic" className="w-full mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="classic">🔍 Klasické SEO</TabsTrigger>
            <TabsTrigger value="aeo_geo">🤖 AEO & GEO Audítor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classic" className="space-y-6">
            {/* Formulár na analýzu */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Nová SEO Analýza
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">URL stránky *</label>
                  <Input
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Aktuálny Page Title *</label>
                  <Input
                    placeholder="Názov stránky"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Obsah stránky (voliteľné)</label>
                  <Textarea
                    placeholder="Skopíruj hlavný textový obsah stránky pre lepšiu AI analýzu..."
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      AI analyzuje...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyzovať s AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="aeo_geo">
            <AEOGEOAuditor />
          </TabsContent>
        </Tabs>

        {/* Výsledky analýz */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">📊 História SEO Analýz</h2>
          
          {loadingSEO ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítavam...</p>
            </Card>
          ) : seoData.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Zatiaľ žiadne SEO analýzy</p>
            </Card>
          ) : (
            seoData.map((seo) => (
              <Card key={seo.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{seo.page_title}</h3>
                    <p className="text-sm text-gray-500">{seo.url}</p>
                  </div>
                  <Badge className={`text-lg ${
                    seo.seo_score >= 80 ? 'bg-green-600' :
                    seo.seo_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  } text-white`}>
                    {seo.seo_score}/100
                  </Badge>
                </div>

                {/* AI Optimalizované Meta Tagy */}
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Optimalizovaný Title
                      </h4>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seo.ai_generated_title)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-green-800 font-medium">{seo.ai_generated_title}</p>
                    <p className="text-xs text-green-600 mt-1">{seo.ai_generated_title?.length || 0} znakov</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Optimalizovaný Description
                      </h4>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(seo.ai_generated_description)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-blue-800">{seo.ai_generated_description}</p>
                    <p className="text-xs text-blue-600 mt-1">{seo.ai_generated_description?.length || 0} znakov</p>
                  </div>
                </div>

                {/* AI Navrhnuté Kľúčové slová */}
                {seo.ai_suggested_keywords && seo.ai_suggested_keywords.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      🔑 AI Navrhnuté Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {seo.ai_suggested_keywords.map((keyword, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
                          onClick={() => copyToClipboard(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metriky výkonu */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Rýchlosť */}
                  {seo.page_load_speed && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        ⚡ Rýchlosť načítania
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            Desktop:
                          </span>
                          <span className="font-bold">{seo.page_load_speed.desktop_ms}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            Mobil:
                          </span>
                          <span className="font-bold">{seo.page_load_speed.mobile_ms}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Skóre:</span>
                          <Badge className={`${
                            seo.page_load_speed.score >= 90 ? 'bg-green-600' :
                            seo.page_load_speed.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white`}>
                            {seo.page_load_speed.score}/100
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobilná responzívnosť */}
                  {seo.mobile_responsiveness && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        📱 Mobilná Responzívnosť
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mobile Friendly:</span>
                          <span>{seo.mobile_responsiveness.is_mobile_friendly ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Viewport:</span>
                          <span>{seo.mobile_responsiveness.viewport_configured ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Text Readable:</span>
                          <span>{seo.mobile_responsiveness.text_readable ? '✅' : '❌'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Skóre:</span>
                          <Badge className={`${
                            seo.mobile_responsiveness.score >= 90 ? 'bg-green-600' :
                            seo.mobile_responsiveness.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white`}>
                            {seo.mobile_responsiveness.score}/100
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Problémy a odporúčania */}
                {seo.issues && seo.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Problémy a odporúčania</h4>
                    {seo.issues.map((issue, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border flex items-start gap-3 ${
                          issue.type === 'error' ? 'bg-red-50 border-red-200' :
                          issue.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        {issue.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                        {issue.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />}
                        {issue.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{issue.message}</p>
                          {issue.recommendation && (
                            <p className="text-xs text-gray-600 mt-1">💡 {issue.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  Analyzované: {new Date(seo.last_analyzed).toLocaleString('sk-SK')}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}