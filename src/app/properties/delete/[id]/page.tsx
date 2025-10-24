// /app/properties/delete/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function DeletePropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(false)
  const [property, setProperty] = useState<any>(null)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      // Since you have single API file, get all properties and find the specific one
      const response = await fetch('/api/properties')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties')
      }

      // Find the specific property from the list
      const foundProperty = data.data.find((p: any) => p.id === propertyId)
      
      if (!foundProperty) {
        throw new Error('Property not found')
      }

      setProperty(foundProperty)
    } catch (err: any) {
      console.error('Error fetching property:', err)
      alert('Property not found')
      router.push('/properties')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // Use your single API endpoint with query parameter
      const response = await fetch(`/api/properties?id=${propertyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete property')
      }

      console.log('✅ Property deleted:', data)
      alert('Property deleted successfully!')
      router.push('/properties')
      router.refresh()

    } catch (err: any) {
      console.error('❌ Delete property error:', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading property...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Delete Property</h1>
        
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 font-semibold">Warning: This action cannot be undone!</p>
          <p className="text-red-600 text-sm mt-2">
            You are about to delete: <strong>{property.title}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <strong>Title:</strong> {property.title}
          </div>
          <div>
            <strong>Location:</strong> {property.city}, {property.country}
          </div>
          <div>
            <strong>Price:</strong> ${property.pricePerNight}/night
          </div>
          <div>
            <strong>Status:</strong> {property.status}
          </div>
          <div>
            <strong>Bedrooms:</strong> {property.bedrooms}
          </div>
          <div>
            <strong>Bathrooms:</strong> {property.bathrooms}
          </div>
          <div>
            <strong>Max Guests:</strong> {property.maxGuests}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
          
          <button
            onClick={() => router.push('/properties')}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}