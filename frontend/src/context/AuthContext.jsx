import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setAdmin({ token })
    }
    setLoading(false)
  }, [])

  const login = (token) => {
    localStorage.setItem('adminToken', token)
    setAdmin({ token })
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
