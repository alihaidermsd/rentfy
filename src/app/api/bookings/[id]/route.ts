
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Status transition validation
const validStatusTransitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
}

// GET - Get single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        property: {
          include: {
            media: {
              orderBy: { order: 'asc' }
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
            }
          }
        },
        review: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking
    })
  } catch (error: any) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update booking by ID (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updateData = await request.json()

    // Remove id from update data to prevent changing the booking ID
    const { id: _, ...dataToUpdate } = updateData

    // Check if booking exists
    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      select: { status: true, paymentStatus: true }
    })

    if (!currentBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validate status transitions if status is being updated
    if (dataToUpdate.status && dataToUpdate.status !== currentBooking.status) {
      const allowedTransitions = validStatusTransitions[currentBooking.status] || []
      if (!allowedTransitions.includes(dataToUpdate.status)) {
        return NextResponse.json(
          { 
            success: false,
            error: `Invalid status transition from ${currentBooking.status} to ${dataToUpdate.status}`,
            allowedTransitions
          },
          { status: 400 }
        )
      }
    }

    // Auto-update payment status when booking is confirmed
    if (dataToUpdate.status === 'CONFIRMED') {
      dataToUpdate.paymentStatus = 'PAID'
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
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

// DELETE - Delete booking by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if booking exists first
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { review: true }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if review exists
    if (booking.review) {
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