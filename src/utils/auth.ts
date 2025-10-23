import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Custom error classes
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Get JWT secret from environment with fallback
let JWT_SECRET = process.env.JWT_SECRET as string

// Validate JWT secret at startup
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new AuthError('JWT_SECRET must be at least 32 characters long in production')
  } else {
    // Development fallback
    console.warn('⚠️  JWT_SECRET not found in environment. Using development fallback.')
    JWT_SECRET = '629da79976094da95bf2522a099b2e157e531b0ccc6d575269c489e60b602ce9'
  }
}

export interface AuthTokenPayload {
  userId: string
  email: string
  role: string
}

export class AuthUtils {
  private static readonly PASSWORD_MIN_LENGTH = 6
  private static readonly TOKEN_EXPIRY = '7d'
  private static readonly HASH_ROUNDS = 12

  /**
   * Hash a password using bcrypt
   * @throws {ValidationError} If password is invalid
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new ValidationError('Password is required')
    }
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      throw new ValidationError(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters long`)
    }
    return bcrypt.hash(password, this.HASH_ROUNDS)
  }

  /**
   * Compare a password with a hash
   * @throws {ValidationError} If inputs are invalid
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      throw new ValidationError('Password and hash are required')
    }
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * Generate a JWT token
   * @throws {ValidationError} If payload is invalid
   */
  static generateToken(payload: AuthTokenPayload): string {
    if (!payload.userId || !payload.email || !payload.role) {
      throw new ValidationError('Invalid token payload')
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY })
  }

  /**
   * Verify and decode a JWT token
   * @throws {AuthError} If token is invalid or expired
   */
  static verifyToken(token: string): AuthTokenPayload {
    if (!token) {
      throw new AuthError('Token is required')
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
      if (!decoded.userId || !decoded.email || !decoded.role) {
        throw new AuthError('Invalid token payload')
      }
      return decoded
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid token')
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token has expired')
      }
      throw new AuthError('Token verification failed')
    }
  }

  /**
   * Extract token from Authorization header
   * @throws {AuthError} If header format is invalid
   */
  static getTokenFromHeader(authHeader: string | null | undefined): string {
    if (!authHeader) {
      throw new AuthError('Authorization header is required')
    }
    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthError('Invalid authorization header format')
    }
    const token = authHeader.substring(7)
    if (!token) {
      throw new AuthError('Token is required')
    }
    return token
  }
}