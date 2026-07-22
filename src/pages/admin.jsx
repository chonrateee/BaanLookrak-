import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

/*
  AdminPage
  ---------
  Three tabs:
    1. ภาพรวมห้องพัก   – grid of every room, color-coded ว่าง / ไม่ว่าง, tap to assign/ย้ายออก
    2. เพิ่มผู้พักอาศัย   – admin fills in a new tenant's info + room, tenant logs in later
    3. แจ้งซ่อม          – list of repair tickets, admin updates status

  DATA MODEL ASSUMED (adjust to match your actual Supabase schema):
    rooms            (id, room_number, floor, rent_price, status)
    room_tenants     (id, room_id, user_id, tenant_name, tenant_phone, start_date, end_date)
    repairs          (id, room_id, description, status, created_at, rooms(room_number))

  IMPORTANT — about "กรอกให้เขาแล้วให้เขาไปล็อคอิน":
    The Supabase anon key cannot create auth.users for someone else — that requires
    the service_role key, which must never live in frontend code. The flow below
    pre-registers the tenant as a row in room_tenants with user_id = null and a
    phone number. When the tenant signs up for real on RegisterPage, have that page
    look up an existing room_tenants row by phone number and attach auth user_id to
    it (an UPDATE, not an INSERT) instead of creating a fresh unlinked tenant. If you
    want the account created up-front instead, you'll need a small Supabase Edge
    Function that uses supabase.auth.admin.createUser() with the service role key.
*/

