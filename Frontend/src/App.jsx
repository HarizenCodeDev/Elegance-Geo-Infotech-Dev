import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import RootDashboard from './pages/RootDashboard'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import { useAuth } from './context/authContext.jsx'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/login" replace />

  return children
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />

        <Route
          path='/root-dashboard'
          element={
            <ProtectedRoute allowedRoles={['root']}>
              <RootDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin-dashboard'
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'hr', 'teamlead']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path='/employee-dashboard'
          element={
            <ProtectedRoute allowedRoles={['developer']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/Forgot-Password' element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
