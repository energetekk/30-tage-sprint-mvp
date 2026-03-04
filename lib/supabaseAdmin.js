import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cjpnxoiumqadnrepdafh.supabase.co'
const serviceRoleKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcG54b2l1bXFhZG5yZXBkYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTkzMDgsImV4cCI6MjA4NzkzNTMwOH0.Z_zriyc72uypzmp-BNHIid9e5nnfTXrV7YY9izfTEI4

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables!')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
