import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log('🔐 Passwordless login attempt for:', email)

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user (case insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    })

    // If user doesn't exist, create a new one
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: email.split('@')[0], // Default name from email
          role: 'GUEST' // Default role
        }
      })

      console.log('✅ New user created:', newUser.email)

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'
      
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        success: true,
        user: newUser,
        token,
        message: 'Login successful - new user created'
      })
    }

    console.log('✅ User found:', user.email, 'Role:', user.role)

    // Generate JWT token for existing user
    const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful for:', user.email, 'Role:', user.role)

    return NextResponse.json({
      success: true,
      user,
      token,
      message: 'Login successful'
    })

  } catch (error: any) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}