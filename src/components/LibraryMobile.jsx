// LibraryMobile — 島嶼樂遊 / Island Sound 我的收藏（手機版 RWD）
// 視覺移植自 MD/library-mobile.jsx，接專案真實資料（savedIds / onToggleSave）。
// 筆記/收藏時間用 localStorage 佔位（與桌機版共用同一把 key）。
import { useState, useMemo } from 'react';
import { GENRES, MONTHS } from '../data/festivals.js';
import './LibraryMobile.css';

const TODAY = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();
const CURRENT_MONTH = new Date().getMonth() + 1;

function mlDays(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}
function mlFmtRange(a, b) {
  const am = parseInt(a.split('-')[1], 10), ad = parseInt(a.split('-')[2], 10);
  const bm = parseInt(b.split('-')[1], 10), bd = parseInt(b.split('-')[2], 10);
  if (a === b) return `${am}.${ad}`;
  if (am === bm) return `${am}.${ad}–${bd}`;
  return `${am}.${ad}–${bm}.${bd}`;
}
function mlFmtSaved(s) {
  const [y, m, d] = s.split('-');
  return `${y}.${m}.${d}`;
}

const META_KEY = 'island-sound:lib-meta';
function loadMeta() {
  try { const r = localStorage.getItem(META_KEY); const o = r ? JSON.parse(r) : {}; return o && typeof o === 'object' ? o : {}; } catch { return {}; }
}
function saveMeta(o) { try { localStorage.setItem(META_KEY, JSON.stringify(o)); } catch { /* noop */ } }

// ───────── Next-up ─────────
function MLNextUp({ f, hasSaved }) {
  if (!f) {
    return (
      <div className="ml-nextup">
        <span className="ml-frame-corner" data-pos="tl"></span>
        <span className="ml-frame-corner" data-pos="tr"></span>
        <span className="ml-frame-corner" data-pos="bl"></span>
        <span className="ml-frame-corner" data-pos="br"></span>
        <div className="ml-nextup-head">
          <span className="ml-nextup-tag mono">下一場 · NEXT UP</span>
        </div>
        <div style={{ padding: '18px 0 8px', textAlign: 'center' }}>
          <div className="ml-nextup-name serif">{hasSaved ? '沒有即將舉辦的場次' : '還沒有收藏任何活動'}</div>
          <div className="ml-countdown-sub mono">{hasSaved ? 'NO UPCOMING EVENTS' : 'NO SAVED EVENTS YET'}</div>
        </div>
      </div>
    );
  }
  const days = Math.max(0, mlDays(TODAY, f.dateStart));
  return (
    <div className="ml-nextup">
      <span className="ml-frame-corner" data-pos="tl"></span>
      <span className="ml-frame-corner" data-pos="tr"></span>
      <span className="ml-frame-corner" data-pos="bl"></span>
      <span className="ml-frame-corner" data-pos="br"></span>

      <div className="ml-nextup-head">
        <span className="ml-nextup-tag mono">
          <span className="ml-pulse"></span>
          下一場 · NEXT UP
        </span>
        <span className="ml-nextup-no mono">No. {f.id.slice(0, 6).toUpperCase()}</span>
      </div>

      <div className="ml-countdown serif">
        T−{days}<span className="unit">天</span>
      </div>
      <div className="ml-countdown-sub mono">COUNTDOWN · {mlFmtRange(f.dateStart, f.dateEnd)}</div>

      <div className="ml-nextup-name serif">{f.name}</div>
      <div className="ml-nextup-name-en mono">{(f.nameEn || '').toUpperCase()}</div>

      <div className="ml-nextup-meta">
        <span>{f.region}</span>
        <span className="ml-dot-sep">·</span>
        <span>{f.venue}</span>
      </div>

      <div className="ml-nextup-actions">
        <button className="ml-nextup-btn" onClick={() => alert('訂票連結即將推出')}>前往訂票 ↗</button>
        <button className="ml-nextup-btn ml-nextup-btn--ghost" onClick={() => alert('行事曆同步即將推出')}>加入行事曆</button>
      </div>
    </div>
  );
}

