import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijephdaxiygduwxtfqeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_GtqmrasF0fr3InwSqbndYA_Gyn036S9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
