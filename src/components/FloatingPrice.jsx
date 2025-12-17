import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator } from "lucide-react";

export default function FloatingPrice({ price, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="md:hidden fixed bottom-20 right-2 z-40 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-2xl px-3 py-2 border-2 border-white/50">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}