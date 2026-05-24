import { URLSearchParams } from 'url';
global.window = { 
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, 
  history: { replaceState: () => {} },
  document: { referrer: '', title: '', cookie: '' },
  addEventListener: () => {}
};
global.document = global.window.document;
global.URLSearchParams = URLSearchParams;

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
  const email = `test-pricing-${Date.now()}@example.com`;
  const password = `TestPassword123!`;

  try {
    console.log(`Registering user with email: ${email}...`);
    const regResult = await base44.auth.register({
      email,
      password
    });
    console.log("Registration result:", JSON.stringify(regResult, null, 2));

    console.log("Logging in...");
    const loginResult = await base44.auth.loginViaEmailPassword(email, password);
    console.log("Login result: SUCCESS!");
    console.log("Token:", loginResult.access_token);
    console.log("User details:", JSON.stringify(loginResult.user, null, 2));
  } catch (e) {
    console.error("Error during registration/login:", e.message || e);
    if (e.response) {
      console.error("Error details:", JSON.stringify(e.response.data, null, 2));
    }
  }
}

run();
