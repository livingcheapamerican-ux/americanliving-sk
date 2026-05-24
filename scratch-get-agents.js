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
    console.log("Agents returned:", body.items.map(i => ({
      name: i.name,
      description: i.description,
      model: i.model,
      tool_configs: i.tool_configs,
      whatsapp_greeting: i.whatsapp_greeting
    })));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
