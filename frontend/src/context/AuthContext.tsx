// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiGet, apiPost, ApiResponse } from '../lib/api'
import { User, AuthResponse } from '../types'

interface AuthContextProps {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  // On mount, try to fetch current session
  useEffect(() => {
    ;(async () => {
      try {
        const res: ApiResponse<User> = await apiGet<User>('/api/v1/auth/me')
        if (res.data) setUser(res.data)
      } catch (_) {
        // ignore – not logged in
      }
    })()
  }, [])

  const login = async (email: string, password: string) => {
    const payload = { email, password }
    const res: ApiResponse<AuthResponse> = await apiPost<AuthResponse, typeof payload>(
      '/api/v1/auth/login',
      payload
    )
    if (res.error) throw new Error(res.error)
    setUser(res.data.user)
  }

  const register = async (email: string, password: string, displayName: string) => {
    const payload = { email, password, display_name: displayName }
    const res: ApiResponse<AuthResponse> = await apiPost<AuthResponse, typeof payload>(
      '/api/v1/auth/register',
      payload
    )
    if (res.error) throw new Error(res.error)
    setUser(res.data.user)
  }

  const logout = () => {
    // Simple client‑side logout; backend endpoint can be added later.
    setUser(null)
    // Optionally notify backend to clear session cookie.
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

