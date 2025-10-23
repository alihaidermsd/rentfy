import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt for:', email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ User found:', user.email)

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    console.log('🔑 Password validation result:', isPasswordValid)

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || '629da79976094da95bf2522a099b2e157e531b0ccc6d575269c489e60b602ce9'
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    console.log('✅ Login successful for:', user.email)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
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