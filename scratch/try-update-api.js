import fs from 'fs';
import os from 'os';
import path from 'path';
import json5 from 'json5';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const appId = '6916d89a485af231beb54c71';

function parseJsonc(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return json5.parse(content);
}

async function tryEndpoint(method, url, payload) {
  console.log(`Trying ${method} ${url}...`);
  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text.substring(0, 1000)}`);
    return res.status;
  } catch (e) {
    console.error("Error:", e);
    return null;
  }
}

async function run() {
  const americanLivingAssistant = parseJsonc('base44/agents/american_living_assistant.jsonc');
  
  // Try PUT /api/apps/${appId}/agent-configs/${name}
  const url1 = `https://base44.app/api/apps/${appId}/agent-configs/american_living_assistant`;
  await tryEndpoint('PUT', url1, americanLivingAssistant);
  
  // Try PATCH /api/apps/${appId}/agent-configs/${name}
  await tryEndpoint('PATCH', url1, americanLivingAssistant);

  // Try POST /api/apps/${appId}/agent-configs/${name}
  await tryEndpoint('POST', url1, americanLivingAssistant);

  // Try PUT /api/apps/${appId}/agent-configs with single agent payload (not array)
  const url2 = `https://base44.app/api/apps/${appId}/agent-configs`;
  await tryEndpoint('PUT', url2, americanLivingAssistant);
}

run();
