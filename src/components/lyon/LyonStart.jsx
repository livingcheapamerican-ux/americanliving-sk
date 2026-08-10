import React from "react";
import { Home, ShieldCheck, Clock, Sparkles } from "lucide-react";
import LyonBalikCard from "./LyonBalikCard";
import LyonZoznamVCene from "./LyonZoznamVCene";
import { STANDARD_V_CENE, a0Polozky, a0Priplatok, fmt } from "./lyonBaliky";

export default function LyonStart({ dom, CENY, basePrice, onSelectChata, onSelectA0, onExpert }) {
  const priplatok = a0Priplatok(CENY);
  const a0Cena = basePrice + priplatok;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9E2A2B] dark:text-[#C5A880] mb-3">
          <span className="w-8 h-[2px] bg-current" /> Krok 1 z 4 · Vyberte si typ stavby
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {dom?.nazov || 'Lyon'} — čo chcete postaviť?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl mx-auto leading-relaxed">
          Cena uvedená v katalógu je za hotový dom v rekreačnom štandarde. Ak v ňom chcete trvalo bývať,
          vyberte balík Rodinný dom A0 — doplníme všetko, čo je potrebné ku kolaudácii. Detaily môžete doladiť potom.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        <LyonBalikCard
          title="Rekreačná stavba"
          subtitle="Hotová chata či záhradný dom v prémiovom drevenom štandarde. Presne to, čo vidíte v cene katalógu."
          price={basePrice}
          bullets={[
            'Kompletný dom vrátane kúpeľne a podláh',
            'Izolácie 150 mm — pre sezónne a rekreačné bývanie',
            'Bez projektu a certifikátu A0',
            'Nedá sa skolaudovať ako rodinný dom',
          ]}
          ctaLabel="Pokračovať s rekreačnou stavbou"
          onSelect={onSelectChata}
        />

        <LyonBalikCard
          title="Rodinný dom A0"
          subtitle="Ten istý dom doplnený o technológie a dokumentáciu tak, aby ste ho skolaudovali na trvalé bývanie."
          price={a0Cena}
          delta={priplatok}
          badge="Najčastejšia voľba"
          highlight
          bullets={[
            'Izolácie 250 / 200 mm + tepelné čerpadlo a rekuperácia',
            'Projekt, certifikát A0 a revízie ku kolaudácii',
            'Inžiniering — povolenia vybavíme za vás',
            'Trvalý pobyt, hypotéka aj dotácie sú možné',
          ]}
          ctaLabel="Chcem rodinný dom A0"
          onSelect={onSelectA0}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <LyonZoznamVCene
          title="Čo už je v základnej cene"
          note="Ticab house dodáva domy ako prémiové drevodomy. Priplácate iba za zmenu štandardu, nie za základnú výbavu."
          items={STANDARD_V_CENE}
        />
        <LyonZoznamVCene
          title="Čo pribudne pre rodinný dom A0"
          note={`Spolu ${fmt(priplatok)} — každá položka je požiadavka na kolaudáciu, nie voliteľný nadštandard.`}
          items={a0Polozky(CENY)}
          showPrices
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        {[
          { icon: ShieldCheck, text: 'Cena vrátane DPH, bez skrytých položiek' },
          { icon: Clock, text: 'Dodanie 8–12 týždňov od podpisu' },
          { icon: Home, text: 'Základy, doprava a montáž doladíte v ďalšom kroku' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4">
            <Icon className="w-5 h-5 text-[#C5A880] flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onExpert}
        className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Chcem si všetko nastaviť do detailu sám (expert režim)
      </button>
    </div>
  );
}