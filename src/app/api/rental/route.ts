import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Read all properties with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
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

    const filters: any = {
      where: {
        isDeleted: false,
        status: 'ACTIVE' // Only show active properties
      }
    }

    // Optional filters
    if (searchParams.get('city')) {
      filters.where.city = {
        contains: searchParams.get('city')!,
        mode: 'insensitive'
      }
    }

    if (searchParams.get('type')) {
      filters.where.type = searchParams.get('type')!
    }

    if (searchParams.get('maxPrice')) {
      filters.where.pricePerNight = {
        lte: parseFloat(searchParams.get('maxPrice')!)
      }
    }

    if (searchParams.get('minPrice')) {
      filters.where.pricePerNight = {
        ...filters.where.pricePerNight,
        gte: parseFloat(searchParams.get('minPrice')!)
      }
    }

    if (searchParams.get('minBedrooms')) {
      filters.where.bedrooms = {
        gte: parseInt(searchParams.get('minBedrooms')!)
      }
    }

    if (searchParams.get('minBathrooms')) {
      filters.where.bathrooms = {
        gte: parseInt(searchParams.get('minBathrooms')!)
      }
    }

    if (searchParams.get('maxGuests')) {
      filters.where.maxGuests = {
        gte: parseInt(searchParams.get('maxGuests')!)
      }
    }

    // Get paginated properties and total count
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        ...filters,
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
            }
          },
          facilities: {
            include: {
              facility: true
            }
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
      prisma.property.count({ where: filters.where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    console.log(`✅ Found ${properties.length} properties (Page ${page}/${totalPages})`)

    return NextResponse.json({
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      },
      data: properties
    })

  } catch (error: any) {
    console.error('❌ Get properties error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title, 
      description, 
      type, 
      pricePerNight, 
      address, 
      city, 
      country,
      bedrooms, 
      bathrooms, 
      maxGuests,
      hostId,
      latitude,
      longitude,
      policies
    } = body

    console.log('🏠 Creating property with data:', { title, type, pricePerNight, hostId })

    // Validate required fields
    const requiredFields = ['title', 'type', 'pricePerNight', 'address', 'city', 'country', 'maxGuests', 'hostId']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields,
          received: body
        },
        { status: 400 }
      )
    }

    // Validate PropertyType enum
    const validPropertyTypes = ['APARTMENT', 'VILLA', 'ROOM', 'HOUSE', 'HOTEL']
    if (!validPropertyTypes.includes(type)) {
      return NextResponse.json(
        { 
          error: 'Invalid property type',
          validTypes: validPropertyTypes,
          received: type
        },
        { status: 400 }
      )
    }

    // Check if host exists and is a host
    const host = await prisma.user.findUnique({
      where: { id: hostId }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (host.role !== 'HOST' && host.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'User is not a host' },
        { status: 403 }
      )
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        type: type as any,
        pricePerNight: parseFloat(pricePerNight),
        maxGuests: parseInt(maxGuests),
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        policies: policies || {},
        hostId,
        status: 'DRAFT' // Start as draft, host can activate later
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    console.log('✅ Property created successfully:', property.id)

    return NextResponse.json(property, { status: 201 })

  } catch (error: any) {
    console.error('❌ Create property error:', error)
    return NextResponse.json(
      { error: 'Failed to create property', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update property
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(property)

  } catch (error: any) {
    console.error('Update property error:', error)
    return NextResponse.json(
      { error: 'Failed to update property', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete property (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const property = await prisma.property.update({
      where: { id },
      data: { isDeleted: true }
    })

    return NextResponse.json({ 
      message: 'Property deleted successfully',
      property 
    })

  } catch (error: any) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property', details: error.message },
      { status: 500 }
    )
  }
}