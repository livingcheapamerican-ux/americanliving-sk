import fs from 'fs';
import readline from 'readline';

async function extract() {
  const fileStream = fs.createReadStream('/Users/richardkovac/.gemini/antigravity/brain/cf6acf9d-eeee-4646-8981-d5ca3a93c906/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('"step_index":1678') || line.includes('FIREMNÉ KNOW-HOW: PRODUKTOVÉ PORTFÓLIO')) {
      try {
        const obj = JSON.parse(line);
        fs.writeFileSync('know-how.md', obj.content || '');
        console.log("Successfully extracted to know-how.md! Length:", (obj.content || '').length);
        break;
      } catch (e) {
        console.error("Failed to parse JSON:", e);
      }
    }
  }
}

extract();
