# 島嶼樂遊 · Island Sound

> 一份非營利、由樂迷協作維護的台灣音樂祭索引。
> 從北方海岬的浪潮、中部草原的低頻，到南國港邊的吶喊 —— 一座島，十二個月份，數十場關於聽覺的旅行。

---

## 預覽

> `npm run dev` 後可在 `http://localhost:5173` 看到完整介面。

主畫面包含：

- 互動式月份地圖——點擊月份，台灣地圖上的 pin 即時切換
- 節目單卡片與列表（支援搜尋、地區、時間範圍、收藏）
- 音樂祭詳情 overlay
- 投稿 modal（樂迷回報資料補正）
- 響應式佈局：桌機 / 平板 / 手機三種排版自動切換

---

## 特色

**互動式月份地圖**
12 個月份按鈕對應地圖上的 pin。同月、同地區的多場音樂祭會自動合併為單一 pin，hover 時展開所有節目資訊。

**三維度篩選器**
地區（16 縣市）、時間範圍（單排月份點選起始/結束）、關鍵字（音樂祭名稱、地區、藝人）組合查詢；地圖 pin 點擊亦可即時套用地區篩選。

**音樂祭詳情頁**
點擊「了解更多」後以 overlay 方式顯示，包含完整陣容、場地資訊與官網連結。

---

## 技術棧

| 類別       | 選擇                                        |
| ---------- | ------------------------------------------- |
| 建置工具   | Vite 5                                      |
| UI         | React 18                                    |
| 樣式       | 純 CSS（CSS custom properties 配色系統）    |
| 資料庫     | Supabase（PostgreSQL + `@supabase/supabase-js`）|
| 部署       | Cloudflare Workers（靜態資產 + SPA 模式）   |
| 字體       | Noto Serif/Sans TC、JetBrains Mono          |

---

## 快速開始

```bash
git clone https://github.com/Leelu3333/IslandSound.git
cd island-sound
npm install
npm run dev
```

開啟瀏覽器到 `http://localhost:5173` 即可預覽。

### 環境變數

專案支援 Supabase 作為遠端資料來源，未設定時自動 fallback 至本機靜態資料。在根目錄建立 `.env.local`：

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

兩個變數皆未設定（或檔案不存在）時，頁面仍可正常運作，資料來自 `src/data/festivals.js` 的 `FALLBACK_FESTIVALS`。未設定 Supabase 時，登入按鈕仍會顯示，但收藏會以訪客模式存在瀏覽器 `localStorage`。

### 會員登入設定（Supabase Auth）

收藏的持久化建立在 Supabase Auth 上，需先在 Supabase 後台啟用登入方式：

1. **資料表**：在 SQL Editor 執行 `supabase/migrations/20260524000000_user_favorites.sql`（建立 `user_favorites` 表與 RLS 政策）。
2. **Email / Magic Link**：Authentication → Providers → Email 啟用（預設即開啟），即可使用免密碼登入連結。
3. **Google OAuth**：Authentication → Providers → Google 啟用，填入 Google Cloud 的 OAuth Client ID / Secret。
4. **Redirect URLs**：Authentication → URL Configuration 的 *Redirect URLs* 加入本機與正式網址，例如：
   - `http://localhost:5173`
   - `https://island-sound.<帳號>.workers.dev`

   程式以 `window.location.origin` 作為登入後導回網址，未加入白名單會導致登入跳轉失敗。

登入流程：訪客先以 `localStorage` 暫存收藏；登入後（`src/lib/favorites.js` 的 `mergeGuestFavorites`）會自動把暫存收藏合併進帳號並清空本機暫存。

### 可用的 npm scripts

| 指令              | 用途                                        |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | 啟動 dev server（含 HMR）                   |
| `npm run build`   | 打包正式版到 `dist/`                        |
| `npm run preview` | 本地預覽 build 後的版本                     |
| `npm run deploy`  | build 後直接部署至 Cloudflare Workers       |

---

## 專案結構

```
island-sound/
├── index.html
├── vite.config.js
├── wrangler.jsonc               # Cloudflare Workers 部署設定
├── src/
│   ├── main.jsx                 # React 入口（ReactDOM.createRoot）
│   ├── App.jsx                  # 主應用元件（響應式分支、狀態管理）
│   ├── styles.css               # 全域樣式（配色 tokens、layout、元件樣式）
│   ├── components/
│   │   ├── TaiwanMap.jsx        # 手繪 SVG 台灣地圖 + 互動 pins
│   │   ├── FestivalDetail.jsx   # 音樂祭詳情 overlay
│   │   ├── SubmitModal.jsx      # 投稿 modal（表單驗證 + captcha）
│   │   ├── AuthModal.jsx        # 登入 modal（Google + Magic Link）
│   │   ├── MobileApp.jsx        # 手機版佈局（<768px）
│   │   └── TabletApp.jsx        # 平板版佈局（768–1279px）
│   ├── data/
│   │   └── festivals.js         # 靜態音樂祭資料 + REGIONS / MONTHS 常數
│   └── lib/
│       ├── supabase.js          # Supabase client 初始化（env 未設定時為 null）
│       ├── auth.js              # 登入 / 登出 / session 監聽
│       ├── favorites.js         # 收藏讀寫（Supabase + localStorage 訪客合併）
│       └── loadFestivals.js     # 從 Supabase 撈資料，失敗時回傳 null
└── supabase/
    ├── migrations/
    │   ├── 20260510000000_init_schema.sql      # DB schema 初始化
    │   └── 20260524000000_user_favorites.sql   # 使用者收藏表 + RLS
    └── seed.sql                                # 測試資料
```

---

## 資料來源

啟動時 App 會先以 `FALLBACK_FESTIVALS`（`src/data/festivals.js`）渲染，同時非同步呼叫 `loadFestivals()`。若 Supabase 連線成功，資料會即時替換為遠端版本（以 `v_festivals_full` view 為準）。欄位為 snake_case，前端統一透過 `loadFestivals.js` 中的 `mapRow()` 轉換為 camelCase。

---

## 部署（Cloudflare Workers）

```bash
npm run deploy
```

`wrangler.jsonc` 已設定 SPA fallback（所有未知路徑回傳 `index.html`），無需額外設定即可支援 client-side routing。部署後的預設網址為 `https://island-sound.<帳號>.workers.dev`。

---

## Roadmap

- [x] 互動式月份地圖 + pin 聚合
- [x] 篩選器（地區、時間範圍、關鍵字）
- [x] 收藏與排序
- [x] 音樂祭詳情 overlay
- [x] 響應式佈局（Mobile / Tablet / Desktop）
- [x] Supabase 資料整合（附本機 fallback）
- [x] 投稿 Modal
- [x] Cloudflare Workers 部署設定
- [x] 會員登入（Google OAuth + Magic Link，採 Supabase Auth）
- [x] 使用者收藏持久化（訪客存 localStorage，登入後自動合併進 Supabase）
- [ ] 月曆檢視模式
- [ ] 音樂祭官方圖片整合

---

## 備註

- 音樂祭資料為示範用途，實際請以各音樂祭官方公告為準
- 字體：[Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC)、[Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC)、[JetBrains Mono](https://www.jetbrains.com/lp/mono/)
