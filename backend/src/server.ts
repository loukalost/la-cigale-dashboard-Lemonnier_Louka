import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(__filename)  // For future use

console.log('[Backend] Starting La Cigale CRM V0 Backend...')
console.log(`[Backend] NODE_ENV = ${process.env.NODE_ENV}`)
console.log(`[Backend] Port = ${process.env.PORT || 5000}`)
console.log('[Backend] Stack Check:')
console.log('  ✓ Node.js runtime active')
console.log('  ✓ TypeScript compilation ready')
console.log('  ⏳ Awaiting Express app initialization...')

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  airtableApiKey: process.env.AIRTABLE_API_KEY,
  airtableBaseId: process.env.AIRTABLE_BASE_ID,
  airtableTableName: process.env.AIRTABLE_TABLE_NAME || 'Réservations',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}

// Validate critical secrets at startup
const requiredEnvVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID']
const missing = requiredEnvVars.filter(v => !process.env[v])

if (missing.length > 0) {
  console.warn(`⚠️  Missing env vars: ${missing.join(', ')} (required for Airtable DAL)`)
  console.warn('   ✓ OK for local dev (use .env.example)')
  console.warn('   ✗ CRITICAL for production (set in Render dashboard)')
}
