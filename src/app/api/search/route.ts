import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const city = searchParams.get('city') || ''
    const propertyType = searchParams.get('propertyType')
    const serviceCategory = searchParams.get('serviceCategory')
    const maxPrice = searchParams.get('maxPrice')

    console.log('Search API called with:', { query, city, propertyType, serviceCategory, maxPrice })

    // Search properties
    const propertyFilters: any = {
      where: {
        isAvailable: true
      }
    }

    if (query) {
      propertyFilters.where.OR = [
        { title: { contains: query, mode: 'insensitive' } }, // ✅ PostgreSQL supports insensitive
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (city) {
      propertyFilters.where.city = { contains: city, mode: 'insensitive' } // ✅ PostgreSQL supports insensitive
    }

    if (propertyType) {
      propertyFilters.where.type = propertyType
    }

    if (maxPrice) {
      propertyFilters.where.price = {
        lte: parseFloat(maxPrice)
      }
    }

    console.log('Fetching properties with filters...')
    const properties = await prisma.property.findMany({
      ...propertyFilters,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })
    console.log(`Found ${properties.length} properties`)

    // Search services
    const serviceFilters: any = {
      where: {
        isAvailable: true
      }
    }

    if (query) {
      serviceFilters.where.OR = [
        { name: { contains: query, mode: 'insensitive' } }, // ✅ PostgreSQL supports insensitive
        { description: { contains: query, mode: 'insensitive' } },
        { providerName: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (city) {
      serviceFilters.where.locations = {
        has: city
      }
    }

    if (serviceCategory) {
      serviceFilters.where.category = serviceCategory
    }

    if (maxPrice) {
      serviceFilters.where.basePrice = {
        lte: parseFloat(maxPrice)
      }
    }

    console.log('Fetching services with filters...')
    const services = await prisma.service.findMany(serviceFilters)
    console.log(`Found ${services.length} services`)

    return NextResponse.json({
      properties,
      services,
      totalResults: properties.length + services.length,
      propertyCount: properties.length,
      serviceCount: services.length,
      searchParams: { query, city, propertyType, serviceCategory, maxPrice } // Helpful for debugging
    })

  } catch (error) {
    console.error('Search error details:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check if services have array locations and properties have correct fields'
      },
      { status: 500 }
    )
  }
}