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
    pending:     { label: 'รอดำเนินการ', color: '#f2a65a', bg: 'rgba(242,166,90,0.12)', border: 'rgba(242,166,90,0.32)', icon: '⏳' },
    in_progress: { label: 'กำลังซ่อม',  color: '#4fd1c5', bg: 'rgba(79,209,197,0.12)', border: 'rgba(79,209,197,0.32)', icon: '🔨' },
    done:        { label: 'เสร็จแล้ว',  color: '#7dd68a', bg: 'rgba(125,214,138,0.12)', border: 'rgba(125,214,138,0.32)', icon: '✅' },
  }[s] || { label: s, color: '#8b909b', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)', icon: '❓' })

  if (loading) return (
    <div style={styles.bg}>
      <div style={styles.center}>กำลังโหลด...</div>
    </div>
  )

  return (
    <div style={styles.bg}>
      <GlobalStyle />
      <div style={styles.vignette} />

      <div style={styles.header}>
        <div style={styles.headerTopStripe} />
        <div style={styles.headerInner}>
          <button className="back-btn" style={styles.back} onClick={() => navigate('/main')}>
            <span aria-hidden="true">←</span> กลับ
          </button>
          <h2 style={styles.title}>แจ้งซ่อม</h2>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ padding: '0 20px', position: 'relative', zIndex: 1, paddingBottom: 40 }}>

        <div style={styles.formCard}>
          <p style={styles.formTitle}><span aria-hidden="true">📝</span> แจ้งปัญหาใหม่</p>
          <textarea
            className="textarea"
            style={styles.textarea}
            placeholder="อธิบายปัญหาที่พบ เช่น ก๊อกน้ำรั่ว, ไฟดับ, แอร์ไม่เย็น..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
          <button
            className="submit-btn"
            style={{
              ...styles.submitBtn,
              opacity: (!description.trim() || sending) ? 0.55 : 1,
              cursor: (!description.trim() || sending) ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={sending || !description.trim()}
          >
            <span aria-hidden="true">📤</span> {sending ? 'กำลังส่ง...' : 'ส่งคำร้อง'}
          </button>
        </div>

        {requests.length > 0 && (
          <>
            <p style={styles.sectionLabel}>ประวัติการแจ้งซ่อม</p>
            {requests.map(r => {
              const s = statusConfig(r.status)
              return (
                <div key={r.id} className="request-card" style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <div style={{ ...styles.statusBadge, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      <span aria-hidden="true">{s.icon}</span> {s.label}
                    </div>
                    <span style={styles.date}>
                      {new Date(r.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <p style={styles.desc}>{r.description}</p>
                  {r.admin_note && (
                    <div style={styles.noteBox}>
                      <span style={{ fontWeight: 700 }}><span aria-hidden="true">💬</span> หมายเหตุ: </span>{r.admin_note}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {requests.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: 44, margin: '0 0 8px' }}>🔧</p>
            <p style={{ color: '#8b909b', margin: 0 }}>ยังไม่มีประวัติแจ้งซ่อม</p>
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

      .back-btn { transition: opacity 0.15s ease; }
      .back-btn:hover { opacity: 0.75; }
      .back-btn:focus-visible {
        outline: 2px solid #c9a463;
        outline-offset: 2px;
        border-radius: 6px;
      }

      .textarea {
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .textarea:focus {
        border-color: #f2a65a !important;
        background: #20252e !important;
      }
      .textarea::placeholder { color: #5b616c; }

      .submit-btn {
        transition: filter 0.15s ease, transform 0.15s ease;
      }
      .submit-btn:hover:not(:disabled) { filter: brightness(1.08); }
      .submit-btn:active:not(:disabled) { transform: scale(0.98); }
      .submit-btn:focus-visible {
        outline: 2px solid #f2a65a;
        outline-offset: 2px;
      }

      .request-card {
        transition: border-color 0.15s ease, transform 0.15s ease;
      }
      .request-card:hover {
        border-color: rgba(242,166,90,0.22);
        transform: translateY(-1px);
      }

      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `}</style>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#12151b',
    fontFamily: "'Noto Sans Thai', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 40,
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(700px 380px at 50% -10%, rgba(201,164,99,0.10), transparent)',
    pointerEvents: 'none',
  },
  center: {
    color: '#8b909b',
    textAlign: 'center',
    marginTop: 100,
    position: 'relative',
    zIndex: 1,
  },

  header: {
    position: 'relative',
    background: 'linear-gradient(165deg, #232833, #171a21)',
    borderBottom: '1px solid rgba(201,164,99,0.18)',
    marginBottom: 20,
    zIndex: 1,
  },
  headerTopStripe: {
    height: 4,
    background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)',
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#c9a463',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
    padding: '6px 4px',
  },
  title: {
    color: '#f2efe6',
    fontSize: 17,
    margin: 0,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  formCard: {
    background: '#1b1f27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: '20px',
    marginBottom: 24,
  },
  formTitle: { color: '#f2efe6', fontSize: 15, fontWeight: 700, margin: '0 0 14px' },
  textarea: {
    width: '100%',
    background: '#20242c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '12px 14px',
    color: '#f2efe6',
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Noto Sans Thai', sans-serif",
    lineHeight: 1.6,
  },
  submitBtn: {
    width: '100%',
    marginTop: 12,
    padding: '13px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #f2a65a, #cf7f34)',
    color: '#171a21',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  sectionLabel: { color: '#5b616c', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' },
  requestCard: {
    background: '#1b1f27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 12,
  },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  date: { color: '#5b616c', fontSize: 12 },
  desc: { color: '#f2efe6', fontSize: 14, margin: 0, lineHeight: 1.6 },
  noteBox: {
    marginTop: 10,
    background: 'rgba(201,164,99,0.10)',
    border: '1px solid rgba(201,164,99,0.28)',
    borderRadius: 10,
    padding: '8px 12px',
    color: '#e8cf9c',
    fontSize: 13,
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#f2efe6' },
}