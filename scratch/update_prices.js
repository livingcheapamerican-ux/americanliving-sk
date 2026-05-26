import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Read token for Base44 authentication
const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
let token = null;
try {
  const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  token = authData.accessToken;
} catch (e) {}

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: false
});

const pagesDir = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages';

// New prices received from the user
const NEW_PRICES = {
  "PH-001": {
    "basePrice": 61700,
    "options": {
      "mounting-1": 17970,
      "interior-1": 24600,
      "interior-2": 28290
    },
    "addons": {
      "addon-electricity": 7400,
      "addon-water": 2856,
      "addon-laminateFloors": 4330,
      "addon-windowLamination": 3100,
      "addon-windowTint": 1300,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 1250,
      "heatPump": 6510,
      "recuperation": 3700,
      "sanita": 1169,
      "boiler": 246,
      "networks": 1994,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-002": {
    "basePrice": 61000,
    "options": {
      "mounting-1": 19500,
      "interior-1": 27000,
      "interior-2": 31050
    },
    "addons": {
      "addon-electricity": 7803,
      "addon-water": 4380,
      "addon-laminateFloors": 4870,
      "addon-windowLamination": 3400,
      "addon-windowTint": 1550,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 2000,
      "heatPump": 3600,
      "recuperation": 7749,
      "sanita": 1400,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-003": {
    "basePrice": 45950,
    "options": {
      "mounting-1": 13785,
      "interior-1": 19050,
      "interior-2": 14545
    },
    "addons": {
      "addon-electricity": 5200,
      "addon-water": 2520,
      "addon-laminateFloors": 3160,
      "addon-windowLamination": 2400,
      "addon-windowTint": 840,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 1000,
      "heatPump": 3830,
      "recuperation": 1906,
      "sanita": 1300,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-004": {
    "basePrice": 51000,
    "options": {
      "mounting-1": 15650,
      "interior-1": 25700,
      "interior-2": 29555
    },
    "addons": {
      "addon-electricity": 7500,
      "addon-water": 2856,
      "addon-laminateFloors": 4210,
      "addon-windowLamination": 2100,
      "addon-windowTint": 1380,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 1000,
      "heatPump": 3720,
      "recuperation": 1480,
      "sanita": 1169,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-005": {
    "basePrice": 38000,
    "options": {
      "mounting-1": 9500,
      "interior-1": 12300,
      "interior-2": 14145
    },
    "addons": {
      "addon-electricity": 3900,
      "addon-water": 1380,
      "addon-laminateFloors": 2625,
      "addon-windowLamination": 1450,
      "addon-windowTint": 700,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 750,
      "heatPump": 2889,
      "recuperation": 1524,
      "sanita": 1400,
      "boiler": 246,
      "networks": 1500,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-006": {
    "basePrice": 31700,
    "options": {
      "mounting-1": 7925,
      "interior-1": 12300,
      "interior-2": 14145
    },
    "addons": {
      "addon-electricity": 3900,
      "addon-water": 1380,
      "addon-laminateFloors": 2040,
      "addon-windowLamination": 1550,
      "addon-windowTint": 680,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 750,
      "heatPump": 2889,
      "recuperation": 1524,
      "sanita": 1400,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 1000
    }
  },
  "PH-007": {
    "basePrice": 23400,
    "options": {
      "mounting-1": 7200,
      "interior-1": 6600,
      "interior-2": 7590
    },
    "addons": {
      "addon-electricity": 2300,
      "addon-water": 1176,
      "addon-laminateFloors": 1715,
      "addon-windowLamination": 850,
      "addon-windowTint": 420,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 500,
      "heatPump": 2889,
      "recuperation": 1524,
      "sanita": 1400,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 500
    }
  },
  "PH-008": {
    "basePrice": 21600,
    "options": {
      "mounting-1": 5400,
      "interior-1": 6150,
      "interior-2": 7073
    },
    "addons": {
      "addon-electricity": 2300,
      "addon-water": 1176,
      "addon-laminateFloors": 1470,
      "addon-windowLamination": 790,
      "addon-windowTint": 375,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 500,
      "heatPump": 1926,
      "recuperation": 762,
      "sanita": 1400,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 500
    }
  },
  "PH-009": {
    "basePrice": 19950,
    "options": {
      "mounting-1": 4990,
      "interior-1": 5700,
      "interior-2": 6555
    },
    "addons": {
      "addon-electricity": 2300,
      "addon-water": 1176,
      "addon-laminateFloors": 910,
      "addon-windowLamination": 750,
      "addon-windowTint": 340,
      "addon-roofWindow": 760,
      "addon-fixWindow": 500,
      "addon-tiltWindowBig": 540,
      "addon-tiltWindowSmall": 225,
      "addon-interiorDoor": 250,
      "heatPump": 963,
      "recuperation": 762,
      "sanita": 1400,
      "boiler": 500,
      "networks": 1993,
      "engineering": 2590,
      "projectant": 3500,
      "revision": 500
    }
  }
};

// Clean helper to parse JS object string from file
function parseJsObject(jsString) {
  try {
    const fn = new Function(`return ${jsString}`);
    return fn();
  } catch (err) {
    console.error("Failed to parse JS object:", err);
    return null;
  }
}

// Convert JSON object back to formatted JS string (without quotes on keys for clean React code style)
function formatJsObject(obj) {
  const jsonStr = JSON.stringify(obj, null, 2);
  // Unquote keys that are valid JS identifiers to match standard style
  return jsonStr.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)"\s*:/g, '$1:');
}

async function run() {
  console.log("Fetching Dom entities from database...");
  const domy = await base44.entities.Dom.filter({});
  const prostoDomy = domy.filter(d => 
    d.vyrobca?.toLowerCase().includes("prosto") || 
    d.prosto_house_kod || 
    d.nazov?.toLowerCase().includes("flat") ||
    d.nazov?.toLowerCase().includes("fjord") ||
    d.nazov?.toLowerCase().includes("barn") ||
    d.nazov?.toLowerCase().includes("a-frame")
  );

  console.log(`Found ${prostoDomy.length} Prosto House models in DB.`);

  for (let i = 1; i <= 9; i++) {
    const code = `PH-00${i}`;
    const codeLower = `ph00${i}`;
    const filename = `KonfiguratorPH00${i}.jsx`;
    const filePath = path.join(pagesDir, filename);
    const newPrices = NEW_PRICES[code];

    if (!newPrices) {
      console.log(`No new prices defined for ${code}. Skipping.`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`PROCESSING MODEL: ${code}`);
    console.log(`========================================`);

    // 1. DATABASE UPDATE
    const dbDom = prostoDomy.find(d => 
      d.prosto_house_kod === code || 
      (d.nazov && d.nazov.includes(code)) || 
      (i === 7 && d.nazov?.includes("A-Frame")) ||
      (i === 8 && d.nazov?.includes("Barn 48")) ||
      (i === 9 && d.nazov?.includes("Flat Small"))
    );

    if (dbDom) {
      console.log(`Found Database Entity ID: ${dbDom.id}`);
      
      const updateData = {};
      
      // Update Base Price
      if (newPrices.basePrice) {
        updateData.zakladna_cena = newPrices.basePrice;
        console.log(`- Base Price updated to: ${newPrices.basePrice} €`);
      }

      // Update Custom Ceny config
      const customCeny = dbDom.konfigurator_custom_ceny_prosto_house || {};
      
      // Update root montaz key (important for backward compatibility)
      if (newPrices.options && newPrices.options["mounting-1"] !== undefined) {
        customCeny.montaz = newPrices.options["mounting-1"];
        // Also support montaz_ano for PH-007 / PH-008
        if (i === 7 || i === 8) {
          customCeny.montaz_ano = newPrices.options["mounting-1"];
        }
        console.log(`- DB root montaz updated to: ${newPrices.options["mounting-1"]} €`);
      }

      // Initialize nested object if missing
      if (!customCeny[codeLower]) {
        customCeny[codeLower] = {};
      }
      
      const subObj = customCeny[codeLower];

      // Update nested options
      if (newPrices.options) {
        for (const [optKey, price] of Object.entries(newPrices.options)) {
          subObj[optKey] = price;
          console.log(`  - Option override: ${optKey} = ${price} €`);
          
          // Legacy support: map model-specific options back to flat root keys for PH-007 / PH-008
          if (i === 7 || i === 8) {
            if (optKey === 'mounting-1') customCeny.montaz_ano = price;
            if (optKey === 'interior-1') customCeny.interierFinis_drevo = price;
            if (optKey === 'interior-2') customCeny.interierFinis_sadrokarton = price;
          }
        }
      }

      // Update nested addons
      if (newPrices.addons) {
        for (const [addonKey, price] of Object.entries(newPrices.addons)) {
          // Normalize addon key with addon- prefix
          const dbAddonKey = addonKey.startsWith("addon-") ? addonKey : `addon-${addonKey}`;
          subObj[dbAddonKey] = price;
          console.log(`  - Addon override: ${dbAddonKey} = ${price} €`);

          // Legacy support: map model-specific addons back to flat root keys for PH-007 / PH-008
          if (i === 7 || i === 8) {
            const rawKey = addonKey.replace("addon-", "");
            if (rawKey === 'electricity') customCeny.elektroinstalacia = price;
            if (rawKey === 'water') customCeny.vodaKanalizacia = price;
            if (rawKey === 'sanita') customCeny.sanitaKomplet = price;
            if (rawKey === 'boiler') customCeny.bojler = price;
            if (rawKey === 'heatPump') customCeny.tepelneCerpadlo = price;
            if (rawKey === 'recuperation') customCeny.rekuperacia = price;
            if (rawKey === 'windowLamination') customCeny.povrchokaOkien = price;
            if (rawKey === 'windowTint') customCeny.tonovaneSkla = price;
            if (rawKey === 'laminateFloors') customCeny.vnutornePodlahy = price;
            if (rawKey === 'networks') customCeny.pripojkaSiete = price;
            if (rawKey === 'revision') customCeny.revizna = price;
          }
        }
      }

      updateData.konfigurator_custom_ceny_prosto_house = customCeny;

      // Execute database update
      await base44.entities.Dom.update(dbDom.id, updateData);
      console.log(`✓ DB Entity successfully updated.`);
    } else {
      console.log(`⚠️ Warning: Database Entity for ${code} NOT found.`);
    }

    // 2. CODEBASE FILE UPDATE
    if (fs.existsSync(filePath)) {
      console.log(`Found React file: ${filename}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Determine variable name in the react file
      const varName = i === 8 ? 'HOUSE_PH008' : 'HOUSE';
      const varRegex = new RegExp(`const ${varName} = ([\\s\\S]+?);\\n\\n`);
      
      const match = content.match(varRegex);
      if (match) {
        const houseObj = parseJsObject(match[1].trim());
        if (houseObj) {
          // Update basePrice
          if (newPrices.basePrice) {
            houseObj.basePrice = newPrices.basePrice;
          }

          // Update options prices
          if (newPrices.options && houseObj.options) {
            if (newPrices.options["mounting-1"] !== undefined && houseObj.options.mounting && houseObj.options.mounting[1]) {
              houseObj.options.mounting[1].price = newPrices.options["mounting-1"];
            }
            if (newPrices.options["interior-1"] !== undefined && houseObj.options.interior && houseObj.options.interior[1]) {
              houseObj.options.interior[1].price = newPrices.options["interior-1"];
            }
            if (newPrices.options["interior-2"] !== undefined && houseObj.options.interior && houseObj.options.interior[2]) {
              houseObj.options.interior[2].price = newPrices.options["interior-2"];
            }
          }

          // Update addons
          if (newPrices.addons && houseObj.addons) {
            for (const [addonKey, price] of Object.entries(newPrices.addons)) {
              const rawKey = addonKey.replace("addon-", ""); // remove prefix if present
              if (houseObj.addons[rawKey] !== undefined) {
                houseObj.addons[rawKey] = price;
              }
            }
          }

          // Format object back to JS string representation
          const updatedObjStr = formatJsObject(houseObj);
          
          // Replace in content
          content = content.replace(varRegex, `const ${varName} = ${updatedObjStr};\n\n`);
          
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✓ React file successfully updated.`);
        } else {
          console.log(`❌ Error: Could not parse HOUSE object from file.`);
        }
      } else {
        console.log(`❌ Error: Could not match HOUSE variable in file.`);
      }
    } else {
      console.log(`⚠️ Warning: React file ${filename} does not exist.`);
    }
  }

  console.log("\n========================================");
  console.log("MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("========================================");
}

run().catch(console.error);