// ───────── Card ─────────
function MLCard({ f, meta, onRemove, onOpenDetail, onEditNote }) {
  const days = mlDays(TODAY, f.dateStart);
  const isPast = days < 0;
  const isSoon = days >= 0 && days <= 14;

  return (
    <article className={`ml-card ${isPast ? 'ml-card--past' : ''}`}>
      <div className="ml-card-ribbon"></div>
      <div className="ml-card-body">
        <div className="ml-card-top">
          <div className={`ml-cd-badge ${isPast ? 'ml-cd-badge--past' : isSoon ? 'ml-cd-badge--soon' : ''}`}>
            <div className="num">{isPast ? `+${Math.abs(days)}` : `−${days}`}</div>
            <div className="lbl">{isPast ? 'DAYS AGO' : 'T−DAYS'}</div>
          </div>
          <div className="ml-card-titles">
            <div className="ml-card-eyebrow mono">{f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}</div>
            <h3 className="ml-card-name serif" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>{f.name}</h3>
            <div className="ml-card-name-en mono">{(f.nameEn || '').toUpperCase()}</div>
          </div>
          <button className="ml-card-remove" onClick={() => onRemove(f.id)} aria-label="移除收藏">×</button>
        </div>

        <dl className="ml-card-meta">
          <div className="ml-meta-row">
            <dt className="mono">DATE</dt>
            <dd>{mlFmtRange(f.dateStart, f.dateEnd)} · {MONTHS[f.month - 1]}</dd>
          </div>
          <div className="ml-meta-row">
            <dt className="mono">VENUE</dt>
            <dd>{f.region} · {f.venue}</dd>
          </div>
          <div className="ml-meta-row">
            <dt className="mono">TICKET</dt>
            <dd>{f.ticket || '—'}</dd>
          </div>
        </dl>

        {meta.note ? (
          <blockquote className="ml-note" onClick={() => onEditNote(f.id)}>{meta.note}</blockquote>
        ) : (
          <button className="ml-note ml-note--empty" type="button" onClick={() => onEditNote(f.id)}>+ 加一段筆記給未來的自己</button>
        )}

        <div className="ml-card-foot">
          <span className="ml-savedat mono">
            <span className="heart">♥</span>收藏於 {mlFmtSaved(meta.savedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

// ───────── Insights ─────────
function MLInsights({ saved }) {
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
    <section className="ml-insights">
      <div className="ml-insights-head">
        <h3 className="serif">分布一覽</h3>
        <span className="mono">YOUR LIBRARY · AT A GLANCE</span>
      </div>

      <div className="ml-insight-block">
        <div className="ml-insight-label mono">地區 · BY REGION</div>
        <div className="ml-region-list">
          {regionCounts.arr.map(([r, n]) => (
            <div className="ml-region-row" key={r}>
              <span className="lbl">{r}</span>
              <div className="bar"><div className="bar-fill" style={{ width: `${(n / regionCounts.max) * 100}%` }} /></div>
              <span className="num mono">{String(n).padStart(2, '0')}</span>
            </div>
          ))}
          {regionCounts.arr.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0 }}>還沒有收藏。</p>
          )}
        </div>
      </div>

      <div className="ml-insight-block">
        <div className="ml-insight-label mono">時間軸 · MONTH MAP</div>
        <div className="ml-month-dots">
          {monthHas.map((has, i) => (
            <div key={i} className={`ml-month-dot ${has ? 'ml-month-dot--has' : ''} ${i + 1 === CURRENT_MONTH ? 'ml-month-dot--current' : ''}`}>
              <span className="m mono">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <p className="ml-month-foot">
          {monthHas.filter(Boolean).length} 個月份有節目 · {CURRENT_MONTH} 月是現在
        </p>
      </div>

      <div className="ml-insight-block ml-actions-block">
        <button className="ml-aside-action" onClick={() => alert('行事曆同步即將推出')}>
          <span className="lbl">同步到 Google 行事曆</span>
          <span className="ico">→</span>
        </button>
        <button className="ml-aside-action" onClick={() => alert('分享連結即將推出')}>
          <span className="lbl">分享我的收藏</span>
          <span className="ico">↗</span>
        </button>
      </div>
    </section>
  );
}

// ───────── Recs ─────────
function MLRecs({ saved, all, savedIds, onToggleSave, onOpenDetail }) {
  const savedRegions = useMemo(() => new Set(saved.map((f) => f.region)), [saved]);
  const recs = useMemo(() => {
    return all
      .filter((f) => !savedIds.has(f.id))
      .map((f) => ({ ...f, reason: savedRegions.has(f.region) ? `同樣在 ${f.region}` : '' }))
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!recs.length) return null;

  return (
    <section className="ml-recs">
      <div className="ml-recs-head">
        <h2 className="serif">你也許會喜歡</h2>
        <div className="mono">BASED ON YOUR LIBRARY</div>
      </div>
      <div className="ml-recs-list">
        {recs.map((f) => {
          const isSaved = savedIds.has(f.id);
          return (
            <article className="ml-rec" key={f.id}>
              <div className="ml-rec-eyebrow mono">
                <span>{f.region.toUpperCase()} · {MONTHS[f.month - 1]}</span>
                {f.reason && <span className="reason">{f.reason}</span>}
              </div>
              <h3 className="ml-rec-name serif">{f.name}</h3>
              <div className="ml-rec-date mono">{mlFmtRange(f.dateStart, f.dateEnd)} · {f.venue}</div>
              <p className="ml-rec-blurb">{f.blurb}</p>
              <div className="ml-rec-foot">
                <span className="ml-rec-more mono" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>查看更多 →</span>
                <button className={`ml-rec-save ${isSaved ? 'ml-rec-save--on' : ''}`} onClick={() => onToggleSave(f.id)} aria-label="收藏">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z" fill={isSaved ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
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

// ───────── App ─────────
export function LibraryMobile({
  festivals = [],
  savedIds,
  onToggleSave,
  onOpenDetail = () => {},
  onNavigateHome = () => {},
  onBrowseFestivals = () => {},
  onSubmit = () => {},
  onLogin = () => {},
  onLogout = () => {},
  user = null,
}) {
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('date');
  const [meta, setMeta] = useState(loadMeta);
  const [menuOpen, setMenuOpen] = useState(false);

  const metaOf = (id) => meta[id] || { tag: 'wishlist', note: '', savedAt: TODAY };
  const handleEditNote = (id) => {
    const cur = metaOf(id);
    const next = window.prompt('寫一段筆記給未來的自己：', cur.note || '');
    if (next === null) return;
    setMeta((prev) => { const u = { ...prev, [id]: { ...cur, note: next.trim() } }; saveMeta(u); return u; });
  };

  const saved = useMemo(() => festivals.filter((f) => savedIds.has(f.id)), [festivals, savedIds]);
  const upcoming = useMemo(() => saved.filter((f) => mlDays(TODAY, f.dateStart) >= 0), [saved]);
  const past = useMemo(() => saved.filter((f) => mlDays(TODAY, f.dateStart) < 0), [saved]);

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
  }, [saved, upcoming, past, tab, sort, meta]);

  const regionCount = new Set(saved.map((f) => f.region)).size;

  return (
    <div className="lib-mobile">
      <div className="ml-app">
        <header className="m-header">
          <button className="m-icon-btn" aria-label="選單" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
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

        <div className={`m-nav-backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
        <nav className={`m-nav-menu ${menuOpen ? 'is-open' : ''}`} aria-label="主選單">
          <div className="m-nav-top">
            <div className="m-nav-brand">
              <span className="serif">島嶼樂遊</span>
              <span className="mono">ISLAND · SOUND</span>
            </div>
            <button className="m-nav-close" onClick={() => setMenuOpen(false)} aria-label="關閉選單">×</button>
          </div>
          <div className="m-nav-links">
            <a href="#" className="m-nav-link" onClick={(e) => { e.preventDefault(); setMenuOpen(false); onNavigateHome(); }}>
              <span className="serif">音樂祭</span><span className="mono">FESTIVALS</span>
            </a>
            <a href="#" className="m-nav-link" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>
              <span className="serif">月曆</span><span className="mono">CALENDAR</span>
            </a>
            <a href="#" className="m-nav-link" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>
              <span className="serif">專欄</span><span className="mono">COLUMN</span>
            </a>
            <a href="#" className="m-nav-link m-nav-link--on" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>
              <span className="serif">收藏</span><span className="mono">SAVED</span>
            </a>
          </div>
          <button className="btn btn--primary btn--block m-nav-submit" onClick={() => { setMenuOpen(false); onSubmit(); }}>投稿 ↗</button>
          {user ? (
            <button className="btn btn--ghost btn--block m-nav-login" onClick={() => { setMenuOpen(false); onLogout(); }}>登出</button>
          ) : (
            <button className="btn btn--ghost btn--block m-nav-login" onClick={() => { setMenuOpen(false); onLogin(); }}>登入</button>
          )}
        </nav>

        <section className="ml-banner">
          <div className="ml-eyebrow mono">
            <span className="ml-eyebrow-dot"></span>
            2026 / 我的音樂祭收藏
          </div>
          <h1 className="ml-title serif">
            今年想聽的<br />
            <span className="ml-underline">那些聲音</span>
          </h1>
          <p className="ml-lede">
            這是你在「島嶼樂遊」收藏的場次——一張清單，從春天的吶喊到冬天的慢板。
          </p>

          <div className="ml-stats">
            <div className="ml-stat">
              <div className="ml-stat-num serif">{String(saved.length).padStart(2, '0')}<span className="unit">場</span></div>
              <div className="ml-stat-label mono">已收藏</div>
            </div>
            <div className="ml-stat">
              <div className="ml-stat-num serif">{String(regionCount).padStart(2, '0')}<span className="unit">地</span></div>
              <div className="ml-stat-label mono">跨越地區</div>
            </div>
            <div className="ml-stat">
              <div className="ml-stat-num serif">
                {nextUp ? Math.max(0, mlDays(TODAY, nextUp.dateStart)) : '—'}
                <span className="unit">天</span>
              </div>
              <div className="ml-stat-label mono">下一場</div>
            </div>
          </div>
        </section>

        <section className="ml-nextup-wrap">
          <MLNextUp f={nextUp} hasSaved={saved.length > 0} />
        </section>

        <div className="ml-toolbar">
          <div className="ml-tabs">
            <button className={`ml-tab ${tab === 'all' ? 'ml-tab--on' : ''}`} onClick={() => setTab('all')}>
              全部 <span className="ml-tab-count mono">{String(saved.length).padStart(2, '0')}</span>
            </button>
            <button className={`ml-tab ${tab === 'upcoming' ? 'ml-tab--on' : ''}`} onClick={() => setTab('upcoming')}>
              即將 <span className="ml-tab-count mono">{String(upcoming.length).padStart(2, '0')}</span>
            </button>
            <button className={`ml-tab ${tab === 'past' ? 'ml-tab--on' : ''}`} onClick={() => setTab('past')}>
              已過去 <span className="ml-tab-count mono">{String(past.length).padStart(2, '0')}</span>
            </button>
          </div>

          <div className="ml-sort mono">
            <span className="ml-sort-label">排序</span>
            <select className="ml-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date">日期</option>
              <option value="savedAt">收藏時間</option>
              <option value="region">地區</option>
            </select>
          </div>
        </div>

        <section className="ml-cards">
          {visible.length === 0 ? (
            <div className="ml-empty">
              <div className="serif" style={{ fontSize: 48, color: 'var(--ink-faint)' }}>○</div>
              <h3 className="serif">這個區段還沒有收藏</h3>
              <p>切換其它分頁，或回到 <a href="#" onClick={(e) => { e.preventDefault(); onBrowseFestivals(); }} style={{ borderBottom: '1px solid var(--ink)' }}>節目單</a> 加入想去的場次。</p>
            </div>
          ) : (
            visible.map((f) => (
              <MLCard key={f.id} f={f} meta={metaOf(f.id)} onRemove={onToggleSave} onOpenDetail={onOpenDetail} onEditNote={handleEditNote} />
            ))
          )}
        </section>

        <MLInsights saved={saved} />

        <MLRecs saved={saved} all={festivals} savedIds={savedIds} onToggleSave={onToggleSave} onOpenDetail={onOpenDetail} />

        <footer className="ml-footer">
          <div className="serif">島嶼樂遊</div>
          <div className="mono">ISLAND · SOUND · 2026</div>
          <div className="ml-footer-links mono">
            <a href="#" onClick={(e) => e.preventDefault()}>關於</a>
            <a href="#" onClick={(e) => e.preventDefault()}>聯絡</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LibraryMobile;
