
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Booking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
  guest: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
  }
  host: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
  }
  property: {
    id: string
    title: string
    description: string
    address: string
    city: string
    country: string
    media: Array<{ url: string; type: string }>
    amenities: Array<{ amenity: { name: string; icon: string } }>
    facilities: Array<{ facility: { name: string; icon: string } }>
  }
  review: any
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking')
      }

      setBooking(data.data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching booking:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this booking?`)) {
      return
    }

    setUpdating(true)
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

      setBooking(data.data)
      alert(`Booking ${newStatus.toLowerCase()} successfully!`)
    } catch (err: any) {
      alert(err.message)
      console.error('Error updating booking:', err)
    } finally {
      setUpdating(false)
    }
  }

  const deleteBooking = async () => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking')
      }

      alert('Booking deleted successfully!')
      router.push('/bookings')
    } catch (err: any) {
      alert(err.message)
      console.error('Error deleting booking:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading booking details...</div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-2">Booking ID: {booking.id}</p>
          </div>
          
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.paymentStatus === 'PAID' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Property Information</h2>
            
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0">
                {booking.property.media.length > 0 ? (
                  <img
                    src={booking.property.media[0].url}
                    alt={booking.property.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{booking.property.title}</h3>
                <p className="text-gray-600 mt-1">{booking.property.description}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {booking.property.address}, {booking.property.city}, {booking.property.country}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Dates</h3>
                <p className="text-gray-600">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Total Price</h3>
                <p className="text-2xl font-bold text-gray-900">${booking.totalPrice}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Booking Created</h3>
                <p className="text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Nights</h3>
                <p className="text-gray-600">
                  {Math.ceil(
                    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )} nights
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {booking.guest.avatar ? (
                  <img
                    src={booking.guest.avatar}
                    alt={booking.guest.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-400 text-lg">
                    {booking.guest.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{booking.guest.name}</h3>
                <p className="text-gray-600">{booking.guest.email}</p>
                {booking.guest.phone && (
                  <p className="text-gray-600">{booking.guest.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => updateBookingStatus('CONFIRMED')}
                    disabled={updating}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                  
                  <button
                    onClick={() => updateBookingStatus('CANCELLED')}
                    disabled={updating}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={() => updateBookingStatus('COMPLETED')}
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Completing...' : 'Mark as Completed'}
                </button>
              )}

              {!booking.review && booking.status !== 'CANCELLED' && (
                <button
                  onClick={deleteBooking}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Delete Booking
                </button>
              )}

              <button
                onClick={() => router.push('/bookings')}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Back to Bookings
              </button>
            </div>
          </div>

          {/* Host Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Host Information</h2>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {booking.host.avatar ? (
                  <img
                    src={booking.host.avatar}
                    alt={booking.host.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-400">
                    {booking.host.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold">{booking.host.name}</h3>
                <p className="text-gray-600 text-sm">{booking.host.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}