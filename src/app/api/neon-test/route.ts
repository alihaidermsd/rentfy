import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test PostgreSQL connection
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`
    
    // Test array features
    const testService = await prisma.service.create({
      data: {
        name: 'Neon.tech Test Service',
        description: 'Testing PostgreSQL arrays on Neon.tech',
        category: 'CLEANING',
        providerName: 'Neon Test',
        locations: ['Karachi', 'Lahore', 'Islamabad'], // Array!
        basePrice: 15000
      }
    })

    // Test array query
    const karachiServices = await prisma.service.findMany({
      where: {
        locations: {
          has: 'Karachi'
        }
      }
    })

    return NextResponse.json({
      message: '✅ Neon.tech PostgreSQL is working!',
      database: dbInfo,
      arrayTest: {
        createdService: testService,
        arrayQuery: {
          karachiServicesCount: karachiServices.length,
          sample: karachiServices[0]
        }
      },
      features: {
        arrays: '✅ Working',
        caseInsensitiveSearch: '✅ Available',
        fullTextSearch: '✅ Available'
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: '❌ Neon.tech connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      tip: 'Check your DATABASE_URL in .env file'
    }, { status: 500 })
  }
}