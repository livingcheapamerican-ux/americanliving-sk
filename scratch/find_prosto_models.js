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
  const all = await base44.entities.Dom.filter({ verejny: true });
  console.log("All Manufacturers:");
  const m = {};
  all.forEach(h => {
    m[h.vyrobca] = (m[h.vyrobca] || 0) + 1;
  });
  console.log(m);

  console.log("\nProsto House models:");
  all.filter(h => h.vyrobca === "Prosto House").forEach(h => {
    console.log(`- ID: ${h.id} | Name: ${h.nazov} | Price: ${h.zakladna_cena}`);
    if (h.galerie) {
      console.log(`  Galleries: ${h.galerie.map(g => g.typ).join(', ')}`);
    }
  });
}
run();
