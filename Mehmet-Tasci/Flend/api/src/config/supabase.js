const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.error("Supabase Client Init Error:", err.message);
  supabase = {
    from: () => { throw new Error("Supabase is not initialized: " + err.message); }
  };
}

module.exports = supabase;

