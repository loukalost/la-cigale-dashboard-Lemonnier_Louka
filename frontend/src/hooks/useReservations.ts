/**
 * Custom Hook - Fetch Réservations
 * Gère le chargement, filtrage, et cache des données
 */

import { useEffect, useState } from 'react'
import type { Reservation, ReservationFilters } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const CACHE_DURATION = 30000 // 30 secondes

interface CacheEntry {
  data: Reservation[]
  timestamp: number
}

const cache: Map<string, CacheEntry> = new Map()

export function useReservations(filters?: ReservationFilters) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query string
        const params = new URLSearchParams()
        if (filters?.dateStart) params.append('dateStart', filters.dateStart)
        if (filters?.dateEnd) params.append('dateEnd', filters.dateEnd)
        if (filters?.searchQuery) params.append('search', filters.searchQuery)
        if (filters?.statuses) {
          filters.statuses.forEach((s) => params.append('status', s))
        }

        const cacheKey = params.toString() || 'all'
        const cached = cache.get(cacheKey)

        // Return cached data if fresh
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setReservations(cached.data)
          setLoading(false)
          return
        }

        // Fetch from API
        const url = `${API_URL}/reservations?${params}`
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setReservations(data.data || [])
        cache.set(cacheKey, { data: data.data, timestamp: Date.now() })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        console.error('[useReservations] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [filters?.dateStart, filters?.dateEnd, filters?.searchQuery])

  return { reservations, loading, error }
}
