import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import AIMarketingChat from "../components/AIMarketingChat";
import StrategyTab from "../components/marketing/StrategyTab";
import CampaignHistoryTable from "../components/marketing/CampaignHistoryTable";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";
import AutomatedCampaignsSection from "../components/marketing/AutomatedCampaignsSection";
import UnifiedDashboard from "../components/marketing/UnifiedDashboard";
import MarketingNotifications from "../components/marketing/MarketingNotifications";
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
  Rocket,
  Settings,
  CheckCircle,
  XCircle,
  Search,
  Trophy,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [chatInputRef, setChatInputRef] = useState(null);
  
  // Form states
  const [newKnowHow, setNewKnowHow] = useState({ category: "Psychológia", content_text: "", urgency_level: 5 });
  const [newCompetitor, setNewCompetitor] = useState({ competitor_name: "", post_content: "", why_it_worked: "", platform: "Facebook", engagement_score: 50 });
  const [campaignBudget, setCampaignBudget] = useState(500);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loadingWeeklyPlan, setLoadingWeeklyPlan] = useState(false);
  
  // Kreatívne štúdio
  const [rawIdea, setRawIdea] = useState("");
  const [creativeProject, setCreativeProject] = useState(null);
  const [loadingCreative, setLoadingCreative] = useState(false);
  
  // Analýza komentárov
  const [commentsInput, setCommentsInput] = useState("");
  const [campaignNameInput, setCampaignNameInput] = useState("");
  const [commentsAnalysis, setCommentsAnalysis] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Google Drive Assets
  const [driveLink, setDriveLink] = useState("");
  const [savingDriveLink, setSavingDriveLink] = useState(false);
  
  // Settings & API
  const [showSettings, setShowSettings] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [testingAPI, setTestingAPI] = useState(false);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  // Admin IP adresy a emaily na vylúčenie
  const ADMIN_IPS = ['109.230.104.122', '2a02:c847:166:a899:f148:3f22:4df1:169'];
  const ADMIN_EMAILS = ['living.cheap.american@gmail.com'];

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const isAdmin = user?.role === 'admin' || user?.super_admin === true;

  // Automatizácia - posledná a ďalšia analýza
  const { data: lastAnalysis } = useQuery({
    queryKey: ['last-daily-analysis'],
    queryFn: async () => {
      const analyses = await base44.entities.DailyMarketingAnalysis.list('-created_date', 1);
      return analyses[0] || null;
    },
    enabled: isAdmin,
    refetchInterval: 300000 // každých 5 minút (bolo každú minútu)
  });

  const runDailyRoutine = useMutation({
    mutationFn: () => base44.functions.invoke('dailyMarketingRoutine'),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('✅ Denná rutina dokončená!');
      }
    },
    onError: () => {
      toast.error('Chyba pri spustení dennej rutiny');
    }
  });

  const syncAnalytics = useMutation({
    mutationFn: () => base44.functions.invoke('syncAnalyticsData'),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('✅ Analytics data aktualizované!', {
          description: `${response.data.results.metrics_synced} metrík, ${response.data.results.campaigns_synced} kampaní`
        });
      }
    },
    onError: (error) => {
      toast.error('Chyba pri synchronizácii analytics dát: ' + error.message);
    }
  });

  // Filtrovať admin sessions
  const filterAdminSessions = (sessions) => {
    return sessions.filter(s => {
      if (ADMIN_EMAILS.includes(s.user_email)) return false;
      if (s.location_info?.ip && ADMIN_IPS.includes(s.location_info.ip)) return false;
      // Filter sessions z app.base44.com (admin rozhranie)
      if (s.referrer && s.referrer.includes('app.base44.com')) return false;
      if (s.referrer_domain && s.referrer_domain.includes('app.base44.com')) return false;
      return true;
    });
  };

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

  // Všetky sessions pre výpočty (bez admin) - zdieľané pre todaySessions aj allSessions
  const { data: allSessions = [] } = useQuery({
    queryKey: ['all-sessions-marketing'],
    queryFn: async () => {
      const sessions = await base44.entities.UserSession.list('-created_date', 1000);
      return filterAdminSessions(sessions);
    },
    enabled: isAdmin,
    staleTime: 120000 // 2 minúty cache
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

  // Marketing Assets (Google Drive link)
  const { data: assets = [], refetch: refetchAssets } = useQuery({
    queryKey: ['marketing-assets'],
    queryFn: () => base44.entities.MarketingAssets.filter({ active: true }),
    enabled: isAdmin
  });

  // Campaign Performance
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaign-performance'],
    queryFn: () => base44.entities.CampaignPerformance.list('-created_date', 10),
    enabled: isAdmin
  });

  // Marketing History (for campaign tracking)
  const { data: marketingHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['marketing-history'],
    queryFn: () => base44.entities.MarketingHistory.list('-created_date', 100),
    enabled: isAdmin
  });

  const totalApiCost = React.useMemo(() => marketingHistory.reduce((sum, r) => sum + parseFloat(r.data?.estimated_cost_eur || 0), 0), [marketingHistory]);

  React.useEffect(() => { if (assets.length > 0) setDriveLink(assets[0].link); }, [assets]);

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

      const prompt = `Si marketingový analytik pre American Living (modulárne domy).

🧠 CHAIN OF THOUGHT REASONING:
Predtým než vytvoríš súhrn:
1. Analyzuj psychológiu slovenského zákazníka
2. Zváž aktuálnu sezónu a obdobie
3. Simuluj 3 možné scenáre problému
4. Vyber najlepšie riešenie

📊 AKTUÁLNE DÁTA:
- Celkový počet návštev tento týždeň: ${allSessions.length}
- Najnavštevovanejší model: ${topDom?.nazov || 'N/A'} (${sortedDoms[0]?.[1] || 0} návštev)
- Bounce rate: ${bounceRate}%
- Konverzný pomer: ${conversionRate}%
- Opustené košíky: ${abandonedCarts}

VYTVOR SÚHRN (max 150 slov):
1. Ktorý model je "trending" a prečo
2. Kde strácame zákazníkov
3. Jedno konkrétne odporúčanie
4. 🧠 Vysvetlenie logiky

Slovenčina, emotikonmi, konkrétne a akčne.`;

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

      // Získaj know-how pravidlá pre lepší kontext
      const topRules = brainRules.slice(0, 3).map(r => r.content_text).join('; ');

      const prompt = `Vytvor chytľavý Facebook príspevok pre modulárny dom.

🧠 CHAIN OF THOUGHT:
1. Analyzuj slovenskú psychológiu (čo zákazníkov zaujíma)
2. Zváž sezónnosť a aktuálne obdobie
3. Aplikuj AIDA model a Social Proof
4. Vyber najlepší psychologický trigger

📊 DÁT O DOME:
- Názov: ${topDom.nazov}
- Cena: ${topDom.zakladna_cena?.toLocaleString('sk-SK')} € s DPH
- Plocha: ${topDom.zastavana_plocha} m²
- Výrobca: ${topDom.vyrobca}
- Návštevnosť: ${sortedDoms[0]?.[1] || 0} zobrazení za 7 dní

💡 NAŠE KNOW-HOW:
${topRules}

VYTVOR:
- Text príspevku (max 200 znakov)
- S emotikonmi, chytľavý, motivačný
- Call-to-action
- Slovenčina

Odpoveď len textom príspevku.`;

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
      if (response.data.needs_api_key) {
        toast.error('⚠️ Pre DeepThink analýzu vložte prosím API kľúč v nastaveniach.', {
          duration: 5000
        });
        setShowSettings(true);
      } else {
        setStrategicBriefing(response.data.briefing);
        setClientConcerns(response.data.client_concerns);
        toast.success('✅ Strategický brífing vygenerovaný s gemini-1.5-pro!');
      }
    } catch (error) {
      if (error.message?.includes('API kľúč')) {
        toast.error('⚠️ Vložte API kľúč v nastaveniach', { duration: 5000 });
        setShowSettings(true);
      } else {
        toast.error('Chyba pri generovaní brífingu');
      }
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
      // BEHAVIORÁLNE CIELENIE - Analýza profilov klientov
      const profiles = {
        SENIOR_DOWNSIZING: { count: 0, sessions: [] },
        START_MLADA_RODINA: { count: 0, sessions: [] },
        INVESTOR_BYROKRACIA: { count: 0, sessions: [] }
      };

      allSessions.forEach(s => {
        // PROFIL A: SENIOR / DOWNSIZING
        const viewedExpensive = s.dom_interactions?.some(d => {
          const dom = domy.find(h => h.id === d.dom_id);
          return dom && dom.zakladna_cena > 80000;
        });
        const hasLongerSessions = (s.duration_seconds || 0) > 180;
        if (viewedExpensive && hasLongerSessions) {
          profiles.SENIOR_DOWNSIZING.count++;
          profiles.SENIOR_DOWNSIZING.sessions.push(s);
        }

        // PROFIL B: ŠTART / MLADÁ RODINA
        const viewedCheap = s.dom_interactions?.some(d => {
          const dom = domy.find(h => h.id === d.dom_id);
          return dom && dom.zakladna_cena < 60000;
        });
        const searchedFinancing = s.pages_visited?.some(p => 
          p.page_url?.includes('financovanie') || p.page_url?.includes('cena')
        );
        if (viewedCheap || searchedFinancing) {
          profiles.START_MLADA_RODINA.count++;
          profiles.START_MLADA_RODINA.sessions.push(s);
        }

        // PROFIL C: INVESTOR / OBAVA Z BYROKRACIE
        const readAboutPermits = s.pages_visited?.some(p => 
          p.page_url?.includes('faq') || p.page_url?.includes('ako-to-funguje')
        );
        const highEngagement = (s.engagement_score || 0) > 60;
        if (readAboutPermits && highEngagement) {
          profiles.INVESTOR_BYROKRACIA.count++;
          profiles.INVESTOR_BYROKRACIA.sessions.push(s);
        }
      });

      const dominantProfile = Object.entries(profiles)
        .sort((a, b) => b[1].count - a[1].count)[0][0];

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

      // Získaj VŠETKY pravidlá z MarketingBrain (vrátane nových)
      const allKnowHow = brainRules.map(r => `[${r.category}] ${r.content_text}`).join('\n\n');

      const profileDescriptions = {
        SENIOR_DOWNSIZING: {
          description: 'SENIOR / DOWNSIZING (50+, veľký dom, vysoké náklady)',
          problem: 'Vekový útes - uväznení vo veľkých domoch',
          solution: 'Dom ako bankomat',
          keywords: 'bezbariérovosť, žiadne opravy, hotovosť na účte, jednopodlažný, nízke náklady na vykurovanie'
        },
        START_MLADA_RODINA: {
          description: 'ŠTART / MLADÁ RODINA (25-35, prvé bývanie)',
          problem: 'Nedostupná hypotéka / Zombie trh',
          solution: 'Štartovacie bývanie',
          keywords: 'rýchlosť, nezávislosť od rodičov, nízke energie, dostupná cena, moderný štandard'
        },
        INVESTOR_BYROKRACIA: {
          description: 'INVESTOR / OBAVA Z BYROKRACIE (analýza, obavy zo zákona)',
          problem: 'Legislatívny stres',
          solution: '9 bodov servisu',
          keywords: 'vybavíme za vás, bez starostí, legálne a rýchlo, komplexná služba'
        }
      };

      const targetProfile = profileDescriptions[dominantProfile];

      const prompt = `Si AI marketingový riaditeľ pre American Living (modulárne domy).

🧠 CHAIN OF THOUGHT REASONING:
Predtým než vytvoríš plán:
1. Analyzuj psychológiu slovenského zákazníka
2. Zváž sezónnosť a aktuálne obdobie roka (december 2025)
3. Simuluj 3 rôzne scenáre kampaní
4. Vyber najlepšiu stratégiu na základe know-how
5. Vysvetli svoju logiku

📊 DÁTA O TRHU A KLIENTOCH:
- Mesačný budget: ${campaignBudget}€
- TOP 3 trendy domy: ${topDomy.map(d => `${d.nazov} (${d.count} zobrazení)`).join(', ')}
- DOMINANTNÝ PROFIL KLIENTOV: ${targetProfile.description}
  → Problém: ${targetProfile.problem}
  → Naše riešenie: ${targetProfile.solution}
  → Kľúčové slová: ${targetProfile.keywords}

📚 KOMPLETNÉ KNOW-HOW (MUSÍŠ DODRŽAŤ VŠETKO):
${allKnowHow}

🎯 BEHAVIORÁLNE CIELENIE:
- SENIOR/DOWNSIZING: ${profiles.SENIOR_DOWNSIZING.count} klientov
- ŠTART/RODINA: ${profiles.START_MLADA_RODINA.count} klientov  
- INVESTOR/BYROKRACIA: ${profiles.INVESTOR_BYROKRACIA.count} klientov

---

ÚLOHA: Vytvor TÝŽDENNÝ PLÁN KAMPANÍ (7 príspevkov) CIELENÉHO NA DOMINANTNÝ PROFIL: ${targetProfile.description}.

Pre každý deň vytvor:
{
  "den": "Pondelok/Utorok/...",
  "post_text": "...(max 200 znakov, s emotikonmi)...",
  "psychological_trigger": "...(aký princíp z know-how použiješ)...",
  "target_house": "...(názov domu)...",
  "platform": "Facebook/Instagram/TikTok",
  "budget": ...(koľko EUR na boosting),
  "predicted_score": ...(0-100, odhadované skóre úspešnosti),
  "reasoning": "...(Prečo som zvolil tento prístup pre tento deň?)..."
}

PRAVIDLÁ:
- Použij AIDA model, Social Proof, Scarcity
- Každý príspevok musí odkazovať na konkrétne know-how pravidlo
- Rozdeľ budget rozumne (viac na najlepšie domy)
- Rôzne platformy pre rôzne ciele
- DODRŽUJ COMMUNICATION_RULES (Anti-depresia, empatia, nádejný tón)
- APLIKUJ MARKET_REALITY_2025 (poznaj problém)
- PONÚKAJ OUR_SOLUTION_USP (riešenie)
- PRISPÔSOB KAMPAŇ DOMINANTNÉMU PROFILU (${targetProfile.description})
- PRIDAJ reasoning pre každý príspevok

Vráť JSON s "posts" array, "overall_reasoning" a "target_profile_used".`;

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
                  predicted_score: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            overall_reasoning: { type: "string" },
            target_profile_used: { type: "string" }
          }
        }
      });

      setWeeklyPlan({
        ...response,
        behavioral_segmentation: {
          dominant_profile: dominantProfile,
          profile_counts: profiles,
          target_description: targetProfile.description
        }
      });
      
      // Uložiť do SocialPostQueue
      for (const post of response.posts || []) {
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

  // Vylepšiť nápad (Kreatívne Štúdio)
  const improveIdea = async () => {
    if (!rawIdea.trim()) {
      toast.error('Napíšte svoj nápad');
      return;
    }
    
    setLoadingCreative(true);
    try {
      const response = await base44.functions.invoke('kreativneStudio', { raw_idea: rawIdea });
      if (response.data.needs_api_key) {
        toast.error('⚠️ Pre Kreatívne Štúdio vložte prosím API kľúč v nastaveniach.', {
          duration: 5000
        });
        setShowSettings(true);
      } else {
        setCreativeProject(response.data.project);
        toast.success('✅ Projekt vygenerovaný s gemini-1.5-pro!');
      }
    } catch (error) {
      if (error.message?.includes('API kľúč')) {
        toast.error('⚠️ Vložte API kľúč v nastaveniach', { duration: 5000 });
        setShowSettings(true);
      } else {
        toast.error('Chyba pri generovaní projektu');
      }
    } finally {
      setLoadingCreative(false);
    }
  };

  // Analyzovať komentáre
  const analyzeComments = async () => {
    if (!commentsInput.trim()) {
      toast.error('Vložte komentáre');
      return;
    }
    
    setLoadingComments(true);
    try {
      const response = await base44.functions.invoke('analyzujKomentare', { 
        comments_text: commentsInput,
        campaign_name: campaignNameInput 
      });
      setCommentsAnalysis(response.data.analysis);
      toast.success(response.data.message);
      setCommentsInput("");
      setCampaignNameInput("");
      refetchBrain();
      refetchCampaigns();
    } catch (error) {
      toast.error('Chyba pri analýze komentárov');
    } finally {
      setLoadingComments(false);
    }
  };

  // Uložiť Google Drive link
  const saveDriveLink = async () => {
    if (!driveLink.trim()) {
      toast.error('Zadajte Google Drive link');
      return;
    }

    setSavingDriveLink(true);
    try {
      // Extract folder ID from Google Drive URL
      const folderIdMatch = driveLink.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (!folderIdMatch) {
        toast.error('Neplatný Google Drive link. Použite formát: https://drive.google.com/drive/folders/...');
        setSavingDriveLink(false);
        return;
      }

      const folderId = folderIdMatch[1];
      
      // Test prístupu k priečinku (rekurzívne, vrátane podpriečinkov)
      toast.info('Testujem prístup k Google Drive priečinku...', { duration: 3000 });
      
      const response = await base44.functions.invoke('googleDrive', {
        action: 'listFolderContents',
        folderId: folderId,
        recursive: 'true'
      });

      const files = response.data || [];
      
      if (files.length === 0) {
        toast.warning('Priečinok je prázdny alebo neobsahuje obrázky. Link bude uložený.', { duration: 4000 });
      } else {
        toast.success(`✅ Prístup overený! Nájdených ${files.length} obrázkov (vrátane podpriečinkov)`, { duration: 5000 });
      }

      // Ulož link
      if (assets.length > 0) {
        await base44.entities.MarketingAssets.update(assets[0].id, { 
          link: driveLink,
          description: `Hlavný priečinok s fotkami a videami (${files.length} obrázkov)`
        });
      } else {
        await base44.entities.MarketingAssets.create({ 
          asset_type: 'google_drive_link',
          link: driveLink,
          active: true,
          description: `Hlavný priečinok s fotkami a videami (${files.length} obrázkov)`
        });
      }
      
      toast.success('Google Drive link uložený!');
      refetchAssets();
    } catch (error) {
      if (error.response?.data?.needsAuth) {
        toast.error('⚠️ Potrebujete autorizovať Google Drive v nastaveniach.', { duration: 5000 });
      } else if (error.response?.data?.error?.includes('Token expired')) {
        toast.error('Token vypršal. Prejdite do Admin Google Drive a znovu sa pripojte.', { duration: 5000 });
      } else {
        toast.error('Chyba pri overovaní prístupu: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSavingDriveLink(false);
    }
  };

  // Test Gemini API Connection
  const testAPIConnection = async () => {
    setTestingAPI(true);
    try {
      const response = await base44.functions.invoke('testGeminiConnection');
      setApiTestResult(response.data);
      if (response.data.success) {
        toast.success('API pripojenie funguje!');
      } else {
        toast.error('API pripojenie zlyhalo');
      }
    } catch (error) {
      setApiTestResult({ success: false, error: error.message });
      toast.error('Chyba pri testovaní API');
    } finally {
      setTestingAPI(false);
    }
  };

  // Automaticky nájdi slovenskú konkurenciu
  const findCompetitors = async () => {
    setLoadingCompetitors(true);
    try {
      const response = await base44.functions.invoke('findSlovakCompetitors');
      toast.success(response.data.message);
      refetchCompetitors();
    } catch (error) {
      toast.error('Chyba pri hľadaní konkurencie');
    } finally {
      setLoadingCompetitors(false);
    }
  };

  // Uložiť API kľúč
  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Zadajte API kľúč');
      return;
    }
    
    setSavingApiKey(true);
    try {
      const response = await base44.functions.invoke('saveGeminiApiKey', { api_key: apiKey });
      if (response.data.success) {
        toast.success('✅ API kľúč validovaný!', {
          description: response.data.instructions,
          duration: 8000
        });
        setApiKey("");
        // Automaticky spusti test connection
        setTimeout(() => testAPIConnection(), 1000);
      } else {
        toast.error(response.data.error || 'Chyba pri validácii kľúča');
      }
    } catch (error) {
      toast.error('Chyba pri validácii kľúča');
    } finally {
      setSavingApiKey(false);
    }
  };

  // Spustiť kompletnú diagnostiku
  const runDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const response = await base44.functions.invoke('diagnostikaIntegracii');
      setDiagnostics(response.data);
      
      if (response.data.summary.overall_status === 'success') {
        toast.success('✅ Všetky integrácie fungujú správne!');
      } else if (response.data.summary.overall_status === 'warning') {
        toast.warning(`⚠️ Našli sa nejaké varovania (${response.data.summary.warnings})`);
      } else {
        toast.error(`❌ Našli sa problémy (${response.data.summary.failed} zlyhania)`);
      }
    } catch (error) {
      toast.error('Chyba pri diagnostike: ' + error.message);
      setDiagnostics({ error: error.message });
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <MarketingNotifications />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-600" />
              🤖 AI Marketingový Riaditeľ
            </h1>
            <p className="text-gray-600">Váš virtuálny kolega pre dátami poháňané rozhodnutia</p>

            {/* Automatizácia Status */}
            {lastAnalysis && (
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    lastAnalysis.status === 'completed' ? 'bg-green-500 animate-pulse' :
                    lastAnalysis.status === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-600">
                    Posledná analýza: <strong>{format(new Date(lastAnalysis.created_date), 'dd.MM.yyyy HH:mm', { locale: sk })}</strong>
                    {lastAnalysis.status === 'completed' && ` (${lastAnalysis.execution_time_seconds?.toFixed(1)}s)`}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  Ďalšia naplánovaná: <strong>Zajtra 07:00</strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* NOVÉ: Analyzovať UX Problémy */}
            <Button
              onClick={async () => {
                toast.info('🕵️‍♂️ Analyzujem posledné nahrávky používateľov...');
                try {
                  const response = await base44.functions.invoke('processUserSessions');
                  if (response.data.success) {
                    toast.success(`✅ ${response.data.message}`, {
                      description: `Úspešne: ${response.data.analyzed}, Zlyhalo: ${response.data.failed}`
                    });
                  }
                } catch (error) {
                  toast.error('Chyba pri analýze: ' + error.message);
                }
              }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 bg-purple-50 border-purple-300 hover:bg-purple-100"
              title="Spustí AI analýzu nahrávok, kde používatelia klikali zúrivo alebo narazili na chybu."
            >
              <Brain className="w-5 h-5 text-purple-600" />
              🕵️‍♂️ Analyzovať UX Problémy
            </Button>

            {/* NOVÉ: Generovať Stratégiu */}
            <Button
              title="Vytvorí textový návrh marketingových krokov na základe dát z webu."
              onClick={async () => {
                toast.info('🧠 Generujem stratégiu...');
                try {
                  // Reuse allSessions namiesto nového DB volania
                  const sessions = allSessions.length > 0 ? allSessions : await base44.entities.UserSession.list('-created_date', 500);
                  
                  // Agregované štatistiky
                  const stats = {
                    total_sessions: sessions.length,
                    total_rage_clicks: sessions.reduce((sum, s) => sum + (s.rage_clicks?.length || 0), 0),
                    total_errors: sessions.reduce((sum, s) => sum + (s.console_errors?.length || 0), 0),
                    total_conversions: sessions.filter(s => s.conversions?.length > 0).length,
                    conversion_rate: sessions.length > 0 
                      ? ((sessions.filter(s => s.conversions?.length > 0).length / sessions.length) * 100).toFixed(2)
                      : 0,
                    top_errors: (() => {
                      const errorCounts = {};
                      sessions.forEach(s => {
                        s.console_errors?.forEach(err => {
                          errorCounts[err.message] = (errorCounts[err.message] || 0) + 1;
                        });
                      });
                      return Object.entries(errorCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([message, count]) => ({ message, count }));
                    })(),
                    problematic_pages: (() => {
                      const pageFrustration = {};
                      sessions.forEach(s => {
                        s.pages_visited?.forEach(p => {
                          if (!pageFrustration[p.page_url]) {
                            pageFrustration[p.page_url] = { count: 0, frustration: 0 };
                          }
                          pageFrustration[p.page_url].count++;
                          pageFrustration[p.page_url].frustration += (s.frustration_score || 0);
                        });
                      });
                      return Object.entries(pageFrustration)
                        .sort((a, b) => (b[1].frustration / b[1].count) - (a[1].frustration / a[1].count))
                        .slice(0, 5)
                        .map(([url]) => url);
                    })()
                  };

                  const response = await base44.functions.invoke('AIService', {
                    action: 'generateMarketingStrategy',
                    data: { aggregatedStats: stats }
                  });

                  if (response.data.success) {
                    const strategy = response.data.strategy;
                    
                    // Zobraz v dialógu
                    const modalContent = `
📊 ${strategy.overall_insight}

ODPORÚČANÉ KROKY:

${strategy.actions?.map((action, i) => `
${i + 1}. ${action.title} [${action.priority.toUpperCase()}]
   ${action.description}
   💡 Dopad: ${action.expected_impact}
`).join('\n')}
                    `;

                    toast.success('Stratégia vygenerovaná!', {
                      description: modalContent,
                      duration: 15000
                    });
                  }
                } catch (error) {
                  toast.error('Chyba: ' + error.message);
                }
              }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 bg-green-50 border-green-300 hover:bg-green-100"
            >
              <Lightbulb className="w-5 h-5 text-green-600" />
              🧠 Generovať Stratégiu
            </Button>

            {/* Settings Button */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="flex items-center gap-2" title="Nastavenia API kľúčov a diagnostika integrácií">
                <Settings className="w-5 h-5" />
                ⚙️ Nastavenia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-600" />
                  ⚙️ Nastavenia AI Marketéra
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* API Key Input */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      🔑 Google AI Studio API Key
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      Získajte svoj kľúč na: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">aistudio.google.com/app/apikey</a>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">API Key</Label>
                        <Input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy... (z aistudio.google.com)"
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Kľúč začína "AIzaSy" a má prístup k gemini-1.5-pro modelu
                        </p>
                      </div>
                      <Button
                        onClick={saveApiKey}
                        disabled={savingApiKey || !apiKey.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        title="Overí platnosť API kľúča volaním Gemini API a poskytne inštrukcie na uloženie"
                      >
                        {savingApiKey ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Validujem a ukladám...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Validovať a uložiť kľúč
                          </>
                        )}
                      </Button>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs text-blue-900">
                          <strong>📍 Postup:</strong> Po validácii prejdite do Dashboard → Settings → Environment Variables 
                          a nastavte: <code className="bg-blue-100 px-1">Gemini_PAID_pro</code>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* API Test */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">🔌 Gemini API Connection Test</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Model: <strong>gemini-1.5-pro</strong> (Deep Reasoning)
                    </p>
                    <Button
                      onClick={testAPIConnection}
                      disabled={testingAPI}
                      className="w-full bg-purple-600 hover:bg-purple-700 mb-3"
                      title="Otestuje spojenie s Gemini API a overí funkčnosť modelu"
                    >
                      {testingAPI ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testujem pripojenie...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          TEST CONNECTION
                        </>
                      )}
                    </Button>

                    {apiTestResult && (
                      <div className={`p-4 rounded-lg border-2 ${
                        apiTestResult.success 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {apiTestResult.success ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-bold text-green-900">✅ API Connected (Deep Reasoning Active)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="font-bold text-red-900">❌ Connection Failed</span>
                            </>
                          )}
                        </div>
                        {apiTestResult.success ? (
                          <div className="text-xs text-green-800 space-y-1">
                            <div><strong>Model:</strong> {apiTestResult.model}</div>
                            <div><strong>Response:</strong> {apiTestResult.test_response}</div>
                            <div className="pt-2 text-green-600 font-semibold">🚀 Systém je pripravený na Deep Reasoning!</div>
                          </div>
                        ) : (
                          <div className="text-xs text-red-800">
                            <strong>Error:</strong> {apiTestResult.error}
                            <p className="mt-2 text-red-700">💡 Tip: Skontrolujte, či je API kľúč správny a či máte povolený prístup k gemini-1.5-pro modelu.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Diagnostika Integrácií */}
                <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-cyan-600" />
                      🔍 Kompletná Diagnostika Integrácií
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      Otestuje všetky integrácie, API kľúče a OAuth pripojenia
                    </p>
                    <Button
                      onClick={runDiagnostics}
                      disabled={loadingDiagnostics}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 mb-3"
                      title="Kompletný test všetkých API integrácií, OAuth pripojení a secrets"
                    >
                      {loadingDiagnostics ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Spúšťam diagnostiku...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          🔍 Spustiť diagnostiku
                        </>
                      )}
                    </Button>

                    {diagnostics && (
                      <div className="space-y-3">
                        {/* Summary */}
                        {diagnostics.summary && (
                          <div className={`p-4 rounded-lg border-2 ${
                            diagnostics.summary.overall_status === 'success' ? 'bg-green-50 border-green-300' :
                            diagnostics.summary.overall_status === 'warning' ? 'bg-yellow-50 border-yellow-300' :
                            'bg-red-50 border-red-300'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {diagnostics.summary.overall_status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : diagnostics.summary.overall_status === 'warning' ? (
                                <Brain className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span className="font-bold">
                                Súhrn: {diagnostics.summary.success}✓ / {diagnostics.summary.failed}✗ / {diagnostics.summary.warnings}⚠️
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Detailné výsledky */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {diagnostics.tests?.map((test, idx) => (
                            <div key={idx} className={`p-3 rounded border text-xs ${
                              test.status === 'success' ? 'bg-green-50 border-green-200' :
                              test.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-bold">{test.name}</span>
                                <Badge className={
                                  test.status === 'success' ? 'bg-green-600' :
                                  test.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                                }>
                                  {test.status}
                                </Badge>
                              </div>
                              {test.result && <div className="text-gray-700">✓ {test.result}</div>}
                              {test.message && <div className="text-gray-700">{test.message}</div>}
                              {test.error && <div className="text-red-700">✗ {test.error}</div>}
                              {test.suggestion && (
                                <div className="text-blue-700 mt-1">💡 {test.suggestion}</div>
                              )}
                            </div>
                          ))}
                        </div>

                        {diagnostics.error && (
                          <div className="bg-red-50 p-3 rounded border border-red-200 text-xs text-red-800">
                            <strong>Chyba:</strong> {diagnostics.error}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
                  <strong>ℹ️ Info:</strong> API kľúč je bezpečne uložený v Secrets ako "Gemini_PAID_pro". 
                  Backend automaticky používa gemini-1.5-pro pre pokročilé reasoning.
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="mb-8">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="text-sm sm:text-base">🎯 Dashboard</TabsTrigger>
            <TabsTrigger value="chat" className="text-sm sm:text-base">💬 AI Partner</TabsTrigger>
            <TabsTrigger value="overview" className="text-sm sm:text-base">📊 Prehľad</TabsTrigger>
            <TabsTrigger value="strategy" className="text-sm sm:text-base">🧠 Stratégia</TabsTrigger>
            <TabsTrigger value="planner" className="text-sm sm:text-base">🚀 Plánovač</TabsTrigger>
            <TabsTrigger value="automated" className="text-sm sm:text-base">⚡ Automatizácia</TabsTrigger>
          </TabsList>

          {/* Unified Dashboard */}
          <TabsContent value="dashboard">
            <UnifiedDashboard />
          </TabsContent>

          {/* NOVÁ KARTA: AI Chat Partner */}
          <TabsContent value="chat">
            <div className="space-y-4">
              <PersonalizedRecommendations 
                history={marketingHistory}
                onRecommendationClick={(action) => {
                  if (chatInputRef) {
                    chatInputRef(action.replace('Spýtaj sa AI: ', '').replace(/"/g, ''));
                    toast.info('Odporúčanie načítané do chatu');
                  }
                }}
              />
              
              <AIMarketingChat 
                totalApiCost={totalApiCost}
                onInputRefReady={setChatInputRef}
                onStrategyApproved={(strategy) => {
                  console.log('Strategy approved:', strategy);
                  refetchQueue();
                  refetchBrain();
                  refetchHistory();
                }}
              />
            </div>
          </TabsContent>

          {/* KARTA A: Prehľad a Výkon */}
          <TabsContent value="overview">
            <div className="space-y-8">

        {/* Automatizácia Dashboard */}
        {lastAnalysis && lastAnalysis.status === 'completed' && (
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-green-600" />
                ☕ Ranný Brífing (Automaticky vygenerovaný)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Analyzované včera</p>
                  <p className="text-2xl font-bold text-green-900">
                    {lastAnalysis.sessions_analyzed} sessions
                  </p>
                  <p className="text-xs text-gray-500">{lastAnalysis.dopyty_analyzed} dopytov</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Čas vykonania</p>
                  <p className="text-2xl font-bold text-green-900">
                    {lastAnalysis.execution_time_seconds?.toFixed(1)}s
                  </p>
                  {lastAnalysis.competitors_updated && (
                    <Badge className="bg-purple-600 text-white text-xs mt-1">Konkurencia aktualizovaná</Badge>
                  )}
                </div>
              </div>

              {lastAnalysis.draft_post && (
                <div className="bg-white p-4 rounded-lg border-2 border-green-300 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600 text-white">{lastAnalysis.draft_post.platform}</Badge>
                    <Badge variant="outline">{lastAnalysis.draft_post.target_house}</Badge>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{lastAnalysis.draft_post.post_text}</p>
                  <p className="text-xs text-purple-700">🧠 {lastAnalysis.draft_post.psychological_trigger}</p>
                </div>
              )}

              {lastAnalysis.strategic_briefing && (
                <details className="bg-white p-3 rounded-lg border border-green-200">
                  <summary className="cursor-pointer font-semibold text-sm text-green-900 mb-2">
                    📋 Zobraziť celý strategický brífing
                  </summary>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed mt-2">
                    {lastAnalysis.strategic_briefing}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}

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
                  title="AI vytvorí súhrn týždňa - trendy dom, bounce rate, odporúčania"
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
                  title="Vygeneruje text príspevku pre najpopulárnejší dom z posledných 7 dní"
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
                      title="Skopíruje text do schránky na priame použitie"
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

        {/* História kampaní */}
        <CampaignHistoryTable history={marketingHistory || []} />

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
            <StrategyTab rawIdea={rawIdea} setRawIdea={setRawIdea} creativeProject={creativeProject} loadingCreative={loadingCreative} improveIdea={improveIdea} driveLink={driveLink} setDriveLink={setDriveLink} savingDriveLink={savingDriveLink} saveDriveLink={saveDriveLink} assets={assets} clientConcerns={clientConcerns} strategicBriefing={strategicBriefing} loadingBriefing={loadingBriefing} runDeepThinkStrategist={runDeepThinkStrategist} newKnowHow={newKnowHow} setNewKnowHow={setNewKnowHow} saveKnowHow={saveKnowHow} brainRules={brainRules} commentsInput={commentsInput} setCommentsInput={setCommentsInput} campaignNameInput={campaignNameInput} setCampaignNameInput={setCampaignNameInput} commentsAnalysis={commentsAnalysis} loadingComments={loadingComments} analyzeComments={analyzeComments} campaigns={campaigns} newCompetitor={newCompetitor} setNewCompetitor={setNewCompetitor} saveCompetitor={saveCompetitor} competitors={competitors} loadingCompetitors={loadingCompetitors} findCompetitors={findCompetitors} />
          </TabsContent>

          {/* REMOVED PLACEHOLDER_MARKER */}
                <CardContent>
                  <div className="space-y-4-BOGUS">
                    <Button
                      onClick={improveIdea}
                      disabled={loadingCreative}
                      size="lg"
                      className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-gray-900 font-bold"
                      title="AI premení váš nápad na kompletný produkčný plán s detailným scenárom"
                    >
                      {loadingCreative ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                          AI vytvára projekt...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Vylepšiť môj nápad
                        </>
                      )}
                    </Button>

                    {creativeProject && (
                      <div className="bg-white text-gray-900 p-6 rounded-lg space-y-4">
                        <div>
                          <h4 className="font-bold text-lg mb-2 text-purple-900">✨ Vylepšený koncept</h4>
                          <p className="text-sm leading-relaxed">{creativeProject.improved_concept}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                          <h4 className="font-bold text-lg mb-2 text-blue-900">🎬 Detailný scenár</h4>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{creativeProject.detailed_scenario}</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                          <h4 className="font-bold text-lg mb-3 text-green-900">🎥 Metodika výroby</h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <strong>💡 Svetlo:</strong> {creativeProject.production_guide.lighting}
                            </div>
                            <div>
                              <strong>🎵 Hudba:</strong> {creativeProject.production_guide.music_style}
                            </div>
                            <div>
                              <strong>📹 Kamera:</strong> {creativeProject.production_guide.camera_instructions}
                            </div>
                            <div>
                              <strong>⏱️ Dĺžka:</strong> {creativeProject.production_guide.duration}
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                            <strong>🎯 Kľúčový odkaz:</strong> {creativeProject.production_guide.key_message}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                          <p className="text-sm font-medium">{creativeProject.visual_assets_reminder}</p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                          <h4 className="font-bold text-sm mb-2 text-orange-900">📊 Predikovaný dopad</h4>
                          <div className="grid md:grid-cols-2 gap-2 text-xs">
                            <div><strong>Dosah:</strong> {creativeProject.estimated_impact.predicted_reach}</div>
                            <div><strong>Cieľovka:</strong> {creativeProject.estimated_impact.target_audience}</div>
                            <div className="md:col-span-2">
                              <strong>Psychologické triggery:</strong> {creativeProject.estimated_impact.psychological_triggers.join(', ')}
                            </div>
                            <div><strong>AIDA fáza:</strong> {creativeProject.estimated_impact.aida_stage}</div>
                          </div>
                        </div>

                        <div className="bg-gray-100 p-3 rounded">
                          <p className="text-xs text-gray-700">
                            <strong>✅ Compliance:</strong> {creativeProject.compliance_check}
                          </p>
                        </div>

                        {/* Reasoning sekcia */}
                        {creativeProject.reasoning && (
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-400">
                            <h4 className="font-bold text-sm mb-2 text-purple-900">🧠 PREČO SOM SA TAKTO ROZHODOL?</h4>
                            <p className="text-xs text-purple-800 whitespace-pre-line leading-relaxed">
                              {creativeProject.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dátový Trezor - Google Drive Assets */}
              <Card className="border-cyan-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-600" />
                    📂 Dátový Trezor (Google Drive Assets)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Link na Google Drive priečinok</Label>
                      <Input
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </div>
                    <Button
                      onClick={saveDriveLink}
                      disabled={savingDriveLink}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      title="Uloží Google Drive priečinok s fotkami a videami pre AI pripomienky"
                    >
                      {savingDriveLink ? 'Ukladám...' : 'Uložiť link'}
                    </Button>
                    {driveLink && (
                      <div className="bg-cyan-50 p-3 rounded border border-cyan-200">
                        <p className="text-xs text-cyan-900">
                          ✅ AI bude automaticky pripomínať tento link pri generovaní príspevkov
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                </Card>

                </TabsContent>

          {/* KARTA D: Automatizované Kampane */}
          <TabsContent value="automated">
            <div className="space-y-8">
              <AutomatedCampaignsSection />
              
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-600" />
                    💡 Ako to funguje
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-2">
                  <p>✅ <strong>Vytvorte šablónu</strong> s názvom, typom a základnými parametrami</p>
                  <p>✅ <strong>AI optimalizácia</strong> navrhne ideálny budget, cielenie a kreatívne pokyny na základe histórie</p>
                  <p>✅ <strong>Použite šablónu</strong> v AI Marketing Chat napísaním: "Vytvor kampaň podľa šablóny [názov]"</p>
                  <p>✅ <strong>AI doplní</strong> konkrétne domy, copy, vizuály a detaily</p>
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
                    title="AI vytvorí 7 príspevkov na základe vášho budgetu, behaviorálneho profilingu a know-how"
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
              {weeklyPlan && weeklyPlan.posts && weeklyPlan.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      📅 Navrhovaný týždenný plán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Behavioral Segmentation Info */}
                    {weeklyPlan.behavioral_segmentation && (
                      <div className="mb-6 bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg border-2 border-blue-400">
                        <h4 className="font-bold text-sm mb-3 text-blue-900 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          🎯 BEHAVIORÁLNE CIELENIE
                        </h4>
                        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                          <div className="bg-white p-2 rounded border border-blue-300">
                            <div className="font-bold text-blue-900">SENIOR/DOWNSIZING</div>
                            <div className="text-2xl font-black text-blue-600">{weeklyPlan.behavioral_segmentation.profile_counts.SENIOR_DOWNSIZING.count}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-300">
                            <div className="font-bold text-green-900">ŠTART/RODINA</div>
                            <div className="text-2xl font-black text-green-600">{weeklyPlan.behavioral_segmentation.profile_counts.START_MLADA_RODINA.count}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-orange-300">
                            <div className="font-bold text-orange-900">INVESTOR</div>
                            <div className="text-2xl font-black text-orange-600">{weeklyPlan.behavioral_segmentation.profile_counts.INVESTOR_BYROKRACIA.count}</div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border-2 border-blue-500">
                          <p className="text-xs text-blue-900">
                            <strong>🎯 Cielíme na:</strong> {weeklyPlan.behavioral_segmentation.target_description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Overall Reasoning */}
                    {weeklyPlan.overall_reasoning && (
                      <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-400">
                        <h4 className="font-bold text-sm mb-2 text-purple-900 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          🧠 PREČO SOM VYTVORIL PRÁVE TAKÝTO PLÁN?
                        </h4>
                        <p className="text-xs text-purple-800 whitespace-pre-line leading-relaxed">
                          {weeklyPlan.overall_reasoning}
                        </p>
                        {weeklyPlan.target_profile_used && (
                          <div className="mt-3 bg-purple-200 p-2 rounded">
                            <p className="text-xs text-purple-900">
                              <strong>🎯 Profil:</strong> {weeklyPlan.target_profile_used}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      {weeklyPlan.posts.map((post, index) => (
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
                            {post.reasoning && (
                              <div className="bg-indigo-50 p-3 rounded border border-indigo-200 mt-2">
                                <p className="text-xs text-indigo-900">
                                  <strong>💭 Reasoning:</strong> {post.reasoning}
                                </p>
                              </div>
                            )}
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
                        💰 Celkový týždenný budget: {weeklyPlan.posts.reduce((acc, p) => acc + p.budget, 0)}€
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