/**
 * Express Routes - Reservations API
 */

import { Router, Request, Response } from 'express'
import { reservationService } from '@/dal/index.js'
import type { ApiResponse, CreateReservationDTO, UpdateReservationDTO, Reservation } from '@/types'

const router = Router()

/**
 * GET /api/reservations
 * Retrieve all reservations (cached 30s)
 */
router.get('/reservations', async (_req: Request, res: Response) => {
  try {
    const reservations = await reservationService.getAll()
    const response: ApiResponse<Reservation[]> = {
      success: true,
      data: reservations,
      meta: {
        timestamp: new Date().toISOString(),
      },
    }
    res.json(response)
  } catch (err: any) {
    console.error('[GET /reservations]', err)
    const response: ApiResponse<null> = {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message },
    }
    res.status(500).json(response)
  }
})

/**
 * GET /api/reservations/:id
 * Retrieve single reservation
 */
router.get('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const reservation = await reservationService.getById(id)

    if (!reservation) {
      const response: ApiResponse<null> = {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Reservation not found' },
      }
      return res.status(404).json(response)
    }

    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      meta: { timestamp: new Date().toISOString() },
    }
    res.json(response)
  } catch (err: any) {
    console.error('[GET /reservations/:id]', err)
    const response: ApiResponse<null> = {
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message },
    }
    res.status(500).json(response)
  }
})

/**
 * POST /api/reservations
 * Create new reservation
 */
router.post('/reservations', async (req: Request, res: Response) => {
  try {
    const dto: CreateReservationDTO = req.body

    // Validation
    if (!dto.nomComplet || !dto.prenom || !dto.date || !dto.heure || !dto.nbPersonnes) {
      const response: ApiResponse<null> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
      }
      return res.status(400).json(response)
    }

    const reservation = await reservationService.create(dto)
    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      meta: { timestamp: new Date().toISOString() },
    }
    res.status(201).json(response)
  } catch (err: any) {
    console.error('[POST /reservations]', err)
    const response: ApiResponse<null> = {
      success: false,
      error: { code: 'CREATE_ERROR', message: err.message },
    }
    res.status(400).json(response)
  }
})

/**
 * PATCH /api/reservations/:id
 * Update reservation
 */
router.patch('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const dto: UpdateReservationDTO = req.body

    const reservation = await reservationService.update(id, dto)
    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      meta: { timestamp: new Date().toISOString() },
    }
    res.json(response)
  } catch (err: any) {
    console.error('[PATCH /reservations/:id]', err)
    const response: ApiResponse<null> = {
      success: false,
      error: { code: 'UPDATE_ERROR', message: err.message },
    }
    res.status(400).json(response)
  }
})

/**
 * DELETE /api/reservations/:id
 * Delete (soft) reservation
 */
router.delete('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await reservationService.delete(id)

    const response: ApiResponse<null> = {
      success: true,
      meta: { timestamp: new Date().toISOString() },
    }
    res.json(response)
  } catch (err: any) {
    console.error('[DELETE /reservations/:id]', err)
    const response: ApiResponse<null> = {
      success: false,
      error: { code: 'DELETE_ERROR', message: err.message },
    }
    res.status(400).json(response)
  }
})

export { router }
