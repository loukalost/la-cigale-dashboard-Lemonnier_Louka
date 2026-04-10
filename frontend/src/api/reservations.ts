/**
 * API Client - Reservations
 * Centralized fetch calls
 */

import type { CreateReservationDTO, UpdateReservationDTO, Reservation } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchReservations(query?: Record<string, any>) {
  const params = new URLSearchParams()
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
  }

  const response = await fetch(`${API_BASE}/reservations?${params}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function createReservation(dto: CreateReservationDTO) {
  const response = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function updateReservation(id: string, dto: UpdateReservationDTO) {
  const response = await fetch(`${API_BASE}/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function deleteReservation(id: string) {
  const response = await fetch(`${API_BASE}/reservations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
