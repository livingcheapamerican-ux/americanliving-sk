
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, FileText, Hammer, Key, Phone, 
  Zap, ThermometerSun, Shield, Clock, CheckCircle, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";


// 10-language translations dictionary
const pageTranslations = {
  "sk": {
    "title": "Ako to funguje?",
    "subtitle": "Transparentný proces od prvého stretnutia až po odovzdanie kľúčov. Sme s vami na každom kroku.",
    "stepsTitle": "{t.stepsTitle}",
    "stepsSubtitle": "{t.stepsSubtitle}",
    "techTitle": "{t.techTitle}",
    "techSubtitle": "{t.techSubtitle}",
    "faqTitle": "{t.faqTitle}",
    "faqSubtitle": "{t.faqSubtitle}",
    "ctaTitle": "{t.ctaTitle}",
    "ctaSubtitle": "{t.ctaSubtitle}",
    "contactUs": "{t.contactUs}",
    "viewCatalog": "{t.viewCatalog}",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "Stretnutie, kde spoločne prediskutujeme vaše predstavy, požiadavky a rozpočet. Poradíme vám s výberom modelu a vysvetlíme celý proces.",
        "details": [
          "Konzultácia je úplne nezáväzná a bezplatná",
          "Môžeme sa stretnúť osobne, online alebo telefonicky",
          "Pomôžeme vám vybrať ideálny model z katalógu"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Na základe vašich požiadaviek vytvoríme detailný návrh vrátane pôdorysov, 3D vizualizácií a technickej dokumentácie.",
        "details": [
          "Profesionálne 3D vizualizácie exteriéru a interiéru",
          "Detailné pôdorysy všetkých podlaží",
          "Prispôsobíme návrh podľa vašich pripomienok"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "Zabezpečíme všetky potrebné stavebné povolenia a dokumentáciu. O administratívu sa postaráme my, vy sa môžete tešiť na nový domov.",
        "details": [
          "Vybavíme všetky potrebné povolenia",
          "Komunikácia s úradmi na našej strane",
          "Pravidelné informovanie o priebehu"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realizácia výstavby podľa dohodnutého harmonogramu. Pravidelne vás informujeme o postupe prác a kedykoľvek môžete stavbu navštíviť.",
        "details": [
          "Výstavba trvá typicky 4-6 mesiacov",
          "Týždenné reporty s fotkami z výstavby",
          "Osobný stavebný manažér pre vás"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "Po dokončení výstavby prebehne záverečná prehliadka a odovzdanie domu. Poskytujeme aj pozáručný servis a poradenstvo.",
        "details": [
          "Kompletná záverečná kontrola kvality",
          "Odovzdanie všetkej dokumentácie",
          "5-ročná záruka a pozáručný servis"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Naše domy dosahujú energetickú triedu A. Použitím kvalitnej izolácie a moderných technológií výrazne znížite náklady na vykurovanie a chladenie.",
        "features": [
          "Tepelné čerpadlo",
          "Rekuperácia",
          "Fotovoltika (možnosť)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Moderná drevostavba kombinuje rýchlosť výstavby s výbornou tepelnou izoláciou. Drevo je prírodný, obnoviteľný a ekologický materiál.",
        "features": [
          "Drevený skelet",
          "Viacvrstvová konštrukcia",
          "Priedušná konštrukcia"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Vďaka prefabrikácii a moderným technológiám dokážeme váš dom postaviť za 4-6 mesiacov od začiatku výstavby na pozemku.",
        "features": [
          "Predvýroba v hale",
          "Montáž na pozemku",
          "Menšia závislosť na počasí"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "Cena závisí od veľkosti domu, štandardu vybavenia a konkrétnych požiadaviek. Orientačne sa ceny pohybujú od 1500-2500 €/m². Presný rozpočet vám pripravíme po konzultácii."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "Samotná výstavba domu na pozemku trvá 4-6 mesiacov. Celkový čas od podpisu zmluvy po odovzdanie závisí aj od vybavenia stavebného povolenia (cca 2-4 mesiace)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Áno, každý náš model môžete prispôsobiť podľa svojich predstáv. Môžete meniť dispozíciu, veľkosť miestností, materiály, farby a mnoho ďalšieho."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "Pri správnej údržbe má drevostavba životnosť viac ako 100 rokov. Moderné technológie a materiály zabezpečujú dlhovekosť porovnateľnú s murovanými domami."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "Spolupracujeme s viacerými bankami a môžeme vám pomôcť s vybavením hypotéky. Pripravíme všetku potrebnú dokumentáciu pre banku."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "Cena na kľúč zahŕňa projekt, stavebné povolenie, výstavbu domu, technológie (kúrenie, voda, elektrina), vnútorné omietky a kompletné podlahy. Nezahŕňa pozemok a prípojky inžinierskych sietí."
      }
    ]
  },
  "en": {
    "title": "How it works?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Process in 5 steps",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technology and quality",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "Frequently Asked Questions",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Contact Us",
    "viewCatalog": "View Catalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "First Consultation",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Design and Visualizations",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Building Permits",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Construction",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Turnkey Handover",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energy Efficiency",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Timber Frame",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Fast Construction",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "What is the price of a turnkey house?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "How long does construction take?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Can I customize the house?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "What is the lifespan of a timber house?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Do you provide financing?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "What does the turnkey price include?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "de": {
    "title": "Wie funktioniert es?",
    "subtitle": "Ein transparenter Prozess vom ersten Gespräch bis zur Schlüsselübergabe. Wir begleiten Sie bei jedem Schritt.",
    "stepsTitle": "Prozess in 5 Schritten",
    "stepsSubtitle": "Vom Traum zur Realität - ein klarer und übersichtlicher Prozess",
    "techTitle": "Technologie und Qualität",
    "techSubtitle": "Wir nutzen modernste Technologien und Qualitätsmaterialien für Ihren Komfort und Ersparnisse",
    "faqTitle": "Häufig gestellte Fragen",
    "faqSubtitle": "Antworten auf die häufigsten Fragen unserer Kunden",
    "ctaTitle": "Haben Sie weitere Fragen?",
    "ctaSubtitle": "Wir beraten Sie gerne und beantworten alle Ihre Fragen. Kontaktieren Sie uns noch heute!",
    "contactUs": "Kontaktieren Sie uns",
    "viewCatalog": "Katalog ansehen",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Erste Beratung",
        "popis": "Ein Treffen, bei dem wir gemeinsam Ihre Vorstellungen, Anforderungen und Ihr Budget besprechen. Wir beraten Sie bei der Modellauswahl und erklären den gesamten Ablauf.",
        "details": [
          "Die Beratung ist völlig unverbindlich und kostenlos",
          "Wir können uns persönlich, online oder telefonisch treffen",
          "Wir helfen Ihnen bei der Auswahl des idealen Modells aus dem Katalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Entwurf und Visualisierungen",
        "popis": "Basierend auf Ihren Anforderungen erstellen wir einen detaillierten Entwurf inklusive Grundrissen, 3D-Visualisierungen und technischer Dokumentation.",
        "details": [
          "Professionelle 3D-Visualisierungen für außen und innen",
          "Detaillierte Grundrisse aller Etagen",
          "Wir passen den Entwurf an Ihre Rückmeldungen an"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Baugenehmigungen",
        "popis": "Wir besorgen alle notwendigen Baugenehmigungen und Unterlagen. Wir kümmern uns um die Bürokratie, damit Sie sich auf Ihr neues Zuhause freuen können.",
        "details": [
          "Wir besorgen alle notwendigen Genehmigungen",
          "Die Kommunikation mit den Behörden liegt bei uns",
          "Regelmäßige Informationen über den Fortschritt"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Bauphase",
        "popis": "Realisierung des Baus nach dem vereinbarten Zeitplan. Wir informieren Sie regelmäßig über den Fortschritt und Sie können die Baustelle jederzeit besuchen.",
        "details": [
          "Der Bau dauert in der Regel 4-6 Monate",
          "Wöchentliche Berichte mit Fotos von der Baustelle",
          "Ein persönlicher Bauleiter für Sie"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Schlüsselfertige Übergabe",
        "popis": "Nach Fertigstellung des Baus erfolgt die Endabnahme und Übergabe des Hauses. Wir bieten auch Nachgarantieservice und Beratung.",
        "details": [
          "Komplette abschließende Qualitätskontrolle",
          "Übergabe aller Unterlagen",
          "5 Jahre Garantie und Nachgarantieservice"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energieeffizienz",
        "popis": "Unsere Häuser erreichen die Energieklasse A. Durch den Einsatz hochwertiger Dämmung und moderner Technologien senken Sie die Heiz- und Kühlkosten deutlich.",
        "features": [
          "Wärmepumpe",
          "Lüftungsanlage mit Wärmerückgewinnung",
          "Photovoltaik (optional)"
        ]
      },
      {
        "nazov": "Holzrahmenbau",
        "popis": "Der moderne Holzrahmenbau verbindet schnelle Montage mit hervorragender Wärmedämmung. Holz ist ein natürlicher, nachwachsender und ökologischer Baustoff.",
        "features": [
          "Holzskelett",
          "Mehrschichtige Konstruktion",
          "Atmungsaktive Konstruktion"
        ]
      },
      {
        "nazov": "Schneller Bau",
        "popis": "Dank Vorfertigung und moderner Technologien können wir Ihr Haus in 4-6 Monaten ab Baubeginn auf dem Grundstück errichten.",
        "features": [
          "Vorfertigung im Werk",
          "Montage auf dem Grundstück",
          "Geringere Wetterabhängigkeit"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Wie hoch ist der Preis für ein schlüsselfertiges Haus?",
        "odpoved": "Der Preis hängt von der Größe des Hauses, dem Ausstattungsstandard und den spezifischen Anforderungen ab. Richtungsweisend liegen die Preise zwischen 1500-2500 €/m². Ein genaues Budget erstellen wir Ihnen nach der Beratung."
      },
      {
        "otazka": "Wie lange dauert der Bau?",
        "odpoved": "Der eigentliche Bau des Hauses auf dem Grundstück dauert 4-6 Monate. Die Gesamtzeit von der Vertragsunterzeichnung bis zur Übergabe hängt auch von der Erteilung der Baugenehmigung ab (ca. 2-4 Monate)."
      },
      {
        "otazka": "Kann ich das Haus individuell anpassen?",
        "odpoved": "Ja, Sie können jedes unserer Modelle nach Ihren Wünschen anpassen. Sie können den Grundriss, die Raumgrößen, Materialien, Farben und vieles mehr ändern."
      },
      {
        "otazka": "Wie hoch ist die Lebensdauer eines Holzhauses?",
        "odpoved": "Bei sachgemäßer Wartung hat ein Holzrahmenhaus eine Lebensdauer von mehr als 100 Jahren. Moderne Technologien und Materialien gewährleisten eine mit Ziegelhäusern vergleichbare Langlebigkeit."
      },
      {
        "otazka": "Bieten Sie eine Finanzierung an?",
        "odpoved": "Wir arbeiten mit mehreren Banken zusammen und können Ihnen bei der Finanzierung helfen. Wir bereiten alle notwendigen Unterlagen für die Bank vor."
      },
      {
        "otazka": "Was beinhaltet der schlüsselfertige Preis?",
        "odpoved": "Der schlüsselfertige Preis beinhaltet Planung, Baugenehmigung, Hausbau, Haustechnik (Heizung, Wasser, Strom), Innenputz und komplette Bodenbeläge. Nicht enthalten sind Grundstück und Erschließungskosten."
      }
    ]
  },
  "fr": {
    "title": "How it works?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Process in 5 steps",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technology and quality",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "FAQ",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Contact Us",
    "viewCatalog": "View Catalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "hu": {
    "title": "Hogyan működik?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Folyamat 5 lépésben",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technológia és minőség",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "Gyakran Ismételt Kérdések",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Kapcsolatfelvétel",
    "viewCatalog": "Katalógus megtekintése",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "pl": {
    "title": "Jak to działa?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Proces w 5 krokach",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technologia i jakość",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "Często Zadawane Pytania",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Skontaktuj się z nami",
    "viewCatalog": "Zobacz katalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "uk": {
    "title": "Як це працює?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Процес у 5 кроків",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Технологія та якість",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "Часті питання",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Зв'язатися з нами",
    "viewCatalog": "Переглянути каталог",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "sr": {
    "title": "Како то ради?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Process in 5 steps",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technology and quality",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "FAQ",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Contact Us",
    "viewCatalog": "View Catalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "hr": {
    "title": "Kako to radi?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Proces u 5 koraka",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technology and quality",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "FAQ",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Contact Us",
    "viewCatalog": "View Catalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  },
  "el": {
    "title": "How it works?",
    "subtitle": "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    "stepsTitle": "Process in 5 steps",
    "stepsSubtitle": "From dream to reality - a clear and transparent process",
    "techTitle": "Technology and quality",
    "techSubtitle": "We use state-of-the-art technology and quality materials for your comfort and savings",
    "faqTitle": "FAQ",
    "faqSubtitle": "Answers to our clients' most common questions",
    "ctaTitle": "Do you have more questions?",
    "ctaSubtitle": "We will be happy to advise you and answer all your questions. Contact us today!",
    "contactUs": "Contact Us",
    "viewCatalog": "View Catalog",
    "proces": [
      {
        "cislo": "01",
        "nazov": "Prvá konzultácia",
        "popis": "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        "details": [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        "cislo": "02",
        "nazov": "Návrh a vizualizácie",
        "popis": "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        "details": [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        "cislo": "03",
        "nazov": "Stavebné povolenia",
        "popis": "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        "details": [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        "cislo": "04",
        "nazov": "Výstavba",
        "popis": "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        "details": [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        "cislo": "05",
        "nazov": "Odovzdanie na kľúč",
        "popis": "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        "details": [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    "technologia": [
      {
        "nazov": "Energetická efektivita",
        "popis": "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        "features": [
          "Heat pump",
          "Heat recovery",
          "Photovoltaics (optional)"
        ]
      },
      {
        "nazov": "Drevostavba",
        "popis": "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        "features": [
          "Wooden skeleton",
          "Multi-layer construction",
          "Breathable construction"
        ]
      },
      {
        "nazov": "Rýchla výstavba",
        "popis": "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        "features": [
          "Factory prefabrication",
          "Site assembly",
          "Less dependent on weather"
        ]
      }
    ],
    "faq": [
      {
        "otazka": "Aká je cena domu na kľúč?",
        "odpoved": "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        "otazka": "Ako dlho trvá výstavba?",
        "odpoved": "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        "otazka": "Môžem si dom prispôsobiť?",
        "odpoved": "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        "otazka": "Aká je životnosť drevostavby?",
        "odpoved": "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        "otazka": "Poskytujete financovanie?",
        "odpoved": "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        "otazka": "Čo všetko zahŕňa cena na kľúč?",
        "odpoved": "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  }
};

export default function AkoToFunguje() {
  const { language } = useLanguage();
  const t = pageTranslations[language] || pageTranslations.sk;
  const proces = t.proces;
  const technologia = t.technologia;
  const faq = t.faq;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#9E2A2B] to-[#802021] text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Ako to funguje?
            </h1>
            <p className="text-xl text-white">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proces */}
      <section className="py-20 bg-background border-t border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Proces v 5 krokoch
              </h2>
              <p className="text-xl text-muted-foreground">
                Od sna po realitu - jasný a prehľadný proces
              </p>
            </motion.div>

            <div className="space-y-8">
              {proces.map((krok, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 md:w-48 flex-shrink-0 flex items-center justify-center">
                        <div className="text-center">
                          <krok.icon className="w-12 h-12 mx-auto mb-3" />
                          <p className="text-5xl font-bold text-white/60">{krok.cislo}</p>
                        </div>
                      </div>
                      <div className="p-8 flex-grow bg-card text-foreground transition-colors duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{krok.nazov}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{krok.popis}</p>
                        <ul className="space-y-2">
                          {krok.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technológia */}
      <section className="py-20 bg-muted/30 border-y border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Technológia a kvalita
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Používame najmodernejšie technológie a kvalitné materiály pre váš komfort a úspory
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {technologia.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl border border-border transition-shadow bg-card">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <tech.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tech.nazov}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{tech.popis}</p>
                  <ul className="space-y-2">
                    {tech.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background border-t border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-xl text-gray-700">
              Odpovede na najčastejšie otázky našich klientov
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg border border-border transition-shadow bg-card">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                    <span className="text-secondary flex-shrink-0">Q:</span>
                    {item.otazka}
                  </h3>
                  <p className="text-gray-700 leading-relaxed pl-8">
                    {item.odpoved}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Phone className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              Máte ďalšie otázky?
            </h2>
            <p className="text-xl mb-8 text-white">
              Radi vám poradíme a zodpovieme všetky vaše otázky. Kontaktujte nás ešte dnes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Kontakt")}>
                <Button size="lg" className="bg-red hover:bg-red/90 text-white font-semibold px-8 w-full sm:w-auto">
                  Kontaktovať nás
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Katalog")}>
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-navy font-semibold px-8 w-full sm:w-auto">
                  Prezrieť katalóg
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
