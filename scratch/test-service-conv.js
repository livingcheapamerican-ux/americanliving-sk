import { URLSearchParams } from 'url';
global.window = { 
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, 
  history: { replaceState: () => {} },
  document: { referrer: '', title: '', cookie: '' },
  addEventListener: () => {}
};
global.document = global.window.document;
global.URLSearchParams = URLSearchParams;

// In-memory localStorage mock that works like local storage in the browser
const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

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
  serviceToken: token,
  requiresAuth: false
});

async function run() {
  try {
    console.log("Testing asServiceRole.entities.User.list()...");
    const users = await base44.asServiceRole.entities.User.list();
    console.log("Found users via service role:", users.length);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}, Role: ${u.role}`);
    });
  } catch (e) {
    console.error("Error listing users via service role:", e.message || e);
  }

  try {
    console.log("\nTesting asServiceRole.agents.createConversation...");
    const conversation = await base44.asServiceRole.agents.createConversation({
      agent_name: 'american_living_assistant',
      metadata: { name: 'Test Service Role Run' }
    });
    console.log("Conversation created successfully! ID:", conversation.id);
  } catch (e) {
    console.error("Error creating conversation via service role:", e.message || e);
    if (e.response) {
      console.error("Response error data:", JSON.stringify(e.response.data, null, 2));
    }
  }
}

run();
