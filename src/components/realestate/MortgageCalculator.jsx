import React, { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

export default function MortgageCalculator({ price, onPriceChange }) {
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(3.8);

  const monthlyPayment = useMemo(() => {
    const loanAmount = price * (1 - down / 100);
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    if (!months) return 0;
    if (monthlyRate === 0) return Math.round(loanAmount / months);
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }, [price, down, years, rate]);

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
          <Calculator className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Smart hypotekárna kalkulačka American Living</h3>
          <p className="text-xs text-slate-400">Vypočítajte si orientačnú mesačnú splátku vášho nového domu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="space-y-4 lg:col-span-2 font-mono text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Cena nehnuteľnosti:</span>
              <strong className="text-amber-400 font-bold">{price.toLocaleString("sk-SK")} €</strong>
            </div>
            <input
              type="range" min="30000" max="400000" step="1000" value={price}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Vlastné úspory (akontácia %):</span>
              <strong className="text-amber-400 font-bold">{down} % ({Math.round(price * down / 100).toLocaleString("sk-SK")} €)</strong>
            </div>
            <input
              type="range" min="0" max="50" step="5" value={down}
              onChange={(e) => setDown(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 mb-1 block">Doba splácania (roky):</label>
              <select
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} rokov</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Úroková sadzba (% p.a.):</label>
              <input
                type="number" step="0.1" min="0" max="15" value={rate}
                onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 text-center space-y-4 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Odhadovaná mesačná splátka</span>
          <div className="text-4xl font-black text-amber-400 font-mono">
            {monthlyPayment.toLocaleString("sk-SK")} € <span className="text-sm font-normal text-slate-400">/ mesiac</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Výpočet je orientačný. Náš hypotekárny špecialista vám vybaví schválenie hypotéky zdarma.
          </p>
        </div>
      </div>
    </section>
  );
}