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

  const statusConfig = (s) => ({
    pending:     { label: 'รอดำเนินการ', color: '#fbbf24', bg: '#92400e22', icon: '⏳' },
    in_progress: { label: 'กำลังซ่อม',  color: '#60a5fa', bg: '#1e3a5f22', icon: '🔨' },
    done:        { label: 'เสร็จแล้ว',  color: '#34d399', bg: '#06644222', icon: '✅' },
  }[s] || { label: s, color: '#aaa', bg: '#ffffff11', icon: '❓' })

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>แจ้งซ่อม</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        {/* Form */}
        <div style={styles.formCard}>
          <p style={styles.formTitle}>📝 แจ้งปัญหาใหม่</p>
          <textarea
            style={styles.textarea}
            placeholder="อธิบายปัญหาที่พบ เช่น ก๊อกน้ำรั่ว, ไฟดับ, แอร์ไม่เย็น..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
          <button
            style={{
              ...styles.submitBtn,
              opacity: (!description.trim() || sending) ? 0.5 : 1,
            }}
            onClick={handleSubmit}
            disabled={sending || !description.trim()}
          >
            {sending ? '📤 กำลังส่ง...' : '📤 ส่งคำร้อง'}
          </button>
        </div>

        {/* History */}
        {requests.length > 0 && (
          <>
            <p style={styles.sectionLabel}>ประวัติการแจ้งซ่อม</p>
            {requests.map(r => {
              const s = statusConfig(r.status)
              return (
                <div key={r.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <div style={{ ...styles.statusBadge, background: s.bg, color: s.color, border: `1px solid ${s.color}44` }}>
                      {s.icon} {s.label}
                    </div>
                    <span style={styles.date}>
                      {new Date(r.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <p style={styles.desc}>{r.description}</p>
                  {r.admin_note && (
                    <div style={styles.noteBox}>
                      <span>💬 หมายเหตุ: </span>{r.admin_note}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {requests.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>🔧</p>
            <p style={{ color: '#aaa' }}>ยังไม่มีประวัติแจ้งซ่อม</p>
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
    background: 'radial-gradient(circle, #10b98122, transparent)',
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
  formCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '20px',
    marginBottom: 24,
  },
  formTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', margin: '0 0 14px' },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: 1.6,
  },
  submitBtn: {
    width: '100%',
    marginTop: 12,
    padding: '13px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 20px #10b98155',
  },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px' },
  requestCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 12,
  },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12 },
  date: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  desc: { color: '#fff', fontSize: 14, margin: 0, lineHeight: 1.6 },
  noteBox: {
    marginTop: 10,
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 10,
    padding: '8px 12px',
    color: '#c4b5fd',
    fontSize: 13,
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#fff' },
}