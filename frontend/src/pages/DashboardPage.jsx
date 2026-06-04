import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

/* ── Dữ liệu mẫu (sẽ thay bằng API sau) ── */
const stats = [
  { label: 'Tổng nhân viên',   value: '124',  sub: '+3 tháng này',   color: 'bg-sky-600',    icon: <IcoUsers /> },
  { label: 'Có mặt hôm nay',   value: '108',  sub: '87% tổng số',    color: 'bg-emerald-500',icon: <IcoCheck /> },
  { label: 'Đang nghỉ phép',   value: '9',    sub: '3 chờ duyệt',    color: 'bg-amber-500',  icon: <IcoLeave /> },
  { label: 'Tăng ca tháng này',value: '47',   sub: 'Tổng 312 giờ',   color: 'bg-violet-500', icon: <IcoClock /> },
]

const recentAttendance = [
  { name: 'Nguyễn Văn An',  dept: 'Kế toán',    checkIn: '07:58',  checkOut: '17:05', status: 'present',  hours: 8.1 },
  { name: 'Trần Thị Bích',  dept: 'Nhân sự',    checkIn: '08:15',  checkOut: '17:00', status: 'late',     hours: 7.8 },
  { name: 'Lê Minh Châu',   dept: 'Kỹ thuật',   checkIn: '07:45',  checkOut: '19:30', status: 'overtime', hours: 10.5 },
  { name: 'Phạm Thị Dung',  dept: 'Marketing',  checkIn: '—',      checkOut: '—',     status: 'absent',   hours: 0 },
  { name: 'Hoàng Văn Em',   dept: 'Kinh doanh', checkIn: '08:00',  checkOut: '17:00', status: 'present',  hours: 8.0 },
  { name: 'Vũ Thị Phương',  dept: 'Kế toán',    checkIn: '—',      checkOut: '—',     status: 'on_leave', hours: 0 },
]

const pendingLeaves = [
  { name: 'Trần Thị Bích',  type: 'Nghỉ phép năm',  from: '06/06', to: '07/06', days: 2 },
  { name: 'Đỗ Văn Hùng',   type: 'Nghỉ ốm',         from: '05/06', to: '05/06', days: 1 },
  { name: 'Ngô Thị Lan',   type: 'Nghỉ thai sản',   from: '10/06', to: '10/09', days: 90 },
]

const statusConfig = {
  present:  { label: 'Có mặt',   cls: 'bg-emerald-100 text-emerald-700' },
  late:     { label: 'Đi trễ',   cls: 'bg-amber-100 text-amber-700' },
  absent:   { label: 'Vắng',     cls: 'bg-red-100 text-red-700' },
  overtime: { label: 'Tăng ca',  cls: 'bg-violet-100 text-violet-700' },
  on_leave: { label: 'Nghỉ phép',cls: 'bg-sky-100 text-sky-700' },
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Backdrop for mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
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

        {/* Main content — pb-20 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">Tổng quan hệ thống</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-sky-600 text-white
              text-sm font-medium rounded-xl hover:bg-sky-700 transition">
              <IcoRefresh className="w-4 h-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-sm
                border border-slate-100 flex items-center gap-3 md:gap-4">
                <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl ${s.color}
                  flex items-center justify-center text-white shrink-0`}>
                  <span className="w-4 h-4 md:w-6 md:h-6">{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xl md:text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 truncate">{s.label}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 truncate">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

            {/* Attendance — card list on mobile, table on desktop */}
            <div className="xl:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Chấm công hôm nay</h2>
                  <p className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('vi-VN', { dateStyle: 'full' })}
                  </p>
                </div>
                <button className="text-xs text-sky-600 hover:underline">Xem tất cả →</button>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-slate-50">
                {recentAttendance.map((row, i) => {
                  const s = statusConfig[row.status]
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700
                        text-sm font-bold flex items-center justify-center shrink-0">
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
                    <tr className="text-xs text-slate-400 border-b border-slate-100">
                      <th className="text-left px-5 py-3 font-medium">Nhân viên</th>
                      <th className="text-left px-3 py-3 font-medium">Phòng ban</th>
                      <th className="text-center px-3 py-3 font-medium">Vào</th>
                      <th className="text-center px-3 py-3 font-medium">Ra</th>
                      <th className="text-center px-3 py-3 font-medium">Giờ</th>
                      <th className="text-center px-3 py-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((row, i) => {
                      const s = statusConfig[row.status]
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700
                                text-xs font-bold flex items-center justify-center shrink-0">
                                {row.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-500">{row.dept}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.checkIn}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.checkOut}</td>
                          <td className="px-3 py-3 text-center text-slate-600">
                            {row.hours > 0 ? `${row.hours}h` : '—'}
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
            <div className="space-y-6">

              {/* Donut chart placeholder */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Tỉ lệ hôm nay</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="#e2e8f0" strokeWidth="3.5" />
                      {/* present 87% */}
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke="#0ea5e9" strokeWidth="3.5"
                        strokeDasharray="87 13" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800">87%</span>
                      <span className="text-xs text-slate-400">Có mặt</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Có mặt',    count: 108, color: 'bg-sky-500' },
                    { label: 'Đi trễ',    count: 5,   color: 'bg-amber-400' },
                    { label: 'Vắng mặt',  count: 7,   color: 'bg-red-400' },
                    { label: 'Nghỉ phép', count: 4,   color: 'bg-violet-400' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`} />
                      <span className="text-slate-600 flex-1">{l.label}</span>
                      <span className="font-semibold text-slate-700">{l.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending leaves */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-800">Đơn chờ duyệt</h2>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs
                    font-semibold rounded-full">{pendingLeaves.length}</span>
                </div>
                <div className="space-y-3">
                  {pendingLeaves.map((l, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3
                      border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700
                        text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {l.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{l.name}</p>
                        <p className="text-xs text-slate-400">{l.type}</p>
                        <p className="text-xs text-slate-400">{l.from} – {l.to} ({l.days} ngày)</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button className="px-2 py-0.5 bg-emerald-500 text-white
                          text-xs rounded-lg hover:bg-emerald-600 transition">✓</button>
                        <button className="px-2 py-0.5 bg-slate-100 text-slate-500
                          text-xs rounded-lg hover:bg-red-100 hover:text-red-600 transition">✗</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom: Quick actions */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 md:mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Thêm nhân viên',  icon: <IcoAdd />,    color: 'text-sky-600 bg-sky-50 hover:bg-sky-100' },
                { label: 'Chấm công thủ công',icon: <IcoAttend />,color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                { label: 'Tạo bảng lương',  icon: <IcoPay />,    color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
                { label: 'Xuất báo cáo',    icon: <IcoExport />, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
              ].map(a => (
                <button key={a.label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl
                    text-sm font-medium transition ${a.color}`}>
                  <span className="w-6 h-6">{a.icon}</span>
                  <span className="text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

        </main>

        {/* Bottom navigation — mobile only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200
          flex items-center justify-around h-16 safe-area-bottom">
          {[
            { label: 'Dashboard', icon: <IcoDashboard className="w-5 h-5" />, active: true },
            { label: 'Chấm công', icon: <IcoAttend className="w-5 h-5" />, active: false },
            { label: 'Nghỉ phép', icon: <IcoLeave className="w-5 h-5" />, active: false },
            { label: 'Lương', icon: <IcoPay className="w-5 h-5" />, active: false },
          ].map(item => (
            <button key={item.label} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition
              ${item.active ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {item.icon}
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
