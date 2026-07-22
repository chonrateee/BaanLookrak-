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
    { icon: '🏠', label: 'ห้องพัก', sub: 'ดูข้อมูลห้อง', path: '/room', accent: '#c9a463', glow: 'rgba(201,164,99,0.16)' },
    { icon: '💰', label: 'ค่าใช้จ่าย', sub: 'บิลปัจจุบัน', path: '/bills', accent: '#4fd1c5', glow: 'rgba(79,209,197,0.16)' },
    { icon: '🔧', label: 'แจ้งซ่อม', sub: 'รายการซ่อม', path: '/repair', accent: '#f2a65a', glow: 'rgba(242,166,90,0.16)' },
    { icon: '📢', label: 'ประกาศ', sub: 'ข่าวสาร', path: '/announcements', accent: '#e26d8f', glow: 'rgba(226,109,143,0.16)' },
  ]

  return (
    <div style={styles.container}>
      <FontImport />
      <div style={styles.vignette} />

      <div style={styles.header}>
        <div style={styles.headerTopStripe} />
        <div style={styles.headerInner}>
          <div style={styles.headerTop}>
            <span style={styles.brand}>🏠 BaanRokrak</span>
            <button style={styles.bellBtn} aria-label="การแจ้งเตือน">🔔</button>
          </div>
          <p style={styles.greeting}>สวัสดี,</p>
          <h2 style={styles.name}>{profile?.full_name || 'ผู้ใช้งาน'}</h2>
        </div>
      </div>

      <div style={styles.grid}>
        {menus.map((m, i) => (
          <div
            key={m.label}
            style={{ ...styles.menuCard, animationDelay: `${i * 0.06}s` }}
            onClick={() => navigate(m.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(m.path) }}
          >
            <div style={{ ...styles.menuIconWrap, background: m.glow }}>
              <span style={styles.menuIcon}>{m.icon}</span>
            </div>
            <div style={styles.menuLabel}>{m.label}</div>
            <div style={styles.menuSub}>{m.sub}</div>
            <div style={{ ...styles.menuAccentBar, background: m.accent }} />
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        ออกจากระบบ
      </button>
    </div>
  )
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
      @keyframes cardPop {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
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
    fontFamily: "'Noto Sans Thai', sans-serif",
    padding: '0 0 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(700px 380px at 50% -10%, rgba(201,164,99,0.10), transparent)',
    pointerEvents: 'none',
  },

  header: {
    position: 'relative',
    background: 'linear-gradient(165deg, #232833, #171a21)',
    borderBottom: '1px solid rgba(201,164,99,0.18)',
    marginBottom: 26,
    zIndex: 1,
  },
  headerTopStripe: {
    height: 4,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  headerInner: { padding: '20px 24px 28px' },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: {
    color: '#f2efe6',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.3,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  bellBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    width: 36,
    height: 36,
    fontSize: 16,
    cursor: 'pointer',
  },
  greeting: { color: '#8b909b', fontSize: 13, margin: '0 0 4px' },
  name: {
    color: '#f2efe6',
    fontSize: 24,
    margin: 0,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  grid: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    padding: '0 20px',
    marginBottom: 26,
  },
  menuCard: {
    position: 'relative',
    background: '#1b1f27',
    borderRadius: 18,
    padding: '22px 18px 18px',
    cursor: 'pointer',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
    animation: 'cardPop 0.4s ease-out both',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  },
  menuIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  menuIcon: { fontSize: 26 },
  menuLabel: {
    color: '#f2efe6',
    fontSize: 14.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  menuSub: { color: '#5b616c', fontSize: 11.5 },
  menuAccentBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    opacity: 0.85,
  },

  logoutBtn: {
    position: 'relative',
    zIndex: 1,
    display: 'block',
    margin: '0 20px',
    width: 'calc(100% - 40px)',
    padding: '14px',
    borderRadius: 14,
    border: '1px solid rgba(226,109,143,0.35)',
    background: 'rgba(226,109,143,0.08)',
    color: '#e26d8f',
    fontSize: 14.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
}