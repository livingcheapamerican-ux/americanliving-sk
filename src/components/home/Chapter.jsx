import React from "react";
import { motion } from "framer-motion";

export default function Chapter({ number, kicker = "Kapitola", title, text, image, reverse = false, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
    >
      <div className={`${reverse ? "lg:order-2" : ""} aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className={reverse ? "lg:order-1 lg:pr-10 lg:text-right lg:flex lg:flex-col lg:items-end" : "lg:pl-10"}>
        <span className="font-['Fraunces'] text-5xl sm:text-7xl text-[#E2C799] leading-none block mb-3">{number}</span>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">{kicker}</p>
        <h2 className="font-['Fraunces'] text-3xl sm:text-5xl text-[#F3EFE6] leading-tight mb-4 uppercase">{title}</h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light mb-5 max-w-lg">{text}</p>
        {children}
      </div>
    </motion.div>
  );
}