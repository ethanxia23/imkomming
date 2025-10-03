'use client';

import { useState, useEffect } from 'react';

export default function ChartsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage if available
  useEffect(() => {
    const savedData = localStorage.getItem('wahooData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error parsing saved data:', e);
      }
    }
  }, []);

  const loadSampleData = () => {
    setData({
      summary: {
        total_activities: 25,
        total_distance_km: 150.5,
        total_calories: 8500,
        avg_heart_rate: 145,
        activities_by_sport: {
          'Running': 15,
          'Cycling': 8,
          'Walking': 2
        },
        recent_activities: [
          { name: 'Morning Run', sport: 'Running', start_time: '2024-01-15T06:00:00Z', distance: 5000, duration: 1800, calories: 400 },
          { name: 'Evening Bike Ride', sport: 'Cycling', start_time: '2024-01-14T18:00:00Z', distance: 15000, duration: 3600, calories: 600 },
          { name: 'Lunch Walk', sport: 'Walking', start_time: '2024-01-14T12:00:00Z', distance: 2000, duration: 1200, calories: 150 }
        ]
      }
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📊 Wahoo Data Charts</h1>
          <p className="text-gray-600 mb-8">Visualize your fitness data with interactive charts</p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Load Your Data</h2>
            <p className="text-gray-600 mb-6">
              First, scrape your data from the main page, then come back here to view charts.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
              >
                ← Go to Main Page
              </button>
              <button
                onClick={loadSampleData}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                📊 Load Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Wahoo Data Charts</h1>
          <p className="text-gray-600">Interactive visualizations of your fitness data</p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Activities</h3>
            <p className="text-3xl font-bold text-blue-600">{data.summary.total_activities}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Distance</h3>
            <p className="text-3xl font-bold text-green-600">{data.summary.total_distance_km} km</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Calories</h3>
            <p className="text-3xl font-bold text-orange-600">{data.summary.total_calories.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Heart Rate</h3>
            <p className="text-3xl font-bold text-red-600">{data.summary.avg_heart_rate} bpm</p>
          </div>
        </div>

        {/* Activities by Sport Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities by Sport</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.summary.activities_by_sport).map(([sport, count]) => (
              <div key={sport} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{count as number}</span>
                </div>
                <p className="text-gray-600 capitalize font-medium">{sport}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Distance Over Time Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {data.summary.recent_activities.map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{activity.name}</h3>
                  <p className="text-gray-600 capitalize">{activity.sport}</p>
                  <p className="text-sm text-gray-500">{new Date(activity.start_time).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(activity.distance / 1000).toFixed(2)} km</p>
                  <p className="text-sm text-gray-600">{Math.round(activity.duration / 60)} min</p>
                  <p className="text-sm text-gray-600">{activity.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Bar Chart for Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Activities Distribution</h2>
          <div className="space-y-4">
            {Object.entries(data.summary.activities_by_sport).map(([sport, count]) => {
              const maxCount = Math.max(...Object.values(data.summary.activities_by_sport) as number[]);
              const percentage = ((count as number) / maxCount) * 100;
              
              return (
                <div key={sport} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">{sport}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-white text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Main Page
          </button>
        </div>
      </div>
    </div>
  );
}
