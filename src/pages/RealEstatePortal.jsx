import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AISearchBar from "@/components/realestate/AISearchBar";
import PropertyCard from "@/components/realestate/PropertyCard";
import LeadModal from "@/components/realestate/LeadModal";
import MortgageCalculator from "@/components/realestate/MortgageCalculator";

export default function RealEstatePortal() {
  const [aiQuery, setAiQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { ids, reasons: {id: reason}, summary }
  const [leadDom, setLeadDom] = useState(null);
  const [calcPrice, setCalcPrice] = useState(89000);

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['realestate-domy'],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }, 'poradie'),
  });

  const handleAiSearch = async () => {
    const q = aiQuery.trim();
    if (!q || domy.length === 0) return;
    setSearching(true);
    setAiResult(null);

    base44.analytics.track({ eventName: "realestate_portal_ai_search" });

    try {
      const katalog = domy.map(d => ({
        id: d.id,
        nazov: d.nazov,
        vyrobca: d.vyrobca,
        typ: d.typ_domu,
        kategoria: d.kategoria,
        cena_eur: d.zakladna_cena,
        zastavana_plocha_m2: d.zastavana_plocha,
        uzitkova_plocha_m2: d.uzitkova_plocha,
        pocet_izieb: d.pocet_izieb,
        popis: (d.popis || "").slice(0, 200),
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Si realitný AI asistent spoločnosti American Living, ktorá predáva modulárne, mobilné a montované domy na Slovensku.

Zákazník napísal túto požiadavku v prirodzenej reči: "${q}"

Tu je aktuálny katalóg domov (JSON): ${JSON.stringify(katalog)}

Tvoja úloha:
1. Vyber z katalógu domy, ktoré najlepšie zodpovedajú požiadavke zákazníka, zoradené od najvhodnejšieho. Ber do úvahy cenu, počet izieb, plochu, typ domu a popis. Ak zákazník uvedie rozpočet, prísne ho rešpektuj (základná cena musí byť pod rozpočtom).
2. Ku každému vybranému domu napíš krátke zdôvodnenie v slovenčine (max 15 slov), prečo sa hodí.
3. Napíš krátke celkové zhrnutie odporúčania v slovenčine (max 2 vety, priateľský tón).

Ak žiadny dom nevyhovuje presne, vyber 2-3 najbližšie alternatívy a v zhrnutí vysvetli kompromis.`,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  reason: { type: "string" },
                },
              },
            },
            summary: { type: "string" },
          },
        },
      });

      const matches = (result?.matches || []).filter(m => domy.some(d => d.id === m.id));
      const reasons = {};
      matches.forEach(m => { reasons[m.id] = m.reason; });
      setAiResult({
        ids: matches.map(m => m.id),
        reasons,
        summary: result?.summary || "",
      });
    } catch (err) {
      // Fallback: jednoduché kľúčové vyhľadávanie, ak AI zlyhá
      const ql = q.toLowerCase();
      const ids = domy
        .filter(d =>
          (d.nazov || "").toLowerCase().includes(ql) ||
          (d.popis || "").toLowerCase().includes(ql) ||
          (d.vyrobca || "").toLowerCase().includes(ql)
        )
        .map(d => d.id);
      setAiResult({
        ids,
        reasons: {},
        summary: ids.length > 0
          ? "AI asistent je momentálne nedostupný, zobrazujeme výsledky podľa kľúčových slov."
          : "AI asistent je momentálne nedostupný a kľúčové slová sa nezhodujú so žiadnym domom. Skúste to prosím neskôr.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setAiQuery("");
    setAiResult(null);
  };

  const displayedDomy = useMemo(() => {
    if (!aiResult) return domy;
    const order = new Map(aiResult.ids.map((id, i) => [id, i]));
    return domy
      .filter(d => order.has(d.id))
      .sort((a, b) => order.get(a.id) - order.get(b.id));
  }, [domy, aiResult]);

  const handleInterest = (dom) => {
    setLeadDom(dom);
    if (dom.zakladna_cena) setCalcPrice(Math.round(dom.zakladna_cena));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">

      {/* HERO SEKCIA S AI VYHĽADÁVAČOM */}
      <section className="relative overflow-hidden pt-16 pb-16 px-4 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-mono">
            ✨ AI vyhľadávanie v prirodzenej reči – American Living Portál
          </Badge>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Nájdite svoj nový rodinný dom <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">prirodzenou rečou</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Už žiadne nekonečné vyklikávanie filtrov. Napíšte AI asistentovi presne to, čo od svojho bývania očakávate – on vám odporučí najvhodnejšie domy z našej reálnej ponuky.
          </p>

          <AISearchBar
            query={aiQuery}
            onQueryChange={setAiQuery}
            onSearch={handleAiSearch}
            onClear={handleClear}
            searching={searching}
            aiSummary={aiResult?.summary}
          />
        </div>
      </section>

      {/* ZOZNAM NEHNUTEĽNOSTÍ */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                {aiResult ? `AI odporúčané domy (${displayedDomy.length})` : `Ponuka domov American Living (${displayedDomy.length})`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Garancia ceny na kľúč, garancia dodania a záruka na stavbu</p>
            </div>
            {aiResult && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs rounded-xl"
              >
                Zobraziť celú ponuku
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-sm font-mono">Načítavam ponuku domov...</span>
            </div>
          ) : displayedDomy.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">Nenašli sa žiadne domy zodpovedajúce vašej požiadavke.</p>
              <Button
                variant="outline"
                onClick={handleClear}
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs rounded-xl"
              >
                Zobraziť celú ponuku
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedDomy.map((dom) => (
                <PropertyCard
                  key={dom.id}
                  dom={dom}
                  aiReason={aiResult?.reasons[dom.id]}
                  onInterest={handleInterest}
                />
              ))}
            </div>
          )}
        </div>

        {/* HYPOTEKÁRNA KALKULAČKA */}
        <MortgageCalculator price={calcPrice} onPriceChange={setCalcPrice} />
      </main>

      {/* MODÁLNE OKNO PRE DOPYT */}
      {leadDom && <LeadModal dom={leadDom} onClose={() => setLeadDom(null)} />}
    </div>
  );
}