/** Formato YYYY-MM-DD */
export function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]

/** Minutos desde medianoche (0–1439) a partir de "10:00 AM". */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export function buildStartsAtIso(dateStr: string, time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return new Date(`${dateStr}T09:00:00`).toISOString()
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString()
}

export function isSlotInPast(dateStr: string, time: string): boolean {
  const slotDate = new Date(buildStartsAtIso(dateStr, time))
  return slotDate.getTime() < Date.now()
}

export function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay()
  return day === 0 || day === 6
}
