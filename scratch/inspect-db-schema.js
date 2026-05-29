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

const entities = [
  'AppConfiguration',
  'LokaciaSEO',
  'ABTest',
  'MarketingHistory',
  'BlogPost',
  'Dom',
  'GoogleDriveAutomation',
  'GoogleDriveNotification',
  'GoogleDriveSync',
  'SiteSettings',
  'Dopyt',
  'KonfiguratorText',
  'NastavenieCenovejPonuky',
  'MarketingNotification',
  'NotificationSettings',
  'UserSession',
  'Fotka'
];

async function run() {
  console.log("Explicitly checking entities in DB...");
  for (const entityName of entities) {
    try {
      const list = await base44.entities[entityName].list();
      console.log(`Entity: ${entityName} | Count: ${list.length}`);
      
      for (const item of list) {
        const itemStr = JSON.stringify(item);
        if (itemStr.toLowerCase().includes("hromozvod") || itemStr.toLowerCase().includes("zákazník") || itemStr.toLowerCase().includes("bez základov")) {
          console.log(`  -> MATCH in item ID ${item.id || item._id}:`);
          for (const [k, v] of Object.entries(item)) {
            if (typeof v === 'string' && (v.toLowerCase().includes("hromozvod") || v.toLowerCase().includes("zákazník") || v.toLowerCase().includes("bez základov"))) {
              console.log(`     field "${k}": "${v}"`);
            }
          }
        }
      }
    } catch (e) {
      console.error(`  Error listing ${entityName}:`, e.message);
    }
  }
}

run();
