// Taiwan map — hand-drawn camel silhouette matching user's reference.
// Vertically elongated, squiggly outline, dark brown stroke, offset shadow.

// Pin bounding box — aligned to the actual TAIWAN_PATH bbox (≈ x[71–459], y[37–764]).
// Slight inset so coords (0..1) map roughly inside the visible island core
// rather than to the outermost path points.
const BX = 80, BY = 50, BW = 380, BH = 700;

// Realistic Taiwan silhouette — proper geography with hand-drawn pen jitter:
// East: Yilan plain → Hualien bulges out → Taitung pulls slightly inward
// South: Eluanbi narrows to a SE-pointing tip
// West: Kaohsiung bay → Tainan/Yunlin alluvial plain bulges west → Hsinchu/Taoyuan
// North: Taoyuan coast east to Fugui Cape, Keelung corner
const TAIWAN_PATH = [
  "M 223.5 761.8",
  "c -2.1 -1.6 -4.7 -2.3 -9.8 -2.7",
  "c -7 -0.6 -7.1 -0.6 -8 -4",
  "c -0.4 -1.8 -1.8 -4.6 -2.9 -6.1",
  "c -1.9 -2.7 -2 -3.4 -1 -12.9",
  "c 1.2 -11.6 0.6 -17.1 -3.9 -36.4",
  "c -3.8 -16 -7.2 -22.9 -16.1 -32.3",
  "c -7.9 -8.3 -12.8 -11.1 -26.3 -15.3",
  "c -16.7 -5.2 -32.6 -15.7 -35.9 -23.6",
  "c -0.8 -1.8 -3.7 -5.8 -6.5 -8.9",
  "c -5.8 -6.4 -5.8 -6.4 -7.1 -21.3",
  "c -1.1 -13.5 -2.4 -18.9 -9.7 -40.3",
  "c -6.6 -19.4 -10.5 -26.5 -18.5 -34.2",
  "c -4.9 -4.6 -6.1 -6.4 -6.5 -9.7",
  "c -0.9 -6.5 1.3 -12.8 6.2 -18.3",
  "c 2.4 -2.7 5.4 -7.5 6.6 -10.6",
  "c 1.9 -5.1 2 -6.9 1.4 -16.6 l -0.6 -10.9 4.7 -4.8",
  "c 3.5 -3.6 4.5 -5.2 3.9 -6.6",
  "c -0.4 -1 -1.1 -4.7 -1.7 -8.3",
  "c -0.5 -3.6 -1.2 -8 -1.5 -9.7",
  "c -0.4 -2.5 0.1 -3.9 1.9 -6.1",
  "c 4.4 -5.2 5.3 -8.7 4 -15.1",
  "c -2.8 -13.3 -1.1 -20.4 6.2 -27.5",
  "c 6.7 -6.5 7.6 -8.2 7.6 -15.1",
  "c 0 -7 0.4 -7.7 10.3 -19.5",
  "c 7.2 -8.5 22.2 -30.3 30 -43.5",
  "c 1.8 -3.1 3.1 -6.9 3.4 -10.5",
  "c 0.5 -4.3 1.3 -6.3 3.8 -9.1",
  "c 1.8 -2 4.2 -6.2 5.3 -9.2",
  "c 1.2 -3.1 4.3 -8.3 7 -11.7",
  "c 6.1 -7.5 10.4 -16.3 12.7 -25.8",
  "c 1.6 -6.6 2.1 -7.5 6.1 -10.4",
  "c 7.7 -5.5 15.2 -18.6 18.5 -32.3",
  "c 1.7 -7 3.5 -10.2 6.1 -11",
  "c 3.2 -1 7.7 -5.4 9.3 -9.1",
  "c 0.7 -1.7 3 -4.4 5 -6",
  "c 8.2 -6.3 11.2 -9.5 13.2 -14.1",
  "c 3.2 -7.2 8.1 -24.1 8.8 -30.3",
  "c 0.6 -5.1 1 -5.9 7.6 -12.2",
  "c 7.2 -7 8.9 -9.9 8.9 -14.8",
  "c 0 -3.6 0.4 -3.9 8.8 -4.9",
  "c 6.9 -0.9 12 -2.9 19.7 -7.6",
  "c 2.2 -1.4 10.3 -4.5 18 -7.1",
  "c 7.7 -2.5 15.9 -5.7 18.3 -7",
  "c 5.5 -3.2 11.5 -9.5 13.7 -14.4",
  "c 1.1 -2.4 2.6 -4.1 4.1 -4.4",
  "c 1.3 -0.4 5.4 -3.3 9 -6.6",
  "c 6.4 -5.8 6.8 -6 12.1 -6",
  "c 6.6 0 10.4 2 15.2 8",
  "c 1.8 2.2 5.7 5.4 8.7 7.1",
  "c 3 1.7 5.4 3.5 5.4 3.9",
  "c 0 0.5 1.5 2.5 3.4 4.4",
  "c 3 3.2 3.9 3.6 8.3 3.6",
  "c 3.8 0 5.4 0.5 6.9 2.1",
  "c 1 1.2 5 3.7 8.9 5.5",
  "c 5.6 2.7 8.2 3.4 13.1 3.4 l 6.1 0 1.2 5.9",
  "c 1 4.9 1.8 6.5 5.1 9.5",
  "c 2.2 2 4.7 3.6 5.5 3.6",
  "c 1 0 1.5 1 1.5 3.3",
  "c 0 2.9 -0.8 3.8 -8.1 9.1",
  "c -10.5 7.6 -20.4 16.9 -23.4 22",
  "c -4.1 7 -4.8 13 -3.1 25.3",
  "c 2.2 16.2 4.8 23.4 9.7 27.6",
  "c 3.8 3.3 4 3.8 4.6 10.4",
  "c 0.3 3.9 0.1 7.8 -0.4 8.7",
  "c -0.5 1 -5 5 -9.9 9",
  "c -13.3 10.8 -13.4 11 -12.7 26.6 l 0.6 12.9 -3 2.8",
  "c -1.7 1.5 -5.3 4.9 -8 7.4",
  "c -3.2 3 -5.5 6.3 -6.7 9.5",
  "c -1 2.7 -2.2 6.1 -2.8 7.5",
  "c -0.5 1.5 -3.4 5.5 -6.3 9",
  "c -3 3.5 -6.6 8.6 -8.1 11.2",
  "c -2.2 4.2 -2.4 5.2 -1.4 7.6",
  "c 0.6 1.5 3.1 4 5.6 5.6",
  "c 5.3 3.4 5.6 5.3 1.9 16.6",
  "c -1.3 4.2 -2.1 8.6 -1.8 9.7",
  "c 0.9 3.4 -0.5 8.5 -3.1 11.5",
  "c -1.4 1.6 -3.9 6.3 -5.6 10.5",
  "c -1.9 5.3 -3.2 14.5 -3.4 22.1 l -0.3 14.6 -5.6 12.1",
  "c -5.9 12.6 -6.1 13.4 -5.1 22.4",
  "c 0.5 5.2 0.3 6 -4.8 16",
  "c -2.9 5.8 -6.2 12.5 -7.1 15",
  "c -1 2.5 -3.9 8.8 -6.3 14.1 l -4.5 9.7 1.2 8.2",
  "c 2.2 15.3 0.3 21.6 -10.4 35",
  "c -3.3 4.1 -7.3 10.4 -8.9 14",
  "c -3.8 8.4 -7 12.6 -11.6 14.9",
  "c -2 1.1 -5 3.3 -6.7 5",
  "c -2.7 2.9 -3 3.9 -3.5 12.6",
  "c -0.5 9 -0.6 9.5 -3.9 12.9",
  "c -1.9 2 -7.5 5.7 -12.3 8.2",
  "c -11.2 5.7 -15 9.5 -16.5 16.1",
  "c -0.7 2.8 -6.6 16.2 -13.3 29.9",
  "c -10.4 21.3 -12.2 26 -13.2 32.4",
  "c -1.3 8.9 -1.5 40.4 -0.4 58.1 l 0.8 12.6 -4.1 7.5",
  "c -2.2 4.1 -4.1 8.7 -4.1 10.1",
  "c 0 2.4 -0.4 2.7 -3.4 2.7",
  "c -1.9 0 -4.5 -0.9 -6.1 -2.2 Z",
].join(" ");

