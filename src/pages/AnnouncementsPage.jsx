import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [latestBill, setLatestBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })
      setAnnouncements(data || [])

      if (profile?.id) {
        const { data: bill } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        setLatestBill(bill || null)
      }

      setLoading(false)
    }
    fetch()
  }, [profile?.id])

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
          <h2 style={styles.title}>ประกาศ</h2>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ padding: '0 20px', position: 'relative', zIndex: 1, paddingBottom: 40 }}>

        {latestBill && (
          <div className="bill-banner" style={styles.billBanner} onClick={() => navigate('/bills')} role="button" tabIndex={0}>
            <div style={styles.billIconWrap}>💰</div>
            <div style={{ flex: 1 }}>
              <p style={styles.billLabel}>แจ้งเก็บค่าบิล{latestBill.month ? ` เดือน${latestBill.month}` : ''}</p>
              <p style={styles.billDate}>
                {latestBill.due_date
                  ? `ครบกำหนด ${new Date(latestBill.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'ยังไม่ระบุวันครบกำหนด'}
              </p>
            </div>
            {latestBill.amount != null && (
              <div style={styles.billAmountWrap}>
                <span style={styles.billAmount}>{Number(latestBill.amount).toLocaleString('th-TH')}</span>
                <span style={styles.billAmountLabel}>บาท</span>
              </div>
            )}
          </div>
        )}

        {announcements.length > 0 ? announcements.map((a, i) => (
          <div key={a.id} className="anno-card" style={styles.card}>
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
            <p style={{ fontSize: 44, margin: '0 0 8px' }}>📭</p>
            <p style={{ color: '#8b909b', margin: 0 }}>ยังไม่มีประกาศ</p>
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

      .back-btn { transition: color 0.15s ease, opacity 0.15s ease; }
      .back-btn:hover { opacity: 0.75; }
      .back-btn:focus-visible {
        outline: 2px solid #c9a463;
        outline-offset: 2px;
        border-radius: 6px;
      }

      .anno-card {
        transition: border-color 0.15s ease, transform 0.15s ease;
      }
      .anno-card:hover {
        border-color: rgba(226,109,143,0.25);
        transform: translateY(-1px);
      }

      .bill-banner {
        transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
      }
      .bill-banner:hover {
        border-color: rgba(79,209,197,0.5);
        transform: translateY(-1px);
      }
      .bill-banner:focus-visible {
        outline: 2px solid #4fd1c5;
        outline-offset: 2px;
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

  billBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'linear-gradient(135deg, rgba(79,209,197,0.10), rgba(79,209,197,0.03))',
    border: '1px solid rgba(79,209,197,0.28)',
    borderRadius: 18,
    padding: '16px 18px',
    marginBottom: 20,
    cursor: 'pointer',
  },
  billIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(79,209,197,0.16)',
    border: '1px solid rgba(79,209,197,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  billLabel: { color: '#8b909b', fontSize: 12, margin: '0 0 2px' },
  billDate: { color: '#f2efe6', fontSize: 15, fontWeight: 700, margin: 0 },
  billAmountWrap: {
    textAlign: 'center',
    flexShrink: 0,
    background: 'rgba(79,209,197,0.14)',
    borderRadius: 12,
    padding: '6px 12px',
  },
  billAmount: {
    display: 'block',
    color: '#4fd1c5',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    lineHeight: 1.1,
  },
  billAmountLabel: { color: '#4fd1c5', fontSize: 10.5 },

  card: {
    background: '#1b1f27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: '18px 20px',
    marginBottom: 14,
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    background: 'rgba(226,109,143,0.14)',
    border: '1px solid rgba(226,109,143,0.28)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  annoTitle: { color: '#f2efe6', fontSize: 15, fontWeight: 700, margin: '0 0 4px' },
  meta: { color: '#5b616c', fontSize: 12, margin: 0 },
  newBadge: {
    background: 'rgba(226,109,143,0.16)',
    border: '1px solid rgba(226,109,143,0.35)',
    color: '#e26d8f',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    flexShrink: 0,
  },
  divider: { borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 12px' },
  content: { color: '#a8adb6', fontSize: 14, lineHeight: 1.7, margin: 0 },
  empty: { textAlign: 'center', marginTop: 60, color: '#f2efe6' },
}