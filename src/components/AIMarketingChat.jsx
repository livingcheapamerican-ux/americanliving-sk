import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Send, Sparkles, CheckCircle, Loader2, MessageSquare, AlertCircle, Settings, Zap, Key, Instagram, Facebook, XCircle, Eye, Lightbulb, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AIMarketingChat({ totalApiCost = 0, onStrategyApproved, onInputRefReady }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [testingAPI, setTestingAPI] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const [pendingSuggestions, setPendingSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Expose setInput to parent
  useEffect(() => {
    if (onInputRefReady) {
      onInputRefReady((text) => setInput(text));
    }
  }, [onInputRefReady]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentActivity]);

  // Load chat history and add welcome message (iba raz pri monte)
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_marketing_chat_history');
    const savedBudget = localStorage.getItem('monthly_marketing_budget');
    
    if (savedBudget) {
      setMonthlyBudget(parseInt(savedBudget));
    }
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
    
    // Len ak nie je žiadna história, vytvor welcome message
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: `👋 Ahoj! Som tvoj **AI Marketing Director** - centrálny mozog firmy.

✨ **Som tvoj osobný MARKETING MENTOR:**
✅ Sprevádzam ťa KROK-PO-KROKU cez celý proces
✅ Vysvetľujem všetky technické veci jednoducho
✅ Dávam ti PRESNÉ NÁVODY kde kliknúť a co vyplniť
✅ Učím ťa Facebook & Instagram reklamy od NULY
✅ Kontrolujem či robíš kroky správne
✅ Pomáham s formátmi, rozlíšeniami, nastaveniami

🎬 **Komplexná tvorba kampane:**
- Koncept & psychológia (prečo to funguje)
- Technické specs (rozlíšenia, formáty, veľkosti)
- Video scenár (shot-by-shot)
- Suno hudba (BPM, mood, efekty, prompt)
- Copy (primary text, headline, CTA)
- Targeting (vek, miesto, záujmy - PRESNÉ hodnoty)
- Budget & Timeline
- **KROK-PO-KROKU NÁVOD** kde v Ads Manageri kliknúť
- Checklist pred publikovaním

📚 **Viem všetko o FB/IG reklamách:**
- Ako nastaviť Business Manager
- Aké sú rozmery pre každý formát
- Kde nájdem Ads Manager
- Ako nastaviť pixel & tracking
- Čo znamenajú metriky (CTR, CPM, ROAS)

**Začni napríklad:**
- "Chcem vytvoriť prvú kampaň, pomôž mi od začiatku"
- "Aké rozmery potrebujem pre Instagram Reel?"
- "Vytvor kampaň na Washington + uč ma ako ju nastaviť"

⚙️ Klikni na ⚙️ Settings, vlož API kľúč a môžeme začať! 🚀`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  // Save history (len ak sa skutočne zmenili)
  useEffect(() => {
    if (messages.length > 0) {
      const savedHistory = localStorage.getItem('ai_marketing_chat_history');
      const newHistory = JSON.stringify(messages);
      if (savedHistory !== newHistory) {
        localStorage.setItem('ai_marketing_chat_history', newHistory);
      }
    }
  }, [messages]);

  // Save budget (len pri zmene)
  useEffect(() => {
    const saved = localStorage.getItem('monthly_marketing_budget');
    const newValue = monthlyBudget.toString();
    if (saved !== newValue) {
      localStorage.setItem('monthly_marketing_budget', newValue);
    }
  }, [monthlyBudget]);

  const sendMessage = async () => {
    if (!input || !input.trim() || isThinking) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setCurrentActivity({ status: 'analyzing', text: '📊 Zbierám dáta z databázy...' });

    try {
      setTimeout(() => {
        setCurrentActivity({ status: 'reasoning', text: '🧠 Deep reasoning prebieha...' });
      }, 1500);

      const response = await base44.functions.invoke('aiMarketingChat', {
        user_message: input,
        chat_history: messages.slice(-10),
        monthly_budget: monthlyBudget
      });

      setCurrentActivity({ status: 'generating', text: '✨ Generujem odpoveď...' });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        thinking_process: response.data.thinking_process,
        market_analysis: response.data.market_analysis,
        competitive_insights: response.data.competitive_insights,
        data_sources: response.data.data_sources,
        api_cost: response.data.estimated_cost_eur,
        api_duration: response.data.api_call_duration_ms,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Pridaj suggestions do samostatnej sekcie
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setPendingSuggestions(prev => [
          ...prev,
          ...response.data.suggestions.map(s => ({ 
            ...s, 
            messageId: aiMessage.id, 
            timestamp: new Date().toISOString(),
            id: `${Date.now()}_${Math.random()}` 
          }))
        ]);
      }

      setCurrentActivity(null);

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `😞 Ospravedlňujem sa, mal som technický problém.

**Chyba:** ${error.message || 'Neznáma chyba'}

**Čo skúsiť:**
1. Klikni na ⚙️ Settings a over API kľúč
2. Skús "Test API" pre diagnostiku
3. Alebo skús znova o chvíľu

Konzola (F12) má viac detailov.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Chyba pri komunikácii s AI');
      setCurrentActivity(null);
    } finally {
      setIsThinking(false);
    }
  };

  const approveSuggestion = async (suggestion) => {
    try {
      // Získať aktuálneho usera
      const currentUser = await base44.auth.me();
      
      if (suggestion.type === 'price_strategy') {
        await base44.functions.invoke('aiMarketingChat', {
          action: 'approve_price_change',
          dom_id: suggestion.dom_id,
          new_price: suggestion.suggested_price,
          old_price: suggestion.current_price,
          reasoning: suggestion.reasoning
        });
        toast.success('💰 Cenová úprava schválená a aplikovaná!');
      } else {
        await base44.entities.MarketingHistory.create({
          action_type: 'campaign_approved',
          title: suggestion.title || 'Kampaň schválená',
          description: suggestion.description || 'AI vygenerovaná kampaň',
          data: suggestion,
          budget_allocated: suggestion.budget_allocation || suggestion.budget?.total || 0,
          user_email: currentUser?.email || 'unknown',
          status: 'completed'
        });
        toast.success('🚀 Stratégia schválená a uložená!');
      }

      setPendingSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

      if (onStrategyApproved) {
        onStrategyApproved(suggestion);
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Chyba pri schvaľovaní: ' + error.message);
    }
  };

  const rejectSuggestion = async (suggestion) => {
    try {
      const currentUser = await base44.auth.me();
      
      await base44.entities.MarketingHistory.create({
        action_type: 'campaign_rejected',
        title: suggestion.title || 'Zamietnutá stratégia',
        description: suggestion.description || JSON.stringify(suggestion).substring(0, 200),
        data: suggestion,
        status: 'rejected',
        user_email: currentUser?.email || 'unknown'
      });
      setPendingSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      toast.info('Návrh zamietnutý a uložený do histórie');
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Chyba pri zamietaní: ' + error.message);
    }
  };

  const testAPI = async () => {
    setTestingAPI(true);
    try {
      const response = await base44.functions.invoke('testAIMarketingAPI');
      console.log('Test response:', response.data);
      setApiStatus(response.data);
      if (response.data.success) {
        toast.success('✅ API funguje! Odpoveď: ' + response.data.test_response);
      } else {
        toast.error('❌ API zlyhalo: ' + (response.data.error || 'Neznáma chyba'));
        console.error('API Error details:', response.data);
      }
    } catch (error) {
      console.error('Test error:', error);
      setApiStatus({ success: false, error: error.message });
      toast.error('Chyba: ' + error.message);
    } finally {
      setTestingAPI(false);
    }
  };



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat Panel */}
      <Card className="lg:col-span-2 h-[900px] flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
      <CardHeader className="border-b bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 animate-pulse" />
            <div>
              <CardTitle className="text-lg">🧠 AI Marketing Director</CardTitle>
              <p className="text-xs text-purple-200">Centrálny mozog s prístupom ku všetkému</p>
            </div>
          </div>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-800">
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Settings className="w-6 h-6 text-purple-600" />
                  ⚙️ Nastavenia AI Marketing Direktora
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* API Status */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-indigo-600" />
                      🔑 Google Gemini API Status
                    </h3>

                    <div className="bg-green-50 border border-green-300 p-4 rounded-lg mb-4">
                      <p className="text-sm text-green-900 font-semibold mb-1">✅ API kľúč je nastavený</p>
                      <p className="text-xs text-green-700">Secret "Gemini_PAID_pro" je nakonfigurovaný v Dashboard → Settings → Environment Variables</p>
                    </div>

                    <Button onClick={testAPI} disabled={testingAPI} className="w-full bg-purple-600 hover:bg-purple-700">
                      {testingAPI ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Test API Pripojenie
                    </Button>

                    {apiStatus && (
                      <div className={`p-3 rounded mt-3 ${apiStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className={`text-xs ${apiStatus.success ? 'text-green-900' : 'text-red-900'}`}>
                          {apiStatus.success ? (
                            <>
                              <strong>✅ Pripojenie funguje!</strong><br />
                              Model: {apiStatus.model}<br />
                              Response: {apiStatus.test_response}
                            </>
                          ) : (
                            <>
                              <strong>❌ Chyba pripojenia</strong><br />
                              Status: {apiStatus.status}<br />
                              Error: {apiStatus.error}<br /><br />
                              {apiStatus.api_key_prefix && (
                                <>API Key prefix: {apiStatus.api_key_prefix}<br /></>
                              )}
                              <strong>Riešenie:</strong> Over API kľúč v Dashboard → Settings → Environment Variables
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Budget */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">💰 Mesačný Marketingový Rozpočet</h3>
                    <div>
                      <Label>Budget (EUR)</Label>
                      <Input
                        type="number"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(parseInt(e.target.value))}
                        min={100}
                        className="text-2xl font-bold"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        AI automaticky optimalizuje kampaň podľa tohto rozpočtu
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <Instagram className="w-5 h-5 text-pink-600" />
                      📱 Sociálne Siete
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded">
                        <span className="text-sm">Facebook Business</span>
                        <Badge className="bg-green-600">✓ API Ready</Badge>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded">
                        <span className="text-sm">Instagram Business</span>
                        <Badge className="bg-green-600">✓ API Ready</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        🎯 AI analyzuje lajky, komentáre, engagement a vytára stratégiu
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {currentActivity && (
          <Badge className="bg-yellow-400 text-yellow-900 animate-pulse mt-2">
            <Activity className="w-3 h-3 mr-1 animate-spin" />
            {currentActivity.text}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'user' ? (
                <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 max-w-[80%]">
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs text-purple-200 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('sk-SK')}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-4 max-w-[85%] border-2 border-purple-300">
                  {/* Thinking Process */}
                  {message.thinking_process && (
                    <details className="mb-3 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border border-purple-300">
                      <summary className="cursor-pointer font-semibold text-sm text-purple-900 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        🧠 Môj myšlienkový proces
                      </summary>
                      <div className="mt-2 text-xs text-purple-800 whitespace-pre-line pl-6">
                        {message.thinking_process}
                      </div>
                    </details>
                  )}

                  {/* Market Analysis */}
                  {message.market_analysis && (
                    <div className="mb-3 bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg border border-blue-300">
                      <h5 className="font-semibold text-sm text-blue-900 mb-1">📊 Trhová Analýza</h5>
                      <p className="text-xs text-blue-800 whitespace-pre-line">{message.market_analysis}</p>
                    </div>
                  )}

                  {/* Competitive Insights */}
                  {message.competitive_insights && (
                    <div className="mb-3 bg-gradient-to-r from-red-100 to-orange-100 p-3 rounded-lg border border-red-300">
                      <h5 className="font-semibold text-sm text-red-900 mb-1">🏆 Konkurenčná Analýza</h5>
                      <p className="text-xs text-red-800 whitespace-pre-line">{message.competitive_insights}</p>
                    </div>
                  )}

                  {/* Main Response */}
                  <div className="prose prose-sm max-w-none mb-3">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>

                  {/* Data Sources */}
                  {message.data_sources && message.data_sources.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        📊 Zdroje údajov:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {message.data_sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}



                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString('sk-SK')}
                    </p>
                    {message.api_cost && (
                      <p className="text-xs text-green-600">
                        💰 €{parseFloat(message.api_cost).toFixed(6)} | ⏱️ {message.api_duration}ms
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {currentActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3"
          >
            <Activity className="w-5 h-5 animate-spin text-yellow-700" />
            <span className="text-sm font-medium text-yellow-900">{currentActivity.text}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Napríklad: 'Vytvor lead generation kampaň na White Flat 15' alebo 'Analyzuj hot leads a navrhni personalizované kroky' alebo 'Optimalizuj SEO pre dom Washington'"
            rows={3}
            disabled={isThinking}
          />
          <Button
            onClick={sendMessage}
            disabled={isThinking || !input || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            🎬 Môžem vytvoriť video + hudbu + copy | 🎯 Rozpočet: {monthlyBudget}€/mes.
          </p>
          <p className="text-xs text-green-600 font-semibold" title="Celková cena všetkých AI interakcií (Chat, Deep Think, Kreatívne Štúdio, Analýzy)">
            💰 Celkové API náklady: €{totalApiCost.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>

    {/* Campaigns & Suggestions Panel */}
    <Card className="h-[900px] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300">
    <CardHeader className="border-b bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <CardTitle className="text-lg flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        💡 Kampane & Cenové Stratégie
      </CardTitle>
      <p className="text-xs text-blue-200">
        Čaká na schválenie: {pendingSuggestions.length} 
        {pendingSuggestions.filter(s => s.type === 'price_strategy').length > 0 && 
          ` (${pendingSuggestions.filter(s => s.type === 'price_strategy').length} cenových)`}
      </p>
    </CardHeader>

    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
      {pendingSuggestions.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Žiadne návrhy na schválenie</p>
          <p className="text-xs mt-2">Kampane a cenové stratégie sa objavia po konverzácii s AI</p>
        </div>
      ) : (
        pendingSuggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border-2 shadow-md ${
              suggestion.type === 'price_strategy' 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
              : suggestion.type === 'lead_gen_campaign'
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400'
              : suggestion.type === 'behavioral_insight'
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400'
              : suggestion.type === 'seo_optimization'
                ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-400'
                : 'bg-white border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1">
                <Badge className={`${
                  suggestion.type === 'price_strategy' ? 'bg-green-600' 
                  : suggestion.type === 'lead_gen_campaign' ? 'bg-blue-600'
                  : suggestion.type === 'behavioral_insight' ? 'bg-purple-600'
                  : suggestion.type === 'seo_optimization' ? 'bg-orange-600'
                  : 'bg-gray-600'
                } text-white`}>
                  {suggestion.type === 'price_strategy' ? '💰 Cenová Stratégia' 
                  : suggestion.type === 'lead_gen_campaign' ? '🎯 Lead Generation'
                  : suggestion.type === 'behavioral_insight' ? '👤 Behavioral Insights'
                  : suggestion.type === 'seo_optimization' ? '🔍 SEO Optimalizácia'
                  : suggestion.type}
                </Badge>
                {suggestion.budget_allocation && (
                  <Badge className="bg-emerald-600 text-white">{suggestion.budget_allocation}€</Badge>
                )}
                {suggestion.impact_score && (
                  <Badge className={`${
                    suggestion.impact_score > 70 ? 'bg-green-600' :
                    suggestion.impact_score > 40 ? 'bg-yellow-600' : 'bg-gray-600'
                  } text-white`}>
                    {suggestion.impact_score}%
                  </Badge>
                )}
              </div>
            </div>

            {suggestion.type === 'lead_gen_campaign' ? (
              <>
                <h5 className="font-bold text-sm text-gray-900 mb-2">
                  🎯 {suggestion.title}
                </h5>
                <div className="space-y-2 mb-3">
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs font-semibold">Dom: {suggestion.target_house_name}</p>
                    <p className="text-xs">Platform: {suggestion.platform}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-xs font-semibold">Copy:</p>
                    <p className="text-xs mt-1">{suggestion.creative?.primary_text}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="text-xs font-semibold">Očakávané výsledky:</p>
                    <p className="text-xs">{suggestion.expected_results?.estimated_leads} leadov</p>
                    <p className="text-xs">CPL: {suggestion.expected_results?.cost_per_lead}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Budget: €{suggestion.budget?.daily}/deň</Badge>
                    <Badge variant="outline">{suggestion.budget?.duration_days} dní</Badge>
                  </div>
                </div>
              </>
            ) : suggestion.type === 'behavioral_insight' ? (
              <>
                <h5 className="font-bold text-sm text-gray-900 mb-2">
                  👤 {suggestion.title}
                </h5>
                <div className="space-y-2 mb-3">
                  <div className="bg-purple-50 p-2 rounded border border-purple-200">
                    <p className="text-xs font-semibold">Hot Leads: {suggestion.hot_leads_count}</p>
                  </div>
                  {suggestion.recommendations?.map((rec, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border">
                      <p className="text-xs font-semibold">{rec.segment}</p>
                      <p className="text-xs text-gray-600">{rec.action}</p>
                      <p className="text-xs text-green-600">Očakávaná konverzia: {rec.expected_conversion}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : suggestion.type === 'seo_optimization' ? (
              <>
                <h5 className="font-bold text-sm text-gray-900 mb-2">
                  🔍 {suggestion.title}
                </h5>
                <div className="space-y-2 mb-3">
                  <div className="bg-orange-50 p-2 rounded border border-orange-200">
                    <p className="text-xs">Aktuálne: {suggestion.current_ranking}</p>
                    <p className="text-xs font-semibold text-green-600">Cieľ: {suggestion.target_ranking}</p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs font-semibold">Primary Keyword:</p>
                    <p className="text-xs">{suggestion.keywords?.primary}</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                    <p className="text-xs font-semibold">Očakávaný dopad:</p>
                    <p className="text-xs">{suggestion.expected_impact}</p>
                  </div>
                </div>
              </>
            ) : suggestion.type === 'price_strategy' ? (
              <>
                <h5 className="font-bold text-sm text-gray-900 mb-2">
                  💰 {suggestion.dom_nazov}
                </h5>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="text-xs font-medium">Súčasná cena:</span>
                    <span className="text-xs font-bold">{suggestion.current_price}€</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-100 p-2 rounded border border-green-300">
                    <span className="text-xs font-medium">Navrhovaná cena:</span>
                    <span className="text-xs font-bold text-green-700">
                      {suggestion.suggested_price}€
                      <span className={`ml-2 ${suggestion.change_percent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ({suggestion.change_percent > 0 ? '+' : ''}{suggestion.change_percent}%)
                      </span>
                    </span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-xs text-blue-900"><strong>Zdôvodnenie:</strong></p>
                    <p className="text-xs text-blue-800 mt-1">{suggestion.reasoning}</p>
                  </div>
                  {suggestion.expected_impact && (
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <p className="text-xs text-purple-900"><strong>Očakávaný dopad:</strong></p>
                      <p className="text-xs text-purple-800 mt-1">{suggestion.expected_impact}</p>
                    </div>
                  )}
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{suggestion.duration || 'N/A'}</Badge>
                    <Badge variant="outline">{suggestion.strategy_type || 'N/A'}</Badge>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h5 className="font-bold text-sm text-gray-900 mb-2">{suggestion.title}</h5>
                <p className="text-xs text-gray-700 mb-2">{suggestion.description}</p>
              </>
            )}

            {suggestion.psychology && (
              <div className="bg-purple-50 p-2 rounded mb-2 border border-purple-200">
                <p className="text-xs text-purple-900"><strong>🧠 Psychológia:</strong> {suggestion.psychology}</p>
              </div>
            )}

            {suggestion.copy && (
              <div className="bg-blue-50 p-2 rounded mb-2 border border-blue-200">
                <p className="text-xs text-blue-900 font-semibold">{suggestion.copy.headline}</p>
                <p className="text-xs text-blue-700 mt-1">{suggestion.copy.body}</p>
                <p className="text-xs text-blue-800 mt-1 font-semibold">👉 {suggestion.copy.cta}</p>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => approveSuggestion(suggestion)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Schváliť
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectSuggestion(suggestion)}
                className="flex-1 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Zamietnuť
              </Button>
            </div>
          </motion.div>
        ))
      )}
    </CardContent>
    </Card>
    </div>
    );
    }