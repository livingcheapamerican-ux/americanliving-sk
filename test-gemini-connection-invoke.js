import { createClient } from '@base44/sdk';
import fs from 'fs';
import os from 'os';
import path from 'path';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: true
});

async function run() {
  try {
    console.log("Invoking testGeminiConnection...");
    const response = await base44.functions.invoke('testGeminiConnection', {});
    console.log("Response:", response);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
