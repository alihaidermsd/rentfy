import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Handle payment provider webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // If you're not using Stripe yet, handle generic webhook data
    let eventData;
    
    try {
      // If using Stripe, uncomment this:
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // eventData = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      
      // For now, parse the JSON body directly for testing
      eventData = JSON.parse(body);
    } catch (error: any) {
      console.error('Webhook parsing failed:', error)
      return NextResponse.json(
        { error: 'Webhook parsing failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (eventData.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = eventData.data.object;
        // Update payment status in database
        await prisma.payment.updateMany({
          where: { paymentIntentId: paymentIntent.id },
          data: { 
            status: 'COMPLETED',
            receiptUrl: paymentIntent.receipt_url
          }
        });
        
        // Also update booking payment status
        await prisma.booking.updateMany({
          where: {
            payment: {
              paymentIntentId: paymentIntent.id
            }
          },
          data: {
            paymentStatus: 'PAID'
          }
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = eventData.data.object;
        await prisma.payment.updateMany({
          where: { paymentIntentId: failedPayment.id },
          data: { status: 'FAILED' }
        });
        break;

      case 'payment.completed': // Generic fallback
        const payment = eventData.data;
        await prisma.payment.updateMany({
          where: { paymentIntentId: payment.id },
          data: { status: 'COMPLETED' }
        });
        break;

      default:
        console.log(`Unhandled event type: ${eventData.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}