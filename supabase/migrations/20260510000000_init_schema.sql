-- ============================================================
--  島嶼樂遊 / Island Sound  ── 初始化 schema
--  依據 src/data/festivals.js 的前端資料結構建立
-- ============================================================

-- ---------- 共用函式：自動更新 updated_at ----------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
--  regions：行政區（前端 REGIONS 常數）
-- ============================================================
create table if not exists public.regions (
  id          smallserial primary key,
  name_zh     text        not null unique,        -- 台北 / 高雄 ...
  name_en     text        not null,               -- Taipei / Kaohsiung ...
  sort_order  smallint    not null default 0      -- 北→南排序用
);

comment on table  public.regions          is '台灣行政區（音樂祭舉辦地）';
comment on column public.regions.sort_order is '前端列表排序（小→大 = 北→南）';


-- ============================================================
--  artists：藝人 / 樂團
-- ============================================================
create table if not exists public.artists (
  id          bigserial primary key,
  name        text        not null unique,        -- 落日飛車 / Tizzy Bac ...
  created_at  timestamptz not null default now()
);

comment on table public.artists is '出演藝人主檔（去重後）';


-- ============================================================
--  festivals：音樂祭主檔
--   id 沿用前端 slug（megaport / spring-scream …）方便對齊
-- ============================================================
create table if not exists public.festivals (
  id          text         primary key,           -- slug
  name        text         not null,              -- 中文名
  name_en     text         not null,              -- 英文名
  region_id   smallint     not null references public.regions(id) on update cascade on delete restrict,
  venue       text         not null,              -- 駁二藝術特區 / 福隆海水浴場 ...
  date_start  date         not null,
  date_end    date         not null,
  month       smallint     not null check (month between 1 and 12),
  blurb       text,                               -- 短描述
  coord_x     numeric(5,3) not null check (coord_x between 0 and 1),
  coord_y     numeric(5,3) not null check (coord_y between 0 and 1),
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now(),

  constraint festivals_date_chk check (date_end >= date_start)
);

comment on table  public.festivals          is '音樂祭主檔（一場一列）';
comment on column public.festivals.coord_x  is '地圖 pin x 座標（0~1，前端 TaiwanMap 用）';
comment on column public.festivals.coord_y  is '地圖 pin y 座標（0~1，前端 TaiwanMap 用）';
comment on column public.festivals.month    is '主要月份（衍生自 date_start，但保留以利篩選/索引）';

drop trigger if exists trg_festivals_updated_at on public.festivals;
create trigger trg_festivals_updated_at
  before update on public.festivals
  for each row execute function public.tg_set_updated_at();


-- ============================================================
--  festival_artists：音樂祭 ↔ 藝人  多對多
-- ============================================================
create table if not exists public.festival_artists (
  festival_id text     not null references public.festivals(id) on delete cascade on update cascade,
  artist_id   bigint   not null references public.artists(id)   on delete restrict on update cascade,
  position    smallint not null default 0,        -- lineup 顯示順序
  primary key (festival_id, artist_id)
);

comment on table  public.festival_artists           is '音樂祭出演陣容（含順序）';
comment on column public.festival_artists.position  is '前端 LINEUP 的顯示順序（0 起算）';


-- ============================================================
--  索引
-- ============================================================
create index if not exists idx_festivals_month       on public.festivals (month);
create index if not exists idx_festivals_region      on public.festivals (region_id);
create index if not exists idx_festivals_date_start  on public.festivals (date_start);
create index if not exists idx_fa_artist             on public.festival_artists (artist_id);


-- ============================================================
--  Row Level Security
--   ── 內容是公開資訊：開放 anon / authenticated 讀取
--   ── 寫入請走 service_role 或日後加上 admin 角色
-- ============================================================
alter table public.regions          enable row level security;
alter table public.artists          enable row level security;
alter table public.festivals        enable row level security;
alter table public.festival_artists enable row level security;

-- 公開讀取
drop policy if exists "public read" on public.regions;
create policy "public read" on public.regions
  for select using (true);

drop policy if exists "public read" on public.artists;
create policy "public read" on public.artists
  for select using (true);

drop policy if exists "public read" on public.festivals;
create policy "public read" on public.festivals
  for select using (true);

drop policy if exists "public read" on public.festival_artists;
create policy "public read" on public.festival_artists
  for select using (true);


-- ============================================================
--  方便前端使用的檢視（一次撈出完整音樂祭資料 + 藝人陣容）
--  security_invoker=true → view 以呼叫者身分執行，正確套用 RLS
-- ============================================================
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
  ) as artists
from public.festivals f
join public.regions r on r.id = f.region_id;

comment on view public.v_festivals_full is
  '音樂祭完整資料（含 region 名、artists 陣列）— 前端可直接 select * 對應 FESTIVALS 結構';


-- ============================================================
--  Grants：明確授權 Supabase 的 anon / authenticated 角色
--   ── 即使非透過 Supabase CLI 套用，也能正常運作
-- ============================================================
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema public to anon, authenticated;
    grant select on public.regions, public.artists,
                    public.festivals, public.festival_artists,
                    public.v_festivals_full
      to anon, authenticated;
  end if;
end $$;