const TABS = [
  { id: 'rooms', label: 'ภาพรวมห้องพัก', icon: '🗝️' },
  { id: 'add', label: 'เพิ่มผู้พักอาศัย', icon: '➕' },
  { id: 'bills', label: 'ออกบิล', icon: '🧾' },
  { id: 'repairs', label: 'แจ้งซ่อม', icon: '🔧' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('rooms')

  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: roomsData }, { data: tenantsData }, { data: repairsData }] = await Promise.all([
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('room_tenants').select('*').is('end_date', null),
      supabase
        .from('repairs')
        .select('*, rooms(room_number)')
        .order('created_at', { ascending: false }),
    ])
    setRooms(roomsData ?? [])
    setTenants(tenantsData ?? [])
    setRepairs(repairsData ?? [])
    setLoading(false)
  }

  const showToast = (msg, kind = 'ok') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2600)
  }

  // room_id -> tenant row
  const tenantByRoom = useMemo(() => {
    const map = {}
    for (const t of tenants) map[t.room_id] = t
    return map
  }, [tenants])

  const occupiedCount = tenants.length
  const vacantCount = Math.max(rooms.length - occupiedCount, 0)

  return (
    <div style={styles.bg}>
      <FontImport />
      <div style={styles.vignette} />

      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/main')}>← กลับ</button>
        <h2 style={styles.title}>แผงควบคุมผู้ดูแล</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Stat strip */}
      <div style={styles.statRow}>
        <StatChip label="ห้องทั้งหมด" value={rooms.length} />
        <StatChip label="ไม่ว่าง" value={occupiedCount} accent="#e8a15a" />
        <StatChip label="ว่าง" value={vacantCount} accent="#4fd1c5" />
        <StatChip label="แจ้งซ่อมค้าง" value={repairs.filter(r => r.status !== 'done').length} accent="#e07a7a" />
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={{ color: '#8b909b', fontSize: 13, marginTop: 14 }}>กำลังโหลด...</p>
          </div>
        ) : (
          <>
            {tab === 'rooms' && (
              <RoomsTab
                rooms={rooms}
                tenantByRoom={tenantByRoom}
                onMoveOut={async (tenantId) => {
                  const { error } = await supabase
                    .from('room_tenants')
                    .update({ end_date: new Date().toISOString() })
                    .eq('id', tenantId)
                  if (error) return showToast('ย้ายออกไม่สำเร็จ: ' + error.message, 'err')
                  showToast('ย้ายผู้พักอาศัยออกแล้ว')
                  fetchAll()
                }}
              />
            )}

            {tab === 'add' && (
              <AddTenantTab
                rooms={rooms}
                tenantByRoom={tenantByRoom}
                onSaved={() => { showToast('เพิ่มผู้พักอาศัยเรียบร้อย'); fetchAll() }}
                onError={(msg) => showToast(msg, 'err')}
              />
            )}

            {tab === 'bills' && (
              <AddBillTab
                rooms={rooms}
                tenantByRoom={tenantByRoom}
                onSaved={() => { showToast('บันทึกบิลเรียบร้อย'); fetchAll() }}
                onError={(msg) => showToast(msg, 'err')}
              />
            )}

            {tab === 'repairs' && (
              <RepairsTab
                repairs={repairs}
                onStatusChange={async (id, status) => {
                  const { error } = await supabase.from('repairs').update({ status }).eq('id', id)
                  if (error) return showToast('อัปเดตไม่สำเร็จ: ' + error.message, 'err')
                  showToast('อัปเดตสถานะแล้ว')
                  fetchAll()
                }}
              />
            )}
          </>
        )}
      </div>

      {toast && (
        <div style={{ ...styles.toast, ...(toast.kind === 'err' ? styles.toastErr : {}) }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- Rooms Tab ---------------------------------- */

function RoomsTab({ rooms, tenantByRoom, onMoveOut }) {
  const [selected, setSelected] = useState(null) // room object
  const [floor, setFloor] = useState('all')
  const [status, setStatus] = useState('all')

  const floors = useMemo(
    () => [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b),
    [rooms]
  )

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (floor !== 'all' && room.floor !== floor) return false
      const occupied = !!tenantByRoom[room.id]
      if (status === 'occupied' && !occupied) return false
      if (status === 'vacant' && occupied) return false
      return true
    })
  }, [rooms, tenantByRoom, floor, status])

  return (
    <>
      <div style={styles.filterRow}>
        <FilterPill active={floor === 'all'} onClick={() => setFloor('all')}>ทุกชั้น</FilterPill>
        {floors.map(f => (
          <FilterPill key={f} active={floor === f} onClick={() => setFloor(f)}>ชั้น {f}</FilterPill>
        ))}
      </div>
      <div style={styles.filterRow}>
        <FilterPill active={status === 'all'} onClick={() => setStatus('all')}>ทั้งหมด</FilterPill>
        <FilterPill active={status === 'vacant'} onClick={() => setStatus('vacant')} dot="#4fd1c5">ว่าง</FilterPill>
        <FilterPill active={status === 'occupied'} onClick={() => setStatus('occupied')} dot="#e8a15a">ไม่ว่าง</FilterPill>
      </div>

      <div style={styles.roomGrid}>
        {filteredRooms.map(room => {
          const tenant = tenantByRoom[room.id]
          const occupied = !!tenant
          return (
            <button
              key={room.id}
              style={{
                ...styles.roomTile,
                ...(occupied ? styles.roomTileOccupied : styles.roomTileVacant),
              }}
              onClick={() => setSelected({ room, tenant })}
            >
              <span style={styles.roomTileNum}>{room.room_number}</span>
              <span style={{
                ...styles.roomTileDot,
                background: occupied ? '#e8a15a' : '#4fd1c5',
                boxShadow: occupied ? '0 0 6px #e8a15a' : '0 0 6px #4fd1c5',
              }} />
              <span style={styles.roomTileStatus}>{occupied ? 'ไม่ว่าง' : 'ว่าง'}</span>
            </button>
          )
        })}
        {rooms.length === 0 && (
          <p style={{ color: '#5b616c', fontSize: 13, gridColumn: '1 / -1' }}>ยังไม่มีข้อมูลห้องพัก</p>
        )}
        {rooms.length > 0 && filteredRooms.length === 0 && (
          <p style={{ color: '#5b616c', fontSize: 13, gridColumn: '1 / -1' }}>ไม่พบห้องตามเงื่อนไขที่เลือก</p>
        )}
      </div>

      {selected && (
        <RoomDetailSheet
          data={selected}
          onClose={() => setSelected(null)}
          onMoveOut={async (tenantId) => { await onMoveOut(tenantId); setSelected(null) }}
        />
      )}
    </>
  )
}

