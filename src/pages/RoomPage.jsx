import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function RoomPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  setRoom(null)
  setLoading(true)

  if (!user) {
    setLoading(false)
    return
  }

  let cancelled = false
  const fetchRoom = async () => {
    const { data } = await supabase
      .from('room_tenants')
      .select(`room_id, start_date, rooms(id, room_number, floor, rent_price, status)`)
      .eq('user_id', user.id)
      .is('end_date', null)
      .single()

    if (!cancelled) {
      setRoom(data?.rooms ?? null)
      setLoading(false)
    }
  }
  fetchRoom()

  return () => { cancelled = true }
}, [user])
  if (loading) {
    return (
      <div style={styles.bg}>
        <FontImport />
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#8b909b', fontSize: 13, marginTop: 14 }}>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.bg}>
      <FontImport />
      <div style={styles.vignette} />

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ห้องพักของฉัน</h2>
        <div style={{ width: 40 }} />
      </div>

      {room ? (
        <div style={styles.content}>
          {/* Keycard */}
          <div style={styles.card}>
            <div style={styles.cardTopStripe} />

            <div style={styles.cardTop}>
              <div style={styles.cardTopRow}>
                <span style={styles.eyebrow}>บัตรผู้พักอาศัย</span>
                <span style={styles.serial}>NO.{String(room.room_number).padStart(4, '0')}</span>
              </div>
              <h1 style={styles.roomNum}>{room.room_number}</h1>
              <div style={styles.statusPill}>
                <span style={styles.statusDot} />
                กำลังพักอาศัย
              </div>
            </div>

            {/* Perforation */}
            <div style={styles.perfRow}>
              <div style={styles.notchLeft} />
              <div style={styles.perfLine} />
              <div style={styles.notchRight} />
            </div>

            {/* Stub */}
            <div style={styles.cardStub}>
              <div style={styles.stubItem}>
                <p style={styles.stubLabel}>ชั้น</p>
                <p style={styles.stubValue}>{room.floor}</p>
              </div>
              <div style={styles.stubDivider} />
              <div style={styles.stubItem}>
                <p style={styles.stubLabel}>ค่าเช่า / เดือน</p>
                <p style={styles.stubValue}>{room.rent_price?.toLocaleString()} ฿</p>
              </div>
              <div style={styles.stubDivider} />
              <div style={styles.stubItem}>
                <p style={styles.stubLabel}>สถานะ</p>
                <p style={{ ...styles.stubValue, color: '#4fd1c5' }}>Active</p>
              </div>
            </div>

            <div style={styles.barcode}>
              {barcodeBars.map((w, i) => (
                <div key={i} style={{ ...styles.barcodeBar, width: w }} />
              ))}
            </div>
          </div>

          {/* Amenity tags */}
          <div style={styles.tagRow}>
            <AmenityTag icon="🏢" label="อาคาร" value="A" />
            <AmenityTag icon="📐" label="ขนาด" value="28 ม²" />
            <AmenityTag icon="❄️" label="แอร์" value="มี" />
            <AmenityTag icon="🛁" label="ห้องน้ำ" value="ในห้อง" />
          </div>

          {/* Actions */}
          <button style={styles.repairBtn} onClick={() => navigate('/repair')}>
            🔧 แจ้งซ่อมห้อง
          </button>
          <button style={styles.billBtn} onClick={() => navigate('/bills')}>
            💰 ดูค่าใช้จ่าย
          </button>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>▢</p>
            <p style={styles.emptyTitle}>ยังไม่มีห้องผูกกับบัญชีนี้</p>
            <p style={styles.emptyBody}>กรุณาติดต่อผู้ดูแลหอพักเพื่อรับมอบหมายห้องพัก</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AmenityTag({ icon, label, value }) {
  return (
    <div style={styles.tag}>
      <span style={styles.tagIcon}>{icon}</span>
      <div>
        <p style={styles.tagLabel}>{label}</p>
        <p style={styles.tagValue}>{value}</p>
      </div>
    </div>
  )
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;600&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
      @keyframes cardRise {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `}</style>
  )
}

const barcodeBars = [3, 6, 2, 8, 4, 2, 6, 3, 5, 2, 7, 4, 3, 6, 2, 8, 3, 5]

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#12151b',
    fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif",
    paddingBottom: 48,
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 140,
  },
  spinner: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '2px solid rgba(201,164,99,0.25)',
    borderTopColor: '#c9a463',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 24px 8px',
    marginBottom: 22,
    position: 'relative',
    zIndex: 1,
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#c9a463',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  title: { color: '#f2efe6', fontSize: 17, margin: 0, fontWeight: 600, letterSpacing: 0.2 },
  content: { padding: '0 20px', position: 'relative', zIndex: 1 },

  card: {
    position: 'relative',
    background: 'linear-gradient(165deg, #232833, #171a21)',
    border: '1px solid rgba(201,164,99,0.22)',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    animation: 'cardRise 0.5s ease-out',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
  cardTopStripe: {
    height: 5,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  cardTop: { padding: '22px 24px 26px' },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#c9a463',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  serial: {
    color: '#5b616c',
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: 0.5,
  },
  roomNum: {
    color: '#f2efe6',
    fontSize: 60,
    fontWeight: 700,
    margin: '0 0 16px',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: -1,
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(79,209,197,0.12)',
    border: '1px solid rgba(79,209,197,0.3)',
    color: '#7fe0d5',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4fd1c5',
    boxShadow: '0 0 6px #4fd1c5',
  },

  perfRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 0,
  },
  perfLine: {
    flex: 1,
    borderTop: '2px dashed rgba(201,164,99,0.25)',
  },
  notchLeft: {
    position: 'absolute',
    left: -12,
    top: -12,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#12151b',
  },
  notchRight: {
    position: 'absolute',
    right: -12,
    top: -12,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#12151b',
  },

  cardStub: {
    display: 'flex',
    padding: '22px 24px',
  },
  stubItem: { flex: 1, textAlign: 'center' },
  stubLabel: {
    color: '#5b616c',
    fontSize: 10.5,
    margin: '0 0 6px',
    letterSpacing: 0.4,
  },
  stubValue: {
    color: '#f2efe6',
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  stubDivider: { width: 1, background: 'rgba(201,164,99,0.15)' },

  barcode: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 3,
    padding: '0 24px 18px',
    height: 20,
    opacity: 0.5,
  },
  barcodeBar: {
    height: '100%',
    background: 'rgba(201,164,99,0.5)',
    borderRadius: 1,
  },

  tagRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1b1f27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '13px 14px',
  },
  tagIcon: { fontSize: 20 },
  tagLabel: { color: '#5b616c', fontSize: 10.5, margin: '0 0 2px' },
  tagValue: { color: '#f2efe6', fontSize: 13.5, fontWeight: 600, margin: 0 },

  repairBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #c9a463, #8a7448)',
    color: '#14171c',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 12,
    fontFamily: "'Noto Sans Thai', sans-serif",
    boxShadow: '0 8px 24px rgba(201,164,99,0.25)',
  },
  billBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: '#f2efe6',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },

  emptyCard: {
    textAlign: 'center',
    marginTop: 60,
    padding: '40px 24px',
    background: '#1b1f27',
    border: '1px dashed rgba(255,255,255,0.12)',
    borderRadius: 20,
  },
  emptyIcon: { fontSize: 34, color: '#5b616c', margin: '0 0 14px' },
  emptyTitle: { color: '#f2efe6', fontSize: 15, fontWeight: 600, margin: '0 0 6px' },
  emptyBody: { color: '#5b616c', fontSize: 13, margin: 0 },
}