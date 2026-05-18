import React from 'react';
import { ShieldCheck, Timer, Leaf, Layers, Award, CheckCircle2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProstoHouseMarketing() {
  return (
    <div className="w-full bg-slate-950 text-slate-200 rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-8">
      {/* Hero sekcia */}
      <div className="relative p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Award className="w-4 h-4 text-red-500" />
            <span>Oficiálny distribútor pre SR</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            ProstoHouse: Inovatívne Montované Domy pre Moderné Bývanie
          </h2>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            V dnešnej dynamickej dobe, keď čas a energetická efektívnosť zohrávajú kľúčovú úlohu, prinášame inovatívne riešenia bývania priamo od renomovaného výrobcu. 
            Garantujeme kvalitu, výhodnú cenu bez navýšenia a plnú kompatibilitu so slovenskou legislatívou.
          </p>
        </div>
      </div>

      {/* Hlavný obsah mriežka */}
      <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-12">
        
        {/* Kľúčové výhody */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers className="text-red-500 w-6 h-6" /> Kľúčové výhody
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard 
              icon={<Timer className="w-6 h-6 text-emerald-400" />}
              title="Rýchlosť Výstavby"
              desc="Montáž hrubej stavby trvá v priemere len 3 až 4 týždne vďaka prefabrikácii."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
              title="Osvedčené Materiály"
              desc="Používa sa kvalitné sušené drevo a nehorľavé izolačné materiály pre životnosť viac ako 80 rokov."
            />
            <FeatureCard 
              icon={<Leaf className="w-6 h-6 text-green-400" />}
              title="Energetická Úspornosť"
              desc="Až 60% úspora nákladov na vykurovanie. Domy spĺňajú podmienky pre certifikát A0."
            />
          </div>
        </div>

        {/* Sekcia certifikát a lokálne prispôsobenie */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/5 rounded-2xl p-6 border border-white/5">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Prispôsobené pre Slovensko</h3>
            <p className="text-slate-400">
              Sme hrdým a výhradným zástupcom ProstoHouse. Domy predávame <strong className="text-white">bez akéhokoľvek navýšenia ceny oproti výrobcovi</strong>.
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Garantovaný Certifikát A0:</strong> Preberáme zodpovednosť za celý proces certifikácie.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Špičková Izolácia:</strong> Hrúbka až 300 mm pre maximálny tepelný komfort.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Bezproblémová Kolaudácia:</strong> Pripravené pre klasické stavebné povolenie v obytnej štvrti.</span>
              </li>
            </ul>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
            <Home className="w-24 h-24 text-white/5" />
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span className="text-4xl font-black text-white drop-shadow-lg">A0</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-widest">Energetická trieda</span>
            </div>
          </div>
        </div>

        {/* Široké portfólio */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Objavte Svet Domov ProstoHouse</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Od kompaktných riešení (31 m²) až po priestranné rodinné domy (220 m²). 
            Ponúkame populárne štýly ako <strong className="text-white">Barnhouse</strong> alebo <strong className="text-white">A-FRAME</strong> s možnosťou tradičnej omietky, vďaka čomu dom navonok pôsobí ako murovaný. 
            American Living s.r.o. funguje ako váš projektový manažér a preberá starosti s výstavbou na seba.
          </p>
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5 transition-colors hover:bg-white/10"
    >
      <div className="w-12 h-12 bg-slate-900 rounded-lg border border-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
