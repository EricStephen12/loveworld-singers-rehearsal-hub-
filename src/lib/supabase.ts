import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tables
export const TABLES = {
  PRAISE_NIGHTS: 'praise_nights',
  SONGS: 'songs',
  REMARKS: 'remarks',
  AUDIO_LINKS: 'audio_links',
  AUDIO_PHASES: 'audio_phases',
} as const;
