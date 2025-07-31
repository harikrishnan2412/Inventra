// Backend/config/supabaseClient.js

const { createClient } = require('@supabase/supabase-js');

// This code reads the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// It's a good practice to check if the variables were loaded correctly
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Service Role Key is missing from .env file");
}

// Create and export the single Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;