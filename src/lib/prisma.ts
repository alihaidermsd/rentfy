import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load .env early and log diagnostics
const envPath = path.join(process.cwd(), '.env')
const envExists = fs.existsSync(envPath)

console.log(`🔍 ENV Debug:`)
console.log(`- .env exists: ${envExists}`)
console.log(`- Current directory: ${process.cwd()}`)

if (envExists) {
  const result = dotenv.config({ path: envPath })
  if (result.error) {
    console.warn('❌ dotenv error:', result.error)
  } else {
    console.log('✅ dotenv loaded keys:', Object.keys(result.parsed || {}))
  }
} else {
  console.warn('⚠️  .env file not found')
}

// FALLBACK VALUES - CRITICAL FIX
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rentfy?schema=public'
const JWT_SECRET = process.env.JWT_SECRET || '629da79976094da95bf2522a099b2e157e531b0ccc6d575269c489e60b602ce9'

console.log('🔧 Using:')
console.log(`- DATABASE_URL: ${DATABASE_URL ? 'SET' : 'NOT SET'}`)
console.log(`- JWT_SECRET: ${JWT_SECRET ? `SET (${JWT_SECRET.length} chars)` : 'NOT SET'}`)

import { PrismaClient } from '@prisma/client'

// Define global type for PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

// Custom error class for database errors
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Initialize Prisma Client with logging and error formatting
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    },
    log: [
      'error',
      'warn',
      { emit: 'stdout', level: 'query' }
    ],
    errorFormat: 'pretty',
  })
}

// Export prisma instance using globalThis for hot reloading in development
export const prisma = globalThis.prisma ?? prismaClientSingleton()

// Save the instance in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Initialize database connection
async function initDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Verify connection with a simple query
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database query successful')

  } catch (error) {
    console.error('❌ Database error details:', error)
    
    // Type guard for Error objects
    if (error instanceof Error) {
      throw new DatabaseError(
        'Database connection failed',
        'CONNECTION_ERROR',
        error.message
      )
    }
    
    throw new DatabaseError(
      'Database connection failed: Unknown error',
      'UNKNOWN',
      String(error)
    )
  }
}

// Initialize database connection
initDatabase().catch((error: Error) => {
  console.error('❌ Database initialization failed:', error instanceof DatabaseError ? error : error.message)
  // Don't exit in development - allow fallback to work
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})