/**
 * Utility - Formatters
 */

import type { ReservationStatus } from '@/types'

export function formatReservationName(nom: string, prenom: string): string {
  return `${prenom} ${nom}`.trim()
}

export function getStatusColor(status: ReservationStatus): string {
  const colors: Record<ReservationStatus, string> = {
    'En attente': '#2563EB',    // Bleu
    'Confirmée': '#16A34A',     // Vert
    'Annulée': '#71717A',       // Gris
    'Terminée': '#1E3A8A',      // Bleu foncé
    'No-show': '#DC2626',       // Rouge
  }
  return colors[status] || '#6B7280'
}

export function getStatusBgColor(status: ReservationStatus): string {
  const colors: Record<ReservationStatus, string> = {
    'En attente': '#DBEAFE',    // Bleu light
    'Confirmée': '#DCFCE7',     // Vert light
    'Annulée': '#F3F4F6',       // Gris light
    'Terminée': '#E0E7FF',      // Bleu foncé light
    'No-show': '#FEE2E2',       // Rouge light
  }
  return colors[status] || '#F3F4F6'
}

export function getStatusIcon(status: ReservationStatus): string {
  const icons: Record<ReservationStatus, string> = {
    'En attente': '⏳',
    'Confirmée': '✓',
    'Annulée': '✕',
    'Terminée': '✔️',
    'No-show': '⚠️',
  }
  return icons[status] || '•'
}
