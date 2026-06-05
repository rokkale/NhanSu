import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
})
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

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

const fmt = (n) => Number(n).toLocaleString('vi-VN') + ' ₫'

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function EmployeeHomePage() {
  const navigate  = useNavigate()
  const [tab, setTab]           = useState('home')
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState(0)
  const [emp, setEmp] = useState(null)
  const [loadingEmp, setLoadingEmp] = useState(true)

  useEffect(() => {
    api.get('/employees/me')
      .then(r => setEmp(r.data))
      .catch(() => {})
      .finally(() => setLoadingEmp(false))
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('fullName')
    navigate('/login')
  }

  const avatarLetter = emp?.fullName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-lg mx-auto relative">

      {/* ── Top Navbar ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <div className="w-9 h-9 rounded-full bg-sky-600 text-white text-sm font-bold
          flex items-center justify-center shrink-0">
          {loadingEmp ? '…' : avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {loadingEmp ? '...' : (emp?.fullName ?? '—')}
          </p>
          <p className="text-xs text-slate-400">
            {emp?.employeeCode ?? '—'} · {emp?.department ?? '—'}
          </p>
        </div>
        <button onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
          <IcoLogout className="w-5 h-5" />
        </button>
      </header>

      {/* ── Tab Content ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'home'       && <TabHome emp={emp} checkedIn={checkedIn} checkedOut={checkedOut}
                                          setCheckedIn={setCheckedIn} setCheckedOut={setCheckedOut} />}
        {tab === 'attendance' && <TabAttendance />}
        {tab === 'leave'      && <TabLeave      onNew={() => setShowLeaveModal(true)} />}
        {tab === 'salary'     && <TabSalary     emp={emp} selected={selectedSalary} setSelected={setSelectedSalary} />}
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
function TabHome({ emp, checkedIn, checkedOut, setCheckedIn, setCheckedOut }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const [loading, setLoading] = useState(false)
  const [checkInTime, setCheckInTime]   = useState(null)
  const [checkOutTime, setCheckOutTime] = useState(null)

  function handleCheckIn() {
    setLoading(true)
    setTimeout(() => {
      const t = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      setCheckInTime(t); setCheckedIn(true); setLoading(false)
    }, 800)
  }
  function handleCheckOut() {
    setLoading(true)
    setTimeout(() => {
      const t = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      setCheckOutTime(t); setCheckedOut(true); setLoading(false)
    }, 800)
  }

  const firstName = emp?.fullName?.split(' ')?.pop() ?? '...'

  return (
    <div className="p-4 space-y-4">

      {/* Greeting */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80 capitalize">{dateStr}</p>
        <h1 className="text-xl font-bold mt-1">Xin chào, {firstName} 👋</h1>
        <p className="text-xs opacity-70 mt-1">
          {emp?.position ?? '—'} · {emp?.department ?? '—'}
        </p>
      </div>

      {/* Check-in / Check-out Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Chấm công hôm nay</h2>
          {checkedIn && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full
              ${checkedOut ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
              {checkedOut ? 'Hoàn thành' : 'Đang làm việc'}
            </span>
          )}
        </div>

        {/* Time row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Giờ vào</p>
            <p className={`text-xl font-bold ${checkedIn ? 'text-slate-800' : 'text-slate-300'}`}>
              {checkedIn ? checkInTime : '--:--'}
            </p>
          </div>
          <IcoArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Giờ ra</p>
            <p className={`text-xl font-bold ${checkedOut ? 'text-slate-800' : 'text-slate-300'}`}>
              {checkedOut ? checkOutTime : '--:--'}
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

      {/* Thông tin nhân viên */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Thông tin của tôi</h2>
        {[
          { label: 'Mã nhân viên',  value: emp?.employeeCode },
          { label: 'Chức vụ',       value: emp?.position },
          { label: 'Phòng ban',     value: emp?.department },
          { label: 'Ngày vào làm',  value: emp?.startDate ? new Date(emp.startDate).toLocaleDateString('vi-VN') : null },
          { label: 'Điện thoại',    value: emp?.phone },
          { label: 'Lương cơ bản',  value: emp?.baseSalary != null ? fmt(emp.baseSalary) : null },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center text-sm">
            <span className="text-slate-400">{row.label}</span>
            <span className="font-semibold text-slate-700">{row.value ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Chú thích module chưa có DB */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex gap-2">
        <span className="text-base leading-none shrink-0">🔧</span>
        <p>Tính năng <strong>chấm công, nghỉ phép, lịch sử lương</strong> đang được phát triển — dữ liệu sẽ hiển thị sau khi kết nối.</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 2 — CHẤM CÔNG CỦA TÔI
════════════════════════════════════════════ */
function TabAttendance() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-bold text-slate-800">Lịch sử chấm công</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100
        flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <IcoClipboard className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">Chưa có dữ liệu chấm công</p>
        <p className="text-xs text-center px-8">Tính năng đang được phát triển. Dữ liệu sẽ hiển thị sau khi kết nối hệ thống chấm công.</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 3 — NGHỈ PHÉP / TĂNG CA
════════════════════════════════════════════ */
function TabLeave({ onNew }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Đơn của tôi</h2>
        <button onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white
            text-xs font-semibold rounded-xl hover:bg-sky-700 transition">
          <IcoPlus className="w-3.5 h-3.5" />
          Tạo đơn mới
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100
        flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <IcoCalendar className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">Chưa có đơn nghỉ phép nào</p>
        <p className="text-xs text-center px-8">Tính năng đang được phát triển. Nhấn "Tạo đơn mới" để gửi yêu cầu.</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   TAB 4 — LƯƠNG CỦA TÔI
════════════════════════════════════════════ */
function TabSalary({ emp }) {
  const base = emp?.baseSalary ?? 0
  const now  = new Date()
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-bold text-slate-800">Bảng lương của tôi</h2>

      {/* Main salary card */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-500 rounded-2xl p-5 text-white shadow-lg shadow-sky-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm opacity-80">{monthLabel}</p>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
            ⏳ Chưa thanh toán
          </span>
        </div>
        <p className="text-xs opacity-70 mb-3">Lương cơ bản</p>
        <p className="text-3xl font-bold tracking-tight">{fmt(base)}</p>
        <p className="text-xs opacity-60 mt-2">{emp?.fullName ?? '—'} · {emp?.employeeCode ?? '—'}</p>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Chi tiết</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
            <IcoWallet className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm text-slate-700">Lương cơ bản</span>
          <span className="text-sm font-semibold text-slate-800">+ {fmt(base)}</span>
        </div>
        <div className="px-4 py-3 bg-amber-50">
          <p className="text-xs text-amber-700">
            Phụ cấp, tăng ca, thưởng và khấu trừ sẽ cập nhật sau khi có dữ liệu chấm công.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 bg-sky-50 border-t border-sky-100">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <IcoCheckCircle className="w-4 h-4" />
          </div>
          <span className="flex-1 text-sm font-bold text-slate-800">Lương cơ bản</span>
          <span className="text-base font-bold text-sky-600">{fmt(base)}</span>
        </div>
      </div>

      {/* Lịch sử lương */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100
        flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
        <IcoWallet className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium">Chưa có lịch sử lương</p>
        <p className="text-xs text-center px-8">Lịch sử thanh toán sẽ hiển thị khi hệ thống lương được kích hoạt.</p>
      </div>
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
