import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

/* ── Form thêm nhân viên ── */
function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', phone: '',
    position: '', baseSalary: '', startDate: '', role: 'employee',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName || !form.username || !form.password || !form.startDate) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    setLoading(true)
    try {
      await api.post('/employees', {
        fullName:   form.fullName,
        username:   form.username,
        password:   form.password,
        phone:      form.phone || null,
        position:   form.position || null,
        baseSalary: parseFloat(form.baseSalary) || 0,
        startDate:  form.startDate,
        role:       form.role,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi, thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Thêm nhân viên mới</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Họ tên + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tài khoản <span className="text-red-500">*</span></label>
              <input name="username" value={form.username} onChange={handleChange}
                placeholder="nguyenvana"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Mật khẩu <span className="text-red-500">*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="0901234567"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Chức vụ</label>
              <input name="position" value={form.position} onChange={handleChange}
                placeholder="Nhân viên kế toán"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Lương cơ bản (VNĐ)</label>
              <input name="baseSalary" type="number" value={form.baseSalary} onChange={handleChange}
                placeholder="10000000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Ngày vào làm <span className="text-red-500">*</span></label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Vai trò</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
                <option value="employee">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 text-red-600
              text-sm rounded-xl px-4 py-3">
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium
                text-slate-600 hover:bg-slate-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white
                text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {loading ? 'Đang lưu...' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Trang chính ── */
export default function EmployeesPage() {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [employees, setEmployees]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [toast, setToast]           = useState('')

  async function fetchEmployees() {
    setLoading(true)
    try {
      const { data } = await api.get('/employees', { params: { search: search || undefined } })
      setEmployees(data)
    } catch {
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [])

  function handleSuccess() {
    setToast('Thêm nhân viên thành công!')
    fetchEmployees()
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = employees.filter(e =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
    (e.phone || '').includes(search)
  )

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {showAdd && (
        <AddEmployeeModal onClose={() => setShowAdd(false)} onSuccess={handleSuccess} />
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-5 py-3
          rounded-xl shadow-lg text-sm font-medium animate-bounce">
          ✓ {toast}
        </div>
      )}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuToggle={() => setCollapsed(v => !v)}
          onMobileMenuToggle={() => setMobileOpen(v => !v)} collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">Quản lý nhân viên</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">{employees.length} nhân viên</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white
                text-sm font-medium rounded-xl hover:bg-sky-700 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Thêm nhân viên
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã NV, số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white
                text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"/>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                Đang tải...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p className="text-sm">Chưa có nhân viên nào</p>
                <button onClick={() => setShowAdd(true)}
                  className="mt-3 px-4 py-2 bg-sky-600 text-white text-sm rounded-xl hover:bg-sky-700 transition">
                  + Thêm nhân viên đầu tiên
                </button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-5 py-3 font-medium">Nhân viên</th>
                        <th className="text-left px-3 py-3 font-medium">Mã NV</th>
                        <th className="text-left px-3 py-3 font-medium">Chức vụ</th>
                        <th className="text-left px-3 py-3 font-medium">Điện thoại</th>
                        <th className="text-right px-3 py-3 font-medium">Lương cơ bản</th>
                        <th className="text-center px-3 py-3 font-medium">Vai trò</th>
                        <th className="text-center px-3 py-3 font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(emp => (
                        <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700
                                text-sm font-bold flex items-center justify-center shrink-0">
                                {emp.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-700">{emp.fullName}</p>
                                <p className="text-xs text-slate-400">{emp.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-500 font-mono text-xs">{emp.employeeCode}</td>
                          <td className="px-3 py-3 text-slate-500">{emp.position || '—'}</td>
                          <td className="px-3 py-3 text-slate-500">{emp.phone || '—'}</td>
                          <td className="px-3 py-3 text-right text-slate-600 font-medium">
                            {emp.baseSalary ? emp.baseSalary.toLocaleString('vi-VN') + ' ₫' : '—'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                              ${emp.role === 'admin' ? 'bg-red-100 text-red-700' :
                                emp.role === 'manager' ? 'bg-violet-100 text-violet-700' :
                                'bg-sky-100 text-sky-700'}`}>
                              {emp.role === 'admin' ? 'Admin' :
                               emp.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                              ${emp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {emp.isActive ? 'Hoạt động' : 'Bị khoá'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filtered.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700
                        text-sm font-bold flex items-center justify-center shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{emp.fullName}</p>
                        <p className="text-xs text-slate-400">{emp.employeeCode} · {emp.position || 'Chưa có chức vụ'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0
                        ${emp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {emp.isActive ? 'Hoạt động' : 'Khoá'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
