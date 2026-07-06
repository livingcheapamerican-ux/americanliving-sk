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

const catalogDownloadKeys = {
  downloadCatalogTitle: {
    sk: "Stiahnite si náš katalóg",
    en: "Download our catalog",
    de: "Laden Sie unseren Katalog herunter",
    fr: "Téléchargez notre catalogue",
    hu: "Töltse le katalógusunkat",
    pl: "Pobierz nasz katalog",
    uk: "Завантажте наш каталог",
    sr: "Преузмите наш каталог",
    hr: "Preuzmite naš katalog",
    el: "Κατεβάστε τον κατάλογό μας"
  },
  downloadCatalogSubtitle: {
    sk: "Spoznajte unikátnu technológiu prefabrikovaných a modulárnych drevostavieb, kompletné cenníky a technické detaily.",
    en: "Discover our unique technology of prefabricated and modular wooden houses, complete pricelists and technical details.",
    de: "Entdecken Sie die einzigartige Technologie von Fertig- und Modulholzhäusern, komplette Preislisten und technische Details.",
    fr: "Découvrez notre technologie unique de maisons à ossature bois préfabriquées et modulaires, tarifs complets et détails techniques.",
    hu: "Ismerje meg az előregyártott és moduláris faházak egyedülálló technológiáját, a teljes árlistákat és a műszaki részleteket.",
    pl: "Poznaj wyjątkową technologię prefabrykowanych i modułowych domów drewnianych, cenniki i szczegóły techniczne.",
    uk: "Дізнайтеся про унікальну технологію збірних та модульних дерев'яних будинків, повні прайс-листи та технічні деталі.",
    sr: "Упознајте јединствену технологију монтажних и модуларних дрвених кућа, комплетне ценовнике и техничке детаље.",
    hr: "Upoznajte jedinstvenu tehnologiju montažnih i modularnih drvenih kuća, kompletne cjenike i tehničke detalje.",
    el: "Ανακαλύψτε τη μοναδική τεχνολογία των προκατασκευασμένων και αρθρωτών ξύλινων σπιτιών μας, πλήρεις τιμοκαταλόγους και τεχνικές λεπτομέρειες."
  },
  catalogTeaserTitle: {
    sk: "Ochutnávka z katalógu Prosto House",
    en: "Sneak peek of Prosto House catalog",
    de: "Vorschau auf den Prosto House-Katalog",
    fr: "Aperçu du catalogue Prosto House",
    hu: "Ízelítő a Prosto House katalógusból",
    pl: "Zapowiedź katalogu Prosto House",
    uk: "Попередній перегляд каталогу Prosto House",
    sr: "Преглед каталога Prosto House",
    hr: "Pregled kataloga Prosto House",
    el: "Μια ματιά στον κατάλογο Prosto House"
  },
  downloadProstoHouseTitle: {
    sk: "Stiahnutie Prosto House Katalógu",
    en: "Download Prosto House Catalog",
    de: "Prosto House-Katalog herunterladen",
    fr: "Télécharger le catalogue Prosto House",
    hu: "Prosto House katalógus letöltése",
    pl: "Pobierz katalog Prosto House",
    uk: "Завантажити каталог Prosto House",
    sr: "Преузмите каталог Prosto House",
    hr: "Preuzmite katalog Prosto House",
    el: "Λήψη καταλόγου Prosto House"
  },
  downloadInstructions: {
    sk: "Ak chcete získať okamžitý odkaz a začať sťahovať PDF dokument, vyplňte prosím nasledujúce informácie.",
    en: "To get the instant link and start downloading the PDF document, please fill in the following information.",
    de: "Um den Sofort-Link zu erhalten und den Download des PDF-Dokuments zu starten, füllen Sie bitte die folgenden Informationen aus.",
    fr: "Pour obtenir le lien instantané et commencer à télécharger le document PDF, veuillez remplir les informations suivantes.",
    hu: "Az azonnali link lekéréséhez és a PDF dokumentum letöltésének megkezdéséhez kérjük, töltse ki az alábbi adatokat.",
    pl: "Aby uzyskać natychmiastowy link i rozpocząć pobieranie dokumentu PDF, podaj następujące informacje.",
    uk: "Щоб отримати миттєве посилання та почати завантаження PDF-документа, будь ласка, заповніть наступну інформацію.",
    sr: "Да бисте добили тренутну везу и започели преузимање ПДФ документа, попуните следеће информације.",
    hr: "Da biste dobili trenutnu poveznicu i započeli preuzimanje PDF dokumenta, popunite sljedeće informacije.",
    el: "Για να λάβετε τον άμεσο σύνδεσμο και να ξεκινήσετε τη λήψη του εγγράφου PDF, συμπληρώστε τις παρακάτω πληροφορίες."
  },
  fieldName: {
    sk: "Meno a priezvisko",
    en: "Full Name",
    de: "Name und Nachname",
    fr: "Nom et prénom",
    hu: "Teljes név",
    pl: "Imię i nazwisko",
    uk: "Ім'tя та прізвище",
    sr: "Име и презиме",
    hr: "Ime i prezime",
    el: "Ονοματεπώνυμο"
  },
  fieldEmail: {
    sk: "E-mailová adresa",
    en: "Email Address",
    de: "E-Mail-Adresse",
    fr: "Adresse e-mail",
    hu: "E-mail cím",
    pl: "Adres e-mail",
    uk: "Електронна адреса",
    sr: "Е-маил адреса",
    hr: "E-mail adresa",
    el: "Διεύθυνση email"
  },
  fieldPhone: {
    sk: "Telefónne číslo (nepovinné)",
    en: "Phone Number (optional)",
    de: "Telefonnummer (optional)",
    fr: "Numéro de téléphone (optionnel)",
    hu: "Telefonszám (opcionális)",
    pl: "Numer telefonu (opcjonalnie)",
    uk: "Номер телефону (необов'язково)",
    sr: "Број телефона (опционо)",
    hr: "Broj telefona (neobavezno)",
    el: "Αριθμός τηλεφώνου (προαιρετικό)"
  },
  gdprConsent: {
    sk: "Súhlasím so spracovaním osobných údajov za účelom odoslania katalógu a súvisiacich informácií o drevodomoch.",
    en: "I agree to the processing of personal data for the purpose of sending the catalog and related information about wooden houses.",
    de: "Ich stimme der Verarbeitung personenbezogener Daten zum Zweck der Zusendung des Katalogs und zugehöriger Informationen über Holzhäuser zu.",
    fr: "J'accepte le traitement des données personnelles dans le but d'envoyer le catalogue et les informations associées sur les maisons en bois.",
    hu: "Hozzájárulok a személyes adatok kezeléséhez a katalógus és a faházakkal kapcsolatos információk megküldése céljából.",
    pl: "Wyrażam zgodę na przetwarzanie danych osobowych w celu przesłania katalogu oraz powiązanych informacji o domach drewnianych.",
    uk: "Я даю згоду на обробку персональних даних з метою надсилання каталогу та супутньої інформації про дерев'яні будинки.",
    sr: "Сагласан сам са обрадом личних података у сврху слања каталога и повезаних информација о дрвеним кућама.",
    hr: "Suglasan sam s obradom osobnih podataka u svrhu slanja kataloga i povezanih informacija o drvenim kućama.",
    el: "Συναινώ στην επεξεργασία των προσωπικών μου δεδομένων για την αποστολή του καταλόγου και των σχετικών πληροφοριών για τα ξύλινα σπίτια."
  },
  submitButton: {
    sk: "Odoslať a stiahnuť katalóg",
    en: "Submit and Download Catalog",
    de: "Absenden und Katalog herunterladen",
    fr: "Envoyer et télécharger le catalogue",
    hu: "Küldés és katalógus letöltése",
    pl: "Wyślij i pobierz katalog",
    uk: "Надіслати та завантажити каталог",
    sr: "Пошаљите и преузмите каталог",
    hr: "Pošaljite i preuzmite katalog",
    el: "Υποβολή και λήψη καταλόγου"
  },
  thanksTitle: {
    sk: "Ďakujeme za záujem!",
    en: "Thank you for your interest!",
    de: "Vielen Dank für Ihr Interesse!",
    fr: "Merci pour votre intérêt!",
    hu: "Köszönjük az érdeklődést!",
    pl: "Dziękujemy za zainteresowanie!",
    uk: "Дякуємо за ваш інтерес!",
    sr: "Хвала на интересовању!",
    hr: "Hvala na interesu!",
    el: "Σας ευχαριστούμε για το ενδιαφέρον σας!"
  },
  thanksDescription: {
    sk: "Katalóg sa začal sťahovať. Odkaz sme Vám poslali aj na e-mailovú schránku.",
    en: "The catalog has started downloading. We have also sent the link to your email inbox.",
    de: "Der Download des Katalogs hat begonnen. Wir haben den Link auch an Ihren E-Mail-Posteingang gesendet.",
    fr: "Le téléchargement du catalogue a commencé. Nous avons également envoyé le lien dans votre boîte e-mail.",
    hu: "A katalógus letöltése megkezdődött. A linket az e-mail postaládájába is elküldtük.",
    pl: "Rozpoczęto pobieranie katalogu. Link wysłaliśmu również na Twoją skrzynkę e-mail.",
    uk: "Завантаження каталогу розпочато. Ми також надіслали посилання на вашу електронну адресу.",
    sr: "Преузимање каталога је почело. Линк смо послали и у ваше сандуче е-поште.",
    hr: "Preuzimanje kataloga je počelo. Poveznicu smo poslali i u vaš e-mail pretinac.",
    el: "Η λήψη του καταλόγου ξεκίνησε. Στείλαμε επίσης τον σύνδεσμο στα εισερχόμενα του email σας."
  },
  downloadAgain: {
    sk: "Stiahnuť znova",
    en: "Download Again",
    de: "Erneut herunterladen",
    fr: "Télécharger à nouveau",
    hu: "Letöltés újra",
    pl: "Pobierz ponownie",
    uk: "Завантажити знову",
    sr: "Преузмите поново",
    hr: "Preuzmite ponovo",
    el: "Λήψη ξανά"
  },
  goBack: {
    sk: "Späť",
    en: "Go Back",
    de: "Zurück",
    fr: "Retour",
    hu: "Vissza",
    pl: "Wstecz",
    uk: "Назад",
    sr: "Назад",
    hr: "Natrag",
    el: "Πίσω"
  },
  tinyHouseTitle: {
    sk: "Tiny House Katalóg",
    en: "Tiny House Catalog",
    de: "Tiny House-Katalog",
    fr: "Catalogue Tiny House",
    hu: "Tiny House katalógus",
    pl: "Katalog Tiny House",
    uk: "Каталог Tiny House",
    sr: "Каталог Tiny House",
    hr: "Katalog Tiny House",
    el: "Κατάλογος Tiny House"
  },
  tinyHouseDescription: {
    sk: "Momentálne pripravujeme kompletnú novú ponuku minimalistických celoročných mobilných Tiny House domov.",
    en: "We are currently preparing a complete new offer of minimalist year-round mobile Tiny Houses.",
    de: "Wir bereiten derzeit ein komplett neues Angebot an minimalistischen ganzjährigen mobilen Tiny Houses vor.",
    fr: "Nous préparons actuellement une toute nouvelle offre de Tiny Houses mobiles minimalistes utilisables toute l'année.",
    hu: "Jelenleg egy teljesen új kínálatot készítünk elő a minimalista, egész évben használható mobil Tiny House házakból.",
    pl: "Obecnie przygotowujemy zupełnie nową ofertę minimalistycznych całorocznych mobilnych domków Tiny House.",
    uk: "Зараз ми готуємо абсолютно нову пропозицію мінімалістичних цілорічних мобільних будинків Tiny House.",
    sr: "Тренутно припремамо комплетно нову понуду минималистичких целогодишњих мобилних кућица Тини Хоусе.",
    hr: "Trenutno pripremano potpuno novu ponudu minimalističkih cjelogodišnjih mobilnih kućica Tiny House.",
    el: "Αυτή τη στιγμή ετοιμάζουμε μια εντελώς νέα προσφορά μινιμαλιστικών κινητών σπιτιών Tiny House για όλο το χρόνο."
  },
  tinyHouseFormInstructions: {
    sk: "Zanechajte nám svoj e-mail a my Vám pošleme katalóg ako prvým hneď, ako ho naši dizajnéri dokončia.",
    en: "Leave us your email and we will send you the catalog first, as soon as our designers finish it.",
    de: "Hinterlassen Sie uns Ihre E-Mail und wir senden Ihnen den Katalog als Erster, sobald unsere Designer ihn fertiggestellt haben.",
    fr: "Laissez-nous votre e-mail et nous vous enverrons le catalogue en premier dès que nos designers l'auront terminé.",
    hu: "Hagyja meg nekünk e-mail címét, és mi küldjük el Önnek a katalógust elsőként, amint a tervezőink elkészülnek vele.",
    pl: "Zostaw nam swój e-mail, a wyślemy Ci katalog jako pierwszemu, gdy tylko nasi projektanci go ukończą.",
    uk: "Залиште нам свою електронную адресу, і ми надішлемо вам каталог першим, як тільки наші дизайнери його закінчать.",
    sr: "Оставите нам своју е-пошту и ми ћемо вам први послати каталог чим га наши дизајнери заврше.",
    hr: "Ostavite nam svoju e-mail adresu i mi ćemo vam prvi poslati katalog čim ga naši dizajneri završe.",
    el: "Αφήστε μας το email σας και θα σας στείλουμε τον κατάλογο πρώτοι, μόλις τον ολοκληρώσουν οι σχεδιαστές μας."
  },
  notifyMe: {
    sk: "Upozorniť ma",
    en: "Notify Me",
    de: "Benachrichtige mich",
    fr: "M'avertir",
    hu: "Értesítsen engem",
    pl: "Powiadom mnie",
    uk: "Повідомити мене",
    sr: "Обавести me",
    hr: "Obavijesti me",
    el: "Ειδοποιήστε με"
  },
  waitingListSuccess: {
    sk: "Ďakujeme! Váš e-mail bol uložený do zoznamu čakateľov.",
    en: "Thank you! Your email has been saved to the waiting list.",
    de: "Vielen Dank! Ihre E-Mail wurde in die Warteliste eingetragen.",
    fr: "Merci! Votre e-mail a été enregistré sur la liste d'attente.",
    hu: "Köszönjük! Az e-mail címét elmentettük a várólistára.",
    pl: "Dziękujemy! Twój e-mail został zapisany na liście oczekujących.",
    uk: "Дякуємо! Вашу електронну адресу збережено у списку очікування.",
    sr: "Хвала! Ваша е-пошта је сачувана на листи чекања.",
    hr: "Hvala vam! Vaša e-mail adresa je spremljena na listu čekanja.",
    el: "Σας ευχαριστούμε! Το email σας αποθηκεύτηκε στη λίστα αναμονής."
  },
  soonSoon: {
    sk: "Už čoskoro",
    en: "Coming soon",
    de: "Demnächst",
    fr: "Bientôt disponible",
    hu: "Hamarosan",
    pl: "Już wkrótce",
    uk: "Незабаром",
    sr: "Ускоро",
    hr: "Uskoro",
    el: "Σύντομα κοντά σας"
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
  Object.keys(catalogDownloadKeys).forEach(key => {
    if (!merged[key]) {
      merged[key] = typeof catalogDownloadKeys[key] === 'object' ? catalogDownloadKeys[key][lang] || catalogDownloadKeys[key]['en'] : catalogDownloadKeys[key];
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

  const t = (key, params = {}) => {
    let text = activeTranslations[language]?.[key] || activeTranslations['sk']?.[key] || key;
    if (typeof text === 'string') {
      Object.keys(params).forEach(pKey => {
        text = text.replace(new RegExp(`{${pKey}}`, 'g'), params[pKey]);
      });
    }
    return text;
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