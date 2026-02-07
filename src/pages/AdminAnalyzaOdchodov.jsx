import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingDown, AlertTriangle, ExternalLink, Users, 
  MousePointer, Smartphone, Monitor, RefreshCw, ArrowDown,
  AlertCircle, Info, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAnalyzaOdchodov() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: analysisData, isLoading, refetch } = useQuery({
    queryKey: ['user-dropoff-analysis'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeUserDropoff', {});
      return response.data;
    },
    staleTime: 300000, // 5 min
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzujem dáta zo session recordera...</p>
        </div>
      </div>
    );
  }

  const { analysis, totalEvents, totalSessions, period, recommendations } = analysisData || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analýza odchodov zákazníkov
            </h1>
            <p className="text-gray-600">
              Kde návštevníci strácajú záujem a opúšťajú web (za posledných {period})
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Obnoviť
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalSessions?.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MousePointer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Udalosti</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents?.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analysisData?.sessionAnalysis?.totalSessions > 0 
                    ? ((analysisData.sessionAnalysis.bouncedSessions / analysisData.sessionAnalysis.totalSessions) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg. čas</p>
                <p className="text-2xl font-bold text-green-600">
                  {analysisData?.sessionAnalysis?.avgDuration || 0}s
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <ArrowDown className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg. scroll</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {analysisData?.sessionAnalysis?.avgScrollDepth || 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MousePointer className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg. kliky</p>
                <p className="text-2xl font-bold text-pink-600">
                  {analysisData?.sessionAnalysis?.avgClicksPerSession || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <Card className="mb-8 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="bg-red-100 border-b-2 border-red-300">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                🔥 Kritické nálezy - ČO TREBA VYLEPŠIŤ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Alert 
                    key={idx}
                    className={
                      rec.severity === 'critical' ? 'border-red-500 bg-red-100 shadow-lg' :
                      rec.severity === 'high' ? 'border-red-300 bg-red-50' : 
                      rec.severity === 'medium' ? 'border-orange-300 bg-orange-50' :
                      'border-blue-300 bg-blue-50'
                    }
                  >
                    <div className="flex items-start gap-3">
                      {rec.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                      {rec.severity === 'high' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                      {rec.severity === 'medium' && <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />}
                      {rec.severity === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                      
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-2 text-gray-900">
                          {rec.issue}
                        </div>
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border">
                          💡 <strong>Odporúčania:</strong><br/>
                          {rec.suggestion}
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Analytics - Detailnejšie metriky */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">⏱️ Priemerný čas na stránke</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {analysisData?.sessionAnalysis?.avgDuration}s
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {parseFloat(analysisData?.sessionAnalysis?.avgDuration) < 30 
                  ? '⚠️ Príliš krátko - návštevníci rýchlo odchádzajú'
                  : '✅ Dobrý čas'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📄 Priemerný počet stránok</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {analysisData?.sessionAnalysis?.avgPagesVisited}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {parseFloat(analysisData?.sessionAnalysis?.avgPagesVisited) < 2 
                  ? '⚠️ Nízke - navigácia nie je jasná'
                  : '✅ Dobré'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📜 Priemerná scroll depth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">
                {analysisData?.sessionAnalysis?.avgScrollDepth}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {parseFloat(analysisData?.sessionAnalysis?.avgScrollDepth) < 30 
                  ? '🚨 Kritické - návštevníci neskrolujú!'
                  : parseFloat(analysisData?.sessionAnalysis?.avgScrollDepth) < 50 
                    ? '⚠️ Nízke'
                    : '✅ Dobré'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🖱️ Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {analysisData?.sessionAnalysis?.avgEngagementScore}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {parseFloat(analysisData?.sessionAnalysis?.avgEngagementScore) < 30 
                  ? '⚠️ Nízka angažovanosť'
                  : '✅ Dobrá angažovanosť'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Conversion Funnel - Kde odchádzajú zákazníci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis?.funnelData?.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{step.step}</span>
                        <span className="text-2xl font-bold text-primary">{step.visitors}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-500"
                          style={{ 
                            width: `${analysis.funnelData[0].visitors > 0 ? (step.visitors / analysis.funnelData[0].visitors * 100) : 0}%` 
                          }}
                        />
                      </div>
                      {parseFloat(step.dropoffRate) > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <ArrowDown className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-semibold">
                            Dropoff: {step.dropoffRate}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stránky s najvyšším bounce rate */}
        <Card className="mb-8 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              🟠 Stránky s najvyšším bounce rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {analysis?.pagesWithBounceRate && analysis.pagesWithBounceRate.length > 0 ? (
              <div className="space-y-3">
                {analysis.pagesWithBounceRate.map((page, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${
                    idx === 0 ? 'bg-orange-100 border-2 border-orange-300' : 'bg-gray-50'
                  }`}>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{page.url}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600">
                        <span>{page.entries} vstupov</span>
                        <span>Avg. čas: {page.avgTimeSpent}s</span>
                        <span>Avg. scroll: {page.avgScrollDepth}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${parseFloat(page.bounceRate) > 70 ? 'text-red-600' : 'text-orange-600'}`}>
                        {page.bounceRate}%
                      </p>
                      <p className="text-xs text-gray-500">bounce</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Žiadne dáta k dispozícii</p>
            )}
          </CardContent>
        </Card>

        {/* Top Exit Pages (zo sessions - presnejšie) */}
        <Card className="mb-8 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <TrendingDown className="w-5 h-5 text-red-600" />
              🔴 Kde zákazníci NAJČASTEJŠIE odchádzajú (Exit Pages)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {analysis?.topSessionExitPages?.map((page, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    idx === 0 ? 'bg-red-100 border-2 border-red-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`font-black text-2xl ${idx === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 block">{page.url}</span>
                      <span className="text-sm text-gray-600">{page.percentage}% všetkých sessions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${idx === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {page.count}
                    </span>
                    <p className="text-xs text-gray-500">odchodov</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Alert className="mt-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>⚠️ Čo to znamená:</strong> Toto sú stránky, kde návštevníci ukončili svoju session a odišli z webu. 
                Ak je nejaká stránka vysoko, je to problémová oblasť!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Landing Pages + Bounce Rate */}
        <Card className="mb-8 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              🔵 Landing Pages - Kde návštevníci začínajú
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {analysis?.topLandingPages?.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">{page.url}</span>
                    <span className="text-sm text-gray-600">{page.count} vstupov</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${parseFloat(page.bounceRate) > 70 ? 'text-red-600' : parseFloat(page.bounceRate) > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                      {page.bounceRate}%
                    </p>
                    <p className="text-xs text-gray-500">bounce rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clicks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-green-600" />
              Top 10 kliknutí - Na čo používatelia klikajú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis?.topClicks?.map((click, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 flex-1 truncate">{click.button}</span>
                  <span className="text-xl font-bold text-green-600">{click.clicks}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Rozdelenie podľa zariadení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analysis?.deviceStats || {}).map(([device, count]) => (
                <div key={device} className="text-center p-4 bg-gray-50 rounded-lg">
                  {device === 'mobile' ? (
                    <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  ) : device === 'desktop' ? (
                    <Monitor className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-gray-600 capitalize">{device}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UTM / Zdroje návštevnosti */}
        {analysis?.utmExitRates && analysis.utmExitRates.length > 0 && (
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <ExternalLink className="w-5 h-5 text-purple-600" />
                🟣 Zdroje návštevnosti - Odkiaľ prichádzajú zákazníci
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {analysis.utmExitRates.map((utm, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{utm.source}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600">
                        <span>{utm.sessions} sessions</span>
                        <span>Avg. čas: {utm.avgDuration}s</span>
                        <span>Avg. stránky: {utm.avgPages}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${parseFloat(utm.bounceRate) > 70 ? 'text-red-600' : parseFloat(utm.bounceRate) > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                        {utm.bounceRate}%
                      </p>
                      <p className="text-xs text-gray-500">bounce rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info box */}
        <Alert className="mt-8 border-blue-200 bg-blue-50">
          <Info className="w-4 h-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Ako interpretovať dáta:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Bounce rate</strong> - % návštevníkov, ktorí opustili stránku bez interakcie</li>
              <li><strong>Exit rate</strong> - % návštevníkov, ktorí z danej stránky odišli (môže byť normálne)</li>
              <li><strong>Dropoff rate</strong> - % návštevníkov, ktorí nepokračovali na ďalší krok vo funnel</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}