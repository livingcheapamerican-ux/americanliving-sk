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
    console.log("Creating conversation...");
    const conversation = await base44.agents.createConversation({
      agent_name: "american_living_assistant",
      metadata: { name: "Test Chatbot Node Run" }
    });
    console.log("Conversation created:", conversation.id);
    
    console.log("Adding user message...");
    await base44.agents.addMessage(conversation.id, { role: "user", content: "Ahoj, ake Ticab domy mate?" });
    console.log("User message added! Waiting 8 seconds...");
    
    await new Promise(r => setTimeout(r, 8000));
    
    console.log("Retrieving conversation...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("Messages:");
    details.messages?.forEach(m => {
      console.log(`- [${m.role}]: ${m.content}`);
    });
  } catch (e) {
    console.error("Error running test-agent-run:", e);
  }
}
run();
