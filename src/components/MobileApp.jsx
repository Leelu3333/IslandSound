// Mobile version — adapted from MN/mobile-app.jsx but using front's TaiwanMap.
// Reuses the same data & state from desktop App.jsx (passed in as props).
import { useState } from 'react';
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

// ───────── Festival card (mobile) ─────────
function MFestCard({ f, onSave, onOpen }) {
  return (
    <article className="m-card">
      <div className="m-card-ribbon" />
      <header className="m-card-head">
        <div className="m-card-eyebrow mono">
          {f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}
        </div>
        <button
          className={`m-save ${f.saved ? 'm-save--on' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(f.id);
          }}
          aria-label="收藏"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z"
              fill={f.saved ? 'var(--accent)' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>
      <h3 className="m-card-name serif">{f.name}</h3>
      <div className="m-card-name-en mono">{f.nameEn}</div>
      <dl className="m-card-meta">
        <div className="m-meta-row">
          <dt className="mono">DATE</dt>
          <dd>{fmtRange(f.dateStart, f.dateEnd)}</dd>
        </div>
        <div className="m-meta-row">
          <dt className="mono">PLACE</dt>
          <dd>
            {f.region} · {f.venue}
          </dd>
        </div>
      </dl>
      <p className="m-card-blurb">{f.blurb}</p>
      <div className="m-card-foot">
        <button className="m-arrow serif" onClick={() => onOpen(f.id)}>
          了解更多 →
        </button>
        <span className="m-id mono">No. {f.id.slice(0, 6).toUpperCase()}</span>
      </div>
    </article>
  );
}

// ───────── Filter sheet (bottom modal) ─────────
function FilterSheet({ open, onClose, draft, setDraft, onApply, onReset }) {
  // 月份範圍選擇：第一次點選 = 設起始，第二次 = 設結束
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
    <>
      <div
        className={`m-sheet-backdrop ${open ? 'is-open' : ''}`}
        onClick={onClose}
      />
      <div className={`m-sheet ${open ? 'is-open' : ''}`}>
        <div className="m-sheet-handle" />
        <header className="m-sheet-head">
          <h2 className="serif">篩選</h2>
          <button className="m-sheet-close mono" onClick={onClose}>
            完成
          </button>
        </header>

        <div className="m-sheet-section">
          <div className="m-sheet-label mono">搜尋</div>
          <div className="m-search">
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
        </div>

        <div className="m-sheet-section">
          <div className="m-sheet-label mono">地區</div>
          <div className="m-chips">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`m-chip ${draft.region === r ? 'm-chip--on' : ''}`}
                onClick={() =>
                  setDraft((s) => ({ ...s, region: s.region === r ? null : r }))
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="m-sheet-section">
          <div className="m-sheet-label mono">時間範圍</div>
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

        <div className="m-sheet-actions">
          <button className="btn btn--secondary btn--lg" onClick={onReset}>
            重設
          </button>
          <button
            className="btn btn--primary btn--lg btn--grow"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            套用篩選
          </button>
        </div>
      </div>
    </>
  );
}

// ───────── Mobile App ─────────
export function MobileApp({
  festivals,
  visible,
  mapMonth,
  setMapMonth,
  hoveredId,
  setHoveredId,
  draft,
  setDraft,
  applied,
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeCount = visible.length;
  const displayName = user?.user_metadata?.name || user?.email || '會員';

  // 時間範圍顯示文字
  const timeLabel =
    applied.monthStart === 1 && applied.monthEnd === 12
      ? '全年'
      : applied.monthStart === applied.monthEnd
        ? `${applied.monthStart} 月`
        : `${applied.monthStart}–${applied.monthEnd} 月`;

  const hasActiveFilter =
    applied.region ||
    applied.q ||
    applied.monthStart !== 1 ||
    applied.monthEnd !== 12;

  return (
    <div className="m-app">
      {/* Header */}
      <header className="m-header">
        <button
          className="m-icon-btn"
          aria-label="選單"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="13" x2="20" y2="13" />
            <line x1="4" y1="19" x2="14" y2="19" />
          </svg>
        </button>
        <div className="m-logo">
          <span className="serif">島嶼樂遊</span>
          <span className="mono">ISLAND · SOUND</span>
        </div>
        <span className="m-icon-btn" aria-hidden="true" style={{ visibility: 'hidden' }} />
      </header>

      {/* 導覽選單 */}
      <div
        className={`m-nav-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <nav className={`m-nav-menu ${menuOpen ? 'is-open' : ''}`} aria-label="主選單">
        <div className="m-nav-top">
          <div className="m-nav-brand">
            <span className="serif">島嶼樂遊</span>
            <span className="mono">ISLAND · SOUND</span>
          </div>
          <button className="m-nav-close" onClick={() => setMenuOpen(false)} aria-label="關閉選單">×</button>
        </div>
        <div className="m-nav-links">
          <a
            href="#"
            className={`m-nav-link ${savedOnly ? '' : 'm-nav-link--on'}`}
            onClick={(e) => { e.preventDefault(); onToggleSaved?.(false); setMenuOpen(false); }}
          >
            <span className="serif">音樂祭</span><span className="mono">FESTIVALS</span>
          </a>
          <a href="#" className="m-nav-link" onClick={() => setMenuOpen(false)}>
            <span className="serif">月曆</span><span className="mono">CALENDAR</span>
          </a>
          <a href="#" className="m-nav-link" onClick={() => setMenuOpen(false)}>
            <span className="serif">專欄</span><span className="mono">COLUMN</span>
          </a>
          <a
            href="#"
            className={`m-nav-link ${savedOnly ? 'm-nav-link--on' : ''}`}
            onClick={(e) => { e.preventDefault(); onOpenLibrary?.(); setMenuOpen(false); }}
          >
            <span className="serif">收藏</span><span className="mono">SAVED</span>
          </a>
        </div>
        <button
          className="btn btn--primary btn--block m-nav-submit"
          onClick={() => { setMenuOpen(false); onSubmit(); }}
        >投稿 ↗</button>
        {user ? (
          <button
            className="btn btn--ghost btn--block m-nav-login"
            onClick={() => { setMenuOpen(false); onLogout?.(); }}
          >登出（{displayName}）</button>
        ) : (
          <button
            className="btn btn--ghost btn--block m-nav-login"
            onClick={() => { setMenuOpen(false); onLogin?.(); }}
          >登入</button>
        )}
      </nav>

      {/* Banner */}
      <section className="m-banner">
        <div className="m-eyebrow mono">2026 / 全島音樂祭索引</div>
        <h1 className="m-title serif">
          循著聲音
          <br />
          走遍島嶼
        </h1>
        <p className="m-lede">
          從北方海岬到南國港邊——一座島，{festivals.length} 場關於聽覺的旅行。
        </p>
      </section>

      {/* Month strip */}
      <div className="m-month-strip">
        <div className="m-month-strip-label mono">MONTH · 點選查看地圖</div>
        <div className="m-month-row">
          {MONTHS.map((_, i) => {
            const idx = i + 1;
            const cnt = festivals.filter((f) => f.month === idx).length;
            const isActive = mapMonth === idx;
            return (
              <button
                key={idx}
                className={`m-month-chip ${isActive ? 'm-month-chip--on' : ''}`}
                onClick={() => setMapMonth(idx)}
                disabled={cnt === 0}
              >
                <span>{idx}</span>
                <i className="m-month-dot" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Map — uses front's TaiwanMap, scaled */}
      <section className="m-map-section">
        <TaiwanMap
          pins={festivals}
          activeMonth={mapMonth}
          activeRegion={applied.region}
          onPinClick={onPinClick}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      </section>

      {/* Results header + filter trigger */}
      <div className="m-results-head">
        <div>
          <h2 className="serif">音樂祭尋找器</h2>
          <p className="mono">
            {String(activeCount).padStart(2, '0')} 場結果 · {timeLabel}
            {applied.region && ` · ${applied.region}`}
          </p>
        </div>
        <button className="m-filter-btn" onClick={() => setSheetOpen(true)}>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="8" y2="18" />
            <circle cx="17" cy="6" r="2" fill="currentColor" />
            <circle cx="11" cy="12" r="2" fill="currentColor" />
            <circle cx="5" cy="18" r="2" fill="currentColor" />
          </svg>
          <span>篩選</span>
          {hasActiveFilter && <span className="m-filter-dot" />}
        </button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilter && (
        <div className="m-active-filters">
          {applied.region && (
            <button
              className="m-active-chip"
              onClick={() => {
                setDraft((d) => ({ ...d, region: null }));
                onApply();
              }}
            >
              {applied.region} ×
            </button>
          )}
          {applied.q && (
            <button
              className="m-active-chip"
              onClick={() => {
                setDraft((d) => ({ ...d, q: '' }));
                onApply();
              }}
            >
              "{applied.q}" ×
            </button>
          )}
          {(applied.monthStart !== 1 || applied.monthEnd !== 12) && (
            <button
              className="m-active-chip"
              onClick={() => {
                setDraft((d) => ({ ...d, monthStart: 1, monthEnd: 12 }));
                onApply();
              }}
            >
              {timeLabel} ×
            </button>
          )}
          <button
            className="m-active-chip m-active-chip--clear"
            onClick={onReset}
            aria-label="清除所有篩選"
          >
            清除全部 ×
          </button>
        </div>
      )}

      {/* Cards */}
      <section className="m-cards">
        {visible.length === 0 ? (
          <div className="m-empty">
            <div
              className="serif"
              style={{ fontSize: 48, color: 'var(--ink-faint)' }}
            >
              ○
            </div>
            <h3 className="serif">沒有符合的節目</h3>
            <p>試試清除地區篩選</p>
          </div>
        ) : (
          visible.map((f) => (
            <MFestCard key={f.id} f={f} onSave={onSave} onOpen={onOpen} />
          ))
        )}
      </section>

      {/* Footer */}
      <footer className="m-footer">
        <div className="serif">島嶼樂遊</div>
        <div className="mono">ISLAND · SOUND · 2026</div>
        <div className="mono" style={{ marginTop: '4px', opacity: 0.6, fontSize: '9px' }}>
          如資料有誤，歡迎使用<button onClick={onSubmit} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer', font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}>投稿</button>功能給我們回饋
        </div>
        <div className="m-footer-links mono">
          <a href="#">關於</a>
          <a href="#">聯絡</a>
          <a href="#">Instagram</a>
        </div>
      </footer>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        draft={draft}
        setDraft={setDraft}
        onApply={onApply}
        onReset={onReset}
      />
    </div>
  );
}
