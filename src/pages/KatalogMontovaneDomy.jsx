import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ArrowRight, Star, Clock, Euro, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithWatermark from "../components/ImageWithWatermark";

export default function KatalogMontovaneDomy() {
  const { data: topHouses, isLoading } = useQuery({
    queryKey: ['seo-houses', 'montovany'],
    queryFn: async () => {
      // Fetch 6 best matching houses for this category
      const results = await base44.entities.Dom.filter({ verejny: true, typ_domu: 'montovany' }, 'poradie', 6);
      if (!results || results.length === 0) {
        // Fallback ak nemáme presný typ
        return await base44.entities.Dom.filter({ verejny: true }, 'poradie', 6);
      }
      return results;
    }
  });

  const schemaData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Čo zahŕňa cena za montovaný dom na kľúč?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cena za montovaný dom na kľúč v American Living zahŕňa kompletnú stavbu od základov (alebo zemných skrutiek) až po hotový interiér - podlahy, okná, elektroinštalácie, sanitu a zateplenie v najvyššom štandarde A0."
          }
        },
        {
          "@type": "Question",
          "name": "Ako dlho trvá výstavba montovaného drevodomu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Od podpisu zmluvy a stavebného povolenia je výroba a montáž na pozemku hotová zvyčajne do 2 až 4 mesiacov. Samotná montáž hrubej stavby na pozemku trvá často len niekoľko dní."
          }
        },
        {
          "@type": "Question",
          "name": "Je možné montovaný dom financovať hypotékou?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Áno, naše celoročné montované domy sú riadnymi stavbami, ktoré je možné zapísať do katastra nehnuteľností. Tým pádom ich klasické slovenské banky bežne financujú štandardným hypotekárnym úverom."
          }
        }
      ]
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-['Outfit'] text-slate-100 overflow-hidden">
      <Helmet>
        <title>Montované domy na kľúč s cenou | Drevodomy A0 | American Living</title>
        <meta name="description" content="Katalóg nízkoenergetických montovaných domov a drevostavieb na kľúč. Najrýchlejšia výstavba, pevná cena, A0 certifikát a špičkový dizajn. Pozrite si našu ponuku." />
        <meta property="og:title" content="Montované domy na kľúč s cenou | American Living" />
        <meta property="og:description" content="Moderné drevodomy a nízkoenergetické stavby od profíkov. Štandard A0." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("KatalogMontovaneDomy")}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 z-10" />
          <img 
            src="https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/07d853b0-6815-4fa8-b21a-e6a2eb68095d.webp" 
            alt="Montovaný dom na kľúč od American Living" 
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        <div className="container mx-auto relative z-20 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold mb-6">
              <Star className="w-4 h-4" /> Najlepšia voľba pre rok 2025
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Moderné <span className="text-red-500">Montované Domy</span> na kľúč
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Zabudnite na roky plné stresu pri stavaní. Nízkoenergetické drevodomy a montované stavby vám dodáme bleskovo, s garanciou pevnej ceny a v prísnom energetickom štandarde A0.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to="#nasa-ponuka">Pozrieť najlepšie domy</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to={createPageUrl("Katalog")}>Zobraziť kompletný katalóg</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Blesková rýchlosť</h3>
              <p className="text-slate-400">Výroba v hale nie je závislá na počasí. Na pozemku staviame v priebehu pár dní, bývať môžete do 3-4 mesiacov.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Euro className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pevná a garantovaná cena</h3>
              <p className="text-slate-400">Vďaka presnej prefabrikácii nehrozia žiadne "nepredvídané" stavebné náklady. Čo je v zmluve, to platí.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Energetický štandard A0</h3>
              <p className="text-slate-400">Drevostavby s dokonalou tepelnou izoláciou, rekuperáciou a úspornými technológiami pre zdravý a lacný život.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Houses */}
      <section id="nasa-ponuka" className="py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Najobľúbenejšie <span className="text-red-500">Montované Domy</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Vybrali sme pre vás tie najvyhľadávanejšie projekty s najlepším pomerom ceny a kvality pre slovenský trh.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topHouses?.map((dom) => (
                <Card key={dom.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col">
                  <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}`} className="block relative aspect-video overflow-hidden">
                    <ImageWithWatermark
                      src={dom.hlavny_obrazok || '/api/placeholder/400/225'}
                      alt={dom.nazov}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Top Výber
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">
                      <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}`}>{dom.nazov}</Link>
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{dom.popis}</p>
                    <div className="mt-auto grid grid-cols-2 gap-4 text-sm font-semibold border-t border-slate-800 pt-4">
                      <div>
                        <p className="text-slate-500 text-xs">Plocha</p>
                        <p className="text-slate-100">{dom.zastavana_plocha} m²</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Cena od</p>
                        <p className="text-red-400">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-8 rounded-full" asChild>
              <Link to={`${createPageUrl("Katalog")}?typ=montovany`}>
                Pozrieť ďalšie montované domy <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Rich Text Section (Information Gain) */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none prose-a:text-red-400">
            <h2 className="text-3xl font-bold text-white mb-6">Prečo sú moderné montované domy trendom budúcnosti?</h2>
            <p>
              Výraz "montovaný dom" už dávno neznamená tenkú stenu a letnú chatku. V roku 2025 ide o špičkové, inžiniersky prepracované drevostavby a oceľové konštrukcie, ktoré <strong>hrúbkou izolácie a energetickou úspornosťou často prekonávajú klasické tehlové domy</strong>.
            </p>
            
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Výhody a nevýhody montovaných domov</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-950/30 p-6 rounded-xl border border-green-900/50">
                <h4 className="text-green-500 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Hlavné Výhody</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2"><span>•</span> Hrubá stavba hotová za pár dní (tzv. suchá výstavba bez potreby zrenia).</li>
                  <li className="flex gap-2"><span>•</span> Viac úžitkovej plochy pri rovnakej zastavanej ploche (steny drevodomov sú tenšie, ale lepšie izolujú).</li>
                  <li className="flex gap-2"><span>•</span> Ekologické a udržateľné materiály pre zdravé bývanie.</li>
                </ul>
              </div>
              <div className="bg-red-950/30 p-6 rounded-xl border border-red-900/50">
                <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Na čo si dať pozor</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2"><span>•</span> Menšia tepelná akumulácia (dom sa rýchlejšie vykúri, ale po vypnutí kúrenia skôr vychladne, čo riešime špičkovou izoláciou).</li>
                  <li className="flex gap-2"><span>•</span> Horšia zvuková izolácia pri nesprávnom návrhu (my však používame hrubé sendvičové panely s akustickými doskami).</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Časté otázky (FAQ)</h3>
            <div className="space-y-6">
              {schemaData.mainEntity.map((faq, i) => (
                <div key={i} className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h4 className="text-lg font-bold text-white mb-2">{faq.name}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}