
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            🏠 Rentfy
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            
            <Link
              href="/search"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/search' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              Browse
            </Link>
            
            <Link
              href="/properties"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/properties' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              Properties
            </Link>
            
            <Link
              href="/bookings"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/bookings' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              My Bookings
            </Link>
          </nav>

          {/* Search Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Search Properties</span>
            </Link>

            {/* Mobile menu button (simplified) */}
            <div className="md:hidden">
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <span>☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            
            <Link
              href="/search"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/search' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              Browse Properties
            </Link>
            
            <Link
              href="/properties"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/properties' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              All Properties
            </Link>
            
            <Link
              href="/bookings"
              className={`hover:text-blue-600 transition-colors ${
                pathname === '/bookings' ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              My Bookings
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}