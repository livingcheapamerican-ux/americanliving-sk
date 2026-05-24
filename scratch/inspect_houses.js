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

async function main() {
  try {
    const domy = await base44.entities.Dom.list();
    console.log("Found", domy.length, "houses");
    const formatted = domy.map(d => ({
      id: d.id,
      nazov: d.nazov,
      vyrobca: d.vyrobca,
      verejny: d.verejny,
      popularny: d.popularny
    }));
    console.log(JSON.stringify(formatted, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
