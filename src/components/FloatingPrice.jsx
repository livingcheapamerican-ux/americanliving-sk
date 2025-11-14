import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator } from "lucide-react";

export default function FloatingPrice({ price, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-24 z-40 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl shadow-2xl px-6 py-4 border-2 border-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-white/80">Vypočítaná cena</p>
                <p className="text-2xl font-bold">
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