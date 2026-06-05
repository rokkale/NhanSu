import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

/* ── Forgot Password Modal ── */
function ForgotModal({ onClose }) {
  // step: 'choose' | 'sms' | 'email' | 'it' | 'success'
  const [step, setStep] = useState('choose')
  const [method, setMethod] = useState(null)
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [sending, setSending] = useState(false)

  function handleSend() {
    if (method === 'sms') {
      if (!/^0\d{9}$/.test(input.replace(/\s/g, ''))) {
        setInputError('Số điện thoại không hợp lệ (VD: 0901234567)')
        return
      }
    } else if (method === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        setInputError('Email không hợp lệ')
        return
      }
    }
    setSending(true)
    // Giả lập gọi API
    setTimeout(() => {
      setSending(false)
      setStep('success')
    }, 1500)
  }

  const methods = [
    {
      key: 'sms',
      icon: <IconPhone className="w-6 h-6" />,
      title: 'Gửi SMS',
      desc: 'Nhận mã xác nhận qua số điện thoại đăng ký',
      color: 'border-sky-200 hover:border-sky-400 hover:bg-sky-50',
      activeColor: 'border-sky-500 bg-sky-50',
    },
    {
      key: 'email',
      icon: <IconMail className="w-6 h-6" />,
      title: 'Gửi Email',
      desc: 'Nhận link đặt lại mật khẩu qua Gmail',
      color: 'border-slate-200 hover:border-violet-400 hover:bg-violet-50',
      activeColor: 'border-violet-500 bg-violet-50',
    },
    {
      key: 'it',
      icon: <IconHeadset className="w-6 h-6" />,
      title: 'Liên hệ IT',
      desc: 'Yêu cầu bộ phận IT hỗ trợ đặt lại mật khẩu',
      color: 'border-slate-200 hover:border-amber-400 hover:bg-amber-50',
      activeColor: 'border-amber-500 bg-amber-50',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden
        animate-[fadeUp_0.2s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step !== 'choose' && step !== 'success' && (
              <button onClick={() => { setStep('choose'); setInput(''); setInputError('') }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <IconBack className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {step === 'choose' && 'Quên mật khẩu?'}
                {step === 'sms'    && 'Xác nhận qua SMS'}
                {step === 'email'  && 'Xác nhận qua Email'}
                {step === 'it'     && 'Liên hệ bộ phận IT'}
                {step === 'success' && 'Yêu cầu đã gửi!'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'choose' && 'Chọn cách khôi phục tài khoản'}
                {step === 'sms'    && 'Nhập số điện thoại đã đăng ký'}
                {step === 'email'  && 'Nhập địa chỉ Gmail đã đăng ký'}
                {step === 'it'     && 'Thông tin liên hệ hỗ trợ'}
                {step === 'success' && ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* Step: choose */}
          {step === 'choose' && (
            <div className="space-y-3">
              {methods.map(m => (
                <button key={m.key}
                  onClick={() => { setMethod(m.key); setStep(m.key) }}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition ${m.color}`}>
                  <div className="shrink-0 mt-0.5 text-slate-500">{m.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                  <IconChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Step: sms */}
          {step === 'sms' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-xs text-sky-700">
                Mã OTP gồm 6 chữ số sẽ được gửi đến số điện thoại bạn nhập bên dưới.
                Mã có hiệu lực trong <strong>5 phút</strong>.
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconPhone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={input}
                    onChange={e => { setInput(e.target.value); setInputError('') }}
                    placeholder="VD: 0901 234 567"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm
                      bg-slate-50 placeholder:text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
                {inputError && <p className="text-xs text-red-500">{inputError}</p>}
              </div>
              <button onClick={handleSend} disabled={sending || !input}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm
                  font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {sending && <IconSpinner className="w-4 h-4 animate-spin" />}
                {sending ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </div>
          )}

          {/* Step: email */}
          {step === 'email' && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs text-violet-700">
                Link đặt lại mật khẩu sẽ được gửi đến Gmail của bạn.
                Link có hiệu lực trong <strong>15 phút</strong>.
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Địa chỉ Gmail</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconMail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={input}
                    onChange={e => { setInput(e.target.value); setInputError('') }}
                    placeholder="VD: nguyenvana@gmail.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm
                      bg-slate-50 placeholder:text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                </div>
                {inputError && <p className="text-xs text-red-500">{inputError}</p>}
              </div>
              <button onClick={handleSend} disabled={sending || !input}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm
                  font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {sending && <IconSpinner className="w-4 h-4 animate-spin" />}
                {sending ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </div>
          )}

          {/* Step: it */}
          {step === 'it' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                Bộ phận IT sẽ xác minh danh tính và đặt lại mật khẩu cho bạn trong vòng <strong>30 phút</strong> trong giờ hành chính.
              </div>
              <div className="space-y-3">
                {[
                  { icon: <IconPhone className="w-4 h-4" />, label: 'Hotline IT', value: '(+84) 028 3456 7890', href: 'tel:02834567890' },
                  { icon: <IconMail className="w-4 h-4" />,  label: 'Email IT',   value: 'it-support@company.vn', href: 'mailto:it-support@company.vn' },
                  { icon: <IconChat className="w-4 h-4" />,  label: 'Zalo OA',    value: 'Zalo: HR Manager Support', href: null },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600
                      flex items-center justify-center shrink-0">
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">{c.label}</p>
                      {c.href
                        ? <a href={c.href} className="text-sm font-medium text-sky-600 hover:underline">{c.value}</a>
                        : <p className="text-sm font-medium text-slate-700">{c.value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">
                Giờ hành chính: Thứ 2 – Thứ 6, 07:30 – 17:00
              </p>
            </div>
          )}

          {/* Step: success */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <IconCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {method === 'sms'   && `Đã gửi OTP đến ${input}`}
                  {method === 'email' && `Đã gửi link đến ${input}`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {method === 'sms'   && 'Kiểm tra tin nhắn SMS và nhập mã trong vòng 5 phút.'}
                  {method === 'email' && 'Kiểm tra hộp thư (cả mục Spam) và nhấn link trong vòng 15 phút.'}
                </p>
              </div>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white
                  text-sm font-semibold transition">
                Đã hiểu, đóng
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Sinh UUID v4 thuần JS — không cần Secure Context (HTTPS)
function generateUUID() {
  // Ưu tiên dùng crypto nếu có (HTTPS / localhost)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: sinh thủ công bằng Math.random — hoạt động trên HTTP thường
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Lấy hoặc tạo mới Device ID — lưu vĩnh viễn trong localStorage
function getDeviceId() {
  const key = 'hr_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = generateUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [deviceBlocked, setDeviceBlocked] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.')
      return
    }
    setLoading(true)
    setDeviceBlocked(false)
    try {
      const deviceId = getDeviceId()
      const data = await login(form.username, form.password, deviceId)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('fullName', data.fullName)
      navigate(data.role === 'employee' ? '/home' : '/dashboard')
    } catch (err) {
      const code = err.response?.data?.code
      if (code === 'DEVICE_MISMATCH') {
        setDeviceBlocked(true)  // hiện màn hình thông báo đặc biệt
      } else {
        setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}

      {/* ── Left: branding panel ── */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-14 text-white select-none relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d1f3c 0%, #0e3460 50%, #0ea5e9 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
            <IconBuilding className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">HR Manager</span>
        </div>

        {/* Headline */}
        <div className="space-y-5 relative z-10">
          <h1 className="text-5xl font-extrabold leading-tight">
            Quản lý nhân sự
          </h1>
          <p className="text-sky-200 text-base leading-relaxed">
            Hệ thống quản lý nhân sự toàn diện — chấm công, nghỉ phép, tăng ca và bảng lương trong một nền tảng.
          </p>
          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {['Chấm công', 'Nghỉ phép', 'Tăng ca', 'Bảng lương', 'Báo cáo'].map(f => (
              <span key={f}
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-white/20
                  bg-white/10 hover:bg-white/20 transition-colors cursor-default">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { icon: <IconUsers className="w-5 h-5" />, label: 'Nhân viên', val: '124+' },
            { icon: <IconDept className="w-5 h-5" />,  label: 'Phòng ban', val: '12' },
            { icon: <IconChart className="w-5 h-5" />, label: 'Báo cáo', val: '∞' },
          ].map(s => (
            <div key={s.label}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                {s.icon}
              </div>
              <span className="text-lg font-bold">{s.val}</span>
              <span className="text-xs text-sky-200">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f1fb 50%, #f0f4ff 100%)' }}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
              <IconBuilding className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">HR Manager</span>
          </div>

          <div className="glass-card rounded-2xl shadow-xl p-8 border border-white/60">
            <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
            <p className="text-slate-400 text-sm mt-1 mb-7">
              Nhập thông tin tài khoản để truy cập hệ thống.
            </p>

          {/* Màn hình bị khoá thiết bị */}
          {deviceBlocked && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <IconAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Thiết bị không được phép</p>
                <p className="text-xs text-red-500 mt-1">
                  Tài khoản này đã được đăng ký trên một thiết bị khác.
                  <br />Liên hệ bộ phận IT để được hỗ trợ.
                </p>
              </div>
              <div className="bg-white border border-red-100 rounded-xl p-3 text-left space-y-1.5">
                <p className="text-xs font-semibold text-slate-600">Thông tin liên hệ IT:</p>
                <a href="tel:02834567890"
                  className="flex items-center gap-2 text-xs text-sky-600 hover:underline">
                  <IconPhone className="w-3.5 h-3.5" /> (028) 3456 7890
                </a>
                <a href="mailto:it-support@company.vn"
                  className="flex items-center gap-2 text-xs text-sky-600 hover:underline">
                  <IconMail className="w-3.5 h-3.5" /> it-support@company.vn
                </a>
              </div>
              <button onClick={() => setDeviceBlocked(false)}
                className="text-xs text-slate-400 hover:underline">
                ← Thử tài khoản khác
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate
            className={`space-y-5 ${deviceBlocked ? 'hidden' : ''}`}>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tài khoản</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconUser className="w-4 h-4" />
                </span>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Nhập tài khoản..."
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/60 text-sm
                    bg-white/70 placeholder:text-slate-400 backdrop-blur-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                    transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconLock className="w-4 h-4" />
                </span>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu..."
                  autoComplete="current-password"
                  className="w-full pl-9 pr-11 py-3 rounded-xl border border-white/60 text-sm
                    bg-white/70 placeholder:text-slate-400 backdrop-blur-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                    transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                    hover:text-slate-600 transition">
                  {showPw ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <button type="button" onClick={() => setShowForgot(true)}
                className="text-xs text-sky-600 hover:underline transition">
                Quên mật khẩu?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 items-start bg-red-50 border border-red-200
                              text-red-600 text-sm rounded-xl px-4 py-3">
                <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold
                transition-all duration-200 active:scale-[.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-2
                hover:scale-[1.02] hover:shadow-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}
            >
              {loading && <IconSpinner className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          </div>{/* end glass-card */}

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} HR Manager &mdash;{' '}
            <button onClick={() => setShowForgot(true)}
              className="text-sky-500 hover:underline">
              Quên mật khẩu?
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}

/* ── SVG Icons ── */
function IconBuilding({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
           M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}
function IconUsers({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
           M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
           m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconDept({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h4a2 2 0 012 2v2H3V7zm0 0v10a2 2 0 002 2h14a2 2 0 002-2V7
           m-9 4v6m4-6v6M9 11h6" />
    </svg>
  )
}
function IconChart({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9
           a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5
           a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconUser({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function IconLock({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
function IconEye({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
function IconEyeOff({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
           a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
           M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
           M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
           a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}
function IconAlert({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3
           L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
function IconSpinner({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
function IconPhone({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13
           a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2
           h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}
function IconMail({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
function IconHeadset({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072
           M6.343 17.657a9 9 0 010-12.728M9.172 15.536a5 5 0 010-7.072
           M12 12h.01" />
    </svg>
  )
}
function IconChat({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949
           L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
function IconX({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function IconBack({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
function IconChevronRight({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
