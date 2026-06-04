import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuToggle, onMobileMenuToggle, collapsed }) {
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const fullName = localStorage.getItem('fullName') || 'Admin'
  const role     = localStorage.getItem('role') || ''

  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0">
      {/* Mobile: hamburger opens overlay; Desktop: collapses sidebar */}
      <button onClick={onMobileMenuToggle}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition md:hidden">
        <IcoMenu className="w-5 h-5" />
      </button>
      <button onClick={onMenuToggle}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition hidden md:flex">
        {collapsed
          ? <IcoMenu className="w-5 h-5" />
          : <IcoArrowLeft className="w-5 h-5" />}
      </button>

      {/* Date */}
      <span className="text-sm text-slate-500 hidden md:block capitalize">{dateStr}</span>

      <div className="flex-1" />

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
        <IcoBell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropRef}>
        <button onClick={() => setDropOpen(v => !v)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
            hover:bg-slate-100 transition">
          <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-bold">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{fullName}</p>
            <p className="text-xs text-slate-400 leading-tight capitalize">{role}</p>
          </div>
          <IcoChevron className="w-4 h-4 text-slate-400" />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl
            border border-slate-100 py-1 z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">{fullName}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
              text-slate-600 hover:bg-slate-50 transition">
              <IcoProfile className="w-4 h-4" /> Thông tin cá nhân
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
              text-slate-600 hover:bg-slate-50 transition">
              <IcoSetting className="w-4 h-4" /> Cài đặt
            </button>
            <div className="border-t border-slate-100 mt-1" />
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
              text-red-500 hover:bg-red-50 transition">
              <IcoLogout className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function IcoMenu({ className })    { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg> }
function IcoBell({ className })    { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> }
function IcoChevron({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg> }
function IcoProfile({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
function IcoSetting({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> }
function IcoLogout({ className })  { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> }
function IcoArrowLeft({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg> }
