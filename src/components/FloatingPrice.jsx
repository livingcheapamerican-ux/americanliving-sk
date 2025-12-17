import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import KonfiguratorContactModal from "./KonfiguratorContactModal";

export default function FloatingPrice({ price, isVisible, onSendQuote, dom, vyrobca }) {
  const [showContactModal, setShowContactModal] = useState(false);

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

      <KonfiguratorContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        dom={dom}
        totalPrice={price}
        onSendQuote={onSendQuote}
      />
    </>
  );
}