import { URLSearchParams } from 'url';
global.window = { 
  location: { href: 'http://localhost:5173', search: '', pathname: '', hash: '' }, 
  history: { replaceState: () => {} },
  document: { referrer: '', title: '', cookie: '' },
  addEventListener: () => {}
};
global.document = global.window.document;
global.URLSearchParams = URLSearchParams;
global.localStorage = new Map();
global.localStorage.getItem = (k) => global.localStorage.get(k);
global.localStorage.setItem = (k, v) => global.localStorage.set(k, v);

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
    const users = await base44.entities.User.list();
    console.log("Found users in DB:", users.length);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}, Role: ${u.role}, SuperAdmin: ${u.super_admin}`);
    });
  } catch (e) {
    console.error("Error listing users:", e.message || e);
  }
}
run();
