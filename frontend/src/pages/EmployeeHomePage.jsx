import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ────────────────────────────────────────────
   DỮ LIỆU MẪU (thay bằng API sau)
──────────────────────────────────────────── */
const employeeInfo = {
  fullName : 'Nguyễn Văn An',
  id       : 'NV-0042',
  dept     : 'Kỹ thuật',
  shift    : 'Ca sáng  07:00 – 17:00',
  avatar   : 'A',
}

const todayAttendance = {
  checkIn  : '07:58',
  checkOut : null,          // null = chưa chấm ra
  status   : 'present',     // present | late | absent
  hoursWorked: 8.5,
}

const monthlySummary = {
  worked  : 20,
  absent  : 1,
  late    : 1,
  overtime: 12,
  leaveLeft: 10,
}

const attendanceHistory = [
  { date: 'T4, 04/06', checkIn: '07:58', checkOut: null,    status: 'present',  hours: null  },
  { date: 'T3, 03/06', checkIn: '08:15', checkOut: '17:00', status: 'late',     hours: 7.8  },
  { date: 'T2, 02/06', checkIn: '07:50', checkOut: '17:05', status: 'present',  hours: 8.1  },
  { date: 'CN,01/06',  checkIn: '—',     checkOut: '—',     status: 'off',      hours: 0    },
  { date: 'T7, 31/05', checkIn: '07:45', checkOut: '19:30', status: 'overtime', hours: 10.5 },
  { date: 'T6, 30/05', checkIn: '—',     checkOut: '—',     status: 'leave',    hours: 0    },
  { date: 'T5, 29/05', checkIn: '08:00', checkOut: '17:00', status: 'present',  hours: 8.0  },
  { date: 'T4, 28/05', checkIn: '07:55', checkOut: '17:10', status: 'present',  hours: 8.2  },
  { date: 'T3, 27/05', checkIn: '—',     checkOut: '—',     status: 'absent',   hours: 0    },
  { date: 'T2, 26/05', checkIn: '07:48', checkOut: '17:00', status: 'present',  hours: 8.2  },
]

const myLeaves = [
  { id: 1, type: 'Nghỉ phép năm',  from: '06/06', to: '07/06', days: 2,  status: 'pending'  },
  { id: 2, type: 'Tăng ca',        from: '31/05', to: '31/05', hours: 3, status: 'approved' },
  { id: 3, type: 'Nghỉ ốm',        from: '30/05', to: '30/05', days: 1,  status: 'approved' },
  { id: 4, type: 'Nghỉ phép năm',  from: '10/04', to: '11/04', days: 2,  status: 'rejected' },
]

const salaryHistory = [
  {
    month: 'Tháng 5/2026',
    base    : 8_000_000,
    overtime:   450_000,
    bonus   :   200_000,
    insurance:  800_000,
    total   : 7_850_000,
    paid    : true,
  },
  {
    month: 'Tháng 4/2026',
    base    : 8_000_000,
    overtime:   150_000,
    bonus   :         0,
    insurance:  800_000,
    total   : 7_350_000,
    paid    : true,
  },
  {
    month: 'Tháng 3/2026',
    base    : 8_000_000,
    overtime:   600_000,
    bonus   :   500_000,
    insurance:  800_000,
    total   : 8_300_000,
    paid    : true,
  },
]

