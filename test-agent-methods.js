import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
    const siteSettings = await base44.entities.SiteSettings.filter({ klic: 'ai_system_prompt' });
    console.log("SiteSettings prompt row:", siteSettings[0]);
  } catch(e) {
    console.log("Error:", e.message);
  }
  
  try {
    const appConfig = await base44.entities.AppConfiguration.filter({ config_key: 'ai_system_prompt' });
    console.log("AppConfiguration prompt row:", appConfig[0]);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
