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
    const all = await base44.entities.Dom.filter({ verejny: true });
    console.log(`Found ${all.length} public houses:`);
    all.sort((a, b) => (b.zakladna_cena || 0) - (a.zakladna_cena || 0)); // Sort by price descending (most lucrative)
    all.slice(0, 10).forEach(h => {
      console.log(`- ID: ${h.id} | Nazov: ${h.nazov} | Cena: ${h.zakladna_cena} | Vyrobca: ${h.vyrobca}`);
      console.log(`  Main Image: ${h.hlavny_obrazok}`);
      if (h.galerie) {
        console.log(`  Galerie types: ${h.galerie.map(g => g.typ).join(', ')}`);
        h.galerie.forEach(g => {
          if (g.fotky && g.fotky.length > 0) {
            console.log(`    [${g.typ}]: ${g.fotky[0]} (Total: ${g.fotky.length})`);
          }
        });
      }
    });
  } catch(e) {
    console.error(e);
  }
}
run();
