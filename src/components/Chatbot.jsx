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
  content: "👋 Ahoj! Som **Kexo**, váš AI konzultant pre domy na kľúč.\n\n**Odpovedám okamžite!** Viem všetko o našich montovaných a modulárnych domoch, cenách a detailoch. Môžem vám pomôcť s:\n\n🏠 **Výberom a porovnaním domov** (Ticab vs Prosto)\n🛠️ **Kalkuláciou ceny na kľúč** (základy, montáž, prípojky, legislatíva)\n📐 **Technológiami a materiálmi** (KVH konštrukcie, bazaltové izolácie)\n💻 **Prechodom cez konfigurátor** krok za krokom\n\nNa čo sa chcete opýtať?"
};

const QUICK_QUESTIONS = [
  "Ako poskladať dom na kľúč?",
  "Aké sú ceny a poplatky?",
  "Aké technológie používate?",
  "Rozdiel Ticab vs Prosto?",
  "Koľko stojí doprava a montáž?",
];

const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

export default function Chatbot() {
  const [isKonfigurator, setIsKonfigurator] = useState(window.location.pathname.toLowerCase().includes('konfigurator'));

  useEffect(() => {
    const checkPath = () => setIsKonfigurator(window.location.pathname.toLowerCase().includes('konfigurator'));
    window.addEventListener('popstate', checkPath);
    const observer = new MutationObserver(checkPath);
    observer.observe(document.body, { childList: true, subtree: false });
    return () => {
      window.removeEventListener('popstate', checkPath);
      observer.disconnect();
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('openChatbot', handler);
    return () => window.removeEventListener('openChatbot', handler);
  }, []);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('aiAsistent', {
        message: userMessage,
        context: isKonfigurator ? 'konfigurator' : 'general',
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      });

      if (response?.data?.response) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response.data.response,
          suggestion: response.data.suggestion
        }]);
      } else {
        throw new Error('Neplatná odpoveď z AI');
      }
    } catch (err) {
      console.error("Chyba pri komunikácii s Kexom:", err);
      setError("Nepodarilo sa odoslať správu. Skúste znova.");
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "😊 Prepáčte, mám momentálne technické problémy. Skúste to prosím o chvíľu alebo nás kontaktujte telefonicky na +421 905 138 124." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    handleSubmitWithText(q);
  };

  const handleSubmitWithText = async (text) => {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('aiAsistent', {
        message: text,
        context: isKonfigurator ? 'konfigurator' : 'general',
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      });

      if (response?.data?.response) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response.data.response,
          suggestion: response.data.suggestion
        }]);
      } else {
        throw new Error('Neplatná odpoveď z AI');
      }
    } catch (err) {
      console.error("Chyba pri komunikácii s Kexom:", err);
      setError("Nepodarilo sa odoslať správu. Skúste znova.");
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "😊 Prepáčte, mám momentálne technické problémy. Skúste to prosím o chvíľu." 
      }]);
    } finally {
      setIsLoading(false);
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
            className={`fixed right-4 sm:right-6 z-40 bottom-6 sm:bottom-8 ${!isKonfigurator ? 'hidden sm:flex' : 'flex'}`}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#0D0D11]/90 hover:bg-[#16161D] active:scale-95 shadow-[0_0_25px_rgba(197,168,128,0.25)] text-[#C5A880] border border-[#C5A880]/30 hover:border-[#C5A880] flex items-center justify-center transition-all"
            >
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#9E2A2B] to-[#802021] border border-[#C5A880]/20 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
              AI
            </div>
            {/* Tooltip - only desktop */}
            <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#0D0D11] border border-[#C5A880]/20 text-slate-100 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm pointer-events-none opacity-0 hover:opacity-100">
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
            <Card className="flex flex-col shadow-2xl border border-[#C5A880]/20 bg-[#0D0D11]/95 backdrop-blur-xl rounded-2xl overflow-hidden" style={{ height: isMinimized ? 'auto' : 'min(600px, calc(100dvh - 100px))' }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#9E2A2B] to-[#0D0D11] border-b border-[#C5A880]/25 p-3 sm:p-4 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 bg-slate-900/60 rounded-full border border-[#C5A880]/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#C5A880]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-100">Kexo</h3>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-white/80">AI konzultant · Powered by</span>
                      <img src={KONFIGA_LOGO_URL} alt="Konfiga.eu" className="h-4 w-auto rounded" />
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
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#08080A]/90 min-h-0">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 border ${
                          message.role === "user"
                            ? "bg-[#9E2A2B] border-[#C5A880]/20 text-slate-100"
                            : "bg-[#16161D]/90 border-[#C5A880]/15 text-slate-200"
                        }`}>
                          {message.role === "user" ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <ReactMarkdown
                              className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-bold text-[#C5A880]">{children}</strong>,
                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#C5A880] hover:text-white underline">{children}</a>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#16161D]/90 border border-[#C5A880]/15 rounded-2xl px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                          <span className="text-xs text-slate-400">Kexo premýšľa...</span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 rounded-xl px-3 py-2 text-sm text-red-200 flex items-center justify-between gap-2">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {showQuickQuestions && (
                    <div className="px-3 py-2.5 border-t border-[#C5A880]/15 bg-[#0D0D11]/90 flex-shrink-0">
                      <p className="text-xs text-slate-400 mb-2 font-medium">Časté otázky:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_QUESTIONS.map((q, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer bg-[#1C1C24] border-[#C5A880]/40 text-[#F5E6D3] hover:bg-[#9E2A2B]/20 hover:border-[#C5A880]/70 hover:text-white transition-colors text-xs py-1.5 px-3 font-medium shadow-sm"
                            onClick={() => handleQuickQuestion(q)}
                          >
                            {q}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-[#0D0D11] border-t border-[#C5A880]/15 flex-shrink-0">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Napíšte otázku..."
                        disabled={isLoading}
                        className="flex-1 bg-[#16161D] border-[#C5A880]/20 text-slate-100 focus-visible:ring-[#C5A880] focus:border-[#C5A880] text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-[#9E2A2B] hover:bg-[#802021] text-white flex-shrink-0"
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-1.5">
                      🧠 Odpovedáme okamžite • Prístup k parametrom a cenám
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