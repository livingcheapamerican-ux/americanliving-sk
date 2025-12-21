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

export default function AIMarketingChat({ onStrategyApproved }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [testingAPI, setTestingAPI] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentActivity]);

  // Load chat history and add welcome message
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_marketing_chat_history');
    const savedBudget = localStorage.getItem('monthly_marketing_budget');
    
    if (savedBudget) {
      setMonthlyBudget(parseInt(savedBudget));
    }
    
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
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
    }
  }, []);

  // Save history and budget
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_marketing_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('monthly_marketing_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const sendMessage = async () => {
    if (!input.trim() || isThinking) return;

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
        suggestions: response.data.suggestions,
        data_sources: response.data.data_sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
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

  const approveSuggestion = async (suggestion, messageId) => {
    try {
      await base44.functions.invoke('aiMarketingChat', {
        action: 'approve_suggestion',
        suggestion: suggestion,
        message_id: messageId
      });

      toast.success('🚀 Stratégia schválená a uložená!');
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, approved_suggestions: [...(msg.approved_suggestions || []), suggestion.id] }
          : msg
      ));

      if (onStrategyApproved) {
        onStrategyApproved(suggestion);
      }
    } catch (error) {
      toast.error('Chyba pri schvaľovaní');
    }
  };

  const rejectSuggestion = (suggestionId, messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, rejected_suggestions: [...(msg.rejected_suggestions || []), suggestionId] }
        : msg
    ));
    toast.info('Návrh zamietnutý');
  };

  const testAPI = async () => {
    setTestingAPI(true);
    try {
      const response = await base44.functions.invoke('testGeminiConnection');
      setApiStatus(response.data);
      if (response.data.success) {
        toast.success('✅ Gemini API funguje!');
      } else {
        toast.error('❌ API problém: ' + response.data.error);
      }
    } catch (error) {
      setApiStatus({ success: false, error: error.message });
      toast.error('Chyba pri testovaní API');
    } finally {
      setTestingAPI(false);
    }
  };

  const saveAPI = async () => {
    if (!apiKey.trim()) {
      toast.error('Zadajte API kľúč');
      return;
    }
    
    try {
      const response = await base44.functions.invoke('saveGeminiApiKey', { api_key: apiKey });
      if (response.data.success) {
        toast.success('✅ API kľúč validovaný a uložený!');
        setApiKey("");
        setTimeout(() => testAPI(), 1000);
      } else {
        toast.error(response.data.error || 'Chyba pri validácii');
      }
    } catch (error) {
      toast.error('Chyba: ' + error.message);
    }
  };

  return (
    <Card className="h-[700px] flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
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
                {/* API Key */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-indigo-600" />
                      🔑 Google AI Studio API Key
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Krok 1:</strong> Choď na <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-600 underline font-semibold">aistudio.google.com/app/apikey</a>
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Krok 2:</strong> Klikni "Create API Key" → Vyber existujúci projekt alebo vytvor nový
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      <strong>Krok 3:</strong> Skopíruj kľúč (začína "AIzaSy...") a vlož sem
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveAPI} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Uložiť kľúč
                        </Button>
                        <Button onClick={testAPI} disabled={testingAPI} className="flex-1 bg-purple-600 hover:bg-purple-700">
                          {testingAPI ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          Test API
                        </Button>
                      </div>
                      {apiStatus && (
                        <div className={`p-3 rounded ${apiStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                          <p className={`text-xs ${apiStatus.success ? 'text-green-900' : 'text-red-900'}`}>
                            {apiStatus.success ? (
                              <>
                                <strong>✅ Pripojenie funguje!</strong><br />
                                Model: gemini-2.0-flash-exp<br />
                                Response: {apiStatus.test_response}
                              </>
                            ) : (
                              <>
                                <strong>❌ Chyba pripojenia</strong><br />
                                {apiStatus.error}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-3">
                        <p className="text-xs text-blue-900">
                          <strong>ℹ️ Po uložení:</strong> Prejdi do Dashboard → Settings → Environment Variables a over, že "Gemini_PAID_pro" je nastavený. Potom klikni "Test API" pre overenie.
                        </p>
                      </div>
                    </div>
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
                    <div className="mb-3 flex flex-wrap gap-1">
                      {message.data_sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-purple-200">
                      <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        💡 Kampane & Stratégie:
                      </h4>
                      {message.suggestions.map((suggestion, idx) => {
                        const isApproved = message.approved_suggestions?.includes(suggestion.id);
                        const isRejected = message.rejected_suggestions?.includes(suggestion.id);

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 ${
                              isApproved ? 'bg-green-50 border-green-400' :
                              isRejected ? 'bg-red-50 border-red-300 opacity-50' :
                              'bg-blue-50 border-blue-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-blue-600 text-white">{suggestion.type}</Badge>
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
                            
                            <h5 className="font-bold text-sm text-gray-900 mb-2">{suggestion.title}</h5>
                            <p className="text-xs text-gray-700 mb-2">{suggestion.description}</p>
                            
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
                            
                            {suggestion.audio_music?.suno_prompt && (
                              <div className="bg-pink-50 p-2 rounded mb-2 border border-pink-200">
                                <p className="text-xs text-pink-900 font-semibold mb-1">🎵 Suno AI Prompt:</p>
                                <p className="text-xs text-pink-700 font-mono bg-white p-2 rounded">{suggestion.audio_music.suno_prompt}</p>
                                <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-pink-800">
                                  <p><strong>BPM:</strong> {suggestion.audio_music.bpm}</p>
                                  <p><strong>Mood:</strong> {suggestion.audio_music.mood}</p>
                                </div>
                              </div>
                            )}

                            {suggestion.video_script && (
                              <div className="bg-cyan-50 p-2 rounded mb-2 border border-cyan-200">
                                <p className="text-xs text-cyan-900"><strong>🎬 Video Scenár:</strong></p>
                                <p className="text-xs text-cyan-700 whitespace-pre-line mt-1">{suggestion.video_script}</p>
                              </div>
                            )}

                            {suggestion.step_by_step_guide && (
                              <details className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-400 mb-2">
                                <summary className="cursor-pointer font-bold text-sm text-green-900 flex items-center gap-2">
                                  📋 KROK-PO-KROKU NÁVOD (Klikni pre rozbalenie)
                                </summary>
                                <div className="mt-3 space-y-3 text-xs">
                                  {suggestion.step_by_step_guide.preparation && (
                                    <div className="bg-white p-2 rounded border border-green-200">
                                      <p className="font-bold text-green-900 mb-1">✅ Príprava:</p>
                                      <ul className="list-disc pl-4 space-y-1 text-green-800">
                                        {suggestion.step_by_step_guide.preparation.map((step, i) => (
                                          <li key={i}>{step}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {suggestion.step_by_step_guide.ads_manager_setup && (
                                    <div className="bg-white p-2 rounded border border-blue-200">
                                      <p className="font-bold text-blue-900 mb-1">🎯 Ads Manager Setup:</p>
                                      <ol className="list-decimal pl-4 space-y-1 text-blue-800">
                                        {suggestion.step_by_step_guide.ads_manager_setup.map((step, i) => (
                                          <li key={i}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}
                                  {suggestion.step_by_step_guide.targeting_exact_settings && (
                                    <div className="bg-white p-2 rounded border border-purple-200">
                                      <p className="font-bold text-purple-900 mb-1">🎯 Presné Targeting:</p>
                                      <pre className="text-xs text-purple-800 font-mono bg-purple-50 p-2 rounded">
                                        {JSON.stringify(suggestion.step_by_step_guide.targeting_exact_settings, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {suggestion.step_by_step_guide.what_to_do_next && (
                                    <div className="bg-yellow-50 p-2 rounded border border-yellow-300">
                                      <p className="text-yellow-900">💬 {suggestion.step_by_step_guide.what_to_do_next}</p>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}
                            
                            {suggestion.reasoning && (
                              <p className="text-xs text-purple-700 italic mt-2">
                                💭 {suggestion.reasoning}
                              </p>
                            )}

                            {!isApproved && !isRejected && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => approveSuggestion(suggestion, message.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Schváliť & Implementovať
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectSuggestion(suggestion.id, message.id)}
                                  className="flex-1 text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Zamietnuť
                                </Button>
                              </div>
                            )}

                            {isApproved && (
                              <div className="flex items-center gap-2 text-green-700 text-xs mt-2 font-semibold">
                                <CheckCircle className="w-4 h-4" />
                                ✅ Schválené a uložené do know-how!
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString('sk-SK')}
                  </p>
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
            placeholder="Napríklad: 'Vytvor video kampaň na Washington s vlastnou hudbou' alebo 'Analyzuj konkurenciu a navrhni protistratégiu'"
            rows={3}
            disabled={isThinking}
          />
          <Button
            onClick={sendMessage}
            disabled={isThinking || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          🎬 Môžem vytvoriť video + hudbu + copy | 🎯 Rozpočet: {monthlyBudget}€/mesiac
        </p>
      </div>
    </Card>
  );
}