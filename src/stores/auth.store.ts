import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export type Role = 'SUPERADMIN' | 'CIUDADANO' | 'TECNICO' | 'SECRETARIA' | 'FINANCIERO' | 'INVITADO'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  cedula?: string
  telefono?: string
  role: Role
  zona?: 'URBANO' | 'RURAL' | null  // Solo relevante para TECNICO
  activo: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  registerInvitado: (email: string) => Promise<void>
  completarPerfil: (data: CompletarPerfilData) => Promise<void>
  logout: () => void
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  nombre: string
  apellido: string
  cedula: string
  telefono?: string
}

export interface CompletarPerfilData {
  nombre: string
  apellido: string
  cedula: string
  password: string
  telefono?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('gad_access_token', data.accessToken)
          localStorage.setItem('gad_refresh_token', data.refreshToken)
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión',
          })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { data: res } = await api.post('/auth/register', data)
          localStorage.setItem('gad_access_token', res.accessToken)
          localStorage.setItem('gad_refresh_token', res.refreshToken)
          set({
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isLoading: false,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al registrarse',
          })
          throw err
        }
      },

      // ── Registro rápido solo con email ──────────────────
      registerInvitado: async (email) => {
        set({ isLoading: true, error: null })
        try {
          const { data: res } = await api.post('/auth/registro-rapido', { email })
          localStorage.setItem('gad_access_token', res.accessToken)
          localStorage.setItem('gad_refresh_token', res.refreshToken)
          set({
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isLoading: false,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al registrarse',
          })
          throw err
        }
      },

      // ── Completar perfil INVITADO → CIUDADANO ───────────
      completarPerfil: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { data: res } = await api.post('/auth/completar-perfil', data)
          localStorage.setItem('gad_access_token', res.accessToken)
          localStorage.setItem('gad_refresh_token', res.refreshToken)
          set({
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isLoading: false,
          })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al completar perfil',
          })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('gad_access_token')
        localStorage.removeItem('gad_refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'gad-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
