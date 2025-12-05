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
    
    // Configurator specific
    selectOne: "vyberte jednu",
    required: "povinné",
    assemblyNote: "* Pri montáži sa dodatočne účtuje ubytovanie montážnej brigády (3–4 osoby)",
    a0Recommendation: "Pokiaľ si chcete poskladať rodinný dom s energetickým certifikátom A0 a možnosťou nahlásenia trvalého pobytu, je nutné vybrať všetky zelené položky s označením A0",
    onlyKit: "Iba sada",
    own: "Vlastné",
    groundFootings: "Zemné pätky",
    foundationSlab: "Základová",
    stripFound: "Základy",
    walls: "steny",
    roof: "strecha",
    missingItems: "Chýba {count} položiek",
    whatsMissing: "Čo chýba:",
    facadeRequired: "Fasáda - vyberte typ vonkajšej fasády",
    whyImportant: "Prečo je to dôležité:",
    cannotComplete: "Bez výberu fasády nie je možné dokončiť konfiguráciu a odoslať dopyt.",
    clickToShow: "Kliknite pre zobrazenie",
    photos: "fotiek",
    
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
    
    // Homepage
    affordableFamilyHouse: "Cenovo dostupný rodinný dom",
    directFromManufacturer: "Za cenu priamo od výrobcu! Bez navýšenia!",
    everythingYouNeed: "Všetko, čo potrebujete, máte presne tu! Naši kolegovia sa postarajú o kompletné vybavenie.",
    showOffer: "Zobraziť ponuku",
    consultation: "Konzultácia",
    allInOnePlace: "Všetko na jednom mieste",
    comprehensiveServices: "komplexné služby",
    comprehensiveServicesDesc: "Poskytujeme komplexné služby - od realitnej kancelárie cez finančné poradenstvo až po stavebnú realizáciu.",
    constructionCompany: "Stavebná firma",
    realEstateAgency: "Realitná kancelária",
    financialServices: "Finančné služby",
    youDontHaveToArrange: "Vy nemusíte vybavovať nič.",
    weHandleEverything: "Postaráme sa o celý proces od A po Z.",
    startProject: "Začať projekt",
    whyAmericanLiving: "Prečo American Living?",
    qualityBrand: "Značka kvality od overených dodávateľov s rokmi skúseností",
    priceDirectFromManufacturer: "Cena priamo od výrobcu",
    priceDirectDesc: "Bez navýšenia! Cenovo dostupný rodinný dom za najlepšie ceny.",
    fastConstruction: "Rýchla výstavba",
    fastConstructionDesc: "Váš dom môže byť hotový za pár mesiacov. Modulárna konštrukcia šetrí čas.",
    lowEnergy: "Nízkoenergetický A0",
    lowEnergyDesc: "Možnosť energetického certifikátu A0. Nízke náklady na vykurovanie.",
    withApproval: "S kolaudáciou",
    withApprovalDesc: "Všetko od projektu po kolaudáciu. Žiadne starosti s úradmi.",
    misleadingAdsWarning: "Pozor na zavádzajúce reklamy!",
    misleadingAdsDesc1: "Zabudnite na zavádzajúce reklamy, ktoré sľubujú domy za nereálne ceny. U nás máte vždy jasne stanovenú konečnú cenu – žiadne skryté poplatky ani prekvapenia.",
    misleadingAdsDesc2: "V mnohých prípadoch sú modulárne domy v inzerátoch za nízke ceny použiteľné len ako záhradné chaty, ktoré nepotrebujú kolaudáciu, stavebné povolenie ani energetický certifikát A0.",
    ourHousesMeetStandards: "Naše domy spĺňajú všetky potrebné normy a sú pripravené na kolaudáciu ako plnohodnotné rodinné domy.",
    ourOffer: "Naša ponuka",
    woodHouseNotLookWood: "Drevodom, ktorý nemusí vyzerať ako drevodom",
    showFullCatalog: "Zobraziť celý katalóg",
    implementationProcess: "Proces realizácie",
    readyForOwnHouse: "Pripravení na vlastný dom?",
    contactUsAndFind: "Kontaktujte nás a nájdeme riešenie pre vás",
    
    // Services
    sellYourProperty: "Predaj vašej nehnuteľnosti",
    selectAndBuyLand: "Výber a nákup pozemku",
    mortgageArrangement: "Vybavenie hypotéky",
    projectDocumentation: "Projektová dokumentácia",
    buildingPermitService: "Stavebné povolenie",
    houseConstruction: "Výstavba domu",
    utilityConnection: "Napojenie na inžinierske siete",
    finalApproval: "Kolaudácia",
    findIdealLand: "Nájdeme ideálny pozemok",
    completeProject: "Kompletný projekt",
    weArrangeForYou: "Vybavíme za vás",
    completeConnection: "Kompletné pripojenie",
    fromAToZ: "Od A po Z",
    
    // Process steps
    helpSellProperty: "Pomôžeme predať vašu súčasnú nehnuteľnosť",
    findSuitableLand: "Nájdeme vám vhodný pozemok z našej ponuky",
    selectBestMortgage: "Vyberieme najvhodnejší hypotekárny úver",
    prepareCompleteDoc: "Pripravíme kompletnú projektovú dokumentáciu",
    ensureBuildingPermit: "Zabezpečíme stavebné povolenie a úradné potvrdenia",
    buildYourModularHouse: "Postavíme váš modulárny dom",
    connectToUtilities: "Napojíme ho na všetky inžinierske siete",
    ensureApprovalKeys: "Zabezpečíme kolaudáciu a odovzdáme kľúče",
    
    // Catalog page
    houseCatalog: "Katalóg domov",
    modularAndMobileHouses: "Modulárne a mobilné domy od overených výrobcov.",
    all: "Všetky",
    familyHouses: "Rodinné",
    mobileHouses: "Mobilné",
    hidden: "Skryté",
    filters: "Filtre",
    search: "Hľadať",
    namePlaceholder: "Názov...",
    sortBy: "Zoradiť",
    default: "Predvolené",
    priceCheapest: "Cena: Najlacnejšie",
    priceExpensive: "Cena: Najdrahšie",
    areaSmallest: "Zastavaná plocha: Najmenšie",
    areaLargest: "Zastavaná plocha: Najväčšie",
    usableAreaSmallest: "Úžitková plocha: Najmenšie",
    usableAreaLargest: "Úžitková plocha: Najväčšie",
    nameAZ: "Názov: A-Z",
    nameZA: "Názov: Z-A",
    type: "Typ",
    modularType: "Modulárny",
    prefabType: "Montovaný",
    mobileType: "Mobilný",
    priceRange: "Cena",
    roomsFilter: "Izby",
    builtAreaFilter: "Zast. plocha",
    usableAreaFilter: "Úžitk. plocha",
    outOf: "z",
    houses: "domov",
    showInDesign: "Zobraziť domy v dizajne:",
    brickDesign: "Murovka",
    woodDesign: "Drevený motív",
    selectedForComparison: "Vybrané na porovnanie",
    compareHouses: "Porovnať domy",
    cancelSelection: "Zrušiť výber",
    noHousesFound: "Nenašli sa žiadne domy",
    tryChangingFilters: "Skúste zmeniť filtre alebo ich resetovať",
    resetFilters: "Resetovať filtre",
    detail: "Detail",
    basicConfigPrice: "Cena základnej konfigurácie",
    priceFromLabel: "Cena od",
    roomsLabel: "izby",
    
    // About page
    aboutUs: "O nás",
    distributorAndBuilder: "Distribútor a realizátor stavby modulárnych domov",
    builtMoreThan700: "Vyrobených viac ako 700 domov od roku 2008. Sme tu pre vás s poctivým prístupom, kde sa môžete spoľahnúť na transparentnosť a korektnosť.",
    completedHouses: "Realizovaných domov",
    yearFounded: "Rok založenia",
    verifiedManufacturers: "Overení výrobcovia",
    withFinalApproval: "S kolaudáciou",
    whyChooseUs: "Prečo si vybrať American Living?",
    qualityBrandDesc: "American Living je značka kvality a naše domy sú len od overených dodávateľov, ktorí majú svoju históriu a rokmi overené skúsenosti",
    forgetMisleadingAds: "Zabudnite na zavádzajúce reklamy",
    forgetMisleadingAdsDesc: "Zabudnite na zavádzajúce reklamy, ktoré sľubujú domy za nereálne ceny. U nás máte vždy jasne stanovenú konečnú cenu – žiadne skryté poplatky ani prekvapenia. Sme tu pre vás s poctivým prístupom, kde sa môžete spoľahnúť na transparentnosť a korektnosť.",
    responsibilityForConstruction: "Zodpovednosť za stavbu modulárneho domu",
    responsibilityDesc1: "Mnohé spoločnosti predávajú modulárne domy bez upozornenia na legislatívne povinnosti, čo môže viesť k problémom pri bývaní, pri kolaudácii a pripojení na inžinierske siete.",
    responsibilityDesc2: "Často sa stane, že pri najlacnejšej verzii domu zistíte až neskôr, že vám chýbajú dôležité komponenty, ktoré sú potrebné pre získanie stavebného povolenia a energetického certifikátu A0.",
    blackConstructionWarning: "Ak nebudete mať modulárny dom správne skolaudovaný, môže byť považovaný za čiernu stavbu!",
    ourHousesMeetAllStandards: "Naše domy spĺňajú všetky potrebné normy",
    readyForApproval: "Pripravené na kolaudáciu ako plnohodnotné rodinné domy",
    allNecessaryPermits: "Všetky potrebné stavebné povolenia a dokumentácia",
    a0CertificatePossibility: "Možnosť energetického certifikátu A0",
    connectionToUtilities: "Pripojenie na všetky inžinierske siete",
    qualityAndVerified: "Kvalita a overení výrobcovia",
    qualityAndVerifiedDesc: "Spolupracujeme len s overenými výrobcami modulárnych domov",
    transparency: "Transparentnosť",
    transparencyDesc: "Jasné ceny bez skrytých poplatkov. Žiadne prekvapenia.",
    comprehensiveServicesValue: "Komplexné služby",
    comprehensiveServicesValueDesc: "Od výberu pozemku až po kolaudáciu. Postaráme sa o všetko.",
    clientSatisfaction: "Spokojnosť klientov",
    clientSatisfactionDesc: "Vaša spokojnosť je našou prioritou. Viac ako 700 realizovaných domov.",
    ourManufacturers: "Naši výrobcovia",
    officialDistributor: "Oficiálny distribútor overených výrobcov modulárnych domov",
    jakModulesDesc: "Špecialista na modulárne domy s možnosťou rýchlej výstavby",
    ticabHouseDesc: "Výrobca kvalitných modulárnych domov s moderným dizajnom",
    prostoHouseDesc: "Jednoduché a funkčné riešenia pre moderné bývanie",
    domkiZGorDesc: "Poľský výrobca drevodomov s tradíciou kvality",
    contactUsAndFindIdeal: "Kontaktujte nás a spoločne nájdeme ideálne riešenie pre vás",
    contactUsButton: "Kontaktovať nás",
    
    // Contact page
    contactUsTitle: "Kontaktujte nás",
    contactUsSubtitle: "Radi vám poradíme, zodpovieme otázky a pripravíme nezáväznú ponuku. Postaráme sa o všetko od výberu pozemku až po kolaudáciu.",
    contactInfo: "Kontaktné informácie",
    openingHours: "Otváracie hodiny",
    monFri: "Po-Pia",
    weekend: "Víkend: Po dohode",
    weWillRespond: "Odpovieme do 24 hodín",
    inquiryType: "Typ dopytu",
    generalInquiry: "Všeobecný dopyt",
    priceOffer: "Cenová ponuka",
    financing: "Financovanie",
    lookingForLand: "Hľadám pozemok",
    sending: "Odosiela sa...",
    needQuickAnswer: "Potrebujete rýchlu odpoveď?",
    callOrEmail: "Zavolajte nám priamo alebo napíšte email. Radi zodpovieme všetky vaše otázky.",
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
    
    // Configurator specific
    selectOne: "select one",
    required: "required",
    assemblyNote: "* Accommodation for the assembly team (3-4 people) is charged additionally",
    a0Recommendation: "If you want to build a family house with A0 energy certificate and the possibility of permanent residence registration, you must select all green items marked A0",
    onlyKit: "Kit only",
    own: "Own",
    groundFootings: "Ground footings",
    foundationSlab: "Foundation",
    stripFound: "Foundations",
    walls: "walls",
    roof: "roof",
    missingItems: "Missing {count} items",
    whatsMissing: "What's missing:",
    facadeRequired: "Facade - select the type of exterior facade",
    whyImportant: "Why is this important:",
    cannotComplete: "Without selecting a facade, you cannot complete the configuration and submit an inquiry.",
    clickToShow: "Click to show",
    photos: "photos",
    
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
    
    // Homepage
    affordableFamilyHouse: "Affordable family house",
    directFromManufacturer: "Direct manufacturer price! No markup!",
    everythingYouNeed: "Everything you need is right here! Our colleagues will take care of complete equipment.",
    showOffer: "Show offer",
    consultation: "Consultation",
    allInOnePlace: "All in one place",
    comprehensiveServices: "comprehensive services",
    comprehensiveServicesDesc: "We provide comprehensive services - from real estate agency through financial consulting to construction implementation.",
    constructionCompany: "Construction company",
    realEstateAgency: "Real estate agency",
    financialServices: "Financial services",
    youDontHaveToArrange: "You don't have to arrange anything.",
    weHandleEverything: "We will take care of the entire process from A to Z.",
    startProject: "Start project",
    whyAmericanLiving: "Why American Living?",
    qualityBrand: "Quality brand from verified suppliers with years of experience",
    priceDirectFromManufacturer: "Direct manufacturer price",
    priceDirectDesc: "No markup! Affordable family house at the best prices.",
    fastConstruction: "Fast construction",
    fastConstructionDesc: "Your house can be ready in a few months. Modular construction saves time.",
    lowEnergy: "Low-energy A0",
    lowEnergyDesc: "A0 energy certificate option. Low heating costs.",
    withApproval: "With approval",
    withApprovalDesc: "Everything from project to approval. No worries with authorities.",
    misleadingAdsWarning: "Beware of misleading ads!",
    misleadingAdsDesc1: "Forget misleading ads that promise houses at unrealistic prices. With us, you always have a clearly set final price – no hidden fees or surprises.",
    misleadingAdsDesc2: "In many cases, modular houses advertised at low prices can only be used as garden cottages that don't need approval, building permit or A0 energy certificate.",
    ourHousesMeetStandards: "Our houses meet all necessary standards and are ready for approval as full-fledged family houses.",
    ourOffer: "Our offer",
    woodHouseNotLookWood: "Wooden house that doesn't have to look like a wooden house",
    showFullCatalog: "Show full catalog",
    implementationProcess: "Implementation process",
    readyForOwnHouse: "Ready for your own house?",
    contactUsAndFind: "Contact us and we'll find a solution for you",
    
    // Services
    sellYourProperty: "Sell your property",
    selectAndBuyLand: "Select and buy land",
    mortgageArrangement: "Mortgage arrangement",
    projectDocumentation: "Project documentation",
    buildingPermitService: "Building permit",
    houseConstruction: "House construction",
    utilityConnection: "Utility connection",
    finalApproval: "Final approval",
    findIdealLand: "We'll find the ideal land",
    completeProject: "Complete project",
    weArrangeForYou: "We arrange for you",
    completeConnection: "Complete connection",
    fromAToZ: "From A to Z",
    
    // Process steps
    helpSellProperty: "We'll help sell your current property",
    findSuitableLand: "We'll find suitable land from our offer",
    selectBestMortgage: "We'll select the best mortgage loan",
    prepareCompleteDoc: "We'll prepare complete project documentation",
    ensureBuildingPermit: "We'll ensure building permit and official confirmations",
    buildYourModularHouse: "We'll build your modular house",
    connectToUtilities: "We'll connect it to all utilities",
    ensureApprovalKeys: "We'll ensure approval and hand over the keys",
    
    // Catalog page
    houseCatalog: "House catalog",
    modularAndMobileHouses: "Modular and mobile houses from verified manufacturers.",
    all: "All",
    familyHouses: "Family",
    mobileHouses: "Mobile",
    hidden: "Hidden",
    filters: "Filters",
    search: "Search",
    namePlaceholder: "Name...",
    sortBy: "Sort by",
    default: "Default",
    priceCheapest: "Price: Cheapest",
    priceExpensive: "Price: Most expensive",
    areaSmallest: "Built area: Smallest",
    areaLargest: "Built area: Largest",
    usableAreaSmallest: "Usable area: Smallest",
    usableAreaLargest: "Usable area: Largest",
    nameAZ: "Name: A-Z",
    nameZA: "Name: Z-A",
    type: "Type",
    modularType: "Modular",
    prefabType: "Prefab",
    mobileType: "Mobile",
    priceRange: "Price",
    roomsFilter: "Rooms",
    builtAreaFilter: "Built area",
    usableAreaFilter: "Usable area",
    outOf: "of",
    houses: "houses",
    showInDesign: "Show houses in design:",
    brickDesign: "Brick",
    woodDesign: "Wood motif",
    selectedForComparison: "Selected for comparison",
    compareHouses: "Compare houses",
    cancelSelection: "Cancel selection",
    noHousesFound: "No houses found",
    tryChangingFilters: "Try changing filters or reset them",
    resetFilters: "Reset filters",
    detail: "Detail",
    basicConfigPrice: "Basic configuration price",
    priceFromLabel: "Price from",
    roomsLabel: "rooms",
    
    // About page
    aboutUs: "About us",
    distributorAndBuilder: "Distributor and builder of modular houses",
    builtMoreThan700: "More than 700 houses built since 2008. We are here for you with an honest approach where you can rely on transparency and fairness.",
    completedHouses: "Completed houses",
    yearFounded: "Year founded",
    verifiedManufacturers: "Verified manufacturers",
    withFinalApproval: "With approval",
    whyChooseUs: "Why choose American Living?",
    qualityBrandDesc: "American Living is a quality brand and our houses are only from verified suppliers who have their history and years of proven experience",
    forgetMisleadingAds: "Forget misleading ads",
    forgetMisleadingAdsDesc: "Forget misleading ads that promise houses at unrealistic prices. With us, you always have a clearly set final price – no hidden fees or surprises. We are here for you with an honest approach where you can rely on transparency and fairness.",
    responsibilityForConstruction: "Responsibility for modular house construction",
    responsibilityDesc1: "Many companies sell modular houses without warning about legal obligations, which can lead to problems with living, approval and connection to utilities.",
    responsibilityDesc2: "It often happens that with the cheapest version of the house you find out later that you are missing important components needed to obtain a building permit and A0 energy certificate.",
    blackConstructionWarning: "If you don't have your modular house properly approved, it may be considered an illegal construction!",
    ourHousesMeetAllStandards: "Our houses meet all necessary standards",
    readyForApproval: "Ready for approval as full-fledged family houses",
    allNecessaryPermits: "All necessary building permits and documentation",
    a0CertificatePossibility: "A0 energy certificate option",
    connectionToUtilities: "Connection to all utilities",
    qualityAndVerified: "Quality and verified manufacturers",
    qualityAndVerifiedDesc: "We only work with verified manufacturers of modular houses",
    transparency: "Transparency",
    transparencyDesc: "Clear prices without hidden fees. No surprises.",
    comprehensiveServicesValue: "Comprehensive services",
    comprehensiveServicesValueDesc: "From land selection to approval. We'll take care of everything.",
    clientSatisfaction: "Client satisfaction",
    clientSatisfactionDesc: "Your satisfaction is our priority. More than 700 completed houses.",
    ourManufacturers: "Our manufacturers",
    officialDistributor: "Official distributor of verified modular house manufacturers",
    jakModulesDesc: "Specialist in modular houses with fast construction option",
    ticabHouseDesc: "Manufacturer of quality modular houses with modern design",
    prostoHouseDesc: "Simple and functional solutions for modern living",
    domkiZGorDesc: "Polish manufacturer of wooden houses with quality tradition",
    contactUsAndFindIdeal: "Contact us and together we'll find the ideal solution for you",
    contactUsButton: "Contact us",
    
    // Contact page
    contactUsTitle: "Contact us",
    contactUsSubtitle: "We'll be happy to advise you, answer questions and prepare a non-binding offer. We'll take care of everything from land selection to approval.",
    contactInfo: "Contact information",
    openingHours: "Opening hours",
    monFri: "Mon-Fri",
    weekend: "Weekend: By appointment",
    weWillRespond: "We'll respond within 24 hours",
    inquiryType: "Inquiry type",
    generalInquiry: "General inquiry",
    priceOffer: "Price offer",
    financing: "Financing",
    lookingForLand: "Looking for land",
    sending: "Sending...",
    needQuickAnswer: "Need a quick answer?",
    callOrEmail: "Call us directly or send an email. We'll be happy to answer all your questions.",
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
    
    // Configurator specific
    selectOne: "válasszon egyet",
    required: "kötelező",
    assemblyNote: "* A szerelőcsapat (3-4 fő) szállása külön kerül felszámításra",
    a0Recommendation: "Ha A0 energetikai tanúsítvánnyal rendelkező családi házat szeretne építeni az állandó lakcím bejelentésének lehetőségével, ki kell választania az összes A0 jelöléssel ellátott zöld elemet",
    onlyKit: "Csak készlet",
    own: "Saját",
    groundFootings: "Talajcsavarok",
    foundationSlab: "Alaplemez",
    stripFound: "Alapok",
    walls: "falak",
    roof: "tető",
    missingItems: "Hiányzik {count} elem",
    whatsMissing: "Mi hiányzik:",
    facadeRequired: "Homlokzat - válassza ki a külső homlokzat típusát",
    whyImportant: "Miért fontos ez:",
    cannotComplete: "Homlokzat kiválasztása nélkül nem tudja befejezni a konfigurációt és elküldeni az érdeklődést.",
    clickToShow: "Kattintson a megjelenítéshez",
    photos: "fotó",
    
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
    
    // Configurator specific
    selectOne: "wybierz jedną",
    required: "wymagane",
    assemblyNote: "* Zakwaterowanie ekipy montażowej (3-4 osoby) jest dodatkowo płatne",
    a0Recommendation: "Jeśli chcesz zbudować dom rodzinny z certyfikatem energetycznym A0 i możliwością zameldowania na pobyt stały, musisz wybrać wszystkie zielone elementy oznaczone A0",
    onlyKit: "Tylko zestaw",
    own: "Własne",
    groundFootings: "Śruby gruntowe",
    foundationSlab: "Płyta",
    stripFound: "Fundamenty",
    walls: "ściany",
    roof: "dach",
    missingItems: "Brakuje {count} elementów",
    whatsMissing: "Czego brakuje:",
    facadeRequired: "Elewacja - wybierz typ elewacji zewnętrznej",
    whyImportant: "Dlaczego to ważne:",
    cannotComplete: "Bez wyboru elewacji nie można zakończyć konfiguracji i wysłać zapytania.",
    clickToShow: "Kliknij, aby wyświetlić",
    photos: "zdjęć",
    
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
    
    // Configurator specific
    selectOne: "виберіть один",
    required: "обов'язково",
    assemblyNote: "* Проживання монтажної бригади (3-4 особи) оплачується додатково",
    a0Recommendation: "Якщо ви хочете побудувати сімейний будинок з енергетичним сертифікатом A0 та можливістю реєстрації постійного проживання, вам потрібно вибрати всі зелені пункти з позначкою A0",
    onlyKit: "Тільки комплект",
    own: "Власні",
    groundFootings: "Ґрунтові гвинти",
    foundationSlab: "Плита",
    stripFound: "Фундамент",
    walls: "стіни",
    roof: "дах",
    missingItems: "Бракує {count} елементів",
    whatsMissing: "Чого не вистачає:",
    facadeRequired: "Фасад - виберіть тип зовнішнього фасаду",
    whyImportant: "Чому це важливо:",
    cannotComplete: "Без вибору фасаду неможливо завершити конфігурацію та надіслати запит.",
    clickToShow: "Натисніть для показу",
    photos: "фото",
    
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