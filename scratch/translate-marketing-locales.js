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
        delay *= 1.5; // exponential backoff
      } else {
        throw e;
      }
    }
  }
  throw new Error("Failed after maximum retries due to rate limit.");
}

async function translateText(text, targetLangName) {
  if (!text) return '';
  const prompt = `Translate this marketing text from Slovak to ${targetLangName}. Keep the same style, tone, format, and structure. Do NOT translate brand names like Ticabhouse, ProstoHouse, Barnhouse, A-FRAME, or American Living. Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
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

const marketingStrings = {
  // Navigation
  "grantCampaign": "Grantová kampaň",
  "myAccount": "Moje Konto",
  "credits": "Kredity",

  // Ticabhouse Marketing
  "ticabOfficialDistributor": "Oficiálny distribútor pre SR",
  "ticabTitle": "Ticabhouse: Moderné Modulárne Bývanie",
  "ticabHeroDesc": "Vášeň pre kvalitu, rýchlosť a váš šťastný domov. Sme oficiálnym distribútorom, ktorý vám prináša tieto inovatívne domy priamo od výrobcu – so zárukou kvality, bez skrytých poplatkov a s plným prispôsobením slovenskej legislatíve.",
  "keyBenefits": "Kľúčové výhody",
  "ticabBenefit1Title": "Rýchla Realizácia",
  "ticabBenefit1Desc": "Výroba domu vo fabrike trvá len cca 6 týždňov. Nasťahujte sa skôr s minimom stresu.",
  "ticabBenefit2Title": "Kvalita a Spoľahlivosť",
  "ticabBenefit2Desc": "Konštrukcia zo suchého kalibrovaného dreva. Osvedčené z trhov USA a Nórska.",
  "ticabBenefit3Title": "Energetická Efektívnosť",
  "ticabBenefit3Desc": "Až 250mm ECO izolácia z minerálnej vlny pre nižšie náklady a komfort po celý rok.",
  "ticabBenefit4Title": "Individuálny Prístup",
  "ticabBenefit4Desc": "Výroba domov podľa individuálnych návrhov presne prispôsobená vašim potrebám.",
  "ticabBenefit5Title": "Inovatívne Riešenia",
  "ticabBenefit5Desc": "Neustále zdokonaľovanie technológií a konštrukčných dizajnových prvkov.",
  "ticabBenefit6Title": "Environmentálna Zodpovednosť",
  "ticabBenefit6Desc": "Organické drevo a ekologické materiály pre bývanie v dokonalom súlade s prírodou.",
  "ticabContactTitle": "American Living: Váš Priamy Kontakt",
  "ticabContactDesc": "Sme oficiálnym partnerom Ticabhouse pre Slovensko. Garantujeme férovú cenu priamo od výrobcu, bez akýchkoľvek skrytých navýšení.",
  "ticabContactItem1Bold": "Certifikácia A0:",
  "ticabContactItem1Text": " Domy spĺňajú podmienky pre skolaudovanie s certifikátom A0.",
  "ticabContactItem2Bold": "Stavebné Povolenie:",
  "ticabContactItem2Text": " Pripravené pre osadenie klasickým stavebným povolením.",
  "ticabContactItem3Bold": "Skúsenosti od 2008:",
  "ticabContactItem3Text": " Overené know-how z najnáročnejších klimatických podmienok.",
  "ticabPartner": "Spoľahlivý partner",
  "ticabPortfolioTitle": "Objavte Rozmanitosť Portfólia",
  "ticabPortfolioItem1Title": "Jednomodulové Domy",
  "ticabPortfolioItem1Desc": "Kompaktné a štýlové. Ideálne pre páry alebo rekreačné bývanie (napr. Vancouver, Sicilia).",
  "ticabPortfolioItem2Title": "Viacmodulové Domy",
  "ticabPortfolioItem2Desc": "Priestranné a flexibilné pre rodiny s deťmi (napr. London, Happy Wife).",
  "ticabPortfolioItem3Title": "Tiny Houses",
  "ticabPortfolioItem3Desc": "Minimalizmus a mobilita. Komfort bez zbytočností na 19 m².",
  "ticabPortfolioItem4Title": "Biznis Projekty",
  "ticabPortfolioItem4Desc": "Modulárne kancelárie, kaviarne či komerčné SPA a sauny.",

  // ProstoHouse Marketing
  "prostoTitle": "ProstoHouse: Inovatívne Montované Domy pre Moderné Bývanie",
  "prostoHeroDesc": "V dnešnej dynamickej dobe, keď čas a energetická efektívnosť zohrávajú kľúčovú úlohu, prinášame inovatívne riešenia bývania priamo od renomovaného výrobcu. Garantujeme kvalitu, výhodnú cenu bez navýšenia a plnú kompatibilitu so slovenskou legislatíve.",
  "prostoBenefit1Title": "Rýchlosť Výstavby",
  "prostoBenefit1Desc": "Montáž hrubej stavby trvá v priemere len 3 až 4 týždne vďaka prefabrikácii.",
  "prostoBenefit2Title": "Osvedčené Materiály",
  "prostoBenefit2Desc": "Používa sa kvalitné sušené drevo a nehorľavé izolačné materiály pre životnosť viac ako 80 rokov.",
  "prostoBenefit3Title": "Energetická Úspornosť",
  "prostoBenefit3Desc": "Až 60% úspora nákladov na vykurovanie. Domy spĺňajú podmienky pre certifikát A0.",
  "prostoContactTitle": "Prispôsobené pre Slovensko",
  "prostoContactDesc": "Sme hrdým a výhradným zástupcom ProstoHouse. Domy predávame bez akéhokoľvek navýšenia ceny oproti výrobcovi.",
  "prostoContactItem1Bold": "Garantovaný Certifikát A0:",
  "prostoContactItem1Text": " Preberáme zodpovednosť za celý proces certifikácie.",
  "prostoContactItem2Bold": "Špičková Izolácia:",
  "prostoContactItem2Text": " Hrúbka až 300 mm pre maximálny tepelný komfort.",
  "prostoContactItem3Bold": "Bezproblémová Kolaudácia:",
  "prostoContactItem3Text": " Pripravené pre klasické stavebné povolenie v obytnej štvrti.",
  "prostoPortfolioTitle": "Objavte Svet Domov ProstoHouse",
  "prostoPortfolioDesc": "Od kompaktných riešení (31 m²) až po priestranné rodinné domy (220 m²). Ponúkame populárne štýly ako Barnhouse (s možnosťou tradičnej omietky, vďaka čomu dom navonok pôsobí ako murovaný) alebo A-FRAME. American Living s.r.o. funguje ako váš projektový manažér a preberá starosti s výstavbou na seba."
};

const navTranslations = {
  en: { grantCampaign: "Grant Campaign", myAccount: "My Account", credits: "Credits" },
  de: { grantCampaign: "Förderkampagne", myAccount: "Mein Konto", credits: "Guthaben" },
  fr: { grantCampaign: "Campagne de subvention", myAccount: "Mon compte", credits: "Crédits" },
  hu: { grantCampaign: "Támogatási kampány", myAccount: "Saját fiók", credits: "Kreditek" },
  pl: { grantCampaign: "Kampania grantowa", myAccount: "Moje konto", credits: "Kredyty" },
  uk: { grantCampaign: "Грантова кампанія", myAccount: "Мій кабінет", credits: "Кредити" },
  sr: { grantCampaign: "Грант кампања", myAccount: "Мој налог", credits: "Кредити" },
  hr: { grantCampaign: "Grant kampanja", myAccount: "Moj račun", credits: "Krediti" },
  el: { grantCampaign: "Εκστρατεία επιχορηγήσεων", myAccount: "Ο λογαριασμός μου", credits: "Πιστώσεις" }
};

async function run() {
  const localesDir = path.resolve('src/components/translations/locales');

  for (const lang of targetLanguages) {
    const langPath = path.join(localesDir, `${lang.code}.js`);
    console.log(`\nProcessing ${lang.code}.js...`);
    const fileContent = fs.readFileSync(langPath, 'utf8');
    const jsonText = fileContent.replace('export default', '').trim().replace(/;$/, '');
    const obj = eval('(' + jsonText + ')');

    let updatedCount = 0;

    for (const [key, slovakValue] of Object.entries(marketingStrings)) {
      const currentValue = obj[key];

      // If the current value matches the Slovak value or is not translated, we translate it
      if (!currentValue || currentValue === slovakValue) {
        let translated = '';
        if (navTranslations[lang.code] && navTranslations[lang.code][key]) {
          translated = navTranslations[lang.code][key];
          console.log(`  Set static translation for "${key}" -> "${translated}"`);
        } else {
          console.log(`  Translating "${key}" to ${lang.name}...`);
          try {
            translated = await translateText(slovakValue, lang.name);
            console.log(`    ✓ Done: "${translated.substring(0, 30)}..."`);
          } catch (e) {
            console.error(`    ✗ Error: ${e.message}`);
            translated = slovakValue; // fallback
          }
        }
        obj[key] = translated;
        updatedCount++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (updatedCount > 0) {
      const newContent = 'export default ' + JSON.stringify(obj, null, 2) + ';\n';
      fs.writeFileSync(langPath, newContent, 'utf8');
      console.log(`✓ Saved ${lang.code}.js (${updatedCount} keys updated)`);
    } else {
      console.log(`⊙ No updates needed for ${lang.code}.js`);
    }
  }

  console.log("\nAll translations successfully fixed in locale files!");
}

run();
