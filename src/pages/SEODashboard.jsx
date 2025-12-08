import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, TrendingDown, Eye, Clock, Search, AlertTriangle, 
  CheckCircle, Download, RefreshCw, BarChart3, Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function SEODashboard() {
  const [selectedPage, setSelectedPage] = useState(null);
  const queryClient = useQueryClient();

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['seo-analytics'],
    queryFn: () => base44.entities.SEOAnalytika.list('-pocet_navstev', 100),
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ['seo-keywords'],
    queryFn: () => base44.entities.SEOKeyword.list('-search_volume', 50),
  });

  const analyzeMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('analyzeSEO', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-analytics'] });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (format) => base44.functions.invoke('generateSEOReport', { format }),
  });

  // Calculate statistics
  const totalVisits = analytics.reduce((sum, a) => sum + (a.pocet_navstev || 0), 0);
  const avgSEOScore = analytics.length > 0 
    ? Math.round(analytics.reduce((sum, a) => sum + (a.seo_score || 0), 0) / analytics.length)
    : 0;
  const avgBounceRate = analytics.length > 0
    ? Math.round(analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length)
    : 0;
  const totalIssues = analytics.reduce((sum, a) => sum + (a.issues?.length || 0), 0);

  const handleDownloadReport = async (format) => {
    const result = await generateReportMutation.mutateAsync(format);
    
    if (format === 'html' && result.data) {
      const blob = new Blob([result.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Dashboard</h1>
          <p className="text-gray-600">Komplexná analýza a optimalizácia SEO</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalVisits.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Celkové návštevy</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <Badge className={getScoreColor(avgSEOScore)}>{avgSEOScore}</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgSEOScore}%</div>
              <div className="text-sm text-gray-600">Priemerné SEO skóre</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-gray-500">{avgBounceRate}%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgBounceRate}%</div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <Badge variant="destructive">{totalIssues}</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalIssues}</div>
              <div className="text-sm text-gray-600">SEO problémy</div>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => handleDownloadReport('html')}
            disabled={generateReportMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Stiahnuť HTML Report
          </Button>
          <Button 
            onClick={() => handleDownloadReport('json')}
            disabled={generateReportMutation.isPending}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Stiahnuť JSON Report
          </Button>
          <Button 
            onClick={() => queryClient.invalidateQueries(['seo-analytics'])}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Obnoviť dáta
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pages Analysis */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analýza stránok
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {analytics.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPage(page)}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{page.page_title}</div>
                      <div className="text-sm text-gray-500 truncate">{page.url}</div>
                    </div>
                    <Badge className={getScoreColor(page.seo_score)}>
                      {page.seo_score || 0}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {page.pocet_navstev || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.round(page.avg_time_on_page || 0)}s
                    </span>
                    {page.issues?.length > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {page.issues.length}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Kľúčové slová
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {keywords.map((keyword, index) => (
                <motion.div
                  key={keyword.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{keyword.keyword}</div>
                      <div className="text-sm text-gray-500">
                        Objem: {keyword.search_volume?.toLocaleString() || 'N/A'} / mesiac
                      </div>
                    </div>
                    <Badge variant={
                      keyword.competition === 'low' ? 'default' :
                      keyword.competition === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {keyword.competition || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    {keyword.current_position && (
                      <span>Pozícia: #{keyword.current_position}</span>
                    )}
                    {keyword.ctr && (
                      <span>CTR: {keyword.ctr}%</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Selected Page Details */}
        {selectedPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPage.page_title}</h2>
                  <p className="text-gray-600">{selectedPage.url}</p>
                </div>
                <Button onClick={() => setSelectedPage(null)} variant="outline">
                  Zavrieť
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedPage.pocet_navstev || 0}</div>
                  <div className="text-sm text-gray-600">Návštevy</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedPage.seo_score || 0}</div>
                  <div className="text-sm text-gray-600">SEO Skóre</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(selectedPage.bounce_rate || 0)}%</div>
                  <div className="text-sm text-gray-600">Bounce Rate</div>
                </div>
              </div>

              {selectedPage.issues && selectedPage.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">SEO Problémy a odporúčania</h3>
                  <div className="space-y-3">
                    {selectedPage.issues.map((issue, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          issue.type === 'error' ? 'bg-red-50 border-red-500' :
                          issue.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {issue.type === 'error' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : issue.type === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-semibold">{issue.message}</div>
                            <div className="text-sm text-gray-600 mt-1">{issue.recommendation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPage.klucove_slova && selectedPage.klucove_slova.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3">Kľúčové slová na stránke</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPage.klucove_slova.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}