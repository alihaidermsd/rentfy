import { NextResponse } from 'next/server'

const notImplementedResponse = NextResponse.json(
  {
    error: 'Service marketplace endpoints are disabled in this build.',
    hint: 'Use property endpoints for rent/sale workflows.',
  },
  { status: 501 },
)

export async function GET() {
  return notImplementedResponse
}

export async function POST() {
  return notImplementedResponse
}

export async function PUT() {
  return notImplementedResponse
}

export async function DELETE() {
  return notImplementedResponse
}