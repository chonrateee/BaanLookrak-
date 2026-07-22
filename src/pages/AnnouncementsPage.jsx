import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })
      setAnnouncements(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ประกาศ</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        {announcements.length > 0 ? announcements.map((a, i) => (
          <div key={a.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.iconWrap}>📢</div>
              <div style={{ flex: 1 }}>
                <h3 style={styles.annoTitle}>{a.title}</h3>
                <p style={styles.meta}>
                  โดย {a.users?.full_name || 'ผู้ดูแล'} · {new Date(a.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              {i === 0 && <div style={styles.newBadge}>ใหม่</div>}
            </div>
            <div style={styles.divider} />
            <p style={styles.content}>{a.content}</p>
          </div>
        )) : (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>📭</p>
            <p style={{ color: '#aaa' }}>ยังไม่มีประกาศ</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, #ef444422, transparent)',
    borderRadius: '50%',
    top: -100,
    right: -100,
    pointerEvents: 'none',
  },
  center: { color: '#fff', textAlign: 'center', marginTop: 100, fontFamily: 'sans-serif' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  back: { background: 'none', border: 'none', color: '#a78bfa', fontSize: 14, cursor: 'pointer' },
  title: { color: '#fff', fontSize: 18, margin: 0, fontWeight: 'bold' },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '18px 20px',
    marginBottom: 14,
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  annoTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', margin: '0 0 4px' },
  meta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 },
  newBadge: {
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#f87171',
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 20,
    flexShrink: 0,
  },
  divider: { borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 12px' },
  content: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, margin: 0 },
  empty: { textAlign: 'center', marginTop: 80, color: '#fff' },
}