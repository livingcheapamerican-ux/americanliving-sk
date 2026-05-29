import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: false
});

async function callInternalLLM(prompt, retries = 10, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const translated = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });
      const text = typeof translated === 'string' ? translated : (translated?.content || '');
      return text.trim();
    } catch (e) {
      if (e.message?.includes('Rate limit') || e.status === 429 || (e.message && e.message.includes('429'))) {
        console.warn(`      [Rate Limit] Waiting ${delay / 1000}s and retrying (attempt ${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
      } else {
        throw e;
      }
    }
  }
  throw new Error("Failed after maximum retries due to rate limit.");
}

async function translateText(text, targetLangName) {
  if (!text) return '';
  const prompt = `Translate this UI text from Slovak to ${targetLangName}. Keep the same style, tone, format, and structure. Do NOT translate brand names like Ticabhouse, ProstoHouse, Barnhouse, A-FRAME, or American Living. Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
  return await callInternalLLM(prompt);
}

const targetLanguages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'el', name: 'Greek' }
];

const newUIStrings = {
  // Configurator / FloatingPrice UI
  "configurationSummary": "Zhrnutie konfigurácie",
  "summary": "Zhrnutie",
  "interested": "Mám záujem",
  "totalPrice": "Celková cena",
  "totalPriceVAT": "Celková cena s DPH",
  "baseHousePrice": "Základná cena domu",
  "sendQuote": "Poslať ponuku",
  "interestedInOffer": "Mám záujem o ponuku",
  "sendQuoteTitle": "Pošlite mi cenovú ponuku",
  "nameSurnameRequired": "Meno a priezvisko *",
  "emailRequired": "Email *",
  "phoneRequired": "Telefón *",
  "cityRequired": "Obec / Mesto *",
  "noteOptional": "Poznámka (voliteľné)",
  "placeholderName": "Ján Novák",
  "placeholderCity": "Bratislava, Košice...",
  "placeholderNote": "Vaše otázky alebo poznámky...",
  "fillRequiredFields": "Vyplňte všetky povinné polia",
  "configError": "Chyba konfigurácie. Skúste to prosím znova.",
  "quoteSentSuccess": "✓ Cenová ponuka odoslaná na váš email",
  "unknownError": "Neznáma chyba",
  "sending": "Odosiela sa...",
  "send": "Poslať",
  "cancel": "Zrušiť",
  "error": "Chyba",
  "selectAdditionalServices": "Vyberte si doplnkové služby (voliteľné):",
  "sellProperty": "Predaj predošlej nehnuteľnosti",
  "sellPropertyDesc": "Budú sa Vám venovať naši najlepší odborníci v realitách.",
  "wantLand": "Chcem pozemok pod svoj dom",
  "wantLandDesc": "Pomôžeme Vám nájsť ideálny pozemok.",
  "financialServices": "Finančné služby - úvery/poistky",
  "financialServicesDesc": "Budú sa Vám venovať naši najlepší finančníci.",

  // ProstoHouse Section Headers & Descriptions
  "sectionBasicDecision": "Základné rozhodnutie",
  "sectionBasicDecisionDesc": "Na aký účel plánujete dom využívať? Toto rozhodnutie nám pomôže automaticky predvybrať technológie potrebné pre stavebné povolenie.",
  "sectionStructure": "Hrubá stavba a Konštrukcia",
  "sectionStructureDesc": "Vyberte si spôsob dodania a typ založenia stavby.",
  "sectionWindowsDoors": "Okná a Vstupné dvere",
  "sectionWindowsDoorsDesc": "Prispôsobte si presklenie a bezpečnosť vášho nového domu.",
  "sectionInsulationFacade": "Zateplenie a Fasáda",
  "sectionInsulationFacadeDesc": "Izolácia je kľúčová. Pre trvalé bývanie (A0) odporúčame hrubšie zateplenie.",
  "sectionInteriorNets": "Interiér a Siete",
  "sectionInteriorNetsDesc": "Vyberte si stupeň dokončenia interiéru a rozvody technológií.",
  "sectionSummaryServices": "Súhrn a Služby",
  "sectionSummaryServicesDesc": "Vyberte doplnkové služby pre bezstarostnú realizáciu a skontrolujte zhrnutie.",
  "sectionGalleryPlans": "Fotogaléria a Pôdorysy",
  "sectionGalleryPlansDesc": "Prezrite si vizualizácie k vašej vybranej konfigurácii.",
  
  // Additional Configurator Labels
  "windowLamination": "Laminácia farby okien",
  "tintedGlass": "Tónované sklá",
  "laminateFloors": "Podlahy laminát",
  "floorHeating": "Podlahové kúrenie",
  "scratchedPlaster": "Šúchaná omietka",
  "spruceWood": "Severský smrek",
  "larch": "Červený smrek",
  "foldedPanels": "Falcovane panely",
  "purposeOfBuilding": "Účel stavby",
  "insulationSection": "Izolácia",
  "heatingSection": "Vykurovanie",
  "facadeSection": "Fasáda",
  "roofSection": "Strecha",
  "windowsDoorsSection": "Okná a dvere",
  "interiorSection": "Interiér",
  "electricalSection": "Elektro",
  "bathroomSection": "Kúpeľňa",
  "foundationsSection": "Základy",
  "engineeringDocsSection": "Inžiniering",
  "realizationSection": "Realizácia",
  "additionalServicesLabel": "Služby k nákupu",
  "windowModification": "Úprava okien",
  "floorsAndDoors": "Podlahy a interiérové dvere",
  "finalConfigurationSummary": "Finálne zhrnutie konfigurácie",
  "recreationalBuildingDesc": "Chata, víkendový dom. Nevyžaduje energetický certifikát A0.",
  "familyHouseA0Desc": "Trvalé bývanie. Splnený zákonný štandard (zateplenie, čerpadlo, rekuperácia)."
};

