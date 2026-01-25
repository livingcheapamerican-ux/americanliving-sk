import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function PassiveIncomeButton() {
  const stars = Array.from({ length: 8 }, (_, i) => i);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative inline-block"
    >
      {/* Animované hviezdy okolo tlačidla */}
      <div className="absolute inset-0 w-full h-full">
        {stars.map((index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2"
            initial={{
              x: Math.cos((index / 8) * Math.PI * 2) * 60,
              y: Math.sin((index / 8) * Math.PI * 2) * 60,
            }}
            animate={{
              x: Math.cos(((index / 8) * Math.PI * 2)) * 60,
              y: Math.sin(((index / 8) * Math.PI * 2)) * 60,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1,
            }}
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.15,
              }}
              className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg"
            />
          </motion.div>
        ))}
      </div>

      {/* Hlavné tlačidlo */}
      <motion.a
        href="https://dotacia.americanliving.sk"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all shadow-2xl overflow-hidden group"
      >
        {/* Animovaný gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 opacity-0 group-hover:opacity-20"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Text s ikonkou */}
        <div className="relative flex items-center justify-center gap-2 whitespace-nowrap">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
          <span className="hidden sm:inline">Tvoj pasívny príjem s dotáciou</span>
          <span className="sm:hidden">Pasívny príjem</span>
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </div>

        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.a>
    </motion.div>
  );
}