/**
 * Custom Hook - Mutations Réservations
 * Gère create, update, delete avec feedback utilisateur
 */

import { useState } from 'react'
import type { CreateReservationDTO, UpdateReservationDTO, Reservation } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface UseMutationState {
  loading: boolean
  error: Error | null
  success: boolean
}

export function useCreateReservation() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
    success: false,
  })

  const mutate = async (dto: CreateReservationDTO): Promise<Reservation | null> => {
    try {
      setState({ loading: true, error: null, success: false })

      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to create')
      }

      const data = await response.json()
      setState({ loading: false, error: null, success: true })
      return data.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ loading: false, error, success: false })
      return null
    }
  }

  return { ...state, mutate }
}

export function useUpdateReservation() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
    success: false,
  })

  const mutate = async (id: string, dto: UpdateReservationDTO): Promise<Reservation | null> => {
    try {
      setState({ loading: true, error: null, success: false })

      const response = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setState({ loading: false, error: null, success: true })
      return data.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ loading: false, error, success: false })
      return null
    }
  }

  return { ...state, mutate }
}

export function useDeleteReservation() {
  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
    success: false,
  })

  const mutate = async (id: string): Promise<boolean> => {
    try {
      setState({ loading: true, error: null, success: false })

      const response = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setState({ loading: false, error: null, success: true })
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ loading: false, error, success: false })
      return false
    }
  }

  return { ...state, mutate }
}
