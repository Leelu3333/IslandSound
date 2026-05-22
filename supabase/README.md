# 島嶼樂遊 / Island Sound — 資料庫

依據前端 `src/data/festivals.js` 建立的 Supabase (Postgres) schema。

```
supabase/
├── migrations/
│   └── 20260510000000_init_schema.sql   ← 建表 / 索引 / RLS / view
├── seed.sql                             ← 15 場音樂祭 + 460 位藝人
└── README.md                            ← 你正在讀的這個
```

## 資料概況

| 項目 | 數量 |
|---|---|
| `regions` 行政區 | 17 |
| `festivals` 音樂祭 | 15 |
| `artists` 藝人（去重後） | 460 |
| `festival_artists` 陣容關聯 | 538 |

> 數量取自 `seed.sql` 實際內容（2026 年度資料）。

## 資料模型

```
regions ──► festivals ◄─── festival_artists ───► artists
```

| 表 | 用途 | 對應前端 |
|---|---|---|
| `regions` | 行政區（北→南，`sort_order` 排序） | `REGIONS` 陣列 |
| `artists` | 藝人主檔（依名稱去重） | 從 `FESTIVALS[].artists` 抽出 |
| `festivals` | 音樂祭主檔，`id` 沿用前端 slug | `FESTIVALS` 陣列 |
| `festival_artists` | 多對多 + lineup 順序（`position`） | — |
| `v_festivals_full` *(view)* | 一次撈完整資料，欄位對齊前端 | 直接 `select * from v_festivals_full` |

### `festivals` 主要欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | `text` (PK) | slug，對齊前端（`emerge` / `megaport` …） |
| `name` / `name_en` | `text` | 中文名 / 英文名 |
| `region_id` | `smallint` → `regions` | 外鍵 |
| `venue` | `text` | 場地 |
| `date_start` / `date_end` | `date` | 起訖日（含 `date_end >= date_start` 檢查） |
| `month` | `smallint` (1–12) | 主要月份，衍生自 `date_start`，保留以利篩選 |
| `blurb` | `text` | 短描述（seed 目前多為 null，未捏造） |
| `coord_x` / `coord_y` | `numeric(5,3)` (0–1) | 地圖 pin 座標（前端 `TaiwanMap` 用） |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` 由 trigger 自動更新 |

注意：前端的 `saved`（收藏）**沒有**進資料庫 — 先用 localStorage 處理；之後加入會員系統時再開 `user_favorites(user_id, festival_id)` 表。

## seed.sql 重點

- 所有 `INSERT` 皆為 **idempotent**（`on conflict`），可重複執行。
- `regions` 含 17 縣市（補上「基隆」），`sort_order` 由北到南重新編號。
- `month` 取自 `date_start` 的月份。
- `coord_x` / `coord_y` 依城市估算（桃園 / 台東 / 基隆為新城市，依地理位置估算）。
- 陣容以單一 CTE 為來源，**同時推導 `artists` 與 `festival_artists`**，確保名稱完全一致；每場已去除場內重複藝人。火球祭（`fireball`）陣容尚未公布，先以「待公布」佔位。

## 部署：兩種方式

### A. Supabase CLI（推薦）

```bash
# 1. 安裝 CLI（已安裝可跳過）
npm i -g supabase

# 2. 在專案根目錄初始化（會在 supabase/ 下建立 config.toml）
supabase init

# 3. 連線到你的 Supabase 專案
supabase link --project-ref <your-project-ref>

# 4. 推送 schema + seed
supabase db push          # 套用 migrations/
supabase db seed          # 灌入 seed.sql
```

### B. 直接在 Supabase Dashboard 跑 SQL

1. 進到 Supabase Dashboard → SQL Editor
2. 把 `migrations/20260510000000_init_schema.sql` 全貼上 → Run
3. 再把 `seed.sql` 全貼上 → Run

兩個檔都是 idempotent（用了 `if not exists` / `on conflict`），重跑不會炸。

## 串前端

`.env`（從 `.env.example` 複製）：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

client 已建好於 `src/lib/supabase.js`：

```js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
```

撈資料（取代 `import { FESTIVALS } from './data/festivals.js'`）：

```js
const { data: festivals, error } = await supabase
  .from('v_festivals_full')      // ← 用 view，欄位已經對齊前端
  .select('*')
  .order('date_start');
