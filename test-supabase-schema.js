const supabaseUrl = process.env.VITE_BASE44_URL || 'https://xczzdfxpxpsnbltwhkgy.supabase.co';
const supabaseKey = process.env.VITE_BASE44_ANON_KEY;

async function run() {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Key length:", supabaseKey ? supabaseKey.length : 0);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const schema = await res.json();
    console.log("Paths:");
    console.log(Object.keys(schema.paths));
  } catch(e) {
    console.error("Error fetching schema:", e);
  }
}
run();
