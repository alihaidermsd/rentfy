import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Read all properties (No auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: any = {
      where: {
        isAvailable: true
      }
    }

    // Optional filters
    if (searchParams.get('city')) {
      filters.where.city = searchParams.get('city')!
    }

    if (searchParams.get('type')) {
      filters.where.type = searchParams.get('type')!
    }

    if (searchParams.get('maxPrice')) {
      filters.where.price = {
        lte: parseFloat(searchParams.get('maxPrice')!)
      }
    }

    if (searchParams.get('minBedrooms')) {
      filters.where.bedrooms = {
        gte: parseInt(searchParams.get('minBedrooms')!)
      }
    }

    const properties = await prisma.property.findMany({
      ...filters,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${properties.length} properties`)

    return NextResponse.json(properties)

  } catch (error: any) {
    console.error('❌ Get properties error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create property (Auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title, 
      description, 
      type, 
      price, 
      location, 
      city, 
      bedrooms, 
      bathrooms, 
      areaSqft,
      ownerId
    } = body

    console.log('🏠 Creating property with data:', { title, type, price, ownerId })

    // Validate required fields
    if (!title || !type || !price || !location || !city || !ownerId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['title', 'type', 'price', 'location', 'city', 'ownerId'],
          received: { title, type, price, location, city, ownerId }
        },
        { status: 400 }
      )
    }

    // Validate PropertyType enum
    const validPropertyTypes = ['HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL']
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: ownerId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        type: type as any, // Type assertion for Prisma enum
        price: parseFloat(price),
        location: location.trim(),
        city: city.trim(),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        areaSqft: areaSqft ? parseFloat(areaSqft) : null,
        ownerId,
        isAvailable: true,
        images: []
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
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
        owner: {
          select: {
            id: true,
            name: true,
            phone: true
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
      data: { isAvailable: false }
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