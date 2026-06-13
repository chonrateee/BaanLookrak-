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

  const currentBill = bills[0]
  const pastBills = bills.slice(1)

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ค่าใช้จ่าย</h2>
      </div>

      {currentBill ? (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.month}>บิล {currentBill.month}</span>
            <span style={currentBill.status === 'paid' ? styles.badgePaid : styles.badgePending}>
              {currentBill.status === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.rowLabel}>ค่าเช่าห้อง</span>
            <span style={styles.rowValue}>{currentBill.rent?.toLocaleString()} ฿</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>ค่าไฟ ({currentBill.electric_units} หน่วย)</span>
            <span style={styles.rowValue}>
              {(currentBill.electric_units * currentBill.electric_rate).toLocaleString()} ฿
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>ค่าน้ำ</span>
            <span style={styles.rowValue}>{currentBill.water_amount?.toLocaleString()} ฿</span>
          </div>
          {currentBill.other_amount > 0 && (
            <div style={styles.row}>
              <span style={styles.rowLabel}>อื่นๆ</span>
              <span style={styles.rowValue}>{currentBill.other_amount?.toLocaleString()} ฿</span>
            </div>
          )}

          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>รวมทั้งหมด</span>
            <span style={styles.total}>
              {(currentBill.rent + (currentBill.electric_units * currentBill.electric_rate) + currentBill.water_amount + currentBill.other_amount).toLocaleString()} ฿
            </span>
          </div>
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={{ color: '#aaa' }}>ยังไม่มีบิล</p>
        </div>
      )}

      {pastBills.length > 0 && (
        <div style={{ margin: '24px 24px 0' }}>
          <p style={styles.sectionTitle}>ประวัติบิลย้อนหลัง</p>
          {pastBills.map(bill => (
            <div key={bill.id} style={styles.pastBill}>
              <span style={styles.rowLabel}>{bill.month}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={styles.rowValue}>
                  {(bill.rent + (bill.electric_units * bill.electric_rate) + bill.water_amount + bill.other_amount).toLocaleString()} ฿
                </span>
                <span style={bill.status === 'paid' ? styles.badgePaid : styles.badgePending}>
                  {bill.status === 'paid' ? '✓' : 'ค้าง'}
                </span>
              </div>
            </div>
          ))}
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
    padding: '24px 20px',
    border: '1px solid #2a2a4a',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  month: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  badgePaid: {
    background: '#06644233',
    color: '#34d399',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
  },
  badgePending: {
    background: '#92400e33',
    color: '#fbbf24',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
  },
  divider: { borderTop: '1px solid #2a2a4a', margin: '16px 0' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { color: '#aaa', fontSize: 14 },
  rowValue: { color: '#fff', fontSize: 14 },
  total: { color: '#a78bfa', fontSize: 20, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 80 },
  sectionTitle: { color: '#aaa', fontSize: 13, marginBottom: 12 },
  pastBill: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#16213e',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 8,
    border: '1px solid #2a2a4a',
  },
}