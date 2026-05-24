// AuthPage — 島嶼樂遊 / Island Sound 登入・註冊（整頁）
// 視覺移植自 MK/auth.jsx（車票風編輯式版面），但後端維持現有 Supabase：
//   · 信箱 → Magic Link（免密碼登入連結，首次登入自動建立帳號）
//   · Google 一鍵登入
// 因此移除了 MK 設計裡的密碼欄與 6 碼 OTP 輸入，改為「寄送登入連結」流程，
// 並以 MK 的版面語彙呈現「連結已寄出」確認畫面。
import { useState, useMemo } from 'react';
import { signInWithGoogle, signInWithMagicLink } from '../lib/auth.js';
import './AuthPage.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Icons ─────────────────────────────────────────────────
const Icon = {
  mail: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7 L12 13 L21 7" />
    </svg>
  ),
  user: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 c0-4 4-7 8-7 s8 3 8 7" />
    </svg>
  ),
  google: () => (
    <svg viewBox="0 0 18 18" width="16" height="16">
      <path fill="#4285F4" d="M17.64 9.2a10.341 10.341 0 0 0-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957a8.996 8.996 0 0 0 0 8.076l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z" />
    </svg>
  ),
  arrow: () => (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="8" x2="13" y2="8" />
      <path d="M9 4 L13 8 L9 12" />
    </svg>
  ),
};

// ─── 左側編輯欄 ────────────────────────────────────────────
function LeftPanel({ mode, onBack }) {
  return (
    <aside className="auth-left">
      <a
        href="#"
        className="auth-logo"
        onClick={(e) => { e.preventDefault(); onBack(); }}
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


      <div className="auth-hero">
        <div className="auth-eyebrow">
          <span className="line"></span>
          ENTRY
          <span>·</span>
          {mode === 'signin' ? '歡迎回來' : '加入我們'}
        </div>
        <h1 className="auth-hero-title">
          通往整座島嶼的<br />
          聲音地圖。
        </h1>
        <p className="auth-hero-lede">
          建立一個帳號，你可以收藏想去的音樂祭、設定演出提醒、留下旅途筆記，
          並把整年的島嶼樂遊同步到你的行事曆。
        </p>
      </div>

      <div className="auth-quote">
        <div className="auth-quote-mark">"</div>
        <p className="auth-quote-text">
          一年裡最重要的事，不是上班、不是過年，是把每一場音樂祭的票，全部排進日曆裡。
        </p>
        <div className="auth-quote-by">
          <span className="who">— 版主</span>
          <span className="div"></span>
          <span>樂迷編輯 · 自 2026 年使用</span>
        </div>
      </div>
    </aside>
  );
}

// ─── 共用：錯誤訊息 ────────────────────────────────────────
function ErrorLine({ msg }) {
  if (!msg) return null;
  return (
    <p className="auth-fineprint" style={{ color: 'var(--accent)', marginTop: 4 }}>
      {msg}
    </p>
  );
}

// ─── 登入表單（Magic Link） ────────────────────────────────
function SignInForm({ onSwitchMode, email, setEmail, status, errorMsg, onMagicLink, onGoogle }) {
  const sending = status === 'sending';
  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onMagicLink(); }}>
      <div className="auth-banner">
        <span className="ico">♪</span>
        <span>登入後，你按下的收藏會存進帳號，換裝置、重整頁面都不會消失。</span>
      </div>

      <div className="auth-field">
        <div className="auth-field-head">
          <label className="auth-label">電子信箱 <span className="en">E-MAIL</span></label>
        </div>
        <div className="auth-input-wrap">
          <span className="ico"><Icon.mail /></span>
          <input
            type="email"
            inputMode="email"
            placeholder="hello@island-sound.tw"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      <ErrorLine msg={errorMsg} />

      <button type="submit" className="auth-submit" disabled={sending}>
        {sending ? '寄送中…' : '寄送登入連結'}
        <span className="arr"><Icon.arrow /></span>
      </button>

      <div className="auth-divider">OR · 其它方式</div>

      <div className="auth-social auth-social--single">
        <button type="button" className="auth-social-btn" onClick={onGoogle} disabled={sending}>
          <Icon.google />使用 Google 繼續
        </button>
      </div>

      <p className="auth-fineprint">
        還沒有帳號？{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchMode('signup'); }}>建立新帳號 →</a>
      </p>
    </form>
  );
}

