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

async function callInternalLLM(prompt) {
  try {
    const translated = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: false
    });
    const text = typeof translated === 'string' ? translated : (translated?.content || '');
    return text.trim();
  } catch (e) {
    console.error("LLM invoke error:", e.message);
    throw e;
  }
}

async function translateText(text, targetLangName) {
  if (!text) return '';
  const prompt = `Translate this text from Slovak to ${targetLangName}. Keep the same tone, style, markdown checkmarks (✔, ✅, ❌), format, and structure. Do NOT translate product brand names (like Strotex, Izovat, OSB, PVC, Geberit, Radaway, Grohe) or unit symbols (like m², kW, etc.). Return ONLY the translated text, nothing else. Text to translate:\n\n${text}`;
  return await callInternalLLM(prompt);
}

const houseLanguages = [
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

const reviewLanguages = [
  { code: 'en', fieldSuffix: '_en', name: 'English' },
  { code: 'de', fieldSuffix: '_de', name: 'German' },
  { code: 'hu', fieldSuffix: '_hu', name: 'Hungarian' },
  { code: 'pl', fieldSuffix: '_pl', name: 'Polish' },
  { code: 'fr', fieldSuffix: '_fr', name: 'French' },
  { code: 'it', fieldSuffix: '_it', name: 'Italian' },
  { code: 'cz', fieldSuffix: '_cz', name: 'Czech' },
  { code: 'uk', fieldSuffix: '_uk', name: 'Ukrainian' }
];

async function translateHouses() {
  console.log("\n========================================");
  console.log("Starting Houses Translation...");
  const domy = await base44.entities.Dom.list();
  console.log(`Loaded ${domy.length} houses.`);

  for (const dom of domy) {
    console.log(`\n--- House: ${dom.nazov} ---`);
    const updates = {};
    let needsUpdate = false;

    // Translate specifikacia
    if (dom.specifikacia) {
      for (const lang of houseLanguages) {
        const fieldName = `specifikacia${lang.fieldSuffix}`;
        if (!dom[fieldName] || dom[fieldName].trim().length < 5) {
          console.log(`Translating specifikacia to ${lang.name}...`);
          try {
            const translated = await translateText(dom.specifikacia, lang.name);
            if (translated) {
              updates[fieldName] = translated;
              needsUpdate = true;
              console.log(`   ✓ Done: ${translated.substring(0, 45).replace(/\n/g, ' ')}...`);
            }
          } catch (e) {
            console.error(`   ✗ Error: ${e.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // small delay
        }
      }
    }

    // Translate popis
    if (dom.popis) {
      for (const lang of houseLanguages) {
        const fieldName = `popis${lang.fieldSuffix}`;
        if (!dom[fieldName] || dom[fieldName].trim().length < 5) {
          console.log(`Translating popis to ${lang.name}...`);
          try {
            const translated = await translateText(dom.popis, lang.name);
            if (translated) {
              updates[fieldName] = translated;
              needsUpdate = true;
              console.log(`   ✓ Done: ${translated.substring(0, 45).replace(/\n/g, ' ')}...`);
            }
          } catch (e) {
            console.error(`   ✗ Error: ${e.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // small delay
        }
      }
    }

    if (needsUpdate) {
      console.log(`Saving updates for house ${dom.nazov}...`);
      await base44.entities.Dom.update(dom.id, updates);
      console.log(`✓ House updated successfully.`);
    } else {
      console.log(`No missing translations for house ${dom.nazov}.`);
    }
  }
}

async function translateReviews() {
  console.log("\n========================================");
  console.log("Starting Reviews Translation...");
  const reviews = await base44.entities.ExternalReview.list();
  console.log(`Loaded ${reviews.length} reviews.`);

  for (const review of reviews) {
    console.log(`\n--- Review by: ${review.author_name} ---`);
    const updates = {};
    let needsUpdate = false;

    if (review.content_sk) {
      for (const lang of reviewLanguages) {
        const fieldName = `content${lang.fieldSuffix}`;
        if (!review[fieldName] || review[fieldName].trim().length < 5) {
          console.log(`Translating review to ${lang.name}...`);
          try {
            const translated = await translateText(review.content_sk, lang.name);
            if (translated) {
              updates[fieldName] = translated;
              needsUpdate = true;
              console.log(`   ✓ Done: ${translated.substring(0, 45).replace(/\n/g, ' ')}...`);
            }
          } catch (e) {
            console.error(`   ✗ Error: ${e.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // small delay
        }
      }
    }

    if (needsUpdate) {
      console.log(`Saving updates for review ${review.author_name}...`);
      await base44.entities.ExternalReview.update(review.id, updates);
      console.log(`✓ Review updated successfully.`);
    } else {
      console.log(`No missing translations for review ${review.author_name}.`);
    }
  }
}

async function run() {
  try {
    await translateHouses();
    await translateReviews();
    console.log("\n========================================");
    console.log("Translation process finished successfully!");
  } catch (e) {
    console.error("Global script error:", e);
  }
}

run();
