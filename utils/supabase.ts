import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const userEmail = process.env.EXPO_PUBLIC_SUPABASE_TEST_USER_EMAIL;
const userPassword = process.env.EXPO_PUBLIC_SUPABASE_TEST_USER_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

if(!userEmail || !userPassword) {
  throw new Error('Missing user credentials in env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function fetchDailySummary(userId: string, date: string) {
  console.log("in fetch ", userId, date)
  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116: No rows found
    throw error;
  }
  return data;
}

export async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail as string,
    password: userPassword as string,
  });

  if (error) {
    console.error('Login error:', error);
    return;
  }

  const userId = data.user.id;
  return userId;
}
