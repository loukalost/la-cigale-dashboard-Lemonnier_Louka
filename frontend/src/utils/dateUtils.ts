/**
 * Utility - Date/Time
 */

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR')
}

export function formatDateWithDay(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function isToday(isoDate: string): boolean {
  const date = new Date(isoDate)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isFutures(isoDate: string): boolean {
  const date = new Date(isoDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

/**
 * Valid time slots per PRD 4.1
 * Midi: 11h30-14h30
 * Soir: 19h00-22h30
 */
export const VALID_TIME_SLOTS = [
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
]

export function isValidTimeSlot(time: string): boolean {
  return VALID_TIME_SLOTS.includes(time)
}

/**
 * Public holiday etc (V1+)
 */
export function isBusinessDay(isoDate: string): boolean {
  const date = new Date(isoDate)
  const day = date.getDay()
  // 0 = Sunday, 6 = Saturday
  return day !== 0 && day !== 6
}
