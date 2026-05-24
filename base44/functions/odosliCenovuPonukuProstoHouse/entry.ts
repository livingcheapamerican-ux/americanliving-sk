import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const emailTranslations = {
  "sk": {
    "priceQuote": "CENOVÁ PONUKA",
    "quoteNumber": "Číslo ponuky:",
    "date": "Dátum:",
    "familyHouseA0": "Rodinný dom A0",
    "recommended": "⚡ Odporúčané",
    "yearRoundLiving": "✓ Celoročné bývanie",
    "energyCertA0": "✓ Energetický certifikát A0",
    "premiumInsulation": "✓ Premium izolácia 250/300mm",
    "heatPumpRecup": "✓ Tepelné čerpadlo + Rekuperácia",
    "permanentResidence": "✓ Možnosť trvalého pobytu",
    "meetsAllNorms": "Spĺňa všetky normy pre rodinný dom",
    "recreationalBuilding": "Rekreačná stavba",
    "economicChoice": "💰 Ekonomická voľba",
    "cottage": "✓ Chata, záhradný domček",
    "standardInsulation": "✓ Celoročná izolácia 150/200mm",
    "noEnergyCert": "✓ Bez energetického certifikátu",
    "lowerPrice": "✓ Nižšia cena",
    "recreationalParams": "Spĺňa parametre rekreačnej stavby",
    "forClient": "Pre klienta",
    "name": "Meno:",
    "email": "Email:",
    "phone": "Telefón:",
    "location": "Lokalita:",
    "note": "Poznámka:",
    "additionalServices": "Vybrané dodatočné služby",
    "realEstateSale": "✓ Predaj predošlej nehnuteľnosti",
    "realEstateSaleDesc": "Budú sa Vám venovať naši najlepší odborníci v realitách.",
    "landSearch": "✓ Chcem pozemok pod svoj dom",
    "landSearchDesc": "Pomôžeme Vám nájsť ideálny pozemok.",
    "financialServices": "✓ Finančné služby - úvery/pôžičky",
    "financialServicesDesc": "Budú sa Vám venovať naši najlepší finančníci.",
    "selectedModel": "Vybraný model domu",
    "manufacturer": "Výrobca:",
    "houseType": "Typ domu:",
    "builtArea": "Zastavaná plocha:",
    "priceBreakdown": "Cenový rozpis konfigurácie",
    "item": "Položka",
    "priceWithVAT": "Cena s DPH",
    "shellConstruction": "HRUBÁ STAVBA",
    "shellHouse": "HOLODOM",
    "turnkeyHouse": "DOM NA KĽÚČ",
    "documentation": "DOKUMENTÁCIA",
    "totalPriceWithVAT": "CELKOVÁ CENA s DPH",
    "floorPlans": "Pôdorysy",
    "floorPlan2D": "2D pôdorys",
    "floorPlan3D": "3D pôdorys",
    "photoGallery": "Fotogaléria",
    "photo": "Fotka",
    "allRightsReserved": "Všetky práva vyhradené.",
    "followUs": "Sledujte nás na sociálnych sieťach:",
    "year": "${new Date().getFullYear()}"
  },
  "en": {
    "priceQuote": "PRICE QUOTE",
    "quoteNumber": "Quote number:",
    "date": "Date:",
    "familyHouseA0": "Family house A0",
    "recommended": "⚡ Recommended",
    "yearRoundLiving": "✓ Year-round living",
    "energyCertA0": "✓ Energy certificate A0",
    "premiumInsulation": "✓ Premium insulation 250/300mm",
    "heatPumpRecup": "✓ Heat pump + Recuperation",
    "permanentResidence": "✓ Permanent residence option",
    "meetsAllNorms": "Meets all family house norms",
    "recreationalBuilding": "Recreational building",
    "economicChoice": "💰 Economic choice",
    "cottage": "✓ Cottage, garden house",
    "standardInsulation": "✓ Year-round insulation 150/200mm",
    "noEnergyCert": "✓ No energy certificate",
    "lowerPrice": "✓ Lower price",
    "recreationalParams": "Meets recreational building parameters",
    "forClient": "For client",
    "name": "Name:",
    "email": "Email:",
    "phone": "Phone:",
    "location": "Location:",
    "note": "Note:",
    "additionalServices": "Selected additional services",
    "realEstateSale": "✓ Sale of previous property",
    "realEstateSaleDesc": "Our best real estate experts will take care of you.",
    "landSearch": "✓ I need land for my house",
    "landSearchDesc": "We will help you find the ideal plot.",
    "financialServices": "✓ Financial services - loans",
    "financialServicesDesc": "Our best financial experts will take care of you.",
    "selectedModel": "Selected house model",
    "manufacturer": "Manufacturer:",
    "houseType": "House type:",
    "builtArea": "Built area:",
    "priceBreakdown": "Configuration price breakdown",
    "item": "Item",
    "priceWithVAT": "Price incl. VAT",
    "shellConstruction": "SHELL CONSTRUCTION",
    "shellHouse": "SHELL HOUSE",
    "turnkeyHouse": "TURNKEY HOUSE",
    "documentation": "DOCUMENTATION",
    "totalPriceWithVAT": "TOTAL PRICE incl. VAT",
    "floorPlans": "Floor plans",
    "floorPlan2D": "2D floor plan",
    "floorPlan3D": "3D floor plan",
    "photoGallery": "Photo gallery",
    "photo": "Photo",
    "allRightsReserved": "All rights reserved.",
    "followUs": "Follow us on social media:"
  },
  "de": {
    "priceQuote": "PREISANGEBOT",
    "quoteNumber": "Angebotsnummer:",
    "date": "Datum:",
    "familyHouseA0": "Familienhaus A0",
    "recommended": "⚡ Empfohlen",
    "yearRoundLiving": "✓ Ganzjähriges Wohnen",
    "energyCertA0": "✓ Energiezertifikat A0",
    "premiumInsulation": "✓ Premium-Isolierung 250/300mm",
    "heatPumpRecup": "✓ Wärmepumpe + Rekuperation",
    "permanentResidence": "✓ Möglichkeit des ständigen Wohnsitzes",
    "meetsAllNorms": "Erfüllt alle Normen für Familienhaus",
    "recreationalBuilding": "Freizeitgebäude",
    "economicChoice": "💰 Wirtschaftliche Wahl",
    "cottage": "✓ Ferienhaus, Gartenhaus",
    "standardInsulation": "✓ Ganzjährige Isolierung 150/200mm",
    "noEnergyCert": "✓ Ohne Energiezertifikat",
    "lowerPrice": "✓ Niedrigerer Preis",
    "recreationalParams": "Erfüllt Parameter für Freizeitgebäude",
    "forClient": "Für Kunde",
    "name": "Name:",
    "email": "E-Mail:",
    "phone": "Telefon:",
    "location": "Standort:",
    "note": "Notiz:",
    "additionalServices": "Ausgewählte Zusatzleistungen",
    "realEstateSale": "✓ Verkauf früherer Immobilie",
    "realEstateSaleDesc": "Unsere besten Immobilienexperten kümmern sich um Sie.",
    "landSearch": "✓ Ich brauche Grundstück für mein Haus",
    "landSearchDesc": "Wir helfen Ihnen, das ideale Grundstück zu finden.",
    "financialServices": "✓ Finanzdienstleistungen - Kredite",
    "financialServicesDesc": "Unsere besten Finanzexperten kümmern sich um Sie.",
    "selectedModel": "Ausgewähltes Hausmodell",
    "manufacturer": "Hersteller:",
    "houseType": "Haustyp:",
    "builtArea": "Bebaute Fläche:",
    "priceBreakdown": "Preisaufschlüsselung der Konfiguration",
    "item": "Position",
    "priceWithVAT": "Preis inkl. MwSt.",
    "shellConstruction": "ROHBAU",
    "shellHouse": "ROHHAUS",
    "turnkeyHouse": "SCHLÜSSELFERTIG",
    "documentation": "DOKUMENTATION",
    "totalPriceWithVAT": "GESAMTPREIS inkl. MwSt.",
    "floorPlans": "Grundrisse",
    "floorPlan2D": "2D Grundriss",
    "floorPlan3D": "3D Grundriss",
    "photoGallery": "Fotogalerie",
    "photo": "Foto",
    "allRightsReserved": "Alle Rechte vorbehalten.",
    "followUs": "Folgen Sie uns in sozialen Medien:"
  },
  "fr": {
    "priceQuote": "DEVIS",
    "quoteNumber": "Numéro de devis:",
    "date": "Date:",
    "familyHouseA0": "Maison familiale A0",
    "recommended": "⚡ Recommandé",
    "yearRoundLiving": "✓ Logement toute l'année",
    "energyCertA0": "✓ Certificat énergétique A0",
    "premiumInsulation": "✓ Isolation premium 250/300mm",
    "heatPumpRecup": "✓ Pompe à chaleur + Récupération",
    "permanentResidence": "✓ Option de résidence permanente",
    "meetsAllNorms": "Répond à toutes les normes pour maison familiale",
    "recreationalBuilding": "Bâtiment récréatif",
    "economicChoice": "💰 Choix économique",
    "cottage": "✓ Chalet, maison de jardin",
    "standardInsulation": "✓ Isolation toute l'année 150/200mm",
    "noEnergyCert": "✓ Sans certificat énergétique",
    "lowerPrice": "✓ Prix inférieur",
    "recreationalParams": "Répond aux paramètres du bâtiment récréatif",
    "forClient": "Pour le client",
    "name": "Nom:",
    "email": "E-mail:",
    "phone": "Téléphone:",
    "location": "Localisation:",
    "note": "Note:",
    "additionalServices": "Services supplémentaires sélectionnés",
    "realEstateSale": "✓ Vente de bien immobilier précédent",
    "realEstateSaleDesc": "Nos meilleurs experts immobiliers s'occuperont de vous.",
    "landSearch": "✓ J'ai besoin d'un terrain pour ma maison",
    "landSearchDesc": "Nous vous aiderons à trouver le terrain idéal.",
    "financialServices": "✓ Services financiers - prêts",
    "financialServicesDesc": "Nos meilleurs experts financiers s'occuperont de vous.",
    "selectedModel": "Modèle de maison sélectionné",
    "manufacturer": "Fabricant:",
    "houseType": "Type de maison:",
    "builtArea": "Surface bâtie:",
    "priceBreakdown": "Détail des prix de configuration",
    "item": "Article",
    "priceWithVAT": "Prix TTC",
    "shellConstruction": "GROS ŒUVRE",
    "shellHouse": "MAISON COQUE",
    "turnkeyHouse": "CLÉ EN MAIN",
    "documentation": "DOCUMENTATION",
    "totalPriceWithVAT": "PRIX TOTAL TTC",
    "floorPlans": "Plans d'étage",
    "floorPlan2D": "Plan 2D",
    "floorPlan3D": "Plan 3D",
    "photoGallery": "Galerie photo",
    "photo": "Photo",
    "allRightsReserved": "Tous droits réservés.",
    "followUs": "Suivez-nous sur les réseaux sociaux:"
  },
  "hu": {
    "priceQuote": "ÁRAJÁNLAT",
    "quoteNumber": "Ajánlat száma:",
    "date": "Dátum:",
    "familyHouseA0": "Családi ház A0",
    "recommended": "⚡ Ajánlott",
    "yearRoundLiving": "✓ Egész éves lakhatás",
    "energyCertA0": "✓ A0 energetikai tanúsítvány",
    "premiumInsulation": "✓ Prémium szigetelés 250/300mm",
    "heatPumpRecup": "✓ Hőszivattyú + Rekuperáció",
    "permanentResidence": "✓ Állandó lakóhely lehetőség",
    "meetsAllNorms": "Megfelel minden családi ház normának",
    "recreationalBuilding": "Rekreációs épület",
    "economicChoice": "💰 Gazdaságos választás",
    "cottage": "✓ Nyaraló, kerti ház",
    "standardInsulation": "✓ Egész éves szigetelés 150/200mm",
    "noEnergyCert": "✓ Energetikai tanúsítvány nélkül",
    "lowerPrice": "✓ Alacsonyabb ár",
    "recreationalParams": "Megfelel a rekreációs épület paramétereknek",
    "forClient": "Ügyfél részére",
    "name": "Név:",
    "email": "E-mail:",
    "phone": "Telefon:",
    "location": "Helyszín:",
    "note": "Megjegyzés:",
    "additionalServices": "Kiválasztott kiegészítő szolgáltatások",
    "realEstateSale": "✓ Korábbi ingatlan értékesítése",
    "realEstateSaleDesc": "Legjobb ingatlan szakértőink gondoskodnak Önről.",
    "landSearch": "✓ Telekre van szükségem a házamhoz",
    "landSearchDesc": "Segítünk megtalálni az ideális telket.",
    "financialServices": "✓ Pénzügyi szolgáltatások - hitelek",
    "financialServicesDesc": "Legjobb pénzügyi szakértőink gondoskodnak Önről.",
    "selectedModel": "Kiválasztott házmodell",
    "manufacturer": "Gyártó:",
    "houseType": "Háztípus:",
    "builtArea": "Beépített terület:",
    "priceBreakdown": "Konfiguráció árrészletezése",
    "item": "Tétel",
    "priceWithVAT": "Ár ÁFÁ-val",
    "shellConstruction": "SZERKEZETKÉSZ",
    "shellHouse": "HÉJHÁZ",
    "turnkeyHouse": "KULCSRAKÉSZ",
    "documentation": "DOKUMENTÁCIÓ",
    "totalPriceWithVAT": "TELJES ÁR ÁFÁ-VAL",
    "floorPlans": "Alaprajzok",
    "floorPlan2D": "2D alaprajz",
    "floorPlan3D": "3D alaprajz",
    "photoGallery": "Fotógaléria",
    "photo": "Fotó",
    "allRightsReserved": "Minden jog fenntartva.",
    "followUs": "Kövessen minket a közösségi médiában:"
  },
  "pl": {
    "priceQuote": "OFERTA CENOWA",
    "quoteNumber": "Numer oferty:",
    "date": "Data:",
    "familyHouseA0": "Dom rodzinny A0",
    "recommended": "⚡ Polecane",
    "yearRoundLiving": "✓ Całoroczne zamieszkanie",
    "energyCertA0": "✓ Certyfikat energetyczny A0",
    "premiumInsulation": "✓ Izolacja premium 250/300mm",
    "heatPumpRecup": "✓ Pompa ciepła + Rekuperacja",
    "permanentResidence": "✓ Możliwość stałego zameldowania",
    "meetsAllNorms": "Spełnia wszystkie normy dla domu rodzinnego",
    "recreationalBuilding": "Budynek rekreacyjny",
    "economicChoice": "💰 Wybór ekonomiczny",
    "cottage": "✓ Domek letniskowy, ogrodowy",
    "standardInsulation": "✓ Izolacja całoroczna 150/200mm",
    "noEnergyCert": "✓ Bez certyfikatu energetycznego",
    "lowerPrice": "✓ Niższa cena",
    "recreationalParams": "Spełnia parametry budynku rekreacyjnego",
    "forClient": "Dla klienta",
    "name": "Imię:",
    "email": "E-mail:",
    "phone": "Telefon:",
    "location": "Lokalizacja:",
    "note": "Notatka:",
    "additionalServices": "Wybrane dodatkowe usługi",
    "realEstateSale": "✓ Sprzedaż poprzedniej nieruchomości",
    "realEstateSaleDesc": "Zajmą się Państwem nasi najlepsi eksperci od nieruchomości.",
    "landSearch": "✓ Potrzebuję działki pod dom",
    "landSearchDesc": "Pomożemy znaleźć idealną działkę.",
    "financialServices": "✓ Usługi finansowe - kredyty",
    "financialServicesDesc": "Zajmą się Państwem nasi najlepsi eksperci finansowi.",
    "selectedModel": "Wybrany model domu",
    "manufacturer": "Producent:",
    "houseType": "Typ domu:",
    "builtArea": "Powierzchnia zabudowy:",
    "priceBreakdown": "Szczegółowy kosztorys konfiguracji",
    "item": "Pozycja",
    "priceWithVAT": "Cena z VAT",
    "shellConstruction": "STAN SUROWY",
    "shellHouse": "DOM W STANIE SUROWYM",
    "turnkeyHouse": "POD KLUCZ",
    "documentation": "DOKUMENTACJA",
    "totalPriceWithVAT": "CENA CAŁKOWITA z VAT",
    "floorPlans": "Rzuty",
    "floorPlan2D": "Rzut 2D",
    "floorPlan3D": "Rzut 3D",
    "photoGallery": "Galeria zdjęć",
    "photo": "Zdjęcie",
    "allRightsReserved": "Wszelkie prawa zastrzeżone.",
    "followUs": "Obserwuj nas w mediach społecznościowych:"
  },
  "uk": {
    "priceQuote": "ЦІНОВА ПРОПОЗИЦІЯ",
    "quoteNumber": "Номер пропозиції:",
    "date": "Дата:",
    "familyHouseA0": "Сімейний будинок A0",
    "recommended": "⚡ Рекомендовано",
    "yearRoundLiving": "✓ Цілорічне проживання",
    "energyCertA0": "✓ Енергетичний сертифікат A0",
    "premiumInsulation": "✓ Преміум ізоляція 250/300мм",
    "heatPumpRecup": "✓ Тепловий насос + Рекуперація",
    "permanentResidence": "✓ Можливість постійної реєстрації",
    "meetsAllNorms": "Відповідає всім нормам для сімейного будинку",
    "recreationalBuilding": "Рекреаційна будівля",
    "economicChoice": "💰 Економічний вибір",
    "cottage": "✓ Дача, садовий будинок",
    "standardInsulation": "✓ Цілорічна ізоляція 150/200мм",
    "noEnergyCert": "✓ Без енергетичного сертифікату",
    "lowerPrice": "✓ Нижча ціна",
    "recreationalParams": "Відповідає параметрам рекреаційної будівлі",
    "forClient": "Для клієнта",
    "name": "Ім'я:",
    "email": "Електронна пошта:",
    "phone": "Телефон:",
    "location": "Локація:",
    "note": "Примітка:",
    "additionalServices": "Вибрані додаткові послуги",
    "realEstateSale": "✓ Продаж попередньої нерухомості",
    "realEstateSaleDesc": "Наші найкращі експерти з нерухомості подбають про вас.",
    "landSearch": "✓ Мені потрібна ділянка під будинок",
    "landSearchDesc": "Допоможемо знайти ідеальну ділянку.",
    "financialServices": "✓ Фінансові послуги - кредити",
    "financialServicesDesc": "Наші найкращі фінансові експерти подбають про вас.",
    "selectedModel": "Обраний модель будинку",
    "manufacturer": "Виробник:",
    "houseType": "Тип будинку:",
    "builtArea": "Площа забудови:",
    "priceBreakdown": "Детальний кошторис конфігурації",
    "item": "Позиція",
    "priceWithVAT": "Ціна з ПДВ",
    "shellConstruction": "КАРКАС",
    "shellHouse": "КАРКАСНИЙ БУДИНОК",
    "turnkeyHouse": "ПІД КЛЮЧ",
    "documentation": "ДОКУМЕНТАЦІЯ",
    "totalPriceWithVAT": "ЗАГАЛЬНА ЦІНА з ПДВ",
    "floorPlans": "Плани поверхів",
    "floorPlan2D": "2D план",
    "floorPlan3D": "3D план",
    "photoGallery": "Фотогалерея",
    "photo": "Фото",
    "allRightsReserved": "Всі права захищені.",
    "followUs": "Слідкуйте за нами в соціальних мережах:"
  },
  "sr": {
    "priceQuote": "ЦЕНОВНА ПОНУДА",
    "quoteNumber": "Број понуде:",
    "date": "Датум:",
    "familyHouseA0": "Породична кућа А0",
    "recommended": "⚡ Препоручено",
    "yearRoundLiving": "✓ Целогодишње становање",
    "energyCertA0": "✓ Енергетски сертификат А0",
    "premiumInsulation": "✓ Премијум изолација 250/300мм",
    "heatPumpRecup": "✓ Топлотна пумпа + Рекуперација",
    "permanentResidence": "✓ Могућност сталног боравка",
    "meetsAllNorms": "Испуњава све норме за породичну кућу",
    "recreationalBuilding": "Рекреациона зграда",
    "economicChoice": "💰 Економична опција",
    "cottage": "✓ Викендица, вртна кућа",
    "standardInsulation": "✓ Целогодишња изолација 150/200мм",
    "noEnergyCert": "✓ Без енергетског сертификата",
    "lowerPrice": "✓ Нижа цена",
    "recreationalParams": "Испуњава параметре рекреационе зграде",
    "forClient": "За клијента",
    "name": "Име:",
    "email": "Е-пошта:",
    "phone": "Телефон:",
    "location": "Локација:",
    "note": "Напомена:",
    "additionalServices": "Одабране додатне услуге",
    "realEstateSale": "✓ Продаја претходне некретнине",
    "realEstateSaleDesc": "Наши најбољи стручњаци за некретнине ће се побринути за вас.",
    "landSearch": "✓ Треба ми парцела за кућу",
    "landSearchDesc": "Помоћи ћемо вам да пронађете идеалну парцелу.",
    "financialServices": "✓ Финансијске услуге - кредити",
    "financialServicesDesc": "Наши најбољи финансијски стручњаци ће се побринути за вас.",
    "selectedModel": "Одабрани модел куће",
    "manufacturer": "Произвођач:",
    "houseType": "Тип куће:",
    "builtArea": "Изграђена површина:",
    "priceBreakdown": "Детаљан распис цена конфигурације",
    "item": "Ставка",
    "priceWithVAT": "Цена са ПДВ-ом",
    "shellConstruction": "ГРУБА ГРАДЊА",
    "shellHouse": "КУЋА У СИРОВОМ СТАЊУ",
    "turnkeyHouse": "ПОД КЉУЧ",
    "documentation": "ДОКУМЕНТАЦИЈА",
    "totalPriceWithVAT": "УКУПНА ЦЕНА са ПДВ-ом",
    "floorPlans": "Основе",
    "floorPlan2D": "2Д основа",
    "floorPlan3D": "3Д основа",
    "photoGallery": "Фотогалерија",
    "photo": "Фотографија",
    "allRightsReserved": "Сва права задржана.",
    "followUs": "Пратите нас на друштвеним мрежама:"
  },
  "hr": {
    "priceQuote": "CJENOVNA PONUDA",
    "quoteNumber": "Broj ponude:",
    "date": "Datum:",
    "familyHouseA0": "Obiteljska kuća A0",
    "recommended": "⚡ Preporučeno",
    "yearRoundLiving": "✓ Cjelogodišnje stanovanje",
    "energyCertA0": "✓ Energetski certifikat A0",
    "premiumInsulation": "✓ Premium izolacija 250/300mm",
    "heatPumpRecup": "✓ Toplinska pumpa + Rekuperacija",
    "permanentResidence": "✓ Mogućnost stalnog boravka",
    "meetsAllNorms": "Ispunjava sve norme za obiteljsku kuću",
    "recreationalBuilding": "Rekreacijska zgrada",
    "economicChoice": "💰 Ekonomičan izbor",
    "cottage": "✓ Vikendica, vrtna kuća",
    "standardInsulation": "✓ Cjelogodišnja izolacija 150/200mm",
    "noEnergyCert": "✓ Bez energetskog certifikata",
    "lowerPrice": "✓ Niža cijena",
    "recreationalParams": "Ispunjava parametre rekreacijske zgrade",
    "forClient": "Za klijenta",
    "name": "Ime:",
    "email": "E-pošta:",
    "phone": "Telefon:",
    "location": "Lokacija:",
    "note": "Napomena:",
    "additionalServices": "Odabrane dodatne usluge",
    "realEstateSale": "✓ Prodaja prethodne nekretnine",
    "realEstateSaleDesc": "Naši najbolji stručnjaci za nekretnine će se pobrinuti za vas.",
    "landSearch": "✓ Trebam parcelu za kuću",
    "landSearchDesc": "Pomoći ćemo vam pronaći idealnu parcelu.",
    "financialServices": "✓ Financijske usluge - krediti",
    "financialServicesDesc": "Naši najbolji financijski stručnjaci će se pobrinuti za vas.",
    "selectedModel": "Odabrani model kuće",
    "manufacturer": "Proizvođač:",
    "houseType": "Tip kuće:",
    "builtArea": "Izgrađena površina:",
    "priceBreakdown": "Detaljan cjenovnik konfiguracije",
    "item": "Stavka",
    "priceWithVAT": "Cijena s PDV-om",
    "shellConstruction": "GRUBA GRADNJA",
    "shellHouse": "KUĆA U SIROVOM STANJU",
    "turnkeyHouse": "POD KLJUČ",
    "documentation": "DOKUMENTACIJA",
    "totalPriceWithVAT": "UKUPNA CIJENA s PDV-om",
    "floorPlans": "Tlocrti",
    "floorPlan2D": "2D tlocrt",
    "floorPlan3D": "3D tlocrt",
    "photoGallery": "Foto galerija",
    "photo": "Fotografija",
    "allRightsReserved": "Sva prava pridržana.",
    "followUs": "Pratite nas na društvenim mrežama:"
  },
  "el": {
    "priceQuote": "ΠΡΟΣΦΟΡΑ ΤΙΜΗΣ",
    "quoteNumber": "Αριθμός προσφοράς:",
    "date": "Ημερομηνία:",
    "familyHouseA0": "Οικογενειακή κατοικία A0",
    "recommended": "⚡ Προτείνεται",
    "yearRoundLiving": "✓ Ολόχρονη κατοικία",
    "energyCertA0": "✓ Ενεργειακό πιστοποιητικό A0",
    "premiumInsulation": "✓ Premium μόνωση 250/300mm",
    "heatPumpRecup": "✓ Αντλία θερμότητας + Ανάκτηση",
    "permanentResidence": "✓ Δυνατότητα μόνιμης κατοικίας",
    "meetsAllNorms": "Πληροί όλα τα πρότυπα για οικογενειακή κατοικία",
    "recreationalBuilding": "Ψυχαγωγικό κτίριο",
    "economicChoice": "💰 Οικονομική επιλογή",
    "cottage": "✓ Εξοχική κατοικία, κήπος",
    "standardInsulation": "✓ Ολόχρονη μόνωση 150/200mm",
    "noEnergyCert": "✓ Χωρίς ενεργειακό πιστοποιητικό",
    "lowerPrice": "✓ Χαμηλότερη τιμή",
    "recreationalParams": "Πληροί παραμέτρους ψυχαγωγικού κτιρίου",
    "forClient": "Για πελάτη",
    "name": "Όνομα:",
    "email": "Ηλεκτρονικό ταχυδρομείο:",
    "phone": "Τηλέφωνο:",
    "location": "Τοποθεσία:",
    "note": "Σημείωση:",
    "additionalServices": "Επιλεγμένες πρόσθετες υπηρεσίες",
    "realEstateSale": "✓ Πώληση προηγούμενης ιδιοκτησίας",
    "realEstateSaleDesc": "Οι καλύτεροι ειδικοί μας σε ακίνητα θα φροντίσουν για εσάς.",
    "landSearch": "✓ Χρειάζομαι οικόπεδο για το σπίτι μου",
    "landSearchDesc": "Θα σας βοηθήσουμε να βρείτε το ιδανικό οικόπεδο.",
    "financialServices": "✓ Χρηματοοικονομικές υπηρεσίες - δάνεια",
    "financialServicesDesc": "Οι καλύτεροι χρηματοοικονομικοί μας ειδικοί θα φροντίσουν για εσάς.",
    "selectedModel": "Επιλεγμένο μοντέλο σπιτιού",
    "manufacturer": "Κατασκευαστής:",
    "houseType": "Τύπος σπιτιού:",
    "builtArea": "Δομημένη επιφάνεια:",
    "priceBreakdown": "Ανάλυση τιμών διαμόρφωσης",
    "item": "Στοιχείο",
    "priceWithVAT": "Τιμή με ΦΠΑ",
    "shellConstruction": "ΧΟΝΤΡΗ ΚΑΤΑΣΚΕΥΗ",
    "shellHouse": "ΣΠΙΤΙ ΚΕΛΥΦΟΣ",
    "turnkeyHouse": "ΜΕ ΤΟ ΚΛΕΙΔΙ",
    "documentation": "ΤΕΚΜΗΡΙΩΣΗ",
    "totalPriceWithVAT": "ΣΥΝΟΛΙΚΗ ΤΙΜΗ με ΦΠΑ",
    "floorPlans": "Κατόψεις",
    "floorPlan2D": "2D κάτοψη",
    "floorPlan3D": "3D κάτοψη",
    "photoGallery": "Φωτογραφική γκαλερί",
    "photo": "Φωτογραφία",
    "allRightsReserved": "Όλα τα δικαιώματα διατηρούνται.",
    "followUs": "Ακολουθήστε μας στα μέσα κοινωνικής δικτύωσης:"
  }
};

