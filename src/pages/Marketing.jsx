
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  BarChart3,
  Calendar,
  Sparkles,
  Brain,
  Zap,
  Copy,
  BookOpen,
  Eye,
  Send,
  Lightbulb,
  MessageSquare,
  TrendingDown,
  Plus,
  Rocket
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { sk } from "date-fns/locale";

export default function Marketing() {
  const [weeklyAnalysis, setWeeklyAnalysis] = useState("");
  const [facebookPost, setFacebookPost] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingFbPost, setLoadingFbPost] = useState(false);
  const [strategicBriefing, setStrategicBriefing] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [clientConcerns, setClientConcerns] = useState("");
  
  // Form states
  const [newKnowHow, setNewKnowHow] = useState({ category: "Psychológia", content_text: "", urgency_level: 5 });
  const [newCompetitor, setNewCompetitor] = useState({ competitor_name: "", post_content: "", why_it_worked: "", platform: "Facebook", engagement_score: 50 });
  const [campaignBudget, setCampaignBudget] = useState(500);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loadingWeeklyPlan, setLoadingWeeklyPlan] = useState(false);

  // Admin IP adresy a emaily na vylúčenie
  const ADMIN_IPS = ['109.230.104.122', '2a02:c847:166:a899:f148:3f22:4df1:169'];
  const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  // Filtrovať admin sessions
  const filterAdminSessions = (sessions) => {
    return sessions.filter(s => {
      if (ADMIN_EMAILS.includes(s.user_email)) return false;
      if (s.location_info?.ip && ADMIN_IPS.includes(s.location_info.ip)) return false;
      return true;
    });
  };

  // Dnešné sessions (bez admin)
  const { data: todaySessions = [] } = useQuery({
    queryKey: ['today-sessions'],
    queryFn: async () => {
      const sessions = await base44.entities.UserSession.list('-created_date', 500);
      const filtered = filterAdminSessions(sessions);
      const today = new Date();
      return filtered.filter(s => {
        const sessionDate = new Date(s.created_date);
        return sessionDate >= startOfDay(today) && sessionDate <= endOfDay(today);
      });
    },
    enabled: isAdmin
  });

  // Týždenné dopyty
  const { data: weekDopyty = [] } = useQuery({
    queryKey: ['week-dopyty'],
    queryFn: async () => {
      const dopyty = await base44.entities.Dopyt.list('-created_date', 200);
      const weekStart = startOfWeek(new Date(), { locale: sk });
      const weekEnd = endOfWeek(new Date(), { locale: sk });
      return dopyty.filter(d => {
        const dopytDate = new Date(d.created_date);
        return dopytDate >= weekStart && dopytDate <= weekEnd;
      });
    },
    enabled: isAdmin
  });

  // Všetky sessions pre výpočty (bez admin)
  const { data: allSessions = [] } = useQuery({
    queryKey: ['all-sessions-marketing'],
    queryFn: async () => {
      const sessions = await base44.entities.UserSession.list('-created_date', 1000);
      return filterAdminSessions(sessions);
    },
    enabled: isAdmin
  });

  // Marketing insights
  const { data: insights = [] } = useQuery({
    queryKey: ['marketing-insights-list'],
    queryFn: () => base44.entities.MarketingInsight.list('-created_date', 20),
    enabled: isAdmin
  });

  // Domy
  const { data: domy = [] } = useQuery({
    queryKey: ['domy-marketing'],
    queryFn: () => base44.entities.Dom.list(),
    enabled: isAdmin
  });

  // Marketing Brain Rules
  const { data: brainRules = [], refetch: refetchBrain } = useQuery({
    queryKey: ['marketing-brain'],
    queryFn: () => base44.entities.MarketingBrain.list('-urgency_level', 50),
    enabled: isAdmin
  });

  // Competitor Watch
  const { data: competitors = [], refetch: refetchCompetitors } = useQuery({
    queryKey: ['competitor-watch'],
    queryFn: () => base44.entities.CompetitorWatch.list('-created_date', 20),
    enabled: isAdmin
  });

  // Social Post Queue
  const { data: postQueue = [], refetch: refetchQueue } = useQuery({
    queryKey: ['social-post-queue'],
    queryFn: () => base44.entities.SocialPostQueue.filter({ status: 'Queued' }, '-created_date', 20),
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8">
          <p className="text-gray-600">Nemáte oprávnenie na prístup k tejto stránke.</p>
        </Card>
      </div>
    );
  }

  // Výpočet KPI
  const conversions = allSessions.filter(s => s.conversions?.length > 0).length;
  const conversionRate = allSessions.length > 0 
    ? ((conversions / allSessions.length) * 100).toFixed(2)
    : 0;

  const abandonedCarts = allSessions.filter(s => 
    s.configurator_interactions?.length > 0 && (!s.conversions || s.conversions.length === 0)
  ).length;

  // Unikátni návštevníci (podľa email alebo IP)
  const uniqueVisitors = new Set(
    todaySessions.map(s => s.user_email || s.location_info?.ip || s.session_id)
  ).size;

  // Graf - posledných 14 dní (unikátni návštevníci)
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const daySessions = allSessions.filter(s => {
      const sessionDate = new Date(s.created_date);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
    
    const uniqueVisitorsForDay = new Set(
      daySessions.map(s => s.user_email || s.location_info?.ip || s.session_id)
    ).size;
    
    chartData.push({
      date: format(date, 'dd.MM', { locale: sk }),
      visits: uniqueVisitorsForDay
    });
  }

  // AI Týždenná analýza
  const generateWeeklyAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      // Získaj trendy dom (najviac návštev)
      const domVisits = {};
      allSessions.forEach(s => {
        s.dom_interactions?.forEach(interaction => {
          const domId = interaction.dom_id;
          domVisits[domId] = (domVisits[domId] || 0) + 1;
        });
      });

      const sortedDoms = Object.entries(domVisits).sort((a, b) => b[1] - a[1]);
      const topDomId = sortedDoms[0]?.[0];
      const topDom = domy.find(d => d.id === topDomId);

      // Bounce rate
      const bouncedSessions = allSessions.filter(s => s.session_tags?.includes('bounced') || s.session_tags?.includes('odrazeny'));
      const bounceRate = allSessions.length > 0 ? ((bouncedSessions.length / allSessions.length) * 100).toFixed(1) : 0;

      const prompt = `Si marketingový analytik. Na základe týchto dát vytvor krátky súhrn (max 150 slov):

Aktuálne dáta:
- Celkový počet návštev tento týždeň: ${allSessions.length}
- Najnavštevovanejší model: ${topDom?.nazov || 'N/A'} (${sortedDoms[0]?.[1] || 0} návštev)
- Bounce rate: ${bounceRate}%
- Konverzný pomer: ${conversionRate}%
- Opustené košíky: ${abandonedCarts}

Napíš:
1. Ktorý model je "trending" a prečo
2. Kde strácame zákazníkov (problém s bounce rate alebo opustenými košíkmi)
3. Jedno konkrétne odporúčanie na zlepšenie

Odpoveď v slovenčine, používaj emotikonmi. Buď konkrétny a akčný.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setWeeklyAnalysis(response);
    } catch (error) {
      toast.error('Chyba pri generovaní analýzy');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Generátor Facebook postu
  const generateFacebookPost = async () => {
    setLoadingFbPost(true);
    try {
      // Nájdi najnavštevovanejší dom za 7 dní
      const weekStart = subDays(new Date(), 7);
      const weekSessions = allSessions.filter(s => new Date(s.created_date) >= weekStart);
      
      const domVisits = {};
      weekSessions.forEach(s => {
        s.dom_interactions?.forEach(interaction => {
          const domId = interaction.dom_id;
          domVisits[domId] = (domVisits[domId] || 0) + 1;
        });
      });

      const sortedDoms = Object.entries(domVisits).sort((a, b) => b[1] - a[1]);
      const topDomId = sortedDoms[0]?.[0];
      const topDom = domy.find(d => d.id === topDomId);

      if (!topDom) {
        toast.error('Nenašiel sa žiadny dom s návštevami');
        setLoadingFbPost(false);
        return;
      }

      const prompt = `Vytvor chytľavý Facebook príspevok (max 200 znakov) pre tento modulárny dom:

Názov: ${topDom.nazov}
Cena: ${topDom.zakladna_cena?.toLocaleString('sk-SK')} € s DPH
Plocha: ${topDom.zastavana_plocha} m²
Výrobca: ${topDom.vyrobca}

Požiadavky:
- Buď kreatívny a chytľavý
- Použi emotikonmi
- Zdôrazni výhody (rýchla montáž, moderný dizajn, energetická efektivita)
- Zahrň call-to-action (napr. "Pozrite si viac na našom webe")
- Text musí byť priateľský a motivačný
- Slovenčina

Odpoveď len textom príspevku, bez úvodzoviek.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setFacebookPost(response);
    } catch (error) {
      toast.error('Chyba pri generovaní postu');
    } finally {
      setLoadingFbPost(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopírované do schránky!');
  };

  // Spustiť dennú strategickú analýzu
  const runDeepThinkStrategist = async () => {
    setLoadingBriefing(true);
    try {
      const response = await base44.functions.invoke('deepThinkStrategist');
      setStrategicBriefing(response.data.briefing);
      setClientConcerns(response.data.client_concerns);
      toast.success('Strategický brífing vygenerovaný!');
    } catch (error) {
      toast.error('Chyba pri generovaní brífingu');
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Uložiť know-how
  const saveKnowHow = async () => {
    try {
      await base44.entities.MarketingBrain.create(newKnowHow);
      toast.success('Know-how uložené!');
      setNewKnowHow({ category: "Psychológia", content_text: "", urgency_level: 5 });
      refetchBrain();
    } catch (error) {
      toast.error('Chyba pri ukladaní');
    }
  };

  // Uložiť konkurenciu
  const saveCompetitor = async () => {
    try {
      await base44.entities.CompetitorWatch.create(newCompetitor);
      toast.success('Konkurencia zaznamenaná!');
      setNewCompetitor({ competitor_name: "", post_content: "", why_it_worked: "", platform: "Facebook", engagement_score: 50 });
      refetchCompetitors();
    } catch (error) {
      toast.error('Chyba pri ukladaní');
    }
  };

  // Generovať týždenný plán kampaní
  const generateWeeklyPlan = async () => {
    setLoadingWeeklyPlan(true);
    try {
      // Získaj top 3 trendy domy
      const domVisits = {};
      allSessions.forEach(s => {
        s.dom_interactions?.forEach(interaction => {
          const domId = interaction.dom_id;
          domVisits[domId] = (domVisits[domId] || 0) + 1;
        });
      });
      const topDomy = Object.entries(domVisits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => {
          const dom = domy.find(d => d.id === id);
          return { id, nazov: dom?.nazov, count };
        });

      // Získaj náhodné pravidlá z MarketingBrain
      const randomRules = brainRules
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(r => `[${r.category}] ${r.content_text}`);

      const prompt = `Si AI marketingový riaditeľ pre American Living.

📊 DÁTA:
- Mesačný budget: ${campaignBudget}€
- TOP 3 trendy domy: ${topDomy.map(d => `${d.nazov} (${d.count} zobrazení)`).join(', ')}

💡 NAŠE KNOW-HOW (MUSÍŠ dodržať):
${randomRules.join('\n')}

---

ÚLOHA: Vytvor TÝŽDENNÝ PLÁN KAMPANÍ (7 príspevkov).

Pre každý deň vytvor:
{
  "den": "Pondelok/Utorok/...",
  "post_text": "...(max 200 znakov, s emotikonmi)...",
  "psychological_trigger": "...(aký princíp z know-how použiješ)...",
  "target_house": "...(názov domu)...",
  "platform": "Facebook/Instagram/TikTok",
  "budget": ...(koľko EUR na boosting),
  "predicted_score": ...(0-100, odhadované skóre úspešnosti)
}

PRAVIDLÁ:
- Použij AIDA model, Social Proof, Scarcity
- Každý príspevok musí odkazovať na konkrétne know-how pravidlo
- Rozdeľ budget rozumne (viac na najlepšie domy)
- Rôzne platformy pre rôzne ciele

Vráť JSON array (7 príspevkov).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  den: { type: "string" },
                  post_text: { type: "string" },
                  psychological_trigger: { type: "string" },
                  target_house: { type: "string" },
                  platform: { type: "string" },
                  budget: { type: "number" },
                  predicted_score: { type: "number" }
                }
              },
              required: ["den", "post_text", "psychological_trigger", "target_house", "platform", "budget", "predicted_score"]
            }
          },
          required: ["posts"]
        }
      });

      setWeeklyPlan(response.posts);
      
      // Uložiť do SocialPostQueue
      for (const post of response.posts) {
        const targetDom = domy.find(d => d.nazov === post.target_house);
        await base44.entities.SocialPostQueue.create({
          platform: post.platform,
          post_text: post.post_text,
          psychological_trigger_used: post.psychological_trigger,
          predicted_conversion_score: post.predicted_score,
          budget_allocated: post.budget,
          status: 'Queued',
          // Schedule each post for a different day starting from tomorrow
          scheduled_date: format(new Date(Date.now() + (response.posts.indexOf(post) + 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          target_house_id: targetDom?.id
        });
      }
      
      refetchQueue();
      toast.success('Týždenný plán vygenerovaný!');
    } catch (error) {
      toast.error('Chyba pri generovaní plánu');
      console.error(error);
    } finally {
      setLoadingWeeklyPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            🤖 AI Marketingový Riaditeľ
          </h1>
          <p className="text-gray-600">Váš virtuálny kolega pre dátami poháňané rozhodnutia</p>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="text-sm sm:text-base">📊 Prehľad a Výkon</TabsTrigger>
            <TabsTrigger value="strategy" className="text-sm sm:text-base">🧠 Stratégia a Mozog</TabsTrigger>
            <TabsTrigger value="planner" className="text-sm sm:text-base">🚀 Plánovač Kampaní</TabsTrigger>
          </TabsList>

          {/* KARTA A: Prehľad a Výkon */}
          <TabsContent value="overview">
            <div className="space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Dnes</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Unikátni návštevníci</p>
              <p className="text-4xl font-bold text-gray-900">{uniqueVisitors}</p>
              <p className="text-xs text-gray-500 mt-1">{todaySessions.length} sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">Tento týždeň</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Nové dopyty</p>
              <p className="text-4xl font-bold text-gray-900">{weekDopyty.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600 text-white">Konverzia</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Konverzný pomer</p>
              <p className="text-4xl font-bold text-gray-900">{conversionRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-white">Košíky</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Opustené košíky</p>
              <p className="text-4xl font-bold text-gray-900">{abandonedCarts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Graf návštevnosti */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Vývoj unikátnych návštevníkov (14 dní)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Marketingové Centrum */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            🤖 AI Marketingové Centrum
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Týždenná Analýza */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  📊 Týždenná Analýza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateWeeklyAnalysis}
                  disabled={loadingAnalysis}
                  className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                >
                  {loadingAnalysis ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generujem...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Vygeneruj analýzu
                    </>
                  )}
                </Button>
                
                {weeklyAnalysis && (
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {weeklyAnalysis}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generátor Obsahu */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  📱 Generátor Obsahu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateFacebookPost}
                  disabled={loadingFbPost}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  {loadingFbPost ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generujem...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Vygeneruj príspevok na Facebook
                    </>
                  )}
                </Button>
                
                {facebookPost && (
                  <div className="space-y-2">
                    <Textarea
                      value={facebookPost}
                      readOnly
                      rows={6}
                      className="bg-white border-2 border-blue-300 text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(facebookPost)}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Kopírovať do schránky
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabuľka Marketing Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Posledné Marketing Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Zatiaľ žiadne insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {insight.dom_nazov}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Zobrazenia</p>
                              <p className="font-bold">{insight.celkovy_zajem?.pocet_zobrazeni || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Konfigurácie</p>
                              <p className="font-bold">{insight.celkovy_zajem?.pocet_konfiguracii || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Konverzia</p>
                              <p className="font-bold">{insight.celkovy_zajem?.miera_konverzie?.toFixed(2) || 0}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Confidence</p>
                              <Badge className={
                                insight.confidence_score > 70 ? "bg-green-600" :
                                insight.confidence_score > 40 ? "bg-yellow-600" : "bg-red-600"
                              }>
                                {insight.confidence_score || 0}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {format(new Date(insight.created_date), 'dd.MM.yyyy HH:mm', { locale: sk })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
            </div>
          </TabsContent>

          {/* KARTA B: Stratégia a Mozog */}
          <TabsContent value="strategy">
            <div className="space-y-8">
              {/* Deep Think Strategist */}
              <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white border-none shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Brain className="w-8 h-8" />
                    🧠 Deep Think Strategist
                  </CardTitle>
                  <p className="text-purple-200">AI analýza všetkých dát → Konkrétne odporúčania</p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={runDeepThinkStrategist}
                    disabled={loadingBriefing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold text-lg mb-6"
                  >
                    {loadingBriefing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                        Analyzujem všetky dáta...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Spustiť dennú analýzu
                      </>
                    )}
                  </Button>
                  
                  {strategicBriefing && (
                    <div className="bg-white text-gray-900 p-6 rounded-lg">
                      <h3 className="font-bold text-xl mb-4 text-purple-900">📋 Denný Strategický Brífing</h3>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {strategicBriefing}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analýza Dopytov */}
              {clientConcerns && (
                <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                      😰 Analýza Dopytov - Čo trápi klientov
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                      <pre className="whitespace-pre-line text-sm text-gray-800">{clientConcerns}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Formulár: Nahrať Know-How */}
              <Card className="border-green-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    📚 Nahrať Know-How (Predajná Psychológia)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Kategória</Label>
                      <select
                        value={newKnowHow.category}
                        onChange={(e) => setNewKnowHow({...newKnowHow, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="Psychológia">Psychológia</option>
                        <option value="Predaj">Predaj</option>
                        <option value="O_Firme">O Firme</option>
                        <option value="Lead_Generation">Lead Generation</option>
                        <option value="Social_Proof">Social Proof</option>
                        <option value="Scarcity">Scarcity</option>
                      </select>
                    </div>
                    <div>
                      <Label>Pravidlo / Princíp</Label>
                      <Textarea
                        value={newKnowHow.content_text}
                        onChange={(e) => setNewKnowHow({...newKnowHow, content_text: e.target.value})}
                        placeholder="Napr. 'Vždy zdôrazňuj rýchlosť montáže - ľudia chcú mať dom rýchlo'"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Priorita (1-10)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={newKnowHow.urgency_level}
                        onChange={(e) => setNewKnowHow({...newKnowHow, urgency_level: parseInt(e.target.value)})}
                      />
                    </div>
                    <Button onClick={saveKnowHow} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Uložiť Know-How
                    </Button>
                  </div>

                  {/* Zoznam know-how */}
                  <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">📚 Uložené pravidlá ({brainRules.length})</h4>
                    {brainRules.map((rule) => (
                      <div key={rule.id} className="bg-green-50 border border-green-200 p-3 rounded">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge className="bg-green-600 text-white mb-2">{rule.category}</Badge>
                            <p className="text-sm text-gray-800">{rule.content_text}</p>
                          </div>
                          <Badge variant="outline">Priorita: {rule.urgency_level}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Formulár: Sledovanie Konkurencie */}
              <Card className="border-red-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-red-600" />
                    👀 Sledovanie Konkurencie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Názov konkurenta</Label>
                        <Input
                          value={newCompetitor.competitor_name}
                          onChange={(e) => setNewCompetitor({...newCompetitor, competitor_name: e.target.value})}
                          placeholder="Napr. ModularHomes SK"
                        />
                      </div>
                      <div>
                        <Label>Platforma</Label>
                        <select
                          value={newCompetitor.platform}
                          onChange={(e) => setNewCompetitor({...newCompetitor, platform: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="YouTube">YouTube</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Obsah príspevku</Label>
                      <Textarea
                        value={newCompetitor.post_content}
                        onChange={(e) => setNewCompetitor({...newCompetitor, post_content: e.target.value})}
                        placeholder="Skopíruj text úspešnej reklamy konkurencie..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Prečo to fungovalo?</Label>
                      <Textarea
                        value={newCompetitor.why_it_worked}
                        onChange={(e) => setNewCompetitor({...newCompetitor, why_it_worked: e.target.value})}
                        placeholder="Napr. 'Použili video z montáže, ľudia vidia, že je to rýchle'"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Engagement skóre (0-100)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={newCompetitor.engagement_score}
                        onChange={(e) => setNewCompetitor({...newCompetitor, engagement_score: parseInt(e.target.value)})}
                      />
                    </div>
                    <Button onClick={saveCompetitor} className="w-full bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Uložiť konkurenčný príspevok
                    </Button>
                  </div>

                  {/* Zoznam konkurencie */}
                  <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">👀 Sledované príspevky ({competitors.length})</h4>
                    {competitors.map((comp) => (
                      <div key={comp.id} className="bg-red-50 border border-red-200 p-3 rounded">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-bold text-sm">{comp.competitor_name}</div>
                          <Badge className="bg-red-600">{comp.platform}</Badge>
                        </div>
                        <p className="text-xs text-gray-700 mb-2 italic">"{comp.post_content.substring(0, 150)}..."</p>
                        <p className="text-xs text-gray-600">💡 {comp.why_it_worked}</p>
                        <Badge variant="outline" className="mt-2">Engagement: {comp.engagement_score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* KARTA C: Plánovač Kampaní */}
          <TabsContent value="planner">
            <div className="space-y-8">
              {/* Generátor týždenného plánu */}
              <Card className="bg-gradient-to-br from-blue-900 to-cyan-900 text-white border-none shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Rocket className="w-8 h-8" />
                    🚀 Generátor Týždenného Plánu
                  </CardTitle>
                  <p className="text-blue-200">AI vytvorí 7 príspevkov na základe vášho budgetu a know-how</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Label className="text-white mb-2 block text-lg">💰 Mesačný Budget (EUR)</Label>
                    <Input
                      type="number"
                      value={campaignBudget}
                      onChange={(e) => setCampaignBudget(parseInt(e.target.value))}
                      className="text-2xl font-bold text-gray-900"
                      min={100}
                      max={10000}
                    />
                  </div>
                  <Button
                    onClick={generateWeeklyPlan}
                    disabled={loadingWeeklyPlan}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-gray-900 font-bold text-lg"
                  >
                    {loadingWeeklyPlan ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                        AI generuje plán...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Vygenerovať týždenný plán
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Týždenný plán - tabuľka */}
              {weeklyPlan && weeklyPlan.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      📅 Navrhovaný týždenný plán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyPlan.map((post, index) => (
                        <Card key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white font-bold">{post.den}</Badge>
                                <Badge variant="outline">{post.platform}</Badge>
                                <Badge className="bg-purple-100 text-purple-800">{post.target_house}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600 text-white">{post.budget}€</Badge>
                                <Badge className={
                                  post.predicted_score > 70 ? "bg-green-600 text-white" :
                                  post.predicted_score > 50 ? "bg-yellow-600 text-white" : "bg-red-600 text-white"
                                }>
                                  {post.predicted_score}% skóre
                                </Badge>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded border-2 border-blue-200 mb-3">
                              <p className="text-sm font-medium text-gray-900">{post.post_text}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-xs text-purple-900">
                                <strong>🧠 Psychologický princíp:</strong> {post.psychological_trigger}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                onClick={() => copyToClipboard(post.post_text)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Kopírovať text
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    const targetDom = domy.find(d => d.nazov === post.target_house);
                                    await base44.entities.SocialPostQueue.create({
                                      platform: post.platform,
                                      post_text: post.post_text,
                                      psychological_trigger_used: post.psychological_trigger,
                                      predicted_conversion_score: post.predicted_score,
                                      budget_allocated: post.budget,
                                      target_house_id: targetDom?.id,
                                      status: 'Approved',
                                      scheduled_date: format(new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                                    });
                                    toast.success('Príspevok schválený!');
                                    refetchQueue();
                                  } catch (error) {
                                    toast.error('Chyba pri schvaľovaní');
                                  }
                                }}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Schváliť
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">
                        💰 Celkový týždenný budget: {weeklyPlan.reduce((acc, p) => acc + p.budget, 0)}€
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Z celkového mesačného budgetu: {campaignBudget}€
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Schválené príspevky (fronta) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-indigo-600" />
                    📤 Fronta príspevkov ({postQueue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {postQueue.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Žiadne príspevky vo fronte</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {postQueue.map((post) => (
                        <Card key={post.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <Badge className="bg-indigo-600 text-white">{post.platform}</Badge>
                              <Badge variant="outline">{post.scheduled_date}</Badge>
                            </div>
                            <p className="text-sm text-gray-800 mb-2">{post.post_text}</p>
                            <p className="text-xs text-purple-700">🧠 {post.psychological_trigger_used}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-green-100 text-green-800">{post.budget_allocated}€</Badge>
                              <Badge className="bg-purple-100 text-purple-800">{post.predicted_conversion_score}% skóre</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
