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
    const barn48 = domy.find(d => d.id === '6916ec94c11aacdd15248f31');
    const barn72 = domy.find(d => d.id === '6916ec94c11aacdd15248f2c');
    
    console.log("=== BARN 48 ===");
    if (barn48 && barn48.galerie) {
      barn48.galerie.forEach(g => {
        console.log(`Type: ${g.typ}`);
        g.fotky.forEach((f, i) => console.log(`  ${i}: ${f}`));
      });
    }
    
    console.log("\n=== BARN DOUBLE 72 ===");
    if (barn72 && barn72.galerie) {
      barn72.galerie.forEach(g => {
        console.log(`Type: ${g.typ}`);
        g.fotky.forEach((f, i) => console.log(`  ${i}: ${f}`));
      });
    }
  } catch(e) {
    console.error(e);
  }
}
run();
