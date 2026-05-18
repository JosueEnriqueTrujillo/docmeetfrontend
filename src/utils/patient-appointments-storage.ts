import type { CalendarAppointment } from '@/types/calendar-appointment'
import { formatDateStr } from '@/utils/appointment-datetime'

const STORAGE_KEY = 'docmeet_patient_appointments'

function defaultAppointments(): CalendarAppointment[] {
  const today = new Date()
  const todayStr = formatDateStr(today)
  const tomorrowStr = formatDateStr(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  )
  const nextWeekStr = formatDateStr(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
  )

  return [
    {
      id: 'seed-1',
      date: todayStr,
      time: '10:00 AM',
      doctorId: '1',
      doctor: 'Dr. Carlos Mendoza',
      specialty: 'Cardiología',
      type: 'Presencial',
      status: 'confirmed',
    },
    {
      id: 'seed-2',
      date: todayStr,
      time: '03:30 PM',
      doctorId: '2',
      doctor: 'Dra. Laura Ríos',
      specialty: 'Pediatría',
      type: 'Videollamada',
      status: 'pending',
    },
    {
      id: 'seed-3',
      date: tomorrowStr,
      time: '09:15 AM',
      doctorId: '3',
      doctor: 'Dr. Jorge Silva',
      specialty: 'Dermatología',
      type: 'Presencial',
      status: 'confirmed',
    },
    {
      id: 'seed-4',
      date: nextWeekStr,
      time: '11:00 AM',
      doctorId: '4',
      doctor: 'Dra. Ana Torres',
      specialty: 'Neurología',
      type: 'Presencial',
      status: 'confirmed',
    },
  ]
}

export function loadPatientAppointments(): CalendarAppointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAppointments()
    const parsed = JSON.parse(raw) as CalendarAppointment[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAppointments()
  } catch {
    return defaultAppointments()
  }
}

export function savePatientAppointments(appointments: CalendarAppointment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
}
