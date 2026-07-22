import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminLoginPage() {
  const { user, profile, loading, isAdmin, login, logout } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Once auth state settles after a login attempt, decide where to send them.
  useEffect(() => {
    if (loading || !user) return
    if (isAdmin) {
      navigate('/admin', { replace: true })
    } else if (profile) {
      // Logged in fine, but this account has no admin rights — don't let them sit
      // half-authenticated on the admin door.
      setError('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ')
      logout()
    }
  }, [loading, user, profile, isAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      // Redirect happens in the useEffect above once profile/isAdmin resolve.
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setError('')
    await logout()
  }

  return (
    <div style={styles.bg}>
      <FontImport />
      <div style={styles.vignette} />

      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.cardTopStripe} />
          <div style={{ padding: '30px 26px 28px' }}>
            <span style={styles.eyebrow}>ผู้ดูแลระบบ</span>
            <h1 style={styles.title}>เข้าสู่ระบบ Admin</h1>
            <p style={styles.subtitle}>สำหรับผู้ดูแลหอพักบ้านลูกรักเท่านั้น</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={styles.fieldLabel}>อีเมล</label>
                <input
                  style={styles.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@baanlookrak.com"
                  autoComplete="username"
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={styles.fieldLabel}>รหัสผ่าน</label>
                <input
                  style={styles.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && <p style={styles.errorText}>{error}</p>}

              <button style={styles.submitBtn} type="submit" disabled={submitting}>
                {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <button style={styles.backLink} onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
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
    fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(700px 400px at 50% -10%, rgba(201,164,99,0.10), transparent)',
    pointerEvents: 'none',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: 'linear-gradient(165deg, #232833, #171a21)',
    border: '1px solid rgba(201,164,99,0.22)',
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
  cardTopStripe: {
    height: 5,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  eyebrow: {
    color: '#c9a463',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f2efe6',
    fontSize: 24,
    fontWeight: 700,
    margin: '8px 0 4px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: { color: '#8b909b', fontSize: 12.5, margin: '0 0 24px' },
  fieldLabel: { display: 'block', color: '#8b909b', fontSize: 12, marginBottom: 6 },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#12151b',
    color: '#f2efe6',
    fontSize: 14,
    fontFamily: "'Noto Sans Thai', sans-serif",
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#e07a7a',
    fontSize: 12.5,
    margin: '10px 0 4px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #c9a463, #8a7448)',
    color: '#14171c',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 16,
    fontFamily: "'Noto Sans Thai', sans-serif",
    boxShadow: '0 8px 24px rgba(201,164,99,0.25)',
  },
  backLink: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#5b616c',
    fontSize: 12.5,
    marginTop: 18,
    cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
}