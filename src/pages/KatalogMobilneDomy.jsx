import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Star, Clock, MapPin, Truck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithWatermark from "../components/ImageWithWatermark";


const localT = {
  "sk": {
    "metaTitle": "Celoročné mobilné domy | Ceny, výhody a katalóg | American Living",
    "metaDesc": "Katalóg luxusných celoročných mobilných domov. Rýchle dodanie, plnohodnotné zateplenie, dodanie na kľúč. Zistite ceny a prezrite si najlepšie modely.",
    "badge": "Najväčší trend tohto roka",
    "h1Title": "Mobilné Domy",
    "h1Desc": "Plnohodnotné, zateplené a luxusne vybavené bývanie, ktoré vám dovezieme kompletne hotové priamo na pozemok. Žiadne stavebné povolenia plné byrokracie, len okamžité nasťahovanie.",
    "showModels": "Prezrieť najlepšie modely",
    "card1Title": "Dovezieme hotové",
    "card1Desc": "Dom príde hotový na kamióne. Žiadny neporiadok zo stavby na vašom pozemku, stačí len napojiť siete.",
    "card2Title": "Sloboda presunu",
    "card2Desc": "Váš dom nie je pevne spojený so zemou. Ak sa o 5 rokov rozhodnete zmeniť lokalitu, dom môže cestovať s vami.",
    "card3Title": "Zimné zateplenie",
    "card3Desc": "Používame pokročilé izolačné panely a PUR penu, vďaka čomu naše domy pohodlne zvládnu aj kruté zimy.",
    "h2Title": "Mobilné Domy",
    "h2Desc": "Tieto modely sú u našich zákazníkov najžiadanejšie pre celoročné bývanie aj víkendový oddych.",
    "area": "Plocha",
    "priceFrom": "Cena od",
    "viewAllButton": "Zobraziť všetky mobilné domy",
    "mythTitle": "Mobilné bývanie nie sú len staré karavany",
    "mythDesc": "Pri slove \"mobilný dom\" si mnohí predstavia tenké plechové domčeky z bazáru, ktoré v lete pripomínajú saunu a v zime mrazničku. Dnešné celoročné mobilné domy sú však konštrukčne, dizajnovo a najmä tepelne na úplne inej úrovni.",
    "differenceTitle": "Rozdiel medzi víkendovým a celoročným mobilným domom",
    "weekend": "Víkendové / Sezónne",
    "weekendDesc": "Lacnejšie varianty, ktoré majú tenšiu vrstvu izolácie (zvyčajne do 10 cm). Sú ideálne ako záhradné chatky, kde sa nezdržiavate počas najväčších mrazov.",
    "yearRound": "Celoročné zateplené",
    "yearRoundDesc": "Mohutnejšia konštrukcia (často oceľová klietka alebo silný drevený rám), izolačná vrstva od 15-20 cm vyššie, 3-sklá, kvalitné podlahové kúrenie. Zaručujú absolútny komfort 365 dní v roku.",
    "faqTitle": "Časté otázky o mobilných domoch (FAQ)"
  },
  "en": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "de": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "fr": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "hu": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "pl": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "uk": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "sr": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "hr": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  },
  "el": {
    "metaTitle": "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    "metaDesc": "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    "badge": "Biggest trend of this year",
    "h1Title": "Mobile Homes",
    "h1Desc": "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    "showModels": "View best models",
    "card1Title": "Delivered ready",
    "card1Desc": "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    "card2Title": "Mobility",
    "card2Desc": "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    "card3Title": "Winter insulation",
    "card3Desc": "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    "h2Title": "Mobile Homes",
    "h2Desc": "These models are most requested by our customers for year-round living and weekend relaxation.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all mobile homes",
    "mythTitle": "Mobile living is not just old caravans",
    "mythDesc": "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    "differenceTitle": "Difference between weekend and year-round mobile home",
    "weekend": "Weekend / Seasonal",
    "weekendDesc": "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    "yearRound": "Year-round insulated",
    "yearRoundDesc": "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    "faqTitle": "Frequently Asked Questions about Mobile Homes (FAQ)"
  }
};

export default function KatalogMobilneDomy() {
  const { t, language } = useLanguage();
  const mt = localT[language] || localT.sk;
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
    <div className="min-h-screen bg-background font-['Outfit'] text-foreground overflow-hidden transition-colors duration-300">
      <Helmet>
        <title>{mt.metaTitle}</title>
        <meta name="description" content={mt.metaDesc} />
        <meta property="og:title" content="Celoročné mobilné domy a bývanie bez starostí | American Living" />
        <meta property="og:description" content="Dodáme vám hotový zateplený mobilný dom priamo na pozemok. Vhodné na celoročné bývanie." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("KatalogMobilneDomy")}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/40 to-background z-10" />
          <img 
            src="https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/e6f77ccb-c5e7-49f9-bcff-183e20e8b284.webp" 
            alt="Zateplený mobilný dom v prírode" 
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        <div className="container mx-auto relative z-20 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold mb-6">
              <Star className="w-4 h-4" /> {mt.badge}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Celoročné <span className="text-emerald-500">{mt.h1Title}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              {mt.h1Desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to="#nasa-ponuka">{mt.showModels}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-16 bg-card border border-border border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card1Title}</h3>
              <p className="text-muted-foreground">{mt.card1Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card2Title}</h3>
              <p className="text-muted-foreground">{mt.card2Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card3Title}</h3>
              <p className="text-muted-foreground">{mt.card3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Houses */}
      <section id="nasa-ponuka" className="py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Najobľúbenejšie <span className="text-emerald-500">{mt.h2Title}</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{mt.h2Desc}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topHouses?.map((dom) => (
                <Card key={dom.id} className="bg-card border-border overflow-hidden group hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col">
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
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{dom.popis}</p>
                    <div className="mt-auto grid grid-cols-2 gap-4 text-sm font-semibold border-t border-border pt-4">
                      <div>
                        <p className="text-slate-500 text-xs">{mt.area}</p>
                        <p className="text-foreground">{dom.zastavana_plocha} m²</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">{mt.priceFrom}</p>
                        <p className="text-emerald-400">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full" asChild>
              <Link to={`${createPageUrl("Katalog")}?typ=mobilny`}>
                {mt.viewAllButton} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Rich Text Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose dark:prose-invert prose-lg max-w-none prose-a:text-emerald-400">
            <h2 className="text-3xl font-bold text-foreground mb-6">{mt.mythTitle}</h2>
            <p>
              {mt.mythDesc}
            </p>
            
            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">{mt.differenceTitle}</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h4 className="text-muted-foreground font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {mt.weekend}</h4>
                <p className="text-sm text-muted-foreground">
                  {mt.weekendDesc}
                </p>
              </div>
              <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20">
                <h4 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {mt.yearRound}</h4>
                <p className="text-sm text-muted-foreground">
                  {mt.yearRoundDesc}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">{mt.faqTitle}</h3>
            <div className="space-y-6">
              {schemaData.mainEntity.map((faq, i) => (
                <div key={i} className="bg-card p-6 rounded-xl border border-border">
                  <h4 className="text-lg font-bold text-foreground mb-2">{faq.name}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}