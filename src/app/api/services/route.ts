import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Read all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: any = {
      where: {
        isAvailable: true
      }
    }

    if (searchParams.get('category')) {
      filters.where.category = searchParams.get('category')
    }

    if (searchParams.get('location')) {
      filters.where.locations = {
        has: searchParams.get('location')
      }
    }

    const services = await prisma.service.findMany(filters)

    return NextResponse.json(services)

  } catch (error) {
    console.error('Services error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create service
export async function POST(request: NextRequest) {
  try {
    const { name, description, category, providerName, locations, basePrice } = await request.json()
    
    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        providerName,
        locations: Array.isArray(locations) ? locations : [locations], // ✅ Handle both array and string
        basePrice
      }
    })

    return NextResponse.json(service)

  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(service)

  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.update({
      where: { id },
      data: { isAvailable: false }
    })

    return NextResponse.json({ 
      message: 'Service deleted successfully',
      service 
    })

  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}