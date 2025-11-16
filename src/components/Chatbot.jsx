import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Dobrý deň! Som AI asistent American Living. Rád vám pomôžem s výberom modulárneho domu. Opýtajte sa ma na čokoľvek! 🏠"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const KONFIGA_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/1a73e4a6c_Konfigaeu.jpg";

  // Načítaj analyzované dokumenty pre kontext
  const { data: dokumenty = [] } = useQuery({
    queryKey: ['dokumenty-chatbot'],
    queryFn: () => base44.entities.Dokument.filter({ 
      pre_chatbota: true,
      analyzovaný: true 
    })
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Priprav kontext z dokumentov
      const kontext = dokumenty
        .map(dok => {
          let info = `Dokument: ${dok.nazov} (${dok.vyrobca})\n`;
          if (dok.extrahovaný_obsah) {
            info += `Obsah: ${dok.extrahovaný_obsah.substring(0, 500)}\n`;
          }
          if (dok.kľúčové_informácie) {
            if (dok.kľúčové_informácie.modely_domov?.length) {
              info += `Modely: ${dok.kľúčové_informácie.modely_domov.join(', ')}\n`;
            }
            if (dok.kľúčové_informácie.cenové_informácie?.length) {
              info += `Ceny: ${dok.kľúčové_informácie.cenové_informácie.slice(0, 3).join(', ')}\n`;
            }
            if (dok.kľúčové_informácie.rozmery) {
              info += `Rozmery: ${JSON.stringify(dok.kľúčové_informácie.rozmery)}\n`;
            }
          }
          return info;
        })
        .slice(0, 10)
        .join('\n---\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Si profesionálny AI asistent pre firmu American Living, ktorá sa zaoberá distribúciou a realizáciou modulárnych domov.

Kontext spoločnosti:
- Distribútor modulárnych domov (Ticab House, JAK Modules, Prosto House, Domki z Gór)
- Vyrobených viac ako 700 domov od roku 2008
- Ponúkame komplexné služby vrátane dovozu, montáže, pripojení

AKTUÁLNE INFORMÁCIE Z DATABÁZY DOKUMENTOV:
${kontext}

Tvoja úloha:
- Odpovedaj profesionálne, priateľsky a v slovenčine
- Využívaj PRESNE informácie z dokumentov vyššie
- Pri otázkach o cenách, modeloch uvádzaj konkrétne údaje z databázy
- Ak nevieš odpoveď, odporúčaj kontakt alebo interaktívny konfigurátor
- Buď nápomocný a nadšený z modulárneho bývania

Otázka zákazníka: ${userMessage}

Odpoveď (max 200 slov, priateľsky tón, využívaj údaje z dokumentov):`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Prepáčte, nastala chyba. Skúste to prosím znova alebo nás kontaktujte priamo na +421 905 138 124." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl text-white border-2 border-white"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
              AI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 z-40 w-full max-w-md"
          >
            <Card className="flex flex-col h-[600px] shadow-2xl border-2 border-primary/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Asistent</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/90">Powered by</span>
                      <img 
                        src={KONFIGA_LOGO_URL} 
                        alt="Konfiga.eu" 
                        className="h-5 w-auto"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-red-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Napíšte správu..."
                    disabled={isLoading}
                    className="flex-1 border-gray-300 focus:border-red-600"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                  AI s aktuálnymi vedomosťami z {dokumenty.length} dokumentov
                </p>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}