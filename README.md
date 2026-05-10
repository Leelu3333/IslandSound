# 島嶼樂遊 · Island Sound

> 一份非營利、由樂迷協作維護的台灣音樂祭索引。
> 從北方海岬的浪潮、中部草原的低頻，到南國港邊的吶喊——一座島，十二個月份，數十場關於聽覺的旅行。

---

## 預覽

> 截圖待補。`npm run dev` 後可在 `http://localhost:5173` 看到完整介面。

主畫面包含：

- 月份篩選——點擊任一月份，地圖上的 pin 即時切換
- 節目單卡片（搜尋、地區、時間範圍、收藏）
- 浮動 Tweaks 面板（即時切換配色與密度）

---

## 特色

**互動式月份地圖**
12 個月份按鈕對應地圖上的 pin。同月、同地區的多場音樂祭會自動合併為單一 pin，hover 時展開所有節目資訊。

**篩選器**
地區（16 縣市）、時間範圍（單排月份點選起始/結束）、關鍵字（音樂祭名稱、地區、藝人）三維度組合查詢。

**收藏清單**
把感興趣的音樂祭加入收藏，可依日期／地區／收藏狀態排序。

---

## 技術棧

| 類別     | 選擇                               |
| -------- | ---------------------------------- |
| 建置工具 | Vite 5                             |
| UI       | React 18                           |
| 樣式     | 純 CSS                             |
| 字體     | Noto Serif/Sans TC、JetBrains Mono |

---

## 快速開始

```bash
git clone https://github.com/<your-username>/island-sound.git
cd island-sound
npm install
npm run dev
```

開啟瀏覽器到 `http://localhost:5173` 即可預覽。

### 可用的 npm scripts

| 指令              | 用途                      |
| ----------------- | ------------------------- |
| `npm run dev`     | 啟動 dev server（含 HMR） |
| `npm run build`   | 打包正式版到 `dist/`      |
| `npm run preview` | 本地預覽 build 後的版本   |

---

## 專案結構

```
src/
├── main.jsx                    # React 入口（ReactDOM.createRoot）
├── App.jsx                     # 主應用元件
├── styles.css                  # 全域樣式（配色 + layout）
├── components/
│   ├── TaiwanMap.jsx           # 手繪台灣地圖 + 互動 pins
│   └── tweaks/
│       └── TweaksPanel.jsx     # 即時微調面板（配色、密度等）
└── data/
    └── festivals.js            # 音樂祭資料 + 地區、月份常數
```

---

## Roadmap

- [ ] 串接 Supabase（音樂祭資料、使用者收藏）
- [ ] 投稿表單（樂迷補充新音樂祭資料）
- [ ] 公開部署

---

## 備註

- 音樂祭資料為示範用途，實際請以各音樂祭官方公告為準
- 字體：[Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC)、[Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC)、[JetBrains Mono](https://www.jetbrains.com/lp/mono/)
