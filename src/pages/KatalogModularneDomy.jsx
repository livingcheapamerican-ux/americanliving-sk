import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Star, PlusSquare, Sparkles, Building2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithWatermark from "../components/ImageWithWatermark";


const localT = {
  "sk": {
    "metaTitle": "Modulové domy a Tiny House | Katalóg a ceny | American Living",
    "metaDesc": "Modulové domy na kľúč, ktoré rastú s vami. Zistite viac o rastúcich domoch a kategórii Tiny House. Pevné ceny, rýchle dodanie a špičková kvalita.",
    "badge": "Bývanie bez kompromisov",
    "h1Title": "Modulové Domy",
    "h1Desc": "Vyskladajte si bývanie ako z lega. Modulárne domy, ktoré sa dajú kedykoľvek zväčšiť, alebo obľúbené Tiny Houses bez zbytočnej byrokracie a s minimálnymi nákladmi na prevádzku.",
    "showModules": "Zobraziť najlepšie moduly",
    "card1Title": "Rastúce domy",
    "card1Desc": "Teraz vám stačia 2 moduly (50m2)? Výborne. Ak sa rodina rozrastie, o 3 roky jednoducho pripojíte tretí modul.",
    "card2Title": "3D Moduly z továrne",
    "card2Desc": "Modul príde z výrobnej haly kompletne hotový, často už aj s obkladmi, sanitou či nábytkom. Žiadny prach na pozemku.",
    "card3Title": "Fenomén Tiny House",
    "card3Desc": "Minimalizmus a sloboda. Malé domčeky (často do 25m2), ktoré nevyžadujú zložité stavebné povolenia a obrovskú hypotéku.",
    "h2Title": "Modulové Domy",
    "h2Desc": "Ideálne pre moderné bývanie bez dlhov, alebo pre startupy hľadajúce inovatívne firemné priestory.",
    "area": "Plocha",
    "priceFrom": "Cena od",
    "viewAllButton": "Pozrieť všetky modulové domy a Tiny house",
    "whyInvestTitle": "Prečo sa oplatí investovať do modulárneho bývania?",
    "whyInvestDesc": "Architektúra na Slovensku sa mení. Už nestaviame 3-poschodové vily pre generácie dopredu. Moderný človek chce bývať okamžite, bez dlhov a s možnosťou úprav. A práve na toto odpovedajú modulárne domy.",
    "mythsTitle": "Mýty a fakty o modulových domoch",
    "mythsWrong": "Čo si ľudia (mylne) myslia",
    "myth1": "\"Zle to izoluje.\" (Fakt: Modulárne domy majú rovnako hrubú izoláciu ako akýkoľvek iný montovaný dom v kategórii A0).",
    "myth2": "\"Je to len kontajner.\" (Fakt: Hoci majú tvar kvádra kvôli preprave, vnútri môžu skrývať luxusné materiály a smart domácnosť).",
    "realityTitle": "Aká je realita",
    "reality1": "Modulárna konštrukcia (najmä pri Tiny House) poskytuje absolútnu slobodu s minimálnymi poplatkami za réžiu a údržbu.",
    "reality2": "V prípade sťahovania si dom jednoducho zoberiete so sebou.",
    "faqTitle": "Časté otázky (FAQ)"
  },
  "en": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "de": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "fr": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "hu": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "pl": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "uk": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "sr": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "hr": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  },
  "el": {
    "metaTitle": "Modular Homes and Tiny House | Catalog and Prices | American Living",
    "metaDesc": "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    "badge": "Living without compromise",
    "h1Title": "Modular Homes",
    "h1Desc": "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    "showModules": "View best modules",
    "card1Title": "Growing houses",
    "card1Desc": "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    "card2Title": "3D Modules from the factory",
    "card2Desc": "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    "card3Title": "Tiny House Phenomenon",
    "card3Desc": "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    "h2Title": "Modular Homes",
    "h2Desc": "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    "area": "Area",
    "priceFrom": "Price from",
    "viewAllButton": "View all modular homes and Tiny houses",
    "whyInvestTitle": "Why is it worth investing in modular housing?",
    "whyInvestDesc": "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    "mythsTitle": "Myths and facts about modular homes",
    "mythsWrong": "What people (mistakenly) think",
    "myth1": "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    "myth2": "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    "realityTitle": "What is the reality",
    "reality1": "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    "reality2": "In case of moving, you simply take the house with you.",
    "faqTitle": "Frequently Asked Questions (FAQ)"
  }
};

