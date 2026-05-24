import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ArrowRight, Star, Clock, Euro, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithWatermark from "../components/ImageWithWatermark";


const localT = {
  "sk": {
    "metaTitle": "Montované domy na kľúč s cenou | Drevodomy A0 | American Living",
    "metaDesc": "Katalóg nízkoenergetických montovaných domov a drevostavieb na kľúč. Najrýchlejšia výstavba, pevná cena, A0 certifikát a špičkový dizajn. Pozrite si našu ponuku.",
    "badge": "Najlepšia voľba pre rok 2025",
    "h1Title": "Montované Domy",
    "h1Desc": "Zabudnite na roky plné stresu pri stavaní. Nízkoenergetické drevodomy a montované stavby vám dodáme bleskovo, s garanciou pevnej ceny a v prísnom energetickom štandarde A0.",
    "showModels": "Pozrieť najlepšie domy",
    "viewAllButton": "Zobraziť kompletný katalóg",
    "card1Title": "Blesková rýchlosť",
    "card1Desc": "Výroba v hale nie je závislá na počasí. Na pozemku staviame v priebehu pár dní, bývať môžete do 3-4 mesiacov.",
    "card2Title": "Pevná a garantovaná cena",
    "card2Desc": "Vďaka presnej prefabrikácii nehrozia žiadne \"nepredvídané\" stavebné náklady. Čo je v zmluve, to platí.",
    "card3Title": "Energetický štandard A0",
    "card3Desc": "Drevostavby s dokonalou tepelnou izoláciou, rekuperáciou a úspornými technológiami pre zdravý a lacný život.",
    "h2Title": "Montované Domy",
    "h2Desc": "Vybrali sme pre vás tie najvyhľadávanejšie projekty s najlepším pomerom ceny a kvality pre slovenský trh.",
    "area": "Plocha",
    "priceFrom": "Cena od",
    "whyTrendTitle": "Prečo sú moderné montované domy trendom budúcnosti?",
    "whyTrendDesc": "Výraz \"montovaný dom\" už dávno neznamená tenkú stenu a letnú chatku. V roku 2025 ide o špičkové, inžiniersky prepracované drevostavby a oceľové konštrukcie, ktoré hrúbkou izolácie a energetickou úspornosťou často prekonávajú klasické tehlové domy.",
    "advantagesTitle": "Výhody a nevýhody montovaných domov",
    "advantagesHeader": "Hlavné Výhody",
    "advantage1": "Hrubá stavba hotová za pár dní (tzv. suchá výstavba bez potreby zrenia).",
    "advantage2": "Viac úžitkovej plochy pri rovnakej zastavanej ploche (steny drevodomov sú tenšie, ale lepšie izolujú).",
    "advantage3": "Ekologické a udržateľné materiály pre zdravé bývanie.",
    "disadvantagesHeader": "Na čo si dať pozor",
    "disadvantage1": "Menšia tepelná akumulácia (dom sa rýchlejšie vykúri, ale po vypnutí kúrenia skôr vychladne, čo riešime špičkovou izoláciou).",
    "disadvantage2": "Horšia zvuková izolácia pri nesprávnom návrhu (my však používame hrubé sendvičové panely s akustickými doskami).",
    "faqTitle": "Časté otázky (FAQ)"
  },
  "en": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "de": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "fr": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "hu": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "pl": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "uk": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "sr": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "hr": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "el": {
    "metaTitle": "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    "metaDesc": "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    "badge": "Best choice for 2025",
    "h1Title": "Prefabricated Homes",
    "h1Desc": "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    "showModels": "View best houses",
    "viewAllButton": "View complete catalog",
    "card1Title": "Lightning speed",
    "card1Desc": "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    "card2Title": "Fixed and guaranteed price",
    "card2Desc": "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    "card3Title": "Energy standard A0",
    "card3Desc": "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    "h2Title": "Prefabricated Homes",
    "h2Desc": "We have selected the most sought-after projects with the best price-quality ratio for you.",
    "area": "Area",
    "priceFrom": "Price from",
    "whyTrendTitle": "Why are modern prefab homes the trend of the future?",
    "whyTrendDesc": "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    "advantagesTitle": "Advantages and disadvantages of prefab homes",
    "advantagesHeader": "Key Advantages",
    "advantage1": "Shell structure finished in a few days (dry construction without curing time).",
    "advantage2": "More usable area for the same built-up area (walls are thinner but insulate better).",
    "advantage3": "Ecological and sustainable materials for healthy living.",
    "disadvantagesHeader": "What to watch out for",
    "disadvantage1": "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    "disadvantage2": "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  }
};

