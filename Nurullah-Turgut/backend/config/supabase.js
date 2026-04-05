const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ SUPABASE_URL ve SUPABASE_ANON_KEY çevresel değişkenleri eksik! ' +
    'Vercel Dashboard > Settings > Environment Variables bölümünden ekleyin.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
