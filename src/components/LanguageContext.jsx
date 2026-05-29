import React, { createContext, useContext, useState, useEffect } from 'react';
import skLocales from './translations/locales/sk.js';

const LanguageContext = createContext();

const faqKeys = {
  faq: "FAQ",
  faqTitle: { sk: "Často kladené otázky", en: "Frequently Asked Questions", de: "Häufig gestellte Fragen", fr: "Questions fréquemment posées", sr: "Често постављана питања", hr: "Često postavljana pitanja", el: "Συχνές ερωτήσεις", hu: "Gyakran Ismételt Kérdések", pl: "Najczęściej zadawane pytania", uk: "Часті питання" },
  faqSubtitle: { sk: "Odpovede na najčastejšie otázky o modulárnych a montovaných domoch", en: "Answers to the most common questions about modular and prefab houses", de: "Antworten auf die häufigsten Fragen", fr: "Réponses aux questions les plus fréquentes", sr: "Одговори на најчешћа питања", hr: "Odgovori na najčešća pitanja", el: "Απαντήσεις στις πιο συχνές ερωτήσεις", hu: "Válaszok a leggyakoribb kérdésekre", pl: "Odpowiedzi na najczęstsze pytania", uk: "Відповіді на найчастіші питання" },
  faqSearchPlaceholder: { sk: "Hľadať v otázkach...", en: "Search in questions...", de: "In Fragen suchen...", fr: "Rechercher dans les questions...", sr: "Pretraži pitanja...", hr: "Pretraži pitanja...", el: "Αναζήτηση σε ερωτήσεις...", hu: "Keresés a kérdésekben...", pl: "Szukaj w pytaniach...", uk: "Šuкати в питаннях..." },
  faqCategoryGeneral: { sk: "Všeobecné", en: "General", de: "Allgemein", fr: "Général", sr: "Опште", hr: "Opće", el: "Γενικά", hu: "Általános", pl: "Ogólne", uk: "Загальні" },
  faqCategoryPrice: { sk: "Ceny a financovanie", en: "Prices and financing", de: "Preise und Finanzierung", fr: "Prix et financement", sr: "Цене и финансирање", hr: "Cijene i financiranje", el: "Τιμές και χρηματοδότηση", hu: "Árak és finanszírozás", pl: "Ceny i financowanie", uk: "Ціни та фінансування" },
  faqCategoryDelivery: { sk: "Dodanie a montáž", en: "Delivery and assembly", de: "Lieferung und Montage", fr: "Livraison et montage", sr: "Испорука и монтажа", hr: "Dostava i montaža", el: "Παράδοση και συναρμολόγηση", hu: "Szállítás és szerelés", pl: "Dostawa i montaż", uk: "Доставка та монтаж" },
  faqCategoryConstruction: { sk: "Výstavba", en: "Construction", de: "Bau", fr: "Construction", sr: "Изградња", hr: "Izgradnja", el: "Κατασκευή", hu: "Építés", pl: "Budowa", uk: "Будівництво" },
  faqCategoryWarranty: { sk: "Záruka a servis", en: "Warranty and service", de: "Garantie und Service", fr: "Garantie et service", sr: "Гаранција и сервис", hr: "Jamstvo i servis", el: "Εγγύηση και service", hu: "Garancia és szerviz", pl: "Gwarancja i serwis", uk: "Гарантія та сервіс" },
  faqCategoryEnergy: { sk: "Energia a úspory", en: "Energy and savings", de: "Energie und Einsparungen", fr: "Énergie et économies", sr: "Енергија и уштеде", hr: "Energija i uštede", el: "Ενέργεια και εξοικονόμηση", hu: "Energia és megtakarítás", pl: "Energia i oszczędności", uk: "Енергія та економія" },
  faqNoResults: { sk: "Nenašli sa žiadne výsledky", en: "No results found", de: "Keine Ergebnisse gefunden", fr: "Aucun résultat trouvé", sr: "Нема резултата", hr: "Nema rezultata", el: "Δεν βρέθηκαν αποτελέσματα", hu: "Nincs találat", pl: "Nie znaleziono wyników", uk: "Нічого не знайдено" },
  faqStillHaveQuestions: { sk: "Stále máte otázky?", en: "Still have questions?", de: "Haben Sie noch Fragen?", fr: "Vous avez encore des questions?", sr: "И даље máte питања?", hr: "Još uvijek imate pitanja?", el: "Έχετε ακόμα ερωτήσεις;", hu: "Még mindig vannak kérdései?", pl: "Nadal masz pytania?", uk: "Все ще máte питання?" },
  faqContactUs: { sk: "Neváhajte nás kontaktovať telefonicky alebo emailom. Radi vám pomôžeme.", en: "Don't hesitate to contact us by phone or email. We'll be happy to help.", de: "Zögern Sie nicht, uns telefonisch oder per E-Mail zu kontaktieren. Wir helfen Ihnen gerne weiter.", fr: "N'hésitez pas à nous contacter par téléphone ou par e-mail. Nous serons heureux de vous aider.", sr: "Не устручавајте се да нас контактирате телефоном или е-поштом. Радо ћемо помоћи.", hr: "Ne ustručavajte se kontaktirati nas telefonom ili e-poštom. Rado ћемо помоћи.", el: "Μην διστάσετε να επικοινωνήσετε μαζί μας τηλεφωνικώς ή μέσω email. Θα χαρούμε να βοηθήσουμε.", hu: "Ne habozzon kapcsolatba lépni velünk telefonon vagy e-mailben. Szívesen segítünk.", pl: "Nie wahaj się skontaktować z nami telefonicznie lub e-mailem. Chętnie pomożemy.", uk: "Не соромтеся звертатися до нас телефоном або електронною поштою. Ми з радістю допоможемо." },
  faq1Q: { sk: "Čo je to modulárny dom?", en: "What is a modular house?", de: "Was ist ein Modulhaus?", fr: "Qu'est-ce qu'une maison modulaire?", sr: "Шта је модуларна кућа?", hr: "Što je modularna kuća?", el: "Τι είναι ένα προκατασκευασμένο σπίτι;", hu: "Mi az a moduláris ház?", pl: "Co to jest dom modułowy?", uk: "Що таке модульний будинок?" },
  faq1A: { sk: "Modulárny dom je moderný typ domu, ktorý sa vyrába v továrni vo forme kompletných modulov a potom sa transportuje a osadzuje na pripravený pozemok. Výhodou je rýchlosť výstavby a vysoká kvalita vďaka kontrolovanému prostrediu výroby.", en: "A modular house is a modern type of house manufactured in a factory as complete modules and then transported and placed on a prepared site. The advantage is speed of construction and high quality due to controlled production environment.", de: "Ein Modulhaus ist ein moderner Haustyp, der in einer Fabrik als komplette Module hergestellt und dann auf ein vorbereitetes Grundstück transportiert und montiert wird. Der Vorteil liegt in der Baugeschwindigkeit und hohen Qualität dank kontrollierter Produktionsumgebung.", fr: "Une maison modulaire is un type de maison moderne fabriquée en usine sous forme de modules complets, puis transportée et installée sur un terrain préparé. L'avantage réside dans la rapidité de construction et la haute qualité grâce à l'environnement de production contrôlé.", sr: "Модуларна кућа је модеран тип куће која се производи у фабрици у облику комплетних модула, а затим се транспортује и поставља на припремљену парцелу. Предност је брзина градње и висок квалитет захваљујући контролисаном окружењу производње.", hr: "Modularna kuća je moderan tip kuće koja se proizvodi u tvornici u obliku kompletnih modula, a zatim se transportira i postavlja na pripremljenu parcelu. Prednost je brzina izgradnje i visoka kvaliteta zahvaljujući kontroliranom okruženju proizvodnje.", el: "Ένα προκατασκευασμένο σπίτι είναι ένας σύγχρονος τύπος σπιτιού που κατασκευάζεται σε εργοστάσιο ως πλήρεις μονάδες και στη συνέχεια μεταφέρεται και τοποθετείται σε προετοιμασμένο χώρο. Το πλεονέκτημα είναι η ταχύτητα κατασκευής και η υψηλή ποιότητα χάρη στο ελεγχόμενο περιβάλλον παραγωγής.", hu: "A moduláris ház egy modern háztípus, amelyet gyárban teljes modulokként gyártanak, majd szállítanak és helyeznek el egy előkészített telekre. Az előny a gyors építés és a magas minőség a kontrollált gyártási környezetnek köszönhetően.", pl: "Dom modułowy to nowoczesny typ domu produkowany w fabryce w postaci kompletnych modułów, a następnie transportowany i umieszczany na przygotowanej działce. Zaletą jest szybkość budowy i wysoka jakość dzięki kontrolowanemu środowisku produkcji.", uk: "Модульний будинок - це сучасний тип будинку, який виробляється на заводі у формі комплектних модулів, а потім транспортується та встановлюється на підготовлену ділянку. Перевага полягає в швидкості будівництва та високій якості завдяки контрольованому виробничому середовищу." },
  faq2Q: { sk: "Aký je rozdiel medzi modulárnym a montovaným domom?", en: "What's the difference between modular and prefab house?", de: "Was ist der Unterschied zwischen Modulhaus und Fertighaus?", fr: "Quelle est la différence entre maison modulaire et préfabriquée?", sr: "Која је разлика између модуларне и монтажне куће?", hr: "Koja je razlika između modularne i montažne kuće?", el: "Ποια είναι η διαφορά μεταξύ προκατασκευασμένου και συναρμολογούμενου σπιτιού;", hu: "Mi a különbség a moduláris és az előregyártott ház között?", pl: "Jaka jest różnica między domem modułowym a prefabrykowanym?", uk: "Яка різниця між модульним та збірним будинком?" },
  modularHomesBratislava: { sk: "Modulárne domy Bratislava", en: "Modular Homes Bratislava", de: "Modulhäuser Bratislava", fr: "Maisons modulaires Bratislava", sr: "Модуларне куће Братислава", hr: "Modularne kuće Bratislava", el: "Προκατασκευασμένα σπίτια Μπρατισλάβα", hu: "Moduláris házak Pozsony", pl: "Domy modułowe Bratysława", uk: "Modульні будинки Братислава" },
  noSurcharge: {
    sk: "Bez príplatku",
    en: "No surcharge",
    de: "Kein Aufpreis",
    fr: "Sans supplément",
    sr: "Bez doplate",
    hr: "Bez nadoplate",
    el: "Χωρίς επιπλέον χρέωση",
    hu: "Felár nélkül",
    pl: "Bez dopłaty",
    uk: "Bez доплати"
  }
};

