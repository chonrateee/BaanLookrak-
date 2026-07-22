import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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
    (b.rent + b.electric_units * b.electric_rate + b.water_amount + b.other_amount)

  const currentBill = bills[0]
  const pastBills = bills.slice(1)

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ค่าใช้จ่าย</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        {currentBill ? (
          <>
            {/* Current bill card */}
            <div style={styles.billCard}>
              <div style={styles.billCardBg} />
              <div style={styles.billHeader}>
                <div>
                  <p style={styles.billMonth}>บิลประจำเดือน {currentBill.month}</p>
                  <p style={styles.billTotal}>{calcTotal(currentBill).toLocaleString()} ฿</p>
                </div>
                <div style={currentBill.status === 'paid' ? styles.paidBadge : styles.pendingBadge}>
                  {currentBill.status === 'paid' ? '✓ ชำระแล้ว' : '⏳ ค้างชำระ'}
                </div>
              </div>

              <div style={styles.billDivider} />

              <div style={styles.billRow}>
                <span style={styles.billLabel}>🏠 ค่าเช่าห้อง</span>
                <span style={styles.billValue}>{currentBill.rent?.toLocaleString()} ฿</span>
              </div>
              <div style={styles.billRow}>
                <span style={styles.billLabel}>⚡ ค่าไฟ ({currentBill.electric_units} หน่วย)</span>
                <span style={styles.billValue}>{(currentBill.electric_units * currentBill.electric_rate).toLocaleString()} ฿</span>
              </div>
              <div style={styles.billRow}>
                <span style={styles.billLabel}>💧 ค่าน้ำ</span>
                <span style={styles.billValue}>{currentBill.water_amount?.toLocaleString()} ฿</span>
              </div>
              {currentBill.other_amount > 0 && (
                <div style={styles.billRow}>
                  <span style={styles.billLabel}>📦 อื่นๆ</span>
                  <span style={styles.billValue}>{currentBill.other_amount?.toLocaleString()} ฿</span>
                </div>
              )}
            </div>

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
                    <div style={bill.status === 'paid' ? styles.paidBadgeSmall : styles.pendingBadgeSmall}>
                      {bill.status === 'paid' ? '✓ ชำระแล้ว' : 'ค้างชำระ'}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>📭</p>
            <p style={{ color: '#aaa' }}>ยังไม่มีบิล</p>
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
    background: 'radial-gradient(circle, #f59e0b22, transparent)',
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
  billCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 24,
    padding: '24px 20px',
    marginBottom: 24,
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(79,70,229,0.3)',
  },
  billCardBg: {
    position: 'absolute',
    width: 180,
    height: 180,
    background: 'rgba(124,58,237,0.1)',
    borderRadius: '50%',
    top: -60,
    right: -40,
  },
  billHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  billMonth: { color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 4px' },
  billTotal: { color: '#fff', fontSize: 32, fontWeight: 'bold', margin: 0 },
  paidBadge: {
    background: '#06644222',
    border: '1px solid #34d39944',
    color: '#34d399',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  pendingBadge: {
    background: '#92400e22',
    border: '1px solid #fbbf2444',
    color: '#fbbf24',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  billDivider: { borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' },
  billRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  billValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px' },
  pastCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 10,
  },
  pastMonth: { color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 4px' },
  pastTotal: { color: '#fff', fontSize: 16, fontWeight: 'bold', margin: 0 },
  paidBadgeSmall: {
    background: '#06644222',
    border: '1px solid #34d39944',
    color: '#34d399',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
  },
  pendingBadgeSmall: {
    background: '#92400e22',
    border: '1px solid #fbbf2444',
    color: '#fbbf24',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
  },
  empty: { textAlign: 'center', marginTop: 80, color: '#fff' },
}