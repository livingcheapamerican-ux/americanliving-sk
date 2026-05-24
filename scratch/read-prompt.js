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

async function run() {
  try {
    const existing = await base44.entities.SiteSettings.filter({ klic: 'ai_system_prompt' });
    console.log("Found rows:", existing.length);
    if (existing.length > 0) {
      const text = existing[0].watermark_text || "";
      const lines = text.split('\n');
      console.log("Lines containing 'bezplatne', 'zadarmo', or 'povolenie' in SiteSettings:");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('bezplatne') || line.toLowerCase().includes('zadarmo') || line.toLowerCase().includes('povolenie')) {
          console.log(`Line ${index + 1}: ${line}`);
        }
      });
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
