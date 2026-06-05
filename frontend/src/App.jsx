import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import EmployeeHomePage from './pages/EmployeeHomePage'
import EmployeesPage    from './pages/EmployeesPage'
import ITRequestPage    from './pages/ITRequestPage'

/* Kiểm tra đăng nhập + phân quyền role */
function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Đăng nhập rồi nhưng sai role → chuyển về đúng trang
    return <Navigate to={role === 'employee' ? '/home' : '/dashboard'} replace />
  }

  return children
}

/* Sau khi login, chuyển về trang phù hợp với role */
function RootRedirect() {
  const token = localStorage.getItem('token')
  const role  = localStorage.getItem('role')

  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={role === 'employee' ? '/home' : '/dashboard'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Trang đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Trang Admin & Manager */}
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <DashboardPage />
        </PrivateRoute>
      } />

      {/* Trang Quản lý nhân viên */}
      <Route path="/employees" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <EmployeesPage />
        </PrivateRoute>
      } />

      {/* Trang IT Request – Đổi thiết bị */}
      <Route path="/it-requests" element={
        <PrivateRoute allowedRoles={['admin', 'manager']}>
          <ITRequestPage />
        </PrivateRoute>
      } />

      {/* Trang Employee */}
      <Route path="/home" element={
        <PrivateRoute allowedRoles={['employee']}>
          <EmployeeHomePage />
        </PrivateRoute>
      } />

      {/* Mặc định → tự chuyển đúng trang theo role */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
