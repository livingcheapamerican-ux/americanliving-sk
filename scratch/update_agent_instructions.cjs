const fs = require('fs');
const json5 = require('json5');

const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/base44/agents/american_living_assistant.jsonc';
const config = json5.parse(fs.readFileSync(filePath, 'utf8'));

// Define the text to insert
const newArguments = `\n\n═══════════════════════════════════════════════════════
🎁 SÚKROMNÝ GRANT, FINANCOVANIE & GARANCIE:
- Program AMERICANA je **súkromný marketingový grant**, nie štátna pomoc ani dotácia. Vždy ho prezentuj ako súkromný grant!
- Model **100% financovania**: pre tých, ktorí nemajú našetrené (nulové vlastné úspory), vieme vybaviť financovanie celej výstavby od A po Z.
- Garancia termínu: Dom odovzdávame **do 12 týždňov** od vydaného stavebného povolenia a dokončení základov. (Nikdy nehovor o 90 dňoch).
- NIKDY neuvádzaj konkrétny počet domov vo výstavbe ani to, kde presne sa stavajú (predíde sa tým zbytočným otázkam kde to je).
═══════════════════════════════════════════════════════\n\n`;

const searchKey = '📅 KONZULTÁCIA:';
const idx = config.instructions.indexOf(searchKey);

if (idx !== -1) {
  config.instructions = 
    config.instructions.substring(0, idx) + 
    newArguments +
    config.instructions.substring(idx);
  console.log('Instructions updated successfully!');
} else {
  console.error('ERROR: Could not find search key in instructions.');
  process.exit(1);
}

fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
console.log('File updated successfully.');
