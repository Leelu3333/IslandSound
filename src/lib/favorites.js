// src/lib/favorites.js
// 收藏的兩種來源：
//   1. 會員（已登入）→ Supabase user_favorites 表（跨裝置持久化）
//   2. 訪客（未登入）→ localStorage（登入後會自動合併進帳號）
import { supabase } from './supabase.js';

const GUEST_KEY = 'island-sound:guest-favorites';

// ───────────────────────── 訪客收藏（localStorage）─────────────────────────

/** 讀取訪客收藏的 festival_id 陣列 */
export function getGuestFavorites() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setGuestFavorites(ids) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* localStorage 不可用（無痕 / 隱私模式）時略過 */
  }
}

/** 切換一筆訪客收藏，回傳切換後的完整清單 */
export function toggleGuestFavorite(festivalId) {
  const ids = getGuestFavorites();
  const next = ids.includes(festivalId)
    ? ids.filter((id) => id !== festivalId)
    : [...ids, festivalId];
  setGuestFavorites(next);
  return next;
}

function clearGuestFavorites() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    /* noop */
  }
}

// ───────────────────────── 會員收藏（Supabase）─────────────────────────

/** 撈出使用者收藏的 festival_id 陣列 */
export async function loadFavorites(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('user_favorites')
    .select('festival_id')
    .eq('user_id', userId);
  if (error) {
    console.error('[loadFavorites]', error);
    return [];
  }
  return (data ?? []).map((r) => r.festival_id);
}

/** 新增一筆收藏（重複時忽略，不報錯） */
export async function addFavorite(userId, festivalId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('user_favorites')
    .upsert(
      { user_id: userId, festival_id: festivalId },
      { onConflict: 'user_id,festival_id', ignoreDuplicates: true },
    );
  if (error) console.error('[addFavorite]', error);
}

/** 移除一筆收藏 */
export async function removeFavorite(userId, festivalId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('festival_id', festivalId);
  if (error) console.error('[removeFavorite]', error);
}

/**
 * 登入後把訪客（localStorage）收藏合併進帳號，並清空訪客收藏。
 * 回傳合併後的完整收藏清單。
 */
export async function mergeGuestFavorites(userId) {
  if (!supabase || !userId) return [];
  const guestIds = getGuestFavorites();
  if (guestIds.length) {
    const rows = guestIds.map((festival_id) => ({ user_id: userId, festival_id }));
    const { error } = await supabase
      .from('user_favorites')
      .upsert(rows, { onConflict: 'user_id,festival_id', ignoreDuplicates: true });
    if (error) console.error('[mergeGuestFavorites]', error);
    else clearGuestFavorites();
  }
  return loadFavorites(userId);
}
