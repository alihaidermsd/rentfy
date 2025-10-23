import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple connection test
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: '✅ Database connected!',
      userCount: userCount,
      message: 'Neon.tech PostgreSQL is working correctly'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: '❌ Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}