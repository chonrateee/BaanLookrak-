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
      <GlobalStyle />
      <div style={styles.vignette} />

      <div style={styles.header}>
        <div style={styles.headerTopStripe} />
        <div style={styles.headerPattern} />
        <div style={styles.headerInner}>
          <div style={styles.headerTop}>
            <span style={styles.brand}>🏠 BaanRokrakk</span>
            <button className="icon-btn" style={styles.bellBtn} aria-label="การแจ้งเตือน">🔔</button>
          </div>
          <p style={styles.greeting}>สวัสดี,</p>
          <h2 style={styles.name}>{profile?.full_name || 'ผู้ใช้งาน'}</h2>
          <div style={styles.headerDivider} />
        </div>
      </div>

      <div style={styles.grid}>
        {menus.map((m, i) => (
          <div
            key={m.label}
            className="menu-card"
            style={{ ...styles.menuCard, animationDelay: `${i * 0.06}s`, '--accent': m.accent, '--glow': m.glow }}
            onClick={() => navigate(m.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(m.path) }}
          >
            <div className="menu-icon-wrap" style={{ ...styles.menuIconWrap, background: m.glow, borderColor: `${m.accent}33` }}>
              <span style={styles.menuIcon}>{m.icon}</span>
            </div>
            <div style={styles.menuLabel}>{m.label}</div>
            <div style={styles.menuSub}>{m.sub}</div>
            <span className="menu-arrow" style={{ ...styles.menuArrow, color: m.accent }}>→</span>
            <div style={{ ...styles.menuAccentBar, background: m.accent }} />
          </div>
        ))}
      </div>

      <button className="logout-btn" style={styles.logoutBtn} onClick={handleLogout}>
        <span style={{ marginRight: 8 }}>⎋</span>ออกจากระบบ
      </button>
    </div>
  )
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

      @keyframes cardPop {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .icon-btn {
        transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
      }
      .icon-btn:hover {
        background: rgba(201,164,99,0.10);
        border-color: rgba(201,164,99,0.30);
      }
      .icon-btn:active { transform: scale(0.94); }
      .icon-btn:focus-visible {
        outline: 2px solid #c9a463;
        outline-offset: 2px;
      }

      .menu-card {
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .menu-card:hover {
        transform: translateY(-3px);
        border-color: var(--accent);
        box-shadow: 0 10px 24px -12px var(--accent), 0 0 0 1px rgba(255,255,255,0.02) inset;
        background: #1e232c;
      }
      .menu-card:active { transform: translateY(-1px) scale(0.99); }
      .menu-card:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }
      .menu-card:hover .menu-icon-wrap {
        transform: scale(1.06);
      }
      .menu-card:hover .menu-arrow {
        opacity: 1;
        transform: translateX(0);
      }
      .menu-icon-wrap {
        transition: transform 0.18s ease;
      }

      .logout-btn {
        transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
      }
      .logout-btn:hover {
        background: rgba(226,109,143,0.14);
        border-color: rgba(226,109,143,0.55);
      }
      .logout-btn:active { transform: scale(0.98); }
      .logout-btn:focus-visible {
        outline: 2px solid #e26d8f;
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
        .menu-card:hover { transform: none; }
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
    marginBottom: 30,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerTopStripe: {
    height: 4,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  headerPattern: {
    position: 'absolute',
    inset: 0,
    opacity: 0.5,
    backgroundImage: `repeating-linear-gradient(45deg, rgba(201,164,99,0.05) 0px, rgba(201,164,99,0.05) 1px, transparent 1px, transparent 26px),
                       repeating-linear-gradient(-45deg, rgba(201,164,99,0.05) 0px, rgba(201,164,99,0.05) 1px, transparent 1px, transparent 26px)`,
    pointerEvents: 'none',
  },
  headerInner: { padding: '22px 24px 26px', position: 'relative' },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
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
  greeting: { color: '#8b909b', fontSize: 13, margin: '0 0 4px', letterSpacing: 0.2 },
  name: {
    color: '#f2efe6',
    fontSize: 25,
    margin: 0,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: 0.2,
  },
  headerDivider: {
    marginTop: 20,
    height: 1,
    background: 'linear-gradient(90deg, rgba(201,164,99,0.35), transparent 70%)',
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
  },
  menuIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    border: '1px solid transparent',
  },
  menuIcon: { fontSize: 26 },
  menuLabel: {
    color: '#f2efe6',
    fontSize: 14.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  menuSub: { color: '#5b616c', fontSize: 11.5 },
  menuArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 13,
    opacity: 0,
    transform: 'translateX(-4px)',
    transition: 'opacity 0.18s ease, transform 0.18s ease',
  },
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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