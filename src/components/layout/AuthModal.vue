<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth-store'
import { authController } from '@/controllers/auth.controller'

const props = defineProps<{
  initialMode: 'login' | 'register'
  redirectTo?: RouteLocationRaw
}>()

const emit = defineEmits(['close'])

const auth = useAuthStore()
const router = useRouter()

const mode = ref<'login' | 'register'>(props.initialMode)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  errorMessage.value = null
  password.value = ''
  confirmPassword.value = ''
}

async function submit(): Promise<void> {
  errorMessage.value = null
  loading.value = true

  try {
    const form = {
      email: email.value,
      password: password.value,
      fullName: fullName.value,
      confirmPassword: confirmPassword.value,
    }

    if (mode.value === 'register') {
      const payload = authController.validateRegisterForm(form)
      await auth.register(payload)
    } else {
      const credentials = authController.validateLoginForm(form)
      await auth.login(credentials)
    }

    emit('close')
    await router.push(props.redirectTo ?? '/')
  } catch (e) {
    errorMessage.value = authController.toErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all">
    <div class="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex min-h-[600px]">
      <button
        type="button"
        class="absolute top-4 right-4 z-50 p-2 bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
        title="Cerrar"
        @click="$emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="hidden lg:flex lg:w-1/2 relative bg-[var(--color-doc-blue-700)] flex-col justify-center px-12">
        <div class="relative z-10 w-full max-w-lg mx-auto">
          <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            {{ mode === 'register' ? 'Únete a DocMeet hoy.' : 'Bienvenido de nuevo.' }}
          </h1>
          <p class="text-blue-100 text-lg leading-relaxed mb-12">
            {{ mode === 'register'
              ? 'Crea tu perfil en menos de 2 minutos y comienza a gestionar tus citas médicas con facilidad.'
              : 'Accede a tu cuenta para gestionar tus citas, ver tu historial y contactar a tus especialistas.' }}
          </p>
        </div>
      </div>

      <div class="w-full lg:w-1/2 relative flex items-center justify-center p-8 sm:p-12 overflow-y-auto max-h-[90vh]">
        <div class="w-full max-w-md relative z-10">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-[var(--color-doc-text-main)] mb-2">
              {{ mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión' }}
            </h2>
            <p class="text-[var(--color-doc-text-muted)]">
              {{ mode === 'register' ? 'Completa tus datos personales para acceder al portal' : 'Ingresa tus credenciales para continuar' }}
            </p>
          </div>

          <form @submit.prevent="submit" class="space-y-4">
            <div v-if="errorMessage" class="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
              {{ errorMessage }}
            </div>

            <div v-if="mode === 'register'">
              <label class="block text-sm font-semibold text-[var(--color-doc-text-main)] mb-1.5">Nombre completo</label>
              <input
                v-model="fullName"
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-[var(--color-doc-text-main)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-doc-blue-500)] focus:border-[var(--color-doc-blue-500)] transition-colors bg-white"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-[var(--color-doc-text-main)] mb-1.5">Correo electrónico</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="tu@correo.com"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-[var(--color-doc-text-main)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-doc-blue-500)] focus:border-[var(--color-doc-blue-500)] transition-colors bg-white"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-[var(--color-doc-text-main)] mb-1.5">Contraseña</label>
              <input
                v-model="password"
                type="password"
                required
                :minlength="mode === 'register' ? 6 : 1"
                placeholder="Mínimo 6 caracteres"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-[var(--color-doc-text-main)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-doc-blue-500)] focus:border-[var(--color-doc-blue-500)] transition-colors bg-white"
              />
            </div>

            <div v-if="mode === 'register'">
              <label class="block text-sm font-semibold text-[var(--color-doc-text-main)] mb-1.5">Confirmar contraseña</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Repite tu contraseña"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-[var(--color-doc-text-main)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-doc-blue-500)] focus:border-[var(--color-doc-blue-500)] transition-colors bg-white"
              />
            </div>

            <button
              type="submit"
              class="w-full mt-6 rounded-xl bg-[var(--color-doc-blue-700)] text-white py-3.5 font-semibold shadow-md hover:bg-blue-800 transition-all disabled:opacity-70 flex justify-center items-center"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Procesando...' : (mode === 'register' ? 'Registrarme como paciente' : 'Ingresar') }}</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p v-if="mode === 'register'" class="text-sm text-[var(--color-doc-text-muted)]">
              ¿Ya tienes una cuenta registrada?
              <button type="button" class="text-[var(--color-doc-blue-700)] font-semibold hover:underline ml-1" @click="switchMode('login')">
                Inicia sesión aquí
              </button>
            </p>
            <p v-else class="text-sm text-[var(--color-doc-text-muted)]">
              ¿Aún no tienes cuenta?
              <button type="button" class="text-[var(--color-doc-blue-700)] font-semibold hover:underline ml-1" @click="switchMode('register')">
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
