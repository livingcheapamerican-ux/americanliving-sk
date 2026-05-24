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

async function runTest(agentName) {
  console.log(`\n=========================================`);
  console.log(`Running test conversation for agent: ${agentName}`);
  console.log(`=========================================`);
  try {
    console.log("Creating conversation...");
    const conversation = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `Test Pricing ${agentName}` }
    });
    console.log("Conversation created successfully! ID:", conversation.id);
    
    const question = "Je stavebné povolenie a projektová dokumentácia zadarmo?";
    console.log(`Asking: "${question}"`);
    await base44.agents.addMessage(conversation.id, { role: "user", content: question });
    console.log("User message added! Waiting 10 seconds for response...");
    
    await new Promise(r => setTimeout(r, 10000));
    
    console.log("Retrieving conversation messages...");
    const details = await base44.agents.getConversation(conversation.id);
    console.log("Response:");
    const lastMessage = details.messages?.filter(m => m.role === 'assistant').pop();
    if (lastMessage) {
      console.log(lastMessage.content);
    } else {
      console.log("No response received yet.");
    }
  } catch (e) {
    console.error(`Error with agent ${agentName}:`, e.message || e);
    if (e.response) {
      console.error("Response error data:", JSON.stringify(e.response.data, null, 2));
    }
  }
}

async function run() {
  await runTest("american_living_assistant");
  await runTest("quote_assistant");
}

run();
