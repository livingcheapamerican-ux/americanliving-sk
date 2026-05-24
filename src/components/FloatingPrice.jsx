import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Send, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function FloatingPrice({ price, isVisible, onSendQuote, dom, vyrobca, buttonText, hidePrice, mobileOnly, onToggleSummary, isSummaryOpen }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    const handleOpen = () => setShowContactModal(true);
    window.addEventListener('open-contact-modal', handleOpen);
    return () => window.removeEventListener('open-contact-modal', handleOpen);
  }, []);

  const handleSendQuote = async () => {
    if (!formData.email || !formData.meno || !formData.telefon || !formData.obec) {
      toast.error('Vyplňte všetky povinné polia');
      return;
    }

    setSending(true);
    try {
      console.log('FloatingPrice - odosielam ponuku:', formData);
      
      if (!onSendQuote) {
        console.error('FloatingPrice - onSendQuote callback neexistuje!');
        toast.error('Chyba konfigurácie. Skúste to prosím znova.');
        return;
      }

      const response = await onSendQuote({
        meno: formData.meno,
        email: formData.email,
        telefon: formData.telefon,
        obec: formData.obec,
        poznamka: formData.poznamka
      });

      console.log('FloatingPrice - odpoveď zo servera:', response);

      // Backend functions vracajú objekt s .data property
      const result = response?.data || response;
      
      if (result?.success || result?.id) {
        toast.success('✓ Cenová ponuka odoslaná na váš email');
        setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
        setShowContactModal(false);
      } else {
        console.error('FloatingPrice - neúspešná odpoveď:', { response, result });
        const errorMsg = result?.error || result?.message || 'Neznáma chyba';
        toast.error(`Chyba: ${errorMsg}`);
      }
    } catch (error) {
      console.error('FloatingPrice - chyba pri odosielaní:', error);
      toast.error(`Chyba: ${error.message || 'Neznáma chyba'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !hidePrice && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={mobileOnly 
              ? "md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.12)]" 
              : "fixed bottom-24 right-4 md:bottom-28 md:right-8 z-40 pointer-events-auto"
            }
          >
            {mobileOnly && onToggleSummary ? (
              <>
                <div className="flex flex-col text-left cursor-pointer select-none" onClick={onToggleSummary}>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Zhrnutie konfigurácie</span>
                    <motion.div animate={{ rotate: isSummaryOpen ? 180 : 0 }}>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </motion.div>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {price.toLocaleString('sk-SK')} €
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={onToggleSummary}
                    variant="outline"
                    className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold px-3 rounded-xl h-10 text-xs shadow-sm hover:bg-slate-100"
                  >
                    Zhrnutie
                  </Button>
                  <Button 
                    onClick={() => setShowContactModal(true)}
                    className="bg-gradient-to-r from-[#9E2A2B] to-[#802021] hover:from-[#802021] hover:to-[#611617] text-white font-bold px-4 rounded-xl shadow-lg shadow-primary/20 h-10 text-xs border-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {buttonText || 'Mám záujem'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-2xl border-2 border-white/50 overflow-hidden">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/90 leading-none">Celková cena</p>
                      <p className="text-sm font-bold leading-tight">
                        {price.toLocaleString('sk-SK')} €
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold border-t border-white/30 rounded-none rounded-b-xl py-2 h-auto text-xs"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  {buttonText || 'Pošli ponuku'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
        {isVisible && hidePrice && (
          <Button 
            onClick={() => setShowContactModal(true)}
            className={`${mobileOnly ? 'block md:hidden' : 'w-full'} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-xl text-xs h-9 px-4 rounded-xl`}
          >
            <Send className="w-3 h-3 mr-1.5" />
            {buttonText || 'Pošli ponuku'}
          </Button>
        )}
      </AnimatePresence>

      {/* Custom Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card text-foreground rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto border border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl md:rounded-t-2xl z-10">
                <h3 className="text-lg font-bold">Pošlite mi cenovú ponuku</h3>
                <p className="text-xs text-white/90 mt-1">{dom?.nazov} - {price.toLocaleString('sk-SK')} €</p>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Meno a priezvisko *</label>
                  <input
                    type="text"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder="Ján Novák"
                    className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan.novak@email.sk"
                    className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefón *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="+421 900 123 456"
                    className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Obec / Mesto *</label>
                  <input
                    type="text"
                    required
                    value={formData.obec}
                    onChange={(e) => setFormData({ ...formData, obec: e.target.value })}
                    placeholder="Bratislava, Košice..."
                    className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Poznámka (voliteľné)</label>
                  <textarea
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder="Vaše otázky alebo poznámky..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1"
                  >
                    Zrušiť
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendQuote}
                    disabled={sending || !formData.email || !formData.meno || !formData.telefon || !formData.obec}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Odosiela sa...' : 'Poslať'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}