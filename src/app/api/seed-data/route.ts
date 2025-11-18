import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🌱 Starting data seeding...')

    // Clear existing data
    await prisma.booking.deleteMany()
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()

    console.log('🗑️ Cleared existing data')

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '03001234567',
        role: 'HOST'
      }
    })

    console.log('👤 Created test user:', testUser.email)

    // Create properties using CORRECT enum values from your schema
    await prisma.property.create({
      data: {
        title: 'Modern Apartment in Karachi',
        description: 'Beautiful 2-bedroom apartment with sea view in Clifton',
        type: 'APARTMENT',
        purpose: 'RENT',
        pricePerNight: 140,
        rentPrice: 2400,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Clifton Block 5',
        city: 'Karachi',
        country: 'Pakistan',
        area: 1200,
        status: 'ACTIVE',
        hostId: testUser.id
      }
    })

    await prisma.property.create({
      data: {
        title: 'Luxury House in DHA Lahore',
        description: 'Spacious 4-bedroom house with garden and parking',
        type: 'HOUSE',
        purpose: 'SALE',
        salePrice: 45000000,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        address: 'DHA Phase 6',
        city: 'Lahore',
        country: 'Pakistan',
        area: 2800,
        status: 'ACTIVE',
        hostId: testUser.id
      }
    })

    await prisma.property.create({
      data: {
        title: 'Commercial Office Space Islamabad',
        description: 'Prime location commercial space in Blue Area',
        type: 'COMMERCIAL_OFFICE',
        purpose: 'RENT_AND_SALE',
        salePrice: 35000000,
        rentPrice: 30000,
        area: 1500,
        address: 'Blue Area',
        city: 'Islamabad',
        country: 'Pakistan',
        status: 'ACTIVE',
        hostId: testUser.id
      }
    })

    await prisma.property.create({
      data: {
        title: 'Residential Plot in Bahria Town',
        description: '500 sq yard residential plot with prime location',
        type: 'PLOT',
        purpose: 'SALE',
        salePrice: 15000000,
        plotArea: 4500,
        address: 'Bahria Town',
        city: 'Rawalpindi',
        country: 'Pakistan',
        status: 'ACTIVE',
        hostId: testUser.id
      }
    })

    console.log('🏠 Created 4 properties')

    // Get all created data
    const allUsers = await prisma.user.findMany()
    const allProperties = await prisma.property.findMany()

    return NextResponse.json({
      success: true,
      data: {
        users: allUsers.map((u) => ({ id: u.id, email: u.email, name: u.name })),
        properties: allProperties.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          city: p.city,
          pricePerNight: p.pricePerNight,
          rentPrice: p.rentPrice,
          salePrice: p.salePrice,
        })),
        credentials: {
          email: 'test@example.com',
        }
      },
      message: `Seeded ${allUsers.length} users and ${allProperties.length} properties successfully`
    })

  } catch (error: any) {
    console.error('❌ Seed data error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}