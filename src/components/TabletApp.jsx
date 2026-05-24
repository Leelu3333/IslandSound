// Tablet version — adapted from MS/tablet-app.jsx but using front's TaiwanMap.
// Orientation auto-detected via aspect ratio (passed in as prop).
import { useState, useEffect } from 'react';
import { TaiwanMap } from './TaiwanMap.jsx';
import { REGIONS, MONTHS } from '../data/festivals.js';

function fmtDate(s) {
  const [, m, d] = s.split('-');
  return `${parseInt(m)}.${parseInt(d)}`;
}
function fmtRange(a, b) {
  if (a === b) return fmtDate(a);
  const [, am] = a.split('-');
  const [, bm] = b.split('-');
  if (am === bm) return `${fmtDate(a)} – ${b.split('-')[2]}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}

// ───────── Festival card (tablet) ─────────
function TFestCard({ f, onSave, onOpen }) {
  return (
    <article className="t-card">
      <div className="t-card-ribbon" />
      <div className="t-card-body">
        <header className="t-card-head">
          <div className="t-card-eyebrow mono">
            {f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}
          </div>
          <button
            className={`t-save ${f.saved ? 't-save--on' : ''}`}
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
        <h3 className="t-card-name serif">{f.name}</h3>
        <div className="t-card-name-en mono">{f.nameEn}</div>
        <dl className="t-card-meta">
          <div className="t-meta-row">
            <dt className="mono">DATE</dt>
            <dd>{fmtRange(f.dateStart, f.dateEnd)}</dd>
          </div>
          <div className="t-meta-row">
            <dt className="mono">PLACE</dt>
            <dd>
              {f.region} · {f.venue}
            </dd>
          </div>
        </dl>
        <p className="t-card-blurb">{f.blurb}</p>
        <div className="t-card-foot">
          <button className="t-arrow" onClick={() => onOpen(f.id)}>
            了解更多 →
          </button>
          <span className="t-id mono">No. {f.id.slice(0, 6).toUpperCase()}</span>
        </div>
      </div>
    </article>
  );
}

// ───────── Filter panel (tablet sidebar) ─────────
function TabletFilter({ draft, setDraft, applied, results, onApply, onReset }) {
  // 月份範圍選擇：第一次=設起始，第二次=設結束
  const [pickingEnd, setPickingEnd] = useState(false);
  const handleMonthClick = (m) => {
    if (!pickingEnd) {
      setDraft((s) => ({ ...s, monthStart: m, monthEnd: m }));
      setPickingEnd(true);
    } else {
      setDraft((s) => {
        const start = Math.min(m, s.monthStart);
        const end = Math.max(m, s.monthStart);
        return { ...s, monthStart: start, monthEnd: end };
      });
      setPickingEnd(false);
    }
  };

  return (
    <aside className="t-filter">
      <header className="t-filter-head">
        <div>
          <h2 className="serif">音樂祭尋找器</h2>
          <p className="mono">FILTER · {String(results).padStart(2, '0')} 場結果</p>
        </div>
        <button className="t-reset mono" onClick={onReset}>
          清除
        </button>
      </header>

      <div className="t-search">
        <svg viewBox="0 0 24 24" width="14" height="14">
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
          placeholder="音樂祭、地區、藝人…"
          value={draft.q}
          onChange={(e) => setDraft((s) => ({ ...s, q: e.target.value }))}
        />
      </div>

      <div className="t-filter-section">
        <div className="t-filter-label mono">地區 · REGION</div>
        <div className="t-chips">
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`t-chip ${draft.region === r ? 't-chip--on' : ''}`}
              onClick={() =>
                setDraft((s) => ({ ...s, region: s.region === r ? null : r }))
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="t-filter-section">
        <div className="t-filter-label mono">時間範圍 · TIMEFRAME</div>
        <div
          className={`month-range-hint mono ${pickingEnd ? 'month-range-hint--picking' : ''}`}
          style={{ marginBottom: 8 }}
        >
          {pickingEnd
            ? `起始 ${draft.monthStart} 月 → 點選結束月份`
            : '點選起始月份'}
        </div>
        <div className="month-btns">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isStart = m === draft.monthStart;
            const isEnd = m === draft.monthEnd && m !== draft.monthStart;
            const inRange = m > draft.monthStart && m < draft.monthEnd;
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
        <div className="month-range-display mono" style={{ marginTop: 10 }}>
          {draft.monthStart === draft.monthEnd
            ? `${draft.monthStart} 月`
            : `${draft.monthStart} 月 — ${draft.monthEnd} 月`}
        </div>
      </div>

      <div className="t-filter-actions">
        <button className="btn btn--primary btn--sm btn--grow" onClick={onApply}>
          套用篩選
        </button>
        <button className="btn btn--secondary btn--sm" onClick={onReset}>
          重設
        </button>
      </div>
    </aside>
  );
}

// ───────── Tablet App ─────────
export function TabletApp({
  festivals,
  visible,
  mapMonth,
  setMapMonth,
  hoveredId,
  setHoveredId,
  draft,
  setDraft,
  applied,
  sortMode,
  setSortMode,
  onSave,
  onPinClick,
  onApply,
  onReset,
  onOpen,
  onSubmit,
  user,
  onLogin,
  onLogout,
  savedOnly,
  onToggleSaved,
  onOpenLibrary,
}) {
  // Orientation: portrait (width < height or width <= 1024)
  const [orientation, setOrientation] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= window.innerHeight
      ? 'landscape'
      : 'portrait',
  );
  useEffect(() => {
    const onResize = () =>
      setOrientation(
        window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait',
      );
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const timeLabel =
    applied.monthStart === 1 && applied.monthEnd === 12
      ? '全年'
      : applied.monthStart === applied.monthEnd
        ? `${applied.monthStart} 月`
        : `${applied.monthStart}–${applied.monthEnd} 月`;

  return (
    <div className={`t-app t-app--${orientation}`}>
      {/* Header */}
      <header className="t-header">
        <div className="t-logo">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.2"
            />
            <circle cx="16" cy="16" r="2" fill="var(--ink)" />
            <circle
              cx="16"
              cy="16"
              r="7"
              fill="none"
              stroke="var(--camel)"
              strokeWidth="0.7"
              strokeDasharray="2 2"
            />
          </svg>
          <div className="t-logo-text">
            <div className="serif">島嶼樂遊</div>
            <div className="mono">ISLAND · SOUND</div>
          </div>
        </div>
        <nav className="t-nav">
          <a
            href="#"
            className={`t-nav-link ${savedOnly ? '' : 't-nav-link--on'}`}
            onClick={(e) => { e.preventDefault(); onToggleSaved?.(false); }}
          >
            音樂祭
          </a>
          <a href="#" className="t-nav-link">
            月曆
          </a>
          <a href="#" className="t-nav-link">
            專欄
          </a>
          <a
            href="#"
            className={`t-nav-link ${savedOnly ? 't-nav-link--on' : ''}`}
            onClick={(e) => { e.preventDefault(); onOpenLibrary?.(); }}
          >
            收藏
          </a>
          <button className="btn btn--ghost mono" onClick={onSubmit}>投稿 ↗</button>
          {user ? (
            <div className="auth-chip">
              <span className="auth-chip-avatar" aria-hidden>
                {(user.user_metadata?.name || user.email || '會員').charAt(0)}
              </span>
              <button className="auth-chip-out" onClick={onLogout}>登出</button>
            </div>
          ) : (
            <button className="btn btn--ghost mono" onClick={onLogin}>登入</button>
          )}
        </nav>
      </header>

      {/* Banner */}
      <section className="t-banner">
        <div className="t-banner-text">
          <div className="t-eyebrow mono">2026 / 全島音樂祭索引</div>
          <h1 className="t-title serif">
            循著聲音
            <br />
            走遍島嶼
          </h1>
          <p className="t-lede">
            從北方海岬的浪潮、中部草原的低頻，到南國港邊的吶喊——
            <br />
            一座島，十二個月份，{festivals.length} 場關於聽覺的旅行。
          </p>
          <div className="t-month-strip">
            <div className="t-month-label mono">MONTH</div>
            <div className="t-month-row">
              {MONTHS.map((_, i) => {
                const idx = i + 1;
                const cnt = festivals.filter((f) => f.month === idx).length;
                const isActive = mapMonth === idx;
                return (
                  <button
                    key={idx}
                    className={`t-month-chip ${isActive ? 't-month-chip--on' : ''}`}
                    onClick={() => setMapMonth(idx)}
                    disabled={cnt === 0}
                  >
                    <span>{idx}</span>
                    <i className="t-month-dot" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="t-banner-map">
          <div className="t-map-frame">
            <span className="t-frame-corner" data-pos="tl" />
            <span className="t-frame-corner" data-pos="tr" />
            <span className="t-frame-corner" data-pos="bl" />
            <span className="t-frame-corner" data-pos="br" />
            <TaiwanMap
              pins={festivals}
              activeMonth={mapMonth}
              activeRegion={applied.region}
              onPinClick={onPinClick}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          </div>
        </div>
      </section>

      {/* Split: filter + cards */}
      <div className="t-split">
        <TabletFilter
          draft={draft}
          setDraft={setDraft}
          applied={applied}
          results={visible.length}
          onApply={onApply}
          onReset={onReset}
        />
        <section className="t-results">
          <header className="t-results-head">
            <div>
              <h2 className="serif">音樂祭節目單</h2>
              <p className="mono">
                {String(visible.length).padStart(2, '0')} 場 · {timeLabel}
                {applied.region && ` · ${applied.region}`}
              </p>
            </div>
            <div className="t-sort mono">
              <button
                className={`t-sort-btn ${sortMode === 'date' ? 't-sort-btn--on' : ''}`}
                onClick={() => setSortMode('date')}
              >
                日期
              </button>
              <button
                className={`t-sort-btn ${sortMode === 'region' ? 't-sort-btn--on' : ''}`}
                onClick={() => setSortMode('region')}
              >
                地區
              </button>
              <button
                className={`t-sort-btn ${sortMode === 'saved' ? 't-sort-btn--on' : ''}`}
                onClick={() => setSortMode('saved')}
              >
                收藏
              </button>
            </div>
          </header>
          {visible.length === 0 ? (
            <div className="t-empty">
              <div
                className="serif"
                style={{ fontSize: 48, color: 'var(--ink-faint)' }}
              >
                ○
              </div>
              <h3 className="serif">這個篩選條件下沒有節目</h3>
              <p>試試切換月份，或清除地區篩選。</p>
            </div>
          ) : (
            <div className="t-cards">
              {visible.map((f) => (
                <TFestCard key={f.id} f={f} onSave={onSave} onOpen={onOpen} />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="t-footer">
        <div className="serif">島嶼樂遊</div>
        <div className="mono">
          一份非營利的台灣音樂祭索引 · ISLAND · SOUND · 2026
        </div>
        <div className="mono" style={{ marginTop: '4px', opacity: 0.65 }}>
          如資料有誤，歡迎使用<button onClick={onSubmit} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer', font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}>投稿</button>功能給我們回饋
        </div>
        <div className="t-footer-links mono">
          <a href="#">關於</a>
          <a href="#">聯絡</a>
          <a href="#">Instagram</a>
          <a href="#">Newsletter</a>
        </div>
      </footer>
    </div>
  );
}
