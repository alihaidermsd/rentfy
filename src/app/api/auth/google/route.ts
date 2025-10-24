
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, name, googleId, avatar } = await request.json()

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          avatar: avatar || null,
          role: 'GUEST',
          isVerified: true // Google verified emails are trusted
        }
      })
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      user,
      token,
      message: 'Google login successful'
    })

  } catch (error: any) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}