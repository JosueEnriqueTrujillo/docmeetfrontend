export type CalendarAppointmentType = 'Presencial' | 'Videollamada'
export type CalendarAppointmentStatus = 'confirmed' | 'pending' | 'cancelled'

export interface CalendarAppointment {
  id: string
  date: string
  time: string
  doctorId: string
  doctor: string
  specialty: string
  type: CalendarAppointmentType
  status: CalendarAppointmentStatus
  notes?: string
}
