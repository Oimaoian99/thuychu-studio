import { createClient } from '@supabase/supabase-js';

// Dùng ngoặc vuông để tránh Next.js đóng băng biến môi trường lúc Build
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
