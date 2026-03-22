import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TR = {
  sk: { quote: "CENOVÁ PONUKA", quoteNo: "Číslo ponuky:", date: "Dátum:", forClient: "Pre klienta", name: "Meno:", email: "Email:", phone: "Telefón:", city: "Obec:", model: "Vybraný model domu", manufacturer: "Výrobca:", houseType: "Typ domu:", modules: "Počet modulov:", rooms: "Počet izieb:", area: "Zastavaná plocha:", usable: "Úžitková plocha:", terrace: "Terasa:", buildingType: "Typ stavby:", floorPlans: "Pôdorysy", plan2d: "2D pôdorys", plan3d: "3D pôdorys", priceBreakdown: "Cenový rozpis konfigurácie", item: "Položka", price: "Cena", inPrice: "v cene", onRequest: "na vyžiadanie", totalPrice: "CELKOVÁ CENA s DPH", gallery: "Fotogaléria", photo: "Fotka", note: "Poznámka od klienta", additionalServices: "✨ Vybrané dodatočné služby:", realEstate: "✓ Predaj predošlej nehnuteľnosti", realEstateDesc: "Budú sa Vám venovať naši najlepší odborníci v realitách.", land: "✓ Chcem pozemok pod svoj dom", landDesc: "Pomôžeme Vám nájsť ideálny pozemok.", finance: "✓ Finančné služby - úvery/pôžičky", financeDesc: "Budú sa Vám venovať naši najlepší finančníci.", familyHouse: "Rodinný dom A0", recreational: "Rekreačná stavba", incompleteA0: "⚠️ Neúplná A0 konfigurácia", incompleteA0Desc: "Aktuálna konfigurácia spĺňa požiadavky na <strong>rekreačnú stavbu</strong>. Pre rodinný dom s certifikátom A0 je potrebné doplniť všetky povinné A0 položky.", contactUs: "Pre viac informácií nás neváhajte kontaktovať:", allRights: "Všetky práva vyhradené.", morePhotos: "ďalších fotiek", basePrice: "Základná cena domu", purposeHeader: "ÚČEL STAVBY", insulationHeader: "1. IZOLÁCIA", heatingHeader: "2. VYKUROVANIE", facadeHeader: "3. FASÁDA", roofHeader: "4. STRECHA", windowsHeader: "5. OKNÁ A DVERE", interiorHeader: "6. INTERIÉR", electricalHeader: "7. ELEKTROINŠTALÁCIA", bathroomHeader: "8. KÚPEĽŇA", foundationsHeader: "9. ZÁKLADY", engineeringHeader: "10. INŽINIERING A DOKUMENTÁCIA (A0)", realizationHeader: "11. REALIZÁCIA", servicesHeader: "DODATOČNÉ SLUŽBY" },
  en: { quote: "PRICE QUOTE", quoteNo: "Quote number:", date: "Date:", forClient: "For client", name: "Name:", email: "Email:", phone: "Phone:", city: "City:", model: "Selected house model", manufacturer: "Manufacturer:", houseType: "House type:", modules: "Modules:", rooms: "Rooms:", area: "Built area:", usable: "Usable area:", terrace: "Terrace:", buildingType: "Building type:", floorPlans: "Floor plans", plan2d: "2D floor plan", plan3d: "3D floor plan", priceBreakdown: "Configuration price breakdown", item: "Item", price: "Price", inPrice: "included", onRequest: "on request", totalPrice: "TOTAL PRICE incl. VAT", gallery: "Photo gallery", photo: "Photo", note: "Client note", additionalServices: "✨ Selected additional services:", realEstate: "✓ Sale of previous property", realEstateDesc: "Our best real estate experts will take care of you.", land: "✓ I need land for my house", landDesc: "We will help you find the ideal plot.", finance: "✓ Financial services - loans", financeDesc: "Our best financial experts will take care of you.", familyHouse: "Family house A0", recreational: "Recreational building", incompleteA0: "⚠️ Incomplete A0 configuration", incompleteA0Desc: "The current configuration meets the requirements for a <strong>recreational building</strong>. For a family house with A0 certificate, all mandatory A0 items must be added.", contactUs: "For more information, please contact us:", allRights: "All rights reserved.", morePhotos: "more photos", basePrice: "Base house price", purposeHeader: "PURPOSE", insulationHeader: "1. INSULATION", heatingHeader: "2. HEATING", facadeHeader: "3. FACADE", roofHeader: "4. ROOF", windowsHeader: "5. WINDOWS & DOORS", interiorHeader: "6. INTERIOR", electricalHeader: "7. ELECTRICAL", bathroomHeader: "8. BATHROOM", foundationsHeader: "9. FOUNDATIONS", engineeringHeader: "10. ENGINEERING & DOCUMENTATION (A0)", realizationHeader: "11. REALIZATION", servicesHeader: "ADDITIONAL SERVICES" },
  de: { quote: "PREISANGEBOT", quoteNo: "Angebotsnummer:", date: "Datum:", forClient: "Für Kunde", name: "Name:", email: "E-Mail:", phone: "Telefon:", city: "Ort:", model: "Ausgewähltes Hausmodell", manufacturer: "Hersteller:", houseType: "Haustyp:", modules: "Module:", rooms: "Zimmer:", area: "Bebaute Fläche:", usable: "Nutzfläche:", terrace: "Terrasse:", buildingType: "Gebäudetyp:", floorPlans: "Grundrisse", plan2d: "2D Grundriss", plan3d: "3D Grundriss", priceBreakdown: "Preisaufschlüsselung", item: "Position", price: "Preis", inPrice: "inklusive", onRequest: "auf Anfrage", totalPrice: "GESAMTPREIS inkl. MwSt.", gallery: "Fotogalerie", photo: "Foto", note: "Kundennotiz", additionalServices: "✨ Ausgewählte Zusatzleistungen:", realEstate: "✓ Verkauf früherer Immobilie", realEstateDesc: "Unsere besten Immobilienexperten kümmern sich um Sie.", land: "✓ Ich brauche Grundstück", landDesc: "Wir helfen Ihnen, das ideale Grundstück zu finden.", finance: "✓ Finanzdienstleistungen", financeDesc: "Unsere besten Finanzexperten kümmern sich um Sie.", familyHouse: "Familienhaus A0", recreational: "Freizeitgebäude", incompleteA0: "⚠️ Unvollständige A0-Konfiguration", incompleteA0Desc: "Die aktuelle Konfiguration erfüllt die Anforderungen für ein <strong>Freizeitgebäude</strong>.", contactUs: "Für weitere Informationen kontaktieren Sie uns:", allRights: "Alle Rechte vorbehalten.", morePhotos: "weitere Fotos", basePrice: "Grundpreis des Hauses", purposeHeader: "ZWECK", insulationHeader: "1. ISOLIERUNG", heatingHeader: "2. HEIZUNG", facadeHeader: "3. FASSADE", roofHeader: "4. DACH", windowsHeader: "5. FENSTER & TÜREN", interiorHeader: "6. INNENAUSBAU", electricalHeader: "7. ELEKTROINSTALLATION", bathroomHeader: "8. BADEZIMMER", foundationsHeader: "9. FUNDAMENT", engineeringHeader: "10. ENGINEERING & DOKUMENTATION (A0)", realizationHeader: "11. REALISIERUNG", servicesHeader: "ZUSATZLEISTUNGEN" },
  fr: { quote: "DEVIS", quoteNo: "Numéro de devis:", date: "Date:", forClient: "Pour le client", name: "Nom:", email: "E-mail:", phone: "Téléphone:", city: "Ville:", model: "Modèle de maison sélectionné", manufacturer: "Fabricant:", houseType: "Type de maison:", modules: "Modules:", rooms: "Chambres:", area: "Surface bâtie:", usable: "Surface utile:", terrace: "Terrasse:", buildingType: "Type de bâtiment:", floorPlans: "Plans d'étage", plan2d: "Plan 2D", plan3d: "Plan 3D", priceBreakdown: "Détail des prix", item: "Article", price: "Prix", inPrice: "inclus", onRequest: "sur demande", totalPrice: "PRIX TOTAL TTC", gallery: "Galerie photo", photo: "Photo", note: "Note du client", additionalServices: "✨ Services supplémentaires sélectionnés:", realEstate: "✓ Vente de bien immobilier", realEstateDesc: "Nos meilleurs experts immobiliers s'occuperont de vous.", land: "✓ J'ai besoin d'un terrain", landDesc: "Nous vous aiderons à trouver le terrain idéal.", finance: "✓ Services financiers", financeDesc: "Nos meilleurs experts financiers s'occuperont de vous.", familyHouse: "Maison familiale A0", recreational: "Bâtiment récréatif", incompleteA0: "⚠️ Configuration A0 incomplète", incompleteA0Desc: "La configuration actuelle répond aux exigences d'un <strong>bâtiment récréatif</strong>.", contactUs: "Pour plus d'informations, contactez-nous:", allRights: "Tous droits réservés.", morePhotos: "photos supplémentaires", basePrice: "Prix de base de la maison", purposeHeader: "OBJET", insulationHeader: "1. ISOLATION", heatingHeader: "2. CHAUFFAGE", facadeHeader: "3. FAÇADE", roofHeader: "4. TOITURE", windowsHeader: "5. FENÊTRES & PORTES", interiorHeader: "6. INTÉRIEUR", electricalHeader: "7. ÉLECTRICITÉ", bathroomHeader: "8. SALLE DE BAIN", foundationsHeader: "9. FONDATIONS", engineeringHeader: "10. INGÉNIERIE & DOCUMENTATION (A0)", realizationHeader: "11. RÉALISATION", servicesHeader: "SERVICES SUPPLÉMENTAIRES" },
  hu: { quote: "ÁRAJÁNLAT", quoteNo: "Ajánlat száma:", date: "Dátum:", forClient: "Ügyfél részére", name: "Név:", email: "E-mail:", phone: "Telefon:", city: "Város:", model: "Kiválasztott házmodell", manufacturer: "Gyártó:", houseType: "Háztípus:", modules: "Modulok:", rooms: "Szobák:", area: "Beépített terület:", usable: "Hasznos terület:", terrace: "Terasz:", buildingType: "Épülettípus:", floorPlans: "Alaprajzok", plan2d: "2D alaprajz", plan3d: "3D alaprajz", priceBreakdown: "Árrészletezés", item: "Tétel", price: "Ár", inPrice: "beleszámítva", onRequest: "kérésre", totalPrice: "TELJES ÁR ÁFÁ-VAL", gallery: "Fotógaléria", photo: "Fotó", note: "Ügyfél megjegyzése", additionalServices: "✨ Kiválasztott kiegészítő szolgáltatások:", realEstate: "✓ Korábbi ingatlan értékesítése", realEstateDesc: "Legjobb ingatlan szakértőink gondoskodnak Önről.", land: "✓ Telekre van szükségem", landDesc: "Segítünk megtalálni az ideális telket.", finance: "✓ Pénzügyi szolgáltatások", financeDesc: "Legjobb pénzügyi szakértőink gondoskodnak Önről.", familyHouse: "Családi ház A0", recreational: "Rekreációs épület", incompleteA0: "⚠️ Hiányos A0 konfiguráció", incompleteA0Desc: "A jelenlegi konfiguráció egy <strong>rekreációs épület</strong> követelményeinek felel meg.", contactUs: "További információkért forduljon hozzánk:", allRights: "Minden jog fenntartva.", morePhotos: "további fotó", basePrice: "Ház alapára", purposeHeader: "CÉL", insulationHeader: "1. SZIGETELÉS", heatingHeader: "2. FŰTÉS", facadeHeader: "3. HOMLOKZAT", roofHeader: "4. TETŐmunka", windowsHeader: "5. ABLAKOK & AJTÓK", interiorHeader: "6. BELSŐ TÉR", electricalHeader: "7. ELEKTROMOS", bathroomHeader: "8. FÜRDŐSZOBA", foundationsHeader: "9. ALAPOZÁS", engineeringHeader: "10. MÉRNÖKI & DOKUMENTÁCIÓ (A0)", realizationHeader: "11. MEGVALÓSÍTÁS", servicesHeader: "KIEGÉSZÍTŐ SZOLGÁLTATÁSOK" },
  pl: { quote: "OFERTA CENOWA", quoteNo: "Numer oferty:", date: "Data:", forClient: "Dla klienta", name: "Imię:", email: "E-mail:", phone: "Telefon:", city: "Miejscowość:", model: "Wybrany model domu", manufacturer: "Producent:", houseType: "Typ domu:", modules: "Moduły:", rooms: "Pokoje:", area: "Powierzchnia zabudowy:", usable: "Powierzchnia użytkowa:", terrace: "Taras:", buildingType: "Typ budynku:", floorPlans: "Rzuty", plan2d: "Rzut 2D", plan3d: "Rzut 3D", priceBreakdown: "Szczegółowy kosztorys", item: "Pozycja", price: "Cena", inPrice: "w cenie", onRequest: "na życzenie", totalPrice: "CENA CAŁKOWITA z VAT", gallery: "Galeria zdjęć", photo: "Zdjęcie", note: "Notatka klienta", additionalServices: "✨ Wybrane dodatkowe usługi:", realEstate: "✓ Sprzedaż poprzedniej nieruchomości", realEstateDesc: "Zajmą się Państwem nasi najlepsi eksperci od nieruchomości.", land: "✓ Potrzebuję działki", landDesc: "Pomożemy znaleźć idealną działkę.", finance: "✓ Usługi finansowe", financeDesc: "Zajmą się Państwem nasi najlepsi eksperci finansowi.", familyHouse: "Dom rodzinny A0", recreational: "Budynek rekreacyjny", incompleteA0: "⚠️ Niekompletna konfiguracja A0", incompleteA0Desc: "Aktualna konfiguracja spełnia wymagania dla <strong>budynku rekreacyjnego</strong>.", contactUs: "Aby uzyskać więcej informacji, skontaktuj się z nami:", allRights: "Wszelkie prawa zastrzeżone.", morePhotos: "kolejnych zdjęć", basePrice: "Cena podstawowa domu", purposeHeader: "CEL", insulationHeader: "1. IZOLACJA", heatingHeader: "2. OGRZEWANIE", facadeHeader: "3. FASADA", roofHeader: "4. DACH", windowsHeader: "5. OKNA & DRZWI", interiorHeader: "6. WNĘTRZE", electricalHeader: "7. ELEKTRYKA", bathroomHeader: "8. ŁAZIENKA", foundationsHeader: "9. FUNDAMENTY", engineeringHeader: "10. INŻYNIERING & DOKUMENTACJA (A0)", realizationHeader: "11. REALIZACJA", servicesHeader: "DODATKOWE USŁUGI" },
  uk: { quote: "ЦІНОВА ПРОПОЗИЦІЯ", quoteNo: "Номер пропозиції:", date: "Дата:", forClient: "Для клієнта", name: "Ім'я:", email: "Електронна пошта:", phone: "Телефон:", city: "Місто:", model: "Обрана модель будинку", manufacturer: "Виробник:", houseType: "Тип будинку:", modules: "Модулі:", rooms: "Кімнати:", area: "Площа забудови:", usable: "Корисна площа:", terrace: "Тераса:", buildingType: "Тип будівлі:", floorPlans: "Плани поверхів", plan2d: "2D план", plan3d: "3D план", priceBreakdown: "Детальний кошторис", item: "Позиція", price: "Ціна", inPrice: "у ціні", onRequest: "на запит", totalPrice: "ЗАГАЛЬНА ЦІНА з ПДВ", gallery: "Фотогалерея", photo: "Фото", note: "Примітка клієнта", additionalServices: "✨ Вибрані додаткові послуги:", realEstate: "✓ Продаж попередньої нерухомості", realEstateDesc: "Наші найкращі експерти з нерухомості подбають про вас.", land: "✓ Мені потрібна ділянка", landDesc: "Допоможемо знайти ідеальну ділянку.", finance: "✓ Фінансові послуги", financeDesc: "Наші найкращі фінансові експерти подбають про вас.", familyHouse: "Сімейний будинок A0", recreational: "Рекреаційна будівля", incompleteA0: "⚠️ Неповна конфігурація A0", incompleteA0Desc: "Поточна конфігурація відповідає вимогам до <strong>рекреаційної будівлі</strong>.", contactUs: "Для отримання додаткової інформації зв'яжіться з нами:", allRights: "Всі права захищені.", morePhotos: "більше фото", basePrice: "Базова ціна будинку", purposeHeader: "МЕТА", insulationHeader: "1. ІЗОЛЯЦІЯ", heatingHeader: "2. ОПАЛЕННЯ", facadeHeader: "3. ФАСАД", roofHeader: "4. ДАХ", windowsHeader: "5. ВІКНА & ДВЕРІ", interiorHeader: "6. ІНТЕР'ЄР", electricalHeader: "7. ЕЛЕКТРИКА", bathroomHeader: "8. ВАННА КІМНАТА", foundationsHeader: "9. ФУНДАМЕНТ", engineeringHeader: "10. ІНЖИНІРИНГ & ДОКУМЕНТАЦІЯ (A0)", realizationHeader: "11. РЕАЛІЗАЦІЯ", servicesHeader: "ДОДАТКОВІ ПОСЛУГИ" },
  sr: { quote: "ЦЕНОВНА ПОНУДА", quoteNo: "Број понуде:", date: "Датум:", forClient: "За клијента", name: "Ime:", email: "Е-пошта:", phone: "Телефон:", city: "Место:", model: "Одабрани модел куће", manufacturer: "Произвођач:", houseType: "Тип куће:", modules: "Модули:", rooms: "Собе:", area: "Изграђена површина:", usable: "Корисна површина:", terrace: "Тераса:", buildingType: "Тип зграде:", floorPlans: "Основе", plan2d: "2Д основа", plan3d: "3Д основа", priceBreakdown: "Детаљан распис цена", item: "Ставка", price: "Цена", inPrice: "у цени", onRequest: "на захтев", totalPrice: "УКУПНА ЦЕНА са ПДВ-ом", gallery: "Фотогалерија", photo: "Фотографија", note: "Напомена клијента", additionalServices: "✨ Одабране додатне услуге:", realEstate: "✓ Продаја претходне некретнине", realEstateDesc: "Наши стручњаци за некретнине ће се побринути за вас.", land: "✓ Треба ми парцела", landDesc: "Помоћи ћемо вам да пронађете идеалну парцелу.", finance: "✓ Финансијске услуге", financeDesc: "Наши финансијски стручњаци ће се побринути за вас.", familyHouse: "Породична кућа А0", recreational: "Рекреациона зграда", incompleteA0: "⚠️ Непотпуна А0 конфигурација", incompleteA0Desc: "Тренутна конфигурација испуњава захтеве за <strong>рекреациону зграду</strong>.", contactUs: "За више информација контактирајте нас:", allRights: "Сва права задржана.", morePhotos: "још фотографија", basePrice: "Основна цена куће", purposeHeader: "НАМЕНА", insulationHeader: "1. ИЗОЛАЦИЈА", heatingHeader: "2. ГРЕЈАЊЕ", facadeHeader: "3. ФАСАДА", roofHeader: "4. КРОВ", windowsHeader: "5. ПРОЗОРИ & ВРАТА", interiorHeader: "6. ЕНТЕРИЈЕР", electricalHeader: "7. ЕЛЕКТРИКА", bathroomHeader: "8. КУПАТИЛО", foundationsHeader: "9. ТЕМЕЉИ", engineeringHeader: "10. ИНЖЕЊЕРИНГ & ДОКУМЕНТАЦИЈА (А0)", realizationHeader: "11. РЕАЛИЗАЦИЈА", servicesHeader: "ДОДАТНЕ УСЛУГЕ" },
  hr: { quote: "CJENOVNA PONUDA", quoteNo: "Broj ponude:", date: "Datum:", forClient: "Za klijenta", name: "Ime:", email: "E-pošta:", phone: "Telefon:", city: "Grad:", model: "Odabrani model kuće", manufacturer: "Proizvođač:", houseType: "Tip kuće:", modules: "Moduli:", rooms: "Sobe:", area: "Izgrađena površina:", usable: "Korisna površina:", terrace: "Terasa:", buildingType: "Tip zgrade:", floorPlans: "Tlocrti", plan2d: "2D tlocrt", plan3d: "3D tlocrt", priceBreakdown: "Detaljan cjenovnik", item: "Stavka", price: "Cijena", inPrice: "u cijeni", onRequest: "na upit", totalPrice: "UKUPNA CIJENA s PDV-om", gallery: "Foto galerija", photo: "Fotografija", note: "Napomena klijenta", additionalServices: "✨ Odabrane dodatne usluge:", realEstate: "✓ Prodaja prethodne nekretnine", realEstateDesc: "Naši stručnjaci za nekretnine će se pobrinuti za vas.", land: "✓ Trebam parcelu", landDesc: "Pomoći ćemo vam pronaći idealnu parcelu.", finance: "✓ Financijske usluge", financeDesc: "Naši financijski stručnjaci će se pobrinuti za vas.", familyHouse: "Obiteljska kuća A0", recreational: "Rekreacijska zgrada", incompleteA0: "⚠️ Nepotpuna A0 konfiguracija", incompleteA0Desc: "Trenutna konfiguracija ispunjava zahtjeve za <strong>rekreacijsku zgradu</strong>.", contactUs: "Za više informacija kontaktirajte nas:", allRights: "Sva prava pridržana.", morePhotos: "još fotografija", basePrice: "Osnovna cijena kuće", purposeHeader: "NAMJENA", insulationHeader: "1. IZOLACIJA", heatingHeader: "2. GRIJANJE", facadeHeader: "3. FASADA", roofHeader: "4. KROV", windowsHeader: "5. PROZORI & VRATA", interiorHeader: "6. ENTERIJER", electricalHeader: "7. ELEKTRIKA", bathroomHeader: "8. KUPAONICA", foundationsHeader: "9. TEMELJI", engineeringHeader: "10. INŽENJERING & DOKUMENTACIJA (A0)", realizationHeader: "11. REALIZACIJA", servicesHeader: "DODATNE USLUGE" },
  el: { quote: "ΠΡΟΣΦΟΡΑ ΤΙΜΗΣ", quoteNo: "Αριθμός προσφοράς:", date: "Ημερομηνία:", forClient: "Για πελάτη", name: "Όνομα:", email: "Email:", phone: "Τηλέφωνο:", city: "Πόλη:", model: "Επιλεγμένο μοντέλο σπιτιού", manufacturer: "Κατασκευαστής:", houseType: "Τύπος σπιτιού:", modules: "Μονάδες:", rooms: "Δωμάτια:", area: "Δομημένη επιφάνεια:", usable: "Χρήσιμη επιφάνεια:", terrace: "Βεράντα:", buildingType: "Τύπος κτιρίου:", floorPlans: "Κατόψεις", plan2d: "2D κάτοψη", plan3d: "3D κάτοψη", priceBreakdown: "Ανάλυση τιμών", item: "Στοιχείο", price: "Τιμή", inPrice: "συμπεριλαμβάνεται", onRequest: "κατόπιν αιτήματος", totalPrice: "ΣΥΝΟΛΙΚΗ ΤΙΜΗ με ΦΠΑ", gallery: "Φωτογραφική γκαλερί", photo: "Φωτογραφία", note: "Σημείωση πελάτη", additionalServices: "✨ Επιλεγμένες πρόσθετες υπηρεσίες:", realEstate: "✓ Πώληση προηγούμενης ιδιοκτησίας", realEstateDesc: "Οι καλύτεροι ειδικοί μας θα φροντίσουν για εσάς.", land: "✓ Χρειάζομαι οικόπεδο", landDesc: "Θα σας βοηθήσουμε να βρείτε το ιδανικό οικόπεδο.", finance: "✓ Χρηματοοικονομικές υπηρεσίες", financeDesc: "Οι καλύτεροι οικονομικοί μας ειδικοί θα φροντίσουν για εσάς.", familyHouse: "Οικογενειακή κατοικία A0", recreational: "Ψυχαγωγικό κτίριο", incompleteA0: "⚠️ Ελλιπής διαμόρφωση A0", incompleteA0Desc: "Η τρέχουσα διαμόρφωση πληροί τις απαιτήσεις για <strong>ψυχαγωγικό κτίριο</strong>.", contactUs: "Για περισσότερες πληροφορίες επικοινωνήστε μαζί μας:", allRights: "Όλα τα δικαιώματα διατηρούνται.", morePhotos: "περισσότερες φωτογραφίες", basePrice: "Βασική τιμή σπιτιού", purposeHeader: "ΣΚΟΠΟΣ", insulationHeader: "1. ΜΟΝΩΣΗ", heatingHeader: "2. ΘΕΡΜΑΝΣΗ", facadeHeader: "3. ΠΡΟΣΟΨΗ", roofHeader: "4. ΣΤΕΓΗ", windowsHeader: "5. ΠΑΡΑΘΥΡΑ & ΠΟΡΤΕΣ", interiorHeader: "6. ΕΣΩΤΕΡΙΚΟ", electricalHeader: "7. ΗΛΕΚΤΡΟΛΟΓΙΚΑ", bathroomHeader: "8. ΜΠΑΝΙΟ", foundationsHeader: "9. ΘΕΜΕΛΙΑ", engineeringHeader: "10. ΜΗΧΑΝΙΚΗ & ΤΕΚΜΗΡΙΩΣΗ (A0)", realizationHeader: "11. ΥΛΟΠΟΙΗΣΗ", servicesHeader: "ΠΡΟΣΘΕΤΕΣ ΥΠΗΡΕΣΙΕΣ" }
};

