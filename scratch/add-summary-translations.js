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
  const prompt = `Translate this UI label from Slovak to ${targetLangName}. Keep the same style, tone, format, and structure. Do NOT translate brand names like Ticabhouse, ProstoHouse, Barnhouse, A-FRAME, or American Living. Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
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

const summaryUIStrings = {
  "summaryCategoryConstruction": "1. Konštrukcia & Izolácia",
  "summaryCategoryExterior": "2. Exteriér & Fasáda",
  "summaryCategoryInterior": "3. Interiér & Kúpeľňa",
  "summaryCategoryTech": "4. Technológie & Služby",
  "summaryYes": "Áno",
  "summaryNo": "Nie",
  "summaryInPrice": "V cene",
  "summaryPurposeOfBuilding": "Účel stavby",
  "summaryRecreationalCottage": "Rekreačná chata",
  "summaryFamilyHouse": "Rodinný dom (A0)",
  "summaryWallInsulation": "Izolácia stien",
  "summaryFloorInsulation": "Izolácia podlahy",
  "summaryCeilingInsulation": "Izolácia stropu",
  "summaryFoundations": "Základy",
  "summaryNoFoundations": "Bez základov",
  "summaryGroundScrews": "Zemné skrutky",
  "summaryConcreteFootings": "Betónové pätky",
  "summaryStripFoundations": "Pásové základy",
  "summaryFacade": "Fasáda",
  "summarySpruce": "Severský smrek",
  "summaryPlaster": "Šúchaná omietka",
  "summaryLarch": "Sibírsky smrekovec",
  "summaryFoldedPanels": "Falcovaný plech",
  "summaryThermowood": "Thermowood",
  "summaryRoof": "Strešná krytina",
  "summaryCorrugatedSheet": "Korugovaný plech",
  "summaryGutters": "Odkvapy",
  "summaryWindowColor": "Farba okien",
  "summaryWhite": "Biele",
  "summaryAntracit": "Antracit",
  "summaryBrown": "Hnedé",
  "summaryEntranceDoor": "Vchodové dvere",
  "summaryPlasticMetal": "Plastovo-kovové",
  "summaryMetal": "Kovové",
  "summaryWallCladding": "Obklad stien",
  "summarySpruce8cm": "Smrek 8cm",
  "summarySpruceNoKnots": "Smrek bez uzlov",
  "summaryPlasterboardWallpaper": "Sadrokartón/Tapeta",
  "summaryOsbPanel": "OSB panel",
  "summaryFloor": "Podlaha",
  "summaryLaminate": "Laminát",
  "summaryInteriorDoor": "Interiérové dvere",
  "summaryHinged": "Krídlové",
  "summarySliding": "Posuvné",
  "summaryShower": "Sprchový kút",
  "summaryStandard": "Štandard",
  "summaryBathroomFaucet": "Kúpeľňová batéria",
  "summaryBathroomCeiling": "Strop v kúpeľni",
  "summaryWoodCladding": "Drevený obklad",
  "summaryPlasterboard": "Sadrokartón",
  "summaryBath": "Vaňa",
  "summaryCabinetSink": "Skrinka s umývadlom",
  "summaryHeatPump": "Tepelné čerpadlo",
  "summaryRecuperationPrep": "Príprava na rekuperáciu",
  "summaryRecuperation": "Rekuperácia",
  "summaryFloorHeating": "Podlahové kúrenie",
  "summaryAirConditioning": "Klimatizácia",
  "summaryFireplacePrep": "Príprava na krb",
  "summaryStoveProtection": "Ochrana (Kachle)",
  "summaryLightningConductor": "Bleskozvod",
  "summarySurgeProtection": "Prepäťová ochrana",
  "summarySolarPrep": "Príprava na solárne panely",
  "summaryEngineering": "Inžiniering",
  "summaryProjectCert": "Projekt a certifikácia",
  "summaryRevision": "Revízia",
  "summaryAssembly": "Montáž domu",
  "summaryTransport": "Doprava",
  "summaryPropertySale": "Predaj nehnuteľnosti",
  "summaryWantLand": "Chcem pozemok",
  "summaryFinance": "Finančné služby",
  "summaryYesLower": "áno",
  "summaryNoLower": "nie",
  "summaryBase": "Základ",
  "summaryNoSurcharge": "Bez príplatku",
  "summaryGroundScrewsShort": "skrutky",
  "summaryConcretePadsShort": "pätky",
  "summaryStripFoundationsShort": "pasove",
  "summaryFoundationSlabShort": "doska",
  "summaryInPriceShort": "v cene",
  "ticabPremiumStandardTitle": "Prémiový drevodom v základnej cene",
  "ticabPremiumStandardDesc": "Domy Ticab House sú štandardne dodávané ako prémiové drevodomy s kvalitným dreveným obkladom fasády aj interiéru. Tento luxusný drevený štandard je už zahrnutý v základnej cene. Priplácate si výlučne iba za zmeny štandardu (napr. ak chcete vymeniť drevo za sadrokartón)."
};

async function run() {
  const localesDir = path.resolve('src/components/translations/locales');

  // 1. Update sk.js first
  const skPath = path.join(localesDir, 'sk.js');
  console.log("Updating sk.js...");
  const skContent = fs.readFileSync(skPath, 'utf8');
  const skJsonText = skContent.replace('export default', '').trim().replace(/;$/, '');
  const skObj = eval('(' + skJsonText + ')');

  for (const [key, val] of Object.entries(summaryUIStrings)) {
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

    for (const [key, slovakValue] of Object.entries(summaryUIStrings)) {
      const currentValue = obj[key];

      // Translate if missing
      if (!currentValue) {
        console.log(`  Translating "${key}" to ${lang.name}...`);
        try {
          const translated = await translateText(slovakValue, lang.name);
          obj[key] = translated;
          console.log(`    ✓ Done: "${translated}"`);
        } catch (e) {
          console.error(`    ✗ Error: ${e.message}`);
          obj[key] = slovakValue;
        }
        updatedCount++;
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    if (updatedCount > 0) {
      fs.writeFileSync(langPath, 'export default ' + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
      console.log(`✓ Saved ${lang.code}.js (${updatedCount} keys updated)`);
    } else {
      console.log(`⊙ No updates needed for ${lang.code}.js`);
    }
  }

  console.log("\nConfigurator Summary translation additions finished!");
}

run();
