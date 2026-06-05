import { useNavigate, useLocation } from 'react-router-dom'

const menu = [
  {
    group: 'TỔNG QUAN',
    items: [
      { label: 'Dashboard', icon: <IcoDashboard />, path: '/dashboard' },
    ]
  },
  {
    group: 'NHÂN SỰ',
    items: [
      { label: 'Nhân viên',   icon: <IcoUsers />,    path: '/employees' },
      { label: 'Phòng ban',   icon: <IcoDept />,     path: '/departments' },
      { label: 'Ca làm việc', icon: <IcoClock />,    path: '/shifts' },
    ]
  },
  {
    group: 'CHẤM CÔNG',
    items: [
      { label: 'Chấm công',   icon: <IcoAttend />,   path: '/attendance' },
      { label: 'Tăng ca',     icon: <IcoOvertime />, path: '/overtime' },
      { label: 'Nghỉ phép',   icon: <IcoLeave />,    path: '/leaves' },
      { label: 'Ngày lễ',     icon: <IcoHoliday />,  path: '/holidays' },
    ]
  },
  {
    group: 'TÀI CHÍNH',
    items: [
      { label: 'Bảng lương',  icon: <IcoPayroll />,  path: '/payroll' },
    ]
  },
  {
    group: 'HỆ THỐNG',
    items: [
      { label: 'Tài khoản',   icon: <IcoUser />,     path: '/users' },
      { label: 'Nhật ký',     icon: <IcoLog />,      path: '/logs' },
    ]
  },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleNav(path) {
    navigate(path)
    onMobileClose?.()
  }

  return (
    <aside
      style={{ background: 'linear-gradient(160deg, #0d1f3c 0%, #162e5a 100%)' }}
      className={`
        flex flex-col text-white select-none shrink-0
        fixed md:static inset-y-0 left-0 z-50
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${collapsed ? 'md:w-[72px]' : 'md:w-64'} w-72
      `}
    >
      {/* Decorative glow blob */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 h-16 shrink-0
        ${collapsed ? 'px-0 justify-center' : 'px-5 gap-3'}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 glow-blue"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
          <IcoBuilding className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold leading-tight tracking-wide">HR Manager</p>
            <p className="text-[10px] text-sky-400 leading-tight">Quản lý nhân sự</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide space-y-0.5">
        {menu.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-slate-500 px-5 pt-4 pb-1.5 tracking-[0.15em] uppercase">
                {group.group}
              </p>
            )}
            {collapsed && <div className="h-2" />}

            {group.items.map(item => {
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  title={collapsed ? item.label : ''}
                  className={`
                    group relative w-full flex items-center gap-3
                    text-sm transition-all duration-200
                    ${collapsed ? 'justify-center px-0 py-3' : 'px-5 py-2.5'}
                    ${active
                      ? 'nav-active text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {/* active left border */}
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5
                      rounded-r-full bg-sky-400" />
                  )}

                  {/* icon wrapper */}
                  <span className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                    ${active
                      ? 'bg-sky-500/30 text-sky-300 scale-105 shadow-blue-glow'
                      : 'text-slate-400 group-hover:text-sky-300 group-hover:bg-white/8 group-hover:scale-110'}
                  `}>
                    <span className="w-4 h-4">{item.icon}</span>
                  </span>

                  {!collapsed && (
                    <span className="truncate font-medium">{item.label}</span>
                  )}

                  {/* active pulse dot */}
                  {active && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 animate-active-pulse shrink-0" />
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white
                      text-xs rounded-lg opacity-0 pointer-events-none whitespace-nowrap
                      group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden md:flex items-center justify-center p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <IcoChevronRight /> : <IcoChevronLeft />}
        </button>
      </div>
    </aside>
  )
}

/* Icons */
function IcoDashboard() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function IcoUsers()     { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> }
function IcoDept()      { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> }
function IcoClock()     { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg> }
function IcoAttend()    { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> }
function IcoOvertime()  { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IcoLeave()     { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> }
function IcoHoliday()   { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> }
function IcoPayroll()   { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function IcoUser()      { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
function IcoLog()       { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function IcoBuilding({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> }
function IcoChevronLeft()  { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg> }
function IcoChevronRight() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg> }
