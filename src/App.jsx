import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainMenu from './pages/MainMenu'
import RoomPage from './pages/RoomPage'
import BillsPage from './pages/BillsPage'
import RepairPage from './pages/RepairPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AdminPage from './pages/admin'
import AdminRoute from './components/AdminRoute'
import AdminLoginPage from './pages/AdminLoginPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>กำลังโหลด...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/main" element={
          <PrivateRoute><MainMenu /></PrivateRoute>
        } />
        <Route path="/room" element={
          <PrivateRoute><RoomPage /></PrivateRoute>
        } />
        <Route path="/bills" element={
          <PrivateRoute><BillsPage /></PrivateRoute>
        } />
        <Route path="/repair" element={
          <PrivateRoute><RepairPage /></PrivateRoute>
        } />
        <Route path="/announcements" element={
          <PrivateRoute><AnnouncementsPage /></PrivateRoute>
        } />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={
          <AdminRoute><AdminPage /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}