function t(lang, key) {
  return TR[lang]?.[key] || TR['sk']?.[key] || key;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Skús načítať používateľa, ale nie je povinný (pre verejných návštevníkov)
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }

    const { dom, konfiguraciaData, klientData, language = 'sk' } = await req.json();
    const lang = language || 'sk';
    const dateLocale = lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'hu' ? 'hu-HU' : lang === 'pl' ? 'pl-PL' : lang === 'uk' ? 'uk-UA' : lang === 'sr' ? 'sr-RS' : lang === 'hr' ? 'hr-HR' : lang === 'el' ? 'el-GR' : 'sk-SK';

    // Načítaj nastavenie cenovej ponuky
    const nastavenia = await base44.asServiceRole.entities.NastavenieCenovejPonuky.list();
    const aktivneNastavenie = nastavenia.find(n => n.aktivne) || nastavenia[0];

    // Generuj unikátne číslo ponuky
    const rok = new Date().getFullYear();
    let pocitadlo = await base44.asServiceRole.entities.PocitadloCenovychPonuk.filter({ rok });

    if (!pocitadlo || pocitadlo.length === 0) {
      pocitadlo = await base44.asServiceRole.entities.PocitadloCenovychPonuk.create({ rok, posledne_cislo: 1 });
    } else {
      pocitadlo = pocitadlo[0];
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.update(pocitadlo.id, { 
        posledne_cislo: pocitadlo.posledne_cislo + 1 
      });
      pocitadlo.posledne_cislo += 1;
    }

    const cisloPonuky = `CP-${rok}-${String(pocitadlo.posledne_cislo).padStart(4, '0')}`;

    // Identifikácia typu stavby
    const isA0Configuration = () => {
      return (
        konfiguraciaData.izolaciaStien === "250mm" &&
        konfiguraciaData.izolaciaPodlahy === "200mm" &&
        konfiguraciaData.izolaciaStropu === "200mm" &&
        konfiguraciaData.tepelneCerpadlo === "ano" &&
        konfiguraciaData.rekuperacia === "ano" &&
        konfiguraciaData.elektro === "ge" &&
        konfiguraciaData.bleskozvod &&
        konfiguraciaData.prepat &&
        konfiguraciaData.inziniering &&
        konfiguraciaData.projektACertifikacia
      );
    };

    const isA0 = isA0Configuration();
    const typStavby = konfiguraciaData.ucel === "rodinny" && isA0 
      ? t(lang, 'familyHouse')
      : t(lang, 'recreational');

    const formatPrice = (price) => {
      const num = typeof price === 'number' ? price : parseFloat(price);
      const parts = num.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join(',') + ' €';
    };

    // Cenník
    const CENY = {
      izolacia_stien_200mm: 1799.16,
      izolacia_stien_250mm: 1558.17,
      izolacia_podlahy_200mm: 334.08,
      izolacia_stropu_200mm: 271.44,
      tepelne_cerpadlo: 2889.27,
      pripravaNaRekuperaciu: 512,
      rekuperacia: 1155.36,
      podlahove_kurenie: 2253.30,
      klimatizacia: 902,
      pripravaKrb: 578.55,
      ochranaKachle: 1279.77,
      fasada_omietka: 1580.79,
      fasada_smrekovec: 3349.50,
      fasada_falcovane: 4953.78,
      fasada_thermowood: 6677.25,
      strecha_falcovane: 3227.70,
      odkvapy: 1502.49,
      dvere_kovove: 278.40,
      obklad_sadrokarton: 7855,
      obklad_osb: 5279,
      dvere_posuvne: 427.17,
      elektro_cz: 460.23,
      elektro_ge: 1583.40,
      bleskozvod: 856.08,
      prepat: 311.46,
      pripravaNaSolarnePanely: 1305,
      sprchovyKut: 645.54,
      vana: 501.12,
      bateria: 139.20,
      skrinka: 434.13,
      strop_kupelna_sadrokarton: 0,
      inziniering: 2773.56,
      projektACertifikacia: 3745.35,
      revizia: 1605.15,
      zaklady_vruty: 4494.42,
      zaklady_patky: 2568.24,
      zaklady_pasove: 11825.04,
      montaz: 4805.88,
      doprava: 8927.94
    };

    // Získaj galérie
    const getMatchedGalleries = () => {
      if (!dom?.galerie) return [];
      
      const matchedGalleries = [];
      
      if (!aktivneNastavenie?.mapovanie_fotiek_ticabhouse || aktivneNastavenie.mapovanie_fotiek_ticabhouse.length === 0) {
        if (konfiguraciaData.fasada === "omietka") {
          const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
          if (murovkaGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
          }
        } else {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Exteriér - Drevo/Plech", fotky: drevoGaleria.fotky });
          }
        }
        
        if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") {
          const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
          if (sadroGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Interiér - Sadrokartón", fotky: sadroGaleria.fotky });
          }
        } else if (konfiguraciaData.obkladStien === "smrek_8cm" || konfiguraciaData.obkladStien === "smrek_bez_uzlov") {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Interiér - Drevo", fotky: drevoGaleria.fotky });
          }
        }
        
        return matchedGalleries;
      }
      
      aktivneNastavenie.mapovanie_fotiek_ticabhouse.forEach(mapping => {
        const isActive = mapping.dlazdice_ids?.some(dlazdicaId => {
          if (dlazdicaId === "fasada_omietka" && konfiguraciaData.fasada === "omietka") return true;
          if (dlazdicaId === "fasada_smrekovec" && konfiguraciaData.fasada === "smrekovec") return true;
          if (dlazdicaId === "fasada_falcovane" && konfiguraciaData.fasada === "falcovane") return true;
          if (dlazdicaId === "fasada_thermowood" && konfiguraciaData.fasada === "thermowood") return true;
          if (dlazdicaId === "obklad_sadrokarton_tapeta" && konfiguraciaData.obkladStien === "sadrokarton_tapeta") return true;
          if (dlazdicaId === "obklad_smrek_bez_uzlov" && (konfiguraciaData.obkladStien === "smrek_bez_uzlov" || konfiguraciaData.obkladStien === "smrek_8cm")) return true;
          return false;
        });

        if (isActive) {
          const galeria = dom.galerie?.find(g => g.typ === mapping.galeria_typ);
          if (galeria && galeria.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: mapping.galeria_nazov || galeria.nazov,
              fotky: galeria.fotky
            });
          }
        }
      });

      const maExterierovaGaleria = matchedGalleries.some(g => g.nazov && g.nazov.includes("Exteriér"));
      if (!maExterierovaGaleria) {
        if (konfiguraciaData.fasada === "omietka") {
          const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
          if (murovkaGaleria?.fotky?.length > 0) {
            matchedGalleries.unshift({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
          }
        } else {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.unshift({ nazov: "Exteriér - Drevo/Plech", fotky: drevoGaleria.fotky });
          }
        }
      }

      return matchedGalleries;
    };

    const matchedGalleries = getMatchedGalleries();

    // Určiť ktorý obrázok zobraziť
    const getDisplayImage = () => {
      if (konfiguraciaData.fasada === "omietka") {
        return dom?.hlavny_obrazok;
      }
      return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
    };

    // Vytvor HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(lang, 'quote')} ${cisloPonuky}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 40px 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header-info { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; }
    .company-info { text-align: right; font-size: 12px; line-height: 1.6; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { color: #EF4444; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #EF4444; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f9fafb; padding: 20px; border-radius: 8px; }
    .info-item { font-size: 13px; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-value { color: #111827; font-weight: 600; margin-top: 3px; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 8px; }
    .badge.blue { background: #3b82f6; }
    .image-container { position: relative; margin: 20px 0; border-radius: 8px; overflow: hidden; }
    .image-container img { width: 100%; height: auto; display: block; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.3); font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none; }
    .price-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .price-table th { background: #EF4444; color: white; padding: 12px; text-align: left; font-size: 13px; }
    .price-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .price-table tr:nth-child(even) { background: #f9fafb; }
    .price-table .category { background: #f3f4f6; font-weight: bold; color: #EF4444; }
    .price-table .strikethrough { color: #9ca3af; text-decoration: line-through; }
    .total-price { background: #EF4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .total-price .label { font-size: 14px; opacity: 0.9; }
    .total-price .amount { font-size: 36px; font-weight: bold; margin-top: 5px; }
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .gallery-item { position: relative; border-radius: 8px; overflow: hidden; }
    .gallery-item img { width: 100%; height: auto; object-fit: cover; min-height: 200px; max-height: 400px; }
    .gallery-caption { background: #f3f4f6; padding: 8px; text-align: center; font-size: 11px; color: #6b7280; }
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .highlight-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .highlight-box.green { background: #d1fae5; border-left-color: #10b981; }
    .highlight-box.yellow { background: #fef3c7; border-left-color: #f59e0b; }
    .service-item { background: #f0f9ff; border: 2px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 8px 0; }
    .service-item.selected { background: #dbeafe; border-color: #2563eb; }
    .service-item .title { font-weight: bold; color: #1e40af; margin-bottom: 4px; }
    .service-item .desc { font-size: 12px; color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png" alt="American Living" style="height: 60px; margin-bottom: 15px;">
      <div class="header-info">
        <div>
          <h1>${t(lang, 'quote')}</h1>
          <p style="margin: 5px 0;">${t(lang, 'quoteNo')} <strong>${cisloPonuky}</strong></p>
          <p style="margin: 5px 0;">${t(lang, 'date')} ${new Date().toLocaleDateString(dateLocale)}</p>
        </div>
        <div class="company-info">
          <strong style="font-size: 14px;">American Living</strong><br>
          +421 905 138 124<br>
          info@americanliving.sk<br>
          www.americanliving.sk
        </div>
      </div>
    </div>

    <div class="content">
      <!-- Klient info -->
      ${klientData.meno ? `
      <div class="section">
        <h2 class="section-title">${t(lang, 'forClient')}</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">${t(lang, 'name')}</div>
            <div class="info-value">${klientData.meno}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t(lang, 'email')}</div>
            <div class="info-value">${klientData.email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t(lang, 'phone')}</div>
            <div class="info-value">${klientData.telefon}</div>
          </div>
          ${klientData.obec ? `
          <div class="info-item">
            <div class="info-label">${t(lang, 'city')}</div>
            <div class="info-value">${klientData.obec}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Vybraný model -->
      <div class="section">
        <h2 class="section-title">${t(lang, 'model')}</h2>
        
        <div class="image-container">
          <img src="${getDisplayImage()}" alt="${dom?.nazov || 'Dom'}" style="max-height: 400px; object-fit: contain; background: #f9fafb;">
          <div class="watermark">American Living</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Model:</div>
            <div class="info-value" style="font-size: 18px;">${dom?.nazov || 'Lyon 50m²'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t(lang, 'manufacturer')}</div>
            <div class="info-value">${dom?.vyrobca || 'Ticab house'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">${t(lang, 'houseType')}</div>
            <div class="info-value">${dom?.typ_domu || 'Modulárny dom'}</div>
          </div>
          ${dom?.pocet_modulov ? `
          <div class="info-item">
            <div class="info-label">${t(lang, 'modules')}</div>
            <div class="info-value">${dom.pocet_modulov}</div>
          </div>
          ` : ''}
          ${dom?.pocet_izieb ? `
          <div class="info-item">
            <div class="info-label">${t(lang, 'rooms')}</div>
            <div class="info-value">max. ${dom.pocet_izieb}</div>
          </div>
          ` : ''}
          <div class="info-item">
            <div class="info-label">${t(lang, 'area')}</div>
            <div class="info-value">${dom?.zastavana_plocha || 50} m²</div>
          </div>
          ${dom?.uzitkova_plocha ? `
          <div class="info-item">
            <div class="info-label">${t(lang, 'usable')}</div>
            <div class="info-value">${dom.uzitkova_plocha} m²</div>
          </div>
          ` : ''}
          ${dom?.terasa_plocha ? `
          <div class="info-item">
            <div class="info-label">${t(lang, 'terrace')}</div>
            <div class="info-value">${dom.terasa_plocha} m²</div>
          </div>
          ` : ''}
        </div>

        <div class="${isA0 ? 'badge' : 'badge blue'}" style="display: block; text-align: center; margin-top: 15px;">
          ${t(lang, 'buildingType')} ${typStavby}
        </div>
      </div>

      <!-- Pôdorysy -->
      ${(dom?.podorys_2d || dom?.podorys_3d) ? `
      <div class="section">
        <h2 class="section-title">${t(lang, 'floorPlans')}</h2>
        <div class="gallery">
          ${dom?.podorys_2d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_2d}" alt="${t(lang, 'plan2d')}" style="height: 300px; object-fit: contain; background: #f9fafb; width: 100%;">
              <div class="watermark">American Living</div>
            </div>
            <div class="gallery-caption">${t(lang, 'plan2d')}</div>
          </div>
          ` : ''}
          ${dom?.podorys_3d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_3d}" alt="${t(lang, 'plan3d')}" style="height: 300px; object-fit: contain; background: #f9fafb; width: 100%;">
              <div class="watermark">American Living</div>
            </div>
            <div class="gallery-caption">${t(lang, 'plan3d')}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Cenový rozpis -->
      <div class="section">
        <h2 class="section-title">${t(lang, 'priceBreakdown')}</h2>
        
        <table class="price-table">
          <thead>
            <tr>
              <th>${t(lang, 'item')}</th>
              <th style="text-align: right;">${t(lang, 'price')}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="category"><td colspan="2">${t(lang, 'purposeHeader')}</td></tr>
            <tr class="${konfiguraciaData.ucel !== 'chata' ? 'strikethrough' : ''}">
              <td>• ${t(lang, 'recreational')}</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.ucel !== 'rodinny' ? 'strikethrough' : ''}">
              <td>• ${t(lang, 'familyHouse')}</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'insulationHeader')}</td></tr>
            <tr><td style="font-weight: 600;">${t(lang, 'basePrice')}</td><td style="text-align: right; font-weight: 600;">${formatPrice(dom?.zakladna_cena || 0)}</td></tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '150mm' ? 'strikethrough' : ''}">
              <td>• Insulation walls 150mm</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '200mm' ? 'strikethrough' : ''}">
              <td>• Insulation walls 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stien_200mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '250mm' ? 'strikethrough' : ''}">
              <td>• Insulation walls 250mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stien_250mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaPodlahy !== '150mm' ? 'strikethrough' : ''}">
              <td>• Insulation floor 150mm</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaPodlahy !== '200mm' ? 'strikethrough' : ''}">
              <td>• Insulation floor 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_podlahy_200mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStropu !== '150mm' ? 'strikethrough' : ''}">
              <td>• Insulation ceiling 150mm</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStropu !== '200mm' ? 'strikethrough' : ''}">
              <td>• Insulation ceiling 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stropu_200mm)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'heatingHeader')}</td></tr>
            <tr class="${konfiguraciaData.tepelneCerpadlo !== 'nie' ? 'strikethrough' : ''}">
              <td>• Heating preparation</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.tepelneCerpadlo !== 'ano' ? 'strikethrough' : ''}">
              <td>• Heat pump</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.tepelne_cerpadlo)}</td>
            </tr>
            <tr class="${konfiguraciaData.rekuperacia === 'ano' || konfiguraciaData.pripravaNaRekuperaciu ? 'strikethrough' : ''}">
              <td>• Without recuperation</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaRekuperaciu ? 'strikethrough' : ''}">
              <td>• Recuperation preparation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaNaRekuperaciu)}</td>
            </tr>
            <tr class="${konfiguraciaData.rekuperacia !== 'ano' ? 'strikethrough' : ''}">
              <td>• Recuperation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.rekuperacia)}</td>
            </tr>
            <tr class="${!konfiguraciaData.podlahovoKurenie ? 'strikethrough' : ''}">
              <td>• Floor heating</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.podlahove_kurenie)}</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaKrb ? 'strikethrough' : ''}">
              <td>• Fireplace preparation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaKrb)}</td>
            </tr>
            <tr class="${!konfiguraciaData.ochranaKachle ? 'strikethrough' : ''}">
              <td>• Stove protection</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.ochranaKachle)}</td>
            </tr>
            <tr class="${!konfiguraciaData.klimatizacia ? 'strikethrough' : ''}">
              <td>• Air conditioning preparation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.klimatizacia)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'facadeHeader')}</td></tr>
            <tr class="${konfiguraciaData.fasada !== 'drevo_smrek' ? 'strikethrough' : ''}">
              <td>• Facade - spruce wood</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'omietka' ? 'strikethrough' : ''}">
              <td>• Facade - stucco plaster</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_omietka)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'smrekovec' ? 'strikethrough' : ''}">
              <td>• Facade - larch</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_smrekovec)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'falcovane' ? 'strikethrough' : ''}">
              <td>• Facade - folded panels</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_falcovane)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'thermowood' ? 'strikethrough' : ''}">
              <td>• Facade - thermowood</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_thermowood)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'roofHeader')}</td></tr>
            <tr class="${konfiguraciaData.strecha !== 'korugovan_plech' ? 'strikethrough' : ''}">
              <td>• Roof - corrugated metal</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.strecha !== 'falcovane' ? 'strikethrough' : ''}">
              <td>• Roof - folded panels</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.strecha_falcovane)}</td>
            </tr>
            <tr class="${konfiguraciaData.odkvapy !== 'nie' ? 'strikethrough' : ''}">
              <td>• Without gutters</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.odkvapy !== 'ano' ? 'strikethrough' : ''}">
              <td>• Gutters</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.odkvapy)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'windowsHeader')}</td></tr>
            <tr class="${konfiguraciaData.okna !== 'biele' ? 'strikethrough' : ''}">
              <td>• Windows - white 3-glass</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.okna !== 'antracit' ? 'strikethrough' : ''}">
              <td>• Windows - anthracite 3-glass</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.okna !== 'hnede' ? 'strikethrough' : ''}">
              <td>• Windows - brown 3-glass</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.vchodoveDvere !== 'plastove' ? 'strikethrough' : ''}">
              <td>• Entry door - plastic/metal</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.vchodoveDvere !== 'kovove' ? 'strikethrough' : ''}">
              <td>• Entry door - metal</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.dvere_kovove)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'interiorHeader')}</td></tr>
            <tr class="${konfiguraciaData.obkladStien !== 'smrek_8cm' ? 'strikethrough' : ''}">
              <td>• Cladding - spruce 8cm</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'smrek_bez_uzlov' ? 'strikethrough' : ''}">
              <td>• Cladding - spruce no-knots</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'sadrokarton_tapeta' ? 'strikethrough' : ''}">
              <td>• Cladding - drywall + wallpaper</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.obklad_sadrokarton)}</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'osb_panel' ? 'strikethrough' : ''}">
              <td>• Cladding - OSB panel</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.obklad_osb)}</td>
            </tr>
            <tr>
              <td>• Floor - laminate</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.interieroveDvere !== 'kridlove' ? 'strikethrough' : ''}">
              <td>• Interior doors - hinged</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.interieroveDvere !== 'posuvne' ? 'strikethrough' : ''}">
              <td>• Interior doors - sliding</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.dvere_posuvne)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'electricalHeader')}</td></tr>
            <tr class="${konfiguraciaData.elektro !== 'eu' ? 'strikethrough' : ''}">
              <td>• Electrical - EU standard</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.elektro !== 'cz' ? 'strikethrough' : ''}">
              <td>• Electrical - CZ/SK standard</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.elektro_cz)}</td>
            </tr>
            <tr class="${konfiguraciaData.elektro !== 'ge' ? 'strikethrough' : ''}">
              <td>• Electrical - GE standard (A0)</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.elektro_ge)}</td>
            </tr>
            <tr class="${!konfiguraciaData.bleskozvod ? 'strikethrough' : ''}">
              <td>• Lightning rod</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.bleskozvod)}</td>
            </tr>
            <tr class="${!konfiguraciaData.prepat ? 'strikethrough' : ''}">
              <td>• Surge protection</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.prepat)}</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaSolarnePanely ? 'strikethrough' : ''}">
              <td>• Solar panel preparation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaNaSolarnePanely)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'bathroomHeader')}</td></tr>
            <tr class="${konfiguraciaData.sprchovyKut !== 'standard' ? 'strikethrough' : ''}">
              <td>• Shower + WC Geberit</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.sprchovyKut !== 'radaway' ? 'strikethrough' : ''}">
              <td>• Shower cabin Radaway</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.sprchovyKut)}</td>
            </tr>
            <tr class="${konfiguraciaData.bateria !== 'standard' ? 'strikethrough' : ''}">
              <td>• Faucet - standard</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.bateria !== 'grohe' ? 'strikethrough' : ''}">
              <td>• Faucet - Grohe</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.bateria)}</td>
            </tr>
            <tr class="${konfiguraciaData.stropKupelna !== 'drevo' ? 'strikethrough' : ''}">
              <td>• Bathroom ceiling - wood</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.stropKupelna !== 'sadrokarton' ? 'strikethrough' : ''}">
              <td>• Bathroom ceiling - drywall</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${!konfiguraciaData.vana ? 'strikethrough' : ''}">
              <td>• Bathtub</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.vana)}</td>
            </tr>
            <tr class="${!konfiguraciaData.skrinka ? 'strikethrough' : ''}">
              <td>• Cabinet</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.skrinka)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'foundationsHeader')}</td></tr>
            <tr class="${konfiguraciaData.zaklady !== 'bez' ? 'strikethrough' : ''}">
              <td>• Without foundations</td>
              <td style="text-align: right;">${t(lang, 'inPrice')}</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'vruty' ? 'strikethrough' : ''}">
              <td>• Foundations - ground screws</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_vruty)}</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'patky' ? 'strikethrough' : ''}">
              <td>• Foundations - concrete pads</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_patky)}</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'pasove' ? 'strikethrough' : ''}">
              <td>• Foundations - strip concrete</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_pasove)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'engineeringHeader')}</td></tr>
            <tr class="${!konfiguraciaData.inziniering ? 'strikethrough' : ''}">
              <td>• Engineering</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.inziniering)}</td>
            </tr>
            <tr class="${!konfiguraciaData.projektACertifikacia ? 'strikethrough' : ''}">
              <td>• Project + A0 Certification</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.projektACertifikacia)}</td>
            </tr>
            <tr class="${!konfiguraciaData.revizia ? 'strikethrough' : ''}">
              <td>• Revision documentation</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.revizia)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'realizationHeader')}</td></tr>
            <tr class="${!konfiguraciaData.montaz ? 'strikethrough' : ''}">
              <td>• House assembly</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.montaz)}</td>
            </tr>

            <tr class="category"><td colspan="2">${t(lang, 'servicesHeader')}</td></tr>
            <tr class="${!konfiguraciaData.predajNehnutelnosti ? 'strikethrough' : ''}">
              <td>• ${t(lang, 'realEstate')}</td>
              <td style="text-align: right;">${t(lang, 'onRequest')}</td>
            </tr>
            <tr class="${!konfiguraciaData.chcemPozemok ? 'strikethrough' : ''}">
              <td>• ${t(lang, 'land')}</td>
              <td style="text-align: right;">${t(lang, 'onRequest')}</td>
            </tr>
            <tr class="${!konfiguraciaData.financneSluzby ? 'strikethrough' : ''}">
              <td>• ${t(lang, 'finance')}</td>
              <td style="text-align: right;">${t(lang, 'onRequest')}</td>
            </tr>
          </tbody>
        </table>

        <!-- Vybrané dodatočné služby - detail -->
        ${(konfiguraciaData.predajNehnutelnosti || konfiguraciaData.chcemPozemok || konfiguraciaData.financneSluzby) ? `
        <div class="highlight-box">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 15px;">${t(lang, 'additionalServices')}</h3>
          ${konfiguraciaData.predajNehnutelnosti ? `
          <div class="service-item selected">
            <div class="title">${t(lang, 'realEstate')}</div>
            <div class="desc">${t(lang, 'realEstateDesc')}</div>
          </div>
          ` : ''}
          ${konfiguraciaData.chcemPozemok ? `
          <div class="service-item selected">
            <div class="title">${t(lang, 'land')}</div>
            <div class="desc">${t(lang, 'landDesc')}</div>
          </div>
          ` : ''}
          ${konfiguraciaData.financneSluzby ? `
          <div class="service-item selected">
            <div class="title">${t(lang, 'finance')}</div>
            <div class="desc">${t(lang, 'financeDesc')}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>

      <!-- Celková cena -->
      <div class="total-price">
        <div class="label">${t(lang, 'totalPrice')}</div>
        <div class="amount">${formatPrice(konfiguraciaData.totalPrice)}</div>
      </div>

      <!-- Fotogalérie -->
      ${matchedGalleries.length > 0 ? `
      <div class="section">
        <h2 class="section-title">${t(lang, 'gallery')}</h2>
        ${matchedGalleries.map(galeria => `
          <h3 style="color: #374151; font-size: 15px; margin: 20px 0 10px 0;">${galeria.nazov}</h3>
          <div class="gallery">
            ${galeria.fotky.slice(0, 6).map((img, idx) => `
            <div class="gallery-item">
              <div style="position: relative;">
                <img src="${img}" alt="${galeria.nazov} ${idx + 1}">
                <div class="watermark" style="font-size: 24px;">American Living</div>
              </div>
              <div class="gallery-caption">${galeria.nazov} - ${t(lang, 'photo')} ${idx + 1}</div>
            </div>
            `).join('')}
          </div>
          ${galeria.fotky.length > 6 ? `<p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 10px;">+ ${galeria.fotky.length - 6} ${t(lang, 'morePhotos')}</p>` : ''}
        `).join('')}
      </div>
      ` : ''}

      <!-- Poznámka -->
      ${klientData.poznamka ? `
      <div class="section">
        <h2 class="section-title">${t(lang, 'note')}</h2>
        <div class="highlight-box yellow">
          <p style="margin: 0; line-height: 1.6;">${klientData.poznamka.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      <!-- Upozornenie pre neúplnú A0 -->
      ${konfiguraciaData.ucel === "rodinny" && !isA0 ? `
      <div class="highlight-box yellow">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">${t(lang, 'incompleteA0')}</h3>
        <p style="margin: 0; line-height: 1.6; color: #78350f;">${t(lang, 'incompleteA0Desc')}</p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 10px 0;">${t(lang, 'contactUs')}</p>
      <p style="margin: 10px 0;">
        <strong>${t(lang, 'phone')}</strong> <a href="tel:+421905138124">+421 905 138 124</a><br>
        <strong>${t(lang, 'email')}</strong> <a href="mailto:info@americanliving.sk">info@americanliving.sk</a><br>
        <strong>Web:</strong> <a href="https://www.americanliving.sk">www.americanliving.sk</a>
      </p>
      <p style="margin: 20px 0 10px 0; color: #6b7280; font-size: 11px;">
        &copy; ${new Date().getFullYear()} American Living. ${t(lang, 'allRights')}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    console.log('📧 Posielam email klientovi:', klientData.email);
    
    // Odošli email klientovi
    const response1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'American Living <info@americanliving.sk>',
        to: klientData.email,
        subject: `Cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon 50m²'} - American Living`,
        html: htmlEmail
      })
    });
    
    const result1 = await response1.json();
    console.log('✅ Email klientovi:', result1);
    
    if (!response1.ok) {
      console.error('❌ Chyba pri odosielaní emailu klientovi:', result1);
      throw new Error(`Failed to send email to client: ${result1.message || 'Unknown error'}`);
    }
    
    console.log('📧 Posielam kópiu na firemný email: info.americanliving@gmail.com');
    
    // Odošli ROVNAKÚ ponuku na firemný email
    const response2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'American Living <info@americanliving.sk>',
        to: 'info.americanliving@gmail.com',
        subject: `[KÓPIA] Cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon'} - ${klientData.meno}`,
        html: `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">📋 Interná kópia cenovej ponuky</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Klient:</strong> ${klientData.meno}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${klientData.email}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Telefón:</strong> ${klientData.telefon}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Celková cena:</strong> ${formatPrice(konfiguraciaData.totalPrice)}</p>
          </div>
          ${htmlEmail}
        `
      })
    });
    
    const result2 = await response2.json();
    console.log('✅ Email na firemný email:', result2);
    
    if (!response2.ok) {
      console.error('❌ Chyba pri odosielaní kópie na firemný email:', result2);
    }

    // Ulož do databázy
    const polozky = [];
    
    // Vytvor zoznam položiek
    polozky.push({ nazov: 'Základná cena domu', cena: dom?.zakladna_cena || 0, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStien === "200mm") polozky.push({ nazov: 'Izolácia stien 200mm', cena: CENY.izolacia_stien_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStien === "250mm") polozky.push({ nazov: 'Izolácia stien 250mm', cena: CENY.izolacia_stien_250mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaPodlahy === "200mm") polozky.push({ nazov: 'Izolácia podlahy 200mm', cena: CENY.izolacia_podlahy_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStropu === "200mm") polozky.push({ nazov: 'Izolácia stropu 200mm', cena: CENY.izolacia_stropu_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.tepelneCerpadlo === "ano") polozky.push({ nazov: 'Tepelné čerpadlo', cena: CENY.tepelne_cerpadlo, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.rekuperacia === "ano") polozky.push({ nazov: 'Rekuperácia', cena: CENY.rekuperacia, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.pripravaNaRekuperaciu) polozky.push({ nazov: 'Príprava na rekuperáciu', cena: CENY.pripravaNaRekuperaciu, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.podlahovoKurenie) polozky.push({ nazov: 'Podlahové kúrenie', cena: CENY.podlahove_kurenie, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.klimatizacia) polozky.push({ nazov: 'Príprava na klimatizáciu', cena: CENY.klimatizacia, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.pripravaNaKrb) polozky.push({ nazov: 'Príprava na krb', cena: CENY.pripravaKrb, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.ochranaKachle) polozky.push({ nazov: 'Ochrana kachle', cena: CENY.ochranaKachle, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.fasada !== "drevo_smrek") {
      const fasadaNazov = konfiguraciaData.fasada === "omietka" ? "Šúchaná omietka" :
        konfiguraciaData.fasada === "smrekovec" ? "Smrekovec" :
        konfiguraciaData.fasada === "falcovane" ? "Falcované panely" : "Thermowood";
      polozky.push({ nazov: `Fasáda - ${fasadaNazov}`, cena: CENY[`fasada_${konfiguraciaData.fasada}`], vybrane: true, kategoria: 'Fasáda' });
    }
    if (konfiguraciaData.strecha === "falcovane") polozky.push({ nazov: 'Strecha - falcované panely', cena: CENY.strecha_falcovane, vybrane: true, kategoria: 'Strecha' });
    if (konfiguraciaData.odkvapy === "ano") polozky.push({ nazov: 'Odkvapy', cena: CENY.odkvapy, vybrane: true, kategoria: 'Strecha' });
    if (konfiguraciaData.vchodoveDvere === "kovove") polozky.push({ nazov: 'Vchodové dvere - kovové', cena: CENY.dvere_kovove, vybrane: true, kategoria: 'Okná a dvere' });
    if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") polozky.push({ nazov: 'Obklad - sadrokartón + tapeta', cena: CENY.obklad_sadrokarton, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.obkladStien === "osb_panel") polozky.push({ nazov: 'Obklad - OSB panel', cena: CENY.obklad_osb, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.interieroveDvere === "posuvne") polozky.push({ nazov: 'Interiérové dvere - posuvné', cena: CENY.dvere_posuvne, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.elektro === "cz") polozky.push({ nazov: 'Elektro - CZ/SK štandard', cena: CENY.elektro_cz, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.elektro === "ge") polozky.push({ nazov: 'Elektro - GE štandard (A0)', cena: CENY.elektro_ge, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.bleskozvod) polozky.push({ nazov: 'Bleskozvod', cena: CENY.bleskozvod, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.prepat) polozky.push({ nazov: 'Prepäťová ochrana', cena: CENY.prepat, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.pripravaNaSolarnePanely) polozky.push({ nazov: 'Príprava na solárne panely', cena: CENY.pripravaNaSolarnePanely, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.sprchovyKut === "radaway") polozky.push({ nazov: 'Sprchový kút Radaway', cena: CENY.sprchovyKut, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.vana) polozky.push({ nazov: 'Vaňa', cena: CENY.vana, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.bateria === "grohe") polozky.push({ nazov: 'Batéria - Grohe', cena: CENY.bateria, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.skrinka) polozky.push({ nazov: 'Skrinka', cena: CENY.skrinka, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.zaklady === "vruty") polozky.push({ nazov: 'Základy - zemné vruty', cena: CENY.zaklady_vruty, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.zaklady === "patky") polozky.push({ nazov: 'Základy - betónové pätky', cena: CENY.zaklady_patky, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.zaklady === "pasove") polozky.push({ nazov: 'Základy - pásové betónové', cena: CENY.zaklady_pasove, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.inziniering) polozky.push({ nazov: 'Inžiniering', cena: CENY.inziniering, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.projektACertifikacia) polozky.push({ nazov: 'Projekt + Certifikácia A0', cena: CENY.projektACertifikacia, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.revizia) polozky.push({ nazov: 'Revízna dokumentácia', cena: CENY.revizia, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.montaz) polozky.push({ nazov: 'Montáž domu', cena: CENY.montaz, vybrane: true, kategoria: 'Realizácia' });

    // Ulož ponuku do databázy
    const novaPonuka = await base44.asServiceRole.entities.CenovaPonuka.create({
      cislo_ponuky: cisloPonuky,
      dom_id: dom?.id,
      dom_nazov: dom?.nazov || 'Lyon 50m²',
      klient_meno: klientData.meno,
      klient_email: klientData.email,
      klient_telefon: klientData.telefon,
      klient_adresa: klientData.obec || '',
      konfigurator_data: konfiguraciaData,
      celkova_cena: konfiguraciaData.totalPrice,
      polozky: polozky,
      status: 'odoslana',
      odoslana: true,
      datum_odoslania: new Date().toISOString(),
      predajca_email: user?.email || 'system',
      nastavenie_id: aktivneNastavenie?.id
    });

    // Vytvor záznam aktivity v CRM
    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'odoslana_ponuka',
      ponuka_id: novaPonuka.id,
      klient_email: klientData.email,
      klient_meno: klientData.meno,
      predajca_email: user?.email || 'system',
      popis: `Odoslaná cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon'} - ${formatPrice(konfiguraciaData.totalPrice)}`,
      metadata: {
        cislo_ponuky: cisloPonuky,
        dom_nazov: dom?.nazov,
        celkova_cena: konfiguraciaData.totalPrice,
        lokalita: klientData.obec
      }
    });

    return Response.json({ 
      success: true, 
      cislo_ponuky: cisloPonuky,
      message: 'Email s cenovou ponukou bol úspešne odoslaný'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});