import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['HOUSE', 'APARTMENT', 'PLOT', 'COMMERCIAL']),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  areaSqft: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export const serviceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['MOVING_TRANSPORT', 'CLEANING', 'INTERIOR_DESIGN', 'LEGAL', 'RENOVATION']),
  providerName: z.string().min(2, 'Provider name must be at least 2 characters'),
  locations: z.array(z.string()),
  basePrice: z.number().positive().optional(),
  rating: z.number().min(0).max(5).optional()
})

export const bookingSchema = z.object({
  type: z.enum(['PROPERTY', 'SERVICE']),
  propertyId: z.string().optional(),
  serviceId: z.string().optional(),
  userId: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  totalPrice: z.number().positive()
})