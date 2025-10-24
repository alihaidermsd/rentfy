// /app/search/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  description: string
  type: string
  pricePerNight: number
  city: string
  country: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBedrooms: searchParams.get('minBedrooms') || '',
    minBathrooms: searchParams.get('minBathrooms') || '',
    maxGuests: searchParams.get('maxGuests') || ''
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    searchProperties()
  }, [searchParams])

  const searchProperties = async () => {
    try {
      setLoading(true)
      
      // Build query string from current URL search params
      const queryString = searchParams.toString()
      const url = queryString ? `/api/properties?${queryString}` : '/api/properties'
      
      console.log('🔍 Searching with URL:', url)
      
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
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
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
    setFilters({
      city: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      minBathrooms: '',
      maxGuests: ''
    })
    router.push('/search')
  }

  const getPropertyTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      APARTMENT: 'Apartment',
      VILLA: 'Villa',
      ROOM: 'Room',
      HOUSE: 'House',
      HOTEL: 'Hotel'
    }
    return typeLabels[type] || type
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Stay</h1>
        <p className="text-gray-600 mt-2">
          Discover amazing properties for your next trip
        </p>
      </div>

      {/* Search Bar & Filters Toggle */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Quick Search */}
          <div className="flex-1">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={filters.city}
                  onChange={(e) => updateFilters({ city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  placeholder="Guests"
                  min="1"
                  value={filters.maxGuests}
                  onChange={(e) => updateFilters({ maxGuests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
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
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
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
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="Max price"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Bedrooms
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Bathrooms
                </label>
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

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold">{properties.length}</span> properties
              {searchParams.toString() && ' matching your criteria'}
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.media.length > 0 ? (
                    <img
                      src={property.media[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                  </div>
                </div>
                
                {/* Property Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1">
                      {property.title}
                    </h3>
                    <span className="text-lg font-bold text-gray-900 ml-2">
                      ${property.pricePerNight}
                      <span className="text-sm font-normal text-gray-600">/night</span>
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
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.maxGuests} guests</span>
                    </div>
                    
                    {property.reviews.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">
                          {property.averageRating?.toFixed(1) || 
                            (property.reviews.reduce((sum, review) => sum + review.overallRating, 0) / 
                            property.reviews.length).toFixed(1)}
                        </span>
                        <span className="ml-1 text-gray-500">
                          ({property.reviews.length})
                        </span>
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