-- ============================================================
--  島嶼樂遊 / Island Sound  ── 2026 新增 4 場（審核後）
--  來源：2026_台灣音樂祭_已審核4筆.xlsx
--  特性：idempotent（ON CONFLICT），可重複執行
--  說明：
--    1. regions 不再新增（新竹/桃園/花蓮/台北 皆已存在於初始 seed）。
--    2. month 取自 date_start 月份。
--    3. coord_x/coord_y 依城市估算（新竹/花蓮為估算座標）。
--    4. 演出陣容以 CTE 為單一來源，同時推導 artists 與 festival_artists。
--    5. 圖片已手動上傳到 Storage bucket「festival-kv」，本檔最後直接
--       回填 kv_image_url（沿用原副檔名，毋須再跑 sync-kv-images 腳本）。
--  執行：整檔貼到 Supabase SQL Editor 執行即可（idempotent，可重複跑）。
-- ============================================================


-- ─────────────────────────── festivals ───────────────────────────
insert into public.festivals
  (id, name, name_en, region_id, venue, date_start, date_end, month, blurb, coord_x, coord_y)
values
  ('jiucheng-party',
   '舊城派對', 'Old Town Party 2026',
   (select id from public.regions where name_zh = '新竹'),
   '新竹市影像博物館、東門市場、新州屋', '2026-04-18', '2026-04-19', 4,
   '音樂人黃子軒策畫，2020 年創辦，串連新竹影像博物館、東門市場與新州屋三大文化地標，結合跨界演出與選物市集活化舊城。',
   0.460, 0.220),

  ('shang-an',
   '上岸音樂節', 'Ashore Music Festival 2026',
   (select id from public.regions where name_zh = '桃園'),
   '國立中央大學', '2026-05-16', '2026-05-17', 5,
   '國立中央大學主辦的校園音樂祭，曲風多元，涵蓋獨立搖滾、流行、饒舌與後搖。',
   0.580, 0.130),

  ('huichao',
   '洄潮計畫', 'Palirroia Fest 2026',
   (select id from public.regions where name_zh = '花蓮'),
   '國立東華大學圖書館前草地', '2026-05-22', '2026-05-24', 5,
   '東華大學學生獨立籌備的音樂祭，從演出到市集皆自主策畫，主打「由下而上」的文化行動，於圖書館前草地舉行。',
   0.720, 0.480),

  ('id-fest',
   'ID.音樂節', 'ID. Music Festival 2026',
   (select id from public.regions where name_zh = '台北'),
   '華山大草原、Legacy Taipei', '2026-06-06', '2026-06-06', 6,
   '由徐佳瑩、高爾宣、理想混蛋等擔任「ME TIME 音樂守護者」，14 組金獎唱將齊聚華山大草原與 Legacy Taipei 的一日音樂節。',
   0.760, 0.050)
on conflict (id) do update
  set name       = excluded.name,
      name_en    = excluded.name_en,
      region_id  = excluded.region_id,
      venue      = excluded.venue,
      date_start = excluded.date_start,
      date_end   = excluded.date_end,
      month      = excluded.month,
      blurb      = excluded.blurb,
      coord_x    = excluded.coord_x,
      coord_y    = excluded.coord_y;


-- ─────────────────────────── lineup ───────────────────────────
-- 推導 artists（去重）
with lineup (festival_id, artist_name, position) as (
  values
  -- 舊城派對 (jiucheng-party)
  ('jiucheng-party', '呂士軒', 0),
  ('jiucheng-party', 'FunkyMo', 1),
  ('jiucheng-party', '生祥樂隊', 2),
  ('jiucheng-party', '黃子軒與山平快', 3),
  ('jiucheng-party', '新竹北埔八音團', 4),
  ('jiucheng-party', '戴曉君 Sauljaljui', 5),
  ('jiucheng-party', '粹垢 TRAEGO', 6),
  ('jiucheng-party', 'LAWA', 7),
  ('jiucheng-party', 'Rizal Hadi [ID]', 8),

  -- 上岸音樂節 (shang-an)
  ('shang-an', '椅子樂團', 0),
  ('shang-an', '怕胖團', 1),

  -- 洄潮計畫 (huichao)
  ('huichao', '董事長樂團', 0),
  ('huichao', '拍謝少年', 1),
  ('huichao', 'hue', 2),
  ('huichao', '倒車入庫', 3),
  ('huichao', '莫宰羊', 4),
  ('huichao', '擊沈女孩 DESTROYERS', 5),
  ('huichao', '腦體馬戲團', 6),
  ('huichao', '薄暮 EVENFALL', 7),

  -- ID.音樂節 (id-fest)
  ('id-fest', '徐佳瑩', 0),
  ('id-fest', '高爾宣 OSN', 1),
  ('id-fest', '鳳小岳', 2),
  ('id-fest', '理想混蛋 Bestards', 3),
  ('id-fest', '魏如昀', 4),
  ('id-fest', '公館青少年 GGteens', 5),
  ('id-fest', '吳汶芳', 6),
  ('id-fest', 'babyMINT', 7),
  ('id-fest', '艾蜜莉 AMILI', 8),
  ('id-fest', '林潔心', 9)
)
insert into public.artists (name)
select distinct artist_name
from lineup
on conflict (name) do nothing;

