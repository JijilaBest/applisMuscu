import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrtjjhdndamqmzjubhmo.supabase.co';
const supabaseAnonKey = 'sb_publishable_HZ2FXgALFQVkmUpfMzyW-Q_obehhGN3'; // Note: This key looks short, verify if it's the right one.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
