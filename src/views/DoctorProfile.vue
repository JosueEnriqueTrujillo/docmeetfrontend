<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/auth-store'
import AuthModal from '@/components/layout/AuthModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)

const showAuthModal = ref(false)

const loading = ref(true)
const doctor = ref<any>(null)

// Datos simulados de reseñas
const reviews = [
  { id: 1, author: 'María C.', date: 'Hace 2 semanas', rating: 5, comment: 'Excelente atención. El doctor fue muy paciente y me explicó todo con mucho detalle.' },
  { id: 2, author: 'Juan P.', date: 'Hace 1 mes', rating: 5, comment: 'Muy profesional. Las instalaciones están impecables y no tuve que esperar casi nada.' },
  { id: 3, author: 'Elena R.', date: 'Hace 2 meses', rating: 4, comment: 'Buen trato y diagnóstico acertado, aunque la cita empezó 10 minutos tarde.' }
]

async function loadDoctor() {
  loading.value = true
  const doctorId = Number(route.params.id)
  
  // Simulamos carga
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Datos simulados (en el futuro esto vendrá de tu API con getDoctorById)
  doctor.value = {
    id: doctorId,
    fullName: doctorId === 2 ? 'Dra. Laura Ríos' : 'Dr. Carlos Mendoza', // Lógica temporal
    specialty: doctorId === 2 ? 'Pediatría' : 'Cardiología',
    bio: 'Especialista con más de 15 años de experiencia brindando atención de alta calidad. Graduado con honores de la Universidad Nacional y con especialización en el extranjero. Comprometido con el bienestar integral de sus pacientes.',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${doctorId === 2 ? 'Laura Ríos' : 'Carlos Mendoza'}&backgroundColor=0369a1,0ea5e9&textColor=ffffff`,
    experience: '15 años',
    patients: '+2,000',
    rating: 4.9,
    price: '$50.00'
  }
  
  loading.value = false
}

const appointmentsRoute = computed(() => ({
  name: 'appointments' as const,
  query: { doctorId: String(route.params.id) },
}))

function scheduleAppointment(): void {
  if (isAuthenticated.value) {
    void router.push(appointmentsRoute.value)
    return
  }
  showAuthModal.value = true
}

onMounted(() => {
  loadDoctor()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    
    <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-[var(--color-doc-blue-600)] transition-colors mb-6 font-medium text-sm">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Volver al directorio
    </button>

    <div v-if="loading" class="animate-pulse space-y-8">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-6">
        <div class="w-24 h-24 bg-slate-200 rounded-full"></div>
        <div class="flex-1 space-y-4 py-2">
          <div class="h-6 bg-slate-200 rounded w-1/3"></div>
          <div class="h-4 bg-slate-100 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <div v-else-if="doctor" class="space-y-6">
      <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 sm:items-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
        
        <img :src="doctor.avatar" :alt="doctor.fullName" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-md border-4 border-white object-cover" />
        
        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ doctor.fullName }}</h1>
              <p class="text-[var(--color-doc-blue-600)] font-semibold text-lg mt-1">{{ doctor.specialty }}</p>
            </div>
            <button
              type="button"
              class="w-full sm:w-auto px-6 py-3 bg-[var(--color-doc-blue-600)] hover:bg-[var(--color-doc-blue-700)] text-white rounded-xl font-semibold shadow-md transition-all"
              @click="scheduleAppointment"
            >
              Agendar Cita
            </button>
          </div>

          <div class="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100">
            <div class="flex flex-col">
              <span class="text-slate-500 text-sm">Experiencia</span>
              <span class="font-bold text-slate-800">{{ doctor.experience }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500 text-sm">Pacientes</span>
              <span class="font-bold text-slate-800">{{ doctor.patients }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500 text-sm">Calificación</span>
              <div class="flex items-center gap-1">
                <span class="font-bold text-slate-800">{{ doctor.rating }}</span>
                <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-500 text-sm">Consulta desde</span>
              <span class="font-bold text-green-600">{{ doctor.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Sobre el especialista</h2>
            <p class="text-slate-600 leading-relaxed">{{ doctor.bio }}</p>
          </div>

          <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Referencias de pacientes</h2>
            <div class="space-y-6">
              <div v-for="review in reviews" :key="review.id" class="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {{ review.author.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="font-semibold text-slate-800 text-sm">{{ review.author }}</h4>
                      <p class="text-xs text-slate-400">{{ review.date }}</p>
                    </div>
                  </div>
                  <div class="flex text-amber-400">
                    <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                </div>
                <p class="text-slate-600 text-sm italic">"{{ review.comment }}"</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 class="font-bold text-slate-900 mb-4">Ubicación del consultorio</h3>
            <div class="flex items-start gap-3 text-sm text-slate-600 mb-4">
              <svg class="w-5 h-5 text-[var(--color-doc-blue-500)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Av. Principal 123, Piso 4, Consultorio 402. Centro Médico DocMeet.</p>
            </div>
            <div class="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
               [Mapa de ubicación]
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <AuthModal
      v-if="showAuthModal"
      initial-mode="login"
      :redirect-to="appointmentsRoute"
      @close="showAuthModal = false"
    />
  </Teleport>
</template>