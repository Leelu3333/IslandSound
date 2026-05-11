-- ============================================================
--  島嶼樂遊 / Island Sound  ── seed
--  資料來源：src/data/festivals.js（前端 FESTIVALS / REGIONS）
--  特性：所有 INSERT 皆為 idempotent（ON CONFLICT），可重複執行
-- ============================================================

-- ─────────────────────────── regions ───────────────────────────
insert into public.regions (name_zh, name_en, sort_order) values
  ('台北', 'Taipei',     1),
  ('新北', 'New Taipei', 2),
  ('桃園', 'Taoyuan',    3),
  ('新竹', 'Hsinchu',    4),
  ('苗栗', 'Miaoli',     5),
  ('台中', 'Taichung',   6),
  ('彰化', 'Changhua',   7),
  ('南投', 'Nantou',     8),
  ('雲林', 'Yunlin',     9),
  ('嘉義', 'Chiayi',    10),
  ('台南', 'Tainan',    11),
  ('高雄', 'Kaohsiung', 12),
  ('屏東', 'Pingtung',  13),
  ('宜蘭', 'Yilan',     14),
  ('花蓮', 'Hualien',   15),
  ('台東', 'Taitung',   16)
on conflict (name_zh) do update
  set name_en    = excluded.name_en,
      sort_order = excluded.sort_order;


-- ─────────────────────────── artists ───────────────────────────
insert into public.artists (name) values
  ('落日飛車'),
  ('草東沒有派對'),
  ('EggPlantEgg'),
  ('I Mean Us'),
  ('告五人'),
  ('9m88'),
  ('持修'),
  ('美秀集團'),
  ('Tizzy Bac'),
  ('回聲樂團'),
  ('傷心欲絕'),
  ('椅子樂團'),
  ('雲力思'),
  ('鄭宜農'),
  ('桑布伊'),
  ('黃連煜'),
  ('滅火器'),
  ('玖壹壹'),
  ('deca joins'),
  ('拍謝少年'),
  ('官靈芝'),
  ('魏廣晧'),
  ('Erik Truffaz'),
  ('Esperanza Spalding'),
  ('陳綺貞'),
  ('張懸'),
  ('盧廣仲'),
  ('韋禮安'),
  ('神經病'),
  ('麋先生'),
  ('Crispy脆樂團'),
  ('茄子蛋'),
  ('壞特'),
  ('珂拉琪'),
  ('百合花'),
  ('淺堤'),
  ('風籟坊'),
  ('ABAO 阿爆'),
  ('查勞·巴西瓦里'),
  ('巴奈'),
  ('DJ Mykal a.k.a.林哲儀'),
  ('RayRay'),
  ('Sonia Calico'),
  ('Q-Lai'),
  ('Korber'),
  ('Hi-Fidel'),
  ('YELLOW'),
  ('魏廣晧四重奏'),
  ('劉珈妤'),
  ('TJ Trio')
on conflict (name) do nothing;


-- ─────────────────────────── festivals ───────────────────────────
insert into public.festivals
  (id, name, name_en, region_id, venue, date_start, date_end, month, blurb, coord_x, coord_y)
values
  ('megaport',
   '大港開唱', 'Megaport Festival',
   (select id from public.regions where name_zh = '高雄'),
   '駁二藝術特區', '2026-03-28', '2026-03-29', 3,
   '港邊的搖滾島嶼，獨立樂團與在地能量的年度匯流。',
   0.100, 0.790),

  ('spring-scream',
   '春浪音樂節', 'Spring Wave',
   (select id from public.regions where name_zh = '屏東'),
   '墾丁鵝鑾鼻', '2026-04-04', '2026-04-05', 4,
   '南國海風與流行樂團，島嶼最南端的春日狂想。',
   0.380, 1.000),

  ('ocean',
   '貢寮國際海洋音樂祭', 'Ho-hai-yan',
   (select id from public.regions where name_zh = '新北'),
   '福隆海水浴場', '2026-07-10', '2026-07-12', 7,
   '夏日浪潮上的搖滾朝聖，二十多年的東北角傳統。',
   0.900, 0.050),

  ('wandering',
   '流浪之歌音樂節', 'Wandering Songs',
   (select id from public.regions where name_zh = '台北'),
   '中山堂', '2026-10-02', '2026-10-04', 10,
   '從世界角落帶回來的民謠，靜靜訴說土地的故事。',
   0.760, 0.050),

  ('wakeup',
   '覺醒音樂祭', 'Wake Up Festival',
   (select id from public.regions where name_zh = '嘉義'),
   '東石漁人碼頭', '2026-08-14', '2026-08-16', 8,
   '中部最盛大的獨立音樂集會，三天三夜不間斷。',
   0.130, 0.550),

  ('tcjazz',
   '台中爵士音樂節', 'Taichung Jazz',
   (select id from public.regions where name_zh = '台中'),
   '市民廣場', '2026-10-16', '2026-10-25', 10,
   '十天的爵士漫遊，藍調夜與草地野餐之間。',
   0.290, 0.320),

  ('simplelife',
   '簡單生活節', 'Simple Life',
   (select id from public.regions where name_zh = '台北'),
   '華山1914', '2026-12-05', '2026-12-06', 12,
   '城市裡的慢板週末，音樂、市集與生活提案。',
   0.760, 0.050),

  ('vagrant',
   '浪人祭', 'Vagrant Festival',
   (select id from public.regions where name_zh = '台南'),
   '黃金海岸', '2026-04-25', '2026-04-26', 4,
   '南方青年的搖滾告解，海與沙之間的吶喊。',
   0.010, 0.660),

  ('fireball',
   '火球祭', 'Fireball Fest',
   (select id from public.regions where name_zh = '台中'),
   '中央公園', '2026-11-07', '2026-11-08', 11,
   '由樂迷推動的樂迷祭典，純粹的熱度。',
   0.290, 0.320),

  ('shantun',
   '山海屯音樂節', 'Mountain Sea Tun',
   (select id from public.regions where name_zh = '台南'),
   '新化老街', '2026-09-19', '2026-09-20', 9,
   '老街裡的獨立音樂實驗，傳統與當代交織。',
   0.010, 0.660),

  ('pacific',
   '太平洋藝術節', 'Pacific Arts',
   (select id from public.regions where name_zh = '花蓮'),
   '東大門夜市廣場', '2026-06-12', '2026-06-14', 6,
   '面向太平洋的原民歌謠，山與海的合奏。',
   0.790, 0.440),

  ('organic',
   '草原派對', 'Organic Field',
   (select id from public.regions where name_zh = '宜蘭'),
   '頭城農場', '2026-05-23', '2026-05-24', 5,
   '山谷裡的電子旅行，草地、火堆、整夜的低頻。',
   0.850, 0.150),

  ('northwave',
   '北方波浪音樂節', 'North Wave Music',
   (select id from public.regions where name_zh = '台北'),
   '大安森林公園', '2026-10-10', '2026-10-12', 10,
   '秋日森林裡的電子聲景，城市喧囂之外的頻率漫遊。',
   0.760, 0.050),

  ('taichung-autumn-jazz',
   '台中秋聲爵士', 'Taichung Autumn Jazz',
   (select id from public.regions where name_zh = '台中'),
   '文化創意園區', '2026-10-18', '2026-10-19', 10,
   '秋高氣爽的周末爵士小聚，露天舞台與手沖咖啡的午後。',
   0.290, 0.320)
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


