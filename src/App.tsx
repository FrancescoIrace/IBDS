import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import Layout from './layout/Layout'
import { ProtectedRoute, AdminRoute } from './auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const GiornataPage = lazy(() => import('./pages/giornata/GiornataPage'))
const EventiPage = lazy(() => import('./pages/eventi/EventiPage'))
const CalendarioPage = lazy(() => import('./pages/calendario/CalendarioPage'))
const StoricoPage = lazy(() => import('./pages/storico/StoricoPage'))
const StatistichePage = lazy(() => import('./pages/statistiche/StatistichePage'))
const UtentiPage = lazy(() => import('./pages/utenti/UtentiPage'))

function PageFallback() {
  return (
    <Center minH="50vh">
      <Spinner size="xl" color="brand.600" />
    </Center>
  )
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrati" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <GiornataPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventi"
          element={
            <ProtectedRoute>
              <Layout>
                <EventiPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarioPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/storico"
          element={
            <ProtectedRoute>
              <Layout>
                <StoricoPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistiche"
          element={
            <ProtectedRoute>
              <Layout>
                <StatistichePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/utenti"
          element={
            <AdminRoute>
              <Layout>
                <UtentiPage />
              </Layout>
            </AdminRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
