const fs = require('fs');
const json5 = require('json5');

const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/base44/agents/american_living_assistant.jsonc';
const config = json5.parse(fs.readFileSync(filePath, 'utf8'));

const keyword = 'ARGUMENTS';
const idx = config.instructions.indexOf(keyword);
if (idx !== -1) {
  console.log('Found "ARGUMENTS" at index:', idx);
  console.log('Substring around it:');
  console.log(JSON.stringify(config.instructions.substring(idx - 20, idx + 40)));
} else {
  console.log('Not found "ARGUMENTS" in instructions.');
  console.log('Is it in description?');
  console.log('Description index:', config.description.indexOf(keyword));
}
