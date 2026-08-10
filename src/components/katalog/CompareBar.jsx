import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export default function CompareBar({ vybrane, onRemove, onClear, t }) {
  return (
    <AnimatePresence>
      {vybrane.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-16 md:bottom-4 left-2 right-2 z-40 mx-auto max-w-3xl"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-2xl p-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
              {vybrane.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onRemove(d)}
                  className="inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-full bg-muted border border-border text-[10px] sm:text-xs font-bold text-foreground hover:bg-muted/70 shrink-0"
                >
                  <span className="max-w-[110px] truncate">{d.nazov}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            {vybrane.length >= 2 && (
              <Link to={`${createPageUrl("SrovnaniDomu")}?ids=${vybrane.map((d) => d.id).join(',')}`} className="shrink-0">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold h-9">
                  {t('compareHouses')} ({vybrane.length})
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground h-9 text-xs shrink-0" onClick={onClear}>
              {t('cancelSelection')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}