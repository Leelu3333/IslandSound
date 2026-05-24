// LibraryPage — 島嶼樂遊 / Island Sound 我的收藏（整頁）
// 視覺移植自 MK/library.jsx，但接上專案真實資料：
//   · 收藏清單 = festivals 過濾 savedIds（與 App 的單一真實來源同步）
//   · 移除收藏 = onToggleSave（會寫回 Supabase / 訪客 localStorage）
//   · 推薦 = 由真實 festivals 計算
//   · 筆記 / 收藏時間 / 標籤：資料庫尚無欄位，先以 localStorage 佔位（per 使用者本地）
//   · 行事曆同步 / 分享：佔位按鈕（之後再接）
import { useState, useMemo, useCallback } from 'react';
import { GENRES, MONTHS } from '../data/festivals.js';
import { displayNameOf } from '../lib/auth.js';
import './LibraryPage.css';

// ── 今天（用真實日期，倒數才會準）──
const TODAY = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();
const CURRENT_MONTH = new Date().getMonth() + 1;

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}
function fmtDate(s) {
  const [, m, d] = s.split('-');
  return `${parseInt(m, 10)}.${parseInt(d, 10)}`;
}
function fmtRange(a, b) {
  if (a === b) return fmtDate(a);
  const [, am] = a.split('-');
  const [, bm] = b.split('-');
  if (am === bm) return `${fmtDate(a)}–${b.split('-')[2]}`;
  return `${fmtDate(a)}–${fmtDate(b)}`;
}
function fmtSavedAt(s) {
  const [y, m, d] = s.split('-');
  return `${y}.${m}.${d}`;
}

// ── 本地佔位 meta（筆記 / 收藏時間 / 標籤）──
const META_KEY = 'island-sound:lib-meta';
function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}
function saveMeta(obj) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(obj));
  } catch {
    /* 隱私模式時略過 */
  }
}

// ─── Header（沿用 src 共用 class，與首頁一致）──────────────
function Header({ user, onNavigateHome, onLogin, onLogout, onSubmit }) {
  return (
    <header className="site-header">
      <a
        href="#"
        className="logo"
        style={{ textDecoration: 'none' }}
        onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
      >
        <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden>
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
          <circle cx="20" cy="20" r="2.5" fill="var(--ink)" />
          <path d="M 20 6 L 20 12 M 20 28 L 20 34 M 6 20 L 12 20 M 28 20 L 34 20" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="9" fill="none" stroke="var(--camel)" strokeWidth="0.8" strokeDasharray="2 2" />
        </svg>
        <div className="logo-text">
          <div className="logo-title serif">島嶼樂遊</div>
          <div className="logo-sub mono">ISLAND · SOUND</div>
        </div>
      </a>
      <nav className="site-nav">
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>音樂祭</a>
        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>月曆</a>
        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>專欄</a>
        <a href="#" className="nav-link nav-link--active" onClick={(e) => e.preventDefault()}>收藏</a>
        <button className="btn btn--ghost mono" onClick={onSubmit}>投稿 ↗</button>
        {user ? (
          <div className="auth-chip">
            <span className="auth-chip-avatar" aria-hidden>{displayNameOf(user).charAt(0)}</span>
            <span className="auth-chip-email mono">{displayNameOf(user)}</span>
            <button className="auth-chip-out" onClick={onLogout}>登出</button>
          </div>
        ) : (
          <button className="btn btn--ghost mono" onClick={onLogin}>登入</button>
        )}
      </nav>
    </header>
  );
}

