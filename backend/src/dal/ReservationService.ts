/**
 * Reservation Service (DAL)
 * High-level business logic with caching & retry
 */

import { AirtableClient } from './AirtableClient.js'
import type { Reservation, CreateReservationDTO, UpdateReservationDTO } from '@/types'

const CACHE_DURATION = 30000 // 30 seconds

interface CacheEntry {
  data: Reservation[]
  timestamp: number
}

export class ReservationService {
  private client: AirtableClient
  private cache: Map<string, CacheEntry>

  constructor() {
    this.client = new AirtableClient()
    this.cache = new Map()
  }

  /**
   * Get all reservations (with cache)
   */
  async getAll(): Promise<Reservation[]> {
    const cacheKey = 'all'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[ReservationService] Cache hit for getAll()')
      return cached.data
    }

    console.log('[ReservationService] Cache miss for getAll(), fetching from Airtable')
    const records = await this.client.getAllRecords()
    const reservations = records.map((r) => AirtableClient.mapToReservation(r))

    this.cache.set(cacheKey, { data: reservations, timestamp: Date.now() })
    return reservations
  }

  /**
   * Get single reservation by ID
   */
  async getById(id: string): Promise<Reservation | null> {
    const record = await this.client.getRecord(id)
    if (!record) return null
    return AirtableClient.mapToReservation(record)
  }

  /**
   * Create new reservation
   */
  async create(dto: CreateReservationDTO): Promise<Reservation> {
    // Validation
    if (!dto.nomComplet || !dto.prenom || !dto.date || !dto.heure || !dto.nbPersonnes) {
      throw new Error('Missing required fields')
    }

    if (dto.nbPersonnes < 1 || dto.nbPersonnes > 12) {
      throw new Error('Invalid number of persons (1-12)')
    }

    // Create in Airtable
    const fields = AirtableClient.mapFromReservation({ ...dto, statut: 'En attente' })
    const record = await this.client.createRecord(fields)
    const reservation = AirtableClient.mapToReservation(record)

    // Invalidate cache
    this.cache.delete('all')

    return reservation
  }

  /**
   * Update reservation
   */
  async update(id: string, dto: UpdateReservationDTO): Promise<Reservation> {
    // Fetch existing
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Reservation not found')
    }

    // Merge updates
    const merged = { ...existing, ...dto }

    // Update in Airtable
    const fields = AirtableClient.mapFromReservation(merged)
    const record = await this.client.updateRecord(id, fields)
    const reservation = AirtableClient.mapToReservation(record)

    // Invalidate cache
    this.cache.delete('all')

    return reservation
  }

  /**
   * Delete reservation (soft by default: mark Annulée)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error('Reservation not found')
    }

    // Soft delete: mark as "Annulée"
    await this.client.updateRecord(id, { 'Statut': 'Annulée' })

    // Invalidate cache
    this.cache.delete('all')
  }

  /**
   * Clear cache (useful after batch operations)
   */
  clearCache(): void {
    this.cache.clear()
    console.log('[ReservationService] Cache cleared')
  }
}

export const reservationService = new ReservationService()
