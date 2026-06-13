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
    if (!user) return
    const fetchRoom = async () => {
      const { data } = await supabase
        .from('room_tenants')
        .select(`room_id, start_date, rooms(id, room_number, floor, rent_price, status)`)
        .eq('user_id', user.id)
        .is('end_date', null)
        .single()
      setRoom(data?.rooms ?? null)
      setLoading(false)
    }
    fetchRoom()
  }, [user])

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>ห้องพัก</h2>
      </div>

      {room ? (
        <div style={styles.card}>
          <p style={styles.label}>ห้องพัก</p>
          <h1 style={styles.roomNum}>{room.room_number}</h1>
          <div style={styles.badge}>กำลังพักอาศัย</div>

          <div style={styles.divider} />

          <div style={styles.row}>
            <span style={styles.rowLabel}>ชั้น</span>
            <span style={styles.rowValue}>{room.floor}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>ค่าเช่าต่อเดือน</span>
            <span style={styles.rowValue}>{room.rent_price.toLocaleString()} ฿</span>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>สถานะ</span>
            <span style={styles.rowValue}>occupied</span>
          </div>

          <button
            style={styles.repairBtn}
            onClick={() => navigate('/repair')}
          >
            🔧 แจ้งซ่อมห้อง
          </button>
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={{ color: '#aaa' }}>ยังไม่ได้รับการมอบหมายห้อง</p>
          <p style={{ color: '#666', fontSize: 13 }}>กรุณาติดต่อผู้ดูแล</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#1a1a2e', fontFamily: 'sans-serif' },
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
  label: { color: '#aaa', fontSize: 13, margin: '0 0 4px' },
  roomNum: { color: '#fff', fontSize: 48, margin: '0 0 12px', fontWeight: 'bold' },
  badge: {
    display: 'inline-block',
    background: '#7c3aed33',
    color: '#a78bfa',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 20,
  },
  divider: { borderTop: '1px solid #2a2a4a', margin: '16px 0' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { color: '#aaa', fontSize: 14 },
  rowValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  repairBtn: {
    width: '100%',
    marginTop: 20,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#7c3aed',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', marginTop: 80 },
}