function t(language, key) {
  return emailTranslations[language]?.[key] || emailTranslations['sk']?.[key] || key;
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

    const payload = await req.json();
    const {
      dom_id, klient_meno, klient_email, klient_telefon, klient_adresa, klient_poznamka,
      selectedItems, totalPrice,
      montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
      elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
      tepelneCerpadlo, rekuperacia, pripojkaSiete,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
      povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
      vnutornePodlahy, podlahovVykurovanie, interieroveDvere, pergola,
      inziniering, projektA0, revizna, doprava, predlzenie,
      predajNehnutelnosti, hladaniePozemku, financneSluzby,
      language = 'sk'
    } = payload;

    // Načítaj dom
    const domy = await base44.asServiceRole.entities.Dom.filter({ id: dom_id });
    const dom = domy[0];

    if (!dom) {
      return Response.json({ error: 'Dom nenájdený' }, { status: 404 });
    }

    // Generuj unikátne číslo ponuky
    const aktualnyRok = new Date().getFullYear();
    const pocitadla = await base44.asServiceRole.entities.PocitadloCenovychPonuk.list();
    let pocitadlo = pocitadla.find(p => p.rok === aktualnyRok);
    
    let cisloPonuky;
    if (!pocitadlo) {
      const novePocitadlo = await base44.asServiceRole.entities.PocitadloCenovychPonuk.create({
        rok: aktualnyRok,
        posledne_cislo: 1
      });
      cisloPonuky = `CP-${aktualnyRok}-001`;
    } else {
      const noveCislo = pocitadlo.posledne_cislo + 1;
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.update(pocitadlo.id, {
        posledne_cislo: noveCislo
      });
      cisloPonuky = `CP-${aktualnyRok}-${String(noveCislo).padStart(3, '0')}`;
    }

    console.log('=== PRIJATÉ DÁTA PRE EMAIL ===');
    console.log('selectedItems:', selectedItems);
    console.log('totalPrice:', totalPrice);

    // Mapovanie cien hrubej stavby podľa prosto_house_kod
    const priceMap = {
      'PH-001': { kit: 61700, assembly: 17970 },  // Flat Double
      'PH-002': { kit: 61000, assembly: 19500 },  // Fjord
      'PH-003': { kit: 45950, assembly: 13785 },  // Flat House 1,5
      'PH-004': { kit: 51000, assembly: 15650 },  // Nord
      'PH-005': { kit: 38000, assembly: 9500 },   // Barn Double
      'PH-006': { kit: 31700, assembly: 7925 },   // Flat 72
      'PH-007': { kit: 23400, assembly: 7200 },   // A-Frame
      'PH-008': { kit: 21600, assembly: 5400 },   // Barn
      'PH-009': { kit: 19950, assembly: 4990 }    // Flat Small
    };
    
    const shellPrices = priceMap[dom.prosto_house_kod] || { kit: 0, assembly: 0 };
    const shellTotalPrice = shellPrices.kit + shellPrices.assembly;

    // Typ stavby
    const isA0 = projektA0 && izolaciaNavysenie === "premium" && tepelneCerpadlo && rekuperacia;
    const typStavby = isA0 ? "rodinny_dom_a0" : "rekreacna_stavba";

    // Výber hlavnej fotky
    const hlavnaFotka = vonkajsiaFasada === "suchana" 
      ? dom.hlavny_obrazok 
      : (dom.zakladna_konfiguracia_obrazok || dom.hlavny_obrazok);

    // Galérie podľa pravidiel - len vybrané galérie
    const galerie = [];

    console.log('=== DEBUG GALÉRIE EMAIL ===');
    console.log('interierFinis:', interierFinis);
    console.log('vonkajsiaFasada:', vonkajsiaFasada);
    console.log('dom.galerie:', dom.galerie?.map(g => ({ typ: g.typ, pocet_fotiek: g.fotky?.length })));

    // INTERIÉR - vždy zobraz obe galérie ak existujú
    const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
    if (drevoGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Drevo", fotky: drevoGaleria.fotky });
      console.log('Pridaná galéria Interiér - Drevo, fotiek:', drevoGaleria.fotky.length);
    }
    
    const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
    if (sadroGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Sadrokartón", fotky: sadroGaleria.fotky });
      console.log('Pridaná galéria Interiér - Sadrokartón, fotiek:', sadroGaleria.fotky.length);
    }

    // EXTERIÉR - len jedna galéria podľa fasády
    if (vonkajsiaFasada === "standard" || !vonkajsiaFasada) {
      const exterierDrevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
      if (exterierDrevoGaleria?.fotky?.length > 0) {
        galerie.push({ nazov: "Exteriér - Drevo/Plech", fotky: exterierDrevoGaleria.fotky });
        console.log('Pridaná galéria Exteriér - Drevo/Plech, fotiek:', exterierDrevoGaleria.fotky.length);
      }
    } else if (vonkajsiaFasada === "suchana") {
      const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
      if (murovkaGaleria?.fotky?.length > 0) {
        galerie.push({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
        console.log('Pridaná galéria Exteriér - Murovka, fotiek:', murovkaGaleria.fotky.length);
      }
    }

    console.log('Celkový počet galérií:', galerie.length);
    console.log('=========================');

    const formatPrice = (price) => {
      if (!price) return "0,00 €";
      return price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };

    const langCode = language || 'sk';
    const dateLocale = langCode === 'en' ? 'en-US' : langCode === 'de' ? 'de-DE' : langCode === 'fr' ? 'fr-FR' : langCode === 'hu' ? 'hu-HU' : langCode === 'pl' ? 'pl-PL' : langCode === 'uk' ? 'uk-UA' : langCode === 'sr' ? 'sr-RS' : langCode === 'hr' ? 'hr-HR' : langCode === 'el' ? 'el-GR' : 'sk-SK';

    // Preklad názvov položiek z konfiguratora
    const itemNameTranslations = {
      // Montáž
      "Bez montáže (Svojpomocne)": { en: "Without assembly (Self-assembly)", de: "Ohne Montage (Selbstmontage)", fr: "Sans montage (Auto-assemblage)", hu: "Összeszerelés nélkül (Önálló)", pl: "Bez montażu (Samodzielnie)", uk: "Без монтажу (Самостійно)", sr: "Без монтаже (Самостално)", hr: "Bez montaže (Samostalno)", el: "Χωρίς συναρμολόγηση (Αυτόματη)" },
      "Bez montáže": { en: "Without assembly", de: "Ohne Montage", fr: "Sans montage", hu: "Összeszerelés nélkül", pl: "Bez montażu", uk: "Без монтажу", sr: "Без монтаже", hr: "Bez montaže", el: "Χωρίς συναρμολόγηση" },
      "S montážou": { en: "With assembly", de: "Mit Montage", fr: "Avec montage", hu: "Összeszereléssel", pl: "Z montażem", uk: "З монтажем", sr: "Са монтажом", hr: "S montažom", el: "Με συναρμολόγηση" },
      // Predĺženie
      "+1,2 m": { en: "+1.2 m", de: "+1,2 m", fr: "+1,2 m", hu: "+1,2 m", pl: "+1,2 m", uk: "+1,2 м", sr: "+1,2 м", hr: "+1,2 m", el: "+1,2 μ" },
      // Izolácia
      "Celoročná 150 mm": { en: "Year-round 150 mm", de: "Ganzjährig 150 mm", fr: "Toute l'année 150 mm", hu: "Egész éves 150 mm", pl: "Całoroczna 150 mm", uk: "Цілорічна 150 мм", sr: "Целогодишња 150 мм", hr: "Cjelogodišnja 150 mm", el: "Ολόχρονη 150 mm" },
      "Zvýšená 200 mm": { en: "Enhanced 200 mm", de: "Erhöht 200 mm", fr: "Améliorée 200 mm", hu: "Fokozott 200 mm", pl: "Podwyższona 200 mm", uk: "Підвищена 200 мм", sr: "Повећана 200 мм", hr: "Pojačana 200 mm", el: "Βελτιωμένη 200 mm" },
      "Prémium 250 mm": { en: "Premium 250 mm", de: "Premium 250 mm", fr: "Premium 250 mm", hu: "Prémium 250 mm", pl: "Premium 250 mm", uk: "Преміум 250 мм", sr: "Премијум 250 мм", hr: "Premium 250 mm", el: "Premium 250 mm" },
      "Extra 300 mm": { en: "Extra 300 mm", de: "Extra 300 mm", fr: "Extra 300 mm", hu: "Extra 300 mm", pl: "Extra 300 mm", uk: "Екстра 300 мм", sr: "Екстра 300 мм", hr: "Extra 300 mm", el: "Extra 300 mm" },
      // Základy
      "Bez základov": { en: "Without foundations", de: "Ohne Fundament", fr: "Sans fondations", hu: "Alap nélkül", pl: "Bez fundamentów", uk: "Без фундаменту", sr: "Без темеља", hr: "Bez temelja", el: "Χωρίς θεμέλια" },
      "Pilóty/Pätky": { en: "Pillars/Footings", de: "Pfähle/Sockel", fr: "Pieux/Semelles", hu: "Pilóták/Talpak", pl: "Pale/Stopy", uk: "Палі/Підошви", sr: "Пилоти/Стопе", hr: "Piloti/Stopice", el: "Πάσσαλοι/Θεμέλια" },
      "Základová doska": { en: "Foundation slab", de: "Fundamentplatte", fr: "Dalle de fondation", hu: "Alaplemez", pl: "Płyta fundamentowa", uk: "Фундаментна плита", sr: "Темељна плоча", hr: "Temeljna ploča", el: "Θεμελιακή πλάκα" },
      "Pásové základy": { en: "Strip foundations", de: "Streifenfundament", fr: "Fondations filantes", hu: "Sávos alap", pl: "Ławy fundamentowe", uk: "Стрічковий фундамент", sr: "Трачни темељи", hr: "Trakasti temelji", el: "Ταινιωτά θεμέλια" },
      // Dvere
      "Štandard": { en: "Standard", de: "Standard", fr: "Standard", hu: "Alap", pl: "Standard", uk: "Стандарт", sr: "Стандард", hr: "Standard", el: "Τυπικό" },
      "Kovové s 2 zámkami": { en: "Metal with 2 locks", de: "Metall mit 2 Schlössern", fr: "Métal avec 2 serrures", hu: "Fém 2 zárral", pl: "Metalowe z 2 zamkami", uk: "Металеві з 2 замками", sr: "Метална са 2 браве", hr: "Metalna s 2 brave", el: "Μεταλλική με 2 κλειδαριές" },
      "Plastovo-kovové": { en: "Plastic-metal", de: "Kunststoff-Metall", fr: "Plastique-métal", hu: "Műanyag-fém", pl: "Plastikowo-metalowe", uk: "Пластово-металеві", sr: "Пластично-метална", hr: "Plastično-metalna", el: "Πλαστικό-μεταλλικό" },
      // Fasáda
      "Štandardná": { en: "Standard", de: "Standard", fr: "Standard", hu: "Alap", pl: "Standardowa", uk: "Стандартна", sr: "Стандардна", hr: "Standardna", el: "Τυπική" },
      "Šúchaná fasáda": { en: "Stucco facade", de: "Putzfassade", fr: "Façade enduite", hu: "Vakolatfasáda", pl: "Tynkowa fasada", uk: "Штукатурний фасад", sr: "Жбукана фасада", hr: "Žbukana fasada", el: "Σοβαντισμένη πρόσοψη" },
      // Interiér
      "Bez interiéru": { en: "Without interior", de: "Ohne Innenausbau", fr: "Sans intérieur", hu: "Belső nélkül", pl: "Bez wykończenia", uk: "Без інтер'єру", sr: "Без ентеријера", hr: "Bez interijera", el: "Χωρίς εσωτερικό" },
      "Drevo": { en: "Wood", de: "Holz", fr: "Bois", hu: "Fa", pl: "Drewno", uk: "Дерево", sr: "Дрво", hr: "Drvo", el: "Ξύλο" },
      "Sadrokartón": { en: "Drywall", de: "Trockenbau", fr: "Placo-plâtre", hu: "Gipszkarton", pl: "Płyta gipsowo-kartonowa", uk: "Гіпсокартон", sr: "Гипс-картон", hr: "Gips-karton", el: "Γυψοσανίδα" },
      // Addons
      "Elektroinštalácia": { en: "Electrical installation", de: "Elektroinstallation", fr: "Installation électrique", hu: "Elektromos szerelés", pl: "Instalacja elektryczna", uk: "Електромонтаж", sr: "Електроинсталација", hr: "Elektroinstalacija", el: "Ηλεκτρολογική εγκατάσταση" },
      "Voda a kanalizácia": { en: "Water and drainage", de: "Wasser und Kanalisation", fr: "Eau et assainissement", hu: "Víz és csatorna", pl: "Woda i kanalizacja", uk: "Вода та каналізація", sr: "Вода и канализација", hr: "Voda i kanalizacija", el: "Νερό και αποχέτευση" },
      "Sanita": { en: "Sanitary", de: "Sanitär", fr: "Sanitaire", hu: "Szaniter", pl: "Sanitarny", uk: "Сантехніка", sr: "Санитарије", hr: "Sanitarija", el: "Υγιεινή" },
      "Bojler": { en: "Boiler", de: "Boiler", fr: "Chaudière", hu: "Bojler", pl: "Bojler", uk: "Бойлер", sr: "Бојлер", hr: "Bojler", el: "Λέβητας" },
      "Tepelné čerpadlo": { en: "Heat pump", de: "Wärmepumpe", fr: "Pompe à chaleur", hu: "Hőszivattyú", pl: "Pompa ciepła", uk: "Тепловий насос", sr: "Топлотна пумпа", hr: "Toplinska pumpa", el: "Αντλία θερμότητας" },
      "Rekuperácia": { en: "Recuperation", de: "Rekuperation", fr: "Récupération", hu: "Rekuperáció", pl: "Rekuperacja", uk: "Рекуперація", sr: "Рекуперација", hr: "Rekuperacija", el: "Ανάκτηση" },
      "Laminátové podlahy": { en: "Laminate floors", de: "Laminatböden", fr: "Parquet stratifié", hu: "Laminált padló", pl: "Podłogi laminowane", uk: "Ламінатні підлоги", sr: "Ламинатни подови", hr: "Laminatni podovi", el: "Δάπεδα laminate" },
      "Podlahové kúrenie": { en: "Floor heating", de: "Fußbodenheizung", fr: "Chauffage au sol", hu: "Padlófűtés", pl: "Ogrzewanie podłogowe", uk: "Підлогове опалення", sr: "Подно грејање", hr: "Podno grijanje", el: "Υποδαπέδια θέρμανση" },
      "Laminácia okien": { en: "Window lamination", de: "Fensterlaminierung", fr: "Laminage des fenêtres", hu: "Ablak laminálás", pl: "Laminowanie okien", uk: "Ламінування вікон", sr: "Ламинација прозора", hr: "Laminacija prozora", el: "Επικάλυψη παραθύρων" },
      "Tónované sklá": { en: "Tinted glass", de: "Getöntes Glas", fr: "Verre teinté", hu: "Sötétített üveg", pl: "Przyciemniane szyby", uk: "Тоновані скла", sr: "Тонирано стакло", hr: "Tonirano staklo", el: "Σκούρα τζάμια" },
      "Prípojky sietí": { en: "Network connections", de: "Netzanschlüsse", fr: "Connexions réseau", hu: "Hálózati csatlakozások", pl: "Przyłącza sieci", uk: "Підключення мереж", sr: "Прикључци мрежа", hr: "Priključci mreža", el: "Συνδέσεις δικτύου" },
      "Inžiniering": { en: "Engineering", de: "Engineering", fr: "Ingénierie", hu: "Mérnöki tervezés", pl: "Inżyniering", uk: "Інжиніринг", sr: "Инжењеринг", hr: "Inženjering", el: "Μηχανική" },
      "Projektant": { en: "Architect/Designer", de: "Planer", fr: "Concepteur", hu: "Tervező", pl: "Projektant", uk: "Проектант", sr: "Пројектант", hr: "Projektant", el: "Σχεδιαστής" },
      "Revízie": { en: "Revisions", de: "Revisionen", fr: "Révisions", hu: "Felülvizsgálatok", pl: "Przeglądy", uk: "Ревізії", sr: "Ревизије", hr: "Revizije", el: "Αναθεωρήσεις" },
    };

    // Funkcia na preloženie názvu položky
    const translateItemName = (name, lang) => {
      if (lang === 'sk') return name;
      
      // Skús priamy preklad
      if (itemNameTranslations[name]?.[lang]) return itemNameTranslations[name][lang];
      
      // Skús preložiť prefix "Montáž: ...", "Izolácia: ...", atď.
      const prefixMap = {
        'sk': { montaz: 'Montáž', izolacia: 'Izolácia', zaklady: 'Základy', vstupneDvere: 'Vstupné dvere', fasada: 'Fasáda', interier: 'Interiér', predlzenie: 'Predĺženie' },
        'en': { montaz: 'Assembly', izolacia: 'Insulation', zaklady: 'Foundations', vstupneDvere: 'Entry doors', fasada: 'Facade', interier: 'Interior', predlzenie: 'Extension' },
        'de': { montaz: 'Montage', izolacia: 'Isolierung', zaklady: 'Fundament', vstupneDvere: 'Eingangstür', fasada: 'Fassade', interier: 'Innenausbau', predlzenie: 'Verlängerung' },
        'fr': { montaz: 'Montage', izolacia: 'Isolation', zaklady: 'Fondations', vstupneDvere: 'Porte d\'entrée', fasada: 'Façade', interier: 'Intérieur', predlzenie: 'Extension' },
        'hu': { montaz: 'Összeszerelés', izolacia: 'Szigetelés', zaklady: 'Alapozás', vstupneDvere: 'Bejárati ajtó', fasada: 'Homlokzat', interier: 'Belső tér', predlzenie: 'Meghosszabbítás' },
        'pl': { montaz: 'Montaż', izolacia: 'Izolacja', zaklady: 'Fundamenty', vstupneDvere: 'Drzwi wejściowe', fasada: 'Fasada', interier: 'Wnętrze', predlzenie: 'Przedłużenie' },
        'uk': { montaz: 'Монтаж', izolacia: 'Ізоляція', zaklady: 'Фундаменти', vstupneDvere: 'Вхідні двері', fasada: 'Фасад', interier: 'Інтер\'єр', predlzenie: 'Подовження' },
        'sr': { montaz: 'Монтажа', izolacia: 'Изолација', zaklady: 'Темељи', vstupneDvere: 'Улазна врата', fasada: 'Фасада', interier: 'Ентеријер', predlzenie: 'Продужење' },
        'hr': { montaz: 'Montaža', izolacia: 'Izolacija', zaklady: 'Temelji', vstupneDvere: 'Ulazna vrata', fasada: 'Fasada', interier: 'Enterijer', predlzenie: 'Produženje' },
        'el': { montaz: 'Συναρμολόγηση', izolacia: 'Μόνωση', zaklady: 'Θεμέλια', vstupneDvere: 'Εξώπορτα', fasada: 'Πρόσοψη', interier: 'Εσωτερικό', predlzenie: 'Επέκταση' },
      };

      const prefixes = prefixMap[lang] || prefixMap['sk'];
      const skPrefixes = prefixMap['sk'];

      // Izolácia: ...
      if (name.startsWith('Izolácia: ')) {
        const val = name.replace('Izolácia: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.izolacia}: ${translatedVal}`;
      }
      // Montáž: ...
      if (name.startsWith('Montáž: ')) {
        const val = name.replace('Montáž: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.montaz}: ${translatedVal}`;
      }
      // Základy: ...
      if (name.startsWith('Základy: ')) {
        const val = name.replace('Základy: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.zaklady}: ${translatedVal}`;
      }
      // Vstupné dvere: ...
      if (name.startsWith('Vstupné dvere: ')) {
        const val = name.replace('Vstupné dvere: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.vstupneDvere}: ${translatedVal}`;
      }
      // Fasáda: ...
      if (name.startsWith('Fasáda: ')) {
        const val = name.replace('Fasáda: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.fasada}: ${translatedVal}`;
      }
      // Interiér: ...
      if (name.startsWith('Interiér: ')) {
        const val = name.replace('Interiér: ', '');
        const translatedVal = itemNameTranslations[val]?.[lang] || val;
        return `${prefixes.interier}: ${translatedVal}`;
      }
      // Predĺženie: ...
      if (name.startsWith('Predĺženie: ')) {
        const val = name.replace('Predĺženie: ', '');
        return `${prefixes.predlzenie}: ${val}`;
      }
      // Okná s počtom ks - Strešné okná (2 ks)
      const windowMap = {
        'sk': { streskne: 'Strešné okná', fixne: 'Fixné okná', vyklopneBig: 'Výklopné okná veľké', vyklopneSmall: 'Výklopné okná malé', intDvere: 'Interiérové dvere', ks: 'ks' },
        'en': { streskne: 'Roof windows', fixne: 'Fixed windows', vyklopneBig: 'Tilt windows large', vyklopneSmall: 'Tilt windows small', intDvere: 'Interior doors', ks: 'pcs' },
        'de': { streskne: 'Dachfenster', fixne: 'Festverglasung', vyklopneBig: 'Kippfenster groß', vyklopneSmall: 'Kippfenster klein', intDvere: 'Innentüren', ks: 'Stk' },
        'fr': { streskne: 'Fenêtres de toit', fixne: 'Fenêtres fixes', vyklopneBig: 'Fenêtres oscillo-battantes grandes', vyklopneSmall: 'Fenêtres oscillo-battantes petites', intDvere: 'Portes intérieures', ks: 'pcs' },
        'hu': { streskne: 'Tetőablakok', fixne: 'Fix ablakok', vyklopneBig: 'Billenő ablakok nagy', vyklopneSmall: 'Billenő ablakok kis', intDvere: 'Belső ajtók', ks: 'db' },
        'pl': { streskne: 'Okna dachowe', fixne: 'Okna stałe', vyklopneBig: 'Okna uchylne duże', vyklopneSmall: 'Okna uchylne małe', intDvere: 'Drzwi wewnętrzne', ks: 'szt' },
        'uk': { streskne: 'Дахові вікна', fixne: 'Фіксовані вікна', vyklopneBig: 'Відкидні вікна великі', vyklopneSmall: 'Відкидні вікна малі', intDvere: 'Міжкімнатні двері', ks: 'шт' },
        'sr': { streskne: 'Крoвни прозори', fixne: 'Фиксни прозори', vyklopneBig: 'Откидни прозори велики', vyklopneSmall: 'Откидни прозори мали', intDvere: 'Унутрашња врата', ks: 'ком' },
        'hr': { streskne: 'Krovni prozori', fixne: 'Fiksni prozori', vyklopneBig: 'Nagibni prozori veliki', vyklopneSmall: 'Nagibni prozori mali', intDvere: 'Unutarnja vrata', ks: 'kom' },
        'el': { streskne: 'Παράθυρα οροφής', fixne: 'Σταθερά παράθυρα', vyklopneBig: 'Ανακλινόμενα παράθυρα μεγάλα', vyklopneSmall: 'Ανακλινόμενα παράθυρα μικρά', intDvere: 'Εσωτερικές πόρτες', ks: 'τεμ' },
      };
      const wm = windowMap[lang] || windowMap['sk'];
      const countMatch = name.match(/\((\d+) ks\)$/);
      const count = countMatch ? countMatch[1] : '';
      if (name.startsWith('Strešné okná')) return `${wm.streskne} (${count} ${wm.ks})`;
      if (name.startsWith('Fixné okná')) return `${wm.fixne} (${count} ${wm.ks})`;
      if (name.startsWith('Výklopné okná veľké')) return `${wm.vyklopneBig} (${count} ${wm.ks})`;
      if (name.startsWith('Výklopné okná malé')) return `${wm.vyklopneSmall} (${count} ${wm.ks})`;
      if (name.startsWith('Interiérové dvere')) return `${wm.intDvere} (${count} ${wm.ks})`;
      
      return name; // fallback - ponechaj pôvodný text
    };

    // HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html lang="${langCode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t(langCode, 'priceQuote')} ${cisloPonuky}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: bold; color: #EF4444; margin-bottom: 15px; border-bottom: 3px solid #EF4444; padding-bottom: 8px; }
    
    .typ-stavby { padding: 20px; border-radius: 12px; margin: 20px 0; border: 3px solid; }
    .typ-stavby.rekreacna { background: #fef3c7; border-color: #f59e0b; }
    .typ-stavby.a0 { background: #d1fae5; border-color: #10b981; }
    .typ-stavby h3 { margin: 0 0 10px 0; font-size: 22px; }
    .typ-stavby ul { margin: 10px 0; padding-left: 20px; }
    .typ-stavby li { margin: 5px 0; }
    
    .info-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .info-box h4 { margin: 0 0 10px 0; color: #065f46; font-size: 16px; }
    .info-box ul { margin: 0; padding-left: 20px; color: #047857; }
    .info-box li { margin: 5px 0; font-size: 14px; }
    
    .house-img { width: 100%; max-height: 400px; object-fit: contain; background: #f9fafb; border-radius: 8px; margin: 15px 0; }
    .img-wrapper { position: relative; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.3); font-size: 48px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none; }
    
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #EF4444; color: white; padding: 12px; text-align: left; font-size: 14px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tr:nth-child(even) { background: #f9fafb; }
    .section-row { background: #3b82f6 !important; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    .selected-row { color: #059669; font-weight: bold; }
    .not-selected-row { color: #dc2626; text-decoration: line-through; }
    .base-row { background: #dbeafe !important; font-weight: bold; color: #1e40af; }
    
    .total-box { background: linear-gradient(135deg, #065f46, #047857); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; border: 3px solid #10b981; }
    .total-box .label { font-size: 16px; opacity: 1; color: #d1fae5; font-weight: bold; }
    .total-box .amount { font-size: 48px; font-weight: bold; margin-top: 10px; color: #ffffff !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .gallery-item { position: relative; border-radius: 8px; overflow: hidden; }
    .gallery-item img { width: 100%; height: auto; display: block; object-fit: cover; min-height: 200px; max-height: 400px; }
    .gallery-caption { background: #f3f4f6; padding: 8px; text-align: center; font-size: 12px; color: #6b7280; }
    .podorys-img { width: 100% !important; height: auto !important; display: block !important; object-fit: contain !important; max-height: none !important; }
    
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png" alt="American Living" style="height: 60px; margin-bottom: 15px;">
      <h1>${t(langCode, 'priceQuote')}</h1>
      <p style="font-size: 16px; opacity: 0.95;">${t(langCode, 'quoteNumber')} ${cisloPonuky}</p>
      <p style="font-size: 14px; opacity: 0.9;">${t(langCode, 'date')} ${new Date().toLocaleDateString(dateLocale)}</p>
    </div>

    <div class="content">
      <!-- Typ stavby -->
      <div class="typ-stavby ${typStavby === 'rodinny_dom_a0' ? 'a0' : 'rekreacna'}">
        ${typStavby === 'rodinny_dom_a0' ? `
          <h3><span style="font-size: 28px;">🏡</span> ${t(langCode, 'familyHouseA0')}</h3>
          <div style="display: inline-block; background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px;">${t(langCode, 'recommended')}</div>
          <ul style="margin: 10px 0; color: #065f46;">
            <li>${t(langCode, 'yearRoundLiving')}</li>
            <li>${t(langCode, 'energyCertA0')}</li>
            <li>${t(langCode, 'premiumInsulation')}</li>
            <li>${t(langCode, 'heatPumpRecup')}</li>
            <li>${t(langCode, 'permanentResidence')}</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #047857; font-style: italic;">${t(langCode, 'meetsAllNorms')}</p>
        ` : `
          <h3><span style="font-size: 28px;">🏕️</span> ${t(langCode, 'recreationalBuilding')}</h3>
          <div style="display: inline-block; background: #f59e0b; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px;">${t(langCode, 'economicChoice')}</div>
          <ul style="margin: 10px 0; color: #92400e;">
            <li>${t(langCode, 'cottage')}</li>
            <li>${t(langCode, 'standardInsulation')}</li>
            <li>${t(langCode, 'noEnergyCert')}</li>
            <li>${t(langCode, 'lowerPrice')}</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #b45309; font-style: italic;">${t(langCode, 'recreationalParams')}</p>
        `}
      </div>

      <!-- Klient info -->
      <div class="section">
        <div class="section-title">${t(langCode, 'forClient')}</div>
        <p style="margin: 8px 0;"><strong>${t(langCode, 'name')}</strong> ${klient_meno}</p>
        <p style="margin: 8px 0;"><strong>${t(langCode, 'email')}</strong> ${klient_email}</p>
        <p style="margin: 8px 0;"><strong>${t(langCode, 'phone')}</strong> ${klient_telefon}</p>
        ${klient_adresa ? `<p style="margin: 8px 0;"><strong>${t(langCode, 'location')}</strong> ${klient_adresa}</p>` : ''}
        ${klient_poznamka ? `<p style="margin: 8px 0;"><strong>${t(langCode, 'note')}</strong> ${klient_poznamka}</p>` : ''}
      </div>

      <!-- Dodatočné služby -->
      ${(predajNehnutelnosti || hladaniePozemku || financneSluzby) ? `
      <div class="section">
        <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">✨</span> ${t(langCode, 'additionalServices')}
          </h3>
          ${predajNehnutelnosti ? `
          <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">${t(langCode, 'realEstateSale')}</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">${t(langCode, 'realEstateSaleDesc')}</p>
          </div>
          ` : ''}
          ${hladaniePozemku ? `
          <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">${t(langCode, 'landSearch')}</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">${t(langCode, 'landSearchDesc')}</p>
          </div>
          ` : ''}
          ${financneSluzby ? `
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">${t(langCode, 'financialServices')}</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">${t(langCode, 'financialServicesDesc')}</p>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Vybraný model -->
      <div class="section">
        <div class="section-title">${t(langCode, 'selectedModel')}</div>
        <div class="img-wrapper">
          <img src="${hlavnaFotka}" alt="${dom.nazov}" class="house-img">
          <div class="watermark">American Living</div>
        </div>
        <h2 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 26px;">${dom.nazov}</h2>
        <p style="margin: 5px 0; color: #6b7280;"><strong>${t(langCode, 'manufacturer')}</strong> ${dom.vyrobca}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>${t(langCode, 'houseType')}</strong> ${dom.typ_domu}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>${t(langCode, 'builtArea')}</strong> ${dom.zastavana_plocha} m²</p>
      </div>

      <!-- Sprievodné texty - BEZ info-box sekcií -->

      <!-- Cenový rozpis -->
      <div class="section">
        <div class="section-title">${t(langCode, 'priceBreakdown')}</div>
        <table>
          <thead>
            <tr>
              <th>${t(langCode, 'item')}</th>
              <th style="text-align: right;">${t(langCode, 'priceWithVAT')}</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems?.map(item => {
              const isBase = item.section === "base";
              const isSectionHeader = item.name === "HRUBÁ STAVBA" || item.name === "HOLODOM" || item.name === "DOM NA KĽÚČ" || item.name === "DOKUMENTÁCIA";

              if (isSectionHeader) {
                const icon = item.name === "HRUBÁ STAVBA" ? "🏗️" : 
                            item.name === "HOLODOM" ? "🔨" : 
                            item.name === "DOM NA KĽÚČ" ? "🔑" : "📋";
                const translatedName = item.name === "HRUBÁ STAVBA" ? t(langCode, 'shellConstruction') :
                                      item.name === "HOLODOM" ? t(langCode, 'shellHouse') :
                                      item.name === "DOM NA KĽÚČ" ? t(langCode, 'turnkeyHouse') :
                                      t(langCode, 'documentation');
                return `<tr class="section-row"><td colspan="2">${icon} ${translatedName}</td></tr>`;
              }

              const rowClass = item.selected ? 'selected-row' : 'not-selected-row';
              const baseClass = isBase ? 'base-row' : rowClass;
              const translatedItemName = translateItemName(item.name, langCode);

              return `
                <tr class="${baseClass}">
                  <td>${isBase ? '<strong>' + translatedItemName + '</strong>' : translatedItemName}</td>
                  <td style="text-align: right;">${isBase ? '<strong>' + formatPrice(item.price) + '</strong>' : (item.selected ? formatPrice(item.price) : '—')}</td>
                </tr>
              `;
            }).join('') || ''}
          </tbody>
        </table>
      </div>

      <!-- Celková cena -->
      <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; border: 3px solid #10b981;">
        <div style="font-size: 16px; color: #000000; font-weight: bold;">${t(langCode, 'totalPriceWithVAT')}</div>
        <div style="font-size: 48px; color: #000000; font-weight: bold; margin-top: 10px;">${formatPrice(totalPrice)}</div>
      </div>

      <!-- Pôdorysy -->
      ${(dom.podorys_2d || dom.podorys_3d) ? `
      <div class="section">
        <div class="section-title">${t(langCode, 'floorPlans')}</div>
        ${dom.podorys_2d ? `
        <div style="margin-bottom: 20px;">
          <div style="position: relative; text-align: center;">
            <img src="${dom.podorys_2d}" alt="${t(langCode, 'floorPlan2D')}" style="width: 100%; height: auto; display: block; object-fit: contain; border-radius: 8px; background: #f9fafb;">
            <div class="watermark" style="font-size: 32px;">American Living</div>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">${t(langCode, 'floorPlan2D')}</p>
        </div>
        ` : ''}
        ${dom.podorys_3d ? `
        <div style="margin-bottom: 20px;">
          <div style="position: relative; text-align: center;">
            <img src="${dom.podorys_3d}" alt="${t(langCode, 'floorPlan3D')}" style="width: 100%; height: auto; display: block; object-fit: contain; border-radius: 8px; background: #f9fafb;">
            <div class="watermark" style="font-size: 32px;">American Living</div>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">${t(langCode, 'floorPlan3D')}</p>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Fotogalérie - VŠETKY v plnom rozlíšení -->
      ${galerie.length > 0 ? `
      <div class="section">
        <div class="section-title">${t(langCode, 'photoGallery')}</div>
        ${galerie.map(g => `
          <h3 style="color: #374151; font-size: 16px; margin: 20px 0 10px 0;">${g.nazov}</h3>
          ${g.fotky.map((fotka, idx) => `
          <div class="image-container" style="margin: 15px 0;">
            <img src="${fotka}" alt="${g.nazov} ${idx + 1}" style="width: 100%; height: auto; display: block; border-radius: 8px;">
            <div class="watermark" style="font-size: 32px;">American Living</div>
            <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">${g.nazov} - ${t(langCode, 'photo')} ${idx + 1}</p>
          </div>
          `).join('')}
        `).join('')}
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">American Living</p>
      <p style="margin: 8px 0;">📞 ${t(langCode, 'phone')} <a href="tel:+421905138124">+421 905 138 124</a></p>
      <p style="margin: 8px 0;">✉️ ${t(langCode, 'email')} <a href="mailto:info@americanliving.sk">info@americanliving.sk</a></p>
      <p style="margin: 8px 0;">🌐 Web: <a href="https://www.americanliving.sk">www.americanliving.sk</a></p>
      <div style="margin: 20px 0;">
        <p style="margin-bottom: 10px; font-size: 13px; color: #9ca3af;">${t(langCode, 'followUs')}</p>
        <p style="margin: 5px 0;">
          <a href="https://www.facebook.com/americanliving.sk" style="margin: 0 10px;">Facebook</a>
          <a href="https://www.instagram.com/americanliving.sk" style="margin: 0 10px;">Instagram</a>
        </p>
      </div>
      <p style="margin: 20px 0 5px 0; font-size: 11px;">&copy; ${new Date().getFullYear()} American Living. ${t(langCode, 'allRightsReserved')}</p>
    </div>
  </div>
</body>
</html>
    `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    console.log('📧 Posielam email klientovi:', klient_email);
    
    // Odošli email klientovi
    const response1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'American Living <info@americanliving.sk>',
        to: klient_email,
        subject: `Cenová ponuka ${cisloPonuky} - ${dom.nazov} - American Living`,
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
        subject: `[KÓPIA] Cenová ponuka ${cisloPonuky} - ${dom.nazov} - ${klient_meno}`,
        html: `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">📋 Interná kópia cenovej ponuky</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Klient:</strong> ${klient_meno}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${klient_email}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Telefón:</strong> ${klient_telefon}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Celková cena:</strong> ${formatPrice(totalPrice)}</p>
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
    const novaPonuka = await base44.asServiceRole.entities.CenovaPonuka.create({
      cislo_ponuky: cisloPonuky,
      dom_id: dom.id,
      dom_nazov: dom.nazov,
      klient_meno,
      klient_email,
      klient_telefon,
      klient_adresa: klient_adresa || '',
      konfigurator_data: payload,
      celkova_cena: totalPrice,
      status: 'odoslana',
      odoslana: true,
      datum_odoslania: new Date().toISOString(),
      predajca_email: user?.email || 'system',
      poznamka: klient_poznamka || ''
    });

    // CRM aktivita
    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'odoslana_ponuka',
      ponuka_id: novaPonuka.id,
      klient_email,
      klient_meno,
      predajca_email: user?.email || 'system',
      popis: `Odoslaná cenová ponuka ${cisloPonuky} - ${dom.nazov} - ${formatPrice(totalPrice)}`,
      metadata: {
        cislo_ponuky: cisloPonuky,
        dom_nazov: dom.nazov,
        celkova_cena: totalPrice,
        lokalita: klient_adresa,
        typ_stavby: typStavby
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