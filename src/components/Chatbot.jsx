import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Dobrý deň! Som váš virtuálny asistent American Living. Ako vám môžem pomôcť s výberom modulárneho domu?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const context = `
Si virtuálny asistent pre American Living - distribútora a realizátora modulárnych domov na Slovensku.

ZÁKLADNÉ INFORMÁCIE:
- American Living je distribútor modulárnych a mobilných domov od roku 2008
- Vyrobených viac ako 700 domov
- Oficiálny distribútor 4 výrobcov: JAK Modules, Ticab House, Prosto House, Domki z Gór
- Všetky domy spĺňajú normy a sú pripravené na kolaudáciu
- Možnosť energetického certifikátu A0

KOMPLEXNÉ SLUŽBY:
1. Predaj nehnuteľnosti (realitná kancelária)
2. Výber a nákup pozemku
3. Vybavenie hypotéky (finančné služby)
4. Projektová dokumentácia
5. Stavebné povolenie
6. Výstavba domu
7. Napojenie na inžinierske siete
8. Kolaudácia

CENOVÉ ROZPÄTIE:
- Ceny domov sa pohybujú od 15 000 € do 150 000 € s DPH
- Orientačne 1500-2500 €/m² na kľúč
- Základná cena zahŕňa konštrukciu, pre Prosto House len samotnú konštrukciu bez montáže

VÝSTAVBA:
- Rýchlosť výstavby: 4-6 mesiacov (samotná stavba)
- Celkový čas vrátane povolení: 6-10 mesiacov
- Drevostavby s dlhou životnosťou (100+ rokov pri správnej údržbe)

KONTAKT:
- Telefón: +421 905 138 124
- Email: info@americanliving.sk
- Pracovné hodiny: Po-Pia 8:00 - 17:00

DÔLEŽITÉ:
- Transparentné ceny bez skrytých poplatkov
- Žiadne zavádzajúce reklamy
- Domy spĺňajú všetky legislatívne požiadavky
- 5-ročná záruka

Odpovedaj priateľsky, profesionálne a stručne v slovenčine. Ak nevieš odpoveď, odporuč kontaktovať tím cez telefón alebo email.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nOtázka používateľa: ${userMessage}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Ospravedlňujem sa, ale nastala chyba. Prosím kontaktujte nás priamo na telefóne +421 905 138 124 alebo emaile info@americanliving.sk." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full bg-secondary hover:bg-secondary/90 shadow-2xl"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">American Living</h3>
                    <p className="text-xs text-white/80">Virtuálny asistent</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Napíšte správu..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Alebo zavolajte: <a href="tel:+421905138124" className="text-primary hover:underline">+421 905 138 124</a>
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}