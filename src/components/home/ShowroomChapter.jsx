import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LOCATIONS = [
  { city: "Komárno", status: "staviame", text: "Celoročný modulárny Barn House s bazénom a saunou v prírode." },
  { city: "Okolie Levoče", status: "pripravujeme", text: "Ekologický montovaný rodinný dom v lone spišskej prírody." }
];

const SHOWROOM_IMG = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=75";

export default function ShowroomChapter() {
  return (
    <section className="py-14 sm:py-20 bg-[#EFE9DF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center"
        >
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#9E2A2B] font-bold">Showroom</p>
            <h2 className="font-['Sora'] text-2xl sm:text-4xl font-bold text-[#2C3A33] leading-tight">
              Vyskúšajte bývanie skôr, než ho kúpite
            </h2>
            <p className="text-sm sm:text-base text-[#6B7A72] leading-relaxed max-w-xl">
              Kúpa domu je životné rozhodnutie. Staviame zážitkové showroom domy, ktoré si prenajmete na víkend – zažijete ticho, vôňu dreva aj tepelnú pohodu na vlastnej koži.
            </p>

            <div className="rounded-2xl bg-white border border-[#E0D8CA] p-5 shadow-[0_10px_30px_rgba(44,58,51,0.06)]">
              <p className="font-bold text-[#2C3A33] flex items-center gap-2 text-sm mb-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                Garancia vrátenia peňazí
              </p>
              <p className="text-sm text-[#6B7A72] leading-relaxed">
                Ak si po pobyte vyberiete ktorýkoľvek dom z katalógu, celú sumu za prenájom vám odpočítame z kúpnej ceny.
              </p>
            </div>

            <div className="space-y-2.5">
              {LOCATIONS.map((loc) => (
                <div key={loc.city} className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#9E2A2B] mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#2C3A33]">{loc.city} <span className="font-normal text-[#6B7A72]">({loc.status})</span></p>
                    <p className="text-xs text-[#6B7A72] leading-relaxed">{loc.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to={createPageUrl("Showroom")} className="inline-block">
              <Button size="lg" className="bg-[#9E2A2B] hover:bg-[#802021] text-white font-bold text-sm px-7 py-6 rounded-xl flex items-center gap-2 group">
                <Calendar className="w-4 h-4" />
                <span>Rezervovať showroom dom</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-[11px] text-[#8B948E]">Domy vlastnia a spravujú licencovaní partneri.</p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#E0D8CA] shadow-[0_18px_40px_rgba(44,58,51,0.08)] aspect-[4/3]">
            <img src={SHOWROOM_IMG} alt="Showroom dom" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}