import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function RepairPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: tenant } = await supabase
        .from('room_tenants')
        .select('room_id')
        .eq('user_id', user.id)
        .is('end_date', null)
        .single()

      if (tenant) {
        setRoomId(tenant.room_id)
        const { data } = await supabase
          .from('repair_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setRequests(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleSubmit = async () => {
    if (!description.trim() || !roomId) return
    setSending(true)
    const { data, error } = await supabase
      .from('repair_requests')
      .insert({ room_id: roomId, user_id: user.id, description })
      .select()
      .single()
    if (!error) {
      setRequests([data, ...requests])
      setDescription('')
    }
    setSending(false)
  }

  const statusLabel = (s) => {
    if (s === 'pending') return { text: 'รอดำเนินการ', color: '#fbbf24' }
    if (s === 'in_progress') return { text: 'กำลังซ่อม', color: '#60a5fa' }
    return { text: 'เสร็จแล้ว', color: '#34d399' }
  }

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>แจ้งซ่อม</h2>
      </div>

      <div style={styles.card}>
        <p style={styles.sectionTitle}>แจ้งปัญหาใหม่</p>
        <textarea
          style={styles.textarea}
          placeholder="อธิบายปัญหาที่พบ เช่น ก๊อกน้ำรั่ว, ไฟดับ..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={sending || !description.trim()}
        >
          {sending ? 'กำลังส่ง...' : '📤 ส่งคำร้อง'}
        </button>
      </div>

      {requests.length > 0 && (
        <div style={{ margin: '24px 24px 0' }}>
          <p style={styles.sectionTitle}>ประวัติการแจ้งซ่อม</p>
          {requests.map(r => {
            const s = statusLabel(r.status)
            return (
              <div key={r.id} style={styles.requestCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: s.color, fontSize: 12 }}>{s.text}</span>
                  <span style={styles.date}>
                    {new Date(r.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <p style={styles.desc}>{r.description}</p>
                {r.admin_note && (
                  <p style={styles.note}>💬 {r.admin_note}</p>
                )}
              </div>
            )
          })}
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
    margin: '0 24px',
    background: '#16213e',
    borderRadius: 16,
    padding: '20px',
    border: '1px solid #2a2a4a',
  },
  sectionTitle: { color: '#aaa', fontSize: 13, margin: '0 0 12px' },
  textarea: {
    width: '100%',
    background: '#0f3460',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#fff',
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    marginTop: 12,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#7c3aed',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  requestCard: {
    background: '#16213e',
    borderRadius: 8,
    padding: '14px 16px',
    marginBottom: 10,
    border: '1px solid #2a2a4a',
  },
  date: { color: '#666', fontSize: 12 },
  desc: { color: '#fff', fontSize: 14, margin: 0 },
  note: { color: '#a78bfa', fontSize: 13, margin: '8px 0 0' },
}