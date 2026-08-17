import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qhqqlyvgtmekngnrtbel.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rzUUuLcv-HW8jiDVeqV52w_BfxAXaLg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

let localWriteAt = 0;
let reloadTimer = null;

function legacyKeys() {
  const PFX = 'meton::';
  const rows = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PFX) && k !== `${PFX}cloud-migrated`) {
        rows.push({ key: k.slice(PFX.length), value: localStorage.getItem(k) ?? '' });
      }
    }
  } catch (error) {
    console.warn('Armazenamento local indisponível; seguindo apenas com nuvem.', error);
  }
  return rows;
}

async function migrateLegacyData(userId) {
  try {
    if (localStorage.getItem('meton::cloud-migrated') === userId) return;
  } catch (_) {}
  const rows = legacyKeys();
  if (rows.length) {
    const payload = rows.map((r) => ({ user_id: userId, key: r.key, value: r.value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('meton_kv').upsert(payload, { onConflict: 'user_id,key', ignoreDuplicates: true });
    if (error) throw error;
  }
  try { localStorage.setItem('meton::cloud-migrated', userId); } catch (_) {}
}

export async function initCloudStorage(userId) {
  await migrateLegacyData(userId);

  window.storage = {
    async get(key) {
      const { data, error } = await supabase.from('meton_kv').select('key,value').eq('user_id', userId).eq('key', key).maybeSingle();
      if (error) throw error;
      return data ? { key: data.key, value: data.value } : null;
    },
    async set(key, value) {
      localWriteAt = Date.now();
      const { error } = await supabase.from('meton_kv').upsert({ user_id: userId, key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' });
      if (error) throw error;
      return { key, value: String(value) };
    },
    async delete(key) {
      localWriteAt = Date.now();
      const { error } = await supabase.from('meton_kv').delete().eq('user_id', userId).eq('key', key);
      if (error) throw error;
      return { key, deleted: true };
    },
    async list(prefix = '') {
      const { data, error } = await supabase.from('meton_kv').select('key').eq('user_id', userId).like('key', `${prefix}%`).order('key');
      if (error) throw error;
      return { keys: (data || []).map((r) => r.key), prefix };
    },
  };

  const channel = supabase
    .channel(`meton-sync-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meton_kv', filter: `user_id=eq.${userId}` }, () => {
      if (Date.now() - localWriteAt < 1800) return;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => window.location.reload(), 700);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
