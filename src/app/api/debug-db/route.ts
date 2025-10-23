import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Check properties count and sample
    const propertiesCount = await prisma.property.count();
    const sampleProperties = await prisma.property.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        isAvailable: true,
        ownerId: true
      }
    });

    // Check users count
    const usersCount = await prisma.user.count();
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    return NextResponse.json({
      database: 'Connected',
      properties: {
        total: propertiesCount,
        sample: sampleProperties
      },
      users: {
        total: usersCount,
        sample: sampleUsers
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}