export default function KatalogMontovaneDomy() {
  const { t, language } = useLanguage();
  const mt = localT[language] || localT.sk;
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
    <div className="min-h-screen bg-background font-['Outfit'] text-foreground overflow-hidden transition-colors duration-300">
      <Helmet>
        <title>{mt.metaTitle}</title>
        <meta name="description" content={mt.metaDesc} />
        <meta property="og:title" content="Montované domy na kľúč s cenou | American Living" />
        <meta property="og:description" content="Moderné drevodomy a nízkoenergetické stavby od profíkov. Štandard A0." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("KatalogMontovaneDomy")}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/40 to-background z-10" />
          <img 
            src="https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/07d853b0-6815-4fa8-b21a-e6a2eb68095d.webp" 
            alt="Montovaný dom na kľúč od American Living" 
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        <div className="container mx-auto relative z-20 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold mb-6">
              <Star className="w-4 h-4" /> {mt.badge}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Moderné <span className="text-red-500">{mt.h1Title}</span> na kľúč
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              {mt.h1Desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to="#nasa-ponuka">{mt.showModels}</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to={createPageUrl("Katalog")}>{mt.viewAllButton}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-16 bg-card border border-border border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card1Title}</h3>
              <p className="text-muted-foreground">{mt.card1Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Euro className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card2Title}</h3>
              <p className="text-muted-foreground">{mt.card2Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                <ShieldCheck className="w-8 h-8" />
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Najobľúbenejšie <span className="text-red-500">{mt.h2Title}</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{mt.h2Desc}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topHouses?.map((dom) => (
                <Card key={dom.id} className="bg-card border-border overflow-hidden group hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col">
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
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{dom.popis}</p>
                    <div className="mt-auto grid grid-cols-2 gap-4 text-sm font-semibold border-t border-border pt-4">
                      <div>
                        <p className="text-slate-500 text-xs">{mt.area}</p>
                        <p className="text-foreground">{dom.zastavana_plocha} m²</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">{mt.priceFrom}</p>
                        <p className="text-red-400">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full" asChild>
              <Link to={`${createPageUrl("Katalog")}?typ=montovany`}>
                {mt.viewAllButton} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Rich Text Section (Information Gain) */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none prose-a:text-red-400">
            <h2 className="text-3xl font-bold text-white mb-6">{mt.whyTrendTitle}</h2>
            <p>
              {mt.whyTrendDesc}
            </p>
            
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">{mt.advantagesTitle}</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-emerald-950/30 p-6 rounded-xl border border-emerald-900/20">
                <h4 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {mt.advantagesHeader}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> {mt.advantage1}</li>
                  <li className="flex gap-2"><span>•</span> {mt.advantage2}</li>
                  <li className="flex gap-2"><span>•</span> {mt.advantage3}</li>
                </ul>
              </div>
              <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20">
                <h4 className="text-destructive font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> {mt.disadvantagesHeader}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> {mt.disadvantage1}</li>
                  <li className="flex gap-2"><span>•</span> {mt.disadvantage2}</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8 mb-4">{mt.faqTitle}</h3>
            <div className="space-y-6">
              {schemaData.mainEntity.map((faq, i) => (
                <div key={i} className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h4 className="text-lg font-bold text-white mb-2">{faq.name}</h4>
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