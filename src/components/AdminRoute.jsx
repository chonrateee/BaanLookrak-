import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null // หรือจะใส่ spinner ก็ได้

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/main" replace />

  return children
}