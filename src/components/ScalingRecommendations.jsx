import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Facebook, Search, AlertTriangle } from "lucide-react";

export default function ScalingRecommendations({ scalingOdporucania }) {
  if (!scalingOdporucania) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          📈 Scaling Odporúčania
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Facebook Scaling */}
        {scalingOdporucania.facebook_scaling && (
          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <h4 className="font-bold text-base mb-3 flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              Facebook / Instagram Scaling
            </h4>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">📊 Aktuálny budget</p>
                <p className="text-sm font-bold">{scalingOdporucania.facebook_scaling.aktualny_budget}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-1">🚀 Scaling plán</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {scalingOdporucania.facebook_scaling.odporucany_scaling_plan}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-purple-800 mb-1">⬆️ Maximálne zvýšenie</p>
                <p className="text-sm font-bold">{scalingOdporucania.facebook_scaling.maximalne_zvysenie}</p>
              </div>
              {scalingOdporucania.facebook_scaling.varovanie && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-800 mb-1">⚠️ Varovanie</p>
                      <p className="text-sm text-red-700">{scalingOdporucania.facebook_scaling.varovanie}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Ads Scaling */}
        {scalingOdporucania.google_ads_scaling && (
          <div className="bg-white p-4 rounded-lg border-2 border-green-300">
            <h4 className="font-bold text-base mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-green-600" />
              Google Ads Scaling
            </h4>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-1">📊 Aktuálny budget</p>
                <p className="text-sm font-bold">{scalingOdporucania.google_ads_scaling.aktualny_budget}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">🚀 Scaling plán</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {scalingOdporucania.google_ads_scaling.odporucany_scaling_plan}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-purple-800 mb-1">⬆️ Maximálne zvýšenie</p>
                <p className="text-sm font-bold">{scalingOdporucania.google_ads_scaling.maximalne_zvysenie}</p>
              </div>
              {scalingOdporucania.google_ads_scaling.varovanie && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-800 mb-1">⚠️ Varovanie</p>
                      <p className="text-sm text-red-700">{scalingOdporucania.google_ads_scaling.varovanie}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}