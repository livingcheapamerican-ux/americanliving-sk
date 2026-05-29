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
  const prompt = `Translate this text from Slovak to ${targetLangName}. Keep the same tone, format, and style.
If it is a person name placeholder like "Ján Novák...", translate it to a common placeholder name in ${targetLangName} (e.g. for English: "John Doe...", for Hungarian: "Kovács János...").
If it is a city placeholder like "Bratislava, Košice...", translate it to major cities in the region of ${targetLangName} (e.g. for German: "Berlin, München...", for Hungarian: "Budapest, Debrecen...").
Do NOT translate brand names like Ticabhouse, ProstoHouse, Barnhouse, A-FRAME, or American Living. Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
  return await callInternalLLM(prompt);
}

const localesDir = path.resolve('src/components/translations/locales');

const languages = [
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

const keysToFix = {
  en: ['prostoHeroDesc', 'phoneRequired', 'placeholderCity'],
  de: ['dotaciaFormBudgetPlaceholder', 'prostoHeroDesc', 'placeholderName', 'placeholderCity'],
  fr: ['dotaciaFormBudgetPlaceholder', 'prostoHeroDesc', 'placeholderName', 'placeholderCity'],
  hu: ['dotaciaFormBudgetPlaceholder', 'prostoHeroDesc', 'placeholderName'],
  pl: ['dotaciaFormBudgetPlaceholder', 'prostoHeroDesc'],
  uk: ['dotaciaFormBudgetPlaceholder'],
  sr: ['dotaciaFormBudgetPlaceholder', 'ticabHeroDesc', 'ticabPortfolioItem2Desc', 'prostoHeroDesc', 'placeholderCity'],
  hr: ['prostoHeroDesc', 'placeholderName', 'placeholderCity'],
  el: ['prostoHeroDesc', 'prostoContactItem3Text', 'placeholderCity']
};

const skObj = (await import(path.join(localesDir, 'sk.js'))).default;

async function run() {
  for (const lang of languages) {
    const keys = keysToFix[lang.code];
    if (!keys || keys.length === 0) continue;

    const langPath = path.join(localesDir, `${lang.code}.js`);
    console.log(`\nFixing translations for ${lang.code} (${lang.name})...`);
    
    // Read current file
    const fileContent = fs.readFileSync(langPath, 'utf8');
    const jsonText = fileContent.replace('export default', '').trim().replace(/;$/, '');
    const obj = eval('(' + jsonText + ')');

    let updated = false;

    for (const key of keys) {
      const skValue = skObj[key];
      if (!skValue) {
        console.warn(`  ⚠ Key "${key}" not found in sk.js!`);
        continue;
      }
      
      console.log(`  Translating "${key}" -> "${skValue.substring(0, 50)}..." to ${lang.name}`);
      try {
        const translated = await translateText(skValue, lang.name);
        if (translated) {
          obj[key] = translated;
          updated = true;
          console.log(`    ✓ Success: "${translated.substring(0, 50)}..."`);
        }
      } catch (e) {
        console.error(`    ✗ Error: ${e.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // small delay between requests
    }

    if (updated) {
      fs.writeFileSync(langPath, 'export default ' + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
      console.log(`  ✓ Saved ${lang.code}.js`);
    } else {
      console.log(`  ⊙ No changes made to ${lang.code}.js`);
    }
  }
  
  console.log("\nAll translations fixed successfully!");
}

run();
