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

async function run() {
  console.log("Fetching Ticab house Dom entities...");
  try {
    const domy = await base44.entities.Dom.list();
    const ticabDomy = domy.filter(d => d.vyrobca === 'Ticab house');
    console.log(`Total Ticab houses found: ${ticabDomy.length}\n`);
    
    for (const d of ticabDomy) {
      console.log(`🏠 Name: ${d.nazov} (ID: ${d.id}, Slug: ${d.slug})`);
      console.log(`  - Main Image: ${d.hlavny_obrazok || 'None'}`);
      console.log(`  - 2D Plan: ${d.podorys_2d || 'None'}`);
      console.log(`  - 3D Plan: ${d.podorys_3d || 'None'}`);
      console.log(`  - Base Config Image: ${d.zakladna_konfiguracia_obrazok || 'None'}`);
      if (d.galeria && d.galeria.length > 0) {
        console.log(`  - Gallery (${d.galeria.length} items):`);
        d.galeria.slice(0, 5).forEach((img, i) => {
          console.log(`    [${i}]: ${img}`);
        });
        if (d.galeria.length > 5) {
          console.log(`    ... and ${d.galeria.length - 5} more`);
        }
      } else {
        console.log(`  - Gallery: None`);
      }
      
      // Let's analyze the image domains
      const allImages = [
        { name: 'main_image', url: d.hlavny_obrazok },
        { name: 'podorys_2d', url: d.podorys_2d },
        { name: 'podorys_3d', url: d.podorys_3d },
        { name: 'base_config_image', url: d.zakladna_konfiguracia_obrazok },
        ...(d.galeria || []).map((url, i) => ({ name: `gallery_${i}`, url }))
      ].filter(item => item.url);

      const externalImages = allImages.filter(item => {
        const url = item.url;
        return !url.includes('base44.app/api/apps') && !url.includes('supabase.co/storage');
      });

      if (externalImages.length > 0) {
        console.log(`  ⚠️ UNOPTIMIZED EXTERNAL IMAGES FOUND (${externalImages.length}):`);
        externalImages.forEach(item => {
          console.log(`    * ${item.name}: ${item.url}`);
        });
      } else {
        console.log(`  ✅ All images are hosted on Base44/Supabase and optimized.`);
      }
      console.log('--------------------------------------------------\n');
    }
  } catch(e) {
    console.error("Error fetching houses:", e);
  }
}
run();