function RoomDetailSheet({ data, onClose, onMoveOut }) {
  const { room, tenant } = data
  return (
    <div style={styles.sheetBackdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <div style={styles.sheetTopRow}>
          <span style={styles.eyebrow}>ห้อง</span>
          <span style={styles.serial}>ชั้น {room.floor}</span>
        </div>
        <h1 style={styles.sheetRoomNum}>{room.room_number}</h1>

        {tenant ? (
          <>
            <div style={styles.sheetInfoRow}>
              <span style={styles.sheetInfoLabel}>ผู้พักอาศัย</span>
              <span style={styles.sheetInfoValue}>{tenant.tenant_name}</span>
            </div>
            <div style={styles.sheetInfoRow}>
              <span style={styles.sheetInfoLabel}>เบอร์โทร</span>
              <span style={styles.sheetInfoValue}>{tenant.tenant_phone || '—'}</span>
            </div>
            <div style={styles.sheetInfoRow}>
              <span style={styles.sheetInfoLabel}>เข้าพักเมื่อ</span>
              <span style={styles.sheetInfoValue}>
                {tenant.start_date ? new Date(tenant.start_date).toLocaleDateString('th-TH') : '—'}
              </span>
            </div>
            <div style={styles.sheetInfoRow}>
              <span style={styles.sheetInfoLabel}>สถานะบัญชี</span>
              <span style={styles.sheetInfoValue}>{tenant.user_id ? 'ล็อคอินแล้ว' : 'รอเข้าสู่ระบบครั้งแรก'}</span>
            </div>

            <button style={styles.dangerBtn} onClick={() => onMoveOut(tenant.id)}>
              ย้ายออกจากห้องนี้
            </button>
          </>
        ) : (
          <p style={{ color: '#8b909b', fontSize: 13.5, margin: '18px 0 4px' }}>
            ห้องนี้ว่าง — ไปที่แท็บ "เพิ่มผู้พักอาศัย" เพื่อกำหนดผู้เข้าพัก
          </p>
        )}

        <button style={styles.sheetCloseBtn} onClick={onClose}>ปิด</button>
      </div>
    </div>
  )
}

/* -------------------------------- Add Tenant Tab -------------------------------- */

function AddTenantTab({ rooms, tenantByRoom, onSaved, onError }) {
  const vacantRooms = rooms.filter(r => !tenantByRoom[r.id])
  const [form, setForm] = useState({ name: '', phone: '', roomId: '', startDate: '' })
  const [saving, setSaving] = useState(false)

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.roomId) {
      return onError('กรุณากรอกชื่อ เบอร์โทร และเลือกห้อง')
    }
    setSaving(true)
    const { error } = await supabase.from('room_tenants').insert({
      room_id: form.roomId,
      tenant_name: form.name.trim(),
      tenant_phone: form.phone.trim(),
      start_date: form.startDate || new Date().toISOString().slice(0, 10),
      user_id: null, // linked later when tenant creates their account via RegisterPage
    })
    setSaving(false)
    if (error) return onError('บันทึกไม่สำเร็จ: ' + error.message)
    setForm({ name: '', phone: '', roomId: '', startDate: '' })
    onSaved()
  }

  return (
    <form style={styles.card} onSubmit={handleSubmit}>
      <div style={styles.cardTopStripe} />
      <div style={{ padding: '22px 22px 24px' }}>
        <span style={styles.eyebrow}>ผู้พักอาศัยใหม่</span>
        <p style={{ color: '#8b909b', fontSize: 12.5, margin: '8px 0 20px', lineHeight: 1.6 }}>
          กรอกข้อมูลแทนผู้เข้าพัก ระบบจะผูกบัญชีให้อัตโนมัติเมื่อเขาสมัคร/ล็อคอินครั้งแรกด้วยเบอร์โทรนี้
        </p>

        <Field label="ชื่อ-นามสกุล">
          <input
            style={styles.input}
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="เช่น สมชาย ใจดี"
          />
        </Field>

        <Field label="เบอร์โทรศัพท์">
          <input
            style={styles.input}
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="08x-xxx-xxxx"
            inputMode="tel"
          />
        </Field>

        <Field label="เลือกห้องพัก">
          <select
            style={styles.input}
            value={form.roomId}
            onChange={e => update('roomId', e.target.value)}
          >
            <option value="">— เลือกห้องว่าง —</option>
            {vacantRooms.map(r => (
              <option key={r.id} value={r.id}>
                ห้อง {r.room_number} · ชั้น {r.floor} · {r.rent_price?.toLocaleString()} ฿/เดือน
              </option>
            ))}
          </select>
          {vacantRooms.length === 0 && (
            <p style={{ color: '#e07a7a', fontSize: 11.5, marginTop: 6 }}>ไม่มีห้องว่างในขณะนี้</p>
          )}
        </Field>

        <Field label="วันที่เข้าพัก (ไม่กรอก = วันนี้)">
          <input
            type="date"
            style={styles.input}
            value={form.startDate}
            onChange={e => update('startDate', e.target.value)}
          />
        </Field>

        <button style={styles.submitBtn} type="submit" disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกผู้พักอาศัย'}
        </button>
      </div>
    </form>
  )
}

