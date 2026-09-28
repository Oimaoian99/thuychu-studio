import { createClient } from '@supabase/supabase-js';

// Cung cấp giá trị mặc định lúc Build để vượt qua lỗi của Cloudflare (Lúc chạy thật nó sẽ lấy biến môi trường)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
