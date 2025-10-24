import { z } from 'zod'

// User validation (without password)
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['GUEST', 'HOST', 'ADMIN']).default('GUEST'),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
})

// Login validation (passwordless)
export const loginSchema = z.object({
  email: z.string().email('Invalid email format')
})

// Property validation (updated to match new schema)
export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  type: z.enum(['APARTMENT', 'VILLA', 'ROOM', 'HOUSE', 'HOTEL']),
  pricePerNight: z.number().positive('Price per night must be positive').max(10000, 'Price seems too high'),
  maxGuests: z.number().int().positive('Max guests must be at least 1').max(50, 'Maximum 50 guests allowed'),
  bedrooms: z.number().int().positive('Bedrooms must be at least 1').default(1),
  bathrooms: z.number().int().positive('Bathrooms must be at least 1').default(1),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  hostId: z.string().uuid('Invalid host ID'),
  status: z.enum(['ACTIVE', 'PENDING', 'DRAFT', 'SUSPENDED']).default('DRAFT'),
  policies: z.record(z.string(), z.any()).optional() // For flexible JSON policies
})

// Property update validation (partial updates allowed)
export const propertyUpdateSchema = propertySchema.partial()

// Booking validation (updated to match new schema)
export const bookingSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  guestId: z.string().uuid('Invalid guest ID'),
  hostId: z.string().uuid('Invalid host ID'),
  checkIn: z.string().transform(str => new Date(str)),
  checkOut: z.string().transform(str => new Date(str)),
  totalPrice: z.number().positive('Total price must be positive'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('PENDING'),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED']).default('UNPAID')
})

// Review validation
export const reviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  propertyId: z.string().uuid('Invalid property ID'),
  guestId: z.string().uuid('Invalid guest ID'),
  ratingCleanliness: z.number().int().min(1).max(5, 'Cleanliness rating must be between 1-5'),
  ratingComfort: z.number().int().min(1).max(5, 'Comfort rating must be between 1-5'),
  ratingLocation: z.number().int().min(1).max(5, 'Location rating must be between 1-5'),
  ratingValue: z.number().int().min(1).max(5, 'Value rating must be between 1-5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters').optional()
})

// Amenity validation
export const amenitySchema = z.object({
  name: z.string().min(2, 'Amenity name must be at least 2 characters'),
  icon: z.string().optional()
})

// Facility validation
export const facilitySchema = z.object({
  name: z.string().min(2, 'Facility name must be at least 2 characters'),
  icon: z.string().optional()
})

// Property media validation
export const propertyMediaSchema = z.object({
  url: z.string().url('Media URL must be valid'),
  type: z.enum(['IMAGE', 'VIDEO']),
  isFeatured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  propertyId: z.string().uuid('Invalid property ID')
})

// Availability validation
export const availabilitySchema = z.object({
  date: z.string().transform(str => new Date(str)),
  isAvailable: z.boolean().default(true),
  priceOverride: z.number().positive('Price override must be positive').optional(),
  propertyId: z.string().uuid('Invalid property ID')
})

// Search validation
export const searchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'ROOM', 'HOUSE', 'HOTEL']).optional(),
  maxPrice: z.number().positive().optional(),
  minBedrooms: z.number().int().positive().optional(),
  minBathrooms: z.number().int().positive().optional(),
  maxGuests: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(12)
})

// Pagination validation (reusable)
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10)
})

// Export types for TypeScript
export type UserInput = z.infer<typeof userSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type PaginationInput = z.infer<typeof paginationSchema>