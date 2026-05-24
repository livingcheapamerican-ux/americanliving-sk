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

async function push() {
  const americanLivingAssistant = parseJsonc('base44/agents/american_living_assistant.jsonc');
  const quoteAssistant = parseJsonc('base44/agents/quote_assistant.jsonc');

  const agentsPayload = [americanLivingAssistant, quoteAssistant];
  console.log("Preparing to push agents:", agentsPayload.map(a => a.name));

  const url = `https://base44.app/api/apps/${appId}/agent-configs`;
  console.log("PUT to:", url);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentsPayload)
    });

    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Response:", body);
  } catch (e) {
    console.error("Error during push:", e);
  }
}

push();
