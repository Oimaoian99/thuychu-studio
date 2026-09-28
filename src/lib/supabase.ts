import { createClient } from '@supabase/supabase-js';

export const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://dummy.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'dummy_key';
  return createClient(supabaseUrl, supabaseAnonKey);
};
