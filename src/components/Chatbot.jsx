import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Loader2, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "👋 Ahoj! Som **Kexo**, váš AI konzultant American Living.\n\nMám prístup k celej databáze domov, cenníkov a dokumentov. Môžem vám pomôcť s:\n\n🏠 Výberom vhodného domu podľa rozpočtu\n💰 Kalkuláciou ceny vrátane A0 certifikátu\n🏦 Informáciami o hypotékach\n📋 Parametrami a špecifikáciami domov\n\nNa čo sa chcete opýtať?"
};

const QUICK_QUESTIONS = [
  "Aké sú ceny domov?",
  "Dostanem hypotéku?",
  "Čo je A0 certifikát?",
  "Aký je rozdiel Ticab vs Prosto?",
  "Koľko stojí doprava a montáž?",
];

const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

export default function Chatbot() {
  const [isKonfigurator, setIsKonfigurator] = useState(window.location.pathname.toLowerCase().includes('konfigurator'));

  useEffect(() => {
    const checkPath = () => setIsKonfigurator(window.location.pathname.toLowerCase().includes('konfigurator'));
    window.addEventListener('popstate', checkPath);
    // Also check on any navigation
    const observer = new MutationObserver(checkPath);
    observer.observe(document.body, { childList: true, subtree: false });
    return () => {
      window.removeEventListener('popstate', checkPath);
      observer.disconnect();
    };
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initConversation();
    }
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('openChatbot', handler);
    return () => window.removeEventListener('openChatbot', handler);
  }, []);

  const initConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: "american_living_assistant",
        metadata: { name: "Chatbot konverzácia" }
      });
      setConversationId(conversation.id);
    } catch (err) {
      console.error("Chyba pri vytváraní konverzácie:", err);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      const agentMessages = data.messages || [];
      setMessages([WELCOME_MESSAGE, ...agentMessages]);
      setIsLoading(false);
      setError(null);
      clearTimeout(timeoutRef.current);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeoutRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError("Odpoveď trvá príliš dlho. Skúste znovu.");
    }, 60000);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, { role: "user", content: userMessage });
    } catch (err) {
      console.error("Chyba pri odosielaní správy:", err);
      setIsLoading(false);
      setError("Nepodarilo sa odoslať správu. Skúste znovu.");
      clearTimeout(timeoutRef.current);
    }
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
    setTimeout(() => handleSubmitWithText(q), 50);
  };

  const handleSubmitWithText = async (text) => {
    if (!text.trim() || isLoading || !conversationId) return;
    setInput("");
    setIsLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError("Odpoveď trvá príliš dlho. Skúste znovu.");
    }, 60000);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } catch (err) {
      setIsLoading(false);
      setError("Nepodarilo sa odoslať správu. Skúste znovu.");
      clearTimeout(timeoutRef.current);
    }
  };

  const showQuickQuestions = messages.length <= 1 && !isLoading;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed right-4 sm:right-6 z-40 ${isKonfigurator ? 'bottom-36 sm:bottom-8' : 'bottom-6 sm:bottom-8'} ${!isKonfigurator ? 'hidden sm:block' : ''}`}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 shadow-2xl text-white border-2 border-white flex items-center justify-center transition-all"
            >
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
              AI
            </div>
            {/* Tooltip - only desktop */}
            <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm pointer-events-none opacity-0 hover:opacity-100">
              Kexo – AI konzultant
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            className={`fixed right-2 left-2 sm:left-auto sm:right-4 z-40 sm:w-[420px] ${isKonfigurator ? 'bottom-36 sm:bottom-6' : 'bottom-4 sm:bottom-6'}`}
          >
            <Card className="flex flex-col shadow-2xl border border-gray-200 overflow-hidden" style={{ height: isMinimized ? 'auto' : 'min(600px, calc(100dvh - 100px))' }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 sm:p-4 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg">Kexo</h3>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-white/80">AI konzultant · Powered by</span>
                      <img src={KONFIGA_LOGO_URL} alt="Konfiga.eu" className="h-4 w-auto" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20 h-8 w-8">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 min-h-0">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                          message.role === "user"
                            ? "bg-red-600 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }`}>
                          {message.role === "user" ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <ReactMarkdown
                              className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-bold text-red-700">{children}</strong>,
                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">{children}</a>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                          {message.tool_calls?.filter(t => t.status === 'completed').length > 0 && (
                            <p className="text-xs text-gray-400 mt-2">🔍 Prehľadal databázu domov</p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          <span className="text-xs text-gray-500">Kexo premýšľa...</span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 flex items-center justify-between gap-2">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {showQuickQuestions && (
                    <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Časté otázky:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_QUESTIONS.map((q, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors text-xs py-1"
                            onClick={() => handleQuickQuestion(q)}
                          >
                            {q}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Napíšte otázku..."
                        disabled={isLoading || !conversationId}
                        className="flex-1 border-gray-300 focus:border-red-500 text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim() || !conversationId}
                        className="bg-red-600 hover:bg-red-700 flex-shrink-0"
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1.5">
                      🧠 Prístup k databáze domov, cenníkov a dokumentov
                    </p>
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}