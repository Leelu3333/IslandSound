-- ============================================================
--  島嶼樂遊 / Island Sound  ── 主視覺圖片（KV）
--  1. festivals 加 kv_image_url 欄位
--  2. 建立公開 Storage bucket: festival-kv
--  3. 重建 v_festivals_full（多帶 kv_image_url 給前端）
--
--  ※ idempotent：可重複執行
--  ※ 圖片上傳與 kv_image_url 回填由 scripts/sync-kv-images.mjs 處理
-- ============================================================


-- ---------- 1. 欄位 ----------
alter table public.festivals
  add column if not exists kv_image_url text;

comment on column public.festivals.kv_image_url is
  '主視覺（KV）圖片公開網址，指向 Storage bucket festival-kv；由 sync-kv-images 腳本回填，無圖則 null';


-- ---------- 2. Storage bucket（公開讀取） ----------
-- 內容是公開資訊，bucket 設為 public，前端可直接用 public URL。
insert into storage.buckets (id, name, public)
values ('festival-kv', 'festival-kv', true)
on conflict (id) do update
  set public = excluded.public;

-- 明確開放此 bucket 的公開讀取（寫入仍只走 service_role，會繞過 RLS）
drop policy if exists "festival-kv public read" on storage.objects;
create policy "festival-kv public read" on storage.objects
  for select
  using (bucket_id = 'festival-kv');


-- ---------- 3. 重建 view（追加 kv_image_url 於最後一欄） ----------
create or replace view public.v_festivals_full
  with (security_invoker = true) as
select
  f.id,
  f.name,
  f.name_en,
  r.name_zh   as region,
  r.name_en   as region_en,
  f.venue,
  f.date_start,
  f.date_end,
  f.month,
  f.blurb,
  jsonb_build_object('x', f.coord_x, 'y', f.coord_y) as coord,
  coalesce(
    (
      select array_agg(a.name order by fa.position)
      from public.festival_artists fa
      join public.artists a on a.id = fa.artist_id
      where fa.festival_id = f.id
    ),
    array[]::text[]
  ) as artists,
  f.kv_image_url
from public.festivals f
join public.regions r on r.id = f.region_id;

comment on view public.v_festivals_full is
  '音樂祭完整資料（含 region 名、artists 陣列、kv_image_url）— 前端可直接 select *';
