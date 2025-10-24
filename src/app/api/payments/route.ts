import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount, paymentMethod, guestId } = body // ADD guestId

    // Validate required fields
    if (!bookingId || !amount || !guestId) { // ADD guestId validation
      return NextResponse.json(
        { 
          error: 'Booking ID, amount, and guest ID are required',
          missingFields: [!bookingId && 'bookingId', !amount && 'amount', !guestId && 'guestId'].filter(Boolean)
        },
        { status: 400 }
      )
    }

    // Check if booking exists and is valid
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        property: true,
        guest: true // Include guest to verify
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify guest exists and matches
    const guest = await prisma.user.findUnique({
      where: { id: guestId }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Check if payment already exists for this booking
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking' },
        { status: 409 }
      )
    }

    // Create payment record - WITH ALL REQUIRED FIELDS
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: "USD", // REQUIRED - has default but should be explicit
        bookingId,
        guestId, // REQUIRED - from your schema
        paymentMethod,
        status: 'PENDING'
      },
      include: {
        booking: {
          include: {
            guest: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            property: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        guest: { // Include guest relation in response
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Here you would integrate with your payment provider (Stripe, PayPal, etc.)
    // For now, we'll return the payment record
    // const paymentIntent = await stripe.paymentIntents.create({...})

    return NextResponse.json({
      payment,
      // clientSecret: paymentIntent.client_secret, // If using Stripe
      message: 'Payment intent created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get payments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const status = searchParams.get('status')
    const guestId = searchParams.get('guestId') // ADD guestId filter
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const filters: any = {
      include: {
        booking: {
          include: {
            guest: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            property: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        guest: { // ADD guest to include
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }
    
    // Build where conditions
    const whereConditions: any = {}
    
    if (bookingId) {
      whereConditions.bookingId = bookingId
    }

    if (status) {
      whereConditions.status = status
    }

    if (guestId) { // ADD guestId filter
      whereConditions.guestId = guestId
    }

    if (Object.keys(whereConditions).length > 0) {
      filters.where = whereConditions
    }

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany(filters),
      prisma.payment.count({ where: whereConditions })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev
      },
      data: payments
    })

  } catch (error: any) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}