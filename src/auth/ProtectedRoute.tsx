import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <Center minH="100dvh">
        <Spinner size="xl" color="brand.600" />
      </Center>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <Center minH="100dvh">
        <Spinner size="xl" color="brand.600" />
      </Center>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
