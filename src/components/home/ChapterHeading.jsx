import React from "react";
import { motion } from "framer-motion";

export default function ChapterHeading({ number, kicker = "Kapitola", title, subtitle, align = "center" }) {
  const alignClass = align === "left" ? "text-left items-start" : "text-center items-center mx-auto";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${alignClass} max-w-3xl mb-10 sm:mb-14`}
    >
      {number && (
        <span className="font-['Fraunces'] text-4xl sm:text-6xl text-[#E2C799] leading-none mb-2">{number}</span>
      )}
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">{kicker}</p>
      <h2 className="font-['Fraunces'] text-3xl sm:text-5xl text-[#F3EFE6] leading-tight uppercase">{title}</h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed mt-4">{subtitle}</p>
      )}
      <span className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#C5A880]/60 to-transparent" />
    </motion.div>
  );
}