import { createClient } from '@base44/sdk';

// We can instantiate the client directly using the credentials
const base44 = createClient({
  appId: '6916d89a485af231beb54c71',
  serverUrl: 'https://xczzdfxpxpsnbltwhkgy.supabase.co',
  token: null, // No token needed since requiresAuth is false for public list or we run in a context where we might not need it.
  requiresAuth: false
});

async function run() {
  console.log("Fetching houses from DB using custom SDK client...");
  try {
    const domy = await base44.entities.Dom.list();
    console.log(`Successfully fetched ${domy.length} houses.`);
    domy.forEach(d => {
      console.log(`- [${d.vyrobca}] ${d.nazov} (Cena: ${d.zakladna_cena}€, Verejný: ${d.verejny}, Kód: ${d.prosto_house_kod})`);
      if (d.vyrobca === 'Prosto House' || d.prosto_house_kod) {
        console.log(`  Prosto Ceny keys:`, Object.keys(d.konfigurator_custom_ceny_prosto_house || {}));
      }
    });
  } catch(e) {
    console.error("Failed to fetch houses:", e);
  }
}

run();
