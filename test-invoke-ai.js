import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  requiresAuth: false
});

async function run() {
  try {
    console.log("Invoking aiAsistent Edge function...");
    const response = await base44.functions.invoke('aiAsistent', {
      message: 'Ahoj, chcem sa opýtať, či je stavebné povolenie a projektová dokumentácia zadarmo?',
      context: 'general',
      history: []
    });
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error("Error response data:", e.response.data);
    } else {
      console.error("Error invoking function:", e);
    }
  }
}
run();
