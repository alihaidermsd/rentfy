// /app/properties/page.tsx
interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string }>
}

async function getPropertiesFromAPI(searchParams: { [key: string]: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const params = new URLSearchParams()
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, value)
    }
  })

  const url = `${baseUrl}/api/properties?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('❌ Fetch error:', error)
    throw error
  }
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams
  let propertiesData = null
  
  try {
    propertiesData = await getPropertiesFromAPI(resolvedSearchParams)
    console.log('📦 API Response received:', propertiesData.pagination)
  } catch (error) {
    console.error('❌ Error fetching properties from API:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Failed to load properties</h1>
          <p className="text-gray-600 mt-2">
            Could not connect to the server. Please check if the API is running.
          </p>
        </div>
      </div>
    )
  }

  const { data: properties, pagination } = propertiesData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <p className="text-gray-600 mt-2">
            {pagination.totalCount} properties found
          </p>
        </div>
        <a
          href="/properties/create"
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          + Create Property
        </a>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600">No properties found</h2>
          <p className="text-gray-500 mt-2">Try creating your first property!</p>
          <div className="mt-4">
            <a
              href="/properties/create"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              + Create Property
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property: any) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.media && property.media.length > 0 ? (
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
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      property.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      property.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </div>
                
                {/* Property Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <span className="text-lg font-bold text-gray-900">
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
                    
                    {property.reviews && property.reviews.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">
                          {(
                            property.reviews.reduce((sum: number, review: any) => sum + review.overallRating, 0) / 
                            property.reviews.length
                          ).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={`/properties/update/${property.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors text-center"
                    >
                      Edit
                    </a>
                    <a
                      href={`/properties/delete/${property.id}`}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors text-center"
                    >
                      Delete
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {pagination.hasPrev && pagination.prevPage && (
                <a
                  href={`/properties?page=${pagination.prevPage}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 bg-gray-100 rounded">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.hasNext && pagination.nextPage && (
                <a
                  href={`/properties?page=${pagination.nextPage}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}