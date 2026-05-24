import { URLSearchParams } from 'url';
global.window = { 
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, 
  history: { replaceState: () => {} },
  document: { referrer: '', title: '', cookie: '' },
  addEventListener: () => {}
};
global.document = global.window.document;
global.URLSearchParams = URLSearchParams;
global.localStorage = new Map();
global.localStorage.getItem = (k) => global.localStorage.get(k);
global.localStorage.setItem = (k, v) => global.localStorage.set(k, v);
global.localStorage.removeItem = (k) => global.localStorage.delete(k);

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

async function run() {
  try {
    console.log("Creating conversation for american_living_assistant...");
    const conversation = await base44.agents.createConversation({
      agent_name: 'american_living_assistant',
      metadata: { context: 'general' }
    });
    console.log("Conversation created! ID:", conversation.id);

    const question = "Ahoj, chcel by som sa opýtať: je stavebné povolenie zadarmo?";
    console.log(`Sending message: "${question}"`);
    await base44.agents.addMessage(conversation.id, { role: 'user', content: question });
    console.log("Message sent! Waiting 12 seconds for response...");

    await new Promise(r => setTimeout(r, 12000));

    console.log("Retrieving conversation history...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("-----------------------------------------");
    details.messages?.forEach(m => {
      console.log(`[${m.role.toUpperCase()}]: ${m.content}`);
    });
    console.log("-----------------------------------------");
  } catch (e) {
    console.error("Error in test conversation:", e.message || e);
    if (e.response) {
      console.error("Error response:", JSON.stringify(e.response.data, null, 2));
    }
  }
}

run();
