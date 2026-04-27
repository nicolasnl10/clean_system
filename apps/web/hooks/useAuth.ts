'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const { user, token, setAuth, clearAuth } = useAuthStore()

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(data.user, data.accessToken)
    document.cookie = `access_token=${data.accessToken}; path=/; max-age=${8 * 3600}`
    router.push('/dashboard')
  }

  function logout() {
    clearAuth()
    document.cookie = 'access_token=; path=/; max-age=0'
    router.push('/login')
  }

  return { user, token, login, logout, isAuthenticated: !!token }
}