export default function KatalogModularneDomy() {
  const { t, language } = useLanguage();
  const mt = localT[language] || localT.sk;
  const { data: topHouses, isLoading } = useQuery({
    queryKey: ['seo-houses', 'modularny'],
    queryFn: async () => {
      const results = await base44.entities.Dom.filter({ verejny: true, typ_domu: 'modularny' }, 'poradie', 6);
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
          "name": "Aký je rozdiel medzi modulovým domom a bežným montovaným domom?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Modulový dom (často nazývaný aj Tiny House v jeho menšej podobe) pozostáva z jedného alebo viacerých hotových 3D modulov (kociek). Zatiaľ čo montovaný dom sa skladá zo stien priamo na pozemku, modulový dom príde kompletne priestorovo poskladaný a hotový."
          }
        },
        {
          "@type": "Question",
          "name": "Dá sa modulárny dom neskôr zväčšiť?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Áno, to je jeho najväčšia výhoda! Väčšina našich modulárnych domov je navrhnutá tak, aby ste k nim mohli po rokoch pristaviť ďalší modul (napr. detskú izbu), keď sa vám rozrastie rodina."
          }
        },
        {
          "@type": "Question",
          "name": "Čo je to Tiny House a nepotrebujem na to stavebné povolenie?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tiny House je minimalistický dom s veľmi malou zastavanou plochou (zvyčajne do 25m2). Na Slovensku takéto drobné stavby bez pevných základov vo väčšine prípadov spadajú len pod ohlášku drobnej stavby, čím sa vyhnete dlhému čakaniu na stavebné povolenie."
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
        <meta property="og:title" content="Modulové domy a Tiny House | American Living" />
        <meta property="og:description" content="Katalóg modulových domov, ktoré si vyskladáte podľa seba. Vyskúšajte moderné modulárne bývanie." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("KatalogModularneDomy")}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/40 to-background z-10" />
          <img 
            src="https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/prosto-house-design.webp" 
            alt="Modulový dom na kľúč" 
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
        </div>

        <div className="container mx-auto relative z-20 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" /> {mt.badge}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Moderné <span className="text-blue-500">{mt.h1Title}</span> a Tiny House
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              {mt.h1Desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg rounded-xl w-full sm:w-auto" asChild>
                <Link to="#nasa-ponuka">{mt.showModules}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Value Prop */}
      <section className="py-16 bg-card border border-border border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
                <PlusSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card1Title}</h3>
              <p className="text-muted-foreground">{mt.card1Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mt.card2Title}</h3>
              <p className="text-muted-foreground">{mt.card2Desc}</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border border-border flex flex-col items-center text-center hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4">
                <Star className="w-8 h-8" />
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Najobľúbenejšie <span className="text-blue-500">{mt.h2Title}</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{mt.h2Desc}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {topHouses?.map((dom) => (
                <Card key={dom.id} className="bg-card border-border overflow-hidden group hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col">
                  <Link to={`${createPageUrl("DetailDomu")}?${dom.slug ? `slug=${dom.slug}` : `id=${dom.id}`}`} className="block relative aspect-video overflow-hidden">
                    <ImageWithWatermark
                      src={dom.hlavny_obrazok || '/api/placeholder/400/225'}
                      alt={dom.nazov}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
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
                        <p className="text-blue-400">{dom.zakladna_cena?.toLocaleString('sk-SK')} €</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full" asChild>
              <Link to={`${createPageUrl("Katalog")}?typ=modularny`}>
                {mt.viewAllButton} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Rich Text Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none prose-a:text-blue-400">
            <h2 className="text-3xl font-bold text-white mb-6">{mt.whyInvestTitle}</h2>
            <p>
              {mt.whyInvestDesc}
            </p>
            
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">{mt.mythsTitle}</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20">
                <h4 className="text-destructive font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> {mt.mythsWrong}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> {mt.myth1}</li>
                  <li className="flex gap-2"><span>•</span> {mt.myth2}</li>
                </ul>
              </div>
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                <h4 className="text-primary font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {mt.realityTitle}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> {mt.reality1}</li>
                  <li className="flex gap-2"><span>•</span> {mt.reality2}</li>
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