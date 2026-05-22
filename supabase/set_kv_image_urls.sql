-- ============================================================
--  手動回填 festivals.kv_image_url（純 SQL 版）
--  前提：14 張圖已用 Dashboard → Storage 上傳到 bucket「festival-kv」，
--        且檔名與下方 fname 完全一致。
--
--  使用方式：把 YOUR_PROJECT_REF 換成你的專案 ref（Dashboard 網址或
--  Project Settings → API 裡的 URL，例如 https://abcd1234.supabase.co
--  → ref 就是 abcd1234），然後整段貼到 SQL Editor 執行。
-- ============================================================

update public.festivals f
set kv_image_url =
  'https://txxwqqdyjgrsxadysnif.supabase.co/storage/v1/object/public/festival-kv/' || m.fname
from (values
  ('east-wave',      'east-wave.jpg'),
  ('emerge',         'emerge.png'),
  ('hot-wave',       'hot-wave.jpg'),
  ('kaka',           'kaka.png'),
  ('love-rock',      'love-rock.jpg'),
  ('lunghumen-247',  'lunghumen-247.png'),
  ('megaport',       'megaport.png'),
  ('nccu-summer',    'nccu-summer.jpg'),
  ('pingtung-3days', 'pingtung-3days.jpg'),
  ('pp-festival',    'pp-festival.jpg'),
  ('siraya',         'siraya.jpg'),
  ('spring-wave',    'spring-wave.webp'),
  ('tmf',            'tmf.avif'),
  ('yushan',         'yushan.jpg')
) as m(id, fname)
where f.id = m.id;

-- 確認結果
select id, kv_image_url from public.festivals order by id;
