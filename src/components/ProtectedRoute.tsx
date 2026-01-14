import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }

  return <>{children}</>
}
