import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function FloatingPrice({ price, isVisible, onSendQuote, dom, vyrobca }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
  const [sending, setSending] = useState(false);

  const handleSendQuote = async () => {
    if (!formData.email || !formData.meno || !formData.telefon || !formData.obec) {
      toast.error('Vyplňte všetky povinné polia');
      return;
    }

    setSending(true);
    try {
      // Vytvor dopyt v databáze
      const novyDopyt = await base44.entities.Dopyt.create({
        meno: formData.meno,
        email: formData.email,
        telefon: formData.telefon,
        typ_dopytu: 'konfigurator',
        dom_id: dom?.id,
        poznamka: `Lokalita: ${formData.obec}\n\n${formData.poznamka || ''}\n\nCelková cena: ${price.toLocaleString('sk-SK')} €`
      });

      // Pošli notifikáciu predajcovi
      await base44.functions.invoke('notifikujNovyDopyt', {
        dopyt: {
          id: novyDopyt.id,
          klient_meno: novyDopyt.meno,
          klient_email: novyDopyt.email,
          klient_telefon: novyDopyt.telefon,
          klient_adresa: formData.obec,
          typ_dopytu: novyDopyt.typ_dopytu,
          poznamka: novyDopyt.poznamka,
          dom_nazov: dom?.nazov || 'Konfigurátor',
          dom_id: dom?.id
        }
      });

      toast.success('✓ Dopyt odoslaný, budeme vás kontaktovať s cenovou ponukou');
      setFormData({ meno: "", email: "", telefon: "", obec: "", poznamka: "" });
      setShowContactModal(false);
    } catch (error) {
      console.error('Chyba pri odosielaní:', error);
      toast.error('Chyba pri odosielaní. Skúste to prosím znova.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="md:hidden fixed bottom-20 right-2 z-40 pointer-events-auto"
          >
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
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold border-t border-white/30 rounded-none rounded-b-xl py-2 h-auto"
              >
                <Send className="w-3 h-3 mr-1.5" />
                Pošli ponuku
              </Button>
            </div>
          </motion.div>
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
              className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl md:rounded-t-2xl z-10">
                <h3 className="text-lg font-bold">Pošlite mi cenovú ponuku</h3>
                <p className="text-xs text-white/90 mt-1">{dom?.nazov} - {price.toLocaleString('sk-SK')} €</p>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Meno a priezvisko *</label>
                  <input
                    type="text"
                    required
                    value={formData.meno}
                    onChange={(e) => setFormData({ ...formData, meno: e.target.value })}
                    placeholder="Ján Novák"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan.novak@email.sk"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Telefón *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    placeholder="+421 900 123 456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Obec / Mesto *</label>
                  <input
                    type="text"
                    required
                    value={formData.obec}
                    onChange={(e) => setFormData({ ...formData, obec: e.target.value })}
                    placeholder="Bratislava, Košice..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Poznámka (voliteľné)</label>
                  <textarea
                    value={formData.poznamka}
                    onChange={(e) => setFormData({ ...formData, poznamka: e.target.value })}
                    placeholder="Vaše otázky alebo poznámky..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
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