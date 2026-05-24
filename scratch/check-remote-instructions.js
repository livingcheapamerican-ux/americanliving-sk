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
    body.items?.forEach(i => {
      console.log("=========================================");
      console.log("Name:", i.name);
      console.log("Instructions snippet (first 500 chars):");
      console.log(i.instructions ? i.instructions.substring(0, 500) : "NULL");
      console.log("Instructions snippet (contains 'bezplatne' or 'zadarmo'):");
      if (i.instructions) {
        const lines = i.instructions.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes('bezplat') || line.toLowerCase().includes('zadarmo') || line.toLowerCase().includes('povolenie')) {
            console.log(`Line ${idx+1}: ${line}`);
          }
        });
      }
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
