import { URLSearchParams } from 'url';
global.window = { 
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, 
  history: { replaceState: () => {} } 
};
global.URLSearchParams = URLSearchParams;
global.localStorage = new Map();
global.localStorage.getItem = (k) => global.localStorage.get(k);
global.localStorage.setItem = (k, v) => global.localStorage.set(k, v);

import { base44 } from './src/api/base44Client.js';

async function run() {
  console.log("Fetching AppConfiguration...");
  try {
    const res = await base44.entities.AppConfiguration.filter({});
    console.log("All AppConfigurations:", JSON.stringify(res, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
