import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  sk: {
    // Navigation
    home: "Domov",
    catalog: "Katalóg domov",
    gallery: "Galéria realizácií",
    configurator: "Konfigurátor",
    about: "O nás",
    contact: "Kontakt",
    
    // Common
    price: "Cena",
    priceFrom: "Cena od",
    withVAT: "s DPH",
    total: "Celkom",
    totalWithVAT: "Celkom s DPH",
    reset: "Resetovať",
    interested: "Mám záujem",
    interestedInConfig: "Mám záujem o túto konfiguráciu",
    back: "Späť",
    backToCatalog: "Späť do katalógu",
    close: "Zavrieť",
    save: "Uložiť",
    cancel: "Zrušiť",
    send: "Odoslať",
    loading: "Načítavam...",
    
    // House types
    modular: "Modulárny dom",
    prefab: "Montovaný dom",
    mobile: "Mobilný dom",
    yearRound: "CELOROČNÝ",
    certificateA0: "CERTIFIKÁT A0",
    
    // Parameters
    manufacturer: "Výrobca",
    houseType: "Typ domu",
    rooms: "Počet izieb",
    builtArea: "Zastavaná plocha",
    usableArea: "Úžitková plocha",
    energyClass: "Energetická trieda",
    
    // Configurator phases
    phase: "Fáza",
    phase1: "Hrubá stavba",
    phase1Subtitle: "Konštrukcia, izolácia a základy",
    phase2: "Holodom",
    phase2Subtitle: "Montáž konštrukcie a technické inštalácie",
    phase3: "Dom na kľúč",
    phase3Subtitle: "Interiérové úpravy a dokončovacie práce",
    phase4: "Dokumentácia a služby",
    phase4Subtitle: "Projektová dokumentácia, povolenia a doprava",
    
    // Configuration options
    assembly: "Montáž hrubej stavby",
    assemblyYes: "S montážou",
    assemblyNo: "Bez montáže",
    selfAssembly: "Svojpomocná montáž",
    
    insulation: "Izolácia",
    insulationStandard: "Celoročná izolácia",
    insulationStandardDesc: "Spĺňa parametre rekreačnej stavby",
    insulationEnhanced: "Zvýšená izolácia",
    insulationEnhancedDesc: "200mm steny, 250mm strecha",
    insulationPremium: "Premium izolácia A0",
    insulationPremiumDesc: "250mm steny, 300mm strecha",
    
    foundations: "Základy",
    foundationsNone: "Bez základov",
    foundationsScrews: "Zemné skrutky / Pätky",
    foundationsSlab: "Základová doska",
    foundationsStrip: "Pásové základy",
    
    interiorFinish: "Interiér finiš",
    interiorNone: "Bez interiéru",
    interiorWood: "Drevo",
    interiorDrywall: "Sadrokartón",
    shellConstruction: "Hrubá stavba",
    woodCladding: "Obloženie",
    plaster: "Omietka",
    
    electrical: "Elektro",
    electricalFull: "Elektrická inštalácia",
    wiring: "Rozvody",
    
    water: "Voda",
    waterFull: "Rozvody vody a kanalizácie",
    
    sanitary: "Sanita",
    sanitaryFull: "Sanita komplet",
    complete: "Komplet",
    
    boiler: "Bojler",
    boilerElectric: "Elektrický",
    
    heatPump: "Tep. čerpadlo",
    heatPumpFull: "Tepelné čerpadlo / Klimatizácia",
    units5: "5 jednotiek",
    
    recuperation: "Rekuperácia",
    
    gridConnection: "Siete",
    gridConnectionFull: "Pripojenie na siete",
    connection: "Pripojenie",
    
    lamination: "Laminácia",
    laminationAnthracite: "Antracit",
    
    tintedGlass: "Tónované",
    solarGlass: "Solar sklá",
    
    entryDoor: "Vstupné dvere",
    doorStandard: "Štandard",
    doorMetal: "Kovové",
    doorPlastic: "Plastové",
    
    additionalWindows: "Doplnkové okná",
    roofWindow: "Strešné",
    fixedWindow: "Fixné",
    tiltWindow: "Výkl.",
    
    facade: "Fasáda",
    facadeWoodMetal: "Drevo/Plech",
    facadeStandard: "Štandardná",
    facadeStucco: "Škúchaná",
    whitePlaster: "Biela omietka",
    
    floors: "Podlahy",
    floorsLaminate: "Laminát",
    
    floorHeating: "Podl. kúrenie",
    floorHeatingFull: "Elektrické podlahové vykurovanie s WiFi termostatom",
    wifiThermostat: "WiFi termostat",
    
    interiorDoors: "Interiérové dvere",
    
    pergola: "Pergola",
    pergolaDecorative: "Dekoratívna",
    
    engineering: "Inžiniering",
    engineeringFull: "Inžiniering stavebného povolenia",
    buildingPermit: "Stav. povolenie",
    
    projectA0: "Projektant",
    projectA0Full: "Projektant a certifikácia A0",
    certification: "+ Certifikácia",
    
    revision: "Revízie",
    revisionFull: "Revízna dokumentácia",
    documentation: "Dokumentácia",
    
    transport: "Doprava",
    transportFull: "Transport",
    
    // Configuration summary
    yourConfiguration: "Vaša konfigurácia",
    basePriceSelfAssembly: "Základná cena sady (svojpomocná montáž)",
    completeCalculation: "Kompletná cenová kalkulácia",
    meetsA0: "Spĺňa A0",
    configMeetsA0: "Konfigurácia spĺňa A0!",
    a0Recommendations: "Pre A0 odporúčame:",
    selectedItems: "Vybrané položky",
    
    // Usage options
    usageOptions: "Možnosti využitia:",
    familyHouseOption: "Rodinný dom s možnosťou kolaudácie",
    a0CertificateOption: "Možnosť energetického certifikátu A0",
    recreationalOption: "Rekreačná budova (chata/záhradný domček)",
    
    // Contact
    contactUs: "Kontaktujte nás",
    writeUs: "Napíšte nám",
    name: "Meno a priezvisko",
    email: "Email",
    phone: "Telefón",
    message: "Vaša správa",
    sendMessage: "Odoslať správu",
    thankYou: "Ďakujeme za vašu správu!",
    messageSuccess: "Vaša správa bola úspešne odoslaná. Ozveme sa vám čo najskôr, zvyčajne do 24 hodín.",
    
    // House detail
    basicParameters: "Základné parametre",
    basicConfiguration: "Základná konfigurácia",
    basicConfigDesc: "Takto vyzerá dom v základnej konfigurácii",
    floorPlans: "Pôdorysy",
    galleries: "Galérie",
    videoPresentation: "Video prezentácia",
    outerDimensions: "Vonkajšie rozmery",
    width: "Šírka",
    length: "Dĺžka",
    height: "Výška",
    ceilingHeight: "Výška stropu",
    description: "Popis",
    specification: "Špecifikácia",
    
    // Building type selection
    selectBuildingType: "Vyberte typ stavby",
    recreationalHouse: "Rekreačná stavba",
    recreationalHouseDesc: "Vhodné pre víkendové bývanie, chaty a záhradné domčeky",
    familyHouse: "Rodinný dom",
    familyHouseDesc: "Celoročné bývanie s energetickým certifikátom A0",
    
    // Footer
    allRightsReserved: "Všetky práva vyhradené",
    builtHouses: "Vyrobených viac ako 700 domov od roku 2008",
    navigation: "Navigácia",
    poweredByAI: "Powered by AI",
  },
  
  en: {
    // Navigation
    home: "Home",
    catalog: "House Catalog",
    gallery: "Realization Gallery",
    configurator: "Configurator",
    about: "About Us",
    contact: "Contact",
    
    // Common
    price: "Price",
    priceFrom: "Price from",
    withVAT: "incl. VAT",
    total: "Total",
    totalWithVAT: "Total incl. VAT",
    reset: "Reset",
    interested: "I'm interested",
    interestedInConfig: "I'm interested in this configuration",
    back: "Back",
    backToCatalog: "Back to catalog",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    send: "Send",
    loading: "Loading...",
    
    // House types
    modular: "Modular house",
    prefab: "Prefab house",
    mobile: "Mobile house",
    yearRound: "YEAR-ROUND",
    certificateA0: "CERTIFICATE A0",
    
    // Parameters
    manufacturer: "Manufacturer",
    houseType: "House type",
    rooms: "Number of rooms",
    builtArea: "Built area",
    usableArea: "Usable area",
    energyClass: "Energy class",
    
    // Configurator phases
    phase: "Phase",
    phase1: "Shell construction",
    phase1Subtitle: "Construction, insulation and foundations",
    phase2: "Shell house",
    phase2Subtitle: "Structure assembly and technical installations",
    phase3: "Turnkey house",
    phase3Subtitle: "Interior finishing and completion works",
    phase4: "Documentation and services",
    phase4Subtitle: "Project documentation, permits and transport",
    
    // Configuration options
    assembly: "Shell assembly",
    assemblyYes: "With assembly",
    assemblyNo: "Without assembly",
    selfAssembly: "Self-assembly",
    
    insulation: "Insulation",
    insulationStandard: "Year-round insulation",
    insulationStandardDesc: "Meets recreational building parameters",
    insulationEnhanced: "Enhanced insulation",
    insulationEnhancedDesc: "200mm walls, 250mm roof",
    insulationPremium: "Premium insulation A0",
    insulationPremiumDesc: "250mm walls, 300mm roof",
    
    foundations: "Foundations",
    foundationsNone: "No foundations",
    foundationsScrews: "Ground screws / Footings",
    foundationsSlab: "Foundation slab",
    foundationsStrip: "Strip foundations",
    
    interiorFinish: "Interior finish",
    interiorNone: "No interior",
    interiorWood: "Wood",
    interiorDrywall: "Drywall",
    shellConstruction: "Shell construction",
    woodCladding: "Cladding",
    plaster: "Plaster",
    
    electrical: "Electrical",
    electricalFull: "Electrical installation",
    wiring: "Wiring",
    
    water: "Water",
    waterFull: "Water and sewage pipes",
    
    sanitary: "Sanitary",
    sanitaryFull: "Complete sanitary",
    complete: "Complete",
    
    boiler: "Boiler",
    boilerElectric: "Electric",
    
    heatPump: "Heat pump",
    heatPumpFull: "Heat pump / Air conditioning",
    units5: "5 units",
    
    recuperation: "Recuperation",
    
    gridConnection: "Grid",
    gridConnectionFull: "Grid connection",
    connection: "Connection",
    
    lamination: "Lamination",
    laminationAnthracite: "Anthracite",
    
    tintedGlass: "Tinted",
    solarGlass: "Solar glass",
    
    entryDoor: "Entry door",
    doorStandard: "Standard",
    doorMetal: "Metal",
    doorPlastic: "Plastic",
    
    additionalWindows: "Additional windows",
    roofWindow: "Roof",
    fixedWindow: "Fixed",
    tiltWindow: "Tilt",
    
    facade: "Facade",
    facadeWoodMetal: "Wood/Metal",
    facadeStandard: "Standard",
    facadeStucco: "Stucco",
    whitePlaster: "White plaster",
    
    floors: "Floors",
    floorsLaminate: "Laminate",
    
    floorHeating: "Floor heating",
    floorHeatingFull: "Electric floor heating with WiFi thermostat",
    wifiThermostat: "WiFi thermostat",
    
    interiorDoors: "Interior doors",
    
    pergola: "Pergola",
    pergolaDecorative: "Decorative",
    
    engineering: "Engineering",
    engineeringFull: "Building permit engineering",
    buildingPermit: "Building permit",
    
    projectA0: "Project",
    projectA0Full: "Project and A0 certification",
    certification: "+ Certification",
    
    revision: "Revisions",
    revisionFull: "Revision documentation",
    documentation: "Documentation",
    
    transport: "Transport",
    transportFull: "Transport",
    
    // Configuration summary
    yourConfiguration: "Your configuration",
    basePriceSelfAssembly: "Base kit price (self-assembly)",
    completeCalculation: "Complete price calculation",
    meetsA0: "Meets A0",
    configMeetsA0: "Configuration meets A0!",
    a0Recommendations: "For A0 we recommend:",
    selectedItems: "Selected items",
    
    // Usage options
    usageOptions: "Usage options:",
    familyHouseOption: "Family house with approval possibility",
    a0CertificateOption: "A0 energy certificate option",
    recreationalOption: "Recreational building (cottage/garden house)",
    
    // Contact
    contactUs: "Contact us",
    writeUs: "Write to us",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    message: "Your message",
    sendMessage: "Send message",
    thankYou: "Thank you for your message!",
    messageSuccess: "Your message has been successfully sent. We will contact you as soon as possible, usually within 24 hours.",
    
    // House detail
    basicParameters: "Basic parameters",
    basicConfiguration: "Basic configuration",
    basicConfigDesc: "This is how the house looks in basic configuration",
    floorPlans: "Floor plans",
    galleries: "Galleries",
    videoPresentation: "Video presentation",
    outerDimensions: "Outer dimensions",
    width: "Width",
    length: "Length",
    height: "Height",
    ceilingHeight: "Ceiling height",
    description: "Description",
    specification: "Specification",
    
    // Building type selection
    selectBuildingType: "Select building type",
    recreationalHouse: "Recreational building",
    recreationalHouseDesc: "Suitable for weekend living, cottages and garden houses",
    familyHouse: "Family house",
    familyHouseDesc: "Year-round living with A0 energy certificate",
    
    // Footer
    allRightsReserved: "All rights reserved",
    builtHouses: "More than 700 houses built since 2008",
    navigation: "Navigation",
    poweredByAI: "Powered by AI",
  },
  
  hu: {
    // Navigation
    home: "Kezdőlap",
    catalog: "Házkatalógus",
    gallery: "Megvalósítási galéria",
    configurator: "Konfigurátor",
    about: "Rólunk",
    contact: "Kapcsolat",
    
    // Common
    price: "Ár",
    priceFrom: "Ártól",
    withVAT: "ÁFA-val",
    total: "Összesen",
    totalWithVAT: "Összesen ÁFA-val",
    reset: "Visszaállítás",
    interested: "Érdekel",
    interestedInConfig: "Érdekel ez a konfiguráció",
    back: "Vissza",
    backToCatalog: "Vissza a katalógushoz",
    close: "Bezárás",
    save: "Mentés",
    cancel: "Mégse",
    send: "Küldés",
    loading: "Betöltés...",
    
    // House types
    modular: "Moduláris ház",
    prefab: "Előregyártott ház",
    mobile: "Mobilház",
    yearRound: "EGÉSZ ÉVES",
    certificateA0: "A0 TANÚSÍTVÁNY",
    
    // Parameters
    manufacturer: "Gyártó",
    houseType: "Ház típusa",
    rooms: "Szobák száma",
    builtArea: "Beépített terület",
    usableArea: "Hasznos terület",
    energyClass: "Energiaosztály",
    
    // Configurator phases
    phase: "Fázis",
    phase1: "Szerkezetkész",
    phase1Subtitle: "Szerkezet, szigetelés és alapok",
    phase2: "Félkész ház",
    phase2Subtitle: "Szerkezet összeszerelése és műszaki telepítések",
    phase3: "Kulcsrakész ház",
    phase3Subtitle: "Belső befejezési és befejező munkák",
    phase4: "Dokumentáció és szolgáltatások",
    phase4Subtitle: "Projektdokumentáció, engedélyek és szállítás",
    
    // Configuration options
    assembly: "Szerkezetkész összeszerelés",
    assemblyYes: "Szereléssel",
    assemblyNo: "Szerelés nélkül",
    selfAssembly: "Saját összeszerelés",
    
    insulation: "Szigetelés",
    insulationStandard: "Egész éves szigetelés",
    insulationStandardDesc: "Megfelel a rekreációs épület paramétereinek",
    insulationEnhanced: "Fokozott szigetelés",
    insulationEnhancedDesc: "200mm falak, 250mm tető",
    insulationPremium: "Prémium szigetelés A0",
    insulationPremiumDesc: "250mm falak, 300mm tető",
    
    foundations: "Alapok",
    foundationsNone: "Alapok nélkül",
    foundationsScrews: "Talajcsavarok / Lábazatok",
    foundationsSlab: "Alaplemez",
    foundationsStrip: "Sávalapok",
    
    interiorFinish: "Belső burkolat",
    interiorNone: "Belső nélkül",
    interiorWood: "Fa",
    interiorDrywall: "Gipszkarton",
    shellConstruction: "Szerkezetkész",
    woodCladding: "Burkolat",
    plaster: "Vakolat",
    
    electrical: "Elektromos",
    electricalFull: "Elektromos telepítés",
    wiring: "Vezetékek",
    
    water: "Víz",
    waterFull: "Víz- és csatornacsövek",
    
    sanitary: "Szaniter",
    sanitaryFull: "Komplett szaniter",
    complete: "Komplett",
    
    boiler: "Bojler",
    boilerElectric: "Elektromos",
    
    heatPump: "Hőszivattyú",
    heatPumpFull: "Hőszivattyú / Légkondicionálás",
    units5: "5 egység",
    
    recuperation: "Rekuperáció",
    
    gridConnection: "Hálózat",
    gridConnectionFull: "Hálózati csatlakozás",
    connection: "Csatlakozás",
    
    lamination: "Lamináció",
    laminationAnthracite: "Antracit",
    
    tintedGlass: "Színezett",
    solarGlass: "Napvédő üveg",
    
    entryDoor: "Bejárati ajtó",
    doorStandard: "Standard",
    doorMetal: "Fém",
    doorPlastic: "Műanyag",
    
    additionalWindows: "További ablakok",
    roofWindow: "Tetőablak",
    fixedWindow: "Fix",
    tiltWindow: "Bukó",
    
    facade: "Homlokzat",
    facadeWoodMetal: "Fa/Fém",
    facadeStandard: "Standard",
    facadeStucco: "Vakolat",
    whitePlaster: "Fehér vakolat",
    
    floors: "Padlók",
    floorsLaminate: "Laminált",
    
    floorHeating: "Padlófűtés",
    floorHeatingFull: "Elektromos padlófűtés WiFi termosztáttal",
    wifiThermostat: "WiFi termosztát",
    
    interiorDoors: "Beltéri ajtók",
    
    pergola: "Pergola",
    pergolaDecorative: "Dekoratív",
    
    engineering: "Mérnöki",
    engineeringFull: "Építési engedély mérnöki",
    buildingPermit: "Építési engedély",
    
    projectA0: "Projekt",
    projectA0Full: "Projekt és A0 tanúsítás",
    certification: "+ Tanúsítás",
    
    revision: "Felülvizsgálat",
    revisionFull: "Felülvizsgálati dokumentáció",
    documentation: "Dokumentáció",
    
    transport: "Szállítás",
    transportFull: "Szállítás",
    
    // Configuration summary
    yourConfiguration: "Az Ön konfigurációja",
    basePriceSelfAssembly: "Alapcsomag ára (saját összeszerelés)",
    completeCalculation: "Teljes árkalkuláció",
    meetsA0: "Megfelel A0",
    configMeetsA0: "A konfiguráció megfelel az A0-nak!",
    a0Recommendations: "A0-hoz ajánljuk:",
    selectedItems: "Kiválasztott elemek",
    
    // Usage options
    usageOptions: "Felhasználási lehetőségek:",
    familyHouseOption: "Családi ház jóváhagyási lehetőséggel",
    a0CertificateOption: "A0 energetikai tanúsítvány lehetőség",
    recreationalOption: "Rekreációs épület (nyaraló/kerti ház)",
    
    // Contact
    contactUs: "Kapcsolatfelvétel",
    writeUs: "Írjon nekünk",
    name: "Teljes név",
    email: "Email",
    phone: "Telefon",
    message: "Üzenete",
    sendMessage: "Üzenet küldése",
    thankYou: "Köszönjük üzenetét!",
    messageSuccess: "Üzenete sikeresen elküldve. Hamarosan felvesszük Önnel a kapcsolatot, általában 24 órán belül.",
    
    // House detail
    basicParameters: "Alapvető paraméterek",
    basicConfiguration: "Alapkonfiguráció",
    basicConfigDesc: "Így néz ki a ház alapkonfigurációban",
    floorPlans: "Alaprajzok",
    galleries: "Galériák",
    videoPresentation: "Videó bemutató",
    outerDimensions: "Külső méretek",
    width: "Szélesség",
    length: "Hosszúság",
    height: "Magasság",
    ceilingHeight: "Belmagasság",
    description: "Leírás",
    specification: "Specifikáció",
    
    // Building type selection
    selectBuildingType: "Válassza ki az épület típusát",
    recreationalHouse: "Rekreációs épület",
    recreationalHouseDesc: "Alkalmas hétvégi tartózkodásra, nyaralókhoz és kerti házakhoz",
    familyHouse: "Családi ház",
    familyHouseDesc: "Egész éves lakhatás A0 energetikai tanúsítvánnyal",
    
    // Footer
    allRightsReserved: "Minden jog fenntartva",
    builtHouses: "Több mint 700 ház épült 2008 óta",
    navigation: "Navigáció",
    poweredByAI: "Powered by AI",
  },
  
  pl: {
    // Navigation
    home: "Strona główna",
    catalog: "Katalog domów",
    gallery: "Galeria realizacji",
    configurator: "Konfigurator",
    about: "O nas",
    contact: "Kontakt",
    
    // Common
    price: "Cena",
    priceFrom: "Cena od",
    withVAT: "z VAT",
    total: "Razem",
    totalWithVAT: "Razem z VAT",
    reset: "Resetuj",
    interested: "Jestem zainteresowany",
    interestedInConfig: "Jestem zainteresowany tą konfiguracją",
    back: "Wstecz",
    backToCatalog: "Wróć do katalogu",
    close: "Zamknij",
    save: "Zapisz",
    cancel: "Anuluj",
    send: "Wyślij",
    loading: "Ładowanie...",
    
    // House types
    modular: "Dom modułowy",
    prefab: "Dom prefabrykowany",
    mobile: "Dom mobilny",
    yearRound: "CAŁOROCZNY",
    certificateA0: "CERTYFIKAT A0",
    
    // Parameters
    manufacturer: "Producent",
    houseType: "Typ domu",
    rooms: "Liczba pokoi",
    builtArea: "Powierzchnia zabudowy",
    usableArea: "Powierzchnia użytkowa",
    energyClass: "Klasa energetyczna",
    
    // Configurator phases
    phase: "Faza",
    phase1: "Stan surowy",
    phase1Subtitle: "Konstrukcja, izolacja i fundamenty",
    phase2: "Dom w stanie surowym",
    phase2Subtitle: "Montaż konstrukcji i instalacje techniczne",
    phase3: "Dom pod klucz",
    phase3Subtitle: "Wykończenie wnętrz i prace wykończeniowe",
    phase4: "Dokumentacja i usługi",
    phase4Subtitle: "Dokumentacja projektowa, pozwolenia i transport",
    
    // Configuration options
    assembly: "Montaż stanu surowego",
    assemblyYes: "Z montażem",
    assemblyNo: "Bez montażu",
    selfAssembly: "Samodzielny montaż",
    
    insulation: "Izolacja",
    insulationStandard: "Izolacja całoroczna",
    insulationStandardDesc: "Spełnia parametry budynku rekreacyjnego",
    insulationEnhanced: "Wzmocniona izolacja",
    insulationEnhancedDesc: "200mm ściany, 250mm dach",
    insulationPremium: "Izolacja premium A0",
    insulationPremiumDesc: "250mm ściany, 300mm dach",
    
    foundations: "Fundamenty",
    foundationsNone: "Bez fundamentów",
    foundationsScrews: "Śruby gruntowe / Stopy",
    foundationsSlab: "Płyta fundamentowa",
    foundationsStrip: "Ławy fundamentowe",
    
    interiorFinish: "Wykończenie wnętrza",
    interiorNone: "Bez wnętrza",
    interiorWood: "Drewno",
    interiorDrywall: "Płyta gipsowa",
    shellConstruction: "Stan surowy",
    woodCladding: "Okładzina",
    plaster: "Tynk",
    
    electrical: "Elektryka",
    electricalFull: "Instalacja elektryczna",
    wiring: "Okablowanie",
    
    water: "Woda",
    waterFull: "Rury wodne i kanalizacyjne",
    
    sanitary: "Sanitarne",
    sanitaryFull: "Kompletne sanitarne",
    complete: "Komplet",
    
    boiler: "Bojler",
    boilerElectric: "Elektryczny",
    
    heatPump: "Pompa ciepła",
    heatPumpFull: "Pompa ciepła / Klimatyzacja",
    units5: "5 jednostek",
    
    recuperation: "Rekuperacja",
    
    gridConnection: "Sieci",
    gridConnectionFull: "Przyłącze do sieci",
    connection: "Przyłącze",
    
    lamination: "Laminacja",
    laminationAnthracite: "Antracyt",
    
    tintedGlass: "Przyciemniane",
    solarGlass: "Szyby solarne",
    
    entryDoor: "Drzwi wejściowe",
    doorStandard: "Standard",
    doorMetal: "Metalowe",
    doorPlastic: "Plastikowe",
    
    additionalWindows: "Dodatkowe okna",
    roofWindow: "Dachowe",
    fixedWindow: "Stałe",
    tiltWindow: "Uchylne",
    
    facade: "Elewacja",
    facadeWoodMetal: "Drewno/Metal",
    facadeStandard: "Standardowa",
    facadeStucco: "Tynkowa",
    whitePlaster: "Biały tynk",
    
    floors: "Podłogi",
    floorsLaminate: "Laminat",
    
    floorHeating: "Ogrzewanie podłogowe",
    floorHeatingFull: "Elektryczne ogrzewanie podłogowe z termostatem WiFi",
    wifiThermostat: "Termostat WiFi",
    
    interiorDoors: "Drzwi wewnętrzne",
    
    pergola: "Pergola",
    pergolaDecorative: "Dekoracyjna",
    
    engineering: "Inżynieria",
    engineeringFull: "Inżynieria pozwolenia na budowę",
    buildingPermit: "Pozwolenie na budowę",
    
    projectA0: "Projekt",
    projectA0Full: "Projekt i certyfikacja A0",
    certification: "+ Certyfikacja",
    
    revision: "Rewizje",
    revisionFull: "Dokumentacja rewizyjna",
    documentation: "Dokumentacja",
    
    transport: "Transport",
    transportFull: "Transport",
    
    // Configuration summary
    yourConfiguration: "Twoja konfiguracja",
    basePriceSelfAssembly: "Cena zestawu podstawowego (samodzielny montaż)",
    completeCalculation: "Kompletna kalkulacja cenowa",
    meetsA0: "Spełnia A0",
    configMeetsA0: "Konfiguracja spełnia A0!",
    a0Recommendations: "Dla A0 zalecamy:",
    selectedItems: "Wybrane elementy",
    
    // Usage options
    usageOptions: "Możliwości wykorzystania:",
    familyHouseOption: "Dom rodzinny z możliwością odbioru",
    a0CertificateOption: "Możliwość certyfikatu energetycznego A0",
    recreationalOption: "Budynek rekreacyjny (domek/altana)",
    
    // Contact
    contactUs: "Skontaktuj się z nami",
    writeUs: "Napisz do nas",
    name: "Imię i nazwisko",
    email: "Email",
    phone: "Telefon",
    message: "Twoja wiadomość",
    sendMessage: "Wyślij wiadomość",
    thankYou: "Dziękujemy za wiadomość!",
    messageSuccess: "Twoja wiadomość została pomyślnie wysłana. Skontaktujemy się z Tobą jak najszybciej, zwykle w ciągu 24 godzin.",
    
    // House detail
    basicParameters: "Podstawowe parametry",
    basicConfiguration: "Podstawowa konfiguracja",
    basicConfigDesc: "Tak wygląda dom w podstawowej konfiguracji",
    floorPlans: "Rzuty",
    galleries: "Galerie",
    videoPresentation: "Prezentacja wideo",
    outerDimensions: "Wymiary zewnętrzne",
    width: "Szerokość",
    length: "Długość",
    height: "Wysokość",
    ceilingHeight: "Wysokość sufitu",
    description: "Opis",
    specification: "Specyfikacja",
    
    // Building type selection
    selectBuildingType: "Wybierz typ budynku",
    recreationalHouse: "Budynek rekreacyjny",
    recreationalHouseDesc: "Odpowiedni do weekendowego zamieszkania, domków i altan",
    familyHouse: "Dom rodzinny",
    familyHouseDesc: "Całoroczne zamieszkanie z certyfikatem energetycznym A0",
    
    // Footer
    allRightsReserved: "Wszelkie prawa zastrzeżone",
    builtHouses: "Ponad 700 domów zbudowanych od 2008 roku",
    navigation: "Nawigacja",
    poweredByAI: "Powered by AI",
  },
  
  uk: {
    // Navigation
    home: "Головна",
    catalog: "Каталог будинків",
    gallery: "Галерея реалізацій",
    configurator: "Конфігуратор",
    about: "Про нас",
    contact: "Контакт",
    
    // Common
    price: "Ціна",
    priceFrom: "Ціна від",
    withVAT: "з ПДВ",
    total: "Всього",
    totalWithVAT: "Всього з ПДВ",
    reset: "Скинути",
    interested: "Мене цікавить",
    interestedInConfig: "Мене цікавить ця конфігурація",
    back: "Назад",
    backToCatalog: "Назад до каталогу",
    close: "Закрити",
    save: "Зберегти",
    cancel: "Скасувати",
    send: "Надіслати",
    loading: "Завантаження...",
    
    // House types
    modular: "Модульний будинок",
    prefab: "Збірний будинок",
    mobile: "Мобільний будинок",
    yearRound: "ЦІЛОРІЧНИЙ",
    certificateA0: "СЕРТИФІКАТ A0",
    
    // Parameters
    manufacturer: "Виробник",
    houseType: "Тип будинку",
    rooms: "Кількість кімнат",
    builtArea: "Забудована площа",
    usableArea: "Корисна площа",
    energyClass: "Енергетичний клас",
    
    // Configurator phases
    phase: "Фаза",
    phase1: "Каркас",
    phase1Subtitle: "Конструкція, ізоляція та фундамент",
    phase2: "Будинок під оздоблення",
    phase2Subtitle: "Монтаж конструкції та технічні інсталяції",
    phase3: "Будинок під ключ",
    phase3Subtitle: "Внутрішнє оздоблення та завершальні роботи",
    phase4: "Документація та послуги",
    phase4Subtitle: "Проектна документація, дозволи та транспортування",
    
    // Configuration options
    assembly: "Монтаж каркасу",
    assemblyYes: "З монтажем",
    assemblyNo: "Без монтажу",
    selfAssembly: "Самостійний монтаж",
    
    insulation: "Ізоляція",
    insulationStandard: "Цілорічна ізоляція",
    insulationStandardDesc: "Відповідає параметрам рекреаційної будівлі",
    insulationEnhanced: "Посилена ізоляція",
    insulationEnhancedDesc: "200мм стіни, 250мм дах",
    insulationPremium: "Преміум ізоляція A0",
    insulationPremiumDesc: "250мм стіни, 300мм дах",
    
    foundations: "Фундамент",
    foundationsNone: "Без фундаменту",
    foundationsScrews: "Ґрунтові гвинти / Опори",
    foundationsSlab: "Фундаментна плита",
    foundationsStrip: "Стрічковий фундамент",
    
    interiorFinish: "Внутрішнє оздоблення",
    interiorNone: "Без оздоблення",
    interiorWood: "Дерево",
    interiorDrywall: "Гіпсокартон",
    shellConstruction: "Каркас",
    woodCladding: "Обшивка",
    plaster: "Штукатурка",
    
    electrical: "Електрика",
    electricalFull: "Електрична інсталяція",
    wiring: "Проводка",
    
    water: "Вода",
    waterFull: "Водопровід та каналізація",
    
    sanitary: "Сантехніка",
    sanitaryFull: "Повна сантехніка",
    complete: "Повний",
    
    boiler: "Бойлер",
    boilerElectric: "Електричний",
    
    heatPump: "Тепловий насос",
    heatPumpFull: "Тепловий насос / Кондиціонер",
    units5: "5 одиниць",
    
    recuperation: "Рекуперація",
    
    gridConnection: "Мережі",
    gridConnectionFull: "Підключення до мереж",
    connection: "Підключення",
    
    lamination: "Ламінація",
    laminationAnthracite: "Антрацит",
    
    tintedGlass: "Тоноване",
    solarGlass: "Сонцезахисне скло",
    
    entryDoor: "Вхідні двері",
    doorStandard: "Стандарт",
    doorMetal: "Металеві",
    doorPlastic: "Пластикові",
    
    additionalWindows: "Додаткові вікна",
    roofWindow: "Дахові",
    fixedWindow: "Фіксовані",
    tiltWindow: "Відкидні",
    
    facade: "Фасад",
    facadeWoodMetal: "Дерево/Метал",
    facadeStandard: "Стандартний",
    facadeStucco: "Штукатурка",
    whitePlaster: "Біла штукатурка",
    
    floors: "Підлоги",
    floorsLaminate: "Ламінат",
    
    floorHeating: "Тепла підлога",
    floorHeatingFull: "Електрична тепла підлога з WiFi термостатом",
    wifiThermostat: "WiFi термостат",
    
    interiorDoors: "Внутрішні двері",
    
    pergola: "Пергола",
    pergolaDecorative: "Декоративна",
    
    engineering: "Інжиніринг",
    engineeringFull: "Інжиніринг будівельного дозволу",
    buildingPermit: "Будівельний дозвіл",
    
    projectA0: "Проект",
    projectA0Full: "Проект та сертифікація A0",
    certification: "+ Сертифікація",
    
    revision: "Ревізії",
    revisionFull: "Ревізійна документація",
    documentation: "Документація",
    
    transport: "Транспорт",
    transportFull: "Транспорт",
    
    // Configuration summary
    yourConfiguration: "Ваша конфігурація",
    basePriceSelfAssembly: "Базова ціна комплекту (самостійний монтаж)",
    completeCalculation: "Повний розрахунок ціни",
    meetsA0: "Відповідає A0",
    configMeetsA0: "Конфігурація відповідає A0!",
    a0Recommendations: "Для A0 рекомендуємо:",
    selectedItems: "Вибрані елементи",
    
    // Usage options
    usageOptions: "Варіанти використання:",
    familyHouseOption: "Сімейний будинок з можливістю прийому",
    a0CertificateOption: "Можливість енергетичного сертифіката A0",
    recreationalOption: "Рекреаційна будівля (дача/садовий будиночок)",
    
    // Contact
    contactUs: "Зв'яжіться з нами",
    writeUs: "Напишіть нам",
    name: "Повне ім'я",
    email: "Email",
    phone: "Телефон",
    message: "Ваше повідомлення",
    sendMessage: "Надіслати повідомлення",
    thankYou: "Дякуємо за ваше повідомлення!",
    messageSuccess: "Ваше повідомлення успішно надіслано. Ми зв'яжемося з вами якнайшвидше, зазвичай протягом 24 годин.",
    
    // House detail
    basicParameters: "Основні параметри",
    basicConfiguration: "Базова конфігурація",
    basicConfigDesc: "Так виглядає будинок у базовій конфігурації",
    floorPlans: "Планування",
    galleries: "Галереї",
    videoPresentation: "Відео презентація",
    outerDimensions: "Зовнішні розміри",
    width: "Ширина",
    length: "Довжина",
    height: "Висота",
    ceilingHeight: "Висота стелі",
    description: "Опис",
    specification: "Специфікація",
    
    // Building type selection
    selectBuildingType: "Виберіть тип будівлі",
    recreationalHouse: "Рекреаційна будівля",
    recreationalHouseDesc: "Підходить для відпочинку на вихідних, дач та садових будиночків",
    familyHouse: "Сімейний будинок",
    familyHouseDesc: "Цілорічне проживання з енергетичним сертифікатом A0",
    
    // Footer
    allRightsReserved: "Всі права захищені",
    builtHouses: "Понад 700 будинків побудовано з 2008 року",
    navigation: "Навігація",
    poweredByAI: "Powered by AI",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved || 'sk';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['sk']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
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

export const AVAILABLE_LANGUAGES = [
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];