const preApprovedTranslations = {
  en: {
    cancel: "Cancel",
    send: "Send",
    sending: "Sending...",
    summary: "Summary",
    configurationSummary: "Configuration summary",
    totalPrice: "Total price",
    totalPriceVAT: "Total price incl. VAT",
    baseHousePrice: "Base price of the house"
  },
  de: {
    cancel: "Abbrechen",
    send: "Senden",
    sending: "Sende...",
    summary: "Zusammenfassung",
    configurationSummary: "Konfigurationszusammenfassung",
    totalPrice: "Gesamtpreis",
    totalPriceVAT: "Gesamtpreis inkl. MwSt.",
    baseHousePrice: "Grundpreis des Hauses"
  },
  fr: {
    cancel: "Annuler",
    send: "Envoyer",
    sending: "Envoi...",
    summary: "Résumé",
    configurationSummary: "Résumé de configuration",
    totalPrice: "Prix total",
    totalPriceVAT: "Prix total TTC",
    baseHousePrice: "Prix de base de la maison"
  },
  hu: {
    cancel: "Mégsem",
    send: "Küldés",
    sending: "Küldés...",
    summary: "Összegzés",
    configurationSummary: "Konfiguráció összefoglalás",
    totalPrice: "Teljes ár",
    totalPriceVAT: "Teljes ár ÁFÁ-val",
    baseHousePrice: "Ház alapára"
  },
  pl: {
    cancel: "Anuluj",
    send: "Wyślij",
    sending: "Wysyłanie...",
    summary: "Podsumowanie",
    configurationSummary: "Podsumowanie konfiguracji",
    totalPrice: "Cena całkowita",
    totalPriceVAT: "Cena całkowita z VAT",
    baseHousePrice: "Cena podstawowa domu"
  }
};

async function run() {
  const localesDir = path.resolve('src/components/translations/locales');

  // 1. Update sk.js first (no translation needed, just insert keys)
  const skPath = path.join(localesDir, 'sk.js');
  console.log("Updating sk.js...");
  const skContent = fs.readFileSync(skPath, 'utf8');
  const skJsonText = skContent.replace('export default', '').trim().replace(/;$/, '');
  const skObj = eval('(' + skJsonText + ')');

  for (const [key, val] of Object.entries(newUIStrings)) {
    skObj[key] = val;
  }
  fs.writeFileSync(skPath, 'export default ' + JSON.stringify(skObj, null, 2) + ';\n', 'utf8');
  console.log("✓ Saved sk.js");

  // 2. Update target languages
  for (const lang of targetLanguages) {
    const langPath = path.join(localesDir, `${lang.code}.js`);
    console.log(`\nProcessing ${lang.code}.js...`);
    const fileContent = fs.readFileSync(langPath, 'utf8');
    const jsonText = fileContent.replace('export default', '').trim().replace(/;$/, '');
    const obj = eval('(' + jsonText + ')');

    let updatedCount = 0;

    for (const [key, slovakValue] of Object.entries(newUIStrings)) {
      const currentValue = obj[key];

      // If the current value is missing or identical to Slovak value, let's translate
      if (!currentValue || currentValue === slovakValue) {
        let translated = '';
        if (preApprovedTranslations[lang.code] && preApprovedTranslations[lang.code][key]) {
          translated = preApprovedTranslations[lang.code][key];
          console.log(`  Set pre-approved translation for "${key}" -> "${translated}"`);
        } else {
          console.log(`  Translating "${key}" to ${lang.name}...`);
          try {
            translated = await translateText(slovakValue, lang.name);
            console.log(`    ✓ Done: "${translated.substring(0, 30)}..."`);
          } catch (e) {
            console.error(`    ✗ Error: ${e.message}`);
            translated = slovakValue;
          }
        }
        obj[key] = translated;
        updatedCount++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (updatedCount > 0) {
      fs.writeFileSync(langPath, 'export default ' + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
      console.log(`✓ Saved ${lang.code}.js (${updatedCount} keys updated)`);
    } else {
      console.log(`⊙ No updates needed for ${lang.code}.js`);
    }
  }

  console.log("\nConfigurator UI translation additions finished!");
}

run();
