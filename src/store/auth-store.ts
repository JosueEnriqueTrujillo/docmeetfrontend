import type {
  ILoginCredentials,
  IRegisterPayload,
  IUpdateProfilePayload,
  IUser,
} from '@/types'

// Nombres de las llaves en localStorage
const USERS_DB_KEY = 'docmeet_users_db'
const TOKEN_KEY = 'docmeet_auth_token'
const USER_SESSION_KEY = 'docmeet_user_session'

// Funciones auxiliares privadas para leer/escribir la "Base de Datos" local
const getUsersDB = (): any[] => JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]')
const saveUsersDB = (users: any[]): void => localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))

export const authController = {
  readSession() {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_SESSION_KEY)
    return {
      token: token || null,
      user: userStr ? JSON.parse(userStr) as IUser : null,
    }
  },

  isAdmin(user: IUser | null | undefined): boolean {
    // Asumiendo que tu interfaz IUser tiene una propiedad 'role'
    return user?.role === 'admin'
  },

  applyDevSession(token: string, user: IUser): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))
  },

  async login(credentials: ILoginCredentials): Promise<{ token: string; user: IUser }> {
    // Simulamos el tiempo de espera de una petición HTTP
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const users = getUsersDB()
    // Asumiendo que ILoginCredentials usa email y password
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password)

    if (!user) {
      throw new Error('Credenciales incorrectas o usuario no encontrado.')
    }

    // Quitamos la contraseña antes de guardar en la sesión por seguridad
    const { password, ...safeUser } = user
    const token = `mock-jwt-token-${Date.now()}` // Simulamos un JWT

    this.applyDevSession(token, safeUser as IUser)
    return { token, user: safeUser as IUser }
  },

  async register(payload: IRegisterPayload): Promise<{ token: string; user: IUser }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const users = getUsersDB()
    if (users.some(u => u.email === payload.email)) {
      throw new Error('Este correo ya está registrado.')
    }

    // Creamos el nuevo usuario. (Ajusta los campos según tu IRegisterPayload)
    const newUser = {
      id: `usr-${Date.now()}`,
      ...payload,
      role: 'patient', // Rol por defecto
    }

    users.push(newUser)
    saveUsersDB(users)

    // Autologueamos al usuario recién creado
    const { password, ...safeUser } = newUser
    const token = `mock-jwt-token-${Date.now()}`

    this.applyDevSession(token, safeUser as IUser)
    return { token, user: safeUser as IUser }
  },

  async updateProfile(payload: IUpdateProfilePayload): Promise<IUser> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const { user } = this.readSession()
    
    if (!user) throw new Error('No hay sesión activa.')

    const updatedUser = { ...user, ...payload }
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser))
    
    // Opcional: Actualizar también en el USERS_DB_KEY si lo deseas

    return updatedUser as IUser
  },

  async fetchProfile(): Promise<IUser | null> {
    const { user } = this.readSession()
    return user
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_SESSION_KEY)
  },

  syncFromStorage() {
    return this.readSession()
  },
}