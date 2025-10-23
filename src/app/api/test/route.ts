import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. First try a simple database query
    const dbTest = await prisma.$queryRaw`SELECT 1 as connection_test`
    
    // 2. Test database schema by checking tables
    const tables = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.service.count(),
      prisma.booking.count()
    ])
    
    // 3. Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'API is working correctly',
      database: {
        connection: 'Connected successfully',
        connectionTest: dbTest,
        tables: {
          users: tables[0],
          properties: tables[1],
          services: tables[2],
          bookings: tables[3]
        }
      },
      environment: envCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    
    // Provide more detailed error information
    return NextResponse.json({
      status: 'error',
      message: 'API test failed',
      error: {
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}