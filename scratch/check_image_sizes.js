import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const authPath = path.join(os.homedir(), '.base44', 'auth', 'auth.json');
const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = authData.accessToken;

const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://base44.app',
  token: token,
  requiresAuth: false
});

async function getFileSize(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { 
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);
    const size = res.headers.get('content-length');
    // Cancel the body stream to avoid downloading the entire image content
    if (res.body && typeof res.body.cancel === 'function') {
      await res.body.cancel();
    }
    return size ? parseInt(size) : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("Auditing image file sizes for Ticab house using GET headers...");
  try {
    const domy = await base44.entities.Dom.list();
    const ticabDomy = domy.filter(d => d.vyrobca === 'Ticab house');
    console.log(`Total Ticab houses: ${ticabDomy.length}`);
    
    // Gather all image objects to fetch in parallel
    const allImagesToAudit = [];
    for (const d of ticabDomy) {
      const images = [
        { houseName: d.nazov, name: 'Main Image', url: d.hlavny_obrazok },
        { houseName: d.nazov, name: 'Base Config', url: d.zakladna_konfiguracia_obrazok }
      ].filter(item => item.url);
      allImagesToAudit.push(...images);
    }

    console.log(`Total images to check: ${allImagesToAudit.length}`);

    // Fetch in parallel batches
    const results = [];
    const batchSize = 10;
    for (let i = 0; i < allImagesToAudit.length; i += batchSize) {
      const batch = allImagesToAudit.slice(i, i + batchSize);
      console.log(`Checking batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allImagesToAudit.length/batchSize)}...`);
      const batchPromises = batch.map(async (img) => {
        const size = await getFileSize(img.url);
        results.push({
          ...img,
          sizeBytes: size,
          sizeMB: size ? parseFloat((size / (1024 * 1024)).toFixed(2)) : null
        });
      });
      await Promise.all(batchPromises);
    }

    console.log("\n--- IMAGE SIZE REPORT ---");
    // Group results by houseName
    const grouped = {};
    results.forEach(res => {
      if (!grouped[res.houseName]) grouped[res.houseName] = [];
      grouped[res.houseName].push(res);
    });

    let totalSize = 0;
    let countedImages = 0;
    let largeCount = 0;

    Object.keys(grouped).forEach(houseName => {
      console.log(`🏠 ${houseName}`);
      grouped[houseName].forEach(img => {
        if (img.sizeBytes !== null) {
          totalSize += img.sizeBytes;
          countedImages++;
          let warning = '';
          if (img.sizeMB > 1.0) {
            warning = ' ⚠️ LARGE (Over 1MB)';
            largeCount++;
          }
          if (img.sizeMB > 3.0) {
            warning = ' 🛑 CRITICALLY LARGE (Over 3MB)';
          }
          console.log(`  - ${img.name}: ${img.sizeMB} MB${warning}`);
          console.log(`    URL: ${img.url}`);
        } else {
          console.log(`  - ${img.name}: ERROR / UNKNOWN SIZE`);
          console.log(`    URL: ${img.url}`);
        }
      });
    });

    console.log("\n--- SUMMARY ---");
    console.log(`Total images checked successfully: ${countedImages}`);
    console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Average size: ${(totalSize / countedImages / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Images over 1MB: ${largeCount}`);
    
  } catch (e) {
    console.error("Error running audit:", e);
  }
}

run();
