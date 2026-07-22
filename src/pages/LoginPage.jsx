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
      {/* วงกลมพื้นหลัง */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>🏠</div>
        </div>
        <h1 style={styles.appName}>BaanLookRak</h1>
        <p style={styles.appSub}>ระบบบริหารหอพัก</p>

        <div style={styles.divider} />

        <h2 style={styles.heading}>เข้าสู่ระบบ</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Email */}
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>✉️</span>
            <input
              style={styles.input}
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              style={styles.input}
              type={showPass ? 'text' : 'password'}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? '🙈' : '👁️'}
            </span>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? (
              <span>กำลังเข้าสู่ระบบ...</span>
            ) : (
              <span>เข้าสู่ระบบ →</span>
            )}
          </button>
        </form>

        <p style={styles.registerText}>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" style={styles.link}>สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, #7c3aed55, transparent)',
    borderRadius: '50%',
    top: -80,
    left: -80,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    background: 'radial-gradient(circle, #4f46e555, transparent)',
    borderRadius: '50%',
    bottom: -60,
    right: -60,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
  },
  logoWrap: { marginBottom: 12 },
  logoCircle: {
    width: 72,
    height: 72,
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    margin: '0 auto',
    boxShadow: '0 8px 24px #7c3aed66',
  },
  appName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    margin: '8px 0 2px',
    letterSpacing: 1,
  },
  appSub: {
    color: '#a78bfa',
    fontSize: 12,
    margin: '0 0 20px',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
    margin: '0 0 24px',
  },
  heading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    margin: '0 0 20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '0 14px',
    transition: 'border 0.2s',
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.7 },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 14,
    padding: '13px 0',
  },
  eyeIcon: {
    fontSize: 16,
    cursor: 'pointer',
    opacity: 0.7,
    userSelect: 'none',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'left',
  },
  btn: {
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 4,
    boxShadow: '0 4px 20px #7c3aed55',
    transition: 'opacity 0.2s',
  },
  registerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 24,
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
}