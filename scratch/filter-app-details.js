import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
let token = null;
try {
  const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  token = authData.accessToken;
} catch (e) {}

if (!token) {
  process.exit(1);
}

async function run() {
  try {
    const res = await fetch('https://base44.app/api/apps/6916d89a485af231beb54c71', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const app = await res.json();
    const appCopy = {};
    for (const key of Object.keys(app)) {
      if (typeof app[key] !== 'object' || app[key] === null) {
        appCopy[key] = app[key];
      } else {
        appCopy[key] = `Object/Array (${Array.isArray(app[key]) ? app[key].length : Object.keys(app[key]).length} items)`;
      }
    }
    console.log(appCopy);
  } catch(e) {
    console.error(e);
  }
}
run();
