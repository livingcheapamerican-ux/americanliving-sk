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
    if (res.body && typeof res.body.cancel === 'function') {
      await res.body.cancel();
    }
    return size ? parseInt(size) : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log("Auditing ALL images (including galleries) for Ticab house...");
  try {
    const domy = await base44.entities.Dom.list();
    const ticabDomy = domy.filter(d => d.vyrobca === 'Ticab house');
    
    const allImagesToAudit = [];
    for (const d of ticabDomy) {
      if (d.hlavny_obrazok) {
        allImagesToAudit.push({ houseName: d.nazov, name: 'Main Image', url: d.hlavny_obrazok });
      }
      if (d.zakladna_konfiguracia_obrazok) {
        allImagesToAudit.push({ houseName: d.nazov, name: 'Base Config', url: d.zakladna_konfiguracia_obrazok });
      }
      if (d.podorys_2d) {
        allImagesToAudit.push({ houseName: d.nazov, name: '2D Plan', url: d.podorys_2d });
      }
      if (d.podorys_3d) {
        allImagesToAudit.push({ houseName: d.nazov, name: '3D Plan', url: d.podorys_3d });
      }
      if (d.galeria && Array.isArray(d.galeria)) {
        d.galeria.forEach((url, i) => {
          allImagesToAudit.push({ houseName: d.nazov, name: `Gallery [${i}]`, url });
        });
      }
    }

    console.log(`Total images to check: ${allImagesToAudit.length}`);

    // Fetch in parallel batches
    const results = [];
    const batchSize = 15;
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

    console.log("\n--- LARGE IMAGES REPORT (>= 1MB) ---");
    let totalSize = 0;
    let countedImages = 0;
    let largeCount = 0;
    let criticalCount = 0;

    results.forEach(img => {
      if (img.sizeBytes !== null) {
        totalSize += img.sizeBytes;
        countedImages++;
        if (img.sizeMB >= 1.0) {
          largeCount++;
          let level = '⚠️ LARGE';
          if (img.sizeMB >= 3.0) {
            level = '🛑 CRITICAL';
            criticalCount++;
          }
          console.log(`🏠 ${img.houseName} -> ${img.name}: ${img.sizeMB} MB [${level}]`);
          console.log(`   URL: ${img.url}`);
        }
      }
    });

    console.log("\n--- SUMMARY ---");
    console.log(`Total images checked successfully: ${countedImages}/${allImagesToAudit.length}`);
    console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Average size: ${(totalSize / countedImages / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Images over 1MB: ${largeCount}`);
    console.log(`Images over 3MB: ${criticalCount}`);
    
  } catch (e) {
    console.error("Error running audit:", e);
  }
}

run();
