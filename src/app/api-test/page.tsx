'use client';

import { useState } from 'react';

interface TestResult {
  endpoint: string;
  method: string;
  data: any;
  error?: string;
}

export default function ApiTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  const addResult = (endpoint: string, method: string, data: any, error?: string) => {
    setResults(prev => [...prev, { endpoint, method, data, error }]);
  };

  const clearResults = () => setResults([]);

  // Helper function to make authenticated requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  // Test Authentication
  const testRegister = async (role: 'GUEST' | 'HOST' = 'GUEST') => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          name: `Test ${role}`,
          phone: `0300${Math.floor(Math.random() * 10000000)}`,
          role: role
        })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
      }
      addResult('/api/auth/register', 'POST', data);
    } catch (error) {
      addResult('/api/auth/register', 'POST', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com' // Use any existing user email
        })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setSelectedUser(data.user);
        setToken(data.token);
      }
      addResult('/api/auth/login', 'POST', data);
    } catch (error) {
      addResult('/api/auth/login', 'POST', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test GET endpoints
  const testEndpoint = async (endpoint: string, method: string = 'GET') => {
    setLoading(true);
    try {
      const response = await authFetch(`/api${endpoint}`);
      const data = await response.json();
      
      // Store first item for UPDATE/DELETE testing
      if (endpoint === '/properties' && data.data && data.data.length > 0) {
        setSelectedProperty(data.data[0]);
      }
      if (endpoint === '/bookings' && data.data && data.data.length > 0) {
        setSelectedBooking(data.data[0]);
      }
      if (endpoint === '/users' && data.length > 0 && !selectedUser) {
        setSelectedUser(data[0]);
      }
      
      addResult(endpoint, method, data);
    } catch (error) {
      addResult(endpoint, method, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // CREATE Operations
  const testCreateProperty = async () => {
    if (!user) {
      addResult('/api/properties', 'POST', null, 'No user logged in');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Beautiful Test Property ' + Date.now(),
          description: 'This is a beautiful test property with amazing views and modern amenities.',
          type: 'APARTMENT',
          pricePerNight: 120,
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          address: '123 Test Street',
          city: 'Test City',
          country: 'Test Country',
          hostId: user.id,
          latitude: 40.7128,
          longitude: -74.0060
        })
      });
      const data = await response.json();
      setSelectedProperty(data);
      addResult('/api/properties', 'POST', data);
    } catch (error) {
      addResult('/api/properties', 'POST', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCreateBooking = async () => {
    if (!user || !selectedProperty) {
      addResult('/api/bookings', 'POST', null, 'Need user and property to create booking');
      return;
    }

    setLoading(true);
    try {
      const checkIn = new Date();
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 3);

      const response = await authFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          guestId: user.id,
          hostId: selectedProperty.hostId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          totalPrice: selectedProperty.pricePerNight * 3
        })
      });
      const data = await response.json();
      setSelectedBooking(data);
      addResult('/api/bookings', 'POST', data);
    } catch (error) {
      addResult('/api/bookings', 'POST', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // UPDATE Operations
  const testUpdateProperty = async () => {
    if (!selectedProperty) {
      addResult('/api/properties', 'PUT', null, 'No property selected');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch('/api/properties', {
        method: 'PUT',
        body: JSON.stringify({
          id: selectedProperty.id,
          title: `Updated ${selectedProperty.title}`,
          description: `This property was updated at ${new Date().toLocaleTimeString()}. Features amazing new amenities!`,
          pricePerNight: selectedProperty.pricePerNight + 20
        })
      });
      const data = await response.json();
      setSelectedProperty(data);
      addResult('/api/properties', 'PUT', data);
    } catch (error) {
      addResult('/api/properties', 'PUT', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testUpdateBooking = async () => {
    if (!selectedBooking) {
      addResult('/api/bookings', 'PUT', null, 'No booking selected');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch('/api/bookings', {
        method: 'PUT',
        body: JSON.stringify({
          id: selectedBooking.id,
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        })
      });
      const data = await response.json();
      setSelectedBooking(data);
      addResult('/api/bookings', 'PUT', data);
    } catch (error) {
      addResult('/api/bookings', 'PUT', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // DELETE Operations
  const testDeleteProperty = async () => {
    if (!selectedProperty) {
      addResult('/api/properties', 'DELETE', null, 'No property selected');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`/api/properties?id=${selectedProperty.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      addResult('/api/properties', 'DELETE', data);
      setSelectedProperty(null);
    } catch (error) {
      addResult('/api/properties', 'DELETE', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDeleteBooking = async () => {
    if (!selectedBooking) {
      addResult('/api/bookings', 'DELETE', null, 'No booking selected');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`/api/bookings?id=${selectedBooking.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      addResult('/api/bookings', 'DELETE', data);
      setSelectedBooking(null);
    } catch (error) {
      addResult('/api/bookings', 'DELETE', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test Search with pagination
  const testSearch = async (query: string, page: number = 1) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/search?q=${query}&page=${page}&limit=5`);
      const data = await response.json();
      addResult(`/api/search?q=${query}&page=${page}`, 'GET', data);
    } catch (error) {
      addResult(`/api/search?q=${query}&page=${page}`, 'GET', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test pagination
  const testPagination = async (endpoint: string, page: number = 1) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api${endpoint}?page=${page}&limit=3`);
      const data = await response.json();
      addResult(`${endpoint}?page=${page}&limit=3`, 'GET', data);
    } catch (error) {
      addResult(`${endpoint}?page=${page}`, 'GET', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">API Testing Dashboard - Rentfy</h1>
        
        {/* User Info */}
        {user && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800">🔐 Logged in as:</h3>
            <p className="text-green-600">{user.name} ({user.email})</p>
            <p className="text-green-600">Role: {user.role} | ID: {user.id}</p>
            <p className="text-green-600 text-sm">Token: {token ? '✓ Present' : '✗ Missing'}</p>
          </div>
        )}

        {/* Selected Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {selectedProperty && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800">🏠 Selected Property</h4>
              <p className="text-blue-600 text-sm">{selectedProperty.title}</p>
              <p className="text-blue-600 text-sm">
                ${selectedProperty.pricePerNight}/night • {selectedProperty.bedrooms} beds
              </p>
              <p className="text-blue-600 text-sm">{selectedProperty.city}, {selectedProperty.country}</p>
            </div>
          )}
          {selectedBooking && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-semibold text-purple-800">📅 Selected Booking</h4>
              <p className="text-purple-600 text-sm">Status: {selectedBooking.status}</p>
              <p className="text-purple-600 text-sm">Payment: {selectedBooking.paymentStatus}</p>
              <p className="text-purple-600 text-sm">Total: ${selectedBooking.totalPrice}</p>
            </div>
          )}
          {selectedUser && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-semibold text-orange-800">👤 Selected User</h4>
              <p className="text-orange-600 text-sm">{selectedUser.name}</p>
              <p className="text-orange-600 text-sm">{selectedUser.email}</p>
              <p className="text-orange-600 text-sm">Role: {selectedUser.role}</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          {/* Authentication */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🔐 Authentication</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => testRegister('GUEST')}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Register Guest
              </button>
              <button
                onClick={() => testRegister('HOST')}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Register Host
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Test Login
              </button>
            </div>
          </div>

          {/* READ Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">📊 READ Operations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => testEndpoint('/properties')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Properties
              </button>
              <button
                onClick={() => testEndpoint('/bookings')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Bookings
              </button>
              <button
                onClick={() => testEndpoint('/users')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Users
              </button>
            </div>
          </div>

          {/* CREATE Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">➕ CREATE Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={testCreateProperty}
                disabled={loading || !user}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                Create Property
              </button>
              <button
                onClick={testCreateBooking}
                disabled={loading || !user || !selectedProperty}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                Create Booking
              </button>
            </div>
          </div>

          {/* UPDATE Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">✏️ UPDATE Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={testUpdateProperty}
                disabled={loading || !selectedProperty}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                Update Property
              </button>
              <button
                onClick={testUpdateBooking}
                disabled={loading || !selectedBooking}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                Update Booking
              </button>
            </div>
          </div>

          {/* DELETE Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🗑️ DELETE Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={testDeleteProperty}
                disabled={loading || !selectedProperty}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Delete Property
              </button>
              <button
                onClick={testDeleteBooking}
                disabled={loading || !selectedBooking}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Delete Booking
              </button>
            </div>
          </div>

          {/* Search & Pagination */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🔍 Search & Pagination</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <button
                onClick={() => testSearch('apartment')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "apartment"
              </button>
              <button
                onClick={() => testSearch('villa')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "villa"
              </button>
              <button
                onClick={() => testPagination('/properties', 1)}
                disabled={loading}
                className="bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600 disabled:opacity-50 text-sm"
              >
                Properties Page 1
              </button>
              <button
                onClick={() => testPagination('/bookings', 1)}
                disabled={loading}
                className="bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600 disabled:opacity-50 text-sm"
              >
                Bookings Page 1
              </button>
            </div>
          </div>

          {/* Utility */}
          <div className="flex justify-end">
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Testing API endpoints...</p>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results ({results.length})</h2>
          
          {results.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click the buttons above to test your APIs.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-mono text-sm px-2 py-1 rounded ${
                      result.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      result.method === 'POST' ? 'bg-green-100 text-green-800' :
                      result.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      result.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.method} {result.endpoint}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {result.error ? 'ERROR' : 'SUCCESS'}
                    </span>
                  </div>
                  
                  {result.error ? (
                    <pre className="text-red-600 text-sm bg-red-50 p-2 rounded overflow-x-auto">
                      Error: {result.error}
                    </pre>
                  ) : (
                    <pre className="text-gray-700 text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}