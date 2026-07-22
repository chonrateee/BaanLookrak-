import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/main')
    } catch {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.bg}>
      <GlobalStyle />
      <div style={styles.vignette} />

      <div style={styles.card}>
        <div style={styles.cardTopStripe} />
        <div style={styles.cardInner}>
          <div style={styles.logoWrap}>
            <span style={styles.logo}>🏠</span>
          </div>
          <h1 style={styles.appName}>BaanLookRak</h1>
          <p style={styles.appSub}>ระบบบริหารหอพัก</p>

          <div style={styles.divider} />

          <h2 style={styles.heading}>เข้าสู่ระบบ</h2>

          <form onSubmit={handleLogin} style={styles.form}>
            <div className="input-wrap" style={styles.inputWrap}>
              <span style={styles.inputIcon} aria-hidden="true">✉️</span>
              <input
                style={styles.input}
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-wrap" style={styles.inputWrap}>
              <span style={styles.inputIcon} aria-hidden="true">🔒</span>
              <input
                style={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                style={styles.eyeIcon}
                onClick={() => setShowPass(!showPass)}
                role="button"
                tabIndex={0}
                aria-label={showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowPass(!showPass) }}
              >
                {showPass ? '🙈' : '👁️'}
              </span>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span aria-hidden="true">⚠️</span> {error}
              </div>
            )}

            <button className="submit-btn" style={styles.btn} type="submit" disabled={loading}>
              {loading ? <span>กำลังเข้าสู่ระบบ...</span> : <span>เข้าสู่ระบบ →</span>}
            </button>
          </form>

          <p style={styles.registerText}>
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" style={styles.link}>สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

      .input-wrap {
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .input-wrap:focus-within {
        border-color: #c9a463 !important;
        background: #20252e !important;
      }
      input::placeholder { color: #5b616c; }

      .eye-icon { transition: opacity 0.15s ease; }
      .eye-icon:hover { opacity: 1 !important; }

      .submit-btn {
        transition: filter 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
      }
      .submit-btn:hover:not(:disabled) { filter: brightness(1.08); }
      .submit-btn:active:not(:disabled) { transform: scale(0.98); }
      .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .submit-btn:focus-visible {
        outline: 2px solid #c9a463;
        outline-offset: 2px;
      }

      a { transition: color 0.15s ease; }

      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `}</style>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#12151b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Noto Sans Thai', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(700px 380px at 50% -10%, rgba(201,164,99,0.10), transparent)',
    pointerEvents: 'none',
  },

  card: {
    position: 'relative',
    zIndex: 1,
    background: 'linear-gradient(165deg, #232833, #171a21)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  cardTopStripe: {
    height: 4,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  cardInner: { padding: '36px 32px 32px', textAlign: 'center' },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(201,164,99,0.12)',
    border: '1px solid rgba(201,164,99,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  logo: { fontSize: 32 },

  appName: {
    color: '#f2efe6',
    fontSize: 22,
    fontWeight: 700,
    margin: '8px 0 2px',
    letterSpacing: 0.4,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  appSub: { color: '#8b909b', fontSize: 12, margin: '0 0 20px', letterSpacing: 1 },

  divider: {
    height: 1,
    background: 'linear-gradient(to right, transparent, rgba(201,164,99,0.25), transparent)',
    margin: '0 0 24px',
  },
  heading: {
    color: '#f2efe6',
    fontSize: 18,
    fontWeight: 700,
    margin: '0 0 20px',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#1b1f27',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '0 14px',
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.7 },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f2efe6',
    fontSize: 14,
    padding: '13px 0',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  eyeIcon: {
    fontSize: 16,
    cursor: 'pointer',
    opacity: 0.7,
    userSelect: 'none',
  },
  errorBox: {
    background: 'rgba(226,109,143,0.08)',
    border: '1px solid rgba(226,109,143,0.25)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e26d8f',
    fontSize: 13,
    textAlign: 'left',
  },
  btn: {
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #c9a463, #a9854e)',
    color: '#171a21',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  registerText: { color: '#8b909b', fontSize: 13, marginTop: 24 },
  link: { color: '#c9a463', textDecoration: 'none', fontWeight: 600 },
}