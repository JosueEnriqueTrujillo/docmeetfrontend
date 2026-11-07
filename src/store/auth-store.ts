import { defineStore } from 'pinia'

// 1. Importamos el controlador (Asegúrate de que el archivo exista y se llame exactamente así)
import { authController } from '../controllers/auth.controller'

// 2. Importamos los tipos (Asegúrate de tener un archivo index.ts en tu carpeta types)
import type { ILoginCredentials, IRegisterPayload, IUpdateProfilePayload, IUser } from '../types'

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Leemos la sesión actual de localStorage al inicializar la tienda
    const session = authController.readSession()
    
    return {
      user: session.user as IUser | null,
      token: session.token as string | null,
      isLoading: false,
      error: null as string | null,
    }
  },

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    isAdmin: (state): boolean => authController.isAdmin(state.user),
  },

  actions: {
    async login(credentials: ILoginCredentials) {
      this.isLoading = true
      this.error = null
      try {
        const { user, token } = await authController.login(credentials)
        this.user = user
        this.token = token
      } catch (err: any) {
        this.error = err.message || 'Error al iniciar sesión'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async register(payload: IRegisterPayload) {
      this.isLoading = true
      this.error = null
      try {
        const { user, token } = await authController.register(payload)
        this.user = user
        this.token = token
      } catch (err: any) {
        this.error = err.message || 'Error al registrar usuario'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(payload: IUpdateProfilePayload) {
      this.isLoading = true
      this.error = null
      try {
        const updatedUser = await authController.updateProfile(payload)
        this.user = updatedUser
      } catch (err: any) {
        this.error = err.message || 'Error al actualizar el perfil'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchProfile() {
      this.isLoading = true
      try {
        const user = await authController.fetchProfile()
        this.user = user
      } catch (err: any) {
        console.error('Error obteniendo el perfil:', err)
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      authController.logout()
      this.user = null
      this.token = null
    },

    syncAuth() {
      const session = authController.syncFromStorage()
      this.user = session.user
      this.token = session.token
    }
  }
})