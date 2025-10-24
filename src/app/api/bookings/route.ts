
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Read all bookings with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    const hostId = searchParams.get('hostId')
    const status = searchParams.get('status')
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit between 1-100' },
        { status: 400 }
      )
    }

    const filters: any = {
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        property: {
          include: {
            media: {
              where: { isFeatured: true },
              take: 1
            }
          }
        },
        review: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }
    
    // Build where conditions
    const whereConditions: any = {}
    
    if (guestId) {
      whereConditions.guestId = guestId
    }

    if (hostId) {
      whereConditions.hostId = hostId
    }

    if (status) {
      whereConditions.status = status as any
    }

    if (Object.keys(whereConditions).length > 0) {
      filters.where = whereConditions
    }

    // Get paginated bookings and total count
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany(filters),
      prisma.booking.count({ where: whereConditions })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: {
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
        bookings
      }
    })

  } catch (error: any) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      propertyId,
      guestId,
      checkIn,
      checkOut,
      totalPrice,
      hostId
    } = body

    // Validate required fields
    const requiredFields = ['propertyId', 'guestId', 'checkIn', 'checkOut', 'totalPrice', 'hostId']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      )
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { 
        id: propertyId,
        isDeleted: false,
        status: 'ACTIVE'
      }
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found or not available' },
        { status: 404 }
      )
    }

    // Check if guest exists
    const guest = await prisma.user.findUnique({
      where: { id: guestId }
    })

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Check if host exists
    const host = await prisma.user.findUnique({
      where: { id: hostId }
    })

    if (!host) {
      return NextResponse.json(
        { success: false, error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check availability for the dates
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        OR: [
          {
            checkIn: { lte: new Date(checkOut) },
            checkOut: { gte: new Date(checkIn) }
          }
        ],
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { success: false, error: 'Property not available for the selected dates' },
        { status: 409 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        guestId,
        hostId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice: parseFloat(totalPrice),
        status: 'PENDING',
        paymentStatus: 'UNPAID'
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: {
          include: {
            media: {
              where: { isFeatured: true },
              take: 1
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update booking
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Check if booking exists first
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: true
      }
    })

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    })

  } catch (error: any) {
    console.error('Update booking error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Check if booking exists first
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { review: true }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if review exists
    if (existingBooking.review) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete booking with existing review' },
        { status: 400 }
      )
    }

    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete booking error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}