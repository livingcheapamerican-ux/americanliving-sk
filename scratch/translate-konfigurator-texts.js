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
  const prompt = `Translate this text from Slovak to ${targetLangName}. Keep the same tone and style. Do NOT translate brand names like Ticabhouse, ProstoHouse, Barnhouse, A-FRAME, or American Living. Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
  return await callInternalLLM(prompt);
}

const targetLanguages = [
  { code: 'en', fieldSuffix: '_en', name: 'English' },
  { code: 'de', fieldSuffix: '_de', name: 'German' },
  { code: 'fr', fieldSuffix: '_fr', name: 'French' },
  { code: 'hu', fieldSuffix: '_hu', name: 'Hungarian' },
  { code: 'pl', fieldSuffix: '_pl', name: 'Polish' },
  { code: 'uk', fieldSuffix: '_uk', name: 'Ukrainian' },
  { code: 'sr', fieldSuffix: '_sr', name: 'Serbian' },
  { code: 'hr', fieldSuffix: '_hr', name: 'Croatian' },
  { code: 'el', fieldSuffix: '_el', name: 'Greek' }
];

async function run() {
  console.log("Fetching KonfiguratorText entities...");
  const list = await base44.entities.KonfiguratorText.list();
  console.log(`Loaded ${list.length} items.`);

  for (const item of list) {
    console.log(`\nProcessing item: ${item.polozka_id} (${item.nazov})`);
    const updates = {};
    let needsUpdate = false;

    // We check fields: nazov, podnadpis, dlhy_popis, tooltip
    const fieldsToTranslate = ['nazov', 'podnadpis', 'dlhy_popis', 'tooltip'];

    for (const field of fieldsToTranslate) {
      const sourceValue = item[field];
      if (sourceValue && sourceValue.trim().length > 0) {
        for (const lang of targetLanguages) {
          const targetField = `${field}${lang.fieldSuffix}`;
          const currentTargetValue = item[targetField];

          // If empty or identical to Slovak source, let's translate
          if (!currentTargetValue || currentTargetValue === sourceValue) {
            console.log(`  Translating ${field} to ${lang.name}...`);
            try {
              const translated = await translateText(sourceValue, lang.name);
              if (translated) {
                updates[targetField] = translated;
                needsUpdate = true;
                console.log(`    ✓ Done: "${translated.substring(0, 30)}..."`);
              }
            } catch (e) {
              console.error(`    ✗ Error: ${e.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
    }

    if (needsUpdate) {
      console.log(`Saving updates for item ${item.polozka_id}...`);
      await base44.entities.KonfiguratorText.update(item.id, updates);
      console.log(`✓ Item updated successfully.`);
    } else {
      console.log(`No missing translations for item ${item.polozka_id}.`);
    }
  }

  console.log("\nKonfiguratorText translations check & update finished!");
}

run();
