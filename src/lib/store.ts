import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!supabase) supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export function isCloudStorage(): boolean {
  return getClient() !== null;
}

export async function storeSet(key: string, value: string): Promise<boolean> {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { error } = await client
    .from('app_data')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  return true;
}

export async function storeGet(key: string): Promise<string | null> {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await client.from('app_data').select('value').eq('key', key).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.value as string | undefined) ?? null;
}

export async function storeList(prefix: string): Promise<string[]> {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await client.from('app_data').select('key, value').like('key', `${prefix}%`);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.value as string);
}

export async function storeClear(prefix: string): Promise<void> {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { error } = await client.from('app_data').delete().like('key', `${prefix}%`);
  if (error) throw new Error(error.message);
}

export function slug(name: string): string {
  return `sub:${name.trim().replace(/[\s/\\'"]+/g, '_')}`;
}
