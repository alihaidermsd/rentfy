import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Read all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    const filters: any = {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: true,
        service: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
    
    if (userId) {
      filters.where = { ...filters.where, userId }
    }

    if (type) {
      filters.where = { ...filters.where, type: type as any }
    }

    const bookings = await prisma.booking.findMany(filters)

    return NextResponse.json(bookings)

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create booking
export async function POST(request: NextRequest) {
  try {
    const { type, propertyId, serviceId, userId, startDate, endDate, totalPrice } = await request.json()
    
    const booking = await prisma.booking.create({
      data: {
        type,
        propertyId: type === 'PROPERTY' ? propertyId : null,
        serviceId: type === 'SERVICE' ? serviceId : null,
        userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        totalPrice,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: true,
        service: true
      }
    })

    return NextResponse.json(booking)

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: true,
        service: true
      }
    })

    return NextResponse.json(booking)

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}