// src/lib/auth.js
// 會員登入相關：Google OAuth、Magic Link、登出、session 監聽。
// Supabase 未設定（無 env）時，所有函式安全地降級為 no-op / null。
import { supabase } from './supabase.js';

/** 取得目前 session（未登入或未設定 Supabase 時為 null） */
export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/**
 * 監聽登入狀態變化（登入 / 登出 / token 更新都會觸發）。
 * @param {(session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {() => void} 取消監聽的函式
 */
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ?? null);
  });
  return () => data.subscription.unsubscribe();
}

/** Google 第三方登入（OAuth）。會跳轉到 Google，完成後導回本站。 */
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase 未設定，無法登入');
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

/**
 * Magic Link：寄送免密碼登入連結到信箱。首次登入會自動建立帳號。
 * @param {string} email
 * @param {string} [name] 選填：註冊時帶入的稱呼，會寫入 user_metadata.name
 */
export async function signInWithMagicLink(email, name) {
  if (!supabase) throw new Error('Supabase 未設定，無法登入');
  const options = {
    emailRedirectTo: window.location.origin,
    shouldCreateUser: true,
  };
  if (name) options.data = { name };
  return supabase.auth.signInWithOtp({ email, options });
}

/** 登出 */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** 從 user 物件取出顯示名稱（優先 metadata.name，其次 email） */
export function displayNameOf(user) {
  if (!user) return '';
  return (
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    '會員'
  );
}