const getTranslationsWithFaq = (lang, langData) => {
  if (!langData) return null;
  const merged = { ...langData };
  Object.keys(faqKeys).forEach(key => {
    if (!merged[key]) {
      merged[key] = typeof faqKeys[key] === 'object' ? faqKeys[key][lang] || faqKeys[key]['en'] : faqKeys[key];
    }
  });
  return merged;
};

const initialTranslations = {
  sk: getTranslationsWithFaq('sk', skLocales)
};

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang?.split('-')[0]?.toLowerCase();
  const supportedLanguages = ['sk', 'en', 'hu', 'pl', 'uk', 'de', 'fr', 'sr', 'hr', 'el'];
  return supportedLanguages.includes(langCode) ? langCode : 'sk';
};

export const AVAILABLE_LANGUAGES = [
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    if (!saved) {
      const detectedLang = detectBrowserLanguage();
      localStorage.setItem('app_language', detectedLang);
      return detectedLang;
    }
    return saved;
  });

  const [activeTranslations, setActiveTranslations] = useState(initialTranslations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_language', language);

    if (language === 'sk') return;

    if (activeTranslations[language]) return;

    let isMounted = true;
    setIsLoading(true);

    import(`./translations/locales/${language}.js`)
      .then((module) => {
        if (isMounted) {
          setActiveTranslations((prev) => ({
            ...prev,
            [language]: getTranslationsWithFaq(language, module.default)
          }));
        }
      })
      .catch((err) => {
        console.error(`Failed to load translations for ${language}:`, err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const t = (key) => {
    return activeTranslations[language]?.[key] || activeTranslations['sk']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: activeTranslations, isLoadingTranslations: isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}