// ─── Banner ────────────────────────────────────────────────
function Banner({ saved, nextUp }) {
  const regions = new Set(saved.map((f) => f.region));
  return (
    <section className="lib-banner">
      <div className="lib-banner-text">
        <div className="lib-eyebrow mono">
          <span className="dot"></span>
          2026 / 我的音樂祭收藏
        </div>
        <h1 className="lib-title serif">
          今年想聽的<br />
          <span className="underline">那些聲音</span>
        </h1>
        <p className="lib-lede">
          這是你在「島嶼樂遊」收藏的場次。把日子記在心上、把人約好、把車票買起來——
          一張清單，從春天的吶喊到冬天的慢板。
        </p>

        <div className="lib-stats">
          <div className="lib-stat">
            <div className="lib-stat-num serif">{String(saved.length).padStart(2, '0')}<span className="unit">場</span></div>
            <div className="lib-stat-label">已收藏</div>
          </div>
          <div className="lib-stat">
            <div className="lib-stat-num serif">{String(regions.size).padStart(2, '0')}<span className="unit">地</span></div>
            <div className="lib-stat-label">跨越地區</div>
          </div>
          <div className="lib-stat">
            <div className="lib-stat-num serif">
              {nextUp ? Math.max(0, daysBetween(TODAY, nextUp.dateStart)) : '—'}
              <span className="unit">天</span>
            </div>
            <div className="lib-stat-label">距離下一場</div>
          </div>
        </div>
      </div>

      {nextUp ? <NextUpCard f={nextUp} /> : <NextUpEmpty hasSaved={saved.length > 0} />}
    </section>
  );
}

// 沒有「下一場」時的空狀態（保留 .nextup 外框）
function NextUpEmpty({ hasSaved }) {
  return (
    <div className="nextup nextup--empty">
      <div className="frame-corner" data-pos="tl"></div>
      <div className="frame-corner" data-pos="tr"></div>
      <div className="frame-corner" data-pos="bl"></div>
      <div className="frame-corner" data-pos="br"></div>

      <div className="nextup-head">
        <div className="nextup-tag">下一場 · NEXT UP</div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center',
          padding: '24px 8px',
        }}
      >
        <div className="countdown serif" style={{ opacity: 0.35, lineHeight: 1 }}>○</div>
        <div className="nextup-name" style={{ fontSize: 18 }}>
          {hasSaved ? '沒有即將舉辦的場次' : '還沒有收藏任何活動'}
        </div>
        <div className="countdown-sub">
          {hasSaved ? 'NO UPCOMING EVENTS' : 'NO SAVED EVENTS YET'}
        </div>
      </div>
    </div>
  );
}

function NextUpCard({ f }) {
  const days = Math.max(0, daysBetween(TODAY, f.dateStart));
  return (
    <div className="nextup">
      <div className="frame-corner" data-pos="tl"></div>
      <div className="frame-corner" data-pos="tr"></div>
      <div className="frame-corner" data-pos="bl"></div>
      <div className="frame-corner" data-pos="br"></div>

      <div className="nextup-head">
        <div className="nextup-tag">
          <span className="pulse"></span>
          下一場 · NEXT UP
        </div>
        <div className="nextup-tag">No. {f.id.slice(0, 6).toUpperCase()}</div>
      </div>

      <div>
        <div className="countdown serif">
          T<span style={{ margin: '0 4px' }}>−</span>{days}<span className="unit">天</span>
        </div>
        <div className="countdown-sub">COUNTDOWN · {fmtRange(f.dateStart, f.dateEnd)}</div>
      </div>

      <div>
        <h3 className="nextup-name">{f.name}</h3>
        <div className="nextup-name-en">{(f.nameEn || '').toUpperCase()}</div>
      </div>

      <div className="nextup-meta">
        <span>{f.region}</span>
        <span className="dot-sep">·</span>
        <span>{f.venue}</span>
      </div>

      <div className="nextup-actions">
        <button className="nextup-btn" onClick={() => alert('訂票連結即將推出')}>前往訂票 ↗</button>
        <button className="nextup-btn nextup-btn--ghost" onClick={() => alert('行事曆同步即將推出')}>加入行事曆</button>
      </div>
    </div>
  );
}

