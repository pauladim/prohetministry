import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoadingScreen from './components/ui/LoadingScreen'

import Home from './pages/Home'
import About from './pages/About'
import Sermons from './pages/Sermons'
import Books from './pages/Books'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PaymentSuccess from './pages/PaymentSuccess'
import DownloadVerification from './pages/DownloadVerification'
import NotFound from './pages/NotFound'

function AnimatedRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"                  element={<Home />} />
          <Route path="/about"             element={<About />} />
          <Route path="/sermons"           element={<Sermons />} />
          <Route path="/books"             element={<Books />} />
          <Route path="/contact"           element={<Contact />} />
          <Route path="/payment-success"   element={<PaymentSuccess />} />
          <Route path="/download/:token"   element={<DownloadVerification />} />
          <Route path="/admin/login"       element={<AdminLogin />} />
          <Route path="/admin/dashboard"   element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    // Simulate a brief loading period for fonts/assets
    const t = setTimeout(() => setAppReady(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Film-grain noise overlay */}
        <div className="noise-overlay" />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111009',
              color: '#f9f6f0',
              border: '1px solid rgba(201, 154, 22, 0.25)',
              fontFamily: '"Jost", sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#c99a16', secondary: '#0a0906' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0a0906' } },
          }}
        />

        {/* Loading screen */}
        <AnimatePresence>
          {!appReady && <LoadingScreen key="loader" />}
        </AnimatePresence>

        {/* Main app */}
        {appReady && <AnimatedRoutes />}
      </BrowserRouter>
    </AuthProvider>
  )
}


