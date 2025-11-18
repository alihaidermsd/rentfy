// src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect 
              <span className="block text-yellow-300">Property</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing properties for rent or sale. From cozy apartments to luxury villas and commercial spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search?propertyType=RENTAL"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
              >
                🏠 Find Rentals
              </Link>
              <Link
                href="/search?propertyType=SALE"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition-colors shadow-lg"
              >
                💰 Buy Properties
              </Link>
              <Link
                href="/properties/create"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-colors"
              >
                📈 List Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by Property Type
            </h2>
            <p className="text-xl text-gray-600">
              Explore our diverse collection of residential and commercial properties
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { type: 'APARTMENT', icon: '🏢', name: 'Apartments' },
              { type: 'VILLA', icon: '🏡', name: 'Villas' },
              { type: 'HOUSE', icon: '🏠', name: 'Houses' },
              { type: 'ROOM', icon: '🛏️', name: 'Private Rooms' },
              { type: 'HOTEL', icon: '🏨', name: 'Hotels' },
              { type: 'LAND', icon: '🌳', name: 'Land' },
              { type: 'COMMERCIAL', icon: '🏢', name: 'Commercial' },
              { type: 'ALL', icon: '🔍', name: 'View All' },
            ].map((property) => (
              <Link
                key={property.type}
                href={`/search?type=${property.type}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group border-2 border-gray-100"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {property.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{property.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Rental vs Sale */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're looking to rent or buy, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Rental Service */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
              <div className="bg-blue-600 text-white p-6">
                <h3 className="text-2xl font-bold mb-2">🏠 Property Rentals</h3>
                <p className="text-blue-100">Find your perfect temporary home</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Short-term and long-term rentals
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Fully furnished options
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Utilities included
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Flexible lease terms
                  </li>
                </ul>
                <Link
                  href="/search?propertyType=RENTAL"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                >
                  Browse Rentals
                </Link>
              </div>
            </div>

            {/* Sale Service */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-200">
              <div className="bg-green-600 text-white p-6">
                <h3 className="text-2xl font-bold mb-2">💰 Property Sales</h3>
                <p className="text-green-100">Invest in your forever home</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Residential & commercial properties
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Land and development plots
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Mortgage assistance
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Legal documentation support
                  </li>
                </ul>
                <Link
                  href="/search?propertyType=SALE"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block"
                >
                  Browse Properties for Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and managing properties simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
              <p className="text-gray-600">
                Your payments and personal information are protected with bank-level security for both rentals and purchases.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
              <p className="text-gray-600">
                Every property is thoroughly verified with proper documentation and legal checks.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
              <p className="text-gray-600">
                Our real estate experts are available to help with both rental agreements and purchase processes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1K+</div>
              <div className="text-blue-100">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5K+</div>
              <div className="text-blue-100">Rental Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Properties Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.8</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream property through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search?propertyType=RENTAL"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Find Rental Properties
            </Link>
            <Link
              href="/search?propertyType=SALE"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition-colors"
            >
              Browse Properties for Sale
            </Link>
          </div>
          <div className="mt-6">
            <Link
              href="/properties/create"
              className="text-yellow-400 hover:text-yellow-300 font-semibold text-lg"
            >
              🏠 List Your Property for Rent or Sale
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}