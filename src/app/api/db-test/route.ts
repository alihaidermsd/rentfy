import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to count users as a simple database test
    const count = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: count
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown database error',
      errorCode: error.code,
      errorName: error.name
    }, { status: 500 });
  }
}