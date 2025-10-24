import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const payment = await prisma.payment.findUnique({
      where: { id },
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
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            property: {
              select: {
                id: true,
                title: true,
                pricePerNight: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status, receiptUrl, paymentIntentId } = await request.json()

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(receiptUrl && { receiptUrl }),
        ...(paymentIntentId && { paymentIntentId })
      },
      include: {
        booking: true
      }
    })

    // If payment is completed, update booking payment status
    if (status === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'PAID' }
      })
    }

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('Update payment error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}