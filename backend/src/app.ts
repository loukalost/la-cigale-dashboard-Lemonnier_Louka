/**
 * Backend - Express App Setup
 */

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { config } from './server'
import { router as reservationRoutes } from './routes/index'
import type { ApiResponse } from './types'

const app = express()

/**
 * Middleware Stack
 */

// CORS
app.use(cors({ origin: config.corsOrigin }))

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * Request logging (basic)
 */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${_req.method}] ${_req.path}`)
  next()
})

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

/**
 * API Routes
 */
app.use('/api', reservationRoutes)

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  }
  res.status(404).json(response)
})

/**
 * Error handler
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err)
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message || 'Internal server error',
    },
  }
  res.status(err.status || 500).json(response)
})

export { app }
