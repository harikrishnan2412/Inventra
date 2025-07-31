// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfuexyjluceftcxcfawk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWV4eWpsdWNlZnRjeGNmYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDM5MjAsImV4cCI6MjA2OTUxOTkyMH0.3uKyA_y10IN70_nHfz5wyUjv-hkITxW0HdY4vztV-0M'

export const supabase = createClient(supabaseUrl, supabaseKey)
