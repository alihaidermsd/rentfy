import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('🌱 Starting data seeding...')

    // Clear existing data
    await prisma.booking.deleteMany()
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()

    console.log('🗑️ Cleared existing data')

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12)
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        phone: '03001234567',
        role: 'USER'
      }
    })

    console.log('👤 Created test user:', testUser.email)

    // Create properties using CORRECT enum values from your schema
    const property1 = await prisma.property.create({
      data: {
        title: 'Modern Apartment in Karachi',
        description: 'Beautiful 2-bedroom apartment with sea view in Clifton',
        type: 'APARTMENT', // Correct enum value
        price: 25000000,
        location: 'Clifton Block 5',
        city: 'Karachi',
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1200,
        ownerId: testUser.id,
        isAvailable: true,
        images: []
      }
    })

    const property2 = await prisma.property.create({
      data: {
        title: 'Luxury House in DHA Lahore',
        description: 'Spacious 4-bedroom house with garden and parking',
        type: 'HOUSE', // Changed from VILLA to HOUSE
        price: 45000000,
        location: 'DHA Phase 6',
        city: 'Lahore',
        bedrooms: 4,
        bathrooms: 3,
        areaSqft: 2800,
        ownerId: testUser.id,
        isAvailable: true,
        images: []
      }
    })

    const property3 = await prisma.property.create({
      data: {
        title: 'Commercial Office Space Islamabad',
        description: 'Prime location commercial space in Blue Area',
        type: 'COMMERCIAL', // Correct enum value
        price: 35000000,
        location: 'Blue Area',
        city: 'Islamabad',
        bedrooms: 0,
        bathrooms: 2,
        areaSqft: 1500,
        ownerId: testUser.id,
        isAvailable: true,
        images: []
      }
    })

    const property4 = await prisma.property.create({
      data: {
        title: 'Residential Plot in Bahria Town',
        description: '500 sq yard residential plot with prime location',
        type: 'PLOT', // Correct enum value
        price: 15000000,
        location: 'Bahria Town',
        city: 'Rawalpindi',
        areaSqft: 4500,
        ownerId: testUser.id,
        isAvailable: true,
        images: []
      }
    })

    console.log('🏠 Created 4 properties')

    // Get all created data
    const allUsers = await prisma.user.findMany()
    const allProperties = await prisma.property.findMany()

    return NextResponse.json({
      success: true,
      data: {
        users: allUsers.map((u: { id: any; email: any; name: any }) => ({ id: u.id, email: u.email, name: u.name })),
        properties: allProperties.map((p: { id: any; title: any; price: any; type: any; city: any }) => ({ id: p.id, title: p.title, price: p.price, type: p.type, city: p.city })),
        credentials: {
          email: 'test@example.com',
          password: 'password123'
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