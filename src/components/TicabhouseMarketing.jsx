import React from 'react';
import { ShieldCheck, Timer, Leaf, Layers, Award, CheckCircle2, Home, Blocks, Rocket, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TicabhouseMarketing() {
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
            Ticabhouse: Moderné Modulárne Bývanie
          </h2>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Vášeň pre kvalitu, rýchlosť a váš šťastný domov. Sme oficiálnym distribútorom, ktorý vám prináša tieto inovatívne domy priamo od výrobcu – 
            so zárukou kvality, bez skrytých poplatkov a s plným prispôsobením slovenskej legislatíve.
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
              title="Rýchla Realizácia"
              desc="Výroba domu vo fabrike trvá len cca 6 týždňov. Nasťahujte sa skôr s minimom stresu."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
              title="Kvalita a Spoľahlivosť"
              desc="Konštrukcia zo suchého kalibrovaného dreva. Osvedčené z trhov USA a Nórska."
            />
            <FeatureCard 
              icon={<Leaf className="w-6 h-6 text-green-400" />}
              title="Energetická Efektívnosť"
              desc="Až 250mm ECO izolácia z minerálnej vlny pre nižšie náklady a komfort po celý rok."
            />
            <FeatureCard 
              icon={<Blocks className="w-6 h-6 text-amber-400" />}
              title="Individuálny Prístup"
              desc="Výroba domov podľa individuálnych návrhov presne prispôsobená vašim potrebám."
            />
            <FeatureCard 
              icon={<Rocket className="w-6 h-6 text-purple-400" />}
              title="Inovatívne Riešenia"
              desc="Neustále zdokonaľovanie technológií a konštrukčných dizajnových prvkov."
            />
            <FeatureCard 
              icon={<HeartHandshake className="w-6 h-6 text-red-400" />}
              title="Environmentálna Zodpovednosť"
              desc="Organické drevo a ekologické materiály pre bývanie v dokonalom súlade s prírodou."
            />
          </div>
        </div>

        {/* Sekcia certifikát a lokálne prispôsobenie */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/5 rounded-2xl p-6 border border-white/5">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">American Living: Váš Priamy Kontakt</h3>
            <p className="text-slate-400">
              Sme oficiálnym partnerom Ticabhouse pre Slovensko. Garantujeme <strong className="text-white">férovú cenu priamo od výrobcu</strong>, bez akýchkoľvek skrytých navýšení.
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Certifikácia A0:</strong> Domy spĺňajú podmienky pre skolaudovanie s certifikátom A0.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Stavebné Povolenie:</strong> Pripravené pre osadenie klasickým stavebným povolením.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><strong className="text-white">Skúsenosti od 2008:</strong> Overené know-how z najnáročnejších klimatických podmienok.</span>
              </li>
            </ul>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
            <Home className="w-24 h-24 text-white/5" />
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span className="text-4xl font-black text-white drop-shadow-lg">Ticabhouse</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-widest">Spoľahlivý partner</span>
            </div>
          </div>
        </div>

        {/* Široké portfólio */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h3 className="text-xl font-bold text-white">Objavte Rozmanitosť Portfólia</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Jednomodulové Domy</h4>
              <p className="text-xs text-slate-400">Kompaktné a štýlové. Ideálne pre páry alebo rekreačné bývanie (napr. Vancouver, Sicilia).</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Viacmodulové Domy</h4>
              <p className="text-xs text-slate-400">Priestranné a flexibilné pre rodiny s deťmi (napr. London, Happy Wife).</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Tiny Houses</h4>
              <p className="text-xs text-slate-400">Minimalizmus a mobilita. Komfort bez zbytočností na 19 m².</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-white mb-1">Biznis Projekty</h4>
              <p className="text-xs text-slate-400">Modulárne kancelárie, kaviarne či komerčné SPA a sauny.</p>
            </div>
          </div>
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
