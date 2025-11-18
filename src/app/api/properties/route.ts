import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  Prisma,
  PropertyPurpose,
  PropertyType,
  UserRole,
} from '@prisma/client'
import {
  PROPERTY_ORDER_BY,
  PROPERTY_RELATIONS,
  withReviewStats,
} from './helpers'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

const RENT_PURPOSES: PropertyPurpose[] = [
  PropertyPurpose.RENT,
  PropertyPurpose.RENT_AND_SALE,
]
const SALE_PURPOSES: PropertyPurpose[] = [
  PropertyPurpose.SALE,
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

// GET - Universal search with filters
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
    }

    const purposeParam = searchParams.get('purpose')
    let priceMode: 'RENT' | 'SALE' | 'ALL' = 'ALL'

    if (purposeParam) {
      if (purposeParam === PropertyPurpose.RENT) {
        where.purpose = { in: RENT_PURPOSES }
        priceMode = 'RENT'
      } else if (purposeParam === PropertyPurpose.SALE) {
        where.purpose = { in: SALE_PURPOSES }
        priceMode = 'SALE'
      } else if (purposeParam === PropertyPurpose.RENT_AND_SALE) {
        where.purpose = PropertyPurpose.RENT_AND_SALE
        priceMode = 'ALL'
      } else {
        return NextResponse.json(
          { error: 'Invalid purpose parameter' },
          { status: 400 },
        )
      }
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

    const state = searchParams.get('state')
    if (state) {
      where.state = {
        contains: state.trim(),
        mode: 'insensitive',
      }
    }

    const country = searchParams.get('country')
    if (country) {
      where.country = {
        contains: country.trim(),
        mode: 'insensitive',
      }
    }

    const featured = parseBooleanParam(searchParams.get('featured'))
    if (featured !== undefined) {
      where.isFeatured = featured
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

      if (priceMode === 'SALE') {
        where.salePrice = {
          ...(where.salePrice as Prisma.FloatNullableFilter | undefined),
          ...priceRange,
        }
      } else if (priceMode === 'RENT') {
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
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      data: withReviewStats(properties),
    })
  } catch (error: any) {
    console.error('Get properties error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 },
    )
  }
}

// POST - Create new property listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      type,
      purpose = PropertyPurpose.RENT,
      salePrice,
      rentPrice,
      pricePerNight,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      area,
      areaUnit = 'sqft',
      bedrooms,
      bathrooms,
      maxGuests,
      yearBuilt,
      plotArea,
      isFurnished = false,
      ownershipType,
      possessionDate,
      policies,
      hostId,
    } = body

    const requiredFields = ['title', 'type', 'address', 'city', 'country', 'hostId']
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 },
      )
    }

    if (!isPropertyType(type)) {
      return NextResponse.json(
        { error: 'Invalid property type' },
        { status: 400 },
      )
    }

    if (!Object.values(PropertyPurpose).includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid property purpose' },
        { status: 400 },
      )
    }

    const host = await prisma.user.findUnique({
      where: { id: hostId },
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 },
      )
    }

    if (host.role !== UserRole.HOST && host.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'User does not have permission to host properties' },
        { status: 403 },
      )
    }

    const requiresSalePrice = [PropertyPurpose.SALE, PropertyPurpose.RENT_AND_SALE].includes(purpose)
    const requiresRentPrice = [PropertyPurpose.RENT, PropertyPurpose.RENT_AND_SALE].includes(purpose)

    if (requiresSalePrice && (salePrice === undefined || salePrice === null)) {
      return NextResponse.json(
        { error: 'Sale price is required for sale listings' },
        { status: 400 },
      )
    }

    if (requiresRentPrice && rentPrice === undefined && pricePerNight === undefined) {
      return NextResponse.json(
        { error: 'Rent price or nightly price is required for rental listings' },
        { status: 400 },
      )
    }

    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? '',
        type,
        purpose,
        salePrice: salePrice ? Number.parseFloat(String(salePrice)) : null,
        rentPrice: rentPrice ? Number.parseFloat(String(rentPrice)) : null,
        pricePerNight: pricePerNight ? Number.parseFloat(String(pricePerNight)) : null,
        address: address.trim(),
        city: city.trim(),
        state: state?.trim(),
        country: country.trim(),
        latitude: latitude ? Number.parseFloat(String(latitude)) : null,
        longitude: longitude ? Number.parseFloat(String(longitude)) : null,
        area: area ? Number.parseFloat(String(area)) : null,
        areaUnit,
        bedrooms: bedrooms ? Number.parseInt(String(bedrooms), 10) : null,
        bathrooms: bathrooms ? Number.parseInt(String(bathrooms), 10) : null,
        maxGuests: maxGuests ? Number.parseInt(String(maxGuests), 10) : null,
        yearBuilt: yearBuilt ? Number.parseInt(String(yearBuilt), 10) : null,
        plotArea: plotArea ? Number.parseFloat(String(plotArea)) : null,
        isFurnished,
        ownershipType: ownershipType?.trim(),
        possessionDate: possessionDate ? new Date(possessionDate) : null,
        policies: policies ?? {},
        hostId,
      },
      include: PROPERTY_RELATIONS,
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('❌ Create property error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create property',
        details: error.message,
      },
      { status: 500 },
    )
  }
}