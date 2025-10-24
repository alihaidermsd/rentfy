import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Search parameters
    const query = searchParams.get('q') || ''
    const city = searchParams.get('city') || ''
    const propertyType = searchParams.get('propertyType')
    const maxPrice = searchParams.get('maxPrice')
    const minBedrooms = searchParams.get('minBedrooms')
    const minBathrooms = searchParams.get('minBathrooms')
    const maxGuests = searchParams.get('maxGuests')
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit between 1-50' },
        { status: 400 }
      )
    }

    console.log('🔍 Search API called with:', { 
      query, city, propertyType, maxPrice, minBedrooms, minBathrooms, maxGuests,
      page, limit 
    })

    // Build property filters based on new schema
    const propertyFilters: any = {
      where: {
        isDeleted: false,
        status: 'ACTIVE'
      }
    }

    // Text search across multiple fields
    if (query) {
      propertyFilters.where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } }
      ]
    }

    // City filter
    if (city) {
      propertyFilters.where.city = { 
        contains: city, 
        mode: 'insensitive' 
      }
    }

    // Property type filter
    if (propertyType) {
      propertyFilters.where.type = propertyType
    }

    // Price filter
    if (maxPrice) {
      propertyFilters.where.pricePerNight = {
        lte: parseFloat(maxPrice)
      }
    }

    // Bedrooms filter
    if (minBedrooms) {
      propertyFilters.where.bedrooms = {
        gte: parseInt(minBedrooms)
      }
    }

    // Bathrooms filter
    if (minBathrooms) {
      propertyFilters.where.bathrooms = {
        gte: parseInt(minBathrooms)
      }
    }

    // Guests filter
    if (maxGuests) {
      propertyFilters.where.maxGuests = {
        gte: parseInt(maxGuests)
      }
    }

    console.log('🏠 Fetching properties with filters...')
    
    // Get paginated properties and total count
    const [properties, propertyTotalCount] = await Promise.all([
      prisma.property.findMany({
        ...propertyFilters,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          media: {
            where: { isFeatured: true },
            take: 1
          },
          amenities: {
            include: {
              amenity: true
            },
            take: 5 // Limit amenities for search results
          },
          reviews: {
            select: {
              overallRating: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.property.count({ where: propertyFilters.where })
    ])

    console.log(`✅ Found ${properties.length} properties`)

    // Note: Services are removed from your new schema
    // If you need services functionality, we'll need to add it back to the schema

    // Calculate pagination metadata
    const totalPages = Math.ceil(propertyTotalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      // Pagination metadata
      pagination: {
        page,
        limit,
        totalCount: propertyTotalCount,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      },
      // Search results
      data: {
        properties,
        // services: [], // Removed services from new schema
        totalResults: properties.length,
        propertyCount: properties.length,
        // serviceCount: 0, // Removed services from new schema
      },
      // Search parameters for debugging
      searchParams: { 
        query, city, propertyType, maxPrice, minBedrooms, minBathrooms, maxGuests 
      }
    })

  } catch (error: any) {
    console.error('❌ Search error details:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: 'Check database connection and schema compatibility'
      },
      { status: 500 }
    )
  }
}