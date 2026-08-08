import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LOCATIONS = [
  { n: 1, city: "Komárno", status: "staviame", text: "Celoročný modulárny Barn House s krásnym bazénom a saunou v prírode." },
  { n: 2, city: "Okolie Levoče", status: "pripravujeme", text: "Ekologický montovaný rodinný dom v lone spišskej prírody." }
];

export default function ShowroomChapter() {
  return (
    <section className="py-16 sm:py-28 relative overflow-hidden border-b border-white/5">
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#9E2A2B]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-10 lg:gap-16"
        >
          <div className="flex-1 text-left space-y-5">
            <span className="font-['Fraunces'] text-5xl sm:text-7xl text-[#E2C799] leading-none block">05</span>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Kapitola</p>
            <h2 className="font-['Fraunces'] text-3xl sm:text-5xl text-[#F3EFE6] leading-tight uppercase">
              Vyskúšajte bývanie skôr, <span className="text-[#C5A880]">než ho kúpite</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-xl">
              Kúpa domu je životné rozhodnutie. Staviame zážitkové showroom domy, ktoré si prenajmete na víkend – zažijete ticho, vôňu dreva aj tepelnú pohodu na vlastnej koži.
            </p>

            <div className="border-l-2 border-[#C5A880]/50 pl-5 py-1 text-sm text-slate-300 space-y-2 max-w-xl">
              <p className="font-bold text-[#E2C799] flex items-center gap-2 uppercase tracking-wider text-xs">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                Garancia vrátenia peňazí
              </p>
              <p className="font-light text-slate-400">
                Ak si po pobyte vyberiete ktorýkoľvek dom z katalógu, celú sumu za prenájom vám odpočítame z kúpnej ceny.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to={createPageUrl("Showroom")}>
                <Button size="lg" className="bg-[#C5A880] hover:bg-[#E2C799] text-slate-950 font-black text-sm sm:text-base px-7 py-6 rounded-xl transition-all flex items-center gap-2 group">
                  <Calendar className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                  <span>Rezervovať showroom dom</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0 text-left">
            <h3 className="font-bold text-[11px] uppercase tracking-[0.25em] text-[#C5A880] mb-5">Pripravované lokality</h3>
            <div className="space-y-4">
              {LOCATIONS.map((loc) => (
                <div key={loc.n} className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex gap-4 items-start hover:border-[#C5A880]/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/25 flex items-center justify-center text-[#C5A880] shrink-0 font-['Fraunces'] text-lg">
                    {loc.n}
                  </div>
                  <div className="min-w-0">
                    <div className="flex justify-between items-center gap-2 w-full">
                      <h4 className="font-bold text-sm text-[#F3EFE6]">{loc.city}</h4>
                      <Badge className="bg-[#C5A880]/15 text-[#E2C799] text-[9px] border border-[#C5A880]/25 py-0.5 px-2">{loc.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">{loc.text}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Partner: American Living s.r.o.</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 text-center font-medium">
              Domy vlastnia a spravujú licencovaní partneri.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}