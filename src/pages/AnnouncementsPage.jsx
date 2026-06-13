import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })
      setAnnouncements(data || [])
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ประกาศ</h2>
      </div>

      {announcements.length > 0 ? (
        <div style={{ padding: '0 24px' }}>
          {announcements.map(a => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.badge}>📢 ประกาศ</span>
                <span style={styles.date}>
                  {new Date(a.created_at).toLocaleDateString('th-TH')}
                </span>
              </div>
              <h3 style={styles.annoTitle}>{a.title}</h3>
              <p style={styles.content}>{a.content}</p>
              <p style={styles.author}>โดย {a.users?.full_name || 'ผู้ดูแล'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={{ color: '#aaa', fontSize: 40 }}>📭</p>
          <p style={{ color: '#aaa' }}>ยังไม่มีประกาศ</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#1a1a2e', fontFamily: 'sans-serif', paddingBottom: 40 },
  center: { color: '#fff', textAlign: 'center', marginTop: 100 },
  header: {
    background: '#16213e',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  back: { background: 'none', border: 'none', color: '#aaa', fontSize: 14, cursor: 'pointer' },
  title: { color: '#fff', fontSize: 18, margin: 0 },
  card: {
    background: '#16213e',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 16,
    border: '1px solid #2a2a4a',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: {
    background: '#7c3aed33',
    color: '#a78bfa',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
  },
  date: { color: '#666', fontSize: 12 },
  annoTitle: { color: '#fff', fontSize: 16, margin: '0 0 8px' },
  content: { color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' },
  author: { color: '#666', fontSize: 12, margin: 0 },
  empty: { textAlign: 'center', marginTop: 80 },
}