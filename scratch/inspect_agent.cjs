const fs = require('fs');
const json5 = require('json5');

const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/base44/agents/american_living_assistant.jsonc';
const config = json5.parse(fs.readFileSync(filePath, 'utf8'));

console.log("=== WHATSAPP GREETING ===");
console.log(config.whatsapp_greeting);

console.log("\n=== INSTRUCTIONS (LINES) ===");
const lines = config.instructions.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('dotac') || line.toLowerCase().includes('grant') || line.toLowerCase().includes('garanc')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});

console.log("\n=== ALL INSTRUCTIONS ===");
console.log(config.instructions);
