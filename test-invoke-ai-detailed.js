import { createClient } from '@base44/sdk';
import axios from 'axios';

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  requiresAuth: false
});

async function run() {
  try {
    console.log("Invoking aiAsistent with 15s timeout...");
    // Let's call it using axios directly or SDK
    const startTime = Date.now();
    
    // SDK invocation
    const response = await Promise.race([
      base44.functions.invoke('aiAsistent', {
        message: 'Ahoj, chcem sa opýtať, či je stavebné povolenie a projektová dokumentácia zadarmo?',
        context: 'general',
        history: []
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 15 seconds")), 15000))
    ]);
    
    console.log(`Success! Time taken: ${Date.now() - startTime}ms`);
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (e) {
    console.error("Invocation failed:", e.message);
    if (e.response) {
      console.error("Status:", e.response.status);
      console.error("Data:", e.response.data);
    }
  }
}
run();
