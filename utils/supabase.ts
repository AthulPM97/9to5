import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const userEmail = process.env.EXPO_PUBLIC_SUPABASE_TEST_USER_EMAIL;
const userPassword = process.env.EXPO_PUBLIC_SUPABASE_TEST_USER_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

if (!userEmail || !userPassword) {
  throw new Error('Missing user credentials in env');
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

export async function setDailyTarget(userId: string, date: string, targetMinutes: number) {
  const { data, error } = await supabase
    .from('daily_summary')
    .upsert([{ user_id: userId, date, target_minutes: targetMinutes }], {
      onConflict: 'user_id,date',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createSession(userId: string, startTime: string, section: string) {
  const { data, error } = await supabase
    .from('session')
    .insert([{ user_id: userId, start_time: startTime, section }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function endSession(
  sessionId: string,
  endTime: string,
  durationMinutes: number,
  note: string
) {
  const { data, error } = await supabase
    .from('session')
    .update({ end_time: endTime, duration_minutes: durationMinutes, notes: note })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDailySummary(userId: string, date: string, sessionMinutes: number) {
  // Increment completed_minutes and session_count atomically
  const { data, error } = await supabase.rpc('increment_daily_summary', {
    uid: userId,
    d: date,
    mins: sessionMinutes,
  });
  if (error) throw error;
  return data;
}
