
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: string
  paymentStatus: string
  guest: {
    id: string
    name: string
    email: string
  }
  host: {
    id: string
    name: string
    email: string
  }
  property: {
    id: string
    title: string
    media: Array<{ url: string }>
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? '/api/bookings' 
        : `/api/bookings?status=${filter.toUpperCase()}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }

      setBookings(data.data.bookings || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'UNPAID': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your property bookings</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md capitalize ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">No bookings found</h2>
          <p className="text-gray-500 mt-2">
            {filter === 'all' 
              ? "You don't have any bookings yet." 
              : `No ${filter} bookings found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0">
                      {booking.property.media.length > 0 ? (
                        <img
                          src={booking.property.media[0].url}
                          alt={booking.property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.property.title}
                      </h3>
                      
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>
                            <strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}
                          </span>
                          <span>
                            <strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div>
                          <strong>Total:</strong> ${booking.totalPrice}
                        </div>

                        <div className="flex items-center space-x-4">
                          <span>
                            <strong>Guest:</strong> {booking.guest.name}
                          </span>
                          <span>
                            <strong>Host:</strong> {booking.host.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-3">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking')
      }

      // Refresh the list
      fetchBookings()
    } catch (err: any) {
      alert(err.message)
      console.error('Error updating booking:', err)
    }
  }
}