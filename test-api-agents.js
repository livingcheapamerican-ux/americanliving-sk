import fs from 'fs';
import os from 'os';
import path from 'path';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const appId = '6916d89a485af231beb54c71';

async function test() {
  const url = `https://base44.app/api/apps/${appId}/agents`;
  console.log("Fetching from:", url);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Body:", body.substring(0, 1000));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
