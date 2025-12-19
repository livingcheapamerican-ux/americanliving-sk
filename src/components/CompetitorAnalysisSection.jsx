import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

export default function CompetitorAnalysisSection({ konkurencnaAnalyza }) {
  if (!konkurencnaAnalyza || !konkurencnaAnalyza.hlavni_konkurenti) return null;

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-600" />
          🎯 Konkurenčná Analýza
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Súhrn */}
        {konkurencnaAnalyza.sumar && (
          <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
            <p className="text-sm font-semibold mb-2">📋 Súhrn konkurenčnej situácie:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{konkurencnaAnalyza.sumar}</p>
          </div>
        )}

        {/* Hlavní konkurenti */}
        <div>
          <h4 className="font-bold text-base mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            Hlavní online konkurenti
          </h4>
          <div className="space-y-3">
            {konkurencnaAnalyza.hlavni_konkurenti.map((konkurent, idx) => (
              <Card key={idx} className="bg-white border-2 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-bold text-lg">{konkurent.nazov}</h5>
                    <Badge className="bg-orange-600 text-white">
                      #{idx + 1}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">💰 Odhadovaný budget</p>
                      <p className="text-sm font-bold">{konkurent.odhadovany_budget_mesacne}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-purple-800 mb-1">📢 Najčastejšie kanály</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {konkurent.najcastejsie_kanaly?.map((kanal, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {kanal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50 p-3 rounded-lg mb-3">
                    <p className="text-xs font-semibold text-pink-800 mb-1">🎨 Typické kreatívy</p>
                    <p className="text-sm text-gray-700">{konkurent.typicke_kreativy}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Silné stránky
                      </p>
                      <ul className="space-y-1">
                        {konkurent.silne_stranky?.map((silna, i) => (
                          <li key={i} className="text-xs text-gray-700">✓ {silna}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Slabé stránky
                      </p>
                      <ul className="space-y-1">
                        {konkurent.slabe_stranky?.map((slaba, i) => (
                          <li key={i} className="text-xs text-gray-700">✗ {slaba}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Naše výhody a príležitosti */}
        <div className="grid md:grid-cols-2 gap-4">
          {konkurencnaAnalyza.nase_konkurencne_vyhody?.length > 0 && (
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-300">
              <h5 className="font-bold text-sm mb-3 flex items-center gap-2 text-green-900">
                <TrendingUp className="w-4 h-4" />
                💪 Naše konkurenčné výhody
              </h5>
              <ul className="space-y-2">
                {konkurencnaAnalyza.nase_konkurencne_vyhody.map((vyhoda, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{vyhoda}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {konkurencnaAnalyza.prilezitosti?.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 p-4 rounded-lg border-2 border-yellow-300">
              <h5 className="font-bold text-sm mb-3 flex items-center gap-2 text-yellow-900">
                <Lightbulb className="w-4 h-4" />
                💡 Príležitosti na trhu
              </h5>
              <ul className="space-y-2">
                {konkurencnaAnalyza.prilezitosti.map((prilezitost, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{prilezitost}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}