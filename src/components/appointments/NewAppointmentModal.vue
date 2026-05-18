<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { IDoctorListItem } from '@/controllers/doctor.controller'
import type { CalendarAppointment, CalendarAppointmentType } from '@/types/calendar-appointment'
import {
  TIME_SLOTS,
  formatDateStr,
  isSlotInPast,
  isWeekend,
} from '@/utils/appointment-datetime'

export interface NewAppointmentFormData {
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  type: CalendarAppointmentType
  notes: string
}

const props = defineProps<{
  doctors: IDoctorListItem[]
  selectedDate: Date
  initialDoctorId?: string
  existingAppointments: CalendarAppointment[]
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: NewAppointmentFormData]
}>()

const open = defineModel<boolean>('open', { required: true })

const doctorId = ref('')
const appointmentDate = ref('')
const selectedTime = ref('')
const appointmentType = ref<CalendarAppointmentType>('Presencial')
const notes = ref('')
const formError = ref<string | null>(null)

const todayStr = formatDateStr(new Date())

const selectedDoctor = computed(() =>
  props.doctors.find((d) => d.id === doctorId.value),
)

const availableSlots = computed(() => {
  return TIME_SLOTS.map((slot) => {
    const taken = props.existingAppointments.some(
      (a) =>
        a.doctorId === doctorId.value &&
        a.date === appointmentDate.value &&
        a.time === slot &&
        a.status !== 'cancelled',
    )
    const past = isSlotInPast(appointmentDate.value, slot)
    const weekend = isWeekend(appointmentDate.value)
    return {
      slot,
      disabled: taken || past || weekend,
      reason: taken ? 'Ocupado' : past ? 'Pasado' : weekend ? 'No disponible' : null,
    }
  })
})

function resetForm(): void {
  doctorId.value = props.initialDoctorId ?? ''
  appointmentDate.value = formatDateStr(props.selectedDate)
  selectedTime.value = ''
  appointmentType.value = 'Presencial'
  notes.value = ''
  formError.value = null
}

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

watch(
  () => props.selectedDate,
  () => {
    if (open.value) {
      appointmentDate.value = formatDateStr(props.selectedDate)
      selectedTime.value = ''
    }
  },
)

watch([doctorId, appointmentDate], () => {
  selectedTime.value = ''
  formError.value = null
})

function close(): void {
  open.value = false
  emit('close')
}

function submit(): void {
  formError.value = null

  if (!doctorId.value) {
    formError.value = 'Selecciona un especialista.'
    return
  }
  if (!appointmentDate.value) {
    formError.value = 'Selecciona una fecha.'
    return
  }
  if (appointmentDate.value < todayStr) {
    formError.value = 'No puedes agendar citas en fechas pasadas.'
    return
  }
  if (isWeekend(appointmentDate.value)) {
    formError.value = 'No hay atención los fines de semana. Elige un día entre lunes y viernes.'
    return
  }
  if (!selectedTime.value) {
    formError.value = 'Selecciona un horario disponible.'
    return
  }
  if (isSlotInPast(appointmentDate.value, selectedTime.value)) {
    formError.value = 'Ese horario ya pasó. Elige otro.'
    return
  }

  const doctor = selectedDoctor.value
  if (!doctor) {
    formError.value = 'El especialista seleccionado no es válido.'
    return
  }

  emit('submit', {
    doctorId: doctor.id,
    doctorName: doctor.fullName,
    specialty: doctor.specialty,
    date: appointmentDate.value,
    time: selectedTime.value,
    type: appointmentType.value,
    notes: notes.value.trim(),
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-hidden="true"
        @click="close"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-appointment-title"
        class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
      >
        <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl">
          <div>
            <h2 id="new-appointment-title" class="text-xl font-bold text-slate-900">Nueva cita</h2>
            <p class="text-sm text-slate-500 mt-0.5">Completa los datos para agendar tu consulta</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cerrar"
            @click="close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="p-6 space-y-5" @submit.prevent="submit">
          <div v-if="formError" class="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-200">
            {{ formError }}
          </div>

          <div>
            <label for="appointment-doctor" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Especialista <span class="text-red-500">*</span>
            </label>
            <select
              id="appointment-doctor"
              v-model="doctorId"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Selecciona un médico</option>
              <option v-for="d in doctors" :key="d.id" :value="d.id">
                {{ d.fullName }} — {{ d.specialty }}
              </option>
            </select>
          </div>

          <div v-if="selectedDoctor" class="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <img
              :src="selectedDoctor.avatar"
              :alt="selectedDoctor.fullName"
              class="w-12 h-12 rounded-full object-cover ring-2 ring-white"
            />
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ selectedDoctor.fullName }}</p>
              <p class="text-xs text-blue-700 font-medium">{{ selectedDoctor.specialty }}</p>
            </div>
          </div>

          <div>
            <label for="appointment-date" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Fecha <span class="text-red-500">*</span>
            </label>
            <input
              id="appointment-date"
              v-model="appointmentDate"
              type="date"
              required
              :min="todayStr"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="isWeekend(appointmentDate)" class="text-xs text-amber-600 mt-1.5 font-medium">
              Los fines de semana no tienen horarios disponibles.
            </p>
          </div>

          <div>
            <p class="block text-sm font-semibold text-slate-700 mb-2">
              Horario <span class="text-red-500">*</span>
            </p>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              <button
                v-for="{ slot, disabled, reason } in availableSlots"
                :key="slot"
                type="button"
                :disabled="disabled"
                :title="reason ?? undefined"
                class="px-2 py-2 text-xs font-semibold rounded-lg border transition-all"
                :class="[
                  selectedTime === slot
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : disabled
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50',
                ]"
                @click="selectedTime = slot"
              >
                {{ slot }}
              </button>
            </div>
            <p v-if="doctorId && availableSlots.every((s) => s.disabled)" class="text-xs text-slate-500 mt-2">
              No hay horarios libres este día. Prueba otra fecha.
            </p>
          </div>

          <div>
            <p class="block text-sm font-semibold text-slate-700 mb-2">Tipo de consulta</p>
            <div class="flex gap-3">
              <label
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold"
                :class="appointmentType === 'Presencial' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
              >
                <input v-model="appointmentType" type="radio" value="Presencial" class="sr-only" />
                Presencial
              </label>
              <label
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold"
                :class="appointmentType === 'Videollamada' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
              >
                <input v-model="appointmentType" type="radio" value="Videollamada" class="sr-only" />
                Videollamada
              </label>
            </div>
          </div>

          <div>
            <label for="appointment-notes" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Motivo de consulta <span class="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="appointment-notes"
              v-model="notes"
              rows="3"
              maxlength="500"
              placeholder="Ej. Control de rutina, síntomas, seguimiento…"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              :disabled="loading"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <svg
                v-if="loading"
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ loading ? 'Agendando…' : 'Confirmar cita' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
