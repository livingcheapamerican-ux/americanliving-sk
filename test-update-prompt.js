import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Resolve token from base44 auth
const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
let token = null;
try {
  const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  token = authData.accessToken;
} catch (e) {}

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: false
});

async function run() {
  try {
    console.log("Loading american_living_assistant.jsonc...");
    const jsoncContent = fs.readFileSync('base44/agents/american_living_assistant.jsonc', 'utf8');
    
    // Simple jsonc parsing (stripping comments isn't strictly necessary if it's valid JSON, let's check if it is valid JSON)
    let config;
    try {
      config = JSON.parse(jsoncContent);
    } catch(e) {
      console.log("JSON.parse failed, trying to strip comments or trailing commas...");
      // Strip comments/newlines if needed, but the file is standard JSON/JSONC.
      // Let's strip single-line comments and trailing commas.
      const cleaned = jsoncContent
        .replace(/\/\/.*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      config = JSON.parse(cleaned);
    }
    
    const instructions = config.instructions;
    console.log("Instructions length:", instructions.length);

    console.log("Updating SiteSettings in database...");
    const existing = await base44.entities.SiteSettings.filter({ klic: 'ai_system_prompt' });
    
    let res;
    if (existing && existing.length > 0) {
      console.log("Found existing SiteSettings row:", existing[0].id);
      res = await base44.entities.SiteSettings.update(existing[0].id, { watermark_text: instructions });
      console.log("Updated row successfully!");
    } else {
      console.log("No existing SiteSettings row, creating one...");
      res = await base44.entities.SiteSettings.create({
        klic: 'ai_system_prompt',
        watermark_text: instructions
      });
      console.log("Created row successfully:", res);
    }
    
  } catch(e) {
    console.error("Error:", e);
  }
}

run();