-- 推導 festival_artists（用名稱 join 取得 artist id，重跑也安全）
with lineup (festival_id, artist_name, position) as (
  values
  ('jiucheng-party', '呂士軒', 0),
  ('jiucheng-party', 'FunkyMo', 1),
  ('jiucheng-party', '生祥樂隊', 2),
  ('jiucheng-party', '黃子軒與山平快', 3),
  ('jiucheng-party', '新竹北埔八音團', 4),
  ('jiucheng-party', '戴曉君 Sauljaljui', 5),
  ('jiucheng-party', '粹垢 TRAEGO', 6),
  ('jiucheng-party', 'LAWA', 7),
  ('jiucheng-party', 'Rizal Hadi [ID]', 8),

  ('shang-an', '椅子樂團', 0),
  ('shang-an', '怕胖團', 1),

  ('huichao', '董事長樂團', 0),
  ('huichao', '拍謝少年', 1),
  ('huichao', 'hue', 2),
  ('huichao', '倒車入庫', 3),
  ('huichao', '莫宰羊', 4),
  ('huichao', '擊沈女孩 DESTROYERS', 5),
  ('huichao', '腦體馬戲團', 6),
  ('huichao', '薄暮 EVENFALL', 7),

  ('id-fest', '徐佳瑩', 0),
  ('id-fest', '高爾宣 OSN', 1),
  ('id-fest', '鳳小岳', 2),
  ('id-fest', '理想混蛋 Bestards', 3),
  ('id-fest', '魏如昀', 4),
  ('id-fest', '公館青少年 GGteens', 5),
  ('id-fest', '吳汶芳', 6),
  ('id-fest', 'babyMINT', 7),
  ('id-fest', '艾蜜莉 AMILI', 8),
  ('id-fest', '林潔心', 9)
)
insert into public.festival_artists (festival_id, artist_id, position)
select l.festival_id, a.id, l.position
from lineup l
join public.artists a on a.name = l.artist_name
on conflict (festival_id, artist_id) do update
  set position = excluded.position;


-- 確認結果
select f.id, f.name, count(fa.*) as artist_count
from public.festivals f
left join public.festival_artists fa on fa.festival_id = f.id
where f.id in ('jiucheng-party','shang-an','huichao','id-fest')
group by f.id, f.name
order by f.date_start;


-- ============================================================
--  KV 主視覺網址回填（圖片已手動上傳到 Storage bucket：festival-kv）
--  ※ 下方 fname 須與你上傳到 bucket 內的「實際檔名」完全一致，
--    若你上傳時用了不同檔名或副檔名（例如 .webp），請改這裡。
-- ============================================================
update public.festivals f
set kv_image_url =
  'https://txxwqqdyjgrsxadysnif.supabase.co/storage/v1/object/public/festival-kv/' || m.fname
from (values
  ('jiucheng-party', 'jiucheng-party.jpg'),
  ('shang-an',       'shang-an.png'),
  ('huichao',        'huichao.jpg'),
  ('id-fest',        'id-fest.jpg')
) as m(id, fname)
where f.id = m.id;

-- 確認 KV 回填結果（這 4 筆的 kv_image_url 應都有值）
select id, name, kv_image_url
from public.festivals
where id in ('jiucheng-party','shang-an','huichao','id-fest')
order by date_start;
