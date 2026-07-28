import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, SearchX, Plus, KeyRound, Tag, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AISearchBar from "@/components/realestate/AISearchBar";
import FilterBar from "@/components/realestate/FilterBar";
import CoverageMap from "@/components/realestate/CoverageMap";
import PropertyCard from "@/components/realestate/PropertyCard";
import ListingCard from "@/components/realestate/ListingCard";
import LeadModal from "@/components/realestate/LeadModal";
import ListingLeadModal from "@/components/realestate/ListingLeadModal";
import MortgageCalculator from "@/components/realestate/MortgageCalculator";

const TABS = [
  { id: "domy", label: "🏡 Nové domy American Living", icon: Building2 },
  { id: "predaj", label: "🏷️ Nehnuteľnosti na predaj", icon: Tag },
  { id: "prenajom", label: "🔑 Prenájmy", icon: KeyRound },
];

export default function RealEstatePortal() {
  const [aiQuery, setAiQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { ids, reasons, summary }
  const [tab, setTab] = useState("domy");
  const [leadDom, setLeadDom] = useState(null);
  const [leadListing, setLeadListing] = useState(null);
  const [filters, setFilters] = useState({ typ: "all", maxCena: "all", minIzby: "all" });
  const [calcPrice, setCalcPrice] = useState(89000);

  const { data: domy = [], isLoading } = useQuery({
    queryKey: ['realestate-domy'],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }, 'poradie'),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['realestate-listings'],
    queryFn: () => base44.entities.Nehnutelnost.filter({ status: 'schvaleny' }, '-created_date'),
  });

  const handleAiSearch = async () => {
    const q = aiQuery.trim();
    if (!q || (domy.length === 0 && listings.length === 0)) return;
    setSearching(true);
    setAiResult(null);

    base44.analytics.track({ eventName: "realestate_portal_ai_search" });

    try {
      const katalog = [
        ...domy.map(d => ({
          id: d.id,
          typ_zaznamu: "novy_dom_american_living",
          nazov: d.nazov,
          vyrobca: d.vyrobca,
          typ: d.typ_domu,
          cena_eur: d.zakladna_cena,
          zastavana_plocha_m2: d.zastavana_plocha,
          uzitkova_plocha_m2: d.uzitkova_plocha,
          pocet_izieb: d.pocet_izieb,
          popis: (d.popis || "").slice(0, 200),
        })),
        ...listings.map(l => ({
          id: l.id,
          typ_zaznamu: l.typ_ponuky === "prenajom" ? "inzerat_prenajom" : "inzerat_predaj",
          nazov: l.nazov,
          kategoria: l.kategoria,
          mesto: l.mesto,
          cena_eur: l.cena,
          plocha_m2: l.plocha,
          pocet_izieb: l.pocet_izieb,
          popis: (l.popis || "").slice(0, 200),
        })),
      ];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Si realitný AI asistent spoločnosti American Living. Katalóg obsahuje NOVÉ domy American Living (typ_zaznamu: novy_dom_american_living) aj INZERÁTY existujúcich nehnuteľností na predaj a prenájom (inzerat_predaj, inzerat_prenajom).

Zákazník napísal túto požiadavku v prirodzenej reči: "${q}"

Katalóg (JSON): ${JSON.stringify(katalog)}

Tvoja úloha:
1. Vyber záznamy, ktoré najlepšie zodpovedajú požiadavke, zoradené od najvhodnejšieho. Ak zákazník hľadá prenájom, uprednostni inzeráty prenájmu. Ak uvedie rozpočet, prísne ho rešpektuj.
2. Ku každému vybranému záznamu napíš krátke zdôvodnenie v slovenčine (max 15 slov).
3. Napíš krátke celkové zhrnutie v slovenčine (max 2 vety, priateľský tón).

Ak nič nevyhovuje presne, vyber 2-3 najbližšie alternatívy a v zhrnutí vysvetli kompromis.`,
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

      const validId = (id) => domy.some(d => d.id === id) || listings.some(l => l.id === id);
      const matches = (result?.matches || []).filter(m => validId(m.id));
      const reasons = {};
      matches.forEach(m => { reasons[m.id] = m.reason; });
      setAiResult({
        ids: matches.map(m => m.id),
        reasons,
        summary: result?.summary || "",
      });
    } catch (err) {
      const ql = q.toLowerCase();
      const ids = [
        ...domy.filter(d =>
          (d.nazov || "").toLowerCase().includes(ql) ||
          (d.popis || "").toLowerCase().includes(ql)
        ).map(d => d.id),
        ...listings.filter(l =>
          (l.nazov || "").toLowerCase().includes(ql) ||
          (l.mesto || "").toLowerCase().includes(ql)
        ).map(l => l.id),
      ];
      setAiResult({
        ids,
        reasons: {},
        summary: ids.length > 0
          ? "AI asistent je momentálne nedostupný, zobrazujeme výsledky podľa kľúčových slov."
          : "AI asistent je momentálne nedostupný a kľúčové slová sa nezhodujú so žiadnou ponukou. Skúste to prosím neskôr.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setAiQuery("");
    setAiResult(null);
  };

  const aiOrder = useMemo(
    () => (aiResult ? new Map(aiResult.ids.map((id, i) => [id, i])) : null),
    [aiResult]
  );

  const displayedDomy = useMemo(() => {
    let list = domy;
    if (aiOrder) {
      list = domy.filter(d => aiOrder.has(d.id)).sort((a, b) => aiOrder.get(a.id) - aiOrder.get(b.id));
    }
    if (filters.typ !== "all") list = list.filter(d => d.typ_domu === filters.typ);
    if (filters.maxCena !== "all") list = list.filter(d => d.zakladna_cena <= Number(filters.maxCena));
    if (filters.minIzby !== "all") list = list.filter(d => (d.pocet_izieb || 0) >= Number(filters.minIzby));
    return list;
  }, [domy, aiOrder, filters]);

  const displayedListings = useMemo(() => {
    if (aiOrder) {
      return listings.filter(l => aiOrder.has(l.id)).sort((a, b) => aiOrder.get(a.id) - aiOrder.get(b.id));
    }
    return listings.filter(l => l.typ_ponuky === (tab === "prenajom" ? "prenajom" : "predaj"));
  }, [listings, aiOrder, tab]);

  const handleInterest = (dom) => {
    setLeadDom(dom);
    if (dom.zakladna_cena) setCalcPrice(Math.round(dom.zakladna_cena));
  };

  const handleListingInterest = (listing) => {
    setLeadListing(listing);
    if (listing.typ_ponuky === "predaj" && listing.cena) setCalcPrice(Math.round(listing.cena));
  };

  const listingsGrid = (items, emptyText) => (
    items.length === 0 ? (
      <div className="text-center py-16 space-y-3">
        <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400">{emptyText}</p>
        <Link to="/pridat-inzerat">
          <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl">
            <Plus className="w-3.5 h-3.5 mr-1" /> Pridať prvý inzerát zadarmo
          </Button>
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} aiReason={aiResult?.reasons[l.id]} onInterest={handleListingInterest} />
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">

      {/* HERO SEKCIA S AI VYHĽADÁVAČOM */}
      <section className="relative overflow-hidden pt-16 pb-16 px-4 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-mono">
            ✨ AI vyhľadávanie v prirodzenej reči – nové domy, predaj aj prenájom
          </Badge>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Nájdite svoje nové bývanie <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">prirodzenou rečou</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Nové domy American Living, nehnuteľnosti na predaj aj prenájmy – všetko na jednom mieste. Napíšte AI asistentovi, čo hľadáte, a on vám odporučí najvhodnejšiu ponuku.
          </p>

          <AISearchBar
            query={aiQuery}
            onQueryChange={setAiQuery}
            onSearch={handleAiSearch}
            onClear={handleClear}
            searching={searching}
            aiSummary={aiResult?.summary}
          />

          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link to="/odhad-ceny">
              <Button variant="outline" className="w-full border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-white text-xs rounded-xl">
                <Calculator className="w-3.5 h-3.5 mr-1" /> Zistite hodnotu svojej nehnuteľnosti zadarmo
              </Button>
            </Link>
            <Link to="/pridat-inzerat">
              <Button variant="outline" className="w-full border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 hover:text-white text-xs rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1" /> Predávate alebo prenajímate? Pridajte inzerát zadarmo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* OBSAH */}
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        <div className="space-y-6">
          {/* Taby */}
          {!aiResult && (
            <div className="flex gap-2 flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    tab === t.id
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {aiResult ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  AI odporúčania ({displayedDomy.length + displayedListings.length})
                </h2>
                <Button variant="outline" onClick={handleClear}
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs rounded-xl">
                  Zobraziť celú ponuku
                </Button>
              </div>

              {displayedDomy.length === 0 && displayedListings.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">Nenašla sa žiadna zodpovedajúca ponuka.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedDomy.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-amber-300">🏡 Nové domy American Living ({displayedDomy.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayedDomy.map((dom) => (
                          <PropertyCard key={dom.id} dom={dom} aiReason={aiResult.reasons[dom.id]} onInterest={handleInterest} />
                        ))}
                      </div>
                    </div>
                  )}
                  {displayedListings.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-purple-300">🏷️ Inzeráty – predaj a prenájom ({displayedListings.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayedListings.map((l) => (
                          <ListingCard key={l.id} listing={l} aiReason={aiResult.reasons[l.id]} onInterest={handleListingInterest} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : tab === "domy" ? (
            <>
              <FilterBar filters={filters} onChange={setFilters} />
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Ponuka domov American Living ({displayedDomy.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Garancia ceny na kľúč, garancia dodania a záruka na stavbu</p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-sm font-mono">Načítavam ponuku domov...</span>
                </div>
              ) : displayedDomy.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">Žiadne domy nezodpovedajú zvoleným filtrom.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedDomy.map((dom) => (
                    <PropertyCard key={dom.id} dom={dom} onInterest={handleInterest} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {tab === "prenajom" ? <KeyRound className="w-5 h-5 text-sky-400" /> : <Tag className="w-5 h-5 text-purple-400" />}
                    {tab === "prenajom" ? `Prenájmy (${displayedListings.length})` : `Nehnuteľnosti na predaj (${displayedListings.length})`}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Overené inzeráty od majiteľov a agentov – inzercia zadarmo</p>
                </div>
                <Link to="/pridat-inzerat">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Pridať inzerát zadarmo
                  </Button>
                </Link>
              </div>
              {listingsGrid(
                displayedListings,
                tab === "prenajom"
                  ? "Zatiaľ tu nie sú žiadne prenájmy. Buďte prvý, kto pridá inzerát!"
                  : "Zatiaľ tu nie sú žiadne nehnuteľnosti na predaj. Buďte prvý, kto pridá inzerát!"
              )}
            </>
          )}
        </div>

        {/* REALITNÁ MAPA */}
        <CoverageMap listings={listings} onListingInterest={handleListingInterest} />

        {/* HYPOTEKÁRNA KALKULAČKA */}
        <MortgageCalculator price={calcPrice} onPriceChange={setCalcPrice} />
      </main>

      {/* MODÁLNE OKNÁ */}
      {leadDom && <LeadModal dom={leadDom} onClose={() => setLeadDom(null)} />}
      {leadListing && <ListingLeadModal listing={leadListing} onClose={() => setLeadListing(null)} />}
    </div>
  );
}