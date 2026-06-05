import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar  from '../components/Navbar'
import axios   from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
})
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

const STATUS_CFG = {
  pending_it:      { label: 'Chờ IT xử lý',   cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',     dot: 'bg-amber-400' },
  processing:      { label: 'IT đang xử lý',   cls: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',           dot: 'bg-sky-400 animate-pulse' },
  pending_purchase:{ label: 'Chờ mua sắm',     cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',  dot: 'bg-violet-400' },
  done:            { label: 'Hoàn thành',       cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',dot: 'bg-emerald-400' },
  rejected:        { label: 'Từ chối',          cls: 'bg-red-100 text-red-700 ring-1 ring-red-200',           dot: 'bg-red-400' },
}

const ACTION_CFG = {
  repair:     { label: 'Sửa chữa',           icon: '🔧', color: 'text-amber-600',  bg: 'bg-amber-50 ring-amber-200' },
  spare:      { label: 'Cấp máy dự phòng',   icon: '💻', color: 'text-sky-600',    bg: 'bg-sky-50 ring-sky-200' },
  new_device: { label: 'Mua thiết bị mới',   icon: '🛒', color: 'text-violet-600', bg: 'bg-violet-50 ring-violet-200' },
}

/* ── Timeline step ── */
function Step({ label, active, done, last }) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all
        ${done  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' :
          active ? 'bg-sky-500 text-white shadow-sm shadow-sky-200 ring-2 ring-sky-200' :
                   'bg-slate-100 text-slate-400'}`}>
        {done ? '✓' : active ? <span className="w-2 h-2 rounded-full bg-white block" /> : ''}
      </div>
      <div className="hidden sm:block min-w-0">
        <p className={`text-[11px] font-semibold truncate ${done || active ? 'text-slate-700' : 'text-slate-400'}`}>{label}</p>
      </div>
      {!last && <div className={`flex-1 h-0.5 mx-1 rounded-full ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
    </div>
  )
}

function Timeline({ status }) {
  const steps = ['Tạo yêu cầu', 'Manager duyệt', 'IT xử lý', 'Mua sắm', 'Hoàn thành']
  const idx = { pending_it: 2, processing: 2, pending_purchase: 3, done: 4, rejected: -1 }
  const cur = idx[status] ?? 0
  return (
    <div className="flex items-center w-full gap-0">
      {steps.map((s, i) => (
        <Step key={s} label={s} done={i < cur} active={i === cur && status !== 'rejected'} last={i === steps.length - 1} />
      ))}
    </div>
  )
}

/* ── IT Action Modal ── */
function ITActionModal({ ticket, onClose, onSave }) {
  const [action, setAction]     = useState(ticket.itAction || '')
  const [newId, setNewId]       = useState(ticket.newDeviceId || '')
  const [note, setNote]         = useState(ticket.itNote || '')
  const [reject, setReject]     = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function handleSave() {
    if (reject) {
      if (!rejectNote.trim()) { setError('Vui lòng nhập lý do từ chối.'); return }
      setLoading(true)
      onSave({ ticketId: ticket.id, action: 'reject', rejectNote })
        .finally(() => setLoading(false))
      return
    }
    if (!action) { setError('Vui lòng chọn hướng xử lý.'); return }
    if (action !== 'repair' && !newId.trim()) { setError('Vui lòng nhập IT RS ID thiết bị mới / dự phòng.'); return }
    setLoading(true)
    onSave({ ticketId: ticket.id, action, newDeviceId: newId, itNote: note })
      .finally(() => setLoading(false))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-fadeUp">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/50"
          style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/20 text-sky-300">
              <IcoIT className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">IT Xử lý yêu cầu</p>
              <p className="text-xs text-sky-300 font-mono">{ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition">
            <IcoX className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Thông tin thiết bị */}
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'rgba(241,245,249,0.8)' }}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin thiết bị yêu cầu đổi</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <InfoRow icon="👤" label="Nhân viên"   value={`${ticket.employeeName} (${ticket.employeeCode})`} />
              <InfoRow icon="🏢" label="Phòng ban"   value={ticket.department} />
              <InfoRow icon="🖥️" label="Loại TB"    value={ticket.deviceType} />
              <InfoRow icon="📋" label="Model"       value={ticket.deviceModel} />
              <InfoRow icon="🔑" label="IT RS ID cũ" value={ticket.deviceOldId} mono />
              <InfoRow icon="📅" label="Ngày yêu cầu" value={ticket.requestDate} />
            </div>
            <div className="pt-1 border-t border-slate-200">
              <p className="text-xs text-slate-500 font-medium mb-1">Lý do yêu cầu đổi:</p>
              <p className="text-sm text-slate-700 font-medium">{ticket.reason}</p>
            </div>
          </div>

          {/* Reject toggle */}
          <div className="flex items-center gap-3">
            <button onClick={() => { setReject(v => !v); setError('') }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                transition-all duration-200 border
                ${reject
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}>
              <IcoX className="w-3.5 h-3.5" />
              {reject ? 'Đang từ chối' : 'Từ chối yêu cầu'}
            </button>
            {!reject && <p className="text-xs text-slate-400">Hoặc chọn hướng xử lý bên dưới</p>}
          </div>

          {reject ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Lý do từ chối <span className="text-red-500">*</span></label>
              <textarea value={rejectNote} onChange={e => { setRejectNote(e.target.value); setError('') }}
                rows={3} placeholder="Nhập lý do từ chối yêu cầu đổi thiết bị..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition resize-none" />
            </div>
          ) : (
            <>
              {/* Hướng xử lý */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hướng xử lý <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ACTION_CFG).map(([key, cfg]) => (
                    <button key={key} onClick={() => { setAction(key); setError('') }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-200
                        border-2 ring-1
                        ${action === key
                          ? `${cfg.bg} ring-2 border-transparent scale-[1.02] shadow-md`
                          : 'bg-white border-slate-200 ring-transparent hover:border-slate-300 hover:bg-slate-50'}`}>
                      <span className="text-2xl">{cfg.icon}</span>
                      <span className={`text-xs font-semibold leading-tight ${action === key ? cfg.color : 'text-slate-600'}`}>
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IT RS ID mới */}
              {(action === 'spare' || action === 'new_device') && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {action === 'spare' ? 'IT RS ID thiết bị dự phòng' : 'IT RS ID thiết bị mới'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">IT-</span>
                    <input value={newId} onChange={e => { setNewId(e.target.value); setError('') }}
                      placeholder="XX-0000"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono bg-slate-50
                        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition uppercase"
                      style={{ letterSpacing: '0.05em' }} />
                  </div>
                  {action === 'new_device' && (
                    <p className="text-xs text-violet-600 flex items-center gap-1.5">
                      <IcoInfo className="w-3.5 h-3.5 shrink-0" />
                      Ticket sẽ chuyển sang <strong>Phòng Mua sắm</strong> sau khi xác nhận
                    </p>
                  )}
                </div>
              )}

              {action === 'repair' && (
                <div className="rounded-xl p-3 bg-amber-50 ring-1 ring-amber-200 text-xs text-amber-700 flex gap-2">
                  <span className="text-base leading-none">🔧</span>
                  <div>
                    <p className="font-semibold">Sửa chữa tại chỗ</p>
                    <p className="mt-0.5 text-amber-600">Thiết bị sẽ được gửi sửa, nhân viên dùng tạm máy dự phòng (nếu có).
                    Ticket sẽ đóng sau khi trả thiết bị.</p>
                  </div>
                </div>
              )}

              {/* Ghi chú kỹ thuật */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ghi chú kỹ thuật</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  rows={2} placeholder="Tình trạng thiết bị, thao tác đã thực hiện..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition resize-none" />
              </div>
            </>
          )}

          {error && (
            <div className="flex gap-2 items-center bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              <IcoX className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
                text-slate-600 hover:bg-slate-50 transition-all duration-200">
              Hủy
            </button>
            <button onClick={handleSave} disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold
                transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2
                hover:scale-[1.02] hover:shadow-lg shadow-md
                ${reject
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'}`}>
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>}
              {loading ? 'Đang lưu...' : reject ? 'Xác nhận từ chối' : 'Xác nhận xử lý'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-sm leading-none mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className={`text-xs font-semibold text-slate-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

/* ── Detail Drawer ── */
function DetailDrawer({ ticket, onClose, onProcess }) {
  const sc = STATUS_CFG[ticket.status]
  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-slideInRight"
        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm">
          <div>
            <p className="text-sm font-bold text-slate-800">{ticket.id}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ticket.employeeName} · {ticket.department}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <IcoX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Timeline */}
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tiến trình</p>
            <Timeline status={ticket.status} />
            {ticket.status === 'rejected' && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 text-xs text-red-600 flex items-start gap-2">
                <IcoX className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><strong>Lý do từ chối:</strong> {ticket.itNote}</span>
              </div>
            )}
          </div>

          {/* Thông tin */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết yêu cầu</p>
            <div className="glass-card rounded-xl p-4 grid grid-cols-2 gap-3">
              <InfoRow icon="🖥️" label="Loại thiết bị"  value={ticket.deviceType} />
              <InfoRow icon="📋" label="Model"           value={ticket.deviceModel} />
              <InfoRow icon="🔑" label="IT RS ID cũ"    value={ticket.deviceOldId} mono />
              <InfoRow icon="📅" label="Ngày tạo"       value={ticket.requestDate} />
              <InfoRow icon="✅" label="Manager duyệt"  value={ticket.managerApproved} />
              <InfoRow icon="👤" label="Mã NV"          value={ticket.employeeCode} />
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-[10px] text-slate-400 font-medium mb-1">Lý do yêu cầu</p>
              <p className="text-sm text-slate-700">{ticket.reason}</p>
            </div>
          </div>

          {/* Kết quả IT */}
          {(ticket.itAction || ticket.itNote) && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kết quả IT xử lý</p>
              <div className="glass-card rounded-xl p-4 space-y-2.5">
                {ticket.itAction && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ring-1 ${ACTION_CFG[ticket.itAction]?.bg}`}>
                    <span className="text-lg">{ACTION_CFG[ticket.itAction]?.icon}</span>
                    <span className={`text-sm font-semibold ${ACTION_CFG[ticket.itAction]?.color}`}>
                      {ACTION_CFG[ticket.itAction]?.label}
                    </span>
                  </div>
                )}
                {ticket.newDeviceId && (
                  <InfoRow icon="🆕" label="IT RS ID mới" value={ticket.newDeviceId} mono />
                )}
                {ticket.itNote && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium mb-1">Ghi chú kỹ thuật</p>
                    <p className="text-sm text-slate-700">{ticket.itNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          {(ticket.status === 'pending_it') && (
            <button onClick={() => onProcess(ticket)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold
                flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
              <IcoIT className="w-4 h-4" />
              Bắt đầu xử lý
            </button>
          )}
          {ticket.status === 'processing' && (
            <button onClick={() => onProcess(ticket)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold
                flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg shadow-md transition-all
                bg-gradient-to-r from-sky-500 to-blue-600">
              <IcoEdit className="w-4 h-4" />
              Cập nhật xử lý
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── helper: format ngày từ ISO string ── */
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN')
}

/* ── Trang chính ── */
export default function ITRequestPage() {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('all')
  const [selected, setSelected]     = useState(null)
  const [processing, setProcessing] = useState(null)
  const [toast, setToast]           = useState(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/it-requests')
      // normalize field names từ API (camelCase .NET) sang format component dùng
      setTickets(data.map(t => ({
        id:           t.id,
        ticketCode:   t.ticketCode,
        employeeName: t.employeeName,
        employeeCode: t.employeeCode,
        department:   t.department ?? '—',
        deviceOldId:  t.deviceOldId,
        deviceType:   t.deviceType,
        deviceModel:  t.deviceModel,
        reason:       t.reason,
        status:       t.status,
        requestDate:  fmtDate(t.requestedAt),
        managerApproved: fmtDate(t.managerApprovedAt),
        itAction:     t.itAction ?? '',
        newDeviceId:  t.newDeviceId ?? '',
        itNote:       t.itNote ?? '',
      })))
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = useCallback(async ({ ticketId, action, newDeviceId, itNote, rejectNote }) => {
    try {
      await api.patch(`/it-requests/${ticketId}/process`, {
        action,
        newDeviceId: newDeviceId || null,
        itNote:      action === 'reject' ? rejectNote : (itNote || null),
      })
      await fetchTickets()
      setProcessing(null)
      setSelected(null)
      const isReject   = action === 'reject'
      const isPurchase = action === 'new_device'
      showToast(
        isReject   ? 'Đã từ chối ticket thành công' :
        isPurchase ? 'Đã chuyển sang Phòng Mua sắm' :
                     'Đã xử lý ticket thành công',
        isReject ? 'error' : 'success'
      )
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra, thử lại.', 'error')
    }
  }, [fetchTickets])

  const filtered = tickets.filter(t => {
    const matchSearch = search === '' ||
      (t.ticketCode  ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.employeeName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.deviceOldId  ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all:              tickets.length,
    pending_it:       tickets.filter(t => t.status === 'pending_it').length,
    processing:       tickets.filter(t => t.status === 'processing').length,
    pending_purchase: tickets.filter(t => t.status === 'pending_purchase').length,
    done:             tickets.filter(t => t.status === 'done').length,
  }

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f1fb 50%, #f0f4ff 100%)' }}>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {processing && (
        <ITActionModal
          ticket={processing}
          onClose={() => setProcessing(null)}
          onSave={handleSave}
        />
      )}

      {selected && !processing && (
        <DetailDrawer
          ticket={selected}
          onClose={() => setSelected(null)}
          onProcess={t => { setSelected(null); setProcessing(t) }}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white px-5 py-3 rounded-xl shadow-lg
          text-sm font-medium animate-fadeUp flex items-center gap-2
          ${toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
          {toast.type === 'error' ? <IcoX className="w-4 h-4" /> : <span>✓</span>}
          {toast.msg}
        </div>
      )}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuToggle={() => setCollapsed(v => !v)}
          onMobileMenuToggle={() => setMobileOpen(v => !v)} collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6 scrollbar-hide">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <IcoIT className="w-5 h-5 text-sky-600" />
                IT Request – Đổi thiết bị
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                {counts.pending_it} ticket chờ IT xử lý
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 text-white text-sm font-medium
              rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
              <IcoExport className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { key: 'pending_it',       label: 'Chờ IT xử lý',  val: counts.pending_it,       grad: 'from-amber-400 to-orange-500',   ring: 'ring-amber-200',   vc: 'text-amber-600' },
              { key: 'processing',       label: 'Đang xử lý',    val: counts.processing,       grad: 'from-sky-400 to-blue-500',       ring: 'ring-sky-200',     vc: 'text-sky-600' },
              { key: 'pending_purchase', label: 'Chờ mua sắm',   val: counts.pending_purchase, grad: 'from-violet-400 to-purple-500',  ring: 'ring-violet-200',  vc: 'text-violet-600' },
              { key: 'done',             label: 'Hoàn thành',    val: counts.done,             grad: 'from-emerald-400 to-teal-500',   ring: 'ring-emerald-200', vc: 'text-emerald-600' },
            ].map((c, i) => (
              <button key={c.key} onClick={() => setFilter(f => f === c.key ? 'all' : c.key)}
                className={`glass-card rounded-xl md:rounded-2xl p-3 md:p-4 card-hover text-left
                  flex items-center gap-3 animate-fadeUp transition-all
                  ${filterStatus === c.key ? 'ring-2 ring-sky-400 scale-[1.02]' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.grad}
                  flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-offset-1 ${c.ring}`}>
                  <IcoTicket className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${c.vc}`}>{c.val}</p>
                  <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo mã ticket, tên NV, IT RS ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/60 glass-card
                  text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all
                  placeholder:text-slate-400" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'pending_it', label: 'Chờ IT' },
                { key: 'processing', label: 'Đang xử lý' },
                { key: 'pending_purchase', label: 'Chờ mua' },
                { key: 'done', label: 'Xong' },
                { key: 'rejected', label: 'Từ chối' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                    ${filterStatus === f.key
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'glass-card text-slate-600 hover:text-sky-700 hover:bg-sky-50'}`}>
                  {f.label}
                  {f.key !== 'all' && counts[f.key] > 0 &&
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]
                      ${filterStatus === f.key ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {counts[f.key]}
                    </span>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          <div className="space-y-3">
            {loading ? (
              <div className="glass-card rounded-2xl flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang tải dữ liệu...
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                <IcoTicket className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Không có ticket nào</p>
              </div>
            ) : filtered.map((t, i) => {
              const sc = STATUS_CFG[t.status]
              const ac = t.itAction ? ACTION_CFG[t.itAction] : null
              const needAction = t.status === 'pending_it' || t.status === 'processing'
              return (
                <div key={t.id}
                  className={`glass-card rounded-xl md:rounded-2xl p-4 md:p-5 card-hover cursor-pointer
                    transition-all duration-200 animate-fadeUp
                    ${needAction ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent'}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setSelected(t)}>

                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center
                      shrink-0 text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}>
                      {t.employeeName.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50
                          px-2 py-0.5 rounded-lg ring-1 ring-sky-200">{t.ticketCode}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        {ac && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ${ac.bg} ${ac.color}`}>
                            {ac.icon} {ac.label}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{t.employeeName}</span>
                        <span>{t.department}</span>
                        <span>📅 {t.requestDate}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="text-base">🖥️</span>
                          <strong>{t.deviceType}</strong> · {t.deviceModel}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-500 bg-slate-100
                          px-2 py-0.5 rounded-lg">
                          🔑 {t.deviceOldId}
                        </span>
                        {t.newDeviceId && (
                          <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50
                            px-2 py-0.5 rounded-lg ring-1 ring-emerald-200">
                            🆕 {t.newDeviceId}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-1 italic">"{t.reason}"</p>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex flex-col items-end gap-2" onClick={e => e.stopPropagation()}>
                      {needAction && (
                        <button onClick={() => setProcessing(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold
                            rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                          <IcoIT className="w-3.5 h-3.5" />
                          {t.status === 'pending_it' ? 'Xử lý' : 'Cập nhật'}
                        </button>
                      )}
                      <button onClick={() => setSelected(t)}
                        className="text-xs text-slate-400 hover:text-sky-600 transition-colors px-2">
                        Chi tiết →
                      </button>
                    </div>
                  </div>

                  {/* Mini timeline */}
                  <div className="mt-3 pt-3 border-t border-white/50">
                    <Timeline status={t.status} />
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Icons ── */
function IcoIT({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
}
function IcoX({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
}
function IcoInfo({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
}
function IcoEdit({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
}
function IcoTicket({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
  </svg>
}
function IcoExport({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
}
