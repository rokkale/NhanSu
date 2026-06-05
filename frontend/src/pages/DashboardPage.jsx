import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const stats = [
  {
    label: 'Tổng nhân viên',    value: '124', sub: '+3 tháng này',
    iconCls: 'icon-gradient-blue',  icon: <IcoUsers />,
    ringCls: 'ring-sky-200',  valueCls: 'text-sky-600',
  },
  {
    label: 'Có mặt hôm nay',   value: '108', sub: '87% tổng số',
    iconCls: 'icon-gradient-green', icon: <IcoCheck />,
    ringCls: 'ring-emerald-200', valueCls: 'text-emerald-600',
  },
  {
    label: 'Đang nghỉ phép',   value: '9',   sub: '3 chờ duyệt',
    iconCls: 'icon-gradient-amber', icon: <IcoLeave />,
    ringCls: 'ring-amber-200',  valueCls: 'text-amber-600',
  },
  {
    label: 'Tăng ca tháng này', value: '47',  sub: 'Tổng 312 giờ',
    iconCls: 'icon-gradient-violet',icon: <IcoClock />,
    ringCls: 'ring-violet-200', valueCls: 'text-violet-600',
  },
]

const recentAttendance = [
  { name: 'Nguyễn Văn An',  dept: 'Kế toán',    checkIn: '07:58', checkOut: '17:05', status: 'present',  hours: 8.1 },
  { name: 'Trần Thị Bích',  dept: 'Nhân sự',    checkIn: '08:15', checkOut: '17:00', status: 'late',     hours: 7.8 },
  { name: 'Lê Minh Châu',   dept: 'Kỹ thuật',   checkIn: '07:45', checkOut: '19:30', status: 'overtime', hours: 10.5 },
  { name: 'Phạm Thị Dung',  dept: 'Marketing',  checkIn: '—',     checkOut: '—',     status: 'absent',   hours: 0 },
  { name: 'Hoàng Văn Em',   dept: 'Kinh doanh', checkIn: '08:00', checkOut: '17:00', status: 'present',  hours: 8.0 },
  { name: 'Vũ Thị Phương',  dept: 'Kế toán',    checkIn: '—',     checkOut: '—',     status: 'on_leave', hours: 0 },
]

const pendingLeaves = [
  { name: 'Trần Thị Bích', type: 'Nghỉ phép năm', from: '06/06', to: '07/06', days: 2 },
  { name: 'Đỗ Văn Hùng',  type: 'Nghỉ ốm',        from: '05/06', to: '05/06', days: 1 },
  { name: 'Ngô Thị Lan',  type: 'Nghỉ thai sản',  from: '10/06', to: '10/09', days: 90 },
]

