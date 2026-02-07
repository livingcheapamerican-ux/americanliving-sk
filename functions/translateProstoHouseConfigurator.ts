import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Spoločné texty pre všetky PH konfiguráory
    const textsToTranslate = {
      // Typy projektov
      selectProjectType: "Vyberte typ projektu",
      recreationalBuilding: "Rekreačná stavba",
      familyHouseA0: "Rodinný dom A0",
      
      // Kroky
      stepProjectType: "Typ projektu",
      stepStructure: "Hrubá stavba",
      stepExterior: "Exteriér",
      stepInterior: "Interiér",
      stepTechnologies: "Technológie",
      stepServices: "Služby",
      
      // Hrubá stavba
      roughConstruction: "Hrubá stavba",
      shellAssembly: "Montáž hrubej stavby",
      noAssemblySelf: "Bez montáže",
      selfAssemblyDesc: "Svojpomocne",
      withAssembly: "S montážou",
      proAssemblyDesc: "Profesionálna montáž",
      
      // Predĺženie
      houseExtension: "Predĺženie domu",
      noExtension: "Bez predĺženia",
      
      // Základy
      foundations: "Základy",
      noFoundations: "Bez základov",
      noFoundationsDesc: "Vlastná realizácia",
      pilotsFootings: "Pilóty/Pätky",
      pilotsFootingsDesc: "Rýchle základy",
      foundationSlab: "Základová doska",
      foundationSlabDesc: "Pevný podklad",
      stripFoundations: "Pásové základy",
      stripFoundationsDesc: "Klasické riešenie",
      
      // Izolácia
      insulationType: "Typ izolácie",
      yearRound150mm: "Celoročná 150 mm",
      yearRound150mmDesc: "Štandard",
      enhanced200mm: "Zvýšená 200 mm",
      enhanced200mmDesc: "Zvýšený komfort",
      premium250mm: "Prémium 250 mm",
      premium250mmDesc: "Pre A0 certifikát",
      extra300mm: "Extra 300 mm",
      extra300mmDesc: "Extra úspora",
      
      // Fasáda
      facade: "Fasáda",
      facadeStandard: "Štandardná",
      facadeStandardDesc: "Drevený obklad",
      facadeStucco: "Šúchaná fasáda",
      facadeStuccoDesc: "Biela omietka",
      
      // Dvere
      entryDoors: "Vstupné dvere",
      doorsStandard: "Štandard",
      doorsStandardDesc: "Základné",
      doorsMetal2Locks: "Kovové s 2 zámkami",
      doorsMetal2LocksDesc: "Bezpečnostné",
      doorsPlasticMetal: "Plastovo-kovové",
      doorsPlasticMetalDesc: "Odolné",
      
      // Okná
      additionalWindows: "Doplnkové okná (ks)",
      roofWindow: "Strešné",
      fixedWindow: "Fixné 90x205",
      tiltWindowBig: "Výklopné 90x205",
      tiltWindowSmall: "Výklopné 55x90",
      
      // Interiér
      interior: "Interiér",
      interiorFinish: "Úprava interiéru",
      noInterior: "Bez interiéru",
      noInteriorDesc: "Holostavba",
      interiorWood: "Drevo",
      interiorWoodDesc: "Smrekový obklad",
      interiorDrywall: "Sadrokartón",
      interiorDrywallDesc: "Hladké steny",
      interiorDoorsCount: "Počet interiérových dverí",
      pricePerPiece: "Cena za kus:",
      windowLamination: "Laminácia farby okien",
      tintedGlass: "Tónované sklá",
      laminateFloors: "Podlahy laminát",
      floorHeating: "Podlahové kúrenie",
      
      // Technológie
      technologies: "Technológie",
      electricalWiring: "Elektro rozvody",
      waterDrainage: "Voda a odpady",
      sanitary: "Sanita",
      boiler: "Bojler",
      heatPump: "Tepelné čerpadlo",
      recuperation: "Rekuperácia",
      a0Standard: "A0 Štandard (Automaticky zvolené)",
      requiredForA0: "Vyžadované pre A0",
      
      // Služby
      services: "Služby",
      projectant: "Projektant",
      engineering: "Inžiniering",
      engineeringDesc: "Vybavenie stavebného povolenia až do fázy kolaudácie. American Living dohliadne na bezproblémovú kolaudáciu domu.",
      revisions: "Revízie",
      networkConnections: "Prípojky sietí",
      freeServices: "Bezplatné služby",
      realEstate: "Predaj nehnuteľnosti",
      landSearch: "Hľadanie pozemku",
      financing: "Financovanie",
      
      // Sumár
      configurationSummary: "Sumár konfigurácie",
      basePrice: "Základná cena",
      totalWithVAT: "Celková cena s DPH",
      sendQuote: "Odoslať cenovú ponuku",
      priceDetail: "Detail ceny",
      
      // Formulár
      inquiryForm: "Odoslať nezáväzný dopyt",
      inquiryFormDesc: "Vyplňte údaje a pošleme vám detailnú cenovú ponuku na mieru.",
      nameSurname: "Meno a priezvisko",
      email: "E-mail",
      phone: "Telefón",
      city: "Miesto výstavby",
      note: "Poznámka",
      submit: "Odoslať cenovú ponuku",
      sending: "Odosielam...",
      
      // Statusy
      meetsA0Cert: "Rodinný dom s certifikátom A0",
      meetsA0CertDesc: "Konfigurácia spĺňa všetky normy pre energetický certifikát A0. Vhodné na kolaudáciu ako rodinný dom.",
      recreationalDesc: "Základná konfigurácia vhodná na rekreačné účely. Pre zmenu na A0 dom zvoľte možnosť \"Rodinný dom A0\".",
      meetsAllA0Norms: "Dom spĺňa všetky A0 normy",
      recreationalUse: "Rekreačné využitie",
      
      // Navigácia
      next: "Ďalej",
      finish: "Dokončiť a odoslať",
      back: "Späť",
      continue: "Pokračovať",
      
      // Sumárne skupiny
      shellConstruction: "Hrubá stavba",
      shellHouse: "Holodom",
      turnkeyHouse: "Dom na kľúč",
      documentation: "Dokumentácia",
      freeServicesGroup: "Bezplatné služby",
      
      // Položky
      assemblyItem: "Montáž hrubej stavby",
      extensionItem: "Predĺženie domu",
      insulationItem: "Izolácia",
      foundationsItem: "Základy",
      doorsItem: "Vstupné dvere",
      facadeItem: "Fasáda",
      interiorFinishItem: "Interiér finiš",
      interiorDoorsItem: "Interiérové dvere",
      electricalInstallation: "Elektrická inštalácia",
      waterAndDrainage: "Rozvody vody a kanalizácie",
      sanitaryComplete: "Sanita komplet",
      boilerItem: "Bojler",
      heatPumpItem: "Tepelné čerpadlo",
      recuperationItem: "Rekuperácia",
      networkConnectionsItem: "Prípojky sietí",
      windowLaminationItem: "Laminácia farby okien",
      tintedGlassItem: "Tónované sklá",
      laminateFloorsItem: "Podlahy - Laminát",
      floorHeatingItem: "Elektrické podlahové vykurovanie",
      engineeringItem: "Inžiniering",
      projectantItem: "Projektant",
      revisionsItem: "Revízna dokumentácia",
      transportItem: "Doprava",
      realEstateItem: "Predaj nehnuteľnosti",
      landSearchItem: "Hľadanie pozemku",
      financingItem: "Financovanie",
    };

    const targetLanguages = ['en', 'de', 'fr', 'hu', 'pl', 'uk', 'sr', 'hr', 'el'];
    const allTranslations = { sk: textsToTranslate };

    // Preložiť do všetkých jazykov
    for (const targetLang of targetLanguages) {
      const langNames = {
        en: 'English',
        de: 'German',
        fr: 'French',
        hu: 'Hungarian',
        pl: 'Polish',
        uk: 'Ukrainian',
        sr: 'Serbian',
        hr: 'Croatian',
        el: 'Greek'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following configurator interface texts from Slovak to ${langNames[targetLang]}. 
        
These are UI labels and descriptions for a house configurator. Keep them concise and natural.
Maintain the same structure and format.

Slovak texts (JSON):
${JSON.stringify(textsToTranslate, null, 2)}

Return ONLY a valid JSON object with the translated texts. Use the same keys, translate only the values.`,
        response_json_schema: {
          type: "object",
          additionalProperties: { type: "string" }
        }
      });

      allTranslations[targetLang] = response;
    }

    // Vytvor obsah súboru
    const fileContent = `export const prostoHouseTranslations = ${JSON.stringify(allTranslations, null, 2)};`;

    return Response.json({ 
      success: true, 
      message: `Preklady vytvorené pre ${targetLanguages.length + 1} jazykov`,
      translations: allTranslations,
      fileContent
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});