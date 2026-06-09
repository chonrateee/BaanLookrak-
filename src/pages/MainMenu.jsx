import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function MainMenu() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menus = [
    { icon: '🏠', label: 'ห้องพัก', sub: 'ดูข้อมูลห้อง', path: '/room' },
    { icon: '💰', label: 'ค่าใช้จ่าย', sub: 'บิลปัจจุบัน', path: '/bills' },
    { icon: '🔧', label: 'แจ้งซ่อม', sub: 'รายการซ่อม', path: '/repair' },
    { icon: '📢', label: 'ประกาศ', sub: 'ข่าวสาร', path: '/announcements' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.brand}>🏠 DormHub</span>
          <button style={styles.bellBtn}>🔔</button>
        </div>
        <p style={styles.greeting}>สวัสดี,</p>
        <h2 style={styles.name}>{profile?.full_name || 'ผู้ใช้งาน'}</h2>
      </div>

      <div style={styles.grid}>
        {menus.map(m => (
          <div key={m.label} style={styles.menuCard} onClick={() => navigate(m.path)}>
            <div style={styles.menuIcon}>{m.icon}</div>
            <div style={styles.menuLabel}>{m.label}</div>
            <div style={styles.menuSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        ออกจากระบบ
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a2e',
    fontFamily: 'sans-serif',
    padding: '0 0 40px',
  },
  header: {
    background: '#16213e',
    padding: '24px 24px 28px',
    marginBottom: 24,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bellBtn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
  },
  greeting: { color: '#aaa', fontSize: 13, margin: '0 0 4px' },
  name: { color: '#fff', fontSize: 22, margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    padding: '0 24px',
    marginBottom: 24,
  },
  menuCard: {
    background: '#16213e',
    borderRadius: 12,
    padding: '20px 16px',
    cursor: 'pointer',
    textAlign: 'center',
    border: '1px solid #2a2a4a',
  },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  menuSub: { color: '#888', fontSize: 12 },
  logoutBtn: {
    display: 'block',
    margin: '0 24px',
    width: 'calc(100% - 48px)',
    padding: '12px',
    borderRadius: 8,
    border: '1px solid #7c3aed',
    background: 'transparent',
    color: '#7c3aed',
    fontSize: 14,
    cursor: 'pointer',
  },
}