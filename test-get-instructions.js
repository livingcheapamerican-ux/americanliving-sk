import fs from 'fs';
import os from 'os';
import path from 'path';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const appId = '6916d89a485af231beb54c71';

async function test() {
  const url = `https://base44.app/api/apps/${appId}/agent-configs`;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();
    console.log("Agent count:", body.items?.length);
    body.items?.forEach(i => {
      console.log("=========================================");
      console.log("Agent Name:", i.name);
      const lines = i.instructions.split('\n');
      console.log("Lines containing 'bezplatne':");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('bezplatne') || line.toLowerCase().includes('zadarmo') || line.toLowerCase().includes('povolenie')) {
          console.log(`Line ${index + 1}: ${line}`);
        }
      });
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
