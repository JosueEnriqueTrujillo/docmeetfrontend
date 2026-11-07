<script setup lang="ts">
// 1. Subimos dos niveles (../../) para salir de 'layout' y 'components' e ingresar a 'store'
import { useAuthStore } from '../../store/auth-store'

// 2. Subimos dos niveles (../../) para ingresar a 'controllers'
import { authController } from '../../controllers/auth.controller'

const auth = useAuthStore()

function setRole(role: 'admin' | 'doctor' | 'paciente') {
  const names = {
    admin: 'Admin Supremo',
    doctor: 'Dr. Gregory House',
    paciente: 'Juan Pérez'
  }

  // Creamos el usuario simulado con el rol seleccionado
  const fakeUser = {
    id: Math.floor(Math.random() * 1000).toString(),
    fullName: names[role],
    email: `${role}@docmeet.com`,
    role: role
  }

  // Guardamos las credenciales directamente en el localStorage usando el controlador
  authController.applyDevSession('dev-fake-token-999', fakeUser as any)
  
  // Sincronizamos inmediatamente el estado de Pinia para que cambie la vista actual sin recargar
  auth.syncAuth()
}

function logout() {
  auth.logout()
}

const isDev = import.meta.env.DEV
</script>

<template>
  <div 
    v-if="isDev" 
    class="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-2 z-[9999] shadow-2xl border border-slate-700 transition-all hover:scale-105"
  >
    <span class="text-xs font-bold text-slate-300 pr-2 border-r border-slate-600 uppercase tracking-wider">
      Dev Tools
    </span>

    <button 
      @click="setRole('admin')" 
      class="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
    >
      Admin
    </button>

    <button 
      @click="setRole('doctor')" 
      class="bg-[var(--color-doc-teal-600)] hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
    >
      Médico
    </button>

    <button 
      @click="setRole('paciente')" 
      class="bg-[var(--color-doc-blue-600)] hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
    >
      Paciente
    </button>

    <button 
      @click="logout" 
      class="ml-2 bg-slate-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      title="Cerrar sesión"
    >
      Salir
    </button>
  </div>
</template>