const statusConfig = {
  present:  { label: 'Có mặt',    cls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' },
  late:     { label: 'Đi trễ',    cls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' },
  absent:   { label: 'Vắng',      cls: 'bg-red-100 text-red-700 ring-1 ring-red-200' },
  overtime: { label: 'Tăng ca',   cls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200' },
  on_leave: { label: 'Nghỉ phép', cls: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200' },
}

const donutLegend = [
  { label: 'Có mặt',    count: 108, color: '#0ea5e9', pct: 87 },
  { label: 'Đi trễ',    count: 5,   color: '#f59e0b', pct: 4 },
  { label: 'Vắng mặt',  count: 7,   color: '#ef4444', pct: 6 },
  { label: 'Nghỉ phép', count: 4,   color: '#8b5cf6', pct: 3 },
]

const quickActions = [
  { label: 'Thêm nhân viên',     icon: <IcoAdd />,    grad: 'from-sky-500 to-blue-600',    shadow: 'shadow-sky-200' },
  { label: 'Chấm công thủ công', icon: <IcoAttend />, grad: 'from-emerald-500 to-teal-600',shadow: 'shadow-emerald-200' },
  { label: 'Tạo bảng lương',     icon: <IcoPay />,    grad: 'from-violet-500 to-purple-600',shadow: 'shadow-violet-200' },
  { label: 'Xuất báo cáo',       icon: <IcoExport />, grad: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-200' },
]

/* SVG donut helpers */
const R = 15.9
const C = 2 * Math.PI * R

function getSegments(items) {
  let offset = 0
  return items.map(item => {
    const dash = (item.pct / 100) * C
    const gap  = C - dash
    const seg = { dash, gap, offset, color: item.color }
    offset += dash
    return seg
  })
}

export default function DashboardPage() {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const segments = getSegments(donutLegend)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f1fb 50%, #f0f4ff 100%)' }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          onMenuToggle={() => setCollapsed(v => !v)}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          collapsed={collapsed}
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-5 pb-20 md:pb-6 scrollbar-hide">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Cập nhật: {new Date().toLocaleString('vi-VN')}
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 text-white
              text-sm font-medium rounded-xl transition-all duration-200
              hover:scale-105 hover:shadow-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
              <IcoRefresh className="w-4 h-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s, i) => (
              <div key={s.label}
                className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 card-hover
                  flex items-center gap-3 md:gap-4 animate-fadeUp"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${s.iconCls}
                  flex items-center justify-center text-white shrink-0 shadow-md
                  ring-2 ring-offset-1 ${s.ringCls}`}>
                  <span className="w-4 h-4 md:w-5 md:h-5">{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className={`text-xl md:text-2xl font-bold ${s.valueCls}`}>{s.value}</p>
                  <p className="text-[11px] md:text-xs text-slate-600 font-medium mt-0.5 truncate">{s.label}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 truncate">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">

            {/* Attendance table */}
            <div className="xl:col-span-2 glass-card rounded-xl md:rounded-2xl overflow-hidden card-hover">
              <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4
                border-b border-white/50">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Chấm công hôm nay</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date().toLocaleDateString('vi-VN', { dateStyle: 'full' })}
                  </p>
                </div>
                <button className="text-xs font-medium text-sky-600 hover:text-sky-700
                  px-2.5 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                  Xem tất cả →
                </button>
              </div>

              {/* Mobile list */}
              <div className="md:hidden divide-y divide-white/30">
                {recentAttendance.map((row, i) => {
                  const s = statusConfig[row.status]
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50/40 transition-colors">
                      <div className="w-9 h-9 rounded-xl text-sm font-bold
                        flex items-center justify-center shrink-0 text-white"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                        {row.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.dept}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                          {s.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {row.checkIn !== '—' ? `${row.checkIn} → ${row.checkOut}` : '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 bg-slate-50/60">
                      <th className="text-left px-5 py-3 font-semibold">Nhân viên</th>
                      <th className="text-left px-3 py-3 font-semibold">Phòng ban</th>
                      <th className="text-center px-3 py-3 font-semibold">Vào</th>
                      <th className="text-center px-3 py-3 font-semibold">Ra</th>
                      <th className="text-center px-3 py-3 font-semibold">Giờ</th>
                      <th className="text-center px-3 py-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((row, i) => {
                      const s = statusConfig[row.status]
                      return (
                        <tr key={i} className="border-t border-white/40 hover:bg-sky-50/40 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg text-xs font-bold
                                flex items-center justify-center shrink-0 text-white"
                                style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}>
                                {row.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-500">{row.dept}</td>
                          <td className="px-3 py-3 text-center text-slate-600 font-medium">{row.checkIn}</td>
                          <td className="px-3 py-3 text-center text-slate-600 font-medium">{row.checkOut}</td>
                          <td className="px-3 py-3 text-center text-slate-600">
                            {row.hours > 0 ? <span className="font-semibold">{row.hours}h</span> : '—'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Donut chart */}
              <div className="glass-card rounded-2xl p-5 card-hover">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Tỉ lệ hôm nay</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      {/* track */}
                      <circle cx="18" cy="18" r={R} fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      {/* segments */}
                      {segments.map((seg, i) => (
                        <circle key={i} cx="18" cy="18" r={R} fill="none"
                          stroke={seg.color} strokeWidth="3.2"
                          strokeDasharray={`${seg.dash} ${seg.gap}`}
                          strokeDashoffset={-seg.offset}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800">87%</span>
                      <span className="text-xs text-slate-400 font-medium">Có mặt</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {donutLegend.map(l => (
                    <div key={l.label} className="flex items-center gap-2.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: l.color, boxShadow: `0 0 6px ${l.color}60` }} />
                      <span className="text-slate-600 flex-1 font-medium">{l.label}</span>
                      <span className="font-bold text-slate-700">{l.count}</span>
                      <span className="text-slate-400 w-8 text-right">{l.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending leaves */}
              <div className="glass-card rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">Đơn chờ duyệt</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-amber-700
                    bg-amber-100 ring-1 ring-amber-200">{pendingLeaves.length}</span>
                </div>
                <div className="space-y-3">
                  {pendingLeaves.map((l, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3
                      border-b border-white/40 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-xl text-xs font-bold
                        flex items-center justify-center shrink-0 mt-0.5 text-white"
                        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        {l.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{l.name}</p>
                        <p className="text-xs text-slate-500">{l.type}</p>
                        <p className="text-xs text-slate-400">{l.from} – {l.to}
                          <span className="ml-1 text-slate-500 font-medium">({l.days} ngày)</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button className="w-7 h-7 rounded-lg text-white text-xs font-bold
                          flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>✓</button>
                        <button className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold
                          flex items-center justify-center hover:bg-red-100 hover:text-red-500
                          transition-all duration-200 hover:scale-110">✗</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-5 card-hover">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 md:mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((a, i) => (
                <button key={a.label}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-xl
                    transition-all duration-200 hover:scale-105 hover:shadow-lg ${a.shadow}
                    bg-white/60 hover:bg-white border border-white/60`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.grad}
                    flex items-center justify-center text-white shadow-md
                    group-hover:scale-110 transition-transform duration-200`}>
                    <span className="w-5 h-5">{a.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight text-slate-700">
                    {a.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-white/50
          flex items-center justify-around h-16">
          {[
            { label: 'Dashboard', icon: <IcoDashboard className="w-5 h-5" />, active: true },
            { label: 'Chấm công', icon: <IcoAttend className="w-5 h-5" />, active: false },
            { label: 'Nghỉ phép', icon: <IcoLeave className="w-5 h-5" />, active: false },
            { label: 'Lương',     icon: <IcoPay className="w-5 h-5" />, active: false },
          ].map(item => (
            <button key={item.label}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200
                ${item.active ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {item.active
                ? <span className="relative">
                    {item.icon}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-500 animate-active-pulse" />
                  </span>
                : item.icon
              }
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

/* Icons */
function IcoUsers()   { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> }
function IcoCheck()   { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IcoLeave({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
function IcoClock()   { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg> }
function IcoRefresh({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> }
function IcoAdd()     { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg> }
function IcoAttend({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> }
function IcoPay({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IcoExport()  { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function IcoDashboard({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