/* ────────────────────────────────────────────
   STATUS CONFIG
──────────────────────────────────────────── */
const statusCfg = {
  present : { label: 'Có mặt',   cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  late    : { label: 'Đi trễ',   cls: 'bg-amber-100   text-amber-700',   dot: 'bg-amber-400'   },
  absent  : { label: 'Vắng',     cls: 'bg-red-100     text-red-700',     dot: 'bg-red-400'     },
  overtime: { label: 'Tăng ca',  cls: 'bg-violet-100  text-violet-700',  dot: 'bg-violet-500'  },
  leave   : { label: 'Nghỉ phép',cls: 'bg-sky-100     text-sky-700',     dot: 'bg-sky-400'     },
  off     : { label: 'Nghỉ',     cls: 'bg-slate-100   text-slate-500',   dot: 'bg-slate-300'   },
}

const leaveCfg = {
  pending : { label: 'Chờ duyệt', cls: 'bg-amber-100   text-amber-700'   },
  approved: { label: 'Đã duyệt',  cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Từ chối',   cls: 'bg-red-100     text-red-700'     },
}

const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫'

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function EmployeeHomePage() {
  const navigate  = useNavigate()
  const [tab, setTab]           = useState('home')
  const [checkedIn, setCheckedIn] = useState(!!todayAttendance.checkIn)
  const [checkedOut, setCheckedOut] = useState(!!todayAttendance.checkOut)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState(0)

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('fullName')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-lg mx-auto relative">

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <div className="w-9 h-9 rounded-full bg-sky-600 text-white text-sm font-bold
          flex items-center justify-center shrink-0">
          {employeeInfo.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{employeeInfo.fullName}</p>
          <p className="text-xs text-slate-400">{employeeInfo.id} · {employeeInfo.dept}</p>
        </div>
        <button onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
          <IcoLogout className="w-5 h-5" />
        </button>
      </header>

      {/* ── Tab Content ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'home'       && <TabHome       checkedIn={checkedIn} checkedOut={checkedOut}
                                                setCheckedIn={setCheckedIn} setCheckedOut={setCheckedOut} />}
        {tab === 'attendance' && <TabAttendance />}
        {tab === 'leave'      && <TabLeave      onNew={() => setShowLeaveModal(true)} />}
        {tab === 'salary'     && <TabSalary     selected={selectedSalary} setSelected={setSelectedSalary} />}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg
        bg-white border-t border-slate-200 flex z-30">
        {[
          { key: 'home',       label: 'Trang chủ', icon: IcoHome    },
          { key: 'attendance', label: 'Chấm công', icon: IcoClipboard },
          { key: 'leave',      label: 'Nghỉ phép', icon: IcoCalendar },
          { key: 'salary',     label: 'Lương',     icon: IcoWallet  },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition
              ${tab === key ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
            {tab === key && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-sky-600 rounded-t-full" />
            )}
          </button>
        ))}
      </nav>

      {/* ── Leave Request Modal ── */}
      {showLeaveModal && <LeaveModal onClose={() => setShowLeaveModal(false)} />}
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 1 — TRANG CHỦ
════════════════════════════════════════════ */
function TabHome({ checkedIn, checkedOut, setCheckedIn, setCheckedOut }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const [loading, setLoading] = useState(false)

  function handleCheckIn() {
    setLoading(true)
    setTimeout(() => { setCheckedIn(true); setLoading(false) }, 800)
  }
  function handleCheckOut() {
    setLoading(true)
    setTimeout(() => { setCheckedOut(true); setLoading(false) }, 800)
  }

  return (
    <div className="p-4 space-y-4">

      {/* Greeting */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80 capitalize">{dateStr}</p>
        <h1 className="text-xl font-bold mt-1">Xin chào, {employeeInfo.fullName.split(' ').pop()} 👋</h1>
        <p className="text-xs opacity-70 mt-1">{employeeInfo.shift}</p>
      </div>

      {/* Check-in / Check-out Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Chấm công hôm nay</h2>
          {checkedIn && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full
              ${checkedOut ? 'bg-slate-100 text-slate-500' :
                todayAttendance.status === 'late'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'}`}>
              {checkedOut ? 'Hoàn thành' : todayAttendance.status === 'late' ? 'Đi trễ' : 'Đang làm việc'}
            </span>
          )}
        </div>

        {/* Time row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Giờ vào</p>
            <p className={`text-xl font-bold ${checkedIn ? 'text-slate-800' : 'text-slate-300'}`}>
              {checkedIn ? todayAttendance.checkIn : '--:--'}
            </p>
          </div>
          <IcoArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Giờ ra</p>
            <p className={`text-xl font-bold ${checkedOut ? 'text-slate-800' : 'text-slate-300'}`}>
              {checkedOut ? '17:00' : '--:--'}
            </p>
          </div>
        </div>

        {/* Action button */}
        {!checkedIn ? (
          <button onClick={handleCheckIn} disabled={loading}
            className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[.98]
              text-white font-bold text-base transition flex items-center justify-center gap-2
              disabled:opacity-60 shadow-lg shadow-sky-200">
            {loading ? <IcoSpinner className="w-5 h-5 animate-spin" /> : <IcoFingerprint className="w-6 h-6" />}
            {loading ? 'Đang xử lý...' : 'CHẤM VÀO CA'}
          </button>
        ) : !checkedOut ? (
          <button onClick={handleCheckOut} disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[.98]
              text-white font-bold text-base transition flex items-center justify-center gap-2
              disabled:opacity-60 shadow-lg shadow-emerald-200">
            {loading ? <IcoSpinner className="w-5 h-5 animate-spin" /> : <IcoFingerprint className="w-6 h-6" />}
            {loading ? 'Đang xử lý...' : 'CHẤM RA CA'}
          </button>
        ) : (
          <div className="w-full py-4 rounded-xl bg-slate-100 text-slate-500
            font-semibold text-sm text-center flex items-center justify-center gap-2">
            <IcoCheckCircle className="w-5 h-5 text-emerald-500" />
            Đã chấm công xong hôm nay
          </div>
        )}
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Tháng này của tôi</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Ngày làm', value: monthlySummary.worked,   color: 'text-sky-600',     bg: 'bg-sky-50'     },
            { label: 'Vắng',     value: monthlySummary.absent,   color: 'text-red-500',     bg: 'bg-red-50'     },
            { label: 'Trễ',      value: monthlySummary.late,     color: 'text-amber-500',   bg: 'bg-amber-50'   },
            { label: 'Tăng ca',  value: `${monthlySummary.overtime}h`, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leave balance */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100
        flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <IcoCalendar className="w-6 h-6 text-teal-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400">Số ngày phép còn lại</p>
          <p className="text-2xl font-bold text-slate-800">{monthlySummary.leaveLeft} <span className="text-sm font-normal text-slate-400">ngày</span></p>
        </div>
        <span className="text-xs text-sky-600 font-medium">Năm 2026</span>
      </div>

      {/* Pending requests */}
      {myLeaves.filter(l => l.status === 'pending').length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Đơn đang chờ duyệt</h2>
            <span className="w-5 h-5 bg-amber-400 rounded-full text-white text-xs
              font-bold flex items-center justify-center">
              {myLeaves.filter(l => l.status === 'pending').length}
            </span>
          </div>
          <div className="space-y-2">
            {myLeaves.filter(l => l.status === 'pending').map(l => (
              <div key={l.id} className="flex items-center gap-3 bg-amber-50
                border border-amber-100 rounded-xl px-3 py-2.5">
                <IcoCalendar className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{l.type}</p>
                  <p className="text-xs text-slate-400">{l.from} – {l.to}</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                  ⏳ Chờ duyệt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 2 — CHẤM CÔNG CỦA TÔI
════════════════════════════════════════════ */
function TabAttendance() {
  const [month] = useState('Tháng 6/2026')

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Lịch sử chấm công</h2>
        <span className="text-xs text-slate-500 bg-white border border-slate-200
          px-3 py-1.5 rounded-lg">{month}</span>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { label: '20 ngày làm',    color: 'bg-sky-100 text-sky-700'         },
          { label: '1 vắng mặt',     color: 'bg-red-100 text-red-600'         },
          { label: '1 đi trễ',       color: 'bg-amber-100 text-amber-700'     },
          { label: '10.5h tăng ca',  color: 'bg-violet-100 text-violet-700'   },
        ].map(c => (
          <span key={c.label} className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${c.color}`}>
            {c.label}
          </span>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {attendanceHistory.map((row, i) => {
          const s = statusCfg[row.status]
          const isToday = i === 0
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3.5
              ${i < attendanceHistory.length - 1 ? 'border-b border-slate-50' : ''}
              ${isToday ? 'bg-sky-50/50' : ''}`}>

              {/* Status dot */}
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />

              {/* Date */}
              <div className="w-20 shrink-0">
                <p className={`text-xs font-semibold ${isToday ? 'text-sky-600' : 'text-slate-700'}`}>
                  {row.date} {isToday && '(Hôm nay)'}
                </p>
              </div>

              {/* Times */}
              <div className="flex-1 flex items-center gap-1.5">
                {row.status !== 'off' && row.status !== 'absent' && row.status !== 'leave' ? (
                  <>
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {row.checkIn}
                    </span>
                    <IcoArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {row.checkOut ?? '...'}
                    </span>
                    {row.hours && (
                      <span className="text-xs text-slate-400 ml-1">{row.hours}h</span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>

              {/* Badge */}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${s.cls}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 3 — NGHỈ PHÉP / TĂNG CA
════════════════════════════════════════════ */
function TabLeave({ onNew }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? myLeaves
    : myLeaves.filter(l => l.status === filter)

  return (
    <div className="p-4 space-y-4">

      {/* Header + new button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Đơn của tôi</h2>
        <button onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white
            text-xs font-semibold rounded-xl hover:bg-sky-700 transition">
          <IcoPlus className="w-3.5 h-3.5" />
          Tạo đơn mới
        </button>
      </div>

      {/* Leave balance info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-teal-600">{monthlySummary.leaveLeft}</p>
          <p className="text-xs text-teal-700 mt-0.5">Ngày phép còn lại</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-violet-600">{monthlySummary.overtime}h</p>
          <p className="text-xs text-violet-700 mt-0.5">Tăng ca tháng này</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {[
          { key: 'all',      label: 'Tất cả'    },
          { key: 'pending',  label: 'Chờ duyệt' },
          { key: 'approved', label: 'Đã duyệt'  },
          { key: 'rejected', label: 'Từ chối'   },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition
              ${filter === f.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Leave list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            Không có đơn nào
          </div>
        )}
        {filtered.map(l => {
          const cfg = leaveCfg[l.status]
          return (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${l.status === 'pending'  ? 'bg-amber-100'   :
                      l.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {l.type.includes('Tăng ca')
                      ? <IcoClock className={`w-5 h-5 ${
                          l.status === 'pending'  ? 'text-amber-600'   :
                          l.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`} />
                      : <IcoCalendar className={`w-5 h-5 ${
                          l.status === 'pending'  ? 'text-amber-600'   :
                          l.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`} />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{l.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {l.from} – {l.to}
                      {l.days  && ` · ${l.days} ngày`}
                      {l.hours && ` · ${l.hours} giờ`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Cancel button for pending */}
              {l.status === 'pending' && (
                <button className="mt-3 w-full py-2 rounded-xl border border-red-200
                  text-red-500 text-xs font-semibold hover:bg-red-50 transition">
                  Hủy đơn
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 4 — LƯƠNG CỦA TÔI
════════════════════════════════════════════ */
function TabSalary({ selected, setSelected }) {
  const sal = salaryHistory[selected]

  return (
    <div className="p-4 space-y-4">

      <h2 className="text-base font-bold text-slate-800">Bảng lương của tôi</h2>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {salaryHistory.map((s, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition
              ${selected === i
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                : 'bg-white text-slate-600 border border-slate-200'}`}>
            {s.month}
          </button>
        ))}
      </div>

      {/* Main salary card */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-500 rounded-2xl p-5 text-white shadow-lg shadow-sky-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm opacity-80">{sal.month}</p>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            {sal.paid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
          </span>
        </div>
        <p className="text-xs opacity-70 mb-3">Lương thực nhận</p>
        <p className="text-3xl font-bold tracking-tight">{fmt(sal.total)}</p>
        <p className="text-xs opacity-60 mt-2">{employeeInfo.fullName} · {employeeInfo.id}</p>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Chi tiết</p>
        </div>
        {[
          { label: 'Lương cơ bản',      value: sal.base,       type: 'add',  icon: <IcoWallet className="w-4 h-4" />   },
          { label: 'Phụ cấp tăng ca',   value: sal.overtime,   type: 'add',  icon: <IcoClock className="w-4 h-4" />    },
          { label: 'Thưởng',            value: sal.bonus,      type: 'add',  icon: <IcoStar className="w-4 h-4" />     },
          { label: 'Bảo hiểm xã hội',   value: sal.insurance,  type: 'sub',  icon: <IcoShield className="w-4 h-4" />   },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5
            border-b border-slate-50 last:border-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
              ${row.type === 'add' ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-400'}`}>
              {row.icon}
            </div>
            <span className="flex-1 text-sm text-slate-700">{row.label}</span>
            <span className={`text-sm font-semibold
              ${row.type === 'add' ? 'text-slate-800' : 'text-red-500'}`}>
              {row.type === 'sub' ? '– ' : '+ '}{fmt(row.value)}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div className="flex items-center gap-3 px-4 py-4 bg-sky-50 border-t border-sky-100">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600
            flex items-center justify-center shrink-0">
            <IcoCheckCircle className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-bold text-slate-800">Thực nhận</span>
          <span className="text-base font-bold text-sky-600">{fmt(sal.total)}</span>
        </div>
      </div>

      {/* Download slip button */}
      <button className="w-full py-3.5 rounded-xl border-2 border-slate-200
        text-slate-600 text-sm font-semibold flex items-center justify-center gap-2
        hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition">
        <IcoDownload className="w-4 h-4" />
        Tải phiếu lương PDF
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════
   MODAL TẠO ĐƠN MỚI
════════════════════════════════════════════ */
function LeaveModal({ onClose }) {
  const [type, setType]       = useState('leave')
  const [reason, setReason]   = useState('')
  const [fromDate, setFrom]   = useState('')
  const [toDate, setTo]       = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)

  function handleSubmit() {
    if (!fromDate || !reason) return
    setSending(true)
    setTimeout(() => { setSending(false); setDone(true) }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl w-full max-w-lg animate-[slideUp_0.25s_ease-out]">

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Tạo đơn mới</h3>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
              <IcoX className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <IcoCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-800">Đã gửi đơn thành công!</p>
              <p className="text-xs text-slate-400">Quản lý sẽ duyệt trong thời gian sớm nhất.</p>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold">
                Đóng
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-4">

              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                  Loại đơn
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'leave',    label: 'Nghỉ phép', icon: <IcoCalendar className="w-4 h-4" /> },
                    { key: 'sick',     label: 'Nghỉ ốm',   icon: <IcoHeart className="w-4 h-4" />   },
                    { key: 'overtime', label: 'Tăng ca',   icon: <IcoClock className="w-4 h-4" />    },
                  ].map(t => (
                    <button key={t.key} onClick={() => setType(t.key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs
                        font-semibold transition
                        ${type === t.key
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Từ ngày</label>
                  <input type="date" value={fromDate} onChange={e => setFrom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                      bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Đến ngày</label>
                  <input type="date" value={toDate} onChange={e => setTo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                      bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Lý do</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Nhập lý do xin nghỉ..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                    bg-slate-50 placeholder:text-slate-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-sky-500 transition" />
              </div>

              {/* Submit */}
              <button onClick={handleSubmit}
                disabled={sending || !fromDate || !reason}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white
                  text-sm font-bold transition disabled:opacity-50
                  flex items-center justify-center gap-2">
                {sending && <IcoSpinner className="w-4 h-4 animate-spin" />}
                {sending ? 'Đang gửi...' : 'Gửi đơn'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SVG ICONS
════════════════════════════════════════════ */
function IcoHome({ className })        { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> }
function IcoClipboard({ className })   { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> }
function IcoCalendar({ className })    { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
function IcoWallet({ className })      { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> }
function IcoLogout({ className })      { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> }
function IcoFingerprint({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg> }
function IcoArrowRight({ className })  { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg> }
function IcoCheckCircle({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IcoClock({ className })       { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg> }
function IcoPlus({ className })        { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> }
function IcoStar({ className })        { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> }
function IcoShield({ className })      { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> }
function IcoDownload({ className })    { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function IcoX({ className })           { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> }
function IcoHeart({ className })       { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> }
function IcoSpinner({ className })     { return <svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> }