export function TaiwanMap({ pins, activeMonth, activeRegion, onPinClick, hoveredId, setHoveredId }) {
  const visible = pins.filter((p) => p.month === activeMonth);

  const regionMap = {};
  pins.forEach((p) => {
    if (!regionMap[p.region]) regionMap[p.region] = [];
    regionMap[p.region].push(p);
  });
  Object.values(regionMap).forEach((group) => {
    group.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  });

  // 同月同地點 → 以 region 為 key 合併成群組（同 coord 的節目合成一個 pin）
  const groupMap = {};
  visible.forEach((p) => {
    if (!groupMap[p.region]) groupMap[p.region] = [];
    groupMap[p.region].push(p);
  });
  const pinGroups = Object.values(groupMap);
  const orderedPinGroups = [
    ...pinGroups.filter((group) => {
      const regionGroup = regionMap[group[0].region] ?? group;
      return !regionGroup.some((f) => f.id === hoveredId);
    }),
    ...pinGroups.filter((group) => {
      const regionGroup = regionMap[group[0].region] ?? group;
      return regionGroup.some((f) => f.id === hoveredId);
    }),
  ];

  return (
    <svg
      viewBox="0 0 480 800"
      className="taiwan-map"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      style={{ display: "block", width: "100%", height: "auto", maxHeight: "760px" }}>

      <defs>
        <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="var(--ink-faint)" />
        </pattern>
        <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
          <feOffset dx="0" dy="2.5" result="o" />
          <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="480" height="800" fill="url(#dots)" opacity="0.4" />

      {/* compass + decorative copy */}
      <g fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="var(--ink-soft)">
        <text x="520" y="44" letterSpacing="2" textAnchor="end">2026 / {String(activeMonth).padStart(2, "0")}</text>
        <line x1="440" y1="50" x2="520" y2="50" stroke="var(--ink-soft)" strokeWidth="0.8" />
      </g>

      {/* ── 三個離島 inset boxes（仿教育用台灣地圖：每個離島群放在獨立框內，垂直排在左側） ── */}
      {/* 整組用 transform 往左平移，貼齊地圖左邊緣 */}
      <g transform="translate(-35, 0)">

      {/* Inset 1: 馬祖列島（連江縣） */}
      <g>
        <rect x="12" y="85" width="78" height="80" rx="6"
          fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.2" />
        {/* 馬祖列島：南北竿、東引、東莒等散落小島 */}
        <ellipse cx="32" cy="108" rx="3" ry="2" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="50" cy="116" rx="3.5" ry="2.2" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="66" cy="106" rx="2.4" ry="1.7" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1" />
        <circle cx="40" cy="128" r="1.3" fill="var(--ink)" />
        <circle cx="58" cy="132" r="1.1" fill="var(--ink)" />
        <circle cx="72" cy="122" r="0.9" fill="var(--ink)" />
        <text x="51" y="156" fontFamily="'Noto Sans TC', sans-serif" fontSize="12"
          fill="var(--ink)" textAnchor="middle" fontWeight="500">馬祖</text>
      </g>

      {/* Inset 2: 金門縣（含烏坵嶼） */}
      <g>
        <rect x="12" y="180" width="78" height="80" rx="6"
          fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.2" />
        {/* 金門本島 — 蟹爪狀的離島 */}
        <path d="M 26 218 q 4 -9 14 -7 q 10 1 15 7 q 5 5 1 11 q -6 6 -14 5 q -4 -1 -8 1 q -7 4 -10 -3 q -2 -7 2 -14 Z"
          fill="var(--camel)" stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="42" cy="219" r="1" fill="var(--ink)" />
        <circle cx="36" cy="232" r="0.8" fill="var(--ink)" />
        {/* 烏坵嶼 — 金門東北邊的小點 */}
        <circle cx="73" cy="232" r="1.2" fill="var(--ink)" />
        <text x="51" y="251" fontFamily="'Noto Sans TC', sans-serif" fontSize="12"
          fill="var(--ink)" textAnchor="middle" fontWeight="500">金門</text>
      </g>

      {/* Inset 3: 澎湖縣（島嶼較多，框比較高） */}
      <g>
        <rect x="12" y="275" width="78" height="120" rx="6"
          fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.2" />
        {/* 澎湖本島（馬公）— 主島 */}
        <path d="M 25 315 q 5 -7 14 -4 q 8 3 6 10 q -2 6 -10 6 q -7 0 -10 -5 q -2 -3 0 -7 Z"
          fill="var(--camel)" stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
        {/* 周邊次要島（白沙、西嶼、望安、七美等）*/}
        <ellipse cx="60" cy="307" rx="3" ry="2" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="68" cy="335" rx="2.8" ry="1.9" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="36" cy="345" rx="2.2" ry="1.5" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="0.9" />
        <circle cx="50" cy="355" r="1.3" fill="var(--ink)" />
        <circle cx="68" cy="360" r="1" fill="var(--ink)" />
        <circle cx="30" cy="365" r="0.9" fill="var(--ink)" />
        <circle cx="56" cy="370" r="0.8" fill="var(--ink)" />
        <text x="51" y="386" fontFamily="'Noto Sans TC', sans-serif" fontSize="12"
          fill="var(--ink)" textAnchor="middle" fontWeight="500">澎湖</text>
      </g>

      </g>{/* end of 三個離島 inset boxes wrapper */}

      {/* ── Green Island / 綠島 + Orchid Island / 蘭嶼 — east of main island，往左下微調 ── */}
      <g>
        <ellipse cx="424" cy="624" rx="5" ry="3.5" fill="var(--camel)" stroke="var(--ink)" strokeWidth="1.3" />
        <text x="434" y="628" fontFamily="'JetBrains Mono', monospace" fontSize="9"
          fill="var(--ink-soft)" letterSpacing="0.5">綠島</text>
        <ellipse cx="434" cy="709" rx="5.5" ry="4" fill="var(--camel)" stroke="var(--ink)" strokeWidth="1.3" />
        <text x="445" y="713" fontFamily="'JetBrains Mono', monospace" fontSize="9"
          fill="var(--ink-soft)" letterSpacing="0.5">蘭嶼</text>
      </g>

      {/* ── Dongsha / 東沙群島 + Nansha / 南沙群島 — bottom-left（高雄市管轄） ── */}
      <g>
        {/* 東沙 — 環礁狀的小島 */}
        <ellipse cx="55" cy="720" rx="3.2" ry="1.8" fill="var(--camel)"
          stroke="var(--ink)" strokeWidth="1.2" />
        <text x="32" y="738" fontFamily="'JetBrains Mono', monospace" fontSize="8"
          fill="var(--ink-soft)" letterSpacing="0.5">東沙</text>

        {/* 南沙 — 散布的細小礁岩 */}
        <circle cx="50" cy="765" r="1.2" fill="var(--ink)" />
        <circle cx="60" cy="770" r="1" fill="var(--ink)" />
        <circle cx="55" cy="778" r="0.8" fill="var(--ink)" />
        <circle cx="66" cy="763" r="0.8" fill="var(--ink)" />
        <text x="32" y="792" fontFamily="'JetBrains Mono', monospace" fontSize="8"
          fill="var(--ink-soft)" letterSpacing="0.5">南沙</text>
      </g>

      {/* island — offset shadow */}
      <path d={TAIWAN_PATH} fill="var(--ink)" opacity="0.92" transform="translate(4, 5)" />

      {/* island — main camel fill */}
      <path d={TAIWAN_PATH} fill="var(--camel)" />

      {/* island — outline */}
      <path
        d={TAIWAN_PATH}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.6"
        strokeLinejoin="miter"
        strokeMiterlimit="3"
        strokeLinecap="round" />

{/* ── Pins（群組化：同月同地點合為一個 pin） ── */}
      {orderedPinGroups.map((group) => {
        const p = group[0]; // 以第一筆的座標為基準
        const regionGroup = regionMap[p.region] ?? group;
        const cx = BX + p.coord.x * BW;
        const cy = BY + p.coord.y * BH;
        // 只要同地區任一節目被 hover，整個地區 pin 都顯示 hover 狀態
        const isHover = regionGroup.some((f) => f.id === hoveredId);
        const isFiltered = activeRegion && activeRegion !== p.region;
        const hasMultiple = group.length > 1;
        const labelLeft = cx < 280;
        const labelOffsetX = labelLeft ? -14 : 14;

        return (
          <g
            key={p.region}
            transform={`translate(${cx}, ${cy})`}
            className={`pin ${isFiltered ? "pin--dim" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => onPinClick(p)}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}>

            {/* 擴大感應區 */}
            <circle r="26" fill="transparent" />

            {/* 地區標籤（未 hover 時顯示，多筆時加 ×N 標記） */}
            {!isHover &&
              <g transform={`translate(${labelOffsetX}, 0)`} style={{ pointerEvents: "none" }}>
                <rect
                  x={labelLeft ? -(p.region.length * 14 + 16) : 0}
                  y="-11"
                  width={p.region.length * 14 + 16}
                  height="22"
                  rx="11"
                  fill="var(--bg)"
                  stroke="var(--ink)"
                  strokeWidth="1" />
                <text
                  x={labelLeft ? -8 : 8}
                  y="5"
                  textAnchor={labelLeft ? "end" : "start"}
                  fontSize="13"
                  fill="var(--ink)"
                  fontFamily="'Noto Sans TC', sans-serif"
                  fontWeight="500">
                  {p.region}
                </text>
              </g>
            }

            {/* hover 光暈 */}
            <circle r="16" fill="var(--accent)" opacity={isHover ? 0.22 : 0}
              style={{ transition: "opacity 0.2s" }} />

            {/* pin 本體 */}
            <g filter="url(#pinShadow)">
              <path
                d="M 0 -13 C -7 -13 -11 -8 -11 -3 C -11 4 -3 9 0 13 C 3 9 11 4 11 -3 C 11 -8 7 -13 0 -13 Z"
                fill={isHover ? "var(--ink)" : "var(--bg)"}
                stroke="var(--ink)"
                strokeWidth="1.5"
                style={{ transition: "fill 0.2s" }} />
              <circle cx="0" cy="-3" r="3.2"
                fill={isHover ? "var(--accent)" : "var(--ink)"}
                style={{ transition: "fill 0.2s" }} />
            </g>

            {/* 多筆徽章（右上角數字圓圈，未 hover 時顯示） */}
            {hasMultiple && !isHover &&
              <g>
                <circle cx="10" cy="-16" r="8" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5" />
                <text x="10" y="-12" textAnchor="middle" fontSize="9" fill="var(--bg)"
                  fontFamily="'JetBrains Mono', monospace" fontWeight="700">
                  {group.length}
                </text>
              </g>
            }

            {/* ── Hover Tooltip ── */}
            {isHover && (() => {
              // 左側 pin → tooltip 往右展；右側 pin → 往左展
              // 各螢幕尺寸統一這個行為，避免 tooltip 被遮住或超出邊緣
              const sideLeft = cx >= 280;

              if (hasMultiple) {
                /* 多筆資料：列出當月節目名稱與日期 */
                const tooltipW = 310;
                const headerH = 46;
                const rowH = 56;
                const tooltipH = headerH + rowH * group.length + 12;
                const tx = sideLeft ? -(tooltipW + 18) : 18;
                const ty = -tooltipH / 2;

                return (
                  <g transform={`translate(${tx}, ${ty})`}
                    style={{ pointerEvents: "none" }}
                    filter="url(#pinShadow)">
                    {/* 背景卡片 */}
                    <rect x="0" y="0" width={tooltipW} height={tooltipH} rx="8" fill="var(--ink)" />

                    {/* 標頭：地區 + 場數 */}
                    <text x="16" y="20" fontSize="11" fill="var(--paper-deep)"
                      fontFamily="'JetBrains Mono', monospace" letterSpacing="1.5">
                      {p.region.toUpperCase()}
                    </text>
                    <text x={tooltipW - 16} y="20" textAnchor="end" fontSize="11"
                      fill="var(--accent)" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">
                      {group.length} 場音樂祭
                    </text>
                    <line x1="12" y1="32" x2={tooltipW - 12} y2="32"
                      stroke="var(--paper-deep)" strokeWidth="0.6" opacity="0.3" />

                    {/* 各節目列 */}
                    {group.map((f, idx) => (
                      <g key={f.id} transform={`translate(0, ${headerH + rowH * idx})`}>
                        {idx > 0 &&
                          <line x1="12" y1="0" x2={tooltipW - 12} y2="0"
                            stroke="var(--paper-deep)" strokeWidth="0.5" opacity="0.18" />
                        }
                        <text x="16" y="22" fontSize="15" fill="var(--bg)"
                          fontFamily="'Noto Serif TC', serif" fontWeight="600">
                          {f.name}
                        </text>
                        <text x={tooltipW - 14} y="22" textAnchor="end" fontSize="12"
                          fill="var(--paper-deep)" fontFamily="'JetBrains Mono', monospace"
                          letterSpacing="1.5">
                          {f.dateStart.slice(5).replace("-", "/")} – {f.dateEnd.slice(5).replace("-", "/")}
                        </text>
                        <text x="16" y="38" fontSize="10" fill="var(--paper-deep)"
                          fontFamily="'JetBrains Mono', monospace" letterSpacing="0.8" opacity="0.55">
                          {f.venue}
                        </text>
                      </g>
                    ))}
                  </g>
                );

              } else {
                /* 單筆資料：放大版 tooltip（比原來更大的字體與框） */
                const w = Math.max(p.name.length * 16, 190) + 44;
                const tx = sideLeft ? -(w + 18) : 18;

                return (
                  <g transform={`translate(${tx}, -46)`}
                    style={{ pointerEvents: "none" }}
                    filter="url(#pinShadow)">
                    <rect x="0" y="0" width={w} height="92" rx="8" fill="var(--ink)" />
                    {/* 節目名稱（放大至 17px） */}
                    <text x="16" y="28" fontSize="17" fill="var(--bg)"
                      fontFamily="'Noto Serif TC', serif" fontWeight="600">
                      {p.name}
                    </text>
                    <line x1="16" y1="40" x2={w - 16} y2="40"
                      stroke="var(--paper-deep)" strokeWidth="0.6" opacity="0.35" />
                    {/* 地區（放大至 12px） */}
                    <text x="16" y="58" fontSize="12" fill="var(--paper-deep)"
                      fontFamily="'JetBrains Mono', monospace" letterSpacing="1.5">
                      {p.region.toUpperCase()}
                    </text>
                    {/* 日期（放大至 12px） */}
                    <text x={w - 16} y="58" textAnchor="end" fontSize="12" fill="var(--paper-deep)"
                      fontFamily="'JetBrains Mono', monospace" letterSpacing="1.5">
                      {p.dateStart.slice(5).replace("-", "/")} – {p.dateEnd.slice(5).replace("-", "/")}
                    </text>
                    {/* 場館（新增，10px） */}
                    <text x="16" y="76" fontSize="11" fill="var(--paper-deep)"
                      fontFamily="'JetBrains Mono', monospace" letterSpacing="0.8" opacity="0.6">
                      {p.venue}
                    </text>
                  </g>
                );
              }
            })()}
          </g>
        );
      })}
    </svg>);

}
