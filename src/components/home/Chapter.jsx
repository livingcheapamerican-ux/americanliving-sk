import React from "react";
import { motion } from "framer-motion";

export default function Chapter({ number, kicker, title, text, image, reverse = false, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
    >
      <div className={`${reverse ? "lg:order-2" : ""} aspect-[16/10] rounded-3xl overflow-hidden border border-[#E0D8CA] shadow-[0_18px_40px_rgba(44,58,51,0.08)] group`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        {kicker && <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E2A2B] font-bold mb-3">{kicker}</p>}
        <h2 className="font-['Sora'] text-2xl sm:text-4xl font-bold text-[#2C3A33] leading-tight mb-4">{title}</h2>
        <p className="text-sm sm:text-base text-[#6B7A72] leading-relaxed mb-5 max-w-lg">{text}</p>
        {children}
      </div>
    </motion.div>
  );
}