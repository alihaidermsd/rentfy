// /app/search/SearchPageClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Property {
  id: string
  title: string
  description: string
  type: string
  listingType: 'RENTAL' | 'SALE'
  pricePerNight?: number
  salePrice?: number
  area?: number
  city: string
  country: string
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  media: Array<{ url: string; type: string }>
  host: {
    id: string
    name: string
    avatar: string
  }
  reviews: Array<{ overallRating: number }>
  averageRating?: number
  reviewCount?: number
}

export default function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const propertyType = searchParams.get('propertyType') || 'RENTAL'

  const [filters, setFilters] = useState({
    propertyType: propertyType,
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBedrooms: searchParams.get('minBedrooms') || '',
    minBathrooms: searchParams.get('minBathrooms') || '',
    maxGuests: searchParams.get('maxGuests') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
  })

  const [showFilters, setShowFilters] = useState(false)

  const searchProperties = useCallback(async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })

      const url = `/api/properties?${queryParams.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search properties')
      }

      setProperties(data.data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error searching properties:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    searchProperties()
  }, [searchProperties])

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const defaultFilters = {
      propertyType: filters.propertyType,
      city: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      minBathrooms: '',
      maxGuests: '',
      minArea: '',
      maxArea: '',
    }
    setFilters(defaultFilters)
    
    const params = new URLSearchParams()
    params.append('propertyType', filters.propertyType)
    router.push(`/search?${params.toString()}`)
  }

  const switchPropertyType = (type: 'RENTAL' | 'SALE') => {
    const newFilters = {
      ...filters,
      propertyType: type,
      // Reset price filters when switching types
      minPrice: '',
      maxPrice: '',
      // Reset area filters when switching to rental
      ...(type === 'RENTAL' ? { minArea: '', maxArea: '' } : {})
    }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    params.append('propertyType', type)
    router.push(`/search?${params.toString()}`)
  }

  const getPropertyTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      APARTMENT: 'Apartment',
      VILLA: 'Villa',
      ROOM: 'Room',
      HOUSE: 'House',
      HOTEL: 'Hotel',
      LAND: 'Land',
      COMMERCIAL: 'Commercial',
    }
    return typeLabels[type] || type
  }

  const getPriceDisplay = (property: Property) => {
    if (property.listingType === 'SALE') {
      return `$${property.salePrice?.toLocaleString()}`
    } else {
      return `$${property.pricePerNight}/night`
    }
  }

  const getPricePlaceholder = () => {
    return filters.propertyType === 'SALE' ? 'Max sale price' : 'Max price per night'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {filters.propertyType === 'SALE' ? 'Properties for Sale' : 'Rental Properties'}
        </h1>
        <p className="text-gray-600 mt-2">
          {filters.propertyType === 'SALE' 
            ? 'Find your dream home or investment property' 
            : 'Discover amazing properties for your next trip'
          }
        </p>
      </div>

      {/* Property Type Toggle */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => switchPropertyType('RENTAL')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              filters.propertyType === 'RENTAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏠 Rent Properties
          </button>
          <button
            onClick={() => switchPropertyType('SALE')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              filters.propertyType === 'SALE'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Buy Properties
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Enter city or area"
                  value={filters.city}
                  onChange={(e) => updateFilters({ city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filters.propertyType === 'RENTAL' && (
                <div className="w-full md:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <input
                    type="number"
                    placeholder="Guests"
                    min="1"
                    value={filters.maxGuests}
                    onChange={(e) => updateFilters({ maxGuests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <button 
              onClick={applyFilters}
              className={`px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors ${
                filters.propertyType === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="ROOM">Room</option>
                  <option value="HOUSE">House</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filters.propertyType === 'SALE' ? 'Min Price' : 'Min Price/Night'}
                </label>
                <input
                  type="number"
                  placeholder="Min price"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filters.propertyType === 'SALE' ? 'Max Price' : 'Max Price/Night'}
                </label>
                <input
                  type="number"
                  placeholder={getPricePlaceholder()}
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filters.propertyType === 'SALE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (sq ft)</label>
                    <input
                      type="number"
                      placeholder="Min area"
                      min="0"
                      value={filters.minArea}
                      onChange={(e) => updateFilters({ minArea: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (sq ft)</label>
                    <input
                      type="number"
                      placeholder="Max area"
                      min="0"
                      value={filters.maxArea}
                      onChange={(e) => updateFilters({ maxArea: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                <input
                  type="number"
                  placeholder="Bedrooms"
                  min="1"
                  value={filters.minBedrooms}
                  onChange={(e) => updateFilters({ minBedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
                <input
                  type="number"
                  placeholder="Bathrooms"
                  min="1"
                  step="0.5"
                  value={filters.minBathrooms}
                  onChange={(e) => updateFilters({ minBathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={clearFilters} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Searching properties...</div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">No properties found</h2>
          <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          <button
            onClick={clearFilters}
            className={`mt-4 px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors ${
              filters.propertyType === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold">{properties.length}</span> {filters.propertyType.toLowerCase()} properties
              {searchParams.toString() && ' matching your criteria'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="relative h-48 bg-gray-200">
                  {property.media.length > 0 ? (
                    <Image
                      src={property.media[0].url}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      property.listingType === 'SALE' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1">
                      {property.title}
                    </h3>
                    <span className={`text-lg font-bold ml-2 ${
                      property.listingType === 'SALE' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {getPriceDisplay(property)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {property.city}, {property.country}
                  </p>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {property.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      {property.bedrooms && <span>{property.bedrooms} bed</span>}
                      {property.bathrooms && <span>{property.bathrooms} bath</span>}
                      {property.listingType === 'RENTAL' && property.maxGuests && (
                        <span>{property.maxGuests} guests</span>
                      )}
                      {property.listingType === 'SALE' && property.area && (
                        <span>{property.area} sq ft</span>
                      )}
                    </div>

                    {property.reviews.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">
                          {property.averageRating?.toFixed(1) ||
                            (
                              property.reviews.reduce((sum, review) => sum + review.overallRating, 0) /
                              property.reviews.length
                            ).toFixed(1)}
                        </span>
                        <span className="ml-1 text-gray-500">({property.reviews.length})</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}