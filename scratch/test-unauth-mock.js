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

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  requiresAuth: false
});

async function run() {
  try {
    console.log("Creating unauthenticated conversation for american_living_assistant...");
    const conversation = await base44.agents.createConversation({
      agent_name: 'american_living_assistant',
      metadata: { name: 'Test Unauth Node' }
    });
    console.log("Conversation created successfully! ID:", conversation.id);
    
    const question = "Ahoj, chcel by som sa opýtať: je stavebné povolenie zadarmo?";
    console.log(`Sending message: "${question}"`);
    await base44.agents.addMessage(conversation.id, { role: 'user', content: question });
    console.log("User message added! Waiting 15 seconds for response...");
    
    await new Promise(r => setTimeout(r, 15000));
    
    console.log("Retrieving conversation...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("Messages:");
    details.messages?.forEach(m => {
      console.log(`- [${m.role}]: ${m.content}`);
    });
  } catch (e) {
    console.error("Error running test:", e.message || e);
    if (e.response) {
      console.error("Error response:", JSON.stringify(e.response.data, null, 2));
    }
  }
}
run();
