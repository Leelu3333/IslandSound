// LibraryTablet — 島嶼樂遊 / Island Sound 我的收藏（平板版 RWD，portrait/landscape）
// 視覺移植自 MD/library-tablet.jsx，接專案真實資料。
import { useState, useMemo } from 'react';
import { GENRES, MONTHS } from '../data/festivals.js';
import { displayNameOf } from '../lib/auth.js';
import './LibraryTablet.css';

const TODAY = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})();
const CURRENT_MONTH = new Date().getMonth() + 1;

function tlDays(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}
function tlFmtRange(a, b) {
  const am = parseInt(a.split('-')[1], 10), ad = parseInt(a.split('-')[2], 10);
  const bm = parseInt(b.split('-')[1], 10), bd = parseInt(b.split('-')[2], 10);
  if (a === b) return `${am}.${ad}`;
  if (am === bm) return `${am}.${ad}–${bd}`;
  return `${am}.${ad}–${bm}.${bd}`;
}
function tlFmtSaved(s) {
  const [y, m, d] = s.split('-');
  return `${y}.${m}.${d}`;
}

const META_KEY = 'island-sound:lib-meta';
function loadMeta() {
  try { const r = localStorage.getItem(META_KEY); const o = r ? JSON.parse(r) : {}; return o && typeof o === 'object' ? o : {}; } catch { return {}; }
}
function saveMeta(o) { try { localStorage.setItem(META_KEY, JSON.stringify(o)); } catch { /* noop */ } }

// ───────── Next-up ─────────
function TLNextUp({ f, hasSaved }) {
  if (!f) {
    return (
      <div className="tl-nextup">
        <span className="tl-frame-corner" data-pos="tl"></span>
        <span className="tl-frame-corner" data-pos="tr"></span>
        <span className="tl-frame-corner" data-pos="bl"></span>
        <span className="tl-frame-corner" data-pos="br"></span>
        <div className="tl-nextup-head">
          <span className="tl-nextup-tag mono">下一場 · NEXT UP</span>
        </div>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <h3 className="tl-nextup-name serif">{hasSaved ? '沒有即將舉辦的場次' : '還沒有收藏任何活動'}</h3>
          <div className="tl-countdown-sub mono">{hasSaved ? 'NO UPCOMING EVENTS' : 'NO SAVED EVENTS YET'}</div>
        </div>
      </div>
    );
  }
  const days = Math.max(0, tlDays(TODAY, f.dateStart));
  return (
    <div className="tl-nextup">
      <span className="tl-frame-corner" data-pos="tl"></span>
      <span className="tl-frame-corner" data-pos="tr"></span>
      <span className="tl-frame-corner" data-pos="bl"></span>
      <span className="tl-frame-corner" data-pos="br"></span>

      <div className="tl-nextup-head">
        <span className="tl-nextup-tag mono">
          <span className="tl-pulse"></span>
          下一場 · NEXT UP
        </span>
        <span className="tl-nextup-no mono">No. {f.id.slice(0, 6).toUpperCase()}</span>
      </div>

      <div>
        <div className="tl-countdown serif">T−{days}<span className="unit">天</span></div>
        <div className="tl-countdown-sub mono">COUNTDOWN · {tlFmtRange(f.dateStart, f.dateEnd)}</div>
      </div>

      <div>
        <h3 className="tl-nextup-name serif">{f.name}</h3>
        <div className="tl-nextup-name-en mono">{(f.nameEn || '').toUpperCase()}</div>
      </div>

      <div className="tl-nextup-meta">
        <span>{f.region}</span>
        <span className="tl-dot-sep">·</span>
        <span>{f.venue}</span>
      </div>

      <div className="tl-nextup-actions">
        <button className="tl-nextup-btn" onClick={() => alert('訂票連結即將推出')}>前往訂票 ↗</button>
        <button className="tl-nextup-btn tl-nextup-btn--ghost" onClick={() => alert('行事曆同步即將推出')}>加入行事曆</button>
      </div>
    </div>
  );
}

