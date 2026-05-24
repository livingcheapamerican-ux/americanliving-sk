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
    const d = await base44.entities.Dom.get('6916ec94c11aacdd15248f07');
    console.log("London exterier_drevo_plech photos:");
    const g = d.galerie.find(g => g.typ === 'exterier_drevo_plech');
    if (g && g.fotky) {
      g.fotky.forEach((f, i) => console.log(`${i}: ${f}`));
    }
  } catch(e) {
    console.error(e);
  }
}
run();
