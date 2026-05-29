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
  console.log("Testing base44.integrations.Core.InvokeLLM...");
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: "Say 'Hello from internal LLM integration!' and nothing else.",
      add_context_from_internet: false
    });
    console.log("Result:", JSON.stringify(res));
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
