import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;
const appId = '6916d89a485af231beb54c71';

async function run() {
  const urls = [
    `https://base44.app/api/apps/${appId}/users`,
    `https://base44.app/api/apps/${appId}/members`
  ];
  for (const url of urls) {
    try {
      console.log("Fetching:", url);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("Status:", res.status);
      if (res.status === 200) {
        console.log("Body:", await res.text());
      }
    } catch(e) {
      console.error(e);
    }
  }
}
run();
