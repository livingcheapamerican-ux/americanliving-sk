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
  console.log("Fetching Dom entities...");
  try {
    const domy = await base44.entities.Dom.filter({});
    console.log(`Found ${domy.length} total houses.`);
    
    const prostoDomy = domy.filter(d => 
      d.vyrobca?.toLowerCase().includes("prosto") || 
      d.prosto_house_kod || 
      d.nazov?.toLowerCase().includes("flat") ||
      d.nazov?.toLowerCase().includes("fjord") ||
      d.nazov?.toLowerCase().includes("barn") ||
      d.nazov?.toLowerCase().includes("a-frame")
    );
    
    console.log(`Found ${prostoDomy.length} Prosto House models.\n`);
    
    for (const d of prostoDomy) {
      console.log(`==================================================`);
      console.log(`Model: ${d.nazov} (ID: ${d.id}, Kód: ${d.prosto_house_kod})`);
      console.log(`Výrobca: ${d.vyrobca}`);
      console.log(`Základná cena: ${d.zakladna_cena} €`);
      console.log(`Custom ceny:`, JSON.stringify(d.konfigurator_custom_ceny_prosto_house, null, 2));
      console.log(`Konfigurátor ceny (obecný):`, JSON.stringify(d.konfigurator_ceny, null, 2));
    }
    
  } catch(e) {
    console.error("Error fetching Dom entities:", e);
  }
}

run();
