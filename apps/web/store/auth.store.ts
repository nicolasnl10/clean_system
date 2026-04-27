import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'atendimento' | 'supervisor' | 'funcionario'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({ user, token })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-store', partialize: (state) => ({ user: state.user, token: state.token }) },
  ),
)
