import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  requiresAuth: false
});

async function run() {
  console.log("Fetching AppConfiguration...");
  try {
    const list = await base44.entities.AppConfiguration.filter({});
    console.log("AppConfigurations count:", list.length);
    console.log("All AppConfigurations:", JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