// ───────── Card ─────────
function TLCard({ f, meta, onRemove, onOpenDetail, onEditNote }) {
  const days = tlDays(TODAY, f.dateStart);
  const isPast = days < 0;
  const isSoon = days >= 0 && days <= 14;

  return (
    <article className={`tl-card ${isPast ? 'tl-card--past' : ''}`}>
      <div className="tl-card-ribbon"></div>
      <div className="tl-card-body">
        <div className="tl-card-top">
          <div className={`tl-cd-badge ${isPast ? 'tl-cd-badge--past' : isSoon ? 'tl-cd-badge--soon' : ''}`}>
            <div className="num">{isPast ? `+${Math.abs(days)}` : `−${days}`}</div>
            <div className="lbl">{isPast ? 'DAYS AGO' : 'T−DAYS'}</div>
          </div>
          <div className="tl-card-titles">
            <div className="tl-card-eyebrow mono">{f.region.toUpperCase()} · {f.dateStart.slice(0, 4)}</div>
            <h3 className="tl-card-name serif" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>{f.name}</h3>
            <div className="tl-card-name-en mono">{(f.nameEn || '').toUpperCase()}</div>
          </div>
          <button className="tl-card-remove" onClick={() => onRemove(f.id)} aria-label="移除收藏">×</button>
        </div>

        <dl className="tl-card-meta">
          <div className="tl-meta-row">
            <dt className="mono">DATE</dt>
            <dd>{tlFmtRange(f.dateStart, f.dateEnd)} · {MONTHS[f.month - 1]}</dd>
          </div>
          <div className="tl-meta-row">
            <dt className="mono">VENUE</dt>
            <dd>{f.region} · {f.venue}</dd>
          </div>
          <div className="tl-meta-row">
            <dt className="mono">TICKET</dt>
            <dd>{f.ticket || '—'}</dd>
          </div>
        </dl>

        {meta.note ? (
          <blockquote className="tl-note" onClick={() => onEditNote(f.id)}>{meta.note}</blockquote>
        ) : (
          <button className="tl-note tl-note--empty" type="button" onClick={() => onEditNote(f.id)}>+ 加一段筆記給未來的自己</button>
        )}

        <div className="tl-card-foot">
          <span className="tl-savedat mono">
            <span className="heart">♥</span>收藏於 {tlFmtSaved(meta.savedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

// ───────── Aside ─────────
function TLAside({ saved, orientation }) {
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
    <aside className={`tl-aside tl-aside--${orientation}`}>
      <div className="tl-aside-block">
        <div className="tl-aside-block-head">
          <h3 className="serif">地區分布</h3>
          <span className="mono">BY REGION</span>
        </div>
        <div className="tl-region-list">
          {regionCounts.arr.map(([r, n]) => (
            <div className="tl-region-row" key={r}>
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

      <div className="tl-aside-block">
        <div className="tl-aside-block-head">
          <h3 className="serif">全年時間軸</h3>
          <span className="mono">MONTH MAP</span>
        </div>
        <div className="tl-month-dots">
          {monthHas.map((has, i) => (
            <div key={i} className={`tl-month-dot ${has ? 'tl-month-dot--has' : ''} ${i + 1 === CURRENT_MONTH ? 'tl-month-dot--current' : ''}`}>
              <span className="m mono">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <p className="tl-month-foot">
          {monthHas.filter(Boolean).length} 個月份有節目 · {CURRENT_MONTH} 月是現在
        </p>
      </div>

      <div className="tl-aside-block">
        <div className="tl-aside-block-head">
          <h3 className="serif">動作</h3>
          <span className="mono">ACTIONS</span>
        </div>
        <div className="tl-aside-actions">
          <button className="tl-aside-action" onClick={() => alert('行事曆同步即將推出')}>
            <div className="tl-aside-action-body">
              <span className="label">同步到 Google 行事曆</span>
              <span className="hint mono">CALENDAR SYNC</span>
            </div>
            <span className="ico">→</span>
          </button>
          <button className="tl-aside-action" onClick={() => alert('分享連結即將推出')}>
            <div className="tl-aside-action-body">
              <span className="label">分享我的收藏</span>
              <span className="hint mono">SHARE LIST</span>
            </div>
            <span className="ico">↗</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ───────── Recs ─────────
function TLRecs({ saved, all, savedIds, onToggleSave, onOpenDetail, onBrowseFestivals, columns = 3 }) {
  const savedRegions = useMemo(() => new Set(saved.map((f) => f.region)), [saved]);
  const recs = useMemo(() => {
    return all
      .filter((f) => !savedIds.has(f.id))
      .map((f) => ({ ...f, reason: savedRegions.has(f.region) ? `同樣在 ${f.region}` : '' }))
      .slice(0, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!recs.length) return null;

  return (
    <section className="tl-recs">
      <div className="tl-recs-head">
        <div>
          <h2 className="serif">你也許會喜歡</h2>
          <div className="mono">BASED ON YOUR LIBRARY</div>
        </div>
        <a href="#" className="tl-recs-link mono" onClick={(e) => { e.preventDefault(); onBrowseFestivals(); }}>瀏覽全年節目 →</a>
      </div>
      <div className="tl-recs-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {recs.map((f) => {
          const isSaved = savedIds.has(f.id);
          return (
            <article className="tl-rec" key={f.id}>
              <div className="tl-rec-eyebrow mono">
                <span>{f.region.toUpperCase()} · {MONTHS[f.month - 1]}</span>
                {f.reason && <span className="reason">{f.reason}</span>}
              </div>
              <h3 className="tl-rec-name serif">{f.name}</h3>
              <div className="tl-rec-date mono">{tlFmtRange(f.dateStart, f.dateEnd)} · {f.venue}</div>
              <p className="tl-rec-blurb">{f.blurb}</p>
              <div className="tl-rec-foot">
                <span className="tl-rec-more mono" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>查看更多 →</span>
                <button className={`tl-rec-save ${isSaved ? 'tl-rec-save--on' : ''}`} onClick={() => onToggleSave(f.id)} aria-label="收藏">
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
export function LibraryTablet({
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
  orientation = 'portrait',
}) {
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState('date');
  const [meta, setMeta] = useState(loadMeta);

  const metaOf = (id) => meta[id] || { tag: 'wishlist', note: '', savedAt: TODAY };
  const handleEditNote = (id) => {
    const cur = metaOf(id);
    const next = window.prompt('寫一段筆記給未來的自己：', cur.note || '');
    if (next === null) return;
    setMeta((prev) => { const u = { ...prev, [id]: { ...cur, note: next.trim() } }; saveMeta(u); return u; });
  };

  const saved = useMemo(() => festivals.filter((f) => savedIds.has(f.id)), [festivals, savedIds]);
  const upcoming = useMemo(() => saved.filter((f) => tlDays(TODAY, f.dateStart) >= 0), [saved]);
  const past = useMemo(() => saved.filter((f) => tlDays(TODAY, f.dateStart) < 0), [saved]);

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
  const cardCols = 2;
  const recCols = orientation === 'landscape' ? 3 : 2;

  return (
    <div className="lib-tablet">
      <div className={`tl-app tl-app--${orientation}`}>
        <header className="t-header">
          <a href="#" className="t-logo" style={{ textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>
            <svg viewBox="0 0 32 32" width="28" height="28">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="2" fill="var(--ink)" />
              <circle cx="16" cy="16" r="7" fill="none" stroke="var(--camel)" strokeWidth="0.7" strokeDasharray="2 2" />
            </svg>
            <div className="t-logo-text">
              <div className="serif">島嶼樂遊</div>
              <div className="mono">ISLAND · SOUND</div>
            </div>
          </a>
          <nav className="t-nav">
            <a href="#" className="t-nav-link" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>音樂祭</a>
            <a href="#" className="t-nav-link" onClick={(e) => e.preventDefault()}>月曆</a>
            <a href="#" className="t-nav-link" onClick={(e) => e.preventDefault()}>專欄</a>
            <a href="#" className="t-nav-link t-nav-link--on" onClick={(e) => e.preventDefault()}>收藏</a>
            <button className="btn btn--ghost mono" onClick={onSubmit}>投稿 ↗</button>
            {user ? (
              <div className="auth-chip">
                <span className="auth-chip-avatar" aria-hidden>{displayNameOf(user).charAt(0)}</span>
                <button className="auth-chip-out" onClick={onLogout}>登出</button>
              </div>
            ) : (
              <button className="btn btn--ghost mono" onClick={onLogin}>登入</button>
            )}
          </nav>
        </header>

        <section className="tl-banner">
          <div className="tl-banner-text">
            <div className="tl-eyebrow mono">
              <span className="tl-eyebrow-dot"></span>
              2026 / 我的音樂祭收藏
            </div>
            <h1 className="tl-title serif">
              今年想聽的<br />
              <span className="tl-underline">那些聲音</span>
            </h1>
            <p className="tl-lede">
              這是你在「島嶼樂遊」收藏的場次。把日子記在心上、把人約好、把車票買起來——
              一張清單，從春天的吶喊到冬天的慢板。
            </p>

            <div className="tl-stats">
              <div className="tl-stat">
                <div className="tl-stat-num serif">{String(saved.length).padStart(2, '0')}<span className="unit">場</span></div>
                <div className="tl-stat-label mono">已收藏</div>
              </div>
              <div className="tl-stat">
                <div className="tl-stat-num serif">{String(regionCount).padStart(2, '0')}<span className="unit">地</span></div>
                <div className="tl-stat-label mono">跨越地區</div>
              </div>
              <div className="tl-stat">
                <div className="tl-stat-num serif">
                  {nextUp ? Math.max(0, tlDays(TODAY, nextUp.dateStart)) : '—'}
                  <span className="unit">天</span>
                </div>
                <div className="tl-stat-label mono">距離下一場</div>
              </div>
            </div>
          </div>

          <TLNextUp f={nextUp} hasSaved={saved.length > 0} />
        </section>

        <div className="tl-toolbar">
          <div className="tl-tabs">
            <button className={`tl-tab ${tab === 'all' ? 'tl-tab--on' : ''}`} onClick={() => setTab('all')}>
              全部 <span className="tl-tab-count mono">{String(saved.length).padStart(2, '0')}</span>
            </button>
            <button className={`tl-tab ${tab === 'upcoming' ? 'tl-tab--on' : ''}`} onClick={() => setTab('upcoming')}>
              即將舉辦 <span className="tl-tab-count mono">{String(upcoming.length).padStart(2, '0')}</span>
            </button>
            <button className={`tl-tab ${tab === 'past' ? 'tl-tab--on' : ''}`} onClick={() => setTab('past')}>
              已過去 <span className="tl-tab-count mono">{String(past.length).padStart(2, '0')}</span>
            </button>
          </div>

          <div className="tl-sort mono">
            排序
            <div className="tl-sort-pill">
              {[['date', '日期'], ['savedAt', '收藏時間'], ['region', '地區']].map(([k, lbl]) => (
                <button key={k} className={`tl-sort-btn ${sort === k ? 'tl-sort-btn--on' : ''}`} onClick={() => setSort(k)}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="tl-main">
          <div className="tl-cards" style={{ gridTemplateColumns: `repeat(${cardCols}, 1fr)` }}>
            {visible.length === 0 ? (
              <div className="tl-empty" style={{ gridColumn: '1 / -1' }}>
                <div className="serif" style={{ fontSize: 56, color: 'var(--ink-faint)' }}>○</div>
                <h3 className="serif">這個區段還沒有收藏</h3>
                <p>切換其它分頁，或回到 <a href="#" onClick={(e) => { e.preventDefault(); onBrowseFestivals(); }} style={{ borderBottom: '1px solid var(--ink)' }}>節目單</a> 加入想去的場次。</p>
              </div>
            ) : (
              visible.map((f) => (
                <TLCard key={f.id} f={f} meta={metaOf(f.id)} onRemove={onToggleSave} onOpenDetail={onOpenDetail} onEditNote={handleEditNote} />
              ))
            )}
          </div>

          <TLAside saved={saved} orientation={orientation} />
        </div>

        <TLRecs saved={saved} all={festivals} savedIds={savedIds} onToggleSave={onToggleSave} onOpenDetail={onOpenDetail} onBrowseFestivals={onBrowseFestivals} columns={recCols} />

        <footer className="tl-footer">
          <div className="tl-footer-left">
            <div className="serif">島嶼樂遊</div>
            <div className="mono">ISLAND · SOUND · 2026</div>
          </div>
          <div className="tl-footer-mid mono">
            一份非營利的台灣音樂祭索引 · 由樂迷編輯與維護
          </div>
          <div className="tl-footer-right mono">
            <a href="#" onClick={(e) => e.preventDefault()}>關於</a>
            <a href="#" onClick={(e) => e.preventDefault()}>聯絡</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Newsletter</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LibraryTablet;
