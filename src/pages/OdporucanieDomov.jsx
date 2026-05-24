import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, Loader2, Home, ArrowRight, CheckCircle, TrendingUp, 
  Calculator, Search, ThumbsUp, ThumbsDown, Heart, Info, Lock, RefreshCw, FileText
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import ImageWithWatermark from "../components/ImageWithWatermark";

export default function OdporucanieDomov() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ── PREFERENCES & RADAR STATE ──────────────────────────────────────
  const [preferences, setPreferences] = useState({
    budget: 120000,
    rooms: 3,
    purpose: "",
    region: "",
    otherNeeds: ""
  });

  const [radar, setRadar] = useState({
    affordability: 70,    // Cenová dostupnosť (váha)
    space: 60,            // Úžitková plocha (váha)
    speed: 50,            // Rýchlosť dodania (váha)
    A0Rating: 80,         // Ekologickosť a A0 (váha)
    customizability: 60   // Miera prispôsobenia (váha)
  });

  // ── TINDER ESTHETICS DECK STATE ────────────────────────────────────
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [styleScores, setStyleScores] = useState({
    woodCladding: 0,
    flatMinimalism: 0,
    traditional: 0,
    largeGlazing: 0,
    mortgageNeed: 0,
    A0Rating: 0
  });

  const [activeHouseId, setActiveHouseId] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tinder cards configuration mapping to manufacturer strengths & know-how
  const tinderCards = useMemo(() => [
    {
      id: "wood",
      title: "Severský drevený obklad",
      desc: "Oslovuje vás prírodná textúra a vôňa dreva? (Domki z Gór & Ticab house využívajú smrek ako štandard).",
      img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/eccd583aa_barn-double-prosto-house-3.jpg",
      effects: { woodCladding: 35 }
    },
    {
      id: "minimalism",
      title: "Ultra-moderný Flat / minimalizmus",
      desc: "Čisté línie, ploché strechy a kubický dizajn vyžarujúci mestský futurizmus (Prosto House modely Flat).",
      img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/25e2796ce_Londonexteriermurovka1.jpeg",
      effects: { flatMinimalism: 35 }
    },
    {
      id: "traditional",
      title: "Tradičný chatový štýl",
      desc: "Sedlová strecha a masívne drevo. Odolnosť voči snehu a tradičný horský šarm (Domki z Gór).",
      img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/49133a5d4_Barnhills.jpeg",
      effects: { traditional: 35 }
    },
    {
      id: "glazing",
      title: "Veľkoformátové okná & presklenia",
      desc: "Množstvo denného svetla a panoramatické prepojenie interiéru s terasou (Prosto House & Barn Double).",
      img: "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/cbd41c122_Barnbazen.jpeg",
      effects: { largeGlazing: 35 }
    },
    {
      id: "mortgage",
      title: "Financovanie cez hypotéku",
      desc: "Budete čerpať klasickú hypotéku? (Vyžaduje dom v katastri - len rodinné domy s A0, nie mobilné domy).",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
      effects: { mortgageNeed: 50 }
    },
    {
      id: "eco",
      title: "Pasívny energetický štandard A0",
      desc: "Rekuperácia, tepelné čerpadlo a nízke faktúry (A0 certifikácia ako upgrade pre Ticab/Prosto).",
      img: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80",
      effects: { A0Rating: 30 }
    }
  ], []);

  // Fetch all public houses from DB
  const { data: allHouses = [] } = useQuery({
    queryKey: ['houses-all'],
    queryFn: () => base44.entities.Dom.filter({ verejny: true }, 'poradie', 100),
    staleTime: 300000,
  });

  const publicHouses = useMemo(() => {
    return allHouses.filter(h => h.verejny !== false && h.vyrobca !== 'JAK Modules');
  }, [allHouses]);

  // ── REAL-TIME MATHEMATICAL MATCH ENGINE ────────────────────────────
  const calculatedMatchScores = useMemo(() => {
    if (publicHouses.length === 0) return [];

    return publicHouses.map(house => {
      let score = 100;
      const reasons = [];

      // 1. Budget vs price logic based on manufacturer details
      const basePrice = house.zakladna_cena || 0;
      let totalCost = basePrice;
      if (house.vyrobca === "Prosto House") {
        totalCost += 13000 + 12000 + 15000 + 10000; // montaz, zaklady, interier, technologie
      } else if (house.vyrobca === "Ticab house") {
        totalCost += 5000 + 10000 + 15000; // doprava, montaz, technologie
      } else if (house.vyrobca === "Domki z Gór") {
        totalCost += 9000 + 12000 + 15000 + 10000; // doprava z Polska, zaklady, interier, technologie (montaz v cene)
      }

      const affordabilityFactor = radar.affordability / 100;
      if (totalCost > preferences.budget) {
        const diff = totalCost - preferences.budget;
        const penalty = Math.min(45, Math.floor(diff / 4000) * 3 * affordabilityFactor);
        score -= penalty;
        if (penalty > 15) reasons.push("Odhadovaná cena na kľúč presahuje váš rozpočet");
      } else {
        // Reward houses under budget
        score += Math.min(10, Math.floor((preferences.budget - totalCost) / 10000) * 2);
      }

      // 2. Space / Area vs Radar priority
      const area = house.uzitkova_plocha || house.zastavana_plocha || 0;
      const spacePriority = radar.space / 100;
      if (spacePriority > 0.7 && area < 65) {
        score -= 25;
        reasons.push("Menej úžitkového priestoru pre vaše vysoké nároky");
      } else if (spacePriority < 0.4 && area > 110) {
        score -= 15;
        reasons.push("Dom je priestrannejší, než požadujete");
      }

      // 3. Speed vs Radar Speed priority
      if (radar.speed > 70) {
        if (house.vyrobca === "Ticab house") {
          score += 15;
        } else if (house.vyrobca === "Prosto House") {
          score += 5; // Prefab panel assembly is reasonably fast too
        } else {
          score -= 10;
          reasons.push("Drevená stavba vyžaduje dlhšiu realizáciu na pozemku");
        }
      }

      // 4. Mortgage requirements check (Tinder Choice)
      if (styleScores.mortgageNeed > 20 && house.kategoria === "mobilne_domy") {
        score -= 75;
        reasons.push("Mobilné domy banka neakceptuje na klasickú hypotéku");
      }

      // 5. Region / Location logic
      if (preferences.region) {
        const regNormalized = preferences.region.toLowerCase();
        const isMountain = ["tatr", "liptov", "hory", "les", "prirod", "sneh", "chata", "orav", "bystric", "poprad"].some(word => regNormalized.includes(word));
        const isUrban = ["bratislav", "kosic", "nitr", "trnava", "senec", "mesto", "rovina"].some(word => regNormalized.includes(word));
        
        if (isMountain) {
          if (house.vyrobca === "Domki z Gór") {
            score += 20;
          } else if (house.vyrobca === "Ticab house") {
            score += 8;
          }
        } else if (isUrban) {
          if (house.nazov?.toLowerCase().includes("flat") || house.nazov?.toLowerCase().includes("london")) {
            score += 15;
          }
        }
      }

      // 6. Esthetic swipes mapping - Boost manufacturer suitability without penalizing others
      if (styleScores.woodCladding > 15) {
        if (house.vyrobca === "Ticab house" || house.vyrobca === "Domki z Gór") {
          score += 15;
        } else if (house.vyrobca === "Prosto House") {
          score += 8;
        }
      }
      if (styleScores.flatMinimalism > 15) {
        if (house.nazov?.toLowerCase().includes("flat") || house.nazov?.toLowerCase().includes("london")) {
          score += 15;
        } else if (house.vyrobca === "Prosto House") {
          score += 10;
        }
      }
      if (styleScores.traditional > 15) {
        if (house.vyrobca === "Domki z Gór") {
          score += 15;
        } else if (house.nazov?.toLowerCase().includes("a-frame") || house.nazov?.toLowerCase().includes("barn")) {
          score += 12;
        }
      }
      if (styleScores.largeGlazing > 15) {
        if (house.vyrobca === "Prosto House" || house.nazov?.toLowerCase().includes("barn double")) {
          score += 12;
        }
      }

      score = Math.max(15, Math.min(100, Math.round(score)));

      return {
        ...house,
        matchScore: score,
        estimatedTotal: totalCost,
        reasons: reasons.slice(0, 2)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [publicHouses, preferences.budget, preferences.region, radar, styleScores]);

  // Active top house selection
  const topRecommendedHouse = useMemo(() => {
    return calculatedMatchScores[0] || null;
  }, [calculatedMatchScores]);

  // Kexo dynamic assistant comment based on real-time calculated match
  const kexoLiveComment = useMemo(() => {
    if (!topRecommendedHouse) return "Zadajte svoje priority, aby som vám mohol začať vyberať.";
    
    let comment = `🤖 Kexo: Aktuálne pre vás vyberám **${topRecommendedHouse.nazov}** s fantastickou zhodou **${topRecommendedHouse.matchScore}%**. `;
    
    if (styleScores.mortgageNeed > 15) {
      comment += "Keďže chcete financovať stavbu hypotékou, zameriavam sa výlučne na modely z kategórie rodinných domov s A0 izoláciou, nakoľko mobilné domy banka nezaloží. ";
    }
    if (topRecommendedHouse.vyrobca === "Ticab house") {
      comment += "Pri tomto Ticab dome počítajte s bleskovou továrnou výrobou do 6 týždňov, avšak doprava a žeriav na pozemku sú riešené individuálne. ";
    } else if (topRecommendedHouse.vyrobca === "Prosto House") {
      comment += "Prosto House vyniká dopravou zadarmo a možnosťou montáže svojpomocne, pre hypotéku však musíme do kalkulácie pripočítať základy a A0 technológie. ";
    } else if (topRecommendedHouse.vyrobca === "Domki z Gór") {
      comment += "Domki z Gór ponúka nádherný tradičný štýl a montáž v cene, no doprava z Poľska sa nacení individuálne. ";
    }
    
    return comment;
  }, [topRecommendedHouse, styleScores]);

  // ── SVG RADAR CALCULATIONS ─────────────────────────────────────────
  const radarCoordinates = useMemo(() => {
    const center = 150;
    const maxR = 100;
    
    // Angles for Affordability, Space, Speed, A0Rating, Customizability
    const angles = [
      -Math.PI / 2, // Up (Affordability)
      -Math.PI / 2 + (2 * Math.PI) / 5, // Right-up (Space)
      -Math.PI / 2 + (4 * Math.PI) / 5, // Right-down (Speed)
      -Math.PI / 2 + (6 * Math.PI) / 5, // Left-down (A0Rating)
      -Math.PI / 2 + (8 * Math.PI) / 5, // Left-up (Customizability)
    ];

    const keys = ["affordability", "space", "speed", "A0Rating", "customizability"];
    return angles.map((angle, idx) => {
      const val = radar[keys[idx]];
      const r = (val / 100) * maxR;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });
  }, [radar]);

  const radarPointsString = useMemo(() => {
    return radarCoordinates.map(c => `${c.x},${c.y}`).join(" ");
  }, [radarCoordinates]);

  // ── DECK ACTIONS ───────────────────────────────────────────────────
  const handleSwipe = (direction, card) => {
    if (direction === "right") {
      setStyleScores(prev => {
        const next = { ...prev };
        Object.keys(card.effects).forEach(key => {
          next[key] = (next[key] || 0) + card.effects[key];
        });
        return next;
      });
    }
    setCurrentSwipeIndex(prev => prev + 1);
  };

  // ── GEMINI LLM DEEP RECOMMENDATION ENGINE ──────────────────────────
  const handleGetRecommendations = async () => {
    setIsAnalyzing(true);
    setRecommendations(null);

    try {
      const prompt = `Si AI architekt a konzultant Kexo pre American Living.
Uplatni nasledujúce interné know-how o výrobcoch a financovaní na vytvorenie excelentnej a úprimnej analýzy pre klienta.

KLIENTSKÝ PROFIL A PREFERENCIE:
- Celkový rozpočet klienta: ${preferences.budget} € (zahŕňa všetko - pozemok nie, ale stavbu áno)
- Požadovaný počet izieb: ${preferences.rooms}
- Región výstavby: ${preferences.region || 'Nešpecifikovaný'}
- Iné špecifické potreby: ${preferences.otherNeeds || 'Žiadne'}
- Váhy priorít (0-100): Cenová dostupnosť: ${radar.affordability}, Úžitková plocha: ${radar.space}, Rýchlosť výstavby: ${radar.speed}, Energetický štandard A0: ${radar.A0Rating}, Prispôsobivosť projektu: ${radar.customizability}
- Estetický profil zo swipovania (skóre): Drevený obklad: ${styleScores.woodCladding}, Plochá strecha/Minimalizmus: ${styleScores.flatMinimalism}, Tradičný štýl: ${styleScores.traditional}, Veľké okná: ${styleScores.largeGlazing}, Potreba hypotéky: ${styleScores.mortgageNeed}

VÝROBCIA - KĽÚČOVÉ INTERNÉ KNOW-HOW:
1. 🏭 TICAB HOUSE (Modulárna technológia):
   - Výhody: Extrémne rýchla výroba vo fabrike (6 týždňov), dovoz hotových modulov na pozemok, žeriav ich osadí za 1 deň. KVH drevená konštrukcia, kompletné rozvody, podlahy, kúpeľňa so sanitou v cene.
   - Nevýhody a skryté náklady: Doprava (dovoz modulov) a žeriav na pozemku nie sú zahrnuté a nacenia sa individuálne. Výroba nepokrýva základy a A0 energetický certifikát.
   - Financovanie: Ak klient potrebuje hypotéku, banka NEZALOŽÍ mobilný dom na pätkách/pilótach. Vyžaduje sa upgrade na rodinný dom (založený na pásových základoch, s projektom pre stavebné povolenie a s A0 balíkom). Tento upgrade pre Ticab domy stojí približne +15k až 25k € (obsahuje dodatočnú izoláciu 250mm, tepelné čerpadlo, rekuperáciu a projektovú dokumentáciu).

2. 🏗️ PROSTO HOUSE (Prefabrikované panely):
   - Výhody: DOPRAVA ZADARMO po celom Slovensku! Veľmi flexibilná montáž (možná aj svojpomocne). Konštrukcia má vynikajúcu stabilitu.
   - Nevýhody a skryté náklady: Hrubá stavba obsahuje steny, okná, dvere, fasádu a strechu. Nezahŕňa však základy, dokončenie interiéru (sadrokartóny/drevo, podlahy, sanitu) a technológie (kúrenie, vodu, elektro).
   - Orientačné ceny naviac pre kľúč-verziu: Montáž výrobcom ~13k €, základy (doska) ~8-18k €, dokončenie interiéru a sanity ~12-20k €, technológie a rozvody ~10k €.
   - Prispôsobivosť: Extrémne vysoká! Aj keď klientovi nevyhovuje základný katalógový vzhľad, Prosto House vie upraviť sklon strechy, zmeniť priečky, alebo namiesto omietky použiť severský smrekový obklad. Povedz klientovi, že vieme postaviť a prispôsobiť akýkoľvek dizajn, bez ohľadu na obmedzenia katalógu!

3. 🏔️ DOMKI Z GÓR (Tradičné zrubové a stĺpikové drevodomy):
   - Výhody: Poctivé tesárske remeslo, masívne ekologické drevo, vysoká odolnosť voči snehu a nepriaznivému počasiu (ideálne pre horské oblasti ako Tatry, Liptov). MONTÁŽ NA POZEMKU JE V CENE DOMU!
   - Nevýhody a skryté náklady: Doprava z Poľska nie je v cene (orientačne 8-10k €). Vyžaduje sa realizácia základovej dosky a vnútorných technológií.
   - Prispôsobivosť: Veľmi vysoká, ich tesári dokážu upraviť projekt podľa individuálnych predstáv klienta.

DATABÁZA DOMOV (Vyberaj výhradne odtiaľto):
${JSON.stringify(publicHouses.map(h => ({
  id: h.id,
  nazov: h.nazov,
  vyrobca: h.vyrobca,
  typ_domu: h.typ_domu,
  kategoria: h.kategoria,
  pocet_izieb: h.pocet_izieb,
  zastavana_plocha: h.zastavana_plocha,
  uzitkova_plocha: h.uzitkova_plocha,
  zakladna_cena: h.zakladna_cena,
  celorocny: h.celorocny
})), null, 2)}

ÚLOHA PRE TEBA:
1. Vyber 3 najlepšie domy z databázy, ktoré najviac zodpovedajú profilu a rozpočtu.
2. Ak klient zaškrtol alebo má skóre pre financovanie hypotékou (mortgageNeed > 20), odporuč výhradne domy z kategórie "rodinne_domy" alebo "montovane_domy". Upozorni ho, že mobilné domy (kategoria="mobilne_domy") na zemných skrutkách/pätkách bez pevného spojenia so zemou banky nezafinancujú a odporuč prechod na trvalé základy + A0 certifikát.
3. Výpočet ceny na kľúč: Urob odhad reálnej ceny na kľúč pre každý z 3 odporúčaných domov (započítaj základy, montáž, dopravu, prípadný A0 energetický balík a dokončenie interiéru). Uveď tieto položky transparentne.
4. Zdôrazni flexibilitu dizajnu: Pripomeň klientovi, že hoci vyberáme z katalógových modelov, sme schopní prispôsobiť akýkoľvek dom (zmeniť fasádu na drevo, zmeniť sklon strechy, posunúť priečky) nezávisle od predvoleného dizajnu v katalógu, aby sme splnili jeho estetické preferencie.
5. Výstup naformátuj ako platný JSON podľa schémy:
{
  "recommendations": [
    {
      "house_id": "ID domu z databázy",
      "house_nazov": "Presný názov domu",
      "match_score": 95,
      "why_suitable": "Stručné zdôvodnenie, prečo tento model pasuje k profilu",
      "pros": ["Výhoda 1", "Výhoda 2"],
      "considerations": ["Skrytý náklad 1 (napr. doprava, montáž, základy)", "Legislatívne obmedzenie / hypotekárna podmienka"],
      "estimated_total_cost": 135000
    }
  ],
  "summary": "Podrobný a pútavý Kexo AI komentár. Zhrň tu estetické a technické zladenie, odporuč konkrétneho výrobcu na základe jeho know-how, popíš ako vyriešiť financovanie hypotékou, a zdôrazni možnosť postaviť takmer akýkoľvek individuálny dizajn bez obmedzení katalógu."
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  house_id: { type: "string" },
                  house_nazov: { type: "string" },
                  match_score: { type: "number" },
                  why_suitable: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  considerations: { type: "array", items: { type: "string" } },
                  estimated_total_cost: { type: "number" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      // Validation
      const validated = {
        ...result,
        recommendations: result.recommendations?.filter(rec => {
          let house = publicHouses.find(h => h.id === rec.house_id);
          if (!house && rec.house_nazov) {
            house = publicHouses.find(h => h.nazov?.toLowerCase() === rec.house_nazov?.toLowerCase());
          }
          if (!house) return false;
          rec.house_id = house.id;
          return true;
        }) || []
      };

      setRecommendations(validated);
    } catch (error) {
      console.error("Chyba pri generovaní AI odporúčaní:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHouseById = (id) => publicHouses.find(h => h.id === id);

  const handleKatalogSearch = () => {
    navigate(createPageUrl("Katalog"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <section className="relative bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white py-16 rounded-3xl overflow-hidden mb-12 shadow-xl border border-white/5">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-[#C5A880]/90 text-white px-5 py-1.5 rounded-full mb-5 text-sm shadow-[0_0_15px_rgba(197,168,128,0.3)]">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-xs">AI Architect Space</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Váš perfektný domov na pár klikov.
              </h1>
              <p className="text-base md:text-lg text-slate-350 leading-relaxed">
                Prejdite si estetickým filtrom, nastavte svoje priority na radare a nechajte náš inteligentný match engine nájsť ideálny domov.
              </p>
            </motion.div>
          </div>
        </section>

        {/* MAIN FUTURISTIC INTERFACE */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: RADAR, LIFESTYLE & TINDER DECK (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tinder-style Taste Profiler */}
            <Card className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-xl rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Estetický profil dizajnu</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Swipnite alebo označte prvky, ktoré sa vám páčia.</p>
                </div>
                <div className="text-xs font-black bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20">
                  {Math.min(currentSwipeIndex + 1, tinderCards.length)} / {tinderCards.length}
                </div>
              </div>

              {/* Swiper Arena */}
              <div className="relative h-[280px] sm:h-[320px] w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentSwipeIndex < tinderCards.length ? (
                    <motion.div
                      key={tinderCards[currentSwipeIndex].id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0, x: 200 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute w-full max-w-[420px] h-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
                    >
                      <div className="relative flex-1 bg-slate-950">
                        <img 
                          src={tinderCards[currentSwipeIndex].img} 
                          alt={tinderCards[currentSwipeIndex].title} 
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="font-black text-lg sm:text-xl drop-shadow-md">{tinderCards[currentSwipeIndex].title}</h3>
                          <p className="text-xs text-slate-200 drop-shadow mt-1 leading-relaxed">{tinderCards[currentSwipeIndex].desc}</p>
                        </div>
                      </div>
                      
                      {/* Swipe Controls */}
                      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 flex items-center justify-around">
                        <button
                          onClick={() => handleSwipe("left", tinderCards[currentSwipeIndex])}
                          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl font-bold transition-all border border-slate-200 dark:border-white/5 text-sm active:scale-95"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>Nepáči sa</span>
                        </button>
                        <button
                          onClick={() => handleSwipe("right", tinderCards[currentSwipeIndex])}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 text-sm active:scale-95"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Páči sa mi</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl max-w-[420px]"
                    >
                      <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Estetický profil vygenerovaný!</h3>
                      <p className="text-xs text-slate-650 dark:text-slate-400 mt-1 leading-relaxed">
                        AI prispôsobilo indexy zhody všetkým domom v reálnom čase na základe vášho štýlového profilu.
                      </p>
                      <button
                        onClick={() => {
                          setCurrentSwipeIndex(0);
                          setStyleScores({
                            woodCladding: 0,
                            flatMinimalism: 0,
                            traditional: 0,
                            largeGlazing: 0,
                            mortgageNeed: 0,
                            A0Rating: 0
                          });
                        }}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Prehodnotiť vkus</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Cognitive Radar Chart & Glowing Sliders */}
            <Card className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-xl rounded-3xl relative overflow-hidden">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Radar vašich priorít bývania</h2>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Visual SVG Radar */}
                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                  <svg viewBox="0 0 300 300" className="w-full max-w-[240px] aspect-square filter drop-shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    {/* Concentric grid rings */}
                    <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="75" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="50" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="25" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
                    
                    {/* pentagon axes */}
                    {radarCoordinates.map((c, i) => (
                      <line key={i} x1="150" y1="150" x2={150 + 100 * Math.cos(-Math.PI / 2 + (2 * Math.PI * i) / 5)} y2={150 + 100 * Math.sin(-Math.PI / 2 + (2 * Math.PI * i) / 5)} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
                    ))}

                    {/* Active values Polygon */}
                    <polygon points={radarPointsString} fill="rgba(220, 38, 38, 0.15)" stroke="rgb(220, 38, 38)" strokeWidth="2.5" />
                    
                    {/* Glowing coordinate vertices */}
                    {radarCoordinates.map((c, i) => (
                      <circle key={i} cx={c.x} cy={c.y} r="5" fill="rgb(220, 38, 38)" className="animate-pulse" />
                    ))}
                    
                    {/* Labels */}
                    <text x="150" y="36" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Dostupnosť</text>
                    <text x="268" y="125" textAnchor="start" fill="#94a3b8" fontSize="10" fontWeight="bold">Priestor</text>
                    <text x="215" y="260" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Rýchlosť</text>
                    <text x="85" y="260" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">A0 Ekológia</text>
                    <text x="32" y="125" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold">Úpravy</text>
                  </svg>
                </div>

                {/* Slider Inputs */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Cenová dostupnosť: {radar.affordability}%
                    </Label>
                    <Slider
                      min={10}
                      max={100}
                      value={[radar.affordability]}
                      onValueChange={([val]) => setRadar({...radar, affordability: val})}
                      className="accent-red-500"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Úžitková plocha: {radar.space}%
                    </Label>
                    <Slider
                      min={10}
                      max={100}
                      value={[radar.space]}
                      onValueChange={([val]) => setRadar({...radar, space: val})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Rýchlosť výstavby: {radar.speed}%
                    </Label>
                    <Slider
                      min={10}
                      max={100}
                      value={[radar.speed]}
                      onValueChange={([val]) => setRadar({...radar, speed: val})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Energetická ekologickosť: {radar.A0Rating}%
                    </Label>
                    <Slider
                      min={10}
                      max={100}
                      value={[radar.A0Rating]}
                      onValueChange={([val]) => setRadar({...radar, A0Rating: val})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Variabilita konfigurácie: {radar.customizability}%
                    </Label>
                    <Slider
                      min={10}
                      max={100}
                      value={[radar.customizability]}
                      onValueChange={([val]) => setRadar({...radar, customizability: val})}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Lifestyle Sliders & Budget */}
            <Card className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-xl rounded-3xl relative overflow-hidden">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Lifestyle preferencie</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                      Celkový finančný limit pre dom
                    </Label>
                    <span className="text-base font-black text-red-600 dark:text-red-400">
                      {preferences.budget.toLocaleString('sk-SK')} €
                    </span>
                  </div>
                  <Slider
                    min={35000}
                    max={250000}
                    step={5000}
                    value={[preferences.budget]}
                    onValueChange={([val]) => setPreferences({...preferences, budget: val})}
                    className="mt-2"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed block mt-1">
                    Upozornenie: AI prepočíta odhadovanú cenu komplet na kľúč vrátane základov a montáže.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                      Požadovaný počet izieb
                    </Label>
                    <span className="text-base font-black text-red-600 dark:text-red-400">
                      {preferences.rooms}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={6}
                    step={1}
                    value={[preferences.rooms]}
                    onValueChange={([val]) => setPreferences({...preferences, rooms: val})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-350 mb-2 block">
                    🌍 Región / Lokalita výstavby
                  </Label>
                  <input
                    type="text"
                    placeholder="napr. Tatry, Bratislava, Košice..."
                    value={preferences.region}
                    onChange={(e) => setPreferences({...preferences, region: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* AI Action Submit Button */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGetRecommendations}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black py-7 text-lg shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 transition-all hover:-translate-y-0.5 rounded-2xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Kexo analyzuje kompletnú databázu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Vygenerovať hĺbkový AI rozbor od Kexa
                  </>
                )}
              </Button>
              <button
                onClick={handleKatalogSearch}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1 mt-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Prejsť priamo do kompletného katalógu</span>
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: FLUID BUBBLE CANVAS & DETAILED LOOKBOOK (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Live Kexo AI Comment box */}
            <Card className="p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/20 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0 animate-bounce">
                  K
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Live Kexo Asistent</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {kexoLiveComment}
                  </p>
                </div>
              </div>
            </Card>

            {/* Fluid Gravity Bubbles Arena */}
            <Card className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-xl rounded-3xl">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Gravitačné plátno (Match index)</h3>
              
              <div className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl p-4 min-h-[220px] flex flex-wrap gap-2 items-center justify-center content-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03),transparent)] pointer-events-none"></div>
                
                <AnimatePresence>
                  {calculatedMatchScores.slice(0, 10).map((house, idx) => {
                    const isTop1 = idx === 0;
                    const isSelected = activeHouseId === house.id || (isTop1 && !activeHouseId);
                    
                    return (
                      <motion.button
                        key={house.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={() => setActiveHouseId(house.id)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 text-xs font-black select-none ${
                          isSelected 
                            ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-500/30 scale-105 z-10' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-350 dark:hover:border-white/20'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-red-500'}`} />
                        <span>{house.nazov?.split(",")[0]?.split("(")[0]}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-950 text-red-500 font-bold'}`}>
                          {house.matchScore}%
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </Card>

            {/* Detailed Lookbook Panel for selected Bubble */}
            <AnimatePresence mode="wait">
              {calculatedMatchScores.length > 0 && (
                <motion.div
                  key={activeHouseId || topRecommendedHouse?.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const house = getHouseById(activeHouseId || topRecommendedHouse?.id);
                    const matchData = calculatedMatchScores.find(h => h.id === house?.id);
                    if (!house || !matchData) return null;

                    return (
                      <Card className="overflow-hidden border-slate-200 dark:border-white/10 shadow-2xl rounded-3xl bg-white dark:bg-slate-900">
                        {/* House main photo */}
                        <div className="relative h-56 bg-slate-950">
                          {house.hlavny_obrazok ? (
                            <ImageWithWatermark
                              src={house.hlavny_obrazok}
                              alt={house.nazov}
                              className="w-full h-full object-cover"
                              useCatalogSetting={true}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <Home className="w-16 h-16 text-slate-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                          
                          {/* Match score bubble top-right */}
                          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl flex items-center gap-1.5 border border-red-500/20">
                            <Heart className="w-4 h-4 fill-current text-white" />
                            <span>{matchData.matchScore}% Zhoda</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{house.nazov}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Výrobca: <span className="font-bold text-slate-800 dark:text-slate-200">{house.vyrobca}</span> • Kategória: <span className="font-bold text-slate-800 dark:text-slate-200">{house.kategoria === 'mobilne_domy' ? 'Mobilný dom' : house.kategoria === 'rodinne_domy' ? 'Rodinný dom' : 'Montovaný dom'}</span>
                            </p>
                          </div>

                          {/* Technical details grid */}
                          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-xs">
                            <div>
                              <p className="text-slate-500 font-semibold mb-0.5">Základná cena bez DPH</p>
                              <p className="text-sm font-black text-slate-800 dark:text-white">{house.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                            </div>
                            <div>
                              <p className="text-slate-500 font-semibold mb-0.5">Odhad na kľúč (so základmi)</p>
                              <p className="text-sm font-black text-red-600 dark:text-red-400">{matchData.estimatedTotal?.toLocaleString('sk-SK')} €</p>
                            </div>
                            <div className="col-span-2 border-t border-slate-200 dark:border-white/5 pt-2 mt-2 flex justify-between">
                              <div>
                                <p className="text-slate-500 font-semibold mb-0.5">Počet izieb</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white">max. {house.pocet_izieb}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-500 font-semibold mb-0.5">Úžitková plocha</p>
                                <p className="text-sm font-black text-slate-800 dark:text-white">{house.uzitkova_plocha || house.zastavana_plocha} m²</p>
                              </div>
                            </div>
                          </div>

                          {/* Matching logic highlights */}
                          {matchData.reasons.length > 0 && (
                            <div className="space-y-1 text-xs">
                              {matchData.reasons.map((r, i) => (
                                <p key={i} className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5 bg-orange-500/5 px-3 py-2 rounded-xl border border-orange-500/10">
                                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>{r}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link to={`${createPageUrl("DetailDomu")}?id=${house.id}`} className="w-full">
                              <Button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black py-5 text-xs rounded-xl transition-all">
                                Pozrieť detail
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                              </Button>
                            </Link>
                            <Link to={`/Kalkulacka?dom_id=${house.id}`} className="w-full">
                              <Button variant="outline" className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black py-5 text-xs rounded-xl transition-all">
                                Spustiť kalkulátor
                              </Button>
                            </Link>
                          </div>

                        </div>
                      </Card>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* GEMINI LLM DEEP ANALYSIS RESPONSE IF GENERATED */}
        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-12 space-y-8"
            >
              {/* Summary card */}
              <Card className="p-8 bg-gradient-to-br from-red-950 via-slate-900 to-red-950 border border-red-500/20 rounded-3xl shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-7 h-7 text-[#C5A880]" />
                  <h2 className="text-2xl font-black tracking-tight">Detailný AI rozbor od Kexa</h2>
                </div>
                <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
                  {recommendations.summary}
                </p>
              </Card>

              {/* Recommended houses breakdown */}
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.recommendations?.map((rec, index) => {
                  const house = getHouseById(rec.house_id);
                  if (!house) return null;

                  return (
                    <Card key={house.id} className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                      <div className="relative h-44 bg-slate-950">
                        {house.hlavny_obrazok ? (
                          <ImageWithWatermark
                            src={house.hlavny_obrazok}
                            alt={house.nazov}
                            className="w-full h-full object-cover"
                            useCatalogSetting={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <Home className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                          {index + 1}
                        </div>
                        {/* Match score percentage */}
                        <div className="absolute top-3 right-3 bg-slate-950/80 text-red-400 px-3 py-1 rounded-xl font-black text-xs border border-red-500/30">
                          {rec.match_score}% Zhoda
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{house.nazov}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">{house.vyrobca}</p>
                          </div>
                          
                          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium bg-slate-100 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                            {rec.why_suitable}
                          </p>

                          {/* Advantages */}
                          {rec.pros?.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-black text-emerald-650 dark:text-emerald-400 mb-1">Kľúčové výhody:</p>
                              {rec.pros.map((p, idx) => (
                                <p key={idx} className="text-slate-650 dark:text-slate-300 leading-normal flex items-start gap-1">
                                  <span className="text-emerald-500 font-bold">✓</span>
                                  <span>{p}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Considerations */}
                          {rec.considerations?.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-black text-orange-600 dark:text-orange-400 mb-1">Na čo pamätať:</p>
                              {rec.considerations.map((c, idx) => (
                                <p key={idx} className="text-slate-650 dark:text-slate-300 leading-normal flex items-start gap-1">
                                  <span className="text-orange-500 font-bold">•</span>
                                  <span>{c}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Estimated total card & CTAs */}
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5 mt-auto">
                          {rec.estimated_total_cost && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Odhadovaná cena na kľúč</span>
                              <span className="font-black text-sm text-red-600 dark:text-red-400">{rec.estimated_total_cost.toLocaleString('sk-SK')} €</span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <Link to={`${createPageUrl("DetailDomu")}?id=${house.id}`}>
                              <Button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black py-4 text-[10px] rounded-lg">
                                Pozrieť dom
                              </Button>
                            </Link>
                            <Link to={`/Kalkulacka?dom_id=${house.id}`}>
                              <Button variant="outline" className="w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black py-4 text-[10px] rounded-lg">
                                Kalkulovať
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Reset button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setRecommendations(null)}
                  className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold px-8 py-5 rounded-xl transition-all"
                >
                  Spustiť novú AI analýzu
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}