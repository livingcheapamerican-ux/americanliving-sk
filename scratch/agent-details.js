import fs from 'fs';
import os from 'os';
import path from 'path';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const appId = '6916d89a485af231beb54c71';

async function test() {
  const url = `https://base44.app/api/apps/${appId}/agent-configs`;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();
    console.log("Full agent configs JSON:");
    body.items?.forEach(i => {
      console.log("-----------------------------------------");
      console.log("Name:", i.name);
      console.log("ID:", i.id);
      console.log("App ID:", i.app_id);
      console.log("Model:", i.model);
      console.log("Keys:", Object.keys(i));
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
