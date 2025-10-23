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
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const addResult = (endpoint: string, method: string, data: any, error?: string) => {
    setResults(prev => [...prev, { endpoint, method, data, error }]);
  };

  const clearResults = () => setResults([]);

  // Test Authentication
  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User',
          phone: '03001234567'
        })
      });
      const data = await response.json();
      if (data.user) setUser(data.user);
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
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setSelectedUser(data.user);
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
      const response = await fetch(`/api${endpoint}`);
      const data = await response.json();
      
      // Store first item for UPDATE/DELETE testing
      if (endpoint === '/properties' && data.length > 0) {
        setSelectedProperty(data[0]);
      }
      if (endpoint === '/services' && data.length > 0) {
        setSelectedService(data[0]);
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
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Property ' + Date.now(),
          description: 'This is a test property',
          type: 'APARTMENT',
          price: 1000000,
          location: 'Test Location',
          city: 'Karachi',
          bedrooms: 2,
          bathrooms: 1,
          areaSqft: 1000,
          ownerId: user.id
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

  const testCreateService = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Service ' + Date.now(),
          description: 'This is a test service',
          category: 'CLEANING',
          providerName: 'Test Provider',
          locations: 'Karachi, Lahore',
          basePrice: 5000
        })
      });
      const data = await response.json();
      setSelectedService(data);
      addResult('/api/services', 'POST', data);
    } catch (error) {
      addResult('/api/services', 'POST', null, error instanceof Error ? error.message : 'Unknown error');
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
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROPERTY',
          propertyId: selectedProperty.id,
          userId: user.id,
          startDate: new Date().toISOString(),
          totalPrice: selectedProperty.price ? selectedProperty.price * 0.1 : 10000
        })
      });
      const data = await response.json();
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
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProperty.id,
          title: `Updated ${selectedProperty.title}`,
          description: `This property was updated at ${new Date().toLocaleTimeString()}`,
          price: selectedProperty.price ? selectedProperty.price + 100000 : 100000
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

  const testUpdateService = async () => {
    if (!selectedService) {
      addResult('/api/services', 'PUT', null, 'No service selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedService.id,
          name: `Updated ${selectedService.name}`,
          description: `This service was updated at ${new Date().toLocaleTimeString()}`,
          basePrice: selectedService.basePrice ? selectedService.basePrice + 1000 : 5000
        })
      });
      const data = await response.json();
      setSelectedService(data);
      addResult('/api/services', 'PUT', data);
    } catch (error) {
      addResult('/api/services', 'PUT', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testUpdateUser = async () => {
    if (!selectedUser) {
      addResult('/api/users', 'PUT', null, 'No user selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          name: `Updated ${selectedUser.name}`,
          phone: `0300${Math.floor(Math.random() * 10000000)}`
        })
      });
      const data = await response.json();
      setSelectedUser(data);
      if (user?.id === selectedUser.id) setUser(data);
      addResult('/api/users', 'PUT', data);
    } catch (error) {
      addResult('/api/users', 'PUT', null, error instanceof Error ? error.message : 'Unknown error');
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
      const response = await fetch(`/api/properties?id=${selectedProperty.id}`, {
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

  const testDeleteService = async () => {
    if (!selectedService) {
      addResult('/api/services', 'DELETE', null, 'No service selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/services?id=${selectedService.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      addResult('/api/services', 'DELETE', data);
      setSelectedService(null);
    } catch (error) {
      addResult('/api/services', 'DELETE', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDeleteUser = async () => {
    if (!selectedUser) {
      addResult('/api/users', 'DELETE', null, 'No user selected');
      return;
    }

    // Don't delete the currently logged in user
    if (user?.id === selectedUser.id) {
      addResult('/api/users', 'DELETE', null, 'Cannot delete currently logged in user');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      addResult('/api/users', 'DELETE', data);
      setSelectedUser(null);
    } catch (error) {
      addResult('/api/users', 'DELETE', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test Search
  const testSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      addResult(`/api/search?q=${query}`, 'GET', data);
    } catch (error) {
      addResult(`/api/search?q=${query}`, 'GET', null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">API Testing Dashboard - Full CRUD</h1>
        
        {/* User Info */}
        {user && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800">Logged in as:</h3>
            <p className="text-green-600">{user.name} ({user.email})</p>
            <p className="text-green-600">ID: {user.id}</p>
          </div>
        )}

        {/* Selected Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {selectedProperty && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800">Selected Property</h4>
              <p className="text-blue-600 text-sm">{selectedProperty.title || 'No title'}</p>
              <p className="text-blue-600 text-sm">
                PKR {selectedProperty.price ? selectedProperty.price.toLocaleString() : 'N/A'}
              </p>
              {selectedProperty.location && (
                <p className="text-blue-600 text-sm">{selectedProperty.location}</p>
              )}
            </div>
          )}
          {selectedService && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-semibold text-purple-800">Selected Service</h4>
              <p className="text-purple-600 text-sm">{selectedService.name || 'No name'}</p>
              <p className="text-purple-600 text-sm">
                PKR {selectedService.basePrice ? selectedService.basePrice.toLocaleString() : 'N/A'}
              </p>
            </div>
          )}
          {selectedUser && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-semibold text-orange-800">Selected User</h4>
              <p className="text-orange-600 text-sm">{selectedUser.name || 'No name'}</p>
              <p className="text-orange-600 text-sm">{selectedUser.email || 'No email'}</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          {/* Authentication */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🔐 Authentication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <button
                onClick={testRegister}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Test Register
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
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
                onClick={() => testEndpoint('/health')}
                disabled={loading}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
              >
                Health
              </button>
              <button
                onClick={() => testEndpoint('/test')}
                disabled={loading}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
              >
                Test
              </button>
              <button
                onClick={() => testEndpoint('/users')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                All Users
              </button>
              <button
                onClick={() => testEndpoint('/properties')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Properties
              </button>
              <button
                onClick={() => testEndpoint('/services')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Services
              </button>
              <button
                onClick={() => testEndpoint('/bookings')}
                disabled={loading}
                className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                Bookings
              </button>
            </div>
          </div>

          {/* CREATE Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">➕ CREATE Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={testCreateProperty}
                disabled={loading || !user}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                Create Property
              </button>
              <button
                onClick={testCreateService}
                disabled={loading}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                Create Service
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={testUpdateProperty}
                disabled={loading || !selectedProperty}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                Update Property
              </button>
              <button
                onClick={testUpdateService}
                disabled={loading || !selectedService}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                Update Service
              </button>
              <button
                onClick={testUpdateUser}
                disabled={loading || !selectedUser}
                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                Update User
              </button>
            </div>
          </div>

          {/* DELETE Operations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🗑️ DELETE Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={testDeleteProperty}
                disabled={loading || !selectedProperty}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Delete Property
              </button>
              <button
                onClick={testDeleteService}
                disabled={loading || !selectedService}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Delete Service
              </button>
              <button
                onClick={testDeleteUser}
                disabled={loading || !selectedUser || (user?.id === selectedUser?.id)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Delete User
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-gray-700">🔍 Search</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => testSearch('apartment')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "apartment"
              </button>
              <button
                onClick={() => testSearch('cleaning')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "cleaning"
              </button>
              <button
                onClick={() => testSearch('karachi')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "karachi"
              </button>
              <button
                onClick={() => testSearch('test')}
                disabled={loading}
                className="bg-teal-500 text-white px-3 py-2 rounded hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                Search "test"
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