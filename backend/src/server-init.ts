/**
 * Backend - Server Entry Point
 * Starts Express app on configured port
 */

import 'dotenv/config'
import { app } from './app'
import { config } from './server'

const PORT = Number(config.port)

app.listen(PORT, () => {
  console.log(
    `✓ La Cigale CRM Backend running on http://localhost:${PORT}`
  )
  console.log(`✓ CORS origin: ${config.corsOrigin}`)
  console.log(`✓ NODE_ENV: ${config.nodeEnv}`)
  console.log('')
  console.log('Endpoints:')
  console.log(`  GET  /health`)
  console.log(`  GET  /api/reservations`)
  console.log(`  POST /api/reservations`)
  console.log(`  PATCH /api/reservations/:id`)
  console.log(`  DELETE /api/reservations/:id`)
  console.log('')
  console.log('Next steps (Story 5-6):')
  console.log('  1. Implement DAL ReservationService')
  console.log('  2. Connect Airtable API')
  console.log('  3. Wire routes to DAL')
})
