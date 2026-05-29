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
  console.log("Fetching Dom entities...");
  try {
    const domy = await base44.entities.Dom.list();
    console.log(`Total houses found: ${domy.length}`);
    for (const d of domy) {
      console.log(`Name: ${d.nazov} | Manufacturer: ${d.vyrobca}`);
      console.log(`- specifikacia_hu exists? ${!!d.specifikacia_hu}`);
      if (d.specifikacia) {
        console.log(`- specifikacia (SK) preview: ${d.specifikacia.substring(0, 100).replace(/\n/g, ' ')}...`);
      } else {
        console.log(`- specifikacia (SK) is empty`);
      }
      if (d.specifikacia_hu) {
        console.log(`- specifikacia (HU) preview: ${d.specifikacia_hu.substring(0, 100).replace(/\n/g, ' ')}...`);
      }
      console.log('---');
    }
  } catch(e) {
    console.error("Error fetching houses:", e);
  }
}
run();
