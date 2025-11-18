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

const parsePurpose = (value: string | null): PropertyPurpose | undefined => {
  if (!value) return undefined
  if (Object.values(PropertyPurpose).includes(value as PropertyPurpose)) {
    return value as PropertyPurpose
  }
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
      type: PropertyType.PLOT,
    }

    const purposeParam = parsePurpose(searchParams.get('purpose'))
    if (purposeParam) {
      where.purpose = purposeParam
    }

    const city = searchParams.get('city')
    if (city) {
      where.city = {
        contains: city.trim(),
        mode: 'insensitive',
      }
    }

    const minAreaParam = searchParams.get('minArea')
    const maxAreaParam = searchParams.get('maxArea')

    if (minAreaParam || maxAreaParam) {
      const areaFilter: Prisma.FloatNullableFilter = {}

      if (minAreaParam) {
        const minArea = Number.parseFloat(minAreaParam)
        if (Number.isNaN(minArea) || minArea < 0) {
          return NextResponse.json(
            { error: 'Invalid minArea parameter' },
            { status: 400 },
          )
        }
        areaFilter.gte = minArea
      }

      if (maxAreaParam) {
        const maxArea = Number.parseFloat(maxAreaParam)
        if (Number.isNaN(maxArea) || maxArea <= 0) {
          return NextResponse.json(
            { error: 'Invalid maxArea parameter' },
            { status: 400 },
          )
        }
        areaFilter.lte = maxArea
      }

      where.area = areaFilter
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

      if (purposeParam === PropertyPurpose.SALE) {
        where.salePrice = priceRange
      } else if (purposeParam === PropertyPurpose.RENT) {
        where.OR = [
          { rentPrice: { ...priceRange } },
          { pricePerNight: { ...priceRange } },
        ]
      } else {
        where.OR = [
          { salePrice: { ...priceRange } },
          { rentPrice: { ...priceRange } },
          { pricePerNight: { ...priceRange } },
        ]
      }
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
    console.error('Failed to fetch plots', error)
    return NextResponse.json(
      { error: 'Failed to fetch plots' },
      { status: 500 },
    )
  }
}
