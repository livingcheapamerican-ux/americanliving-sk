import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2, Home, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import ImageWithWatermark from "../components/ImageWithWatermark";

export default function OdporucanieDomov() {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState({
    budget: 100000,
    rooms: 3,
    purpose: "",
    style: "",
    otherNeeds: ""
  });
  const [recommendations, setRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: allHouses = [] } = useQuery({
    queryKey: ['houses-all'],
    queryFn: () => base44.entities.Dom.list('poradie'),
    staleTime: 300000,
  });

  const handleGetRecommendations = async () => {
    setIsAnalyzing(true);
    setRecommendations(null);

    try {
      // Filtrovať len verejné domy
      const publicHouses = allHouses.filter(h => h.verejny !== false);

      const prompt = `Analyzuj nasledujúce preferencie klienta a odporuč 3 najvhodnejšie domy z databázy.

PREFERENCIE KLIENTA:
- Rozpočet: ${preferences.budget}€
- Počet izieb: ${preferences.rooms}
- Účel: ${preferences.purpose || 'Neuviedol'}
- Štýl/dizajn: ${preferences.style || 'Neuviedol'}
- Ďalšie požiadavky: ${preferences.otherNeeds || 'Žiadne'}

DATABÁZA DOMOV:
${JSON.stringify(publicHouses.map(h => ({
  id: h.id,
  nazov: h.nazov,
  vyrobca: h.vyrobca,
  typ_domu: h.typ_domu,
  pocet_izieb: h.pocet_izieb,
  zastavana_plocha: h.zastavana_plocha,
  uzitkova_plocha: h.uzitkova_plocha,
  terasa_plocha: h.terasa_plocha,
  zakladna_cena: h.zakladna_cena,
  energeticky_certifikat: h.energeticky_certifikat,
  celorocny: h.celorocny,
  popis: h.popis?.substring(0, 300)
})), null, 2)}

TVOJA ÚLOHA:
1. Analyzuj preferencie klienta
2. Vyber 3 najvhodnejšie domy z databázy
3. Pre každý dom vysvetli PREČO je vhodný (match s požiadavkami)
4. Zoraď od najvhodnejšieho
5. Uveď klady a potenciálne kompromisy

DÔLEŽITÉ PRAVIDLÁ:
- Počet izieb je MAXIMUM - dom s 4 izbami môže byť upravený na 3 izby
- Rozpočet je orientačný - môžeš odporučiť aj o 10-15% drahší dom ak je výrazne lepší
- Prosto House má dopravu ZDARMA
- Ticab house má individuálnu dopravu
- JAK Modules a Domki z Gór majú dopravu cca 8-10k€
- A0 upgrade pre Ticab house stojí +15-20k€

KRITICKÉ - UVEDENÁ CENA:
- zakladna_cena = ZÁKLADNÁ CENA (BEZ A0, bez základov, bez montáže)
- V "considerations" VŽDY uveď: "Zobrazená cena je základná. Pre kompletný dom s A0 certifikátom a všetkými nákladmi odporúčame použiť konfigurátor na detaile domu."
- Každý dom má vlastný konfigurátor kde si klient môže poskladať presný dom podľa svojich požiadaviek
- estimated_total_cost = odhadni realistickú cenu s bežnými doplnkami (A0 ak Ticab house, základy, montáž, doprava)

Odporuč len domy ktoré SÚ v databáze!`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  house_id: { type: "string" },
                  match_score: { type: "number" },
                  why_suitable: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  considerations: { type: "array", items: { type: "string" } },
                  estimated_total_cost: { type: "number" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error("Chyba pri generovaní odporúčaní:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHouseById = (id) => allHouses.find(h => h.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">{t('aiRecommendationSystem')}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('findYourPerfectHome')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('tellUsYourRequirements')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preferences Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                {t('yourPreferences')}
              </h2>

              <div className="space-y-6">
                {/* Rozpočet */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t('budget')}: {preferences.budget.toLocaleString('sk-SK')} €
                  </Label>
                  <Slider
                    min={40000}
                    max={200000}
                    step={5000}
                    value={[preferences.budget]}
                    onValueChange={([val]) => setPreferences({...preferences, budget: val})}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('basePriceWithoutExtras')}</p>
                </div>

                {/* Počet izieb */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t('rooms')}: {preferences.rooms}
                  </Label>
                  <Slider
                    min={1}
                    max={6}
                    step={1}
                    value={[preferences.rooms]}
                    onValueChange={([val]) => setPreferences({...preferences, rooms: val})}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('maxRoomsCanBeLess')}</p>
                </div>

                {/* Účel */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t('purposeOfUse')}
                  </Label>
                  <Input
                    placeholder={t('purposePlaceholder')}
                    value={preferences.purpose}
                    onChange={(e) => setPreferences({...preferences, purpose: e.target.value})}
                  />
                </div>

                {/* Štýl */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t('preferredStyle')}
                  </Label>
                  <Input
                    placeholder={t('stylePlaceholder')}
                    value={preferences.style}
                    onChange={(e) => setPreferences({...preferences, style: e.target.value})}
                  />
                </div>

                {/* Ďalšie požiadavky */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {t('otherRequirements')}
                  </Label>
                  <Textarea
                    placeholder={t('otherRequirementsPlaceholder')}
                    value={preferences.otherNeeds}
                    onChange={(e) => setPreferences({...preferences, otherNeeds: e.target.value})}
                    className="h-24"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleGetRecommendations}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('aiAnalyzing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('getAIRecommendations')}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <div>
            <AnimatePresence mode="wait">
              {!recommendations && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <Card className="p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300">
                    <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      {t('readyForRecommendations')}
                    </h3>
                    <p className="text-gray-600">
                      {t('fillPreferencesForAI')}
                    </p>
                  </Card>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <Card className="p-12 text-center">
                    <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      {t('aiAnalyzingDatabase')}
                    </h3>
                    <p className="text-gray-600">
                      {t('searchingBestHouses')}
                    </p>
                  </Card>
                </motion.div>
              )}

              {recommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Summary */}
                  <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {t('aiAnalysis')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{recommendations.summary}</p>
                  </Card>

                  {/* Recommended Houses */}
                  {recommendations.recommendations?.map((rec, index) => {
                    const house = getHouseById(rec.house_id);
                    if (!house) return null;

                    return (
                      <motion.div
                        key={house.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <Card className="overflow-hidden hover:shadow-2xl transition-shadow">
                          <div className="flex items-start gap-4 p-6">
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              'bg-gradient-to-br from-orange-400 to-orange-600'
                            }`}>
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* House Image & Info */}
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="relative h-48 rounded-lg overflow-hidden">
                                  {house.hlavny_obrazok ? (
                                    <ImageWithWatermark
                                      src={house.hlavny_obrazok}
                                      alt={house.nazov}
                                      className="w-full h-full object-cover"
                                      useCatalogSetting={true}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <Home className="w-12 h-12 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h3 className="text-xl font-bold text-primary mb-2">{house.nazov}</h3>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p>• {t('manufacturer')}: <span className="font-semibold">{house.vyrobca}</span></p>
                                    <p>• {t('type')}: <span className="font-semibold">{house.typ_domu}</span></p>
                                    <p>• {t('rooms')}: <span className="font-semibold">max. {house.pocet_izieb}</span></p>
                                    <p>• {t('builtArea')}: <span className="font-semibold">{house.zastavana_plocha} m²</span></p>
                                    <p className="text-lg font-bold text-primary mt-2">
                                      {house.zakladna_cena?.toLocaleString('sk-SK')} €
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Match Score */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700">{t('matchWithRequirements')}</span>
                                  <span className="text-sm font-bold text-purple-600">{rec.match_score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${rec.match_score}%` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                    className={`h-3 rounded-full ${
                                      rec.match_score >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                      rec.match_score >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                      'bg-gradient-to-r from-orange-500 to-orange-600'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Why Suitable */}
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                                <p className="font-semibold text-blue-900 mb-1">{t('whySuitable')}:</p>
                                <p className="text-sm text-blue-800">{rec.why_suitable}</p>
                              </div>

                              {/* Pros */}
                              {rec.pros?.length > 0 && (
                                <div className="mb-4">
                                  <p className="font-semibold text-green-900 mb-2">✅ {t('advantages')}:</p>
                                  <ul className="space-y-1">
                                    {rec.pros.map((pro, i) => (
                                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Considerations */}
                              {rec.considerations?.length > 0 && (
                                <div className="mb-4">
                                  <p className="font-semibold text-orange-900 mb-2">⚠️ {t('toConsider')}:</p>
                                  <ul className="space-y-1">
                                    {rec.considerations.map((con, i) => (
                                      <li key={i} className="text-sm text-orange-800">• {con}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Estimated Total Cost */}
                              {rec.estimated_total_cost && (
                                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                  <p className="text-sm text-gray-600 mb-1">{t('estimatedTotalPrice')}:</p>
                                  <p className="text-2xl font-bold text-primary">
                                    {rec.estimated_total_cost.toLocaleString('sk-SK')} €
                                  </p>
                                </div>
                              )}

                              {/* CTA Button */}
                              <Link to={`${createPageUrl("DetailDomu")}?id=${house.id}`}>
                                <Button className="w-full bg-primary hover:bg-secondary">
                                  {t('viewHouseDetail')}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    onClick={() => setRecommendations(null)}
                    className="w-full"
                  >
                    {t('newSearch')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Cards */}
        {!recommendations && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t('intelligentAnalysis')}</h3>
              <p className="text-sm text-gray-600">
                {t('intelligentAnalysisDesc')}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t('personalizedRecommendations')}</h3>
              <p className="text-sm text-gray-600">
                {t('personalizedRecommendationsDesc')}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t('transparentPrices')}</h3>
              <p className="text-sm text-gray-600">
                {t('transparentPricesDesc')}
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}