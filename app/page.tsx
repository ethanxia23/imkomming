'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{data?: any; message?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  // Check for token or error in URL parameters (from OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    const details = urlParams.get('details');
    
    if (token) {
      setAccessToken(token);
      setError(null);
      setSuccess('✅ Successfully authorized with Wahoo! You can now run the scraper.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'oauth_failed') {
      const errorMessage = details ? 
        `OAuth authorization failed: ${decodeURIComponent(details)}` : 
        'OAuth authorization failed. Please try again or enter your token manually.';
      setError(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuth = () => {
    setAuthLoading(true);
    setError(null);
    setSuccess(null);
    
    // Generate OAuth URL
    const clientId = process.env.NEXT_PUBLIC_WAHOO_CLIENT_ID || '70P1LbnCWZ30qUdUR4C0ZX8cuQBlepNZk9F7lyWbmr4';
    // Always use production redirect URI since Wahoo app is configured for it
    const redirectUri = 'https://imkomming.com/api/wahoo_callback';
    
    if (!clientId) {
      setError('OAuth not configured. Please set NEXT_PUBLIC_WAHOO_CLIENT_ID in your environment variables or enter your access token manually.');
      setAuthLoading(false);
      return;
    }
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user_read'
    });
    
    const authUrl = `https://api.wahooligan.com/oauth/authorize?${params.toString()}`;
    window.location.href = authUrl;
  };

  const handleScrape = async () => {
    if (!accessToken.trim()) {
      setError('Please enter an access token or click "Authorize with Wahoo" to get one automatically');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    setScrapingStatus('Initializing scraper...');
    setProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            setScrapingStatus(`Scraping data... ${prev}%`);
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 500);

      setScrapingStatus('Connecting to Wahoo API...');
      setProgress(20);

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

      clearInterval(progressInterval);
      setProgress(95);
      setScrapingStatus('Processing data...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape data');
      }

      setProgress(100);
      setScrapingStatus('Complete!');
      setResult(data);
      
      // Save data to localStorage for charts
      localStorage.setItem('wahooData', JSON.stringify(data));
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setScrapingStatus('');
        setProgress(0);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setScrapingStatus('');
      setProgress(0);
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

  const exportToJSON = (data: any) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wahoo_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any) => {
    if (!data.activities || data.activities.length === 0) {
      alert('No activities data to export');
      return;
    }

    const headers = ['Name', 'Sport', 'Date', 'Distance (km)', 'Duration (min)', 'Calories', 'Avg Heart Rate'];
    const csvContent = [
      headers.join(','),
      ...data.activities.map((activity: any) => [
        `"${activity.name || ''}"`,
        `"${activity.sport || ''}"`,
        `"${new Date(activity.start_time).toLocaleDateString()}"`,
        (activity.distance / 1000).toFixed(2),
        Math.round(activity.duration / 60),
        activity.calories || 0,
        activity.avg_heart_rate || 0
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wahoo_activities_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const viewRawData = (data: any) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Raw Wahoo Data</title></head>
          <body>
            <pre style="white-space: pre-wrap; font-family: monospace; padding: 20px;">
${JSON.stringify(data, null, 2)}
            </pre>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Wahoo Data Scraper</h1>
          <p className="text-gray-600">Python-powered fitness data extraction</p>
          <div className="mt-4">
            <a 
              href="/charts" 
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              📊 View Charts
            </a>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Get Started</h2>
          
          {/* OAuth Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Option 1: Authorize with Wahoo</h3>
            <p className="text-gray-600 mb-4">Click the button below to authorize and get your access token automatically.</p>
            <button
              onClick={handleOAuth}
              disabled={authLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Redirecting...' : '🔐 Authorize with Wahoo'}
            </button>
          </div>

          {/* Manual Token Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Option 2: Enter Token Manually</h3>
            <p className="text-gray-600 mb-4">If you already have an access token, enter it below.</p>
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
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scraping...' : 'Run Scraper'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Progress Indicator */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-800">Scraping Progress</h3>
              <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-blue-700 text-sm">{scrapingStatus}</p>
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

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Export Data</h2>
                <div className="text-sm text-gray-500">
                  Scraped at: {new Date(result.data.scraped_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => exportToJSON(result.data)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  📄 Export JSON
                </button>
                <button
                  onClick={() => exportToCSV(result.data)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={() => viewRawData(result.data)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  🔍 View Raw Data
                </button>
              </div>
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