// 投稿 Modal — SubmitModal
import { useState, useEffect } from 'react';

function genCaptcha() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXY3456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function SubmitModal({ open, onClose }) {
  const [form, setForm] = useState({ nick: '', subject: '', body: '', captcha: '' });
  const [captchaCode, setCaptchaCode] = useState(genCaptcha);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ESC 關閉 + 鎖定背景捲動
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // 每次開啟時重設表單
  useEffect(() => {
    if (open) {
      setForm({ nick: '', subject: '', body: '', captcha: '' });
      setCaptchaCode(genCaptcha());
      setErrors({});
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const handleField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: null }));
  };

  const refreshCaptcha = () => {
    setCaptchaCode(genCaptcha());
    setForm((f) => ({ ...f, captcha: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.nick.trim()) er.nick = '請輸入暱稱';
    if (!form.subject.trim()) er.subject = '請輸入主旨';
    if (form.body.trim().length < 10) er.body = '內容至少 10 個字';
    if (form.captcha.trim().toUpperCase() !== captchaCode) er.captcha = '驗證碼不正確';
    setErrors(er);
    if (Object.keys(er).length === 0) setSubmitted(true);
  };

  // 驗證碼每個字元略微旋轉
  const captchaChars = captchaCode.split('').map((ch, i) => (
    <span
      key={i}
      style={{
        display: 'inline-block',
        transform: `rotate(${(i % 2 ? 1 : -1) * (4 + i)}deg) translateY(${(i % 2) * -2}px)`,
        color: i % 2 ? 'var(--ink)' : 'var(--camel-deep)',
      }}
    >{ch}</span>
  ));

  return (
    <div className="submit-backdrop" onClick={onClose}>
      <div className="submit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="submit-x" onClick={onClose} aria-label="關閉">×</button>

        {submitted ? (
          <div className="submit-thanks">
            <div className="submit-thanks-mark serif">○</div>
            <h2 className="serif">已收到你的投稿</h2>
            <p className="mono">SUBMISSION RECEIVED · 編輯室將於 3 個工作天內回覆</p>
            <div className="submit-thanks-summary">
              <div><span className="mono">暱稱</span><span>{form.nick}</span></div>
              <div><span className="mono">主旨</span><span>{form.subject}</span></div>
            </div>
            <button className="submit-btn submit-btn--primary" onClick={onClose}>關閉</button>
          </div>
        ) : (
          <>
            <header className="submit-head">
              <div className="submit-eyebrow mono">SUBMIT · 投稿給編輯室</div>
              <h2 className="serif">分享你的音樂祭觀察</h2>
              <p className="submit-lede">
                看到我們漏掉的音樂祭？想分享現場心得或推薦樂團？歡迎投稿，編輯室會親自閱讀每一封來信。
              </p>
            </header>

            <form className="submit-form" onSubmit={handleSubmit} noValidate>
              <div className={`submit-field ${errors.nick ? 'is-error' : ''}`}>
                <label className="mono" htmlFor="sub-nick">
                  暱稱 <span className="submit-req">*</span>
                </label>
                <input
                  id="sub-nick"
                  type="text"
                  placeholder="想用什麼名字署名？"
                  value={form.nick}
                  onChange={handleField('nick')}
                  maxLength={20}
                />
                {errors.nick && <div className="submit-error">{errors.nick}</div>}
              </div>

              <div className={`submit-field ${errors.subject ? 'is-error' : ''}`}>
                <label className="mono" htmlFor="sub-subject">
                  主旨 <span className="submit-req">*</span>
                </label>
                <input
                  id="sub-subject"
                  type="text"
                  placeholder="一句話總結這次投稿"
                  value={form.subject}
                  onChange={handleField('subject')}
                  maxLength={50}
                />
                {errors.subject && <div className="submit-error">{errors.subject}</div>}
              </div>

              <div className={`submit-field ${errors.body ? 'is-error' : ''}`}>
                <label className="mono" htmlFor="sub-body">
                  內容 <span className="submit-req">*</span>
                  <span className="submit-counter mono">{form.body.length} / 1000</span>
                </label>
                <textarea
                  id="sub-body"
                  rows="6"
                  placeholder={'活動細節、心得、推薦理由…\n附上連結也歡迎'}
                  value={form.body}
                  onChange={handleField('body')}
                  maxLength={1000}
                />
                {errors.body && <div className="submit-error">{errors.body}</div>}
              </div>

              <div className={`submit-field submit-captcha ${errors.captcha ? 'is-error' : ''}`}>
                <label className="mono" htmlFor="sub-captcha">
                  驗證碼 <span className="submit-req">*</span>
                </label>
                <div className="submit-captcha-row">
                  <div className="submit-captcha-box serif" aria-label={`驗證碼 ${captchaCode}`}>
                    <svg viewBox="0 0 140 48" className="submit-captcha-noise" aria-hidden="true">
                      <line x1="6" y1="38" x2="135" y2="10" stroke="var(--camel)" strokeWidth="0.8" opacity="0.4"/>
                      <line x1="12" y1="14" x2="130" y2="36" stroke="var(--camel-deep)" strokeWidth="0.6" opacity="0.4"/>
                      <circle cx="20" cy="24" r="1" fill="var(--ink-soft)" opacity="0.5"/>
                      <circle cx="62" cy="34" r="0.8" fill="var(--ink-soft)" opacity="0.5"/>
                      <circle cx="108" cy="14" r="1" fill="var(--ink-soft)" opacity="0.5"/>
                    </svg>
                    <span className="submit-captcha-text">{captchaChars}</span>
                  </div>
                  <button
                    type="button"
                    className="submit-captcha-refresh"
                    onClick={refreshCaptcha}
                    aria-label="換一組驗證碼"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/>
                      <polyline points="23 20 23 14 17 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    <span className="mono">換一張</span>
                  </button>
                  <input
                    id="sub-captcha"
                    type="text"
                    placeholder="輸入上方四碼"
                    value={form.captcha}
                    onChange={handleField('captcha')}
                    maxLength={4}
                    autoComplete="off"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                {errors.captcha && <div className="submit-error">{errors.captcha}</div>}
              </div>

              <div className="submit-actions">
                <button type="button" className="submit-btn submit-btn--secondary" onClick={onClose}>取消</button>
                <button type="submit" className="submit-btn submit-btn--primary">送出投稿</button>
              </div>

              <div className="submit-policy mono">
                送出代表你同意我們在文章中匿名引用內容。詳見《投稿規範》。
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
