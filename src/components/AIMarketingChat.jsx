import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, CheckCircle, XCircle, Eye, Lightbulb, Zap, Activity } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AIMarketingChat({ onStrategyApproved }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentActivity]);

  // Load chat history
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_marketing_chat_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    }
  }, []);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_marketing_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

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
    setCurrentActivity({ status: 'analyzing', text: 'Analyzujem dostupné dáta...' });

    try {
      const response = await base44.functions.invoke('aiMarketingChat', {
        user_message: input,
        chat_history: messages.slice(-10) // Last 10 messages for context
      });

      setCurrentActivity({ status: 'generating', text: 'Generujem odpoveď...' });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        thinking_process: response.data.thinking_process,
        suggestions: response.data.suggestions,
        data_sources: response.data.data_sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentActivity(null);

    } catch (error) {
      toast.error('Chyba pri komunikácii s AI');
      console.error(error);
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

      toast.success('Stratégia schválená! 🚀');
      
      // Update message to show approval
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

  return (
    <Card className="h-[700px] flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
      <CardHeader className="border-b bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <CardTitle className="flex items-center gap-3">
          <Brain className="w-6 h-6 animate-pulse" />
          🤖 AI Marketingový Partner
          {currentActivity && (
            <Badge className="bg-yellow-400 text-yellow-900 animate-pulse ml-auto">
              <Activity className="w-3 h-3 mr-1 animate-spin" />
              {currentActivity.text}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-purple-200 mt-1">
          Váš živý marketingový kolega s prístupom k všetkým dátam
        </p>
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
                  <p className="text-sm">{message.content}</p>
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

                  {/* Main Response */}
                  <div className="prose prose-sm max-w-none mb-3">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>

                  {/* Data Sources Used */}
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

                  {/* Suggestions/Strategies */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-purple-200">
                      <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        💡 Moje návrhy stratégií:
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
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <Badge className="bg-blue-600 text-white mb-1">
                                  {suggestion.type}
                                </Badge>
                                <h5 className="font-semibold text-sm text-gray-900">
                                  {suggestion.title}
                                </h5>
                              </div>
                              {suggestion.impact_score && (
                                <Badge className={`${
                                  suggestion.impact_score > 70 ? 'bg-green-600' :
                                  suggestion.impact_score > 40 ? 'bg-yellow-600' : 'bg-gray-600'
                                } text-white`}>
                                  {suggestion.impact_score}% impact
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 mb-2">{suggestion.description}</p>
                            
                            {suggestion.reasoning && (
                              <p className="text-xs text-purple-700 italic mb-2">
                                🧠 Prečo: {suggestion.reasoning}
                              </p>
                            )}

                            {!isApproved && !isRejected && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveSuggestion(suggestion, message.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Schváliť
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
                              <div className="flex items-center gap-2 text-green-700 text-xs mt-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-semibold">✅ Schválené a implementované!</span>
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

        {/* Current Activity Indicator */}
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

      {/* Input Area */}
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
            placeholder="Opýtaj sa AI Marketéra na čokoľvek... Napr: 'Aký dom je teraz trending?', 'Navrhni kampaň na tento týždeň', 'Prečo klesá konverzia?'"
            rows={3}
            disabled={isThinking}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isThinking || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isThinking ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: AI Marketér má prístup k sessions, domom, cenám, GTM dátam, konkurencii a všetkému ostatnému
        </p>
      </div>
    </Card>
  );
}