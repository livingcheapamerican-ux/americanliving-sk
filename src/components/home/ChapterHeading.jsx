import React from "react";
import { motion } from "framer-motion";

export default function ChapterHeading({ number, kicker, title, subtitle, align = "center" }) {
  const alignClass = align === "left" ? "text-left items-start" : "text-center items-center mx-auto";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col ${alignClass} max-w-3xl mb-8 sm:mb-12 rounded-3xl bg-[#EFE9DF]/92 backdrop-blur-md border border-[#E0D8CA]/70 px-6 py-6 sm:px-8 sm:py-7`}
    >
      {kicker && (
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E2A2B] font-bold mb-3">{kicker}</p>
      )}
      <h2 className="font-['Sora'] text-2xl sm:text-4xl font-bold text-[#2C3A33] leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#6B7A72] leading-relaxed mt-3">{subtitle}</p>
      )}
    </motion.div>
  );
}