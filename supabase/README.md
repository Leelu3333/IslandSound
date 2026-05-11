# 島嶼樂遊 / Island Sound — 資料庫

依據前端 `src/data/festivals.js` 建立的 Supabase (Postgres) schema。

```
supabase/
├── migrations/
│   └── 20260510000000_init_schema.sql   ← 建表 / 索引 / RLS / view
├── seed.sql                             ← 14 場音樂祭 + 50 位藝人
└── README.md                            ← 你正在讀的這個
```

## 資料模型

```
regions ──► festivals ◄─── festival_artists ───► artists
```

| 表 | 用途 | 對應前端 |
|---|---|---|
| `regions` | 行政區（北→南排序） | `REGIONS` 陣列 |
| `artists` | 藝人主檔（去重後 50 位） | 從 `FESTIVALS[].artists` 抽出 |
| `festivals` | 音樂祭主檔，`id` 沿用前端 slug | `FESTIVALS` 陣列 |
| `festival_artists` | 多對多 + lineup 順序 | — |
| `v_festivals_full` *(view)* | 一次撈完整資料，欄位對齊前端 | 直接 `select * from v_festivals_full` |

注意：`saved` 欄位**沒有**進資料庫 — 依照討論，先用 localStorage 處理；之後加入會員系統時再開 `user_favorites(user_id, festival_id)` 表。

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

## 之後串前端

`.env`（從 `.env.example` 複製）：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

安裝套件：

```bash
npm i @supabase/supabase-js
```

新增 `src/lib/supabase.js`：

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

撈資料（取代 `import { FESTIVALS } from './data/festivals.js'`）：

```js
const { data: festivals, error } = await supabase
  .from('v_festivals_full')      // ← 用 view，欄位已經對齊前端
  .select('*')
  .order('date_start');
```

回傳的每一列形狀：

```ts
{
  id: 'megaport',
  name: '大港開唱',
  name_en: 'Megaport Festival',
  region: '高雄',
  region_en: 'Kaohsiung',
  venue: '駁二藝術特區',
  date_start: '2026-03-28',
  date_end: '2026-03-29',
  month: 3,
  blurb: '...',
  coord: { x: 0.1, y: 0.79 },
  artists: ['落日飛車', '草東沒有派對', 'EggPlantEgg', 'I Mean Us']
}
```

> 前端目前用的欄位是 `nameEn` / `dateStart` / `dateEnd` / `regionEn`（駝峰式），DB 用的是 `name_en` / `date_start`（snake_case，Postgres 慣例）。串接時可以：
> - 在 `supabase.from(...).select('id, name, name_en:name_en, ...')` 用別名轉
> - 或在 lib 包一個 `mapFestival(row)` 做轉換

## RLS 設計

- 所有表都已開 `ROW LEVEL SECURITY`
- `anon` / `authenticated` 都有 SELECT 權限（因為這是公開內容）
- 寫入請走 `service_role`（後台）或之後加 admin 角色

## 之後的擴充建議

- **`venues` 表**：目前 `venue` 是字串，未來想加場地照片/容量/座標可拆出
- **`user_favorites`**：加入會員系統時建立 `(user_id uuid → auth.users, festival_id text)`
- **`festival_images`**：海報/相簿
- **`festival_links`**：官網/購票/IG/FB 等多筆連結
- **`artists.slug` / `artists.metadata jsonb`**：藝人頁面用
