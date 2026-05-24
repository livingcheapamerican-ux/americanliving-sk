import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_BASE44_URL || 'https://xczzdfxpxpsnbltwhkgy.supabase.co';
const supabaseKey = process.env.VITE_BASE44_ANON_KEY;

if (!supabaseKey) {
  console.log("No supabase key found in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('AppConfiguration').select('*').eq('config_key', 'ai_system_prompt');
  console.log("DATA:", JSON.stringify(data, null, 2));
  console.log("ERROR:", error);
}

check();
