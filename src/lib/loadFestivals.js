// src/lib/loadFestivals.js
import { supabase } from './supabase.js';
import { FESTIVALS } from '../data/festivals.js';

// 把 DB 的 snake_case 欄位轉成前端用的 camelCase
function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    region: row.region,
    regionEn: row.region_en,
    venue: row.venue,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    month: row.month,
    blurb: row.blurb,
    artists: row.artists ?? [],
    coord: row.coord ?? { x: 0, y: 0 },
    saved: false, // 之後接 localStorage
  };
}

/**
 * 嘗試從 Supabase 撈，失敗則回傳 null（讓呼叫端 fallback）
 */
export async function loadFestivals() {
  if (!supabase) {
    console.warn('[loadFestivals] Supabase 未設定，使用本機 FESTIVALS');
    return null;
  }

  const { data, error } = await supabase
    .from('v_festivals_full')
    .select('*')
    .order('date_start');

  if (error) {
    console.error('[loadFestivals] Supabase error:', error);
    return null; // 回 null → App.jsx 會繼續用本機資料
  }
  if (!data || data.length === 0) {
    console.warn('[loadFestivals] Supabase 回傳空陣列，fallback 本機資料');
    return null;
  }

  return data.map(mapRow);
}

// 同步把本機資料當 fallback 暴露出去（給 App.jsx 當初始 state 用）
export { FESTIVALS as FALLBACK_FESTIVALS };
