import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function GoogleAdsComparison() {
  const [syncing, setSyncing] = useState(false);

  const { data: googleAdsMetrics = [], refetch } = useQuery({
    queryKey: ['google-ads-metrics'],
    queryFn: () => base44.entities.GoogleAdsMetrics.list('-last_synced', 50)
  });

  const { data: socialMetrics = [] } = useQuery({
    queryKey: ['social-media-metrics-comparison'],
    queryFn: () => base44.entities.SocialMediaMetrics.list('-last_updated', 50)
  });

  const syncGoogleAds = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('googleAdsIntegration', {
        action: 'fetch_campaigns',
        date_range_start: '2025-01-01',
        date_range_end: '2025-12-31'
      });

      if (response.data.success) {
        toast.success(`✅ Synchronizovaných ${response.data.campaigns_synced} Google Ads kampaní`);
        refetch();
      } else {
        toast.error(response.data.error || 'Chyba pri synchronizácii');
      }
    } catch (error) {
      if (error.response?.data?.needsAuth) {
        toast.error('⚠️ Nastavte Google Ads API credentials v Settings → Environment Variables');
      } else {
        toast.error('Chyba: ' + error.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Porovnávacie dáta
  const comparisonData = [
    {
      name: 'Dosah',
      'Google Ads': googleAdsMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
      'Social Media': socialMetrics.reduce((sum, m) => sum + (m.reach || 0), 0)
    },
    {
      name: 'Kliknutia',
      'Google Ads': googleAdsMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
      'Social Media': socialMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0)
    },
    {
      name: 'Konverzie',
      'Google Ads': googleAdsMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
      'Social Media': socialMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0)
    },
    {
      name: 'Náklady (€)',
      'Google Ads': googleAdsMetrics.reduce((sum, m) => sum + (m.cost || 0), 0),
      'Social Media': socialMetrics.reduce((sum, m) => sum + (m.cost || 0), 0)
    }
  ];

  const totalGoogleAdsCost = googleAdsMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalSocialCost = socialMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalGoogleAdsConv = googleAdsMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const totalSocialConv = socialMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);

  const googleAdsCPA = totalGoogleAdsConv > 0 ? (totalGoogleAdsCost / totalGoogleAdsConv).toFixed(2) : 0;
  const socialCPA = totalSocialConv > 0 ? (totalSocialCost / totalSocialConv).toFixed(2) : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            📊 Google Ads vs Social Media
          </CardTitle>
          <Button
            onClick={syncGoogleAds}
            disabled={syncing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Synchronizujem...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Google Ads
              </>
            )}
          </Button>
        </div>
        {googleAdsMetrics.length === 0 && (
          <div className="bg-yellow-100 p-3 rounded border border-yellow-300 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-900">
                Zatiaľ žiadne Google Ads dáta. Kliknite na "Sync Google Ads" pre načítanie kampaní.
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Comparison Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
            <h4 className="font-bold text-sm text-blue-900 mb-3">🔍 Google Ads</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Kampane:</span>
                <span className="font-bold">{googleAdsMetrics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Náklady:</span>
                <span className="font-bold">€{totalGoogleAdsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Konverzie:</span>
                <span className="font-bold">{totalGoogleAdsConv}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg CPA:</span>
                <span className="font-bold text-orange-600">€{googleAdsCPA}</span>
              </div>
            </div>
          </div>

          <div className="bg-pink-100 p-4 rounded-lg border-2 border-pink-300">
            <h4 className="font-bold text-sm text-pink-900 mb-3">📱 Social Media</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Kampane:</span>
                <span className="font-bold">{socialMetrics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Náklady:</span>
                <span className="font-bold">€{totalSocialCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Konverzie:</span>
                <span className="font-bold">{totalSocialConv}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg CPA:</span>
                <span className="font-bold text-orange-600">€{socialCPA}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        {googleAdsMetrics.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Google Ads" fill="#3b82f6" />
              <Bar dataKey="Social Media" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Winner Analysis */}
        {googleAdsMetrics.length > 0 && socialMetrics.length > 0 && (
          <div className="mt-6 bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
            <h4 className="font-bold text-sm text-purple-900 mb-2">🏆 Výkonnostné porovnanie</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600 mb-1">Lepšie CPA:</p>
                <Badge className={parseFloat(googleAdsCPA) < parseFloat(socialCPA) ? 'bg-blue-600' : 'bg-pink-600'}>
                  {parseFloat(googleAdsCPA) < parseFloat(socialCPA) ? '🔍 Google Ads' : '📱 Social Media'}
                  {' '}(€{Math.min(parseFloat(googleAdsCPA), parseFloat(socialCPA))})
                </Badge>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Viac konverzií:</p>
                <Badge className={totalGoogleAdsConv > totalSocialConv ? 'bg-blue-600' : 'bg-pink-600'}>
                  {totalGoogleAdsConv > totalSocialConv ? '🔍 Google Ads' : '📱 Social Media'}
                  {' '}({Math.max(totalGoogleAdsConv, totalSocialConv)})
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}