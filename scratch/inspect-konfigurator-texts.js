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
  console.log("Fetching KonfiguratorText entities...");
  try {
    const list = await base44.entities.KonfiguratorText.list();
    console.log(`Total items found: ${list.length}`);
    if (list.length > 0) {
      console.log("Sample item fields:", Object.keys(list[0]));
      console.log("Sample item data:", JSON.stringify(list[0], null, 2));
    }
  } catch(e) {
    console.error("Error fetching KonfiguratorText:", e);
  }
}
run();
