import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Star, Clock, MapPin, Truck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithWatermark from "../components/ImageWithWatermark";

export default function KatalogMobilneDomy() {
  const { data: topHouses, isLoading } = useQuery({
    queryKey: ['seo-houses', 'mobilny'],
    queryFn: async () => {
      const results = await base44.entities.Dom.filter({ verejny: true, typ_domu: 'mobilny' }, 'poradie', 6);
      if (!results || results.length === 0) {
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
          "name": "Je na mobilný dom potrebné stavebné povolenie?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mobilné domy bez pevných základov spojených so zemou (na kolesách alebo na zemných skrutkách) v mnohých prípadoch vyžadujú len ohlášku drobnej stavby, resp. územný súhlas, závisí to však od konkrétneho stavebného úradu a lokality."
          }
        },
        {
          "@type": "Question",
          "name": "Je mobilný dom vhodný na celoročné bývanie?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Áno! Naše moderné celoročné mobilné domy majú hrubú tepelnú izoláciu (často PUR pena alebo hrubá vrstva vaty), okná s trojsklom a plnohodnotné kúrenie/klimatizáciu. Bez problémov v nich prežijete aj tuhú zimu."
          }
        },
        {
          "@type": "Question",
          "name": "Ako funguje doprava mobilného domu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dom vám dovezieme kompletne hotový na špeciálnom kamióne a pomocou žeriavu ho osadíme na vopred pripravené miesto (napríklad zemné vruty alebo pätky) v priebehu jediného dňa."
          }
        }
      ]
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-['Outfit'] text-slate-100 overflow-hidden">
      <Helmet>
        <title>Celoročné mobilné domy | Ceny, výhody a katalóg | American Living</title>
        <meta name="description" content="Katalóg luxusných celoročných mobilných domov. Rýchle dodanie, plnohodnotné zateplenie, dodanie na kľúč. Zistite ceny a prezrite si najlepšie modely." />
        <meta property="og:title" content="Celoročné mobilné domy a bývanie bez starostí | American Living" />
        <meta property="og:description" content="Dodáme vám hotový zateplený mobilný dom priamo na pozemok. Vhodné na celoročné bývanie." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("KatalogMobilneDomy")}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 z-10" />
          <img 
            src="https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/e6f77ccb-c5e7-49f9-bcff-183e20e8b284.webp" 
            alt="Zateplený mobilný dom v prírode" 
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        <div className="container mx-auto relative z-20 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold mb-6">
              <Star className="w-4 h-4" /> Najväčší trend tohto roka
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Celoročné <span className="text-emerald-500">Mobilné Domy</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Plnohodnotné, zateplené a luxusne vybavené bývanie, ktoré vám dovezieme kompletne hotové priamo na pozemok. Žiadne stavebné povolenia plné byrokracie, len okamžité nasťahovanie.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to="#nasa-ponuka">Prezrieť najlepšie modely</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dovezieme hotové</h3>
              <p className="text-slate-400">Dom príde hotový na kamióne. Žiadny neporiadok zo stavby na vašom pozemku, stačí len napojiť siete.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sloboda presunu</h3>
              <p className="text-slate-400">Váš dom nie je pevne spojený so zemou. Ak sa o 5 rokov rozhodnete zmeniť lokalitu, dom môže cestovať s vami.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Zimné zateplenie</h3>
              <p className="text-slate-400">Používame pokročilé izolačné panely a PUR penu, vďaka čomu naše domy pohodlne zvládnu aj kruté zimy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Houses */}
      <section id="nasa-ponuka" className="py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Najobľúbenejšie <span className="text-emerald-500">Mobilné Domy</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Tieto modely sú u našich zákazníkov najžiadanejšie pre celoročné bývanie aj víkendový oddych.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topHouses?.map((dom) => (
                <Card key={dom.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col">
                  <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}`} className="block relative aspect-video overflow-hidden">
                    <ImageWithWatermark
                      src={dom.hlavny_obrazok || '/api/placeholder/400/225'}
                      alt={dom.nazov}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
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
                        <p className="text-emerald-400">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-8 rounded-full" asChild>
              <Link to={`${createPageUrl("Katalog")}?typ=mobilny`}>
                Zobraziť všetky mobilné domy <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Rich Text Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none prose-a:text-emerald-400">
            <h2 className="text-3xl font-bold text-white mb-6">Mobilné bývanie nie sú len staré karavany</h2>
            <p>
              Pri slove "mobilný dom" si mnohí predstavia tenké plechové domčeky z bazáru, ktoré v lete pripomínajú saunu a v zime mrazničku. Dnešné celoročné mobilné domy sú však konštrukčne, dizajnovo a najmä tepelne na úplne inej úrovni.
            </p>
            
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Rozdiel medzi víkendovým a celoročným mobilným domom</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h4 className="text-slate-300 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Víkendové / Sezónne</h4>
                <p className="text-sm text-slate-400">
                  Lacnejšie varianty, ktoré majú tenšiu vrstvu izolácie (zvyčajne do 10 cm). Sú ideálne ako záhradné chatky, kde sa nezdržiavate počas najväčších mrazov.
                </p>
              </div>
              <div className="bg-emerald-950/30 p-6 rounded-xl border border-emerald-900/50">
                <h4 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Celoročné zateplené</h4>
                <p className="text-sm text-slate-300">
                  Mohutnejšia konštrukcia (často oceľová klietka alebo silný drevený rám), izolačná vrstva od 15-20 cm vyššie, 3-sklá, kvalitné podlahové kúrenie. Zaručujú absolútny komfort 365 dní v roku.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Časté otázky o mobilných domoch (FAQ)</h3>
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