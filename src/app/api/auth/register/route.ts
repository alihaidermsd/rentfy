import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, name, phone, role = 'GUEST' } = await request.json()

    console.log('👤 Registration attempt for:', email, 'Role:', role)

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['GUEST', 'HOST', 'ADMIN']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be GUEST, HOST, or ADMIN' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User already exists with this email',
          user: existingUser
        },
        { status: 409 }
      )
    }

    // Create user without password
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone || null,
        role: role as any,
        isVerified: false
      }
    })

    // Generate JWT token
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

    console.log('✅ User registered successfully:', user.email, 'Role:', user.role)

    return NextResponse.json({
      success: true,
      user,
      token,
      message: `Registration successful as ${role.toLowerCase()}`
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}