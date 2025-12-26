import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Zap, ChevronRight, Lightbulb, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PersonalizedRecommendations({ history, onRecommendationClick }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!history || history.length === 0) return;

    // Analýza správania manažéra
    const approved = history.filter(h => h.status === 'completed');
    const rejected = history.filter(h => h.status === 'rejected');
    
    const campaignTypes = {};
    approved.forEach(h => {
      const type = h.data?.type || 'other';
      campaignTypes[type] = (campaignTypes[type] || 0) + 1;
    });

    const mostUsedType = Object.entries(campaignTypes).sort((a, b) => b[1] - a[1])[0]?.[0];
    const totalBudget = approved.reduce((sum, h) => sum + (h.budget_allocated || 0), 0);
    const avgBudget = approved.length > 0 ? totalBudget / approved.length : 0;
    
    const recentActivity = approved.slice(0, 10);
    const hasLeadGenFocus = campaignTypes['lead_gen_campaign'] > (approved.length / 3);
    const hasPriceFocus = campaignTypes['price_strategy'] > 2;
    const hasSEOFocus = campaignTypes['seo_optimization'] > 0;

    // Generovať odporúčania
    const newRecommendations = [];

    // Odporúčanie #1: Pokročilé Lead Gen techniky
    if (hasLeadGenFocus && approved.length > 5) {
      newRecommendations.push({
        id: 'advanced_leadgen',
        type: 'strategy',
        priority: 'high',
        title: 'Pokročilé Lead Gen techniky',
        description: `Schválili ste ${campaignTypes['lead_gen_campaign'] || 0} Lead Gen kampaní. Skúste Lookalike Audiences a Instant Forms pre 2x lepšie výsledky.`,
        action: 'Spýtaj sa AI: "Vytvor pokročilú Lead Gen stratégiu s Lookalike Audiences"',
        impact: 85,
        icon: Target
      });
    }

    // Odporúčanie #2: A/B Testing
    if (approved.length > 8 && !recentActivity.some(h => h.title?.includes('A/B test'))) {
      newRecommendations.push({
        id: 'ab_testing',
        type: 'optimization',
        priority: 'medium',
        title: 'Začnite s A/B testovaním',
        description: `Máte ${approved.length} kampaní, ale žiadne A/B testy. Otestujte 2-3 varianty kreatív pre 30-40% lepší CTR.`,
        action: 'Spýtaj sa AI: "Navrhni A/B test pre našu najlepšiu kampaň"',
        impact: 75,
        icon: TrendingUp
      });
    }

    // Odporúčanie #3: Retargeting stratégia
    if (approved.length > 6 && !recentActivity.some(h => h.description?.includes('retargeting'))) {
      newRecommendations.push({
        id: 'retargeting',
        type: 'strategy',
        priority: 'high',
        title: 'Retargeting stratégia',
        description: 'Až 70% návštevníkov nekonvertuje napoprvý. Vytvorte retargeting kampane pre opustené košíky a zvedavých návštevníkov.',
        action: 'Spýtaj sa AI: "Vytvor komplexnú retargeting stratégiu"',
        impact: 90,
        icon: Zap
      });
    }

    // Odporúčanie #4: Video content
    if (approved.length > 10 && !recentActivity.some(h => h.data?.creative?.type === 'video')) {
      newRecommendations.push({
        id: 'video_content',
        type: 'content',
        priority: 'medium',
        title: 'Video obsah pre vyššie engagement',
        description: 'Video reklamy majú 3x vyššie engagement. AI vie vytvoriť scenár, shot-by-shot plán aj hudobný koncept.',
        action: 'Spýtaj sa AI: "Vytvor video kampaň pre našu najlepší dom"',
        impact: 80,
        icon: Lightbulb
      });
    }

    // Odporúčanie #5: Budget optimalizácia
    if (avgBudget > 0 && approved.length > 5) {
      const budgetEfficiency = totalBudget / approved.length;
      if (budgetEfficiency < 30) {
        newRecommendations.push({
          id: 'budget_optimization',
          type: 'optimization',
          priority: 'medium',
          title: 'Optimalizujte rozdelenie budgetu',
          description: `Váš priemerný budget je ${avgBudget.toFixed(0)}€/kampaň. AI vie navrhnúť efektívnejšie rozdelenie na základe ROI dát.`,
          action: 'Spýtaj sa AI: "Analyzuj môj budget a navrhni lepšie rozdelenie"',
          impact: 70,
          icon: TrendingUp
        });
      }
    }

    // Odporúčanie #6: SEO + Paid Ads kombinácia
    if (hasSEOFocus && hasLeadGenFocus) {
      newRecommendations.push({
        id: 'seo_paid_combo',
        type: 'strategy',
        priority: 'high',
        title: 'SEO + Paid Ads synergia',
        description: 'Kombinujte SEO optimalizáciu s plateným marketingom pre maximálny dosah. AI vie vytvoriť integrovanú stratégiu.',
        action: 'Spýtaj sa AI: "Vytvor integrovanú SEO + Paid stratégiu"',
        impact: 88,
        icon: Trophy
      });
    }

    // Odporúčanie #7: Ak má málo schválených kampaní
    if (approved.length < 3) {
      newRecommendations.push({
        id: 'get_started',
        type: 'guide',
        priority: 'high',
        title: 'Začnite s prvou kampaňou',
        description: 'AI môže vytvoriť kompletnú kampaň od koncepcie po publikáciu. Stačí povedať čo potrebujete.',
        action: 'Spýtaj sa AI: "Vytvor moju prvú lead generation kampaň"',
        impact: 95,
        icon: Brain
      });
    }

    setRecommendations(newRecommendations.sort((a, b) => b.impact - a.impact));
  }, [history]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          💡 Personalizované odporúčania pre vás
        </CardTitle>
        <p className="text-xs text-purple-700">
          Na základe {history.filter(h => h.status === 'completed').length} schválených kampaní
        </p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[800px] overflow-y-auto">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              rec.priority === 'high' 
                ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 hover:border-orange-500'
                : 'bg-white border-purple-200 hover:border-purple-400'
            }`}
            onClick={() => {
              if (onRecommendationClick) {
                onRecommendationClick(rec.action);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                rec.priority === 'high' ? 'bg-orange-200' : 'bg-purple-200'
              }`}>
                <rec.icon className={`w-5 h-5 ${
                  rec.priority === 'high' ? 'text-orange-700' : 'text-purple-700'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-bold text-sm text-gray-900">{rec.title}</h5>
                  <Badge className={`${
                    rec.priority === 'high' ? 'bg-orange-600' : 'bg-purple-600'
                  } text-white text-xs`}>
                    {rec.impact}% impact
                  </Badge>
                </div>
                <p className="text-xs text-gray-700 mb-2">{rec.description}</p>
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                  <span>👉 {rec.action}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}