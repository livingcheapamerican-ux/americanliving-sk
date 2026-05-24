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
  token: token,
  requiresAuth: false
});

async function run() {
  try {
    console.log("Attempting to create conversation...");
    const conversation = await base44.agents.createConversation({
      agent_name: "american_living_assistant",
      metadata: { name: "Test Chatbot Node Run" }
    });
    console.log("Success! ID:", conversation.id);
  } catch (e) {
    console.log("Error type:", e.name);
    console.log("Error message:", e.message);
    if (e.response) {
      console.log("Response status:", e.response.status);
      console.log("Response headers:", Object.keys(e.response.headers));
      console.log("Response data:", typeof e.response.data === 'object' ? JSON.stringify(e.response.data, null, 2) : e.response.data);
    }
  }
}
run();