// ─── 註冊表單（Magic Link + 稱呼） ─────────────────────────
function SignUpForm({ onSwitchMode, name, setName, email, setEmail, status, errorMsg, onMagicLink, onGoogle }) {
  const [agree, setAgree] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  const sending = status === 'sending';

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (agree) onMagicLink(); }}>
      <div className="auth-field">
        <div className="auth-field-head">
          <label className="auth-label">稱呼 <span className="en">NAME</span></label>
        </div>
        <div className="auth-input-wrap">
          <span className="ico"><Icon.user /></span>
          <input type="text" placeholder="你希望我們怎麼叫你" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
      </div>

      <div className="auth-field">
        <div className="auth-field-head">
          <label className="auth-label">電子信箱 <span className="en">E-MAIL</span></label>
        </div>
        <div className="auth-input-wrap">
          <span className="ico"><Icon.mail /></span>
          <input type="email" inputMode="email" placeholder="we-will-send-you@island-sound.tw" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>

      <ErrorLine msg={errorMsg} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <label className="auth-check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="box"></span>
          <span>
            我同意 <a href="#" onClick={(e) => e.preventDefault()} style={{ borderBottom: '1px solid var(--ink-faint)' }}>服務條款</a> 與 <a href="#" onClick={(e) => e.preventDefault()} style={{ borderBottom: '1px solid var(--ink-faint)' }}>隱私政策</a>
          </span>
        </label>
        <label className="auth-check">
          <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
          <span className="box"></span>
          <span>訂閱每月一封的「島嶼樂遊月信」 <span className="en">NEWSLETTER</span></span>
        </label>
      </div>

      <button type="submit" className="auth-submit" disabled={!agree || sending}>
        {sending ? '建立中…' : '建立帳號'}
        <span className="arr"><Icon.arrow /></span>
      </button>

      <div className="auth-divider">OR · 用社群帳號</div>

      <div className="auth-social auth-social--single">
        <button type="button" className="auth-social-btn" onClick={onGoogle} disabled={sending}>
          <Icon.google />使用 Google 註冊
        </button>
      </div>

      <p className="auth-fineprint">
        已經有帳號了？{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchMode('signin'); }}>登入 ↗</a>
      </p>
    </form>
  );
}

// ─── 連結已寄出 確認畫面 ───────────────────────────────────
function SentStep({ email, onBack, onHome }) {
  return (
    <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
      <div className="auth-banner">
        <span className="ico">✓</span>
        <span>登入連結已寄到 <strong>{email || 'your@email'}</strong>。</span>
      </div>

      <p className="auth-card-sub" style={{ marginTop: 4 }}>
        打開信箱、點擊信中的「登入連結」即可完成登入——首次登入會自動建立帳號。
        連結有時效，若沒收到請檢查垃圾信件匣。
      </p>

      <button type="button" className="auth-submit" onClick={onHome}>
        返回
        <span className="arr"><Icon.arrow /></span>
      </button>

      <p className="auth-fineprint">
        信件沒收到？{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>用別的信箱重新輸入</a>
      </p>
    </form>
  );
}

// ─── 主元件 ────────────────────────────────────────────────
export function AuthPage({ onBack }) {
  const [mode, setMode] = useState('signin'); // signin | signup | sent
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('');
  const [sentTo, setSentTo] = useState('');

  const stampNum = useMemo(() => String(Math.floor(100000 + Math.random() * 899999)), []);

  const switchMode = (m) => {
    setMode(m);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleMagicLink = async () => {
    const addr = email.trim();
    if (!EMAIL_RE.test(addr)) {
      setStatus('error');
      setErrorMsg('請輸入正確的電子信箱。');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await signInWithMagicLink(addr, mode === 'signup' ? name.trim() : undefined);
      if (error) throw error;
      setSentTo(addr);
      setMode('sent');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || '寄送登入連結失敗，請稍後再試。');
    }
  };

  const handleGoogle = async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // 成功會跳轉到 Google，不會回到這裡
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Google 登入失敗，請稍後再試。');
    }
  };

  const title = mode === 'signin' ? '歡迎回來' : mode === 'signup' ? '建立新帳號' : '查收你的信箱';
  const subtitle =
    mode === 'signin'
      ? '把你的收藏、提醒與行事曆同步——所有去年聽過的、今年想聽的，都還在原來的地方。'
      : mode === 'signup'
      ? '輸入信箱，我們會寄一條登入連結給你，點開即完成註冊。'
      : '';

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-topnav">
          <a href="#" className="auth-back" onClick={(e) => { e.preventDefault(); onBack(); }}>
            <span className="arr">←</span>
            返回
          </a>
          <div className="auth-topnav-right">
            <span>需要協助？</span>
            <a href="#" onClick={(e) => e.preventDefault()}>寫信給我們</a>
          </div>
        </div>

        <LeftPanel mode={mode} onBack={onBack} />

        <div className="auth-perf" aria-hidden></div>

        <main className="auth-right">
          <div className="auth-card">
            <div className="auth-stamp">
              TICKET No.
              <span className="num">{stampNum}</span>
            </div>

            {mode !== 'sent' && (
              <div className="auth-tabs" role="tablist">
                <button className={`auth-tab ${mode === 'signin' ? 'auth-tab--on' : ''}`} onClick={() => switchMode('signin')}>登入</button>
                <button className={`auth-tab ${mode === 'signup' ? 'auth-tab--on' : ''}`} onClick={() => switchMode('signup')}>註冊</button>
              </div>
            )}

            <div className="auth-card-head">
              <h2 className="auth-card-title">{title}</h2>
              {subtitle && <p className="auth-card-sub">{subtitle}</p>}
            </div>

            {mode === 'signin' && (
              <SignInForm
                onSwitchMode={switchMode}
                email={email}
                setEmail={setEmail}
                status={status}
                errorMsg={errorMsg}
                onMagicLink={handleMagicLink}
                onGoogle={handleGoogle}
              />
            )}
            {mode === 'signup' && (
              <SignUpForm
                onSwitchMode={switchMode}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                status={status}
                errorMsg={errorMsg}
                onMagicLink={handleMagicLink}
                onGoogle={handleGoogle}
              />
            )}
            {mode === 'sent' && (
              <SentStep email={sentTo} onBack={() => switchMode('signin')} onHome={onBack} />
            )}
          </div>
        </main>

        <footer className="auth-foot">
          <div>© 2026 ISLAND · SOUND</div>
          <div className="row">
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>條款</a>
            <span>·</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>隱私</a>
            <span>·</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Cookies</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AuthPage;
