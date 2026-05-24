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
    const domy = await base44.entities.Dom.list();
    const prostoDomy = domy.filter(d => d.vyrobca === 'Prosto House' || d.prosto_house_kod);
    prostoDomy.forEach(d => {
      console.log(`\n=== PROSTO HOUSE: ${d.nazov} (${d.prosto_house_kod}) ===`);
      console.log("Ceny:", JSON.stringify(d.konfigurator_custom_ceny_prosto_house, null, 2));
    });
  } catch(e) {
    console.error(e);
  }
}
run();
