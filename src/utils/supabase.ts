import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ptznrtwituumppuxsrno.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K472z0xikGFAY4sgVRZyIw_6a_BKI79';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
