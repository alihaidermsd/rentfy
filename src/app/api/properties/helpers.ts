import { Prisma } from '@prisma/client'

export const PROPERTY_RELATIONS: Prisma.PropertyInclude = {
  host: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
  media: {
    orderBy: [
      { isFeatured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
    take: 5,
  },
  amenities: {
    include: {
      amenity: true,
    },
  },
  facilities: {
    include: {
      facility: true,
    },
  },
  reviews: {
    select: {
      overallRating: true,
    },
  },
}

export const PROPERTY_ORDER_BY: Prisma.PropertyOrderByWithRelationInput = {
  createdAt: 'desc',
}

export type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof PROPERTY_RELATIONS
}>

export function withReviewStats(properties: PropertyWithRelations[]) {
  return properties.map((property) => {
    const reviewCount = property.reviews?.length ?? 0
    const totalRating = property.reviews?.reduce((sum, review) => {
      return sum + (review.overallRating ?? 0)
    }, 0) ?? 0

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : null

    return {
      ...property,
      reviewCount,
      averageRating,
    }
  })
}

