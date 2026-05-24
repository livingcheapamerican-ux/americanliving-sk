import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Read token
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

// Helper to parse JS-like object to JSON
function parseJsObject(jsString) {
  try {
    // Basic cleaning to make it closer to JSON
    // Replace unquoted keys
    let clean = jsString
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Quote keys
      .replace(/'/g, '"') // Single quotes to double
      .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
    
    // Remove functions if any (shouldn't be inside HOUSE configuration)
    return JSON.parse(clean);
  } catch (e) {
    // Fallback: evaluate via eval safely-ish or return null
    try {
      const fn = new Function(`return ${jsString}`);
      return fn();
    } catch (err) {
      console.error("Failed to parse JS object string:", err);
      return null;
    }
  }
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

  const report = {};

  for (let i = 1; i <= 9; i++) {
    const code = `PH-00${i}`;
    const codeLower = `ph00${i}`;
    const filename = `KonfiguratorPH00${i}.jsx`;
    const filePath = path.join(pagesDir, filename);

    // Find database entity
    const dbDom = prostoDomy.find(d => 
      d.prosto_house_kod === code || 
      (d.nazov && d.nazov.includes(code)) || 
      (i === 7 && d.nazov?.includes("A-Frame")) ||
      (i === 8 && d.nazov?.includes("Barn 48")) ||
      (i === 9 && d.nazov?.includes("Flat Small"))
    );

    let codeConfig = null;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      let match = content.match(/const HOUSE(?:_PH008)? = ([\s\S]+?);\n\n(?:export default|\/\/)/);
      if (!match) {
        match = content.match(/const HOUSE(?:_PH008)? = ([\s\S]+?);\n\n/);
      }
      if (match) {
        codeConfig = parseJsObject(match[1].trim());
      }
    }

    report[code] = {
      nazov: dbDom ? dbDom.nazov : (codeConfig ? codeConfig.name : `Model ${code}`),
      dbId: dbDom ? dbDom.id : null,
      basePriceDB: dbDom ? dbDom.zakladna_cena : null,
      basePriceCode: codeConfig ? codeConfig.basePrice : null,
      dbCustomCeny: dbDom ? dbDom.konfigurator_custom_ceny_prosto_house : {},
      codeConfig: codeConfig
    };
  }

  // Generate markdown output
  let md = `# Cenník položiek konfigurátora Prosto House\n\n`;
  md += `Tento report porovnáva ceny definované v zdrojovom kóde (React komponenty) s cenami v databáze (Base44 DB overrides). Ak je v databáze zadaná iná cena ako v kóde, má prednosť databáza.\n\n`;

  for (const [code, data] of Object.entries(report)) {
    md += `## ${data.nazov} (${code})\n`;
    md += `- **ID v databáze:** \`${data.dbId || 'Nenájdené'}\`\n`;
    md += `- **Základná cena (Kód):** ${data.basePriceCode?.toLocaleString('sk-SK') || 'N/A'} €\n`;
    md += `- **Základná cena (Databáza):** ${data.basePriceDB?.toLocaleString('sk-SK') || 'N/A'} €\n`;
    
    const dbCustom = data.dbCustomCeny || {};
    const codeConf = data.codeConfig;
    const dbOverrides = dbCustom[code.toLowerCase().replace('-', '')] || {};

    md += `\n### Hrubá stavba & Možnosti (Options)\n`;
    md += `| Položka / Voľba | Cena v kóde | Cena v DB (override) | Efektívna cena | Poznámka |\n`;
    md += `| :--- | :---: | :---: | :---: | :--- |\n`;

    // 1. Montaz
    if (codeConf?.options?.mounting) {
      codeConf.options.mounting.forEach((opt, idx) => {
        if (idx === 0) return; // skip "bez montaze" usually 0
        const key = `mounting-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key] !== undefined ? dbOverrides[key] : (dbCustom.montaz !== undefined ? dbCustom.montaz : undefined);
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Montáž: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 2. Extension
    if (codeConf?.options?.extension && codeConf.options.extension.length > 0) {
      codeConf.options.extension.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `extension-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Predĺženie: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 3. Insulation
    if (codeConf?.options?.insulation) {
      codeConf.options.insulation.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `insulation-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Izolácia: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 4. Foundation
    if (codeConf?.options?.foundation) {
      codeConf.options.foundation.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `foundation-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Základy: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 5. Interior
    if (codeConf?.options?.interior) {
      codeConf.options.interior.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `interior-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Interiér: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 6. Doors
    if (codeConf?.options?.doors) {
      codeConf.options.doors.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `doors-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Dvere exteriérové: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    // 7. Facade
    if (codeConf?.options?.facade) {
      codeConf.options.facade.forEach((opt, idx) => {
        if (idx === 0) return;
        const key = `facade-${idx}`;
        const codePrice = opt.price;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| Fasáda: ${opt.label} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      });
    }

    md += `\n### Doplnky & Služby (Addons)\n`;
    md += `| Doplnok / Služba | Cena v kóde | Cena v DB (override) | Efektívna cena | Poznámka |\n`;
    md += `| :--- | :---: | :---: | :---: | :--- |\n`;

    if (codeConf?.addons) {
      for (const [addonKey, codePrice] of Object.entries(codeConf.addons)) {
        const key = `addon-${addonKey}`;
        const dbPrice = dbOverrides[key];
        const effPrice = dbPrice !== undefined ? dbPrice : codePrice;
        const isOverride = dbPrice !== undefined && dbPrice !== codePrice;
        md += `| ${addonKey} | ${codePrice.toLocaleString('sk-SK')} € | ${dbPrice !== undefined ? dbPrice.toLocaleString('sk-SK') + ' €' : '-'} | **${effPrice.toLocaleString('sk-SK')} €** | ${isOverride ? '⚠️ Override' : 'Predvolené'} |\n`;
      }
    }

    md += `\n---\n\n`;
  }

  fs.writeFileSync('/Users/richardkovac/Documents/american_living_web/american-living-sk/scratch/cennik_report_draft.md', md, 'utf8');
  console.log("Report generated in scratch/cennik_report_draft.md");
}

run().catch(console.error);
