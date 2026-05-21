// Main app — 島嶼樂遊 / Island Sound
import { useState, useMemo, useEffect } from 'react';
import { TaiwanMap } from './components/TaiwanMap.jsx';
import { MobileApp } from './components/MobileApp.jsx';
import { TabletApp } from './components/TabletApp.jsx';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
} from './components/tweaks/TweaksPanel.jsx';
import { REGIONS, MONTHS } from './data/festivals.js';
import { loadFestivals, FALLBACK_FESTIVALS } from './lib/loadFestivals.js';

// ───────────────────────── Responsive hook ─────────────────────────
// 回傳 'mobile' (<768)、'tablet' (768–1279)、'desktop' (>=1280)
function useViewport() {
  const compute = (w) => {
    if (w < 768) return 'mobile';
    if (w < 1280) return 'tablet';
    return 'desktop';
  };
  const [vp, setVp] = useState(() =>
    typeof window !== 'undefined' ? compute(window.innerWidth) : 'desktop',
  );
  useEffect(() => {
    const onResize = () => setVp(compute(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
}

const PALETTES = {
  warm: {
    bg: '#FAF7F2',
    paper: '#F1EBE0',
    paperDeep: '#E7DFCF',
    ink: '#2A2622',
    inkSoft: '#6B5F50',
    inkFaint: '#C9BFAF',
    camel: '#B89B7A',
    camelDeep: '#8C6F50',
    accent: '#7C8A4E', // olive
  },
  moss: {
    bg: '#F4F2EB',
    paper: '#E8E8DA',
    paperDeep: '#D9DCC4',
    ink: '#1F2A22',
    inkSoft: '#5A6553',
    inkFaint: '#B8BFA9',
    camel: '#8B9670',
    camelDeep: '#5E6B49',
    accent: '#A6543B', // terracotta
  },
  dusk: {
    bg: '#F2F0F1',
    paper: '#E6E2E4',
    paperDeep: '#D5CFD3',
    ink: '#262128',
    inkSoft: '#5E5562',
    inkFaint: '#BFB6BF',
    camel: '#8C7A91',
    camelDeep: '#5F4F66',
    accent: '#C49362', // amber
  },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  palette: 'warm',
  density: 'comfortable',
  showSerif: true,
}; /*EDITMODE-END*/

function applyPalette(name) {
  const p = PALETTES[name] || PALETTES.warm;
  const root = document.documentElement;
  root.style.setProperty('--bg', p.bg);
  root.style.setProperty('--paper', p.paper);
  root.style.setProperty('--paper-deep', p.paperDeep);
  root.style.setProperty('--ink', p.ink);
  root.style.setProperty('--ink-soft', p.inkSoft);
  root.style.setProperty('--ink-faint', p.inkFaint);
  root.style.setProperty('--camel', p.camel);
  root.style.setProperty('--camel-deep', p.camelDeep);
  root.style.setProperty('--accent', p.accent);
}

function fmtDate(s) {
  const [y, m, d] = s.split('-');
  return `${parseInt(m)}.${parseInt(d)}`;
}
function fmtRange(a, b) {
  if (a === b) return fmtDate(a);
  const [, am] = a.split('-');
  const [, bm] = b.split('-');
  if (am === bm) return `${fmtDate(a)} – ${b.split('-')[2]}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}

// ───────────────────────── Header ─────────────────────────
function Header() {
  return (
    <header className="site-header">
      <div className="logo">
        <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <circle cx="20" cy="20" r="2.5" fill="var(--ink)" />
          <path
            d="M 20 6 L 20 12 M 20 28 L 20 34 M 6 20 L 12 20 M 28 20 L 34 20"
            stroke="var(--ink)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle
            cx="20"
            cy="20"
            r="9"
            fill="none"
            stroke="var(--camel)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </svg>
        <div className="logo-text">
          <div className="logo-title serif">島嶼樂遊</div>
          <div className="logo-sub mono">ISLAND · SOUND</div>
        </div>
      </div>
      <nav className="site-nav">
        <a href="#" className="nav-link nav-link--active">
          音樂祭
        </a>
        <a href="#" className="nav-link">
          月曆
        </a>
        <a href="#" className="nav-link">
          專欄
        </a>
        <a href="#" className="nav-link">
          收藏
        </a>
        <button className="btn-ghost mono">投稿 ↗</button>
      </nav>
    </header>
  );
}

// ───────────────────────── Banner with map ─────────────────────────
function Banner({
  activeMonth,
  setActiveMonth,
  festivals,
  activeRegion,
  setActiveRegion,
  onPinClick,
  hoveredId,
  setHoveredId,
}) {
  const monthCount = festivals.filter((f) => f.month === activeMonth).length;
  const totalCount = festivals.length;

  return (
    <section className="banner">
      <div className="banner-text">
        <div className="banner-eyebrow mono">2026 / 全島音樂祭索引</div>
        <h1 className="banner-title serif">
          循著聲音
          <br />
          走遍島嶼
        </h1>
        <p className="banner-lede">
          從北方海岬的浪潮、中部草原的低頻，到南國港邊的吶喊——
          <br />
          一座島，十二個月份，{totalCount} 場關於聽覺的旅行。
        </p>

        <div className="month-strip">
          <div className="month-strip-label mono">MONTH</div>
          <div className="month-strip-row">
            {MONTHS.map((m, i) => {
              const idx = i + 1;
              const cnt = festivals.filter((f) => f.month === idx).length;
              const isActive = activeMonth === idx;
              return (
                <button
                  key={idx}
                  className={`month-chip ${isActive ? 'month-chip--active' : ''}`}
                  onClick={() => setActiveMonth(idx)}
                  disabled={cnt === 0}
                >
                  <span className="month-chip-num">{idx}</span>
                  <span className="month-chip-dot" data-count={cnt} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="banner-stats">
          <div className="stat">
            <div className="stat-num serif">
              {String(monthCount).padStart(2, '0')}
            </div>
            <div className="stat-label mono">
              場 · {MONTHS[activeMonth - 1]}
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-num serif">
              {String(totalCount).padStart(2, '0')}
            </div>
            <div className="stat-label mono">場 · 全年</div>
          </div>
        </div>
      </div>

      <div className="banner-map">
        <div className="map-frame" style={{ height: '800px' }}>
          <div className="map-frame-corner" data-pos="tl" />
          <div className="map-frame-corner" data-pos="tr" />
          <div className="map-frame-corner" data-pos="bl" />
          <div className="map-frame-corner" data-pos="br" />
          <TaiwanMap
            pins={festivals}
            activeMonth={activeMonth}
            activeRegion={activeRegion}
            onPinClick={onPinClick}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Filter panel ─────────────────────────
function FilterPanel({ state, setState, results, onApply, onReset }) {
  const [open, setOpen] = useState({ region: true, time: true });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // 單排月份選擇：第一次點選 = 設起始，第二次點選 = 設結束
  const [pickingEnd, setPickingEnd] = useState(false);
  const handleMonthClick = (m) => {
    if (!pickingEnd) {
      // 第一步：設起始，同時把結束也暫時設為同一月
      setState((s) => ({ ...s, monthStart: m, monthEnd: m }));
      setPickingEnd(true);
    } else {
      // 第二步：設結束（若點選月份 < 起始則自動對調）
      setState((s) => {
        const start = Math.min(m, s.monthStart);
        const end = Math.max(m, s.monthStart);
        return { ...s, monthStart: start, monthEnd: end };
      });
      setPickingEnd(false);
    }
  };

  return (
    <aside className="filter-panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-title serif">篩選器</h2>
          <p className="panel-sub mono">
            FILTER · {String(results).padStart(2, '0')} 場結果
          </p>
        </div>
        <button className="link-reset mono" onClick={onReset}>
          清除
        </button>
      </div>

      {/* Search input */}
      <div className="search-box">
        <svg viewBox="0 0 24 24" width="16" height="16" className="search-icon">
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <line
            x1="15.5"
            y1="15.5"
            x2="20"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="搜尋音樂祭、地區、藝人…"
          value={state.q}
          onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
        />

        {state.q && (
          <button
            className="search-clear"
            onClick={() => setState((s) => ({ ...s, q: '' }))}
          >
            ×
          </button>
        )}
      </div>

      {/* Region filter */}
      <FilterSection
        label="地區"
        sublabel="REGION"
        open={open.region}
        onToggle={() => toggle('region')}
        active={state.region}
      >
        <div className="chip-grid">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`chip ${state.region === r ? 'chip--active' : ''}`}
              onClick={() =>
                setState((s) => ({ ...s, region: s.region === r ? null : r }))
              }
            >
              {r}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Month range picker */}
      <FilterSection
        label="時間範圍"
        sublabel="TIMEFRAME"
        open={open.time}
        onToggle={() => toggle('time')}
      >
        <div className="month-range-picker">
          {/* 提示文字：目前處於哪一步 */}
          <div
            className={`month-range-hint mono ${pickingEnd ? 'month-range-hint--picking' : ''}`}
          >
            {pickingEnd
              ? `起始 ${state.monthStart} 月 → 點選結束月份`
              : '點選起始月份'}
          </div>

          {/* 單排 12 個月按鈕 */}
          <div className="month-btns">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isStart = m === state.monthStart;
              const isEnd = m === state.monthEnd && m !== state.monthStart;
              const inRange = m > state.monthStart && m < state.monthEnd;
              return (
                <button
                  key={m}
                  className={[
                    'mbtn',
                    isStart ? 'mbtn--start' : '',
                    isEnd ? 'mbtn--end' : '',
                    inRange ? 'mbtn--in' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleMonthClick(m)}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* 目前範圍顯示 */}
          <div className="month-range-display mono">
            {state.monthStart === state.monthEnd
              ? `${state.monthStart} 月`
              : `${state.monthStart} 月 — ${state.monthEnd} 月`}
          </div>
        </div>
      </FilterSection>

      <div className="panel-actions">
        <button className="btn-primary" onClick={onApply}>
          套用篩選
        </button>
        <button className="btn-secondary" onClick={onReset}>
          重設
        </button>
      </div>

      <div className="panel-footnote mono">
        ※ 資料每週一更新 · 末次同步 04 / 28
      </div>
    </aside>
  );
}

function FilterSection({ label, sublabel, open, onToggle, active, children }) {
  return (
    <div className={`filter-section ${open ? 'filter-section--open' : ''}`}>
      <button className="section-head" onClick={onToggle}>
        <div className="section-head-text">
          <span className="section-label">{label}</span>
          <span className="section-sub mono">{sublabel}</span>
        </div>
        <div className="section-head-right">
          {active && <span className="section-badge">{active}</span>}
          <span className="section-caret">{open ? '−' : '+'}</span>
        </div>
      </button>
      <div className="section-body">{children}</div>
    </div>
  );
}

// ───────────────────────── Festival card ─────────────────────────
function FestivalCard({ f, isHovered, setHoveredId, onSave, onDetail }) {
  return (
    <article
      className={`fest-card ${isHovered ? 'fest-card--hover' : ''}`}
      onMouseEnter={() => setHoveredId(f.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="fest-card-ribbon" />
      <div className="fest-card-body">
        <header className="fest-card-head">
          <div className="fest-card-eyebrow mono">
            {f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}
          </div>
          <button
            className={`save-btn ${f.saved ? 'save-btn--on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(f.id);
            }}
            aria-label="收藏"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z"
                fill={f.saved ? 'var(--accent)' : 'none'}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <h3 className="fest-name serif">{f.name}</h3>
        <div className="fest-name-en mono">{f.nameEn}</div>

        <dl className="fest-meta">
          <div className="meta-row">
            <dt className="mono">DATE</dt>
            <dd>{fmtRange(f.dateStart, f.dateEnd)}</dd>
          </div>
          <div className="meta-row">
            <dt className="mono">PLACE</dt>
            <dd>
              {f.region} · {f.venue}
            </dd>
          </div>
        </dl>

        <p className="fest-blurb">{f.blurb}</p>

        <div className="fest-artists">
          <div className="fest-artists-label mono">LINEUP</div>
          <div className="fest-artists-list" title={f.artists.join(' · ')}>
            {f.artists.map((a, i) => (
              <span key={a} className="artist-tag">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="fest-card-foot">
          <button className="link-detail" onClick={onDetail}>
            了解更多 <span className="arrow">→</span>
          </button>
          <span className="fest-id mono">
            No. {f.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
}

function ResultsPanel({
  festivals,
  sortMode,
  setSortMode,
  hoveredId,
  setHoveredId,
  onSave,
  activeRegion,
  monthStart,
  monthEnd,
}) {
  const [viewMode, setViewMode] = useState('grid');

  // 時間範圍顯示文字
  const timeLabel =
    monthStart === 1 && monthEnd === 12
      ? '全年'
      : monthStart === monthEnd
        ? `${monthStart} 月`
        : `${monthStart}–${monthEnd} 月`;

  return (
    <section className="results-panel">
      <div className="results-head">
        <div>
          <h2 className="results-title serif">節目單</h2>
          <p className="results-sub">
            {timeLabel}
            {activeRegion && ` · ${activeRegion}`}
            <span className="mono"> · {festivals.length} 場</span>
          </p>
        </div>
        <div className="results-tools">
          <div className="sort-group mono">
            <button
              className={`sort-btn ${sortMode === 'date' ? 'sort-btn--on' : ''}`}
              onClick={() => setSortMode('date')}
            >
              日期
            </button>
            <button
              className={`sort-btn ${sortMode === 'region' ? 'sort-btn--on' : ''}`}
              onClick={() => setSortMode('region')}
            >
              地區
            </button>
            <button
              className={`sort-btn ${sortMode === 'saved' ? 'sort-btn--on' : ''}`}
              onClick={() => setSortMode('saved')}
            >
              收藏
            </button>
          </div>
          <div className="view-group mono">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'view-btn--on' : ''}`}
              aria-label="grid"
              onClick={() => setViewMode('grid')}
            >
              <svg viewBox="0 0 16 16" width="14" height="14">
                <rect
                  x="1"
                  y="1"
                  width="6"
                  height="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="9"
                  y="1"
                  width="6"
                  height="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="1"
                  y="9"
                  width="6"
                  height="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  x="9"
                  y="9"
                  width="6"
                  height="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'view-btn--on' : ''}`}
              aria-label="list"
              onClick={() => setViewMode('list')}
            >
              <svg viewBox="0 0 16 16" width="14" height="14">
                <line
                  x1="2"
                  y1="4"
                  x2="14"
                  y2="4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line
                  x1="2"
                  y1="8"
                  x2="14"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line
                  x1="2"
                  y1="12"
                  x2="14"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {festivals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-mark serif">○</div>
          <h3 className="serif">這個篩選條件下沒有節目</h3>
          <p>試試切換月份，或清除地區篩選。</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="card-grid">
          {festivals.map((f) => (
            <FestivalCard
              key={f.id}
              f={f}
              isHovered={hoveredId === f.id}
              setHoveredId={setHoveredId}
              onSave={onSave}
              onDetail={() => {}}
            />
          ))}
        </div>
      ) : (
        <FestivalList
          festivals={festivals}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSave={onSave}
        />
      )}
    </section>
  );
}

// ───────────────────────── Festival list (table-ish) ─────────────────────────
function FestivalList({ festivals, hoveredId, setHoveredId, onSave }) {
  return (
    <div className="fest-list">
      <div className="fest-list-head mono">
        <span className="col-date">日期</span>
        <span className="col-name">音樂祭</span>
        <span className="col-region">地區</span>
        <span className="col-venue">場地</span>
        <span className="col-artists">主要藝人</span>
        <span className="col-action"></span>
      </div>
      {festivals.map((f, i) => {
        const isHovered = hoveredId === f.id;
        return (
          <div
            key={f.id}
            className={`fest-list-row ${isHovered ? 'fest-list-row--hover' : ''}`}
            onMouseEnter={() => setHoveredId(f.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="col-num mono">{String(i + 1).padStart(2, '0')}</span>
            <div className="col-date">
              <div className="list-date serif">{fmtRange(f.dateStart, f.dateEnd)}</div>
              <div className="list-date-sub mono">{f.dateStart.slice(0, 4)}</div>
            </div>
            <div className="col-name">
              <div className="list-name serif">{f.name}</div>
              <div className="list-name-en mono">{f.nameEn}</div>
            </div>
            <div className="col-region">{f.region}</div>
            <div className="col-venue">{f.venue}</div>
            <div className="col-artists" title={f.artists.join(' · ')}>
              {f.artists.map((a, j) => (
                <span key={a}>
                  {a}
                  {j < f.artists.length - 1 && <span className="dot-sep"> · </span>}
                </span>
              ))}
            </div>
            <div className="col-action">
              <button
                className={`save-btn save-btn--sm ${f.saved ? 'save-btn--on' : ''}`}
                onClick={() => onSave(f.id)}
                aria-label="收藏"
              >
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z"
                    fill={f.saved ? 'var(--accent)' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="list-detail-btn" aria-label="詳情">
                →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Custom palette picker (3 stacked swatch rows)
function PalettePicker({ value, onChange }) {
  const opts = [
    {
      v: 'warm',
      label: 'Warm camel',
      colors: ['#FAF7F2', '#F1EBE0', '#B89B7A', '#7C8A4E', '#2A2622'],
    },
    {
      v: 'moss',
      label: 'Moss field',
      colors: ['#F4F2EB', '#E8E8DA', '#8B9670', '#A6543B', '#1F2A22'],
    },
    {
      v: 'dusk',
      label: 'Dusk plum',
      colors: ['#F2F0F1', '#E6E2E4', '#8C7A91', '#C49362', '#262128'],
    },
  ];

  return (
    <div className="palette-picker">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          className={`palette-row ${value === o.v ? 'palette-row--on' : ''}`}
          onClick={() => onChange(o.v)}
        >
          <div className="palette-swatches">
            {o.colors.map((c, i) => (
              <span key={i} style={{ background: c }} />
            ))}
          </div>
          <div className="palette-name">{o.label}</div>
          {value === o.v && <div className="palette-check">✓</div>}
        </button>
      ))}
    </div>
  );
}

// ───────────────────────── App root ─────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => applyPalette(t.palette), [t.palette]);
  useEffect(() => {
    document.documentElement.dataset.density = t.density;
    document.documentElement.dataset.serif = t.showSerif ? 'on' : 'off';
  }, [t.density, t.showSerif]);

  const viewport = useViewport(); // 'mobile' | 'tablet' | 'desktop'

  const [festivals, setFestivals] = useState(FALLBACK_FESTIVALS);

  // 啟動時非同步從 Supabase 撈，成功就覆蓋本機資料
  useEffect(() => {
    loadFestivals().then((rows) => {
      if (rows) setFestivals(rows);
    });
  }, []);
  const [mapMonth, setMapMonth] = useState(4);
  const [hoveredId, setHoveredId] = useState(null);
  const [sortMode, setSortMode] = useState('date');

  const BLANK_FILTER = {
    q: '',
    region: null,
    genres: [],
    monthStart: 1,
    monthEnd: 12,
  };

  // draft：FilterPanel 編輯中的暫存狀態，不影響結果清單
  // applied：點「套用篩選」後才生效，用於計算 visible
  const [draft, setDraft] = useState({ ...BLANK_FILTER });
  const [applied, setApplied] = useState({ ...BLANK_FILTER });

  const visible = useMemo(() => {
    let out = festivals.slice();
    if (applied.region) out = out.filter((f) => f.region === applied.region);
    if (applied.genres.length)
      out = out.filter((f) => applied.genres.includes(f.genre));
    if (applied.q.trim()) {
      const q = applied.q.trim().toLowerCase();
      out = out.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.nameEn.toLowerCase().includes(q) ||
          f.region.includes(applied.q.trim()) ||
          f.artists.some((a) => a.includes(applied.q.trim())),
      );
    }
    // 月份範圍篩選
    out = out.filter(
      (f) => f.month >= applied.monthStart && f.month <= applied.monthEnd,
    );
    if (sortMode === 'date')
      out.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
    if (sortMode === 'region')
      out.sort((a, b) => a.region.localeCompare(b.region));
    if (sortMode === 'saved')
      out.sort((a, b) => Number(b.saved) - Number(a.saved));
    return out;
  }, [festivals, applied, sortMode]);

  const handleSave = (id) => {
    setFestivals((fs) =>
      fs.map((f) => (f.id === id ? { ...f, saved: !f.saved } : f)),
    );
  };
  // 地圖 pin 點擊：同時更新 draft 和 applied（即時生效）
  const handlePinClick = (p) => {
    const newRegion = applied.region === p.region ? null : p.region;
    setDraft((d) => ({ ...d, region: newRegion }));
    setApplied((a) => ({ ...a, region: newRegion }));
    document
      .querySelector('.results-panel')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // 套用篩選：把 draft 複製到 applied
  const handleApply = () => setApplied({ ...draft });
  // 重設：清除 draft 和 applied
  const handleReset = () => {
    setDraft({ ...BLANK_FILTER });
    setApplied({ ...BLANK_FILTER });
  };

  // ──── Mobile branch (<768px) ────
  if (viewport === 'mobile') {
    return (
      <div className="app">
        <MobileApp
          festivals={festivals}
          visible={visible}
          mapMonth={mapMonth}
          setMapMonth={setMapMonth}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          draft={draft}
          setDraft={setDraft}
          applied={applied}
          onSave={handleSave}
          onPinClick={handlePinClick}
          onApply={handleApply}
          onReset={handleReset}
        />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Palette">
            <PalettePicker
              value={t.palette}
              onChange={(v) => setTweak('palette', v)}
            />
          </TweakSection>
        </TweaksPanel>
      </div>
    );
  }

  // ──── Tablet branch (768–1279px) ────
  if (viewport === 'tablet') {
    return (
      <div className="app">
        <TabletApp
          festivals={festivals}
          visible={visible}
          mapMonth={mapMonth}
          setMapMonth={setMapMonth}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          draft={draft}
          setDraft={setDraft}
          applied={applied}
          sortMode={sortMode}
          setSortMode={setSortMode}
          onSave={handleSave}
          onPinClick={handlePinClick}
          onApply={handleApply}
          onReset={handleReset}
        />
        <TweaksPanel title="Tweaks">
          <TweakSection label="Palette">
            <PalettePicker
              value={t.palette}
              onChange={(v) => setTweak('palette', v)}
            />
          </TweakSection>
        </TweaksPanel>
      </div>
    );
  }

  // ──── Desktop branch (>=1280px) ────
  return (
    <div className="app">
      <Header />
      <Banner
        activeMonth={mapMonth}
        setActiveMonth={setMapMonth}
        festivals={festivals}
        activeRegion={applied.region}
        setActiveRegion={(r) => {
          setDraft((d) => ({ ...d, region: r }));
          setApplied((a) => ({ ...a, region: r }));
        }}
        onPinClick={handlePinClick}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
      />

      <div className="split">
        <FilterPanel
          state={draft}
          setState={setDraft}
          results={visible.length}
          onApply={handleApply}
          onReset={handleReset}
        />

        <ResultsPanel
          festivals={visible}
          sortMode={sortMode}
          setSortMode={setSortMode}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSave={handleSave}
          activeRegion={applied.region}
          monthStart={applied.monthStart}
          monthEnd={applied.monthEnd}
        />
      </div>

      <footer className="site-footer">
        <div className="footer-left">
          <div className="serif">島嶼樂遊</div>
          <div className="mono">ISLAND · SOUND · 2026</div>
        </div>
        <div className="footer-mid mono">
          一份非營利的台灣音樂祭索引 · 由樂迷編輯與維護
        </div>
        <div className="footer-right mono">
          <a href="#">關於</a>
          <a href="#">聯絡</a>
          <a href="#">Instagram</a>
          <a href="#">Newsletter</a>
        </div>
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <PalettePicker
            value={t.palette}
            onChange={(v) => setTweak('palette', v)}
          />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio
            label="Density"
            value={t.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { label: 'Spacious', value: 'comfortable' },
              { label: 'Compact', value: 'compact' },
            ]}
          />

          <TweakToggle
            label="Serif headings"
            value={t.showSerif}
            onChange={(v) => setTweak('showSerif', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

export default App;
