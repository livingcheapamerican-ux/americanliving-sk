import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;
const appId = '6916d89a485af231beb54c71';

async function run() {
  try {
    const res = await fetch(`https://base44.app/api/apps/${appId}/agents/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Status:", res.status);
    if (res.status === 200) {
      const body = await res.json();
      console.log("Found conversations:", body.length);
      console.log(JSON.stringify(body.slice(0, 5), null, 2));
    } else {
      console.log("Response:", await res.text());
    }
  } catch(e) {
    console.error(e);
  }
}
run();