/* ---------------------------------- Add Bill Tab ---------------------------------- */

const EMPTY_BILL_FORM = {
  roomId: '',
  month: '',
  rent: '',
  electricUnits: '',
  electricRate: '',
  water: '',
  repair: '',
  other: '',
  status: 'pending',
}

function AddBillTab({ rooms, tenantByRoom, onSaved, onError }) {
  const occupiedRooms = rooms.filter(r => tenantByRoom[r.id])
  const [form, setForm] = useState(EMPTY_BILL_FORM)
  const [saving, setSaving] = useState(false)

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const total =
    (Number(form.rent) || 0) +
    (Number(form.electricUnits) || 0) * (Number(form.electricRate) || 0) +
    (Number(form.water) || 0) +
    (Number(form.repair) || 0) +
    (Number(form.other) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.roomId || !form.month.trim() || !form.rent) {
      return onError('กรุณาเลือกห้อง ระบุเดือน และค่าเช่าอย่างน้อย')
    }
    setSaving(true)
    const { error } = await supabase.from('bills').insert({
      room_id: form.roomId,
      month: form.month.trim(),
      rent: Number(form.rent) || 0,
      electric_units: Number(form.electricUnits) || 0,
      electric_rate: Number(form.electricRate) || 0,
      water_amount: Number(form.water) || 0,
      repair_amount: Number(form.repair) || 0,
      other_amount: Number(form.other) || 0,
      status: form.status,
    })
    setSaving(false)
    if (error) return onError('บันทึกบิลไม่สำเร็จ: ' + error.message)
    setForm(EMPTY_BILL_FORM)
    onSaved()
  }

  return (
    <form style={styles.card} onSubmit={handleSubmit}>
      <div style={styles.cardTopStripe} />
      <div style={{ padding: '22px 22px 24px' }}>
        <span style={styles.eyebrow}>ออกบิลใหม่</span>
        <p style={{ color: '#8b909b', fontSize: 12.5, margin: '8px 0 20px', lineHeight: 1.6 }}>
          กรอกยอดแต่ละรายการของห้องที่มีผู้พักอาศัยอยู่ ผู้พักจะเห็นบิลนี้ทันทีที่หน้าค่าใช้จ่ายของเขา
        </p>

        <Field label="เลือกห้อง">
          <select style={styles.input} value={form.roomId} onChange={e => update('roomId', e.target.value)}>
            <option value="">— เลือกห้องที่มีผู้พัก —</option>
            {occupiedRooms.map(r => (
              <option key={r.id} value={r.id}>
                ห้อง {r.room_number} · {tenantByRoom[r.id]?.tenant_name}
              </option>
            ))}
          </select>
          {occupiedRooms.length === 0 && (
            <p style={{ color: '#e07a7a', fontSize: 11.5, marginTop: 6 }}>ยังไม่มีห้องที่มีผู้พักอาศัย</p>
          )}
        </Field>

        <Field label="เดือน">
          <input
            style={styles.input}
            value={form.month}
            onChange={e => update('month', e.target.value)}
            placeholder="เช่น กรกฎาคม 2569"
          />
        </Field>

        <div style={styles.fieldGrid}>
          <Field label="ค่าเช่าห้อง (฿)">
            <input style={styles.input} inputMode="decimal" value={form.rent} onChange={e => update('rent', e.target.value)} placeholder="0" />
          </Field>
          <Field label="ค่าน้ำ (฿)">
            <input style={styles.input} inputMode="decimal" value={form.water} onChange={e => update('water', e.target.value)} placeholder="0" />
          </Field>
        </div>

        <div style={styles.fieldGrid}>
          <Field label="หน่วยไฟที่ใช้">
            <input style={styles.input} inputMode="decimal" value={form.electricUnits} onChange={e => update('electricUnits', e.target.value)} placeholder="0" />
          </Field>
          <Field label="ราคาไฟ/หน่วย (฿)">
            <input style={styles.input} inputMode="decimal" value={form.electricRate} onChange={e => update('electricRate', e.target.value)} placeholder="0" />
          </Field>
        </div>

        <div style={styles.fieldGrid}>
          <Field label="ค่าซ่อม (฿)">
            <input style={styles.input} inputMode="decimal" value={form.repair} onChange={e => update('repair', e.target.value)} placeholder="0" />
          </Field>
          <Field label="อื่นๆ (฿)">
            <input style={styles.input} inputMode="decimal" value={form.other} onChange={e => update('other', e.target.value)} placeholder="0" />
          </Field>
        </div>

        <Field label="สถานะ">
          <select style={styles.input} value={form.status} onChange={e => update('status', e.target.value)}>
            <option value="pending">ค้างชำระ</option>
            <option value="paid">ชำระแล้ว</option>
          </select>
        </Field>

        <div style={styles.totalPreview}>
          <span style={styles.totalPreviewLabel}>ยอดรวม</span>
          <span style={styles.totalPreviewValue}>{total.toLocaleString()} ฿</span>
        </div>

        <button style={styles.submitBtn} type="submit" disabled={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกบิล'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

/* --------------------------------- Repairs Tab ---------------------------------- */

const STATUS_META = {
  pending: { label: 'รอดำเนินการ', color: '#e07a7a' },
  in_progress: { label: 'กำลังซ่อม', color: '#e8a15a' },
  done: { label: 'เสร็จสิ้น', color: '#4fd1c5' },
}

function RepairsTab({ repairs, onStatusChange }) {
  if (repairs.length === 0) {
    return (
      <div style={styles.emptyCard}>
        <p style={styles.emptyIcon}>🔧</p>
        <p style={styles.emptyTitle}>ยังไม่มีรายการแจ้งซ่อม</p>
      </div>
    )
  }

  return (
    <div>
      {repairs.map(r => {
        const meta = STATUS_META[r.status] ?? STATUS_META.pending
        return (
          <div key={r.id} style={styles.repairRow}>
            <div style={styles.repairTop}>
              <span style={styles.repairRoom}>ห้อง {r.rooms?.room_number ?? '—'}</span>
              <span style={{ ...styles.repairStatusPill, color: meta.color, borderColor: meta.color + '55', background: meta.color + '18' }}>
                {meta.label}
              </span>
            </div>
            <p style={styles.repairDesc}>{r.description}</p>
            <p style={styles.repairDate}>
              {r.created_at ? new Date(r.created_at).toLocaleString('th-TH') : ''}
            </p>

            <div style={styles.repairActions}>
              {Object.entries(STATUS_META).map(([key, m]) => (
                <button
                  key={key}
                  style={{
                    ...styles.repairActionBtn,
                    ...(r.status === key ? { borderColor: m.color, color: m.color } : {}),
                  }}
                  onClick={() => onStatusChange(r.id, key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------------- Small bits ---------------------------------- */

function FilterPill({ active, onClick, dot, children }) {
  return (
    <button
      type="button"
      style={{ ...styles.filterPill, ...(active ? styles.filterPillActive : {}) }}
      onClick={onClick}
    >
      {dot && <span style={{ ...styles.filterPillDot, background: dot }} />}
      {children}
    </button>
  )
}

function StatChip({ label, value, accent = '#c9a463' }) {
  return (
    <div style={styles.statChip}>
      <p style={{ ...styles.statValue, color: accent }}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  )
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;600&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `}</style>
  )
}

/* ------------------------------------ Styles ------------------------------------ */

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
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 },
  spinner: {
    width: 22, height: 22, borderRadius: '50%',
    border: '2px solid rgba(201,164,99,0.25)', borderTopColor: '#c9a463',
    animation: 'spin 0.8s linear infinite',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 24px 8px', position: 'relative', zIndex: 1,
  },
  back: { background: 'none', border: 'none', color: '#c9a463', fontSize: 14, cursor: 'pointer', fontFamily: "'Noto Sans Thai', sans-serif" },
  title: { color: '#f2efe6', fontSize: 17, margin: 0, fontWeight: 600, letterSpacing: 0.2 },

  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
    padding: '4px 20px 18px', position: 'relative', zIndex: 1,
  },
  statChip: {
    background: '#1b1f27', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '10px 6px', textAlign: 'center',
  },
  statValue: { fontSize: 19, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" },
  statLabel: { color: '#5b616c', fontSize: 10, margin: '4px 0 0' },

  tabRow: {
    display: 'flex', gap: 8, padding: '0 20px 18px', position: 'relative', zIndex: 1,
    overflowX: 'auto',
  },
  tabBtn: {
    flex: 1, whiteSpace: 'nowrap', padding: '10px 12px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)', background: '#1b1f27',
    color: '#8b909b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, rgba(201,164,99,0.22), rgba(201,164,99,0.08))',
    borderColor: 'rgba(201,164,99,0.5)', color: '#e8cf9c',
  },

  content: { padding: '0 20px', position: 'relative', zIndex: 1 },

  // room filters
  filterRow: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 },
  filterPill: {
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
    padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
    background: '#1b1f27', color: '#8b909b', fontSize: 12, cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },
  filterPillActive: {
    background: 'linear-gradient(135deg, rgba(201,164,99,0.22), rgba(201,164,99,0.08))',
    borderColor: 'rgba(201,164,99,0.5)', color: '#e8cf9c',
  },
  filterPillDot: { width: 6, height: 6, borderRadius: '50%' },

  // room grid
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  roomTile: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '16px 8px', borderRadius: 14, cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif", border: '1px solid rgba(255,255,255,0.06)',
  },
  roomTileVacant: { background: 'rgba(79,209,197,0.07)', border: '1px solid rgba(79,209,197,0.25)' },
  roomTileOccupied: { background: 'rgba(232,161,90,0.07)', border: '1px solid rgba(232,161,90,0.25)' },
  roomTileNum: { color: '#f2efe6', fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
  roomTileDot: { width: 6, height: 6, borderRadius: '50%' },
  roomTileStatus: { color: '#8b909b', fontSize: 10.5 },

  // sheet (bottom modal)
  sheetBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'flex-end', zIndex: 50, animation: 'fadeIn 0.2s ease-out',
  },
  sheet: {
    width: '100%', maxWidth: 480, margin: '0 auto', background: '#1b1f27',
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '10px 22px 26px',
    border: '1px solid rgba(201,164,99,0.2)', borderBottom: 'none',
    animation: 'sheetUp 0.25s ease-out',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 18px' },
  sheetTopRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  sheetRoomNum: { color: '#f2efe6', fontSize: 40, fontWeight: 700, margin: '0 0 16px', fontFamily: "'Space Grotesk', sans-serif" },
  sheetInfoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  sheetInfoLabel: { color: '#5b616c', fontSize: 12.5 },
  sheetInfoValue: { color: '#f2efe6', fontSize: 13.5, fontWeight: 600 },
  sheetCloseBtn: {
    width: '100%', marginTop: 18, padding: '13px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
    color: '#8b909b', fontSize: 13.5, cursor: 'pointer', fontFamily: "'Noto Sans Thai', sans-serif",
  },

  eyebrow: { color: '#c9a463', fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' },
  serial: { color: '#5b616c', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" },

  dangerBtn: {
    width: '100%', marginTop: 18, padding: '13px', borderRadius: 12, border: '1px solid rgba(224,122,122,0.4)',
    background: 'rgba(224,122,122,0.1)', color: '#e07a7a', fontSize: 13.5, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Noto Sans Thai', sans-serif",
  },

  // form card
  card: {
    position: 'relative', background: 'linear-gradient(165deg, #232833, #171a21)',
    border: '1px solid rgba(201,164,99,0.22)', borderRadius: 22, overflow: 'hidden',
    marginBottom: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
  cardTopStripe: { height: 5, background: 'linear-gradient(90deg, #8a7448, #c9a463, #e8cf9c, #c9a463, #8a7448)' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  totalPreview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(201,164,99,0.08)', border: '1px solid rgba(201,164,99,0.25)',
    borderRadius: 12, padding: '12px 16px', margin: '4px 0 18px',
  },
  totalPreviewLabel: { color: '#c9a463', fontSize: 12.5, fontWeight: 600 },
  totalPreviewValue: { color: '#f2efe6', fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
  fieldLabel: { display: 'block', color: '#8b909b', fontSize: 12, marginBottom: 6 },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: '#12151b', color: '#f2efe6', fontSize: 14, fontFamily: "'Noto Sans Thai', sans-serif",
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #c9a463, #8a7448)', color: '#14171c',
    fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 6,
    fontFamily: "'Noto Sans Thai', sans-serif", boxShadow: '0 8px 24px rgba(201,164,99,0.25)',
  },

  // repairs
  repairRow: {
    background: '#1b1f27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
    padding: '16px 18px', marginBottom: 12,
  },
  repairTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  repairRoom: { color: '#f2efe6', fontSize: 14.5, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
  repairStatusPill: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid' },
  repairDesc: { color: '#d8d5c9', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 6px' },
  repairDate: { color: '#5b616c', fontSize: 11, margin: '0 0 12px' },
  repairActions: { display: 'flex', gap: 8 },
  repairActionBtn: {
    flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent', color: '#8b909b', fontSize: 11.5, cursor: 'pointer',
    fontFamily: "'Noto Sans Thai', sans-serif",
  },

  emptyCard: {
    textAlign: 'center', marginTop: 60, padding: '40px 24px', background: '#1b1f27',
    border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 20,
  },
  emptyIcon: { fontSize: 34, margin: '0 0 14px' },
  emptyTitle: { color: '#f2efe6', fontSize: 15, fontWeight: 600, margin: 0 },

  toast: {
    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
    background: '#232833', border: '1px solid rgba(79,209,197,0.35)', color: '#f2efe6',
    padding: '12px 20px', borderRadius: 12, fontSize: 13, zIndex: 60,
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease-out',
  },
  toastErr: { border: '1px solid rgba(224,122,122,0.4)' },
}