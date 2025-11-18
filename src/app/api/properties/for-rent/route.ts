import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, PropertyPurpose, PropertyType } from '@prisma/client'
import {
  PROPERTY_ORDER_BY,
  PROPERTY_RELATIONS,
  withReviewStats,
} from '../helpers'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50
const RENT_PURPOSES: PropertyPurpose[] = [
  PropertyPurpose.RENT,
  PropertyPurpose.RENT_AND_SALE,
]

const isPropertyType = (value: string): value is PropertyType => {
  return Object.values(PropertyType).includes(value as PropertyType)
}

const parseBooleanParam = (value: string | null) => {
  if (value === null) return undefined
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    const page = pageParam ? Number.parseInt(pageParam, 10) : 1
    const limit = limitParam ? Number.parseInt(limitParam, 10) : DEFAULT_LIMIT

    if (Number.isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 },
      )
    }

    if (
      Number.isNaN(limit) ||
      limit < 1 ||
      limit > MAX_LIMIT
    ) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 },
      )
    }

    const skip = (page - 1) * limit

    const where: Prisma.PropertyWhereInput = {
      isDeleted: false,
      status: 'ACTIVE',
      purpose: { in: RENT_PURPOSES },
    }

    const typeParam = searchParams.get('type')
    if (typeParam) {
      if (!isPropertyType(typeParam)) {
        return NextResponse.json(
          { error: 'Invalid property type parameter' },
          { status: 400 },
        )
      }
      where.type = typeParam as PropertyType
    }

    const city = searchParams.get('city')
    if (city) {
      where.city = {
        contains: city.trim(),
        mode: 'insensitive',
      }
    }

    const bedroomsParam = searchParams.get('bedrooms')
    if (bedroomsParam) {
      const bedrooms = Number.parseInt(bedroomsParam, 10)
      if (Number.isNaN(bedrooms) || bedrooms < 0) {
        return NextResponse.json(
          { error: 'Invalid bedrooms parameter' },
          { status: 400 },
        )
      }
      where.bedrooms = { gte: bedrooms }
    }

    const bathroomsParam = searchParams.get('bathrooms')
    if (bathroomsParam) {
      const bathrooms = Number.parseInt(bathroomsParam, 10)
      if (Number.isNaN(bathrooms) || bathrooms < 0) {
        return NextResponse.json(
          { error: 'Invalid bathrooms parameter' },
          { status: 400 },
        )
      }
      where.bathrooms = { gte: bathrooms }
    }

    const guestsParam = searchParams.get('maxGuests')
    if (guestsParam) {
      const guests = Number.parseInt(guestsParam, 10)
      if (Number.isNaN(guests) || guests < 1) {
        return NextResponse.json(
          { error: 'Invalid maxGuests parameter' },
          { status: 400 },
        )
      }
      where.maxGuests = { gte: guests }
    }

    const furnishedParam = parseBooleanParam(searchParams.get('furnished'))
    if (furnishedParam !== undefined) {
      where.isFurnished = furnishedParam
    }

    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')

    if (minPriceParam || maxPriceParam) {
      const priceRange: Prisma.FloatNullableFilter = {}

      if (minPriceParam) {
        const minPrice = Number.parseFloat(minPriceParam)
        if (Number.isNaN(minPrice) || minPrice < 0) {
          return NextResponse.json(
            { error: 'Invalid minPrice parameter' },
            { status: 400 },
          )
        }
        priceRange.gte = minPrice
      }

      if (maxPriceParam) {
        const maxPrice = Number.parseFloat(maxPriceParam)
        if (Number.isNaN(maxPrice) || maxPrice <= 0) {
          return NextResponse.json(
            { error: 'Invalid maxPrice parameter' },
            { status: 400 },
          )
        }
        priceRange.lte = maxPrice
      }

      where.OR = [
        { rentPrice: { ...priceRange } },
        { pricePerNight: { ...priceRange } },
      ]
    }

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        include: PROPERTY_RELATIONS,
        orderBy: PROPERTY_ORDER_BY,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      pagination: { page, limit, totalCount, totalPages },
      data: withReviewStats(properties),
    })
  } catch (error: any) {
    console.error('Failed to fetch rental properties', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental properties' },
      { status: 500 },
    )
  }
}