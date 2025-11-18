import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test PostgreSQL connection
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`
    
    const propertiesCount = await prisma.property.count()
    const usersCount = await prisma.user.count()

    return NextResponse.json({
      message: '✅ Neon.tech PostgreSQL is working!',
      database: dbInfo,
      stats: {
        properties: propertiesCount,
        users: usersCount,
      },
      features: {
        connection: '✅ Healthy',
        prismaClient: '✅ Operational',
      },
    })

  } catch (error) {
    return NextResponse.json({
      error: '❌ Neon.tech connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      tip: 'Check your DATABASE_URL in .env file'
    }, { status: 500 })
  }
}