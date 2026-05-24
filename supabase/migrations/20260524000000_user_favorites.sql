-- ============================================================
--  島嶼樂遊 / Island Sound  ── 使用者收藏 user_favorites
--  目的：會員登入後，按下的收藏會存進帳號，
--        換裝置、重整頁面後仍保留（取代純前端 state）。
--  依賴：auth.users（Supabase Auth 內建）、public.festivals
--  特性：所有政策皆 idempotent（drop if exists 後重建），可重複執行
-- ============================================================

create table if not exists public.user_favorites (
  user_id     uuid        not null references auth.users(id)      on delete cascade,
  festival_id text        not null references public.festivals(id) on delete cascade on update cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, festival_id)
);

comment on table  public.user_favorites             is '使用者收藏的音樂祭（一位使用者一場一列）';
comment on column public.user_favorites.user_id     is '對應 auth.users.id；刪除帳號時連帶刪除收藏';
comment on column public.user_favorites.festival_id is '對應 public.festivals.id（slug）';

create index if not exists idx_user_favorites_user on public.user_favorites (user_id);


-- ============================================================
--  Row Level Security：每位使用者只能讀寫「自己的」收藏
--  ── 沒有開 RLS 等於資料全公開，這裡是安全關鍵
-- ============================================================
alter table public.user_favorites enable row level security;

-- 只能讀自己的收藏
drop policy if exists "own favorites - select" on public.user_favorites;
create policy "own favorites - select" on public.user_favorites
  for select using (auth.uid() = user_id);

-- 只能新增「user_id = 自己」的收藏
drop policy if exists "own favorites - insert" on public.user_favorites;
create policy "own favorites - insert" on public.user_favorites
  for insert with check (auth.uid() = user_id);

-- 只能刪自己的收藏
drop policy if exists "own favorites - delete" on public.user_favorites;
create policy "own favorites - delete" on public.user_favorites
  for delete using (auth.uid() = user_id);


-- ============================================================
--  Grants：明確授權 authenticated 角色
--  （anon 未登入者完全無權存取此表）
-- ============================================================
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema public to authenticated;
    grant select, insert, delete on public.user_favorites to authenticated;
  end if;
end $$;
