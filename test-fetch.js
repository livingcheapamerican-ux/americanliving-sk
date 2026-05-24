global.window = { location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, history: { replaceState: () => {} } };
import { base44 } from './src/api/base44Client.js';

async function check() {
  console.log("Checking AppConfiguration...");
  try {
    const existing = await base44.entities.AppConfiguration.filter({ config_key: 'ai_system_prompt' });
    console.log("Found rows:", existing.length);
    existing.forEach(r => console.log(JSON.stringify(r)));
  } catch(e) {
    console.error("Error:", e);
  }
}
check();