```

`v_festivals_full` 回傳的每一列形狀：

```ts
{
  id: 'megaport',
  name: '大港開唱',
  name_en: 'Megaport Festival 2026',
  region: '高雄',
  region_en: 'Kaohsiung',
  venue: '駁二藝術特區',
  date_start: '2026-03-28',
  date_end: '2026-03-29',
  month: 3,
  blurb: null,
  coord: { x: 0.1, y: 0.79 },
  artists: ['落日飛車', '草東沒有派對', ...]
}
```

> 前端目前用駝峰式欄位（`nameEn` / `dateStart` / `dateEnd` / `regionEn`），DB 用 snake_case（`name_en` / `date_start`，Postgres 慣例）。串接時可在 `select` 用別名轉，或在 lib 包一個 `mapFestival(row)` 做轉換。

## 主視覺圖片（KV）流程

圖片**不存進資料庫**，而是放 Supabase Storage 的公開 bucket `festival-kv`，DB 只用 `festivals.kv_image_url` 存公開網址。整套流程設計成可重複執行 —— 未來新增音樂祭時照同樣三步即可。

相關檔案：

| 檔案 | 作用 |
|---|---|
| `migrations/20260522120000_add_kv_images.sql` | 加 `kv_image_url` 欄位、建 `festival-kv` bucket、view 追加該欄 |
| `kv/`（專案根目錄） | 圖片來源資料夾，**檔名 = 音樂祭 slug** |
| `scripts/sync-kv-images.mjs` | 偵測格式 → （選用）壓縮 → 上傳 → 回填 `kv_image_url` |

### 第一次設定

```bash
# 1. 套用 migration（CLI 或 Dashboard SQL Editor 皆可）
supabase db push        # 或把該 .sql 貼到 SQL Editor 跑

# 2. .env 補上 service_role key（從 .env.example 複製）
#    SUPABASE_SERVICE_ROLE_KEY=...   ← 在 Dashboard → Project Settings → API 取得

# 3. （選用，建議）安裝 sharp 自動壓縮 / 轉 webp
npm i -D sharp

# 4. 先 dry-run 確認對應無誤，再正式跑
npm run sync:kv:dry
npm run sync:kv
```

> `service_role` key 權限極大、會繞過 RLS，**只放 `.env`（已被 gitignore）、絕不進前端或版控**。

### 之後要新增一場音樂祭的圖

1. 在資料庫新增該場 festival（slug 例如 `new-fest`）。
2. 把圖存到 `kv/`，檔名用同一個 slug（`kv/new-fest.jpg`，副檔名 jpg/png/webp/avif 都可）。
3. `npm run sync:kv` —— 只會處理新圖、更新對應那筆，**重跑安全不會重複**。

腳本特性：用 magic bytes 判斷格式（所以沒有副檔名的檔也吃得下）、換圖格式時會清掉同一場的舊殘檔、最後列出「對不到音樂祭的檔名」與「還沒有圖的場次」方便補齊。

### 前端取用

`v_festivals_full` 已帶 `kv_image_url`，`loadFestivals.js` 會轉成 `kvImageUrl`：

```jsx
{festival.kvImageUrl && <img src={festival.kvImageUrl} alt={festival.name} loading="lazy" />}
```

## RLS 設計

- 所有表都已開 `ROW LEVEL SECURITY`。
- `anon` / `authenticated` 都有 `SELECT` 權限（公開內容）。
- 寫入請走 `service_role`（後台）或之後加 admin 角色。
- `v_festivals_full` 以 `security_invoker = true` 建立，會以呼叫者身分正確套用 RLS。

## 之後的擴充建議

- **主視覺圖片（已完成）**：見上方〈主視覺圖片（KV）流程〉。`festivals.kv_image_url` + `festival-kv` bucket，由 `scripts/sync-kv-images.mjs` 同步。
- **`venues` 表**：目前 `venue` 是字串，未來想加場地照片 / 容量 / 座標可拆出。
- **`user_favorites`**：加入會員系統時建立 `(user_id uuid → auth.users, festival_id text)`。
- **`festival_links`**：官網 / 購票 / IG / FB 等多筆連結。
- **`artists.slug` / `artists.metadata jsonb`**：藝人頁面用。
