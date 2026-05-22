import { useEffect } from 'react';

function formatDateRange(start, end) {
  const [, startMonth, startDay] = start.split('-');
  const [, endMonth, endDay] = end.split('-');
  const sm = parseInt(startMonth, 10);
  const sd = parseInt(startDay, 10);
  const em = parseInt(endMonth, 10);
  const ed = parseInt(endDay, 10);

  if (start === end) return `${sm} 月 ${sd} 日`;
  if (sm === em) return `${sm} 月 ${sd} – ${ed} 日`;
  return `${sm} 月 ${sd} 日 – ${em} 月 ${ed} 日`;
}

function getDayCount(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.round((d2 - d1) / 86400000) + 1;
}

function MediaSlot({ label, variant = 'rect' }) {
  return (
    <div className={`detail-media-slot detail-media-slot--${variant}`}>
      <span className="mono">{label}</span>
    </div>
  );
}

export function FestivalDetail({ festival, onClose, onSave }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!festival) return null;

  const f = festival;
  const dateRange = formatDateRange(f.dateStart, f.dateEnd);
  const dayCount = getDayCount(f.dateStart, f.dateEnd);
  const ticket = f.ticket || '票價以官方公告為準';
  const description =
    f.description ||
    `${f.name} 位於 ${f.region}・${f.venue}，以 ${f.artists.join(
      '、',
    )} 等演出陣容串起島嶼聲響。${f.blurb}`;

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true">
      <div className="detail-scroll">
        <div className="detail-topbar">
          <button className="detail-back" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>返回節目單</span>
          </button>
          <div className="detail-topbar-right">
            <button className="detail-share" aria-label="分享">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <line x1="8.1" y1="10.9" x2="15.9" y2="6.1" />
                <line x1="8.1" y1="13.1" x2="15.9" y2="17.9" />
              </svg>
              <span className="mono">分享</span>
            </button>
            <button
              className={`detail-save ${f.saved ? 'detail-save--on' : ''}`}
              onClick={() => onSave(f.id)}
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
              <span className="mono">{f.saved ? '已收藏' : '加入收藏'}</span>
            </button>
          </div>
        </div>

        <header className="detail-hero">
          <div className="detail-eyebrow mono">
            No. {f.id.slice(0, 6).toUpperCase()} · {f.region.toUpperCase()} ·{' '}
            {f.dateStart.slice(0, 4)}
          </div>
          <h1 className="detail-title serif">{f.name}</h1>
          <div className="detail-title-en mono">{f.nameEn}</div>
          <p className="detail-blurb">{f.blurb}</p>
        </header>

        <div className="detail-hero-image">
          <MediaSlot label="官方主視覺" />
          <div className="detail-hero-caption mono">主視覺 · 官方照片</div>
        </div>

        <dl className="detail-meta">
          <div className="detail-meta-cell">
            <dt className="mono">活動名稱</dt>
            <dd className="serif">{f.name}</dd>
            <dd className="detail-meta-en mono">{f.nameEn}</dd>
          </div>
          <div className="detail-meta-cell">
            <dt className="mono">活動時間</dt>
            <dd className="serif">{dateRange}</dd>
            <dd className="detail-meta-en mono">
              {dayCount} 天 · {f.dateStart.slice(0, 4)}
            </dd>
          </div>
          <div className="detail-meta-cell">
            <dt className="mono">活動地點</dt>
            <dd className="serif">
              {f.region} · {f.venue}
            </dd>
            <dd className="detail-meta-en mono">{f.regionEn}, Taiwan</dd>
          </div>
          <div className="detail-meta-cell">
            <dt className="mono">票價</dt>
            <dd className="serif">{ticket}</dd>
            <dd className="detail-meta-en mono">異動以官方為準</dd>
          </div>
        </dl>

        <section className="detail-section">
          <header className="detail-section-head">
            <div className="detail-section-num mono">01</div>
            <h2 className="serif">關於這個音樂祭</h2>
          </header>
          <div className="detail-body">
            <p>{description}</p>
          </div>
          <div className="detail-side-images">
            <MediaSlot label="現場照片 1" />
            <MediaSlot label="現場照片 2" />
            <MediaSlot label="現場照片 3" />
          </div>
        </section>

        <section className="detail-section">
          <header className="detail-section-head">
            <div className="detail-section-num mono">02</div>
            <h2 className="serif">活動藝人</h2>
            <span className="detail-section-count mono">{f.artists.length} 組</span>
          </header>
          <div className="detail-artists">
            {f.artists.map((artist, index) => (
              <div key={artist} className="artist-card">
                <div className="artist-card-img">
                  <MediaSlot label="藝人照片" variant="circle" />
                </div>
                <div className="artist-card-info">
                  <div className="artist-card-num mono">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="artist-card-name serif">{artist}</div>
                  <div className="artist-card-meta mono">
                    主舞台 · DAY {Math.min(index + 1, dayCount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <header className="detail-section-head">
            <div className="detail-section-num mono">03</div>
            <h2 className="serif">交通資訊</h2>
          </header>
          <div className="detail-location">
            <div className="detail-location-text">
              <div className="loc-row">
                <div className="loc-label mono">地址</div>
                <div className="loc-value">
                  {f.region} · {f.venue}
                </div>
              </div>
              <div className="loc-row">
                <div className="loc-label mono">大眾運輸</div>
                <div className="loc-value">
                  最近捷運/火車站約 15 分鐘車程，活動期間提供接駁專車。
                </div>
              </div>
              <div className="loc-row">
                <div className="loc-label mono">自行開車</div>
                <div className="loc-value">
                  場地周邊設有臨時停車場，建議提早抵達。
                </div>
              </div>
            </div>
            <div className="detail-location-map">
              <MediaSlot label="場地平面圖 / 地圖截圖" />
            </div>
          </div>
        </section>

        <div className="detail-cta">
          <button className="detail-cta-primary">前往官方購票 ↗</button>
          <button className="detail-cta-secondary" onClick={() => onSave(f.id)}>
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M12 21s-7.5-4.5-9.5-9.5C1 7.5 4 4 7.5 4c1.7 0 3.3 0.8 4.5 2.2C13.2 4.8 14.8 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.5 12 21 12 21Z"
                fill={f.saved ? 'var(--accent)' : 'none'}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span>{f.saved ? '已加入收藏' : '加入收藏'}</span>
          </button>
        </div>

        <footer className="detail-foot">
          <div className="mono">島嶼樂遊 · ISLAND SOUND · 2026</div>
          <div className="mono">資訊來源：主辦單位官方公告，異動以官方為準。</div>
          <div className="mono" style={{ marginTop: '6px', opacity: 0.6 }}>
            如資料有誤，歡迎使用投稿功能給我們回饋 ↗
          </div>
        </footer>
      </div>
    </div>
  );
}