// ─── Toolbar ───────────────────────────────────────────────
function Toolbar({ tab, setTab, counts, sort, setSort }) {
  return (
    <div className="lib-toolbar">
      <div className="lib-tabs">
        <button className={`lib-tab ${tab === 'all' ? 'lib-tab--on' : ''}`} onClick={() => setTab('all')}>
          全部 <span className="lib-tab-count">{String(counts.all).padStart(2, '0')}</span>
        </button>
        <button className={`lib-tab ${tab === 'upcoming' ? 'lib-tab--on' : ''}`} onClick={() => setTab('upcoming')}>
          即將舉辦 <span className="lib-tab-count">{String(counts.upcoming).padStart(2, '0')}</span>
        </button>
        <button className={`lib-tab ${tab === 'past' ? 'lib-tab--on' : ''}`} onClick={() => setTab('past')}>
          已過去 <span className="lib-tab-count">{String(counts.past).padStart(2, '0')}</span>
        </button>
      </div>

      <div className="lib-toolbar-right">
        <div className="lib-sort">
          排序
          <div className="lib-sort-pill">
            <button className={`lib-sort-btn ${sort === 'date' ? 'lib-sort-btn--on' : ''}`} onClick={() => setSort('date')}>日期</button>
            <button className={`lib-sort-btn ${sort === 'savedAt' ? 'lib-sort-btn--on' : ''}`} onClick={() => setSort('savedAt')}>收藏時間</button>
            <button className={`lib-sort-btn ${sort === 'region' ? 'lib-sort-btn--on' : ''}`} onClick={() => setSort('region')}>地區</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Library card ──────────────────────────────────────────
function LibraryCard({ f, meta, onRemove, onOpenDetail, onEditNote }) {
  const days = daysBetween(TODAY, f.dateStart);
  const isPast = days < 0;
  const isSoon = days >= 0 && days <= 14;

  return (
    <article className={`lib-card ${isPast ? 'lib-card--past' : ''}`}>
      <div className="lib-card-ribbon"></div>
      <div className="lib-card-body">
        <div className="lib-card-top">
          <div className={`lib-countdown-badge ${isPast ? 'lib-countdown-badge--past' : isSoon ? 'lib-countdown-badge--soon' : ''}`}>
            <div className="num">{isPast ? `+${Math.abs(days)}` : `−${days}`}</div>
            <div className="lbl">{isPast ? 'DAYS AGO' : 'T−DAYS'}</div>
          </div>
          <div className="lib-card-titles">
            <div className="lib-card-eyebrow">
              {f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}
            </div>
            <h3
              className="lib-card-name"
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenDetail(f.id)}
              title="查看詳情"
            >
              {f.name}
            </h3>
            <div className="lib-card-name-en">{(f.nameEn || '').toUpperCase()}</div>
          </div>
          <button className="lib-card-remove" onClick={() => onRemove(f.id)} aria-label="移除收藏" title="移除收藏">×</button>
        </div>

        <dl className="lib-card-meta">
          <div className="lib-card-meta-row">
            <dt>DATE</dt>
            <dd>{fmtRange(f.dateStart, f.dateEnd)} · {MONTHS[f.month - 1]}</dd>
          </div>
          <div className="lib-card-meta-row">
            <dt>VENUE</dt>
            <dd>{f.region} · {f.venue}</dd>
          </div>
          <div className="lib-card-meta-row">
            <dt>TICKET</dt>
            <dd>{f.ticket || '—'}</dd>
          </div>
        </dl>

        {meta.note ? (
          <blockquote className="lib-note" onClick={() => onEditNote(f.id)} style={{ cursor: 'text' }} title="點擊編輯">
            {meta.note}
          </blockquote>
        ) : (
          <button className="lib-note lib-note--empty" type="button" onClick={() => onEditNote(f.id)}>
            + 加一段筆記給未來的自己
          </button>
        )}

        <div className="lib-card-foot">
          <span className="lib-card-savedat">
            <span className="heart">♥</span>收藏於 {fmtSavedAt(meta.savedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Aside ─────────────────────────────────────────────────
function Aside({ saved }) {
  const regionCounts = useMemo(() => {
    const m = {};
    saved.forEach((f) => { m[f.region] = (m[f.region] || 0) + 1; });
    const arr = Object.entries(m).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...arr.map(([, n]) => n), 1);
    return { arr, max };
  }, [saved]);

  const monthHas = useMemo(() => {
    const set = new Set(saved.map((f) => f.month));
    return [...Array(12).keys()].map((i) => set.has(i + 1));
  }, [saved]);

  return (
    <aside className="lib-aside">
      <div className="aside-block">
        <div className="aside-block-head">
          <h3 className="aside-title">地區分布</h3>
          <span className="aside-sub">BY REGION</span>
        </div>
        <div className="region-list">
          {regionCounts.arr.map(([r, n]) => (
            <div className="region-row" key={r}>
              <span className="lbl">{r}</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${(n / regionCounts.max) * 100}%` }} />
              </div>
              <span className="num">{String(n).padStart(2, '0')}</span>
            </div>
          ))}
          {regionCounts.arr.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0 }}>還沒有收藏。</p>
          )}
        </div>
      </div>

      <div className="aside-block">
        <div className="aside-block-head">
          <h3 className="aside-title">全年時間軸</h3>
          <span className="aside-sub">MONTH MAP</span>
        </div>
        <div className="month-dots">
          {monthHas.map((has, i) => (
            <div
              key={i}
              className={`month-dot ${has ? 'month-dot--has' : ''} ${i + 1 === CURRENT_MONTH ? 'month-dot--current' : ''}`}
            >
              <span className="m">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
          {monthHas.filter(Boolean).length} 個月份有節目 · {CURRENT_MONTH} 月是現在
        </p>
      </div>

      <div className="aside-block">
        <div className="aside-block-head">
          <h3 className="aside-title">動作</h3>
          <span className="aside-sub">ACTIONS</span>
        </div>
        <div className="aside-actions">
          <button className="aside-action" onClick={() => alert('行事曆同步即將推出')}>
            <div className="aside-action-body">
              <span className="label">同步到 Google 行事曆</span>
              <span className="hint">CALENDAR SYNC</span>
            </div>
            <span className="ico">→</span>
          </button>
          <button className="aside-action" onClick={() => alert('分享連結即將推出')}>
            <div className="aside-action-body">
              <span className="label">分享我的收藏</span>
              <span className="hint">SHARE LIST</span>
            </div>
            <span className="ico">↗</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Recommendations ───────────────────────────────────────
function Recs({ saved, all, savedIds, onToggleSave, onOpenDetail, onBrowseFestivals }) {
  const savedRegions = useMemo(() => new Set(saved.map((f) => f.region)), [saved]);
  // 第一次 render 凍結推薦清單，避免收藏後卡片瞬間消失
  const recs = useMemo(() => {
    return all
      .filter((f) => !savedIds.has(f.id))
      .map((f) => ({
        ...f,
        // 只保留「同樣在 地區」的理由；非同地區則不顯示（不再標示同類型）
        reason: savedRegions.has(f.region) ? `同樣在 ${f.region}` : '',
      }))
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!recs.length) return null;

  return (
    <section className="lib-recs">
      <div className="lib-recs-head">
        <div>
          <h2 className="lib-recs-title serif">你也許會喜歡</h2>
          <div className="lib-recs-sub">BASED ON YOUR LIBRARY</div>
        </div>
        <a
          href="#"
          className="lib-recs-link"
          onClick={(e) => { e.preventDefault(); onBrowseFestivals?.(); }}
        >瀏覽全年節目 →</a>
      </div>
      <div className="lib-recs-grid">
        {recs.map((f) => {
          const isSaved = savedIds.has(f.id);
          return (
            <article className="rec-card" key={f.id}>
              <div className="rec-card-eyebrow">
                <span>{f.region.toUpperCase()} · {MONTHS[f.month - 1]}</span>
                {f.reason && <span className="reason">{f.reason}</span>}
              </div>
              <h3 className="rec-card-name">{f.name}</h3>
              <div className="rec-card-date">{fmtRange(f.dateStart, f.dateEnd)} · {f.venue}</div>
              <p className="rec-card-blurb">{f.blurb}</p>
              <div className="rec-card-foot">
                <a
                  href="#"
                  className="rec-card-more"
                  onClick={(e) => { e.preventDefault(); onOpenDetail(f.id); }}
                >
                  查看更多 →
                </a>
                <button
                  className={`save-btn ${isSaved ? 'save-btn--on' : ''}`}
                  onClick={() => onToggleSave(f.id)}
                  aria-label="收藏"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z"
                      fill={isSaved ? 'var(--accent)' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── 主元件 ────────────────────────────────────────────────
export function LibraryPage({
  festivals = [],
  savedIds,
  onToggleSave,
  onOpenDetail = () => {},
  onNavigateHome = () => {},
  onBrowseFestivals = () => {},
  onLogin = () => {},
  onLogout = () => {},
  onSubmit = () => {},
  user = null,
}) {
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('date');
  const [meta, setMeta] = useState(() => loadMeta());

  // 取得（必要時建立）某場的本地 meta，預設收藏時間為今天
  const metaOf = useCallback(
    (id) => meta[id] || { tag: 'wishlist', note: '', savedAt: TODAY },
    [meta],
  );

  const handleEditNote = (id) => {
    const cur = metaOf(id);
    const next = window.prompt('寫一段筆記給未來的自己：', cur.note || '');
    if (next === null) return; // 取消
    setMeta((prev) => {
      const updated = { ...prev, [id]: { ...cur, note: next.trim() } };
      saveMeta(updated);
      return updated;
    });
  };

  const saved = useMemo(
    () => festivals.filter((f) => savedIds.has(f.id)),
    [festivals, savedIds],
  );
  const upcoming = useMemo(
    () => saved.filter((f) => daysBetween(TODAY, f.dateStart) >= 0),
    [saved],
  );
  const past = useMemo(
    () => saved.filter((f) => daysBetween(TODAY, f.dateStart) < 0),
    [saved],
  );

  const nextUp = useMemo(() => {
    const arr = upcoming.slice().sort((a, b) => a.dateStart.localeCompare(b.dateStart));
    return arr[0];
  }, [upcoming]);

  const visible = useMemo(() => {
    let list = saved.slice();
    if (tab === 'upcoming') list = upcoming.slice();
    if (tab === 'past') list = past.slice();

    if (sort === 'date') list.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
    if (sort === 'savedAt') list.sort((a, b) => (metaOf(b.id).savedAt || '').localeCompare(metaOf(a.id).savedAt || ''));
    if (sort === 'region') list.sort((a, b) => a.region.localeCompare(b.region));
    return list;
  }, [saved, upcoming, past, tab, sort, metaOf]);

  return (
    <div className="app lib-page">
      <Header user={user} onNavigateHome={onNavigateHome} onLogin={onLogin} onLogout={onLogout} onSubmit={onSubmit} />
      <Banner saved={saved} nextUp={nextUp} />
      <Toolbar
        tab={tab}
        setTab={setTab}
        counts={{ all: saved.length, upcoming: upcoming.length, past: past.length }}
        sort={sort}
        setSort={setSort}
      />

      <div className="lib-main">
        <div className="lib-cards">
          {visible.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-mark serif">○</div>
              <h3 className="serif">這個區段還沒有收藏</h3>
              <p>
                切換其它分頁，或回到{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); onBrowseFestivals(); }} style={{ borderBottom: '1px solid var(--ink)' }}>節目單</a>{' '}
                加入想去的場次。
              </p>
            </div>
          ) : (
            visible.map((f) => (
              <LibraryCard
                key={f.id}
                f={f}
                meta={metaOf(f.id)}
                onRemove={onToggleSave}
                onOpenDetail={onOpenDetail}
                onEditNote={handleEditNote}
              />
            ))
          )}
        </div>
        <Aside saved={saved} />
      </div>

      <Recs
        saved={saved}
        all={festivals}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
        onOpenDetail={onOpenDetail}
        onBrowseFestivals={onBrowseFestivals}
      />

      <footer className="site-footer">
        <div className="footer-left">
          <div className="serif">島嶼樂遊</div>
          <div className="mono">ISLAND · SOUND · 2026</div>
        </div>
        <div className="footer-mid mono">
          一份非營利的台灣音樂祭索引 · 由樂迷編輯與維護
        </div>
        <div className="footer-right mono">
          <a href="#" onClick={(e) => e.preventDefault()}>關於</a>
          <a href="#" onClick={(e) => e.preventDefault()}>聯絡</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Newsletter</a>
        </div>
      </footer>
    </div>
  );
}

export default LibraryPage;
