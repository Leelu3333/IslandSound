// 登入 Modal — AuthModal
// 同時提供 Google 一鍵登入 與 Magic Link（信箱免密碼登入）。
// 沿用 SubmitModal 的 .submit-* 樣式系統以保持視覺一致。
import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithMagicLink } from '../lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  // 鎖定背景捲動
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 每次開啟時重設
  useEffect(() => {
    if (open) {
      setEmail('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [open]);

  if (!open) return null;

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

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setErrorMsg('請輸入正確的電子信箱。');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await signInWithMagicLink(email.trim());
      if (error) throw error;
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || '寄送登入連結失敗，請稍後再試。');
    }
  };

  const sending = status === 'sending';

  return (
    <div className="submit-backdrop">
      <div className="submit-modal auth-modal">
        <button className="submit-x" onClick={onClose} aria-label="關閉">×</button>

        {status === 'sent' ? (
          <div className="submit-thanks">
            <div className="submit-thanks-mark serif">✦</div>
            <h2 className="serif">登入連結已寄出</h2>
            <p className="mono">MAGIC LINK SENT</p>
            <p className="auth-sent-text">
              我們已寄信到 <strong>{email.trim()}</strong>
              <br />
              請打開信箱、點擊信中的「登入連結」即可完成登入。
              <br />
              連結有時效，若沒收到請檢查垃圾信件匣。
            </p>
            <button className="btn btn--primary btn--block" onClick={onClose}>
              我知道了
            </button>
          </div>
        ) : (
          <>
            <header className="submit-head">
              <div className="submit-eyebrow mono">SIGN IN · 會員登入</div>
              <h2 className="serif">登入以收藏你的音樂祭</h2>
              <p className="submit-lede">
                登入後，你按下的收藏會存進帳號，換裝置、重整頁面都不會消失。
              </p>
            </header>

            {/* Google 一鍵登入 */}
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogle}
              disabled={sending}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              <span>使用 Google 帳號登入</span>
            </button>

            <div className="auth-divider">
              <span className="mono">或</span>
            </div>

            {/* Magic Link 信箱登入 */}
            <form className="submit-form" onSubmit={handleMagicLink} noValidate>
              <div className={`submit-field ${status === 'error' ? 'is-error' : ''}`}>
                <label className="mono" htmlFor="auth-email">
                  電子信箱
                </label>
                <input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                />
                {status === 'error' && <div className="submit-error">{errorMsg}</div>}
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={sending}
              >
                {sending ? '處理中…' : '寄送登入連結'}
              </button>
            </form>

            <div className="auth-note mono">
              首次登入會自動建立帳號 · 我們僅以 email 識別你，不寄送行銷信。
            </div>
          </>
        )}
      </div>
    </div>
  );
}
