import { Navigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checkingSession } = useAuth()

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Zap size={28} className="text-teal animate-pulse" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
