import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Target, TrendingUp, Users, Brain, Sparkles, CheckCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AutomatedCampaignsSection() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [optimizingTemplate, setOptimizingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    template_name: "",
    template_type: "lead_generation",
    description: "",
    default_budget_daily: 20,
    default_budget_total: 300,
    default_duration_days: 15,
    platforms: ["Facebook", "Instagram"]
  });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['campaign-templates'],
    queryFn: () => base44.entities.CampaignTemplate.list('-created_date')
  });

  const { data: marketingHistory = [] } = useQuery({
    queryKey: ['marketing-history-templates'],
    queryFn: () => base44.entities.MarketingHistory.filter({ status: 'completed' })
  });

  const { data: brainRules = [] } = useQuery({
    queryKey: ['marketing-brain-templates'],
    queryFn: () => base44.entities.MarketingBrain.list('-urgency_level')
  });

  const createTemplate = useMutation({
    mutationFn: (data) => base44.entities.CampaignTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign-templates']);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Šablóna vytvorená!');
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => base44.entities.CampaignTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaign-templates']);
      toast.success('Šablóna odstránená');
    }
  });

  const optimizeTemplate = async (template) => {
    setOptimizingTemplate(template.id);
    try {
      // Analyzovať históriu podobných kampaní
      const similarCampaigns = marketingHistory.filter(h => 
        h.data?.type === template.template_type ||
        h.title?.toLowerCase().includes(template.template_type.replace('_', ' '))
      );

      const avgBudget = similarCampaigns.length > 0 
        ? similarCampaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0) / similarCampaigns.length
        : template.default_budget_total;

      const topKnowHow = brainRules
        .filter(r => r.category === 'Lead_Generation' || r.category === 'Psychológia')
        .slice(0, 5)
        .map(r => r.content_text)
        .join('\n');

      const prompt = `Si AI marketingový expert. Optimalizuj šablónu kampane na základe historických dát.

📊 ŠABLÓNA:
- Typ: ${template.template_type}
- Aktuálny budget: ${template.default_budget_total}€
- Trvanie: ${template.default_duration_days} dní
- Platformy: ${template.platforms?.join(', ')}

📈 HISTORICKÉ DÁTA:
- Počet podobných kampaní: ${similarCampaigns.length}
- Priemerný budget: ${avgBudget.toFixed(0)}€
- Top výkon: ${similarCampaigns[0]?.title || 'N/A'}

📚 KNOW-HOW:
${topKnowHow}

NAVRHNI OPTIMALIZOVANÉ PARAMETRE (JSON):
{
  "recommended_budget_daily": (number),
  "recommended_budget_total": (number),
  "recommended_duration_days": (number),
  "targeting": {
    "age_range": "25-45",
    "locations": ["Bratislava", "Košice", ...],
    "interests": ["modulárne domy", "stavebníctvo", ...]
  },
  "creative_guidelines": {
    "visual_style": "moderný, svetlý",
    "tone_of_voice": "dôveryhodný, odborný",
    "cta_type": "Zisti viac / Kontaktuj nás",
    "format": "carousel / video / image"
  },
  "reasoning": "Prečo som navrhol práve tieto hodnoty..."
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_budget_daily: { type: "number" },
            recommended_budget_total: { type: "number" },
            recommended_duration_days: { type: "number" },
            targeting: { type: "object" },
            creative_guidelines: { type: "object" },
            reasoning: { type: "string" }
          }
        }
      });

      await base44.entities.CampaignTemplate.update(template.id, {
        default_budget_daily: response.recommended_budget_daily,
        default_budget_total: response.recommended_budget_total,
        default_duration_days: response.recommended_duration_days,
        targeting: response.targeting,
        creative_guidelines: response.creative_guidelines,
        ai_optimized: true,
        optimization_data: { ...response, optimized_date: new Date().toISOString() }
      });

      queryClient.invalidateQueries(['campaign-templates']);
      toast.success('Šablóna optimalizovaná AI!');
    } catch (error) {
      toast.error('Chyba pri optimalizácii: ' + error.message);
    } finally {
      setOptimizingTemplate(null);
    }
  };

  const resetForm = () => {
    setNewTemplate({
      template_name: "",
      template_type: "lead_generation",
      description: "",
      default_budget_daily: 20,
      default_budget_total: 300,
      default_duration_days: 15,
      platforms: ["Facebook", "Instagram"]
    });
  };

  const templateTypeLabels = {
    lead_generation: "Lead Generation",
    brand_awareness: "Brand Awareness",
    engagement: "Engagement",
    conversion: "Conversion",
    retargeting: "Retargeting"
  };

  const templateTypeIcons = {
    lead_generation: Target,
    brand_awareness: TrendingUp,
    engagement: Users,
    conversion: CheckCircle,
    retargeting: Zap
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" />
            ⚡ Automatizované kampane
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nová šablóna
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>✨ Vytvoriť šablónu kampane</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Názov šablóny</Label>
                  <Input
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate({...newTemplate, template_name: e.target.value})}
                    placeholder="Napr. Lead Gen - Modulárne domy SK"
                  />
                </div>

                <div>
                  <Label>Typ kampane</Label>
                  <select
                    value={newTemplate.template_type}
                    onChange={(e) => setNewTemplate({...newTemplate, template_type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {Object.entries(templateTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Popis</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Účel a ciele tejto šablóny..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Denný budget (€)</Label>
                    <Input
                      type="number"
                      value={newTemplate.default_budget_daily}
                      onChange={(e) => setNewTemplate({...newTemplate, default_budget_daily: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Celkový budget (€)</Label>
                    <Input
                      type="number"
                      value={newTemplate.default_budget_total}
                      onChange={(e) => setNewTemplate({...newTemplate, default_budget_total: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Trvanie (dni)</Label>
                    <Input
                      type="number"
                      value={newTemplate.default_duration_days}
                      onChange={(e) => setNewTemplate({...newTemplate, default_duration_days: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => createTemplate.mutate(newTemplate)}
                  disabled={!newTemplate.template_name}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Vytvoriť šablónu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-indigo-700">Vytvárajte a spravujte šablóny kampaní optimalizované AI</p>
      </CardHeader>

      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Zatiaľ žiadne šablóny kampaní</p>
            <Button onClick={() => setShowCreateDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Vytvoriť prvú šablónu
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template, idx) => {
              const Icon = templateTypeIcons[template.template_type] || Target;
              
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`border-2 hover:shadow-lg transition-all ${
                    template.ai_optimized ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400' : 'bg-white border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-indigo-600" />
                          <h5 className="font-bold text-sm">{template.template_name}</h5>
                        </div>
                        {template.ai_optimized && (
                          <Badge className="bg-purple-600 text-white">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Optimized
                          </Badge>
                        )}
                      </div>

                      <Badge className="mb-3">{templateTypeLabels[template.template_type]}</Badge>
                      
                      {template.description && (
                        <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="text-gray-600">Denný</p>
                          <p className="font-bold">€{template.default_budget_daily}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <p className="text-gray-600">Celkom</p>
                          <p className="font-bold">€{template.default_budget_total}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded text-center">
                          <p className="text-gray-600">Dní</p>
                          <p className="font-bold">{template.default_duration_days}</p>
                        </div>
                      </div>

                      {template.platforms && (
                        <div className="mb-3 flex gap-1 flex-wrap">
                          {template.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {template.ai_optimized && template.optimization_data?.reasoning && (
                        <div className="bg-purple-100 p-2 rounded mb-3 text-xs">
                          <p className="text-purple-900">
                            <strong>🧠 AI Reasoning:</strong> {template.optimization_data.reasoning.substring(0, 100)}...
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => optimizeTemplate(template)}
                          disabled={optimizingTemplate === template.id}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          {optimizingTemplate === template.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Optimalizujem...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Optimalizácia
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTemplate.mutate(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {template.usage_count > 0 && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                          <span>Použitá {template.usage_count}×</span>
                          {template.avg_performance_score > 0 && (
                            <Badge className="bg-green-600 text-white">
                              {template.avg_performance_score}% úspešnosť
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}