-- ─────────────────────────── festival_artists ───────────────────────────
-- 用 VALUES + JOIN artists by name 來查 id，重跑也安全
insert into public.festival_artists (festival_id, artist_id, position)
select v.festival_id, a.id, v.position
from (values
  -- megaport (大港開唱)
  ('megaport',             '落日飛車',                0),
  ('megaport',             '草東沒有派對',            1),
  ('megaport',             'EggPlantEgg',             2),
  ('megaport',             'I Mean Us',               3),

  -- spring-scream (春浪音樂節)
  ('spring-scream',        '告五人',                  0),
  ('spring-scream',        '9m88',                    1),
  ('spring-scream',        '持修',                    2),
  ('spring-scream',        '美秀集團',                3),

  -- ocean (貢寮國際海洋音樂祭)
  ('ocean',                'Tizzy Bac',               0),
  ('ocean',                '回聲樂團',                1),
  ('ocean',                '傷心欲絕',                2),
  ('ocean',                '椅子樂團',                3),

  -- wandering (流浪之歌音樂節)
  ('wandering',            '雲力思',                  0),
  ('wandering',            '鄭宜農',                  1),
  ('wandering',            '桑布伊',                  2),
  ('wandering',            '黃連煜',                  3),

  -- wakeup (覺醒音樂祭)
  ('wakeup',               '滅火器',                  0),
  ('wakeup',               '玖壹壹',                  1),
  ('wakeup',               'deca joins',              2),
  ('wakeup',               '拍謝少年',                3),

  -- tcjazz (台中爵士音樂節)
  ('tcjazz',               '官靈芝',                  0),
  ('tcjazz',               '魏廣晧',                  1),
  ('tcjazz',               'Erik Truffaz',            2),
  ('tcjazz',               'Esperanza Spalding',      3),

  -- simplelife (簡單生活節)
  ('simplelife',           '陳綺貞',                  0),
  ('simplelife',           '張懸',                    1),
  ('simplelife',           '盧廣仲',                  2),
  ('simplelife',           '韋禮安',                  3),

  -- vagrant (浪人祭)
  ('vagrant',              '神經病',                  0),
  ('vagrant',              '麋先生',                  1),
  ('vagrant',              'Crispy脆樂團',            2),
  ('vagrant',              '茄子蛋',                  3),

  -- fireball (火球祭)
  ('fireball',             '茄子蛋',                  0),
  ('fireball',             '美秀集團',                1),
  ('fireball',             '傷心欲絕',                2),
  ('fireball',             '壞特',                    3),

  -- shantun (山海屯音樂節)
  ('shantun',              '珂拉琪',                  0),
  ('shantun',              '百合花',                  1),
  ('shantun',              '淺堤',                    2),
  ('shantun',              '風籟坊',                  3),

  -- pacific (太平洋藝術節)
  ('pacific',              '桑布伊',                  0),
  ('pacific',              'ABAO 阿爆',               1),
  ('pacific',              '查勞·巴西瓦里',           2),
  ('pacific',              '巴奈',                    3),

  -- organic (草原派對)
  ('organic',              'DJ Mykal a.k.a.林哲儀',   0),
  ('organic',              'RayRay',                  1),
  ('organic',              'Sonia Calico',            2),
  ('organic',              'Q-Lai',                   3),

  -- northwave (北方波浪音樂節)
  ('northwave',            'Sonia Calico',            0),
  ('northwave',            'Korber',                  1),
  ('northwave',            'Hi-Fidel',                2),
  ('northwave',            'YELLOW',                  3),

  -- taichung-autumn-jazz (台中秋聲爵士)
  ('taichung-autumn-jazz', '魏廣晧四重奏',            0),
  ('taichung-autumn-jazz', '劉珈妤',                  1),
  ('taichung-autumn-jazz', 'TJ Trio',                 2),
  ('taichung-autumn-jazz', '官靈芝',                  3)
) as v(festival_id, artist_name, position)
join public.artists a on a.name = v.artist_name
on conflict (festival_id, artist_id) do update
  set position = excluded.position;
