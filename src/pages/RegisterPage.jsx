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
      <div style={styles.card}>
        <div style={styles.logo}>🏠</div>
        <h2 style={styles.title}>สมัครสมาชิก</h2>
        <p style={styles.subtitle}>BaanLookRak DormHub</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="ชื่อ-นามสกุล"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p style={styles.link}>
          มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#16213e',
    borderRadius: 16,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 360,
    textAlign: 'center',
  },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, margin: '0 0 4px' },
  subtitle: { color: '#888', fontSize: 13, margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #333',
    background: '#0f3460',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#7c3aed',
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 4,
  },
  error: { color: '#f87171', fontSize: 13, margin: 0 },
  link: { color: '#888', fontSize: 13, marginTop: 20 },
}