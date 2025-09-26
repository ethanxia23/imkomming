'use client';

import { useState } from 'react';

export default function HomePage() {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{data?: any; message?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!accessToken.trim()) {
      setError('Please enter an access token');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/wahoo/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          limit: 100
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape data');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Wahoo Data Scraper</h1>
          <p className="text-gray-600">Python-powered fitness data extraction</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your Wahoo access token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleScrape}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scraping...' : 'Run Scraper'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && result.data && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Activities</h3>
                <p className="text-3xl font-bold text-blue-600">{result.data.summary.total_activities}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Distance</h3>
                <p className="text-3xl font-bold text-green-600">{result.data.summary.total_distance_km} km</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Calories</h3>
                <p className="text-3xl font-bold text-orange-600">{result.data.summary.total_calories.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Heart Rate</h3>
                <p className="text-3xl font-bold text-red-600">{result.data.summary.avg_heart_rate} bpm</p>
              </div>
            </div>

            {/* User Info */}
            {result.data.user && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">User Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{result.data.user.first_name} {result.data.user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{result.data.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="font-semibold">{result.data.user.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-semibold">{result.data.user.weight} kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* Devices */}
            {result.data.devices && result.data.devices.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Connected Devices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.data.devices.map((device: {name: string; type: string; model: string; battery_level: number; last_sync: string}, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{device.name}</h3>
                      <p className="text-gray-600">{device.type} - {device.model}</p>
                      <p className="text-sm text-gray-500">Battery: {device.battery_level}%</p>
                      <p className="text-sm text-gray-500">Last sync: {new Date(device.last_sync).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities by Sport */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Activities by Sport</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.data.summary.activities_by_sport).map(([sport, count]) => (
                  <div key={sport} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{count as number}</p>
                    <p className="text-gray-600 capitalize">{sport}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {result.data.summary.recent_activities.slice(0, 5).map((activity: {name: string; sport: string; start_time: string; distance: number; duration: number; calories: number}, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{activity.name}</h3>
                        <p className="text-gray-600 capitalize">{activity.sport}</p>
                        <p className="text-sm text-gray-500">{new Date(activity.start_time).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatDistance(activity.distance)}</p>
                        <p className="text-sm text-gray-600">{formatDuration(activity.duration)}</p>
                        <p className="text-sm text-gray-600">{activity.calories} cal</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Scraped at: {new Date(result.data.scraped_at).toLocaleString()}
            </div>
          </div>
        )}

        {result && !result.data && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}