import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/*
  BillsPage
  ---------
  Assumes the `bills` table has (in addition to what BillsPage used before):
    repair_amount  numeric  -- cost of any repairs billed for that period

  If your `bills` table doesn't have this column yet, add it:
    alter table bills add column if not exists repair_amount numeric not null default 0;
*/

export default function BillsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchBills = async () => {
      const { data: tenant } = await supabase
        .from('room_tenants')
        .select('room_id')
        .eq('user_id', user.id)
        .is('end_date', null)
        .single()
      if (tenant) {
        const { data } = await supabase
          .from('bills')
          .select('*')
          .eq('room_id', tenant.room_id)
          .order('created_at', { ascending: false })
        setBills(data || [])
      }
      setLoading(false)
    }
    fetchBills()
  }, [user])

  const calcTotal = (b) =>
    (b.rent || 0) +
    (b.electric_units || 0) * (b.electric_rate || 0) +
    (b.water_amount || 0) +
    (b.repair_amount || 0) +
    (b.other_amount || 0)

  const currentBill = bills[0]
  const pastBills = bills.slice(1)

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

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ค่าใช้จ่าย</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.content}>
        {/* Current bill — keycard styled, always visible with placeholders until filled */}
        <div style={styles.card}>
          <div style={styles.cardTopStripe} />

          <div style={styles.cardTop}>
            <div style={styles.cardTopRow}>
              <span style={styles.eyebrow}>บิลประจำเดือน</span>
              <span style={styles.serial}>{currentBill?.month || 'ยังไม่ระบุ'}</span>
            </div>
            <h1 style={styles.total}>
              {currentBill ? `${calcTotal(currentBill).toLocaleString()} ฿` : '— ฿'}
            </h1>
            {currentBill ? (
              <div style={currentBill.status === 'paid' ? styles.paidPill : styles.pendingPill}>
                <span style={{
                  ...styles.statusDot,
                  background: currentBill.status === 'paid' ? '#4fd1c5' : '#e8a15a',
                  boxShadow: currentBill.status === 'paid' ? '0 0 6px #4fd1c5' : '0 0 6px #e8a15a',
                }} />
                {currentBill.status === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
              </div>
            ) : (
              <div style={styles.waitingPill}>
                <span style={styles.statusDotMuted} />
                รอผู้ดูแลกรอกยอด
              </div>
            )}
          </div>

          {/* Perforation */}
          <div style={styles.perfRow}>
            <div style={styles.notchLeft} />
            <div style={styles.perfLine} />
            <div style={styles.notchRight} />
          </div>

          {/* Line items — always shown, dashes until admin fills them in */}
          <div style={styles.lineItems}>
            <LineItem icon="🏠" label="ค่าเช่าห้อง" value={currentBill?.rent} empty={!currentBill} />
            <LineItem
              icon="⚡"
              label={currentBill ? `ค่าไฟ (${currentBill.electric_units ?? 0} หน่วย)` : 'ค่าไฟ'}
              value={currentBill ? (currentBill.electric_units || 0) * (currentBill.electric_rate || 0) : undefined}
              empty={!currentBill}
            />
            <LineItem icon="💧" label="ค่าน้ำ" value={currentBill?.water_amount} empty={!currentBill} />
            <LineItem icon="🔧" label="ค่าซ่อม" value={currentBill?.repair_amount} empty={!currentBill} />
            <LineItem icon="📦" label="อื่นๆ" value={currentBill?.other_amount} empty={!currentBill} />
          </div>

          <div style={styles.barcode}>
            {barcodeBars.map((w, i) => (
              <div key={i} style={{ ...styles.barcodeBar, width: w }} />
            ))}
          </div>
        </div>

        {!currentBill && (
          <p style={styles.waitingNote}>
            เมื่อผู้ดูแลหอพักกรอกยอดค่าใช้จ่ายประจำเดือนนี้แล้ว ตัวเลขจะขึ้นในช่องด้านบนโดยอัตโนมัติ
          </p>
        )}

        {/* History */}
        {pastBills.length > 0 && (
          <>
            <p style={styles.sectionLabel}>ประวัติบิลย้อนหลัง</p>
            {pastBills.map(bill => (
              <div key={bill.id} style={styles.pastCard}>
                <div>
                  <p style={styles.pastMonth}>{bill.month}</p>
                  <p style={styles.pastTotal}>{calcTotal(bill).toLocaleString()} ฿</p>
                </div>
                <div style={bill.status === 'paid' ? styles.paidPillSmall : styles.pendingPillSmall}>
                  {bill.status === 'paid' ? '✓ ชำระแล้ว' : 'ค้างชำระ'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function LineItem({ icon, label, value, empty }) {
  return (
    <div style={styles.lineRow}>
      <span style={styles.lineLabel}>{icon} {label}</span>
      <span style={{ ...styles.lineValue, ...(empty ? styles.lineValueEmpty : {}) }}>
        {empty || value == null ? '—' : `${value.toLocaleString()} ฿`}
      </span>
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
      @keyframes spin { to { transform: rotate(360deg); } }
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
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 140 },
  spinner: {
    width: 22, height: 22, borderRadius: '50%',
    border: '2px solid rgba(201,164,99,0.25)', borderTopColor: '#c9a463',
    animation: 'spin 0.8s linear infinite',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 24px 8px', marginBottom: 22, position: 'relative', zIndex: 1,
  },
  back: { background: 'none', border: 'none', color: '#c9a463', fontSize: 14, cursor: 'pointer', fontFamily: "'Noto Sans Thai', sans-serif" },
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18,
  },
  eyebrow: {
    color: '#c9a463', fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase',
  },
  serial: { color: '#5b616c', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.5 },
  total: {
    color: '#f2efe6', fontSize: 46, fontWeight: 700, margin: '0 0 16px',
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1,
  },
  paidPill: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(79,209,197,0.12)', border: '1px solid rgba(79,209,197,0.3)',
    color: '#7fe0d5', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
  },
  pendingPill: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(232,161,90,0.12)', border: '1px solid rgba(232,161,90,0.3)',
    color: '#f0bd8a', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
  },
  statusDot: { width: 6, height: 6, borderRadius: '50%' },

  perfRow: { position: 'relative', display: 'flex', alignItems: 'center', height: 0 },
  perfLine: { flex: 1, borderTop: '2px dashed rgba(201,164,99,0.25)' },
  notchLeft: { position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#12151b' },
  notchRight: { position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#12151b' },

  lineItems: { padding: '22px 24px 6px' },
  lineRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 },
  lineLabel: { color: '#8b909b', fontSize: 13.5 },
  lineValue: { color: '#f2efe6', fontSize: 13.5, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" },

  barcode: {
    display: 'flex', alignItems: 'flex-end', gap: 3,
    padding: '10px 24px 18px', height: 20, opacity: 0.5,
  },
  barcodeBar: { height: '100%', background: 'rgba(201,164,99,0.5)', borderRadius: 1 },

  sectionLabel: {
    color: '#5b616c', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', margin: '4px 0 12px',
  },
  pastCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1b1f27', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '14px 18px', marginBottom: 10,
  },
  pastMonth: { color: '#8b909b', fontSize: 12.5, margin: '0 0 4px' },
  pastTotal: { color: '#f2efe6', fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" },
  paidPillSmall: {
    background: 'rgba(79,209,197,0.12)', border: '1px solid rgba(79,209,197,0.3)',
    color: '#7fe0d5', padding: '4px 12px', borderRadius: 20, fontSize: 11,
  },
  pendingPillSmall: {
    background: 'rgba(232,161,90,0.12)', border: '1px solid rgba(232,161,90,0.3)',
    color: '#f0bd8a', padding: '4px 12px', borderRadius: 20, fontSize: 11,
  },

  emptyCard: {
    textAlign: 'center', marginTop: 60, padding: '40px 24px',
    background: '#1b1f27', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 20,
  },
  emptyIcon: { fontSize: 34, color: '#5b616c', margin: '0 0 14px' },
  emptyTitle: { color: '#f2efe6', fontSize: 15, fontWeight: 600, margin: '0 0 6px' },
  emptyBody: { color: '#5b616c', fontSize: 13, margin: 0 },
}