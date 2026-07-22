import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ email, password, fullName })
      navigate('/main')
    } catch (err) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <GlobalStyle />
      <div style={styles.vignette} />

      <div style={styles.card}>
        <div style={styles.cardTopStripe} />
        <div style={styles.cardInner}>
          <div style={styles.logoWrap}>
            <span style={styles.logo}>🏠</span>
          </div>
          <h2 style={styles.title}>สมัครสมาชิก</h2>
          <p style={styles.subtitle}>BaanLookRak DormHub</p>

          <form onSubmit={handleRegister} style={styles.form}>
            <input
              className="field"
              style={styles.input}
              type="text"
              placeholder="ชื่อ-นามสกุล"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <input
              className="field"
              style={styles.input}
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="field"
              style={styles.input}
              type="password"
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p style={styles.error}>{error}</p>}
            <button className="submit-btn" style={styles.button} type="submit" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p style={styles.link}>
            มีบัญชีแล้ว? <Link to="/login" style={styles.linkAnchor}>เข้าสู่ระบบ</Link>
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

      .field {
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .field:focus {
        border-color: #c9a463 !important;
        background: #20252e !important;
      }
      .field::placeholder { color: #5b616c; }

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
  container: {
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
    maxWidth: 360,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  cardTopStripe: {
    height: 4,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  cardInner: { padding: '36px 32px 32px', textAlign: 'center' },

  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'rgba(201,164,99,0.12)',
    border: '1px solid rgba(201,164,99,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  logo: { fontSize: 30 },

  title: {
    color: '#f2efe6',
    fontSize: 22,
    margin: '0 0 4px',
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: { color: '#8b909b', fontSize: 13, margin: '0 0 28px' },

  form: { display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' },
  input: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#1b1f27',
    color: '#f2efe6',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  button: {
    padding: '13px',
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
  error: {
    color: '#e26d8f',
    fontSize: 13,
    margin: '-2px 0 0',
    background: 'rgba(226,109,143,0.08)',
    border: '1px solid rgba(226,109,143,0.25)',
    borderRadius: 10,
    padding: '8px 12px',
  },
  link: { color: '#8b909b', fontSize: 13, marginTop: 24, textAlign: 'center' },
  linkAnchor: { color: '#c9a463', fontWeight: 600, textDecoration: 'none' },
}