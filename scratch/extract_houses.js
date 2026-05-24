import fs from 'fs';
import path from 'path';

const pagesDir = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages';
const result = {};

for (let i = 1; i <= 9; i++) {
  const filename = `KonfiguratorPH00${i}.jsx`;
  const filePath = path.join(pagesDir, filename);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Try multiple regex patterns to capture the HOUSE object
    let match = content.match(/const HOUSE = ([\s\S]+?);\n\nexport default/);
    if (!match) {
      match = content.match(/const HOUSE = ([\s\S]+?);\n\n/);
    }
    
    if (match) {
      // Clean up JS syntax to make it look like valid JSON for printing or just save as raw text
      result[`PH-00${i}`] = match[1].trim();
    } else {
      result[`PH-00${i}`] = "COULD NOT MATCH";
      // Log some context around const HOUSE
      const houseIndex = content.indexOf('const HOUSE =');
      if (houseIndex !== -1) {
        console.log(`Context in PH00${i}:`, content.substring(houseIndex, houseIndex + 400));
      }
    }
  } else {
    result[`PH-00${i}`] = "FILE DOES NOT EXIST";
  }
}

fs.writeFileSync('/Users/richardkovac/Documents/american_living_web/american-living-sk/scratch/extracted_houses_raw.txt', JSON.stringify(result, null, 2), 'utf8');
console.log("Successfully extracted raw configuration objects to scratch/extracted_houses_raw.txt");
