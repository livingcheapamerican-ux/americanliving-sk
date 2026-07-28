import React, { useState, useMemo } from "react";
import { 
  Sparkles, Search, MapPin, Home, Euro, Calculator, ShieldCheck, 
  ChevronRight, Phone, Mail, CheckCircle2, ArrowRight, X, SlidersHorizontal,
  Bed, Bath, Maximize, Lock, Building2, Eye, Flame, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 🏡 REÁLNE NEHNUTEĽNOSTI & PROJEKTY AMERICAN LIVING
const REAL_ESTATE_LISTINGS = [
  {
    id: "fjord-130",
    title: "Váš luxusný rodinný dom Fjord 130 m²",
    category: "Drevostavba / Rodinný dom",
    location: "Kvetoslavov / Okolie BA (30 min od centra)",
    price_eur: 189000,
    area_m2: 130,
    rooms: 4,
    bathrooms: 2,
    energy_rating: "A0 (Nízkoenergetický)",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    badge: "🔥 Najobľúbenejší Model",
    description: "Moderný 4-izbový nízkonákladový rodinný dom Fjord s plochou 130 m². Skvelé dispozičné riešenie, veľká terasa a tepelné čerpadlo v cene.",
    features: ["Tepelné čerpadlo", "Podlahové kúrenie", "Veľkoformátové okná", "Príprava na fotovoltiku"]
  },
  {
    id: "tinyhouse-mobile",
    title: "Snívate o vlastnom dome na kolesách? Drevostavba Tinyhouse",
    category: "Mobilný dom / Tinyhouse",
    location: "Stupava & Celá SR",
    price_eur: 45000,
    area_m2: 42,
    rooms: 2,
    bathrooms: 1,
    energy_rating: "A0",
    image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    badge: "⚡ Rýchle Dodanie (3 mesiace)",
    description: "Štýlový celoročne obývateľný mobilný Tinyhouse. Kompletné vybavenie vrátane kúpeľne, kuchynskej linky a loftovej spálne.",
    features: ["Zariadený interier", "Celoročná izolácia", "Flexibilné umiestnenie", "Nízke mesačné náklady (40 €)"]
  },
  {
    id: "luxus-5room",
    title: "Luxusný 5-izbový rodinný drevodom Premium",
    category: "Rodinný dom na kľúč",
    location: "Nové Zámky / Komárno",
    price_eur: 239000,
    area_m2: 175,
    rooms: 5,
    bathrooms: 3,
    energy_rating: "A0 Super-low energy",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    badge: "👑 Premium Edition",
    description: "Priestranný 5-izbový dvojpodlažný dom pre náročnú rodinu. Dvojgaráž, krytá terasa a inteligentná domácnosť v štandarde.",
    features: ["Dvojgaráž", "Smart Home rozvody", "Rekuperácia", "Fotovoltický systém 5kW"]
  },
  {
    id: "americana-dotacia",
    title: "Americana Dotácia: Byt vs. Rodinný Dom",
    category: "Novostavba na pozemku",
    location: "Západné Slovensko",
    price_eur: 159000,
    area_m2: 110,
    rooms: 4,
    bathrooms: 2,
    energy_rating: "A0",
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    badge: "💰 Výhodné Financovanie",
    description: "Zymeňte predražený 3-izbový byt za nový 4-izbový rodinný dom s vlastnou záhradou za rovnakú cenu hypotéky.",
    features: ["Pozemok v cene", "Garancia ceny", "Pomoc s hypotékou zdarma", "Nulové poplatky RK"]
  }
];

export default function RealEstatePortal() {
  const [aiQuery, setAiQuery] = useState("");
  const [leadModalListing, setLeadModalListing] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [submittedLead, setSubmittedLead] = useState(false);

  // Hypotekárna kalkulačka
  const [calcPrice, setCalcPrice] = useState(189000);
  const [calcDown, setCalcDown] = useState(20);
  const [calcYears, setCalcYears] = useState(30);
  const [calcRate, setCalcRate] = useState(3.8);

  const monthlyPayment = useMemo(() => {
    const loanAmount = calcPrice * (1 - calcDown / 100);
    const monthlyRate = calcRate / 100 / 12;
    const months = calcYears * 12;
    if (monthlyRate === 0) return loanAmount / months;
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }, [calcPrice, calcDown, calcYears, calcRate]);

  // AI Vyhľadávanie v prirodzenej reči
  const filteredListings = useMemo(() => {
    if (!aiQuery.trim()) return REAL_ESTATE_LISTINGS;
    const q = aiQuery.toLowerCase();
    return REAL_ESTATE_LISTINGS.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.features.some(f => f.toLowerCase().includes(q))
    );
  }, [aiQuery]);

  function handleSendLead(e) {
    e.preventDefault();
    setSubmittedLead(true);
    setTimeout(() => {
      setSubmittedLead(false);
      setLeadModalListing(null);
      setLeadForm({ name: "", phone: "", email: "", note: "" });
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* 🔒 UPOZORNENIE O INTERNOM PREVIEW REŽIME PRE AMERICAN LIVING SK */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <strong className="uppercase font-bold tracking-wider">🔒 Interné Preview pre American Living SK:</strong>
          <span>Tento AI Realitný Portál je momentálne v neverejnom režime pre testovanie a schválenie.</span>
        </div>
      </div>

      {/* HERO SEKCIA S AI VYHĽADÁVAČOM V PRIRODZENOM JAZYKU */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-mono">
            ✨ Powered by Gemini AI Natural Language Search (American Living Portal)
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Nájdite svoj nový rodinný dom <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">prirodzenou rečou AI</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Už žiadne nekonečné vyklikávanie zbytočných filtrov. Napíšte AI asistentovi presne to, čo od svojho bývania očakávate.
          </p>

          {/* AI VYHĽADÁVACIE POLE S PROMPTAMI */}
          <div className="bg-slate-900/90 border border-purple-500/40 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-slate-950/80 rounded-xl px-4 py-3 border border-slate-800 focus-within:border-purple-400 transition-all">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Skúste napísať: Hľadám 4-izbový rodinný dom v okolí Bratislavy do 200k s nízkymi nákladmi..."
                className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
              />
              {aiQuery && (
                <button onClick={() => setAiQuery("")} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* RYCHLE UKÁŽKY DOTAZOV */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 px-1 text-[11px] font-mono">
              <span className="text-slate-500 font-bold shrink-0">Skúste príkazy:</span>
              {[
                "Nízkoenergetický Fjord 130m²",
                "Mobilný dom Tinyhouse do 50k",
                "Luxusný 5-izbový dom s dvojgarážou",
                "Bývanie v Stupave a Kvetoslavove"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setAiQuery(suggestion)}
                  className="bg-slate-800/60 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/60 rounded-lg px-2.5 py-1 whitespace-nowrap transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HLAVNÝ OBSAH - ZOZNAM NEHNUTEĽNOSTÍ */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Ponuka Novostavieb & Rodinných Domov American Living ({filteredListings.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Garancia ceny na kľúč, garancia dodania a 10-ročná záruka na stavbu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-slate-950/80 text-amber-300 border border-amber-500/30 text-[10px] backdrop-blur-md">
                        {item.badge}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-emerald-500/90 text-slate-950 font-black text-xs">
                        {item.price_eur.toLocaleString()} €
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">{item.category}</span>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{item.title}</h3>
                    
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-xl text-[10px] font-mono text-slate-300 border border-slate-800 text-center">
                      <div><Maximize className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{item.area_m2} m²</div>
                      <div><Bed className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{item.rooms} izby</div>
                      <div><Bath className="w-3 h-3 mx-auto text-slate-500 mb-0.5" />{item.bathrooms} kúpeľňa</div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <Button 
                    onClick={() => {
                      setLeadModalListing(item);
                      setCalcPrice(item.price_eur);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 py-2.5"
                  >
                    Mám Záujem / Obhliadka <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HYPOTEKÁRNA KALKULAČKA */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
              <Calculator className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Hypotekárna Kalkulačka American Living</h3>
              <p className="text-xs text-slate-400">Vypočítajte si presnú mesačnú splátku vášho nového rodinného domu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-4 lg:col-span-2 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cena nehnuteľnosti:</span>
                  <strong className="text-amber-400 font-bold">{calcPrice.toLocaleString()} €</strong>
                </div>
                <input 
                  type="range" min="30000" max="400000" step="5000" value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Vlastné úspory (Akontácia %):</span>
                  <strong className="text-amber-400 font-bold">{calcDown} % ({Math.round(calcPrice * calcDown / 100).toLocaleString()} €)</strong>
                </div>
                <input 
                  type="range" min="0" max="50" step="5" value={calcDown}
                  onChange={(e) => setCalcDown(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 mb-1 block">Doba splácania (roky):</label>
                  <select 
                    value={calcYears} 
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} rokov</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Úroková sadzba (% p.a.):</label>
                  <input 
                    type="number" step="0.1" value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 text-center space-y-4 shadow-xl">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Odhadovaná mesačná splátka</span>
              <div className="text-4xl font-black text-amber-400 font-mono">
                {monthlyPayment} € <span className="text-sm font-normal text-slate-400">/ mesiac</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Výpočet je orientačný. Náš hypotekárny špecialista vám vybaví schválenie hypotéky zdarma.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* MODÁLNE OKNO PRE DOPYT */}
      {leadModalListing && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setLeadModalListing(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                Mám záujem o projekt
              </Badge>
              <h3 className="text-base font-bold text-white leading-snug">{leadModalListing.title}</h3>
              <p className="text-xs text-slate-400 font-mono">Lokalita: {leadModalListing.location} • Cena: {leadModalListing.price_eur.toLocaleString()} €</p>
            </div>

            {submittedLead ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Ďakujeme za Váš záujem!</h4>
                <p className="text-xs text-slate-300 font-mono">Váš dopyt bol odoslaný. Náš poradca American Living vám zavolá v priebehu dnešného dňa.</p>
              </div>
            ) : (
              <form onSubmit={handleSendLead} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Meno a Priezvisko *</label>
                  <input 
                    type="text" required
                    placeholder="napr. Richard Kováč"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefónne číslo *</label>
                  <input 
                    type="tel" required
                    placeholder="napr. +421 905 123 456"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Váš E-mail</label>
                  <input 
                    type="email"
                    placeholder="napr. richard@americanliving.sk"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Poznámka / Otázka (Voliteľné)</label>
                  <textarea 
                    rows={2}
                    placeholder="Mám záujem o osobnú obhliadku v Kvetoslavove..."
                    value={leadForm.note}
                    onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl">
                  Odoslať Dopyt
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
