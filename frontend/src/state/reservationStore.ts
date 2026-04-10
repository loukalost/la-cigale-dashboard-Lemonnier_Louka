/**
 * Zustand Store - Réservations
 * Gestion d'état centralisée pour les réservations
 */

import { create } from 'zustand'
import type { Reservation, ReservationFilters, ReservationUIState } from '@/types'

interface ReservationStore {
  // Data
  reservations: Reservation[]
  selectedReservation: Reservation | null
  
  // UI State
  uiState: ReservationUIState
  filters: ReservationFilters
  
  // Actions
  setReservations: (reservations: Reservation[]) => void
  setSelectedReservation: (reservation: Reservation | null) => void
  setUIState: (state: ReservationUIState) => void
  setFilters: (filters: ReservationFilters) => void
  
  // Mutations (optimistic updates)
  addReservation: (reservation: Reservation) => void
  updateReservation: (id: string, updated: Partial<Reservation>) => void
  deleteReservation: (id: string) => void
}

export const useReservationStore = create<ReservationStore>((set) => ({
  reservations: [],
  selectedReservation: null,
  uiState: 'idle',
  filters: {},
  
  setReservations: (reservations) => set({ reservations }),
  setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),
  setUIState: (uiState) => set({ uiState }),
  setFilters: (filters) => set({ filters }),
  
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [reservation, ...state.reservations],
    })),
  
  updateReservation: (id, updated) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...updated } : r
      ),
    })),
  
  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
}))
